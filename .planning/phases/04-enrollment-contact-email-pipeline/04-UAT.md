---
status: testing
phase: 04-enrollment-contact-email-pipeline
source: [04-VERIFICATION.md]
started: 2026-08-15T17:35:00Z
updated: 2026-08-15T17:35:00Z
---

## Current Test

number: 1
name: Live rate-limit re-check on the deployed site
expected: |
  The 6th /kontakt submission inside one clock hour, from one client, is blocked with the
  Polish limit message (429). In the NEXT clock hour a submission from that same client is
  ACCEPTED, with no period of site silence needed in between. Separately, the site-wide daily
  counter rolls over: a fresh `rl:doba:<new-UTC-date>` key appears on a new UTC date rather
  than the previous date's key continuing to grow.
awaiting: user response

## Tests

### 1. Live rate-limit re-check on the deployed site

expected: The 6th same-hour submission from one client is blocked (429, Polish limit message); a submission from the same client in the next clock hour is accepted with no site silence required; the daily KV key rolls over to a new UTC date rather than accumulating.
why_human: The unit suite proves the bucketing arithmetic against a frozen clock (180/180 pass, including 9 cases exercising hour and day rollover plus the no-accumulation invariant), but real Cloudflare KV edge behaviour (cross-colo propagation, actual expirationTtl handling) can only be observed in production. FORM-02 is deliberately left unmarked in REQUIREMENTS.md pending this check.
result: [pending]

### 2. Live Turnstile submission on both forms, including client-side navigation

expected: The live Turnstile widget renders visibly on /kontakt and /rekrutacja (including after a client-side navigation between the two), is keyboard reachable and passes contrast; the success panel appears on submit; the message arrives in the devzlobekstromiec@gmail.com BCC backup. The zlobek@ugstromiec.pl leg is expected to bounce until the Gmina creates that mailbox, which is FORM-01's documented external blocker and not a code gap.
why_human: A managed Turnstile widget refuses to issue a token to any automated browser (confirmed empirically in Plan 04-07 and again during Plan 04-09's WR-02 fix), so this path is irreducibly manual. It is also the only way to exercise the frame-src CSP directive, which the dummy test sitekey never triggers.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
