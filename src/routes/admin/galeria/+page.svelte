<script lang="ts">
	// „Galeria" (05-UI-SPEC Contracts 8, 9 and 12; 04.1-UI-SPEC Component Contracts 5, 7, 8, 9
	// and 10; 05 D-21 to D-26). The third mounting of the photo island, and the second at the
	// 4:3 ratio: the ratio, the ready sentence and every field name arrive as props, which is
	// exactly why 04.1-07 took them as props rather than hard-coding them.
	//
	// THE FIXED DOM ORDER OF CONTRACT 5: back link, h1, save-result region, validation summary
	// region, required-fields note, the photo group, the placeholder checkbox, save row. The
	// standing publish-delay panel is appended by the shell after all of it. Nothing is inserted
	// before either of the two regions that receive focus.
	//
	// ONE LIST, ONE „Zapisz" (D-21). Twelve photographs in one sitting is one commit and one
	// Cloudflare build; a screen per photograph would be twelve of each against a free ceiling
	// of 500 per month. The whole list therefore sits inside one form.
	//
	// WITHOUT JAVASCRIPT everything on this screen works except CHOOSING a picture, which is the
	// same honest limitation Contract 8 records and the same one the O nas and dokument screens
	// carry: the island says so itself, in Polish, inside every item. Adding, removing and
	// REORDERING are all server round trips and all work with scripting switched off.
	//
	// THE FORM RESET IS TURNED OFF ON PURPOSE. All four list actions answer with a SUCCESS
	// result, and the enhanced default for a success is to call the form element's own reset,
	// which restores every control to the value the document was parsed with: every caption
	// typed since the page loaded would vanish the moment an editor asked for another row.
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
	import ZdjecieIsland from '$lib/components/admin/ZdjecieIsland.svelte';
	import {
		KOPIA_EKRAN_GALERII,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		KOPIA_ZDJECIA,
		POLA_GALERIA,
		bladWElemencie,
		legendaZdjecia,
		nazwaPrzeniesieniaWDol,
		nazwaPrzeniesieniaWGore,
		zobaczStrone
	} from '$lib/content/panel';
	// NOT from the validator beside the action: SvelteKit refuses to bundle $lib/server into
	// client code, and that refusal is correct.
	import {
		AKCJA_DODANIA_ZDJECIA,
		AKCJA_PRZENIESIENIA_W_DOL,
		AKCJA_PRZENIESIENIA_W_GORE,
		AKCJA_USUNIECIA_ZDJECIA,
		AKCJA_ZAPISU,
		MAKS_ZDJEC_GALERII,
		POLE_ALTU,
		POLE_DANYCH,
		POLE_INDEKSU,
		POLE_PLIKU,
		POLE_PODPISU,
		POLE_SHA,
		POLE_USUNIECIA,
		POLE_ZASTEPCZA,
		PREFIKS_ZDJECIA_GALERII,
		idPola,
		idWyspyGalerii,
		nazwaPola
	} from '$lib/pola-strony';
	import { SCIEZKA_STARTOWA } from '$lib/sciezki-panelu';
	import { PROPORCJA_O_NAS } from '$lib/zdjecia';
	import type { PageData } from './$types';
	import type { WynikGaleriiEkranu } from './+page.server';

	let { data, form }: { data: PageData; form: WynikGaleriiEkranu | null } = $props();

	// A writable $derived, not `$state` seeded from a prop: the server is the source of truth and
	// every answer it gives, a refusal as much as an added row, is the values it hands back.
	let wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});
	const sha = $derived(form?.sha ?? data.sha);

	let zapisywanie = $state(false);

	interface WpisPodsumowania {
		cel: string;
		tekst: string;
	}

	/** The summary, in the order of the form, with every entry naming the item it will take the
	 *  editor to (WCAG 2.4.4: twelve identical „Podaj podpis zdjęcia" links are one link twelve
	 *  times). Built by walking the items rather than by parsing the error keys.
	 *
	 *  FOUR ROWS PER ITEM, one more than the O nas screen has, because this screen has one more
	 *  field. The caption points at its OWN control: a summary entry linking to a control that is
	 *  not on the screen would announce nothing at all. */
	const podsumowanie: WpisPodsumowania[] = $derived.by(() => {
		const wpisy: WpisPodsumowania[] = [];
		wartosci.zdjecia.forEach((_, indeks) => {
			const wyspa = idWyspyGalerii(indeks);
			for (const [pole, cel] of [
				[POLE_DANYCH, `${wyspa}-plik`],
				[POLE_PLIKU, `${wyspa}-plik`],
				[POLE_PODPISU, idPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PODPISU)],
				[POLE_ALTU, `${wyspa}-alt`]
			] as const) {
				const komunikat = pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, pole)];
				if (komunikat === undefined) continue;
				wpisy.push({ cel, tekst: bladWElemencie(legendaZdjecia(indeks + 1), komunikat) });
			}
		});
		return wpisy;
	});
</script>

<!-- 1. Back link. „Wróć do pulpitu", because Galeria is a singleton list with no index screen. -->
<PowrotLink cel={SCIEZKA_STARTOWA} etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_EKRAN_GALERII.naglowek}</h1>

