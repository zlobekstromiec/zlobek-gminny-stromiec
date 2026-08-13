---
phase: 03-news-aktualno-ci
plan: 03
subsystem: cms
tags: [sveltia-cms, folder-collection, slug, polish-copy, instrukcja, news, wcag-copy]

# Dependency graph
requires:
  - phase: 03-news-aktualno-ci
    provides: "src/lib/server/aktualnosci.ts PostEntry field contract (tytul, data, zajawka, tresc, obraz, obraz_alt, placeholder) and DD.MM.YYYY date storage the CMS collection must produce"
  - phase: 02-about-documents-cms
    provides: "dokumenty folder-collection skeleton + all-Polish strict-widget config.yml pattern + self-hosted @sveltia/cms 0.189.0 bundle + instrukcja-cms.md structure"
provides:
  - "static/admin/config.yml aktualnosci folder collection (create: true) — staff self-publish news without a developer (NEWS-03)"
  - "static/admin/config.yml top-level global slug block (encoding: ascii, clean_accents: true) — Polish title transliteration to ASCII URLs (D-06)"
  - "date-prefixed slug template {{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}} (date filter verified present in the pinned bundle)"
  - "docs/instrukcja-cms.md Polish Aktualności section (add/edit/publish/delete, publish-delay, stable-URL, English-chrome mapping)"
affects: [staff-publishing-loop, aktualnosci-list-route, homepage-newspreview]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Folder collection inherits the GLOBAL Vite-processed media path (NO per-collection override) so covers flow through enhanced-img (Pitfall 3 — inverse of dokumenty)"
    - "Publication-date-prefixed slug via Sveltia date transformation filter reading a field (honors backdating), with the build reader taking the slug from the committed filename"
    - "All-Polish CMS copy contract copied verbatim from UI-SPEC; JSON field keys stay 1:1 with the PostEntry interface"

key-files:
  created: []
  modified:
    - "static/admin/config.yml"
    - "docs/instrukcja-cms.md"

key-decisions:
  - "Used the PRIMARY slug template (date filter), not the A1 ISO-storage fallback: verified case`date` is present in the @sveltia/cms@0.189.0 transformation switch, so data keeps DD.MM.YYYY storage and the Plan 01 reader parseData needs no change"
  - "aktualnosci sets NO per-collection media override (inherits global src/lib/assets/uploads) so covers are enhanced-img-optimized — deliberately opposite to dokumenty's /static/dokumenty override (Pitfall 3 / T-03-05)"
  - "tresc markdown constrained to [bold, link, bulleted-list, numbered-list] (no headings/image/italic), matching the hardened renderPost from Plan 02 (T-03-06)"
  - "Numbered the new instrukcja section 5 (renumber 6-9) for a clean sequential 1-9 document, consistent with every existing header and the 'sequential numbering' acceptance criterion"

metrics:
  duration: 8min
  completed: 2026-08-13
  tasks: 2
  files_modified: 2

requirements-completed: [NEWS-03]

status: complete
---

# Phase 3 Plan 03: Sveltia Aktualności collection + staff instrukcja Summary

**An all-Polish Sveltia `aktualnosci` folder collection (Create enabled, constrained markdown, inherited enhanced-img cover pipeline, publication-date-prefixed ASCII slug) plus a Polish news-publishing section in the staff instrukcja — staff can now self-publish news without a developer (NEWS-03).**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-08-13
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- New `aktualnosci` folder collection in `static/admin/config.yml`: `create: true`, `folder: src/lib/content/aktualnosci`, `extension: json`, `identifier_field: tytul`; fields `tytul`, `data`, `zajawka`, `tresc`, `obraz`, `obraz_alt`, `placeholder` map 1:1 to the Plan 01 `PostEntry` interface so a staff-created post round-trips through `readAktualnosci()`.
- Every label/hint is Polish, copied verbatim from the UI-SPEC CMS Polish Copy Contract (CMS-03).
- `tresc` markdown widget constrained to `[bold, link, bulleted-list, numbered-list]` (no headings/image/italic), consistent with the hardened `renderPost` (Plan 02) and the type hierarchy (T-03-06).
- NO per-collection media override: covers inherit the global Vite-processed `src/lib/assets/uploads` so `enhanced-img` can optimize them (Pitfall 3 / T-03-05).
- Top-level global `slug` block (`encoding: ascii`, `clean_accents: true`) transliterates Polish titles to ASCII (the crossed-l becomes `l`, accents stripped) (D-06).
- Date-prefixed slug template `{{fields.data | date('YYYY-MM-DD')}}-{{fields.tytul}}` so the URL follows the publication date and honors backdating (D-05/D-06); the build reader still takes the slug from the committed filename (D-07/D-08).
- New Polish instrukcja section 5 documenting the news flow: save equals publish after ~2 min with no draft mode (D-04), a post goes live regardless of `Data publikacji` (D-03), a title edit keeps the old URL (D-07), and the English editor chrome mapping (Save→Zapisz, Publish→Opublikuj, Delete→Usuń). Subsequent sections renumbered 6-9; a test-news-post line added to the live checklist.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the aktualnosci collection + global slug block to config.yml** - `d998309` (feat)
2. **Task 2: Add the news-publishing section to the staff instrukcja** - `58f16c6` (docs)

