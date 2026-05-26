'use server';

import { render } from '@react-email/render';
import { Resend } from 'resend';
import TutorPayoutReceipt from '@/emails/TutorPayoutReceipt';
import type { TutorReceiptData } from '@/app/actions/email.types';
import { FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Sends a bulk-payout receipt to a tutor after Paystack transfer succeeds.
 * Never throws — logs failures so payouts are not rolled back.
 */
export async function sendTutorReceipt(
  email: string,
  receiptData: TutorReceiptData
): Promise<{ ok: boolean; error?: string }> {
  const to = email?.trim();
  if (!to) {
    console.warn('[email] sendTutorReceipt skipped — no tutor email');
    return { ok: false, error: 'Tutor email missing' };
  }

  const resend = getResendClient();
  if (!resend) {
    console.info('[email] RESEND_API_KEY not set — skipping tutor receipt for', to);
    return { ok: true };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    'Enabled Multi Concept <onboarding@resend.dev>';

  const amountPaid =
    receiptData.amountPaid ??
    receiptData.sessionCount * FLAT_SESSION_PAYOUT_NGN;

  try {
    const html = await render(
      TutorPayoutReceipt({
        tutorName: receiptData.tutorName,
        amountPaid,
        date: receiptData.date,
        sessionCount: receiptData.sessionCount,
      })
    );

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: `Payout receipt — ${receiptData.date} | Enabled Multi Concept`,
      html,
    });

    if (error) {
      console.error('[email] sendTutorReceipt Resend error:', error.message);
      return { ok: false, error: error.message };
    }

    console.info('[email] tutor receipt sent', { to, id: data?.id });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[email] sendTutorReceipt failed:', message);
    return { ok: false, error: message };
  }
}
