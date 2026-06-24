import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { completeSignIn } from '@/lib/auth';
import { mapAuthError, normalizeEmail } from '@/lib/auth-errors';

function redirectWithCookies(
  request: NextRequest,
  path: string,
  cookieResponse: NextResponse
) {
  const url = new URL(path, request.url);
  const redirect = NextResponse.redirect(url);
  cookieResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirect;
}

function signupErrorRedirect(request: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/signup?error=${encodeURIComponent(message)}`, request.url)
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = ((formData.get('name') as string) ?? '').trim();
  const email = normalizeEmail((formData.get('email') as string) ?? '');
  const password = (formData.get('password') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

  if (!name || !email || !password) {
    return signupErrorRedirect(request, 'Please fill in all fields.');
  }

  if (password.length < 6) {
    return signupErrorRedirect(request, 'Password must be at least 6 characters.');
  }

  if (password !== confirmPassword) {
    return signupErrorRedirect(request, 'Passwords do not match.');
  }

  let cookieResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookieResponse = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const finishSignUp = async (user: User) => {
    const result = await completeSignIn(supabase, user, name);
    if (!result.ok) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }
    return redirectWithCookies(request, result.path, cookieResponse);
  };

  const signInWithNewAccount = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      return finishSignUp(data.user);
    }
    return null;
  };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    const isDuplicate =
      error.message.includes('already registered') ||
      error.message.includes('already been registered');

    if (isDuplicate) {
      const recovered = await signInWithNewAccount();
      if (recovered) return recovered;
    }

    return signupErrorRedirect(request, mapAuthError(error.message));
  }

  // Supabase returns empty identities for duplicate emails (anti-enumeration).
  // If the account was just created (e.g. double submit), signing in succeeds.
  if (data.user && data.user.identities?.length === 0) {
    const recovered = await signInWithNewAccount();
    if (recovered) return recovered;

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('This email is already registered. Sign in with your password.')}`,
        request.url
      )
    );
  }

  if (data.session && data.user) {
    return finishSignUp(data.user);
  }

  if (data.user) {
    const recovered = await signInWithNewAccount();
    if (recovered) return recovered;
  }

  return NextResponse.redirect(
    new URL(
      `/login?message=${encodeURIComponent('Account created. Sign in with your email and password.')}`,
      request.url
    )
  );
}
