<script lang="ts">
	// Kontakt form island (CONTACT-03, RECRUIT-04, FORM-01, FORM-02; D-04, D-10,
	// D-11, D-12; 04-UI-SPEC.md Amendment v1.4 Component Contracts 1, 5, 6, 7, 8).
	//
	// The site's second hydrated island, after MobileNav. It collects the three
	// fields decision D-04 fixed, posts JSON to the endpoint proven in Plan 01, and
	// maps the returned machine code onto the Polish copy in $lib/content/forms. The
	// endpoint never carries prose and this component never invents a status.
	//
	// Three behaviours here are compliance obligations, not polish:
	//  1. A failure NEVER looks like a success (D-12, T-04-15). A thrown fetch, a body
	//     that is not the shared result shape, and every non-ok result all render the
	//     failure panel with the explicit "not sent" wording. There is no optimistic
	//     success path and no auto-retry that could hide an outcome.
	//  2. A failure keeps every typed value and resets the challenge before the button
	//     is usable again, because the token is single-use (T-04-16).
	//  3. Nothing is persisted client-side: no storage, no cookie, no URL parameter,
	//     and the consent state lives only in this component's memory for the life of
	//     the page (T-04-17).
	//
	// The client-side checks below are a user-experience affordance ONLY. The endpoint
	// re-validates shape, lengths, e-mail safety and consent, and its unit suite
	// proves it, so no branch in this file can produce a send (T-04-14).
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import ConsentBlock from './ConsentBlock.svelte';
	import FormField from './FormField.svelte';
	import TurnstileWidget from './TurnstileWidget.svelte';
	import { contact } from '$lib/content/site';
	import {
		KOPIA_BLEDOW,
		KOPIA_FALLBACK,
		KOPIA_KONTAKT,
		KOPIA_NOSCRIPT,
		TURNSTILE_SITEKEY,
		komunikatPola
	} from '$lib/content/forms';
	import type { FormCode, FormResult } from '$lib/forms/types';

	/** Control ids, declared once so the label association, the aria-describedby
	 *  wiring and the error-summary in-page links can never drift apart. */
	const ID_IMIE = 'kontakt-imie';
	const ID_EMAIL = 'kontakt-email';
	const ID_WIADOMOSC = 'kontakt-wiadomosc';
	const ID_ZGODA = 'kontakt-zgoda';

	/** Fixed render order for the error summary, so the list matches the visual order
	 *  of the controls instead of the insertion order of an object. */
	const KOLEJNOSC: { klucz: string; id: string }[] = [
		{ klucz: 'imie', id: ID_IMIE },
		{ klucz: 'email', id: ID_EMAIL },
		{ klucz: 'wiadomosc', id: ID_WIADOMOSC },
		{ klucz: 'zgoda', id: ID_ZGODA }
	];

	// Caps and patterns MIRRORED from src/lib/server/forms/ (validate.ts and
	// sanitize.ts). They exist so the parent gets an instant, Polish, specific
	// message instead of a round trip; the server remains the enforcement boundary
	// and the only place a value is trusted.
	const MAKS_IMIE = 100;
	const MAKS_EMAIL = 254;
	const MAKS_WIADOMOSC = 2000;
	const WZOR_EMAIL = /^[^\s@,;<>"]{1,64}@[a-zA-Z0-9.-]{1,190}\.[a-zA-Z]{2,}$/;

	/** Codes that mean "a field on this form needs correcting", as opposed to a
	 *  delivery failure. They drive the summary variant of the alert panel. */
	const KODY_POL: FormCode[] = ['walidacja', 'zgoda'];

	type Status = 'idle' | 'wysylanie' | 'ok' | 'blad';

	let imie = $state('');
	let email = $state('');
	let wiadomosc = $state('');
	let zgoda = $state(false);
	/** Honeypot value. Always empty for a real parent; the endpoint answers 200 and
	 *  skips the send when it arrives filled. */
	let strona = $state('');
	// The type parameters are explicit rather than annotations on the `let`: with an
	// annotation, control-flow analysis narrows the variable to its initial literal at
	// the point the derivations below read it, and every later comparison then looks
	// like dead code to the type checker.
	let token = $state<string | null>(null);

	let statusFormularza = $state<Status>('idle');
	let bledy = $state<Record<string, string>>({});
	let kod = $state<FormCode | null>(null);

	let widget: { reset: () => void } | undefined = $state();
	let panelBleduEl: HTMLElement | undefined = $state();
	let naglowekSukcesuEl: HTMLElement | undefined = $state();

	const wysylanie = $derived(statusFormularza === 'wysylanie');
	const kopiaBledu = $derived(kod === null ? null : KOPIA_BLEDOW[kod]);
	const podsumowaniePol = $derived(kod !== null && KODY_POL.includes(kod));
	const bledneKontrolki = $derived(KOLEJNOSC.filter(({ klucz }) => bledy[klucz] !== undefined));

	/** Build the per-field error record from the same short reason keys the server
	 *  returns, so client and server failures render identical Polish messages. */
	function sprawdz(): Record<string, string> {
		const wynik: Record<string, string> = {};

		const czysteImie = imie.trim();
		if (czysteImie.length === 0) wynik.imie = komunikatPola('imie', 'brak') ?? '';
		else if (czysteImie.length > MAKS_IMIE) wynik.imie = komunikatPola('imie', 'zbyt-dlugi') ?? '';

		const czystyEmail = email.trim();
		if (czystyEmail.length === 0) wynik.email = komunikatPola('email', 'brak') ?? '';
		else if (czystyEmail.length > MAKS_EMAIL)
			wynik.email = komunikatPola('email', 'zbyt-dlugi') ?? '';
		else if (!WZOR_EMAIL.test(czystyEmail))
			wynik.email = komunikatPola('email', 'niepoprawny') ?? '';

		const czystaWiadomosc = wiadomosc.trim();
		if (czystaWiadomosc.length === 0) wynik.wiadomosc = komunikatPola('wiadomosc', 'brak') ?? '';
		else if (czystaWiadomosc.length > MAKS_WIADOMOSC)
			wynik.wiadomosc = komunikatPola('wiadomosc', 'zbyt-dlugi') ?? '';

		// The consent copy is the panel body for this code, so the inline row message
		// and the summary line stay the same sentence.
		if (!zgoda) wynik.zgoda = tekstZgody();

		return wynik;
	}

	function tekstZgody(): string {
		return KOPIA_BLEDOW.zgoda.tresc
			.map((fragment) => (typeof fragment === 'string' ? fragment : fragment.mocne))
			.join('');
	}

	/** Focus is moved ONLY here, on a submit outcome: never on keystroke, never on
	 *  blur, never while the parent is typing (UI-SPEC focus-management contract). */
	async function przeniesFokus(): Promise<void> {
		await tick();
		if (statusFormularza === 'ok') naglowekSukcesuEl?.focus();
		else panelBleduEl?.focus();
	}

	function niepowodzenie(nowyKod: FormCode, pola: Record<string, string> = {}): void {
		kod = nowyKod;
		bledy = pola;
		statusFormularza = 'blad';
		// Reset BEFORE the button becomes usable again: the spent token would make the
		// retry fail a second time with a problem the parent cannot see or fix.
		widget?.reset();
	}

	async function wyslij(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (wysylanie) return;

		const problemy = sprawdz();
		if (Object.keys(problemy).length > 0) {
			// Nothing is sent, so nothing needs resetting: the token is still unspent.
			// A missing tick on its own gets the consent copy; anything else gets the
			// "popraw zaznaczone pola" summary.
			const tylkoZgoda = problemy.zgoda !== undefined && Object.keys(problemy).length === 1;
			kod = tylkoZgoda ? 'zgoda' : 'walidacja';
			bledy = problemy;
			statusFormularza = 'blad';
			await przeniesFokus();
			return;
		}

		if (token === null) {
			// The widget never issued a token (blocked, offline or expired). Saying so
			// immediately is more honest than a round trip that can only fail.
			niepowodzenie('turnstile');
			await przeniesFokus();
			return;
		}

		statusFormularza = 'wysylanie';
		bledy = {};
		kod = null;

		try {
			const odpowiedz = await fetch('/api/kontakt', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					imie: imie.trim(),
					email: email.trim(),
					wiadomosc: wiadomosc.trim(),
					zgoda,
					strona,
					turnstile: token
				})
			});

			const wynik = (await odpowiedz.json()) as FormResult;
			if (typeof wynik?.ok !== 'boolean') throw new Error('nieoczekiwana odpowiedz');

			if (wynik.ok) {
				statusFormularza = 'ok';
				await przeniesFokus();
				return;
			}

			const pola: Record<string, string> = {};
			for (const [klucz, powod] of Object.entries(wynik.pola ?? {})) {
				pola[klucz] = komunikatPola(klucz, powod) ?? '';
			}
			if (wynik.code === 'zgoda') pola.zgoda = tekstZgody();
			niepowodzenie(wynik.code, pola);
		} catch {
			// A thrown fetch and a body that is not the shared result shape are treated
			// exactly like a delivery failure, never like a success. Nothing is logged:
			// the payload carries personal data.
			niepowodzenie('wysylka');
		}
		await przeniesFokus();
	}
