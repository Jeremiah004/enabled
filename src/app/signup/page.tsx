import { createClient } from '@/lib/supabase/server';
import { completeSignIn } from '@/lib/auth';
import { mapAuthError, normalizeEmail } from '@/lib/auth-errors';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  const signUpAction = async (formData: FormData) => {
    'use server';
    const name = (formData.get('name') as string).trim();
    const email = normalizeEmail(formData.get('email') as string);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password) {
      return redirect('/signup?error=Please+fill+in+all+fields.');
    }

    if (password.length < 6) {
      return redirect('/signup?error=Password+must+be+at+least+6+characters.');
    }

    if (password !== confirmPassword) {
      return redirect('/signup?error=Passwords+do+not+match.');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      return redirect(`/signup?error=${encodeURIComponent(mapAuthError(error.message))}`);
    }

    if (data.user?.identities?.length === 0) {
      return redirect(
        `/login?error=${encodeURIComponent('This email is already registered. Sign in with your password.')}`
      );
    }

    const finish = async (user: NonNullable<typeof data.user>) => {
      const result = await completeSignIn(supabase, user, name);
      if (result.ok) return redirect(result.path);
      return redirect(`/login?error=${encodeURIComponent(result.error)}`);
    };

    if (data.session && data.user) {
      return finish(data.user);
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.user) {
      return finish(signInData.user);
    }

    return redirect(
      '/login?message=' +
        encodeURIComponent(
          'Account created. Sign in with your email and password below.'
        )
    );
  };

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
            </div>
          )}

          <form action={signUpAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
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
                placeholder="you@enabledmulti.com"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl input-field px-4 py-3 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary font-semibold text-sm py-3 rounded-xl mt-2 shadow-lg transition-all hover:opacity-90"
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