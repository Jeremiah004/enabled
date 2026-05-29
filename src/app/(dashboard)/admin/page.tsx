import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { sendTutorReceipt } from '@/app/actions/email';
import { calcSessionPayout, FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';
import { formatNaira } from '@/lib/format';
import { getAllStudents } from '@/lib/students';
import { buildUnpaidPayrollRows } from '@/lib/unpaid-payroll';
import { revalidatePath } from 'next/cache';
import AdminSessionList from '@/app/components/AdminSessionList';
import ProcessPayoutsButton from '@/app/components/ProcessPayoutsButton';

export default async function AdminDashboard() {
  await requireRole(['ADMIN']);
  const supabase = await createClient();

  const [{ data: sessions }, { data: profiles }, { students }] = await Promise.all([
    supabase
      .from('sessions')
      .select(
        'id, subject, start_time, end_time, status, topics_covered, tutor_id, student_id'
      )
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select(
      'id, full_name, email, bank_name, bank_code, account_number'
    ),
    getAllStudents(supabase),
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
    const payout = calcSessionPayout();
    if (s.status === 'UNPAID') totalPendingPayout += payout;
    else totalPaidPayout += payout;
  });

  const unpaidCount = sessionList.filter((s) => s.status === 'UNPAID').length;

  const unpaidPayrollRows = buildUnpaidPayrollRows(sessionList, profiles ?? []);

  const markAsPaidAction = async (formData: FormData) => {
    'use server';
    await requireRole(['ADMIN']);
    const sessionId = formData.get('session_id') as string;
    const supabaseClient = await createClient();

    const { data: session } = await supabaseClient
      .from('sessions')
      .select('id, subject, start_time, end_time, tutor_id, student_id')
      .eq('id', sessionId)
      .single();

    const { error: updateError } = await supabaseClient
      .from('sessions')
      .update({ status: 'PAID' })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[markAsPaid]', updateError.message);
      revalidatePath('/admin');
      return;
    }

    if (session) {
      const { data: tutor } = await supabaseClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', session.tutor_id)
        .single();

      const payout = calcSessionPayout();
      const sessionDate = new Date(session.start_time).toLocaleDateString('en-NG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (tutor?.email) {
        const emailResult = await sendTutorReceipt(tutor.email, {
          tutorName: tutor.full_name ?? 'Tutor',
          amountPaid: payout,
          date: sessionDate,
          sessionCount: 1,
        });

        if (!emailResult.ok) {
          console.error('[markAsPaid] receipt email failed:', emailResult.error);
        }
      }
    }

    revalidatePath('/admin');
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Payroll dashboard
          </h1>
          <p className="text-muted text-sm mt-1">
            Review all logged sessions and manage tutor payments.
          </p>
        </div>
        <ProcessPayoutsButton
          unpaidCount={unpaidCount}
          outstandingLabel={formatNaira(totalPendingPayout)}
          unpaidPayrollRows={unpaidPayrollRows}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-elevated border border-default rounded-xl p-4 sm:p-5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-widest">
            Total sessions
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary mt-1 tabular-nums">{totalSessions}</p>
        </div>
        <div className="bg-elevated border border-default rounded-xl p-4 sm:p-5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-widest">
            Unpaid
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 tabular-nums">{unpaidCount}</p>
        </div>
        <div className="bg-elevated border border-amber-500/20 rounded-xl p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-widest">
            Outstanding
          </p>
          <p className="text-lg sm:text-2xl font-bold text-amber-400 mt-1 break-words">
            {formatNaira(totalPendingPayout)}
          </p>
        </div>
        <div className="bg-elevated border border-emerald-500/20 rounded-xl p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-widest">
            Paid out
          </p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1 break-words">
            {formatNaira(totalPaidPayout)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 text-xs text-subtle">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          Flat rate — {formatNaira(FLAT_SESSION_PAYOUT_NGN)} per session (any subject, any duration)
        </span>
      </div>

      <div className="bg-elevated border border-default rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-default flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-4 rounded-full bg-accent inline-block shrink-0" />
            <span className="truncate">All session logs</span>
          </h2>
          <span className="text-xs text-muted shrink-0">{totalSessions} records</span>
        </div>

        {sessionList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-subtle"
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
            <p className="text-muted text-sm">No sessions logged yet.</p>
          </div>
        ) : (
          <AdminSessionList
            sessions={sessionList}
            tutorNames={tutorNames}
            studentNames={studentNames}
            markAsPaidAction={markAsPaidAction}
          />
        )}
      </div>
    </div>
  );
}
