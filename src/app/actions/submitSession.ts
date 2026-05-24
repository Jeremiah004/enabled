'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { validateAndBuildSessionTimestamps } from '@/lib/sessions';
import { revalidatePath } from 'next/cache';

// ── Types ────────────────────────────────────────────────────────────────────

export type SessionFormState = {
  error: string | null;
  success: boolean;
};

// ── Action ───────────────────────────────────────────────────────────────────

export async function submitSession(
  _prevState: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const { user } = await requireRole(['TUTOR']);
  const supabase = await createClient();

  // 2. Extract and validate form fields
  const studentId    = formData.get('student_id')    as string | null;
  const subject      = formData.get('subject')        as string | null;
  const sessionDate  =
    (formData.get('session_date') ?? formData.get('date')) as string | null;
  const startTime    = formData.get('start_time')     as string | null;
  const endTime      = formData.get('end_time')       as string | null;
  const topicsCovered = formData.get('topics_covered') as string | null;

  if (!studentId || !subject || !sessionDate || !startTime || !endTime || !topicsCovered) {
    return { error: 'All fields are required.', success: false };
  }

  const timestamps = validateAndBuildSessionTimestamps(sessionDate, startTime, endTime);
  if (!timestamps.ok) {
    return { error: timestamps.error, success: false };
  }

  const { start_time, end_time } = timestamps;

  const { error: insertError } = await supabase.from('sessions').insert({
    tutor_id: user.id,
    student_id: studentId,
    subject: subject.trim(),
    start_time,
    end_time,
    topics_covered: topicsCovered.trim(),
    status: 'UNPAID',
  });

  if (insertError) {
    console.error('[submitSession] insert error:', insertError.message);
    return { error: 'Failed to save session. Please try again.', success: false };
  }

  // 4. Bust the tutor page cache so the history table reflects the new row
  revalidatePath('/tutor');

  return { error: null, success: true };
}