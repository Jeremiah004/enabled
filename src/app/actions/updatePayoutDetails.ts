'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { PayoutDetailsState } from '@/app/actions/updatePayoutDetails.types';

export async function updatePayoutDetails(
  _prevState: PayoutDetailsState,
  formData: FormData
): Promise<PayoutDetailsState> {
  const { user } = await requireRole(['TUTOR']);
  const supabase = await createClient();

  const bankName = (formData.get('bank_name') as string | null)?.trim() ?? '';
  const accountNumber = (formData.get('account_number') as string | null)?.trim() ?? '';
  const accountName = (formData.get('account_name') as string | null)?.trim() ?? '';

  if (!bankName || !accountNumber || !accountName) {
    return { error: 'All banking fields are required.', success: false };
  }

  const digitsOnly = accountNumber.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    return {
      error: 'Account number must be 10 digits (Nigerian NUBAN).',
      success: false,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      bank_name: bankName,
      account_number: digitsOnly,
      account_name: accountName,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[updatePayoutDetails]', error.message);
    return {
      error: 'Could not save banking details. Run supabase/migrate-rbac-payout.sql if columns are missing.',
      success: false,
    };
  }

  revalidatePath('/tutor', 'page');
  revalidatePath('/tutor', 'layout');

  return { error: null, success: true };
}
