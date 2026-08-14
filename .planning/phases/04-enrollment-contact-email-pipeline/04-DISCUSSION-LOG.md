# Phase 4: Enrollment, Contact & Email Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-08-14
**Phase:** 4-enrollment-contact-email-pipeline
**Areas discussed:** Enrollment form scope, Form UX & failure handling, Page composition

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Enrollment form scope | Online application scope vs official BIP wniosek | ✓ |
| Form UX & failure handling | Submission behavior, success/failure UX, anti-silent-loss | ✓ |
| Page composition | Layout of /rekrutacja and /kontakt, map treatment | ✓ |
| CMS editability scope | RECRUIT-05 minimal vs full Ustawienia strony singleton | |

**User's choice:** First three areas; CMS editability rejected outright.
**Notes:** "no cms editability scope for this at all, we need to get the V1 out today without cms" - RECRUIT-05's info-editing side descoped; documents half already satisfied by the Phase 2 dokumenty collection.

---

## Enrollment form scope

### Form role vs paper wniosek

| Option | Description | Selected |
|--------|-------------|----------|
| Light zgloszenie (Recommended) | Expression-of-interest form; minimal child data; formal wniosek stays the downloadable DOC | ✓ |
| Full application mirror | Replicate official wniosek fields; heavy RODO surface | |
| Middle: pre-application | Child name + birth date + commune check + start month | |

### Form fields

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal set (Recommended) | Parent name, e-mail (Reply-To), phone optional, child birth month/year, message; no child name | ✓ |
| Minimal + child name | Adds child's first name | |
| Eligibility set | Adds commune checkbox + preferred start date | |

### Klauzula informacyjna presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Expandable under form (Recommended) | Consent line + collapsed details with full klauzula inline | ✓ |
| Link to polityka-prywatnosci | Checkbox links to the legal page | |
| Both | Inline + legal page copy | |

### Contact form shape

| Option | Description | Selected |
|--------|-------------|----------|
| Name/email/message (Recommended) | Three fields + consent + Turnstile, no topic selector | ✓ |
| With topic select | Adds temat dropdown as subject prefix | |
| Single shared form | One component for both pages with conditional fields | |

**Notes:** With this answer the user flagged `dane-bip-zlobek-stromiec.md` (repo root): use it in Phase 4 to replace placeholder data across the ENTIRE website. Doc read; became the top canonical ref and spawned the data-decisions batch below.

### Data decisions from dane-bip-zlobek-stromiec.md

| Question | Options | Selected |
|----------|---------|----------|
| Nabor 2026/2027 state | Closed + waitlist (Rec.) / Closed + archival schedule / Keep open | Closed + waitlist |
| Public e-mail conflict | Keep zlobek@ (Rec.) / Forms only, hide public email / Keep but placeholder-flag | Keep zlobek@ |
| Phone display | No phone yet (Rec.) / Show 510-094-051 / Keep fake placeholder | Show 510-094-051 |
| Fees presentation | 1500 zl + ZUS note (Rec.) / Conditional 0 zl lead / Full breakdown only | 1500 zl + ZUS note |

**Notes:** Phone choice overrides the doc's "do not publish until confirmed sluzbowy" caution - captured as a launch-gate caveat, not re-litigated.

---

## Form UX & failure handling

### Submission mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Island + API endpoints (Recommended) | Hydrated form islands fetch-POST to dedicated dynamic endpoints; pages stay prerendered | ✓ |
| Native POST + result page | Plain HTML POST, full reload, form page not prerenderable | |

### Success UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline confirmation (Recommended) | Form swaps to success panel in place | ✓ |
| Dedicated /dziekujemy page | Redirect to thank-you route | |

### Failure UX

| Option | Description | Selected |
|--------|-------------|----------|
| Error + direct fallback (Recommended) | Inline error keeps typed values, states NOT sent, shows phone + mailto fallback | ✓ |
| Retry-only error | Generic sprobuj ponownie | |

### Anti-silent-loss guard

| Option | Description | Selected |
|--------|-------------|----------|
| BCC backup mailbox (Recommended) | Every form email BCCs org-controlled backup until gmina deliverability proven | ✓ |
| Resend dashboard only | Rely on Resend logs, nobody alerted | |
| Webhook endpoint | Proper long-term answer, new infra | |

**Notes:** Initial answer to this question was a freeform strategic note: GitHub org infrastructure will be moved away from later; Sveltia CMS is getting replaced with a simpler option for non-technical staff. Phase 4 must stay CMS-agnostic. BCC chosen ("1.") in the plain-text follow-up.

---

## Page composition

### /rekrutacja structure

| Option | Description | Selected |
|--------|-------------|----------|
| Status-first (Recommended) | Closed banner -> form -> kryteria -> procedura -> wnioski -> klauzula | ✓ |
| Info-first | Kryteria first, form at bottom | |
| Form-only page | Status + form + link to /dokumenty | |

### Fee block on /rekrutacja

| Option | Description | Selected |
|--------|-------------|----------|
| Compact fee box (Recommended) | 1500 zl po obnizce, ZUS warunek, wyzywienie max 20 zl, nieobecnosc do 8:00 | ✓ |
| Full breakdown now | Complete 2337/-837/ZUS table (duplicates Phase 5 /cennik) | |
| No fees here | Fees only in keyFacts until Phase 5 | |

### /kontakt composition

| Option | Description | Selected |
|--------|-------------|----------|
| Full page, shared data (Recommended) | Contact cards -> map + directions -> form -> wnioski-to-Urzad-Gminy info box; site.ts shared | ✓ |
| Reuse ContactAndMap + form | Homepage component + appended form | |

### Map treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Static OSM snapshot (Recommended) | Pre-rendered OSM image asset, pin at Radomska 72, external directions link | ✓ |
| Illustrated graphic | Custom brand-styled map illustration | |
| Directions link only | No map image | |

---

## Final gate

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context | Write 04-CONTEXT.md | ✓ |
| Explore more gray areas | Surface additional decision points | |

## Claude's Discretion

- Endpoint route shape, form utilities, Turnstile widget mode, email body format, rate-limit mechanism/thresholds, honeypot extras.
- Form island implementation details within the locked design system.
- Klauzula legal text drafting (PLACEHOLDER for IOD).
- OSM snapshot generation/framing/attribution styling.
- Whether /rekrutacja reuses homepage Recruitment pieces or composes fresh.

## Deferred Ideas

- CMS editability ("Ustawienia strony" singleton) - killed for v1 by user.
- CMS platform migration (Sveltia -> simpler tool) + move off GitHub org infra - future milestone.
- EU funding marking (logos/amounts [BRAK]) - obtain from Urzad Gminy; Phase 6 gate or earlier.
- DOC/DOCX -> PDF conversion of wnioski - Phase 6.
- Resend webhook alerting - post-v1.
- Confirm 510-094-051 sluzbowy status - launch gate.
- Fee wording confirmation; statut-vs-regulamin eligibility discrepancy - client survey items.
- /cennik full fee breakdown - Phase 5.
