---
phase: 1
slug: live-homepage-design-foundation
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Populated from `01-RESEARCH.md §Validation Architecture` and the five phase plans (01-01 … 01-05).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.62.1 (+ `@axe-core/playwright` 4.13.0) for E2E/a11y; svelte-check 4.7.5 for types + compiler a11y; ESLint + `eslint-plugin-svelte` for lint. Vitest (from `sv create`) available for unit if needed. |
| **Config file** | `playwright.config.ts` (created Wave 0 in Plan 01-01 Task 1); svelte-check reads `svelte.config.js` / `tsconfig.json` (no separate config). |
| **Quick run command** | `npm run check` (svelte-check: types + compiler a11y warnings) |
| **Full suite command** | `npm run check && npm run lint && npm run test` (`npm run test` → Playwright + axe) |
| **Estimated runtime** | quick `npm run check` ~15–30 s · full suite ~2–3 min (build + preview + Playwright + axe) |

---

## Sampling Rate

- **After every task commit:** Run `npm run check` (fast; types + compiler a11y).
- **After every plan wave:** Run `npm run check && npm run lint && npm run test` (full, incl. axe AA smoke).
- **Before `/gsd-verify-work`:** Full suite must be green **and** a successful Cloudflare `*.pages.dev` deploy exists (phase gate).
- **Max feedback latency:** quick gate < ~30 s; full suite < ~3 min.

---

## Per-Task Verification Map

