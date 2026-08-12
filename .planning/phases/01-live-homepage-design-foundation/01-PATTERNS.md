# Phase 1: Live Homepage & Design Foundation - Pattern Map

**Mapped:** 2026-08-12
**Files analyzed:** 30 (all net-new)
**Analogs found:** 0 in-repo / 30 (greenfield repo — no application code exists)

> **Greenfield note.** This repository contains only `.planning/` docs, `.claude/`, `.envrc`, and `.gitignore`. There is **no `package.json`, no `src/`, no scaffold, no `main.html`** (the empty placeholder the research mentioned is already gone). Therefore **no codebase analog exists for any file**. Instead of a same-repo analog, every file below is anchored to its **authoritative contract**:
>
> - **UI-SPEC** = `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` (LOCKED design system — tokens, component contracts, Polish copy, `@theme` seed)
> - **RESEARCH** = `.planning/phases/01-live-homepage-design-foundation/01-RESEARCH.md` (verified stack, project tree, code examples)
> - **STACK** = `.planning/research/STACK.md` · **ARCH** = `.planning/research/ARCHITECTURE.md`
>
> The planner should treat "Analog" columns below as **"pattern source"** — the contract to copy verbatim — not an existing file to mimic.

---

## File Classification

Roles adapted to a static SvelteKit site (no controllers/services/DB this phase). "Data flow" is build-time only — most files are `static-render` (prerendered HTML) or `config`.

### Config / scaffold (Wave 0)

| New File                  | Role                   | Data Flow        | Pattern Source                                      | Match Quality |
| ------------------------- | ---------------------- | ---------------- | --------------------------------------------------- | ------------- |
| `package.json`            | config                 | n/a              | RESEARCH §Installation + Validation (scripts)       | contract      |
| `svelte.config.js`        | config                 | n/a              | RESEARCH §Code Examples "Cloudflare adapter config" | exact-example |
| `vite.config.ts`          | config                 | n/a              | RESEARCH §Code Examples "Tailwind v4 Vite plugin"   | exact-example |
| `src/app.d.ts`            | config (types)         | n/a              | RESEARCH §Code Examples "Platform env typing stub"  | exact-example |
| `src/app.html`            | config (shell)         | static-render    | RESEARCH tree + ARCH; `<html lang="pl">`            | contract      |
| `src/app.css`             | config (design tokens) | build → CSS vars | UI-SPEC Appendix `@theme` seed (verbatim)           | exact-example |
| `.tool-versions`          | config                 | n/a              | RESEARCH §Environment (pin LTS 22.x)                | contract      |
| `.pre-commit-config.yaml` | config                 | n/a              | CONTEXT D-08; global CLAUDE.md conventions          | contract      |
| `docs/dev-env.md`         | docs                   | n/a              | CONTEXT D-08 (machine-contract doc)                 | contract      |
| `playwright.config.ts`    | config (test)          | n/a              | RESEARCH §Validation Architecture                   | contract      |

### Layout & routes

| New File                                         | Role             | Data Flow         | Pattern Source                                           | Match Quality |
| ------------------------------------------------ | ---------------- | ----------------- | -------------------------------------------------------- | ------------- |
| `src/routes/+layout.ts`                          | route config     | build (prerender) | RESEARCH §Pattern 1 (verbatim 1-liner)                   | exact-example |
| `src/routes/+layout.svelte`                      | layout shell     | static-render     | RESEARCH §Pattern 3 + UI-SPEC Accessibility Contract     | contract      |
| `src/routes/+page.svelte`                        | route (homepage) | static-render     | UI-SPEC Hero/CTA/News/QuickContact contracts             | contract      |
| `src/routes/deklaracja-dostepnosci/+page.svelte` | route (stub)     | static-render     | RESEARCH §Open Q2 / A4 (optional stub — planner decides) | contract      |

### Components (`src/lib/components/`)

