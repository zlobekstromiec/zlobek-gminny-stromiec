---
phase: 04-enrollment-contact-email-pipeline
plan: 08
subsystem: api
tags: [cloudflare-workers-kv, rate-limiting, rodo, sha-256, node-test-runner, sveltekit]

# Dependency graph
requires:
  - phase: 04-enrollment-contact-email-pipeline
    provides: "04-01 built podLimitem and the two ceilings; 04-05 added the second positional caller /api/rekrutacja; 04-07 provisioned the real FORMS_KV namespace and the RATE_LIMIT_SALT secret and wrapped every KV operation in the fail-open try/catch"
provides:
  - "Rate-limit windows defined by the BUCKET INSIDE THE KV KEY: hour-of-epoch for the per-client ceiling, UTC calendar date for the site-wide daily ceiling"
  - "expirationTtl demoted to a cleanup-only lifetime of MNOZNIK_TTL (2) times the window, so a KV write can no longer move a window boundary"
  - "A salt guard that refuses to hash the client address at all when RATE_LIMIT_SALT is absent, empty or blank, performing zero KV reads and zero KV writes"
  - "A frozen-clock rate-limit unit block that crosses both the hour boundary and the UTC date boundary"
  - "Operator docs describing the shipped key shapes and all three fail-open degrade paths"
