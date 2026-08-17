---
phase: 05-gallery-fees
plan: 09
subsystem: content-store + editorial-panel
tags: [w-skrocie, godziny-otwarcia, keyfacts, panel, placeholder-gate, validation-ledger]
requires:
  - src/lib/cennik.ts (05-02) — the validated fee view the fee tile reads
  - src/lib/sciezki-panelu.ts + tests/admin-enumeracja.spec.ts (05-05) — the enumeration gate
  - src/routes/admin/cennik/ (05-05) — the singleton-screen template mirrored here
  - src/lib/content/galeria.json (05-06) — the placeholder-flag convention the inventory sweeps
  - src/lib/components/Footer.svelte (05-07) — the footer this plan re-sources
provides:
  - src/lib/content/w-skrocie.json — the hours atoms, the places count, two per-tile placeholder flags
  - src/lib/godziny.ts — the hours composer, one function per surface string
  - src/lib/w-skrocie.ts — the four-tile reader plus the code-authored icon and tint slot table
  - src/lib/server/admin/walidacja/w-skrocie.ts — the fixed-arity validator
  - /admin/w-skrocie — the editor screen, reached from a pulpit tile only
  - tests/zastepcze.unit.ts — the executable placeholder inventory the Phase 6 gate consumes
affects:
  - src/lib/content/site.ts (keyFacts and contact.hours are now derived)
  - src/lib/components/KeyFacts.svelte (each block re-keyed by index)
  - src/lib/components/Footer.svelte (three hours lines composed)
  - src/lib/components/TopBar.svelte, ContactAndMap.svelte, /kontakt (via contact.hours)
tech-stack:
  added: none (zero npm packages installed)
  patterns:
    - postFromEntry reader discipline (guard container, narrow each field, construct key by key)
    - code-authored slot table zipped with stored strings by position
    - closed-allowlist validator, absent field is a refusal
    - byte-for-byte serialization pin against the committed store
key-files:
  created:
    - src/lib/content/w-skrocie.json
    - src/lib/godziny.ts
    - src/lib/w-skrocie.ts
    - src/lib/server/admin/walidacja/w-skrocie.ts
    - src/routes/admin/w-skrocie/+page.server.ts
    - src/routes/admin/w-skrocie/+page.svelte
    - tests/zastepcze.unit.ts
    - tests/admin-walidacja-w-skrocie.unit.ts
    - tests/admin-w-skrocie.spec.ts
  modified:
    - src/lib/content/site.ts
    - src/lib/content/panel.ts
    - src/lib/pola-strony.ts
    - src/lib/components/KeyFacts.svelte
    - src/lib/components/Footer.svelte
    - src/routes/admin/+page.svelte
    - docs/instrukcja-cms.md
    - tests/home.spec.ts
    - tests/admin-copy.unit.ts
    - tests/admin-pulpit.spec.ts
    - tests/instrukcja.unit.ts
    - tests/fixtures/trasy-panelu.ts
    - .planning/phases/05-gallery-fees/05-VALIDATION.md
decisions:
  - The hours tile gains NO rendered note, so the homepage renders byte-identically. Contract 7's atom table maps dniPelne to "tile note; Footer line 1"; only the footer line was implemented. See Deviations.
  - The store is nested (godziny{}, miejsca{}) rather than flat, so each per-tile placeholder keeps the project's existing `placeholder` key name and the inventory sweep can find it at any depth.
  - The number of places is stored as a NUMBER, matching cennik.json, so liczbaWZakresie is the natural validator.
  - Fixed arity is enforced STRUCTURALLY (closed allowlist, no index-scoped control) rather than by a count check, because nothing a submission can carry is able to request a fifth tile.
metrics:
  duration: ~1h50m
  completed: 2026-08-17
  tasks: 3
  commits: 3
  files_created: 9
  files_modified: 13
status: complete
---

# Phase 5 Plan 09: W skrócie, the homepage fact tiles and one source for the opening hours — Summary

