import Link from 'next/link';

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md safe-top">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="group min-w-0">
          <p className="text-sm font-semibold text-white tracking-tight truncate">
            Enabled Multi Concept
          </p>
          <p className="text-[10px] text-zinc-500 tracking-[0.15em] uppercase mt-0.5 hidden sm:block">
            Operations Portal
          </p>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white px-3 py-2.5 min-h-[44px] flex items-center transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 rounded-sm min-h-[44px] flex items-center transition-colors"
          >
            Staff access
          </Link>
        </nav>
      </div>
    </header>
  );
}
