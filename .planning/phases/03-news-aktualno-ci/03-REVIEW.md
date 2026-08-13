---
phase: 03-news-aktualno-ci
reviewed: 2026-08-13T22:54:52Z
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
  warning: 6
  info: 7
  total: 13
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-13T22:54:52Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Fresh review of the Phase 3 Aktualności implementation after the two gap-closure plans (03-05: CR-01 ISO slug storage; 03-06: WR-02 reader resilience + WR-04 error-page title). The three targeted fixes are verified as landed:

- **Prior CR-01 (slug) is fixed.** `static/admin/config.yml` now stores `data` as ISO (`format: 'YYYY-MM-DD'`), the slug template substitutes it verbatim (`{{fields.data}}-{{fields.tytul}}`) with no fragile `date` transformation, both seed JSON files carry ISO dates, and `parseData` parses ISO. Display stays Polish via `date_format` and the genitive month map.
- **Prior WR-02 (reader resilience) is largely fixed.** `parseData` accepts `unknown` and type-guards; month and day ranges are checked; `postFromEntry` skips malformed entries with a build warning; a `node --test` unit suite (`tests/aktualnosci-reader.unit.ts`, wired as `npm run test:unit`) pins the guards. **However, one crash path survived the fix** — see WR-01 below.
- **Prior WR-04 (error title) is fixed.** `+error.svelte` emits a static Polish `<title>` built only from fixed strings (correctly avoiding reflected `page.error` content), and the 404 Playwright case now asserts a non-empty title.

The two designated security surfaces remain sound: `renderPost`/`renderInline` escape raw HTML, flatten images to alt text, neutralize headings, drop tables, and protocol-filter links; the cover lookup resolves strictly by basename against a static glob, so traversal input degrades to the tint fallback.

The remaining findings are: one residual build-crash path in the reader (the class of bug the WR-02 fix was supposed to close), plus the five previously-deferred warnings, all verified still present in the current code, and seven info items (four carried, three new).

## Warnings

### WR-01: Residual WR-02 gap — `postFromEntry` passes unvalidated `tresc`/`obraz` through; a post with `zajawka` set but missing `tresc` still aborts the whole-site prerender

**File:** `src/lib/server/aktualnosci.ts:95-112` (crash sites: `src/routes/aktualnosci/[slug]/+page.svelte:42`, `src/lib/components/NewsCard.svelte:44`)
**Issue:** `postFromEntry` validates `tytul`, `data`, and the excerpt *source* — but `tresc` is only type-checked in the excerpt fallback branch (line 99), which is skipped whenever `zajawka` is a non-empty string. The final `return { ...entry, ... }` then spreads the unvalidated fields through. A hand-edited entry with `zajawka` present but `tresc` missing (or non-string) passes the reader, gets an `entries()` route, and crashes at prerender: `renderPost(post.tresc)` calls `blockMarked.parse(undefined)`, and the installed marked 18.0.9 throws `Error("marked(): input parameter is undefined or null")` (verified in `node_modules/marked/lib/marked.esm.js`; `silent` is not set). That aborts the entire build — exactly the failure mode the module's own contract rules out ("a single bad post can never abort the whole-site prerender (WR-02)", lines 76-77). The same spread also passes a non-string truthy `obraz` (e.g. a number or object) through, where `post.obraz.split('/')` throws `TypeError` during prerender of the list, homepage, and post pages. The CMS marks `tresc` required, but the WR-02 contract exists precisely for hand-edited / partially-committed git JSON — and the unit suite tests only the missing-`tresc`-AND-missing-`zajawka` case (`tests/aktualnosci-reader.unit.ts:65-68`), so this path is unpinned.
**Fix:** Require `tresc` unconditionally and sanitize the optional fields before the spread:

```ts
if (typeof entry.tresc !== 'string' || entry.tresc.trim() === '') {
	console.warn(`aktualnosci: skipping "${path}" (missing tresc)`);
	return null;
}
const zajawka = typeof entry.zajawka === 'string' ? entry.zajawka.trim() : '';
const excerpt = zajawka || firstParagraph(entry.tresc);
const obraz = typeof entry.obraz === 'string' ? entry.obraz : undefined;
const obraz_alt = typeof entry.obraz_alt === 'string' ? entry.obraz_alt : undefined;
return { ...entry, obraz, obraz_alt, slug, href: `/aktualnosci/${slug}`, iso: parsed.iso, dataDisplay: parsed.display, excerpt };
```

Add unit cases: `{ tytul, data, zajawka: 'x' }` (no `tresc`) returns null; `{ ..., obraz: 42 }` yields `obraz: undefined`.

### WR-02: `SAFE_HREF` allows protocol-relative URLs (`//evil.example`), contradicting the documented allow-list (carried over, previously deferred)

**File:** `src/lib/markdown.ts:22` (used at lines 34 and 71)
**Issue:** Unchanged since the prior review. The allow-list `/^(?:https?:|mailto:|tel:|\/|#)/i` is documented as "same-site relative paths ... only", but the `\/` branch also matches network-path references: `[tekst](//evil.example/phish)` renders as a live link the browser resolves to `https://evil.example/phish` while looking same-site in the Markdown source. Not script execution, but it defeats the stated same-site guarantee for editor-controlled links.
**Fix:**

