---
phase: 04-enrollment-contact-email-pipeline
plan: 03
subsystem: ui
tags:
  [
    svelte5-runes,
    sveltekit,
    forms,
    accessibility,
    wcag21aa,
    rodo,
    klauzula-informacyjna,
    turnstile,
    tailwind-v4,
    node-test
  ]

# Dependency graph
requires:
  - phase: 01-live-homepage-design-foundation
    provides: 'src/app.css two-tier @theme token set, the global 3px focus-visible ring and reduced-motion base layer, Cta.svelte primary button box, MobileNav.svelte island idiom ($state element bindings, $effect teardown, typeof window guard, component-scoped reduced-motion block)'
  - phase: 02-content-pages-cms
    provides: 'the local .visually-hidden utility convention copied per component, and the content-module style of src/lib/content/site.ts'
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'Plan 01: POST /api/kontakt on the real Cloudflare runtime, src/lib/forms/types.ts FormResult/FormCode contract, the three per-field reason keys (brak, niepoprawny, zbyt-dlugi), the honeypot key `strona` and the token key `turnstile`, and the Turnstile CSP directives. Plan 02: the real facts in site.ts plus the new exported `urzad` const'
provides:
  - 'src/lib/content/forms.ts, the single source for every Polish string both forms render, including the full klauzula informacyjna RODO'
  - 'the klauzula informacyjna itself: authored this phase because none exists in the BIP (D-03), disclosing the United States transfer and its legal mechanism, the approximately thirty day processor copy, the temporary BCC mailbox and the salted-hash abuse counter'
  - 'src/lib/components/FormField.svelte, the a11y contract every input on this site now inherits'
  - 'src/lib/components/ConsentBlock.svelte, the unticked RODO consent row plus the native klauzula disclosure'
  - 'src/lib/components/TurnstileWidget.svelte with an exported reset() and a token-clearing expiry path'
  - 'src/lib/components/KontaktForm.svelte, the site second hydrated island, wired to the Plan 01 endpoint'
  - 'src/lib/forms/turnstile-global.d.ts, minimal local ambient typings for the Turnstile global'
  - 'tests/forms-copy.unit.ts, 27 cases pinning the copy rules and every klauzula disclosure obligation'
affects:
  [
    04-04-kontakt-page,
    04-05-rekrutacja-endpoint,
    04-06-rekrutacja-page-and-zgloszenie-island,
    04-07-secrets-and-kv-provisioning,
    06-launch-hardening
  ]

# Tech tracking
tech-stack:
  added: [] # zero npm packages installed, by design (T-04-SC)
  patterns:
    - 'Copy module as the only prose surface: the endpoint returns machine codes, the island maps them, so no Polish sentence and no em-dash risk ever reaches server code'
    - 'Inline fragment list instead of markup-in-strings: a failure body is Fragment[] where { mocne } renders inside <strong>, so emphasis survives without a copy string containing an element'
    - 'aria-describedby derived from existing ids only, returning undefined rather than an empty string'
    - 'aria-invalid driven from the same derivation that drives the invalid border, so the visual and announced states cannot disagree'
    - 'value + oninput on a shared input primitive, because Svelte forbids two-way binding on an input with a dynamic type attribute'
    - 'Explicit $state<T>() type parameters instead of a let annotation, so control-flow narrowing does not collapse a union to its initial literal inside top-level $derived'
    - 'Focus moved only inside the submit outcome path, after await tick(), never from an $effect that could fire on a keystroke'
    - 'Third-party widget wrapper exposing reset() through bind:this, called in every non-success branch before the submit button is usable again'

key-files:
  created:
    - src/lib/content/forms.ts
    - src/lib/components/FormField.svelte
    - src/lib/components/ConsentBlock.svelte
    - src/lib/components/TurnstileWidget.svelte
    - src/lib/components/KontaktForm.svelte
    - src/lib/forms/turnstile-global.d.ts
    - tests/forms-copy.unit.ts
  modified: []

