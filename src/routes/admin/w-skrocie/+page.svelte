<script lang="ts">
	// The W skrócie editor (05-UI-SPEC Contract 11, 05 D-32, D-33; and 04.1-UI-SPEC Component
	// Contracts 5, 9 and 10).
	//
	// FOUR FIELDSETS, ONE FORM, ONE „Zapisz", in the order the tiles render on the front page.
	// FIXED ARITY: exactly four tiles, fields only, no add control and no remove control
	// anywhere on this screen. A repeatable group would break the locked `ul`/`li` semantics,
	// the four `.fact-label` nodes and the `repeat(4, 1fr)` desktop grid of 01-UI-SPEC
	// Amendment v1.6 paragraf 3 in one move.
	//
	// TWO OF THE FOUR TILES ARE READ-ONLY AND EACH IS RENDERED AS TEXT, never as a control
	// somebody may not type into. A greyed-out control looks like a control somebody forgot to
	// switch on, and it is skipped by keyboard navigation with no explanation at all. Text,
	// plus a hint, plus a link to the screen that DOES own the value where one exists, is the
	// honest form. This screen therefore renders no such control at all, which
	// tests/admin-w-skrocie.spec.ts asserts as an absence.
	//
	// THE HOURS FIELDSET CARRIES FOUR FIELDS rather than the uniform shape of the others,
	// because the surfaces that render the hours need different fragments (Contract 7). The
	// fixed arity is about the number of TILES, never about every tile carrying the same
	// fields.
	//
	// THE „Treść zastępcza" CHECKBOX IS PER TILE HERE, the first time in this project it is
	// not per file. The markers it replaces were `// PLACEHOLDER:` line comments in
	// src/lib/content/site.ts, and a per-tile boolean puts the launch gate in the hands of the
	// staff member who will actually learn the real opening hours. It renders no
	// visitor-facing badge.
	//
	// WITHOUT JAVASCRIPT THIS SCREEN IS COMPLETE: the form posts, the server validates, the
	// server re-renders with every typed value intact and the refusal linked from the summary.
	// `use:enhance` below is an enhancement that adds a saving label and nothing else.
	//
	// THE PUBLISH-DELAY PANEL IS NOT RENDERED HERE. The panel shell puts it after the content
	// of every screen, so repeating it would show the same promise twice on one page.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed here. The two
	// read-only VALUES come from src/lib/content/site.ts, which is the module the homepage
	// itself renders from, so this screen cannot show an editor something the front page does
	// not say.
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolePlaceholder from '$lib/components/admin/PolePlaceholder.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import { keyFacts } from '$lib/content/site';
	import {
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_W_SKROCIE,
		KOPIA_ZAPIS,
		POLA_W_SKROCIE,
		bladWElemencie
	} from '$lib/content/panel';
	import {
		AKCJA_ZAPISU,
		POLE_DNI_PELNYCH,
		POLE_DNI_SKROTU,
		POLE_DOPISKU,
		POLE_GODZIN,
		POLE_MIEJSC,
		POLE_SHA,
		POLE_WEEKENDU,
		POLE_ZASTEPCZA_GODZIN,
		POLE_ZASTEPCZA_MIEJSC
	} from '$lib/pola-strony';
	import { SCIEZKA_STARTOWA } from '$lib/sciezki-panelu';
	import type { PageData } from './$types';
	import type { WynikWSkrocie } from './+page.server';

	let { data, form }: { data: PageData; form: WynikWSkrocie | null } = $props();

	// The refused submission wins over the committed store, so a refusal, a conflict or a
	// failure hands the editor back what they typed rather than an empty form.
	const wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});
	const sha = $derived(form?.sha ?? data.sha);

	/** Saving state of Contract 9. Only ever true on a hydrated page; the server-rendered
	 *  row is a plain working button. */
	let zapisywanie = $state(false);

	/** Bounds of the number of places. Semantics and a sane spinner range only: the form
	 *  carries `novalidate` precisely so the browser's own English-in-some-locales bubbles
	 *  never appear, and the server refuses an out-of-range value with an authored Polish
	 *  instruction. */
	const MIN_MIEJSC = 0;
	const MAKS_MIEJSC = 9999;

	/** The two tiles this screen does not own, read BY POSITION out of the same array the
	 *  homepage renders. By position rather than by label, for the reason the strip itself is
	 *  now keyed by position: the arity is fixed at four and the order is the contract. */
	const KAFELEK_WIEKU = keyFacts[0];
	const KAFELEK_OPLATY = keyFacts[2];

	/** The DOM id of every control, spelled once so the summary links and the fields cannot
	 *  disagree about a fragment. */
	function ident(pole: string): string {
		return `w-skrocie-${pole}`;
	}

	/** The label of every field, keyed by the name the control posts under, READ from the same
	 *  declarations the fields themselves render so the summary and the form cannot disagree
	 *  about what a field is called. This is the singleton-screen counterpart of the numbered
	 *  legend a repeated group hands to `bladWElemencie`: without it a summary line is the bare
	 *  error message, and the four hours fields share one cap, so one paste too long produces
	 *  four identical „Tekst jest za długi..." links pointing at four different controls. That
	 *  is a WCAG 2.4.4 failure by construction. */
	const ETYKIETY: Record<string, string> = {
		[POLE_GODZIN]: POLA_W_SKROCIE.godzinyEtykieta,
		[POLE_DNI_PELNYCH]: POLA_W_SKROCIE.dniPelneEtykieta,
		[POLE_DNI_SKROTU]: POLA_W_SKROCIE.dniSkrotEtykieta,
		[POLE_WEEKENDU]: POLA_W_SKROCIE.weekendEtykieta,
		[POLE_MIEJSC]: POLA_W_SKROCIE.miejscaEtykieta,
		[POLE_DOPISKU]: POLA_W_SKROCIE.dopisekEtykieta
	};

	interface WpisPodsumowania {
		cel: string;
		tekst: string;
	}

	/** The summary, in the order of the form, with every entry NAMING and linking to the control
	 *  it is about (WCAG 2.4.4). Built by walking the fields rather than by parsing the error
	 *  keys, which is what keeps the order the reading order. */
	const podsumowanie: WpisPodsumowania[] = $derived.by(() =>
		[POLE_GODZIN, POLE_DNI_PELNYCH, POLE_DNI_SKROTU, POLE_WEEKENDU, POLE_MIEJSC, POLE_DOPISKU]
			.filter((pole) => pola[pole] !== undefined)
			.map((pole) => ({ cel: ident(pole), tekst: bladWElemencie(ETYKIETY[pole], pola[pole]) }))
	);
