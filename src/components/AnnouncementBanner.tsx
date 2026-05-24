import { getActiveAnnouncements } from '@/lib/announcements';

export default async function AnnouncementBanner() {
  const announcements = await getActiveAnnouncements();

  if (announcements.length === 0) return null;

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