| New File              | Role               | Data Flow             | Pattern Source                                          | Match Quality |
| --------------------- | ------------------ | --------------------- | ------------------------------------------------------- | ------------- |
| `Header.svelte`       | component          | static-render         | UI-SPEC §Header/Nav                                     | contract      |
| `MobileNav.svelte`    | component (island) | event-driven (client) | UI-SPEC §Header/Nav mobile drawer + Pitfall 10          | contract      |
| `Footer.svelte`       | component          | static-render         | UI-SPEC §Footer + Pitfall 14 (BIP)                      | contract      |
| `SkipLink.svelte`     | component          | static-render         | UI-SPEC §Interaction (skip link)                        | contract      |
| `Seo.svelte`          | component (head)   | static-render         | RESEARCH §Pattern 5 + Pitfall 11                        | contract      |
| `Hero.svelte`         | component          | static-render         | UI-SPEC §Hero + CONTEXT D-01/D-02/D-03                  | contract      |
| `Cta.svelte`          | component          | static-render         | UI-SPEC §Rekrutacja CTA (primary/secondary variants)    | contract      |
| `NewsPreview.svelte`  | component          | static-render         | UI-SPEC §Latest-Aktualności (with REQUIRED empty state) | contract      |
| `QuickContact.svelte` | component          | static-render         | UI-SPEC §Quick-contact block                            | contract      |
| `src/lib/nav.ts`      | data module        | build                 | RESEARCH tree (single source of 5 nav links)            | contract      |

### Static assets

| New File                                   | Role              | Data Flow | Pattern Source                                | Match Quality |
| ------------------------------------------ | ----------------- | --------- | --------------------------------------------- | ------------- |
| `static/fonts/*.woff2` (Baloo 2 + Nunito)  | asset             | static    | UI-SPEC §Font + RESEARCH §Pattern 4           | contract      |
| `static/robots.txt`                        | config            | static    | CONTEXT D-11 (`Disallow: /` on `*.pages.dev`) | contract      |
| `static/_headers`                          | config (security) | static    | RESEARCH §Security Domain (CSP/HSTS/nosniff)  | contract      |
| `static/` favicon set + `og-placeholder.*` | asset             | static    | CONTEXT D-10                                  | contract      |
| `static/sitemap.xml` (or endpoint)         | config            | static    | CONTEXT D-11 (scaffolded, noindex-aligned)    | contract      |

### Tests (`tests/`)

| New File                   | Role            | Data Flow        | Pattern Source                                         | Match Quality |
| -------------------------- | --------------- | ---------------- | ------------------------------------------------------ | ------------- |
| `tests/home.spec.ts`       | test (e2e/a11y) | request-response | RESEARCH §Code Examples "Homepage smoke test with axe" | exact-example |
| `tests/nav.spec.ts`        | test (e2e)      | request-response | RESEARCH §Validation (SITE-03 map)                     | contract      |
| `tests/responsive.spec.ts` | test (e2e)      | request-response | RESEARCH §Validation (SITE-02 viewport matrix)         | contract      |

---

## Pattern Assignments

Because there is no in-repo code, each assignment quotes the **exact contract text/code** the file must copy. Line numbers reference the pattern-source doc named in the heading.

### `svelte.config.js` (config)

**Source:** RESEARCH §Code Examples (lines 343-352) — copy verbatim.

```js
// svelte.config.js — Source: Context7 /sveltejs/kit (adapter-cloudflare)
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: { adapter: adapter() }   // Pages: build output → .svelte-kit/cloudflare
};
```

**Gotcha (CLAUDE.md):** adapter-cloudflare makes SvelteKit server routes the Pages Functions — do NOT also hand-author `/functions`. (No server routes this phase.)

---

### `vite.config.ts` (config)

