<script lang="ts">
	// A date as three Polish selects (04.1-UI-SPEC Component Contract 5, „Dates are three
	// selects, never the native date input"). The native control's own type value is
	// deliberately not written anywhere in this directory: the acceptance gate for that
	// rule is a literal grep, and a comment naming it would make the gate permanently red.
	//
	// WHY NOT THE NATIVE DATE INPUT. Its picker chrome is drawn by the browser and the
	// operating system in THEIR locale, not in the page's, so on an English-locale machine
	// a fully Polish panel would open an English calendar. That cannot be forced, and this
	// project ships Polish on every surface with no exceptions (SITE-06, CMS-03). It is the
	// same reasoning that rejected the native month input in Phase 4, and here it costs
	// nothing: three selects are keyboard operable, screen-reader unambiguous and work with
	// JavaScript switched off.
	//
	// THE MONTH NAMES COME FROM `MIESIACE_WYBOR`, the project's ONE month table. A second
	// table is forbidden (the reason is written in src/lib/server/forms/mailer.ts): two
	// tables drift, and the one that drifts is always the one nobody is looking at.
	//
	// ONE ERROR FOR THE WHOLE GROUP, associated to the fieldset. Three selects produce one
	// stored value, so three messages would be three announcements of one problem. The
	// three controls are also NOT individually marked invalid: „the date is incomplete" is
	// a property of the group, and marking the day invalid when the year is the empty one
	// would send the editor to the wrong control.
	//
	// THE OUTPUT SHAPE IS THE SERVER'S CHOICE, NOT A PROP. This component posts a day, a
	// month and a year; `dataZTrzech` in src/lib/server/admin/walidacja/pola.ts reads them
	// once and returns BOTH the ISO shape aktualności stores and the dotted shape the
	// dokument version field stores, so the same control serves both screens and neither
	// can produce the other one's format by accident. A prop choosing the format here would
	// be a second place to get it wrong, on the side of the boundary that cannot be trusted.
	//
	// The three selects are the inherited PoleWyboru, so the label, the control box and the
	// focus behaviour are the same ones every other field on the screen uses.
	//
	// This file carries no screen-specific string: the legend, the hint and the error
	// arrive as props, and the three control labels plus the empty option come from
	// src/lib/content/panel.ts, which is where the Polish-only sweep governs them.
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { MIESIACE_WYBOR } from '$lib/content/forms';
	import { POLA_DATA } from '$lib/content/panel';
	import { DNI_MIESIACA } from '$lib/daty';
	import PoleWyboru from './PoleWyboru.svelte';

	let {
		id,
		legenda,
		nazwaDnia,
		nazwaMiesiaca,
		nazwaRoku,
		lata,
		dzien = '',
		miesiac = '',
		rok = '',
		podpowiedz,
		blad
	}: {
		id: string;
		legenda: string;
		nazwaDnia: string;
		nazwaMiesiaca: string;
		nazwaRoku: string;
		/** Years to offer, produced by `lataDoWyboru` in src/lib/daty.ts so the list can
		 *  never contain a year the validator would refuse, and always contains the year an
		 *  already-saved entry carries. */
		lata: readonly number[];
		dzien?: string;
		miesiac?: string;
		rok?: string;
		podpowiedz?: string;
		blad?: string;
	} = $props();

	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);

	/** Only existing ids. A dangling reference makes a screen reader announce nothing at
	 *  all, which is worse than announcing nothing on purpose. */
	const opisy = $derived(
		[podpowiedz ? idPodpowiedzi : null, blad ? idBledu : null].filter(Boolean).join(' ') ||
			undefined
	);

	const opcjeDni = $derived(DNI_MIESIACA.map((d) => ({ wartosc: String(d), etykieta: String(d) })));
	const opcjeMiesiecy = $derived(
		MIESIACE_WYBOR.map((m) => ({ wartosc: String(m.wartosc), etykieta: m.nazwa }))
	);
	const opcjeLat = $derived(lata.map((r) => ({ wartosc: String(r), etykieta: String(r) })));
</script>

<fieldset class="grupa" aria-describedby={opisy}>
	<legend class="legenda">{legenda}</legend>

	{#if podpowiedz}
		<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>
	{/if}

	<!-- Side by side from 640px up, stacked below it: three selects squeezed onto one
	     phone row would each be too narrow to read the month names in. -->
	<div class="selekty">
		<div class="kolumna waska">
			<PoleWyboru
				id="{id}-dzien"
				etykieta={POLA_DATA.dzien}
				nazwa={nazwaDnia}
				opcje={opcjeDni}
				etykietaPusta={POLA_DATA.pusty}
				wybrana={dzien}
			/>
		</div>
		<div class="kolumna szeroka">
			<PoleWyboru
				id="{id}-miesiac"
				etykieta={POLA_DATA.miesiac}
				nazwa={nazwaMiesiaca}
				opcje={opcjeMiesiecy}
				etykietaPusta={POLA_DATA.pusty}
				wybrana={miesiac}
			/>
		</div>
		<div class="kolumna waska">
			<PoleWyboru
				id="{id}-rok"
				etykieta={POLA_DATA.rok}
				nazwa={nazwaRoku}
				opcje={opcjeLat}
				etykietaPusta={POLA_DATA.pusty}
				wybrana={rok}
			/>
		</div>
	</div>

	{#if blad}
		<p id={idBledu} class="blad">
			<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
			<span>{blad}</span>
		</p>
	{/if}
</fieldset>

<style>
	/* The browser's default fieldset border and padding are reset: this group sits on the
	   form's own card and a second box around it would read as a card inside a card. */
	.grupa {
		display: flex;
		flex-direction: column;
		gap: 8px;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border: 0;
	}

	/* Styled as a FIELD LABEL, not as a section heading: „Data publikacji" names one value
	   and sits level with the labels above and below it. The 20px display step belongs to a
	   group that heads a section of the form, which this is not. `float: left` plus a
	   full-width clear is the long-standing way to make a legend obey normal flow inside a
	   flex fieldset, which browsers otherwise refuse to lay out as a flex item. */
	.legenda {
		float: left;
		width: 100%;
		margin: 0;
		padding: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.podpowiedz {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.selekty {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@media (min-width: 640px) {
		.selekty {
			flex-direction: row;
			align-items: flex-end;
			gap: 16px;
		}

		/* The month names are the longest labels by far, so the middle column gets the
		   room and the two numeric columns stay compact. */
		.kolumna.waska {
			flex: 0 1 8rem;
		}

		.kolumna.szeroka {
			flex: 1 1 12rem;
		}
	}

	.blad {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-danger);
	}

	.blad :global(.blad-ikona) {
		flex: none;
		margin-top: 2px;
	}
</style>
