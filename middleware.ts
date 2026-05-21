import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Bootstrap a mutable response so @supabase/ssr can write
  //       refreshed session cookies back to the browser.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── 2. Create a Supabase client that reads/writes cookies via the
  //       middleware response object (not next/headers, which is
  //       read-only at the edge).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mirror updated cookies onto both the forwarded request and
          // the outgoing response so downstream code stays in sync.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── 3. Refresh the session token. This is the primary reason
  //       middleware exists — do NOT remove this call.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 4. Helpers ──────────────────────────────────────────────────
  const isAdminPath = pathname.startsWith('/admin')
  const isTutorPath = pathname.startsWith('/tutor')
  const isProtectedPath = isAdminPath || isTutorPath
  const isLoginPath = pathname === '/login'
  const isHomePath = pathname === '/'

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url))

  // ── 5. Unauthenticated user → block protected routes ────────────
  if (!user && isProtectedPath) {
    return redirectTo('/login')
  }

  // ── 6. Authenticated user → enforce role-based access ───────────
  if (user) {
    // Fetch the role once per request (single lightweight query).
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as 'admin' | 'tutor' | undefined

    // 6a. Tutor trying to access /admin → bounce to /tutor
    if (role === 'tutor' && isAdminPath) {
      return redirectTo('/tutor')
    }

    // 6b. Admin trying to access /tutor (optional guard, symmetric with above)
    if (role === 'admin' && isTutorPath) {
      return redirectTo('/admin')
    }

    // 6c. Logged-in user on / or /login → send to dashboard
    if (isLoginPath || isHomePath) {
      if (role === 'admin') return redirectTo('/admin')
      if (role === 'tutor') return redirectTo('/tutor')
      // Unknown/missing role — let them reach login so they can sort it out.
    }
  }

  // ── 7. All checks passed — return the (possibly cookie-updated) response.
  return response
}

// ── Matcher ──────────────────────────────────────────────────────────────────
// Run middleware on every route EXCEPT:
//   • Next.js internals  (_next/static, _next/image)
//   • Public static assets (favicon, images, fonts, etc.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)',
  ],
}