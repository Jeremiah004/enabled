import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import PasswordInput from '@/components/PasswordInput';

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
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="full" size="lg" href="/" priority />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Welcome back</h1>
          <p className="text-muted text-sm mt-1">Sign in to your staff dashboard</p>
        </div>

        <div className="card-glow bg-elevated border border-default rounded-2xl p-8 backdrop-blur-sm">
          {searchParams?.error && (
            <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{searchParams.error}</p>
              {showSignupHint && (
                <Link
                  href="/signup"
                  className="inline-block mt-3 text-sm font-medium text-accent hover:opacity-80"
                >
                  Create a new account instead →
                </Link>
              )}
            </div>
          )}

          {searchParams?.message && (
            <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{searchParams.message}</p>
            </div>
          )}

          <form action="/auth/login" method="POST" className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="w-full btn-primary font-semibold text-sm py-3 rounded-xl shadow-lg transition-all hover:opacity-90"
            >
              Sign in
            </button>
            <p className="text-center text-xs text-muted leading-relaxed">
              You&apos;ll stay signed in on this device until you sign out.
            </p>
          </form>

          <div className="mt-6 text-center border-t border-default pt-5 space-y-2">
            <p className="text-muted text-sm">
              New here?{' '}
              <Link href="/signup" className="text-accent hover:opacity-80 font-semibold">
                Create an account
              </Link>
            </p>
            <Link href="/tutor" className="block text-sm text-subtle hover:text-accent transition-colors">
              Go to dashboard →
            </Link>
            <Link href="/" className="block text-xs text-subtle hover:text-muted transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
