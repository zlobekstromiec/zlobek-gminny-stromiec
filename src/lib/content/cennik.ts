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

/** The h2 of each of the seven content sections, in the order they render. */
export const SEKCJE = {
	oplata: 'Opłata za pobyt',
	zakres: 'Co obejmuje opłata',
	zus: 'Świadczenie „Aktywnie w żłobku" (ZUS)',
	wyzywienie: 'Wyżywienie',
	nieobecnosc: 'Nieobecność dziecka',
	platnosci: 'Jak i kiedy płacić',
	podstawa: 'Podstawa prawna'
} as const;

/** What the fee covers, transposed from the uchwała paragraf 1 ustep 2 quoted in the
 *  dyrektor's e-mail of 2026-08-20 into a parent's language without changing its meaning.
 *
 *  EVERY POINT IS AT MOST 60 CHARACTERS AND THAT IS A LAYOUT CONTRACT, NOT A STYLE
 *  PREFERENCE. The list spans both tracks of the editorial split and runs in two columns
 *  from 1024px, which at 1280px gives each column (1088 − 48) / 2 = 520px, exactly the
 *  65ch cap for 16px text. A longer point wraps to a second line, the list grows by half
 *  and the empty left rail this layout exists to remove comes back. tests/responsive.spec.ts
 *  pins it: no li may exceed 40px tall at 1280px. */
export const ZAKRES = {
	wstep: 'Opłata za pobyt obejmuje:',
	punkty: [
		'opiekę w warunkach zbliżonych do domowych',
		'opiekę pielęgnacyjną i zajęcia z elementami edukacji',
		'zajęcia opiekuńczo-wychowawcze dopasowane do wieku',
		'wyżywienie zgodne z normami żywieniowymi',
		'wsparcie rodziny w wychowaniu dziecka',
		'troskę o zdrowie i bezpieczeństwo dziecka',
		'obserwację rozwoju dziecka i zajęcia pod jego potrzeby'
	]
} as const;

/** The caption directly under the payable amount (quick 260821-gyh).
 *
 *  WHY THIS EXISTS: the loudest figure on the page had no label at all. `CENNIK.naglowek`
 *  sits above it, but that is the block's title, not a caption for the number, so nothing
 *  said which of the three amounts on this page a parent actually pays. The żłobek's own
 *  dyrektor read the uchwała's gross rate as the czesne on 2026-08-20, which is the same
 *  mistake a parent can make, and the fix belongs on the page rather than in a reply.
 *
 *  IT IS A LABEL, NEVER A SENTENCE, and it is code-authored on purpose. `naglowek` and
 *  `kwotaOpis` are store fields the panel writes; a code-authored SENTENCE next to them
 *  would start contradicting whatever an editor saves. A two-word label cannot.
 *
 *  It carries no period word. „miesięcznie" is welded to the figure inside `kwotaProza`
 *  and declared exactly once (05 D-28); a second copy here would have to agree with it
 *  character for character forever. */
export const KWOTA_PODPIS = 'Stawka z uchwały:';

/** The caption on the amount a parent actually pays, inside the reduction note.
 *
 *  „teraz" is doing real work: it says the figure is today's, under a reduction that has an
 *  end date nobody in this repository holds. Without it the two amounts read as a permanent
 *  pair rather than as a rate and its current state. */
export const PODPIS_PLACI = 'Rodzic płaci teraz:';

/** What the uchwała rate covers. Code-authored, because the store's `kwotaOpis` describes the
 *  PAYABLE amount and follows it into the reduction note (and into FeeBox on /rekrutacja),
 *  where it is still true. Moving it rather than rewriting it is what keeps this change to
 *  zero store edits. */
export const STAWKA_OPIS =
	'Pełna miesięczna stawka za pobyt dziecka do 10 godzin dziennie, ustalona uchwałą Rady Gminy Stromiec.';

/** The reduction note, with the reduction interpolated from the store.
 *
 *  A FUNCTION for the same reason `przykladZus` is one: HARD RULE 1 forbids this module from
 *  stating a złoty figure, so the amount arrives as an argument already formatted by the
 *  reader and can never drift from the store.
 *
 *  This note is why /cennik may lead with the uchwała's rate at all. The client asked for
 *  2 337 zł to be the stated price (quick 260823-p4w); this sentence, in the same block and
 *  immediately below it, is what stops a parent reading that as their bill. */
export function notaObnizki(obnizkaTekst: string): string {
	return (
		`Obecnie obowiązuje obniżka ${obnizkaTekst} miesięcznie w okresie trwałości projektu, ` +
		'więc kwota do zapłaty jest niższa od stawki z uchwały.'
	);
}

/** The breakdown block: its h3 and the three row labels. The VALUES belong to the
 *  store; only the labels are copy.
 *
 *  `stawka` says „Pełna" since quick 260821-gyh: the bare „Stawka z uchwały" left the row
 *  ambiguous about whether it was before or after the reduction, and the row directly
 *  below it is the reduction. */
