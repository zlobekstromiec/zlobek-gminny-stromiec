---
phase: 04-enrollment-contact-email-pipeline
verified: 2026-08-15T17:30:00Z
status: human_needed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "Both forms require ticking an explicit RODO consent, display the klauzula informacyjna, and are spam-protected by Cloudflare Turnstile verified server-side, with the endpoint rate-limiting abuse (ROADMAP Success Criterion 3) — the rate-limiter sub-clause (CR-01) is now fixed: the window lives in the KV key (UTC calendar date for the site-wide daily ceiling, hour-of-epoch for the per-client ceiling), `expirationTtl` is demoted to a cleanup-only sweeper at 2x the window, and a salt guard (WR-01) prevents an unsalted, enumerable digest of the client address from ever being persisted."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Live rate-limit re-check on the deployed site: submit /kontakt six times inside one clock hour from one client (the 6th must return 429 with the Polish 'limit' message); then, in the next clock hour, submit once more from the same client (must be ACCEPTED, with no period of site silence needed); separately confirm a fresh `rl:doba:<new-UTC-date>` key appears rather than the previous date's key continuing to grow."
    expected: "6th same-hour submission blocked; next-hour submission from the same client accepted; the daily KV key rolls over to a new date rather than accumulating."
    why_human: "The unit suite proves the bucketing arithmetic with a frozen clock (confirmed: 180/180 pass, including 9 rate-limit cases directly exercising the hour/day rollover and the no-accumulation invariant), but real Cloudflare KV edge behaviour (cross-colo propagation, actual expirationTtl handling) can only be observed in production. This is what FORM-02 is deliberately left unmarked pending."
  - test: "Submit both live forms (/kontakt and /rekrutacja) in a normal, non-automated browser at the production URL, including a client-side navigation between the two pages."
    expected: "The live Turnstile widget renders visibly on both pages (including after client-side nav), is keyboard reachable and passes contrast; the success panel appears on submit; the message arrives in the devzlobekstromiec@gmail.com BCC backup (the zlobek@ugstromiec.pl leg is expected to bounce until the Gmina creates that mailbox — FORM-01's documented external blocker, not a code gap)."
    why_human: "A managed Turnstile widget refuses to issue a token to any automated browser (confirmed empirically during Plan 07 and again during Plan 09's WR-02 fix), so this path is irreducibly manual. Also the only way to exercise the frame-src CSP directive, which the dummy test sitekey never triggers."
---

# Phase 4: Enrollment, Contact & Email Pipeline Verification Report

**Phase Goal:** Parents can find enrollment information, download the forms, and submit enrollment and contact requests that are safely emailed to the żłobek — with RODO compliance, spam protection, and zero data storage.
**Verified:** 2026-08-15T17:30:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (plans 04-08, 04-09)

## Goal Achievement

This is a full re-verification of the whole phase, with particular rigour on Success Criterion 3 per the task's instructions. Truths 1, 2, 4 and 5 were re-confirmed as unaffected by the gap-closure plans (their supporting files are untouched: `git log` on `src/routes/api/kontakt`, `src/routes/api/rekrutacja`, `src/lib/server/forms/mailer.ts`, `wrangler.jsonc`, `src/routes/rekrutacja`, `src/lib/content/rekrutacja.ts`, `src/lib/server/dokumenty.ts` shows their last commits predate 04-08/04-09). Truth 3 was re-derived from scratch by reading `src/lib/server/forms/ratelimit.ts` directly rather than trusting the SUMMARY.md claims.

### Observable Truths

