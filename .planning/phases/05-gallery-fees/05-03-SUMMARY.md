---
phase: 05-gallery-fees
plan: 03
subsystem: ui
tags: [sveltekit, svelte5, nawigacja, prerender, playwright, a11y, wcag]

# Dependency graph
requires:
  - phase: 05-01
    provides: 01-UI-SPEC Amendment v1.7 §1 and §3, which authorize changing the LOCKED nav count and the nav breakpoint, and the footer repoints
  - phase: 05-02
    provides: the prerendered /cennik route, without which '/cennik' could not leave KNOWN_FUTURE_ROUTES
provides:
  - Six-item public navigation (Cennik after Rekrutacja), one array feeding both the header chips and the mobile drawer
  - Desktop nav tier moved from 768px to 1024px, with explicit assertions at both widths
  - A real "#dojazd" anchor on /kontakt: focusable, uncovered by the sticky header
  - Footer "Dojazd" shortcut repointed at /kontakt#dojazd
  - A fragment-resolution gate that reads hrefs off the rendered footer, so plan 05-07's Galeria repoint is covered the moment it lands
  - KNOWN_FUTURE_ROUTES shrunk from three entries to one ('/galeria')
affects: [05-07, 05-08, 06-launch-gate]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fragment-resolution gate: collect hrefs from rendered output, navigate to each, assert the target id is visible and carries tabindex=-1, and fail if the collected set is empty"
    - "A removed KNOWN_FUTURE_ROUTES entry is proved by `npm run build`, never by a grep of svelte.config.js"
    - "Anchor treatment on a content section: id carries the fragment, aria-labelledby points at the heading's own id, tabindex=-1, scroll-margin-top 96px"

key-files:
  created: []
  modified:
    - tests/nav.spec.ts
    - tests/responsive.spec.ts
    - src/lib/nav.ts
    - src/lib/components/Header.svelte
    - src/lib/components/Footer.svelte
    - src/routes/kontakt/+page.svelte
    - svelte.config.js

key-decisions:
  - "The nav breakpoint moved rather than the chip geometry: a sixth chip does not fit at 768px beside a 52px emblem and a two-line wordmark without tightening padding below the locked 44px target. Only .desktop-nav and .mobile-slot moved; .bar's 768px padding rule and the 1024px bar-height block are untouched."
  - "The plan's grep acceptance criterion `grep -c \"'/dojazd'\" svelte.config.js is 0` was deliberately NOT satisfied. The rewritten comment block names removed paths WITH quotes and says so explicitly; the enforced evidence is `npm run build`, which no longer prints `[404] GET /dojazd`. This is exactly the permanent false positive 05-RESEARCH C-4 and the UI-SPEC boxed warning predicted."
  - "The 768px viewport tier already existed in tests/responsive.spec.ts VIEWPORTS, so only a 1024px tier (`desktopSm`) was added rather than a duplicate 768px entry."
  - "The plan predicted the 1024px tier test would be RED. It was GREEN from the start (the old breakpoint was 768px, so 1024px already showed the inline nav). The 768px test is the one that was RED, and it is the one that proves the move."
  - "The #dojazd section keeps the browser's own focus ring: `outline: none` was considered and rejected so this anchor and the #galeria anchor plan 05-07 ships behave identically, and because the project treats visible focus as non-negotiable."

patterns-established:
  - "Nav count and DOM order are now asserted, not merely stated in prose: an explicit toHaveCount(6) plus toHaveText over navLinks in array order, alongside the pre-existing per-href loop"
  - "Footer shortcuts that carry a fragment are verified by navigating to them, never by retyping a list of ids"

requirements-completed: []

