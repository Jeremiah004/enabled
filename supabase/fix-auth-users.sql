-- Run in Supabase SQL Editor if login keeps failing for existing accounts.
-- 1) Backfill missing profiles
-- 2) See unconfirmed users (confirm them in Dashboard → Authentication → Users)

insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'TUTOR'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- List users that may be blocked from login (email not confirmed):
-- select id, email, email_confirmed_at, created_at from auth.users order by created_at desc;
