---
phase: 01-live-homepage-design-foundation
plan: 01
subsystem: infra
tags: [sveltekit, svelte5, tailwindcss-v4, cloudflare-pages, adapter-cloudflare, playwright, axe-core, fontsource, wcag, design-tokens, prerender]

# Dependency graph
requires: []
provides:
  - Buildable SvelteKit 2 + Svelte 5 app scaffolded with @sveltejs/adapter-cloudflare (build output .svelte-kit/cloudflare)
  - Tailwind v4 CSS-first two-tier @theme design-token system in src/app.css (verbatim from 01-UI-SPEC — accessible + expressive tiers)
  - Self-hosted fonts (Baloo 2 + Nunito, 400/700, latin+latin-ext) via @fontsource — no Google Fonts CDN (RODO)
  - Global a11y base layer (:focus-visible ring + prefers-reduced-motion reset)
  - Static-first prerender (export const prerender = true in +layout.ts) inherited by all routes
  - App.Platform.env typing seam (empty in Phase 1; secrets land Phase 4)
  - a11y/test quality gate — Playwright + @axe-core/playwright homepage acceptance suite (RED until Plan 03) + svelte-check
  - Dev-env conventions — .tool-versions (Node 22 LTS), pre-commit gate (check + lint), docs/dev-env.md machine contract
affects: [live-homepage-design-foundation, cms-content-editing, forms-email, launch-seo]

# Tech tracking
tech-stack:
  added:
    - "@sveltejs/kit 2 + svelte 5 (runes)"
    - "@sveltejs/adapter-cloudflare 7 (Pages target)"
    - "tailwindcss v4 + @tailwindcss/vite (CSS-first @theme)"
    - "@lucide/svelte (NOT deprecated lucide-svelte)"
    - "@playwright/test + @axe-core/playwright"
    - "@fontsource/baloo-2 + @fontsource/nunito (self-hosted)"
    - "pre-commit (local hooks) + asdf Node 22 pin"
  patterns:
    - "Tailwind v4 CSS-first @theme tokens (no tailwind.config.js)"
    - "Two-tier palette: expressive (decorative-only) vs accessible (text/UI) tokens"
    - "Semantic prerender-by-default (+layout.ts prerender=true)"
    - "adapter-cloudflare — server routes ARE Pages Functions (no /functions dir)"
    - "Self-hosted @font-face via @fontsource (no external CDN)"
    - "Global a11y base: visible focus ring + reduced-motion reset"
    - "RED acceptance test authored before the feature (Playwright + axe)"

key-files:
  created:
    - "svelte.config.js"
    - "vite.config.ts"
    - "src/app.css"
    - "src/app.html"
    - "src/app.d.ts"
    - "src/routes/+layout.ts"
    - "src/routes/+layout.svelte"
    - "src/routes/+page.svelte"
    - "playwright.config.ts"
    - "tests/home.spec.ts"
    - ".tool-versions"
    - ".pre-commit-config.yaml"
    - "docs/dev-env.md"
    - "worker-configuration.d.ts"
  modified:
    - ".gitignore"
    - ".prettierignore"
    - "eslint.config.js"
    - "prettier.config.js"

key-decisions:
  - "Reconciled the modern `sv` scaffold (adapter wired in vite.config.ts, tailwind in routes/layout.css) to the plan's locked layout: created svelte.config.js with the canonical adapter() config, moved the Tailwind entrypoint to src/app.css"
  - "Kept the scaffold's Cloudflare-native flow — `wrangler types --check` in build/check and `wrangler pages dev` for preview — and committed the generated worker-configuration.d.ts so --check passes"
  - "Self-hosted fonts via @fontsource subset CSS (latin + latin-ext) rather than hand-authored @font-face — guarantees no Google CDN and full Polish diacritic coverage"
  - "Installed and built on Node 22.23.2 (asdf) instead of the local Node 25 (Current), matching the Cloudflare Pages runtime (resolves RESEARCH Open Q1/A3)"

patterns-established:
  - "Two-tier @theme design tokens: accessible tier for all text/icon/border/focus/label; expr-* decorative surfaces only"
  - "Prerender-by-default via +layout.ts; no +server.ts this phase"
  - "prettier/eslint scoped to source only (.prettierignore + eslint ignores exclude .planning, generated files)"

