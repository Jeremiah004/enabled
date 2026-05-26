'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { AnnouncementActionState } from '@/app/actions/announcements.types';

function revalidateAnnouncementPaths() {
  revalidatePath('/admin/announcements');
  revalidatePath('/tutor', 'layout');
  revalidatePath('/admin', 'layout');
}

function isNextNavigationError(err: unknown): boolean {
  if (!err || typeof err !== 'object' || !('digest' in err)) return false;
  const digest = String((err as { digest?: string }).digest);
  return digest.includes('NEXT_REDIRECT') || digest.includes('NEXT_NOT_FOUND');
}

export async function createAnnouncement(
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  try {
    await requireRole(['ADMIN']);
    const supabase = await createClient();

    const content = (formData.get('content') as string | null)?.trim() ?? '';
    if (!content) {
      return { error: 'Announcement text is required.', success: false };
    }

    const expiryRaw = (formData.get('expiry_date') as string | null)?.trim();
    let expiry_date: string | null = null;
    if (expiryRaw) {
      const parsed = new Date(expiryRaw);
      if (Number.isNaN(parsed.getTime())) {
        return { error: 'Invalid expiry date.', success: false };
      }
      expiry_date = parsed.toISOString();
    }

    const { error } = await supabase.from('announcements').insert({
      content,
      expiry_date,
      is_active: true,
    });

    if (error) {
      console.error('[createAnnouncement]', error.message, error.code);
      return {
        error: `Could not create announcement: ${error.message}`,
        success: false,
      };
    }

    revalidateAnnouncementPaths();
    return { error: null, success: true };
  } catch (err) {
    if (isNextNavigationError(err)) throw err;
    console.error('[createAnnouncement] unexpected', err);
    return { error: 'An unexpected error occurred. Please try again.', success: false };
  }
}

export async function toggleAnnouncementActive(formData: FormData): Promise<void> {
  try {
    await requireRole(['ADMIN']);
    const id = formData.get('id') as string;
    const nextActive = formData.get('is_active') === 'true';

    if (!id) return;

    const supabase = await createClient();
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: nextActive })
      .eq('id', id);

    if (error) {
      console.error('[toggleAnnouncementActive]', error.message);
      return;
    }

    revalidateAnnouncementPaths();
  } catch (err) {
    if (isNextNavigationError(err)) throw err;
    console.error('[toggleAnnouncementActive] unexpected', err);
  }
}

export async function deleteAnnouncement(
  announcementId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN']);

    const id = announcementId?.trim();
    if (!id) {
      return { ok: false, error: 'Missing announcement id.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);

    if (error) {
      console.error('[deleteAnnouncement]', error.message, error.code);
      return { ok: false, error: 'Could not delete announcement. Please try again.' };
    }

    revalidateAnnouncementPaths();
    return { ok: true };
  } catch (err) {
    if (isNextNavigationError(err)) throw err;
    console.error('[deleteAnnouncement] unexpected', err);
    return { ok: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
