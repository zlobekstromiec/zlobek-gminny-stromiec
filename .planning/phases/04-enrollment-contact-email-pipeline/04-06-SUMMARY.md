---
phase: 04-enrollment-contact-email-pipeline
plan: 06
subsystem: ui
tags:
  [
    sveltekit,
    svelte5-runes,
    prerender,
    forms,
    turnstile,
    accessibility,
    wcag21aa,
    data-table,
    playwright,
    axe,
    seo
  ]

# Dependency graph
requires:
  - phase: 01-live-homepage-design-foundation
    provides: 'the Seo component and its noindex default, the two-tier @theme token set in app.css, the global focus ring and reduced-motion base layer, the TopBar/Header/Footer landmark shell that owns <main>, and the v1.2 Recruitment numbered-step and info-card treatments'
  - phase: 02-content-pages-cms
    provides: 'the shared build-time document resolver src/lib/server/dokumenty.ts with its prefix and traversal guards, and the /dokumenty route contract this page reuses verbatim (page-head block, alternating band sections with aria-labelledby, responsive .inner container, meta-inside-link rows)'
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'Plan 01: the shared form orchestrator behind POST /api/kontakt plus the preview:test dry-run seam and the Turnstile CSP directives. Plan 02: the [BIP]-confirmed facts in site.ts, the exported urzad const, and the derived closed-nabór strings. Plan 04: the route composition pattern, the section-labelled-by-island-heading pattern and the Turnstile test seam. Plan 05: POST /api/rekrutacja, the ZgloszenieForm island and the KOPIA_ZGLOSZENIE copy set'
provides:
  - 'src/lib/content/rekrutacja.ts, the code-authored regulamin content module: KRYTERIA (8 scoring rows), REMIS, PROCEDURA (6 steps), OPLATY, BIP_ZLOBEK, WNIOSKI_PUSTE'
  - 'src/lib/components/KryteriaTable.svelte, the project first real data table (visible caption, th scope=col, th scope=row, no scrolling wrapper)'
  - 'src/lib/components/FeeBox.svelte, the D-15 compact fee panel that cannot separate an amount from its ZUS condition'
  - 'src/routes/rekrutacja/, the live prerendered enrollment route: the last page a parent needed and the second reachable form on the site'
  - 'tests/rekrutacja.spec.ts, 17 page-level acceptance cases including the full submit-to-success path on the real Cloudflare runtime and two axe scans'
  - 'a build-enforced /rekrutacja link target: every section route linked from the header, footer and hero now resolves'
  - 'static/sitemap.xml carrying the /rekrutacja entry'
  - 'a repository-wide gate keeping the archival 2026/2027 stage dates out of src/ entirely, comments included'
affects: [04-07-secrets-and-kv-provisioning, 05-cennik-galeria-dojazd, 06-launch-hardening]

# Tech tracking
tech-stack:
  added: [] # zero npm packages installed, by design (T-04-SC)
  patterns:
    - 'Real data table for real two-dimensional content: visible caption, one th scope=col per column, one th scope=row per data row, and deliberately no horizontally scrolling wrapper (a wrapper without tabindex plus a labelled region role is unreachable by keyboard)'
    - 'A conditional fact and its amount live in one content-module block and one component block, so no layout or responsive change can separate them'
    - 'Page composes, island owns its own chrome: the route contributes only the surface wrapper and takes the section accessible name from the island heading id'
    - 'Forbidden source facts are gated out of the whole src tree, not just the module that renders them, so a future edit cannot lift them out of an explanatory comment'

key-files:
  created:
    - src/lib/content/rekrutacja.ts
    - src/lib/components/KryteriaTable.svelte
    - src/lib/components/FeeBox.svelte
    - src/routes/rekrutacja/+page.server.ts
    - src/routes/rekrutacja/+page.svelte
    - tests/rekrutacja.spec.ts
  modified:
    - svelte.config.js
    - static/sitemap.xml
    - src/lib/content/site.ts
    - .planning/REQUIREMENTS.md

