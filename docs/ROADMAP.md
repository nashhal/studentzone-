# Yemen Study — roadmap

## Direction
A free-first Arabic learning platform for the Yemeni curriculum, RTL and mobile-first. Editorial visual system with navy, blue, white, restrained surfaces and clear hierarchy.

## Release 0.1 — platform foundation
- [x] React + TypeScript + Vite application shell.
- [x] Arabic-first RTL responsive layout.
- [x] Home, curriculum, grade, subject, dashboard, sign-in, and editor/admin routes.
- [x] Supabase client configured through public environment variables.
- [x] Initial PostgreSQL schema and RLS policies.
- [x] First curriculum index for grades 1–12 based on the available Hadramout education office catalogue.
- [ ] Confirm regional applicability, edition and year for each textbook.
- [ ] Create Supabase project and apply migrations.
- [ ] Configure GitHub Actions variables and production auth.

## Release 0.2 — verified syllabus structure
- Read each approved textbook's contents page.
- Add units, lessons and topic objectives with source/page references.
- Record the edition, school year, authority and region for every syllabus.
- Editorial status flow: draft → review → published.

## Release 0.3 — learning content
- Original lesson explanations, definitions, formula sheets, examples and diagrams.
- Topic questions with difficulty labels and explanatory solutions.
- Rights-checked links to official PDFs or videos.
- Bookmarks and lesson progress.

## Release 0.4 — assessments
- Timed tests and mock exams.
- Server-side grading.
- Results, attempt history, weak-topic review and progress analytics.
- Keep answer keys off the student-facing browser API.

## Release 0.5 — expansion
- Complete the Grade 12 scientific pilot.
- Complete other Grade 12 track.
- Review and complete remaining secondary grades.
- Review and complete basic education grades 1–9.

## Definition of done
- Responsive with no horizontal scrolling at common phone widths.
- Keyboard accessible, visible focus states and reduced-motion support.
- RLS policies verified for every exposed table.
- Student/editor/admin roles tested.
- Every published item has an edition-specific checked source and reuse-rights status.
- Typecheck/build pass and deployed URL smoke-tested.
