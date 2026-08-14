// Single source for the /rekrutacja page content (RECRUIT-01, RECRUIT-02,
// RECRUIT-05). Every fact below comes from the committed source document
// .planning/dane-bip-zlobek-stromiec.md: the Regulamin rekrutacji (Zarządzenie
// 29.2026 Wójta Gminy Stromiec, sections 4) and the fee uchwała XXIII.134.2026
// (section 3). Nothing here is invented, and nothing listed in section 10 of that
// document (the do-not-publish gate) is published.
//
// D-18: this is a PLAIN CODE-AUTHORED content module. It has no CMS collection, no
// config.yml entry and no Sveltia or GitHub coupling of any kind. The user has
// descoped CMS editing of recruitment information for v1 and intends to replace the
// CMS entirely, so this content must survive that migration untouched.
//
// Address, room and office-hours values are NEVER duplicated here: they are
// interpolated from the shared `urzad` object in site.ts, so /rekrutacja, /kontakt
// and the homepage can never tell a parent three different things.
//
// PLACEHOLDER convention (Phase 6 pre-launch grep gate) extends to `// PLACEHOLDER:`
// line comments in this module.
// Copy rules (UI-SPEC v1.2 §8): no emoji, no em dashes; en dash only inside numeric
// ranges. That ban applies to the comments in this file too.
import { urzad } from '$lib/content/site';

/** One scoring row of the Regulamin rekrutacji. */
export type Kryterium = {
	kryterium: string;
	punkty: number;
};

/** FINAL [BIP]: the complete scoring table of the Regulamin rekrutacji (source
 *  document section 4, „Kryteria i punktacja"), all eight rows, verbatim point
 *  values, in the order the regulamin lists them.
 *
 *  IMPORTANT distinction, and the reason two rows below mention work: these are the
 *  regulamin's SCORING criteria, which are publishable. They are not conditions of
 *  admission. The statut's separate work-based ELIGIBILITY criterion contradicts the
 *  regulamin (which speaks only of residence) and is an unresolved discrepancy under
 *  source-document section 10.5, so it must not appear anywhere on this site as a
 *  condition of being admitted. Eligibility copy lives in site.ts `recruitment
 *  .infoCard` and names residence only. */
export const KRYTERIA: Kryterium[] = [
	{ kryterium: 'Zamieszkanie dziecka na terenie Gminy Stromiec', punkty: 50 },
	{ kryterium: 'Obydwoje rodzice pracują lub prowadzą działalność gospodarczą', punkty: 20 },
	{ kryterium: 'Jeden rodzic pracuje lub prowadzi działalność gospodarczą', punkty: 10 },
	{ kryterium: 'Samotne wychowywanie dziecka', punkty: 10 },
	{ kryterium: 'Rodzina wielodzietna (troje i więcej dzieci)', punkty: 10 },
	{ kryterium: 'Dziecko z niepełnosprawnością', punkty: 10 },
	{ kryterium: 'Rodzic z niepełnosprawnością', punkty: 10 },
	{ kryterium: 'Rodzeństwo już korzystające z usług żłobka', punkty: 10 }
];

/** FINAL [BIP]: the regulamin's tie-break rule, rendered as prose beneath the table
 *  because it applies to the whole table rather than to one row. */
export const REMIS = 'Przy równej liczbie punktów decyduje data wpływu wniosku.';

/** One numbered step of the filing procedure. */
export type KrokProcedury = {
	tytul: string;
	tresc: string;
};

/** FINAL [BIP]: the real procedure from the Regulamin rekrutacji (source document
 *  section 4, „Procedura"). Recruitment is run by the Wójt through the Komisja
 *  Rekrutacyjna, not by the żłobek, and wnioski are accepted in person only.
 *
 *  No step carries a date. The 2026/2027 stage-by-stage timetable in the source
 *  document is ARCHIVAL and section 10.3 forbids presenting it as current, so it is
 *  absent from this module entirely, and no date anywhere on this page is presented
 *  as an opening date (section 10.4). The status of the nabór is stated by the banner
 *  copy derived in site.ts, never by a calendar. */
