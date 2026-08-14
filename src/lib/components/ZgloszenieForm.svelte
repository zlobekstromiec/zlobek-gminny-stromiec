<script lang="ts">
	// Zgłoszenie (waiting-list) form island (RECRUIT-03, RECRUIT-04, FORM-01,
	// FORM-02; D-01, D-02, D-10, D-11, D-12; 04-UI-SPEC.md Amendment v1.4 Component
	// Contracts 1, 2, 5, 6, 7, 8).
	//
	// The site's third hydrated island, and a close mirror of KontaktForm: same
	// structure, same status regions, same focus-management contract, same honeypot,
	// same static fallback, same card and submit-button treatment. It differs in the
	// fields it collects and the copy it renders. Sharing FormField, ConsentBlock and
	// TurnstileWidget means both forms have ONE accessibility contract rather than two
	// that drift.
	//
	// Two obligations are specific to this form:
	//  1. Data minimisation (D-02, T-04-24). There is NO control for the child's given
	//     name or family name anywhere in this markup. The only datum about the child
	//     is the month and the year of birth, used for age eligibility, and the hint
	//     beside those two selects asks the parent not to write a name either. Adding
	//     such a field later would be a RODO regression, and the endpoint would drop
	//     the value regardless.
	//  2. Honesty about what this is (D-01). Recruitment wnioski are accepted in
	//     person at the Urząd Gminy only, so the intro and the success panel both say
	//     that this form is an expression of interest and where the formal wniosek
	//     goes. A parent must never leave believing something has been filed.
	//
	// Everything else carries over from the contact island: a failure never looks like
	// a success, a failure keeps every typed value and resets the single-use challenge
	// before the button is usable again, and nothing is persisted client-side (no
	// storage, no cookie, no URL parameter). The client-side checks are a
	// user-experience affordance ONLY: the endpoint re-validates shape, ranges,
	// e-mail safety and consent, and its unit suite proves it.
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
		KOPIA_NOSCRIPT,
		KOPIA_ZGLOSZENIE,
		MIESIACE_WYBOR,
		TURNSTILE_SITEKEY,
		komunikatPola
	} from '$lib/content/forms';
	import type { FormCode, FormResult } from '$lib/forms/types';

	/** Control ids, declared once so the label association, the aria-describedby
	 *  wiring and the error-summary in-page links can never drift apart. */
	const ID_IMIE = 'zgloszenie-imie';
	const ID_EMAIL = 'zgloszenie-email';
	const ID_TELEFON = 'zgloszenie-telefon';
	const ID_MIESIAC = 'zgloszenie-miesiac';
	const ID_ROK = 'zgloszenie-rok';
	const ID_WIADOMOSC = 'zgloszenie-wiadomosc';
	const ID_ZGODA = 'zgloszenie-zgoda';
	/** The birth-date group is described as a group, not per control: the hint and the
	 *  error belong to the whole question, so they hang off the fieldset. */
	const ID_URODZENIE_PODPOWIEDZ = 'zgloszenie-urodzenie-hint';
	const ID_URODZENIE_BLAD = 'zgloszenie-urodzenie-err';

	/** Fixed render order for the error summary, so the list matches the visual order
	 *  of the controls instead of the insertion order of an object. The birth-date
	 *  group appears ONCE under the synthetic `urodzenie` key and links to the month
	 *  select, which is the first control of the pair. */
	const KOLEJNOSC: { klucz: string; id: string }[] = [
		{ klucz: 'imie', id: ID_IMIE },
		{ klucz: 'email', id: ID_EMAIL },
		{ klucz: 'telefon', id: ID_TELEFON },
		{ klucz: 'urodzenie', id: ID_MIESIAC },
		{ klucz: 'wiadomosc', id: ID_WIADOMOSC },
		{ klucz: 'zgoda', id: ID_ZGODA }
	];

	// Caps and patterns MIRRORED from src/lib/server/forms/ (validate.ts and
	// sanitize.ts). They exist so the parent gets an instant, Polish, specific
	// message instead of a round trip; the server remains the enforcement boundary
	// and the only place a value is trusted.
	const MAKS_IMIE = 100;
	const MAKS_EMAIL = 254;
	const MAKS_TELEFON = 24;
	const MAKS_WIADOMOSC = 2000;
	const WZOR_EMAIL = /^[^\s@,;<>"]{1,64}@[a-zA-Z0-9.-]{1,190}\.[a-zA-Z]{2,}$/;
	const WZOR_TELEFON = /^\+?[0-9 -]+$/;

	/** Codes that mean "a field on this form needs correcting", as opposed to a
	 *  delivery failure. They drive the summary variant of the alert panel. */
	const KODY_POL: FormCode[] = ['walidacja', 'zgoda'];

	/** Birth-year options, computed once at component initialisation: next year down
	 *  to four years back, which covers the statut range with room for a baby not yet
	 *  born. The server accepts a slightly wider window, so every option here is
	 *  always acceptable, and the current year is present even if a build sits across
	 *  a new year without a redeploy. */
	const BIEZACY_ROK = new Date().getFullYear();
	const LATA: number[] = Array.from(
		{ length: 6 },
		(_, przesuniecie) => BIEZACY_ROK + 1 - przesuniecie
	);

	type Status = 'idle' | 'wysylanie' | 'ok' | 'blad';

	let imie = $state('');
	let email = $state('');
	let telefon = $state('');
	let wiadomosc = $state('');
	/** Select values are strings: the endpoint parses them as base-ten integers and
	 *  an untouched select posts the empty string, which it reads as "not answered". */
	let miesiac = $state('');
	let rok = $state('');
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
	/** The server validates the two selects separately and answers under the miesiac
	 *  and rok keys. To the parent they are one question with one message, so whichever
	 *  arrives first is what the group renders. */
	const bladUrodzenia = $derived(bledy.miesiac ?? bledy.rok);
	const opisyUrodzenia = $derived(
		bladUrodzenia ? `${ID_URODZENIE_PODPOWIEDZ} ${ID_URODZENIE_BLAD}` : ID_URODZENIE_PODPOWIEDZ
	);
	const nieprawidloweUrodzenie = $derived(bladUrodzenia ? ('true' as const) : undefined);
	const bledneKontrolki = $derived(
		KOLEJNOSC.map(({ klucz, id }) => ({
			id,
			tekst: klucz === 'urodzenie' ? bladUrodzenia : bledy[klucz]
		})).filter((wpis) => wpis.tekst !== undefined)
	);

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

		// The two optional fields are only checked when the parent actually typed
		// something: an untouched control is a valid answer, never an error.
		const czystyTelefon = telefon.trim();
		if (czystyTelefon.length > 0) {
			if (czystyTelefon.length > MAKS_TELEFON || !WZOR_TELEFON.test(czystyTelefon))
				wynik.telefon = komunikatPola('telefon', 'niepoprawny') ?? '';
		}

		if (miesiac.length === 0) wynik.miesiac = komunikatPola('miesiac', 'brak') ?? '';
		if (rok.length === 0) wynik.rok = komunikatPola('rok', 'brak') ?? '';

		const czystaWiadomosc = wiadomosc.trim();
		if (czystaWiadomosc.length > MAKS_WIADOMOSC)
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
			const odpowiedz = await fetch('/api/rekrutacja', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					imie: imie.trim(),
					email: email.trim(),
					telefon: telefon.trim(),
					miesiac,
					rok,
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
			// the payload carries a parent's and a child's personal data.
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
	<h2 id="zgloszenie-naglowek">{KOPIA_ZGLOSZENIE.naglowek}</h2>
	<p class="intro">{KOPIA_ZGLOSZENIE.intro}</p>

	{#if statusFormularza === 'ok'}
		<!-- Success replaces the form in place (D-11). Focus moves to the heading:
		     without that, the swap is completely invisible to a screen-reader user.
		     The body repeats where the formal wniosek goes (D-01). -->
		<div class="panel sukces" role="status">
			<CircleCheck class="sukces-ikona" size={44} aria-hidden="true" focusable="false" />
			<h3 bind:this={naglowekSukcesuEl} tabindex="-1">{KOPIA_ZGLOSZENIE.sukcesNaglowek}</h3>
			<p>{KOPIA_ZGLOSZENIE.sukcesTresc}</p>
		</div>
	{:else}
		<p class="nota">{KOPIA_ZGLOSZENIE.wymaganeNota}</p>

		{#if kopiaBledu !== null}
			<!-- One alert region, two bodies. A field problem lists in-page links to the
			     offending controls; a delivery failure states plainly that the zgłoszenie
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
						{#each bledneKontrolki as kontrolka (kontrolka.id)}
							<li><a href={`#${kontrolka.id}`}>{kontrolka.tekst}</a></li>
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
				etykieta={KOPIA_ZGLOSZENIE.imieEtykieta}
				wymagane
				autocomplete="name"
				bind:wartosc={imie}
				blad={bledy.imie}
				wylaczone={wysylanie}
			/>

			<FormField
				id={ID_EMAIL}
				etykieta={KOPIA_ZGLOSZENIE.emailEtykieta}
				typ="email"
				wymagane
				autocomplete="email"
				podpowiedz={KOPIA_ZGLOSZENIE.emailPodpowiedz}
				bind:wartosc={email}
				blad={bledy.email}
				wylaczone={wysylanie}
			/>

			<!-- The single optional short field. Its label carries "(opcjonalnie)" rather
			     than relying on the absence of an asterisk, which nobody notices. -->
			<FormField
				id={ID_TELEFON}
				etykieta={KOPIA_ZGLOSZENIE.telefonEtykieta}
				typ="tel"
				autocomplete="tel"
				podpowiedz={KOPIA_ZGLOSZENIE.telefonPodpowiedz}
				bind:wartosc={telefon}
				blad={bledy.telefon}
				wylaczone={wysylanie}
			/>

			<!-- Birth month and year: a fieldset with a visible legend, because two
			     controls answer ONE question and a screen reader must hear that question
			     with each of them. Deliberately NOT an input of type month: its picker
			     chrome follows the browser locale and cannot be forced to Polish, which
			     would break the Polish-only rule (SITE-06).
			     The hint and the error are described on the fieldset, so the message
			     belongs to the group rather than to one arbitrary select. -->
			<fieldset class="urodzenie" aria-describedby={opisyUrodzenia}>
				<legend class="etykieta">
					{KOPIA_ZGLOSZENIE.urodzenieLegenda}<span aria-hidden="true"> *</span><span
						class="visually-hidden"
					>
						(pole wymagane)</span
					>
				</legend>
				<p id={ID_URODZENIE_PODPOWIEDZ} class="podpowiedz">
					{KOPIA_ZGLOSZENIE.urodzeniePodpowiedz}
				</p>

				<div class="para">
					<div class="wybor">
						<label class="etykieta-wyboru" for={ID_MIESIAC}
							>{KOPIA_ZGLOSZENIE.miesiacEtykieta}</label
						>
						<select
							id={ID_MIESIAC}
							class="kontrolka"
							bind:value={miesiac}
							required
							aria-required="true"
							aria-invalid={nieprawidloweUrodzenie}
							disabled={wysylanie}
						>
							<option value="">{KOPIA_ZGLOSZENIE.wybierz}</option>
							{#each MIESIACE_WYBOR as pozycja (pozycja.wartosc)}
								<option value={String(pozycja.wartosc)}>{pozycja.nazwa}</option>
							{/each}
						</select>
					</div>

					<div class="wybor">
						<label class="etykieta-wyboru" for={ID_ROK}>{KOPIA_ZGLOSZENIE.rokEtykieta}</label>
						<select
							id={ID_ROK}
							class="kontrolka"
							bind:value={rok}
							required
							aria-required="true"
							aria-invalid={nieprawidloweUrodzenie}
							disabled={wysylanie}
						>
							<option value="">{KOPIA_ZGLOSZENIE.wybierz}</option>
							{#each LATA as wartosc (wartosc)}
								<option value={String(wartosc)}>{wartosc}</option>
							{/each}
						</select>
					</div>
				</div>

				{#if bladUrodzenia}
					<p id={ID_URODZENIE_BLAD} class="blad">
						<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
						<span>{bladUrodzenia}</span>
					</p>
				{/if}
			</fieldset>

			<FormField
				id={ID_WIADOMOSC}
				etykieta={KOPIA_ZGLOSZENIE.wiadomoscEtykieta}
				wieloliniowy
				podpowiedz={KOPIA_ZGLOSZENIE.wiadomoscPodpowiedz}
				bind:wartosc={wiadomosc}
				blad={bledy.wiadomosc}
				wylaczone={wysylanie}
			/>

			<!-- Honeypot. A real parent never reaches it: it is off-screen, out of the
			     tab order and hidden from assistive technology, so no visitor can ever
			     encounter it. Its name matches the key the endpoint inspects. -->
			<div class="wabik" aria-hidden="true">
				<label for="zgloszenie-strona">Strona</label>
				<input
					id="zgloszenie-strona"
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
				tekst={KOPIA_ZGLOSZENIE.zgoda}
				etykietaKlauzuli={KOPIA_ZGLOSZENIE.klauzulaEtykieta}
				bind:zaznaczone={zgoda}
				blad={bledy.zgoda}
				wylaczone={wysylanie}
			/>

			<div class="wiersz-wyslij">
				<button class="przycisk" type="submit" disabled={wysylanie} aria-busy={wysylanie}>
					{wysylanie ? KOPIA_ZGLOSZENIE.wysylanie : KOPIA_ZGLOSZENIE.wyslij}
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
	{wysylanie ? KOPIA_ZGLOSZENIE.statusWysylania : ''}
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

	/* Birth-date group. The fieldset carries no box of its own: the user-agent border
	   and padding are removed so the group reads as one more field block, and the two
	   selects reuse the FormField control treatment below. */
	.urodzenie {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.etykieta,
	.etykieta-wyboru {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* A legend is not a flex item, so its spacing is declared rather than inherited
	   from the group gap. */
	.urodzenie legend {
		padding: 0;
		margin-bottom: 8px;
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

	/* Stacked below 640px, side by side above it (UI-SPEC Contract 2). */
	.para {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 640px) {
		.para {
			grid-template-columns: 1fr 1fr;
		}
	}

	.wybor {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	/* Control box, identical to FormField: >=48px tall, 12x16 padding, radius-sm,
	   white fill, 2px strong border (4.76:1 on white), ink 16px/1.5. The 16px minimum
	   also stops iOS Safari zooming the viewport on focus. The native select arrow is
	   kept: suppressing the appearance would cost the affordance and the platform
	   keyboard behaviour for no gain. */
	.kontrolka {
		box-sizing: border-box;
		width: 100%;
		min-height: 48px;
		padding: 12px 16px;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
		transition: border-color 150ms ease;
	}

	.kontrolka:hover {
		border-color: var(--color-ink);
		cursor: pointer;
	}

	/* Invalid: driven by the ARIA state itself, so the visual and the announced
	   state can never disagree. */
	.kontrolka[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	.kontrolka:disabled {
		border-color: var(--color-border-subtle);
		background: var(--color-surface-warm);
		cursor: not-allowed;
	}

	/* Icon + text, never colour alone (WCAG 1.4.1), and the message says what to do
	   (WCAG 3.3.3). */
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
		.kontrolka,
		.przycisk,
		.przycisk:hover:not(:disabled),
		.przycisk:active:not(:disabled) {
			transition: none;
			transform: none;
		}
	}

	/* Local utility, copied per component as every other component in this repo
	   does (there is no global utility layer for it). */
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
