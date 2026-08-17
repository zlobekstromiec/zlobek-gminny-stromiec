---
phase: 05-gallery-fees
plan: 02
subsystem: ui
tags: [sveltekit, svelte5, tailwind4, playwright, axe, node-test, json-content-store]

# Dependency graph
requires:
  - phase: 04-enrollment-contact-email-pipeline
    provides: FeeBox.svelte, OPLATY, the .fee-box no-zero gate, the editorial-split band layout
  - phase: 03-news-cms-integration
    provides: the postFromEntry reader discipline (unknown entry, guarded container, key-by-key construction)
  - phase: 04.1-replace-sveltia-with-custom-polish-cms
    provides: the panel write path that will own src/lib/content/cennik.json from plan 05-04
provides:
  - "src/lib/kwoty.ts: the PLN formatter (grupujTysiace, zlote), ASCII-space separator, no Intl call"
  - "src/lib/content/cennik.json: the single fee store, tab-indented, panel-writable from 05-04"
  - "src/lib/cennik.ts: cennikZWpisu (the validation boundary) and CENNIK (the validated view)"
  - "src/lib/content/cennik.ts: /cennik prose that restates no amount"
  - "/cennik: the public fees page, eight sections, zero hydrated islands, axe AA clean"
  - "OPLATY is now a typed read of the store, so /cennik, FeeBox and /rekrutacja cannot disagree"
affects: [05-03 nav and KNOWN_FUTURE_ROUTES, 05-04 admin cennik screen, 05-09 homepage fee tile]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two numbers stored, the third computed: the page cannot contradict its own arithmetic"
    - "Module-scope throw on a malformed store: a bad save fails the build instead of publishing a blank fee page"
    - "Scoped conditional-zero test pair: assert the zero is inside its block, then assert the page without that block has none"
    - "Relative .ts imports in a content module so bare `node --test` can load it"

key-files:
  created:
    - src/lib/kwoty.ts
    - src/lib/cennik.ts
    - src/lib/content/cennik.json
    - src/lib/content/cennik.ts
    - src/routes/cennik/+page.svelte
    - tests/kwoty.unit.ts
    - tests/cennik-reader.unit.ts
    - tests/cennik.spec.ts
  modified:
    - src/lib/content/rekrutacja.ts
    - tests/responsive.spec.ts

key-decisions:
  - "The amount formatter rejects Intl on measured evidence, not on preference: the plain pl-PL formatter returns 1500 unseparated and pinning grouping on emits U+00A0 where every shipped byte is U+0020"
  - "The payable amount is computed by the reader from stawka minus obnizka and is never stored (D-28)"
  - "obnizka >= stawka is refused by the READER, not by a test, because the boundary-anchored zero regex cannot see a negative amount"
  - "A malformed committed store throws at module scope so vite build fails; /cennik has no honest empty state and a failed build leaves the previous deployment live"
  - "FEES-01 stays UNMARKED: its requirement text says 'editable via the CMS' and the panel half is plan 05-04"

patterns-established:
  - "Grep-gate rewording: a comment explaining a banned literal must not contain that literal, or the gate enforcing the ban permanently false-positives (04-02 precedent, applied five times here)"
  - "Conditional-zero scoping: /rekrutacja's .fee-box gate forbids ANY zero and is deliberately NOT reused on a page that renders one on purpose"

requirements-completed: []

coverage:
  - id: D1
    description: "A parent can open /cennik and read the fee, the breakdown, the ZUS benefit, wyżywienie, nieobecność, how to pay and the legal basis, all in Polish"
    requirement: FEES-01
    verification:
      - kind: e2e
        ref: "tests/cennik.spec.ts (11 cases: status, single h1, six section headings, SEO+noindex, axe wcag2a/2aa/21a/21aa)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The page cannot contradict its own arithmetic: the payable amount is computed from the two stored numbers"
    requirement: FEES-01
    verification:
      - kind: e2e
        ref: "tests/cennik.spec.ts#rozbicie kwoty zgadza się z tym, co strona sama pokazuje (D-28)"
        status: pass
      - kind: unit
        ref: "tests/cennik-reader.unit.ts#kwota do zaplaty jest liczona, nigdy przechowywana"
        status: pass
    human_judgment: false
  - id: D3
    description: "A zero amount appears only inside the ZUS block together with its condition, and the page without that block carries none"
    requirement: FEES-01
    verification:
      - kind: e2e
        ref: "tests/cennik.spec.ts#kwota zero pojawia się wyłącznie razem ze swoim warunkiem (D-31); #strona bez bloku ZUS nie zawiera już żadnej kwoty zerowej (D-31)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The reader refuses every malformed store shape rather than publishing a half-rendered fee page"
    requirement: FEES-01
    verification:
      - kind: unit
        ref: "tests/cennik-reader.unit.ts (12 cases incl. sorted key-set equality, non-object container, blank fields, non-integer stawka, negative obnizka, obnizka >= stawka)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The formatter groups thousands with an ASCII space, so the shipped '1 500 zł' bytes are unchanged"
    requirement: FEES-01
    verification:
      - kind: unit
        ref: "tests/kwoty.unit.ts (8 grouping cases + two codepoint assertions + the OPLATY.kwota byte pin)"
        status: pass
      - kind: e2e
        ref: "tests/home.spec.ts:112 (the pre-existing retyped '1 500 zł' twin, inside npm run test)"
        status: pass
    human_judgment: false
  - id: D6
    description: "OPLATY is a typed read of the store and /rekrutacja's existing .fee-box no-zero gate still passes unchanged (FEE-6)"
    requirement: FEES-01
    verification:
      - kind: e2e
        ref: "tests/rekrutacja.spec.ts (file byte-unchanged, full suite green)"
        status: pass
    human_judgment: false
  - id: D7
    description: "The fees page reads correctly to a Polish-speaking parent and the placeholder sections say nothing unconfirmed"
    verification: []
    human_judgment: true
    rationale: "Copy quality and the two PLACEHOLDER sections (payment terms, wyżywienie scope) need a human reading, and the payment facts need the żłobek to confirm them before launch. No test can judge either."

