---
phase: 04-enrollment-contact-email-pipeline
plan: 05
subsystem: api
tags: [sveltekit, svelte5-runes, cloudflare-pages-functions, resend, turnstile, rodo, wcag, playwright, node-test]

# Dependency graph
requires:
  - phase: 04-enrollment-contact-email-pipeline (Plan 01)
    provides: shared form orchestrator obsluz() with injected side effects, sanitizers, rate limiter, Resend mailer, FormResult contract, POST /api/kontakt as the reference endpoint
  - phase: 04-enrollment-contact-email-pipeline (Plan 03)
    provides: FormField / ConsentBlock / TurnstileWidget primitives, KontaktForm island, src/lib/content/forms.ts copy module with KOPIA_BLEDOW / KOPIA_POL / KLAUZULA
provides:
  - walidujZgloszenie() + ZgloszenieDane, the minimal-data enrollment shape (no child name, ever)
  - TEMAT_ZGLOSZENIE + zbudujTrescZgloszenie(), the second static subject and its plain-text body builder
  - POST /api/rekrutacja, the project's second dynamic route, with its own KV rate-limit counter
  - MIESIACE_WYBOR + nazwaMiesiaca(), the single Polish month table shared by the select and the mail body
  - KOPIA_ZGLOSZENIE, the full Polish copy set for the enrollment form
  - ZgloszenieForm.svelte, the site's third hydrated island
  - tests/rekrutacja-api.spec.ts (11 endpoint cases) plus 46 new unit cases
