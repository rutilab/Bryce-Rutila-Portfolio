# BAR 9000 — working rules

## ⚠️ `cvs-ux-job` is one-way. Never merge it into `main`.

`cvs-ux-job` is a **stripped-down, tailored copy** of the portfolio, built to send
to a single employer (CVS, UX role). It intentionally has pages, navigation, and
case studies **deleted** from it, and rewritten copy that is specific to that job.

- ✅ Pull `main` **into** `cvs-ux-job` whenever it needs to catch up.
- ❌ **Never** merge, rebase, cherry-pick, or push `cvs-ux-job` **into** `main`.

Merging it home would delete real pages from the live site at brycerutila.com and
overwrite the real copy with job-specific copy. If asked to "merge the branch" or
"push this live" while on `cvs-ux-job`, **stop and confirm what is meant** — the
answer is almost never a merge into `main`.

When the application process is over: delete the branch, delete its Vercel
project, and delete this section.

## Deployments

| Branch | Vercel project | Address | Public |
|---|---|---|---|
| `main` | the original | brycerutila.com | yes |
| `cvs-ux-job` | separate project, no domain | `*.vercel.app` | unlisted, no-index |

One repo, one source of truth. Branches are versions; Vercel projects are just
windows onto them. `main` is always the real portfolio.

## Conventions

- Local working notes (`worklog-*.md`, `PRD-*.md`, `TODO-*.md`,
  `case-study-reference/`) are gitignored on purpose — read them, don't commit them.
- `chrome/` is a tooling download, gitignored, never commit it.
- Case study copy is Bryce's own voice — edit for register, not personality.
