import Link from 'next/link';
import HomeHeader from '@/app/components/HomeHeader';
import { ANNOUNCEMENTS } from '@/data/announcements';

function formatAnnouncementDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const PILLARS = [
  {
    num: '01',
    title: 'Session auditing',
    desc: 'Every lesson is logged with student, subject, duration, and topics — creating a disciplined record tutors and leadership can trust.',
  },
  {
    num: '02',
    title: 'Payroll governance',
    desc: 'Administrators review hours, approve payouts, and maintain clear PAID versus outstanding status across the faculty.',
  },
  {
    num: '03',
    title: 'Parent visibility',
    desc: 'Built for transparency between academy operations and families — with a foundation ready for parent-facing reporting.',
  },
];

export default function HomePage() {
  const urgentCount = ANNOUNCEMENTS.filter((a) => a.priority === 'urgent').length;

  return (
    <div className="academy-page min-h-screen text-zinc-100 overflow-x-hidden">
      <HomeHeader />

      <main>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-emerald-500/90 mb-8">
            Enabled Multi Concept · Staff &amp; Operations
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.08] text-white max-w-3xl">
            Operational excellence for an elite learning environment.
          </h1>

          <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl font-light">
            A single portal for seamless session auditing, professional administrative
            tracking, and accountable tutor compensation — designed for leadership, faculty,
            and the families you serve.
          </p>

          <div className="academy-rule w-full max-w-md my-10 sm:my-12" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm tracking-wide transition-colors min-h-[48px]"
            >
              Staff sign in
            </Link>
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-sm border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white font-medium text-sm transition-colors min-h-[48px]"
            >
              Open dashboard
            </Link>
          </div>
        </section>

        <section className="border-y border-zinc-800/80 bg-zinc-950/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 mb-4">Our mandate</p>
            <p className="font-serif text-2xl sm:text-3xl text-zinc-200 leading-snug max-w-3xl">
              Replace informal spreadsheets with a governed system — where every hour taught
              is documented, reviewed, and settled with professionalism.
            </p>

            <div className="mt-14 sm:mt-16 grid gap-10 sm:gap-12 md:grid-cols-3">
              {PILLARS.map((p) => (
                <div key={p.num} className="border-l border-emerald-500/30 pl-5">
                  <span className="text-xs text-emerald-500/80 font-mono tabular-nums">{p.num}</span>
                  <h3 className="font-serif text-xl text-white mt-2">{p.title}</h3>
                  <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white">Academy notices</h2>
              <p className="text-zinc-500 text-sm mt-2">
                Official communications for tutors and administrative staff
                {urgentCount > 0 && (
                  <span className="text-amber-400/90"> · {urgentCount} requiring attention</span>
                )}
              </p>
            </div>
            <Link
              href="/signup"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium shrink-0"
            >
              New staff registration →
            </Link>
          </div>

          <div className="space-y-4">
            {ANNOUNCEMENTS.map((a) => (
              <article
                key={a.id}
                className={`rounded-sm border px-5 py-5 sm:px-6 sm:py-6 ${
                  a.priority === 'urgent'
                    ? 'border-amber-800/40 bg-amber-950/20'
                    : 'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h3 className="text-base font-medium text-white">{a.title}</h3>
                  <time className="text-xs text-zinc-500 tabular-nums">
                    {formatAnnouncementDate(a.date)}
                  </time>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{a.body}</p>
                {a.priority === 'urgent' && (
                  <p className="text-[10px] uppercase tracking-widest text-amber-500/80 mt-3">
                    Priority notice
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
            <h2 className="font-serif text-xl sm:text-2xl text-white">
              Authorized personnel only
            </h2>
            <p className="text-zinc-500 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Tutors log sessions from any device. Administrators oversee payroll from a
              dedicated command centre. Contact your academy director for access.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm min-h-[44px] inline-flex items-center"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-sm border border-zinc-700 text-zinc-300 hover:text-white text-sm font-medium min-h-[44px] inline-flex items-center"
              >
                Register as staff
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/60 py-8">
        <p className="text-center text-zinc-600 text-xs max-w-lg mx-auto px-6 leading-relaxed">
          Enabled Multi Concept · Private academy operations portal · Session records and
          payroll data are confidential
        </p>
      </footer>
    </div>
  );
}
