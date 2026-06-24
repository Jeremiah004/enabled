import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import PasswordInput from '@/components/PasswordInput';

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  return (
    <div className="relative min-h-[100dvh] home-mesh flex items-center justify-center px-4 overflow-x-hidden py-8 sm:py-12 safe-top safe-bottom">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="full" size="lg" href="/" priority />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Join the team</h1>
          <p className="text-muted text-sm mt-1">Create your tutor staff account</p>
        </div>

        <div className="card-glow bg-elevated border border-default rounded-2xl p-8 backdrop-blur-sm">
          {searchParams?.error && (
            <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{searchParams.error}</p>
              {searchParams.error.includes('already registered') && (
                <Link
                  href="/login"
                  className="inline-block mt-3 text-sm font-medium text-accent hover:opacity-80"
                >
                  Sign in instead →
                </Link>
              )}
            </div>
          )}

          <form action="/auth/signup" method="POST" className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="John Doe"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@enabledmulti.com"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="w-full btn-primary font-semibold text-sm py-3 rounded-xl mt-2 shadow-lg transition-all hover:opacity-90 min-h-[48px]"
            >
              Create account
            </button>
          </form>

          <div className="mt-6 text-center border-t border-default pt-5 space-y-2">
            <p className="text-muted text-sm">
              Already registered?{' '}
              <Link href="/login" className="text-accent hover:opacity-80 font-semibold">
                Sign in
              </Link>
            </p>
            <Link href="/" className="block text-xs text-subtle hover:text-muted transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
