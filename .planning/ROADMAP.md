# Roadmap: Żłobek Gminny Stromiec — Public Website

## Overview

The site is delivered as six vertical MVP slices, each shipping an end-to-end, deployable piece of user-visible value rather than a horizontal technical layer. We start by putting a real, joyful homepage live on Cloudflare with the accessible-palette design foundation baked in (the defining design risk resolved first). We then bring the git-based CMS online alongside the first staff-editable content (O nas + Dokumenty), add news publishing, ship the legally-sensitive email form pipeline for enrollment and contact, round out gallery and fees, and finish with a compliance-and-launch slice that audits WCAG 2.1 AA, publishes the mandatory legal pages against a real baseline, tunes performance, and swaps placeholders for consented real content. Content is built placeholder-first throughout. (The former multi-day DNS lead-time that gated Phase 4 is dissolved: Resend's SPF/DKIM/DMARC live on our own domain `zlobekstromiec.pl`, whose DNS we control on Cloudflare — there is no dependency on the Gmina's `ugstromiec.pl` DNS, which serves only as the delivery mailbox.)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Live Homepage & Design Foundation** - Joyful, mobile-first homepage live on Cloudflare with the core-message hero, nav/footer shell, and accessible palette token system (completed 2026-08-12)
- [x] **Phase 01.1: Homepage v2.1 merged design (INSERTED)** - Two-design merge: hero split + key facts + perks band + rekrutacja module + day plan + o-nas teaser + kontakt/mapa + TopBar/Header/Footer v2 + conditional news + RODO stub (UI-SPEC Amendments v1.1/v1.2) (completed 2026-08-13)
- [x] **Phase 2: About, Documents & CMS** - O nas + Dokumenty pages made staff-editable via the git-based Sveltia CMS (OAuth Worker) (completed 2026-08-13)
- [x] **Phase 3: News (Aktualności)** - Staff-publishable news list + single post, feeding the homepage preview (completed 2026-08-13)
- [x] **Phase 4: Enrollment, Contact & Email Pipeline** - Rekrutacja + Kontakt with the RODO-compliant, Turnstile-gated, email-only form pipeline (Resend) (completed 2026-08-14)
- [ ] **Phase 04.1: Replace Sveltia with custom Polish CMS (INSERTED)** - Custom Polish-only admin panel with e-mail one-time-code login, replacing Sveltia + GitHub OAuth so non-technical staff need no GitHub account and see no English chrome (all 11 plans executed 2026-08-16, awaiting live UAT: see 04.1-UAT.md)
- [ ] **Phase 5: Gallery & Fees** - CMS-managed photo gallery and editable fees page
- [ ] **Phase 6: Accessibility, Legal Compliance & Launch** - WCAG 2.1 AA audit, accessibility widget, Deklaracja dostępności, BIP link, Polityka prywatności, performance, and the real-content launch gate

## Phase Details

### Phase 1: Live Homepage & Design Foundation

**Goal**: A parent can visit a live, joyful, mobile-first homepage that leads with the żłobek's verbatim core message and navigates to every section — with the accessible-palette design system established before any mass component building.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-06, HOME-01, HOME-02
**Success Criteria** (what must be TRUE):

  1. A visitor can open the deployed homepage on a public Cloudflare URL and immediately read the żłobek's core message verbatim in the hero.
  2. A visitor on phone, tablet, and desktop sees a responsive layout with a persistent header linking to all five sections and a footer linking to BIP, Deklaracja dostępności, and contact.
  3. The homepage surfaces the most-needed items at a glance: a Rekrutacja call-to-action, a latest-Aktualności preview area, and quick contact.
  4. The design visibly uses the joyful brand palette (niebieski/żółty/pomarańczowy/czerwony) through a two-tier token system — expressive/decorative colors alongside a constrained accessible text/UI subset that keeps text legible.
  5. Every piece of visitor-facing text (navigation, labels, buttons, messages) is in Polish — no English appears anywhere on the public site.
  6. A push to git automatically rebuilds and redeploys the site on Cloudflare end to end.

**Plans**: 5/5 plans complete
**Wave 1**

- [x] 01-01-PLAN.md — Walking skeleton spine: scaffold + Cloudflare build + two-tier design tokens + a11y/test gate

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Navigation shell: sticky header, mobile drawer island, footer (BIP), semantic layout
- [x] 01-04-PLAN.md — Static/SEO artifacts, security-header baseline, accessibility-declaration stub

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Homepage content: verbatim hero, Rekrutacja CTA, Aktualności empty state, quick-contact, SEO

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — Deploy: GitHub Org + Cloudflare Pages git-integration, live *.pages.dev + auto-redeploy

