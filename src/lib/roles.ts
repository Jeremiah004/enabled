export type UserRole = 'ADMIN' | 'TUTOR' | 'PARENT';

export type StaffRole = 'ADMIN' | 'TUTOR';

/** Normalize DB role strings (supports legacy lowercase during migration). */
export function normalizeRole(raw: string | null | undefined): UserRole | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'ADMIN' || upper === 'TUTOR' || upper === 'PARENT') return upper;
  return null;
}

export function getDashboardPath(role: UserRole | null | undefined): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TUTOR') return '/tutor';
  if (role === 'PARENT') return '/';
  return '/login';
}
