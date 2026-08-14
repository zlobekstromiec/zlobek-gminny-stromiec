# Phase 3: News (Aktualności) - Pattern Map

**Mapped:** 2026-08-13
**Files analyzed:** 12 (new + modified)
**Analogs found:** 12 / 12 (every capability has a proven in-repo analog; no external-only files this phase)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/server/aktualnosci.ts` | service (build-time reader) | build-import (`import.meta.glob` eager), transform | `src/lib/server/dokumenty.ts` | exact |
| `src/lib/markdown.ts` (MODIFY: add `renderPost`) | utility | transform (markdown → HTML) | itself (`renderInline`, whole file) | exact (extend-in-place) |
| `src/routes/aktualnosci/+page.svelte` | route/page (list) | build-import, request-response | `src/routes/dokumenty/+page.svelte` + `NewsPreview.svelte` (card/empty state) | role-match |
| `src/routes/aktualnosci/+page.server.ts` | route loader | build-import | `src/routes/+page.server.ts` (dokumenty reader) | exact |
| `src/routes/aktualnosci/[slug]/+page.svelte` | route/page (single post) | build-import | `src/routes/o-nas/+page.svelte` (prose + enhanced-img) | role-match |
| `src/routes/aktualnosci/[slug]/+page.server.ts` | route loader (dynamic) | build-import + `entries()` | `src/routes/+page.server.ts` (load shape) + RESEARCH Pattern 3 | role-match |
| `src/lib/content/aktualnosci/*.json` | content/data (folder collection) | build-import | `src/lib/content/dokumenty/*.json` | exact |
| `src/lib/components/NewsPreview.svelte` (MODIFY: accept `posts` prop) | component | build-import re-source | itself (whole file) | exact |
| `src/routes/+page.server.ts` (MODIFY: add `posts`) | route loader | build-import | itself (whole file) | exact |
| `src/routes/+page.svelte` (MODIFY: data-driven news) | route/page | build-import | itself (lines 17-41) | exact |
| `src/lib/content/site.ts` (MODIFY: extend `Post`, drop `posts` stub) | content/data | — | itself (lines 158-162) | exact |
| `static/admin/config.yml` (MODIFY: add `aktualnosci` collection + global slug) | config/CMS | — | itself (`dokumenty`, lines 119-168) | exact |
| `svelte.config.js` (MODIFY: remove `/aktualnosci`) | config | — | itself (lines 9-21) | exact |
| `tests/aktualnosci.spec.ts` | test | e2e + axe | `tests/home.spec.ts` + RESEARCH test skeleton | role-match |
| `tests/home.spec.ts` (MODIFY: lockstep) | test | e2e | itself (lines 57-68, 96-124) | exact |
| `docs/instrukcja-cms.md` (MODIFY: news section) | docs | — | itself (Phase 2 dokumenty section) | exact |

## Pattern Assignments

### `src/lib/server/aktualnosci.ts` (service, build-time reader)

**Analog:** `src/lib/server/dokumenty.ts` (whole file, read in full). Mirror its structure exactly; the divergence is date parsing + slug-from-filename + sort instead of `statSync`/grouping.

**Server-only glob read pattern** — copy from `dokumenty.ts` lines 80-88:
```typescript
export function readDokumenty(): DokumentWithMeta[] {
	const modules = import.meta.glob<DokumentEntry>('$lib/content/dokumenty/*.json', {
		eager: true,
		import: 'default'
	});
	return Object.values(modules)
		.map(withMeta)
		.filter((entry): entry is DokumentWithMeta => entry !== null);
}
```
For `aktualnosci`, iterate `Object.entries(modules)` (not just `Object.values`) because the slug comes from the on-disk path key: `const slug = (path.split('/').pop() ?? '').replace(/\.json$/, '')` (RESEARCH Pattern 1/2).

**Skip-bad-entry-never-abort pattern** — copy the defense from `dokumenty.ts` lines 48-66: a malformed entry (bad date, bad path) logs `console.warn(...)` and returns/`continue`s, never throwing — one bad post must not fail the whole prerender.

**Typed entry + meta interfaces** — mirror `dokumenty.ts` lines 12-31: `PostEntry` (raw JSON shape: `tytul`, `data`, `zajawka?`, `tresc`, `obraz?`, `obraz_alt?`, `placeholder?`) and `PostWithMeta extends PostEntry` (computed `slug`, `href`, `iso`, `dataDisplay`, `excerpt`). See RESEARCH Pattern 1 for the exact field list.

**Date parsing (build-time, pure, NO `Intl`):** use the genitive Polish month array from RESEARCH Pattern 1 (`MIESIACE[]` = `stycznia…grudnia`). The stored `data` format is `"DD.MM.YYYY"` — VERIFIED by `dokumenty/*.json` storing `wersja` as `"02.04.2026"` (dokumenty datetime widget, same `date_format`). Regex `^(\d{2})\.(\d{2})\.(\d{4})$` → `iso` `YYYY-MM-DD` + `display` `"1 sierpnia 2026"`.

**Sort newest-first (NEWS-01):** `posts.sort((a, b) => b.iso === a.iso ? b.slug.localeCompare(a.slug) : b.iso.localeCompare(a.iso))` — deterministic tie-break on slug (RESEARCH Pattern 1).

**`readLatest(n = 3)`:** `return readAktualnosci().slice(0, n)` for the homepage curated subset (UI-SPEC = 3). Same curated-subset intent as `+page.server.ts` line 17 `.slice(0, 2)`.

---

### `src/lib/markdown.ts` (utility, MODIFY — add `renderPost`)

**Self-analog** (whole file read). REUSE, do not duplicate, the existing `escapeHtml` (lines 13-18) and `SAFE_HREF` (line 22) consts — lift them to module scope if not already shared, then build a second `Marked` instance.

**Existing hardened link renderer** to copy verbatim into the block instance (lines 32-37):
```typescript
link(token) {
	const text = this.parser.parseInline(token.tokens);
	if (!SAFE_HREF.test(token.href.trim())) return text;
	const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
	return `<a href="${escapeHtml(token.href)}"${title}>${text}</a>`;
}
```

**New `renderPost` (FULL block, not inline)** — add per RESEARCH Pattern 4: a `new Marked({ gfm: true, renderer: {...} })` that keeps the `html`/`image`/`link` overrides from `renderInline` PLUS neutralizes headings (`heading(token) { return \`<p>${this.parser.parseInline(token.tokens)}</p>\`; }`) and tables (`table() { return ''; }`), then `export function renderPost(source): string { return blockMarked.parse(source) as string; }`. This protects the post page's single `h1` and drops GFM tables. Token-object renderer API (marked 18.x) — same API `renderInline` already uses (do NOT use the deprecated string-function signature).

**Consumption** in `[slug]/+page.svelte`: `{@html renderPost(post.tresc)}` with the exact eslint annotation used at `o-nas/+page.svelte` line 63 (`<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderPost sanitizes ... CSP script-src 'self' is the second layer -->`).

---

### `src/routes/aktualnosci/+page.svelte` (route/page, list)

**Analogs:** `src/routes/dokumenty/+page.svelte` (whole file — page-head + banded sections + `{#if}…{:else}` empty state + Seo + scoped-token styles); `NewsPreview.svelte` for the card grid + empty-state markup.

**Page shell** — copy from `dokumenty/+page.svelte` lines 1-34: header comment citing UI-SPEC + req IDs + "prerendered, zero-JS, NO extra `<main>`/h1 beyond the page heading"; `let { data }: { data: PageData } = $props()`; `const posts = $derived(data.posts)`; `<Seo title description canonical />` (Polish); `<header class="page-head"><h1>Aktualności</h1><p class="lead">…</p></header>`.

**List / empty branch** — mirror `dokumenty/+page.svelte` lines 36-76 `{#if grupy.length > 0}…{:else}…{/if}`. Empty branch reuses the shared empty-state panel already authored in `NewsPreview.svelte` lines 19-26 (Newspaper icon + "Wkrótce pojawią się aktualności" h-level + body) — extract that block so both the list page and (historically) the homepage share one card/empty contract (UI-SPEC "one shared card component").

**Heading-order gate (Pitfall 5, axe asserts):** the page `h1` is "Aktualności"; wrap the card grid in `<section aria-labelledby>` with a real or visually-hidden `h2`, OR promote card titles to `h2`. Do NOT let cards jump to `h3` under the `h1` (no skipped level). `aria-labelledby`-on-section pattern is used at `dokumenty/+page.svelte` line 38 and `NewsPreview.svelte` line 9.

**Token-only scoped styles:** copy the `.page-head`/`.band`/`.band.warm`/`.inner` container + breakpoint system verbatim from `dokumenty/+page.svelte` lines 78-135 (max-width 72rem, padding-inline 16/24/32 at 768/1024, all colors via `--color-*` tokens). No new tokens this phase.

---

### `src/routes/aktualnosci/+page.server.ts` (route loader, list)

**Analog:** `src/routes/+page.server.ts` (whole file). Copy the shape exactly:
```typescript
import type { PageServerLoad } from './$types';
import { readAktualnosci } from '$lib/server/aktualnosci';

export const load: PageServerLoad = () => {
	return { posts: readAktualnosci() };
};
```
`prerender = true` is inherited from `+layout.ts` — do NOT add `+server.ts` or `prerender = false` (runs once at build).

---

### `src/routes/aktualnosci/[slug]/+page.server.ts` (dynamic loader, `entries()`)

**Analog:** `src/routes/+page.server.ts` (load shape) + RESEARCH Pattern 3 for `entries()`. Copy RESEARCH Pattern 3 verbatim:
```typescript
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { readAktualnosci } from '$lib/server/aktualnosci';

export const entries: EntryGenerator = () =>
	readAktualnosci().map((p) => ({ slug: p.slug }));

export const load: PageServerLoad = ({ params }) => {
	const post = readAktualnosci().find((p) => p.slug === params.slug);
	if (!post) throw error(404, 'Nie znaleziono wpisu'); // D-08
	return { post };
};
```
`entries()` makes the crawler emit static HTML for every real slug; unknown slug → 404 (D-08). Confirm an `+error.svelte` exists for a friendly Polish 404 (RESEARCH Open Question 3).

---

### `src/routes/aktualnosci/[slug]/+page.svelte` (route/page, single post)

**Analog:** `src/routes/o-nas/+page.svelte` (whole file — prose rendering + enhanced-img by-basename + scoped styles).

**Prose body render** — copy the `o-nas` pattern lines 40, 63-64 but with `renderPost` (full block):
```svelte
<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderPost sanitizes ... CSP script-src 'self' is the second layer -->
<div class="prose">{@html renderPost(post.tresc)}</div>
```
Reuse the `.prose` style block from `o-nas/+page.svelte` lines 201-222 verbatim (65ch measure, brand-blue underlined links `:global(a)`, `:global(strong)` 700).

**Single `h1` = the post title** (`post.tytul`); the neutralized-heading rule in `renderPost` guarantees no body heading competes with it.

**`<time datetime>`** — emit `<time datetime={post.iso}>{post.dataDisplay}</time>` (iso `2026-08-01`, display `"1 sierpnia 2026"`). The spec asserts `time[datetime="2026-08-01"]`.

**Cover image (optional) by basename** — copy `o-nas/+page.svelte` lines 15, 24-36:
```svelte
import type { Picture } from '@sveltejs/enhanced-img';
const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
	query: { enhanced: true }, eager: true, import: 'default'
});
const byName: Record<string, Picture> = {};
for (const [path, mod] of Object.entries(uploads)) {
	const base = path.split('/').pop();
	if (base) byName[base] = mod;
}
```
Then `{#if post.obraz && byName[post.obraz.split('/').pop()]}<enhanced:img …/>{/if}`. D-01 seed has no `obraz` → imageless tint-fallback card. Basename lookup = path-traversal safe (RESEARCH Security: unknown basename → no image, never a filesystem read).

**Optional closing CTA:** `o-nas/+page.svelte` lines 123-128 pattern (`<Cta href="/rekrutacja" variant="primary" icon>`), if UI-SPEC calls for it.

---

### `src/lib/content/aktualnosci/*.json` (content, folder collection)

**Analog:** `src/lib/content/dokumenty/*.json` (JSON-per-entry, no frontmatter parser). Seed file `2026-08-01-wielkie-otwarcie-zlobka.json` per RESEARCH Code Examples (D-01): `tytul`, `data: "01.08.2026"`, `zajawka`, `tresc` (single-line string with `\n\n` between paragraphs — Pitfall 6: real newlines would be invalid JSON), `placeholder: true`, no `obraz`. Em dashes swept to comma/colon (v1.2 §8). Add a second dated fixture (e.g. `2026-07-15-…`) for the newest-first assertion (D-02, planner discretion).

**Filename IS the slug** (D-06/D-07/D-08) — the hand-authored seed filename is fully under our control; `RRRR-MM-DD-tytul` shape.

---

### `src/lib/components/NewsPreview.svelte` (MODIFY — accept `posts` prop)

**Self-analog** (whole file). Currently hard-codes the empty state and takes no data. Changes:
1. Add `let { posts }: { posts: Post[] } = $props()` (Svelte 5 runes, as `dokumenty/+page.svelte` line 15).
2. Render the card grid when `posts.length > 0`; the existing empty-state block (lines 19-26) becomes the `{:else}` (or is extracted to a shared card module the list page also uses).
3. Keep the section shell (lines 9-13: `aria-labelledby="news-heading"`, `<h2>Aktualności</h2>`, `<Cta href="/aktualnosci">Zobacz wszystkie</Cta>`) and all scoped token styles verbatim.

Card contract (title → `href` `/aktualnosci/{slug}`, `dataDisplay`, `excerpt`, optional cover) per UI-SPEC; one shared card between homepage preview and list page.

---

### `src/routes/+page.server.ts` (MODIFY — add `posts`)

**Self-analog** (whole file). Add the `readLatest(3)` source alongside the existing docs load (RESEARCH Homepage load example):
```typescript
import { readLatest } from '$lib/server/aktualnosci';
// … inside load, after docs:
const posts = readLatest(3);
return { docs, posts };
```

### `src/routes/+page.svelte` (MODIFY — data-driven news, Pitfall 1)

**Self-analog** lines 17-41. Replace `import { posts } from '$lib/content/site'` (line 18) with `const showNews = data.posts.length > 0` and `{#if showNews}<NewsPreview posts={data.posts} />{/if}` (lines 39-41). Amendment v1.1 §1: the homepage never renders the news empty state — `showNews` gates it.

### `src/lib/content/site.ts` (MODIFY — extend `Post`, drop stub)

**Self-analog** lines 158-162. Extend the `Post` type with `slug` + optional `image`/`alt` (or move the canonical shape to `PostWithMeta` in the reader and re-export). Remove the `export const posts: Post[] = []` stub now that `+page.server.ts` supplies posts. Preserve copy rules (header lines 1-5: no emoji, no em dashes, `// PLACEHOLDER:` convention).

---

### `static/admin/config.yml` (MODIFY — `aktualnosci` collection + global slug)

**Analog:** the `dokumenty` collection (lines 119-168, read in full). Copy its collection skeleton (`name`, `label`, `label_singular`, `description` with the "Zmiany pojawią się po ok. 2 minutach" note, `folder`, `create: true`, `extension: json`) and the `placeholder` boolean field verbatim (lines 164-168), and the `datetime` widget pattern verbatim (lines 153-158: `date_format: 'DD.MM.YYYY'`, `time_format: false`).

**Critical divergences from `dokumenty` (Pitfall 3):**
- **DO NOT** set a per-collection `media_folder`/`public_folder`. `dokumenty` overrides to `/static/dokumenty` (lines 133-134) *because PDFs are served verbatim*; `aktualnosci` covers must inherit the GLOBAL `media_folder: src/lib/assets/uploads` (config.yml lines 21-22) so `enhanced-img` (Vite) can process them.
- Add a `slug:` template `"{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}"` (Pitfall 4: publication-date prefix honoring backdating) plus a top-level global `slug: { encoding: ascii, clean_accents: true }` block for Polish transliteration (ł→l). VERIFY the `date` filter against the pinned `@sveltia/cms@0.189.0` bundle; fallback documented in RESEARCH (A1) — store ISO via `format` + plain `{{fields.data}}`.
- Field schema (`tytul`/`data`/`zajawka`/`tresc`/`obraz`/`obraz_alt`/`placeholder`) with Polish labels/hints per RESEARCH config example; the `tresc` markdown widget restricts `buttons: [bold, link, bulleted-list, numbered-list]` (no headings/image/italic).

---

### `svelte.config.js` (MODIFY — remove `/aktualnosci`, Pitfall 2)

**Self-analog** lines 9-21. Remove `/aktualnosci` from `KNOWN_FUTURE_ROUTES` (line 10) and leave a comment mirroring the `/o-nas` and `/dokumenty` ones (lines 12-13: "'/aktualnosci' is now a real prerendered route, so the crawler enforces it"). `/aktualnosci/[slug]` is covered by `entries()`, not the allow-list. Leave the page CSP (lines 38-50) untouched — `/admin` is out of scope for these routes.

---

### `tests/aktualnosci.spec.ts` (NEW)

**Analogs:** `tests/home.spec.ts` (whole file — describe block, axe baseline, `getByRole` locators, header-comment "do NOT weaken these assertions" discipline) + RESEARCH test skeleton (lines 425-462).

Cover: list 200 + single Polish `h1` "Aktualności"; newest-first order (assert known fixture titles order); single post 200 + `h1` matching + `time[datetime="2026-08-01"]`; unknown slug 404 (D-08); axe clean on both routes with tags `['wcag2a','wcag2aa','wcag21a','wcag21aa']`, `expect(results.violations).toEqual([])` (copy from `home.spec.ts` lines 154-160). Empty-state coverage: component-isolation or documented-manual (Open Question 1, D-02 discretion). Test names in Polish-clean English, no emoji/em dashes.

---

### `tests/home.spec.ts` (MODIFY — lockstep, Pitfall 1, HIGHEST RISK)

**Self-analog** lines 57-68. The test "no Aktualności section renders while there are no posts" INVERTS after D-01 seeding — the homepage WILL render `NewsPreview` with cards. Update in the SAME plan that seeds the post:
- Replace the absence assertions (lines 61-67) with presence: rendered card(s), newest-first order, `/aktualnosci/{slug}` hrefs.
- Note the `exact: true` "Zobacz wszystkie" locator (line 67) now SHOULD match (it exists again) — keep it meaningful vs. the docs panel's "Zobacz wszystkie dokumenty".
- Document the change as a UI-SPEC-consistent lockstep edit (same discipline as the D-18 comment at lines 96-102). A green suite still asserting the news section is absent means the seed did not reach the homepage.

---

### `docs/instrukcja-cms.md` (MODIFY — news section)

**Self-analog** (Phase 2 dokumenty section). Add a Polish news-publishing section: "zapisanie = publikacja (po ok. 2 minutach)" (D-04), title-edit-keeps-URL note (D-07), English-chrome → Polish-label mapping (Save/Publish/Delete), publish-delay reminder. No code analog.

## Shared Patterns

### Build-time folder-collection read (zero runtime reads)
**Source:** `src/lib/server/dokumenty.ts` lines 80-88; `import.meta.glob('$lib/content/…/*.json', { eager: true, import: 'default' })`.
**Apply to:** `aktualnosci.ts` reader, consumed by list, `[slug]`, and homepage loaders (one source, cannot drift). Git is the source of truth; HTML is a derived build artifact. Never read posts at runtime.

### Hardened Markdown sanitize boundary (stored-XSS defense, ASVS V5)
**Source:** `src/lib/markdown.ts` (`escapeHtml`, `SAFE_HREF`, token-object renderer). Two-layer defense with page CSP `script-src 'self'` (svelte.config.js lines 42-43).
**Apply to:** `renderPost` (post body) — reuse the shared consts, add heading/table neutralization. `{@html}` always carries the eslint-disable annotation from `o-nas/+page.svelte` line 63.

### Skip-bad-entry-never-abort
**Source:** `dokumenty.ts` lines 48-66 (`console.warn` + skip on invalid/missing).
**Apply to:** `aktualnosci.ts` — one malformed post logs a warning and is skipped, never fails the whole prerender.

### enhanced-img by-basename lookup (path-traversal safe)
**Source:** `o-nas/+page.svelte` lines 24-36.
**Apply to:** post cover images. Inherit the GLOBAL `media_folder` (Vite-processed); resolve `obraz` by basename against the static glob set.

### Design-token-only styling (WCAG two-tier palette)
**Source:** `dokumenty/+page.svelte` lines 78-135, `o-nas/+page.svelte` lines 130-334, `NewsPreview.svelte` lines 30-111.
**Apply to:** list + post pages. Container `max-width: 72rem; margin-inline: auto` + padding-inline 16/24/32 at 768/1024; `--font-display`/`--font-body`; accessible-tier color tokens for all text/UI; expressive tints decorative only. No new tokens this phase.

### Prerender inheritance + zero-JS
**Source:** `+layout.ts` `export const prerender = true`.
**Apply to:** all new routes inherit; do NOT add `+server.ts` or `prerender = false`. Only `MobileNav` hydrates.

### Per-route Seo + noindex
**Source:** `Seo.svelte`, invoked `dokumenty/+page.svelte` lines 19-23, `o-nas/+page.svelte` lines 45-49.
**Apply to:** list + post pages. `<Seo title description canonical />` Polish copy, noindex defaults true (pages.dev).

### Playwright + axe per-route test
**Source:** `home.spec.ts` (describe + section assertions + axe baseline lines 154-160).
**Apply to:** `tests/aktualnosci.spec.ts`. Tags `['wcag2a','wcag2aa','wcag21a','wcag21aa']`, `violations.toEqual([])`.

### Copy rules
**Source:** `site.ts` header lines 1-5; MEMORY copy-style-rules.
**Apply to:** all visitor text, comments, titles, test names, CMS Polish labels/hints. No emoji, no em dashes (en dash only in numeric ranges), Polish only. `placeholder: true` boolean for CMS content; `// PLACEHOLDER:` for code-side.

### Date formatting (build-time, pure, no `Intl`)
**Source:** RESEARCH Pattern 1 genitive `MIESIACE[]`; stored `DD.MM.YYYY` VERIFIED by `dokumenty/*.json` `wersja`.
**Apply to:** `aktualnosci.ts` `parseData`. Deterministic, no Cloudflare locale-data dependency.

## No Analog Found

None. Every file this phase has a direct in-repo analog. The only external unknown (Sveltia `date` slug filter / datetime storage in `@sveltia/cms@0.189.0`) is a config-verification step, not missing-pattern territory — RESEARCH A1/A2 + Open Question 2 document the fallback.

## Metadata

**Analog search scope:** `src/lib/server/`, `src/lib/markdown.ts`, `src/lib/components/`, `src/lib/content/`, `src/routes/` (`+page`, `o-nas`, `dokumenty`), `tests/`, `static/admin/config.yml`, `svelte.config.js`.
**Files scanned:** 11 read in full/targeted (dokumenty.ts, markdown.ts, NewsPreview.svelte, site.ts, o-nas/+page.svelte, +page.server.ts, dokumenty/+page.svelte, svelte.config.js, home.spec.ts, config.yml dokumenty block, +page.svelte).
**Pattern extraction date:** 2026-08-13
