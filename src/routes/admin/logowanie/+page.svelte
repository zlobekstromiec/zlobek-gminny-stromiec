<script lang="ts">
	// Logowanie: 04.1-UI-SPEC.md Component Contract 2 in full, both steps and the whole
	// login state matrix.
	//
	// THIS SCREEN REQUIRES NO JAVASCRIPT (D-17). Both steps are plain form posts to the
	// two actions in +page.server.ts, and every piece of state it renders arrives in the
	// action result. Nothing here fetches, nothing here stores and nothing here decides:
	// a screen that decided anything about a login would be a second authentication
	// boundary sitting in a place an attacker controls.
	//
	// It renders NO public chrome. src/routes/admin/+layout.svelte gives this one path
	// a bare shell (skip link, Seo, main) precisely so the person in front of it sees a
	// single card and nothing to click by mistake.
	//
	// Every string comes from src/lib/content/panel.ts. There is deliberately no „nie
	// znaleziono" branch to render, because there is no such string to render: D-02
	// makes the step 2 screen byte-identical whether or not the address is on the
	// allowlist, and the copy module is where that promise is kept.
	//
	// FOCUS (UI-SPEC focus management contract). At most ONE element is focused on
	// render, chosen in the order the matrix implies: a panel outranks a field, because
	// a panel explains why the field is there. The mechanism is the `autofocus`
	// attribute rather than an effect, because the screen has to work with JavaScript
	// disabled and an effect would simply never run.
	import FormField from '$lib/components/FormField.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PoleKodu from '$lib/components/admin/PoleKodu.svelte';
	import Przycisk from '$lib/components/admin/Przycisk.svelte';
	import { KOPIA_LOGOWANIE, wyslanoKodNa } from '$lib/content/panel';
	import { page } from '$app/state';
	import logoMark from '$lib/assets/brand/logo-mark.png?enhanced';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	/** Reading url.searchParams is safe only because src/routes/admin/+layout.ts opts
	 *  the whole panel out of prerendering. */
	const powod = $derived(page.url.searchParams.get('powod'));

	/** The neutral band panel above the card. Expected events, never danger-coloured:
	 *  colouring a normal logout as a failure teaches editors to distrust the panel.
	 *  Suppressed once an action has answered, so a stale query parameter cannot sit
	 *  above a fresh error. */
	const pasmo = $derived(
		form
			? undefined
			: powod === 'wygasla'
				? KOPIA_LOGOWANIE.sesjaWygasla
				: powod === 'wylogowano'
					? KOPIA_LOGOWANIE.wylogowano
					: powod === 'zablokowana'
						? KOPIA_LOGOWANIE.stronaZablokowana
						: undefined
	);

	const krok = $derived(form?.krok === 2 ? 2 : 1);
	const adres = $derived(form?.adres ?? '');
	const bladAdresu = $derived(form?.bladAdresu);
	const bladKodu = $derived(form?.bladKodu);
	const panelNaglowek = $derived(form?.panelNaglowek);
	const panelTresc = $derived(form?.panelTresc);

	const panelWidoczny = $derived(Boolean(panelNaglowek) || Boolean(pasmo));
	const fokusKodu = $derived(krok === 2 && !panelWidoczny);
	const fokusAdresu = $derived(krok === 1 && !panelWidoczny && Boolean(bladAdresu));
</script>

