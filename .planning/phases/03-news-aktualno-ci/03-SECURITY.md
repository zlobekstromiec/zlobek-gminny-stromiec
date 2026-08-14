---
phase: 03
slug: news-aktualno-ci
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-14
---

# Phase 03 - Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| git content -> build reader (`aktualnosci.ts`) | Post JSON authored via the CMS or hand edits crosses into the prerender with no schema validation between file and `import.meta.glob`; every field is untrusted input (compromised-editor scenario). | Post JSON fields (tytul, data, tresc, zajawka, obraz, obraz_alt) |
| staff-authored `tresc` -> prerendered DOM | Post body Markdown rendered into static HTML; the primary stored-XSS boundary of the phase. | Markdown text, potentially hostile markup |
| `obraz` field -> filesystem glob | Cover resolved by basename against a static uploads glob, never by arbitrary path. | Image basename string |
| external link in post body -> visitor browser | A body link could carry a hostile scheme; the renderer allow-lists safe protocols. | href values |
| authenticated staff -> git commit | GitHub OAuth (Phase 2, unchanged) gates who can commit post JSON and uploads to main. | Commits, media uploads |
| uploaded cover -> build pipeline | Uploads are size-capped and transformed to webp on upload before reaching the repo. | Image binaries |
| CMS editor -> on-disk slug (`config.yml` slug rule) | Staff-entered date + title become a permanent filename/URL at commit time. | Date + title strings |
| untrusted request URL -> `+error.svelte` | The error page renders for arbitrary bad URLs; nothing request-derived may reach `<head>`. | Request URL, error status/message |
| reader output (`PostWithMeta`) -> render consumers | `renderPost` and cover basename lookups call string methods on reader output; the reader must guarantee its output shape. | Guarded post objects |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Tampering / Elevation | `renderPost` (post body Markdown) | high | mitigate | Hardened full-block renderer in `src/lib/markdown.ts`: `escapeHtml` on raw HTML tokens, images dropped to alt text, `SAFE_HREF` protocol allow-list; second layer CSP `script-src: ['self']` in `svelte.config.js`. | closed |
| T-03-02 | Tampering | `renderPost` link handling | medium | mitigate | `SAFE_HREF = /^(?:https?:\|mailto:\|tel:\|\/\|#)/i` (`src/lib/markdown.ts:22`); an unsafe href renders as plain text, never an anchor (`:34`). | closed |
| T-03-03 | Tampering | Cover resolution (`obraz`) in `NewsCard.svelte` and `aktualnosci/[slug]/+page.svelte` | low | mitigate | Covers resolve by basename against `import.meta.glob('$lib/assets/uploads/*')`; unknown basename yields the tint fallback (card) or omits the cover (slug page); no filesystem read of an arbitrary path. | closed |
| T-03-04 | Denial of Service | `src/lib/server/aktualnosci.ts` reader | low | mitigate | Malformed entries are skipped with `console.warn` (bad slug, non-object, missing tytul/data/tresc); one bad post never aborts the prerender (dokumenty.ts precedent). | closed |
| T-03-05 | Denial of Service | aktualnosci cover uploads | medium | mitigate | Collection inherits global `media_libraries` config (`static/admin/config.yml:23-31`): `max_file_size: 5000000` plus on-upload webp transform capped at 1600px; no per-collection override weakens it; enhanced-img is the second layer. | closed |
| T-03-06 | Tampering | Constrained `tresc` widget | low | mitigate | Markdown widget offers only `buttons: [bold, link, bulleted-list, numbered-list]` (no headings/image); the hardened `renderPost` is the enforcing layer at render time. | closed |
| T-03-07 | Tampering | `NewsPreview` card text (excerpt/title) | low | mitigate | Card title, date, and excerpt bound as text props, no `{@html}`; the only sanitized `{@html}` surface is the single-post body via `renderPost`. | closed |
| T-03-05-01 | Tampering (URL integrity) | `static/admin/config.yml` slug template | high | mitigate | `slug: '{{fields.data}}-{{fields.tytul}}'` substitutes the ISO-stored `data` verbatim (`format: 'YYYY-MM-DD'`); no error-prone date transformation (CR-01 root cause fixed). | closed |
| T-03-05-02 | Integrity (silent data loss) | Seed migration + reader parse | medium | mitigate | `tests/aktualnosci.spec.ts` asserts `<time datetime="2026-08-01">` and `tests/home.spec.ts` asserts the newest seed surfaces on the homepage; a vanished seed fails the suite. | closed |
| T-03-05-03 | Tampering (Sveltia `format` behavior) | `data` datetime widget storage | medium | mitigate | `format: 'YYYY-MM-DD'` is the on-disk storage format, `date_format: 'DD.MM.YYYY'` the editor display; verified against the pinned `@sveltia/cms@0.189.0` bundle per 03-REVIEW.md CR-01; seed round-trip test fails loudly on regression. | closed |
| T-03-06-01 | Denial of Service (build availability) | `aktualnosci.ts` parseData / firstParagraph | high | mitigate | Type guards on `data`/`tresc`/`tytul` with skip-and-warn; pinned by unit tests in `tests/aktualnosci-reader.unit.ts`. | closed |
| T-03-06-02 | Tampering (`<time>` / sort integrity) | `aktualnosci.ts` parseData day check | medium | mitigate | Day-range guard `if (day < 1 \|\| day > 31) return null` (`aktualnosci.ts:60-61`); out-of-range day rejects with skip. | closed |
| T-03-06-03 | Injection / Info disclosure (reflected head) | `+error.svelte` `<title>` | low | mitigate | Title built only from fixed `is404`-gated Polish strings plus the constant site name (`+error.svelte:10-16`); `page.error.message` never reaches `<head>`. | closed |
| T-03-07-01 | Denial of Service (deploy availability) | `postFromEntry` -> `renderPost(post.tresc)` | high | mitigate | `tresc` required unconditionally (`aktualnosci.ts:131-135`); a missing or non-string `tresc` skips the entry, so `marked.parse(undefined)` can never abort the prerender. | closed |
| T-03-07-02 | Denial of Service (deploy availability) | Cover basename split in `NewsCard.svelte` and `[slug]/+page.svelte` | high | mitigate | `obraz`/`obraz_alt` pass through `readString` (`aktualnosci.ts:139-140`); a non-string value degrades to `undefined` and the tint fallback renders. | closed |
| T-03-07-03 | Tampering (unvalidated input at the render boundary) | `postFromEntry` return value | medium | mitigate | Result constructed key by key from guarded locals only (`aktualnosci.ts:144-157`), no object spread; pinned by the `EXPECTED_POST_KEYS` key-set assertion in `tests/aktualnosci-reader.unit.ts:156`. | closed |
| T-03-07-04 | Denial of Service (build availability) | `postFromEntry` on a non-object entry | medium | mitigate | Plain-object guard runs first; `null`/array/bare-string entries skip with warn ("entry is not a JSON object", `aktualnosci.ts:113`). | closed |
| T-03-SC | Tampering (supply chain) | npm installs | low | accept | No package installs in Phase 3; all deps pinned from Phase 2 (`@sveltia/cms@0.189.0` vendored; RESEARCH Package Legitimacy Audit: zero new/[SUS]/[SLOP]). See Accepted Risks Log R-03-01. | closed |

*Status: open · closed · open - below high threshold (non-blocking)*
*Severity: critical > high > medium > low - only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-03-01 | T-03-SC | No package-manager installs occurred in Phase 3; every dependency (marked, enhanced-img, sveltia, lucide) is pinned from Phase 2 and the RESEARCH Package Legitimacy Audit recorded zero new/[SUS]/[SLOP] packages, so no legitimacy checkpoint applies. | Plan-time disposition (all 03-0x plans), confirmed at audit | 2026-08-14 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-14 | 18 | 18 | 0 | Claude (gsd-secure-phase, L1 grep-depth; plan-time register, short-circuit rule) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-14
