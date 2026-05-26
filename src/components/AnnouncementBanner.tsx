import { getActiveAnnouncements } from '@/lib/announcements';

function safeContent(content: unknown): string | null {
  if (content == null || typeof content !== 'string') return null;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function AnnouncementBanner() {
  let announcements: Awaited<ReturnType<typeof getActiveAnnouncements>> = [];

  try {
    const rows = await getActiveAnnouncements();
    announcements = (rows ?? [])
      .filter((row) => row && typeof row.id === 'string')
      .map((row) => ({
        ...row,
        content: safeContent(row.content) ?? '',
      }))
      .filter((row) => row.content.length > 0);
  } catch (err) {
    console.error('[AnnouncementBanner]', err);
    return null;
  }

  if (!announcements || announcements.length === 0) return null;

  if (announcements.length === 1) {
    const text = safeContent(announcements[0]?.content);
    if (!text) return null;

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
          {text}
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
          {announcements.map((a) => {
            const text = safeContent(a?.content);
            if (!text || !a?.id) return null;
            return (
              <li
                key={a.id}
                className="text-sm text-primary text-center leading-snug before:content-['•'] before:text-accent before:mr-2"
              >
                {text}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const marqueeItems = [...announcements, ...announcements].filter(
    (a) => a?.id && safeContent(a?.content)
  );

  if (marqueeItems.length === 0) return null;

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
                {safeContent(a.content)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
