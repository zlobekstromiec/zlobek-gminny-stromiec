---
phase: 6
slug: accessibility-legal-compliance-performance
status: draft
created: 2026-08-18
source: 06-CONTEXT.md, 06-RESEARCH.md (+ Orchestrator Addendum), 06-UI-SPEC.md, 06-VALIDATION.md
---

# Phase 6: Accessibility, Legal Compliance & Performance - Pattern Map

**Mapped:** 2026-08-18
**Files analyzed:** 24 created/modified (11 new, 13 modified) + 4 hazard sweeps
**Analogs found:** 21 / 24 (1 with no analog, 2 partial)

> This repository is mature. For all but one file in this phase there is a working precedent
> in the tree, and the project's own recorded rule is that a new surface spelled differently
> from its siblings is a worse defect than the thing it was trying to fix. Every excerpt below
> is copied from the tree at the line numbers given, verified 2026-08-18.

---

## File Classification

### New files

| New file | Role | Data flow | Closest analog | Match |
|---|---|---|---|---|
| `src/lib/components/UlatwieniaDostepu.svelte` | component (hydrated island) | event-driven, client-only | `src/lib/components/Lightbox.svelte` | **exact** (5th island; Lightbox is the 4th) |
| `src/lib/motyw.ts` | utility (browser-guarded state restore) | transform / storage I/O | `src/lib/cennik.ts` (module-shape only) | partial |
| `src/lib/zastepcze.ts` | utility (fs walker) | file-I/O, batch | **extracted from** `tests/zastepcze.unit.ts:49-81` | exact (move, not rewrite) |
| `src/lib/content/deklaracja.json` | data store (seed) | file-I/O, panel-written | `src/lib/content/cennik.json` | exact |
| `src/lib/content/polityka.json` | data store (seed) | file-I/O, panel-written | `src/lib/content/cennik.json` | exact |
| `src/lib/server/admin/walidacja/deklaracja.ts` | validator | request-response, transform | `src/lib/server/admin/walidacja/cennik.ts` | exact |
| `src/lib/server/admin/walidacja/polityka.ts` | validator | request-response, transform | `src/lib/server/admin/walidacja/cennik.ts` | exact |
| `src/routes/admin/deklaracja-dostepnosci/+page.server.ts` | route action (server) | CRUD (validate→serialize→commit→redirect) | `src/routes/admin/cennik/+page.server.ts` | exact |
| `src/routes/admin/deklaracja-dostepnosci/+page.svelte` | panel screen | request-response (form POST, no JS) | `src/routes/admin/cennik/+page.svelte` | exact |
| `src/routes/admin/polityka-prywatnosci/+page.server.ts` | route action (server) | CRUD | `src/routes/admin/cennik/+page.server.ts` | exact |
| `src/routes/admin/polityka-prywatnosci/+page.svelte` | panel screen | request-response | `src/routes/admin/cennik/+page.svelte` | exact |
| `scripts/gate-launch.ts` | standalone script | batch, file-I/O | **NONE** (see §No Analog Found) | none |
| `tests/deklaracja-dostepnosci.spec.ts` | test (Playwright + axe) | request-response | `tests/galeria.spec.ts` | exact |
| `tests/kontrast.spec.ts` | test (Playwright + axe) | request-response | `tests/galeria.spec.ts` | role-match |
| `tests/skala-tekstu.spec.ts` (or fold into `responsive.spec.ts`) | test | request-response | `tests/responsive.spec.ts:20-60` | exact |
| `tests/ulatwienia.spec.ts` | test | event-driven | `tests/galeria.spec.ts` (lightbox describe block) | exact |
| `tests/gate-launch.unit.ts` | test (node:test, fixture trees) | file-I/O | `tests/zastepcze.unit.ts` | exact |
| `tests/admin-walidacja-deklaracja.unit.ts` | test (node:test) | transform | `tests/admin-walidacja-cennik.unit.ts` | exact |
| `tests/admin-walidacja-polityka.unit.ts` | test (node:test) | transform | `tests/admin-walidacja-cennik.unit.ts` | exact |

### Modified files

| Modified file | Change | Analog for the change |
|---|---|---|
| `src/app.css` | + `:root` text-scale block, + `html[data-kontrast='wysoki']` Layer 1, + global `.visually-hidden` | existing `@theme` :32-77 and global blocks :85-106 |
| `src/lib/components/TopBar.svelte` | third flex item; 36px→44px; Layer 2 overrides | itself (:20-74, whole file is 74 lines) |
| `src/lib/components/MobileNav.svelte` | D-23 focus fix at :73-79 | `Lightbox.svelte:143-161` (the corrected shape) |
| `src/lib/components/Footer.svelte` | EU strip + 14 Layer 2 rows | `.brand-lockup` white-plate precedent, same file |
| 15 further components + 6 route stylesheets | Layer 2 `:global(html[data-kontrast='wysoki'])` blocks | Research Pattern 2 |
| `src/routes/deklaracja-dostepnosci/+page.svelte` | replaced in full | `src/routes/cennik/+page.svelte` |
| `src/routes/polityka-prywatnosci/+page.svelte` | replaced in full | `src/routes/cennik/+page.svelte` |
| `src/lib/content/panel.ts` | + `SEKCJE_PANELU` entries, + two `KOPIA_*` blocks | `SEKCJE_PANELU` :73-90, `KOPIA_CENNIK` :290 |
| `src/routes/admin/+page.svelte` | 9 → 11 pulpit cards (written out, not looped) | :63 and :86 |
| `tests/fixtures/trasy-panelu.ts` | `TRASY` 17 → 19 | the `w-skrocie` entry, same file |
| `package.json` | `build` gains `npm run test:unit`; new `gate:launch` | existing `build` script |
| `docs/dev-env.md` | documents `gate:launch` | :64 verify gate |
| `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` | append Amendment v1.8 verbatim block | v1.7 append precedent |

---

## Pattern Assignments

### 1. `src/lib/components/UlatwieniaDostepu.svelte` (component, hydrated island)

**Analog: `src/lib/components/Lightbox.svelte`** (355 lines, the 4th island, carries the
post-WR-05 corrected focus cycle). Secondary: `MobileNav.svelte` (the original, still
uncorrected, and itself fixed by Contract 13 in this phase).

