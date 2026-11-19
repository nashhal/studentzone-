# Yemen Study — roadmap and release status

Last reviewed: 19 November 2026

This repository contains a working product prototype. It is not yet a complete Yemeni curriculum library or a production-ready student service.

## Implemented in the current feature branch

- [x] Arabic-first RTL React + TypeScript + Vite application.
- [x] Responsive editorial visual system with navy, blue, white and restrained surfaces.
- [x] Grade and subject navigation for grades 1–12 (provisional catalogue).
- [x] One explicitly labelled demonstration Physics lesson with notes, objectives, worked example and recap.
- [x] Topic practice, flashcards, timed mock test and target-test prototype.
- [x] Guided study, guided practice, local attempt history and an initial strengths/weaknesses view.
- [x] Teacher/editor question-paper builder with print-to-PDF.
- [x] Supabase-backed editor interface for creating units, Markdown lessons, multiple-choice questions, separate answer keys, and source/rights records.
- [x] New editorial content is saved as draft; publishing requires an explicit status change.
- [x] Student-facing UI does not read the private answer-key table directly.
- [x] Local system-font stack and reduced-motion/focus styling; no remote font dependency.

## Production blockers and unfinished work

- [ ] Create/configure a Supabase project and apply the SQL migration.
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to GitHub Actions variables.
- [ ] Provision the first admin/editor role securely before using the editor workspace.
- [ ] Move progress, bookmarks, flashcard ratings and attempts from browser storage to the authenticated cloud database.
- [ ] Implement server-side assessment submission/grading and test all RLS policies.
- [ ] Verify syllabus editions, school years and regional applicability for every grade, track and subject.
- [ ] The only full lesson content currently in the app is a demonstration lesson; do not describe it as a verified Grade 12 textbook lesson.
- [ ] Author original notes, formulas, diagrams, worked examples, topic questions and explanations for every verified unit.
- [ ] Add a past-paper library with verified year, subject, answer key and rights/reuse status.
- [ ] Test student/editor/admin permissions, mobile layouts, keyboard navigation and the deployed Pages route.

## Curriculum and content rules

1. Record the education authority, region, school year, textbook edition and source for each syllabus item.
2. A link to a textbook is a source reference, not a completed lesson.
3. Do not infer a current national syllabus from an old or region-specific catalogue.
4. Write original explanations and questions; do not copy protected notes, answer keys, diagrams or long textbook passages.
5. Keep answer keys in the protected database table and never expose them through student-facing reads.
6. Keep the editorial workflow explicit: draft → review → published.

## Release plan

### 0.1 — platform foundation
- [x] React + TypeScript + Vite shell and routing.
- [x] Arabic RTL responsive interface.
- [x] Initial PostgreSQL schema and RLS policies.
- [ ] Supabase project and production authentication.

### 0.2 — verified curriculum structure
- [x] Provisional grade, track and subject index.
- [ ] Confirm all editions, years and regional scope.
- [ ] Add textbook-derived unit/lesson indexes with page references after reviewing source copies.

### 0.3 — learning content
- [x] Demonstration lesson template.
- [x] Worked-example, recap, flashcard and topic-question UI patterns.
- [ ] Original content for each verified lesson.
- [ ] Teacher-reviewed question banks and explanatory answers.
- [ ] Verified diagrams, formula sheets and study resources.

### 0.4 — assessment and progress
- [x] Front-end target test, timed test and guided practice prototypes.
- [x] Browser-local attempt history and initial performance analysis.
- [x] Editor workspace for units, lessons, questions and sources.
- [ ] Cloud attempts and progress synchronisation.
- [ ] Server-side grading and private result views.
- [ ] Full performance analysis across the curriculum.

### 0.5 — curriculum expansion
- [ ] Complete a verified Grade 12 pilot, including scientific and literary tracks.
- [ ] Expand to other secondary grades.
- [ ] Expand to basic education grades 1–9.
- [ ] Add verified past papers and timed paper simulation.

## Definition of done

- No horizontal overflow at common mobile and desktop widths.
- Keyboard access and visible focus states for all interactive controls.
- Every published unit and lesson is verified against a named edition and source.
- Every published question has a reviewed explanation and protected answer key.
- Student/editor/admin roles tested against RLS.
- Typecheck/build pass and deployed URL smoke-tested after merge to `main`.