**UI hint**: yes

### Phase 01.1: Homepage v2 restructure (INSERTED)

**Goal**: The homepage answers a parent's four arrival questions at a glance (place availability, cost, hours, location) — hero split (sentence-2 lead + full verbatim message in the o-nas teaser), key-facts strip, recruitment centrepiece module with open/closed copy states, kontakt+mapa section (no third-party iframe — RODO), news section rendered only once posts exist, RODO footer link + stub route.
**Source**: Approved design handoff `design_handoff_homepage_v2` + UI-SPEC Amendment v1.1 (2026-08-13).
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02 (amended notes in REQUIREMENTS.md); no new requirement IDs — real news data stays Phase 3, real PDFs Phase 2, forms/map details Phase 4.

- [x] Homepage v2.1 merged design executed as approved plan (17 atomic commits, suite green at every step; completed 2026-08-13)

### Phase 2: About, Documents & CMS

**Goal**: Staff can self-edit the O nas page and manage downloadable documents through a git-based CMS, with no developer involved.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ABOUT-01, ABOUT-02, DOCS-01, DOCS-02, CMS-01, CMS-02, CMS-03
**Success Criteria** (what must be TRUE):

  1. A visitor can read the O nas page (misja, wartości, plan dnia, kadra).
  2. A visitor can browse and download documents (regulaminy, formularze) from the Dokumenty page.
  3. Authorized staff can log into the Sveltia CMS via GitHub OAuth (self-hosted `sveltia-cms-auth` Worker) on the live deployment.
  4. Staff can edit O nas content and upload, replace, or remove documents in the CMS without a developer.
  5. The CMS admin portal presents to staff in Polish — all collection/field labels, hints, and help text are Polish (and the editor UI locale is Polish where supported).
  6. A CMS edit commits to the repo and triggers a Cloudflare rebuild that publishes the change live.

**Plans**: 6/6 plans complete

- [x] 02-06-PLAN.md

**Wave 1**

- [x] 02-01-PLAN.md — O nas page (ABOUT-01): content-layer migration (day-plan.json, o-nas.json) + build-time image pipeline (enhanced-img, marked) + /o-nas route

**Wave 2** *(blocked on Wave 1)*

- [x] 02-02-PLAN.md — Dokumenty page (DOCS-01): folder-collection + seeded BIP files + build-time size/type resolver + /dokumenty route (RODO category dormant)

**Wave 3** *(blocked on Wave 2)*

- [x] 02-03-PLAN.md — Homepage docs realignment (D-18): re-source recruitment panel from the shared collection + home.spec.ts lockstep
- [x] 02-04-PLAN.md — CMS config + admin (ABOUT-02, DOCS-02, CMS-03): self-hosted Sveltia bundle + Polish config.yml + /admin CSP

**Wave 4** *(blocked on Wave 3)*

- [x] 02-05-PLAN.md — CMS OAuth + live loop (CMS-01, CMS-02, CMS-03): sveltia-cms-auth Worker + GitHub OAuth App + login-edit-commit-rebuild-live verification + Polish instrukcja

**UI hint**: yes

### Phase 3: News (Aktualności)

**Goal**: Staff can publish news posts and visitors can read them, with the newest surfaced on the homepage.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: NEWS-01, NEWS-02, NEWS-03
**Success Criteria** (what must be TRUE):

  1. A visitor can view a list of news posts, newest first.
  2. A visitor can open a single news post and read its full content.
  3. Staff can create, edit, and publish a news post via the CMS without a developer, and it appears live after rebuild.
  4. The homepage's latest-Aktualności preview shows the most recently published posts.

**Plans**: 7/7 plans complete

**Wave 1**

- [x] 03-01-PLAN.md — News list slice (NEWS-01): build-time reader (aktualnosci.ts) + D-01 seed + D-02 fixture + shared NewsCard + /aktualnosci list route

**Wave 2** *(blocked on Wave 1)*

- [x] 03-02-PLAN.md — Single-post slice (NEWS-02): hardened full-block renderPost + /aktualnosci/[slug] with entries() + friendly Polish +error.svelte + KNOWN_FUTURE_ROUTES enforcement
- [x] 03-03-PLAN.md — CMS authoring slice (NEWS-03): Sveltia aktualnosci collection (all-Polish, date-prefixed slug, inherited image pipeline) + staff instrukcja news section