</script>

<!-- Static fallback, ALWAYS in the prerendered HTML and never revealed by script.
     One block serves three cases at once: the D-12 failure fallback, the visitor
     without JavaScript, and the visitor whose Turnstile widget cannot load
     (04-RESEARCH Pitfall 7). Its title is a paragraph, not a heading, so the page
     heading order stays unbroken. -->
<div class="fallback">
	<Info class="fallback-ikona" size={22} aria-hidden="true" focusable="false" />
	<div>
		<p class="fallback-tytul">{KOPIA_FALLBACK.naglowek}</p>
		<p class="fallback-tresc">
			Telefon: <a href={contact.phoneHref}>{contact.phoneDisplay}</a>. E-mail:
			<a href={`mailto:${contact.email}`}>{contact.email}</a>. Czynne {contact.hours}.
		</p>
	</div>
</div>

<noscript>
	<div class="fallback">
		<Info class="fallback-ikona" size={22} aria-hidden="true" focusable="false" />
		<p class="fallback-tresc">{KOPIA_NOSCRIPT}</p>
	</div>
</noscript>

<div class="karta">
	<!-- The id is the accessible name of the surrounding page section: the route
	     points its aria-labelledby here rather than emitting a second, invisible
	     heading that would duplicate this one. -->
	<h2 id="formularz-naglowek">{KOPIA_KONTAKT.naglowek}</h2>
	<p class="intro">{KOPIA_KONTAKT.intro}</p>

	{#if statusFormularza === 'ok'}
		<!-- Success replaces the form in place (D-11). Focus moves to the heading:
		     without that, the swap is completely invisible to a screen-reader user.
		     No animation, no confetti, no redirect. -->
		<div class="panel sukces" role="status">
			<CircleCheck class="sukces-ikona" size={44} aria-hidden="true" focusable="false" />
			<h3 bind:this={naglowekSukcesuEl} tabindex="-1">{KOPIA_KONTAKT.sukcesNaglowek}</h3>
			<p>{KOPIA_KONTAKT.sukcesTresc}</p>
		</div>
	{:else}
		<p class="nota">{KOPIA_KONTAKT.wymaganeNota}</p>

		{#if kopiaBledu !== null}
			<!-- One alert region, two bodies. A field problem lists in-page links to the
			     offending controls; a delivery failure states plainly that the message
			     was not sent and offers the direct fallback. The form and every typed
			     value stay intact underneath in both cases. -->
			<div class="panel awaria" role="alert" tabindex="-1" bind:this={panelBleduEl}>
				<p class="awaria-tytul">
					<CircleAlert class="awaria-ikona" size={22} aria-hidden="true" focusable="false" />
					<span>{kopiaBledu.naglowek}</span>
				</p>
				<p class="awaria-tresc">
					<!-- Keyed by position: the fragment list is a fixed, code-authored
					     sequence per failure code, so the index IS the stable identity. -->
					{#each kopiaBledu.tresc as fragment, i (i)}{#if typeof fragment === 'string'}{fragment}{:else}<strong
								>{fragment.mocne}</strong
							>{/if}{/each}
				</p>

				{#if podsumowaniePol && bledneKontrolki.length > 0}
					<ul class="lista-bledow">
						{#each bledneKontrolki as kontrolka (kontrolka.klucz)}
							<li><a href={`#${kontrolka.id}`}>{bledy[kontrolka.klucz]}</a></li>
						{/each}
					</ul>
				{:else if !podsumowaniePol}
					<p class="awaria-kontakt">
						<a href={contact.phoneHref}>{contact.phoneDisplay}</a>
						<a href={`mailto:${contact.email}`}>{contact.email}</a>
					</p>
				{/if}
			</div>
		{/if}

		<!-- Browser-native validation bubbles are unstyleable and English in some
		     locales, so the attribute below switches them off and the Polish messaging
		     is entirely ours. The `required` and `type` attributes stay for semantics
		     and for the right mobile keyboard. -->
		<form class="formularz" novalidate onsubmit={wyslij}>
			<FormField
				id={ID_IMIE}
				etykieta={KOPIA_KONTAKT.imieEtykieta}
				wymagane
				autocomplete="name"
				bind:wartosc={imie}
				blad={bledy.imie}
				wylaczone={wysylanie}
			/>

			<FormField
				id={ID_EMAIL}
				etykieta={KOPIA_KONTAKT.emailEtykieta}
				typ="email"
				wymagane
				autocomplete="email"
				podpowiedz={KOPIA_KONTAKT.emailPodpowiedz}
				bind:wartosc={email}
				blad={bledy.email}
				wylaczone={wysylanie}
			/>

			<FormField
				id={ID_WIADOMOSC}
				etykieta={KOPIA_KONTAKT.wiadomoscEtykieta}
				wymagane
				wieloliniowy
				podpowiedz={KOPIA_KONTAKT.wiadomoscPodpowiedz}
				bind:wartosc={wiadomosc}
				blad={bledy.wiadomosc}
				wylaczone={wysylanie}
			/>

			<!-- Honeypot. A real parent never reaches it: it is off-screen, out of the
			     tab order and hidden from assistive technology, so no visitor can ever
			     encounter it. Its name matches the key the endpoint inspects. -->
			<div class="wabik" aria-hidden="true">
				<label for="kontakt-strona">Strona</label>
				<input
					id="kontakt-strona"
					name="strona"
					type="text"
					tabindex="-1"
					autocomplete="off"
					bind:value={strona}
				/>
			</div>

			<TurnstileWidget
				bind:this={widget}
				sitekey={TURNSTILE_SITEKEY}
				onToken={(t) => (token = t)}
			/>

			<ConsentBlock
				id={ID_ZGODA}
				tekst={KOPIA_KONTAKT.zgoda}
				etykietaKlauzuli={KOPIA_KONTAKT.klauzulaEtykieta}
				bind:zaznaczone={zgoda}
				blad={bledy.zgoda}
				wylaczone={wysylanie}
			/>

			<div class="wiersz-wyslij">
				<button class="przycisk" type="submit" disabled={wysylanie} aria-busy={wysylanie}>
					{wysylanie ? KOPIA_KONTAKT.wysylanie : KOPIA_KONTAKT.wyslij}
				</button>
			</div>
		</form>
	{/if}
</div>

<!-- The ONE polite live region, permanently present so it is never inserted and
     re-announced. It carries the sending line only: success and failure are
     announced by the panels above, and duplicating them here would make a screen
     reader say everything twice. -->
<p class="linia-statusu" role="status" aria-live="polite">
	{wysylanie ? KOPIA_KONTAKT.statusWysylania : ''}
</p>

<style>
	/* Static fallback + noscript panel: tint-blue surface, radius-md, 16 -> 24px
	   padding, brand-blue info icon, ink 15px text (UI-SPEC Contract 8). */
	.fallback {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		max-width: 46rem;
		margin: 0 auto 24px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-tint-blue);
	}

	@media (min-width: 768px) {
		.fallback {
			padding: 24px;
		}
	}

	.fallback :global(.fallback-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}

	.fallback-tytul {
		margin: 0 0 4px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.fallback-tresc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.fallback-tresc a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.fallback-tresc a:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Form card: white surface, radius-lg, medium shadow, 2px band border,
	   24 -> 32px padding, max 46rem, centred (UI-SPEC Contract 1). */
	.karta {
		box-sizing: border-box;
		max-width: 46rem;
		margin: 0 auto;
		padding: 24px;
		border: 2px solid var(--color-band);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: 0 8px 20px rgb(15 23 42 / 0.08);
	}

	@media (min-width: 768px) {
		.karta {
			padding: 32px;
		}
	}

	.karta h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.intro {
		margin: 16px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.nota {
		margin: 16px 0 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.panel {
		margin-top: 24px;
		padding: 16px;
		border-radius: var(--radius-md);
	}

	@media (min-width: 768px) {
		.panel {
			padding: 24px;
		}
	}

	/* Failure surfaces: danger-surface with a 2px danger border. The heading is
	   danger on that tint (5.92:1) and the body is ink on it (13.38:1). */
	.awaria {
		border: 2px solid var(--color-danger);
		background: var(--color-danger-surface);
	}

	.awaria-tytul {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-danger);
	}

	.awaria-tytul :global(.awaria-ikona) {
		flex: none;
	}

	.awaria-tresc {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.lista-bledow {
		margin: 12px 0 0;
		padding-left: 20px;
	}

	.lista-bledow li {
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.lista-bledow a,
	.awaria-kontakt a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.lista-bledow a:hover,
	.awaria-kontakt a:hover {
		color: var(--color-brand-blue-hover);
	}

	.awaria-kontakt {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		margin: 12px 0 0;
	}

	/* Success panel: tint-green surface, ink heading (12.66:1), muted body (6.55:1),
	   brand-blue icon (5.13:1). No animation of any kind (UI-SPEC Contract 7b). */
	.sukces {
		background: var(--color-tint-green);
		padding: 24px;
	}

	@media (min-width: 768px) {
		.sukces {
			padding: 32px;
		}
	}

	.sukces :global(.sukces-ikona) {
		color: var(--color-brand-blue);
	}

	.sukces h3 {
		margin: 16px 0 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.sukces p {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* 24px between field blocks (UI-SPEC Spacing `lg`). */
	.formularz {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-top: 24px;
	}

	/* Honeypot: off the screen, not in the tab order, hidden from assistive
	   technology. Deliberately NOT display:none, which is the first thing a scripted
	   submitter checks for. */
	.wabik {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.wiersz-wyslij {
		display: flex;
	}

	/* Primary Cta box reproduced exactly (v1.2 §4): pill, amber fill, ink label, the
	   3px solid drop shadow, hover lift, pressed flip on active and focus-visible.
	   Cta.svelte renders an anchor and cannot be reused for a form submit. */
	.przycisk {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-sizing: border-box;
		width: 100%;
		min-height: 44px;
		padding: 12px 24px;
		border: 2px solid transparent;
		border-radius: var(--radius-pill);
		background: var(--color-accent);
		color: var(--color-ink);
		box-shadow: 0 3px 0 var(--color-accent-active);
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			box-shadow 150ms ease,
			transform 150ms ease;
	}

	@media (min-width: 640px) {
		.przycisk {
			width: auto;
		}
	}

	.przycisk:hover:not(:disabled) {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 5px 0 var(--color-accent-active);
	}

	/* Pressed state: the label flips to white, which is the ONLY white-on-amber
	   pairing that meets AA (4.6:1 on the darkest amber). */
	.przycisk:active:not(:disabled),
	.przycisk:focus-visible {
		background: var(--color-accent-active);
		color: #ffffff;
	}

	.przycisk:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: 0 1px 0 var(--color-accent-active);
	}

	/* Sending: disabled with aria-busy and the label swapped. No spinner, so there is
	   nothing to disable under reduced motion and nothing that can fail to load. */
	.przycisk:disabled {
		cursor: not-allowed;
		opacity: 0.75;
		transform: none;
	}

	/* The polite region is invisible but never removed from the DOM: an inserted live
	   region can be missed entirely by a screen reader. */
	.linia-statusu {
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

	/* Component-scoped guard for the only transitions this island introduces, in
	   addition to the global base-layer neutraliser in app.css (WCAG 2.3.3). */
	@media (prefers-reduced-motion: reduce) {
		.przycisk,
		.przycisk:hover:not(:disabled),
		.przycisk:active:not(:disabled) {
			transition: none;
			transform: none;
		}
	}
</style>
