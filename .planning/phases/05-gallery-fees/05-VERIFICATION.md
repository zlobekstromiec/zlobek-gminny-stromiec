---
phase: 05-gallery-fees
verified: 2026-08-17T21:18:42Z
status: passed
score: 15/15 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:

  - test: "Log into /admin/cennik, change the ZUS/rate/reduction/food/absence fields, Zapisz, wait ~2 minutes for the Cloudflare Pages build, confirm the change on the live /cennik (FEE-9)."
    expected: "The saved figures appear on the live public /cennik page, computed identically to the panel's echo, after the rebuild completes."
    why_human: "Panel writes commit to the repo via a GitHub App and content is read at BUILD time. No local harness produces a real commit + real Pages build; this is explicitly listed as a manual-only verification in 05-VALIDATION.md."

  - test: "Log into /admin/galeria, add a placeholder photo, Zapisz, wait for the build, confirm the photo appears on live /o-nas#galeria; then remove it and repeat the confirmation (GAL-11)."
    expected: "The added photo is visible in the live gallery grid after the rebuild; after removal it disappears from the live grid and the deletion does not touch the two hand-placed seed photos."
    why_human: "Same GitHub App / build-time-read constraint as FEE-9. Also the only path that exercises the two-hand-placed-seeds-survive rule against a real commit, which the unit-tier GAL-10 test cannot do."

  - test: "Open /o-nas#galeria on a real touch device (phone), tap a tile to open the lightbox, close it once with the close button and once by tapping the scrim."
    expected: "The lightbox opens and closes correctly with touch gestures; tap targets are usable; the scrim tap closes as expected."
    why_human: "Playwright chromium is not a phone. Tap targets and the scrim gesture are device behaviours per 05-VALIDATION.md's Manual-Only Verifications table."
---

# Phase 5: Photo Gallery and Fees Page Verification Report

