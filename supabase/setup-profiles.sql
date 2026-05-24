-- Run this entire file in Supabase → SQL Editor.
-- Fixes: missing profiles on login, auto-profile on new sign-ups, RLS for inserts.
-- For long-lived tutor sessions (stay signed in): see auth-settings.md in this folder.

-- 1. Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'TUTOR'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Backfill profiles for users who signed up before the trigger existed
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'TUTOR'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3. RLS: allow users to create and read their own profile (app fallback)
alter table public.profiles enable row level security;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep your existing public read, or use this if you removed it:
drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
  on public.profiles for select
  using (true);
