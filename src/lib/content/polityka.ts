// Single source for every Polish string /polityka-prywatnosci renders (LEGAL-02, D-3,
// quick task 260827-bfa).
//
// WHY THE PROSE LIVES HERE AND NOT IN THE COMPONENT. It is the same rule that keeps the
// klauzula informacyjna out of server code: prose that sits in a component is prose no
// test can sweep without booting a browser, and tests/forms-copy.unit.ts sweeps this
// module for the copy rules exactly as it sweeps ./forms.ts. Legal text of a public body
// is the last text that should be the only unswept text in the project.
//
// Copy rules (v1.2 §8) apply to EVERY string below: Polish only, no emoji, no em dashes
// (use commas, colons, parentheses), en dash only inside a numeric range.
//
// The IOD address is interpolated from ./site.ts and is NEVER written as a literal here,
// so the page and the form klauzula cannot disagree about where a parent should write.
import { contact } from './site.ts';
import type { BlokKlauzuli } from './forms.ts';

/** Page title. Byte for byte the string the footer link carries and the Playwright case
 *  asserts, so the link text, the h1 and the expectation are one value. */
export const POLITYKA_TYTUL = 'Polityka prywatności (RODO)';

/** The opening paragraph, and the reason the page has two parts at all.
 *
 *  This separation is CONTENT-CRITICAL, not stylistic. The administrator's klauzula
 *  retains data „przez okres wynikający z przepisów o archiwizacji"; the form klauzula
 *  keeps a message „tylko tak długo, jak potrzebne do odpowiedzi". Read as one text those
 *  two sentences look like a contradiction. Read as two scopes they are simply two data
 *  sets under two legal bases, which is what they are, so the page has to say so before
 *  a reader meets either one. */
export const POLITYKA_WSTEP =
	'Ta strona opisuje dwa rozłączne zbiory danych, dlatego ma dwie części. Pierwsza dotyczy danych dziecka i rodziców, które żłobek przetwarza w związku z rekrutacją, umową, opieką, dokumentacją i opłatami. Druga dotyczy wyłącznie tego, co sam wpiszesz w formularzu kontaktowym lub zgłoszeniowym na tej stronie. Zasady, w tym okresy przechowywania, są w obu częściach różne, ponieważ dotyczą różnych danych i różnych podstaw prawnych.';

/** Heading of the first scope: what the żłobek processes about a child and its parents. */
export const POLITYKA_ADMINISTRATOR_NAGLOWEK = 'Dane dziecka i rodziców przetwarzane w żłobku';

/** Heading of the second scope: only what a visitor types into a form on this site. */
export const POLITYKA_FORMULARZE_NAGLOWEK = 'Dane przesyłane przez formularze na tej stronie';

/** Said before the second scope, so a reader who already opened the disclosure under a
 *  form recognises the text instead of wondering whether it is a different set of rules. */
export const POLITYKA_FORMULARZE_WSTEP =
	'Poniżej jest ta sama klauzula informacyjna, którą widzisz pod formularzem kontaktowym i pod formularzem zgłoszenia. Dotyczy wyłącznie danych, które sam wpiszesz w formularzu na tej stronie.';

/** The administrator's klauzula, supplied in writing by the placówka on 2026-08-27.
 *
 *  THE LEGAL SUBSTANCE IS THE ADMINISTRATOR'S AND IS UNTOUCHED. Nothing was added and
 *  nothing was shortened. Only the writing layer was corrected, because the text as sent
 *  broke this project's copy rules: two en dashes became commas, two stray capital „I"
 *  became „i", an orphaned space before a full stop and some doubled spaces were removed,
 *  and „niniejszej umowy" became „umowy o objęcie dziecka opieką" because a website has
 *  no „niniejsza umowa" and the phrase, carried over verbatim from the contract template,
 *  would point a reader at a document that is not there. The capital letters in
 *  „Rodziców" and „Administratora danych" are HERS and stay.
 *
 *  ONE DELIBERATE DISCREPANCY, NOT RECONCILED IN CODE (D-3). This text names „podmiot
 *  prowadzący Publiczny Żłobek w Stromcu" as the administrator; the form klauzula in
 *  ./forms.ts names „Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec".
 *  Under the ustawa o opiece nad dziećmi w wieku do lat 3 the podmiot prowadzący a public
 *  żłobek is the gmina, so the two sentences may point at two different entities. Both
 *  are published, each inside its own section, and the question goes to the placówka.
 *  Quietly harmonising them here would be us deciding who the administrator is, which is
 *  not ours to decide.
 *
 *  ONE block with no heading: the section's own h2 is its heading, so a nested one would
 *  duplicate it and push the hierarchy a level deeper for nothing. */
export const KLAUZULA_ADMINISTRATORA: readonly BlokKlauzuli[] = Object.freeze([
	{
		akapity: [
			'Administratorem danych osobowych jest podmiot prowadzący Publiczny Żłobek w Stromcu.',
			'Dane dziecka i Rodziców są przetwarzane w celu przeprowadzenia rekrutacji, zawarcia i realizacji umowy o objęcie dziecka opieką, organizacji opieki, zapewnienia bezpieczeństwa, prowadzenia dokumentacji oraz rozliczania opłat, na podstawie obowiązujących przepisów prawa i zawartej umowy.',
			'Dane będą przechowywane przez okres wynikający z przepisów o archiwizacji i przepisów szczególnych.',
			'Osobie, której dane dotyczą, przysługują prawa określone w RODO, w szczególności prawo dostępu do danych, ich sprostowania, ograniczenia przetwarzania oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, w zakresie przewidzianym prawem.',
			`W Publicznym Żłobku został wyznaczony Inspektor Ochrony Danych Osobowych, z którym kontakt jest możliwy pod adresem korespondencyjnym Administratora danych, bądź za pomocą adresu e-mail: ${contact.iodEmail}.`
		]
	}
]);
