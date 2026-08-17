---
phase: 5
slug: gallery-fees
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-17
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `05-RESEARCH.md` §Validation Architecture (lines 864 onward). That section is authoritative; this file is its operational form.
> This file is also the discharge of **D-37**, which obliges the phase to state plainly which properties are proven and which are deferred.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.62 + `@axe-core/playwright` 4.13 (E2E/a11y); `node:test` via `node --test` (unit) |
| **Config file** | `playwright.config.ts` (`testDir: 'tests'`, `webServer: 'npm run build && npm run preview:test'`, chromium only, `baseURL http://localhost:4173`) |
| **Quick run command** | `npm run check` |
| **Unit command** | `npm run test:unit` (`node --test tests/*.unit.ts`) — **runs in NO gate (AG-3)** |
| **Full suite command** | `npm run check && npm run lint && npm run test:unit && npm run test` |
| **Estimated runtime** | Quick: seconds. Full: dominated by the `npm run build` inside Playwright's `webServer` |

### The five evidence classes in this repository

"Add a test" is not a specification here, because half the classes do not run automatically.

| # | Class | Command / mechanism | Runs automatically? |
|---|-------|---------------------|---------------------|
| **E1** | Type + a11y compile check | `npm run check` (`wrangler types --check` + `svelte-check`) | **YES, pre-commit** |
| **E2** | Format check | `npm run lint` (`prettier --check .` + eslint) | **YES, pre-commit** |
| **E3** | Build / prerender failure | `vite build`, inside Playwright's `webServer` and every Pages deploy | **YES, implicitly** |
| **E4** | Browser + axe | `npm run test` (Playwright) | Only when a human runs it. **No CI** |
| **E5** | Unit | `npm run test:unit` (`node:test`) | **NO. No gate at all** |

**Binding rule for this phase:** every property that matters and is covered only by **E5** needs a second check in **E1, E3 or E4**. Same rule as `04.1-VALIDATION.md:27`, and it binds harder here because `05-UI-SPEC.md` Contract 12 treats two E5 assertions (`EKSPORTY`, `instrukcja.unit.ts`) as loud failures when they are silent.

---

## Sampling Rate

- **After every task commit:** `npm run check` (E1, pre-commit enforced) **plus** `npm run test:unit` run by hand. The hand-run is an explicit plan step, never an assumption.
- **After every plan wave:** `npm run check && npm run lint && npm run test:unit && npm run test`
- **Before `/gsd-verify-work`:** full suite green **and** every grep gate returning its expected count
- **Max feedback latency:** seconds for E1/E2/E5; one full build for E3/E4

---

## Per-Task Verification Map

Task IDs are assigned when plans are written. Rows are keyed by the research map's stable IDs so a plan can cite them directly.

