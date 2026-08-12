# Phase 1: Live Homepage & Design Foundation - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the project's first deployable slice: a live, joyful, mobile-first homepage on **Cloudflare Pages (`*.pages.dev`)** with — the verbatim core-message hero, the persistent header nav (5 sections) + footer (BIP, Deklaracja dostępności, Kontakt), the Rekrutacja CTA, a latest-Aktualności preview (with empty state), and quick-contact — all built on the **accessible two-tier palette token system** and the project scaffold. A git push to `main` triggers an automatic Cloudflare rebuild/redeploy.

**Requirements in scope:** SITE-01, SITE-02, SITE-03, SITE-04, SITE-06, HOME-01, HOME-02.

**Locked upstream — do NOT re-decide:** the full visual/interaction design system (`01-UI-SPEC.md`, approved 6/6) and the tech stack (`STACK.md`). This discussion covered only the items those artifacts deliberately left open, plus foundation/ops choices a design contract doesn't cover.

</domain>

<decisions>
## Implementation Decisions

### Hero core-message presentation (HOME-01)
- **D-01:** Layout = **hook headline + verbatim lead**. A short, punchy Baloo-2 `h1` hook line sits above the żłobek's full 4-sentence core message, which appears **verbatim** directly beneath as a styled lead paragraph/quote (Nunito, `muted`). Satisfies HOME-01 ("core message verbatim in the hero") while keeping the hero scannable and LCP-light on mobile. This resolves the placeholder `h1` the UI-SPEC left open.
- **D-02:** The verbatim message is the PROJECT.md text ("Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać…") — treated as **final client copy**, not a placeholder. The **short hook headline** is a marked Polish PLACEHOLDER (content-first strategy), confirmed at launch (LAUNCH-01).
- **D-03:** Hero image slot = **stock/AI warm photo**, constrained to **non-identifiable imagery (no real child faces)** — environment, hands, toys, or clearly-synthetic — to stay consent-safe even as a placeholder (PITFALLS #13). Marked PLACEHOLDER; swapped for consented real photography in Phase 6 (LAUNCH-01). Reusable as the Open Graph share image (see Metadata).

### Deployment, accounts & live URL (SITE-01)
- **D-04:** Deploy target = **Cloudflare Pages (Git integration)**. Connect the repo; push to `main` → auto build (`npm run build`) + deploy (output `.svelte-kit/cloudflare`). Satisfies Success Criterion #6 with no self-managed CI. (Implied by the `*.pages.dev` choice; Workers-static-assets rejected for Phase 1.)
- **D-05:** Live URL for Phase 1 = **`*.pages.dev`** (free Cloudflare Pages subdomain). Satisfies "public Cloudflare URL" (Criterion #1). Custom domain deferred to launch (Phase 6).
- **D-06:** **Dedicated project accounts** for clean future handoff (deliberate ownership decision): a **new Gmail** (owner/root identity), a **new GitHub Organization** (owns the repo; will own the Phase 2 CMS OAuth App and hold staff editors as members), and a **new Cloudflare account** (Pages deploy now; DNS/Turnstile/Resend later). Everything roots to the new Gmail so the whole operational surface can be handed over intact.
- **D-07:** GitHub identity = **Organization** (not a personal account) — enables owner transfer + member management for the handoff.

### Foundation scaffold & quality gates (SITE-01, SITE-02) — ⚠ DEFAULTED while user away; confirm
- **D-08 (default):** Dev-env conventions in the scaffold = **asdf `.tool-versions`**, **pre-commit** (`.pre-commit-config.yaml` running lint/format/svelte-check), and **`docs/dev-env.md`** (machine-contract onboarding doc — valuable for the inheriting maintainer). **direnv `.envrc`** pattern seeded too, carrying no real secrets in Phase 1 (secrets arrive Phase 4). [Matches the user's established global conventions.]
- **D-09 (default):** CI/testing depth = **Core a11y gate now** — `svelte-check` + `eslint-plugin-svelte` (a11y rules) + a single **Playwright + `@axe-core/playwright`** smoke test on the homepage. Establishes an automated WCAG net from the first deploy (legal obligation; palette risk resolved this phase). **Lighthouse CI** deferred to Phase 6.

### Metadata & share-preview foundation (SITE-06, feeds Phase 6 SEO) — ⚠ DEFAULTED while user away; confirm
- **D-10 (default):** Build the reusable **metadata mechanism now**: `<html lang="pl">`, a reusable head/SEO component for per-page Polish `<title>` + `meta description` + canonical, a **favicon** set, and **Open Graph + Twitter card** tags with a **branded placeholder share image** (reuse hero image or a logo+palette card) so a shared `*.pages.dev` link looks professional.
- **D-11 (default):** **`robots.txt` + `sitemap.xml` scaffolded but set to noindex/disallow** while on the `*.pages.dev` placeholder, flipping to indexable at launch (Phase 6) — prevents Google indexing placeholder content, consistent with staying off the real domain.
- **D-12 (default):** **Deferred to Phase 6:** JSON-LD structured data (`GovernmentOrganization`/`ChildCare`/`LocalBusiness`) + Google Search Console / Business Profile — need confirmed real NAP data (address/phone/geo) + the real domain, unavailable in Phase 1.

### Claude's Discretion
- Exact scaffold file layout, component/route structure, and SvelteKit conventions (translate ARCHITECTURE.md's Astro-flavored tree to SvelteKit: `src/routes/**/+page.svelte`, `export const prerender = true`, `+server.ts`, `platform.env`).
- Precise placeholder copy for the hook headline, subcopy, and quick-contact values (all marked PLACEHOLDER).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (LOCKED — inherited by all phases)
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — the complete, approved visual/interaction design system: two-tier color tokens (expressive vs accessible, AA-verified pairings), typography (Baloo 2 + Nunito, self-hosted WOFF2, latin+latin-ext), spacing/radius/elevation, header/hero/CTA/Aktualności-preview/quick-contact/footer component contracts, interaction states, motion + reduced-motion, WCAG AA contract, authoritative Polish copy, and the Tailwind v4 `@theme` token seed. Do NOT re-derive or re-decide any of this.

### Stack & architecture (LOCKED)
- `.planning/research/STACK.md` — SvelteKit 2 + Svelte 5 (runes) + `@sveltejs/adapter-cloudflare` + Tailwind v4 (`@tailwindcss/vite`, `@theme`); scaffold command, supporting libs, verified versions; Cloudflare Pages Git-integration deploy pattern.
- `.planning/research/SUMMARY.md` §"Phase 1: Foundation" — foundation deliverables + phase-ordering rationale.
- `.planning/research/ARCHITECTURE.md` — framework-agnostic structure (static prerender + narrow form seams); treat its Astro file tree as illustrative, translate to SvelteKit.
- `.planning/research/PITFALLS.md` — esp. #1 (palette/contrast), #9 (image bloat / mobile CWV), #10 (motion/keyboard/focus/tap-targets), #11 (Polish SEO/metadata), #12 (placeholder ships) — all touch Phase 1.

### Project intent
- `.planning/PROJECT.md` — verbatim core message, palette intent, Białobrzegi anti-reference, core value.
- `.planning/ROADMAP.md` §"Phase 1" — goal, success criteria, requirement list.
- `.planning/REQUIREMENTS.md` — SITE-01..06, HOME-01, HOME-02 acceptance wording.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None — greenfield repo.** No `package.json`/scaffold yet. The untracked `main.html` is empty and `.ckb/` is an unrelated tool cache — ignore both (consider removing `main.html`).

### Established Patterns
- None in-repo yet. Patterns to **establish** this phase (inherited downstream): Tailwind v4 `@theme` tokens in `app.css` (seed in UI-SPEC appendix); semantic landmark layout (skip link, exactly one `h1`, `<nav aria-label="Główna nawigacja">`, `<main id="main">`); self-hosted `@font-face` (Baloo 2 + Nunito, `font-display: swap`, latin+latin-ext subset); `export const prerender = true` on content routes.

### Integration Points
- Cloudflare Pages ↔ the new project GitHub Org repo (git-push auto-deploy). This foundation feeds Phase 2 (Sveltia CMS + OAuth Worker under the same GitHub Org) and Phase 4 (form `+server.ts` + `platform.env` + custom domain + Resend DNS).

</code_context>

<specifics>
## Specific Ideas

- **Hero mock (user-approved):** short hook `h1` (placeholder, e.g. "Miejsce pełne radości i troski") → verbatim 4-sentence message as a lead quote → `Zapisz dziecko →` CTA → warm image slot.
- **Handoff-first ethos:** prefer choices that keep the whole project transferable to a future maintainer / the Gmina (dedicated accounts, GitHub Org, `docs/dev-env.md`).

</specifics>

<deferred>
## Deferred Ideas

- **Buy the domain `zlobekstromiec.pl`** — it is **NOT yet purchased** (this corrects the PROJECT.md / ROADMAP.md / STATE.md claim that it's already owned with "no lead time"). Prerequisite before **Phase 4** (Resend SPF/DKIM/DMARC on `send.zlobekstromiec.pl`) and **Phase 6** (custom domain + launch). When bought, register it directly in the project Cloudflare account. Adds real (if small) lead time the roadmap currently denies — **roadmap/state doc update recommended** (e.g. `/gsd-phase` edit or a transition).
- **Lighthouse CI** perf/a11y budget → Phase 6.
- **JSON-LD structured data + Google Search Console / Business Profile** → Phase 6 (needs real NAP + domain).
- **Real photography (with wizerunek consent)** + real hook-headline/subcopy/quick-contact values → Phase 6 (LAUNCH-01).

</deferred>

---

*Phase: 1-live-homepage-design-foundation*
*Context gathered: 2026-08-12*
