---
phase: 05-gallery-fees
plan: 01
subsystem: planning-contracts
tags: [ui-spec, amendment, supersession, design-bank, traceability]
status: complete
requires:
  - .planning/phases/05-gallery-fees/05-UI-SPEC.md (the contract this amendment points at)
  - .planning/phases/05-gallery-fees/05-CONTEXT.md (D-02, D-12 to D-20, D-32, D-33, D-36, D-37)
  - .planning/phases/05-gallery-fees/05-RESEARCH.md (C-3, the amendment idiom)
provides:
  - "01-UI-SPEC.md §Amendment v1.7 (2026-08-17): Galeria i Cennik, five numbered sections"
  - "01-UI-SPEC.md STRUCK v1.7: markers in place at :457 and :471"
  - "02-UI-SPEC.md §Superseded by 05-UI-SPEC (Amendment v1.7, 2026-08-17), per-line table"
  - "DESIGN-BANK.md STRUCK (05 D-02): markers at :31 and :32"
  - "05-UI-SPEC.md recorded checker sign-off (status: approved, six ticked boxes)"
affects:
  - every downstream Phase 5 plan that reads a locked contract before editing code
tech-stack:
  added: []
  patterns:
    - "Physical in-file amendment, not a pointer living only in another document (05-RESEARCH C-3)"
    - "Line-scoped strike marker: the superseded fragment stays visible, prefixed by a greppable literal"
    - "Edits that must not move a cited line number are folded onto the existing line rather than appended as new paragraphs"
key-files:
  created:
    - .planning/phases/05-gallery-fees/05-01-SUMMARY.md
  modified:
    - .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md
    - .planning/phases/02-about-documents-cms/02-UI-SPEC.md
    - .planning/phases/05-gallery-fees/05-UI-SPEC.md
    - .planning/DESIGN-BANK.md
decisions:
  - "The DESIGN-BANK edits were folded onto their existing lines so the file stayed at 70 lines and the :31, :32 and :35-37 citations in four planning documents stay valid"
  - "No fee amount is restated inside Amendment v1.7, so 01-UI-SPEC.md stops being a source of fee copy rather than becoming a second one"
  - "GALLERY-01, GALLERY-02 and FEES-01 stay UNMARKED: this plan ships contracts, not the surfaces those requirements name"
metrics:
  duration: 18min
  tasks: 2
  files: 5
  completed: 2026-08-17
---

# Phase 5 Plan 01: Contract amendments and stale-figure strikes Summary

Amendment v1.7 now lives physically inside `01-UI-SPEC.md`, and the stale draft fee figures
that survived four phases at `:457` and `:471` are struck in place with a grep-checkable
marker instead of being silently contradicted from another file.

## What was built

**Task 1 (commit `dcf9b25`).** Appended `## Amendment v1.7 (2026-08-17): Galeria i Cennik`
to the end of `01-UI-SPEC.md`, following the in-file shape of Amendment v1.6: a blockquote
naming what stays in force, what is superseded and where the full component contracts live
(`.planning/phases/05-gallery-fees/05-UI-SPEC.md`), then five numbered sections:

1. Public navigation v3: six items, Cennik after Rekrutacja, Galeria not a nav destination,
   and the desktop nav breakpoint moving from 768px to 1024px with the chip geometry
   untouched.
2. Fee figures superseded and struck, pointing at the cennik store built in plan 05-02.
3. Footer „Na skróty" repoints, with `:462` explicitly NOT superseded because it enumerates
   by label rather than href.
4. KeyFacts v4: v1.6 §3 stays verbatim, only the source of the four strings changes and only
   two tiles become editor-writable.
5. Phase 5 marking and risk posture: CMS-01, CMS-02 and CMS-03 are not ticked here, the
   phase proceeds against a formally open 04.1 dependency by explicit user decision, and the
   two named deferrals are carried to the Phase 6 launch gate.

Then the two stale lines were edited **in place**. Both now read `STRUCK v1.7:` followed by
the original figures and a pointer to Amendment v1.7 §2 and `05-UI-SPEC.md` Contract 4. The
original strings stay visible on purpose: deleting them would leave a later reader unable to
tell a corrected figure from one that was never recorded.

