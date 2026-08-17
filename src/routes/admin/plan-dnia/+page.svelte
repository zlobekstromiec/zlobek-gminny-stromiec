<script lang="ts">
	// „Plan dnia" (04.1-UI-SPEC Component Contracts 5, 7, 9 and 10; D-11, D-17).
	//
	// THE FIXED DOM ORDER OF CONTRACT 5: back link, h1, save-result region, validation
	// summary region, required-fields note, field groups, save row. Nothing is inserted
	// before either of the two regions that receive focus, because a panel an editor has to
	// scroll past is a panel a screen-reader user is told about after the fact.
	//
	// WITHOUT JAVASCRIPT THIS SCREEN IS COMPLETE, including the rows. „Dodaj wiersz" and
	// „Usuń ten wiersz" are ordinary submit buttons carrying a form action, the server
	// answers with the same form one row longer or one row shorter, and focus lands where it
	// should because the server rendered the attribute that puts it there.
	//
	// ONE „ZAPISZ" (D-11). An editor may add four rows, remove one and retype two, and the
	// result is exactly one commit and exactly one Cloudflare build.
	//
	// THE FORM RESET IS TURNED OFF ON PURPOSE, and this is the one line on this page that
	// would be a silent catastrophe if it were missing. An add and a remove both answer with
	// a SUCCESS result, and the enhanced default for a success is to call the form element's
	// own reset, which restores every control to the value the document was parsed with:
	// everything typed since the page loaded would vanish at the moment the editor asked for
	// another row. The refusal and the save are unaffected either way, because a refusal is
	// not a success and a save redirects.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolePlaceholder from '$lib/components/admin/PolePlaceholder.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import PowtarzalnaGrupa from '$lib/components/admin/PowtarzalnaGrupa.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import {
		KOPIA_EKRAN_PLANU,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		POLA_PLAN_DNIA,
		bladWElemencie,
		legendaWiersza,
		nazwaPrzeniesieniaWDol,
		nazwaPrzeniesieniaWGore,
		zobaczStrone
	} from '$lib/content/panel';
	// NOT from the validator beside the action: SvelteKit refuses to bundle $lib/server into
	// client code, and that refusal is correct. The reasoning is in the module header there.
	import {
		AKCJA_DODANIA_WIERSZA,
		AKCJA_PRZENIESIENIA_W_DOL,
		AKCJA_PRZENIESIENIA_W_GORE,
		AKCJA_USUNIECIA_WIERSZA,
		AKCJA_ZAPISU,
		POLE_GODZIN,
		POLE_INDEKSU,
		POLE_OPISU,
		POLE_SHA,
		POLE_ZASTEPCZA,
		PREFIKS_WIERSZA,
		idPola,
		nazwaPola
	} from '$lib/pola-strony';
	import type { PageData } from './$types';
	import type { WynikPlanuDnia } from './+page.server';

	let { data, form }: { data: PageData; form: WynikPlanuDnia | null } = $props();

	const PULPIT = '/admin';

	// A writable $derived, not `$state` seeded from a prop: the server is the source of
	// truth and every answer it gives, a refusal as much as an added row, is the values it
	// hands back. A plain `$state(...)` would capture only the FIRST render and ignore every
	// later answer, which is exactly the defect 04.1-05 hit on the nabór radios.
	let wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});
	// The head the form was BUILT from wins over whatever the load just read, so a round trip
	// through the add button cannot move the D-10 baseline forward.
	const sha = $derived(form?.sha ?? data.sha);

	let zapisywanie = $state(false);

	/** The summary, built by walking the rows rather than by parsing the error keys, so its
	 *  order is the order of the form and each entry names the row it will take the editor
	 *  to (WCAG 2.4.4: four identical „Wpisz godziny" links are one link four times). */
	const podsumowanie = $derived(
		wartosci.wiersze.flatMap((_, indeks) =>
			[POLE_GODZIN, POLE_OPISU]
				.map((pole) => ({ pole, komunikat: pola[nazwaPola(PREFIKS_WIERSZA, indeks, pole)] }))
				.filter((wpis) => wpis.komunikat !== undefined)
				.map((wpis) => ({
					cel: idPola(PREFIKS_WIERSZA, indeks, wpis.pole),
					tekst: bladWElemencie(legendaWiersza(indeks + 1), wpis.komunikat)
				}))
		)
	);
</script>

<!-- 1. Back link. „Wróć do pulpitu", because the day plan is a singleton with no list. -->
<PowrotLink cel={PULPIT} etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_EKRAN_PLANU.naglowek}</h1>

<!-- 3. Save-result region, driven by a marker on a fresh GET so a refresh cannot re-save. -->
{#if data.zapisano}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
			<p>
				<a href="/o-nas" target="_blank" rel="noopener noreferrer">
					{zobaczStrone(KOPIA_EKRAN_PLANU.stronaNazwa)}<span class="visually-hidden"
						>{KOPIA_POWLOKA.nowaKarta}</span
					>
				</a>
			</p>
		</PanelKomunikat>
	</div>
{/if}

<!-- 4. Validation summary and the two refusal panels. One surface in one place, because to
     an editor they are one answer: „this did not happen, and here is what to do". -->
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
			// See the module header: without this the add and the remove would wipe the form.
			await update({ reset: false });
			zapisywanie = false;
		};
	}}
