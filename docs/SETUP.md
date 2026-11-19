# Developer setup

## Requirements
- Node.js 20+
- npm
- A Supabase project for persistent accounts and data

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or a compatible Supabase publishable key)

The browser key is public by design. Protect data with RLS. Never put a Supabase service-role key in a `VITE_*` variable or frontend code.

## Database
Apply `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.

New sign-ups receive the `student` role. Promote the trusted owner account manually after verifying its email:
```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'YOUR_OWNER_EMAIL');
```
Do not expose role changes to students.

## GitHub Pages
The workflow builds changes on the development branch and pull requests. It deploys only from `main`.
Add repository Actions variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The current Vite base path is `/studentzone-/`. Update `vite.config.ts` if the repository is renamed. GitHub Pages hosts the static frontend; Supabase provides the backend.

## Security notes
- Enable RLS and review all policies before adding real student data.
- Students cannot directly select `question_answer_keys` or `assessment_results`.
- Score calculation must run in a trusted Edge Function using server-side credentials.
- Audit attempts/submission policies and storage access before production.
