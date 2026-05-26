import { NIGERIAN_BANKS_FALLBACK } from '@/data/nigerian-banks-fallback';

export type PaystackBank = {
  name: string;
  code: string;
};

export function getPaystackSecretKey(): string | undefined {
  const key =
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    process.env.PAYSTACK_SECRET?.trim() ||
    '';
  return key || undefined;
}

export async function fetchPaystackBanks(): Promise<{
  banks: PaystackBank[];
  source: 'paystack' | 'fallback';
  error?: string;
}> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    return {
      banks: NIGERIAN_BANKS_FALLBACK,
      source: 'fallback',
      error: 'Paystack secret key not loaded. Restart the dev server after editing .env.local.',
    };
  }

  try {
    const res = await fetch('https://api.paystack.co/bank?currency=NGN&perPage=100', {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[paystack] bank list failed', res.status, body);
      return {
        banks: NIGERIAN_BANKS_FALLBACK,
        source: 'fallback',
        error: 'Could not reach Paystack — showing common banks.',
      };
    }

    const json = (await res.json()) as {
      data?: { name: string; code: string }[];
    };

    const banks = (json.data ?? [])
      .filter((b) => b.name && b.code)
      .map((b) => ({ name: b.name, code: b.code }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (banks.length === 0) {
      return { banks: NIGERIAN_BANKS_FALLBACK, source: 'fallback' };
    }

    return { banks, source: 'paystack' };
  } catch (err) {
    console.error('[paystack] fetch banks', err);
    return {
      banks: NIGERIAN_BANKS_FALLBACK,
      source: 'fallback',
      error: 'Network error loading banks.',
    };
  }
}