The żłobek can now change its own opening hours and place count from a panel screen, and the
five surfaces that state the hours are composed from one store instead of three sources.

## What was built

**The reversal of a deferral, not new scope.** Phase 04.1 D-16 deferred the „Ustawienia
strony" work with the words „revisit after Phase 5". The driving fact that brought it back:
the opening hours were a live `PLACEHOLDER` the żłobek could not fix without a developer, and
they lived on FIVE surfaces with THREE sources (the homepage tile, the shared `contact.hours`
object rendered by the top bar, the contact block and `/kontakt`, and a hard-coded literal in
`Footer.svelte`). Making only the tile editable would have let an editor change the hours in
the homepage strip while the footer of that same page still showed the old value. Unifying
the sources was the point; the editor screen is the delivery mechanism.

**One store, five surfaces.** `src/lib/content/w-skrocie.json` holds the hours as four ATOMS
(the range, the full day name, the short day form, the weekend line) rather than as prose,
the same lesson 05 D-03 records about the fee amounts. `src/lib/godziny.ts` composes each
surface's string from them, one function per surface, so a sixth surface cannot invent a
sixth phrasing by gluing atoms together in a new order.

**Every rendered byte is unchanged.** Verified against the prerendered build output:

| Surface | Before and after |
|---|---|
| Fact tile value | `6:30–16:30` |
| Footer line 1 / 2 / 3 | `poniedziałek-piątek` / `6:30–16:30` / `soboty i niedziele: nieczynne` |
| Top bar | `Czynne: pon.-pt. 6:30–16:30` |
| Contact block and `/kontakt` | `pon.-pt. 6:30–16:30` |

`git diff --name-only tests/nav.spec.ts tests/kontakt.spec.ts` is empty, which is the
independent proof that the unification changed nothing those two suites can see.

**The icon hazard is deleted, not guarded (T-05-09-01).** `KeyFacts.svelte` indexes its icon
map with no fallback and the homepage is prerendered, so a stored value reaching that map
would be a build failure of the whole site. Because the arity is fixed at four, the icon, the
tint and the four locked `.fact-label` strings are a CODE-AUTHORED slot table zipped with the
stored strings by position. No editor input can ever produce an icon key, so the runtime icon
fallback 05 D-32 asked for is unnecessary rather than skipped, and the module says so.
`grep -c 'icon' src/lib/content/w-skrocie.json` is `0`.

**The reader degrades, it never throws.** A malformed store falls back to the code-authored
defaults with a build warning. That is the OPPOSITE call from `src/lib/cennik.ts`, which
throws at module scope, and deliberately so: a wrong fee must never reach a parent, while a
stale hours line on an otherwise working homepage beats no homepage at all.

**The each block is re-keyed by index (T-05-09-02).** Two of the four tiles are now
editor-writable and Svelte throws on two equal keys in production as well as in development.
This repository had already fixed this exact bug twice; both fixes were followed verbatim,
comment included.

**The screen.** `/admin/w-skrocie`, four fieldsets in tile order, two editable and two
read-only. Read-only values render as TEXT plus a hint plus, for the fee tile, a link to
`/admin/cennik` — never as a control nobody may type into, because that looks like a control
somebody forgot to switch on and is skipped by keyboard navigation with no explanation.
`grep -c 'disabled' src/routes/admin/w-skrocie/+page.svelte` is `0`, and the spec asserts the
absence of any add or remove control as well. Reached from a pulpit tile only: the panel
navigation still holds nine labels and `grep -c 'w-skrocie' src/lib/sciezki-panelu.ts` is `0`,
which the 05-05 enumeration gate permits because its pulpit assertion is a subset in that
direction.

**The launch-gate marker survived the migration as an executable check.** The two
`// PLACEHOLDER:` line comments in `site.ts` became per-tile booleans, and
`tests/zastepcze.unit.ts` walks every JSON file under `src/lib/content/`, collects every
`placeholder` flag at any depth, asserts each is a boolean and PRINTS the inventory. It never
asserts a flag is false: they are legitimately true until Phase 6, and a gate that failed
today is a gate somebody would delete today.

