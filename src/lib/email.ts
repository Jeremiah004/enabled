export type PaidSessionReceiptPayload = {
  tutorEmail: string;
  tutorName: string;
  sessionId: string;
  subject: string;
  studentName: string;
  sessionDate: string;
  hours: number;
  payoutAmountNgn: number;
};

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildReceiptHtml(payload: PaidSessionReceiptPayload): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #09090b; color: #e4e4e7; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; border: 1px solid #27272a; border-radius: 12px; padding: 32px; background: #18181b;">
    <p style="color: #34d399; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px;">Enabled Multi Concept</p>
    <h1 style="color: #fafafa; font-size: 22px; margin: 0 0 24px;">Session payment confirmed</h1>
    <p style="color: #a1a1aa; line-height: 1.6;">Hello ${payload.tutorName},</p>
    <p style="color: #a1a1aa; line-height: 1.6;">An administrator has marked the following session as <strong style="color: #34d399;">PAID</strong>:</p>
    <table style="width: 100%; margin: 24px 0; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 8px 0; color: #71717a;">Student</td><td style="padding: 8px 0; color: #fafafa; text-align: right;">${payload.studentName}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a;">Subject</td><td style="padding: 8px 0; color: #fafafa; text-align: right;">${payload.subject}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a;">Date</td><td style="padding: 8px 0; color: #fafafa; text-align: right;">${payload.sessionDate}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a;">Duration</td><td style="padding: 8px 0; color: #fafafa; text-align: right;">${payload.hours.toFixed(1)} hours</td></tr>
      <tr><td style="padding: 12px 0; color: #71717a; border-top: 1px solid #27272a;">Payout</td><td style="padding: 12px 0; color: #34d399; font-weight: bold; text-align: right; border-top: 1px solid #27272a;">${formatNaira(payload.payoutAmountNgn)}</td></tr>
    </table>
    <p style="color: #52525b; font-size: 12px; margin-top: 32px;">Reference: ${payload.sessionId}</p>
  </div>
</body>
</html>`;
}

/**
 * Sends a payment receipt to the tutor when a session is marked PAID.
 * No-ops when RESEND_API_KEY is not configured (safe for local dev).
 */
export async function sendPaidSessionReceipt(
  payload: PaidSessionReceiptPayload
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? 'Enabled Multi Concept <onboarding@resend.dev>';

  if (!apiKey) {
    console.info(
      '[email] RESEND_API_KEY not set — skipping receipt for session',
      payload.sessionId
    );
    return { ok: true };
  }

  if (!payload.tutorEmail) {
    return { ok: false, error: 'Tutor email missing' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.tutorEmail],
        subject: `Payment confirmed — ${payload.subject} (${payload.sessionDate})`,
        html: buildReceiptHtml(payload),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[email] Resend error:', res.status, body);
      return { ok: false, error: `Resend API error: ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[email] send failed:', message);
    return { ok: false, error: message };
  }
}
