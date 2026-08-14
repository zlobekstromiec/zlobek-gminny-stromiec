# CLAUDE.md — Publiczny Żłobek w Stromcu (public website)

High-signal project instructions. Deep detail lives in `.planning/` — this file summarizes and points; follow the links for specifics. Global dev-env/tooling conventions live in `~/.claude/CLAUDE.md` and are not repeated here.

## What this is
A joyful, mobile-first public website for **Publiczny Żłobek w Stromcu**, the municipal nursery in Stromiec and a unit of Gmina Stromiec (Urząd Gminy Stromiec, `ugstromiec.pl`). Five sections: Aktualności, O nas, Rekrutacja, Dokumenty, Kontakt.
**Core value:** a parent instantly feels the żłobek's warmth AND finds what they need (enrol, documents, contact) on any device.

## Non-negotiable constraints
- **Polish only** — all visitor-facing text AND the CMS admin UI (labels/hints). No English shipped. (SITE-06, CMS-03)
- **WCAG 2.1 AA** + published **Deklaracja dostępności** — legally required for a public body. AA contrast, keyboard operable, visible focus, `prefers-reduced-motion`.
- **RODO** — forms carry a child's data: unticked consent checkbox + *klauzula informacyjna*; **no database, no storage, no logging** of submissions (email-only).
- **BIP** — link prominently to the existing BIP `https://ugstromiec.naszbip.pl/zlobek` (do not rebuild it).
- **Near-zero cost** — free tiers only (git CMS, Resend free, Turnstile free); no paid services, no DB.
- **Cloudflare hosting** — content routes prerender; only the two form endpoints are dynamic.

## Stack — authoritative: `.planning/research/STACK.md`
SvelteKit 2 + Svelte 5 (runes) · `@sveltejs/adapter-cloudflare` · Tailwind v4 (`@tailwindcss/vite`, CSS-first `@theme`) · Sveltia CMS (git-based) · Resend (email) · Cloudflare Turnstile (spam). See STACK.md for versions, rationale, and alternatives.

## Must-know gotchas (these cause real mistakes)
- **adapter-cloudflare:** SvelteKit server routes ARE the Pages Functions — do NOT also hand-author a `/functions` dir (they collide). Read secrets via `event.platform.env.*`, never `import.meta.env`.
- **Tailwind v4:** CSS-first `@theme{}` tokens in `app.css` — there is **no `tailwind.config.js`**.
- **Palette/contrast:** two-tier tokens — *expressive* (decorative only) vs *accessible* (text/UI). Never put bright yellow/orange on text. The approved design contract is `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — follow it; do not re-derive colors/type/spacing.
- **Email:** free MailChannels is dead (2024) → Resend from a **verified sending domain**; parent's address goes in `reply-to`, never `from`; recipient hard-coded `zlobek@ugstromiec.pl`.
- **CMS auth:** Cloudflare has no Netlify Git Gateway → self-hosted `sveltia-cms-auth` OAuth Worker + GitHub OAuth App.
- **Content:** placeholder-first; mark placeholders with a greppable `PLACEHOLDER` token; children's photos need documented *wizerunek* consent before launch.
- Full list: `.planning/research/PITFALLS.md`.

## Accounts & deploy
- **GitHub:** Org **`zlobekstromiec`** (owner user `devzlobekstromiec`); repo at `zlobekstromiec/<repo>`. Dedicated accounts for clean handoff — keep separate from personal.
- **Cloudflare:** account `Devzlobekstromiec@gmail.com's Account` (`b34639a1c6eccab5d37ed6a2aa697deb`); connected via the Cloudflare MCP. Wrangler uses a scoped `CLOUDFLARE_API_TOKEN` in a gitignored `.envrc`.
- **Deploy:** Cloudflare **Pages** git-integration — push to `main` → auto build + deploy. Phase 1 ships on `*.pages.dev`.
- **Domain:** `zlobekstromiec.pl` is **NOT purchased yet** (any doc saying "owned" is stale). Needed before Phase 4 (Resend SPF/DKIM/DMARC) and Phase 6 (custom domain).

## Dev commands (once Phase 1 scaffold lands)
Standard SvelteKit scripts: `npm run dev`, `npm run build` (output `.svelte-kit/cloudflare`), `npm run check` (svelte-check: types + a11y), `npm run lint`, `npm run test` (Playwright + axe). Local Cloudflare emulation: `wrangler pages dev`; local secrets in `.dev.vars` (gitignored). **Verify before commit:** `npm run check && npm run lint && npm run test`.

## Where authority lives (read before acting)
- **Read `.planning/STATE.md` first** each session (current phase + position).
- `.planning/ROADMAP.md` · `.planning/REQUIREMENTS.md` · `.planning/PROJECT.md`
- Research: `.planning/research/{SUMMARY,STACK,ARCHITECTURE,FEATURES,PITFALLS}.md`
- Current phase: `.planning/phases/01-live-homepage-design-foundation/` → `01-UI-SPEC.md` (LOCKED design) + `01-CONTEXT.md` (decisions).

## Workflow
Route file-changing work through GSD so planning + execution stay in sync: `/gsd-quick` (small fixes/docs), `/gsd-debug` (bugs), `/gsd-plan-phase` → `/gsd-execute-phase` (planned work). Don't make direct repo edits outside a GSD workflow unless explicitly asked.

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
