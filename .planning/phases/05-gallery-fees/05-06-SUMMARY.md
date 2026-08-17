---
phase: 05-gallery-fees
plan: 06
subsystem: panel-redakcyjny
tags: [galeria, zdjecia, limit-edytorski, wlasnosc-pliku, enumeracja-ekranow, bez-skryptow, dostepnosc]
status: complete
requires:
  - PowtarzalnaGrupa z propsami kolejnosci i propem wylaczone w Przycisk (05-04)
  - brama enumeracji, SCIEZKI_PANELU, SEKCJE_PANELU, TRASY (05-05)
  - ZdjecieIsland z proporcja jako propem (04.1-07)
  - uploads.ts, obraz.ts, walidacja/pola.ts, serializuj.ts, zapis.ts (04.1-04 do 04.1-09)
  - wzorzec ekranu ze zdjeciami /admin/o-nas (04.1-09)
  - tests/fixtures/admin.ts (04.1-01)
provides:
  - src/lib/zdjecia-nazwy.ts (bazowaNazwa, wedlugBazowejNazwy)
  - src/lib/content/galeria.json (store galerii, flaga zastepcza plus lista zdjec)
  - src/lib/galeria.ts (ZdjecieGalerii, zdjecieGalerii, czytajGalerie, galeriaZObrazami)
  - PREFIKS_GALERII, MAKS_RDZENIA_GALERII, nazwaZdjeciaGalerii, zdjecieGaleriiDoUsuniecia w uploads.ts
  - src/lib/server/admin/walidacja/galeria.ts (walidujGaleria, SCIEZKA_GALERIA, MAKS_PODPISU)
  - /admin/galeria (+page.server.ts, +page.svelte)
  - PREFIKS_ZDJECIA_GALERII, POLE_PODPISU, MAKS_ZDJEC_GALERII, ZdjecieGaleriiEcha, wartosciGalerii, idWyspyGalerii
  - KOPIA_EKRAN_GALERII, POLA_GALERIA, liczbaZdjec, przeniesionoZdjecie, notaGrupyZdjecZKolejnoscia
  - propsy limit, komunikatLimitu i notaPusta w PowtarzalnaGrupa
  - sekcja 8 „Galeria" w docs/instrukcja-cms.md
  - tests/admin-galeria.spec.ts, tests/admin-walidacja-galeria.unit.ts
affects:
  - src/routes/o-nas/+page.svelte (idiom bazowej nazwy wyprowadzony do $lib, bez zmiany zachowania)
  - src/lib/server/admin/uploads.ts (istniejaceNazwy globuje juz bez query enhanced)
  - src/routes/admin/+page.svelte i +page.server.ts (osmy kafel z licznikiem zdjec)
  - src/lib/content/panel.ts (NAWIGACJA 8 -> 9, SEKCJE_PANELU + galeria)
  - src/lib/sciezki-panelu.ts, tests/fixtures/trasy-panelu.ts (15 -> 16 tras)
  - plan 05-07 (czyta src/lib/content/galeria.json i usuwa obiekt_zdjecia z o-nas.json)
tech-stack:
  added: []
  patterns:
    - idiom powtorzony trzy razy wyprowadzony do $lib, ale glob zostaje w kazdym miejscu wywolania
    - regula wlasnosci pliku ODTWORZONA, nigdy sparametryzowana prefiksem
    - limit edytorski oddzielony od limitu pracy: przycisk to afordancja, serwer to brama
    - osobny ksztalt echa na ekran zamiast jednego wspolnego dla dwoch walidatorow
    - licznik na pulpicie z tego samego czytnika, ktory zasila opisywany ekran
key-files:
  created:
    - src/lib/zdjecia-nazwy.ts
    - src/lib/content/galeria.json
    - src/lib/galeria.ts
    - src/lib/server/admin/walidacja/galeria.ts
    - src/routes/admin/galeria/+page.server.ts
    - src/routes/admin/galeria/+page.svelte
    - tests/admin-walidacja-galeria.unit.ts
    - tests/admin-galeria.spec.ts
  modified:
    - src/lib/server/admin/uploads.ts
    - src/lib/pola-strony.ts
    - src/lib/content/panel.ts
    - src/lib/sciezki-panelu.ts
    - src/lib/components/admin/PowtarzalnaGrupa.svelte
    - src/routes/o-nas/+page.svelte
    - src/routes/admin/+page.svelte
    - src/routes/admin/+page.server.ts
    - tests/fixtures/trasy-panelu.ts
    - tests/admin-copy.unit.ts
    - tests/admin-pulpit.spec.ts
    - tests/instrukcja.unit.ts
    - docs/instrukcja-cms.md
