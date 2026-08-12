---
phase: 01-live-homepage-design-foundation
plan: 05
subsystem: infra
tags: [walking-skeleton, cloudflare-pages, git-integration, auto-deploy, github-org, handoff, pages-dev, deployment, polish]

# Dependency graph
requires:
  - "01-03: Composed homepage (hero + verbatim core message, CTA, Aktualności empty state, quick-contact, SEO/noindex) — the content served live"
  - "01-04: Deployment-hygiene baseline (robots Disallow-all, _headers security baseline, favicon/OG, /deklaracja-dostepnosci stub) served on the live site"
provides:
  - "Repo hosted under the dedicated GitHub Org zlobekstromiec/zlobek-gminny-stromiec with main pushed (D-06/D-07)"
  - "Live Cloudflare Pages site on a public *.pages.dev URL (https://zlobek-gminny-stromiec.pages.dev)"
  - "git-integration auto-deploy: push to main → npm run build → deploy .svelte-kit/cloudflare (SITE-01 criterion #6, proven end-to-end)"
  - "docs/dev-env.md records the live URL, Pages project id, confirmed build settings, and the Workers-vs-Pages reconnect gotcha for handoff"
affects: [live-homepage-design-foundation, cms-content-editing, forms-email, launch-seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cloudflare Pages git-integration (not Wrangler CLI deploy): dashboard-connected repo, push to main auto-builds+deploys the whole site"
    - "Pages project (pages_build_output_dir=.svelte-kit/cloudflare), NOT a git-connected Worker — the Workers 'npx wrangler deploy' flow is the wrong flavor and fails first deploy"
    - "Dedicated GitHub Org + Cloudflare account rooted to the project Gmail for clean owner transfer (no personal-account coupling, D-06/D-07)"
    - "Auto-redeploy verified via the Pages deployments API: github:push trigger + matching commit_hash reaching deploy/success"

key-files:
  created: []
  modified:
    - "docs/dev-env.md"

key-decisions:
  - "Recorded the live URL and Pages project id/account in docs/dev-env.md so redeploy/handoff is self-documenting"
  - "Documented the Cloudflare dashboard gotcha (new 'Import a repository' funnels into the Workers builder, which deploys via npx wrangler deploy and fails for our pages_build_output_dir project) with the Pages deep link, so a reconnect never repeats the failed-Worker detour"
  - "Proved auto-redeploy by pushing the docs/dev-env.md commit itself — a real push to main that triggers a full SvelteKit rebuild+redeploy, no need to mutate the LOCKED homepage content"

requirements-completed: [SITE-01]

# Metrics
duration: ~15min
completed: 2026-08-12
status: complete
---

# Phase 1 Plan 05: Live Cloudflare Pages Deploy (Walking Skeleton) Summary

**The walking skeleton is live end-to-end: the repo is hosted under the dedicated GitHub Org `zlobekstromiec/zlobek-gminny-stromiec`, Cloudflare Pages git-integration is connected, the joyful mobile-first homepage serves on a public `*.pages.dev` URL (https://zlobek-gminny-stromiec.pages.dev), and every `git push` to `main` automatically rebuilds and redeploys — proven by a github:push-triggered deployment reaching deploy/success (SITE-01 criterion #6).**

## Performance

- **Duration:** ~15 min (continuation after the human-action dashboard checkpoint)
- **Completed:** 2026-08-12
- **Tasks:** 3 (Task 1 code commit, Task 2 dashboard human-action, Task 3 live-verify + auto-redeploy proof)
- **Files:** 1 modified (`docs/dev-env.md`)

## What shipped

- **Task 1 (prior executor, commit `1caa831`):** Repo created under the dedicated Org and `main` pushed; repo URL recorded in `docs/dev-env.md`. `origin` → `https://github.com/zlobekstromiec/zlobek-gminny-stromiec.git`.
- **Task 2 (human-action, dashboard):** User connected Cloudflare Pages to the repo via git-integration (preset SvelteKit, build `npm run build`, output `.svelte-kit/cloudflare`, `NODE_VERSION=22`); first deployment succeeded (`5f01285b`). Verified by the orchestrator.
- **Task 3 (this continuation, commit `4eb9832`):** Recorded the live URL + Pages project id + confirmed build settings + the Workers-vs-Pages reconnect gotcha in `docs/dev-env.md`; pushed to `main` and proved auto-redeploy live.

## Verification evidence

**Auto-redeploy (SITE-01 criterion #6) — proven:**
- Push `1caa831..4eb9832` to `main` triggered a new Pages deployment `9da1358a`.
- Pages deployments API: `deployment_trigger.type = github:push`, `commit_hash = 4eb9832`, progressed `build/active → deploy/success`.

**Live production URL (https://zlobek-gminny-stromiec.pages.dev):**
- `HTTP/2 200`; `<html lang="pl">`; `noindex` meta present (D-11 posture).
- Verbatim core message ("…czuwać nad każdym…"), footer BIP link (`naszbip.pl/zlobek`), Aktualności section all render.
- Security headers served from `_headers`: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- Subroutes: `/deklaracja-dostepnosci` → 200 (Polish stub, not 404); `/robots.txt` → 200 with `Disallow: /`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prettier reformatted `docs/dev-env.md` before commit**
- **Found during:** Task 3 (pre-commit gate)
- **Issue:** The added Markdown table rows changed column widths; `prettier --check` (pre-commit `lint` hook) failed on `docs/dev-env.md`.
- **Fix:** Ran `npx prettier --write docs/dev-env.md`, re-staged, committed green.
- **Files modified:** `docs/dev-env.md`
- **Commit:** `4eb9832`

### Human-action checkpoint (normal flow, not a defect)

Task 2 is a `checkpoint:human-action` by design — the Cloudflare Pages git-integration connect is a dashboard flow with no CLI equivalent. The user completed it and returned "success". Two dashboard friction points surfaced during the manual connect and are now documented in `docs/dev-env.md` so a reconnect/handoff never repeats them:

1. **"GitHub App already installed":** resolved by granting the org-installed `cloudflare-workers-and-pages` app access to the repo (installation was scoped to selected repositories).
2. **Workers-vs-Pages dashboard trap:** the new dashboard "Import a repository" flow defaults to the **Workers** builder, which deploys via `npx wrangler deploy` — the wrong flavor for our `pages_build_output_dir` project (that git-connected Worker's first deploy failed and was deleted). The Pages project was then created via the deep link `dash.cloudflare.com/<account>/pages/new/provider/github`.

## Requirements

- **SITE-01** — SvelteKit app deployed on Cloudflare with automatic git deploys → **complete** (live on `*.pages.dev`, auto-redeploy proven).

## Notes for downstream phases

- Phase 2 (CMS): the same Org repo hosts the Sveltia CMS OAuth App; keep the dedicated-account isolation intact for handoff.
- Phase 4 (email) / Phase 6 (domain): `zlobekstromiec.pl` is still NOT purchased; the custom domain + Resend SPF/DKIM/DMARC come later. Phase 1 stays on `*.pages.dev` with the noindex/robots-disallow posture until launch (D-11).

## Self-Check: PASSED

- `docs/dev-env.md` updated and committed (`4eb9832`).
- `.planning/phases/01-live-homepage-design-foundation/01-05-SUMMARY.md` — FOUND.
- Commits verified in git history: `1caa831` (Task 1), `4eb9832` (Task 3).
- Live deployment `9da1358a` (github:push, commit `4eb9832`) reached deploy/success; production URL serves HTTP 200 with expected content + headers.
