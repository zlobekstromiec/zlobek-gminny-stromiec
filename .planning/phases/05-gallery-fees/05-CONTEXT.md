# Phase 5: Gallery & Fees - Context

**Gathered:** 2026-08-15
**Refreshed:** 2026-08-17 (this file supersedes the 2026-08-15 version in full)
**Status:** Ready for planning

> **Why this file was rewritten.** The 2026-08-15 version was gathered while Sveltia was still the CMS and the replacement panel did not exist. `.planning/STATE.md:56` carried a standing instruction to refresh it once Phase 04.1 landed. Every decision below was re-checked against the live repository on 2026-08-17 by eleven verification agents; three claims the old file made about the code were wrong and are corrected here. The alternatives considered are in `05-DISCUSSION-LOG.md`, which is an audit trail and is NOT authoritative.

<domain>
## Phase Boundary

One new public prerendered Polish page, `/cennik`, plus a photo gallery delivered as a section of the EXISTING `/o-nas` page, plus three new editor screens in the panel built in Phase 04.1 (`/admin/galeria`, `/admin/cennik`, and a fixed-arity „W skrócie" screen for the homepage fact tiles), plus the navigation and footer rewiring that makes all of it reachable.

Requirements in scope: GALLERY-01, GALLERY-02, FEES-01.

**NOT in this phase:** a `/galeria` route (dissolved, see D-19), a `/dojazd` page (dead since D-17), contact-detail editing (`site.ts` `contact`, still deferred from 04.1 D-16), and the ticking of CMS-01, CMS-02 or CMS-03, which belongs to the Phase 04.1 UAT and not to this phase (see the Sequencing constraints below).

**Requirements this phase CAN close.** The 2026-08-15 version deferred GALLERY-02 and FEES-01 on the grounds that no editor existed. One does. Both are deliverable and markable in this phase, on their own evidence.

</domain>

<sequencing>
## Sequencing constraints (read before planning)

Phase 5 formally depends on Phase 04.1 (`ROADMAP.md`), and that dependency is **not yet met**. The authoritative ledger is `.planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-UAT.md`, NOT `STATE.md`, which is stale on this point.

- **UAT status as of 2026-08-17: 7 of 27 rows passed** (A0, A1, A2, B1, C1, D3, F5), 19 outstanding, 1 deferred. Proven live: panel login, the human half of the Polish-copy check, and the nabór save loop. NOT proven live: the save path for any other content type, and the authenticated render of any editing screen (row A3 is `CZĘŚCIOWE`).
- **`STATE.md:40` is wrong.** It says the deployment predates plans 05 to 10 so the editing screens are not live. They are: the screens exist on the deployed site today. A plan must not schedule a redundant „push first" step, and must assume any panel work ships onto a live, staff-reachable panel.
- **Row B2 is deferred and it is this phase's problem.** B2 is the phone-photo upload, and it is the only test of the image ingestion path (`src/lib/server/admin/obraz.ts`, `uploads.ts`) against a real phone photo on the live Worker. **The HEIC assumption is explicitly unconfirmed.** Phase 5's gallery is a photo-upload feature. A plan must either sequence B2 before its upload work or carry HEIC as a live risk it retires itself.
- **Row B4 is outstanding and is this phase's shape.** B4 is the stale-save conflict panel, never exercised live. The gallery's chosen UX (one long list, one Zapisz, up to twelve photos) is precisely the shape that maximises stale-save collisions. Reuse the existing head-SHA refusal (04.1 D-10); do not invent a second mechanism.
- **Do not schedule a live login-timing measurement (E2) on the same UTC day as live panel testing.** The code limiter is 5 per hour and 20 per day per address, so E2 locks the editor out for the rest of that day.
- **The orphaned `sveltia-cms-auth` Worker is still live** (`/auth` and `/callback` both answer 200). Teardown rows F1 to F4 do not block Phase 5, but F1 executed against the wrong object destroys the panel's write identity. Do not run teardown concurrently with live save testing.
- **Every save is a Cloudflare Pages build**, roughly two minutes to publish, against a free ceiling of 500 builds per month. This bounds UAT design, not just editor behaviour.

</sequencing>

<decisions>
## Implementation Decisions

Numbering continues from the 2026-08-15 version so that external references stay valid (`04.1-CONTEXT.md` cites 05 D-03, D-09 and D-11). Decisions D-01 to D-18 are restated here with their current status; D-19 onward are new on 2026-08-17.

### Superseded and reversed (2026-08-15 decisions that are no longer true)

- **D-08 is SUPERSEDED.** „Phase 5 adds NO Sveltia configuration" is moot: Sveltia was removed in plan 04.1-01, including `static/admin/`, the auth Worker source and the `@sveltia/cms` dependency.
- **D-09 is AMENDED.** Content in plain JSON under `src/lib/content/` remains correct and is now enforced by the panel's own write path. What is no longer true is the framing that the content shape is the durable deliverable *instead of* an editor. The editor exists; this phase builds screens on it.
- **D-10 is REVERSED.** It said GALLERY-02 and FEES-01 would remain UNMARKED because their „via the CMS" halves were deferred. Both halves ship in this phase. Neither requirement names a URL, so a gallery section on `/o-nas` satisfies GALLERY-01 and GALLERY-02; the plan should state that explicitly rather than leave a reviewer to infer it.
- **D-11 is CLOSED.** Its open research question („a custom panel needs a write path that does not exist today") was answered by 04.1 D-06 to D-08: the panel commits to this repository as a GitHub App using the Git Data API, one atomic commit per save. Phase 5 must not re-derive a write path.

### Fees: source of truth

- **D-01 STANDS. The shipped `OPLATY` values are canonical.** `kwota` is exactly `'1 500 zł miesięcznie'` (ASCII space, verified at byte level) and `wyzywienie` is `'Wyżywienie: maksymalnie 20 zł za każdy dzień obecności dziecka.'` No live page changes its displayed amount in this phase.
- **D-02 STANDS, WIDENED, and its mitigation was NEVER EXECUTED.** The `DESIGN-BANK.md` §Cennik fee block (`400 zł / miesięcznie`, `14 zł / za dzień`, `Wpisowe 0 zł`) is struck as stale draft copy. Three corrections to the 2026-08-15 text:
  1. **The strike was never applied.** `grep -n "STRUCK\|struck\|skreśl" .planning/DESIGN-BANK.md` returns nothing. The trap D-02 predicted is still armed. Applying the marker is an explicit, verifiable plan step.
  2. **The carve-out is refuted.** D-02 blessed the „non-numeric material (the ZUS dofinansowanie explainer)" as reusable. `DESIGN-BANK.md:32` carries `do 400 zł miesięcznie` inside that very explainer. It is not non-numeric. Copying it forward republishes a wrong figure and understates the benefit.
  3. **The same stale figures sit in a higher-authority document.** `01-UI-SPEC.md:457` (Amendment v1.2 §6, KeyFacts v2) and `:471` (§9, Facts register) both embed `400 zł` and `14 zł/dzień` and were never struck. Striking only DESIGN-BANK leaves the contradiction alive where an agent is told the file is LOCKED and must be followed. The amendment this phase writes must supersede both lines.
- **D-03 STANDS and is strengthened.** Fee amounts move out of TypeScript into a CMS-agnostic JSON store under `src/lib/content/`. `OPLATY` remains the canonical exported symbol and becomes a typed read of that store. Two corrections:
  - **`rekrutacja.ts` already imports `site.ts`** (`import { urzad } from '$lib/content/site'`, line 23). Routing the homepage tile through `OPLATY` would therefore create a cycle. The homepage tile must read the store (or a shared composer) **directly, never `OPLATY`**. This closes the open question the 2026-08-15 file left at its line 65.
  - **`OPLATY` is prose, not atoms.** `kwota` is `'1 500 zł miesięcznie'` while the homepage tile needs `'1 500 zł'`. The store must hold the atoms (statutory amount, reduction, the wyżywienie cap, the ZUS condition clause) with both `OPLATY` and the tile composed from them, or the tile copy silently changes.
- **D-04 STANDS.** `/cennik` gets a cennik-only content module for prose that restates no amount.

### Fees: page content

- **D-05 STANDS, now with stored numbers.** `/cennik` shows the pre-subsidy breakdown `2 337 zł → 1 500 zł`.
- **D-06 STANDS.** The ZUS „Aktywnie w żłobku" route to near zero is prominent and adjacent to the amount.
- **D-07 STANDS, with two citation corrections and one gate correction.**
  - The rule lives at `.planning/dane-bip-zlobek-stromiec.md:204`, under the heading `## 10. Czego NIE publikować bez potwierdzenia`, item 1. **There is no literal string „10.1" in that file**; „§10.1" is a project citation convention and an agent grepping for it finds nothing.
  - The rule as written forbids `„0 zł" bez warunku przyznania`. It is a conditional-zero rule, not a no-zero rule.
  - **The existing gate does something different from what the old file claimed.** `tests/rekrutacja.spec.ts:183` is `expect(tresc).not.toMatch(/(^|[^0-9])0(,00)?\s*zł/)` scoped to `.fee-box` on `/rekrutacja`: it forbids ANY `0 zł` in that element, conditional or not. Line 178 asserts only that the substring `ZUS` occurs somewhere in the same element; it is co-presence, not adjacency. The genuine conditional-zero rule exists only at `tests/home.spec.ts:114-118`.
- **D-27: `/cennik` is editable in six fields and the ZUS sentence is REQUIRED.** All of `naglowek`, `kwotaOpis`, `zus`, `wyzywienie`, `nieobecnosc` plus the amounts are editable, but a save with an empty `zus` is refused with a Polish message explaining why. This turns D-07 from an editorial rule into a property of the structure: the amount and its condition are one content block and cannot be separated. Rationale: after handover nobody will call a developer when ZUS renames the benefit.
- **D-28: the breakdown is stored as TWO numbers and the third is COMPUTED.** The store holds the statutory rate (2337) and the reduction (837); the payable amount is subtracted and formatted in code, so the page cannot contradict its own arithmetic. Two constraints the planner must honour:
  - **A cross-field invariant `0 <= reduction < statutory` must be hand-written.** The repository's only numeric validator, `liczbaWZakresie` in `src/lib/server/admin/walidacja/pola.ts:101-115`, accepts `/^[0-9]{1,4}$/` with an independent per-field min and max. It cannot express a relationship between two fields. Without the invariant an editor can produce a negative payable amount, and the `0 zł` regex does not match `-837 zł`.
  - **The store holds whole złoty.** Four digits maximum, no grosze, no separators. The uchwała quotes `2 337,00 zł`; the plan must state that the store drops the grosze rather than widening the validator.
- **D-29: a reduction of zero hides the whole breakdown block.** Rendering „obniżka 0 zł" would be exactly the unconditioned zero figure that D-07 forbids. The page then shows the statutory amount alone.
- **D-30: `/cennik` states HOW and WHEN to pay, marked `PLACEHOLDER`.** No source in the repository carries the payment method, the deadline or the consequence of late payment. Marking them puts them on the client question list instead of surfacing after launch, and the Phase 6 placeholder sweep already hunts the token.
- **D-31: `/cennik` renders a worked example, in ONE block with its condition.** Fee 1 500 zł, benefit up to 1 500 zł, payable 0 zł if ZUS grants it. This is the form `dane-bip §10 item 1` permits. **It also collides with the existing gate**, which forbids any `0 zł` inside `.fee-box`. The plan must therefore specify a scoped rewrite rather than reuse: locate the block containing the ZUS condition, assert the zero occurs only inside it, and assert the no-zero regex still holds for the page text with that block removed.
- **D-35: the amount formatter is written by this phase and must NOT be plain `Intl`.** Verified in this repository on Node 25: `new Intl.NumberFormat('pl-PL').format(1500)` returns `"1500"` with no separator, because CLDR pl sets `minimumGroupingDigits=2` and both fee figures sit in the four-digit band where grouping is suppressed. A naive `Intl` call silently changes the shipped `'1 500 zł'` to `'1500 zł'` and breaks `tests/home.spec.ts:112`. Pin `useGrouping: 'always'` or hand-roll the grouping, and decide NBSP versus ASCII space explicitly (the shipped bytes are an ASCII space). `src/lib/liczebniki.ts:12-16` records the standing decision that shared number helpers live in `$lib`, never `$lib/server`, because the panel runs in the Worker, and that `Intl` is deliberately avoided there.

### Gallery: where it lives

- **D-19: the gallery is a SECTION OF `/o-nas`, and `/galeria` is never built.** User decision, 2026-08-17, reversing the same session's earlier answer. Stated reason: `/o-nas` is the emptiest page on the site and the one that has to sell the żłobek to a parent. Consequences:
  - The footer link is repointed to `/o-nas#galeria`, exactly as D-17 repoints `/dojazd` to `/kontakt#dojazd`.
  - `'/galeria'` leaves `KNOWN_FUTURE_ROUTES` permanently.
  - **The `#galeria` fragment does not exist today** and must be added deliberately; `/o-nas/+page.svelte:119` labels the section by `obiekt-heading`, so the anchor id and the `aria-labelledby` target are two different attributes and the plan must say which carries which.
  - Supporting argument accepted during the discussion: event photos already belong in Aktualności, which carries cover images, so the room and building set stays small and stable.
- **D-20: the gallery section REPLACES „Nasze miejsce"; `obiekt_opis` stays as introductory prose above the grid.** Two photo sets on one page would reintroduce exactly the duplication that dissolving `/galeria` removed. Delegated by the user and resolved on that reasoning; confirm in `/gsd-ui-phase 5`.
  - **This requires a formal amendment to a LOCKED contract before the change, not after.** `02-UI-SPEC.md:107` names „Nasze miejsce" as the page's primary visual anchor, `:109-115` lock the seven-section order, `:212` pins the facility grid and `:272` the alt rules. `tests/o-nas.spec.ts:44-51` asserts a visible heading named exactly `Nasze miejsce` and `:74-83` locates images through `section[aria-labelledby="obiekt-heading"]`.
- **D-26: gallery photos live in their OWN content file; `obiekt_zdjecia` leaves `o-nas.json`.** The two existing seed images stay on disk and are NOT deleted, for two independent reasons:
  - `sala-zabaw.jpg` is also the cover of the seeded aktualność `2026-08-01-wielkie-otwarcie-zlobka.json`. Deleting it degrades that post's cover to the tint fallback.
  - Neither file is panel-owned. **There is no `obiekt-` prefixed file in the repository**; `sala-zabaw.jpg` and `plac-zabaw.jpg` were hand-placed, and `zdjecieONasDoUsuniecia` (`uploads.ts:222-237`) refuses by construction to delete a name it did not generate.
  - Removing the key is a breaking change, not a soft one: `/o-nas/+page.svelte:38-40` reads `onas.obiekt_zdjecia` with no guard, so its absence is a type error under `npm run check` and an `undefined.map` at prerender. Reader and file change in one commit.

### Gallery: editor and presentation

- **D-21: one editor screen, `/admin/galeria`, holding the whole list, with one „Zapisz".** The `/admin/o-nas` pattern: `PowtarzalnaGrupa` rows, add and remove as named form actions that work with JavaScript disabled and persist nothing until the save. Twelve photos in one sitting is one commit and one build. Rejected: a screen per photo, which would be twelve commits and twelve builds against a ceiling of 500 per month. Rejected: folding the gallery into `/admin/o-nas`, whose form already carries lead, misja, four wartości, kadra and the facility text.
- **D-22: photo order is controlled by move-up and move-down buttons**, built as named form actions like the rest of the list, so they are keyboard operable and work without JavaScript. Rejected: drag to reorder (its own accessibility bar, and no no-JS path). **`PowtarzalnaGrupa.svelte` has no such actions today** and is mounted by four existing screens, so this is shared-component work with a regression surface.
- **D-23: a HARD limit of twelve photos.** At the limit the add control disappears and a Polish message says to remove an older photo. Twelve is a 3x3 grid plus one spare row. This is a NEW editorial bound and is not `MAKS_ELEMENTOW = 30` in `src/lib/pola-strony.ts:87-96`, which is a work-bound on every repeated group and stays where it is.
- **D-24: 4:3 tiles, automatic centred crop, no cropper.** `PROPORCJA_O_NAS` (4/3) already exists and `ZdjecieIsland` takes the ratio as a prop precisely so a later plan mounts the same component. Most phone photos are natively 4:3, so the automatic crop removes nothing. This answers, in the negative, the condition 04.1 attached to its deferred drag-to-position cropper („candidate for Phase 5 if the gallery makes framing matter more").
- **D-25: two fields per photo, a visible caption and a REQUIRED alt.** The caption names the room („Sala zabaw"); the alt describes what is in the photo. Keeps 04.1 D-15 intact, since alt stays a description rather than a label, and gives the lightbox something to say.
- **D-12 AMENDED: the grid is 1 column, 2 at 768px, 3 at 1024px, gap 24, `--radius-lg` on images.** Correction to the 2026-08-15 text: **the three-column tier is NEW, not inherited.** `02-UI-SPEC.md:115` stops at two columns and has no >=1024px tier. `/gsd-ui-phase 5` must specify it, and must account for `.uklad-miejsce` being a two-track editorial grid at >=1024px whose left rail holds the h2 (`/o-nas/+page.svelte:210-217`).
- **D-13 AMENDED: the lightbox lands on `/o-nas`.** It remains the site's fourth hydrated island and the first on a content route, and it must meet the `MobileNav` bar: bounded focus trap, Escape to close, `prefers-reduced-motion`, keyboard operable, its own axe AA pass closed and open. New consequence: `/o-nas/+page.svelte:2-5` declares the page „Prerendered, zero-JS", so that header comment states a guarantee the phase breaks and must be rewritten rather than silently invalidated. The CSP needs no change for a same-origin island.
- **D-14 STANDS.** Ship with placeholder photos carrying the greppable `PLACEHOLDER` token; real consented photos land at the Phase 6 gate.
- **D-15 AMENDED, and the two consent rules DISAGREE.** `DESIGN-BANK.md:37` permits an identifiable child with documented consent and merely prefers childless interiors. `02-UI-SPEC.md:115` D-04 is harder: „environment-only images, **zero identifiable people**, placeholder-flagged". **The UI-SPEC is the locked contract for the surface the gallery now renders on, so it governs**, and the plan must either follow it or amend it in the open. The nine banked slots stay usable as a shot list: Sala zabaw (maluchy), Sypialnia, Plac zabaw, Kącik plastyczny, Jadalnia, Szatnia, Zajęcia muzyczne, Budynek żłobka, Ogród.

### Homepage fact tiles and settings

- **D-32: `keyFacts` moves from TypeScript into JSON and gains a „W skrócie" panel screen.** User decision, 2026-08-17, taken with the cost stated: this is the „Ustawienia strony" work that 04.1 D-16 deferred with the words „revisit after Phase 5", so record it as the reversal of that deferral rather than as new scope. The driving fact is that the opening hours are a live `PLACEHOLDER` the żłobek cannot fix without a developer. Four hard constraints travel with it:
  - **The screen is FIXED ARITY: exactly four tiles, fields only, no add and no remove.** `01-UI-SPEC.md:521` (Amendment v1.6 §3, KeyFacts v3) locks the `ul/li` semantics, the aria-label, four `.fact-label` nodes and the fact strings, and the component hard-codes `repeat(4, 1fr)` at >=1024px. A repeatable-group screen would break the locked contract, the desktop grid and the acceptance count in one move.
  - **The icon and tint unions do NOT survive a JSON round trip.** `KeyFacts.svelte:13,21` does `icons[fact.icon]` with no fallback, and TypeScript widens a JSON module member to `string`, so `npm run check` fails the moment the array is imported from JSON, which blocks every commit through pre-commit. A narrowing reader with closed allowlists is required, in `src/lib/` rather than `src/lib/server/` because a client component imports it. The save-time validator follows `walidacja/nabor.ts:36-42`: closed allowlist, absent field is a refusal rather than a default.
  - **A bad icon fails the BUILD, not the tile.** The homepage is prerendered, and an icon outside the four keys yields `undefined` where a component is called. The reader needs a runtime fallback (drop the fact or substitute a default) so one editor typo cannot take the site down.
  - **Re-key the each block by index.** `{#each keyFacts as fact (fact.label)}` is keyed by a value the editor can now type, and a duplicated key is an exception thrown in production. The repository has already fixed this exact class of bug twice, at `/o-nas/+page.svelte:77-81` and `DayPlan.svelte:30-34`; follow those verbatim.
- **D-33: the settings screen covers the four tiles ONLY.** Contact details stay out. Two drift hazards the plan must resolve explicitly rather than discover:
  - **The opening hours live on four surfaces with three sources**: the tile (`site.ts:95`), `contact.hours` (`site.ts:56`, rendered by `TopBar`, `ContactAndMap` and `/kontakt`), and a hard-coded literal in `Footer.svelte:78-80`. Making only the tile editable lets an editor change the hours in the homepage strip while the footer of that same page keeps the old value. Either exclude the hours from the editable set or unify the three sources.
  - **The age range appears twice on the homepage**: the tile (`site.ts:89`) and `recruitment.infoCard` (`site.ts:198`, rendered by `Recruitment.svelte:36`). Same class, same choice.
  - **The fee tile is COMPUTED and locked in the editor**, with a hint pointing at Cennik. Its suffix carries the conditional zero, and an editor shortening it would publish a bare `0 zł`. There is no executable gate on the homepage zero today beyond `tests/home.spec.ts:114-118`, so the plan must add a save-time validator rule that the zero figure may occur only inside the same string as the ZUS condition.
  - **The `PLACEHOLDER` markers on the hours and the fee are LINE COMMENTS** (`site.ts:94`, `:96-99`), and the hard rule guarding the zero is one of them. Migrating the data as-is silently deletes two launch-gate markers. Either keep a per-fact placeholder flag in the JSON (a shape the existing per-file boolean does not provide) or re-home the comments in the reader module.

### Navigation

- **D-16 AMENDED: the public navigation goes from five items to SIX, not seven.** Only Cennik is added, positioned **after Rekrutacja** (Aktualności, O nas, Rekrutacja, Cennik, Dokumenty, Kontakt), because cost is part of the enrolment decision. Galeria is no longer a nav destination under D-19. The amendment must touch **two** lines of `01-UI-SPEC.md`, not one: the Copywriting Contract nav row at `:261` and the Header contract at `:169`, whose literal „(5, Polish)" plus 24px gap and 44px target geometry is the density constraint a sixth item stresses.
  - The project's amendment procedure is to APPEND to the locked file a section headed `## Amendment vX.Y (date): <title>` followed by a blockquote naming what is superseded and what is unchanged. The next number is v1.7.
  - `tests/nav.spec.ts:22` iterates `navLinks`, so it asserts every href but NOT the count; the five-item lock exists only in prose. The footer test at `:71-81` does encode exact hrefs and will go red.
- **D-34: the panel navigation goes from seven items to NINE** (Galeria and Cennik), and the „W skrócie" screen is reached from a pulpit tile instead. Rationale: the nav holds what an editor does often, and hours and place counts change once every few years. Ten wrapped chips would put roughly four rows of navigation above every screen on a phone, in a panel meant for uploading photos from a phone.
- **D-17 STANDS and WIDENS.** `/dojazd` is repointed to `/kontakt#dojazd`; `/galeria` is repointed to `/o-nas#galeria` on the same reasoning and in the same amendment. `01-UI-SPEC.md:462` enumerates the footer „Na skróty" column by LABEL, not href, so the repoint is compatible with it.
- **D-18 AMENDED: `KNOWN_FUTURE_ROUTES` is emptied, but its stated comment convention is a FICTION.** The array holds exactly `'/cennik'`, `'/galeria'`, `'/dojazd'` at `svelte.config.js:24-26`, and all three resolve or are repointed here. The old file instructed the executor to follow „the file's existing convention that removed paths are referenced in comments WITHOUT quotes, because each plan's acceptance gate greps for the quoted form". **The file does not keep that convention.** It holds for `/kontakt` (line 14) and `/rekrutacja` (line 16) only; `'/aktualnosci'`, `'/aktualnosci/[slug]'`, `'/dokumenty'`, `'/deklaracja-dostepnosci'` and `'/polityka-prywatnosci'` are all named in comments WITH quotes. A grep for the quoted form is therefore not a reliable removal gate, and any plan writing such an acceptance criterion will get a permanent false positive.

### Requirements and marking

- **D-36: this phase does NOT tick CMS-01, CMS-02 or CMS-03.** They are unticked and retargeted to Phase 04.1, and only the 04.1 UAT closes them. Phase 5 proceeds against a formally open dependency; that is a deliberate, user-visible choice and the plan must say so rather than imply the dependency is met.
- **GALLERY-01, GALLERY-02 and FEES-01 are all closable by this phase**, each on its own evidence: a visitor viewing the gallery section, an editor adding and removing a photo through `/admin/galeria`, and an editor changing a fee through `/admin/cennik` with the change appearing after a rebuild.

### Claude's Discretion

- Exact JSON schema of the three new stores, reader signatures, and whether the basename-resolution idiom (still duplicated verbatim in three files) is finally extracted.
- Where the amount formatter lives and its unit test, inside the `$lib` constraint recorded in D-35.
- `/cennik` page structure (cards, table or prose sections) inside the locked design system.
- Lightbox markup, transition and preloading, inside the D-13 accessibility bar.
- Whether gallery photos reuse the `obiekt-` ownership prefix (zero migration, but the module name and its comments then misdescribe which page owns them) or take a new prefix (honest naming, but every photo an editor has already uploaded keeps the old one).
- Odpisy and nieobecność policy detail level.
- Whether the panel writes a per-fact placeholder flag or the reader carries the launch-gate comments.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.** Every line number below was re-derived from the working tree on 2026-08-17. **The 2026-08-15 version of this file cited four line ranges that were wrong** (`site.ts` keyFacts „lines 86-92" is the age tile, not the fee tile; „the line-115 comment" is at 116-117; `tests/rekrutacja.spec.ts:168` is a test title, not the regex). Prefer symbol names over line numbers when quoting these into a plan.

### Phase definition and requirements
- `.planning/ROADMAP.md` §"Phase 5: Gallery & Fees" — goal, the three success criteria, and the declared dependency on Phase 04.1
- `.planning/REQUIREMENTS.md:56-57, 61` — GALLERY-01, GALLERY-02, FEES-01; traceability rows at `:142-144`
- `.planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-UAT.md` — **the authoritative status ledger for the dependency.** Summary block at `:170-180`; row B2 (phone photo, deferred) at `:97`; row B4 (stale-save conflict) at `:99`; teardown block F at `:162-165`
- `.planning/phases/05-gallery-fees/05-DISCUSSION-LOG.md` — audit trail of this session. **Not authoritative and must not be used as planning input.**

### Design contracts (LOCKED, amendment required)
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — `:169` Header contract "(5, Polish)" and the nav geometry; `:255-261` Copywriting Contract nav row; `:462` Footer v2 "Na skróty" column (labels, not hrefs); `:457` and `:471` carry the STALE 400/14 fee figures that D-02 must supersede; `:521` Amendment v1.6 §3 KeyFacts v3, which forces D-32's fixed arity. Amendment procedure and numbering precedent at `:344-349`, `:419-425`, `:475-480`, `:496-511`
- `.planning/phases/02-about-documents-cms/02-UI-SPEC.md:107, 109-115, 212, 272` — the LOCKED `/o-nas` contract that D-19 and D-20 rewrite: "Nasze miejsce" as primary visual anchor, the seven-section order, the 1-col to 2-col grid with NO >=1024px tier, and the D-04 rule of environment-only images with **zero identifiable people**
- `.planning/phases/04-enrollment-contact-email-pipeline/04-UI-SPEC.md:262-266` §Component Contract 11 — the compact fee box, already implemented and reusable without re-derivation
- `.planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-UI-SPEC.md:48-64` — the panel route table, which has no `/admin/galeria`, `/admin/cennik` or settings row and whose `island: photos` marker sits on the `/admin/o-nas` line
- There is NO Phase 5 UI-SPEC. **Run `/gsd-ui-phase 5` before planning**: the three-column tier, the gallery section's heading and anchor, the caption treatment, the lightbox and the panel screens are all unspecified.

### Content sources
- `.planning/dane-bip-zlobek-stromiec.md:202-204` §"10. Czego NIE publikować bez potwierdzenia", item 1 — the conditional-zero rule. Cite it as "§10, item 1"; the string "10.1" does not occur in the file
- `.planning/DESIGN-BANK.md:31-32` §Cennik — figures struck per D-02, **including the 400 zł inside the ZUS explainer**; `:35-37` §Galeria — the nine slots and the weaker wizerunek rule that 02-UI-SPEC D-04 overrides

### Cross-phase decisions
- `.planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-CONTEXT.md` — D-06 to D-08 (the write path, closing 05 D-11), D-10 (SHA conflict refusal), D-11 (one Zapisz per page, and the 500-builds ceiling behind it), D-12 to D-15 (browser-side resize, centred crop, generated filenames, required alt), D-16 and `:173` (the "Ustawienia strony" deferral that D-32 reverses)
- `.planning/STATE.md` — `:56` the refresh instruction this file answers; `:40` **stale, do not trust** (see Sequencing); `:132` a historical record of the shipped five-item nav, not a live constraint; `:240` the standing AG-3 test-gate risk

### Code the phase must not break
- `src/lib/content/rekrutacja.ts` — `OPLATY` at `:119-128` (six keys); the `/cennik` reservation comment at `:116-117`; the module header at `:8-13` declaring it code-authored only, **which D-03 contradicts and which must be rewritten in the same commit**; the `site.ts` import at `:23` that creates the cycle risk
- `src/lib/content/site.ts` — `KeyFact` type at `:73-82`, `keyFacts` at `:84-109` with the fee tile at `:100-106` and its conditional-zero suffix at `:103`; the JSON import form at `:7-11`, whose `with { type: 'json' }` attribute and RELATIVE path are load-bearing because `tests/forms-copy.unit.ts:35` loads this module under bare `node --test`, where `$lib` does not resolve
- `src/lib/components/KeyFacts.svelte:13, 20, 21, 23, 104-118` — the icon map with no fallback, the label-keyed each block, and the interpolated tint class
- `src/lib/components/FeeBox.svelte` — no props by design (header comment `:2-15`), five paragraphs from five keys, `.kwota` styling assuming one short string
- `src/routes/o-nas/+page.svelte` — `:2-5` the zero-JS header comment D-13 breaks; `:24` the direct `o-nas.json` import; `:28-40` the glob and `obiekt_zdjecia` read with no guard; `:118-135` the "Nasze miejsce" section; `:210-217` and `:360-381` the grid CSS
- `src/lib/content/o-nas.json:27-30` — `obiekt_zdjecia` held as one-line objects, a formatting detail `serializuj.ts:24-32` documents as expanding on the first panel save
- `src/lib/server/admin/uploads.ts:141-237` — `PREFIKS_O_NAS`, `nazwaZdjeciaONas`, and `zdjecieONasDoUsuniecia`, whose four conditions are the ownership rule that protects hand-placed files
- `src/lib/server/admin/walidacja/o-nas.ts:112-115, 126, 145-147, 241-339` — the photo contract and the roughly hundred-line two-pass name-reservation branch the gallery validator must reproduce, not merely reference
- `src/lib/pola-strony.ts:50-96, 113-117, 177-252` — the shared client and server wire vocabulary for the photo group, and `MAKS_ELEMENTOW = 30`
- `src/lib/components/admin/PowtarzalnaGrupa.svelte:52-78, 187-189` — no cap prop, no disabled add button, no move actions; mounted by four screens
- `src/lib/content/panel.ts:16-20, 44-52` — the "every new export must join the sweep list" rule, and `NAWIGACJA`'s seven frozen labels
- `src/lib/components/admin/PanelNawigacja.svelte:19-22, 30-40` — `SCIEZKI` index-aligned with `NAWIGACJA`; a mismatch yields an `undefined` href that no test catches
- `src/routes/admin/+layout.server.ts:15-24` — the `SEKCJE` page-title map; an unlisted route degrades silently to a generic title
- `src/routes/admin/+page.svelte:9-13, 30-56` — the six pulpit cards, written out rather than looped, on purpose
- `src/routes/admin/nabor/+page.server.ts:53-128` — **the complete template for a singleton editor screen**: load with current value plus head SHA, named save action, validate, `serializujJson`, `zapiszTresc`, redirect with a `zapisano` marker
- `src/lib/server/admin/serializuj.ts:33-35` — all panel output is `JSON.stringify(dane, null, '\t') + '\n'`, and `src/lib/content/` is deliberately NOT in `.prettierignore`. New seed files must be hand-authored tab-indented with a trailing newline or the first save blocks every local commit
- `svelte.config.js:9-29, 76-84` — `KNOWN_FUTURE_ROUTES` and the crawler tolerance handler
- `src/lib/nav.ts:15-21` — the five nav links
- `src/lib/components/Footer.svelte:42-44` — the three orphan links this phase closes; `:78-80` the hard-coded opening hours
- `src/lib/assets/uploads/README.md` — documents the two panel-written name shapes and names `o-nas.json` as the home of the facility alt text, which D-26 makes false
- `docs/instrukcja-cms.md:61-80, 141-196, 251-270` — the single printable staff manual rendered by `/admin/pomoc`; §2 says six tiles, §5 says photos are added on the O nas screen, §7 describes the facility photos. All three become false

### Test gates that will go red, by design
- `tests/o-nas.spec.ts:44-51, 74-83, 105-111` — the exact heading name "Nasze miejsce" and the `obiekt-heading` selector
- `tests/nav.spec.ts:71-81` — footer hrefs, including `['Galeria', '/galeria']` at `:76`
- `tests/home.spec.ts:106-119` — four `.fact-label` nodes and the tile strings RETYPED, not interpolated, including the conditional-zero suffix at `:116-118`
- `tests/rekrutacja.spec.ts:167-184` — the `.fee-box` no-zero regex at `:183` and the ZUS co-presence check at `:178`
- `tests/admin-copy.unit.ts:101-151, 212-215, 217-222` — the explicit export sweep whose length must equal the copy module's export count, and the seven-label nav order assertion
- `tests/admin-polski.spec.ts:76-91` — `TRASY`, the Polish-only sweep. **It holds FOURTEEN routes, not eighteen.** `.claude/CLAUDE.md:10`, `.planning/REQUIREMENTS.md:67`, `.planning/STATE.md:209` and `04.1-11-SUMMARY.md:115` all state 18 and are all wrong. A screen missing from this list has ZERO Polish coverage and nothing signals it
- `tests/admin-pulpit.spec.ts:38-46, 61-71, 95-111` — six tiles, asserted three ways
- `tests/admin-strony.spec.ts:31-36, 74, 179-209, 528-589, 652-663` — eight anchors on the o-nas photos, including a hardcoded `zdjecie[2].dane`
- `tests/admin-walidacja-strony.unit.ts:108-118, 161-173, 376-388, 590-743` — the committed `o-nas.json` as oracle, asserting the validator's output key set AND key order
- `tests/instrukcja.unit.ts:115-138, 158-238` — required manual headings and verbatim copy quotes, including `POLA_O_NAS.zdjeciaLegenda` at `:228`
- `tests/responsive.spec.ts:32` — `ROUTES` lacks `/cennik`, so the new page inherits zero viewport coverage unless added
- `tests/admin-walidacja-nabor.unit.ts:172-190` — the byte-for-byte serialization pin every panel-written store must carry

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`src/routes/admin/nabor/+page.server.ts` is the template for both new singleton screens.** The write path, the head-SHA conflict refusal and the auth gate are reusable as-is. The real cost of a new screen is the validator, the copy exports, the wire-vocabulary module and the six lists that enumerate panel screens, not the plumbing.
- **`src/routes/admin/o-nas/` is the template for the gallery screen.** Its photo half (`+page.server.ts:98-109, 169-200, 227-252` and `+page.svelte:142-156, 353-398`) moves wholesale, including the validation-summary anchors that carry the WCAG 2.4.4 contract.
- `src/lib/components/admin/ZdjecieIsland.svelte` takes the aspect ratio as a prop specifically so a later plan mounts it rather than writing a second one. D-24 chose 4:3 to use `PROPORCJA_O_NAS` unchanged.
- `src/lib/server/admin/walidacja/nabor.ts:36-42` is the allowlist precedent: closed literal set, an absent field is a refusal rather than a default.
- `src/lib/server/aktualnosci.ts` remains the matured reader precedent: entry typed `unknown`, container guarded before any property access, result built key by key and never by spreading, a malformed entry warns and returns null so one bad JSON cannot abort the whole-site prerender.
- `src/lib/components/MobileNav.svelte` is the correctness precedent for the lightbox island.
- `Seo`, `Cta`, `Wave`, `SkipLink`, `Header`, `Footer` are direct reuse on `/cennik`.

### Established Patterns

- **Prerendered zero-JS content routes.** `prerender = true` is set once in `src/routes/+layout.ts` and inherited; `/admin` opts out in `src/routes/admin/+layout.ts:12`, so a new panel route needs no extra wiring.
- **Content flow:** JSON under `src/lib/content/` to a server reader using `import.meta.glob(..., { eager: true, import: 'default' })` to a `+page.server.ts` load.
- **The client and server boundary is a real constraint, recorded three times** (`src/lib/zdjecia.ts:1-18`, `src/lib/stan-naboru.ts:1-28`, `src/lib/pola-strony.ts:1-30`): SvelteKit refuses at build time to bundle `src/lib/server/` into client code, so any vocabulary both halves need lives in `src/lib/`. This decides where the keyFacts allowlist goes, and where the amount formatter cannot go.
- **Image pipeline:** `enhancedImages()` runs before `sveltekit()`; uploads live in `src/lib/assets/uploads/`; the input glob accepts jpg, jpeg, png and webp but NOT avif.
- **Tests interpolate from content modules, never retype values** ... except `tests/home.spec.ts:106-119`, which retypes. **That asymmetry now decides a design question**: interpolated assertions pass for any stored number and would go blind once an editor writes the value, while retyped assertions break on any reformatting. Neither is right by default and the plan must choose deliberately per surface.
- **Nothing automated runs `tests/*.unit.ts`.** `npm run test` is Playwright-only, pre-commit is check plus lint, there is no CI. This is the third phase to inherit the gap (`03-REVIEW.md:99-105`, `04-REVIEW.md`, `04.1` deferred ideas), and this phase adds at least three new unit suites into the same unrun tier.

### Integration Points

- `src/lib/nav.ts` `navLinks` — one new entry per D-16, consumed by `Header.svelte` and `MobileNav.svelte`
- `src/lib/components/Footer.svelte:42-44` — three links repointed or resolved
- `svelte.config.js` `KNOWN_FUTURE_ROUTES` — emptied
- `src/lib/content/rekrutacja.ts` `OPLATY`, `src/lib/content/site.ts` `keyFacts`, and the new `/cennik` page — the three fee surfaces, all composed from one store
- `src/lib/content/o-nas.json` and `/o-nas/+page.svelte` — `obiekt_zdjecia` leaves, the gallery section arrives, the anchor is added
- Panel enumeration surfaces, all of which must be edited together for each new screen: `NAWIGACJA`, `SCIEZKI`, `SEKCJE`, the pulpit cards, `TRASY` in `admin-polski.spec.ts`, `EKSPORTY` in `admin-copy.unit.ts`, and `docs/instrukcja-cms.md` with its own unit gate

</code_context>

<specifics>
## Specific Ideas

- `/o-nas` is the emptiest page on the site and the one that has to sell the żłobek. That is the whole reason the gallery moved onto it, and it should be the test a reviewer applies to the result.
- The `2 337 zł → 1 500 zł` framing is wanted explicitly: parents should understand WHY the price is what it is, not only what it is.
- The ZUS route to near zero should read as the practical headline answer for most families, and the worked example is what makes it read that way.
- Gallery photos should feel like the existing "Nasze miejsce" section, just more of them, rather than a different visual idiom.
- Nine good photos sell the żłobek better than forty random ones. The twelve-photo cap is an editorial instrument, not only a performance guard.

</specifics>

<deferred>
## Deferred Ideas

- **Lightbox navigation between photos** (arrows, swipe) rather than single-photo enlargement.
- **A „treść zastępcza" placeholder boolean on the new content files**, matching `o-nas.json`. Interacts with the per-fact placeholder question in D-33.
- **A „Pełny cennik" link from the FeeBox on `/rekrutacja`.**
- **Contact-detail editing in the settings screen.** Still deferred from 04.1 D-16. `contact` is rendered in many places and is woven into form copy that has its own single-source test gate.
- **The drag-to-position cropper.** Deferred for the second time, now with a stronger reason (D-24).
- **Editor-defined extra fee rows.** Every new row is an amount no test knows about, so the D-07 guarantee would stop being machine checkable.
- **Unifying the three sources of the opening hours** (tile, `contact.hours`, the Footer literal), if D-33 excludes the hours rather than unifying them.
- **AG-3, the unrun unit-test tier.** Not this phase's scope, but this phase enlarges the blind spot and should say so in its own verification rather than lean on suites nothing runs.
- **`/dojazd` as a standalone page.** Dead; D-17 repoints the link.
- **Correcting the „18 panel URLs" figure** in `.claude/CLAUDE.md`, `REQUIREMENTS.md`, `STATE.md` and `04.1-11-SUMMARY.md`. The real count is 14 and the wrong number is being copied forward.

</deferred>

---

*Phase: 5-Gallery & Fees*
*Context gathered: 2026-08-15, fully refreshed 2026-08-17*
