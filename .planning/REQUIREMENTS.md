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

- [ ] **RECRUIT-01**: A visitor can read enrollment information (harmonogram, kryteria, zasady)
- [ ] **RECRUIT-02**: A visitor can download the PDF enrollment forms (wnioski)
- [ ] **RECRUIT-03**: A visitor can submit an online enrollment application that is emailed to the żłobek (no storage)
- [ ] **RECRUIT-04**: The enrollment form requires explicit RODO consent, shows the klauzula informacyjna, and is spam-protected (Turnstile)
- [ ] **RECRUIT-05**: Staff can edit enrollment info/dates and manage enrollment documents via the CMS

### Dokumenty (Documents)

- [x] **DOCS-01**: A visitor can browse and download documents (regulaminy, formularze)
- [x] **DOCS-02**: Staff can upload, replace, and remove documents via the CMS without a developer

### Kontakt (Contact)

- [ ] **CONTACT-01**: A visitor can see contact details (address, phone, email, opening hours)
- [ ] **CONTACT-02**: A visitor can see the location on a map with directions (mapa dojazdu)
- [ ] **CONTACT-03**: A visitor can submit a contact form that is emailed to the żłobek (RODO consent + Turnstile, no storage)

### Galeria (Gallery)

- [ ] **GALLERY-01**: A visitor can view a photo gallery of the żłobek
- [ ] **GALLERY-02**: Staff can add and remove gallery photos via the CMS

### Opłaty (Fees)

- [ ] **FEES-01**: A visitor can read a fees page (opłaty, stawki), editable via the CMS

### CMS & Forms Infrastructure

- [x] **CMS-01**: Authorized staff can log into a git-based CMS (Sveltia) via GitHub OAuth (self-hosted auth Worker)
- [x] **CMS-02**: CMS edits commit to the repo and trigger a Cloudflare rebuild/deploy
- [x] **CMS-03**: The CMS admin portal is in Polish — all field labels, hints, and help text (and the editor UI where supported) — so non-English-speaking staff can manage content
- [ ] **FORM-01**: Form submissions are delivered by email via a Cloudflare function + email provider (Resend) — sent from our owned domain `zlobekstromiec.pl` and delivered to the Gmina mailbox `zlobek@ugstromiec.pl` — with no database
- [ ] **FORM-02**: The email endpoint verifies Turnstile server-side, sends only to the fixed, hard-coded żłobek address (`zlobek@ugstromiec.pl`, confirmed), and rate-limits abuse

### Accessibility & Legal

- [ ] **A11Y-01**: The site meets WCAG 2.1 AA — semantic structure, AA contrast, keyboard navigation, visible focus, and prefers-reduced-motion support
- [ ] **A11Y-02**: The site provides an accessibility widget (font-size and high-contrast toggles)
- [ ] **A11Y-03**: The site publishes a conformant Deklaracja dostępności (conformance status, procedura wnioskowo-skargowa, koordynator dostępności, dostępność architektoniczna)
- [ ] **LEGAL-01**: The site links prominently to the existing BIP (https://ugstromiec.naszbip.pl/zlobek)
- [ ] **LEGAL-02**: The site publishes a Polityka prywatności / RODO information page

### Launch Readiness

- [ ] **LAUNCH-01**: Before go-live, all placeholder content is replaced with client-provided real content, and any children's photos have documented consent

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
| CMS-01 | Phase 2 | Complete |
| CMS-02 | Phase 2 | Complete |
| CMS-03 | Phase 2 | Complete |
| NEWS-01 | Phase 3 | Complete |
| NEWS-02 | Phase 3 | Complete |
| NEWS-03 | Phase 3 | Complete |
| RECRUIT-01 | Phase 4 | Pending |
| RECRUIT-02 | Phase 4 | Pending |
| RECRUIT-03 | Phase 4 | Pending |
| RECRUIT-04 | Phase 4 | Pending |
| RECRUIT-05 | Phase 4 | Pending |
| CONTACT-01 | Phase 4 | Pending |
| CONTACT-02 | Phase 4 | Pending |
| CONTACT-03 | Phase 4 | Pending |
| FORM-01 | Phase 4 | Pending |
| FORM-02 | Phase 4 | Pending |
| GALLERY-01 | Phase 5 | Pending |
| GALLERY-02 | Phase 5 | Pending |
| FEES-01 | Phase 5 | Pending |
| SITE-05 | Phase 6 | Pending |
| A11Y-01 | Phase 6 | Pending |
| A11Y-02 | Phase 6 | Pending |
| A11Y-03 | Phase 6 | Pending |
| LEGAL-01 | Phase 6 | Pending |
| LEGAL-02 | Phase 6 | Pending |
| LAUNCH-01 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 37 total
- Mapped to phases: 37 ✓
- Unmapped: 0

---
*Requirements defined: 2026-08-12*
*Last updated: 2026-08-12 after roadmap creation (traceability populated) + Polish-language requirement (SITE-06, CMS-03)*
