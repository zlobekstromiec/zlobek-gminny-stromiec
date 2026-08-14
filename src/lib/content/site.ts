// Single source for homepage facts and recruitment copy (UI-SPEC Amendments v1.1/v1.2).
// Phase 3 replaces `posts` with the CMS feed; staff-editable strings migrate to the
// CMS content layer then. PLACEHOLDER convention (Phase 6 pre-launch grep gate)
// extends to `// PLACEHOLDER:` line comments in this module.
// Copy rules (v1.2 §8): no emoji, no em dashes; en dash only inside numeric ranges.

/** VERBATIM client core message (PROJECT.md line 47). FINAL copy: do not alter a
 *  single character. Its em dash and typographic quotes are byte-exempt from the
 *  no-em-dash sweep. Kept single-line so the wording is contiguous (prettier-safe). */
export const coreMessage =
	'„Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej pociechy. Będziemy cierpliwie ocierać łzy, kołysać do snu i z autentycznym zachwytem świętować każde małe zwycięstwo — od samodzielnie zjedzonej zupki po pierwszy, odważny krok."';

/** Recruitment window switch, flipped by a human, never a date comparison
 *  (a deadline that silently flips at midnight without staff knowing is worse
 *  than a stale one). CMS-editable in a later phase.
 *
 *  Set to `false` per D-06: the nabór for 2026/2027 is finished (Regulamin
 *  rekrutacji, Zarządzenie 29.2026 harmonogram ran 01.04-12.05.2026), and the
 *  lista rezerwowa is the open channel. Flip back to `true` only when the Urząd
 *  Gminy announces the next nabór. */
export const recruitmentOpen = false;

/** Launch-week announcement bar flag: banked only, no component renders it yet.
 *  Copy and rules live in .planning/DESIGN-BANK.md (accent bg, never danger). */
export const openingBanner = false;

export const contact = {
	/** FINAL: [BIP]-confirmed by both the statut (uchwała XXIII.133.2026) and the
	 *  fee uchwała XXIII.134.2026 (.planning/dane-bip-zlobek-stromiec.md §1). */
	addressLines: ['ul. Radomska 72', '26-804 Stromiec'],
	// PLACEHOLDER: published by explicit user decision (D-08), overriding the
	// source document's `[?]` marker. LAUNCH GATE: confirm this is a służbowy
	// line and not Kamila Dobosz's private number before go-live (Phase 6).
	phoneDisplay: '510 094 051',
	phoneHref: 'tel:+48510094051',
	/** FINAL: confirmed public institutional inbox; do NOT mark placeholder. */
	email: 'zlobek@ugstromiec.pl',
	// PLACEHOLDER: [KD]-sourced (confirmed by e-mail, not by a BIP document) and
	// recorded as "może ulec zmianie"; re-confirm before launch.
	hours: 'pon.-pt. 6:30–16:30'
	// The former żłobek office-hours field is deliberately GONE: the source
	// document records no such hours, so the old value was invented. Where a
	// wniosek is filed is an Urząd Gminy fact, see `urzad` below.
} as const;

/** FINAL [BIP]: recruitment is run by the Wójt through the Komisja Rekrutacyjna,
 *  not by the żłobek (Zarządzenie 29.2026), and wnioski are filed at the Urząd
 *  Gminy. Every surface that tells a parent where to file reads THIS object, so
 *  the homepage, /rekrutacja and /kontakt can never drift apart. */
export const urzad = {
	name: 'Urząd Gminy w Stromcu',
	addressLines: ['ul. Piaski 4', '26-804 Stromiec'],
	room: 'pokój 17',
	wnioskiHours: 'pon.-pt. 8:00–15:00'
} as const;

