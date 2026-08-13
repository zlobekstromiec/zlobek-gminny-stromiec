# Phase 3: News (Aktualności) - Context

**Gathered:** 2026-08-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can publish news posts via the Sveltia CMS (new `aktualnosci` folder collection, Polish labels/hints) and visitors can read them: `/aktualnosci` lists all posts newest-first (with the inherited empty state), `/aktualnosci/[slug]` renders a single post's full content, and the homepage `NewsPreview` switches from the empty `posts: []` stub in `site.ts` to the 3 most recent real posts. Both routes prerendered, zero-JS.

**Requirements in scope:** NEWS-01, NEWS-02, NEWS-03.

**Locked upstream - do NOT re-decide:** the approved Phase 3 design contract `03-UI-SPEC.md` (routes, shared card contract, empty state, no pagination in v1, long Polish dates via build-time month map, constrained markdown subset via `marked` + sanitize, the full Polish CMS field schema `tytul`/`data`/`zajawka`/`tresc`/`obraz`/`obraz_alt`/`placeholder`, covers via `enhanced-img` uploads, homepage preview count 3, test lockstep); the Phase 1 design system (`01-UI-SPEC.md` + Amendments v1.1/v1.2); direct publish to main with no editorial workflow (Phase 2 D-20); placeholder boolean convention (Phase 2 D-09); instrukcja pattern (Phase 2 D-12/D-21); copy rules (no emoji, no em dashes; en dash only in numeric ranges).

</domain>

<decisions>
## Implementation Decisions

> **ALL DEFAULTED while user away (matches the Phase 1/2 pattern) - confirm before or during planning.** Gray areas were presented; no response arrived, so each took the recommended option.

### Launch content seeding (NEWS-01/02, homepage first render)
- **D-01 (DEFAULTED):** **Seed the collection with the one banked launch post** from `.planning/DESIGN-BANK.md` ("Wielkie otwarcie żłobka: 14 sierpnia!", data 01.08.2026), `placeholder: true`, **no cover image** (exercises the imageless tint-fallback card), the banked em dash swept to comma/colon per v1.2 §8. Rationale: consistent with the placeholder-first strategy and the Phase 2 BIP-seeded dokumenty pattern; makes the homepage news section render for the first time; gives Playwright real build-time content. Site stays noindex on `*.pages.dev`.
  - **Timing caveat to raise with the client:** the announced event date (14.08.2026) is effectively now. At confirmation the client may prefer the post rewritten as a post-event recap; that is a CMS content edit, not a code change.
- **D-02:** Extra posts needed to assert newest-first ordering in tests are **planner discretion** (build fixtures or a second modest seed); only the one banked post is required content.

### Publishing semantics (NEWS-03)
- **D-03 (DEFAULTED):** **`data` is display/sort metadata only - every entry in the collection renders.** A saved post is live after the ~2 minute rebuild regardless of its date. NO build-time future-date filter: on a static git-built site nothing triggers a rebuild when a date arrives, so date-filtering silently strands a "scheduled" post until some unrelated commit. No scheduled-rebuild infrastructure (cron + deploy hook) in v1 (near-zero-cost simplicity).
- **D-04 (DEFAULTED):** **No draft/szkic mechanism in v1**, consistent with direct-publish-to-main (Phase 2 D-20). The instrukcja news section documents "zapisanie = publikacja (po ok. 2 minutach)". A lightweight draft boolean is deferred to v2 if staff ask for it.
- **D-05:** Backdating is implicitly allowed (staff set any date; sort order handles it). No validation beyond the `datetime` widget format.

### Post URLs & lifecycle (NEWS-02)
- **D-06 (DEFAULTED):** **Slugs are date-prefixed:** `/aktualnosci/RRRR-MM-DD-tytul` (publication date + transliterated title, Polish diacritics cleaned, e.g. ł to l). Municipal titles recur annually ("Rekrutacja 2027", "Życzenia świąteczne"), so the date prefix prevents collisions without staff intervention. Exact Sveltia slug template/encoding mechanics (clean accents, ascii encoding, binding to the `data` field) are researcher/planner detail.
- **D-07 (DEFAULTED):** **Title edits after publish do NOT change the URL.** Sveltia fixes the entry file name at creation, which satisfies the UI-SPEC "slug stable once published" rule for free. Instrukcja notes that correcting a title keeps the old address.
- **D-08 (DEFAULTED):** **Deleted posts leave dead URLs that 404.** Acceptable at municipal volume; internal links rebuild automatically on the delete commit. No redirect infrastructure in v1.

