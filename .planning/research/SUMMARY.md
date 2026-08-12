# Project Research Summary

**Project:** Żłobek Gminny Stromiec — Public Website
**Domain:** Polish public-sector (municipal nursery) informational website — static/JAMstack + git-CMS + email-only forms, on Cloudflare, under WCAG 2.1 AA + RODO legal obligations
**Researched:** 2026-08-12
**Confidence:** HIGH

## Executive Summary

This is a low-traffic, content-dominant public-sector website with exactly two dynamic seams — a contact form and an enrollment form — everything else is static content editable by non-technical staff. The right architecture is **static-first with surgical on-demand rendering**: prebuilt HTML on Cloudflare's CDN, a git-based CMS (Sveltia) for staff self-editing, and two narrow serverless form endpoints that verify Turnstile and relay to email via Resend. There is deliberately no database and no application server anywhere — Git is the content store, email is the submission store (and specifically *not* a store, by design — RODO data-minimization by architecture).

**Framework decision:** STACK.md is authoritative — **SvelteKit 2 + `@sveltejs/adapter-cloudflare`**, chosen over Astro because the org already operates SvelteKit on Cloudflare and this keeps ops/tooling consistent. This does not conflict with ARCHITECTURE.md's patterns, which were written with Astro's syntax but describe framework-agnostic structure: static prerendered content routes + narrow on-demand form endpoints, content-collection-shaped folders for CMS-managed markdown, Sveltia + a self-hosted `sveltia-cms-auth` OAuth Worker (Cloudflare has no Netlify Git Gateway), and a Turnstile + Resend form pipeline. All of these map directly onto SvelteKit: `export const prerender = true` on content `+page` routes, `+server.js`/form actions for the two dynamic endpoints, and `platform.env` for secrets. Treat ARCHITECTURE.md's diagrams/file-tree as illustrative of the *pattern*, translated to SvelteKit conventions (e.g., `src/routes/api/kontakt/+server.ts` instead of `src/pages/api/kontakt.ts`) during planning.

The two dominant risks are legal, not technical. First, the client's requested joyful blue/yellow/orange/red palette is exactly the color family that most commonly fails WCAG 2.1 AA contrast (4.5:1) — yellow/orange text on white routinely measures 1.3–2:1. This must be resolved with a two-tier design-token system (expressive/decorative colors vs. a constrained accessible text/UI subset) *before* components are built, not retrofitted. Second, the entire forms pipeline (Turnstile server-verify + Resend + RODO consent/klauzula informacyjna + zero storage/logging) is a single coupled unit that must ship together or not at all — and it has an external dependency the team does not control: DNS access to `ugstromiec.pl` for Resend's SPF/DKIM verification. This, plus the exact recipient email spelling (`zlobek@` vs `zlobel@ugstromiec.pl`) and the koordynator dostępności/IOD contact details, must be confirmed with the client early, as they gate the forms and compliance phases.

## Key Findings

### Recommended Stack

**Framework: SvelteKit 2 + `@sveltejs/adapter-cloudflare`** (not `adapter-static`, not legacy `adapter-cloudflare-workers`). Content routes prerender to static HTML on Cloudflare's CDN; the two form endpoints run as Cloudflare Pages Functions in the same deploy — no separate Worker needed for the site itself (a *separate* Worker is still needed for CMS OAuth, see below). Deploy target: Cloudflare Pages (Git-push auto-deploy) or Workers Static Assets — either works identically with this adapter.

