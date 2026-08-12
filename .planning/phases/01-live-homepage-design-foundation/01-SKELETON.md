# Walking Skeleton — Żłobek Gminny Stromiec (public website)

**Phase:** 1
**Generated:** 2026-08-12

## Capability Proven End-to-End

> One sentence: the smallest user-visible capability that exercises the full stack.

A parent can open the deployed public `*.pages.dev` homepage, read the żłobek's **verbatim** core message in the hero, navigate to every one of the five sections (desktop nav + keyboard-operable mobile drawer), and a `git push` to `main` automatically rebuilds and redeploys the site on Cloudflare Pages.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) | Org standard on Cloudflare; content routes prerender to static HTML for best LCP/TTFB and zero runtime cost. Locked in STACK.md. |
| Rendering | Static-first — `export const prerender = true` in `src/routes/+layout.ts` (all routes inherit) | Content never changes per-request in Phase 1; no `+server.ts`, no SSR. |
| Deploy adapter | `@sveltejs/adapter-cloudflare` (build output `.svelte-kit/cloudflare`) | Correct adapter for Cloudflare Pages; splits prerendered assets from future server routes; exposes `platform.env`. NOT `adapter-static` (can't run Phase 4 form endpoints), NOT `adapter-cloudflare-workers` (legacy). |
| Data layer | **None (no database, by design)** | Locked project constraint (cost + RODO data-minimization). Content is placeholder-first, in-repo. Staff-editable content arrives via git-based Sveltia CMS in Phase 2; form email (no storage) in Phase 4. The walking-skeleton "real read/write" is substituted by build-time content prerender + one hydrated UI island. |
| Auth | **None** (public read-only site) | CMS OAuth (self-hosted `sveltia-cms-auth` Worker + GitHub OAuth App) is Phase 2. |
| Design system | Tailwind v4 CSS-first `@theme{}` tokens in `app.css` — **no `tailwind.config.js`** | Two-tier palette: expressive (decorative surfaces only) vs accessible (all text/icon/border/focus/button-label), AA-verified in `01-UI-SPEC.md`. Highest project risk (palette-vs-AA) is pre-solved — copy the token seed verbatim, do not re-derive. |
| Fonts | Self-hosted WOFF2 (Baloo 2 display + Nunito body), `latin`+`latin-ext`, `font-display: swap` | RODO (no Google CDN IP-leak) + perf. |
| Interactive island | Mobile nav drawer (hamburger → focus-trapped `role="dialog"`) — the only hydrated component | Proves client hydration works end-to-end; everything else is static HTML/CSS. |
| Deployment target | Cloudflare Pages git-integration; `*.pages.dev` in Phase 1 | Push to `main` → auto build + deploy, no self-managed CI (D-04). Custom domain deferred to Phase 6 (D-05). |
| Accounts | Dedicated Gmail (owner) → GitHub Organization `zlobekstromiec` (owns repo, future CMS OAuth App, staff editors) → Cloudflare account, all rooted to the Gmail | Clean handoff to a future maintainer / the Gmina (D-06/D-07). |
| Runtime/secrets | `App.Platform.env` typing stub, empty in Phase 1 | No secrets consumed this phase; Resend/Turnstile secrets arrive Phase 4 via `platform.env`. |
| Directory layout | `src/routes/**/+page.svelte` (routes), `src/lib/components/*.svelte` (bespoke components), `src/lib/nav.ts` (single nav source), `static/` (fonts, favicon, robots, `_headers`), `tests/` (Playwright + axe) | Translates the Astro-flavored ARCHITECTURE.md tree to SvelteKit conventions. |

## Stack Touched in Phase 1

- [x] Project scaffold (SvelteKit 2 + Svelte 5, TypeScript, ESLint, Playwright, Tailwind v4, adapter-cloudflare) — Plan 01
- [x] Routing — `/` homepage + `/deklaracja-dostepnosci` stub, prerendered — Plans 01/03/04
- [ ] Database — **N/A by design** (no DB this project). Substituted by: build-time static prerender pipeline + one real UI interaction (below) — see Architectural Decisions
- [x] UI — one interactive element wired and hydrated: the mobile nav drawer island (focus trap + ESC + restore focus + body scroll lock) — Plan 02
- [x] Deployment — running on Cloudflare Pages `*.pages.dev`, auto-redeploy on push to `main` — Plan 05

## Out of Scope (Deferred to Later Slices)

> Explicit so future phases never re-litigate Phase 1's minimalism.

- Sveltia git-based CMS + self-hosted OAuth Worker + Polish admin UI → **Phase 2**
- O nas / Dokumenty / Aktualności / Rekrutacja / Kontakt real content pages → **Phases 2–4**
- Email form pipeline (Resend + Turnstile + RODO consent, no storage) → **Phase 4**
- Gallery + fees pages → **Phase 5**
- WCAG 2.1 AA formal audit, accessibility widget, Deklaracja dostępności content, Polityka prywatności, performance/CWV tuning, real photography (wizerunek consent), real hero hook/subcopy/contact values, custom domain, flip to indexable → **Phase 6**
- JSON-LD structured data + Google Search Console / Business Profile (D-12) → **Phase 6** (needs real NAP + real domain)
- Lighthouse CI perf/a11y budget → **Phase 6**
- Purchase of `zlobekstromiec.pl` domain → prerequisite before **Phase 4** (Resend DNS) and **Phase 6** (custom domain); NOT yet purchased

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2:** Staff self-edit O nas + manage Dokumenty via git-based Sveltia CMS (OAuth Worker), Polish admin UI
- **Phase 3:** Staff publish Aktualności (list + single post); newest feeds the homepage preview (replaces the Phase 1 empty state)
- **Phase 4:** Rekrutacja + Kontakt with RODO-compliant, Turnstile-gated, email-only form pipeline (Resend)
- **Phase 5:** CMS-managed photo gallery + editable fees page
- **Phase 6:** WCAG 2.1 AA audit + accessibility widget, Deklaracja dostępności, Polityka prywatności, performance, custom domain, real-content launch gate