**Imports + island header comment shape** (`Lightbox.svelte:1-43`) — a numbered "transposed
from, not re-derived" preamble naming each load-bearing property, then imports:

```ts
import type { Snippet } from 'svelte';
import { fade } from 'svelte/transition';
import X from '@lucide/svelte/icons/x';
```

For the widget the Lucide imports are `accessibility`, `type`, `contrast`, `rotate-ccw`, `x`,
imported one-per-icon from `@lucide/svelte/icons/<name>` (never a barrel import).
**Contract 1 additionally requires the header comment to state the D-04 no-JS deviation in
Polish**, since it breaks the project's standing rule.

**Reduced-motion in JS, not only CSS** (`Lightbox.svelte:75-79`, identical at
`MobileNav.svelte:29-33`):

```ts
/** Fade duration: 0 (instant show and hide) when the visitor prefers reduced motion. */
function czasRuchu(): number {
	if (typeof window === 'undefined') return 0;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CZAS_MS;
}
```
`CZAS_MS = 150` (`Lightbox.svelte:68`) is exactly the value Contract 2 specifies for the widget.

**Focus restore lives in the `$effect` CLEANUP, never in a click handler**
(`Lightbox.svelte:87-96`) — one code path serves all three ways out:

```ts
$effect(() => {
	if (!otwarte) return;
	const poprzedniPrzelew = document.body.style.overflow;
	document.body.style.overflow = 'hidden';
	przyciskZamkniecia?.focus();
	return () => {
		document.body.style.overflow = poprzedniPrzelew;
		wyzwalacz?.focus();
	};
});
```
**Two declared deviations for the widget** (Contract 2 rules 3 and 6): focus on open goes to
the **panel container** (`panelEl?.focus()`), not the close button; and the **body-scroll lock
is dropped entirely** — delete the `overflow` lines, keep the cleanup-restores-focus shape.

**THE CORRECTED FOCUS CYCLE — copy this, not MobileNav's** (`Lightbox.svelte:118-162`):

```ts
function klawisz(zdarzenie: KeyboardEvent) {
	if (zdarzenie.key === 'Escape') {
		zdarzenie.preventDefault();
		zamknij();
		return;
	}
	if (zdarzenie.key !== 'Tab' || !dialogEl) return;

	const fokusowalne = Array.from(
		dialogEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
	).filter((element) => element.tabIndex !== -1);
	if (fokusowalne.length === 0) return;

	const pierwszy = fokusowalne[0];
	const ostatni = fokusowalne[fokusowalne.length - 1];
	const aktywny = document.activeElement;
	const pozycja = aktywny instanceof HTMLElement ? fokusowalne.indexOf(aktywny) : -1;

	if (pozycja === -1) {                                   // <-- the WR-05 fix
		zdarzenie.preventDefault();
		(zdarzenie.shiftKey ? ostatni : pierwszy).focus();
		return;
	}

	if (zdarzenie.shiftKey && aktywny === pierwszy) {
		zdarzenie.preventDefault();
		ostatni.focus();
	} else if (!zdarzenie.shiftKey && aktywny === ostatni) {
		zdarzenie.preventDefault();
		pierwszy.focus();
	}
}
```
**The widget's selector must be widened** to include the native `input[type=radio]` and
`input[type=checkbox]`, which the two existing islands do not contain:
`'a[href], button:not([disabled]), input:not([disabled])'`. Note this interacts with the
`.filter(el => el.tabIndex !== -1)` guard and with Contract 2's rule that the radios are
hidden with `.visually-hidden` and **never `display: none`** (which would remove them from
the cycle entirely and make the trap wrap over two elements instead of five).

**THE DEFECT SIDE BY SIDE — `MobileNav.svelte:55-80`** (what D-23 replaces; the whole
`pozycja === -1` branch above is absent):

```ts
	const first = focusables[0];
	const last = focusables[focusables.length - 1];
	const active = document.activeElement;

	if (event.shiftKey && active === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && active === last) {
		event.preventDefault();
		first.focus();
	}
}
```
The drawer container carries `role="dialog" aria-modal="true" tabindex="-1"`
(`MobileNav.svelte:107-110`), so focus can rest on it, neither branch matches,
`preventDefault()` never fires, and Shift+Tab leaks. **The fix is a mechanical port of the
`pozycja === -1` block, keeping MobileNav's English identifier names** (`first`/`last`/
`active`) rather than renaming — the file is otherwise English-identified throughout and a
half-Polonised handler is a worse read.

**Scrim markup + the two required compiler suppressions** (`Lightbox.svelte:170-186`,
identical at `MobileNav.svelte:95-113`) — without these two comments `npm run check` fails at
pre-commit:

```svelte
{#if otwarte}
	<!-- Scrim: mouse-dismiss convenience. Keyboard users dismiss via the close button (first
	     focus) or Escape, so the static element carries no keyboard handler by design. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="tlo" transition:fade={{ duration: czasRuchu() }} onclick={zamknij}></div>

	<div
		bind:this={dialogEl}
		class="panel"
		role="dialog"
		aria-modal="true"
		aria-labelledby={PODPIS_ID}
		tabindex="-1"
		transition:fade={{ duration: czasRuchu() }}
		onkeydown={klawisz}
	>
```

**Component-scoped reduced-motion second layer** (`MobileNav.svelte:230-237`):

```css
/* Explicit instant show/hide when reduced motion is requested (the JS duration
   is already 0; this also neutralises any inherited transition on the panel). */
@media (prefers-reduced-motion: reduce) {
	.scrim,
	.drawer {
		transition: none;
	}
}
```

**Unique-id-per-instance rune** (`Lightbox.svelte:64-68`) — the widget mounts once so it does
not strictly need it, but Contract 2 pins `id="panel-ulatwien"` as a literal, which is the
simpler form and matches `MobileNav.svelte:20` (`const DRAWER_ID = 'mobile-nav-drawer'`).

---

### 2. `src/lib/components/TopBar.svelte` (component, static → mount point)

**Analog: itself.** 74 lines total, already read in full. Contract 6 changes exactly three
declarations and adds a third flex child.

Current state (`:20-39, :53-69`):

