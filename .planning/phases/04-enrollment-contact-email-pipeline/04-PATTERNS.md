# Phase 4: Enrollment, Contact & Email Pipeline - Pattern Map

**Mapped:** 2026-08-14
**Files analyzed:** 22 (16 new, 6 modified)
**Analogs found:** 16 / 22

> Scope note: this codebase has **zero runtime server code today**. Every `.ts` under
> `src/lib/server/` is a build-time resolver, and `src/routes/+layout.ts` sets
> `prerender = true` globally. There is no `+server.ts`, no `<form>`, no `fetch()` to a
> third party, and no secret consumption anywhere. Consequently the *server pipeline*
> files (endpoints, mailer, turnstile, ratelimit) have **no behavioural analog** and must
> follow RESEARCH.md; they still inherit this repo's *module style* (see Shared Pattern D).
> The *UI, content, page-composition and test* files all have exact analogs.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/routes/api/rekrutacja/+server.ts` | route/endpoint | request-response | *(none)* | none - see No Analog Found |
| `src/routes/api/kontakt/+server.ts` | route/endpoint | request-response | `src/routes/api/rekrutacja/+server.ts` (sibling, written first) | intra-phase |
| `src/lib/server/forms/validate.ts` | utility (pure) | transform | `src/lib/server/dokumenty.ts` | style-match |
| `src/lib/server/forms/sanitize.ts` | utility (pure) | transform | `src/lib/server/dokumenty.ts` | style-match |
| `src/lib/server/forms/turnstile.ts` | service | request-response | *(none)* | none |
| `src/lib/server/forms/ratelimit.ts` | service | request-response | *(none)* | none |
| `src/lib/server/forms/mailer.ts` | service | request-response | *(none)* | none |
| `src/lib/server/forms/handle.ts` | service (orchestrator) | request-response | `src/lib/server/dokumenty.ts` (composition style) | partial |
| `src/lib/components/ZgloszenieForm.svelte` | component (island) | event-driven | `src/lib/components/MobileNav.svelte` | role-match (only island) |
| `src/lib/components/KontaktForm.svelte` | component (island) | event-driven | `src/lib/components/MobileNav.svelte` | role-match |
| `src/lib/components/TurnstileWidget.svelte` | component (island piece) | event-driven | `src/lib/components/MobileNav.svelte` | partial |
| `src/lib/components/FormField.svelte` | component (presentational) | - | `src/lib/components/Cta.svelte` | role-match |
| `src/lib/components/ConsentBlock.svelte` | component (presentational) | - | `src/lib/components/Cta.svelte` | role-match |
| `src/lib/components/MapPanel.svelte` | component (presentational) | - | `src/lib/components/ContactAndMap.svelte` (map-col block) | exact |
| `src/lib/components/KryteriaTable.svelte` | component (presentational) | - | `src/lib/components/Recruitment.svelte` | role-match |
| `src/lib/components/FeeBox.svelte` | component (presentational) | - | `src/lib/components/KeyFacts.svelte` / `Recruitment.svelte` info-card | role-match |
| `src/routes/rekrutacja/+page.svelte` | route (page) | - | `src/routes/dokumenty/+page.svelte` | exact |
| `src/routes/rekrutacja/+page.server.ts` | route (load) | file-I/O (build) | `src/routes/dokumenty/+page.server.ts` | exact |
| `src/routes/kontakt/+page.svelte` | route (page) | - | `src/routes/dokumenty/+page.svelte` | exact |
| `src/lib/content/rekrutacja.ts` | content/config | - | `src/lib/content/site.ts` | exact |
| `src/lib/content/site.ts` (MODIFIED) | content/config | - | itself | n/a |
| `svelte.config.js` (MODIFIED) | config | - | itself | n/a |
| `wrangler.jsonc` + `src/app.d.ts` (MODIFIED) | config | - | itself | n/a |
| `tests/rekrutacja.spec.ts`, `tests/kontakt.spec.ts` | test (e2e+axe) | - | `tests/dokumenty.spec.ts` | exact |
| `tests/forms.unit.ts` | test (unit) | - | `tests/aktualnosci-reader.unit.ts` | exact |

---

## Pattern Assignments

### `src/routes/rekrutacja/+page.server.ts` and `src/routes/kontakt/+page.svelte` (route, build-time)

**Analog:** `src/routes/dokumenty/+page.server.ts` (whole file, 11 lines)

```ts
// Build-time load for /dokumenty (DOCS-01). prerender = true is inherited from
// +layout.ts, so this runs once at build (never at runtime): it calls the shared
// server-only resolver to read the seed collection, compute each file's type/size
// meta from disk (D-14), and group entries in the fixed category order with empty
// groups omitted (D-13). The returned data is a plain serializable object.
import type { PageServerLoad } from './$types';
import { groupDokumenty, readDokumenty } from '$lib/server/dokumenty';