## Files Created/Modified
- `static/admin/config.yml` - Appended the `aktualnosci` folder collection after `dokumenty` (last collection); added the top-level global `slug` block (`encoding: ascii`, `clean_accents: true`).
- `docs/instrukcja-cms.md` - Inserted section 5 "Aktualności: dodawanie i publikowanie wpisów"; renumbered sections 6-9; fixed the section-9 cross-reference to the translations table (sekcji 8); added a test-news-post step to the live checklist; added a PLACEHOLDER screenshot comment.

## Decisions Made
- **Date filter over ISO-storage fallback (Assumption A1 resolved):** the plan authorized either the primary `date` filter slug template or a documented fallback (store ISO via datetime `format: 'YYYY-MM-DD'` and adjust the reader). I grep-verified the pinned bundle's transformation switch (`static/admin/sveltia-cms.js`) and confirmed `case\`date\`` is present alongside `slugify`/`ternary`/`truncate`/`upper`/`lower`/`default`, plus the bundled `dayjs` customParseFormat/localizedFormat plugins. The primary template is therefore correct, `data` keeps `DD.MM.YYYY` storage (matching the seeds and A2), and the Plan 01 `parseData` reader needs no change. The fallback was not used.
- **Sequential 1-9 section numbering** in the instrukcja (see Deviations).

## Deviations from Plan

### Auto-fixed / reconciled Issues

**1. [Rule 1 - Plan-internal inconsistency] Instrukcja section header kept numbered `## 5.` despite an over-strict verify regex**
- **Found during:** Task 2 verification.
- **Issue:** The plan's `<automated>` check asserts `/##\s*Aktualno/` (header must be `## Aktualności` with no number), but the same task action explicitly says to "Number the new section 5" and renumber subsequent sections to 6/7/8/9, and every existing header in the file uses the `## N. Title` convention. A section number is not whitespace, so a numbered header cannot match that regex — the two instructions are mutually exclusive.
- **Fix:** Honored the stronger, more objective requirements — the explicit renumbering instruction and the acceptance criterion "Section numbering remains sequential" — producing a clean sequential 1-9 document consistent with every other header (`## 5. Aktualności: dodawanie i publikowanie wpisów`). Ran an equivalent verification (`/^##\s*(\d+\.\s*)?Aktualno/m` plus explicit content assertions for the publish-delay, no-draft, stable-URL, live-regardless-of-date, and chrome-mapping strings) which passes; the no-em-dash and publish-note assertions from the plan's own command also pass unchanged. Only the header-number portion of the literal regex would fail.
- **Files modified:** `docs/instrukcja-cms.md`
- **Commit:** `58f16c6`

**2. [Rule 1 - Plan verify token collision] Reworded a config.yml comment to avoid the literal `media_folder` token**
- **Found during:** Task 1 verification.
- **Issue:** The plan's `<automated>` check does `if(/media_folder/.test(block)) throw` on the aktualnosci block to prove there is no override. My explanatory comment mentioned the token `media_folder`, tripping the check even though the collection sets no override.
- **Fix:** Reworded the comment to describe the inherited-uploads behavior without the literal token (the same class of cosmetic adjustment the Plan 01 executor made for its `Intl` grep). The collection genuinely sets no media override. Verify now passes.
- **Files modified:** `static/admin/config.yml`
- **Commit:** `d998309`

## Issues Encountered
None beyond the two reconciliations above.

## Threat Surface
Both threat-register mitigations for this plan are satisfied and unchanged:
- **T-03-05 (DoS via cover uploads):** the collection inherits the global `media_libraries` config (max_file_size 5 MB + on-upload webp transform capped at 1600px) — no per-collection override weakens it.
- **T-03-06 (Tampering via body):** the `tresc` markdown widget offers only bold/link/bulleted-list/numbered-list; the hardened `renderPost` (Plan 02) is the render-time enforcing layer.
- **T-03-SC:** no package installs this phase; the Sveltia bundle stays the pinned self-hosted `@sveltia/cms@0.189.0`. No legitimacy checkpoint required.

No new security surface introduced.

## Known Stubs
None. The collection maps 1:1 to the live reader/routes shipped in Plans 01/02; the D-01/D-02 seed posts already exercise the read path. The `placeholder` boolean is an intentional editorial "content to be confirmed" flag reused verbatim from `dokumenty`, not a code stub.

## User Setup Required
End-of-phase human verification (deferred by `human_verify_mode: end-of-phase`): on the deployed `*.pages.dev` CMS, log into `/admin`, create a test Aktualności post, save, wait ~2 min for the Cloudflare rebuild, and confirm it appears on `/aktualnosci` (and, if among the three newest, on the homepage). This live GitHub-OAuth login→create→commit→rebuild→live loop is the NEWS-03 acceptance proof and cannot be Playwright-driven.

## Next Phase Readiness
- Staff can now self-publish news (NEWS-03). The collection feeds the Plan 01 `/aktualnosci` list and Plan 02 `/aktualnosci/[slug]` routes already live.
- Plan 04 (homepage NewsPreview re-source to `readLatest(3)`) is the remaining plan in this phase; it consumes the same collection this plan exposes to staff.

## Self-Check: PASSED

Both modified files verified on disk (`static/admin/config.yml`, `docs/instrukcja-cms.md`); both task commits verified in git history (`d998309`, `58f16c6`). Plan Task 1 automated verify passes as-written; Task 2 verified via an equivalent check (documented deviation) plus the plan command's no-em-dash and publish-note assertions.

---
*Phase: 03-news-aktualno-ci*
*Completed: 2026-08-13*