## Task-by-task

| Task | Name | Commit | Key files |
|------|------|--------|-----------|
| 1 | Wave 0 tests for the tiles, the hours and the placeholder inventory | `fe8bcc6` | `tests/zastepcze.unit.ts`, `tests/fixtures/trasy-panelu.ts`, `tests/home.spec.ts` |
| 2 | One source for the hours and the fact tiles, icon table kept in code | `bcb54df` | `w-skrocie.json`, `godziny.ts`, `w-skrocie.ts`, `site.ts`, `KeyFacts.svelte`, `Footer.svelte` |
| 3 | The fixed-arity `/admin/w-skrocie` screen, the ninth pulpit card, the manual and the phase ledger | `0c1f395` | `walidacja/w-skrocie.ts`, `/admin/w-skrocie/`, `panel.ts`, `pola-strony.ts`, `instrukcja-cms.md`, `05-VALIDATION.md` |

## The TDD gate, and what could honestly be banked

The plan asked for task 1 to be red before task 2. The structural constraint this phase has
hit repeatedly applied again: pre-commit runs `svelte-check` across the whole tree and
`tsconfig.json` covers `tests/`, so a test importing a not-yet-written module is a TYPE ERROR
and its RED commit cannot be banked without `--no-verify`, which was not used.

**A real RED commit WAS banked** (`fe8bcc6`), because two of the six test artefacts import no
unbuilt module. The observed failure, verbatim:

```
✖ kafelki strony glownej maja wlasne znaczniki tresci zastepczej (Kontrakt 11)
  AssertionError [ERR_ASSERTION]: brak znacznika tresci zastepczej:
  w-skrocie.json.godziny.placeholder (znalezione: aktualnosci/...json.placeholder,
  cennik.json.placeholder, day-plan.json.placeholder, dokumenty/...json.placeholder,
  galeria.json.placeholder, o-nas.json.placeholder)
  ℹ tests 3  ℹ pass 2  ℹ fail 1
```

The three remaining artefacts (`tests/admin-walidacja-w-skrocie.unit.ts`,
`tests/admin-w-skrocie.spec.ts` and the `admin-pulpit.spec.ts` extension) reference exports
that did not exist yet, so they were written in the working tree, observed red through
`npm run check`, and committed with the tasks that made them compile. This is the precedent
plans 05-03 and 05-07 set, applied to the subset it actually covers.

## The phase ledger (the D-37 statement this plan owes, by name)

- **Proven by an enforced gate:** every row of `05-VALIDATION.md`'s requirement map except the
  ones named below. E1 (`npm run check`) and E2 (`npm run lint`) run in pre-commit; E3
  (`vite build`) runs in every Pages deploy.
- **Proven only when a human runs the suite:** every browser row. **There is no CI.** This is
  the standing AG-3 gap, it is not this phase's to fix, and this phase ENLARGES it: it adds
  `tests/admin-w-skrocie.spec.ts` to a tier nothing runs automatically, and
  `tests/zastepcze.unit.ts` plus `tests/admin-walidacja-w-skrocie.unit.ts` to a tier with no
  gate at all. Saying so is the point; leaning on those suites would not be.
- **Honestly unproven:**
  - **GAL-10** (the hand-placed seed photos are never deleted). The promotion
    `05-VALIDATION.md` proposed, asserting through a browser that a removed seed photo is
    still present, is VACUOUS under this harness: `npm run preview:test` binds
    `PANEL_DRY_RUN=1`, so no Playwright save ever deletes a file and the assertion would pass
    whatever the ownership rule did. Evidence tier: E5 (unit) only, plus the acceptance
    criterion that the route has exactly one writer of the deletion array. The browser tier
    was refused rather than faked.
  - **GAL-3's empty-gallery axe scan.** Green for the populated gallery and for the open
    lightbox; the empty state was never exercised, because doing so would mean committing an
    empty `galeria.json` to the repository purely to satisfy a test. Evidence tier: E4 for the
    two states that exist, none for the third.
