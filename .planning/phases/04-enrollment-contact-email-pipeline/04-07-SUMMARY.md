---
phase: 04-enrollment-contact-email-pipeline
plan: 07
subsystem: infra
tags:
  [
    cloudflare-pages,
    workers-kv,
    turnstile,
    resend,
    dns,
    custom-domain,
    secrets,
    go-live,
    csp
  ]

# Dependency graph
requires:
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'POST /api/kontakt and /api/rekrutacja, the obsluz pipeline, the FORMS_KV binding declaration, the dry-run seam and the preview:test harness (04-01, 04-05)'
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'the TURNSTILE_SITEKEY placeholder constant and the two form islands (04-03), the live /kontakt and /rekrutacja routes (04-04, 04-06)'
provides:
  - 'The live Turnstile widget widget-zlobekstromiec wired into both deployed forms, with the matching secret in the Pages environment'
  - 'A real Workers KV namespace (55f55448fe1345e28a79da5a3e9e9ca9) bound as FORMS_KV on the production deployment, so the strict 5/hour and 40/day ceilings are actually in force'
  - 'Three encrypted Pages secrets (RESEND_API_KEY, TURNSTILE_SECRET_KEY, RATE_LIMIT_SALT) and provably neither local-only variable'
  - 'zlobekstromiec.pl and www.zlobekstromiec.pl as active Pages custom domains with active certificates'
  - 'A localhost Turnstile test seam that keeps the whole Playwright suite meaningful against a hostname-scoped live widget'
  - 'A rate limiter that degrades instead of 500-ing when KV is unusable'
  - 'docs/dev-env.md as the machine contract for the form environment, and a corrected domain statement in .claude/CLAUDE.md'
affects: [06-launch-hardening]

# Tech tracking
tech-stack:
  added: [] # zero npm packages installed, by design (T-04-SC)
  patterns:
    - 'Hostname-scoped credential seam: production key committed, published dummy substituted on localhost, safe because the server-side secret is the real gate'
    - 'Fail-open abuse control: a KV error degrades the limiter rather than rejecting an unstored, unrecoverable enquiry'
    - 'Throwaway preview deployment as a safe probe for deploy-time binding validation'
    - 'Secret set by piping stdin (openssl rand | wrangler pages secret put) so the value never enters a file, a transcript or shell history'

key-files:
  created: []
  modified:
    - src/lib/content/forms.ts
    - src/lib/components/TurnstileWidget.svelte
    - src/lib/server/forms/ratelimit.ts
    - tests/forms.unit.ts
    - wrangler.jsonc
    - docs/dev-env.md
    - .claude/CLAUDE.md

key-decisions:
  - 'The live site key is committed and the published dummy is substituted on localhost by TurnstileWidget.svelte. The plan asked for a single-line swap AND a green local suite, which is not satisfiable: the live widget is hostname-scoped and issues no token off its allowed origins, so both form success-path specs would hang forever.'
  - 'A KV failure fails OPEN. Every KV operation is now guarded; the previous code only guarded an ABSENT binding, so a present-but-unusable one became an opaque 500 on every submission of both forms.'
  - 'FORM-01 is deliberately left UNMARKED. Its wording requires delivery to zlobek@ugstromiec.pl, and that mailbox does not exist yet, so mail to it hard-bounces. RECRUIT-03, RECRUIT-04 and FORM-02 are marked.'
  - 'No broader Resend API key was minted. The send-only key cannot read delivery status by design, and that restriction is a security property worth more than the convenience of scripted log reads.'
  - 'The browser-side delivery test is an irreducible human check: a real managed Turnstile widget refuses to issue a token to an automated browser, headless or headful, which is precisely its purpose.'

patterns-established:
  - 'Pattern: prove a deploy-time constraint with a throwaway preview deployment instead of gambling production. A preview deploy on a scratch branch surfaced Error 8000022 with zero risk, then was deleted.'
  - 'Pattern: verify a live security boundary by asserting it FAILS closed. The deployed endpoints were proven by rejecting a bogus Turnstile token and an unticked consent box, which needs no valid challenge and so is fully automatable.'

