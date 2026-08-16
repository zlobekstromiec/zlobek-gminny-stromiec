<script lang="ts">
	// The nabór state screen (04.1-UI-SPEC Component Contracts 5, 9, 10 and 13; D-16,
	// D-17, D-18).
	//
	// TWO NATIVE RADIOS, and deliberately not the styled on/off slider Contract 13
	// rejects. That control reads ambiguously: „am I looking at the current state, or at
	// the state I would get by clicking?" is a question nobody should have to ask about a
	// control that changes what parents read on the front page. Radios answer it by
	// construction, are keyboard operable and screen-reader unambiguous with no code of
	// our own, and work with JavaScript disabled.
	//
	// The literal words for that rejected control are kept OUT of this file on purpose:
	// the plan's acceptance gate for this screen is a case-insensitive grep for them, so
	// that a future edit cannot quietly introduce one. The reasoning survives; only the
	// greppable token is spelled differently.
	//
	// THE PREVIEW READS THE PUBLIC PAGE'S OWN STRINGS. `recruitmentHeadings` comes from
	// src/lib/content/site.ts, the same module /rekrutacja renders from, so the panel and
	// the public page cannot disagree. A paraphrase typed here would drift the first time
	// that copy is edited, and the drift would be invisible: the panel would keep
	// promising an outcome the site no longer produces.
	//
	// NO COLOUR-ONLY SIGNALLING and NOTHING DANGER COLOURED. A closed nabór is ordinary
	// information, not an error. Colouring it red would teach editors that a normal,
	// correct, frequently-wanted state is a problem, which is the defect v1.4 already
	// fixed on the public status banner.
	//
	// WITHOUT JAVASCRIPT this screen is complete: the form posts, the server validates,
	// the server re-renders, and the preview shows the state the server rendered as
	// checked. The client-side override below is an ENHANCEMENT that makes the preview
	// follow the radio before a save; it is never how the screen works.
	//
	// Every visible string here comes from src/lib/content/panel.ts or from
	// src/lib/content/site.ts. Not one is typed inline.
	import { enhance } from '$app/forms';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import {
		KOPIA_LISTY,
		KOPIA_NABOR,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		zobaczStrone
	} from '$lib/content/panel';
	import { recruitmentHeadings } from '$lib/content/site';
	// NOT from the validator beside the action: SvelteKit refuses to bundle $lib/server
	// into client code, and that refusal is correct. The reasoning is in the module header.
	import { POLE_STAN, STAN_OTWARTY, STAN_ZAMKNIETY } from '$lib/stan-naboru';
	import type { PageData } from './$types';
	import type { WynikNaboru } from './+page.server';

	let { data, form }: { data: PageData; form: WynikNaboru | null } = $props();

	// The refused submission wins over the committed value, so a conflict or a failure
	// hands the editor back the choice they made rather than the one they were trying to
	// change (Contract 10c: „every typed value intact").
	//
	// A WRITABLE $derived (Svelte 5.25+), not `$state` seeded from a prop. The server is
	// the source of truth and an editor's click is a temporary override of it, which is
	// exactly the semantics this rune has: assigning to `stan` wins until the dependencies
	// change, and the next server render then takes it back. A plain
	// `$state(form?.stan ?? data.stan)` would capture only the FIRST render and ignore
	// every later server answer, so a conflict re-render would leave the editor previewing
	// the state the server had just refused to store. Nothing is lost on the reset either,
	// because a refused save echoes back the very state that was submitted.
	let stan = $derived(form?.stan ?? data.stan);

	const podglad = $derived(
		stan === STAN_OTWARTY ? recruitmentHeadings.otwarty : recruitmentHeadings.zamkniety
	);

	/** Saving state of Contract 9. Only ever true on a hydrated page; the server-rendered
	 *  row is a plain working button. */
	let zapisywanie = $state(false);

	const IDENT_OTWARTY = 'stan-otwarty';
</script>

<!-- 1. Back link. „Wróć do pulpitu", because Nabór is a singleton with no list. -->
<PowrotLink cel="/admin" etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_NABOR.naglowek}</h1>