key-decisions:
  - 'The recruitment content is a plain code-authored module with no CMS collection, no config.yml entry and no new Sveltia or GitHub coupling (D-18). RECRUIT-05 is therefore marked complete on its document-management half only: the info-and-dates editing half is explicitly descoped for v1 by the user (04-CONTEXT.md Phase Boundary), which amends ROADMAP success criterion 5.'
  - 'The kryteria table renders the regulamin scoring rows including the two that mention parents working. Those are SCORING criteria and are publishable; the statut work-based ELIGIBILITY criterion (source document section 10.5) appears nowhere, and eligibility copy still names residence only. The distinction is written into the module so a later editor cannot collapse it.'
  - 'The fee box states what the ZUS benefit can cover together with the condition of it being granted, in one sentence, and never states a zero amount as the fee a parent pays. The full 2 337 / obniżka / ZUS breakdown stays for /cennik in Phase 5 (D-15).'
  - 'The archival 2026/2027 stage dates were removed from an explanatory comment in site.ts, not just kept out of the new page. The plan gate is repository-wide, and a date sitting in a comment is one careless copy-paste away from being shipped copy.'
  - 'RECRUIT-03, RECRUIT-04, FORM-01 and FORM-02 stay UNMARKED, per this plan requirements field. The capability is now genuinely reachable and proven end to end on the real runtime, but the real Turnstile site key and the first real send land in Plan 07, which is where those four close.'

patterns-established:
  - 'Pattern: the acceptance spec imports the content modules. Every point value, amount, room number and status string is interpolated from site.ts, rekrutacja.ts and forms.ts rather than retyped, so a data sweep cannot leave the page and the test agreeing on a wrong fact.'
  - 'Pattern: when a sentence is legitimately rendered twice on one page, the spec narrows to the element under test rather than deleting the assertion.'
  - 'Pattern: a source-document do-not-publish gate is enforced three ways at once: absent from the content module (grep), absent from the delivered HTML (Playwright), absent from the whole src tree (repository grep).'

requirements-completed: [RECRUIT-01, RECRUIT-02, RECRUIT-05]

