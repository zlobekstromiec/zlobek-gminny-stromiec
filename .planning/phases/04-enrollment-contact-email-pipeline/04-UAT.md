---
status: complete
phase: 04-enrollment-contact-email-pipeline
source: [04-VERIFICATION.md]
started: 2026-08-15T17:35:00Z
updated: 2026-08-15T19:45:00Z
deploy:
  note: >-
    UAT was initially blocked: both tests target production, but at UAT start all 15
    gap-closure commits were local-only and origin/main was still at 7d5d7a2, so
    zlobekstromiec.pl was serving the UNFIXED code. Confirmed empirically in a real
    browser: after a client-side navigation away from /kontakt the old build left
    window.__onTurnstileLoad set to the destroyed component's closure (typeof
    "function"), which is the WR-02 defect itself, observed live.
  resolved: 2026-08-15T18:00:00Z
  pushed: 7d5d7a2..8f5d317
  verified_live: >-
    Polled production until the behaviour flipped. Probes 1-4 returned typeof
    "function" (old build); probe 5 returned typeof "undefined" (fixed build).
    Cloudflare Pages deploy of the gap-closure work is live.
---

## Current Test

[testing complete]

## Tests

### 1. Live rate-limit re-check on the deployed site

expected: The 6th same-hour submission from one client is blocked (429, Polish limit message); a submission from the same client in the next clock hour is accepted with no site silence required; the daily KV key rolls over to a new UTC date rather than accumulating.
why_human: The unit suite proves the bucketing arithmetic against a frozen clock (180/180 pass, including 9 cases exercising hour and day rollover plus the no-accumulation invariant), but real Cloudflare KV edge behaviour (cross-colo propagation, actual expirationTtl handling) can only be observed in production. FORM-02 is deliberately left unmarked in REQUIREMENTS.md pending this check.
result: skipped
reason: >-
  Tester elected on 2026-08-15 not to wait for the clock-hour boundary and asked to move on.
  Part A (refusal inside the bucket) genuinely PASSED in production. Parts B and C were not
  run. CONSEQUENCE, recorded deliberately: the CR-01 fix is proven at code level (180/180
  unit tests, 9 of them bucketing cases) and its defect shape is confirmed absent from
  ratelimit.ts, but the RESET behaviour has never been observed on real Cloudflare KV. Part A
  passing is NOT evidence of the fix: the pre-fix build refused inside the bucket too. FORM-02
  therefore stays unmarked in REQUIREMENTS.md and this remains open verification debt.
part_a_refusal_inside_bucket: pass
part_a_evidence: >-
  Tester submitted the live /kontakt form repeatedly from one device at approximately
  2026-08-15T19:35Z and was refused with the "Za duzo prob wysylki" panel: "Z tego
  urzadzenia wyslano juz kilka wiadomosci. Sprobuj ponownie za godzine albo zadzwon pod
  numer 510 094 051." Correct Polish limit copy, and the refusal offers a phone fallback
  rather than dead-ending the enquiry. NOTE: refusal inside the bucket is NOT the fix
  under test; the pre-fix build refused here too.
part_b_reset_next_bucket: pending
part_b_what_is_needed: >-
  One further submission from the SAME device at or after 2026-08-15T20:00Z (21:00 local,
  the top of the next UTC hour, since the per-client key is bucketed on hour-of-epoch),
  with no period of site silence in between. Acceptance proves CR-01 is genuinely fixed on
  real Cloudflare KV. Continued refusal means the fix did not survive production and the
  gap reopens.
part_c_daily_rollover: pending
part_c_what_is_needed: >-
  Separately, on a new UTC date, confirm a fresh rl:doba:<new-date> key is used rather than
  the previous date's counter continuing to climb. Lower priority than part B: the daily
  ceiling is 40 site-wide and shares the same bucketing mechanism part B validates.

### 2. Live Turnstile submission on both forms, including client-side navigation

