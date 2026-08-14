---
phase: 04-enrollment-contact-email-pipeline
plan: 01
subsystem: api
tags:
  [
    sveltekit,
    cloudflare-pages-functions,
    workers-kv,
    resend,
    turnstile,
    csp,
    rodo,
    node-test,
    playwright
  ]

# Dependency graph
requires:
  - phase: 01-live-homepage-design-foundation
    provides: 'SvelteKit + adapter-cloudflare scaffold, site-wide prerender = true in +layout.ts, kit.csp policy in svelte.config.js, wrangler types --check build gate, Playwright + axe harness running against wrangler pages dev'
  - phase: 02-content-pages-cms
    provides: 'src/lib/server/dokumenty.ts server-module conventions (module header, types-first exports, module-level constant tables, reject-do-not-repair guards)'
  - phase: 03-aktualnosci-news
    provides: 'tests/aktualnosci-reader.unit.ts idiom and the test:unit script (node --test, *.unit.ts naming outside the Playwright matcher)'
provides:
  - 'POST /api/kontakt, the project first dynamic route, running the full submit pipeline on the real Cloudflare runtime'
  - 'src/lib/forms/types.ts shared FormResult / FormCode / STATUS_DLA_KODU contract, importable by the browser island as a type'
  - 'src/lib/server/forms/ reusable pipeline: sanitize, validate, turnstile, ratelimit, mailer, handle'
  - 'obsluz() dependency-injected orchestrator so the second endpoint (Plan 05) is a thin adapter and cannot drift'
  - 'FORMS_KV binding in wrangler.jsonc plus the five form secrets typed as optional on platform.env'
  - 'Turnstile CSP: challenges.cloudflare.com on script-src plus new connect-src and frame-src directives'
  - 'npm run preview:test, the Playwright runtime harness carrying the dummy Turnstile secret and the Resend dry-run seam'
  - 'tests/forms.unit.ts (101 unit tests) and tests/kontakt-api.spec.ts (9 endpoint tests) as the FORM-01/FORM-02 executable contract'
affects:
  [
    04-03-klauzula-and-kontakt-island,
    04-04-kontakt-page,
    04-05-rekrutacja-endpoint,
    04-07-secrets-and-kv-provisioning,
    06-launch-hardening
  ]

# Tech tracking
tech-stack:
  added: [] # zero npm packages installed, by design (T-04-SC)
  patterns:
    - 'Prerender opt-out: export const prerender = false in a +server.ts under a globally prerendered app'
    - 'Dependency-injected orchestrator: all side effects passed in, so the whole decision table is unit testable with no network'
    - 'Typed JSON result contract with stable machine codes mapped through a frozen status table, never inline status numbers'
    - 'Reject-never-repair field validation with the reason in a comment'
    - 'KV rate limiting under a salted SHA-256 key holding only integers'
    - 'Cheap-to-expensive pipeline ordering so bots never reach the metered stages'
    - 'Test-only runtime secrets via wrangler pages dev --binding flags instead of a .dev.vars file'

key-files:
  created:
    - src/lib/forms/types.ts
    - src/lib/server/forms/sanitize.ts
    - src/lib/server/forms/validate.ts
    - src/lib/server/forms/turnstile.ts
    - src/lib/server/forms/ratelimit.ts
    - src/lib/server/forms/mailer.ts
    - src/lib/server/forms/handle.ts
    - src/routes/api/kontakt/+server.ts
    - tests/forms.unit.ts
    - tests/kontakt-api.spec.ts
    - .dev.vars.example
  modified:
    - package.json
    - wrangler.jsonc
    - worker-configuration.d.ts
    - src/app.d.ts
    - svelte.config.js
    - playwright.config.ts