# Metrics
duration: 28min
completed: 2026-08-17
status: complete
---

# Phase 05 Plan 02: Cennik Summary

**`/cennik` ships as a prerendered, axe-clean Polish fees page whose every złoty figure is computed by a validating reader from one JSON store that `OPLATY` and `FeeBox` now read too, so the three fee surfaces are structurally incapable of disagreeing.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-08-17T15:17:00Z
- **Completed:** 2026-08-17T15:45:00Z
- **Tasks:** 3 completed
- **Files modified:** 10 (8 created, 2 modified)

## Accomplishments

- **`/cennik` exists and is green.** Eight sections in the contract order, zero hydrated islands, one `h1`, Polish title/description plus `noindex`, and zero axe violations at `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa`. 11 of 11 cases in `tests/cennik.spec.ts` pass.
- **The arithmetic is structurally honest.** Two numbers are stored (`stawka` 2337, `obnizka` 837) and the payable amount is subtracted by the reader. The acceptance test reads all three figures *out of the rendered DOM* and does the subtraction itself, so it proves the property without pinning any amount, and an ordinary editor save can never turn it red.
- **The conditional-zero rule is now enforced by structure rather than by habit.** The only zero amount on the page sits in the worked example, in the same sentence as the ZUS condition, inside `#zus-blok`. A test pair asserts the zero is inside that block and that the page with the block removed satisfies the original no-zero regex.
- **One store, three surfaces.** `OPLATY` stopped being six hand-typed literals and became a typed read of `CENNIK`. `FeeBox.svelte` and `tests/rekrutacja.spec.ts` were not edited and still pass, which is FEE-6.
- **The formatter is pinned to the shipped bytes.** `tests/kwoty.unit.ts` asserts that the separator codepoint is `0x20` and explicitly *not* `0x00a0`, which is the only place a silent NBSP regression would surface.
- **Full gate green:** `npm run check` 0 errors / 0 warnings, `npm run lint` clean, `npm run test:unit` 515/515, `npm run test` 314/314. `package.json` and `package-lock.json` are byte-unchanged (zero packages installed this plan).

## Task Commits

1. **Task 1 (tests) + Task 2 (formatter, store, reader, prose, page)** - `adc6fea` (feat)
2. **Task 3: OPLATY becomes a typed read of the store** - `e649336` (refactor)

Tasks 1 and 2 share one commit. See Deviation 1: the repository's own pre-commit gate makes a RED commit impossible, so the RED state was **observed and recorded** instead of banked, exactly as plan 04.1-02 established.

### RED evidence, recorded because it could not be committed

Before any source file existed, both unit suites failed for precisely the intended reason (module resolution naming the not-yet-written module), not silently empty:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/lib/kwoty.ts'
    imported from .../tests/kwoty.unit.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/lib/cennik.ts'
    imported from .../tests/cennik-reader.unit.ts
