import { createClient } from '@/lib/supabase/server';
import type { AnnouncementRow } from '@/lib/announcements.types';

export type { AnnouncementRow } from '@/lib/announcements.types';
export { isAnnouncementCurrentlyVisible } from '@/lib/announcements.types';

/** Active, non-expired announcements for the sitewide banner (RLS-filtered). */
export async function getActiveAnnouncements(): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('id, content, created_at, is_active, expiry_date')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[announcements] getActiveAnnouncements:', error.message);
    return [];
  }

  const now = Date.now();
  return (data ?? []).filter(
    (row) => !row.expiry_date || new Date(row.expiry_date).getTime() > now
  );
}

/** All announcements for admin management (admin RLS). */
export async function getAllAnnouncements(): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('id, content, created_at, is_active, expiry_date')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[announcements] getAllAnnouncements:', error.message);
    return [];
  }

  return data ?? [];
}