**Core technologies:**
- **SvelteKit 2 / Svelte 5** — app framework, prerendered content + on-demand form routes, compiler-level a11y warnings for free
- **Sveltia CMS** — git-based CMS, Decap-compatible config, actively maintained, best UX for non-technical staff, single JS file via CDN, no build step
- **`sveltia/sveltia-cms-auth` Cloudflare Worker + GitHub OAuth App** — Cloudflare has no Netlify Git Gateway, so this self-hosted OAuth proxy is mandatory infrastructure, not optional
- **Resend** — transactional email for form submissions (free 100/day, 3,000/mo); replaces the dead free MailChannels integration (ended 31 Aug 2024). Requires a verified sending domain (SPF/DKIM on `ugstromiec.pl` or a subdomain) — **MEDIUM confidence pending DNS-control confirmation**. Fallback: MailChannels Email API (paid-account free tier, 100/day) if DNS is inaccessible.
- **Cloudflare Turnstile** — free, privacy-friendly spam gate; sitekey public, secret verified server-side via `siteverify`
- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first `@theme` tokens) — styling system, ideal for defining the accessible-vs-decorative color token split
- **A11y tooling:** `svelte-check`, `eslint-plugin-svelte`, `@axe-core/playwright`, Lighthouse CI (`@lhci/cli`) — compile-time + lint + runtime + CI-gate layers

### Expected Features

**Must have (table stakes — P1, legally or functionally blocking):**
- Aktualności (news, CMS-editable), O nas, Rekrutacja (PDF forms + email-only online form), Dokumenty (CMS-uploadable), Kontakt (details + map + email form)
- Joyful, mobile-first homepage hero with the client's verbatim core message
- **Deklaracja dostępności** (generated from the official gov.pl template, not hand-written) — legal, fines up to 5,000–10,000 zł
- **BIP link** (prominent, correctly labeled, pointing to `ugstromiec.naszbip.pl/zlobek`) — legal
- RODO klauzula informacyjna + consent checkboxes on both forms + a Polityka prywatności page — legal
- WCAG 2.1 AA baseline (built-in, not bolted on) + an accessibility widget (font-size/contrast toggle) — legal + expected norm on Polish public sites
- Cloudflare Turnstile on both forms — blocking for forms to be safe to ship
- Godziny otwarcia, mapa dojazdu, Polish-language throughout, cookie consent notice

**Should have (differentiators — P2, add after launch validation):**
- Galeria (per-sala photo gallery — gate on real consent-cleared photos; stock/placeholder at launch)
- Jadłospis (weekly menu, CMS-editable table preferred over PDF for a11y)
- Opłaty/cennik, Aktualności categories/tags, Kalendarz/wydarzenia (start as a simple upcoming-dates list), ePUAP address on Kontakt

**Defer (v2+ / anti-features — explicitly not building):**
- Parent accounts/login/portal, online fee payments, storing applicant data in a DB, live chat, multi-language, rebuilding BIP, heavy third-party embeds (Google Maps w/ tracking), comments, paid CMS, newsletter with stored subscribers (RSS is the zero-storage alternative)

### Architecture Approach

Static-first content site with two narrow runtime seams — a client-side CMS admin app that commits to Git, and on-demand form endpoints that verify Turnstile and relay to email — with no database and no application server anywhere. In SvelteKit terms: content pages are `+page.svelte` routes marked `export const prerender = true`; the CMS lives at `/admin` as a static Sveltia bundle talking directly to the GitHub API; and `src/routes/api/kontakt/+server.ts` + `.../rekrutacja/+server.ts` are the only dynamic code paths, reading secrets from `platform.env` (never `import.meta.env`).

**Major components:**
1. **Static site (build)** — SvelteKit + Vite turns markdown/frontmatter content collections into prerendered, CDN-cacheable HTML; owns layout, design system, and the accessibility baseline
2. **CMS admin SPA (Sveltia)** — browser app at `/admin`, no server of its own, commits markdown + media directly to GitHub via OAuth token
3. **OAuth proxy Worker (`sveltia-cms-auth`)** — separate, small Cloudflare Worker completing the GitHub OAuth code→token exchange server-side; holds `GITHUB_CLIENT_ID`/`SECRET`; not part of the main SvelteKit deploy
4. **Form endpoints (`+server.ts`)** — receive POST, validate RODO consent, verify Turnstile server-side, send via Resend, discard — the single reviewable place secrets and external calls live
5. **External services** — GitHub API (CMS commits), Cloudflare Turnstile (siteverify), Resend (email), Cloudflare build hook (push to `main` triggers rebuild)

Content flow is one-way at build time (Git → static HTML; no runtime queries). Form flow is fire-and-relay (POST → Turnstile verify → Resend → mailbox; zero persistence, by architecture not policy).

