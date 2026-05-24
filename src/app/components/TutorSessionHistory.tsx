import { sessionDurationHours } from '@/lib/sessions';

export type TutorHistoryRow = {
  id: string;
  subject: string;
  topics_covered: string;
  start_time: string;
  end_time: string;
  status: string;
  student_id: string;
};

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

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'PAID';
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 ${
        paid
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
      }`}
    >
      {status}
    </span>
  );
}

export default function TutorSessionHistory({
  history,
  studentNames,
  totalSessions,
}: {
  history: TutorHistoryRow[];
  studentNames: Map<string, string>;
  totalSessions: number;
}) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
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
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <ul className="md:hidden divide-y divide-zinc-800/60 max-h-[min(70vh,520px)] overflow-y-auto">
        {history.map((h) => (
          <li key={h.id} className="px-4 py-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-white truncate">
                  {studentNames.get(h.student_id) ?? '—'}
                </p>
                <p className="text-sm text-zinc-400 mt-0.5">{h.subject}</p>
              </div>
              <StatusBadge status={h.status} />
            </div>
            <p className="text-xs text-zinc-500">{formatSessionDate(h.start_time)}</p>
            <p className="text-xs text-zinc-400">{formatTimeRange(h.start_time, h.end_time)}</p>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="sticky top-0 bg-zinc-900 z-10">
            <tr className="border-b border-zinc-800 text-left text-[11px] text-zinc-500 uppercase tracking-wide">
              <th className="px-4 lg:px-6 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 lg:px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 lg:px-6 py-4 text-white font-medium">
                  {studentNames.get(h.student_id) ?? '—'}
                </td>
                <td className="px-4 py-4 text-zinc-300">{h.subject}</td>
                <td className="px-4 py-4">
                  <p className="text-zinc-400 text-xs">{formatSessionDate(h.start_time)}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    {formatTimeRange(h.start_time, h.end_time)}
                  </p>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <StatusBadge status={h.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="md:hidden px-4 py-3 text-xs text-zinc-600 border-t border-zinc-800/60 tabular-nums">
        {totalSessions} session{totalSessions === 1 ? '' : 's'} total
      </p>
    </>
  );
}
