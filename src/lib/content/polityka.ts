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

/** The administrator's klauzula: KLAUZULA 06 („dzieci, rodzice i opiekunowie"), prepared by
 *  the inspektor ochrony danych and delivered by the director on 2026-09-21.
 *
 *  IT REPLACED THE TEXT THE PLACÓWKA SENT ON 2026-08-27, and the replacement is a promotion
 *  rather than a rewrite. That earlier text was five paragraphs the żłobek wrote itself
 *  while it had no klauzula at all, and publishing it was the right call at the time. This
 *  one is the inspector's own authoritative text for EXACTLY this audience, structured
 *  under his own headings, and it says materially more: the legal bases article by article,
 *  who the recipients are, how long data is kept, and the full list of a person's rights.
 *
 *  THE LEGAL SUBSTANCE IS THE INSPECTOR'S AND IS UNTOUCHED. Only the writing layer was
 *  corrected, exactly as it was for the previous text: en dashes outside numeric ranges
 *  became commas or colons (copy rules v1.2 paragraf 8), the bullet lists became arrays,
 *  and the inspector's name is interpolated from ./site.ts instead of being written out,
 *  because that is the project's single source for it.
 *
 *  THE „ONE DELIBERATE DISCREPANCY" IS SETTLED AND THE NOTE THAT RECORDED IT IS GONE.
 *  It said this page named „podmiot prowadzący Publiczny Żłobek w Stromcu" as the
 *  administrator while the form klauzula named the żłobek itself, that the two might be
 *  different entities, and that harmonising them in code would be us deciding who the
 *  administrator is. That was true only while nothing authoritative said which. Every one
 *  of the eight documents the inspektor ochrony danych delivered on 2026-09-21 names the
 *  administrator identically, so both surfaces now say what he says, and neither of them
 *  is us deciding anything.
 *
 *  Blocks carry their own headings, which the route renders as h3 under the section's h2. */