affects: [04-06 (mounts ZgloszenieForm on /rekrutacja), 04-07 (real Turnstile key + real send), 06 (pre-launch gates, Deklaracja dostepnosci)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Second endpoint as a thin second caller of the shared orchestrator: two readable files, zero shared-handler branching"
    - "Injected month-name lookup: one month table in the content module, consumed by both the select and the server-side mail body"
    - "Grouped-control accessibility: fieldset + visible legend, aria-describedby on the GROUP, two selects instead of input type=month"

key-files:
  created:
    - src/routes/api/rekrutacja/+server.ts
    - src/lib/components/ZgloszenieForm.svelte
    - tests/rekrutacja-api.spec.ts
  modified:
    - src/lib/server/forms/validate.ts
    - src/lib/server/forms/mailer.ts
    - src/lib/content/forms.ts
    - tests/forms.unit.ts
    - tests/forms-copy.unit.ts

key-decisions:
  - "The child's name is excluded STRUCTURALLY, not by policy: ZgloszenieDane has no such field, the validator builds its result as an explicit key literal (never a spread), the mail body has no line for it and the markup has no control for it. A forged key is dropped silently rather than rejected, so probing cannot learn the accepted shape."
  - "Birth-year window is current year minus 6 to plus 2 on the server, and the select offers only current year plus 1 down to minus 4. Narrowness is the point: a wider window would silently accept 1926 or 2226 as a real answer."
  - "The two endpoints stay two files. A shared handler parameterised by form name was rejected: every security-relevant decision already lives in obsluz(), so the only thing a shared handler adds is a branch where the forms could diverge."
  - "The rate-limit form name 'rekrutacja' is what gives this endpoint its own KV counter, so a busy contact form can never lock a parent out of an enrollment enquiry (T-04-26)."
  - "Polish month names live in src/lib/content/forms.ts and are injected into the server-side body builder. A second table in server code could drift from the one the parent chose from."
  - "MIESIACE_WYBOR and KOPIA_ZGLOSZENIE were added to the tests/forms-copy.unit.ts sweep, so every new string is now covered by the em-dash, emoji, single-source-phone and single-source-email assertions."
  - "The server reports the birth date under two keys (miesiac, rok) because it validates them separately; the island renders ONE message for the pair, associated with the fieldset, because to a parent it is one question."

patterns-established:
  - "Optional-field contract: an untouched control (absent, null or whitespace) is valid and becomes undefined; a PRESENT malformed value is a walidacja failure on its own key. Nothing is ever repaired."
  - "Numeric select validation: digit-shape check then explicit base-ten parse (Number.parseInt alone accepts '12abc'), with brak for an untouched control and niepoprawny for out-of-range."
  - "Optional fields render explicit Polish wording in the mail body ('nie podano', 'brak wiadomosci') so staff can tell a blank field from a broken message."

requirements-completed: []

coverage:
  - id: D1
    description: "walidujZgloszenie accepts the minimal waiting-list shape (parent name, e-mail, optional phone, child's birth month and year, optional message) and rejects everything outside it"
    requirement: FORM-01
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#walidujZgloszenie accepts the minimal body and returns only the whitelisted fields"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#walidujZgloszenie rejects the month value 13 as niepoprawny (plus 0, -1, 3.5, 3abc and the year-window cases)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The child's name is structurally impossible to submit or transmit: a forged key is dropped from the validated object and never reaches the mail body"
    requirement: FORM-01
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#walidujZgloszenie ignores a child-name key entirely, in the object and in the mail body"
        status: pass
      - kind: e2e
        ref: "tests/rekrutacja-api.spec.ts#klucz z imieniem dziecka jest po cichu pomijany i nadal zwracamy 200 (D-02)"
        status: pass
    human_judgment: false
  - id: D3
    description: "POST /api/rekrutacja runs the same proven pipeline as /api/kontakt: consent re-validated server-side, Turnstile verified server-side, hard-coded recipient, static subject, and no branch returning 200 on failure"
    requirement: FORM-02
    verification:
      - kind: e2e
        ref: "tests/rekrutacja-api.spec.ts (11 cases: 200/{ok:true}, zgoda 400, walidacja 400 for month and year, turnstile 400, 8 KiB cap 400, GET 405, honeypot 200, to/bcc ignored)"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#TEMAT_ZGLOSZENIE is a static constant, distinct from the contact subject"
        status: pass
    human_judgment: false
  - id: D4
    description: "The two endpoints keep independent rate-limit counters (the KV key carries the form name 'rekrutacja')"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#kluczLimitu (Plan 01 cases: the form name is part of the key) + grep gate: src/routes/api/rekrutacja/+server.ts contains 'rekrutacja'"
        status: pass
    human_judgment: false
  - id: D5
    description: "ZgloszenieForm island: fieldset + visible legend + two Polish selects for the birth month and year, no input type=month, shared FormField/ConsentBlock/TurnstileWidget accessibility contract, error summary, success panel, static fallback and noscript block"
    requirement: RECRUIT-03
    verification:
      - kind: unit
        ref: "npm run check (svelte-check types + compiler a11y): 0 errors, 0 warnings; npm run build exits 0"
        status: pass
    human_judgment: true
    rationale: "The island is not mounted on a route until Plan 06, so no browser, axe or keyboard run can exercise it yet. Visual conformance (48px control box, contrast, focus ring, stacked-to-side-by-side selects) and screen-reader announcement of the grouped question need a human on the real page."
  - id: D6
    description: "The form is framed honestly as an expression of interest for the waiting list, and states beside the fields that the formal wniosek is filed in person at the Urzad Gminy (D-01)"
    requirement: RECRUIT-03
    verification:
      - kind: unit
        ref: "tests/forms-copy.unit.ts#the zgłoszenie intro frames the form as an enquiry, not a formal wniosek (D-01)"
        status: pass
      - kind: unit
        ref: "tests/forms-copy.unit.ts#the zgłoszenie success body repeats where the formal wniosek goes (D-01)"
        status: pass
    human_judgment: false
  - id: D7
    description: "RODO consent contract on the enrollment form: unticked checkbox, klauzula informacyjna one keystroke away, consent re-validated server-side, nothing stored"
    requirement: RECRUIT-04
    verification:
      - kind: e2e
        ref: "tests/rekrutacja-api.spec.ts#brak zgody RODO zwraca 400 i kod zgoda (RECRUIT-04)"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#walidujZgloszenie returns code zgoda when the consent flag is absent"
        status: pass
    human_judgment: true
    rationale: "The server boundary is proven, but the visible consent row, the collapsed klauzula and the unticked-on-load guarantee can only be confirmed on the rendered /rekrutacja page (Plan 06)."

# Metrics
duration: 15min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 05: Zgloszenie pipeline, endpoint and island Summary

**A waiting-list zgloszenie can now be validated, delivered and filled in: POST /api/rekrutacja reuses the Plan 01 orchestrator with its own subject, body format and KV counter, and ZgloszenieForm collects the smallest lawful data set with no field for the child's name anywhere.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-14T18:53:00Z
- **Completed:** 2026-08-14T19:08:00Z
- **Tasks:** 3
- **Files modified:** 8 (3 created, 5 modified)

## Accomplishments

- **`walidujZgloszenie` + `ZgloszenieDane`**: parent name (100 cap), e-mail (reject-never-repair), optional phone, child's birth month (1-12) and year (current -6 to +2), optional message (2000 cap). Failures collect into a `pola` record keyed exactly `imie | email | telefon | miesiac | rok | wiadomosc`, and the strict `zgoda === true` identity check runs after the field check so a parent sees every correction at once.
- **The child's name cannot be submitted, transmitted or stored.** No field in the type, no key in the returned literal, no line in the mail body, no control in the markup. A forged `imie_dziecka` key is dropped silently (200, not 400) so probing cannot learn the shape. Proven at both levels: unit (`... in the object and in the mail body`) and endpoint.
- **`POST /api/rekrutacja`**, the second dynamic route: byte-identical guard order to `/api/kontakt` (missing secret 502/`wysylka`, non-JSON 400, 8 KiB cap 400), the shared orchestrator reused unchanged, and `podLimitem(kv, 'rekrutacja', ...)` giving the form its own counter.
- **`TEMAT_ZGLOSZENIE` + `zbudujTrescZgloszenie`**: a second static Polish subject (so staff can filter) and a labelled plain-text body that renders `nie podano` / `brak wiadomości` for untouched optional fields. `zbudujPayload` and the FROM/TO/BCC constants were not touched, so both forms keep one sending identity.
- **`ZgloszenieForm.svelte`**, the third hydrated island: mirrors KontaktForm's status regions, focus-management contract, honeypot, static fallback, noscript block, card and submit box; adds a `fieldset` with a visible `legend`, a minimisation hint and two Polish `select` controls (stacked below 640px, side by side above) instead of `input type="month"`, whose picker chrome cannot be forced to Polish.
- **Tests:** 164 unit cases green (46 new), 92/92 Playwright green including the new 11-case `tests/rekrutacja-api.spec.ts` and the untouched `tests/kontakt-api.spec.ts`.

## Task Commits

1. **Task 1: Extend the server module for the minimal-data zgloszenie shape** - `2df0a4d` (feat)
2. **Task 2: Ship the /api/rekrutacja endpoint** - `14d2e24` (feat)
3. **Task 3: Zgloszenie copy and the ZgloszenieForm island** - `501bca9` (feat)

## Files Created/Modified

- `src/lib/server/forms/validate.ts` - `ZgloszenieDane` + `walidujZgloszenie`, plus the `pusty` / `liczbaCalkowita` / `kodLiczby` helpers for optional and numeric fields
- `src/lib/server/forms/mailer.ts` - `TEMAT_ZGLOSZENIE`, `zbudujTrescZgloszenie` (injected month-name lookup); payload and sending identity unchanged
- `src/routes/api/rekrutacja/+server.ts` - the second dynamic route (`prerender = false`, POST only)
- `src/lib/content/forms.ts` - `MIESIACE_WYBOR`, `nazwaMiesiaca`, `KOPIA_ZGLOSZENIE`, and `KOPIA_POL` entries for the `miesiac` / `rok` keys
- `src/lib/components/ZgloszenieForm.svelte` - the enrollment island (no props, posts to the enrollment endpoint)
- `tests/forms.unit.ts` - 46 zgloszenie cases (month and year ranges, optional-field contract, consent, child-name drop, body wording, subject)
- `tests/forms-copy.unit.ts` - `KOPIA_ZGLOSZENIE` and `MIESIACE_WYBOR` added to the copy-rule sweep, plus D-01 framing, D-02 hint and month-table assertions
- `tests/rekrutacja-api.spec.ts` - 11 endpoint cases against the real Cloudflare runtime

## Decisions Made

- **Structural, not procedural, data minimisation.** The validated object is built as an explicit four-to-six key literal, never a spread of the request body, so no future edit can accidentally widen it. The drop is silent (200) rather than a rejection, because a 400 on an unexpected key tells an attacker exactly which keys are accepted.
- **Narrow year window on purpose.** Server accepts current year -6 to +2; the select offers current year +1 down to -4, so every rendered option is always inside the server window, and the current year survives a build sitting across a new year without a redeploy.
- **Two endpoint files, not one parameterised handler.** Explicitly reconsidered and rejected in a comment at the top of the new endpoint: the shared orchestrator already owns every security decision, so a shared handler only buys a branch where the forms could diverge.
- **One month table, injected.** `nazwaMiesiaca` lives in the content module and is passed into the server-side body builder, so the name in the mail is by construction the name the parent chose.
- **The birth date is one question with two keys.** The server answers under `miesiac` and `rok`; the island derives a single message, associates it with the `fieldset` via `aria-describedby`, and lists it once in the error summary linking to the month select.
- **`prefers-reduced-motion` guard extended** to the select border transition, matching the FormField precedent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Month table moved from Task 3 into Task 1**
- **Found during:** Task 1 (and would have blocked Task 2)
- **Issue:** The plan places `MIESIACE_WYBOR` and the month-name lookup in Task 3, but Task 2's endpoint injects that lookup into `zbudujTrescZgloszenie`, and Task 1's unit case for the body wording needs it too. As written, Task 2 could not compile.
- **Fix:** `MIESIACE_WYBOR` + `nazwaMiesiaca` were added to `src/lib/content/forms.ts` in the Task 1 commit; Task 3 added `KOPIA_ZGLOSZENIE` and the `KOPIA_POL` entries as planned. No content change, only ordering.
- **Files modified:** src/lib/content/forms.ts
- **Verification:** `npm run test:unit` (real lookup exercised by the body-wording cases), `npm run check`
- **Committed in:** `2df0a4d` (Task 1 commit)

**2. [Rule 2 - Missing Critical] New copy strings added to the copy-rule sweep**
- **Found during:** Task 3
- **Issue:** `tests/forms-copy.unit.ts` sweeps an EXPLICIT list of exports for em dashes, emoji and pasted contact values. `KOPIA_ZGLOSZENIE` and `MIESIACE_WYBOR` would have escaped every one of those assertions, exactly the gap the plan's "keep every new string inside the objects the assertions already sweep" instruction intends to close.
- **Fix:** Both exports added to `WSZYSTKIE_STRINGI`, plus six new assertions pinning the D-01 framing (intro and success body), the D-02 minimisation hint, the absence of any child-name wording, the twelve-month table and the two new `KOPIA_POL` keys.
- **Files modified:** tests/forms-copy.unit.ts
- **Verification:** `npm run test:unit` 164/164 green
- **Committed in:** `501bca9` (Task 3 commit)

**3. [Rule 1 - Bug] Precedence bug in a new copy assertion**
- **Found during:** Task 3
- **Issue:** `assert.equal(komunikatPola('telefon', 'niepoprawny')?.length ?? 0 > 0, true)` parses as `?? (0 > 0)`, so it compared 70 to `true` and failed.
- **Fix:** Rewritten as `assert.ok((komunikatPola('telefon', 'niepoprawny') ?? '').length > 0)`.
- **Files modified:** tests/forms-copy.unit.ts
- **Verification:** `npm run test:unit` 164/164 green
- **Committed in:** `501bca9` (Task 3 commit)

**4. [Rule 2 - Missing Critical] Urzad Gminy name kept in the nominative**
- **Found during:** Task 3
- **Issue:** The UI-SPEC intro and success body are written as "w Urzędzie Gminy w Stromcu" (locative), but `urzad.name` is nominative and the single-source rule forbids pasting the office name. Plan 04-04 hit the same constraint on the /kontakt info box.
- **Fix:** Both sentences rephrased so the interpolated nominative follows a verb ("przyjmuje go Urząd Gminy w Stromcu, ul. Piaski 4, pokój 17, w godzinach ...") rather than a preposition. Meaning, facts and the D-01 framing are unchanged; only the clause order differs from the UI-SPEC wording.
- **Files modified:** src/lib/content/forms.ts
- **Verification:** `tests/forms-copy.unit.ts` asserts the intro and the success body both interpolate `urzad.name`, `urzad.room` (and the intro `urzad.wnioskiHours`) and still say `osobiście`
- **Committed in:** `501bca9` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (1 blocking, 2 missing critical, 1 bug)
**Impact on plan:** No scope creep. One ordering fix, two test-coverage fixes and one Polish-grammar fix that follows an already-established project constraint.

## Issues Encountered

- **Acceptance criterion `grep -c 'obsluz' ... returns 1` is literally unsatisfiable** for a file that imports and calls the shared orchestrator: the import line and the call line are two matching lines (the reference endpoint `/api/kontakt` returns 3). The comment mentioning it was reworded to "the shared orchestrator" so the file is at the achievable minimum: `grep -c 'obsluz'` = 2, `grep -c 'obsluz('` = 1 (the single call site). The criterion's intent, that the pipeline is reused and not reimplemented, holds.
- **The intended RED for `tests/rekrutacja-api.spec.ts` was verified structurally, not by a Playwright run.** At the end of Task 1 the endpoint file did not exist, so every case would 404; running the full build plus `wrangler pages dev` purely to watch it fail was skipped. The GREEN run after Task 2 is the meaningful gate and passed 20/20 with the contact suite.
- Prettier reflowed the long `test.describe.serial(...)` title into an awkward `test.describe\n\t.serial(` form; the describe title was shortened to `API rekrutacja: RECRUIT-03 / RECRUIT-04 / FORM-02 acceptance` (FORM-01 stays documented in the file's docblock).

## Requirements Status

`RECRUIT-03`, `RECRUIT-04`, `FORM-01` and `FORM-02` are deliberately left UNMARKED, following the Plan 01 and Plan 03 precedent: no parent can reach this form until Plan 06 mounts it on `/rekrutacja`, and the real Turnstile key plus the first real send land in Plan 07. Marking them now would claim a capability a visitor cannot use.

## User Setup Required

None. No new binding, no new secret, no new package. The endpoint reads the same `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SALT`, `RATE_LIMIT_MAX`, `FORM_DRY_RUN` and `FORMS_KV` as `/api/kontakt`.

## Next Phase Readiness

- **Plan 06 can mount immediately.** `ZgloszenieForm` takes no props and owns its own card, fallback and noscript block. The route supplies the section wrapper and should point its `aria-labelledby` at the island's `id="zgloszenie-naglowek"`, exactly as `/kontakt` does with `id="formularz-naglowek"`.
- **Plan 06 must add `/rekrutacja` to the crawler enforcement** (drop it from `KNOWN_FUTURE_ROUTES` in `svelte.config.js`) and write the page-level Playwright plus axe spec. Locate form fields by ROLE plus accessible name, never `getByLabel`: the consent sentence ends with the word the message label uses, which makes `getByLabel` ambiguous on this form too.
- **Carried-forward concern (unchanged):** `frame-src` in the CSP is still browser-unproven, because the dummy Turnstile sitekey renders no frame. Re-run the `/rekrutacja` and `/kontakt` axe scans after Plan 07 swaps in the real key.
- **Launch gate reminder:** the BCC constant in `mailer.ts` and the klauzula paragraph describing the backup copy must be removed in the SAME commit (D-13). This plan added a second form that relies on both.

## Self-Check: PASSED

- `src/routes/api/rekrutacja/+server.ts` FOUND
- `src/lib/components/ZgloszenieForm.svelte` FOUND
- `tests/rekrutacja-api.spec.ts` FOUND
- commits `2df0a4d`, `14d2e24`, `501bca9` FOUND in git log
- `npm run check` 0 errors / 0 warnings, `npm run lint` clean, `npm run test:unit` 164/164, `npx playwright test` 92/92, `npm run build` exits 0

---
*Phase: 04-enrollment-contact-email-pipeline*
*Completed: 2026-08-14*
