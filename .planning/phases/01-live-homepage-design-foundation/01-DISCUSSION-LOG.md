# Phase 1: Live Homepage & Design Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-12
**Phase:** 1-live-homepage-design-foundation
**Areas discussed:** Hero core-message layout, Deployment & live URL, Scaffold & quality gates, Metadata & share-preview

> Note: the entire visual design system (`01-UI-SPEC.md`, approved) and stack (`STACK.md`) were already locked upstream, so this discussion deliberately skipped all design/color/layout/typography questions and focused only on genuinely-open items.

---

## Hero core-message layout

| Option | Description | Selected |
|--------|-------------|----------|
| Hook headline + verbatim lead | Short punchy Baloo-2 h1 hook + full verbatim 4-sentence message beneath as a styled lead quote. Scannable, LCP-friendly, satisfies HOME-01. | ✓ |
| Verbatim message as the h1 | The whole 4-sentence message is the display headline. Maximally faithful but a text wall; weaker punch, harder to scan, larger LCP. | |
| Decorated pull-quote centerpiece | Message as one large decorated pull-quote (no separate headline). Distinctive but no short hook line. | |

**User's choice:** Hook headline + verbatim lead
**Notes:** Verbatim message treated as final client copy; the short hook headline is a marked PLACEHOLDER for launch confirmation.

| Option | Description | Selected |
|--------|-------------|----------|
| Illustrated/decorative composition | Blobs + simple warm illustration, no real faces. Consent-safe, tiny payload, nothing to swap. | |
| Stock/AI warm photo | Cheerful stock/AI image now; looks real sooner but must swap in Phase 6, child faces raise consent flags. | ✓ |
| Empty warm-tinted slot | Just the SPEC's warm-tinted placeholder block, no art. Simplest, least joyful. | |

**User's choice:** Stock/AI warm photo
**Notes:** Constrained to non-identifiable imagery (no real child faces) to stay consent-safe (PITFALLS #13); swapped for consented real photography in Phase 6.

---

## Deployment & live URL

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages (git integration) | Repo connected to Pages; push to main → auto build+deploy, no CI to maintain. Research default. | ✓ (implied) |
| Workers Static Assets | Same adapter via Wrangler/CI; unlocks advanced bindings but more setup for auto-deploy. | |
| You decide | Default to Pages git-integration. | |

**User's choice:** Cloudflare Pages — inferred from the `*.pages.dev` URL choice (the user paused the deploy question to raise account architecture instead).
**Notes:** User paused to establish a bigger decision: dedicated NEW project accounts (Gmail + GitHub + Cloudflare) so the project can be handed off cleanly later.

| Option | Description | Selected |
|--------|-------------|----------|
| *.pages.dev until launch | Ship Phase 1 on free *.pages.dev; attach custom domain at Phase 6. Keeps placeholder off the real domain + out of Google. | ✓ |
| Attach real domain now (noindex) | Point domain at Phase 1 with noindex until launch. | |
| Attach real domain now (indexed) | Real domain live + indexable. Not recommended. | |

**User's choice:** *.pages.dev until launch

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Organization | Project Org owned by new Gmail; owner-transfer + member management for handoff. | ✓ |
| Personal GitHub account | Single new personal account owns repo; messier handoff. | |
| You decide | Default to Org. | |

**User's choice:** GitHub Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Move zone to new CF account | Co-locate DNS + Pages + Turnstile + Resend under one account. | |
| Keep zone on current account | Split ownership across accounts. | |
| You decide | Default to move. | |

**User's choice:** N/A — **correction:** the domain `zlobekstromiec.pl` is **not yet purchased** (no zone exists). Phase 1 uses `*.pages.dev`; buy the domain before Phase 4/6 and register it directly in the project Cloudflare account.
**Notes:** This supersedes the roadmap/state claim that the domain is already owned with "no lead time" — flagged for a doc update.

---

## Scaffold & quality gates  *(defaulted — user stepped away mid-question)*

| Option | Description | Selected |
|--------|-------------|----------|
| asdf .tool-versions | Pin Node/tooling versions per project. | ✓ (default) |
| pre-commit hooks | lint/format/svelte-check before commits. | ✓ (default) |
| docs/dev-env.md | Machine-contract onboarding doc for the inheriting maintainer. | ✓ (default) |
| direnv .envrc | Per-project env vars; seeded now, real secrets in Phase 4. | ✓ (default, pattern only) |

**User's choice:** Not answered — defaulted to the user's established global conventions (all four).

| Option | Description | Selected |
|--------|-------------|----------|
| Core a11y gate now | svelte-check + ESLint(a11y) + one Playwright+axe homepage smoke; Lighthouse CI deferred. | ✓ (default) |
| Full gate now | + Lighthouse CI perf/a11y budget from day one. | |
| Lean now, expand in Phase 6 | svelte-check + ESLint only; runtime a11y/perf in Phase 6. | |

**User's choice:** Not answered — defaulted to Core a11y gate now (legal WCAG obligation + design-foundation phase; balances safety vs Phase 1 velocity).

---

## Metadata & share-preview  *(defaulted — not reached before user stepped away)*

| Option | Description | Selected |
|--------|-------------|----------|
| Foundation metadata now (lean-moderate) | lang=pl + reusable head/SEO component + favicon + OG/Twitter card w/ branded placeholder image + robots/sitemap (noindex on *.pages.dev). | ✓ (default) |
| Defer all to Phase 6 | No metadata scaffold in Phase 1. | |

**User's choice:** Not answered — defaulted per PITFALLS #11 ("metadata scaffolding should be set in the foundation phase"). JSON-LD structured data + Search Console/Business Profile deferred to Phase 6 (need real NAP + domain).

---

## Claude's Discretion

- Scaffold file/route layout and SvelteKit conventions (Astro→SvelteKit translation).
- Exact PLACEHOLDER copy (hook headline, subcopy, quick-contact values).

## Deferred Ideas

- Buy `zlobekstromiec.pl` (not yet owned) — prerequisite for Phase 4/6; register in project CF account; roadmap/state doc update recommended.
- Lighthouse CI → Phase 6.
- JSON-LD structured data + Search Console/Business Profile → Phase 6.
- Real photography (with consent) + real hero/contact copy → Phase 6 (LAUNCH-01).
