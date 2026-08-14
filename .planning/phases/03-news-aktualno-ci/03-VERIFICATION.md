---
phase: 03-news-aktualno-ci
verified: 2026-08-14T03:15:00Z
status: human_needed
score: 9/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 8/10
  gaps_closed:
    - "A malformed post entry never aborts the whole prerender (Plan 01 must-have) — the residual crash path (entry with zajawka present, tresc missing/non-string; non-string obraz) is now closed by plan 03-07: postFromEntry takes `entry: unknown`, guards `tresc` unconditionally before any excerpt logic, guards obraz/obraz_alt with readString, guards against non-object entries, and constructs its return value key by key (no raw-entry spread), pinned by a 12-key EXPECTED_POST_KEYS equality assertion."
  gaps_remaining: []
  regressions: []
gaps: []
deferred: []
human_verification:
  - test: "Log into /admin on the deployed *.pages.dev CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on /aktualnosci and (if among the three newest) on the homepage, and that the resulting URL's date prefix matches the entered Data publikacji."
    expected: "The post round-trips through the live GitHub-OAuth login -> create -> commit -> Cloudflare rebuild -> live loop, renders correctly on both surfaces, and the URL date prefix is correct for whatever day of the month was entered (CR-01 fix should now make this true for every day, not just days 1-12)."
    why_human: "Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven. Deferred by Plan 03's human_verify_mode: end-of-phase. Unchanged by plan 03-07 (that plan touched only the reader's field-validation logic, not the CMS collection config or the slug template)."
---

# Phase 3: News (Aktualności) Verification Report