```css
.topbar { background: var(--color-brand-blue); color: #ffffff; }

.inner {
	max-width: 72rem; margin-inline: auto;
	padding-block: 4px;               /* -> 0 (Contract 6) */
	padding-inline: 16px;
	display: flex; flex-wrap: wrap; align-items: center;
	justify-content: space-between; gap: 4px 16px;
	font-family: var(--font-body); font-size: 14px; font-weight: 700;
}

.phone, .hours { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; }

/* White on brand-blue: 5.93:1 (v1.2 pairing table). Underline keeps the
   link affordance beyond colour alone. */
.phone a { display: inline-flex; align-items: center; min-height: 36px;
           color: #ffffff; text-decoration: underline; }
.phone a:hover { color: var(--color-band); }
```

DOM (`:8-18`) — the widget is the third child of `.inner`, after `.hours`:

```svelte
<div class="topbar">
	<div class="inner">
		<!-- PLACEHOLDER: phone number pending written client confirmation (site.ts). -->
		<span class="phone">tel. <a href={contact.phoneHref}>{contact.phoneDisplay}</a></span>
		<!-- PLACEHOLDER: opening hours pending written client confirmation (site.ts). -->
		<span class="hours">Czynne: {contact.hours}</span>
	</div>
</div>
```
`.inner` is **not** `position: relative` today; Contract 2 anchors the panel inside it, so
that declaration is an addition, and `.topbar`/`.inner` gain no `overflow: hidden`.

---

### 3. `src/app.css` (config / token layer)

**Analog: itself.** 106 lines. The two new blocks go **after** `@theme` (:32-77) and beside
the existing global base (:79-106).

Existing shape to match — note the comment-block convention (a ruled banner with HARD RULES),
tab indentation, and lowercase hex:

```css
@theme {
	/* surfaces */
	--color-surface: #ffffff;
	--color-surface-warm: #fbfaf7;
	--color-band: #e0f2fe;

	/* accessible text/UI tier */
	--color-ink: #1e293b;
	--color-muted: #475569;
	--color-brand-blue: #0369a1;
	...
}

/* -----------------------------------------------------------------------------
   Global accessibility base (WCAG 2.1 AA baseline: inherited by every route).
----------------------------------------------------------------------------- */

/* Visible focus ring on every interactive element (WCAG 2.4.7). Never use
   `outline: none` without an equally-visible replacement. */
:focus-visible {
	outline: 3px solid var(--color-focus-ring);
	outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
	*, *::before, *::after {
		animation-duration: 0.01ms !important;
		...
	}
}
```

The 23 `--color-*` tokens in the UI-SPEC Contract 3 flip table were checked against
`:32-77`: **all 23 exist and none is missing.** `--font-*` (:67-68) and `--radius-*` (:71-74)
are correctly excluded.

`.visually-hidden` — copy the clip-rect implementation byte-identically from one of the
existing twenty (`Footer.svelte:274`, `FormField.svelte:276`, `MapPanel.svelte:132`,
`ConsentBlock.svelte:296`, `ZgloszenieForm.svelte:934`, `Lightbox.svelte:244`,
`PowtarzalnaGrupa.svelte:470`, `WierszListy.svelte:183`, `PoleWyboru.svelte:205`, + eleven
under `src/routes/admin/`). Contract 14: **add the global, refactor none of the twenty.**

---

### 4. `src/routes/admin/deklaracja-dostepnosci/+page.server.ts` and `.../polityka-prywatnosci/+page.server.ts`

**Analog: `src/routes/admin/cennik/+page.server.ts`** (165 lines — the newest singleton
screen, 05 Contract 10). The full vertical slice for one store is shown here; the second
screen is the same file with the nouns changed.

**Module header** (:1-36) establishes the five things every panel server file states: the
validate→serialize→save→redirect ordering, why the SHA is read on load, that secrets come from
`platform.env` only, that **nothing logs on any path**, and that the auth boundary is
`src/hooks.server.ts` and not this file.

**Imports** (:37-49):

```ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { CENNIK } from '$lib/cennik';
import { KOPIA_CENNIK, KOPIA_WALIDACJA, KOPIA_ZAPIS } from '$lib/content/panel';
import { POLE_SHA, ZNACZNIK_ZAPISANO, wartosciCennika, type WartosciCennika } from '$lib/pola-strony';
import { serializujJson } from '$lib/server/admin/serializuj';
import { SCIEZKA_CENNIK, walidujCennik } from '$lib/server/admin/walidacja/cennik';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

const ZAKRES = 'cennik';   // commit scope for D-04's `tresc(<zakres>): ...` subject
```

**Result interface** (:56-69) — one flat shape so the page reads one object:

```ts
export interface WynikCennika {
	wartosci: WartosciCennika;
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	konflikt?: boolean;
	sha?: string;
}
```

**`load`** (:89-101) — the SHA-on-load + POST/redirect/GET marker:

```ts
export const load: PageServerLoad = async ({ platform, url }) => {
	return {
		wartosci: wartosciZPliku(),
		sha: await aktualnyShaGlowy(platform?.env),
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};
```

**The named `zapisz` action, whole** (:108-165) — cheapest-first, four branches, 303 redirect:

```ts
export const actions: Actions = {
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		const wartosci = wartosciCennika(dane);          // captured BEFORE validation

		const wynik = walidujCennik(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci, pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikCennika);
		}

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: KOPIA_CENNIK.opisZapisu,
			pliki: [{ sciezka: SCIEZKA_CENNIK, tresc: serializujJson(wynik.dane) }],
			oczekiwanySha: shaZFormularza(dane)
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, { wartosci, pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc, konflikt: true } satisfies WynikCennika);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail is deliberately NOT rendered.
			return fail(500, { wartosci, pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc } satisfies WynikCennika);
		}

		redirect(303, `/admin/cennik?${ZNACZNIK_ZAPISANO}=1`);
	}
};
```
`serializujJson` (`$lib/server/admin/serializuj`) is what produces
`JSON.stringify(dane, null, '\t') + '\n'`. **Both hand-authored seed JSONs must be written in
that exact byte shape** (04.1 D-09) — see `src/lib/content/cennik.json`, tabs + trailing
newline, no `.prettierignore` entry.

---

### 5. `src/lib/server/admin/walidacja/deklaracja.ts` and `.../polityka.ts` (validator)

