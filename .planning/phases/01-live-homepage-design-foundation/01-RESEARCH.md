# Phase 1: Live Homepage & Design Foundation - Research

**Researched:** 2026-08-12
**Domain:** SvelteKit 2 + Svelte 5 static-first content site on Cloudflare Pages; Tailwind v4 CSS-first design-token foundation; WCAG 2.1 AA baseline; Polish-only public-sector homepage
**Confidence:** HIGH (stack, patterns, versions verified same-day against npm + Context7; design system fully locked in UI-SPEC)

## Summary

Phase 1 is a **greenfield scaffold + first deployable slice**. There is no existing code (empty repo; only an untracked empty `main.html` and a `.envrc`). The entire technical shape is already locked by two authoritative artifacts the planner MUST treat as inputs, not decisions to re-open: `01-UI-SPEC.md` (the complete, approved design system — colors, type, spacing, component contracts, Polish copy, Tailwind `@theme` seed) and `.planning/research/STACK.md` (framework + versions). This research translates the (Astro-flavored) `ARCHITECTURE.md` into concrete SvelteKit conventions, re-verifies every Phase-1-relevant package version against the live npm registry, and narrows the project-wide pitfalls to the six that actually bite in Phase 1.

The work is: (1) scaffold SvelteKit 2 + Svelte 5 with `@sveltejs/adapter-cloudflare`, Tailwind v4, self-hosted fonts, and the a11y/test gate; (2) implement the two-tier `@theme` token system verbatim from the UI-SPEC; (3) build the semantic layout shell (header/nav + footer), the homepage (hero with verbatim core message, Rekrutacja CTA, Aktualności preview with empty state, quick-contact); (4) scaffold the metadata/SEO mechanism (noindex on `*.pages.dev`); (5) wire Cloudflare Pages git-integration so `push → build → deploy` works end-to-end.

**One correction to the UI-SPEC surfaced by this research:** the UI-SPEC names the icon library `lucide-svelte`, but that package is now **deprecated** (npm: "Please use @lucide/svelte instead"). Use **`@lucide/svelte`** (the Svelte-5-native successor, peer `svelte@^5`). This is the only stack deviation; everything else in STACK.md/UI-SPEC is current.

**Primary recommendation:** Scaffold with `npx sv create` → `npx sv add tailwindcss` → swap adapter to `@sveltejs/adapter-cloudflare`; paste the UI-SPEC `@theme` seed into `app.css`; build content routes with `export const prerender = true`; connect Cloudflare Pages git-integration (build `npm run build`, output `.svelte-kit/cloudflare`). Establish the accessible tokens and the axe/svelte-check gate **before** building components — the palette-vs-AA tension is the single highest project risk.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Homepage + section shells | CDN / Static (prerendered HTML) | Frontend Server (SvelteKit build) | Content never changes per-request; `prerender = true` bakes static HTML served from Cloudflare edge (best LCP/TTFB, zero runtime cost) |
| Design tokens / palette | Browser (CSS custom properties) | — | Tailwind v4 `@theme` compiles to CSS variables; no JS needed |
| Header nav + mobile drawer | Browser (client island) | — | Interactivity (hamburger, focus trap, ESC) is a small hydrated Svelte island; the nav markup itself is static |
| Fonts (Baloo 2 + Nunito) | CDN / Static (self-hosted WOFF2) | — | Self-hosted `@font-face` from `static/` — no Google CDN (RODO + perf) |
| Metadata / SEO / OG | CDN / Static (per-route `<svelte:head>`) | — | Emitted into prerendered HTML at build time |
| Deploy pipeline | CI / Platform (Cloudflare Pages git-integration) | — | Push to `main` → Cloudflare builds + deploys; no self-managed CI runner |
| Secrets / env | Platform (Cloudflare env / `platform.env`) | — | **None consumed in Phase 1** — secrets arrive Phase 4 (Resend/Turnstile). Establish the `platform.env` typing pattern only |

