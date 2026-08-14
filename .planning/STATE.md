---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 4
current_phase_name: Enrollment, Contact & Email Pipeline
status: verifying
stopped_at: Phase 03 complete (UAT passed), ready to plan Phase 4
last_updated: "2026-08-14T04:00:03.657Z"
last_activity: 2026-08-14
last_activity_desc: Phase 03 complete, transitioned to Phase 4
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 18
  completed_plans: 18
  percent: 43
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-14)

**Core value:** A parent lands on the site and, within seconds, both feels the żłobek's warmth and finds the exact information they need (enrollment, documents, contact) — on any device.
**Current focus:** Phase 4 — Enrollment, Contact & Email Pipeline

## Current Position

Phase: 4 — Enrollment, Contact & Email Pipeline
Plan: Not started
Status: Ready to plan (Phase 03 closed: UAT 1/1 passed, verification passed, security threats_open 0)
Last activity: 2026-08-14 — Completed quick task 260814-hwf: official name Publiczny Żłobek w Stromcu + corrected logo

Progress: [████████████████████] 18/18 plans (100%)

## Performance Metrics

**Velocity:**

- Total plans completed: 18
- Average duration: — min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |
| 02 | 6 | - | - |
| 03 | 7 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P01 | 25 | 3 tasks | 27 files |
| Phase 01 P02 | 20 | 3 tasks | 9 files |
| Phase 01 P04 | 18min | 3 tasks | 11 files |
| Phase 01 P03 | 22min | 3 tasks | 10 files |
| Phase 01 P05 | 15 | 3 tasks | 1 files |
| Phase 02 P01 | 10 | 3 tasks | 13 files |
| Phase 02 P02 | 6 | 3 tasks | 10 files |
| Phase 02 P03 | 3 | 2 tasks | 5 files |
| Phase 02 P04 | 6 | 3 tasks | 7 files |
| Phase 02 P05 | 15 | 3 tasks | 8 files |
| Phase 03 P01 | 15 | 3 tasks | 7 files |
| Phase 03 P02 | 8 | 3 tasks | 6 files |
| Phase 03 P03 | 8min | 2 tasks | 2 files |
| Phase 03 P04 | 5min | 3 tasks | 5 files |
| Phase 03 P05 | 4 | 2 tasks | 4 files |
| Phase 03 P06 | 7min | 3 tasks | 5 files |
| Phase 03 P07 | 4min | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Stack: SvelteKit 2 + `@sveltejs/adapter-cloudflare` + Tailwind v4 (research SUMMARY.md — authoritative).
- Design: Resolve the bright-palette-vs-WCAG-contrast tension with a two-tier token system (expressive/decorative vs accessible text/UI) in Phase 1, before mass component building.
- Forms: Email-only via Cloudflare function + Resend + server-side Turnstile + RODO consent/klauzula, zero storage (Phase 4).
- Domain/email split: we OWN `zlobekstromiec.pl` (public site + Resend sending domain via `send.` subdomain; DNS on Cloudflare, we control it) → form email delivered to the Gmina mailbox `zlobek@ugstromiec.pl` (confirmed recipient; `zlobel@` was a typo). No `ugstromiec.pl`-DNS dependency. DKIM is a TXT record (not CNAME); MX + SPF + DMARC on our domain (see ROADMAP "Email Sending — Implementation Notes").
- CMS: Git-based Sveltia + self-hosted `sveltia-cms-auth` OAuth Worker + GitHub OAuth App (Phase 2).
- Compliance: Deklaracja dostępności conformance claim written AFTER the AA baseline is real (Phase 6).
- Homepage v2.1 SHIPPED (inserted phase 01.1, completed 2026-08-13; two-design merge, second handoff banked in .planning/DESIGN-BANK.md): copy rules NO EMOJI + NO EM DASHES everywhere (en dash only in numeric ranges; verbatim core message byte-exempt); age range CORRECTED to 10 mies. - 3 lata (prior 20 tyg. was wrongly marked final); Design B facts adopted with PLACEHOLDER markers pending written confirmation; public e-mail stays zlobek@ugstromiec.pl; nav stays five sections with Cennik/Galeria/Dojazd surfaced in Footer v2. Original v2 decisions: section order hero → key-facts → rekrutacja module → o-nas teaser → kontakt+mapa → news only when posts exist (no empty state on homepage); hero leads with sentence 2 of the core message, FULL verbatim message moves to the o-nas blockquote on the same page; map = static image only, never a third-party iframe (RODO); `recruitmentOpen` is a human-flipped boolean in `src/lib/content/site.ts` (never a date comparison; CMS-editable later); UI-SPEC Amendment v1.1 adds sizes 13/15/17/19/26px + `--color-brand-blue-hover` while keeping locked h1/h2 clamps (handoff’s 52/30px rejected); hours/fee/capacity/phone/address/deadline dates stay PLACEHOLDER; hero secondary CTA „Zadzwoń do nas” → /kontakt is a known-future 404 until Phase 4 (accepted, same as nav).
- Language: Entire product in Polish — public site (Phase 1, SITE-06) and CMS admin portal labels/hints (Phase 2, CMS-03); staff assumed not to read English.
- [01-01] Scaffold reconciled to plan layout: adapter in `svelte.config.js` (canonical), Tailwind entrypoint in `src/app.css`; kept Cloudflare-native `wrangler types --check` build + `wrangler pages dev` preview (worker-configuration.d.ts committed). Fonts self-hosted via `@fontsource` (no Google CDN). Node pinned/built on 22.23.2 (asdf), not local Node 25.
- [Phase ?]: [01-02] Navigation shell uses $app/state rune page (not deprecated $app/stores); MobileNav is the single hydrated island (bounded focus trap + reduced-motion fly/fade); not-yet-built section routes tolerated via prerender handleHttpError allow-list in svelte.config.js.
- [Phase ?]: Plan 01-04: _headers must live at project root (adapter-cloudflare v7), not static/ — adapter copies it into the Pages build output
- [Phase 01]: Plan 01-04: placeholder stays crawl-safe via robots Disallow:/ (D-11); favicon set + 1200x630 OG card + security-headers baseline shipped; /deklaracja-dostepnosci stubbed so the footer link never 404s
- [Phase 01]: [01-03] Homepage composed GREEN: verbatim core message kept as an un-wrapped constant (prettier-safe); Seo noindex baked into prerendered HTML for the *.pages.dev placeholder (not a runtime host check); consent-safe AVIF/WebP hero placeholder (no child faces)
- [Phase ?]: [01-05] Walking skeleton live: repo under Org zlobekstromiec/zlobek-gminny-stromiec + Cloudflare Pages git-integration; push to main auto-builds+deploys to https://zlobek-gminny-stromiec.pages.dev (SITE-01 proven). Reconnect gotcha: use the Pages deep link, NOT the Workers 'Import a repository' funnel.
- [Phase ?]: [02-01] O nas page shipped (ABOUT-01): content migrated out of site.ts into shared day-plan.json (D-03) + strict o-nas.json singleton; enhanced-img + marked build pipeline wired; enhanced-img/marked exact-pinned per T-0201-SC.
- [Phase 02]: [02-02] /dokumenty shipped (DOCS-01): build-time statSync meta resolver (src/lib/server/dokumenty.ts, reusable by homepage Plan 03); dormant RODO category (D-13); 3-doc placeholder-flagged BIP seed; meta-inside-link WCAG rows; crawler now enforces /dokumenty.
- [Phase ?]: [02-04] Sveltia CMS shell + config landed: self-hosted pinned @sveltia/cms 0.189.0 at /admin (no CDN, vendored bundle + cms:sync refresh script), all-Polish strict-widget config.yml mapping 1:1 to o-nas.json/day-plan.json/dokumenty (JSON keys unchanged, markdown limited to bold+link, fixed category select), path-scoped /admin/* CSP (tight connect-src, site-page kit.csp untouched). Worker origin is a placeholder finalized in Plan 05.
- [Phase ?]: [02-05] Staff-editor vertical slice proven LIVE on *.pages.dev: self-hosted sveltia-cms-auth OAuth Worker (devzlobekstromiec.workers.dev, ALLOWED_DOMAINS=live Pages origin), config.yml base_url + _headers connect-src finalized to the real origin, Polish instrukcja shipped; GitHub login to Polish edit to commit main to Pages rebuild to live confirmed (CMS-01/02/03). Secrets Worker-only. npm audit sharp/libvips CVEs NOT force-fixed (breaking enhanced-img 0.4.1 downgrade rejected). CMS-03 chrome caveat narrowed by gap-closure plan 02-06.
- [Phase 03]: [03-01] Aktualności list route (NEWS-01) shipped: build-time readAktualnosci()/readLatest(n) reader (slug from filename, genitive Polish dates, no runtime locale formatter), shared NewsCard (self-contained cover by basename + tint fallback), zero-JS prerendered /aktualnosci newest-first; svelte.config.js untouched so [slug] card links are tolerated known-future 404s until Plan 02.
- [Phase 03]: [03-02] renderPost hardened full-block renderer reuses vetted escapeHtml/SAFE_HREF (declared once); headings neutralized to paragraphs to protect the post single-h1 and stored-XSS boundary; /aktualnosci/[slug] prerendered via entries() from the shared reader; /aktualnosci dropped from KNOWN_FUTURE_ROUTES so broken news links now fail the build; +error.svelte is the site-wide friendly Polish 404 via the app/state page rune (NEWS-02).
- [Phase ?]: [03-03] Sveltia aktualnosci collection shipped (NEWS-03): all-Polish folder collection (create: true) mapping 1:1 to PostEntry, constrained tresc markdown (bold/link/lists), NO per-collection media override so covers inherit the global Vite-processed uploads (enhanced-img, Pitfall 3); global slug block encoding ascii + clean_accents transliterates Polish titles; date-prefixed slug via the date() filter (verified present in pinned @sveltia/cms 0.189.0, so data keeps DD.MM.YYYY and the reader is unchanged); Polish instrukcja section 5 documents save=publish ~2min/no-draft (D-04), live-regardless-of-date (D-03), title-edit-keeps-URL (D-07), English chrome mapping.
- [Phase 03]: [03-05] CR-01 closed: aktualnosci data now stored ISO YYYY-MM-DD (Sveltia format key) while the Polish DD.MM.RRRR picker display stays; the slug substitutes the date verbatim (plain {{fields.data}}, no date transformation), so every day of the month yields a correct permanent URL. Reader parseData switched to ISO and both seeds migrated; dokumenty wersja left on DD.MM.YYYY (never slugged).
- [Phase ?]: [03-06] WR-02/WR-04 closed: parseData accepts unknown (typeof + 1-31 day-range guards); new exported postFromEntry skip-with-warns malformed entries (dokumenty.ts withMeta precedent) so one bad post JSON never aborts the prerender, pinned by node:test suite tests/aktualnosci-reader.unit.ts via new test:unit script (built-in runner, no dependency, .unit.ts outside Playwright match); +error.svelte ships an is404-gated fixed-Polish title (never page.error), closing WCAG 2.4.2.
- [Phase ?]: [03-07] Residual WR-02 closed structurally: postFromEntry's entry param is now `unknown`, a plain-object guard runs before any property access, `tresc` is validated unconditionally (a present zajawka no longer skips it, so marked.parse(undefined) can never abort the entries()-driven prerender), and the return value is an explicit 12-key literal built from guarded locals instead of a raw-entry spread — pinned by an EXPECTED_POST_KEYS key-set assertion and mutation-checked (removing any of the tytul/data/tresc/obraz guards, or reintroducing the spread, turns test:unit red). The reader is the single validation boundary; NewsCard.svelte and [slug]/+page.svelte carry no defensive guards.
- [Phase ?]: [03-07] News post field policy: required fields (tytul, data, tresc) reject the entry with a build warning; optional fields (zajawka, obraz, obraz_alt) degrade to undefined via readString, so a wrong cover costs the image (D-01 tint fallback) not the article. Proven at build level: npm run build exits 0 with a malformed post JSON present and still prerenders both valid seeds (D-03).
- [Phase ?]: [quick-260814-6n1] Real client logo shipped across all brand surfaces: circular emblem in the header at 52px (accent circle and hard shadow removed, the mark is full-colour and self-contained), full lockup on a white radius-sm card in the footer brand column (its blue and orange wordmark is not legible directly on brand-blue), favicon.png 512x512 transparent plus apple-touch-icon.png 180x180 white plate regenerated from the emblem. Placeholder favicon.svg retired and de-referenced (manifest keeps exactly 2 PNG icons); delivered source logo-bg.png removed from the repo root; IconBear stays in src/lib/icons/ (only the logo-badge use is superseded). Both images decorative (empty alt) so the wordmark text remains the link's accessible name. Assets cut with an uncommitted scratchpad sharp script: sharp .trim() is a NO-OP on this source (top-left pixel is alpha=1 with faint 1-4 alpha noise), so crops come from a computed alpha bbox plus a per-column scan (emblem x 125-530, empty gap 531-593, wordmark from 594). package.json unchanged. UI-SPEC Amendment v1.3.

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet.

### Blockers/Concerns

External/client-input items (see ROADMAP.md "External Dependencies & Open Items"):

- ~~[Phase 1→4] Confirm DNS control of `ugstromiec.pl`~~ — **DISSOLVED.** Resend SPF/DKIM/DMARC live on our owned domain `zlobekstromiec.pl` (DNS on Cloudflare, we control it). No Gmina-IT dependency and no lead time; `ugstromiec.pl` is only the delivery mailbox. (The old MailChannels fallback is also stale — discontinued 2024.)
- ~~[Phase 4/6] Confirm exact recipient email~~ — **RESOLVED: `zlobek@ugstromiec.pl`** confirmed (`zlobel@` was a typo).
- [Phase 4] NEW (soft): ask Gmina IT to allowlist our sending domain (`send.zlobekstromiec.pl`) and confirm the `zlobek@ugstromiec.pl` mailbox receives external mail; run an early end-to-end delivery test.
- [Phase 4/6] RODO: Gmina (controller) to sign Resend DPA + SCCs and Cloudflare DPA, list both as sub-processors in the RCPD, select Resend EU region.
- [Phase 4/6] Obtain koordynator dostępności / IOD contact for klauzula informacyjna and Deklaracja dostępności.
- [Phase 2] Confirm staff GitHub account model (per-editor vs shared) and invite staff as zlobekstromiec Org members with write access before CMS handover (D-19/D-20).
- [Phase 3 UAT] CMS-authored JSON commits use 2-space indent while the repo prettier standard is tabs, so the `prettier --check .` pre-commit hook blocks ALL local commits until CMS files are reformatted (hit live with `2026-08-14-test.json`, fixed by `prettier --write`). Decide a policy before staff publish regularly: add `src/lib/content/aktualnosci/` (and uploads) to `.prettierignore`, or accept reformat-on-touch.
- ~~[Phase 3 UAT] Placeholder test post `2026-08-14-test.json` live on the site + breaking `tests/aktualnosci.spec.ts:55`~~ — **RESOLVED 2026-08-14**: deleted via /admin (Sveltia commit c5c3dc0, also proving the CMS delete flow); full Playwright suite 55/55 green again.
- [Rename 260814-hwf] `static/og-placeholder.png` share card still renders the old branding/name; regenerate from real brand assets in Phase 6.
- [Rename 260814-hwf] Official name "Publiczny Żłobek w Stromcu" now in code seeds, but `o-nas.json` and the aktualnosci seeds are CMS-editable; staff edits via /admin could reintroduce old wording.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260814-6n1 | Implement new brand logo across header, footer and favicons | 2026-08-14 | f09af5d | [260814-6n1-implement-new-brand-logo-across-header-f](./quick/260814-6n1-implement-new-brand-logo-across-header-f/) |
| 260814-hwf | Rename to official Publiczny Żłobek w Stromcu + corrected logo artwork | 2026-08-14 | 8f8cd8a | [260814-hwf-rename-to-official-publiczny-zlobek-w-st](./quick/260814-hwf-rename-to-official-publiczny-zlobek-w-st/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-14T03:45:00Z
Stopped at: Phase 03 complete (UAT passed, transitioned), ready to plan Phase 4
Resume file: None