**Analog: `src/lib/server/admin/walidacja/cennik.ts`** (265 lines).

**The `.ts`-extensioned relative imports are load-bearing** (:36-59) — the unit suite loads
this module under bare `node --test`, where the `$lib` alias does not exist:

```ts
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import { POLE_NAGLOWKA, /* ... */ type ZrodloPol } from '../../../pola-strony.ts';
import { BLAD_ZBYT_DLUGI, flaga, kodBledu, liczbaWZakresie, tekstWymagany, type WynikPol } from './pola.ts';
```

**The exported store path, pinned against the filesystem by the unit suite** (:74-78):

```ts
/** Repository path of the one file this screen writes. Exported and pinned against the
 *  filesystem in the unit suite: a save that wrote a path nothing reads would report
 *  success to the editor, produce a real commit and a real Cloudflare build, and change
 *  nothing a parent can see. That failure is silent in every single layer. */
export const SCIEZKA_CENNIK = 'src/lib/content/cennik.json';
```
→ `SCIEZKA_DEKLARACJA = 'src/lib/content/deklaracja.json'`,
`SCIEZKA_POLITYKA = 'src/lib/content/polityka.json'`.

**Named caps, never inline numbers** (:80-93) — the refusal quotes the cap the server enforced.

**The dane interface is the committed KEY ORDER** (:128-140):

```ts
/** Exactly the shape src/lib/content/cennik.json holds, in the committed KEY ORDER. The
 *  panel serializes THIS object, so the file's byte shape and the validator's output cannot
 *  drift; the unit suite asserts the serialized form byte for byte against the real file. */
export interface CennikDane { placeholder: boolean; stawka: number; /* ... */ }
```

**The required-text reader** (:145-155):

```ts
function czytajZdanie(surowy: unknown, maks: number): { wartosc: string | null; blad?: string } {
	const wartosc = tekstWymagany(surowy, maks);
	if (wartosc !== null) return { wartosc };
	return {
		wartosc: null,
		blad: kodBledu(surowy, wartosc, maks) === BLAD_ZBYT_DLUGI
			? tekstZaDlugi(maks)
			: KOPIA_WALIDACJA.poleBrak
	};
}
```

**Every field read before anything is refused; absent is a FAILURE, never a default**
(:165-246), then **constructed key by key, never spread** (:248-264):

```ts
	if (Object.keys(pola).length > 0 || stawka === null || /* every local */ nieobecnosc.wartosc === null) {
		return { ok: false, pola };
	}
	return {
		ok: true,
		dane: {
			placeholder: flaga(zrodlo.get(POLE_ZASTEPCZA)),
			stawka,
			/* ...in the committed file's key order... */
		}
	};
```
**Deviation for the deklaracja:** it carries THREE per-block `placeholder` flags (koordynator,
architektura, dodatkowe — Contract 10), not one file-level flag. The `flaga()` helper is the
same; call it three times. The nested-boolean shape has a precedent in
`src/lib/content/w-skrocie.json` (`godziny.placeholder`, `miejsca.placeholder`), which
`tests/zastepcze.unit.ts:100-115` already pins by name — **the new nested flags should be
pinned there the same way.**

Dates use `PoleDaty` (three selects, never `<input type="date">`); the field readers for it
live in `walidacja/pola.ts` and are already exercised by `walidacja/nabor.ts`.

---

### 6. `src/routes/admin/*/+page.svelte` (panel screen)

**Analog: `src/routes/admin/cennik/+page.svelte`** (426 lines).

**Imports** (:31-63) — every visible string comes from `$lib/content/panel`, not one is typed:

```ts
import { enhance } from '$app/forms';
import { page } from '$app/state';
import FormField from '$lib/components/FormField.svelte';
import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
import PolePlaceholder from '$lib/components/admin/PolePlaceholder.svelte';
import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
import { KOPIA_CENNIK, KOPIA_LISTY, KOPIA_POWLOKA, KOPIA_ZAPIS, POLA_CENNIK,
         bladWElemencie, obecnieNaStronie, zobaczStrone } from '$lib/content/panel';
import { AKCJA_ZAPISU, POLE_SHA, /* the field-name constants */ } from '$lib/pola-strony';
import { SCIEZKA_STARTOWA } from '$lib/sciezki-panelu';
import type { PageData } from './$types';
import type { WynikCennika } from './+page.server';
```
Additional components the two new screens need: `PoleDaty.svelte` (dates),
`PowtarzalnaGrupa.svelte` (the „Treści niedostępne" cap-8 group),
`PomocFormatowania.svelte` (the native `<details>` formatting help beside each textarea).
All exist under `src/lib/components/admin/`.

**Refused-submission-wins derivation** (:65-71):

```ts
let { data, form }: { data: PageData; form: WynikCennika | null } = $props();

const wartosci = $derived(form?.wartosci ?? data.wartosci);
const pola = $derived(form?.pola ?? {});
const sha = $derived(form?.sha ?? data.sha);

let zapisywanie = $state(false);
```

**The DOM-id + label maps, and why** (:84-106) — identical link texts pointing at different
controls is a WCAG 2.4.4 failure, so the summary line names the field:

```ts
function ident(pole: string): string { return `cennik-${pole}`; }

const ETYKIETY: Record<string, string> = {
	[POLE_STAWKI]: POLA_CENNIK.stawkaEtykieta,
	/* one row per control */
};
```

**Validation summary built by walking the fields in form order** (:116-128):

```ts
const podsumowanie: WpisPodsumowania[] = $derived.by(() =>
	[POLE_STAWKI, POLE_OBNIZKI, /* ...form order... */]
		.filter((pole) => pola[pole] !== undefined)
		.map((pole) => ({ cel: ident(pole), tekst: bladWElemencie(ETYKIETY[pole], pola[pole]) }))
);
```

**Screen skeleton, in order** (:131-200): `PowrotLink` → one `h1` → success `PanelKomunikat`
(driven by `data.zapisano`, a marker on a fresh GET) → error/conflict `PanelKomunikat` with
the linked summary `<ul>` → `<form method="POST" action={AKCJA_ZAPISU} novalidate use:enhance>`
→ hidden `POLE_SHA` input → required-fields note → `<fieldset class="karta">` groups →
`RzedZapisu`.

```svelte
<form method="POST" action={AKCJA_ZAPISU} novalidate
	use:enhance={() => {
		zapisywanie = true;
		return async ({ update }) => {
			await update({ reset: false });   // never resets: a refused save keeps every typed value
			zapisywanie = false;
		};
	}}
>
	{#if sha}<input type="hidden" name={POLE_SHA} value={sha} />{/if}
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_CENNIK.kwotyLegenda}</legend>
```

**The read-only rule for the twelve KLAUZULA blocks (Contract 11)** is already ruled on at
`:16-19` of this same file, and it is the exact sentence to reuse:

```
// NOTHING ON THIS SCREEN IS A GREYED-OUT CONTROL. The read-only line is text plus a
// hint, which is the honest form: a control nobody may type into looks like a control
// somebody forgot to enable, and it is skipped by keyboard navigation with no
// explanation.
```

---

### 7. `src/routes/deklaracja-dostepnosci/+page.svelte` and `/polityka-prywatnosci/+page.svelte` (public page)

**Analog: `src/routes/cennik/+page.svelte`** (401 lines — the newest content route, store +
content-module split, `Seo.svelte`, `<section aria-labelledby>` bands, editorial split at
≥1024px). Secondary: `src/routes/o-nas/+page.svelte` for the already-correct island header
comment.

**Header comment shape** (`cennik/+page.svelte:1-51`): states the composition contract it
implements, the island count, that the prerender flag lives in `+layout.ts` and is
deliberately not restated, that the layout owns `<main>` so the route adds no landmark, the
heading order, and the copy rules. **Both new legal pages owe the equivalent, and per D-07
the island count sentence must now say "one island (the accessibility widget, in the shared
TopBar)" rather than "zero-JS".**

