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

  const bankCode = (formData.get('bank_code') as string | null)?.trim() ?? '';
  const bankName = (formData.get('bank_name') as string | null)?.trim() ?? '';
  const accountNumber = (formData.get('account_number') as string | null)?.trim() ?? '';
  const accountName = (formData.get('account_name') as string | null)?.trim() ?? '';

  if (!bankCode || !bankName || !accountNumber || !accountName) {
    return { error: 'Please select a bank and complete all fields.', success: false };
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
      bank_code: bankCode,
      account_number: digitsOnly,
      account_name: accountName,
      paystack_recipient_code: null,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[updatePayoutDetails]', error.message);
    return {
      error:
        'Could not save banking details. Ensure supabase/add-bank-code.sql has been applied.',
      success: false,
    };
  }

  revalidatePath('/tutor', 'page');
  revalidatePath('/tutor', 'layout');

  return { error: null, success: true };
}