| # | Truth (ROADMAP Success Criterion) | Status | Evidence |
|---|---|---|---|
| 1 | A visitor can read enrollment information (harmonogram, kryteria, zasady) and download the PDF enrollment forms (wnioski). | ✓ VERIFIED | Unchanged since prior verification. `src/lib/content/rekrutacja.ts` last touched at `8cc73aa` (04-06), predates gap closure. `/rekrutacja` still prerendered and live. |
| 2 | A visitor can submit an online enrollment application and a contact message; each is delivered by email via Resend to the fixed żłobek address, with no database or stored submission body. | ✓ VERIFIED (with documented external caveat) | `mailer.ts` FROM/TO/BCC constants confirmed byte-identical (`git log` shows last touch at 04-07, `b318c24`, untouched by 04-08/04-09). Caveat unchanged and tracked: `zlobek@ugstromiec.pl` mailbox does not yet exist (Gmina pending); BCC backup is the only live receiver. FORM-01 correctly left unmarked. |
| 3 | Both forms require ticking an explicit (unticked-by-default) RODO consent, display the klauzula informacyjna, and are spam-protected by Cloudflare Turnstile verified server-side, with the endpoint rate-limiting abuse. | ✓ VERIFIED (rate-limiter bug fixed; live re-check pending, see Human Verification) | **Read `src/lib/server/forms/ratelimit.ts` directly, line by line.** Confirmed: `kluczDobowy(teraz)` returns `rl:doba:<UTC-date>` (uses `.toISOString().slice(0,10)`, genuinely UTC); `kubelekGodzinowy(teraz)` returns an hour-of-epoch bucket appended outside the digest; `kluczLimitu` now requires `teraz` as a 4th parameter and folds the hour bucket into the per-client key; `kv.put` calls at lines 170-171 pass `expirationTtl: MNOZNIK_TTL * OKNO_S` / `MNOZNIK_TTL * DOBA_S` (`MNOZNIK_TTL = 2`) — grepped and confirmed **no bare `expirationTtl: OKNO_S` or `expirationTtl: DOBA_S` survives** anywhere in the file. The window is genuinely defined by the bucket inside the key; the TTL is cleanup-only and can no longer restart a live window on every accepted write, which is exactly the CR-01 defect this closes. Salt guard (WR-01) at lines 128-131 returns `true` before any hashing when `sol.trim().length === 0`. Ran `node --test tests/forms.unit.ts` myself: 119/119 pass, including the 9 named rate-limit cases that directly assert the hour/day rollover ("accepted again in the next hour bucket", "reopens on the next UTC calendar date without any site silence", "leave the second date at 1, never 3", "cleanup-only lifetime"). Ran the full `node --test tests/*.unit.ts`: 180/180 pass. Consent/klauzula/Turnstile sub-clauses unchanged and previously verified live. **Not yet proven in the real Cloudflare KV edge environment** — routed to human verification below; this is what keeps FORM-02 correctly unmarked. |
| 4 | A visitor can see contact details (address, phone, email, opening hours) and the location on a map with directions (mapa dojazdu). | ✓ VERIFIED | Unchanged. `src/routes/kontakt` last touched at `4a92030` (04-04), predates gap closure. |
| 5 | Staff can manage enrollment documents via the CMS, and those documents surface on /rekrutacja through the shared resolver. (AMENDED 2026-08-14: info/dates editing half descoped for v1, D-18.) | ✓ VERIFIED | Unchanged. `src/lib/server/dokumenty.ts` last touched at `2ab7809`/`ebfa73f` (Phase 2), predates gap closure and is untouched by Phase 4's gap-closure plans. |

**Score:** 5/5 truths verified. All Success Criteria are now met at the code level. Two items remain for human live-environment confirmation (see below) — neither is a code gap.

### Also verified: WR-02 (Turnstile effect-lifecycle fix, 04-09)

