import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ── Payout rate config ───────────────────────────────────────────
// Rate per 1.5-hour class block, in Naira
const RATE_CODING = 5000;
const RATE_DEFAULT = 3500;
const BLOCK_HOURS = 1.5;

function getRate(subject: string): number {
  return subject.toLowerCase().includes('coding') ? RATE_CODING : RATE_DEFAULT;
}

function calcPayout(subject: string, startTime: string, endTime: string): number {
  const hrs =
    Math.abs(new Date(endTime).getTime() - new Date(startTime).getTime()) / 36e5;
  return (hrs / BLOCK_HOURS) * getRate(subject);
}

export default async function AdminDashboard() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const [{ data: sessions }, { data: profiles }, { data: students }] = await Promise.all([
    supabase
      .from('sessions')
      .select(
        'id, subject, start_time, end_time, status, topics_covered, tutor_id, student_id'
      )
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email'),
    supabase.from('students').select('id, full_name'),
  ]);

  const tutorNames = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name || p.email || '—'])
  );
  const studentNames = new Map(
    (students ?? []).map((s) => [s.id, s.full_name])
  );

  // ── Aggregate financials ──────────────────────────────────────
  let totalPendingPayout = 0;
  let totalPaidPayout = 0;
  let totalSessions = sessions?.length ?? 0;

  sessions?.forEach((s: any) => {
    const payout = calcPayout(s.subject, s.start_time, s.end_time);
    if (s.status === 'UNPAID') totalPendingPayout += payout;
    else totalPaidPayout += payout;
  });

  const unpaidCount = sessions?.filter((s) => s.status === 'UNPAID').length ?? 0;

  // ── Mark as PAID server action ────────────────────────────────
  const markAsPaidAction = async (formData: FormData) => {
    'use server';
    await requireRole(['admin']);
    const sessionId = formData.get('session_id') as string;
    const supabaseClient = await createClient();
    await supabaseClient
      .from('sessions')
      .update({ status: 'PAID' })
      .eq('id', sessionId);
    revalidatePath('/admin');
  };

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payroll Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Review all logged sessions and manage tutor payments.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Total Sessions</p>
          <p className="text-3xl font-bold text-white mt-1">{totalSessions}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Unpaid Sessions</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{unpaidCount}</p>
        </div>
        <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Outstanding Payout</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatNaira(totalPendingPayout)}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Total Paid Out</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatNaira(totalPaidPayout)}</p>
        </div>
      </div>

      {/* ── Rate reference ── */}
      <div className="flex items-center gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Coding — ₦{RATE_CODING.toLocaleString()} / {BLOCK_HOURS}h block
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
          Other subjects — ₦{RATE_DEFAULT.toLocaleString()} / {BLOCK_HOURS}h block
        </span>
      </div>

      {/* ── Session log table ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block"></span>
            All Session Logs
          </h2>
          <span className="text-xs text-zinc-500">{totalSessions} records</span>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">No sessions logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-6 py-3">Tutor</th>
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Student</th>
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Subject</th>
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Date</th>
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Hrs</th>
                  <th className="text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Payout</th>
                  <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sessions.map((s: any) => {
                  const hrs =
                    Math.abs(
                      new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
                    ) / 36e5;
                  const payout = calcPayout(s.subject, s.start_time, s.end_time);
                  const dateStr = new Date(s.start_time).toLocaleDateString('en-NG', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const tutorName = tutorNames.get(s.tutor_id) ?? '—';

                  return (
                    <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{tutorName}</td>
                      <td className="px-4 py-4 text-zinc-300 whitespace-nowrap">
                        {studentNames.get(s.student_id) ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-zinc-400">{s.subject}</td>
                      <td className="px-4 py-4 text-zinc-500 text-xs whitespace-nowrap">{dateStr}</td>
                      <td className="px-4 py-4 text-zinc-400">{hrs.toFixed(1)}</td>
                      <td className="px-4 py-4 text-right font-medium text-zinc-200 whitespace-nowrap">
                        {formatNaira(payout)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
                            s.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.status === 'UNPAID' && (
                          <form action={markAsPaidAction}>
                            <input type="hidden" name="session_id" value={s.id} />
                            <button
                              type="submit"
                              className="text-xs font-medium text-emerald-500 hover:text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/50 px-3 py-1 rounded-md transition-colors whitespace-nowrap"
                            >
                              Mark Paid
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}