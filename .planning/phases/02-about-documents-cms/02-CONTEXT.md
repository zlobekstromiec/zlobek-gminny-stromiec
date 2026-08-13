# Phase 2: About, Documents & CMS - Context

**Gathered:** 2026-08-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can self-edit the O nas page and manage downloadable documents (Dokumenty) through the git-based Sveltia CMS on the live deployment, with no developer involved: the full login (GitHub OAuth via self-hosted `sveltia-cms-auth` Worker) -> edit -> commit -> Cloudflare rebuild -> live loop, with the CMS admin presenting to staff entirely in Polish.

**Requirements in scope:** ABOUT-01, ABOUT-02, DOCS-01, DOCS-02, CMS-01, CMS-02, CMS-03.

**Locked upstream - do NOT re-decide:** design system (`01-UI-SPEC.md` + Amendments v1.1/v1.2), stack (`STACK.md`), Sveltia + `sveltia-cms-auth` Worker + GitHub OAuth App under the `zlobekstromiec` Org, Polish-only product (SITE-06, CMS-03), placeholder-first content strategy, copy rules (no emoji, no em dashes; en dash only in numeric ranges).

</domain>

<decisions>
## Implementation Decisions

### O nas page composition (ABOUT-01)
- **D-01:** Sections = the roadmap four PLUS a facility story: Misja, Wartości, Plan dnia, Kadra, and a section about the building/sala/plac zabaw with photos. Exact ordering and the facility section's placement within the page are Claude's discretion (UI hint: yes - a UI-SPEC amendment may cover this).
- **D-02:** Kadra = **group description**: a warm collective text (qualifications, approach) plus headcount by role (opiekunki, personel pomocniczy). No individual profiles, no staff photos - avoids per-person wizerunek consent and staff-churn maintenance; simplest CMS field.
- **D-03:** Plan dnia = **single source, reused**: one CMS-editable plan dnia dataset powers BOTH the homepage `DayPlan` component and the /o-nas section. Edit once, updates everywhere. The homepage component keeps rendering exactly what it does today, just sourced from the CMS content layer.
- **D-04:** Facility photos = **stock/AI, environment-only** (rooms, toys, playground; zero identifiable people), marked placeholder, swapped for consented real photography in Phase 6 (consistent with Phase 1 D-03 / LAUNCH-01).