**Imports + Seo adoption** (`cennik/+page.svelte:52-70`):

```ts
import Cta from '$lib/components/Cta.svelte';
import Seo from '$lib/components/Seo.svelte';
import { CENNIK } from '$lib/cennik';
import { CTA, META, NAGLOWEK, SEKCJE, /* ... */ } from '$lib/content/cennik';
```
```svelte
<Seo title={META.tytul} description={META.opis} canonical="/cennik" />
```
`Seo.svelte` (53 lines) defaults `noindex = true` (`:19`) and emits the `<meta name="robots">`
at `:37-39`. Adopting it **deletes both hand-rolled tags** from each stub —
`deklaracja-dostepnosci/+page.svelte:9-12` and the same block in
`polityka-prywatnosci/+page.svelte`. After this, `Seo.svelte:19` is the **only** noindex flip
site (D-20 as corrected).

**Section band** (`cennik/+page.svelte:72-81`):

```svelte
<header class="page-head">
	<div class="inner">
		<h1>{NAGLOWEK.tytul}</h1>
		<p class="lead">{NAGLOWEK.lead}</p>
	</div>
</header>

<section class="band warm" aria-labelledby="oplata-heading">
	<div class="inner uklad">
```

**Code-authored structure / store-authored values** (Research Pattern 3) — the `h2` strings,
their order and the `id="a11y-*"` attributes are code; only leaves come from the store:

```svelte
<section aria-labelledby="naglowek-architektura">
	<h2 id="naglowek-architektura">Dostępność architektoniczna</h2>
	<div id="a11y-architektura">{@html renderPost(dane.architektura)}</div>
</section>
```
`renderPost` / `renderInline` live in `src/lib/markdown.ts:53,99` and are the sanitising
renderer the panel's constrained markdown subset targets.

**What the stub currently is** (`deklaracja-dostepnosci/+page.svelte`, 56 lines, replaced in
full): a self-contained page with `2rem` / `1.125rem` off-scale font sizes at `:41` and `:53`
and a container at `:22-40` whose `max-width: 72rem` + `padding-block: 64px` + the three
gutter breakpoints (16/24/32px) **are the inherited idiom and should be kept**.

---

### 8. `src/lib/zastepcze.ts` (utility) — an EXTRACTION, not a new file

**Analog: `tests/zastepcze.unit.ts:49-81`** — move `plikiTresci()` and `znaczniki()`
verbatim, plus the `KLUCZ` constant and the `Znacznik` interface; leave the three `test()`
blocks behind and have them import.

```ts
const KATALOG_TRESCI = fileURLToPath(new URL('../src/lib/content', import.meta.url));
const KLUCZ = 'placeholder';

interface Znacznik { gdzie: string; wartosc: unknown; }

function plikiTresci(katalog = KATALOG_TRESCI, prefiks = ''): string[] {
	const zebrane: string[] = [];
	for (const wpis of readdirSync(katalog, { withFileTypes: true })) {
		if (wpis.isDirectory()) zebrane.push(...plikiTresci(`${katalog}/${wpis.name}`, `${prefiks}${wpis.name}/`));
		else if (wpis.name.endsWith('.json')) zebrane.push(`${prefiks}${wpis.name}`);
	}
	return zebrane.sort();
}

function znaczniki(wartosc: unknown, gdzie: string, zebrane: Znacznik[] = []): Znacznik[] {
	if (Array.isArray(wartosc)) { /* index into `${gdzie}[${indeks}]` */ }
	if (typeof wartosc !== 'object' || wartosc === null) return zebrane;
	for (const [klucz, element] of Object.entries(wartosc)) {
		if (klucz === KLUCZ) { zebrane.push({ gdzie: `${gdzie}.${klucz}`, wartosc: element }); continue; }
		znaczniki(element, `${gdzie}.${klucz}`, zebrane);
	}
	return zebrane;
}
```
**Two hazards on the move.** (a) `KATALOG_TRESCI` is currently relative to `tests/`; from
`src/lib/` the URL becomes `new URL('./content', import.meta.url)`, and both consumers then
resolve it correctly — but `scripts/gate-launch.ts` runs from a third location, so the
directory should be a **parameter with that default**, not a hard-coded module constant.
(b) `src/lib/zastepcze.ts` imports `node:fs`, which no other `$lib` module outside the
server-only subtree does; it must never be imported by a `.svelte` file or the Worker bundle
breaks. State that in its header, following the reasoning style of `src/lib/cennik.ts:9-15`.

---

### 9. Tests

**Playwright + axe — analog `tests/galeria.spec.ts:1-59`:**