requirements-completed: [SITE-04]

coverage:
  - id: D1
    description: "SvelteKit app builds to the Cloudflare Pages output (.svelte-kit/cloudflare) with adapter-cloudflare (SITE-01 build half)"
    requirement: "SITE-01"
    verification:
      - kind: integration
        ref: "npm run build (exit 0; test -d .svelte-kit/cloudflare)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Served document declares <html lang=\"pl\"> (SITE-06 foundation)"
    requirement: "SITE-06"
    verification:
      - kind: e2e
        ref: "tests/home.spec.ts#served document declares Polish language"
        status: pass
    human_judgment: false
  - id: D3
    description: "Two-tier accessible @theme palette tokens locked in src/app.css verbatim from 01-UI-SPEC (SITE-04 — highest project risk)"
    requirement: "SITE-04"
    verification:
      - kind: unit
        ref: "grep @theme/#0369A1/#F59E0B/#1E293B/expr-yellow src/app.css + npm run check (exit 0)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Fonts self-hosted (Baloo 2 + Nunito, latin+latin-ext) — no Google Fonts CDN in source or build output (RODO)"
    verification:
      - kind: integration
        ref: "8 .woff2 emitted to .svelte-kit/cloudflare; grep -RniE 'fonts.google|gstatic' build == empty"
        status: pass
    human_judgment: false
  - id: D5
    description: "Global a11y base — visible :focus-visible ring (3px focus-ring, 2px offset) + prefers-reduced-motion reset at the base layer"
    verification:
      - kind: unit
        ref: "grep focus-visible + prefers-reduced-motion src/app.css; npm run check exit 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "Homepage acceptance/a11y suite authored and RED — encodes HOME-01/HOME-02/axe-AA; turns GREEN when the homepage is composed in Plan 03"
    verification:
      - kind: e2e
        ref: "npx playwright test tests/home.spec.ts (1 pass lang=pl / 5 RED content+axe, as designed)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Dev-env quality gate — Node 22 pin, pre-commit hooks (check + lint), docs/dev-env.md machine contract"
    verification:
      - kind: integration
        ref: "pre-commit run -a (svelte-check Passed; prettier+eslint Passed)"
        status: pass
    human_judgment: false

# Metrics
duration: 25min
completed: 2026-08-12
status: complete
---

# Phase 1 Plan 01: Foundation Scaffold & Design Tokens Summary

**Buildable SvelteKit 2 + Svelte 5 walking skeleton on adapter-cloudflare with the locked two-tier Tailwind v4 @theme palette, self-hosted @fontsource fonts (no Google CDN), a global a11y base, and a RED Playwright+axe homepage acceptance gate.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-08-12T19:05:00+01:00
- **Completed:** 2026-08-12T19:30:00+01:00
- **Tasks:** 3
- **Files modified:** 27 (net-new scaffold + config)

## Accomplishments
- Scaffolded SvelteKit 2 (Svelte 5 runes) with `@sveltejs/adapter-cloudflare` (Pages) — `npm run build` exits 0 and emits `.svelte-kit/cloudflare`.
- Locked the single highest-risk artifact: the AA-verified two-tier `@theme` token system in `src/app.css`, pasted verbatim from `01-UI-SPEC.md`, with a hard-rule comment to stop downstream drift.
- Self-hosted Baloo 2 + Nunito (400/700, latin+latin-ext) via `@fontsource` — 8 WOFF2 bundled to our own origin, zero Google Fonts CDN references in the build (RODO).
- Established the a11y/test gate: Playwright + `@axe-core/playwright` homepage acceptance suite authored RED (5 content/axe assertions fail until Plan 03; the `lang="pl"` assertion already passes), plus `svelte-check` (0 errors/0 warnings).
- Wired dev-env conventions: `.tool-versions` (Node 22.23.2 LTS), a working `pre-commit` gate (`npm run check` + `npm run lint`), and `docs/dev-env.md` machine contract incl. Cloudflare Pages build settings.
- Set `<html lang="pl">`, `export const prerender = true`, and the `App.Platform.env` typing seam; no `tailwind.config.js`, no `/functions` dir, no deprecated `lucide-svelte`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Failing homepage e2e/a11y acceptance test + Playwright config** - `e1259e3` (test)
2. **Task 2: Scaffold SvelteKit + Tailwind v4 + Cloudflare adapter + minimal buildable homepage** - `4f6cc68` (feat)
3. **Task 3: Design-token foundation (app.css @theme + self-hosted fonts + a11y base) + dev-env gates** - `3c87972` (feat)

