import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getAllStudents } from '@/lib/students';
import StudentsAdminPanel from '@/app/components/StudentsAdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  await requireRole(['ADMIN']);
  const supabase = await createClient();
  const { students, totalCount } = await getAllStudents(supabase);

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
          Students
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage the student roster tutors select when logging sessions.
        </p>
      </div>

      <StudentsAdminPanel students={students} totalCount={totalCount} />
    </div>
  );
}
