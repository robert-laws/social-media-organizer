# CLAUDE.md — claude-social-media-org

This repo holds two things that work together but are different in kind:

1. **The Site** — the existing social-media planning dashboard / website.
2. **Megaphone** — a content *loop*: one seed idea (+ optional image) becomes four
   platform-tailored drafts (X, Instagram, Facebook, LinkedIn), generated, validated,
   and queued for human review.

Megaphone is **loop engineering**, not a feature of the site: a generator grounded by an
independent checker, run on a schedule. The Site is the surface that displays and reviews
what the loop produces. Keep that line clear — the loop *makes* drafts; it never publishes them.

---

## Golden rules (do not break)

- The generator **NEVER grades its own output.** Judgment is a separate agent:
  `.claude/agents/megaphone-reviewer.md`.
- **NEVER auto-publish.** Approved drafts land in `drafts/<seed>/<platform>.md` as
  `ready_for_review`; anything uncertain goes to `inbox/`. A human ships.
- Character / hashtag / length limits are decided by `tools/validate.py` (deterministic),
  **never** by the model eyeballing length.
- The `/goal` evaluator only sees the **conversation** — always RUN `validate.py` and
  **paste its output** each turn, or the stop-check is judging blind.
- **Commit before any Routine run.** Routines run from a fresh clone in the cloud and only
  see committed files.
- **Caps before unattended runs** (`state/budget.md`): a per-run budget, a daily budget,
  and max 4 attempts per platform.
- Keep loop output (`drafts/`, `state/`, `inbox/`) **out of the Site's deploy build**.

---

## Repo map

| Path | What it is | Loop role |
|---|---|---|
| `CLAUDE.md` | This file. Auto-loaded every session. | orientation |
| `tools/validate.py` | Deterministic platform checker — the "compiler". | verification (gate) |
| `.claude/skills/megaphone-triage/` | Finds the day's work from the queue + state. | discovery |
| `.claude/skills/megaphone-generate/` | Per-platform writer. 3 variants, no self-grading. | (generation) |
| `.claude/agents/megaphone-reviewer.md` | Adversarial evaluator; runs validate.py. | verification (judge) |
| `ideas/queue.md` | Seed ideas in. | discovery input |
| `state/content-state.json` | What's done / in progress per seed × platform. | persistence (memory) |
| `state/budget.md` | Token / cost caps. | guard |
| `drafts/<seed>/<platform>.md` | Approved drafts, `ready_for_review`. | persistence (output) |
| `inbox/` | Anything the loop is unsure about → human. | the open door |

---

## Platform rules (summary; source of truth is `validate.py` + the generate skill)

- **X** — ≤280 chars, hook in the first line, ≤2 hashtags, thread-ready.
- **Instagram** — visual-led caption, 5–15 hashtags in a block, explicit CTA.
- **Facebook** — ~300–500 chars, conversational, ends on a question, 0–2 hashtags.
- **LinkedIn** — insight-first, hook before the ~210-char "see more" fold, ≤3 hashtags,
  no clickbait or hype verbs.

---

## How to run

- **Iterate (you're present):**
  `/loop 30m run megaphone-triage, then generate, validate, and review any todo seeds`
- **Stop condition:**
  `/goal validate.py exits 0 for the requested platforms AND megaphone-reviewer returns PASS.
   Run validate.py and paste its JSON each turn.`
- **Parallel platforms:** one git worktree per platform.
- **Overnight:** a cloud **Routine** running triage → generate → review → open a PR on a
  `claude/` branch (which is the human-review gate).

---

## The Site

**Masthead Social Studio** — a single-page social-media planning dashboard.

**Stack:** React 18 + React Router 6, built with Vite 6. No backend of its own: the app
talks to GitHub directly. User config (PAT + `owner`/`repo`) lives in `localStorage`, and
all content (`data/posts.json`, `data/ideas.json`, `data/metrics.json`, `data/settings.json`)
is read/written via the GitHub Contents API to a **separate private data repo** — see
`src/lib/github.js` and `src/lib/store.jsx`. This repo holds only the app code; the user's
actual content lives elsewhere.

**Structure:**
- `index.html` → `src/main.jsx` → `src/App.jsx` (route table; client-side routing).
- `src/pages/` — Dashboard, Calendar, Ideas, Composer, Metrics, Platform (`/platform/:id`),
  Settings.
- `src/components/` — Sidebar, PageHead, Chart, Chips, Embed, Art, Icons.
- `src/lib/` — `store.jsx` (context + GitHub-backed data store), `github.js` (API client),
  `constants.js`, `sample.js`, `util.js`.
- `src/styles.css` — global styles. Fonts loaded from Google Fonts in `index.html`.
- `public/` — static assets copied verbatim (images, `404.html` for Pages deep-link fallback).

**Build / deploy:**
- `npm run dev` (local), `npm run build` → `dist/`, `npm run preview` (serve the build).
- CI: `.github/workflows/deploy.yml` runs on push to `main` — `npm ci && npm run build`, then
  publishes **`dist/` only** to GitHub Pages.
- `vite.config.js` sets `base: '/social-media-organizer/'` to match the repo name (project
  Pages site). **If the repo is renamed, update `base`** or assets 404.

**What's in the deploy build (and what's not):** Vite bundles **only** `index.html`, `src/`,
and `public/` into `dist/`; the workflow uploads `dist/` and nothing else. The loop folders —
`drafts/`, `state/`, `inbox/` (and `ideas/`, `tools/`, `.claude/`) — are **not Vite inputs**,
so writing to them **never changes the deployed artifact**. The loop also commits on `claude/`
branches (PR-based review), and deploy triggers only on `main`, so loop runs don't reach the
deploy path at all.

> ⚠️ Caveat: the workflow has **no `paths:` filter**, so a commit that touches *only* loop
> folders *directly on `main`* would still run the workflow — it just rebuilds an identical
> `dist/`. That's wasted CI, not a content change. To avoid even that, keep loop commits on
> `claude/` branches (as the golden rules already require), or add a `paths-ignore:` for the
> loop folders to `deploy.yml`.