key-decisions:
  - 'KOPIA_POL is nested (field key, then reason key) rather than flat, because the server distinguishes brak, niepoprawny and zbyt-dlugi and the UI-SPEC has separate copy for a missing and an over-long message. komunikatPola() falls back to the brak message for an unknown reason so a future server code can never render an empty error paragraph.'
  - 'A failure body is an array of inline fragments, not a string with markdown. The UI-SPEC requires the "nie zostala wyslana" emphasis to be a <strong> and forbids capitals-only emphasis, and putting markup in a copy string would have made the copy tests unable to read the sentence.'
  - 'The zgoda failure reuses the validation-summary heading (Popraw zaznaczone pola) rather than inventing a heading the design contract never approved. A missing consent tick is a marked field on the form.'
  - 'The island emits the turnstile failure locally when no token is held, instead of posting a request that can only come back as a turnstile rejection. Fewer round trips, and the parent gets the honest message immediately.'
  - 'The success panel keeps role="status" on the panel and tabindex="-1" on its heading only (not on both). Focus lands on the heading exactly as the UI-SPEC focus contract requires, and the panel is not made focusable twice.'
  - 'The static fallback title is a bold paragraph, not a heading element. The panel sits above the form card and therefore above its h2, so a heading there would break the h1 to h2 to h3 order that the axe gate checks.'
  - 'CONTACT-03 and RECRUIT-04 are deliberately NOT marked complete, following the Plan 01 precedent. No parent can reach this form yet (Plan 04 mounts it) and the enrollment form does not exist yet (Plan 06). The last plan claiming each ID should mark it.'

patterns-established:
  - 'Pattern: the content module owns every string, the component owns every element. KLAUZULA is an array of { naglowek?, akapity[] } blocks carrying no markup at all, so ConsentBlock owns the whole visual treatment and no copy string can smuggle in an element. Plan 06 renders the same array for the enrollment form.'
  - 'Pattern: grep-checkable a11y gates survive the comments. Describing a banned value instead of spelling it (the outline suppressor, the details element, the ticked pseudo-class) keeps `grep` usable as a machine check for future reviewers. Same discipline as Plan 01 Deviation 7.'
  - 'Pattern: mirrored client validation with the server named as the boundary. The island duplicates the caps and the e-mail pattern for instant Polish feedback and says so in a comment, so nobody mistakes it for enforcement (T-04-14).'
  - 'Pattern: one alert region, two bodies. A field problem and a delivery failure share a single role="alert" panel and a single focus target, which is what keeps the "no competing live regions" rule true while still rendering two different UI-SPEC surfaces.'

requirements-completed: []

