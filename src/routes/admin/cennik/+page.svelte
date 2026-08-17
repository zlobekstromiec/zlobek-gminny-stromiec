<script lang="ts">
	// The Cennik editor (FEES-01, 05 D-27, D-28, D-31; 05-UI-SPEC Contract 10, and
	// 04.1-UI-SPEC Component Contracts 5, 9 and 10).
	//
	// TWO FIELDSETS, ONE FORM, ONE „Zapisz". Every amount and every fee sentence on this
	// site lives in one file, so an editor who came to change a number and stayed to fix a
	// sentence gets ONE commit and ONE Cloudflare build for the whole visit (D-11).
	//
	// THE COMPUTED LINE SHOWS WHAT IS SAVED, NOT WHAT IS BEING TYPED, and its hint says so
	// out loud. Following the two controls live would need JavaScript on a screen that
	// otherwise needs none, and a figure that moves while you type is the easiest thing on
	// a form to mistake for a stored value. The number is read from the same validated view
	// the public /cennik page renders, so the panel cannot promise an amount the site does
	// not show.
	//
	// NOTHING ON THIS SCREEN IS A GREYED-OUT CONTROL. The read-only line is text plus a
	// hint, which is the honest form: a control nobody may type into looks like a control
	// somebody forgot to enable, and it is skipped by keyboard navigation with no
	// explanation.
	//
	// WITHOUT JAVASCRIPT THIS SCREEN IS COMPLETE: the form posts, the server validates, the
	// server re-renders with every typed value intact and the refusal linked from the
	// summary. `use:enhance` below is an enhancement that adds a saving label and nothing
	// else.
	//
	// THE PUBLISH-DELAY PANEL IS NOT RENDERED HERE. The panel shell puts it after the
	// content of every screen (src/routes/admin/+layout.svelte), so repeating it would show
	// the same promise twice on one page.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed here.
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolePlaceholder from '$lib/components/admin/PolePlaceholder.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import { CENNIK } from '$lib/cennik';
	import {
		KOPIA_CENNIK,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		POLA_CENNIK,
		obecnieNaStronie,
		zobaczStrone
	} from '$lib/content/panel';
	import {
		AKCJA_ZAPISU,
		POLE_KWOTY_OPIS,
		POLE_NAGLOWKA,
		POLE_NIEOBECNOSCI,
		POLE_OBNIZKI,
		POLE_SHA,
		POLE_STAWKI,
		POLE_WYZYWIENIA,
		POLE_ZASTEPCZA,
		POLE_ZUS
	} from '$lib/pola-strony';
	import { SCIEZKA_STARTOWA } from '$lib/sciezki-panelu';
	import type { PageData } from './$types';
	import type { WynikCennika } from './+page.server';

	let { data, form }: { data: PageData; form: WynikCennika | null } = $props();

	// The refused submission wins over the committed store, so a refusal, a conflict or a
	// failure hands the editor back what they typed rather than an empty form.
	const wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});
	const sha = $derived(form?.sha ?? data.sha);

	/** Saving state of Contract 9. Only ever true on a hydrated page; the server-rendered
	 *  row is a plain working button. */
	let zapisywanie = $state(false);

	/** Bounds of the two amounts. Semantics and a sane spinner range only: the form carries
	 *  `novalidate` precisely so the browser's own English-in-some-locales bubbles never
	 *  appear, and the server refuses an out-of-range value with an authored Polish
	 *  instruction. */
	const MIN_KWOTY = 0;
	const MAKS_KWOTY = 9999;

	/** The DOM id of every control, spelled once so the summary links and the fields cannot
	 *  disagree about a fragment. */
	function ident(pole: string): string {
		return `cennik-${pole}`;
	}

	interface WpisPodsumowania {
		cel: string;
		tekst: string;
	}

	/** The summary, in the order of the form, with every entry linking to the control it is
	 *  about (WCAG 2.4.4). Built by walking the fields rather than by parsing the error
	 *  keys, which is what keeps the order the reading order. */
	const podsumowanie: WpisPodsumowania[] = $derived.by(() =>
		[
			POLE_STAWKI,
			POLE_OBNIZKI,
			POLE_NAGLOWKA,
			POLE_KWOTY_OPIS,
			POLE_ZUS,
			POLE_WYZYWIENIA,
			POLE_NIEOBECNOSCI
		]
			.filter((pole) => pola[pole] !== undefined)
			.map((pole) => ({ cel: ident(pole), tekst: pola[pole] }))
	);
</script>

<!-- 1. Back link. „Wróć do pulpitu", because Cennik is a singleton with no list. -->
<PowrotLink cel={SCIEZKA_STARTOWA} etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_CENNIK.naglowek}</h1>

