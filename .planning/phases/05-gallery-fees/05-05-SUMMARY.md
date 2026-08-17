---
phase: 05-gallery-fees
plan: 05
subsystem: panel-redakcyjny
tags: [cennik, walidacja, enumeracja-ekranow, instrukcja, bez-skryptow, dostepnosc]
status: complete
requires:
  - src/lib/cennik.ts i src/lib/kwoty.ts (05-02)
  - src/lib/content/cennik.json (05-02)
  - src/lib/server/admin/zapis.ts + serializuj.ts + walidacja/pola.ts (04.1-04, 04.1-05)
  - wzorzec ekranu singletonowego /admin/nabor (04.1-06)
  - FormField, PolePlaceholder, RzedZapisu, PanelKomunikat, PowrotLink (04.1-03)
  - tests/fixtures/admin.ts (04.1-01)
provides:
  - src/lib/sciezki-panelu.ts (SCIEZKI_PANELU, SCIEZKA_STARTOWA)
  - SEKCJE_PANELU w src/lib/content/panel.ts (mapa nazw sekcji, przeniesiona z +layout.server.ts)
  - tests/fixtures/trasy-panelu.ts (TRASY, slugi, WPIS, DOKUMENT)
  - tests/admin-enumeracja.spec.ts (brama enumeracji, cztery przypadki)
  - src/lib/server/admin/walidacja/cennik.ts (walidujCennik, WZORZEC_ZERA, MARKER_ZUS, SCIEZKA_CENNIK, zeroBezWarunku)
  - /admin/cennik (+page.server.ts, +page.svelte)
  - POLE_STAWKI ... POLE_NIEOBECNOSCI, WartosciCennika, wartosciCennika w src/lib/pola-strony.ts
  - KOPIA_CENNIK, POLA_CENNIK, obecnieNaStronie, piec nowych komunikatow w KOPIA_WALIDACJA
  - sekcja 9 „Cennik" w docs/instrukcja-cms.md
affects:
  - src/lib/components/admin/PanelNawigacja.svelte (SCIEZKI wyprowadzone do $lib)
  - src/routes/admin/+layout.server.ts (SEKCJE wyprowadzone do modulu kopii)
  - src/routes/admin/+page.svelte (siodmy kafel pulpitu)
  - tests/admin-polski.spec.ts (TRASY wyprowadzone do fixture, 14 -> 15 tras)
  - plany 05-06 i 05-08 (kazdy nowy ekran panelu przechodzi teraz przez brame enumeracji)
tech-stack:
  added: []
  patterns:
    - zbior tras wyprowadzany z systemu plikow zamiast recznie przepisywanej listy
    - wzorzec zakotwiczony na granicy, wyeksportowany, pedzony przez suite zamiast blizniaka
    - niezmiennik miedzypolowy pisany recznie, bo wspolny reader liczby go nie wyraza
    - wartosc tylko do odczytu jako tekst plus podpowiedz, nigdy jako wygaszona kontrolka
    - jedna nazwana akcja zapisu, 303 po zapisie, znacznik zapisu w adresie
key-files:
  created:
    - src/lib/sciezki-panelu.ts
    - src/lib/server/admin/walidacja/cennik.ts
    - src/routes/admin/cennik/+page.server.ts
    - src/routes/admin/cennik/+page.svelte
    - tests/fixtures/trasy-panelu.ts
    - tests/admin-enumeracja.spec.ts
    - tests/admin-walidacja-cennik.unit.ts
    - tests/admin-cennik.spec.ts
    - .planning/phases/05-gallery-fees/deferred-items.md
  modified:
    - src/lib/content/panel.ts
    - src/lib/pola-strony.ts
    - src/lib/components/admin/PanelNawigacja.svelte
    - src/routes/admin/+layout.server.ts
    - src/routes/admin/+page.svelte
    - tests/admin-copy.unit.ts
    - tests/admin-polski.spec.ts
    - tests/admin-pulpit.spec.ts
    - tests/instrukcja.unit.ts
    - docs/instrukcja-cms.md
