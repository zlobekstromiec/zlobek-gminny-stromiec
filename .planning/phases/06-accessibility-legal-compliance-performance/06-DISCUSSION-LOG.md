# Phase 6: Accessibility, Legal Compliance & Performance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-08-18
**Phase:** 6-accessibility-legal-compliance-performance
**Areas discussed:** Widget form and placement, High-contrast strategy, Legal pages ownership, Launch gate enforcement tier

**Note on scope:** this discussion followed a roadmap re-scope in the same session. Phase 6 was split,
with `LAUNCH-01` and the old success criterion 5 moving to a new Phase 7 (Launch). Three questions
below only make sense against that split.

---

## Widget: form and placement

Three things were NOT asked because prior phases already settled them: the widget is built in-house
(04.1 D-01 precedent against third-party English chrome), it meets the MobileNav island bar (05 D-13),
and the CSP is not widened (05 D-13).

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| TopBar control | Already on every route, already flex/space-between, Polish public-sector convention. Costs: TopBar is the first surface high contrast must fix | ✓ |
| Floating button | Reachable without scrolling. Costs a z-index story against the Lightbox, overlaps content on small screens | |
| In the Header | One bar for all controls, but the header is busiest on mobile and the hamburger owns focus-trap behaviour there | |

**User's choice:** TopBar control.

### Font-size range

| Option | Description | Selected |
|--------|-------------|----------|
| Three steps to 130% | Normal / 115% / 130%. Enough to matter, small enough that the locked type scale needs no reflow work | ✓ |
| Three steps to 150% | More helpful, but breaks the KeyFacts chip row and the TopBar at 360px | |
| Two steps only | Simplest, but one step is often not worth the visual cost of the widget existing | |

**User's choice:** Three steps to 130%.

### Behaviour without JavaScript

| Option | Description | Selected |
|--------|-------------|----------|
| Hide it entirely | Site meets AA unaided; browser zoom and OS contrast still work; a visible dead control is worse than none | ✓ |
| Render it disabled with a note | More transparent, but leaves a permanently broken affordance for the users least able to act on the explanation | |

**User's choice:** Hide it entirely.
**Notes:** Public routes are prerendered with no server, so a no-JS path is structurally impossible
rather than merely expensive. This is the one place the project's standing degrade-without-JS rule
(04.1 D-17, D-22) cannot be honoured, and CONTEXT.md D-04 says so explicitly.

### Presence in /admin

| Option | Description | Selected |
|--------|-------------|----------|
| Public site only | Panel is a tool for named staff with its own shell and no TopBar; avoids a fifth island across 18 panel routes | ✓ |
| Both | Staff need larger text too, but the widget would have to work in two shells and extend 18 routes' sweeps | |

**User's choice:** Public site only.

---

## High-contrast strategy

### What it looks like

| Option | Description | Selected |
|--------|-------------|----------|
| Yellow on black | Polish public-body convention; sidesteps the hardcoded-white problem by overriding backgrounds wholesale | ✓ |
| Black on white | Easier to prove, but near-identical to the normal site at a glance so users may not believe it worked | |
| Strengthened brand palette | Keeps the warmth, but every hardcoded white needs individual rework and it still would not look like what the button promises | |

**User's choice:** Yellow on black.

### Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage | Someone who needs high contrast needs it every visit; not personal data, no consent banner | |
| Session only | sessionStorage, forgotten when the tab closes. Avoids persistent client-side state, but the setting is gone on every return visit | ✓ |
| Not at all | Provably stateless, but every internal link would drop the setting | |

**User's choice:** Session only.
**Notes:** The cost was stated in the option text and chosen anyway, so CONTEXT.md D-11 records it as
a deliberate trade and instructs planning not to re-open it. Practical softening noted there:
sessionStorage survives in-tab navigation and SvelteKit's client-side routing means internal links do
not reload, so the setting holds for a whole browsing session.

### Load flash under the CSP

| Option | Description | Selected |
|--------|-------------|----------|
| Research it, accept flash if needed | Establish whether `csp: {mode: 'auto'}` hashes a hand-authored inline script in app.html; ship the flash rather than widen the policy | ✓ |
| Never accept a flash | Honest about user impact, but the only levers left are widening the CSP or dropping prerender, both contradicting foundational decisions | |
| Accept the flash, do not research | Cheapest, but forecloses a possibly free win without checking | |

