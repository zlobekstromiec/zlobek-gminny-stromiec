<!-- GSD:project-start source:PROJECT.md -->

## Project

**Żłobek Gminny Stromiec — Public Website**

A modern, joyful public website for the municipal nursery (**żłobek gminny**) in Stromiec — a *jednostka organizacyjna* of Gmina Stromiec, operating under the Urząd Gminy Stromiec (`ugstromiec.pl`). It serves parents and prospective parents with a mobile-first, easy-to-navigate experience where all essential information is immediately visible. The site has five primary sections: **Aktualności**, **O nas**, **Rekrutacja**, **Dokumenty**, **Kontakt**.

**Core Value:** A parent lands on the site and, within seconds, **both feels the żłobek's warmth and finds the exact information they need** — how to enrol, which documents to download, and how to make contact — on any device. Emotional reassurance and effortless information access, together, are the one thing that must work.

### Constraints

- **Tech stack**: Cloudflare hosting (Pages/Workers) — all org projects live there and the CLI is connected — *keeps ops consistent and deploy path known*
- **Budget**: Minimize running cost — near-zero hosting, free tiers (git-based CMS, Resend free, Turnstile free), **no database** — *public body with tight budget*
- **Legal — Accessibility**: WCAG 2.1 AA + Deklaracja dostępności under *ustawa o dostępności cyfrowej* (EU Directive 2016/2102) — *mandatory for public-sector sites*
- **Legal — RODO/GDPR**: Form submissions carry a child's personal data → consent checkbox + *klauzula informacyjna* required — *lawful processing*
- **Legal — BIP**: Public body must expose a BIP — *satisfied by linking to existing naszbip BIP*
- **Language**: Polish only — the entire public site **and** the CMS admin portal (field labels, hints, editor UI where supported); assume staff and visitors do not read English — *local audience in Stromiec*
- **Design**: Must convey joy/warmth instantly, be mobile-first, and clearly exceed the Białobrzegi reference — *primary client expectation*

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## TL;DR Recommendation

