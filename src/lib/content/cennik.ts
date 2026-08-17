// Prose for the /cennik page (FEES-01, 05 D-04). Every string below is authoritative
// and comes verbatim from 05-UI-SPEC.md paragraf Copywriting Contract.
//
// HARD RULE 1: NOTHING IN THIS MODULE STATES A ZŁOTY FIGURE. Every amount on /cennik
// comes from src/lib/content/cennik.json through src/lib/cennik.ts, so this module and
// the fee store cannot disagree. That is why the worked example below is a FUNCTION
// taking the already-formatted amount rather than a finished sentence: the example sits
// directly under the block it illustrates, and a retyped figure there would drift away
// from it on the first save an editor makes.
//
// HARD RULE 2: /cennik MUST NOT STATE THE ZUS BENEFIT'S OWN ZŁOTY AMOUNT. The banked
// „do 400 zł miesięcznie" in .planning/DESIGN-BANK.md is stale draft copy, struck by
// 05 D-02, and no confirmed source replaces it. Copying it forward would republish a
// wrong figure AND understate the benefit. The copy therefore says „w maksymalnej
// wysokości" and states that ZUS pays the benefit straight to the żłobek.
//
// HARD RULE 3: the only zero amount on this page lives in the worked example, in the
// SAME paragraph as the condition under which a parent does not pay it. That is the
// form .planning/dane-bip-zlobek-stromiec.md paragraf 10, punkt 1 permits, and the
// scoped test pair in tests/cennik.spec.ts proves both halves of it.
//
// PLACEHOLDER convention (Phase 6 pre-launch grep gate) extends to `// PLACEHOLDER:`
// line comments in this module.
// Copy rules (UI-SPEC v1.2 paragraf 8): no emoji, no em dashes; en dash only inside
// numeric ranges. That ban applies to the comments in this file too.

/** Head metadata. Carries no amount, so an editor's save never invalidates it. */
export const META = {
	tytul: 'Cennik: Publiczny Żłobek w Stromcu',
	opis: 'Opłaty w Publicznym Żłobku w Stromcu: opłata za pobyt, wyżywienie, odpisy za nieobecność oraz świadczenie „Aktywnie w żłobku" z ZUS.'
} as const;

/** Page header. */
export const NAGLOWEK = {
	tytul: 'Cennik',
	lead: 'Tutaj znajdziesz wszystkie opłaty za żłobek: opłatę za pobyt, wyżywienie oraz zasady odpisów za nieobecność. Wyjaśniamy też, jak świadczenie „Aktywnie w żłobku" z ZUS obniża rachunek rodzica.'
} as const;

/** The h2 of each of the six content sections, in the order they render. */
export const SEKCJE = {
	oplata: 'Opłata za pobyt',
	zus: 'Świadczenie „Aktywnie w żłobku" (ZUS)',
	wyzywienie: 'Wyżywienie',
	nieobecnosc: 'Nieobecność dziecka',
	platnosci: 'Jak i kiedy płacić',
	podstawa: 'Podstawa prawna'
} as const;

/** The breakdown block: its h3 and the three row labels. The VALUES belong to the
 *  store; only the labels are copy. */
export const ROZBICIE = {
	naglowek: 'Skąd bierze się ta kwota',
	stawka: 'Stawka z uchwały',
	obnizka: 'Obniżka',
	placi: 'Rodzic płaci'
} as const;

/** The worked example, as ONE paragraph, with the amount interpolated from the store.
 *
 *  `kwotaProza` is CENNIK.kwotaProza, which already carries the period word, so the
 *  sentence reads „opłata za pobyt wynosi 1 500 zł miesięcznie." and the period word is
 *  declared in exactly one place in the codebase.
 *
 *  This is the only rendered string on /cennik that contains a zero amount, and the
 *  condition under which a parent pays it sits in the same sentence, never in a
 *  sibling paragraph a responsive rule could move. */
export function przykladZus(kwotaProza: string): string {
	return (
		`Przykład: opłata za pobyt wynosi ${kwotaProza}. Jeśli ZUS przyzna świadczenie ` +
		'„Aktywnie w żłobku" w maksymalnej wysokości, przekazuje je bezpośrednio do żłobka ' +
		'i pokrywa całą tę opłatę, więc rodzic dopłaca 0 zł. Świadczenie nie jest ' +
		'przyznawane automatycznie: wniosek składa rodzic, a decyzję podejmuje ZUS.'
	);
}

/** How to apply for the benefit. Names no ZUS amount and no deadline. */
export const ZUS_WNIOSEK =
	'Wniosek o świadczenie składasz elektronicznie, w serwisie ZUS. Chętnie pomożemy Ci przejść przez formalności: zadzwoń lub napisz do nas.';

// PLACEHOLDER: what the daily wyżywienie rate covers is not stated by any committed
// source, so this line describes the scope in general terms and names no meal, no
// count and no amount. Confirm with the żłobek before launch (Phase 6 sweep).
/** The qualifying line under the stored wyżywienie sentence. */
export const WYZYWIENIE_SZCZEGOL =
	'Stawka obejmuje wszystkie posiłki, które dziecko dostaje w żłobku w danym dniu.';

// PLACEHOLDER: the payment method, the payment deadline and the consequence of paying
// late are carried by NO source in this repository (05 D-30). This section therefore
// states an account number, a day of the month, an interest rule and a consequence
// NOWHERE, and points a parent at the żłobek instead. Confirm all three with the
// żłobek before launch (Phase 6 sweep).
/** „Jak i kiedy płacić". Invents nothing. */
export const PLATNOSCI =
	'Zasady płatności, w tym termin i numer konta, przekazujemy rodzicom przy zapisie dziecka do żłobka. Jeśli chcesz poznać je wcześniej, zadzwoń lub napisz do nas.';

/** „Podstawa prawna" and its link into the documents section. The uchwała itself is
 *  never restated here: it lives in /dokumenty, which is the surface that owns it. */
export const PODSTAWA = {
	tresc:
		'Wysokość opłat ustala Rada Gminy Stromiec w uchwale. Aktualną uchwałę znajdziesz ' +
		'w zakładce Dokumenty.',
	etykietaLinku: 'Zobacz dokumenty',
	href: '/dokumenty'
} as const;

/** Closing call to action, reusing the site-wide primary Cta. */
export const CTA = {
	etykieta: 'Zapisz dziecko',
	href: '/rekrutacja'
} as const;
