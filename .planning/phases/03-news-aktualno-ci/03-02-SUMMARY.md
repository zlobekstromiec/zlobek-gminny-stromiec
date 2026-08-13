---
phase: 03-news-aktualno-ci
plan: 02
subsystem: ui
tags: [sveltekit, svelte5, prerender, entries, marked, xss-hardening, enhanced-img, wcag, playwright, axe]

# Dependency graph
requires:
  - phase: 03-news-aktualno-ci
    provides: "readAktualnosci() build-time reader (slug/iso/dataDisplay/excerpt), NewsCard, seeded aktualnosci folder collection, tests/aktualnosci.spec.ts list cases"
  - phase: 02-about-documents-cms
    provides: "renderInline hardened inline renderer (escapeHtml/SAFE_HREF), o-nas {@html} + enhanced-img by-basename prose pattern, Seo/Cta components"
provides:
  - "renderPost() — hardened full-block Markdown renderer in src/lib/markdown.ts (raw HTML escaped, images to alt, unsafe hrefs dropped, headings neutralized to paragraphs, GFM tables dropped)"
  - "/aktualnosci/[slug] single-post route (NEWS-02): entries() prerenders every slug, load() 404s unknown slugs, single-h1 zero-JS article"
  - "src/routes/+error.svelte — friendly Polish 404/error page via the $app/state page rune"
  - "Crawler enforcement of all /aktualnosci links (KNOWN_FUTURE_ROUTES entry removed)"
  - "Single-post acceptance cases in tests/aktualnosci.spec.ts (200, single h1, time datetime, full body, back link, unknown-slug 404, axe AA)"