<div class="ekran">
	<span class="emblemat">
		<enhanced:img src={logoMark} alt="" sizes="52px" />
	</span>

	{#if pasmo}
		<PanelKomunikat rodzaj="neutralny" fokus={true}>{pasmo}</PanelKomunikat>
	{/if}

	<div class="karta">
		<h1 class="naglowek">{KOPIA_LOGOWANIE.naglowek}</h1>
		<p class="lead">{KOPIA_LOGOWANIE.lead}</p>

		{#if panelNaglowek && panelTresc}
			<PanelKomunikat rodzaj="blad" naglowek={panelNaglowek} fokus={true}>
				{panelTresc}
			</PanelKomunikat>
		{/if}

		{#if krok === 1}
			<!-- `novalidate`: the browser's own validation bubble is rendered in the
			     BROWSER's locale, not the page's, so on an English-locale machine it
			     would put English in an otherwise fully Polish panel. The required and
			     type attributes stay for semantics and for the mobile keyboard; every
			     message the editor actually reads is authored Polish from the server. -->
			<form class="formularz" method="POST" action="?/wyslij" novalidate>
				<FormField
					id="adres"
					nazwa="adres"
					typ="email"
					autocomplete="email"
					wymagane={true}
					etykieta={KOPIA_LOGOWANIE.adresEtykieta}
					podpowiedz={KOPIA_LOGOWANIE.adresPodpowiedz}
					blad={bladAdresu}
					wartosc={adres}
					autofokus={fokusAdresu}
				/>
				<Przycisk pelnaSzerokosc={true}>{KOPIA_LOGOWANIE.adresPrzycisk}</Przycisk>
			</form>
		{:else}
			<h2 class="podnaglowek">{KOPIA_LOGOWANIE.kodNaglowek}</h2>
			<p class="tresc">{KOPIA_LOGOWANIE.kodTresc}</p>
			<p class="echo">{wyslanoKodNa(adres)}</p>

			<form class="formularz" method="POST" action="?/zaloguj" novalidate>
				<input type="hidden" name="adres" value={adres} />
				<PoleKodu
					etykieta={KOPIA_LOGOWANIE.kodEtykieta}
					podpowiedz={KOPIA_LOGOWANIE.kodPodpowiedz}
					blad={bladKodu}
					autofokus={fokusKodu}
				/>
				<Przycisk pelnaSzerokosc={true}>{KOPIA_LOGOWANIE.kodPrzycisk}</Przycisk>
			</form>

			<!-- „Wyślij kod ponownie" performs an action, so it is a button in its own
			     form, never a link. It is a SIBLING of the form above rather than nested
			     inside it, because nested forms are not valid HTML and browsers resolve
			     them by dropping one. -->
			<div class="drugorzedne">
				<form method="POST" action="?/wyslij" novalidate>
					<input type="hidden" name="adres" value={adres} />
					<Przycisk wariant="secondary">{KOPIA_LOGOWANIE.ponowneWyslanie}</Przycisk>
				</form>
				<a class="odnosnik" href="/admin/logowanie">{KOPIA_LOGOWANIE.innyAdres}</a>
			</div>
		{/if}
	</div>
</div>

<style>
	/* The card is offset from the top rather than centred in the viewport: a
	   vertically centred card JUMPS the moment an error panel appears above it, which
	   is the one movement this screen must not make. */
	.ekran {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		width: 100%;
		max-width: 28rem;
		margin: 0 auto;
	}

	.emblemat {
		display: flex;
	}

	.emblemat :global(img) {
		display: block;
		height: 52px;
		width: auto;
	}

	.karta {
		display: flex;
		flex-direction: column;
		gap: 24px;
		box-sizing: border-box;
		width: 100%;
		padding: 24px;
		background: var(--color-surface);
		border: 2px solid var(--color-band);
		border-radius: var(--radius-lg);
		box-shadow:
			0 4px 6px rgb(15 23 42 / 0.05),
			0 2px 4px rgb(15 23 42 / 0.05);
	}

	@media (min-width: 768px) {
		.karta {
			padding: 32px;
		}
	}

	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.podnaglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.lead,
	.tresc,
	.echo {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* Title and lead belong together, so the 24px card rhythm does not open between
	   them. Same for the step 2 heading and its body. */
	.naglowek + .lead,
	.podnaglowek + .tresc {
		margin-top: -16px;
	}

	.tresc + .echo {
		margin-top: -16px;
	}

	/* The echoed address is the person's own input on their own screen, printed so a
	   typo is visible. It reaches no log, no commit and no other page (T-04.1-07). */
	.echo {
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.formularz {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Two secondary actions on one row, wrapping below sm. */
	.drugorzedne {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
		margin-top: -8px;
	}

	.odnosnik {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.odnosnik:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
