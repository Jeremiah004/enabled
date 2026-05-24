-- Run once in Supabase → SQL Editor (after setup-profiles.sql).
-- Migrates roles to ENUM, adds Paystack payout columns.

-- 1. Role ENUM
do $$ begin
  create type public.user_role as enum ('ADMIN', 'TUTOR', 'PARENT');
exception
  when duplicate_object then null;
end $$;

-- 2. Migrate profiles.role to user_role (handles text or existing enum)
alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type public.user_role
  using (
    case lower(coalesce(role::text, ''))
      when 'admin' then 'ADMIN'::public.user_role
      when 'tutor' then 'TUTOR'::public.user_role
      when 'parent' then 'PARENT'::public.user_role
      else 'TUTOR'::public.user_role
    end
  );

alter table public.profiles
  alter column role set default 'TUTOR'::public.user_role;

alter table public.profiles
  alter column role set not null;

-- 3. Paystack payout prep columns
alter table public.profiles
  add column if not exists bank_name text,
  add column if not exists account_number text,
  add column if not exists account_name text;

-- 4. Sign-up trigger: default TUTOR (uppercase)
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
    'TUTOR'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Set your client's email as the initial ADMIN (edit email below) ──
-- UPDATE public.profiles
-- SET role = 'ADMIN'::public.user_role
-- WHERE lower(email) = lower('client@example.com');
