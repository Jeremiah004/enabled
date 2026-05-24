import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { normalizeRole, type UserRole } from '@/lib/roles'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminPath = pathname.startsWith('/admin')
  const isTutorPath = pathname.startsWith('/tutor')
  const isProtectedPath = isAdminPath || isTutorPath
  const isLoginPath = pathname === '/login'
  const isSignupPath = pathname === '/signup'
  const isHomePath = pathname === '/'

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url))

  if (!user && isProtectedPath) {
    return redirectTo('/login')
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role: UserRole | null = normalizeRole(profile?.role ?? null)

    if (role === 'TUTOR' && isAdminPath) {
      return redirectTo('/tutor')
    }

    if (role === 'ADMIN' && isTutorPath) {
      return redirectTo('/admin')
    }

    if (role === 'PARENT' && isProtectedPath) {
      return redirectTo('/')
    }

    if (isLoginPath || isSignupPath) {
      if (role === 'ADMIN') return redirectTo('/admin')
      if (role === 'TUTOR') return redirectTo('/tutor')
      if (role === 'PARENT') return redirectTo('/')
    }

    if (isHomePath && role === 'ADMIN') {
      return redirectTo('/admin')
    }

    if (isHomePath && role === 'TUTOR') {
      return redirectTo('/tutor')
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)',
  ],
}
