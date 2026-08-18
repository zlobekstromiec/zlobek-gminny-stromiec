# Phase 6: Accessibility, Legal Compliance & Performance - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the site provably WCAG 2.1 AA conformant, gives visitors a Polish accessibility
widget on every page, tunes mobile performance, confirms the BIP link, and authors both mandatory
legal pages in full. It also builds the combined launch gate and leaves it deliberately RED.

**The boundary is a question about who has to act.** Phase 6 is everything we can build and prove
alone. Phase 7 is everything that waits on the Gmina: consented photography, real content, the
koordynator dostepnosci and IOD names, real EU-funding logotypes, and a mailbox at
`zlobek@ugstromiec.pl` that receives external mail.

**In scope:** SITE-05, A11Y-01, A11Y-02, A11Y-03 (authored), LEGAL-01, LEGAL-02 (authored), the
EU-funding marking (designed), the combined launch gate (built RED), and four debts absorbed from
earlier phases.

**Out of scope:** everything in Phase 7. Notably, this phase must NOT flip the noindex guard, must
NOT replace any placeholder content, and must NOT tick A11Y-03 or LEGAL-02.

**Precedent for a phase closing with requirements unticked:** Phase 4 is `Complete` with FORM-01
Blocked and FORM-02 Pending. This is the same shape, not a new one.

</domain>

<decisions>
## Implementation Decisions

### Accessibility widget (A11Y-02)

- **D-01:** The widget is built in-house. No third-party accessibility overlay (UserWay, AccessiBe
  and that class) is permitted. This is not a fresh judgement: 04.1 D-01 rejected Cloudflare Access
  because "replacing an English third-party login with a different English third-party login defeats
  the reason this phase exists". The identical argument applies here, since such widgets ship
  non-Polish chrome and keep their configuration in a vendor dashboard rather than in the repository.
- **D-02:** The widget mounts as a control in `TopBar.svelte`, not as a floating button and not in
  the Header. The TopBar already renders on every route and is already
  `display: flex; justify-content: space-between`, so the widget is a third item rather than a new
  layer. This is also the convention Polish visitors recognise from other public-body sites. Note
  the consequence: TopBar is `background: var(--color-brand-blue); color: #ffffff`, so it is the
  first surface the high-contrast mode has to solve.
- **D-03:** Three font-size steps: normal, 115%, 130%. Not 150%: that breaks the KeyFacts chip row
  and the TopBar at 360px, which would drag reflow work onto two locked contracts. WCAG 1.4.4's
  200% requirement is already satisfied by browser zoom; this control is convenience, not the legal
  floor.
- **D-04:** With JavaScript disabled the widget renders nothing at all. Public routes are prerendered
  static HTML with no server, so a no-JS path is structurally impossible rather than merely
  expensive, and the site already meets AA unaided. A visible dead control would be worse than no
  control. This is the one place the project's standing "must degrade without JavaScript" rule
  (04.1 D-17, D-22) genuinely cannot be honoured, and the plan must say so rather than imply the
  rule was overlooked.
- **D-05:** Public site only. The widget does not appear in `/admin`. The panel is a tool for a
  handful of named staff with its own shell and no TopBar, and adding a fifth island across 18 panel
  routes would extend both the Polish sweep and the axe expectations for no public benefit.
- **D-06:** The widget is the site's FIFTH hydrated island (after MobileNav, the two form islands and
  the Phase 5 lightbox) and it inherits the island bar from 05 D-13 unchanged: bounded focus trap,
  Escape to close, `prefers-reduced-motion` honoured, keyboard operable, and its own axe AA pass in
  BOTH the closed and the open state.
- **D-07:** It is also the first island on EVERY prerendered route. Under the 05 D-13 precedent, a
  header comment that states a guarantee the phase breaks must be rewritten rather than silently
  invalidated, so every "Prerendered, zero-JS" header comment across the content routes is rewritten
  in this phase. Finding them is a plan task, not an assumption.

### High contrast

- **D-08:** High contrast is YELLOW ON BLACK, the Polish public-body convention. Rejected: a
  strengthened brand palette, which would require reworking and re-measuring every hardcoded white
  surface individually and would still not look like what the button promises. Rejected: black on
  white, which is visually near-identical to the normal site and leaves users unsure it worked.
