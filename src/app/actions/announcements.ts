'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type AnnouncementActionState = {
  error: string | null;
  success: boolean;
};

export const announcementActionInitialState: AnnouncementActionState = {
  error: null,
  success: false,
};

function revalidateAnnouncementPaths() {
  revalidatePath('/admin/announcements');
  revalidatePath('/admin', 'layout');
  revalidatePath('/tutor', 'layout');
  revalidatePath('/admin', 'page');
  revalidatePath('/tutor', 'page');
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
    const expiry_date = expiryRaw ? new Date(expiryRaw).toISOString() : null;

    if (expiry_date && Number.isNaN(new Date(expiry_date).getTime())) {
      return { error: 'Invalid expiry date.', success: false };
    }

    const { error } = await supabase.from('announcements').insert({
      content,
      expiry_date,
      is_active: true,
    });

    if (error) {
      console.error('[createAnnouncement]', error.message);
      return {
        error: `Could not create announcement: ${error.message}`,
        success: false,
      };
    }

    revalidateAnnouncementPaths();
    return { error: null, success: true };
  } catch (err) {
    console.error('[createAnnouncement] unexpected', err);
    return { error: 'An unexpected error occurred. Please try again.', success: false };
  }
}

export async function toggleAnnouncementActive(formData: FormData): Promise<void> {
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
}
