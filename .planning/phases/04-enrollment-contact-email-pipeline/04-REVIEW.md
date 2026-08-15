---
phase: 04-enrollment-contact-email-pipeline
reviewed: 2026-08-15T16:45:47Z
depth: standard
scope: re-review
scope_note: >-
  Narrowed re-review of the phase 04 gap-closure work only (plans 04-08 and
  04-09, commits 408c337, ba567bd, 2e7a83e, f29c3a4 and their doc commits).
  This file SUPERSEDES the full 38-file phase review written at commit 94ce57c,
  which remains available in git history (`git show 94ce57c:.planning/phases/
  04-enrollment-contact-email-pipeline/04-REVIEW.md`). Findings from that review
  that are not restated here were re-verified as closed (see Regression Verdict)
  or fall outside these five files.
supersedes: 94ce57c
diff_base: a1b95ff216347b59323a488bcc5a17bd46fc5cb0
files_reviewed: 5
files_reviewed_list:
  - src/lib/server/forms/ratelimit.ts
  - src/lib/components/TurnstileWidget.svelte
  - tests/forms.unit.ts
  - tests/kontakt.spec.ts
  - docs/dev-env.md
findings:
  critical: 0
  warning: 5
  info: 6
  total: 11
status: issues_found
---

# Phase 4: Code Review Report (gap-closure re-review)

**Reviewed:** 2026-08-15T16:45:47Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found
**Supersedes:** the 38-file review at commit `94ce57c` (preserved in git history)

## Summary

This is a narrowed re-review of the phase 04 gap-closure work only: the
rate-limiter rewrite (04-08), the Turnstile effect-lifecycle fix (04-09), the
tests written to pin them, and the dev-env doc updated to describe them. The two
form endpoints, `handle.ts`, `mailer.ts`, `validate.ts`, `sanitize.ts` and
`wrangler.jsonc` were read for context only; they are deliberately unchanged and
are not re-reviewed here.

**All three prior findings are genuinely closed.** See the Regression Verdict
below for the evidence. The runtime code as shipped is, to the limit of what I
could prove, correct for the paths the two endpoints actually exercise, which is
why there are **zero Critical findings**. I did not manufacture one.

What I found instead is a consistent pattern: **the fixes are right, the proofs
around them are weaker than the comments claim.** Three of the five warnings are
mutation-verified test gaps, including one where re-introducing the exact CR-01
configuration the code comments warn about leaves all 180 tests green, and one
where swapping the UTC date derivation for a local-time one leaves all 180 tests
green on this project's own timezone. The fourth is that the entire unit suite
that constitutes the CR-01 and WR-01 proof runs in no automated gate at all, and
the doc edited in this very change still says otherwise. The fifth is a
one-line-fixable hole in the module's own stated unconditional fail-open
guarantee, proven by execution.

Two structural notes on the fixes themselves, both positive and both worth
recording because the review focus asked about them specifically:

- The single-clock invariant holds. `teraz` is a required parameter on both key
  builders with no default, it is read exactly once as the seventh parameter
  default of `podLimitem`, and the same instant is passed to both. The hourly and
  daily keys cannot straddle a boundary within one request. The hour-of-epoch
  arithmetic (`Math.floor(teraz / 1000 / OKNO_S)`) is off-by-one free and stays
  well inside double precision at realistic epoch values.
- The Turnstile identity guard is correct for the case it was written for. A
  second widget taking the `window.turnstile` fast path never assigns the global,
  so its cleanup's `window.__onTurnstileLoad === rysuj` comparison is false and it
  cannot clear a first widget's still-pending callback. I traced both component
  teardown/mount orderings on client navigation and neither can cross-clear.

## Regression Verdict on the 94ce57c findings

