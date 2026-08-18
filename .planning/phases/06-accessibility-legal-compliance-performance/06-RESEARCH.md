# Phase 6: Accessibility, Legal Compliance & Performance - Research

**Researched:** 2026-08-18
**Domain:** WCAG 2.1 AA certification of a Polish public-body site, statutory Deklaracja dostępności (Warunki techniczne v2.0), a CSS-only theme and text-scale mechanism on Tailwind v4, mobile Core Web Vitals on Cloudflare Pages, and a launch gate over two incompatible placeholder mechanisms
**Confidence:** HIGH on the codebase facts and the mechanism designs; MEDIUM on the statutory identifier list (two independent secondary sources agree, the primary PDF host refused the connection); MEDIUM on the performance variance numbers

## Summary

This phase is unusually well specified before research starts. `06-CONTEXT.md` locks D-01 to D-24 and records D-25 to D-29, and `06-UI-SPEC.md` (verified 6/6, contrast arithmetic reproduced) already answers most of the WHAT. This document answers only the six HOW questions the UI-SPEC deliberately left open, and reports the findings that contradict or extend upstream documents. It does not re-open a single locked decision.

Three findings change the shape of the work rather than merely informing it. **First, the statutory declaration is a machine-readable document, not just prose.** Since version 2.0 of the Ministerstwo Cyfryzacji *Warunki techniczne* (published 31 July 2024, binding on every declaration created from 1 August 2024), the page must carry roughly seventeen mandatory `id="a11y-*"` attributes so the government's monitoring crawler can read it, and it must carry a `Dostępność komunikacyjno-informacyjna` section that the UI-SPEC's ten-section list does not include. A declaration with perfect Polish prose and no `a11y-*` identifiers is technically non-conformant. **Second, the launch gate as specified is blind to thirteen real markers.** D-19's strict `// PLACEHOLDER:` line-comment form does not match the fifteen `<!-- PLACEHOLDER:` HTML-comment markers that live in public `.svelte` markup, so a gate built to the letter of D-19 would go green in Phase 7 with thirteen genuine obligations still in the tree. **Third, D-25 cannot execute as written today:** the `chrome-devtools` MCP server is not configured in this environment, and the `web-perf` skill's own first instruction is to stop when it is missing.

Everything else resolves cleanly. The text-scale refactor is a mechanical substitution over 167 declarations across 34 public files with fourteen distinct source values, and the UI-SPEC's choice to declare the `calc()` tokens in a plain `:root` block rather than inside `@theme` is confirmed correct for two independent Tailwind v4 reasons. The `sessionStorage` flash occurs on hard loads only and never on client-side navigation, and the earliest CSP-legal point to apply the theme class is module-evaluation time inside the root layout's import graph, which is strictly earlier than an `$effect` and costs no extra request. The panel-store question resolves without a new renderer: `renderPost` already produces exactly the block grammar a statutory section needs and structurally cannot produce a heading, an image, a table or raw HTML.

**Primary recommendation:** Sequence the phase as: (0) the D-21 build-chain wiring and the shared placeholder-inventory extraction, so everything after it is gated; (1) the launch gate, built against BOTH comment syntaxes, with the reword sweep in the same commit; (2) the two legal pages with the full `a11y-*` identifier set and the missing komunikacyjno-informacyjna section; (3) the widget plus the two-layer theme in one plan, per the UI-SPEC's own ordering note; (4) the text scale as a mechanical substitution; (5) the audit tiers and the measurement. Configure the `chrome-devtools` MCP server before the phase starts, or D-25 has no execution path.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

Reproduced by reference rather than retyped: `06-CONTEXT.md` §`<decisions>` carries D-01 to D-24 in full and this research contradicts none of them. The ones this document touches operationally:

- **D-01 / D-02 / D-04 / D-05 / D-06 / D-07** the widget is in-house, mounts as the third `TopBar` item, renders nothing without JavaScript, is public-only, inherits the island bar and is the first island on every route (so every "Prerendered, zero-JS" header comment is rewritten).
- **D-03** three text-size steps: normal, 115%, 130%. Not 150%.
- **D-08 / D-09 / D-10** high contrast is yellow on black; backgrounds are overridden wholesale in two layers; photographs stay visible with strong borders.
- **D-11** `sessionStorage` only, session-scoped, deliberately not `localStorage`. **Do not re-open.**
- **D-12** the CSP is not widened, prerender is not dropped, and the pre-hydration flash is shipped. The SvelteKit `csp.add_script()` finding is settled and is taken as given here.
- **D-13** this phase writes `01-UI-SPEC.md` Amendment **v1.8**.
- **D-14 / D-15 / D-16 / D-17** both legal pages become panel-editable stores with their own `/admin` screens; the polityka reuses the twelve `KLAUZULA` blocks; the deklaracja takes its wording and field list from the official government generator and renders in our own markup; the EU-funding marking is designed now and its assets land in Phase 7.
- **D-18 / D-19 / D-20** the gate is `npm run gate:launch`, outside the build chain and outside pre-commit, deliberately RED for the whole phase; it reads the strict `// PLACEHOLDER:` form and every `placeholder` boolean under `src/lib/content/`; it covers the whole go-live checklist.
- **D-21** `npm run test:unit` is appended to the Cloudflare Pages build command.
- **D-22** the repository goes private at the Phase 7 launch; the gate carries it as a checklist item.
- **D-23** the `MobileNav.svelte:73-79` focus escape is fixed here.
- **D-24** the FORM-02 live re-check (04-VERIFICATION AG-1 parts B and C) happens here as a human session.

### Claude's Discretion

Recorded in `06-CONTEXT.md` as **decisions, not questions**, and implemented rather than re-decided:

- **D-25 (SITE-05 target and method):** `web-perf` skill over the chrome-devtools MCP, against the LIVE deployment on a throttled mobile profile, never desktop broadband. LCP < 2.5s, CLS < 0.1, INP < 200ms. Three routes: homepage, `/o-nas` with the gallery populated, an `/aktualnosci/[slug]` post with a cover. Before-and-after in the phase SUMMARY. **No performance budget as a test.**
- **D-26 (LEGAL-01 placement):** the BIP link stays as it is, footer on every page plus `/rekrutacja`. No header placement, no BIP logo asset. **The plan VERIFIES these properties rather than assuming them.**
- **D-27 (A11Y-01 audit depth):** three tiers. Automated axe extension to the uncovered surfaces; developer manual keyboard walkthrough plus tap-target measurement plus a Turnstile contrast spot-check; one human screen-reader session as a UAT row.
- **D-28 (routing the two carried 04.1 UAT rows):** B2 (HEIC photo) moves to Phase 7. **B4 (stale-save conflict panel) STAYS in Phase 6** as a UAT row.
- **D-29 (DOC to PDF policy):** Phase 6 establishes the policy and states it in the Deklaracja's non-conformance section. The conversion happens in Phase 7.

### Deferred Ideas (OUT OF SCOPE)

- **Everything in Phase 7.** Real content, consented photography, the koordynator dostępności and IOD names, the real EU-funding logotypes and amount, the noindex lift, robots.txt, the sitemap host and URL set, the OG share card, JSON-LD and the Search Console token, the three stub documents under `static/dokumenty/`, the live end-to-end mail test, and flipping the repository private.
- **04.1 UAT row B2 (HEIC upload from a phone)** moved to Phase 7 by D-28.
- **The double asterisk on required panel fields** (`deferred-items.md` D-05-05-A). Not folded in, deliberately.
- **Playwright flakiness under load** (`deferred-items.md` item 2). Changing `retries` would mask real instability.
- **`tests/admin-galeria.spec.ts:141`** still repeats a comment WR-04 disproved. Fix on the next visit to that file.
- **A stale seeded post** announcing an opening on 14 August 2026. It is content, so it belongs to the Phase 7 sweep.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **SITE-05** | Pages load fast on mobile; images optimized and Core Web Vitals pass green | §Open Question 4 (reproducible methodology, environment blocker, variance expectation, the Cloudflare static-asset correction). §Performance contract in `06-UI-SPEC.md:1257-1280` constrains what the UI may cost. §Environment Availability names the missing MCP server |
| **A11Y-01** | WCAG 2.1 AA: semantic structure, AA contrast, keyboard navigation, visible focus, prefers-reduced-motion | §Common Pitfalls 1-4. §Validation Architecture, in particular the `results.incomplete` gap (axe does not fail on colour-contrast it cannot determine) and the two property-shaped sweeps that are stronger than axe for a repainted theme. `06-UI-SPEC.md:1200-1253` owns the three audit tiers |
| **A11Y-02** | Accessibility widget (font-size and high-contrast toggles) | §Open Question 1 (the exact text-scale refactor, what must not scale, verified declaration counts). §Open Question 2 (`sessionStorage`, the flash window, the earliest CSP-legal application point). `06-UI-SPEC.md` Contracts 1 to 6 own the visuals |
| **A11Y-03** | Conformant Deklaracja dostępności (authored here, ticked in Phase 7) | §Open Question 3. **This is where research changes the design:** the mandatory `a11y-*` identifier set, the missing `Dostępność komunikacyjno-informacyjna` section, the v2.0 timeline, the review cadence, and the free third-party validator that acts as an independent oracle |
| **LEGAL-01** | Prominent, correct BIP link | §Codebase Facts. Verified present at `Footer.svelte:68-74` (every route) and `rekrutacja.ts:165-168`, with the exact conventional label and the visually-hidden new-tab suffix, and already asserted at `tests/nav.spec.ts:51-52`. What is NOT yet proven is per-route presence and the `/rekrutacja` site |
| **LEGAL-02** | Polityka prywatności / RODO page (authored here, ticked in Phase 7) | §Open Question 5 (how a panel store carries statutory long-form prose without a free-form body, and which of the three existing renderers to reuse). The twelve `KLAUZULA` blocks are verified present and verified twelve |

Not a requirement, tracked by decision only: the EU-funding marking (D-17) and the combined launch gate (D-18 to D-20, §Open Question 6).
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

Directives extracted from `./.claude/CLAUDE.md`. Treated with the same authority as locked decisions.

| Directive | Consequence for this phase |
|---|---|
| **Polish only**, visitor-facing AND the whole editorial panel | Both new panel screens must join `TRASY` in `tests/fixtures/trasy-panelu.ts` in the same commit, or they get zero Polish coverage. `tests/admin-enumeracja.spec.ts` is what makes the gap loud |
| **No emoji, no em dashes anywhere**; en dash only in numeric ranges | Applies to code comments, test names and commit messages, not only shipped copy. The EU klauzula's en dash is the one byte-exempt string and must join the exemption list `tests/forms-copy.unit.ts` uses |
| **WCAG 2.1 AA + published Deklaracja dostępności** | Legally required for a public body. This phase is the one that certifies the baseline in a legal document |
| **RODO**, no database, no storage, no logging of submissions | The `sessionStorage` preference must be disclosed in the Polityka (Contract 8 §3). Neither new panel validator may log a field value |
| **BIP** link prominently, do not rebuild it | LEGAL-01. Verify, do not move (D-26) |
| **Near-zero cost**, free tiers only | Zero new npm packages this phase. No accessibility overlay. Every save on the two new panel screens is a Pages build against a free ceiling of 500/month, which bounds UAT design |
| **Cloudflare hosting**, content routes prerender, only the two form endpoints are dynamic | The widget cannot have a server-side pre-hydration path. `event.platform.env.*`, never `import.meta.env` |
| **adapter-cloudflare:** SvelteKit server routes ARE the Pages Functions | Do not hand-author a `/functions` dir |
| **Tailwind v4 CSS-first `@theme`, no `tailwind.config.js`** | Directly decides Open Question 1's mechanism. See §Standard Stack |
| **Two-tier palette**, never bright yellow/orange on text | The high-contrast tier is a deliberately separate third tier (v1.8), entered only by explicit user action |
| **`/admin` is SvelteKit routes, never a static bundle** | Nothing under `static/admin/`, ever |
| **Do NOT create a root `.dev.vars`** | `wrangler types` bakes its keys into the committed `worker-configuration.d.ts` and `wrangler types --check` then fails every deploy |
| **Verify chain** `npm run check && npm run lint && npm run test:unit && npm run test` | Pre-commit runs only the first two and nothing automated runs `test:unit` today. **D-21 changes that and should land first** |
| **Route file-changing work through GSD** | No direct repo edits outside a GSD workflow |

**Project skills:** `.claude/skills/` does not exist in this repository. No project-scoped skill rules to load.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Accessibility widget UI and state | Browser / Client | - | Preference is per-visitor and per-session; there is no server on a prerendered route to hold it |
| High-contrast theme application | Browser / Client (CSS) | - | An attribute on `<html>` plus a stylesheet. Zero JavaScript at render time; the island only toggles the attribute |
| Text-scale application | Browser / Client (CSS) | - | One custom property resolved once at `:root`. No layout work when the multiplier is 1 |
| Preference persistence | Browser / Client (`sessionStorage`) | - | D-11. Never leaves the browser, which is also what makes the RODO disclosure short |
| Legal-page content authoring | API / Backend (`/admin` on the Worker) | Database / Storage (git via the GitHub App) | The panel is the Cloudflare Worker; the store is a JSON file committed to the repo |
| Legal-page rendering | CDN / Static (prerendered) | - | Content is read at BUILD time. A save takes about two minutes to appear publicly |
| Statutory structure enforcement | CDN / Static (code-authored markup) | API / Backend (validator) | The section list is code so no editor control can delete one; the validator guards the leaf values |
| Placeholder inventory | Build / Tooling (`node`) | - | Reads the working tree off disk. Not a runtime concern and deliberately not in the build chain (D-18) |
| Go-live mechanics checks | Build / Tooling | CDN / Static (build output cross-check) | Source-of-truth checks are deterministic; build-output checks are a cross-check when the output exists |
| Performance measurement | External tooling (Chrome DevTools MCP) | - | Against the LIVE deployment (D-25). Not a test, by decision |
| BIP link-out | CDN / Static | - | An anchor in the prerendered footer. Nothing dynamic |

