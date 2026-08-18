---
phase: 6
slug: accessibility-legal-compliance-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
source: 06-RESEARCH.md § Validation Architecture
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `06-RESEARCH.md` § Validation Architecture. That section is authoritative; this file
> is the executable contract the executor and `/gsd-verify-work` read.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Two tiers. `node --test` (built in, zero dependency) over `tests/*.unit.ts`; Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 over `tests/*.spec.ts` |
| **Config file** | `playwright.config.ts` (chromium only, `baseURL http://localhost:4173`, `webServer: npm run build && npm run preview:test`). No config file for `node --test`: the `.unit.ts` suffix deliberately sits outside Playwright's matcher |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run check && npm run lint && npm run test:unit && npm run test` |
| **Launch-gate command** | `npm run gate:launch` — new this phase, and RED on purpose until Phase 7 |
| **Estimated runtime** | ~10 s for `test:unit`; several minutes for the full chain (build plus 390+ Playwright cases) |

**Structural constraint that shapes every test task.** The pre-commit hook runs `svelte-check` over
the WHOLE working tree, so a test importing a not-yet-written module is a type error and the hook
refuses even an unrelated commit. **A TDD RED commit is impossible in this repository.** Observe and
RECORD red in the SUMMARY, then land the test and its implementation in one commit. Do not reach for
`--no-verify`.

---

## Sampling Rate

- **After every task commit:** `npm run test:unit` (plus `npm run check && npm run lint`, which the
  pre-commit hook enforces anyway).
- **After every plan wave:** the full four-command chain.
- **Before `/gsd-verify-work`:** the full chain green, **plus** `npm run gate:launch` executed and its
  RED output pasted into the SUMMARY alongside the expected item list, so "red on purpose" is
  evidenced rather than claimed.
- **Max feedback latency:** ~10 s at task granularity.

---

## Per-Task Verification Map

*Populated by the planner once task IDs exist. The requirement-to-behaviour map that drives it is
`06-RESEARCH.md` § "Phase Requirements to Test Map" (28 rows). Every task in every PLAN.md must
resolve to a row there or declare itself manual-only below.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| *pending planner* | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Two of these are **irrecoverable if skipped**: they capture a "before" state that ceases to exist the
moment Phase 6 code lands. They must be the phase's first tasks, not merely early ones.

- [ ] **Default-theme visual baseline for all nine public routes**, captured BEFORE any CSS change.
      Blocks the "default theme cannot regress" claim and cannot be recreated later.
- [ ] **SITE-05 "before" measurement** on the three D-25 routes against the current live deployment,
      taken BEFORE the D-21 build-command edit. Same irrecoverability.
- [ ] **D-21 landed early:** `wrangler types --check && npm run test:unit && vite build`. Everything
      below writes unit suites into a tier that otherwise runs nowhere.
- [ ] `src/lib/zastepcze.ts` extracted and `tests/zastepcze.unit.ts` rewired to import it, so one
      walker serves two consumers (the inventory test and the launch gate).
- [ ] `tests/deklaracja-dostepnosci.spec.ts` created. The route has **zero** coverage today.
- [ ] `tests/kontrast.spec.ts` — the high-contrast axe sweep, the `results.incomplete` assertion on
      `color-contrast`, and the no-unexpected-white property sweep.
- [ ] `tests/skala-tekstu.spec.ts`, or the 130% condition folded into `tests/responsive.spec.ts`
      `ROUTES`.
- [ ] `tests/ulatwienia.spec.ts` — widget in both states, both themes, the focus contract, and the
      prerendered-wrapper assertion that proves zero CLS.
- [ ] `tests/gate-launch.unit.ts` with fixture trees covering both comment syntaxes and a nested
      `placeholder` boolean.
- [ ] `tests/admin-walidacja-deklaracja.unit.ts` and `tests/admin-walidacja-polityka.unit.ts`.
- [ ] New cases in existing files: `+error.svelte` axe, the `MobileNav` drawer axe in its OPEN state,
      the Tab and Shift+Tab wrap cases for D-23, and the success state of both forms.
