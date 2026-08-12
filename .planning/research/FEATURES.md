# Feature Research

**Domain:** Polish public municipal nursery (żłobek gminny) — informational website for a *jednostka organizacyjna* of a gmina
**Researched:** 2026-08-12
**Confidence:** HIGH (compliance features verified against gov.pl guidance + ustawa o dostępności cyfrowej; section content verified against live żłobek gminny sites)

> Scope note: This project is an **informational** public-sector site. "Table stakes" here means *either* (a) parents expect it or the site looks unprofessional, *or* (b) it is a legal obligation for a Polish public body. Both are non-negotiable for launch. Differentiators are what make it beautiful and genuinely useful and clearly beat the Białobrzegi anti-reference.

## Feature Landscape

### Table Stakes (Users Expect These / Legally Required)

Missing any of these = the site looks incomplete, unprofessional, or is legally non-compliant for a public body.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Aktualności** (news list + article pages) | Parents check for closures, group changes, adaptation info, holiday hours | MEDIUM | Staff-editable via git CMS. Needs list view + individual post view + date. Categories optional (see differentiators). |
| **O nas** (mission, values, care philosophy, kadra, plan dnia) | Parents want to know who cares for their child and the daily rhythm | LOW | Mostly static content. See Section Content Map below. |
| **Rekrutacja** (harmonogram, kryteria, wnioski/PDF, online form) | The #1 conversion task — parents come to enrol | MEDIUM | Downloadable PDF forms + email-only online application. See Section Content Map. |
| **Dokumenty** (downloadable regulations & forms) | Statut, regulamin, RODO, forms must be publicly retrievable | LOW-MEDIUM | Staff-uploadable via git CMS. List with file type/size/date. |
| **Kontakt** (address, phone, email, hours, map, contact form) | Parents need to reach the żłobek and find it | MEDIUM | Email-only contact form + embedded map. See Section Content Map. |
| **Deklaracja dostępności** | **Legal obligation** — ustawa z 4.04.2019 o dostępności cyfrowej. Fines for missing/incomplete declaration. | MEDIUM | Must be a fully-accessible HTML page even if site were not. Required content: conformance status (pełna/częściowa/brak), assessment method + date, data teleadresowe + wyznaczona osoba/koordynator ds. dostępności, procedura wnioskowo-skargowa (7-day response, max 2-month extension, RPO escalation link), **dostępność architektoniczna** of the building. Annual review by **31 March**. |
| **BIP link** (out to existing naszbip) | **Legal obligation** — public body must expose a BIP; must be prominent | LOW | Link only to `https://ugstromiec.naszbip.pl/zlobek`. Do NOT rebuild. |
| **RODO / klauzula informacyjna + consent on forms** | **Legal obligation** — forms carry a child's personal data | LOW-MEDIUM | Consent checkbox (unchecked by default) + linked/inline klauzula informacyjna (administrator, cel, podstawa prawna, okres, prawa, IOD). Also a general RODO/Polityka prywatności page. |
| **Accessibility widget** (font-size, contrast, high-contrast, reset) | De-facto standard on every Polish public site; reviewers expect it | LOW-MEDIUM | Toolbar: A/A+/A++, high-contrast toggle, reset. Note: a widget does NOT replace real WCAG 2.1 AA in the markup — both required. |
| **WCAG 2.1 AA baseline** | **Legal obligation** underlying the declaration | HIGH | Semantic HTML, alt text, keyboard nav, focus states, contrast, skip-links, heading hierarchy. Must be built-in from phase 1, not bolted on. Palette (blue/yellow/orange/red) needs contrast-checked pairings. |
| **Cookie consent banner** | RODO/ePrivacy expectation; needed if any analytics/embeds set cookies | LOW | Keep minimal — if the site sets no non-essential cookies, a short informational notice suffices. Avoid heavy CMPs. |
| **Godziny otwarcia** (opening hours) | Basic operational info parents scan for immediately | LOW | Surface on homepage + Kontakt. |
| **Mapa dojazdu** (location map) | Parents need to find the physical building | LOW-MEDIUM | Embedded map (OpenStreetMap/Leaflet preferred over Google to avoid extra cookies/consent). Static image map is an acceptable low-cost fallback. |
| **Polish-language throughout** | Audience is local Polish parents | LOW | `lang="pl"`, Polish date/number formats, diacritics correct. |
| **Mobile-first responsive** | Most parents arrive on phones | MEDIUM | Core Value depends on info being "immediately visible" on any device. |