coverage:
  - id: D1
    description: 'Every Polish string both forms need exists in one module, and no contact value is duplicated as a literal anywhere in it'
    requirement: 'CONTACT-03'
    verification:
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#every phone number in the exported copy is the value from site.ts'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#every e-mail address in the exported copy is the value from site.ts'
        status: pass
      - kind: other
        ref: "grep -cE '510 094 051|zlobek@ugstromiec\\.pl' src/lib/content/forms.ts returns 0"
        status: pass
    human_judgment: false
  - id: D2
    description: 'The klauzula informacyjna discloses the United States transfer and its legal mechanism, the approximately thirty day copy at the processor, the temporary backup mailbox, the salted-hash measure and the supervisory authority'
    requirement: 'RECRUIT-04'
    verification:
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula discloses the transfer to the United States (Pitfall 3)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula names the legal mechanism for that transfer (Pitfall 3)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula states the approximately thirty day copy at the processor'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula discloses the temporary backup mailbox (D-13, Pitfall 8)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula describes the salted-hash abuse counter (Pattern 4)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the klauzula names the supervisory authority'
        status: pass
    human_judgment: true
    rationale: 'The presence of every mandatory disclosure is machine-proven, but the legal adequacy of the Polish wording is not something a test can assert. The klauzula was authored by an agent, has a PLACEHOLDER where the IOD should be named, and should be read by the Gmina before launch. Tracked as a Phase 6 launch gate.'
  - id: D3
    description: 'All visitor-facing copy is Polish and carries no emoji and no em dash'
    requirement: 'CONTACT-03'
    verification:
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#no exported copy string contains an em dash (copy rules, C-11)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#no exported copy string contains an emoji (copy rules, C-11)'
        status: pass
      - kind: other
        ref: "grep -c '—' returns 0 for all five new source files"
        status: pass
    human_judgment: false
  - id: D4
    description: 'Every form control has a programmatically associated visible label, no control uses a placeholder as a label, and aria-describedby references only ids that exist'
    requirement: 'RECRUIT-04'
    verification:
      - kind: other
        ref: 'npm run check (svelte-check compiler a11y diagnostics, 4200 files, 0 errors 0 warnings)'
        status: pass
      - kind: other
        ref: "grep -c 'placeholder=' src/lib/components/FormField.svelte returns 0"
        status: pass
    human_judgment: false
  - id: D5
    description: 'The RODO consent checkbox ships unticked with no persisted value, and the klauzula is one keystroke away under the form as a native details disclosure'
    requirement: 'RECRUIT-04'
    verification:
      - kind: other
        ref: "grep -cE '(^|[[:space:]])checked([[:space:]=>]|$)' src/lib/components/ConsentBlock.svelte returns 0 (no bare checked attribute); zaznaczone = $bindable(false)"
        status: pass
      - kind: other
        ref: "grep -c '<details' and '<summary' each return 1; no localStorage, sessionStorage, cookie or URL write exists in either component"
        status: pass
    human_judgment: false
  - id: D6
    description: 'Every error is signalled by an icon and a text instruction as well as colour, and aria-invalid is set only while the field is actually invalid'
    requirement: 'RECRUIT-04'
    verification:
      - kind: other
        ref: 'Code contract: aria-invalid is $derived from the same `blad` prop that renders the CircleAlert icon and the instruction paragraph, and the invalid border selector keys off [aria-invalid="true"]'
        status: pass
    human_judgment: true
    rationale: 'The wiring is structural and reviewable, but "removing colour still leaves the error fully perceivable" is a visual judgment. The rendered error state also carries the phase axe gate (zero violations on /kontakt with aria-invalid set), which cannot run until Plan 04 mounts the island on a route.'
  - id: D7
    description: 'On a successful submit the form is replaced in place by a success panel and focus moves to its heading; on a failure every typed value survives, the Turnstile widget is reset, and the panel states plainly that the message was not sent with the phone and e-mail fallback'
    requirement: 'CONTACT-03'
    verification:
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the wysylka body states plainly that the message was not sent (D-12)'
        status: pass
      - kind: unit
        ref: 'tests/forms-copy.unit.ts#the wysylka emphasis is a strong fragment, never capitals (UI-SPEC 7c)'
        status: pass
      - kind: other
        ref: 'npm run build exits 0 (the island compiles and the svelte:head loader tag does not break the prerender)'
        status: pass
    human_judgment: true
    rationale: 'The branch logic is written and type-checked, but no test exercises a real submit yet: the island is not mounted on a route until Plan 04, which is where the Playwright success and failure paths land. Until then the success swap, the focus move and the widget reset are unproven at runtime.'
  - id: D8
    description: 'The Turnstile widget actually loads, renders and issues a token under the Plan 01 CSP, and the visitor without JavaScript is never stranded'
    verification: []
    human_judgment: true
    rationale: 'Carries forward Plan 01 coverage item D8. No page mounts the widget yet, so only a real browser rendering the real widget proves the three CSP directives are sufficient. Verify at the Plan 04 checkpoint, together with the noscript panel rendering with scripting disabled.'

# Metrics
duration: 15min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 03: Form UI kit, klauzula informacyjna and the KontaktForm island Summary

**One Polish copy module carrying a twelve-block klauzula informacyjna that tells the truth about the United States transfer, three shared form primitives implementing the locked WCAG 2.1 AA contract, and the site's second hydrated island posting to the Plan 01 endpoint and telling the truth about every outcome.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-14T17:14:12Z
- **Completed:** 2026-08-14T17:29:46Z
- **Tasks:** 3
- **Files modified:** 7 (7 created, 0 modified)

## Accomplishments