**Wave 3** *(blocked on Wave 2)*

- [x] 03-04-PLAN.md — Homepage surfacing + lockstep (NEWS-01/HOME-02): NewsPreview real feed (3 newest) + site.ts stub removal + tests/home.spec.ts lockstep

**Wave 4 — gap closure** *(from 03-VERIFICATION.md: 2 blockers falsifying SC3b + Plan-01 must-have)*

- [x] 03-05-PLAN.md — CR-01 fix (NEWS-03): store `data` as ISO in the Sveltia aktualnosci collection + plain slug template + ISO-parsing reader + migrate the two seed JSONs, so CMS-authored posts get correct permanent date-prefixed URLs
- [x] 03-06-PLAN.md — WR-02 + WR-04 (NEWS-01/02): type-guard the reader so one malformed post is skipped-with-warning instead of aborting the prerender (+ node:test resilience proof) and give +error.svelte a document title (WCAG 2.4.2 A)

**Wave 5 — gap closure** *(from 03-VERIFICATION.md re-verification: 1 residual blocker, the Plan-01 prerender-resilience must-have)*

- [x] 03-07-PLAN.md — residual WR-02 (NEWS-01/02): require `tresc` unconditionally and guard `obraz`/`obraz_alt` in postFromEntry, construct the returned post from guarded locals instead of spreading the raw entry, and prove it red-then-green plus a malformed-fixture build

**UI hint**: yes

### Phase 4: Enrollment, Contact & Email Pipeline

**Goal**: Parents can find enrollment information, download the forms, and submit enrollment and contact requests that are safely emailed to the żłobek — with RODO compliance, spam protection, and zero data storage.
**Mode:** mvp
**Depends on**: Phase 2 (CMS for RECRUIT-05; the form pipeline itself needs only the Phase 1 foundation)
**Requirements**: RECRUIT-01, RECRUIT-02, RECRUIT-03, RECRUIT-04, RECRUIT-05, CONTACT-01, CONTACT-02, CONTACT-03, FORM-01, FORM-02
**Success Criteria** (what must be TRUE):

  1. A visitor can read enrollment information (harmonogram, kryteria, zasady) and download the PDF enrollment forms (wnioski).
  2. A visitor can submit an online enrollment application and a contact message; each is delivered by email via Resend to the fixed żłobek address, with no database or stored submission body.
  3. Both forms require ticking an explicit (unticked-by-default) RODO consent, display the klauzula informacyjna, and are spam-protected by Cloudflare Turnstile verified server-side, with the endpoint rate-limiting abuse.
  4. A visitor can see contact details (address, phone, email, opening hours) and the location on a map with directions (mapa dojazdu).
  5. Staff can manage enrollment documents via the CMS, and those documents surface on /rekrutacja through the shared resolver. **AMENDED 2026-08-14:** the "edit enrollment info/dates via the CMS" half of RECRUIT-05 is explicitly descoped for v1 by user decision (04-CONTEXT.md Phase Boundary, D-18); recruitment information stays code-authored in `site.ts` and `rekrutacja.ts` pending the planned CMS replacement.

**Plans**: 9/9 plans complete

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Kontakt e-mail pipeline: shared form server module (sanitize, validate, Turnstile, KV rate limit, Resend mailer, orchestrator) plus the POST /api/kontakt endpoint, platform bindings and Turnstile CSP
- [x] 04-02-PLAN.md — Real-data sweep of site.ts to the confirmed BIP facts, nabor flipped to closed, and the real static OpenStreetMap snapshot replacing the homepage map placeholder

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-03-PLAN.md — Form UI kit (Polish copy module, klauzula informacyjna, FormField, ConsentBlock, TurnstileWidget) and the KontaktForm island

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-04-PLAN.md — /kontakt route live: contact cards, map panel, contact form and the Urząd Gminy info box, crawler-enforced and axe-clean
- [x] 04-05-PLAN.md — Zgłoszenie pipeline: minimal-data validators, POST /api/rekrutacja and the ZgloszenieForm island

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04-06-PLAN.md — /rekrutacja route live: status banner, zgłoszenie form, kryteria and punktacja table, procedura, compact fee box and wnioski downloads

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 04-07-PLAN.md — Go live: Resend sending domain and DNS, Turnstile widget, KV namespace, Cloudflare Pages secrets and the real end-to-end delivery test

