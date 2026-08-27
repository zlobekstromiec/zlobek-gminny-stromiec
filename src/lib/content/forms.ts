// Single source for every Polish string the two form islands render, plus the
// klauzula informacyjna RODO (CONTACT-03, RECRUIT-04, FORM-02).
//
// Governing documents: 04-UI-SPEC.md (Amendment v1.4) Copywriting Contract and
// Component Contracts 2, 3, 4, 7 and 8; 04-CONTEXT.md D-03, D-04, D-10, D-11,
// D-12, D-13; 04-RESEARCH.md Pitfall 3 (Resend stores account data in the United
// States regardless of the sending region), Pitfall 8 (the BCC backup mailbox
// creates an additional processor) and Architecture Pattern 4 (the salted-hash
// rate-limit counter). The endpoint returns machine codes only: all prose lives
// here, which is what keeps long Polish text out of server code.
//
// PLACEHOLDER convention (Phase 6 pre-launch grep gate) extends to
// `// PLACEHOLDER:` line comments in this module.
// Copy rules (v1.2 §8) apply to EVERY string below: Polish only, no emoji, no em
// dashes (use commas, colons, parentheses), en dash only inside a numeric range.
//
// Contact values are interpolated from ./site.ts and are NEVER duplicated as
// literals here, so a phone number or an address can only ever change in one
// place. The relative `.ts` import (rather than the `$lib` alias) is deliberate:
// tests/forms-copy.unit.ts loads this module directly under `node --test`.
import { contact, urzad } from './site.ts';
import type { FormCode } from '../forms/types.ts';

/** Turnstile site key. Public by design (it is rendered into the page markup and
 *  identifies the widget, not the account), which is why it lives in a committed
 *  content module and not in a secret. The matching secret key never leaves
 *  `platform.env`.
 *
 *  This is the live key of the managed widget `widget-zlobekstromiec`, whose allowed
 *  hostnames are the Pages origin plus the apex and www of the custom domain. It
 *  MUST always be paired with that same widget's secret, set as the Cloudflare Pages
 *  secret `TURNSTILE_SECRET_KEY`: a site key from one widget and a secret from
 *  another makes every siteverify call fail, and because verification fails closed
 *  that silently blocks every submission on both forms.
 *
 *  Local and CI runs never use this key. TurnstileWidget.svelte substitutes
 *  Cloudflare's always-passes dummy pair on localhost, because this widget is
 *  hostname-scoped and issues no token off its allowed origins. See that component
 *  for why the substitution cannot weaken production. */
export const TURNSTILE_SITEKEY = '0x4AAAAAAEQGTDA3in-HRJJ4';

/** The twelve Polish month names in the nominative, paired with the value the
 *  enrollment form's month `<select>` posts. Ordered, so the island renders the list
 *  as it stands.
 *
 *  This lives in the content module and NOT in `src/lib/server/forms/mailer.ts`
 *  because both sides need the same names: the select the parent reads and the mail
 *  body staff read. The endpoint injects `nazwaMiesiaca` into the body builder, so
 *  there is exactly one month table in the project and the two can never disagree
 *  about what the parent chose. */
export const MIESIACE_WYBOR: readonly { wartosc: number; nazwa: string }[] = Object.freeze([
	{ wartosc: 1, nazwa: 'styczeń' },
	{ wartosc: 2, nazwa: 'luty' },
	{ wartosc: 3, nazwa: 'marzec' },
	{ wartosc: 4, nazwa: 'kwiecień' },
	{ wartosc: 5, nazwa: 'maj' },
	{ wartosc: 6, nazwa: 'czerwiec' },
	{ wartosc: 7, nazwa: 'lipiec' },
	{ wartosc: 8, nazwa: 'sierpień' },
	{ wartosc: 9, nazwa: 'wrzesień' },
	{ wartosc: 10, nazwa: 'październik' },
	{ wartosc: 11, nazwa: 'listopad' },
	{ wartosc: 12, nazwa: 'grudzień' }
]);

/** Month number to Polish name. The validator guarantees 1 to 12 reaches the mail
 *  body, and the fallback returns the number as text so an unexpected value can
 *  never render the word "undefined" in a message to staff. */