- **D-09:** Overriding backgrounds wholesale is what makes D-08 tractable. A token override alone
  reaches only about 70% of the surface: hardcoded `#ffffff` sits at `Footer.svelte:107,168,243,259`,
  `TopBar.svelte:23,67`, `Cta.svelte:78` and `NewsCard.svelte:160`; `Footer.svelte:264` is a
  20%-alpha white border that vanishes on any non-blue background; and shadow-based affordances at
  `Header.svelte:72-73`, `NewsCard.svelte:89-90,98-99` and `SkipLink.svelte:25-27` carry no border
  fallback. In the high-contrast mode, solid borders replace every shadow.
- **D-10:** Photographs stay visible in high contrast, with strong borders supplying the edge
  definition the shadows used to give. Not dimmed, not desaturated, not hidden. The gallery remains
  usable in the mode.
- **D-11:** The preference persists for the SESSION ONLY (`sessionStorage`), not across visits.
  **This is a deliberate trade the user made with the cost stated:** someone who needs high contrast
  must re-enable it on each new visit, which is the very case the feature exists for. It was chosen
  over `localStorage` to avoid introducing persistent client-side state to the project. Practical
  softening: `sessionStorage` survives in-tab navigation, and SvelteKit's client-side routing means
  internal links do not reload, so the setting holds for a whole browsing session. The Polityka
  prywatnosci must disclose the session storage regardless.
- **D-12:** The CSP is NOT widened. `svelte.config.js:57-69` sets `csp: {mode: 'auto'}` with
  `'script-src': ['self', 'https://challenges.cloudflare.com']` and no `unsafe-inline`, and 05 D-13
  states "the CSP needs no change for a same-origin island". Research must establish whether
  SvelteKit's `auto` mode will hash a hand-authored inline script in `app.html`. If it will, the
  pre-hydration guard is free and there is no flash. If it will not, we SHIP THE FLASH and record
  why. Widening the policy or dropping prerender are both refused.
- **D-13:** All of the above requires a formal amendment to the locked design contract BEFORE the
  change, per 05 D-16 and D-20: append to `01-UI-SPEC.md` a section headed
  `## Amendment v1.8 (date): <title>` with a blockquote naming what is superseded and what is
  unchanged. Phase 5 took v1.7, so **v1.8 is the next number.**

### Legal pages (A11Y-03, LEGAL-02)

- **D-14:** Both legal pages become panel-editable JSON stores with their own `/admin` screens,
  following the `o-nas.json` pattern. The driver is a recurring legal obligation, not convenience:
  the Deklaracja dostepnosci must carry a review date and be reviewed annually, and a
  developer-owned module means a developer every year forever. Adding a panel screen is cheap and
  safe here because `tests/admin-enumeracja.spec.ts` walks `src/routes/admin` on disk and turns red
  if the route is missing from `TRASY` in `tests/fixtures/trasy-panelu.ts`, so the screen cannot be
  silently left without Polish coverage.
- **D-15:** The Polityka prywatnosci REUSES the existing twelve `KLAUZULA` blocks from
  `src/lib/content/forms.ts:291-381` and adds only the site-wide sections the forms do not cover
  (the new session storage from D-11, Cloudflare as host, the BIP link-out). One source, so the two
  RODO texts can never drift. 04 D-03 stays intact: the klauzula remains inline in a collapsed
  `<details>` under both forms, and is NOT moved to the page with the forms linking out.
  `tests/forms-copy.unit.ts` already pins three of those sentences and keeps guarding them.
- **D-16:** The Deklaracja dostepnosci takes its WORDING AND FIELD LIST from the official government
  generator, and is RENDERED IN OUR OWN MARKUP so it inherits the design system, the heading order
  and the focus rules of the page that this very phase certifies as AA. A test asserts every
  mandatory section is present by name, so a later edit cannot quietly drop one. Rejected: pasting
  the generator's HTML verbatim (imports foreign markup onto the page being certified). Rejected:
  hand-authoring against the statutory list, which `PITFALLS.md:388` names explicitly as the thing
  never to do.
