import { createClient } from '@/lib/supabase/server';
import type { AnnouncementRow } from '@/lib/announcements.types';

export type { AnnouncementRow } from '@/lib/announcements.types';
export { isAnnouncementCurrentlyVisible } from '@/lib/announcements.types';

function logAnnouncementError(context: string, error: { message: string; code?: string }) {
  console.error(`[announcements] ${context}:`, error.message, error.code ?? '');
  if (error.code === '42P01') {
    console.error('[announcements] Table missing — run supabase/announcements.sql or fix-announcements-rls.sql');
  }
  if (error.code === '42501') {
    console.error('[announcements] RLS denied — run supabase/fix-announcements-rls.sql');
  }
}

/** Active, non-expired announcements for the sitewide banner (RLS-filtered). */
export async function getActiveAnnouncements(): Promise<AnnouncementRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('id, content, created_at, is_active, expiry_date')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logAnnouncementError('getActiveAnnouncements', error);
      return [];
    }

    const now = Date.now();
    return (data ?? [])
      .filter((row) => row && typeof row.id === 'string')
      .filter((row) => !row.expiry_date || new Date(row.expiry_date).getTime() > now);
  } catch (err) {
    console.error('[announcements] getActiveAnnouncements unexpected:', err);
    return [];
  }
}

/** All announcements for admin management (admin RLS). */
export async function getAllAnnouncements(): Promise<AnnouncementRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('id, content, created_at, is_active, expiry_date')
      .order('created_at', { ascending: false });

    if (error) {
      logAnnouncementError('getAllAnnouncements', error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error('[announcements] getAllAnnouncements unexpected:', err);
    return [];
  }
}