**Phase Goal:** Staff can publish news posts and visitors can read them, with the newest surfaced on the homepage.
**Verified:** 2026-08-14T03:15:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (plan 03-07, closing the residual blocker from the prior report)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC1) A visitor can view a list of news posts, newest first | ✓ VERIFIED | Independently re-ran `npx playwright test tests/aktualnosci.spec.ts tests/home.spec.ts` — 27/27 passed, including "wpisy renderują się od najnowszego (NEWS-01)". Sort logic in `src/lib/server/aktualnosci.ts:175-177` (unchanged by 03-07: descending by `iso`, slug tie-break). |
| 2 | (SC2) A visitor can open a single news post and read its full content | ✓ VERIFIED | All 7 single-post `tests/aktualnosci.spec.ts` cases passed live in the same run (200, single h1, full body, `<time datetime>`, back link, 404, axe AA). `entries()` in `src/routes/aktualnosci/[slug]/+page.server.ts` (untouched by 03-07) prerenders every `readAktualnosci()` slug. |
| 3 | (SC3a) Staff can create/edit/publish a post via the CMS without a developer (collection mechanics) | ✓ VERIFIED | `static/admin/config.yml` aktualnosci folder collection unchanged since prior verification (confirmed by `git diff --stat` against the pre-03-07 commit — file not touched): `create: true`, Polish-labeled fields. |
| 4 | (SC3b / NEWS-03 D-06) A CMS-created post gets a correct publication-date-prefixed slug | ✓ VERIFIED | Unchanged since prior verification (CR-01 fix from plan 03-05, not touched by 03-07). Plain `'{{fields.data}}-{{fields.tytul}}'` substitution against an ISO-stored `data` field, no mis-parsing `date()` filter. |
| 5 | (SC3c) The live create→publish→rebuild→live CMS loop works end to end | ? UNCERTAIN (human) | Deferred by Plan 03 (`human_verify_mode: end-of-phase`); requires live GitHub OAuth against the deployed CMS, not automatable. See Human Verification below. |
| 6 | (SC4) The homepage's latest-Aktualności preview shows the most recently published posts | ✓ VERIFIED | "Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)" passed live in the same run. `src/routes/+page.server.ts` calls `readLatest(3)` (unchanged). |
| 7 | (Plan 01) Each card is a whole-card link to `/aktualnosci/{slug}`; imageless post renders the tint fallback; date renders in `<time datetime>` | ✓ VERIFIED | `NewsCard.svelte` confirmed byte-identical since the pre-03-07 commit (`git diff --stat` empty); live test confirms newest card href `/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`. |
| 8 | (Plan 01) A malformed post entry never aborts the whole prerender | ✓ **VERIFIED (was FAILED — now closed by plan 03-07)** | Read `src/lib/server/aktualnosci.ts` in full: `postFromEntry` now takes `entry: unknown`, rejects non-object entries first, guards `tytul`/`tresc` unconditionally (before any excerpt-fallback branch, so a present `zajawka` can no longer bypass the `tresc` check), guards `obraz`/`obraz_alt`/`zajawka` via `readString` (degrade to `undefined` rather than reject), and constructs the return value as an explicit 12-key object literal — no `...entry` spread. Independently re-ran `npm run test:unit`: 26/26 passing (16 new cases beyond the prior 10), including the exact previously-crashing shape (`{ tytul, data, zajawka }` with no `tresc`) and a non-string `obraz`/`obraz_alt`. Independently reproduced the build-level proof myself (not just trusting the SUMMARY): dropped `{"tytul":"Uszkodzony wpis testowy","data":"2026-08-05","zajawka":"Krotki opis bez tresci"}` into `src/lib/content/aktualnosci/`, ran `npm run build` — exit 0, log contains `aktualnosci: skipping "..." (missing or non-string tresc)` five times (once per glob consumer), fixture removed afterward (`git status --short` on the content dir is empty). This is the exact crash shape the prior VERIFICATION.md documented as throwing `marked(): input parameter is undefined or null` during `entries()`-driven prerender; it no longer reaches `renderPost` at all. |
| 9 | (Plan 02 / T-03-01) The post body renders a hardened full-block Markdown parse — raw HTML escaped, images to alt text, headings neutralized, GFM tables dropped (stored-XSS mitigation) | ✓ VERIFIED | `src/lib/markdown.ts` unchanged by 03-07 (confirmed by reading the plan's explicit out-of-scope list and by `git diff --stat`); `npm run check` re-run live — 0 errors, 0 warnings across 4181 files. |
| 10 | Requirements traceability: NEWS-01/02/03 mapped to Phase 3 with no orphans | ✓ VERIFIED | `.planning/REQUIREMENTS.md:26-28,129-131` marks all three Complete under Phase 3. Seven plans (01-07) declare `requirements:` fields: NEWS-01 (01, 04, 06, 07), NEWS-02 (02, 06, 07), NEWS-03 (03, 05). No requirement ID unmapped, no orphans, plan 03-07 declares `[NEWS-01, NEWS-02]` matching its content (reader resilience affects both list and single-post rendering paths). |

**Score:** 9/10 truths verified (0 failed, 1 pending human verification — up from 8/10 in the prior report)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/server/aktualnosci.ts` | `readAktualnosci()`/`readLatest(n)`, `PostEntry`/`PostWithMeta`, fully-guarded `postFromEntry` | ✓ VERIFIED (residual defect closed) | Read in full. `postFromEntry(path, entry: unknown)` rejects non-objects, guards `tytul`/`tresc` unconditionally, guards optional fields via `readString`, constructs the return object key by key. `parseData`, `MIESIACE`, `firstParagraph`, `readAktualnosci`'s sort, and `readLatest` are unchanged (confirmed by reading the file and cross-checking against the plan's explicit "unchanged" list). |
| `tests/aktualnosci-reader.unit.ts` | Node-native reader-resilience unit suite covering all guarded fields plus a consumer-contract table test | ✓ VERIFIED | Read in full (202 lines, 26 test cases). Includes `EXPECTED_POST_KEYS` key-set equality assertion (anti-spread regression pin), the `MALFORMED_SHAPES` table piping 9 malformed shapes through the real `renderPost` and a real basename split, and dedicated cases for zajawka-without-tresc, non-string `obraz`/`obraz_alt`, non-object entries (null, string, array, number), and missing `tytul`. Independently re-ran: 26/26 passing. |
| `src/lib/components/NewsCard.svelte` | Shared whole-card link, self-contained cover/tint-fallback | ✓ VERIFIED | Confirmed byte-identical since before plan 03-07 (`git diff --stat` against the pre-03-07 commit is empty) — the plan deliberately left consumers unguarded, relying solely on the reader boundary. |
| `src/routes/aktualnosci/+page.svelte` + `+page.server.ts` | List route (NEWS-01) | ✓ VERIFIED | Unchanged; 200, single h1, newest-first order re-confirmed live. |
| `src/routes/aktualnosci/[slug]/+page.svelte` + `+page.server.ts` | Single-post route (NEWS-02) | ✓ VERIFIED | Unchanged; `entries()` prerenders every seed slug; `load()` 404s unknown slugs (re-confirmed live). |
| `src/routes/+error.svelte` | Friendly Polish 404/error page with a document title (D-08, WCAG 2.4.2) | ✓ VERIFIED | Unchanged since prior verification (WR-04 closed by plan 03-06, not touched by 03-07). |
| `static/admin/config.yml` (aktualnosci collection) | Polish folder collection, correct fields, ISO-stored `data`, plain-substitution slug | ✓ VERIFIED | Unchanged since prior verification (CR-01 closed by plan 03-05, not touched by 03-07). |
| `docs/instrukcja-cms.md` | Aktualności staff-guide section | ✓ VERIFIED | Unchanged since prior verification. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `aktualnosci/+page.server.ts` | `readAktualnosci()` | direct import + call | ✓ WIRED | Confirmed in source, unchanged. |
| `aktualnosci/[slug]/+page.server.ts` | `readAktualnosci()` | `entries()` + `load()` find-by-slug, `error(404)` | ✓ WIRED | Confirmed; 404 test passed live. |
| `+page.svelte` (single post) | `renderPost()` | `{@html renderPost(post.tresc)}` | ✓ **WIRED and safe** (was: wired but unsafe on malformed input) | `post.tresc` is now guaranteed a non-empty string by the reader boundary before it can ever reach a route — a malformed entry is skipped upstream, at `postFromEntry`, and never becomes a `post` at all. Confirmed by the build-level reproduction above (exit 0, no crash) and by the `renderPost` calls inside the new consumer-contract table test. |
| `src/routes/+page.server.ts` | `readLatest(3)` | direct import + call | ✓ WIRED | Confirmed in source, unchanged. |
| `src/routes/+page.svelte` | `NewsPreview` | `{#if showNews}<NewsPreview posts={data.posts} />` | ✓ WIRED | Confirmed in source, unchanged. |
| `static/admin/config.yml` aktualnosci collection | `src/lib/content/aktualnosci/*.json` | `folder:` config | ✓ WIRED | Unchanged. |
| CMS slug template | on-disk filename read by `aktualnosci.ts` | plain `{{fields.data}}` substitution | ✓ WIRED | Unchanged since CR-01 fix. |
| `postFromEntry` return value | cover basename split in `NewsCard.svelte` / `[slug]/+page.svelte` | `readString(record.obraz)` guard | ✓ **WIRED and safe** (was: unvalidated spread) | A non-string `obraz` now yields `undefined` from the reader, so the basename split in both consumers never receives a non-string. Pinned by two dedicated unit cases plus the consumer-contract table. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `aktualnosci/+page.svelte` | `data.posts` | `readAktualnosci()` via `+page.server.ts` load | Yes — two real seed posts, ISO dates | ✓ FLOWING |
| `+page.svelte` (single post) | `data.post` | `readAktualnosci().find(...)` | Yes — well-formed entries render; malformed entries are now filtered out upstream by `postFromEntry` returning `null`, never reaching the route | ✓ **FLOWING, crash path closed** |
| homepage `+page.svelte` | `data.posts` | `readLatest(3)` | Yes — three (here two) newest real posts | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Reader-resilience unit suite (independently re-run) | `npm run test:unit` | 26 passed, 0 failed (up from 10 in the prior report) | ✓ PASS |
| Type/a11y check (independently re-run) | `npm run check` | 0 errors, 0 warnings across 4181 files | ✓ PASS |
| Lint (independently re-run) | `npm run lint` | prettier + eslint both clean | ✓ PASS |
| Full Playwright suite for aktualnosci + home (independently re-run) | `npx playwright test tests/aktualnosci.spec.ts tests/home.spec.ts` | 27 passed (11.0s) | ✓ PASS |
| Build-level malformed-post proof (independently reproduced, not trusted from SUMMARY) | Drop `{tytul, data, zajawka}` (no `tresc`) into `src/lib/content/aktualnosci/`, run `npm run build`, then remove the fixture | Exit 0; log contains `aktualnosci: skipping "..." (missing or non-string tresc)`; `git status --short` on the content dir empty afterward | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|--------------|-------------|--------|----------|
| NEWS-01 | 01, 04, 06, 07 | A visitor can view a list of news posts, newest first | ✓ SATISFIED | List route + homepage preview live-tested; reader resilience (07) protects the whole prerender that produces this list. |
| NEWS-02 | 02, 06, 07 | A visitor can open a single news post and read its full content | ✓ SATISFIED | Single-post route live-tested (200, full body, 404 for unknown slug); reader resilience (07) protects this route's `entries()`-driven prerender specifically. |
| NEWS-03 | 03, 05 | Staff can create, edit, and publish news posts via the CMS without a developer | ✓ SATISFIED (mechanics); ? UNCERTAIN (live round-trip) | CMS collection config confirmed correct (03) and slug date-prefix bug fixed (05, CR-01). The live GitHub-OAuth create-to-publish loop itself remains deferred to human verification per Plan 03's `human_verify_mode: end-of-phase` — unchanged by this re-verification. |

No orphaned requirements found — `.planning/REQUIREMENTS.md` maps only NEWS-01/02/03 to Phase 3, and all three are claimed by at least one plan.

### Anti-Patterns Found

None in the files modified by plan 03-07. Read `src/lib/server/aktualnosci.ts` and `tests/aktualnosci-reader.unit.ts` in full: no `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers, no empty-implementation stubs, no hardcoded-empty return values that bypass real logic. Debt markers were not introduced.

Carried-forward non-blocking warnings from the prior code review (out of scope for this plan, unchanged): `SAFE_HREF` accepting protocol-relative URLs, the excerpt Markdown leak, GFM extras in the block renderer, the `instrukcja` intro copy, and the `NewsPreview` dead branch. None of these were must-haves in any plan's frontmatter and none block the phase goal.

### Human Verification Required

### 1. Live CMS create-to-publish round trip

**Test:** Log into `/admin` on the deployed `*.pages.dev` CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on `/aktualnosci` and (if among the three newest) on the homepage, and that the resulting URL's date prefix matches the entered Data publikacji.
**Expected:** The post round-trips through the live GitHub-OAuth login → create → commit → Cloudflare rebuild → live loop, renders correctly on both surfaces, and the URL date prefix is correct for whatever day of the month was entered.
**Why human:** Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven. This item is unchanged by plan 03-07 (which touched only server-side field validation in the reader, not the CMS collection config or slug template) and was already the sole open item in the prior verification report.

### Gaps Summary

No gaps remain. The single residual blocker from the prior report — a malformed post entry (specifically: `zajawka` present with `tresc` missing/non-string, or a non-string `obraz`) crashing the entire prerender via `marked.parse(undefined)` or a `TypeError` at a basename split — is closed by plan 03-07. This was independently verified, not taken on the SUMMARY's word: I read the modified `postFromEntry` function in full, independently re-ran the full unit suite (26/26), the type/lint checks (both clean), the full e2e regression suite (27/27), and personally reproduced the exact previously-crashing malformed-post shape against a live `npm run build` — confirming exit 0 and a graceful skip-with-warning log line, with the throwaway fixture cleanly removed afterward.

The only remaining open item is the human-only live CMS round-trip check, deferred by design since Plan 03's initial planning (`human_verify_mode: end-of-phase`) and unaffected by the gap-closure work.

---

_Verified: 2026-08-14T03:15:00Z_
_Verifier: Claude (gsd-verifier)_