coverage:
  - id: D1
    description: 'A visitor on /rekrutacja gets HTTP 200 and reads the current nabór status, the admission criteria with their point values, the real procedure and a compact fee summary'
    requirement: 'RECRUIT-01'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#strona /rekrutacja odpowiada statusem 200'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#banner statusu podaje zakończony nabór i otwartą listę rezerwową (D-06, D-14)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#kryteria to prawdziwa tabela z podpisem i nagłówkami wierszy (RECRUIT-01)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#procedura mówi o złożeniu osobistym, podaje pokój i termin odwołania'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#ramka opłat podaje kwotę i wyżywienie, a zero nigdy bez warunku (D-15, sekcja 10.1)'
        status: pass
    human_judgment: false
  - id: D2
    description: 'The closed nabór is presented as neutral information on the band surface and never in the semantic error colour, and the archival 2026/2027 stage dates are never rendered as current'
    requirement: 'RECRUIT-01'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#zamknięty nabór nie jest komunikatem błędu: brak tokenów danger (UI-SPEC reguła 2)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#strona nie publikuje archiwalnych terminów naboru 2026/2027 (sekcja 10.3)'
        status: pass
      - kind: other
        ref: "grep -rnE '01\\.04\\.2026|27\\.04\\.2026|29\\.04\\.2026|12\\.05\\.2026' src/ returns no matches; grep -cE 'danger' src/routes/rekrutacja/+page.svelte returns 0"
        status: pass
    human_judgment: false
  - id: D3
    description: 'A visitor downloads the enrollment documents from the page, every link resolving under /dokumenty/ and returning 200, and reaches the complete set on the BIP through a clearly labelled external link'
    requirement: 'RECRUIT-02'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#każdy wniosek do pobrania wskazuje realny plik pod /dokumenty/ i zwraca 200 (RECRUIT-02)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#link do BIP jest bezpieczny i oznaczony jako nowa karta (RECRUIT-02, T-04-31)'
        status: pass
    human_judgment: false
  - id: D4
    description: 'The document rows are sourced from the same shared resolver as /dokumenty and the homepage panel, so a document staff add or replace appears here with correct metadata and no code change'
    requirement: 'RECRUIT-05'
    verification:
      - kind: other
        ref: "src/routes/rekrutacja/+page.server.ts imports readDokumenty from $lib/server/dokumenty and filters kategoria === 'rekrutacja'; grep -c 'statSync\\|node:fs' returns 0 and grep -c 'slice(' returns 0 (no second resolver, no homepage teaser slice)"
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#każdy wniosek do pobrania wskazuje realny plik pod /dokumenty/ i zwraca 200 (the rendered rows are the resolver output, meta included)'
        status: pass
    human_judgment: true
    rationale: 'The code path is single-sourced and proven, but the staff-facing half of the loop (add a document through the CMS, see it appear here with correct metadata) has not been exercised by a human on the live site in this plan. Worth one minute at the Phase 6 CMS handover. The info-and-dates editing half of RECRUIT-05 is descoped for v1 by the user.'
  - id: D5
    description: 'The recruitment content ships CMS-free and CMS-agnostic: no collection, no config.yml entry, no new Sveltia or GitHub coupling (D-18)'
    verification:
      - kind: other
        ref: 'git show --stat for the three task commits: static/admin/config.yml is not touched by this plan, and src/lib/content/rekrutacja.ts is a plain TypeScript module with no CMS mapping'
        status: pass
    human_judgment: false
  - id: D6
    description: 'The procedure states in-person filing only at the Urzad Gminy address, room and hours read from site.ts, that electronic and postal filing are unavailable, that the Komisja Rekrutacyjna is appointed by the Wojt, that an appeal runs 7 days to the Wojt, and that continuation is by deklaracja kontynuacji'
    requirement: 'RECRUIT-01'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#procedura mówi o złożeniu osobistym, podaje pokój i termin odwołania (asserts osobiście, elektroniczną, urzad.room, urzad.wnioskiHours, Komisja Rekrutacyjna, 7 dni, deklaracji kontynuacji)'
        status: pass
      - kind: other
        ref: "grep -cE 'Radomska|Piaski|510 094|ugstromiec\\.pl' src/routes/rekrutacja/+page.svelte returns 0 (every value interpolated)"
        status: pass
    human_judgment: false
  - id: D7
    description: 'A parent can submit the waitlist zgloszenie from this page and is told the truth about whether it was sent'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#pełna ścieżka wysyłki: formularz zamienia się w panel sukcesu (RECRUIT-03, D-11)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#wysyłka bez zgody RODO zachowuje wpisane wartości i pokazuje instrukcję (D-12)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja-api.spec.ts (Plan 05, 11 endpoint cases on the real runtime)'
        status: pass
    human_judgment: false
  - id: D8
    description: 'The route has exactly one h1, an unbroken heading order, a real table with a caption and scoped headers, and zero axe violations at WCAG 2.1 AA resting and in the rendered error state'
    verification:
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#dokładnie jeden nagłówek h1 o treści Rekrutacja do żłobka'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#brak naruszeń WCAG 2.1 AA na /rekrutacja (SITE-04 / A11Y baseline)'
        status: pass
      - kind: e2e
        ref: 'tests/rekrutacja.spec.ts#brak naruszeń WCAG 2.1 AA w stanie błędu walidacji z aria-invalid'
        status: pass
      - kind: other
        ref: 'npm run check: 0 errors, 0 warnings across 4215 files (svelte-check types plus compiler a11y)'
        status: pass
    human_judgment: true
    rationale: 'axe cannot judge whether the two-column table is actually comfortable to read on a 360px viewport, nor whether a screen-reader user hears the points cell announced with its criterion in a real reader. The responsive suite proves no horizontal overflow at 375px, but the table reading experience and the NVDA/VoiceOver announcement of the scoped headers want one human pass.'
  - id: D9
    description: 'Every link pointing at /rekrutacja is now build-enforced, and the route carries a sitemap entry'
    verification:
      - kind: other
        ref: "npm run build exits 0 and emits .svelte-kit/cloudflare/rekrutacja.html; the crawler now reports 404 only for /cennik, /galeria and /dojazd; grep -c \"'/rekrutacja'\" svelte.config.js returns 0 and grep -cE \"'/cennik'|'/galeria'|'/dojazd'\" returns 3"
        status: pass
      - kind: other
        ref: "grep -c 'rekrutacja' static/sitemap.xml returns 1"
        status: pass
    human_judgment: false