<!-- 3. Save-result region, driven by a marker on a fresh GET so a refresh cannot re-save. -->
{#if data.zapisano}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
			<p>
				<a href="/cennik" target="_blank" rel="noopener noreferrer">
					{zobaczStrone(KOPIA_CENNIK.stronaNazwa)}<span class="visually-hidden"
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

	<!-- 6a. Kwoty: the two stored numbers, then the third one this site computes from them. -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_CENNIK.kwotyLegenda}</legend>

		<FormField
			id={ident(POLE_STAWKI)}
			nazwa={POLE_STAWKI}
			typ="number"
			min={MIN_KWOTY}
			maks={MAKS_KWOTY}
			etykieta={POLA_CENNIK.stawkaEtykieta}
			podpowiedz={POLA_CENNIK.stawkaPodpowiedz}
			wartosc={wartosci.stawka}
			blad={pola[POLE_STAWKI]}
			wymagane
		/>

		<FormField
			id={ident(POLE_OBNIZKI)}
			nazwa={POLE_OBNIZKI}
			typ="number"
			min={MIN_KWOTY}
			maks={MAKS_KWOTY}
			etykieta={POLA_CENNIK.obnizkaEtykieta}
			podpowiedz={POLA_CENNIK.obnizkaPodpowiedz}
			wartosc={wartosci.obnizka}
			blad={pola[POLE_OBNIZKI]}
			wymagane
		/>

		<!-- The computed amount, as TEXT. It is what a parent sees today, which is not
		     necessarily what the two controls above currently say, and the hint below is what
		     makes that difference readable rather than confusing. -->
		<div class="obliczona">
			<p class="obliczona-kwota">{obecnieNaStronie(CENNIK.kwotaProza)}</p>
			<p class="obliczona-podpowiedz">{KOPIA_CENNIK.obliczonaPodpowiedz}</p>
		</div>
	</fieldset>

	<!-- 6b. Opis opłat: every sentence the fee block and the fees page publish. -->
	<fieldset class="karta">
		<legend class="legenda">{KOPIA_CENNIK.opisLegenda}</legend>

		<FormField
			id={ident(POLE_NAGLOWKA)}
			nazwa={POLE_NAGLOWKA}
			etykieta={POLA_CENNIK.naglowekEtykieta}
			podpowiedz={POLA_CENNIK.naglowekPodpowiedz}
			wartosc={wartosci.naglowek}
			blad={pola[POLE_NAGLOWKA]}
			wymagane
		/>

		<FormField
			id={ident(POLE_KWOTY_OPIS)}
			nazwa={POLE_KWOTY_OPIS}
			etykieta={POLA_CENNIK.kwotaOpisEtykieta}
			podpowiedz={POLA_CENNIK.kwotaOpisPodpowiedz}
			wartosc={wartosci.kwotaOpis}
			blad={pola[POLE_KWOTY_OPIS]}
			wieloliniowy
			wymagane
		/>

		<FormField
			id={ident(POLE_ZUS)}
			nazwa={POLE_ZUS}
			etykieta={POLA_CENNIK.zusEtykieta}
			podpowiedz={POLA_CENNIK.zusPodpowiedz}
			wartosc={wartosci.zus}
			blad={pola[POLE_ZUS]}
			wieloliniowy
			wymagane
		/>

		<FormField
			id={ident(POLE_WYZYWIENIA)}
			nazwa={POLE_WYZYWIENIA}
			etykieta={POLA_CENNIK.wyzywienieEtykieta}
			podpowiedz={POLA_CENNIK.wyzywieniePodpowiedz}
			wartosc={wartosci.wyzywienie}
			blad={pola[POLE_WYZYWIENIA]}
			wieloliniowy
			wymagane
		/>

		<FormField
			id={ident(POLE_NIEOBECNOSCI)}
			nazwa={POLE_NIEOBECNOSCI}
			etykieta={POLA_CENNIK.nieobecnoscEtykieta}
			podpowiedz={POLA_CENNIK.nieobecnoscPodpowiedz}
			wartosc={wartosci.nieobecnosc}
			blad={pola[POLE_NIEOBECNOSCI]}
			wieloliniowy
			wymagane
		/>

		<!-- The placeholder checkbox, last control of the last group (Contract 5). -->
		<PolePlaceholder
			id={ident(POLE_ZASTEPCZA)}
			nazwa={POLE_ZASTEPCZA}
			etykieta={POLA_CENNIK.zastepczaEtykieta}
			podpowiedz={POLA_CENNIK.zastepczaPodpowiedz}
			zaznaczone={wartosci.zastepcza}
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

	/* The computed amount and its hint read as one block, 8px apart, the same rhythm the
	   label and hint of a real field use. On the band colour so it is visibly NOT a control
	   the editor is expected to type into. */
	.obliczona {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-band);
	}

	.obliczona-kwota {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.obliczona-podpowiedz {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
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
