# Requirements: Żłobek Gminny Stromiec — Public Website

**Defined:** 2026-08-12
**Core Value:** A parent lands on the site and, within seconds, both feels the żłobek's warmth and finds the exact information they need (enrollment, documents, contact) — on any device.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Design

- [x] **SITE-01**: Site is a SvelteKit app deployed on Cloudflare with automatic deploys from git
- [x] **SITE-02**: Every page is mobile-first responsive and usable on phone, tablet, and desktop
- [x] **SITE-03**: A persistent header navigates to all five sections; a footer links to BIP, Deklaracja dostępności, and contact
- [x] **SITE-04**: A joyful design system implements the brand palette (niebieski/żółty/pomarańczowy/czerwony) split into expressive (decorative) and accessible (text/UI) color tokens
- [ ] **SITE-05**: Pages load fast on mobile — images are optimized and Core Web Vitals pass (green)
- [x] **SITE-06**: All client-facing content, navigation, labels, and messages are in Polish — no English is shown to visitors

### Homepage

- [x] **HOME-01**: The homepage hero prominently features the żłobek's core message verbatim *(Amendment v1.1: the hero leads with sentence 2 of the message; the FULL 4-sentence verbatim message renders in the homepage O-nas teaser blockquote — exact-match tested)*
- [x] **HOME-02**: The homepage surfaces the most-needed items at a glance — a Rekrutacja call-to-action, a preview of latest Aktualności, and quick contact *(Amendment v1.1: recruitment is now a full homepage module + key-facts strip; quick contact became „Kontakt i dojazd” with a map panel; the Aktualności preview renders only once posts exist — the empty state moves to /aktualnosci in Phase 3)*

### Aktualności (News)

- [x] **NEWS-01**: A visitor can view a list of news posts, newest first
- [x] **NEWS-02**: A visitor can open a single news post and read its full content
- [x] **NEWS-03**: Staff can create, edit, and publish news posts via the CMS without a developer

### O nas (About)

- [x] **ABOUT-01**: A visitor can read the O nas page (misja, wartości, plan dnia, kadra)
- [x] **ABOUT-02**: Staff can edit the O nas content via the CMS

### Rekrutacja (Enrollment)

- [x] **RECRUIT-01**: A visitor can read enrollment information (harmonogram, kryteria, zasady)
- [x] **RECRUIT-02**: A visitor can download the PDF enrollment forms (wnioski)
- [x] **RECRUIT-03**: A visitor can submit an online enrollment application that is emailed to the żłobek (no storage)
- [x] **RECRUIT-04**: The enrollment form requires explicit RODO consent, shows the klauzula informacyjna, and is spam-protected (Turnstile)
- [x] **RECRUIT-05**: Staff can edit enrollment info/dates and manage enrollment documents via the CMS

### Dokumenty (Documents)

- [x] **DOCS-01**: A visitor can browse and download documents (regulaminy, formularze)
- [x] **DOCS-02**: Staff can upload, replace, and remove documents via the CMS without a developer

### Kontakt (Contact)

- [x] **CONTACT-01**: A visitor can see contact details (address, phone, email, opening hours)
- [x] **CONTACT-02**: A visitor can see the location on a map with directions (mapa dojazdu)
- [x] **CONTACT-03**: A visitor can submit a contact form that is emailed to the żłobek (RODO consent + Turnstile, no storage)

### Galeria (Gallery)

- [x] **GALLERY-01**: A visitor can view a photo gallery of the żłobek
- [x] **GALLERY-02**: Staff can add and remove gallery photos via the CMS

### Opłaty (Fees)

- [x] **FEES-01**: A visitor can read a fees page (opłaty, stawki), editable via the CMS

### CMS & Forms Infrastructure