# Metrics
duration: 14min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 06: The /rekrutacja Route Summary

**The page the żłobek's audience actually comes for: a status-first enrollment route composed from the regulamin digest, with the project's first real data table, a fee panel that cannot separate an amount from its condition, the waiting-list island mounted and reachable, and 17 acceptance cases including a real submit through the real Cloudflare runtime.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-14T18:13:50Z
- **Completed:** 2026-08-14T18:27:50Z
- **Tasks:** 3
- **Files modified:** 10 (6 created, 4 modified)

## Accomplishments

- **Both vertical slices of the phase are now closed.** Plan 01 built an endpoint nobody could reach, Plan 05 built a second endpoint and an island nothing mounted. A parent can now open `/rekrutacja`, learn that the nabór is finished and the lista rezerwowa is open, see exactly how points are awarded, understand that the wniosek is filed in person at the Urząd Gminy, download it, read the fee summary, and leave their details for the waiting list. Every section route linked from the header, the footer and the hero resolves.
- **The regulamin is now code-authored content with one source per fact.** `src/lib/content/rekrutacja.ts` holds all eight scoring rows with their verbatim point values (50, 20, then six at 10), the tie-break rule, the six procedure steps, the compact fee block, the BIP reference and the empty state. No address, room or office-hours value is duplicated: every one interpolates the shared `urzad` object, so `grep -cE 'Piaski|pokój 17|8:00–15:00'` returns 0 for the module and `grep -cE 'Radomska|Piaski|510 094|ugstromiec\.pl'` returns 0 for the route.
- **The source document's do-not-publish gate is enforced in three independent places.** The archival 2026/2027 stage dates are absent from the content module (grep gate), absent from the delivered HTML (a Playwright case fetches the page and asserts all four dates are missing), and now absent from the entire `src/` tree including comments (repository-wide grep, which required removing them from an explanatory comment in `site.ts`). The statut work-based eligibility criterion appears nowhere, and no zero amount ships anywhere: the fee-box case asserts the rendered text matches no unconditional zero pattern.
- **The project's first real data table, and it is a real one.** `KryteriaTable.svelte` has a visible `<caption>`, one `<th scope="col">` per column and one `<th scope="row">` per criterion, so the points cell is announced with the criterion it belongs to. It is deliberately not wrapped in a horizontally scrolling container: two columns fit a small viewport with wrapping, and a scrolling wrapper without `tabindex="0"` plus a labelled region role would be keyboard-unreachable. The reasoning is written into the component so a future third column brings its focusable region with it.
- **The fee box makes the section 10.1 mistake structurally hard.** The amount, the ZUS condition, the meal cap and the absence rule are one content block rendered as one panel, so no responsive rule, layout change or refactor can leave the amount standing without the condition under which the benefit is granted.
- **A broken link to the site's most-visited page is now a build error.** `/rekrutacja` left `KNOWN_FUTURE_ROUTES`, and the crawler now reports 404 only for `/cennik`, `/galeria` and `/dojazd`, all of which arrive in Phase 5 and Phase 6.
- **Both axe gates are green on a page that carries a table, a fieldset, two selects and a form.** The resting scan and a second scan taken after an empty submit (every required control invalid, the `role="alert"` summary rendered and focused) both return zero violations at `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. That closes the Plan 05 carry-forward items D5 and D7, which could not be tested until a route mounted the island.
- **The whole suite is green and grew by 17.** 109 Playwright cases (was 92) and 164 `node --test` cases pass; `npm run check` reports 0 errors and 0 warnings across 4215 files; `npm run lint` and `npm run build` exit 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the regulamin content module and the acceptance spec (RED)** - `eacf697` (test)
2. **Task 2: Build the criteria table, the fee box and the /rekrutacja route** - `8cc73aa` (feat)
3. **Task 3: Enforce the route in the crawler and the sitemap, and take the suite green** - `d132fd9` (feat)

## Files Created/Modified

**Created**

- `src/lib/content/rekrutacja.ts` - the regulamin content module: type `Kryterium` + `KRYTERIA` (8 rows), `REMIS`, type `KrokProcedury` + `PROCEDURA` (6 steps), `OPLATY` (PLACEHOLDER-marked per D-09), `BIP_ZLOBEK`, `WNIOSKI_PUSTE`. Imports `urzad` from `site.ts`; no CMS coupling of any kind (D-18).
- `src/lib/components/KryteriaTable.svelte` - props `{ kryteria, caption }`, a real table plus the tie-break sentence as prose beneath it.
- `src/lib/components/FeeBox.svelte` - no props, reads `OPLATY`; tint-yellow panel with the 2px accent border, the v1.2 Recruitment info-card treatment reused rather than re-derived.
- `src/routes/rekrutacja/+page.server.ts` - build-time load calling the shared `readDokumenty()` and keeping the `rekrutacja` category in full (no second resolver, no homepage teaser slice).
- `src/routes/rekrutacja/+page.svelte` - the seven-section status-first composition: page header (white), status banner (band), zgłoszenie form (warm), kryteria (white), procedura (band), opłaty (white), wnioski (warm). One `h1`, one `h2` per section, six `aria-labelledby` references, one hydrated island, zero contact or address literals, zero references to the semantic error tier.
- `tests/rekrutacja.spec.ts` - 17 cases with the standing "do not weaken these assertions" header, the `POLE_TOKENU` / `otworzRekrutacje` / `poczekajNaToken` widget-readiness trio carried over from Plan 04, the document link-integrity loop, the archival-date absence assertion and two axe scans placed last.

**Modified**

- `svelte.config.js` - `/rekrutacja` removed from `KNOWN_FUTURE_ROUTES`, replaced by a comment recording the graduation; `/cennik`, `/galeria` and `/dojazd` untouched; the CSP block untouched.
- `static/sitemap.xml` - a `/rekrutacja` `<url>` entry in the same shape as the `/kontakt` one, same placeholder host, placeholder-host comment left for Phase 6.
- `src/lib/content/site.ts` - the archival stage dates removed from the `recruitmentOpen` rationale comment (see Deviation 3); no exported value changed.
- `.planning/REQUIREMENTS.md` - `RECRUIT-01`, `RECRUIT-02` and `RECRUIT-05` checked off and their traceability rows flipped to Complete.

## Decisions Made

- **RECRUIT-05 is marked complete on its document-management half only.** The info-and-dates editing half is explicitly descoped for v1 by the user (04-CONTEXT.md Phase Boundary, D-18), which amends ROADMAP success criterion 5. Marking it is defensible because the half that ships is the half that matters operationally: staff replace a wniosek through the existing CMS and this page, `/dokumenty` and the homepage all pick it up with correct metadata from one resolver.
- **RECRUIT-03, RECRUIT-04, FORM-01 and FORM-02 stay unmarked**, following this plan's `requirements` field. The capability is now genuinely reachable and proven end to end, but the real Turnstile site key and the first real send land in Plan 07. See Next Phase Readiness: Plan 07 must not forget them.
- **The two work-related scoring rows ship; the work-based eligibility criterion does not.** The distinction is written into the content module as a comment, because it is exactly the kind of nuance a later editor would collapse into "the żłobek accepts children whose parent works in the gmina", which section 10.5 forbids.
- **The archival dates were removed from a `site.ts` comment rather than tolerated there.** See Deviation 3.
- **The empty state keeps the BIP link.** The download list is rendered from a CMS-editable category that can legitimately be empty, and an empty state that leaves a parent with nowhere to go would be worse than no section at all.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The tie-break sentence is legitimately rendered twice, and the spec locator was ambiguous**

- **Found during:** Task 3 (first full run)
- **Issue:** `page.getByText(REMIS)` raised a strict-mode violation resolving to two elements. The plan requires `KryteriaTable` to render the tie-break sentence beneath the table AND requires procedure step 3 to state that ties are broken by the date of receipt. Both are correct, and the sentence is the same because the fact is the same. This is a defect in the spec locator, not in the content.
- **Fix:** The assertion now targets the table's own paragraph: `page.locator('.remis')` with `toHaveCount(1)` and `toHaveText(REMIS)`. Strengthened rather than weakened: it now pins the element, the count and the exact text instead of merely finding the words somewhere on the page.
- **Files modified:** `tests/rekrutacja.spec.ts`
- **Verification:** 17/17 rekrutacja cases pass; no locator in the file is ambiguous.
- **Committed in:** `d132fd9`

**2. [Rule 1 - Bug] The BIP address is linked site-wide from the footer, so a page-level count of 1 was wrong**

- **Found during:** Task 3 (first full run)
- **Issue:** `a[href="{BIP_ZLOBEK.url}"]` resolved to two elements. `Footer.svelte` links to the żłobek's BIP page on every route, which is a standing requirement for a public body (CLAUDE.md: link prominently to the existing BIP, do not rebuild it). The plan's assertion is about the download section's own link.
- **Fix:** The locator is scoped to `section[aria-labelledby="wnioski-heading"]`, so the case now proves that the download section carries exactly one safe BIP link, which is the actual contract. The `target`, `rel` and visually-hidden new-tab suffix assertions are unchanged.
- **Files modified:** `tests/rekrutacja.spec.ts`
- **Verification:** the case passes and would fail if the section link were removed, duplicated or stripped of its `rel`.
- **Committed in:** `d132fd9`

**3. [Rule 2 - Missing Critical] The repository-wide archival-date gate failed on a pre-existing comment**

- **Found during:** Task 3
- **Issue:** The plan's repository-wide gate (`grep -rnE '01\.04\.2026|27\.04\.2026|29\.04\.2026|12\.05\.2026' src/` returns no matches) failed on one line: the `recruitmentOpen` rationale comment in `src/lib/content/site.ts`, written in Plan 04-02, spelled the archival window as `01.04-12.05.2026`. `site.ts` is not in this plan's `files_modified` list.
- **Fix:** The comment now says the stages ran in the spring of 2026 and are archival, and adds a sentence recording that the exact dates are deliberately not repeated in `src/` because a date sitting in a comment is one careless copy-paste away from being shipped copy. No exported value changed, so the change is behaviourally inert.
- **Files modified:** `src/lib/content/site.ts`
- **Verification:** the repository-wide grep returns 0 matches; `npm run check`, `npm run lint`, `npm run test:unit` (164) and the full Playwright suite (109, including the whole homepage suite that reads this module) all green after the edit.
- **Committed in:** `d132fd9`

**4. [Rule 3 - Blocking] `contact` not imported into the content module**

- **Found during:** Task 1
- **Issue:** The plan says to import `urzad` and `contact` from `$lib/content/site` so no contact value is duplicated. Nothing in this module renders a żłobek telephone number, e-mail or opening-hours value (the fallback panel that does is owned by the island), so importing `contact` would be an unused import and `npm run lint` treats that as an error.
- **Fix:** Only `urzad` is imported. The rule the instruction protects is fully satisfied: the module contains no contact literal, and the enforcing grep returns 0.
- **Files modified:** `src/lib/content/rekrutacja.ts`
- **Verification:** `npm run lint` exits 0; `grep -cE 'Radomska|510 094|zlobek@'` returns 0 for the module.
- **Committed in:** `eacf697`

### Interpretations of acceptance criteria

Four grep-based criteria are literally unsatisfiable alongside the plan's own content and comment requirements. Recorded so a verifier does not read a passing gate as a skipped one (same discipline as Plans 04-02, 04-04 and 04-05).

| Criterion | Why the literal form cannot hold | How it was enforced |
| --- | --- | --- |
| `grep -cE 'Piaski\|pokój 17\|8:00' src/lib/content/rekrutacja.ts` returns 0 | The criterion's own parenthetical states the intent: the address and room literals must be interpolated. But `8:00` is also the fee absence deadline ("zgłoszona pierwszego dnia do godziny 8:00"), a statut fee fact with nothing to do with `urzad`, and dropping its precision would degrade a published fee rule | The intent gate `grep -cE 'Piaski\|pokój 17\|8:00–15:00'` returns **0**: no address, no room and no office-hours literal. The single `8:00` hit is the absence deadline, and the route grep for contact literals returns 0 |
| Every occurrence of `0 zł` sits in the same string as the ZUS condition | `1 500 zł` and `20 zł` both contain the substring `0 zł`, so the literal reading can never hold for a module that states any amount ending in zero | The real rule (source document section 10.1) is enforced by the boundary-anchored gate `grep -cE '(^\|[^0-9])0(,00)? zł'`, which returns **0**, plus a Playwright assertion that the rendered fee panel matches no unconditional zero pattern. The ZUS condition is in the same content block and the same rendered panel as the amount |
| `grep -c 'ZgloszenieForm' src/routes/rekrutacja/+page.svelte` returns 1 | An import line and a mount line are two matching lines for any component a Svelte route renders (the same collision Plan 04-05 hit with `obsluz`) | The file is at the achievable minimum of **2** (import plus single mount). The criterion's intent, exactly one island on the route, is proven by `grep -c '<ZgloszenieForm'` = **1** |
| `grep -cE 'harmonogram' src/lib/content/rekrutacja.ts` returns 0 | The plan also requires the module to explain that the archival schedule must never ship as current, and the natural Polish word for it is the grep token | The explanatory comments call it "the 2026/2027 stage-by-stage timetable" and cite source-document section 10.3 by number. Returns **0** |

---

**Total deviations:** 4 auto-fixed (2 bugs, 1 missing critical, 1 blocking) plus 4 acceptance-criteria interpretations
**Impact on plan:** No scope creep. Deviations 1 and 2 are spec-locator defects found by running the thing rather than reading it, and both made the assertions more precise. Deviation 3 touches one comment in a file outside the plan's list, required by the plan's own repository-wide gate, and changes no exported value. Deviation 4 removes an unused import the linter would have rejected.

## Issues Encountered

- **A page-level uniqueness assertion has to account for the site chrome.** The footer links to the BIP on every route, so any future page-level "exactly one link to X" assertion on this site must be section-scoped. This will bite again on `/cennik` and `/dojazd`, which will both want to link to Gmina resources.
- **The rate limiter remains inert in the test environment** (`preview:test` passes no `FORMS_KV` binding, so `podLimitem` degrades to Turnstile-only with a warning). That is why 17 new cases, three of which submit, can share a client IP with the 20 endpoint cases without ordering constraints, and it also means the ceilings are still only unit-proven.
- **No regression anywhere.** 109 Playwright and 164 unit cases pass, `npm run check` is clean across 4215 files, and the homepage suite is untouched even though this page and `Recruitment.svelte` now read the same derived `recruitment` strings and the same document resolver.

## Known Stubs

None introduced by this plan. `OPLATY` carries a `// PLACEHOLDER:` marker whose reason is the client's fee wording confirmation (D-09), which is the same standing item as the homepage `keyFacts` fee row: the amounts themselves are `[BIP]`-confirmed, only the phrasing awaits sign-off. The stubs inherited from other plans are unchanged and all belong to them: the dummy `TURNSTILE_SITEKEY` (Plan 07), the IOD paragraph in the klauzula and the BCC backup-mailbox paragraph (Phase 6 launch gates), the sitemap's placeholder host (Phase 6), and the two placeholder-flagged rekrutacja documents whose `.doc` originals still need PDF conversion (Phase 6).

