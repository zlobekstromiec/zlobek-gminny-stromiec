---
phase: 3
slug: news-aktualno-ci
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Populated from `03-RESEARCH.md` "Validation Architecture" and the four PLAN.md `<automated>` verify commands.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 (WCAG AA); `svelte-check` for the type/a11y gate; `node -e` for JSON/YAML/doc assertions |
| **Config file** | `playwright.config.*` (existing; specs in `tests/`) — no framework install this phase (all deps pinned from Phase 2) |
| **Quick run command** | `npx playwright test tests/aktualnosci.spec.ts` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~30 seconds (aktualnosci spec) · full suite longer (all Playwright specs) |

---

## Sampling Rate

- **After every task commit:** Run `npm run check` (svelte-check: types + a11y), then the task's own automated check (the relevant `tests/aktualnosci.spec.ts` case, or the task's `node -e` JSON/YAML/doc assertion).
- **After every plan wave:** Run `npm run test` (full suite — the `tests/home.spec.ts` lockstep must stay green).
- **Before `/gsd-verify-work`:** `npm run check && npm run lint && npm run test` all green.
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | NEWS-01 | — | N/A (seed + list spec authoring, RED) | fixture | `node -e "JSON.parse(...seed files...); console.log('seed JSON valid')"` | ✅ (creates spec + seeds) | ⬜ pending |
| 03-01-02 | 01 | 1 | NEWS-01 | T-03-04 | Malformed entry skipped via `console.warn` + `continue`; prerender never aborts (dokumenty.ts precedent) | type/a11y | `npm run check` | ✅ | ⬜ pending |
| 03-01-03 | 01 | 1 | NEWS-01 | T-03-03 | Cover resolved by basename against static glob; unknown basename → tint fallback, never a filesystem read | e2e + axe | `npx playwright test tests/aktualnosci.spec.ts` | ✅ (spec from 03-01-01) | ⬜ pending |
| 03-02-01 | 02 | 2 | NEWS-02 | — | N/A (single-post spec append, RED) | grep | `node -e "...single-post cases present"` | ✅ (appends to spec) | ⬜ pending |
| 03-02-02 | 02 | 2 | NEWS-02 | T-03-01 (high) / T-03-02 (med) | Hardened `renderPost`: raw HTML escaped, images→alt text, headings→paragraph, GFM tables dropped, `SAFE_HREF` link allow-list | type/a11y | `npm run check` | ✅ | ⬜ pending |
| 03-02-03 | 02 | 2 | NEWS-02 | T-03-03 | Unknown slug throws `error(404)` → friendly `+error.svelte` (D-08); cover by basename | e2e + axe | `npm run check && npx playwright test tests/aktualnosci.spec.ts` | ✅ (spec from 03-02-01) | ⬜ pending |
| 03-03-01 | 03 | 2 | NEWS-03 | T-03-05 (med) / T-03-06 | Cover uploads size-capped + on-upload transform (inherited global `media_libraries`); `tresc` widget constrained to `[bold, link, bulleted-list, numbered-list]` | config | `node -e "...aktualnosci collection OK"` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 2 | NEWS-03 | — | N/A (Polish staff docs) | doc-lint | `node -e "...instrukcja news section OK"` | ✅ | ⬜ pending |
| 03-04-01 | 04 | 3 | NEWS-01 | — | N/A (home lockstep rewrite, RED) | grep | `node -e "...home lockstep updated"` | ✅ (`tests/home.spec.ts` MODIFY) | ⬜ pending |
| 03-04-02 | 04 | 3 | NEWS-01 | T-03-07 | Card fields (title/date/excerpt) bound as text, not `{@html}`; no post-authored markup on the homepage DOM | type/a11y | `npm run check` | ✅ | ⬜ pending |
| 03-04-03 | 04 | 3 | NEWS-01 | T-03-07 / T-03-03 | Homepage cards render text only; cover by basename (tint fallback on unknown) | e2e + axe | `npm run check && npm run lint && npx playwright test tests/home.spec.ts` | ✅ (`tests/home.spec.ts`) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

This phase folds test scaffolding into each plan's **first task** (RED-first vertical slices, MVP mode) — there is **no standalone Wave 0 plan**. The scaffolds below are authored during execution before their implementation tasks; the boxes flip green as those first tasks land. `wave_0_complete: false` reflects that these plans have not yet executed; `nyquist_compliant: true` reflects that the validation contract itself is complete (every task carries an `<automated>` verify — no `MISSING` references).

- [ ] `tests/aktualnosci.spec.ts` — list cases (Plan 01 Task 1) + single-post cases appended (Plan 02 Task 1); covers NEWS-01, NEWS-02, D-08 404, WCAG 2.1 AA
- [ ] `tests/home.spec.ts` MODIFY — lockstep rewrite of the news assertions (Plan 04 Task 1); currently asserts the news section is absent (Pitfall 1, highest risk)
- [ ] `src/routes/+error.svelte` — friendly Polish 404 page (Plan 02 Task 3); resolves RESEARCH Open Question 3
- [ ] Empty-state coverage — resolved as svelte-check compilation + code review, not a Playwright build (Plan 01 Task 3); resolves RESEARCH Open Question 1

*No `<automated>MISSING</automated>` references exist in any plan; no separate Wave 0 test-infra plan is required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live CMS publish loop: login → create post → commit → Cloudflare rebuild → post appears on `/aktualnosci` (and homepage if among the 3 newest) | NEWS-03 | Uses GitHub OAuth against the deployed `*.pages.dev` CMS; cannot be Playwright-driven | End-of-phase human check (`human_verify_mode=end-of-phase`): log into `https://zlobek-gminny-stromiec.pages.dev/admin`, create a test Aktualności post, save, wait ~2 min, confirm it appears on `/aktualnosci` and (if among the 3 newest) on the homepage. This is the NEWS-03 acceptance proof. |
| List page empty-state markup + copy (zero-post `{:else}` branch) | NEWS-01 | The collection is always seeded (D-01), so a zero-post build is not producible; the `{:else}` branch cannot be asserted by Playwright | Covered by svelte-check compilation + code review (Plan 01 Task 3). Markup and copy are identical to the a11y-tested `NewsPreview` empty state shipped in Phase 1. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (every task carries an `<automated>` command)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none exist; specs authored as RED first-tasks)
- [x] No watch-mode flags (no `--watch` in any command)
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-13 (validation contract complete; `wave_0_complete` flips true once the RED specs are authored during execution)