Task ID = `{phase}-{plan}-{task}`. "Infra" column: ✅ = tooling/test file already present when the task runs · **W0** = this task is a Wave 0 creator (authors the test infra) · **manual** = human-only checkpoint (see Manual-Only table).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Infra | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------|--------|
| 01-01-01 | 01 | 1 | HOME-01, HOME-02, SITE-04 (a11y baseline) | — | N/A (RED acceptance test authored, no runtime yet) | e2e/a11y (RED) | `npx playwright test tests/home.spec.ts \|\| echo "RED as expected (homepage composed in Plan 03)"` | W0 (authors `playwright.config.ts` + `tests/home.spec.ts`) | ⬜ pending |
| 01-01-02 | 01 | 1 | SITE-01 (build half), SITE-06 | T-01-SC / T-01-03 | Clean legitimacy audit; `@lucide/svelte` not deprecated `lucide-svelte`; lockfile committed; empty `App.Platform.env` stub, no secrets | smoke (build) | `npm run build && test -d .svelte-kit/cloudflare && test ! -f tailwind.config.js && grep -q 'lang="pl"' src/app.html && grep -q 'adapter-cloudflare' svelte.config.js` | ✅ (scaffolded here) | ⬜ pending |
| 01-01-03 | 01 | 1 | SITE-04, SITE-06, A11Y baseline (D-08/D-09) | — | Fonts self-hosted (no Google CDN — RODO); pre-commit gate wired | unit/static (svelte-check + grep) | `npm run check && grep -q "@theme" src/app.css && grep -q "#0369A1" src/app.css && grep -q "#F59E0B" src/app.css && grep -q "prefers-reduced-motion" src/app.css && grep -Eq "nodejs (22\|22\.)" .tool-versions && test -f .pre-commit-config.yaml && test -f docs/dev-env.md && { grep -Rq "@fontsource" src/app.css package.json \|\| ls static/fonts/*.woff2 >/dev/null 2>&1; }` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | SITE-03, SITE-06 | — | Accessible active state (aria-current, not colour alone); skip link first focusable | unit/static (svelte-check + grep) | `npm run check && grep -q "aria-label=\"Główna nawigacja\"" src/lib/components/Header.svelte && grep -q "aria-current" src/lib/components/Header.svelte && grep -q "/aktualnosci" src/lib/nav.ts && grep -q "Przejdź do treści" src/lib/components/SkipLink.svelte` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | SITE-02, A11Y baseline | T-01-05 | Native elements; bounded focus trap; scroll-lock released on close/unmount; ESC + scrim always close | unit/static (svelte-check + grep) | `npm run check && grep -q "aria-modal=\"true\"" src/lib/components/MobileNav.svelte && grep -q "Otwórz menu" src/lib/components/MobileNav.svelte && grep -q "aria-expanded" src/lib/components/MobileNav.svelte` | ✅ | ⬜ pending |
| 01-02-03 | 02 | 2 | SITE-03, SITE-06 | T-01-02 | BIP external link `rel="noopener noreferrer"` (reverse-tabnabbing) — asserted in test | e2e (Playwright) | `npm run check && npx playwright test tests/nav.spec.ts && grep -q "https://ugstromiec.naszbip.pl/zlobek" src/lib/components/Footer.svelte && grep -q 'id="main"' src/routes/+layout.svelte` | W0 (authors `tests/nav.spec.ts`) | ⬜ pending |
| 01-03-01 | 03 | 3 | HOME-01, HOME-02, SITE-06 | — | No bright yellow/orange on text (AA two-tier rule); verbatim copy unaltered | unit/static (svelte-check + grep) | `npm run check && grep -q "będziemy czuwać nad każdym krokiem Twojej pociechy" src/lib/components/Hero.svelte && grep -q "Zapisz dziecko" src/lib/components/Hero.svelte && grep -q "fetchpriority" src/lib/components/Hero.svelte && grep -Eq "variant" src/lib/components/Cta.svelte` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 3 | HOME-02, SITE-06 | T-01-06 (accept) | Public institutional `mailto`/`tel` by design; no personal data exposed | unit/static (svelte-check + grep) | `npm run check && grep -q "Wkrótce pojawią się aktualności" src/lib/components/NewsPreview.svelte && grep -q "mailto:zlobek@ugstromiec.pl" src/lib/components/QuickContact.svelte && grep -q "tel:" src/lib/components/QuickContact.svelte` | ✅ | ⬜ pending |
| 01-03-03 | 03 | 3 | HOME-01, HOME-02, SITE-02, SITE-06 | T-01-04 | `noindex` robots meta while on `*.pages.dev`; no JSON-LD/GSC (deferred D-12); PLACEHOLDER tokens on non-final copy | e2e/a11y (Playwright + axe) | `npm run check && npm run lint && npx playwright test tests/home.spec.ts tests/responsive.spec.ts && ! grep -q "application/ld+json" src/lib/components/Seo.svelte` | W0 (authors `tests/responsive.spec.ts`; turns `home.spec.ts` GREEN) | ⬜ pending |
| 01-04-01 | 04 | 2 | SITE-01, SITE-06 (D-11) | T-01-04 | `Disallow: /` on placeholder; no `google-site-verification`; no JSON-LD | static (grep) | `grep -q "Disallow: /" static/robots.txt && grep -q "<urlset" static/sitemap.xml && ! grep -rq "google-site-verification" static/` | ✅ | ⬜ pending |
| 01-04-02 | 04 | 2 | SITE-01 (D-10) | T-01-01, T-01-07 | CSP/HSTS/nosniff/Referrer-Policy/X-Frame-Options baseline copied into build output; branded OG card | static + smoke (build) | `grep -q "X-Content-Type-Options" static/_headers && grep -q "Content-Security-Policy" static/_headers && grep -q "Strict-Transport-Security" static/_headers && test -f static/og-placeholder.png && test -f static/site.webmanifest && npm run build && test -f .svelte-kit/cloudflare/_headers` | ✅ | ⬜ pending |
| 01-04-03 | 04 | 2 | SITE-06, SITE-03 (footer link resolves) | — | Legally-sensitive footer link resolves (no 404) before Phase 6; PLACEHOLDER token on stub body | smoke (build/prerender) | `npm run check && grep -q "Deklaracja dostępności" src/routes/deklaracja-dostepnosci/+page.svelte && npm run build && { test -f .svelte-kit/cloudflare/deklaracja-dostepnosci.html \|\| test -f .svelte-kit/cloudflare/deklaracja-dostepnosci/index.html; }` | ✅ | ⬜ pending |
| 01-05-01 | 05 | 4 | SITE-01 | T-01-03, T-01-08, T-01-SC | Repo under dedicated Org (handoff, no personal coupling); no secrets committed; lockfile pins deps | integration (git) | `git remote -v \| grep -q "zlobekstromiec" && git ls-remote origin main \| grep -q "refs/heads/main"` | ✅ | ⬜ pending |
| 01-05-02 | 05 | 4 | SITE-01 | — | Only `NODE_VERSION` build env var (no secret env vars on Pages) | manual (dashboard connect — no CLI) | see Manual-Only Verifications | manual | ⬜ pending |
| 01-05-03 | 05 | 4 | SITE-01 (criteria #1/#2/#6) | T-01-04 | Live-site content + auto-redeploy proof; noindex still in effect | manual (human-verify UAT) | see Manual-Only Verifications | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. All statuses are ⬜ pending at planning time; executors flip them per commit/wave.*

---

## Wave 0 Requirements

Wave 0 = the test/infra scaffolding that must exist before implementation is meaningfully testable. In this greenfield phase, Wave 0 artifacts are **created in-phase** (there is no pre-existing infrastructure). They are **fully specified/planned** below, but **not yet executed** (see `wave_0_complete` note under Sign-Off).

- [ ] `playwright.config.ts` — E2E config with `webServer` (build → preview, baseURL `http://localhost:4173`) — **Plan 01-01 Task 1**
- [ ] `tests/home.spec.ts` — covers SITE-04, HOME-01, HOME-02, a11y (axe wcag2a/2aa/21a/21aa); RED at authoring, GREEN in Plan 03 — **Plan 01-01 Task 1 (author) → Plan 01-03 Task 3 (green)**
- [ ] `tests/nav.spec.ts` — covers SITE-03 (5 header links + footer BIP url/rel + Deklaracja/Kontakt) and drawer keyboard behaviour — **Plan 01-02 Task 3**
- [ ] `tests/responsive.spec.ts` — covers SITE-02 (viewport matrix 375×667 / 768×1024 / 1280×800; drawer < md, inline nav ≥ md) — **Plan 01-03 Task 3**
- [ ] Framework install: `npm i -D @axe-core/playwright` (Playwright itself comes from `sv create`) — **Plan 01-01 Task 2**
- [ ] `.pre-commit-config.yaml` running `svelte-check` (`npm run check`) + `eslint` (`npm run lint`) (D-08) — **Plan 01-01 Task 3**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cloudflare Pages git-integration connect + build config | SITE-01 | Dashboard-only flow; no CLI/API equivalent for the git-integration connect (Task 01-05-02) | Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git; authorize the GitHub App for Org `zlobekstromiec`; set framework preset SvelteKit, build `npm run build`, output `.svelte-kit/cloudflare`, env `NODE_VERSION=22`; trigger first deploy; capture the `*.pages.dev` URL. |
| Live `*.pages.dev` site content + mobile drawer + BIP link + auto-redeploy | SITE-01 (criteria #1/#2/#6), SITE-02, SITE-03, HOME-01, HOME-02 | Requires a real public deployment + human interaction (touch/keyboard on device) and a live push→rebuild observation (Task 01-05-03) | Open the URL on phone + desktop; confirm verbatim hero message, 5 nav links, hamburger open/close via touch + ESC with focus restore, footer BIP opens in new tab, Deklaracja stub (no 404), Aktualności empty state, mailto/tel; then push a trivial commit to `main` and confirm Cloudflare auto-rebuilds and the change goes live. Record URL + settings in `docs/dev-env.md`. |
| Live URL responds (SITE-01 UAT) | SITE-01 | Confirmable only after the manual deploy exists | Handled by Task 01-05-03 above. |
| No English on public page (SITE-06 human review) | SITE-06 | Human judgement complements the automated Polish-string assertions in the e2e tests | Visual review of the live homepage + `/deklaracja-dostepnosci` for any English string. |

*Automated coverage note: every non-checkpoint task carries an `<automated>` verify command. The only manual-only verifications are the two Plan 05 human checkpoints (dashboard connect + live UAT), which are legitimately CLI-impossible.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — all 11 non-checkpoint tasks carry `<automated>`; the 2 Plan 05 checkpoints are legitimately manual (dashboard/live UAT).
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — the only automated-free tasks are 01-05-02 and 01-05-03 (2 consecutive checkpoints), preceded by automated 01-05-01.
- [x] Wave 0 covers all MISSING references — the four test files + axe install + pre-commit config from RESEARCH §Wave 0 Gaps are each assigned to a specific task (see Wave 0 Requirements).
- [x] No watch-mode flags — all commands are one-shot (`npm run check`, `npm run build`, `npx playwright test`); no `--watch`.
- [x] Feedback latency < ~30 s for the quick gate; < ~3 min for the full suite.
- [x] `nyquist_compliant: true` set in frontmatter.

**Note on `wave_0_complete`:** Left `false`. Semantics here = "Wave 0 has been *executed*". At planning time no plan has run, so the Wave 0 test scaffolding (playwright config + 3 spec files + axe install + pre-commit) is fully *specified* but not yet *created/green*. The executor flips this to `true` after Plan 01-01/01-02/01-03 land the test infra and it runs.

**Approval:** approved 2026-08-12
