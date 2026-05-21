'use client';

import { useEffect, useState } from 'react';
import {
  MINUTE_OPTIONS,
  time12To24,
  time24To12,
  type Time12Parts,
} from '@/lib/sessions';

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

const emptyParts: Time12Parts = { hour: '', minute: '', period: 'PM' };

const selectClass =
  'w-full rounded-lg border bg-zinc-800 text-white text-sm font-medium py-2.5 pl-3 pr-8 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500';

type TimePicker12hProps = {
  label: string;
  name: string;
  value24: string;
  onChange24: (value: string) => void;
};

function partsToDisplay(parts: Time12Parts): string {
  const h = parts.hour || '—';
  const m = parts.minute || '—';
  return `${h}:${m} ${parts.period}`;
}

export default function TimePicker12h({
  label,
  name,
  value24,
  onChange24,
}: TimePicker12hProps) {
  const [parts, setParts] = useState<Time12Parts>(() => {
    if (value24) return time24To12(value24) ?? { ...emptyParts };
    return { ...emptyParts };
  });

  // Sync when parent sets time (e.g. "1.5 hr" preset on end time)
  useEffect(() => {
    if (value24) {
      const parsed = time24To12(value24);
      if (parsed) setParts(parsed);
    }
  }, [value24]);

  const update = (next: Partial<Time12Parts>) => {
    const merged = { ...parts, ...next };
    setParts(merged);

    if (merged.hour && merged.minute) {
      const t24 = time12To24(merged.hour, merged.minute, merged.period);
      onChange24(t24 ?? '');
    } else {
      onChange24('');
    }
  };

  const isComplete = Boolean(parts.hour && parts.minute);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-400">{label}</p>

      {/* Large display — always shows what you picked */}
      <div
        className={`rounded-xl border-2 px-4 py-3 text-center transition-all ${
          isComplete
            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-100'
            : 'border-zinc-600 bg-zinc-800/80 text-zinc-400'
        }`}
        aria-live="polite"
      >
        <span className="text-xl font-bold tabular-nums tracking-wide">
          {partsToDisplay(parts)}
        </span>
      </div>

      <input type="hidden" name={name} value={value24} readOnly />

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1 block">
            Hour
          </span>
          <select
            aria-label={`${label} hour`}
            value={parts.hour}
            onChange={(e) => update({ hour: e.target.value })}
            className={`${selectClass} ${
              parts.hour ? 'border-emerald-600/60' : 'border-zinc-600'
            }`}
          >
            <option value="" disabled>
              —
            </option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1 block">
            Min
          </span>
          <select
            aria-label={`${label} minute`}
            value={parts.minute}
            onChange={(e) => update({ minute: e.target.value })}
            className={`${selectClass} ${
              parts.minute ? 'border-emerald-600/60' : 'border-zinc-600'
            }`}
          >
            <option value="" disabled>
              —
            </option>
            {MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1 block">
            AM/PM
          </span>
          <select
            aria-label={`${label} AM or PM`}
            value={parts.period}
            onChange={(e) => update({ period: e.target.value as 'AM' | 'PM' })}
            className={`${selectClass} border-emerald-600/40`}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}