### Differentiators (Competitive Advantage)

These make the site beautiful and genuinely useful, and clearly exceed the dated Białobrzegi anti-reference. Not legally required.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Joyful homepage hero** with the core message verbatim | Emotional reassurance in the first 2 seconds — the project's Core Value | MEDIUM | Warm palette, child-friendly imagery, the „Drogi Rodzicu…" message front-and-centre. This is the single biggest differentiator vs. anti-reference. |
| **Galeria / photo gallery** | Parents want to *see* the space and daily life; builds trust and warmth | MEDIUM | Often split per group/sala (as on zlobekwysoka.pl). Needs lazy-loading, alt text, lightbox. Git-CMS-managed. Watch RODO: consent for photographing children — use placeholders/staged photos first. |
| **Jadłospis** (weekly menu) | High-frequency practical value; parents check meals often | LOW-MEDIUM | Either a staff-editable page or an uploaded weekly PDF. PDF is lowest-cost but less accessible; a simple CMS-editable table is better for WCAG. |
| **Aktualności with categories/tags** | Helps parents filter (rekrutacja / wydarzenia / komunikaty) | LOW-MEDIUM | Adds polish once volume grows; not needed day one. |
| **Kalendarz / wydarzenia** (calendar of events, closures, holidays) | At-a-glance planning of dni wolne, uroczystości, przerwy | MEDIUM | Can start as a simple list of upcoming dates rather than a full calendar widget. Full interactive calendar = higher cost, marginal gain. |
| **Opłaty / cennik** (fees) | Parents ask about cost early; transparency reduces phone/email load | LOW | Static content or a document. Values change → keep CMS-editable or as a dated document. |
| **Plan dnia** (daily schedule) as a visual timeline | Reassures parents about routine; joyful design opportunity | LOW | Belongs in O nas; a designed timeline reads far better than a paragraph. |
| **Kadra** (staff intro, optionally with photos) | Humanises the żłobek; trust | LOW | Photos require staff RODO consent — text-only is a safe default. |
| **ePUAP / skrytka ePUAP + Elektroniczna Skrzynka Podawcza** | Public bodies are expected to offer an official e-correspondence channel | LOW | Display the ePUAP address / skrytka on Kontakt. Link-out only — no integration to build. |
| **Newsletter** | Push updates to parents without them checking the site | MEDIUM-HIGH | Conflicts with the no-database / data-minimisation stance (storing emails = RODO surface + a provider). Recommend **defer** — RSS of Aktualności is a zero-storage alternative. |
| **Contrast-safe joyful design system** | Turns a compliance constraint (WCAG contrast) into a polished, consistent look | MEDIUM | Pre-validate blue/yellow/orange/red pairings for AA; document tokens. Prevents rework. |

### Anti-Features (Commonly Requested, Often Problematic)