```

`src/routes/cennik/` did not exist, so `/cennik` was a 404 and `tests/cennik.spec.ts` could not pass either.

## Files Created/Modified

- `src/lib/kwoty.ts` - Hand-rolled thousands grouping and the `zlote` renderer. ASCII-space separator, no `Intl` call, guards non-finite input rather than coercing it into a plausible price.
- `src/lib/content/cennik.json` - The fee store. Tab-indented with a trailing newline and keys in the order the panel validator will emit, so the first editor save cannot block every local commit.
- `src/lib/cennik.ts` - `cennikZWpisu` (the single validation boundary) and `CENNIK` (the validated module-level view). Throws at module scope if the committed store is malformed.
- `src/lib/content/cennik.ts` - Page prose. States no złoty figure anywhere; the worked example is a function taking the already-formatted amount. Carries three `PLACEHOLDER` markers.
- `src/routes/cennik/+page.svelte` - The page. Structural hooks `id="zus-blok"` and `.rozbicie`; reuses the `FeeBox` treatment values without importing `FeeBox`.
- `tests/kwoty.unit.ts` - FEE-5, including the codepoint pair and the `OPLATY.kwota` byte pin.
- `tests/cennik-reader.unit.ts` - FEE-4, including the sorted key-set equality that would go red on an object spread.
- `tests/cennik.spec.ts` - FEE-1 to FEE-3.
- `src/lib/content/rekrutacja.ts` - Header D-18 paragraph rewritten, both imports made relative with explicit `.ts`, `OPLATY` turned into a typed read, `/cennik` reservation comment resolved.
- `tests/responsive.spec.ts` - `/cennik` added to `ROUTES`; otherwise byte-unchanged.

## Decisions Made

- **The period word „miesięcznie" is declared exactly once**, in `src/lib/cennik.ts` as part of `kwotaProza`. The worked example takes `kwotaProza` whole rather than re-appending the word, so the sentence still reads verbatim as the Copywriting Contract specifies while the word exists in one place.
- **`.rozbicie dt` uses `muted` on `tint-yellow`**, a pairing the UI-SPEC contrast table does not tabulate. Measured at ~5.99:1, comfortably AA for body text, and confirmed independently by the axe scan.
- **The fee block renders the stored `naglowek` as an `h3`** inside the block, under the section `h2`. The Copywriting Contract assigns the stored value to the "fee block heading" role, and rendering it also keeps the field live for the panel screen in plan 05-04 rather than leaving a dead store key.
- **`FEES-01` stays UNMARKED.** Its requirement text is "A visitor can read a fees page (opłaty, stawki), **editable via the CMS**", and the editable half is plan 05-04. Ticking it here would put a false claim in the traceability table, the same call plans 01, 04-03 and 04-06 made.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tasks 1 and 2 could not be committed separately**

- **Found during:** Task 1 (writing the failing tests)
- **Issue:** The repository's installed pre-commit hook runs `npm run check`, which is `svelte-check` over the **whole working tree**, and `tsconfig.json` covers `tests/`. A test file importing a not-yet-written module is therefore a type error, and the hook refuses the commit. A TDD RED commit is structurally impossible in this repository.
- **Fix:** Followed the precedent that plan 04.1-02 already set and recorded in `STATE.md`: RED was **observed and recorded in this SUMMARY** (see the evidence block above) rather than banked as its own commit, and the tests landed together with the implementation in `adc6fea`. `--no-verify` was deliberately **not** used, matching that precedent.
- **Files modified:** none (process deviation)
- **Verification:** Both `ERR_MODULE_NOT_FOUND` failures captured verbatim before any source file was written.
- **Committed in:** `adc6fea`

**2. [Rule 3 - Blocking] Five acceptance greps false-positived on the comments explaining their own bans**

- **Found during:** Task 2 (running the acceptance criteria)
- **Issue:** The plan required `grep -c 'new Intl' src/lib/kwoty.ts` = 0, `grep -c 'lib/server'` = 0 across two modules, and `grep -c '<table' src/routes/cennik/+page.svelte` = 0. It **also** required each file to open with a header explaining why `Intl` is rejected, why the module is not in the server-only subtree, and why the breakdown is not a table. Writing the explanation trips the gate: measured 2, 3 and 1 hits respectively, every one of them inside a comment and none of them a real usage.
- **Fix:** Applied the project's own documented remedy from plan 04-02 ("comments explaining a ban are reworded to synonyms so the enforcing greps cannot report permanent false positives"). The bans are still explained in full, in prose, and each rewording says in-line why the literal is spelled around. This is the same class of trap `05-RESEARCH.md` §C-4 and D-18 flag for `KNOWN_FUTURE_ROUTES`.
- **Files modified:** `src/lib/kwoty.ts`, `src/lib/cennik.ts`, `src/routes/cennik/+page.svelte`
- **Verification:** All ten Task 2 greps now return their required values; `npm run check`, `npm run lint` and the full Playwright suite re-run green after the rewording.
- **Committed in:** `adc6fea`

**3. [Rule 3 - Blocking] `node_modules` absent in the worktree**

- **Found during:** Task 1 setup
- **Issue:** `node_modules` is gitignored, so a fresh git worktree has none and nothing could be run.
- **Fix:** `npm ci`, which installs strictly from the committed lockfile and modifies neither `package.json` nor `package-lock.json`. Deliberately **not** `npm install`, and no package was added, which keeps the T-05-02-SC supply-chain gate satisfied.
- **Files modified:** none tracked
- **Verification:** `git diff --name-only -- package.json package-lock.json` is empty, checked after every task.
- **Committed in:** n/a (no tracked change)

---

**Total deviations:** 3 auto-fixed (3 x Rule 3 - blocking)
**Impact on plan:** None on scope or behaviour. All three are environment or gate-mechanics problems; every deliverable, structural hook and assertion the plan specified shipped as written.

## Issues Encountered

**The plan's Task 2 acceptance criterion `node --test tests/kwoty.unit.ts` passes was unsatisfiable at Task 2, by the plan's own construction.** That suite imports `OPLATY` from `src/lib/content/rekrutacja.ts`, whose `$lib` alias import cannot resolve under bare `node --test` until Task 3 replaces it with a relative path, which the plan states explicitly in Task 3's rationale. The two criteria contradict each other across task boundaries.

Resolved by ordering the *evidence* rather than by changing the tests or moving Task 3's file into Task 2:

- At Task 2 the twelve formatter assertions were executed directly against `src/lib/kwoty.ts` (all pass, separator codepoint `0x20` confirmed), and the suite's only remaining failure was verified to be exactly `Cannot find package '$lib' imported from .../rekrutacja.ts` and nothing else.
- At Task 3 the full suite runs green, 4 of 4, byte pin included.

No assertion was weakened and no file moved between tasks.

**The `svelte` MCP server's `svelte-autofixer` was not reachable.** Its tools were not present in this agent's tool list (the known upstream bug that strips MCP tools from agents with a restricted tool set), and it has no CLI fallback. `npm run check` covers the same ground it would have flagged, since `svelte-check` runs both the type check and the Svelte compiler's a11y warnings, and it reports 0 errors and 0 warnings on the new component.

## Known Stubs

None that block the plan's goal. Three `PLACEHOLDER` markers are deliberate and are content questions for the client, not unwired code:

| Marker | File | What is unconfirmed |
|---|---|---|
| „Jak i kiedy płacić" body | `src/lib/content/cennik.ts` | Payment method, deadline, consequence of late payment. No committed source carries any of them (D-30), so the section states none and points the parent at the żłobek. |
| Wyżywienie detail line | `src/lib/content/cennik.ts` | What the daily rate covers, in detail. |
| Fee wording | `src/lib/content/rekrutacja.ts` (pre-existing) | Exact fee phrasing pending client confirmation (D-09). The amounts themselves are `[BIP]`. |

The Phase 6 pre-launch sweep hunts the `PLACEHOLDER` token and will surface all three. Per the locked project convention a placeholder renders **no** visitor-facing badge.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or trust-boundary schema change. The two boundaries this plan does touch were already in the plan's own threat register (`editor-saved JSON -> build-time reader`, `reader -> prerendered public HTML`) and both carry their planned mitigations:

- T-05-02-01 (unconditioned zero) mitigated by the scoped test pair.
- T-05-02-02 (arithmetic integrity) mitigated by the computed third figure and the `obnizka >= stawka` refusal.
- T-05-02-03 (build failure on a malformed store) accepted deliberately, as planned.
- T-05-02-04 (stored XSS) mitigated structurally: every stored fee string renders as text, no `{@html}` anywhere on this surface.
- T-05-02-05 (formatting drift) mitigated by the codepoint pin plus the pre-existing `tests/home.spec.ts:112` twin.
- T-05-02-SC (supply chain) satisfied: zero packages installed, lockfile and manifest byte-unchanged.

## Next Phase Readiness

Ready for the rest of Phase 5:

- **Plan 05-03** (nav v3, `KNOWN_FUTURE_ROUTES`) can now remove `'/cennik'` from the allow-list: the route resolves, and the prerender crawler already reached it during this plan's builds. `/galeria` and `/dojazd` are still 404 and are 05-03's own work. This plan deliberately left `svelte.config.js` untouched.
- **Plan 05-04** (`/admin/cennik`) has its store, its key order, its computed-line source (`CENNIK.kwotaProza`) and its refusal rules already fixed by the reader, so the validator only has to mirror them with Polish messages.
- **Plan 05-09** (homepage fee tile) has `src/lib/kwoty.ts`, its stated prerequisite. Note the D-03 cycle constraint recorded above the `CENNIK` import in `rekrutacja.ts`: the tile must read `CENNIK` **directly** and must not reach through `OPLATY`, which would close a `site -> rekrutacja -> site` cycle.

**Not closed by this plan:** `FEES-01` (needs the panel half, 05-04) and `FEE-7`/`FEE-8`/`FEE-9` of `05-VALIDATION.md`. `FEE-1` through `FEE-6` are green.

---
*Phase: 05-gallery-fees*
*Completed: 2026-08-17*
