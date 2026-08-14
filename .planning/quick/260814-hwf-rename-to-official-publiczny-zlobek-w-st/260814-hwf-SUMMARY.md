---
phase: quick-260814-hwf
plan: 01
subsystem: brand-identity
status: complete
tags: [branding, naming, assets, favicon, seo, cms, docs, a11y]
requires:
  - src/lib/components/Seo.svelte (single siteName drives every page title suffix)
  - src/lib/components/Header.svelte and Footer.svelte (already import the two brand PNGs)
  - new-logo.png (client-delivered corrected artwork, consumed then removed)
provides:
  - "official institution name Publiczny Żłobek w Stromcu on every shipped surface"
  - src/lib/assets/brand/logo-full.png (corrected lockup)
  - src/lib/assets/brand/logo-mark.png (corrected emblem)
  - static/favicon.png and static/apple-touch-icon.png
affects:
  - static/site.webmanifest
  - static/admin/index.html
  - static/admin/config.yml
  - docs/instrukcja-cms.md
  - docs/dev-env.md
  - .claude/CLAUDE.md
tech-stack:
  added: []
  patterns:
    - "overlap-aware emblem cut: keep only rows above the wordmark inside the columns where a sun ray and the first glyphs share x-range"
    - "computed alpha bounding box instead of sharp .trim() on this family of delivered artwork"
key-files:
  created: []
  modified:
    - src/lib/assets/brand/logo-full.png
    - src/lib/assets/brand/logo-mark.png
    - static/favicon.png
    - static/apple-touch-icon.png
    - src/lib/components/Header.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/Seo.svelte
    - src/routes/+page.svelte
    - src/routes/+error.svelte
    - src/routes/aktualnosci/+page.svelte
    - src/routes/o-nas/+page.svelte
    - src/routes/dokumenty/+page.svelte
    - src/routes/polityka-prywatnosci/+page.svelte
    - src/routes/deklaracja-dostepnosci/+page.svelte
    - static/site.webmanifest
    - src/lib/content/o-nas.json
    - src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json
    - static/admin/index.html
    - static/admin/config.yml
    - docs/instrukcja-cms.md
    - docs/dev-env.md
    - .claude/CLAUDE.md
    - tests/home.spec.ts
  deleted:
    - new-logo.png
decisions:
  - "Emblem and wordmark OVERLAP horizontally on this artwork, so a single column cut cannot both keep the rays intact and exclude the wordmark: the mark is cut at x<=771 and, inside the 760-771 overlap strip, only rows above y=479 are kept. A plain cut at the last wordmark-free column (759) would have clipped the tip of the lowest sun ray."
  - "Header tagline changed from a name restatement (Publiczny żłobek w gminie Stromiec) to the organisational line Jednostka organizacyjna Gminy Stromiec, so the wordmark and the tagline no longer say the same thing."
  - "site.webmanifest description drops its em dash for a comma, per the repo copy rules."
  - "config.yml app_title (Panel redakcyjny Żłobka w Stromcu) left unchanged as planned: it already uses a locality-only form and is not the institution name."
metrics:
  duration_min: 8
  tasks: 3
  files_changed: 23
  completed: 2026-08-14
requirements: [SITE-03, SITE-04, SITE-06]
---

# Quick Task 260814-hwf: Rename to the official Publiczny Żłobek w Stromcu Summary

The site now names the institution by its official name everywhere a visitor, a search engine, a home-screen icon or a staff editor can see it, and the header emblem plus footer lockup are cut from the corrected artwork whose printed wordmark says the same thing.

## What Was Built

**Task 1 (`50df705`) — corrected brand assets and favicons.**
A throwaway sharp script in the session scratchpad (never in the repo, never staged) consumed `new-logo.png` (1672x941 RGBA) and produced four files:

