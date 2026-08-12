---
phase: 01-live-homepage-design-foundation
plan: 04
subsystem: infra
tags: [deployment-hygiene, security-headers, csp, robots, sitemap, favicon, open-graph, cloudflare-pages, adapter-cloudflare, prerender, a11y-stub, polish]

# Dependency graph
requires:
  - "01-01: SvelteKit scaffold, adapter-cloudflare build output (.svelte-kit/cloudflare), two-tier @theme tokens, prerender-by-default, app.html shell"
  - "01-02: Footer 'Deklaracja dostępności' link + svelte.config KNOWN_FUTURE_ROUTES prerender allow-list"
provides:
  - "robots.txt Disallow-all crawl posture for the *.pages.dev placeholder (D-11)"
  - "sitemap.xml scaffolded well-formed, noindex-aligned (not advertised to crawlers yet)"
  - "Security-headers baseline via project-root _headers (CSP, HSTS, nosniff, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy) copied into the Pages build output"
  - "Favicon set: favicon.svg + 512 favicon.png + 180 apple-touch-icon.png + Polish site.webmanifest (brand theme_color #0369A1)"
  - "Branded 1200x630 og-placeholder.png share card (wordmark + heart badge, brand palette)"
  - "Polish /deklaracja-dostepnosci prerendered stub route (footer link no longer 404s)"
  - "app.html favicon/manifest/theme-color references"