| Layer | Pick | One-liner |
|-------|------|-----------|
| Framework | **SvelteKit 2 + `@sveltejs/adapter-cloudflare`** | Org already ships SvelteKit/Cloudflare; static pages prerender, the two forms become native Cloudflare functions in the same repo — no separate Worker to run. |
| CMS | **Sveltia CMS** (Decap-compatible, drop-in) | Fastest, actively developed, best i18n/UX for non-technical staff; single JS file, no build step. |
| CMS auth | **`sveltia/sveltia-cms-auth` Cloudflare Worker + GitHub OAuth App** | The lowest-friction free OAuth proxy; Cloudflare has no Netlify-style Git Gateway. |
| Email | **Resend** (SDK `resend`) | Free 100/day, 3,000/mo — dwarfs a nursery's volume. Fallback: MailChannels Email API (free 100/day) if `ugstromiec.pl` DNS is unavailable. |
| Spam | **Cloudflare Turnstile** | Free, Cloudflare-native, privacy-friendly; server-verify in the form handler. |
| Styling | **Tailwind CSS v4 via `@tailwindcss/vite`** | CSS-first `@theme` config perfect for the blue/yellow/orange/red joyful palette; mobile-first by default. |
| A11y | **svelte-check + eslint-plugin-svelte + `@axe-core/playwright` + Lighthouse CI** | Compile-time warnings + runtime WCAG 2.1 AA checks in CI. |

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| SvelteKit | 2.70.2 | App framework / router / static generation | Org standard on Cloudflare. Content pages `prerender` to static HTML; the enrollment + contact form endpoints (`+server.ts` / form actions) run server-side as Cloudflare functions **in the same project** — no separate Worker to deploy/maintain. Svelte's compiler also emits a11y warnings for free. |
| Svelte | 5.56.8 | UI component compiler (runes) | Ships minimal JS; ideal for a mostly-static site with a few interactive "islands" (mobile nav, form widgets, Turnstile). |
| @sveltejs/adapter-cloudflare | 7.2.9 | Deploy adapter | Correct adapter for **both** Cloudflare Pages and Workers-static-assets. Auto-splits prerendered static assets from dynamic server routes; exposes secrets via `platform.env`. **Not** `adapter-cloudflare-workers` (legacy, single-Worker only) and **not** `adapter-static` (can't run the form endpoints). |
| Sveltia CMS | 0.188.0 (`@sveltia/cms`, usually via CDN `<script>`) | Git-based content editing for staff | Config-compatible drop-in for Decap/Netlify CMS but dramatically faster, actively maintained, superior media library + i18n + mobile editing. Staff edit Aktualności and upload Dokumenty; commits trigger a Cloudflare rebuild. No database, no license cost. |
| Cloudflare Turnstile | n/a (platform) | Bot/spam protection on both forms | Free, unlimited, GDPR-friendly (no reCAPTCHA data-sharing concerns — relevant under RODO). Managed/invisible widget client-side; single-use token verified server-side. |
| Resend | 6.19.0 (`resend`) | Transactional email for form submissions | Simple HTTP API + typed SDK; free tier (100/day, 3,000/mo) is far beyond a nursery's realistic volume. Replaces the dead free MailChannels integration. |
| Tailwind CSS | 4.3.3 (`tailwindcss` + `@tailwindcss/vite`) | Styling system | v4 is CSS-first: define the brand palette as tokens in an `@theme{}` block — no `tailwind.config.js`. Mobile-first utilities let us build the bespoke "joyful" design fast while keeping production CSS tiny (auto-pruned). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @axe-core/playwright | latest (4.x) | Runtime WCAG scans in E2E tests | CI a11y gate — catches contrast/ARIA/landmark issues the compiler can't. |
| eslint-plugin-svelte | 3.x | Lint incl. Svelte a11y rules | Editor + CI; complements built-in compiler warnings. |
| @lhci/cli (Lighthouse CI) | 0.15.x | Automated perf + a11y + best-practices budget | PR gate to hold the WCAG/perf bar as content grows. |
| @playwright/test | 1.x | E2E harness hosting axe scans + form flow tests | Verify Turnstile + email happy-path with mocked provider. |
| marked / mdsvex | latest | Render CMS markdown (Aktualności/O nas) | Pick one: `mdsvex` if you want Svelte-in-markdown, plain `marked` if content is simple. |
| svelte-check | ships with SvelteKit | Type + a11y diagnostics | `npm run check` in CI. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite | 8.2.1 | Bundler under SvelteKit | Tailwind v4 plugs in via `@tailwindcss/vite`, not PostCSS. |
| Wrangler | latest | Local emulation of `platform.env`, secrets, deploy | Use `wrangler pages dev` / `vite dev` with `.dev.vars` for `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. |
| Cloudflare Pages (Git integration) | platform | Auto-deploy on push to `main` | Build cmd `npm run build`, output `.svelte-kit/cloudflare`. CMS commits → auto rebuild. |

## Installation

# Scaffold

# Core deploy + styling

# Email + content rendering

# A11y / testing

# Sveltia CMS: NO npm install — it is loaded via CDN in static/admin/index.html

#   <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>

## Key Integration Patterns (Cloudflare specifics)

### 1. Framework / adapter

- `svelte.config.js` → `import adapter from '@sveltejs/adapter-cloudflare'`.
- Mark every content route `export const prerender = true;` (static HTML on CDN). Leave the two form endpoints dynamic.
- Read secrets in server code via `event.platform.env.RESEND_API_KEY` — **not** `import.meta.env` (that's for build-time public vars). Type them in `app.d.ts` under `Platform.Env`.
- **Gotcha:** with `adapter-cloudflare`, SvelteKit server routes *are* the Pages Functions. Do **not** also hand-author a `/functions` directory for the same paths — they collide. One mental model: SvelteKit owns routing.

### 2. Sveltia CMS + auth on Cloudflare

- `static/admin/config.yml`:
- **Auth mechanism (concrete):** Cloudflare has no Netlify Git Gateway, so you self-host the proxy:
- Staff click "Login with GitHub" → OAuth → edit → commit → Cloudflare rebuilds. Free.
- **Gotcha:** Sveltia forbids `auth_type: pkce` on the GitHub backend — use the server-side OAuth worker (default) as shown. A PAT login mode exists but is only sensible for a single technical admin, not non-technical staff.

### 3. Email on form submit (Resend)

- **Gotcha (deliverability / MEDIUM confidence):** Resend requires verifying a sending domain (SPF + DKIM DNS records). Confirm whether the client controls DNS for `ugstromiec.pl`. If yes → verify a subdomain like `zlobek.ugstromiec.pl` and send from it. If **no** DNS access → fall back to **MailChannels Email API** (free 100/day, needs its own domain-lockdown TXT record) or ask the gmina's IT to add records. Never ship sending from `onboarding@resend.dev` in production (deliverability + trust).

### 4. Turnstile (spam)

- Client: add `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer>` and a `<div class="cf-turnstile" data-sitekey="<PUBLIC_SITE_KEY>">` inside each form. Managed or invisible mode.
- Server (before sending email): POST the `cf-turnstile-response` token to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret=platform.env.TURNSTILE_SECRET_KEY`. Reject if `success !== true`. Token is single-use and expires after 5 minutes.
- Site key is public; secret lives in Pages/Worker env vars only.

### 5. RODO on forms (not a library, but required)

- Required consent checkbox + *klauzula informacyjna* text rendered on both forms; block submit until checked. No storage keeps the RODO surface minimal — email-and-forget.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| SvelteKit | **Astro 7.2.1 + `@astrojs/cloudflare` 14.2.1** | Genuinely excellent for content sites (islands, content collections, zero-JS by default). Choose it if the team had no Svelte preference. Here SvelteKit wins purely on **org familiarity** — you still get server form endpoints either way, so there's no capability gap, only a "which do we already operate" gap. |
| Sveltia CMS | Decap CMS 3.15.1 | If you specifically need Decap's larger plugin/widget ecosystem or an existing Decap config. Same OAuth-worker requirement; `sveltia-cms-auth` even works for both. Sveltia is the better default for non-technical staff. |
| Resend | MailChannels Email API | When `ugstromiec.pl` DNS can't be touched for Resend verification, or you want the closest migration from the old Workers integration. Also SMTP2GO/Mailgun/SendGrid for higher volume — unnecessary here. |
| Tailwind v4 | Vanilla CSS + custom properties | If the design is tiny and you want zero build tooling. For a bespoke multi-color joyful design iterated quickly, Tailwind's tokens + responsive utilities are faster and more consistent. |
| adapter-cloudflare | Cloudflare Workers Static Assets (same adapter) | Cloudflare now steers new projects to Workers-static-assets over Pages. Same adapter supports it. Recommend **Pages** for this project's simple Git-push auto-deploy; revisit Workers if you later need advanced bindings. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Free MailChannels **Workers integration** | Ended 31 Aug 2024 — no longer free/automatic; the old `send.mailchannels.net` no-auth path is dead. | Resend (or MailChannels **Email API** with an account). |
| `@sveltejs/adapter-static` for the whole site | Can't run the enrollment/contact form endpoints — you'd bolt on a separate Worker anyway. | `@sveltejs/adapter-cloudflare` (static + functions in one). |
| `adapter-cloudflare-workers` (legacy) | Superseded; bundles everything into one Worker, worse static-asset handling. | `@sveltejs/adapter-cloudflare`. |
| Paid headless CMS (Contentful/Sanity/Storyblok) | Monthly cost + a database; violates the near-zero-cost + no-storage constraints. | Sveltia CMS (git-based, free). |
| Netlify Identity / Git Gateway | Netlify-only; does not exist on Cloudflare. | `sveltia-cms-auth` Worker + GitHub OAuth App. |
| Google reCAPTCHA | RODO friction (Google data-sharing) + cost/complexity. | Cloudflare Turnstile (free, privacy-friendly). |
| A database for submissions | Explicitly out of scope; increases RODO surface + cost. | Email-only via Resend. |
| Committing large media to git via CMS | Nursery PDFs are small (fine), but big files bloat the repo and slow builds. | Keep uploads small; if they grow, move to R2. |

## Accessibility (WCAG 2.1 AA) Tooling

| Layer | Tool | Catches |
|-------|------|---------|
| Compile-time | Svelte compiler a11y warnings + `svelte-check` | Missing alt, label/for, ARIA misuse in static markup. |
| Lint | `eslint-plugin-svelte` | Additional a11y/lint rules in editor + CI. (Astro equivalent: `eslint-plugin-jsx-a11y` via `eslint-plugin-astro`.) |
| Runtime | `@axe-core/playwright` in Playwright E2E | Contrast, landmarks, focus order, dynamic-content violations the compiler can't see. |
| Audit | Lighthouse CI (`@lhci/cli`) | Automated a11y + perf score budget as a PR gate. |
| Manual | Keyboard-only nav, screen reader, contrast checker | Real WCAG 2.1 AA sign-off + the published **Deklaracja dostępności**. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @sveltejs/kit 2.70.2 | svelte 5.56.8 | Svelte 5 runes are the current default. |
| @sveltejs/adapter-cloudflare 7.2.9 | SvelteKit 2 | Supports Cloudflare Pages and Workers static assets. |
| tailwindcss 4.3.3 | @tailwindcss/vite 4.3.3 + vite 8.2.1 | v4 uses the Vite plugin, not PostCSS; config is CSS-first `@theme`. |
| @sveltia/cms 0.188.0 | Decap `config.yml` schema | Drop-in; `sveltia-cms-auth` worker handles GitHub OAuth. |
| resend 6.19.0 | Cloudflare Workers runtime (fetch) | Works via `platform.env`; requires verified sending domain. |

## Sources

- npm registry (`npm view`) — verified current versions of every package above — HIGH
- /sveltia/sveltia-cms (Context7) — GitHub backend config, OAuth `base_url`, PKCE-on-GitHub restriction — HIGH
- github.com/sveltia/sveltia-cms-auth README + DeepWiki setup guide — Worker + GitHub OAuth App steps — MEDIUM
- MailChannels End-of-Life notice + Cloudflare/Resend docs — free MailChannels Workers integration ended 31 Aug 2024; Resend free tier 100/day, 3,000/mo — MEDIUM
- developers.cloudflare.com/turnstile (server-side validation) — siteverify flow, single-use 5-min token — HIGH
- Svelte a11y docs + Rodney Lab SvelteKit a11y testing (axe + Playwright) — compiler warnings + runtime testing gaps — MEDIUM

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