export const load: PageServerLoad = () => {
	return { grupy: groupDokumenty(readDokumenty()) };
};
```

**Copy exactly:** the `PageServerLoad` typed arrow export, the `$lib/server/*` import, and
the leading comment that states *why* this is build-time. For `/rekrutacja`, substitute
`readDokumenty().filter((d) => d.kategoria === 'rekrutacja')` - do **not** re-implement
file metadata resolution (RECRUIT-02).

---

### `src/routes/rekrutacja/+page.svelte`, `src/routes/kontakt/+page.svelte` (route, prerendered page)

**Analog:** `src/routes/dokumenty/+page.svelte`

**Imports + props pattern** (lines 1-17):
```svelte
<script lang="ts">
	// Dokumenty page (DOCS-01; 02-UI-SPEC.md /dokumenty composition). Prerendered,
	// zero-JS (inherits prerender = true from +layout.ts) ...
	// Route adds NO extra <main>/h1 beyond the page heading (the layout owns <main>).
	import { FileText } from '@lucide/svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grupy = $derived(data.grupy);
</script>
```

**Seo + page-head pattern** (lines 19-34) - both new pages need this verbatim shape:
```svelte
<Seo
	title="Dokumenty: Publiczny Żłobek w Stromcu"
	description="..."
	canonical="/dokumenty"
/>

<!-- Page header -->
<header class="page-head">
	<div class="inner">
		<h1>Dokumenty</h1>
		<p class="lead">...</p>
	</div>
</header>
```
`Seo` props are typed in `src/lib/components/Seo.svelte:14-26`; `noindex` **defaults to
true** and must stay defaulted (Phase 6 flips it site-wide). Exactly one `h1` per route.

**Alternating band section pattern** (lines 36-64) - use for /rekrutacja's section stack
(status banner -> form -> kryteria -> procedura -> wnioski -> klauzula):
```svelte
<section class="band" class:warm={i % 2 === 1} aria-labelledby="{grupa.kategoria}-heading">
	<div class="inner">
		<h2 id="{grupa.kategoria}-heading">{grupa.naglowek}</h2>
```

**Document row pattern** (lines 42-58) - reuse verbatim for the /rekrutacja wnioski list.
Meta lives **inside** the link (WCAG; asserted by `tests/dokumenty.spec.ts:46-56`):
```svelte
<a class="doc-row" href={dok.plik}>
	<FileText class="doc-icon" size={20} aria-hidden="true" />
	<span class="doc-name">{dok.nazwa}</span>
	<span class="doc-meta">{dok.meta}</span>
</a>
{#if dok.zrodlo_bip}
	<a class="doc-source" href={dok.zrodlo_bip} target="_blank" rel="noopener noreferrer">
		Źródło: BIP<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
	</a>
{/if}
```

**Section container CSS contract** (from `Recruitment.svelte:71-99`, identical in
`ContactAndMap.svelte:75-102`) - copy this exact responsive `.inner` block into every new
section component; do not re-derive spacing:
```css
.recruitment { background: var(--color-surface); padding-block: 48px; }
@media (min-width: 1024px) { .recruitment { padding-block: 80px; } }
.inner { max-width: 72rem; margin-inline: auto; padding-inline: 16px; }
@media (min-width: 768px)  { .inner { padding-inline: 24px; } }
@media (min-width: 1024px) { .inner { padding-inline: 32px; } }
```

---

### `src/lib/components/ZgloszenieForm.svelte`, `KontaktForm.svelte`, `TurnstileWidget.svelte` (island, event-driven)

**Analog:** `src/lib/components/MobileNav.svelte` - the site's ONLY existing hydrated
island. It is the reference for Svelte 5 runes usage, `$effect` cleanup, a11y wiring,
and reduced-motion handling.

**Runes + element-binding pattern** (lines 20-27):
```svelte
	const DRAWER_ID = 'mobile-nav-drawer';
	const DRAWER_MS = 220;

	let open = $state(false);

	let hamburgerEl: HTMLButtonElement | undefined = $state();
	let closeBtnEl: HTMLButtonElement | undefined = $state();
	let dialogEl: HTMLElement | undefined = $state();
```
Use `$state` for `status: 'idle' | 'wysylanie' | 'ok' | 'blad'`, for each field value, and
for `bind:this` on the Turnstile container element (`let widgetEl: HTMLElement | undefined = $state()`).

**`$effect` with teardown** (lines 42-53) - this is the exact shape for mounting the
Turnstile script/widget and calling `turnstile.remove(widgetId)` on destroy:
```svelte
	// While open: lock body scroll and move focus to the close button. On close
	// (effect cleanup): release the scroll lock and restore focus to the hamburger.
	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeBtnEl?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
			hamburgerEl?.focus();
		};
	});
```

**Browser-guard pattern** (lines 30-33) - islands are prerendered, so any `window` access
must be guarded. Turnstile's `window.turnstile` lookup follows this:
```svelte
	/** Slide/fade duration: 0 (instant) when the user prefers reduced motion. */
	function motionMs(): number {
		if (typeof window === 'undefined') return 0;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DRAWER_MS;
	}