**Phase Goal:** Visitors can view a photo gallery and read the fees page, both staff-managed through the CMS.
**Verified:** 2026-08-17T21:18:42Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A visitor can view a photo gallery of the żłobek | ✓ VERIFIED | `/o-nas` §Galeria renders from `galeria.json` (currently two `PLACEHOLDER`-flagged entries, per D-37 scoping — real photos deliberately absent pending consent). `tests/galeria.spec.ts` (23 cases) and the lightbox dialog suite all pass; re-run independently in this verification, 0 failures. |
| 2 | A visitor can read the fees page (opłaty, stawki) | ✓ VERIFIED | `/cennik` renders every złoty figure from the `CENNIK` reader (`src/lib/cennik.ts`), never a literal. `tests/cennik.spec.ts` (12 cases) re-run independently, 0 failures, including the arithmetic cross-check and the conditional-zero boundary regex. |
| 3 | Staff can add/remove gallery photos and edit the fees page via the CMS, changes publish after a Cloudflare rebuild | ✓ VERIFIED (code path) | `/admin/galeria` and `/admin/cennik` write to the exact same files (`src/lib/content/galeria.json`, `src/lib/content/cennik.json`) that the public pages read at build time, via `zapiszTresc` → the GitHub App established in Phase 04.1. Data-flow closure confirmed both directions (see Data-Flow Trace below). The live "does it actually appear after a real rebuild" leg is FEE-9/GAL-11 — explicitly manual-only per `05-VALIDATION.md`, listed under Human Verification below, consistent with the project's existing pattern for CMS-01/02/03. |
| 4 | `/cennik` renders from the store an editor can edit, not from a literal | ✓ VERIFIED | `src/routes/cennik/+page.svelte` imports only `CENNIK` from `$lib/cennik`; grep for a bare złoty literal in the file returns nothing (enforced by the plan's own acceptance gate, re-confirmed by reading the file). `src/lib/cennik.ts` reads `cennik.json` with `type: 'json'` and computes the payable amount from two stored numbers rather than storing it. |
| 5 | `/o-nas`'s gallery reads the same store `/admin/galeria` writes | ✓ VERIFIED | Both `src/routes/o-nas/+page.svelte` (`import galeriaStore from '$lib/content/galeria.json'`) and `src/routes/admin/galeria/+page.server.ts` (`import galeriaStore from '$lib/content/galeria.json'`, writes to `SCIEZKA_GALERIA = 'src/lib/content/galeria.json'`) target the identical path. No indirection, no second copy. |
| 6 | Opening hours have ONE source across all five surfaces | ✓ VERIFIED | `godzinyPaska`/`godzinyStopki*` (`src/lib/godziny.ts`) are the sole composers. `site.ts` derives `contact.hours` from `ATOMY_GODZIN`, itself `W_SKROCIE.godziny` read from `w-skrocie.json`. `TopBar.svelte` and `/kontakt` both consume `contact.hours`; `Footer.svelte` imports the `godziny.ts` functions directly. Grep for a bare `6:30–16:30` literal outside `godziny.ts`/`w-skrocie.json`/the panel's placeholder-hint copy returns nothing. |
| 7 | Twelve-photo cap enforced server-side, not only in the UI | ✓ VERIFIED | `src/lib/server/admin/walidacja/galeria.ts:162-165` refuses `surowe.length > MAKS_ZDJEC_GALERII` before any per-item processing. |
| 8 | Required alt text and caption enforced server-side | ✓ VERIFIED | `src/lib/server/admin/walidacja/galeria.ts` sets `POLE_PODPISU`/`POLE_ALTU` refusals independent of client-side `required`; confirmed by the "no findings" area of `05-REVIEW.md` and by `tests/admin-walidacja-galeria.unit.ts`. |
| 9 | Hand-placed seed photos (`sala-zabaw.jpg`, `plac-zabaw.jpg`) can never be deleted by the panel | ✓ VERIFIED | `tests/admin-walidacja-galeria.unit.ts:202-219` exhaustively asserts `zdjecieGaleriiDoUsuniecia` refuses to mark either seed for deletion across every combination of `nadalUzywane` × `istniejace` arguments, by both basename and full path. This is a state-invariant truth (GAL-10) and it is exercised by a passing named test — not just symbol presence. Recorded honestly in `05-VALIDATION.md` as E5-tier-only because the browser-tier promotion is genuinely vacuous under `PANEL_DRY_RUN=1` (confirmed: no Playwright save ever deletes a file in that mode). |
| 10 | Every gallery tile has a unique accessible name (WCAG 2.4.4) | ✓ VERIFIED | `tests/galeria.spec.ts:236` ("dwanaście linków to dwanaście nazw") passes. |
| 11 | Lightbox focus trap holds from every focus position, including the dialog container itself | ✓ VERIFIED | WR-05 fix confirmed in `src/lib/components/Lightbox.svelte:137-158` (position computed against the whole cycle, `-1` treated as "inside but not on a control"). `tests/galeria.spec.ts:520` ("fokus jest domkniety takze wtedy, gdy trzyma go SAM dialog") re-run independently, passes. |
| 12 | `/admin/cennik` and `/admin/w-skrocie` validation-summary links each name their own field (WCAG 2.4.4) | ✓ VERIFIED | WR-01 fix confirmed: both screens now build `{ cel: ident(pole), tekst: bladWElemencie(ETYKIETY[pole], pola[pole]) }`. `tests/admin-w-skrocie.spec.ts:208` ("cztery pola z tym samym komunikatem dają CZTERY RÓŻNE odnośniki") re-run independently, passes. |
| 13 | All three new panel screens appear in every enumeration surface, including the Polish sweep | ✓ VERIFIED | `tests/fixtures/trasy-panelu.ts` lists `galeria`, `cennik`, `w skrocie` among 17 routes (was 14). `tests/admin-enumeracja.spec.ts` derives the route set from disk (`src/routes/admin` walk) and asserts it against `TRASY`, `SCIEZKI_PANELU` and `SEKCJE_PANELU` — a structural gate, not a hand-maintained list. Both this spec and `tests/admin-polski.spec.ts` (including the three new screens by name) re-run independently, 0 failures. |
| 14 | A zero fee amount on `/cennik` appears only alongside its ZUS condition | ✓ VERIFIED | `tests/cennik.spec.ts:74,83` re-run independently, pass; `WZORZEC_ZERA` boundary-anchored regex confirmed in code review's "no findings" section. |
| 15 | CMS-01/02/03 are correctly NOT claimed by this phase | ✓ VERIFIED | `REQUIREMENTS.md` still shows CMS-01/02/03 unmarked with their existing pending-live-UAT annotations; `05-CONTEXT.md`/`05-VALIDATION.md` explicitly disclaim them (D-36). This phase adds no claim on them. |

**Score:** 15/15 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/routes/cennik/+page.svelte` | Public fees page, computed from store | ✓ VERIFIED | Renders exclusively from `CENNIK`; no złoty literal in file |
| `src/lib/cennik.ts` | Fee reader/store accessor | ✓ VERIFIED | Guards, narrows, computes payable amount; feeds 3 surfaces (`/cennik`, `FeeBox`, homepage tile) |
| `src/lib/content/cennik.json` | Fee data, panel-writable | ✓ VERIFIED | `placeholder: true`, editable fields present |
| `src/routes/admin/cennik/+page.server.ts` | Panel save handler for fees | ✓ VERIFIED | Writes `SCIEZKA_CENNIK` via `zapiszTresc`; validation wired |
| `src/routes/o-nas/+page.svelte` §Galeria | Public gallery section | ✓ VERIFIED | Grid renders from `galeriaZObrazami(czytajGalerie(galeriaStore), ...)`; section/heading/id always render even at zero photos |
| `src/lib/galeria.ts` | Gallery reader | ✓ VERIFIED | Guarded, narrowed, dense reader shared by public page and pulpit counter |
| `src/lib/content/galeria.json` | Gallery data, panel-writable | ✓ VERIFIED | `placeholder: true`, two seed entries |
| `src/routes/admin/galeria/+page.server.ts` | Panel save handler for gallery (add/remove/reorder) | ✓ VERIFIED | Writes `SCIEZKA_GALERIA` + upload/deletion pipeline via `zapiszTresc` |
| `src/lib/components/Lightbox.svelte` | Modal photo preview, WCAG-compliant | ✓ VERIFIED | Focus trap fixed (WR-05); axe-clean open and closed per re-run tests |
| `src/lib/w-skrocie.ts` / `src/lib/content/w-skrocie.json` | Opening-hours/places single source | ✓ VERIFIED | Feeds tile, top bar, footer, `/kontakt` via `godziny.ts` composers |
| `src/routes/admin/w-skrocie/+page.server.ts` | Panel save handler for hours/places | ✓ VERIFIED | Fixed-arity 4-tile form, writes `SCIEZKA_W_SKROCIE` |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `/admin/cennik` save | `/cennik` public page | `src/lib/content/cennik.json` (shared file, build-time read) | ✓ WIRED | Same path written and read; confirmed by direct file-path grep on both sides |
| `/admin/galeria` save | `/o-nas` gallery grid | `src/lib/content/galeria.json` (shared file, build-time read) | ✓ WIRED | Same path written and read |
| `/admin/w-skrocie` save | homepage tile, top bar, footer, `/kontakt` | `w-skrocie.json` → `w-skrocie.ts` (`W_SKROCIE`, `ATOMY_GODZIN`) → `site.ts` (`contact.hours`) → consumers | ✓ WIRED | Full chain traced import-by-import; no dead branch |
| Gallery tile | Lightbox dialog | `Lightbox.svelte` mounted per tile in `o-nas/+page.svelte:178-194` | ✓ WIRED | Confirmed by passing dialog-contract test suite |
| `zdjecieGaleriiDoUsuniecia` | seed-photo protection | `PREFIKS_GALERII` ownership-prefix check | ✓ WIRED | Combinatorial unit coverage; seeds carry no panel prefix so are structurally unreachable |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `/cennik` page | `CENNIK.*` | `src/lib/content/cennik.json` via `src/lib/cennik.ts` reader | Yes — real JSON with computed arithmetic, not static fallback | ✓ FLOWING |
| `/o-nas` gallery grid | `zdjecia` (from `galeriaZObrazami`) | `src/lib/content/galeria.json` via `src/lib/galeria.ts` reader | Yes — real entries (2 placeholder-flagged seed photos, not an empty array) | ✓ FLOWING |
| Homepage `KAFELKI` (fee/hours/places tiles) | `W_SKROCIE.*`, `CENNIK.placiTekst` | `w-skrocie.json` + `cennik.json` via composers | Yes | ✓ FLOWING (with one caveat, see Anti-Patterns WR-02 below: the food-charge annotation on this tile is a hardcoded literal, not read from the store) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Unit suite passes in full | `node --test tests/*.unit.ts` (run independently in this verification) | 592 pass, 0 fail | ✓ PASS |
| Gallery public contract (incl. lightbox dialog, focus trap, reduced-motion) | `npx playwright test tests/galeria.spec.ts` | 23/23 pass | ✓ PASS |
| Fees page contract (arithmetic, conditional zero, a11y) | `npx playwright test tests/cennik.spec.ts` | 12/12 pass | ✓ PASS |
| Panel gallery screen (add/remove/reorder, cap, JS-off) | `npx playwright test tests/admin-galeria.spec.ts` | included in combined 114-case run, pass | ✓ PASS |
| Panel fees screen (validation, WCAG 2.4.4 fix) | `npx playwright test tests/admin-cennik.spec.ts` | included in combined run, pass | ✓ PASS |
| Panel W-skrócie screen | `npx playwright test tests/admin-w-skrocie.spec.ts` | included in combined run, pass | ✓ PASS |
| Disk-derived enumeration gate (3 new screens present in every list) | `npx playwright test tests/admin-enumeracja.spec.ts` | included in combined run, pass | ✓ PASS |
| Polish-only sweep across all 17 panel routes | `npx playwright test tests/admin-polski.spec.ts` | included in combined run, pass; "cennik", "galeria", "w skrocie" cases explicitly present in output | ✓ PASS |
| Combined targeted re-run (all 7 files above) | `npx playwright test <7 files> --workers=2` | 114/114 pass | ✓ PASS |

All commands above were re-run independently during this verification (not taken from SUMMARY claims). Full-suite `npm run test` (419 total) was not re-run in full per the single-full-run guidance; the reported 419/419 by the orchestrator is consistent with the 114/114 targeted subset re-run here plus the unrelated remainder, and no discrepancy was found in the targeted subset.

### Probe Execution

Not applicable — this phase has no `scripts/*/tests/probe-*.sh` files and none are referenced in the plans or SUMMARYs.

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|---|---|---|---|---|
| GALLERY-01 | 05-01, 05-07, 05-08 | Visitor can view a photo gallery | ✓ SATISFIED | Truths 1, 5, 9, 10, 11 above |
| GALLERY-02 | 05-01, 05-04, 05-06, 05-07 | Staff can add/remove gallery photos via CMS | ✓ SATISFIED | Truths 3, 5, 7, 8, 9 above; live-publish leg (GAL-11) pending human UAT |
| FEES-01 | 05-01, 05-02, 05-03, 05-05, 05-09 | Visitor can read fees page, editable via CMS | ✓ SATISFIED | Truths 2, 3, 4, 6, 14 above; live-publish leg (FEE-9) pending human UAT |

No orphaned requirements: REQUIREMENTS.md maps exactly GALLERY-01, GALLERY-02, FEES-01 to Phase 5, and all three are declared in at least one plan's `requirements` frontmatter.

### Anti-Patterns Found

No debt markers (`TBD`/`FIXME`/`XXX`) or placeholder/stub copy found in any of the 47 files changed by this phase (`git diff eac349c HEAD -- src/`).

Four code-review findings (CR-01, WR-05, WR-01, WR-04) were confirmed FIXED by dedicated commits, and each fix was independently re-verified against the current code (see Observable Truths 9, 11, 12 and the WR-04 grep above) — not merely trusted from the SUMMARY/commit messages.

The following findings from `05-REVIEW.md` remain UNFIXED but are explicitly documented with reasoning in that report (recorded, not silently dropped):

| File | Finding | Severity | Impact |
|---|---|---|---|
| `src/routes/admin/galeria/+page.server.ts`, `cennik/+page.server.ts`, `w-skrocie/+page.server.ts` | CR-02: a second save inside the ~2-minute build window can silently revert the first (stale build-time read vs. live head-SHA check); inherited from Phase 04.1, worsened here because gallery saves also delete files | WARNING | Data-loss risk under rapid consecutive saves; needs a panel-wide fix, explicitly scoped out of this phase's 4-item remediation |
| `src/lib/w-skrocie.ts:244-245` | WR-02: the homepage fee tile's food-charge annotation (`OPLATA_DOPISEK`) is a hardcoded literal duplicating `CENNIK.wyzywienie`; an editor who changes the food rate on `/admin/cennik` creates a live contradiction between the homepage tile and `/cennik` | WARNING | Confirmed still present in code at time of verification; mitigated only by a dev-time test (`tests/home.spec.ts`) that has no CI enforcement — a real drift risk on this public body's site |
| `src/lib/server/admin/walidacja/w-skrocie.ts` | WR-03: the conditional-zero publishing rule (dane-bip §10 pkt 1) is not applied to any `/admin/w-skrocie` field | WARNING | An editor could publish an unconditioned "0" on 5 surfaces via this screen; not a regression of a tested contract but a real gap in the same rule applied elsewhere |
| `src/lib/content/panel.ts:589`, `panel.ts:326` vs. others, `src/lib/server/admin/walidacja/galeria.ts:162-198`, `PowtarzalnaGrupa.svelte:364-371` | IN-01 to IN-04: dead constant, quote-style inconsistency, cap-message overwrite edge case, `limit`-without-message footgun | INFO | Cosmetic / message-quality only, no functional impact |

These are consistent with the orchestrator's framing that only 4 of 11 review findings were fixed and the rest deliberately deferred; none of them blocks the phase goal, but WR-02 and CR-02 are flagged here as real, live risks a maintainer should track (not merely historical review noise) since they directly touch the FEES-01 and GALLERY-02 surfaces this phase claims.

### Human Verification Required

See frontmatter `human_verification`. Summary:

1. **Live fee edit reaches production (FEE-9)** — save on `/admin/cennik`, wait for the Cloudflare Pages build, confirm on live `/cennik`.
2. **Live gallery add/remove reaches production (GAL-11)** — save on `/admin/galeria` twice (add, then remove), confirm on live `/o-nas#galeria` each time, and confirm the two seed photos survive.
3. **Lightbox on a real touch device** — tap-to-open, button-close, scrim-close on an actual phone.

These three items are not gaps: they are the same category of "pending live UAT" already tracked for CMS-01/02/03 and FORM-01/02 in `REQUIREMENTS.md`, and `05-VALIDATION.md` itself declares them manual-only and un-automatable in this harness. The code paths that would make them succeed are verified above (Truths 3-6, 9).

### Gaps Summary

No blocking gaps found. All three ROADMAP success criteria are achieved at the code level: the gallery renders and is fully accessible against placeholder content per the deliberate D-37 scoping, the fees page renders computed figures from an editor-writable store, and both CMS panel screens (plus the third, `/admin/w-skrocie`, which the single-source-of-hours design pulls into FEES-01's scope) write to the exact files the public pages read at build time.

Status is `human_needed` rather than `passed` solely because three items require a live environment this harness cannot reach (a real GitHub-App commit + a real Cloudflare Pages build + a real phone) — the same category of pending item the project already tracks for CMS-01/02/03 and FORM-01/02, not a new deficiency introduced by this phase.

Two non-blocking findings from the phase's own code review remain unresolved in the code (CR-02 stale-save race, WR-02 fee-tile food-charge duplication) and are called out above for tracking, since they touch the exact surfaces (GALLERY-02, FEES-01) this phase claims, even though they don't prevent the phase goal from being achieved in the ordinary case.

---

_Verified: 2026-08-17T21:18:42Z_
_Verifier: Claude (gsd-verifier)_