**Tier note that matters for SITE-05:** every public route in this project is a **static asset on the Cloudflare edge**, not a Worker response. Cloudflare Pages resolves static assets before invoking the Worker, a fact this repository already recorded when `static/admin/` shadowed the panel (04.1-01). The Worker serves only `/api/kontakt`, `/api/rekrutacja` and `/admin/*`. The framing "a timing assertion against a free-tier Worker would be flaky" in D-25 is correct as a reason not to write the assertion, but the underlying variance on the three measured routes is edge-static variance, which is materially lower than Worker cold-start variance.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` + `@tailwindcss/vite` | 4.3.0 (installed) | CSS-first `@theme` tokens in `src/app.css` | Already the project's design-token mechanism. **No new dependency.** `[VERIFIED: package.json]` |
| `svelte` | 5.56.1 (installed) | Runes; the widget is the fifth hydrated island | `[VERIFIED: package.json]` |
| `@sveltejs/kit` | 2.63.0 (installed) | Prerendered public routes; `csp: {mode:'auto'}` | `[VERIFIED: package.json]` |
| `marked` | 18.0.9 (installed, exact-pinned) | Behind the three hardened renderers in `src/lib/markdown.ts` | Reused for the legal-page prose. **No new dependency.** `[VERIFIED: package.json]` |
| `@axe-core/playwright` | 4.13.0 (installed) | Tier 1 of the audit | `[VERIFIED: package.json]` |
| `@playwright/test` | 1.62.1 (installed) | Browser acceptance | `[VERIFIED: package.json]` |
| `@lucide/svelte` | 1.31.0 (installed) | The four new utilitarian icons the UI-SPEC names | Already a dependency. **No new dependency.** `[VERIFIED: package.json]` |
| `node --test` | Node 22.23.2 (pinned in `.tool-versions`) | `tests/*.unit.ts`, TypeScript stripped natively | `[VERIFIED: .tool-versions, package.json scripts]` |

### Supporting (tooling, not shipped)

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `chrome-devtools-mcp` | 1.7.0 | The MCP server the `web-perf` skill drives for D-25 | **Not currently configured.** Run via `npx -y chrome-devtools-mcp@latest` as an MCP server, never installed into the project `[VERIFIED: npm view chrome-devtools-mcp version]` |
| Google Chrome | present at `/Applications/Google Chrome.app` | The browser the MCP server drives | `[VERIFIED: filesystem]` |
| Walidator Deklaracji Dostępności v.2 | web service | Independent oracle for the statutory structure | Held-out validation, once per phase, on the live page `[CITED: deklaracja-dostepnosci.info/walidator]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| chrome-devtools MCP for D-25 | `npx lighthouse` CLI with its default mobile config | The CLI's default mobile profile (Moto G Power emulation, simulated Slow 4G, 4x CPU) is a **fixed, documented, low-variance** profile and needs no MCP configuration at all. It is the better instrument for a reproducible before/after. D-25 names the MCP path, so the MCP path is primary; the CLI is the recommended cross-check. Neither is installed as a project dependency |
| `renderPost` for legal prose | A fourth renderer that also drops `hr`, `blockquote` and `code` | See §Open Question 5. A fourth renderer is stricter but adds a module inside an accessibility-certification phase for a cosmetic risk. Recommended: reuse `renderPost` and style the two stray block elements |
| `calc()` tokens inside `@theme` | A plain `:root` block after `@theme` | The UI-SPEC already chose `:root`, and research confirms two independent reasons (see §Open Question 1). Do not revisit |
| Widening the launch gate's regex to distinguish explanatory hits | Rewording the explanatory lines (D-19, 04-02 precedent) | A cleverer regex is itself a silent-false-negative surface. Rewording is what the repository already does and is what D-19 mandates |

**Installation:**

```bash
# ZERO new npm packages. This phase installs nothing into the project.
# One MCP server is added to the agent configuration, not to package.json:
#   "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest"] }
```

**Version verification:** `npm view chrome-devtools-mcp version` returns `1.7.0`, published `2026-08-10`. No project dependency changes, so no other version verification is owed.

---

## Package Legitimacy Audit

This phase installs **zero** external packages into the project. The single tool dependency is an MCP server executed with `npx` and never written to `package.json`.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `chrome-devtools-mcp` | npm | latest release 2026-08-10 | 2 322 781/wk | `github.com/ChromeDevTools/chrome-devtools-mcp` | **[SUS]** | **Flagged, approved with explanation.** The seam's only reason is `too-new`, and it is reading the **latest release date**, not the package's age. 2.3M weekly downloads and an official `ChromeDevTools` org repository are both incompatible with slopsquatting. It is also not installed into the project. **The planner should still add a `checkpoint:human-verify` before the MCP config change**, because the config runs `@latest` unpinned |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `chrome-devtools-mcp`, for the reason above. Recommended mitigation: pin the version in the MCP config (`chrome-devtools-mcp@1.7.0`) rather than `@latest`, so a compromised future release cannot be pulled silently.

No `postinstall` script is declared (`postinstall: null` in the seam's signal set) `[VERIFIED: gsd-tools query package-legitimacy check]`.

---

## Architecture Patterns

### System Architecture Diagram

```
                          VISITOR (phone, mobile data)
                                    |
                                    v
                    +-------------------------------+
                    |  Cloudflare edge, static asset|
                    |  resolution happens FIRST     |
                    +-------------------------------+
                        |                       |
      public route?     |                       |  /api/* or /admin/*
      (prerendered HTML)|                       |  (Worker invoked)
                        v                       v
        +-------------------------+      +--------------------------+
        | prerendered page        |      | SvelteKit server routes  |
        | + CSP <meta> with the   |      | = the Pages Functions    |
        |   bootstrap sha256 hash |      +--------------------------+
        +-------------------------+            |            |
                        |                      |            |
             FIRST PAINT (default theme)       |            |
                        |                 form endpoints    |
                        v                 (Resend, KV)      v
        +-------------------------+                +---------------------+
        | inline bootstrap script |                | /admin panel screens|
        | dynamic-imports         |                | session-gated,      |
        | start.js + app.js       |                | noindex, no prerender|
        +-------------------------+                +---------------------+
                        |                                     |
                        v                                     | Zapisz
        +-------------------------+                           v
        | kit.start() imports the |                +----------------------+
        | root layout node        |                | validator (closed    |
        +-------------------------+                | allowlist, no logs)  |
                        |                          +----------------------+
        <-- EARLIEST CSP-LEGAL POINT to set                   |
            html[data-kontrast] / html[data-skala]            v
                        |                          +----------------------+
                        v                          | GitHub App commit to |
        +-------------------------+                | src/lib/content/*.json|
        | hydration, then $effect |                +----------------------+
        | mounts the widget button|                           |
        +-------------------------+                           v
                        |                          +----------------------+
       user opens panel |                          | Pages rebuild (~2min)|
                        v                          | build-time reader    |
        +-------------------------+                | renders legal pages  |
        | sets attribute on <html>|                +----------------------+
        | writes sessionStorage   |                           |
        +-------------------------+                           v
                        |                            back to prerendered
        client-side nav does NOT remount the layout,      page above
        so the attribute survives with ZERO flash


        SEPARATE, NOT IN ANY BUILD OR HOOK (D-18):

        npm run gate:launch  --->  scan src/, static/, docs/ for BOTH
                                   comment syntaxes of the PLACEHOLDER marker
                             --->  walk src/lib/content/**/*.json for every
                                   `placeholder` boolean (SHARED walker with
                                   tests/zastepcze.unit.ts, not a copy)
                             --->  go-live mechanics: noindex default, robots,
                                   sitemap host + URL set, OG card, stub docs,
                                   repo visibility
                             --->  prints a Polish checklist, exits 1 while RED
```

### Recommended Structure for the new files

```
src/
├── app.css                                  # + :root text-scale block, + html[data-kontrast] Layer 1, + global .visually-hidden
├── lib/
│   ├── zastepcze.ts                         # NEW: the shared placeholder walker, extracted from tests/
│   ├── components/
│   │   ├── UlatwieniaDostepu.svelte         # NEW: the widget island (trigger + panel)
│   │   └── TopBar.svelte                    # + third flex item, 36px -> 44px
│   ├── motyw.ts                             # NEW: browser-guarded module-top-level theme restore
│   ├── content/
│   │   ├── deklaracja.json                  # NEW seed store, TAB-indented + trailing newline
│   │   └── polityka.json                    # NEW seed store, same rules
│   └── server/admin/walidacja/
│       ├── deklaracja.ts                    # NEW closed-allowlist validator
│       └── polityka.ts                      # NEW closed-allowlist validator
├── routes/
│   ├── deklaracja-dostepnosci/+page.svelte  # REPLACED in full, adopts Seo, carries a11y-* ids
│   ├── polityka-prywatnosci/+page.svelte    # REPLACED in full, adopts Seo
│   └── admin/
│       ├── deklaracja-dostepnosci/          # NEW panel screen (pulpit tile only)
│       └── polityka-prywatnosci/            # NEW panel screen (pulpit tile only)
scripts/
└── gate-launch.ts                           # NEW: npm run gate:launch (D-18)
tests/
├── deklaracja-dostepnosci.spec.ts           # NEW: currently ZERO coverage
├── kontrast.spec.ts                         # NEW: HC sweep + the no-white-background property
├── skala-tekstu.spec.ts                     # NEW: 130% reflow, or fold into responsive.spec
├── gate-launch.unit.ts                      # NEW: the gate is itself tested
└── fixtures/trasy-panelu.ts                 # 17 -> 19
```

### Pattern 1: Two-block CSS, both inert by default

**What:** The default theme is preserved not by care but by construction. Every rule this phase adds is gated on an attribute on `<html>` that is absent by default.

**When to use:** Both new CSS mechanisms.

```css
/* src/app.css, AFTER @theme. Deliberately a plain :root block, not @theme. */
:root {
	--skala-tekstu: 1;
	--font-size-15: calc(15px * var(--skala-tekstu));
	/* ... the other eleven, plus the two clamps ... */
}
html[data-skala='115'] { --skala-tekstu: 1.15; }
html[data-skala='130'] { --skala-tekstu: 1.3; }

