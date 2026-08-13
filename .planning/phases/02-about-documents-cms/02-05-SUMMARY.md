---
phase: 02-about-documents-cms
plan: 05
subsystem: cms
tags: [sveltia, cms, oauth, github, cloudflare-worker, csp, polish, supply-chain, rodo]
requires:
  - 'Plan 02-04: self-hosted /admin shell + config.yml (placeholder base_url) + /admin/* CSP block with a placeholder Worker origin'
  - 'Plan 02-01: o-nas.json singleton + day-plan.json shared plan-dnia (the content the editor edits)'
  - 'Plan 02-02: dokumenty/*.json folder collection + /static/dokumenty binaries (the documents the editor manages)'
provides:
  - 'Deployed self-hosted sveltia-cms-auth OAuth proxy Worker (live at sveltia-cms-auth.devzlobekstromiec.workers.dev) bridging GitHub OAuth for the Cloudflare-hosted CMS (no Netlify git-gateway)'
  - 'config.yml base_url + _headers /admin/* connect-src finalized to the real deployed Worker origin (placeholder removed)'
  - 'docs/instrukcja-cms.md: printable Polish staff guide (login, O nas, plan dnia, dokumenty add/replace/remove, placeholder checkbox, ~2 min publish delay, English-chrome mapping, live-loop Weryfikacja checklist)'
  - 'Proven end-to-end staff-editor slice: GitHub login -> Polish-labelled edit -> commit to main -> Cloudflare Pages rebuild -> change live (CMS-01, CMS-02)'
affects:
  - 'Phase handover: staff GitHub account model (per-editor vs shared) still to be confirmed with the client'
  - '02-06 (admin UX gap closure): builds on this slice to make the editor chrome Polish/readable'
tech-stack:
  added:
    - 'sveltia-cms-auth (vendored one-file Cloudflare Worker, upstream commit cc7530f) deployed to Cloudflare Workers'
  patterns:
    - 'Self-hosted OAuth proxy Worker for a git-based CMS on Cloudflare (replaces Netlify Git Gateway which does not exist off-Netlify)'
    - 'OAuth client secret lives ONLY as a wrangler Worker secret; repo carries variable names + a .dev.vars.example scaffold, never a value'
    - 'ALLOWED_DOMAINS binding restricts auth initiation to the live Pages origin (anti-spoofing V4 access control)'
    - 'Vendored Worker source exact-pinned to an upstream commit; excluded from eslint/prettier as third-party source'
    - 'Origin string kept byte-identical across config.yml base_url and the _headers /admin/* connect-src (single source of truth for the OAuth endpoint)'
key-files:
  created:
    - sveltia-cms-auth/src/index.js
    - sveltia-cms-auth/wrangler.toml
    - sveltia-cms-auth/.dev.vars.example
    - sveltia-cms-auth/README.md
    - docs/instrukcja-cms.md
  modified:
    - static/admin/config.yml
    - _headers
    - eslint.config.js
    - .prettierignore
key-decisions:
  - 'Vendored sveltia-cms-auth at upstream commit cc7530f (exact-pinned) rather than a custom hand-rolled OAuth endpoint (RESEARCH Do-Not-Hand-Roll), and deployed it under the devzlobekstromiec.workers.dev subdomain.'
  - 'ALLOWED_DOMAINS bound to zlobek-gminny-stromiec.pages.dev only; disallowed site_id returns UNSUPPORTED_DOMAIN (verified) — T-0205-02 mitigation.'
  - 'npm audit high-severity libvips CVEs in sharp (pulled transitively by @sveltejs/enhanced-img 0.11.0): the `npm audit fix --force` remedy downgrades enhanced-img to 0.4.1 (breaking) and was NOT applied; the pinned 0.11.0 is a build-time-only dependency (T-0201-SC / T-0205-SC accepted).'
  - 'CMS-03 chrome caveat narrowed by follow-on plan 02-06: editor chrome is now Polish where the upstream pl locale translates it; isolated English strings remain until upstream completes (instrukcja section 7 fallback table).'
patterns-established:
  - 'OAuth-proxy Worker for Cloudflare-hosted git CMS: base_url == deployed Worker origin == _headers connect-src entry; callback = <worker>/callback'
  - 'Secrets-on-Worker-only: git grep proves no secret value in the repo; wrangler secret list is the source of truth'