export function nazwaMiesiaca(miesiac: number): string {
	return MIESIACE_WYBOR.find((pozycja) => pozycja.wartosc === miesiac)?.nazwa ?? String(miesiac);
}

/** One inline run of body text. `{ mocne }` renders inside a `<strong>`, which is
 *  how the D-12 "not sent" emphasis is carried without putting markup into a
 *  copy string (capitals-only emphasis is banned by the UI-SPEC). */
export type Fragment = string | { mocne: string };

export type KopiaBledu = {
	naglowek: string;
	tresc: Fragment[];
};

/** Panel copy for every failure the endpoint can report, keyed by the five
 *  `FormCode` values. Verbatim from the UI-SPEC error-state table, with the
 *  telephone and e-mail tokens interpolated from `contact`.
 *
 *  `zgoda` deliberately reuses the validation-summary heading: a missing consent
 *  tick IS a marked field on the form, so inventing a second heading for it would
 *  add copy the design contract never approved. */
export const KOPIA_BLEDOW: Readonly<Record<FormCode, KopiaBledu>> = Object.freeze({
	walidacja: {
		naglowek: 'Popraw zaznaczone pola',
		tresc: ['Nie wysłaliśmy formularza, ponieważ część pól wymaga poprawy.']
	},
	zgoda: {
		naglowek: 'Popraw zaznaczone pola',
		tresc: ['Zaznacz zgodę na przetwarzanie danych. Bez niej nie możemy odpowiedzieć.']
	},
	turnstile: {
		naglowek: 'Nie udało się potwierdzić, że nie jesteś robotem',
		tresc: [
			`Odśwież stronę i spróbuj ponownie. Jeśli problem się powtarza, napisz do nas na ${contact.email}.`
		]
	},
	limit: {
		naglowek: 'Za dużo prób wysyłki',
		tresc: [
			`Z tego urządzenia wysłano już kilka wiadomości. Spróbuj ponownie za godzinę albo napisz wprost na ${contact.email}.`
		]
	},
	wysylka: {
		naglowek: 'Nie udało się wysłać wiadomości',
		tresc: [
			'Twoja wiadomość ',
			{ mocne: 'nie została wysłana' },
			`. Wpisane dane zostały w formularzu, możesz spróbować ponownie za chwilę. Jeśli sprawa jest pilna, napisz wprost na ${contact.email}.`
		]
	}
});

/** Flatten a failure body to plain text. Used by the copy tests and by any place
 *  that needs the sentence without its markup (never for rendering: the panel
 *  renders the fragments so the `<strong>` survives). */
export function tekstBledu(kod: FormCode): string {
	return KOPIA_BLEDOW[kod].tresc
		.map((fragment) => (typeof fragment === 'string' ? fragment : fragment.mocne))
		.join('');
}

/** The three per-field reason codes `src/lib/server/forms/validate.ts` returns in
 *  its `pola` record. Kept as a local union so a new server reason cannot silently
 *  render as a blank error message. */
export type PowodPola = 'brak' | 'niepoprawny' | 'zbyt-dlugi';

/** Per-field instructions, keyed by the short field key the server returns and
 *  then by the reason. Verbatim from the UI-SPEC error-state table. Every message
 *  says what to DO, not merely that something is wrong (WCAG 3.3.3).
 *
 *  The nesting is required because the UI-SPEC has distinct copy for a missing and
 *  an over-long message, and the server distinguishes the two. `urodzenie` is the
 *  enrollment form's month plus year fieldset, authored here so Plan 06 renders the
 *  same sentence instead of writing a second one.
 *
 *  The UI-SPEC table enumerates one message per field for most reasons, so the
 *  reasons it does not distinguish share that message verbatim rather than getting
 *  invented copy. Only the over-long cases the table omits (`imie`) and the
 *  optional telephone are authored here, in the same instruction voice.
 *
 *  The e-mail example uses example.com, a domain reserved by RFC 2606 precisely for
 *  documentation. It is a deliberately unreachable illustration, not a contact
 *  value, which is why it is written out instead of interpolated. */
