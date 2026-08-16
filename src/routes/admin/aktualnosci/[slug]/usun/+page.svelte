<script lang="ts">
	// The delete confirmation page (04.1-UI-SPEC Component Contract 11). The project's
	// first destructive screen.
	//
	// A PAGE, NOT A DIALOG. A dialog needs JavaScript, a focus trap and an escape route,
	// and this panel has to work with scripting switched off (D-17). A page needs none of
	// the three and cannot be dismissed by accident.
	//
	// FOCUS LANDS ON THE H1, which is why it carries a negative tab index: the question
	// „Usunąć ten wpis?" is what the editor must read first. The destructive control is
	// never the first focusable element and is never focused on arrival. Contract 11 says
	// so and this file is where that is true or false.
	//
	// NO TYPED CONFIRMATION and NO SECOND CONFIRMATION. For the people this panel is
	// written for, friction of that kind teaches clicking through warnings, which makes
	// every later warning weaker. One clear page and two clearly different controls.
	//
	// THE COPY NEVER PROMISES RECOVERY. It says the operation cannot be undone in the
	// panel, which is true, and stops there. A git history an editor cannot reach is not
	// an undo they can rely on.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import { page } from '$app/state';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import Przycisk from '$lib/components/admin/Przycisk.svelte';
	import {
		KOPIA_LISTY,
		KOPIA_USUWANIE,
		KOPIA_ZAPIS,
		trescUsunieciaWpisu
	} from '$lib/content/panel';
	import { POLE_SHA } from '$lib/pola-wpisu';
	import type { PageData } from './$types';
	import type { WynikUsuniecia } from './+page.server';

	let { data, form }: { data: PageData; form: WynikUsuniecia | null } = $props();

	const LISTA = '/admin/aktualnosci';
</script>

<!-- 1. Back link. „Anuluj", because on this screen going back IS cancelling. -->
<PowrotLink cel={LISTA} etykieta={KOPIA_USUWANIE.anuluj} />

{#if !data.znaleziony}
	<!-- The entry is gone, most likely deleted by somebody else. The heading is still the
	     screen's one h1, so the document outline holds. -->
	<h1 class="naglowek">{KOPIA_ZAPIS.brakTresciNaglowek}</h1>
	<p class="tresc">{KOPIA_ZAPIS.brakTresciTresc}</p>
	<p class="powrot"><a href={LISTA}>{KOPIA_LISTY.powrotLista}</a></p>
{:else}
	<!-- 2. The h1, phrased as a question and focused on arrival. `autofocus` rather than an
	     effect: an effect never runs on a screen that must work without JavaScript, and
	     this is the one element this page exists to make somebody read. -->
	<!-- svelte-ignore a11y_autofocus -->
	<h1 class="naglowek" tabindex="-1" autofocus>{KOPIA_USUWANIE.wpisNaglowek}</h1>

	{#if form?.panelNaglowek}
		<div class="komunikat">
			<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
				<p>{form.panelTresc}</p>
				{#if form.konflikt}
					<!-- „Odśwież stronę" points at THIS page, so the editor re-reads the entry as
					     it is now before deciding again. Built from the current pathname rather
					     than from the slug, so it cannot drift if the route ever moves. -->
					<p><a href={page.url.pathname}>{KOPIA_ZAPIS.konfliktAkcja}</a></p>
				{/if}
			</PanelKomunikat>
		</div>
	{/if}

	<!-- 3. Exactly what disappears, quoted: the title and the Polish date, so the editor
	     confirms against the entry in front of them and not against a memory of it. -->
	<div class="karta">
		<p class="tresc">{trescUsunieciaWpisu(data.tytul, data.data)}</p>
	</div>

	<!-- 4. Button row. The danger control is a real submit inside a POST form; „Anuluj" is
	     a link, because cancelling navigates and performs nothing. -->
	<form method="POST" novalidate class="rzad">
		{#if data.sha}
			<input type="hidden" name={POLE_SHA} value={data.sha} />
		{/if}
		<Przycisk wariant="danger" pelnaSzerokosc>{KOPIA_USUWANIE.wpisPrzycisk}</Przycisk>
		<a class="anuluj" href={LISTA}>{KOPIA_USUWANIE.anuluj}</a>
	</form>
{/if}

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. The
	   focus ring is the global one and is NOT removed even though this heading is only
	   ever focused programmatically: a visible ring is how a sighted keyboard user sees
	   where the page just moved them. */
	.naglowek {
		margin: 16px 0 24px;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.komunikat {
		margin-bottom: 24px;
	}

	/* One surface card, the panel density step. Neutral, not danger coloured: the card
	   states a fact about an entry that still exists. Danger belongs to the control that
	   removes it and to the panel that reports a failure, never to the description. */
	.karta {
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

	.tresc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.powrot {
		margin: 24px 0 0;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.5;
	}

	.powrot a {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	/* 48px from the card, the same separation the save row keeps on an edit screen, so the
	   destructive control is never adjacent to the text an editor is still reading. */
	.rzad {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
		margin-top: 48px;
	}

	@media (min-width: 640px) {
		.rzad {
			flex-direction: row;
			align-items: center;
			gap: 24px;
		}
	}

	/* Secondary link, not a third control. Blue AND underlined, never colour alone, with
	   its own 44px target so it is not a hairline tap zone under the button on a phone. */
	.anuluj {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	@media (min-width: 640px) {
		.anuluj {
			justify-content: flex-start;
		}
	}
</style>
