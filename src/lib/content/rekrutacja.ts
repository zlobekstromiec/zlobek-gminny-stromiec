// Single source for the /rekrutacja page content (RECRUIT-01, RECRUIT-02,
// RECRUIT-05). Every fact below comes from the committed source document
// .planning/dane-bip-zlobek-stromiec.md: the Regulamin rekrutacji (Zarządzenie
// 29.2026 Wójta Gminy Stromiec, sections 4) and the fee uchwała XXIII.134.2026
// (section 3). Nothing here is invented, and nothing listed in section 10 of that
// document (the do-not-publish gate) is published.
//
// D-18, AS AMENDED BY PLAN 05-02, and the amendment matters because the old wording is
// now false for one block. The prose, dates and criteria below remain PLAIN
// CODE-AUTHORED content that no editorial screen writes: the user descoped editing of
// recruitment INFORMATION for v1, so only the recruitment STATE is editable in the
// panel (04.1-05, src/lib/stan-naboru.ts), and a developer changes everything else.
// THE FEE BLOCK IS THE EXCEPTION. The amounts and the five fee strings in OPLATY are no
// longer written here at all: they are a typed read of src/lib/content/cennik.json,
// which the editorial panel writes from its cennik screen (plan 05-04). So this module
// is code-authored EXCEPT for the fees, and claiming otherwise would send the next
// developer looking for a fee literal that no longer exists in this file.
// This module still survived the Phase 04.1 editor replacement untouched, which is what
// D-18 was written to guarantee.
//
// Address, room and office-hours values are NEVER duplicated here: they are
// interpolated from the shared `urzad` object in site.ts, so /rekrutacja, /kontakt
// and the homepage can never tell a parent three different things.
//
// PLACEHOLDER convention (Phase 6 pre-launch grep gate) extends to `// PLACEHOLDER:`
// line comments in this module.
// Copy rules (UI-SPEC v1.2 §8): no emoji, no em dashes; en dash only inside numeric
// ranges. That ban applies to the comments in this file too.
// Both imports below are RELATIVE and carry an explicit .ts extension rather than using
// the project alias, and that is not cosmetic. tests/kwoty.unit.ts loads this module
// under bare `node --test`, where the alias does not resolve, and that suite is the only
// place the byte pin on OPLATY.kwota can run at all. Same convention and same reason as
// the panel validator at walidacja/nabor.ts:13-15.
import { urzad } from './site.ts';
// CYCLE CONSTRAINT (D-03), recorded here so a later edit does not undo it: this module
// imports site.ts, so routing a homepage value through OPLATY would close a cycle
// site -> rekrutacja -> site. Nothing here does that, and plan 05-09 reads CENNIK
// directly for the homepage fee tile rather than reaching through this module.
import { CENNIK } from '../cennik.ts';

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
// HARD RULE (source document section 10, item 1; cited in that form because the string
// "10.1" does not occur anywhere in that file): a zero amount may appear ONLY attached
// to its condition, the granting of the ZUS „Aktywnie w żłobku" benefit. This block
// therefore states what the benefit CAN cover together with the condition, in one
// sentence that cannot be split by a layout change, and it never states a zero
// amount as the fee a parent pays. An unconditional zero is a publishing defect.
//
// That rule is now enforced TWICE, at two different times. At SAVE time the cennik
// screen's validator refuses an empty ZUS sentence and refuses a reduction that is not
// smaller than the rate (plan 05-04). At RENDER time the scoped test pair in
// tests/cennik.spec.ts proves that every zero amount on the fees page falls inside the
// ZUS block and that the page with that block removed carries none. The compact panel
// below still renders no zero at all, so the older no-zero gate scoped to .fee-box in
// tests/rekrutacja.spec.ts is untouched and still passes.
//
// RESOLVED: the full 2 337 / obniżka / ZUS breakdown no longer belongs to a page that
// does not exist yet. The fees page shipped in plan 05-02 and carries it. What stays
// here is the COMPACT summary for D-15, and both surfaces now read the SAME store, so
// they cannot quote different amounts however either one is edited.
/** Compact fee summary rendered by FeeBox.svelte (D-15).
 *
 *  A typed read of the cennik store, not a literal: every value comes from CENNIK, and
 *  `kwota` is the store's composed prose form, which is the payable amount COMPUTED
 *  from the two stored numbers rather than a third stored one. The exported symbol, its
 *  six keys and its readonly shape are unchanged, so FeeBox.svelte, the rekrutacja route
 *  and tests/rekrutacja.spec.ts all keep working without an edit. */
export const OPLATY = {
	naglowek: CENNIK.naglowek,
	/** The uchwała's rate, which the box now LEADS with (quick 260823-pmv, at the client's
	 *  request after the dyrektor asked the site to state 2 337 zł). NOBODY PAYS THIS while
	 *  the reduction runs, so FeeBox may only render it under a label naming it as the
	 *  uchwała's rate, never as the amount due. */
	stawka: CENNIK.stawkaProza,
	kwota: CENNIK.kwotaProza,
	/** The reduction, for the note that stands between the two amounts and is what makes
	 *  leading with the rate honest. */
	obnizkaTekst: CENNIK.obnizkaTekst,
	kwotaOpis: CENNIK.kwotaOpis,
	zus: CENNIK.zus,
	wyzywienie: CENNIK.wyzywienie,
	nieobecnosc: CENNIK.nieobecnosc
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