html[data-kontrast='wysoki'] {
	--hc-tlo: #000000;
	--hc-tekst: #ffff00;
	--hc-uwaga: #ffffff;
	--color-surface: var(--hc-tlo);
	/* ...the full flip table, 06-UI-SPEC.md:493-520... */
}
```

**Why it holds:** with no attribute present, `--skala-tekstu` is `1` and every `calc()` resolves to its original px value, and no `html[data-kontrast='wysoki']` selector matches. A screenshot of any page with no attribute set is byte-identical to today's. This is also why `/admin` needs no exclusion list: the panel never sets either attribute.

### Pattern 2: Component-scoped Layer 2 overrides

```svelte
<style>
	.inner { background: var(--color-brand-blue); color: #ffffff; }

	/* Specificity (0,3,1) against the base rule's (0,2,0): wins deterministically,
	   not by source order. Verified to compile with zero svelte-check errors and
	   zero unused-selector warnings against this repository (06-UI-SPEC §Sources). */
	:global(html[data-kontrast='wysoki']) .inner {
		background: var(--hc-tlo);
		color: var(--color-ink);
		border-bottom: 2px solid var(--color-ink);
	}
</style>
```

**Why not global rules in `app.css`:** `.inner`, `.col` and `.chip` recur across components and an unscoped global rule would leak between them.

### Pattern 3: Code-authored structure, store-authored values

The statutory section list, the `h2` strings, their order and their `id="a11y-*"` attributes are **code**. The store holds only leaf values. There is no control on either panel screen that adds, removes, renames or reorders a section. This is what reconciles D-14 with 02 D-05.

```svelte
<!-- Structure is code. Only {dane.architektura} comes from the store. -->
<section aria-labelledby="naglowek-architektura">
	<h2 id="naglowek-architektura">Dostępność architektoniczna</h2>
	<div id="a11y-architektura">
		{@html renderPost(dane.architektura)}
	</div>
</section>
```

### Pattern 4: One walker, two consumers

`tests/zastepcze.unit.ts` already walks every `.json` under `src/lib/content` and collects every `placeholder` key at any depth. **Extract `plikiTresci()` and `znaczniki()` into `src/lib/zastepcze.ts` and have both the existing suite and the new gate import them.** A second copy is exactly the drift T-05-09-05 exists to prevent.

### Anti-Patterns to Avoid

- **Landing Layer 1 without Layer 2.** The UI-SPEC says it outright: a token flip alone produces a white-on-white footer, an invisible nav chip label and a white tick on a yellow checkbox. One plan, or Layer 1 behind a flag the widget does not yet expose.
- **Adjusting a font size during the scale refactor.** Converting a `font-size` to a token is the whole change. A declaration whose value is not one of the fourteen is a **finding to report**, not a value to round.
- **Building the gate from D-19's letter alone.** It misses fifteen HTML-comment markers. See §Open Question 6.
- **Writing the Deklaracja from the statutory list by hand.** `PITFALLS.md:388` names this as the thing never to do, and the `a11y-*` requirement is exactly the sort of thing a hand-authored version omits.
- **Asserting `results.violations` only, in the high-contrast pass.** axe reports `incomplete` rather than `violations` when it cannot determine a background colour. See §Common Pitfalls.
- **A `disabled` input for the read-only klauzula blocks.** 05 Contract 11 already ruled: render as text.
- **Space-indenting either new seed JSON.** `src/lib/content/` is deliberately not in `.prettierignore`, the panel writes tabs, and the first panel save would then block every local commit (04.1 D-09).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessibility widget | A third-party overlay (UserWay, AccessiBe and that class) | The in-house island (D-01) | They ship non-Polish chrome, keep configuration in a vendor dashboard, and are a third-party script registry by another name. Also the whole reason 04.1 existed |
| Statutory declaration text and field list | Hand-authoring against the ustawa | The official generator's field list and wording, rendered in our own markup (D-16) | `PITFALLS.md:388`. Most self-written declarations omit required fields and are non-conformant even when present. Fines: up to 5 000 zł missing, up to 10 000 zł persistent |
| Markdown sanitisation for legal prose | A fourth renderer, or `marked` with defaults | `renderPost` from `src/lib/markdown.ts` | Already hardened against the stored-XSS boundary (T-03-01): raw HTML escaped, images collapsed to alt, hrefs allow-listed, headings neutralised to paragraphs, GFM tables dropped |
| Radio-group semantics for the three size steps | `role="radiogroup"` on divs | Three native `<input type="radio">` in a `<fieldset>` | Arrow-key navigation, one tab stop and correct group semantics for free. Same ruling 04.1 Contract 8 made for the file input |
| Focus-trap cycle logic | A fresh two-wrap-point handler | The corrected `-1` entry rule from `Lightbox.svelte:151-160` | The naive form is the exact defect D-23 fixes in `MobileNav`. Shipping it again in a new island would be worse than leaving the old one |
| Placeholder inventory walker | A second walker in the gate script | The extracted `plikiTresci()` / `znaczniki()` | A second copy is the drift the gate exists to close |
| Lighthouse median selection | Averaging scores by hand | `computeMedianRun` / Lighthouse CI, or the median of five runs on the primary metric | Google's own guidance: the median of 5 runs is roughly twice as stable as 1 run |
| Date input in the panel | `<input type="date">` | The existing `PoleDaty` three-select control (v1.5 Contract 5) | Picker chrome is browser-locale dependent and cannot be forced to Polish |
| Visually-hidden utility | A twenty-first component-local copy | The new global in `app.css` (Contract 14) | From v1.8 onward a twenty-first hand-rolled copy is a review finding |

**Key insight:** this phase's entire supply-chain movement is nil, and that is load-bearing rather than incidental. The commercial accessibility-overlay category is precisely the thing D-01 refuses, and the CSP still names exactly `self` and `https://challenges.cloudflare.com` on `script-src`.

---

## Open Questions Answered

### 1. Font scaling mechanism

**Verified counts.** `grep -rn 'font-size:' src/` finds **290** declarations. Excluding `/admin`, **167** are public, spread across **34 files**. The distinct public values are:

| Value | Public count | Note |
|---|---|---|
| `15px` | 67 | the workhorse |
| `16px` | 43 | |
| `clamp(1.5rem, 3vw, 1.75rem)` | 30 | the locked h2 clamp |
| `20px` | 30 | |
| `14px` | 19 | |
| `19px` | 10 | |
| `clamp(2rem, 5vw, 2.75rem)` | 9 | the locked h1 clamp |
| `17px` | 8 | |
| `13px` | 8 | |
| `26px` | 2 | |
| `12px` | 2 | |
| `18px` | 1 | |
| `2rem` | 2 | **both on the legal stubs**, deleted with them (Contracts 7 and 8) |
| `1.125rem` | 2 | **both on the legal stubs**, deleted with them |

`[VERIFIED: repository grep]`. This confirms the UI-SPEC's 290/167 figures exactly and confirms that the twelve px values plus two clamps are the complete set once the stubs go. Heaviest files: `rekrutacja/+page.svelte` (15), `ZgloszenieForm.svelte` (14), `o-nas/+page.svelte` (11), `Recruitment.svelte` (11), `cennik/+page.svelte` (10), `KontaktForm.svelte` (10). That distribution is the natural plan-task split.

**The exact refactor mechanism.** A mechanical, one-for-one substitution:

1. Add the plain `:root` block (Pattern 1) after `@theme` in `src/app.css`.
2. In each of the 34 public files, replace every `font-size: <value>;` with `font-size: var(--font-size-<n>);`, where `<n>` is the numeric token name (`h1` / `h2` for the two clamps).
3. Delete nothing else. Change no value. If a declaration's value is not one of the fourteen, **report it**; do not round it.
4. Leave the **123** `font-size` declarations under `src/lib/components/admin/` and `src/routes/admin/` alone. Both attributes are structurally absent there (`+layout.svelte:24` branches on the `panel` path and renders no `TopBar`), so the conversion would be inert churn.

**Can a Tailwind v4 `@theme` token hold a `calc()` referencing another custom property?** Mechanically yes, but you should not, for two independent reasons.

- **Reason A, scope resolution.** Tailwind's own docs say that when a theme variable references another variable, you must use `@theme inline`, otherwise the generated utility emits `var(--the-theme-variable)` and resolution follows the DOM scope where the **theme** variable is defined rather than where the referenced one is. `[CITED: tailwindcss.com/docs/theme, "Referencing other variables"]`
- **Reason B, tree-shaking.** "By default, Tailwind CSS only generates variables that are actively used in your project"; `@theme static` exists precisely to force all of them. `[CITED: tailwindcss.com/docs/theme, "Generating all CSS variables"]` A brand-new namespace referenced only from Svelte `<style>` blocks is exposed to that heuristic. (Empirically, today's `@theme` colour tokens DO all reach the built CSS: `--color-tint-green` and `--color-expr-orange` both appear in `.svelte-kit/output/client/_app/immutable/assets/0.*.css`, and both are genuinely used, so this observation neither confirms nor refutes the heuristic for an unused token. `[VERIFIED: built CSS inspection]`)
- **Reason C, namespace collision.** `--text-*` is Tailwind v4's own font-size namespace. The UI-SPEC's `--font-size-*` names avoid it. Keep them.
- **Reason D, split declarations.** `--skala-tekstu` is not a theme value and would have to live in `:root` regardless, so putting the fourteen derived tokens inside `@theme` would split one mechanism across two blocks for no gain.

**Conclusion: the UI-SPEC's choice of a plain `:root` block after `@theme` is correct and should not be revisited.** `[VERIFIED: Context7 + repository]`

**What happens to `@theme` values at build time versus runtime.** `@theme` is processed by Tailwind at build time into a real `:root { ... }` (and `:host`) rule in the emitted stylesheet, plus utility classes that reference those variables. It is not a runtime construct. `[VERIFIED: built CSS contains the literal `--color-tint-green:#dff0d8`]` A plain `:root` block is passed through untouched. Both end up as ordinary CSS custom properties in the same cascade, so `calc(15px * var(--skala-tekstu))` resolves per element at render time and a change to `--skala-tekstu` on `<html>` re-resolves every dependent declaration in one style recalculation. That is why Contract 5 can claim the mechanism costs nothing at runtime when the multiplier is 1.

**What must NOT scale, and why it does not.**

| Thing | Holds because |
|---|---|
| **The 46px KeyFacts / Perks / NewsCard icon chip** | it is a px box, not a font size. `01-UI-SPEC.md:521` (v1.6 §3) stands verbatim, and it is exactly why D-03 chose 130% over 150% |
| **Every 44px tap target** | `min-height: 44px` is a px box. Targets never shrink and never grow. `TopBar` items rise from 36px to 44px in the same phase (Contract 6) |
| **The committed map raster** and every `enhanced:img` | images carry `width`/`height` and a `sizes` attribute; no font size reaches them |
| **The 52px header emblem** | a px box |
| **Radii, paddings, gaps, borders, grid tracks, breakpoints** | none is expressed as a font size |
| **The 65ch / 56ch prose measure** | `ch` is relative to the element's own font size, so the measure is preserved **in characters**, which is the property the rule exists for |

**Five declared layout consequences at 130%, each with its fix in the same commit** (`06-UI-SPEC.md:773-782`): `Header.svelte:79` and `:89` fixed `height` become `min-height`; `MobileNav.svelte:190` `.drawer-head` the same; `Footer.svelte:202-208` `.slot-sm`/`.slot-lg` fixed `width` become `min-width` with `height: auto; min-height: 44px`; `TopBar` at 360px already wraps and needs no change; `DayPlan` `.time` is already `min-width` and needs no change. **The two "no change needed" rows are stated so nobody adds one.**

**Held-out risk:** 130% is a state that `tests/responsive.spec.ts` cannot currently see. Its `ROUTES` list is the second silent enumeration surface in this project (after `TRASY`) and must gain the scale condition, or the one new state that can produce horizontal overflow inherits zero coverage.

---

### 2. `sessionStorage` on prerendered SvelteKit routes

**Confirmed behaviour, and it is better than the question assumes.**

**Client-side navigation: zero flash, always.** SvelteKit reuses layout and page components across navigation by default; the documented way to force a remount is a `{#key page.url.pathname}` block, which exists precisely because reuse is the default. `[CITED: kit/documentation/docs/20-core-concepts/50-state-management.md via Context7]` The widget lives in `TopBar.svelte`, which lives in `src/routes/+layout.svelte:34-38`. That root layout mounts **once per document** and is never remounted while the visitor stays in the tab. The attribute stays on `<html>` across every internal link. `sessionStorage` is not even re-read.

**Hard load: the flash occurs, and here is exactly where.** The prerendered HTML carries **one** inline `<script>` at the end of `<body>`, hashed into the CSP `<meta>` (`script-src ... 'sha256-b1kyVq0tiR8fEc3yoE9PpzKDYje9ecTBdlUWTiP5Gq4='`). `[VERIFIED: .svelte-kit/output/prerendered/pages/index.html]` It does:

```js
Promise.all([
  import("./_app/immutable/entry/start.<hash>.js"),
  import("./_app/immutable/entry/app.<hash>.js")
]).then(([kit, app]) => { kit.start(app, element, { node_ids: [0, 3], ... }); });
```

The ordering is therefore, with no room for interpretation:

```
HTML parse  ->  FIRST CONTENTFUL PAINT (default theme, unavoidable)
            ->  inline bootstrap runs, kicks off two dynamic imports
                (both already modulepreload-hinted in <head>)
            ->  start.js + app.js evaluate
            ->  kit.start() dynamically imports route node 0 = src/routes/+layout.svelte
            ->  MODULE TOP LEVEL of anything +layout.svelte imports evaluates   <-- earliest CSP-legal point
            ->  Svelte hydrates the component tree
            ->  effect flush: $effect runs                                       <-- what Contract 1 uses today
```

**The earliest CSP-legal point to apply the theme class is module-evaluation time, not the `$effect`.** Put the restore in a small `src/lib/motyw.ts` imported by `src/routes/+layout.svelte`, guarded with `browser` from `$app/environment` so it is tree-shaken out of the server build and never runs during prerendering:

```ts
// src/lib/motyw.ts
import { browser } from '$app/environment';

if (browser) {
	try {
		const kontrast = sessionStorage.getItem('dostepnosc:kontrast');
		const skala = sessionStorage.getItem('dostepnosc:skala');
		if (kontrast === 'wysoki') document.documentElement.dataset.kontrast = 'wysoki';
		if (skala === '115' || skala === '130') document.documentElement.dataset.skala = skala;
	} catch {
		// sessionStorage can throw in a locked-down profile. The default theme is
		// fully AA conformant, so failing to restore is a cosmetic loss, never an
		// accessibility one.
	}
}
```

This is **fully compatible with D-12**: no CSP change, no new request, no inline script, no dropped prerender. It is code inside the bundle that `script-src 'self'` already permits and that the browser is already downloading. It does not replace Contract 1's `$effect`, which still owns rendering the button (correctly, because the button must not exist in prerendered HTML, D-04). It only moves the ATTRIBUTE restore earlier.

**How much does it save?** Only the hydration work of the component tree, which is the smaller half. **The dominant part of the flash is FCP to the resolution of those two dynamic imports**, and nothing CSP-legal beats that under `mode: 'auto'` plus prerender plus no-new-request. So the honest framing for the plan and the SUMMARY is: the flash is shipped (D-12), and the restore is placed at the earliest legal point because it is free, not because it eliminates the flash.

**Quantifying the flash: measure it, do not estimate it.** The window is deterministic and cheap to instrument. Current total client JavaScript is **399 021 bytes raw, about 129 KB gzipped** across all chunks, of which the entry path is `start.js` (~20 KB) + `app.js` (~12 KB) + the shared chunk (~36 KB) `[VERIFIED: .svelte-kit/output/client]`. Recipe, run against `npm run preview:test` and again against the live deployment:

```js
// paste into the page, or add a temporary measurement in motyw.ts
const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
const zastosowano = performance.now();          // read at module top level in motyw.ts
console.log('okno migniecia (ms):', zastosowano - fcp);
```

Record the number in the SUMMARY under both the default profile and the throttled mobile profile of D-25. Expect the throttled figure to be several times the unthrottled one; that is the number the "is the flash acceptable" judgement should be made against, and it is a Validation Architecture item because "how big does it feel" is not inferable from the millisecond count.

**Three secondary facts worth carrying into the plan.**

1. **bfcache restore does not flash.** A back-navigation restored from the back/forward cache restores the DOM including the `<html>` attribute. No JavaScript runs and nothing is re-read.
2. **`sessionStorage` is copied into a new tab opened from a link.** Chrome and Firefox both copy the opener's session storage into a tab opened via a `target="_blank"` link from the same page. The BIP link-out and the "otwiera się w nowej karcie" links therefore carry the setting with them, which is a small unexpected win and is worth one sentence in the Polityka's §3 disclosure only if the disclosure would otherwise be misleading (it is not: it says the setting lives in the browser's session memory and disappears when the tab closes, which remains true).
3. **`$effect` never runs during prerendering.** The wrapper renders, the button does not, and that is exactly D-04. No guard is needed for the server build of the component itself; the guard in `motyw.ts` is needed because module top level DOES run on the server.

---

### 3. The official Deklaracja dostępności generator

**This is the finding that changes the design.** The declaration is a **machine-readable document**, not only prose.

**Statutory basis.** Ustawa z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych. The document's structure is fixed by the Ministerstwo Cyfryzacji publication *"Warunki techniczne publikacji oraz struktura dokumentu elektronicznego deklaracji dostępności"*. `[CITED: mc.bip.gov.pl/objasnienia-prawne/warunki-techniczne-publikacji-oraz-struktura-dokumentu-elektronicznego-deklaracji-dostepnosci.html]`

**Version 2.0 is the binding version for this site.** Published **31 July 2024**. Declarations for new sites prepared **from 1 August 2024** must be prepared to v2.0 from the start; pre-existing declarations had to be updated to v2.0 by their next review, at the latest **31 March 2025**. This site's declaration is being authored in August 2026, so **v2.0 applies unconditionally and there is no transitional option.** `[CITED: gov.pl/web/dostepnosc-cyfrowa/zmienione-warunki-techniczne-publikacji-oraz-struktury-dokumentu-elektronicznego-deklaracji-dostepnosci--wersja-20]`

**Review cadence.** The declaration must be reviewed and its review date recorded **annually**; the conventional deadline for the yearly review across podmioty publiczne is **31 March**. This is exactly the obligation D-14 cites as the reason the page is a panel store at all, and it is the sentence the staff manual owes in plain Polish.

**The mandatory `id="a11y-*"` identifier set.** Two independent secondary sources agree on the following list; the primary BIP host refused the connection during this session, so the confidence is MEDIUM and **the plan should re-fetch the primary PDF and reconcile before implementation.**

| Identyfikator | Carried by | Status | Content |
|---|---|---|---|
| `a11y-deklaracja` | the `<h1>` | obowiązkowy | the document title |
| `a11y-wstep` | the opening statement block | obowiązkowy | the whole oświadczenie wstępne |
| `a11y-podmiot` | inline in the wstęp | obowiązkowy | `Publiczny Żłobek w Stromcu` |
| `a11y-zakres` | inline in the wstęp | obowiązkowy | the kind of solution (strona internetowa) |
| `a11y-url` | inline in the wstęp | obowiązkowy | `https://zlobekstromiec.pl` |
| `a11y-data-publikacja` | inline | obowiązkowy | site publication date |
| `a11y-data-aktualizacja` | inline | obowiązkowy | last significant update |
| `a11y-status` | the status sentence | obowiązkowy | `częściowo zgodna` |
| `a11y-ocena` | the assessment-method statement | obowiązkowy in v2.0 (was optional in v1.0) | `samoocena` |
| `a11y-data-sporzadzenie` | inline | obowiązkowy | declaration creation date |
| `a11y-kontakt` | the contact section | obowiązkowy | koordynator block |
| `a11y-osoba` | inline | obowiązkowy | koordynator name |
| `a11y-email` | the `<a href="mailto:">` | obowiązkowy | koordynator e-mail |
| `a11y-telefon` | inline | obowiązkowy | koordynator telephone |
| `a11y-procedura` | the procedure section | obowiązkowy | procedura wnioskowo-skargowa incl. RPO |
| `a11y-architektura` | the architecture section | obowiązkowy | building accessibility |
| `a11y-komunikacja` | the communication section | **obowiązkowy, and MISSING from the UI-SPEC's ten sections** | dostępność komunikacyjno-informacyjna |
| `a11y-aplikacje` | | opcjonalny | only when a mobile app exists |
| `a11y-audytor` | | opcjonalny | only for an external audit |
| `a11y-architektura-url` | | opcjonalny | link to a fuller building description |

`[CITED: dostepnastrona.pl/artykuly/deklaracja-dostepnosci-warunki-techniczne]` `[CITED: deklaracja-dostepnosci.info/walidator]` `[CITED: zapisariusz.pl/blog/deklaracja-dostepnosci-2-0-krok-po-kroku.html]`

**The v2.0 field list, in generator order.** Taken from an operating v2.0 generator, which is the closest reproducible proxy for the official form. `[CITED: standardwcag.pl/generator-deklaracji/]`

| Group | Fields | Status |
|---|---|---|
| Dane podmiotu i strony | Nazwa podmiotu; Nazwa strony internetowej; Adres strony WWW; Data publikacji strony; Data ostatniej istotnej aktualizacji | all obowiązkowe |
| Oświadczenie, status | Zgodność z ustawą | obowiązkowe |
| Niedostępne treści | lista niezgodności | opcjonalne (but required in substance when the status is `częściowo zgodna`) |
| Informacje o nadmiernych kosztach | forma; opis wyjątków; treści nieobjęte przepisami | conditional |
| Przygotowanie deklaracji i jej aktualizacja | Data sporządzenia deklaracji; **Data ostatniego przeglądu deklaracji**; Deklarację sporządzono na podstawie; audytor / wykonawca | obowiązkowe |
| Udogodnienia, ograniczenia i inne informacje | Dodatkowe informacje | opcjonalne |
| Skróty klawiszowe | niestandardowe skróty | **opcjonalne** |
| Dane kontaktowe do zgłaszania problemów | Imię i nazwisko; Numer telefonu; Email | all obowiązkowe |
| Aplikacja mobilna | nazwa; URL | opcjonalne |
| Dostępność architektoniczna | **Adres siedziby**; Opis dostępności architektonicznej; link | obowiązkowe (link opcjonalny) |
| **Dostępność komunikacyjno-informacyjna** | Opis | **obowiązkowe** |

**Four deltas against `06-UI-SPEC.md` Contract 7.** None changes the phase's scope; all four need one correction each.

1. **A missing mandatory section.** The UI-SPEC's ten sections do not include **`Dostępność komunikacyjno-informacyjna`**. It is obowiązkowa in v2.0 and is the single most commonly omitted section. It covers: whether a sign-language interpreter (PJM) is available, whether an assistance dog may enter, whether communication in an alternative form (large print, easy-to-read text, read-aloud) is offered. **Recommendation: add it as section 9, before `Aplikacje mobilne`, panel-editable, PLACEHOLDER-flagged.** Note this makes the UI-SPEC's `Dodatkowe informacje` section 10 partially redundant: the sign-language sentence the UI-SPEC puts in section 10 belongs in the komunikacyjno-informacyjna section instead. This also makes the ROADMAP SC2 "four content classes" count arguably five, or four if the two merge.
2. **The `a11y-*` identifiers are entirely absent from the UI-SPEC.** They cost nothing (an `id` attribute on markup this phase writes from scratch) and their absence makes the document technically non-conformant. **Recommendation: they become part of Contract 7's locked structure, and the section-presence test asserts the `id` set, not only the heading names.** This is strictly stronger than the D-16 test and is the same cost.
3. **`Adres siedziby` is a mandatory sub-field of the architecture section.** The site already holds it: `contact.addressLines` in `src/lib/content/site.ts`, reused by the klauzula. Interpolate it, do not retype it.
4. **`Skróty klawiaturowe` is optional, not mandatory.** The UI-SPEC's section 5 is therefore a *dobrowolny* element. Keeping it is fine and is good practice; the plan should just not describe it as statutory.

**An independent oracle exists and is free.** `https://deklaracja-dostepnosci.info/walidator` accepts a site's homepage URL, finds the declaration link, and validates the technical structure against the v2.0 identifier and heading requirements. `[CITED: deklaracja-dostepnosci.info/walidator]` This is the strongest non-unit-test validation available for A11Y-03 and costs one browser session. It belongs in the Validation Architecture as a held-out check, and it is exactly the sort of external check `PITFALLS.md:42-70` is asking for. **Caveat: it fetches the LIVE page, so it can only run after a deploy, and the site is `noindex` (which does not block a direct fetch).**

**Fines, restated because they are the reason the section list is a safety property.** Up to **5 000 zł** for a missing declaration; up to **10 000 zł** for persistent failure to provide digital accessibility. `[CITED: .planning/research/PITFALLS.md:42-70]`

---

### 4. Lighthouse methodology that is reproducible

**Blocking environment finding first.** The `chrome-devtools` MCP server is **not configured** in this environment. Available MCP servers: `cloudflare`, `svelte`, `context7`, `vitest`, `codemcp`, `eslint`. `[VERIFIED: ~/.claude.json mcpServers]` The `web-perf` skill's very first instruction is *"Run this before starting. Try calling `navigate_page` or `performance_start_trace`. If unavailable, STOP."* `[VERIFIED: ~/.claude/skills/web-perf/SKILL.md:18-29]` **D-25 has no execution path until this is fixed.** It is a one-line configuration change and it must happen before the phase's measurement task, not during it.

**How to run it reproducibly.**

```
chrome-devtools MCP config (pin the version, do not use @latest):
  "chrome-devtools": { "type": "local", "command": ["npx","-y","chrome-devtools-mcp@1.7.0"] }
```

Per route, per run:

1. `resize_page` to a mobile viewport (375 x 667 is the project's own smallest tested tier in `tests/responsive.spec.ts`; Lighthouse's own mobile default is 412 x 823 Moto G Power).
2. `emulate` with CPU throttling **4x** and network throttling **Slow 4G**. (Tool naming has moved across versions: older releases exposed `emulate_cpu` and `emulate_network` separately, 1.7.0 documents a combined `emulate`. **The plan must enumerate the available tools at run time rather than hard-coding a name.** `[CITED: github.com/ChromeDevTools/chrome-devtools-mcp]`)
3. `performance_start_trace(autoStop: true, reload: true)` to capture a **cold** load.
4. `performance_analyze_insight` on `LCPBreakdown` and `CLSCulprits`.
5. Record LCP, CLS, FCP, TBT and TTFB. **INP requires interaction and will not appear in a passive cold-load trace** at all; it is measured by interacting after the trace starts, or approximated by TBT. State honestly in the SUMMARY which of the three D-25 targets was measured directly and which was approximated. INP < 200ms on a site whose only interactivity is four islands is not in doubt, but "not in doubt" is not "measured".

**How many runs.** Google's own Lighthouse variability documentation states that the **median of five runs is roughly twice as stable as a single run**, and the Lighthouse team recommends at least five runs aggregated by median. Lighthouse CI selects the median run by FCP and TTI rather than by overall score (`computeMedianRun`). `[CITED: github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md]`

**Recommendation: five runs per route, per condition, median on LCP.** Three routes x two conditions (before, after) x five runs = 30 traces. At roughly 30 to 60 seconds each including throttled load, that is 15 to 30 minutes of wall clock. That is the honest budget; a single run per route would produce numbers that mean nothing in a before/after comparison, which is precisely the failure D-25's "record before-and-after in the SUMMARY" is trying to avoid.

**What variance to expect.** Two corrections to the framing in the question:

- **These three routes are not served by a Worker.** Cloudflare Pages resolves static assets before invoking the Worker, so `/`, `/o-nas` and `/aktualnosci/<slug>` are edge-cached static files. There is no free-tier Worker cold start in the critical path of any measured route. The Worker serves only `/api/*` and `/admin/*`. This means TTFB variance is edge-cache variance (single-digit to low-tens of milliseconds once warm), not cold-start variance.
- **Throttling method dominates variance, not the host.** Simulated throttling (Lantern, the Lighthouse mobile default) is a model applied to an unthrottled trace and is materially more repeatable than DevTools applied throttling, which is what `emulate` gives you. `[CITED: Lighthouse variability docs]` Practical expectation with `emulate`: **LCP spread of roughly ±10 to 25% across five runs; CLS is usually stable to ±0.01 unless a font swap or a late image is involved; TBT is the noisiest metric of the set.** With the Lighthouse CLI's simulated default the LCP spread typically falls to under ±10%.

**Therefore, the recommended instrument pair.** Primary, as D-25 mandates: `web-perf` over chrome-devtools MCP with explicit `emulate` throttling, median of five. Cross-check, free and zero-config-drift: `npx lighthouse <url> --only-categories=performance --output=json` run five times, taking the median. Its default mobile config is a fixed, documented profile (Moto G Power, simulated Slow 4G, 4x CPU) and does not depend on which chrome-devtools-mcp version happens to be installed. If the two instruments disagree by more than the expected spread, the disagreement itself is the finding.

**First cold run is not comparable.** Cloudflare Pages serves the first request for an asset in a given colo from origin. Warm the three routes once per condition and discard that run before starting the five.

**What SITE-05 actually turns on.** The phase ADDS work: a fifth island (2 KB gzipped budget), an EU-funding strip on every route's footer, two rebuilt pages, and 167 rewritten `font-size` declarations. **The "after" numbers can legitimately be slightly worse than the "before" numbers, and the SUMMARY must be allowed to say so.** The UI-SPEC's performance contract (`06-UI-SPEC.md:1257-1280`) is what keeps the regression bounded: zero new render-blocking assets, the always-rendered sized widget wrapper so hydration cannot cause CLS, and no new dependency. Measure the "before" numbers **first, before any code lands**, or the comparison is unrecoverable.

---

### 5. Panel stores for long-form legal content

**The apparent conflict.** D-14 makes both legal pages panel-editable. 02 D-05 forbids a free-form page body; 02 D-08 limits narrative fields to bold, links and lists only.

**They do not actually conflict, and the resolution is already built.** 02 D-05 forbids a free-form **page body**, meaning a single field into which an editor pastes an entire page and thereby invents its structure. It does not forbid a narrative field. The reconciliation has three parts:

**1. Structure is code; the store holds leaf values only.** The ten (with the research delta, eleven) statutory sections, their order, their `h2` strings and their `id="a11y-*"` attributes are code-authored and locked. There is **no control on either panel screen that adds, removes, renames or reorders a section**, so an editor structurally cannot produce a page body. That is the safety property D-16 buys and it must survive review. Contract 10 already says this; the research only confirms it satisfies 02 D-05.

**2. Field shapes.** Three shapes suffice, and all three already exist in the panel:

| Shape | Existing control | Legal-page use |
|---|---|---|
| Constrained value | `<select>` / `PoleDaty` (v1.5 Contract 5) | status, metoda oceny, four dates |
| Short plain string | `FormField` text input | koordynator name, e-mail, telephone |
| Bounded narrative | plain `<textarea>` + `PomocFormatowania` `<details>` (v1.5 Contract 6) | dostępność architektoniczna (240px), dostępność komunikacyjno-informacyjna, dodatkowe informacje, the polityka's four site-wide blocks |
| Bounded repeated narrative | `PowtarzalnaGrupa` (v1.5 Contract 7 / 04.1 P-26) | `Treści niedostępne`, cap 8 |

No new control type is needed. No WYSIWYG, no toolbar, no preview.

**3. The renderer. Use `renderPost`, not `renderInline`, and do not write a fourth.** The repository has exactly three renderers in `src/lib/markdown.ts` `[VERIFIED: source read]`:

| Renderer | Grammar | Used by | Fit for legal prose |
|---|---|---|---|
| `renderInline` | single paragraph, bold/italic/links; raw HTML escaped; images to alt | `/o-nas` narrative fields (`misja`, `kadra_opis`, `obiekt_opis`) | **No.** Cannot emit `<p>` or `<ul>`. The architecture description is inherently multi-paragraph and inherently a list |
| `renderPost` | full block, GFM; raw HTML escaped; images to alt; hrefs allow-listed; **headings neutralised to `<p>`**; GFM tables dropped | `/aktualnosci/[slug]` post body | **Yes, exactly.** Paragraphs, lists, bold, links: precisely 02 D-08's grammar, plus lists. And it structurally cannot emit a heading, an image, a table or raw HTML |
| `renderInstrukcja` | same, but **headings survive**, clamped to h2 to h4 | `/admin/pomoc` | **No.** Heading survival is the one property a statutory page must not grant an editor |

`renderPost`'s heading neutralisation was written to protect the news post's single `<h1>`. On a legal page it protects the statutory heading order and the `aria-labelledby` chain of the page **this very phase certifies as AA**. Same mechanism, same reason, no new code, no new dependency, and it inherits the T-03-01 stored-XSS hardening for free. That last point matters: both new stores are editor-writable and render on a **public** page, so they sit on the same trust boundary as the news body.

**One residual and its recommended handling.** `renderPost` sets `gfm: true`, so an editor who types `---` gets an `<hr>`, `> ` gets a `<blockquote>`, `1.` gets an `<ol>` and backticks get `<code>`. None is a compliance failure and none is a security issue, but `<hr>`, `<blockquote>` and `<code>` are currently unstyled on public pages, so they would render as browser defaults on a page that is supposed to demonstrate the design system.

- **Recommended:** reuse `renderPost` verbatim and add the four block styles to the legal pages' scoped `<style>`, which needs `p`, `ul`, `li`, `a` and `strong` rules anyway. One line each, no new module, no new test surface.
- **Rejected:** a fourth `renderPrawne` that also drops `hr`, `blockquote`, `code` and `ol`. Stricter, but it adds a module and a unit suite inside the one phase whose deliverable is an accessibility certification, to prevent a cosmetic outcome nobody has produced. Record it as a considered-and-rejected option so a reviewer sees it was weighed.
- The `PomocFormatowania` hint should keep naming only bold, links and lists, matching the existing panel convention.

**The polityka's twelve blocks are not markdown at all.** `KLAUZULA` in `src/lib/content/forms.ts` is a frozen `readonly BlokKlauzuli[]` of `{naglowek?, akapity[]}` with **no markup permitted in the strings**. Verified twelve blocks: `Administrator danych`, `Inspektor ochrony danych`, `Cel i podstawa prawna przetwarzania`, `Zakres danych`, `Odbiorcy danych`, `Przekazywanie danych poza Europejski Obszar Gospodarczy`, `Okres przechowywania`, `Brak zapisu w naszych systemach`, `Tymczasowa kopia zapasowa`, `Zabezpieczenie przed nadużyciami`, `Twoje prawa`, `Dobrowolność podania danych`. `[VERIFIED: repository]` They render directly as `<h3>` + `<p>`, no renderer involved, read-only on the panel screen (as **text**, never a `disabled` input, per 05 Contract 11).

Note also that `forms.ts:302` carries a genuine `// PLACEHOLDER:` marker for the IOD, inside the `Inspektor ochrony danych` block. It is a Phase 7 item and the gate must see it.

**Validators.** `src/lib/server/admin/walidacja/{deklaracja,polityka}.ts`, following the `walidacja/nabor.ts` and `walidacja/cennik.ts` precedent verbatim: closed allowlist, an absent field is a refusal and never a default, pure and dependency-free apart from `./pola.ts` and `../../../content/panel.ts`, **nothing logs**, relative imports carry an explicit `.ts` extension so `node --test` can drive the module without the path alias, and the store path is an exported constant pinned against the filesystem in the unit suite. `[VERIFIED: source read of walidacja/cennik.ts and walidacja/pola.ts]`

---

### 6. The combined launch gate's implementation

**Verified inventory, and it changes the design.**

**(a) The strict `// PLACEHOLDER:` scan.** `grep -rn '// PLACEHOLDER:' src/ static/ docs/` finds **16** hits. `[VERIFIED: repository grep]`

**Eight are real markers** and must make the gate red today:

```
src/lib/content/site.ts:53         published phone, overriding D-08
src/lib/content/site.ts:160        recruitment window wording
src/lib/content/site.ts:191        date of the next nabór
src/lib/content/rekrutacja.ts:121  exact fee wording
src/lib/content/cennik.ts:80       what the wyżywienie rate covers
src/lib/content/cennik.ts:87       payment method / deadline / consequence
src/lib/content/forms.ts:302       the IOD has not been named
src/lib/components/MapPanel.svelte:26  street-centroid coordinates
```

**Eight are EXPLANATORY** and are the permanent false positives D-19 orders reworded (04-02 precedent). Every one of them names the token inside backticks:

```
src/lib/content/site.ts:4          "extends to `// PLACEHOLDER:` line comments"
src/lib/content/site.ts:64         "used to be a `// PLACEHOLDER:` line comment here"
src/lib/content/site.ts:105        "THE TWO `// PLACEHOLDER:` LINE COMMENTS THAT USED TO STAND HERE"
src/lib/content/forms.ts:13        "`// PLACEHOLDER:` line comments in this module."
src/lib/content/rekrutacja.ts:25   "extends to `// PLACEHOLDER:`"
src/lib/content/cennik.ts:22       "extends to `// PLACEHOLDER:`"
src/lib/w-skrocie.ts:81            "the marker that used to be a `// PLACEHOLDER:` line comment in"
src/routes/admin/w-skrocie/+page.svelte:24  "were `// PLACEHOLDER:` line comments in"
```

Four further lines name the bare token without the slashes (`site.ts:3`, `forms.ts:12`, `ContactAndMap.svelte:3`, `Footer.svelte:92`) and are already harmless under the strict form, but should be reworded in the same sweep so a future reader is not tempted to loosen the pattern.

**THE CRITICAL GAP: fifteen `<!-- PLACEHOLDER:` markers exist in `.svelte` markup and the strict `// PLACEHOLDER:` form does not match a single one.** `[VERIFIED: repository grep]`

```
src/lib/components/TopBar.svelte:10, :15
src/lib/components/Footer.svelte:25, :31
src/lib/components/ContactAndMap.svelte:31, :51
src/lib/components/Recruitment.svelte:35
src/lib/components/AboutTeaser.svelte:12
src/lib/components/Hero.svelte:29, :46, :54
src/routes/rekrutacja/+page.svelte:77
src/lib/assets/uploads/README.md:22
src/routes/polityka-prywatnosci/+page.svelte:16   <- deleted by Contract 8
src/routes/deklaracja-dostepnosci/+page.svelte:16 <- deleted by Contract 7
```

Thirteen survive this phase and every one is a genuine launch-gate obligation: the phone number, the opening hours, the address, the program logos, the admission facts, the hook headline, the decorative image slots, the next-nabór date, the seeded upload images. **A gate built to the letter of D-19 would go GREEN in Phase 7 with all thirteen still in the tree.** That is exactly the class of silent loss D-19 exists to close, one syntax over.

**Recommendation, and the plan should treat it as a required correction rather than an option:** the gate's pattern is

```
/(?:\/\/|<!--)\s*PLACEHOLDER:/
```

and the reword sweep extends to any `<!--`-form explanatory line as well. This is a one-character-class change and it costs nothing. State it in `06-CONTEXT.md` as a D-19 clarification, not as a new decision.

**Bare-token hits in `static/` are deliberately NOT the comment scan's job.** `static/sitemap.xml:5` (a comment saying the host is a placeholder), `static/dokumenty/wniosek-o-przyjecie-dziecka.doc:1` and the text streams of the two stub PDFs all carry the bare token in a form neither comment syntax matches. They are covered by the D-20 explicit checks instead (sitemap host, stub-document size), which is the correct division: the comment scan handles source, the checklist handles artefacts.

**(b) Reading every `placeholder` boolean under `src/lib/content`.** `tests/zastepcze.unit.ts` already does this, correctly, off disk, recursively, with a non-vacuity guard, and it **deliberately never asserts that a flag is false** because every flag is legitimately true until Phase 7. `[VERIFIED: source read]` Current inventory: **eleven** flags across nine files, of which ten are `true` and one (`w-skrocie.json.miejsca.placeholder`) is `false`. `[VERIFIED: repository grep]` Both new legal stores add nested per-block flags (per D-14 and 05 Contract 11's per-block granularity), taking the inventory to roughly fifteen.

**Do not duplicate the walker. Extract it.** `plikiTresci()` and `znaczniki()` are not exported today and live inside a `node:test` suite. Move both into `src/lib/zastepcze.ts` (plain module, `node:fs`, no test import) and have `tests/zastepcze.unit.ts` and `scripts/gate-launch.ts` both import from it. Two consequences worth carrying:

- Keep the relative-import-with-`.ts`-extension convention so bare `node --test` type stripping still resolves it. Node is pinned at **22.23.2** in `.tool-versions`, where TypeScript stripping is unflagged, and `node --test tests/*.unit.ts` already relies on it. Write the gate as `scripts/gate-launch.ts` and run it with plain `node scripts/gate-launch.ts` on the same runtime, so there is one type-stripping story rather than two.
- `src/lib/zastepcze.ts` carries `node:fs`, so it must **never** be imported from an `/admin` route or any client component. The panel is the Cloudflare Worker and has no filesystem (the 04.1-08 lesson). It is build/tooling-tier only.

**(c) Go-live mechanics (D-20).** Six checks, each with a verified current state.

| # | Check | Current state (verified) | Assertion |
|---|---|---|---|
| 1 | **noindex guard** | `Seo.svelte` `noindex = true` as the prop default, one site. D-20's correction is right: after Contracts 7 and 8 delete both hand-rolled tags there is exactly **one** flip site. `src/routes/admin/+layout.svelte:62` keeps noindex forever and is not part of the flip | Source check: `Seo.svelte`'s default is `false`. Optional cross-check when `.svelte-kit/output/prerendered/pages` exists: zero prerendered pages carry `<meta name="robots" content="noindex">` |
| 2 | **`static/robots.txt`** | `User-agent: *` / `Disallow: /`, no `Sitemap:` line | No `Disallow: /` for `User-agent: *`; a `Sitemap:` line present and pointing at the real host |
| 3 | **Sitemap host and URL set** | host is `https://zlobek-stromiec.pages.dev`, which is **wrong twice**: the real Pages host is `zlobek-gminny-stromiec.pages.dev` and the real live host is `zlobekstromiec.pl`. Only **three** `<loc>` entries (`/`, `/kontakt`, `/rekrutacja`) against **nine** prerendered public pages plus the news posts | Every `<loc>` host equals `https://zlobekstromiec.pl`; the `<loc>` path set equals the prerendered page set derived from `.svelte-kit/output/prerendered/pages/`. That second half is cheap and is the part a human checklist always loses |
| 4 | **OG share card** | `static/og-placeholder.png`, 37 KB, still carries the old branding per STATE.md | `Seo.svelte`'s default `image` is not `/og-placeholder.png`, and no file named `og-placeholder.*` remains under `static/` |
| 5 | **Stub documents** | `regulamin-rekrutacji.pdf` 630 B, `statut-zlobka.pdf` 623 B, `wniosek-o-przyjecie-dziecka.doc` 96 B | Every file under `static/dokumenty/` exceeds a size floor (10 KB is generous for a real scanned wniosek and unreachable for a stub) AND its first 4 KB contains no literal `PLACEHOLDER`. **Plus D-29:** no `.doc` or `.docx` remains under `static/dokumenty/` |
| 6 | **Repository private (D-22)** | org `zlobekstromiec` is free plan; repo currently public | Not offline-checkable. Query `gh api repos/zlobekstromiec/<repo> --jq .private` when `gh` is on PATH; otherwise print the item as `RĘCZNIE` and count it as unresolved. Either way the gate exits non-zero while it is unresolved, which is correct for the whole of Phase 6 |

**Gate output shape.** One Polish line per check, a `OK` / `CZERWONE` / `RĘCZNIE` marker, the offending paths listed under each failure, a summary count, and `process.exitCode = 1` on any failure. `npm run gate:launch` in `package.json`, **not** in `build`, **not** in `.pre-commit-config.yaml` (D-18), documented in `docs/dev-env.md` beside the four-command verify gate so it does not become folklore.

**Test the gate itself.** `tests/gate-launch.unit.ts` should prove, on fixtures rather than on the live tree, that: a strict `//` marker is found; a `<!--` marker is found; an explanatory backticked mention is NOT found after rewording; a `placeholder: true` at any nesting depth is found; and a green tree exits zero. A gate nobody tests is the same class of artefact as a skipped test, which is what T-05-05-05 and D-18 both exist to prevent.

**Sequencing note.** D-21 (`npm run test:unit` into the Pages build command) should land **first in the phase**, before the gate and before the two new validators, or every unit suite this phase writes sits in a tier that still runs nowhere automatically. The UI-SPEC says the same at `:1762-1764`.

---

## Codebase Facts Verified This Session

Everything below was read or measured in this session, not recalled.

| Fact | Value | Source |
|---|---|---|
| `font-size` declarations, total / public | 290 / 167 across 34 public files | grep |
| Distinct public font-size values | 12 px values + 2 clamps + `2rem` and `1.125rem` on the two stubs only | grep |
| `TRASY` route count | **17** (naive `grep -c "sciezka:"` returns 18 because line 41 is the type declaration) | file read |
| `KLAUZULA` block count | **12**, headings enumerated above | AWK extraction |
| `placeholder` booleans under `src/lib/content` | 11 across 9 files; 10 true, 1 false | grep |
| Strict `// PLACEHOLDER:` hits | 16 (8 real, 8 explanatory) | grep |
| `<!-- PLACEHOLDER:` hits | 15 (13 survive this phase) | grep |
| BIP link sites | `Footer.svelte:68-74` (every route, exact label, `target="_blank" rel="noopener noreferrer"`, visually-hidden new-tab suffix) and `rekrutacja.ts:165-168` (`BIP_ZLOBEK`) | file read |
| BIP already asserted | `tests/nav.spec.ts:51-52` asserts the accessible name and the exact href | file read |
| `/deklaracja-dostepnosci` test coverage | **ZERO.** No spec file. Its only appearance in `tests/` is one entry in a `nav.spec.ts` list | grep |
| `/polityka-prywatnosci` test coverage | **EXISTS** and is already axe-covered (`tests/polityka-prywatnosci.spec.ts`), contradicting the UI-SPEC's "currently uncovered" claim | file read |
| Client JavaScript weight | 399 021 B raw / ~129 KB gzipped across all chunks | build output |
| Prerendered pages | 9 HTML files plus the `aktualnosci/` directory | build output |
| CSP as actually emitted | `<meta http-equiv="content-security-policy">` with `script-src 'self' https://challenges.cloudflare.com 'sha256-...'`; no nonce on prerendered pages | prerendered HTML |
| Emitted `@theme` variables | present in the built CSS as literal `:root` custom properties | built CSS |
| Node pinned | 22.23.2 (`.tool-versions`); local runtime 25.9.0 | file read |
| Pre-commit hooks | `npm run check` + `npm run lint` only. No CI workflow. `test:unit` runs in no automated gate | `.pre-commit-config.yaml`, `docs/dev-env.md:60-78` |
| Playwright webServer | `npm run build && npm run preview:test`, `baseURL http://localhost:4173`, chromium only, `retries: 2` in CI | `playwright.config.ts` |
| Axe spec files | 20 files use `AxeBuilder` today | grep |
| Live URL | `https://zlobek-gminny-stromiec.pages.dev`; custom domain `zlobekstromiec.pl` attached, site noindex on every origin | `docs/dev-env.md:17, :97-99` |

---

## Common Pitfalls

### Pitfall 1: axe reports `incomplete`, not `violations`, when it cannot determine a background

**What goes wrong:** every axe assertion in this repository is `expect(results.violations).toEqual([])`. axe's `color-contrast` rule returns an **`incomplete`** result, not a violation, when it cannot compute the effective background: text over an image, over a gradient, over a semi-transparent overlay, or where a positioned ancestor obscures the stack. Those cases pass the current assertion silently.

**Why it happens here specifically:** the high-contrast theme repaints every background in the tree. The seventeen hardcoded `#ffffff` literals and the nine border-less shadows are exactly the surfaces where a missed override leaves text on an unexpected background. `Hero.svelte:80` is a gradient. `Header.svelte:116-120` and `Footer.svelte:150` are image plates. The pass most likely to be wrong is the one least likely to fail.

**How to avoid:** in the high-contrast axe pass, additionally assert that `results.incomplete.filter(r => r.id === 'color-contrast')` is empty, or enumerate and justify each entry. `[ASSUMED: axe-core incomplete semantics; verify against @axe-core/playwright 4.13 output during Wave 0]`

**Warning signs:** the HC sweep goes green on the first run with no manual screenshot ever taken.

### Pitfall 2: the launch gate matches one comment syntax out of two

Covered in full in §Open Question 6. Restated here because it is the single highest-consequence defect available to this phase: it fails silently, in Phase 7, after Phase 6 is closed.

### Pitfall 3: the sitemap host is wrong in two different ways at once

`static/sitemap.xml` names `https://zlobek-stromiec.pages.dev`. The actual Pages host is `zlobek-gminny-stromiec.pages.dev` and the actual live host is `zlobekstromiec.pl`. A gate that only checks "the host is not a `pages.dev`" would still pass a typo'd custom domain. Assert equality against one constant, and derive the URL set from the build output rather than from a hand list.

### Pitfall 4: the `:global()` Layer 2 selector compiles but the DEFAULT theme regresses anyway

**What goes wrong:** `:global(html[data-kontrast='wysoki']) .klasa` is correct and verified to compile. The regression risk is not in the HC rule; it is in the **base** rule the executor touches while adding it. Reformatting a base declaration, moving it, or "tidying" an adjacent value while editing seventeen components is how a default-theme regression enters an accessibility phase.

**How to avoid:** the "default theme cannot regress" claim must be **tested**, not asserted. See §Validation Architecture, Wave 0 item: capture default-theme visual baselines for every public route **before** any Layer 1 or Layer 2 code lands.

### Pitfall 5: the text-scale substitution becomes a redesign

167 declarations across 34 files is exactly the size where "while I'm in here" starts. `06-UI-SPEC.md:1741-1744` already rules: converting a `font-size` to a token is the whole change; a value that is not one of the fourteen is a **finding to report**. The plan should carry that sentence into each substitution task verbatim.

### Pitfall 6: the two new panel screens ship with zero Polish coverage

`tests/fixtures/trasy-panelu.ts` `TRASY` is the only automated gate on SITE-06/CMS-03 for the panel. It holds 17 and must reach 19 **in the same commit** as the routes. `tests/admin-enumeracja.spec.ts` walks `src/routes/admin` on disk and turns red if a route is missing from it, so the gap is loud, but only if the enumeration test runs. Four upstream documents (`.claude/CLAUDE.md:10`, `.planning/REQUIREMENTS.md:67`, `.planning/STATE.md`, `04.1-11-SUMMARY.md`) still say eighteen and are wrong; fix them in the same sweep, because a spec saying eighteen and a file saying nineteen gets reconciled by somebody deleting a route.

### Pitfall 7: a space-indented seed store blocks every local commit

`src/lib/content/` is deliberately not in `.prettierignore` and the panel writes `JSON.stringify(dane, null, '\t') + '\n'`. Hand-author both new seed files tab-indented with a trailing newline or the first panel save blocks every commit until somebody runs `prettier --write` (04.1 D-09; hit live once already at 03 UAT).

### Pitfall 8: the Deklaracja is graded by a crawler, not by a reader

Covered in §Open Question 3. The `a11y-*` identifiers are the whole reason a hand-authored declaration fails even when its Polish is perfect.

### Pitfall 9: measuring "after" without having measured "before"

D-25 requires before-and-after numbers. The "before" measurement has exactly one window: **before the first Phase 6 code change lands on the live deployment.** Every save on the two new panel screens is a Pages build, and every push rebuilds. There is no way to recover a "before" number retroactively. Make the baseline measurement the first task of the phase, ahead of the D-21 build-chain edit.

### Pitfall 10: a mandatory legal page ships with an unstyled `<blockquote>`

See §Open Question 5's residual. `renderPost` emits GFM block elements the public stylesheet has never had to style. Add the rules with the page, not after somebody notices.

---

## Code Examples

### The `a11y-*` identifier pattern, applied to Contract 7's section 2

```svelte
<!-- Source: Warunki techniczne v2.0 identifier list; renders in OUR markup (D-16) -->
<section aria-labelledby="naglowek-status">
	<h2 id="naglowek-status">Status pod względem zgodności z ustawą</h2>
	<p>
		Strona internetowa jest
		<span id="a11y-status">{STATUS[dane.status]}</span>
		z ustawą o dostępności cyfrowej stron internetowych i aplikacji mobilnych
		podmiotów publicznych z powodu niezgodności wymienionych poniżej.
	</p>
</section>
```

Note the two ids are different and both are needed: `aria-labelledby` points at the heading for the accessibility tree, `id="a11y-status"` is what the government monitoring crawler reads. Neither substitutes for the other.

### The two-syntax launch-gate scan

```ts
// scripts/gate-launch.ts (run with plain `node scripts/gate-launch.ts`, Node 22.23.2 strips types)
// BOTH comment syntaxes. The `//` form alone misses thirteen real markers in .svelte markup.
const ZNACZNIK = /(?:\/\/|<!--)\s*PLACEHOLDER:/;

// Every line that merely EXPLAINS the convention has been reworded to a synonym
// (D-19, 04-02 precedent), so this pattern needs no exclusion list and therefore
// has no place to hide a silent false negative.
```

### The shared placeholder walker, one declaration

```ts
// src/lib/zastepcze.ts  -- carries node:fs. NEVER import from an /admin route.
export function plikiTresci(katalog?: string, prefiks?: string): string[] { /* moved verbatim */ }
export function znaczniki(wartosc: unknown, gdzie: string, zebrane?: Znacznik[]): Znacznik[] { /* moved verbatim */ }
```

```ts
// tests/zastepcze.unit.ts  -- imports instead of declaring
import { plikiTresci, znaczniki } from '../src/lib/zastepcze.ts';
```

### The corrected focus-cycle entry (D-23), ported from `Lightbox.svelte:151-160`

```ts
// An index of -1 means focus is not a member of the cycle (it rests on the
// container, which carries tabindex="-1"). It then enters the cycle at the end
// the key is heading for. The naive two-wrap-point form leaks Shift+Tab to the
// page beneath the modal, which is a WCAG 2.1 AA keyboard trap on every page.
const pozycja = active instanceof HTMLElement ? focusables.indexOf(active) : -1;
if (pozycja === -1) {
	event.preventDefault();
	(event.shiftKey ? last : first).focus();
	return;
}
```

### The high-contrast property assertion (stronger than axe)

```ts
// tests/kontrast.spec.ts
// Catches the "white-on-white footer" the UI-SPEC warns Layer 1 alone produces.
// The allowlist is the D-10 image plates, and it is EXPLICIT so a new one is a
// deliberate edit rather than a silent pass.
const DOZWOLONE_BIALE_PLYTY = ['.brand-mark img', '.brand-lockup', '.logo-slot', '.plyta'];

await page.goto(trasa);
await page.evaluate(() => document.documentElement.dataset.kontrast = 'wysoki');
const bledy = await page.evaluate((dozwolone) => {
	const zle: string[] = [];
	for (const el of document.querySelectorAll<HTMLElement>('body *')) {
		const tlo = getComputedStyle(el).backgroundColor;
		if (tlo !== 'rgb(255, 255, 255)') continue;
		if (dozwolone.some((sel) => el.matches(sel) || el.closest(sel))) continue;
		zle.push(el.tagName + '.' + el.className);
	}
	return zle;
}, DOZWOLONE_BIALE_PLYTY);
expect(bledy).toEqual([]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Deklaracja dostępności as prose from Warunki techniczne **v1.0** | **v2.0** with a changed assessment method, changed identifier usage and new identifiers | published **31 July 2024**; binding for new declarations from **1 Aug 2024**; retrofit deadline **31 Mar 2025** | **This site's declaration must be v2.0 from the first byte.** There is no transitional option in Aug 2026 |
| `Dostępność architektoniczna` as the only building section | `Dostępność architektoniczna` **plus** `Dostępność komunikacyjno-informacyjna` | v2.0 | A mandatory section the UI-SPEC's ten-section list omits |
| Tailwind config file with a JS theme object | Tailwind v4 CSS-first `@theme`, `@theme inline` for variable references, `@theme static` to defeat usage-based emission | Tailwind v4.0 | Decides where the fourteen `calc()` type tokens live. `[CITED: tailwindcss.com/docs/theme]` |
| Accessibility overlays as the cheap compliance answer | In-house, native-control widgets; overlays are widely regarded as a liability rather than a remedy | ongoing | Reinforces D-01 independently of the Polish-chrome argument |
| Single Lighthouse run as a score | Median of five runs, median selected by a primary metric | long-standing Google guidance | Decides the D-25 run budget. `[CITED: GoogleChrome/lighthouse/docs/variability.md]` |
| DevTools applied throttling | Simulated (Lantern) throttling as the lower-variance default | Lighthouse default mobile config | The recommended cross-check instrument |

**Deprecated / outdated in this repository's own documents:**

- `05-UI-SPEC.md` says `TRASY` "holds fourteen routes". It holds seventeen. Four other documents say eighteen. All are wrong.
- `06-UI-SPEC.md` lists `/polityka-prywatnosci` as "currently uncovered" by axe. It is covered (`tests/polityka-prywatnosci.spec.ts`). `/deklaracja-dostepnosci` genuinely has zero coverage.
- `06-CONTEXT.md` D-09's eight `#ffffff` sites and three shadow sites: the real counts are seventeen and nine, as `06-UI-SPEC.md` §Findings already records. **A plan built from D-09's list alone ships a broken mode.**

---

## Runtime State Inventory

This phase contains a rename-shaped element (the reword sweep over the PLACEHOLDER convention headers) and a mechanical substitution over 167 declarations, so the inventory is answered explicitly rather than skipped.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | **None in a datastore.** The only persisted state this phase introduces is `sessionStorage` in the visitor's own browser, which is by definition not migrated and not readable by us. FORMS_KV holds rate-limit counters only (`rl:*`, `adm:kod:*`), none of which names anything this phase renames | none |
| **Live service config** | **None.** No n8n, no Datadog, no Tailscale. Cloudflare Pages bindings live in `wrangler.jsonc` (in git); the five panel secrets are set by `wrangler pages secret put` and none of their NAMES changes here. The Turnstile widget config is unaffected | none |
| **OS-registered state** | **None.** No Task Scheduler, no pm2, no launchd, no cron. Deploys are Pages git integration | none |
| **Secrets / env vars** | **None renamed.** `ADMIN_EMAILS`, `ADMIN_SESSION_SECRET`, `GITHUB_APP_*`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SALT` are all untouched. **Do not create a root `.dev.vars`** | none |
| **Build artifacts** | `.svelte-kit/output/` holds a build from 2026-08-18 02:21 that predates this phase. The `og-placeholder.png` share card is a committed artefact carrying old branding (Phase 7). The three stub documents under `static/dokumenty/` are committed artefacts (Phase 7) | Rebuild before any gate cross-check that reads `.svelte-kit/output/prerendered/`. The stale build is why the gate's build-output checks must be a **cross-check**, never the primary assertion |

**Nothing found in three of five categories, verified by the greps and file reads listed in §Codebase Facts.** The reword sweep is a pure source-text change with no runtime counterpart, which is exactly why D-19 can order it without a data migration.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests, the gate script | yes | 25.9.0 local, **22.23.2 pinned** in `.tool-versions` and on Pages | none needed |
| Google Chrome | chrome-devtools MCP, Playwright | yes | `/Applications/Google Chrome.app` | none needed |
| Playwright + chromium | `npm run test` | yes | `@playwright/test` 1.62.1 | none needed |
| `@axe-core/playwright` | the Tier 1 audit | yes | 4.13.0 | none needed |
| `wrangler` | `preview:test`, `types --check` | yes | 4.97.0 | none needed |
| **`chrome-devtools` MCP server** | **D-25, via the `web-perf` skill** | **NO** | not configured | **`npx lighthouse` CLI**, five runs, median. Also not installed, but requires no MCP configuration |
| `lighthouse` CLI | the recommended cross-check | no | not installed | run via `npx lighthouse@latest` without installing |
| `gh` CLI | the D-22 repo-visibility gate item | unverified this session | - | print the item as `RĘCZNIE` and count it unresolved |
| Deklaracja walidator (web) | the held-out A11Y-03 structural check | yes (public web service) | v2 | manual reading of the Warunki techniczne against the rendered page |
| Live deployment | D-25, D-24, D-28 B4 | yes | `zlobek-gminny-stromiec.pages.dev` + `zlobekstromiec.pl` | none; these are inherently live checks |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:**

- **`chrome-devtools` MCP server.** This is the one item that blocks a phase deliverable as specified. D-25 names the `web-perf` skill over this server explicitly, and the skill's first instruction is to stop when the server is missing. **Add it before the phase starts**, pinned to `chrome-devtools-mcp@1.7.0` rather than `@latest` (see §Package Legitimacy Audit). If the user declines, the `npx lighthouse` fallback satisfies D-25's substance (throttled mobile, live deployment, three routes, before/after in the SUMMARY, no enforced budget) while deviating from its named instrument, and that deviation must be recorded in the SUMMARY rather than glossed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Frameworks | **Two tiers.** `node --test` (built in, no dependency) over `tests/*.unit.ts`; Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 over `tests/*.spec.ts` |
| Config files | `playwright.config.ts` (chromium only, `baseURL http://localhost:4173`, `webServer: npm run build && npm run preview:test`). **No config file for `node --test`**; the `.unit.ts` suffix deliberately sits outside Playwright's matcher |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm run check && npm run lint && npm run test:unit && npm run test` |
| Launch-gate command (new, deliberately RED) | `npm run gate:launch` |

**Structural constraint that shapes every test task:** the pre-commit hook runs `svelte-check` over the **whole working tree**, so a test importing a not-yet-written module is a type error and the hook refuses even an unrelated commit. **A TDD RED commit is impossible in this repository.** Observe and RECORD red in the SUMMARY, then land the test and its implementation in one commit. Do not reach for `--no-verify`.

### Phase Requirements to Test Map

| Req | Behavior | Test type | Automated command | File exists? |
|-----|----------|-----------|-------------------|--------------|
| A11Y-01 | Every public route is axe-clean, default theme | integration | `npx playwright test tests/home.spec.ts tests/o-nas.spec.ts ...` | yes (20 spec files use `AxeBuilder`) |
| A11Y-01 | Every public route is axe-clean **with `data-kontrast="wysoki"`** | integration | `npx playwright test tests/kontrast.spec.ts` | **No, Wave 0** |
| A11Y-01 | Every public route is axe-clean **at `data-skala="130"`** | integration | `npx playwright test tests/skala-tekstu.spec.ts` | **No, Wave 0** |
| A11Y-01 | No public route overflows horizontally at 130% at 320/360/375px | integration (property) | extend `tests/responsive.spec.ts` `ROUTES` with the scale condition | partial, needs the condition |
| A11Y-01 | `+error.svelte` (404) is axe-clean | integration | new case in an existing spec | **No, Wave 0** |
| A11Y-01 | The `MobileNav` drawer is axe-clean in its OPEN state | integration | new case in `tests/nav.spec.ts` | **No, Wave 0** |
| A11Y-01 | The success state of both forms is axe-clean | integration | new cases in `tests/kontakt.spec.ts`, `tests/rekrutacja.spec.ts` | **No, Wave 0** |
| A11Y-01 (D-23) | Tab from the last drawer item wraps to the first; **Shift+Tab from the container does not leak** | integration | new cases in `tests/nav.spec.ts` | **No, Wave 0.** `nav.spec.ts` proves role, first focus, Escape and restore but **never presses Tab** |
| A11Y-02 | Widget is axe-clean CLOSED and OPEN, both themes, on at least two routes | integration | `npx playwright test tests/ulatwienia.spec.ts` | **No, Wave 0** |
| A11Y-02 | Escape closes and returns focus to the trigger; scrim-dismiss also restores focus | integration | same file | **No, Wave 0** |
| A11Y-02 | Changing size or contrast never moves focus | integration | same file | **No, Wave 0** |
| A11Y-02 | The reserved widget wrapper is present and sized in **prerendered** HTML (zero CLS) | integration | assert on the served HTML before hydration | **No, Wave 0** |
| A11Y-02 | With no attribute set, computed styles are unchanged from the pre-phase baseline | integration (held-out baseline) | `npx playwright test --update-snapshots` **before** any CSS lands, then compare | **No, Wave 0, and it must run FIRST** |
| A11Y-03 | Every mandatory section is present **by name AND by `id="a11y-*"`** | integration | `npx playwright test tests/deklaracja-dostepnosci.spec.ts` | **No. The route has ZERO coverage today** |
| A11Y-03 | The store validator refuses an absent field and never defaults it | unit | `node --test tests/admin-walidacja-deklaracja.unit.ts` | **No, Wave 0** |
| A11Y-03 | `dataPrzegladu` earlier than `dataSporzadzenia` is refused; status/list cross-field rules hold | unit | same file | **No, Wave 0** |
| LEGAL-01 | BIP link present on **every** public route with the exact label and href | integration | extend `tests/nav.spec.ts` (currently proves it once) | partial |
| LEGAL-01 | `/rekrutacja` carries its own BIP link | integration | `tests/rekrutacja.spec.ts` | verify |
| LEGAL-02 | The twelve `KLAUZULA` blocks render on the page as `h3` in order | integration | `tests/polityka-prywatnosci.spec.ts` (exists, needs extending) | partial |
| LEGAL-02 | 04 D-03 holds: the klauzula is STILL inline under both forms | integration | existing form specs, assert not-moved | verify |
| LEGAL-02 | The polityka validator refuses an empty required prose field | unit | `node --test tests/admin-walidacja-polityka.unit.ts` | **No, Wave 0** |
| SITE-05 | No timing assertion, by decision (D-25) | **n/a** | - | intentionally none |
| SITE-05 | Zero CLS from the widget: the wrapper is sized in static HTML | integration | see A11Y-02 above | Wave 0 |
| D-19/D-20 | The gate finds both comment syntaxes, finds a nested `placeholder` boolean, and exits zero on a clean fixture tree | unit | `node --test tests/gate-launch.unit.ts` | **No, Wave 0** |
| CMS-03 | Both new panel screens are Polish end to end | integration | `tests/admin-polski.spec.ts` via `TRASY` 17 to 19 | exists, needs the two entries |
| CMS-03 | No panel route is missing from `TRASY` | integration | `tests/admin-enumeracja.spec.ts` | exists |
| Copy rules | The EU klauzula's en dash does not fail the sweep | unit | `tests/forms-copy.unit.ts` + the byte-exempt list | exists, needs the exemption |

### Sampling Rate

- **Per task commit:** `npm run test:unit` (and `npm run check && npm run lint`, which the hook enforces anyway).
- **Per wave merge:** the full four-command chain.
- **Phase gate:** the full chain green, **plus** `npm run gate:launch` executed and its RED output pasted into the SUMMARY with the expected item list, so "red on purpose" is evidenced rather than claimed.

### Not Inferable From Unit Tests

These are the properties this phase's correctness actually rests on, that no unit test can establish. Each needs a held-out, property-based or human check.

1. **Contrast in the high-contrast theme as actually rendered, rather than as computed from hex values in a spec.** The UI-SPEC's ratios are arithmetically correct and were independently reproduced by the checker, but arithmetic on a token pair says nothing about which pair actually meets on screen after seventeen literal overrides and nine shadow-to-border swaps. Two complementary checks: the **property sweep** in §Code Examples (no unexpected `rgb(255,255,255)` background anywhere in the tree) and the **`results.incomplete`** assertion on `color-contrast` in the HC axe pass. Neither is a unit test and both are automatable. On top of them, a **human screenshot review** of all nine public routes in the mode, because "legible" and "passes 4.5:1" are not the same claim.

2. **Screen-reader announcement quality.** D-27 Tier 3. One recorded session (NVDA on Windows, or VoiceOver on macOS/iOS) covering: the widget trigger's name and expanded state; the segmented control announcing "A+, tekst większy, 115 procent" rather than "A plus"; the reset button's `role="status"` line firing; the deklaracja's heading navigation reading as eleven meaningful sections. No automation substitutes for it. Record as a UAT row.

3. **The perceived size of the flash.** The millisecond number is measurable (§Open Question 2) and should be recorded, but whether a one-frame repaint from white to black **feels** like a defect to somebody who needs high contrast is a human judgement made once, on a phone, on mobile data, on the live deployment. This is the only evidence that can retire D-12's accepted cost, and it belongs in the UAT sheet, not in a test.

4. **Core Web Vitals on real mobile hardware.** Emulation is a model. One session on an actual mid-range Android phone over mobile data, on all three D-25 routes, is the only check that can contradict the emulated numbers. If it does, the emulated numbers are the ones that were wrong.

5. **Whether a Polish speaker finds the Deklaracja comprehensible.** The declaration is written for a citizen with a disability who needs to know how to complain. Its statutory phrasing is prescribed, but the sections this phase authors (architektura, komunikacja, dodatkowe) are ours. One reading by a Polish-speaking non-developer, recorded as a UAT row, in the same shape as CMS-03's human half. `tests/admin-polski.spec.ts` proves the panel contains no English; it cannot prove the deklaracja reads as Polish to a person.

6. **The independent structural validator.** Run the published `/deklaracja-dostepnosci` through `https://deklaracja-dostepnosci.info/walidator` after the first deploy of the page. This is a **held-out oracle**: it was not used to build the page and it encodes the Warunki techniczne v2.0 independently of this research. Its verdict is the strongest single evidence available for A11Y-03's structural half. Expected outcome in Phase 6: it flags the koordynator fields as empty (correct, they are PLACEHOLDER) and passes everything else. **Any other failure is a real defect.**

7. **The "default theme cannot regress" claim.** The UI-SPEC states this is "a property of the mechanism, not of the executor's care" and it is right about the CSS gating. It is **not** right about the human editing seventeen component stylesheets. The held-out check is a **visual baseline captured before any Phase 6 CSS lands** and compared after. This must be the phase's first test task or the evidence does not exist.

8. **Tap-target measurement.** D-27 Tier 2. Contract 6 closes the one known 36px breach in `TopBar`. Whether there is a **second** breach is a measurement, not an assertion: axe does not enforce a 44px minimum (WCAG 2.1 AA has none), so the project's own stricter contract is unenforced by every automated gate in the repository. One pass with the DevTools element inspector across every route and control.

9. **Turnstile's own accessibility.** axe cannot see into a cross-origin iframe and a real managed widget cannot be driven by an automated browser (04-07). Contrast and keyboard reachability of the widget itself are irreducibly manual, and the declaration already names Turnstile as a non-conformance for exactly this reason.

10. **D-24 (FORM-02 parts B and C) and D-28 (UAT row B4).** Both are human sessions with no code component. Part B needs one submission at or after the top of the next clock hour; part C needs one on a new UTC date; B4 needs a second editor in a second browser tab. Zero deploys, listed in the UAT sheet.

### Wave 0 Gaps

- [ ] **Default-theme visual baseline for all nine public routes**, captured before any CSS change. Blocks item 7 above and cannot be recreated later.
- [ ] **SITE-05 "before" measurement** on the three D-25 routes against the current live deployment. Same irrecoverability.
- [ ] `chrome-devtools` MCP server configured (pinned), or the documented `npx lighthouse` fallback adopted and recorded.
- [ ] **D-21 landed first:** `wrangler types --check && npm run test:unit && vite build`. Everything below writes unit suites into a tier that otherwise runs nowhere.
- [ ] `src/lib/zastepcze.ts` extracted, `tests/zastepcze.unit.ts` rewired to import it (one walker, two consumers).
- [ ] `tests/deklaracja-dostepnosci.spec.ts` created. The route has **zero** coverage today.
- [ ] `tests/kontrast.spec.ts` (HC axe sweep, the `incomplete` assertion, and the no-unexpected-white property).
- [ ] `tests/skala-tekstu.spec.ts` **or** the 130% condition folded into `tests/responsive.spec.ts` `ROUTES`.
- [ ] `tests/ulatwienia.spec.ts` (widget, both states, both themes, focus contract, prerendered-wrapper assertion).
- [ ] `tests/gate-launch.unit.ts` with fixture trees for both comment syntaxes and a nested boolean.
- [ ] `tests/admin-walidacja-deklaracja.unit.ts` and `tests/admin-walidacja-polityka.unit.ts`.
- [ ] Tab and Shift+Tab cases added to `tests/nav.spec.ts` (D-23's accepting test does not exist).
- [ ] `tests/fixtures/trasy-panelu.ts` `TRASY` 17 to 19, landing in the same commit as the two routes.
- [ ] The EU klauzula's en dash added to the byte-exempt list `tests/forms-copy.unit.ts` and its siblings use.
- [ ] Framework install: **none.** Both tiers are already present and configured.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`, `security_block_on: high`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control |
|---------------|---------|------------------|
| V1 Architecture | yes | The public tier is prerendered static assets with no server. The panel is the Worker. `src/lib/zastepcze.ts` carries `node:fs` and must never cross into either the client bundle or an `/admin` route |
| V2 Authentication | no change | Both new panel screens sit behind the existing `src/hooks.server.ts` gate, which re-checks `ADMIN_EMAILS` on **every** request. Neither screen adds an auth path |
| V3 Session Management | no change | The stateless `__Host-panel_sesja` HMAC cookie is untouched. The visitor-side `sessionStorage` is **not** a session: it holds two enumerated string values, no identifier, and never leaves the browser |
| V4 Access Control | yes | Neither new screen may be reachable without a session. Both must appear in `TRASY` so the Polish sweep and the enumeration walk cover them |
| V5 Input Validation | **yes, the primary category** | Two new closed-allowlist validators. Every field is untrusted even though the sender is authenticated: it travels into a JSON file, into a commit on a public repository, through a build-time reader, onto a page a citizen reads to learn how to file an accessibility complaint |
| V5 Output Encoding | **yes** | Legal-page narrative fields render through `renderPost`, which escapes raw HTML, collapses images to alt text, allow-lists hrefs (`SAFE_HREF`), neutralises headings and drops tables. This is the same stored-XSS boundary as the news body (T-03-01) and it must be reused, not reimplemented |
| V6 Cryptography | no change | Nothing new. Never hand-roll |
| V7 Error Handling and Logging | yes | **Neither new validator logs a field value**, matching `walidacja/pola.ts`'s standing rule and the RODO position. A `sessionStorage` failure in the widget is swallowed silently by design (Copywriting Contract: no error state) |
| V12 Files and Resources | yes | Neither new screen accepts a file upload. Do not import `src/lib/server/dokumenty.ts` or anything carrying `node:fs` from either route |
| V14 Configuration | **yes** | The CSP is not widened (D-12). `script-src` still names exactly `self` and `https://challenges.cloudflare.com`. Zero new npm packages, zero CDNs, zero third-party embeds |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation |
|---------|--------|---------------------|
| Stored XSS via an editor-authored legal-page field rendered on a public route | Tampering / Elevation | `renderPost` (raw HTML escaped, images to alt, `SAFE_HREF` allow-list, headings neutralised, tables dropped) **plus** `script-src 'self'` as the second layer. Reuse, never reimplement |
| An editor deleting or renaming a statutory section, making the declaration non-conformant | Tampering (integrity of a legal artefact) | The section list is **code**; no control exists to add, remove, rename or reorder one. Plus a test asserting every section by name and by `id="a11y-*"` |
| An unlisted panel route shipping with zero Polish and zero a11y coverage | Information disclosure of English chrome / repudiation of CMS-03 | `TRASY` 17 to 19 in the same commit; `tests/admin-enumeracja.spec.ts` walks the routes on disk and turns the silent gap red |
| The launch gate going green with real placeholders still in the tree | Repudiation (a false compliance claim) | The two-syntax scan, the shared walker, and `tests/gate-launch.unit.ts` proving the gate itself |
| A third-party accessibility overlay injecting scripts | Tampering / Elevation | Refused outright (D-01). The CSP would block it anyway, which is a property worth stating |
| Absent `a11y-*` identifiers making a compliant-looking page technically non-conformant | Repudiation (regulatory) | Identifiers are part of the locked structure and are asserted by test; the independent validator is the held-out oracle |
| `renderPost` output reaching the DOM through `{@html}` | Tampering | Every existing use carries an `eslint-disable-next-line svelte/no-at-html-tags` with a **reason** naming the sanitiser and the CSP second layer. Both new pages must follow the same form; a bare disable is a review finding |
| Editor-supplied prose logged during validation | Information disclosure (RODO) | Nothing in `walidacja/` logs. Neither new validator may be the first |

**Nothing in this phase reaches the `security_block_on: high` threshold on current evidence.** The one genuinely new trust boundary is the two editor-writable stores rendering on public pages, and it is closed by reusing a renderer already hardened for exactly that boundary.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | The `a11y-*` identifier list and their obowiązkowy/opcjonalny split are as tabulated | Open Q3 | **Highest-consequence assumption in this document.** Two independent secondary sources agree, but the primary BIP host refused the connection. A wrong or incomplete list means a technically non-conformant declaration and a separately fineable defect. **The plan must re-fetch the primary PDF and reconcile before the deklaracja task starts.** The free validator is the cheap second check |
| A2 | `Dostępność komunikacyjno-informacyjna` is obowiązkowa in v2.0 | Open Q3 | If it is optional, the phase ships one extra section, which is harmless. If it is mandatory and omitted, the declaration is non-conformant. Asymmetric, so include it |
| A3 | The annual review deadline is conventionally 31 March | Open Q3 | Affects only the staff-manual wording and the panel hint, not the code. Confirm from the primary source in the same fetch as A1 |
| A4 | axe's `color-contrast` returns `incomplete` rather than `violations` for indeterminate backgrounds | Pitfall 1 | If it actually returns a violation, the extra assertion is redundant and harmless. Verify against real `@axe-core/playwright` 4.13 output during Wave 0 |
| A5 | The chrome-devtools MCP throttling tool is named `emulate` in 1.7.0 (older releases used `emulate_cpu` / `emulate_network`) | Open Q4 | A hard-coded name fails at run time. Mitigated by enumerating the available tools at run time |
| A6 | Expected LCP spread with applied throttling is roughly ±10 to 25% across five runs | Open Q4 | Only calibrates expectations. The five-run median is the actual mitigation and comes from Google's own documentation |
| A7 | `sessionStorage` is copied into a tab opened via a `target="_blank"` link in Chrome and Firefox | Open Q2 | Affects one optional sentence of nuance in the RODO disclosure, nothing structural |
| A8 | Extracting the walker into `src/lib/zastepcze.ts` and running `node scripts/gate-launch.ts` works unflagged on Node 22.23.2 | Open Q6 | Type stripping is already relied on by `npm run test:unit` on the same runtime, so the risk is low. Verify with one command in Wave 0 |
| A9 | `renderPost`'s GFM block output (`hr`, `blockquote`, `code`, `ol`) is acceptable on a legal page once styled | Open Q5 | If a reviewer rules it is not, the fallback is a fourth renderer, which is a known and bounded cost |
| A10 | Module top-level code in the root layout's import graph runs before the Svelte effect flush | Open Q2 | Verified structurally from the prerendered bootstrap, but not measured. If wrong, the restore lands no later than today's `$effect` does, so the downside is zero |
| A11 | The `gh` CLI is available for the D-22 repo-visibility check | Open Q6 | Falls back to a printed `RĘCZNIE` item, which is the honest design anyway |

---

## Open Questions Remaining

1. **The primary Warunki techniczne v2.0 PDF was not retrievable this session** (`mc.bip.gov.pl` refused the connection, `ECONNREFUSED 185.41.93.214:443`).
   - What we know: the identifier list, the v2.0 timeline, the mandatory/optional split and the field order, from three independent secondary sources that agree with each other.
   - What is unclear: exact required sentence templates for the wstęp and the ocena, and whether `a11y-ocena` moved from optional to mandatory in v2.0 (one source says mandatory, an older one says optional).
   - Recommendation: **one plan task, before the deklaracja is written**, to fetch the primary PDF (`pulawy.policja.gov.pl` mirrors it, as do many gmina BIPs) and reconcile the table in §Open Question 3. Then run the free validator against the deployed page as the closing check.

2. **Does the ROADMAP Phase 6 SC2 count change from four content classes to five?**
   - The added `Dostępność komunikacyjno-informacyjna` section is a fifth PLACEHOLDER class, unless it absorbs the UI-SPEC's `Dodatkowe informacje` sign-language sentence, in which case it stays four.
   - Recommendation: absorb it. The sign-language sentence belongs in the komunikacyjno-informacyjna section by the standard's own taxonomy, so `Dodatkowe informacje` becomes genuinely optional and can ship empty or be dropped. Correct SC2 with one line either way; the phase's scope does not change.

3. **Is D-19's strict form a decision or a description?**
   - The two-syntax correction in §Open Question 6 is a factual necessity, not a preference, but it does read against D-19's literal wording.
   - Recommendation: treat it as a D-19 **clarification** recorded in the plan, not a new decision requiring the user. If the planner disagrees, this is the one item worth a checkpoint, because getting it wrong is invisible until Phase 7.

4. **Where does the phase's "before" performance baseline live if the first code change is D-21?**
   - D-21 edits the Pages build command, which triggers a rebuild and a new deployment. Strictly, the baseline must precede it.
   - Recommendation: measure the baseline against the currently-live deployment as **task one of plan one**, before any commit at all. It is a measurement, not a code change, so it does not need its own plan.

---

## Sources

### Primary (HIGH confidence)

- **This repository**, read and measured directly this session: `src/app.css`, `src/routes/+layout.svelte`, `src/lib/components/TopBar.svelte`, `src/lib/markdown.ts`, `src/lib/content/forms.ts`, `src/lib/content/o-nas.json`, `src/lib/content/cennik.json`, `src/lib/server/admin/walidacja/{cennik,pola}.ts`, `src/lib/components/Seo.svelte`, `src/lib/components/Footer.svelte`, `src/routes/deklaracja-dostepnosci/+page.svelte`, `svelte.config.js`, `playwright.config.ts`, `package.json`, `.tool-versions`, `.pre-commit-config.yaml`, `static/robots.txt`, `static/sitemap.xml`, `tests/zastepcze.unit.ts`, `tests/polityka-prywatnosci.spec.ts`, `tests/fixtures/trasy-panelu.ts`, `tests/responsive.spec.ts`, `docs/dev-env.md`, `.svelte-kit/output/prerendered/pages/index.html`, `.svelte-kit/output/client/**`.
- **Context7 / `tailwindlabs/tailwindcss.com`** - `@theme inline` for variable references; `@theme static` and the default usage-based variable emission.
- **Context7 / `sveltejs/kit`** - component reuse across client-side navigation and the `{#key}` remount escape hatch; page options and prerendering.
- **`~/.claude/skills/web-perf/SKILL.md`** - the workflow, the MCP prerequisite and the threshold table.
- **`gsd-tools query package-legitimacy check`** - the `chrome-devtools-mcp` signal set.
- **npm registry** (`npm view chrome-devtools-mcp version time.modified`).
- **`.planning/` artefacts**: `06-CONTEXT.md`, `06-UI-SPEC.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `research/PITFALLS.md`, `02-CONTEXT.md`.

### Secondary (MEDIUM confidence)

- `gov.pl/web/dostepnosc-cyfrowa/zmienione-warunki-techniczne-publikacji-oraz-struktury-dokumentu-elektronicznego-deklaracji-dostepnosci--wersja-20` - the v2.0 publication date, the 1 Aug 2024 applicability and the 31 Mar 2025 retrofit deadline.
- `mc.bip.gov.pl/objasnienia-prawne/warunki-techniczne-publikacji-oraz-struktura-dokumentu-elektronicznego-deklaracji-dostepnosci.html` - the primary document's location. **Fetch refused this session; must be re-fetched.**
- `dostepnastrona.pl/artykuly/deklaracja-dostepnosci-warunki-techniczne` - the identifier table with element and status.
- `deklaracja-dostepnosci.info/walidator` - the identifier set the validator enforces, and the required heading list.
- `zapisariusz.pl/blog/deklaracja-dostepnosci-2-0-krok-po-kroku.html` - an independent v2.0 identifier table that agrees with the two above.
- `standardwcag.pl/generator-deklaracji/` - an operating v2.0 generator's field list in order, with obowiązkowe/opcjonalne markers.
- `github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md` - median of five runs, `computeMedianRun`, simulated versus applied throttling.
- `github.com/ChromeDevTools/chrome-devtools-mcp` - the tool inventory including `emulate`, `resize_page`, `performance_start_trace`, `performance_analyze_insight` and `lighthouse_audit`.

### Tertiary (LOW confidence)

- General search summaries on Polish declaration generators (`nautil.pl`, `utilitia.pl`, `lepszyweb.pl`, `widzialni.org`). Used only to corroborate that the identifier requirement is universally understood among Polish accessibility practitioners; no specific claim rests on them alone.

---

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH. Zero new packages; every version read from `package.json` and `.tool-versions` this session.
- **Architecture (the two CSS mechanisms, the panel stores, the gate):** HIGH. Every design decision is grounded in a verified codebase fact or a Context7-retrieved framework behaviour.
- **The `sessionStorage` / flash analysis:** HIGH on the ordering (read out of the actual prerendered bootstrap), MEDIUM on the magnitude (not yet measured; the recipe is given).
- **The statutory field and identifier list:** MEDIUM. Three independent secondary sources agree; the primary was unreachable. **The single item most worth re-verifying before implementation.**
- **Performance methodology:** MEDIUM. The run-count guidance is Google's own; the variance ranges are calibration, not measurement, and the instrument is not yet configured.
- **Pitfalls:** HIGH for the six grounded in repository greps; MEDIUM for the axe `incomplete` behaviour (A4).

**Research date:** 2026-08-18
**Valid until:** 2026-09-17 for the framework and tooling findings (30 days, stable). **The Warunki techniczne finding does not expire on a clock but on a version:** re-check for a v2.1 before any future declaration work.