Deliberately NOT built. Documented to prevent scope creep and legal/cost risk. Most are already in PROJECT.md "Out of Scope" — reinforced here with reasoning.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Parent accounts / login / portal** | Feels "modern"; per-parent info | Auth = user data store, RODO surface, security burden, ongoing maintenance — massive cost for an informational site | Public informational pages; official matters via ePUAP/BIP. |
| **Online fee payments** | Convenience | Payment processor, PCI concerns, reconciliation, contracts — disproportionate for a tiny public żłobek | Publish opłaty + bank/przelew details; payments handled by gmina's existing processes. |
| **Storing applicant/inquiry data in a DB** | "We might want records" | Directly contradicts RODO data-minimisation and the near-zero-cost/no-DB constraint; creates a breach liability | **Email-only** submissions (Worker + Resend) — no persistence. |
| **Live chat** | Trendy engagement | Requires staffing during hours, third-party script (cookies/RODO), fails when unmanned → looks worse than none | Prominent phone + email + contact form; clear godziny otwarcia. |
| **Multi-language / English version** | "Inclusive" | Doubles content upkeep for staff; audience is local Polish parents; near-zero non-Polish demand | Polish only. (Accessibility, not translation, is the real inclusion obligation here.) |
| **Rebuilding BIP on the new site** | "Everything in one place" | BIP is a regulated system already live on naszbip; duplicating risks inconsistency and non-compliance | Prominent link-out to `ugstromiec.naszbip.pl/zlobek`. |
| **Heavy third-party embeds** (Google Maps w/ tracking, social widgets, video trackers) | Familiar, "free" | Set tracking cookies → trigger consent complexity + RODO/Schrems concerns; hurt performance & WCAG | Privacy-friendly OSM/Leaflet map; static links to social pages instead of embeds. |
| **Comments on Aktualności** | Engagement | Moderation burden, spam, RODO (user data), abuse risk | One-way announcements; contact form for feedback. |
| **Full CMS with WYSIWYG hosting cost** | Easier editing | Contradicts near-zero-cost + no-DB | Git-based CMS (Sveltia/Decap) — free, staff self-edit, commits trigger Cloudflare rebuild. |
| **Newsletter with stored subscriber list** | Retention | Adds a data store + provider + consent management → violates the minimisation stance | Defer; offer RSS feed of Aktualności instead. |

## Section Content Map (the 5 committed sections)

What actually belongs inside each committed section — verified against live żłobek gminny sites (Wysoka, Kiełczów, Długołęka, Oleśnica).

**Aktualności**
- Reverse-chronological post list (title, date, excerpt, optional thumbnail)
- Individual post page (heading, date, body, images, downloadable attachments)
- Typical post types: zamknięcie/dni wolne, podział na grupy, informacje o adaptacji, uroczystości, komunikaty rekrutacyjne
- Optional: categories/tags, RSS (differentiators)

**O nas**
- Misja / wartości / filozofia opieki (warm, parent-facing)
- Plan dnia (daily rhythm — strong visual-timeline opportunity)
- Kadra / zespół (text; photos optional w/ consent)
- Baza / sale / place zabaw (the space, safety, play-based development)
- Optional: historia placówki, organ prowadzący (Gmina Stromiec) statement

**Rekrutacja**
- Harmonogram rekrutacji (dates/stages)
- Kryteria przyjęć (ustawowe + gminne, punktacja)
- Wymagane dokumenty
- **Wnioski/formularze do pobrania (PDF)** — karta zgłoszenia, deklaracja kontynuacji, oświadczenia
- **Online application form** → emails `zlobek@ugstromiec.pl` (no storage) + RODO consent + Turnstile
- Zasady odpłatności / opłaty (or link to Opłaty)
- Optional: status/wyniki rekrutacji (as an Aktualności post or downloadable list — no per-applicant login)

**Dokumenty**
- Statut żłobka, Regulamin organizacyjny
- Klauzula informacyjna RODO
- Rekrutacja forms (may cross-link from Rekrutacja)
- Procedury (np. przyprowadzania/odbioru dzieci, bezpieczeństwa)
- Each entry: title, file type + size, last-updated date; staff-uploadable via git CMS

**Kontakt**
- Adres, telefon, e-mail (`zlobek@ugstromiec.pl` — confirm spelling)
- Godziny otwarcia / godziny pracy administracji
- Mapa dojazdu (privacy-friendly embed or static)
- Dane organu prowadzącego (Urząd Gminy Stromiec) + NIP/REGON if applicable
- ePUAP / skrytka (differentiator)
- **Contact form** → emails the żłobek (no storage) + RODO consent + Turnstile

## Feature Dependencies

