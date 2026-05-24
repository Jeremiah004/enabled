import { requireRole } from '@/lib/auth';
import { getAllAnnouncements } from '@/lib/announcements';
import AnnouncementsAdminPanel from '@/app/components/AnnouncementsAdminPanel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  await requireRole(['ADMIN']);
  const announcements = await getAllAnnouncements();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/admin"
          className="text-sm text-muted hover:text-accent transition-colors inline-flex items-center gap-1 mb-3"
        >
          ← Payroll dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Announcements
        </h1>
        <p className="text-muted text-sm mt-1">
          Publish notices that appear at the top of the app for all signed-in staff.
        </p>
      </div>

      <AnnouncementsAdminPanel announcements={announcements} />
    </div>
  );
}
