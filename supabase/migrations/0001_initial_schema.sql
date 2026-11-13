-- Yemen Study: initial PostgreSQL schema and RLS
-- Apply this migration in a Supabase project only after reviewing the project settings.
create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('student', 'editor', 'admin');
exception when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.education_stages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.grades (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.education_stages(id) on delete restrict,
  slug text not null unique,
  name text not null,
  grade_number int not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.grade_tracks (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete restrict,
  unique (grade_id, track_id)
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.syllabus_versions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  school_year text,
  edition_label text,
  source_note text,
  created_at timestamptz not null default now()
);
create table public.curriculum_subjects (
  id uuid primary key default gen_random_uuid(),
  grade_track_id uuid not null references public.grade_tracks(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  syllabus_version_id uuid references public.syllabus_versions(id) on delete set null,
  is_active boolean not null default true
);
create unique index curriculum_subjects_unique_version
  on public.curriculum_subjects (grade_track_id, subject_id, coalesce(syllabus_version_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text,
  publication_year text,
  edition text,
  source_url text,
  rights_status text not null default 'needs_review'
    check (rights_status in ('original','licensed','public_domain','link_only','needs_review','permission_required')),
  rights_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.units (
  id uuid primary key default gen_random_uuid(),
  curriculum_subject_id uuid not null references public.curriculum_subjects(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  unique (curriculum_subject_id, slug)
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text,
  content_md text not null default '',
  objectives text[] not null default '{}',
  estimated_minutes int not null default 10 check (estimated_minutes > 0),
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  access_level text not null default 'free' check (access_level in ('free','paid')),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (unit_id, slug)
);
create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  source_id uuid references public.content_sources(id) on delete set null,
  title text not null,
  resource_type text not null check (resource_type in ('image','pdf_link','video_link','diagram','attachment','external_link')),
  storage_path text,
  external_url text,
  sort_order int not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  question_type text not null check (question_type in ('multiple_choice','true_false','short_answer','numeric','problem')),
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  body_md text not null,
  explanation_md text,
  points numeric(7,2) not null default 1 check (points > 0),
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  source_id uuid references public.content_sources(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_label text not null,
  option_text text not null,
  sort_order int not null default 0
);

-- Correct answers are private. Students must never have direct SELECT access.
create table public.question_answer_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_option_id uuid references public.question_options(id) on delete set null,
  accepted_texts text[] not null default '{}',
  numeric_answer numeric,
  tolerance numeric,
  explanation_private text
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text,
  assessment_type text not null default 'practice' check (assessment_type in ('practice','mock_exam','diagnostic')),
  duration_minutes int check (duration_minutes is null or duration_minutes > 0),
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.assessment_questions (
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  sort_order int not null default 0,
  points_override numeric(7,2),
  primary key (assessment_id, question_id)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','graded','abandoned'))
);
-- Browser submissions contain answers only; grading fields are intentionally excluded.
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_option_id uuid references public.question_options(id) on delete set null,
  answer_text text,
  answer_numeric numeric,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);
-- Results are server-written and not directly accessible to students through table policies.
create table public.assessment_results (
  attempt_id uuid primary key references public.attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(8,2) not null,
  max_score numeric(8,2) not null,
  detail jsonb not null default '{}'::jsonb,
  graded_at timestamptz not null default now()
);

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_position int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.has_any_role(allowed_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = any(allowed_roles));
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.education_stages enable row level security;
alter table public.grades enable row level security;
alter table public.tracks enable row level security;
alter table public.grade_tracks enable row level security;
alter table public.subjects enable row level security;
alter table public.syllabus_versions enable row level security;
alter table public.curriculum_subjects enable row level security;
alter table public.content_sources enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.assessment_results enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.bookmarks enable row level security;

create policy "profile read own" on public.profiles for select to authenticated
using (id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]));
create policy "profile update own" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());
create policy "role read own or admin" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]));
create policy "role manage admin" on public.user_roles for all to authenticated
using (public.has_any_role(array['admin']::public.app_role[]))
with check (public.has_any_role(array['admin']::public.app_role[]));

create policy "stages read" on public.education_stages for select
using (is_active or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "stages manage" on public.education_stages for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "grades read" on public.grades for select
using (is_active or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "grades manage" on public.grades for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "tracks read" on public.tracks for select
using (is_active or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "tracks manage" on public.tracks for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "grade tracks read" on public.grade_tracks for select using (true);
create policy "grade tracks manage" on public.grade_tracks for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "subjects read" on public.subjects for select
using (is_active or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "subjects manage" on public.subjects for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "syllabus versions read" on public.syllabus_versions for select using (true);
create policy "syllabus versions manage" on public.syllabus_versions for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "curriculum subjects read" on public.curriculum_subjects for select
using (is_active or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "curriculum subjects manage" on public.curriculum_subjects for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));

create policy "sources read" on public.content_sources for select using (true);
create policy "sources manage" on public.content_sources for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "units published read" on public.units for select
using (status = 'published' or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "units manage" on public.units for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "lessons published read" on public.lessons for select
using (status = 'published' or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "lessons manage" on public.lessons for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "resources published read" on public.lesson_resources for select
using (exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published')
  or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "resources manage" on public.lesson_resources for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));

create policy "questions published read" on public.questions for select
using (status = 'published' or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "questions manage" on public.questions for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "options published read" on public.question_options for select
using (exists (select 1 from public.questions q where q.id = question_id and q.status = 'published')
  or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "options manage" on public.question_options for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "answer keys staff only" on public.question_answer_keys for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));

create policy "assessments published read" on public.assessments for select
using (status = 'published' or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "assessments manage" on public.assessments for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "assessment items published read" on public.assessment_questions for select
using (exists (select 1 from public.assessments a where a.id = assessment_id and a.status = 'published')
  or public.has_any_role(array['editor','admin']::public.app_role[]));
create policy "assessment items manage" on public.assessment_questions for all to authenticated
using (public.has_any_role(array['editor','admin']::public.app_role[]))
with check (public.has_any_role(array['editor','admin']::public.app_role[]));

create policy "attempts read own" on public.attempts for select to authenticated
using (user_id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]));
create policy "attempts insert own" on public.attempts for insert to authenticated
with check (user_id = auth.uid());
create policy "attempts update own in progress" on public.attempts for update to authenticated
using (user_id = auth.uid() and status = 'in_progress')
with check (user_id = auth.uid());
create policy "answers read own" on public.attempt_answers for select to authenticated
using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid())
  or public.has_any_role(array['admin']::public.app_role[]));
create policy "answers insert own" on public.attempt_answers for insert to authenticated
with check (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'));
create policy "answers update own in progress" on public.attempt_answers for update to authenticated
using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'))
with check (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'));
-- Intentionally no SELECT/INSERT/UPDATE policy on assessment_results or question_answer_keys for students.

create policy "progress own" on public.lesson_progress for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bookmarks own" on public.bookmarks for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
