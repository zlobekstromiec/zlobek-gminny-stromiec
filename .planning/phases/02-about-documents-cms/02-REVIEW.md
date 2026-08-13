---
phase: 02-about-documents-cms
reviewed: 2026-08-13T16:44:25Z
depth: standard
files_reviewed: 28
files_reviewed_list:
  - docs/instrukcja-cms.md
  - scripts/cms-sync.mjs
  - src/lib/assets/uploads/README.md
  - src/lib/components/DayPlan.svelte
  - src/lib/components/Recruitment.svelte
  - src/lib/content/day-plan.json
  - src/lib/content/dokumenty/rekrutacja-regulamin.json
  - src/lib/content/dokumenty/rekrutacja-wniosek.json
  - src/lib/content/dokumenty/statut-zlobka.json
  - src/lib/content/o-nas.json
  - src/lib/content/site.ts
  - src/lib/server/dokumenty.ts
  - src/routes/+page.server.ts
  - src/routes/+page.svelte
  - src/routes/dokumenty/+page.server.ts
  - src/routes/dokumenty/+page.svelte
  - src/routes/o-nas/+page.svelte
  - static/admin/admin.css
  - static/admin/config.yml
  - static/admin/index.html
  - static/admin/preboot.js
  - sveltia-cms-auth/.dev.vars.example
  - sveltia-cms-auth/README.md
  - sveltia-cms-auth/src/index.js
  - sveltia-cms-auth/wrangler.toml
  - tests/dokumenty.spec.ts
  - tests/home.spec.ts
  - tests/o-nas.spec.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-13T16:44:25Z
**Depth:** standard
**Files Reviewed:** 28
**Status:** issues_found

## Summary

Reviewed the About / Documents / CMS phase: two prerendered content routes
(`/o-nas`, `/dokumenty`), the shared build-time document resolver, homepage
docs-panel re-sourcing, the self-hosted Sveltia admin bundle (config, preboot,
theme CSS, sync script), the vendored OAuth Worker, and three Playwright
acceptance specs.

Overall the code is disciplined: prerender-only, CSP-scoped, single-source
content, and the a11y/copy constraints are respected. No security-critical
defects found — the public CSP (`script-src 'self'`, verified in
`svelte.config.js`) and the pinned/vendored OAuth Worker close the obvious
attack surfaces. The findings that remain are build-robustness and
intent-vs-implementation gaps that a normal (non-technical) CMS editor can
trip, plus one inaccurate security comment that undersells a real
defense-in-depth reliance.

No structural findings block was provided, so the sections below are entirely
narrative.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: `statSync` on CMS-controlled paths can crash the entire site build

**File:** `src/lib/server/dokumenty.ts:48-53` (`withMeta`)
**Issue:** `readDokumenty()` maps every seed JSON through `withMeta`, which calls
`statSync(join(process.cwd(), 'static', entry.plik))` with no error handling.
Because `prerender = true` is inherited for both `/dokumenty` and the homepage
(`+page.server.ts` re-sources the same resolver), a single entry whose `plik`
does not resolve to a real file on disk throws an uncaught `ENOENT` that fails
the prerender of *both* routes — i.e. the whole deploy. A non-technical editor
can reach this state through normal CMS use: deleting a file from the Sveltia
media library while leaving its document entry, a manual git edit, or any
filename drift between the JSON `plik` and `static/dokumenty/`. The failure is a
cryptic build error the editor cannot self-diagnose or fix.
**Fix:** Guard the stat and degrade gracefully (skip the entry or emit meta
without size) instead of aborting the build:
```ts
function withMeta(entry: DokumentEntry): DokumentWithMeta | null {
	const abs = join(process.cwd(), 'static', entry.plik);
	let bytes: number;
	try {
		bytes = statSync(abs).size;
	} catch {
		console.warn(`dokumenty: missing file for ${entry.nazwa} (${entry.plik}); skipping`);
		return null;
	}
	const typ = (entry.plik.split('.').pop() ?? '').toUpperCase();
	const rozmiar = formatRozmiar(bytes);
	return { ...entry, typ, rozmiar, meta: `${typ} · ${rozmiar} · wersja z ${entry.wersja}` };
}
// then in readDokumenty(): .map(withMeta).filter((d): d is DokumentWithMeta => d !== null)
```

### WR-02: Homepage docs panel is described as a "curated subset" but performs no curation

