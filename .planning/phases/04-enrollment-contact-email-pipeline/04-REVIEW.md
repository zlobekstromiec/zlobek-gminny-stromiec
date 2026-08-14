---
phase: 04-enrollment-contact-email-pipeline
reviewed: 2026-08-14T20:20:49Z
depth: standard
files_reviewed: 38
files_reviewed_list:
  - .claude/CLAUDE.md
  - docs/dev-env.md
  - scripts/make-map.mjs
  - src/app.d.ts
  - src/lib/components/ConsentBlock.svelte
  - src/lib/components/ContactAndMap.svelte
  - src/lib/components/FeeBox.svelte
  - src/lib/components/FormField.svelte
  - src/lib/components/KontaktForm.svelte
  - src/lib/components/KryteriaTable.svelte
  - src/lib/components/MapPanel.svelte
  - src/lib/components/Recruitment.svelte
  - src/lib/components/TurnstileWidget.svelte
  - src/lib/components/ZgloszenieForm.svelte
  - src/lib/content/forms.ts
  - src/lib/content/rekrutacja.ts
  - src/lib/content/site.ts
  - src/lib/forms/turnstile-global.d.ts
  - src/lib/forms/types.ts
  - src/lib/server/forms/handle.ts
  - src/lib/server/forms/mailer.ts
  - src/lib/server/forms/ratelimit.ts
  - src/lib/server/forms/sanitize.ts
  - src/lib/server/forms/turnstile.ts
  - src/lib/server/forms/validate.ts
  - src/routes/api/kontakt/+server.ts
  - src/routes/api/rekrutacja/+server.ts
  - src/routes/kontakt/+page.svelte
  - src/routes/rekrutacja/+page.server.ts
  - src/routes/rekrutacja/+page.svelte
  - static/sitemap.xml
  - tests/forms-copy.unit.ts
  - tests/forms.unit.ts
  - tests/home.spec.ts
  - tests/kontakt-api.spec.ts
  - tests/kontakt.spec.ts
  - tests/rekrutacja-api.spec.ts
  - tests/rekrutacja.spec.ts
findings:
  critical: 1
  warning: 4
  info: 6
  total: 11
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-08-14T20:20:49Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Reviewed the full enrollment/contact email pipeline: the shared form orchestrator (`obsluz`), sanitizers, validators, Turnstile siteverify, KV rate limiter, Resend mailer, the two thin endpoints, the three form islands (KontaktForm, ZgloszenieForm, TurnstileWidget) and their shared primitives, content modules, both routes, the map tooling, and the unit + Playwright suites.

The security architecture is strong and consistently enforced: reply-to is the only request-derived header value and it is rejected (never repaired) on any header-structural character; from/to/bcc/subject are module constants unreachable from a request; validators whitelist fields as explicit object literals; consent is a strict `=== true`; Turnstile fails closed; the rate limiter's documented fail-open degrade is respected as ground truth; RODO no-storage/no-logging is honoured everywhere except deliberate, non-personal diagnostics. The unit suite genuinely pins these properties.

The findings that remain are real. The one Critical is a logic error in the rate limiter's window mechanics: because `expirationTtl` is refreshed on every write, the "daily" and "hourly" counters never reset while traffic continues, so under sustained legitimate traffic the site-wide counter monotonically accumulates across days until it hits 40 and then blocks BOTH forms for real parents for up to 24 hours, cyclically. The Warnings cover a silently-unsalted rate-limit hash on misconfiguration (contradicting the published klauzula), a stale global Turnstile onload callback across client-side navigations, and a deliverability risk the submitted docs themselves state (the hard-coded recipient does not exist and bounces 100% of primary-leg mail).

## Critical Issues

### CR-01: "Daily" and "hourly" rate-limit windows never reset under sustained traffic; site-wide lockout of both forms is reachable by legitimate use

**File:** `src/lib/server/forms/ratelimit.ts:95-97`
**Issue:** Every allowed submission executes `kv.put(klucz, ..., { expirationTtl: OKNO_S })` and `kv.put(KLUCZ_DOBOWY, ..., { expirationTtl: DOBA_S })`. Cloudflare KV sets the expiration relative to the time of *that* put, so each write pushes the key's expiry out by a full window. The comment on line 95 ("expirationTtl restarts on every write: a fixed window that self-cleans") describes the opposite of a fixed window — it is an ever-extending window that only expires after a full window of *silence*.

