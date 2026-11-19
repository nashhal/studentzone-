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


-- Seed a small, verified source register. These are references/links, not copied lesson content.
insert into public.content_sources (
  title, publisher, source_url, rights_status, rights_notes,
  source_type, licence_name, licence_url, reuse_policy, last_verified_at
)
select
  s.title, s.publisher, s.source_url, s.rights_status, s.rights_notes,
  s.source_type, s.licence_name, s.licence_url, s.reuse_policy, now()
from (values
  (
    'Ministry of Education — E-Learning textbook portal',
    'General Administration of E-Learning, Ministry of Education and Scientific Research',
    'https://e-learning-moe.edu.ye/book.php',
    'link_only',
    'Primary starting point for locating the Yemeni textbook edition. Verify each grade, title, school year and region before mapping lessons.',
    'curriculum_authority', null::text, null::text, 'link_only'
  ),
  (
    'Ministry textbook channel — 1448 AH updates',
    'Yemeni Ministry education publishing channel',
    'https://t.me/Books_Yemen_new',
    'link_only',
    'Use announcements and individual book posts to verify the edition. A channel link is not proof that every grade/subject is covered.',
    'curriculum_authority', null::text, null::text, 'link_only'
  ),
  (
    'School subject catalogue',
    'Education Office, Hadramout Governorate',
    'https://meoh.gov.ye/services/subjects/',
    'link_only',
    'Regional catalogue only. Do not treat it as proof that the same edition applies nationwide.',
    'curriculum_authority', null::text, null::text, 'link_only'
  ),
  (
    'University Physics Volume 1 — Section 2.1: Scalars and Vectors',
    'OpenStax, Rice University',
    'https://openstax.org/books/university-physics-volume-1/pages/2-1-scalars-and-vectors',
    'licensed',
    'Used as an independent scientific reference for the demonstration lesson. Do not adapt or redistribute without following CC BY-NC-SA 4.0 attribution, non-commercial and share-alike terms.',
    'scientific_reference', 'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'reference_only'
  ),
  (
    'OpenStax textbook licensing information',
    'OpenStax',
    'https://help.openstax.org/s/article/Licensing-information-of-OpenStax-textbooks',
    'link_only',
    'Licensing terms reference. Confirm the licence of the exact textbook and any third-party content before reuse.',
    'educational_reference', null::text, null::text, 'link_only'
  ),
  (
    'SI Units',
    'National Institute of Standards and Technology (NIST)',
    'https://www.nist.gov/pml/owm/metric-si/si-units',
    'link_only',
    'Reference for SI unit names, symbols and measurement standards. Check rights for individual figures and assets.',
    'scientific_reference', null::text, null::text, 'reference_only'
  ),
  (
    'PhET Interactive Simulations — Licensing',
    'University of Colorado Boulder',
    'https://phet.colorado.edu/en/licensing/',
    'licensed',
    'Regular HTML simulations are CC BY-NC 4.0. Non-commercial use only; attribution must be close to the simulation and PhET branding must remain visible. Check each simulation before use.',
    'interactive_tool', 'CC BY-NC 4.0', 'https://creativecommons.org/licenses/by-nc/4.0/', 'reuse_allowed_noncommercial'
  ),
  (
    'IUPAC Compendium of Chemical Terminology — Gold Book',
    'International Union of Pure and Applied Chemistry (IUPAC)',
    'https://goldbook.iupac.org/',
    'licensed',
    'Individual terms are CC BY-SA 4.0. Verify the cited underlying recommendation because some entries may be outdated or superseded.',
    'scientific_reference', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'reference_only'
  ),
  (
    'MIT OpenCourseWare — Reusing content',
    'Massachusetts Institute of Technology',
    'https://mitocw.zendesk.com/hc/en-us/articles/5093047407771-Reusing-MIT-OpenCourseWare-Content',
    'licensed',
    'Non-commercial use, attribution and share-alike are required. Primarily a teacher-enrichment and advanced-secondary reference.',
    'open_educational_resource', 'CC BY-NC-SA', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'reference_only'
  ),
  (
    'British Council LearnEnglish — Grammar',
    'British Council',
    'https://learnenglish.britishcouncil.org/free-resources/grammar',
    'link_only',
    'Use as an external reference for English grammar sequencing. Do not copy or re-host its explanations, exercises or media.',
    'educational_reference', null::text, null::text, 'link_only'
  ),
  (
    'NOAA Education — Learning resources',
    'National Oceanic and Atmospheric Administration',
    'https://www.noaa.gov/educational-resources',
    'link_only',
    'Use as a scientific and educational reference for weather, climate, ocean and Earth-system topics. Check item-level rights before embedding assets.',
    'educational_reference', null::text, null::text, 'link_only'
  ),
  (
    'Khan Academy — Terms of Service guidance',
    'Khan Academy',
    'https://support.khanacademy.org/hc/en-us/articles/42929097425037-What-s-allowed-and-not-allowed-under-Khan-Academy-s-Terms-of-Service',
    'link_only',
    'Do not scrape, copy, translate or reproduce its lessons, exercises or content data in Yemen Study.',
    'educational_reference', null::text, null::text, 'link_only'
  ),
  (
    'CK-12 — Terms of Use',
    'CK-12 Foundation',
    'https://help.ck12.org/hc/en-us/articles/51042851054235-CK-12-Terms-of-Use',
    'permission_required',
    'Terms restrict content aggregators from collecting its curriculum materials for redistribution through their own services. Do not import without express written permission.',
    'educational_reference', null::text, null::text, 'permission_required'
  ),
  (
    'MathWorld — Terms and Conditions',
    'Wolfram Research',
    'https://www.wolfram.com/legal/terms/mathworld/',
    'link_only',
    'Useful as a mathematical reference, but no bulk copying or mirroring. Write original explanations and exercises.',
    'scientific_reference', null::text, null::text, 'reference_only'
  ),
  (
    'Open Educational Resources',
    'UNESCO',
    'https://www.unesco.org/en/open-educational-resources',
    'link_only',
    'Reference for the definition of OER: public-domain or openly licensed resources with permissions for reuse, adaptation and redistribution.',
    'educational_reference', null::text, null::text, 'reference_only'
  )
) as s(title,publisher,source_url,rights_status,rights_notes,source_type,licence_name,licence_url,reuse_policy)
where not exists (
  select 1 from public.content_sources existing where existing.source_url = s.source_url
);
