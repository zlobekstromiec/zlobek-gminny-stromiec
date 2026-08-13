# Phase 3: News (Aktualności) - Research

**Researched:** 2026-08-13
**Domain:** Git-as-CMS content pipeline (Sveltia folder collection → build-time read → prerendered SvelteKit routes) with hardened Markdown rendering
**Confidence:** HIGH (internal patterns verified in-repo; Sveltia slug mechanics CITED from official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Launch content seeding**
- **D-01 (DEFAULTED):** Seed the collection with the one banked launch post from `.planning/DESIGN-BANK.md` ("Wielkie otwarcie żłobka: 14 sierpnia!", data 01.08.2026), `placeholder: true`, **no cover image** (exercises the imageless tint-fallback card), the banked em dash swept to comma/colon per v1.2 §8. Site stays noindex on `*.pages.dev`.
  - **Timing caveat to raise with client:** the announced event date (14.08.2026) is effectively now; client may prefer a post-event recap. That is a CMS content edit, not a code change.
- **D-02:** Extra posts needed to assert newest-first ordering in tests are **planner discretion** (build fixtures or a second modest seed); only the one banked post is required content.

**Publishing semantics (NEWS-03)**
- **D-03 (DEFAULTED):** `data` is display/sort metadata only — every entry in the collection renders. A saved post is live after the ~2 minute rebuild regardless of its date. **NO build-time future-date filter** (static git site never rebuilds when a date arrives; date-filtering silently strands "scheduled" posts). No scheduled-rebuild infrastructure in v1.
- **D-04 (DEFAULTED):** **No draft/szkic mechanism in v1**, consistent with direct-publish-to-main (Phase 2 D-20). Instrukcja documents "zapisanie = publikacja (po ok. 2 minutach)".
- **D-05:** Backdating is implicitly allowed (staff set any date; sort order handles it). No validation beyond the `datetime` widget format.

**Post URLs & lifecycle (NEWS-02)**
- **D-06 (DEFAULTED):** Slugs are date-prefixed: `/aktualnosci/RRRR-MM-DD-tytul` (publication date + transliterated title, Polish diacritics cleaned, ł→l). Exact Sveltia slug template/encoding mechanics are researcher/planner detail (resolved below).
- **D-07 (DEFAULTED):** Title edits after publish do NOT change the URL. Sveltia fixes the entry file name at creation.
- **D-08 (DEFAULTED):** Deleted posts leave dead URLs that 404. No redirect infrastructure in v1.

### Claude's Discretion
- Content file format for posts (markdown+frontmatter vs JSON with a markdown string field) and exact Sveltia collection config mechanics — follow the Phase 2 precedent (researcher's call; resolved: **JSON with a markdown-string `tresc` field**). UI-SPEC constraints (media folder `src/lib/assets/uploads`, widget buttons `[bold, link, bulleted-list, numbered-list]`, `datetime` with `DD.MM.YYYY`) govern regardless of format.
- Heading-order gate on the list page: `h2` section wrapper vs promoting card titles to `h2` (UI-SPEC allows either; no skipped heading level may ship; axe asserts it).
- Test fixture approach for the newest-first assertion (D-02).
- Homepage curated count is 3 per UI-SPEC; planner may adjust only within "fills whole grid rows cleanly and stays a small subset".

### Deferred Ideas (OUT OF SCOPE)
- Draft/szkic boolean — v2, only if staff request it.
- Scheduled publishing (cron-triggered rebuild + future-date filter) — rejected for v1.
- NEWS-04 categories/tags/filtering + pagination — v2 backlog.
- RSS-01 feed for Aktualności — v2 backlog.
- "Ustawienia strony" site-facts singleton — deferred to Phase 4; Phase 3 touches only `posts`.
- Post-event rewrite of the launch post — client confirmation moment, CMS content edit only.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NEWS-01 | A visitor can view a list of news posts, newest first | Build-time folder-collection read (`import.meta.glob`, mirrors `dokumenty.ts`) sorted by parsed `data` descending; `/aktualnosci/+page.svelte` renders the shared card grid + inherited empty state |
| NEWS-02 | A visitor can open a single news post and read its full content | `/aktualnosci/[slug]/+page.server.ts` with `entries()` returning every slug so all posts prerender; body via hardened **full** `marked` parse + sanitize; unknown slug → `error(404)` |
| NEWS-03 | Staff can create, edit, and publish news posts via the CMS without a developer | New Sveltia `aktualnosci` folder collection (`create: true`, Polish labels/hints, date-prefixed slug template, constrained markdown widget); commit-to-main → Cloudflare rebuild |
</phase_requirements>

## Summary

This phase is an **additive vertical slice built almost entirely from patterns already proven in Phases 1–2**. The stack is fully locked (SvelteKit 2 + Svelte 5 runes + adapter-cloudflare + Tailwind v4 + Sveltia CMS 0.189.0 + `marked` 18.0.9 + `@sveltejs/enhanced-img` 0.11.0) and **no new packages are installed**. Every capability has a direct in-repo analog: the build-time folder-collection read exists in `src/lib/server/dokumenty.ts`; the hardened Markdown renderer exists in `src/lib/markdown.ts` (needs a **full-block** sibling function); the `enhanced-img` by-basename lookup exists in `src/routes/o-nas/+page.svelte`; the Playwright+axe per-route test exists in `tests/dokumenty.spec.ts`; the Sveltia folder-collection config exists in `static/admin/config.yml` (`dokumenty`).

The only genuinely external unknown — how to make Sveltia emit **date-prefixed, diacritic-stripped** slugs (D-06) — is resolved: Sveltia supports a collection `slug` template with a `date` transformation filter that reads the `data` field (honoring D-05 backdating), plus a **global** `slug: { encoding: ascii, clean_accents: true }` block that transliterates Polish (ł→l). Critically, the build-time reader does **not** re-derive the slug from fields — it reads the **actual filename** Sveltia commits (basename minus `.json`), which is exactly what makes D-07 (title edits keep the URL) and D-08 (deleted posts 404) true for free.

**Primary recommendation:** Store posts as **JSON files with a markdown-string `tresc` field** in `src/lib/content/aktualnosci/*.json` (mirrors `dokumenty` precedent — no frontmatter-parser dependency). Build a single shared reader `src/lib/server/aktualnosci.ts` (mirror of `dokumenty.ts`) consumed by the list route, the `[slug]` route, and the homepage `+page.server.ts`. Render the post body with a new **hardened full-block** `renderPost()` added to `src/lib/markdown.ts` (reuse the existing `escapeHtml`/`SAFE_HREF` hardening; additionally neutralize headings and tables). Derive slug from the on-disk filename. Format dates at build with a pure Polish genitive month map (never runtime `Intl`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Author/edit/publish posts (NEWS-03) | CMS / Static (Sveltia SPA at `/admin`, commits to git) | CDN / Static (Cloudflare rebuild on push) | Git is the source of truth; staff never touch a running server. No DB (RODO/cost constraint). |
| Read collection + compute meta (slug, ISO, excerpt, sort) | Build (SvelteKit `+page.server.ts` / `$lib/server`) | — | `prerender = true` is inherited; the load runs once at build, never at runtime. Zero runtime reads. |
| Render list, single post, homepage preview | CDN / Static (prerendered HTML, zero-JS) | Browser (only the shared `MobileNav` island hydrates) | Consistent with every existing content route; no client-side state. |
| Sanitize post Markdown (stored-XSS boundary) | Build (hardened `marked` renderer) | CDN / Static (page CSP `script-src 'self'`) | Two-layer defense; the DOM boundary must not rely on CSP alone (D-08, WR-03 precedent). |
| Optimize cover images | Build (`@sveltejs/enhanced-img` + Sveltia upload transform) | — | AVIF/WebP srcset, width/height (no CLS). Uploads must be Vite-processed, never `static/` (Pitfall 4). |

## Standard Stack

**No new packages this phase.** Every dependency is already installed and was vetted in Phase 2. Versions verified against `package.json` `[VERIFIED: package.json]`:

### Core (all reused)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@sveltejs/kit` | ^2.63.0 | Routes, prerender, `+page.server.ts` `entries()` | Project framework (locked) |
| `svelte` | ^5.56.1 | Runes components (`$props`, `$derived`) | Locked |
| `@sveltejs/adapter-cloudflare` | ^7.2.8 | Pages build output | Locked; server routes ARE Pages Functions |
| `@sveltia/cms` | 0.189.0 (pinned, self-hosted) | Git-based CMS folder collection (NEWS-03) | Locked; vendored bundle at `static/admin/` |
| `marked` | 18.0.9 (pinned) | Markdown → HTML for `tresc` body | Already used (D-08, WR-03). Token-renderer API. |
| `@sveltejs/enhanced-img` | 0.11.0 (pinned) | Responsive optimized cover images | Already used (`/o-nas`) |
| `@lucide/svelte` | ^1.31.0 | `newspaper`, `calendar`, `arrow-left`/`arrow-right` icons | Already used (`NewsPreview`, `dokumenty`) |

### Supporting (already present)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@axe-core/playwright` | ^4.13.0 | WCAG AA assertions in specs | New `tests/aktualnosci.spec.ts` |
| `@playwright/test` | ^1.62.1 | e2e route tests | List + single-post + empty-state specs |

**Installation:** none required — `npm ci` already provides all of the above.

**Version verification** `[VERIFIED: package.json]`: `marked@18.0.9`, `@sveltejs/enhanced-img@0.11.0`, `@sveltia/cms@0.189.0` are pinned (exact, no caret) — do NOT bump them in this phase (Phase 2 rejected an enhanced-img downgrade; keep pins). `@lucide/svelte@^1.31.0` provides the icons already imported by `NewsPreview.svelte`.

## Package Legitimacy Audit

**No external packages are installed in this phase.** All rendering, CMS, and image dependencies were installed and audited in Phase 2 and remain pinned. Reused-package status:

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `marked` | npm | mature (10+ yrs) | ~14M/wk | github.com/markedjs/marked | OK (reused) | Already installed, pinned 18.0.9 |
| `@sveltejs/enhanced-img` | npm | official Svelte pkg | high | github.com/sveltejs/kit | OK (reused) | Already installed, pinned 0.11.0 |
| `@sveltia/cms` | npm | active | moderate | github.com/sveltia/sveltia-cms | OK (reused) | Self-hosted vendored bundle, pinned 0.189.0 |
| `@lucide/svelte` | npm | official Lucide pkg | high | github.com/lucide-icons/lucide | OK (reused) | Already installed |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
STAFF (browser)                                         VISITOR (browser)
     │                                                        ▲
     │ edits at /admin (Sveltia SPA, English chrome)          │ static HTML, zero-JS
     ▼                                                        │
Sveltia CMS ──GitHub OAuth (Worker)──► git commit to main    │
                                            │                 │
                                            ▼                 │
                              Cloudflare Pages build (~2 min) │
                                            │                 │
   ┌────────────────────────────────────────┴───────────────┐│
   │  BUILD TIME (prerender = true, runs once)               ││
   │                                                          ││
   │  src/lib/content/aktualnosci/*.json  (git = source)      ││
   │            │ import.meta.glob (eager)                    ││
   │            ▼                                             ││
   │  src/lib/server/aktualnosci.ts  ── readAktualnosci() ──┐ ││
   │    • slug = on-disk filename (D-07/D-08 for free)      │ ││
   │    • parse data DD.MM.YYYY → ISO + genitive Polish     │ ││
   │    • sort by ISO DESC (NEWS-01)                        │ ││
   │    • excerpt = zajawka || first paragraph(tresc)       │ ││
   │            │                                           │ ││
   │   ┌────────┼─────────────────────────┬────────────────┘ ││
   │   ▼        ▼                          ▼                   │
   │ /+page   /aktualnosci/+page       /aktualnosci/[slug]/    │
   │ .server  .server (list, all)      +page.server (entries()  │
   │ (3 newest)                         + one post by slug)     │
   │   │        │                          │                    │
   │   │        │                   renderPost(tresc) ──────────┤ hardened marked
   │   │        │                   enhanced:img(obraz)         │ full-block + sanitize
   │   ▼        ▼                          ▼                   ││
   │ NewsPreview  card grid            <article> single post   ││
   │ (only if     + empty state                                ││
   │  posts>0)                                                 ││
   └──────────────────────────────────────────────────────────┘│
                        prerendered static HTML ────────────────┘
```

### Recommended Project Structure (new + modified)
```
src/
├── lib/
│   ├── content/aktualnosci/          # NEW folder collection (JSON per post)
│   │   └── 2026-08-01-wielkie-otwarcie-zlobka.json   # D-01 seed (+ optional D-02 fixture)
│   ├── server/aktualnosci.ts         # NEW shared build-time reader (mirror of dokumenty.ts)
│   ├── markdown.ts                    # MODIFY: add hardened renderPost() (full block)
│   ├── content/site.ts               # MODIFY: extend Post type; remove empty posts stub usage
│   └── assets/uploads/               # existing Vite-processed media (covers land here)
├── routes/
│   ├── aktualnosci/+page.svelte + +page.server.ts        # NEW list (NEWS-01)
│   ├── aktualnosci/[slug]/+page.svelte + +page.server.ts # NEW single post (NEWS-02)
│   └── +page.server.ts               # MODIFY: add 3 newest posts to homepage load
├── lib/components/NewsPreview.svelte # MODIFY: accept posts as prop (data-driven)
static/admin/config.yml               # MODIFY: add aktualnosci collection + global slug block
svelte.config.js                      # MODIFY: remove /aktualnosci from KNOWN_FUTURE_ROUTES
docs/instrukcja-cms.md                # MODIFY: news-publishing section
tests/aktualnosci.spec.ts             # NEW (list + single post + empty state)
tests/home.spec.ts                    # MODIFY: lockstep — assert rendered cards, order, hrefs
```

### Pattern 1: Shared build-time folder-collection reader (mirror `dokumenty.ts`)
**What:** A server-only module that reads `*.json` via `import.meta.glob`, derives the slug from the on-disk filename, parses the date, sorts newest-first, and computes an excerpt. Consumed by three routes (list, `[slug]`, homepage) so they can never drift.
**When to use:** Every route that needs post data.
**Example:**
```typescript
// Source: mirror of src/lib/server/dokumenty.ts (verified in-repo)
// src/lib/server/aktualnosci.ts  — SERVER ONLY (build-time; prerender = true)
export interface PostEntry {
  tytul: string;
  data: string;            // stored "DD.MM.YYYY" (matches dokumenty `wersja`)
  zajawka?: string;
  tresc: string;           // markdown-subset string
  obraz?: string;          // optional cover (basename or path under uploads)
  obraz_alt?: string;
  placeholder?: boolean;
}
export interface PostWithMeta extends PostEntry {
  slug: string;            // = on-disk filename (D-07: fixed at creation)
  href: string;            // /aktualnosci/{slug}
  iso: string;             // "YYYY-MM-DD" for <time datetime> + sort key
  dataDisplay: string;     // "1 sierpnia 2026" (Polish genitive, build-time)
  excerpt: string;         // zajawka || first paragraph of tresc
}

const MIESIACE = [
  'stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'
]; // Polish GENITIVE case (UI-SPEC example "1 sierpnia 2026"), build-time pure — NO Intl

function parseData(ddmmyyyy: string): { iso: string; display: string } | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const monthIdx = Number(mm) - 1;
  if (monthIdx < 0 || monthIdx > 11) return null;
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    display: `${Number(dd)} ${MIESIACE[monthIdx]} ${yyyy}`
  };
}

export function readAktualnosci(): PostWithMeta[] {
  const modules = import.meta.glob<PostEntry>('$lib/content/aktualnosci/*.json', {
    eager: true,
    import: 'default'
  });
  const posts: PostWithMeta[] = [];
  for (const [path, entry] of Object.entries(modules)) {
    const slug = (path.split('/').pop() ?? '').replace(/\.json$/, '');
    const parsed = parseData(entry.data);
    if (!slug || !parsed) {
      console.warn(`aktualnosci: skipping "${path}" (bad slug or data)`);
      continue; // never abort the whole prerender on one bad entry (dokumenty precedent)
    }
    const excerpt = (entry.zajawka?.trim() || firstParagraph(entry.tresc)).trim();
    posts.push({ ...entry, slug, href: `/aktualnosci/${slug}`, iso: parsed.iso, dataDisplay: parsed.display, excerpt });
  }
  // NEWS-01: newest first. Tie-break on slug so order is deterministic across builds.
  return posts.sort((a, b) => (b.iso === a.iso ? b.slug.localeCompare(a.slug) : b.iso.localeCompare(a.iso)));
}

export function readLatest(n = 3): PostWithMeta[] {
  return readAktualnosci().slice(0, n); // homepage curated subset (UI-SPEC = 3)
}
```

### Pattern 2: Slug is the filename, not a re-derived field
**What:** Sveltia fixes the entry filename at creation from the `slug` template. The build reader takes the slug from `path.split('/').pop()`, NOT from `data`+`tytul`. This is what makes D-07 (title edit keeps URL) and D-08 (delete → dead 404) automatic.
**When to use:** Always. Never recompute the slug from fields at build.

### Pattern 3: `entries()` so every post prerenders
```typescript
// Source: SvelteKit dynamic-route prerendering (adapter-cloudflare, in-repo prerender=true)
// src/routes/aktualnosci/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { readAktualnosci } from '$lib/server/aktualnosci';

export const entries: EntryGenerator = () =>
  readAktualnosci().map((p) => ({ slug: p.slug })); // crawler visits every real slug

export const load: PageServerLoad = ({ params }) => {
  const post = readAktualnosci().find((p) => p.slug === params.slug);
  if (!post) throw error(404, 'Nie znaleziono wpisu'); // unknown slug = 404 (D-08)
  return { post };
};
```

### Pattern 4: Hardened FULL-block Markdown render (extend `markdown.ts`)
**What:** The existing `renderInline()` uses `parseInline` (single paragraph). A post body has multiple blocks (paragraphs + lists), so it needs `marked.parse` — but the same hardening (escape raw HTML, filter link protocols, drop images) PLUS neutralize headings (protect the post's single `h1`) and tables. Reuse the shared `escapeHtml`/`SAFE_HREF`.
**When to use:** Post body (`tresc`) only.
```typescript
// Source: extends the verified src/lib/markdown.ts hardened renderer (D-08 / WR-03)
import { Marked } from 'marked';
// escapeHtml + SAFE_HREF: lift to shared consts, reuse from the inline renderer (do not duplicate).

const blockMarked = new Marked({
  gfm: true,
  renderer: {
    html(token) { return escapeHtml(token.text); },              // raw HTML → escaped text
    image(token) { return escapeHtml(token.text); },             // images → alt text only
    heading(token) { return `<p>${this.parser.parseInline(token.tokens)}</p>`; }, // no headings reach DOM
    table() { return ''; },                                      // GFM tables neutralized
    link(token) {
      const text = this.parser.parseInline(token.tokens);
      if (!SAFE_HREF.test(token.href.trim())) return text;       // javascript:/data: dropped
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
      return `<a href="${escapeHtml(token.href)}"${title}>${text}</a>`;
    }
  }
});

/** Render the post body (paragraphs, bold, links, ul/ol). Sync: no async extensions. */
export function renderPost(source: string): string {
  return blockMarked.parse(source) as string;
}
```
Consume with `{@html renderPost(post.tresc)}` and the same `<!-- eslint-disable-next-line svelte/no-at-html-tags -->` annotation used on `/o-nas`. Style the prose container exactly like the `/o-nas` `.prose` block (65ch measure, brand-blue underlined links, 700 strong).

### Pattern 5: Cover image by basename (mirror `/o-nas`)
```typescript
// Source: verified src/routes/o-nas/+page.svelte (enhanced-img byName lookup)
const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
  query: { enhanced: true }, eager: true, import: 'default'
});
// byName[basename] → <enhanced:img src={pic} alt={post.obraz_alt} ... />
```
`aktualnosci` uses the **global** `media_folder: src/lib/assets/uploads` (Vite-processed) — so, unlike the `dokumenty` collection, it must **NOT** set a per-collection `media_folder` override. Inherit the global so covers flow through `enhanced-img` (Pitfall 4). Seed post D-01 has no cover → renders the imageless tint-fallback card.

### Anti-Patterns to Avoid
- **Re-deriving the slug from `data`+`tytul` at build.** Use the filename. Re-derivation breaks D-07/D-08 and can desync from what Sveltia committed.
- **Runtime `Intl.DateTimeFormat` for the Polish month.** The Cloudflare prerender/runtime locale data is not guaranteed. Use the pure genitive month array (build-time).
- **Reading posts at runtime.** Everything is `import.meta.glob` eager at build; do not add `+server.ts` or `prerender = false`.
- **`marked.parse` with the default renderer.** Unsanitized → stored XSS. Always the hardened instance.
- **Filtering out future-dated posts.** D-03: every entry renders; date is sort/display only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug generation / transliteration (ł→l) | A custom slugify with a Polish char map | Sveltia global `slug: { encoding: ascii, clean_accents: true }` + `sanitize_replacement: '-'` | Sveltia slugifies on save; the filename is authoritative. Hand-rolling risks drift from the committed filename. |
| Markdown → HTML sanitizing | A regex sanitizer or raw `marked.parse` | The existing hardened `marked` instance pattern (`markdown.ts`), extended to block | Regex HTML sanitizers are a known XSS footgun; the repo already has a vetted approach (WR-03). |
| Frontmatter parsing | Add `gray-matter` and parse `.md` files | JSON files + `import.meta.glob` (dokumenty precedent) | No new dependency; Vite imports JSON natively; markdown lives in a string field. |
| Responsive/optimized covers | Manual `<picture>` + srcset | `@sveltejs/enhanced-img` (already wired) | AVIF/WebP + width/height (no CLS), zero config beyond the glob. |
| Date formatting | `Intl` / `moment` / `date-fns` | Pure genitive month array (12 strings) | Deterministic, build-time, zero dependency, no locale-data risk. |
| Prerendering dynamic routes | Manual route list | SvelteKit `entries()` from the shared reader | The framework crawls + emits static HTML for each slug. |

**Key insight:** This phase adds essentially zero new "logic" — it wires four existing, individually-vetted machines (folder-collection read, hardened marked, enhanced-img, prerender entries) together. The risk is integration drift (tests, `KNOWN_FUTURE_ROUTES`, media-folder inheritance), not novel code.

## Common Pitfalls

### Pitfall 1: Homepage test lockstep (highest risk)
**What goes wrong:** `tests/home.spec.ts` currently asserts the Aktualności section is **absent** while `posts` is empty (lines 57–68: no "Wkrótce pojawią się aktualności" heading, zero `Zobacz wszystkie` links). After D-01 seeding the homepage WILL render `NewsPreview` with cards, so those assertions invert.
**Why it happens:** The homepage renders `NewsPreview` only when `posts.length > 0`. Seeding one post flips `showNews` to true.
**How to avoid:** Update `home.spec.ts` **in the same plan** that seeds the post: assert the rendered card(s), newest-first order, and `/aktualnosci/{slug}` hrefs; keep the exact-match `Zobacz wszystkie` locator meaningful (it now SHOULD exist). Also re-point the homepage data source: `NewsPreview` must accept posts as a prop from `+page.server.ts` (`readLatest(3)`), replacing the `import { posts } from '$lib/content/site'` empty stub in `+page.svelte`.
**Warning signs:** A green suite still asserting the news section is absent means the seed did not reach the homepage.

### Pitfall 2: `KNOWN_FUTURE_ROUTES` still swallows `/aktualnosci`
**What goes wrong:** `svelte.config.js` currently allow-lists `/aktualnosci` as a known-future 404. If left in place after the route lands, the prerender crawler will **not** enforce broken internal links under `/aktualnosci`.
**How to avoid:** Remove `/aktualnosci` from `KNOWN_FUTURE_ROUTES` when the list route lands (leave a comment like the existing `/o-nas`/`/dokumenty` ones). `/aktualnosci/[slug]` is covered by `entries()`, not the allow-list.
**Warning signs:** Build stays green despite a typo'd post href.

### Pitfall 3: Cover uploads land in `static/` (enhanced-img blind)
**What goes wrong:** If the `aktualnosci` collection overrides `media_folder` to a `/static` path (copying the `dokumenty` pattern), `enhanced-img` cannot see the file (it only processes `src/lib/assets`).
**How to avoid:** Do NOT set a per-collection `media_folder`; inherit the global `src/lib/assets/uploads`. `dokumenty` overrides to `/static/dokumenty` **because** PDFs are served verbatim — images are the opposite case.
**Warning signs:** Cover renders as a broken `<img>` or the build cannot resolve the enhanced glob.

### Pitfall 4: Slug date vs backdating (D-05/D-06 interaction)
**What goes wrong:** Sveltia's `{{year}}/{{month}}/{{day}}` slug tags derive from the entry **creation** date (commit time, UTC) — NOT the `data` field. With backdating allowed (D-05), a post dated 01.08.2026 but created 13.08.2026 would get a `2026-08-13-` prefix, contradicting D-06.
**How to avoid:** Use the **`date` transformation filter** on the `data` field in the slug template so the prefix follows the publication date: `slug: "{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}"`. For the D-01 **seed**, we author the file by hand → the filename (`2026-08-01-wielkie-otwarcie-zlobka.json`) IS the slug, fully under our control.
**Warning signs:** A backdated staff post gets today's date in its URL.

### Pitfall 5: Skipped heading level on the list page
**What goes wrong:** List page has `h1` "Aktualności"; cards use `h3` → axe flags a skipped `h2`.
**How to avoid:** Wrap the grid in a `<section aria-labelledby>` with a real (or visually-hidden) `h2`, OR promote card titles to `h2`. Decide in the plan; the a11y spec must assert no skipped levels.

### Pitfall 6: Markdown-in-JSON multiline
**What goes wrong:** Storing `tresc` as a JSON string means newlines are `\n`-escaped; a hand-authored seed with real line breaks is invalid JSON.
**How to avoid:** In the seed JSON, write `tresc` as a single-line string with `\n\n` between paragraphs (or a `\n\n`-joined value). Sveltia round-trips this automatically for staff-created posts; only the hand-authored seed needs care. `marked` treats `\n\n` as a paragraph break.

## Code Examples

### CMS collection config (`static/admin/config.yml`)
```yaml
# Source: mirror of the verified `dokumenty` collection + Sveltia slug docs (CITED)
# GLOBAL slug block (top-level, applies to all collections) — add once:
slug:
  encoding: ascii          # transliterate to ASCII (Polish ł/ż/ś → l/z/s)
  clean_accents: true      # strip accents (ą→a, ę→e, ó→o)
  # defaults kept: sanitize_replacement '-', lowercase true, trim true
  # maxlength: 80          # optional: cap long titles (UI-SPEC example is short)

collections:
  - name: aktualnosci
    label: 'Aktualności'
    label_singular: 'Wpis'
    identifier_field: tytul   # so Sveltia shows the title as the entry identity
    description: 'Wpisy widoczne na stronie Aktualności, najnowsze na górze. Trzy najnowsze pokazują się też na stronie głównej. Zmiany pojawią się na stronie po ok. 2 minutach.'
    folder: src/lib/content/aktualnosci
    create: true
    extension: json
    # NO media_folder override → inherits global src/lib/assets/uploads (enhanced-img)
    # Publication-date prefix (honors backdating, D-05/D-06):
    slug: "{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}"
    fields:
      - { name: tytul, label: 'Tytuł', widget: string, hint: 'Tytuł wpisu po polsku (widoczny na liście i na stronie wpisu).' }
      - name: data
        label: 'Data publikacji'
        widget: datetime
        date_format: 'DD.MM.YYYY'
        time_format: false
        hint: 'Data wpisu (DD.MM.RRRR). Wpisy sortowane od najnowszego.'
      - { name: zajawka, label: 'Zajawka', widget: text, required: false, hint: 'Krótkie streszczenie (2-3 zdania) pokazywane na kafelku listy. Jeśli puste, użyjemy początku treści.' }
      - name: tresc
        label: 'Treść'
        widget: markdown
        buttons: [bold, link, bulleted-list, numbered-list]   # no headings/image/italic
        hint: 'Pełna treść wpisu. Dozwolone: pogrubienie, odnośniki oraz listy.'
      - { name: obraz, label: 'Zdjęcie (opcjonalnie)', widget: image, required: false, hint: 'Zdjęcie nagłówkowe. Bez identyfikowalnych dzieci bez zgody. Zostanie zoptymalizowane automatycznie.' }
      - { name: obraz_alt, label: 'Opis alternatywny zdjęcia (alt)', widget: string, required: false, hint: 'Krótki opis zdjęcia dla osób korzystających z czytników ekranu.' }
      - { name: placeholder, label: 'Treść zastępcza (do potwierdzenia)', widget: boolean, default: true, hint: 'Zaznacz, dopóki treść nie została potwierdzona.' }
```
> **Verify at implementation** `[CITED: sveltiacms.app/en/docs/collections/entries]`: confirm the `date` transformation filter and the global `slug` keys against the pinned `@sveltia/cms@0.189.0` bundle (Sveltia tracks Decap-compat but has its own additions). If the `date` filter is unavailable in 0.189.0, fall back to `slug: "{{fields.data}}-{{fields.tytul}}"` and set the datetime widget storage to ISO via `format: 'YYYY-MM-DD'` (keeping `date_format: 'DD.MM.YYYY'` for the picker) — then the raw stored value is already `YYYY-MM-DD`.

### Seed post (D-01) — `src/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka.json`
```json
{
  "tytul": "Wielkie otwarcie żłobka: 14 sierpnia!",
  "data": "01.08.2026",
  "zajawka": "Zapraszamy na uroczyste otwarcie Publicznego Żłobka w Stromcu 14 sierpnia 2026 r.",
  "tresc": "Z ogromną radością informujemy, że 14 sierpnia 2026 r. o godz. 11:00 odbędzie się uroczyste otwarcie Publicznego Żłobka w Stromcu, pierwszej takiej placówki w naszej gminie.\n\nW programie: zwiedzanie sal, spotkanie z kadrą, animacje i słodki poczęstunek dla najmłodszych. Serdecznie zapraszamy wszystkich rodziców i dzieci.\n\nPodczas dnia otwartego będzie można również złożyć kartę zgłoszenia dziecka i zapytać o szczegóły rekrutacji.",
  "placeholder": true
}
```
> Em dash swept to comma/colon (v1.2 §8). No `obraz` → imageless tint-fallback card. All facts PLACEHOLDER (`placeholder: true`) until written client confirmation. For D-02 (newest-first test), add a second dated fixture (e.g. `2026-07-15-...`) so the spec can assert ordering.

### Homepage load (mirror `+page.server.ts` docs pattern)
```typescript
// Source: verified src/routes/+page.server.ts (D-18 curated-subset pattern)
import type { PageServerLoad } from './$types';
import { readDokumenty } from '$lib/server/dokumenty';
import { readLatest } from '$lib/server/aktualnosci';

export const load: PageServerLoad = () => {
  const docs = readDokumenty().filter((e) => e.kategoria === 'rekrutacja').slice(0, 2)
    .map((e) => ({ name: e.nazwa, meta: e.meta, href: e.plik }));
  const posts = readLatest(3); // 3 newest for NewsPreview (UI-SPEC)
  return { docs, posts };
};
```
Then in `+page.svelte`: `const showNews = data.posts.length > 0;` and `{#if showNews}<NewsPreview posts={data.posts} />{/if}` — drop `import { posts } from '$lib/content/site'`.

### Test skeleton (`tests/aktualnosci.spec.ts`)
```typescript
// Source: verified tests/dokumenty.spec.ts + tests/home.spec.ts patterns
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Aktualności: NEWS-01/02/03 acceptance', () => {
  test('list resolves 200 with a single Polish h1', async ({ page }) => {
    const res = await page.goto('/aktualnosci');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('Aktualności');
  });
  test('posts render newest-first (NEWS-01)', async ({ page }) => {
    await page.goto('/aktualnosci');
    const titles = await page.locator('article a h3, .news-card h3').allTextContents();
    // assert the known fixture order (newest fixture title precedes the older)
    expect(titles.length).toBeGreaterThan(0);
  });
  test('a post opens and renders full body (NEWS-02)', async ({ page }) => {
    const res = await page.goto('/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: /Wielkie otwarcie/ })).toBeVisible();
    await expect(page.locator('time')).toHaveAttribute('datetime', '2026-08-01');
  });
  test('unknown slug 404s (D-08)', async ({ page }) => {
    const res = await page.goto('/aktualnosci/nie-ma-takiego');
    expect(res?.status()).toBe(404);
  });
  test('no WCAG 2.1 AA violations on list and post', async ({ page }) => {
    for (const url of ['/aktualnosci', '/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka']) {
      await page.goto(url);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      expect(r.violations).toEqual([]);
    }
  });
});
```
> The empty-state assertion needs a build with zero posts. Since D-01 always seeds one post, cover the empty state by a component/unit path or a dedicated fixtureless build note — OR assert the empty-state markup via the shared component in isolation. Planner decides (D-02 discretion). Note: `page.goto` returning a 404 status still renders SvelteKit's error page; confirm the project has an `+error.svelte` or accept the default.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `marked` string-function renderer (`renderer.link = (href, title, text) =>`) | Token-object renderer (`link(token)`, `token.href`, `this.parser.parseInline`) | marked v5+ (repo uses 18.0.9) | The extend of `markdown.ts` MUST use the token API — already the case in `renderInline`. |
| Netlify/Decap Git Gateway + `{{year}}` creation-date slugs | Sveltia self-hosted OAuth Worker + `date` transformation filter reading a field | Sveltia CMS | Enables publication-date-prefixed slugs that honor backdating. |
| Runtime locale date formatting | Build-time pure month map | project convention (UI-SPEC) | No `Intl` locale-data dependency on Cloudflare. |

**Deprecated/outdated:**
- Sveltia collection-level `slug_length` → replaced by the global `slug: { maxlength }` option `[CITED: sveltiacms.app/en/docs/collections/entries]`. Use the global option if capping is needed.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `date` transformation filter is available in `@sveltia/cms@0.189.0` slug templates | config.yml example, Pitfall 4 | Slug prefix would fall back to creation date; mitigation documented (store ISO via `format` + plain `{{fields.data}}`). Verify against the pinned bundle. |
| A2 | Sveltia stores the `datetime` value as the `date_format` string (`"DD.MM.YYYY"`) when `format` is omitted | `parseData` reader | Empirically supported: `dokumenty/*.json` store `"wersja": "02.04.2026"` `[VERIFIED: codebase]`. If storage differs, adjust `parseData` regex. |
| A3 | D-01 seed facts (date 14.08.2026 event, 01.08.2026 publish) are correct | Seed post | Content-only; `placeholder: true` flags it; client confirmation pending. Not a code risk. |
| A4 | `marked` `gfm: true` heading/table override fully neutralizes those blocks | renderPost | Low: widget offers no heading/table buttons; override is defense-in-depth. |

## Open Questions

1. **Empty-state coverage when D-01 always seeds a post**
   - What we know: The list page must render the inherited empty state (UI-SPEC), but a seeded collection is never empty at build.
   - What's unclear: whether to assert the empty state via a component-isolation test, a fixtureless build, or accept it as visually-verified only.
   - Recommendation: Assert the empty-state markup by rendering `NewsPreview`/list with `posts={[]}` in a component test, or document it as manually verified. Planner call (D-02 discretion).

2. **Sveltia `date` filter availability (see A1)**
   - Recommendation: During implementation, create one test post in the live CMS and inspect the committed filename before finalizing the slug template. Keep the ISO-storage fallback ready.

3. **`+error.svelte` for 404 UX**
   - What we know: unknown slug throws `error(404)`; the project may or may not have a styled error page.
   - Recommendation: Confirm an `+error.svelte` exists (or add a minimal Polish one) so a dead post URL (D-08) shows a friendly page, not a bare default.

## Environment Availability

No new external dependencies. The build toolchain (Node 22.23.2 via asdf, npm, wrangler, Playwright) is already provisioned and proven across Phases 1–2.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node (build) | prerender, import.meta.glob | ✓ | 22.23.2 (asdf) | — |
| `marked` | post body render | ✓ | 18.0.9 (installed) | — |
| `@sveltejs/enhanced-img` | cover images | ✓ | 0.11.0 (installed) | imageless card |
| `@sveltia/cms` bundle | NEWS-03 authoring | ✓ | 0.189.0 (vendored) | — |
| Playwright + axe | route specs | ✓ | 1.62.1 / 4.13.0 | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.

## Validation Architecture

> `nyquist_validation: true` (config.json) — section required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 |
| Config file | `playwright.config.*` (existing; specs in `tests/`) |
| Quick run command | `npx playwright test tests/aktualnosci.spec.ts` |
| Full suite command | `npm run test` (all specs) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NEWS-01 | List renders posts newest-first | e2e + axe | `npx playwright test tests/aktualnosci.spec.ts -g "newest-first"` | ❌ Wave 0 |
| NEWS-02 | Single post opens with full body + `<time datetime>` | e2e + axe | `npx playwright test tests/aktualnosci.spec.ts -g "opens and renders"` | ❌ Wave 0 |
| NEWS-02 | Unknown slug 404s (D-08) | e2e | `npx playwright test tests/aktualnosci.spec.ts -g "unknown slug"` | ❌ Wave 0 |
| NEWS-03 | Homepage shows 3 newest after seed (lockstep) | e2e | `npx playwright test tests/home.spec.ts` | ✅ (MODIFY in lockstep) |
| SITE-04/A11Y | Zero WCAG AA violations on both routes | axe | `npx playwright test tests/aktualnosci.spec.ts -g "WCAG"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run check` (svelte-check types + a11y) then the relevant `tests/aktualnosci.spec.ts` case.
- **Per wave merge:** `npm run test` (full suite — home lockstep must stay green).
- **Phase gate:** `npm run check && npm run lint && npm run test` all green before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `tests/aktualnosci.spec.ts` — covers NEWS-01, NEWS-02, D-08, WCAG AA
- [ ] `tests/home.spec.ts` MODIFY — lockstep: assert rendered cards, newest-first order, `/aktualnosci/{slug}` hrefs (currently asserts news section absent)
- [ ] Empty-state coverage decision (component test or documented manual) — Open Question 1
- [ ] Confirm `+error.svelte` exists for the 404 path (Open Question 3)

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1`, `security_block_on: high` (config.json).

### Applicable ASVS Categories (L1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no (visitor pages read-only) | Sveltia GitHub OAuth (Phase 2, unchanged) |
| V3 Session Management | no | — |
| V4 Access Control | no | Content is public by design |
| V5 Validation, Sanitization & Encoding | **yes** | Hardened `marked` renderer (`renderPost`) — escape raw HTML, filter link protocols (`SAFE_HREF`), drop images, neutralize headings/tables; page CSP `script-src 'self'` as second layer |
| V6 Cryptography | no | No secrets on these pages; OAuth secret stays on the Worker |
| V12 Files & Resources | **yes** | Cover uploads capped (`max_file_size: 5000000`) + transformed on upload (Sveltia); `obraz` path handled via basename lookup (no traversal); PDFs not involved here |

### Known Threat Patterns for {SvelteKit prerender + git-CMS markdown}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored XSS via `tresc` markdown (staff-authored, or a compromised editor account) | Tampering / Elevation | Hardened `renderPost` (no raw HTML/script/`javascript:`/`data:` reaches the DOM) + CSP `script-src 'self'` — two layers (D-08, WR-03 precedent) |
| Malicious/oversized cover upload | Denial of Service | `media_libraries` `max_file_size` + on-upload transform (webp, cap 1600px) — first layer; `enhanced-img` — second |
| Path traversal via `obraz` value | Tampering | Resolve covers by **basename** against a static `import.meta.glob` set (like `/o-nas`); unknown basename → no image, never a filesystem read of an arbitrary path |
| Broken/hostile external link in post body | — | `SAFE_HREF` allow-list (http(s)/mailto/tel/relative/fragment only); external links get `rel="noopener noreferrer"` + new-tab treatment (inherited Footer/BIP pattern) |
| Build DoS from one malformed entry | Availability | Reader skips bad entries with a warning (never aborts the whole prerender — `dokumenty.ts` precedent) |

## Sources

### Primary (HIGH confidence)
- In-repo verified files: `src/lib/server/dokumenty.ts`, `src/lib/markdown.ts`, `src/routes/o-nas/+page.svelte`, `src/routes/+page.server.ts`, `src/routes/dokumenty/+page.svelte`, `static/admin/config.yml`, `svelte.config.js`, `tests/home.spec.ts`, `package.json`, `src/lib/content/site.ts`, `src/lib/components/NewsPreview.svelte`, `src/lib/content/dokumenty/*.json` — patterns, versions, and storage format.
- `.planning/phases/03-news-aktualno-ci/03-UI-SPEC.md` (LOCKED design contract), `03-CONTEXT.md` (decisions), `.planning/phases/02-about-documents-cms/02-PATTERNS.md`.

### Secondary (MEDIUM confidence)
- Sveltia CMS official docs — Entry Collections (slug template tags, global `slug` config: `encoding`, `clean_accents`, `sanitize_replacement`, `maxlength`) `[CITED: sveltiacms.app/en/docs/collections/entries]`.
- Sveltia CMS slug transformation filters (`date`, `default`, `ternary`) — GitHub discussions + docs `[CITED: sveltiacms.app/en/docs/fields]`.

### Tertiary (LOW confidence)
- Datetime widget storage-format behavior when `format` is omitted — inferred from Decap compatibility + corroborated by in-repo `dokumenty` JSON (`"02.04.2026"`); verify against the pinned 0.189.0 bundle at implementation (A2).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified in `package.json`; no new packages.
- Architecture / build patterns: HIGH — every pattern has a working in-repo analog.
- Sveltia slug mechanics: MEDIUM — CITED from official docs; the `date` filter and datetime storage need a quick confirmation against the pinned bundle (A1/A2, Open Question 2).
- Pitfalls: HIGH — derived from the actual current test/config code (lockstep, KNOWN_FUTURE_ROUTES, media-folder inheritance).

**Research date:** 2026-08-13
**Valid until:** 2026-09-12 (30 days; stack is pinned — stable). Re-verify Sveltia locale list + slug filter behavior against `@sveltia/cms@0.189.0` at implementation.