export const KOPIA_POL: Readonly<Record<string, Readonly<Partial<Record<PowodPola, string>>>>> =
	Object.freeze({
		imie: Object.freeze({
			brak: 'Podaj imię i nazwisko.',
			niepoprawny: 'Podaj imię i nazwisko.',
			'zbyt-dlugi': 'Imię i nazwisko są za długie. Skróć je do 100 znaków.'
		}),
		email: Object.freeze({
			brak: 'Podaj poprawny adres e-mail, na przykład jan.kowalski@example.com',
			niepoprawny: 'Podaj poprawny adres e-mail, na przykład jan.kowalski@example.com',
			'zbyt-dlugi': 'Podaj poprawny adres e-mail, na przykład jan.kowalski@example.com'
		}),
		wiadomosc: Object.freeze({
			brak: 'Napisz wiadomość, żebyśmy wiedzieli, w czym możemy pomóc.',
			niepoprawny: 'Napisz wiadomość, żebyśmy wiedzieli, w czym możemy pomóc.',
			'zbyt-dlugi': 'Wiadomość jest za długa. Skróć ją do 2000 znaków.'
		}),
		urodzenie: Object.freeze({
			brak: 'Wybierz miesiąc i rok urodzenia dziecka.',
			niepoprawny: 'Wybierz miesiąc i rok urodzenia dziecka.'
		}),
		// The server reports the birth date under two separate keys, one per select,
		// because it validates them separately. The visible message is the SAME
		// sentence as `urodzenie`: the two controls are one question to the parent, and
		// the UI-SPEC error table has exactly one message for it.
		miesiac: Object.freeze({
			brak: 'Wybierz miesiąc i rok urodzenia dziecka.',
			niepoprawny: 'Wybierz miesiąc i rok urodzenia dziecka.'
		}),
		rok: Object.freeze({
			brak: 'Wybierz miesiąc i rok urodzenia dziecka.',
			niepoprawny: 'Wybierz miesiąc i rok urodzenia dziecka.'
		}),
		telefon: Object.freeze({
			niepoprawny: 'Podaj numer telefonu, używając tylko cyfr, bez spacji i innych znaków.'
		})
	});

/** Look up the Polish instruction for one field. Falls back to the `brak` message
 *  for an unknown reason so a future server code can never render an empty error
 *  paragraph, and returns undefined only when the field itself is unknown. */
export function komunikatPola(pole: string, powod: string): string | undefined {
	const dla = KOPIA_POL[pole];
	if (dla === undefined) return undefined;
	return dla[powod as PowodPola] ?? dla.brak ?? dla.niepoprawny;
}

/** Every string the /kontakt island renders (UI-SPEC "Kontakt form", "Success
 *  panels" and Component Contracts 6 and 7). */
export const KOPIA_KONTAKT = {
	naglowek: 'Napisz do nas',
	intro: `Odpowiadamy w dni robocze. Sprawy rekrutacyjne prowadzi ${urzad.name}, informacja o tym jest pod formularzem.`,
	wymaganeNota: 'Pola oznaczone gwiazdką (*) są wymagane.',
	imieEtykieta: 'Imię i nazwisko',
	emailEtykieta: 'Adres e-mail',
	emailPodpowiedz: 'Na ten adres wyślemy odpowiedź.',
	wiadomoscEtykieta: 'Wiadomość',
	wiadomoscPodpowiedz: 'Opisz krótko swoją sprawę. Maksymalnie 2000 znaków.',
	zgoda:
		'Wyrażam zgodę na przetwarzanie moich danych osobowych podanych w formularzu w celu udzielenia odpowiedzi na wiadomość.',
	klauzulaEtykieta: 'Klauzula informacyjna RODO',
	wyslij: 'Wyślij wiadomość',
	wysylanie: 'Wysyłanie...',
	statusWysylania: 'Wysyłanie wiadomości, proszę czekać.',
	sukcesNaglowek: 'Dziękujemy, wiadomość została wysłana',
	sukcesTresc: 'Odpowiemy na podany adres e-mail, zwykle w ciągu kilku dni roboczych.'
} as const;