coverage:
  - id: D1
    description: "A parent on any page reaches /cennik from the persistent header, in sixth position after Rekrutacja"
    requirement: FEES-01
    verification:
      - kind: e2e
        ref: "tests/nav.spec.ts#nagłówek pokazuje sześć odnośników sekcji z właściwymi adresami (SITE-03, v1.7 §1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "At 768px the header shows the hamburger and hides the inline links; at 1024px the reverse. Chip padding, gap, label size and the 44px target are unchanged"
    verification:
      - kind: e2e
        ref: "tests/responsive.spec.ts#szerokość 768px pokazuje hamburgera i chowa odnośniki w pasku (v1.7 §1)"
        status: pass
      - kind: e2e
        ref: "tests/responsive.spec.ts#szerokość 1024px pokazuje odnośniki w pasku i chowa hamburgera (v1.7 §1)"
        status: pass
      - kind: e2e
        ref: "tests/responsive.spec.ts#phone width shows the hamburger, hides the inline nav links (SITE-02)"
        status: pass
      - kind: e2e
        ref: "tests/responsive.spec.ts#desktop width shows the inline nav links, hides the hamburger (SITE-02)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The footer's Dojazd link lands on a heading that exists, is focusable and is not covered by the sticky header"
    verification:
      - kind: e2e
        ref: "tests/nav.spec.ts#każdy odnośnik w stopce z kotwicą prowadzi do istniejącej sekcji (v1.7 §3)"
        status: pass
      - kind: e2e
        ref: "tests/nav.spec.ts#footer v2 exposes shortcut columns and big opening hours (UI-SPEC v1.2)"
        status: pass
    human_judgment: true
    rationale: "The tests prove the anchor exists, is visible and takes focus. Whether 96px of scroll-margin actually clears the sticky header for a sighted user, and whether the jump reads as landing on the map rather than mid-page, is a visual judgment no assertion makes. Confirm on a real 375px phone and at 1280px."
  - id: D4
    description: "/cennik and /dojazd left KNOWN_FUTURE_ROUTES, so the prerender crawler now enforces both"
    verification:
      - kind: other
        ref: "npm run build (crawler warnings reduced to a single tolerated `[404] GET /galeria`)"
        status: pass
    human_judgment: false
  - id: D5
    description: "No public route scrolls horizontally at 768px or at 1024px"
    verification:
      - kind: e2e
        ref: "tests/responsive.spec.ts#no horizontal overflow on {route} at {768,1024}px (7 routes x 2 widths)"
        status: pass
    human_judgment: false

# Metrics
duration: 34min
completed: 2026-08-17
status: complete
---

# Phase 5 Plan 03: Nawigacja v3, kotwica dojazdu i węższa lista tolerowanych 404 Summary

**Cennik is now the sixth navigation item, the desktop nav tier moved to 1024px so the sixth chip fits without touching the locked 44px chip geometry, `/kontakt#dojazd` is a real focusable anchor behind the repointed footer shortcut, and `KNOWN_FUTURE_ROUTES` is down to `'/galeria'` alone.**

## Performance

- **Duration:** 34 min
- **Started:** 2026-08-17T18:30:00Z
- **Completed:** 2026-08-17T19:04:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- **`/cennik` is reachable.** Plan 05-02 built the page; this plan made it a destination. `navLinks` has six entries and one array still feeds both the desktop chips and the mobile drawer, so `MobileNav.svelte` needed no edit and got none.
- **The nav breakpoint moved, the geometry did not.** Exactly two CSS rules changed tier: `.desktop-nav` now appears at `min-width: 1024px` and `.mobile-slot` disappears at `min-width: 1024px`. `.bar`'s 768px padding rule and the pre-existing 1024px bar-height block are byte-identical. Chip padding, gap, 14px/700 label, the 44px minimum target, the hover treatment and `aria-current` are all untouched, so no WCAG target-size regression is possible.
- **The `#dojazd` trap named by 05-RESEARCH C-4 was disarmed, not walked into.** The fragment did not exist anywhere in the repository. The `/kontakt` map section now carries the anchor id alongside its existing `aria-labelledby="mapa-heading"`, plus `tabindex="-1"` and `scroll-margin-top: 96px`. The anchor was created before the link was repointed, in the same commit.
- **A first-of-its-kind gate in this repository.** `tests/nav.spec.ts` now collects every "Na skróty" href containing a `#` from the rendered footer, navigates to each, and asserts the target id is visible and carries `tabindex="-1"`. It fails if the collected set is empty, so a footer refactor that drops every fragment cannot make it pass vacuously. Because it loops over rendered output rather than a retyped list, plan 05-07's Galeria repoint is covered automatically.
- **The nav count is asserted for the first time.** Before this plan `tests/nav.spec.ts` iterated `navLinks`, so it checked every href but never the count or the order: adding an item was completely silent. There is now an explicit `toHaveCount(6)`, a `navLinks.length` assertion, and a DOM-order label comparison that catches an item inserted in the wrong position.
- **Two paths left the crawler's tolerance list.** `npm run build` now prints exactly one tolerated warning, `[404] GET /galeria`, down from three.

