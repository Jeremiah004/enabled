'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createStudentInitialState } from '@/app/actions/students.types';
import { createStudent } from '@/app/actions/students';
import type { StudentOption } from '@/lib/students';

function AddStudentButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary font-semibold text-sm px-6 py-3 rounded-xl min-h-[48px] hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Adding…' : 'Add student'}
    </button>
  );
}

export default function StudentsAdminPanel({
  students,
  totalCount,
}: {
  students: StudentOption[];
  totalCount: number | null;
}) {
  const [state, formAction] = useFormState(createStudent, createStudentInitialState);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-default bg-elevated p-4 sm:p-6 md:p-7 card-glow max-w-2xl">
        <h2 className="text-lg font-semibold text-primary">Add new student</h2>
        <p className="text-muted text-sm mt-1">
          New names appear immediately in the tutor session log dropdown.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {state.error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
            </div>
          )}
          {state.success && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3">
              <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                Student added successfully.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="full_name"
              className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="e.g. Daniel Femi"
              className="w-full input-field rounded-xl px-4 py-3 text-sm min-h-[48px]"
            />
          </div>

          <AddStudentButton />
        </form>
      </section>

      <section className="rounded-2xl border border-default bg-elevated overflow-hidden card-glow">
        <div className="px-4 sm:px-6 py-4 border-b border-default flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-primary">All students</h2>
            <p className="text-xs text-muted mt-0.5">
              {students.length} shown
              {totalCount != null && totalCount !== students.length
                ? ` · ${totalCount} in database`
                : ''}
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted text-center">
            No students yet. Add the first name above.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] max-h-[min(60vh,520px)] overflow-y-auto">
            {students.map((s) => (
              <li
                key={s.id}
                className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium text-primary">{s.full_name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