/** Every string the enrollment island renders (UI-SPEC "Zgłoszenie form", "Success
 *  panels" and Component Contracts 2, 6 and 7).
 *
 *  The intro and the success body carry decision D-01 in plain language: this is an
 *  expression of interest for the waiting list, and the formal wniosek is filed in
 *  person at the Urząd Gminy. Being honest about that here is the whole point of the
 *  copy, because an online form that looks like an application would leave a parent
 *  believing their child is enrolled when nothing has been filed at all.
 *
 *  The office name, street, room and hours are interpolated from `urzad`, never
 *  pasted. Both sentences are phrased so the nominative `urzad.name` follows a verb
 *  rather than a preposition that would need the locative, which is the same
 *  constraint the /kontakt info box works under. */
export const KOPIA_ZGLOSZENIE = {
	// „Zgłoszenie na listę rezerwową" until 2026-08-18. The lista rezerwowa is what this
	// form means while the nabór is CLOSED, and on that day the żłobek confirmed the
	// opposite: „jest ona stale otwarta ponieważ nie mamy zapełnionych wszystkich miejsc".
	// Left alone, the heading would have sat directly under a banner reading „Nabór trwa
	// przez cały rok" and told the same parent, on the same screen, that they were joining
	// a queue for a place that is not taken.
	//
	// THE FIX IS NEUTRAL COPY, NOT A SECOND BRANCH ON THE FLAG. What this form does is the
	// same in both states: it sends the żłobek a parent's contact details and a child's
	// age, and it is never the formal wniosek, which is filed in person at the Urząd
	// Gminy. Wording that states that is true whichever way the flag sits, and it keeps
	// the number of places that have to be edited when the flag flips at one.
	naglowek: 'Zgłoszenie zainteresowania',
	intro: `Zostaw kontakt, a odezwiemy się i pomożemy przejść przez formalności. To zgłoszenie zainteresowania, a nie formalny wniosek: wniosek o przyjęcie dziecka trzeba złożyć osobiście, przyjmuje go ${urzad.name}, ${urzad.addressLines[0]}, ${urzad.room}, w godzinach ${urzad.wnioskiHours}.`,
	wymaganeNota: 'Pola oznaczone gwiazdką (*) są wymagane.',
	imieEtykieta: 'Imię i nazwisko rodzica',
	emailEtykieta: 'Adres e-mail',
	emailPodpowiedz: 'Na ten adres wyślemy odpowiedź.',
	telefonEtykieta: 'Telefon (opcjonalnie)',
	telefonPodpowiedz: 'Ułatwi nam szybki kontakt.',
	urodzenieLegenda: 'Miesiąc i rok urodzenia dziecka',
	/** The hint that carries data minimisation to the parent (D-02, T-04-24): the
	 *  form asks for an age, not an identity, and it says so where the parent is
	 *  looking rather than only in the klauzula. */
	urodzeniePodpowiedz: 'Potrzebujemy tylko wieku dziecka. Nie podawaj jego imienia ani nazwiska.',
	miesiacEtykieta: 'Miesiąc',
	rokEtykieta: 'Rok',
	wybierz: 'Wybierz',
	wiadomoscEtykieta: 'Wiadomość (opcjonalnie)',
	wiadomoscPodpowiedz: 'Napisz, o co chcesz zapytać. Maksymalnie 2000 znaków.',
	zgoda:
		'Wyrażam zgodę na przetwarzanie moich danych osobowych podanych w formularzu w celu obsługi zgłoszenia i kontaktu zwrotnego.',
	klauzulaEtykieta: 'Klauzula informacyjna RODO',
	wyslij: 'Wyślij zgłoszenie',
	wysylanie: 'Wysyłanie...',
	statusWysylania: 'Wysyłanie zgłoszenia, proszę czekać.',
	sukcesNaglowek: 'Dziękujemy, zgłoszenie zostało wysłane',
	sukcesTresc: `Odezwiemy się na podany adres e-mail, zwykle w ciągu kilku dni roboczych. Pamiętaj, że formalny wniosek o przyjęcie dziecka trzeba złożyć osobiście, przyjmuje go ${urzad.name}, ${urzad.addressLines[0]}, ${urzad.room}.`
} as const;

/** Static fallback panel. Always in the prerendered HTML above the form card, so
 *  it serves the no-JavaScript visitor, the failed-widget case and the D-12 send
 *  failure at once (04-RESEARCH Pitfall 7). */
