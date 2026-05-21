import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export type StaffRole = 'admin' | 'tutor';

export type Profile = {
  role: StaffRole | null;
  full_name: string | null;
};

export type SessionUser = {
  user: User;
  profile: Profile | null;
  role: StaffRole | null;
};

export function getDashboardPath(role: StaffRole | null | undefined): string {
  if (role === 'admin') return '/admin';
  if (role === 'tutor') return '/tutor';
  return '/login';
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const role: StaffRole | null =
    profile?.role === 'admin' || profile?.role === 'tutor' ? profile.role : null;

  return {
    user,
    profile: profile
      ? { role, full_name: profile.full_name ?? null }
      : null,
    role,
  };
}

/** Redirects to login if unauthenticated, or to the user's dashboard if role is not allowed. */
export async function requireRole(allowed: StaffRole[]): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  if (!session.role || !allowed.includes(session.role)) {
    redirect(getDashboardPath(session.role));
  }
  return session;
}

export async function redirectToDashboard(): Promise<never> {
  const session = await getSessionUser();
  redirect(getDashboardPath(session?.role ?? null));
}

/** Creates a tutor profile on first sign-up if the DB trigger has not run yet. */
export async function ensureProfile(
  user: User,
  fullName?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) return { ok: true };

  const name =
    fullName ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'User';

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: name,
    email: user.email,
    role: 'tutor',
  });

  if (error) {
    console.error('[ensureProfile] insert failed:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Resolve staff role from profiles using the active Supabase client. */
export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string
): Promise<StaffRole | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.role === 'admin' || profile?.role === 'tutor' ? profile.role : null;
}

/** After sign-in: ensure profile exists and return dashboard path. */
export async function completeSignIn(
  supabase: SupabaseClient,
  user: User,
  fullName?: string
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const profileResult = await ensureProfile(user, fullName);
  if (!profileResult.ok) {
    return {
      ok: false,
      error:
        'Signed in, but your staff profile could not be created. Run supabase/setup-profiles.sql in the Supabase SQL Editor, then try again.',
    };
  }

  const role = await getProfileRole(supabase, user.id);
  if (!role) {
    return {
      ok: false,
      error:
        'Signed in, but no role is assigned. Run supabase/setup-profiles.sql, or set your role to tutor/admin in the profiles table.',
    };
  }

  return { ok: true, path: getDashboardPath(role) };
}