**User's choice:** Research it, accept flash if needed.

### Photographs in the mode

| Option | Description | Selected |
|--------|-------------|----------|
| Leave them, add strong borders | Photos keep the meaning and warmth; a solid border replaces the shadow's edge definition | ✓ |
| Dim or desaturate | Some low-vision users prefer it, but it degrades the thing that makes a żłobek site feel like one | |
| Hide decorative ones only | Cleanest semantically, but makes the mode look like a different site | |

**User's choice:** Leave them, add strong borders.

---

## Legal pages: who edits them

### Page ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Panel-editable store | Staff can do the legally-required annual review unaided; admin-enumeracja turns a missing route red | ✓ |
| Developer-owned .ts module | Strongest structural guarantee, but costs a developer every year forever for a review date | |
| Split: structure fixed, dates editable | Self-service review without letting anyone reword a legal declaration; more moving parts | |

**User's choice:** Panel-editable store.

### Relationship to the existing klauzula

| Option | Description | Selected |
|--------|-------------|----------|
| Page reuses the same blocks | One source, so the two RODO texts cannot drift; forms-copy.unit.ts already guards three sentences | ✓ |
| Two separate documents | Each reads better in place, but a RODO document contradicting another on the same site is a real liability | |
| Move it to the page, forms link out | Cleanest IA, but reverses 04 D-03, which put the klauzula inline so a parent need not leave the form | |

**User's choice:** Page reuses the same blocks.

### How the Deklaracja is produced

| Option | Description | Selected |
|--------|-------------|----------|
| Generator content, our markup | Official wording and field list, rendered in our components, with a test asserting every mandatory section by name | ✓ |
| Paste the generator output verbatim | Strongest completeness guarantee, but imports foreign markup onto the page this phase certifies as AA | |
| Author to the template by hand | PITFALLS.md:388 names exactly this as the thing never to do | |

**User's choice:** Generator content, our markup.

### EU-funding marking

Raised as a discovery, not a planned question: `.planning/dane-bip-zlobek-stromiec.md:160-170` records
it as mandatory and `04-CONTEXT.md` deferred it to "Phase 6 launch gate". It has no requirement ID.

| Option | Description | Selected |
|--------|-------------|----------|
| Design in 6, real assets in 7 | Placement and strip built behind the launch-gate marker, with a UI-SPEC amendment and an axe pass | ✓ |
| Entirely Phase 7 | Keeps Phase 6 focused, but designs a mandatory legal marking under launch pressure | |
| Add it as a new requirement first | Most correct bookkeeping; costs another roadmap edit before planning | |

**User's choice:** Design in 6, real assets in 7.
**Notes:** The user declined to mint a requirement ID, so CONTEXT.md D-17 records the deliverable as
tracked in the phase decisions and the ROADMAP rather than in the REQUIREMENTS traceability table.

---

## Launch gate: enforcement tier

### Repo visibility (user-raised)

The user did not answer the automation question as posed and instead asked whether making the
repository private after launch would be a problem, since it is a government website.

Verified before answering: org `zlobekstromiec` is on the **free** plan and the repo is currently
**public**; nothing under `src/` fetches `raw.githubusercontent.com`; the panel authenticates to
`api.github.com` with a GitHub App installation token (`src/lib/server/admin/github.ts:177`), which is
unaffected by visibility; Cloudflare Pages git integration works with private repos. The single cost
is GitHub Actions minutes: unlimited on public repos, capped at 2 000/month on a private free-plan
repo. This invalidated the original recommendation and a fourth option was added.

### Automation approach (re-asked with the new option)

| Option | Description | Selected |
|--------|-------------|----------|
| Append to the Pages build | `wrangler types --check && npm run test:unit && vite build`. Runs on every push, costs nothing, unaffected by visibility; failure leaves the previous deployment live | ✓ |
| Pages build + Actions on PRs only | Adds Playwright on pull requests, keeping staff panel saves off the minute quota | |
| GitHub Actions on every push | Most coverage, but once private every staff save spends minutes on a content-only commit | |
| Third pre-commit hook | Catches problems earliest, but pre-commit is already slow enough to time out GSD's commit wrapper and invites --no-verify | |

