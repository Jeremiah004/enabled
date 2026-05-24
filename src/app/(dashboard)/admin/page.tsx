import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import AdminSessionList from '@/app/components/AdminSessionList';

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

  let totalPendingPayout = 0;
  let totalPaidPayout = 0;
  const sessionList = sessions ?? [];
  const totalSessions = sessionList.length;

  sessionList.forEach((s) => {
    const payout = calcPayout(s.subject, s.start_time, s.end_time);
    if (s.status === 'UNPAID') totalPendingPayout += payout;
    else totalPaidPayout += payout;
  });

  const unpaidCount = sessionList.filter((s) => s.status === 'UNPAID').length;

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
    <div className="space-y-6 sm:space-y-7">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Payroll dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Review all logged sessions and manage tutor payments.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Total sessions
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">{totalSessions}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Unpaid
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 tabular-nums">{unpaidCount}</p>
        </div>
        <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Outstanding
          </p>
          <p className="text-lg sm:text-2xl font-bold text-amber-400 mt-1 break-words">
            {formatNaira(totalPendingPayout)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Paid out
          </p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1 break-words">
            {formatNaira(totalPaidPayout)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          Coding — ₦{RATE_CODING.toLocaleString()} / {BLOCK_HOURS}h
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
          Other — ₦{RATE_DEFAULT.toLocaleString()} / {BLOCK_HOURS}h
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span className="truncate">All session logs</span>
          </h2>
          <span className="text-xs text-zinc-500 shrink-0">{totalSessions} records</span>
        </div>

        {sessionList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">No sessions logged yet.</p>
          </div>
        ) : (
          <AdminSessionList
            sessions={sessionList}
            tutorNames={tutorNames}
            studentNames={studentNames}
            formatNaira={formatNaira}
            calcPayout={calcPayout}
            markAsPaidAction={markAsPaidAction}
          />
        )}
      </div>
    </div>
  );
}