- **D-17:** The mandatory EU-funding marking is DESIGNED in Phase 6 and its real assets land in
  Phase 7. `.planning/dane-bip-zlobek-stromiec.md:160-170` section 7 requires a logo strip (Fundusze
  Europejskie, barwy RP, Unia Europejska, Krajowy Plan Odbudowy) plus the klauzula "Dofinansowane
  przez Unie Europejska - NextGenerationEU". The logotype files, the exact amount and the project
  period are all `[BRAK]`, to be obtained from the Urzad Gminy. Phase 6 decides placement and builds
  the strip with placeholder logos behind the launch-gate marker, so it gets a UI-SPEC amendment and
  an axe pass like every other surface. **This deliverable has no requirement ID.** The user
  deliberately chose to proceed without minting one, so it is tracked here and in the ROADMAP rather
  than in the REQUIREMENTS traceability table.

### Launch gate

- **D-18:** The gate is `npm run gate:launch`, its own script, deliberately NOT in the Pages build
  chain and NOT in pre-commit. It must be able to sit RED for the entire duration of Phase 6 without
  blocking a single commit or deploy. Phase 7's definition of done is that this one command exits
  zero. It is documented in `docs/dev-env.md` so it does not become folklore. Rejected: a test
  skipped until Phase 7, because a skipped test is invisible in a green run, which is precisely the
  failure mode T-05-09-05 was opened for.
- **D-19:** What makes the gate red, exactly: (a) any line comment of the STRICT form
  `// PLACEHOLDER:` anywhere in `src/`, `static/` or `docs/`, and (b) any `placeholder` boolean under
  `src/lib/content/` that is not `false`. Every convention header that merely EXPLAINS the mechanism
  gets reworded to a synonym so it cannot self-trigger; the repository already established this
  pattern at 04-02, where a comment explaining a ban was reworded so the enforcing grep could not
  report a permanent false positive. This closes T-05-09-05, whose whole content is that a token
  grep cannot see a JSON boolean. **05 D-18 is the trap to avoid:** a naive grep gets permanent false
  positives on this repo because comments name paths in quoted form.
- **D-20:** The gate covers the WHOLE go-live checklist, not only placeholders: the noindex guard
  (`Seo.svelte:19` plus the two hand-rolled tags on the legal pages), `static/robots.txt`, the
  sitemap host and URL set, the OG share card, and the three stub documents under `static/dokumenty/`
  (623 B, 630 B and 96 B). One command answers "are we allowed to launch". The noindex flip alone
  touches five test assertions across four files and the sitemap host currently disagrees with the
  documented live URL, which is exactly the kind of thing a human checklist loses.
