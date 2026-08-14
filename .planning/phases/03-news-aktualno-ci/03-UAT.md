---
status: testing
phase: 03-news-aktualno-ci
source: [03-VERIFICATION.md]
started: 2026-08-14T03:12:27Z
updated: 2026-08-14T03:12:27Z
---

## Current Test

number: 1
name: Live CMS create-to-publish round trip for Aktualnosci
expected: |
  Log into the deployed /admin panel via GitHub OAuth, create a test Aktualnosci
  post (title, date, body), and save. After the Cloudflare Pages rebuild (~2 min),
  the post appears on /aktualnosci (newest first) and in the homepage preview,
  with a correct date-prefixed URL (YYYY-MM-DD-slug) that opens the full post.
awaiting: user response

## Tests

### 1. Live CMS create-to-publish round trip for Aktualnosci
expected: Log into the deployed /admin, create a test Aktualnosci post via GitHub OAuth, confirm it appears on /aktualnosci and the homepage preview after rebuild, with the correct date-prefixed URL that opens the full post page.
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
