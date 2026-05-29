'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { processBulkPayouts } from '@/app/actions/processPayouts';
import { downloadPayrollCsv, type UnpaidPayrollExportRow } from '@/lib/payroll-csv';

export default function ProcessPayoutsButton({
  unpaidCount,
  outstandingLabel,
  unpaidPayrollRows,
}: {
  unpaidCount: number;
  outstandingLabel: string;
  unpaidPayrollRows: UnpaidPayrollExportRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    skipped?: string[];
  } | null>(null);

  function handleProcessPayouts() {
    if (unpaidCount === 0) {
      window.alert('There are no unpaid sessions to process.');
      return;
    }

    const confirmed = window.confirm(
      `Process payouts for ${unpaidCount} unpaid session(s) (${outstandingLabel} total)?\n\nThis will initiate Paystack bulk transfers to tutors with bank details on file.`
    );
    if (!confirmed) return;

    setFeedback(null);

    startTransition(async () => {
      const result = await processBulkPayouts();

      if (result.ok) {
        setFeedback({
          type: 'success',
          message: result.message,
          skipped: result.skippedTutors,
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
          skipped: result.skippedTutors,
        });
      }
    });
  }

  function handleExportCsv() {
    if (unpaidPayrollRows.length === 0) {
      window.alert('There are no unpaid tutors to export.');
      return;
    }

    downloadPayrollCsv(unpaidPayrollRows);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleProcessPayouts}
          disabled={pending || unpaidCount === 0}
          className="btn-primary font-semibold text-sm px-6 py-3 rounded-xl min-h-[48px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Processing payouts…' : 'Process Payouts'}
        </button>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={pending || unpaidPayrollRows.length === 0}
          className="text-sm font-medium text-muted hover:text-primary border border-default bg-transparent px-4 py-3 rounded-xl min-h-[48px] transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-200'
          }`}
        >
          <p>{feedback.message}</p>
          {feedback.skipped && feedback.skipped.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs opacity-90 list-disc pl-4">
              {feedback.skipped.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