Consequences:

- **Daily site-wide counter (`rl:doba`):** as long as the site receives at least one submission per 24 h, the key never expires and the counter climbs monotonically across days. With e.g. 5 genuine submissions/day (well under the intended 40/day), the counter reaches 40 after ~8 days and then BOTH forms return 429 to every parent until a full 24 h passes with zero successful writes. Blocked requests do not write, so the lockout self-heals after up to 24 h — and then the cycle restarts. During a recruitment-interest peak (the site launches with "Wielkie otwarcie: 14 sierpnia"), this is a realistic, recurring full outage of the only two dynamic features on the site, with nothing stored and nothing logged to reveal it.
- **Per-client counter:** the same mechanics turn "5 per hour" into "5 per streak of submissions less than 1 h apart" — a parent submitting once every 50 minutes is locked out on the 6th attempt even though they never exceeded 5 in any hour. Lower impact, same defect.

This is not the documented fail-open degrade policy (which this review treats as ground truth); it is the opposite failure mode — the limiter incorrectly fails *closed* against legitimate parents due to a window-accounting bug. The unit test at `tests/forms.unit.ts:410-421` pins the flawed behaviour (asserts a fresh `ttl: DOBA_S` on the second write) and must change in lockstep.

**Fix:** Make the windows genuinely fixed by bucketing the key instead of refreshing the TTL:

```ts
// Daily ceiling: a date-bucketed key is a true calendar window.
function kluczDobowy(teraz = new Date()): string {
	return `rl:doba:${teraz.toISOString().slice(0, 10)}`; // rl:doba:2026-08-14
}
// put with a TTL that merely guarantees cleanup (e.g. 2 * DOBA_S);
// the DATE in the key, not the TTL, defines the window.
await kv.put(kluczDobowy(), String(dobowe + 1), { expirationTtl: 2 * DOBA_S });
```

Apply the same pattern to the per-client key (append `Math.floor(Date.now() / 1000 / OKNO_S)` — the hour bucket — to the hashed key, TTL `2 * OKNO_S`). Update the RODO comment (the stored key remains a salted hash plus a time bucket, still no identifying data) and the pinned assertions in `tests/forms.unit.ts`. Note the existing read-modify-write is also non-atomic under KV's eventual consistency; that is acceptable for an abuse control and needs no change, but the comment should stop calling the window "fixed" until this fix lands.

## Warnings

### WR-01: Missing `RATE_LIMIT_SALT` silently degrades to an unsalted IP hash, contradicting the published klauzula

