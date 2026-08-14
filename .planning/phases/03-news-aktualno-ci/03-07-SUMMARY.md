---
phase: 03-news-aktualno-ci
plan: 07
subsystem: testing
tags: [sveltekit, typescript, node-test, marked, prerender, input-validation]

# Dependency graph
requires:
  - phase: 03-news-aktualno-ci
    provides: "Plans 03-01..03-06: the aktualnosci reader, the list + [slug] routes, NewsCard/NewsPreview, the hardened markdown renderer, and the reader-resilience unit suite this plan extends"
provides:
  - "postFromEntry(path, entry: unknown) — the news pipeline's single validation boundary: every emitted field passes a type guard"
  - "readString(value: unknown) — the module's narrowing primitive for optional/required string fields"
  - "Explicitly-constructed PostWithMeta return value (no raw-entry object spread)"
  - "26-case unit suite pinning all four field guards plus the constructed-output key set"
  - "Build-level proof that a malformed post JSON costs one post, never the deploy"
affects: [04-rekrutacja-forms, 05-kontakt, 06-launch-domain, cms-content-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reader-as-validation-boundary: content readers take `unknown`, guard every field, and construct their result key by key; consumers carry no defensive guards"
    - "Key-set equality assertion (Object.keys(post).sort() === EXPECTED_POST_KEYS) as a durable anti-spread regression pin"
    - "Table-driven consumer-contract test: every malformed shape is piped through the real consumers (renderPost, cover basename split)"

key-files:
  created: []
  modified:
    - src/lib/server/aktualnosci.ts
    - tests/aktualnosci-reader.unit.ts

key-decisions:
  - "postFromEntry's second parameter is typed `unknown`, not `PostEntry` — the compile-time interface is a lie for hand-edited git-CMS JSON, and typing it `unknown` is what makes the compiler enforce every guard"
  - "The return value is constructed key by key from guarded locals; the raw-entry object spread is gone and is pinned out by a key-set equality assertion"
  - "`tresc` is validated unconditionally, before any excerpt logic, so a present `zajawka` can no longer skip the guard"
  - "Optional fields (zajawka, obraz, obraz_alt) degrade to undefined rather than rejecting the post: a wrong cover costs the image, not the article (D-01 tint fallback)"
  - "Guards live only in the reader; NewsCard.svelte and aktualnosci/[slug]/+page.svelte were deliberately left untouched so there is one place to maintain, not three"

patterns-established:
  - "Single validation boundary: untrusted git content is narrowed once, at the reader, and the narrowed types are the consumer contract"
  - "Mutation-proven guards: each guard has a unit case that turns red when the guard is deleted"

requirements-completed: [NEWS-01, NEWS-02]

coverage:
  - id: D1
    description: "A post JSON with a non-empty zajawka but a missing or non-string tresc is skipped with a warning instead of aborting the prerender (residual WR-02 / T-03-07-01)"
    requirement: NEWS-02
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry returns null when zajawka is present but tresc is missing"
        status: pass
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry hands consumers a safe post or null for: zajawka present without tresc"
        status: pass
      - kind: other
        ref: "npm run build with src/lib/content/aktualnosci/2026-08-05-uszkodzony-wpis-testowy.json present — exit 0, log contains 'aktualnosci: skipping ... (missing or non-string tresc)', both valid seeds still prerendered"
        status: pass
    human_judgment: false
  - id: D2
    description: "A non-string obraz / obraz_alt degrades to undefined so the card and the single-post page fall back to the D-01 tint instead of throwing on the basename split (T-03-07-02)"
    requirement: NEWS-01
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry degrades a non-string obraz to undefined"
        status: pass
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry degrades a non-string obraz_alt to undefined"
        status: pass
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry hands consumers a safe post or null for: obraz as a number | obraz as an object"
        status: pass
    human_judgment: false
  - id: D3
    description: "A post entry that is not a plain JSON object (null, array, bare string, number) is skipped with a warning instead of throwing on property access (T-03-07-04)"
    requirement: NEWS-01
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry returns null without throwing when the entry is null | is a bare string"
        status: pass
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry hands consumers a safe post or null for: entry is null | entry is an array | entry is a number"
        status: pass
    human_judgment: false
  - id: D4
    description: "Every value on a returned PostWithMeta was produced by a type guard; an unknown extra key in the source JSON does not reach a consumer (T-03-07-03)"
    requirement: NEWS-01
    verification:
      - kind: unit
        ref: "tests/aktualnosci-reader.unit.ts#postFromEntry exposes exactly the known post keys and drops unknown source fields"
        status: pass
      - kind: other
        ref: "Mutation check: reintroducing `...record` into the return literal turns npm run test:unit red (exit 1)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Removing any one of the tytul / data / tresc / obraz guards turns the unit suite red"
    verification:
      - kind: other
        ref: "Mutation check: each of the four guards neutralized in turn -> npm run test:unit exit 1; restored -> exit 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "No regression to NEWS-01/02/03 rendering: both seeds render newest-first with Polish genitive dates, homepage preview and single-post route unchanged"
    requirement: NEWS-01
    verification:
      - kind: e2e
        ref: "npm run test -- tests/aktualnosci.spec.ts tests/home.spec.ts (27 passed)"
        status: pass
    human_judgment: false

# Metrics
duration: 4min
completed: 2026-08-14
status: complete
---

# Phase 03 Plan 07: Reader Output Fully Guarded Summary

**`postFromEntry` now takes `unknown`, validates every field it emits, and constructs its result key by key, so a hand-edited or half-committed post JSON costs one post instead of the whole Cloudflare deploy.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-14T02:54:21Z
- **Completed:** 2026-08-14T02:58:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Closed the single residual blocker from `03-VERIFICATION.md` (also WR-01 in `03-REVIEW.md`): `tresc` is now guarded unconditionally, before the excerpt logic, so a present `zajawka` can no longer let `marked.parse(undefined)` abort the `entries()`-driven prerender of `/aktualnosci/[slug]`.
- Closed the bug class rather than the bug: the parameter type changed from `PostEntry` to `unknown`, a plain-object guard runs before any property access, and the return statement is an explicit 12-key literal built from guarded locals. Nothing that did not pass a guard can reach a consumer.
- A non-string `obraz` / `obraz_alt` now degrades to `undefined`, which lands the card and the single-post page on the existing D-01 tint fallback instead of a `TypeError` at the basename split.
- Proved it at build level, not just in unit assertions: with a malformed post JSON in the content folder, `npm run build` exits 0, logs `aktualnosci: skipping "..." (missing or non-string tresc)`, and still prerenders both valid seeds (D-03).
- Mutation-checked the whole guard set: neutralizing the `tytul`, `data`, `tresc` or `obraz` guard, or reintroducing the `...record` spread, each turns `npm run test:unit` red; the restored file is green.

## Task Commits

Each task was committed atomically:

1. **Task 1: Reproduce the residual crash shapes as failing unit cases (RED)** - `533966b` (test)
2. **Task 2: Validate every field postFromEntry emits, then construct the result explicitly (GREEN)** - `4a124a7` (feat)

The red-then-green history is visible across the two commits: at `533966b` the suite exits 1 with 9 failing new cases and all 10 pre-existing cases still passing; at `4a124a7` all 26 pass.

## Files Created/Modified

- `src/lib/server/aktualnosci.ts` - `postFromEntry` takes `unknown`, gains a plain-object guard, an unconditional `tresc` guard and the new module-private `readString` helper; the return value is an explicit 12-key literal. `parseData`, `MIESIACE`, `firstParagraph`'s body, `readAktualnosci` and `readLatest` are unchanged.
- `tests/aktualnosci-reader.unit.ts` - 16 new cases (10 -> 26): the residual crash shapes, the missing-`tytul` pin, the `EXPECTED_POST_KEYS` key-set assertion, and a 9-row table-driven consumer-contract test that pipes every surviving post through the real `renderPost` and the real cover basename split.

## Decisions Made

- **Type the parameter `unknown`, not `PostEntry`.** The compile-time interface described intent, not reality, for content that staff hand-edit and partially commit through a git CMS. Three successive crash shapes reached the build behind that lie. `unknown` moves enforcement from discipline to the compiler.
- **Construct, never spread.** The `...entry` spread is what let unvalidated fields survive two prior fixes. The key-set equality assertion (rather than a per-key check) is the durable pin: any reintroduced spread leaks a key and turns the suite red.
- **Guard at the reader only.** `NewsCard.svelte` and `src/routes/aktualnosci/[slug]/+page.svelte` were deliberately not modified. Duplicating guards in consumers would create three places to forget instead of one place to maintain.
- **Required vs optional split is a content-policy decision:** `tytul`, `data` and `tresc` reject the post (a post with no body is not a post); `zajawka`, `obraz` and `obraz_alt` degrade to `undefined` (a wrong cover costs the image, not the article).
- **`readString` returns the original string, not the trimmed one,** so Markdown body whitespace survives; only the excerpt derivation trims.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added a missing-`tytul` unit case to actually satisfy must-have truth #6**

- **Found during:** Task 2 (verifying the plan's must-have "`npm run test:unit` fails if any one of the `tytul` / `data` / `tresc` / `obraz` guards is removed")
- **Issue:** No case in the suite — neither the 10 pre-existing ones nor the Task 1 additions — passed an entry without `tytul`. Deleting the `tytul` guard would have been caught only by `svelte-check`, not by `npm run test:unit`, so the must-have was false as written.
- **Fix:** Added `postFromEntry returns null when tytul is missing` and then mutation-checked all four guards plus the spread. Each mutation turns the suite red; the restored file is green.
- **Files modified:** `tests/aktualnosci-reader.unit.ts`
- **Verification:** Five mutation runs (`tytul`, `data`, `tresc`, `obraz` guards neutralized; `...record` reintroduced) each exit 1; restored file exits 0.
- **Committed in:** `4a124a7` (Task 2 commit)

**2. [Rule 2 - Missing Critical] Extended the malformed-shape table beyond the listed shapes**

- **Found during:** Task 1
- **Issue:** The plan's must-have names arrays and numbers as non-object entry shapes, but the task's named cases covered only `null` and a bare string.
- **Fix:** Added `entry is an array` and `entry is a number` rows to `MALFORMED_SHAPES` so the plain-object guard is pinned for all four non-object shapes.
- **Files modified:** `tests/aktualnosci-reader.unit.ts`
- **Verification:** Both rows pass under the new guard; both would break on a property access if the guard were removed.
- **Committed in:** `533966b` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 missing critical test coverage)
**Impact on plan:** Both additions close gaps between the plan's must-have claims and what the suite actually enforced. No production code beyond the plan's scope was touched; no scope creep.

## Issues Encountered

- **TypeScript control-flow narrowing in the table test.** The existing suite's `let result = null; assert.doesNotThrow(() => { result = ... })` idiom leaves the variable narrowed to `null` for the compiler, so the surviving post could not be dereferenced afterwards. Resolved with a `try`/`catch` capture plus a `const survivor = post` alias (narrowing of a `let` is not preserved inside a closure), which keeps `npm run check` at 0 errors 0 warnings without weakening any assertion.
- The malformed-fixture build gate logs the skip warning five times (once per glob consumer: list route, `[slug]` entries, `[slug]` load, homepage load, client build pass). That is expected for a module-level `import.meta.glob` and is not noise worth suppressing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The `03-VERIFICATION.md` residual blocker is closed. Phase 03's automated evidence is now 10/10 truths verified; the only outstanding item is the human-deferred CMS round-trip check (staff editing a post through Sveltia and seeing it live), which is unchanged by this plan.
- Carried non-blocking warnings remain explicitly out of scope and open for a later pass: `SAFE_HREF` accepting protocol-relative URLs, the excerpt Markdown leak, GFM extras in the block renderer, the `instrukcja` intro copy, and the `NewsPreview` dead branch.
- The reader-as-validation-boundary pattern is the one to reuse for the Phase 04 form endpoints: narrow untrusted input once, at the boundary, and let the narrowed types be the contract.

## Self-Check: PASSED

- `src/lib/server/aktualnosci.ts` — FOUND
- `tests/aktualnosci-reader.unit.ts` — FOUND
- `.planning/phases/03-news-aktualno-ci/03-07-SUMMARY.md` — FOUND
- Commit `533966b` — FOUND
- Commit `4a124a7` — FOUND
- No unintended file deletions in either task commit.

---
*Phase: 03-news-aktualno-ci*
*Completed: 2026-08-14*
