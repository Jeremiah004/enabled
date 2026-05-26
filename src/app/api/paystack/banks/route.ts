import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PaystackBank = {
  name: string;
  code: string;
  slug?: string;
};

export async function GET() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: 'Paystack is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const res = await fetch('https://api.paystack.co/bank?currency=NGN&perPage=100', {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[paystack/banks]', res.status, body);
      return NextResponse.json({ error: 'Could not load banks from Paystack.' }, { status: 502 });
    }

    const json = (await res.json()) as {
      status?: boolean;
      data?: PaystackBank[];
    };

    const banks = (json.data ?? [])
      .filter((b) => b.name && b.code)
      .map((b) => ({ name: b.name, code: b.code }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ banks });
  } catch (err) {
    console.error('[paystack/banks]', err);
    return NextResponse.json({ error: 'Failed to fetch banks.' }, { status: 500 });
  }
}
