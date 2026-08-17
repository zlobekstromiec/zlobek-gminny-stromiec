---
phase: 05-gallery-fees
plan: 04
subsystem: panel-redakcyjny
tags: [powtarzalna-grupa, kolejnosc, dostepnosc, bez-skryptow, wspoldzielony-komponent]
status: complete
requires:
  - PowtarzalnaGrupa.svelte (04.1-09)
  - ZadanieFokusu i indeksZadania w src/lib/pola-strony.ts (04.1-09)
  - Przycisk.svelte (04.1-03)
  - tests/fixtures/admin.ts (04.1-01)
provides:
  - AKCJA_PRZENIESIENIA_W_GORE / AKCJA_PRZENIESIENIA_W_DOL
  - trzeci wariant ZadanieFokusu (cel 'przenies') + typ KierunekPrzeniesienia
  - opt-in propsy kolejnosci w PowtarzalnaGrupa (obie galezie wlasnaRamka)
  - prop wylaczone w Przycisk.svelte
  - KOPIA_ZAPIS.przeniesWGore / przeniesWDol / notaGrupyZKolejnoscia
  - nazwaPrzeniesieniaWGore / nazwaPrzeniesieniaWDol / przeniesionoWiersz
affects:
  - /admin/o-nas (grupa zdjec opt-in, grupa wartosci celowo opt-out)
  - /admin/plan-dnia (grupa wierszy opt-in)
  - plan 05-06 (/admin/galeria dziedziczy galaz wlasnaRamka juz udowodniona)
tech-stack:
  added: []
  patterns:
    - opt-in propsy z bajtowo identycznym domyslnym renderem (precedens wlasnaRamka)
    - snippet renderowany w obu galeziach zamiast skopiowanej markup
    - pelna nazwa dostepna w spanie visually-hidden, widoczny czasownik aria-hidden
    - expect.poll dla golego odczytu DOM po rundzie use:enhance
key-files:
  created: []
  modified:
    - src/lib/pola-strony.ts
    - src/lib/content/panel.ts
    - src/lib/components/admin/PowtarzalnaGrupa.svelte
    - src/lib/components/admin/Przycisk.svelte
    - src/routes/admin/o-nas/+page.server.ts
    - src/routes/admin/o-nas/+page.svelte
    - src/routes/admin/plan-dnia/+page.server.ts
    - src/routes/admin/plan-dnia/+page.svelte
    - tests/admin-strony.spec.ts
    - tests/admin-copy.unit.ts
decisions:
  - Jedna nieoznaczona para nazw akcji dla obu ekranow, bo kolejnosc wlacza dokladnie jedna lista na ekran
  - Notatka grupy i ogloszenie uzywaja rodzajowego rzeczownika „wiersz", nie „zdjecie"; wariant galerii to prop planu 05-06
  - Rzad przyciskow to snippet renderowany w obu galeziach, nie zdublowana markup
  - GALLERY-02 pozostaje NIEODHACZONE: ekran galerii jeszcze nie istnieje
metrics:
  duration: 24min
  completed: 2026-08-17
  tasks: 3
  files: 10
  commits: 3
---

# Phase 5 Plan 04: Zmiana kolejnosci w powtarzalnej grupie - Summary

Reordering, keyboard operable and working with scripting switched off, added to
`PowtarzalnaGrupa` as six opt-in props and proven on both branches of its `wlasnaRamka`
split before the gallery that needs it exists.

## What was built

An editor on `/admin/o-nas` can now move a facility photograph up or down, and an editor on
`/admin/plan-dnia` can do the same to a day-plan row. Both work with a keyboard, both work
with JavaScript switched off, and neither commits anything until „Zapisz". Repeated presses
keep working because focus follows the button that performed the move to the item's new
position, with a deterministic fallback to the opposite-direction button when the item
reaches an end.

The `wartości` group on `/admin/o-nas` deliberately opts out and is the live regression
subject: a test counts zero move buttons inside it.

## Task-by-task

### Task 1 — failing tests (commit `a3462b8`)

Ten cases added to `tests/admin-strony.spec.ts`, five per screen: button names, disabled end
states, the swap plus its announcement, two consecutive moves driven by the keyboard, and a
`javaScriptEnabled: false` path per screen. Plus the wartości opt-out regression case.

**RED was observed twice and recorded rather than banked on its own**, following the
precedent recorded in `STATE.md` from 04.1-02: this repository's pre-commit gate runs
`svelte-check` over the whole working tree, so a test importing a not-yet-written export is
a type error that refuses every commit.

