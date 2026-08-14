# Phase 4: Enrollment, Contact & Email Pipeline - Context

**Gathered:** 2026-08-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Parents can read enrollment information on `/rekrutacja` (kryteria + punktacja, procedura, compact fee box), download the wnioski (already hosted in the dokumenty collection), and submit two email-only forms: a light enrollment zgloszenie (waitlist inquiry - nabor 2026/2027 is CLOSED per the regulamin) and a contact message on `/kontakt` (full contact page with static map and directions). Both forms are delivered via Resend (from `send.zlobekstromiec.pl` to `zlobek@ugstromiec.pl`, BCC backup), Turnstile-verified server-side, RODO-compliant (unticked consent + inline klauzula informacyjna), rate-limited, zero storage. The phase ALSO performs a site-wide real-data sweep replacing placeholder facts with confirmed values from `dane-bip-zlobek-stromiec.md`.

**Requirements in scope:** RECRUIT-01, RECRUIT-02, RECRUIT-03, RECRUIT-04, CONTACT-01, CONTACT-02, CONTACT-03, FORM-01, FORM-02.

**Explicitly DESCOPED by user (2026-08-14): RECRUIT-05's CMS-editing side.** No CMS work at all in Phase 4 - V1 ships today without it. Enrollment documents are already staff-manageable via the Phase 2 dokumenty collection (that half of RECRUIT-05 is satisfied); recruitment info/dates stay code-authored in `site.ts`. Roadmap success criterion 5 is amended accordingly.

**Locked upstream - do NOT re-decide:** the full email/DNS spec in ROADMAP.md "Email Sending - Implementation Notes (Phase 4)" (send subdomain, TXT DKIM, MX, SPF, DMARC p=none, From `formularz@send.zlobekstromiec.pl`, sanitized parent Reply-To, hard-coded recipient, Resend EU region); Turnstile verified server-side; zero storage; map = static image only, never a third-party iframe (RODO); Phase 1 design system (`01-UI-SPEC.md` + Amendments v1.1/v1.2/v1.3); Polish-only product; copy rules (no emoji, no em dashes; en dash only in numeric ranges); `recruitmentOpen` is a human-flipped boolean, never a date comparison.

</domain>

<decisions>
## Implementation Decisions

### Enrollment form scope (RECRUIT-03/04)
- **D-01:** The online form is a **light zgloszenie** (expression of interest / lista rezerwowa inquiry), NOT an application channel. The regulamin makes this structural: recruitment is run by the Wojt via the Komisja Rekrutacyjna and wnioski are accepted **wylacznie osobiscie** at Urzad Gminy (ul. Piaski 4, pok. 17, godz. 8:00-15:00) - an online formal application is legally impossible. The formal wniosek stays the downloadable DOC.
- **D-02:** Fields = **minimal set**: parent name; e-mail (required - becomes the sanitized Reply-To); phone (optional); child's birth month/year (age eligibility only - NO child name); free-text message. Smallest possible RODO footprint.
- **D-03:** Klauzula informacyjna = **expandable under each form**: consent-checkbox line (unticked by default) + a collapsed `<details>` "Klauzula informacyjna RODO" directly beneath, full text inline. The klauzula must be AUTHORED this phase (it exists nowhere, confirmed absent from BIP); IOD/koordynator contact is unconfirmed - mark with PLACEHOLDER. Klauzula discloses: email transmission via external processor (Resend, EU region), Cloudflare, and the temporary BCC backup copy (D-11).
- **D-04:** Contact form on /kontakt = **name / e-mail / message** + consent + Turnstile. No topic selector - staff triage by reading at municipal volume.

### Real-data sweep (user-directed, from dane-bip-zlobek-stromiec.md)
- **D-05:** **Site-wide placeholder replacement this phase** using `dane-bip-zlobek-stromiec.md` (repo root) as the source of truth. Its source legend (`[BIP]`/`[KD]`/`[?]`/`[BRAK]`) and section 10 "Czego NIE publikowac bez potwierdzenia" are HARD CONSTRAINTS for downstream agents. Clear-cut `[BIP]` corrections to apply without further approval:
  - Address: **ul. Radomska 72, 26-804 Stromiec** (current "Radomska 5" is fake).
  - Age range: **od ukonczenia 20. tygodnia zycia do 3 lat (wyjatkowo do 4)** per statut - supersedes the earlier "10 mies. - 3 lata" correction, which was itself wrong.
  - Wyzywienie: **max 20 zl/dzien** (current 14 zl is fake).
  - Homepage recruitment steps: the "e-mailem na zlobek@ugstromiec.pl lub przez ePUAP" step is **factually wrong** - rewrite the steps to the real procedure (wniosek do pobrania -> zlozenie OSOBISCIE w Urzedzie Gminy pok. 17 -> weryfikacja przez Komisje -> umowa). Never present the old harmonogram 2026/2027 as current.
  - Official name "Publiczny Zlobek w Stromcu" everywhere (already largely done in quick-260814-hwf; sweep for stragglers).