decisions:
  - Prefiks galeria- jest jednoczesnie znacznikiem wlasnosci, a cztery warunki usuwania sa odtworzone, nie wspoldzielone przez parametr
  - Rdzen nazwy pliku pochodzi z PODPISU, nie z altu: podpis to krotka nazwa sali, alt to cale zdanie
  - MAKS_ZDJEC_GALERII to NOWY bound edytorski; MAKS_ELEMENTOW zostaje na 30 i jest bound pracy
  - Osobne ZdjecieGaleriiEcha zamiast rozszerzania ZdjecieEcha (odpowiedz na pytanie otwarte 3 z 05-VALIDATION)
  - GAL-10 zostaje UCZCIWIE NIEUDOWODNIONE: proponowana promocja do E4 jest pusta pod PANEL_DRY_RUN
  - Trzeci opt-in prop notaPusta dodany, bo pusta grupa bez zdania czyta sie jak ekran, ktory sie nie wczytal
  - GALLERY-02 pozostaje NIEODHACZONE do czasu zywego UAT (GAL-11)
metrics:
  duration: ~75 min
  completed: 2026-08-17
  tasks: 3
  files: 21
  commits: 3
---

# Phase 5 Plan 06: /admin/galeria, dwanascie zdjec za jednym „Zapisz" - Summary

An editor can now open Galeria from the panel navigation, attach a placeholder photo from a
phone or a laptop, caption it, describe it, move it up the list and save the whole list once,
with scripting switched off for everything except attaching the file; and the two
hand-placed seed photographs are unreachable by the panel's deletion path by construction.

## What was built

### Task 1 (`e275bfa`) — the store, the reader, and the naming and ownership pair

- **`src/lib/zdjecia-nazwy.ts`.** The basename idiom that was duplicated verbatim in three
  files, and which this phase would otherwise have made four. `bazowaNazwa` plus
  `wedlugBazowejNazwy`, a generic mapper taking the RESULT of a build-time glob. The glob
  itself stays at each call site, because Vite analyses it statically and its arguments must
  be literals where it is written. `/o-nas` and `uploads.ts` now use both helpers; neither
  file still carries `split('/').pop()`.
- **`src/lib/content/galeria.json`.** Hand-authored tab-indented with a trailing newline and
  every nested object expanded across lines, because `src/lib/content/` is deliberately not in
  `.prettierignore` and a compact seed would reformat itself into a commit-blocking diff on the
  first panel save. Seeded with the two photographs already in `o-nas.json`, their filenames
  and alt strings read out of that file rather than retyped, plus a short room-naming caption
  for each. `obiekt_zdjecia` is **untouched** in `o-nas.json`: that removal and its readers are
  plan 05-07 and must land in one commit.
- **`src/lib/galeria.ts`.** The reader, on the `postFromEntry` discipline: entry typed
  `unknown`, container guarded before any property access, every string through one narrowing
  primitive, result built key by key and never spread, a malformed container warned and
  answered with an empty list rather than thrown. Split into `czytajGalerie` (narrowing) and
  `galeriaZObrazami` (the render list, dropping any entry whose file is not in the picture map)
  because the pulpit counter has no picture map and must count what the EDITING screen shows.
  In `$lib` and not `$lib/server` for exactly that reason.
- **`uploads.ts`.** `PREFIKS_GALERII`, `MAKS_RDZENIA_GALERII`, `nazwaZdjeciaGalerii` (two-pass
  reservation, core from the CAPTION with the alt as fallback) and `zdjecieGaleriiDoUsuniecia`
  (four conditions). Both **reproduced** from the o-nas block rather than shared behind a
  prefix parameter, with the reason written out: the four conditions ARE the ownership rule,
  and one generic copy would let a single careless edit weaken both screens at once. The new
  block states the three consequences Contract 8 names, including that `sala-zabaw.jpg` is also
  a seeded aktualność's cover.

### Task 2 (`a520ab1`) — the screen, the cap, and all four enumeration surfaces