## Threat Flags

No new security-relevant surface. The plan's register is satisfied: **T-04-29** (the route reuses `readDokumenty()` and builds no second path resolver, grep-verified, and the spec fetches every rendered href asserting a 200 under the canonical prefix), **T-04-30** (section 10 re-read at the start of Task 1 and again at the end of Task 3 against the rendered page: no zero amount, no archival stage date, no work-based eligibility condition, no opening date, no institution name other than the official one, and the phone number is the standing D-08 decision unchanged by this plan), **T-04-31** (the BIP link carries `rel="noopener noreferrer"` plus the visually-hidden Polish new-tab suffix, asserted by the spec), **T-04-32** (removing the tolerance entry turns any broken `/rekrutacja` link into a build failure, and the link-integrity loop fetches every document href), **T-04-33** (inherited from Plan 05: the success panel renders only on an `ok` result, proven end to end on the real runtime), **T-04-SC** (zero package installs).

## User Setup Required

None for this plan. Plan 07 provisions the real Turnstile widget and site key, the Cloudflare Pages secrets and the `FORMS_KV` namespace id.

## Next Phase Readiness

**Ready**

- **Plan 07 is the last plan of the phase and the only thing between this phase and four unmarked requirements.** `RECRUIT-03`, `RECRUIT-04`, `FORM-01` and `FORM-02` are all now reachable and proven under the dummy key with `FORM_DRY_RUN=1`; Plan 07 swaps in the real site key and secrets and performs the first real send, and it should mark all four.
- **Both form routes are live, so the two axe re-runs Plan 07 owes are a single pass.** A real site key renders a real frame and a real focusable control on two pages that currently have neither: re-run the `/kontakt` and `/rekrutacja` scans, confirm the widget is keyboard reachable and passes contrast, and that finally exercises `frame-src`.
- **Phase 5 has two routes to pattern-match.** `/cennik`, `/galeria` and `/dojazd` are the last three tolerated 404s. `/cennik` inherits the full fee breakdown this plan deliberately left out (D-15), and it should read the same content module rather than restating the amounts.
- **The sitemap now has three entries** in one shape for Phase 6 to re-host and extend.

