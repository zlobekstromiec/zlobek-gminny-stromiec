# Phase 5: Gallery & Fees - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Two new public, prerendered Polish pages: `/galeria` (a photo gallery of the żłobek) and `/cennik` (the fees page). Plus the content-shape work that makes both editable by a future admin panel, and the nav/footer wiring that makes them reachable.

Requirements in scope: GALLERY-01, GALLERY-02, FEES-01.

**NOT in this phase:** the custom admin panel itself (auth, write path, editing UI) is a separate phase, see Deferred Ideas. No Sveltia CMS configuration work of any kind. No `/dojazd` page.
</domain>

<decisions>
## Implementation Decisions

### Fees: source of truth

- **D-01: The shipped `OPLATY` values are canonical.** `1 500 zł miesięcznie` (after the trwałość-projektu obniżka) and `wyżywienie maksymalnie 20 zł za każdy dzień obecności` stay exactly as they render today on `/rekrutacja` and in the homepage `keyFacts`. No live page changes its displayed amount in this phase.
- **D-02: The `DESIGN-BANK.md` §Cennik fee block is STRUCK as stale draft copy.** Its `400 zł / miesięcznie`, `14 zł / za dzień` and `Wpisowe 0 zł` figures contradict the shipped values and must not be used. Its *non-numeric* material (the ZUS dofinansowanie explainer, the odpisy note) may still be drawn on as draft copy. Update DESIGN-BANK to mark the fee card figures struck so a later phase cannot resurrect them.
  - Useful consequence: striking the `Wpisowe 0 zł` card also dissolves a latent collision with the existing hard gate in `tests/rekrutacja.spec.ts:168` (`expect(tresc).not.toMatch(/(^|[^0-9])0(,00)?\s*zł/)`), which that card would have tripped.
- **D-03: Fee amounts move OUT of TypeScript and INTO a CMS-agnostic JSON singleton.** A new JSON file under `src/lib/content/` becomes the single store for the złoty figures. `OPLATY` in `src/lib/content/rekrutacja.ts` becomes a typed read of that JSON rather than a literal `as const`, so `/cennik`, the `/rekrutacja` FeeBox and the homepage `keyFacts` all derive from ONE store and cannot drift.
  - Rationale for JSON over TS: FEES-01 requires editability by a non-developer. A future admin panel can write JSON; it cannot safely write a TypeScript module.
  - `FeeBox.svelte` keeps its deliberate no-props design (its header comment states the intent: "the /cennik page of Phase 5 and this panel cannot end up quoting different amounts"). It simply imports from the new store.
- **D-04: `/cennik` gets a cennik-only content module for prose** (breakdown narrative, ZUS explainer, odpisy detail) that does NOT restate any amount. Every figure it displays comes from the D-03 store.

### Fees: page content

- **D-05: `/cennik` SHOWS the pre-subsidy breakdown, `2 337 zł → 1 500 zł`,** explaining that the trwałość-projektu obniżka produces the price parents actually pay. This was anticipated in code: `src/lib/content/rekrutacja.ts:115` says "The full 2 337 / obniżka / ZUS breakdown table belongs to the /cennik page in Phase 5, not here."
- **D-06: The ZUS „Aktywnie w żłobku" route to near-zero is PROMINENT, adjacent to the amount,** not buried lower on the page. Most parents qualify, so it is the practically relevant answer.
- **D-07: HARD RULE, carried from source doc §10.1 and 04-UI-SPEC §11 — a near-zero or zero figure may NEVER render without its condition in the same block.** Any `0 zł` or "całą tę opłatę" claim must sit in the same rendered panel as the ZUS qualifying condition. `/cennik` must extend, not weaken, the existing test gate.

### CMS and editability