key-decisions:
  - 'A root .dev.vars file is NOT used and must not be created: wrangler types writes every .dev.vars key into the committed worker-configuration.d.ts as a required member, and Cloudflare Pages CI has no such file, so wrangler types --check would fail every deploy. Test-run secrets arrive through npm run preview:test --binding flags instead, which produce an identical platform.env (verified against the wrangler bindings table).'
  - 'RATE_LIMIT_MAX raises BOTH the per-client hourly ceiling and the site-wide daily ceiling through one override chain, so the shared-IP Playwright suite cannot trip either. Production leaves it unset and gets the module defaults, 5 per hour per client and 40 per day site-wide.'
  - 'podLimitem reads both counters before writing either, so a submission blocked by the daily ceiling does not burn the parent hourly allowance on the way out.'
  - 'Per-field error keys are brak, niepoprawny and zbyt-dlugi, a three-way split rather than two, because the UI-SPEC error table has distinct Polish copy for a missing field, a malformed address and an over-long message.'
  - 'Control characters are stripped by an explicit code-point scan covering C0 AND C1, not by a control-character regex, which also avoids an eslint no-control-regex suppression.'
  - 'CONTACT-03, FORM-01 and FORM-02 are deliberately NOT marked complete: all three are shared with Plans 03, 04, 05 and 07, and no parent-visible form or provisioned secret exists yet.'
  - 'The From display name stays ASCII (Formularz zlobka) because a display name is the most-mangled mail header in practice; the Polish wording staff read lives in the subject and body, which Resend encodes as UTF-8.'

patterns-established:
  - 'Pattern: dependency-injected request orchestrator. obsluz(surowe, ip, Zaleznosci<T>) owns the pipeline order and the status mapping; each endpoint only binds env-derived closures. Plan 05 adds /api/rekrutacja as a second adapter with no duplicated decision logic.'
  - 'Pattern: grep-checkable security gates. The banned tokens (the post-response send hook, the Vite build-time env object, an inline script-src allowance, a markup mail field) are absent from BOTH code and comments under src/lib/server/forms/, so the acceptance greps stay machine-checkable. Describe a banned API, never spell it.'
  - 'Pattern: shared contract module outside $lib/server. src/lib/forms/types.ts holds the result union so the browser island imports the same type without tripping the server-only import rule.'
  - 'Pattern: relative .ts imports inside src/lib/server/forms/ so node --test can load the modules directly; $lib aliases only in +server.ts, which only Vite ever resolves.'

requirements-completed: []

coverage:
  - id: D1
    description: 'POST /api/kontakt accepts a valid contact submission and returns 200 with exactly {ok:true}, causing one Resend send attempt (dry-run seam in tests)'
    requirement: 'CONTACT-03'
    verification:
      - kind: e2e
        ref: 'tests/kontakt-api.spec.ts#poprawne zgłoszenie zwraca 200 oraz treść {ok:true}'
        status: pass
      - kind: unit
        ref: 'tests/forms.unit.ts#obsluz returns ok true with status 200 when every stage succeeds'
        status: pass
    human_judgment: false
  - id: D2
    description: 'The recipient, sender and BCC are module-level constants that no request body can influence'
    requirement: 'FORM-02'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts#the payload keeps the module recipients when the body carries to, from, cc and bcc keys'
        status: pass
      - kind: e2e
        ref: 'tests/kontakt-api.spec.ts#dodatkowe klucze to i bcc w ciele żądania są ignorowane i nadal zwracamy 200 (FORM-02)'
        status: pass
    human_judgment: false
  - id: D3
    description: 'An e-mail containing CR, LF, TAB, NUL or a header-structural character is rejected outright and never repaired, so the reply-to header cannot be split'
    requirement: 'FORM-02'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts#bezpiecznyEmail rejects an address containing a CRLF pair (plus 8 sibling cases)'
        status: pass
      - kind: e2e
        ref: 'tests/kontakt-api.spec.ts#adres e-mail z CRLF jest odrzucany, nigdy naprawiany (FORM-02, T-04-01)'
        status: pass
    human_judgment: false
  - id: D4
    description: 'Turnstile is verified server-side before any metered work, and a siteverify network error fails closed'
    requirement: 'FORM-02'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts#obsluz verifies Turnstile before it spends a KV write, so bots cannot drain the counter'
        status: pass
      - kind: e2e
        ref: 'tests/kontakt-api.spec.ts#brak tokenu Turnstile zwraca 400 i kod turnstile (FORM-02)'
        status: pass
    human_judgment: false
  - id: D5
    description: 'Every rejection path returns its documented status and stable machine code, and no branch returns 200 on failure'
    requirement: 'FORM-01'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts#obsluz never returns ok true or status 200 on any failure branch'
        status: pass
      - kind: e2e
        ref: 'tests/kontakt-api.spec.ts (brak zgody 400/zgoda, niepoprawny e-mail 400/walidacja, GET 405, ciało powyżej 8 KiB 400/walidacja)'
        status: pass
    human_judgment: false
  - id: D6
    description: 'No submission body, field value, address or client IP is written to a log, to KV or to any other store; the KV value is an integer under a salted hash of the IP'
    requirement: 'FORM-02'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts#podLimitem stores only integers, never a submitted value or an IP'
        status: pass
      - kind: other
        ref: "grep -rn 'console\\.' src/lib/server/forms/ yields exactly two lines: the Turnstile error-codes warn and the missing-KV-binding warn"
        status: pass
    human_judgment: false
  - id: D7
    description: 'npm run check exits 0 with the FORMS_KV binding and the five form secrets typed on platform.env, and npm run build still prerenders the site alongside the new dynamic route'
    verification:
      - kind: other
        ref: 'npm run check (0 errors, 4192 files) and npm run build (adapter-cloudflare done)'
        status: pass
    human_judgment: false
  - id: D8
    description: 'The Turnstile CSP additions actually let the widget load, render and verify on a prerendered page'
    requirement: 'FORM-02'
    verification: []
    human_judgment: true
    rationale: 'No widget exists yet: the island lands in Plan 03. The three directives are correct per Cloudflare documentation and the grep gates confirm nothing was loosened, but only a real browser rendering the real widget proves the policy is sufficient. Verify at the Plan 03 or Plan 04 checkpoint.'
  - id: D9
    description: 'A real message actually arrives at zlobek@ugstromiec.pl (and the BCC) with SPF, DKIM and DMARC passing'
    requirement: 'FORM-01'
    verification: []
    human_judgment: true
    rationale: 'The send path is exercised only through the dry-run seam because no Resend key, no verified sending domain and no live mailbox exist until Plan 07. Delivery cannot be automated without a live mailbox and remains the phase launch gate.'