1. **Module-level RED.** With the copy exports absent, Playwright refused to load the spec:
   `SyntaxError: The requested module '../src/lib/content/panel' does not provide an export
   named 'nazwaPrzeniesieniaWDol'`, and `svelte-check` reported **9 errors in 1 file**, all
   in `tests/admin-strony.spec.ts`.
2. **Behavioural RED**, after the copy exports landed in the same commit so the tree was
   type-clean: `10 failed, 30 passed`. Every failure was one of the ten new cases and **not
   one pre-existing test in the file changed or broke**. The wartości opt-out case passed
   before and after, which is what a regression guard is supposed to do.

The copy exports were pulled into this commit precisely so the RED could be a real,
observable, committable red rather than a build break. They are contract, not implementation:
the tests locate every button by the accessible name those functions compose.

### Task 2 — vocabulary, component, O nas (commit `0f85eaf`)

- **`src/lib/pola-strony.ts`**: `AKCJA_PRZENIESIENIA_W_GORE` / `..._W_DOL`, a third
  `ZadanieFokusu` variant `{ cel: 'przenies'; indeks; kierunek }` and the
  `KierunekPrzeniesienia` type. `indeksZadania` reused **unchanged**; its doc comment now
  records that the move actions depend on it for the same T-04.1-34 mitigation.
- **`src/lib/content/panel.ts`**: the two verbs and the reorder-aware group note inside
  `KOPIA_ZAPIS`, plus `nazwaPrzeniesieniaWGore`, `nazwaPrzeniesieniaWDol` and
  `przeniesionoWiersz(numer, pozycja)`. All three new exports joined `EKSPORTY` in
  `tests/admin-copy.unit.ts` in the same commit; the export-count assertion is green.
- **`PowtarzalnaGrupa.svelte`**: the „reordering is out of scope" paragraph rewritten into
  the new opt-in rule (dragging stays out of scope, with its reason). Six optional props, a
  derived `przenoszenie` object that makes a half-configured mount inexpressible, the button
  row rendered in **both** branches of the `wlasnaRamka` split, and a new focus-effect branch
  that finds the move button by its `formaction` and falls back to the opposite direction
  when the item's own button has become disabled. The typeable-control selector and the two
  existing effect branches are untouched.
- **`/admin/o-nas`**: `przeniesWGore` / `przeniesWDol` actions over the photo list, both
  through one helper so the two directions cannot drift by a sign. Head SHA taken from the
  **form**, never from the load. The wartości mount left exactly as it was.

### Task 3 — plan dnia and the full regression surface (commit `7263e10`)

The same two actions mirrored onto the rows list using `wartosciPlanuDnia`, and the six props
passed to that mount. This is the mount that exercises the `{:else}` `<fieldset class="element">`
branch, so between the two tasks both branches carry the button row and both are covered.

`src/lib/pola-strony.ts`, `src/lib/content/panel.ts` and `PowtarzalnaGrupa.svelte` were **not
touched** in this task: the props from task 2 generalised without a gap.

## The three mount sites, by file and branch

Inherited by plan 05-06 rather than re-derived (`05-RESEARCH.md` C-1 confirmed: two screens,
three sites, not four screens).

| # | Mount | `wlasnaRamka` | Branch it renders | Reordering |
|---|---|---|---|---|
| 1 | `src/routes/admin/o-nas/+page.svelte:258` (wartości) | `false` (absent) | `<fieldset class="element">` (`PowtarzalnaGrupa.svelte:293`) | **opted OUT**, live regression subject |
| 2 | `src/routes/admin/o-nas/+page.svelte:370` (zdjęcia) | `true` (`:389`) | `<div class="element">` (`PowtarzalnaGrupa.svelte:278`) | opted in |
| 3 | `src/routes/admin/plan-dnia/+page.svelte:172` (wiersze) | `false` (absent) | `<fieldset class="element">` (`PowtarzalnaGrupa.svelte:293`) | opted in |

**Site 2 is the branch the gallery of plan 05-06 will use.** It is now proven by a live
screen and six live tests, which was the entire point of doing this before the gallery
exists.

## Deviations from Plan

### 1. [Rule 3 - Blocking] A standalone RED commit is impossible in this repository

- **Found during:** Task 1
- **Issue:** The plan asks for the failing tests as their own commit. `.pre-commit-config.yaml`
  runs `npm run check`, which is `svelte-check` over the whole tree including `tests/`, so a
  spec importing a not-yet-written export refuses the commit. `--no-verify` was deliberately
  not used, matching the 04.1-02 precedent.