affects: [live-homepage-design-foundation, cms-content-editing, forms-email, launch-seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "adapter-cloudflare v7: _headers/_redirects live at PROJECT ROOT (not static/); adapter copies them into .svelte-kit/cloudflare and appends asset-cache headers"
    - "Conservative same-origin CSP baseline (default-src 'self'), extended per-phase (CMS/Turnstile/Resend in Phases 2-4)"
    - "noindex-by-posture placeholder: robots Disallow:/ + sitemap present-but-unadvertised (D-11)"
    - "Self-contained prerendered Polish stub route (<svelte:head> title + noindex, no shared Seo component)"
    - "Build-time PNG asset generation from SVG via sharp (favicon rasters + OG card), committed as static output"

key-files:
  created:
    - "static/sitemap.xml"
    - "_headers"
    - "static/favicon.svg"
    - "static/favicon.png"
    - "static/apple-touch-icon.png"
    - "static/site.webmanifest"
    - "static/og-placeholder.png"
    - "src/routes/deklaracja-dostepnosci/+page.svelte"
  modified:
    - "static/robots.txt"
    - "src/app.html"
    - "svelte.config.js"

key-decisions:
  - "Placed _headers at the project root, not static/, because the installed @sveltejs/adapter-cloudflare v7 hard-errors on static/_headers and reads/copies the root file itself (plan assumed static/_headers)"
  - "Generated the favicon rasters + OG card from SVG with the project's bundled sharp (rsvg/pango/freetype), rendering the Polish wordmark via system Arial (full Ż/ł coverage) — the PNGs are committed static output, not a build dependency"
  - "Removed /deklaracja-dostepnosci from svelte.config KNOWN_FUTURE_ROUTES now that a real stub prerenders, so the crawler enforces the footer link again (per Plan 02 handoff note)"
  - "CSP kept same-origin with 'unsafe-inline' only for style-src (Svelte scoped styles); font-src 'self' matches the self-hosted WOFF2 fonts from Plan 01 — no external origins this phase"

requirements-completed: []

# Metrics
duration: ~18min
completed: 2026-08-12
status: complete
---

# Phase 1 Plan 04: Deployment Hygiene & Metadata Summary

**Deployment-hygiene foundation for the placeholder site: robots.txt Disallow-all + a noindex-aligned sitemap (D-11), an ASVS-L1 security-headers baseline via the project-root `_headers` (CSP/HSTS/nosniff/Referrer-Policy/X-Frame-Options), a branded favicon set + a 1200×630 Open Graph share card (D-10), and a Polish `/deklaracja-dostepnosci` prerendered stub so the footer's legally-sensitive link never 404s before Phase 6.**

## Performance

- **Duration:** ~18 min
- **Completed:** 2026-08-12
- **Tasks:** 3 (all committed atomically)
- **Files:** 11 (8 created, 3 modified)

## Accomplishments

- **Crawl-safe placeholder posture (D-11).** Overwrote the scaffold-default `robots.txt` (which allowed all crawling) with a `User-agent: * / Disallow: /` group, and added a well-formed `sitemap.xml` that exists as the mechanism but is deliberately not referenced from robots.txt while on `*.pages.dev`. No `google-site-verification` token, no JSON-LD (both deferred to Phase 6, D-12).
- **Security-headers baseline (T-01-01).** A project-root `_headers` applying to `/*`: a conservative same-origin CSP (`default-src 'self'`, `style-src 'self' 'unsafe-inline'` for Svelte scoped styles, `font-src 'self'` for the self-hosted WOFF2, `img-src 'self' data:`, `script-src 'self'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, `object-src 'none'`), plus `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a minimal `Permissions-Policy`. Verified copied into `.svelte-kit/cloudflare/_headers` by the adapter.
- **Branded favicon set + share card (D-10, T-01-07).** A joyful `favicon.svg` (brand-blue rounded tile, cream heart, yellow spark) rasterized via sharp to a 512px `favicon.png` and a 180px `apple-touch-icon.png` (flattened onto brand-blue for iOS masking), a Polish `site.webmanifest` (`name`/`short_name`, `theme_color #0369A1`, `background_color #FFFFFF`), and a 1200×630 `og-placeholder.png` (wordmark `Żłobek Gminny Stromiec` + descriptor, heart badge, decorative expressive blobs) — a shared `*.pages.dev` link now previews intentionally. `app.html` references the favicon/manifest/theme-color.
- **No dead footer link.** `src/routes/deklaracja-dostepnosci/+page.svelte` is a self-contained Polish "wkrótce" stub: a single `<h1>` `Deklaracja dostępności`, a `PLACEHOLDER`-marked body, a `<svelte:head>` Polish `<title>` + `noindex` meta, accessible-tier colors only, no `Seo.svelte` import. It inherits `prerender = true` and now prerenders to `deklaracja-dostepnosci.html`.

## Task Commits

1. **Task 1: robots.txt Disallow:/ + sitemap.xml scaffold** — `255cac0` (feat)
2. **Task 2: security-headers baseline + favicon set + branded OG card** — `fbb241b` (feat)
3. **Task 3: Polish accessibility-declaration stub route** — `9002d4d` (feat)

## Files Created/Modified

- `static/robots.txt` — `Disallow: /` for the placeholder (overwrote scaffold default)
- `static/sitemap.xml` — well-formed, single homepage entry, placeholder host, not advertised
- `_headers` (project root) — CSP/HSTS/nosniff/Referrer-Policy/X-Frame-Options/Permissions-Policy
- `static/favicon.svg` / `static/favicon.png` (512) / `static/apple-touch-icon.png` (180) — favicon set
- `static/site.webmanifest` — Polish PWA manifest, brand theme color
- `static/og-placeholder.png` — 1200×630 branded share card
- `src/routes/deklaracja-dostepnosci/+page.svelte` — Polish prerendered "wkrótce" stub
- `src/app.html` — favicon/manifest/theme-color `<link>`/`<meta>` refs
- `svelte.config.js` — dropped `/deklaracja-dostepnosci` from `KNOWN_FUTURE_ROUTES` (route now real)

## Decisions Made

- **`_headers` at project root, not `static/`.** The installed `@sveltejs/adapter-cloudflare` v7 explicitly errors when a `_headers` file sits in the assets (`static/`) dir and instead reads the project-root file, copying it into the build output and appending its own immutable-asset cache headers. The plan's `files_modified`/`key_links` assumed `static/_headers`; the root location is the correct adapter contract (see Deviations).
- **sharp-generated PNGs.** The favicon rasters and OG card are rendered once from SVG via the project's bundled sharp (rsvg + pango + freetype); the Polish wordmark uses system Arial (full `Ż`/`ł` coverage). The resulting PNGs are committed static assets, so there is no runtime/build dependency on the generation step or on any font being installed in CI.
- **Enforce the footer link.** With a real prerendered stub, leaving `/deklaracja-dostepnosci` in the prerender 404 allow-list would mask a genuine future regression, so it was removed (following Plan 02's explicit handoff instruction).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] adapter-cloudflare v7 requires `_headers` at the project root, not `static/`**
- **Found during:** Task 2 (`npm run build`)
- **Issue:** The plan specifies `static/_headers` (files_modified + key_links: "adapter-cloudflare copies static/_headers into the Pages deploy output"). The installed adapter v7 hard-errors: `The _headers file should be placed in the project root rather than the .../static directory`, aborting the build.
- **Fix:** Moved the file to the project root `_headers`. The adapter reads it, writes it to `.svelte-kit/cloudflare/_headers`, and appends its own asset-cache headers.
- **Files modified:** `_headers` (root) instead of `static/_headers`
- **Verification:** `npm run build` exits 0; `test -f .svelte-kit/cloudflare/_headers`; the security headers are present in the output file.
- **Committed in:** `fbb241b`

**2. [Rule 2 - Hygiene] Prerender allow-list still tolerated the now-built deklaracja route**
- **Found during:** Task 3
- **Issue:** `/deklaracja-dostepnosci` was in `svelte.config.js` `KNOWN_FUTURE_ROUTES` (added in Plan 02 to tolerate its 404). Now that the stub is real and prerenders, keeping it there would suppress a real future 404 on the footer's legally-sensitive link.
- **Fix:** Removed it from the allow-list (kept the five section routes still built in Plans 04–05).
- **Files modified:** `svelte.config.js`
- **Verification:** `npm run build` exits 0 and prerenders `deklaracja-dostepnosci.html` with the crawler enforcing the link.
- **Committed in:** `9002d4d`

---

**Total deviations:** 2 auto-fixed (1 blocking adapter-contract correction, 1 hygiene). No architectural changes, no user decisions required.

## Threat Mitigations (from plan `<threat_model>`)

- **T-01-01 (missing security headers, medium):** mitigated — `_headers` ships CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY` (+ `Permissions-Policy`, `object-src 'none'`, `form-action 'self'`), verified copied into `.svelte-kit/cloudflare`. Extended by Phases 2–4.
- **T-01-04 (placeholder indexing, low):** mitigated — `robots.txt Disallow: /` on `*.pages.dev` (D-11). The paired `Seo.svelte` `noindex` meta lands in Plan 03; the stub route already carries its own `noindex`.
- **T-01-07 (ugly share preview, low):** mitigated — branded 1200×630 `og-placeholder.png` + favicon set so shared links look intentional (D-10).

No new security surface beyond the plan.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. `_headers` and the static assets are same-origin config/data; the stub route is a static prerender.

## Known Stubs

- `src/routes/deklaracja-dostepnosci/+page.svelte` — **intentional** Polish "wkrótce" placeholder (marked with a `PLACEHOLDER` token). Resolves RESEARCH A4/Open Q2 (planner decision: stub, don't 404). The full WCAG-conformant *Deklaracja dostępności* is authored in **Phase 6** before launch. This stub exists solely so the footer link resolves; it does not block this plan's goal (deployment hygiene).
- `static/sitemap.xml` uses a **PLACEHOLDER** `*.pages.dev` host and a single homepage entry — the real custom-domain host + full URL set land at Phase 6 (D-11), consistent with the current noindex posture.

## Verification

- `robots.txt` contains `Disallow: /`; `sitemap.xml` well-formed with a homepage `<loc>`; no `google-site-verification`, no `application/ld+json`
- `_headers` carries CSP/HSTS/nosniff/Referrer-Policy/X-Frame-Options and is present in `.svelte-kit/cloudflare/_headers`
- Favicon set (`favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `site.webmanifest` with Polish name + `#0369A1`) present; `og-placeholder.png` confirmed 1200×630 (visually inspected — Polish diacritics render correctly)
- `/deklaracja-dostepnosci` prerenders (`deklaracja-dostepnosci.html` in the build output); no `Seo.svelte` import; carries a `PLACEHOLDER` token
- `npm run check` → 0 errors / 0 warnings; `npm run build` → exits 0

## Requirements Note

- **SITE-01 (Cloudflare deploy with git auto-deploys)** and **SITE-06 (all client-facing content Polish)** are the plan's frontmatter requirements. This plan **advances** both (deployment-hygiene artifacts; Polish manifest + stub + share card) but neither is fully realized here: SITE-01 completes when the live `*.pages.dev` deploy exists (a phase-level milestone), and SITE-06 completes when the visitor-facing homepage/section content lands (Plans 03–05). Consistent with Plan 01's judgment, they are intentionally **not** marked complete to avoid misrepresenting state.

## Next Phase Readiness

- The placeholder deployment is crawl-safe, ships a security-header baseline, previews professionally when shared, and has no dead footer link — the deployment-hygiene foundation Phases 2–6 extend.
- **Phase 2** extends the CSP for the Sveltia CMS `/admin` (GitHub OAuth frame/connect). **Phase 4** extends it for Cloudflare Turnstile (`script-src`/`frame-src challenges.cloudflare.com`) + Resend form posting. **Phase 6** flips `robots.txt` to allow-all, wires the real sitemap host, adds JSON-LD + GSC (D-12), and authors the full *Deklaracja dostępności* replacing this stub.

## Self-Check: PASSED

All 8 created files verified present on disk; all 3 task commits (`255cac0`, `fbb241b`, `9002d4d`) verified in git history; build output contains `_headers`, favicon set, `og-placeholder.png`, and the prerendered `deklaracja-dostepnosci.html`.

---
*Phase: 01-live-homepage-design-foundation*
*Completed: 2026-08-12*