export const KLAUZULA_ADMINISTRATORA: readonly BlokKlauzuli[] = Object.freeze([
	{
		akapity: [
			'Poniższa klauzula informacyjna została sporządzona na podstawie art. 13 rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).'
		]
	},
	{
		naglowek: 'Administrator',
		akapity: [`${contact.name}, ${contact.addressLines.join(', ')}.`]
	},
	{
		naglowek: 'Inspektor Ochrony Danych',
		akapity: [
			`W placówce wyznaczono Inspektora Ochrony Danych, którym jest ${contact.iodName}. Z inspektorem można skontaktować się korespondencyjnie na adres administratora albo za pomocą poczty elektronicznej: ${contact.iodEmail}.`
		]
	},
	{
		naglowek: 'Cele i podstawy przetwarzania',
		akapity: [
			'Rekrutacja dziecka do żłobka, objęcie dziecka opieką oraz zapewnienie prawidłowej opieki, w tym realizacja funkcji opiekuńczej, wychowawczej i edukacyjnej: art. 6 ust. 1 lit. c i e RODO w związku z ustawą z dnia 4 lutego 2011 r. o opiece nad dziećmi w wieku do lat 3, w szczególności jej art. 3a i art. 10.',
			'Przetwarzanie danych o stanie zdrowia, stosowanej diecie, rozwoju psychofizycznym dziecka oraz informacji o niepełnosprawności, w zakresie przewidzianym art. 3a ustawy o opiece nad dziećmi w wieku do lat 3: art. 9 ust. 2 lit. g RODO w związku z tym przepisem, w celu rekrutacji i zapewnienia dziecku prawidłowej opieki.',
			'Realizacja obowiązków sprawozdawczych, rozliczeniowych, finansowych i archiwalnych, w tym związanych ze świadczeniem „aktywnie w żłobku": art. 6 ust. 1 lit. c RODO.',
			'Realizacja celów dodatkowych, które nie wynikają z obowiązku prawnego lub zadania publicznego, na przykład publikacja wizerunku: wyłącznie na podstawie dobrowolnej zgody, art. 6 ust. 1 lit. a RODO, a gdy dotyczy to danych szczególnej kategorii, art. 9 ust. 2 lit. a RODO.'
		]
	},
	{
		naglowek: 'Odbiorcy danych',
		akapity: [
			'Dane mogą być przekazywane podmiotom i organom uprawnionym na podstawie prawa, w szczególności właściwym organom administracji publicznej, Zakładowi Ubezpieczeń Społecznych oraz podmiotom uczestniczącym w realizacji ustawowych systemów dotyczących opieki nad dziećmi do lat 3.',
			'Dane mogą być również powierzane podmiotom świadczącym usługi informatyczne, hostingowe, księgowe, żywieniowe lub inne usługi niezbędne do funkcjonowania żłobka, na podstawie odpowiednich umów.'
		]
	},
	{
		naglowek: 'Okres przechowywania',
		akapity: [
			'Dane będą przechowywane przez okres korzystania z opieki w żłobku, a następnie przez okres wynikający z przepisów prawa oraz obowiązującego administratora jednolitego rzeczowego wykazu akt.',
			'Dane przetwarzane na podstawie zgody będą przechowywane do czasu wycofania zgody lub ustania celu przetwarzania.'
		]
	},
	{
		naglowek: 'Prawa osoby, której dane dotyczą',
		akapity: [
			'Prawo dostępu do danych osobowych i otrzymania ich kopii.',
			'Prawo sprostowania danych.',
			'Prawo ograniczenia przetwarzania.',
			'Prawo usunięcia danych, w przypadkach przewidzianych RODO.',
			'Prawo wniesienia sprzeciwu, jeżeli podstawą przetwarzania jest art. 6 ust. 1 lit. e lub f RODO.',
			'Prawo wycofania zgody w dowolnym momencie, jeżeli dane są przetwarzane na podstawie zgody. Wycofanie zgody nie wpływa na zgodność z prawem wcześniejszego przetwarzania.',
			'Prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, jeżeli przetwarzanie danych narusza przepisy RODO.'
		]
	},
	{
		naglowek: 'Podanie danych',
		akapity: [
			'Podanie danych wymaganych ustawą o opiece nad dziećmi w wieku do lat 3 jest obowiązkowe w zakresie niezbędnym do rekrutacji i zapewnienia dziecku prawidłowej opieki. Podanie danych wykorzystywanych wyłącznie do celów dodatkowych jest dobrowolne.'
		]
	},
	{
		naglowek: 'Przekazywanie poza EOG',
		akapity: [
			'Administrator nie zamierza przekazywać danych osobowych do państw trzecich ani organizacji międzynarodowych, chyba że obowiązek taki będzie wynikał z przepisów prawa lub zastosowane zostaną wymagane przez RODO zabezpieczenia.'
		]
	},
	{
		naglowek: 'Automatyzacja i profilowanie',
		akapity: [
			'Dane nie będą wykorzystywane do podejmowania decyzji w sposób wyłącznie zautomatyzowany, w tym do profilowania.'
		]
	}
]);

/** The pointer to the rest of the RODO paperwork, rendered as ONE sentence with ONE link.
 *
 *  WHY IT IS HERE AND NOT A PARAGRAPH INSIDE THE KLAUZULA. The klauzula above is the
 *  inspector's text and nothing of ours belongs inside it. This sentence is ours: it exists
 *  because from 2026-09-21 there are seven further klauzule on /dokumenty, including the one
 *  about the monitoring wizyjny, and a reader of this page has no other way of learning that.
 *
 *  It is SPLIT AROUND THE LINK rather than carrying markup, exactly like every other string
 *  in this project: a copy string that contained an anchor would be a copy string no sweep
 *  could check and no editor could safely touch. */
export const POLITYKA_DOKUMENTY = Object.freeze({
	przed:
		'Pozostałe klauzule informacyjne, w tym klauzula o monitoringu wizyjnym oraz klauzule dla osób współpracujących ze żłobkiem, są do pobrania w sekcji RODO na stronie',
	etykieta: 'Dokumenty',
	adres: '/dokumenty',
	po: '.'
});
