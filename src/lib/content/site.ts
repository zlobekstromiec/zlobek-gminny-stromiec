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
 *  than a stale one). CMS-editable in a later phase. */
export const recruitmentOpen = true;

/** Launch-week announcement bar flag: banked only, no component renders it yet.
 *  Copy and rules live in .planning/DESIGN-BANK.md (accent bg, never danger). */
export const openingBanner = false;

export const contact = {
	// PLACEHOLDER: street address, real value pending written client confirmation.
	addressLines: ['ul. Radomska 5', '26-804 Stromiec'],
	// PLACEHOLDER: phone number, pending written client confirmation.
	phoneDisplay: '48 619 10 25',
	phoneHref: 'tel:+48486191025',
	/** FINAL: confirmed public institutional inbox; do NOT mark placeholder. */
	email: 'zlobek@ugstromiec.pl',
	// PLACEHOLDER: opening hours, pending written client confirmation.
	hours: 'pon.-pt. 6:30–16:30',
	// PLACEHOLDER: secretariat hours, pending written client confirmation.
	secretariatHours: 'sekretariat: pon.-pt. 7:00–15:00'
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
	// PLACEHOLDER: age range, pending written client confirmation. This CORRECTS the
	// earlier "20 tyg. – 3 lata" which was wrongly marked statutory-final: a żłobek
	// statute sets its own minimum age.
	{ label: 'Wiek dzieci', value: '10 mies. – 3 lata', icon: 'smile', tint: 'yellow' },
	// PLACEHOLDER: opening hours, pending written client confirmation.
	{ label: 'Godziny otwarcia', value: '6:30–16:30', icon: 'clock', tint: 'blue' },
	// PLACEHOLDER: fees, pending written client confirmation.
	{
		label: 'Opłata miesięczna',
		value: '400 zł',
		suffix: '+ wyżywienie 14 zł/dzień',
		icon: 'coins',
		tint: 'orange'
	},
	// PLACEHOLDER: capacity, pending written client confirmation.
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

const closedStrings: RecruitmentStrings = {
	pill: 'Nabór zakończony: lista rezerwowa otwarta',
	heading: 'Nabór na rok 2026/2027 zakończony',
	deadline: 'Zapisy na listę rezerwową przez cały rok',
	body: 'Rekrutacja podstawowa została zakończona, ale w ciągu roku zwalniają się miejsca. Zgłoszenie na listę rezerwową możesz złożyć w dowolnym momencie.'
};

/** Derived once here; components import `recruitment`, never plumb the boolean. */
export const recruitment = {
	...(recruitmentOpen ? openStrings : closedStrings),
	// PLACEHOLDER: age range + admission rules, pending written client confirmation.
	infoCard:
		'Przyjmujemy dzieci w wieku od 10 miesięcy do 3 lat, zamieszkałe na terenie gminy Stromiec. Rekrutacja uzupełniająca trwa przez cały rok, w miarę wolnych miejsc.',
	steps: [
		{
			title: 'Pobierz kartę zgłoszenia',
			body: 'Formularz znajdziesz w panelu obok lub w sekretariacie żłobka.'
		},
		{
			// Plain text e-mail by design: the homepage carries exactly ONE mailto
			// (in ContactAndMap); a second would break the acceptance test's
			// strict-mode locator (UI-SPEC v1.2 §6).
			title: 'Złóż dokumenty',
			body: 'Osobiście w żłobku (pon.-pt. 7:00–15:00), e-mailem na zlobek@ugstromiec.pl lub przez ePUAP.'
		},
		{
			title: 'Poczekaj na wyniki',
			body: 'Komisja rekrutacyjna weryfikuje zgłoszenia. O przyjęciu dziecka poinformujemy telefonicznie i e-mailem.'
		},
		{
			title: 'Podpisz umowę',
			body: 'Po zakwalifikowaniu dziecka zapraszamy rodziców na podpisanie umowy i spotkanie adaptacyjne.'
		}
	],
	docs: [
		// PLACEHOLDER: hrefs point at /dokumenty and meta stays 'PDF' until the real
		// files land in Phase 2 (then each row links its file with real size + date).
		{ name: 'Karta zgłoszenia dziecka', meta: 'PDF', href: '/dokumenty' },
		{ name: 'Regulamin rekrutacji', meta: 'PDF', href: '/dokumenty' },
		{ name: 'Statut żłobka', meta: 'PDF', href: '/dokumenty' },
		{ name: 'Regulamin organizacyjny', meta: 'PDF', href: '/dokumenty' },
		{ name: 'Upoważnienie do odbioru dziecka', meta: 'PDF', href: '/dokumenty' },
		{ name: 'Oświadczenia RODO', meta: 'PDF', href: '/dokumenty' }
	]
} as const;

export type Post = { title: string; date: string; href: string; excerpt?: string };

/** Empty until Phase 3 wires the CMS. The homepage derives showNews from
 *  posts.length; it never renders a news empty state (Amendment v1.1 §1). */
export const posts: Post[] = [];
