'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { announcementActionInitialState } from '@/app/actions/announcements.types';
import {
  createAnnouncement,
  deleteAnnouncement,
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

function DeleteAnnouncementButton({ announcementId }: { announcementId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    startTransition(async () => {
      const result = await deleteAnnouncement(announcementId);
      if (!result.ok) {
        window.alert(result.error ?? 'Could not delete announcement.');
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
      title="Delete announcement"
      aria-label="Delete announcement"
      className="inline-flex items-center justify-center text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400/50 px-2.5 py-2.5 rounded-xl transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50"
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
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={toggleAnnouncementActive}>
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
                    <DeleteAnnouncementButton announcementId={a.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