- **D-08: Phase 5 adds NO Sveltia configuration.** `static/admin/config.yml` is not touched. No galeria collection, no cennik singleton, no widget work. Sveltia is being removed and any wiring added now is throwaway.
- **D-09: The durable deliverable is the CONTENT SHAPE, not the CMS.** Both `/galeria` and `/cennik` store their content as plain JSON under `src/lib/content/`, read at build time by a server reader following the established pattern. Any future editor (the planned custom panel) edits those JSON files. This is what "CMS-agnostic" means concretely here.
- **D-10: GALLERY-02 and FEES-01 will remain UNMARKED at phase completion.** Their visitor-facing halves are delivered (GALLERY-01, and a readable fees page); their "via the CMS" halves are deliberately deferred to the custom-panel phase. This is tracked debt in the same style as FORM-01/FORM-02, NOT a silent descope. Do not mark them complete. Do not amend the requirement text to make them passable.
- **D-11: The replacement is a CUSTOM ADMIN PANEL with Cloudflare OTP email-code access**, user-stated 2026-08-15. It supersedes the vaguer "some simpler CMS" in D-18 of `04-CONTEXT.md`. It lands as a NEW PHASE inside milestone v1, positioned between Phase 5 and Phase 6, so staff have a working editor at go-live and Sveltia is gone before the site is public.
  - **Open research question for that phase, flagged now:** a custom panel needs a write path that does not exist today. Content is git-committed JSON, written by Sveltia through the GitHub API via the `sveltia-cms-auth` Worker. A custom panel must either commit to git itself, or move content to a runtime store (KV/D1/R2). The second option would END the site's prerendered, zero-JS, no-database property, which is a foundational constraint. Phase 5's job is only to leave the door open by keeping content in plain JSON.

### Gallery presentation

- **D-12: Layout reuses the `/o-nas` "Nasze miejsce" visual language, widened for a dedicated page:** 1 column, 2 columns at 768px, **3 columns at 1024px**, `gap: 24px`, `border-radius: var(--radius-lg)` on images. Nine banked slots land as a clean 3x3 on desktop.
- **D-13: A hydrated LIGHTBOX island IS in scope.** Photos open larger on click. This is the site's fourth hydrated island (after `MobileNav`, `KontaktForm`, `ZgloszenieForm`) and the FIRST on a content route, so it must meet the same bar as `MobileNav`: bounded focus trap, Escape to close, `prefers-reduced-motion` respected, keyboard operable, and its own axe AA pass in both closed and open states. The page must remain fully readable and the grid fully viewable with JavaScript disabled.
- **D-14: Ship with PLACEHOLDER photos; real consented photos land at the Phase 6 gate.** Every placeholder entry carries the greppable `PLACEHOLDER` token. The site is `noindex` until Phase 6 and that phase's launch gate already sweeps placeholders.
- **D-15: Wizerunek consent rule (carried from DESIGN-BANK §Galeria and 02-UI-SPEC D-04):** any photo containing an identifiable child requires documented consent before publication. Prefer interiors and environment shots with no identifiable people. The nine banked slots are: Sala zabaw (maluchy), Sypialnia, Plac zabaw, Kącik plastyczny, Jadalnia, Szatnia, Zajęcia muzyczne, Budynek żłobka, Ogród.

### Navigation

- **D-16: Galeria AND Cennik are added to the MAIN NAV, taking it from five items to seven.** This requires a formal amendment to the locked Copywriting Contract in `01-UI-SPEC.md`. Rationale: cost is a top-three parent question and burying it in the footer hides it.
  - Flagged for the UI phase: seven inline desktop nav items is a genuine density change. `/gsd-ui-phase 5` should pin the desktop nav treatment before planning.
- **D-17: The orphaned `/dojazd` footer link is repointed to a `/kontakt` anchor** (e.g. `/kontakt#dojazd`), because Phase 4 built the map and directions into `/kontakt` and `/dojazd` has no owning phase. `/dojazd` then leaves `KNOWN_FUTURE_ROUTES` permanently. `tests/nav.spec.ts` updates in lockstep.
- **D-18: `svelte.config.js` `KNOWN_FUTURE_ROUTES` is emptied by this phase.** It currently holds exactly `['/cennik', '/galeria', '/dojazd']`; all three resolve or are repointed here. Follow the file's existing convention that removed paths are referenced in comments WITHOUT quotes, because each plan's acceptance gate greps for the quoted form.

### Claude's Discretion

- Fee-store shape resolution (user delegated): `OPLATY` remains the canonical exported symbol and single source; the JSON singleton is its backing store rather than a competing module. Chosen over inverting ownership to a cennik module because inversion touches two shipped, tested surfaces for no visitor-visible gain, and `tests/rekrutacja.spec.ts` already imports `OPLATY` to interpolate its assertions.
- Exact JSON schema for both stores, reader function signatures, and whether the repeated basename-resolution idiom is extracted into a shared helper (see Reusable Assets: it is duplicated verbatim in three files today).
- `/cennik` page structure (cards vs table vs prose sections) within the locked design system.
- Lightbox implementation details (markup, transition, whether it preloads) within the D-13 accessibility bar.
- Photo captions and alt-text authoring rules.
- Odpisy / nieobecność policy detail level.
- Whether the fee JSON singleton also absorbs the homepage `keyFacts` fee strings or those derive from `OPLATY`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contracts (LOCKED)
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — the design contract: two-tier palette tokens, type scale, the five-item nav Copywriting Contract that D-16 amends, and the Amendment v1.2 copy rules (no emoji, no em dashes)
- `.planning/phases/02-about-documents-cms/02-UI-SPEC.md` §107, §115 — the ONLY existing gallery layout contract: the `/o-nas` "Nasze miejsce" grid, 1-col to 2-col at md, radius-lg slots, gap 24, environment-only images with zero identifiable people (D-04), Polish informative alt
- `.planning/phases/04-enrollment-contact-email-pipeline/04-UI-SPEC.md` §11 — the compact fee box component contract (tint-yellow + 2px accent, radius-md, Baloo 700 20px value / Nunito 400 15px lines, and the never-an-unconditional-0-zł rule). §118 records ink-on-tint-yellow at 11.6:1
- There is NO Phase 5 UI-SPEC yet and no `/cennik` or `/galeria` page layout is specified anywhere. Run `/gsd-ui-phase 5` before planning.

