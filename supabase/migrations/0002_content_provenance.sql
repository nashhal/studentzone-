-- Yemen Study: explicit source provenance for lessons and questions.
-- Apply only after reviewing the Supabase project and testing the migration in staging.

alter table public.content_sources
  add column if not exists source_type text not null default 'educational_reference',
  add column if not exists licence_name text,
  add column if not exists licence_url text,
  add column if not exists reuse_policy text not null default 'reference_only',
  add column if not exists last_verified_at timestamptz;

do $$ begin
  alter table public.content_sources
    add constraint content_sources_source_type_check
    check (source_type in (
      'curriculum_authority','textbook','open_educational_resource',
      'scientific_reference','primary_source','interactive_tool','dataset','educational_reference'
    ));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.content_sources
    add constraint content_sources_reuse_policy_check
    check (reuse_policy in (
      'link_only','reference_only','reuse_allowed',
      'reuse_allowed_noncommercial','public_domain_verified','permission_required'
    ));
exception when duplicate_object then null;
end $$;

create table if not exists public.lesson_sources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  source_id uuid not null references public.content_sources(id) on delete restrict,
  reference_role text not null check (reference_role in (
    'curriculum_alignment','fact_check','terminology',
    'explanation_reference','worked_example_reference',
    'visual_or_media','further_reading'
  )),
  source_locator text,
  attribution_text text,
  editorial_note text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists lesson_sources_unique_reference
  on public.lesson_sources (lesson_id, source_id, reference_role, coalesce(source_locator, ''));

create table if not exists public.question_sources (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  source_id uuid not null references public.content_sources(id) on delete restrict,
  reference_role text not null check (reference_role in (
    'curriculum_alignment','fact_check','terminology',
    'method_reference','data_reference','visual_or_media'
  )),
  source_locator text,
  editorial_note text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists question_sources_unique_reference
  on public.question_sources (question_id, source_id, reference_role, coalesce(source_locator, ''));

alter table public.lesson_sources enable row level security;
alter table public.question_sources enable row level security;

create policy "lesson source references published read"
  on public.lesson_sources for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_id and l.status = 'published'
    )
    or public.has_any_role(array['editor','admin']::public.app_role[])
  );

create policy "lesson source references manage"
  on public.lesson_sources for all to authenticated
  using (public.has_any_role(array['editor','admin']::public.app_role[]))
  with check (public.has_any_role(array['editor','admin']::public.app_role[]));

create policy "question source references published read"
  on public.question_sources for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'published'
    )
    or public.has_any_role(array['editor','admin']::public.app_role[])
  );

create policy "question source references manage"
  on public.question_sources for all to authenticated
  using (public.has_any_role(array['editor','admin']::public.app_role[]))
  with check (public.has_any_role(array['editor','admin']::public.app_role[]));
