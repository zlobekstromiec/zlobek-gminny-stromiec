# Żłobek Gminny Stromiec — Public Website

## What This Is

A modern, joyful public website for the municipal nursery (**żłobek gminny**) in Stromiec — a *jednostka organizacyjna* of Gmina Stromiec, operating under the Urząd Gminy Stromiec (`ugstromiec.pl`). It serves parents and prospective parents with a mobile-first, easy-to-navigate experience where all essential information is immediately visible. The site has five primary sections: **Aktualności**, **O nas**, **Rekrutacja**, **Dokumenty**, **Kontakt**.

## Core Value

A parent lands on the site and, within seconds, **both feels the żłobek's warmth and finds the exact information they need** — how to enrol, which documents to download, and how to make contact — on any device. Emotional reassurance and effortless information access, together, are the one thing that must work.

## Requirements

### Validated

- [x] Homepage hero that leads with the żłobek's core message and "pops with joy" the moment a parent opens it — *Validated in Phase 1: Live Homepage & Design Foundation (live on `zlobek-gminny-stromiec.pages.dev`, placeholder content)*
- [x] Mobile-first responsive design that works across all device types — *Validated in Phase 1 (phone/tablet/desktop Playwright matrix green)*
- [x] Deployed on Cloudflare (org-standard hosting) — *Validated in Phase 1 (Pages git-integration, push→auto-redeploy proven)*
- [x] **O nas** — about the żłobek (mission, values, team, the care philosophy) — *Validated in Phase 2: About, Documents & CMS (prerendered `/o-nas`, axe AA green, placeholder content)*
- [x] **Dokumenty** — downloadable documents (regulations, forms), uploadable by staff — *Validated in Phase 2 (self-hosted downloads with build-time type/size metadata; staff-manageable via CMS)*
- [x] Git-based CMS (Sveltia/Decap) so staff self-edit news & documents at near-zero cost — *Validated in Phase 2 for O nas + documents (live login-edit-commit-rebuild loop proven on Pages; OAuth Worker; Polish light-theme admin). News collection validated in Phase 3.*
- [x] **Aktualności** — news/announcements section, editable by staff without a developer — *Validated in Phase 3: News (prerendered `/aktualnosci` list + post pages + homepage preview; UAT proved the full staff round trip: /admin create → GitHub commit → Pages rebuild → live post with correct date-prefixed URL)*

