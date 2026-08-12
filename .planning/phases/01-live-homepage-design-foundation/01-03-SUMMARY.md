---
phase: 01-live-homepage-design-foundation
plan: 03
subsystem: ui
tags: [svelte5-runes, homepage, hero, cta, seo, open-graph, noindex, a11y, wcag, responsive, playwright, axe, polish, placeholder-discipline]

# Dependency graph
requires:
  - "01-01: SvelteKit scaffold, two-tier @theme tokens (src/app.css), global a11y base (:focus-visible + reduced-motion), prerender-by-default, RED tests/home.spec.ts"
  - "01-02: semantic landmark shell (+layout.svelte Header/main/Footer), single nav source, MobileNav hamburger island"
  - "01-04: /og-placeholder.png branded share card consumed by Seo.svelte; robots.txt Disallow (paired with the Seo noindex)"
provides:
  - "Cta.svelte — primary (amber/ink, white label only on active) + secondary (blue outline) pill CTA variants, AA-tuned, focus-ring inherited"
  - "Hero.svelte — PLACEHOLDER Polish hook h1 + VERBATIM final core message lead (D-02) + Rekrutacja CTA + consent-safe AVIF/WebP hero placeholder (fetchpriority high, explicit width/height)"
  - "NewsPreview.svelte — Aktualności header + REQUIRED empty state (no posts until Phase 3)"
  - "QuickContact.svelte — adres/telefon(tel:)/e-mail(mailto:zlobek@ugstromiec.pl)/godziny, accessible Polish links"
  - "Seo.svelte — reusable per-route Polish head: title/description/canonical + OG/Twitter + noindex on the *.pages.dev placeholder (D-11); no JSON-LD (D-12 deferred)"
  - "Composed homepage (+page.svelte) owning the single <h1> — the walking-skeleton payload"
  - "GREEN acceptance suite: tests/home.spec.ts (verbatim/CTA/empty-state/mailto/SEO/single-h1/zero axe AA) + tests/responsive.spec.ts (phone/tablet/desktop matrix)"
  - "static/hero-placeholder.{webp,avif} — non-identifiable warm decorative hero placeholder"