- [ ] **CMS-01**: Authorized staff can sign in to the admin panel with a one-time code sent to their e-mail address, without a GitHub account or any other external account _(Reworded per 04.1 D-21: this states the outcome, not the implementation. Built and proven locally in Phase 04.1; the code-request leg is confirmed on the live deployment. UNMARKED pending the live UAT in which a real staff member completes a login unaided.)_
- [ ] **CMS-02**: Panel edits commit to the repo and trigger a Cloudflare rebuild/deploy _(UNMARKED since 04.1-04: no save through the panel has yet produced a real commit. Every plan from 04.1-05 onward deferred this to the Plan 11 UAT.)_
- [ ] **CMS-03**: The admin panel is in Polish end to end (navigation, field labels, hints, validation messages, confirmations, empty states, errors and the login code e-mail), so non-English-speaking staff can manage content _(Reworded per 04.1 D-21, which also closes the English-chrome caveat recorded against the previous editor in 02-05: the panel is our own code, so there is no vendor chrome left to leak. The automated half is enforced by `tests/admin-polski.spec.ts` over every panel URL in `TRASY` (17 today) inside `npm run test`. UNMARKED pending the human half of the UAT: a staff member confirming it reads as Polish to a person rather than to a regular expression.)_
- [ ] **FORM-01**: Form submissions are delivered by email via a Cloudflare function + email provider (Resend) — sent from our owned domain `zlobekstromiec.pl` and delivered to the Gmina mailbox `publicznyzlobek@ugstromiec.pl` — with no database _(The cause of the bounce is GONE: the placówka gave a working address in writing on 2026-08-27 and the code was changed to it the same day. What is still missing is the one thing this requirement is about, PROOF OF DELIVERY: one live form submission after deploy, then a look in that inbox. Until somebody does that, this stays unticked and the BCC backup stays in place. Pipeline itself proven live 2026-08-15.)_
- [ ] **FORM-02**: The email endpoint verifies Turnstile server-side, sends only to fixed, hard-coded addresses (`publicznyzlobek@ugstromiec.pl` as recipient plus a `cc` to the Urząd Gminy clerk since 2026-08-27, neither of them ever taken from the request body, alongside the unchanged temporary BCC backup), and rate-limits abuse _(PENDING the live rate-limit reset re-check: see 04-VERIFICATION.md Acknowledged Gaps AG-1. Refusal inside the bucket passed live; the RESET across a clock-hour boundary, which is the only behaviour that discriminates the CR-01 fix from the bug, is unverified.)_

### Accessibility & Legal