## Files Created/Modified
- `svelte.config.js` - adapter-cloudflare config (build → .svelte-kit/cloudflare)
- `vite.config.ts` - canonical `[tailwindcss(), sveltekit()]` (Tailwind v4 Vite plugin)
- `src/app.css` - Tailwind import + verbatim two-tier `@theme` tokens + @fontsource imports + a11y base
- `src/app.html` - HTML shell, `lang="pl"`
- `src/app.d.ts` - `App.Platform.env` seam (empty `Env`; Phase 4 adds secrets)
- `src/routes/+layout.ts` - `export const prerender = true`
- `src/routes/+layout.svelte` - minimal semantic shell (`<main id="main">`; full shell in Plan 02)
- `src/routes/+page.svelte` - PLACEHOLDER homepage (real homepage Plan 03)
- `playwright.config.ts` - webServer builds + previews (`:4173`), baseURL
- `tests/home.spec.ts` - RED acceptance suite (HOME-01/HOME-02/axe WCAG 2.1 AA)
- `.tool-versions` / `.pre-commit-config.yaml` / `docs/dev-env.md` - dev-env gates (D-08)
- `.gitignore` / `.prettierignore` / `eslint.config.js` / `prettier.config.js` - tooling scope + ignores
- `worker-configuration.d.ts` - generated Cloudflare types (committed for `wrangler types --check`)

## Decisions Made
- **Reconciled scaffold layout to the plan contract.** The current `sv` CLI wires the adapter inside `vite.config.ts` and puts Tailwind in `src/routes/layout.css`. I moved the adapter into a canonical `svelte.config.js` and the Tailwind entrypoint into `src/app.css` — matching the plan's locked artifacts, `01-PATTERNS.md` exact-examples, and verify greps.
- **Kept the Cloudflare-native build/preview flow** (`wrangler types --check` + `wrangler pages dev`) the scaffold ships, committing `worker-configuration.d.ts` so `--check` is green. This is a more faithful Cloudflare preview than `vite preview` for adapter-cloudflare output.
- **`@fontsource` over hand-authored `@font-face`** — self-hosted, subsetted, guaranteed no CDN, full Polish diacritics.
- **Built on Node 22.23.2 (asdf)**, not local Node 25, matching the Pages runtime.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Modern `sv` scaffold has no `svelte.config.js` (adapter wired in vite.config.ts)**
- **Found during:** Task 2
- **Issue:** The plan's artifacts/verify require `svelte.config.js` importing `adapter` from `@sveltejs/adapter-cloudflare`; the current scaffold instead configures the adapter inside the `sveltekit()` vite plugin, so `grep adapter-cloudflare svelte.config.js` would fail and the layout would drift from `01-PATTERNS.md`.
- **Fix:** Created `svelte.config.js` with the canonical `adapter()` config + `vitePreprocess()`, and reduced `vite.config.ts` to `defineConfig({ plugins: [tailwindcss(), sveltekit()] })`.
- **Files modified:** svelte.config.js (new), vite.config.ts
- **Verification:** `npm run build` exits 0, emits `.svelte-kit/cloudflare`; grep passes.
- **Committed in:** 4f6cc68

**2. [Rule 3 - Blocking] Scaffold placed the Tailwind entrypoint at `src/routes/layout.css`, not `src/app.css`**
- **Found during:** Task 2
- **Issue:** Plan requires the design tokens to live in `src/app.css`; the scaffold imported Tailwind from `src/routes/layout.css`.
- **Fix:** Created `src/app.css` (Tailwind import), imported it in `+layout.svelte`, deleted `layout.css`.
- **Files modified:** src/app.css (new), src/routes/+layout.svelte; removed src/routes/layout.css
- **Verification:** build + check green; `@theme` tokens resolve.
- **Committed in:** 4f6cc68 / 3c87972