| Ref | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-----|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| FEE-1 | TBD | TBD | FEES-01 | N/A | e2e (E3+E4) | `npx playwright test tests/cennik.spec.ts` | ❌ W0 | ⬜ pending |
| FEE-2 | TBD | TBD | FEES-01 | N/A | e2e (E4) | same file | ❌ W0 | ⬜ pending |
| FEE-3 | TBD | TBD | FEES-01 | Unconditioned zero never published | e2e (E4) | same file | ❌ W0 | ⬜ pending |
| FEE-4 | TBD | TBD | FEES-01 | N/A | unit (E5) **needs E4 twin** | `node --test tests/cennik-reader.unit.ts` | ❌ W0 | ⬜ pending |
| FEE-5 | TBD | TBD | FEES-01 | N/A | unit (E5) + existing E4 twin | `node --test tests/kwoty.unit.ts` | ❌ W0 | ⬜ pending |
| FEE-6 | TBD | TBD | FEES-01 | Existing `.fee-box` no-zero gate holds | e2e (E4) | `npx playwright test tests/rekrutacja.spec.ts` | ✅ | ⬜ pending |
| FEE-7 | TBD | TBD | FEES-01 | Empty `zus` refused; `obnizka >= stawka` refused | unit + e2e | `node --test tests/admin-walidacja-cennik.unit.ts`; `npx playwright test tests/admin-cennik.spec.ts` | ❌ W0 | ⬜ pending |
| FEE-8 | TBD | TBD | FEES-01 | N/A | unit (E5) + E2 twin | `node --test tests/admin-walidacja-cennik.unit.ts` | ❌ W0 | ⬜ pending |
| FEE-9 | TBD | TBD | FEES-01 | N/A | **live only** | not automatable | — | ⬜ UAT |
| GAL-1 | TBD | TBD | GALLERY-01 | N/A | e2e (E4) | `npx playwright test tests/galeria.spec.ts` | ❌ W0 | ⬜ pending |
| GAL-2 | TBD | TBD | GALLERY-01 | Non-empty Polish alt on every tile | e2e (E4) | same file | ❌ W0 | ⬜ pending |
| GAL-3 | TBD | TBD | GALLERY-01 | axe AA populated, empty **and lightbox open** | e2e (E4) | same file | ❌ W0 | ⬜ pending |
| GAL-4 | TBD | TBD | GALLERY-01 | Escape closes, focus restores, Tab bounded | e2e (E4) | same file | ❌ W0 | ⬜ pending |
| GAL-5 | TBD | TBD | GALLERY-01 | Tile degrades to `<a href>` without scripting | e2e (E4, `javaScriptEnabled: false`) | same file | ❌ W0 | ⬜ pending |
| GAL-6 | TBD | TBD | GALLERY-01 | `prefers-reduced-motion: reduce` honoured | e2e (E4, `emulateMedia`) | same file | ❌ W0 | ⬜ pending |
| GAL-7 | TBD | TBD | GALLERY-02 | Add/remove/reorder without scripting | e2e (E4) | `npx playwright test tests/admin-galeria.spec.ts` | ❌ W0 | ⬜ pending |
| GAL-8 | TBD | TBD | GALLERY-02 | Twelve cap enforced **server-side**, not only in the UI | unit + e2e | `node --test tests/admin-walidacja-galeria.unit.ts`; spec above | ❌ W0 | ⬜ pending |
| GAL-9 | TBD | TBD | GALLERY-02 | Required alt and caption enforced server-side | unit + e2e | same pair | ❌ W0 | ⬜ pending |
| GAL-10 | TBD | TBD | GALLERY-02 | Hand-placed seed photos never deleted | **E5 only, must be promoted** | `node --test tests/admin-walidacja-galeria.unit.ts` | ❌ W0 | ⬜ pending |
| GAL-11 | TBD | TBD | GALLERY-02 | N/A | **live only** | not automatable | — | ⬜ UAT |
| ENUM-1 | TBD | TBD | all | Every `/admin/**` route enumerated in all four surfaces | e2e (E4) | `npx playwright test tests/admin-enumeracja.spec.ts` | ❌ W0 **NEW** | ⬜ pending |
| ENUM-2 | TBD | TBD | all | Panel copy sweep covers every `panel.ts` export | **E5 only, unenforced** | `node --test tests/admin-copy.unit.ts` | ✅ | ⬜ pending |
| ENUM-3 | TBD | TBD | all | Polish-only across all panel URLs | e2e (E4) | `npx playwright test tests/admin-polski.spec.ts` | ✅ extend `TRASY` 14→17 | ⬜ pending |
| REG-1 | TBD | TBD | all | `PowtarzalnaGrupa` without new props renders today's markup | e2e (E4) | `npx playwright test tests/admin-strony.spec.ts tests/admin-nabor.spec.ts` | ✅ | ⬜ pending |
| REG-2 | TBD | TBD | all | No horizontal overflow; nav breakpoints hold | e2e (E4) | `npx playwright test tests/responsive.spec.ts` | ✅ extend | ⬜ pending |
| REG-3 | TBD | TBD | all | `obiekt_zdjecia` removal breaks neither types nor prerender | E1 + E3 | `npm run check && npm run build` | — | ⬜ pending |
| REG-4 | TBD | TBD | all | New seed JSON survives prettier and the first panel save | E2 | `npm run lint` | — | ⬜ pending |
| AMD-1 | TBD | TBD | all | `01-UI-SPEC.md` physically carries the amendment; no live `400 zł` | grep gate | `grep -c` against `01-UI-SPEC.md` itself | — | ⬜ pending |
| AMD-2 | TBD | TBD | all | `DESIGN-BANK.md` §Cennik carries the strike, explainer included | grep gate | `grep -c` against `.planning/DESIGN-BANK.md` | — | ⬜ pending |
| AMD-3 | TBD | TBD | all | `KNOWN_FUTURE_ROUTES` empty and every former path resolves | E3 (crawler, **never a grep**) | `npm run build` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