```
[Git-based CMS (Sveltia/Decap)]
    └──enables──> [Aktualności] , [Dokumenty], [Galeria], [Jadłospis], [Opłaty]

[Email-send Worker + Resend]
    └──requires──> [Turnstile spam protection]
    └──requires──> [RODO consent + klauzula informacyjna]
        └──used-by──> [Rekrutacja online form] , [Kontakt form]

[WCAG 2.1 AA baseline markup]
    └──required-for──> [Deklaracja dostępności] (declaration describes the real state)
    └──enhanced-by──> [Accessibility widget] (widget ≠ substitute for AA)

[Design system w/ contrast-checked palette]
    └──required-for──> [Joyful hero] , [WCAG AA] , [all pages]

[Public body status]
    └──requires──> [BIP link] , [Deklaracja dostępności] , [RODO page] , [koordynator ds. dostępności contact]
```

### Dependency Notes

- **Forms require Turnstile + RODO consent before they can ship:** a public form collecting a child's data without a klauzula informacyjna is non-compliant; without Turnstile it will be spammed.
- **Deklaracja dostępności depends on the real WCAG state:** write the declaration *after* the AA baseline is built so the conformance claim (pełna/częściowa) is truthful — a false claim is itself a violation.
- **Accessibility widget does not satisfy the law:** it enhances UX but the underlying markup must independently meet AA. Do not treat the widget as the compliance deliverable.
- **CMS is the backbone for all editable content:** Aktualności, Dokumenty, and every differentiator content type (Galeria, Jadłospis, Opłaty) depend on it, so it should land early.
- **Contrast-checked design system gates both aesthetics and compliance:** the blue/yellow/orange/red palette must be validated for AA *before* mass page building to avoid rework.

## MVP Definition

### Launch With (v1)

- [ ] Joyful, mobile-first homepage with core message + godziny otwarcia — the Core Value
- [ ] Aktualności (list + post pages), CMS-editable — essential ongoing comms
- [ ] O nas (misja, plan dnia, kadra) — trust
- [ ] Rekrutacja (harmonogram, kryteria, PDF forms + online email form) — primary conversion task
- [ ] Dokumenty (statut, regulamin, RODO, forms) — legal + practical
- [ ] Kontakt (details, hours, map, email form) — reachability
- [ ] Deklaracja dostępności — legal, blocking
- [ ] BIP link (prominent) — legal, blocking
- [ ] RODO klauzula + consent on both forms; RODO/Polityka prywatności page — legal, blocking
- [ ] Accessibility widget + WCAG 2.1 AA baseline — legal + expected
- [ ] Turnstile on both forms — anti-spam, blocking for forms
- [ ] Polish-language throughout

### Add After Validation (v1.x)

- [ ] Galeria — once real, consent-cleared photos exist (placeholders at launch)
- [ ] Jadłospis — once staff commit to updating it weekly
- [ ] Opłaty / cennik page — trigger: parents keep asking about cost
- [ ] Aktualności categories/tags — trigger: post volume makes scanning hard
- [ ] Kalendarz / wydarzenia (start as upcoming-dates list) — trigger: recurring events

### Future Consideration (v2+)

- [ ] Full interactive calendar widget — defer: marginal value over a list
- [ ] Newsletter (only if a compliant no-store or provider-managed path is accepted) — defer: conflicts with data-minimisation
- [ ] RSS feed of Aktualności — cheap, no storage; add opportunistically as the newsletter alternative

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Joyful homepage hero + core message | HIGH | MEDIUM | P1 |
| Aktualności (CMS) | HIGH | MEDIUM | P1 |
| O nas | HIGH | LOW | P1 |
| Rekrutacja (PDF + email form) | HIGH | MEDIUM | P1 |
| Dokumenty (CMS) | HIGH | LOW | P1 |
| Kontakt (details + map + form) | HIGH | MEDIUM | P1 |
| Deklaracja dostępności | HIGH (legal) | MEDIUM | P1 |
| BIP link | HIGH (legal) | LOW | P1 |
| RODO consent + klauzula + privacy page | HIGH (legal) | LOW-MEDIUM | P1 |
| WCAG 2.1 AA baseline | HIGH (legal) | HIGH | P1 |
| Accessibility widget | MEDIUM | LOW-MEDIUM | P1 |
| Turnstile on forms | HIGH | LOW | P1 |
| Godziny otwarcia | MEDIUM | LOW | P1 |
| Mapa dojazdu | MEDIUM | LOW-MEDIUM | P1 |
| Galeria | HIGH | MEDIUM | P2 |
| Jadłospis | MEDIUM | LOW-MEDIUM | P2 |
| Opłaty / cennik | MEDIUM | LOW | P2 |
| Kalendarz / wydarzenia | MEDIUM | MEDIUM | P2 |
| Aktualności categories | LOW | LOW-MEDIUM | P2 |
| ePUAP address on Kontakt | MEDIUM (public-body norm) | LOW | P2 |
| Newsletter | LOW | MEDIUM-HIGH | P3 |
| RSS feed | LOW | LOW | P3 |

