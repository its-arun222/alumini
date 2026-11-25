-- MAIT Alumni Connect schema. Run once in Supabase SQL editor.
-- RLS is enabled with no policies: only the server (service role key) can access data.

create table if not exists public.students (
  id text primary key,
  name text not null,
  roll_no text,
  email text,
  branch text,
  batch_year text,
  current_semester int,
  cgpa numeric(4,2),
  skills jsonb not null default '[]',
  interests jsonb not null default '[]',
  dream_companies jsonb not null default '[]',
  bio text,
  avatar_url text,
  github_url text,
  linkedin_url text,
  inserted_at timestamptz not null default now()
);

create table if not exists public.alumni (
  id text primary key,
  name text not null,
  email text,
  branch text,
  grad_year int,
  current_company text,
  designation text,
  location text,
  skills jsonb not null default '[]',
  bio text,
  avatar_url text,
  linkedin_url text,
  github_url text,
  is_available_for_mentoring boolean not null default true,
  total_mentored int not null default 0,
  specialties jsonb not null default '[]',
  verified_by_mait boolean not null default false,
  inserted_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  type text not null check (type in ('job','internship','webinar','reunion')),
  company_or_organizer text,
  location text,
  mode text,
  description text,
  requirements jsonb not null default '[]',
  skills jsonb not null default '[]',
  deadline_or_date text,
  posted_by_role text,
  poster_id text,
  poster_name text,
  poster_company text,
  poster_grad_year int,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  registered_student_ids jsonb not null default '[]',
  compensation_or_fee text,
  link_url text,
  created_at text,
  is_referral_by_alumni boolean,
  inserted_at timestamptz not null default now()
);

create table if not exists public.mentorship_requests (
  id text primary key,
  student_id text,
  student_name text,
  student_branch text,
  student_semester int,
  student_cgpa numeric(4,2),
  alumni_id text references public.alumni(id) on delete cascade,
  alumni_name text,
  alumni_company text,
  alumni_designation text,
  topic text,
  message text,
  preferred_mode text,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  requested_at text,
  response_note text,
  meeting_url text,
  inserted_at timestamptz not null default now()
);

create table if not exists public.pending_profile_updates (
  id text primary key,
  alumni_id text references public.alumni(id) on delete cascade,
  alumni_name text,
  grad_year int,
  current_company text,
  requested_changes jsonb not null default '{}',
  reason text,
  submitted_at text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_remark text,
  inserted_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.alumni enable row level security;
alter table public.opportunities enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.pending_profile_updates enable row level security;
