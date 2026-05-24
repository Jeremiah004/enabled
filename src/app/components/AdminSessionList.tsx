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

export default function AdminSessionList({
  sessions,
  tutorNames,
  studentNames,
  formatNaira,
  calcPayout,
  markAsPaidAction,
}: {
  sessions: SessionRow[];
  tutorNames: Map<string, string>;
  studentNames: Map<string, string>;
  formatNaira: (amount: number) => string;
  calcPayout: (subject: string, startTime: string, endTime: string) => number;
  markAsPaidAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <>
      <ul className="lg:hidden divide-y divide-[var(--border)]">
        {sessions.map((s) => {
          const hrs =
            Math.abs(new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 36e5;
          const payout = calcPayout(s.subject, s.start_time, s.end_time);
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
              {s.status === 'UNPAID' && (
                <form action={markAsPaidAction}>
                  <input type="hidden" name="session_id" value={s.id} />
                  <button
                    type="submit"
                    className="w-full sm:w-auto text-sm font-medium text-accent hover:opacity-80 border border-[var(--nav-active-border)] px-4 py-3 rounded-xl transition-colors min-h-[44px]"
                  >
                    Mark paid
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
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
              const payout = calcPayout(s.subject, s.start_time, s.end_time);
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
