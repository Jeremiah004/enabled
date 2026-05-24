import { createClient } from '@/lib/supabase/server';
import { completeSignIn } from '@/lib/auth';
import { mapAuthError, normalizeEmail } from '@/lib/auth-errors';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4 shadow-xl shadow-emerald-500/25">
              <svg className="w-7 h-7 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Join the team</h1>
          <p className="text-zinc-500 text-sm mt-1">Create your tutor staff account</p>
        </div>

        <div className="card-glow bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          {searchParams?.error && (
            <div className="mb-5 rounded-xl bg-red-950/50 border border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-200 leading-relaxed">{searchParams.error}</p>
            </div>
          )}

          <form action={signUpAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@enabledmulti.com"
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
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm py-3 rounded-xl mt-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Create account
            </button>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/60 pt-5 space-y-2">
            <p className="text-zinc-400 text-sm">
              Already registered?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Sign in
              </Link>
            </p>
            <Link href="/" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}