```ts
import { readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * <Surface> acceptance gate (<REQ>; <NN>-UI-SPEC Contract <n>; <NN> D-xx ...;
 * <NN>-VALIDATION rows ...).
 *
 * WHAT THIS FILE IS ACCOUNTABLE TO. ...
 * EVERY VALUE IS INTERPOLATED FROM THE STORE, never retyped. ...
 * Do NOT weaken these assertions to make the suite pass.
 */

function wczytaj<T>(wzgledna: string): T {
	return JSON.parse(readFileSync(new URL(wzgledna, import.meta.url), 'utf8'));
}

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
```
Assertion, uniform everywhere, no `disableRules`, no include/exclude:
```ts
const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
expect(wynik.violations).toEqual([]);
```
The hoisted-`ZNACZNIKI` form is used by six spec files today (`admin-strony:76`,
`admin-dokumenty:55`, `admin-galeria:62`, `admin-w-skrocie:36`, `admin-cennik:64`,
`admin-nabor:41`, `galeria:59`) — **use it, not the inlined block.**
For the HC sweep, Research §Common Pitfalls requires additionally asserting on
`wynik.incomplete` filtered to `color-contrast`, which no existing spec does.

**Overflow / viewport — analog `tests/responsive.spec.ts:20-60`:** `ROUTES` at `:41-49` holds
seven public routes and **is missing `/deklaracja-dostepnosci` and `/polityka-prywatnosci`**;
both new pages and the 130% condition must be added or they inherit zero viewport coverage.

```ts
const ROUTES = ['/', '/o-nas', '/rekrutacja', '/cennik', '/kontakt', '/dokumenty', '/aktualnosci'] as const;

for (const route of ROUTES) {
	for (const viewport of [VIEWPORTS.tablet, VIEWPORTS.desktopSm, VIEWPORTS.desktop, VIEWPORTS.desktopXl]) {
		test(`no horizontal overflow on ${route} at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.goto(route);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow).toBeLessThanOrEqual(1);
		});
	}
}
```

**node:test unit — analogs `tests/zastepcze.unit.ts:27-31` (fs walker, `gate-launch.unit.ts`)
and `tests/admin-walidacja-cennik.unit.ts` (399 lines, the two new validator suites):**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
```
Named `*.unit.ts` so Playwright's spec matcher never collects it; relative imports carry the
`.ts` extension for the type stripper. **Non-vacuity guard is a house rule**
(`zastepcze.unit.ts:88-90`) — a walker that found nothing must fail, not pass:

```ts
assert.ok(INWENTARZ.length > 0, 'nie znaleziono ani jednego znacznika tresci zastepczej');
```
Test names are Polish, ASCII-folded (no diacritics), lower case — see :87, :100, :117.

**`tests/fixtures/trasy-panelu.ts`** — the two new entries go after `w-skrocie` and before
`pomoc`, following the existing commented `w-skrocie` entry which explains exactly why a
pulpit-only screen still owes a row here:

```ts
	// 05-UI-SPEC Contract 11 and 05 D-34. „W skrócie" is reached from a pulpit tile and is
	// deliberately absent from the panel navigation, so it is absent from SCIEZKI_PANELU too.
	// That makes THIS list the only place it can be swept for Polish, ...
	{ nazwa: 'w skrocie', sciezka: '/admin/w-skrocie' },
	{ nazwa: 'pomoc', sciezka: '/admin/pomoc' }
```
**Confirmed: `TRASY` holds exactly 17 entries today** (counted from the array, not by grep).

---

## Shared Patterns

### The five enumeration surfaces a new panel screen must join
**Sources, all verified this session:**
- `src/lib/content/panel.ts:73-90` `SEKCJE_PANELU` — silent degradation if missed. The
  `w-skrocie` entry at :84-87 carries the comment explaining exactly this.
- `src/routes/admin/+page.svelte:63,86` — pulpit cards, **written out not looped**, with the
  reason stated at :8-13 of that file. Two new `<KafelPulpitu>` after „W skrócie".
- `tests/fixtures/trasy-panelu.ts` `TRASY` — 17 → 19. Silent-to-red via
  `tests/admin-enumeracja.spec.ts`.
- `tests/admin-copy.unit.ts:114,243` `EKSPORTY` — `assert.equal(EKSPORTY.length,
  Object.keys(panel).length)`, so every new `KOPIA_*` export must join it. Loud.
- `docs/instrukcja-cms.md` + `tests/instrukcja.unit.ts` — loud.
- **NOT touched:** `panel.ts` `NAWIGACJA` (:44) and `sciezki-panelu.ts` `SCIEZKI_PANELU` —
  both new screens are pulpit-only.

### Component-scoped high-contrast override (Layer 2)
**Source:** Research Pattern 2. **Apply to:** all 15 components + 6 route stylesheets in
UI-SPEC Contract 4.
```svelte
<style>
	.inner { background: var(--color-brand-blue); color: #ffffff; }

	/* Specificity (0,3,1) against the base rule's (0,2,0): wins deterministically,
	   not by source order. */
	:global(html[data-kontrast='wysoki']) .inner {
		background: var(--hc-tlo);
		color: var(--color-ink);
		border-bottom: 2px solid var(--color-ink);
	}
</style>
```
Global rules in `app.css` are **rejected** for Layer 2: `.inner`, `.col` and `.chip` recur
across components and would leak. (`.inner` alone appears in TopBar, Footer, cennik, o-nas,
dokumenty and more.)

### Polish-only copy, sourced from a module
**Source:** `src/lib/content/panel.ts` for the panel, `src/lib/content/cennik.ts` for a public
route. Not one visible string is typed in a `.svelte` file — stated as a rule at
`admin/cennik/+page.svelte:30` and `admin/+page.svelte:21-23`. Copy rules (no emoji, no em
dashes, en dash only in numeric ranges) apply to **code comments and test names too**; every
analog header above restates this.

### Comment-rewording to avoid a self-triggering grep
**Source precedent:** 04-02, restated at `Lightbox.svelte:20-22`, `cennik/+page.svelte:29-32`
and `src/lib/cennik.ts:13-15` — a comment explaining a constraint must not make the grep that
enforces it report a permanent false positive. **This is the pattern D-19 requires applied to
the eight explanatory PLACEHOLDER headers listed below.**

