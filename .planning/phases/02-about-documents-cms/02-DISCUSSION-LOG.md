# Phase 2: About, Documents & CMS - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-08-13
**Phase:** 2-about-documents-cms
**Areas discussed:** O nas page composition, CMS editability model, Dokumenty organization, Staff access & workflow

---

## O nas page composition

| Option | Description | Selected |
|--------|-------------|----------|
| The roadmap four (Recommended) | Misja, Wartości, Plan dnia, Kadra only | |
| Four + facility story | The roadmap four plus a building/sala/plac zabaw section with photos | ✓ |
| Narrative single-flow | One continuous story, no hard sections | |

**User's choice:** Four + facility story

| Option | Description | Selected |
|--------|-------------|----------|
| Group description (Recommended) | Collective text + headcount by role; no individual photos | ✓ |
| Individual profiles | Name/role/photo cards; needs per-person consent | |
| Hybrid: roles, no photos | Named cards with illustrated avatars | |

**User's choice:** Group description

| Option | Description | Selected |
|--------|-------------|----------|
| Single source, reused (Recommended) | One CMS plan dnia powers homepage AND /o-nas | ✓ |
| Richer version on /o-nas | Expanded plan on /o-nas, compact on homepage (drift risk) | |
| Move it to /o-nas only | Remove from homepage (contradicts locked v2.1 design) | |

**User's choice:** Single source, reused

| Option | Description | Selected |
|--------|-------------|----------|
| Stock/AI, no faces (Recommended) | Environment-only warm imagery, PLACEHOLDER-marked, real photos Phase 6 | ✓ |
| Illustrations only | Brand-palette illustrations; zero consent risk but look shifts at launch | |
| Text-first, photos later | Ship text now, photo grid in Phase 6 | |

**User's choice:** Stock/AI, no faces

---

## CMS editability model

| Option | Description | Selected |
|--------|-------------|----------|
| Strict fields (Recommended) | Validated widget per section; staff cannot break layout/build | ✓ |
| Single markdown body | One rich-text document per page | |
| Hybrid | Structured data + free markdown narrative sections | |

**User's choice:** Strict fields

| Option | Description | Selected |
|--------|-------------|----------|
| Forced-only (Recommended) | Migrate only O nas + dokumenty + shared plan dnia | ✓ |
| Site-facts singleton too | Also "Ustawienia strony" (contact, keyFacts, recruitmentOpen) | |
| Everything editable | Migrate all of site.ts now | |

**User's choice:** Forced-only

| Option | Description | Selected |
|--------|-------------|----------|
| Now, with CMS (Recommended) | Build-time image optimization ships this phase | ✓ |
| Phase 6 (performance phase) | Serve uploads as-is until the perf pass | |
| You decide | Claude discretion | |

**User's choice:** Now, with CMS

| Option | Description | Selected |
|--------|-------------|----------|
| Limited rich text (Recommended) | Paragraphs, bold, links only | ✓ |
| Plain text only | Multiline plain text | |
| Full markdown | Headings/images allowed (off-design risk) | |

**User's choice:** Limited rich text

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder flag field (Recommended) | Polish boolean per entry, greppable placeholder: true | ✓ |
| External checklist | Dev-maintained .planning/ checklist | |
| Token in the text | Literal PLACEHOLDER inside content values | |

**User's choice:** Placeholder flag field

| Option | Description | Selected |
|--------|-------------|----------|
| /admin (Recommended) | Sveltia convention, docs match | ✓ |
| /panel | Polish path, deviates from tooling | |

**User's choice:** /admin

| Option | Description | Selected |
|--------|-------------|----------|
| Stay in code (Recommended) | Core message hard-coded, byte-exempt, test-protected | ✓ |
| CMS-editable | Exposed as a field; one stray edit breaks the contract | |

**User's choice:** Stay in code

| Option | Description | Selected |
|--------|-------------|----------|
| Instrukcja explains it (Recommended) | Polish guide documents save -> ~2 min -> refresh | ✓ |
| Status link in CMS | "Status publikacji" link to deploy status | |
| You decide | Claude discretion | |

**User's choice:** Instrukcja explains it
**Notes:** User asked for MORE questions on this area after the first four (only area extended to 8 questions).

---

## Dokumenty organization

| Option | Description | Selected |
|--------|-------------|----------|
| Category groups (Recommended) | Polish-header sections | ✓ |
| Flat list | One list, newest first | |
| Flat list + filters | Filter chips (interactive island) | |

**User's choice:** Category groups

| Option | Description | Selected |
|--------|-------------|----------|
| Type + size + date (initial framing) | "PDF - 240 KB - aktualizacja DD.MM" | |
| Type + size only | No dates | |
| Name only | Just the title link | |

**User's choice:** Other (free text): "what if a document doesnt get updated in years that might look bad?"
**Notes:** Stale-date concern. Re-asked with "wersja z dnia" reframing:

| Option | Description | Selected |
|--------|-------------|----------|
| Type + size + wersja (Recommended) | "wersja z DD.MM.RRRR" reads as stable binding version, not neglect | ✓ |
| Type + size only | Nothing can look stale, loses currency signal | |
| Date on forms only | Dates only in Rekrutacja category | |

**User's choice:** Type + size + wersja

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed dropdown (Recommended) | Validated select; no typo-categories | ✓ |
| Free-text category | Staff type anything (duplicate-group risk) | |
| Folder per category | Collection per category | |

**User's choice:** Fixed dropdown

**Mid-area interruption:** User flagged that the PDFs will largely mirror the Stromiec BIP set and named three reference sites. A 3-agent research workflow (run wf_3eae28ec-f2f) inventoried ugstromiec.naszbip.pl, zlobekzlota.pl, and zlobek.bialobrzegi.pl. Findings are embedded in CONTEXT.md Specific Ideas. The category-taxonomy question was re-presented BIP-grounded ("Rekrutacja + Statut i uchwały" recommended); the user was away (60s timeout), so it and the remaining Dokumenty questions were DEFAULTED to recommended options: D-13 (taxonomy), D-16 (host copies, not BIP deep-links), D-17 (keep source formats), D-18 (re-align homepage docs list to real BIP names).

---

## Staff access & workflow

**Not interactively discussed - user away.** All four decisions DEFAULTED to recommended options, marked for confirmation in CONTEXT.md:

- D-19 per-editor GitHub accounts (vs shared account)
- D-20 direct publish to main (vs editorial/draft workflow)
- D-21 Polish instrukcja ships this phase
- D-22 staff provisioned as Org members with content-repo write

---

## Claude's Discretion

- Content-layer file format/location and Sveltia config.yml specifics
- O nas section ordering and visual treatment (within locked design system)
- Image pipeline tool choice (enhanced-img vs vite-imagetools)
- Instrukcja format/location
- CSP extension for /admin + OAuth Worker

## Deferred Ideas

- Żłobek-specific klauzula RODO must be authored (absent from BIP) -> Phase 4
- PDF versions of DOC/DOCX forms -> client/launch decision (Phase 6)
- Statut amendment pending on BIP (draft ~07.08.2026) -> re-verify before launch
- Suggest Gmina cross-link statut/opłaty from the BIP żłobek section (courtesy note)
- "Ustawienia strony" site-facts singleton -> Phase 3/4
