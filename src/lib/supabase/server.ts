import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-safe Supabase client for use in:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers (app/api/...)
 *
 * Must be called inside an async context where `cookies()` is available.
 *
 * Usage:
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('sessions').select('*')
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // `setAll` is called from a Server Component where cookies
            // cannot be set. Safe to ignore if you have a middleware
            // refreshing sessions (recommended).
          }
        },
      },
    }
  )
}