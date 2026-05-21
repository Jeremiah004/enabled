import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { sessionDurationHours } from '@/lib/sessions';
import SessionLogForm from '@/app/components/SessionLogForm';

export const dynamic = 'force-dynamic';

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeRange(startIso: string, endIso: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const start = new Date(startIso).toLocaleTimeString('en-NG', opts);
  const end = new Date(endIso).toLocaleTimeString('en-NG', opts);
  const hrs = sessionDurationHours(startIso, endIso);
  return `${start} – ${end} (${hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h)`;
}

export default async function TutorDashboard() {
  const { user, profile } = await requireRole(['tutor']);
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

  const totalSessions = history?.length ?? 0;
  const totalHours =
    history?.reduce(
      (acc, h) => acc + sessionDurationHours(h.start_time, h.end_time),
      0
    ) ?? 0;
  const unpaidSessions = history?.filter((h) => h.status === 'UNPAID').length ?? 0;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Tutor';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-emerald-400/90 text-xs font-semibold uppercase tracking-widest mb-1">
          Tutor workspace
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Hello, {firstName}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Log today&apos;s classes and track your hours below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-5 card-glow">
          <p className="text-xs font-medium text-zinc-500">Total sessions</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{totalSessions}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-zinc-900/50 p-5 card-glow">
          <p className="text-xs font-medium text-emerald-400/80">Hours logged</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2 tabular-nums">
            {totalHours.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900/50 p-5 card-glow">
          <p className="text-xs font-medium text-amber-400/80">Awaiting payment</p>
          <p className="text-3xl font-bold text-amber-300 mt-2 tabular-nums">{unpaidSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-7 card-glow">
          <SessionLogForm students={students ?? []} />
        </div>

        <div className="xl:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Session history</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Most recent first</p>
            </div>
            <span className="text-xs text-zinc-600 tabular-nums">{totalSessions} total</span>
          </div>

          {!history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm font-medium">No sessions yet</p>
              <p className="text-zinc-600 text-xs mt-1 max-w-xs">
                Your logged classes will show up here with date, time, and payment status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="border-b border-zinc-800 text-left text-[11px] text-zinc-500 uppercase tracking-wide">
                    <th className="px-6 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">
                        {studentNames.get(h.student_id) ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{h.subject}</td>
                      <td className="px-4 py-4">
                        <p className="text-zinc-400 text-xs">{formatSessionDate(h.start_time)}</p>
                        <p className="text-zinc-500 text-[11px] mt-0.5">
                          {formatTimeRange(h.start_time, h.end_time)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            h.status === 'PAID'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
