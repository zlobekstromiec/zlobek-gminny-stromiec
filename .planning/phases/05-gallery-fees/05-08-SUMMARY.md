---
phase: 05-gallery-fees
plan: 08
subsystem: strona-publiczna
tags: [galeria, podglad, wyspa, dostepnosc, fokus, reduced-motion, axe, progresywne-ulepszanie]
status: complete
requires:
  - sekcja galerii na /o-nas, kafelek jako <a href> do pelnego obrazu (05-07)
  - store galerii i para czytnikow czytajGalerie / galeriaZObrazami (05-06)
  - MobileNav.svelte jako jedyny dzialajacy precedens dialogu w repozytorium (faza 01)
provides:
  - src/lib/components/Lightbox.svelte, czwarta wyspa serwisu i pierwsza na trasie prerenderowanej
  - pierwszy w projekcie skan axe OTWARTEJ nakladki (GAL-3, stan otwarty)
  - pierwsza w projekcie asercja domknietego fokusu, naciskana Tabem w obie strony (GAL-4)
  - pierwsza w projekcie emulacja reduced-motion dla dialogu, z kontrola dodatnia (GAL-6)
  - mierzalna wlasnosc "podglad pojawia sie natychmiast", niezalezna od tego, jak zrobiono przejscie
affects:
  - src/routes/o-nas/+page.svelte (montaz wyspy, style kafelka wyprowadzone razem z kotwica)
  - tests/galeria.spec.ts (drugi blok describe, 13 nowych przypadkow)
tech-stack:
  added: []
  patterns:
    - wyspa na trasie prerenderowanej: zachowanie doklejone do znacznikow, ktore juz dzialaly
    - przywrocenie fokusu w SPRZATANIU efektu, wiec trzy drogi wyjscia maja jedna sciezke kodu
    - waskie przechwycenie klikniecia: modyfikator i srodkowy przycisk przechodza do przegladarki
    - element obrazu zostaje na stronie i przychodzi jako snippet, wyspa nie zna enhanced-img
    - style elementu wedruja do komponentu, ktory go renderuje, bo selektor strony go nie siega
    - czas pojawienia mierzony rAF wewnatrz strony zamiast transitionDuration
decisions:
  - A2 ROZSTRZYGNIETA - axe NIE zglosil tla bez inert, Contract 2 zostaje bez poprawki
  - A1 ROZSTRZYGNIETA - emulateMedia dziala, ale asercja NIE opiera sie na transitionDuration
  - Pulapka fokusu ma jeden element, bo drugi wymagalby trzeciego svelte-ignore (odchylenie 2)
  - Spacja na kafelku obsluzona recznie, bo odnosnik natywnie na nia nie reaguje
  - RED zabankowany naprawde, drugi raz w tej fazie po 05-03 i 05-07
metrics:
  duration: ~35 min
  completed: 2026-08-17
  tasks: 2
  files: 3
  commits: 2
---

# Phase 5 Plan 08: podglad zdjecia i pierwszy skan otwartej nakladki - Summary

A parent can now tap a gallery photograph and see it large, close it three ways and land back
on the tile they came from; and for the first time in this repository there is a test that
proves an open overlay is accessible, instead of a test that proves the page was accessible
before anything opened.

## The point of this plan, and whether it was met

`05-RESEARCH.md` said MobileNav is the correctness precedent for a hydrated island. It is right
about the IMPLEMENTATION and was wrong about the EVIDENCE, and that distinction was this plan's
whole reason to exist. Verified again in this working tree before writing anything:

- `AxeBuilder` is called in twelve spec files; every one of those calls scans a page in a
  LOAD-TIME state and not one scanned an open overlay.
- `tests/nav.spec.ts:141-164` proves the drawer's dialog role, first focus, Escape and focus
  restore. It runs no axe scan while the drawer is open and it never presses Tab.

So there was no test to copy, and a focus trap that is never Tab tested is a focus trap nobody
has verified. **All three firsts now exist and all three are green**: the open-state axe scan,
the Tab-boundedness assertion in both directions, and the reduced-motion emulation of a dialog.

## What was built

### Task 1 (`acbd812`) - the contract as executable assertions, RED