---

## Hazard Inventories (verified against the tree 2026-08-18)

### H1. Hardcoded white — `grep -rn ': #ffffff' src/` finds **16**, not 17

| # | Site | In UI-SPEC Contract 4 register? |
|---|---|---|
| — | `src/app.css:34` `--color-surface: #ffffff` | **NO — and correctly so.** This is the token *declaration*, flipped by Layer 1, not an override site. **This is the source of the count drift: the UI-SPEC's "seventeen" counts it.** |
| 1 | `TopBar.svelte:23` | 4a ✅ |
| 2 | `TopBar.svelte:67` | 4a ✅ |
| 3 | `Footer.svelte:107` | 4c ✅ |
| 4 | `Footer.svelte:168` | 4c ✅ |
| 5 | `Footer.svelte:243` | 4c ✅ |
| 6 | `Footer.svelte:259` | 4c ✅ |
| 7 | `Cta.svelte:78` | 4d ✅ |
| 8 | `NewsCard.svelte:160` (`--icon-fill`) | 4f ✅ |
| 9 | `Lightbox.svelte:299` | 4h ✅ |
| 10 | `Perks.svelte:103` (`--icon-fill`) | 4i ✅ |
| 11 | `KeyFacts.svelte:112` (`--icon-fill`) | 4j ✅ |
| 12 | `KontaktForm.svelte:630` | 4l ✅ |
| 13 | `ZgloszenieForm.svelte:890` | 4l ✅ |
| 14 | `Recruitment.svelte:199` | 4n ✅ |
| 15 | `src/routes/rekrutacja/+page.svelte:388` | 4n ✅ |
| 16 | `ConsentBlock.svelte:168` `border: solid #ffffff` | 4m ✅ — **and it does NOT match `: #ffffff`**, so any executor re-running that grep to build a worklist will miss it |

**Net:** the register is COMPLETE and CORRECT (16/16 real override sites). Only the headline
count "seventeen" is wrong, by one, because it counts the token declaration.
**Plus** `Footer.svelte:264` `border-top: 1px solid rgb(255 255 255 / 0.2)` — a 17th white
site in a different notation, correctly registered in 4c but invisible to both greps.

### H2. Shadow-based affordances — 20 `box-shadow` declarations, 9 without a border fallback

| Kind | Sites |
|---|---|
| **Soft depth, NO border fallback (the 9 the mode must convert)** | `Header.svelte:71-73`, `NewsCard.svelte:88-90`, `NewsCard.svelte:97-99`, `SkipLink.svelte:25-27`, `MobileNav.svelte:184`, `Perks.svelte:91`, `Hero.svelte:201`, `KontaktForm.svelte:411`, `ZgloszenieForm.svelte:554` |
| **3D `0 Npx 0 accent-active` bars (KEPT, they become white)** | `Cta.svelte:63,69,84`, `Header.svelte:197`, `MobileNav.svelte:227`, `KontaktForm.svelte:601,622,635`, `ZgloszenieForm.svelte:861,882,895` |

Nine and eleven, total twenty. **This matches Contract 4 exactly.** Note the UI-SPEC quotes
`NewsCard.svelte:89-90,98-99` and `:84` where the actual declaration keywords are at `:88` and
`:97` (multi-line values) and the border is at `:84` — a one-line offset in the citation, not
a missing site.

### H3. Public `font-size` declarations — **167 across 34 files**, exactly as the UI-SPEC says

Distinct source values, **fourteen**, confirmed:

| Value | Count | Note |
|---|---|---|
| `15px` | 106 | |
| `16px` | 51 | |
| `20px` | 34 | |
| `clamp(1.5rem, 3vw, 1.75rem)` | 30 | the locked h2 clamp |
| `14px` | 22 | |
| `19px` | 11 | |
| `13px` | 10 | |
| `clamp(2rem, 5vw, 2.75rem)` | 9 | the locked h1 clamp |
| `17px` | 8 | |
| `26px` | 2 | |
| `12px` | 2 | the one legalized use |
| `18px` | 1 | |
| `2rem` | 2 | **both on the two legal stubs — deleted with the stubs** |
| `1.125rem` | 2 | **both on the two legal stubs — deleted with the stubs** |

Twelve survive, plus the two clamps = the fourteen `--font-size-*` tokens in Contract 5.
**No unregistered value exists**, so the "a value that is not one of the fourteen is a finding
to report" anti-pattern should never fire — if it does, someone added a size mid-phase.

**The 34 files:** AboutTeaser, ConsentBlock, ContactAndMap, Cta, DayPlan, FallbackPanel,
FeeBox, Footer, FormField, Header, Hero, KeyFacts, KontaktForm, KryteriaTable, Lightbox,
MapPanel, MobileNav, NewsCard, NewsPreview, Perks, Recruitment, SkipLink, TopBar,
ZgloszenieForm (24 components) + `+error.svelte`, `aktualnosci/[slug]`, `aktualnosci`,
`cennik`, `deklaracja-dostepnosci`, `dokumenty`, `kontakt`, `o-nas`, `polityka-prywatnosci`,
`rekrutacja` (10 routes). `src/app.css` itself declares none.
**`FallbackPanel.svelte` and `NewsPreview.svelte` appear in this list but in NO Contract 4
register row** — the plan must confirm they need no HC override (they may inherit fully from
Layer 1), or add them.

### H4. PLACEHOLDER markers — the D-19 matcher `/(?:\/\/|<!--)\s*PLACEHOLDER:/` hits **31 lines**

**Genuine markers, `//` form (9)** — these must make the gate RED:
`src/lib/content/site.ts:53,160,191` · `src/lib/content/cennik.ts:80,87` ·
`src/lib/content/rekrutacja.ts:121` · `src/lib/content/forms.ts:302` ·
`src/lib/components/MapPanel.svelte:26` · `scripts/make-map.mjs:35`