expected: The live Turnstile widget renders visibly on /kontakt and /rekrutacja (including after a client-side navigation between the two), is keyboard reachable and passes contrast; the success panel appears on submit; the message arrives in the devzlobekstromiec@gmail.com BCC backup. The zlobek@ugstromiec.pl leg is expected to bounce until the Gmina creates that mailbox, which is FORM-01's documented external blocker and not a code gap.
why_human: A managed Turnstile widget refuses to issue a token to any automated browser (confirmed empirically in Plan 04-07 and again during Plan 04-09's WR-02 fix), so this path is irreducibly manual. It is also the only way to exercise the frame-src CSP directive, which the dummy test sitekey never triggers.
scope_narrowed_by_automation: >-
  Part of this test was verified automatically against the deployed site, so only the
  human-only remainder is being asked of the tester. See automated_evidence below.
result: pass
evidence: >-
  Verified in production across three independent channels. (1) Tester screenshot: the real
  managed Turnstile widget renders visibly on /kontakt in its completed "Powodzenie!" state,
  which also proves the frame-src CSP directive permits the challenge iframe (unproven since
  04-04, because the dummy sitekey renders no frame at all). (2) Automated live run: after a
  client-side navigation between the two form pages, typeof window.__onTurnstileLoad is
  "undefined" on the deployed build, versus "function" on the pre-deploy build, so the WR-02
  fix is confirmed live and the assertion genuinely discriminates. (3) Tester confirmed the
  accepted submissions arrived in the devzlobekstromiec@gmail.com BCC backup mailbox.
not_covered: >-
  Keyboard reachability and colour contrast OF THE WIDGET ITSELF were not manually checked
  (tester deprioritised). The axe scans on /kontakt and /rekrutacja pass, but axe cannot see
  inside a cross-origin iframe, so the widget's own focus ring and contrast remain unverified.
  Low risk: the widget is Cloudflare-rendered chrome, not project-authored markup.

## Automated Evidence

Driven against the deployed production site (https://zlobekstromiec.pl) after the
gap-closure deploy went live. 6 passed, 0 failed, 4 inconclusive.

Passed:

- `/kontakt` returns 200.
- Turnstile `api.js` loads and `turnstile.render()` genuinely executes, evidenced by the
  Turnstile-minted hidden input `cf-chl-widget-<id>_response` (that id format is created by
  the Turnstile script itself, not by the application).
- `input[name="cf-turnstile-response"]` present on `/kontakt`.
- Client-side navigation `/kontakt` to `/rekrutacja` works.
- **WR-02 fix confirmed live:** after client-side navigation, `typeof window.__onTurnstileLoad`
  is `"undefined"`. The pre-deploy build returned `"function"` on the same probe, so this
  assertion genuinely discriminates fixed from unfixed.
- No Turnstile duplicate-render or orphaned-widget console errors.

Inconclusive (environment limit, NOT evidence about the site): the four iframe-dependent
assertions could not run. The sharded challenge host `brunhild.challenges.cloudflare.com`
resolves IPv6-only and the sandboxed browser has no IPv6 route, so the request failed at DNS
(`ERR_NAME_NOT_RESOLVED`) before any iframe was attempted. Visible widget render, keyboard
reachability, contrast and the `frame-src` CSP directive therefore remain human checks.

### Resolved by tester screenshot (2026-08-15T19:35Z)

The tester's live browser closed most of the inconclusive set. Their /kontakt screenshot shows
the real managed Turnstile widget rendered visibly, Cloudflare-branded, in its completed
"Powodzenie!" state. That single observation establishes:

- The real widget RENDERS visibly on the deployed site (not just the dummy-sitekey seam).
- `frame-src` in the svelte.config.js CSP genuinely permits the challenge iframe. This
  directive had been unproven since 04-04, because the always-pass dummy sitekey renders no
  frame at all. It is now proven in a real browser.
- The widget successfully issued a token to a human, so the acceptance path is intact
  end to end up to submission.

### Delivery confirmed by tester (2026-08-15T19:39Z)

Tester confirmed that the submissions accepted before the limiter tripped DID arrive in the
devzlobekstromiec@gmail.com BCC backup mailbox. The full pipeline is therefore proven end to
end in production with a real Turnstile token: form submit, server-side siteverify, Resend
send from send.zlobekstromiec.pl, delivery to the BCC backup.

This does NOT mark FORM-01 complete. FORM-01 requires delivery to the Gmina mailbox
zlobek@ugstromiec.pl, which still does not exist, so the to: leg continues to hard-bounce and
the BCC remains the only receiving mailbox. That is an external Gmina dependency, not a code
gap, and re-testing once the mailbox exists is a single form submission with no deploy.

Still human-only after this: keyboard reachability and contrast of the Turnstile widget.

## Summary

total: 2
passed: 1
issues: 0
pending: 0
skipped: 1
blocked: 0

## Gaps
