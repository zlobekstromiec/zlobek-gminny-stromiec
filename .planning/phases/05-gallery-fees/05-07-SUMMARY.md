---
phase: 05-gallery-fees
plan: 07
subsystem: strona-publiczna
tags: [galeria, o-nas, migracja, kotwica, crawler, dostepnosc, reduced-motion]
status: complete
requires:
  - store galerii, czytnik czytajGalerie i galeriaZObrazami, para nazwa/wlasnosc pliku (05-06)
  - skrot Galeria w stopce i jednoelementowa lista tolerowanych sciezek (05-03)
  - wedlugBazowejNazwy i bazowaNazwa w src/lib/zdjecia-nazwy.ts (05-06)
  - PowtarzalnaGrupa z propsami kolejnosci (05-04), brama enumeracji (05-05)
provides:
  - sekcja galerii na /o-nas (kotwica galeria, tabindex -1, scroll-margin-top 96px)
  - siatka 1/2/3 kolumny przy 0/768/1024px, odstep 24px, proporcja 4:3, wlasna blokada ruchu
  - wymagany stan pusty galerii (odziedziczony panel pustej listy, ikona Images)
  - skrot Galeria w stopce prowadzi do /o-nas#galeria
  - build bez listy tolerowanych sciezek: kazdy niedzialajacy odnosnik wewnetrzny lamie build
  - tests/galeria.spec.ts (GAL-1, GAL-2, GAL-5, kafelkowa polowa GAL-6)
affects:
  - src/lib/content/o-nas.json (klucz obiekt_zdjecia usuniety)
  - src/routes/admin/o-nas/ (polowa zdjeciowa usunieta z obu plikow)
  - src/lib/server/admin/walidacja/o-nas.ts (kontrakt zdjecia i rezerwacja nazwy usuniete)
  - src/lib/pola-strony.ts, src/lib/content/panel.ts (nazwy i kopia bez konsumenta usuniete)
  - src/lib/server/admin/uploads.ts (osierocony blok O nas usuniety, odchylenie 1)
  - src/lib/server/admin/serializuj.ts (komentarz przestal byc prawdziwy, odchylenie 2)
  - docs/instrukcja-cms.md sekcje 2, 5, 7
  - src/lib/assets/uploads/README.md
  - plan 05-08 (dokleja wyspe podgladu do tej samej sekcji i tego samego pliku spec)
tech-stack:
  added: []
  patterns:
    - kotwica sekcji publicznej: id niesie fragment, aria-labelledby wskazuje wlasny h2, tabindex -1
    - jawna liczba torow siatki zamiast auto-fit, zeby pojedynczy kafelek nie rozciagal sie na rzad
    - wlasna blokada prefers-reduced-motion obok globalnej, bo globalna nie zdejmuje transformacji
    - migracja klucza JSON razem z kazdym czytnikiem w jednym commicie, bramowana przez check i build
    - komentarz opisuje usunieta nazwe, nigdy jej nie wypisuje (regula 04-02)
key-files:
  created:
    - tests/galeria.spec.ts
  modified:
    - src/routes/o-nas/+page.svelte
    - src/lib/content/o-nas.json
    - src/routes/admin/o-nas/+page.server.ts
    - src/routes/admin/o-nas/+page.svelte
    - src/lib/server/admin/walidacja/o-nas.ts
    - src/lib/server/admin/uploads.ts
    - src/lib/server/admin/serializuj.ts
    - src/lib/pola-strony.ts
    - src/lib/content/panel.ts
    - src/lib/components/Footer.svelte
    - svelte.config.js
    - src/lib/assets/uploads/README.md
    - docs/instrukcja-cms.md
    - tests/o-nas.spec.ts
    - tests/nav.spec.ts
    - tests/admin-strony.spec.ts
    - tests/admin-walidacja-strony.unit.ts
    - tests/instrukcja.unit.ts