export type KeyFact = {
	label: string;
	value: string;
	/** rendered inline after the value, Nunito 400 15px muted */
	suffix?: string;
	/** bespoke duotone icon shown in the tint chip */
	icon: 'smile' | 'clock' | 'coins' | 'house';
	/** tint chip surface (decorative only; icon stroke stays accessible-tier) */
	tint: 'yellow' | 'blue' | 'orange' | 'green';
};

export const keyFacts: KeyFact[] = [
	/** FINAL: [BIP] statut range (od ukończenia 20. tygodnia życia do 3 lat,
	 *  wyjątkowo do 4). */
	{
		label: 'Wiek dzieci',
		value: 'od 20. tyg. życia do 3 lat',
		suffix: 'wyjątkowo do 4 lat',
		icon: 'smile',
		tint: 'yellow'
	},
	// PLACEHOLDER: [KD]-sourced hours, recorded as "może ulec zmianie".
	{ label: 'Godziny otwarcia', value: '6:30–16:30', icon: 'clock', tint: 'blue' },
	// PLACEHOLDER: exact fee wording pending client confirmation (D-09). The amount
	// itself is [BIP] (uchwała XXIII.134.2026: 2 337 zł minus 837 zł obniżki).
	// HARD RULE (dane-bip §10.1): the zero figure may appear ONLY attached to the
	// ZUS „Aktywnie w żłobku" condition. An unconditional zero is a publishing defect.
	{
		label: 'Opłata miesięczna',
		value: '1 500 zł',
		suffix: '+ wyżywienie maks. 20 zł/dzień; możliwe 0 zł ze świadczeniem ZUS „Aktywnie w żłobku"',
		icon: 'coins',
		tint: 'orange'
	},
	/** FINAL: [BIP] 50 miejsc utworzonych w programie Aktywny Maluch. */
	{ label: 'Liczba miejsc', value: '50', icon: 'house', tint: 'green' }
];

export type Perk = {
	title: string;
	body: string;
	icon: 'shield' | 'heart' | 'blocks' | 'tree';
	tint: 'blue' | 'pink' | 'yellow' | 'green';
};

export const perks: Perk[] = [
	{
		title: 'Bezpieczeństwo',
		body: 'Nowy, monitorowany budynek zaprojektowany specjalnie dla maluchów.',
		icon: 'shield',
		tint: 'blue'
	},
	{
		title: 'Troskliwa kadra',
		body: 'Wykwalifikowane opiekunki z sercem do pracy z najmłodszymi.',
		icon: 'heart',
		tint: 'pink'
	},
	{
		title: 'Rozwój przez zabawę',
		body: 'Zajęcia muzyczne, plastyczne i ruchowe dopasowane do wieku.',
		icon: 'blocks',
		tint: 'yellow'
	},
	{
		title: 'Plac zabaw',
		body: 'Bezpieczny, kolorowy ogród do codziennych zabaw na powietrzu.',
		icon: 'tree',
		tint: 'green'
	}
];

// dayPlan migrated to src/lib/content/day-plan.json (D-03): single shared source
// so the homepage DayPlan and /o-nas render byte-identical rows.

type RecruitmentStrings = {
	pill: string;
	heading: string;
	deadline: string;
	body: string;
};

const openStrings: RecruitmentStrings = {
	pill: 'Nabór 2026/2027 trwa: wolne miejsca',
	heading: 'Nabór na rok 2026/2027 trwa',
	// PLACEHOLDER: recruitment window wording, pending written client confirmation.
	deadline: 'Rekrutacja uzupełniająca: zapisy przez cały rok',
	body: 'Wystarczą cztery kroki, a jeśli coś jest niejasne, po prostu zadzwoń.'
};

/** Live copy since D-06. Verified string by string against 04-UI-SPEC.md
 *  „Status banner (closed state)" and the Regulamin rekrutacji digest: a closed
 *  nabór is neutral information, never an error state, and the archival
 *  2026/2027 harmonogram is never presented as current (dane-bip §10.3). */
