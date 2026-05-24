import Link from 'next/link';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  const showSignupHint =
    searchParams?.error?.includes('Incorrect email') ||
    searchParams?.error?.includes('not confirmed');

  return (
    <div className="relative min-h-[100dvh] home-mesh flex items-center justify-center px-4 py-8 overflow-x-hidden safe-top safe-bottom">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4 shadow-xl shadow-emerald-500/25">
              <svg className="w-7 h-7 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your staff dashboard</p>
        </div>

        <div className="card-glow bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          {searchParams?.error && (
            <div className="mb-5 rounded-xl bg-red-950/50 border border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-200 leading-relaxed">{searchParams.error}</p>
              {showSignupHint && (
                <Link
                  href="/signup"
                  className="inline-block mt-3 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Create a new account instead →
                </Link>
              )}
            </div>
          )}

          {searchParams?.message && (
            <div className="mb-5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 px-4 py-3">
              <p className="text-sm text-emerald-200">{searchParams.message}</p>
            </div>
          )}

          <form action="/auth/login" method="POST" className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
            >
              Sign in
            </button>
            <p className="text-center text-xs text-zinc-500 leading-relaxed">
              You&apos;ll stay signed in on this device until you sign out.
            </p>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/60 pt-5 space-y-2">
            <p className="text-zinc-400 text-sm">
              New here?{' '}
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Create an account
              </Link>
            </p>
            <Link href="/tutor" className="block text-sm text-zinc-500 hover:text-emerald-400 transition-colors">
              Go to dashboard →
            </Link>
            <Link href="/" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
