-- Sitewide announcements for authenticated staff (run in Supabase SQL Editor or via MCP).

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  is_active boolean not null default true,
  expiry_date timestamptz
);

alter table public.announcements enable row level security;

drop policy if exists "Authenticated users read active announcements" on public.announcements;
create policy "Authenticated users read active announcements"
  on public.announcements for select
  to authenticated
  using (
    is_active = true
    and (expiry_date is null or expiry_date > timezone('utc'::text, now()))
  );

drop policy if exists "Admins read all announcements" on public.announcements;
create policy "Admins read all announcements"
  on public.announcements for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );

drop policy if exists "Admins insert announcements" on public.announcements;
create policy "Admins insert announcements"
  on public.announcements for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );

drop policy if exists "Admins update announcements" on public.announcements;
create policy "Admins update announcements"
  on public.announcements for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );
