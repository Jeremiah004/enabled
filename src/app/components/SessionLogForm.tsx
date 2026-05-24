'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { logSession } from '@/app/actions/logSession';
import type { LogSessionState } from '@/app/actions/logSession.types';
import { addMinutesToTime, previewSessionDuration } from '@/lib/sessions';

const logSessionInitialState: LogSessionState = { error: null, success: false };
import { SUBJECT_SUGGESTIONS } from '@/data/subjects';

type Student = { id: string; full_name: string };

const DURATION_PRESETS = [
  { label: '1 hr', minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr', minutes: 120 },
] as const;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

const inputClass =
  'w-full bg-zinc-800/80 border border-zinc-700/80 text-white text-base sm:text-sm rounded-xl px-3.5 py-3.5 sm:py-3 min-h-[48px] focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all';

const labelClass =
  'block text-xs font-medium text-zinc-400 mb-1.5';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold text-base sm:text-sm py-3.5 sm:py-3 rounded-xl shadow-lg shadow-emerald-500/15 transition-all min-h-[48px]"
    >
      {pending ? 'Saving session…' : 'Log session'}
    </button>
  );
}

export default function SessionLogForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [state, formAction] = useFormState(logSession, logSessionInitialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);

  const [date, setDate] = useState(todayISO);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const durationPreview = previewSessionDuration(date, startTime, endTime);

  useEffect(() => {
    if (state.success) {
      // Refresh server data (history table + stat cards) after save
      router.refresh();
      formRef.current?.reset();
      setDate(todayISO());
      setStartTime('');
      setEndTime('');
      setFormKey((k) => k + 1);
    }
  }, [state.success, router]);

  const startComplete = Boolean(startTime);
  const endComplete = Boolean(endTime);

  const applyPreset = (minutes: number) => {
    if (!startTime) return;
    const next = addMinutesToTime(startTime, minutes);
    if (next) setEndTime(next);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">New session</h2>
        <p className="text-zinc-500 text-sm mt-0.5">Fill in the class you just completed.</p>
      </div>

      <form ref={formRef} key={formKey} action={formAction} className="space-y-5">
        {state.error && (
          <div className="rounded-xl bg-red-950/50 border border-red-800/40 px-4 py-3">
            <p className="text-sm text-red-200">{state.error}</p>
          </div>
        )}
        {state.success && (
          <div className="rounded-xl bg-emerald-950/50 border border-emerald-800/40 px-4 py-3">
            <p className="text-sm text-emerald-200 font-medium">Session saved — you can log another below.</p>
          </div>
        )}

        <div>
          <label htmlFor="student_id" className={labelClass}>
            Student
          </label>
          <select id="student_id" name="student_id" required className={inputClass}>
            <option value="">Choose student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            list="subject-list"
            required
            placeholder="Mathematics, Coding, English…"
            className={inputClass}
          />
          <datalist id="subject-list">
            {SUBJECT_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="date" className={labelClass}>
            Session date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4 space-y-4">
          <p className="text-xs font-medium text-zinc-400">
            Class time — use your device clock for start and end
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className={labelClass}>
                Start time
              </label>
              <input
                id="start_time"
                name="start_time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`${inputClass} time-input`}
              />
            </div>
            <div>
              <label htmlFor="end_time" className={labelClass}>
                End time
              </label>
              <input
                id="end_time"
                name="end_time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`${inputClass} time-input`}
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] text-zinc-500 mb-2">Quick length (sets End from Start)</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={!startTime}
                  onClick={() => applyPreset(p.minutes)}
                  className="text-sm sm:text-xs font-medium px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-lg px-3 py-2.5 text-sm ${
              durationPreview.valid
                ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
                : startComplete || endComplete
                  ? 'bg-amber-500/10 border border-amber-500/25 text-amber-200'
                  : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-500'
            }`}
          >
            {durationPreview.valid ? (
              <span>
                Duration: <strong className="text-emerald-200">{durationPreview.label}</strong>
              </span>
            ) : (
              <span>{durationPreview.message}</span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="topics_covered" className={labelClass}>
            Topics covered
          </label>
          <textarea
            id="topics_covered"
            name="topics_covered"
            required
            rows={3}
            placeholder="What did you cover in this lesson?"
            className={`${inputClass} resize-y min-h-[88px]`}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