**File:** `src/routes/api/kontakt/+server.ts:52`, `src/routes/api/rekrutacja/+server.ts:62`, `src/lib/server/forms/ratelimit.ts:33-41`
**Issue:** Both endpoints read `const sol = env.RATE_LIMIT_SALT ?? ''`. If the secret is unset (never provisioned, or — per docs/dev-env.md's own warning — set *after* the deployment that needs it), the limiter runs with an empty salt. `kluczLimitu` then stores `SHA-256(":kontakt:" + ip)` truncated to 64 bits: with a known/empty salt the whole IPv4 space (2^32) is trivially enumerable, so the stored key becomes a reversible pseudonym of the client IP. That directly contradicts both the module's RODO header ("one-way salted SHA-256 ... KV therefore holds no identifying data") and the klauzula shipped to parents (`src/lib/content/forms.ts:364`: "skrót (hash) adresu połączenia z dodatkiem tajnego ciągu (soli)"). The endpoints already hard-fail (502) on a missing `RESEND_API_KEY`/`TURNSTILE_SECRET_KEY`, so the machinery for refusing to run misconfigured exists — the salt is the one secret allowed to vanish silently.
**Fix:** Treat an absent/empty salt like an absent KV binding — skip the limiter rather than store unsalted hashes:

```ts
// ratelimit.ts, before hashing:
if (sol.length === 0) {
	console.warn('ratelimit: brak RATE_LIMIT_SALT, limit nieaktywny');
	return true; // same documented degrade as a missing binding
}
```

(Alternatively hard-fail the endpoint like the other two secrets; either way, never hash without a salt.) Add a unit test pinning the empty-salt branch.

### WR-02: TurnstileWidget leaves a stale `window.__onTurnstileLoad` behind; client-side navigation re-executes the loader against a destroyed component

**File:** `src/lib/components/TurnstileWidget.svelte:85-91`
**Issue:** The effect assigns `window.__onTurnstileLoad = rysuj` but the cleanup only removes the widget — it never clears the global. Two consequences:

1. If the component unmounts before `api.js` finishes loading (fast navigation away), the loader later invokes the stale `rysuj`, calling `turnstile.render()` on a detached container and writing `widgetId` into a destroyed component instance — an orphaned widget that the cleanup already ran too early to remove.
2. On client-side navigation between `/kontakt` and `/rekrutacja`, Svelte removes and re-inserts the `<svelte:head>` script tag; a re-inserted script element re-executes, and `api.js` calls the named onload callback again. Because the *new* page's effect took the `window.turnstile` fast path (line 85) and never reassigned the global, the callback invoked is the *previous* page's stale `rysuj` closure — again rendering into a detached node.

Nothing here weakens security (the token contract is owned server-side), but it is a real lifecycle bug: orphaned iframes, possible duplicate-render console errors from the Turnstile API, and a `widgetId` the cleanup can no longer reach.
**Fix:**

```ts
const rysuj = () => {
	if (!cel.isConnected) return; // never render into a detached container
	widgetId = window.turnstile?.render(cel, { /* ... */ });
};
// ...
return () => {
	if (window.__onTurnstileLoad === rysuj) window.__onTurnstileLoad = undefined;
	if (widgetId !== undefined) window.turnstile?.remove(widgetId);
	widgetId = undefined;
};
```

### WR-03: Every submission's primary leg is sent to a recipient documented as nonexistent; 100% bounce rate endangers the fresh sending domain (and the BCC safety net with it)

**File:** `docs/dev-env.md:170-172`, `src/lib/server/forms/mailer.ts:17`
**Issue:** The submitted docs state plainly: "The recipient `zlobek@ugstromiec.pl` is hard-coded and **does not exist yet** (pending Gmina approval), so the `to:` leg bounces and the BCC backup mailbox is currently the only one that receives submissions." Hard-coding the recipient is the reviewed, deliberate design (ground truth) — but knowingly shipping a state where the `to:` leg of *every* message hard-bounces is a distinct operational defect: ESPs (Resend included) monitor bounce rates on new sending domains and will throttle or suspend a domain that bounces 100% of its primary recipients. If that happens, the BCC copy stops being delivered too, and — because nothing is stored and nothing is logged — enrollment enquiries are lost with no record anywhere, which is exactly the failure D-13 exists to prevent.
**Fix:** Until the Gmina mailbox exists, point `TO` at a mailbox that accepts mail (e.g. the current backup address, with the klauzula's processor disclosure updated in the same commit, mirroring the existing D-13 lockstep rule), or gate the launch of the forms on the mailbox's existence. Do not leave a known-bouncing constant as the primary recipient of a no-storage pipeline.

### WR-04: `.claude/CLAUDE.md` still asserts the domain "is NOT purchased yet" while `docs/dev-env.md` in the same change set documents live DNS and a verified sending domain on it

**File:** `.claude/CLAUDE.md` (Accounts & deploy section), `docs/dev-env.md:158-168`
**Issue:** CLAUDE.md: "Domain: `zlobekstromiec.pl` is NOT purchased yet (any doc saying 'owned' is stale)." dev-env.md (changed in this phase): mail is sent from the *verified* `send.zlobekstromiec.pl`, DNS for `zlobekstromiec.pl` is hosted on Cloudflare, SPF/DKIM/DMARC records are enumerated, and the custom domain is attached to the Pages project. Both files are project instructions/onboarding contracts; they now contradict each other on a fact that gates Phase 6 work, and CLAUDE.md's wording actively instructs a reader to treat the *correct* document as stale. This is the exact class of drift the project's own "single source" rules exist to prevent.
**Fix:** Update the CLAUDE.md domain line to the current state (domain owned; DNS on Cloudflare, registration at home.pl; send subdomain verified in Resend `eu-west-1`) or replace it with a pointer to `docs/dev-env.md` as the authority.

## Info

### IN-01: sitemap.xml host does not match the actual Pages origin

**File:** `static/sitemap.xml:11-24`
**Issue:** URLs use `https://zlobek-stromiec.pages.dev/...`, but the live origin per docs/dev-env.md is `https://zlobek-gminny-stromiec.pages.dev`. The file is deliberately unadvertised (noindex, no robots.txt reference), so there is no user impact today, but the placeholder host is wrong even as a placeholder and will surprise whoever does the Phase 6 flip.
**Fix:** Use the real Pages origin now, or the future apex with a clearer `PLACEHOLDER` marker in the comment.

### IN-02: Comment invariant "only module permitted to log" is no longer true

**File:** `src/lib/server/forms/turnstile.ts:5-6`, `src/lib/server/forms/ratelimit.ts:67,102`
**Issue:** turnstile.ts declares itself "the only module under src/lib/server/forms/ permitted to log anything at all", but ratelimit.ts emits two `console.warn` diagnostics (both carefully non-personal, so no RODO issue). A future reviewer relying on the stated invariant would miss the ratelimit log sites.
**Fix:** Amend the turnstile.ts comment to name both permitted log sites (or restate the real invariant: "nothing request-derived is ever logged").

### IN-03: Email/phone patterns and length caps are mirrored in three files

**File:** `src/lib/components/KontaktForm.svelte:62-65`, `src/lib/components/ZgloszenieForm.svelte:81-86`, `src/lib/server/forms/sanitize.ts:14,23-26`
**Issue:** `WZOR_EMAIL`, `WZOR_TELEFON` and the caps (100/254/24/2000) are hand-copied into both islands from the server modules, with only a comment guarding the mirror. `src/lib/forms/types.ts` already proves the pattern of a shared client-safe module; the constants could live there (or a sibling `$lib/forms/limits.ts`), eliminating the drift risk the comments acknowledge.
**Fix:** Export the regexes and caps from a shared non-server module and import them in sanitize.ts and both islands.

### IN-04: home.spec.ts hard-codes a seeded post title that CMS activity will invalidate

**File:** `tests/home.spec.ts:78-82`
**Issue:** The NewsPreview assertion requires the specific post "Wielkie otwarcie żłobka: 14 sierpnia!" (and its slug) to be among the three newest. The moment staff publish three newer posts through the CMS, the acceptance suite goes red with no code change — a test-reliability trap for a suite that is also the pre-commit gate.
**Fix:** Read the expected newest post from the same `aktualnosci` reader the page uses (as every other spec here interpolates from content modules), or assert only the structural contract (1–3 cards, each a link into `/aktualnosci/...`).

### IN-05: 429 rate-limit response carries no Retry-After header

**File:** `src/lib/forms/types.ts:30`, `src/routes/api/kontakt/+server.ts:73`
**Issue:** The `limit` code maps to 429, and the Polish copy tells the parent "spróbuj ponownie za godzinę", but the response omits the standard `Retry-After` header that well-behaved clients and any future monitoring would use.
**Fix:** `return json(wynik, { status, headers: status === 429 ? { 'retry-after': '3600' } : undefined })` (or plumb it through the status table).

### IN-06: `aria-required="false"` is emitted on optional fields

**File:** `src/lib/components/FormField.svelte:101,114`
**Issue:** `aria-required={wymagane}` stringifies to `aria-required="false"` on the optional telefon/wiadomosc controls. Harmless to AT (false is the default), but the component's own header comment holds itself to the standard of never emitting redundant ARIA state (rule 2's spirit), and `aria-invalid` already models the emit-only-when-true pattern.
**Fix:** `aria-required={wymagane ? 'true' : undefined}` (mirroring the `nieprawidlowe` derivation).

---

_Reviewed: 2026-08-14T20:20:49Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
