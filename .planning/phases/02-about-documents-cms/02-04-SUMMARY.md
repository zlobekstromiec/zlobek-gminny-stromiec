---
phase: 02-about-documents-cms
plan: 04
subsystem: cms
tags: [sveltia, cms, config-yml, csp, security, polish, supply-chain]
requires:
  - 'Plan 02-01: o-nas.json (strict D-05 singleton) + day-plan.json (shared plan-dnia) + src/lib/assets/uploads image path'
  - 'Plan 02-02: dokumenty/*.json folder collection shape + /static/dokumenty hosted binaries'
provides:
  - 'Self-hosted, pinned Sveltia admin at /admin (static/admin/index.html + vendored sveltia-cms.js bundle)'
  - 'static/admin/config.yml: github backend + o_nas/day_plan singletons + dokumenty collection, all-Polish strict widgets, mapping 1:1 to the on-disk content files'
  - 'Path-scoped /admin/* CSP block in _headers (script-src self, tight connect-src, GitHub OAuth popup allowed)'
  - 'cms:sync npm script to deliberately refresh the vendored bundle on version bumps'
affects:
  - '02-05-cms-oauth-instrukcja (Plan 05 wires the real sveltia-cms-auth Worker origin into config.yml base_url + _headers, and proves the live login-edit-commit loop)'
tech-stack:
  added: ['@sveltia/cms@0.189.0 (exact-pinned devDependency; bundle vendored to static/admin/)']
  patterns:
    - 'Self-host + pin a third-party admin SPA bundle (no CDN hot-link); refresh only via a deliberate npm script (T-0204-01)'
    - 'Vendored minified bundle excluded from eslint (not project source)'
    - 'Path-scoped CSP for static /admin outside SvelteKit, leaving the kit.csp site-page policy untouched (Pitfall 3)'
    - 'CMS config maps 1:1 to on-disk JSON keys (time/what, plik/alt) so edits round-trip without renaming'
key-files:
  created:
    - static/admin/index.html
    - static/admin/sveltia-cms.js
    - static/admin/config.yml
  modified:
    - package.json
    - package-lock.json
    - eslint.config.js
    - _headers
decisions:
  - 'Exact-pinned @sveltia/cms to 0.189.0 (removed npm caret + synced the lock) per supply-chain threat T-0204-01, matching the Plan 01 exact-pin precedent.'
  - 'Followed the authoritative UI-SPEC Copy Contract labels (Kadra: opis; Źródło (BIP), opcjonalnie) over the RESEARCH sketch which used em dashes, because the project copy rule forbids em dashes anywhere (including comments).'
  - 'Included lead (text) and per-image alt (string) in config.yml even though the RESEARCH sketch omitted them, because the real o-nas.json carries both; the config must map 1:1 to the file.'
  - 'connect-src kept tight (self + api.github.com + the one Worker origin, no wildcard) per threat T-0204-04; the Worker origin is a documented placeholder kept byte-identical to config.yml base_url for Plan 05 to finalize.'
metrics:
  duration_min: 6
  tasks: 3
  files: 7
  completed: 2026-08-13
status: complete
---

# Phase 2 Plan 04: Sveltia CMS shell + config + /admin CSP Summary

Stood up the in-repo half of the git-based CMS: a self-hosted, pinned Sveltia editor at `/admin` whose all-Polish `config.yml` exposes the O nas singleton, the shared plan-dnia singleton, and the dokumenty folder collection through strict validated widgets that map 1:1 to the exact JSON files Plans 01/02 authored, plus a path-scoped `/admin/*` CSP block. The editor UI and schema now exist and validate; Plan 05 wires the OAuth Worker and proves the live login-edit-commit loop.

## What was built

- **Task 1 (`8baae4b`)** — Installed `@sveltia/cms@0.189.0` as an exact-pinned devDependency, vendored its `dist/sveltia-cms.js` browser bundle to `static/admin/sveltia-cms.js` (self-hosted, no CDN), created `static/admin/index.html` (`<html lang="pl">`, Polish title `Panel redakcyjny: Żłobek Gminny w Stromcu`, loads only the local bundle), and added a `cms:sync` npm script to refresh the vendored bundle on version bumps.
- **Task 2 (`61f2b54`)** — Authored `static/admin/config.yml`: `github` backend (`zlobekstromiec/zlobek-gminny-stromiec`, `main`, placeholder `base_url`); global image media at `src/lib/assets/uploads` with `max_file_size` + webp `transformations`; the `o_nas` and `day_plan` singletons and the `dokumenty` collection, every label/hint Polish, markdown fields limited to `bold`+`link` (D-08), a fixed category `select` (D-15), and per-collection `/static/dokumenty` media for verbatim documents.
- **Task 3 (`9a1b86c`)** — Added a path-scoped `/admin/*` CSP block to `_headers` (`script-src 'self'`, tight `connect-src` = self + `api.github.com` + the Worker origin, `frame-src`/`form-action` allowing the GitHub OAuth popup), leaving the `/*` baseline and the `svelte.config.js` `kit.csp` site-page policy untouched.