**A real RED commit was banked**, the third time in this phase (precedent 05-03, repeated by
05-07): the file is a Playwright spec importing no unbuilt module, so `npm run check` passed at
0 errors and the pre-commit hook let a failing-test commit through with no `--no-verify`.

Observed RED, verbatim: `npx playwright test tests/galeria.spec.ts --reporter=line` ->
**12 failed, 13 passed**. Every failure was one of the newly added cases; all twelve tile cases
from plan 05-07 stayed green.

**One new case passed at RED and that is honest, not an oversight.** „bez skryptow nie ma
zadnego dialogu, a kafelek zostaje zwyklym odnosnikiem" asserts an ABSENCE that was true before
this plan and had to stay true after it. Its job is to go red if hydration ever takes the
no-scripting affordance away, which is a durability property, not a new behaviour. The other
eleven new cases were all red for the right reason: there was no dialog to find.

Three assertions in that block are the first of their kind and each was written so it cannot
pass vacuously:

1. **Open-state axe** runs AFTER the click that opens the dialog, at the four tag values every
   other scan in this repository uses (`['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`, the same
   list `tests/o-nas.spec.ts:118` passes, held in this file's existing `ZNACZNIKI` constant).
2. **Tab boundedness in both directions.** Shift+Tab from the first focusable and Tab from the
   last, with containment evaluated INSIDE the page against `document.activeElement`, which is
   the only authority on where focus actually went. Neither half is a tautology: without the
   trap, backwards lands on the tile link that precedes the dialog and forwards on the tile link
   that follows it, and both are outside it.
3. **Reduced motion** with a positive control FIRST, mirroring the discipline 05-07 established
   for the tile: „pojawia sie natychmiast" passes on a component that never faded at all, so the
   fade is proven to exist before it is proven to be switched off.

The modifier-click negative carries its **own positive control inside the same test**, for the
same reason: „modyfikator nie otwiera dialogu" passes on a component that never opens anything.
The test records `[false, false, true]` for Ctrl-or-Cmd, middle and plain click, read off
`defaultPrevented` at a `document`-level listener that runs after the island has had its chance
and then prevents the event itself, so the fall-through cases cannot open a browser tab.

### Task 2 (`6a54f40`) - the island and its mount

`src/lib/components/Lightbox.svelte`, transposed from `MobileNav.svelte` rather than
re-derived. The four load-bearing properties are all present:

1. **The focus restore lives in the `$effect` CLEANUP.** That is what makes ONE code path serve
   Escape, the close button and the scrim. All three are asserted separately, and all three
   restore focus to the tile that opened the dialog because none of them has its own restore.
2. **The dialog element carries the dialog role, the modal flag, a programmatic-only tabindex
   and the keydown handler**, and the handler is on the dialog, never on the window.
3. **The transition duration comes from a function**, so reduced motion is honoured in JS, with
   a component-scoped `@media` block as the second layer.
4. **The scrim's two compiler-suppression comments are present**, with the same explanatory
   comment above them.

Deltas from the precedent, all from Contract 2: the trigger is the tile's existing `<a href>`
and not a button; the interception is narrow; `aria-labelledby` points at the caption element
INSIDE the dialog rather than at a literal; the motion is an opacity fade only; the DOM order
is close button, image, caption, description line; the close button sits inside the panel's
corner and never floats on the scrim alone.

The panel is centred with `inset: 0` plus auto margins rather than a translate, deliberately,
so the only thing this component ever animates is opacity.

**Both image elements stayed in the page**, one per snippet, so the island carries no
image-processing concern and never imports `enhanced-img`. They differ only in `sizes`: the
tile fills a grid cell, the dialog fills the viewport, exactly as Contract 2 specifies.

**The page header comment was already true** and only needed tightening: plan 05-07 wrote it as
a promise about a future plan, and it now states what the page does. It also now records that
the island owns the anchor and its styling while the page keeps the figure, the caption and the
image elements.

## The two research assumptions, resolved by first contact

### A2: axe did NOT flag the non-inert background. RESOLVED, no change to Contract 2.

The open-state scan returned **zero violations on its first run**, with the background siblings
of the `aria-modal` dialog neither `inert` nor `aria-hidden`. The remedy the plan pre-authorised
(apply the inert treatment to the page wrapper and record it as an addition Contract 2 does not
specify) was therefore **not applied and is not needed**. Contract 2 stands unamended.

Worth recording for whoever revisits this: the dialog renders inline inside `<main>`, so it is
inside a landmark, and axe's `region` rule has nothing to complain about either. A portal to the
end of `<body>` would have moved that content outside every landmark and could well have turned
this scan red, which is a second reason the portal-free fixed-position wrapper was the right
shape and not merely the cheaper one.

### A1: `emulateMedia` behaved as documented. RESOLVED, but the assertion form is neither of the two the research proposed.

`page.emulateMedia({ reducedMotion: 'reduce' })` worked exactly as documented, with no fallback
needed, confirming what plan 05-07 already found for the tile.

**The assertion built on it is deliberately NOT the research's fallback form**, and this is the
one place where following the sketch would have shipped a test that carried no information. The
fade is a Svelte `transition:`, not a declared CSS `transition`, so
`getComputedStyle(...).transitionDuration` reads `0s` with the preference AND without it. An
assertion on that property would have passed whatever the component did, which is precisely the
class of vacuous test this phase has been guarding against.

What was written instead measures the visitor-visible property directly: **milliseconds from the
frame the dialog first exists to the frame it reaches full opacity**, sampled with
`requestAnimationFrame` inside the page. The clock starts when the element APPEARS, not when the
probe is installed, so the click round trip sits outside the measurement and the shared
Playwright server cannot inflate it. Measured: over 100ms without the preference (the fade is
150ms), under 100ms with it. The probe is agnostic to how the fade is produced, so it will keep
working if the transition implementation ever changes.

## Verification

Full wave gate, run from the worktree after task 2:

| Gate | Result |
|---|---|
| `npm run check` | 4392 files, **0 errors, 0 warnings** |
| `npm run lint` | prettier clean, eslint clean |
| `npm run test:unit` | **566 passed, 0 failed** (typed by hand; nothing automated runs this tier) |
| `npm run test` (FULL suite) | **403 passed, 0 failed** (390 inherited plus the 13 new cases) |
| `npm run build` | succeeded, and still **zero** `[404]` crawler lines |

`tests/galeria.spec.ts` is 25 green cases and passed on its FIRST run after the implementation
landed, including the open-state axe scan. `tests/nav.spec.ts`, `tests/o-nas.spec.ts` and
`tests/responsive.spec.ts` are green and undisturbed: the drawer's own contract still holds and
no second dialog is on the page at rest.

Acceptance greps:

- `grep -c 'svelte-ignore' src/lib/components/Lightbox.svelte` = **2**
- `grep -c 'aria-modal' src/lib/components/Lightbox.svelte` = **1**
- `grep -c 'prefers-reduced-motion' src/lib/components/Lightbox.svelte` = **3** (the `matchMedia`
  call, the `@media` block and one line of prose), so BOTH layers are demonstrably present
- `grep -ci 'spinner\|skeleton\|progress' src/lib/components/Lightbox.svelte` = **0**
- `grep -c 'lib/server' src/lib/components/Lightbox.svelte` = **0**
- `grep -c "keyboard.press('Shift+Tab')" tests/galeria.spec.ts` = **1**
- `grep -c 'emulateMedia' tests/galeria.spec.ts` = **3**
- `grep -c "getByRole(.dialog.)" tests/galeria.spec.ts` = **1**
- `git diff --name-only svelte.config.js` = **empty**. The CSP was not widened (T-05-08-01).
- `git diff --name-only -- package.json package-lock.json` = **empty**. Zero packages installed.
- `git diff --diff-filter=D --name-only` = **empty**. No file was deleted.

## Validation-map position

- **GAL-3, open state: green.** The project's first open-overlay axe scan, zero violations.
- **GAL-3, empty gallery: still HONESTLY UNPROVEN**, unchanged from plan 05-07, and not claimed
  here. It still owes an entry in `05-VERIFICATION.md`, which plan 05-09 owns.
- **GAL-4: green.** Escape, the close button and the scrim all close; all three restore focus to
  the tile that opened the dialog, asserted against the SECOND tile so that „focus went back to
  a tile" cannot pass for „focus went back to THIS tile"; and the trap is pressed in both
  directions.
- **GAL-5: green from the dialog's side too.** With scripting off there is no dialog in the
  document at all, the tile is still a link to a real image asset and the gallery holds no
  button, so hydration added behaviour without taking anything away.
- **GAL-6: green in both halves now.** The tile half was closed by 05-07; the dialog half closes
  here.
- **GALLERY-01 is closable by this plan.** GALLERY-02's closing evidence is GAL-11 and is live
  only, unchanged.
- **GAL-10 remains honestly unproven**, unchanged from 05-06.

## Deviations from Plan

### 1. [Rule 3 - Blocking] The tile's styles had to move into the island with the anchor they style

- **Found during:** task 2, the moment the island took ownership of the `<a class="kafelek">`.
- **Issue:** Svelte scopes a component's CSS to elements that component renders. With the anchor
  rendered by `Lightbox.svelte`, the page's `.kafelek`, `.kafelek :global(img)`, the hover rule,
  the tile's reduced-motion guard and `.visually-hidden` matched nothing, which is an unused-CSS
  warning and `npm run check` is required to report zero warnings. Left unmoved they would also
  have silently stopped styling the tile.
- **Fix:** all five blocks moved verbatim into the island, with their original comments. The
  page keeps everything it still renders: the grid, the figure, the caption and the empty state.
  A comment in the page's stylesheet says where they went and why a page-scoped selector cannot
  reach them.
- **Evidence it is not a regression:** the 05-07 tile cases are untouched and green, including
  the geometry tiers, the 4:3 box and the hover-scale reduced-motion pair, because every one of
  them reads computed style or geometry rather than which file the rule lives in.
- **Files:** `src/lib/components/Lightbox.svelte`, `src/routes/o-nas/+page.svelte`
- **Commit:** `6a54f40`

### 2. [Judgement] The focus trap bounds ONE control, not the two Contract 2's parenthetical describes

- **Issue:** Contract 2 says the trap „cycles between the close button and the image container".
  Making the image container a tab stop means `tabindex="0"` on a non-interactive element, which
  the Svelte compiler reports as `a11y_no_noninteractive_tabindex`. Silencing it needs a THIRD
  suppression comment in this file, and the plan's acceptance criteria require exactly two.
  Leaving it unsilenced fails `npm run check` at pre-commit. The contract's parenthetical and
  the plan's grep criterion cannot both be satisfied.
- **Decision:** the dialog holds one focusable control, the close button, and the cycle closes
  onto it. **The property the contract actually cares about is unchanged and is enforced**: Tab
  and Shift+Tab never reach the tile links on either side of the dialog, asserted in both
  directions. Nothing is lost for a keyboard user either, because the panel scrolls with the
  arrow keys while focus is inside it, so the enlarged photograph needs no tab stop of its own
  to be reachable.
- **Why this is not a weakened test:** without the trap, both presses leave the dialog for a
  tile link, so both assertions fail on the page as it stood before task 2. That is exactly what
  was observed at RED.
- **Commit:** `6a54f40`

### 3. [Rule 1 - Bug] `$props.id()` cannot be interpolated

- **Found during:** task 2, first `npm run check`.
- **Issue:** `const PODPIS_ID = \`podglad-podpis-${$props.id()}\`` is a compile error: the rune
  may only stand alone as a variable declaration initializer.
- **Fix:** the rune is called into its own `const` first, matching how
  `src/lib/components/admin/KafelPulpitu.svelte:41` already uses it, with a comment recording
  the constraint so it is not reintroduced.
- **Commit:** `6a54f40`

### 4. [Judgement] Two acceptance greps were false-positived by this plan's own prose

- **Issue:** the island's header comment originally named the suppression directive and the
  dialog's modal attribute while explaining why each is required. That pushed
  `grep -c 'svelte-ignore'` to 3 and `grep -c 'aria-modal'` to 2, permanently failing two
  criteria that demand exactly 2 and exactly 1.
- **Decision:** both comments now DESCRIBE the name rather than writing it, following the
  repository rule recorded at 04-02 and already applied three times in plan 05-07 and twice in
  05-06. The explanation survives in full and the greps are honest.
- **Commit:** `6a54f40`

## Notes

- **Space on the tile is handled explicitly, and that is a deliberate choice rather than an
  oversight of native behaviour.** A native `<a href>` does not activate on Space; Contract 2
  asks for it, on the reasoning that a tile which opens a dialog should answer the key a control
  which opens a dialog answers. Enter needs no code at all, because Enter on a link already
  produces the click the island intercepts. Both are asserted.
- **Middle click never reaches the click handler in a current browser**, because it fires
  `auxclick` rather than `click`. The `event.button !== 0` guard is kept anyway as the belt to
  that pair of braces, and the test presses the middle button regardless, so the property is
  pinned no matter which event the browser chooses to send.
- **The `svelte` MCP server was unreachable**, as it has been for every executor in this phase;
  `svelte-autofixer` was absent from the tool list. The equivalent gate was run instead:
  `npm run check` includes `svelte-check`'s compiler accessibility pass and reported 0 errors
  and 0 warnings across 4392 files after every task, and axe is clean on `/o-nas` in both the
  closed and the open state.
- **`node_modules` was absent in this worktree** and was symlinked to the parent checkout's, the
  same intervention plans 05-03 to 05-07 made. It is gitignored: nothing was committed for it
  and no dependency moved.
- **No acceptance evidence in this plan requires a real photograph of a child (D-37).** The two
  seed images are the existing environment-only placeholders, `galeria.json` still carries
  `"placeholder": true`, and no new picture was committed.
- **The deferred double-asterisk defect (`D-05-05-A`) was NOT fixed**, per the plan, and neither
  was `deferred-items.md` item 2.
- **No browser-tier assertion in this plan touches persistence or deletion**, so the
  `PANEL_DRY_RUN=1` vacuity trap does not apply here: every property asserted is about rendering,
  focus, keyboard behaviour and motion in a live browser, none of which a dry run can fake.

## Known Stubs

None. Every prop the island declares is passed at its single call site and read in its markup;
the one prop drafted and not needed (an eager-loading hint, which the page's own snippet already
carries on the image element) was removed before the first commit rather than left behind.

## Threat register outcomes

| Threat ID | Outcome |
|---|---|
| T-05-08-01 (CSP widening) | No CSP change. `git diff --name-only svelte.config.js` is empty. The island is same-origin and adds no inline script of its own. |
| T-05-08-02 (keyboard user trapped or lost) | The trap is bounded over the dialog's own focusable elements and is asserted in BOTH directions, which no test in this repository had done before. The restore lives in the effect cleanup, so all three close routes share one code path and all three are asserted to land back on the tile that opened the dialog. |
| T-05-08-03 (cannot enlarge or cannot leave) | The tile is a real link and stays one. The narrow interception is asserted for a modifier key and for the middle button, with a positive control in the same test, and the no-scripting path is asserted in its own `javaScriptEnabled: false` context. |
| T-05-08-04 (invisible accessibility regression) | The project's first open-overlay axe scan, green at the same four tag values as every other scan here. It did not need the inert remedy (A2). |
| T-05-08-05 (information disclosure) | Accepted as planned. The island renders only content already present in the prerendered document; there is no runtime fetch and nothing is logged. |
| T-05-08-SC (supply chain) | Zero packages installed. `package.json` and `package-lock.json` untouched. No lightbox library, no carousel, no external CDN. |

## For the phase's validation ledger (plan 05-09)

- GAL-3 open state, GAL-4 and the dialog half of GAL-6 close here and are proven in the browser.
- GAL-3's EMPTY-gallery scan and GAL-10 are still owed by name in `05-VERIFICATION.md`,
  unchanged from what plans 05-06 and 05-07 recorded. This plan neither proves nor claims them.
- The live UAT should include one item this suite structurally cannot cover: opening the preview
  on a real phone with „ogranicz ruch" switched on at the OS level rather than emulated.

## Self-Check: PASSED

Files asserted present on disk: `src/lib/components/Lightbox.svelte`,
`src/routes/o-nas/+page.svelte`, `tests/galeria.spec.ts`.

Commits asserted present in `git log`: `acbd812` (task 1, RED), `6a54f40` (task 2).