| File | Size | Notes |
|---|---|---|
| `src/lib/assets/brand/logo-full.png` | 1596x788 | whole lockup, ratio 2.025 |
| `src/lib/assets/brand/logo-mark.png` | 734x788 | emblem alone, ratio 0.931 |
| `static/favicon.png` | 512x512 | transparent, emblem centered |
| `static/apple-touch-icon.png` | 180x180 | opaque white plate, emblem at 80 percent |

Both brand PNGs were opened with the Read tool and inspected before anything downstream ran: `logo-mark.png` shows the full sun arc, house, both children, the heart, the cradling hand and all four rays with rounded tips intact, and carries no wordmark fragment; `logo-full.png` shows `Publiczny Żłobek w Stromcu` with no clipped glyph on any edge. `new-logo.png` was then removed from the repo root. No component edit was needed: `Header.svelte` and `Footer.svelte` already import these two paths.

**Task 2 (`6d060d6`) — components, SEO meta and the manifest.**
Eleven surfaces renamed, each at its cited location, each in the grammatical case the sentence requires: header wordmark plus a new organisational tagline, footer wordmark, org line and copyright, `Seo.svelte` `siteName` (which propagates to every page title suffix and `og:site_name`), the homepage title and description, the aktualnosci and dokumenty descriptions in the genitive, the o-nas description in the accusative, the 404 title suffix, both raw `svelte:head` stub titles, and the web manifest `name` and `description`. Markup structure, the two-line wordmark, `short_name` and the manifest's 2-space indentation are all untouched.

**Task 3 (`8f8cd8a`) — content seeds, admin chrome, docs and the one test assertion.**
`o-nas.json` `lead` opens accusative and `misja` opens locative, both with the rest of their sentence byte-identical; the welcome post's `zajawka` and `tresc` take the genitive while its title, slug and filename stay as they are. The admin panel `<title>` and the `config.yml` header comment carry the official name while `app_title` is untouched. `instrukcja-cms.md`, `dev-env.md` and `.claude/CLAUDE.md` headings follow, plus the CLAUDE.md prose mention. `tests/home.spec.ts:166` now asserts `/Publiczny Żłobek w Stromcu/`; `tests/aktualnosci.spec.ts:100` passed unedited, confirming the seed rename matched what the existing genitive assertion already expected.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The plan's emblem cut would have clipped a sun ray**
- **Found during:** Task 1
- **Issue:** The plan expected an empty alpha column gap before the first wordmark glyph at around x 790. A per-column alpha scan found **no fully empty column anywhere** between x 38 and x 1633: on this artwork the lowest sun ray runs to x 773 while the first wordmark parts (the dash of `w Stromcu` and the `Ż` stem) already start at x 760, and the `P` of `Publiczny` at x 772. Emblem and wordmark genuinely overlap in x. Cutting at the last wordmark-free column (759), as a naive scan would, silently truncates a ray tip; the first generated mark showed exactly that, with two rays running flat into the right edge.
- **Fix:** The generator cuts the mark at `x <= 771` and, inside the overlap strip `x >= 760`, keeps only rows `y <= 479` (the ray band) while dropping the wordmark rows below. The mark is then built from raw pixels rather than a plain `extract`, so the strip can be masked. Result: all four rays complete, zero wordmark pixels, ratio 0.931.
- **Files modified:** `src/lib/assets/brand/logo-mark.png` and the two favicons derived from it
- **Commit:** `50df705`

**2. [Rule 3 - Blocking] Scratchpad script could not resolve `sharp`, and `.trim()` is a no-op**
- **Found during:** Task 1
- **Issue:** Both carried over from `260814-6n1` and both reproduced exactly: Node resolves modules from the script's directory, so a scratchpad script never reaches the repo `node_modules`; and `sharp .trim()` returns the input unchanged because the source's nominally empty regions carry alpha noise of 1 to 4 and the corner pixels do not match the trim reference.
- **Fix:** The script `process.chdir()`s to the repo and imports sharp by absolute path at `node_modules/sharp/dist/index.mjs`; the bounding box is computed directly from raw pixel data with alpha at or below 8 treated as empty. Measured bbox: x 38-1633, y 85-872.
- **Files modified:** scratchpad only
- **Commit:** n/a (uncommitted throwaway script, per the plan)