- **Live-only:** **FEE-9** and **GAL-11**. The minimum honest run is THREE saves and one
  rebuild wait: one on the Cennik screen, one on the Galeria screen (an add and a remove in
  the same sitting, which the one-save shape makes a single commit), one on this screen.
  Roughly six minutes of wall clock and three of the 500 monthly builds. Do NOT schedule
  per-field saves. Do NOT schedule a login-timing measurement (04.1 UAT row E2) on the same
  UTC day, because the code limiter would lock the editor out for the rest of it. Do NOT run
  the Phase 04.1 teardown rows (F1 to F4) concurrently with live save testing.
- **Deferred to the Phase 6 launch gate, tracked, not descoped:** the **HEIC decode path**
  (04.1 UAT row B2) and the **stale-save conflict panel** (04.1 UAT row B4). Both need inputs
  this phase does not have: a real phone photo from the żłobek, and a second editor in a
  second tab. The Phase 6 gate already receives the real consented photo set and runs the
  placeholder sweep, which is now an executable inventory rather than a grep.
- **Not this phase's to close and explicitly not claimed:** **CMS-01, CMS-02 and CMS-03**
  (D-36). The phase proceeded against a formally open Phase 04.1 dependency by explicit user
  decision (D-37).
- **Requirements this phase closes:** **GALLERY-01**, **GALLERY-02** and **FEES-01**, each on
  its own evidence, with the live halves named above outstanding.

## Deviations from Plan

### 1. [Design judgement] The hours tile gains no rendered note

- **Found during:** Task 2, reconciling Contract 7's atom table with the plan's own `<done>`.
- **Issue:** Contract 7's table maps `dniPelne` to „tile note; Footer line 1", and the plan's
  action says „Hours tile: value and note from the composer". The hours tile has NO suffix
  today, so rendering one would be a visible content change.
- **Why it was not done:** three statements outrank the table cell. Contract 7's own heading
  is „KeyFacts v4: **same visuals**, stored values" and its first paragraph says the contract
  „changes only **where the four strings come from** and **which of them an editor may
  change**". The plan's task-2 `<done>` says „the homepage renders byte-identically to
  before". And the plan's task-1 action asks `tests/home.spec.ts` to interpolate „the hours
  value" with no mention of a note.
