# Yemen Study — roadmap

## Product direction
A free-first Arabic learning platform for the Yemeni curriculum. The first complete pilot is Grade 12 (third secondary), scientific track. The content model is designed to support all basic and secondary grades.

## Release 0.1 — foundation
- [x] React + TypeScript + Vite application shell.
- [x] Arabic-first RTL layout and responsive mobile navigation.
- [x] Initial routes: home, curriculum, student dashboard, sign-in, content admin.
- [x] Supabase browser client configured through public environment variables.
- [x] Initial PostgreSQL schema and row-level security policies.
- [ ] Verify the official curriculum edition and the exact Grade 12 subject list.
- [ ] Create the Supabase project and apply the migration.
- [ ] Configure GitHub Actions variables and verify the build/deployment.

## Release 0.2 — content operations
- Admin CRUD for stages, grades, tracks, subjects, syllabus versions, units and lessons.
- Draft → review → published editorial workflow.
- Source register with edition, year, reuse rights and reviewer details.
- Supabase Storage buckets and guarded upload paths.

## Release 0.3 — learning experience
- Lesson reader with objectives, explanations, definitions, formulas, examples, diagrams and references.
- Bookmarks and lesson progress.
- Topic-based question bank with difficulty filters and worked explanations.
- Original practice questions and reviewed past-paper references.

## Release 0.4 — assessments
- Timed practice tests and mock exams.
- Server-side grading through Supabase Edge Functions.
- Results, attempt history, weak-topic review and progress analytics.
- Keep answer keys and grading results off the public browser API.

## Release 0.5 — expansion
- Complete the Grade 12 scientific pilot after curriculum verification.
- Add remaining Grade 12 tracks and then expand to all Yemeni grades.

## Definition of done
- Mobile responsive, RTL, accessible by keyboard and free of horizontal scrolling on common phone widths.
- RLS is enabled and tested for every exposed table.
- Student/editor/admin permissions are verified.
- Answer keys remain server-side.
- Every published item has a checked source and reuse-rights status.
- Typecheck/build pass and deployed URL is verified before launch.

## Content integrity
Do not reproduce Save My Exams content or republish protected textbook scans/PDFs without permission. Prefer original explanations and questions. Link to source material when redistribution rights are unclear.