### Out of Scope (logged, not fixed)

`npm run test` finishes **1 failed, 54 passed**. The failure is `tests/aktualnosci.spec.ts:55`, which expects the newest news card to link to the 2026-08-01 seed. It is caused by the UAT placeholder post `src/lib/content/aktualnosci/2026-08-14-test.json` (added by commit `33672db`, before this task) being dated later, so it sorts first. The failure is deterministic, pre-existing, unrelated to the rename, and already tracked in `STATE.md` as a Phase 3 UAT blocker ("delete 2026-08-14-test.json via /admin before handover"). Per the scope boundary it was logged to `deferred-items.md` rather than fixed. The rename-relevant assertion in the same file, `tests/aktualnosci.spec.ts:100`, passes unedited.

## Carry-Forward Notes (for STATE.md)

1. **`static/og-placeholder.png` still renders the old branding.** It is a raster asset with no build-time link to the renamed strings, so every `og:image` now contradicts its own `og:site_name`. Regenerate in Phase 6 with the custom-domain SEO work.
2. **The renamed strings in `src/lib/content/o-nas.json` and the aktualnosci seed are CMS-editable.** Staff editing through `/admin` can overwrite them and silently reintroduce the old name. Accepted (threat T-QHWF-04): locking the seeds would defeat CMS-01.

## Verification

| Gate | Result |
|---|---|
| Asset dimension gate | pass: full 1596x788 (ratio 2.025), mark 734x788 (ratio 0.931), favicon 512x512, apple-touch 180x180, `new-logo.png` gone |
| Visual Read of both brand PNGs | pass: complete emblem with all four rays and no wordmark fragment; full wordmark with no clipped glyph |
| `npm run check` | 4181 files, 0 errors, 0 warnings |
| `npm run lint` | prettier + eslint clean |
| `npm run test:unit` | 26/26 pass |
| `npm run build` | exit 0 |
| `npm run test` | 54 passed, 1 pre-existing failure (see Out of Scope) |
| 11-surface rename grep | 11/11 |
| Header tagline grep | pass |
| Negative grep across `src/ static/ tests/ docs/ .claude/` | zero hits for `Żłobek Gminny`, `Żłobka Gminnego`, `żłobkiem gminnym`, `żłobku gminnym` |
| Manifest | parses as JSON, 2-space indent preserved |
| Seeds | both parse, tab indentation preserved |
| Identifiers | post filename, `config.yml` `app_title`, package name `zlobek-gminny-stromiec` all unchanged; `package.json` and `package-lock.json` byte-unchanged |
| Prerendered homepage | `<title>` and `og:site_name` carry the official name; 11 occurrences in the page |
| Root working files | `logo.png` and both design zips still untracked and unmodified |

Threat register: T-QHWF-01 mitigated (every shipped asset is a sharp decode plus re-encode, crops visually inspected, source removed). T-QHWF-02 mitigated (all three commits staged by explicit path, never `git add -A`). T-QHWF-03 mitigated (no `sed`, no editor-wide replace; every edit made at its listed file, and the identifier gate asserts the slug filename, `app_title` and package name). T-QHWF-04 accepted and carried forward. T-QHWF-SC honoured: nothing installed, lockfile untouched.

## Known Stubs

None introduced. The footer program-logo chips (`Herb gminy`, `Aktywny Maluch`) and the PLACEHOLDER contact/hours data remain pre-existing Phase 6 scope.

## Threat Flags

None. No network endpoint, auth path, file-access pattern or schema at a trust boundary was introduced: this task ships static images, markup strings and docs only.

## Self-Check: PASSED

All four regenerated assets present on disk; `new-logo.png` confirmed absent; all three commits (`50df705`, `6d060d6`, `8f8cd8a`) present in `git log`.
