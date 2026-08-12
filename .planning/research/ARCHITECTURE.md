# Architecture Research

**Domain:** Statically-built public-sector content site + git-CMS editing + serverless email-only forms, on Cloudflare
**Researched:** 2026-08-12
**Confidence:** HIGH (patterns well-documented and current; MEDIUM only on org-specific coordination — ugstromiec.pl domain control and staff Git accounts)

## Standard Architecture

The system is a **static-first content site with two narrow runtime seams**: (1) a client-side CMS admin app that commits to Git, and (2) a handful of on-demand form endpoints that verify and email. Everything else is pre-built HTML served from Cloudflare's edge. There is deliberately **no database and no application server** — the "backend" is Git (content store) plus stateless edge functions (form relay).

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BUILD TIME (CI on Cloudflare)                  │
│  ┌───────────────┐   reads    ┌──────────────────────────────────┐    │
│  │ Git repo      │──────────► │ Astro build (SSG)                │    │
│  │ content/*.md  │            │  • content collections → HTML    │    │
│  │ media assets  │            │  • Sharp image pipeline (AVIF/   │    │
│  └───────────────┘            │    WebP, srcset)                 │    │
│         ▲                     └──────────────┬───────────────────┘    │
│         │ commit/push                        │ emits                  │
└─────────┼────────────────────────────────────┼────────────────────────┘
          │                                     ▼
┌─────────┼─────────────────────────┐  ┌────────────────────────────────┐
│   RUNTIME: CMS admin (browser)    │  │   RUNTIME: Edge (Cloudflare)   │
│  ┌─────────────────────────────┐  │  │  ┌──────────────────────────┐  │
│  │ /admin  (Sveltia CMS SPA)   │  │  │  │ Static assets (CDN)      │  │
│  │  • static JS bundle         │  │  │  │  O nas / Rekrutacja /    │  │
│  │  • talks to GitHub API      │  │  │  │  Aktualności / Dokumenty │  │
│  └──────────┬──────────────────┘  │  │  │  / Kontakt (pure HTML)   │  │
│             │ OAuth token          │  │  └──────────────────────────┘  │
│             ▼                      │  │  ┌──────────────────────────┐  │
│  ┌─────────────────────────────┐  │  │  │ On-demand form endpoints │  │
│  │ sveltia-cms-auth Worker     │  │  │  │  POST /api/kontakt       │  │
│  │  (OAuth proxy → GitHub)     │  │  │  │  POST /api/rekrutacja    │  │
│  │  secrets: OAuth client id/  │  │  │  │  • Turnstile siteverify  │  │
│  │  secret                     │  │  │  │  • Resend send           │  │
│  └─────────────────────────────┘  │  │  │  secrets: TURNSTILE_*,   │  │
│                                    │  │  │  RESEND_API_KEY          │  │
└────────────────────────────────────┘  │  └───────────┬──────────────┘  │
                                         └──────────────┼─────────────────┘
                     external services                  ▼
          ┌──────────────┐   ┌────────────────┐   ┌──────────────────┐
          │ GitHub API   │   │ Turnstile      │   │ Resend API       │
          │ (content     │   │ siteverify     │   │ → zlobek@        │
          │  commits)    │   │                │   │   ugstromiec.pl  │
          └──────────────┘   └────────────────┘   └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Static site (build)** | Turn markdown/frontmatter + media into optimized, CDN-cacheable HTML; own layout, design system, accessibility baseline | Astro (static output) with Content Collections + Sharp image pipeline |
| **Static assets (runtime)** | Serve pre-built HTML/CSS/JS/images from edge with near-zero TTFB | Cloudflare Workers Static Assets (or Pages) |
| **CMS admin SPA** | Let staff edit content in a browser; read/write markdown + upload media via the GitHub API; no server of its own | Sveltia CMS (single JS bundle at `/admin`, config in `admin/config.yml`) |
| **OAuth proxy Worker** | Complete the GitHub OAuth code→token exchange server-side (Cloudflare has no Netlify Git Gateway); keep client secret off the browser | `sveltia-cms-auth` Cloudflare Worker |
| **Form endpoints** | Receive form POST, validate fields + RODO consent, verify Turnstile token, send email, return success/error | Astro on-demand route (`export const prerender = false`) running on Workers runtime |
| **Email provider** | Deliver submission as email; no inbox stored on our side | Resend (verified sending domain; API key as secret) |
| **Spam gate** | Prove human before emailing | Cloudflare Turnstile (sitekey public, secret server-side) + honeypot fallback |
| **Git repo** | Single source of truth for all content and code; trigger of rebuilds | GitHub repo; push to `main` fires Cloudflare build |

## Recommended Project Structure

```
/
├── src/
│   ├── content/                 # CMS-managed content lives here
│   │   ├── aktualnosci/         # COLLECTION: one .md per news post
│   │   │   ├── 2026-09-nowy-rok.md
│   │   │   └── ...
│   │   ├── dokumenty/           # COLLECTION: one .md per document (title, category, file ref)
│   │   │   └── regulamin-2026.md
│   │   ├── strony/              # SINGLETONS: O nas, Rekrutacja, Kontakt page bodies
│   │   │   ├── o-nas.md
│   │   │   ├── rekrutacja.md
│   │   │   └── kontakt.md
│   │   └── config.ts            # collection schemas (Zod) — the content contract
│   ├── pages/
│   │   ├── index.astro          # homepage (hero + core message)
│   │   ├── aktualnosci/         # list + [slug].astro detail (static)
│   │   ├── o-nas.astro
│   │   ├── rekrutacja.astro
│   │   ├── dokumenty.astro
│   │   ├── kontakt.astro
│   │   ├── deklaracja-dostepnosci.astro   # legally required
│   │   └── api/
│   │       ├── kontakt.ts       # on-demand: verify + email
│   │       └── rekrutacja.ts    # on-demand: verify + email
│   ├── components/              # islands (form + Turnstile) and static UI
│   ├── layouts/                 # semantic HTML shells, landmarks, skip links
│   └── styles/                  # design system (palette, tokens)
├── public/
│   ├── admin/
│   │   ├── index.html           # loads Sveltia CMS bundle
│   │   └── config.yml           # CMS backend + collections mapping
│   ├── uploads/                 # CMS media target (photos, PDFs)
│   └── pliki/                   # downloadable PDFs (Dokumenty targets)
├── auth-worker/                 # sveltia-cms-auth (separate deploy)
│   └── wrangler.toml
├── astro.config.mjs             # Cloudflare adapter, image config
└── wrangler.toml / build config # deploy target (Workers Static Assets or Pages)
```

### Structure Rationale

- **`src/content/`:** Everything a staff member can edit is one directory of markdown + frontmatter. The CMS `config.yml` maps 1:1 onto these folders, so "what the CMS shows" and "what the repo holds" never drift. Collections (`aktualnosci`, `dokumenty`) are folders of many files; singletons (`strony/*`) are one file each.
- **Media in `public/uploads/` and `public/pliki/`:** CMS-uploaded images and PDFs commit into the repo alongside content, so a rebuild always has every asset. Images are re-processed by the build pipeline; PDFs are served as-is.
- **`src/pages/api/*`:** The only runtime code paths. Kept tiny and isolated so the security surface (secrets, external calls) is one small, reviewable place.
- **`auth-worker/` separate:** The OAuth proxy is its own Cloudflare Worker with its own secrets and lifecycle; it is not part of the site build and rarely changes.

## Architectural Patterns

### Pattern 1: Static-first with surgical on-demand rendering

**What:** Every content route is prerendered to static HTML at build time. Only the two form POST handlers opt out of prerendering. Astro v5 defaults `output` to static; a route becomes dynamic with a single `export const prerender = false`.
**When to use:** Content-dominant sites with a couple of dynamic actions — exactly this project.
**Trade-offs:** Best possible Core Web Vitals and CDN cacheability for content; the cost is that the dynamic endpoints run in the Workers runtime (no Node built-ins — use `fetch`, Web APIs).

**Example:**
```ts
// src/pages/api/kontakt.ts
export const prerender = false;            // this route runs at the edge
export const POST = async ({ request, locals }) => {
  const form = await request.formData();
  const secrets = locals.runtime.env;      // TURNSTILE_SECRET, RESEND_API_KEY
  // 1) validate + RODO consent, 2) Turnstile siteverify, 3) Resend send
};
```

### Pattern 2: Git-as-CMS with an OAuth proxy Worker

**What:** The CMS is a static browser app that reads/writes content directly through the GitHub API. Because Cloudflare has no Netlify Git Gateway, a small `sveltia-cms-auth` Worker performs the OAuth authorization-code→token exchange server-side and posts the token back to the CMS popup. `admin/config.yml` points `backend.base_url` at the Worker.
**When to use:** Any git-CMS (Sveltia/Decap) hosted anywhere other than Netlify.
**Trade-offs:** Zero-cost, no database, full version history of every content change. The cost is that each editor authenticates with a **Git provider account** that has write access to the repo — a coordination/onboarding item, not a technical blocker.

**Example (`admin/config.yml`):**
```yaml
backend:
  name: github
  repo: gmina-stromiec/zlobek-www
  branch: main
  base_url: https://sveltia-cms-auth.<subdomain>.workers.dev  # the OAuth proxy Worker
media_folder: public/uploads
public_folder: /uploads
collections:
  - name: aktualnosci        # folder collection (many posts)
    folder: src/content/aktualnosci
    create: true
    fields: [ {label: Tytuł, name: title, widget: string}, ... ]
```

### Pattern 3: Progressively enhanced forms (native POST baseline)

**What:** Forms are real `<form method="POST" action="/api/kontakt">`. With no JS, submission still works as a full-page POST → the endpoint returns a rendered success/error page. With JS, an island intercepts submit, renders the Turnstile widget, and does a `fetch` for inline feedback.
**When to use:** Public-sector / accessibility-obligated sites where "works without JS" is a real requirement.
**Trade-offs:** Robust and accessible. The wrinkle: **Turnstile needs JS to mint a token**, so a pure no-JS submit cannot carry one. Mitigate with a **honeypot field** (JS-free spam guard) plus a server rule: accept no-JS submissions that pass the honeypot, require a valid Turnstile token when JS is present. This keeps the form usable for the rare no-JS visitor without opening a spam hole.

## Data Flow

### Content pipeline (staff edit → live site)

```
Staff member (browser)
   ↓ opens /admin  (Sveltia CMS SPA, static)
   ↓ "Log in with GitHub"
sveltia-cms-auth Worker  ──OAuth code→token──►  GitHub
   ↓ token posted back to CMS popup
CMS authenticated → staff edits post / uploads PDF or photo
   ↓ Save  (Sveltia commits markdown + media via GitHub API)
GitHub repo (main)  ← new commit
   ↓ push triggers Cloudflare build hook
Astro build (SSG): content collections → HTML, images → AVIF/WebP/srcset
   ↓ deploy new static assets
Cloudflare edge  →  parents see updated content
```

Direction is strictly one-way at build time: **Git is the source of truth; the live site is a derived artifact.** No content is ever read from a runtime database because there is none.

### Form pipeline (parent submit → email)

```
Parent (Kontakt / Rekrutacja page, static HTML)
   ↓ fills fields + ticks RODO consent
   ↓ Turnstile widget (JS) issues token   [honeypot present as fallback]
   ↓ submit  (fetch POST if JS, else native full-page POST)
Astro on-demand endpoint  /api/kontakt   (Workers runtime, edge)
   ├─ validate fields + require RODO consent  → 400 on failure
   ├─ POST token → Turnstile siteverify (TURNSTILE_SECRET)  → reject if invalid
   └─ Resend API (RESEND_API_KEY): from=no-reply@<verified domain>,
        to=zlobek@ugstromiec.pl, reply-to=parent email, body=submission
   ↓ 200 success  /  4xx-5xx error
Parent UX: inline success message (JS) or rendered success page (no-JS)
```

Direction: **fire-and-relay.** Data enters the endpoint, is transformed into an email, and is discarded — nothing persists (RODO data-minimization by architecture, not by policy).

### State management

There is effectively **no application state**. Content state lives in Git; form state lives only for the milliseconds a request is in flight. This is a feature: no sessions, no cache invalidation logic, no data store to secure or back up.

### Key Data Flows

1. **Content publish:** CMS commit → build hook → rebuild → edge deploy (minutes end-to-end).
2. **Form relay:** browser POST → Turnstile verify → Resend → mailbox (seconds), zero storage.
3. **CMS auth:** browser → OAuth proxy Worker → GitHub token → CMS (one-time per session).

## Suggested Build Order

Ordered by dependency. Each layer is independently shippable/verifiable.

1. **Foundation — repo + framework + deploy pipeline.** Astro scaffold, Cloudflare deploy target chosen (see decision below), git push → build → live confirmed. *Everything depends on being able to see a deploy.*
2. **Content model + design system + static pages.** Define collection schemas (`aktualnosci`, `dokumenty`) and singletons (`strony/*`); build layouts, palette, homepage hero, and the five sections against placeholder content. *The CMS config in step 3 maps onto these schemas, so they must exist first.*
3. **CMS integration.** `admin/config.yml` mapping to the collections, Sveltia bundle at `/admin`, GitHub OAuth App, and the `sveltia-cms-auth` Worker deployed with its secrets. *Depends on step 2 (schemas) and on the GitHub repo/OAuth App existing. The auth Worker can be built in parallel with step 2.*
4. **Form endpoints.** Turnstile keys, Resend domain verification (DNS), on-demand `/api/*` endpoints, and the progressively-enhanced form islands with RODO consent + klauzula informacyjna. *Depends on the Cloudflare adapter/on-demand rendering from step 1; independent of the CMS.*
5. **Accessibility + performance hardening + legal page.** WCAG 2.1 AA audit, semantic/landmark/focus pass, image-pipeline tuning, and the required **Deklaracja dostępności** page. *Cross-cutting; baked in during 2–4, then audited and finalized here.*

**Critical lead-time items to start early (they gate steps 3–4 and involve the Urząd Gminy):**
- **Resend sending-domain verification** on `ugstromiec.pl` (SPF/DKIM DNS records) — DNS coordination with the gmina's IT can take days. Without it, form email won't deliver.
- **Staff Git accounts + repo write access + GitHub OAuth App** — decide per-editor accounts vs a shared editor account, and who administers it.

## Deploy-target decision: Workers Static Assets vs Pages

**Recommendation: Cloudflare Workers with Static Assets** as the primary target, with **Cloudflare Pages as a fully-supported fallback**. As of 2026 Cloudflare steers new projects to Workers Static Assets because a single Worker serves the static site *and* runs the dynamic form endpoint in one deployment; Workers reached feature parity with Pages for static assets, SSR, and custom domains, and static-asset requests are free. Pages + Pages Functions remains valid and has broader git-CMS tutorial coverage. **Either works identically for this architecture** — Astro's Cloudflare adapter abstracts the difference, and the `sveltia-cms-auth` OAuth proxy is a separate Worker regardless. One practical note: on Pages, service/secret bindings are configured in the dashboard (no `wrangler.toml`); on Workers they're in config — a minor operational difference, not an architectural one.

## Scaling Considerations

This is a low-traffic municipal nursery site; **scaling is a non-concern by design.**

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Expected (hundreds/day) | None. Static assets on CDN + a few form POSTs is the happy path. |
| 10× unexpected spike | None. Static edge delivery absorbs it; Resend free tier (≈100 emails/day) still covers realistic form volume. |
| Content growth (100s of posts/docs) | Build time grows slightly; if ever painful, paginate lists and/or incremental builds. Not needed for years. |

### Scaling Priorities

1. **First "bottleneck" is build time, not traffic** — only relevant with hundreds of media-heavy posts; address with pagination/incremental builds if ever.
2. **Email quota** — if form volume ever exceeded Resend's free tier, bump the plan; the code path is unchanged.

## Anti-Patterns

### Anti-Pattern 1: Adding a database "just in case" for submissions
**What people do:** Store form submissions in D1/KV/a database.
**Why it's wrong:** Directly violates RODO data-minimization and the project's explicit no-storage scope; creates a breach liability holding children's personal data.
**Do this instead:** Relay to email and discard. The email inbox is the record of truth.

### Anti-Pattern 2: Netlify Identity / Git Gateway config on Cloudflare
**What people do:** Copy a Netlify-CMS tutorial that uses `backend: git-gateway`.
**Why it's wrong:** Git Gateway is a Netlify service; it does not exist on Cloudflare, so login silently fails.
**Do this instead:** Use `backend: github` with `base_url` pointing at a self-hosted `sveltia-cms-auth` Worker.

### Anti-Pattern 3: Rendering the whole site SSR
**What people do:** Set the framework to full server output for convenience.
**Why it's wrong:** Defeats CDN caching, worsens TTFB/LCP, and adds runtime cost/failure modes for content that never changes between builds.
**Do this instead:** Static-first; opt only the `/api/*` form routes into on-demand rendering.

### Anti-Pattern 4: Secrets in client code or committed `.env`
**What people do:** Put the Resend key or Turnstile secret in a public script or a checked-in file.
**Why it's wrong:** Instant key leak; anyone can send mail as you or forge verifications.
**Do this instead:** Store `RESEND_API_KEY` and `TURNSTILE_SECRET` as Cloudflare secrets; only the Turnstile **sitekey** (public by design) appears client-side.

### Anti-Pattern 5: Serving CMS-uploaded photos unoptimized
**What people do:** Reference the raw upload straight from `public/uploads/`.
**Why it's wrong:** Staff upload multi-MB phone photos → tanks LCP and blows the mobile-first/CWV goals.
**Do this instead:** Route CMS images through Astro's build-time `<Image>`/`<Picture>` (Sharp) → AVIF/WebP + responsive `srcset` + lazy loading.

### Anti-Pattern 6: MailChannels free sending
**What people do:** Follow older Cloudflare tutorials using MailChannels.
**Why it's wrong:** Cloudflare's free MailChannels integration ended in 2024.
**Do this instead:** Resend (free tier) with a verified domain.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **GitHub API** | Sveltia CMS writes commits client-side using an OAuth token | Editors need repo write access; the token is obtained via the auth Worker |
| **sveltia-cms-auth Worker** | Separate Cloudflare Worker; OAuth code→token proxy | Holds GitHub OAuth **client id + secret** as Worker secrets; callback URL must match the OAuth App |
| **Cloudflare Turnstile** | Client widget (sitekey) → token → server `siteverify` (secret) | Sitekey public; secret server-side; honeypot as no-JS fallback |
| **Resend** | `fetch`/SDK from the on-demand endpoint using `RESEND_API_KEY` | Requires a **verified sending domain** (SPF/DKIM DNS on ugstromiec.pl); `from` must be on that domain, `reply-to` = submitter |
| **Cloudflare build hook / git integration** | Push to `main` triggers rebuild + deploy | The link between the content pipeline and the live site |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Build ↔ Runtime | One-way (build emits static assets) | Content is baked in; runtime never queries content |
| Static pages ↔ form islands | DOM (progressive enhancement) | Island hydrates a real `<form>`; site works without it |
| CMS admin ↔ site | None at runtime | CMS only talks to GitHub; site only reads from Git at build |
| Form endpoint ↔ external APIs | HTTPS `fetch` with secrets | The single place secrets are used; keep it minimal and reviewed |

## Accessibility & Performance as Architecture

These are legal (WCAG 2.1 AA + Deklaracja dostępności) and product (mobile-first, "pops with joy" fast) requirements — treated as structure, not polish.

- **Semantic structure by default:** Astro emits plain HTML; enforce landmarks (`header/nav/main/footer`), a single `h1` per page with correct heading order, a skip link, visible focus states, and properly labelled form controls (`<label for>`, `aria-describedby` for the klauzula informacyjna and error text). Building this into shared layouts/components makes AA the default, not a retrofit.
- **Image optimization pipeline (architectural):** All images — including CMS uploads — flow through the build-time Sharp pipeline (`<Image>`/`<Picture>`) producing AVIF/WebP, responsive `srcset`, explicit width/height (no layout shift), and lazy loading below the fold. This is the single biggest CWV lever given staff-uploaded photos. Free at build time; avoid paid runtime image services unless a future need appears.
- **Core Web Vitals on Cloudflare:** Static HTML from the edge gives excellent TTFB/LCP; the islands model ships minimal JS (mostly just the form + Turnstile) for good INP. Preload the hero image and self-host fonts (avoid third-party font FOUT/latency). Keep the heavy CMS bundle scoped to `/admin` so parents never download it.
- **Legal page as a component of the build:** `deklaracja-dostepnosci` is a required static page for a public body; treat it as a first-class route, not an afterthought.

## Sources

- Sveltia CMS OAuth proxy (Cloudflare Worker): https://github.com/sveltia/sveltia-cms-auth and setup/connect guides — HIGH (official repo/docs, current)
- Resend on Cloudflare Workers/Pages Functions: https://resend.com/docs/send-with-cloudflare-workers ; https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/ ; Pages Functions binding note https://www.codeflood.net/blog/2024/02/15/sending-email-cloudflare-pages-functions/ — HIGH
- Astro static-first + on-demand rendering (v5, Cloudflare adapter): https://docs.astro.build/en/guides/on-demand-rendering/ ; Cloudflare adapter overview — HIGH
- Cloudflare Workers Static Assets vs Pages (2026 recommendation, parity): https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ ; https://mecanik.dev/en/posts/cloudflare-pages-vs-workers-which-to-use-in-2026/ — HIGH
- MailChannels free sending ended 2024 (per PROJECT.md context) — MEDIUM/confirmed
- Cloudflare Turnstile siteverify pattern — HIGH (standard Cloudflare docs)

---
*Architecture research for: Cloudflare static content site + git-CMS + email-only serverless forms*
*Researched: 2026-08-12*