**File:** `src/routes/+page.server.ts:12-14`; intent stated in
`src/lib/components/Recruitment.svelte:10-14` and `src/lib/content/site.ts:152-155`
**Issue:** The load filters `entry.kategoria === 'rekrutacja'` and returns *all*
matches — there is no limit or explicit selection. The comments repeatedly call
this a "CURATED SUBSET" / "curated two-row subset," and `tests/home.spec.ts:113`
asserts `.doc-row` has exactly count 2. It passes today only because exactly two
`rekrutacja` JSON files exist. The moment an editor adds a third recruitment
document (a normal, expected CMS action), the homepage centrepiece panel
silently grows to three rows and the acceptance test breaks on the next CI run —
with no code change and no editorial awareness. The "cannot drift" guarantee in
the comments does not hold for panel size.
**Fix:** Make the curation explicit so intent is enforced in code, e.g. cap the
subset and document why:
```ts
const docs = readDokumenty()
	.filter((entry) => entry.kategoria === 'rekrutacja')
	.slice(0, 2) // curated homepage subset; full set lives on /dokumenty (D-18)
	.map((entry) => ({ name: entry.nazwa, meta: entry.meta, href: entry.plik }));
```
If the count is genuinely meant to track "all recruitment docs," instead relax
the test assertion and drop the "curated subset" wording — but pick one; the
current code and the stated contract disagree.

### WR-03: `marked.parseInline` output claimed "limited to bold/links" — it is not sanitized

**File:** `src/routes/o-nas/+page.svelte:37-40, 61-62, 88-89, 107-108`
**Issue:** Three fields (`misja`, `kadra_opis`, `obiekt_opis`) are rendered via
`{@html marked.parseInline(...)}`. The `eslint-disable` comments assert the
content is "limited to bold/links." That is false: `marked.parseInline` does not
sanitize — raw inline HTML passes straight through, and link hrefs are not
protocol-filtered (`[x](javascript:...)` becomes a live `javascript:` link). The
Sveltia `buttons: [bold, link]` config only limits the *toolbar*, not what an
editor can type. Actual script execution is blocked by the public CSP
(`script-src 'self'`, confirmed in `svelte.config.js:42` — no `unsafe-inline`,
so inline `onerror`/`javascript:` are inert), so this is not an exploitable XSS
today. But safety rests entirely on that CSP, not on `marked` as the comment
claims, and a rogue/compromised editor account could still inject arbitrary
off-site `<img>`/`<a>` markup into a public municipal page.
**Fix:** Correct the comment to state the real control (CSP), and add the missing
defense-in-depth layer — sanitize the inline HTML (e.g. run the `parseInline`
output through a strict allowlist sanitizer permitting only `strong`/`em`/`a`,
strip non-http(s) hrefs) rather than trusting editor input at the DOM boundary.

### WR-04: OAuth token-exchange failures are swallowed with an empty `catch`

**File:** `sveltia-cms-auth/src/index.js:277-279` (vendored)
**Issue:** The `fetch` to the token endpoint is wrapped in
`try { ... } catch { // }` — a genuinely empty catch. A network/DNS failure is
silently discarded; the flow only recovers because `if (!response)` is checked
afterward, so the editor gets the generic `TOKEN_REQUEST_FAILED` with no server
log to diagnose intermittent GitHub outages. This is vendored/pinned upstream
code (commit `cc7530f`) and Worker observability is enabled
(`wrangler.toml:25-26`), so per scope I am flagging it but not proposing a
stylistic rewrite: if this login path ever needs debugging in production, note
that the underlying fetch error is unrecoverable from logs. No action required
unless you later fork the vendored file.

## Info

### IN-01: Facility gallery `{#each}` keyed by non-unique `alt` text

**File:** `src/routes/o-nas/+page.svelte:111`
**Issue:** The gallery is keyed `(photo.alt)`. Alt text is editor-authored and
not guaranteed unique; two photos with identical alt would collide the keyed
each block. The underlying `plik` basename is the natural stable identity.
**Fix:** Key on the filename instead, e.g. carry `plik` through the `facility`
map and use `(photo.plik)`.

### IN-02: Dead fallback branch in image basename lookup

**File:** `src/routes/o-nas/+page.svelte:33`
**Issue:** `byName[item.plik.split('/').pop() ?? item.plik]` — `String.split('/')`
always returns at least one element, so `.pop()` is never `undefined` and the
`?? item.plik` branch is unreachable. Harmless but misleading.
**Fix:** Drop the `?? item.plik` fallback, or replace with a clearer basename
helper.

### IN-03: `join(process.cwd(), 'static', entry.plik)` does not constrain traversal

**File:** `src/lib/server/dokumenty.ts:51`
**Issue:** `entry.plik` is content-controlled and joined into a filesystem path
with no validation that it stays under `static/`. Only `.size` is read (no
content exposure) and the content is build-time trusted (authenticated org
editors, git-committed), so this is not a live vulnerability — but a value like
`/../../something` would resolve outside the intended directory. Cheap to
harden.
**Fix:** Validate that `plik` begins with `/dokumenty/` (or normalize and assert
the resolved path is within `static/`) before calling `statSync`; reject or skip
otherwise. Pairs naturally with the WR-01 guard.

---

_Reviewed: 2026-08-13T16:44:25Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
