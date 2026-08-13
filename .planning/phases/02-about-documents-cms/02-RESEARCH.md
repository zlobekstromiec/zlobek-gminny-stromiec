# Phase 2: About, Documents & CMS - Research

**Researched:** 2026-08-13
**Domain:** Git-based CMS (Sveltia) on Cloudflare + SvelteKit content layer + build-time image pipeline + two new prerendered content pages (O nas, Dokumenty), Polish-only, WCAG 2.1 AA
**Confidence:** HIGH (stack, patterns, migration surface, image pipeline) / MEDIUM (Sveltia editor-chrome locale, OAuth-worker config specifics)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Phase boundary:** Staff self-edit the O nas page and manage downloadable documents through the git-based Sveltia CMS on the LIVE deployment, with no developer: full login (GitHub OAuth via self-hosted `sveltia-cms-auth` Worker) -> edit -> commit -> Cloudflare rebuild -> live loop, CMS admin presenting to staff entirely in Polish. In scope: ABOUT-01, ABOUT-02, DOCS-01, DOCS-02, CMS-01, CMS-02, CMS-03.

**Locked upstream (do NOT re-decide):** design system (`01-UI-SPEC.md` + Amendments v1.1/v1.2), stack (`STACK.md`), Sveltia + `sveltia-cms-auth` Worker + GitHub OAuth App under the `zlobekstromiec` Org, Polish-only product (SITE-06, CMS-03), placeholder-first content, copy rules (no emoji, no em dashes; en dash only in numeric ranges).

**O nas composition (ABOUT-01):**
- **D-01:** Sections = Misja, Wartości, Plan dnia, Kadra, PLUS a facility story (building/sala/plac zabaw with photos). Ordering + facility placement = Claude's discretion (UI-SPEC amendment may cover; UI hint yes).
- **D-02:** Kadra = group description (warm collective text + headcount by role: opiekunki, personel pomocniczy). No individual profiles, no staff photos.
- **D-03:** Plan dnia = single source, reused. ONE CMS-editable plan dnia dataset powers BOTH the homepage `DayPlan` component and the /o-nas section. Edit once, updates everywhere.
- **D-04:** Facility photos = stock/AI, environment-only (rooms, toys, playground; zero identifiable people), placeholder-marked, swapped in Phase 6.

