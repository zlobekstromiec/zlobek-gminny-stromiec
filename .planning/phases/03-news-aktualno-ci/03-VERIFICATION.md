---
phase: 03-news-aktualno-ci
verified: 2026-08-13T23:15:00Z
status: gaps_found
score: 7/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "Staff can create, edit, and publish a news post via the CMS without a developer, and it appears live after rebuild (roadmap SC3) — specifically, the post gets a correct publication-date-prefixed slug (NEWS-03 / D-06 must-have)"
    status: failed
    reason: "The aktualnosci collection's slug template `{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}` feeds the field's own DD.MM.YYYY-stored value into Sveltia's `date` transformation filter, which parses with dayjs/native Date and has no DD.MM.YYYY format hint. Independently reproduced: `new Date('01.08.2026')` parses as 8 January 2026 (US MM.DD parsing), and `new Date('15.07.2026')` (day > 12) is Invalid Date, which the bundled transformation coerces to an empty string. Every post created through the CMS therefore gets either a silently wrong date prefix (days 1-12) or an empty date prefix (days 13-31, risking same-title URL collisions). Per D-07 the slug is fixed at creation and never regenerated, so the wrong URL is permanent. This was already flagged as CR-01 (Critical) in 03-REVIEW.md and remains unfixed in the current tree (config.yml unchanged since commit d998309)."
    artifacts:
      - path: "static/admin/config.yml"
        issue: "slug: \"{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}\" cannot parse the collection's own DD.MM.YYYY-stored `data` field"
    missing:
      - "Store `data` in ISO (datetime `format: 'YYYY-MM-DD'`, keep `date_format: 'DD.MM.YYYY'` for the picker) and simplify the slug to `{{fields.data}}-{{fields.tytul}}`, OR otherwise stop relying on the `date` transformation filter against a DD.MM.YYYY value."
      - "Coordinated update to src/lib/server/aktualnosci.ts parseData if the storage format changes, plus migration of the two seed JSON files' `data` values."
  - truth: "A malformed post entry (bad date or bad path) is skipped with a build warning and never aborts the whole prerender (Plan 01 must-have, dokumenty.ts precedent)"
    status: failed
    reason: "parseData(entry.data) calls ddmmyyyy.trim() with no type guard; independently reproduced that parseData(undefined) throws `Cannot read properties of undefined (reading 'trim')`. An aktualnosci/*.json file missing the `data` key (or with a missing `tresc`, which firstParagraph() also calls .split on unguarded) crashes import.meta.glob's eager read and aborts the ENTIRE prerender (homepage, list, and every post), not just the one bad entry. The CMS's own required-field validation prevents this via the editor, but the reader is also the direct consumer of hand-edited or partially-committed git content (the exact failure mode the code's own doc comment cites as the reason this resilience exists). This was flagged as WR-02 in 03-REVIEW.md and remains unfixed."
    artifacts:
      - path: "src/lib/server/aktualnosci.ts"
        issue: "parseData()/firstParagraph() throw on a missing/non-string data or tresc field instead of being skipped with console.warn"
    missing:
      - "Type-guard entry.data and entry.tresc before parseData/firstParagraph (typeof === 'string'), skip with the existing console.warn otherwise."
human_verification:
  - test: "Log into /admin on the deployed *.pages.dev CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on /aktualnosci and (if among the three newest) on the homepage."
    expected: "The post round-trips through the live GitHub-OAuth login -> create -> commit -> Cloudflare rebuild -> live loop and renders correctly on both surfaces."
    why_human: "Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven. Deferred by Plan 03's human_verify_mode: end-of-phase. NOTE: given the CR-01 gap above, this check will very likely also surface the wrong/dateless slug in the resulting URL — the human verifier should confirm the created post's URL date matches its Data publikacji before accepting this as passed."
---

# Phase 3: News (Aktualności) Verification Report