The same commit records the checker sign-off inside `05-UI-SPEC.md`, which contradicted its
own approval record: frontmatter `status:` moved from `draft` to `approved`, all six Checker
Sign-Off boxes are ticked, and `**Approval:** pending` became a named approval
(gsd-ui-checker, 6/6 dimensions PASS, 2026-08-17).

**Task 2 (commit `af7705c`).** Two independent edits.

`02-UI-SPEC.md` gained `## Superseded by 05-UI-SPEC (Amendment v1.7, 2026-08-17)` at its
end: a blockquote explaining why a second physical pointer exists (a reader following the
`/o-nas` contract lands here, not in `01-UI-SPEC.md`), then a per-line table covering `:103`
(zero-JS claim, now one hydrated island, with the `+page.svelte:2-5` header comment rewritten
in the same commit as the island), `:107` (the gallery section becomes the visual anchor),
`:109-115` and `:212` (section 6 becomes the gallery section, 1 / 2 / 3 columns, the
three-column tier NEW rather than inherited), `:272` (`obiekt_zdjecia` leaves `o-nas.json`),
plus two rows recording what is NOT superseded: `:115` D-04 and `:120` D-09. A closing
paragraph states that D-04 stands, overrides the weaker rule in `DESIGN-BANK.md:37`, and that
loosening it is a Phase 6 amendment made in the open rather than an executor's call while
placing a photo.

`DESIGN-BANK.md` §Cennik: the three-card figure sentence and the dofinansowanie explainer
sentence are both prefixed with `STRUCK (05 D-02):`, originals readable after the marker. The
`do 400 zł miesięcznie` inside the ZUS explainer is inside the strike, which closes the
carve-out D-02 refuted. A sentence records that the live fee copy is defined by
`05-UI-SPEC.md` Contracts 3 and 4 and that the ZUS benefit's own złoty amount is deliberately
absent because no confirmed source replaces it, so `/cennik` says „w maksymalnej wysokości".
§Galeria is NOT struck and still lists the nine slots; it gained an inline note that its
consent rule is overridden by `02-UI-SPEC.md:115` D-04.

## Verification

| Gate | Command | Result |
|---|---|---|
| Amendment present exactly once | `grep -c '^## Amendment v1.7' 01-UI-SPEC.md` | `1` |
| Monthly fee struck, line-scoped | `grep -n '400 zł' 01-UI-SPEC.md \| grep -vc 'STRUCK v1.7:'` | `0` |
| Meal fee struck, line-scoped | `grep -n '14 zł' 01-UI-SPEC.md \| grep -vc 'STRUCK v1.7:'` | `0` |
| Approval no longer pending | `grep -c 'Approval:\*\* pending' 05-UI-SPEC.md` | `0` |
| Bank strike markers | `grep -c 'STRUCK (05 D-02):' DESIGN-BANK.md` | `2` |
| Supersession section present once | `grep -c '^## Superseded by 05-UI-SPEC' 02-UI-SPEC.md` | `1` |
| ZUS figure inside the strike | `grep -n '400 zł' DESIGN-BANK.md \| grep -vc 'STRUCK (05 D-02):'` | `0` |
| Breakpoint stated numerically | `grep -c '1024' 01-UI-SPEC.md` | `19` before, `23` after |
| All five numbered sections | `grep -n '^### [1-5]\. ' 01-UI-SPEC.md` | five new headings present |
| Decision IDs named | D-02, D-16, D-17, D-18, D-19, D-32, D-36, D-37 | all present, plus D-03, D-33 |
| Copy rules | em dash and emoji scan over every added line | zero hits in both tasks |
| Scope confined to `.planning/` | `git diff --stat <base> HEAD` | 4 files, all under `.planning/` |
| No dependency movement | `git diff <base> HEAD -- package.json package-lock.json` | empty |
| Format gate baseline | `npm run lint` | green |

`npm run check`, `npm run test:unit` and `npm run test` were not run: this plan changes no
source, test or configuration file, so none of them can observe it. The pre-commit hook ran
svelte-check and prettier plus eslint on both commits and passed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical correctness] DESIGN-BANK edits folded onto existing lines to
preserve cited line numbers**