- [x] **Galeria** — a photo gallery of the żłobek, with staff adding and removing photos themselves — *Validated in Phase 5: Gallery & Fees (`/o-nas#galeria` with a keyboard-operable lightbox; live UAT proved the full round trip: /admin/galeria → GitHub commit → Pages rebuild → photo visible, then removed, with both hand-placed seed photos untouched)*
- [x] **Cennik** — a fees page a parent can read, with the amounts editable by staff — *Validated in Phase 5 (prerendered `/cennik`; live UAT proved a panel save reaches the public page with the amounts computed exactly as the panel's echo showed)*

### Active
- [ ] **Rekrutacja** — enrollment info + downloadable PDF forms **and** an online application form that emails submissions to the żłobek (no data storage)
- [ ] **Kontakt** — contact details, location/map, and a contact form that emails the żłobek
- [ ] WCAG 2.1 AA accessibility + published **Deklaracja dostępności** (legal requirement for a public body)
- [ ] Prominent **BIP** link out to the existing BIP (`https://ugstromiec.naszbip.pl/zlobek`)
- [ ] RODO consent checkbox + *klauzula informacyjna* on all forms; spam protection (Cloudflare Turnstile)
- [ ] Polish-language throughout — the entire public site **and** the CMS admin portal (staff assumed not to read English)

### Out of Scope

- Application/inquiry **data storage or database** — submissions are emailed only — *cost minimization and RODO data-minimization*
- Online fee payment / payment processing — *not needed for v1*
- Parent accounts / login / portal — *the site is informational; no per-parent auth needed*
- Multi-language / English version — *audience is local Polish parents*
- Building or hosting BIP itself — *BIP already exists externally on naszbip; we only link to it*
- Paid headless CMS — *cost; git-based CMS satisfies staff self-editing for free*

## Context

- **Organization:** Public żłobek, a *jednostka organizacyjna* of Gmina Stromiec, under Urząd Gminy Stromiec. Institutional email domain: `ugstromiec.pl`.
- **Owned domain (ours):** `zlobekstromiec.pl` — we own it and control its DNS on Cloudflare. It is the public site domain **and** the Resend sending domain (SPF/DKIM/DMARC live here, fully under our control). Distinct from the Gmina's `ugstromiec.pl`, whose DNS we do **not** control.
- **Core message (feature verbatim on the homepage):**
  > „Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej pociechy. Będziemy cierpliwie ocierać łzy, kołysać do snu i z autentycznym zachwytem świętować każde małe zwycięstwo — od samodzielnie zjedzonej zupki po pierwszy, odważny krok."
- **Palette (as requested):** niebieski (blue), żółty (yellow), pomarańczowy (orange), czerwony (red) — a warm, joyful, child-friendly scheme.
- **Anti-reference:** https://zlobek.bialobrzegi.pl/ — the client dislikes this: dated, oversimplified. We deliberately go *above and beyond* — a beautiful, modern design bursting with joy, with every essential piece of information right in front of the parent.
- **BIP:** https://ugstromiec.naszbip.pl/zlobek (link out; do not rebuild).
- **Form recipient:** `publicznyzlobek@ugstromiec.pl` — **given in writing by the Urząd Gminy on 2026-08-27**, replacing the earlier `zlobek@` address on the same domain, which was never a real mailbox. A `cc` copy also goes to the clerk handling recruitment, and that recipient is disclosed in the klauzula informacyjna. This is the Gmina/żłobek mailbox on the Gmina's `ugstromiec.pl` domain and is the RODO recipient inbox (Gmina/żłobek = data controller). We do **not** control `ugstromiec.pl` DNS.
- **Email sending:** Cloudflare ended its free MailChannels sending integration in 2024, so form emails are sent via **Resend** (free tier) **from our owned domain `zlobekstromiec.pl`** (SPF/DKIM/DMARC on our Cloudflare DNS; dedicated send subdomain `send.zlobekstromiec.pl`) and **delivered to the Gmina mailbox `publicznyzlobek@ugstromiec.pl`** (the earlier `zlobek@` never existed as a mailbox and was replaced 2026-08-27). No inbound mailbox is needed on our side, and **no DNS changes on `ugstromiec.pl` are required**.
- **Content strategy:** Build with realistic **placeholders** first (text, photos, a designed logo treatment), swap in real content later.
- **Candidate stacks:** Cloudflare-friendly frameworks (SvelteKit or Astro on Cloudflare Pages) — final choice to be set by research (STACK.md).

## Constraints

- **Tech stack**: Cloudflare hosting (Pages/Workers) — all org projects live there and the CLI is connected — *keeps ops consistent and deploy path known*
- **Budget**: Minimize running cost — near-zero hosting, free tiers (git-based CMS, Resend free, Turnstile free), **no database** — *public body with tight budget*
- **Legal — Accessibility**: WCAG 2.1 AA + Deklaracja dostępności under *ustawa o dostępności cyfrowej* (EU Directive 2016/2102) — *mandatory for public-sector sites*
- **Legal — RODO/GDPR**: Form submissions carry a child's personal data → consent checkbox + *klauzula informacyjna* required — *lawful processing*
- **Legal — BIP**: Public body must expose a BIP — *satisfied by linking to existing naszbip BIP*
- **Language**: Polish only — the entire public site **and** the CMS admin portal (field labels, hints, editor UI where supported); assume staff and visitors do not read English — *local audience in Stromiec*
- **Design**: Must convey joy/warmth instantly, be mobile-first, and clearly exceed the Białobrzegi reference — *primary client expectation*

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Git-based CMS (Sveltia/Decap) over paid headless CMS | Staff self-edit news/documents at near-zero cost, no database, commits to repo → Cloudflare rebuilds | ✓ Working (Phases 2-3: live edit→commit→rebuild loop proven for O nas, Dokumenty and Aktualności) |
| News dates stored ISO (`YYYY-MM-DD`), Polish `DD.MM.RRRR` only in the picker display; slug substitutes the stored date verbatim | Date-transformed slugs minted wrong/dateless URLs for most days of the month (CR-01) | ✓ Working (verified live with a day-14 post) |
| Aktualności reader is the single validation boundary: malformed CMS entry is skipped with a build warning, required fields reject the entry, optional fields degrade | One bad staff edit must never take down the site build; components stay guard-free | ✓ Working (pinned by unit suite + malformed-entry build test) |
| Rekrutacja & Kontakt forms are email-only (no storage) via Cloudflare Worker + email provider (Resend) | Lowest cost + minimizes RODO surface; volume is tiny | — Pending |
| Send form email **from** our owned domain `zlobekstromiec.pl` (DNS on Cloudflare) → **deliver to** Gmina mailbox `publicznyzlobek@ugstromiec.pl` (replaced the never-existing `zlobek@` on 2026-08-27) | We control SPF/DKIM/DMARC on our own domain, so deliverability no longer depends on Gmina IT or `ugstromiec.pl` DNS | ✓ Decided |
| Cloudflare Turnstile for form spam protection | Free, Cloudflare-native, no third-party CAPTCHA cost | — Pending |
| BIP handled by linking to existing naszbip page (not rebuilt) | Legal obligation met externally; avoids duplicating a regulated system | — Pending |
| Placeholder content first, real content later | Keeps build momentum while client gathers assets | — Pending |
| Host on Cloudflare | Org standard; CLI already connected | ✓ Working (Pages git-integration live since Phase 1) |
| Polish across the whole product, including CMS admin portal | Staff and visitors in Stromiec assumed not to read English; Polish field labels/hints written in CMS config | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-17 after Phase 5 completion — Galeria and Cennik live end-to-end, both staff-editable through the custom Polish panel; live UAT proved the save → commit → rebuild → publish round trip for each. The phase's security review closed three high-severity threats found only because every claimed mitigation was re-checked by an adversarial second pass.*