requirements-completed: [CMS-01, CMS-02, CMS-03]

coverage:
  - id: D1
    description: 'Authorized staff log into Sveltia at /admin on the LIVE deployment via GitHub OAuth proxied through the self-hosted sveltia-cms-auth Worker (CMS-01).'
    requirement: CMS-01
    verification:
      - kind: manual_procedural
        ref: 'docs/instrukcja-cms.md#Weryfikacja step 1; live loop walked on zlobek-gminny-stromiec.pages.dev by the user'
        status: pass
      - kind: other
        ref: 'Worker endpoint behavior: /auth with allowed site_id -> 302 to github.com/login/oauth/authorize (CSRF state + cookie); disallowed site_id -> UNSUPPORTED_DOMAIN'
        status: pass
    human_judgment: true
    rationale: 'OAuth popup + GitHub login are not CI-automatable (RESEARCH Validation Architecture); loop verified by the user on the live deployment ("all good works now").'
  - id: D2
    description: 'A CMS edit commits to zlobekstromiec/zlobek-gminny-stromiec@main and triggers a Cloudflare Pages rebuild that publishes the change live (CMS-02).'
    requirement: CMS-02
    verification:
      - kind: manual_procedural
        ref: 'docs/instrukcja-cms.md#Weryfikacja steps 3-5; user-verified edit landed on main, Pages rebuilt, change visible on live /o-nas'
        status: pass
    human_judgment: true
    rationale: 'End-to-end publish loop requires a live GitHub-authenticated edit and a real Pages rebuild; verified on *.pages.dev, not locally.'
  - id: D3
    description: 'Editor shows Polish field labels/hints; the English editor chrome is documented with a Polish mapping (CMS-03, "where supported").'
    requirement: CMS-03
    verification:
      - kind: manual_procedural
        ref: 'docs/instrukcja-cms.md sections 2-4 (Polish labels) + section 7 (chrome mapping/fallback table); Polish labels confirmed on the live editor'
        status: pass
    human_judgment: true
    rationale: 'Visual confirmation of Polish labels and the acknowledged chrome caveat is a human judgment; caveat further narrowed by plan 02-06.'
  - id: D4
    description: 'OAuth client secret held only as a Worker secret; no secret value anywhere in the repo (T-0205-01).'
    requirement: CMS-01
    verification:
      - kind: automated
        ref: "git grep for client_secret / GITHUB_CLIENT_SECRET value returns only variable-name references (src/index.js), no literals; .dev.vars gitignored"
        status: pass
      - kind: manual_procedural
        ref: 'wrangler secret list on the Worker shows GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set'
        status: pass
    human_judgment: false
  - id: D5
    description: 'Polish staff instrukcja (docs/instrukcja-cms.md) covers login, O nas, plan dnia, documents add/replace/remove, the placeholder checkbox, the ~2 min publish delay, chrome mapping, and a live-loop Weryfikacja checklist.'
    requirement: CMS-03
    verification:
      - kind: automated
        ref: "node grep gate: instrukcja contains /admin, O nas, Dokumenty, Zapisz, Opublikuj, Usuń, 2 min; no em dashes"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-08-13
status: complete
---

# Phase 2 Plan 05: CMS OAuth Worker + proven live staff-editor loop Summary

**Deployed the self-hosted sveltia-cms-auth OAuth proxy Worker, finalized the CMS to its real origin, shipped the Polish staff instrukcja, and proved the full GitHub login -> Polish-labelled edit -> commit-to-main -> Cloudflare rebuild -> live loop on the real *.pages.dev deployment (CMS-01, CMS-02, CMS-03).**

## Performance

- **Duration:** ~15 min active work (spanning a human-action checkpoint for OAuth App creation + Worker deploy)
- **Started:** 2026-08-13T14:04:16Z (first task commit)
- **Completed:** 2026-08-13 (origin finalized cc5b622 after checkpoint resolution)
- **Tasks:** 3 (plus the post-checkpoint origin finalization)
- **Files modified:** 8

## Accomplishments