const closedStrings: RecruitmentStrings = {
	pill: 'Nabór zakończony: lista rezerwowa otwarta',
	heading: 'Nabór na rok 2026/2027 zakończony',
	deadline: 'Zapisy na listę rezerwową przez cały rok',
	body: 'Rekrutacja podstawowa została zakończona, ale w ciągu roku zwalniają się miejsca. Zgłoszenie na listę rezerwową możesz złożyć w dowolnym momencie.'
};

/** Derived once here; components import `recruitment`, never plumb the boolean. */
export const recruitment = {
	...(recruitmentOpen ? openStrings : closedStrings),
	// PLACEHOLDER: the date of the next nabór is unconfirmed. The archival
	// 2026/2027 harmonogram may NEVER be presented as current (dane-bip §10.3),
	// so this line points at the announcing authority instead of a date.
	nastepnyNabor: 'Termin kolejnego naboru ogłosi Urząd Gminy w Stromcu.',
	/** [BIP] Regulamin rekrutacji (Zarządzenie 29.2026) + statut age range.
	 *  Eligibility here is ZAMIESZKANIE only: the statut's employment-based
	 *  criterion contradicts the regulamin and is an unresolved discrepancy
	 *  (dane-bip §10.5), so it must not ship as a fact. */
	infoCard:
		'Przyjmujemy dzieci od ukończenia 20. tygodnia życia do 3 lat (wyjątkowo do 4 lat), zamieszkałe na terenie Gminy Stromiec. Dzieci nieprzyjęte trafiają na listę oczekujących. W kolejnych latach pobyt przedłuża się na podstawie deklaracji kontynuacji, bez ponownego naboru.',
	/** Exactly FOUR steps: the homepage acceptance suite asserts the count, and
	 *  the addresses come from `urzad` so no component hard-codes them. Step 2
	 *  carries no e-mail and no electronic route: filing is in person only ([BIP]
	 *  regulamin), which also keeps the homepage's single-mailto rule intact. */
	steps: [
		{
			title: 'Pobierz wniosek',
			body: 'Wniosek o przyjęcie dziecka wraz z załącznikami znajdziesz w sekcji Dokumenty.'
		},
		{
			title: 'Złóż wniosek osobiście',
			body: `Wnioski przyjmuje ${urzad.name}, ${urzad.addressLines[0]}, ${urzad.room}, w godzinach ${urzad.wnioskiHours}. Nie ma możliwości złożenia wniosku drogą elektroniczną ani pocztą.`
		},
		{
			title: 'Poczekaj na wyniki',
			body: 'Wnioski weryfikuje i punktuje Komisja Rekrutacyjna powołana przez Wójta Gminy Stromiec. Przy równej liczbie punktów decyduje data wpływu wniosku. Od rozstrzygnięcia możesz odwołać się do Wójta w ciągu 7 dni.'
		},
		{
			title: 'Podpisz umowę',
			body: 'Po zakwalifikowaniu dziecka zapraszamy rodziców na podpisanie umowy i spotkanie adaptacyjne.'
		}
	]
	// The docs panel is no longer hard-coded here (D-18): the homepage now reads a
	// curated subset from the shared `dokumenty` collection via +page.server.ts, so
	// its names, meta, and hrefs stay in sync with /dokumenty and match the real BIP
	// set. Heading, deadline, body, infoCard, and steps stay content-authored here.
} as const;

/** Client-safe post shape for the homepage NewsPreview prop (NEWS-01). It mirrors
 *  the fields NewsCard consumes and is structurally compatible with the reader's
 *  PostWithMeta, so `readLatest(3)` output types this prop directly. The homepage
 *  load supplies posts at build (+page.server.ts); this module no longer holds a
 *  stub: the shared `aktualnosci` reader is the single source (Amendment v1.1 §1). */
export type Post = {
	tytul: string;
	href: string;
	iso: string;
	dataDisplay: string;
	excerpt: string;
	obraz?: string;
	obraz_alt?: string;
};