export const ROZBICIE = {
	naglowek: 'Skąd bierze się ta kwota',
	stawka: 'Stawka z uchwały (przed obniżką)',
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
	'Wniosek o świadczenie składasz elektronicznie, w serwisie ZUS. Chętnie pomożemy Ci przejść przez formalności: napisz do nas.';

/** The programme in four points, requested by the dyrektor's e-mail of 2026-08-20.
 *
 *  FOUR, not five. The brief carries five verified facts, and the third of them (ZUS pays
 *  the money straight to the żłobek) is already on this page inside przykladZus, in the
 *  same sentence as its zero amount. Restating it here would be noise and would put the
 *  same claim in two blocks that a responsive rule can separate.
 *
 *  HARD RULE 2 applies to every line below: not one of them states the benefit's own
 *  złoty amount. The ZUS limits change yearly and no editor has a panel field to correct
 *  them, so a published figure would be the first thing on this page to go stale. The
 *  link to zus.pl carries the current numbers instead.
 *
 *  These render as a SIBLING of #zus-blok, never inside it: Contract 4b pins the DOM
 *  order of that block's three paragraphs and the zero-amount gate measures that node. */
export const ZUS_PUNKTY = [
	'„Aktywnie w żłobku" to jedno z trzech świadczeń programu „Aktywny Rodzic".',
	'Wniosek składa rodzic, wyłącznie elektronicznie: w PUE/eZUS, w aplikacji mZUS, w bankowości elektronicznej albo na portalu Emp@tia.',
	'Wniosek złożony w ciągu 2 miesięcy od zapisania dziecka daje świadczenie od miesiąca zapisu. Wniosek złożony później obejmuje dopiero miesiąc, w którym go składasz.',
	'Świadczenie nie przysługuje, jeśli na to samo dziecko w tym samym miesiącu przyznano „aktywni rodzice w pracy" albo „aktywnie w domu".'
] as const;

/** The external ZUS link the dyrektor asked for. The address was verified with curl
 *  before planning (HTTP 200, no redirect). The `/en/` variant is a language path and
 *  must not be used; `/swiadczenia/aktywnyrodzic/...` returns 404. */
export const ZUS_LINK = {
	wstep: 'Szczegóły świadczenia i formularz wniosku znajdziesz na stronie ZUS.',
	etykieta: 'Świadczenie aktywnie w żłobku na zus.pl',
	url: 'https://www.zus.pl/aktywnyrodzic/wiadczenie-aktywnie-w-zlobku'
} as const;

// PLACEHOLDER: what the daily wyżywienie rate covers is not stated by any committed
// source, so this line describes the scope in general terms and names no meal, no
// count and no amount. Confirm with the żłobek before launch (Phase 6 sweep).
/** The qualifying line under the stored wyżywienie sentence. */
export const WYZYWIENIE_SZCZEGOL =
	'Stawka obejmuje wszystkie posiłki, które dziecko dostaje w żłobku w danym dniu.';

// PLACEHOLDER: THREE facts, not four. The account number, the payment deadline and the
// consequence of paying late are still carried by NO source in this repository (05 D-30),
// so this section states an account number, a day of the month, an interest rule and a
// consequence NOWHERE, and points a parent at the żłobek instead. Confirm all three with
// the żłobek before launch (Phase 6 sweep).
//
// The RECIPIENT left this list on 2026-08-20 and is no longer unconfirmed: the uchwała
// paragraf 3 ustep 1, quoted in the dyrektor's e-mail of that date, names Gmina Stromiec,
// and the first sentence below states it. Striking the whole comment instead would have
// quietly falsified the Phase 6 gate for the three facts that remain open.
/** „Jak i kiedy płacić". Names the recipient, invents nothing else. */
export const PLATNOSCI =
	'Opłaty za żłobek wnosisz na rzecz Gminy Stromiec. Zasady płatności, w tym termin i numer konta, przekazujemy rodzicom przy zapisie dziecka do żłobka. Jeśli chcesz poznać je wcześniej, napisz do nas.';

/** „Podstawa prawna" and its link into the documents section. The uchwała itself is
 *  never restated here: it lives in /dokumenty, which is the surface that owns it. */
export const PODSTAWA = {
	tresc:
		'Wysokość opłat ustala Rada Gminy Stromiec w uchwale. Aktualną uchwałę znajdziesz ' +
		'w zakładce Dokumenty.',
	/* Both paragraphs below explain the MECHANISM of the reduction whose arithmetic the
	   breakdown in section 2 already shows. Neither states an amount (HARD RULE 1), and
	   the only en dash is the year range 2022–2029, which is what the copy rules allow. */
	obnizka:
		'Obniżka opłaty obowiązuje w okresie 36 miesięcy trwałości projektu „Budowa Żłobka ' +
		'w miejscowości Stromiec", zrealizowanego w ramach programu „Aktywny Maluch" ' +
		'2022–2029, dofinansowanego ze środków KPO i FERS.',
	aktywnyRodzic:
		'Jeśli ZUS przyzna dofinansowanie na podstawie ustawy z dnia 15 maja 2024 r. ' +
		'o wspieraniu rodziców w aktywności zawodowej oraz w wychowaniu dziecka „Aktywny ' +
		'rodzic" (Dz. U. z 2024 poz. 858 ze zm.), opłata jest obniżana do wysokości ' +
		'przyznanego dofinansowania.',
	etykietaLinku: 'Zobacz dokumenty',
	href: '/dokumenty'
} as const;

/** Closing call to action, reusing the site-wide primary Cta. */
export const CTA = {
	etykieta: 'Zapisz dziecko',
	href: '/rekrutacja'
} as const;
