'use server';

import { fetchPaystackBanks } from '@/lib/paystack';

export async function getPaystackBanks() {
  return fetchPaystackBanks();
}