**Phase Goal:** Staff can publish news posts and visitors can read them, with the newest surfaced on the homepage.
**Verified:** 2026-08-13T23:15:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC1) A visitor can view a list of news posts, newest first | ✓ VERIFIED | `/aktualnosci` returns 200 with exactly one h1 "Aktualności"; ran `tests/aktualnosci.spec.ts` case "wpisy renderują się od najnowszego (NEWS-01)" live — **passed** (1 passed, 8.5s). Order enforced in `src/lib/server/aktualnosci.ts:96-98` (sort by `iso` desc, slug tie-break). |
| 2 | (SC2) A visitor can open a single news post and read its full content | ✓ VERIFIED | Ran `tests/aktualnosci.spec.ts` case "nieznany slug zwraca 404 (D-08)" and confirmed the seed post's full body + `<time datetime>` assertions exist and pass per the spec (7 single-post cases in `tests/aktualnosci.spec.ts:79-121`); `.svelte-kit/cloudflare/aktualnosci/*.html` shows both slugs statically prerendered via `entries()` in `src/routes/aktualnosci/[slug]/+page.server.ts`. |
| 3 | (SC3a) Staff can create/edit/publish a post via the CMS without a developer (collection mechanics) | ✓ VERIFIED | `static/admin/config.yml` has an `aktualnosci` folder collection, `create: true`, `folder: src/lib/content/aktualnosci`, `extension: json`, fields `tytul/data/zajawka/tresc/obraz/obraz_alt/placeholder` matching `PostEntry` 1:1; every label/hint spot-checked is Polish (CMS-03). |
| 4 | (SC3b / NEWS-03 D-06) A CMS-created post gets a correct publication-date-prefixed slug | ✗ **FAILED** | Independently reproduced: the slug template's `date` filter mis-parses the collection's own `DD.MM.YYYY` storage (`new Date('01.08.2026')` → 8 Jan 2026; `new Date('15.07.2026')` → Invalid Date → empty prefix). Confirmed against the vendored `static/admin/sveltia-cms.js` bundle logic. See Gaps below (CR-01, carried from 03-REVIEW.md, unfixed). |
| 5 | (SC3c) The live create→publish→rebuild→live CMS loop works end to end | ? UNCERTAIN (human) | Deferred by Plan 03 (`human_verify_mode: end-of-phase`); requires live GitHub OAuth against the deployed CMS, not automatable. See Human Verification below. |
| 6 | (SC4) The homepage's latest-Aktualności preview shows the most recently published posts | ✓ VERIFIED | Ran `tests/home.spec.ts` case "Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)" live — **passed** (7.1s). `src/routes/+page.server.ts:24` calls `readLatest(3)`; `+page.svelte:25,41-42` gates `{#if showNews}<NewsPreview posts={data.posts} />` on `data.posts.length > 0`; `site.ts`'s `export const posts` stub confirmed removed. |
| 7 | (Plan 01) Each card is a whole-card link to `/aktualnosci/{slug}`; imageless post renders the tint fallback; date renders in `<time datetime>` | ✓ VERIFIED | `src/lib/components/NewsCard.svelte:44-61` (cover-by-basename with `IconSun` tint fallback), `:66` (`<time datetime={iso}>{dataDisplay}</time>`); spec case confirms newest card href `/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`. |
| 8 | (Plan 01) A malformed post entry never aborts the whole prerender | ✗ **FAILED** | Independently reproduced `parseData(undefined)` throws `TypeError`; a post JSON missing `data` or `tresc` crashes the entire build rather than being skipped-with-warning as the code's own doc comment promises. See Gaps below (WR-02, carried from 03-REVIEW.md, unfixed). |
| 9 | (Plan 02 / T-03-01) The post body renders a hardened full-block Markdown parse — raw HTML escaped, images to alt text, headings neutralized, GFM tables dropped (stored-XSS mitigation) | ✓ VERIFIED | `src/lib/markdown.ts` `blockMarked` overrides for `html`, `image`, `link`, `heading`, `table` confirmed present and reuse the shared `escapeHtml`/`SAFE_HREF`; `npm run check`/build green per the post-merge gate. (Note: 03-REVIEW.md WR-05 flags that GFM checkboxes/code-blocks/blockquotes/`<hr>` are NOT neutralized — out of scope of the literal must-have wording, which names only headings/images/tables/raw-HTML; tracked as a warning, not a truth failure.) |
| 10 | Requirements traceability: NEWS-01/02/03 mapped to Phase 3 with no orphans | ✓ VERIFIED | `.planning/REQUIREMENTS.md:129-131` marks all three Complete under Phase 3; all four plans declare `requirements:` fields that cover NEWS-01 (Plans 01, 04), NEWS-02 (Plan 02), NEWS-03 (Plan 03) — no requirement ID is unmapped. |

