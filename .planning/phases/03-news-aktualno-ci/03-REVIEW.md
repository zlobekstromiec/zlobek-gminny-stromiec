---
phase: 03-news-aktualno-ci
reviewed: 2026-08-14T03:07:19Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - docs/instrukcja-cms.md
  - src/lib/components/NewsCard.svelte
  - src/lib/components/NewsPreview.svelte
  - src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json
  - src/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka.json
  - src/lib/content/site.ts
  - src/lib/markdown.ts
  - src/lib/server/aktualnosci.ts
  - src/routes/+error.svelte
  - src/routes/+page.server.ts
  - src/routes/+page.svelte
  - src/routes/aktualnosci/[slug]/+page.server.ts
  - src/routes/aktualnosci/[slug]/+page.svelte
  - src/routes/aktualnosci/+page.server.ts
  - src/routes/aktualnosci/+page.svelte
  - static/admin/config.yml
  - tests/aktualnosci-reader.unit.ts
  - tests/aktualnosci.spec.ts
  - tests/home.spec.ts
findings:
  critical: 0
  warning: 4
  info: 6
  total: 10
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-14T03:07:19Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Fresh full review of the phase 03 news pipeline after the 03-07 gap closure (hardened `postFromEntry`, unit-suite pin). The reader hardening is sound: `postFromEntry` now takes `unknown`, guards every field unconditionally, and constructs its result from guarded locals only. The reader-resilience unit suite (26 tests) passes as executed during this review.

The stored-XSS boundary in `src/lib/markdown.ts` was probed empirically with hostile inputs (raw `<script>` blocks, inline HTML with `onerror`, `javascript:` and entity-encoded hrefs, autolinks, title-attribute breakout attempts). All were neutralized: HTML escaped to text, unsafe hrefs dropped to plain text, quotes escaped in attributes. No injection path was found. The prior review round's blockers are resolved; no Critical findings remain.

What remains: two correctness gaps in the reader (raw Markdown leaking into card excerpts, calendar-impossible dates passing `parseData`), a process gap (the pinning unit suite is not wired into any automated gate), and a staff-facing documentation inconsistency, plus six lower-grade quality items.

No `<structural_findings>` block was provided for this round, so there is no fallow section; all findings below are narrative.

## Narrative Findings (AI reviewer)

### Critical Issues

None. Specifically re-verified this round:

- `renderPost`/`renderInline` sanitization holds under adversarial probing (see Summary).
- `postFromEntry` cannot throw for any of the malformed shapes exercised (null, array, number, bare string, missing/mistyped fields); unknown source keys are dropped (key-set equality test confirms no entry spread).
- Cover lookup is basename-keyed against a static glob (`src/lib/assets/uploads/*`), so a traversal-shaped `obraz` value degrades to the tint fallback, never a filesystem read.
- `+error.svelte` builds its `<title>` and body exclusively from fixed Polish strings gated on `page.status`; no request-derived text reaches `<head>`.
- No secrets in `static/admin/config.yml` (OAuth secret lives on the Worker as documented).

### Warnings

#### WR-01: Excerpt fallback emits raw Markdown syntax as literal card text (and can be empty)

**File:** `src/lib/server/aktualnosci.ts:71-73`, `:141`; consumed at `src/lib/components/NewsCard.svelte:69` and `src/routes/aktualnosci/[slug]/+page.svelte:45`
**Issue:** When `zajawka` is absent, `excerpt = firstParagraph(tresc)` returns the raw Markdown first paragraph, and both consumers render it as plain text. The CMS `tresc` widget explicitly allows bold, links, and lists, so a staff-authored body starting with `**Zapraszamy!** Zobacz [program](...)` puts literal `**` and `[program](...)` on the list card, the homepage card, and the `<meta name="description">` of the post page. Additionally, a body that begins with a blank line (`"\n\nTekst..."`) makes `split('\n\n')[0]` the empty string, yielding an empty excerpt paragraph and an empty meta description even though `tresc` itself passed the non-empty guard.
**Fix:** Strip Markdown when deriving the fallback excerpt, and skip leading empty paragraphs:

```ts
function firstParagraph(tresc: string): string {
	const para = tresc.split(/\n\s*\n/).find((p) => p.trim() !== '') ?? '';
	// Plain-text projection of the D-08 subset: links to their text, bold/italic markers dropped.
	return para
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]+/g, '')
		.trim();
}
```

#### WR-02: `parseData` accepts calendar-impossible dates, contradicting its own guard comment

**File:** `src/lib/server/aktualnosci.ts:53-66` (comment at 50-52)
**Issue:** The guard rejects month > 12 and day > 31, but not day-vs-month validity: `parseData('2026-02-31')` returns `{ iso: '2026-02-31', display: '31 lutego 2026' }`. That emits an invalid `<time datetime="2026-02-31">` (the exact failure mode the comment claims is prevented: "would emit an invalid `<time datetime>` and corrupt the sort key"). The CMS datetime widget always saves valid dates, but hand-edited/partially-committed JSON is precisely the threat model this reader was hardened against in 03-06/03-07 (three crash shapes reached production that way).
**Fix:** Round-trip through `Date.UTC` to reject impossible combinations:

```ts
const day = Number(dd);
const d = new Date(Date.UTC(Number(yyyy), monthIdx, day));
if (d.getUTCFullYear() !== Number(yyyy) || d.getUTCMonth() !== monthIdx || d.getUTCDate() !== day)
	return null;
```

Add `parseData('2026-02-31')` as a red-first case in `tests/aktualnosci-reader.unit.ts`.

#### WR-03: The reader-resilience unit suite is not wired into any automated gate

**File:** `package.json` (`scripts.test` / `scripts.test:unit`), `tests/aktualnosci-reader.unit.ts`
**Issue:** `tests/aktualnosci-reader.unit.ts` is the pin that turns removal of the 03-07 guards red, but it only runs via the standalone `npm run test:unit`. `npm run test` is Playwright-only (the `.unit.ts` suffix deliberately dodges its matcher), `.pre-commit-config.yaml` runs no tests, and there is no CI workflow in the repo. The project verify chain (`npm run check && npm run lint && npm run test`) therefore never executes the suite; its regression protection depends on a human remembering an extra command. The 03-06 summary itself flagged this as an open item ("consider wiring it into the pre-commit / CI chain") and it has not been closed.
**Fix:** Chain it into the default gate so it cannot be skipped:

```json
"test": "npm run test:unit && playwright test",
"test:unit": "node --test tests/aktualnosci-reader.unit.ts"
```

(or add it to `.pre-commit-config.yaml`). Update the project CLAUDE.md verify command if the script names change.

#### WR-04: Staff manual's section enumerations omit Aktualności despite documenting it

**File:** `docs/instrukcja-cms.md:5-7`, `:24-25`
**Issue:** Section 5 fully documents the new Aktualności collection, but two overview enumerations were not updated: the intro ("Prowadzi krok po kroku przez logowanie, edycję treści strony O nas, edycję planu dnia oraz dodawanie, zamianę i usuwanie dokumentów.") and login step 4 ("wróci widok panelu z listą sekcji: O nas, Plan dnia oraz Dokumenty."). This is a printed staff manual; the panel a redactor actually sees lists four sections, so the document contradicts both itself and the UI it describes.
**Fix:** Add Aktualności to both lists, e.g. line 25: "...z listą sekcji: O nas, Plan dnia, Dokumenty oraz Aktualności." and extend the intro sentence with "...oraz dodawanie wpisów Aktualności."

### Info

#### IN-01: GFM task-list checkboxes render `<input>` elements inside the post body