Everything in one commit, because the 05-05 enumeration gate goes red the moment
`src/routes/admin/galeria/` exists and stays red until every surface lists it. That is the
gate working, not an obstacle.

- **Wire vocabulary.** `PREFIKS_ZDJECIA_GALERII`, `POLE_PODPISU`, `MAKS_ZDJEC_GALERII = 12`,
  `idWyspyGalerii`, and a **separate** `ZdjecieGaleriiEcha` / `wartosciGalerii` pair. The o-nas
  echo shape is left byte-identical, which is 05-VALIDATION open question 3 answered in the
  recommended direction.
- **Copy.** `KOPIA_EKRAN_GALERII` and `POLA_GALERIA` verbatim from the Contract 8 copy table,
  plus three new refusals (`podpisBrak`, `zdjecieGaleriiBrak`, `limitZdjecPrzekroczony`), the
  photo-noun group note and the photo-noun move announcement that plan 05-04 said would land
  here, `liczbaZdjec`, and the pulpit card. `NAWIGACJA` grew from eight labels to nine with
  Galeria directly after O nas.
- **`PowtarzalnaGrupa`.** Three optional props: `limit`, `komunikatLimitu`, `notaPusta`. All
  unset by default, so the three existing mount sites render exactly what they rendered
  before, which `tests/admin-strony.spec.ts` re-proves **unchanged**. At the limit the add
  button is not rendered at all and the message takes its place: not a disabled button, because
  a control nobody may use again with no explanation is the panel looking broken.
- **`walidacja/galeria.ts`.** The two-pass reservation reproduced, the caption added as a
  required field with its own refusal, the cap as a server-side refusal keyed to the file
  control of the first over-cap item so the summary links to a control that is really on the
  page. Result constructed key by key in the committed file's order. Nothing logs, nothing
  imports `$lib`, existing names injected at the route.
- **`/admin/galeria`.** Load echoing the store with BARE BASENAMES through the same reader the
  pulpit uses, add, remove, the two move actions, and one named save building ONE file list in
  ONE call with the JSON first and every pending picture after it, base64 passed through
  without a server-side decode. The deletion set has exactly one writer: the loop calling
  `zdjecieGaleriiDoUsuniecia`. Head SHA from the form, three refusal branches in order, 303
  redirect. The screen mounts `ZdjecieIsland` at `PROPORCJA_O_NAS` **unchanged** and adds a
  fourth validation-summary row for the caption, pointing at that control's own id.
- **All four enumeration surfaces** in the same commit: `SCIEZKI_PANELU`, `SEKCJE_PANELU`, the
  pulpit (eight written-out cards, Galeria the only one with a counter) and `TRASY`.
  `tests/admin-pulpit.spec.ts` went from seven cards to eight in all three places it asserts
  the count, and its new counter case counts rendered rows on `/admin/galeria` rather than a
  literal.

### Task 3 (`67d908f`) — the staff manual

`docs/instrukcja-cms.md` section 2 now says eight pulpit tiles and lists Galeria between O nas
and Plan dnia. A new numbered section 8 „Galeria" sits where the screen sits in the panel
navigation; sections 8 to 13 were renumbered to 9 to 14 and the one internal cross-reference
was corrected with them. The section covers what the screen controls and where a parent sees
it, the automatic 4:3 crop and resize, both required fields and what each one is for (with the
difference between a caption and an alt said out loud), the move buttons and that reordering
saves nothing until „Zapisz", the twelve-photo limit and what to do at it, and that removing a
photograph removes it from the page. Every screen name, label and refusal is quoted VERBATIM
from `src/lib/content/panel.ts`.

`tests/instrukcja.unit.ts` gained the required Galeria heading, a raised minimum heading count,
seven more labels in the verbatim-quote sweep, and a new case asserting the manual explains the
cap and both required fields in the panel's own words.

**Sections 5 and 7 were deliberately NOT rewritten.** They describe photographs being added on
the O nas screen, which is still true until plan 05-07 removes that half. Rewriting them now
would make the manual wrong in the other direction.

## TDD gates: what was observed and what could not be banked

