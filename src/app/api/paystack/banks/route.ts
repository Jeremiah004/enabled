import { NextResponse } from 'next/server';
import { fetchPaystackBanks } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await fetchPaystackBanks();
  return NextResponse.json(result);
}