## Task Commits

1. **Task 1: Lockstep test edits (RED)** - `3d69608` (test)
2. **Task 2: Six-item nav at 1024px, the #dojazd anchor, the footer repoint and two paths out of KNOWN_FUTURE_ROUTES (GREEN)** - `e68fd6d` (feat)

_This plan's Task 1 carried `tdd="true"`; RED was observed and recorded before Task 2 (see "RED gate observed" below). No REFACTOR commit was needed: the implementation is five small edits with nothing to clean up._

## Files Created/Modified

- `tests/nav.spec.ts` - Six-link count + DOM-order assertion on the header, the Dojazd tuple repointed, and the new fragment-resolution loop
- `tests/responsive.spec.ts` - New `desktopSm` (1024px) viewport tier, two nav-tier tests at 768px and 1024px, and both widths added to the per-route overflow sweep
- `src/lib/nav.ts` - Sixth entry `Cennik` -> `/cennik` between Rekrutacja and Dokumenty; header comment rewritten to six links, citing Amendment v1.7 §1, and recording that Galeria is deliberately not a nav destination
- `src/lib/components/Header.svelte` - `.desktop-nav` and `.mobile-slot` moved from the 768px tier to 1024px; the three comments that stated the old tier in words rewritten, including the reason for the move
- `src/lib/components/Footer.svelte` - Dojazd shortcut now `/kontakt#dojazd`, with a comment saying why Galeria still points at `/galeria`
- `src/routes/kontakt/+page.svelte` - Map section gains `id="dojazd"` and `tabindex="-1"`; `.kol-mapa` gains `scroll-margin-top: 96px`; a comment records that the id is a link target and must not be removed as unused
- `svelte.config.js` - `'/cennik'` and `'/dojazd'` removed; the false comment-convention claim deleted and replaced with the real gate (`npm run build`)

## RED gate observed

Run after Task 1, before any source edit: **4 failed, 41 passed.**

| Assertion | RED reason |
|---|---|
| `nav.spec.ts` header, six-link count and DOM order | `navLinks` held five entries; `toHaveLength(6)` failed first |
| `nav.spec.ts` footer v2, Dojazd href | Received `/dojazd`, expected `/kontakt#dojazd` |
| `nav.spec.ts` fragment resolution | The footer rendered no href containing `#`, so the non-empty guard failed. This is the guard doing its job: without it the loop would have iterated an empty set and passed |
| `responsive.spec.ts` 768px tier | `Otwórz menu` did not exist at 768px, because the old breakpoint already showed the inline nav there |

## Decisions Made