- [ ] `TRASY` in `tests/fixtures/trasy-panelu.ts` extended from 17 to 19 for the two new panel screens.

**Resolved, no longer a Wave 0 item:** the `chrome-devtools` MCP server. Research reported it absent;
it is present under a plugin-namespaced tool prefix
(`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`). No configuration change and no pinning
checkpoint is owed. See the Orchestrator Addendum in `06-RESEARCH.md`.

---

## Manual-Only Verifications

Ten properties this phase's correctness rests on that no unit test can establish. Full reasoning is
in `06-RESEARCH.md` § "Not Inferable From Unit Tests"; this is the executable list.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| High-contrast legibility as rendered | A11Y-01, A11Y-02 | Arithmetic on a token pair says nothing about which pair actually meets on screen after 17 literal overrides and 9 shadow-to-border swaps | Screenshot all nine public routes in the mode and review. The automated half (property sweep + `incomplete` assertion) is necessary but not sufficient |
| Screen-reader announcement quality | A11Y-01 (D-27 Tier 3) | No automation substitutes for it | One recorded NVDA or VoiceOver session: the widget trigger's name and expanded state; the segmented control announcing „A+, tekst większy, 115 procent" rather than „A plus"; the reset `role="status"` line firing; the deklaracja's headings reading as meaningful sections |
| Perceived size of the load flash | A11Y-02 (D-12) | The millisecond count is measurable; whether it *feels* like a defect is a human judgement | Once, on a phone, on mobile data, against the live deployment. This is the only evidence that can retire D-12's accepted cost |
| Core Web Vitals on real hardware | SITE-05 | Emulation is a model | One session on an actual mid-range Android phone over mobile data, all three D-25 routes. If it contradicts the emulated numbers, the emulated numbers were wrong |
| Is the Deklaracja comprehensible Polish | A11Y-03 | `admin-polski.spec.ts` proves absence of English; it cannot prove presence of clear Polish | One reading by a Polish-speaking non-developer, same shape as CMS-03's human half. The statutory phrasing is prescribed, but architektura, komunikacja and pozostałe are ours |
| Independent structural validation | A11Y-03 | Held-out oracle, not used to build the page | Run the deployed `/deklaracja-dostepnosci` through `https://deklaracja-dostepnosci.info/walidator`. Expected in Phase 6: it flags the five PLACEHOLDER content classes as empty (correct) and passes everything else. **Any other failure is a real defect** |
| Default theme did not regress | A11Y-01 | The CSS gating is sound; the human editing 17 component stylesheets is the risk | Compare against the Wave 0 visual baseline. Requires that baseline to exist first |
| Tap-target measurement | A11Y-01 (D-27 Tier 2) | axe does not enforce a 44px minimum (WCAG 2.1 AA has none), so the project's own stricter contract is unenforced by every automated gate in the repo | One pass with the DevTools element inspector across every route and control. Contract 6 closes the known 36px `TopBar` breach; whether a second exists is a measurement |
| Turnstile's own accessibility | A11Y-01 | axe cannot see into a cross-origin iframe, and a real managed widget refuses automation by design (04-07) | Manual contrast and keyboard-reachability check. The declaration already names Turnstile as a non-conformance for exactly this reason |
| D-24 (FORM-02 parts B and C) and D-28 (UAT row B4) | FORM-02, CMS-02 | Human sessions with no code component, zero deploys | Part B: one submission at or after the top of the next clock hour. Part C: one on a new UTC date. B4: a second editor in a second browser tab |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references, and the two irrecoverable baselines ran FIRST
- [ ] No watch-mode flags
- [ ] Feedback latency < 15 s at task granularity
- [ ] `npm run gate:launch` runs, is RED, and its output is recorded in the phase SUMMARY
- [ ] All ten manual-only rows are carried into `06-UAT.md`
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