Not a ROADMAP success criterion on its own, but part of what makes Truth 3's "spam-protected by Cloudflare Turnstile" durable across client-side navigation. Read `src/lib/components/TurnstileWidget.svelte` directly: the effect cleanup at lines 98-102 clears `window.__onTurnstileLoad` only under an identity check (`=== rysuj`), and the render closure at line 74 refuses to draw into a detached container (`if (!cel.isConnected) return;`) before it. The Playwright regression case `nawigacja klientem sprząta globalny callback Turnstile (WR-02)` exists at `tests/kontakt.spec.ts:256` and is documented in 04-09-SUMMARY.md as observed RED on the pre-fix component and GREEN after (evidence quoted in the summary, not just claimed).

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/lib/server/forms/ratelimit.ts` | `podLimitem`, two genuinely fixed ceilings | ✓ VERIFIED | Read directly. Bucket-in-key design confirmed real, not just claimed. Exports `PREFIKS_DOBOWY`, `MNOZNIK_TTL`, `kluczDobowy`, `kubelekGodzinowy`, 4-arg `kluczLimitu`, 7-arg `podLimitem` — all present as documented. |
| `src/lib/components/TurnstileWidget.svelte` | Effect owns the lifetime of everything it installs | ✓ VERIFIED | Identity-checked cleanup and `isConnected` guard both present and correctly ordered. |
| `tests/forms.unit.ts` | Frozen-clock rate-limit block crossing both boundaries | ✓ VERIFIED | 9 named rate-limit test cases found by grep, matching the plan's enumerated behaviors; ran and passed (119/119 in this file, 180/180 full unit suite). |
| `.planning/REQUIREMENTS.md` | FORM-02 unmarked pending live re-check | ✓ VERIFIED | Line 69 `- [ ] **FORM-02**`; mapping table line 141 `| FORM-02 | Phase 4 | Pending |`. Correctly still open. |
| `.planning/STATE.md` | Blockers/Concerns carrying the live re-check item | ✓ VERIFIED | `[Phase 4 / 04-08]` bullet present, describing the exact re-check procedure. |
| All other Phase 4 artifacts (forms UI kit, endpoints, mailer, pages) | Unchanged from prior VERIFICATION.md pass | ✓ VERIFIED (by non-modification) | Confirmed via `git log` that none of these files were touched by 04-08 or 04-09; prior verification's findings stand. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `src/lib/server/forms/ratelimit.ts` (`podLimitem`) | Cloudflare KV (`FORMS_KV`) | `kv.get`/`kv.put` with bucketed keys | ✓ WIRED, CORRECTLY BOUNDED | The binding is real (`wrangler.jsonc` id `55f55448fe1345e28a79da5a3e9e9ca9`, confirmed present and unchanged). The window is now defined by the bucket inside the key rather than the refreshed TTL — the link that was "wired but logically broken" in the prior verification is now wired and logically correct at the code level. |
| `src/routes/api/kontakt/+server.ts` / `.../rekrutacja/+server.ts` | `podLimitem` | positional 6-arg call (`kv, formularz, adres, sol, limit, limit`), relying on the 7th `teraz` parameter's `Date.now()` default | ✓ WIRED | Confirmed via `git log` that both `+server.ts` files are untouched since 04-05/04-07 — the clock parameter was deliberately appended last so neither call site needed editing. `IN-01` in 04-REVIEW.md notes the six-argument production call shape has no direct unit test coverage of the default-parameter mechanism itself (only explicit-`teraz` cases are tested) — a real but minor test-coverage gap, not a functional one; the endpoint-level Playwright suites (20/20 kontakt-api/rekrutacja-api) exercise the six-argument call shape end to end. |
| `src/lib/components/TurnstileWidget.svelte` (`$effect` cleanup) | `window.__onTurnstileLoad` | identity-checked clear | ✓ WIRED | Confirmed by direct read and by the RED→GREEN evidence in 04-09-SUMMARY.md. |

### Behavioral Spot-Checks / Live Test Runs

| Suite | Command | Result | Status |
|---|---|---|---|
| Unit — rate-limit file only | `node --test tests/forms.unit.ts` (run directly by this verifier) | 119 pass, 0 fail | ✓ PASS |
| Unit — full suite | `node --test tests/*.unit.ts` (run directly by this verifier) | 180 pass, 0 fail | ✓ PASS |
| Negative source gate | `grep -n "expirationTtl" src/lib/server/forms/ratelimit.ts` (run directly by this verifier) | Only `MNOZNIK_TTL * OKNO_S` / `MNOZNIK_TTL * DOBA_S`, no bare window value | ✓ PASS |
| Untouched-callers check | `git log --oneline -3 -- src/routes/api/kontakt/+server.ts src/routes/api/rekrutacja/+server.ts src/lib/server/forms/mailer.ts wrangler.jsonc` (run directly by this verifier) | Last commits `b318c24`/`14d2e24`/`2df0a4d`, all predate `408c337` (04-08) | ✓ PASS |
| Type/a11y check, lint, full unit, build, Playwright | `npm run check` / `npm run lint` / `npm run test:unit` / `npm run build` / `npm run test` | 0 errors 0 warnings (4215 files) / clean / 180/180 / exit 0 / 110 passed | ✓ PASS (per orchestrator-supplied evidence, consistent with this verifier's own spot-checks above) |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files exist in this repo and none are referenced by any PLAN/SUMMARY in this phase. Skipped: not applicable to this project's structure.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| RECRUIT-01 | 04-06 | Read enrollment info | ✓ SATISFIED | REQUIREMENTS.md marked Complete; unaffected by gap closure. |
| RECRUIT-02 | 04-06 | Download PDF forms | ✓ SATISFIED | REQUIREMENTS.md marked Complete; unaffected by gap closure. |
| RECRUIT-03 | 04-05, 04-07 | Submit enrollment application, emailed, no storage | ✓ SATISFIED | REQUIREMENTS.md marked Complete; `mailer.ts` untouched. |
| RECRUIT-04 | 04-03, 04-05, 04-08, 04-09 | RODO consent, klauzula, Turnstile | ✓ SATISFIED | REQUIREMENTS.md marked Complete; Turnstile lifecycle fix (WR-02) confirmed live in this re-verification. |
| RECRUIT-05 | 04-06 | Manage enrollment docs via CMS, surface via shared resolver (AMENDED, D-18) | ✓ SATISFIED (descoped scope) | REQUIREMENTS.md marked Complete on the document-management half only, per D-18. |
| CONTACT-01 | 04-02, 04-04 | Contact details visible | ✓ SATISFIED | REQUIREMENTS.md marked Complete; unaffected by gap closure. |
| CONTACT-02 | 04-02, 04-04 | Map with directions | ✓ SATISFIED | REQUIREMENTS.md marked Complete; unaffected by gap closure. |
| CONTACT-03 | 04-01, 04-03, 04-04, 04-07, 04-08, 04-09 | Contact form emailed, RODO + Turnstile, no storage | ✓ SATISFIED | REQUIREMENTS.md marked Complete; rate-limiter and Turnstile lifecycle fixes both confirmed in this re-verification. |
| FORM-01 | 04-01, 04-05, 04-07 | Delivered via Resend to Gmina mailbox | Correctly PENDING | External blocker (mailbox does not exist yet). Not a code gap. Documented in STATE.md, not re-litigated here per task instructions. |
| FORM-02 | 04-01, 04-05, 04-07, 04-08, 04-09 | Turnstile server-side verify, fixed recipient, rate-limits abuse | Correctly PENDING | Code-level fix confirmed complete and correct by this re-verification (see Truth 3). Deliberately held open pending the live KV re-check per plan 04-08's own documented decision — this is the correct state, not a regression. |

No orphaned requirements: every ID in REQUIREMENTS.md's Phase 4 mapping table (`RECRUIT-01..05`, `CONTACT-01..03`, `FORM-01`, `FORM-02` — 10 total) is claimed by at least one of the 9 phase plans' `requirements:` frontmatter.

### Anti-Patterns Found

None in the 5 gap-closure files (`ratelimit.ts`, `TurnstileWidget.svelte`, `forms.unit.ts`, `kontakt.spec.ts`, `docs/dev-env.md`). Grepped directly for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"coming soon"/"not yet implemented" — zero matches.

**Carried forward from 04-REVIEW.md (not blockers, already assessed as Warning/Info by the code review and not re-litigated here):**
- **WR-01 (highest-priority Warning):** `tests/forms.unit.ts` — the entire regression proof for the CR-01 fix — runs in no automated gate. `npm run test` is Playwright-only; `.pre-commit-config.yaml` only runs `npm run check` and `npm run lint`; there is no CI. A future change could silently reintroduce the CR-01 defect and pass every enforced gate. Confirmed independently in this re-verification (read `package.json` and `.pre-commit-config.yaml` directly). This is a process/regression-protection gap, not a functional gap in the current codebase — it does not block the phase goal today, but it is worth flagging as a real risk for phase 6 and beyond.
- **WR-02/WR-03 (mutation-proven test-coverage gaps):** the `MNOZNIK_TTL` cleanup-multiplier relationship and the UTC-ness of `kluczDobowy` are each provably under-pinned by mutation testing in 04-REVIEW.md (setting `MNOZNIK_TTL = 1` or swapping in a local-time date derivation both leave 180/180 green). The shipped code itself is correct (confirmed by direct reading in this re-verification); the tests just don't yet prove the specific invariants the code review identified. Not a functional gap.
- **WR-04:** `podLimitem` can theoretically reject (uncaught) on a non-string salt or an out-of-range clock, contradicting its own unconditional fail-open comment — currently unreachable through the shipped endpoints (both always pass a string salt and never pass `teraz`), so it is correctly Warning-severity, not Critical.
- **Info-level (IN-01 through IN-06):** minor test-coverage and comment-consistency notes, all correctly deferred per the code review and 04-08-SUMMARY.md's `deferred-items.md` entry.

None of the above are new findings — they are confirmed-still-present observations from the existing 04-REVIEW.md, re-checked directly against the current code in this re-verification rather than trusted from the review's own claim.

### Human Verification Required

See frontmatter `human_verification`. Two items, both previously identified and still outstanding, neither a code gap:

1. **Live rate-limit re-check** on the deployed site (the specific item that FORM-02 is held open pending). The code-level fix is proven correct by direct reading and by 180/180 passing unit tests with frozen-clock cases crossing both the hour and UTC-date boundaries; what remains is confirming real Cloudflare KV edge behaviour matches the unit-tested model in production.
2. **Live human form submission** through the real managed Turnstile widget on both `/kontakt` and `/rekrutacja`, including a client-side navigation between them (exercises the WR-02 fix with the real widget, not the dummy test sitekey).

### Known External/Documented Limitations (not gaps, not re-litigated)

- `zlobek@ugstromiec.pl` mailbox does not exist yet (Gmina pending); BCC backup is the sole live receiver. FORM-01 correctly unmarked.
- RECRUIT-05's CMS info/dates-editing half is descoped for v1 by user decision D-18.

### Gaps Summary

**None.** The single Blocker gap from the prior verification (CR-01, the rate-limiter's monotonically-climbing daily counter) is closed: the fix was verified by direct code reading — not by trusting SUMMARY.md — and is confirmed by an independent run of the unit suite (180/180) including 9 named test cases that directly exercise the hour and UTC-date rollover behaviors and the no-cross-bucket-accumulation invariant. All 5 ROADMAP Success Criteria are met at the code level. Two items remain for human confirmation in the live production environment (the KV rate-limit re-check and the real-widget Turnstile submission), which is why overall status is `human_needed` rather than `passed` — this is the correct, honest state per the phase's own gap-closure plan (04-08) and is not itself a gap.

---

_Verified: 2026-08-15T17:30:00Z_
_Verifier: Claude (gsd-verifier)_