- **D-21:** `npm run test:unit` is appended to the Cloudflare Pages build command, making it
  `wrangler types --check && npm run test:unit && vite build`. This pays the AG-3 debt raised three
  times (03-REVIEW.md:99-105, 04-REVIEW WR-01, T-05-09-05) at zero cost and independently of repo
  visibility. A failed build leaves the previous deployment live, which `svelte.config.js:16-18`
  already documents as this project's preferred failure mode. Rejected: a third pre-commit hook,
  because pre-commit already runs svelte-check plus prettier plus eslint over the whole tree slowly
  enough that GSD's commit wrapper times out on it. Playwright is NOT added to the build; `npm run
  test` stays a local gate.
- **D-22:** The repository goes PRIVATE at the Phase 7 launch, alongside the noindex lift, and the
  gate carries it as a checklist item. Verified as safe: org `zlobekstromiec` is on the free plan and
  the repo is currently public; nothing in `src/` fetches `raw.githubusercontent.com`; the panel
  authenticates to `api.github.com` with a GitHub App installation token
  (`src/lib/server/admin/github.ts:177`), which is unaffected by visibility; and Cloudflare Pages git
  integration works with private repos. The single cost is GitHub Actions minutes, which are
  unlimited on public repos and capped at 2 000/month on a private free-plan repo. D-21 makes that
  cost irrelevant, because the project's automation lives in the Pages build rather than in Actions.

### Absorbed debts

- **D-23:** The `MobileNav.svelte:73-79` focus escape is fixed in this phase. The handler covers only
  `active === first` and `active === last`, but the drawer container carries `role="dialog"`,
  `aria-modal="true"` and `tabindex="-1"`, so focus can rest on the container itself, neither branch
  matches, `preventDefault()` never fires, and Shift+Tab leaks to the page beneath. It is a real
  WCAG 2.1 AA keyboard trap on every page. The fix shape is already proven in `Lightbox.svelte`
  under WR-05: treat an index of `-1` as entry to the cycle from the direction of travel.
  `tests/nav.spec.ts` proves role, first focus, Escape and focus restore but never presses Tab, so
  the accepting test has to be written.
- **D-24:** The FORM-02 live re-check (04-VERIFICATION AG-1 parts B and C) happens in this phase. One
  submission at or after the top of the next clock hour proves the reset; one on a new UTC date
  proves a fresh `rl:doba:` key. One human session, zero deploys. Part A passing is not evidence: the
  pre-fix build refused inside the bucket too.

### Claude's Discretion

The user chose to have these recorded rather than discussed. They are decisions, not open questions.

- **D-25 (SITE-05 target and method):** Measure with the `web-perf` skill over the chrome-devtools
  MCP, against the LIVE deployment on a throttled mobile profile, never desktop broadband. Targets:
  LCP under 2.5s, CLS under 0.1, INP under 200ms. Measure the three heaviest routes: the homepage,
  `/o-nas` with the gallery populated, and an `/aktualnosci/[slug]` post with a cover. Record
  before-and-after numbers in the phase SUMMARY. Do NOT enforce a performance budget as a test: a
  timing assertion against a free-tier Worker would be flaky, and the project already carries one
  documented class of load-related Playwright flakiness (`deferred-items.md` item 2).
- **D-26 (LEGAL-01 placement):** The BIP link STAYS as it is, in the footer on every page
  (`Footer.svelte:68-74`) plus `/rekrutacja` (`rekrutacja.ts:165-168`). No header placement and no
  BIP logo asset. `PITFALLS.md:365` lists the failure modes as buried or absent, a non-standard
  label, or pointing at the gmina root instead of the zlobek subpage. None applies: the link is on
  every page, uses the exact conventional label with a visually-hidden new-tab suffix, and points at
  the zlobek subpage. Adding a header item would crowd the busiest mobile surface for no measurable
  compliance gain. The plan should VERIFY these properties rather than assume them.
- **D-27 (A11Y-01 audit depth):** Three tiers. (1) Automated: extend axe to the currently uncovered
  surfaces, namely `/deklaracja-dostepnosci`, the `+error.svelte` page, the mobile-nav drawer in its
  OPEN state, the new widget in both states, and the success state of both forms. (2) Developer
  manual: a keyboard-only walkthrough of every route and control, tap-target measurement against the
  UI-SPEC 44px contract (note `TopBar.svelte:53-59` sets `min-height: 36px`, which passes WCAG 2.1 AA
  but breaches the project's own stricter contract), and a contrast spot-check of the Turnstile
  widget, which axe cannot see into. (3) Human UAT: one screen-reader session recorded as a UAT row.
  No automation substitutes for it.
- **D-28 (routing the two carried 04.1 UAT rows):** 05 D-37 sent both to "the Phase 6 launch gate",
  which the split has since moved to Phase 7, so they must be routed individually. **B2 (HEIC photo
  from a phone) moves to Phase 7**, because it needs a real photograph from the zlobek and none
  exists. **B4 (stale-save conflict panel) STAYS in Phase 6** as a UAT row, because it needs only a
  second editor in a second browser tab and no client input whatsoever. Separating them is precisely
  what the phase split is for.
- **D-29 (DOC to PDF policy):** 04-CONTEXT deferred "DOC/DOCX to PDF conversion of the wnioski" here
  as an accessibility item. Phase 6 establishes the POLICY (downloadable forms are published as PDF,
  because a `.doc` is an accessibility problem and the current
  `static/dokumenty/wniosek-o-przyjecie-dziecka.doc` is a 96-byte stub anyway) and states it in the
  Deklaracja's non-conformance section. The actual conversion happens in Phase 7 with the real
  documents from BIP.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The locked design contract
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` - the master contract. §
  "Accessibility Contract (WCAG 2.1 AA - A11Y-01 baseline starts here)" at :243-251 is the baseline
  this phase AUDITS AGAINST rather than redefines. "Interaction & States" at :221-232 fixes the focus
  ring and skip link. "Motion & Reduced Motion" at :236-239 makes `prefers-reduced-motion` a hard
  requirement. Currently at Amendment v1.7; **this phase writes v1.8** (D-13).
