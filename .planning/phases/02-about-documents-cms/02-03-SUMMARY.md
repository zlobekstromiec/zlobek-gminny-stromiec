---
phase: 02-about-documents-cms
plan: 03
subsystem: ui
tags: [sveltekit, svelte5-runes, prerender, dokumenty, wcag, playwright]

# Dependency graph
requires:
  - phase: 02-02
    provides: shared build-time resolver src/lib/server/dokumenty.ts (statSync type/size meta) + dokumenty collection JSON
provides:
  - Homepage recruitment docs panel re-sourced from the shared dokumenty collection (single source, D-18)
  - src/routes/+page.server.ts curated rekrutacja-subset build load (name + meta + href)
  - Recruitment.svelte docs-via-prop + "Zobacz wszystkie dokumenty" see-all link
affects: [cms, verify-work, phase-04-forms]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Homepage build load (+page.server.ts) consuming the same server-only resolver as a sibling route so their data cannot drift"
    - "Curated collection subset via kategoria filter, rendered through a prop (Svelte 5 $props) instead of a hard-coded content array"

key-files:
  created:
    - src/routes/+page.server.ts
  modified:
    - src/lib/components/Recruitment.svelte
    - src/routes/+page.svelte
    - src/lib/content/site.ts
    - tests/home.spec.ts

key-decisions:
  - "Curated subset = every rekrutacja-category document from the shared collection (Wniosek o przyjęcie dziecka, Regulamin rekrutacji): exactly 2 rows, real names/meta, no hard-coded count in site.ts"
  - "Homepage docs rows now link the real hosted file path (entry.plik) instead of a generic /dokumenty anchor, so each meta+href pair is build-verified against disk"
  - "News-empty assertion tightened to exact:true so the new see-all link does not trip it (lockstep with D-18, not a weakening)"

patterns-established:
  - "Single-source docs: two routes read one src/lib/server/dokumenty.ts resolver; names/meta/hrefs provably cannot diverge"
  - "Test lockstep: acceptance assertions change only alongside an approved UI-SPEC amendment, never to force a green suite"

requirements-completed: [DOCS-01]

coverage:
  - id: D1
    description: "Homepage docs panel shows the real BIP names with computed type/size/wersja meta INSIDE each link, curated to the 2 rekrutacja documents"
    requirement: DOCS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#recruitment module: heading, four steps, curated BIP docs panel (HOME-02, D-18)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Homepage panel is sourced from the same dokumenty collection as /dokumenty (single source, no drift) and offers a 'Zobacz wszystkie dokumenty' see-all link"
    requirement: DOCS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#recruitment module (see-all link -> /dokumenty assertion)"
        status: pass
      - kind: integration
        ref: "npm run check (svelte-check: +page.server.ts imports $lib/server/dokumenty)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Three non-BIP documents (Regulamin organizacyjny, Upoważnienie do odbioru dziecka, Oświadczenia RODO) removed from the homepage panel; single-mailto and other Phase 1 assertions untouched"
    requirement: DOCS-01
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts (.doc-row count == 2; single-mailto assertion still green)"
        status: pass
    human_judgment: false

# Metrics
duration: 3min
completed: 2026-08-13
status: complete
---

# Phase 02 Plan 03: Homepage docs-panel realignment (D-18) Summary

**Homepage recruitment docs panel re-sourced from the shared dokumenty collection so its real BIP names, type/size/wersja meta, and hrefs can never drift from /dokumenty, with a curated 2-row subset plus a see-all link and the acceptance suite updated in lockstep.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-13T12:44Z
- **Completed:** 2026-08-13T12:47:32Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments
- Homepage docs panel now derives from `readDokumenty()` (the same resolver as /dokumenty), filtered to the rekrutacja category: exactly the two real documents "Wniosek o przyjęcie dziecka" and "Regulamin rekrutacji", each with build-computed `TYPE · SIZE · wersja z DATE` meta inside its link.
- Added `src/routes/+page.server.ts` build load; `Recruitment.svelte` now takes `docs` via `$props` and renders a "Zobacz wszystkie dokumenty" link to /dokumenty.
- Removed the stale hard-coded `recruitment.docs` array (with its three non-existent BIP docs) from `site.ts`; heading/deadline/body/infoCard/steps untouched.
- `tests/home.spec.ts` updated in lockstep (RED then GREEN): count 6→2, real BIP name with meta-inside-link, see-all link assertion; single-mailto, core-message, key-facts, perks, hero assertions untouched. Full suite green (43 passed).

## Task Commits

Each task was committed atomically:

1. **Task 1: Update home.spec.ts to the real BIP set (lockstep, RED)** - `7e27984` (test)
2. **Task 2: Re-source the homepage docs panel from the shared collection (GREEN)** - `0428672` (feat)

## Files Created/Modified
- `src/routes/+page.server.ts` - New build load: curated rekrutacja subset (name + meta + href) via the shared resolver
- `src/lib/components/Recruitment.svelte` - `docs` prop replaces `recruitment.docs`; adds the see-all link + `.see-all` style
- `src/routes/+page.svelte` - Consumes `PageData`, passes `<Recruitment docs={data.docs} />`
- `src/lib/content/site.ts` - Removed the `recruitment.docs` array; replaced the PLACEHOLDER comment with a D-18 note
- `tests/home.spec.ts` - Recruitment-module test realigned; news-empty assertion made `exact:true`

## Decisions Made
- Curated subset defined by `kategoria === 'rekrutacja'` rather than a name allow-list, so adding/removing a rekrutacja doc in the collection automatically flows to the homepage panel with zero code change.
- Homepage rows link the real file path (`entry.plik`), not a generic `/dokumenty` anchor, so the panel points at the actual hosted file.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] News-empty assertion collided with the new see-all link**
- **Found during:** Task 2 (GREEN verification)
- **Issue:** The Phase 1 assertion `getByRole('link', { name: 'Zobacz wszystkie' })` uses Playwright's default substring match. The new, D-18-mandated "Zobacz wszystkie dokumenty" link matched it, failing the "no Aktualności section" test.
- **Fix:** Added `exact: true` so the assertion targets ONLY the news CTA (whose text is exactly "Zobacz wszystkie"). This preserves the news-empty guard fully (does not weaken it) and is part of the D-18 lockstep since this plan introduced the colliding link.
- **Files modified:** tests/home.spec.ts
- **Verification:** Full suite green (43 passed); both the news-empty test and the new recruitment-module test pass.
- **Committed in:** `0428672` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix tightens an existing assertion to remain precise under the new link; no scope creep, no assertion weakened.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plans 02-04 (CMS) and 02-05 remain in this phase.
- The homepage and /dokumenty now share one resolver; any future documents added to the collection surface on both surfaces without code changes.
- Documents are still placeholder-flagged (D-14 seed); real hosted files and wizerunek/consent content remain pre-launch tasks.

## Self-Check: PASSED
- FOUND: src/routes/+page.server.ts
- FOUND commit 7e27984 (test RED)
- FOUND commit 0428672 (feat GREEN)

---
*Phase: 02-about-documents-cms*
*Completed: 2026-08-13*