- **Staff-editor vertical slice proven end-to-end on the live deployment.** The user walked the full loop on https://zlobek-gminny-stromiec.pages.dev: GitHub login through the self-hosted Worker, an edit in the Polish editor, a commit landing on `zlobekstromiec/zlobek-gminny-stromiec@main`, a Cloudflare Pages rebuild, and the change visible live. User confirmed "all good works now". CMS-01 and CMS-02 are proven live, not just locally (ROADMAP success criterion 3).
- **sveltia-cms-auth OAuth proxy Worker deployed** at `https://sveltia-cms-auth.devzlobekstromiec.workers.dev` (account subdomain `devzlobekstromiec`, version `31383590-2cba-42e3-8214-7c3b356a4812`). Endpoint behavior verified: `/` -> 404; `/auth` with an allowed `site_id` -> 302 to `github.com/login/oauth/authorize` with a CSRF state + cookie; a disallowed `site_id` -> `UNSUPPORTED_DOMAIN`. This replaces the Netlify Git Gateway that does not exist off-Netlify.
- **Origin finalized byte-identically** — `static/admin/config.yml` `base_url` and the `_headers` `/admin/*` `connect-src` both now point at the real deployed Worker origin (the Plan 04 placeholder is gone), keeping a single source of truth for the OAuth endpoint.
- **Polish staff instrukcja shipped** (`docs/instrukcja-cms.md`): logowanie, edycja O nas, plan dnia, dokumenty (dodawanie/zamiana/usuwanie), treść zastępcza (placeholder checkbox), publikowanie i ~2 min opóźnienie (D-12), the English-chrome -> Polish mapping (Save=Zapisz, Publish=Opublikuj, Delete=Usuń), and an 8-step live-loop "Weryfikacja" checklist.
- **Secrets kept off the repo.** `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set only as wrangler Worker secrets (confirmed via `wrangler secret list`). `git grep` finds no secret value — only variable-name references in `src/index.js` and an empty `.dev.vars.example` scaffold.

## Task Commits

1. **Task 1: Vendor + deploy sveltia-cms-auth Worker; wire it into the CMS** - `e763a82` (feat) vendor pinned Worker source + config
2. **Task 2: Polish staff instrukcja** - `2b3807a` (docs)
3. **Task 3: Live-loop verification harness (Weryfikacja checklist)** - `b5f1243` (docs)
4. **Post-checkpoint: finalize auth Worker origin** - `cc5b622` (feat) config.yml base_url + _headers connect-src + README to devzlobekstromiec.workers.dev

_Task 1 also added `.prettierignore` and an `eslint.config.js` ignore entry for the vendored Worker source (third-party, not project source), mirroring the Plan 04 bundle-exclusion pattern._

## Files Created/Modified

- `sveltia-cms-auth/src/index.js` - Vendored one-file OAuth proxy Worker (upstream cc7530f); exchanges the OAuth code for a token server-side, holding the client secret only in the Worker env
- `sveltia-cms-auth/wrangler.toml` - Worker deploy config; `ALLOWED_DOMAINS` bound to the live Pages origin
- `sveltia-cms-auth/.dev.vars.example` - Local-secrets scaffold (empty values); real `.dev.vars` is gitignored
- `sveltia-cms-auth/README.md` - Deploy + secret-set runbook for the Worker
- `docs/instrukcja-cms.md` - Printable Polish staff guide + Weryfikacja checklist
- `static/admin/config.yml` - `base_url` finalized to the deployed Worker origin
- `_headers` - `/admin/*` `connect-src` finalized to the deployed Worker origin
- `eslint.config.js`, `.prettierignore` - Exclude the vendored Worker source from linting/formatting

## Decisions Made

- Vendored the upstream `sveltia-cms-auth` Worker (exact-pinned at commit cc7530f) instead of a custom OAuth endpoint (RESEARCH Do-Not-Hand-Roll), deployed under `devzlobekstromiec.workers.dev`.
- `ALLOWED_DOMAINS` restricted to `zlobek-gminny-stromiec.pages.dev` only (T-0205-02 anti-spoofing); disallowed origins are rejected with `UNSUPPORTED_DOMAIN` (verified).
- Direct-publish to `main` (no editorial workflow) retained per D-20 for one or two trusted editors; Cloudflare retains the last good deploy for rollback (T-0205-04 accept).

## Supply-chain acknowledgements (plan-required)

- **npm audit — high-severity libvips CVEs in `sharp`**, pulled transitively by `@sveltejs/enhanced-img` 0.11.0. The `npm audit fix --force` remedy downgrades `enhanced-img` to 0.4.1, which is **breaking**, so it was **NOT applied**. `enhanced-img` is a build-time-only image-optimization dependency (no runtime/edge exposure of `sharp`); the risk is accepted and the version stays exact-pinned (T-0201-SC / T-0205-SC).
- **All admin/Worker artifacts are exact-pinned:** `@sveltia/cms` 0.189.0 (vendored bundle, Plan 04) and the `sveltia-cms-auth` Worker vendored at upstream commit `cc7530f`. No caret ranges; no CDN hot-linking.

## Deviations from Plan

None - plan executed exactly as written. Task 1's action explicitly anticipated the eslint/prettier exclusion for the vendored source and the human-setup checkpoint for the OAuth App + secrets.

## Issues Encountered

- **Human-action checkpoint (expected, not a failure):** GitHub OAuth Apps have no create-API, so a human created the App under the `zlobekstromiec` Org, set `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` as Worker secrets, and deployed the Worker. This was surfaced as a `human-action` checkpoint per the plan's `user_setup`; on resume the repo-side origin was finalized (cc5b622) and the live loop was verified. No secret values entered the repo or any commit.

## Known remaining items (carried forward, NOT blockers)

- **Instrukcja screenshots** are still marked `PLACEHOLDER: screenshot` in `docs/instrukcja-cms.md` — to be captured during normal editor use and pasted in (they do not block the proven loop).
- **Staff Org invitations pending** the per-editor vs shared GitHub account decision, to be confirmed with the client at handover (D-19/D-20; blocker kept open in STATE.md).

## Cross-reference: gap-closure plan 02-06

Mid-plan UAT feedback on the editor (icons rendering as raw ligature text, half-English chrome, dark unreadable theme) was fixed in a separate gap-closure plan **02-06** (its own PLAN/SUMMARY, complete) WITHOUT patching the pinned bundle or weakening the CSP: self-hosted Material Symbols + Nunito fonts, version-locked Polish locale cache seeding (`locale-pl.js` + `preboot.js` via the new `scripts/cms-sync.mjs`), a warm light theme mapped onto the `--sui-*` custom properties, a Polish guidance layer, and `thumbnail: false` on dokumenty (PDF/DOC previews cannot render under the strict CSP). Commits `63e96c2`, `530da97`, `ea40eb3`, `56d957f`, `a6cdaad`. **CMS-03 chrome caveat therefore narrows:** chrome is now Polish where the upstream `pl` locale translates it; isolated English strings remain until the upstream translation completes (instrukcja section 7 documents this with a fallback table).

## Threat Flags

None new. All work sits inside the plan's STRIDE register (T-0205-01 secret-on-Worker, T-0205-02 ALLOWED_DOMAINS, T-0205-03 minimal scope/per-editor Org write, T-0205-04 direct-publish accept, T-0205-05 per-editor audit trail, T-0205-SC pinned deps) with `mitigate`/`accept` dispositions satisfied.

## User Setup Required

Completed for this plan (GitHub OAuth App created, Worker deployed, secrets set). One handover item remains: **confirm the staff GitHub account model (per-editor vs shared)** and invite staff as `zlobekstromiec` Org members with write access before CMS handover.

## Next Phase Readiness

- The staff-editor capability (Phase 2 vertical MVP) is complete and proven live; a non-technical editor can update O nas and manage documents with no developer.
- Handover blocker open: staff GitHub account model + Org invitations.
- Screenshots to be captured into the instrukcja during normal use.

## Self-Check: PASSED

All 5 created files exist (`sveltia-cms-auth/src/index.js`, `sveltia-cms-auth/wrangler.toml`, `sveltia-cms-auth/.dev.vars.example`, `sveltia-cms-auth/README.md`, `docs/instrukcja-cms.md`); `config.yml` `base_url` and `_headers` `connect-src` both equal the deployed Worker origin; all four commits (`e763a82`, `2b3807a`, `b5f1243`, `cc5b622`) are present in git history; `git grep` finds no OAuth secret value in the repo.

---
*Phase: 02-about-documents-cms*
*Completed: 2026-08-13*