- **Found during:** Task 2, after the first version of the edit.
- **Issue:** The plan asked for „one sentence after the block" in §Cennik and „one sentence"
  added to §Galeria. Written as new paragraphs, they pushed the file from 70 to 73 lines and
  moved the §Galeria consent rule from `:37` to `:39`. Four planning documents cite
  `DESIGN-BANK.md` by line number (`05-CONTEXT.md:174` cites `:31-32` and `:35-37`,
  `05-UI-SPEC.md:1362` cites `:31-37`, `05-RESEARCH.md:158` cites `:32`, and the
  `02-UI-SPEC.md` section written in this very plan cites `:37`). Breaking those citations
  would have reproduced, in a different form, exactly the traceability failure this plan
  exists to fix.
- **Fix:** Both added sentences were appended to the end of the line they annotate instead of
  becoming new paragraphs. The file is still 70 lines, `:31`, `:32` and `:35-37` still point
  at the same content, and the D-04 override note now sits on `:37` itself, which is the line
  every other document sends a reader to.
- **Files modified:** `.planning/DESIGN-BANK.md`
- **Commit:** `af7705c`

**2. [Rule 2 - Copy rule] The `:103` table row was paraphrased rather than quoted verbatim**

- **Found during:** Task 2, on the em dash scan.
- **Issue:** Quoting `02-UI-SPEC.md:103` verbatim („`/o-nas` page (ABOUT-01, ABOUT-02) —
  prerendered, zero-JS") would have carried that line's em dash into an added line, which the
  project copy rules and this task's own acceptance criteria forbid without exception.
- **Fix:** The cell names the claim („the `/o-nas` heading's „prerendered, zero-JS" claim")
  instead of reproducing the punctuation. Nothing about which line is superseded changes.
- **Files modified:** `.planning/phases/02-about-documents-cms/02-UI-SPEC.md`
- **Commit:** `af7705c`

No Rule 4 situations arose and no checkpoint was needed. No authentication gate was hit.

## Requirements

`GALLERY-01`, `GALLERY-02` and `FEES-01` appear in this plan's frontmatter but were
deliberately **left unmarked**. This plan ships contract amendments, not the gallery section,
the panel screens or `/cennik` that those requirements name. Marking them here would put a
false claim in the traceability table, following the Plan 01 precedent this project has used
since Phase 4. They close on the plans that build the surfaces.

Per 05 D-36, this plan also does not touch `CMS-01`, `CMS-02` or `CMS-03`; the Phase 04.1 UAT
closes those, and Amendment v1.7 §5 now says so in writing inside the locked contract.

## Known Stubs

None. This plan produces no code, so it can produce no stub.

## Threat Flags

None. No file outside `.planning/` was touched, no network endpoint, auth path, file access
pattern or schema changed, and no package was installed (T-05-05-SC holds: the `package.json`
and `package-lock.json` diff against the plan's base commit is empty).

The four mitigations the plan's threat register assigned to this plan are all in place:
T-05-01-01 (in-place strike with a line-scoped grep gate), T-05-01-02 (the ZUS explainer's own
figure is inside the strike), T-05-01-03 (the harder consent rule is stated in writing where
the weaker one lives) and T-05-01-04 (the recorded sign-off makes the LOCKED status checkable
rather than remembered).

## Commits

| Task | Commit | Files |
|---|---|---|
| 1 | `dcf9b25` | `01-UI-SPEC.md`, `05-UI-SPEC.md` |
| 2 | `af7705c` | `02-UI-SPEC.md`, `DESIGN-BANK.md` |

## Notes for the next plan

- `01-UI-SPEC.md` is now internally consistent about fees: it names no amount at all. Plan
  05-02 owns the cennik store, and Amendment v1.7 §2 points at it by name, so the store must
  actually land under that description.
- Amendment v1.7 §3 commits plans 05-03 and 05-07 to emptying `KNOWN_FUTURE_ROUTES`, and §1
  commits the nav work to the 1024px breakpoint with the chip geometry untouched. Both are now
  quotable from the locked contract rather than from the plan set only.
- `02-UI-SPEC.md` now states that the `/o-nas` header comment at `+page.svelte:2-5` is
  rewritten **in the same commit as the lightbox island**. That is a commit-shape constraint on
  the plan that builds the island, not a follow-up task.

## Self-Check: PASSED

- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` FOUND
- `.planning/phases/02-about-documents-cms/02-UI-SPEC.md` FOUND
- `.planning/phases/05-gallery-fees/05-UI-SPEC.md` FOUND
- `.planning/DESIGN-BANK.md` FOUND
- commit `dcf9b25` FOUND
- commit `af7705c` FOUND