**Priority key:** P1 = must have for launch · P2 = add when possible · P3 = future.

## Competitor Feature Analysis

| Feature | zlobekwysoka.pl (positive reference) | zlobek.bialobrzegi.pl (anti-reference) | Our Approach |
|---------|--------------------------------------|----------------------------------------|--------------|
| Visual design | Clean, functional | Dated, oversimplified | Modern, joyful, warm palette — clearly above both |
| Sections | Aktualności, O nas, Galeria, Rekrutacja, RODO, ePUAP, Kontakt | Basic/minimal | The 5 committed + curated differentiators |
| Galeria | Yes, per-group | Sparse | Yes, per-sala, lazy-loaded, consent-safe placeholders first |
| Accessibility widget | Yes (text size, contrast, readable fonts) | Weak | Yes + genuine WCAG 2.1 AA underneath |
| Deklaracja dostępności | Yes | Present but thin | Full, truthful, annually reviewed (31 March) |
| BIP / ePUAP | BIP + ePUAP links | BIP link | Prominent BIP link-out + ePUAP address |
| Forms | Downloadable PDFs | Downloadable PDFs | PDFs **plus** email-only online form (no storage) + Turnstile |
| Jadłospis | Not shown in nav | — | Optional differentiator (CMS or PDF) |
| CMS/editing | Szkolnastrona-style hosted CMS (paid pattern) | Hosted CMS | Free git-based CMS (Sveltia/Decap) — no DB, near-zero cost |

## Sources

- [gov.pl — Jak przygotować deklarację dostępności](https://www.gov.pl/web/dostepnosc-cyfrowa/jak-przygotowac-deklaracje-dostepnosci) — HIGH (official)
- [gov.pl — Omówienie wymogów dostępności cyfrowej dla podmiotów publicznych](https://www.gov.pl/web/dostepnosc-cyfrowa/omowienie-wymogow-dostepnosci-cyfrowej-dla-podmiotow-publicznych) — HIGH (official)
- [gov.pl — Jakie akty prawne dotyczą dostępności cyfrowej](https://www.gov.pl/web/dostepnosc-cyfrowa/jakie-akty-prawne-dotycza-dostepnosci-cyfrowej) — HIGH (official)
- [Ustawa z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych](https://orka.sejm.gov.pl/proc8.nsf/ustawy/3119_u.htm) — HIGH (legal text)
- [Fundacja Widzialni — Ustawa o dostępności cyfrowej w pytaniach i odpowiedziach](https://widzialni.org/ustawa-o-dostepnosci-cyfrowej-w-pytaniach-i-odpowiedziach,new,mg,6,362) — MEDIUM (authoritative NGO)
- [Żłobek Gminny w Wysokiej](https://zlobekwysoka.pl/) — HIGH (live positive reference: sections, accessibility toolbar, BIP/ePUAP, Deklaracja)
- [Rekrutacja — Gminny Żłobek w Kiełczowie](https://zlobekkielczow.pl/rekrutacja/) — MEDIUM (Rekrutacja content pattern)
- [zlobek.dlugoleka.pl — Rekrutacja](https://zlobek.dlugoleka.pl/category/rekrutacja1/) — MEDIUM (Rekrutacja content pattern)
- [Żłobek Gminny w Oleśnicy](http://zlobekgminnyolesnica.szkolnastrona.pl/) — MEDIUM (hosted-CMS pattern comparison)
- PROJECT.md (this repo) — committed scope, constraints, anti-reference

---
*Feature research for: Polish public municipal nursery (żłobek gminny) informational website*
*Researched: 2026-08-12*