**File:** `src/lib/markdown.ts:60-85`
**Issue:** Probe-confirmed: with `gfm: true`, a staff-typed `- [ ] zadanie` renders `<li><input disabled="" type="checkbox"> zadanie</li>` through `renderPost`. Not exploitable (disabled, attribute-free), but it puts a form control into a zero-JS prose page, which is outside the D-08 "bold + links + lists" contract the renderer otherwise enforces (headings and tables are already neutralized).
**Fix:** Override `checkbox()` to return `''` in `blockMarked`'s renderer so task-list syntax degrades to a plain list item.

#### IN-02: `SAFE_HREF` admits protocol-relative `//host` URLs, contradicting the comment

**File:** `src/lib/markdown.ts:20-22`
**Issue:** Probe-confirmed: `[klik](//evil.example)` passes the `^\/` branch and renders as an off-site link, while the comment claims the class covers "same-site relative paths". No new capability is granted (arbitrary `https:` links are allowed anyway), so this is a documentation/intent mismatch, not a vulnerability.
**Fix:** Either tighten the regex (`/^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i`) or correct the comment to acknowledge protocol-relative URLs are treated as external links.

#### IN-03: uploads-glob cover-resolution block duplicated across three files

**File:** `src/lib/components/NewsCard.svelte:34-44`, `src/routes/aktualnosci/[slug]/+page.svelte:28-40` (same pattern in `src/routes/o-nas/+page.svelte`)
**Issue:** The `import.meta.glob` + basename-map + `cover` derivation is copy-pasted. The extension list (`jpg,jpeg,png,webp`) now lives in three places; adding a format in one and not the others silently degrades covers to the tint fallback on some pages only. Relatedly, the comment in `src/lib/components/NewsPreview.svelte:38` claims its empty state is "also used by /aktualnosci", but `src/routes/aktualnosci/+page.svelte:57-64` duplicates the markup instead of using the component, so the copies can drift.
**Fix:** Extract a shared `$lib/uploads.ts` helper (`coverFor(obraz: string | undefined): Picture | undefined`) built on one glob, and correct or remove the stale NewsPreview comment.

#### IN-04: Dead `?? obraz` fallback after `split('/').pop()`

**File:** `src/lib/components/NewsCard.svelte:44`, `src/routes/aktualnosci/[slug]/+page.svelte:39`
**Issue:** `String.prototype.split` never returns an empty array, so `.pop()` on its result is always a string (possibly `''`), never `undefined`; the `?? obraz` branch is unreachable dead code that suggests a fallback which cannot occur.
**Fix:** `byName[obraz.split('/').pop()!]` or drop the coalesce: `const base = obraz.split('/').pop(); cover = base ? byName[base] : undefined;`

#### IN-05: Time-range example uses spaced hyphen, conflicting with the en-dash copy rule

**File:** `docs/instrukcja-cms.md:62`
**Issue:** The Plan dnia instruction shows `8:00 - 9:00` (spaced hyphen) while the CMS hint for the same field (`static/admin/config.yml:117`) shows `7:00–8:30` (en dash) and the project copy rule mandates en dash inside numeric ranges. Staff following the printed manual will type ranges that violate the site's typographic contract.
**Fix:** Change the example to `8:00–9:00` to match the config hint.

#### IN-06: Playwright acceptance tests hard-couple to seed post content

**File:** `tests/aktualnosci.spec.ts:33-59`, `:77`; `tests/home.spec.ts:63-87`
**Issue:** Assertions pin exact seed titles and the slug `2026-08-01-wielkie-otwarcie-zlobka`. The CMS direct-publishes to `main` (D-20), so the moment staff edit or delete the seed posts the suite goes red for reasons unrelated to code, and both seeds are still `"placeholder": true`. This is acceptable for phase acceptance but is a known post-handoff fragility.
**Fix:** No change required now; before handoff, either retain the seeds as protected fixtures or rewrite the assertions structurally (first card href matches `/aktualnosci/\d{4}-\d{2}-\d{2}-/`, dates descend) instead of pinning titles.

---

_Reviewed: 2026-08-14T03:07:19Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
