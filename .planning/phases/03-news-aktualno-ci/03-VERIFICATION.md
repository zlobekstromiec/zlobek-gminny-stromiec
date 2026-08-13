---
phase: 03-news-aktualno-ci
verified: 2026-08-14T00:10:00Z
status: gaps_found
score: 8/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 7/10
  gaps_closed:
    - "Staff can create, edit, and publish a news post via the CMS without a developer, and it appears live after rebuild (roadmap SC3) — specifically, the post gets a correct publication-date-prefixed slug (NEWS-03 / D-06 must-have) — CR-01, closed by plan 03-05."
    - "Every error/404 response ships a non-empty Polish document <title> (WCAG 2.4.2, Level A) — WR-04, closed by plan 03-06 (folded into the +error.svelte artifact row, was previously a warning, not a scored-failed truth)."
  gaps_remaining:
    - "A malformed post entry never aborts the whole prerender (Plan 01 must-have) — plan 03-06 closed the two originally-verified crash paths (parseData(undefined), missing data+tresc+zajawka) but a new residual crash path was independently reproduced and is now the current gap: an entry with zajawka present and tresc missing/non-string is NOT rejected by postFromEntry, is spread through with tresc: undefined, and crashes the entire prerender at renderPost(post.tresc) via marked.parse(undefined). A non-string obraz has the same residual-crash shape via post.obraz.split('/')."
  regressions: []
gaps:
  - truth: "A malformed post entry (bad date or bad path) is skipped with a build warning and never aborts the whole prerender (Plan 01 must-have, dokumenty.ts precedent)"
    status: partial
    reason: "Plan 03-06 fixed the two crash paths verified in the prior VERIFICATION.md (parseData(undefined) on a missing/non-string data; missing tresc AND missing zajawka). But postFromEntry only type-checks entry.tresc inside the excerpt-fallback branch (the `else if (typeof entry.tresc === 'string')` at src/lib/server/aktualnosci.ts:99), which is skipped whenever zajawka is a non-empty string. The final `return { ...entry, ... }` spreads the unvalidated tresc (and obraz) through untouched. Independently reproduced: a crafted entry `{ tytul, data: '2026-08-01', zajawka: 'Krótki opis' }` (no tresc) passes postFromEntry and produces post.tresc === undefined; `marked.parse(undefined)` (the same call renderPost makes at src/routes/aktualnosci/[slug]/+page.svelte:42) throws `marked(): input parameter is undefined or null` — this call runs during SvelteKit's prerender of that route (entries() in +page.server.ts feeds every readAktualnosci() slug to the crawler), so it aborts the whole build, the exact failure mode the must-have rules out. A non-string truthy obraz (e.g. a number) has the same unvalidated-spread shape and throws TypeError at `post.obraz.split('/')` in both NewsCard.svelte:44 and the single-post page:39. This is independently confirmed by the codebase's own fresh 03-REVIEW.md (WR-01 in that report, reviewed 2026-08-13T22:54:52Z, after both gap-closure plans landed) and remains unfixed — no plan 03-07 exists."
    artifacts:
      - path: "src/lib/server/aktualnosci.ts"
        issue: "postFromEntry (lines ~78-113) validates entry.tresc only inside the zajawka-absent branch; when zajawka is present, tresc (and obraz) are spread through with no type guard, so a crafted/hand-edited entry with zajawka set but tresc missing (or non-string) is not rejected."
    missing:
      - "Require tresc unconditionally before the return (typeof entry.tresc !== 'string' || entry.tresc.trim() === '' -> warn + return null), independent of whether zajawka is present."
      - "Type-guard obraz/obraz_alt before the spread (typeof entry.obraz === 'string' ? entry.obraz : undefined), so a non-string obraz degrades to no-cover instead of throwing in NewsCard.svelte / the single-post page."
      - "Add unit cases to tests/aktualnosci-reader.unit.ts: { tytul, data, zajawka: 'x' } with no tresc returns null; an entry with obraz: 42 yields obraz: undefined (not a throw downstream)."
deferred: []
human_verification:
  - test: "Log into /admin on the deployed *.pages.dev CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on /aktualnosci and (if among the three newest) on the homepage, and that the resulting URL's date prefix matches the entered Data publikacji."
    expected: "The post round-trips through the live GitHub-OAuth login -> create -> commit -> Cloudflare rebuild -> live loop, renders correctly on both surfaces, and the URL date prefix is correct for whatever day of the month was entered (CR-01 fix should now make this true for every day, not just days 1-12)."
    why_human: "Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven. Deferred by Plan 03's human_verify_mode: end-of-phase."