decisions:
  - Interwal podwojnej wlasnosci zdjec ZAMKNIETY - jeden ekran panelu wlada zdjeciami zlobka
  - Osierocony blok nazw i usuwania zdjec O nas usuniety z uploads.ts (odchylenie, regula 2)
  - Lista tolerowanych sciezek usunieta razem z galezia, ktora ja czytala; dowodem jest build
  - emulateMedia z reduced-motion zadzialalo zgodnie z dokumentacja, wariant zapasowy niepotrzebny
  - GAL-3 w stanie PUSTYM jest uczciwie nieudowodnione i nie jest zglaszane jako zielone
  - RED zabankowany naprawde (precedens 05-03): testy to specyfikacje Playwright bez importow
metrics:
  duration: ~95 min
  completed: 2026-08-17
  tasks: 3
  files: 19
  commits: 3
---

# Phase 5 Plan 07: galeria na /o-nas i koniec podwojnej wlasnosci zdjec - Summary

A parent opening `/o-nas` now sees the gallery where „Nasze miejsce" used to be, with a
caption under every photograph, reachable from the footer of any page; and the photographs
have exactly one owner in the panel, because `obiekt_zdjecia` left `o-nas.json` in the same
commit as every reader of it.

## The interval this plan closes, stated plainly

**CLOSED.** Plan 05-06 deliberately left the panel with two photo screens and said so. That
state is over:

- `src/lib/content/o-nas.json` no longer holds `obiekt_zdjecia`, and neither does any reader
  of it. `grep -c 'obiekt_zdjecia'` is `0` on all six files the plan named, and `0` across
  `src/` and `tests/` entirely.
- `/admin/o-nas` renders no file input, no picture, no „Dodaj zdjęcie", no „Usuń to zdjęcie"
  and no `<noscript>` notice. That is ASSERTED, not merely untested, by a new case in
  `tests/admin-strony.spec.ts`.
- `/o-nas` reads the gallery store through `czytajGalerie` plus `galeriaZObrazami`, the two
  readers plan 05-06 built, and adds no filter of its own.

An editor may now be invited into the panel without meeting two screens that claim the same
pictures. The live UAT still waits for plan 05-08 (the lightbox), exactly as 05-06 recorded.

## What was built

### Task 1 (`7110d2a`) — the public contract, executable and RED

**A real RED commit was banked**, following the 05-03 precedent rather than the four-times
repeated „observe it, cannot bank it" constraint: every file this task touches is a Playwright
spec or a unit test importing modules that already existed, so `npm run check` passed at
0 errors and the pre-commit hook let a failing-test commit through with no `--no-verify`.

Observed RED, in full:

- `npx playwright test tests/galeria.spec.ts tests/o-nas.spec.ts tests/nav.spec.ts tests/admin-strony.spec.ts`
  → **16 failed, 41 passed.** Twelve in the new spec (the section did not exist), two in
  `o-nas.spec.ts` (the gallery heading, the gallery-labelled image selector), one in
  `nav.spec.ts` (the footer href), one in `admin-strony.spec.ts` (the new no-photo-half
  assertion). No unrelated case in `tests/o-nas.spec.ts` or `tests/nav.spec.ts` failed.
- `node --test tests/admin-walidacja-strony.unit.ts` → **2 failed, 19 passed**, both being the
  o-nas oracle: the validator answered `obiekt_zdjecia: []` while the committed file still
  held two photographs.

**`tests/galeria.spec.ts`** covers every bullet of the plan's `<behavior>` list except the
lightbox, which plan 05-08 adds to this same file. Notes the plan asked for:

- **The reduced-motion API behaved as documented.** `page.emulateMedia({ reducedMotion: 'reduce' })`
  is the project's first use and needed no fallback; the weaker `getComputedStyle`-only variant
  was not used. The case runs its POSITIVE CONTROL FIRST: it proves the hover scale exists
  before proving it is switched off, because „the transform is none" passes on a page that
  never had one.
