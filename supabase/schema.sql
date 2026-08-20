-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  duration numeric not null default 1, -- hours; fractional for timer-logged tasks
  repeat text not null check (repeat in ('once', 'weekly', 'daily')),
  day_idx integer not null check (day_idx between 0 and 6),
  date date, -- only set when repeat = 'once'
  created_at timestamptz not null default now()
);

-- If you created the table before duration became fractional, run this once:
-- alter table public.tasks alter column duration type numeric using duration::numeric;

-- If you created the table before "Repeat daily" was added, run this once:
-- alter table public.tasks drop constraint tasks_repeat_check;
-- alter table public.tasks add constraint tasks_repeat_check check (repeat in ('once', 'weekly', 'daily'));

create table if not exists public.task_completions (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurrence_date date not null,
  completed boolean not null default true,
  primary key (task_id, occurrence_date)
);

alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;

create policy "Users manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own task completions"
  on public.task_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Run this block too if you're adding the "start task with timer" feature
-- after already running the tables above.
create table if not exists public.timers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_name text not null,
  date date not null,
  elapsed_seconds integer not null default 0,
  is_running boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.timers enable row level security;

create policy "Users manage their own timers"
  on public.timers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Run this block too if you're adding the "Start Task" countdown feature
-- (per-task timer that auto-completes the task when it reaches its duration).
create table if not exists public.task_timers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  date date not null,
  target_seconds integer not null,
  elapsed_seconds integer not null default 0,
  is_running boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now(),
  unique (task_id, date)
);

alter table public.task_timers enable row level security;

create policy "Users manage their own task timers"
  on public.task_timers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