### Claude's Discretion
- Content file format for posts (markdown + frontmatter vs JSON with a markdown string field) and exact Sveltia collection config mechanics - follow the Phase 2 precedent (researcher's call). UI-SPEC constraints (media folder `src/lib/assets/uploads`, widget buttons `[bold, link, bulleted-list, numbered-list]`, `datetime` with `DD.MM.YYYY`) govern regardless of format.
- Heading-order gate on the list page: `h2` section wrapper vs promoting card titles to `h2` (UI-SPEC allows either; no skipped heading level may ship; axe asserts it).
- Test fixture approach for the newest-first assertion (D-02).
- Homepage curated count is 3 per UI-SPEC; planner may adjust only within "fills whole grid rows cleanly and stays a small subset".

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contracts (LOCKED)
- `.planning/phases/03-news-aktualno-ci/03-UI-SPEC.md` - THE authoritative Phase 3 delta contract: routes, card/empty-state/post composition, CMS Polish copy contract (field schema + labels/hints), copywriting, date formatting, a11y contract, planner/executor notes. Do not re-derive.
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` - inherited base design system + Amendments v1.1/v1.2 (tokens, type, color, motion, copy rules).

### Content source
- `.planning/DESIGN-BANK.md` - the banked launch post seeded per D-01 (title, date, zajawka, body; facts PLACEHOLDER until written client confirmation).

### Stack & research (LOCKED)
- `.planning/research/STACK.md` - SvelteKit 2 + Svelte 5 + adapter-cloudflare + Tailwind v4; Sveltia CMS versions and rationale.
- `.planning/research/SUMMARY.md` - Phase 3 delivery notes (strict field schemas, build-time reads).
- `.planning/research/PITFALLS.md` - esp. the media-folder pitfall (uploads must be Vite-processed, never `static/`) and CMS usability pitfalls.
- `.planning/research/ARCHITECTURE.md` - git-as-CMS one-way content pipeline (translate Astro-flavored examples to SvelteKit).

### Project intent
- `.planning/PROJECT.md` - core value, Polish-only constraint, key decisions table.
- `.planning/ROADMAP.md` §"Phase 3" - goal + 4 success criteria.
- `.planning/REQUIREMENTS.md` - NEWS-01/02/03 acceptance wording; NEWS-04 (categories/filtering) and RSS-01 are explicitly v2 backlog, out of this phase.

### Live artifacts this phase extends
- `static/admin/config.yml` - existing Sveltia collections (o_nas, day_plan, dokumenty patterns) the new `aktualnosci` collection must mirror.
- `docs/instrukcja-cms.md` - Polish staff guide; gains the news-publishing section (D-04, D-07 notes + publish-delay reminder).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/components/NewsPreview.svelte` - already renders the locked card grid + empty-state panel; re-source its data, reuse its card for `/aktualnosci` (UI-SPEC wants one shared card component).
- `src/lib/content/site.ts` - `Post` type (`{ title, date, href, excerpt? }`) to extend with `slug` + optional `image`/`alt`; the `posts: Post[] = []` stub is replaced by the build-time collection read.
- `src/lib/server/dokumenty.ts` - the build-time collection resolver pattern (D-18 precedent) to mirror for an `aktualnosci` reader shared by list, slug page, and homepage.
- `marked` + sanitize pipeline (Phase 2, WR-03 fix) - post body rendering; here a FULL `marked` parse (not `parseInline`) constrained to paragraphs/bold/links/lists.
- `@sveltejs/enhanced-img` pipeline (Phase 2 /o-nas) - post cover images.
- `Seo`, `Header`, `Footer`, `TopBar`, `SkipLink`, `Cta` - shared chrome + optional closing CTA.
- `tests/{home,o-nas,dokumenty}.spec.ts` - Playwright + axe per-route pattern to replicate as `tests/aktualnosci.spec.ts`.

### Established Patterns
- All content routes prerendered zero-JS; MobileNav stays the only hydrated island.
- Tailwind v4 `@theme` tokens in `src/app.css`; two-tier palette; no new tokens this phase.
- Polish-only UI; PLACEHOLDER boolean + `// PLACEHOLDER:` comments; no emoji / no em dashes anywhere (copy, comments, test names).
- CMS collections: strict validated widgets, Polish labels/hints, per-collection media folder, commit-to-main triggers Pages rebuild.

### Integration Points
- `svelte.config.js` KNOWN_FUTURE_ROUTES: REMOVE `/aktualnosci` when the list route lands (crawler then enforces it); `/aktualnosci/[slug]` needs `entries()` so every post prerenders; unknown slug = `error(404)`.
- `src/routes/+page.server.ts` - extend the existing homepage build-time load (docs panel) with the 3 newest posts; `NewsPreview` renders only when `posts.length > 0` (Amendment v1.1 §1 - the homepage never shows the news empty state).
- `tests/home.spec.ts` - LOCKSTEP update: currently asserts `NewsPreview` is absent while posts is empty; after D-01 seeding it must assert rendered card(s), newest-first order, `/aktualnosci/{slug}` hrefs.
- `static/admin/config.yml` - new `aktualnosci` folder collection (`folder: src/lib/content/aktualnosci`, `create: true`) with the UI-SPEC field schema and slug template (D-06).
- `docs/instrukcja-cms.md` - news flow section with the English-chrome mapping (Save/Publish/Delete) and publish-delay note.

</code_context>

<specifics>
## Specific Ideas

- **Seed post (verbatim from DESIGN-BANK, em dash swept):** Tytuł "Wielkie otwarcie żłobka: 14 sierpnia!", data 01.08.2026, zajawka + treść as banked; no image (imageless tint-fallback card); `placeholder: true`.
- **Static-site publishing honesty:** the phase deliberately avoids any mechanism that pretends to schedule content (future-date filters, drafts) because rebuilds only happen on commits; visibility rules must be verifiable at build time.
- **URL shape example:** `/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`.

</specifics>

<deferred>
## Deferred Ideas

- **Draft/szkic boolean** (prepare a post without publishing) - v2, only if staff request it after using the CMS.
- **Scheduled publishing** (cron-triggered rebuild + future-date filter) - rejected for v1 (infrastructure + silent-strand risk); revisit only with a real client need.
- **NEWS-04 categories/tags/filtering + pagination** - v2 backlog (REQUIREMENTS.md).
- **RSS-01 feed for Aktualności** - v2 backlog (REQUIREMENTS.md).
- **"Ustawienia strony" site-facts singleton** (contact, keyFacts, recruitmentOpen CMS-editable) - stays deferred to Phase 4; Phase 3 touches only `posts`.
- **Post-event rewrite of the launch post** (recap instead of announcement) - client confirmation moment, CMS content edit only.

</deferred>

---

*Phase: 3-news-aktualno-ci*
*Context gathered: 2026-08-13*
*Note: D-01, D-03, D-04, D-06, D-07, D-08 were DEFAULTED to the recommended options while the user was away - confirm before or during planning.*