### Critical Pitfalls

1. **Bright palette fails WCAG AA contrast** — yellow/orange text on white routinely measures far below the 4.5:1 minimum. Avoid by defining a two-tier token system (expressive/decorative vs. accessible text/UI colors) in the design-system phase, before any component is built. This is the single most likely AA failure and the most expensive to retrofit if hard-coded.
2. **Missing/non-conformant Deklaracja dostępności** — fines up to 5,000–10,000 zł. Avoid by generating from the official gov.pl template/tool, not hand-writing it, and writing the conformance claim only after the AA baseline is real (not before).
3. **RODO violations on forms (children's data)** — no consent, no klauzula, sensitive fields (PESEL/health) collected online, or data logged/retained by accident (Resend dashboard, error trackers, `console.log`). Avoid by minimizing collected fields on the web form (push PESEL/health to the in-person PDF), unticked consent, visible klauzula informacyjna, no-log server code, and confirming the exact recipient email spelling with the client.
4. **Dead MailChannels assumption** — the free Cloudflare Workers MailChannels integration ended 30 Jun/Aug 2024; tutorials still reference it. Use Resend from day one, with a verified sending domain.
5. **Email deliverability (SPF/DKIM/DMARC)** — even with Resend, mail lands in spam or is dropped without proper DNS records on the sending domain, and `from` must never be the submitter's address. This is a **client dependency with lead time**: confirm who controls `ugstromiec.pl` DNS early, since the gmina's IT may need to add records.
6. **Cloudflare has no Netlify Git Gateway** — copying a Netlify-style Decap/Sveltia tutorial (`backend: git-gateway`) silently fails. Use `backend: github` + the `sveltia-cms-auth` Worker + a GitHub OAuth App from the start.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation — repo, framework, deploy pipeline
**Rationale:** Everything depends on being able to see a live deploy; also the earliest point to start the DNS/email lead-time item.
**Delivers:** SvelteKit scaffold, `@sveltejs/adapter-cloudflare` wired, Cloudflare Pages Git-push auto-deploy confirmed working end to end (even with placeholder content).
**Uses:** SvelteKit 2, Svelte 5, `@sveltejs/adapter-cloudflare`, Wrangler for local `platform.env` emulation.
**Kick off in parallel:** confirm DNS control of `ugstromiec.pl` (or agree on a controlled subdomain) for Resend — this has multi-day lead time and gates Phase 4.

### Phase 2: Content model + design system + static pages
**Rationale:** The CMS config (Phase 3) must map onto content schemas that exist first; the accessible color tokens must exist before any component is built, to avoid the single most expensive rework risk (Pitfall 1).
**Delivers:** Content collection schemas (Aktualności, Dokumenty, `strony` singletons for O nas/Rekrutacja/Kontakt), Tailwind v4 `@theme` token system with the expressive/decorative vs. accessible-text color split validated for AA contrast, semantic layout shells (landmarks, skip link, focus states), the five committed sections built against placeholder content, homepage hero with the client's verbatim core message.
**Addresses:** Homepage hero, Aktualności, O nas, Rekrutacja, Dokumenty, Kontakt (FEATURES.md P1 content sections).
**Avoids:** Pitfall 1 (palette/contrast), Pitfall 10 (motion/keyboard/focus/tap-targets baked into shared components from the start).

### Phase 3: CMS integration
**Rationale:** Depends on Phase 2's schemas existing; the OAuth Worker can be built in parallel with Phase 2.
**Delivers:** `sveltia-cms-auth` Cloudflare Worker deployed with GitHub OAuth App secrets, `static/admin/config.yml` mapped 1:1 to Phase 2's collections, full login→edit→commit→rebuild loop verified on the live deployment (not just locally), strict CMS field schemas (validated widgets, no free-text where structure matters) so non-technical staff can't break the build.
**Implements:** ARCHITECTURE.md's "Git-as-CMS with an OAuth proxy Worker" pattern.
**Avoids:** Pitfall 7 (no Git Gateway on Cloudflare), Pitfall 8 (staff can't use CMS / broken builds), Pitfall 9 (image bloat — wire the build-time image pipeline here for CMS uploads).

### Phase 4: Form endpoints (Kontakt + Rekrutacja)
**Rationale:** Depends on Phase 1's on-demand rendering support; independent of the CMS. The DNS/domain-verification lead-time item started in Phase 1 should be resolved by now.
**Delivers:** `src/routes/api/kontakt/+server.ts` and `.../rekrutacja/+server.ts`, Turnstile client widget + mandatory server-side `siteverify`, Resend integration with a verified sending domain (SPF/DKIM/DMARC confirmed via mail-tester), RODO consent checkboxes + klauzula informacyjna text on both forms, hard-coded recipient/sender (never client-supplied), zero logging/storage of submission bodies, honeypot fallback for no-JS submissions.
**Uses:** Cloudflare Turnstile, Resend, `platform.env` secrets.
**Avoids:** Pitfall 3 (RODO on children's data), Pitfall 4 (dead MailChannels), Pitfall 5 (deliverability), Pitfall 6 (endpoint abuse).

### Phase 5: Accessibility + compliance + performance hardening
**Rationale:** Cross-cutting concerns baked in during Phases 2–4 get audited and finalized here; the Deklaracja dostępności can only be written truthfully once the AA baseline is real.
**Delivers:** Full WCAG 2.1 AA audit (axe-core/Playwright + Lighthouse CI + manual keyboard/screen-reader pass), Deklaracja dostępności generated from the official gov.pl template (requires client input: koordynator dostępności contact), image pipeline tuning for mobile LCP, `prefers-reduced-motion` pass, Polish SEO/metadata (JSON-LD local org, sitemap, OG tags), BIP link placement/labeling verified.
**Addresses:** Deklaracja dostępności, accessibility widget, WCAG AA baseline, BIP link (FEATURES.md legal-blocking items).
**Avoids:** Pitfall 2 (missing/invalid declaration), Pitfall 10 (motion/keyboard), Pitfall 11 (SEO), Pitfall 14 (BIP link).

### Phase 6: Launch readiness — content gate + real data
**Rationale:** The build-with-placeholders strategy needs an explicit gate before go-live; this is the last phase because it depends on real client-supplied content (photos with consent, confirmed contact details).
**Delivers:** Grep-verified removal of all `PLACEHOLDER` tokens, real logo/photos (with documented wizerunek consent or stock/illustration fallback), confirmed recipient email spelling (`zlobek@` vs `zlobel@ugstromiec.pl`), confirmed koordynator dostępności/IOD contacts, live end-to-end test send to the client's real inbox.
**Avoids:** Pitfall 12 (placeholder content ships), Pitfall 13 (children's photos without consent).

### Phase Ordering Rationale

- Foundation must exist before anything else can be verified as "actually deployed" — this also front-loads the DNS lead-time dependency.
- Content model + design tokens must precede both CMS integration (schemas) and component-building (color tokens), per the dependency graph in FEATURES.md and the contrast pitfall in PITFALLS.md.
- CMS and forms are independent of each other (both depend only on Foundation) and could in principle be parallelized, but are sequenced CMS-then-forms here because forms carry the higher legal/compliance risk and benefit from DNS work already being underway.
- Compliance/a11y hardening is deliberately last-but-one rather than continuous-only, because the Deklaracja dostępności's conformance claim must describe the *real*, finished state — writing it earlier risks a false claim, which PITFALLS.md flags as itself a violation.
- Launch readiness is last because it depends on client-supplied real assets (photos, contacts) that cannot be rushed.

### Research Flags

Needs deeper research during planning (`--research-phase`):
- **Phase 3 (CMS integration):** OAuth Worker deployment specifics and Sveltia config edge cases are documented but org-specific (GitHub OAuth App setup, staff account provisioning) — MEDIUM confidence per STACK.md/ARCHITECTURE.md sourcing.
- **Phase 4 (Forms):** Resend domain verification is explicitly flagged MEDIUM confidence pending DNS-control confirmation with the client; worth a fast research pass if DNS turns out to be inaccessible (MailChannels Email API fallback path).
- **Phase 5 (Compliance):** Deklaracja dostępności official generator/template specifics change occasionally; verify current tool at plan time.

Standard patterns (skip research-phase):
- **Phase 1 (Foundation):** SvelteKit + adapter-cloudflare scaffold is HIGH confidence, well-documented, current versions verified via npm.
- **Phase 2 (Content/design):** Tailwind v4 tokens and SvelteKit content routing are HIGH confidence, standard patterns.
- **Phase 6 (Launch readiness):** Process/checklist work, not technical research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH (framework, styling, Turnstile, CMS) / MEDIUM (email provider) | Versions verified via npm registry; email provider choice depends on unconfirmed DNS control of `ugstromiec.pl` |
| Features | HIGH | Compliance features verified against gov.pl/legal text; section content verified against multiple live żłobek gminny reference sites |
| Architecture | HIGH (patterns) / MEDIUM (org coordination specifics) | Patterns well-documented and current across official repos/docs; domain control and staff Git-account onboarding are org-specific unknowns |
| Pitfalls | HIGH | Legal facts (fines, WCAG criteria) and Cloudflare/email facts cross-checked against primary/official sources; UX/CMS pitfalls from established practice |

**Overall confidence:** HIGH, with one explicit MEDIUM dependency (email domain verification) that is a client-input gap, not a research gap.

### Gaps to Address

- **DNS control of `ugstromiec.pl`:** Confirm with the client/gmina IT before Phase 4 planning locks in. If unavailable, fall back to MailChannels Email API or a fully project-controlled subdomain.
- **Exact form recipient email:** `zlobek@ugstromiec.pl` vs. `zlobel@ugstromiec.pl` (brief typo) — must be confirmed before Phase 4/6, since a wrong address is itself a silent data-loss/breach risk.
- **Koordynator dostępności / IOD contact:** Needed for the Deklaracja dostępności (Phase 5) and the RODO klauzula informacyjna (Phase 4) — client must name a person.
- **ARCHITECTURE.md's Astro-flavored file tree:** Treat as illustrative of the pattern only; during Phase 1/2 planning, translate paths and prerender directives to SvelteKit conventions (`src/routes/**/+page.svelte`, `+server.ts`, `platform.env`).
- **Staff Git accounts:** Decide per-editor GitHub accounts vs. a shared editor account for Sveltia CMS access — an onboarding decision, not a technical blocker, needed before Phase 3 handover.

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`) — verified current versions of SvelteKit/Svelte/adapter-cloudflare/Tailwind/Sveltia/Resend
- /sveltia/sveltia-cms (Context7) + sveltia/sveltia-cms-auth README — GitHub backend config, OAuth flow, PKCE restriction
- developers.cloudflare.com/turnstile — server-side siteverify flow
- gov.pl (dostepnosc-cyfrowa pages) + Ustawa z 4 kwietnia 2019 r. o dostępności cyfrowej — legal text, fines, mandatory Deklaracja fields
- W3C WCAG 2.1 — contrast (1.4.3), use of color (1.4.1), reduced motion (2.3.3/2.2.2), target size
- MailChannels official EOL notices — free Cloudflare Workers integration terminated 2024

### Secondary (MEDIUM confidence)
- MailChannels/Resend deliverability guidance — free MailChannels Workers EOL, Resend free-tier limits
- Fundacja Widzialni — Ustawa o dostępności cyfrowej w pytaniach i odpowiedziach
- Live żłobek gminny reference sites (Wysoka, Kiełczów, Długołęka, Oleśnica) — section content patterns, competitor comparison
- Rodney Lab SvelteKit a11y testing guidance — axe + Playwright integration pattern
- Cloudflare Workers Static Assets vs. Pages parity guidance (2026)

### Tertiary (LOW confidence)
- None flagged — all findings traced to at least MEDIUM-confidence sources; email provider domain-verification path is the one item requiring client confirmation rather than further research.

---
*Research completed: 2026-08-12*
*Ready for roadmap: yes*
