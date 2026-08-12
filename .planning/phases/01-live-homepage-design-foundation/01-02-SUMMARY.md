---
phase: 01-live-homepage-design-foundation
plan: 02
subsystem: ui
tags: [sveltekit, svelte5-runes, navigation, a11y, wcag, focus-trap, prerender, external-link-safety]

# Dependency graph
requires:
  - "01-01: SvelteKit scaffold, two-tier @theme tokens (src/app.css), a11y base, prerender-by-default"
provides:
  - Single nav source (src/lib/nav.ts → navLinks) consumed by header + mobile drawer
  - Persistent sticky Header with 5 desktop section links + accessible active state (aria-current + 3px bar)
  - MobileNav hydrated drawer island (focus trap, ESC-close, focus restore, body scroll lock, reduced-motion)
  - SkipLink (first focusable, targets #main)
  - Footer linking to BIP (external, tab-nabbing safe), Deklaracja dostępności, Kontakt
  - Finalized semantic landmark shell in +layout.svelte (one header/main/footer; nav Główna nawigacja)
  - tests/nav.spec.ts (E2E: header links, footer/BIP safety, drawer keyboard contract)
  - prerender handleHttpError seam tolerating known-future section-route 404s
affects: [live-homepage-design-foundation, cms-content-editing, forms-email, launch-seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-source nav data module ($lib/nav) shared by desktop + mobile"
    - "Svelte 5 runes island: $state open + $effect for scroll-lock/focus lifecycle"
    - "Bounded focus trap over native <button>/<a> (no hand-rolled click-divs)"
    - "aria-current='page' + visual bar for active nav (never colour alone)"
    - "External-link safety: target=_blank + rel=noopener noreferrer + visually-hidden new-tab suffix"
    - "prerender.handleHttpError allow-list for phased/not-yet-built internal routes"

key-files:
  created:
    - "src/lib/nav.ts"
    - "src/lib/components/SkipLink.svelte"
    - "src/lib/components/Header.svelte"
    - "src/lib/components/MobileNav.svelte"
    - "src/lib/components/Footer.svelte"
    - "tests/nav.spec.ts"
  modified:
    - "src/routes/+layout.svelte"
    - "eslint.config.js"
    - "svelte.config.js"

key-decisions:
  - "Active-state pathname read via `$app/state` `page` (rune-based, SvelteKit 2.70) rather than the legacy `$app/stores` page store"
  - "MobileNav uses conditional {#if open} mount/unmount with Svelte fly/fade transitions whose duration collapses to 0 under prefers-reduced-motion — truest a11y semantics (drawer absent from DOM/tab order when closed)"
  - "Disabled eslint `svelte/no-navigation-without-resolve` — site deploys at domain root (no base path) and section routes are built across Plans 04–05, so `resolve()` against not-yet-generated route IDs would break the phased build"
  - "Added prerender `handleHttpError` allow-list (six known-future routes) so the crawler tolerates their 404 now but still fails on any other broken link"

requirements-completed: []

# Metrics
duration: ~20min
completed: 2026-08-12
status: complete
---

# Phase 1 Plan 02: Semantic Navigation Shell Summary

**Persistent AA navigation shell — sticky desktop header with an accessible active state, a keyboard-operable mobile drawer island (focus trap + ESC + focus restore + scroll lock + reduced-motion), a skip link, and a footer linking safely to BIP — all Polish, wired into the shared semantic landmark layout so conformance is the default for every later page.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-08-12
- **Tasks:** 3 (all committed atomically)
- **Files:** 9 (6 created, 3 modified)

## Accomplishments

- **Single nav source** (`src/lib/nav.ts`) — the five Polish section links (Aktualności, O nas, Rekrutacja, Dokumenty, Kontakt) consumed by both the desktop header and the mobile drawer, so they never drift.
- **Accessible sticky Header** — wordmark left, five links right (`<nav aria-label="Główna nawigacja">`), 44px hit areas, active section shown by `aria-current="page"` **and** a 3px brand-blue bar (never colour alone), scroll-driven shadow. Active path read from `$app/state`'s rune `page`.
- **MobileNav hydrated island** — the walking skeleton's one real client interaction. Hamburger (44×44) toggles `aria-label` Otwórz/Zamknij menu, `aria-expanded`, `aria-controls`; open panel is `role="dialog" aria-modal="true"` with a bounded Tab/Shift+Tab focus trap, ESC-close, focus restore to the hamburger, body scroll-lock, scrim-dismiss, and reduced-motion instant show/hide.
- **SkipLink** — first focusable element, visually hidden until focus, jumps to `#main`.
- **Footer** — org line, BIP external link (exact label `Biuletyn Informacji Publicznej (BIP)` → `https://ugstromiec.naszbip.pl/zlobek`, `target="_blank" rel="noopener noreferrer"`, visually-hidden `(otwiera się w nowej karcie)` suffix), plus Deklaracja dostępności + Kontakt.
- **Semantic landmark shell** finalized in `+layout.svelte`: SkipLink → Header → `<main id="main">` → Footer; exactly one header/main/footer.
- **E2E gate** (`tests/nav.spec.ts`) — 4 passing tests: header links + hrefs, footer BIP URL/rel safety, footer Deklaracja+Kontakt, and the mobile drawer keyboard contract (open → dialog, ESC → close + focus restore).

## Task Commits

1. **Task 1: Nav source + SkipLink + desktop Header** — `e39c0e9` (feat)
2. **Task 2: Mobile nav drawer island** — `2193ccb` (feat)
3. **Task 3: Footer + semantic layout shell + nav E2E test** — `889049c` (feat)

## Files Created/Modified

- `src/lib/nav.ts` — `navLinks` single source (typed `NavLink[]`)
- `src/lib/components/SkipLink.svelte` — skip-to-content, first focusable
- `src/lib/components/Header.svelte` — sticky header, active state, scroll shadow, mobile slot
- `src/lib/components/MobileNav.svelte` — hydrated drawer island (focus trap/ESC/restore/scroll-lock/reduced-motion)
- `src/lib/components/Footer.svelte` — BIP (external-safe) + Deklaracja + Kontakt + org line
- `src/routes/+layout.svelte` — finalized semantic landmark shell
- `eslint.config.js` — disabled `svelte/no-navigation-without-resolve` (see Deviations)
- `svelte.config.js` — prerender `handleHttpError` allow-list for known-future routes (see Deviations)
- `tests/nav.spec.ts` — navigation E2E acceptance

## Decisions Made

- **`$app/state` over `$app/stores`.** Active-nav pathname uses the rune-based `page` from `$app/state` (available in SvelteKit 2.70), the modern non-deprecated API, aligning with the Svelte 5 runes stack.
- **Mount/unmount drawer with reduced-motion-aware transitions.** `{#if open}` gives the truest a11y semantics (drawer fully absent from DOM/tab order when closed); `fly`/`fade` durations collapse to `0` when `prefers-reduced-motion: reduce` matches, plus a CSS `@media` guard.
- **Focus lifecycle via a single `$effect`.** Opening locks body scroll + focuses the close button; the effect cleanup (on close/unmount) releases the lock and restores focus to the hamburger — one place, no leaks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] eslint `svelte/no-navigation-without-resolve` blocked all internal links**
- **Found during:** Task 1 (pre-commit lint gate)
- **Issue:** The `svelte.configs.recommended` rule requires internal hrefs to go through `resolve()`. `resolve()` is type-checked against generated route IDs, but the five section routes are built in Plans 04–05, so it cannot type-check now; the site also deploys at the domain root (no `base` path), making `resolve()` a no-op for correctness.
- **Fix:** Disabled the rule in `eslint.config.js` with a documented rationale (root deploy + phased routes).
- **Files modified:** `eslint.config.js`
- **Verification:** `npm run lint` exits 0.
- **Committed in:** `e39c0e9`

**2. [Rule 2 - A11y correctness] `role="dialog"` needed a tabindex**
- **Found during:** Task 2 (`npm run check`)
- **Issue:** svelte a11y compiler warning — interactive `dialog` role must expose a tabindex.
- **Fix:** Added `tabindex="-1"` to the drawer element (the focus trap already excludes `tabindex="-1"` from its focusables list, so no side effect).
- **Files modified:** `src/lib/components/MobileNav.svelte`
- **Verification:** `npm run check` → 0 errors / 0 warnings.
- **Committed in:** `2193ccb`

**3. [Rule 3 - Blocking] Prerender crawler 404'd on the six not-yet-built section routes**
- **Found during:** Task 3 (`npm run build`)
- **Issue:** With `prerender = true` and the new nav/footer links, the crawler followed `/aktualnosci`, `/o-nas`, `/rekrutacja`, `/dokumenty`, `/kontakt`, `/deklaracja-dostepnosci` and failed the build (`404 … linked from /`). Those routes are authored in Plans 04–05 / Phase 6.
- **Fix:** Added `kit.prerender.handleHttpError` in `svelte.config.js` that returns (tolerates) 404 **only** for those exact known-future paths and re-throws for anything else — so genuine broken links still fail the build.
- **Files modified:** `svelte.config.js`
- **Verification:** `npm run build` exits 0; emits `.svelte-kit/cloudflare`.
- **Committed in:** `889049c`

**4. [Rule 1 - Bug] nav E2E strict-mode collision on "Zamknij menu"**
- **Found during:** Task 3 (first `npx playwright test` run)
- **Issue:** When the drawer is open the hamburger's `aria-label` toggles to `Zamknij menu` (per UI-SPEC), colliding with the drawer's own close button — the unscoped `getByRole('button', { name: 'Zamknij menu' })` matched 2 elements.
- **Fix:** Scoped the close-button focus assertion to the dialog (`dialog.getByRole(...)`).
- **Files modified:** `tests/nav.spec.ts`
- **Verification:** `npx playwright test tests/nav.spec.ts` → 4 passed.
- **Committed in:** `889049c`

---

**Total deviations:** 4 auto-fixed (2 blocking/config, 1 a11y correctness, 1 test bug). No architectural changes, no user decisions required.

## Threat Mitigations (from plan `<threat_model>`)

- **T-01-02 (Tampering — BIP external link):** mitigated — `rel="noopener noreferrer"` + `target="_blank"`, asserted in `tests/nav.spec.ts`.
- **T-01-05 (client DoS — drawer trap/scroll-lock):** mitigated — native elements, bounded focus trap, scroll-lock released via `$effect` cleanup on every close/unmount; ESC and scrim always close.

No new security surface beyond the plan. The `handleHttpError` change is build-config only (no runtime trust boundary).

## Known Stubs

None. All components are fully wired to the single nav source and real copy; the section routes they link to are intentionally built in later plans (tolerated via the prerender allow-list), not stubs in this plan's files.

## Verification

- `npm run check` → 0 errors / 0 warnings
- `npm run lint` → clean
- `npm run build` → exits 0, emits `.svelte-kit/cloudflare`
- `npx playwright test tests/nav.spec.ts` → 4 passed
- Landmarks: exactly one `<header>` / `<main id="main">` / `<footer>`; `<nav aria-label="Główna nawigacja">`; skip link first focusable
- Note: `tests/home.spec.ts` remains RED by design (homepage composed in Plan 03) — the full `npm run test` suite is not green until then; this plan only gates on `nav.spec.ts`.

## Next Phase Readiness

- The persistent AA shell is live around every route; Plan 03 composes the homepage inside `<main>` (Hero + CTA + NewsPreview empty state + QuickContact) and turns `tests/home.spec.ts` GREEN.
- Plans 04–05 add the section routes; as each lands, remove its entry from `KNOWN_FUTURE_ROUTES` in `svelte.config.js` so the crawler enforces it again.

## Self-Check: PASSED

All 6 created files verified present on disk; all 3 task commits (`e39c0e9`, `2193ccb`, `889049c`) verified in git history.