New files:

- [ ] `tests/kwoty.unit.ts` — FEE-5, including the byte-identity pin against `OPLATY.kwota` (U+0020, not U+00A0)
- [ ] `tests/cennik.spec.ts` — FEE-1 to FEE-3, the rendered arithmetic assertion, and the scoped conditional-zero pair
- [ ] `tests/cennik-reader.unit.ts` — FEE-4, plus the negative-amount reader refusal
- [ ] `tests/admin-walidacja-cennik.unit.ts` — FEE-7, FEE-8; serialization pin in the shape of `admin-walidacja-nabor.unit.ts:172-190`
- [ ] `tests/admin-cennik.spec.ts` — FEE-7 browser half, axe clean and with `aria-invalid` rendered
- [ ] `tests/galeria.spec.ts` — GAL-1 to GAL-6. **The project's first open-overlay axe scan, first focus-trap assertion and first `emulateMedia({ reducedMotion })` usage**
- [ ] `tests/admin-galeria.spec.ts` — GAL-7 to GAL-9, plus the promoted GAL-10, in a `javaScriptEnabled: false` context
- [ ] `tests/admin-walidacja-galeria.unit.ts` — GAL-8 to GAL-10
- [ ] `tests/admin-walidacja-w-skrocie.unit.ts` — fixed arity, hours atoms, liczba miejsc
- [ ] `tests/admin-w-skrocie.spec.ts` — read-only tiles render as text (not `disabled` inputs); axe clean
- [ ] `tests/admin-enumeracja.spec.ts` — **RECOMMENDED NEW.** ENUM-1 and the `SCIEZKI`/`NAWIGACJA` index alignment. One file that permanently retires three silent enumeration failure modes. **See Open Question 4 below: descoping this is a checkpoint, not a default.**

Extensions to existing files:

- [ ] `tests/admin-polski.spec.ts` — `TRASY` from **14** to **17** routes (note: the "18 panel URLs" figure repeated in `.claude/CLAUDE.md`, `REQUIREMENTS.md`, `STATE.md` and `04.1-11-SUMMARY.md` is wrong)
- [ ] `tests/responsive.spec.ts` — add `/cennik` to `ROUTES`; explicit nav assertions at 768px and 1024px
- [ ] Lockstep edits: `tests/o-nas.spec.ts`, `tests/nav.spec.ts`, `tests/home.spec.ts`, `tests/admin-strony.spec.ts`, `tests/admin-walidacja-strony.unit.ts`, `tests/admin-pulpit.spec.ts`, `tests/admin-copy.unit.ts`, `tests/instrukcja.unit.ts`

*No framework install needed. Both runners already exist.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| An editor's fee change appears publicly (FEE-9) | FEES-01 | Requires a real commit, a real Pages build and a real ~2 minute wait. Nothing in the harness produces one | Log into `/admin/cennik`, change one editable field, Zapisz, wait for the Pages build, confirm on live `/cennik` |
| An editor's photo add and remove appears publicly (GAL-11) | GALLERY-02 | Same | Log into `/admin/galeria`, add a placeholder photo, Zapisz, wait, confirm on live `/o-nas#galeria`; then remove it and repeat |
| Lightbox on a real touch device | GALLERY-01 | Playwright chromium is not a phone. Tap targets and the scrim gesture are device behaviours | Open `/o-nas#galeria` on a phone, tap a tile, close it both by the button and by tapping the scrim |

