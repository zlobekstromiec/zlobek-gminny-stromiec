# Phase 4: Enrollment, Contact & Email Pipeline - Research

**Researched:** 2026-08-14
**Domain:** Prerendered SvelteKit site on Cloudflare Pages with two narrow dynamic form seams (Turnstile-gated, Resend-delivered, zero-storage), plus a site-wide real-data content sweep
**Confidence:** MEDIUM-HIGH (platform/API facts MEDIUM from official docs; codebase facts HIGH from direct inspection; two hard external blockers found)

## Summary

This phase is architecturally small and compliance-heavy. The code surface is two `+server.ts` POST endpoints, one shared mailer/validator module, two form islands, two new prerendered routes, one static map asset, and a content sweep of `site.ts`. **Zero new npm dependencies are required**: Resend is a single `fetch` to a JSON API, Turnstile is a 2 KB CDN script plus one `fetch` to `siteverify`, hashing is Web Crypto (built into the Workers runtime), and the map is a committed image processed by the already-installed `@sveltejs/enhanced-img`. Adding the `resend` SDK would pull two transitive dependencies (`postal-mime`, `standardwebhooks`) for a call that is eleven lines of `fetch`.

Two findings materially change the locked plan and need a decision before the pipeline can be verified end to end. **First: `zlobekstromiec.pl` is registered but its DNS is delegated to `dns.home.pl` / `dns2.home.pl` / `dns3.home.pl`, not Cloudflare, and the zone is completely empty** (no A, MX, TXT, SPF or DMARC records; `send.` and `_dmarc.` both NXDOMAIN). CLAUDE.md says the domain is "NOT purchased yet" and STATE.md says "DNS on Cloudflare, we control it" - both are wrong, in opposite directions. Resend does not care who hosts the DNS, so the fastest same-day path is to add the Resend TXT/MX records in the home.pl panel rather than migrate nameservers first. **Second: Resend's region setting does not do what the ROADMAP assumes.** Resend's own documentation states that region controls only where mail is routed and dispatched, and that all account data, metadata, logs and API records are stored in the United States regardless, with email data retained roughly 30 days. "Zero storage" is therefore true of our infrastructure only; a copy of every enrollment submission sits in a US-hosted Resend dashboard for 30 days. The klauzula informacyjna must disclose this, and SCCs are needed for a US transfer, not just an EU DPA.

A third finding constrains the spam design: **the Cloudflare Rate Limiting binding is not available on Pages Functions**, and free-plan WAF rate limiting rules give one rule with a 10-second window and require a Cloudflare zone the project does not have while it lives on `*.pages.dev`. Rate limiting must therefore be written in endpoint code, and KV is the only Cloudflare-native persistence Pages Functions support. The correct ordering is cheap-checks first (honeypot, dwell time, field caps), then Turnstile `siteverify`, then a KV counter immediately before the Resend call, so the KV write budget (1,000/day free) is spent only on human-verified submissions and the counter's job is to cap the thing that actually costs money and reputation: the Resend 100/day quota.

**Primary recommendation:** Build two `export const prerender = false` POST endpoints sharing one `src/lib/server/forms/` module (validate -> honeypot/dwell -> Turnstile siteverify -> KV rate limit -> Resend fetch -> typed JSON result), keep every page prerendered, add zero npm dependencies, resolve the DNS-ownership question before writing any DNS task, and treat the Resend US-retention fact as a required klauzula disclosure rather than a footnote.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Phase boundary.** Parents can read enrollment information on `/rekrutacja` (kryteria + punktacja, procedura, compact fee box), download the wnioski (already hosted in the dokumenty collection), and submit two email-only forms: a light enrollment zgloszenie (waitlist inquiry, nabor 2026/2027 is CLOSED per the regulamin) and a contact message on `/kontakt` (full contact page with static map and directions). Both forms are delivered via Resend (from `send.zlobekstromiec.pl` to `zlobek@ugstromiec.pl`, BCC backup), Turnstile-verified server-side, RODO-compliant (unticked consent + inline klauzula informacyjna), rate-limited, zero storage. The phase ALSO performs a site-wide real-data sweep replacing placeholder facts with confirmed values from `dane-bip-zlobek-stromiec.md`.

**Requirements in scope:** RECRUIT-01, RECRUIT-02, RECRUIT-03, RECRUIT-04, CONTACT-01, CONTACT-02, CONTACT-03, FORM-01, FORM-02.

**Explicitly DESCOPED by user (2026-08-14): RECRUIT-05's CMS-editing side.** No CMS work at all in Phase 4; V1 ships today without it. Enrollment documents are already staff-manageable via the Phase 2 dokumenty collection (that half of RECRUIT-05 is satisfied); recruitment info/dates stay code-authored in `site.ts`. Roadmap success criterion 5 is amended accordingly.

**Locked upstream, do NOT re-decide:** the full email/DNS spec in ROADMAP.md "Email Sending - Implementation Notes (Phase 4)" (send subdomain, TXT DKIM, MX, SPF, DMARC p=none, From `formularz@send.zlobekstromiec.pl`, sanitized parent Reply-To, hard-coded recipient, Resend EU region); Turnstile verified server-side; zero storage; map = static image only, never a third-party iframe (RODO); Phase 1 design system (`01-UI-SPEC.md` + Amendments v1.1/v1.2/v1.3); Polish-only product; copy rules (no emoji, no em dashes; en dash only in numeric ranges); `recruitmentOpen` is a human-flipped boolean, never a date comparison.

**Enrollment form scope (RECRUIT-03/04)**
- **D-01:** The online form is a **light zgloszenie** (expression of interest / lista rezerwowa inquiry), NOT an application channel. The regulamin makes this structural: recruitment is run by the Wojt via the Komisja Rekrutacyjna and wnioski are accepted **wylacznie osobiscie** at Urzad Gminy (ul. Piaski 4, pok. 17, godz. 8:00-15:00), so an online formal application is legally impossible. The formal wniosek stays the downloadable DOC.
- **D-02:** Fields = **minimal set**: parent name; e-mail (required, becomes the sanitized Reply-To); phone (optional); child's birth month/year (age eligibility only, NO child name); free-text message. Smallest possible RODO footprint.
- **D-03:** Klauzula informacyjna = **expandable under each form**: consent-checkbox line (unticked by default) + a collapsed `<details>` "Klauzula informacyjna RODO" directly beneath, full text inline. The klauzula must be AUTHORED this phase (it exists nowhere, confirmed absent from BIP); IOD/koordynator contact is unconfirmed, mark with PLACEHOLDER. Klauzula discloses: email transmission via external processor (Resend, EU region), Cloudflare, and the temporary BCC backup copy (D-11).
- **D-04:** Contact form on /kontakt = **name / e-mail / message** + consent + Turnstile. No topic selector; staff triage by reading at municipal volume.

**Real-data sweep (user-directed, from dane-bip-zlobek-stromiec.md)**
- **D-05:** **Site-wide placeholder replacement this phase** using `dane-bip-zlobek-stromiec.md` (repo root) as the source of truth. Its source legend (`[BIP]`/`[KD]`/`[?]`/`[BRAK]`) and section 10 "Czego NIE publikowac bez potwierdzenia" are HARD CONSTRAINTS for downstream agents. Clear-cut `[BIP]` corrections to apply without further approval:
  - Address: **ul. Radomska 72, 26-804 Stromiec** (current "Radomska 5" is fake).
  - Age range: **od ukonczenia 20. tygodnia zycia do 3 lat (wyjatkowo do 4)** per statut, supersedes the earlier "10 mies. - 3 lata" correction, which was itself wrong.
  - Wyzywienie: **max 20 zl/dzien** (current 14 zl is fake).
  - Homepage recruitment steps: the "e-mailem na zlobek@ugstromiec.pl lub przez ePUAP" step is **factually wrong**, rewrite the steps to the real procedure (wniosek do pobrania -> zlozenie OSOBISCIE w Urzedzie Gminy pok. 17 -> weryfikacja przez Komisje -> umowa). Never present the old harmonogram 2026/2027 as current.
  - Official name "Publiczny Zlobek w Stromcu" everywhere (already largely done in quick-260814-hwf; sweep for stragglers).
