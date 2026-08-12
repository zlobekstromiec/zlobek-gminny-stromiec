---
phase: 01-live-homepage-design-foundation
reviewed: 2026-08-12T22:10:03Z
depth: standard
files_reviewed: 31
files_reviewed_list:
  - _headers
  - docs/dev-env.md
  - eslint.config.js
  - package.json
  - playwright.config.ts
  - src/app.css
  - src/app.d.ts
  - src/app.html
  - src/lib/components/Cta.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/Header.svelte
  - src/lib/components/Hero.svelte
  - src/lib/components/MobileNav.svelte
  - src/lib/components/NewsPreview.svelte
  - src/lib/components/QuickContact.svelte
  - src/lib/components/Seo.svelte
  - src/lib/components/SkipLink.svelte
  - src/lib/nav.ts
  - src/routes/+layout.svelte
  - src/routes/+layout.ts
  - src/routes/+page.svelte
  - src/routes/deklaracja-dostepnosci/+page.svelte
  - static/robots.txt
  - static/site.webmanifest
  - static/sitemap.xml
  - svelte.config.js
  - tests/home.spec.ts
  - tests/nav.spec.ts
  - tests/responsive.spec.ts
  - vite.config.ts
  - wrangler.jsonc
findings:
  critical: 0
  warning: 4
  info: 8
  total: 12
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-08-12T22:10:03Z
**Depth:** standard
**Files Reviewed:** 31
**Status:** issues_found

## Summary

Reviewed the Phase 1 walking-skeleton implementation: SvelteKit/Tailwind v4 scaffold, layout shell (SkipLink/Header/Footer), homepage sections (Hero, NewsPreview, QuickContact), the mobile-nav drawer island, SEO component, deklaracja stub route, static assets/config, and the Playwright + axe acceptance suite.

Overall the implementation is careful and closely follows the locked UI-SPEC contract: the two-tier palette rules are respected (no expressive colors on text), the CTA white-on-amber rule is implemented exactly as specified, reduced-motion is handled at the base layer AND per-component, the BIP link carries `noopener noreferrer`, the CSP-in-kit.csp approach is correctly implemented (`base-uri`/`form-action` set explicitly — they do not fall back to `default-src` — and `frame-ancestors` correctly delegated to `X-Frame-Options` in `_headers`), and all referenced static assets (`hero-placeholder.avif/webp`, `og-placeholder.png`, favicons) exist on disk.

No Critical (security/data-loss) issues were found: there are no server routes, no secrets in source, no injection surfaces, and RODO constraints are not touched this phase. However, four Warnings were found, the most visible being that the scaffold-leftover favicon import in `+layout.svelte` ships the **default Svelte framework logo** as the site favicon, overriding the branded icon.

## Warnings

### WR-01: Layout injects the default Svelte-logo favicon, overriding the branded icon

**File:** `src/routes/+layout.svelte:3,11` (and `src/lib/assets/favicon.svg`)
**Issue:** `+layout.svelte` still contains the SvelteKit scaffold leftover:

```svelte
import favicon from '$lib/assets/favicon.svg';
...
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
```

`src/lib/assets/favicon.svg` is the **stock Svelte logo** (verified: `<title>svelte-logo</title>`, orange `#ff3e00` flame) — not the branded heart icon that lives in `static/favicon.svg`. Because `%sveltekit.head%` renders *after* the static `<link rel="icon">` tags in `app.html` (lines 7–8), browsers that prefer the last/most-suitable icon declaration (Chrome, Firefox with SVG support) will display the Svelte framework logo in the tab instead of the żłobek brand icon. At best the duplicate declarations are non-deterministic across browsers; at worst the framework logo ships on a public-body site.
**Fix:** Delete the import and the `<svelte:head>` line from `+layout.svelte`, and delete `src/lib/assets/favicon.svg` (the branded icons in `static/` plus the `app.html` links are the single source of truth):

```svelte
<script lang="ts">
	import '../app.css';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>
```

