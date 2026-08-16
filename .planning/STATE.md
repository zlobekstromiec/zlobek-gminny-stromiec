---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 04.1
current_phase_name: replace-sveltia-with-custom-polish-cms
status: executing
stopped_at: Ukonczono 04.1-07-PLAN.md
last_updated: "2026-08-16T08:56:54.131Z"
last_activity: 2026-08-16
last_activity_desc: "Completed 04.1-07 (zdjecia wpisow: wyspa z przycieciem w przegladarce, alt wymagany na serwerze, wpis i okladka w jednym commicie)"
progress:
  total_phases: 8
  completed_phases: 4
  total_plans: 38
  completed_plans: 34
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-14)

**Core value:** A parent lands on the site and, within seconds, both feels the żłobek's warmth and finds the exact information they need (enrollment, documents, contact) — on any device.
**Current focus:** Phase 04.1 — replace-sveltia-with-custom-polish-cms

## Current Position

Phase: 04.1 (replace-sveltia-with-custom-polish-cms) — EXECUTING
Plan: 8 of 11
Status: Ready to execute
Last activity: 2026-08-16 — Completed 04.1-07 (zdjecia wpisow: wyspa z przycieciem w przegladarce, alt wymagany na serwerze, wpis i okladka w jednym commicie)

Plan 11 is `autonomous: false`. Plan 04's human prerequisites are now PARTLY done: the GitHub App `Panel redakcyjny zlobka` exists (org-owned, Contents:write on one repository, client id `Iv23lipuQ3hnHl4snF6h`, installation `154059103`) and the private key is converted to PKCS#8 at `~/Documents/panel-redakcyjny-zlobka.pkcs8.pem`. **The Cloudflare half is now DONE** (resolved at the 04.1-04 checkpoint on 2026-08-16): the five admin Pages secrets are set on `zlobek-gminny-stromiec`, deployment `72941a1e-51db-49bc-a9bd-581c05d99cb0` carries them, and the code-request leg of the login completes in production. **What is still OWED is the first REAL save**, and after 04.1-07 that gate has grown again: a real nabór flip (04.1-05), a real create, title edit and delete of an aktualność (04.1-06), and a real create WITH A PHOTO TAKEN ON A PHONE whose `git show --stat` must list exactly two files with the same stem (04.1-07), each with its commit SHA recorded and the public page confirmed to change. The photo step also closes the untested iPhone HEIC decoding assumption if the phone is an iPhone. All three checkpoints are one session's work and none needs a deploy of its own.

**D-20 IS SUPERSEDED as of Plan 01 (user-approved Rule 4 deviation).** Sveltia's repository footprint was deleted in Plan 01, not Plan 11, because `static/admin/` is a Cloudflare Pages static asset and static assets resolve before the Worker, so the bare `/admin` never reached the new gate and the plan's own assertions were unprovable. Staff therefore have NO working editor until Plan 10 lands, which the user accepted. Plan 11 must be re-read rather than executed as written: its Task 2 is now largely a no-op (see `04.1-01-SUMMARY.md` "Knock-on Effects for Plan 11" for the exact split), and its ordering prohibition no longer applies. Plan 11 Task 3 is unchanged and still owed: deleting the GitHub OAuth App and the deployed `sveltia-cms-auth` Worker, both dashboard-only and both still live.

Progress: 04.1 plans 1 to 7 of 11 complete; 27/27 plans in phases 1-4 complete (4 of 8 phases)

**CMS-01 and CMS-03 stay UNMARKED after 04.1-02**, deliberately, following the Plan 01 precedent. Both are shared across the whole phase, both are currently worded around Sveltia and GitHub OAuth, and D-21 rewords them in Plan 11. Ticking them from a plan that ships a code module and a copy module, with no login screen yet, would put a false claim in the traceability table.

**Phase 5 (Gallery & Fees) is deferred behind 04.1.** Its `05-CONTEXT.md` was gathered on 2026-08-15 assuming Sveltia is the CMS; re-read and refresh it after 04.1 lands, because gallery photo management and the fees editor are now authored in the replacement panel.

## Performance Metrics

**Velocity:**