requirements-completed: [RECRUIT-03, RECRUIT-04, FORM-02]

coverage:
  - id: D1
    description: 'The deployed site serves the live Turnstile site key, not the dummy, and the widget talks to the challenge platform under that key'
    requirement: 'FORM-02'
    verification:
      - kind: other
        ref: 'Live /kontakt JS chunk contains 0x4AAAAAAEQGTDA3in-HRJJ4; the browser run shows the challenge request .../turnstile/f/av0/rch/e1d7q/0x4AAAAAAEQGTDA3in-HRJJ4/light/...'
        status: pass
    human_judgment: false
  - id: D2
    description: 'The deployed endpoints verify Turnstile server-side and fail CLOSED on an invalid token, on both forms'
    requirement: 'FORM-02'
    verification:
      - kind: other
        ref: 'POST /api/kontakt and /api/rekrutacja with a bogus token both return 400 {"ok":false,"code":"turnstile"}; GET returns 405 on both'
        status: pass
    human_judgment: false
  - id: D3
    description: 'Consent is enforced ahead of the metered stages, so a missing tick never spends a Turnstile or KV call'
    requirement: 'RECRUIT-04'
    verification:
      - kind: other
        ref: 'POST with zgoda:false returns 400 {"ok":false,"code":"zgoda"}; the KV namespace still lists zero keys after three rejected POSTs, confirming T-04-04 ordering on the live site'
        status: pass
    human_judgment: false
  - id: D4
    description: 'The production deployment carries the real KV binding and exactly the three secrets, with neither local-only variable'
    verification:
      - kind: other
        ref: 'Deployment 4c35fd82: kv_namespaces {"FORMS_KV":{"namespace_id":"55f55448fe1345e28a79da5a3e9e9ca9"}}, env_vars ["RATE_LIMIT_SALT","RESEND_API_KEY","TURNSTILE_SECRET_KEY"]'
        status: pass
    human_judgment: false
  - id: D5
    description: 'The Resend sending identity is live: a message from the verified domain is accepted for delivery'
    requirement: 'FORM-01'
    verification:
      - kind: other
        ref: 'POST https://api.resend.com/emails with the module FROM/TO/BCC shape returned id 1c8c365a-819d-446c-9b77-b0fb9cec642b'
        status: pass
    human_judgment: false
  - id: D6
    description: 'A KV failure degrades the limiter instead of returning an opaque 500 on every submission'
    verification:
      - kind: unit
        ref: 'tests/forms.unit.ts, 4 cases including "never lets a KV error escape as a rejected promise" and the obsluz-level case; all 4 go red under a mutation that makes the catch re-throw'
        status: pass
    human_judgment: false
  - id: D7
    description: 'The sending DNS resolves publicly: SPF, MX, DKIM and DMARC'
    verification:
      - kind: other
        ref: 'Adjusted gate green on 8.8.8.8, 9.9.9.9, 1.1.1.1 and art.ns.cloudflare.com; SPF/MX at send.send.zlobekstromiec.pl per the real Resend layout'
        status: pass
    human_judgment: false
  - id: D8
    description: 'The frame-src CSP directive is sufficient for the real widget'
    requirement: 'FORM-02'
    verification:
      - kind: other
        ref: 'Deployed CSP contains frame-src self https://challenges.cloudflare.com; a real browser session recorded ZERO securitypolicyviolation events while the challenge platform loaded its scripts, sub-resources and blob URLs'
        status: partial
    human_judgment: true
    rationale: 'No CSP violation was observed and every challenge-platform resource loaded, which is strong evidence. But the widget never reached the point of rendering its iframe, because a managed widget refuses to issue a token to an automated browser. A human loading /kontakt in a normal browser closes this in seconds.'
  - id: D9
    description: 'A real message submitted through the live form arrives, inspected for From, Reply-To, subject and plain-text body'
    requirement: 'FORM-01'
    verification: []
    human_judgment: true
    rationale: 'Two independent reasons, both structural. A managed Turnstile widget cannot be driven by an automated browser, and the recipient mailbox zlobek@ugstromiec.pl does not exist yet so the to: leg hard-bounces. The send-only Resend key also cannot read delivery status by design. This is the phase launch gate and stays open.'
  - id: D10
    description: 'The sixth rapid submission is rate-limited on the deployed site'
    verification: []
    human_judgment: true
    rationale: 'Reaching the limiter requires six valid Turnstile challenges, which an automated browser cannot obtain. The binding is confirmed present on the deployment and the limiter is unit-tested on both ceilings, so only the live observation is outstanding.'

