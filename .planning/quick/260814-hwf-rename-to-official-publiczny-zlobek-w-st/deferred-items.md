# Deferred items — quick task 260814-hwf

Out-of-scope discoveries logged during execution. Not fixed here.

## 1. Pre-existing Playwright failure: `tests/aktualnosci.spec.ts:44`

`npm run test` reports `1 failed, 54 passed`. The failing assertion is
`tests/aktualnosci.spec.ts:55`, which expects the newest news card to link to
`/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`.

Cause: the UAT placeholder post `src/lib/content/aktualnosci/2026-08-14-test.json`
(added by commit `33672db`, "test(03): complete UAT") is dated 2026-08-14, so the
newest-first feed puts it first. The assertion has been failing since that commit
and is unrelated to this rename: the failure reproduces on any content state where
a post newer than 2026-08-01 exists.

Already tracked in `.planning/STATE.md` under Blockers/Concerns:
"Placeholder test post 2026-08-14-test.json is live on the site; delete it via
/admin (or replace with the real opening-day post) before handover."

Fix belongs with that cleanup: delete the test post, or make the assertion
content-agnostic.

## 2. `static/og-placeholder.png` still shows the old branding

The 1200x630 Open Graph card was generated in Plan 01-04 from the pre-rename
wordmark. It is a raster asset with no build-time dependency on the renamed
strings, so it now contradicts every `og:site_name`. Regenerate in Phase 6
alongside the custom-domain SEO work.

## 3. Renamed content seeds are CMS-editable

`src/lib/content/o-nas.json` (`lead`, `misja`) and
`src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json`
(`zajawka`, `tresc`) carry the official name but are editable by staff through
`/admin`. A future edit can silently reintroduce the old name. Accepted risk
(threat T-QHWF-04): making the seeds read-only would defeat CMS-01.