- `.planning/phases/05-gallery-fees/05-UI-SPEC.md` - Contract 4 (fees) and the lightbox contract,
  the most recent island precedent.

### Legal and regulatory
- `.planning/research/PITFALLS.md` §"Pitfall 2: Missing or non-conformant Deklaracja dostepnosci" at
  :42-70 - the mandatory field list, the fine amounts (5 000 zl missing, 10 000 zl persistent), and
  the instruction to use the official generator. :388 names hand-authoring as the thing never to do.
- `.planning/research/PITFALLS.md` §"Pitfall 1" at :13-41 - the palette-versus-contrast tension that
  the two-tier token system exists to resolve. :231-248 (Pitfall 9) is the mobile Core Web Vitals
  guidance behind D-25. :260 is the reduced-motion and keyboard cluster. :359-367 is the BIP
  expectation behind D-26.
- `.planning/dane-bip-zlobek-stromiec.md` §7 at :160-170 - the mandatory EU-funding marking (D-17).
  §10 governs publishability: anything marked `[?]` or `[BRAK]` may not ship as fact.

### Prior decisions that constrain this phase
- `.planning/phases/05-gallery-fees/05-CONTEXT.md` - D-13 (the island bar and the header-comment
  rewrite rule), D-16 and D-20 (the UI-SPEC amendment procedure), D-18 (why a naive grep gate gets
  permanent false positives), D-37 (the two carried UAT rows).
- `.planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-CONTEXT.md` - D-01 (why no
  third-party English-chrome dependency), D-06 (content stays in git; the prerendered zero-JS model
  is foundational), D-15 (alt text is required, and the reason it cites is this phase), D-17 and D-22
  (islands only where they earn it; degrade without JavaScript).
- `.planning/phases/04-enrollment-contact-email-pipeline/04-CONTEXT.md` - D-03 (the klauzula
  informacyjna is inline under each form and already discloses the processors), D-17 (static map
  image, never a third-party iframe), plus the deferred items this phase inherits.

### Security and verification debt
- `.planning/phases/05-gallery-fees/05-SECURITY.md` :197-209 - T-05-09-05 in full, the marker
  mismatch this phase closes (D-19).
- `.planning/phases/05-gallery-fees/deferred-items.md` item 3 - the MobileNav focus escape (D-23),
  with the proven fix shape. Item 2 is the load-related Playwright flakiness behind D-25.
- `.planning/STATE.md` "Blockers/Concerns" - 04-VERIFICATION AG-1 parts B and C (D-24).

### Project rules
- `.claude/CLAUDE.md` - Polish only, WCAG 2.1 AA, RODO, BIP, near-zero cost, the adapter-cloudflare
  and Tailwind v4 gotchas, and the verify-before-commit chain.
