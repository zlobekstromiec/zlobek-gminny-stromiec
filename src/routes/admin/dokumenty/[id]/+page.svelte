<script lang="ts">
	// „Edycja dokumentu" (04.1-UI-SPEC Component Contract 5).
	//
	// Same fixed DOM order as the create screen and the same field groups, from the same
	// component, because a screen that offered a field the other one forgot is how a value
	// gets written once and dropped by the next save.
	//
	// THE DOWNLOAD ADDRESS OF THE DOCUMENT NEVER CHANGES HERE. The action writes to the paths
	// its route parameter names, so correcting the name corrects the name and nothing else.
	// That is enforced on the server; this file only has to avoid promising otherwise, which is
	// why nothing on this screen offers to rename anything.
	//
	// WITHOUT JAVASCRIPT this screen still saves. Attaching a NEW file needs scripting (P-22)
	// and says so in the file group's own no-script panel, but the name, the category, the
	// version date, the BIP address and the placeholder flag are ordinary controls, and a save
	// that carries no new file keeps the file this document already has.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolaDokumentu from '$lib/components/admin/PolaDokumentu.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import {
		KOPIA_EKRAN_DOKUMENTU,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		zobaczStrone
	} from '$lib/content/panel';
	import { POLE_SHA } from '$lib/pola-dokumentu';
	import type { PageData } from './$types';
	import type { WynikDokumentu } from './+page.server';

	let { data, form }: { data: PageData; form: WynikDokumentu | null } = $props();

	const LISTA = '/admin/dokumenty';

	// A writable $derived, not `$state` seeded from a prop: the server is the source of truth
	// and a refused submission is the values it hands back.
	let wartosci = $derived(form?.wartosci ?? (data.znaleziony ? data.wartosci : undefined));
	const pola = $derived(form?.pola ?? {});

	let zapisywanie = $state(false);

	/** In-page links from the summary to each offending control. The version group points at
	 *  its first select, because a fieldset is not focusable and „go to the date" means „go to
	 *  the day". */
	const CELE: Record<string, string> = {
		nazwa: 'dokument-nazwa',
		kategoria: 'dokument-kategoria',
		plik: 'dokument-plik-pole',
		wersja: 'dokument-wersja-dzien',
		zrodlo_bip: 'dokument-zrodlo'
	};
</script>

<PowrotLink cel={LISTA} etykieta={KOPIA_LISTY.powrotLista} />

{#if !data.znaleziony || !wartosci}
	<h1 class="naglowek">{KOPIA_ZAPIS.brakTresciNaglowek}</h1>
	<p class="brak">{KOPIA_ZAPIS.brakTresciTresc}</p>
	<p class="brak-powrot"><a href={LISTA}>{KOPIA_LISTY.powrotLista}</a></p>
{:else}
	<h1 class="naglowek">{KOPIA_EKRAN_DOKUMENTU.edycjaNaglowek}</h1>

	<!-- 3. Save-result region, driven by a marker on a fresh GET. -->
	{#if data.zapisano}
		<div class="komunikat">
			<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
				<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
				<p>
					<a href="/dokumenty" target="_blank" rel="noopener noreferrer">
						{zobaczStrone(KOPIA_EKRAN_DOKUMENTU.stronaNazwa)}<span class="visually-hidden"
							>{KOPIA_POWLOKA.nowaKarta}</span
						>
					</a>
				</p>
			</PanelKomunikat>
		</div>
	{/if}

	<!-- 4. Validation summary and the two refusal panels. One surface in one place, because to
	     an editor they are one answer. -->
	{#if form?.panelNaglowek}
		<div class="komunikat">
			<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
				<p>{form.panelTresc}</p>
				{#if Object.keys(pola).length > 0}
					<ul>
						{#each Object.entries(pola) as [klucz, komunikat] (klucz)}
							<li><a href="#{CELE[klucz] ?? 'dokument-nazwa'}">{komunikat}</a></li>
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
		novalidate
		use:enhance={() => {
			zapisywanie = true;
			return async ({ update }) => {
				await update();
				zapisywanie = false;
			};
		}}
	>
		{#if data.sha}
			<input type="hidden" name={POLE_SHA} value={data.sha} />
		{/if}

		<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

		<PolaDokumentu
			{wartosci}
			{pola}
			lata={data.lata}
			kategorie={data.kategorie}
			obecnyPlikOpis={data.obecnyPlik}
		/>

		<RzedZapisu
			nota={KOPIA_ZAPIS.nota}
			etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
			etykietaAnuluj={KOPIA_ZAPIS.anuluj}
			celAnuluj={LISTA}
			zajete={zapisywanie}
		/>
	</form>
{/if}

<style>
	.naglowek {
		margin: 16px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.brak {
		margin: 24px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.brak-powrot {
		margin: 24px 0 0;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.5;
	}

	.brak-powrot a {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.komunikat {
		margin-top: 24px;
	}

	form {
		margin-top: 24px;
	}

	.wymagane {
		margin: 0 0 24px;
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
