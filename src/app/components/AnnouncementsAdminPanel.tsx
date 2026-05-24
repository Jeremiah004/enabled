'use client';

import { useFormState, useFormStatus } from 'react-dom';
import {
  announcementActionInitialState,
  createAnnouncement,
  toggleAnnouncementActive,
} from '@/app/actions/announcements';
import {
  isAnnouncementCurrentlyVisible,
  type AnnouncementRow,
} from '@/lib/announcements.types';

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary font-semibold text-sm px-6 py-3 rounded-xl min-h-[48px] hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Publishing…' : 'Publish announcement'}
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnnouncementsAdminPanel({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const [createState, createAction] = useFormState(
    createAnnouncement,
    announcementActionInitialState
  );

  const activeVisible = announcements.filter(isAnnouncementCurrentlyVisible);

  return (
    <div className="space-y-8">
      {activeVisible.length > 0 && (
        <section className="rounded-2xl border border-default bg-[var(--accent-subtle)]/40 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-primary mb-3">Live preview (staff banner)</h2>
          {activeVisible.length === 1 ? (
            <p className="text-sm text-primary leading-relaxed">{activeVisible[0].content}</p>
          ) : (
            <ul className="space-y-2">
              {activeVisible.map((a) => (
                <li key={a.id} className="text-sm text-primary leading-relaxed flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  <span>{a.content}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-default bg-elevated p-4 sm:p-6 md:p-7 card-glow max-w-2xl">
        <h2 className="text-lg font-semibold text-primary">New announcement</h2>
        <p className="text-muted text-sm mt-1">
          Shown at the top of the dashboard for all signed-in tutors and admins.
        </p>

        <form action={createAction} className="mt-6 space-y-4">
          {createState.error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200">{createState.error}</p>
            </div>
          )}
          {createState.success && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">Announcement published.</p>
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Message
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={3}
              placeholder="e.g. Payroll submissions close Friday at 5pm."
              className="w-full input-field rounded-xl px-4 py-3 text-sm resize-y min-h-[88px]"
            />
          </div>

          <div>
            <label htmlFor="expiry_date" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Expiry (optional)
            </label>
            <input
              id="expiry_date"
              name="expiry_date"
              type="datetime-local"
              className="w-full input-field rounded-xl px-4 py-3 text-sm min-h-[48px]"
            />
            <p className="text-xs text-subtle mt-1.5">Leave empty to show until you turn it off.</p>
          </div>

          <CreateButton />
        </form>
      </section>

      <section className="rounded-2xl border border-default bg-elevated overflow-hidden card-glow">
        <div className="px-4 sm:px-6 py-4 border-b border-default">
          <h2 className="text-sm font-semibold text-primary">All announcements</h2>
          <p className="text-xs text-muted mt-0.5">{announcements.length} total</p>
        </div>

        {announcements.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted text-center">No announcements yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {announcements.map((a) => {
              const visible = isAnnouncementCurrentlyVisible(a);
              return (
                <li key={a.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-primary leading-relaxed">{a.content}</p>
                    <p className="text-xs text-subtle mt-2">
                      Created {formatDate(a.created_at)}
                      {a.expiry_date && (
                        <> · Expires {formatDate(a.expiry_date)}</>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                          a.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted text-subtle border border-default'
                        }`}
                      >
                        {a.is_active ? 'Active' : 'Hidden'}
                      </span>
                      {a.is_active && !visible && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Expired
                        </span>
                      )}
                      {visible && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-[var(--accent-subtle)] text-accent border border-[var(--nav-active-border)]">
                          On banner
                        </span>
                      )}
                    </div>
                  </div>
                  <form action={toggleAnnouncementActive} className="shrink-0">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="is_active" value={String(!a.is_active)} />
                    <button
                      type="submit"
                      className={`text-sm font-medium px-4 py-2.5 rounded-xl border min-h-[44px] transition-colors ${
                        a.is_active
                          ? 'border-default text-muted hover:text-primary hover:bg-muted'
                          : 'border-[var(--nav-active-border)] text-accent hover:opacity-80'
                      }`}
                    >
                      {a.is_active ? 'Hide' : 'Show'}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