Tasks 1 and 2 are marked `tdd="true"`. **No RED commit was banked, and the reason is the
structural constraint this repository has now hit four times** (04.1-02, 05-02, 05-04, 05-05):
pre-commit runs `svelte-check` across the whole tree and `tsconfig.json` covers `tests/`, so a
unit test importing a not-yet-written module is a TYPE ERROR and a failing-test commit cannot be
made without `--no-verify`, which is forbidden. Plan 05-03's precedent (a real RED, because its
tests were Playwright specs against an existing route surface) was not reachable: `/admin/galeria`
did not exist before this plan at all.

**The RED was observed twice and is recorded here verbatim rather than banked.**

1. **Module-level RED**, `node --test tests/admin-walidacja-galeria.unit.ts` with the modules
   absent:

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/lib/zdjecia-nazwy.ts'
   imported from .../tests/admin-walidacja-galeria.unit.ts
   ℹ tests 1
   ℹ pass 0
   ℹ fail 1
   ```

2. **Type-level RED**, `npm run check` on the same tree:

   ```
   ERROR "tests/admin-walidacja-galeria.unit.ts" 36:29 "Cannot find module '../src/lib/zdjecia-nazwy.ts' or its corresponding type declarations."
   ERROR "tests/admin-walidacja-galeria.unit.ts" 37:65 "Cannot find module '../src/lib/galeria.ts' or its corresponding type declarations."
   ERROR "tests/admin-walidacja-galeria.unit.ts" 39:2 "Module '"../src/lib/server/admin/uploads.ts"' has no exported member 'MAKS_RDZENIA_GALERII'."
   ERROR "tests/admin-walidacja-galeria.unit.ts" 40:2 "Module '"../src/lib/server/admin/uploads.ts"' has no exported member 'PREFIKS_GALERII'."
   ERROR "tests/admin-walidacja-galeria.unit.ts" 42:2 "Module '"../src/lib/server/admin/uploads.ts"' has no exported member 'nazwaZdjeciaGalerii'."
   ERROR "tests/admin-walidacja-galeria.unit.ts" 43:2 "'"../src/lib/server/admin/uploads.ts"' has no exported member named 'zdjecieGaleriiDoUsuniecia'. Did you mean 'zdjecieONasDoUsuniecia'?"
   ERROR "tests/admin-walidacja-galeria.unit.ts" 227:16 "Parameter 'zdjecie' implicitly has an 'any' type."
   COMPLETED 4381 FILES 7 ERRORS 0 WARNINGS 1 FILES_WITH_PROBLEMS
   ```

Both test files were written from the plan's `<behavior>` list and the UI-SPEC contract, not
from the implementation, and then run against it.

## Verification

Full gate, run from the worktree at the end of task 3:

| Gate | Result |
|---|---|
| `npm run check` | 4390 files, 0 errors, 0 warnings |
| `npm run lint` | prettier clean, eslint clean |
| `npm run test:unit` | **582 passed, 0 failed** (typed by hand; nothing automated runs this tier) |
| `npm run test` (FULL suite) | **387 passed, 0 failed** |
| `npm run build` | succeeded |

Per-suite, for the record: `tests/admin-walidacja-galeria.unit.ts` 41 cases,
`tests/admin-galeria.spec.ts` 25 cases, `tests/admin-enumeracja.spec.ts` 4 cases green with the
new route in all four surfaces, `tests/admin-strony.spec.ts` green **unchanged** (REG-1).

Acceptance greps:

- `grep -c "split('/').pop()"` on `/o-nas/+page.svelte` and `uploads.ts` = `0` for both.
- `grep -c 'import.meta.glob' src/lib/zdjecia-nazwy.ts` = `0`.
- `head -c 2 src/lib/content/galeria.json` = `{` then a newline; `grep -Pc '^\t\t\t"'` = `6`.
- `grep -c 'obiekt_zdjecia' src/lib/content/o-nas.json` = `1`, unchanged.
- `grep -c 'MAKS_ELEMENTOW' src/lib/pola-strony.ts` = `2`, unchanged, and its value is still `30`.
- `src/lib/zdjecia.ts` unmodified.
- `ls src/routes/admin/galeria/` holds `+page.server.ts` and `+page.svelte` and no `+server.ts`;
  `static/admin` does not exist.
- `grep -c 'console\.'` across the route and the validator = `0`; `grep -c "'$lib"` in the
  validator = `0`.
- `grep -c 'zdjecieGaleriiDoUsuniecia'` in the route = `4`, and the only expression that appends
  to the deletion array is the loop calling it.
- `grep -c '^## ' docs/instrukcja-cms.md` went from 13 to 14, exactly one more.
- `git diff --name-only -- package.json package-lock.json` = **empty**. Zero packages installed
  (T-05-06-SC).

## Validation-map position, stated plainly (the D-37 obligation)

- **GAL-7: green.** Add, remove and reorder on `/admin/galeria`, each proven in a
  `javaScriptEnabled: false` context, so the list is a server round trip and not client state.
- **GAL-8: green.** The twelve cap is proven twice and in the right order: the unit suite proves
  a thirteen-item submission is refused **server-side** regardless of what the page rendered,
  and the browser suite proves the add button disappears at twelve with the Polish message in
  its place. A case also pins that the number in the refusal, in the group hint and in the cap
  message is the same number the server enforces.
- **GAL-9: green.** The caption and the alt are both refused server-side, and the alt refusal is
  re-proved with scripting switched off, which is the only version the Deklaracja dostępności
  can rest on.
- **GAL-10: HONESTLY UNPROVEN, and deliberately not claimed.** `05-VALIDATION.md` proposes
  promoting it out of the unrun E5 tier by removing a seed photo through the panel and asserting
  the file survives. **That promotion is vacuous in this harness:** `preview:test` binds
  `PANEL_DRY_RUN=1`, so no save in any Playwright test ever deletes a file, and the assertion
  would pass whatever the ownership rule did. What exists instead:
  - the four ownership conditions are pinned in `tests/admin-walidacja-galeria.unit.ts`,
    including the explicit case that **both** seed filenames are undeletable under every
    combination of the other three inputs, and under a stored path as well as a bare basename
    (E5, the unrun tier);
  - an acceptance criterion asserts the route derives its deletion set through
    `zdjecieGaleriiDoUsuniecia` and through no other path, so there is no second route from a
    stored filename to a deletion;
  - the property is carried into `05-VERIFICATION.md` as honestly unproven, in the style the
    project already uses for FORM-01 and FORM-02, and into the live UAT.
- **GAL-11: LIVE ONLY and NOT claimed here.** An editor's photograph appearing publicly needs a
  real commit, a real Pages build and a real two-minute wait. Under the dry-run flag no commit
  exists to inspect, and a spec that mocked it would assert its own mock.
- **ENUM-1 and ENUM-3: green** with the new screen, nine nav labels and sixteen swept routes.
- **REG-1: re-proved.** `tests/admin-strony.spec.ts` passes with the file unchanged after three
  new opt-in props landed on the shared component.

**Deferred to the Phase 6 launch gate, carried forward rather than dissolved.** Two, and nothing
in this plan's acceptance evidence depends on either:

- **the HEIC decode path** (04.1 UAT row B2). The accepted upload types are the three the
  existing allowlist already carries (jpeg, png, webp). HEIC is deliberately absent from it and
  works only because a browser decodes it before upload, which is precisely the leg no test has
  exercised live. The input for closing it does not exist: there is no live photography from the
  żłobek yet;
- **the stale-save conflict panel** (04.1 UAT row B4). Reused verbatim, and no gallery behaviour
  depends on that leg behaving a particular way.

**CMS-01, CMS-02 and CMS-03 are NOT ticked by this plan and are not ticked by this phase**
(D-36). **GALLERY-02 stays UNMARKED** until GAL-11 closes at the live UAT, following the
CMS-01 / RECRUIT-03 / FORM-01 precedent.

## The interval this plan opens, and the instruction that goes with it

Between this plan and plan 05-07 the panel briefly carries **two photo screens**: `/admin/o-nas`
still owns the facility photographs that `/o-nas` renders, and `/admin/galeria` writes a store
the public page does not read yet. That is one wave inside one phase execution, and it is the
lesser of the two available intermediate states: the alternative ordering would remove photo
editing entirely for the same interval.

**Do not invite an editor into the panel between plan 05-06 and plan 05-07, and do not run any
live UAT until plan 05-08 has landed.** The phase's live UAT is scheduled once, at the end, at a
budget of three saves and one rebuild wait.

## Deviations from Plan

### 1. [Rule 2 - Missing critical functionality] A third opt-in prop, `notaPusta`

- **Found during:** task 2, writing the copy block.
- **Issue:** the `/admin/galeria` Copywriting Contract names an **empty-group note**
  („Nie ma jeszcze żadnych zdjęć. Kliknij Dodaj zdjęcie, aby dodać pierwsze."), and
  `PowtarzalnaGrupa` had no way to render one. The plan's action names only two new props. An
  exported copy string with no caller would have been a stub, and an empty repeated group with
  no sentence reads as a screen that failed to load. The state is reachable: an editor who
  removes both photographs is in it.
- **Fix:** one more optional prop, unset by default and rendering nothing when absent, on
  exactly the same terms as the other two. The three existing mount sites are unaffected, which
  `tests/admin-strony.spec.ts` re-proves unchanged.
- **Files:** `src/lib/components/admin/PowtarzalnaGrupa.svelte`, `src/lib/content/panel.ts`
- **Commit:** `a520ab1`

### 2. [Rule 1 - Bug] Two sentences in the staff manual were false

- **Found during:** task 3, reading `## 7` and `## 8` before adding the Galeria section.
- **Issue:** the manual said „Kolejności wartości i zdjęć nie da się w tej chwili przestawiać"
  (section 7) and „Kolejności wierszy nie da się w tej chwili przestawiać" (section 8). Plan
  05-04 shipped the move buttons on both of those lists and did not update the manual, so both
  sentences describe a shipped screen incorrectly. Leaving them while adding a Galeria section
  that documents the same buttons would have made the document contradict itself.
- **Fix:** both rewritten to name the two buttons. Section 7 keeps the true half of the old
  sentence: the **wartości** group deliberately opted out and still cannot be reordered.
- **Files:** `docs/instrukcja-cms.md`
- **Commit:** `67d908f`

### 3. [Judgement] Two acceptance greps as written were not satisfiable, and why

- **`grep -c 'PROPORCJA_O_NAS' src/routes/admin/galeria/+page.svelte` is `2`, not `1`.** The
  minimum reachable value is two: the named import and the one mount that uses it. The property
  the criterion guards holds exactly as intended: the existing 4:3 constant is used UNCHANGED
  and `src/lib/zdjecia.ts` is unmodified, both of which are asserted above.
- **`grep -c 'MAKS_ELEMENTOW' src/lib/pola-strony.ts` had to be repaired.** The first draft of
  the `MAKS_ZDJEC_GALERII` doc comment named `MAKS_ELEMENTOW` to explain the difference, which
  moved the count from 2 to 3 and would have made the criterion permanently red. The comment
  now DESCRIBES the work bound rather than naming it, following the repository rule recorded at
  04-02: a comment explaining a constraint must not make the grep enforcing it report a
  permanent false positive. The same rule sent the two `import.meta.glob` mentions out of
  `src/lib/zdjecia-nazwy.ts`.
- **Commit:** `a520ab1`

### 4. [Judgement] The „Photo field label `Zdjęcie *`" row of the copy table has no new string

- **Issue:** Contract 8's copy table lists a photo field label. The photo island already
  authors its own visible label for the native file control (`KOPIA_ZDJECIA.wybierzEtykieta`,
  „Wybierz zdjęcie") and the item's numbered legend is `legendaZdjecia` („Zdjęcie {n}"), both
  shared with `/admin/o-nas`.
- **Decision:** no third „Zdjęcie" label was added. That declaration's own comment records why
  a label authored beside a legend saying the same word is forbidden: it announces the same
  words twice to a screen-reader user. Recorded in a comment on `POLA_GALERIA`.

### 5. [Judgement] `istniejaceNazwy` now globs WITHOUT the enhanced query

- The plan's action directs this and gives the reason: the server reads only the KEYS, so
  asking the image optimizer for processed picture objects pulls work and bytes nobody reads
  into the Worker bundle. The glob PATTERN is unchanged character for character, so the accepted
  extension set cannot drift. Verified by `npm run build` and by `tests/o-nas.spec.ts` and
  `tests/admin-strony.spec.ts` passing with both files unchanged.

## Notes

- **The `svelte` MCP server was unreachable**, as it has been for every executor in this phase;
  `svelte-autofixer` was absent from the tool list. The equivalent gate was run instead:
  `npm run check` includes `svelte-check`'s compiler accessibility pass and reported 0 errors
  and 0 warnings across 4390 files after every task, and both axe scans on the new screen are
  clean, so the loss is a lint-quality one rather than a coverage one.
- **`node_modules` was absent in this worktree** and was symlinked to the parent checkout's, the
  same intervention plans 05-03, 05-04 and 05-05 made. It is gitignored: nothing was committed
  for it and no dependency moved.
- **The deferred double-asterisk defect (`D-05-05-A`) was NOT fixed.** The new screen follows the
  existing convention rather than being the one screen spelled differently.

## Known Stubs

None. Every export this plan added has a live caller and a live test.

`src/lib/content/galeria.json` carries `"placeholder": true` and its two photographs are the
existing seed images. That is 05 D-14 working as designed, not a stub: the real consented photo
set lands at the Phase 6 launch gate, which already runs the placeholder sweep. No acceptance
evidence in this plan requires a real photograph of a child (D-37); the Playwright suite reuses
a picture that is already committed rather than adding a new one to a public repository.

## Threat register outcomes

| Threat ID | Outcome |
|---|---|
| T-05-06-01 (path traversal via a caption) | The name is GENERATED from the caption through `slugAscii`, bounded, prefixed, and checked against the admissible-basename allowlist. A case drives six hostile captions (`../../etc/passwd`, `%2e%2e%2f`, a Polish caption with typographic quotes) and asserts every generated name matches the class. Two-pass reservation proven for identical captions in one save. |
| T-05-06-02 (deleting a file another page renders) | Four conditions REPRODUCED, not parameterised. Still-used list includes the aktualności covers. Both seeds proven undeletable under every input combination. **Residual recorded, not claimed:** the property lives in the unrun E5 tier and the proposed browser promotion is vacuous under the dry-run harness. |
| T-05-06-03 (index injection) | `zbierzIndeksowane` and `indeksZadania` reused unchanged for the add, the remove and both moves. No second bounding function written. |
| T-05-06-04 (stale-save overwrite) | Head-SHA refusal and its Polish conflict panel reused verbatim; the SHA travels in the FORM on every one of the five actions. No gallery behaviour depends on that leg. |
| T-05-06-05 (stored XSS through editor prose) | Caption and alt are plain text, not markdown; the panel renders them into a control's value and the public consumer will render them as text and as an attribute. No raw HTML path exists. |
| T-05-06-06 (upload abuse) | Existing allowlist and size cap reused unchanged, base64 passed through with no server-side decode. The twelve cap bounds one submission's total. |
| T-05-06-07 (auth bypass) | Gated by layout inheritance; the spec asserts BOTH the GET and the POST redirect to logowanie without a session. No `+server.ts` under `/admin`; `static/admin` does not exist. |
| T-05-06-08 (RODO / wizerunek) | Placeholder-flagged store, environment-only seed images, no new picture committed for a test, and no acceptance criterion requiring real photography. |
| T-05-06-09 (build ceiling) | Accepted as planned. One „Zapisz" for the whole list; the screen asserts exactly one save button. |
| T-05-06-SC (supply chain) | Zero packages installed; `package.json` and `package-lock.json` untouched. |

## For the next plan (05-07)

- `src/lib/content/galeria.json` is the store and `czytajGalerie` plus `galeriaZObrazami` are
  the readers. The drop of an entry whose file is missing already lives in `galeriaZObrazami`,
  so the public section must not re-derive it.
- `obiekt_zdjecia` is still in `o-nas.json` and `/o-nas/+page.svelte` still reads it with no
  guard. Its removal and its readers must land in ONE commit, or `npm run check` fails and the
  prerender throws.
- `/admin/o-nas` still owns the facility photo group. Removing it is 05-07's job, and the manual
  sections 5 and 7 are rewritten in the same commit as the change that falsifies them.
- `docs/instrukcja-cms.md` is now fourteen sections; Galeria is section 8.

## Self-Check: PASSED

Files asserted present on disk: `src/lib/zdjecia-nazwy.ts`, `src/lib/content/galeria.json`,
`src/lib/galeria.ts`, `src/lib/server/admin/walidacja/galeria.ts`,
`src/routes/admin/galeria/+page.server.ts`, `src/routes/admin/galeria/+page.svelte`,
`tests/admin-walidacja-galeria.unit.ts`, `tests/admin-galeria.spec.ts`,
`docs/instrukcja-cms.md`.

Commits asserted present in `git log`: `e275bfa` (task 1), `a520ab1` (task 2), `67d908f`
(task 3).