**Genuine markers, `<!--` form (14)** — invisible to D-19's original letter:
`ContactAndMap.svelte:31,51` · `Footer.svelte:25,31` · `Hero.svelte:29,46,54` ·
`TopBar.svelte:10,15` · `Recruitment.svelte:35` · `AboutTeaser.svelte:12` ·
`src/lib/assets/uploads/README.md:22` · `rekrutacja/+page.svelte:77` ·
`polityka-prywatnosci/+page.svelte:16` · `deklaracja-dostepnosci/+page.svelte:16`
(15 with both legal stubs; **the last two are deleted by Contracts 7 and 8 inside this phase**,
leaving 13 — which matches the addendum's count exactly.)

**FALSE POSITIVES — explanatory headers that self-trigger (8), all must be reworded per D-19:**

| File:line | What it is |
|---|---|
| `src/lib/content/site.ts:4` | "extends to `// PLACEHOLDER:` line comments in this module" |
| `src/lib/content/site.ts:64` | "The launch-gate marker that used to be a `// PLACEHOLDER:` line comment here..." |
| `src/lib/content/site.ts:105` | "THE TWO `// PLACEHOLDER:` LINE COMMENTS THAT USED TO STAND HERE..." |
| `src/lib/content/forms.ts:13` | "`// PLACEHOLDER:` line comments in this module." |
| `src/lib/content/cennik.ts:22` | convention header quoting the form |
| `src/lib/content/rekrutacja.ts:25` | convention header quoting the form |
| `src/lib/w-skrocie.ts:81` | "the marker that used to be a `// PLACEHOLDER:` line comment in" |
| `src/routes/admin/w-skrocie/+page.svelte:24` | "The markers it replaces were `// PLACEHOLDER:` line comments in" |

Note `cennik.ts:22` and `rekrutacja.ts:25` each open with `// PLACEHOLDER convention ...`
(no colon) which does **not** match — it is the backticked `// PLACEHOLDER:` later on the
same comment block that does. **This is exactly the 05 D-18 trap, confirmed live: 8 of 31
hits are the gate reading its own documentation.** The rewording precedent is 04-02.

**Also in scope but not `src/`:** `static/sitemap.xml` and the three stub documents under
`static/dokumenty/` (`wniosek-o-przyjecie-dziecka.doc` 96 B, `regulamin-rekrutacji.pdf`,
`statut-zlobka.pdf`) all contain the token; D-20 covers them as checklist items rather than
as comment markers.

**JSON boolean half (D-19b):** `src/lib/content/` holds 5 stores with `placeholder` keys —
`cennik.json` (root, currently `true`), `nabor.json`, `o-nas.json`, `galeria.json`,
`w-skrocie.json` (nested per tile: `godziny.placeholder`, `miejsca.placeholder`), plus the
per-item flags under `aktualnosci/` and `dokumenty/`. The extracted walker enumerates all of
them; the gate asserts each is `false`, which the existing suite deliberately never does
(`zastepcze.unit.ts:16-19`).

### H5. "Prerendered, zero-JS" header comments (D-07) — **4 sites, 3 to rewrite**

| Site | Text | Action |
|---|---|---|
| `src/routes/aktualnosci/+page.svelte:3` | "Prerendered, zero-JS (inherits prerender = true from +layout.ts): the feed" | **rewrite** |
| `src/routes/aktualnosci/[slug]/+page.svelte:3` | "Prerendered, zero-JS (inherits prerender = true from +layout.ts): NO +server.ts," | **rewrite** |
| `src/routes/dokumenty/+page.svelte:2-3` | "Prerendered, / zero-JS (inherits prerender = true from +layout.ts): the grouped entries come" | **rewrite** |
| `src/routes/o-nas/+page.svelte:5-10` | already correct after 05: ":8 THIS PAGE IS NO LONGER ZERO-JS. It carries exactly ONE hydrated island, the gallery" | **island count 1 → 2** |

**Two more the UI-SPEC does not name, found this session:**
- `src/routes/+error.svelte:5` — "Prerender-friendly and zero-JS:" — the 404 page is inside
  the public shell and therefore now carries the widget too. **Rewrite.**
- `src/routes/polityka-prywatnosci/+page.svelte:7` and
  `deklaracja-dostepnosci/+page.svelte:6` — both stubs' header comments; moot, the files are
  replaced in full, but the replacements must not reproduce a zero-JS claim.

`src/routes/cennik/+page.svelte:9-10` says "Static content with ZERO hydrated islands" —
**that is a seventh site and it is a zero-JS claim in different words. Rewrite it too.**
`src/routes/kontakt/+page.svelte` and `/rekrutacja` carry form islands already and need
checking for a similar sentence.

---

## No Analog Found

| File | Role | Data flow | Reason |
|---|---|---|---|
| `scripts/gate-launch.ts` | standalone script | batch / file-I/O | **There is no analog for a standalone Node script in this repository.** `scripts/` holds exactly one file, `make-map.mjs`, which is a one-shot asset generator (`.mjs`, not TypeScript, not wired to an npm script, run by hand). It is not a checklist runner, prints no Polish report and has no exit-code contract. Do not force it as a precedent. The nearest *behavioural* precedent is `tests/zastepcze.unit.ts` (fs walk + inventory print), whose walker is being extracted for exactly this reason (Wave 0), and the nearest *output* precedent is the Polish validation-summary copy in `src/lib/content/panel.ts`. The gate's exit-code and CLI shape must be designed, and D-18 requires it stay out of `build` and out of pre-commit. |
| `src/lib/motyw.ts` | utility | storage I/O | Partial only. No module in `$lib` currently touches `sessionStorage`, `localStorage` or `document.documentElement`; the two existing islands read `window.matchMedia` inside a `typeof window === 'undefined'` guard (`Lightbox.svelte:76-78`), which is the browser-guard idiom to copy, but the module-top-level-side-effect shape has no precedent. |
| High-contrast axe `incomplete` assertion | test | — | No spec in the repo asserts on `results.incomplete`; all 20+ axe call sites assert `violations` only. This is genuinely new. |

---

## Metadata

**Analog search scope:** `src/lib/components/`, `src/lib/components/admin/`, `src/lib/`,
`src/lib/server/admin/`, `src/lib/content/`, `src/routes/`, `src/routes/admin/`, `tests/`,
`tests/fixtures/`, `scripts/`, `package.json`
**Files read in full or in targeted range:** 20
**Hazard sweeps run:** 5 (white literals, box-shadows, font-sizes, PLACEHOLDER both syntaxes,
zero-JS comments)
**Pattern extraction date:** 2026-08-18
