import { getPaystackSecretKey } from '@/lib/paystack';

export type TutorBankProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  bank_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  paystack_recipient_code: string | null;
};

type PaystackApiResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

function paystackHeaders(secret: string): HeadersInit {
  return {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };
}

export async function createTransferRecipient(profile: TutorBankProfile): Promise<{
  ok: true;
  recipientCode: string;
} | { ok: false; error: string }> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    return { ok: false, error: 'Paystack secret key is not configured on the server.' };
  }

  const bankCode = profile.bank_code?.trim();
  const accountNumber = profile.account_number?.replace(/\D/g, '');
  const accountName = profile.account_name?.trim();

  if (!bankCode || !accountNumber || accountNumber.length !== 10 || !accountName) {
    return { ok: false, error: 'Incomplete bank details on profile.' };
  }

  try {
    const res = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: paystackHeaders(secret),
      body: JSON.stringify({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
      cache: 'no-store',
    });

    const json = (await res.json()) as PaystackApiResponse<{
      recipient_code: string;
      details?: { account_number: string; bank_code: string };
    }>;

    if (!res.ok || !json.status || !json.data?.recipient_code) {
      console.error('[paystack] create recipient', res.status, json.message);
      return {
        ok: false,
        error: json.message || 'Paystack could not create a transfer recipient.',
      };
    }

    const recipientCode = String(json.data.recipient_code).trim();
    if (!isPaystackRecipientCode(recipientCode)) {
      console.error('[paystack] create recipient unexpected code shape:', recipientCode);
      return {
        ok: false,
        error: 'Paystack did not return a valid transfer recipient code.',
      };
    }

    return { ok: true, recipientCode };
  } catch (err) {
    console.error('[paystack] create recipient', err);
    return { ok: false, error: 'Network error while creating Paystack recipient.' };
  }
}

export type BulkTransferItem = {
  amountKobo: number;
  reference: string;
  recipientCode: string;
  reason: string;
};

export type BulkTransferResultItem = {
  reference: string;
  status: string;
};

export async function initiatePaystackBulkTransfer(
  transfers: BulkTransferItem[]
): Promise<
  | { ok: true; message: string; results: BulkTransferResultItem[] }
  | { ok: false; error: string }
> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    return { ok: false, error: 'Paystack secret key is not configured on the server.' };
  }

  if (transfers.length === 0) {
    return { ok: false, error: 'No transfers to process.' };
  }

  const normalizedTransfers: {
    amount: number;
    reference: string;
    recipient: string;
    reason: string;
  }[] = [];

  for (const t of transfers) {
    const recipient = t.recipientCode.trim();
    const amount = Math.trunc(t.amountKobo);

    if (!isPaystackRecipientCode(recipient)) {
      console.error('[paystack] bulk transfer skip invalid recipient:', recipient);
      return {
        ok: false,
        error: `Invalid transfer recipient "${recipient}". Expected a Paystack RCP_… code.`,
      };
    }

    if (!Number.isInteger(amount) || amount < 100) {
      console.error('[paystack] bulk transfer skip invalid amount (kobo):', amount);
      return {
        ok: false,
        error: `Invalid transfer amount (${amount} kobo). Amount must be a positive integer in kobo.`,
      };
    }

    if (!t.reference?.trim()) {
      return { ok: false, error: 'Each transfer requires a unique reference.' };
    }

    normalizedTransfers.push({
      amount,
      reference: t.reference.trim(),
      recipient,
      reason: (t.reason || 'Enabled tutor payout').slice(0, 100),
    });
  }

  const payload = {
    currency: 'NGN' as const,
    source: 'balance' as const,
    transfers: normalizedTransfers,
  };

  console.log('PAYSTACK PAYLOAD:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch('https://api.paystack.co/transfer/bulk', {
      method: 'POST',
      headers: paystackHeaders(secret),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const json = (await res.json()) as PaystackApiResponse<BulkTransferResultItem[]>;

    if (!res.ok || !json.status) {
      console.error('[paystack] bulk transfer', res.status, json.message, json);
      return {
        ok: false,
        error: json.message || 'Paystack bulk transfer failed.',
      };
    }

    return {
      ok: true,
      message: json.message || 'Transfers queued.',
      results: json.data ?? [],
    };
  } catch (err) {
    console.error('[paystack] bulk transfer', err);
    return { ok: false, error: 'Network error while calling Paystack bulk transfer.' };
  }
}

/** Paystack amounts must be integer kobo (NGN × 100). ₦3,500 → 350000. */
export function ngnToKobo(amountNgn: number): number {
  const naira = Number(amountNgn);
  if (!Number.isFinite(naira) || naira <= 0) {
    return 0;
  }
  return Math.round(naira * 100);
}

/** Paystack bulk transfers require a transfer recipient code, not a bank account number. */
export function isPaystackRecipientCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return /^RCP_[a-z0-9]+$/i.test(code.trim());
}

export function buildBulkTransferReference(tutorId: string): string {
  const slug = tutorId.replace(/-/g, '').slice(0, 12);
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `en_${slug}_${ts}_${rand}`.slice(0, 50);
}

/**
 * Returns a valid RCP_… code — creates a Paystack transfer recipient when missing or invalid.
 */
export async function resolveTransferRecipient(
  profile: TutorBankProfile
): Promise<{ ok: true; recipientCode: string; created: boolean } | { ok: false; error: string }> {
  const existing = profile.paystack_recipient_code?.trim() ?? '';
  if (isPaystackRecipientCode(existing)) {
    return { ok: true, recipientCode: existing, created: false };
  }

  if (existing && !isPaystackRecipientCode(existing)) {
    console.warn(
      '[paystack] invalid stored recipient (expected RCP_…), recreating:',
      existing.slice(0, 20)
    );
  }

  const created = await createTransferRecipient(profile);
  if (!created.ok) {
    return created;
  }

  if (!isPaystackRecipientCode(created.recipientCode)) {
    return {
      ok: false,
      error: 'Paystack returned an invalid recipient code.',
    };
  }

  return { ok: true, recipientCode: created.recipientCode, created: true };
}

export function tutorDisplayName(profile: TutorBankProfile): string {
  return profile.full_name || profile.email || profile.id.slice(0, 8);
}