export const PROCEDURA: KrokProcedury[] = [
	{
		tytul: 'Pobierz wniosek',
		tresc:
			'Wniosek o przyjęcie dziecka wraz z załącznikami pobierzesz w sekcji „Wnioski do pobrania" ' +
			'na dole tej strony oraz w Biuletynie Informacji Publicznej.'
	},
	{
		tytul: 'Złóż wniosek osobiście',
		tresc: `Wnioski przyjmuje ${urzad.name}, ${urzad.addressLines[0]}, ${urzad.room}, w godzinach ${urzad.wnioskiHours}. Nie ma możliwości złożenia wniosku drogą elektroniczną ani pocztą.`
	},
	{
		tytul: 'Poczekaj na weryfikację i punktację',
		tresc: `Wnioski weryfikuje i punktuje Komisja Rekrutacyjna powołana przez Wójta Gminy Stromiec. ${REMIS}`
	},
	{
		tytul: 'Możesz się odwołać',
		tresc:
			'Od rozstrzygnięcia Komisji Rekrutacyjnej możesz odwołać się do Wójta w ciągu 7 dni. ' +
			'Wójt rozpatruje odwołanie w ciągu 7 dni, a jego rozstrzygnięcie jest ostateczne.'
	},
	{
		tytul: 'Lista oczekujących i kolejne lata',
		tresc:
			'Dzieci nieprzyjęte trafiają na listę oczekujących. W kolejnych latach pobyt w żłobku ' +
			'przedłuża się na podstawie deklaracji kontynuacji, bez ponownego naboru.'
	},
	{
		tytul: 'Podpisz umowę',
		tresc: 'Po zakwalifikowaniu dziecka zapraszamy rodziców na podpisanie umowy.'
	}
];

// PLACEHOLDER: exact fee wording pending client confirmation (D-09). The amounts
// themselves are [BIP] (uchwała XXIII.134.2026: 2 337 zł za pobyt do 10 godzin
// dziennie, obniżka 837 zł w okresie trwałości projektu, wyżywienie maksymalnie
// 20 zł za dzień) and the absence rule is [BIP] statut.
//
// HARD RULE (source document section 10.1): a zero amount may appear ONLY attached
// to its condition, the granting of the ZUS „Aktywnie w żłobku" benefit. This block
// therefore states what the benefit CAN cover together with the condition, in one
// sentence that cannot be split by a layout change, and it never states a zero
// amount as the fee a parent pays. An unconditional zero is a publishing defect.
//
// This is the COMPACT summary for D-15. The full 2 337 / obniżka / ZUS breakdown
// table belongs to the /cennik page in Phase 5, not here.
/** Compact fee summary rendered by FeeBox.svelte (D-15). */
export const OPLATY = {
	naglowek: 'Opłaty w skrócie',
	kwota: '1 500 zł miesięcznie',
	kwotaOpis:
		'Opłata za pobyt dziecka do 10 godzin dziennie, po obniżce obowiązującej w okresie trwałości projektu.',
	zus: 'Świadczenie „Aktywnie w żłobku" z ZUS może pokryć całą tę opłatę, pod warunkiem że ZUS przyzna je na Twoje dziecko.',
	wyzywienie: 'Wyżywienie: maksymalnie 20 zł za każdy dzień obecności dziecka.',
	nieobecnosc:
		'Za dzień nieobecności nie pobieramy opłaty za pobyt ani za wyżywienie, jeśli zgłosisz nieobecność pierwszego dnia do godziny 8:00.'
} as const;

/** The żłobek's page in the Gmina's Biuletyn Informacji Publicznej. It is the
 *  authoritative source of the wniosek and all six załączniki, so the download
 *  section always links to it, whatever the local document list happens to hold.
 *  We link to the BIP and never rebuild it. */
export const BIP_ZLOBEK = {
	etykieta: 'Biuletyn Informacji Publicznej (BIP)',
	url: 'https://ugstromiec.naszbip.pl/zlobek',
	opis: 'Komplet wniosku i wszystkich załączników znajdziesz w Biuletynie Informacji Publicznej Gminy Stromiec.'
} as const;

/** Empty state for the download list (UI-SPEC Amendment v1.4 „Empty states"). The
 *  rekrutacja category can legitimately be empty, and when it is, the BIP link stays
 *  so a parent is never left with nowhere to go. */
export const WNIOSKI_PUSTE = {
	naglowek: 'Dokumenty pojawią się wkrótce',
	tresc: 'Komplet wniosków i załączników znajdziesz w Biuletynie Informacji Publicznej.'
} as const;