### WR-02: Canonical / og:url / og:image emit relative URLs — invalid Open Graph, broken share previews

**File:** `src/lib/components/Seo.svelte:17-18,34,45-46,52`
**Issue:** `canonical` defaults to `'/'` and `image` to `'/og-placeholder.png'`, emitted directly into `<link rel="canonical" href="/">`, `<meta property="og:url" content="/">`, and `<meta property="og:image" content="/og-placeholder.png">`. The Open Graph protocol requires **absolute URLs** for `og:url` and `og:image`; Facebook/LinkedIn/most messenger scrapers do not resolve relative `og:image` paths, so the "professional preview on a shared *.pages.dev link" that the component's own comment (and `tests/home.spec.ts:68`) claims as the goal will render without the branded card image. Relative canonical is likewise against Google's guidance (moot only while noindex, but the component is the Phase 6 mechanism too). The test only asserts the tag *exists* (`toHaveCount(1)`), so this defect passes the suite.
**Fix:** Resolve against a site origin constant, e.g.:

```svelte
const SITE_ORIGIN = 'https://zlobek-gminny-stromiec.pages.dev'; // Phase 6: custom domain
const canonicalUrl = new URL(canonical, SITE_ORIGIN).href;
const imageUrl = new URL(image, SITE_ORIGIN).href;
```

and emit `canonicalUrl`/`imageUrl` in the head tags. (Alternatively derive from `page.url.origin` — but a constant keeps prerendered output stable.)

### WR-03: `wrangler.jsonc` project name `"scaffold"` mismatches the Pages project

**File:** `wrangler.jsonc:4`
**Issue:** `"name": "scaffold"` does not match the Cloudflare Pages project `zlobek-gminny-stromiec` (per `docs/dev-env.md:16`). Cloudflare requires the wrangler config `name` to match the Pages project name when the config file is used by the Pages pipeline; a manual `wrangler pages deploy` from this repo would target/create a project called **scaffold** instead of the real one, and future Wrangler versions of the git build may reject the mismatch. It also survives as an obvious scaffold leftover in a handoff-focused repo.
**Fix:**

```jsonc
"name": "zlobek-gminny-stromiec",
```

### WR-04: Mobile drawer content is unreachable on short viewports (no scroll while body is locked)

**File:** `src/lib/components/MobileNav.svelte:159-171` (drawer styles) and `37-46` (body scroll lock)
**Issue:** The drawer is `position: fixed; top: 0; bottom: 0` with no `overflow-y: auto`, and while open the `$effect` sets `document.body.style.overflow = 'hidden'`. On short viewports (landscape phone, e.g. 667×375; browser chrome reduces this further) the head (64px) plus five ≥60px link rows (~370px total) exceed the viewport height — the bottom links overflow the fixed panel with no way to scroll to them, and keyboard `focus()` cannot scroll them into view because nothing is scrollable. This undermines the keyboard-operability contract (WCAG 2.1 AA) the drawer exists to satisfy. The test suite only exercises portrait 375×667, so this is uncovered.
**Fix:** Make the drawer's nav region scrollable:

```css
.drawer {
	/* ... */
	overflow-y: auto;
	overscroll-behavior: contain;
}
```

## Info

### IN-01: Non-standard inert meta tag `text-scale` in app.html

**File:** `src/app.html:6`
**Issue:** `<meta name="text-scale" content="scale" />` is not a standard meta name and has no effect in any browser — it looks like an accidental artifact (possibly a garbled attempt at a text-scaling hint). Note the viewport tag on line 5 already correctly avoids `maximum-scale`/`user-scalable=no` (good for WCAG 1.4.4).
**Fix:** Delete the line.

### IN-02: Hamburger label says "Zamknij menu" while its handler only ever opens

