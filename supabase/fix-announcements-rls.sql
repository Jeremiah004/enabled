-- Fix announcements RLS: public read of active rows; admin write access.

alter table public.announcements enable row level security;

drop policy if exists "Authenticated users read active announcements" on public.announcements;
drop policy if exists "Admins read all announcements" on public.announcements;
drop policy if exists "Admins insert announcements" on public.announcements;
drop policy if exists "Admins update announcements" on public.announcements;
drop policy if exists "Public read active announcements" on public.announcements;
drop policy if exists "Admins manage announcements insert" on public.announcements;
drop policy if exists "Admins manage announcements update" on public.announcements;
drop policy if exists "Admins manage announcements delete" on public.announcements;

-- Anyone (including anon) can read active, non-expired announcements
create policy "Public read active announcements"
  on public.announcements for select
  to anon, authenticated
  using (
    is_active = true
    and (expiry_date is null or expiry_date > timezone('utc'::text, now()))
  );

-- Admins can read all rows (including hidden/expired) for management UI
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

create policy "Admins delete announcements"
  on public.announcements for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );
