---
phase: 04-enrollment-contact-email-pipeline
plan: 09
subsystem: frontend
tags: [turnstile, svelte5-runes, effect-lifecycle, gap-closure, playwright, wr-02]

# Dependency graph
requires:
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'TurnstileWidget.svelte with its $effect render/cleanup pair and the exported reset() (04-03)'
  - phase: 04-enrollment-contact-email-pipeline
    provides: 'the /kontakt route, its Playwright suite and the hidden cf-turnstile-response readiness seam (04-04)'
provides:
  - 'A Turnstile $effect whose cleanup releases the named loader global it installed, guarded by an identity check so one instance cannot clean up after another'
  - 'A render closure that refuses to draw into a container that has left the document, so a late loader callback is harmless'
  - 'A Playwright regression guard that pins the cleared global across a client-side navigation off a form page'
affects: [06-launch-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Identity-checked global cleanup: an effect clears a shared window global only when it is still its own closure, so a fast-path instance that installed nothing cannot delete a waiting instance callback'
    - 'Connectedness guard before a third-party render call: isConnected is checked at the top of the render closure, because a late loader callback can outlive the component'
    - 'Client-side-navigation proof by sentinel: a window property planted before the click is asserted afterwards, so a window-absence assertion cannot pass through a full document load'

key-files:
  created: []
  modified:
    - src/lib/components/TurnstileWidget.svelte
    - tests/kontakt.spec.ts

key-decisions:
  - 'The cleanup clears window.__onTurnstileLoad ONLY when it is identity-equal to this effect own rysuj closure. An unconditional clear was explicitly rejected: when window.turnstile already exists the component takes the fast path and installs nothing, so an unconditional clear would let an instance that installed nothing delete the callback of an instance still waiting for the loader, which is the same cross-instance bug inverted.'
  - 'The plan baseline figure of 26 for the combined kontakt run is wrong and was not chased. The real baseline of tests/kontakt.spec.ts is 15 cases (the 24 figure some counts reach adds the 9 cases of tests/kontakt-api.spec.ts, which the path filter does not select). The binding criterion, one more case than baseline, is met: 15 to 16.'
  - 'RED was committed separately from GREEN (f29c3a4 then 2e7a83e) so the regression guard is provably red on the pre-fix tree, not merely asserted to be.'
  - 'src/lib/forms/turnstile-global.d.ts was NOT touched. Both members were already declared optional, which is exactly what makes assigning undefined legal under the repo strict tsconfig (exactOptionalPropertyTypes is not enabled).'

patterns-established:
  - 'Pattern: when a test asserts the ABSENCE of something on window, plant a sentinel first and assert it survived. Otherwise a full page reload makes the absence assertion vacuously true and the guard proves nothing.'
  - 'Pattern: a grep-level acceptance criterion (__onTurnstileLoad === rysuj) is what stops a future simplification from silently turning a correct conditional clear into a broken unconditional one.'

requirements-completed: []

coverage:
  - id: D1
    description: 'After a client-side navigation off /kontakt, window.__onTurnstileLoad is undefined'
    requirement: 'FORM-02'
    verification:
      - kind: e2e
        ref: 'tests/kontakt.spec.ts, case "nawigacja klientem sprząta globalny callback Turnstile (WR-02)". Observed FAILING on the pre-fix component and PASSING after.'
        status: pass
    human_judgment: false
  - id: D2
    description: 'The assertion in D1 cannot pass through a full document load'
    requirement: 'FORM-02'
    verification:
      - kind: e2e
        ref: 'Same case: a window sentinel planted before the click is read back afterwards and equals "kontakt". It was already passing on the pre-fix run, which is why the failure there landed on the callback assertion and not on the sentinel.'
        status: pass
    human_judgment: false
  - id: D3
    description: 'The render closure refuses to draw into a container that has left the document'
    requirement: 'FORM-02'
    verification:
      - kind: other
        ref: 'Source gate: grep -c isConnected src/lib/components/TurnstileWidget.svelte returns 1, and the guard is the first statement of the rysuj closure, above the window.turnstile?.render call.'
        status: pass
    human_judgment: false
  - id: D4
    description: 'The cleanup clears the global under an identity check, not unconditionally, and keeps the widget-removal ordering'
    requirement: 'FORM-02'
    verification:
      - kind: other
        ref: 'Source gate: grep -c "__onTurnstileLoad === rysuj" returns 1. Shipped cleanup body, in order: clear the global if it is still rysuj, then remove(widgetId), then widgetId = undefined.'
        status: pass
    human_judgment: false
  - id: D5
    description: 'Token acquisition and both full submit-to-success paths still work after the lifecycle change'
    requirement: 'CONTACT-03, RECRUIT-04'
    verification:
      - kind: e2e
        ref: 'npx playwright test tests/kontakt.spec.ts tests/rekrutacja.spec.ts, 33 passed (16 + 17). Full suite npm run test, 110 passed (baseline 109).'
        status: pass
    human_judgment: false
  - id: D6
    description: 'The live managed widget renders and issues a token across a real client-side navigation between the two form pages'
    requirement: 'FORM-02'
    verification:
      - kind: manual
        ref: 'Outstanding human step, see Human Follow-up below. A managed widget refuses to issue a token to any automated browser.'
        status: pending
    human_judgment: true

metrics:
  duration_minutes: 4
  completed_date: 2026-08-15
  tasks_completed: 1
  files_changed: 2

status: complete
---

# Phase 04 Plan 09: Turnstile Effect Lifecycle (WR-02 gap closure) Summary

The Turnstile `$effect` now owns the whole lifetime of everything it installs: it releases the named loader global on cleanup under an identity check, and its render closure refuses to draw into a detached container.

## What Was Built

`src/lib/components/TurnstileWidget.svelte` installed `window.__onTurnstileLoad = rysuj` when the Turnstile API had not yet loaded, but its `$effect` cleanup only removed the widget and never released that global. Two failure modes followed. If the component unmounted before `api.js` arrived, the loader later invoked the stale closure and rendered into a detached container, writing a `widgetId` into a destroyed instance that the already-run cleanup could no longer reach. And on client-side navigation between `/kontakt` and `/rekrutacja`, Svelte removes and re-inserts the `svelte:head` script tag, a re-inserted script element re-executes, and `api.js` called the named onload callback again, which was still the PREVIOUS page's closure because the new page took the `window.turnstile` fast path and never reassigned the global.

Two changes, both inside the effect, nothing outside it:

1. `rysuj` returns early when `cel.isConnected` is false, before the `window.turnstile?.render` call.
2. The returned cleanup clears `window.__onTurnstileLoad` as its first statement, but only when it is identity-equal to this effect's own `rysuj`. The existing `remove(widgetId)` and `widgetId = undefined` statements keep their order behind it.

The identity check is load bearing. An unconditional clear would introduce the same class of cross-instance bug, inverted: a component that took the fast path and installed nothing would delete the callback of a component still waiting for the loader. It is enforced as its own grep-level acceptance criterion rather than left to reviewer judgement.

## Red Then Green Evidence

Required by the plan, because a regression guard that never went red proves nothing.

RED, run against the pre-fix component (`npx playwright test tests/kontakt.spec.ts -g "nawigacja klientem"`):

```
1) [chromium] > tests/kontakt.spec.ts:256:2 > ... > nawigacja klientem sprząta globalny callback Turnstile (WR-02)

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "undefined"
    Received: "function"

    > 285 |     expect(typCallbacku).toBe('undefined');

  1 failed
```

The failure landed on line 285, the callback assertion, which means the sentinel assertion on line 279 had already passed: the navigation was genuinely client side and the case was measuring the real defect, not a fresh `window`.

GREEN, after the component change:

```
  ✓  14 [chromium] > tests/kontakt.spec.ts:256:2 > ... > nawigacja klientem sprząta globalny callback Turnstile (WR-02) (2.5s)

  33 passed (19.7s)
```

## Shipped Cleanup Ordering

Confirming exactly what landed, in order, inside the returned cleanup function:

```js
if (window.__onTurnstileLoad === rysuj) window.__onTurnstileLoad = undefined;
if (widgetId !== undefined) window.turnstile?.remove(widgetId);
widgetId = undefined;
```

The identity check, not an unconditional clear, is what shipped.

## Verification Results

| Gate | Result |
|------|--------|
| `npm run check` | 4215 files, 0 errors, 0 warnings (proves the `undefined` assignment type-checks against the ambient declaration) |
| `npm run lint` | exits 0, prettier and eslint clean |
| `npm run test:unit` | 168 pass, 0 fail (unchanged, no unit-tested module touched) |
| `npm run build` | exits 0 (run by the Playwright `webServer` command on every suite run) |
| `npx playwright test tests/kontakt.spec.ts tests/rekrutacja.spec.ts` | 33 passed: kontakt 16 (baseline 15, plus the new case), rekrutacja 17/17 |
| `npm run test` (full suite) | 110 passed (baseline 109) |
| Source gate: `grep -c isConnected` | 1, inside `rysuj` before the render call |
| Source gate: `grep -c "__onTurnstileLoad === rysuj"` | 1 |
| Unchanged-contract gate | `git diff` shows no change to `reset()`, the `onToken` prop type, `SITEKEY_TESTOWY`, `HOSTY_TESTOWE`, the render options object, the `svelte:head` block or the `.slot` rule |
| Diff scope | `git diff --name-only` lists only the two planned files; `package.json`, `package-lock.json` and `src/lib/forms/turnstile-global.d.ts` are absent |
| Copy gate | no em dash and no emoji in the diff of either planned file |

## Deviations from Plan

### Auto-fixed Issues

None. No deviation rule fired.

### Plan Figure Corrected

**1. The stated 26-case kontakt baseline is not the real one**
- **Found during:** Task 1 verification
- **Issue:** The plan's acceptance criterion said the kontakt run should pass "with one more case than the 26 baseline for the combined kontakt run". `tests/kontakt.spec.ts` actually held 15 cases before this plan, and Playwright's path filter `tests/kontakt.spec.ts` does not select `tests/kontakt-api.spec.ts` (9 cases), so no invocation produces 26.
- **Resolution:** No file was changed to chase the number. The binding half of the criterion, one more case than baseline, is satisfied: 15 to 16, with rekrutacja unchanged at 17/17 and the full suite at 110 (baseline 109).

### Tooling Note

The `svelte` MCP server's `svelte-autofixer` was requested for the changed component but is not exposed to this executor (the known MCP-stripping behaviour for agents with a restricted tool surface). Compile-level validation was covered instead by `npm run check` (svelte-check, 0/0) and by the pre-commit `svelte-check (types + compiler a11y)` hook, which passed on both commits.

## Human Follow-up (outstanding)

Carried forward unchanged from `04-VERIFICATION.md` and this plan's `<human_followup>`. NOT closed by this plan.

Submit both `/kontakt` and `/rekrutacja` in a real, non-automated browser at the production URL. Confirm the live Turnstile widget renders visibly, is keyboard reachable and passes contrast, that the success panel appears, and that the message arrives in the `devzlobekstromiec@gmail.com` BCC backup. This is also the only way to exercise the `frame-src` CSP directive, which has never been proven in a browser because the dummy test sitekey used by Playwright renders no frame at all.

While doing it, navigate between `/kontakt` and `/rekrutacja` using the header nav (client side, not a reload) and confirm the widget renders correctly on the second page and the browser console shows no duplicate-render error from the Turnstile API. That is the real-widget counterpart of this plan's automated case, and the automated case cannot substitute for it: a managed Turnstile widget refuses to issue a token to any automated browser, headless or headful, confirmed empirically during 04-07.

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at a trust boundary. `T-04-09-02` (token acceptance) is unchanged by construction: the sitekey constants, the host allow-list, the render options object and the `onToken` contract are byte-identical, and acceptance stays a server-side `siteverify` decision. `T-04-09-SC` (npm supply chain) is satisfied: no install occurred and neither `package.json` nor `package-lock.json` appears in the diff.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `f29c3a4` | test | RED: failing case for the stale Turnstile loader callback |
| `2e7a83e` | fix | GREEN: the effect owns the lifetime of everything it installs |

## Self-Check: PASSED