**Source:** RESEARCH §Code Examples (lines 370-377) — copy verbatim.

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
```

**Gotcha:** Tailwind v4 attaches via its Vite plugin — there is **no `tailwind.config.js`** and no PostCSS config.

---

### `src/app.d.ts` (config / types)

**Source:** RESEARCH §Code Examples (lines 356-367) — copy verbatim; keep `env` empty (secrets land Phase 4).

```ts
declare global {
  namespace App {
    interface Platform {
      env: {
        // Phase 4 adds: RESEND_API_KEY, TURNSTILE_SECRET_KEY
      };
    }
  }
}
export {};
```

---

### `src/app.css` (design tokens — single most-inherited artifact)

**Source:** UI-SPEC §Appendix `@theme` seed (lines 290-327) — **paste verbatim**, plus `@import "tailwindcss";` and the self-hosted `@font-face` block (Pattern 4).

Token seed (UI-SPEC lines 291-326, abridged — copy the full block):

```css
@import "tailwindcss";
@theme {
  --color-surface: #FFFFFF;
  --color-surface-warm: #FBFAF7;
  --color-band: #E0F2FE;
  --color-ink: #1E293B;          /* body text 14.65:1 AAA */
  --color-muted: #475569;
  --color-brand-blue: #0369A1;   /* links / primary / wordmark 5.93:1 AA */
  --color-accent: #F59E0B;       /* CTA fill — ink label 6.82:1 AA */
  --color-accent-hover: #D97706;
  --color-accent-active: #B45309;
  --color-danger: #B91C1C;
  --color-danger-surface: #FEF2F2;
  --color-focus-ring: #0C4A6E;
  --color-border-strong: #64748B;
  --color-border-subtle: #E2E8F0;
  --color-expr-blue: #38BDF8;    /* decorative ONLY — never on text */
  --color-expr-yellow: #FACC15;  /* decorative ONLY */
  --color-expr-orange: #FB923C;  /* decorative ONLY */
  --font-display: "Baloo 2", system-ui, sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
  --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-pill: 9999px;
}
```

Font-face pattern (RESEARCH §Pattern 4, UI-SPEC lines 28-30): `@font-face` → `static/fonts/*.woff2`, subset `latin,latin-ext` (full Polish diacritics verified), `font-display: swap`, preload 400/700. **No Google CDN** (RODO).

**Hard rules to encode (UI-SPEC lines 137-141, 306-317):** expressive `expr-*` tokens are decorative surfaces only — never `text-expr-*`; CTA label is `ink` on amber (white only on `active`); body links `brand-blue` + underline.

---

### `src/routes/+layout.ts` (route config)

**Source:** RESEARCH §Pattern 1 (lines 234-237) — verbatim; set once, all routes inherit.

```ts
export const prerender = true;
```

**Anti-pattern (RESEARCH lines 232, 279-285):** no `+server.ts`, no `prerender = false` anywhere this phase.

---

### `src/routes/+layout.svelte` (semantic landmark shell)

**Source:** RESEARCH §Pattern 3 (lines 263-269) + UI-SPEC §Accessibility Contract (lines 245-251).

```svelte
<SkipLink />                          <!-- „Przejdź do treści" → #main -->
<Header />                            <!-- sticky; <nav aria-label="Główna nawigacja"> -->
<main id="main"><slot /></main>
<Footer />
```

**Rules:** exactly one `<header>`, `<nav aria-label="Główna nawigacja">`, one `<main id="main">`, one `<footer>`; skip link is the first focusable element; homepage owns the single `<h1>`.

---

### `src/routes/+page.svelte` (homepage)

**Source:** UI-SPEC component contracts. Compose `Hero` + `Cta` + `NewsPreview` (empty state) + `QuickContact` + `Seo`. Owns the single `<h1>`.
**Sections + Polish copy** come from UI-SPEC §Copywriting Contract (lines 259-274). Section bands alternate `#FFFFFF / #FBFAF7 / #E0F2FE` (UI-SPEC line 140).

---

### `src/lib/components/Header.svelte` + `MobileNav.svelte`

**Source:** UI-SPEC §Header/Nav (lines 167-174).

- Sticky bar, wordmark left (Baloo 2 700 `brand-blue`), 5 links right; height 64→72px; gains `shadow-sm` + `border-subtle` on scroll.
- Links: Aktualności · O nas · Rekrutacja · Dokumenty · Kontakt (14px/700, 44px hit area, gap 24px). Active = 3px `brand-blue` bottom bar **and** `aria-current="page"` (not color alone).
- `MobileNav` is the only hydrated island (RESEARCH lines 23, 190). Drawer (<`md`): hamburger 44×44 `aria-label`/`aria-expanded`/`aria-controls`; open = `role="dialog"` `aria-modal="true"`, **focus trap + ESC + restore focus + body scroll lock**; built from native `<button>`/`<a>` (RESEARCH Don't-Hand-Roll, Pitfall 10). Animation respects reduced-motion.

Consume nav links from `src/lib/nav.ts` (single source).

---

### `src/lib/components/Footer.svelte`

**Source:** UI-SPEC §Footer (lines 210-217) + Pitfall 14 (RESEARCH lines 333-338).

- BIP link labeled exactly `Biuletyn Informacji Publicznej (BIP)` → `https://ugstromiec.naszbip.pl/zlobek`, `target="_blank" rel="noopener noreferrer"` + visually-hidden `(otwiera się w nowej karcie)`.
- `Deklaracja dostępności` → `/deklaracja-dostepnosci` (may 404 until Phase 6 — see stub decision A4).
- `Kontakt` → `/kontakt`. Org line: `Żłobek Gminny w Stromcu — jednostka organizacyjna Gminy Stromiec.`

---

### `src/lib/components/Hero.svelte`

**Source:** UI-SPEC §Hero (lines 176-181) + CONTEXT D-01/D-02/D-03.

- Layout: stacked (base) → 2-col `lg` (text left, image right). `py` 48→96.
- `h1` = short hook (Baloo 2, marked `PLACEHOLDER`), then the **verbatim** 4-sentence PROJECT.md core message as a styled lead quote (Nunito `muted`) — this is **final client copy**, not a placeholder (D-02).
- Image slot: `radius-lg`, non-identifiable warm stock/AI (no child faces), marked `PLACEHOLDER`, `aria-hidden` if decorative. Ship as WebP/AVIF with explicit width/height, `fetchpriority="high"` (Pitfall 9). Reusable as OG image.
- Decorative `expr-*` blobs behind at low z-index, `aria-hidden`.

---

### `src/lib/components/Cta.svelte`

**Source:** UI-SPEC §Rekrutacja CTA (lines 183-191).

- Primary: label `Zapisz dziecko` → `/rekrutacja`; pill, padding `12px 24px`, min-height 44px, 16px/700. Default amber `#F59E0B` + `ink`; hover `#D97706` + raise; focus-visible 3px `#0C4A6E` offset 2px; active `#B45309` + **white** label.
- Secondary variant: transparent, 2px `brand-blue` border, `brand-blue` label, hover fill `#E0F2FE`. Never amber.

---

### `src/lib/components/NewsPreview.svelte`

**Source:** UI-SPEC §Latest-Aktualności (lines 193-199) — **empty state is REQUIRED** (no posts until Phase 3).

- Header: `h2` „Aktualności" + secondary link „Zobacz wszystkie" → `/aktualnosci`.
- Empty state: panel `#FBFAF7`, `radius-md`, centered, Lucide `newspaper` `aria-hidden`; heading `„Wkrótce pojawią się aktualności"`; body per UI-SPEC line 199.
- Card contract (for when posts exist) documented in UI-SPEC line 196.

---

### `src/lib/components/QuickContact.svelte`

**Source:** UI-SPEC §Quick-contact (lines 201-208). Items with Polish labels + `PLACEHOLDER` values: Adres, Telefon (`tel:` link), E-mail `zlobek@ugstromiec.pl` (`mailto:`), Godziny. Tel/email `brand-blue` underlined, 44px targets. Lucide icons `aria-hidden`.

---

### `src/lib/components/Seo.svelte`

**Source:** RESEARCH §Pattern 5 (lines 275-277) + Pitfall 11.

- `<svelte:head>` with per-route Polish `<title>` + `meta description` + canonical + OG/Twitter tags (placeholder share image).
- **noindex while on `*.pages.dev`** — `<meta name="robots" content="noindex">` (D-11), flips at Phase 6.

---

### `tests/home.spec.ts` (e2e / a11y)

**Source:** RESEARCH §Code Examples (lines 380-392) — copy verbatim, extend with HOME-01/HOME-02 assertions.

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no WCAG 2.1 AA violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Add: assert verbatim core message text (HOME-01), CTA + Aktualności empty state + quick-contact present (HOME-02).

---

## Shared Patterns

### Design tokens (SITE-04) — highest project risk

**Source:** UI-SPEC §Appendix (lines 290-327) + §Color (lines 90-141).
**Apply to:** every component. Draw all text/icon/border/focus/button-label colors from the **Accessible tier**; `expr-*` for decorative surfaces only. Never `text-expr-*`/`text-yellow`/`text-orange` on light backgrounds. CTA never white-on-amber except `active`.

### Accessibility (WCAG 2.1 AA baseline)

**Source:** UI-SPEC §Accessibility Contract (lines 243-251) + RESEARCH Pitfall 10.
**Apply to:** every component/route. One `h1`; semantic landmarks; ≥44×44px targets; visible focus ring `outline: 3px solid #0C4A6E; outline-offset: 2px` (never `outline: none`); keyboard-operable drawer; no meaning by color alone; decorative images/icons `aria-hidden`; honor `prefers-reduced-motion`.

### Polish-only + placeholder discipline (SITE-06 / Pitfall 12)

**Source:** UI-SPEC §Copywriting Contract (lines 255-274) + CONTEXT D-02/D-03.
**Apply to:** all visitor-facing strings. Use the authoritative Polish copy table; mark every non-final placeholder with a greppable `PLACEHOLDER` token. The verbatim core message is final (not a placeholder).

### External-link safety

**Source:** UI-SPEC §Footer + RESEARCH §Security Domain.
**Apply to:** all external links (BIP now). `rel="noopener noreferrer"` + visually-hidden new-tab suffix.

### Motion / reduced-motion

**Source:** UI-SPEC §Motion (lines 236-239).
**Apply to:** all transitions/animations. Wrap non-essential motion (transforms, blob float, drawer slide, `scroll-behavior: smooth`) in `@media (prefers-reduced-motion: reduce)`.

### Security headers

**Source:** RESEARCH §Security Domain (lines 508-518).
**Apply to:** `static/_headers` — CSP (self + inline styles + self-hosted fonts), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`. Foundation extended in Phases 2–4.

---

## No Analog Found

**All 30 files** — no in-repo analog (greenfield). Planner should use the pattern sources named per file above:

- Config/scaffold + tests with an exact code block → copy the RESEARCH §Code Examples verbatim.
- Design tokens → copy the UI-SPEC §Appendix `@theme` seed verbatim.
- Components/routes → implement to the UI-SPEC component contracts (colors/type/spacing/copy already locked and AA-verified — do NOT re-derive).

**Downstream inheritance:** the patterns established here (two-tier `@theme` tokens, semantic shell, self-hosted fonts, `prerender = true`, `platform.env` typing, `Seo.svelte`, security headers) are consumed by Phase 2 (Sveltia CMS + OAuth Worker) and Phase 4 (form `+server.ts` + Resend/Turnstile secrets).

## Metadata

**Analog search scope:** entire repo root (`.` excluding `.git`) — confirmed no `package.json`, no `src/`, no `.svelte`/`.ts` source, no `main.html`.
**Files scanned:** 0 source files (docs only).
**Stack correction to carry into plans:** UI-SPEC names `lucide-svelte` (deprecated) → use **`@lucide/svelte`** (RESEARCH lines 13, 114).
**Node pin:** use even LTS (22.x) in `.tool-versions` + matching Cloudflare Pages build var; do not build on local Node 25 (RESEARCH A3/Open Q1).
**Pattern extraction date:** 2026-08-12
</content>
</invoke>
