'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';
import {
  createTransferRecipient,
  initiatePaystackBulkTransfer,
  ngnToKobo,
  tutorDisplayName,
  type TutorBankProfile,
} from '@/lib/paystack-transfers';
import { revalidatePath } from 'next/cache';
import type { ProcessPayoutsResult } from '@/app/actions/processPayouts.types';

type UnpaidSession = { id: string; tutor_id: string };

export async function processBulkPayouts(): Promise<ProcessPayoutsResult> {
  await requireRole(['ADMIN']);

  const supabase = await createClient();

  const { data: unpaidSessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, tutor_id')
    .eq('status', 'UNPAID');

  if (sessionsError) {
    console.error('[processBulkPayouts] sessions', sessionsError.message);
    return { ok: false, message: 'Could not load unpaid sessions.' };
  }

  const sessions = (unpaidSessions ?? []) as UnpaidSession[];
  if (sessions.length === 0) {
    return { ok: false, message: 'There are no unpaid sessions to process.' };
  }

  const sessionsByTutor = new Map<string, string[]>();
  for (const s of sessions) {
    const list = sessionsByTutor.get(s.tutor_id) ?? [];
    list.push(s.id);
    sessionsByTutor.set(s.tutor_id, list);
  }

  const tutorIds = [...sessionsByTutor.keys()];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, bank_code, bank_name, account_number, account_name, paystack_recipient_code'
    )
    .in('id', tutorIds);

  if (profilesError) {
    console.error('[processBulkPayouts] profiles', profilesError.message);
    return { ok: false, message: 'Could not load tutor payout profiles.' };
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p as TutorBankProfile]));
  const skippedTutors: string[] = [];
  const transferBatch: {
    tutorId: string;
    sessionIds: string[];
    reference: string;
    amountKobo: number;
    recipientCode: string;
    reason: string;
  }[] = [];

  for (const [tutorId, sessionIds] of sessionsByTutor) {
    const profile = profileById.get(tutorId);
    const name = profile ? tutorDisplayName(profile) : tutorId.slice(0, 8);

    if (
      !profile?.bank_code?.trim() ||
      !profile.account_number?.trim() ||
      !profile.account_name?.trim()
    ) {
      skippedTutors.push(`${name}: missing bank details (bank, account number, or account name)`);
      continue;
    }

    let recipientCode = profile.paystack_recipient_code?.trim() ?? '';

    if (!recipientCode) {
      const created = await createTransferRecipient(profile);
      if (!created.ok) {
        skippedTutors.push(`${name}: ${created.error}`);
        continue;
      }
      recipientCode = created.recipientCode;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ paystack_recipient_code: recipientCode })
        .eq('id', tutorId);

      if (updateProfileError) {
        console.error('[processBulkPayouts] save recipient', updateProfileError.message);
      }
    }

    const amountNgn = sessionIds.length * FLAT_SESSION_PAYOUT_NGN;
    const reference = `en_bulk_${tutorId.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;

    transferBatch.push({
      tutorId,
      sessionIds,
      reference,
      amountKobo: ngnToKobo(amountNgn),
      recipientCode,
      reason: `Enabled tutor payout — ${sessionIds.length} session(s) @ ₦${FLAT_SESSION_PAYOUT_NGN.toLocaleString()}`,
    });
  }

  if (transferBatch.length === 0) {
    return {
      ok: false,
      message: 'No tutors could be paid. Everyone is missing bank details or Paystack setup failed.',
      skippedTutors,
    };
  }

  const paystackResult = await initiatePaystackBulkTransfer(
    transferBatch.map((t) => ({
      amountKobo: t.amountKobo,
      reference: t.reference,
      recipientCode: t.recipientCode,
      reason: t.reason,
    }))
  );

  if (!paystackResult.ok) {
    return {
      ok: false,
      message: paystackResult.error,
      skippedTutors: skippedTutors.length > 0 ? skippedTutors : undefined,
    };
  }

  const successfulRefs = new Set(
    paystackResult.results
      .filter((r) => ['success', 'received', 'pending', 'processing'].includes(r.status))
      .map((r) => r.reference)
  );

  const paidSessionIds: string[] = [];
  for (const batch of transferBatch) {
    if (successfulRefs.has(batch.reference) || paystackResult.results.length === 0) {
      paidSessionIds.push(...batch.sessionIds);
    }
  }

  if (paidSessionIds.length === 0 && paystackResult.results.length > 0) {
    return {
      ok: false,
      message: 'Paystack accepted the request but no transfers were marked successful. No sessions were updated.',
      skippedTutors,
    };
  }

  const sessionIdsToMark =
    paidSessionIds.length > 0 ? paidSessionIds : transferBatch.flatMap((b) => b.sessionIds);

  const { error: markPaidError } = await supabase
    .from('sessions')
    .update({ status: 'PAID' })
    .in('id', sessionIdsToMark)
    .eq('status', 'UNPAID');

  if (markPaidError) {
    console.error('[processBulkPayouts] mark paid', markPaidError.message);
    return {
      ok: false,
      message:
        'Paystack transfer succeeded but updating sessions in the database failed. Check the dashboard and Paystack before retrying.',
      skippedTutors,
    };
  }

  revalidatePath('/admin');

  const paidTutorCount = transferBatch.length;
  const paidSessionCount = sessionIdsToMark.length;
  let message = `Processed ${paidTutorCount} tutor payout(s) for ${paidSessionCount} session(s). ${paystackResult.message}`;

  if (skippedTutors.length > 0) {
    message += ` ${skippedTutors.length} tutor(s) were skipped.`;
  }

  return {
    ok: true,
    message,
    skippedTutors: skippedTutors.length > 0 ? skippedTutors : undefined,
  };
}
