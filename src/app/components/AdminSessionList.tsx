'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteSession } from '@/app/actions/deleteSession';
import { FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';
import { formatNaira } from '@/lib/format';

type SessionRow = {
  id: string;
  subject: string;
  start_time: string;
  end_time: string;
  status: string;
  tutor_id: string;
  student_id: string;
};

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'PAID';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
        paid
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      }`}
    >
      {status}
    </span>
  );
}

function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (!result.ok) {
        window.alert(result.error ?? 'Could not delete session.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      title="Delete session"
      aria-label="Delete session"
      className="inline-flex items-center justify-center text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400/50 px-2.5 py-2 rounded-md transition-colors min-h-[36px] min-w-[36px] disabled:opacity-50"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  );
}

export default function AdminSessionList({
  sessions,
  tutorNames,
  studentNames,
  markAsPaidAction,
}: {
  sessions: SessionRow[];
  tutorNames: Map<string, string>;
  studentNames: Map<string, string>;
  markAsPaidAction: (formData: FormData) => Promise<void>;
}) {
  const payout = FLAT_SESSION_PAYOUT_NGN;

  return (
    <>
      <ul className="lg:hidden divide-y divide-[var(--border)]">
        {sessions.map((s) => {
          const hrs =
            Math.abs(new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 36e5;
          const dateStr = new Date(s.start_time).toLocaleDateString('en-NG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <li key={s.id} className="px-4 py-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-primary truncate">
                    {tutorNames.get(s.tutor_id) ?? '—'}
                  </p>
                  <p className="text-sm text-muted truncate">
                    {studentNames.get(s.student_id) ?? '—'} · {s.subject}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>{dateStr}</span>
                <span>{hrs.toFixed(1)}h</span>
                <span className="text-primary font-medium">{formatNaira(payout)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s.status === 'UNPAID' && (
                  <form action={markAsPaidAction} className="flex-1 sm:flex-none">
                    <input type="hidden" name="session_id" value={s.id} />
                    <button
                      type="submit"
                      className="w-full sm:w-auto text-sm font-medium text-accent hover:opacity-80 border border-[var(--nav-active-border)] px-4 py-3 rounded-xl transition-colors min-h-[44px]"
                    >
                      Mark paid
                    </button>
                  </form>
                )}
                <DeleteSessionButton sessionId={s.id} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead>
            <tr className="border-b border-default bg-muted/50">
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-6 py-3">
                Tutor
              </th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Student
              </th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Subject
              </th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Date
              </th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Hrs
              </th>
              <th className="text-right text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Payout
              </th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-widest px-4 py-3">
                Status
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sessions.map((s) => {
              const hrs =
                Math.abs(new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
                36e5;
              const dateStr = new Date(s.start_time).toLocaleDateString('en-NG', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                    {tutorNames.get(s.tutor_id) ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-muted whitespace-nowrap">
                    {studentNames.get(s.student_id) ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-muted">{s.subject}</td>
                  <td className="px-4 py-4 text-subtle text-xs whitespace-nowrap">{dateStr}</td>
                  <td className="px-4 py-4 text-muted">{hrs.toFixed(1)}</td>
                  <td className="px-4 py-4 text-right font-medium text-primary whitespace-nowrap">
                    {formatNaira(payout)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === 'UNPAID' && (
                        <form action={markAsPaidAction}>
                          <input type="hidden" name="session_id" value={s.id} />
                          <button
                            type="submit"
                            className="text-xs font-medium text-accent hover:opacity-80 border border-[var(--nav-active-border)] px-3 py-2 rounded-md transition-colors whitespace-nowrap min-h-[36px]"
                          >
                            Mark Paid
                          </button>
                        </form>
                      )}
                      <DeleteSessionButton sessionId={s.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
