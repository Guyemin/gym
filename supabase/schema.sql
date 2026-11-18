-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists public.arabic_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.arabic_progress enable row level security;

-- Each user can only see and change their own row.
drop policy if exists "own progress select" on public.arabic_progress;
drop policy if exists "own progress insert" on public.arabic_progress;
drop policy if exists "own progress update" on public.arabic_progress;

create policy "own progress select" on public.arabic_progress
  for select using (auth.uid() = user_id);
create policy "own progress insert" on public.arabic_progress
  for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.arabic_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