---

# Phase 3: News (Aktualności) Verification Report

**Phase Goal:** Staff can publish news posts and visitors can read them, with the newest surfaced on the homepage.
**Verified:** 2026-08-14T00:10:00Z
**Status:** gaps_found
**Re-verification:** Yes — after gap closure (plans 03-05 CR-01, 03-06 WR-02/WR-04)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC1) A visitor can view a list of news posts, newest first | ✓ VERIFIED | Ran `npx playwright test tests/aktualnosci.spec.ts tests/home.spec.ts` live — 27/27 passed, including "wpisy renderują się od najnowszego (NEWS-01)". Order enforced in `src/lib/server/aktualnosci.ts:130-132` (sort by `iso` desc, slug tie-break). |
| 2 | (SC2) A visitor can open a single news post and read its full content | ✓ VERIFIED | All 7 single-post `tests/aktualnosci.spec.ts` cases passed live (200, single h1, full body, `<time datetime>`, back link, 404, axe AA). `entries()` in `src/routes/aktualnosci/[slug]/+page.server.ts` prerenders every `readAktualnosci()` slug. |
| 3 | (SC3a) Staff can create/edit/publish a post via the CMS without a developer (collection mechanics) | ✓ VERIFIED | `static/admin/config.yml` aktualnosci folder collection unchanged in mechanics: `create: true`, `folder: src/lib/content/aktualnosci`, `extension: json`, fields `tytul/data/zajawka/tresc/obraz/obraz_alt/placeholder` all Polish-labeled. |
| 4 | (SC3b / NEWS-03 D-06) A CMS-created post gets a correct publication-date-prefixed slug | ✓ **VERIFIED (was FAILED, now fixed — CR-01 closed)** | `static/admin/config.yml:201` slug is now `'{{fields.data}}-{{fields.tytul}}'` — plain field substitution, no `date` transformation filter (confirmed no `date(` anywhere in the file). The `data` field now stores ISO (`format: 'YYYY-MM-DD'`, config.yml:215) while `date_format: 'DD.MM.YYYY'` keeps the Polish picker. Removing the transformation filter entirely eliminates the whole class of mis-parse bug (no date-string parsing happens in the slug path anymore). `src/lib/server/aktualnosci.ts` `parseData` now parses `^(\d{4})-(\d{2})-(\d{2})$` to match. Both seed JSONs migrated to ISO `data` values and still render correctly (live test run, below). |
| 5 | (SC3c) The live create→publish→rebuild→live CMS loop works end to end | ? UNCERTAIN (human) | Deferred by Plan 03 (`human_verify_mode: end-of-phase`); requires live GitHub OAuth against the deployed CMS, not automatable. See Human Verification below (now sharper: also confirm the date-prefix fix holds live). |
| 6 | (SC4) The homepage's latest-Aktualności preview shows the most recently published posts | ✓ VERIFIED | "Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)" passed live. `src/routes/+page.server.ts` calls `readLatest(3)`; `+page.svelte` gates `NewsPreview` on `data.posts.length > 0`. |
| 7 | (Plan 01) Each card is a whole-card link to `/aktualnosci/{slug}`; imageless post renders the tint fallback; date renders in `<time datetime>` | ✓ VERIFIED | `src/lib/components/NewsCard.svelte:44-61` (basename cover lookup, tint fallback), `:66` (`<time datetime={iso}>`); live test confirms newest card href `/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`. |
| 8 | (Plan 01) A malformed post entry never aborts the whole prerender | ✗ **FAILED (residual gap — partially fixed by 03-06, not fully closed)** | The two crash paths verified as broken in the prior VERIFICATION.md are now fixed and pinned by `npm run test:unit` (10/10 passing, independently re-run). But a NEW/residual crash path was independently reproduced: an entry with `zajawka` set and `tresc` missing is not type-guarded (`postFromEntry`'s `tresc` check only runs in the excerpt-fallback branch, skipped when `zajawka` is present) and is spread through with `tresc: undefined`; `renderPost(post.tresc)` then calls `marked.parse(undefined)`, which I reproduced throwing `marked(): input parameter is undefined or null` in a live `node -e` run against the installed `marked` package. This call happens during `entries()`-driven prerender, so it aborts the whole build. `obraz` has the same unvalidated-spread shape. See Gaps below. |
| 9 | (Plan 02 / T-03-01) The post body renders a hardened full-block Markdown parse — raw HTML escaped, images to alt text, headings neutralized, GFM tables dropped (stored-XSS mitigation) | ✓ VERIFIED | `src/lib/markdown.ts` `blockMarked` overrides for `html`, `image`, `link`, `heading`, `table` unchanged and confirmed present; `npm run check` green. (WR-02/WR-04/WR-05/WR-06 in the fresh 03-REVIEW.md remain open non-blocking warnings on this surface — not a truth failure, tracked below.) |
| 10 | Requirements traceability: NEWS-01/02/03 mapped to Phase 3 with no orphans | ✓ VERIFIED | `.planning/REQUIREMENTS.md:26-28,129-131` marks all three Complete under Phase 3; six plans (01, 02, 03, 04, 05, 06) declare `requirements:` fields covering NEWS-01 (01, 04, 06), NEWS-02 (02, 06), NEWS-03 (03, 05) — no requirement ID unmapped, no orphans. |

**Score:** 8/10 truths verified (1 failed, 1 pending human verification)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/server/aktualnosci.ts` | `readAktualnosci()`/`readLatest(n)`, `PostEntry`/`PostWithMeta`, resilient `postFromEntry` | ⚠️ VERIFIED with a residual robustness defect | Exports confirmed; sort/slug/ISO-parse logic correct; `parseData`/`postFromEntry` correctly reject the two originally-flagged malformed shapes (unit-tested, 10/10 green) but still crash the whole build on a third shape (zajawka present + tresc missing/non-string, or non-string obraz) — see gap #8. |
| `src/lib/components/NewsCard.svelte` | Shared whole-card link, self-contained cover/tint-fallback | ✓ VERIFIED | Basename glob lookup, tint-fallback branch, `<time datetime>` all present; unchanged since prior verification. |
| `src/routes/aktualnosci/+page.svelte` + `+page.server.ts` | List route (NEWS-01) | ✓ VERIFIED | 200, single h1, newest-first order confirmed live. |
| `src/routes/aktualnosci/[slug]/+page.svelte` + `+page.server.ts` | Single-post route (NEWS-02) | ✓ VERIFIED | `entries()` prerenders every seed slug; `load()` 404s unknown slugs (confirmed live). |
| `src/routes/+error.svelte` | Friendly Polish 404/error page with a document title (D-08, WCAG 2.4.2) | ✓ VERIFIED (WR-04 closed) | `<svelte:head><title>` present, built from fixed `is404`-gated Polish strings + site name, never `page.error`; live 404 test now asserts `page.title()` is non-empty and matches "Nie znaleziono strony". |
| `static/admin/config.yml` (aktualnosci collection) | Polish folder collection, correct fields, ISO-stored `data`, plain-substitution slug | ✓ VERIFIED (CR-01 closed) | Fields, Polish labels, `date_format`/`format` split, plain slug template, no `date(` transformation anywhere in the file — all confirmed by direct file read. |
| `docs/instrukcja-cms.md` | Aktualności staff-guide section | ✓ VERIFIED | Section present, no debt markers, unchanged since prior verification. |
| `tests/aktualnosci.spec.ts` | List + single-post acceptance cases, strengthened 404 title assertion | ✓ VERIFIED | Read in full; 12 aktualnosci cases + 15 home cases all run live and passed (27/27). 404 case now asserts non-empty Polish title. |
| `tests/aktualnosci-reader.unit.ts` | Node-native reader-resilience unit suite | ✓ VERIFIED | Ran `npm run test:unit` live — 10/10 passing, including `postFromEntry returns null without throwing when data is missing`. Does NOT cover the residual zajawka+missing-tresc / non-string-obraz case (gap #8). |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `aktualnosci/+page.server.ts` | `readAktualnosci()` | direct import + call | ✓ WIRED | Confirmed in source. |
| `aktualnosci/[slug]/+page.server.ts` | `readAktualnosci()` | `entries()` + `load()` find-by-slug, `error(404)` | ✓ WIRED | Confirmed; 404 test passed live with title assertion. |
| `+page.svelte` (single post) | `renderPost()` | `{@html renderPost(post.tresc)}` | ⚠️ WIRED but unsafe on malformed input | Confirmed wired for valid posts; crashes (not gracefully) when `post.tresc` is `undefined` for a malformed entry that slipped past `postFromEntry` — see gap #8. |
| `src/routes/+page.server.ts` | `readLatest(3)` | direct import + call | ✓ WIRED | Confirmed in source. |
| `src/routes/+page.svelte` | `NewsPreview` | `{#if showNews}<NewsPreview posts={data.posts} />` | ✓ WIRED | Confirmed in source. |
| `static/admin/config.yml` aktualnosci collection | `src/lib/content/aktualnosci/*.json` | `folder:` config | ✓ WIRED | Field keys match `PostEntry` 1:1. |
| CMS slug template | on-disk filename read by `aktualnosci.ts` | plain `{{fields.data}}` substitution (no transformation filter) | ✓ **FIXED** (was BROKEN) | The mis-parsing `date` filter is gone entirely; a plain substitution of an ISO-stored field cannot mis-parse. Confirmed by direct config.yml read and absence of any `date(` call in the file. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `aktualnosci/+page.svelte` | `data.posts` | `readAktualnosci()` via `+page.server.ts` load | Yes — two real seed posts, ISO dates | ✓ FLOWING |
| `+page.svelte` (single post) | `data.post` | `readAktualnosci().find(...)` | Yes, for well-formed entries; throws (not gracefully skips) for the residual malformed shape in gap #8 | ⚠️ FLOWING WITH A CRASH PATH |
| homepage `+page.svelte` | `data.posts` | `readLatest(3)` | Yes — three (here two) newest real posts | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full Playwright suite for aktualnosci + home | `npx playwright test tests/aktualnosci.spec.ts tests/home.spec.ts` | 27 passed (10.9s) | ✓ PASS |
| Reader resilience unit suite | `npm run test:unit` | 10 passed, 0 failed | ✓ PASS |
| Type-check + a11y check | `npm run check` | 4181 files, 0 errors, 0 warnings | ✓ PASS |
| Lint | `npm run lint` | Prettier + eslint clean | ✓ PASS |
| CMS slug plain substitution (no more `date` filter) | `grep -n "date(" static/admin/config.yml` | no matches | ✓ PASS (confirms CR-01 fix) |
| 404 page carries a non-empty Polish title | live-run "nieznany slug zwraca 404 (D-08)" case, plus manual `page.title()` assertions read in `tests/aktualnosci.spec.ts:109-117` | passed | ✓ PASS |
| Residual crash: `postFromEntry` with `zajawka` set + `tresc` missing | `node -e` reproducing the postFromEntry spread logic + `marked.parse(post.tresc)` | `post.tresc = undefined`; `marked.parse(undefined)` throws `marked(): input parameter is undefined or null` | ✗ **FAIL** (new gap, see #8) |
| Residual crash: non-string `obraz` | source read of `NewsCard.svelte:44` / `[slug]/+page.svelte:39` — `post.obraz.split('/')` with no type guard on `obraz` in `postFromEntry`'s spread | Confirmed unguarded (not independently executed — `enhanced:img`/glob machinery not runnable in a quick node script; source-level proof deemed sufficient given the crash pattern is byte-identical to the reproduced `tresc` case) | ✗ **FAIL** (same gap #8, second instance) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|--------------|--------|----------|
| NEWS-01 | 03-01, 03-04, 03-06 | Visitor views news list newest-first; homepage surfaces newest; reader resilience | ✓ SATISFIED | List + homepage live tests both passed; reader hardening unit-tested (with the gap #8 residual noted separately — does not block the core NEWS-01 truths, which are about list/order/homepage). |
| NEWS-02 | 03-02, 03-06 | Visitor opens single post, reads full content; error page has a title | ✓ SATISFIED | Single-post route live, entries()-prerendered, 404 for unknown slugs confirmed with title assertion. |
| NEWS-03 | 03-03, 03-05 | Staff create/edit/publish via CMS without a developer | ✓ SATISFIED | Collection mechanics wired and Polish; the D-06 date-prefixed-slug sub-requirement is now fixed (CR-01 closed) via ISO storage + plain substitution. |

No orphaned requirements: `.planning/REQUIREMENTS.md` traceability table maps exactly NEWS-01/02/03 to Phase 3, matching all six plans' declared `requirements:` fields.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/server/aktualnosci.ts` | `postFromEntry` (~78-113) | `tresc`/`obraz` type-checked only inside the excerpt-fallback branch, spread through unguarded when `zajawka` is present | 🛑 Blocker | Falsifies the Plan-01 "malformed entry never aborts the whole prerender" must-have via a residual crash path; independently reproduced (gap #8). |
| `src/lib/markdown.ts` | `SAFE_HREF` regex | Allows protocol-relative URLs (`//evil.example`) despite documented "same-site only" intent | ⚠️ Warning (carried, unfixed) | Narrow off-site-redirect gap for a compromised editor account (03-REVIEW.md, current). Does not falsify the truth #9 must-have wording. |
| `src/lib/server/aktualnosci.ts` | excerpt derivation | Raw Markdown syntax leaks into card/meta excerpts when `zajawka` is empty | ⚠️ Warning (carried, unfixed) | Cosmetic/SEO defect, not a truth failure. |
| `src/lib/markdown.ts` | `blockMarked` renderer | GFM checkboxes/code-blocks/blockquotes/`<hr>` still reach the DOM | ℹ️ Info (carried, unfixed) | Outside the literal must-have wording. |
| `docs/instrukcja-cms.md` | intro + login step 4 | Manual's orientation lists three panel sections, omitting Aktualności | ℹ️ Info (carried, unfixed) | Documentation-only, non-blocking. |
| `src/lib/components/NewsPreview.svelte` | empty-state branch | Dead code (homepage gates on `posts.length > 0`) | ℹ️ Info (carried, unfixed) | Non-blocking refactor item. |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK` debt markers found in any Phase 3 source file modified since the prior verification (direct grep, zero matches).

### Human Verification Required

### 1. Live CMS publish loop (end of phase, deferred by Plan 03)

**Test:** Log into `/admin` on the deployed `*.pages.dev` CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on `/aktualnosci` and (if among the three newest) on the homepage.
**Expected:** The post round-trips through the live GitHub-OAuth login → create → commit → Cloudflare rebuild → live loop and renders correctly on both surfaces, with a URL date prefix matching the entered `Data publikacji` for whatever day of the month was chosen.
**Why human:** Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven.

### Gaps Summary

One concrete, independently-reproduced defect remains, and it is a residual/incomplete fix of a gap that was reported as closed by plan 03-06:

1. **Residual WR-02 (Blocker, falsifies a Plan-01 must-have):** `postFromEntry` in `src/lib/server/aktualnosci.ts` only type-guards `entry.tresc` inside the branch taken when `zajawka` is absent. When `zajawka` is a non-empty string, `tresc` (and `obraz`) are spread through the returned `PostWithMeta` with no validation at all. A hand-edited or partially-committed post JSON with `zajawka` set but `tresc` missing (or a non-string `tresc`) is therefore NOT skipped — it passes the reader, gets an `entries()` route, and crashes the entire prerender when `renderPost(post.tresc)` calls `marked.parse(undefined)` (independently reproduced: `marked(): input parameter is undefined or null`). A non-string `obraz` has the identical unguarded-spread shape and throws `TypeError` at `post.obraz.split('/')` in both `NewsCard.svelte` and the single-post page. This is the exact failure mode (one bad post JSON takes down the whole build) that plan 03-06 was chartered to close, and that plan did close the two specific shapes verification originally reproduced — but not this third shape. The codebase's own fresh `03-REVIEW.md` (dated after both gap-closure plans landed) independently found and documented this same defect as WR-01 in that report; no follow-up plan has yet closed it.

Everything else improved cleanly since the last verification: CR-01 (the broken CMS slug date-prefix) is fully closed via ISO storage + plain field substitution — confirmed by direct config read, the disappearance of any `date()` transformation call, and 27/27 passing Playwright tests plus 10/10 passing reader unit tests. WR-04 (untitled error page) is fully closed and pinned by an automated 404 title assertion. The visitor-facing reading experience (NEWS-01, NEWS-02) and homepage surfacing (roadmap SC4) remain solid. The one remaining gap is narrowly scoped to a single reader function and does not require touching the CMS config, the routes, or the markdown sanitizer.

---

_Verified: 2026-08-14T00:10:00Z_
_Verifier: Claude (gsd-verifier)_