- **What was done:** `dniPelne` is composed into Footer line 1, which is where it genuinely
  renders. The tile keeps its single value. Five composer functions ship, one per surface
  string that actually exists; the sixth („the tile note") is not written, because it would be
  dead code.
- **Also not written:** a „top-bar sentence" function. `TopBar.svelte` renders
  `Czynne: {contact.hours}`, and „Czynne:" is visitor-visible copy about the bar rather than a
  fact about the hours, so moving it into a module the plan requires to carry „no
  editor-visible string" would have been the wrong home for it.
- **Impact:** none on behaviour. If the note is wanted on the tile, it is one line in
  `src/lib/w-skrocie.ts` plus a `tests/home.spec.ts` lockstep, and it needs a UI-SPEC
  amendment because it changes a locked surface.
- **Commit:** `bcb54df`

### 2. [Rule 3 - Blocking] `KeyFact` moved out of `site.ts` to keep the graph acyclic

- **Found during:** Task 2.
- **Issue:** `site.ts` has to import the tiles from `src/lib/w-skrocie.ts`, so that module
  could not import the `KeyFact` type back out of `site.ts` without closing a cycle.
- **Fix:** the type is declared in `src/lib/w-skrocie.ts` and RE-EXPORTED from `site.ts`, so
  every existing `import type { KeyFact } from '$lib/content/site'` keeps working unchanged.
- **Commit:** `bcb54df`

### 3. [Interpretation] „Refuses a submission whose arity is not four" is enforced structurally

- **Found during:** Task 3.
- **Issue:** the plan asks the validator to „refuse a submission whose arity is not four".
  Nothing a submission can carry is able to REQUEST a fifth tile: this screen has no
  repeatable group and no index-scoped control, so there is no arity field to refuse.
- **What was done:** the property is enforced by construction (closed allowlist, result built
  key by key, never spread) and PROVEN rather than assumed. `tests/admin-walidacja-w-skrocie.unit.ts`
  submits `kafelek[4].label`, `kafelek[4].icon`, `godziny[1].godziny`, `icon`, `tint` and
  `__proto__` alongside a valid form and asserts that the stored object still holds exactly
  two groups and that not one of those strings survived into the serialized output. The
  rendering half of the same guarantee (exactly four tiles, or the code-authored defaults) is
  asserted against the reader.
- **Commit:** `0c1f395`

### 4. [Rule 2 - Missing critical copy] A fifth refusal message and a „three places" note

- **Found during:** Task 3.
- **Issue:** `KOPIA_WALIDACJA.godzinyBrak` already existed, but it is about a plan-dnia row
  and quotes `7:00–8:30`. Reusing it would have quoted the wrong example back at an editor who
  had just been shown the right one on the field above.
- **Fix:** `godzinyOtwarciaBrak` added beside it, with the Copywriting Contract's own example.
  Separately, `KOPIA_W_SKROCIE.godzinyUwaga` was added: „Te godziny pokazujemy w trzech
  miejscach: na stronie głównej, w pasku na górze strony i w stopce. Jeden zapis zmienia
  wszystkie." Without it the first person to change the hours would go hunting for the second
  place to change them, find none, and conclude the panel is broken. The same sentence is
  quoted verbatim in the manual and pinned by `tests/instrukcja.unit.ts`.
- **Commit:** `0c1f395`

### 5. [Environment] `node_modules` symlinked into the worktree

Gitignored, nothing committed, no dependency moved. Same resolution plans 05-03 to 05-07 used.

### 6. [Tooling] The `svelte` MCP server was unreachable

`svelte-autofixer` was absent from this executor's tool list, as it has been for every
executor in this phase. `npm run check` runs `svelte-check`, which covers types plus the
compiler's a11y warnings, and reported 0 errors and 0 warnings over 4402 files.

## Known Stubs

None introduced. The two per-tile `placeholder` booleans in `src/lib/content/w-skrocie.json`
are launch-gate MARKERS on real shipped content, not stubs: `godziny.placeholder` is `true`
(the hours are [KD]-sourced and recorded as „może ulec zmianie") and `miejsca.placeholder` is
`false` (50 miejsc is a [BIP] fact). Both are enumerated by `tests/zastepcze.unit.ts`, which
prints the full inventory for the Phase 6 gate:

```
aktualnosci/2026-07-15-...json.placeholder: true
aktualnosci/2026-08-01-...json.placeholder: true
cennik.json.placeholder: true
day-plan.json.placeholder: true
dokumenty/rekrutacja-regulamin.json.placeholder: true
dokumenty/rekrutacja-wniosek.json.placeholder: true
dokumenty/statut-zlobka.json.placeholder: true
galeria.json.placeholder: true
o-nas.json.placeholder: true
w-skrocie.json.godziny.placeholder: true
w-skrocie.json.miejsca.placeholder: false
```

## Verification

`npm run check && npm run lint && npm run test:unit && npm run build && npm run test`, run as
one chained command in this tree:

| Leg | Result |
|---|---|
| `npm run check` (E1) | 4402 files, **0 errors, 0 warnings** |
| `npm run lint` (E2) | prettier + eslint clean |
| `npm run test:unit` (E5) | **592 passed, 0 failed** (566 inherited + 26 new) |
| `npm run build` (E3) | built in 4.4 s, **zero `[404]` crawler lines** |
| `npm run test` (E4) | **402 passed** (390 inherited + 12 new), 41.5 s |

The one `[404]` string in the whole run log is `[WebServer] [404] GET /aktualnosci/nie-ma-takiego`,
which is a test deliberately requesting a missing post through the preview server, not a
crawler line from the build.

Grep gates, all returning their expected counts:

| Gate | Expected | Actual |
|---|---|---|
| `grep -c "6:30" src/lib/components/Footer.svelte` | 0 | 0 |
| `grep -c "6:30" src/lib/content/site.ts` | 0 | 0 |
| `grep -c "(fact.label)" src/lib/components/KeyFacts.svelte` | 0 | 0 |
| `grep -c 'icons\[' src/lib/components/KeyFacts.svelte` | unchanged | 1 |
| `grep -c 'icon' src/lib/content/w-skrocie.json` | 0 | 0 |
| `grep -c 'OPLATY' src/lib/content/site.ts` | 0 | 0 |
| `grep -c 'disabled' src/routes/admin/w-skrocie/+page.svelte` | 0 | 0 |
| `grep -c 'w-skrocie' src/lib/sciezki-panelu.ts` | 0 | 0 |
| `NAWIGACJA.length` / `SCIEZKI_PANELU.length` | 9 / 9 | 9 / 9 |
| `TRASY.length` | 17 | 17 |
| `grep -c '^## ' docs/instrukcja-cms.md` | +1 (14 → 15) | 15 |
| `git diff --name-only -- package.json package-lock.json` | empty | empty |
| `git diff --name-only tests/nav.spec.ts tests/kontakt.spec.ts` | empty | empty |

Three `PLACEHOLDER` line comments were removed from `site.ts` (the `contact.hours` marker, the
hours tile marker, the fee tile marker). Each is accounted for: the two hours markers became
`godziny.placeholder` in the store, with a replacement sentence in `site.ts` naming where it
went; the fee marker retired with the amount itself, which is no longer typed anywhere but
subtracted from the two [BIP] figures in `src/lib/cennik.ts`. Seven `PLACEHOLDER` occurrences
remain in `site.ts`, four of them live markers (phone number, recruitment window wording, the
next-nabór date, plus the module-header convention note) and two of them the replacement
sentences just described.

## Threat Flags

None. No new network endpoint, no new auth path, no new file access pattern. The new route is
gated by `/admin` layout inheritance like every other panel screen, there is no `+server.ts`
under `/admin` and nothing was placed under `static/admin/`. Zero npm packages installed.

## Notes for the next plan

- **`/admin/w-skrocie` is a pulpit-only destination.** `tests/admin-enumeracja.spec.ts`
  permits that because its pulpit assertion is a subset in one direction only. Any future plan
  that tightens it into an equality will turn this screen red for being exactly where the
  contract puts it.
- **`POLE_ZASTEPCZA` is no longer the only placeholder control name.** This screen owns
  `godzinyZastepcza` and `miejscaZastepcza`, the first time in this project the flag is per
  tile rather than per file. A third screen with two flags must mint its own pair.
- **`tests/zastepcze.unit.ts` is the Phase 6 sweep's new half.** It finds flags at any depth,
  so a new content store gets covered for free, but the two named assertions are BY NAME: if a
  later plan renames the w-skrócie groups, that test names the exact paths it expected.
- **The daily food figure (`20 zł`) is the one value this plan knowingly leaves in two
  places:** the code-authored fee-tile suffix in `src/lib/w-skrocie.ts`, and the editor-owned
  `wyzywienie` sentence in `src/lib/content/cennik.json`. `tests/home.spec.ts` cross-checks
  them. Do not remove that check without merging the two.

## Self-Check: PASSED

All nine created files verified present on disk; all three commit hashes verified present in
`git log`.

- FOUND: src/lib/content/w-skrocie.json
- FOUND: src/lib/godziny.ts
- FOUND: src/lib/w-skrocie.ts
- FOUND: src/lib/server/admin/walidacja/w-skrocie.ts
- FOUND: src/routes/admin/w-skrocie/+page.server.ts
- FOUND: src/routes/admin/w-skrocie/+page.svelte
- FOUND: tests/zastepcze.unit.ts
- FOUND: tests/admin-walidacja-w-skrocie.unit.ts
- FOUND: tests/admin-w-skrocie.spec.ts
- FOUND: fe8bcc6, bcb54df, 0c1f395
