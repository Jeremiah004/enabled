-- Run in Supabase SQL Editor if you see:
-- "Could not find a relationship between 'sessions' and 'students'"

-- Ensure foreign keys exist (required for joins / PostgREST embeds)
alter table public.sessions
  drop constraint if exists sessions_student_id_fkey;

alter table public.sessions
  add constraint sessions_student_id_fkey
  foreign key (student_id) references public.students(id) on delete restrict;

alter table public.sessions
  drop constraint if exists sessions_tutor_id_fkey;

alter table public.sessions
  add constraint sessions_tutor_id_fkey
  foreign key (tutor_id) references public.profiles(id) on delete cascade;

-- After running: Supabase Dashboard → Project Settings → API → Reload schema cache
-- (or wait a minute for auto-refresh)