**User's choice:** Append to the Pages build.

### Where the gate lives

| Option | Description | Selected |
|--------|-------------|----------|
| Own script, run on demand | `npm run gate:launch`, outside the build and pre-commit, so it can sit red all phase without blocking anything | ✓ |
| In the build, but only from Phase 7 | Strongest launch guarantee, but any later placeholder would block all deploys on a site staff edit daily | |
| A test that is skipped until Phase 7 | Self-documenting, but a skipped test is invisible in a green run, which is the T-05-09-05 failure mode | |

**User's choice:** Own script, run on demand.

### What makes it red

| Option | Description | Selected |
|--------|-------------|----------|
| Strict marker form + reword the docs | Only `// PLACEHOLDER:` counts; convention headers reworded so they cannot self-trigger, per the 04-02 pattern. Plus every content boolean false | ✓ |
| Explicit allowlist of documentation lines | No rewording churn, but the allowlist rots when line numbers move and can hide a real marker | |
| Booleans only, drop the token check | Unambiguous, but about a dozen facts are marked only as source comments and would pass | |

**User's choice:** Strict marker form + reword the docs.

### Gate scope

| Option | Description | Selected |
|--------|-------------|----------|
| One gate for all of it | One command answers "are we allowed to launch"; covers noindex, robots, sitemap, OG card, stub documents | ✓ |
| Placeholders only | Smaller and easier to get right, but leaves the mechanical half of launch unenforced | |

**User's choice:** One gate for all of it.

### When to go private

| Option | Description | Selected |
|--------|-------------|----------|
| At the Phase 7 launch | Flips alongside the noindex lift, keeping free unlimited Actions during remaining development | ✓ |
| Now, before Phase 6 | Reduces exposure immediately, but spends the free-Actions window | |
| After all developer work is finished | Latest possible, but leaves the repo public through launch itself | |

**User's choice:** At the Phase 7 launch.

---

## Claude's Discretion

The user chose "Write CONTEXT.md now" over a further round, so these four were decided and recorded
rather than discussed. They are CONTEXT.md D-25 to D-29.

- **Performance target and method (D-25)** - web-perf skill over chrome-devtools MCP, against the live
  deployment on a throttled mobile profile. LCP under 2.5s, CLS under 0.1, INP under 200ms, on the
  three heaviest routes. No enforced budget test, because a timing assertion against a free-tier
  Worker would be flaky and the project already carries one documented class of load-related
  Playwright flakiness.
- **BIP placement (D-26)** - stays footer-plus-rekrutacja. None of the failure modes PITFALLS.md:365
  names actually applies, and a header item would crowd the busiest mobile surface for no compliance
  gain. The plan verifies the properties rather than assuming them.
- **Manual audit depth (D-27)** - three tiers: extend axe to the uncovered surfaces, a developer
  keyboard and tap-target pass, and one human screen-reader session as a UAT row.
- **Routing the two carried 04.1 UAT rows (D-28)** - 05 D-37 sent both to a launch gate that has since
  moved to Phase 7. B2 (HEIC phone upload) moves to Phase 7 because it needs a real photograph; B4
  (stale-save conflict panel) stays in Phase 6 because it needs only a second editor in a second tab.
- **DOC to PDF policy (D-29)** - Phase 6 establishes the policy and states it in the Deklaracja's
  non-conformance section; the conversion itself happens in Phase 7 with the real documents.

## Deferred Ideas

- Everything in Phase 7 (real content, consented photography, the two named officials, real EU-funding
  logotypes, the noindex lift, robots.txt, sitemap, OG card, JSON-LD and the Search Console token, the
  three stub documents, the live end-to-end mail test, and flipping the repo private).
- 04.1 UAT row B2, moved to Phase 7 by D-28.
- The double asterisk on required panel fields (deferred-items.md D-05-05-A). Deliberately not folded
  in: the correct fix is in FormField.svelte, which every public form also uses, so putting it into an
  accessibility phase for a non-accessibility defect would be the wrong trade.
- Playwright flakiness under load (deferred-items.md item 2).
- The stale comment at tests/admin-galeria.spec.ts:141.
- A seeded news post announcing an opening on 14 August 2026, already in the past. Content, so it
  belongs to the Phase 7 sweep.
