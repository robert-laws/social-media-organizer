![Masthead — an editorial desk with newspapers, fountain pen, and coffee](public/images/flat-layout-01.jpg)

# Masthead — Social Media Studio

A personal-brand command center for planning, scheduling, and monitoring social
media across **X, LinkedIn, Instagram, Facebook, and YouTube** — built around
three content pillars: *AI*, *AI in Higher Ed & Libraries*, and
*Creativity & Productivity with AI*.

Runs entirely as a static site on **GitHub Pages**. Your content data (drafts,
calendar, metrics) lives as JSON in a **separate private GitHub repo**, read
and written directly from the browser via the GitHub API.

## Features

- **Dashboard** — follower stats with deltas and sparklines, 7-day queue, pipeline counts, pillar balance
- **Calendar** — month view, drag posts between days to reschedule, status color-coding
- **Ideas** — kanban backlog (Sparks → Developing → Ready), one click promotes an idea to a post
- **Composer** — write the core idea once, adapt per platform with live character counters, per-pillar hashtag sets, copy-to-clipboard
- **Metrics** — one-minute weekly check-in form, growth charts per platform
- **Channel pages** — per-platform queue, follower chart, and live embeds of your published posts (X, Instagram, Facebook, YouTube embed natively; LinkedIn where possible)
- **Local-first** — works without any setup using browser storage; connect GitHub for sync + backup

## Setup

### 1. Deploy the app (one time)

1. Push this repo to GitHub (`main` branch).
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push.
4. Your app is live at `https://<username>.github.io/social-media-organizer/`.

> Renamed the repo? Update `base` in [vite.config.js](vite.config.js) to match.

### 2. Create your private data repo (one time)

1. Create a new **private** repo, e.g. `masthead-data` (initialize it with a README so the `main` branch exists).
2. Create a **fine-grained personal access token**:
   GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - **Repository access:** *Only select repositories* → your data repo
   - **Permissions:** Contents → **Read and write** (nothing else)
3. In the app: **Settings → GitHub sync** → paste the token, owner, repo name → **Test & connect**.

The app creates `data/posts.json`, `data/ideas.json`, `data/metrics.json`, and
`data/settings.json` in that repo as you work. Every change is a commit, so you
get full history and backup for free.

**Security note:** the token is stored only in your browser's localStorage and
only ever sent to `api.github.com`. Don't paste it on shared computers, and
scope it to the single data repo so the blast radius is minimal.

## Adding your own images

Images (profile photo, post cover images) are referenced by URL. Two ways to
get a URL:

**Option A — host in this repo (recommended):**

1. On GitHub, open this repo → `public/images/` folder.
2. **Add file → Upload files** → drag your image(s) in → **Commit changes**.
3. Wait ~1 minute for the site to redeploy, then use the URL
   `https://<username>.github.io/social-media-organizer/images/<filename>`.

This repo is public, so only upload images you'd post publicly anyway.

**Option B — any external URL:** your GitHub avatar
(`https://github.com/<username>.png`), a LinkedIn image URL, an Unsplash link,
etc. Paste it directly into the app.

Where URLs go in the app:
- **Settings → Profile photo URL** — shown on the dashboard
- **Composer → Cover image URL** — thumbnail on that post's channel-page card

## Local development

```bash
npm install
npm run dev
```

## Weekly rhythm that works

1. **Monday (5 min):** Metrics page — type current follower counts.
2. **Capture constantly:** any spark goes in the Ideas backlog.
3. **Planning session:** drag ideas to *Ready*, promote to posts, place them on the calendar.
4. **Publish:** copy the platform variant from the Composer, post natively, paste the live URL back.
5. **Review:** channel pages show what's live; the dashboard shows pillar balance — keep all three pillars in rotation.
