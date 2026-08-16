# CLAUDE.md — Publiczny Żłobek w Stromcu (public website)

High-signal project instructions. Deep detail lives in `.planning/` — this file summarizes and points; follow the links for specifics. Global dev-env/tooling conventions live in `~/.claude/CLAUDE.md` and are not repeated here.

## What this is
A joyful, mobile-first public website for **Publiczny Żłobek w Stromcu**, the municipal nursery in Stromiec and a unit of Gmina Stromiec (Urząd Gminy Stromiec, `ugstromiec.pl`). Five sections: Aktualności, O nas, Rekrutacja, Dokumenty, Kontakt.
**Core value:** a parent instantly feels the żłobek's warmth AND finds what they need (enrol, documents, contact) on any device.

## Non-negotiable constraints
- **Polish only** — all visitor-facing text AND the whole editorial panel: navigation, labels, hints, validation, confirmations, empty states, errors and the login code e-mail. No English shipped. (SITE-06, CMS-03). Enforced, not merely intended: `tests/admin-polski.spec.ts` scans 18 panel URLs inside `npm run test`, and a new panel screen that is not added to its route list has no coverage at all.
- **WCAG 2.1 AA** + published **Deklaracja dostępności** — legally required for a public body. AA contrast, keyboard operable, visible focus, `prefers-reduced-motion`.
- **RODO** — forms carry a child's data: unticked consent checkbox + *klauzula informacyjna*; **no database, no storage, no logging** of submissions (email-only).
- **BIP** — link prominently to the existing BIP `https://ugstromiec.naszbip.pl/zlobek` (do not rebuild it).
- **Near-zero cost** — free tiers only (the panel is our own code committing to git, Resend free, Turnstile free); no paid services, no DB.
- **Cloudflare hosting** — content routes prerender; only the two form endpoints are dynamic.

## Stack — authoritative: `.planning/research/STACK.md`
SvelteKit 2 + Svelte 5 (runes) · `@sveltejs/adapter-cloudflare` · Tailwind v4 (`@tailwindcss/vite`, CSS-first `@theme`) · a custom Polish editorial panel at `/admin`, built in-house in Phase 04.1 (no vendor CMS, no third-party bundle) · Resend (email) · Cloudflare Turnstile (spam). See STACK.md for versions, rationale, and alternatives.

## Must-know gotchas (these cause real mistakes)
- **adapter-cloudflare:** SvelteKit server routes ARE the Pages Functions — do NOT also hand-author a `/functions` dir (they collide). Read secrets via `event.platform.env.*`, never `import.meta.env`.
- **Tailwind v4:** CSS-first `@theme{}` tokens in `app.css` — there is **no `tailwind.config.js`**.
- **Palette/contrast:** two-tier tokens — *expressive* (decorative only) vs *accessible* (text/UI). Never put bright yellow/orange on text. The approved design contract is `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — follow it; do not re-derive colors/type/spacing.
- **Email:** free MailChannels is dead (2024) → Resend from a **verified sending domain**; parent's address goes in `reply-to`, never `from`; recipient hard-coded `zlobek@ugstromiec.pl`.
- **Panel auth:** editors sign in with a **one-time six-digit code e-mailed to them**. No external account of any kind. The allowlist is the `ADMIN_EMAILS` Pages secret and it is re-checked on **every** request, so removing an address logs that person out on their next request. **Adding an editor is two steps: update the secret AND trigger a rebuild.** A secret only reaches deployments created after it is set, and skipping the second step is the failure people actually hit.
- **Panel writes:** saves commit to the repo through the org-owned GitHub App `Panel redakcyjny zlobka` (Contents:write on one repository). Content is read at **build** time, so a save takes roughly two minutes to appear publicly, and two saves in a row take about four. That delay is normal, not a fault.
- **`/admin` is SvelteKit routes, never a static bundle.** Cloudflare Pages resolves static assets before invoking the Worker, so anything under `static/admin/` would shadow the panel and bypass its auth gate outright. Never put a file there.
- **Content:** placeholder-first; mark placeholders with a greppable `PLACEHOLDER` token; children's photos need documented *wizerunek* consent before launch.
- Full list: `.planning/research/PITFALLS.md`.

## Accounts & deploy
- **GitHub:** Org **`zlobekstromiec`** (owner user `devzlobekstromiec`); repo at `zlobekstromiec/<repo>`. Dedicated accounts for clean handoff — keep separate from personal.
- **Cloudflare:** account `Devzlobekstromiec@gmail.com's Account` (`b34639a1c6eccab5d37ed6a2aa697deb`); connected via the Cloudflare MCP. Wrangler uses a scoped `CLOUDFLARE_API_TOKEN` in a gitignored `.envrc`. That token is **Pages + Turnstile only**: it has no Workers KV and no zone DNS permission, so `wrangler kv namespace create` and any DNS write fail with `Authentication error [code: 10000]`. Widen the token in the dashboard rather than assuming the call is wrong.
- **Deploy:** Cloudflare **Pages** git-integration: push to `main` → auto build + deploy. Live on `*.pages.dev`. `wrangler.jsonc` is the **source of truth** for Pages bindings (the dashboard cannot edit them while that file exists); secrets are the exception and are set with `wrangler pages secret put`, and they only reach deployments created **after** the secret is set.
- **Domain:** `zlobekstromiec.pl` is **OWNED** (bought 2026-08-13). Registration stays at **home.pl**, but **DNS is now on Cloudflare** (zone `b86f4808a59379c48e9a8beeee6c19cb`, nameservers `art`/`tina.ns.cloudflare.com`, `.pl` delegation confirmed). Both `zlobekstromiec.pl` and `www.` are attached to the Pages project. The site stays `noindex` + robots-disallowed on every origin until Phase 6 flips the placeholder guard.
- **Sending domain:** `send.zlobekstromiec.pl` is **verified in Resend, EU region (`eu-west-1`)**. Note the record layout: because Resend's Return-Path prefix is itself `send`, SPF and MX sit one level deeper at **`send.send.zlobekstromiec.pl`**; DKIM is a TXT at `resend._domainkey.send.zlobekstromiec.pl` (never a CNAME) and DMARC is at `_dmarc.zlobekstromiec.pl`.
- **Recipient mailbox:** `zlobek@ugstromiec.pl` **does not exist yet** (pending Gmina approval), so the `to:` leg of every form mail hard-bounces. The BCC backup `devzlobekstromiec@gmail.com` is currently the only mailbox that receives submissions. Do not change the hard-coded recipient; re-testing once the mailbox exists is a single form submission and needs no deploy.

## Dev commands (once Phase 1 scaffold lands)
Standard SvelteKit scripts: `npm run dev`, `npm run build` (output `.svelte-kit/cloudflare`), `npm run check` (svelte-check: types + a11y), `npm run lint`, `npm run test:unit` (node:test, the `.unit.ts` files), `npm run test` (Playwright + axe). Local Cloudflare emulation: `npm run preview:test`, which is `wrangler pages dev` plus `--binding` flags.

**Do NOT create a root `.dev.vars`.** `wrangler types` reads it and writes its keys into the committed `worker-configuration.d.ts` as required members, which the Pages build cannot reproduce, so `wrangler types --check` then fails every deploy. See `.dev.vars.example`.

**Verify before commit:** `npm run check && npm run lint && npm run test:unit && npm run test`. Note that pre-commit runs only the first two, and **nothing automated runs `test:unit`** (no CI), so run it by hand.

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
