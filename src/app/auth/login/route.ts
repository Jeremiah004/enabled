import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalizeEmail((formData.get('email') as string) ?? '');
  const password = (formData.get('password') as string) ?? '';

  if (!email || !password) {
    return NextResponse.redirect(
      new URL('/login?error=Please+enter+your+email+and+password.', request.url)
    );
  }

  // Mutable response so Supabase can attach session cookies (stay logged in)
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(mapAuthError(error.message))}`,
        request.url
      )
    );
  }

  if (!data.user) {
    return NextResponse.redirect(
      new URL('/login?error=Sign-in+failed.+Please+try+again.', request.url)
    );
  }

  const result = await completeSignIn(supabase, data.user);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url)
    );
  }

  return redirectWithCookies(request, result.path, cookieResponse);
}