```ts
const SAFE_HREF = /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i;
```

### WR-03: Excerpt fallback leaks raw Markdown syntax into cards and meta descriptions (carried over, previously deferred)

**File:** `src/lib/server/aktualnosci.ts:70-72,95-104` (rendered as plain text at `src/lib/components/NewsCard.svelte:69` and as the Seo description at `src/routes/aktualnosci/[slug]/+page.svelte:45`)
**Issue:** Unchanged since the prior review. When `zajawka` is empty, `excerpt` is the verbatim first paragraph of `tresc`, which is Markdown the CMS explicitly invites to contain bold, links, and lists (`buttons: [bold, link, bulleted-list, numbered-list]`). A body opening with `**Uwaga!** Zapraszamy [tutaj](https://...)` renders literal `**` and `[tutaj](https://...)` on the news card, the homepage preview, and the post's `<meta name="description">`. A body opening with a list makes the whole marker-laden block the excerpt. Additionally, `firstParagraph` splits only on `\n\n` — CRLF content (`\r\n\r\n`) never splits, so the entire body becomes the excerpt.
**Fix:** Strip Markdown in the fallback (links to text, emphasis markers removed, list markers removed), normalize newlines first (`tresc.replace(/\r\n/g, '\n')`), and consider truncating to ~200 chars for the meta description.

### WR-04: `renderPost`'s grammar narrowing is incomplete — GFM task-list checkboxes, code blocks, blockquotes, and `<hr>` still reach the DOM (carried over, previously deferred)

**File:** `src/lib/markdown.ts:60-85`
**Issue:** Unchanged since the prior review. Only `html`, `image`, `link`, `heading`, and `table` are overridden. With `gfm: true`, an editor typing `- [ ] przynieść kapcie` injects `<li><input type="checkbox" disabled>` — a disabled form control inside the article, confusing for screen-reader users. Fenced/indented code emits unstyled `<pre><code>`; `>`-prefixed lines emit `<blockquote>` — all outside the D-08 "bold + links + lists" contract and outside `.prose`'s styled element set (`p`, `a`, `strong`). No XSS (marked escapes content), but innocent editor input degrades the page contract the module's comment claims to protect.
**Fix:** In the `blockMarked` renderer add:

```ts
checkbox() { return ''; },
code(token) { return `<p>${escapeHtml(token.text)}</p>\n`; },
blockquote(token) { return this.parser.parse(token.tokens); },
hr() { return ''; }
```

### WR-05: The T-03-01 sanitizer still has zero regression tests — removing the hardening would pass the entire suite (carried over, previously deferred)

**File:** `src/lib/markdown.ts` (suites: `tests/aktualnosci.spec.ts`, `tests/aktualnosci-reader.unit.ts`)
**Issue:** The 03-06 plan added a `node --test` unit harness for the *reader*, but `renderPost`/`renderInline` — the designated stored-XSS mitigation for this phase — remain untested. The seed posts contain only benign paragraphs and the Playwright suite asserts layout/a11y, never sanitization. Deleting the `html` override (re-enabling raw HTML passthrough) or gutting `SAFE_HREF` would ship green. The blocker that previously justified deferral is gone: the `test:unit` runner and file-naming convention now exist, so a `tests/markdown.unit.ts` is a drop-in addition.
**Fix:** Add `tests/markdown.unit.ts` to the `test:unit` script asserting at minimum: `<script>`/`<img onerror>` input is escaped to text; `[x](javascript:alert(1))` renders without an `<a>`; `//evil.example` is rejected (after WR-02); `# Nagłówek` renders as `<p>`; image syntax collapses to alt text; a GFM table renders nothing. Extend the script: `node --test tests/*.unit.ts`.

### WR-06: Staff manual's intro and login sections omit the Aktualności section the same document teaches (carried over, previously deferred)

**File:** `docs/instrukcja-cms.md:5-7,24-25`
**Issue:** Unchanged since the prior review. The intro ("Prowadzi krok po kroku przez logowanie, edycję treści strony O nas, edycję planu dnia oraz dodawanie, zamianę i usuwanie dokumentów") and login step 4 ("wróci widok panelu z listą sekcji: O nas, Plan dnia oraz Dokumenty") predate section 5 (Aktualności). This is the printed handoff manual for non-technical staff: the panel they see lists four sections while the manual's own orientation steps say three.
**Fix:** Update both lists, e.g. lines 24-25: "... z listą sekcji: O nas, Plan dnia, Dokumenty oraz Aktualności." and extend the intro sentence with "oraz dodawanie wpisów Aktualności".

## Info

### IN-01: NewsPreview's empty-state branch is dead code and its comment misstates reuse (carried over)