**Wave 6** *(gap closure, blocked on Wave 5 completion)*

- [x] 04-08-PLAN.md — CR-01: put the rate-limit window in the KV key (UTC date and hour buckets, cleanup-only expiration) so legitimate traffic can never lock both forms out, plus WR-01 refuse to hash without a salt, plus the FORM-02 mark correction
- [x] 04-09-PLAN.md — WR-02: the Turnstile widget effect clears the loader callback it installed and never renders into a detached container

**UI hint**: yes

### Phase 04.1: Replace Sveltia with custom Polish CMS (INSERTED)

**Goal**: A staff member with no GitHub account signs in to a Polish-only admin panel with a one-time code sent to their e-mail, edits every content type the site exposes, and sees it live after the Cloudflare rebuild — with Sveltia CMS, its OAuth Worker and the GitHub OAuth App removed from the project.
**Mode:** mvp
**Depends on**: Phase 2 (content model + the `/admin` surface being replaced), Phase 4 (custom domain live on Cloudflare)
**Requirements**: CMS-01, CMS-02, CMS-03 — all three are **re-scoped** by this phase. CMS-01 names "Sveltia" and "GitHub OAuth" as implementation and must be reworded to the new auth model when this phase lands; CMS-03 was marked complete with a known English-chrome caveat (see 02-05 decision) that this phase must close outright.
**Success Criteria** (what must be TRUE):

  1. A staff member who has no GitHub account and was given only an e-mail address can sign in to the admin panel with a one-time code, and an unauthenticated visitor can reach neither any admin page nor any admin API.
  2. Every surface of the panel is Polish — navigation, buttons, field labels, hints, validation messages, confirmations, empty states and errors — with no English chrome anywhere, including third-party UI.
  3. Staff can create, edit and delete all content that is editable today (o-nas, plan dnia, dokumenty, aktualności with cover images) and the change is live after the Cloudflare rebuild.
  4. Sveltia is gone: no `@sveltia/cms` bundle, no `config.yml`, no `sveltia-cms-auth` Worker, no GitHub OAuth App in the login path. The `/admin` CSP and the Polish instrukcja describe the new panel.
  5. Content files keep their current shape, so the Phase 2-3 readers, the prerender and the existing test suites pass unchanged.

**Open decisions for `/gsd-discuss-phase 04.1`:**

- Auth mechanism: Cloudflare Access one-time PIN (free tier, zero auth code to own, but it gates at the edge and needs the Access app configured per environment) vs. a self-built e-mail-code session on top of the existing Resend + KV infrastructure.
- Write path: the panel still has to persist content. Commit to the repo through the GitHub API with a server-side token (keeps git history, keeps prerender, needs a secret with write scope) vs. move editable content out of git into a store, which changes the build model for every reader written in Phases 2-3.
- Media uploads: cover images currently flow through the Vite/`enhanced-img` pipeline because they live in the repo; whatever write path is chosen must not break that.

**Plans**: 11/11 plans complete

Plans:

*(Wave 1)*

- [x] 04.1-01-PLAN.md — Brama panelu: podpisana sesja, lista dostępu i jedyny strażnik `/admin`

*(Wave 2)*

- [x] 04.1-02-PLAN.md — Kod jednorazowy: generowanie, hash, wypalanie, własny budżet limitów i polski moduł treści

*(Wave 3)*

- [x] 04.1-03-PLAN.md — Ekran logowania i wylogowanie: pełny dwuetapowy przepływ, powłoka panelu, parytet nieodróżnialności

*(Wave 4)*

- [x] 04.1-04-PLAN.md — Fundament zapisu: aplikacja GitHub, klucz PKCS#8, sekrety Pages, atomowy commit i serializacja zgodna z prettier

*(Wave 5)*

- [x] 04.1-05-PLAN.md — Nabór: `recruitmentOpen` do JSON, wspólny zapis i pierwszy prawdziwy commit z panelu

*(Wave 6)*

- [x] 04.1-06-PLAN.md — Aktualności: slug bez polskich znaków, lista, dodawanie, edycja i strona potwierdzenia usunięcia

*(Wave 7, równolegle)*

- [x] 04.1-07-PLAN.md — Zdjęcia: wyspa z przycinaniem 16:9, wymagany opis alternatywny, dwuplikowy commit
- [x] 04.1-08-PLAN.md — Dokumenty: lista z kategoriami, wgrywanie pliku, edycja i usuwanie obu połówek razem

