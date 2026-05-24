export type AnnouncementRow = {
  id: string;
  content: string;
  created_at: string;
  is_active: boolean;
  expiry_date: string | null;
};

export function isAnnouncementCurrentlyVisible(row: AnnouncementRow): boolean {
  if (!row.is_active) return false;
  if (!row.expiry_date) return true;
  return new Date(row.expiry_date).getTime() > Date.now();
}
