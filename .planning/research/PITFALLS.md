# Pitfalls Research

**Domain:** Polish public-sector municipal nursery (żłobek gminny) website on Cloudflare — git-CMS, email-only forms, WCAG/RODO
**Researched:** 2026-08-12
**Confidence:** HIGH (legal + Cloudflare/email facts cross-checked against primary/official sources; UX/CMS pitfalls from established practice)

> Scope note: This is a *jednostka organizacyjna* of Gmina Stromiec. It is a **podmiot publiczny** under the Polish *ustawa o dostępności cyfrowej* (4 kwietnia 2019), so accessibility and the Deklaracja dostępności are **legal obligations**, not nice-to-haves. Treat every "Critical Pitfall" below as a potential legal or reputational liability for a public body, not just a bug.

---

## Critical Pitfalls

### Pitfall 1: Bright brand palette fails WCAG 2.1 AA contrast (the core design-vs-law tension)

**What goes wrong:**
The requested joyful palette — niebieski, żółty, pomarańczowy, czerwony — is exactly the set that most commonly fails the WCAG 1.4.3 contrast minimum (4.5:1 for normal text, 3:1 for large text/UI). **Yellow and orange text on white is the single worst offender**: yellow (#FFD400-ish) on white is often ~1.3:1, orange ~2:1 — both far below 4.5:1. White text on orange/yellow buttons fails too. Red on white can pass for large text but frequently fails for body text and, critically, red/orange used as the *only* signal for errors or required fields fails 1.4.1 (use of color). For a public body this is not a subjective design critique — it is measurable non-conformance that a citizen or the government auditor (Ministerstwo Cyfryzacji) can flag.

**Why it happens:**
Designers pick brand colors for hue/joy and apply them directly to text and small UI. The palette "looks vibrant" on the designer's calibrated screen, and contrast is never measured until an audit. The tension is real: the client's #1 expectation is "bursting with joy," which pushes toward saturated light colors — the opposite of high contrast.

**How to avoid it:**
Split the palette into two roles up front: **(a) expressive colors** for large decorative surfaces, illustrations, backgrounds, hero shapes, iconography — where contrast rules are looser or N/A — and **(b) a constrained accessible text/UI subset**. Concretely:
- Text and interactive labels use dark ink (near-black, e.g. #1A1A2E) or white **only** on colors dark enough to reach 4.5:1. Reserve yellow/orange for fills behind dark text, never as text on white.
- Derive darker "accessible" variants of each brand hue (e.g. a deep blue #14487F and a deep red #C0392B) as the *only* versions allowed on text/buttons; keep the bright versions for fills and art.
- Define this as a token system (e.g. `--brand-yellow` decorative vs `--ink-on-yellow`) so bright never lands on text by accident.
- Buttons: dark blue/red fill + white text passes; yellow/orange fill needs dark text.
- Never signal required fields or errors with color alone — add an asterisk + text + icon (1.4.1).
- Bake contrast checks into design tokens, not into a late audit.

**Warning signs:**
- Any mockup with yellow or orange text on a light background.
- White text on a yellow, light-orange, or light-blue button.
- Designers say "we'll darken it if the audit fails."
- Error states shown only in red with no text/icon.
- Contrast never appears as an acceptance criterion in a UI phase.

**Phase to address:**
Design system / branding phase (define accessible token pairs *before* building components). Verified again in the accessibility/compliance phase.

---

### Pitfall 2: Missing or non-conformant Deklaracja dostępności

**What goes wrong:**
The site ships without a Deklaracja dostępności, or with a hand-written one missing mandatory elements. This is independently penalized: Polish law provides a fine **up to 5 000 zł for a missing declaration** and **up to 10 000 zł for persistent failure to provide digital accessibility**. Most self-written declarations omit required fields and are therefore non-conformant even when present.

**Why it happens:**
Teams treat the declaration as a footer link written the day before launch, unaware it is a regulated document with a fixed required structure and that it must be reachable from the homepage.

**How to avoid it:**
Generate the declaration from the **official government template/tool** (the Deklaracja Dostępności generator provided for podmioty publiczne) so no field is missed. It must include, at minimum:
- Nazwa podmiotu (Żłobek Gminny w Stromcu) and the URL it applies to.
- Data sporządzenia deklaracji + data ostatniej aktualizacji.
- Data publikacji strony + data ostatniej istotnej aktualizacji.
- Status zgodności: **zgodny / częściowo zgodny / niezgodny** with WCAG 2.1 AA, with justification for any inaccessible elements.
- Method of assessment (self-assessment vs external audit).
- **Koordynator/kontakt dostępności**: name/email/phone for accessibility complaints.
- Feedback & complaint procedure, including the path to **Rzecznik Praw Obywatelskich (RPO)** if the response is unsatisfactory.
- Informacje o dostępności architektonicznej of the żłobek building (physical access), which the declaration also typically covers.
- A link/reference tying it to the parent Gmina's BIP where appropriate.
Link it from the homepage footer *and* ensure it is reachable (public bodies conventionally expose it under a stable `/deklaracja-dostepnosci` URL and from BIP).

**Warning signs:**
- Declaration written free-hand in markdown rather than from the official generator.
- No koordynator dostępności contact identified (nobody at the żłobek/gmina assigned).
- Placeholder dates ("TODO") or missing "data istotnej aktualizacji."
- No RPO escalation paragraph.

**Phase to address:**
Compliance/legal phase (dedicated). Requires a client input: who is the koordynator dostępności and their contact details. Flag early — this is a client dependency, not just code.

---

### Pitfall 3: RODO violations on the enrollment/contact forms (children's data)

**What goes wrong:**
The Rekrutacja form collects a **child's** personal data (name, possibly PESEL/date of birth, health notes, parent contacts) and the site processes it without a lawful basis: no consent checkbox, no *klauzula informacyjna* (Art. 13 RODO), data emailed in plaintext, or data unnecessarily stored/logged. Processing a child's data without proper basis is a serious RODO breach for a public body and undermines the parents' trust the whole project is built on.

**Why it happens:**
The team focuses on "make the form email the żłobek" and treats consent/klauzula as boilerplate to bolt on later. Email transport is assumed to be private. Worker logs, error trackers, or the email provider's dashboard silently retain submission contents.

**How to avoid it:**
- **Data minimization first**: on the online Rekrutacja form, collect the *minimum* needed to start contact (parent name, email/phone, child's first name/age band, message). Push full sensitive data (PESEL, health) to the **downloadable PDF submitted in person/officially**, not the web form. This aligns with the project's "no storage" decision and shrinks the RODO surface dramatically.
- Mandatory unticked **consent checkbox** ("Wyrażam zgodę na przetwarzanie danych w celu rozpatrzenia zgłoszenia…") — never pre-checked (invalid consent).
- **Klauzula informacyjna (Art. 13)** visible at the form: administrator danych (Żłobek Gminny w Stromcu, address), inspektor ochrony danych (IOD) contact, purpose + legal basis, retention period, recipients, rights (access/rectification/erasure/complaint to **PUODO**).
- **No storage**: Worker forwards to email and retains nothing — no D1/KV write, no logging of form fields, disable request-body logging, and confirm the email provider's retention (Resend stores sent emails in its dashboard — decide if that is acceptable or purge).
- Transport: send over the provider's HTTPS API (TLS in transit). Do not send children's data to third-party analytics.
- Confirm the **recipient address spelling** (`zlobek@ugstromiec.pl`, brief said `zlobel@` — a typo means submissions silently go nowhere or to a stranger, itself a data-breach risk).

**Warning signs:**
- Consent checkbox pre-checked, or absent.
- No IOD / administrator danych named on the form.
- Form asks for PESEL or health info in v1.
- Worker code has `console.log(formData)` or an error tracker capturing request bodies.
- Recipient email never verified with the client.

**Phase to address:**
Forms/backend phase (consent + klauzula + no-log Worker) and compliance phase (klauzula wording review, IOD contact). Recipient-address confirmation is a client dependency to lock before launch.

---

### Pitfall 4: Assuming free MailChannels email sending still works on Cloudflare

**What goes wrong:**
Old tutorials (2022–2023) show sending email from Cloudflare Workers/Pages Functions for free via MailChannels with zero setup. **That is dead.** MailChannels terminated the free Cloudflare Workers integration — the API stopped accepting requests on/around **30 June 2024** (end-of-life fully in effect by Aug 2024). Building on it means forms silently fail in production.

**Why it happens:**
Search results and LLM training data are saturated with the old MailChannels pattern; it looks like the canonical free path for Cloudflare.

**How to avoid it:**
Use **Resend** (Cloudflare's own docs now redirect here). Free tier: **100 emails/day, 3 000/month** — vastly more than a single żłobek's form volume. Same HTTP POST + Bearer token pattern from a Worker/Pages Function. Steps:
- Verify a sending domain (ideally a subdomain like `mail.zlobek…` or send from the org domain if permitted) — requires DNS access.
- Store the API key as a Worker **secret** (`wrangler secret`), never in the repo or client bundle.
- Set a sensible `from` on a verified domain and a `reply-to` of the submitting parent so staff can reply directly.
- Alternative if org policy forbids Resend: MailChannels' *new* paid Email API (free tier 100/day) or Postmark/Brevo — but Resend is the documented default and lowest-friction on Cloudflare.

**Warning signs:**
- Any code referencing `api.mailchannels.net` without an account/API key.
- Tutorials dated before mid-2024 being followed verbatim.
- "It works locally" but no verified sending domain exists.

**Phase to address:**
Forms/backend phase. Choose provider and verify the sending domain **early** because DNS verification has lead time and needs registrar/Cloudflare DNS access.

---

### Pitfall 5: Form emails land in spam (SPF/DKIM/DMARC not configured)

**What goes wrong:**
Even with Resend wired up, emails to `zlobek@ugstromiec.pl` go to spam or are silently dropped because the sending domain lacks proper **SPF, DKIM, and DMARC** records, or you send `from` a domain you don't control (spoofing `@ugstromiec.pl` directly). For a form whose entire purpose is delivery, this is a total functional failure that is invisible until a parent complains they got no reply.

**Why it happens:**
Deliverability is treated as "email just works." The team sends `from: parent@theiremail` (breaks SPF/DMARC) instead of from a verified domain with reply-to. DNS for `ugstromiec.pl` may be controlled by the gmina/IT, not the project — so DKIM never gets added.

**How to avoid it:**
- Send `from` a **domain you can add DNS records to** and add the DKIM CNAME(s) Resend provides + an SPF include + a DMARC record. Do **not** put the parent's address in `from`; put it in **reply-to**.
- If `ugstromiec.pl` DNS is out of the project's control, either (a) get the gmina IT to add DKIM/SPF for a subdomain, or (b) send from a project-controlled subdomain and set reply-to to the parent.
- After setup, test with mail-tester.com / Gmail "show original" to confirm SPF=pass, DKIM=pass, DMARC=pass.
- Send a **confirmation copy/auto-reply to the parent** and a copy to a secondary staff address so a single spam-filtering event doesn't lose an enrollment.

**Warning signs:**
- `from` uses the submitter's email.
- No DKIM record exists for the sending domain.
- Test emails land in Gmail Promotions/Spam.
- Only one recipient, no fallback, no confirmation to the parent.

**Phase to address:**
Forms/backend phase, immediately after provider choice. Verification requires a live DNS + deliverability test as an acceptance criterion.

---

### Pitfall 6: Email endpoint exposed to abuse (no Turnstile / no rate limiting)

**What goes wrong:**
A public POST endpoint that sends email is a spam relay and cost/abuse vector. Bots discover it and blast submissions — filling staff inboxes, burning the Resend quota (100/day is easy to exhaust), and potentially getting the sending domain blacklisted. Worse, an unvalidated endpoint can be used to send arbitrary content if `to`/`from` are client-controlled.

**Why it happens:**
Turnstile is "planned" but the Worker ships validating only that the form is non-empty. Server-side token verification is skipped (client-side widget only). `to` address comes from the request instead of being hard-coded server-side.

**How to avoid it:**
- **Cloudflare Turnstile** on both forms, and **verify the token server-side** in the Worker (`siteverify`) — a client-only widget is trivially bypassed.
- Hard-code the recipient (`to`) and `from` server-side; never accept them from the request body.
- Add basic **rate limiting** (Cloudflare Rate Limiting rule or a KV/counter per IP) and a honeypot field.
- Validate/limit field lengths and reject on missing consent server-side.
- Cap outbound: fail closed if the daily quota is near exhaustion rather than erroring loudly.

**Warning signs:**
- Turnstile token accepted but never verified in the Worker.
- `to`/`from` read from `request` JSON.
- No rate limit; no honeypot.
- Spike in Resend usage or inbox spam after launch.

**Phase to address:**
Forms/backend phase — Turnstile server verification and hard-coded recipient are non-negotiable acceptance criteria.

---

### Pitfall 7: Git-CMS auth on Cloudflare is harder than Netlify — no built-in Git Gateway

**What goes wrong:**
Decap/Sveltia CMS docs assume Netlify's **Git Gateway + Identity**, which does auth and commits for you. **Cloudflare has no equivalent.** Teams wire up the CMS, hit "Login with GitHub," and get an OAuth failure loop — because there is no OAuth backend. The CMS looks 90% done but cannot actually save edits, discovered late.

**Why it happens:**
Tutorials are Netlify-centric. The missing piece — a small OAuth relay Worker between GitHub and the CMS — isn't obvious until login fails.

**How to avoid it:**
- Deploy a dedicated **OAuth client Worker**. For Sveltia use the official **`sveltia/sveltia-cms-auth`** Worker; for Decap use an equivalent (e.g. `SubhenduX/decap-cms-cloudflare-pages` or a Pages Function OAuth handler).
- Create a **GitHub OAuth App**, set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` as Worker/Pages env vars/secrets, and point the CMS `base_url` at the auth Worker.
- **Strongly prefer Sveltia over Decap** for this project: Sveltia is actively maintained, faster, has a much better media/image experience for non-technical staff, and its auth Worker is purpose-built and documented. Decap's momentum has slowed and its editor is heavier.
- Restrict the OAuth app / repo access so only the żłobek's editor account(s) can commit.
- Test the *full* login→edit→commit→rebuild loop on the real Cloudflare deployment, not just locally.

**Warning signs:**
- CMS config copied from a Netlify tutorial (`git-gateway` backend).
- "Login with GitHub" redirects and errors.
- Auth tested only in local dev.
- No separate OAuth Worker in the project.

**Phase to address:**
CMS integration phase — set up the auth Worker first, then the CMS. Verify the end-to-end commit→deploy loop.

---

### Pitfall 8: Non-technical staff can't actually use the CMS (markdown/media friction, broken builds)

**What goes wrong:**
The CMS technically works but the żłobek staff (not developers) can't operate it: they're confused by markdown, break layout by pasting from Word, upload a 6 MB phone photo that bloats the repo and slows the site, or a malformed entry (missing required frontmatter field, bad date) **breaks the production build** and the whole site goes down until a developer intervenes. For a self-edit-focused project, this defeats the core value.

**Why it happens:**
The CMS is configured for developer convenience, not for a kindergarten administrator. No field validation, no image handling, no preview, no guardrails, no training doc.

**How to avoid it:**
- Configure CMS fields with **strict schemas**: required fields, `widget: datetime`, controlled selects, character hints — so a valid entry is the only entry that can be saved.
- Prefer **rich-text/WYSIWYG widgets** over raw markdown for Aktualności so staff never see syntax.
- Handle images: Sveltia can integrate with an image transform/CDN; at minimum enforce guidance + resize on build. **Never let raw multi-MB originals commit** (see Pitfall 9).
- Give the build **resilience**: a bad content commit should ideally fail the *preview* build, not silently ship a broken site. Consider a build that validates frontmatter and fails loudly with a clear message; keep the last good deploy live (Cloudflare keeps prior deployments — know how to roll back).
- Write a **1-page Polish "instrukcja obsługi"** for staff (how to add news, upload a document, expected image size) and do a live handover.
- Constrain what staff can edit — news + documents only, not layout/config.

**Warning signs:**
- CMS fields are free-text with no validation.
- No image size handling in the pipeline.
- No staff-facing instructions written.
- Only the developer has ever added an entry.

**Phase to address:**
CMS integration phase (schema + image handling + build resilience) and a handover/documentation step near launch.

---

### Pitfall 9: Images bloat the repo and wreck mobile Core Web Vitals

**What goes wrong:**
Two linked failures. (1) Hero and gallery photos are dropped in at full resolution (2–6 MB phone JPEGs). Git-CMS commits them into the repo, so the repo balloons and every clone/build slows. (2) The same unoptimized images ship to visitors, so the **LCP hero image** is huge — on a parent's phone over mobile data the site is slow, hurting the "pops with joy instantly" goal and Core Web Vitals (LCP > 2.5s, layout shift from unsized images).

**Why it happens:**
"Just upload the photo." No responsive image pipeline, no width/height attributes, no format conversion, no lazy-loading. The joyful, photo-heavy design *amplifies* this.

**How to avoid it:**
- Use the framework's image pipeline: **Astro `<Image>`/`astro:assets`** or SvelteKit with `@sveltejs/enhanced-img` / Cloudflare Images/Image Resizing to serve **AVIF/WebP**, correctly sized `srcset`, and explicit dimensions (prevents CLS).
- The **hero image**: preload it, size it responsibly, use `fetchpriority="high"`; lazy-load everything below the fold (`loading="lazy"`).
- Keep source images out of unbounded repo growth: resize/compress before commit, or store originals outside the repo and reference a CDN/transform. Set a max upload guidance for CMS media.
- Budget: target mobile LCP < 2.5s and hero payload in the low hundreds of KB, not MB.
- Test on throttled mobile (Lighthouse mobile / real 4G), not desktop broadband.

**Warning signs:**
- Repo size jumps after content is added.
- Lighthouse mobile LCP > 2.5s; images flagged "properly size / next-gen formats."
- `<img>` without width/height (layout shift).
- Hero is a raw JPEG, not AVIF/WebP responsive.

**Phase to address:**
Framework/foundation phase (choose stack with a first-class image pipeline) and a performance pass before launch.

---

### Pitfall 10: Motion/animation without `prefers-reduced-motion`; keyboard, focus, and tap-target failures

**What goes wrong:**
A "bursting with joy" design leans on animation (bouncing shapes, parallax, autoplay carousels, entrance transitions). Without honoring **`prefers-reduced-motion`** this fails WCAG 2.3.3/2.2.2 and can cause real discomfort (vestibular disorders). Alongside it, the usual AA failures cluster: **keyboard navigation** breaks (custom dropdowns/menus/carousels not operable without a mouse), **focus indicators** are removed or invisible (`outline: none`), and **tap targets** are too small on mobile (below ~24×24 CSS px / 44px comfortable), and animated/auto-advancing content has no pause control.

**Why it happens:**
Joyful motion is added for delight with no reduced-motion fallback; custom interactive components are styled visually but not built on accessible semantics; `outline: none` is applied globally for aesthetics.

**How to avoid it:**
- Wrap all non-essential motion in `@media (prefers-reduced-motion: reduce)` and disable/soften it; no autoplay carousel without a visible pause and no essential info conveyed only via motion.
- Build interactive components from **native/semantic elements** (real `<button>`, `<a>`, `<nav>`, labeled form controls) so keyboard operation is free; test the whole site **tab-only** (visible focus, logical order, no traps, skip-to-content link).
- **Never remove focus outlines** — style them to match the brand instead (a visible, high-contrast focus ring).
- Ensure **tap targets ≥ 44×44px** with spacing on mobile (menu, buttons, form fields, download links).
- Provide visible `:focus-visible` states that themselves meet contrast.

**Warning signs:**
- CSS/JS animations with no reduced-motion media query.
- `outline: none` anywhere in the stylesheet.
- Carousel/menu built from `<div onclick>` instead of buttons.
- Small icon-only links on mobile; can't tab through the nav.

**Phase to address:**
Component/UI build phase (semantic components + focus + reduced-motion baked in) and accessibility verification phase (keyboard + AA audit).

---

### Pitfall 11: Polish-language SEO / metadata / structured data missing for a local institution

**What goes wrong:**
The site is invisible when a Stromiec parent googles "żłobek Stromiec." Common causes: default framework `<title>`/meta left in place, no Polish `lang="pl"`, no `LocalBusiness`/`GovernmentOrganization` structured data, no address/phone/opening-hours markup, no `hreflang`/canonical, no sitemap/robots, and Open Graph missing so shares on Facebook (where local parents actually find things) look broken. Polish diacritics/URL slugs handled badly hurt too.

**Why it happens:**
SEO is deprioritized on a small informational site, and metadata is templated for English defaults.

**How to avoid it:**
- Set `<html lang="pl">`, unique Polish `<title>` + `meta description` per page, canonical URLs, `sitemap.xml`, `robots.txt`.
- Add **JSON-LD structured data**: `ChildCare`/`GovernmentOrganization`/`LocalBusiness` with name, address (Stromiec), phone, geo, `openingHours`, and `sameAs` linking to the gmina/BIP.
- Open Graph + Twitter card with a branded image so Facebook shares render well (primary local discovery channel).
- Use Polish keywords naturally in headings (żłobek, rekrutacja, Gmina Stromiec, opieka nad dziećmi).
- Verify diacritics render in meta and slugs are clean (`/rekrutacja`, not mojibake).
- Register in Google Search Console + Google Business Profile for local visibility.

**Warning signs:**
- `<title>` still says the framework/template name.
- No JSON-LD; no address markup.
- Facebook share preview blank/broken.
- No sitemap; not in Search Console.

**Phase to address:**
A content/SEO/launch-readiness phase; metadata scaffolding should be set in the foundation phase and filled per page.

---

### Pitfall 12: Placeholder content ships to production

**What goes wrong:**
The project deliberately builds with **placeholders** (lorem ipsum, stock/AI photos, a mock logo, fake team names, `zlobel@` typo email, "TODO" opening hours). Under launch pressure, placeholders leak into production — a public body publishing "lorem ipsum," fake staff, or a wrong contact email is embarrassing and, for contact/legal info, actively harmful (parents email the wrong address; wrong RODO administrator).

**Why it happens:**
The build-with-placeholders strategy (a good one) has no explicit gate that inventories and clears them before go-live.

**How to avoid it:**
- Mark every placeholder with a **greppable token** (e.g. `PLACEHOLDER` / `TODO-CONTENT`) in content files, images, and config so a single grep produces the pre-launch punch list.
- Maintain a **content-readiness checklist**: real hero copy (the client's verbatim core message is already provided — use it, don't lorem-ipsum the hero), real photos with consent (see Pitfall 13), real logo, confirmed email (`zlobek@ugstromiec.pl`), real address/phone/hours, real team, real documents in Dokumenty.
- Add a launch gate: build fails or CI warns if any `PLACEHOLDER` token remains in `main`/production content.
- Distinguish "placeholder OK to ship temporarily" (a generic-but-accurate about paragraph) from "must be real before launch" (contact email, RODO klauzula, opening hours).

**Warning signs:**
- Lorem ipsum or stock-photo watermarks in staging near launch.
- Contact email/address never confirmed with client.
- No inventory of what's placeholder vs real.

**Phase to address:**
Launch-readiness phase (content gate). Set the tokenization convention in the first content phase.

---

### Pitfall 13: Publishing children's photos without consent (image/RODO)

**What goes wrong:**
A joyful żłobek site *wants* photos of happy children. Publishing recognizable images of children without **written parental consent** for image use (wizerunek) is both a RODO issue and a civil "prawo do wizerunku" violation — high-sensitivity for minors and a reputational landmine for a public institution.

**Why it happens:**
Placeholder phase uses stock/AI kids (fine), but when swapping in "real content," staff supply candid photos of actual enrolled children without documented consent.

**How to avoid it:**
- v1 ships with **stock/AI/illustrated** children or photos where faces aren't identifiable, or real children only with **documented, specific written wizerunek consent** on file at the żłobek.
- Add this explicitly to the content-readiness checklist and warn the client in writing.
- Prefer illustrations and environment/detail shots (toys, rooms, hands) to reduce dependence on identifiable minors.

**Warning signs:**
- Real, identifiable children appear in content with no consent record.
- Staff email photos "from last week's group."

**Phase to address:**
Content phase + launch-readiness gate; flag as a client responsibility early.

---

### Pitfall 14: BIP link missing, wrong, or misrepresented

**What goes wrong:**
A public body must expose its **BIP**. The plan correctly links out to the existing `https://ugstromiec.naszbip.pl/zlobek` rather than rebuilding it — but common failures are: the BIP link is buried/absent, uses a non-standard label, points to the gmina root instead of the żłobek's BIP subpage, or the site *looks* like it is the BIP (confusing the regulated system with the marketing site). The Deklaracja dostępności must also be reachable in a way consistent with BIP expectations.

**Why it happens:**
BIP is treated as "just another footer link" and its regulatory prominence/labeling is underestimated.

**How to avoid it:**
- Prominent, clearly-labeled **"Biuletyn Informacji Publicznej (BIP)"** link (conventional label + often the standard BIP logo) in the header/footer, pointing exactly to `https://ugstromiec.naszbip.pl/zlobek`.
- Make clear the public website and BIP are distinct; don't duplicate regulated BIP content on the marketing site.
- Ensure Deklaracja dostępności and required public-body info are discoverable and, where expected, referenced from/within BIP.
- Confirm the exact BIP subpage URL with the client (it may change).

**Warning signs:**
- BIP link only in a submenu, or labeled ambiguously.
- Link points to gmina root, not the żłobek BIP.
- No standard BIP labeling/logo.

**Phase to address:**
Layout/navigation phase (header/footer), verified in compliance phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Bright brand colors applied directly to text/buttons "fix contrast later" | Fast, vibrant mockups | Systemic AA failures; a re-theme late in the project touches every component; legal exposure | **Never** — define accessible token pairs before building components |
| Client-side-only Turnstile / form validation | Faster to demo | Open spam relay, quota burn, blacklist risk, possible data breach | Never for the live endpoint; OK only in local dev stubs |
| Raw full-res images committed to the git repo | "It just works" for staff | Repo bloat, slow builds, poor LCP on mobile | Only tiny/pre-optimized assets; never multi-MB originals |
| Free-text CMS fields, no schema validation | Quick CMS setup | Non-technical staff break builds/layout; site outages | Never for staff-facing fields; strict schemas required |
| Hand-written Deklaracja dostępności | Saves 30 min | Missing mandatory fields = non-conformant + fine risk | Never — use the official generator |
| Logging form bodies for "debugging" | Easy troubleshooting | RODO breach (children's data retained in logs/error tracker) | Never in production; scrub fields even in dev |
| Copying a Netlify Decap tutorial verbatim on Cloudflare | Familiar path | Auth never works (no Git Gateway); rework | Never — use the Cloudflare OAuth Worker path from the start |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Cloudflare + email | Using dead free MailChannels Workers integration | Resend (Cloudflare-documented default), API key as Worker secret, verified sending domain |
| Email deliverability | `from: parent@…`, no DKIM/SPF/DMARC | Send from a domain you control with DKIM/SPF/DMARC; parent goes in `reply-to`; mail-tester before launch |
| Turnstile | Widget rendered but token not verified server-side | Call Turnstile `siteverify` in the Worker; reject on failure |
| Decap/Sveltia on Cloudflare | Expecting Netlify Git Gateway/Identity | Deploy `sveltia-cms-auth` OAuth Worker + GitHub OAuth App; env-var secrets |
| Resend data retention | Assuming "no storage" while Resend keeps sent emails in its dashboard | Decide/purge retention; keep children's sensitive data off the web form entirely |
| Cloudflare Pages build from CMS commit | Bad frontmatter from staff breaks prod build | Validate frontmatter in build; keep prior good deploy; know rollback |
| DNS for `ugstromiec.pl` | Assuming project controls the domain's DNS | Confirm who controls DNS; may need gmina IT to add DKIM, or use a controlled subdomain |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized hero/gallery photos | Mobile LCP > 2.5s, big transfer size | Framework image pipeline → AVIF/WebP, responsive `srcset`, sized, preload hero | Immediately on real phones/4G — this project is photo-heavy |
| Images without width/height | Layout shift (CLS), jumpy load | Always set dimensions / use `<Image>` component | Any device; worse on slow connections |
| Repo growth from committed media | Slow clones/builds, hitting size limits | Optimize before commit or store originals off-repo; cap CMS upload size | After a few dozen news posts with photos |
| Heavy JS animation for "joy" | Jank on low-end Android, battery drain | CSS transforms, reduced-motion, avoid parallax libs | On budget phones parents actually use |
| Blocking web fonts | Flash of invisible text, slower LCP | `font-display: swap`, subset Latin-Extended for Polish diacritics, preload | On first visit over mobile data |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Client-controlled `to`/`from` in the email Worker | Open relay; arbitrary email sending under your domain | Hard-code recipient/sender server-side |
| No server-side Turnstile verification + no rate limit | Spam flood, quota exhaustion, domain blacklisting | Verify token in Worker; add rate limit + honeypot |
| API keys/secrets in repo or client bundle | Key theft, abuse, cost | Store as Cloudflare Worker secrets; never in git or frontend |
| Logging/retaining form submissions | RODO breach of children's data | No storage/logging; scrub bodies; minimize collected fields |
| Sending children's sensitive data (PESEL/health) via web form | High-sensitivity breach | Keep sensitive data on the in-person PDF, not the web form |
| Overly broad GitHub OAuth/repo access for CMS | Repo compromise via a low-value editor account | Scope OAuth app; limit to editor account(s); protect `main` |
| Missing security headers (CSP etc.) on a public-body site | XSS, injection, audit findings | Set CSP/HSTS/`X-Content-Type-Options` via Cloudflare/headers file |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Info buried behind menus/carousels | Parent can't find "how to enrol" in seconds (violates core value) | Essential info (Rekrutacja, Dokumenty, Kontakt) surfaced on the homepage, one tap away |
| Joy over clarity (decorative overwhelm) | Cognitive overload; key CTAs lost | Clear hierarchy; joyful *frame*, functional *core*; obvious primary CTAs |
| Color-only status/error signaling | Colorblind/low-vision users miss required fields/errors | Text + icon + color together |
| Tiny mobile tap targets | Mistaps on nav/download links | ≥44px targets with spacing; mobile-first |
| No focus indicators | Keyboard users lost | Visible, brand-styled focus rings everywhere |
| PDF-only documents with no context | Screen-reader/mobile users struggle | Label links with type/size ("Regulamin — PDF, 240 KB"); ensure PDFs are tagged/accessible where feasible |
| Autoplay carousel with key info | Missed/inaccessible content | Static hero or paused-by-default with controls; don't hide essentials in motion |

## "Looks Done But Isn't" Checklist

- [ ] **Contact form:** emails actually *arrive* (SPF/DKIM/DMARC pass, not spam) and to the *correct* address (`zlobek@ugstromiec.pl`, not `zlobel@`) — verify with a real send to the client's inbox.
- [ ] **Rekrutacja form:** consent checkbox present + unticked, klauzula informacyjna shown, no server-side storage/logging, Turnstile verified server-side.
- [ ] **CMS:** a non-developer can log in on the *live* site, add a news post with an image, publish, and see it deploy — end to end.
- [ ] **Deklaracja dostępności:** generated from the official template, all mandatory fields + koordynator contact + RPO path present, linked from homepage.
- [ ] **Contrast:** every text/UI color pair measured ≥ AA (especially anything yellow/orange); error states not color-only.
- [ ] **Keyboard:** whole site operable tab-only with visible focus; skip link; no traps.
- [ ] **Reduced motion:** all animation disabled/softened under `prefers-reduced-motion`.
- [ ] **Mobile performance:** Lighthouse *mobile* LCP < 2.5s, images AVIF/WebP + sized.
- [ ] **BIP link:** prominent, correctly labeled, points to `ugstromiec.naszbip.pl/zlobek`.
- [ ] **SEO:** `lang="pl"`, real Polish titles/descriptions, JSON-LD local org, sitemap, OG image; no template defaults.
- [ ] **No placeholders:** grep for `PLACEHOLDER`/lorem returns nothing in production; real logo, photos (with consent), contact, hours.
- [ ] **Secrets:** no API keys in repo/bundle; Worker secrets used.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Palette fails contrast late | HIGH | Retro-fit accessible token variants across all components — cheap only if tokens existed; expensive if colors were hard-coded |
| MailChannels used, forms dead | LOW | Swap Worker to Resend; verify domain + DKIM; re-test |
| Emails going to spam | MEDIUM | Add/repair DKIM/SPF/DMARC, change `from` to controlled domain, re-test with mail-tester |
| Decap/Sveltia auth loop | LOW–MEDIUM | Deploy the OAuth Worker + GitHub OAuth App; repoint CMS `base_url` |
| Staff commit broke prod build | LOW | Roll back to prior Cloudflare deployment; add frontmatter validation + stricter CMS schema |
| Repo bloated with images | MEDIUM | Rewrite history / move originals off-repo (BFG/`git filter-repo`); add image pipeline going forward |
| Missing/invalid Deklaracja | LOW | Regenerate from official tool; add koordynator contact (needs client input) |
| RODO gap on forms (no consent/klauzula) | MEDIUM | Add consent + klauzula, purge any stored/logged data, notify if a breach already occurred |
| Placeholder shipped | LOW | Grep tokens, swap real content; add CI gate to prevent recurrence |
| Children's photos without consent | MEDIUM | Remove images immediately; replace with consented/stock; document consent process |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Bright palette fails AA contrast | Design system / branding | Automated contrast check on all token pairs ≥ AA |
| Missing/invalid Deklaracja dostępności | Compliance/legal | All mandatory fields present via official generator; koordynator listed |
| RODO on forms (children's data) | Forms/backend + compliance | Consent unticked + klauzula shown + no storage/logging confirmed |
| Dead MailChannels assumption | Forms/backend | Resend send succeeds from verified domain |
| Email deliverability (SPF/DKIM/DMARC) | Forms/backend | mail-tester/Gmail: SPF+DKIM+DMARC pass; not spam |
| Email endpoint abuse | Forms/backend | Turnstile verified server-side; recipient hard-coded; rate limit present |
| Git-CMS auth (no Git Gateway) | CMS integration | Full login→edit→commit→deploy loop on live site |
| Staff can't use CMS / broken builds | CMS integration + handover | Non-dev completes a post; bad frontmatter fails safely |
| Image bloat / mobile CWV | Foundation (stack) + performance pass | Mobile LCP < 2.5s; AVIF/WebP responsive; repo size stable |
| Motion/keyboard/focus/tap targets | Component/UI build + a11y verify | Keyboard-only pass; reduced-motion honored; targets ≥44px |
| Polish SEO/metadata/structured data | Foundation (scaffold) + content/launch | JSON-LD valid; Polish titles; sitemap; OG renders |
| Placeholder content ships | Content + launch-readiness gate | Grep for tokens returns none in production |
| Children's photos without consent | Content + launch gate | Consent on file or non-identifiable/stock imagery |
| BIP link missing/wrong | Layout/navigation + compliance | Prominent, correctly labeled, correct URL |

## Sources

- MailChannels — *Important Update: Email Sending API for Cloudflare Workers to be Terminated* and End-of-Life notice (free API stopped ~30 Jun 2024; EOL Aug 2024). https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/ , https://support.mailchannels.com/hc/en-us/articles/26814255454093-End-of-Life-Notice-Cloudflare-Workers — HIGH
- Cloudflare docs now recommend **Resend** (free tier 100/day, 3 000/month) as the Workers email path. https://devcxl.cn/en-us/blog/cloudflare-worker-resend-email/ — HIGH
- Sveltia CMS Authenticator (Cloudflare Worker OAuth, no Git Gateway) and GitHub backend docs. https://github.com/sveltia/sveltia-cms-auth , https://sveltiacms.app/en/docs/backends/github — HIGH
- Decap/Netlify CMS on Cloudflare Pages OAuth. https://github.com/SubhenduX/decap-cms-cloudflare-pages , https://github.com/i40west/netlify-cms-cloudflare-pages — HIGH
- Ustawa z 4 kwietnia 2019 r. o dostępności cyfrowej — WCAG 2.1 AA mandatory for podmioty publiczne; fines up to 10 000 zł (persistent non-compliance) / 5 000 zł (no declaration). https://dostepnapolska.pl/artykul/ustawa-o-dostepnosci-cyfrowej-co-to-jest-kogo-dotyczy-i-jakie-wymogi-stawia-w-2026-roku , https://www.grupaww-govtech.pl/blog/dostepnosc-cyfrowa-a-prawo-co-grozi-za-niespelnienie-wymogow-ustawowych/ — HIGH
- Deklaracja dostępności required elements (dates, conformance status, koordynator, RPO path, architektura). https://kulturawrazliwa.pl/blog/wiedza/deklaracja-dostepnosci-wcag-informacje/ , https://inclusiveweb.net/pl/blog/deklaracja-dostepnosci-wzor , https://bip.stat.gov.pl/deklaracja-dostepnosci/ — HIGH
- WCAG 2.1 AA contrast (1.4.3 4.5:1 / 3:1), use of color (1.4.1), reduced motion (2.3.3/2.2.2), target size — W3C WCAG (established standard) — HIGH
- Domain/UX/CMS-usability pitfalls — established practice for public-body and git-CMS informational sites — MEDIUM

---
*Pitfalls research for: Polish public municipal nursery (żłobek gminny) website on Cloudflare*
*Researched: 2026-08-12*
