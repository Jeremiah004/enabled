'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function deleteSession(
  sessionId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(['ADMIN']);

  const id = sessionId?.trim();
  if (!id) {
    return { ok: false, error: 'Missing session id.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('sessions').delete().eq('id', id);

  if (error) {
    console.error('[deleteSession]', error.message);
    return { ok: false, error: 'Could not delete session. Please try again.' };
  }

  revalidatePath('/admin');
  return { ok: true };
}