# Metrics
duration: 68min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 07: Go-live secrets, KV and the delivery gate Summary

**The forms are live with real bot protection, real rate-limit counters and a verified sending identity on a domain whose DNS moved to Cloudflare mid-plan, proven on the deployed origin by asserting the endpoints fail closed; the one thing still unproven is a human-submitted message arriving, because the Gmina mailbox does not exist yet and a managed Turnstile widget will not answer to a robot.**

## Performance

- **Duration:** 68 min
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- **Both forms are live with the real widget.** `TURNSTILE_SITEKEY` is now the live `widget-zlobekstromiec` key, confirmed through the Turnstile API as the account's only widget, so the key/secret pairing is unambiguous. The deployed JS carries it and the browser session shows the challenge platform being called under that exact key.
- **The security boundary is proven ON THE DEPLOYED SITE, not just in tests.** Rather than needing a valid challenge, the live proof asserts the endpoints *fail closed*: a bogus Turnstile token returns `400 {"ok":false,"code":"turnstile"}` on both endpoints, an unticked consent returns `400 code:zgoda`, and `GET` returns `405`. This is fully automatable precisely because it needs no valid token.
- **The rate limiter is real.** Deployment `4c35fd82` binds `FORMS_KV` to namespace `55f55448fe1345e28a79da5a3e9e9ca9`, and carries exactly `RATE_LIMIT_SALT`, `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`, with `FORM_DRY_RUN` and `RATE_LIMIT_MAX` provably absent, so production runs the strict 5/hour and 40/day defaults.
- **T-04-04 confirmed live, for free.** The KV namespace still lists **zero keys** after three rejected POSTs, which is direct evidence that Turnstile is verified before any KV write and that bots cannot drain the counter.
- **The sending identity works.** A message with the module's exact `FROM`/`TO`/`BCC`/`reply_to` shape was accepted by Resend (id `1c8c365a-819d-446c-9b77-b0fb9cec642b`) from the verified `send.zlobekstromiec.pl`.
- **The custom domain is live.** Both apex and `www` are attached to the Pages project with `active` status and `active` certificates, backed by two proxied CNAMEs. The `noindex` and robots-disallow guard was left untouched as Phase 6 scope.
- **The salt is genuinely unreversible.** `RATE_LIMIT_SALT` was generated with `openssl rand -hex 32` piped straight into `wrangler pages secret put`, so the value never existed in a file, a commit, shell history or this transcript (T-04-39).

## Task Commits

1. **Task 2 (site key + test seam)** - `d3a5798` (feat)
2. **Task 3 (environment docs + domain truth)** - `a9525c9` (docs)
3. **Blockers recorded** - `3f65329` (docs)
4. **Limiter hardening** - `c52e742` (fix)
5. **Task 2 completion (real KV binding)** - `b318c24` (feat)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The plan's site-key swap was not satisfiable as written**

