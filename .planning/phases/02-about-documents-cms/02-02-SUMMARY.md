---
phase: 02-about-documents-cms
plan: 02
subsystem: dokumenty
tags: [docs, prerender, wcag, dokumenty, build-resolver]
requires:
  - '/o-nas foundations (Plan 02-01): @lucide/svelte installed, prerender inheritance via +layout.ts'
provides:
  - '/dokumenty prerendered route (DOCS-01)'
  - 'src/lib/server/dokumenty.ts shared build resolver (glob + statSync meta + grouping), reusable by the homepage docs panel (Plan 03)'
affects:
  - 'svelte.config.js KNOWN_FUTURE_ROUTES (/dokumenty removed, crawler now enforces it)'
tech-stack:
  added: []
  patterns:
    - 'build-time folder-collection read via import.meta.glob (eager, import: default)'
    - 'node:fs statSync at prerender for document type/size meta (D-14, never stored)'
    - 'dormant-category rule: filter by category, omit empty groups (D-13)'
    - 'WCAG doc-row: meta INSIDE the link so it is announced with the name'
key-files:
  created:
    - tests/dokumenty.spec.ts
    - src/lib/content/dokumenty/rekrutacja-wniosek.json
    - src/lib/content/dokumenty/rekrutacja-regulamin.json
    - src/lib/content/dokumenty/statut-zlobka.json
    - static/dokumenty/wniosek-o-przyjecie-dziecka.doc
    - static/dokumenty/regulamin-rekrutacji.pdf
    - static/dokumenty/statut-zlobka.pdf
    - src/lib/server/dokumenty.ts
    - src/routes/dokumenty/+page.server.ts
    - src/routes/dokumenty/+page.svelte
  modified:
    - svelte.config.js
decisions:
  - 'Shipped the 3 documents named in the plan frontmatter files_modified (2 rekrutacja + 1 statut); the fuller UI-SPEC seed list is "if practical" and deferred to avoid fabricating extra placeholder binaries.'
  - 'Statut entry carries a zrodlo_bip link to exercise the optional BIP-provenance rendering path; it opens in a new tab with the inherited visually-hidden suffix.'
  - 'grupy read via $derived(data.grupy) to satisfy Svelte 5 state-referenced-locally check (page is static, but the prop pattern requires it).'
metrics:
  duration_min: 6
  tasks: 3
  files: 10
  completed: 2026-08-13
status: complete
---

# Phase 2 Plan 02: Dokumenty Summary

Shipped the visitor-facing `/dokumenty` page as a complete vertical slice: a parent opens `/dokumenty`, sees documents grouped under `Rekrutacja` and `Statut i uchwały` (RODO stays dormant), reads each document's `TYP · rozmiar · wersja z DD.MM.RRRR` inside the download link, and downloads every file with no 404 at zero WCAG 2.1 AA violations. Document type and size are computed at build via a shared `node:fs` statSync resolver (never stored by staff), and the JSON folder collection is read with `import.meta.glob`.

## What was built

- **tests/dokumenty.spec.ts (RED then GREEN)** — DOCS-01 acceptance: 200, single `h1` "Dokumenty", `Rekrutacja` + `Statut i uchwały` headings, dormant-RODO count 0, meta-inside-link accessible-name assertion, an href-resolves-200 loop over every `a.doc-row`, and the axe WCAG 2.1 AA block.
- **Seed folder collection** — 3 placeholder-flagged JSON entries (`{ nazwa, kategoria, plik, wersja, zrodlo_bip?, placeholder }`): `Wniosek o przyjęcie dziecka` (rekrutacja, DOC), `Regulamin rekrutacji` (rekrutacja, PDF), `Statut żłobka (uchwała XXIII.133.2026)` (statut, PDF, with BIP source).
- **Hosted files** under `static/dokumenty/` — two spec-valid single-page PDFs (correct xref offsets, recognised by `file` as PDF 1.4) and one placeholder `.doc`, served verbatim so links resolve 200 and statSync returns real byte sizes (D-17 source formats kept).
- **src/lib/server/dokumenty.ts** — server-only shared resolver: `readDokumenty()` globs the collection and augments each entry with computed `typ`/`rozmiar`/`meta`; `groupDokumenty()` groups in the fixed order `rekrutacja → statut → rodo`, omitting empty groups (D-13). Kept free of Svelte/UI concerns for reuse by the homepage in Plan 03.
- **src/routes/dokumenty/+page.server.ts** — build-time load calling the resolver, returning `{ grupy }`.
- **src/routes/dokumenty/+page.svelte** — prerendered zero-JS page: `Seo` (Polish, noindex), single `h1` + lead, one `<section aria-labelledby>` per non-empty category with the reused `.doc-row` meta-inside-link markup, a leading Lucide `FileText` icon (`aria-hidden`), an optional `Źródło: BIP` new-tab provenance link, and a whole-page empty-state safety net. Tokens-only styling, band alternation, 72rem container.
- **svelte.config.js** — removed `/dokumenty` from `KNOWN_FUTURE_ROUTES` so the prerender crawler enforces the route.

## Verification

- `npm run check` — 0 errors, 0 warnings (after switching `grupy` to `$derived`).
- `npx playwright test tests/dokumenty.spec.ts` — 7 passed (GREEN).
- `npm run lint` — Prettier + ESLint clean.
- `npm run test` (full suite) — 43 passed, no regressions on `/`, `/o-nas`, nav, responsive, stubs.

## Deviations from Plan

None - plan executed exactly as written. The three-document seed matches the plan's `files_modified` list; the larger UI-SPEC seed inventory was explicitly optional ("if practical") and is left for a later content pass so no document names/binaries are fabricated beyond the confirmed BIP core.

## Known Stubs

Intentional and plan-authorized (D-16/D-17); every entry carries `placeholder: true` and the binaries are marked for the Phase 6 swap.

| Item | File | Reason |
|------|------|--------|
| Placeholder PDF/DOC binaries | static/dokumenty/*.{pdf,doc} | Real BIP binaries not available to the executor; minimal valid files hold the correct extension + a real byte size so links resolve 200 and TYPE/size compute. Phase 6 swaps the originals. |
| `placeholder: true` on every entry | src/lib/content/dokumenty/*.json | D-09 launch-gate flag pending client confirmation of the document set; renders as final text (no visible badge). |
| Statut `wersja` date (29.01.2026) | statut-zlobka.json | Placeholder date pending confirmation of the uchwała XXIII.133.2026 publication date. |

These do not block the DOCS-01 goal (browse + download works today); they are content-confirmation items tracked for Phase 6.

## Self-Check: PASSED