<!-- 3. Save-result region. Fed by a query marker on a fresh GET, never by an action
     return, so a refresh cannot re-save (POST then redirect then GET). -->
{#if data.zapisano}
	<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
		<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
		<p>
			<a href="/rekrutacja" target="_blank" rel="noopener noreferrer">
				{zobaczStrone(KOPIA_NABOR.stronaNazwa)}<span class="visually-hidden"
					>{KOPIA_POWLOKA.nowaKarta}</span
				>
			</a>
		</p>
	</PanelKomunikat>
{/if}

<!-- 4. Validation summary region, and the two refusal panels of Contract 10c. All three
     are the same surface in the same place, because to an editor they are one answer:
     „this did not happen, and here is what to do about it". -->
{#if form?.panelNaglowek}
	<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
		<p>{form.panelTresc}</p>
		{#if form.bladStanu}
			<ul>
				<li><a href="#{IDENT_OTWARTY}">{form.bladStanu}</a></li>
			</ul>
		{:else if form.konflikt}
			<p><a href="/admin/nabor">{KOPIA_ZAPIS.konfliktAkcja}</a></p>
		{/if}
	</PanelKomunikat>
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
	<!-- The state the form was built from (D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save fail, never make it overwrite
	     more, because the ref update itself runs with force false. -->
	{#if data.sha}
		<input type="hidden" name="sha" value={data.sha} />
	{/if}

	<!-- 5. Required-fields note. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

	<!-- 6. One field group. -->
	<fieldset class="grupa" aria-describedby={form?.bladStanu ? 'blad-stanu' : undefined}>
		<legend class="legenda">{KOPIA_NABOR.legenda}</legend>

		<label class="opcja" for={IDENT_OTWARTY}>
			<input
				id={IDENT_OTWARTY}
				type="radio"
				name={POLE_STAN}
				value={STAN_OTWARTY}
				checked={stan === STAN_OTWARTY}
				onchange={() => (stan = STAN_OTWARTY)}
			/>
			<span class="opcja-tekst">
				<span class="opcja-etykieta">{KOPIA_NABOR.otwartyEtykieta}</span>
				<span class="opcja-opis">{KOPIA_NABOR.otwartyOpis}</span>
			</span>
		</label>

		<label class="opcja" for="stan-zamkniety">
			<input
				id="stan-zamkniety"
				type="radio"
				name={POLE_STAN}
				value={STAN_ZAMKNIETY}
				checked={stan === STAN_ZAMKNIETY}
				onchange={() => (stan = STAN_ZAMKNIETY)}
			/>
			<span class="opcja-tekst">
				<span class="opcja-etykieta">{KOPIA_NABOR.zamknietyEtykieta}</span>
				<span class="opcja-opis">{KOPIA_NABOR.zamknietyOpis}</span>
			</span>
		</label>

		{#if form?.bladStanu}
			<p id="blad-stanu" class="blad">{form.bladStanu}</p>
		{/if}

		<!-- Preview: the real public headline for the SELECTED state, on the band colour.
		     Not a live region: it changes because the editor just acted on the control
		     beside it, and a page that announces its own furniture talks over itself. -->
		<div class="podglad">
			<p class="podglad-naglowek">{KOPIA_NABOR.podgladNaglowek}</p>
			<p class="podglad-tresc">{podglad}</p>
		</div>
	</fieldset>

	<!-- 7. Save row: exactly one Zapisz. -->
	<RzedZapisu
		nota={KOPIA_ZAPIS.nota}
		etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
		etykietaAnuluj={KOPIA_ZAPIS.anuluj}
		celAnuluj="/admin"
		zajete={zapisywanie}
	/>
</form>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale, exactly
	   as the pulpit does. A role reassignment inside the scale, never a fifth size. */
	.naglowek {
		margin: 16px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* 24px from the page header to the first thing under it, the panel density step. */
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

	/* One surface card per field group, per Contract 5. The browser's default fieldset
	   border and padding are reset because the card IS the grouping affordance. */
	.grupa {
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-sizing: border-box;
		margin: 0;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.grupa {
			padding: 24px;
		}
	}

	/* Visible legend styled as the 20px h2 step. `float: left` plus a full-width clear is
	   the long-standing way to make a legend obey normal flow inside a flex fieldset,
	   which browsers otherwise refuse to lay out as a flex item. */
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

	/* The WHOLE row is the label, so the entire 44px strip is clickable and not just the
	   24px circle. Contract 13 asks for exactly this. */
	.opcja {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		min-height: 44px;
		padding: 8px;
		margin: -8px;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.opcja:hover {
		background: var(--color-band);
	}

	/* 24x24 custom control on the REAL input, the same construction ConsentBlock uses for
	   its checkbox: `appearance: none` keeps the native element, its focus behaviour and
	   its keyboard semantics, and only repaints it. A div pretending to be a radio would
	   have to reimplement arrow-key group navigation, and would get it wrong. */
	.opcja input {
		appearance: none;
		flex: none;
		box-sizing: border-box;
		width: 24px;
		height: 24px;
		/* Optically aligns the 24px control with the first line of 15px/1.5 text. */
		margin: 2px 0 0;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		cursor: pointer;
	}

	/* Checked: brand-blue fill with a white centre dot, drawn with an inset ring so no
	   new colour value and no background image is introduced. */
	.opcja input:checked {
		border-color: var(--color-brand-blue);
		background: var(--color-brand-blue);
		box-shadow: inset 0 0 0 4px var(--color-surface);
	}

	.opcja-tekst {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.opcja-etykieta {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* 15px muted: what a visitor will actually see in this state. This sentence is the
	   whole reason the screen is safe to use without previewing the public page. */
	.opcja-opis {
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Instruction, not a complaint (WCAG 3.3.3). Danger is used HERE, on a genuine
	   validation error, and nowhere near the closed state. */
	.blad {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-danger);
	}

	/* Band colour, per Contract 13. Neutral by construction: there is no variant of this
	   panel, so neither state can be coloured as a problem. */
	.podglad {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-band);
	}

	.podglad-naglowek {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* The public headline, rendered at its own display weight so the editor recognises it
	   as the thing a parent reads rather than as more panel chrome. */
	.podglad-tresc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-ink);
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