## Verification

- `npm run check` exits 0 (wrangler types + svelte-check: 0 errors, 0 warnings).
- `npm run build` succeeds; `.svelte-kit/cloudflare/admin/{index.html,config.yml,sveltia-cms.js}` are emitted and the built `_headers` carries the `/admin/*` block.
- config.yml grep gate passes: `name: github`, all three content paths, Polish labels present; no `git-gateway` / `client_secret` / `app_secret` / `unpkg`.
- No em dashes anywhere in config.yml (copy rule); Worker origin is byte-identical in `config.yml` base_url and the `_headers` `connect-src`.
- `svelte.config.js` unchanged (git diff clean); `npm run lint` passes.

## 1:1 schema mapping (round-trip fidelity)

| Content file (on disk) | config.yml symbol | Notes |
|---|---|---|
| `src/lib/content/o-nas.json` | `o_nas` singleton | lead/misja/wartosci[tytul,opis]/kadra_opis/kadra_opiekunki/kadra_personel/obiekt_opis/obiekt_zdjecia[plik,alt]/placeholder — keys unchanged |
| `src/lib/content/day-plan.json` | `day_plan` singleton | rows[time,what] + placeholder — JSON keys `time`/`what` kept, Polish labels only |
| `src/lib/content/dokumenty/*.json` | `dokumenty` collection | nazwa/kategoria(select)/plik(file)/wersja(datetime DD.MM.YYYY)/zrodlo_bip/placeholder |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical / supply-chain] Exact-pinned @sveltia/cms**
- **Found during:** Task 1
- **Issue:** `npm i -D` wrote a caret range (`^0.189.0`); threat T-0204-01 requires a pinned bundle, and Plan 01 set the exact-pin precedent for this repo.
- **Fix:** Set `0.189.0` in package.json and re-ran `npm install` to sync package-lock.json to the exact version.
- **Files modified:** package.json, package-lock.json
- **Commit:** 8baae4b

**2. [Rule 3 - Blocking] Vendored minified bundle broke the eslint gate**
- **Found during:** Task 1 (pre-commit)
- **Issue:** The git-tracked `static/admin/sveltia-cms.js` is not gitignored, so eslint (which ignores via `.gitignore`) linted the third-party minified build and failed the commit hook with hundreds of errors. (Prettier already ignores `/static/`.)
- **Fix:** Added a targeted `{ ignores: ['static/admin/sveltia-cms.js'] }` entry to eslint.config.js — the vendored bundle is not project source.
- **Files modified:** eslint.config.js
- **Commit:** 8baae4b

**3. [Rule 1 - Copy rule] Removed em dashes from config.yml comments**
- **Found during:** Task 2
- **Issue:** Initial comments used em dashes, which the project copy rule forbids anywhere (they read as AI-generated).
- **Fix:** Replaced with plain punctuation (colons / regular words). No visitor- or staff-facing labels were affected.
- **Files modified:** static/admin/config.yml
- **Commit:** 61f2b54

**Total:** 3 auto-fixed (1 supply-chain hardening, 1 blocking lint gate, 1 copy-rule cleanup). All within this plan's file set; no scope creep.

## Additions beyond the RESEARCH sketch (to preserve 1:1 mapping)

- Added `lead` (text) and per-image `alt` (string) fields, present in the real `o-nas.json` but omitted from the RESEARCH config example.
- Added `min: 0` to the two headcount number widgets (input hardening, D-05 sanity).
- Used the UI-SPEC Copy Contract labels (`Kadra: opis`, `Źródło (BIP), opcjonalnie`) instead of the RESEARCH em-dash variants.

## Known Stubs

- `config.yml` `base_url` and the `_headers` `/admin/*` `connect-src` carry a documented placeholder Worker origin (`https://sveltia-cms-auth.zlobekstromiec.workers.dev`), marked `TODO(Plan 05)`. This is intentional and plan-authorized: the real `sveltia-cms-auth` Worker is provisioned and finalized in Plan 05, which also proves the live OAuth login-edit-commit loop (not CI-automatable per RESEARCH). It does not block this plan's goal (the shell + schema validate and build).

## Threat Flags

None new. All work sits inside the plan's existing STRIDE register (T-0204-01 supply-chain pin, T-0204-02 no-secret, T-0204-04 tight CSP) with `mitigate` dispositions satisfied.

## User Setup Required

None for this plan. Plan 05 requires: create the GitHub OAuth App under the `zlobekstromiec` Org, deploy the `sveltia-cms-auth` Worker with `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`, then replace the placeholder Worker origin in both `config.yml` and `_headers`.

## Self-Check: PASSED

All 3 created files exist (static/admin/index.html, config.yml, sveltia-cms.js) and all 3 task commits (8baae4b, 61f2b54, 9a1b86c) are present in git history.

---
*Phase: 02-about-documents-cms*
*Completed: 2026-08-13*