- **D-06:** **Nabor state = closed + waitlist**: flip `recruitmentOpen = false`. The existing closedStrings ("lista rezerwowa otwarta") take over homepage + /rekrutacja; the zgloszenie form is framed as the waitlist/interest channel. Review closedStrings wording against the regulamin (dzieci nieprzyjete -> lista oczekujaca; kolejne lata -> deklaracja kontynuacji; nastepny nabor wiosna 2027).
- **D-07:** **E-mail: keep `zlobek@ugstromiec.pl`** as both the public contact mailto and the form recipient - explicitly confirmed for this project; the doc's `[BRAK]` refers to a future dedicated zlobek address.
- **D-08:** **Phone: publish 510-094-051** (user decision, overriding the doc's caution). Carry a code comment + launch-gate item: confirm the number is sluzbowy before launch (doc flags it as possibly private to Kamila Dobosz). Remove the fake "48 619 10 25".
- **D-09:** **Fees presentation = 1500 zl + ZUS note**: keyFact shows "1 500 zl/mies." with suffix "mozliwe 0 zl ze swiadczeniem ZUS Aktywnie w zlobku"; wyzywienie max 20 zl/dzien. NEVER an unconditional "0 zl". Placeholder-flagged pending the client's wording confirmation (doc section 3 warning).

### Form UX & failure handling (FORM-01/02)
- **D-10:** **Island + API endpoints**: each form is a hydrated Svelte island that fetch-POSTs to dedicated dynamic endpoints (`/api/rekrutacja`, `/api/kontakt` or equivalent `+server.ts` routes - exact paths planner's call). All pages stay prerendered - matches the locked "only the two form endpoints are dynamic" architecture. Inline client validation; Turnstile widget loads in the island (it requires JS regardless, making the form the site's second island after MobileNav).
- **D-11:** **Success = inline confirmation**: the form swaps in place to a success panel ("Dziekujemy, odpowiemy wkrotce" + what happens next). No extra route.
- **D-12:** **Failure = error + direct fallback**: inline Polish error that keeps ALL typed field values, states plainly the message was NOT sent, and surfaces the direct fallback (phone + mailto) so the parent can still reach the zlobek. Since nothing is stored, a swallowed failure means the application never existed - the error state must never pretend success.
- **D-13:** **Anti-silent-loss = BCC backup mailbox**: every form email BCCs the org-controlled `devzlobekstromiec@gmail.com` until gmina deliverability is proven (early end-to-end delivery test per ROADMAP open item). Klauzula mentions the backup copy (D-03); drop the BCC once delivery to `zlobek@ugstromiec.pl` is proven reliable.

### Page composition (RECRUIT-01/02, CONTACT-01/02)
- **D-14:** **/rekrutacja is status-first**: closed-status banner (lista rezerwowa otwarta) -> zgloszenie form -> kryteria + punktacja table (real 50/20/10-point table from the regulamin) -> procedura (osobiscie, Urzad Gminy pok. 17; odwolanie 7 dni do Wojta; deklaracja kontynuacji) -> wnioski do pobrania (curated from the existing dokumenty collection, Rekrutacja category) -> klauzula.
- **D-15:** **Compact fee box on /rekrutacja**: 1 500 zl/mies. po obnizce, ZUS "Aktywnie w zlobku" moze pokryc calosc (warunek przyznania swiadczenia), wyzywienie max 20 zl/dzien, nieobecnosc zgloszona pierwszego dnia do 8:00 = bez oplat. The full 2337/-837/ZUS breakdown table waits for /cennik (Phase 5).
- **D-16:** **/kontakt is a full page sharing site.ts data**: contact cards (address/phone/email/hours) -> map + directions -> contact form -> an info box making clear that WNIOSKI rekrutacyjne go to Urzad Gminy (ul. Piaski 4, pok. 17), not the zlobek. Homepage ContactAndMap stays as-is; both read `site.ts` so values cannot drift. (Watch the homepage single-mailto acceptance constraint - it applies per-page, /kontakt gets its own mailto.)
- **D-17:** **Map = static OSM snapshot**: a pre-rendered OpenStreetMap image committed as a build-time asset (OSM attribution caption required), pin at ul. Radomska 72, plus an external "Wyznacz trase" link (new-tab safety pattern). **Coords must be re-derived for Radomska 72** - the banked 51.64222, 21.09111 were for the old placeholder address. Also replaces the homepage ContactAndMap placeholder map panel.

### Infrastructure direction (user-stated, cross-phase)
- **D-18:** **Phase 4 stays CMS-free and CMS-agnostic.** The user will later move away from the GitHub org infrastructure and replace Sveltia with a simpler CMS for non-technical staff. Nothing in this phase may deepen Sveltia/GitHub coupling; the form pipeline (SvelteKit endpoints + Resend + Turnstile + site.ts content) survives that migration untouched. The "Ustawienia strony" CMS singleton idea is dead for v1.

### Claude's Discretion
- Exact endpoint route shape (`/api/*` vs co-located `+server.ts`), shared form-handling utilities, Turnstile widget mode (managed vs invisible), email body format (plain text recommended at this volume), rate-limit mechanism and thresholds (Cloudflare-native preferred), honeypot or other cheap extra spam measures.
- Form island implementation details (Svelte 5 runes, progressive enhancement depth) within the locked design system.
- Exact klauzula informacyjna legal text drafting (with PLACEHOLDER markers for IOD/koordynator), based on the RODO requirements in PROJECT.md/ROADMAP.md.
- OSM snapshot generation method and zoom/framing; attribution styling.
- Whether /rekrutacja reuses the homepage Recruitment module pieces or composes fresh sections within the design system.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source data (user-flagged 2026-08-14 - HIGHEST priority for content)
- `dane-bip-zlobek-stromiec.md` (repo root) - THE source of truth for all real facts: identity, oplaty (uchwala XXIII.134.2026), full rekrutacja regulamin digest (kryteria/punktacja/procedura/harmonogram-archiwalny), statut digest, dofinansowanie duties, and the section-10 DO-NOT-PUBLISH list. Its `[BIP]`/`[KD]`/`[?]`/`[BRAK]` legend governs what may ship. Currently untracked - commit it (or a copy under `.planning/`) so downstream agents and CI can read it.

### Email pipeline spec (LOCKED)
- `.planning/ROADMAP.md` §"Email Sending - Implementation Notes (Phase 4)" - authoritative sending spec: identity, exact DNS records, anti-silent-loss, security, RODO. Supersedes point-in-time research notes.
- `.planning/ROADMAP.md` §"Phase 4" - goal + 5 success criteria (criterion 5's CMS clause amended by this context's descope) + §"External Dependencies & Open Items" (gmina allowlist test, Resend DPA/SCC, IOD contact).

### Design contract (LOCKED - inherited)
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` - design system + Amendments v1.1/v1.2/v1.3 (tokens, type, components, WCAG contract, copy rules). Forms must be composed within it; no re-derivation.
- `.planning/DESIGN-BANK.md` - banked homepage facts register + map coords note (coords stale per D-17).

### Stack & research (LOCKED)
- `.planning/research/STACK.md` - SvelteKit 2 + Svelte 5 runes + adapter-cloudflare + Tailwind v4; `platform.env` secret access pattern.
- `.planning/research/PITFALLS.md` - esp. adapter-cloudflare/Functions collision, `import.meta.env` trap, MailChannels-is-dead -> Resend, Turnstile server-side verification.
- `.planning/research/ARCHITECTURE.md` - static prerender + narrow dynamic form seams pattern.

### Project intent
- `.planning/PROJECT.md` - core value, RODO constraints, key decisions table (form pipeline + domain/email split rows).
- `.planning/REQUIREMENTS.md` - RECRUIT-01..05, CONTACT-01..03, FORM-01/02 acceptance wording.

### Live artifacts this phase touches
- `src/lib/content/site.ts` - contact, keyFacts, recruitment strings, `recruitmentOpen` flip (D-06), all real-data corrections (D-05, D-08, D-09).
- `src/lib/components/{Recruitment,ContactAndMap,KeyFacts,Hero}.svelte` - homepage modules receiving corrected data + the real map panel.
- `src/lib/server/dokumenty.ts` + `src/lib/content/dokumenty/` - existing resolver + Rekrutacja-category files for the /rekrutacja downloads section (RECRUIT-02 already substantially served here).
- `svelte.config.js` - remove `/rekrutacja` and `/kontakt` from KNOWN_FUTURE_ROUTES when the routes land; extend CSP for the Turnstile script/frame.
- `src/app.d.ts` + `wrangler.jsonc` - `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` bindings (comment already anticipates them); local `.dev.vars`.
- `tests/*.spec.ts` - per-route Playwright + axe pattern to replicate for /rekrutacja and /kontakt; `tests/home.spec.ts` needs lockstep updates for closed-state strings + corrected facts.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/components/Recruitment.svelte` - open/closed string switching already built (closedStrings exist in site.ts); docs panel already sourced from the dokumenty collection via `+page.server.ts` (D-18 Phase 2).
- `src/lib/components/ContactAndMap.svelte` - contact card grid + map placeholder panel + directions link pattern; homepage's single mailto lives here.
- `src/lib/server/dokumenty.ts` - build-time file metadata resolver; /rekrutacja's download rows reuse it (names/meta/hrefs cannot drift from /dokumenty).
- `Seo`, `Cta`, `Wave`, `SkipLink`, chrome components - direct reuse on both new pages.
- `src/routes/+error.svelte` - friendly Polish 404 already site-wide.
- `tests/` Playwright + axe per-route suite - pattern for the two new routes.

### Established Patterns
- Prerendered zero-JS content routes; hydrated islands are the exception (MobileNav; the form islands become #2 and #3).
- Tailwind v4 `@theme` tokens in `src/app.css`; two-tier palette; PLACEHOLDER comment convention (Phase 6 grep gate).
- Secrets via `event.platform.env.*` (never `import.meta.env`); wrangler types generates `Env`.
- Copy rules: no emoji, no em dashes (en dash only in numeric ranges); verbatim core message byte-exempt.

### Integration Points
- `svelte.config.js` KNOWN_FUTURE_ROUTES: `/rekrutacja` and `/kontakt` come OUT (crawler then enforces them); `/cennik` stays until Phase 5.
- CSP (`kit.csp` + `_headers`): Turnstile needs `challenges.cloudflare.com` in script-src + frame-src; the form endpoints are exempt from prerender.
- Hero secondary CTA "Zadzwon do nas" -> /kontakt and nav links become real (known-future 404s resolve).
- Cloudflare: RESEND_API_KEY + TURNSTILE_SECRET_KEY as Pages secrets; Turnstile site key public; DNS records per ROADMAP spec on `zlobekstromiec.pl` (we control it; domain purchase status must be verified - Phase 1 deferred note said NOT yet purchased).

</code_context>

<specifics>
## Specific Ideas

- **"V1 out today"** - the user wants this phase shipped same-day; prefer the simplest compliant implementation at every discretion point.
- **The zgloszenie form is honest about its role**: it cannot submit a formal application (regulamin: wylacznie osobiscie w Urzedzie Gminy) - copy must frame it as zgloszenie zainteresowania / lista rezerwowa, with the real procedure explained beside it.
- **dane-bip doc governs publishability**: anything marked `[?]`/`[BRAK]` or on the section-10 list may not ship as fact (exception: phone 510-094-051, published by explicit user decision D-08 with a launch-gate caveat).
- **Two open-date ambiguity**: never publish 14.08 or 01.09 as "data otwarcia" without confirmation (doc section 1 note).

</specifics>

<deferred>
## Deferred Ideas

- **CMS editability for recruitment info / contact / keyFacts** ("Ustawienia strony" singleton) - explicitly killed for v1 by the user; superseded by the planned CMS replacement (D-18).
- **CMS platform migration** - Sveltia + GitHub org infra to be replaced with a simpler non-technical CMS; future milestone, keep Phase 4 code CMS-agnostic.
- **EU funding marking (dofinansowanie)** - KPO/FERS/NextGenerationEU logo strip + klauzula "Dofinansowane przez Unie Europejska - NextGenerationEU" is REQUIRED on the site, but logos/amounts are `[BRAK]` - obtain from Urzad Gminy; land with Phase 6 launch gate (or earlier if assets arrive).
- **DOC/DOCX -> PDF conversion** of the wnioski (accessibility warning in dane-bip doc section 5) - client/launch decision, Phase 6.
- **Resend bounce/delivery webhook alerting** - the proper long-term anti-silent-loss answer once there is somewhere for alerts to go; v1 uses the BCC (D-13).
- **Confirm 510-094-051 is sluzbowy** - launch-gate item (D-08 caveat).
- **Fee wording confirmation** ("0 zl" conditional phrasing) - client survey question 1; keyFact placeholder-flagged until then (D-09).
- **Statut-vs-regulamin eligibility discrepancy** (zatrudnienie w gminie vs zamieszkanie) - survey question 26; do not publish the zatrudnienie criterion as fact until resolved.
- **/cennik full fee breakdown page** - Phase 5 (compact box on /rekrutacja until then).

</deferred>

---

*Phase: 4-enrollment-contact-email-pipeline*
*Context gathered: 2026-08-14*