>
	<!-- The state the form was built from (D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save fail, never make it overwrite more,
	     because the ref update itself runs with force false. -->
	{#if sha}
		<input type="hidden" name={POLE_SHA} value={sha} />
	{/if}

	<!-- 5. Required-fields note, then the one thing this screen cannot show: the plan is one
	     file rendered in two places, so a save here changes the front page too. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>
	<p class="uwaga">{KOPIA_EKRAN_PLANU.uwagaWspolna}</p>

	<!-- 6. One field group, and it is the repeated one.

	     IT OPTS INTO REORDERING (05 D-22). A day plan is read top to bottom by a parent, so
	     its order is its content, and an editor who put breakfast after the walk previously
	     had to retype two whole rows to fix it. This is also the mount that exercises the
	     `<fieldset class="element">` branch of PowtarzalnaGrupa, which the O nas photo group
	     does not: between the two screens both branches of that split carry the button row
	     and both are covered by a live test. -->
	<PowtarzalnaGrupa
		id={PREFIKS_WIERSZA}
		legenda={POLA_PLAN_DNIA.grupaLegenda}
		podpowiedz={POLA_PLAN_DNIA.grupaPodpowiedz}
		ile={wartosci.wiersze.length}
		etykietaElementu={legendaWiersza}
		akcjaDodania={AKCJA_DODANIA_WIERSZA}
		akcjaUsuniecia={AKCJA_USUNIECIA_WIERSZA}
		etykietaDodania={KOPIA_ZAPIS.dodajWiersz}
		etykietaUsuniecia={KOPIA_ZAPIS.usunWiersz}
		akcjaWGore={AKCJA_PRZENIESIENIA_W_GORE}
		akcjaWDol={AKCJA_PRZENIESIENIA_W_DOL}
		etykietaWGore={KOPIA_ZAPIS.przeniesWGore}
		etykietaWDol={KOPIA_ZAPIS.przeniesWDol}
		nazwaWGore={nazwaPrzeniesieniaWGore}
		nazwaWDol={nazwaPrzeniesieniaWDol}
		nazwaIndeksu={POLE_INDEKSU}
		nota={KOPIA_ZAPIS.notaGrupyZKolejnoscia}
		status={form?.status ?? ''}
		zadanie={form?.zadanie}
	>
		{#snippet element(indeks)}
			<FormField
				id={idPola(PREFIKS_WIERSZA, indeks, POLE_GODZIN)}
				nazwa={nazwaPola(PREFIKS_WIERSZA, indeks, POLE_GODZIN)}
				etykieta={POLA_PLAN_DNIA.godzinyEtykieta}
				podpowiedz={POLA_PLAN_DNIA.godzinyPodpowiedz}
				wartosc={wartosci.wiersze[indeks].godziny}
				blad={pola[nazwaPola(PREFIKS_WIERSZA, indeks, POLE_GODZIN)]}
				autofokus={form?.zadanie?.cel === 'element' && form.zadanie.indeks === indeks}
				wymagane
			/>
			<FormField
				id={idPola(PREFIKS_WIERSZA, indeks, POLE_OPISU)}
				nazwa={nazwaPola(PREFIKS_WIERSZA, indeks, POLE_OPISU)}
				etykieta={POLA_PLAN_DNIA.opisEtykieta}
				podpowiedz={POLA_PLAN_DNIA.opisPodpowiedz}
				wartosc={wartosci.wiersze[indeks].opis}
				blad={pola[nazwaPola(PREFIKS_WIERSZA, indeks, POLE_OPISU)]}
				wymagane
			/>
		{/snippet}
	</PowtarzalnaGrupa>

	<div class="zastepcza">
		<PolePlaceholder
			id="plan-zastepcza"
			nazwa={POLE_ZASTEPCZA}
			etykieta={POLA_PLAN_DNIA.zastepczaEtykieta}
			podpowiedz={POLA_PLAN_DNIA.zastepczaPodpowiedz}
			zaznaczone={wartosci.zastepcza}
		/>
	</div>

	<!-- 7. Save row: exactly one Zapisz. -->
	<RzedZapisu
		nota={KOPIA_ZAPIS.nota}
		etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
		etykietaAnuluj={KOPIA_ZAPIS.anuluj}
		celAnuluj={PULPIT}
		zajete={zapisywanie}
	/>
</form>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale, exactly as
	   every other panel screen does. A role reassignment inside the scale, never a fifth
	   size. */
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

	/* 24px from the page header to the first thing under it, the panel density step. */
	form {
		margin-top: 24px;
	}

	.wymagane,
	.uwaga {
		margin: 0 0 8px;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.uwaga {
		margin-bottom: 24px;
	}

	/* The placeholder checkbox is the last control of the last group (Contract 5), on its
	   own card so it is not read as part of the repeated list above it. */
	.zastepcza {
		box-sizing: border-box;
		margin-top: 32px;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.zastepcza {
			padding: 24px;
		}
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