### CMS editability model (ABOUT-02, CMS-01..03)
- **D-05:** O nas content = **strict structured fields** (validated widgets), NOT a free-form page body: misja text, wartości list, plan dnia repeatable rows, kadra text + role counts, facility story text + image list. Staff cannot break layout or the build (research SUMMARY.md prescription; Pitfall 8).
- **D-06:** **Forced-only migration** from `site.ts`: only O nas content, the dokumenty collection, and the shared plan dnia move into the CMS content layer this phase. `contact`, `keyFacts`, `perks`, recruitment strings, and `posts` stay in `site.ts` until their own phases (posts -> Phase 3, recruitment/contact -> Phase 4).
- **D-07:** **Build-time image optimization pipeline lands this phase** with the CMS (AVIF/WebP + responsive sizes; tool choice - e.g. `@sveltejs/enhanced-img` vs `vite-imagetools` - is researcher's call). Every staff-uploaded image is optimized from day one (Pitfall 9; SUMMARY.md assigns this here).
- **D-08:** Narrative fields allow **limited rich text only**: paragraphs, bold, links. No headings, no inline images, no tables - design-locked typography stays intact.
- **D-09:** Placeholder tracking in CMS content = a **Polish boolean field per entry** (e.g. "Treść zastępcza (do potwierdzenia)" -> `placeholder: true` in the file). Greppable for the Phase 6 launch gate; the client can flip it themselves when content is confirmed. Code-side `// PLACEHOLDER:` comments continue unchanged for non-CMS values.
- **D-10:** CMS admin lives at **/admin** (Sveltia convention, `static/admin/`); the admin content itself is Polish (CMS-03).
- **D-11:** The verbatim core message **stays hard-coded in `site.ts`**, never CMS-editable: FINAL byte-exempt client copy protected from accidental edits (exact-match acceptance test depends on it).
- **D-12:** Publish feedback = the **Polish instrukcja explains it** (save -> wait ~2 minutes -> refresh). No status link, no extra infrastructure. This makes a short Polish staff guide (instrukcja) a Phase 2 deliverable (see D-21).

### Dokumenty organization (DOCS-01/02) - taxonomy grounded in live BIP research (2026-08-13)
- **D-13 (DEFAULTED while user away - confirm):** Categories = **"Rekrutacja" + "Statut i uchwały"**, matching what actually exists on the Stromiec BIP, plus a dormant **"RODO"** dropdown value whose page group renders only once it contains documents (the żłobek-specific klauzula does not exist yet anywhere - it gets authored in Phase 4).
- **D-14:** Row metadata = **type + size + "wersja z DD.MM.RRRR"**. The "wersja z dnia" framing was chosen specifically to answer the user's stale-date concern: an old date reads as a stable binding version, not site neglect. Size/type derivable at build time.
- **D-15:** Category assignment in CMS = **fixed validated dropdown** (staff cannot typo new categories into existence; new category = one-line dev change).
- **D-16 (DEFAULTED - confirm):** **Host our own copies** of all documents via CMS uploads (DOCS-02 requires staff upload/replace/remove; Białobrzegi's deep-link-to-BIP model produces structural link rot because BIP file URLs carry unix timestamps that change on every re-upload). Optionally add a per-document "Źródło (BIP)" external-link field for provenance. Seed the collection with the current BIP file set, placeholder-flagged.
- **D-17 (DEFAULTED - confirm):** **Keep source file formats** as-is: DOC/DOCX for the fillable recruitment forms (that is what BIP publishes and fillable is a feature), PDF for uchwały/zarządzenia. Format badge per row comes from D-14. Producing parent-friendly PDF versions of the forms is a client/launch decision (deferred).
- **D-18 (DEFAULTED - confirm):** Re-align the homepage recruitment docs list (`site.ts` `recruitment.docs`) with the real BIP names: "Wniosek o przyjęcie dziecka" (NOT "Karta zgłoszenia dziecka"), załączniki 1-6 (oświadczenia), oświadczenie o rezygnacji, regulamin rekrutacji. Three currently-listed documents do NOT exist on BIP (Regulamin organizacyjny, Upoważnienie do odbioru dziecka, Oświadczenia RODO) - drop or placeholder-flag them pending client confirmation. Each row links its real hosted file with size + wersja date (fulfils the existing `site.ts` comment's intent).

### Staff access & workflow (CMS-01, handover) - ALL DEFAULTED while user away; confirm
- **D-19 (default):** **Per-editor GitHub accounts** (not a shared account): per-person audit trail in git history, individually revocable, managed as members of the `zlobekstromiec` Org. This also closes the open item flagged in STATE.md blockers ("staff GitHub account model") - pending client confirmation at handover.
- **D-20 (default):** **Direct publish to main** (no editorial/draft workflow): one or two trusted editors, strict validated schemas make broken builds unlikely, and a PR-based draft flow would require someone who can review PRs - which is exactly the developer-dependence this phase removes.
- **D-21 (default):** A short **Polish instrukcja** ships with this phase: logging in, editing O nas, adding/replacing/removing documents, and the publish delay (D-12). Format and location are Claude's discretion (suggest `docs/instrukcja-cms.md`, printable).
- **D-22 (default):** Staff provisioning = invite as Org members with write access to the content repo; exact GitHub role mechanics are a planner/researcher detail.

### Claude's Discretion
- Content-layer file format and location (markdown + frontmatter vs YAML/JSON under `src/content/`), collection naming, Sveltia `config.yml` specifics.
- O nas section ordering/visual treatment within the locked design system (`/gsd-ui-phase 2` available - roadmap UI hint: yes).
- Image pipeline tool choice (D-07).
- Instrukcja format (D-21).
- CSP extension for /admin + the OAuth Worker (the `svelte.config.js` comment already anticipates Phase 2 additions).
- Image pipeline seed: current placeholder assets stay as-is unless trivially convertible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (LOCKED - inherited)
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` - complete approved design system + Amendments v1.1/v1.2 (tokens, type, spacing, components, WCAG contract, copy rules). Do not re-derive.

### Stack & architecture (LOCKED)
- `.planning/research/STACK.md` - SvelteKit 2 + Svelte 5 + adapter-cloudflare + Tailwind v4; Sveltia CMS + `sveltia-cms-auth` Worker versions and rationale.
- `.planning/research/ARCHITECTURE.md` - "Git-as-CMS with an OAuth proxy Worker" pattern, content-collection layout (Astro-flavored tree is illustrative; translate to SvelteKit), one-way Git-to-live content pipeline.
- `.planning/research/SUMMARY.md` - Phase 2/3 content-model + CMS delivery notes (strict field schemas, image pipeline assignment, login-edit-commit-rebuild verification on the LIVE deployment).
- `.planning/research/PITFALLS.md` - esp. #7 (no Git Gateway on Cloudflare -> OAuth Worker), #8 (staff can't use CMS / broken builds -> strict widgets, Polish labels), #9 (image bloat -> build-time pipeline this phase).

### Project intent
- `.planning/PROJECT.md` - core value, Polish-only constraint, key decisions table.
- `.planning/ROADMAP.md` §"Phase 2" - goal + 6 success criteria (note criterion 3: OAuth login verified on the LIVE deployment, not just locally).
- `.planning/REQUIREMENTS.md` - ABOUT-01/02, DOCS-01/02, CMS-01/02/03 acceptance wording.

### External references (user-flagged during discussion; inventoried 2026-08-13)
- `https://ugstromiec.naszbip.pl/zlobek/n,rekrutacji-dzieci-do-publicznego-zlobka-w-stromcu-na-rok-20262027` - THE source of truth for what recruitment documents exist (9 files; see Specific Ideas for the inventory).
- `https://ugstromiec.naszbip.pl/zlobek` - żłobek BIP root (only the recruitment announcement lives here; statut/opłaty are in other BIP sections).
- `https://zlobekzlota.pl` - comparison żłobek (flat self-hosted Dokumenty page; UX anti-lessons: raw filenames, typos, no dates).
- `https://zlobek.bialobrzegi.pl` - design anti-reference AND document-hosting anti-lesson (hosts zero files, deep-links timestamped BIP URLs -> structural link rot, stale links, missing załączniki).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/content/site.ts` - typed-constants content pattern; `dayPlan` and `recruitment.docs` migrate out this phase (D-03, D-18); `coreMessage` explicitly stays (D-11).
- `src/lib/components/DayPlan.svelte` - re-target to the CMS-sourced plan dnia; reusable on /o-nas.
- `src/lib/components/{Seo,Wave,Cta}.svelte`, `src/lib/icons/*` - direct reuse on the two new pages.
- `tests/*.spec.ts` - Playwright + axe per-route pattern to replicate for /o-nas and /dokumenty.

### Established Patterns
- All content routes prerendered; exactly one hydrated island so far (MobileNav) - new pages should stay zero-JS static.
- Tailwind v4 `@theme` tokens in `src/app.css`; two-tier palette (expressive vs accessible).
- Polish-only UI text; PLACEHOLDER marker convention; no emoji / no em dashes in copy, comments, titles, test names.
- Commit-to-main -> Cloudflare Pages auto build+deploy (proves CMS-02 end to end once Sveltia commits).

### Integration Points
- `svelte.config.js` KNOWN_FUTURE_ROUTES allow-list: REMOVE `/o-nas` and `/dokumenty` when the routes land so the prerender crawler enforces them again.
- `svelte.config.js` CSP directives: extend for the Sveltia /admin app + OAuth Worker origin (comment anticipates this).
- Homepage `Recruitment` module docs panel: wire to the dokumenty collection (D-18).
- GitHub Org `zlobekstromiec`: hosts the OAuth App; Cloudflare account hosts the `sveltia-cms-auth` Worker (separate deploy from Pages).

</code_context>

<specifics>
## Specific Ideas

- **User insight that reshaped Dokumenty:** "the PDFs are going to be what's available in BIP anyway" - the taxonomy and seed content must mirror the real BIP set, not an idealized list.
- **BIP inventory (2026-08-13), parent-relevant set (~12 docs):**
  - Rekrutacja (all 02.04.2026): Zarządzenie 29.2026 z Regulaminem Rekrutacji (PDF); Wniosek o przyjęcie dziecka (DOC); Załączniki 1-6: oświadczenia o zamieszkaniu, zatrudnieniu, działalności gospodarczej, samotnym wychowywaniu, wielodzietności, rodzeństwie korzystającym ze żłobka (DOC/DOCX); Oświadczenie o rezygnacji (DOC).
  - Statut i uchwały: statut (uchwała XXIII.133.2026, PDF), opłaty za pobyt (uchwała XXIII.134.2026, PDF), utworzenie żłobka (uchwała XXI.125.2026, PDF) - none of these are linked from the BIP żłobek section (parents cannot find them there; our site fixes that).
  - Does NOT exist on BIP: żłobek-specific klauzula RODO, standalone regulamin organizacyjny, upoważnienie do odbioru dziecka.
  - Volatility: a draft amendment to the founding resolution was uploaded ~07.08.2026 - statut details may change; re-verify the doc set before launch.
- **Comparison lessons:** human-readable Polish titles (never raw filenames - Złota anti-lesson); host files ourselves (Białobrzegi anti-lesson); show wersja dates (both sites fail this).

</specifics>

<deferred>
## Deferred Ideas

- **Żłobek-specific klauzula informacyjna RODO must be AUTHORED** (confirmed absent from BIP) -> Phase 4 (forms klauzula); a downloadable document version can then join the Dokumenty "RODO" category.
- **PDF versions of the DOC/DOCX recruitment forms** (parent-friendlier on phones) -> client/launch decision, Phase 6 (LAUNCH-01).
- **Statut amendment pending on BIP** (draft uploaded ~07.08.2026) -> re-check the document set before launch (Phase 6).
- **Suggest to the Gmina** that the BIP żłobek section cross-link the statut/opłaty uchwały (outside our site's scope; courtesy note for the client).
- **"Ustawienia strony" site-facts singleton** (contact, keyFacts, recruitmentOpen flag CMS-editable) -> Phase 3/4 when those phases touch that data (user chose forced-only migration now).

</deferred>

---

*Phase: 2-about-documents-cms*
*Context gathered: 2026-08-13*
*Note: D-13, D-16, D-17, D-18 and all of Staff access & workflow (D-19..D-22) were DEFAULTED to the recommended options while the user was away - confirm before or during planning.*