- **The project's RODO-bearing interface now exists, and the klauzula tells the truth.** `KLAUZULA` is twelve authored Polish blocks covering the administrator, the IOD (PLACEHOLDER), the purpose and the art. 6 ust. 1 lit. a consent basis, the data categories including the explicit promise never to ask for a child's name, Resend and Cloudflare as processors, the **transfer to the United States regardless of the selected sending region** and the standardowe klauzule umowne that legalise it, the **approximately thirty day copy at the processor**, the statement that nothing is stored in the żłobek's own systems, the **temporary BCC backup mailbox**, the salted-hash abuse counter, the full rights list with the Prezes Urzędu Ochrony Danych Osobowych, and the voluntariness note. A blanket "nie przechowujemy danych" would have been false; the wording separates our infrastructure from the processor's retention.
- **Those disclosures are executable, not aspirational.** `tests/forms-copy.unit.ts` (27 cases, part of a 128-case unit suite) fails if the United States sentence, the legal mechanism, the retention window, the backup-copy sentence, the salted-hash sentence or the supervisory authority goes missing, and carries a standing header forbidding their weakening. That is T-04-19 mitigated by a test rather than by good intentions.
- **No contact value can drift.** Every phone number, e-mail, opening-hours string and Urząd Gminy address in the copy module is interpolated from `site.ts`, proven by two tests that scan every exported string for phone-shaped and address-shaped literals and assert each one equals the `site.ts` value. `grep -cE '510 094 051|zlobek@ugstromiec\.pl' src/lib/content/forms.ts` returns 0.
- **The site now has a form accessibility contract instead of ad-hoc inputs.** `FormField` emits a real label, a persistent hint (never a `placeholder`), a control at 48px with the 4.76:1 border token, an `aria-describedby` built from existing ids only, `aria-invalid` set only while invalid, and an error that carries a `circle-alert` icon plus a Polish instruction. `svelte-check` runs its compiler a11y diagnostics across all of it with zero errors and zero warnings.
- **The consent row cannot be pre-ticked and the klauzula cannot be missed.** `ConsentBlock` renders a real 24px checkbox with no bare `checked` attribute, a `$bindable(false)` default, a CSS checkmark glyph so the ticked state carries a shape and not only a fill, an explicitly restated focus ring (mandatory because the native appearance is suppressed), and a native `<details>` whose chevron rotation lives inside a component-scoped reduced-motion guard.
- **A failed send can no longer masquerade as a success, and it no longer traps the parent.** `KontaktForm` treats a thrown fetch and a body that is not the shared result shape exactly like the `wysylka` code, keeps every typed value, calls `reset()` on the widget in every non-success branch before the button is usable again (the single-use token bug, T-04-16), and offers the phone and e-mail fallback interpolated from `site.ts`.
- **The no-JavaScript visitor is never stranded.** The tint-blue fallback panel and the `<noscript>` note are always in the markup, never revealed by script, so one block serves the delivery failure, the blocked widget and the scripting-disabled visitor at once.

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish form copy module and klauzula informacyjna** - `79d082c` (feat)
2. **Task 2: FormField and ConsentBlock, the shared accessibility contract** - `df8fc15` (feat)
3. **Task 3: TurnstileWidget and the KontaktForm island** - `803ad75` (feat)

## Files Created/Modified

**Created**

