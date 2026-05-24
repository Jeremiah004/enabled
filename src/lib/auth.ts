import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import {
  getDashboardPath,
  normalizeRole,
  type StaffRole,
  type UserRole,
} from '@/lib/roles';

export type { UserRole, StaffRole };
export { getDashboardPath, normalizeRole };

export type Profile = {
  role: UserRole | null;
  full_name: string | null;
  email?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
};

export type SessionUser = {
  user: User;
  profile: Profile | null;
  role: UserRole | null;
};

export function isStaffRole(role: UserRole | null | undefined): role is StaffRole {
  return role === 'ADMIN' || role === 'TUTOR';
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
    .select('role, full_name, email, bank_name, account_number, account_name')
    .eq('id', user.id)
    .maybeSingle();

  const role = normalizeRole(profile?.role ?? null);

  return {
    user,
    profile: profile
      ? {
          role,
          full_name: profile.full_name ?? null,
          email: profile.email ?? null,
          bank_name: profile.bank_name ?? null,
          account_number: profile.account_number ?? null,
          account_name: profile.account_name ?? null,
        }
      : null,
    role,
  };
}

/** Redirects to login if unauthenticated, or to the user's dashboard if role is not allowed. */
export async function requireRole(allowed: UserRole[]): Promise<SessionUser> {
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
    role: 'TUTOR',
  });

  if (error) {
    console.error('[ensureProfile] insert failed:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Resolve role from profiles using the active Supabase client. */
export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return normalizeRole(profile?.role ?? null);
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
        'Signed in, but your staff profile could not be created. Run supabase/setup-profiles.sql and supabase/migrate-rbac-payout.sql in the Supabase SQL Editor, then try again.',
    };
  }

  const role = await getProfileRole(supabase, user.id);
  if (!role) {
    return {
      ok: false,
      error:
        'Signed in, but no role is assigned. Run supabase/migrate-rbac-payout.sql, or set your role to ADMIN/TUTOR in the profiles table.',
    };
  }

  return { ok: true, path: getDashboardPath(role) };
}