- **Fix:** The three copy exports the tests locate buttons by were moved from task 2 into the
  task 1 commit. That keeps the tree type-clean while leaving the behaviour genuinely
  unimplemented, so the RED commit is a real red (`10 failed, 30 passed`) rather than a build
  break. Both stages of RED are recorded above.
- **Files:** `src/lib/content/panel.ts`, `tests/admin-copy.unit.ts` (moved earlier by one commit)
- **Commit:** `a3462b8`

### 2. [Rule 2 - Missing critical functionality] `Przycisk` had no plain disabled state

- **Found during:** Task 2
- **Issue:** `Przycisk.svelte` is not in the plan's file list, but its only disabled state is
  `zajete`, which also emits `aria-busy="true"`. `05-UI-SPEC` Contract 9 requires the move
  buttons at the two ends of a list to be **rendered and disabled**. Reusing `zajete` would
  have told a screen reader that a permanently unavailable button is being updated.
- **Fix:** A `wylaczone` prop, default `false`, folded into `disabled` and deliberately not
  into `aria-busy`. Every existing call site renders byte-identically.
- **Files:** `src/lib/components/admin/Przycisk.svelte`
- **Commit:** `0f85eaf`

### 3. [Rule 1 - Bug] The new order assertions raced the enhanced round trip

- **Found during:** Task 2
- **Issue:** `nazwyZdjec` / `kolejnoscGodzin` are plain `evaluateAll` reads, not web-first
  assertions, so they do not retry. Called straight after a click they answered with the
  order the page had **before** `use:enhance` came back. Two O nas cases failed for that
  reason with the implementation already correct; the no-scripting cases hid the problem
  because there the click is a real navigation Playwright waits for.
- **Fix:** Every post-action order assertion reads through `await expect.poll(...)`, and both
  helpers carry a comment saying why.
- **Files:** `tests/admin-strony.spec.ts`
- **Commit:** `0f85eaf`

### 4. [Rule 1 - Bug] A pre-existing assertion named the group note that plan dnia no longer renders

- **Found during:** Task 3
- **Issue:** `tests/admin-strony.spec.ts:289` asserted `KOPIA_ZAPIS.notaGrupy` is visible on
  `/admin/plan-dnia`. Opting that list into reordering necessarily switches its note to
  `notaGrupyZKolejnoscia`, so the full suite went red at `311 passed, 1 failed`.
- **Fix:** The assertion now names the reorder-aware note. Its intent (a permanent note
  saying nothing was saved) is unchanged and not weakened. Keeping the old note on the screen
  was rejected as the alternative: a list that can be reordered but promises only that adding
  and removing are unsaved tells an editor two thirds of the truth.
- **Consequence:** task 3's acceptance criterion „`git diff --name-only` lists only the two
  plan-dnia files" is **not literally satisfiable**. The third file is `tests/admin-strony.spec.ts`
  and the change is one string plus its comment.
- **Files:** `tests/admin-strony.spec.ts`
- **Commit:** `7263e10`

### 5. [Judgement] The button row is a snippet rendered in both branches, not duplicated markup

- **Found during:** Task 2
- **Issue:** The plan's acceptance asks that the button block „occur once inside the
  `<div class="element">` branch and once inside the `<fieldset class="element">` branch".
- **Decision:** `{@render przyciskiKolejnosci(indeks)}` occurs once in each branch and the
  markup is authored once. Copying twenty lines into both branches would reintroduce exactly
  the drift this plan exists to prevent (the two branches differing is `05-RESEARCH` Pitfall 1
  itself). Both branches render the row, which is the property under test, and both are
  covered by a live screen and live tests.
- **Files:** `src/lib/components/admin/PowtarzalnaGrupa.svelte`

### 6. [Judgement] The group note and the announcement use the generic noun

- **Issue:** `05-UI-SPEC`'s Copywriting Contract spells both with the photo noun
  („przeniesienie zdjęcia", „Przeniesiono zdjęcie {n}"). That table is the `/admin/galeria`
  screen's, and the plan-dnia rows are not photographs.
- **Decision:** Both use „wiersz", matching the register the shipped `notaGrupy`,
  `dodanoWiersz` and `usunietoWiersz` already use on all three groups including the photo
  one. Both surfaces are **props**, so plan 05-06 adds the gallery's photo-noun variants
  beside these and passes them from that screen. Recorded in a comment at both call sites in
  `panel.ts`.

### 7. [Environmental] `node_modules` was empty inside the worktree

- `tests/admin-walidacja-strony.unit.ts` shells out to `node_modules/.bin/prettier` resolved
  from the repository root, which in a worktree is the worktree. Node's own resolution walks
  up to the parent checkout, so `npx` and the build worked while `npm run test:unit` died with
  `ENOENT`. Fixed by symlinking `node_modules/.bin` to the parent checkout's. `node_modules`
  is gitignored, so nothing was committed and no dependency moved.