export const KOPIA_FALLBACK = {
	// „Wolisz zadzwonić?" until 2026-08-18, when the number came off the site (site.ts).
	// The heading had to move with it: a panel that opens by offering a phone call and
	// then lists only an inbox reads as a page that lost half its content.
	naglowek: 'Wolisz napisać wprost?',
	tresc: `E-mail: ${contact.email}. Czynne ${contact.hours}.`
} as const;

/** The `<noscript>` sentence rendered directly above the form card. */
export const KOPIA_NOSCRIPT = `Ten formularz wymaga włączonej obsługi JavaScript. Możesz też napisać do nas na ${contact.email}.`;

/** One block of the klauzula: an optional sub-heading plus its paragraphs. The
 *  strings carry no markup at all, so the disclosure component owns the whole
 *  visual treatment and no copy string can smuggle in an element. */
export type BlokKlauzuli = {
	naglowek?: string;
	akapity: string[];
};

/** Klauzula informacyjna RODO (art. 13 RODO), authored this phase because none
 *  exists in the BIP (D-03). Rendered inside the collapsed `<details>` beneath the
 *  consent row of BOTH forms, so it is one keystroke away from every submit.
 *
 *  Three sentences here are compliance-critical and are pinned by
 *  tests/forms-copy.unit.ts: the transfer to the United States and its legal
 *  mechanism, the approximately thirty day copy at the processor, and the
 *  temporary backup mailbox. A blanket "nie przechowujemy danych" would be false
 *  (04-RESEARCH Pitfall 3), so the wording separates our own infrastructure, where
 *  nothing is stored, from the processor's own retention. */