```

**a11y attribute wiring** (lines 83-93) - the id-constant + `aria-controls` idiom carries
directly to `aria-describedby` on inputs and to the `aria-live` status region:
```svelte
<button
	bind:this={hamburgerEl}
	type="button"
	class="hamburger"
	aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
	aria-expanded={open}
	aria-controls={DRAWER_ID}
	onclick={openDrawer}
>
```
Note: **native elements only**, no click-divs. Where a static element must take a
handler, the analog uses explicit scoped ignores with a justification comment
(lines 96-101) - follow that convention rather than silencing `svelte-check` broadly.

**Reduced-motion CSS** (lines 230-237) - required on the success/error panel transition:
```css
	@media (prefers-reduced-motion: reduce) {
		.scrim,
		.drawer { transition: none; }
	}
```

---

### `src/lib/components/FormField.svelte`, `ConsentBlock.svelte` (presentational component)

**Analog:** `src/lib/components/Cta.svelte` (the repo's only small, prop-driven,
design-system-primitive component).

**Typed `$props()` with a variant union + Snippet children** (lines 14-26):
```svelte
	type Variant = 'primary' | 'secondary';

	let {
		href,
		variant = 'primary',
		icon = false,
		children
	}: {
		href: string;
		variant?: Variant;
		icon?: boolean;
		children: import('svelte').Snippet;
	} = $props();
```
`FormField` mirrors this: `{ id, label, type = 'text', required = false, error, value = $bindable(), hint }`.

**Design-contract comment header** (lines 1-11) - every design-system component states its
colour/focus rules and cites the UI-SPEC. Reproduce for form controls, citing
`--color-border-strong` (#64748B) for input borders and `--color-danger` (#B91C1C) on
`--color-danger-surface` for errors:
```svelte
	// Colour hard rules (01-UI-SPEC §Color):
	//  • primary: amber fill `accent` with `ink` label ...
	// Focus ring is inherited from the global :focus-visible base (3px focus-ring, 2px
	// offset) in app.css.
