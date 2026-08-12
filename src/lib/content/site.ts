// Single source for homepage facts & recruitment copy (UI-SPEC Amendment v1.1 §5).
// Phase 3 replaces `posts` with the CMS feed; staff-editable strings migrate to the
// CMS content layer then. PLACEHOLDER convention (Phase 6 pre-launch grep gate)
// extends to `// PLACEHOLDER:` line comments in this module.

/** Recruitment window switch — flipped by a human, never a date comparison
 *  (a deadline that silently flips at midnight without staff knowing is worse
 *  than a stale one). CMS-editable in a later phase. */
export const recruitmentOpen = true;

export const contact = {
	// PLACEHOLDER: street address — confirm before launch.
	addressLines: ['ul. [do uzupełnienia]', '26-804 Stromiec'],
	// PLACEHOLDER: phone number — confirm before launch.
	phoneDisplay: '+48 00 000 00 00',
	phoneHref: 'tel:+48000000000',
	/** FINAL — confirmed public institutional inbox; do NOT mark placeholder. */
	email: 'zlobek@ugstromiec.pl',
	// PLACEHOLDER: opening hours — confirm with the żłobek before launch.
	hours: 'pon.–pt. 6:30–16:30'
} as const;

export type KeyFact = {
	label: string;
	value: string;
	/** e.g. '+ wyżywienie' — rendered inline, Nunito 400 15px muted */
	suffix?: string;
	/** maps to a --color-expr-* left border — decorative only, carries no information */
	accent: 'blue' | 'yellow' | 'orange';
};

export const keyFacts: KeyFact[] = [
	// FINAL: statutory żłobek age range (ustawa o opiece nad dziećmi w wieku do lat 3).
	{ label: 'Wiek dzieci', value: '20 tyg. – 3 lata', accent: 'blue' },
	// PLACEHOLDER: opening hours — confirm before launch.
	{ label: 'Godziny otwarcia', value: '6:30 – 16:30', accent: 'yellow' },
	// PLACEHOLDER: monthly fee — confirm before launch.
	{ label: 'Opłata miesięczna', value: '000 zł', suffix: '+ wyżywienie', accent: 'orange' },
	// PLACEHOLDER: capacity — confirm before launch.
	{ label: 'Liczba miejsc', value: '00 dzieci', accent: 'blue' }
];

type RecruitmentStrings = {
	pill: string;
	heading: string;
	deadline: string;
	body: string;
};

const openStrings: RecruitmentStrings = {
	pill: 'Nabór 2026/2027 trwa — wolne miejsca',
	heading: 'Nabór na rok 2026/2027 trwa',
	// PLACEHOLDER: deadline date — confirm the real recruitment window before launch.
	deadline: 'Wnioski przyjmujemy do 31 marca 2026',
	body: 'Przyjmujemy dzieci w wieku od 20 tygodni do 3 lat, zamieszkałe na terenie Gminy Stromiec. Wystarczą trzy kroki — a jeśli coś jest niejasne, po prostu zadzwoń.'
};

const closedStrings: RecruitmentStrings = {
	pill: 'Nabór zakończony — lista rezerwowa otwarta',
	heading: 'Nabór na rok 2026/2027 zakończony',
	deadline: 'Zapisy na listę rezerwową przez cały rok',
	body: 'Rekrutacja podstawowa została zakończona, ale w ciągu roku zwalniają się miejsca. Zgłoszenie na listę rezerwową możesz złożyć w dowolnym momencie.'
};

/** Derived once here — components import `recruitment`, never plumb the boolean. */
export const recruitment = {
	...(recruitmentOpen ? openStrings : closedStrings),
	steps: [
		{
			title: 'Pobierz i wypełnij kartę zgłoszenia',
			body: 'Formularz PDF znajdziesz obok — możesz też odebrać go w żłobku.'
		},
		{
			// Plain text e-mail by design: the homepage carries exactly ONE mailto
			// (in ContactAndMap) — a second would break the acceptance test's
			// strict-mode locator (Amendment v1.1 §6).
			title: 'Złóż dokumenty',
			body: 'Osobiście w żłobku lub e-mailem na zlobek@ugstromiec.pl.'
		},
		{
			// PLACEHOLDER: results date — confirm before launch.
			title: 'Odbierz decyzję',
			body: 'Wyniki ogłaszamy do 15 kwietnia i informujemy telefonicznie.'
		}
	],
	docs: [
		// PLACEHOLDER: file meta 'PDF · ---' + hrefs point at /dokumenty until the
		// real PDFs land in Phase 2 (then each row links its file with real size).
		{ name: 'Karta zgłoszenia dziecka', meta: 'PDF · ---', href: '/dokumenty' },
		{ name: 'Statut żłobka', meta: 'PDF · ---', href: '/dokumenty' },
		{ name: 'Regulamin organizacyjny', meta: 'PDF · ---', href: '/dokumenty' },
		{ name: 'Uchwała w sprawie opłat', meta: 'PDF · ---', href: '/dokumenty' }
	]
} as const;

export type Post = { title: string; date: string; href: string; excerpt?: string };

/** Empty until Phase 3 wires the CMS. The homepage derives showNews from
 *  posts.length — it never renders a news empty state (Amendment v1.1 §1). */
export const posts: Post[] = [];
