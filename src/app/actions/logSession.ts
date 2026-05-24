'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { validateAndBuildSessionTimestamps } from '@/lib/sessions';
import { revalidatePath } from 'next/cache';
import type { LogSessionState } from '@/app/actions/logSession.types';

export async function logSession(
  _prevState: LogSessionState,
  formData: FormData
): Promise<LogSessionState> {
  const { user } = await requireRole(['TUTOR']);
  const supabase = await createClient();

  const studentId = formData.get('student_id') as string | null;
  const subject = formData.get('subject') as string | null;
  const sessionDate = formData.get('date') as string | null;
  const startTime = formData.get('start_time') as string | null;
  const endTime = formData.get('end_time') as string | null;
  const topicsCovered = formData.get('topics_covered') as string | null;

  if (!studentId || !subject?.trim() || !sessionDate || !startTime || !endTime || !topicsCovered?.trim()) {
    return { error: 'All fields are required.', success: false };
  }

  const timestamps = validateAndBuildSessionTimestamps(
    sessionDate.trim(),
    startTime,
    endTime
  );
  if (!timestamps.ok) {
    return { error: timestamps.error, success: false };
  }

  if (timestamps.durationHours > 12) {
    return {
      error: 'Session cannot be longer than 12 hours. Check your start and end times.',
      success: false,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('sessions')
    .insert({
      tutor_id: user.id,
      student_id: studentId,
      subject: subject.trim(),
      start_time: timestamps.start_time,
      end_time: timestamps.end_time,
      topics_covered: topicsCovered.trim(),
      status: 'UNPAID',
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    console.error('[logSession] insert error:', insertError?.message);
    return {
      error:
        insertError?.message ??
        'Failed to save session. Check that your profile exists in Supabase (run setup-profiles.sql).',
      success: false,
    };
  }

  revalidatePath('/tutor', 'page');
  revalidatePath('/tutor', 'layout');

  return { error: null, success: true };
}
