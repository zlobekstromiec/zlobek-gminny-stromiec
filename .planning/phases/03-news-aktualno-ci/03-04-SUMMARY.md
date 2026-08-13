---
phase: 03-news-aktualno-ci
plan: 04
subsystem: ui
tags: [sveltekit, svelte5, runes, prerender, homepage, newspreview, wcag, playwright, axe]

# Dependency graph
requires:
  - phase: 03-news-aktualno-ci
    provides: "readLatest(n) build-time news reader + shared NewsCard (Plan 01); /aktualnosci/[slug] single-post routes the homepage cards link into (Plan 02)"
provides:
  - "Data-driven NewsPreview (posts prop) rendering the shared NewsCard per post"
  - "Homepage +page.server.ts load returning readLatest(3) alongside the docs subset"
  - "Homepage surfacing of the three newest posts, newest-first, linking into /aktualnosci/{slug}"
  - "Extended client-safe Post type in site.ts; the empty posts stub removed"
  - "Lockstep-updated tests/home.spec.ts news-present acceptance case"
affects: [cms-aktualnosci-collection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Homepage curated subset re-sourced from the shared build-time reader (single source, mirrors the D-18 docs re-source)"
    - "Client-safe Post type in $lib/content/site typing a component prop that is structurally compatible with the server-only PostWithMeta"
    - "$derived over a load-data expression to satisfy svelte-check's state_referenced_locally guard"

key-files:
  created: []
  modified:
    - "tests/home.spec.ts"
    - "src/routes/+page.server.ts"
    - "src/lib/components/NewsPreview.svelte"
    - "src/routes/+page.svelte"
    - "src/lib/content/site.ts"

key-decisions:
  - "NewsPreview keeps the empty-state block as an {:else} safety net; the homepage gates the component on data.posts.length so it never renders there (Amendment v1.1 §1)"
  - "Post type widened to the NewsCard field set and made structurally compatible with PostWithMeta, so readLatest(3) output types the prop with no adapter/mapping layer"
  - "showNews derived with $derived (not plain const) to avoid the state_referenced_locally warning, matching dokumenty/+page.svelte precedent"

patterns-established:
  - "The homepage NewsPreview and the /aktualnosci list now consume one shared reader and one shared card — they cannot drift"

requirements-completed: [NEWS-01]

coverage:
  - id: D1
    description: "The homepage renders the NewsPreview section (heading Aktualności) sourced from the shared reader at build"
    requirement: NEWS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Homepage news cards link to /aktualnosci/{slug} (newest to the 2026-08-01 post) and the section see-all link targets /aktualnosci"
    requirement: NEWS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The homepage shows at most the three newest posts (curated subset, 3-column grid)"
    requirement: NEWS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The homepage reports zero WCAG 2.1 AA violations with the news section present (axe)"
    requirement: NEWS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#no WCAG 2.1 AA violations (SITE-04 / A11Y baseline)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The homepage news card links resolve to real prerendered [slug] pages (crawler enforcement, no broken internal links)"
    requirement: NEWS-01
    verification:
      - kind: manual_procedural
        ref: "npm run build stays green with /aktualnosci crawler-enforced (Plan 02 removed the KNOWN_FUTURE_ROUTES entry); homepage prerenders with resolvable card hrefs"
        status: pass
    human_judgment: false

# Metrics
duration: 5min
completed: 2026-08-13
status: complete
---

# Phase 3 Plan 04: Homepage NewsPreview realignment (NEWS-01) Summary

**The homepage now surfaces the three newest posts as accessible cards linking into the single-post pages: NewsPreview is data-driven with the shared NewsCard, the build-time load supplies readLatest(3), the empty stub is gone, and the home acceptance suite is updated in lockstep and green.**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-08-13
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Homepage NewsPreview closes the visitor news loop: a parent landing on the homepage sees the three newest posts (newest-first) and can jump straight into a full post
- `NewsPreview` is now data-driven — a `posts` prop renders the shared `NewsCard` in a responsive 1/2/3-column grid; the empty state survives only as an `{:else}` safety net the gated homepage never reaches
- The homepage `+page.server.ts` load re-sources the news feed from the SAME shared `readLatest(3)` reader as `/aktualnosci` (single source, mirrors the D-18 docs re-source) — the two surfaces cannot drift
- The `export const posts` empty stub is removed from `site.ts`; the `Post` type is widened to the `NewsCard` field set and stays client-safe (typing the component prop without importing the server-only reader)
- `tests/home.spec.ts` updated in lockstep: the old absence assertions are replaced by news-present presence assertions (heading visible, exact see-all link to `/aktualnosci`, seed title, `/aktualnosci/{slug}` card href, at most 3 cards); the whole-page axe case is unchanged and all 15 homepage cases plus the full 55-case suite are green

## Task Commits

Each task was committed atomically:

1. **Task 1: Lockstep-update the homepage spec to assert the news section renders (RED)** - `cebd562` (test)
2. **Task 2: Source the three newest posts into the homepage build-time load** - `b0813fb` (feat)
3. **Task 3: Make NewsPreview data-driven and gate the homepage news section** - `df0b3c6` (feat)

## Files Created/Modified
- `tests/home.spec.ts` - Replaced the empty-stub absence assertions with news-present presence assertions (documented as an approved Amendment v1.1 realignment, D-18 lockstep discipline)
- `src/routes/+page.server.ts` - Imports `readLatest`, computes `posts = readLatest(3)` alongside the existing docs subset, returns `{ docs, posts }`; docs logic and D-18 comment untouched
- `src/lib/components/NewsPreview.svelte` - Data-driven: `posts` prop (Svelte 5 runes) renders the shared `NewsCard` per post in a responsive card grid (24px gap, no new tokens); empty state moved to `{:else}` safety net
- `src/routes/+page.svelte` - Dropped the `site.ts` posts import; `showNews` derived from `data.posts.length` via `$derived`; renders `{#if showNews}<NewsPreview posts={data.posts} />`
- `src/lib/content/site.ts` - Extended the `Post` type to the NewsCard field set (tytul/href/iso/dataDisplay/excerpt/obraz/obraz_alt), removed the `export const posts` empty stub

## Decisions Made
- None beyond the plan. Keeping the empty state as an `{:else}` safety net, widening the `Post` type to be structurally compatible with `PostWithMeta`, and deriving `showNews` were all specified by the plan; the `$derived` shape follows the dokumenty/+page.svelte precedent the plan pointed to.

## Deviations from Plan

None - plan executed exactly as written. (One mechanical, non-behavioral adjustment: `showNews` was declared with `$derived` rather than a plain `const` to satisfy svelte-check's `state_referenced_locally` guard — the same pattern Plan 02 and dokumenty/+page.svelte already use. No runtime behavior change.)

## Known Stubs

None. The `export const posts` empty stub was removed as planned; the homepage now derives its feed from the shared reader at build. The `NewsPreview` empty `{:else}` branch is an intentional safety net (never rendered on the gated homepage), not an unwired stub.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The visitor news experience is complete end to end: list (`/aktualnosci`), single post (`/aktualnosci/[slug]`), and homepage surfacing all consume the one shared `readAktualnosci`/`readLatest` reader and the one shared `NewsCard`.
- The homepage news card links are crawler-enforced (Plan 02 removed the allow-list entry), so any future broken news link fails the build.
- Plan 03 already wired the Sveltia CMS aktualnosci collection; editors publishing a new post will see it surface newest-first on both `/aktualnosci` and the homepage on the next build with no further code changes.

## Self-Check: PASSED

All 5 modified files verified on disk; all 3 task commits (cebd562, b0813fb, df0b3c6) verified in git history; `npm run check`, `npm run lint`, the full 55-case Playwright suite, and the production build are all green.

---
*Phase: 03-news-aktualno-ci*
*Completed: 2026-08-13*