*(Wave 8)*

- [x] 04.1-09-PLAN.md — Plan dnia i O nas: powtarzalne grupy bez JavaScriptu, zdjęcia obiektu 4:3

*(Wave 9)*

- [x] 04.1-10-PLAN.md — Pulpit, Pomoc i instrukcja obsługi napisana od nowa, plus wymuszony test polskości

*(Wave 10, brama D-20)*

- [x] 04.1-11-PLAN.md — UAT na żywym wdrożeniu, demontaż Sveltii i przeredagowanie CMS-01/CMS-03

**UI hint**: yes

### Phase 5: Gallery & Fees

**Goal**: Visitors can view a photo gallery and read the fees page, both staff-managed through the CMS.
**Mode:** mvp
**Depends on**: Phase 04.1 (the replacement CMS — gallery and fees are authored in the new panel, never in Sveltia)
**Requirements**: GALLERY-01, GALLERY-02, FEES-01
**Success Criteria** (what must be TRUE):

  1. A visitor can view a photo gallery of the żłobek.
  2. A visitor can read the fees page (opłaty, stawki).
  3. Staff can add and remove gallery photos and edit the fees page via the CMS, with changes publishing after a Cloudflare rebuild.

**Plans**: 3/9 plans executed

**Wave 1**

- [x] 05-01-PLAN.md — Contract amendments: 01-UI-SPEC v1.7, the 02-UI-SPEC supersession pointer, the DESIGN-BANK strike
- [x] 05-02-PLAN.md — /cennik: the amount formatter, the fee store, its reader and the public page; OPLATY becomes a typed read
- [x] 05-04-PLAN.md — PowtarzalnaGrupa gains move-up and move-down, proven on the two existing screens across both branches

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 05-03-PLAN.md — Public nav v3: six items at a 1024px tier, footer repoints, the #dojazd anchor, /cennik and /dojazd leave KNOWN_FUTURE_ROUTES
- [ ] 05-05-PLAN.md — The panel route-enumeration gate, then /admin/cennik end to end

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 05-06-PLAN.md — The gallery store, the galeria- naming and ownership rule, and /admin/galeria with the twelve cap

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 05-07-PLAN.md — The #galeria section on /o-nas, obiekt_zdjecia leaves o-nas.json with every reader, KNOWN_FUTURE_ROUTES emptied

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 05-08-PLAN.md — The lightbox island, with the project's first open-overlay axe scan and first focus-trap assertion
- [ ] 05-09-PLAN.md — W skrócie: the fact-tile store, the unified opening hours, /admin/w-skrocie and the phase ledger

**UI hint**: yes

### Phase 6: Accessibility, Legal Compliance & Launch