- `src/lib/content/forms.ts` - `TURNSTILE_SITEKEY` (Cloudflare's always-passes dummy, PLACEHOLDER-marked as the one line Plan 07 swaps), `Fragment`/`KopiaBledu` + `KOPIA_BLEDOW` for all five `FormCode` values, `tekstBledu()`, `PowodPola` + nested `KOPIA_POL` + `komunikatPola()`, `KOPIA_KONTAKT`, `KOPIA_FALLBACK`, `KOPIA_NOSCRIPT`, `BlokKlauzuli` + the twelve-block `KLAUZULA`.
- `src/lib/components/FormField.svelte` - the shared input/textarea primitive and its whole a11y contract.
- `src/lib/components/ConsentBlock.svelte` - the unticked consent row plus the native klauzula disclosure rendering `KLAUZULA`.
- `src/lib/components/TurnstileWidget.svelte` - explicit-render lifecycle in an `$effect` with teardown, Polish light-theme widget, exported `reset()`, expiry and error callbacks clearing the held token, and the 300x65 reserved slot with the vendor-exception comment.
- `src/lib/components/KontaktForm.svelte` - the island: three fields, honeypot, widget slot, consent block, submit row, one alert panel, one status panel, one permanent polite line, the static fallback and the `<noscript>` note.
- `src/lib/forms/turnstile-global.d.ts` - minimal ambient `Window.turnstile` and `Window.__onTurnstileLoad`, both optional so a blocked loader is a handled state.
- `tests/forms-copy.unit.ts` - 27 `node --test` cases pinning the copy contract and the klauzula obligations.

**Modified**

None. This plan is purely additive: nothing it produces is mounted on a route yet, which is Plan 04's job.

## Decisions Made

- **Nested `KOPIA_POL` plus a `komunikatPola()` accessor**, keyed by field and then by the server's reason key. The server distinguishes `brak`, `niepoprawny` and `zbyt-dlugi`, and the UI-SPEC has genuinely different copy for a missing versus an over-long message. The accessor falls back to the `brak` message for an unrecognised reason, so a future server code can never render an empty error paragraph.
- **Failure bodies are inline fragment arrays**, not strings with markdown. The `<strong>` around "nie została wysłana" is a UI-SPEC requirement and capitals-only emphasis is banned, so the alternative was markup inside a copy string, which would have defeated the copy tests.
- **`zgoda` reuses the `Popraw zaznaczone pola` heading** instead of getting an invented one. A missing tick is a marked field on the form, and the design contract never approved a second heading.
- **The island reports `turnstile` locally when it holds no token**, rather than posting a request whose only possible outcome is a `turnstile` rejection.
- **Explicit `$state<T>()` type parameters** rather than annotations on the `let`. See Deviation 4.
- **`CONTACT-03` and `RECRUIT-04` left unmarked in REQUIREMENTS.md**, following the Plan 01 precedent. No parent can reach this form until Plan 04 mounts it, and the enrollment form it shares with `RECRUIT-04` does not exist until Plan 06.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The plan's literal `grep -c 'checked'` gate is unsatisfiable for any controlled Svelte checkbox**

- **Found during:** Task 2 (ConsentBlock)
- **Issue:** Task 2's acceptance criterion reads "`grep -c 'checked' src/lib/components/ConsentBlock.svelte` returns 0 in the markup section". A checkbox whose state lives in component state must be written `bind:checked={zaznaczone}`, and the ticked visual state requires the `:checked` pseudo-class in CSS. There is no formulation of a controlled checkbox in Svelte where the substring `checked` does not appear, so the gate as literally written could only be passed by shipping an uncontrolled checkbox, which would break the submit handler.
- **Fix:** Implemented the criterion's stated intent, which the parenthetical makes explicit ("the checkbox ships unticked and no default value pre-ticks it"), and substituted an equivalent machine gate that is actually checkable: `grep -cE '(^|[[:space:]])checked([[:space:]=>]|$)' src/lib/components/ConsentBlock.svelte` returns **0**, proving no bare `checked` attribute exists, and `zaznaczone = $bindable(false)` proves the default cannot pre-tick. The four remaining occurrences are one comment, one `bind:checked` and two `:checked` selectors.
- **Files modified:** `src/lib/components/ConsentBlock.svelte`
- **Verification:** the substitute grep returns 0; the rendered markup contains no `checked` attribute; consent defaults to false and is re-validated with `=== true` by the server.
- **Committed in:** `df8fc15`

**2. [Rule 1 - Bug] My own comments defeated three of the plan's grep gates**

- **Found during:** Task 2 (acceptance greps)
- **Issue:** Exactly the failure mode Plan 01 recorded as its Deviation 7. Comment prose in `ConsentBlock.svelte` contained the literal tokens the gates search for: an explanation that nothing here suppresses the outline contained the suppressing value verbatim (so `grep -cE 'outline:\s*(none|0)'` returned 1 instead of 0), a sentence praising the native element contained `<details>` (so `grep -c '<details'` returned 2 instead of 1), and two comments used the word the ticked-state gate looks for.
- **Fix:** Reworded each comment to describe the banned token rather than spell it, and recorded inline that the token is grep-banned in that file and therefore deliberately unwritten, so a future reviewer's gate stays useful.
- **Files modified:** `src/lib/components/ConsentBlock.svelte`
- **Verification:** `grep -cE 'outline:\s*(none|0)'` returns 0 for both new components, `grep -c '<details'` returns 1, `grep -c '<summary'` returns 1.
- **Committed in:** `df8fc15`

**3. [Rule 2 - Missing Critical] `FormField` had no way to render the disabled state the UI-SPEC defines**

- **Found during:** Task 2 (FormField)
- **Issue:** The plan's prop list is `{ id, etykieta, typ, wymagane, blad, wartosc, podpowiedz, autocomplete, wieloliniowy }`, but UI-SPEC Component Contract 2's state table specifies a "Disabled (while sending)" state (subtle border on the warm surface, `not-allowed` cursor). Without a prop the state is unreachable, so the contract would have shipped with an unimplementable row and the fields would have stayed editable while a submit was in flight, letting a parent type edits that the in-flight request could never carry.
- **Fix:** Added a `wylaczone = false` prop to `FormField` and, for symmetry, to `ConsentBlock`, and wired both to `status === 'wysylanie'` in the island. Focus is not stranded by this: at that moment focus is on the submit button, which the same contract disables, and both submit outcomes then move focus explicitly.
- **Files modified:** `src/lib/components/FormField.svelte`, `src/lib/components/ConsentBlock.svelte`, `src/lib/components/KontaktForm.svelte`
- **Verification:** `npm run check` clean; the disabled selectors are reachable and use only existing tokens.
- **Committed in:** `df8fc15`, `803ad75`

**4. [Rule 3 - Blocking] A `let` union annotation with `$state()` made every later comparison look like dead code**

- **Found during:** Task 3 (KontaktForm, first `npm run check`)
- **Issue:** `let statusFormularza: 'idle' | 'wysylanie' | 'ok' | 'blad' = $state('idle')` produced three hard `svelte-check` errors. Control-flow analysis narrows an annotated `let` to its initial literal, and because `svelte2tsx` inlines a `$derived` expression rather than wrapping it in a closure, the narrowing was still in force where the derivations read the variable: `statusFormularza === 'wysylanie'` was reported as a comparison with no overlap, and `kod` narrowed to `null` made the whole error-copy derivation `never`.
- **Fix:** Moved the type onto the rune as an explicit parameter (`$state<Status>('idle')`, `$state<FormCode | null>(null)`, `$state<string | null>(null)`) so the initializer's type is the declared union and no narrowing occurs, and recorded the reason inline for the next island.
- **Files modified:** `src/lib/components/KontaktForm.svelte`
- **Verification:** `npm run check` reports 0 errors and 0 warnings across 4200 files.
- **Committed in:** `803ad75`

**5. [Rule 3 - Blocking] `eslint svelte/require-each-key` rejected the fragment loop**

- **Found during:** Task 3 (`npm run lint`)
- **Issue:** The inline fragment loop that renders the failure body was written unkeyed, and the project's eslint config treats a missing `{#each}` key as an error, so `npm run lint` failed and the pre-commit hook would have refused the commit.
- **Fix:** Keyed the loop by position with an inline note that the fragment list is a fixed, code-authored sequence per failure code, so the index genuinely is the stable identity here.
- **Files modified:** `src/lib/components/KontaktForm.svelte`
- **Verification:** `npm run lint` exits 0.
- **Committed in:** `803ad75`

**6. [Rule 2 - Missing Critical] `ConsentBlock` needed the klauzula label as a prop, not an import**

- **Found during:** Task 2 (ConsentBlock)
- **Issue:** The plan's prop list is `{ id, tekst, blad, zaznaczone }`, which leaves the `<summary>` label with nowhere to come from except an import of `KOPIA_KONTAKT.klauzulaEtykieta`. That would couple a primitive shared with the Plan 06 enrollment form to kontakt-specific copy.
- **Fix:** Added an `etykietaKlauzuli` prop. The copy still lives in the content module; the caller supplies its own, exactly as it supplies the consent sentence.
- **Files modified:** `src/lib/components/ConsentBlock.svelte`
- **Verification:** `npm run check` clean; the component imports only `KLAUZULA`, which is genuinely shared by both forms.
- **Committed in:** `df8fc15`

**7. [Rule 1 - Bug] Two copy-test regexes could never match Polish**

- **Found during:** Task 1 (first `npm run test:unit`)
- **Issue:** Two klauzula assertions were written with `\w+` word endings (`/pomocnicz\w+ skrzynk\w+/`, `/jedn\w+ godzin\w+/`). Without the unicode flag, JavaScript's `\w` is `[A-Za-z0-9_]`, so it cannot match `ę`, `ą` or `ł`. Both tests failed against correct Polish prose, and a reviewer's likely fix would have been to weaken the assertion rather than the pattern.
- **Fix:** Replaced both with the literal Polish phrases they are meant to pin.
- **Files modified:** `tests/forms-copy.unit.ts`
- **Verification:** 128 unit tests pass, 0 fail.
- **Committed in:** `79d082c`

**8. [Rule 2 - Missing Critical] Two copy exports needed values the UI-SPEC table does not enumerate**

- **Found during:** Task 1 (KOPIA_POL)
- **Issue:** The server can return `zbyt-dlugi` for `imie` and `niepoprawny` for the optional `telefon`, but the UI-SPEC error table lists copy for neither. Leaving those cells empty would have rendered a blank error paragraph on a real server response, which is the exact WCAG 3.3.1 failure the whole component set exists to prevent.
- **Fix:** Authored the two missing instructions in the same voice as the approved table, and recorded in the module which strings the UI-SPEC supplies verbatim and which two were derived. The illustrative e-mail address in the approved copy uses `example.com`, an RFC 2606 reserved documentation domain, so the single-source contact test allows exactly that one literal and nothing else.
- **Files modified:** `src/lib/content/forms.ts`
- **Verification:** `komunikatPola` cases green; the e-mail single-source test still fails on any other literal address.
- **Committed in:** `79d082c`

---

**Total deviations:** 8 auto-fixed (3 blocking, 3 missing critical, 2 bugs)
**Impact on plan:** No scope creep. Deviations 1 and 2 are gate-hygiene, not behaviour: the compliant implementation was shipped and one unsatisfiable grep was replaced by an equivalent checkable one. Deviations 3 and 6 add two props the locked design contract already required. Deviations 4 and 5 were hard tooling blockers that stopped the commit. Deviations 7 and 8 close real holes in the test and the copy respectively, both found by running the thing rather than by reading it.

## Issues Encountered

- **`svelte-check` warned three times about frozen prop captures.** `const idBledu = \`${id}-err\`` in a component whose `id` is a prop captures only the first render's value. Both primitives now derive their helper ids, which is why the project stays at 0 warnings.
- **A dynamic `type` attribute forbids `bind:value`.** The whole point of `FormField` is one primitive for text, e-mail and telephone, so the control writes back through `value` plus an `oninput` handler instead. Behaviourally identical, and the reason is recorded in the file so the next agent does not "fix" it back.
- **No regression anywhere.** 128 unit tests and 66 Playwright tests pass, `npm run build` still prerenders every content route alongside the dynamic endpoint, and `npm run check` reports 0 errors and 0 warnings across 4200 files.

## Known Stubs

| Stub                                                | File                        | Reason                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TURNSTILE_SITEKEY = '1x00000000000000000000AA'`     | `src/lib/content/forms.ts`  | Cloudflare's published always-passes dummy site key. The real widget is created against the live account in Plan 07, and this constant is the single line that must be swapped before the forms do any real bot filtering. PLACEHOLDER-marked for the Phase 6 grep gate.        |
| IOD contact paragraph in `KLAUZULA`                  | `src/lib/content/forms.ts`  | The inspektor ochrony danych is not named to us and nothing is published in the BIP (D-03). The paragraph states that the contact will be published once the Urząd Gminy confirms it and points at the institutional inbox meanwhile, so it is honest rather than blank. Phase 6 launch gate. |
| Tymczasowa kopia zapasowa paragraph in `KLAUZULA`    | `src/lib/content/forms.ts`  | Intentional and required while the BCC exists (D-13). Carries an inline LAUNCH GATE note that this paragraph and the `BCC` constant in `mailer.ts` are removed in the SAME commit: a klauzula describing a copy that no longer exists is as wrong as a copy nobody was told about. |

None of the three blocks this plan's goal. The first is resolved by Plan 07; the other two are Phase 6 launch gates that are correctly disclosed rather than hidden.

## Watch Items

- **The honeypot is off-screen with `aria-hidden="true"` and `tabindex="-1"`, as the plan specifies.** axe reports a negatively-tabbable element inside an `aria-hidden` subtree as **incomplete**, not as a violation, so the Plan 04 axe gate (`violations` must equal `[]`) is unaffected. If a future axe version promotes it, the fix is to swap the off-screen class for `display: none` in `.wabik`.
- **The Turnstile CSP is still unproven in a browser** (Plan 01 coverage item D8, carried forward as D8 here). No page mounts the widget yet.

## User Setup Required

None for this plan. Plan 07 provisions the real Turnstile widget and site key, the Cloudflare Pages secrets and the `FORMS_KV` namespace id.

## Next Phase Readiness

**Ready**

- **Plan 04 can mount `<KontaktForm />` on `/kontakt` and get the whole capability.** The island needs no props and no page data; it imports its copy, its site key and its endpoint path itself. The static fallback and the `<noscript>` note ship with it, so the page composition does not have to remember Pitfall 7.
- **Plan 06 can build the zgłoszenie island from the same three primitives.** `FormField` already carries the telephone type and the textarea variant, `ConsentBlock` takes its consent sentence and klauzula label as props, and `KOPIA_POL.urodzenie` and `KOPIA_POL.telefon` are already authored. What Plan 06 must add is the `<fieldset>` plus two `<select>` controls for the child's birth month and year, which is the one part of UI-SPEC Component Contract 2 this plan did not need and did not build.
- **The klauzula is shared, not duplicated.** Both forms render the same `KLAUZULA` array, so the two disclosures cannot drift apart.

**Carry forward**

- **Plan 04 owns the section chrome.** The island renders the fallback panel and the form card only; the surrounding `<section class="warm">`, its `.inner` container and the page `h1` belong to the route, per the Phase 2 page-composition pattern.
- **Heading levels are the route's responsibility.** The card emits an `h2` and the klauzula emits `h3` sub-headings, so `/kontakt` must place exactly one `h1` above and nothing between.
- **The Plan 04 Playwright suite is where D6, D7 and D8 get proved.** The rendered error state with `aria-invalid` set, the success swap and its focus move, the failure path keeping typed values and resetting the widget, and the widget rendering under the real CSP all need a mounted route. The endpoint already has the `preview:test` dry-run seam, so the success path is reachable without a Resend key.
- **Do not "simplify" `value` plus `oninput` back to `bind:value` in `FormField`.** Svelte forbids two-way binding on an input with a dynamic `type`.
- **BCC launch gate (D-13) is now a two-file change:** the `BCC` constant in `src/lib/server/forms/mailer.ts` and the "Tymczasowa kopia zapasowa" block in `src/lib/content/forms.ts`, in the same commit. The copy test does not currently forbid removing only one; whoever removes the BCC should also drop the corresponding assertion.

## Self-Check: PASSED

All 7 created files exist on disk. All 3 task commits (`79d082c`, `df8fc15`, `803ad75`) exist in `git log`. `npm run check` (0 errors, 0 warnings, 4200 files), `npm run lint`, `npm run build`, `npm run test:unit` (128 pass) and `npm run test` (66 pass) all exit 0.

---

_Phase: 04-enrollment-contact-email-pipeline_
_Completed: 2026-08-14_