</script>

<!-- 1. Back link. „Wróć do pulpitu", because W skrócie is a singleton with no list, and
     because the pulpit is the only place it is linked from at all (05 D-34). -->
<PowrotLink cel={SCIEZKA_STARTOWA} etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1, followed by the lead that names what an editor can and cannot change
     here, so the two read-only groups below are expected rather than puzzling. -->
<h1 class="naglowek">{KOPIA_W_SKROCIE.naglowek}</h1>
<p class="lead">{KOPIA_W_SKROCIE.lead}</p>

<!-- 3. Save-result region, driven by a marker on a fresh GET so a refresh cannot re-save. -->
{#if data.zapisano}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
			<p>
				<a href="/" target="_blank" rel="noopener noreferrer">
					{KOPIA_W_SKROCIE.zobaczStroneGlowna}<span class="visually-hidden"
						>{KOPIA_POWLOKA.nowaKarta}</span
					>
				</a>
			</p>
		</PanelKomunikat>
	</div>
{/if}

<!-- 4. Validation summary and the two refusal panels. All three are the same surface in the
     same place, because to an editor they are one answer: „this did not happen, and here is
     what to do about it". -->
{#if form?.panelNaglowek}
	<div class="komunikat">
		<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
			<p>{form.panelTresc}</p>
			{#if podsumowanie.length > 0}
				<ul>
					{#each podsumowanie as wpis (wpis.cel)}
						<li><a href="#{wpis.cel}">{wpis.tekst}</a></li>
					{/each}
				</ul>
			{:else if form.konflikt}
				<p><a href={page.url.pathname}>{KOPIA_ZAPIS.konfliktAkcja}</a></p>
			{/if}
		</PanelKomunikat>
	</div>
{/if}

<form
	method="POST"
	action={AKCJA_ZAPISU}
	novalidate
	use:enhance={() => {
		zapisywanie = true;
		return async ({ update }) => {
			// Never resets the form: a refused save has to come back with every typed value
			// still in its control.
			await update({ reset: false });
			zapisywanie = false;
		};
	}}
>
	<!-- The state the form was built from (D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save fail, never make it overwrite more. -->
	{#if sha}
		<input type="hidden" name={POLE_SHA} value={sha} />
	{/if}

	<!-- 5. Required-fields note. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

	<!-- 6a. Kafelek 1: wiek dzieci. READ-ONLY, as text plus a hint. -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_W_SKROCIE.wiekLegenda}</legend>

		<div class="wglad">
			<p class="wglad-wartosc">{KAFELEK_WIEKU.value}</p>
			{#if KAFELEK_WIEKU.suffix}
				<p class="wglad-wartosc">{KAFELEK_WIEKU.suffix}</p>
			{/if}
			<p class="wglad-podpowiedz">{KOPIA_W_SKROCIE.wiekPodpowiedz}</p>
		</div>
	</fieldset>

	<!-- 6b. Kafelek 2: godziny otwarcia. Four fields, because the five surfaces that state
	     the hours each need a different fragment of them (Contract 7). -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_W_SKROCIE.godzinyLegenda}</legend>

		<p class="uwaga">{KOPIA_W_SKROCIE.godzinyUwaga}</p>

		<FormField
			id={ident(POLE_GODZIN)}
			nazwa={POLE_GODZIN}
			etykieta={POLA_W_SKROCIE.godzinyEtykieta}
			podpowiedz={POLA_W_SKROCIE.godzinyPodpowiedz}
			wartosc={wartosci.godziny}
			blad={pola[POLE_GODZIN]}
			wymagane
		/>

		<FormField
			id={ident(POLE_DNI_PELNYCH)}
			nazwa={POLE_DNI_PELNYCH}
			etykieta={POLA_W_SKROCIE.dniPelneEtykieta}
			podpowiedz={POLA_W_SKROCIE.dniPelnePodpowiedz}
			wartosc={wartosci.dniPelne}
			blad={pola[POLE_DNI_PELNYCH]}
			wymagane
		/>

		<FormField
			id={ident(POLE_DNI_SKROTU)}
			nazwa={POLE_DNI_SKROTU}
			etykieta={POLA_W_SKROCIE.dniSkrotEtykieta}
			podpowiedz={POLA_W_SKROCIE.dniSkrotPodpowiedz}
			wartosc={wartosci.dniSkrot}
			blad={pola[POLE_DNI_SKROTU]}
			wymagane
		/>

		<FormField
			id={ident(POLE_WEEKENDU)}
			nazwa={POLE_WEEKENDU}
			etykieta={POLA_W_SKROCIE.weekendEtykieta}
			podpowiedz={POLA_W_SKROCIE.weekendPodpowiedz}
			wartosc={wartosci.weekend}
			blad={pola[POLE_WEEKENDU]}
			wymagane
		/>

		<PolePlaceholder
			id={ident(POLE_ZASTEPCZA_GODZIN)}
			nazwa={POLE_ZASTEPCZA_GODZIN}
			etykieta={POLA_W_SKROCIE.zastepczaEtykieta}
			podpowiedz={POLA_W_SKROCIE.zastepczaPodpowiedz}
			zaznaczone={wartosci.godzinyZastepcza}
		/>
	</fieldset>

	<!-- 6c. Kafelek 3: opłata. READ-ONLY and COMPUTED from the cennik store, so the front
	     page, the fee box and /cennik can never disagree. The hint names the screen that owns
	     the amount and the link goes there. -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_W_SKROCIE.oplataLegenda}</legend>

		<div class="wglad">
			<p class="wglad-wartosc">{KAFELEK_OPLATY.value}</p>
			{#if KAFELEK_OPLATY.suffix}
				<p class="wglad-wartosc">{KAFELEK_OPLATY.suffix}</p>
			{/if}
			<p class="wglad-podpowiedz">{KOPIA_W_SKROCIE.oplataPodpowiedz}</p>
			<p class="wglad-odnosnik"><a href="/admin/cennik">{KOPIA_W_SKROCIE.oplataLink}</a></p>
		</div>
	</fieldset>

	<!-- 6d. Kafelek 4: liczba miejsc. -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_W_SKROCIE.miejscaLegenda}</legend>

		<FormField
			id={ident(POLE_MIEJSC)}
			nazwa={POLE_MIEJSC}
			typ="number"
			min={MIN_MIEJSC}
			maks={MAKS_MIEJSC}
			etykieta={POLA_W_SKROCIE.miejscaEtykieta}
			podpowiedz={POLA_W_SKROCIE.miejscaPodpowiedz}
			wartosc={wartosci.miejsca}
			blad={pola[POLE_MIEJSC]}
			wymagane
		/>

		<FormField
			id={ident(POLE_DOPISKU)}
			nazwa={POLE_DOPISKU}
			etykieta={POLA_W_SKROCIE.dopisekEtykieta}
			podpowiedz={POLA_W_SKROCIE.dopisekPodpowiedz}
			wartosc={wartosci.dopisek}
			blad={pola[POLE_DOPISKU]}
		/>

		<PolePlaceholder
			id={ident(POLE_ZASTEPCZA_MIEJSC)}
			nazwa={POLE_ZASTEPCZA_MIEJSC}
			etykieta={POLA_W_SKROCIE.zastepczaEtykieta}
			podpowiedz={POLA_W_SKROCIE.zastepczaPodpowiedz}
			zaznaczone={wartosci.miejscaZastepcza}
		/>
	</fieldset>

	<!-- 7. Save row: exactly one Zapisz for the whole page (D-11). -->
	<RzedZapisu
		nota={KOPIA_ZAPIS.nota}
		etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
		etykietaAnuluj={KOPIA_ZAPIS.anuluj}
		celAnuluj={SCIEZKA_STARTOWA}
		zajete={zapisywanie}
	/>
</form>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. */
	.naglowek {
		margin: 16px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* 8px from the heading, the same block rhythm the pulpit's title and lead use. */
	.lead {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.komunikat {
		margin-top: 24px;
	}

	form {
		margin-top: 24px;
	}

	.wymagane {
		margin: 0 0 24px;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* One surface card per field group, 24px between field blocks, 16px padding rising to
	   24px at md: the panel density steps. The browser's own fieldset border and padding are
	   reset because the card IS the grouping affordance. */
	.karta {
		display: flex;
		flex-direction: column;
		gap: 24px;
		box-sizing: border-box;
		margin: 0;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.karta {
			padding: 24px;
		}
	}

	/* 32px between groups, per Contract 5. */
	.karta + .karta {
		margin-top: 32px;
	}

	/* Visible legend styled as the 20px h2 step. `float: left` plus a full-width clear is
	   the long-standing way to make a legend obey normal flow inside a flex fieldset, which
	   browsers otherwise refuse to lay out as a flex item. */
	.legenda {
		float: left;
		width: 100%;
		margin: 0 0 16px;
		padding: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* The note about where else the hours appear. Muted prose above the fields it is about,
	   the same treatment the day-plan screen gives its own „one save, two pages" sentence. */
	.uwaga {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* A read-only tile: the value, then its hint, then the link to the screen that owns it,
	   8px apart, which is the same rhythm a real field's label and hint use. On the band
	   colour so it is visibly NOT something the editor is expected to type into. Identical
	   treatment to the computed line on the Cennik screen. */
	.wglad {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-band);
	}

	.wglad-wartosc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.wglad-podpowiedz {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* The link keeps the panel's 44px target without becoming a button: it is a shortcut to
	   another screen, not an action on this one. */
	.wglad-odnosnik {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
	}

	.wglad-odnosnik a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
