---
phase: 03-news-aktualno-ci
plan: 06
subsystem: testing
tags: [sveltekit, node-test, type-guards, wcag, resilience, aktualnosci]

# Dependency graph
requires:
  - phase: 03-05
    provides: ISO YYYY-MM-DD storage + ISO parseData in src/lib/server/aktualnosci.ts
provides:
  - Type-guarded, unit-tested aktualnosci reader that skips one malformed entry with a warning instead of aborting the whole prerender (WR-02)
  - Node built-in (node:test) reader-resilience unit suite + test:unit script (no new dependency)
  - Polish document title on every error/404 response, guarded by an automated 404 case (WR-04)
affects: [aktualnosci, error-handling, cms-content-editing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reader hardening via an exported per-entry mapper (postFromEntry) that skip-with-warns on malformed content, mirroring dokumenty.ts withMeta"
    - "Dependency-free regression tests via Node's built-in node:test runner + native TypeScript type-stripping, kept outside Playwright's spec|test matcher by a .unit.ts suffix"

key-files:
  created:
    - tests/aktualnosci-reader.unit.ts
  modified:
    - src/lib/server/aktualnosci.ts
    - package.json
    - src/routes/+error.svelte
    - tests/aktualnosci.spec.ts

key-decisions:
  - "parseData now accepts unknown and type-guards first; a 1-31 day-range check was added alongside the existing month check to stop 45 corrupting <time datetime>/sort"
  - "Reader-resilience test uses node:test (built-in) rather than adding a runner dependency; type-stripping ran cleanly on the import.meta.glob<PostEntry> type argument so it was kept"
  - "Error-page <title> is composed only from fixed is404-gated Polish strings + the constant site name; page.error is never reflected into <head> (T-03-06-03)"

patterns-established:
  - "Per-entry skip-with-warning mapper (postFromEntry) as the single content-resilience seam for the news reader"
  - "*.unit.ts naming convention for fast Node-native unit tests that must not be collected by Playwright"

requirements-completed: [NEWS-01, NEWS-02]

coverage:
  - id: D1
    description: "One malformed/hand-edited post JSON (missing/non-string data or tresc, or out-of-range date) is skipped with a console.warn and the full prerender still completes (WR-02)"
    requirement: "NEWS-01"
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry returns null without throwing when data is missing"
        status: pass
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts (list + single-post suites, 12 cases against real prerendered output)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Out-of-range month/day dates are rejected by parseData rather than emitting an invalid <time datetime> and corrupting the sort key (T-03-06-02)"
    requirement: "NEWS-01"
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#parseData rejects an out-of-range day / month"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every error/404 response ships a non-empty Polish document <title> (WCAG 2.4.2, Level A), not reflecting request-derived text into <head> (WR-04)"
    requirement: "NEWS-02"
    verification:
      - kind: e2e
        ref: "tests/aktualnosci.spec.ts#nieznany slug zwraca 404 (D-08)"
        status: pass
    human_judgment: false

# Metrics
duration: 7min
completed: 2026-08-13
status: complete
---

# Phase 03 Plan 06: Reader Resilience + Error-Page Title Summary

**Type-guarded, unit-tested aktualnosci reader that skips one bad post instead of aborting the whole build (WR-02), plus a Polish document title on every error/404 response (WR-04).**

## Performance

- **Duration:** 7 min
- **Started:** 2026-08-13T22:31Z
- **Completed:** 2026-08-13T22:38Z
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Hardened `src/lib/server/aktualnosci.ts`: `parseData` now accepts `unknown` with a `typeof` guard and a 1-31 day-range check; a new exported `postFromEntry(path, entry)` mapper skips a malformed entry with a `console.warn` and returns null (the `dokumenty.ts` `withMeta` precedent), so a single missing/hand-edited `data`/`tresc`/`tytul` can no longer abort the whole-site prerender.
- Pinned the WR-02 resilience contract with `tests/aktualnosci-reader.unit.ts` (Node built-in `node:test`, 10 cases) and a `test:unit` script — no new dependency, and the `.unit.ts` suffix keeps it out of Playwright's `spec|test` matcher.
- Gave `+error.svelte` a `<svelte:head><title>` built from fixed `is404`-gated Polish strings + the site name (never `page.error`), closing the WCAG 2.4.2 Level A gap; strengthened the D-08 404 Playwright case to assert a non-empty title.

## Task Commits

Each task was committed atomically:

1. **Task 1: Harden the reader (WR-02)** - `f5591bd` (fix)
2. **Task 2: Pin the resilience contract with a node:test suite + test:unit (WR-02 proof)** - `1bcd637` (test)
3. **Task 3: Error-page document title + strengthened 404 assertion (WR-04)** - `ec45b3d` (fix)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified
- `src/lib/server/aktualnosci.ts` - `parseData` exported + `unknown`/day-range guards; new exported `postFromEntry`; `readAktualnosci` maps through it and filters nulls (sort unchanged).
- `tests/aktualnosci-reader.unit.ts` - New Node `node:test` suite pinning the parseData/postFromEntry resilience guards.
- `package.json` - New `test:unit` script (`node --test tests/aktualnosci-reader.unit.ts`).
- `src/routes/+error.svelte` - New `<svelte:head><title>` from fixed is404-gated Polish strings + site name.
- `tests/aktualnosci.spec.ts` - Strengthened D-08 404 case now asserts a non-empty Polish document title.

## Decisions Made
- Kept the `import.meta.glob<PostEntry>` type argument: Node's native type-stripping handled it cleanly when the unit test imports the module, so the plan's fallback (drop the type param + cast) was not needed.
- Error-page title uses a pipe separator (`Nie znaleziono strony | Żłobek Gminny w Stromcu`) to honor the no-em-dash copy rule.

## Deviations from Plan

None - plan executed exactly as written. All three tasks landed with their specified files, verifications, and acceptance criteria.

## Issues Encountered
- Prettier flagged formatting on the new unit test file; ran `prettier --write` before the Task 2 commit (routine format pass, not a logic change).

## User Setup Required
None - no external service configuration required. The resilience test uses Node's built-in `node:test`; no package install occurred.

## Next Phase Readiness
- Phase 03 gap-closure Blockers WR-02 and WR-04 are both closed; the reader is now resilient to imperfect CMS/hand-edited content and every error state is accessible.
- `npm run test:unit` is a new fast gate that fails if either type guard is removed; consider wiring it into the pre-commit / CI chain alongside the Playwright suite.

## Self-Check: PASSED

---
*Phase: 03-news-aktualno-ci*
*Completed: 2026-08-13*
