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

    return { ok: true, recipientCode: json.data.recipient_code };
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

  try {
    const res = await fetch('https://api.paystack.co/transfer/bulk', {
      method: 'POST',
      headers: paystackHeaders(secret),
      body: JSON.stringify({
        currency: 'NGN',
        source: 'balance',
        transfers: transfers.map((t) => ({
          amount: t.amountKobo,
          reference: t.reference,
          recipient: t.recipientCode,
          reason: t.reason,
        })),
      }),
      cache: 'no-store',
    });

    const json = (await res.json()) as PaystackApiResponse<BulkTransferResultItem[]>;

    if (!res.ok || !json.status) {
      console.error('[paystack] bulk transfer', res.status, json.message);
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

export function ngnToKobo(amountNgn: number): number {
  return Math.round(amountNgn * 100);
}

export function tutorDisplayName(profile: TutorBankProfile): string {
  return profile.full_name || profile.email || profile.id.slice(0, 8);
}
