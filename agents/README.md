# Yemen Study — Academic Agent Council

The council consists of eight separate OpenAI Agents SDK agents. It runs from GitHub Actions, not from the browser.

## Agents

1. **Project Director** — scopes the task and sequences specialist work.
2. **Curriculum Analyst** — checks alignment against the repository's curriculum materials.
3. **Learning Content Author** — prepares lesson/content drafts.
4. **Assessment Designer** — prepares question and assessment improvements.
5. **Software Engineer** — applies narrowly allow-listed source patches.
6. **UX & Accessibility Designer** — applies narrowly allow-listed CSS patches.
7. **QA & Security Auditor** — reviews the diff and the production build.
8. **Release Manager** — decides whether the result is ready for a human-reviewed pull request.

Every agent is a distinct Agents SDK instance with its own instructions, output schema, tools, and bounded turn count. They run sequentially under one coordinator so source-writing agents do not race over the same files.

## How a task runs

1. An authorized repository collaborator submits an issue using the **Academic Agent Task** form. The title begins with `[AI Council]`.
2. GitHub Actions starts the workflow automatically.
3. The eight agents inspect the task and permitted repository files, create individual reports, and (only for the engineering roles) may apply restricted patches.
4. The workflow runs the fixed `npm run build` check after the six specialist agents. The read-only QA agent reviews the diff and build result.
5. The release agent may recommend a pull request. The workflow opens one only when the build succeeds, QA passes, every agent completes, source files changed, and the release agent approves.
6. A human reviews and merges the PR. The agents never merge or deploy to production.

## Required setup

In GitHub, open **Settings → Secrets and variables → Actions** and add:

- `OPENAI_API_KEY` — server-side secret used only by the GitHub Actions runner. Do not put it in source files, issue descriptions, or the browser.

Optional repository variables:

- `OPENAI_AGENT_MODEL` — default research/writing model. Default: `gpt-6-luna`.
- `OPENAI_AGENT_CODING_MODEL` — engineering and QA model. Default: `gpt-6.1-sol`.

API usage is billed by the AI provider according to model and token usage. Have the responsible adult/account owner configure the secret and set a spending limit before enabling it. The workflow runs only when an authorized task issue is created/reopened or manually dispatched; it does not poll continuously. The website's local task board does not start a run—use the GitHub issue form.

For pull request creation, check **Settings → Actions → General → Workflow permissions** and enable the setting that allows GitHub Actions to create pull requests. If that setting is disabled, the workflow still pushes a review branch and posts the branch link to the task issue.

## Security boundaries

- Only issue authors with repository OWNER, MEMBER, or COLLABORATOR association can start a run.
- Agents cannot read `.env`, secrets, authentication files, Supabase configuration, GitHub workflow files, or repository settings.
- Source patches are limited to a small explicit list of front-end, curriculum, assessment, and CSS files.
- No arbitrary shell tool is exposed to agents. The orchestrator alone runs the fixed project build command; QA is read-only.
- Changes are proposed on a branch and pull request. There is no automatic merge, production deploy, or ability to alter agent permissions.
- OpenAI response storage and Agents SDK tracing are disabled in the runner configuration.

## Local check

From the repository root:

```bash
npm install --prefix agents --no-audit --no-fund --package-lock=false
node agents/run.mjs --check
```

To execute a live run, provide `OPENAI_API_KEY`, `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and `ISSUE_NUMBER` to the process. Never pass the API key in command-line arguments.