**Carry forward**

- **The `.doc` and `.docx` originals still need PDF conversion before launch** (source document section 5 accessibility warning). Two rekrutacja rows now render on a second page, so the conversion is more visible, not less: `wniosek-o-przyjecie-dziecka.doc` is the primary download on the site's most-visited page.
- **The daily and per-client rate ceilings are unit-proven only.** Plan 07 provisions the KV namespace; a manual check that the 429 path renders the `limit` panel copy is worth one minute at that point.
- **Do not reinstate a frame-based wait for Turnstile**, do not simplify the role-based field locators back to `getByLabel`, and do not widen the two locators narrowed in this plan back to page scope: the footer BIP link and the twice-rendered tie-break sentence are both correct and both will re-break a page-wide locator.
- **The map pin position is still a launch-gate item** (Plan 02): `ul. Radomska 72` has no house-number point in OpenStreetMap.
- **RECRUIT-01's requirement text still says "harmonogram".** It predates D-06 and section 10.3, which forbid publishing the archival schedule as current. The requirement is delivered as status plus kryteria plus zasady; if a verifier reads the word literally, the wording is what is stale, not the page.

## Self-Check: PASSED

All six created files exist on disk (`src/lib/content/rekrutacja.ts`, `src/lib/components/KryteriaTable.svelte`, `src/lib/components/FeeBox.svelte`, `src/routes/rekrutacja/+page.server.ts`, `src/routes/rekrutacja/+page.svelte`, `tests/rekrutacja.spec.ts`) plus the built `.svelte-kit/cloudflare/rekrutacja.html`, and all three task commits resolve in `git log` (`eacf697`, `8cc73aa`, `d132fd9`). Plan-level verification re-run after the final task commit: `npm run check` exit 0 (0 errors, 0 warnings, 4215 files), `npm run lint` exit 0, `npm run build` exit 0 with `/rekrutacja` prerendered and the crawler reporting 404 only for `/cennik`, `/galeria` and `/dojazd`, `npm run test` exit 0 (109 passed, all four axe cases across the two form routes green), `npm run test:unit` exit 0 (164 passed), and the repository-wide archival-date grep returns 0 matches.

---

_Phase: 04-enrollment-contact-email-pipeline_
_Completed: 2026-08-14_
