---
phase: 02-about-documents-cms
fixed_at: 2026-08-13T17:04:42Z
review_path: .planning/phases/02-about-documents-cms/02-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 3
skipped: 1
status: partial
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-08-13T17:04:42Z
**Source review:** .planning/phases/02-about-documents-cms/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (fix_scope: critical_warning -- WR-01..WR-04)
- Fixed: 3
- Skipped: 1 (WR-04, vendored upstream code -- per review and orchestrator instruction)

**Verification run:** `npm run check` (0 errors), `eslint` + `prettier --check` on
every touched file, pre-commit hooks (svelte-check + prettier/eslint) passed on
each commit, and `npx playwright test tests/o-nas.spec.ts tests/home.spec.ts`
against a full production build: 23/23 passed, including the axe WCAG 2.1 AA
scans. A functional smoke test of the new sanitizer confirmed: safe bold/links
pass through, `javascript:`/`data:` hrefs collapse to plain text, raw inline
HTML is escaped, and images flatten to their alt text.

## Fixed Issues

### WR-01: `statSync` on CMS-controlled paths can crash the entire site build

**Files modified:** `src/lib/server/dokumenty.ts`
**Commit:** ebfa73f
**Applied fix:** `withMeta` now returns `DokumentWithMeta | null`: the
`statSync` call is wrapped in try/catch, and a missing file logs a build
warning and skips the entry instead of failing the prerender of both
`/dokumenty` and the homepage. `readDokumenty()` filters the nulls with a type
guard. **Folded in IN-03** (as the review suggested -- "pairs naturally with
the WR-01 guard"): `plik` must start with `/dokumenty/` and may not contain
`..` segments before it is joined into a filesystem path, so traversal outside
`static/` is impossible. All three existing content entries conform to the
`/dokumenty/` prefix (verified against `src/lib/content/dokumenty/*.json` and
`static/dokumenty/`).

### WR-02: Homepage docs panel described as "curated subset" but performs no curation

**Files modified:** `src/routes/+page.server.ts`
**Commit:** 5fe26d8
**Applied fix:** Added `.slice(0, 2)` after the `rekrutacja` filter with a
comment documenting the D-18 contract: the centrepiece panel shows at most two
rows regardless of how many recruitment documents an editor adds; the full set
lives on `/dokumenty` behind the see-all link. This makes the code enforce the
stated intent and protects the `home.spec.ts` count-2 assertion from normal
CMS editing. The review's alternative (relax the test, drop "curated" wording)
was not taken -- the cap matches the comments in `Recruitment.svelte`,
`site.ts`, and the UI-SPEC amendment cited in the test.

### WR-03: `marked.parseInline` output claimed "limited to bold/links" -- it is not sanitized

**Files modified:** `src/lib/markdown.ts` (new), `src/routes/o-nas/+page.svelte`
**Commit:** e0ec197
**Applied fix:** Created `src/lib/markdown.ts` exporting `renderInline()`: a
dedicated `Marked` instance with a hardened renderer that (a) escapes raw
inline HTML instead of emitting it, (b) drops links whose href is not
http(s)/mailto/tel/relative -- keeping the link text -- and (c) renders images
as their alt text. The o-nas page now calls `renderInline` for `misja`,
`kadra_opis`, and `obiekt_opis`, and all four comments (script header + three
`eslint-disable` justifications) were corrected to name the sanitizer as the
primary control and CSP `script-src 'self'` as the second layer, not the only
one. Placed in `$lib` (not `$lib/server`) because the page hydrates (csr is
not disabled), so the module is legitimately client-reachable. Note for the
verifier: this is a behavioral security fix -- the smoke test above covered
the key vectors, but a human glance at `/o-nas` rendering is cheap insurance.

## Skipped Issues

### WR-04: OAuth token-exchange failures are swallowed with an empty `catch`

**File:** `sveltia-cms-auth/src/index.js:277-279`
**Reason:** Vendored/pinned upstream code (commit `cc7530f`). The review
itself states "No action required unless you later fork the vendored file,"
and the orchestrator instruction confirms: do not modify vendored code.
Worker observability is enabled in `wrangler.toml`, which partially mitigates.
If the login path ever needs production debugging, note that the underlying
fetch error is unrecoverable from logs until the file is forked.

## Out of Scope (not attempted)

- **IN-01** (gallery keyed by non-unique alt) and **IN-02** (dead fallback
  branch): Info findings, outside `critical_warning` scope.
- **IN-03**: folded into the WR-01 fix as noted above (review explicitly
  endorsed pairing them).

---

_Fixed: 2026-08-13T17:04:42Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
