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

const FEATURES = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
      />
    ),
    title: 'Log every session',
    desc: 'Student, subject, date, times, and topics — one fast form.',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
    title: 'Hours at a glance',
    desc: 'Live totals for sessions logged and time worked.',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25m2.25 0v.75a.75.75 0 0 1-.75.75H21m-1.5 0h-15m0 0v3.375c0 .621.504 1.125 1.125 1.125h15.75c.621 0 1.125-.504 1.125-1.125V8.25m-16.5 0h16.5"
      />
    ),
    title: 'Payment visibility',
    desc: 'See PAID vs UNPAID status on your personal dashboard.',
  },
];

const STATS = [
  { value: '11+', label: 'Students on roster' },
  { value: 'Live', label: 'Session tracking' },
  { value: '24/7', label: 'Portal access' },
];

export default function HomePage() {
  const urgentCount = ANNOUNCEMENTS.filter((a) => a.priority === 'urgent').length;

  return (
    <div className="relative min-h-screen home-mesh text-white overflow-x-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <div className="absolute top-32 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />

      <HomeHeader />

      <main className="relative">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">
                  Academy staff portal — now live
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] text-gradient">
                Teach brilliantly. Track effortlessly.
              </h1>
              <p className="text-zinc-400 text-lg mt-6 leading-relaxed max-w-lg">
                Replace manual spreadsheets with real-time session logs, hour totals, and
                payment status — built for Enabled Multi Concept tutors and admins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  Create staff account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/tutor"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-zinc-600 text-white font-medium text-sm transition-all"
                >
                  Go to dashboard
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-zinc-800/80">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-3xl blur-2xl opacity-50" />
              <div className="relative card-glow rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 backdrop-blur-sm transition-shadow">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                    Tutor dashboard preview
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {['12', '18.5', '4'].map((val, i) => (
                    <div key={i} className="rounded-lg bg-zinc-800/80 border border-zinc-700/50 p-3 text-center">
                      <p className="text-xl font-bold text-white">{val}</p>
                      <p className="text-[9px] text-zinc-500 uppercase mt-1">
                        {['Sessions', 'Hours', 'Unpaid'][i]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Mathematics — Daniella', 'Coding — Emmanuel', 'English — Destiny'].map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-between text-xs py-2.5 px-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30"
                    >
                      <span className="text-zinc-300">{row}</span>
                      <span className="text-amber-400 font-medium">UNPAID</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <p className="text-center text-xs font-semibold text-emerald-500/90 uppercase tracking-[0.2em] mb-3">
            How it works
          </p>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-10">
            Everything tutors need in one place
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group card-glow rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all duration-300 hover:border-emerald-500/30"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-10 card-glow">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Announcements</h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Important updates for tutors and staff
                  {urgentCount > 0 && (
                    <span className="ml-2 text-amber-400">
                      · {urgentCount} urgent
                    </span>
                  )}
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium shrink-0"
              >
                Sign in to view your dashboard →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {ANNOUNCEMENTS.map((a) => (
                <article
                  key={a.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    a.priority === 'urgent'
                      ? 'bg-gradient-to-br from-amber-950/40 to-zinc-900/80 border-amber-700/40 hover:border-amber-600/50'
                      : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-white leading-snug">{a.title}</h3>
                    {a.priority === 'urgent' ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Urgent
                      </span>
                    ) : (
                      <time className="shrink-0 text-[10px] text-zinc-500">
                        {formatAnnouncementDate(a.date)}
                      </time>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{a.body}</p>
                  {a.priority === 'urgent' && (
                    <time className="block text-[10px] text-amber-500/80 mt-3">
                      {formatAnnouncementDate(a.date)}
                    </time>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t border-zinc-800/80 bg-zinc-900/30">
          <div className="max-w-6xl mx-auto px-6 py-14 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Ready to log your first session?</h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto">
              New tutors can register in under a minute. Already have an account? Sign in below.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-colors"
              >
                Register now
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-lg text-zinc-300 hover:text-white text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-zinc-800/60 py-8 bg-zinc-950">
        <p className="text-center text-zinc-600 text-xs max-w-md mx-auto px-6">
          Enabled Multi Concept · Authorized staff only · Contact your administrator for access issues
        </p>
      </footer>
    </div>
  );
}
