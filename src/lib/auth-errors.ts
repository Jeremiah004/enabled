/** Normalize email for Supabase Auth (trim + lowercase). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Short, user-friendly auth error messages. */
export function mapAuthError(message: string): string {
  if (message === 'Invalid login credentials') {
    return 'Incorrect email or password. Try again, or create a new account below.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Your email is not confirmed. Ask an admin to confirm your account in Supabase, or sign up again with a new email.';
  }
  if (message.includes('User already registered')) {
    return 'This email is already registered. Sign in instead.';
  }
  return message;
}
