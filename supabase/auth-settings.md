# Supabase Auth settings (stay signed in)

Configure these in **Supabase Dashboard → Authentication** so tutors stay logged in on their devices after the first sign-in.

## Required

| Setting | Recommended value | Why |
|--------|-------------------|-----|
| **Confirm email** | OFF | Staff can sign in immediately after signup |
| **Refresh token lifetime** | 30 days (or longer) | Keeps tablets/phones signed in between visits |

## Sessions (if available in your project)

- **JWT expiry** — default 1 hour is fine; [middleware.ts](../middleware.ts) refreshes the session on each visit.
- **Refresh token rotation** — leave ON (more secure).

## After changing settings

No code deploy needed. Existing users may need to sign in once more to get a new long-lived refresh token.

## Sign out

Tutors should use **Sign Out** on shared school devices so the next person cannot log sessions under their account.
