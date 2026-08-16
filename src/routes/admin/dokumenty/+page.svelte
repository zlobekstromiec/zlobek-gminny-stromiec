<script lang="ts">
	// The dokumenty list (04.1-UI-SPEC Component Contract 4).
	//
	// DOM ORDER: back link, page header row (h1 plus the one primary action), the
	// save-result region, then the three category groups or the whole-list empty panel.
	//
	// THE THREE HEADINGS ALWAYS RENDER, even for a category holding nothing, and that is the
	// one place this screen deliberately differs from the public page. An empty category
	// carries a one-line note instead of a card, so an editor can see the drawer exists and
	// knows where a new document would land.
	//
	// „Dodaj dokument" is a LINK, not a control: it navigates to another screen and commits
	// nothing. That is why it renders through PrzyciskLink and not through Przycisk.
	//
	// There is NO posting element anywhere on this screen. Deletion happens only on the
	// confirmation page (Contract 11), which is the difference between a destructive action
	// somebody chose and a destructive action a browser followed.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import Plus from '@lucide/svelte/icons/plus';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import PrzyciskLink from '$lib/components/admin/PrzyciskLink.svelte';
	import PustaLista from '$lib/components/admin/PustaLista.svelte';
	import WierszListy from '$lib/components/admin/WierszListy.svelte';
	import {
		KOPIA_EKRAN_DOKUMENTU,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		metaDokumentu,
		ukryteDokument,
		zobaczStrone
	} from '$lib/content/panel';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const NOWY = '/admin/dokumenty/nowy';
</script>

<!-- 1. Back link. „Wróć do pulpitu": this IS the list, so there is no list above it. -->
<PowrotLink cel="/admin" etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. Page header row: the h1 on the left, the one primary action on the right, and the
     action dropping to its own full-width row below the small breakpoint. -->
<div class="naglowek-strony">
	<h1 class="naglowek">{KOPIA_LISTY.dokumentyNaglowek}</h1>
	<PrzyciskLink cel={NOWY} pelnaSzerokosc>
		<Plus size={18} aria-hidden="true" focusable="false" />
		{KOPIA_LISTY.dokumentyAkcja}
	</PrzyciskLink>
</div>

<!-- 3. Save-result region. Driven by a marker on a fresh GET, so a refresh after a save or a
     deletion re-runs a harmless read instead of repeating the operation. -->
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
{:else if data.usunieto}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.usunietoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.usunietoDokumentTresc}</p>
		</PanelKomunikat>
	</div>
{/if}

{#if data.pusto}
	<!-- 4a. The whole collection is empty. Rendered INSTEAD of the three headings: repeating
	     „brak dokumentów" four times would say nothing four times. -->
	<PustaLista naglowek={KOPIA_LISTY.dokumentyPustyNaglowek} tresc={KOPIA_LISTY.dokumentyPustaTresc}>
		<PrzyciskLink cel={NOWY}>
			<Plus size={18} aria-hidden="true" focusable="false" />
			{KOPIA_LISTY.dokumentyAkcja}
		</PrzyciskLink>
	</PustaLista>
{:else}
	<!-- 4b. Every category, in the fixed order, each with its own second-level heading and
	     either a card of rows or the one-line note. -->
	{#each data.grupy as grupa (grupa.kategoria)}
		<section class="grupa" aria-labelledby="grupa-{grupa.kategoria}">
			<h2 class="naglowek-grupy" id="grupa-{grupa.kategoria}">{grupa.naglowek}</h2>
			{#if grupa.dokumenty.length > 0}
				<div class="karta">
					<ul class="lista">
						{#each grupa.dokumenty as dokument (dokument.slug)}
							<WierszListy
								tytul={dokument.nazwa}
								meta={metaDokumentu(dokument.typ, dokument.wersja)}
								celEdycji="/admin/dokumenty/{dokument.slug}"
								celUsuniecia="/admin/dokumenty/{dokument.slug}/usun"
								etykietaEdytuj={KOPIA_LISTY.edytuj}
								etykietaUsun={KOPIA_LISTY.usun}
								dopowiedzenie={ukryteDokument(dokument.nazwa)}
								zastepcza={dokument.zastepcza}
								etykietaOdznaki={KOPIA_LISTY.odznakaZastepcza}
							/>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="pusta-kategoria">{KOPIA_LISTY.pustaKategoria}</p>
			{/if}
		</section>
	{/each}
{/if}

<style>
	/* Stacked below the small breakpoint so the action is a full-width row of its own, side
	   by side above it with the action pushed to the right edge. */
	.naglowek-strony {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
		margin: 16px 0 24px;
	}

	@media (min-width: 640px) {
		.naglowek-strony {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 24px;
		}
	}

	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale, exactly as
	   every other panel screen does. A role reassignment inside the scale, never a fifth
	   size. */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.komunikat {
		margin-bottom: 24px;
	}

	/* 32px between groups, the panel's field-group step, so the three drawers read as
	   separate things without a rule or a tint between them. */
	.grupa + .grupa {
		margin-top: 32px;
	}

	/* Baloo 700 20px ink, the section heading step. */
	.naglowek-grupy {
		margin: 0 0 12px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* One card holds one category's rows, and the row separators live inside it. */
	.karta {
		box-sizing: border-box;
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.lista {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The separator sits BETWEEN rows and never after the last one, so the card's own border
	   is the only thing that closes the list. Declared here rather than inside WierszListy
	   because two instances of that component are never siblings within its own scoped
	   stylesheet, and a rule written there would be compiled away. */
	.lista :global(li + li) {
		border-top: 1px solid var(--color-border-subtle);
	}

	/* The empty-category note. Nunito 400 15px muted, on the warm background rather than in a
	   card: an empty card cannot be told apart from a broken screen, which is the same reason
	   the whole-list empty state is a panel and not a card. */
	.pusta-kategoria {
		box-sizing: border-box;
		margin: 0;
		padding: 12px 16px;
		max-width: 65ch;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
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
