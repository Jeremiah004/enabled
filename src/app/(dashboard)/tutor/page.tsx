import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { sessionDurationHours } from '@/lib/sessions';
import SessionLogForm from '@/app/components/SessionLogForm';
import TutorSessionHistory from '@/app/components/TutorSessionHistory';
import TutorDashboardTabs from '@/app/components/TutorDashboardTabs';
import PayoutSettingsForm from '@/app/components/PayoutSettingsForm';

export const dynamic = 'force-dynamic';

export default async function TutorDashboard() {
  const { user, profile } = await requireRole(['TUTOR']);
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .order('full_name', { ascending: true });

  const studentNames = new Map(
    (students ?? []).map((s) => [s.id, s.full_name])
  );

  const { data: history, error: historyError } = await supabase
    .from('sessions')
    .select('id, subject, topics_covered, start_time, end_time, status, student_id')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  if (historyError) {
    console.error('[tutor] history fetch error:', historyError.message);
  }

  const rows = history ?? [];
  const totalSessions = rows.length;
  const totalHours = rows.reduce(
    (acc, h) => acc + sessionDurationHours(h.start_time, h.end_time),
    0
  );
  const unpaidSessions = rows.filter((h) => h.status === 'UNPAID').length;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Tutor';

  const sessionsPanel = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 sm:p-5 card-glow">
          <p className="text-xs font-medium text-zinc-500">Total sessions</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 sm:mt-2 tabular-nums">
            {totalSessions}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-zinc-900/50 p-4 sm:p-5 card-glow">
          <p className="text-xs font-medium text-emerald-400/80">Hours logged</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-1.5 sm:mt-2 tabular-nums">
            {totalHours.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900/50 p-4 sm:p-5 card-glow">
          <p className="text-xs font-medium text-amber-400/80">Awaiting payment</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1.5 sm:mt-2 tabular-nums">
            {unpaidSessions}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6 md:p-7 card-glow">
          <SessionLogForm students={students ?? []} />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden card-glow">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">Session history</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Most recent first</p>
            </div>
            <span className="text-xs text-zinc-600 tabular-nums shrink-0 hidden md:inline">
              {totalSessions} total
            </span>
          </div>

          <TutorSessionHistory
            history={rows}
            studentNames={studentNames}
            totalSessions={totalSessions}
          />
        </div>
      </div>
    </>
  );

  const payoutPanel = (
    <PayoutSettingsForm
      initial={{
        bank_name: profile?.bank_name ?? null,
        account_number: profile?.account_number ?? null,
        account_name: profile?.account_name ?? null,
      }}
    />
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-emerald-400/90 text-xs font-semibold uppercase tracking-widest mb-1">
          Tutor workspace
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
          Hello, {firstName}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Log classes, review history, and manage payout details.
        </p>
      </div>

      <TutorDashboardTabs sessionsPanel={sessionsPanel} payoutPanel={payoutPanel} />
    </div>
  );
}