- [ ] **A11Y-01**: The site meets WCAG 2.1 AA — semantic structure, AA contrast, keyboard navigation, visible focus, and prefers-reduced-motion support
- [ ] **A11Y-02**: The site provides an accessibility widget (font-size and high-contrast toggles)
- [ ] **A11Y-03**: The site publishes a conformant Deklaracja dostępności (conformance status, procedura wnioskowo-skargowa, koordynator dostępności, dostępność architektoniczna) _(Split across two phases: Phase 6 authors the page in full from the official government template, since a declaration may only state a conformance status once the AA baseline is real. It cannot tick there, because a declaration missing its koordynator is non-conformant and separately fineable. Phase 7 supplies the name and closes it.)_
- [ ] **LEGAL-01**: The site links prominently to the existing BIP (https://ugstromiec.naszbip.pl/zlobek)
- [ ] **LEGAL-02**: The site publishes a Polityka prywatności / RODO information page _(The page is WRITTEN AND PUBLISHED as of 2026-08-27, ahead of Phase 6, in quick task 260827-bfa: two disjoint sections, the administrator's own klauzula and the form klauzula rendered from its single existing source. The IOD contact address is published too. It still cannot tick: art. 11 of the ustawa of 10 May 2018 requires the inspector's name alongside the address, and only the address was given. Phase 7 supplies that name and closes this, exactly as it does for the koordynator dostępności.)_

### Launch Readiness

- [ ] **LAUNCH-01**: Before go-live, all placeholder content is replaced with client-provided real content, and any children's photos have documented consent _(Retargeted from Phase 6 to Phase 7 on 2026-08-18. Roughly 24 client facts are still unconfirmed and there is no real photography in the repository at all, so the entire wizerunek-consent obligation is prospective. Phase 6 builds the gate that measures this and leaves it RED; Phase 7 turns it green.)_

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Extras

- **MENU-01**: Weekly jadłospis (meal menu), editable via CMS
- **CAL-01**: Kalendarz / wydarzenia (events, closures, holidays)
- **NEWS-04**: News categories/tags and filtering
- **RSS-01**: RSS feed for Aktualności (zero-storage alternative to a newsletter)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Application/inquiry data storage or database | Cost + RODO data-minimization — submissions are emailed only |
| Online fee payment / payment processing | Not needed for v1 |
| Parent accounts / login / portal | Informational site; no per-parent auth needed |
| Newsletter (email list) | Conflicts with no-DB/data-minimization stance; RSS offered as v2 alternative |
| Multi-language / English version | Audience is local Polish parents |
| Building or hosting BIP | BIP already exists externally on naszbip; we only link to it |
| Paid headless CMS | Cost; git-based CMS satisfies staff self-editing for free |
| Aktualności comments / live chat | Moderation burden + spam/abuse risk for a small public site |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 1 | Complete |
| SITE-02 | Phase 1 | Complete |
| SITE-03 | Phase 1 | Complete |
| SITE-04 | Phase 1 | Complete |
| HOME-01 | Phase 1 | Complete |
| HOME-02 | Phase 1 | Complete |
| SITE-06 | Phase 1 | Complete |
| ABOUT-01 | Phase 2 | Complete |
| ABOUT-02 | Phase 2 | Complete |
| DOCS-01 | Phase 2 | Complete |
| DOCS-02 | Phase 2 | Complete |
| CMS-01 | Phase 04.1 | Pending (live UAT) |
| CMS-02 | Phase 04.1 | Pending (first real save) |
| CMS-03 | Phase 04.1 | Pending (live UAT, human half) |
| NEWS-01 | Phase 3 | Complete |
| NEWS-02 | Phase 3 | Complete |
| NEWS-03 | Phase 3 | Complete |
| RECRUIT-01 | Phase 4 | Complete |
| RECRUIT-02 | Phase 4 | Complete |
| RECRUIT-03 | Phase 4 | Complete |
| RECRUIT-04 | Phase 4 | Complete |
| RECRUIT-05 | Phase 4 | Complete |
| CONTACT-01 | Phase 4 | Complete |
| CONTACT-02 | Phase 4 | Complete |
| CONTACT-03 | Phase 4 | Complete |
| FORM-01 | Phase 4 | Blocked (Gmina mailbox) |
| FORM-02 | Phase 4 | Pending (live re-check) |
| GALLERY-01 | Phase 5 | Complete |
| GALLERY-02 | Phase 5 | Complete |
| FEES-01 | Phase 5 | Complete |
| SITE-05 | Phase 6 | Pending |
| A11Y-01 | Phase 6 | Pending |
| A11Y-02 | Phase 6 | Pending |
| A11Y-03 | Phase 6 (authored), Phase 7 (closed) | Pending (koordynator dostępności not named) |
| LEGAL-01 | Phase 6 | Pending |
| LEGAL-02 | Phase 6 (authored), Phase 7 (closed) | Pending (IOD not named) |
| LAUNCH-01 | Phase 7 | Pending |

**Coverage:**

- v1 requirements: 37 total
- Mapped to phases: 37 ✓
- Unmapped: 0

---
*Requirements defined: 2026-08-12*
*Last updated: 2026-08-16 (04.1-11): CMS-01 and CMS-03 reworded per D-21 to state the outcome rather than the vendor, and all three CMS rows retargeted from Phase 2 to Phase 04.1. All three were previously ticked complete against an editor that no longer exists in this repository; they are now Pending, and the live UAT that closes them is the open checkpoint on 04.1-11.*

*Last updated: 2026-08-18 (Phase 6/7 split): LAUNCH-01 retargeted from Phase 6 to the new Phase 7. A11Y-03 and LEGAL-02 are now authored in Phase 6 and closed in Phase 7. The split line is who has to act: Phase 6 is everything we can build and prove alone, Phase 7 is everything that waits on the Gmina (consented photography, real content, the koordynator dostępności and IOD names, and a mailbox at `publicznyzlobek@ugstromiec.pl` that receives external mail; as of 2026-08-27 the IOD's contact ADDRESS has arrived and only the inspector's name is still owed). Requirement count and coverage are unchanged at 37/37.*
