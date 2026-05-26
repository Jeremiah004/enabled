'use client';

import { useEffect, useState } from 'react';

type Announcement = {
  id: string;
  content: string;
};

function safeContent(content: unknown): string | null {
  if (content == null || typeof content !== 'string') return null;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function AnnouncementBannerClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/announcements/active', { cache: 'no-store' });
        const json = (await res.json()) as { announcements?: Announcement[] };
        if (cancelled) return;
        const rows = (json.announcements ?? [])
          .filter((a) => a?.id && safeContent(a.content))
          .map((a) => ({ id: a.id, content: safeContent(a.content)! }));
        setAnnouncements(rows);
      } catch {
        if (!cancelled) setAnnouncements([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || announcements.length === 0) return null;

  if (announcements.length === 1) {
    return (
      <div
        role="region"
        aria-label="Announcements"
        className="border-b border-default bg-[var(--accent-subtle)]/60 px-4 py-2.5"
      >
        <p className="text-sm text-primary text-center leading-snug max-w-4xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent mr-2">
            Notice
          </span>
          {announcements[0].content}
        </p>
      </div>
    );
  }

  if (announcements.length <= 3) {
    return (
      <div
        role="region"
        aria-label="Announcements"
        className="border-b border-default bg-[var(--accent-subtle)]/60 px-4 py-2 space-y-1.5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-accent text-center">
          Notices
        </p>
        <ul className="max-w-3xl mx-auto space-y-1">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="text-sm text-primary text-center leading-snug before:content-['•'] before:text-accent before:mr-2"
            >
              {a.content}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const marqueeItems = [...announcements, ...announcements];

  return (
    <div
      role="region"
      aria-label="Announcements"
      className="border-b border-default bg-[var(--accent-subtle)]/60 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent shrink-0">
          Notices
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="announcement-marquee-track flex w-max gap-10">
            {marqueeItems.map((a, i) => (
              <span key={`${a.id}-${i}`} className="text-sm text-primary whitespace-nowrap">
                {a.content}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