**Live UAT budget:** three saves and one rebuild wait is the minimum honest run. Every save is a Cloudflare Pages build (~2 min) against a free ceiling of 500 per month.

**Do NOT schedule a live login-timing measurement (04.1 UAT row E2) on the same UTC day as live panel testing.** The code limiter is 5/hour and 20/day per address and would lock the editor out for the rest of that day.

---

## Properties Proven vs Deferred (the D-37 statement)

**Proven by an enforced gate:** every requirement-map row except FEE-9 and GAL-11.

**Proven only when a human runs `npm run test`:** all E4 rows. There is no CI. This is AG-3, it is not this phase's to fix, and this phase **enlarges** it. The phase's own `05-VERIFICATION.md` must say so rather than lean on suites nothing runs.

**Proven only in the unrun E5 tier, therefore honestly unproven unless promoted:**

| Ref | Property | Cheapest promotion |
|-----|----------|--------------------|
| GAL-10 | Hand-placed `sala-zabaw.jpg` / `plac-zabaw.jpg` are never deleted | Assert in `tests/admin-galeria.spec.ts`: remove a seed photo through the panel, assert the file is still present in the build's glob |
| FEE-8 | Byte-for-byte serialization of the panel's output | Twin already exists for free in `npm run lint` (E2): a serialization drift fails prettier |

The planner should look hardest at these two.

**Deferred to the Phase 6 launch gate. Tracked debt, not a silent descope:**

| Ref | Property | Why deferred | Where it retires |
|-----|----------|--------------|------------------|
| 17 | HEIC decode from a real phone photo (04.1 UAT row B2) | **The input does not exist.** There is no live photography from the żłobek yet, and a placeholder cannot honestly close it. HEIC is deliberately absent from `TYPY_ZDJECIA`; it works only because the browser decodes before upload (04.1 D-12) | Phase 6 launch gate, which already receives the real consented photo set |
| 18 | The stale-save conflict panel (04.1 UAT row B4) | The interesting case is the race between the SHA check and `update-ref`. No test reproduces it reliably, and it needs two concurrent human sessions | Phase 6. Reuse the existing head-SHA refusal (04.1 D-10) unchanged; build no gallery behaviour that depends on this leg |

Both must appear in `05-VERIFICATION.md` in the style the project already uses for FORM-01 and FORM-02.

**Not this phase's to close, and explicitly not claimed:** CMS-01, CMS-02, CMS-03 (D-36). The phase proceeds against a formally open Phase 04.1 dependency by explicit user decision (D-37) and says so in its plans rather than implying the dependency is met.

---

## Open Questions Carried Into Planning

1. Does `tests/instrukcja.unit.ts` pin an exact heading **set** or a required subset? Determines whether adding three manual sections is additive or turns a gate red.
2. The `w-skrocie` per-tile placeholder boolean has no artefact to extend. Recommendation: the relevant slice writes the Phase 6 sweep extension as an executable check rather than as an instruction to a future phase.
3. `ZdjecieEcha` reuse vs a separate `ZdjecieGaleriiEcha`. Recommendation: separate, because two shapes are cheaper than one satisfying two key-order oracles.
4. **Is `tests/admin-enumeracja.spec.ts` in scope?** It is one file that permanently retires three genuinely silent failure modes inside the enforced `npm run test`. If descoped, that should be an explicit checkpoint rather than an omission.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Every E5-only property either promoted to E1/E3/E4 or listed above as honestly unproven
- [ ] Feedback latency: seconds for E1/E2/E5, one build for E3/E4
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