## MCP note

The `svelte-autofixer` MCP tool was **not reachable** from this executor (the documented
upstream bug that strips MCP tools from agents with a restricted tool list). The equivalent
gate was run instead: `npm run check` includes `svelte-check`'s compiler accessibility pass
and reported **0 errors, 0 warnings across 4361 files** after every task.

## Verification

| Gate | Result |
|---|---|
| `npm run check` | 0 errors, 0 warnings, 4361 files |
| `npm run lint` | prettier clean, eslint clean |
| `npm run test:unit` | **499 pass, 0 fail** (typed by hand; nothing automated runs this tier) |
| `npm run build` | success |
| `npm run test` (FULL suite, not a subset) | **312 pass, 0 fail** |

Acceptance greps:

- `grep -c 'wlasnaRamka' PowtarzalnaGrupa.svelte` = `4` (>= 2 required)
- typeable-control selector: **byte-identical**, and its identifier count is `2`, unchanged
  from before this plan. The comment that explains why the reorder could not go through it
  describes it rather than naming it, following the repository rule recorded in 04-02 about
  comments that would make an enforcing grep report a permanent false positive.
- `grep -c "locator('.przenies" tests/admin-strony.spec.ts` = `0`; every new button locator is
  `getByRole('button', { name: ... })`.
- `git diff --name-only -- package.json package-lock.json` = **empty**. Zero packages
  installed; `@lucide/svelte` was already a dependency and the two icons use the existing
  `@lucide/svelte/icons/<name>` import form. Threat T-05-04-SC satisfied.

## Threat register outcomes

| Threat ID | Outcome |
|---|---|
| T-05-04-01 (index injection) | `indeksZadania` reused unchanged; both move helpers bound the submitted index against the dense array built from the fields that arrived, then refuse when the target falls outside the list. No second bounding function written. |
| T-05-04-02 (stale-save baseline drift) | Both helpers return `shaZFormularza(dane)`; neither reads the load. No move behaviour depends on the conflict path (D-37 isolation held). |
| T-05-04-03 (keyboard operability) | Focus lands on the move button at the new position, falling back to the opposite direction at a list end. Asserted by two cases that press **Enter on whatever has focus** rather than locating the button again, which is the only assertion a wrong focus target actually fails. |
| T-05-04-04 (silent regression) | All props opt-in with byte-identical defaults; wartości group left opted out and asserted at zero move buttons; full Playwright suite run, not the edited specs. |
| T-05-04-05 (privilege) | Accepted as planned. Two named actions on existing routes; no `+server.ts` under `/admin`. |
| T-05-04-SC (supply chain) | Zero packages installed; `package.json` and `package-lock.json` untouched. |

## Requirements

**GALLERY-02 stays UNMARKED**, deliberately, following the CMS-01 / RECRUIT-03 / FORM-01
precedent. It reads „Staff can add and remove gallery photos via the CMS" and `/admin/galeria`
does not exist yet; this plan shipped reordering on two screens that already existed. Plan
05-06 closes it.

## Known Stubs

None. Every prop this plan added has a live caller and a live test, which is why the twelve
photo **cap** (D-23) was deliberately left out: it has no consumer until `/admin/galeria`
exists and would have been an untested opt-in prop in a shared component. It lands in plan
05-06 with the screen that sets it.

## For the next plan (05-06)

- The `wlasnaRamka` branch is site 2 in the table above and it already carries the button row.
  Do not re-derive the map.
- Add the gallery's photo-noun variants of the group note and the move announcement to
  `panel.ts`, join `EKSPORTY`, and pass them as props from `/admin/galeria`. Both `panel.ts`
  call sites carry a comment saying so.
- The `limit` prop and its cap message are yours, together with the screen that sets them.
- Add `/admin/galeria` to `TRASY` in `tests/admin-polski.spec.ts`. A panel screen absent from
  that array has no Polish coverage at all (`05-RESEARCH` Pitfall 5).

## Self-Check: PASSED

- `src/lib/components/admin/PowtarzalnaGrupa.svelte` — FOUND
- `src/lib/pola-strony.ts` — FOUND
- `src/lib/content/panel.ts` — FOUND
- `src/routes/admin/o-nas/+page.server.ts` — FOUND
- `src/routes/admin/plan-dnia/+page.server.ts` — FOUND
- `tests/admin-strony.spec.ts` — FOUND
- commit `a3462b8` — FOUND
- commit `0f85eaf` — FOUND
- commit `7263e10` — FOUND