affects: [live-homepage-design-foundation, cms-content-editing, forms-email, launch-seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Snippet-based Cta component with variant prop; colour hard-rules encoded (white-on-amber only on :active)"
    - "Verbatim final copy kept as an un-wrapped single-line constant so prettier cannot break the exact wording"
    - "Reusable Seo head component; noindex baked into prerendered HTML (crawler-correct) not a client-only re-render"
    - "<picture> AVIF+WebP with explicit width/height + fetchpriority=high for the LCP hero image (no CLS)"
    - "Section-band alternation surface / surface-warm / band across composed sections"
    - "Strengthen-only extension of a pre-authored RED acceptance test (never weaken assertions to force GREEN)"

key-files:
  created:
    - "src/lib/components/Cta.svelte"
    - "src/lib/components/Hero.svelte"
    - "src/lib/components/NewsPreview.svelte"
    - "src/lib/components/QuickContact.svelte"
    - "src/lib/components/Seo.svelte"
    - "tests/responsive.spec.ts"
    - "static/hero-placeholder.webp"
    - "static/hero-placeholder.avif"
  modified:
    - "src/routes/+page.svelte"
    - "tests/home.spec.ts"

key-decisions:
  - "Verbatim core message stored as a single-line JS constant (rendered via {coreMessage}) so prettier cannot wrap it mid-phrase — guarantees the exact wording is contiguous in both source and DOM (satisfies the grep gate + the getByText assertion)"
  - "Seo emits noindex UNCONDITIONALLY in Phase 1 (via noindex prop default true), not a runtime host check: crawlers read the prerendered HTML, so a client-only *.pages.dev test would bake the wrong result. Phase 6 passes noindex={false} on the real domain. Paired with Plan 04 robots.txt Disallow"
  - "Hero image is a self-hosted static asset referenced by root path (/hero-placeholder.webp), generated once from an abstract SVG via the project's bundled sharp (no child faces — consent-safe D-03); committed as static output, not a build dependency"
  - "'Zobacz wszystkie' reuses the Cta secondary variant (UI-SPEC lists it as a secondary-button example), avoiding a second link style"

requirements-completed: [SITE-02, SITE-06, HOME-01, HOME-02]

coverage:
  - id: D1
    description: "Hero leads with the żłobek's core message VERBATIM (final copy) beneath a short Polish hook h1 (HOME-01, D-01/D-02)"
    requirement: "HOME-01"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#hero contains the verbatim core message (HOME-01) — PASS"
        status: pass
    human_judgment: false
  - id: D2
    description: "Primary Rekrutacja CTA 'Zapisz dziecko' → /rekrutacja; Aktualności empty state; quick-contact mailto/tel (HOME-02)"
    requirement: "HOME-02"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#CTA + empty-state + mailto tests — PASS"
        status: pass
    human_judgment: false
  - id: D3
    description: "Homepage owns exactly one <h1>; responsive across phone/tablet/desktop without horizontal overflow (SITE-02)"
    requirement: "SITE-02"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#single-h1 + tests/responsive.spec.ts viewport matrix — PASS"
        status: pass
    human_judgment: false
  - id: D4
    description: "All visitor-facing homepage copy is Polish; non-final placeholders carry a greppable PLACEHOLDER token; email is final (SITE-06)"
    requirement: "SITE-06"
    verification:
      - kind: unit
        ref: "grep PLACEHOLDER in Hero/QuickContact; mailto:zlobek@ugstromiec.pl not marked; svelte-check exit 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "Per-route Polish SEO metadata (title/description/canonical/OG/Twitter) + noindex on *.pages.dev; no JSON-LD (D-10/D-11/D-12)"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#emits Polish per-route SEO metadata with noindex — PASS; ! grep application/ld+json Seo.svelte"
        status: pass
    human_judgment: false
  - id: D6
    description: "Zero WCAG 2.1 AA violations on the composed homepage (SITE-04 / A11Y baseline)"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#no WCAG 2.1 AA violations — PASS (axe wcag2a/2aa/21a/21aa, 0 violations)"
        status: pass
    human_judgment: false

# Metrics
duration: ~22min
completed: 2026-08-12
status: complete
---

# Phase 1 Plan 03: Homepage Content Slice Summary

**The walking-skeleton payload: a warm Polish homepage that leads with the żłobek's VERBATIM core message under a hook headline, a primary Rekrutacja CTA, the required Aktualności empty state, and an accessible quick-contact block — plus a reusable per-route SEO/head mechanism with noindex on the placeholder — turning the Plan-01 RED acceptance suite fully GREEN (18 passed, zero axe WCAG 2.1 AA violations).**

## Performance

- **Duration:** ~22 min
- **Completed:** 2026-08-12
- **Tasks:** 3 (all committed atomically)
- **Files:** 10 (8 created, 2 modified)

## Accomplishments

- **Hero with the verbatim core message (HOME-01, D-01/D-02).** A short Polish hook `<h1>` (marked `PLACEHOLDER`, LAUNCH-01) sits above the żłobek's full 4-sentence core message, rendered VERBATIM as a styled lead quote — final client copy, character-for-character from PROJECT.md line 47, kept as an un-wrapped constant so it can never be broken mid-phrase.
- **CTA variants with the AA colour hard-rules (HOME-02).** `Cta.svelte`: primary amber fill with `ink` label (white label only on the darkest `:active` state — the sole white-on-amber case), secondary blue-outline; pill, 44px min-height, focus ring inherited from the global base. Primary `Zapisz dziecko` → `/rekrutacja`; optional secondary `Poznaj żłobek` → `/o-nas`.
- **Consent-safe hero image (D-03).** A non-identifiable warm decorative placeholder (abstract sun/hills/balloons/blocks — NO child faces) generated to AVIF + WebP, shipped via `<picture>` with explicit `width`/`height` (no CLS) and `fetchpriority="high"` (it is the LCP element), `aria-hidden` while decorative.
- **Aktualności REQUIRED empty state (HOME-02).** `NewsPreview.svelte`: `h2 Aktualności` + secondary `Zobacz wszystkie` → `/aktualnosci`, then the friendly empty panel (`Newspaper` icon `aria-hidden`, heading `Wkrótce pojawią się aktualności`, UI-SPEC body) because no posts exist until Phase 3.
- **Accessible quick-contact (HOME-02).** `QuickContact.svelte`: adres (PLACEHOLDER), telefon (`tel:` link, PLACEHOLDER), e-mail (`mailto:zlobek@ugstromiec.pl` — final), godziny; brand-blue underlined links, ≥44px targets, `aria-hidden` icons.
- **Reusable SEO/head mechanism (D-10/D-11/D-12).** `Seo.svelte`: per-route Polish `<title>` + meta description + canonical + Open Graph (`og:locale=pl_PL`) + Twitter card using the branded `/og-placeholder.png`, plus a `noindex` robots meta baked into the prerendered HTML for the `*.pages.dev` placeholder. No JSON-LD / GSC token (deferred to Phase 6).
- **Composed homepage + GREEN acceptance.** `+page.svelte` composes `Seo → Hero → NewsPreview → QuickContact`, owning the single `<h1>`. The full suite is GREEN: `tests/home.spec.ts` (verbatim, CTA, empty state, mailto, single-h1, SEO metadata, **zero axe WCAG 2.1 AA violations**) and the new `tests/responsive.spec.ts` (phone/tablet/desktop — no horizontal overflow + hamburger↔inline-nav swap).

## Task Commits

1. **Task 1: Hero (verbatim core message) + Cta variants** — `d5e0de2` (feat)
2. **Task 2: Aktualności empty-state preview + quick-contact block** — `04d0e7b` (feat)
3. **Task 3: SEO/head component + compose homepage (acceptance GREEN)** — `4508fb5` (feat)

## Files Created/Modified

- `src/lib/components/Cta.svelte` — primary/secondary pill CTA, AA colour rules
- `src/lib/components/Hero.svelte` — hook h1 + verbatim lead + CTA row + AVIF/WebP hero placeholder + decorative blobs
- `src/lib/components/NewsPreview.svelte` — Aktualności header + required empty state
- `src/lib/components/QuickContact.svelte` — adres/telefon/e-mail/godziny accessible links
- `src/lib/components/Seo.svelte` — reusable per-route head + noindex + OG/Twitter
- `src/routes/+page.svelte` — composed homepage (single h1)
- `tests/home.spec.ts` — strengthened with single-h1, secondary-link, and SEO-metadata assertions (RED → GREEN)
- `tests/responsive.spec.ts` — new phone/tablet/desktop viewport matrix
- `static/hero-placeholder.webp` / `static/hero-placeholder.avif` — non-identifiable warm hero placeholder

## Decisions Made

- **Verbatim message as a single-line constant.** Prettier wraps long block-element text, which split the required phrase across lines and broke the exact-substring grep gate. Storing the message as an un-wrapped JS constant rendered via `{coreMessage}` keeps the wording contiguous in both source and DOM — faithful to D-02 ("not a single character altered") and robust to formatting.
- **noindex baked, not runtime-detected.** Crawlers read the prerendered HTML; a `*.pages.dev` host check would evaluate at prerender time (wrong host) and fail to protect the static output. `Seo` therefore emits `noindex` unconditionally in Phase 1 (prop default `true`), flipping to `false` on the real domain at Phase 6. Paired with the Plan-04 `robots.txt Disallow`.
- **Hero image referenced by root path, not imported.** SvelteKit serves `static/*` at the site root, so `<img src="/hero-placeholder.webp">` is correct; the earlier `$lib/../../static` import was removed. PNG/OG remains Plan 04's `og-placeholder.png`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prettier wrapped the verbatim core message, breaking the exact-substring grep**
- **Found during:** Task 1
- **Issue:** With the 4-sentence message inline in `<blockquote>`, prettier inserted line breaks inside the required phrase `będziemy czuwać nad każdym krokiem Twojej pociechy`, so `grep -q` (acceptance verify) failed even though the browser text matched (whitespace-normalised).
- **Fix:** Moved the message into a single-line `const coreMessage` string rendered via `{coreMessage}`; prettier does not reflow JS string literals.
- **Files modified:** `src/lib/components/Hero.svelte`
- **Verification:** `grep -q` passes; `tests/home.spec.ts` verbatim test GREEN.
- **Committed in:** `d5e0de2`

**2. [Rule 1 - Bug] Invalid static-asset import in Hero**
- **Found during:** Task 1
- **Issue:** Initial draft imported the hero image via `$lib/../../static/hero-placeholder.webp`, which is not a valid SvelteKit asset import (static files are served at the root, not bundled through `$lib`).
- **Fix:** Removed the import; used the root path `src="/hero-placeholder.webp"` with `<source>` AVIF/WebP.
- **Files modified:** `src/lib/components/Hero.svelte`
- **Verification:** `npm run check` exit 0; image renders in the Playwright run.
- **Committed in:** `d5e0de2`

---

**Total deviations:** 2 auto-fixed (1 blocking formatting/grep, 1 bug). No architectural changes, no user decisions required.

## Threat Mitigations (from plan `<threat_model>`)

- **T-01-04 (placeholder indexing, low):** mitigated — `Seo.svelte` emits `<meta name="robots" content="noindex">` for the `*.pages.dev` placeholder (D-11), paired with the Plan-04 `robots.txt Disallow: /`. Every non-final placeholder (hook headline, adres, telefon, godziny) carries a greppable `PLACEHOLDER` token for the Phase 6 pre-launch grep gate.
- **T-01-06 (mailto/tel exposure, low):** accepted — `zlobek@ugstromiec.pl` and the placeholder phone are the public institutional contact by design; no personal data exposed.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries. All additions are prerendered static HTML/CSS + head metadata; the one hydrated island (MobileNav) is unchanged from Plan 02.

## Known Stubs

- **Hook headline** (`Hero.svelte`) — `PLACEHOLDER` Polish hook line; the verbatim lead beneath it is final. Confirmed at launch (LAUNCH-01).
- **Hero image** — `static/hero-placeholder.{webp,avif}` decorative placeholder (no child faces); swapped for consented real photography in Phase 6 (D-03/LAUNCH-01).
- **Quick-contact values** — adres / telefon / godziny are `PLACEHOLDER` pending confirmed data; the e-mail is final. These are intentional content-first placeholders (Pitfall 12), not functional stubs — the homepage goal (warm message + enrol CTA + news state + contact) is fully achieved.

## Verification

- `npm run check` → 0 errors / 0 warnings
- `npm run lint` → clean (prettier + eslint)
- `npx playwright test` → **18 passed** (home 9, nav 4, responsive 5), incl. zero axe WCAG 2.1 AA violations
- `! grep application/ld+json src/lib/components/Seo.svelte` → confirmed (no JSON-LD)
- Exactly one `<h1>` (Hero); section bands alternate surface / surface-warm / band; hero image has explicit width/height + `fetchpriority="high"`

## Requirements Note

- **HOME-01, HOME-02:** fully realized on the composed homepage — marked complete.
- **SITE-02 (responsive), SITE-06 (Polish client-facing content):** the homepage is the Phase-1 client-facing surface; both are realized and test-guarded here (responsive matrix + Polish-only copy with placeholder discipline) — marked complete. (SITE-01 live deploy is Plan 05; SITE-04 tokens completed in Plan 01.)

## Next Phase Readiness

- The walking skeleton is complete and GREEN. Plan 05 wires the Cloudflare Pages git-integration deploy (SITE-01, user setup) to make it live on `*.pages.dev`.
- `Seo.svelte` is the reusable head mechanism every later route/page consumes; Phase 6 flips `noindex={false}`, adds JSON-LD + GSC, and swaps the placeholder hero/OG imagery + final hook/contact copy.

## Self-Check: PASSED

All 8 created files verified present on disk; all 3 task commits (`d5e0de2`, `04d0e7b`, `4508fb5`) verified in git history; full Playwright suite GREEN (18 passed).

---
*Phase: 01-live-homepage-design-foundation*
*Completed: 2026-08-12*