<!-- 3. Save-result region, driven by a marker on a fresh GET so a refresh cannot re-save. The
     link points at /o-nas, because the gallery is a SECTION of that page (05 D-19). -->
{#if data.zapisano}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
			<p>
				<a href="/o-nas" target="_blank" rel="noopener noreferrer">
					{zobaczStrone(KOPIA_EKRAN_GALERII.stronaNazwa)}<span class="visually-hidden"
						>{KOPIA_POWLOKA.nowaKarta}</span
					>
				</a>
			</p>
		</PanelKomunikat>
	</div>
{/if}

<!-- 4. Validation summary and the two refusal panels. All three are the same surface in the
     same place, because to an editor they are one answer. -->
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
			// See the module header: without this the four list actions would wipe the form.
			await update({ reset: false });
			zapisywanie = false;
		};
	}}
>
	<!-- The state the form was built from (04.1 D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save fail, never make it overwrite more. -->
	{#if sha}
		<input type="hidden" name={POLE_SHA} value={sha} />
	{/if}

	<!-- 5. Required-fields note. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

	<!-- 6. The photo list. `wlasnaRamka` because the island IS the item's fieldset and carries
	     the numbered legend: two nested fieldsets would announce two groups for one picture.
	     The island is MOUNTED here, never rewritten, at the existing 4:3 constant used
	     UNCHANGED (05 D-24). The limit and its message are what 05 D-23 asks of the screen; the
	     server refuses an over-cap save regardless of what this page rendered. -->
	<div class="grupa">
		<PowtarzalnaGrupa
			id={PREFIKS_ZDJECIA_GALERII}
			legenda={POLA_GALERIA.zdjeciaLegenda}
			podpowiedz={POLA_GALERIA.zdjeciaPodpowiedz}
			ile={wartosci.zdjecia.length}
			etykietaElementu={legendaZdjecia}
			akcjaDodania={AKCJA_DODANIA_ZDJECIA}
			akcjaUsuniecia={AKCJA_USUNIECIA_ZDJECIA}
			etykietaDodania={KOPIA_ZAPIS.dodajZdjecie}
			etykietaUsuniecia={KOPIA_ZAPIS.usunZdjecie}
			akcjaWGore={AKCJA_PRZENIESIENIA_W_GORE}
			akcjaWDol={AKCJA_PRZENIESIENIA_W_DOL}
			etykietaWGore={KOPIA_ZAPIS.przeniesWGore}
			etykietaWDol={KOPIA_ZAPIS.przeniesWDol}
			nazwaWGore={nazwaPrzeniesieniaWGore}
			nazwaWDol={nazwaPrzeniesieniaWDol}
			nazwaIndeksu={POLE_INDEKSU}
			nota={KOPIA_ZAPIS.notaGrupyZdjecZKolejnoscia}
			limit={MAKS_ZDJEC_GALERII}
			komunikatLimitu={KOPIA_EKRAN_GALERII.limitOsiagniety}
			notaPusta={KOPIA_EKRAN_GALERII.pustaLista}
			status={form?.status ?? ''}
			zadanie={form?.zadanie}
			wlasnaRamka
		>
			{#snippet element(indeks)}
				<ZdjecieIsland
					id={idWyspyGalerii(indeks)}
					legenda={legendaZdjecia(indeks + 1)}
					podpowiedz={POLA_GALERIA.zdjeciePodpowiedz}
					altEtykieta={POLA_GALERIA.altEtykieta}
					altPodpowiedz={POLA_GALERIA.altPodpowiedz}
					proporcja={PROPORCJA_O_NAS}
					komunikatGotowe={KOPIA_ZDJECIA.gotowe43}
					nazwaZdjecia={nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_DANYCH)}
					nazwaUsuniecia={nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_USUNIECIA)}
					nazwaObrazu={nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PLIKU)}
					nazwaAltu={nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_ALTU)}
					obraz={wartosci.zdjecia[indeks].plik}
					usunieto={wartosci.zdjecia[indeks].usunieto}
					zdjecie={wartosci.zdjecia[indeks].dane}
					alt={wartosci.zdjecia[indeks].alt}
					blad={pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_DANYCH)] ??
						pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PLIKU)]}
					bladAltu={pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_ALTU)]}
					autofokus={form?.zadanie?.cel === 'element' && form.zadanie.indeks === indeks}
				/>
				<!-- The caption sits AFTER the island, so an editor reads down the item in the order
				     the public page renders it: the picture, then the words under the picture. Its
				     own id, so the summary can link straight to it. -->
				<FormField
					id={idPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PODPISU)}
					nazwa={nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PODPISU)}
					etykieta={POLA_GALERIA.podpisEtykieta}
					podpowiedz={POLA_GALERIA.podpisPodpowiedz}
					wartosc={wartosci.zdjecia[indeks].podpis}
					blad={pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, POLE_PODPISU)]}
					wymagane
				/>
			{/snippet}
		</PowtarzalnaGrupa>
	</div>

	<!-- 7. The placeholder checkbox, last control before the save row (Contract 5). -->
	<div class="karta">
		<PolePlaceholder
			id="galeria-zastepcza"
			nazwa={POLE_ZASTEPCZA}
			etykieta={POLA_GALERIA.zastepczaEtykieta}
			podpowiedz={POLA_GALERIA.zastepczaPodpowiedz}
			zaznaczone={wartosci.zastepcza}
		/>
	</div>

	<!-- 8. Save row: exactly one Zapisz for the whole list (04.1 D-11). -->
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

	/* One surface card per field group, 16px padding rising to 24px at md: the panel density
	   steps. 32px between groups, per Contract 5. */
	.karta {
		display: flex;
		flex-direction: column;
		gap: 24px;
		box-sizing: border-box;
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

	.grupa + .karta {
		margin-top: 32px;
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
