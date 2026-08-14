---
status: complete
phase: 03-news-aktualno-ci
source: [03-VERIFICATION.md]
started: 2026-08-14T03:12:27Z
updated: 2026-08-14T03:39:50Z
---

## Current Test

[testing complete]

## Tests

### 1. Live CMS create-to-publish round trip for Aktualnosci
expected: Log into the deployed /admin, create a test Aktualnosci post via GitHub OAuth, confirm it appears on /aktualnosci and the homepage preview after rebuild, with the correct date-prefixed URL that opens the full post page.
result: pass
notes: |
  Blocker found and fixed mid-test: 48 local commits (entire Phase 03) had never
  been pushed, so the live site still served the Phase 02 build with no
  aktualnosci collection in /admin. Pushed main (verified build + 26/26 unit
  tests first); Pages deployed in ~2 min.
  Round trip then proven end-to-end: user created post via /admin -> commit
  7dd0e90 by devzlobekstromiec ("Create Wpis 2026-08-14-test") -> Pages rebuild
  -> post live on /aktualnosci (newest first), homepage news preview, and
  /aktualnosci/2026-08-14-test (HTTP 200). CR-01 confirmed live: day-14 date
  slugged verbatim from ISO storage.

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