**File:** `src/lib/components/MobileNav.svelte:80-83`
**Issue:** `aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}` promises toggle behavior, but `onclick={openDrawer}` only opens. In practice the button is covered by the scrim and outside the focus trap while open, so it is hard to activate — but a screen-reader user browsing by element can still encounter a button announced as "Zamknij menu" that would not close anything. Related nit: `aria-controls={DRAWER_ID}` references an element that does not exist in the DOM when closed (the drawer is inside `{#if open}`).
**Fix:** Make the handler a true toggle (`onclick={() => (open = !open)}`), which also makes the label honest; or keep a static "Otwórz menu" label since the open state is conveyed by `aria-expanded`.

### IN-03: sitemap.xml host does not match the live Pages URL

**File:** `static/sitemap.xml:11`
**Issue:** `<loc>https://zlobek-stromiec.pages.dev/</loc>` — the actual deployment is `https://zlobek-gminny-stromiec.pages.dev` (`docs/dev-env.md:17`). The file is deliberately unadvertised (no `Sitemap:` line in robots.txt) and marked placeholder, so impact is nil today, but the wrong host is a trap for the Phase 6 flip.
**Fix:** Use the real current host (or the future `https://zlobekstromiec.pl` with the existing PLACEHOLDER comment).

### IN-04: `apple-touch-icon.png` declared `purpose: maskable` in the web manifest

**File:** `static/site.webmanifest:24-29`
**Issue:** The 180×180 apple-touch icon is declared as the manifest's only `maskable` icon. Apple-touch icons are designed edge-to-edge, not with the maskable safe zone (80% inner circle), so Android install icons may crop the heart mark. Also 180×180 is below the recommended 192/512 maskable sizes.
**Fix:** Either drop `"purpose": "maskable"` (leaving `any` icons only) or add a purpose-built padded 512×512 maskable icon in a later phase.

### IN-05: Stale comment — Footer claims the Deklaracja page is "authored later — Phase 6"

**File:** `src/lib/components/Footer.svelte:3-4`
**Issue:** The header comment says the Deklaracja dostępności page is "authored later — Phase 6", but the stub route `src/routes/deklaracja-dostepnosci/+page.svelte` ships in this phase (and `svelte.config.js:15-16` explicitly notes the crawler now enforces the link). Misleading for the next maintainer.
**Fix:** Update the comment: the stub exists now; the *full* declaration content lands in Phase 6.

### IN-06: Unused `.cta-icon` class on the CTA arrow icon

**File:** `src/lib/components/Cta.svelte:32`
**Issue:** `<ArrowRight class="cta-icon" ...>` — no `.cta-icon` rule exists in the component's styles (and a scoped rule would not reach the child component's SVG without `:global()` anyway). Dead class.
**Fix:** Remove `class="cta-icon"`, or add the intended `:global(.cta-icon)` rule if styling was planned.

### IN-07: Deklaracja stub breaks conventions used everywhere else

**File:** `src/routes/deklaracja-dostepnosci/+page.svelte:9-12,28,34`
**Issue:** Two consistency drifts in the stub: (a) media queries use `48rem`/`64rem` while every other component uses `768px`/`1024px` for the same breakpoints — harmless today but two sources of truth for the breakpoint scale; (b) the hand-rolled `<svelte:head>` emits title + noindex but no `meta description` and no OG tags, unlike every Seo-backed route. Both are acknowledged stub tradeoffs; recording them so the Phase 6 rewrite normalizes them.
**Fix:** When authoring the full declaration (Phase 6), switch to `Seo.svelte` and px breakpoints.

### IN-08: Skip-link target `<main id="main">` lacks `tabindex="-1"`

**File:** `src/routes/+layout.svelte:18`
**Issue:** The skip link jumps to `#main`, but `<main>` is not focusable. Modern browsers move the sequential-focus starting point on fragment navigation, so this generally works, but adding `tabindex="-1"` to the target is the robust pattern for older Safari/VoiceOver combinations and guarantees `document.activeElement` actually moves.
**Fix:** `<main id="main" tabindex="-1">` (plus `main:focus { outline: none; }` if the global focus ring on the whole main region is unwanted — programmatic focus does not trigger `:focus-visible` in most browsers, so likely no style change needed).

---

_Reviewed: 2026-08-12T22:10:03Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