- **Found during:** Task 2
- **Issue:** The plan required the live key in `forms.ts` AND `npm run test` green. The live widget is hostname-scoped to the Pages origin and the custom domain, so on `localhost` it issues no token at all. Both form success-path specs wait on `cf-turnstile-response` holding a value, so they would hang until timeout, and `preview:test` supplies the *dummy* secret, which would not match the live key anyway.
- **Fix:** `TurnstileWidget.svelte` substitutes Cloudflare's published dummy site key when `location.hostname` is a loopback host. Chosen over a build-time env var because a committed `.env` risks the `wrangler types` trap that cost 04-01 a deviation, and over changing the specs because that would delete real coverage.
- **Why it cannot weaken production:** the site key only selects which widget challenges the visitor. Acceptance is decided server-side by siteverify against the live secret, so a forced dummy token fails closed exactly like a mismatched pair. The dummy is a published constant, not a credential.
- **Files modified:** `src/lib/components/TurnstileWidget.svelte` (not in the plan's `files_modified`)
- **Committed in:** `d3a5798`

**2. [Rule 2 - Missing Critical] A KV failure would have 500-ed every submission on both forms**

- **Found during:** Task 2, while checking whether a placeholder id was survivable at runtime
- **Issue:** The only guard was `if (!kv)`, which catches an *absent* binding. A binding that is present but unusable (bad id, or any transient KV failure) makes `get`/`put` reject, and nothing caught it: the rejection escapes `obsluz` and becomes an opaque 500. `+error.svelte` does not fire for a `+server.ts`, so the island would show a parent no usable Polish message, breaking D-12 exactly when someone is enrolling.
- **Fix:** every KV operation is wrapped and fails **open**, matching the documented missing-binding policy. The limiter is an abuse control, not the security gate; Turnstile still verifies every submission, whereas failing closed would reject genuine enquiries that are stored nowhere and so are lost for good. An over-limit result still returns `false`; only a thrown error reaches the catch.
- **Verification:** 4 new cases, all 4 red under a mutation that makes the catch re-throw, with the file restored byte-identically afterwards.
- **Files modified:** `src/lib/server/forms/ratelimit.ts`, `tests/forms.unit.ts` (neither in the plan's `files_modified`)
- **Committed in:** `c52e742`

### Checkpoint-approved scope changes

**3. DNS migrated to Cloudflare mid-plan.** The plan assumed the sending records would be hand-entered at home.pl. The zone now lives in the Cloudflare account (registration still home.pl), so the Task 1 gate was re-pointed at the real layout: SPF and MX sit at **`send.send.zlobekstromiec.pl`**, one level deeper than the plan says, because Resend's Return-Path prefix is itself `send`. Green on four resolvers. `1.1.1.1` briefly served a stale negative cache from the pre-migration empty zone, which cleared during verification.

**4. Custom domains attached** (new sub-task): both apex and `www`, plus the two proxied CNAMEs the API does not create automatically. Now `active` with `active` certs.

### Deferred / not done as written

**5. FORM-01 left unmarked, against the instruction to mark it.** Its wording is explicit: *delivered to the Gmina mailbox `zlobek@ugstromiec.pl`*. That mailbox does not exist, so mail to it hard-bounces. Marking it would be a false claim about the phase's central gate. `RECRUIT-03`, `RECRUIT-04` and `FORM-02` are marked; `RECRUIT-03` follows the `CONTACT-03` precedent set in 04-04 (form live and endpoint deployed).

**6. The live browser delivery test was not performed by me, and could not be.** See Issues below. No shortcut was taken because every available one required weakening production bot protection.

## Issues Encountered

- **A managed Turnstile widget will not answer an automated browser.** Tried headless and headful Chromium: the challenge handshake never issues a token, so both forms correctly showed the Polish fallback panel (*„Nie udało się potwierdzić, że nie jesteś robotem"*). This is Turnstile doing its job, and it makes the browser-side delivery test irreducibly human. The islands' failure handling looked exactly right under this condition, which is itself a useful result.
- **The Resend key cannot read delivery status.** `GET /emails/{id}` returns `401 restricted_api_key: This API key is restricted to only send emails`. The plan mandated a send-only key, so this is correct behaviour, not a misconfiguration. Per-recipient bounce evidence must be read in the dashboard. A broader key was deliberately not created.
- **A placeholder KV id is undeployable.** Confirmed with a throwaway preview deployment: `Error 8000022: Invalid KV namespace ID (PLACEHOLDER_FORMS_KV_ID). Not a valid hex string.` Production was never touched and the failed probe was deleted. This is why the plan could not proceed before the token gained `Workers KV Storage: Edit`.
- **The plan's secret-leak grep is ineffective and should be fixed in Phase 6.** It greps `0x4AAAAAAA` (seven A's), but real keys here begin `0x4AAAAAAE`, so it would never have matched the actual secret. Exact-value greps were run instead across tracked files and the whole working tree: clean.
- **`[Cloudflare Turnstile] Unable to find onload callback` warning appears intermittently.** Investigated and benign: the loader may execute before hydration, but the effect's `if (window.turnstile) rysuj()` branch covers that ordering, and the widget does render. Left alone.
- **This sandbox filters DNS,** so `zlobekstromiec.pl` and one Turnstile sub-host are unreachable from here. The custom domain therefore could not be fetched to confirm it serves, though Cloudflare reports both domains and certs active.

## Known Stubs

None introduced. The two stubs 04-01 recorded are both now resolved: the KV placeholder is a real namespace, and the Resend send path has executed for real.

## Launch-gate items (carried to STATE.md)

- **Gmina mailbox:** create/confirm `zlobek@ugstromiec.pl`. Until then submissions land only in the BCC backup. Re-testing is a single form submission, zero deploys. **Blocker kept open.**
- **BCC removal (D-13):** delete the `BCC` constant and the klauzula backup-copy paragraph in the SAME commit, once delivery to the Gmina mailbox is proven.
- **Gmina IT:** ask them to allowlist `send.zlobekstromiec.pl` and confirm the mailbox accepts external mail.
- Confirm the published telephone number is a służbowy line; confirm the building coordinates for the map pin; confirm the fee wording with the client; obtain the IOD contact for the klauzula.
- Confirm whether a BCC recipient counts as a second send against the Resend free daily quota (assumption A2, still open).
- Tighten DMARC beyond `p=none` once traffic is observed, and fix the ineffective secret-leak grep pattern.

## User Setup Required

**Two human checks close this phase (both minutes, no deploy):**

1. **Submit both live forms in a normal browser** at https://zlobek-gminny-stromiec.pages.dev/kontakt and /rekrutacja. Confirm the Turnstile widget renders and is keyboard reachable, the success panel appears, and then in the **Resend dashboard** confirm SPF/DKIM/DMARC pass, that the `zlobek@ugstromiec.pl` leg bounced (expected, mailbox absent) and that the `devzlobekstromiec@gmail.com` BCC copy arrived. In Gmail, check From is the role address on the sending subdomain, Reply-To is the address typed into the form, the subject is the static Polish constant, the body is plain text, and Reply addresses the parent.
2. **Submit /kontakt six times quickly** to see the sixth rate-limited, which proves the live KV counters.

Evidence already on file for the Gmina: Resend accepted message id `1c8c365a-819d-446c-9b77-b0fb9cec642b` from `send.zlobekstromiec.pl`.

## Next Phase Readiness

**Ready.** Phase 4 is functionally complete: both vertical slices are live, bot protection and rate limiting are real, and the sending identity is verified.

**Carry forward to Phase 6**

- The site is still `noindex` + `Disallow: /` on every origin, including the new custom domain. Flipping that is Phase 6 and was deliberately not touched.
- `static/og-placeholder.png` still shows old branding.
- FORM-01 stays unmarked until the Gmina mailbox exists.
- The scoped `CLOUDFLARE_API_TOKEN` now has Pages, Turnstile, Workers KV and zone DNS. It is broader than before: consider narrowing after launch.

## Self-Check: PASSED

All 7 modified files exist. All 5 commits (`d3a5798`, `a9525c9`, `3f65329`, `c52e742`, `b318c24`) are in `git log` and pushed. `npm run check` (0 errors), `npm run lint`, `npm run build`, `npm run test:unit` (168 pass) and `npm run test` (109 pass) all exit 0. No secret value appears in any tracked file, the working tree or any commit message. Live deployment `4c35fd82` reports `deploy success` with the real KV binding and exactly three secrets.

---

_Phase: 04-enrollment-contact-email-pipeline_
_Completed: 2026-08-14_
