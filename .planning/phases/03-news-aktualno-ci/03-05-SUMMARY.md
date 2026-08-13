---
phase: 03-news-aktualno-ci
plan: 05
subsystem: news-cms
tags: [cms, sveltia, slug, aktualnosci, gap-closure, CR-01]
status: complete
requires:
  - "03-03 aktualnosci CMS collection (config.yml slug + data field)"
  - "03-01 readAktualnosci reader (parseData)"
provides:
  - "CMS-authored aktualnosci posts get a correct date-prefixed slug for every day of the month"
  - "ISO YYYY-MM-DD as the single agreed storage format for aktualnosci `data`"
affects:
  - "static/admin/config.yml (aktualnosci slug + data widget)"
  - "src/lib/server/aktualnosci.ts (parseData)"
  - "aktualnosci seed JSON files"
tech-stack:
  added: []
  patterns:
    - "Sveltia datetime widget: explicit `format` = on-disk save format, `date_format` = editor display"
    - "Slug via direct field substitution (no fragile transformation filter) once the field is stored ISO"
key-files:
  created: []
  modified:
    - static/admin/config.yml
    - src/lib/server/aktualnosci.ts
    - src/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka.json
    - src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json
decisions:
  - "Store aktualnosci `data` as ISO (YYYY-MM-DD) via Sveltia `format` key while keeping the Polish DD.MM.RRRR picker display, so the slug substitutes the date verbatim (CR-01 root-cause fix)."
  - "Keep dokumenty `wersja` on DD.MM.YYYY storage (never used in a slug — no need to change)."
metrics:
  duration: 4min
  completed: 2026-08-13
---

# Phase 3 Plan 5: CR-01 ISO Slug Storage Summary

Closed CR-01 (Phase 3's sole Blocker): aktualnosci `data` now stores ISO `YYYY-MM-DD` so the Sveltia slug template substitutes it verbatim, minting a correct, permanent publication-date-prefixed URL for every day of the month — replacing the broken `date('YYYY-MM-DD')` transformation that mis-parsed the `DD.MM.YYYY` storage (wrong MM/DD prefix for days 1-12, dateless for days 13-31).

## What Was Built

**Task 1 — CMS side (`static/admin/config.yml`, commit 594bf3d):**
- Added `format: 'YYYY-MM-DD'` to the aktualnosci `data` datetime widget as the on-disk storage format; kept `date_format: 'DD.MM.YYYY'` (Polish picker display) and `time_format: false`. In `@sveltia/cms@0.189.0` an explicit `format` is the save format while `date_format` stays the editor display, so staff still pick dates in `DD.MM.RRRR` while the file stores ISO.
- Changed the aktualnosci `slug:` to plain `'{{fields.data}}-{{fields.tytul}}'` (single-quoted, no transformation pipe). Direct substitution of the now-ISO `data` yields the correct `RRRR-MM-DD-tytul` prefix; the global `slug: { encoding: ascii, clean_accents: true }` block still transliterates the Polish title.
- Rewrote the developer comment above the slug to describe ISO storage and the CR-01 root cause (no longer asserts the transformation filter is "verified present").
- Left `dokumenty` `wersja` (still DD.MM.YYYY, no `format:`) and the global `slug:` block untouched.

**Task 2 — reader + content side (`src/lib/server/aktualnosci.ts` + 2 seeds, commit 62136bd):**
- `parseData` regex switched from `^(\d{2})\.(\d{2})\.(\d{4})$` to `^(\d{4})-(\d{2})-(\d{2})$`, destructuring `[, yyyy, mm, dd]`. Output contract (`iso`, Polish-genitive `display`), the month-range guard, `MIESIACE`, slug-from-filename logic, sort, and `readLatest` are all unchanged.
- Updated `PostEntry.data` field comment and the file doc-comment to state ISO `YYYY-MM-DD` storage.
- Migrated the two seed `data` values: `01.08.2026` → `2026-08-01`, `15.07.2026` → `2026-07-15`. Files were NOT renamed — the filename already is the authoritative slug; only the in-file `data` value migrated.

These three edits shipped together (Task 2) because the config change alters the save format for new posts while the reader and existing seeds still held `DD.MM.YYYY`; splitting them would have made both seeds fail the parse and silently vanish.

## Verification

- `grep -F "slug: '{{fields.data}}-{{fields.tytul}}'" static/admin/config.yml` — matches (plain substitution, transformation pipe gone).
- `grep -F "format: 'YYYY-MM-DD'" static/admin/config.yml` — matches on the aktualnosci `data` field.
- Both seeds hold ISO `data` (`2026-08-01`, `2026-07-15`); reader regex is ISO and the old `DD.MM.YYYY` `\.`-separated regex is gone.
- `npm run check` — passed (4180 files, 0 errors, 0 warnings).
- `npm run test -- tests/aktualnosci.spec.ts tests/home.spec.ts` — 27 passed, including `<time datetime="2026-08-01">`, newest-first order (Wielkie otwarcie before Witamy), newest card href `/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka`, and the homepage newest-posts assertions. No rendering/date/order regression.
- Pre-commit hooks (svelte-check + prettier + eslint) passed on both task commits.

## Deviations from Plan

None - plan executed exactly as written.

## Threat Mitigations Applied

- **T-03-05-01 (URL-integrity tampering):** Root cause fixed — ISO storage + direct substitution produces a correct prefix for every day of the month.
- **T-03-05-02 (silent data loss):** Both seeds gated on the passing `tests/aktualnosci.spec.ts` + `tests/home.spec.ts` round-trip before commit — neither seed silently vanished.
- **T-03-05-03 (Sveltia `format` behavior):** Confirmed effective — the reader's ISO regex accepts the migrated values and the seed round-trip tests pass green.

## Follow-ups / Deferred

- Live-CMS human verification (deferred phase-wide check) is now reachable and sharper: a verifier creating a post can confirm the resulting URL's date prefix equals the entered Data publikacji for any day of the month.
- WR-01/WR-03/WR-05/WR-06/WR-07 and IN-01..IN-04 remain deferred per the plan's `<deferred_findings>` (batched hardening / instrukcja-cleanup passes); none is a failed verification truth. CR-01 is closed here; WR-02/WR-04 are handled by plan 03-06.

## Self-Check: PASSED

- static/admin/config.yml — modified, both grep checks pass (FOUND)
- src/lib/server/aktualnosci.ts — ISO regex present, old regex gone (FOUND)
- Both seed JSONs — ISO data values (FOUND)
- Commit 594bf3d (Task 1) — FOUND
- Commit 62136bd (Task 2) — FOUND