export const KLAUZULA: readonly BlokKlauzuli[] = Object.freeze([
	{
		naglowek: 'Administrator danych',
		akapity: [
			`Administratorem Twoich danych osobowych jest Publiczny Żłobek w Stromcu, ${contact.addressLines.join(', ')}, jednostka organizacyjna Gminy Stromiec.`,
			`W sprawach dotyczących wniosków rekrutacyjnych właściwy jest ${urzad.name}, ${urzad.addressLines.join(', ')}, ${urzad.room}.`
		]
	},
	{
		naglowek: 'Inspektor ochrony danych',
		akapity: [
			// PLACEHOLDER: the inspektor ochrony danych (IOD) has not been named to us
			// and no contact is published in the BIP (D-03). LAUNCH GATE (Phase 6):
			// obtain the name and the contact address from the Urząd Gminy and replace
			// this paragraph with them.
			`Dane kontaktowe inspektora ochrony danych zostaną opublikowane po ich potwierdzeniu przez ${urzad.name}. Do tego czasu w sprawach ochrony danych możesz napisać na adres ${contact.email}.`
		]
	},
	{
		naglowek: 'Cel i podstawa prawna przetwarzania',
		akapity: [
			'Twoje dane przetwarzamy w celu obsługi wiadomości lub zgłoszenia przesłanego przez formularz oraz udzielenia odpowiedzi.',
			'Podstawą prawną jest Twoja zgoda, czyli art. 6 ust. 1 lit. a rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).'
		]
	},
	{
		naglowek: 'Zakres danych',
		akapity: [
			'Przetwarzamy wyłącznie te dane, które sam wpiszesz w formularzu: imię i nazwisko, adres e-mail, opcjonalnie numer telefonu oraz treść wiadomości.',
			'Formularz zgłoszenia celowo pyta tylko o miesiąc i rok urodzenia dziecka. Nie pytamy o imię ani nazwisko dziecka i prosimy, aby nie podawać ich w treści wiadomości.'
		]
	},
	{
		naglowek: 'Odbiorcy danych',
		akapity: [
			// D-2 / T-bfa-04. This sentence and the CC constant in
			// src/lib/server/forms/mailer.ts are a PAIR and may never drift apart: a
			// recipient the parent was never told about breaches art. 13 RODO, and a
			// disclosed recipient who receives nothing is a false statement
			// (04-RESEARCH Pitfall 8). tests/forms-copy.unit.ts pins both directions.
			// The office name is interpolated in the NOMINATIVE and stands as the SUBJECT
			// of the sentence: „trafia do ${urzad.name}" would be a grammar bug, because
			// „do" governs the genitive and the constant is not declined. Plans 04-04 and
			// 04-05 already fixed that exact mistake once.
			`Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje ${urzad.name}, który prowadzi sprawy rekrutacyjne żłobka.`,
			'Wiadomość dostarcza nam Resend, dostawca usługi wysyłki poczty elektronicznej, działający jako podmiot przetwarzający.',
			'Strona jest hostowana przez Cloudflare, który dostarcza także mechanizm ochrony formularza przed automatycznymi zgłoszeniami (Cloudflare Turnstile) i działa jako podmiot przetwarzający.'
		]
	},
	{
		naglowek: 'Przekazywanie danych poza Europejski Obszar Gospodarczy',
		akapity: [
			'Resend przechowuje dane konta, metadane wiadomości, logi oraz zapisy wywołań swojego interfejsu programistycznego w Stanach Zjednoczonych, niezależnie od wybranego regionu wysyłki. Oznacza to przekazanie Twoich danych do państwa trzeciego.',
			'Podstawą takiego przekazania są standardowe klauzule umowne zatwierdzone przez Komisję Europejską. Kopię tych zabezpieczeń możesz uzyskać, kontaktując się z administratorem.'
		]
	},
	{
		naglowek: 'Okres przechowywania',
		akapity: [
			'Wiadomość przechowujemy tylko tak długo, jak jest to potrzebne do udzielenia odpowiedzi i zakończenia sprawy.',
			'Kopia wysłanej wiadomości pozostaje u dostawcy usługi wysyłki (Resend) przez około trzydzieści dni, zgodnie z jego standardowym okresem retencji, po czym jest przez niego usuwana.'
		]
	},
	{
		naglowek: 'Brak zapisu w naszych systemach',
		akapity: [
			'Treść formularza nie jest zapisywana w żadnym systemie żłobka: nie prowadzimy bazy danych zgłoszeń, nie zapisujemy wpisanych wartości w logach serwera i nie zapamiętujemy ich w przeglądarce. Wiadomość istnieje wyłącznie jako poczta elektroniczna w skrzynce, do której trafia.'
		]
	},
	{
		naglowek: 'Tymczasowa kopia zapasowa',
		akapity: [
			// LAUNCH GATE (D-13): this paragraph and the BCC constant in
			// src/lib/server/forms/mailer.ts are removed in the SAME commit, once
			// delivery to the Gmina mailbox is proven. Neither may outlive the other:
			// a klauzula describing a copy that no longer exists is as wrong as a copy
			// nobody was told about (04-RESEARCH Pitfall 8).
			'Do czasu potwierdzenia, że wiadomości docierają do skrzynki Urzędu Gminy bez zakłóceń, każde zgłoszenie jest dodatkowo wysyłane w ukrytej kopii na pomocniczą skrzynkę pocztową kontrolowaną przez operatora strony. Ta kopia zabezpiecza przed cichą utratą zgłoszenia i zostanie wyłączona po zakończeniu weryfikacji dostarczania.'
		]
	},
	{
		naglowek: 'Zabezpieczenie przed nadużyciami',
		akapity: [
			'Aby ograniczyć masowe wysyłki, liczymy zgłoszenia z jednego połączenia. Zapisujemy przy tym wyłącznie jednokierunkowy skrót (hash) adresu połączenia z dodatkiem tajnego ciągu (soli), przechowywany przez jedną godzinę. Nie zapisujemy ani samego adresu połączenia, ani treści wiadomości.'
		]
	},
	{
		naglowek: 'Twoje prawa',
		akapity: [
			'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, a także prawo wniesienia sprzeciwu wobec przetwarzania.',
			'Zgodę możesz wycofać w dowolnym momencie. Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano przed jej wycofaniem.',
			'Masz również prawo wniesienia skargi do organu nadzorczego, którym jest Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.'
		]
	},
	{
		naglowek: 'Dobrowolność podania danych',
		akapity: [
			'Podanie danych jest dobrowolne, ale bez adresu e-mail nie będziemy mogli wysłać Ci odpowiedzi.'
		]
	}
]);