**Goal**: The site passes WCAG 2.1 AA, publishes every mandatory legal page against a real baseline, performs well on mobile, and carries consented real content — legally compliant and ready to go live.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5
**Requirements**: SITE-05, A11Y-01, A11Y-02, A11Y-03, LEGAL-01, LEGAL-02, LAUNCH-01
**Success Criteria** (what must be TRUE):

  1. The site passes a WCAG 2.1 AA audit — semantic structure, AA contrast, keyboard navigation, visible focus, and prefers-reduced-motion — and provides an accessibility widget (font-size + high-contrast toggles).
  2. The site publishes a conformant Deklaracja dostępności, written only after the AA baseline is real, including conformance status, procedura wnioskowo-skargowa, koordynator dostępności, and dostępność architektoniczna — plus a Polityka prywatności / RODO information page.
  3. The site links prominently and correctly to the existing BIP (https://ugstromiec.naszbip.pl/zlobek).
  4. Pages load fast on mobile — images are optimized and Core Web Vitals pass (green).
  5. All placeholder content is replaced with client-provided real content, any children's photos have documented consent, and a live end-to-end test email confirms delivery to the confirmed recipient address `zlobek@ugstromiec.pl` (sent from our domain `zlobekstromiec.pl`).

**Plans**: TBD
**UI hint**: yes

## External Dependencies & Open Items

Client-input items to confirm early; these gate specific phases and carry lead time.

| Item | Gates | Notes |
|------|-------|-------|
| Resend SPF/DKIM/DMARC records on our owned domain `zlobekstromiec.pl` | Phase 4 | **No external dependency, no lead time** — we own `zlobekstromiec.pl` and control its DNS on Cloudflare. Supersedes the former `ugstromiec.pl`-DNS dependency, which is DISSOLVED: the Gmina's `ugstromiec.pl` is only the delivery mailbox, not the sending domain. |
| ~~Exact recipient email (`zlobek@` vs `zlobel@ugstromiec.pl`)~~ — **RESOLVED** | Phase 4, Phase 6 | **Confirmed as `zlobek@ugstromiec.pl`** (the earlier `zlobel@` was a typo). Gmina/żłobek mailbox on `ugstromiec.pl`; Gmina/żłobek = data controller. |
| Gmina IT: allowlist our sending domain (`send.zlobekstromiec.pl` / From address) + confirm `zlobek@ugstromiec.pl` receives **external** mail | Phase 4 (test), Phase 6 (launch) | **Soft, non-blocking.** Government mail gateways filter aggressively; run an early real end-to-end test and monitor Resend delivery/bounce webhooks (or BCC a backup) so a filtered enrollment isn't silently lost. |
| RODO sub-processors: Gmina (controller) signs Resend DPA + SCCs and Cloudflare DPA; list both in the RCPD; select Resend EU (eu-west-1) region | Phase 4 (klauzula), Phase 6 | Personal data transits/logs via Resend (US-stored logs) + Cloudflare = international transfer; the klauzula informacyjna must disclose email transmission via an external processor. |

### Email Sending — Implementation Notes (Phase 4)

Authoritative spec for the form-email pipeline (verified against current Resend/Cloudflare/DMARC docs — supersedes the point-in-time research notes):

- **Sending identity:** dedicated subdomain `send.zlobekstromiec.pl` (isolates sending reputation from the apex). `From:` a role address on that subdomain, e.g. `formularz@send.zlobekstromiec.pl`; `Reply-To:` the parent's **validated/sanitized** submitted email (staff hit Reply → reaches the parent). **Never** put the parent's address in `From:` (spoofing → DMARC fail).
- **DNS on `zlobekstromiec.pl` (Cloudflare, all records DNS-only / grey-cloud):**
  - SPF — `TXT` at `send.zlobekstromiec.pl` → `v=spf1 include:amazonses.com ~all`
  - DKIM — **`TXT`** (not CNAME) at `resend._domainkey.send.zlobekstromiec.pl` → key from Resend
  - MX — at `send.zlobekstromiec.pl` → `feedback-smtp.<region>.amazonses.com` priority 10 (bounce/complaint handling; **required**)
  - DMARC — `TXT` at `_dmarc.zlobekstromiec.pl` → `v=DMARC1; p=none; rua=mailto:dmarc@zlobekstromiec.pl; adkim=r; aspf=r` (start `p=none`, monitor, ramp to `quarantine` → `reject`)
  - Use the exact region-specific values shown in the Resend dashboard.
- **Anti silent-loss:** because nothing is stored, a filtered/bounced email is a lost application with no record — monitor Resend delivery/bounce webhooks, or BCC a backup mailbox.
- **Security:** sanitize the submitted email before `Reply-To` (header-injection); Turnstile verified server-side; recipient hard-coded to `zlobek@ugstromiec.pl`; rate-limit the endpoint.
- **RODO:** select Resend's EU (eu-west-1) region; ensure Resend + Cloudflare DPAs/SCCs are in place; the klauzula informacyjna discloses that submissions are transmitted by email via an external processor.

| Koordynator dostępności / IOD contact details | Phase 4 (klauzula informacyjna), Phase 6 (Deklaracja dostępności) | Client must name a person. |
| Staff GitHub accounts (per-editor vs shared editor account) | Phase 2 (CMS handover) | Onboarding decision, not a technical blocker. |

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 4.1 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Live Homepage & Design Foundation | 5/5 | Complete    | 2026-08-12 |
| 2. About, Documents & CMS | 6/6 | Complete    | 2026-08-13 |
| 3. News (Aktualności) | 7/7 | Complete    | 2026-08-13 |
| 4. Enrollment, Contact & Email Pipeline | 9/9 | Complete    | 2026-08-15 |
| 04.1 Replace Sveltia with custom Polish CMS (INSERTED) | 11/11 | Awaiting UAT | - |
| 5. Gallery & Fees | 3/9 | In Progress|  |
| 6. Accessibility, Legal Compliance & Launch | 0/TBD | Not started | - |