- **The breakpoint moved, not the geometry** (Amendment v1.7 §1, restated in the component's own comment so a later reader does not re-derive it). One extra tap for a tablet user beats breaking a locked contract on every route.
- **The `#dojazd` section keeps its default focus ring.** `outline: none` on a `tabindex="-1"` fragment target is a common pattern and was considered. Rejected for two reasons: the project treats visible focus as non-negotiable, and plan 05-07 ships the `#galeria` anchor to the same contract, so inventing a suppression here would make the two anchors behave differently for no stated reason.
- **`scroll-margin-top: 96px` is the 4xl token**, and the sticky header is 64px (72px at >=1024px), so the heading is genuinely clear rather than merely nearly clear.
- **`tests/kontakt.spec.ts` was not touched** (`git diff --name-only tests/kontakt.spec.ts` empty) and passes unchanged, which is what proves the anchor did not disturb the existing `/kontakt` contract.

## Deviations from Plan

### 1. [Correction] The plan named the wrong tier as RED

- **Found during:** Task 1
- **Issue:** The plan's acceptance criteria listed "the 1024px inline-nav visibility" among the assertions that must be red. It cannot be. The old breakpoint was 768px, so at 1024px the inline nav was *already* visible and the hamburger *already* hidden; that test passed from the moment it was written. The genuinely red tier test is the **768px** one.
- **Fix:** Both tier tests were written as the plan's `<action>` specified (which is correct and says nothing about which is red). Only the acceptance criterion's expectation is wrong, and it is recorded here rather than silently satisfied.
- **Verification:** The RED run shows `responsive.spec.ts:124` (768px) failing and no 1024px failure. The GREEN run shows both passing.
- **Committed in:** `3d69608`

### 2. [Rule 3 - Blocking] The 768px viewport tier already existed

- **Found during:** Task 1
- **Issue:** The plan said to "add two viewport entries to `VIEWPORTS`: a 768px-wide tablet tier and a 1024px-wide small desktop tier". `VIEWPORTS.tablet` is already `{ width: 768, height: 1024 }`. Adding a second 768px entry would have produced a duplicate test with a different name and no extra coverage.
- **Fix:** Reused `VIEWPORTS.tablet` for the 768px tier and added only `desktopSm: { width: 1024, height: 768 }`. Both widths were added to the per-route overflow sweep and both tier tests were written as specified.
- **Verification:** The acceptance criterion ("contains the literals `768` and `1024` inside viewport definitions") holds; 7 routes x 4 widths of overflow coverage, all green.
- **Committed in:** `3d69608`

### 3. [Documented, NOT fixed] One acceptance criterion is unsatisfiable by design

- **Found during:** Task 2
- **Issue:** The plan's acceptance criteria include ``grep -c "'/dojazd'" svelte.config.js`` is `0`. The same plan's `<action>` instructs the executor to delete the file's false claim that removed paths are named in comments without quotes, and its own boxed warning (and `05-UI-SPEC.md` Contract 6, and `05-RESEARCH.md` C-4) say that any grep-for-the-quoted-form criterion against this file is a permanent false positive.
- **Resolution:** The array removal was done. The rewritten comment block names `'/cennik'` and `'/dojazd'` **with** quotes, consistently with the five other removed paths already named that way, and states in the file itself that the gate on a removal is `npm run build` and that a grep criterion must not be written against it. So `grep -c "'/dojazd'" svelte.config.js` returns **1**, and that is correct behaviour, not a missed edit.
- **Substantive evidence instead:** `KNOWN_FUTURE_ROUTES` literally holds one entry, `'/galeria'`. `npm run build` succeeds and its crawler output went from three tolerated warnings to one (`[404] GET /galeria`); `[404] GET /cennik` and `[404] GET /dojazd` are gone. The full Playwright suite, whose `webServer` runs that same build, is green.
- **Committed in:** `e68fd6d`

### 4. [Housekeeping] Comment reworded so a second acceptance grep stays honest

- **Found during:** Task 2
- **Issue:** ``grep -c 'id="dojazd"' src/routes/kontakt/+page.svelte`` returned `2`, because the explanatory comment above the section quoted the attribute verbatim.
- **Fix:** Reworded the comment to "The id on this section is the target of ...". The count is now `1`, as the criterion states, and the comment says the same thing.
- **Verification:** `grep -c 'id="dojazd"' src/routes/kontakt/+page.svelte` is `1`; prettier and the nav + kontakt specs re-run green.
- **Committed in:** `e68fd6d`

---

**Total deviations:** 4 (2 plan corrections recorded, 1 blocking issue resolved, 1 housekeeping)
**Impact on plan:** None on scope. Every `must_haves` truth is delivered. Two of the four are corrections to acceptance criteria that were wrong when written, both flagged in advance by the phase's own research.

## Verification

Full wave gate, run in this worktree:

| Gate | Result |
|---|---|
| `npm run check` | 4370 files, **0 errors, 0 warnings** |
| `npm run lint` | prettier + eslint clean |
| `npm run test:unit` | **515 / 515** |
| `npm run build` | succeeds; one tolerated crawler 404 (`/galeria`), down from three |
| `npm run test` | **343 / 343** Playwright (was 325 before this plan; +18 from the new tier and route coverage) |

Acceptance greps:

| Check | Expected | Actual |
|---|---|---|
| `grep -c "href: '/cennik'" src/lib/nav.ts` | 1 | **1** |
| `navLinks` entries | 6 | **6** |
| `grep -c 'min-width: 768px' src/lib/components/Header.svelte` | 1 | **1** (only `.bar`'s padding rule) |
| `grep -c "'/galeria'" svelte.config.js` | 1 | **1** |
| `grep -c 'id="dojazd"' src/routes/kontakt/+page.svelte` | 1 | **1** |
| `grep -c 'scroll-margin-top' src/routes/kontakt/+page.svelte` | >= 1 | **2** |
| `grep -c "'/dojazd'" tests/nav.spec.ts` | 0 | **0** |
| `grep -c "'/galeria'" tests/nav.spec.ts` | >= 1 | **1** |
| `git diff --name-only src/lib/components/MobileNav.svelte` | empty | **empty** |
| `git diff --name-only tests/kontakt.spec.ts` | empty | **empty** |
| `git diff --name-only -- package.json package-lock.json` | empty | **empty** (T-05-03-SC: zero packages installed) |
| `grep -c "'/dojazd'" svelte.config.js` | 0 | **1** — see Deviation 3 |

**Tooling note:** the `svelte` MCP server (and its `svelte-autofixer` tool) was not present in this agent's tool list, the known tool-stripping bug. Nothing was retried against it. `npm run check` runs svelte-check, which covers types plus the Svelte compiler's a11y warnings, and reports 0/0.

## Threat model

| Threat ID | Disposition | Status |
|---|---|---|
| T-05-03-01 (a footer fragment that resolves nowhere) | mitigate | **Mitigated.** The fragment-resolution loop reads hrefs off rendered output and asserts the target is visible and focusable, with a non-empty guard |
| T-05-03-02 (silent regression in the prerender gate) | mitigate | **Mitigated by the build, not by a grep.** See Deviation 3 |
| T-05-03-03 (keyboard and small-screen access) | mitigate | **Mitigated.** Explicit assertions at 768px and 1024px, added in the same plan as the change. Chip geometry and the 44px target unchanged |
| T-05-03-04 (information disclosure) | accept | No editor-supplied content rendered, no server route added |
| T-05-03-SC (supply chain) | mitigate | **Zero packages installed.** `package.json` and `package-lock.json` untouched |

No new threat surface was introduced, so there is no Threat Flags section.

## Issues Encountered

- **`node_modules` was absent in the fresh worktree**, so every npm script failed on a missing binary. Resolved by symlinking the worktree's `node_modules` at the parent checkout's, the same class of fix plan 05-04 used. `node_modules` is gitignored; nothing was committed for it and no dependency moved.

## Known Stubs

None. Every link this plan touches resolves. The one deliberate exception is the footer's Galeria shortcut, which still points at `/galeria` and is still the sole tolerated crawler 404: plan 05-07 repoints it in the same commit that creates `#galeria` on `/o-nas`. That is the plan's stated design (a repointed link that lands nowhere is worse than the 404 it replaces), not an omission here.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Plan 05-07 inherits a working gate.** The fragment-resolution test needs no edit when Galeria is repointed: it reads the footer's rendered hrefs. 05-07 must ship `#galeria` on `/o-nas` with the same three attributes (`id`, `tabindex="-1"`, `scroll-margin-top: 96px`) or that test goes red, which is the intent.
- **`KNOWN_FUTURE_ROUTES` empties in 05-07.** Removing the last entry, `'/galeria'`, will make `npm run build` fully warning-free. The array itself can stay (the handler is harmless when empty).
- **REQUIREMENTS.md was not touched.** FEES-01 is listed in this plan's frontmatter but is not closable here: this plan only makes `/cennik` reachable, and the editor half belongs to plan 05-08. Marking it now would put a false claim in the traceability table, following the Plan 01 precedent. The orchestrator should not tick it on this SUMMARY's account.
- **STATE.md and ROADMAP.md were deliberately not modified** (worktree mode; the orchestrator owns those writes after the wave merges).

## Self-Check: PASSED

Files claimed as modified, all present:

- `tests/nav.spec.ts` FOUND
- `tests/responsive.spec.ts` FOUND
- `src/lib/nav.ts` FOUND
- `src/lib/components/Header.svelte` FOUND
- `src/lib/components/Footer.svelte` FOUND
- `src/routes/kontakt/+page.svelte` FOUND
- `svelte.config.js` FOUND

Commits claimed, both present on `worktree-agent-a63e3b17b072cf236`:

- `3d69608` FOUND (test)
- `e68fd6d` FOUND (feat)

---
*Phase: 05-gallery-fees*
*Completed: 2026-08-17*