**File:** `src/lib/components/NewsPreview.svelte:37-49` (duplicate markup/styles at `src/routes/aktualnosci/+page.svelte:54-64,148-181`)
**Issue:** The homepage gates `NewsPreview` on `posts.length > 0` (`src/routes/+page.svelte:41`), so the `{:else}` branch never renders anywhere; `/aktualnosci` carries its own byte-identical copy. The branch comment "also used by /aktualnosci" (line 38) is false.
**Fix:** Extract a `NewsEmpty.svelte` used by `/aktualnosci` and delete the dead branch, or correct the comment and accept the duplication consciously.

### IN-02: Uploads glob + basename map duplicated in NewsCard and the single-post page (carried over)

**File:** `src/lib/components/NewsCard.svelte:34-44`, `src/routes/aktualnosci/[slug]/+page.svelte:28-40`
**Issue:** The `import.meta.glob` over `$lib/assets/uploads` and the `byName` basename map (the T-03-03 traversal defense) are copy-pasted in two files this phase (a third copy exists in o-nas). If one copy's extension list or lookup logic changes, the defense silently forks.
**Fix:** Extract to `$lib/uploads.ts` exporting `coverByBasename(obraz?: string): Picture | undefined` (a shared module keeps the glob literal statically analyzable).

### IN-03: List and homepage payloads serialize the full `tresc` body of every post (carried over)

**File:** `src/routes/aktualnosci/+page.server.ts:7`, `src/routes/+page.server.ts:24`
**Issue:** `readAktualnosci()`/`readLatest(3)` return `PostWithMeta` including the complete Markdown body, which the list and homepage never render (cards use `excerpt`). The full text of every post is embedded in those pages' data payloads and grows linearly with the archive.
**Fix:** Map to the card shape before returning, e.g. `posts.map(({ tresc, placeholder, ...card }) => card)` — the `Post` type in `src/lib/content/site.ts` already defines exactly that shape.

### IN-04: Staff manual example uses a spaced hyphen for a time range, against the en-dash copy rule (carried over)

**File:** `docs/instrukcja-cms.md:62`
**Issue:** The Plan dnia example reads `8:00 - 9:00` while the project copy rule (and the CMS hint at `static/admin/config.yml:117`, "Np. 7:00–8:30.") requires an en dash in numeric ranges. Staff will copy the manual's format straight onto the public site.
**Fix:** Change the example to `8:00–9:00`.

### IN-05: `parseData` admits impossible calendar dates (e.g. 2026-02-30), despite the comment claiming out-of-range days are rejected

**File:** `src/lib/server/aktualnosci.ts:60-61` (comment at 50-52)
**Issue:** The 03-06 fix range-checks the day only generically (`1..31`), so `2026-02-30`, `2026-04-31`, or `2026-02-31` all pass, emitting an invalid `<time datetime="2026-02-30">` (the HTML `time` element requires a *valid* date string) and a nonsense display "30 lutego 2026". The T-03-06-02 comment overstates what the guard does. Reachable only via hand-edited JSON (the CMS picker cannot produce it), and the lexicographic sort key stays consistent, so impact is low.
**Fix:** Round-trip through `Date.UTC`:

```ts
const d = new Date(Date.UTC(Number(yyyy), monthIdx, day));
if (d.getUTCMonth() !== monthIdx || d.getUTCDate() !== day) return null;
```

### IN-06: A cover image with no `obraz_alt` ships `alt=""` (decorative), while the post-page comment promises an "informative alt"

**File:** `src/routes/aktualnosci/[slug]/+page.svelte:59,65`, `src/lib/components/NewsCard.svelte:53`, `static/admin/config.yml:233-237`
**Issue:** `obraz_alt` is `required: false` in the CMS (Sveltia cannot express "required when obraz is set"), and both render sites fall back to `alt={obraz_alt ?? ''}`. On the single-post page the code comment calls the cover "informative alt", yet a forgotten alt silently marks the image decorative — a WCAG 1.1.1 judgment gap that axe cannot detect (empty alt looks intentional). The staff manual's hint is the only guard.
**Fix:** Emit a build warning from the reader when `obraz` is set without a non-empty `obraz_alt` (consistent with the existing skip warnings), so the gap surfaces in the deploy log instead of shipping silently. Keep `alt=""` as the render fallback (better than a missing attribute).

### IN-07: The `link` renderer (the SAFE_HREF security logic) is hand-copied between the two Marked instances

**File:** `src/lib/markdown.ts:32-38,69-74`
**Issue:** The inline and block pipelines carry byte-identical `link` renderer bodies (and identical `html`/`image` overrides). This is the protocol allow-list — the one place a future fix like WR-02 must land twice; if the copies diverge, one pipeline silently loses the hardening.
**Fix:** Extract the shared renderer functions once and pass them to both `Marked` constructors:

```ts
const sharedRenderers = { html(token) { ... }, image(token) { ... }, link(token) { ... } };
const inlineMarked = new Marked({ renderer: { ...sharedRenderers } });
const blockMarked = new Marked({ gfm: true, renderer: { ...sharedRenderers, heading(token) { ... }, table() { return ''; } } });
```

---

_Reviewed: 2026-08-13T22:54:52Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