- **D-06:** **Nabor state = closed + waitlist**: flip `recruitmentOpen = false`. The existing closedStrings ("lista rezerwowa otwarta") take over homepage + /rekrutacja; the zgloszenie form is framed as the waitlist/interest channel. Review closedStrings wording against the regulamin (dzieci nieprzyjete -> lista oczekujaca; kolejne lata -> deklaracja kontynuacji; nastepny nabor wiosna 2027).
- **D-07:** **E-mail: keep `zlobek@ugstromiec.pl`** as both the public contact mailto and the form recipient, explicitly confirmed for this project; the doc's `[BRAK]` refers to a future dedicated zlobek address.
- **D-08:** **Phone: publish 510-094-051** (user decision, overriding the doc's caution). Carry a code comment + launch-gate item: confirm the number is sluzbowy before launch (doc flags it as possibly private to Kamila Dobosz). Remove the fake "48 619 10 25".
- **D-09:** **Fees presentation = 1500 zl + ZUS note**: keyFact shows "1 500 zl/mies." with suffix "mozliwe 0 zl ze swiadczeniem ZUS Aktywnie w zlobku"; wyzywienie max 20 zl/dzien. NEVER an unconditional "0 zl". Placeholder-flagged pending the client's wording confirmation (doc section 3 warning).

**Form UX & failure handling (FORM-01/02)**
- **D-10:** **Island + API endpoints**: each form is a hydrated Svelte island that fetch-POSTs to dedicated dynamic endpoints (`/api/rekrutacja`, `/api/kontakt` or equivalent `+server.ts` routes, exact paths planner's call). All pages stay prerendered, matching the locked "only the two form endpoints are dynamic" architecture. Inline client validation; Turnstile widget loads in the island (it requires JS regardless, making the form the site's second island after MobileNav).
- **D-11:** **Success = inline confirmation**: the form swaps in place to a success panel ("Dziekujemy, odpowiemy wkrotce" + what happens next). No extra route.
- **D-12:** **Failure = error + direct fallback**: inline Polish error that keeps ALL typed field values, states plainly the message was NOT sent, and surfaces the direct fallback (phone + mailto) so the parent can still reach the zlobek. Since nothing is stored, a swallowed failure means the application never existed; the error state must never pretend success.
- **D-13:** **Anti-silent-loss = BCC backup mailbox**: every form email BCCs the org-controlled `devzlobekstromiec@gmail.com` until gmina deliverability is proven (early end-to-end delivery test per ROADMAP open item). Klauzula mentions the backup copy (D-03); drop the BCC once delivery to `zlobek@ugstromiec.pl` is proven reliable.

**Page composition (RECRUIT-01/02, CONTACT-01/02)**
- **D-14:** **/rekrutacja is status-first**: closed-status banner (lista rezerwowa otwarta) -> zgloszenie form -> kryteria + punktacja table (real 50/20/10-point table from the regulamin) -> procedura (osobiscie, Urzad Gminy pok. 17; odwolanie 7 dni do Wojta; deklaracja kontynuacji) -> wnioski do pobrania (curated from the existing dokumenty collection, Rekrutacja category) -> klauzula.
- **D-15:** **Compact fee box on /rekrutacja**: 1 500 zl/mies. po obnizce, ZUS "Aktywnie w zlobku" moze pokryc calosc (warunek przyznania swiadczenia), wyzywienie max 20 zl/dzien, nieobecnosc zgloszona pierwszego dnia do 8:00 = bez oplat. The full 2337/-837/ZUS breakdown table waits for /cennik (Phase 5).
- **D-16:** **/kontakt is a full page sharing site.ts data**: contact cards (address/phone/email/hours) -> map + directions -> contact form -> an info box making clear that WNIOSKI rekrutacyjne go to Urzad Gminy (ul. Piaski 4, pok. 17), not the zlobek. Homepage ContactAndMap stays as-is; both read `site.ts` so values cannot drift. (Watch the homepage single-mailto acceptance constraint, it applies per-page, /kontakt gets its own mailto.)
- **D-17:** **Map = static OSM snapshot**: a pre-rendered OpenStreetMap image committed as a build-time asset (OSM attribution caption required), pin at ul. Radomska 72, plus an external "Wyznacz trase" link (new-tab safety pattern). **Coords must be re-derived for Radomska 72**, the banked 51.64222, 21.09111 were for the old placeholder address. Also replaces the homepage ContactAndMap placeholder map panel.

**Infrastructure direction (user-stated, cross-phase)**
- **D-18:** **Phase 4 stays CMS-free and CMS-agnostic.** The user will later move away from the GitHub org infrastructure and replace Sveltia with a simpler CMS for non-technical staff. Nothing in this phase may deepen Sveltia/GitHub coupling; the form pipeline (SvelteKit endpoints + Resend + Turnstile + site.ts content) survives that migration untouched. The "Ustawienia strony" CMS singleton idea is dead for v1.

### Claude's Discretion

- Exact endpoint route shape (`/api/*` vs co-located `+server.ts`), shared form-handling utilities, Turnstile widget mode (managed vs invisible), email body format (plain text recommended at this volume), rate-limit mechanism and thresholds (Cloudflare-native preferred), honeypot or other cheap extra spam measures.
- Form island implementation details (Svelte 5 runes, progressive enhancement depth) within the locked design system.
- Exact klauzula informacyjna legal text drafting (with PLACEHOLDER markers for IOD/koordynator), based on the RODO requirements in PROJECT.md/ROADMAP.md.
- OSM snapshot generation method and zoom/framing; attribution styling.
- Whether /rekrutacja reuses the homepage Recruitment module pieces or composes fresh sections within the design system.

### Deferred Ideas (OUT OF SCOPE)

- **CMS editability for recruitment info / contact / keyFacts** ("Ustawienia strony" singleton), explicitly killed for v1 by the user; superseded by the planned CMS replacement (D-18).
- **CMS platform migration**, Sveltia + GitHub org infra to be replaced with a simpler non-technical CMS; future milestone, keep Phase 4 code CMS-agnostic.
- **EU funding marking (dofinansowanie)**, KPO/FERS/NextGenerationEU logo strip + klauzula "Dofinansowane przez Unie Europejska - NextGenerationEU" is REQUIRED on the site, but logos/amounts are `[BRAK]`, obtain from Urzad Gminy; land with Phase 6 launch gate (or earlier if assets arrive).
- **DOC/DOCX -> PDF conversion** of the wnioski (accessibility warning in dane-bip doc section 5), client/launch decision, Phase 6.
- **Resend bounce/delivery webhook alerting**, the proper long-term anti-silent-loss answer once there is somewhere for alerts to go; v1 uses the BCC (D-13).
- **Confirm 510-094-051 is sluzbowy**, launch-gate item (D-08 caveat).
- **Fee wording confirmation** ("0 zl" conditional phrasing), client survey question 1; keyFact placeholder-flagged until then (D-09).
- **Statut-vs-regulamin eligibility discrepancy** (zatrudnienie w gminie vs zamieszkanie), survey question 26; do not publish the zatrudnienie criterion as fact until resolved.
- **/cennik full fee breakdown page**, Phase 5 (compact box on /rekrutacja until then).
- **Opening-event photos from UG Stromiec**, the echodnia gallery photos are "fot. UG Stromiec": ask Urzad Gminy for the originals + written permission. Phase 5/6.
- **Aktualnosci post about the opening + dzien otwarty 19.08**, a staff CMS content edit, not Phase 4 code.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RECRUIT-01 | A visitor can read enrollment information (harmonogram, kryteria, zasady) | D-14 page composition + the full regulamin digest in `dane-bip-zlobek-stromiec.md` §4 (kryteria/punktacja table, procedura, harmonogram marked archival). Content is code-authored in `site.ts` (D-18, no CMS). Note the harmonogram must NOT ship as current (dane-bip §10.3), so "harmonogram" is satisfied by the closed-nabor status + "nastepny nabor wiosna 2027". |
| RECRUIT-02 | A visitor can download the PDF enrollment forms (wnioski) | Reuse `src/lib/server/dokumenty.ts` (verified present, build-time `statSync` meta resolver) filtered to `kategoria === 'rekrutacja'`, exactly as the homepage `+page.server.ts` already does. **Gap found:** only 3 files exist in `static/dokumenty/` while BIP lists 9 (wniosek + 6 zalaczniki + rezygnacja). See Open Question 3. |
| RECRUIT-03 | A visitor can submit an online enrollment application that is emailed to the zlobek (no storage) | `+server.ts` POST endpoint pattern (§Architecture Patterns 1-3), Resend `fetch` call (§Code Examples 4), zero-storage discipline (§Don't Hand-Roll, §Security Domain). Scope narrowed to a zgloszenie by D-01. |
| RECRUIT-04 | The enrollment form requires explicit RODO consent, shows the klauzula informacyjna, and is spam-protected (Turnstile) | Turnstile explicit-render widget + mandatory `siteverify` (§Code Examples 2-3), CSP directives (§Pitfall 2), Art. 13 klauzula element checklist (§Security Domain), unticked-by-default checkbox rejected server-side if absent. |
| CONTACT-01 | A visitor can see contact details (address, phone, email, opening hours) | `src/lib/content/site.ts` `contact` object is the single source, already consumed by `ContactAndMap.svelte`; D-16 has /kontakt read the same object. Real values in §Real-Data Sweep Map. |
| CONTACT-02 | A visitor can see the location on a map with directions (mapa dojazdu) | Static OSM snapshot + attribution (§Architecture Pattern 6). **Coordinate finding:** Radomska 72 has no OSM address point; the street centroid is 51.63820, 21.08571 and the banked coords are ~580 m off (§Open Question 2). |
| CONTACT-03 | A visitor can submit a contact form that is emailed to the zlobek (RODO consent + Turnstile, no storage) | Same pipeline as RECRUIT-03/04, second endpoint, shared server module. Fields per D-04. |
| FORM-01 | Form submissions are delivered by email via a Cloudflare function + Resend, from `zlobekstromiec.pl`, delivered to `zlobek@ugstromiec.pl`, with no database | Resend HTTP API via `fetch` (no SDK needed), `platform.env.RESEND_API_KEY`. **Blocked on DNS:** the zone is on home.pl nameservers and empty (§Open Question 1, §Environment Availability). |
| FORM-02 | The email endpoint verifies Turnstile server-side, sends only to the fixed hard-coded zlobek address, and rate-limits abuse | `siteverify` is mandatory and non-negotiable (§Code Examples 3); recipient is a module-level `const`, never request-derived. **Rate-limit finding:** the Cloudflare rate limiting binding is unavailable on Pages Functions, so a KV counter is the Cloudflare-native answer (§Architecture Pattern 4). |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Enrollment / contact page content (kryteria, procedura, oplaty, kontakt) | Build-time static (prerender) | - | Content is code-authored in `site.ts` and never changes per-request. Prerendering is already the site-wide default via `src/routes/+layout.ts`. |
| Wnioski download list | Build-time static (prerender) | Filesystem at build | `readDokumenty()` runs `statSync` during the build; the files are served as plain static assets from `static/dokumenty/`. No runtime tier involved. |
| Form markup + inline validation + Turnstile widget | Browser (hydrated island) | - | Turnstile requires JS in the browser regardless; client validation is UX only and is never trusted. |
| Turnstile token verification | API / Pages Function | - | The secret key must never reach the browser. Client-only verification is trivially bypassed (Cloudflare docs call server verification mandatory). |
| Consent, field, and length validation (authoritative) | API / Pages Function | Browser (advisory copy) | The browser copy exists to help the parent; the endpoint is the enforcement boundary. |
| Rate limiting / abuse control | API / Pages Function + Workers KV | Cloudflare WAF (post-custom-domain) | The rate limiting *binding* is unsupported on Pages Functions and WAF rules need a zone. KV is the only supported Cloudflare-native state on this tier. |
| Email delivery | External processor (Resend) | API / Pages Function (caller) | Sending is Resend's job; the Function's job is to construct a sanitized payload, hard-code the recipient, and report success or failure truthfully. |
| Submission persistence | **NONE (by design)** | - | RODO data minimization + no-DB decision. Any tier that stores a submission is a defect. Resend's own 30-day retention is an external-processor fact to disclose, not a design choice. |
| Map rendering | Build-time static asset | Browser (`<img>` only) | A third-party map iframe is forbidden (RODO, locked). The image is generated once, committed, and processed by `@sveltejs/enhanced-img`. |
| Directions | External site (new tab) | - | Deep link out; no embedded third party, no data leak on page load. |

## Project Constraints (from CLAUDE.md)

Actionable directives extracted from `./.claude/CLAUDE.md` and `~/.claude/CLAUDE.md`. The planner must verify each plan complies.

| # | Directive | Where it bites in Phase 4 |
|---|-----------|---------------------------|
| C-01 | **Polish only** for all visitor-facing text (SITE-06) | Every label, hint, error message, success panel, and klauzula. Error strings returned by the endpoint must be Polish or mapped to Polish client-side. |
| C-02 | **WCAG 2.1 AA**, AA contrast, keyboard operable, visible focus, `prefers-reduced-motion` | Forms are the highest-risk a11y surface in the project so far: labels, `aria-describedby` error wiring, `aria-live` status region, fieldset/legend, error identification (WCAG 3.3.1), and error suggestion (3.3.3). Red must never be the only error signal (1.4.1). |
| C-03 | **RODO**: unticked consent + klauzula informacyjna; **no database, no storage, no logging** of submissions | Bans `console.log` of any request body or field, bans KV/D1 writes of submission content, bans error trackers capturing bodies. The KV rate-limit value must be a counter only, never content. |
| C-04 | **Near-zero cost**, free tiers only | Resend free 100/day, KV free 1,000 writes/day, Turnstile free. Rules out Durable Objects-heavy designs and any paid Cloudflare plan for WAF rate limiting. |
| C-05 | **adapter-cloudflare:** SvelteKit server routes ARE the Pages Functions; do NOT hand-author a `/functions` dir | The two endpoints are `+server.ts` files under `src/routes/`. Creating `/functions` would collide. |
| C-06 | Read secrets via `event.platform.env.*`, **never** `import.meta.env` | `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` come from `platform.env`. The Turnstile **site** key is public and may be a build-time constant or a public env var. |
| C-07 | **Tailwind v4:** CSS-first `@theme{}` in `app.css`, there is no `tailwind.config.js` | Any new form tokens go in `src/app.css`. Verified: no `tailwind.config.js` exists. |
| C-08 | **Palette:** two-tier tokens, never bright yellow/orange on text; follow `01-UI-SPEC.md`, do not re-derive | Form inputs use `--color-border-strong` (#64748B, 4.76:1); errors use `--color-danger` (#B91C1C, 6.47:1) on `--color-danger-surface`. Both already exist in `app.css`. |
| C-09 | **Email:** Resend from a verified sending domain; parent's address in `reply-to`, never `from`; recipient hard-coded `zlobek@ugstromiec.pl` | Non-negotiable. Also see §Pitfall 1 (header injection) for how the reply-to must be sanitized. |
| C-10 | **Content:** placeholder-first, greppable `PLACEHOLDER` token | The klauzula's IOD contact, the fee wording, and the map coordinates all stay PLACEHOLDER-marked (Phase 6 grep gate). |
| C-11 | **Copy rules** (from MEMORY.md, reinforced in UI-SPEC v1.2 §8): no emoji, no em dashes anywhere; en dash only in numeric ranges; bespoke SVG icons | Applies to all new Polish copy including endpoint error strings and the klauzula text. The klauzula is long prose, which is exactly where an em dash slips in. |
| C-12 | **Verify before commit:** `npm run check && npm run lint && npm run test` | Note `npm run check` runs `wrangler types --check` first, so `wrangler.jsonc` must stay valid when KV/secrets are added. |
| C-13 | Node pinned to **22.23.2** via asdf (`.tool-versions`); local shell has Node 25.9.0 | `npm run test:unit` uses the built-in `node --test`; run under the pinned version to match CI/build behaviour. |
| C-14 | Route file-changing work through GSD; don't make direct repo edits outside a GSD workflow | Process constraint on execution, not on design. |

**No project skills directory exists** (`.claude/skills/` and `.agents/skills/` both absent), so there are no additional skill rules to honor.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit `+server.ts` endpoint | 2.63.0 (installed) | The two dynamic form seams | The only mechanism that keeps every page prerendered while making a single route dynamic. Form actions live in `+page.server.ts` and would force `/rekrutacja` and `/kontakt` to become dynamic, breaking the locked architecture. [CITED: svelte.dev/docs/kit/page-options] |
| Global `fetch` -> `https://api.resend.com/emails` | n/a (Workers runtime built-in) | Send the two form emails | Resend's own docs show the raw `fetch` + Bearer pattern as a first-class integration. Zero dependencies, zero supply chain, ~11 lines. [CITED: resend.com/docs/llms-full.txt] |
| Cloudflare Turnstile `api.js` (CDN) + `siteverify` | n/a (platform) | Bot protection on both forms | Free, unlimited, no reCAPTCHA data-sharing (relevant under RODO). Server verification is mandatory per Cloudflare. [CITED: developers.cloudflare.com/turnstile/get-started/server-side-validation] |
| Workers KV binding | n/a (platform, config-only) | Rate-limit counters (hashed key -> integer, TTL) | The ONLY Cloudflare-native persistence supported by Pages Functions that fits a counter. [CITED: developers.cloudflare.com/pages/functions/bindings] |
| Web Crypto `crypto.subtle` / `crypto.randomUUID()` | n/a (Workers runtime built-in) | Hash the client IP for the rate-limit key; generate the Turnstile `idempotency_key` | Available in the Workers runtime without import. Keeps raw IPs out of KV (RODO minimization). |
| `@sveltejs/enhanced-img` | 0.11.0 (installed, exact-pinned) | Process the committed static map image | Already wired into the build (Phase 2 `02-01`). Reusing it keeps the map on the same responsive/AVIF pipeline as the hero. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` + `@axe-core/playwright` | 1.62.1 / 4.13.0 (installed) | Per-route acceptance + WCAG scan for `/rekrutacja` and `/kontakt` | Replicate the `tests/dokumenty.spec.ts` pattern. The `webServer` already runs `wrangler pages dev`, so the real endpoints are reachable from tests. |
| `node --test` (`npm run test:unit`) | Node 22.23.2 built-in | Unit-test the validator/sanitizer/payload builder | Precedent set by `tests/aktualnosci-reader.unit.ts`. Pure functions with no network are the right unit-test target here. |
| `svelte-check` (`npm run check`) | 4.6.0 (installed) | Type + a11y diagnostics on the new form components | Svelte's compiler catches missing form-label associations at build time. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw `fetch` to Resend | `resend` npm SDK 6.20.0 | Adds 2 transitive deps (`postal-mime`, `standardwebhooks`) and a supply-chain surface, and the legitimacy check flags the freshly-published version as `SUS: too-new`. Buys typed params and `.emails.send()` ergonomics. **Not worth it for one POST.** Reconsider only if webhooks (deferred) land. |
| Hand-loaded Turnstile script | A `svelte-turnstile` wrapper package | Saves ~20 lines, costs a dependency on a small third-party package for a widget whose entire API is `turnstile.render()` / `turnstile.reset()`. **Rejected** on C-04 minimalism and D-18 durability. |
| KV counter | Cloudflare Rate Limiting binding (`ratelimits[]`) | **Not an option**: not in the Pages Functions supported-binding list. |
| KV counter | Cloudflare WAF Rate Limiting Rule | Free plan allows 1 rule, Path/Verified-Bot fields only, 10 s counting period and 10 s mitigation timeout, and requires a Cloudflare zone. Unusable on `*.pages.dev`. **Worth adding later** as defense-in-depth once the custom domain is on Cloudflare. |
| KV counter | Durable Object counter | Strictly consistent and unlimited writes, but more moving parts on a "V1 out today" phase and a heavier binding to carry through the planned CMS/infra migration (D-18). |
| `+server.ts` endpoints | SvelteKit form actions with `use:enhance` | Would give a no-JS fallback for free, but forces `/rekrutacja` and `/kontakt` to be dynamic, violating the locked "only the two form endpoints are dynamic" architecture. Turnstile needs JS anyway, so the no-JS benefit is illusory. **Rejected.** |
| Static OSM snapshot | Embedded Leaflet / MapLibre | Adds a JS map library plus runtime tile requests to a third party on page load. Forbidden by the locked RODO decision (map = static image only). |

**Installation:**
```bash
# No npm install required for this phase.
# Platform configuration only:
#  1. Cloudflare Pages secrets: RESEND_API_KEY, TURNSTILE_SECRET_KEY
#  2. wrangler.jsonc: add a kv_namespaces entry for the rate-limit counter
#  3. .dev.vars (gitignored) for local + Playwright runs
```

**Version verification:** `npm view resend version` -> `6.20.0`, published 2026-08-13, 9,569,860 weekly downloads, repo `github.com/resend/resend-node`, no `postinstall` script. [VERIFIED: npm registry] Documented only because it is the alternative we are declining, not because it is being installed.

## Package Legitimacy Audit

**No external packages are installed by this phase.** The audit below covers the one package that was evaluated and rejected, so the planner has the evidence if it reconsiders.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `resend` | npm | latest version published 2026-08-13 (1 day) | 9.57M/wk | github.com/resend/resend-node | **SUS** (`too-new`) | **NOT INSTALLED.** Rejected in favour of a zero-dependency `fetch`. The `SUS` verdict is a version-recency artifact, not a legitimacy signal (9.57M weekly downloads, official Resend org repo, no postinstall). If the planner overrides this recommendation, gate the install behind a `checkpoint:human-verify` task. |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `resend` (not installed; see above)

*No package name in this research was sourced from WebSearch or training data alone. `resend` was discovered in the project's own `.planning/research/STACK.md` and confirmed against the npm registry and Resend's official docs.*

## Architecture Patterns

### System Architecture Diagram

```
 BUILD TIME                                          RUNTIME (per submission)
 ==========                                          =========================

 site.ts (facts, recruitment                              Parent's browser
 strings, contact, closedStrings)                                |
        |                                            [1] loads prerendered
        |                                                /rekrutacja or /kontakt
 dokumenty/*.json ---> readDokumenty()                          |  (zero JS for
        |              (statSync meta)                          |   the content)
        |                    |                                  v
 static/dokumenty/*  --------+                        [2] form island hydrates
        |                    |                                  |
 map snapshot (.png/.webp)   |                        [3] api.js from
        |                    |                            challenges.cloudflare.com
        v                    v                            renders Turnstile iframe
   +--------------------------------+                            |
   |  SvelteKit prerender crawler   |                            v
   |  (+layout.ts prerender = true) |                   [4] parent fills + ticks
   +--------------------------------+                       consent, submits
                |                                                |
                v                                       fetch POST (JSON) same-origin
   .svelte-kit/cloudflare/                                       |
     static HTML + assets  ------------------------> Cloudflare  v
     _worker.js (the 2 endpoints only)                edge  +--------------------------+
                                                            | +server.ts POST handler  |
                                                            |  prerender = false       |
                                                            +--------------------------+
                                                                       |
                        (a) shape + length + consent + honeypot + dwell check
                                       | reject -> 400 {ok:false, code}
                                       v
                        (b) POST siteverify -----------------> challenges.cloudflare.com
                                       |  <-- {success, error-codes}     (secret key)
                                       | reject -> 400 {ok:false,'turnstile'}
                                       v
                        (c) KV counter: hash(IP+salt) --------> Workers KV
                                       |  read, compare, write w/ expirationTtl
                                       | over limit -> 429 {ok:false,'rate'}
                                       v
                        (d) build plain-text payload
                            from  = formularz@send.zlobekstromiec.pl   (const)
                            to    = zlobek@ugstromiec.pl               (const)
                            bcc   = devzlobekstromiec@gmail.com        (const, temp)
                            reply_to = sanitized parent e-mail
                            subject  = STATIC Polish string (never user data)
                                       |
                                       v
                        (e) POST https://api.resend.com/emails ------> Resend
                                       |  Bearer platform.env.RESEND_API_KEY
                                       |  (EU send region; US-hosted logs, 30d)
                       non-2xx --------+-------- 2xx                        |
                            |                     |                         v
                            v                     v              zlobek@ugstromiec.pl
                  502 {ok:false,'send'}   200 {ok:true}          + BCC backup mailbox
                            |                     |
                            v                     v
                 [5] island shows error   [5] island swaps to
                     panel, KEEPS all         success panel
                     typed values, shows
                     phone + mailto fallback

 NOTHING IS WRITTEN ANYWHERE IN OUR INFRASTRUCTURE.
 The only persisted artefacts are: an opaque integer counter in KV keyed by a
 salted IP hash, and Resend's own 30-day copy of the sent message (US-hosted).
```

### Recommended Project Structure

```
src/
  routes/
    rekrutacja/
      +page.svelte              # prerendered, composes sections + <ZgloszenieForm/>
      +page.server.ts           # readDokumenty() filtered to kategoria 'rekrutacja'
    kontakt/
      +page.svelte              # prerendered, contact cards + map + <KontaktForm/>
    api/
      rekrutacja/+server.ts     # export const prerender = false; POST only
      kontakt/+server.ts        # export const prerender = false; POST only
  lib/
    components/
      FormField.svelte          # label + input + error wiring (shared, a11y contract)
      ConsentBlock.svelte       # unticked checkbox + <details> klauzula
      TurnstileWidget.svelte    # explicit-render island piece, reset() on failure
      ZgloszenieForm.svelte     # island #2
      KontaktForm.svelte        # island #3
      MapPanel.svelte           # enhanced-img snapshot + attribution + directions
      KryteriaTable.svelte      # 50/20/10 punktacja table
      FeeBox.svelte             # compact oplaty box (D-15)
    server/
      forms/
        validate.ts             # PURE: shape, lengths, e-mail, consent -> Result
        sanitize.ts             # PURE: header-injection-safe reply-to + text body
        turnstile.ts            # siteverify call
        ratelimit.ts            # KV counter
        mailer.ts               # Resend fetch, hard-coded from/to/bcc
        handle.ts               # orchestrates (a)-(e), returns typed JSON
    content/
      site.ts                   # SWEPT: address, phone, age, fees, steps, recruitmentOpen
      rekrutacja.ts             # NEW: kryteria, procedura, fee box, klauzula text
  assets/
    map/stromiec-radomska-72.png  # committed OSM snapshot
tests/
  rekrutacja.spec.ts            # acceptance + axe
  kontakt.spec.ts               # acceptance + axe
  forms.unit.ts                 # node --test on validate/sanitize/payload
  home.spec.ts                  # UPDATED in lockstep with the data sweep
```

### Pattern 1: One dynamic endpoint under a globally prerendered app

**What:** A `+server.ts` that opts out of the inherited `prerender = true`.
**When to use:** Every dynamic route in this project. `src/routes/+layout.ts` sets `export const prerender = true`, which prerenders all routes *except* those that explicitly export `prerender = false`. That opt-out is valid in `+page.js`, `+page.server.js` and `+server.js`. [CITED: svelte.dev/docs/kit/page-options]

```ts
// src/routes/api/kontakt/+server.ts
import type { RequestHandler } from './$types';

// The ONE line that makes this route dynamic. Without it the prerender crawler
// tries to render an endpoint that only answers POST and the build fails.
export const prerender = false;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	// ... see Code Examples
};
```

**Also true:** `+error.svelte` is NOT triggered by errors thrown inside `+server.js` handlers. [CITED: svelte.dev/docs/kit/routing] The endpoint therefore owns its own error contract and must never let an exception escape as an opaque 500 that the island cannot map to a Polish message.

### Pattern 2: Typed JSON result contract, no `ActionResult`

**What:** A small discriminated union shared by the endpoint and the island so every failure mode maps to a specific Polish message with the correct D-12 behaviour.

```ts
// src/lib/server/forms/handle.ts (type is shared with the island via $lib)
export type FormResult =
	| { ok: true }
	| {
			ok: false;
			/** stable machine code; the island maps it to Polish copy */
			code: 'walidacja' | 'zgoda' | 'turnstile' | 'limit' | 'wysylka';
			/** per-field messages for aria-describedby wiring; never echoes values */
			pola?: Record<string, string>;
	  };
```

**Why a code, not a message:** the endpoint stays free of long Polish prose (which is where em dashes and emoji sneak in, C-11), the island owns the copy alongside the rest of the design system, and the codes are directly assertable in Playwright.

**Status mapping:** `walidacja`/`zgoda`/`turnstile` -> 400, `limit` -> 429, `wysylka` -> 502. Never 200 on failure (D-12: the error state must never pretend success).

### Pattern 3: Cheap checks before expensive ones

**What:** Order the pipeline so a bot burns as little quota as possible.

| Order | Check | Cost of running it | Rejects |
|-------|-------|-------------------|---------|
| 1 | Content-Type, body size, JSON parse | free | malformed / oversized bodies |
| 2 | Honeypot field non-empty | free | naive bots |
| 3 | Dwell time (HMAC-signed render timestamp, reject < ~3 s) | free | scripted submits |
| 4 | Shape, field length caps, e-mail regex, consent === true | free | broken + non-consenting submissions |
| 5 | Turnstile `siteverify` | 1 outbound fetch, unmetered | bots |
| 6 | KV rate-limit counter | 1 KV read + 1 KV write (1,000 writes/day free) | humans abusing the form |
| 7 | Resend send | **1 of 100/day** | - |

Putting the KV counter at step 6 rather than step 1 is deliberate: it means only Turnstile-verified humans consume the KV write budget, so a bot flood cannot exhaust the free KV tier and disable rate limiting for real parents.

### Pattern 4: KV rate limiting without storing an IP

**What:** A fixed-window counter keyed by a salted hash so no personal data lands in KV.

```ts
// src/lib/server/forms/ratelimit.ts
const OKNO_S = 3600; // 1 h window
const LIMIT = 5; // submissions per IP per window

async function klucz(ip: string, sol: string): Promise<string> {
	const bytes = new TextEncoder().encode(`${sol}:${ip}`);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	// 16 hex chars is ample collision resistance for a per-hour counter and keeps
	// the KV key well under the 512-byte limit.
	return [...new Uint8Array(digest)]
		.slice(0, 8)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function podLimitem(kv: KVNamespace, ip: string, sol: string): Promise<boolean> {
	const k = `rl:${await klucz(ip, sol)}`;
	const biezace = Number((await kv.get(k)) ?? '0');
	if (biezace >= LIMIT) return false;
	// expirationTtl restarts on every write: a fixed window that self-cleans.
	await kv.put(k, String(biezace + 1), { expirationTtl: OKNO_S });
	return true;
}
```

**RODO note:** the stored value is an integer and the key is a one-way salted hash with a 1-hour TTL, so KV holds no identifying data and no submission content (C-03). The salt should be a secret (`RATE_LIMIT_SALT`) so the hash is not reversible by rainbow table over the IPv4 space. Mention the security-measure processing briefly in the klauzula.

**Free-tier envelope:** 100,000 reads/day, 1,000 writes/day, 1 write per second per key, 512-byte keys. [CITED: developers.cloudflare.com/kv/platform/limits] At municipal volume this is not close to binding.

**Client IP:** SvelteKit's `getClientAddress()` is the portable accessor; on Cloudflare it derives from `CF-Connecting-IP`. Reading `request.headers.get('CF-Connecting-IP')` directly is the explicit fallback if the adapter's behaviour surprises. [ASSUMED, verify during execution]

### Pattern 5: Turnstile as an island sub-component with reset-on-failure

**What:** Load `api.js?render=explicit&onload=...`, render into a container the island owns, and call `turnstile.reset(widgetId)` on every failed submission.

**Why reset matters:** Turnstile tokens expire after 300 seconds and can be validated **only once**. [CITED: developers.cloudflare.com/turnstile/llms-full.txt] A failed submit (rate limit, Resend outage, validation) consumes the token. If the island does not reset the widget, the parent's retry fails with `timeout-or-duplicate` and they see a confusing second error on a form they just corrected. This is the single most common Turnstile integration bug and it lands squarely on D-12's "keep all typed values and let them retry".

**Where the script lives:** `<svelte:head>` inside the form island. That places the tag in the prerendered HTML of exactly the two pages that need it, and nowhere else.

### Pattern 6: Static map with real attribution

**What:** A committed image plus a visible, linked attribution caption plus an external directions link.

```svelte
<!-- MapPanel.svelte -->
<figure class="map">
	<enhanced:img
		src="$lib/assets/map/stromiec-radomska-72.png?w=800;1200"
		alt="Mapa okolicy zlobka przy ul. Radomskiej 72 w Stromcu"
	/>
	<figcaption>
		Dane mapy:
		<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
			OpenStreetMap contributors<span class="visually-hidden"> (otwiera sie w nowej karcie)</span>
		</a>
	</figcaption>
</figure>
<a class="map-link" href={directionsUrl} target="_blank" rel="noopener noreferrer">
	Wyznacz trase<span class="visually-hidden"> (otwiera sie w nowej karcie)</span>
</a>
```

**Constraints:** the OSMF policy requires visible attribution ("Map data from OpenStreetMap" or "(c) OpenStreetMap contributors"), ideally hyperlinked to `openstreetmap.org/copyright`, and forbids bulk downloading or pre-seeding tiles from `tile.openstreetmap.org`. A one-off snapshot committed as an asset is not systematic prefetching, but the attribution is not optional and the caption must not be hidden behind a toggle or clipped off-screen. [CITED: operations.osmfoundation.org/policies/tiles] The image must also stay legible after `enhanced-img` compression, so check the rendered output rather than assuming (map labels are small text and are exactly what lossy encoders destroy).

**Alt text:** the map conveys location that is also given as a text address in the contact cards, so a short descriptive alt is correct and no long description is needed.

### Anti-Patterns to Avoid

- **Hand-authoring a `/functions` directory.** With `adapter-cloudflare`, SvelteKit server routes ARE the Pages Functions. A `/functions` dir collides with the adapter output. (C-05, PITFALLS.md)
- **`import.meta.env.RESEND_API_KEY`.** It is `undefined` at runtime on Cloudflare and produces a silent failure that only shows up in production. Use `platform.env`. (C-06)
- **Putting the parent's address in `from:`.** It spoofs a domain we do not control, fails DMARC at the receiving Gmina MTA, and gets `send.zlobekstromiec.pl` a bad reputation. `reply_to` only. (C-09)
- **Interpolating any user input into the `subject:`.** Keep the subject a static Polish constant; the parent's name belongs in the body where it cannot become a header.
- **`console.log(dane)` "just for debugging".** Cloudflare Pages Functions logs are retained in the dashboard. Logging a submission body is a RODO breach involving a child's data. (C-03, PITFALLS.md §Technical Debt Patterns)
- **`platform.ctx.waitUntil(send())` to make the endpoint feel fast.** It returns 200 before the send resolves, so a Resend failure becomes an invisible lost application and the UI lies. D-12 forbids this. Await the send.
- **Returning 200 with `{ok:false}`.** Playwright, monitoring, and any future alerting all key off status codes. Use real 4xx/5xx.
- **Client-side-only Turnstile.** Explicitly called out as never-acceptable in PITFALLS.md and by Cloudflare.
- **Trusting client validation.** The island's validation is a UX affordance; the endpoint re-validates everything including the consent checkbox.
- **A map iframe.** Locked ban (RODO). Also true of any "just for now" Google Maps embed.
- **Re-deriving colors, type sizes, or spacing.** The UI-SPEC is locked; use the existing tokens (see §Open Question 4 on the missing form contract).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bot / spam filtering | A custom question-answer captcha, an obfuscated math puzzle, or "check the user agent" | Cloudflare Turnstile + mandatory `siteverify` | Free, unlimited, privacy-preserving (no reCAPTCHA data sharing under RODO), and adaptive. Hand-rolled captchas are both trivially defeated and an accessibility violation. |
| Transactional email | An SMTP client in the Worker, or the old MailChannels free integration | Resend HTTP API | Workers cannot open raw TCP/SMTP sockets to arbitrary mail servers. MailChannels' free Cloudflare integration was terminated around 30 June 2024 and is saturated in training data as the "canonical free path" - building on it means forms silently fail in production. (PITFALLS.md §Pitfall 4) |
| Deliverability | Sending from `@ugstromiec.pl` or a bare `@zlobekstromiec.pl` without records | A verified Resend domain on the `send.` subdomain with SPF + DKIM (TXT) + MX + DMARC | SPF/DKIM/DMARC is not something you approximate. Missing records means the message is dropped by the Gmina MTA with no bounce visible to the parent. |
| Rate limiting | An in-memory `Map` counter in the Worker module scope | KV counter (or WAF rules once a zone exists) | Worker isolates are ephemeral and there are many of them; a module-scope Map resets constantly and shares nothing across the edge, so it provides essentially no limit while looking like one. |
| Hashing | A hand-written string hash for the rate-limit key | `crypto.subtle.digest('SHA-256', ...)` | Built into the runtime, no import, cryptographically appropriate for a salted identifier. |
| E-mail address validation | An elaborate RFC 5322 regex found online | A conservative regex + explicit CRLF/control-character rejection + a length cap | Full RFC 5322 regexes are famously unmaintainable and still do not prevent header injection, which is the actual threat here. Rejecting is safer than "correcting". |
| Responsive image handling for the map | `<img srcset>` written by hand | `@sveltejs/enhanced-img` (already installed) | Already the project's image pipeline; reusing it keeps one path for AVIF/WebP/sizes and matches Phase 2 precedent. |
| Static map rendering | Screenshotting a Leaflet page in a headless browser at build time | An OSM export / static-map renderer run once, output committed | A build-time headless browser adds a heavy dependency and a network fetch to the CI build for an image that changes never. |
| Polish date/number formatting | `Intl` at runtime | Literal Polish strings authored in content | Precedent from Phase 3 (`03-01`: "genitive Polish dates, no runtime locale formatter"). Consistency matters more than cleverness here. |

**Key insight:** in this domain almost every "small custom solution" is either a compliance liability (captcha, validation, logging) or a silent-failure generator (SMTP, rate limiting, deliverability). The correct instinct for Phase 4 is to write as little code as possible and let the platform primitives be the implementation.

## Common Pitfalls

### Pitfall 1: E-mail header injection through the parent's address

**What goes wrong:** The parent's submitted e-mail is placed into `reply_to` (and sometimes into the subject) without sanitizing. A crafted value containing `\r\n` splits the header and lets an attacker inject `Bcc:` recipients, turning the endpoint into an open relay that sends from a verified public-body domain.
**Why it happens:** The value is going into JSON, so it feels safe. But the JSON field becomes an SMTP header downstream at Resend/SES, and the CR/LF survives the round trip in some encodings.
**How to avoid:** validate with a conservative regex; hard-reject (do not strip) any value containing `\r`, `\n`, `\t`, `<`, `>`, `,`, `;`, `"`, or a null byte; cap the length at 254 characters. Keep the `subject:` a static Polish constant so no user data ever reaches a header. Keep `from`, `to`, and `bcc` as module-level `const` values that no request can influence.
**Warning signs:** any code path where a request field flows into `subject`, `from`, `to`, `cc`, `bcc`, or `headers`.

### Pitfall 2: CSP blocks the Turnstile widget on the prerendered page

**What goes wrong:** The widget silently fails to render, or renders but cannot verify, because the site CSP does not allow `challenges.cloudflare.com`.
**Why it happens:** `svelte.config.js` currently declares `'script-src': ['self']`, `'default-src': ['self']`, no `connect-src`, and no `frame-src`. The Turnstile widget runs inside an iframe served from `challenges.cloudflare.com` and the loader script comes from the same host, so three directives need it.
**How to avoid:** Cloudflare's documented CSP for Turnstile is `script-src 'self' challenges.cloudflare.com; connect-src 'self' challenges.cloudflare.com; frame-src 'self' challenges.cloudflare.com`. [CITED: developers.cloudflare.com/turnstile/llms-full.txt] Because `default-src` is `'self'`, `connect-src` must be **added explicitly** (it does not currently exist and would otherwise fall back to `'self'` and block the widget's calls). Do this in `kit.csp.directives` in `svelte.config.js`, never in `_headers` - the root `_headers` file deliberately does not set a site CSP because SvelteKit's hydration bootstrap is an inline script whose hash changes every build. The path-scoped `/admin/*` CSP in `_headers` is a separate policy and must not be touched (Phase 2 Pitfall 3).
**Warning signs:** an empty Turnstile container; browser console `Refused to frame` or `Refused to load the script` pointing at `challenges.cloudflare.com`.

### Pitfall 3: Assuming "Resend EU region" satisfies RODO data residency

**What goes wrong:** The klauzula informacyjna says data stays in the EU, and the RCPD lists Resend as an EU processor. Both are inaccurate.
**Why it happens:** Resend's dashboard offers `eu-west-1` and the ROADMAP locked "select Resend's EU (eu-west-1) region", which reads like a residency guarantee.
**How to avoid:** Resend's own documentation states that region selection "determines where emails are routed and dispatched. However, all account data, including metadata, logs, and API records, is stored in the United States regardless of the selected sending region", and that email data is retained for roughly 30 days on standard plans. [CITED: resend.com/docs, §Choosing a Region > Data Residency] Consequences the plan must absorb:
- The klauzula must disclose a transfer to a third country (USA) and the legal mechanism (SCCs / adequacy), not merely "an external processor in the EU".
- The klauzula must state that a copy of the message exists at the processor for approximately 30 days. "Nie przechowujemy zgloszen" is only true of our own infrastructure and must be phrased that way.
- The region must be chosen when the domain is **added** to Resend (`region` is a create-time parameter alongside `us-east-1 | eu-west-1 | sa-east-1 | ap-northeast-1`), and the MX value is region-specific (`feedback-smtp.<region>.amazonses.com`). Adding the domain with the wrong region means redoing the DNS.
**Warning signs:** a klauzula that says "dane nie sa przekazywane poza EOG"; an RCPD entry listing Resend without SCCs.

### Pitfall 4: The Turnstile token is spent on a failed submission

**What goes wrong:** The parent hits a validation error or a transient send failure, fixes the problem, resubmits, and gets a second error they cannot fix.
**Why it happens:** Turnstile tokens are single-use and expire after 300 s. The island holds the same stale token across retries.
**How to avoid:** call `turnstile.reset(widgetId)` in every non-success branch of the submit handler, before re-enabling the submit button. Also handle the `expired-callback` so a form left open for six minutes re-challenges rather than failing.
**Warning signs:** `error-codes: ["timeout-or-duplicate"]` in the endpoint; users reporting "it never works the second time".

### Pitfall 5: The Playwright suite cannot reach the success path

**What goes wrong:** `/rekrutacja` and `/kontakt` specs can assert the form renders and is accessible, but the D-11 success panel is never exercised, so the highest-value acceptance criterion has no automated coverage.
**Why it happens:** the endpoint needs a real Turnstile secret and a real Resend key, neither of which belongs in the repo.
**How to avoid:** Cloudflare publishes dummy Turnstile keys for exactly this: sitekey `1x00000000000000000000AA` (always passes) with secret `1x0000000000000000000000000000000AA` (always passes), plus `2x...AB`/`2x...AA` (always fails) and `3x00000000000000000000FF` (forces interactive). [CITED: developers.cloudflare.com/turnstile/troubleshooting/testing] Put the always-pass pair in `.dev.vars` (gitignored) so `wrangler pages dev` - which the Playwright `webServer` already runs - can drive the real endpoint. The Resend call still needs a seam; see §Validation Architecture for the recommended dry-run flag.
**Warning signs:** a `rekrutacja.spec.ts` that only checks headings and axe.

### Pitfall 6: The data sweep breaks the existing test suite

**What goes wrong:** `npm run test` goes red after the placeholder replacement, and the fix is applied by weakening assertions.
**Why it happens:** the Phase 1 acceptance tests encode the placeholder facts as executable contracts. Verified couplings:
- `tests/home.spec.ts:103` asserts `10 mies. – 3 lata` -> D-05 changes this to the statut range.
- `tests/home.spec.ts:126` asserts the heading `Nabór na rok 2026/2027 trwa` -> D-06 flips `recruitmentOpen` to `false`, so the closed heading renders instead.
- `tests/home.spec.ts:128-129` asserts the curated two-document subset -> unchanged unless the dokumenty collection grows (see Open Question 3, which would change which two documents are "first").
**How to avoid:** treat the test updates as part of the same task as the content change, and update the assertion to the new *correct* value rather than loosening the matcher. The Phase 2 test header language ("Do NOT weaken these assertions to make the suite pass") is the standing rule.
**Warning signs:** a diff that changes `toHaveText` to `toContainText`, or deletes an assertion.

### Pitfall 7: A no-JS visitor is stranded

**What goes wrong:** Turnstile needs JavaScript, so the form cannot work without it. If the page renders only a form, a no-JS or script-blocked visitor sees a control that silently does nothing.
**Why it happens:** progressive enhancement is assumed to be handled by the framework, but D-10's fetch-POST island has no no-JS path and form actions are architecturally unavailable.
**How to avoid:** render the direct-contact fallback (phone link + mailto + the Urzad Gminy address for formal wnioski) as **static prerendered content that is always present in the DOM**, not as something the island reveals on error. This simultaneously satisfies D-12's failure fallback, D-16's info box, and the no-JS case, and costs nothing. Consider a `<noscript>` note above the form explaining that the form needs JavaScript and pointing at the phone number.
**Warning signs:** the phone/mailto fallback existing only inside the error branch of the island.

### Pitfall 8: The BCC backup creates an undocumented processor

**What goes wrong:** `devzlobekstromiec@gmail.com` receives copies of submissions containing a child's birth month and a parent's contact details. The controller is the Gmina; the developer holding that mailbox is a processor, and Google is a sub-processor.
**Why it happens:** the BCC was added as an engineering safety net (D-13), and safety nets rarely get an Art. 28 powierzenie.
**How to avoid:** D-03 already requires disclosing the backup copy in the klauzula - keep that. Add a dated, tracked launch-gate item to remove the BCC once delivery to `zlobek@ugstromiec.pl` is proven, and flag the powierzenie question to the Gmina alongside the existing Resend/Cloudflare DPA item. Do not let "temporary" become permanent silently: put the removal condition in a code comment next to the constant.
**Warning signs:** the BCC constant with no comment, or a klauzula that mentions Resend but not the backup mailbox.

### Pitfall 9: Publishing content the source data forbids

**What goes wrong:** the sweep publishes an unconditional "0 zl", the archival 2026/2027 harmonogram as current, an opening date, or the statut's zatrudnienie eligibility criterion.
**Why it happens:** `dane-bip-zlobek-stromiec.md` contains all of these as accurate facts; only section 10 marks them as not-publishable.
**How to avoid:** treat `dane-bip-zlobek-stromiec.md` §10 as a hard gate and re-read it before writing any copy. The one sanctioned exception is the phone number (D-08, published by explicit user decision with a launch-gate caveat). Also note the doc is currently **untracked** in git - commit it (D-05 canonical ref) so downstream agents and reviewers can actually read it.
**Warning signs:** the strings `0 zł` without a warunek, `01.04.2026`, `27.04.2026`, `14 sierpnia`, `1 września` as an opening date, or `zatrudnienie` as an eligibility criterion.

## Code Examples

Verified patterns from official sources, adapted to this codebase's conventions.

### 1. Turnstile island piece (explicit render + reset)

```svelte
<!-- src/lib/components/TurnstileWidget.svelte -->
<script lang="ts">
	// Explicit-render Turnstile. The script tag lands in the prerendered HTML of
	// exactly the two form pages via <svelte:head>. Tokens are single-use and
	// expire after 300 s, so the parent island MUST call reset() after any failed
	// submit (Pitfall 4).
	// Source: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering
	let { sitekey, onToken }: { sitekey: string; onToken: (t: string | null) => void } = $props();

	let container: HTMLDivElement | undefined = $state();
	let widgetId: string | undefined;

	export function reset() {
		if (widgetId) window.turnstile?.reset(widgetId);
		onToken(null);
	}

	$effect(() => {
		if (!container) return;
		const render = () => {
			widgetId = window.turnstile?.render(container!, {
				sitekey,
				language: 'pl',
				callback: (token: string) => onToken(token),
				'expired-callback': () => onToken(null),
				'error-callback': () => onToken(null)
			});
		};
		if (window.turnstile) render();
		else window.__onTurnstileLoad = render;
		return () => {
			if (widgetId) window.turnstile?.remove(widgetId);
		};
	});
</script>

<svelte:head>
	<script
		src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__onTurnstileLoad"
		defer
	></script>
</svelte:head>

<div bind:this={container}></div>
```

### 2. CSP additions in `svelte.config.js`

```js
// svelte.config.js - kit.csp.directives (Phase 4 additions marked)
csp: {
	mode: 'auto',
	directives: {
		'default-src': ['self'],
		// Turnstile loader script (Phase 4).
		'script-src': ['self', 'https://challenges.cloudflare.com'],
		'style-src': ['self', 'unsafe-inline'],
		'font-src': ['self'],
		'img-src': ['self', 'data:'],
		// NEW in Phase 4: connect-src did not exist and fell back to default-src
		// 'self', which blocks the widget's own calls. 'self' also covers the
		// island's same-origin fetch to /api/*.
		'connect-src': ['self', 'https://challenges.cloudflare.com'],
		// NEW in Phase 4: the widget renders inside a challenges.cloudflare.com
		// iframe, so frame-src is mandatory.
		'frame-src': ['self', 'https://challenges.cloudflare.com'],
		'base-uri': ['self'],
		'form-action': ['self'],
		'object-src': ['none']
	}
}
```

### 3. Server-side Turnstile verification

```ts
// src/lib/server/forms/turnstile.ts
// Source: https://developers.cloudflare.com/turnstile/get-started/server-side-validation
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function zweryfikujTurnstile(
	secret: string,
	token: string,
	remoteip?: string
): Promise<boolean> {
	// A single idempotency_key across retries makes the call safe to repeat
	// without spending the token twice.
	const idempotency_key = crypto.randomUUID();
	try {
		const res = await fetch(SITEVERIFY, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret, response: token, remoteip, idempotency_key })
		});
		const wynik = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
		// Never log the token or the parent's data; the error codes are safe and
		// are the only thing worth surfacing for diagnosis.
		if (!wynik.success) console.warn('turnstile:', wynik['error-codes']?.join(',') ?? 'unknown');
		return wynik.success === true;
	} catch {
		// Fail CLOSED. A siteverify outage must not open the relay.
		return false;
	}
}
```

### 4. Resend send via plain `fetch` (no SDK)

```ts
// src/lib/server/forms/mailer.ts
// Source: https://resend.com/docs (raw fetch + Bearer pattern, send-with-cloudflare-workers)

/** Hard-coded, never request-derived (FORM-02). */
const FROM = 'Formularz zlobka <formularz@send.zlobekstromiec.pl>';
const TO = 'zlobek@ugstromiec.pl';
/** TEMPORARY anti-silent-loss backup (D-13). Remove once delivery to the Gmina
 *  mailbox is proven. Disclosed in the klauzula informacyjna (D-03).
 *  LAUNCH GATE: remove this constant and the klauzula sentence together. */
const BCC = 'devzlobekstromiec@gmail.com';

export async function wyslij(
	apiKey: string,
	temat: string, // STATIC constant supplied by the caller, never user input
	tresc: string, // plain text, already sanitized
	replyTo: string // already validated + injection-checked
): Promise<boolean> {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: FROM,
			to: [TO],
			bcc: [BCC],
			reply_to: replyTo,
			subject: temat,
			// Plain text only: no HTML means no HTML-injection surface in the
			// staff mail client, and it renders identically everywhere.
			text: tresc
		})
	});
	// AWAIT the result. Never waitUntil() - D-12 requires the UI to tell the
	// truth about whether the message was sent.
	return res.ok;
}
```

### 5. Injection-safe reply-to validation

```ts
// src/lib/server/forms/sanitize.ts
const EMAIL = /^[^\s@,;<>"]{1,64}@[a-zA-Z0-9.-]{1,190}\.[a-zA-Z]{2,}$/;
// CR, LF, TAB, NUL and the header-structural characters. Reject, never strip:
// a "corrected" address silently sends the reply to the wrong person.
const NIEBEZPIECZNE = /[\r\n\t\0<>,;"]/;

export function bezpiecznyEmail(surowy: unknown): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy.trim();
	if (wartosc.length === 0 || wartosc.length > 254) return null;
	if (NIEBEZPIECZNE.test(wartosc)) return null;
	if (!EMAIL.test(wartosc)) return null;
	return wartosc;
}

/** Body text: strip control characters except newline, collapse runaway blank
 *  lines, and cap the length. The body cannot become a header, so this is about
 *  keeping the staff mail readable, not about injection. */
export function bezpiecznyTekst(surowy: unknown, maks: number): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy
		// strip C0/C1 control characters but KEEP \n (newlines are wanted in a message)
		.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	if (wartosc.length === 0 || wartosc.length > maks) return null;
	return wartosc;
}
```

### 6. Endpoint skeleton wiring it together

```ts
// src/routes/api/kontakt/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { zweryfikujTurnstile } from '$lib/server/forms/turnstile';
import { podLimitem } from '$lib/server/forms/ratelimit';
import { wyslij } from '$lib/server/forms/mailer';
import { bezpiecznyEmail, bezpiecznyTekst } from '$lib/server/forms/sanitize';

export const prerender = false;

/** STATIC subject: no user data ever reaches a mail header (Pitfall 1). */
const TEMAT = 'Nowa wiadomosc z formularza kontaktowego';
const MAKS_BODY = 8 * 1024;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const env = platform?.env;
	if (!env?.RESEND_API_KEY || !env?.TURNSTILE_SECRET_KEY) {
		return json({ ok: false, code: 'wysylka' }, { status: 502 });
	}

	// 1. body size + parse
	const surowe = await request.text();
	if (surowe.length > MAKS_BODY) return json({ ok: false, code: 'walidacja' }, { status: 400 });
	let dane: Record<string, unknown>;
	try {
		dane = JSON.parse(surowe);
	} catch {
		return json({ ok: false, code: 'walidacja' }, { status: 400 });
	}

	// 2. honeypot: a real parent never fills a visually-hidden field
	if (typeof dane.strona === 'string' && dane.strona.length > 0) {
		// Answer 200 so the bot believes it succeeded and stops retrying.
		return json({ ok: true });
	}

	// 3-4. shape + consent
	const imie = bezpiecznyTekst(dane.imie, 100);
	const email = bezpiecznyEmail(dane.email);
	const wiadomosc = bezpiecznyTekst(dane.wiadomosc, 2000);
	const pola: Record<string, string> = {};
	if (!imie) pola.imie = 'brak';
	if (!email) pola.email = 'brak';
	if (!wiadomosc) pola.wiadomosc = 'brak';
	if (Object.keys(pola).length) return json({ ok: false, code: 'walidacja', pola }, { status: 400 });
	if (dane.zgoda !== true) return json({ ok: false, code: 'zgoda' }, { status: 400 });

	// 5. Turnstile (fails closed)
	const ip = getClientAddress();
	const token = typeof dane.turnstile === 'string' ? dane.turnstile : '';
	if (!token || !(await zweryfikujTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
		return json({ ok: false, code: 'turnstile' }, { status: 400 });
	}

	// 6. rate limit (only verified humans reach here, protecting the KV budget)
	if (env.FORMS_KV && !(await podLimitem(env.FORMS_KV, ip, env.RATE_LIMIT_SALT ?? ''))) {
		return json({ ok: false, code: 'limit' }, { status: 429 });
	}

	// 7. send, awaited
	const tresc = [
		`Imie i nazwisko: ${imie}`,
		`E-mail: ${email}`,
		'',
		'Wiadomosc:',
		wiadomosc
	].join('\n');
	const wyslane = await wyslij(env.RESEND_API_KEY, TEMAT, tresc, email!);
	// NOTHING IS LOGGED OR STORED. No console.log of `dane`, `tresc`, or any field.
	return wyslane
		? json({ ok: true })
		: json({ ok: false, code: 'wysylka' }, { status: 502 });
};
```

### 7. Accessible field + error wiring (the a11y contract for every input)

```svelte
<!-- src/lib/components/FormField.svelte -->
<script lang="ts">
	let {
		id,
		etykieta,
		typ = 'text',
		wymagane = false,
		blad,
		wartosc = $bindable(''),
		podpowiedz
	}: {
		id: string;
		etykieta: string;
		typ?: string;
		wymagane?: boolean;
		blad?: string;
		wartosc?: string;
		podpowiedz?: string;
	} = $props();

	// aria-describedby must reference ONLY ids that exist, or screen readers
	// announce nothing at all.
	const opisy = $derived([podpowiedz && `${id}-hint`, blad && `${id}-err`].filter(Boolean).join(' '));
</script>

<div class="pole" class:pole-blad={!!blad}>
	<label for={id}>
		{etykieta}{#if wymagane}<span aria-hidden="true">*</span><span class="visually-hidden"> (pole wymagane)</span>{/if}
	</label>
	{#if podpowiedz}<p id="{id}-hint" class="podpowiedz">{podpowiedz}</p>{/if}
	<input
		{id}
		type={typ}
		bind:value={wartosc}
		required={wymagane}
		aria-required={wymagane}
		aria-invalid={blad ? 'true' : undefined}
		aria-describedby={opisy || undefined}
	/>
	{#if blad}
		<!-- Text + icon, never color alone (WCAG 1.4.1). The message says what to
		     do, not just that something is wrong (WCAG 3.3.3). -->
		<p id="{id}-err" class="blad">{blad}</p>
	{/if}
</div>
```

## Real-Data Sweep Map (D-05, D-06, D-08, D-09)

Concrete before/after so the planner does not re-derive it from the source doc. Every "after" value is `[BIP]`-sourced unless noted.

| File / symbol | Current value | Correct value | Source | Notes |
|---|---|---|---|---|
| `site.ts` `contact.addressLines` | `['ul. Radomska 5', '26-804 Stromiec']` | `['ul. Radomska 72', '26-804 Stromiec']` | dane-bip §1 `[BIP]` | Drop the PLACEHOLDER comment. |
| `site.ts` `contact.phoneDisplay` | `48 619 10 25` | `510 094 051` | D-08 (user override of `[?]`) | Keep a PLACEHOLDER comment + launch-gate: confirm sluzbowy. Display format is the planner's call; keep it consistent with the `tel:` href. |
| `site.ts` `contact.phoneHref` | `tel:+48486191025` | `tel:+48510094051` | derived | |
| `site.ts` `contact.email` | `zlobek@ugstromiec.pl` | unchanged | D-07 | Already FINAL, do not touch. |
| `site.ts` `contact.hours` | `pon.-pt. 6:30–16:30` | unchanged value, but stays PLACEHOLDER | dane-bip §1 `[KD]` "moze ulec zmianie" | `[KD]` is confirmed-by-email, not `[BIP]`. Keep the marker. |
| `site.ts` `contact.secretariatHours` | `sekretariat: pon.-pt. 7:00–15:00` | **no source** | dane-bip has no zlobek secretariat hours | Either remove, or replace with the Urzad Gminy wnioski window `pok. 17, 8:00-15:00` correctly labelled as the Urzad, not the zlobek. Do not silently keep an invented value. |
| `site.ts` keyFact "Wiek dzieci" | `10 mies. – 3 lata` | `od 20. tygodnia zycia do 3 lat` | dane-bip §1 `[BIP]` statut | Statut also allows exceptionally to 4. Display wording is the planner's call; note the en-dash rule applies only to numeric ranges. **Breaks `tests/home.spec.ts:103`.** |
| `site.ts` keyFact "Oplata miesieczna" | `400 zł` + `+ wyżywienie 14 zł/dzień` | `1 500 zł` + suffix per D-09 | dane-bip §3 `[BIP]` uchwala XXIII.134.2026 | NEVER an unconditional "0 zl" (dane-bip §10.1). Stays PLACEHOLDER pending client wording. |
| `site.ts` keyFact "Liczba miejsc" | `50` | `50` (correct) | dane-bip §1 `[BIP]` Aktywny Maluch | Can drop the PLACEHOLDER marker. |
| `site.ts` `recruitmentOpen` | `true` | `false` | D-06 | **Breaks `tests/home.spec.ts:126`.** |
| `site.ts` `recruitment.infoCard` | "od 10 miesiecy do 3 lat, zamieszkale na terenie gminy" | age corrected; keep **zamieszkanie only** | dane-bip §4 regulamin | Do NOT add the statut's zatrudnienie criterion (dane-bip §10.5 unresolved discrepancy). |
| `site.ts` `recruitment.steps[1]` | "Osobiscie w zlobku ... e-mailem ... lub przez ePUAP" | wniosek do pobrania -> **wylacznie osobiscie** w Urzedzie Gminy, ul. Piaski 4, pok. 17, 8:00-15:00 | dane-bip §4 `[BIP]` | The current text is factually wrong and contradicts the regulamin. Note the homepage single-mailto constraint (UI-SPEC v1.2 §6) - the corrected step no longer needs an e-mail at all, which helps. |
| `site.ts` `recruitment.steps[2]` | "Komisja rekrutacyjna weryfikuje ... poinformujemy" | Komisja Rekrutacyjna powolana przez **Wojta**; odwolanie 7 dni do Wojta | dane-bip §4 | Recruitment is run by the Wojt, not the zlobek. |
| `site.ts` `closedStrings` | present, unreviewed | review against regulamin: lista oczekujaca, deklaracja kontynuacji, nastepny nabor wiosna 2027 | D-06 | Never present the 2026/2027 harmonogram as current (dane-bip §10.3). |
| `ContactAndMap.svelte` `directionsUrl` | `51.64222,21.09111` | see §Open Question 2 | Nominatim, this session | Banked coords are ~580 m off the real street. |
| `ContactAndMap.svelte` map panel | "Mapa pojawi sie wkrotce" placeholder | real static snapshot + attribution | D-17 | |
| `tests/home.spec.ts` | asserts placeholder facts | updated in lockstep | Pitfall 6 | Update to the new correct values; do not weaken matchers. |
| `dane-bip-zlobek-stromiec.md` | untracked in git | committed | D-05 canonical ref | Currently invisible to CI and to any agent that does not have it in context. |

**Do NOT publish (dane-bip §10, hard gate):** unconditional `0 zł`; the 2026/2027 harmonogram as current; any opening date (14.08 vs 01.09 unresolved); the statut's zatrudnienie eligibility criterion; any institution name other than "Publiczny Żłobek w Stromcu". The phone number is the single sanctioned exception (D-08).

## Runtime State Inventory

This phase performs a site-wide fact replacement, so state outside the repo can carry the old values.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None.** No database, no KV, no D1 exists today (`wrangler.jsonc` declares only `pages_build_output_dir`). The KV namespace this phase introduces stores integers only. | None for the sweep. For the new KV: create the namespace, no migration. |
| Live service config | **Cloudflare Pages project** (git integration, auto-deploy on push to `main`) needs two new secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) plus a KV binding and salt - these live in the Pages dashboard/wrangler config, not in git. **Cloudflare Turnstile:** a widget must be created (sitekey + secret) and its allowed-hostname list must include both `*.pages.dev` and the future custom domain. **Resend:** the sending domain must be added with `region: eu-west-1` at creation time. | Dashboard/API work, not code. Sequence before the first live smoke test. |
| OS-registered state | **None.** No cron, no scheduled task, no pm2, no local daemon in this project. | None. |
| Secrets / env vars | `.envrc` exists (gitignored, holds `CLOUDFLARE_API_TOKEN`; not currently exported in this shell). `.dev.vars` does **not** exist yet and must be created (gitignored) for local + Playwright runs. No secret is renamed by this phase, only added. | Create `.dev.vars`; add Pages secrets; document both in `docs/dev-env.md` if that file exists. |
| Build artifacts / CMS-authored content | **`static/og-placeholder.png`** still renders the old branding (already tracked as a Phase 6 item). **`src/lib/content/o-nas.json`** and **`src/lib/content/aktualnosci/*.json`** are CMS-editable and may repeat the old address, age range, or fee - a `site.ts`-only sweep will miss them. **`static/sitemap.xml`** needs the two new routes. **`worker-configuration.d.ts`** is committed and regenerated by `wrangler types`; adding the KV binding and secrets changes it. | Grep the CMS JSON content for `Radomska 5`, `619 10 25`, `400 zł`, `14 zł`, `10 mies`; add `/rekrutacja` and `/kontakt` to the sitemap; re-run `wrangler types` and commit the regenerated file. |

**The canonical question:** after every file in the repo is updated, what still carries the old facts? Answer: the CMS-authored JSON content (staff can also reintroduce old wording later - already a known STATE.md concern), the OG share card, and the sitemap.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (pinned) | build, tests | yes | `.tool-versions` pins 22.23.2; local shell has 25.9.0 | Run under asdf 22.23.2 to match CI |
| npm | build | yes | 11.12.1 | - |
| wrangler | `npm run check`, `npm run preview`, Playwright `webServer` | yes | 4.122.0 | - |
| Playwright browsers | acceptance + axe | yes | chromium-1217, chromium-1234 cached | - |
| `sharp` | generating/cropping the map image offline | yes (transitively, via enhanced-img) | installed | Any image tool; scratchpad script per Phase 1 precedent |
| curl | DNS/geocode checks | yes | 8.7.1 | - |
| `CLOUDFLARE_API_TOKEN` | wrangler dashboard operations | **not exported in this shell** | - | Present in gitignored `.envrc`; `direnv allow` or dashboard UI |
| `.dev.vars` | local + Playwright endpoint runs | **absent** | - | Must be created this phase (gitignored) |
| Turnstile widget (sitekey/secret) | RECRUIT-04, CONTACT-03, FORM-02 | **not created** | - | Cloudflare dummy test keys (`1x00...AA` / `1x00...AA`) unblock all local work and CI |
| Resend account + API key | FORM-01 | **unknown / not verified this session** | - | None for production. Dry-run flag unblocks tests. |
| Resend verified sending domain `send.zlobekstromiec.pl` | FORM-01 | **NO** | - | See below - this is the phase's hard blocker |
| Workers KV namespace | FORM-02 rate limiting | **not created** | - | `wrangler kv namespace create`; endpoint degrades gracefully if the binding is absent (Turnstile still gates) |
| DNS control of `zlobekstromiec.pl` | Resend SPF/DKIM/MX/DMARC | **domain registered, but NOT on Cloudflare and zone is empty** | NS: `dns.home.pl`, `dns2.home.pl`, `dns3.home.pl` | Add records at home.pl (fast) or migrate NS to Cloudflare (slower) |

**Missing dependencies with no fallback:**
- **A verified Resend sending domain.** Without it, `FORM-01` cannot be demonstrated end to end and success criterion 2 fails. This is the phase's critical path and it has DNS-propagation lead time. Verified this session: `zlobekstromiec.pl` returns NS records for `dns.home.pl` / `dns2.home.pl` / `dns3.home.pl` with SOA `dns.home.pl. admin.home.pl.`, and NXDOMAIN/empty for A, MX, TXT, `_dmarc.zlobekstromiec.pl` and `send.zlobekstromiec.pl`. The zone is registered and parked, with zero mail records.

**Missing dependencies with fallback:**
- Turnstile widget: Cloudflare's documented always-pass dummy keys cover all development and CI work, so widget creation can happen in parallel with implementation.
- Workers KV namespace: design the rate limiter to no-op with a build warning if the binding is absent, so the endpoint still works (Turnstile-gated) while the namespace is being provisioned. Do not let a missing KV binding throw.
- Resend production key: a dry-run seam (see §Validation Architecture) lets the whole pipeline be tested without it.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.62.1 (E2E + `@axe-core/playwright` 4.13.0) and Node's built-in `node --test` for pure units |
| Config file | `playwright.config.ts` (present); no separate unit config |
| Quick run command | `npm run test:unit` (currently hard-codes one file - see Wave 0) |
| Full suite command | `npm run check && npm run lint && npm run test` |

**Crucial existing property:** `playwright.config.ts` `webServer.command` is `npm run build && npm run preview`, and `npm run preview` is `wrangler pages dev .svelte-kit/cloudflare`. **The acceptance suite therefore already runs against the real Cloudflare runtime with real Pages Functions and picks up `.dev.vars`.** The new endpoints are testable end to end without any new harness.

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RECRUIT-01 | `/rekrutacja` returns 200, one h1, kryteria table with the 50/20/10 rows, procedura mentions "osobiscie" + "pok. 17" | e2e | `npx playwright test tests/rekrutacja.spec.ts` | Wave 0 |
| RECRUIT-02 | Every wniosek link resolves under `/dokumenty/` and returns 200 (mirror `dokumenty.spec.ts:62-73`) | e2e | `npx playwright test tests/rekrutacja.spec.ts -g pobrania` | Wave 0 |
| RECRUIT-03 | Happy path: fill + consent + dummy Turnstile -> POST -> 200 -> success panel visible, form gone | e2e | `npx playwright test tests/rekrutacja.spec.ts -g wyslanie` | Wave 0 |
| RECRUIT-03 | Payload construction: hard-coded from/to/bcc, static subject, sanitized reply-to | unit | `node --test tests/forms.unit.ts` | Wave 0 |
| RECRUIT-04 | Consent checkbox is unticked on load; submitting without it returns 400 `zgoda` and shows a Polish error | e2e | `npx playwright test tests/rekrutacja.spec.ts -g zgoda` | Wave 0 |
| RECRUIT-04 | Klauzula `<details>` is present and its content is reachable by keyboard | e2e | same spec | Wave 0 |
| RECRUIT-04 / FORM-02 | Turnstile: POST with a missing/invalid token returns 400 `turnstile` (use the always-fail secret `2x00...AA`) | e2e (direct `request.post`) | `npx playwright test tests/rekrutacja.spec.ts -g turnstile` | Wave 0 |
| CONTACT-01 | `/kontakt` shows address, phone (`tel:` link), e-mail (`mailto:`), hours, all matching `site.ts` | e2e | `npx playwright test tests/kontakt.spec.ts` | Wave 0 |
| CONTACT-02 | Map image renders with non-empty alt; OSM attribution link to `openstreetmap.org/copyright` is visible; directions link has `rel="noopener noreferrer"` | e2e | same spec | Wave 0 |
| CONTACT-03 | Same happy path + consent + Turnstile assertions as RECRUIT-03/04 for the contact form | e2e | `npx playwright test tests/kontakt.spec.ts -g wyslanie` | Wave 0 |
| FORM-01 | Endpoint returns 502 `wysylka` (not 200) when the send fails, and the island keeps all typed values and shows the phone fallback (D-12) | e2e | `npx playwright test tests/kontakt.spec.ts -g awaria` | Wave 0 |
| FORM-02 | Recipient cannot be influenced by the request body (POST with `to`/`from`/`bcc` fields is ignored) | unit + e2e | `node --test tests/forms.unit.ts` | Wave 0 |
| FORM-02 | Rate limit: N+1 submissions from one client return 429 `limit` | e2e | `npx playwright test tests/kontakt.spec.ts -g limit` | Wave 0 |
| FORM-01/02 | Header injection: an e-mail containing `\r\n` is rejected, never sanitized-and-sent | unit | `node --test tests/forms.unit.ts` | Wave 0 |
| A11Y (C-02) | Zero axe violations on both routes, including the error state with `aria-invalid` set | e2e | both specs | Wave 0 |
| D-05 sweep | Homepage assertions updated to the real facts; grep gate finds no `Radomska 5`, `619 10 25`, `400 zł`, `14 zł/dzień` | e2e + grep | `npx playwright test tests/home.spec.ts` | Exists, needs update |
| Manual only | Real end-to-end delivery to `zlobek@ugstromiec.pl` (and the BCC) with SPF/DKIM/DMARC passing | manual | - | Launch gate; cannot be automated without a live mailbox |

### The Resend dry-run seam

The success path cannot be automated without either a live Resend key or a seam. Recommended (simplest, one branch):

```ts
// mailer.ts
// Test-only short circuit. FORM_DRY_RUN lives ONLY in the gitignored .dev.vars
// and is never set as a Cloudflare Pages variable, so production always sends.
if (env.FORM_DRY_RUN === '1') return true;
```

Pair it with a unit test asserting the payload builder's output (hard-coded recipient, static subject, sanitized reply-to) so the dry run does not hide a malformed payload. The alternative - a `RESEND_API_BASE` override pointed at a local mock server - is more faithful but needs a mock server in the Playwright fixture, which is more machinery than a same-day V1 warrants.

### Sampling Rate

- **Per task commit:** `npm run test:unit` (fast, no browser) plus `npm run check`
- **Per wave merge:** `npm run test` (full Playwright + axe, builds and runs `wrangler pages dev`)
- **Phase gate:** `npm run check && npm run lint && npm run test` green, plus the manual live-delivery smoke test, before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/rekrutacja.spec.ts` - covers RECRUIT-01, RECRUIT-02, RECRUIT-03, RECRUIT-04
- [ ] `tests/kontakt.spec.ts` - covers CONTACT-01, CONTACT-02, CONTACT-03, FORM-01, FORM-02
- [ ] `tests/forms.unit.ts` - covers sanitize/validate/payload (FORM-01, FORM-02, injection)
- [ ] `package.json` `test:unit` script currently hard-codes `tests/aktualnosci-reader.unit.ts`; widen it to a glob (e.g. `node --test tests/*.unit.ts`) or the new unit file will never run
- [ ] `.dev.vars` with `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`, `RESEND_API_KEY=test`, `FORM_DRY_RUN=1`, `RATE_LIMIT_SALT=test`
- [ ] `tests/home.spec.ts` updated in lockstep with the D-05/D-06 sweep (lines 103 and 126 identified)

*No framework install is needed; both harnesses are already in the repo.*

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` (verified in `.planning/config.json`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | The forms are anonymous public endpoints; there is no user account model in this project. |
| V3 Session Management | no | No sessions, no cookies set by the form pipeline. Do not introduce one. |
| V4 Access Control | partial | The only access-control fact that matters: the recipient and sender are server-side constants that no request can influence. |
| V5 Input Validation | **yes** | Hand-written pure validators in `src/lib/server/forms/` (a schema library would be a new dependency for six fields). Allow-list regexes, hard length caps, reject-never-strip. Server is the enforcement boundary; client validation is advisory. |
| V6 Cryptography | **yes** | `crypto.subtle.digest('SHA-256')` for the salted IP hash and `crypto.randomUUID()` for the Turnstile idempotency key. Never hand-roll a hash. The salt is a secret. |
| V7 Error Handling & Logging | **yes** | Stable machine codes, never stack traces or field values, to the client. **No logging of any submission content** (C-03). Only Turnstile `error-codes` and HTTP statuses are safe to log. |
| V9 Communications | yes | HTTPS everywhere (Cloudflare default); Resend and Turnstile are both TLS-only HTTPS APIs. |
| V12 Files & Resources | partial | The wnioski are static assets served by Pages. `dokumenty.ts` already validates the `/dokumenty/` prefix and rejects `..` traversal - reuse it rather than resolving paths again on `/rekrutacja`. |
| V13 API & Web Service | **yes** | POST-only endpoints, explicit Content-Type handling, body-size cap, typed JSON responses with correct status codes, no verb confusion (no `fallback` handler that leaks behaviour on GET). |
| V14 Configuration | **yes** | Secrets via `platform.env` only. CSP tightened rather than loosened (`connect-src` and `frame-src` added narrowly, `object-src 'none'` and `base-uri 'self'` retained). Existing `_headers` baseline (HSTS, nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy) is inherited unchanged. |

### Known Threat Patterns for SvelteKit + Cloudflare Pages Functions + Resend + Turnstile

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| E-mail header injection via `reply_to` / `subject` | Tampering, Spoofing | Reject CR/LF/control/structural characters; static subject; constant `from`/`to`/`bcc`. (Pitfall 1) |
| Open mail relay (`to` taken from the request) | Elevation of Privilege, Spoofing | Recipient is a module-level `const`; ignore any `to`/`from`/`cc`/`bcc` key in the body; unit-test this. |
| Turnstile bypass (client-only widget) | Spoofing | Mandatory server `siteverify`; fail closed on network error; verify before doing any work that costs quota. |
| Turnstile token replay | Spoofing | Tokens are single-use and 300 s-lived by design; use `idempotency_key` for retries so a legitimate retry does not double-spend. |
| Quota exhaustion / cost abuse (Resend 100/day) | Denial of Service | Turnstile plus a KV rate limit placed immediately before the send; cheap checks first so bots never reach the counter. |
| RODO breach via logs | Information Disclosure | No `console.log` of bodies or fields; no error tracker; endpoint returns codes not echoes. Explicit review item in code review. |
| Third-country transfer without a basis | Information Disclosure (legal) | Resend logs are US-hosted regardless of send region: disclose in the klauzula, require SCCs, list Resend, Cloudflare **and the BCC mailbox's provider** in the RCPD. (Pitfall 3, Pitfall 8) |
| Stored XSS via a submitted message reaching a mail client | Tampering | Send `text` only, never `html`; the message body cannot become markup. |
| CSP weakening while adding Turnstile | Tampering | Add the three specific directives with the specific host; do not add `unsafe-inline` to `script-src`, do not add wildcards, do not move the CSP into `_headers`. |
| Traversal via document paths on `/rekrutacja` | Tampering | Reuse `readDokumenty()`'s existing prefix + `..` guards; do not build a second path resolver. |
| Silent delivery failure presented as success | Repudiation | Await the send; map non-2xx to 502; the UI must state the message was NOT sent (D-12). |

**Not applicable but worth stating so the checker does not flag it:** there is no CSRF token, and none is needed - the endpoint has no ambient authority (no cookies, no session) so a cross-site POST gains an attacker nothing beyond what a direct POST already allows, and Turnstile plus rate limiting cover the abuse case. Do not add a CSRF token to a stateless anonymous endpoint; it would require a session to store it in, which would violate the zero-storage decision.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Free MailChannels Workers integration (`https://api.mailchannels.net/tx/v1/send`, no key, no DNS) | Resend (or another API provider) with a verified domain | terminated ~30 June 2024 | Training data and 2022-2023 tutorials are saturated with the dead pattern. Any code sample using MailChannels without an API key is stale. |
| reCAPTCHA v2/v3 | Cloudflare Turnstile | 2022 onward, and specifically relevant under RODO | reCAPTCHA sends data to Google and is a documented DPIA problem for EU public bodies. Turnstile avoids that and is free. |
| DKIM published as CNAME records pointing at the provider | Resend publishes DKIM as a **TXT** record | current Resend behaviour | The ROADMAP already captures this correctly ("DKIM is a TXT record (not CNAME)") - do not "fix" it back to CNAME based on generic SES tutorials. |
| Sending from the apex domain | Sending from a dedicated `send.` subdomain with its own SPF/DKIM/MX | current best practice | Isolates sending reputation and avoids conflicting with the apex's future MX. Already locked. |
| `$app/stores` `page` store | `$app/state` `page` rune | SvelteKit 2.12+ | Project already migrated (Phase 1 `01-02`). New islands must use `$app/state`. |
| Rate limiting assumed available everywhere on Cloudflare | Rate Limiting binding is Workers-only; Pages Functions support a strict subset of bindings | current | Directly changes this phase's design (KV counter instead of the binding). |

**Deprecated / outdated in this project's context:**
- `functions/` directory hand-authoring: superseded by `adapter-cloudflare` making `+server.ts` the Pages Function.
- `tailwind.config.js`: does not exist; Tailwind v4 uses `@theme` in `src/app.css`.
- The banked map coordinates `51.64222, 21.09111`: derived for the fake "Radomska 5" address.
- STATE.md's "DNS on Cloudflare, we control it" and CLAUDE.md's "domain NOT purchased yet": both stale, and wrong in opposite directions.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getClientAddress()` returns the `CF-Connecting-IP` value under `adapter-cloudflare` | Architecture Pattern 4 | The rate-limit key would be constant or empty, making the limiter global instead of per-client. Verify with a one-line log of the *shape* (not the value) during execution, or read the header directly. |
| A2 | An e-mail with a BCC counts as one send against the Resend free 100/day quota, not two | Standard Stack, Pitfall 8 | If BCC recipients count separately, the effective daily budget halves to 50. Low impact at municipal volume; confirm in the Resend dashboard after the first sends. |
| A3 | Resend's `region` cannot be changed after a domain is verified without re-adding the domain and redoing DNS | Pitfall 3 | Choosing `us-east-1` by accident would force a DNS redo. Mitigate by treating region selection as an explicit, checklisted step at domain creation. |
| A4 | The `zlobekstromiec.pl` registration at home.pl belongs to this project (the user or the org), not a third party | Open Question 1, Environment Availability | If a third party holds it, the entire locked email identity (`send.zlobekstromiec.pl`, `formularz@...`) is unusable and FORM-01 needs a new sending domain. **Highest-impact assumption in this document.** **CONFIRMED TRUE 2026-08-14: user bought the domain 2026-08-13; see Open Question 1 resolution.** |
| A5 | The Gmina mailbox `zlobek@ugstromiec.pl` accepts external mail and is monitored | Success criterion 2 | Every submission is lost. Already tracked as a ROADMAP open item ("ask Gmina IT to allowlist"); the BCC (D-13) is the mitigation. |
| A6 | Resend supports an `X-Entity-Ref-ID` header to stop Gmail threading successive submissions into one collapsed conversation | not relied upon | Staff might see submissions collapsed and miss one. Cheap to add; verify against Resend docs before including. |
| A7 | `@sveltejs/enhanced-img` output keeps a map snapshot's small text labels legible | Architecture Pattern 6 | An illegible map. Verify visually on the built output; fall back to a plain `<img>` with a hand-tuned PNG if lossy encoding degrades it. |
| A8 | The Turnstile widget's `language: 'pl'` option renders Polish widget chrome (SITE-06) | Code Examples 1 | English text inside the widget iframe would violate the Polish-only constraint. Verify visually; Turnstile does support a language parameter, the exact option key should be confirmed against current docs. |
| A9 | Free-plan Cloudflare Pages allows adding a KV binding to a Pages project | Architecture Pattern 4 | Rate limiting would have to fall back to WAF rules (needs a zone) or be deferred. KV is listed as a supported Pages Functions binding, and KV has a free tier, so this is very likely fine. |

## Open Questions

1. **Who controls `zlobekstromiec.pl`, and should DNS move to Cloudflare before Phase 4 ships?**
   - What we know: the domain is registered and delegated to `dns.home.pl` / `dns2.home.pl` / `dns3.home.pl` (SOA `dns.home.pl. admin.home.pl.`), with an entirely empty zone: no A, MX, TXT, SPF or DMARC, and NXDOMAIN for `send.zlobekstromiec.pl` and `_dmarc.zlobekstromiec.pl`. [VERIFIED: DNS-over-HTTPS query this session]
   - What's unclear: whether the user registered it at home.pl (very common Polish registrar) or a third party holds it. CLAUDE.md says "NOT purchased yet"; STATE.md says "DNS on Cloudflare, we control it". Both are stale.
   - Recommendation: **resolve this before the planner writes any DNS task.** If it is ours, the fastest same-day path is to add Resend's TXT (DKIM), TXT (SPF) and MX records **directly in the home.pl DNS panel** - Resend verifies regardless of who hosts DNS, and this avoids a nameserver migration with propagation delay on a same-day phase. Migrating to Cloudflare is still worth doing later (it is also the prerequisite for WAF rate limiting rules and the custom domain), but it should not block FORM-01. If it is not ours, escalate immediately: the locked sending identity is unusable.
   - **RESOLVED (user confirmation, 2026-08-14): WE OWN the domain.** The user purchased `zlobekstromiec.pl` on 2026-08-13 (the day before this research), which is why the home.pl zone is empty - it is one day old, not parked by a third party. Nameservers have NOT yet been moved to Cloudflare; the user intends that migration but it has not happened. Consequences for planning: (a) the planner MAY write DNS tasks; (b) per the recommendation above, the same-day path is adding Resend's DKIM/SPF TXT + MX records in the **home.pl DNS panel** (manual user action - there is no API/wrangler automation for home.pl), with the NS migration to Cloudflare deferred to a later phase (Phase 6 custom domain needs it anyway); (c) if the user prefers to migrate NS to Cloudflare first, Resend records would then be added in the Cloudflare zone instead - a planner checkpoint should let the user pick the path at execution time. CLAUDE.md ("NOT purchased yet") and STATE.md ("DNS on Cloudflare") both remain stale and should not be trusted on this point.

2. **What are the exact coordinates for ul. Radomska 72?**
   - What we know: Nominatim resolves `Radomska, Stromiec` to the road at **51.6381997, 21.0857115** (bbox 51.6351718-51.6411172, 21.0828292-21.0885692) but returns **no house-number point for 72** - the address is not mapped in OSM. The banked `51.64222, 21.09111` is roughly **580 m** away and was derived for the fake "Radomska 5". [VERIFIED: Nominatim, this session]
   - What's unclear: where on Radomska the new building sits. It is a 2026 build on działka 981 and may not be in OSM at all yet.
   - Recommendation: use the street centroid `51.63820, 21.08571` as an interim pin, PLACEHOLDER-marked in code with a launch-gate item to confirm the exact building location with the client (a screenshot or a pin from the client settles it in one message). Point the "Wyznacz trasę" link at those coordinates; the parent gets to the right street either way, which is materially better than the current 580 m error. Consider also contributing the address to OSM once confirmed.

3. **Do the six BIP załączniki need to be in `static/dokumenty/` for RECRUIT-02?**
   - What we know: `static/dokumenty/` holds exactly three files (`regulamin-rekrutacji.pdf`, `statut-zlobka.pdf`, `wniosek-o-przyjecie-dziecka.doc`), while `dane-bip-zlobek-stromiec.md` §5 lists nine documents on BIP: the wniosek, six oświadczenie załączniki, the regulamin, and an oświadczenie o rezygnacji. [VERIFIED: filesystem + source doc]
   - What's unclear: whether "download the PDF enrollment forms (wnioski)" (RECRUIT-02) means the wniosek alone or the full set a parent must actually submit. A parent who downloads only the wniosek and shows up at pok. 17 without the załączniki will be turned away.
   - Recommendation: fetch the six załączniki from BIP, add them as `dokumenty` collection entries under `kategoria: 'rekrutacja'`, and present them on `/rekrutacja` as a grouped "wniosek + załączniki" list. Watch two consequences: the homepage's curated `.slice(0, 2)` subset would then pick different documents (check `tests/home.spec.ts:128`), and the `.doc`/`.docx` accessibility warning (dane-bip §5, deferred to Phase 6) grows from one file to eight. If the planner prefers minimum scope for a same-day ship, the acceptable alternative is a prominent labelled link to the BIP page for the full set - but the current three-file state under-serves RECRUIT-02.

4. **Should the form component contract be a UI-SPEC amendment?**
   - What we know: `01-UI-SPEC.md` has **no form component contract**. It defines the tokens forms need (`border-strong #64748B` explicitly labelled "input/UI boundary", `danger #B91C1C` "error text/border", `danger-surface #FEF2F2`, `radius-sm 8px` "Inputs", the global focus ring) but no input, label, checkbox, fieldset, or error-message spec, and no `<details>` treatment. [VERIFIED: file read]
   - What's unclear: whether composing the form UI counts as "following the design system" or "re-deriving" it (which C-08 forbids).
   - Recommendation: write the form contract as **UI-SPEC Amendment v1.4** using only existing tokens - input height (44px minimum for tap targets, consistent with the existing rule), border, focus, error, disabled, checkbox size and hit area, `<details>` summary treatment. This keeps the "one locked design contract" invariant and gives the plan-checker something to check against, at the cost of one short document. `ui_phase: true` is already enabled in config, so the workflow supports it.

5. **What is the rate-limit threshold, and what happens at the boundary?**
   - What we know: the mechanism is settled (KV counter, discretion granted in D-10's list). The Resend free budget is 100/day.
   - What's unclear: appropriate limits for a village nursery. A family might legitimately submit twice (one zgloszenie, one question).
   - Recommendation: 5 per IP per hour and a separate global daily cap around 40 (leaving headroom under the Resend 100 for retries and the BCC). Both generous for real use and both well inside the free tiers. The 429 message must be a friendly Polish "spróbuj ponownie za chwilę" with the phone fallback, not a bare error.

6. **Is the Resend account already created, and with which region?**
   - What we know: nothing was verified this session; no API key is present in the environment.
   - What's unclear: whether an account exists under `devzlobekstromiec@gmail.com`.
   - Recommendation: make account creation and domain-add (with `region: eu-west-1` explicitly chosen at creation, A3) an early, explicit task, because it gates DNS which gates the live smoke test which gates success criterion 2.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection this session: `package.json`, `svelte.config.js`, `wrangler.jsonc`, `src/app.d.ts`, `src/app.css`, `src/lib/content/site.ts`, `src/lib/server/dokumenty.ts`, `src/lib/components/{ContactAndMap,Recruitment,Cta,MobileNav}.svelte`, `src/routes/+layout.ts`, `src/routes/+page.server.ts`, `tests/dokumenty.spec.ts`, `tests/home.spec.ts` (grep), `playwright.config.ts`, `_headers`, `.gitignore`, `.tool-versions`, `static/dokumenty/`
- `npm view resend version time.modified dependencies scripts.postinstall repository.url` + npm downloads API - version 6.20.0, 9.57M weekly downloads, no postinstall
- `gsd-tools query package-legitimacy check --ecosystem npm resend` - verdict SUS (`too-new`)
- DNS-over-HTTPS queries against `dns.google/resolve` for `zlobekstromiec.pl` (NS, SOA, A, MX, TXT), `send.zlobekstromiec.pl` (A), `_dmarc.zlobekstromiec.pl` (TXT)
- Nominatim geocode for `Radomska 72, 26-804 Stromiec` and `Radomska, Stromiec, mazowieckie`
- Local tool probes: node, npm, wrangler, sharp, curl, Playwright browser cache, `.envrc`/`.dev.vars` presence
- Project planning documents: `.planning/phases/04-.../04-CONTEXT.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` §Email Sending, `.planning/config.json`, `.planning/research/{STACK,PITFALLS}.md`, `.planning/phases/01-.../01-UI-SPEC.md`, `dane-bip-zlobek-stromiec.md`

### Secondary (MEDIUM confidence)
- Context7 `/websites/developers_cloudflare_turnstile` - siteverify request/response contract, error codes, idempotency key, explicit rendering, CSP directives, 300 s single-use tokens, dummy test keys
- Context7 `/websites/resend` - send-from-Cloudflare-Worker pattern, `SendEmailRequest` field reference, region parameter values, **Data Residency statement (all account data/logs/API records stored in the US regardless of region)**, ~30-day retention, `send.` subdomain MX (`feedback-smtp.<region>.amazonses.com`), DKIM/SPF as TXT
- Context7 `/websites/developers_cloudflare_workers` - Rate Limiting binding shape (`ratelimits[]`, `namespace_id`, `simple.limit/period` of 10 or 60 s, `limit({key})`)
- Context7 `/websites/svelte_dev_kit` - root-layout `prerender = true` with per-route `prerender = false` opt-out valid in `+server.js`; `+error.svelte` not triggered by `+server.js` errors; `+server.js` handler signatures
- WebFetch `developers.cloudflare.com/pages/functions/bindings` - exhaustive Pages Functions binding list (rate limiting absent)
- WebFetch `developers.cloudflare.com/pages/functions/wrangler-configuration` - `kv_namespaces` supported in wrangler config for Pages
- WebFetch `developers.cloudflare.com/kv/platform/limits` - free tier 100k reads/day, 1k writes/day, 1 write/s per key, 512-byte keys
- WebFetch `developers.cloudflare.com/waf/rate-limiting-rules` - Free plan: 1 rule, Path/Verified-Bot only, 10 s period, 10 s timeout
- WebFetch `operations.osmfoundation.org/policies/tiles` - bulk-download prohibition, User-Agent/Referer/HTTPS/caching requirements

### Tertiary (LOW confidence)
- WebSearch on OSM attribution guidelines - the "fewer than 100 features / under 10,000 m2" attribution exemption and the "Map data from OpenStreetMap" wording. Cross-checked against the OSMF tiles policy page above, which is the operative document; the exemption detail is not relied upon (attribution is included unconditionally).

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack | HIGH | The recommendation is "add nothing", grounded in direct inspection of the installed dependency set plus official docs showing raw-fetch integrations for both external services. |
| Architecture | HIGH | Every structural claim (prerender opt-out, Pages Functions binding subset, form-actions incompatibility, existing resolver reuse) is confirmed against either official docs or the codebase itself. |
| Pitfalls | MEDIUM-HIGH | Pitfalls 1, 2, 4, 5, 7 are grounded in official docs and verified config; Pitfall 3 is a direct quote from Resend's docs; Pitfall 6 cites exact test line numbers; Pitfalls 8 and 9 are compliance reasoning, not verified facts. |
| RODO / compliance specifics | MEDIUM | Art. 13 element checklist and the third-country-transfer reasoning come from the existing PITFALLS.md research plus the newly verified Resend residency statement, not from a Polish legal source consulted this session. The klauzula text still needs legal review; the IOD contact remains `[BRAK]`. |
| Content sweep mapping | HIGH | Every row is a direct diff between a file read this session and a `[BIP]`-marked row in the source document. |
| Environment / DNS | HIGH (for what was measured) | The DNS state was queried directly. Ownership (A4) was not and is the phase's biggest unknown. |
| Map coordinates | MEDIUM | The street centroid is a verified Nominatim result; the building's exact position is genuinely unknown and flagged. |

**Research date:** 2026-08-14
**Valid until:** 2026-09-13 (30 days). Shorter watch items: the `zlobekstromiec.pl` DNS state can change at any time and should be re-checked immediately before any DNS task; Resend's data-residency wording is the kind of statement that changes with product updates and should be re-read before the klauzula is finalized.