# Metrics
duration: 79min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 01: Server-side form pipeline and POST /api/kontakt Summary

**A dependency-injected submit pipeline (reject-never-repair sanitizers, strict consent, server-side Turnstile, two-ceiling KV limiter, constant-recipient Resend send) behind the project's first dynamic route, proven by 101 unit tests and 9 endpoint tests against the real `wrangler pages dev` runtime.**

## Performance

- **Duration:** 79 min
- **Started:** 2026-08-14T14:15:23Z
- **Completed:** 2026-08-14T15:34:42Z
- **Tasks:** 3
- **Files modified:** 17 (11 created, 6 modified)

## Accomplishments

- **POST /api/kontakt is live on the real Cloudflare runtime.** The whole pipeline runs end to end: content-type and 8 KiB byte cap, JSON parse, honeypot, shape and consent, server-side Turnstile siteverify (a real round trip to `challenges.cloudflare.com` using Cloudflare's always-pass dummy secret), the KV limiter, then an awaited send. Nine Playwright cases assert the happy path and every rejection code against `wrangler pages dev`.
- **The security boundary of the whole phase is now executable, not aspirational.** 101 `node --test` cases pin the threat register: 9 header-injection payloads rejected and never repaired (T-04-01), a payload key-set equality proving `to`/`from`/`cc`/`bcc` in the request body cannot move the recipient (T-04-02), Turnstile verified before any KV write (T-04-04), and a table-driven case asserting no branch ever pairs `ok: false` with 200 (T-04-06).
- **The second endpoint is now a thin adapter.** `obsluz()` takes all side effects by injection, so Plan 05's `/api/rekrutacja` binds its own validator, subject and body builder without re-deriving pipeline order or status mapping. The two forms cannot drift.
- **RODO by construction.** Nothing under `src/lib/server/forms/` logs except two lines that carry no personal data (Turnstile error codes, and a missing-binding warning). KV stores integers under a one-way salted SHA-256 of the IP with a one-hour TTL. The Resend payload is text-only with no markup field, so a submitted message can never render as markup in the staff mail client.
- **A distributed flood can no longer eat the send budget.** Beyond the 5-per-hour per-client window, a site-wide ceiling of 40 sends per day across both forms protects the Resend free tier's 100/day, so verified-human abuse cannot silently stop delivery of real enrollment enquiries.
- **The Turnstile CSP is tightened, not loosened.** Exactly three directives gained exactly one host; `connect-src` and `frame-src` were created (they previously fell back to `default-src 'self'` and would have blocked the widget outright), and `script-src` gained no inline allowance.

## Task Commits

Each task was committed atomically:

1. **Task 1: Platform seam, CSP and the failing test files** - `4a8ff67` (chore)
2. **Task 2: Pure validators, sanitizers and the shared result contract** - `9103256` (feat)
3. **Task 3: Turnstile, rate limit, Resend mailer, orchestrator and the /api/kontakt endpoint** - `0049ba7` (feat)

## Files Created/Modified

**Created**

- `src/lib/forms/types.ts` - `FormCode`, `FormResult` and the frozen `STATUS_DLA_KODU` map. Deliberately outside `$lib/server` so the Plan 03 island imports the same contract as a type.
- `src/lib/server/forms/sanitize.ts` - `bezpiecznyEmail` (rejects, never repairs; 254-char cap; conservative shape), `bezpiecznyTekst` (strips C0 and C1 controls, keeps newlines, collapses runaway blank lines), `bezpiecznyTelefon` (rejects rather than strips).
- `src/lib/server/forms/validate.ts` - `walidujKontakt`, returning ONLY the three whitelisted fields on success, with per-field keys and strict `=== true` consent.
- `src/lib/server/forms/turnstile.ts` - `zweryfikujTurnstile`, per-attempt `idempotency_key`, fails closed from its catch.
- `src/lib/server/forms/ratelimit.ts` - `kluczLimitu` and `podLimitem`: per-form salted-hash hourly counter plus the site-wide daily ceiling.
- `src/lib/server/forms/mailer.ts` - `FROM`, `TO`, `BCC`, `TEMAT_KONTAKT`, `zbudujTrescKontakt`, `zbudujPayload`, `wyslij`. The BCC carries its D-13 removal condition in a comment.
- `src/lib/server/forms/handle.ts` - `Zaleznosci<T>` and `obsluz<T>`, the cheap-to-expensive pipeline and the single place statuses come from.
- `src/routes/api/kontakt/+server.ts` - `prerender = false` plus the POST adapter binding the pipeline to `platform.env`.
- `tests/forms.unit.ts` - 48 form cases (101 total with the existing reader suite) covering sanitize, validate, the status map, payload immutability, both rate-limit ceilings and the full `obsluz` decision table.
- `tests/kontakt-api.spec.ts` - 9 serial `page.request` cases against the real runtime.
- `.dev.vars.example` - the five form variables with Cloudflare's dummy values, and a prominent warning never to create a real `.dev.vars`.

**Modified**

- `package.json` - `test:unit` widened to the `tests/*.unit.ts` glob; new `preview:test` script carrying the test-only bindings. No dependency added.
- `wrangler.jsonc` - `kv_namespaces` binding `FORMS_KV` (placeholder id, provisioned in Plan 07), with a comment recording why the secrets are neither here nor in a `.dev.vars`.
- `worker-configuration.d.ts` - regenerated; `FORMS_KV: KVNamespace` on the base env.
- `src/app.d.ts` - global `Env` augmentation declaring the five form vars as optional, so a missing binding is a type-level possibility the endpoint handles.
- `svelte.config.js` - the three Turnstile CSP directives.
- `playwright.config.ts` - `webServer` now runs `preview:test`, with the reason documented inline.

## Decisions Made

- **No root `.dev.vars`.** See Deviation 1. Test-run secrets arrive as `wrangler pages dev --binding` flags, verified to produce an identical `platform.env`.
- **One `RATE_LIMIT_MAX` override raises both ceilings.** A single knob keeps the shared-IP Playwright suite off the limiter without adding a sixth variable, and production leaves it unset.
- **Both counters are read before either is written**, so a daily-ceiling rejection does not consume the parent's hourly allowance.
- **Three per-field error keys, not two** (`brak`, `niepoprawny`, `zbyt-dlugi`), matching the UI-SPEC's distinct Polish copy for missing, malformed and over-long.
- **`CONTACT-03`, `FORM-01` and `FORM-02` left unmarked in REQUIREMENTS.md.** All three are shared with Plans 03, 04, 05 and 07. No parent can see a form and no real send has ever happened, so marking them now would be a false claim. The last plan claiming each ID should mark it.
- **Extra exports for test pinning.** `ratelimit.ts` exports `OKNO_S`, `DOBA_S`, `DOMYSLNY_LIMIT`, `DOMYSLNY_LIMIT_DOBOWY` and `KLUCZ_DOBOWY`, and `sanitize.ts` exports `MAKS_EMAIL`, so the tests assert the real constants instead of duplicating literals that could drift.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `.dev.vars` would have broken every Cloudflare Pages deploy**

- **Found during:** Task 1 (Platform seam)
- **Issue:** The plan mandates creating a gitignored `.dev.vars` so `wrangler pages dev` and the Playwright `webServer` pick up the dummy secrets. Verified behaviour of wrangler 4.122: `wrangler types` READS `.dev.vars` and writes every key it finds into `worker-configuration.d.ts` as a **required** `string` on `__BaseEnv_Env`, plus a `NodeJS.ProcessEnv` augmentation. Two consequences, both fatal. (a) `.dev.vars` is gitignored, so Cloudflare Pages CI cannot reproduce the file, and `wrangler types --check` (the first half of `npm run build`, which Pages runs) fails with "Types are out of date" and the deploy dies. Locally the same check runs inside `npm run check` and inside the Playwright `webServer` build, so whichever variant of the file is committed, one environment is always red. (b) The generated required members collide with the plan's own `src/app.d.ts` optional declarations, producing a declaration-merging type error.
- **Fix:** No `.dev.vars` is created. Added `npm run preview:test`, which is plain `wrangler pages dev` plus `-b KEY=VALUE` flags carrying Cloudflare's published always-pass dummy Turnstile secret and `FORM_DRY_RUN=1`, and pointed `playwright.config.ts` `webServer` at it. Verified against wrangler's own bindings table that `--binding` produces exactly the same `env.*` surface as `.dev.vars` (all five appear as local Environment Variables), while `wrangler types` never sees them. `npm run preview` stays clean for real previews, so the dry-run seam can never leak into a non-test run. `.dev.vars.example` is still committed as the plan requires and now leads with a warning explaining the trap; `wrangler.jsonc` carries the same note next to the KV binding.
- **Files modified:** `package.json`, `playwright.config.ts`, `.dev.vars.example`, `wrangler.jsonc`
- **Verification:** `npx wrangler types --check` green with no `.dev.vars` present; `npm run build` green; all 9 endpoint tests reach the success path through the dry-run seam.
- **Committed in:** `4a8ff67`
- **Note:** `playwright.config.ts` is not in the plan's `files_modified`. It had to change because it is the only consumer of the harness command.
- **Note:** the committed `preview:test` script contains Cloudflare's **published** always-pass test secret (`1x0000...AA`), documented for exactly this purpose. It is not a credential and grants nothing.

**2. [Rule 3 - Blocking] The pre-commit hook forbids committing a red type-check, so the RED commit boundary moved**

- **Found during:** Task 1 (first commit attempt)
- **Issue:** The plan wants both test files committed in Task 1 in a deliberately RED state. `svelte-check` covers `tests/`, so `tests/forms.unit.ts` importing not-yet-existing modules produces 13 type errors, and the repo's pre-commit hook runs the check and refused the commit (HEAD stayed at `a5c1858`). Task 1's own acceptance criterion, "`npm run check` exits 0", is therefore unreachable while a RED unit file is on disk. `--no-verify` is prohibited.
- **Fix:** Kept every commit green without weakening the contract. `tests/kontakt-api.spec.ts` still landed in Task 1 (it type-checks clean and is genuinely RED at runtime with 404s until Task 3, preserving the endpoint RED anchor). `tests/forms.unit.ts` was authored in full up front, then landed in two commits: the sanitize, validate and status-map cases with the modules they cover in Task 2, and the mailer, ratelimit and `obsluz` cases with theirs in Task 3. The final file is byte-identical to the version authored before any implementation existed, so the tests-first discipline is intact and no assertion was written to fit an implementation.
- **Files modified:** `tests/forms.unit.ts` (split across `9103256` and `0049ba7`)
- **Verification:** `npm run check` exits 0 at every commit; `npm run test:unit` reports 70 passing after Task 2 and 101 after Task 3.
- **Committed in:** `4a8ff67`, `9103256`, `0049ba7`

**3. [Rule 1 - Bug] A corrupt KV counter would have silently disabled the limiter**

- **Found during:** Task 3 (ratelimit.ts)
- **Issue:** The research pattern reads the counter as `Number((await kv.get(k)) ?? '0')`. A non-numeric stored value yields `NaN`, and `NaN >= limit` is `false`, so the limiter would wave the request through and then write the string `"NaN"`, permanently jamming that key open.
- **Fix:** Added a `licznik()` helper that coerces a missing, empty, negative or non-finite value to `0` and floors the rest, so a corrupt value fails safe as "no submissions yet" instead of "unlimited".
- **Files modified:** `src/lib/server/forms/ratelimit.ts`
- **Verification:** `podLimitem` cases still green; the counters are asserted to be integer strings.
- **Committed in:** `0049ba7`

**4. [Rule 2 - Missing Critical] The body cap was counted in characters, not bytes**

- **Found during:** Task 3 (+server.ts)
- **Issue:** The research skeleton caps with `surowe.length`, which counts UTF-16 code units. Every Polish diacritic is two bytes in UTF-8, so a "8192-character" check admits a body well over the 8192-byte cap the plan specifies, on precisely the language this site is written in.
- **Fix:** Reject early on a declared `content-length` over the cap, then measure the real payload with `new TextEncoder().encode(surowe).byteLength`.
- **Files modified:** `src/routes/api/kontakt/+server.ts`
- **Verification:** `tests/kontakt-api.spec.ts` oversized-body case returns 400 with code `walidacja`.
- **Committed in:** `0049ba7`

**5. [Rule 2 - Missing Critical] `wyslij` could throw instead of reporting a failed send**

- **Found during:** Task 3 (mailer.ts)
- **Issue:** The plan and the research example call `fetch` to Resend unguarded. A DNS or TLS error rejects the promise, which escapes `obsluz` and leaves SvelteKit to return an opaque 500. `+error.svelte` does not fire for `+server.ts`, so the island would receive a body it cannot map to any Polish message, breaking the D-12 contract exactly when it matters most.
- **Fix:** Wrapped the send in try/catch returning `false`, so a network failure becomes an honest 502 with code `wysylka`. Nothing is logged: the payload contains personal data.
- **Files modified:** `src/lib/server/forms/mailer.ts`
- **Verification:** `obsluz` maps a `false` send to 502 (unit); no path returns 200 on failure.
- **Committed in:** `0049ba7`

**6. [Rule 2 - Missing Critical] C1 control characters survived the text sanitizer**

- **Found during:** Task 2 (sanitize.ts)
- **Issue:** The research regex `[\x00-\x09\x0B-\x1F\x7F]` covers C0 and DEL but not the C1 range (0x80 to 0x9F), which the plan explicitly asks for. It also trips eslint's `no-control-regex`, which would have needed a suppression.
- **Fix:** Replaced the regex with an explicit code-point scan covering C0, DEL and C1 while preserving the newline. No lint suppression needed, and the dangerous-character reject list is now a greppable array of literals rather than a control-character regex.
- **Files modified:** `src/lib/server/forms/sanitize.ts`
- **Verification:** `npm run lint` green with no suppressions; control-character strip case green.
- **Committed in:** `9103256`

**7. [Rule 1 - Bug] My own comments defeated three of the plan's grep gates**

- **Found during:** Tasks 1 and 3 (acceptance greps)
- **Issue:** The plan's gates require `grep -c 'waitUntil'`, `grep -c "import.meta.env"` and `grep -c 'unsafe-inline'` (beyond the one pre-existing `style-src` entry) to be zero. Comments warning against each banned API contained the literal token, so the gates reported matches and would have been permanently useless as a machine check for future reviewers.
- **Fix:** Reworded each comment to describe the banned API instead of naming it, and recorded in-line that the token is grep-banned and therefore deliberately unwritten.
- **Files modified:** `src/lib/server/forms/mailer.ts`, `src/routes/api/kontakt/+server.ts`, `svelte.config.js`
- **Verification:** all three greps now return zero matches across `src/lib/server/forms/` and `src/routes/api/`; `unsafe-inline` appears exactly once in `svelte.config.js`.
- **Committed in:** `4a8ff67`, `0049ba7`

**8. [Rule 1 - Bug] Pre-existing em dashes in two touched files**

- **Found during:** Task 1
- **Issue:** Task 1's acceptance criterion forbids an em dash in any file it touches, and `svelte.config.js` and `playwright.config.ts` each already carried one in a code comment. The project rule is no em dashes anywhere.
- **Fix:** Replaced both with a colon.
- **Files modified:** `svelte.config.js`, `playwright.config.ts`
- **Verification:** `grep -c '—'` returns 0 for every file this plan touched.
- **Committed in:** `4a8ff67`

---

**Total deviations:** 8 auto-fixed (2 blocking, 4 missing critical, 2 bugs)
**Impact on plan:** No scope creep. Deviation 1 prevented a broken production deploy and is the only one that changed the plan's shape, adding `preview:test` and a `playwright.config.ts` edit while dropping the mandated `.dev.vars`. Deviation 2 moved a commit boundary without weakening a single assertion. The remaining six are correctness and security fixes inside the planned surface, four of them in code the research examples supplied verbatim.

## Issues Encountered

- **`wrangler types` reads `.dev.vars`.** Diagnosed empirically (generate with the file, rename it, regenerate, diff) rather than assumed. See Deviation 1. The behaviour is now documented in three places a future agent will actually look: `.dev.vars.example`, `wrangler.jsonc` next to the KV binding, and `playwright.config.ts`.
- **`FORMS_KV` is simulated locally.** The plan assumed it; confirmed from wrangler's bindings table (`env.FORMS_KV (PLACEHOLDER_FORMS_KV_ID) KV Namespace local`), so the rate-limit path is genuinely exercised in tests rather than falling through the missing-binding branch.
- **No regression elsewhere.** The full suite is 64 Playwright tests plus 101 unit tests green, and `npm run build` still prerenders every content route alongside the new dynamic one.

## Known Stubs

| Stub                                        | File            | Reason                                                                                                                                                                                                              |
| ------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"id": "PLACEHOLDER_FORMS_KV_ID"`           | `wrangler.jsonc`  | The real KV namespace is provisioned against the live Cloudflare account in Plan 07. Local runs use the simulated binding. Until Plan 07 a deployed request would hit `podLimitem`'s missing-binding branch, which warns and degrades to Turnstile-only protection rather than throwing. |
| Resend send never actually executed | `src/lib/server/forms/mailer.ts` | `FORM_DRY_RUN=1` in the test harness short-circuits the send. Real delivery needs the Resend key, the verified `send.zlobekstromiec.pl` domain and its DNS records, all Plan 07. Tracked as coverage item D9. |

Neither stub blocks this plan's goal: the pipeline, its status contract and its security properties are all exercised for real. Both are resolved by Plan 07.

## User Setup Required

None for this plan. Plan 07 provisions the Cloudflare Pages secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SALT`), the real `FORMS_KV` namespace id, and the Resend sending domain with its SPF, DKIM, MX and DMARC records.

