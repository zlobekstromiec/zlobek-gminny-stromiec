# Phase 2: About, Documents & CMS - Pattern Map

**Mapped:** 2026-08-13
**Files analyzed:** 15 (new + modified)
**Analogs found:** 13 / 15 (2 CMS-infra files have no in-repo analog — external stack)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/routes/o-nas/+page.svelte` | route/page | build-import, request-response | `src/routes/+page.svelte` (composition) + `src/routes/deklaracja-dostepnosci/+page.svelte` (self-contained section) | role-match |
| `src/routes/dokumenty/+page.svelte` | route/page | build-import (fs.statSync), transform | `src/lib/components/Recruitment.svelte` (docs-panel rows) + `src/routes/+page.svelte` | role-match |
| `src/lib/content/o-nas.json` | content/data | build-import (Vite JSON) | `src/lib/content/site.ts` (typed constants) | role-match (format change TS→JSON) |
| `src/lib/content/day-plan.json` | content/data (migration) | build-import | `src/lib/content/site.ts` `dayPlan` (lines 100-109) | exact (extract-in-place) |
| `src/lib/content/dokumenty/*.json` | content/data (folder collection) | build-import (import.meta.glob) | `site.ts` `recruitment.docs` (lines 160-169) | role-match |
| `src/lib/components/DayPlan.svelte` (MODIFY) | component | build-import re-source | itself (currently imports `dayPlan` from site.ts, line 6) | exact |
| new O nas section components (misja/wartości/kadra/facility) | component | build-import | `DayPlan.svelte`, `Recruitment.svelte`, `Perks.svelte` | role-match |
| `src/lib/content/site.ts` (MODIFY) | content/data | — | itself (remove `dayPlan`; re-align `recruitment.docs` D-18; keep `coreMessage`) | exact |
| `tests/o-nas.spec.ts` | test | e2e + axe | `tests/polityka-prywatnosci.spec.ts` + `tests/home.spec.ts` | role-match |
| `tests/dokumenty.spec.ts` | test | e2e + axe | `tests/home.spec.ts` (docs-panel + link assertions) | role-match |
| `tests/home.spec.ts` (MODIFY) | test | e2e | itself (lines 93-100, D-18 lockstep update) | exact |
| `svelte.config.js` (MODIFY) | config | — | itself (`KNOWN_FUTURE_ROUTES` + `csp` directives) | exact |
| `_headers` (MODIFY) | config | — | itself (Phase 2 note already present: `/admin/*` CSP block) | exact |
| `vite.config.ts` (MODIFY) | config | — | itself (add `enhancedImages()` before `sveltekit()`) | exact |
| `static/admin/{index.html,config.yml,sveltia-cms.js}` | config/CMS infra | runtime SPA | **NO ANALOG** (external Sveltia stack) | none — use RESEARCH |
| OAuth Worker (`sveltia-cms-auth`, separate deploy) | infra | request-response (OAuth) | **NO ANALOG** (external Worker) | none — use RESEARCH |
| `docs/instrukcja-cms.md` | docs | — | no code analog (Polish staff guide) | none — D-21 |

## Pattern Assignments

### `src/routes/o-nas/+page.svelte` (route/page, build-import)

**Analogs:** `src/routes/+page.svelte` (page composition + Seo), `src/routes/deklaracja-dostepnosci/+page.svelte` (self-contained sectioned page with scoped styles + token usage).

**Page composition + Seo pattern** — copy from `src/routes/+page.svelte` lines 1-30:
- Header comment cites UI-SPEC section + requirement IDs.
- `import Seo from '$lib/components/Seo.svelte'` then `<Seo title="..." description="..." />` (Polish copy, noindex defaults true).
- Route adds NO extra `<main>`/landmark and NO extra `h1` beyond the page heading — layout owns `<main>` (see `+page.svelte` header comment lines 4-7).

**Build-time content import** — from `DayPlan.svelte` line 6 pattern, but from JSON:
```svelte
import onas from '$lib/content/o-nas.json';
import { marked } from 'marked';
const misjaHtml = marked.parseInline(onas.misja); // D-08 inline-only rich text
```

**Section + scoped-style + token pattern** — copy the structure of `deklaracja-dostepnosci/+page.svelte` (whole file) and `DayPlan.svelte` styles (lines 25-107):
- `max-width: 72rem; margin-inline: auto;` container with responsive `padding-inline` breakpoints at 48rem/64rem (deklaracja lines 21-38).
- Typography via tokens only: `var(--font-display)` / `var(--font-body)`, `var(--color-ink)` / `var(--color-muted)`, never hardcoded colors.
- `aria-labelledby` on each `<section>` tied to its heading id (DayPlan line 9).

**Plan dnia reuse (D-03):** render `<DayPlan />` (the modified component) directly, OR read the same `day-plan.json`. Single source — do not duplicate rows.

---

### `src/routes/dokumenty/+page.svelte` (route/page, build-import + fs transform)

**Analog:** `src/lib/components/Recruitment.svelte` docs-panel (lines 43-55) for the row markup; `src/routes/+page.svelte` for Seo/composition.

**Document-row markup (WCAG: meta INSIDE the link)** — copy from `Recruitment.svelte` lines 43-55:
```svelte
<a class="doc-row" href={doc.href}>
  <span class="doc-name">{doc.name}</span>
  <span class="doc-meta">{doc.meta}</span>
</a>
```
Keep meta (type/size/wersja) inside the `<a>` so screen readers announce it with the name (Recruitment header comment lines 4-7; WCAG 2.1 AA, Polish public-sector expectation). Reuse the `.doc-row`/`.doc-name`/`.doc-meta` styles (lines 240-270): min-height 48px touch target, underline on `--color-brand-blue`, hover `--color-brand-blue-hover`.

**Folder collection read (import.meta.glob):**
```svelte
const entries = import.meta.glob('$lib/content/dokumenty/*.json', { eager: true, import: 'default' });
```
Then group by `kategoria` select value; the RODO group renders nothing when its filtered array is empty (D-13, RESEARCH Pattern 4 — no special-casing, empty group simply not emitted).

**Build-time size/type (D-14):** use `statSync` in a `+page.server.ts` or build step (RESEARCH Code Examples): `` `static${publicPath}` `` for bytes, extension `.toUpperCase()` for the type badge.

---

### `src/lib/content/day-plan.json` (content migration, D-03)

**Analog:** `site.ts` `dayPlan` (lines 100-109) — exact extract-in-place.

Move the 7-row array verbatim (`{ time, what }` shape) into JSON. Keep the `PLACEHOLDER` intent: in JSON this becomes the D-09 boolean field pattern if this is a CMS singleton, OR retain a code comment where it stays code-side. Then re-point `DayPlan.svelte` line 6 from `import { dayPlan } from '$lib/content/site'` to `import dayPlan from '$lib/content/day-plan.json'` — no template change (lines 13-20 already iterate `dayPlan as row (row.time)`).

---

### `src/lib/content/o-nas.json` (content singleton, D-05)

**Analog:** `site.ts` structured-constants pattern (typed shape, PLACEHOLDER discipline).

Fields per D-05 / RESEARCH config: `misja` (markdown string), `wartosci[]` ({tytul, opis}), `kadra_opis` + `kadra_opiekunki` + `kadra_personel`, `obiekt_opis` + `obiekt_zdjecia[]`, `placeholder: true` (D-09 Polish boolean). Every field maps 1:1 to a Sveltia widget in `config.yml`.

---

### `src/lib/content/site.ts` (MODIFY)

**Self-analog.** Three edits, do NOT touch anything else (D-06 forced-only migration):
1. Remove `dayPlan` (lines 100-109) — migrated to `day-plan.json`.
2. Re-align `recruitment.docs` (lines 160-169) to the real BIP set (D-18): "Wniosek o przyjęcie dziecka" (NOT "Karta zgłoszenia dziecka"), regulamin rekrutacji, statut, załączniki 1-6, oświadczenie o rezygnacji; drop the 3 non-existent docs (Regulamin organizacyjny, Upoważnienie, Oświadczenia RODO) OR placeholder-flag. Each row's `href` points at its real hosted file with real `meta` (size + wersja) instead of the placeholder `'PDF'`/`'/dokumenty'`.
3. KEEP `coreMessage` (lines 10-11) hard-coded (D-11) — byte-exempt, never CMS.

**Preserve copy rules** (header lines 5): no emoji, no em dashes (except the byte-exempt `coreMessage`), en dash only in numeric ranges. PLACEHOLDER `//` comment convention stays.

---

### `tests/o-nas.spec.ts` and `tests/dokumenty.spec.ts` (NEW tests)

**Analogs:** `tests/polityka-prywatnosci.spec.ts` (route-stub contract: 200, single h1, noindex, axe-clean) + `tests/home.spec.ts` (richer per-section assertions).

**Test file skeleton** — copy from `polityka-prywatnosci.spec.ts` lines 1-33:
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('...', () => {
  test('route resolves with a 200 and a single Polish h1', async ({ page }) => {
    const response = await page.goto('/o-nas');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });
  test('no WCAG 2.1 AA violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

**Section/link assertions** — mirror `home.spec.ts` style: `getByRole('heading', { name })`, `.doc-row` count, meta-inside-link regex (line 99 `/Nazwa\s+PDF/`), `href` + 200 response for each file. For D-03 (o-nas): assert the same plan dnia rows appear on both `/` and `/o-nas`. RODO-hidden-when-empty assertion on `/dokumenty`.

**Header comment discipline** (both files): cite requirement IDs + the "do NOT weaken these assertions" clause (home.spec.ts lines 4-14).

---

### `tests/home.spec.ts` (MODIFY — D-18 lockstep, Pitfall 1)

**Self-analog, lines 93-100.** This is the highest-risk seam. Update:
- `.doc-row` count (line 97) from `6` to the real BIP count.
- The link-name regex (line 99) from `/Karta zgłoszenia dziecka\s+PDF/` to `/Wniosek o przyjęcie dziecka\s+.../`.
- Keep the "meta inside the link" WCAG assertion structure. Update in lockstep with the `site.ts` D-18 change; document as a UI-SPEC-consistent copy update (the file header permits change only alongside an approved amendment — D-18 is that change). A green suite still asserting "Karta zgłoszenia" is a warning sign.

---

### `svelte.config.js` (MODIFY)

**Self-analog.** Two edits:
1. Remove `/o-nas` and `/dokumenty` from `KNOWN_FUTURE_ROUTES` (lines 9-21) when the routes land, so the prerender crawler enforces them again.
2. CSP (lines 38-50) governs SvelteKit-prerendered pages ONLY — `/admin` is outside SvelteKit. Do NOT try to cover `/admin` here (Pitfall 3). Leave the page CSP untouched unless a page resource needs it.

### `_headers` (MODIFY)

**Self-analog.** The Phase 2 note is already in the file ("when it lands, add a path-scoped `/admin/*` CSP block here"). Add a `/admin/*` block: `script-src 'self'` (self-hosted bundle), `connect-src` for `https://api.github.com` + the Worker origin, `style-src 'unsafe-inline'`, `img-src` for media, `frame-src`/`form-action` for the OAuth popup (Pitfall 3). Keep the existing `/*` security baseline and the autogenerated Svelte immutable-headers block intact.

### `vite.config.ts` (MODIFY)

**Self-analog** (currently `plugins: [tailwindcss(), sveltekit()]`, line 7). Add `enhancedImages()` from `@sveltejs/enhanced-img` BEFORE `sveltekit()` (RESEARCH Pattern 2). Result: `plugins: [tailwindcss(), enhancedImages(), sveltekit()]`.

---

## Shared Patterns

### Content-source import (build-time, zero runtime reads)
**Source:** `DayPlan.svelte` line 6, `Recruitment.svelte` line 10, `+page.svelte` line 20.
**Apply to:** all new pages/components.
Pattern: `import X from '$lib/content/...'` (constant or JSON) resolved at build; Git is the source of truth, HTML is a derived artifact. New JSON: `import data from '$lib/content/file.json'`; folder collection: `import.meta.glob('$lib/content/dir/*.json', { eager: true, import: 'default' })`.

### Design-token-only styling (WCAG two-tier palette)
**Source:** `DayPlan.svelte` styles (lines 25-107), `Recruitment.svelte` styles (lines 61-271).
**Apply to:** every new component/page `<style>` block.
Container: `max-width: 72rem; margin-inline: auto;` + responsive `padding-inline` (16/24/32px at 768/1024). Typography: `var(--font-display)`/`var(--font-body)`. Colors: accessible-tier tokens for all text/UI (`--color-ink`, `--color-muted`, `--color-brand-blue`); expressive tints (`--color-tint-*`) decorative only. Comments cite the exact contrast ratio (DayPlan lines 91, Recruitment line 154). Touch targets `min-height: 48px` (Recruitment line 245).

### Per-route Seo + noindex
**Source:** `Seo.svelte` (whole), invoked in `+page.svelte` lines 25-28.
**Apply to:** `/o-nas`, `/dokumenty` pages.
`<Seo title="..." description="..." />` — Polish copy, `noindex` defaults true (pages.dev not indexed until Phase 6). Optionally pass `canonical`.

### Prerender inheritance
**Source:** `src/routes/+layout.ts` line 4 (`export const prerender = true`).
**Apply to:** new routes inherit automatically — do NOT add `+server.ts` or `prerender = false`. New pages stay zero-JS static (only existing hydrated island is MobileNav).

### Playwright + axe per-route test
**Source:** `tests/polityka-prywatnosci.spec.ts` (skeleton), `tests/home.spec.ts` (section assertions).
**Apply to:** both new spec files.
`test.describe` + 200/h1/noindex/axe baseline; axe tags `['wcag2a','wcag2aa','wcag21a','wcag21aa']`, `expect(results.violations).toEqual([])`.

### Copy rules
**Source:** `site.ts` header (lines 5), MEMORY copy-style-rules.
**Apply to:** all visitor-facing text, comments, titles, test names, CMS Polish labels/hints.
No emoji, no em dashes (except byte-exempt `coreMessage`), en dash only in numeric ranges. Polish only. `// PLACEHOLDER:` for code-side placeholders; `placeholder: true` boolean (D-09) for CMS content.

## No Analog Found

Files with no close in-repo match — planner should use RESEARCH.md Code Examples + STACK.md instead:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `static/admin/config.yml` | CMS config | — | No CMS exists yet; use RESEARCH "Sveltia config.yml" example (lines 313-376). Polish labels/hints on every widget. |
| `static/admin/index.html` | CMS shell | runtime SPA | Use RESEARCH "self-hosted bundle" example (lines 378-386), `lang="pl"`. |
| `static/admin/sveltia-cms.js` | vendored bundle | — | Self-hosted pinned copy of `@sveltia/cms` dist; refresh manually on upgrade (RESEARCH Runtime State). |
| `sveltia-cms-auth` Worker | OAuth infra | request-response | Separate Cloudflare Worker deploy; no in-repo analog. GitHub OAuth App under Org `zlobekstromiec`. Secrets `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` on the Worker only. |
| `docs/instrukcja-cms.md` | Polish staff guide | — | D-21 deliverable; no code analog. Annotated screenshots (English chrome, Polish labels — Pitfall 2). |

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/components/`, `src/lib/content/`, `tests/`, root configs (`svelte.config.js`, `vite.config.ts`, `_headers`).
**Files scanned:** 12 read in full (2 routes, 4 components, site.ts, 2 tests, 3 configs, _headers, layout).
**Pattern extraction date:** 2026-08-13