- Total plans completed: 27
- Average duration: — min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |
| 02 | 6 | - | - |
| 03 | 7 | - | - |
| 04 | 9 | - | - |

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
| Phase 04 P01 | 79min | 3 tasks tasks | 17 files files |
| Phase 04 P02 | 24min | 3 tasks | 8 files |
| Phase 04 P03 | 15min | 3 tasks | 7 files |
| Phase 04 P04 | 12min | 3 tasks | 6 files |
| Phase 04 P05 | 15min | 3 tasks tasks | 8 files files |
| Phase 04 P06 | 14min | 3 tasks tasks | 10 files files |
| Phase 04 P07 | 68min | 3 tasks tasks | 7 files files |
| Phase 04 P09 | 4min | 1 task tasks | 2 files files |
| Phase 04 P08 | 16 | 3 tasks tasks | 5 files files |
| Phase 04.1 P01 | 22min | 4 tasks tasks | 18 files files |
| Phase 04.1 P02 | 22min | 3 tasks tasks | 6 files files |
| Phase 04.1 P03 | 38min | 3 tasks | 15 files |
| Phase 04.1 P04 | 6 | 3 tasks | 6 files |
| Phase 04.1 P05 | 3h | 3 tasks | 13 files |
| Phase 04.1 P06 | 35min | 3 tasks | 27 files |
| Phase 04.1 P07 | 78min | 3 tasks | 19 files |

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
- [Phase 04]: [04-01] Form pipeline landed behind POST /api/kontakt (first dynamic route). NO root .dev.vars: wrangler types bakes its keys into the committed worker-configuration.d.ts as required members, which Pages CI cannot reproduce, so wrangler types --check would fail every deploy; test-run secrets come from npm run preview:test --binding flags instead (identical platform.env, verified). obsluz() takes every side effect by injection so Plan 05's /api/rekrutacja is a thin adapter. Two rate-limit ceilings (5/h per salted-hash client key + 40/day site-wide) protect the Resend 100/day budget; both counters read before either is written. FROM/TO/BCC are module constants, subject static, payload text-only (no markup field). Per-field keys are brak/niepoprawny/zbyt-dlugi to match the UI-SPEC error copy. CONTACT-03/FORM-01/FORM-02 left UNMARKED: shared with Plans 03/04/05/07 and no form or real send exists yet. 101 unit + 9 endpoint tests green.
- [Phase ?]: 04-02: enhanced-img literal src with w= widths, not the ?enhanced import: the import form emits 1x/2x density descriptors and browsers ignore sizes when densities are present, softening small map labels on DPR-1 desktops
- [Phase ?]: 04-02: pre-launch grep gates stay literal-clean: comments explaining a ban are reworded to synonyms so the enforcing greps cannot report permanent false positives
- [Phase ?]: 04-02: the invented zlobek secretariat-hours field was deleted, not relabelled; the Urzad wnioski window lives in its own exported urzad const so it cannot be mistaken for a zlobek fact
- [Phase 04]: 04-03: the endpoint returns machine codes only; all Polish prose (including the klauzula informacyjna) lives in src/lib/content/forms.ts, so long-copy rules never reach server code
- [Phase 04]: 04-03: the klauzula never says a blanket 'nie przechowujemy danych'. It separates our infrastructure (nothing stored) from Resend's own approximately 30-day US-hosted copy, and tests/forms-copy.unit.ts fails if that disclosure, the standardowe klauzule umowne mechanism, the BCC backup sentence or the salted-hash sentence goes missing
- [Phase 04]: 04-03: CONTACT-03 and RECRUIT-04 stay unmarked until a parent can actually reach a form (Plan 04) and the enrollment island exists (Plan 06), following the Plan 01 precedent
- [Phase 04]: 04-04: /kontakt is live and crawler-enforced. The form section takes its accessible name from the island's card h2 (new id=formularz-naglowek) instead of duplicating a heading, and the D-16 info-box copy was resplit so the nominative urzad.name never lands after a preposition that needs the locative
- [Phase 04]: 04-04: Turnstile test seam. The always-pass dummy sitekey renders NO frame and no visible challenge, only a hidden cf-turnstile-response field, so widget readiness is detected through that field, never a frame and never a sleep. script-src and connect-src are now browser-proven; frame-src stays unproven until Plan 07 swaps in the real key
- [Phase 04]: 04-04: Playwright form fields are located by ROLE plus accessible name, because the approved consent sentence ends with the word the message label uses, which makes getByLabel ambiguous on both forms
- [Phase 04]: 04-05: zgloszenie pipeline shipped. POST /api/rekrutacja is a thin SECOND caller of obsluz() (two endpoint files kept deliberately; a shared parameterised handler was rejected) with its own static subject and its own KV counter keyed on the form name 'rekrutacja', so a busy contact form cannot lock a parent out of an enrollment enquiry. The child's name is excluded STRUCTURALLY: no field in ZgloszenieDane, the validated object is an explicit key literal (never a spread of the body), no line in the mail body, no control in ZgloszenieForm; a forged child-name key is dropped SILENTLY (200, not 400) so probing cannot learn the accepted shape. Birth-year window is deliberately narrow (server current -6 to +2, select +1 down to -4) so a 1926 or 2226 typo cannot pass unnoticed.
- [Phase 04]: 04-05: one Polish month table lives in src/lib/content/forms.ts and is INJECTED into the server-side mail-body builder, so the mail always names the month the parent picked. The birth date is one question with two server keys (miesiac, rok): the island renders a single message associated with the fieldset via aria-describedby and uses two selects, never input type=month, whose picker chrome cannot be forced to Polish.
- [Phase 04]: 04-05: tests/forms-copy.unit.ts sweeps an EXPLICIT list of exports, so every new copy export must be added to it or it silently escapes the em-dash, emoji and single-source-contact assertions (KOPIA_ZGLOSZENIE and MIESIACE_WYBOR added). The Urzad Gminy name stays nominative in the intro and success body (rephrased to 'przyjmuje go Urzad Gminy w Stromcu, ...'), the same locative constraint Plan 04-04 hit. RECRUIT-03/04 and FORM-01/02 stay UNMARKED until Plan 06 mounts the island and Plan 07 swaps in the real Turnstile key.
- [Phase 04]: 04-06: /rekrutacja is live and crawler-enforced; the phase's second vertical slice is closed and every section route linked from the nav now resolves. RECRUIT-01/02/05 marked (RECRUIT-05 on its document-management half only: the info-and-dates editing half is descoped for v1 per D-18, amending ROADMAP success criterion 5). RECRUIT-03/04 and FORM-01/02 stay unmarked for Plan 07 (real Turnstile key + first real send).
- [Phase 04]: 04-06: the source-document do-not-publish gate is now enforced three ways for the archival 2026/2027 stage dates: absent from the content module (grep), absent from the delivered HTML (Playwright), and absent from the whole src tree including comments (repository grep, which required rewording a site.ts comment written in 04-02). A forbidden fact sitting in a comment is one copy-paste from being shipped copy.
- [Phase 04]: 04-06: the fee box is structurally unable to separate an amount from its ZUS condition (one content block, one rendered panel), and the literal '0 zł' grep gate is unsatisfiable because '1 500 zł' contains it; the enforced form is the boundary-anchored grep plus a rendered-text assertion.
- [Phase 04]: 04-06: page-level uniqueness assertions on this site must be section-scoped, because the footer links to the BIP on every route; and the tie-break sentence is legitimately rendered twice (kryteria table prose and procedura step 3), so both locators were narrowed to the element under test rather than removed.
- [Phase ?]: [04-07] Go-live wiring landed: real Turnstile widget (widget-zlobekstromiec), real FORMS_KV namespace 55f55448fe1345e28a79da5a3e9e9ca9, and exactly three Pages secrets (RESEND_API_KEY, TURNSTILE_SECRET_KEY, RATE_LIMIT_SALT) with FORM_DRY_RUN and RATE_LIMIT_MAX deliberately unset, all confirmed on live deployment 4c35fd82.
- [Phase ?]: [04-07] DOMAIN MIGRATION (checkpoint-approved, supersedes the plan): zlobekstromiec.pl DNS now on Cloudflare (zone b86f4808a59379c48e9a8beeee6c19cb), registration still home.pl. Apex and www attached to Pages as active custom domains with active certs. Resend SPF and MX live at send.send.zlobekstromiec.pl, one level DEEPER than the plan assumed, because Resend's Return-Path prefix is itself 'send'.
- [Phase ?]: [04-07] A real managed Turnstile widget cannot be driven by an automated browser, headless or headful: it refuses to issue a token, which is exactly its purpose. The browser-side live delivery test is an irreducible HUMAN check; no automation shortcut was taken because every option required weakening production bot protection.
- [Phase ?]: [04-07] The Resend API key is correctly send-only, so per-recipient delivery and bounce status is NOT API-readable ('restricted to only send emails'). Reading the delivery log is a dashboard/human step; a broader key was deliberately NOT minted.
- [Phase ?]: [04-07] A placeholder KV id is not untidy but undeployable: Pages validates the id when publishing the Function and fails the deploy with Error 8000022 'Not a valid hex string'. Proven with a throwaway preview deployment so production was never risked.
- [Phase ?]: [04-07] The rate limiter only guarded an ABSENT binding (!kv). A present-but-unusable binding or any transient KV failure made get/put reject, escaping obsluz as an opaque 500 on every submission of both forms. Every KV operation is now wrapped and fails OPEN, matching the documented degrade policy: Turnstile remains the real gate and a rejected enquiry is stored nowhere, so lost for good.
- [Phase ?]: [04-09] WR-02 closed: the Turnstile $effect now owns the lifetime of everything it installs. Cleanup clears window.__onTurnstileLoad ONLY when it is identity-equal to that instance's own rysuj closure (an unconditional clear was rejected: a fast-path instance that installed nothing would delete a waiting instance's callback, the same cross-instance bug inverted), and rysuj returns early when the bound container is no longer connected, so a late loader callback or a re-executed svelte:head script after client-side navigation between /kontakt and /rekrutacja cannot orphan a widget. Pinned by a Playwright case observed RED (typeof was 'function') then GREEN, with a window sentinel proving the navigation was client side. Token contract, sitekey constants, host allow-list, render options and .slot sizing byte-identical; the ambient turnstile declarations were already optional so no d.ts change was needed. The live real-widget check across client-side navigation stays a human step.
- [Phase 04]: [04-08] CR-01 closed by moving the rate-limit WINDOW INTO THE KV KEY: the per-client key gains an hour-of-epoch bucket appended outside the digest and the site-wide counter becomes rl:doba:YYYY-MM-DD (UTC). expirationTtl is demoted to a cleanup-only MNOZNIK_TTL(2) x window lifetime, because a KV write overwrites the stored expiration, so the old bare-window value made the single daily counter monotonic: ordinary traffic drove it to 40 and returned 429 to every parent on BOTH forms until 24h of total site silence. podLimitem takes the clock as the SEVENTH parameter with a Date.now() default, which is what keeps both positional endpoint call sites byte-identical; the clock is read once and feeds both key builders so no request can straddle a boundary.
- [Phase 04]: [04-08] WR-01 closed: podLimitem returns true and stores nothing when sol.trim() is empty. trim is deliberate (both endpoints pass env.RATE_LIMIT_SALT ?? ''), and the guard sits BEFORE kluczLimitu so zero KV reads and zero writes happen: an unsalted truncated SHA-256 of a client address is enumerable across IPv4 and would turn the stored key into a reversible pseudonym, contradicting the klauzula sentence pinned by tests/forms-copy.unit.ts. Skipping is the same documented fail-open degrade as an absent binding; failing closed would discard enquiries stored nowhere.
- [Phase ?]: [04.1-01] Panel gate shipped: ONE handle() in src/hooks.server.ts runs before routing, so it covers pages, form actions and paths whose routes later plans have not written yet, and every branch fails CLOSED (deliberately the opposite of the documented fail-open degrade in the forms rate limiter, which sits behind Turnstile rather than being the authentication boundary). Session is a stateless HMAC-SHA256 __Host-panel_sesja cookie (WebCrypto only, 30 days, renewed only past a 5-day threshold so most responses carry no Set-Cookie), made revocable by re-running naLiscie against ADMIN_EMAILS on EVERY request instead of only at login. Mutation-proven both ways: deleting the naLiscie call leaves the file type-clean and all 216 unit tests green but turns the de-allowlisted Playwright case red (200 instead of 303); deleting the expiry comparison turns admin-sesja.unit.ts red.
- [Phase ?]: [04.1-01] SVELTIA REMOVED IN PLAN 01, SUPERSEDING D-20 (user-approved Rule 4 deviation at the plan checkpoint). static/admin/ is a Cloudflare Pages static asset and Pages resolves static assets BEFORE invoking the Worker, so the bare /admin returned Sveltia index.html with a 200 and never reached handle(). The plan's own assertions were unprovable while the bundle existed. Removed: static/admin/, sveltia-cms-auth/, scripts/cms-sync.mjs, the cms:sync script, the @sveltia/cms dependency (lockfile regenerated, zero matches), two eslint ignore blocks, one .prettierignore entry, and the path-scoped /admin/* CSP block in _headers. ACCEPTED CONSEQUENCE: staff have no working editor until Plan 10 lands.
- [Phase ?]: [04.1-01] The path-scoped /admin/* CSP block was DELETED, not rewritten: the panel is SvelteKit routes, so kit.csp already covers it, confirmed by curl against wrangler pages dev on both /admin/logowanie and an authenticated /admin (content-security-policy header with a fresh per-response nonce). kit.csp was NOT widened. The old block was not merely dead but actively wrong for the new panel (it permitted frame-src github.com, connect-src the auth Worker origin, and img-src two githubusercontent hosts). A comment now sits where the block was, stating there is deliberately no path-scoped block and that kit.csp must not be widened for the panel.
- [Phase ?]: [04.1-01] Two Playwright harness facts, observed not assumed. (1) A __Host- cookie CANNOT be seeded with context.addCookies url http://localhost:4173: Chromium drops the Secure flag when the seeding url is plain http (an ordinary-named cookie seeded that way returns secure:false), so the prefix fails its own validation and the call throws 'Invalid cookie fields'. Explicit domain localhost + path / + secure true and NO url is accepted, stores a genuinely Secure host-only cookie, and Chromium then sends it to http://localhost because localhost is a trustworthy origin. (2) A panel POST case must send an origin header: SvelteKit's CSRF layer answers 403 BEFORE hooks run, so without it every POST case would measure the CSRF check instead of the gate. tests/fixtures/admin.ts also READS the secret and address out of the preview:test script rather than retyping them, so harness bindings and fixture cannot drift apart silently.
- [Phase ?]: [04.1-02] One-time login code shipped and it fails CLOSED. Six digits from crypto.getRandomValues with the biased tail rejected before the modulo; KV holds only a salted SHA-256 of the code plus an expiry stamp and an attempt count, under a key that is a salted digest of the address (adm:kod:<hex16>), so neither the code nor the address is readable from KV. sprawdzKod compares DIGESTS over a length-independent loop, never the codes, because a plain equality on six digits leaks prefix timing. A correct exchange deletes the entry (single use), the attempt that reaches MAKS_PROB=5 deletes it and returns za-duzo-prob, and a later exchange finds nothing and reads as wygasl: from KV alone a burned code and an expired one are indistinguishable and 'wyslij kod ponownie' is the right instruction for both. Absent binding, missing or whitespace-only salt, a thrown KV call and a corrupt entry all return a refusal, explicitly the inverse of the documented fail-open degrade in ratelimit.ts. Mutation-proven both ways.
- [Phase ?]: [04.1-02] P-04 resolved by an optional TRAILING parameter, not a higher ceiling. kluczDobowy gained prefiks and podLimitem gained prefiksDobowy, both defaulted to PREFIKS_DOBOWY, which is what keeps both endpoint call sites byte-identical (the same append rule that added teraz in 04-08). podLimitemKodu passes rl:doba:adm with LIMIT_KODOW=5 per hour and LIMIT_KODOW_DOBOWY=20 per day. Passing a HIGHER limitDobowy was rejected: an admin request would still INCREMENT the shared counter, so the coupling would remain in both directions (a login flood refusing parents, a busy contact form locking staff out). The code REQUEST limiter deliberately keeps its fail-open degrade (P-06), a different decision from the fail-closed store, and the comment says so.
- [Phase ?]: [04.1-02] src/lib/content/panel.ts is the single source for every Polish panel string including the login code e-mail, and tests/admin-copy.unit.ts sweeps an EXPLICIT list of all 34 exports plus the rendered mail body and subject, then asserts that list length equals the module's own export count, so a new export cannot escape the contract by not being listed (mutation-proven: 34 vs 35). Two harness facts observed, not predicted: (1) a word boundary CANNOT be used to find English chrome in Polish text, because it treats every diacritic as a non-word character and splits waznosc at z and s, reporting the letters between them as the English word No; the sweep uses Unicode lookarounds and carries a positive control proving the detector still fires. (2) mail-kod.ts is a SIBLING of the forms mailer: it imports only the exported FROM, builds its own single-recipient payload with no bcc and no reply_to, and describes the forms payload builder in words rather than naming it, because the plan's acceptance gate is a literal grep.
- [Phase ?]: [04.1-02] The repo pre-commit gate makes a TDD RED commit impossible: it runs svelte-check over the WHOLE working tree, so a contract test importing a not-yet-written module is a type error and the hook refuses even an unrelated staged commit while that test sits untracked. RED must be OBSERVED and RECORDED in the SUMMARY rather than banked as its own commit. --no-verify was deliberately not used.
- [Phase ?]: [04.1-03] ekran logowania wylaczony z powloki galezia sciezki, a nie resetem ukladu, zeby nie stracic prerender = false
- [Phase ?]: [04.1-03] P-08 wdrozone doslownie, wysylka odroczona a zapis KV nadal awaitowany; pozostala roznica czasow to okolo 1.1 ms, pomiar na zywo nalezy do planu 10
- [Phase ?]: [04.1-03] przypadki logowania w Playwright dzialaja szeregowo, bo w KV jest jeden wpis kodu na adres
- [Phase ?]: 04.1-04: X-GitHub-Api-Version pinned to 2022-11-28, declared exactly once in src/lib/server/admin/repo.ts (P-11)
- [Phase ?]: 04.1-04: both 409 and 422 at update-ref map to konflikt, narrowed to the ref path so a 409 from a blob or tree is not shown to an editor as a conflict (P-12, over-mapping on purpose)
- [Phase ?]: 04.1-04: PANEL_DRY_RUN is a caller concern; zapiszAtomowo takes a dryRun option and never reads the environment, so the module stays pure (P-13)
- [Phase ?]: 04.1-04: the imported CryptoKey is cached at module scope beside the PEM that produced it, so a rotated key cannot keep signing from a warm isolate
- [Phase ?]: 04.1-04: CMS-02 stays UNMARKED until a real save produces a real commit (Plan 10), following the Plan 01 and 02 precedent
- [Phase ?]: 04.1-05: slownik pola formularza naboru wydzielony do src/lib/stan-naboru.ts, bo SvelteKit nie zbuduje klienta importujacego $lib/server
- [Phase ?]: 04.1-05: stan radia to zapisywalny $derived (Svelte 5.25+), nie $state z propa, zeby odpowiedz serwera po odmowie zapisu nie byla ignorowana
- [Phase ?]: 04.1-06: P-16 wykonane, generator nazwy pliku wolany wylacznie przy dodawaniu; ekran edycji zapisuje pod sciezke ze swojego parametru, wiec zmiana tytulu nie rusza adresu wpisu (D-07)
- [Phase ?]: 04.1-06: P-17 wykonane, zajeta nazwa pliku odmawia zapisu zamiast nadpisac istniejacy wpis (T-04.1-25)
- [Phase ?]: 04.1-06 NOWA: po dodaniu wpisu wracamy na liste, nie na ekran edycji nowego wpisu, bo czytnik globuje tresc w czasie budowania i nowy wpis nie istnieje do odczytu przez okolo dwie minuty
- [Phase ?]: 04.1-07: okladka nazywa sie rdzeniem nazwy pliku wpisu (P-19), a przechowywana wartosc to gola nazwa pliku (P-20)
- [Phase ?]: 04.1-07: walidator oddaje ladunek zdjecia, nazwe okladki sklada trasa, bo przy dodawaniu rdzen powstaje z wlasnie sprawdzanych pol
- [Phase ?]: 04.1-07: okladka jest kasowana tylko wtedy, gdy jej nazwa to nazwa wygenerowana dla tego wpisu, bo oba zdjecia zalozycielskie renderuje tez strona O nas

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
- [Phase 4] Do NOT create a root .dev.vars file: wrangler types writes its keys into the committed worker-configuration.d.ts as required members, so wrangler types --check fails locally and on the Cloudflare Pages deploy. Use npm run preview:test (wrangler pages dev --binding flags) for local and Playwright runs. FORM_DRY_RUN must never become a Cloudflare Pages variable. See .dev.vars.example.
- ~~[Phase 4] frame-src in the svelte.config.js CSP is still unproven in a browser~~ — **RESOLVED 2026-08-15 (04 UAT).** The real managed widget was observed rendering visibly on live /kontakt in its completed "Powodzenie!" state, so frame-src genuinely permits the challenge iframe. Residual, low risk and NOT re-opened: keyboard reachability and contrast OF THE WIDGET ITSELF were not manually checked; axe passes on both routes but cannot see inside a cross-origin iframe, and the widget is Cloudflare-rendered chrome rather than project-authored markup.
- [Phase 4 / 04-07] The scoped CLOUDFLARE_API_TOKEN in .envrc is Pages + Turnstile ONLY: no Workers KV and no zone DNS permission (both return Authentication error code 10000). Blocks (a) creating the FORMS_KV namespace, so wrangler.jsonc still holds PLACEHOLDER_FORMS_KV_ID and production has no real rate-limit counter (T-04-38), and (b) the two proxied CNAMEs for the already-attached custom domains. Fix: add 'Workers KV Storage: Edit' and 'Zone: DNS: Edit' to the token, or do both in the dashboard.
- [Phase 4 / 04-07] The recipient mailbox zlobek@ugstromiec.pl DOES NOT EXIST yet (pending Gmina approval), so the to: leg of every form mail hard-bounces and the BCC backup devzlobekstromiec@gmail.com is the only mailbox receiving submissions. Interim risk: a parent enquiry lands only in the backup Gmail inbox. Do NOT change the hard-coded recipient and do NOT remove the BCC. Re-test once the mailbox exists is a single form submission, zero deploys.
- [Phase 4 / 04-08] **VERIFICATION DEBT — FORM-02 stays UNMARKED.** The CR-01 bucketing fix (window now lives in the KV key: hour of epoch per client, UTC calendar date site-wide) is unit proven with frozen-clock cases crossing both the hour and the UTC date boundary, and the defect shape is confirmed absent from `ratelimit.ts`. Live re-check on the deployed site is only PARTIALLY done (04-UAT.md test 1, `result: skipped`): **part A PASSED** (repeated /kontakt submissions from one device were refused with the correct Polish "Za dużo prób wysyłki" panel on 2026-08-15). **Parts B and C were NOT run** (tester deprioritised on 2026-08-15). Part A is NOT evidence of the fix: the pre-fix build refused inside the bucket too. What is still owed, one human session and zero deploys: (B) from the SAME device, submit once at or after the top of the next clock hour with no site silence in between and confirm it is ACCEPTED, which is the reset the fix exists to provide; (C) on a new UTC date, confirm a fresh `rl:doba:<new-date>` key is used rather than the previous date's counter continuing to climb.
- [Phase 4 / 04-REVIEW WR-01] **Process risk, carried forward.** `tests/forms.unit.ts` is the entire regression proof for the CR-01 rate-limiter fix, and it runs in NO automated gate: `npm run test` is Playwright-only (the `.unit.ts` suffix deliberately dodges the matcher), pre-commit runs only svelte-check + prettier/eslint, and there is no CI workflow. `docs/dev-env.md` still documents the verify gate as `check && lint && test`, omitting `test:unit`. Same finding was raised at `03-REVIEW.md:99-105` and left open. Two mutation-proven corollaries recorded in 04-REVIEW.md: setting `MNOZNIK_TTL = 1` (the original bug shape) leaves all 180 tests green, and swapping `kluczDobowy` to local time still passes at `TZ=Europe/Warsaw`. Worth a small follow-up in Phase 5 or 6.

- [Phase 04.1] CMS requirements are stated as implementation and go stale the moment Sveltia leaves. `REQUIREMENTS.md` CMS-01 reads "log into a git-based CMS (Sveltia) via GitHub OAuth (self-hosted auth Worker)" and is ticked complete; CMS-03 (Polish admin portal) is also ticked despite the English-chrome caveat recorded in the 02-05 decision, which is one of the reasons this phase exists. Both were left untouched by the phase insertion (a phase-op does not edit requirements). Reword them during `/gsd-discuss-phase 04.1` and re-verify them when the phase completes, otherwise the traceability table will claim a Sveltia+GitHub login that no longer exists.
- [Phase 04.1 / 04.1-01] TWO LIVE SERVICES FROM THE OLD EDITOR ARE STILL RUNNING, now orphaned. Sveltia's files are gone from the repo (user-approved early removal, see decisions), but no file deletion can reach either of these: (a) the sveltia-cms-auth Worker is still DEPLOYED on sveltia-cms-auth.devzlobekstromiec.workers.dev and still answering; (b) the GitHub OAuth App still exists in the zlobekstromiec Org and can still authorize access to the PUBLIC repository. Both are Plan 11 Task 3 (dashboard-only: the scoped CLOUDFLARE_API_TOKEN in .envrc has no Workers permission). The OAuth App is now slightly worse than before, because nothing in the tree points at it any more. Delete it sooner than Plan 11 if convenient. Do NOT confuse it with the GitHub App created in Plan 04, which is the new panel's write identity.
- [Phase 04.1 / 04.1-01] STAFF HAVE NO WORKING EDITOR until Plan 10 lands. Direct consequence of the user-approved early Sveltia removal that supersedes D-20. Any urgent content change before then is a developer editing JSON under src/lib/content/ and pushing. Plan 11 must be re-read rather than executed as written: its Task 2 is now largely a no-op, and its ordering prohibition (teardown must not start before the live UAT passes) is already superseded.
- [Phase 04.1 / 04.1-02] A login code has NO backup recipient. Unlike the two public forms there is no BCC, so if delivery to a staff mailbox fails the editor simply cannot log in. The failure is visible (the 'Nie udalo sie wyslac kodu' panel) rather than silent, which is the right trade, but the first live login is also the first proof that send.zlobekstromiec.pl reaches whatever mailbox the editor actually uses. Also owed: the AG-3 second enforced check for the five-attempt cap, which is Plan 03's Playwright case against the real runtime.
- [Phase 04.1 / 04.1-03] LOGIN TIMING PARITY IS NOT PROVEN. The step 1 action defers the Resend send to waitUntil (P-08) but still awaits the KV store, so an address-correlated delta remains: measured locally at about 4.2 ms for an allowlisted address against 3.1 ms for one that is not, ten requests each against wrangler pages dev. Playwright cannot see the real oracle, because PANEL_DRY_RUN short-circuits the send, so tests/admin-auth.spec.ts asserts only the STRUCTURAL property and says so. Plan 10 owes the live response-time distribution comparison, 04.1-VALIDATION.md 'Not Inferable From Unit Tests' item 1. If it shows a usable oracle, defer the KV store as well and give the attempt-cap Playwright case a deterministic wait.
- [Phase 04.1 / 04.1-03] Five panel nav destinations are 404s for a logged-in editor until plans 05 to 09 land: /admin/aktualnosci, /admin/o-nas, /admin/plan-dnia, /admin/dokumenty, /admin/nabor and /admin/pomoc. The nav is required by UI-SPEC Component Contract 1 in full and the paths are the contract's, so this is expected rather than a defect, but nobody should be shown the panel before Plan 09.
- 04.1-04 human-action checkpoint OPEN: the five Cloudflare Pages admin secrets (ADMIN_EMAILS, ADMIN_SESSION_SECRET, GITHUB_APP_CLIENT_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY) are not set and no deployment carries them. Exact commands are in 04.1-04-SUMMARY.md under CHECKPOINT: human-action. Plans 05 to 10 can be built and unit-tested without them, but no live save works until they are set and a NEW deployment is created.
- 04.1-05: pierwszy PRAWDZIWY zapis z panelu na zywym wdrozeniu nie zostal wykonany (zakaz wypychania i wdrazania w tej sesji). CMS-02 udowodnione tylko lokalnie. Kroki w 04.1-05-SUMMARY.md, sekcja CHECKPOINT

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260814-6n1 | Implement new brand logo across header, footer and favicons | 2026-08-14 | f09af5d | [260814-6n1-implement-new-brand-logo-across-header-f](./quick/260814-6n1-implement-new-brand-logo-across-header-f/) |
| 260814-hwf | Rename to official Publiczny Żłobek w Stromcu + corrected logo artwork | 2026-08-14 | 8f8cd8a | [260814-hwf-rename-to-official-publiczny-zlobek-w-st](./quick/260814-hwf-rename-to-official-publiczny-zlobek-w-st/) |

### Roadmap Evolution

- Phase 04.1 inserted after Phase 4: Replace Sveltia with custom Polish CMS (URGENT)

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-16T08:56:54.125Z
Stopped at: Ukonczono 04.1-07-PLAN.md
Resume file: None