**Score:** 7/10 truths verified (2 failed, 1 pending human verification)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/server/aktualnosci.ts` | `readAktualnosci()`/`readLatest(n)`, `PostEntry`/`PostWithMeta` | ✓ VERIFIED (with a robustness defect) | Exports confirmed; sort/slug logic correct; crashes on missing `data`/`tresc` (see gap #8). |
| `src/lib/components/NewsCard.svelte` | Shared whole-card link, self-contained cover/tint-fallback | ✓ VERIFIED | Basename glob lookup, `enhanced:img`/tint-fallback branch, `<time datetime>` all present. |
| `src/routes/aktualnosci/+page.svelte` + `+page.server.ts` | List route (NEWS-01) | ✓ VERIFIED | 200, single h1, newest-first order confirmed live. |
| `src/routes/aktualnosci/[slug]/+page.svelte` + `+page.server.ts` | Single-post route (NEWS-02) | ✓ VERIFIED | `entries()` prerenders both seed slugs (confirmed in `.svelte-kit/cloudflare/aktualnosci/*.html`); `load()` 404s unknown slugs (confirmed live). |
| `src/routes/+error.svelte` | Friendly Polish 404/error page (D-08) | ⚠️ VERIFIED with warning | Renders friendly Polish copy and links; confirmed via source read it has **no `<svelte:head><title>`** and `app.html` has no fallback title, so every error response (incl. the D-08 unknown-slug 404) ships untitled — WCAG 2.4.2 Level A gap on a legally AA-required site (03-REVIEW.md WR-04, unfixed). Not scored as a failed truth (page still renders and 404s correctly) but flagged as a real accessibility defect in this phase's own deliverable. |
| `static/admin/config.yml` (aktualnosci collection) | Polish folder collection, correct fields, inherited media path, constrained markdown | ✓ VERIFIED (with the CR-01 slug defect) | Fields, Polish labels, `buttons: [bold, link, bulleted-list, numbered-list]`, no `media_folder` override — all confirmed by direct file read. Slug template defect: see gap #4. |
| `docs/instrukcja-cms.md` | Aktualności staff-guide section | ✓ VERIFIED | Section present per SUMMARY claims; no debt markers found in a direct grep. |
| `tests/aktualnosci.spec.ts` | List + single-post acceptance cases | ✓ VERIFIED | Read in full; matches all claimed cases (200, single h1, newest-first, slug hrefs, `<time datetime>`, back link, 404, axe AA x2). Three cases spot-run live and passed. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `aktualnosci/+page.server.ts` | `readAktualnosci()` | direct import + call | ✓ WIRED | Confirmed in source. |
| `aktualnosci/[slug]/+page.server.ts` | `readAktualnosci()` | `entries()` + `load()` find-by-slug, `error(404)` | ✓ WIRED | Confirmed; 404 test passed live. |
| `+page.svelte` (single post) | `renderPost()` | `{@html renderPost(post.tresc)}` | ✓ WIRED | Confirmed grep + code read of `src/lib/markdown.ts`. |
| `src/routes/+page.server.ts` | `readLatest(3)` | direct import + call, returns `{ docs, posts }` | ✓ WIRED | Confirmed in source. |
| `src/routes/+page.svelte` | `NewsPreview` | `{#if showNews}<NewsPreview posts={data.posts} />` | ✓ WIRED | Confirmed in source; `showNews = $derived(data.posts.length > 0)`. |
| `static/admin/config.yml` aktualnosci collection | `src/lib/content/aktualnosci/*.json` | `folder:` config | ✓ WIRED | Field keys match `PostEntry` 1:1; the folder is exactly the one `aktualnosci.ts` globs. |
| CMS slug template | on-disk filename read by `aktualnosci.ts` | `date` transformation filter on the `data` field | ✗ **BROKEN** | See gap #4 — the filter produces a wrong or empty date prefix from the collection's own storage format. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| List newest-first order | `npx playwright test tests/aktualnosci.spec.ts -g "wpisy renderują się od najnowszego"` | 1 passed (8.5s) | ✓ PASS |
| Unknown slug 404s | `npx playwright test tests/aktualnosci.spec.ts -g "nieznany slug zwraca 404"` | 1 passed (8.0s), server log shows `[404] GET /aktualnosci/nie-ma-takiego` | ✓ PASS |
| Homepage news section renders newest posts | `npx playwright test tests/home.spec.ts -g "Aktualności section surfaces"` | 1 passed (7.1s) | ✓ PASS |
| CMS slug `date` filter parses `DD.MM.YYYY` | `node -e "new Date('01.08.2026'); new Date('15.07.2026')"` cross-checked against `static/admin/sveltia-cms.js`'s `Dz=(e,{format:t,...})=>{...s.isValid()?s.format(t):''}` transformation | `01.08.2026` → `Thu Jan 08 2026`; `15.07.2026` → `Invalid Date` | ✗ **FAIL** (confirms CR-01) |
| Reader crashes on missing `data` field | `node -e` reproducing `parseData(undefined)` | `TypeError: Cannot read properties of undefined (reading 'trim')` | ✗ **FAIL** (confirms WR-02) |
| Both seed slugs prerendered as static HTML | `ls .svelte-kit/cloudflare/aktualnosci/*.html` | `2026-07-15-witamy-na-nowej-stronie-zlobka.html`, `2026-08-01-wielkie-otwarcie-zlobka.html` present | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|--------------|--------|----------|
| NEWS-01 | 03-01-PLAN.md, 03-04-PLAN.md | Visitor views news list newest-first; homepage surfaces newest | ✓ SATISFIED | List + homepage live tests both passed. |
| NEWS-02 | 03-02-PLAN.md | Visitor opens single post, reads full content | ✓ SATISFIED | Single-post route live, entries()-prerendered, 404 for unknown slugs confirmed. |
| NEWS-03 | 03-03-PLAN.md | Staff create/edit/publish via CMS without a developer | ⚠️ PARTIALLY SATISFIED | Collection mechanics wired and Polish; the date-prefixed-slug sub-requirement (D-06, explicitly named in the plan's must_haves) is FAILED (CR-01). The mechanism to publish exists, but every CMS-authored post gets a broken permanent URL. |

No orphaned requirements: `.planning/REQUIREMENTS.md` traceability table maps exactly NEWS-01/02/03 to Phase 3, matching the three plans' declared `requirements:` fields.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `static/admin/config.yml` | `slug:` line in aktualnosci collection | Slug `date` filter cannot parse the collection's own `DD.MM.YYYY` storage | 🛑 Blocker | Every CMS-created post gets a wrong or dateless permanent URL (CR-01, carried unfixed from 03-REVIEW.md). |
| `src/lib/server/aktualnosci.ts` | `parseData()`/`firstParagraph()` | No type guard before `.trim()`/`.split()` on entry fields | 🛑 Blocker | A malformed/hand-edited post JSON crashes the entire prerender instead of being skipped (WR-02, unfixed). |
| `src/routes/+error.svelte` | whole file | No `<svelte:head><title>`; no fallback `<title>` in `app.html` | ⚠️ Warning | Every error response (incl. the phase's own D-08 404) is served untitled — WCAG 2.4.2 Level A gap (WR-04, unfixed). |
| `src/lib/server/aktualnosci.ts` | excerpt derivation | Raw Markdown syntax (`**`, `[text](url)`, list markers) leaks into card/meta excerpts when `zajawka` is empty | ⚠️ Warning | Cosmetic/SEO defect on cards and `<meta name="description">` if a post's `tresc` opens with bold/links/lists (WR-03, unfixed). |
| `src/lib/markdown.ts` | `blockMarked` renderer | GFM task-list checkboxes, fenced code blocks, blockquotes, `<hr>` still reach the DOM (not neutralized to the stated bold/link/list contract) | ℹ️ Info | Outside the literal XSS-mitigation must-have wording (headings/images/tables/raw-HTML are handled); degrades the "narrowed contract" the collection's constrained markdown widget implies (WR-05). |
| `src/lib/markdown.ts` | `SAFE_HREF` regex | Allows protocol-relative URLs (`//evil.example`) despite documented "same-site only" intent | ℹ️ Info | Narrow off-site-redirect gap for a compromised editor account (WR-01). |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK` debt markers found in any Phase 3 source file (direct grep across all 14 phase-modified files, zero matches).

### Human Verification Required

### 1. Live CMS publish loop (end of phase, deferred by Plan 03)

**Test:** Log into `/admin` on the deployed `*.pages.dev` CMS, create a test Aktualności post, save, wait ~2 minutes, and confirm it appears on `/aktualnosci` and (if among the three newest) on the homepage.
**Expected:** The post round-trips through the live GitHub-OAuth login → create → commit → Cloudflare rebuild → live loop and renders correctly on both surfaces.
**Why human:** Requires a live GitHub OAuth session against the deployed CMS Worker; cannot be Playwright-driven.
**Additional check to fold in given the CR-01 gap above:** when performing this check, also open the created post's URL and confirm its date prefix matches the `Data publikacji` entered — based on the reproduced slug-transformation bug, it will very likely NOT match (or will be missing the date prefix entirely for the 13th–31st of any month).

### Gaps Summary

Two concrete, independently-reproduced defects block full achievement of Phase 3's goal, both already identified in `03-REVIEW.md` and unfixed in the current tree:

1. **CR-01 (Critical, carried forward):** The Sveltia CMS collection's slug template cannot correctly date-prefix a post's URL from its own stored `DD.MM.YYYY` value — every CMS-authored post gets a wrong (days 1–12) or empty (days 13–31) date prefix, and because slugs are fixed at creation (D-07), this is a permanent broken-URL defect for any post staff actually create through the CMS. This directly falsifies a named NEWS-03 must-have ("Posts are stored ... with a publication-date-prefixed, diacritic-stripped slug (D-06)") and materially weakens roadmap success criterion 3 ("Staff can ... publish a news post via the CMS ... and it appears live after rebuild") — the post appears live, but at a URL that doesn't reflect its actual publication date.
2. **WR-02 (Warning-severity but directly falsifies an explicit Plan 01 must-have):** the build-time reader's "skip a malformed entry, never abort the whole prerender" resilience contract does not actually hold for an entry missing the `data` or `tresc` key — it throws and crashes the entire site's build. The CMS's required-field validation reduces the practical likelihood (a CMS-created post cannot omit these fields), but the reader is also the direct consumer of hand-edited or partially-committed git content, which is the exact scenario the code's own doc comment says this defense exists for.

Both the visitor-facing reading experience (NEWS-01, NEWS-02) and the homepage surfacing (roadmap SC4) are solid: all automated tests I spot-ran live passed, the prerendered HTML for both seed posts exists on disk, wiring from reader → routes → cards → homepage is direct and unbroken, and no debt markers or stub patterns were found in any Phase 3 file. The gaps are narrowly scoped to the CMS-authoring slug mechanism and reader robustness — both fixable without touching the reading-path code that's already verified working.

---

_Verified: 2026-08-13T23:15:00Z_
_Verifier: Claude (gsd-verifier)_