- `docs/dev-env.md` :64 - the four-command verify gate. :97-100 - the noindex guard. This phase adds
  `npm run gate:launch` here (D-18).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/lib/components/MobileNav.svelte` - the island correctness precedent (focus trap, Escape,
  focus restore, reduced-motion via `matchMedia` at :32). Also the subject of D-23.
- `src/lib/components/Lightbox.svelte` - the CORRECTED focus-cycle logic after WR-05, at :151-160.
  This is the shape D-23 ports back into MobileNav.
- `src/lib/components/TopBar.svelte` - the widget's mount point (D-02). Already flex,
  space-between, on every route.
- `src/app.css` - `@theme` at :32-77 holds the two-tier tokens; global `:focus-visible` at :85-88;
  the `prefers-reduced-motion` base at :93-106. Note there is NO global `.visually-hidden`: it is
  redeclared in six components (`Footer.svelte:274`, `FormField.svelte:276`, `MapPanel.svelte:132`,
  `ConsentBlock.svelte:296`, `ZgloszenieForm.svelte:934`, `Lightbox.svelte:244`).
- `src/lib/content/forms.ts:291-381` - the twelve `KLAUZULA` blocks D-15 reuses, typed
  `readonly BlokKlauzuli[]` with `{naglowek?, akapity[]}` and no markup permitted in the strings.
- `tests/zastepcze.unit.ts` - the existing placeholder inventory. Walks every `.json` under
  `src/lib/content` off disk, collects `placeholder` keys at any depth, asserts each is a boolean
  with a non-vacuity guard, and prints the inventory. It deliberately never asserts a flag is
  `false`, which is exactly the half D-19 adds.
- `src/routes/admin/o-nas/+page.server.ts` and `src/lib/server/admin/walidacja/` - the store-plus-
  screen pattern D-14 follows.

### Established Patterns

- Axe is uniform everywhere: tags `['wcag2a','wcag2aa','wcag21a','wcag21aa']`, no `disableRules`, no
  include or exclude, assertion always `expect(results.violations).toEqual([])`, block inlined per
  spec. Newer specs hoist the tags to a `const ZNACZNIKI`.
- Tests interpolate from content modules rather than retyping values, EXCEPT `tests/home.spec.ts`
  :106-119. 05-CONTEXT flags that asymmetry as a live design question the plan must settle per
  surface rather than inherit.
- Panel JSON is emitted as `JSON.stringify(dane, null, '\t') + '\n'` and `.prettierignore` is
  deliberately unused, so any hand-authored seed store must match or the first panel save blocks
  every local commit (04.1 D-09).
- Every new export in a copy module must join its sweep list, or it escapes the contract silently
  (`tests/admin-copy.unit.ts` asserts sweep length equals the module's export count).
- Copy rules apply to code comments, test names and commit messages, not only shipped copy.

### Integration Points

- `src/routes/+layout.svelte:34-38` - the public shell. TopBar sits here, so the widget reaches every
  public route from one place, and the `panel` branch at :24 keeps it out of `/admin` per D-05.
- `svelte.config.js:70-76` - `handleHttpError` throws unconditionally; `KNOWN_FUTURE_ROUTES` was
  DELETED, not emptied (plan 05-07). Every internal link is crawler-enforced and a broken one fails
  `vite build`. There is no escape hatch left, so any new nav or footer link must land in the same
  commit as its page.
- `tests/fixtures/trasy-panelu.ts` - `TRASY` currently holds 18 routes. A new panel screen (D-14)
  must be added here or it gets ZERO Polish coverage, and `tests/admin-enumeracja.spec.ts` is what
  turns that silent gap into a red one.
- `tests/responsive.spec.ts:32` - its `ROUTES` list is a second enumeration surface. New public
  routes inherit zero viewport coverage unless added.
- `package.json` `build` - D-21 edits this script.

</code_context>

<specifics>
## Specific Ideas

- High contrast should look like the yellow-on-black mode Polish visitors already know from other
  urzad and public-body sites, not a bespoke interpretation.
- The repository must be private before handover, because it is a government website. This became a
  decision (D-22) rather than a preference: the checks are recorded there, and the timing was chosen
  to preserve free unlimited GitHub Actions during the remaining development.
- The user consistently preferred the cheaper, more conventional option where the expensive one
  bought only polish, but chose against persistence in D-11 even though it costs real usability.
  Treat D-11 as intentional and do not re-open it in planning.

</specifics>

<deferred>
## Deferred Ideas

- **Everything in Phase 7.** Real content, consented photography, the koordynator dostepnosci and
  IOD names, the real EU-funding logotypes and amount, the noindex lift, robots.txt, the sitemap
  host and URL set, the OG share card, JSON-LD and the Search Console token (D-12 of Phase 1), the
  three stub documents under `static/dokumenty/`, the live end-to-end mail test, and flipping the
  repository private.
- **04.1 UAT row B2 (HEIC upload from a phone)** - moved to Phase 7 by D-28; needs a real photograph.
- **The double asterisk on required panel fields** (`deferred-items.md` D-05-05-A). Cosmetic, not a
  WCAG failure, and the correct fix is in `FormField.svelte`, which every public form also uses, so
  it needs its own plan and its own regression run. NOT folded in, deliberately: it would put a
  component used by both forms into an accessibility phase for a non-accessibility defect.
- **Playwright flakiness under load** (`deferred-items.md` item 2). Changing `retries` is a change to
  the project's quality gate and would mask real instability. Its options are recorded there.
- **`tests/admin-galeria.spec.ts:141`** still repeats a comment WR-04 disproved. Fix on the next
  visit to that file.
- **A stale seeded post** announcing an opening on 14 August 2026, already in the past. It is content,
  so it belongs to the Phase 7 sweep.

</deferred>

---

*Phase: 6-Accessibility, Legal Compliance & Performance*
*Context gathered: 2026-08-18*