**Note:** Phase 1 has **no API/backend tier and no database tier** by design (static-first; forms are Phase 4, CMS is Phase 2). Do not introduce a `+server.ts` endpoint, a database, or any runtime data store this phase.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | SvelteKit app deployed on Cloudflare with automatic deploys from git | Standard Stack (SvelteKit 2 + `@sveltejs/adapter-cloudflare`); "Cloudflare Pages git-integration" pattern; verified build cmd `npm run build` → output `.svelte-kit/cloudflare` |
| SITE-02 | Mobile-first responsive; usable on phone/tablet/desktop | UI-SPEC Layout & Breakpoints (Tailwind v4 defaults); Pattern "Mobile-first Tailwind utilities"; header collapses to drawer < `md` |
| SITE-03 | Persistent header → 5 sections; footer → BIP + Deklaracja dostępności + Kontakt | UI-SPEC Header/Nav + Footer component contracts; Pattern "Semantic landmark layout shell"; Pitfall 14 (BIP link correctness) |
| SITE-04 | Joyful palette split into expressive (decorative) + accessible (text/UI) tokens | UI-SPEC Color two-tier token system (AA-verified pairings) + `@theme` seed; Pitfall 1 (palette-vs-AA); Don't-Hand-Roll (contrast math already done) |
| SITE-06 | All visitor-facing content in Polish, no English | UI-SPEC Copywriting Contract (authoritative Polish strings); `<html lang="pl">`; Assumptions log flags placeholder copy |
| HOME-01 | Hero features żłobek core message verbatim | CONTEXT D-01/D-02 (hook headline + verbatim lead); PROJECT.md verbatim text is final client copy; UI-SPEC Hero contract |
| HOME-02 | Homepage surfaces Rekrutacja CTA + latest-Aktualności preview + quick contact | UI-SPEC Rekrutacja CTA / Aktualności-preview (with required empty state) / quick-contact contracts |
</phase_requirements>

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero core-message presentation (HOME-01)**
- **D-01:** Layout = hook headline + verbatim lead. A short, punchy Baloo-2 `h1` hook line sits above the żłobek's full 4-sentence core message, which appears **verbatim** directly beneath as a styled lead paragraph/quote (Nunito, `muted`). Resolves the placeholder `h1` the UI-SPEC left open.
- **D-02:** The verbatim message is the PROJECT.md text ("Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać…") — treated as **final client copy**, not a placeholder. The short hook headline is a marked Polish PLACEHOLDER (content-first), confirmed at launch (LAUNCH-01).
- **D-03:** Hero image slot = stock/AI warm photo, constrained to **non-identifiable imagery (no real child faces)** — environment, hands, toys, or clearly-synthetic — consent-safe even as a placeholder (PITFALLS #13). Marked PLACEHOLDER; swapped for consented real photography in Phase 6. Reusable as the Open Graph share image.

**Deployment, accounts & live URL (SITE-01)**
- **D-04:** Deploy target = Cloudflare Pages (Git integration). Push to `main` → auto build (`npm run build`) + deploy (output `.svelte-kit/cloudflare`). No self-managed CI.
- **D-05:** Live URL for Phase 1 = `*.pages.dev` (free Cloudflare Pages subdomain). Custom domain deferred to launch (Phase 6).
- **D-06:** Dedicated project accounts for clean future handoff: a new Gmail (owner identity), a new GitHub Organization (owns the repo; will own Phase 2 CMS OAuth App + hold staff editors), and a new Cloudflare account (Pages now; DNS/Turnstile/Resend later). Everything roots to the new Gmail.
- **D-07:** GitHub identity = Organization (not personal) — enables owner transfer + member management for handoff.

**Foundation scaffold & quality gates (SITE-01, SITE-02) — ⚠ DEFAULTED while user away; confirm**
- **D-08 (default):** Dev-env conventions = asdf `.tool-versions`, pre-commit (`.pre-commit-config.yaml` running lint/format/svelte-check), and `docs/dev-env.md` (machine-contract onboarding doc). direnv `.envrc` pattern seeded too, carrying no real secrets in Phase 1 (secrets arrive Phase 4). Matches the user's established global conventions.
- **D-09 (default):** CI/testing depth = Core a11y gate now — `svelte-check` + `eslint-plugin-svelte` (a11y rules) + a single Playwright + `@axe-core/playwright` smoke test on the homepage. Lighthouse CI deferred to Phase 6.

**Metadata & share-preview foundation (SITE-06, feeds Phase 6 SEO) — ⚠ DEFAULTED while user away; confirm**
- **D-10 (default):** Build the reusable metadata mechanism now: `<html lang="pl">`, a reusable head/SEO component for per-page Polish `<title>` + `meta description` + canonical, a favicon set, and Open Graph + Twitter card tags with a branded placeholder share image, so a shared `*.pages.dev` link looks professional.
- **D-11 (default):** `robots.txt` + `sitemap.xml` scaffolded but set to noindex/disallow while on the `*.pages.dev` placeholder, flipping to indexable at launch (Phase 6) — prevents Google indexing placeholder content.
- **D-12 (default):** Deferred to Phase 6: JSON-LD structured data (`GovernmentOrganization`/`ChildCare`/`LocalBusiness`) + Google Search Console / Business Profile — need confirmed real NAP data + real domain, unavailable in Phase 1.

### Claude's Discretion
- Exact scaffold file layout, component/route structure, and SvelteKit conventions (translate ARCHITECTURE.md's Astro-flavored tree to SvelteKit: `src/routes/**/+page.svelte`, `export const prerender = true`, `+server.ts`, `platform.env`).
- Precise placeholder copy for the hook headline, subcopy, and quick-contact values (all marked PLACEHOLDER).

### Deferred Ideas (OUT OF SCOPE)
- **Buy the domain `zlobekstromiec.pl`** — NOT yet purchased. Prerequisite before Phase 4 (Resend SPF/DKIM/DMARC) and Phase 6 (custom domain + launch). When bought, register directly in the project Cloudflare account. Roadmap/state doc update recommended.
- **Lighthouse CI** perf/a11y budget → Phase 6.
- **JSON-LD structured data + Google Search Console / Business Profile** → Phase 6 (needs real NAP + domain).
- **Real photography (with wizerunek consent)** + real hook-headline/subcopy/quick-contact values → Phase 6 (LAUNCH-01).
</user_constraints>

## Project Constraints (from CLAUDE.md)

Actionable directives the planner MUST honor (same authority as locked decisions):

- **Polish only** — all visitor-facing text in Polish; no English shipped (SITE-06).
- **WCAG 2.1 AA** — legally required (podmiot publiczny). AA contrast, keyboard operable, visible focus, `prefers-reduced-motion`. Deklaracja dostępności itself is Phase 6, but the AA baseline starts here.
- **adapter-cloudflare gotcha:** SvelteKit server routes ARE the Pages Functions — do NOT also hand-author a `/functions` dir. (No server routes in Phase 1 anyway.) Read secrets via `event.platform.env.*`, never `import.meta.env`.
- **Tailwind v4:** CSS-first `@theme{}` tokens in `app.css` — there is **no `tailwind.config.js`**.
- **Palette/contrast:** two-tier tokens (expressive decorative vs accessible text/UI). Never put bright yellow/orange on text. Follow `01-UI-SPEC.md` — do not re-derive colors/type/spacing.
- **Content:** placeholder-first; mark placeholders with a greppable `PLACEHOLDER` token; children's photos need documented *wizerunek* consent before launch (non-identifiable stock only in Phase 1).
- **BIP:** link prominently to `https://ugstromiec.naszbip.pl/zlobek` — do not rebuild BIP.
- **Near-zero cost:** free tiers only; no DB, no paid services.
- **Verify before commit:** `npm run check && npm run lint && npm run test`.
- **Deploy:** Cloudflare Pages git-integration → push to `main` auto-builds/deploys.
- **Workflow:** route file-changing work through GSD; don't make direct repo edits outside a GSD workflow unless explicitly asked.

## Standard Stack

Scoped to Phase 1. (Sveltia CMS, Resend, Turnstile, `mdsvex`/`marked` belong to Phases 2–4 and are intentionally excluded here.) All versions re-verified against the live npm registry on 2026-08-12.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@sveltejs/kit` | 2.70.2 | App framework / router / static generation | Org standard on Cloudflare; content routes prerender to static HTML. [VERIFIED: npm registry — 2.4M dl/wk, official repo] |
| `svelte` | 5.56.8 | UI compiler (runes) | Minimal JS; ideal for mostly-static site + a few islands. Svelte 5 runes are the current default. [VERIFIED: npm registry — 5.3M dl/wk] |
| `@sveltejs/adapter-cloudflare` | 7.2.9 | Deploy adapter (Pages + Workers static assets) | Correct adapter for Cloudflare Pages; splits prerendered assets from server routes; exposes `platform.env`. NOT `adapter-cloudflare-workers` (legacy) or `adapter-static` (can't run future form endpoints). [VERIFIED: npm registry — 195k dl/wk] |
| `tailwindcss` | 4.3.3 | Styling / design tokens | v4 is CSS-first: brand palette as `@theme{}` tokens — no `tailwind.config.js`. Mobile-first utilities. [VERIFIED: npm registry — 120M dl/wk] |
| `@tailwindcss/vite` | 4.3.3 | Tailwind v4 Vite plugin | v4 plugs into Vite directly (not PostCSS). Must match `tailwindcss` version. [VERIFIED: npm registry — 43M dl/wk] |
| `vite` | 8.2.1 | Bundler under SvelteKit | Ships with `sv create`; Tailwind v4 attaches via its Vite plugin. [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lucide/svelte` | 1.31.0 | Icon library (Svelte-5 native) | Nav/CTA/empty-state/quick-contact icons; decorative icons `aria-hidden`. **Replaces the deprecated `lucide-svelte` named in the UI-SPEC.** peer `svelte@^5`. [VERIFIED: npm registry — 709k dl/wk, official lucide repo] |
| `svelte-check` | 4.7.5 | Type + a11y diagnostics | `npm run check` in pre-commit + CI (ships with `sv create`). [VERIFIED: npm registry] |
| `eslint-plugin-svelte` | 3.22.0 | Lint incl. Svelte a11y rules | Editor + CI a11y gate (D-09). [VERIFIED: npm registry — 1.4M dl/wk] |
| `@playwright/test` | 1.62.1 | E2E harness hosting the axe scan | Single homepage smoke test (D-09). [VERIFIED: npm registry — 52M dl/wk] |
| `@axe-core/playwright` | 4.13.0 | Runtime WCAG scan in the smoke test | Catches contrast/ARIA/landmark issues the compiler can't (D-09). [VERIFIED: npm registry — 8M dl/wk] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cloudflare Pages (D-04) | Cloudflare Workers Static Assets (same adapter) | Cloudflare steers new projects to Workers-static-assets in 2026, but Pages git-integration is the simplest push-to-deploy for this project. **Locked to Pages by D-04** — do not revisit. [CITED: STACK.md] |
| `@axe-core/playwright` smoke test | Lighthouse CI (`@lhci/cli`) | Full perf+a11y budget is heavier; **deferred to Phase 6** by D-09. [ASSUMED — per CONTEXT] |
| Self-hosted WOFF2 fonts | Google Fonts CDN | CDN is simpler but leaks IPs to Google (RODO) and adds latency/FOUT. UI-SPEC locks self-hosting. [CITED: 01-UI-SPEC.md] |

**Installation:**
```bash
# 1. Scaffold (interactive: choose SvelteKit minimal, TypeScript, ESLint, Playwright, Vitest)
npx sv create .          # or a temp dir then move — repo already has .git/.envrc

# 2. Tailwind v4 (the sv addon wires @tailwindcss/vite + app.css @import automatically)
npx sv add tailwindcss

# 3. Cloudflare adapter (replaces the default adapter-auto in svelte.config.js)
npm i -D @sveltejs/adapter-cloudflare

# 4. Icons + a11y test gate
npm i @lucide/svelte
npm i -D @axe-core/playwright eslint-plugin-svelte
# @playwright/test + svelte-check come from sv create
```

**Version verification:** All versions above were confirmed via `npm view <pkg> version` on 2026-08-12 (same day STACK.md was authored; publish timestamps 2026-05 to 2026-08). The `@lucide/svelte` correction was discovered via `npm view lucide-svelte deprecated`.

## Package Legitimacy Audit

Run via `gsd-tools query package-legitimacy check --ecosystem npm …` (2026-08-12) plus `npm view` cross-checks.

| Package | Registry | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------|-------------|---------|-------------|
| `@sveltejs/kit` | npm | 2.4M/wk | github.com/sveltejs/kit | SUS (too-new*) | Approved |
| `svelte` | npm | 5.3M/wk | github.com/sveltejs/svelte | SUS (too-new*) | Approved |
| `@sveltejs/adapter-cloudflare` | npm | 195k/wk | github.com/sveltejs/kit | OK | Approved |
| `tailwindcss` | npm | 120M/wk | github.com/tailwindlabs/tailwindcss | SUS (too-new*) | Approved |
| `@tailwindcss/vite` | npm | 43M/wk | github.com/tailwindlabs/tailwindcss | SUS (too-new*) | Approved |
| `@lucide/svelte` | npm | 709k/wk | github.com/lucide-icons/lucide | SUS (too-new*) | Approved (replaces deprecated `lucide-svelte`) |
| `svelte-check` | npm | 2.2M/wk | github.com/sveltejs/language-tools | SUS (too-new*) | Approved |
| `eslint-plugin-svelte` | npm | 1.4M/wk | github.com/sveltejs/eslint-plugin-svelte | SUS (too-new*) | Approved |
| `@playwright/test` | npm | 52M/wk | github.com/microsoft/playwright | SUS (too-new*) | Approved |
| `@axe-core/playwright` | npm | 8M/wk | github.com/dequelabs/axe-core-npm | SUS (too-new*) | Approved |

\* **The `SUS`/`too-new` verdict is a false positive**: the seam flags the *latest patch* publish date as recent (these are actively-maintained packages that publish frequently). Every package has an official first-party repo and 195k–120M weekly downloads — none is a new or low-trust package. No `postinstall` scripts present. **No `checkpoint:human-verify` gate needed.**

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as genuinely suspicious [SUS]:** none (all "too-new" verdicts explained above).
**Deprecation found:** `lucide-svelte` (npm deprecated → use `@lucide/svelte`). The UI-SPEC's `lucide-svelte` reference should be read as `@lucide/svelte`.

## Architecture Patterns

### System Architecture Diagram

```
        AUTHOR TIME                         BUILD TIME (Cloudflare Pages CI)              RUNTIME (edge)
  ┌──────────────────┐   git push    ┌─────────────────────────────────┐         ┌────────────────────────┐
  │ Developer commits │ ───────────► │ npm run build                    │         │ Cloudflare CDN edge    │
  │  src/routes/*     │   to main     │  • Svelte compile               │ deploy  │  • prerendered HTML     │
  │  app.css @theme   │              │  • Tailwind v4 @theme → CSS vars │ ──────► │  • CSS / JS islands     │
  │  static/ fonts,   │              │  • prerender=true → static HTML  │         │  • self-hosted WOFF2    │
  │  favicon, OG img  │              │  • adapter-cloudflare splits     │         │  • /robots.txt (noindex)│
  └──────────────────┘              │    assets vs (future) server fns │         └───────────┬────────────┘
                                     │  output: .svelte-kit/cloudflare  │                     │ GET /
                                     └─────────────────────────────────┘                     ▼
                                                                                     ┌────────────────────┐
                                                                                     │ Parent's browser   │
                                                                                     │  hydrates nav island│
                                                                                     │  (hamburger drawer) │
                                                                                     └────────────────────┘
```
Data flow is one-way and build-time only. Phase 1 has **no runtime data, no API, no secrets consumed**. The only hydrated JS is the mobile-nav island.

### Recommended Project Structure (SvelteKit translation of ARCHITECTURE.md)

```
/
├── src/
│   ├── app.html                 # <html lang="pl">, %sveltekit.head%, %sveltekit.body%
│   ├── app.css                  # Tailwind @import + the UI-SPEC @theme token seed (design foundation)
│   ├── app.d.ts                 # App.Platform.env typing stub (empty now; secrets land Phase 4)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte        # sticky nav, 5 links, active state (aria-current)
│   │   │   ├── MobileNav.svelte     # hamburger drawer island: focus trap, ESC, restore focus
│   │   │   ├── Footer.svelte        # BIP (ext) + Deklaracja dostępności + Kontakt
│   │   │   ├── SkipLink.svelte      # "Przejdź do treści" → #main
│   │   │   ├── Seo.svelte           # reusable head: title, description, canonical, OG/Twitter
│   │   │   ├── Hero.svelte          # hook h1 + verbatim lead + CTA + image slot
│   │   │   ├── Cta.svelte           # primary (amber) / secondary (blue outline) variants
│   │   │   ├── NewsPreview.svelte   # Aktualności grid + REQUIRED empty state
│   │   │   └── QuickContact.svelte  # adres / tel / e-mail / godziny
│   │   └── nav.ts                   # single source of the 5 nav links (label + href)
│   └── routes/
│       ├── +layout.svelte           # semantic shell: SkipLink, Header, <main id="main">, Footer
│       ├── +layout.ts               # export const prerender = true (inherited by all routes)
│       └── +page.svelte             # homepage (Hero + Cta + NewsPreview + QuickContact)
├── static/
│   ├── fonts/                       # self-hosted Baloo 2 + Nunito WOFF2 (latin + latin-ext)
│   ├── favicon set + og-placeholder image
│   └── robots.txt                   # Disallow: / while on *.pages.dev (D-11)
├── docs/dev-env.md                  # machine-contract onboarding doc (D-08)
├── .tool-versions                   # asdf pin (node LTS) (D-08)
├── .pre-commit-config.yaml          # lint/format/svelte-check (D-08)
├── .envrc                           # direnv (already present; no real secrets in Phase 1)
├── svelte.config.js                 # adapter-cloudflare
├── vite.config.ts                   # @tailwindcss/vite + sveltekit plugins
├── playwright.config.ts             # homepage smoke test config
└── package.json                     # scripts: dev/build/check/lint/test
```

### Pattern 1: Static-first prerender
**What:** Every content route is prerendered to static HTML at build time via `export const prerender = true`. Set it once in `src/routes/+layout.ts` so all Phase-1 routes inherit it.
**When to use:** Content-dominant sites — exactly this. No `+server.ts`, no `prerender = false` anywhere in Phase 1.
**Example:**
```ts
// src/routes/+layout.ts   — Source: Context7 /sveltejs/kit
export const prerender = true;
```

### Pattern 2: Tailwind v4 CSS-first design tokens
**What:** No `tailwind.config.js`. Tokens live in an `@theme{}` block in `app.css`; Tailwind generates CSS variables + utility classes (`bg-brand-blue`, `text-ink`, `rounded-pill`, etc.). Paste the UI-SPEC Appendix seed verbatim.
**When to use:** Establishing the design foundation (SITE-04). This is the single most-inherited artifact of the phase.
**Example:**
```css
/* app.css — Source: 01-UI-SPEC.md Appendix (verbatim) */
@import "tailwindcss";
@theme {
  --color-surface: #FFFFFF;
  --color-ink: #1E293B;          /* body text — 14.65:1 on white (AAA) */
  --color-brand-blue: #0369A1;   /* links / primary btn / wordmark — 5.93:1 (AA) */
  --color-accent: #F59E0B;       /* Rekrutacja CTA fill — ink label, 6.82:1 (AA) */
  --color-expr-yellow: #FACC15;  /* decorative ONLY — never on text */
  --font-display: "Baloo 2", system-ui, sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
  --radius-pill: 9999px;
  /* …full set in UI-SPEC Appendix… */
}
```

### Pattern 3: Semantic landmark shell (a11y as structure)
**What:** `+layout.svelte` renders exactly one `<header>`, `<nav aria-label="Główna nawigacja">`, one `<main id="main">`, one `<footer>`, and a skip link as the first focusable element. Homepage owns the single `<h1>`.
**When to use:** Every route. Building AA into the shared shell makes conformance the default, not a retrofit.
**Example:**
```svelte
<!-- src/routes/+layout.svelte -->
<SkipLink />                         <!-- „Przejdź do treści" → #main -->
<Header />                           <!-- sticky; <nav aria-label="Główna nawigacja"> -->
<main id="main"><slot /></main>
<Footer />
```

### Pattern 4: Self-hosted fonts with `font-display: swap`
**What:** `@font-face` in `app.css` pointing at `static/fonts/*.woff2`, subset to `latin,latin-ext` (covers full Polish diacritics — verified in UI-SPEC), `font-display: swap`, preload the two primary weights (400/700). No Google CDN.
**When to use:** Foundation. Prevents FOIT and RODO IP-leak.

### Pattern 5: Reusable SEO/head component (noindex on placeholder)
**What:** A `Seo.svelte` used via `<svelte:head>` for per-route Polish `<title>`, `meta description`, canonical, OG + Twitter tags with the placeholder share image. `robots.txt` = `Disallow: /` and any `<meta name="robots" content="noindex">` while on `*.pages.dev` (flip at Phase 6).
**When to use:** D-10/D-11. Build the mechanism now; JSON-LD/GSC deferred (D-12).

### Anti-Patterns to Avoid
- **Adding a `tailwind.config.js`** — v4 is CSS-first; a JS config is the wrong mental model and will confuse token resolution.
- **`import.meta.env` for anything secret** — use `platform.env` in server code (none in Phase 1). Only public build-time vars belong in `import.meta.env`.
- **Hand-authoring a `/functions` dir** — collides with SvelteKit routing under `adapter-cloudflare` (N/A this phase, but establish the mental model).
- **Re-deriving colors/type/spacing** — the UI-SPEC is locked and AA-verified; deviating re-introduces the contrast risk it already solved.
- **`outline: none`** anywhere — breaks WCAG 2.4.7; style the focus ring instead (`3px solid #0C4A6E`, offset 2px).
- **Rendering the whole site SSR** — defeats CDN caching; static-first only.
- **Bright yellow/orange on text** — the #1 AA failure; expressive tier is decorative surfaces only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible color pairings | Ad-hoc contrast tweaking | The UI-SPEC's pre-computed AA-verified token table | Every pair already has a measured ratio; re-deriving invites failures |
| Icons | Custom SVGs | `@lucide/svelte` | Consistent stroke, tree-shakeable, a11y-friendly |
| Contrast/a11y detection | Manual eyeballing | `@axe-core/playwright` + `svelte-check` + `eslint-plugin-svelte` | Automated WCAG net from first deploy (legal obligation) |
| Responsive breakpoints/utilities | Custom media-query CSS | Tailwind v4 defaults | Mobile-first, consistent, tiny pruned output |
| Focus trap / drawer | Bespoke keyboard handling from scratch | Svelte island using native elements + documented trap pattern | Focus trap + ESC + restore-focus are error-prone; base on real `<button>`/`<a>` semantics |
| Static build + deploy | Custom CI runner | Cloudflare Pages git-integration | Push-to-deploy, zero maintenance (SITE-01) |
| Font loading | Google Fonts `<link>` | Self-hosted `@font-face` + `font-display: swap` | RODO + perf; avoids FOUT/latency |

**Key insight:** In this phase the "hard part" is not code volume — it's *not re-opening solved problems*. The palette math, component contracts, and Polish copy are locked; the risk is drift from them, not implementation difficulty.

## Common Pitfalls

Scoped to the six that actually apply in Phase 1 (full project list in `PITFALLS.md`).

### Pitfall 1: Bright palette fails WCAG AA contrast (HIGHEST project risk)
**What goes wrong:** Yellow/orange text on white measures ~1.3–2:1 (needs 4.5:1). White text on amber CTA fails (2.15:1).
**Why it happens:** Brand colors applied directly to text/small UI; contrast never measured until audit.
**How to avoid:** Implement the two-tier tokens verbatim. Expressive tier (`expr-*`) = decorative surfaces only. Accessible tier for all text/icon/border/focus. CTA label is `ink` on amber (never white, except the darkest `active` state → white). Body links `brand-blue` + underline (never color-only).
**Warning signs:** any `text-expr-*` or `text-yellow`/`text-orange` utility on a light background; `outline: none`.

### Pitfall 9: Images bloat / wreck mobile CWV
**What goes wrong:** A raw multi-MB hero JPEG tanks LCP on a parent's phone.
**Why it happens:** No responsive image handling; hero shipped as raw JPEG.
**How to avoid:** Ship the placeholder hero as a modern format (WebP/AVIF), explicit width/height (no CLS), `fetchpriority="high"` on the hero, `loading="lazy"` below the fold. (Full CMS image pipeline is Phase 2/6, but the hero placeholder must not be a heavyweight raw photo now.) Target mobile LCP < 2.5s.
**Warning signs:** `<img>` without dimensions; hero > few-hundred KB.

### Pitfall 10: Motion/keyboard/focus/tap-target failures
**What goes wrong:** Joyful blob animations with no reduced-motion; drawer not keyboard-operable; invisible focus; tap targets < 44px.
**How to avoid:** Wrap all non-essential motion in `@media (prefers-reduced-motion: reduce)` (disable transforms/float/drawer-slide/`scroll-behavior:smooth`). Build nav/CTA from native `<button>`/`<a>`. Drawer = focus trap + ESC + restore focus + body scroll lock. Visible focus ring everywhere. All interactive targets ≥ 44×44px.
**Warning signs:** animation with no reduced-motion query; `<div onclick>`; small icon-only mobile links.

### Pitfall 11: Polish SEO/metadata missing (scaffold now)
**What goes wrong:** Default framework `<title>`, missing `lang="pl"`, broken OG share preview.
**How to avoid:** `<html lang="pl">`, per-route Polish title/description/canonical via `Seo.svelte`, OG + Twitter with placeholder image. **But** keep `robots.txt`/meta at noindex while on `*.pages.dev` (D-11). JSON-LD + GSC deferred (D-12).
**Warning signs:** template default `<title>`; blank Facebook share preview.

### Pitfall 12: Placeholder content ships to production
**What goes wrong:** Placeholder hook headline, subcopy, quick-contact values, or stock image leak to the real launch.
**How to avoid:** Mark every placeholder with a greppable `PLACEHOLDER` token (D-02/D-03 and CLAUDE.md). The verbatim core message is **final** (not a placeholder). A pre-launch grep gate is a Phase 6 concern, but the tokenization convention must be established now.
**Warning signs:** placeholder copy without a `PLACEHOLDER` marker.

### Pitfall 14: BIP link missing/wrong
**What goes wrong:** BIP link buried, mislabeled, or pointing at gmina root.
**How to avoid:** Footer link labeled exactly `Biuletyn Informacji Publicznej (BIP)` → `https://ugstromiec.naszbip.pl/zlobek`, `target="_blank" rel="noopener noreferrer"` + visually-hidden `(otwiera się w nowej karcie)`. Do not duplicate BIP content.
**Warning signs:** ambiguous label; wrong URL; no external-link affordance.

**Note:** `Deklaracja dostępności` footer link points to `/deklaracja-dostepnosci`, a route authored in Phase 6 — the link is present now and **may 404 until then** (flagged in UI-SPEC). Planner should decide whether to stub the route or accept the temporary 404.

## Code Examples

### Cloudflare adapter config
```js
// svelte.config.js — Source: Context7 /sveltejs/kit (adapter-cloudflare)
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: { adapter: adapter() }   // Pages: build output → .svelte-kit/cloudflare
};
```

### Platform env typing stub (establish pattern; empty in Phase 1)
```ts
// src/app.d.ts — Source: Context7 /sveltejs/kit (adapter-cloudflare)
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

### Tailwind v4 Vite plugin
```ts
// vite.config.ts — Source: Tailwind v4 docs / sv add tailwindcss
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
```

### Homepage smoke test with axe
```ts
// tests/home.spec.ts — Source: @axe-core/playwright README pattern
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `lucide-svelte` package | `@lucide/svelte` (Svelte-5 native) | lucide-svelte deprecated (npm notice) | Use `@lucide/svelte` — the UI-SPEC's name is stale |
| `npm create svelte@latest` | `npx sv create` (the `sv` CLI) | SvelteKit tooling consolidation | Scaffold + `sv add tailwindcss` addon is the current path |
| Tailwind `tailwind.config.js` (v3) | CSS-first `@theme{}` + `@tailwindcss/vite` (v4) | Tailwind v4 | No JS config file; tokens in CSS |
| Svelte stores/`export let` | Svelte 5 runes (`$state`, `$props`, `$derived`) | Svelte 5 | Runes are the default for any island state |
| Free MailChannels Workers email | Resend | MailChannels EOL ~Jun–Aug 2024 | N/A in Phase 1 (email is Phase 4) — noted so it isn't reached for later |

**Deprecated/outdated:**
- `lucide-svelte` — deprecated → `@lucide/svelte`.
- `@sveltejs/adapter-cloudflare-workers` (legacy, single-Worker) and `@sveltejs/adapter-static` (can't run future form endpoints) — use `@sveltejs/adapter-cloudflare`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The D-08/D-09/D-10/D-11/D-12 defaults (dev-env conventions, a11y gate depth, metadata mechanism, noindex, deferrals) are accepted as-decided | User Constraints | Planner builds scaffold/gates the user didn't want; rework. CONTEXT marks these "⚠ DEFAULTED while user away; confirm" |
| A2 | Placeholder hook headline / subcopy / quick-contact values are Claude's discretion and OK to ship (marked `PLACEHOLDER`) until Phase 6 | Standard Stack / Pitfall 12 | Wrong tone/content ships on the live `*.pages.dev`; low risk (placeholder, non-indexed) |
| A3 | Node LTS is the target runtime; local machine runs Node v25 (Current, not LTS) | Environment Availability | v25 is odd/Current — pin an even LTS (e.g. 22.x) in `.tool-versions` to match Cloudflare Pages build env; mismatch could cause build differences |
| A4 | The `/deklaracja-dostepnosci` footer link may 404 in Phase 1 (route authored Phase 6) is acceptable, or a stub route is added | Pitfall 14 | A public-body site with a dead accessibility-declaration link is a bad look even pre-launch; planner should decide (stub vs accept) |
| A5 | The verbatim core message text in PROJECT.md is exactly what the client wants in the hero (D-02 treats it as final) | Phase Requirements HOME-01 | If the client later revises wording, the "verbatim" claim breaks; D-02 already asserts it's final client copy |

**If this table looks long:** most entries stem from CONTEXT's own "⚠ DEFAULTED; confirm" flags — surface these to the user in discuss/plan, not silent assumptions.

## Open Questions

1. **Node runtime version pin**
   - What we know: local Node is v25.9.0 (Current). Cloudflare Pages lets you pin Node via `NODE_VERSION` / `.node-version` / `.tool-versions`.
   - What's unclear: which LTS to pin (22.x is current LTS).
   - Recommendation: pin an even LTS (22.x) in `.tool-versions` and set the matching Cloudflare Pages build var; don't build on Node 25.

2. **`/deklaracja-dostepnosci` footer link target (Phase 6 route)**
   - What we know: link is required now; page is Phase 6.
   - Recommendation: add a minimal stub route returning a Polish "wkrótce" placeholder (avoids a 404 on a legally-sensitive link) OR accept the 404 explicitly. Planner to decide (see A4).

3. **Scaffold-in-place vs temp-dir**
   - What we know: repo already has `.git` + `.envrc` (+ empty `main.html`). `npx sv create .` into a non-empty dir needs care.
   - Recommendation: remove the empty `main.html`; run `sv create` in place (it handles existing `.git`), preserving `.envrc`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | ✓ | v25.9.0 (Current — pin LTS) | Install LTS 22.x via asdf |
| npm | Package mgmt | ✓ | 11.12.1 | — |
| git | VCS / deploy trigger | ✓ | 2.54.0 | — |
| asdf | Version pinning (D-08) | ✓ | 0.19.0 | — |
| direnv | Env vars (D-08) | ✓ | 2.37.1 (`.envrc` present) | — |
| `sv` CLI | Scaffold | ✓ (via `npx`, fetched on demand) | latest | — |
| wrangler | Local CF emulation | ✓ (via `npx`; not global) | latest via npx | Not strictly needed Phase 1 (no `platform.env` usage) |
| **pre-commit** | Quality gate (D-08) | ✗ | — | `brew install pre-commit` or `pipx install pre-commit` |
| Cloudflare account | Deploy (D-04/D-06) | (external) | — | Dedicated project account per D-06 |
| GitHub Org repo | Deploy source (D-06/D-07) | (external) | — | Create `zlobekstromiec/<repo>` |

**Missing dependencies with no fallback:** none blocking (all resolvable).
**Missing dependencies with fallback:**
- `pre-commit` not installed — planner must add an install step before wiring `.pre-commit-config.yaml` (D-08).
- Cloudflare account + GitHub Org repo are external/manual account-setup items (D-06/D-07) — these are human steps, not code; planner should surface them as checkpoints.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.62.1 (+ `@axe-core/playwright` 4.13.0) for E2E/a11y; svelte-check 4.7.5 for types+a11y; Vitest (from `sv create`) for unit if needed |
| Config file | `playwright.config.ts` — none yet (Wave 0) |
| Quick run command | `npm run check` (svelte-check: types + compiler a11y) |
| Full suite command | `npm run check && npm run lint && npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-01 | Site builds + deploys | smoke (build) | `npm run build` | ❌ Wave 0 |
| SITE-01 | Live URL responds | manual/UAT | open `*.pages.dev` after deploy | ❌ manual |
| SITE-02 | Responsive at phone/tablet/desktop | e2e | `npx playwright test tests/responsive.spec.ts` (viewport matrix) | ❌ Wave 0 |
| SITE-03 | Header 5 links + footer BIP/Deklaracja/Kontakt present | e2e | `npx playwright test tests/nav.spec.ts` | ❌ Wave 0 |
| SITE-04 | AA contrast / palette | a11y | `npx playwright test tests/home.spec.ts` (axe wcag21aa) | ❌ Wave 0 |
| SITE-06 | No English on public page | manual/lint | manual review + optional string check | ❌ manual |
| HOME-01 | Hero shows verbatim core message | e2e | `npx playwright test tests/home.spec.ts` (assert text) | ❌ Wave 0 |
| HOME-02 | CTA + Aktualności empty state + quick contact present | e2e | `npx playwright test tests/home.spec.ts` | ❌ Wave 0 |
| A11Y (baseline) | Keyboard nav + focus + no axe violations | a11y | `npx playwright test tests/home.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run check` (fast; types + compiler a11y warnings).
- **Per wave merge:** `npm run check && npm run lint && npm run test` (full, incl. axe smoke).
- **Phase gate:** full suite green + a successful Cloudflare deploy before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `playwright.config.ts` — E2E config (baseURL to preview build)
- [ ] `tests/home.spec.ts` — covers SITE-04, HOME-01, HOME-02, a11y (axe wcag21aa)
- [ ] `tests/nav.spec.ts` — covers SITE-03 (5 header links + footer links + BIP URL/attrs)
- [ ] `tests/responsive.spec.ts` — covers SITE-02 (viewport matrix; drawer < md)
- [ ] Framework install: `npm i -D @axe-core/playwright` (Playwright itself comes from `sv create`)
- [ ] `.pre-commit-config.yaml` running `svelte-check` + eslint (D-08)

## Security Domain

`security_enforcement: true`, ASVS Level 1. Phase 1 is a **static, read-only homepage** — no auth, no sessions, no user input, no database, and **no secrets consumed** (secrets arrive Phase 4). Most ASVS categories are therefore N/A this phase; the applicable controls are foundational (headers, safe external links, secret hygiene).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in Phase 1 (CMS OAuth is Phase 2) |
| V3 Session Management | no | No sessions (stateless static site) |
| V4 Access Control | no | Public content only |
| V5 Input Validation | no | No forms/user input in Phase 1 (forms are Phase 4) |
| V6 Cryptography | no | No secrets/crypto consumed this phase |
| V7 Error/Logging | minimal | No form bodies to log; ensure no accidental logging infra |
| V12 Files/Resources | minimal | External BIP link uses `rel="noopener noreferrer"` |
| V14 Config | yes | Security headers + secret hygiene (below) |

### Known Threat Patterns for static SvelteKit/Cloudflare (Phase 1)

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Missing security headers on a public-body site | Info Disclosure / Tampering | Set CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy` via Cloudflare `static/_headers` or a SvelteKit `handle` hook. Establish the baseline now |
| `target="_blank"` reverse-tabnabbing (BIP link) | Tampering | `rel="noopener noreferrer"` on all external links (already in UI-SPEC) |
| Secret committed to repo | Info Disclosure | `.envrc`/`.dev.vars` gitignored (CLAUDE.md); **no real secrets exist in Phase 1** — verify none are introduced |
| Search-engine indexing of placeholder content | Info Disclosure (reputational) | `robots.txt` Disallow + noindex meta while on `*.pages.dev` (D-11) |
| Supply-chain (deprecated/typosquat package) | Tampering | Legitimacy audit above — clean; `@lucide/svelte` (not deprecated `lucide-svelte`) |

**Recommendation:** add a `static/_headers` file (or `handle` hook) with a conservative CSP allowing self + inline styles as needed + the self-hosted fonts, HSTS, and `nosniff`. This is a low-cost foundation that Phases 2–4 (CMS `/admin`, Turnstile script, Resend) will extend.

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view <pkg> version` / `time.modified` / `deprecated`, 2026-08-12) — verified every Phase-1 package version + the `lucide-svelte`→`@lucide/svelte` deprecation
- Context7 `/sveltejs/kit` — `sv create`, `adapter-cloudflare` config, `export const prerender = true`, `App.Platform.env` typing
- `gsd-tools query package-legitimacy check` (2026-08-12) — download counts, repos, no postinstall scripts
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` (LOCKED, approved 6/6) — design tokens, component contracts, Polish copy, `@theme` seed
- `.planning/research/STACK.md` — framework/version decisions (same-day authored)

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` — static-first + narrow-seam patterns (Astro-flavored; translated to SvelteKit here)
- `.planning/research/PITFALLS.md` — WCAG/RODO/Cloudflare pitfalls (legal facts cross-checked to primary sources)
- Local environment probe (node/npm/git/asdf/direnv/pre-commit)

### Tertiary (LOW confidence)
- CONTEXT.md D-08..D-12 defaults marked "⚠ confirm" — treated as assumptions (see Assumptions Log)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version re-verified against live npm same-day; one deprecation corrected
- Architecture: HIGH — SvelteKit patterns confirmed via Context7; translated from a well-sourced architecture doc
- Pitfalls: HIGH — narrowed from a cross-checked project pitfall corpus; the palette risk is fully pre-solved in the UI-SPEC
- Design system: HIGH — locked, AA-verified, checker-approved UI-SPEC

**Research date:** 2026-08-12
**Valid until:** 2026-09-11 (30 days — stable stack; re-check `@lucide/svelte`, SvelteKit, Tailwind v4 patch versions before a much-later plan)
