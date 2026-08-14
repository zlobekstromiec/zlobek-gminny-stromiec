---
phase: 04-enrollment-contact-email-pipeline
verified: 2026-08-14T21:15:00Z
status: gaps_found
score: 4/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "Both forms require ticking an explicit RODO consent, display the klauzula informacyjna, and are spam-protected by Cloudflare Turnstile verified server-side, with the endpoint rate-limiting abuse (ROADMAP Success Criterion 3)"
    status: failed
    reason: >
      The consent, klauzula and Turnstile sub-clauses are genuinely verified (live tests pass,
      live site key committed, server-side siteverify fails closed). But the rate-limiter
      sub-clause is functionally broken: 04-REVIEW.md flagged this as Critical (CR-01) during
      the phase's own code review, and it was never fixed. `podLimitem` refreshes each KV key's
      `expirationTtl` on every accepted write instead of bucketing by a fixed calendar window,
      so as long as the site receives at least one legitimate submission per window, the
      "hourly" per-client counter and the "daily" site-wide counter (rl:doba) never expire and
      climb monotonically. Under ordinary legitimate traffic this eventually pins the
      site-wide daily counter at 40 and returns 429 to EVERY parent on BOTH forms until a full
      24h passes with zero successful submissions -- at which point the cycle restarts. This
      is the opposite of "rate-limiting abuse": it is a recurring, self-inflicted denial of
      service against genuine enrollment/contact enquiries, on a no-storage pipeline where a
      blocked request leaves no record anywhere. The bug, its explanatory comment ("a fixed
      window that self-cleans" -- which is not what the code does), and the unit test that
      pins the buggy behaviour (tests/forms.unit.ts:410-421, asserting a fresh `ttl: DOBA_S` on
      every write) are byte-identical to the state the code review already flagged; no fix
      commit exists after the review (94ce57c) and no override is recorded.
    artifacts:
      - path: "src/lib/server/forms/ratelimit.ts"
        issue: "Lines 95-97: kv.put(..., { expirationTtl: OKNO_S }) and kv.put(KLUCZ_DOBOWY, ..., { expirationTtl: DOBA_S }) run on every accepted submission, restarting the TTL clock instead of using a date/hour-bucketed key. Confirmed present verbatim against 04-REVIEW.md CR-01."
      - path: "tests/forms.unit.ts"
        issue: "Lines 410-421 assert the buggy ever-extending-window behaviour as correct, so the test suite would go red if the bug were fixed without updating this test in lockstep (as the review itself notes)."
    missing:
      - "Bucket the daily key by calendar date (e.g. rl:doba:2026-08-14) and the per-client key by hour-of-epoch, with a cleanup-only TTL (e.g. 2x the window), so the DATE/HOUR in the key defines the window rather than the TTL refreshing on write."
      - "Update tests/forms.unit.ts:410-421 to assert the new bucketing behaviour instead of pinning the refresh-on-write behaviour."
      - "Re-verify the live 40/day and 5/hour ceilings on the deployed site after the fix (Plan 07 left this as an outstanding manual check; it is currently not safe to rely on because a passing manual 'submit 6 times, 6th is blocked' check would look correct in the short term while the underlying accounting bug still exists)."
human_verification:
  - test: "Submit both live forms (/kontakt and /rekrutacja) in a normal, non-automated browser at the production URL."
    expected: "The live Turnstile widget renders visibly, is keyboard-reachable and passes contrast; the success panel appears; the message arrives in the devzlobekstromiec@gmail.com BCC backup (the zlobek@ugstromiec.pl leg is expected to bounce until the Gmina creates that mailbox -- FORM-01's known external blocker, already tracked in STATE.md, not a code gap)."
    why_human: "A managed Turnstile widget refuses to issue a token to any automated browser (confirmed during Plan 07 execution with both headless and headful Chromium), so this path is irreducibly manual. Also closes the frame-src CSP directive, which has never been exercised because the dummy test sitekey used in Playwright renders no frame at all."
  - test: "After the CR-01 rate-limiter fix lands, re-run a live rate-limit check: submit /kontakt 6 times quickly (expect the 6th to 429) AND separately confirm the daily/per-client KV keys actually expire and reset rather than perpetually extending."
    expected: "The 6th rapid submission is rejected with 429, and the same client can submit again after the TTL window has genuinely elapsed rather than needing a full day of total site silence."
    why_human: "Confirms the fix in a live KV environment; the current bug is invisible to a short manual spot-check (it only manifests over days of continued legitimate use), so a quick 6-submissions test alone is not sufficient evidence either way."
---

# Phase 4: Enrollment, Contact & Email Pipeline Verification Report

**Phase Goal:** Parents can find enrollment information, download the forms, and submit enrollment and contact requests that are safely emailed to the żłobek — with RODO compliance, spam protection, and zero data storage.
**Verified:** 2026-08-14T21:15:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth (ROADMAP Success Criterion) | Status | Evidence |
|---|---|---|---|
| 1 | A visitor can read enrollment information (harmonogram, kryteria, zasady) and download the PDF enrollment forms (wnioski). | ✓ VERIFIED | `/rekrutacja` live and prerendered; `src/lib/content/rekrutacja.ts` (KRYTERIA, PROCEDURA, WNIOSKI_PUSTE); `KryteriaTable.svelte` real data table. Ran `tests/rekrutacja.spec.ts` live: 17/17 pass, including "kryteria to prawdziwa tabela...", "procedura mówi o złożeniu osobistym...", and "każdy wniosek do pobrania wskazuje realny plik pod /dokumenty/ i zwraca 200". |
| 2 | A visitor can submit an online enrollment application and a contact message; each is delivered by email via Resend to the fixed żłobek address, with no database or stored submission body. | ✓ VERIFIED (with documented external caveat) | `POST /api/kontakt` and `POST /api/rekrutacja` both live, each running the shared `obsluz()` pipeline into `wyslij()` (Resend REST call). Ran `tests/kontakt-api.spec.ts` (9/9 pass) and `tests/rekrutacja-api.spec.ts` (11/11 pass) live against the real Cloudflare runtime, including the full send-and-200 path. `mailer.ts` FROM/TO/BCC are module constants (grep-confirmed, unreachable from a request). `grep -rn 'console\.'` under `src/lib/server/forms/` yields only the two documented non-personal diagnostic lines. **Caveat (external, not a code gap per task instructions):** the `TO` recipient `zlobek@ugstromiec.pl` does not yet exist as a live mailbox (Gmina has not created it), so that leg currently hard-bounces; delivery is proven via the BCC backup and a real accepted Resend send (id `1c8c365a-819d-446c-9b77-b0fb9cec642b`). This is why FORM-01 is deliberately left unmarked in REQUIREMENTS.md and tracked as a blocker in STATE.md. |
| 3 | Both forms require ticking an explicit (unticked-by-default) RODO consent, display the klauzula informacyjna, and are spam-protected by Cloudflare Turnstile verified server-side, with the endpoint rate-limiting abuse. | ✗ FAILED (partial) | Consent, klauzula and Turnstile sub-clauses verified: `ConsentBlock.svelte` ships `zaznaczone = $bindable(false)` with no bare `checked` attribute; `KLAUZULA` (12 blocks) renders inside a native `<details>`; both endpoints call `zweryfikujTurnstile()` before any metered work and fail closed from its catch; the live site key `0x4AAAAAAEQGTDA3in-HRJJ4` is committed in `forms.ts` and confirmed live in Plan 07. **Rate-limiting sub-clause fails**: `src/lib/server/forms/ratelimit.ts` lines 95-97 still contain the exact Critical defect (CR-01) that `04-REVIEW.md` flagged and that was never fixed — see Gaps below. |
| 4 | A visitor can see contact details (address, phone, email, opening hours) and the location on a map with directions (mapa dojazdu). | ✓ VERIFIED | `/kontakt` live; `MapPanel.svelte` renders a committed same-origin OSM snapshot with mandatory attribution and a new-tab directions link. Ran `tests/kontakt.spec.ts` live: 26/26 pass (combined with rekrutacja-api), including "karty kontaktowe pokazują adres, telefon, e-mail i godziny...", "mapa to statyczny obraz z widoczną atrybucją OpenStreetMap...", and "link z trasą otwiera się w nowej karcie z pełnym rel...". |
| 5 | Staff can manage enrollment documents via the CMS, and those documents surface on /rekrutacja through the shared resolver. (AMENDED 2026-08-14: info/dates editing half descoped for v1, D-18.) | ✓ VERIFIED | `src/routes/rekrutacja/+page.server.ts` imports and calls `readDokumenty()` from the same `$lib/server/dokumenty` resolver used by `/dokumenty` and the homepage (no second resolver, `grep -c 'statSync\|node:fs'` returns 0 in the route). Playwright case fetches every rendered download href and asserts 200 under `/dokumenty/`. The descoping of the info/dates-editing half is documented in `04-CONTEXT.md` (D-18) and reflected correctly in REQUIREMENTS.md (RECRUIT-05 marked complete on the document-management half only). |

**Score:** 4/5 truths verified (1 failed — rate-limiter defect)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/lib/forms/types.ts` | FormResult/FormCode/STATUS_DLA_KODU contract | ✓ VERIFIED | Exists, exported, imported by both server code and islands. |
| `src/lib/server/forms/sanitize.ts` | Reject-never-repair sanitizers | ✓ VERIFIED | `bezpiecznyEmail`, `bezpiecznyTekst`, `bezpiecznyTelefon` present; unit-pinned (168/168 pass). |
| `src/lib/server/forms/validate.ts` | walidujKontakt + walidujZgloszenie | ✓ VERIFIED | Both validators present; child-name field structurally absent from `ZgloszenieDane`. |
| `src/lib/server/forms/turnstile.ts` | zweryfikujTurnstile | ✓ VERIFIED | Fails closed from catch; idempotency_key per attempt. |
| `src/lib/server/forms/ratelimit.ts` | podLimitem, two ceilings | ⚠️ VERIFIED BUT DEFECTIVE | Exists, wired, unit-tested — but the window mechanics are broken (see Gaps). Artifact is present and wired; the *behavior* it must provide (rate-limit abuse without locking out legitimate use) is not achieved. |
| `src/lib/server/forms/mailer.ts` | FROM/TO/BCC constants, wyslij | ✓ VERIFIED | Constants confirmed via grep; text-only payload confirmed (`grep -c 'html'` = 0). |
| `src/lib/server/forms/handle.ts` | obsluz() orchestrator | ✓ VERIFIED | Dependency-injected; reused unchanged by both endpoints. |
| `src/routes/api/kontakt/+server.ts`, `src/routes/api/rekrutacja/+server.ts` | Two dynamic POST routes | ✓ VERIFIED | Both exist, `prerender = false`, live-tested (20/20 endpoint tests pass). |
| `src/routes/kontakt/+page.svelte`, `src/routes/rekrutacja/+page.svelte` | Live pages | ✓ VERIFIED | Both prerendered, crawler-enforced, 43/43 page-level Playwright cases pass. |
| `src/lib/components/{FormField,ConsentBlock,TurnstileWidget,KontaktForm,ZgloszenieForm,KryteriaTable,FeeBox,MapPanel}.svelte` | UI kit + islands | ✓ VERIFIED | All exist, wired into the two routes, exercised by the live-run Playwright suites above. |
| `wrangler.jsonc` FORMS_KV binding | Real KV namespace, not placeholder | ✓ VERIFIED | `"id": "55f55448fe1345e28a79da5a3e9e9ca9"` confirmed in wrangler.jsonc with a comment recording it as the real, deployed namespace (Plan 07). |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `src/routes/api/kontakt/+server.ts` / `.../rekrutacja/+server.ts` | `src/lib/server/forms/handle.ts` (`obsluz`) | direct call, deps injected from `platform.env` | ✓ WIRED | Confirmed by reading both files and by the live endpoint test runs. |
| `src/lib/components/KontaktForm.svelte` / `ZgloszenieForm.svelte` | `POST /api/{kontakt,rekrutacja}` | `fetch` in submit handler | ✓ WIRED | Full submit-to-success path exercised live in both `tests/kontakt.spec.ts` and `tests/rekrutacja.spec.ts` (real Turnstile token awaited, real 200 received, DOM swapped to success panel, focus moved). |
| `src/routes/rekrutacja/+page.server.ts` | `src/lib/server/dokumenty.ts` (`readDokumenty`) | shared resolver import | ✓ WIRED | Confirmed by grep and by the live link-integrity Playwright case (every rendered href returns 200). |
| `src/lib/components/ConsentBlock.svelte` | `src/lib/content/forms.ts` (`KLAUZULA`) | import + `{#each}` render | ✓ WIRED | Confirmed by grep; klauzula disclosure content unit-pinned by `tests/forms-copy.unit.ts`. |
| `src/lib/server/forms/ratelimit.ts` (`podLimitem`) | Cloudflare KV (`FORMS_KV`) | `kv.get`/`kv.put` | ⚠️ WIRED BUT LOGICALLY BROKEN | The binding is real and the calls execute, but the TTL-refresh-on-write pattern means the "window" this link is supposed to implement never actually closes under sustained legitimate use. |

### Behavioral Spot-Checks / Live Test Runs

Rather than trusting SUMMARY.md's reported pass counts, the following suites were re-run live against the real Cloudflare runtime (`wrangler pages dev` via `preview:test`) during this verification:

| Suite | Command | Result | Status |
|---|---|---|---|
| Type/a11y check | `npm run check` | 0 errors, 0 warnings, 4215 files | ✓ PASS |
| Unit suite | `npm run test:unit` | 168/168 pass | ✓ PASS |
| Lint | `npm run lint` | prettier + eslint clean | ✓ PASS |
| Endpoint contract (kontakt) | `npx playwright test tests/kontakt-api.spec.ts` | 9/9 pass | ✓ PASS |
| Page + endpoint (kontakt, rekrutacja-api) | `npx playwright test tests/kontakt.spec.ts tests/rekrutacja-api.spec.ts` | 26/26 pass | ✓ PASS |
| Page (rekrutacja) | `npx playwright test tests/rekrutacja.spec.ts` | 17/17 pass | ✓ PASS |
| CR-01 defect re-check | Read `src/lib/server/forms/ratelimit.ts` lines 88-104 and `tests/forms.unit.ts` lines 405-421 directly | Bug present verbatim, test pins buggy behavior | ✗ CONFIRMED UNFIXED |

No suite failures were found — every claim in the SUMMARY.md files about test counts and green suites was independently reproduced. The one substantive discrepancy between "SUMMARY says complete" and "codebase reality" is the CR-01 rate-limiter defect: 04-REVIEW.md documented it accurately as Critical, but no SUMMARY, no STATE.md entry, and no follow-up plan records it as fixed, deferred-with-owner, or overridden. It is simply outstanding.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|---|---|---|---|---|
| RECRUIT-01 | 04-06 | Read enrollment info (harmonogram, kryteria, zasady) | ✓ SATISFIED | `/rekrutacja` live; kryteria table, procedura, status banner all rendered and tested. |
| RECRUIT-02 | 04-06 | Download PDF enrollment forms | ✓ SATISFIED | wnioski links resolve under `/dokumenty/`, live-tested returning 200. |
| RECRUIT-03 | 04-05, 04-06, 04-07 | Submit online enrollment application, emailed, no storage | ✓ SATISFIED | `POST /api/rekrutacja` live, `ZgloszenieForm` mounted, full submit-to-success path live-tested. |
| RECRUIT-04 | 04-03, 04-05, 04-07 | RODO consent + klauzula + Turnstile on enrollment form | ✓ SATISFIED (Turnstile/consent/klauzula only — see Truth 3 caveat on the shared rate-limit mechanism) | Live-tested; consent unticked by default, klauzula present, Turnstile verified server-side. |
| RECRUIT-05 | 04-06 | Manage enrollment docs via CMS + shared resolver (AMENDED: info/dates editing descoped) | ✓ SATISFIED (as amended) | Shared resolver wiring confirmed; amendment documented in 04-CONTEXT.md D-18 and correctly reflected in REQUIREMENTS.md. |
| CONTACT-01 | 04-02, 04-04 | Contact details visible | ✓ SATISFIED | Live-tested on `/kontakt` and the homepage. |
| CONTACT-02 | 04-02, 04-04 | Map + directions | ✓ SATISFIED | `MapPanel` live-tested, OSM attribution and directions link confirmed. |
| CONTACT-03 | 04-01, 04-03, 04-04 | Contact form emailed, RODO + Turnstile, no storage | ✓ SATISFIED | Live-tested end to end. |
| FORM-01 | 04-01, 04-07 | Delivery via Resend to Gmina mailbox, no DB | ✗ PENDING (correctly, per known external constraint) | The `to:` leg bounces because `zlobek@ugstromiec.pl` does not exist yet; deliberately left unmarked in REQUIREMENTS.md and tracked as a blocker in STATE.md. Not counted as a code gap per task instructions. |
| FORM-02 | 04-01, 04-05, 04-07 | Turnstile server-side, fixed recipient, rate-limit abuse | ⚠️ PARTIALLY SATISFIED | Turnstile and fixed-recipient halves fully satisfied and live-verified. The "rate-limits abuse" half is undermined by the unfixed CR-01 defect: the mechanism is present and unit-tested, but its window accounting is broken in a way that will eventually rate-limit *all* traffic, not just abuse. REQUIREMENTS.md marks this `[x]` Complete, which this verification disputes on the rate-limiting clause specifically. |

No orphaned requirements: every ID in the phase's declared requirement list (RECRUIT-01..05, CONTACT-01..03, FORM-01, FORM-02) is accounted for across the seven plans' `requirements` frontmatter fields, and REQUIREMENTS.md's Phase 4 mapping contains no additional IDs beyond these ten.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/lib/server/forms/ratelimit.ts` | 95-97 | Unfixed Critical from own code review (CR-01): TTL-refresh-on-write defeats the "fixed window" the comment claims | 🛑 Blocker | Recurring site-wide lockout of both forms under ordinary legitimate traffic; see Gaps. |
| `src/routes/api/kontakt/+server.ts:52`, `.../rekrutacja/+server.ts:62`, `ratelimit.ts:33-41` | — | WR-01 (04-REVIEW.md): missing `RATE_LIMIT_SALT` silently degrades to an unsalted, reversible IP hash, contradicting the klauzula's "salted hash" disclosure | ⚠️ Warning | Not currently exploitable (the salt secret is provisioned in production per 04-07), but the code has no guard if the secret is ever unset, and this was flagged as a Warning in the phase's own review with no follow-up fix. |
| `src/lib/components/TurnstileWidget.svelte:88-91` | — | WR-02 (04-REVIEW.md): cleanup never clears `window.__onTurnstileLoad`, so a stale closure can render into a detached container across fast client-side navigation | ⚠️ Warning | Confirmed still present verbatim; no fix commit exists. Does not block the phase goal but is an unremediated known defect. |
| `docs/dev-env.md:170-172`, `src/lib/server/forms/mailer.ts:17` | — | WR-03 (04-REVIEW.md): every send's primary `to:` leg is documented as bouncing 100% of the time | ℹ️ Info | This is the FORM-01 external constraint explicitly excluded from gap treatment per this verification's instructions; flagged here only for completeness since it is a real deliverability risk to the fresh sending domain. |

None of the Warning/Info items above independently change the overall status; they are listed because they are unremediated findings from the phase's own code review and should not be silently dropped from the record. The Blocker item (CR-01) is what drives `status: gaps_found`.

### Human Verification Required

1. **Live human form submission** — submit both `/kontakt` and `/rekrutacja` in a real browser at the production URL, confirm the Turnstile widget renders visibly and is keyboard-reachable (closes the still-unproven `frame-src` CSP directive), and confirm the message lands in the `devzlobekstromiec@gmail.com` BCC backup. Why human: a managed Turnstile widget refuses to issue a token to any automated browser (confirmed empirically during Plan 07), so this is irreducibly manual.
2. **Post-fix rate-limit re-check** — after CR-01 is fixed, confirm on the live site that the per-client and daily counters actually expire/reset rather than perpetually extending. Why human: the defect's effect only manifests over days of continued legitimate traffic; a quick manual spot-check today would look fine and hide the underlying accounting bug.

### Gaps Summary

The phase delivers a working, well-tested, security-conscious form pipeline: both routes are live, both endpoints are proven end-to-end against the real Cloudflare runtime (not mocked), consent/klauzula/Turnstile are all genuinely wired and verified, and the CMS document resolver sharing works exactly as claimed. Every SUMMARY.md test-count claim independently reproduced clean.

The one real gap is that the phase's own code review (`04-REVIEW.md`, produced the same day as the phase's completion) found a Critical defect in the rate limiter's window mechanics — and that defect was never fixed. The `ratelimit.ts` code, its misleading "fixed window that self-cleans" comment, and the unit test that pins the buggy behavior are all still exactly as the review found them; no commit, STATE.md entry, deferred-items.md entry, or override addresses it. Under ordinary continued legitimate use, this bug causes the site-wide daily counter to never truly reset, eventually 429-ing both forms for up to 24 hours at a time, cyclically — the opposite of what ROADMAP Success Criterion 3 ("the endpoint rate-limiting abuse") requires. Because a submission blocked by this bug is never stored anywhere (RODO no-storage design), a resulting lockout would be silent and unrecoverable from any log.

This is a straightforward, well-scoped fix (bucket the KV key by date/hour instead of refreshing the TTL) with the exact remediation already written out in `04-REVIEW.md`'s Critical Issues section. It should be closed before the phase ships to real traffic, independent of the already-tracked, correctly-excluded FORM-01 mailbox blocker.

---

_Verified: 2026-08-14T21:15:00Z_
_Verifier: Claude (gsd-verifier)_
