-- Run in Supabase → SQL Editor before production launch.
-- Locks down public.students: tutors/admins can read; only admins can write.

alter table public.students enable row level security;

drop policy if exists "Authenticated users can read students" on public.students;
drop policy if exists "Admins can insert students" on public.students;
drop policy if exists "Admins can update students" on public.students;
drop policy if exists "Admins can delete students" on public.students;

-- SELECT: any signed-in staff (tutors and admins) may read the student list
create policy "Authenticated users can read students"
  on public.students
  for select
  to authenticated
  using (auth.uid() is not null);

-- INSERT: admins only
create policy "Admins can insert students"
  on public.students
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );

-- UPDATE: admins only
create policy "Admins can update students"
  on public.students
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );

-- DELETE: admins only
create policy "Admins can delete students"
  on public.students
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'::public.user_role
    )
  );
