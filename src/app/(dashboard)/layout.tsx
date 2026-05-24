import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/app/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const { user, profile } = session;
  const isAdmin = profile?.role === 'ADMIN';
  const displayName = profile?.full_name || user.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardShell
      isAdmin={isAdmin}
      displayName={displayName}
      initials={initials}
      roleLabel={profile?.role ?? 'staff'}
    >
      {children}
    </DashboardShell>
  );
}