**CMS editability model (ABOUT-02, CMS-01..03):**
- **D-05:** O nas content = strict structured fields (validated widgets), NOT a free-form page body: misja text, wartości list, plan dnia repeatable rows, kadra text + role counts, facility story text + image list.
- **D-06:** Forced-only migration from `site.ts`: ONLY O nas content, the dokumenty collection, and the shared plan dnia move into the CMS content layer this phase. `contact`, `keyFacts`, `perks`, recruitment strings, and `posts` STAY in `site.ts` until their own phases.
- **D-07:** Build-time image optimization pipeline lands this phase (AVIF/WebP + responsive sizes; tool choice = researcher's call — see recommendation below).
- **D-08:** Narrative fields allow limited rich text only: paragraphs, bold, links. No headings, no inline images, no tables.
- **D-09:** Placeholder tracking in CMS content = a Polish boolean field per entry (e.g. "Treść zastępcza (do potwierdzenia)" -> `placeholder: true`). Greppable for the Phase 6 launch gate. Code-side `// PLACEHOLDER:` comments continue unchanged.
- **D-10:** CMS admin lives at /admin (`static/admin/`); admin content itself is Polish (CMS-03).
- **D-11:** The verbatim core message STAYS hard-coded in `site.ts`, never CMS-editable.
- **D-12:** Publish feedback = the Polish instrukcja explains it (save -> wait ~2 minutes -> refresh). No status link. Makes a short Polish staff guide a Phase 2 deliverable (D-21).

**Dokumenty organization (DOCS-01/02):**
- **D-13 (DEFAULTED - confirm):** Categories = "Rekrutacja" + "Statut i uchwały", plus a dormant "RODO" dropdown value whose page group renders only once it contains documents.
- **D-14:** Row metadata = type + size + "wersja z DD.MM.RRRR". Size/type derivable at build time.
- **D-15:** Category assignment in CMS = fixed validated dropdown (staff cannot typo new categories; new category = one-line dev change).
- **D-16 (DEFAULTED - confirm):** Host our own copies of all documents via CMS uploads. Optionally add a per-document "Źródło (BIP)" external-link field. Seed the collection with the current BIP file set, placeholder-flagged.
- **D-17 (DEFAULTED - confirm):** Keep source file formats as-is: DOC/DOCX for fillable recruitment forms, PDF for uchwały/zarządzenia. Format badge per row from D-14.
- **D-18 (DEFAULTED - confirm):** Re-align homepage recruitment docs list (`site.ts` `recruitment.docs`) with real BIP names: "Wniosek o przyjęcie dziecka" (NOT "Karta zgłoszenia dziecka"), załączniki 1-6 (oświadczenia), oświadczenie o rezygnacji, regulamin rekrutacji. Three currently-listed docs do NOT exist on BIP (Regulamin organizacyjny, Upoważnienie do odbioru dziecka, Oświadczenia RODO) - drop or placeholder-flag pending client confirmation.

**Staff access & workflow (CMS-01, handover) - ALL DEFAULTED; confirm:**
- **D-19 (default):** Per-editor GitHub accounts (not shared): per-person audit trail, individually revocable, managed as `zlobekstromiec` Org members.
- **D-20 (default):** Direct publish to main (no editorial/draft workflow).
- **D-21 (default):** A short Polish instrukcja ships this phase (login, editing O nas, add/replace/remove documents, publish delay). Suggest `docs/instrukcja-cms.md`, printable.
- **D-22 (default):** Staff provisioning = invite as Org members with write access to the content repo.

### Claude's Discretion
- Content-layer file format and location (markdown + frontmatter vs YAML/JSON under `src/content/`), collection naming, Sveltia `config.yml` specifics.
- O nas section ordering/visual treatment within the locked design system (`/gsd-ui-phase 2` available).
- Image pipeline tool choice (D-07).
- Instrukcja format (D-21).
- CSP extension for /admin + the OAuth Worker.
- Image pipeline seed: current placeholder assets stay as-is unless trivially convertible.

### Deferred Ideas (OUT OF SCOPE)
- Żłobek-specific klauzula informacyjna RODO must be AUTHORED (absent from BIP) -> Phase 4; a downloadable version can then join the "RODO" category.
- PDF versions of the DOC/DOCX recruitment forms -> Phase 6.
- Statut amendment pending on BIP (draft ~07.08.2026) -> re-check doc set before launch (Phase 6).
- Suggest to the Gmina that the BIP żłobek section cross-link the statut/opłaty uchwały (courtesy note, outside scope).
- "Ustawienia strony" site-facts singleton (contact, keyFacts, recruitmentOpen CMS-editable) -> Phase 3/4.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ABOUT-01 | A visitor can read the O nas page (misja, wartości, plan dnia, kadra) | New prerendered `/o-nas` route composed from a CMS singleton (JSON); DayPlan reused per D-03. Structure + tokens inherited from `01-UI-SPEC.md`. |
| ABOUT-02 | Staff can edit the O nas content via the CMS | Sveltia singleton with strict widgets (string/text/markdown/list/boolean); Polish labels+hints on every field. |
| DOCS-01 | A visitor can browse and download documents (regulaminy, formularze) | New prerendered `/dokumenty` route; folder collection of JSON entries grouped by `select` category; size/type computed at build via `fs.statSync` + extension. |
| DOCS-02 | Staff can upload, replace, remove documents via the CMS | Sveltia `file` widget writing into `static/dokumenty/`; git commit = replace/remove; no developer. |
| CMS-01 | Staff log into git-based CMS (Sveltia) via GitHub OAuth (self-hosted auth Worker) | `sveltia-cms-auth` Cloudflare Worker + GitHub OAuth App under Org `zlobekstromiec`; `backend.base_url` -> worker. Verify FULL loop on LIVE `*.pages.dev`. |
| CMS-02 | CMS edits commit to the repo and trigger a Cloudflare rebuild/deploy | Already proven in Phase 1 (push-to-main auto-deploy). Sveltia commit = a push. |
| CMS-03 | CMS admin portal is Polish (labels, hints, help, editor UI where supported) | Field `label`/`hint`/help = Polish (config). **Editor chrome NOT available in Polish (en/ja only)** — see Key Findings + Assumptions Log. The "where supported" wording covers this; needs client acknowledgement. |
</phase_requirements>

## Summary

Phase 2 adds two static content pages (`/o-nas`, `/dokumenty`) and stands up the git-based CMS that lets non-technical żłobek staff edit them without a developer. The heavy lifting is not the pages — it is (1) the **content-layer migration** of three things out of `site.ts` (D-06: `dayPlan`, the O nas content that does not yet exist, and the dokumenty set) into CMS-managed files, (2) the **CMS + OAuth infrastructure** (Sveltia bundle at `/admin`, a separate `sveltia-cms-auth` Cloudflare Worker, a GitHub OAuth App under the `zlobekstromiec` Org), and (3) a **build-time image pipeline** that keeps staff photo uploads from wrecking mobile Core Web Vitals. All three are well-trodden patterns; the risk is in the seams (CSP for the externally-loaded admin app, the acceptance-test rewrite forced by D-18, and one hard product constraint on CMS-03).

The single most important finding: **the Sveltia editor chrome (buttons, menus, "Save"/"Publish") ships only in English and Japanese — Polish is not an available UI locale** [VERIFIED: deepwiki + WebSearch]. What *is* fully Polish-controllable is every collection/field `label`, `hint`, and help string via `config.yml`. CMS-03's own wording ("...and the editor UI where supported") anticipates exactly this gap, so we remain compliant by making all config-driven text Polish and accepting English chrome — but the client must acknowledge it, and the D-21 instrukcja should carry annotated screenshots so Polish-only staff can operate the English shell.

**Primary recommendation:** Store CMS content as **JSON files under `src/lib/content/`** (native Vite import, zero parser dependency, prerender-friendly), render the few limited-rich-text fields (D-08) with **`marked`** at build, and optimize CMS-committed images with **`@sveltejs/enhanced-img`** via `import.meta.glob('...', { query: { enhanced: true }, eager: true })` — pointing Sveltia's `media_folder` at a Vite-processed `src/` path, and additionally enabling Sveltia's own upload-time `transformations` (webp + max size) as the first line of defence against multi-MB commits. Self-host the Sveltia bundle (do not hot-link unpkg) so `/admin` CSP can stay `script-src 'self'` for a public body.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Render `/o-nas`, `/dokumenty` | Static/CDN (SvelteKit prerender) | Build (SvelteKit+Vite) | Content pages never change between builds; `prerender = true` inherited via `+layout.ts`. |
| Read CMS content into pages | Build (Vite import / `import.meta.glob`) | — | Git is the content store; content baked into HTML at build, zero runtime reads. |
| Optimize uploaded images | Build (enhanced-img/Sharp) | CMS admin (Sveltia upload transform) | Two-layer: Sveltia caps/converts on upload; enhanced-img emits responsive AVIF/WebP srcset at build. |
| Staff edit content | CMS admin SPA (browser, Sveltia) | GitHub API | Client-side app commits directly to the repo via OAuth token; no app server. |
| Authenticate editors | OAuth proxy Worker (`sveltia-cms-auth`) | GitHub OAuth App | Cloudflare has no Netlify Git Gateway; code->token exchange must be server-side. |
| Publish (commit -> live) | Cloudflare Pages git-integration | — | Push to `main` auto-builds+deploys (proven Phase 1). |
| Compute document size/type | Build (Node `fs`/extension) | — | Derivable at prerender; no need to store in the CMS entry (D-14). |

## Standard Stack

### Core (already installed — no change)
| Library | Version (installed) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sveltejs/kit | ^2.63.0 | App framework, prerender, routing | Org standard; `prerender = true` content routes. [VERIFIED: package.json] |
| svelte | ^5.56.1 | UI compiler (runes) | Locked stack. [VERIFIED: package.json] |
| @sveltejs/adapter-cloudflare | ^7.2.8 | Deploy adapter | SvelteKit routes ARE the Pages Functions. [VERIFIED: package.json] |
| tailwindcss + @tailwindcss/vite | ^4.3.0 | Styling (`@theme` tokens in `src/app.css`) | No `tailwind.config.js`; tokens locked in UI-SPEC. [VERIFIED: package.json] |
| @axe-core/playwright + @playwright/test | ^4.13.0 / ^1.62.1 | a11y + E2E acceptance tests | Existing per-route pattern in `tests/`. [VERIFIED: package.json] |

### Supporting (NEW this phase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sveltia/cms | 0.189.0 | Git-based CMS admin SPA loaded at `/admin` | The CMS itself; self-host the `dist/sveltia-cms.js` bundle rather than hot-link a CDN. [VERIFIED: npm registry + Context7] |
| @sveltejs/enhanced-img | 0.11.0 | Build-time responsive AVIF/WebP `srcset` for images | O nas facility photos (D-04, D-07); glob-import CMS-committed images. Pulls `sharp` transitively. [VERIFIED: npm registry — OK] |
| marked | 18.0.9 | Render limited-rich-text markdown fields (D-08) to HTML at build | Misja / wartości / kadra / facility narrative fields authored via Sveltia's `markdown` widget. [VERIFIED: npm registry — see legitimacy audit] |

Sveltia is loaded as a browser bundle at `/admin`, not `import`ed into the SvelteKit app — so it does not enter the site's JS graph and never ships to parents. Install it as a devDependency only to obtain and pin the `dist/` bundle you self-host.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON content files | Markdown + frontmatter (`gray-matter`/`mdsvex`) | Markdown suits free-form bodies; D-05 mandates *strict structured fields*, so JSON (native Vite import, no parser, type-safe) is the better fit. Keep narrative sub-fields as markdown *strings* rendered by `marked`. |
| @sveltejs/enhanced-img | vite-imagetools | imagetools is more flexible but lower-level; enhanced-img is the first-party SvelteKit wrapper, simpler `<enhanced:img>` ergonomics, same Sharp engine. Both flagged "too-new" only on version recency. |
| marked | mdsvex, markdown-it | mdsvex is Svelte-in-markdown (overkill for bold/links); markdown-it is heavier. `marked` is smallest + build-time-only (bundle size irrelevant). Restrict Sveltia's markdown buttons + sanitize/limit output. |
| Self-hosted Sveltia bundle | unpkg/CDN `<script>` | CDN hot-link is a supply-chain risk for a public body and complicates `/admin` CSP. Self-host -> `script-src 'self'`. |

**Installation:**
```bash
npm i -D @sveltia/cms @sveltejs/enhanced-img
npm i marked
# sharp is pulled in transitively by @sveltejs/enhanced-img; if the platform needs an explicit
# native binary, `npm i -D sharp` (0.35.3) matching the build (Node 22.23.2 via asdf).
```

**Version verification (2026-08-13):**
- `@sveltia/cms` 0.189.0 — published 2026-08-13 (actively developed) [VERIFIED: npm view]
- `@sveltejs/enhanced-img` 0.11.0 — published 2026-06-18, 61k weekly downloads [VERIFIED: npm view]
- `marked` 18.0.9 — published 2026-08-04, 63M weekly downloads [VERIFIED: npm view]
- `sharp` 0.35.3 [VERIFIED: npm view]

## Package Legitimacy Audit

| Package | Registry | Age / Published | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------------|-----------|-------------|---------|-------------|
| @sveltia/cms | npm | 2026-08-13 (release cadence) | active | github.com/sveltia/sveltia-cms | OK | Approved (locked in STACK.md) |
| @sveltejs/enhanced-img | npm | 2026-06-18 | 61k/wk | github.com/sveltejs/kit | OK | Approved |
| gray-matter | npm | 2021-04-24 | 8.2M/wk | github.com/jonschlinkert/gray-matter | OK | Not adopted (JSON chosen) — available if markdown files preferred |
| marked | npm | 2026-08-04 | 63.4M/wk | github.com/markedjs/marked | SUS (too-new) | Approved — "too-new" = recent version of a decade-old, 63M-downloads/wk package; identity not in doubt |
| vite-imagetools | npm | 2026-08-08 | 287k/wk | github.com/JonasKruckenberg/imagetools | SUS (too-new) | Not adopted (enhanced-img chosen); same false-positive if needed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `marked`, `vite-imagetools` — both flagged solely on "too-new" (a fresh version publish of a long-established, high-download package with a reputable source repo). This is a version-recency signal, not a package-identity risk. Recommendation: the planner may proceed without a human-verify checkpoint given the download volume + repo age, but pin the exact version in `package-lock.json`.

## Architecture Patterns

### System Architecture Diagram

```
                         BUILD TIME (Cloudflare Pages CI)
   ┌───────────────────────────────────────────────────────────────────┐
   │  Git repo (main)                                                    │
   │   src/lib/content/o-nas.json          ── import ──►                 │
   │   src/lib/content/dokumenty/*.json     import.meta.glob             │
   │   src/lib/content/day-plan.json   ─────────────────►  SvelteKit +   │
   │   src/lib/assets/uploads/*.{jpg,png}  ─ enhanced ──►  Vite build    │
   │   static/dokumenty/*.{pdf,doc,docx}  ─ fs.statSync ►  (SSG)         │
   │                                                          │ emits    │
   └──────────────────────────────────────────────────────────┼─────────┘
             ▲ commit (push)                                    ▼
   ┌─────────┼────────────────────────┐        ┌───────────────────────────┐
   │ RUNTIME: CMS admin (browser)     │        │ RUNTIME: Cloudflare edge  │
   │  /admin  (self-hosted Sveltia)   │        │  Static HTML/CSS/img (CDN)│
   │   • config.yml (Polish labels)   │        │   /o-nas   /dokumenty     │
   │   • talks to GitHub API          │        │   (pure prerendered HTML) │
   │        │ OAuth token             │        │   + optimized AVIF/WebP   │
   │        ▼                         │        │   + /dokumenty/*.pdf files│
   │  sveltia-cms-auth Worker         │        └───────────────────────────┘
   │   (OAuth code→token, separate    │
   │    deploy; secrets:              │        external:  GitHub OAuth App
   │    GITHUB_CLIENT_ID/SECRET)      │──────►  (Org: zlobekstromiec)
   └──────────────────────────────────┘
```

Data flow is strictly one-way at build time: **Git is the source of truth; the live pages are a derived artifact.** No runtime content reads, no database (consistent with Phase 1).

### Recommended Project Structure (additions)
```
src/
├── lib/
│   ├── content/
│   │   ├── site.ts               # KEEPS: contact, keyFacts, perks, recruitment strings, coreMessage, posts (D-06, D-11)
│   │   ├── day-plan.json         # MIGRATED from site.ts dayPlan (D-03) — shared source
│   │   ├── o-nas.json            # NEW singleton: misja, wartosci[], kadra, facility story, placeholder bool (D-05)
│   │   └── dokumenty/            # NEW folder collection: one .json per document (D-13..D-18)
│   │       └── *.json
│   └── assets/
│       └── uploads/              # NEW: Sveltia media_folder for O nas images (Vite-processed, enhanced-img)
├── routes/
│   ├── o-nas/+page.svelte        # NEW route (remove from KNOWN_FUTURE_ROUTES)
│   └── dokumenty/+page.svelte    # NEW route (remove from KNOWN_FUTURE_ROUTES)
static/
├── admin/
│   ├── index.html                # loads self-hosted /admin/sveltia-cms.js
│   ├── sveltia-cms.js            # self-hosted, pinned bundle (from @sveltia/cms dist)
│   └── config.yml                # backend + collections + Polish labels/hints
└── dokumenty/                    # NEW: uploaded PDF/DOC/DOCX files (served as-is)
```
Note: **document files live in `static/dokumenty/`** (served verbatim at `/dokumenty/<file>`); **image uploads live in `src/lib/assets/uploads/`** so Vite/enhanced-img can process them. These are two different Sveltia media targets — configure per-collection `media_folder` accordingly.

### Pattern 1: Structured singleton read at build
**What:** O nas is one JSON file with typed fields; the page imports it directly. Narrative fields are markdown strings rendered by `marked`.
**When to use:** Strict-schema content (D-05) that must not break the build on a bad edit.
**Example:**
```svelte
<script lang="ts">
  // src/routes/o-nas/+page.svelte
  import onas from '$lib/content/o-nas.json';
  import { marked } from 'marked';           // build-time render of limited rich text (D-08)
  const misjaHtml = marked.parseInline(onas.misja); // inline = no block headings leak in
</script>
```
Keep `marked` constrained to the D-08 subset: prefer `parseInline` for single-paragraph fields, and either sanitize output or restrict Sveltia's `markdown` widget `buttons`/`modes` to bold + link only, so no headings/images/tables/raw-HTML ever reach the renderer.

### Pattern 2: enhanced-img over git-CMS images
**What:** enhanced-img is a *build* plugin — it optimizes files present on disk at build. Because Sveltia is a **git** CMS, uploaded images ARE committed into the repo and ARE on disk at build. So they can be optimized (unlike a remote headless-CMS/CDN image path).
**When to use:** Any git-CMS image render (facility photos, D-04/D-07).
**Example:**
```svelte
<script lang="ts">
  // Statically-analyzable glob; keys are file paths, values are processed <img> data.
  const images = import.meta.glob('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
    query: { enhanced: true },
    eager: true,
    import: 'default'
  });
  // Match a CMS entry's stored filename to its processed module:
  const pic = images[`/src/lib/assets/uploads/${onas.facility.image}`];
</script>
<enhanced:img src={pic} alt={onas.facility.alt} sizes="(min-width:768px) 50vw, 100vw" />
```
Add `enhancedImages()` (from `@sveltejs/enhanced-img`) to `vite.config.ts` **before** `sveltekit()`.

### Pattern 3: Two-layer image defence
**What:** (a) Sveltia `media_libraries.default.config.transformations` converts + caps on upload (e.g. `format: webp, quality: 82, width: 1600, max_file_size`), preventing multi-MB commits; (b) enhanced-img emits responsive AVIF/WebP `srcset` at build. Layer (a) protects the repo; layer (b) protects mobile LCP.
[CITED: Context7 /sveltia/sveltia-cms — `media_libraries.default.config.transformations`]

### Pattern 4: Dormant category renders only when populated (D-13)
**What:** The `/dokumenty` page groups entries by `select` category; the "RODO" group iterates its filtered array and renders nothing (no heading) when empty. No special-casing — an empty group is simply not emitted.

### Anti-Patterns to Avoid
- **Netlify `git-gateway` backend** — does not exist on Cloudflare; use `backend: github` + the auth Worker (Pitfall 7).
- **Free-text CMS fields where structure matters** — a bad edit breaks the prod build (Pitfall 8). Use validated widgets + `required`.
- **Hot-linking the Sveltia CDN bundle** — supply-chain + CSP friction. Self-host + pin.
- **Referencing raw `static/uploads` images** — bypasses the pipeline; staff phone photos tank LCP (Pitfall 9).
- **Rendering unconstrained markdown** — D-08 forbids headings/images/tables; constrain the widget AND the renderer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub OAuth code->token exchange | A custom auth endpoint | `sveltia-cms-auth` Worker | Purpose-built, one-file, holds the client secret server-side; Cloudflare has no Git Gateway. |
| Content editing UI for staff | A bespoke admin form | Sveltia CMS + `config.yml` | Validated widgets, media library, git commits, i18n content — free. |
| Responsive image generation | A manual Sharp script | `@sveltejs/enhanced-img` | Emits AVIF/WebP + `srcset` + width/height (no CLS) at build. |
| Markdown -> HTML for narrative fields | A regex/string replacer | `marked` | Handles the bold/link subset correctly; build-time only. |
| Document size/type display | Hardcoding sizes in the CMS entry | Node `fs.statSync` + extension at build (D-14) | Always accurate, never drifts when a file is replaced. |

**Key insight:** Every "backend" seam here already has a maintained, free, Cloudflare-appropriate solution. The only bespoke code is the two page components, the content JSON schema, and the `config.yml` mapping.

## Runtime State Inventory

> This IS a migration phase (D-06: forced migration of content out of `site.ts` into the CMS content layer, plus new external OAuth infrastructure).

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | No database. Content currently lives as TS constants in `src/lib/content/site.ts`: `dayPlan` (7 rows) and `recruitment.docs` (6 rows) migrate this phase (D-03, D-18). O nas content does not exist yet (net-new). `contact`/`keyFacts`/`perks`/`recruitment` strings/`posts`/`coreMessage` STAY (D-06, D-11). | Code migration: move `dayPlan` -> `day-plan.json`; re-point `DayPlan.svelte` and the new /o-nas section at it. Author `o-nas.json` + `dokumenty/*.json`. Re-align `recruitment.docs` to real BIP names (D-18) and wire the homepage docs panel to the dokumenty collection. |
| Live service config | NEW: GitHub OAuth App (Org `zlobekstromiec`) with callback = `<worker-url>/callback`. NEW: `sveltia-cms-auth` Cloudflare Worker (separate deploy from Pages). `svelte.config.js` `KNOWN_FUTURE_ROUTES` still lists `/o-nas` and `/dokumenty` — must be REMOVED when the routes land so the crawler enforces them. `_headers` needs an `/admin/*` CSP block. | Provision OAuth App + Worker (Cloudflare + GitHub Org admin — accounts exist per CLAUDE.md). Edit `svelte.config.js` allow-list + `_headers`. Both are code/dashboard, in git except Worker secrets. |
| OS-registered state | None — no cron/task/daemon involvement. | None. Verified: no scheduler or OS registration in this project. |
| Secrets / env vars | NEW Worker secrets: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and access-control (`ALLOWED_DOMAINS` / `site_domain`). These live on the `sveltia-cms-auth` Worker (Cloudflare dashboard / `.dev.vars`), NOT in the Pages project and NOT in git. Phase 1 `app.d.ts` `Env` is still empty — this phase does not add Pages secrets (forms are Phase 4). | Set Worker secrets via Cloudflare dashboard; document in the deploy notes. No Pages env change. |
| Build artifacts / installed packages | Self-hosted `static/admin/sveltia-cms.js` bundle must be refreshed when `@sveltia/cms` is bumped (it will NOT auto-update — it is a committed static file). `sharp` native binary must match the CI build platform (Node 22.23.2 / linux). | Add a documented step (or npm script) to copy `node_modules/@sveltia/cms/dist/sveltia-cms.js` -> `static/admin/` on version bumps. Verify `sharp` installs in CI. |

**The canonical question — after every repo file is updated, what still holds the old string?** Nothing OS/DB-side. The two live-config items (OAuth App + Worker) are net-new provisioning, not stale state. The one durable gotcha is the **self-hosted Sveltia bundle**, which is a committed artifact that must be manually refreshed on upgrade.

## Common Pitfalls

### Pitfall 1: Acceptance-test rewrite forced by D-18 (highest-risk seam)
**What goes wrong:** `tests/home.spec.ts` currently hard-asserts **exactly 6 `.doc-row`** and the link name **`/Karta zgłoszenia dziecka\s+PDF/`** (lines 93-100). D-18 renames "Karta zgłoszenia dziecka" -> "Wniosek o przyjęcie dziecka", changes the document set to the real BIP list, and drops three non-existent docs. The homepage recruitment docs panel is re-sourced from the dokumenty collection. **The existing test will fail and MUST be updated in lockstep**, not weakened silently.
**Why it happens:** The homepage test encodes Phase 1 placeholder copy as executable acceptance criteria; D-18 legitimately changes that copy.
**How to avoid:** Treat the `home.spec.ts` docs-panel assertions as a planned deliverable of the D-18 task. Update the expected names/count to the real BIP set, keep the "meta inside the link" assertion (WCAG), and re-run the full suite. Document the change as a UI-SPEC-consistent copy update (the file's header forbids weakening assertions except in lockstep with an approved change — D-18 is that change).
**Warning signs:** A plan that adds `/dokumenty` without touching `home.spec.ts`; a green suite that still asserts "Karta zgłoszenia".

### Pitfall 2: CMS-03 cannot make the editor chrome Polish
**What goes wrong:** Success criterion 5 reads "the CMS admin portal presents to staff in Polish." Sveltia's UI chrome is **English/Japanese only** [VERIFIED]. Shipping and *then* discovering the Save/Publish buttons are English looks like a missed requirement.
**Why it happens:** Assuming a config `locale` forces the whole UI to Polish. It does not — UI locale is a per-user localStorage setting limited to shipped translations; content field labels are separate.
**How to avoid:** Make every `label`/`hint`/help string Polish in `config.yml` (fully supported). Accept English chrome under CMS-03's "where supported" clause. Add a `checkpoint:human-verify` for client acknowledgement, and put annotated screenshots in the D-21 instrukcja so Polish-only staff can navigate. Re-verify Sveltia's locale list at build time (fast-moving project — Polish may land).
**Warning signs:** A plan asserting "CMS UI in Polish" without qualification.

### Pitfall 3: /admin CSP breaks the CMS (external app outside SvelteKit)
**What goes wrong:** `/admin` is static HTML *outside* SvelteKit routing, so `kit.csp` in `svelte.config.js` does NOT cover it. The Sveltia SPA needs to talk to `api.github.com` and the auth Worker, load its bundle, use inline styles, and open an OAuth popup. A too-strict or missing `/admin` policy silently breaks login/commit.
**Why it happens:** Teams extend `svelte.config.js` CSP (which governs prerendered SvelteKit pages) and forget `/admin` is served by the `_headers` file's path rules.
**How to avoid:** Add a path-scoped `/admin/*` block in `_headers` (the file already anticipates this): allow `script-src 'self'` (self-hosted bundle), `connect-src` for `https://api.github.com` + the worker origin + Sveltia's remote services if used, `style-src 'unsafe-inline'`, `img-src` for media, and `frame-src`/`form-action` for the OAuth flow. Keep the SvelteKit-page CSP in `svelte.config.js` untouched.
**Warning signs:** Login popup opens then errors; commits fail with a CSP violation in the console.

### Pitfall 4: enhanced-img cannot see `static/` images
**What goes wrong:** Pointing Sveltia's image `media_folder` at `static/uploads` means Vite never processes them — enhanced-img can't optimize, and `import.meta.glob` returns nothing useful.
**Why it happens:** `static/` is copied verbatim; only `src/`-rooted assets go through Vite.
**How to avoid:** Put **image** uploads under `src/lib/assets/uploads/` (Vite-processed) and glob-import with `{ query: { enhanced: true } }`. Put **document** uploads (PDF/DOC) under `static/dokumenty/` (served as-is — they are not images). Two separate media targets.
**Warning signs:** Images render full-size; no `<picture>`/`srcset` in output HTML.

### Pitfall 5: A bad staff edit breaks the production build
**What goes wrong:** A missing required field or malformed entry fails `vite build`, taking the whole site down until a developer fixes it (Pitfall 8, SUMMARY.md).
**How to avoid:** Strict widgets + `required: true` on every field (D-05); `select` (not string) for category (D-15); `boolean` for placeholder (D-09). Cloudflare keeps the last good deploy — document rollback. Consider a lightweight build-time schema check that fails with a clear message.
**Warning signs:** Free-text where a `select`/`datetime`/`boolean` belongs; no `required` flags.

## Code Examples

### Sveltia `config.yml` — GitHub backend + Polish-labelled collections (D-05, D-13..D-18)
```yaml
# static/admin/config.yml
# Source: Context7 /sveltia/sveltia-cms configuration + sveltia-cms-auth README
backend:
  name: github
  repo: zlobekstromiec/zlobek-gminny-stromiec
  branch: main
  base_url: https://sveltia-cms-auth.<subdomain>.workers.dev   # the OAuth proxy Worker (CMS-01)

# Image uploads only — Vite-processed path so enhanced-img can optimize (D-07).
media_folder: src/lib/assets/uploads
public_folder: /src/lib/assets/uploads
media_libraries:
  default:
    config:
      max_file_size: 5000000          # reject multi-MB originals (Pitfall 9)
      transformations:
        jpeg: { format: webp, quality: 82, width: 1600 }
        png:  { format: webp, quality: 82, width: 1600 }

singletons:
  - name: o_nas
    label: 'O nas'
    file: src/lib/content/o-nas.json
    fields:
      - { name: misja, label: 'Misja', widget: markdown, buttons: [bold, link], hint: 'Krótki opis misji żłobka. Dozwolone: pogrubienie i odnośniki.' }
      - name: wartosci
        label: 'Wartości'
        widget: list
        fields:
          - { name: tytul, label: 'Tytuł wartości', widget: string }
          - { name: opis, label: 'Opis', widget: text }
      - { name: kadra_opis, label: 'Kadra — opis', widget: markdown, buttons: [bold, link] }
      - { name: kadra_opiekunki, label: 'Liczba opiekunek', widget: number, value_type: int }
      - { name: kadra_personel, label: 'Personel pomocniczy (liczba)', widget: number, value_type: int }
      - { name: obiekt_opis, label: 'O budynku', widget: markdown, buttons: [bold, link] }
      - { name: obiekt_zdjecia, label: 'Zdjęcia (budynek, sala, plac zabaw)', widget: list, field: { name: plik, label: 'Zdjęcie', widget: image } }
      - { name: placeholder, label: 'Treść zastępcza (do potwierdzenia)', widget: boolean, default: true }

collections:
  - name: dokumenty
    label: 'Dokumenty'
    label_singular: 'Dokument'
    folder: src/lib/content/dokumenty
    create: true
    extension: json
    media_folder: /static/dokumenty      # per-collection: files served verbatim
    public_folder: /dokumenty
    fields:
      - { name: nazwa, label: 'Nazwa dokumentu', widget: string }
      - name: kategoria
        label: 'Kategoria'
        widget: select                    # fixed dropdown, no typos (D-15)
        options:
          - { label: 'Rekrutacja', value: 'rekrutacja' }
          - { label: 'Statut i uchwały', value: 'statut' }
          - { label: 'RODO', value: 'rodo' }
      - { name: plik, label: 'Plik', widget: file }
      - { name: wersja, label: 'Wersja z dnia', widget: datetime, date_format: 'DD.MM.YYYY', time_format: false }
      - { name: zrodlo_bip, label: 'Źródło (BIP) — opcjonalnie', widget: string, required: false }
      - { name: placeholder, label: 'Treść zastępcza (do potwierdzenia)', widget: boolean, default: true }
```
Note: exact widget option names (`buttons`, `value_type`, `date_format`) should be re-checked against the pinned `@sveltia/cms` version at plan/build time; Sveltia is Decap-config-compatible but ships its own extensions. [CITED: Context7 /sveltia/sveltia-cms]

### `/admin/index.html` — self-hosted bundle
```html
<!doctype html>
<html lang="pl">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Panel redakcyjny — Żłobek Gminny w Stromcu</title></head>
  <body><script src="/admin/sveltia-cms.js"></script></body>  <!-- self-hosted, pinned -->
</html>
```

### Build-time document size/type (D-14)
```ts
// Compute in a +page.server.ts or a small build step; runs at prerender.
import { statSync } from 'node:fs';
function fileMeta(publicPath: string) {
  const bytes = statSync(`static${publicPath}`).size;
  const ext = publicPath.split('.').pop()!.toUpperCase();      // PDF / DOCX
  const kb = Math.round(bytes / 1024);
  return { type: ext, size: kb >= 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB` };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Decap CMS + Netlify Git Gateway | Sveltia CMS + self-hosted `sveltia-cms-auth` Worker | Ongoing (Cloudflare has no Git Gateway) | Faster, better media UX; must deploy the OAuth Worker (Pitfall 7). |
| `base_url` OAuth-worker config | Sveltia also supports inline `app_id`/`app_secret` (GitHub App mode) | 2026 Sveltia | Locked decision = OAuth App + worker (`base_url`); the App mode is an alternative, not adopted. |
| CDN hot-link of CMS bundle | Self-hosted pinned bundle | Best practice for public bodies | Removes supply-chain + CSP friction. |
| Runtime image services | Build-time enhanced-img over git-committed uploads | SvelteKit `enhanced-img` maturity | Free, zero runtime cost; works because git-CMS commits images to disk. |

**Deprecated/outdated:**
- MailChannels free sending (Phase 4 concern, not this phase) — dead since 2024.
- Any Sveltia tutorial using `backend: git-gateway`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Sveltia editor chrome has no Polish locale (en/ja only); field labels/hints are separately Polish-configurable | CMS-03, Pitfall 2 | If Polish chrome exists now, CMS-03 is fully met with no caveat — lower risk (better outcome). If MORE locales are missing than assumed, instrukcja screenshots matter more. Re-verify at build. [VERIFIED via deepwiki+WebSearch, but Sveltia moves fast] |
| A2 | D-13/D-16/D-17/D-18 and all staff-access defaults (D-19..D-22) are accepted | User Constraints, DOCS | These were DEFAULTED while the user was away (CONTEXT footer). If the client rejects "host our own copies" or the category taxonomy, the collection schema + seed change. Confirm before/at planning. |
| A3 | `zlobekstromiec` Org + Cloudflare account admin access is available to create the OAuth App and deploy the Worker | Runtime State, CMS-01 | If access is blocked, CMS-01 (live-loop verification) cannot complete this phase. |
| A4 | Storing content as JSON (not markdown) satisfies D-05/Claude's-discretion | Standard Stack, Pattern 1 | Low — discretion explicitly grants file-format choice; JSON is the simplest correct option. |
| A5 | Sveltia's `media_libraries.transformations` + per-collection `media_folder` behave as documented on the pinned version | Pattern 3, config example | Medium — Sveltia config surface evolves; verify exact keys against the installed 0.189.0 at build. |
| A6 | Exact repo name is `zlobekstromiec/zlobek-gminny-stromiec` | config example | Low — from STATE.md [01-05]; confirm the slug when writing `config.yml`. |

**If this table is non-empty:** A1, A2, A3, A5 warrant confirmation/verification before or during planning (A2/A3 are client/access gates; A1/A5 are re-verify-at-build).

## Open Questions

1. **Does the current Sveltia release include a Polish UI locale?**
   - What we know: as of 2026-08-13, docs list English + Japanese only.
   - What's unclear: Sveltia ships frequently; Polish may be added.
   - Recommendation: re-check the shipped locale list against the pinned bundle at build; regardless, ship Polish labels/hints and add the client-acknowledgement checkpoint.

2. **Which of the three "does-not-exist-on-BIP" homepage docs (Regulamin organizacyjny, Upoważnienie do odbioru dziecka, Oświadczenia RODO) to drop vs placeholder-flag? (D-18)**
   - What we know: they are not on BIP; RODO klauzula is authored in Phase 4.
   - Recommendation: drop from the homepage docs panel now; the RODO category stays dormant until Phase 4. Confirm with client (A2).

3. **Draft vs direct-publish and per-editor vs shared accounts (D-19/D-20)** — defaulted; confirm at handover.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node (asdf-pinned) | build, sharp native binary | ✓ | 22.23.2 | — |
| npm | install new deps | ✓ | (with Node) | — |
| Wrangler | deploy the auth Worker + local emulation | ✓ | ^4.97.0 (devDep) | — |
| Cloudflare account (Pages + Workers) | deploy `sveltia-cms-auth` Worker | ✓ (per CLAUDE.md accounts) | — | — |
| GitHub Org `zlobekstromiec` admin | create OAuth App, manage editor access | ✓ (per CLAUDE.md, owner `devzlobekstromiec`) | — | — |
| sharp (enhanced-img engine) | build-time image optimization | pulled transitively | 0.35.3 | explicit `npm i -D sharp` if CI needs it |

**Missing dependencies with no fallback:** none identified — all infrastructure exists per project accounts.
**Provisioning items (not "missing", but must be created this phase):** GitHub OAuth App + `sveltia-cms-auth` Worker deploy (both gate CMS-01 live-loop verification).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.62 + `@axe-core/playwright` 4.13 |
| Config file | `playwright.config.*` (existing; per-route specs in `tests/`) |
| Quick run command | `npx playwright test tests/o-nas.spec.ts` (single route while iterating) |
| Full suite command | `npm run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ABOUT-01 | `/o-nas` renders misja, wartości, plan dnia, kadra, facility | e2e + axe | `npx playwright test tests/o-nas.spec.ts` | ❌ Wave 0 |
| ABOUT-01 (D-03) | homepage DayPlan + /o-nas render the SAME plan dnia source | e2e | assert identical rows on both routes | ❌ Wave 0 |
| DOCS-01 | `/dokumenty` lists documents grouped by category with size/type/wersja; download links resolve; RODO group hidden when empty | e2e + axe | `npx playwright test tests/dokumenty.spec.ts` | ❌ Wave 0 |
| DOCS-01 | each doc link points at a real `static/dokumenty/*` file (no 404) | e2e | assert `href` + response 200 | ❌ Wave 0 |
| D-18 | homepage recruitment docs panel shows the real BIP names/count | e2e | **UPDATE** `tests/home.spec.ts` lines 93-100 | ⚠️ exists, must change |
| CMS-01/02 | login -> edit -> commit -> rebuild -> live on `*.pages.dev` | manual/UAT | manual — OAuth loop not CI-automatable | manual-verify |
| CMS-03 | field labels/hints render in Polish; chrome-locale caveat acknowledged | manual/UAT | visual check + client sign-off | manual-verify |
| A11Y (SITE-04) | no WCAG 2.1 AA violations on both new routes | axe | in the two route specs | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run check && npx playwright test <the-route-spec>`
- **Per wave merge:** `npm run test` (full suite, incl. updated `home.spec.ts`)
- **Phase gate:** full suite green + manual live-loop UAT before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `tests/o-nas.spec.ts` — covers ABOUT-01 + D-03 shared-source + axe
- [ ] `tests/dokumenty.spec.ts` — covers DOCS-01 (+DOCS-02 surface) + axe
- [ ] Update `tests/home.spec.ts` — D-18 doc-panel names/count (lockstep, not weakening)
- [ ] No new framework install needed (Playwright + axe already present)

## Security Domain

> `security_enforcement: true`, ASVS L1. No forms this phase (Phase 4), so most input/transport surface is out of scope; the live surface is the CMS admin + committed uploads.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | GitHub OAuth via `sveltia-cms-auth` Worker; client secret server-side only (Worker env var), never in `config.yml` or the bundle. |
| V3 Session Management | partial | OAuth token held by the browser CMS session; scope the OAuth App minimally; editors are individually revocable (D-19). |
| V4 Access Control | yes | Repo write access = edit rights. Limit `zlobekstromiec` Org membership + `ALLOWED_DOMAINS`/`site_domain` on the Worker so only your site can initiate auth. Protect `main` as feasible (direct-publish per D-20). |
| V5 Input Validation | yes | Strict CMS widgets (`select`/`boolean`/`datetime`/`required`); constrain the `markdown` widget to bold+link and sanitize/inline-render with `marked` (D-08) so no raw HTML/script reaches prerendered pages. |
| V6 Cryptography | n/a | No crypto authored here (OAuth handled by GitHub + Worker). |
| V12 Files & Resources | yes | Staff-uploaded files committed to the repo. Editors are trusted, but cap `max_file_size`, keep documents in `static/dokumenty` (served as inert downloads, not executed), and set `X-Content-Type-Options: nosniff` (already in `_headers`). |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| OAuth client secret leakage | Information disclosure | Secret only on the Worker (env var / `.dev.vars`), never committed or in `config.yml`. |
| Supply-chain via CDN CMS bundle | Tampering | Self-host + pin `sveltia-cms.js`; refresh deliberately on upgrade. |
| Stored XSS via markdown field | Tampering/Elevation | Restrict widget buttons + sanitize/inline-render; site CSP `script-src 'self'` blocks inline script even if injected. |
| Over-broad repo/OAuth scope | Elevation of privilege | Minimal OAuth App scope; per-editor accounts; `ALLOWED_DOMAINS` lockdown. |
| `/admin` CSP too permissive | Tampering | Path-scoped `_headers` block; allow only GitHub API + Worker origins in `connect-src`. |

## Sources

### Primary (HIGH confidence)
- Context7 `/sveltia/sveltia-cms` — GitHub backend config, i18n, `media_libraries.transformations`, singletons, select/boolean/list/file widgets, UI-locale-is-localStorage note
- npm registry (`npm view`) — verified versions: `@sveltia/cms` 0.189.0, `@sveltejs/enhanced-img` 0.11.0, `marked` 18.0.9, `sharp` 0.35.3, `gray-matter` 4.0.3, `vite-imagetools` 12.0.0
- `gsd-tools query package-legitimacy` — verdicts for enhanced-img/marked/gray-matter/vite-imagetools
- Project codebase — `site.ts`, `DayPlan.svelte`, `Recruitment.svelte`, `svelte.config.js`, `_headers`, `vite.config.ts`, `tests/home.spec.ts` (migration surface + test hazard)
- `.planning/research/{STACK,ARCHITECTURE,PITFALLS,SUMMARY}.md` — locked stack, git-CMS+OAuth pattern, Pitfalls 7/8/9

### Secondary (MEDIUM confidence)
- deepwiki `sveltia/sveltia-cms` UI-localization + `sveltia/sveltia-cms-auth` setup guide — locale list (en/ja), worker steps (`base_url`, `GITHUB_CLIENT_ID/SECRET`, callback)
- SvelteKit Images docs + community discussions — enhanced-img + `import.meta.glob({ query: { enhanced } })`; build-plugin limitation vs git-committed images
- WebSearch (Jamstack, npm) — Sveltia UI language status

### Tertiary (LOW confidence)
- None load-bearing; the CMS-03 locale claim (A1) and Sveltia config-key specifics (A5) are flagged for re-verification against the pinned bundle at build.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm; Sveltia locked in STACK.md.
- Architecture / migration surface: HIGH — read directly from the codebase; content-layer + image patterns are standard SvelteKit.
- CMS config specifics: MEDIUM — Sveltia is Decap-compatible but ships extensions and moves fast; re-verify exact keys + locale list at build.
- Pitfalls: HIGH — the D-18 test hazard and CMS-03 locale limit are concrete, code/source-verified.

**Research date:** 2026-08-13
**Valid until:** ~2026-09-13 for stack facts; ~2026-08-20 for Sveltia version/locale specifics (fast-moving — re-verify at plan/build time).