affects: [phase-06-launch-hardening, verify-work, form pipeline maintenance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Window-in-the-key rate limiting: the bucket is derived from the clock and appended to the key, and the stored expiration only sweeps abandoned buckets"
    - "Clock injected as the LAST parameter with a Date.now() default, so positional callers stay byte-identical while tests get a frozen instant"
    - "Secret-shaped guard placed before the work it protects, unit-pinned by recording reads as well as writes"

key-files:
  created: []
  modified:
    - src/lib/server/forms/ratelimit.ts
    - tests/forms.unit.ts
    - docs/dev-env.md
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md

key-decisions:
  - "The window lives in the KV key, never in expirationTtl. Cloudflare KV overwrites the stored expiration on every write (confirmed against current docs: 'Existing values, expirations, and metadata will be overwritten'), so a bare-window TTL on a single site-wide key made the daily counter monotonic."
  - "The clock is the SEVENTH parameter of podLimitem with a Date.now() default. Both endpoints call positionally as (kv, formularz, adres, sol, limit, limit), so appending it last is what kept both +server.ts files byte-identical."
  - "The hour bucket is appended OUTSIDE the SHA-256 digest: it stays readable to an operator and, being derived from the clock alone, adds nothing identifying to the key."
  - "An absent, empty or blank salt skips the limiter entirely instead of hashing with an empty salt. Fail-open matches the absent-binding precedent; failing closed would discard enquiries that are stored nowhere."
  - "FORM-02 was deliberately UNMARKED even though it appears in this plan's requirements frontmatter, because the confirming step is a live human re-check. requirements mark-complete was therefore NOT run."

patterns-established:
  - "Window-in-the-key: any fixed-window counter on KV derives its bucket from the clock and puts it in the key; the stored lifetime is a sweeper, never the window."
  - "Frozen-clock unit cases: every rate-limit assertion passes an explicit instant so no case can straddle a real hour or a real midnight."
  - "Guard-before-work ordering is pinned by recording reads in the KV stub, not only writes."

requirements-completed: []

coverage:
  - id: D1
    description: "The per-client ceiling resets at the hour-of-epoch boundary: a client refused at 5 in one hour is accepted in the next, with no period of site silence"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#a client refused at the per-client ceiling is accepted again in the next hour bucket"
        status: pass
    human_judgment: false
  - id: D2
    description: "The site-wide daily ceiling resets at the UTC calendar day boundary: 40 reached on 2026-08-14 does not refuse a request on 2026-08-15, and the new date's write lands on a fresh rl:doba: key at 1"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#the site-wide daily ceiling reopens on the next UTC calendar date without any site silence"
        status: pass
    human_judgment: false
  - id: D3
    description: "Sustained legitimate traffic never accumulates across buckets: three accepted submissions spanning two UTC dates leave the second date at 1, never 3"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#three accepted submissions spanning two UTC dates leave the second date at 1, never 3"
        status: pass
    human_judgment: false
  - id: D4
    description: "Both ceilings still refuse abuse INSIDE a bucket: the 6th per-client submission in one hour and the 41st site-wide submission on one UTC date both return false"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem returns false exactly at the per-client limit"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#the daily ceiling still bites inside one UTC date even across hour buckets"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem returns false once the global daily ceiling is reached even when the per-client counter is low"
        status: pass
    human_judgment: false
  - id: D5
    description: "The stored expiration is cleanup-only: two accepted calls produce four writes carrying MNOZNIK_TTL * OKNO_S and MNOZNIK_TTL * DOBA_S, never a bare window length"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem writes an increasing integer with a cleanup-only lifetime for both counters"
        status: pass
      - kind: other
        ref: "node -e negative source gate: no non-comment line passes expirationTtl: OKNO_S or expirationTtl: DOBA_S"
        status: pass
    human_judgment: false
  - id: D6
    description: "An absent, empty or blank RATE_LIMIT_SALT skips the limiter, reads nothing and writes nothing, so no unsalted (reversible) digest of a client address is ever persisted"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem stores no digest at all when the salt is missing"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#a blank salt is the same misconfiguration as an absent one and stores nothing"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#the salt guard runs before any key is built, so KV is never even read"
        status: pass
    human_judgment: false
  - id: D7
    description: "All three degrade paths fail OPEN: absent FORMS_KV binding, thrown KV operation, missing salt; and a KV error still returns 200 through the whole obsluz pipeline"
    requirement: FORM-02
    verification:
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem degrades to Turnstile-only protection when the KV binding is missing"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#podLimitem fails open when a KV read throws, instead of rejecting the submission"
        status: pass
      - kind: unit
        ref: "tests/forms.unit.ts#a KV error still fails open through the whole obsluz pipeline, never a 500"
        status: pass
    human_judgment: false
  - id: D8
    description: "Both endpoint files, the orchestrator, the mailer, wrangler.jsonc and package.json are untouched by the signature change"
    verification:
      - kind: other
        ref: "git diff --name-only 408c337^..HEAD lists exactly the five files in files_modified"
        status: pass
      - kind: e2e
        ref: "npx playwright test (full suite) 110 passed, unchanged from the post-04-09 baseline"
        status: pass
    human_judgment: false
  - id: D9
    description: "The LIVE rate-limit ceilings behave as bucketed on the deployed site: six /kontakt submissions in one clock hour (6th is 429), the same client accepted in the next clock hour with no site silence, and a fresh rl:doba: key for the new UTC date"
    requirement: FORM-02
    verification: []
    human_judgment: true
    rationale: "The defect was invisible to a short spot check (a naive submit-6-times test looked correct while the accounting bug was live) and KV bucket boundaries can only be observed in the real edge environment. The unit suite proves the arithmetic with a frozen clock; only production proves the runtime. This is human_verification item 2 in 04-VERIFICATION.md."

# Metrics
duration: 11min
completed: 2026-08-15
status: complete
---

# Phase 04 Plan 08: Rate-limit window bucketing and salt guard Summary

**The rate-limit window now lives in the KV key (hour-of-epoch per client, UTC calendar date site-wide) with `expirationTtl` demoted to a cleanup-only sweeper, and the limiter refuses to hash a client address at all without a salt.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-15T16:22:48Z
- **Completed:** 2026-08-15T16:33:50Z
- **Tasks:** 3 of 3
- **Files modified:** 5 (plus `deferred-items.md`)

## Accomplishments

- **CR-01 (Blocker) closed.** The site-wide daily counter was a single constant key `rl:doba` written with `expirationTtl: DOBA_S`. Because a KV write overwrites the stored expiration, every accepted submission restarted the 24 h clock, so the counter climbed monotonically to 40 under ordinary legitimate traffic and then returned 429 to every parent on BOTH forms until a full day of total site silence, cyclically. The window is now the UTC calendar date inside the key (`rl:doba:2026-08-14`) and the per-client window is an hour-of-epoch bucket appended to the digest, so both ceilings reset on a real boundary regardless of traffic.
- **WR-01 closed.** `podLimitem` now returns `true` and touches KV zero times when `sol.trim()` is empty. Both endpoints supply `env.RATE_LIMIT_SALT ?? ''`, so an unset secret used to fall through to an unsalted truncated SHA-256 of the client address, which is enumerable across the whole IPv4 space and would have made the stored key a reversible pseudonym of the visitor, contradicting the klauzula sentence pinned by `tests/forms-copy.unit.ts`.
- **Both endpoint files stayed byte-identical.** The clock was appended as the seventh parameter of `podLimitem` with a `Date.now()` default precisely so the two positional call sites in `src/routes/api/kontakt/+server.ts` and `src/routes/api/rekrutacja/+server.ts` needed no edit, honouring the 04-05 decision to keep the two handlers separate.
- **The unit suite now pins the fix and would go red if the refresh-on-write pattern returned.** `npm run test:unit` went from the 168 baseline to **180** (net +12: 13 added, 1 deleted). The deleted case, `podLimitem writes an increasing integer with an expirationTtl for both counters`, was the one that pinned the defect.
- **Operator docs and the FORM-02 mark now tell the truth.** `docs/dev-env.md` describes the two real key shapes and all three fail-open paths; FORM-02 is unchecked with the live re-check procedure recorded in `STATE.md`.

## Exact artifacts

**New key formats, as observed in the unit stub:**

| Key | Example observed | Stored value | Expiration passed |
|---|---|---|---|
| per-client | `rl:kontakt:<16 hex>:487654` | integer count | `MNOZNIK_TTL * OKNO_S` = 7200 s |
| site-wide daily | `rl:doba:2026-08-14`, `rl:doba:2026-08-15` | integer count | `MNOZNIK_TTL * DOBA_S` = 172800 s |

The bucket `487654` is `Math.floor(Date.UTC(2026, 7, 14, 10, 30, 0) / 1000 / 3600)`.

**Final `podLimitem` signature:**

```ts
export async function podLimitem(
	kv: KVNamespace | undefined,
	formularz: string,
	ip: string,
	sol: string,
	limit = DOMYSLNY_LIMIT,
	limitDobowy = DOMYSLNY_LIMIT_DOBOWY,
	teraz: number = Date.now()
): Promise<boolean>
```

**Symbol changes in `src/lib/server/forms/ratelimit.ts`:**

| Symbol | Change |
|---|---|
| `KLUCZ_DOBOWY` | REMOVED (0 residual references in `src` or `tests`) |
| `PREFIKS_DOBOWY` | NEW, `'rl:doba'` |
| `MNOZNIK_TTL` | NEW, `2` |
| `kluczDobowy(teraz)` | NEW, returns `rl:doba:YYYY-MM-DD` (UTC) |
| `kubelekGodzinowy(teraz)` | NEW, returns `Math.floor(teraz / 1000 / OKNO_S)` |
| `kluczLimitu` | 4th required param `teraz`; returns `rl:{form}:{16 hex}:{bucket}` |
| `podLimitem` | 7th param `teraz = Date.now()`; salt guard added before hashing |
| `OKNO_S`, `DOBA_S`, `DOMYSLNY_LIMIT`, `DOMYSLNY_LIMIT_DOBOWY`, `licznik` | unchanged |

**Both endpoint files verified untouched:** `git diff --name-only 408c337^..HEAD` returns exactly `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `docs/dev-env.md`, `src/lib/server/forms/ratelimit.ts`, `tests/forms.unit.ts`. Neither `+server.ts`, nor `handle.ts`, `mailer.ts`, `turnstile.ts`, `wrangler.jsonc`, `package.json` or `package-lock.json` appears.

## Task Commits

1. **Task 1: Put the window in the KV key so both ceilings are genuinely fixed (CR-01)** - `408c337` (fix, TDD)
2. **Task 2: Refuse to hash the client address without a salt (WR-01)** - `ba567bd` (fix, TDD)
3. **Task 3: Make the operator docs and the FORM-02 mark tell the truth** - `af434da` (docs)

## Files Created/Modified

- `src/lib/server/forms/ratelimit.ts` - Window moved into the key; cleanup-only expirations; salt guard; RODO header and the false self-cleaning-window comment corrected; non-atomic read-modify-write recorded as deliberately accepted.
- `tests/forms.unit.ts` - Frozen-clock rate-limit block (`TERAZ`, `TERAZ_POZNIEJ_TEGO_DNIA`, `TERAZ_NASTEPNA_GODZINA`, `TERAZ_NASTEPNY_DZIEN`); `stubKV` gained `odczyty: string[]`; defect-pinning case deleted; 13 cases added.
- `docs/dev-env.md` - KV binding section rewritten to the two shipped key shapes and all three fail-open paths; `RATE_LIMIT_SALT` secrets row records the skip-on-blank behaviour.
- `.planning/REQUIREMENTS.md` - FORM-02 unchecked, Phase 4 mapping row `Complete` to `Pending` (2 lines changed, requirement sentence byte-identical).
- `.planning/STATE.md` - Blockers/Concerns bullet carrying the live rate-limit re-check procedure; decisions and session block updated by the state tooling.
- `.planning/phases/04-enrollment-contact-email-pipeline/deferred-items.md` - IN-02 logged as knowingly deferred (row 4).

## Decisions Made

1. **The window belongs in the key, not in `expirationTtl`.** Verified against current Cloudflare KV docs rather than pre-trained knowledge (the Cloudflare docs are explicit: a write overwrites existing values, expirations and metadata; `expirationTtl` is seconds-from-now). `MNOZNIK_TTL = 2` makes the stored lifetime strictly longer than the window it sweeps, which matters because a lifetime equal to the window would be restarted by every accepted write and would never sweep a busy key.
2. **The clock is the last parameter.** Load bearing, not stylistic: it is what let both positional endpoint call sites stay untouched.
3. **The hour bucket sits outside the digest.** Readable to an operator, and clock-derived so it adds no identifying data.
4. **The salt guard fails open.** Same documented degrade as an absent binding; a hard failure was rejected because the limiter is an abuse control, not a delivery prerequisite, and a refused enquiry on a no-storage pipeline is lost for good.
5. **`requirements mark-complete` was deliberately NOT run.** See Deviations.

## Deviations from Plan

### 1. [Rule 3 - Blocking] `requirements mark-complete` skipped for FORM-02, RECRUIT-04 and CONTACT-03

- **Found during:** Post-task state updates
- **Issue:** The plan frontmatter lists `requirements: [FORM-02, RECRUIT-04, CONTACT-03]`, and the standard executor state step runs `requirements mark-complete` on that list. Doing so would have re-checked FORM-02 immediately after Task 3 deliberately unchecked it, breaking Task 3's own acceptance criteria and the truthfulness goal of the whole plan.
- **Fix:** The command was not run. FORM-02 remains `- [ ]` with mapping row `Pending`. RECRUIT-04 and CONTACT-03 were already `Complete` from Plans 04-05/04-06 and needed no change.
- **Verification:** `grep -n "FORM-02" .planning/REQUIREMENTS.md` returns the unchecked checkbox on line 69 and `| FORM-02 | Phase 4 | Pending |` on line 141.
- **Committed in:** `af434da` (Task 3)

### 2. [Rule 3 - Blocking] The two TDD tasks were each committed as a single commit rather than a RED test commit followed by a GREEN implementation commit

- **Found during:** Task 1
- **Issue:** The repo's pre-commit gate runs `npm run check` (svelte-check). A test-only RED commit references exports that do not exist yet (`MNOZNIK_TTL`, `kluczDobowy`, `kubelekGodzinowy`, the 4-argument `kluczLimitu`), so `svelte-check` fails and the hook blocks the commit. The instruction for this run explicitly forbids `--no-verify`.
- **Fix:** The RED/GREEN cycle was still executed and observed in full, just not split across commits. Task 1 RED was confirmed by the module failing to load with `SyntaxError: does not provide an export named 'MNOZNIK_TTL'` (61 pass / 1 fail); Task 2 RED was confirmed by three named failures (`not ok 132/133/134`, 177 pass / 3 fail) before the guard existed. Each task was then committed once, GREEN.
- **Files modified:** none beyond the task's own files
- **Verification:** RED and GREEN runs recorded above; final `npm run test:unit` 180/180.
- **Committed in:** `408c337`, `ba567bd`

### 3. [Rule 3 - Blocking] `gsd-tools query state.record-metric` / `state.add-decision` / `state.record-session` needed named flags, not positional args

- **Found during:** Post-task state updates
- **Issue:** The positional invocation documented in the executor contract returned `{"error": "phase, plan, and duration required"}` and `{"error": "summary required"}`.
- **Fix:** Re-invoked with `--phase/--plan/--duration/--tasks/--files`, `--summary/--phase`, and `--stopped-at/--resume-file`. All succeeded.
- **Verification:** STATE.md Performance Metrics carries the `Phase 04 P08` row, both decisions are in the Decisions list, and Session Continuity reads `Stopped at: Completed 04-08-PLAN.md`.

---

**Total deviations:** 3 (all Rule 3, blocking-issue class). No Rule 1 bugs and no Rule 2 additions were needed.
**Impact on plan:** None on scope or behaviour. Deviation 1 protects the plan's own intent, deviation 2 is a tooling constraint on commit granularity only, deviation 3 is a CLI-signature correction.

## TDD Gate Compliance

Both `tdd="true"` tasks ran RED before GREEN and the RED state was observed, but the gate commits are not separable in git history because the pre-commit `npm run check` gate rejects a test-only commit that references not-yet-existing exports. Evidence of the RED phase is recorded in Deviation 2 above. No task was implemented before its assertions were written.

## Verification Results

| Check | Result |
|---|---|
| `npm run check` | 0 errors, 0 warnings (4215 files) |
| `npm run lint` | clean (prettier + eslint) |
| `npm run test:unit` | **180 passed, 0 failed** (baseline 168) |
| `npm run build` | exits 0, including `wrangler types --check` (proves no root `.dev.vars` crept in) |
| `npx playwright test tests/kontakt-api.spec.ts tests/rekrutacja-api.spec.ts` | 20 passed |
| `npx playwright test tests/kontakt.spec.ts tests/rekrutacja.spec.ts` | 33 passed |
| `npx playwright test` (full suite) | **110 passed**, identical to the post-04-09 baseline |
| Negative source gate (`expirationTtl: OKNO_S` / `expirationTtl: DOBA_S`) | not present on any non-comment line |
| Removed-symbol gate (`KLUCZ_DOBOWY`) | 0 references in `src` and `tests` |
| New-symbol gate | `kluczDobowy`, `kubelekGodzinowy`, `PREFIKS_DOBOWY`, `MNOZNIK_TTL` each exported exactly once |
| Ordering gate (salt guard before hashing) | guard at offset 6502, `kluczLimitu(formularz, ip, sol` call at 6638 |
| `test ! -e .dev.vars` | passes, no root `.dev.vars` |
| Em dash / emoji gate over the full diff | clean |

Note: the plan quoted `26/26` and `17/17` for the two form-page suites. The actual counts are 33 combined, because 04-09 (which landed immediately before this plan) altered `tests/kontakt.spec.ts`. The correct comparison baseline is the post-04-09 full-suite figure of 110, which is matched exactly.

## Issues Encountered

- **Playwright and unit runs had to be forced onto the pinned Node.** The agent shell resolved `node` to v25.9.0 while `.tool-versions` pins 22.23.2; `export PATH="$HOME/.asdf/shims:$PATH"` was used for every verification command. This is an environment detail, not a code change.
- **`npm run check` fails a test-only commit.** Documented as Deviation 2.

## Known Stubs

None. Every behaviour claimed by this plan is implemented and unit-pinned.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or trust-boundary schema change was introduced. The only new surface is a third `console.warn` diagnostic in `ratelimit.ts`, which is a fixed Polish string naming only the missing secret and interpolating nothing request-derived (T-04-08-06 mitigation, satisfied).

## Deferred Issues

- **IN-02** (Info, from 04-REVIEW.md): the header comment in `src/lib/server/forms/turnstile.ts` still claims that module is "the only module permitted to log". It was already inaccurate before this plan (`ratelimit.ts` has carried two `console.warn` sites since 04-07) and Task 2 added a third. `turnstile.ts` is outside this plan's `files_modified` and the plan explicitly directs that it be logged, not fixed. Recorded as row 4 in `deferred-items.md`.

## User Setup Required

None. No secret, binding or dashboard change is needed: `FORMS_KV` (`55f55448fe1345e28a79da5a3e9e9ca9`) and `RATE_LIMIT_SALT` were already provisioned in 04-07 and `wrangler.jsonc` is byte-identical. No `wrangler kv` command was run at any point (the scoped token has no Workers KV permission).

## Next Phase Readiness

**Ready.** Both gap-closure plans of Phase 4 (04-08 and 04-09) are complete and the full suite is green.

**Outstanding human steps, all recorded in STATE.md:**

1. **Live rate-limit re-check (new, this plan; blocks the FORM-02 mark).** On the deployed site, submit `/kontakt` six times inside one clock hour from one client and confirm the sixth returns 429 with the Polish `limit` message; then, in the next clock hour, confirm the same client is ACCEPTED without the site having fallen silent; separately confirm a fresh `rl:doba:` key appears for a new UTC calendar date rather than the previous date's key continuing to grow. One human session, zero deploys.
2. **Live human form submission through the real Turnstile widget** (unchanged from 04-07: a managed widget will not issue a token to an automated browser).
3. **FORM-01 mailbox blocker at the Gmina** (`zlobek@ugstromiec.pl` does not exist yet, so the `to:` leg hard-bounces and the BCC backup is the only receiving mailbox). External, explicitly excluded from gap treatment.

---

_Phase: 04-enrollment-contact-email-pipeline_
_Completed: 2026-08-15_