**3. [Rule 1 - Bug] `prettier-plugin-tailwindcss` pointed at the deleted `layout.css`**
- **Found during:** Task 2 (running lint/format)
- **Issue:** `prettier.config.js` had `tailwindStylesheet: './src/routes/layout.css'` → `ENOENT` error broke `npm run format`/`lint`.
- **Fix:** Repointed `tailwindStylesheet` to `./src/app.css`.
- **Files modified:** prettier.config.js
- **Verification:** `npm run lint` exits 0.
- **Committed in:** 4f6cc68

**4. [Rule 3 - Blocking] `npm run format` reformatted the entire `.planning/` tree (out of scope)**
- **Found during:** Task 2
- **Issue:** `.prettierignore` didn't exclude `.planning/`, so `prettier --write .` rewrote ~24 planning/agent docs — scope creep.
- **Fix:** Added `/.planning/`, `/.claude/`, and generated files to `.prettierignore`; reverted the out-of-scope doc changes (`git checkout` on tracked docs; re-emitted `config.json` at its original 2-space indent to strip only prettier's whitespace).
- **Files modified:** .prettierignore
- **Verification:** `git status` shows no `.planning/` doc changes attributable to this plan.
- **Committed in:** 4f6cc68

**5. [Rule 2 - Hygiene] Generated `worker-configuration.d.ts` produced eslint warnings**
- **Found during:** Task 2
- **Issue:** eslint flagged "unused eslint-disable directive" on the wrangler-generated types file.
- **Fix:** Added `worker-configuration.d.ts` to eslint ignores.
- **Files modified:** eslint.config.js
- **Verification:** `npm run lint` clean.
- **Committed in:** 4f6cc68

---

**Total deviations:** 5 auto-fixed (3 blocking/sequencing, 1 bug, 1 hygiene)
**Impact on plan:** All fixes reconcile the current `sv` tooling to the plan's locked layout and keep the quality gate scoped to source. No scope creep, no architectural changes, no user decisions required.

## Issues Encountered
- Local machine had only Node 25 (Current). Installed Node 22.23.2 via asdf and used it for all builds/checks to match the Cloudflare Pages runtime (RESEARCH Open Q1/A3).
- `app.d.ts` retains the scaffold's modern `env: Env` typing (referencing the generated worker types) rather than the plan's older empty-object example — this is the current adapter-cloudflare pattern; `Env` is empty in Phase 1, and a Phase-4-secrets comment was added. Satisfies the "interface Platform / empty env" contract.

## Requirements Note
- **SITE-04 (two-tier palette tokens): complete** — the deliverable (AA-verified `@theme` token system) is locked verbatim in `src/app.css`.
- **SITE-01, SITE-02, SITE-06:** foundationally advanced but intentionally NOT marked complete here — the live Cloudflare deploy (SITE-01), responsive UI (SITE-02), and visitor-facing Polish content (SITE-06) are realized across Plans 02–05 of this phase. Marking them complete now would misrepresent state.

## User Setup Required
None in this plan. (External account setup — Cloudflare Pages git-integration + GitHub Org, D-04/D-06/D-07 — is a later/manual step surfaced by the phase, not this scaffold plan.)

## Next Phase Readiness
- Deployable spine is ready: build → `.svelte-kit/cloudflare`, tokens locked, fonts self-hosted, a11y base + test gate in place.
- Plan 02 builds the semantic layout shell (Header/nav + MobileNav island + Footer + SkipLink) consuming these tokens; Plan 03 composes the homepage and turns `tests/home.spec.ts` GREEN.
- Note: the `test` script uses `wrangler pages dev` for preview — CI/local runs need `npx playwright install chromium` (documented in `docs/dev-env.md`).

## Self-Check: PASSED

All 15 created files verified present on disk; all 3 task commits (`e1259e3`, `4f6cc68`, `3c87972`) verified in git history.

---
*Phase: 01-live-homepage-design-foundation*
*Completed: 2026-08-12*