affects: [homepage-newspreview, cms-aktualnosci-collection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Second Marked instance for full-block body render, reusing the vetted escapeHtml/SAFE_HREF (no duplication)"
    - "EntryGenerator sourced from the shared build-time reader so the prerender crawler emits one static HTML file per real slug"
    - "Root +error.svelte reading the $app/state page rune (not deprecated $app/stores), zero-JS and prerender-friendly"

key-files:
  created:
    - "src/routes/aktualnosci/[slug]/+page.server.ts"
    - "src/routes/aktualnosci/[slug]/+page.svelte"
    - "src/routes/+error.svelte"
  modified:
    - "src/lib/markdown.ts"
    - "svelte.config.js"
    - "tests/aktualnosci.spec.ts"

key-decisions:
  - "renderPost is a second Marked instance reusing escapeHtml/SAFE_HREF (declared once at module scope) rather than a new sanitizer — one vetted allow-list, two entry points"
  - "Headings in the body are neutralized to paragraphs so the post's single h1 (tytul) is never rivalled — protects both the a11y single-h1 contract and the stored-XSS boundary"
  - "entries() reads readAktualnosci().map(p => ({ slug })) so the crawler, list, and homepage all consume one source and cannot drift"
  - "svelte.config.js drops /aktualnosci from KNOWN_FUTURE_ROUTES; the [slug] posts are covered by entries(), not the allow-list, so broken internal news links now fail the build (Pitfall 2)"

patterns-established:
  - "Hardened full-block renderPost is the single body renderer for any future long-form CMS field"
  - "Root +error.svelte is the site-wide friendly error surface for all thrown 404s/errors"

requirements-completed: [NEWS-02]

coverage:
  - id: D1
    description: "A visitor opening /aktualnosci/2026-08-01-wielkie-otwarcie-zlobka gets HTTP 200 and reads the full post body (NEWS-02)"
    requirement: NEWS-02
    verification:
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#wpis /aktualnosci/{slug} odpowiada statusem 200"
        status: pass
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#pełna treść wpisu jest widoczna (NEWS-02)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every real post slug is prerendered to static HTML via entries()"
    requirement: NEWS-02
    verification:
      - kind: manual_procedural
        ref: "npm run build emits .svelte-kit/cloudflare/aktualnosci/{slug}.html for both seeds; build stays green with /aktualnosci enforced"
        status: pass
    human_judgment: false
  - id: D3
    description: "An unknown slug returns HTTP 404 and shows the friendly Polish +error.svelte page (D-08)"
    requirement: NEWS-02
    verification:
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#nieznany slug zwraca 404 (D-08)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The body renders a hardened FULL markdown parse (no headings/images/tables/raw-HTML reach the DOM); stored-XSS mitigation ASVS V5 (T-03-01)"
    requirement: NEWS-02
    verification:
      - kind: manual_procedural
        ref: "renderPost overrides: html->escape, image->alt, link->SAFE_HREF, heading->paragraph, table->'' ; npm run check green"
        status: pass
    human_judgment: false
  - id: D5
    description: "The single post has exactly one h1 (the tytul); axe reports zero WCAG 2.1 AA violations"
    requirement: NEWS-02
    verification:
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#dokładnie jeden nagłówek h1 z tytułem wpisu"
        status: pass
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#brak naruszeń WCAG 2.1 AA na stronie wpisu (SITE-04 / A11Y baseline)"
        status: pass
    human_judgment: false
  - id: D6
    description: "The post date renders inside <time datetime=\"YYYY-MM-DD\"> using the build-time genitive display"
    requirement: NEWS-02
    verification:
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#data wpisu jest maszynowo-czytelna w elemencie time (datetime = 2026-08-01)"
        status: pass
    human_judgment: false
  - id: D7
    description: "A cover renders via enhanced-img by basename; the D-01 seed (no obraz) omits the cover cleanly with no placeholder box"
    requirement: NEWS-02
    verification:
      - kind: manual_procedural
        ref: "Code review of the {#if cover} branch; D-01 seed has no obraz so no cover-band renders; enhanced-img by-basename mirrors o-nas/NewsCard"
        status: pass
    human_judgment: true
    rationale: "The no-seed-has-a-cover path is exercised in build; the informative-alt/radius-lg appearance of a real cover is a design-conformance judgment deferred to end-of-phase UAT (no seed currently carries an image)."

# Metrics
duration: 8min
completed: 2026-08-13
status: complete
---

# Phase 3 Plan 02: Aktualności single-post route (NEWS-02) Summary

**A hardened full-block renderPost, the /aktualnosci/[slug] route with entries()-prerendered slugs and a friendly Polish 404, plus crawler enforcement of every news link — a visitor can now click a card and read a full, sanitized post**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-08-13
- **Tasks:** 3
- **Files created:** 3 (+ 3 modified)

## Accomplishments
- `/aktualnosci/[slug]` single-post route live: newest seed renders its full body at a machine-readable date, zero-JS prerendered, with a "Wszystkie aktualności" back link and a closing CTA
- `renderPost()` added to `$lib/markdown` — a second Marked instance reusing the vetted `escapeHtml`/`SAFE_HREF`: raw HTML escaped, images flattened to alt text, unsafe hrefs dropped, headings neutralized to paragraphs, GFM tables dropped (T-03-01 stored-XSS boundary, ASVS V5)
- `src/routes/+error.svelte` shipped: friendly Polish 404/error page reading the `$app/state` page rune, zero-JS, with links back to home and Aktualności (D-08)
- Crawler enforcement turned on: `/aktualnosci` removed from `KNOWN_FUTURE_ROUTES`; the `[slug]` posts are covered by `entries()`, so any broken internal news link now fails the build (Pitfall 2)
- Both seed slugs prerender to static HTML; `npm run check`, `npm run lint`, the full 12-case `tests/aktualnosci.spec.ts`, and the production build are all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Append single-post acceptance cases (RED)** - `2ae88b8` (test)
2. **Task 2: Hardened full-block renderPost** - `9b60d2d` (feat)
3. **Task 3: [slug] route, error page, crawler enforcement** - `e364ed3` (feat)

## Files Created/Modified
- `src/routes/aktualnosci/[slug]/+page.server.ts` - `entries` (EntryGenerator over readAktualnosci) + `load` finding the post by slug or throwing error(404, 'Nie znaleziono wpisu')
- `src/routes/aktualnosci/[slug]/+page.svelte` - single-h1 `<article>`: header + `<time datetime>`, optional enhanced-img cover by basename, `{@html renderPost(post.tresc)}` prose (eslint-disable annotated), back link, closing Cta
- `src/routes/+error.svelte` - friendly Polish 404/generic-error page via the `$app/state` page rune, reusing page-head tokens
- `src/lib/markdown.ts` - added `renderPost` (blockMarked) reusing shared `escapeHtml`/`SAFE_HREF`; `renderInline` unchanged
- `svelte.config.js` - removed `/aktualnosci` from `KNOWN_FUTURE_ROUTES` (comment explains entries() coverage)
- `tests/aktualnosci.spec.ts` - appended NEWS-02 single-post describe block (7 cases); Plan 01 list cases untouched

## Decisions Made
- None beyond the plan. renderPost reusing the vetted escapeHtml/SAFE_HREF, headings-to-paragraphs, entries() from the shared reader, and dropping the allow-list entry were all specified by the plan and followed as written.

## Deviations from Plan

None - plan executed exactly as written. (Two mechanical, non-behavioral adjustments: prettier reformatted the appended spec block and the new `+page.svelte` on commit; and `post`/`cover`/`bodyHtml` were declared with `$derived` rather than plain `const` to satisfy svelte-check's `state_referenced_locally` guard — the same pattern dokumenty/+page.svelte already uses. No runtime behavior change.)

## Issues Encountered
None. The single `[404] GET /aktualnosci/nie-ma-takiego` line in the Playwright output is the expected server log from the unknown-slug 404 test, not a failure.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `renderPost` is available for any future long-form CMS body; `+error.svelte` is the site-wide friendly error surface.
- The visitor reading path (list -> open -> read) is complete; Plan 04 realigns the homepage NewsPreview to surface the newest posts, and Plan 05 wires the CMS aktualnosci collection.
- `/aktualnosci` and every post link are now crawler-enforced, so a broken news link will fail the build from here on.

## Self-Check: PASSED

All 3 created files verified on disk; markdown.ts/svelte.config.js/spec modifications in place; all 3 task commits (2ae88b8, 9b60d2d, e364ed3) verified in git history.

---
*Phase: 03-news-aktualno-ci*
*Completed: 2026-08-13*