### Content
- `.planning/DESIGN-BANK.md` §"Cennik (Phase 5)" — fee figures STRUCK per D-02; ZUS dofinansowanie and odpisy prose still usable as draft
- `.planning/DESIGN-BANK.md` §"Galeria (Phase 5)" — the nine slots and the wizerunek consent rule
- `.planning/dane-bip-zlobek-stromiec.md` §10.1 — the source rule that a fee amount and its ZUS condition must render together

### Cross-phase decisions
- `.planning/phases/04-enrollment-contact-email-pipeline/04-CONTEXT.md` D-18 — the original CMS-agnostic direction, superseded and made specific by D-11 above
- `.planning/STATE.md` Blockers/Concerns — carries the Phase 3 UAT prettier-vs-CMS-indent policy item, which is still undecided and becomes moot for content the custom panel writes
- `.planning/REQUIREMENTS.md` — GALLERY-01 (line 56), GALLERY-02 (57), FEES-01 (61)

### Code the phase must not break
- `src/lib/content/rekrutacja.ts` — `OPLATY`, plus the line-115 comment reserving the 2 337 breakdown for `/cennik`
- `src/lib/components/FeeBox.svelte` — header comment documenting the deliberate no-props single-source design
- `src/lib/content/site.ts` `keyFacts` (lines 86-92) — the third surface carrying `1 500 zł`
- `tests/rekrutacja.spec.ts:168-184` — the unconditional-`0 zł` gate and the ZUS-adjacency assertion
- `tests/nav.spec.ts:75-76` — asserts the footer Cennik/Galeria/Dojazd links
- `svelte.config.js` — `KNOWN_FUTURE_ROUTES` and the `img-src: ['self','data:']` CSP (no remote image hosts)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/routes/o-nas/+page.svelte` §6 "Nasze miejsce" — the closest prior art for a photo grid: `<ul class="gallery">`, 1fr to `repeat(2, 1fr)` at 768, gap 24, radius-lg on `:global(img)`, `sizes="(min-width:768px) 50vw, 100vw"`, entries missing from the glob filtered out. D-12 widens this to 3 columns.
- `src/lib/server/aktualnosci.ts` — the MATURED reader pattern and the single-validation-boundary precedent. Copy it: `entry` typed `unknown` (not the interface), container guarded before any property access, every field through `readString`, result built key-by-key and NEVER by spreading the raw entry, malformed entry logs `console.warn` and returns `null` so one bad JSON can never abort the whole-site prerender. Required fields reject the entry; optional fields degrade to `undefined`.
- `src/lib/server/dokumenty.ts` — the earlier reader; also shows the path-safety approach (reject anything not under the expected prefix or containing `..`).
- `src/lib/components/FeeBox.svelte` — reused as-is on `/rekrutacja`; `/cennik` renders a richer view over the same store.
- `src/lib/components/MobileNav.svelte` — the correctness precedent for the D-13 lightbox island: bounded focus trap, reduced-motion handling.
- `Seo`, `Cta`, `Wave`, `SkipLink`, `Header`, `Footer` — direct reuse on both new pages.
- `tests/dokumenty.spec.ts` (cleanest template) and `tests/rekrutacja.spec.ts` (richest) — the page-spec pattern.

### Established Patterns

- **Prerendered zero-JS content routes.** `prerender = true` is set once in `src/routes/+layout.ts` and inherited. Hydrated islands are the exception and must justify themselves; the lightbox becomes the fourth.
- **Content flow:** JSON under `src/lib/content/<collection>/` to a server reader using `import.meta.glob(..., { eager: true, import: 'default' })` to a `+page.server.ts` `load`.
- **Image pipeline:** `enhancedImages()` runs BEFORE `sveltekit()` in `vite.config.ts`; `@sveltejs/enhanced-img` pinned exact at `0.11.0`. Uploads live in `src/lib/assets/uploads/` (Vite-processed); documents live in `static/dokumenty/` (never processed). Input glob accepts `jpg, jpeg, png, webp` (NOT avif); enhanced-img emits AVIF/WebP.
- **The basename-resolution idiom is duplicated VERBATIM in three files** (`NewsCard.svelte:34-44`, `o-nas/+page.svelte:24-36`, `aktualnosci/[slug]/+page.svelte:28-40`). A fourth copy is imminent. NOTE: the basename lookup IS the path-traversal defence (T-03-03) — an unknown basename yields the tint fallback, never a filesystem read of an arbitrary path. Any extraction must preserve that property.
- **`?enhanced` vs literal-src (04-02):** the `?enhanced` import form emits 1x/2x DENSITY descriptors, and browsers ignore `sizes` when densities are present. For fixed assets needing `sizes` control, use the literal-src form with explicit widths (`src="...png?w=1024;768;640;512"`) and OMIT `?enhanced` — appending a query to `?enhanced` breaks type resolution and fails `npm run check`. See `MapPanel.svelte:45`.
- **Tests interpolate from content modules, never retype values** ("so a future data sweep cannot leave the page and this test agreeing on a wrong value"). Test titles are written in Polish. Axe block is inlined per spec, not shared.
- **No spacing or type-scale tokens exist** in `src/app.css` `@theme` — only colors, fonts, radii. Components hand-write scoped CSS with literal px. De-facto conventions: gap 24px for grids, card padding 16 to 24 at 1024, band padding-block 48 to 64 at 1024, `.inner { max-width: 72rem }`, breakpoints 768 / 1024.

### Integration Points

- `src/lib/nav.ts` `navLinks` — D-16 extends from five to seven; consumed by both `Header.svelte` and `MobileNav.svelte`.
- `src/lib/components/Footer.svelte:42-44` — "Na skróty" column; `/dojazd` repointed per D-17.
- `svelte.config.js` `KNOWN_FUTURE_ROUTES` — emptied per D-18.
- `src/lib/content/rekrutacja.ts` `OPLATY` — becomes a read of the new JSON store per D-03.
- `src/lib/content/site.ts` `keyFacts` — third fee surface; must not drift.
- `tests/responsive.spec.ts` — currently homepage-only; a gallery grid is exactly the layout that warrants extending its `VIEWPORTS` iteration to `/galeria`.

</code_context>

<specifics>
## Specific Ideas

- The `2 337 zł → 1 500 zł` framing is wanted explicitly: parents should understand WHY the price is what it is, not just what it is.
- The ZUS route to near-zero should read as the practical headline answer for most families, sitting next to the amount rather than as a footnote.
- Gallery photos should feel like the `/o-nas` "Nasze miejsce" section, just more of them, rather than a different visual idiom.
- The future editor is specifically a custom admin panel with Cloudflare OTP email-code access, not another off-the-shelf git CMS.

</specifics>

<deferred>
## Deferred Ideas

- **Custom admin panel (Cloudflare OTP email-code access)** — NEW PHASE, milestone v1, positioned between Phase 5 and Phase 6 per D-11. Replaces Sveltia and the GitHub-org editing path before go-live. Carries the open write-path research question recorded in D-11. **Action required: insert via `/gsd-phase` — this discussion cannot amend ROADMAP.md.**
- **`/dojazd` as a standalone page** — dead. Directions live on `/kontakt`; D-17 repoints the link.
- **Real consented photo set** — Phase 6 launch gate, alongside the existing placeholder sweep.
- **EU funding marking (dofinansowanie)** — KPO/FERS/NextGenerationEU logo strip and klauzula, still `[BRAK]`; carried from `04-CONTEXT.md`, lands with Phase 6.
- **AG-3 test-gate gap** — `tests/*.unit.ts` runs in no automated gate (`npm run test` is Playwright-only, pre-commit is check+lint, no CI). Raised in `03-REVIEW.md:99-105` and again in `04-REVIEW.md`. Not Phase 5 scope, but any new unit test this phase adds inherits the same blind spot.
- **Phase 3 UAT prettier-vs-CMS-indent policy** — undecided; becomes moot for content written by the custom panel, which can be made to emit tab-indented JSON.

</deferred>

---

*Phase: 5-Gallery & Fees*
*Context gathered: 2026-08-15*