- **The no-scripting case asserts the href RESOLVES**, not merely that it looks like an image:
  it fetches each tile's target in the `javaScriptEnabled: false` context and demands a 200
  with an `image/` content type. That is what makes the progressive-enhancement claim true
  rather than intended.
- **The grid tiers are read twice, independently.** Once from the resolved
  `grid-template-columns` track list (which distinguishes two columns from three, something
  geometry cannot do with two photographs in the store) and once from rendered tile geometry
  (which catches a grid that declares three tracks but renders stacked). Neither reads a class
  name, so a CSS refactor that keeps the layout does not turn them red.
- **Captions and alts are interpolated from the store, never retyped** (05-UI-SPEC §„Test
  lockstep", the asymmetry note: they are editor owned from this phase on). The two strings
  that are NOT editor owned, the section heading and the hidden link prefix, are pinned
  literally, because those two are the contract.

The four lockstep edits changed what a gate asserts, never whether it asserts. The
`admin-strony.spec.ts` removals were the eight o-nas photo anchors the UI-SPEC named,
including the hardcoded `zdjecie[2].dane`; `admin-walidacja-strony.unit.ts` kept BOTH the key
SET and the key ORDER assertions, which are the durable proof that the validator builds its
result from guarded locals rather than spreading the raw entry.

### Task 2 (`a25618b`) — the section, and the migration in one commit

One commit, and it could not be smaller: removing the key is a `svelte-check` type error in
four modules and an undefined access at prerender.

**`/o-nas`.** The header comment was rewritten HERE rather than left to be discovered: the
prerender statement, the no-`+server.ts` rule and the single-`main`/single-`h1` rules stayed,
and the zero-JS claim was replaced with the truth this phase creates (one hydrated island, the
lightbox, landing in plan 05-08, the site's fourth and the first on a content route). It also
names the new content split: the photographs come from their own store and their own panel
screen, the facility description stays in the o-nas store.

Section 6 now carries the fragment as its `id`, `tabindex="-1"`, `aria-labelledby` pointing at
its own `h2`, `scroll-margin-top: 96px`, and the heading „Galeria: nasze miejsce". Each tile is
a `<li><figure>` holding a link (visually-hidden prefix plus the photo's alt) around the
enhanced image, with the caption in a `<figcaption>`. The each block is keyed BY POSITION,
following the comment already above the wartości list in the same file and the identical fix in
`DayPlan.svelte`. The first two tiles are eager and the rest lazy.

The **zero-photo state renders unconditionally** down to the section, its heading and its id;
only the grid is conditional, so the footer link can never break. The empty state reuses the
inherited panel shape (`/aktualnosci` and `NewsPreview`) on the warm surface Contract 1 names,
with the Lucide `images` icon at 32px `muted`, rather than a new shape nobody has scanned.

Grid: explicit 1 / 2 / 3 tracks at base / 768px / 1024px, gap 24px, 4:3 reserved before the
image paints, `object-fit: cover` as the safety net for the two hand-placed seeds, and the
existing „span both tracks of the editorial split" rule extended to the new class names.
**No `auto-fit` and no `auto-fill`**, deliberately: either would stretch a lone tile to the
container width and make it read as a second hero, and one photograph is a state an editor
reaches in two clicks. Hover scales the image inside its clipped box and underlines the
caption; no translate, no shadow, no accent colour, no new token.

**The panel half.** `/admin/o-nas` lost its echo member, its two add/remove actions, its two
move actions, its file list entries, its deletion set, the photo rows of the validation summary
and the photo group mount. Both route header comments were corrected where they became false:
the „six of seven actions never touch git" count, and the „the JSON and every pending picture
travel in one tree" statement, which is now a statement about the gallery route and says so.
`walidacja/o-nas.ts` lost the photo contract and the two-pass name reservation, and
`walidujONas` lost its second argument entirely, because this screen names no file any more.

### Task 3 (`fc7973f`) — the footer, the crawler, and the two false documents

The footer's Galeria shortcut now points at the `/o-nas` fragment. The label did not change,
so the locked footer contract, which enumerates that column by LABEL and not by href, holds.

`svelte.config.js` lost the tolerated-path array AND the crawler-tolerance branch that consumed
it. The record of what stood there and why it is gone is kept as a comment in its place, but
**neither the retired constant nor any retired path is written out**, following the repository
rule recorded at 04-02. That resolves a contradiction inside the plan itself, which asked for
both a comment recording the array and `grep -c 'KNOWN_FUTURE_ROUTES'` equal to `0`; describing
rather than naming satisfies both, and the enforced evidence is still `npm run build`.

`src/lib/assets/uploads/README.md` documents the gallery filename prefix beside the news one,
including what the prefix means for the right to delete, and no longer says the facility alt
text lives in `o-nas.json`. `docs/instrukcja-cms.md` sections 2, 5 and 7 stop telling an editor
to add photographs on the O nas screen; every screen name and label is quoted verbatim from
`src/lib/content/panel.ts`.

## Validation-map position, stated plainly (the D-37 obligation)

- **GAL-1: green.** The section, its anchor, its heading and its grid render on `/o-nas`,
  proven in the browser.
- **GAL-2: green.** Every tile carries a non-empty Polish alt, a visible caption, and the two
  are never the same string. Every tile link's accessible name is distinct.
- **GAL-5: green.** Each tile is a plain `<a href>` in a `javaScriptEnabled: false` context and
  its target really resolves to an image asset the build carries.
- **GAL-6, the tile half: green.** The hover transform exists without the preference and
  resolves to `none` with it, both asserted through `emulateMedia`. The dialog half is 05-08.
- **The lightbox halves of GAL-3 and GAL-4 are NOT claimed here.** They land in plan 05-08.
- **GAL-3's EMPTY-gallery axe scan is HONESTLY UNPROVEN and is not claimed.** The gallery
  renders from a committed store, and emptying that store to exercise the empty state would
  mean committing an empty gallery. What IS proven instead: the section, its heading and its id
  render unconditionally (asserted in the browser); the reader's empty return is covered in the
  unit tier by `tests/admin-walidacja-galeria.unit.ts`; and the empty-state panel reuses an
  inherited treatment that `tests/aktualnosci.spec.ts` already scans clean elsewhere on the
  site. It must be carried into `05-VERIFICATION.md` as an honestly unproven property, in the
  style the project already uses for FORM-01 and FORM-02, and added to the live UAT. This plan
  does not create that file: plan 05-09 owns the phase's validation ledger.
- **GAL-11 (an editor's add and remove appearing publicly) is LIVE ONLY** and is not claimed.
  It needs a real commit, a real Pages build and a real two-minute wait.
- **GAL-10 remains honestly unproven**, unchanged from 05-06, and must appear by name in
  `05-VERIFICATION.md` alongside GAL-3's empty scan.
- **REG-3: green, and this plan is where it was owed.** `npm run check` reports 0 errors over
  4391 files after the key removal, and `npm run build` succeeds, so the removal broke neither a
  type in the graph nor an access at prerender.
- **AMD-3: green, by `npm run build` and never by a grep.** The build now emits ZERO `[404]`
  lines; before this plan it emitted exactly one, `[404] GET /galeria`.
- **The two Phase 6 deferrals stand, carried forward rather than dissolved:** the HEIC decode
  path (04.1 UAT row B2, whose input does not exist yet) and the stale-save conflict panel
  (04.1 UAT row B4). Nothing in this plan's acceptance evidence depends on either.
- **This phase does not tick CMS-01, CMS-02 or CMS-03** (D-36). GALLERY-01 is closable by this
  plan; GALLERY-02's closing evidence is GAL-11 and is live only.

## No browser-tier assertion is relied on for persistence or deletion

`npm run preview:test` binds `PANEL_DRY_RUN=1`, so no Playwright save writes or deletes a file
and any browser assertion about persistence or deletion would pass whatever the underlying rule
did. Nothing in this plan makes such an assertion. The panel-side properties this plan touches
are all ABSENCE properties on a rendered screen (no file input, no preview, no add/remove
button, no `<noscript>` notice), which a dry run cannot fake, and the o-nas key-set and
key-order properties are pinned in the UNIT tier against the real committed file.

## Verification

Full wave gate, run from the worktree at the end of task 3:

| Gate | Result |
|---|---|
| `npm run check` | 4391 files, 0 errors, 0 warnings |
| `npm run lint` | prettier clean, eslint clean |
| `npm run test:unit` | **566 passed, 0 failed** (typed by hand; nothing automated runs this tier) |
| `npm run test` (FULL suite) | **390 passed, 0 failed** |
| `npm run build` | succeeded, and now with **zero** `[404]` lines |

Per suite, for the record: `tests/galeria.spec.ts` 12 cases green, `tests/o-nas.spec.ts` green
with both lockstep edits, `tests/nav.spec.ts` 6 cases green including the fragment-resolution
loop, which now resolves BOTH the Galeria and the Dojazd fragments with no edit to the loop
itself, `tests/admin-strony.spec.ts` green with the photo half gone,
`tests/admin-galeria.spec.ts` green unchanged, `tests/aktualnosci.spec.ts` green (the seeded
aktualność whose cover is `sala-zabaw.jpg` still renders it, which proves neither seed file was
deleted), `tests/instrukcja.unit.ts` 18 cases green.

Acceptance greps:

- `grep -c 'obiekt_zdjecia'` = `0` on `o-nas.json`, `/o-nas/+page.svelte`,
  `/admin/o-nas/+page.server.ts`, `/admin/o-nas/+page.svelte`, `walidacja/o-nas.ts` and
  `pola-strony.ts`; and `0` across `src/` and `tests/`.
- `grep -rc 'obiekt-heading' src/` = `0` (the two remaining occurrences are the ABSENCE
  assertions in `tests/galeria.spec.ts`).
- `grep -c 'zero-JS\|zero-JavaScript' src/routes/o-nas/+page.svelte` = `0`.
- `grep -c 'id="galeria"' src/routes/o-nas/+page.svelte` = `1`, on the element that also
  carries `tabindex="-1"`; `grep -c 'scroll-margin-top'` = `2`.
- `grep -c 'KNOWN_FUTURE_ROUTES' svelte.config.js` = `0`.
- `grep -c 'o-nas.json' src/lib/assets/uploads/README.md` = `1`, and that occurrence describes
  the TEXT half only (the facility description, explicitly „no longer holds a photo of any
  kind"), which is the criterion's second branch.
- `grep -c 'obiekt-heading' tests/o-nas.spec.ts` = `0`; `grep -c 'Nasze miejsce'` = `0`.
- `grep -c "'/galeria'" tests/nav.spec.ts` = `0`.
- `ls src/lib/assets/uploads/` still lists `sala-zabaw.jpg` and `plac-zabaw.jpg`.
- `git diff --name-only -- package.json package-lock.json` = **empty**. Zero packages installed
  (T-05-07-SC).
- `git diff --diff-filter=D --name-only` on both source commits = **empty**. No file was deleted.

**One inherited grep changed as a consequence, and it is not a „fix" of the thing 05-03
protected.** `grep -c "'/dojazd'" svelte.config.js` went from `1` to `0`, because the whole
comment block that named it was removed with the array. 05-03's point was that a criterion
grepping that file for a quoted path is a permanent false positive; that remains true, and this
plan wrote no such criterion.

## Deviations from Plan

### 1. [Rule 2 - Missing critical functionality] The orphaned O nas upload block left `uploads.ts`

- **Found during:** task 2, after removing the last caller of `nazwaZdjeciaONas` and
  `zdjecieONasDoUsuniecia`.
- **Issue:** removing the photo half from the route and the validator left four exported
  symbols in `src/lib/server/admin/uploads.ts` (`PREFIKS_O_NAS`, `MAKS_RDZENIA_O_NAS`,
  `nazwaZdjeciaONas`, `zdjecieONasDoUsuniecia`) plus one module-private constant with no
  production caller at all. That is a stub by this project's own definition, and the private
  constant would additionally have become an eslint unused-variable error had the two functions
  gone without it. `uploads.ts` is not in the plan's `files_modified`, but the plan's own rule
  for `pola-strony.ts` says to remove any name that no longer has a consumer, and the orphaning
  was caused directly by this task's changes.
- **Fix:** the whole O nas block removed, together with its unit coverage in
  `tests/admin-walidacja-strony.unit.ts` (which the plan already directed be stripped of its
  photo-branch cases). The gallery block, which reproduces the same ownership rule rather than
  sharing it behind a prefix parameter, is untouched and keeps its own 41-case unit suite. The
  block's header comment was rewritten to say why exactly one copy is now left and that the next
  screen needing an ownership rule must reproduce it again rather than parameterise this one.
- **Files:** `src/lib/server/admin/uploads.ts`, `tests/admin-walidacja-strony.unit.ts`
- **Commit:** `a25618b`

### 2. [Rule 1 - Bug] Three shipped comments became false

- **Found during:** task 2 and task 3.
- **Issue:** `src/lib/server/admin/serializuj.ts` named `o-nas.json`'s `obiekt_zdjecia` as one of
  the two one-line nested objects the first panel save expands. `docs/instrukcja-cms.md` section
  2 described the O nas pulpit tile as covering „opis budynku wraz ze zdjęciami obiektu". Both
  became false in the same commit that removed the key, and the manual's own contract test would
  not have caught either.
- **Fix:** the serializer comment now names only `day-plan.json` and records what the second
  example was; the manual's section 2 says the O nas screen is text only and points at Galeria.
- **Files:** `src/lib/server/admin/serializuj.ts`, `docs/instrukcja-cms.md`
- **Commits:** `a25618b`, `fc7973f`

### 3. [Judgement] The `KNOWN_FUTURE_ROUTES` grep criterion contradicted the plan's own action

- **Issue:** the plan's action says to keep a comment recording what the array was and why it is
  gone, and its acceptance criteria say `grep -c 'KNOWN_FUTURE_ROUTES' svelte.config.js` must be
  `0`. Writing the constant's name into that comment satisfies the action and permanently fails
  the criterion. The same conflict appeared twice more inside `src/routes/o-nas/+page.svelte`
  (the comment explaining the retired `obiekt-heading` id, and the one naming `id="galeria"`).
- **Decision:** in all three places the comment DESCRIBES the retired name rather than writing
  it, following the repository rule recorded at 04-02 and already applied twice in plan 05-06.
  The record survives in full, the greps are honestly `0` and `1`, and the enforced evidence for
  the crawler change is still `npm run build`.
- **Commits:** `a25618b`, `fc7973f`

### 4. [Judgement] One assertion in the new spec was wrong, not the implementation

- **Issue:** the editorial-split case first compared the gallery list's left edge to the
  CONTAINER's bounding box and failed by exactly 32px, which is that container's own
  `padding-inline` at 1024px and above.
- **Fix:** the assertion now compares the list's left edge to the `h2`'s, since the heading sits
  in the left rail and its left edge IS where track 1 begins. That keeps the case about the
  tracks instead of about padding, and it is the stronger statement of the two.
- **Commit:** `a25618b`

## Notes

- **The `svelte` MCP server was unreachable**, as it has been for every executor in this phase;
  `svelte-autofixer` was absent from the tool list. The equivalent gate was run instead:
  `npm run check` includes `svelte-check`'s compiler accessibility pass and reported 0 errors
  and 0 warnings across 4391 files after every task, and the axe scan on `/o-nas` is clean.
- **`node_modules` was absent in this worktree** and was symlinked to the parent checkout's, the
  same intervention plans 05-03 to 05-06 made. It is gitignored: nothing was committed for it
  and no dependency moved.
- **The deferred double-asterisk defect (`D-05-05-A`) was NOT fixed**, per the plan.
- **No acceptance evidence in this plan requires a real photograph of a child (D-37).** The two
  seed images are the existing environment-only placeholders, no new picture was committed, and
  `galeria.json` still carries `"placeholder": true`.

## Known Stubs

None. Every export this plan leaves in place has a live caller and a live test; the four that
lost their caller were removed rather than left behind (deviation 1).

## Threat register outcomes

| Threat ID | Outcome |
|---|---|
| T-05-07-01 (stored XSS through editor prose) | The caption renders as TEXT in a `<figcaption>` and the alt as an attribute value; neither goes through a raw HTML path. The facility description keeps the existing sanitizing inline renderer with its eslint-disable comment and its stated reason, and CSP `script-src 'self'` is the second layer. |
| T-05-07-02 (one bad entry aborts the prerender) | The page adds NO filter of its own: the drop of an entry whose file the build does not carry lives in `galeriaZObrazami`, and a malformed container warns and returns an empty list. One question, one answer. `npm run build` succeeds. |
| T-05-07-03 (duplicate-key exception in production) | Keyed BY POSITION, following the comment already above the wartości list in the same file and the identical fix in `DayPlan.svelte`. The list is editor writable and two photographs can carry the same caption. |
| T-05-07-04 (destructive migration) | The key and every reader changed in ONE commit, with `npm run check` (0 errors) and `npm run build` (success) as the two enforced gates. Both seed files are still on disk, and `tests/aktualnosci.spec.ts` passes, which is the live proof that the seeded aktualność still renders its cover. |
| T-05-07-05 (RODO / wizerunek) | Environment-only placeholder images, zero identifiable people, `"placeholder": true` on the store, no new picture committed for a test, and no acceptance criterion requiring real photography. |
| T-05-07-06 (a visitor cannot reach the gallery) | The fragment target was created in task 2 and the footer repointed only in task 3. The fragment-resolution loop from plan 05-03 covered it with no edit and now resolves both fragments. |
| T-05-07-07 (build fails on a link nobody noticed) | Accepted as planned, and now real: the crawler has no exception list. A failed build leaves the previous deployment live, which this project prefers over a published broken link. |
| T-05-07-SC (supply chain) | Zero packages installed; `package.json` and `package-lock.json` untouched. |

## For the next plan (05-08)

- The section is `<section id="galeria" tabindex="-1" aria-labelledby="galeria-heading">` and
  every tile is `<li><figure><a class="kafelek" href={pełny obraz}>…</a><figcaption>…</figcaption></figure></li>`.
  The link's href is `zdjecie.obraz.img.src`, which is the full-size asset the dialog should
  reuse rather than fetch.
- `tests/galeria.spec.ts` exists and is the file the lightbox cases are added to. Its helpers
  (`sekcja`, `lista`, `kafelki`) are already there.
- The page's header comment ALREADY says the page carries one hydrated island, the lightbox,
  added in plan 05-08. Do not re-announce it; make it true.
- The hover transform lives in the component's own reduced-motion guard. The dialog's fade needs
  its own, for the same reason: the global neutraliser shortens transitions but removes no
  transform.
- `05-VERIFICATION.md` still owes GAL-3's empty-gallery scan and GAL-10, both by name.

## Self-Check: PASSED

Files asserted present on disk: `tests/galeria.spec.ts`, `src/routes/o-nas/+page.svelte`,
`src/lib/content/o-nas.json`, `src/lib/components/Footer.svelte`, `svelte.config.js`,
`src/lib/assets/uploads/README.md`, `docs/instrukcja-cms.md`,
`src/lib/assets/uploads/sala-zabaw.jpg`, `src/lib/assets/uploads/plac-zabaw.jpg`.

Commits asserted present in `git log`: `7110d2a` (task 1, RED), `a25618b` (task 2),
`fc7973f` (task 3).