decisions:
  - Brama enumeracji wyprowadza zbior tras z src/routes/admin na dysku, nigdy z drugiej recznej listy
  - Wzorzec kwoty zerowej jest zakotwiczony na granicy cyfry i wyeksportowany, bo dosłowne szukanie „0 zł" lapie „1 500 zł" (pulapka 04-06)
  - Niezmiennik obnizka < stawka jest pisany recznie: liczbaWZakresie bierze niezalezne granice na pole i nie widzi drugiego pola
  - Kwota do zaplaty jest TEKSTEM pokazujacym stan zapisany, z podpowiedzia mowiaca to wprost; sledzenie na zywo wymagaloby JavaScriptu na ekranie, ktory go nie potrzebuje
  - Kafel Cennik na pulpicie celowo bez linii stanu (05-UI-SPEC Contract 12)
  - Podwojna gwiazdka przy polach wymaganych to defekt starszy od tej fazy; odlozony do deferred-items.md zamiast naprawiany tutaj
  - CMS-01, CMS-02 i CMS-03 pozostaja NIEODHACZONE (D-36)
metrics:
  duration: dwie sesje
  completed: 2026-08-17
  tasks: 3
  files: 19
  commits: 3
---

# Phase 5 Plan 05: /admin/cennik za brama enumeracji ekranow - Summary

An editor can now change every fee amount and every fee sentence at `/admin/cennik`, save
once, and get one commit and one Cloudflare build; and adding a panel screen without editing
all four enumeration surfaces is, from this plan onwards, permanently impossible to do
quietly.

## Executed across two sessions

**This plan was executed in two sessions.** The first executor was killed mid-flight by a
provider session limit, not by any code failure: task 1 was complete and committed
(`c25e4a5`), task 2 was written but uncommitted, unformatted and never once compiled or run,
and its two test files did not exist at all. Task 3 had not started.

The second session treated the uncommitted task 2 code as an untrusted draft by a previous
author: it was read against the plan's task 2 specification and its `read_first` list before
anything was run. What the audit found is recorded under „Deviations" below. The two missing
test files were written from the plan's `<behavior>` list rather than from the draft, so the
suite is not a description of whatever the draft happened to do.

## What was built

### Task 1 (inherited, `c25e4a5`) — the enumeration gate

Three extractions and one new spec, deliberately GREEN against the panel as it stood:

- `SCIEZKI` moved out of `PanelNawigacja.svelte` into `src/lib/sciezki-panelu.ts`, so the
  index alignment with `NAWIGACJA` became importable and therefore assertable;
- `SEKCJE` moved out of `+layout.server.ts` (which SvelteKit forbids from exporting it) into
  `src/lib/content/panel.ts` as `SEKCJE_PANELU`, and joined `EKSPORTY`;
- `TRASY`, the on-disk slug helper and the two seed slugs moved into
  `tests/fixtures/trasy-panelu.ts`, importable by two suites and outside Playwright's spec
  matcher;
- `tests/admin-enumeracja.spec.ts`: four cases that walk `src/routes/admin` with `node:fs`
  and assert every static route is in the Polish sweep list, that `SCIEZKI_PANELU` and
  `NAWIGACJA` are the same length with every entry answering 200 under the authenticated
  fixture, that every route's first segment has a section-title entry, and that the pulpit
  reaches every navigable section.

All four passed on landing, so no pre-existing enumeration defect was found.

### Task 2 (`6613be3`) — `/admin/cennik`, with all four surfaces in one commit