```

**Submit-button styling:** do NOT re-derive. `Cta.svelte` lines 37-85 define the primary
button box (`min-height: 44px`, `padding: 12px 24px`, `--radius-pill`, 16px/700 body font,
`box-shadow: 0 3px 0 var(--color-accent-active)`, white label **only** on
`:active`/`:focus-visible`). The submit `<button>` must reproduce that block; `Cta` itself
renders an `<a>` and cannot be reused for a form submit.

**Focus ring:** never restyle it. `src/app.css:85-86` sets it globally:
```css
:focus-visible {
	outline: 3px solid var(--color-focus-ring);
```

---

### `src/lib/components/MapPanel.svelte` (presentational component)

**Analog:** `src/lib/components/ContactAndMap.svelte` - the `.map-col` block is a
purpose-built placeholder that this phase replaces (D-17). Lift it into `MapPanel.svelte`
and swap the panel for the `enhanced:img` snapshot.

**Current markup to replace** (lines 61-69):
```svelte
			<div class="map-col">
				<div class="map-panel">
					<span class="map-title">Mapa dojazdu</span>
					<span class="map-note">Mapa pojawi się wkrótce.</span>
				</div>
				<a class="map-link" href={directionsUrl} target="_blank" rel="noopener noreferrer">
					Wyznacz trasę<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
				</a>
			</div>
```
The stale coords sit at line 14 and carry a PLACEHOLDER comment:
```svelte
	// PLACEHOLDER: coords pending confirmed address (banked in DESIGN-BANK).
	const directionsUrl = 'https://www.openstreetmap.org/directions?to=51.64222%2C21.09111';
```

**New-tab safety pattern** (used at lines 66 and in `dokumenty/+page.svelte:50-57`) -
`target="_blank" rel="noopener noreferrer"` **plus** a `.visually-hidden` Polish suffix.
Mandatory for the "Wyznacz trasę" link and the OSM attribution link.

**Contact-card grid to reuse for /kontakt** (lines 22-59): four `<li class="item">` blocks
(MapPin / Phone / Mail / Clock) each with `item-label` + `item-value|item-link|item-sub`,
all values read from `contact` in `$lib/content/site`. The icon convention is
`size={22} aria-hidden="true" focusable="false"` with `.item :global(.item-icon)` styling
(lines 150-154). `/kontakt` gets its **own** mailto (line 47 pattern); the homepage keeps
exactly one.

**`.visually-hidden` utility** is defined locally per component (lines 252-262) - copy the
block into any new component that needs it:
```css
	.visually-hidden {
		position: absolute;
		width: 1px; height: 1px;
		padding: 0; margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
```

**`enhanced:img` glob resolution** (from `src/routes/o-nas/+page.svelte:14, 22-31`) - the
established way to pull a committed image through the build pipeline:
```svelte
	import type { Picture } from '@sveltejs/enhanced-img';
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
```
For a single fixed map asset a direct `<enhanced:img src="$lib/assets/map/....png?w=800;1200" alt="..."/>`
is simpler and equally valid; the glob is only needed for content-driven filenames.

---

### `src/lib/components/KryteriaTable.svelte`, `FeeBox.svelte` (presentational)

**Analog:** `src/lib/components/Recruitment.svelte`

**Content-driven props + `$props()`** (lines 15-19):
```svelte
	import Cta from './Cta.svelte';
	import { recruitment } from '$lib/content/site';

	type DocRow = { name: string; meta: string; href: string };
	let { docs }: { docs: DocRow[] } = $props();
```
Note the split: **strings come from the content module by import**, **build-resolved data
comes in as props**. `KryteriaTable` imports its rows from the new
`$lib/content/rekrutacja`; the wnioski list arrives as a prop from `+page.server.ts`.

**Keyed each + numbered steps** (lines 37-47) - the shape for the procedura list:
```svelte
					<ol class="steps">
						{#each recruitment.steps as step, i (step.title)}
							<li class="step">
								<span class="step-num" aria-hidden="true">{i + 1}</span>
								<span class="step-text">
									<span class="step-title">{step.title}</span>
									<span class="step-body">{step.body}</span>
								</span>
							</li>
						{/each}
					</ol>
```

**Info-card = FeeBox precedent** (lines 34-35):
```svelte
					<!-- PLACEHOLDER: admission facts inside, see site.ts (v1.2 facts register). -->
					<p class="info-card">{recruitment.infoCard}</p>
```

**Card chrome** (lines 101-115) - the bordered card + tinted head used by the /rekrutacja
status banner and fee box:
```css
	.card { border: 2px solid var(--color-band); border-radius: var(--radius-lg); overflow: hidden; }
	.card-head {
		background: var(--color-band);
		padding: 20px 24px;
		display: flex; flex-wrap: wrap;
		align-items: baseline; justify-content: space-between; gap: 16px;
	}
```

---

### `src/lib/content/rekrutacja.ts` and the `site.ts` sweep (content/config)

**Analog:** `src/lib/content/site.ts` (itself - the sweep target and the template for the
new module).

**Module header + copy rules** (lines 1-5):
```ts
// Single source for homepage facts and recruitment copy (UI-SPEC Amendments v1.1/v1.2).
// ... PLACEHOLDER convention (Phase 6 pre-launch grep gate)
// extends to `// PLACEHOLDER:` line comments in this module.
// Copy rules (v1.2 §8): no emoji, no em dashes; en dash only inside numeric ranges.
```

**PLACEHOLDER / FINAL marking convention** (lines 22-34) - every swept field either loses
its PLACEHOLDER (fact confirmed by `dane-bip-zlobek-stromiec.md` `[BIP]`) or keeps it with
a *new* reason. Note `email` is explicitly marked FINAL - leave it (D-07):
```ts
export const contact = {
	// PLACEHOLDER: street address, real value pending written client confirmation.
	addressLines: ['ul. Radomska 5', '26-804 Stromiec'],
	// PLACEHOLDER: phone number, pending written client confirmation.
	phoneDisplay: '48 619 10 25',
	phoneHref: 'tel:+48486191025',
	/** FINAL: confirmed public institutional inbox; do NOT mark placeholder. */
	email: 'zlobek@ugstromiec.pl',
	...
} as const;
```
Sweep targets located: `addressLines` L24 (-> ul. Radomska 72), `phoneDisplay`/`phoneHref`
L26-27 (-> 510-094-051, with the D-08 launch-gate comment), `keyFacts[0].value` L51
(age range), `keyFacts[2]` L55-61 (1 500 zł + ZUS suffix, wyżywienie 20 zł),
`recruitmentOpen` L16 (-> `false`), `recruitment.infoCard` L129-130, and
`recruitment.steps[1]` L140-141 (the factually wrong e-mail/ePUAP step).

**Derived-strings switch** (lines 110-127) - `closedStrings` already exists and takes over
automatically on the flip. Review its wording against the regulamin (D-06); do **not**
introduce a second boolean or a date comparison:
```ts
/** Recruitment window switch, flipped by a human, never a date comparison ... */
export const recruitmentOpen = true;
...
/** Derived once here; components import `recruitment`, never plumb the boolean. */
export const recruitment = {
	...(recruitmentOpen ? openStrings : closedStrings),
```

**Typed content collections** (lines 36-64) - `rekrutacja.ts` should export exported
`type` + typed `const` arrays in this style (`export type KeyFact = {...}` /
`export const keyFacts: KeyFact[] = [...]`), with `as const` on object singletons.

---

### `src/lib/server/forms/validate.ts`, `sanitize.ts`, `handle.ts` (pure utility / orchestrator)

**Analog:** `src/lib/server/dokumenty.ts` - style-match only (its data flow is build-time
file I/O, not request-response), but it is the repo's reference for server-module shape.

**Types-first, exported interfaces** (lines 10-31):
```ts
export type Kategoria = 'rekrutacja' | 'statut' | 'rodo';

export interface DokumentEntry { nazwa: string; kategoria: Kategoria; plik: string; ... }
export interface DokumentWithMeta extends DokumentEntry { typ: string; rozmiar: string; meta: string; }
```
Mirror this for `FormResult` / `ZgloszenieInput` / `KontaktInput`. The `FormResult`
discriminated union in RESEARCH.md §Pattern 2 is the contract; export it from a module the
island can import (type-only import keeps it out of the client bundle).

**Module-level constant tables** (lines 33-40) - the precedent for the mailer's hard-coded
`FROM`/`TO`/`BCC` constants and for the validator's length caps:
```ts
// Fixed order + Polish headings. The RODO group stays dormant (D-13): it only
// appears once it holds at least one document (Phase 4).
const KOLEJNOSC: Kategoria[] = ['rekrutacja', 'statut', 'rodo'];
const NAGLOWEK: Record<Kategoria, string> = { rekrutacja: 'Rekrutacja', ... };
```

**Reject-don't-repair validation, with the reason in a comment** (lines 48-66) - exactly
the disposition the e-mail/header-injection sanitizer needs:
```ts
function withMeta(entry: DokumentEntry): DokumentWithMeta | null {
	// `plik` is CMS-controlled content. Require the canonical /dokumenty/ prefix
	// and forbid traversal segments so the join below can never resolve outside
	// static/ (defense-in-depth; only .size is ever read).
	if (!entry.plik.startsWith('/dokumenty/') || entry.plik.includes('..')) {
		console.warn(`dokumenty: invalid plik path for "${entry.nazwa}" (${entry.plik}); skipping`);
		return null;
	}
```
**Divergence required:** this analog logs the offending value. The form modules must
**never** log a field value or a request body (C-03, RODO). Log a code, or nothing.

**Small pure exported functions with doc comments** (lines 77-97) - `readDokumenty()` /
`groupDokumenty()` are separately exported and independently testable. `validate.ts` and
`sanitize.ts` must follow this so `tests/forms.unit.ts` can import them directly.

---

### `tests/rekrutacja.spec.ts`, `tests/kontakt.spec.ts` (test, e2e + axe)

**Analog:** `tests/dokumenty.spec.ts` (whole file, 80 lines)

**Header + standing rule** (lines 1-19):
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Dokumenty acceptance test: encodes DOCS-01 ... plus the WCAG 2.1 AA baseline
 * (SITE-04) for the /dokumenty route.
 *
 * Contract highlights (02-UI-SPEC.md /dokumenty composition, 02-02-PLAN.md):
 * - ...
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved UI-SPEC
 * amendment.
 */
```

**Suite shape - status, single h1, role locators, axe** (lines 21-79):
```ts
test.describe('Dokumenty: DOCS-01 acceptance', () => {
	test('strona /dokumenty odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/dokumenty');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Dokumenty', async ({ page }) => {
		await page.goto('/dokumenty');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dokumenty');
	});
	...
	test('brak naruszeń WCAG 2.1 AA (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/dokumenty');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
```
Test names are **Polish**; each test re-navigates; the axe test is always last.

**Link-integrity loop** (lines 58-71) - reuse for the /rekrutacja wnioski rows:
```ts
		const docLinks = page.locator('a.doc-row');
		const count = await docLinks.count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			const href = await docLinks.nth(i).getAttribute('href');
			expect(href).toMatch(/^\/dokumenty\//);
			const res = await page.request.get(href!);
			expect(res.status()).toBe(200);
		}
```
`page.request.post('/api/kontakt', ...)` follows the same `page.request` idiom for
asserting the endpoint's status codes (400/429/502, never 200-on-failure).

**Lockstep updates required in `tests/home.spec.ts`:** L103 (`10 mies. – 3 lata`), L126
(`Nabór na rok 2026/2027 trwa`), L128-129 (curated doc subset). Update to the new correct
values; do not loosen matchers (RESEARCH Pitfall 6).

---

### `tests/forms.unit.ts` (test, unit)

**Analog:** `tests/aktualnosci-reader.unit.ts`

**Header + node:test imports** (lines 1-12):
```ts
// Reader-resilience unit test (WR-02 proof). Pins the type guards in
// src/lib/server/aktualnosci.ts so that removing either the typeof guard or the
// day-range check turns this suite red. Uses Node's built-in runner (no new
// dependency): `node --test` strips types natively on the pinned Node 22.23.2.
// Intentionally named *.unit.ts so Playwright's spec|test matcher never collects it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseData, postFromEntry } from '../src/lib/server/aktualnosci.ts';
import type { PostEntry } from '../src/lib/server/aktualnosci.ts';
```
Note the **`.ts` extension in the relative import** - required by `node --test` type
stripping. Name the file `forms.unit.ts` (not `.spec.ts`) so Playwright ignores it.

**Assertion style** (lines 40-58) - one behaviour per `test()`, English names, flat asserts:
```ts
test('parseData returns null for a non-string argument (undefined)', () => {
	assert.equal(parseData(undefined), null);
});
test('parseData rejects an out-of-range month', () => {
	assert.equal(parseData('2026-13-01'), null);
});
```
The malformed-input cast helper (lines 36-38) is the pattern for feeding a hostile payload
(CRLF in an e-mail, oversized body) into a typed validator without weakening the type.

**Update `package.json`:** `"test:unit"` currently names one file
(`node --test tests/aktualnosci-reader.unit.ts`) - widen it to `tests/*.unit.ts`.

---

## Shared Patterns

### A. Prerender opt-out (the ONE architectural change this phase makes)
**Source:** `src/routes/+layout.ts` (whole file)
**Apply to:** both `+server.ts` endpoints only
```ts
// Static-first: every content route prerenders to static HTML at build time.
// Set once here so all Phase 1 routes inherit it (no +server.ts, no
// prerender = false anywhere this phase).
export const prerender = true;
```
The comment's parenthetical becomes false this phase - update it. Each endpoint must carry
`export const prerender = false;` or the crawler will try to render a POST-only route and
fail the build.

### B. Known-future-route tolerance (must be edited, or the build stays wrong)
**Source:** `svelte.config.js:9-22`
**Apply to:** `svelte.config.js`
```js
const KNOWN_FUTURE_ROUTES = [
	'/rekrutacja',
	// '/dokumenty' is now a real prerendered route (Plan 02-02), so the crawler enforces it.
	'/kontakt',
	'/cennik',
	'/galeria',
	'/dojazd'
];
```
Remove `'/rekrutacja'` and `'/kontakt'`, leaving a comment in the established style
(see the `/dokumenty` and `/aktualnosci` precedents in the same array). `/cennik`,
`/galeria`, `/dojazd` stay.

### C. CSP extension (Turnstile)
**Source:** `svelte.config.js:39-51`
**Apply to:** `svelte.config.js` only - never `_headers` (the comment explains why)
```js
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'img-src': ['self', 'data:'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'object-src': ['none']
			}
		},
```
Add `challenges.cloudflare.com` to `script-src` and `frame-src`, and add a **new**
`connect-src: ['self', 'challenges.cloudflare.com']` (it does not exist, so it currently
falls back to `default-src: 'self'` and would block the widget). The `_headers`
`/admin/*` policy is a separate Phase 2 artifact - do not touch it.

### D. Server-module conventions
**Source:** `src/lib/server/dokumenty.ts:1-8`
**Apply to:** every file under `src/lib/server/forms/`
```ts
// Shared build-time document resolver (DOCS-01; 02-RESEARCH.md Code Examples,
// 02-PATTERNS.md dokumenty route). Server-only: ...
// Kept free of Svelte/UI concerns so it can be reused by both /dokumenty and the
// homepage docs panel (Plan 03).
```
Every module opens with: what it is, which requirement ID it serves, which planning doc
justifies it, and one durability note. `$lib/server/` is enforced-server-only by SvelteKit,
which is what keeps `RESEND_API_KEY` out of the client bundle.

### E. Platform bindings surface
**Source:** `src/app.d.ts:3-13` - the comment already anticipates this phase
```ts
		interface Platform {
			// Phase 1 consumes no secrets. `Env` is generated by `wrangler types`
			// from wrangler.jsonc (empty now). Phase 4 adds RESEND_API_KEY and
			// TURNSTILE_SECRET_KEY as Cloudflare bindings → they surface here.
			env: Env;
			ctx: ExecutionContext;
			...
		}
```
`wrangler.jsonc` currently has no `vars`, no `kv_namespaces`, and no secrets. Adding the KV
namespace + declaring the secrets there is what makes `platform.env.X` typed. Because
`npm run check` and `npm run build` both run `wrangler types --check` first, an invalid
`wrangler.jsonc` breaks both - update it and regenerate (`npm run gen`) in the same task.
Update the app.d.ts comment from "Phase 4 adds" to past tense.

### F. Polish copy + no-em-dash discipline
**Source:** `src/lib/content/site.ts:5-11`
All user-visible strings are Polish; the sole em-dash exemption is the byte-exempt
`coreMessage`. New long prose (the klauzula informacyjna) is the highest-risk surface -
`grep -n '—' src/` after authoring.

---

## No Analog Found

Files with no close match in the codebase. The planner must use RESEARCH.md's
§Code Examples and §Architecture Patterns as the source, and Shared Pattern D for style.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/routes/api/rekrutacja/+server.ts` | route/endpoint | request-response | No `+server.ts` exists anywhere; the whole site is prerendered (`+layout.ts`). First dynamic route in the project. Use RESEARCH §Pattern 1 + 2. |
| `src/routes/api/kontakt/+server.ts` | route/endpoint | request-response | Same. Plan it as a thin second caller of the shared `handle.ts` so the two endpoints stay symmetric. |
| `src/lib/server/forms/turnstile.ts` | service | request-response | No outbound `fetch` to a third party exists in the repo. Use RESEARCH §Code Examples 3 (`siteverify`, mandatory, `idempotency_key`). |
| `src/lib/server/forms/mailer.ts` | service | request-response | No email code, no Resend, no secret consumption anywhere. Use RESEARCH §Code Examples 4; hard-code `from`/`to`/`bcc` as module consts. |
| `src/lib/server/forms/ratelimit.ts` | service | request-response | No KV, no `crypto.subtle`, no runtime persistence of any kind exists. Use RESEARCH §Pattern 4 verbatim. |
| Turnstile widget lifecycle (inside `TurnstileWidget.svelte`) | component | event-driven | `MobileNav.svelte` supplies the runes/`$effect`/a11y idiom but no third-party-script-loading precedent. Use RESEARCH §Code Examples 1 + Pitfall 4 (reset-on-failure). |
| `.dev.vars` / Cloudflare Pages secrets | config | - | No secrets exist yet; `.dev.vars` is not present. Use RESEARCH §Pitfall 5 (Cloudflare dummy Turnstile keys) for the Playwright path. |

---

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/components/`, `src/lib/server/`,
`src/lib/content/`, `tests/`, plus root config (`svelte.config.js`, `wrangler.jsonc`,
`package.json`, `src/app.d.ts`, `src/app.css`)
**Files scanned:** 70 enumerated, 14 read
**Pattern extraction date:** 2026-08-14