## Next Phase Readiness

**Ready**

- Plan 03 (klauzula + kontakt island) can build against a live endpoint and a stable `FormResult` contract. The five machine codes map 1:1 to the UI-SPEC error table, and `pola` carries `brak`, `niepoprawny` or `zbyt-dlugi` per field for `aria-describedby` wiring.
- The CSP already permits the Turnstile loader, its iframe and its calls, plus the island's same-origin fetch to `/api/*`.
- Plan 05 can add `/api/rekrutacja` as a second `obsluz` adapter: a validator, a subject constant, a body builder and a `replyTo` accessor.

**Carry forward**

- **Do not create `.dev.vars`.** It breaks `npm run check` and the Pages deploy. Use `npm run preview:test`.
- **`FORM_DRY_RUN` must never become a Cloudflare Pages variable.** It lives only in the `preview:test` script.
- **BCC launch gate (D-13):** remove the `BCC` constant and the klauzula sentence describing the backup copy in the same commit, once delivery to the Gmina mailbox is proven.
- **`src/routes/+layout.ts`** still says "no `+server.ts` ... anywhere this phase" about Phase 1. `04-PATTERNS.md` asked for that parenthetical to be refreshed now that a dynamic route exists; left alone because the file is outside this plan's `files_modified`. Worth a one-line fix in Plan 05, which touches the second endpoint.
- **Requirements:** `CONTACT-03`, `FORM-01` and `FORM-02` remain unmarked on purpose. Plans 04, 05 and 07 finish them.

## Self-Check: PASSED

All 11 created files exist on disk. All 3 task commits (`4a8ff67`, `9103256`, `0049ba7`) exist in `git log`. `npm run check`, `npm run lint`, `npm run build`, `npm run test:unit` (101 pass) and `npm run test` (64 pass) all exit 0.

---

_Phase: 04-enrollment-contact-email-pipeline_
_Completed: 2026-08-14_