| Prior finding | Verdict | Evidence |
| --- | --- | --- |
| CR-01 (Critical) rate-limit window defined by `expirationTtl`, so `rl:doba` never expired | **Closed** | The window is now the bucket inside the key (`rl:doba:YYYY-MM-DD`, `rl:<form>:<hex>:<hour-of-epoch>`), `ratelimit.ts:42-50,72`. `expirationTtl` is now cleanup-only at `MNOZNIK_TTL * window`, so a rewrite can no longer move a boundary. Pinned by `forms.unit.ts:462-491` (next UTC date reopens; the second date lands at 1, never 3). See WR-02 and WR-03 for what those pins do **not** cover. |
| WR-01 (Warning) unsalted SHA-256 fallback on a missing/blank salt | **Closed** | `ratelimit.ts:128-131` returns true before any key is built. Pinned by `forms.unit.ts:532-550`, including `odczyty` recording that proves KV is never even read, so no unsalted digest can reach KV. Correctly treats a whitespace-only secret as the same misconfiguration. |
| WR-02 (Warning) stale `window.__onTurnstileLoad` closure after unmount | **Closed** | `TurnstileWidget.svelte:99` clears the global under an identity match. The Playwright pin at `kontakt.spec.ts:256-286` genuinely fails against the old code (the old cleanup left a function on `window`, so `typeof` would be `'function'`), and the `__znacznikNawigacji` marker correctly rules out a false pass from a fresh `window`. |

---

## Narrative Findings (AI reviewer)

## Critical Issues

None. The shipped runtime code is correct on every path the two form endpoints
can reach. WR-04 below is the closest thing to a correctness hole and is
unreachable through `+server.ts` as currently written, so it is classified
honestly as a Warning rather than inflated.

## Warnings

### WR-01: The only proof of the CR-01 and WR-01 fixes runs in no automated gate, and the doc updated by this change still says otherwise

**File:** `docs/dev-env.md:43-61`, `package.json:19` (`scripts.test:unit`), `.pre-commit-config.yaml`
**Severity:** WARNING (highest priority of the five)

**Issue:** `tests/forms.unit.ts` is the entire regression proof for both CR-01 and
WR-01. It is executed only by `npm run test:unit`, and that command appears in:

- `docs/dev-env.md` "Everyday commands" table (lines 45-53): **no**. The table
  lists `npm run test` as "Playwright + `@axe-core/playwright` homepage
  acceptance/a11y suite" and stops there.
- `docs/dev-env.md` "Verify-before-commit gate" (lines 55-61): **no**. It reads
  `npm run check && npm run lint && npm run test`.
- `.pre-commit-config.yaml`: **no**. Two hooks, `npm run check` and `npm run lint`.
- CI: **no**. There is no `.github/workflows` directory in the repo.

`playwright.config.ts` uses the default `testMatch`, and `forms.unit.ts` is named
to dodge it deliberately (`forms.unit.ts:6-7`), so `npm run test` will never pick
it up. The net effect is that a future change re-introducing CR-01 or WR-01
passes every gate this project documents and enforces. The regression protection
depends entirely on a human remembering an undocumented extra command.

This is not a new observation: `.planning/phases/03-news-aktualno-ci/03-REVIEW.md:99-105`
raised exactly this for `tests/aktualnosci-reader.unit.ts` and proposed the fix
below. It was not closed then, and phase 04 has now parked a Critical-tier
regression proof behind the same unrun command. `docs/dev-env.md` was edited in
this very gap-closure and still documents a verify gate that does not run it,
which makes the doc actively misleading to the future maintainer it exists for.
The user's own global convention (`npm run check && npm run test:unit && npm run lint`)
also contradicts what this project's doc states.

**Fix:** wire it into the gate that is already documented and enforced, in all
three places.

```jsonc
// package.json
"test": "npm run test:unit && playwright test",
"test:unit": "node --test tests/*.unit.ts",
```

```yaml
# .pre-commit-config.yaml, add a third local hook
      - id: unit
        name: node --test (forms + reader unit suites)
        entry: npm run test:unit
        language: system
        pass_filenames: false
        stages: [pre-commit]
```

and in `docs/dev-env.md`, add a `npm run test:unit` row to the Everyday commands
table describing it as the Node built-in suite covering the form pipeline and the
news reader, so the "always green before committing" block is truthful.

---

### WR-02: The `MNOZNIK_TTL` half of the CR-01 fix is not pinned; restoring the exact defect configuration leaves 180/180 tests green

**File:** `tests/forms.unit.ts:495-506,462-483` (assertions), `src/lib/server/forms/ratelimit.ts:24-29,170-171`
**Severity:** WARNING

**Issue:** Every TTL assertion in the suite is written as `ttl: MNOZNIK_TTL * OKNO_S`
and `ttl: MNOZNIK_TTL * DOBA_S`, importing the multiplier from the module under
test. The assertion is therefore tautological with respect to the multiplier: it
can only detect the multiplier being dropped from the call site, never the
multiplier itself being changed.

Proven by mutation. Setting `MNOZNIK_TTL = 1` in `ratelimit.ts:29` — which makes
`expirationTtl` exactly equal to the window, i.e. precisely the shape the code
comments at lines 24-28 and 163-169 and the doc at `docs/dev-env.md:153-158` call
out as the CR-01 defect — produces:

```
ℹ tests 180
ℹ pass 180
ℹ fail 0
```

(File restored; no source was left modified by this review.)

The bucket-in-key redesign means a `MNOZNIK_TTL` of 1 is no longer a *correctness*
defect the way it was pre-fix, because the window no longer depends on the stored
lifetime. But it does silently reintroduce the sweep hazard the constant's own
docstring exists to prevent: a lifetime equal to the window is restarted by every
accepted write, so a continuously busy hourly key is never swept from KV. The
comment asserts a property no test holds.

**Fix:** assert the *relationship*, not the constant, in at least one case, so the
multiplier's contract is executable:

```ts
test('the stored lifetime outlives the window it sweeps, so a busy key is still reaped', () => {
	assert.ok(MNOZNIK_TTL > 1, 'a lifetime equal to the window is restarted by every write');
	assert.ok(MNOZNIK_TTL * OKNO_S > OKNO_S);
	assert.ok(MNOZNIK_TTL * DOBA_S > DOBA_S);
});
```

---

### WR-03: The UTC-ness of the daily bucket is untested on every machine this project will actually run on

**File:** `tests/forms.unit.ts:368-379`, `src/lib/server/forms/ratelimit.ts:42-44`
**Severity:** WARNING

**Issue:** `kluczDobowy` is the entire daily window. Its correctness rests on
`toISOString()` being UTC. The only pin is `forms.unit.ts:376-379`, which asserts
`kluczDobowy(Date.UTC(2026, 7, 14, 10, 30, 0)) === 'rl:doba:2026-08-14'`. Every
rate-limit instant in the suite (`TERAZ` 10:30 UTC, `+6h` 16:30, `+1h` 11:30,
`+24h` next day 10:30) sits in the middle of a UTC day, so none of them can
distinguish a UTC derivation from a local-time one anywhere between UTC-13 and
UTC+13.

Proven by mutation. Replacing the body of `kluczDobowy` with a local-time
derivation (`d.getFullYear()` / `d.getMonth()+1` / `d.getDate()`) gives:

```
TZ=Europe/Warsaw        → tests 180, pass 180, fail 0
TZ=Pacific/Kiritimati   → tests 180, pass 172, fail 8
```

The suite only goes red at UTC+14. On the project's own timezone, on the
developer's machine, and on the Cloudflare Pages build runtime, a timezone
regression in the daily window ships green. Given that a wrong daily boundary is
the exact class of bug CR-01 was, this is the pin that matters most and it is the
weakest one.

**Fix:** add a case straddling a UTC midnight, which goes red under a local-time
implementation on any machine east of UTC:

```ts
/** 23:30 UTC is already the NEXT calendar day in every timezone east of UTC+1,
 *  so this pair fails on a Polish machine the moment the derivation stops
 *  being UTC. */
test('kluczDobowy stays on the UTC calendar date across a UTC midnight', () => {
	assert.equal(kluczDobowy(Date.UTC(2026, 7, 14, 23, 30, 0)), 'rl:doba:2026-08-14');
	assert.equal(kluczDobowy(Date.UTC(2026, 7, 15, 0, 30, 0)), 'rl:doba:2026-08-15');
});
```

Worth adding the equivalent `podLimitem` case too (a submission at 23:30 UTC and
one at 00:30 UTC must land in different daily counters).

---

### WR-04: `podLimitem` can still reject, contradicting the unconditional fail-open guarantee its own comments state

**File:** `src/lib/server/forms/ratelimit.ts:128,133-134` (guard opens at 156)
**Severity:** WARNING

**Issue:** The module states the guarantee without qualification: "this module
never hashes without a salt, so a misconfigured deployment cannot quietly
downgrade" (lines 8-10) and "Every KV operation is inside the guard deliberately"
(line 136). The second sentence is literally true and also not the whole story:
three statements that can throw sit **outside** the `try` at line 156.

- `sol.trim()` (line 128) throws `TypeError` on a non-string `sol`.
- `await kluczLimitu(...)` (line 133) awaits `crypto.subtle.digest`, whose
  rejection is unguarded.
- `kluczDobowy(teraz)` (line 134) calls `new Date(teraz).toISOString()`, which
  throws `RangeError: Invalid time value` for `NaN` or any `|teraz| > 8.64e15`.

Proven by execution against the shipped module:

```
✖ out of range clock
  AssertionError: Got unwanted rejection.
  Actual message: "Invalid time value"
    at Date.toISOString (<anonymous>)
    at kluczDobowy (src/lib/server/forms/ratelimit.ts:43:46)
    at podLimitem (src/lib/server/forms/ratelimit.ts:134:20)
```

The non-string-salt probe rejects the same way. A rejection here escapes
`obsluz` entirely and becomes the opaque 500 that lines 138-143 exist to prevent,
on **both** forms, with no Polish message the island can map — the exact D-12
failure the comment describes.

**Reachability is currently nil** through the shipped endpoints: both pass
`env.RATE_LIMIT_SALT ?? ''` (always a string) and omit `teraz` entirely (always
`Date.now()`). That is why this is a Warning and not a Blocker. But `podLimitem`
is an exported function whose signature *invites* callers to supply `teraz` (the
test suite already does, 30+ times), the guarantee is written as unconditional,
and the fix is free.

**Fix:** move the guard up two lines so the stated invariant is the enforced one.

```ts
	try {
		const klucz = await kluczLimitu(formularz, ip, sol, teraz);
		const kluczDnia = kluczDobowy(teraz);

		const biezace = licznik(await kv.get(klucz));
		if (biezace >= limit) return false;
		// ... unchanged
	} catch {
		console.warn('ratelimit: operacja KV nieudana, limit nieaktywny dla tego zgloszenia');
		return true;
	}
```

and change the line-128 guard to `if (typeof sol !== 'string' || sol.trim().length === 0)`.
Then add the assertion that makes it executable:

```ts
test('podLimitem never rejects, whatever the clock or the salt shape', async () => {
	const { kv } = stubKV();
	for (const teraz of [Number.NaN, 9e15, -9e15]) {
		await assert.doesNotReject(() => podLimitem(kv, 'kontakt', IP, SOL, 5, 40, teraz));
	}
});
```

---

### WR-05: The WR-02 Playwright pin uses a non-retrying assertion on an asynchronously-completing teardown, and hardcodes an absolute URL past the configured `baseURL`

**File:** `tests/kontakt.spec.ts:273,282-285`
**Severity:** WARNING

**Issue:** Two robustness defects in an otherwise well-constructed test.

1. Lines 282-285 read the global with a one-shot `page.evaluate()` and assert on
   the returned value. `expect(typCallbacku).toBe('undefined')` does **not**
   retry. The value it reads is produced by a Svelte effect teardown that flushes
   in a microtask during client navigation, while `page.waitForURL` resolves on
   the frame URL. The current ordering happens to settle before the CDP round
   trip, but nothing in the test enforces that, so any Svelte or SvelteKit
   flush-ordering change turns a correct implementation into a red test with a
   misleading message. Every other assertion in this file uses auto-retrying
   `expect(locator)` forms.

2. Line 273 hardcodes `page.waitForURL('http://localhost:4173/')` while
   `playwright.config.ts:29` sets `use.baseURL = 'http://localhost:4173'` and every
   other navigation in the file is relative (`page.goto('/kontakt')`). The port
   is now duplicated in `package.json` (`preview:test --port 4173`),
   `playwright.config.ts` (twice) and here; changing it breaks this one test with
   a 30-second timeout rather than a clear failure.

**Fix:**

```ts
		await page.waitForURL('/');
		// ...
		await expect
			.poll(() =>
				page.evaluate(
					() => typeof (window as unknown as Record<string, unknown>).__onTurnstileLoad
				)
			)
			.toBe('undefined');
```

---

## Info

### IN-01: No test exercises the call shape both endpoints actually use

**File:** `tests/forms.unit.ts:413-602`
**Issue:** Every `podLimitem` case passes seven arguments with an explicit
`teraz`. Production calls it with six (`podLimitem(kv, 'kontakt', adres, sol, limit, limit)`),
relying on the `teraz: number = Date.now()` default. That default parameter — the
mechanism the whole single-clock invariant rests on — has zero direct coverage.
**Fix:** one case calling the six-argument shape and asserting the daily write
lands on `` `rl:doba:${new Date().toISOString().slice(0, 10)}` ``, which also
proves the default is evaluated (not passed as a function reference).

### IN-02: The `isConnected` guard is unreachable after the sibling fix in the same commit

**File:** `src/lib/components/TurnstileWidget.svelte:70-74`
**Issue:** The guard's comment describes the loader arriving after unmount and
invoking `rysuj`. The cleanup added twenty lines below (line 99) makes that
impossible: the only reference to `rysuj` that survives the component is
`window.__onTurnstileLoad`, and the teardown clears it under an identity match.
The only other invocation is the synchronous fast path at line 91, where the
container is necessarily connected. The guard is harmless defence-in-depth
against a third-party script, but its stated rationale is no longer true and a
future reader will trust it.

Related, and worth recording rather than fixing: the global-callback bridge is
single-slot by design, so two `TurnstileWidget` instances mounting on one page
before the loader arrives would leave the first permanently unrendered. Not
currently reachable — `/kontakt` mounts one `KontaktForm` and `/rekrutacja` one
`ZgloszenieForm`, one widget each — but it is a latent constraint on ever putting
both forms on a single route.

**Fix:** restate the comment as defence-in-depth against unspecified loader
behaviour rather than as a described failure mode, or note that the cleanup at
line 99 is the primary defence and this is the backstop.

### IN-03: Both ceilings are fixed-window, so a short span across a boundary admits twice the documented number

**File:** `src/lib/server/forms/ratelimit.ts:81-91`, `docs/dev-env.md:108,152-160`
**Issue:** The bucket-in-key design (correctly) makes the window a fixed window.
A client can therefore send 5 at 10:59 UTC and 5 more at 11:00 UTC — 10 in about
two minutes against a stated "5/hour/client" — and the site can send 40 at
23:59 UTC and 40 at 00:00 UTC against a stated "40/day sitewide". The 80-message
burst stays under the 100/day Resend budget, so nothing breaks, but the module
comment's "generous headroom" (line 84) is 20 messages at the boundary rather
than 60. This is inherent to fixed windows and is the right trade for an abuse
control; it is only worth recording because the code and the doc both state the
ceilings as though they were rolling. **Fix:** one clause in the `podLimitem`
docstring noting that a boundary-straddling burst can reach 2x either ceiling.

### IN-04: The concurrency comment understates the site-wide counter's undercount

**File:** `src/lib/server/forms/ratelimit.ts:152-155`
**Issue:** "a burst of simultaneous requests can undercount by a slot or two" is
fair for the per-client counter (one client, one colo, read-your-writes). It
understates the site-wide `rl:doba` counter, which is read-modify-written from
every colo the site receives traffic in, against KV's cross-colo propagation
delay. The undercount there is bounded by colo count, not by one or two. Harmless
at this traffic volume and with Turnstile gating first, but the comment is the
justification for the 40/100 headroom and should say what it is actually
justifying. **Fix:** amend the sentence to distinguish the two counters.

### IN-05: Polish comments introduced into a file whose comments are otherwise English

**File:** `src/lib/components/TurnstileWidget.svelte:70-73,94-97`
**Issue:** Both blocks added by 04-09 are in Polish; every other comment in the
file (lines 2-19, 31-45, 50, 53-54, 78-87, 116-122) is in English. The project's
Polish-only rule covers visitor-facing text and the CMS admin UI, not source
comments, so this is a consistency issue rather than a rule violation — but the
file now reads as two authors. **Fix:** pick one language per file; English
matches the surrounding code and the rest of `src/lib/server/forms/`.

### IN-06: `docs/dev-env.md` carries em dashes against the project's stated convention

**File:** `docs/dev-env.md:1,15,20,21,63,191,196,211,214,216`
**Issue:** The project convention recorded in memory is no em dashes anywhere in
source, en dash only inside numeric ranges. Ten lines in this file use `—`. All
ten are **pre-existing and untouched** by the gap-closure diff (the new rows and
paragraphs at lines 89-93 and 143-167 are clean), so this is not a regression
introduced here; it is flagged only because the file is in this review's scope
and a future sweep should catch it. **Fix:** replace with a colon, a comma or a
sentence break during the next edit to this file. No emoji were found in any of
the five files.

---

_Reviewed: 2026-08-15T16:45:47Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Scope: gap-closure re-review (5 files); supersedes the 38-file review at 94ce57c_