- **`src/lib/server/admin/walidacja/cennik.ts`.** Both amounts through `liczbaWZakresie`
  (whole złoty, 0 to 9999, digit shape checked before the parse), plus the two rules that
  reader cannot express: the cross-field invariant `obnizka < stawka` (strictly, so an equal
  pair cannot publish „0 zł" as the fee itself), and the conditional-zero rule of D-31. The
  zero pattern `(?<!\d)0(?!\d)\s*zł` and the benefit-name marker are exported as named
  constants, so the unit suite drives the exact values the validator uses rather than a twin
  that would agree on the day it was written. The result is constructed key by key in the
  committed file's order and never spread from the submitted data.
- **`/admin/cennik`.** The `/admin/nabor` template exactly: one flat exported result
  interface every branch satisfies with `satisfies`, a load returning the current values plus
  `aktualnyShaGlowy` plus the saved marker, one NAMED save action, refusal branches in order
  (400 validation, 409 head-SHA conflict, 500 save error with the missing-binding detail
  deliberately unrendered) and a 303 redirect. Nothing logs.
- **The screen.** Two fieldsets with visible legends, seven controls plus the placeholder
  checkbox, a validation summary whose every entry links to the control it is about, and the
  computed payable amount rendered as TEXT with a hint saying it follows the saved values and
  moves only after „Zapisz". No `disabled` and no `readonly` control anywhere.
- **All four enumeration surfaces in the same commit**: the nav paths module, the section
  title map, the pulpit (a written-out card, deliberately with no state line), and `TRASY`.
  `NAWIGACJA` grew from seven labels to eight, `tests/admin-pulpit.spec.ts` from six cards to
  seven and `tests/admin-polski.spec.ts` from fourteen swept routes to fifteen.
- **`tests/admin-walidacja-cennik.unit.ts`** (23 cases) and **`tests/admin-cennik.spec.ts`**
  (16 cases): every refusal branch, the ordered key-set assertion, the byte-for-byte
  serialization pin read from disk, the explicit case proving the four-digit amounts in the
  store do not trip the zero rule, the two axe scans, the three refusal paths with their
  summary anchors, and the `javaScriptEnabled: false` context.

### Task 3 (`f3582ec`) — the staff manual

`docs/instrukcja-cms.md` section 2 now says seven pulpit tiles and lists Cennik between Plan
dnia and Dokumenty. A new numbered section 9 „Cennik" sits where the screen sits in the panel
navigation; sections 10 to 13 were renumbered and the one internal cross-reference (section 1
pointing at the editor-management section) was corrected with them. The section covers what
the screen controls and where a parent sees it, the two amount fields and that they are whole
złoty with no grosze, the computed amount and why it moves only after saving, and why the ZUS
field may never be emptied. Every screen name, label and both refusals are quoted VERBATIM
from `src/lib/content/panel.ts`.

`tests/instrukcja.unit.ts` gained a required-heading entry for Cennik, twelve labels in the
verbatim-quote sweep, a raised minimum heading count, and a new case asserting the manual
explains the screen's three refusals in the panel's own words.

## TDD gates: what was observed and what could not be banked

Task 2 is marked `tdd="true"`. **No RED commit was banked, and no RED was observed for the
validator either.** Both facts need stating plainly:

1. The structural constraint this repository already hit at 04.1-02, 05-02 and 05-04 applies:
   pre-commit runs `svelte-check` across the whole tree and `tsconfig.json` covers `tests/`,
   so a test importing a not-yet-written module is a TYPE ERROR and a failing-test commit
   cannot be made without `--no-verify`, which is forbidden.
2. Beyond that constraint, the RED was **unavailable in principle this session**: the
   implementation arrived from the killed first session, already written. Writing a test
   against a module that already exists and already works cannot produce a RED, and
   manufacturing one by deleting the draft would have been theatre.

What was done instead, and is the honest substitute: both test files were written from the
plan's `<behavior>` list and the UI-SPEC contract, NOT from the draft's code, and then run
against the draft for the first time. Every one of the 23 unit cases and 16 browser cases
passed on that first run, which is a statement about the draft's quality, not about the
tests' strictness. Plan 05-03's precedent (a real RED, because its tests were Playwright
specs against an existing route surface) was not reachable here: `/admin/cennik` did not
exist before this plan at all.

## Verification

Full gate, run from the worktree at the end of task 3:

| Gate | Result |
|---|---|
| `npm run check` | 4380 files, 0 errors, 0 warnings |
| `npm run lint` | prettier clean, eslint clean |
| `npm run test:unit` | 540 passed, 0 failed |
| `npm run test` | 346 passed, 0 failed |
| `npm run build` | succeeded; `.svelte-kit/cloudflare` carries no prerendered `/admin/cennik` |

Acceptance greps: `grep -c 'disabled'` on the screen is 0; `grep -c "'$lib"` in the validator
is 0; `grep -c 'console\.'` across the route and the validator is 0; `ls
src/routes/admin/cennik/` has no `+server.ts`; `git diff --name-only -- package.json
package-lock.json` is empty (zero packages installed, T-05-05-SC).

`grep -c '^## ' docs/instrukcja-cms.md` went from 12 to 13, exactly one more, and no claim
about the number of pulpit tiles survives that contradicts the pulpit.

## Validation-map position

- **FEE-7 and FEE-8: green.** `tests/admin-walidacja-cennik.unit.ts` proves the empty-`zus`
  refusal, the `obnizka >= stawka` refusal and the byte-for-byte serialization pin;
  `tests/admin-cennik.spec.ts` is the browser half. FEE-8's E5-only status is mitigated by
  its `npm run lint` twin, as the plan records: a serialization drift fails prettier.
- **FEE-1 to FEE-6: green**, unchanged by this plan and re-run in the full suite above.
- **FEE-9 is LIVE ONLY and is NOT claimed here.** An editor's fee change appearing publicly
  needs a real commit, a real Pages build and a real two-minute wait. The preview harness
  binds `PANEL_DRY_RUN=1`, so no commit exists to inspect, and a spec that mocked it would be
  a spec asserting its own mock. It belongs to the phase UAT.
- **ENUM-1 green** (`tests/admin-enumeracja.spec.ts`), **ENUM-3 green** with `TRASY` extended
  to fifteen routes.

**CMS-01, CMS-02 and CMS-03 are NOT ticked by this plan and are not ticked by this phase.**
They close on the Phase 04.1 UAT (D-36), and this phase proceeds against that formally open
dependency by explicit user decision. The public half of FEES-01 landed in plan 05-02; the
staff half lands here; the closing evidence is FEE-9 and is live-only.

## Deviations from Plan

### Audit of the inherited task 2 draft

The draft was correct on every point the plan's `read_first` list covers. Verified by reading,
then by running: the `/admin/nabor` template is followed exactly, the validator's imports are
relative with `.ts` extensions, the result is constructed key by key in the committed file's
order, the head SHA is taken from the form, nothing logs, no `+server.ts` was created, and the
screen carries no `disabled` control. Two things needed doing:

**1. [Rule 3 - Blocking] The draft was unformatted, so `npm run lint` failed.**
- **Found during:** task 2, first gate run.
- **Issue:** `src/lib/content/panel.ts` and `src/lib/server/admin/walidacja/cennik.ts` did not
  match prettier, which fails `npm run lint` and blocks every commit through pre-commit.
- **Fix:** `npx prettier --write` on both. No semantic change.
- **Commit:** `6613be3`.

**2. [Rule 3 - Blocking] `tests/admin-copy.unit.ts` was half-edited and failed.**
- **Found during:** task 2, first `npm run test:unit`.
- **Issue:** the draft added `KOPIA_CENNIK`, `POLA_CENNIK` and `obecnieNaStronie` to the
  import list and the first two to `EKSPORTY`, but left `obecnieNaStronie` imported and
  unused (an eslint error) and left the nav-order assertion at seven labels (a hard failure,
  since `NAWIGACJA` now has eight).
- **Fix:** `obecnieNaStronie('1 500 zł miesięcznie')` added to `EKSPORTY` in module order, so
  its output is swept for emoji, em dashes and English chrome like every other string; the
  nav-order assertion updated to the eight labels of 05-UI-SPEC Contract 12, with a comment
  recording why the ORDER and not merely the count is asserted.
- **Commit:** `6613be3`.

### Out of scope, logged not fixed

**[Deferred] Every required panel field renders TWO asterisks.**
`FormField.svelte` appends a visible ` *` whenever `wymagane` is set, and every label in
`panel.ts` already ends in a literal ` *` (a convention `tests/admin-copy.unit.ts` actively
asserts). Observed on the live preview: `"Wprowadzenie **\n(pole wymagane)"` on `/admin/o-nas`,
shipped since 04.1, and the same on the new screen. The accessible name is unaffected and axe
is clean, so it is cosmetic. It is older than this phase, the correct fix touches a component
every public form also uses, and the new screen deliberately follows the existing convention
rather than being the one screen spelled differently. Recorded with all three candidate fixes
in `.planning/phases/05-gallery-fees/deferred-items.md`.

## Notes

- **The `svelte` MCP server was unreachable**, as it has been for every executor in this
  phase. `svelte-autofixer` was absent from the tool list. `npm run check` runs svelte-check,
  which covers types plus the compiler's a11y warnings, and both axe scans on the new screen
  are clean, so the loss is a lint-quality one rather than a coverage one.
- **`node_modules` needed no intervention** in this worktree: it was a real directory with the
  repository's own prettier binary present, which the unit suite's serialization twin needs.
- No packages were installed and no dependency moved.

## Self-Check: PASSED

Files asserted present on disk: `src/lib/sciezki-panelu.ts`,
`src/lib/server/admin/walidacja/cennik.ts`, `src/routes/admin/cennik/+page.server.ts`,
`src/routes/admin/cennik/+page.svelte`, `tests/fixtures/trasy-panelu.ts`,
`tests/admin-enumeracja.spec.ts`, `tests/admin-walidacja-cennik.unit.ts`,
`tests/admin-cennik.spec.ts`, `docs/instrukcja-cms.md`,
`.planning/phases/05-gallery-fees/deferred-items.md`.

Commits asserted present in `git log`: `c25e4a5` (task 1, inherited from session one),
`6613be3` (task 2), `f3582ec` (task 3).
