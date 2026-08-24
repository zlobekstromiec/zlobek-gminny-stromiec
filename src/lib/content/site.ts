// Single source for homepage facts and recruitment copy (UI-SPEC Amendments v1.1/v1.2).
// Phase 3 replaces `posts` with the CMS feed; staff-editable strings migrate to the
// CMS content layer then. PLACEHOLDER convention (Phase 6 pre-launch grep gate)
// extends to `// PLACEHOLDER:` line comments in this module.
// Copy rules (v1.2 §8): no emoji, no em dashes; en dash only inside numeric ranges.
//
// The import attribute on the JSON below is not decoration: `tests/forms-copy.unit.ts`
// loads this module directly under `node --test`, where an ESM JSON import without
// `with { type: 'json' }` is refused outright. Vite accepts the attribute too, so one
// form works in both places.
import nabor from './nabor.json' with { type: 'json' };
// The homepage fact tiles and the opening hours moved to an editor-owned store in plan
// 05-09 (05-UI-SPEC Contract 7). Both imports are RELATIVE and carry the `.ts` extension for
// the same reason the JSON import above carries its attribute: this module is loaded
// directly under bare `node --test`, where the framework's path alias does not resolve.
import { godzinyPaska } from '../godziny.ts';
import { ATOMY_GODZIN, KAFELKI, type KeyFact } from '../w-skrocie.ts';

/** VERBATIM client core message (PROJECT.md line 47). FINAL copy: do not alter a
 *  single character. Its em dash and typographic quotes are byte-exempt from the
 *  no-em-dash sweep. Kept single-line so the wording is contiguous (prettier-safe). */
export const coreMessage =
	'„Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej pociechy. Będziemy cierpliwie ocierać łzy, kołysać do snu i z autentycznym zachwytem świętować każde małe zwycięstwo — od samodzielnie zjedzonej zupki po pierwszy, odważny krok."';

/** Recruitment window switch, flipped by a human, never a date comparison
 *  (a deadline that silently flips at midnight without staff knowing is worse
 *  than a stale one). CMS-editable in a later phase.
 *
 *  Set to `true` on 2026-08-18, on the żłobek's written confirmation: „Co do statusu
 *  rekrutacji, jest ona stale otwarta ponieważ nie mamy zapełnionych wszystkich miejsc."
 *  It stood at `false` under D-06, when the 2026/2027 nabór had run its stages in the
 *  spring of 2026 and the lista rezerwowa was the only open channel. Free places make
 *  the open state the truthful one, and the strings it selects were rewritten with it:
 *  they no longer name a school year, because what they now describe is a standing state
 *  rather than a window (see `openStrings`). Flip back to `false` only when the żłobek
 *  says the places are full.
 *
 *  The exact archival stage dates are deliberately NOT repeated here. They live in
 *  the committed source document, whose section 10.3 forbids presenting them as
 *  current, and a repository-wide gate (Plan 04-06) keeps them out of src/ so no
 *  future edit can lift them out of a comment and into shipped copy.
 *
 *  The VALUE now lives in src/lib/content/nabor.json because the editorial panel
 *  writes it (04.1 D-16, P-14) and the panel may only ever machine-write JSON under
 *  src/lib/content/, never a TypeScript module. The name, the type and every
 *  consumer's import are unchanged. */
export const recruitmentOpen = nabor.otwarty;

/** Launch-week announcement bar flag: banked only, no component renders it yet.
 *  Copy and rules live in .planning/DESIGN-BANK.md (accent bg, never danger). */
export const openingBanner = false;

export const contact = {
	/** FINAL: [BIP]-confirmed by both the statut (uchwała XXIII.133.2026) and the
	 *  fee uchwała XXIII.134.2026 (.planning/dane-bip-zlobek-stromiec.md §1). */
	addressLines: ['ul. Radomska 72', '26-804 Stromiec'],
	// THERE IS NO PHONE FIELD HERE, and its absence is the content decision of
	// 2026-08-18, not an oversight. The number this object used to carry
	// (`phoneDisplay` / `phoneHref`, published under D-08 with a Phase 6 launch
	// gate asking whether it was a służbowy line) turned out to be the director's
	// PRIVATE mobile. She asked in writing for it to come off the site until the
	// żłobek has its own line: „Proszę narazie nie dodawać nr telefonu ponieważ to
	// mój nr prywatny". The launch gate therefore did its job and the answer was no.
	//
	// So the site now offers exactly ONE contact route, the e-mail below, and every
	// surface that used to phrase an invitation as „zadzwoń" phrases it as „napisz".
	// Restoring a phone is deliberately a one-place edit: add the two fields back
	// here and the TopBar, hero, contact card, footer, /kontakt and both form
	// fallbacks pick them up, because not one of them ever held a literal.
	// tests/kontakt.spec.ts asserts the ABSENCE of any tel: link, so a number
	// reintroduced by hand in markup fails the suite instead of shipping.
	/** FINAL: confirmed public institutional inbox; do NOT mark placeholder. */
	email: 'zlobek@ugstromiec.pl',
	/** FINAL: given in writing by the żłobek's director on 2026-08-24 („Mogę dodać NIP
	 *  7981489629"). Stored DIGITS ONLY and grouped for display by
	 *  `nipDoWyswietlenia` in $lib/identyfikatory, so nothing downstream has to strip
	 *  separators to compare or reuse it. A parent needs this for the ZUS dofinansowanie
	 *  paperwork, which is why it appears on /kontakt and in the footer of every page
	 *  rather than living only in the BIP. */
	nip: '7981489629',
	// PLACEHOLDER: the REGON has not been given to us. `.planning/dane-bip-zlobek-stromiec.md`
	// recorded NIP and REGON together as „[BRAK] jeszcze nieprzyznane"; the NIP arrived on
	// 2026-08-24 and the REGON did not. EMPTY STRING, never an invented or partial number,
	// and both surfaces that render institutional data omit the line entirely while it is
	// empty. Publishing „REGON: brak" on a public body's site states an absence as a fact;
	// omitting the line states nothing. Filling this in is a one-field edit: type the digits
	// between the quotes and the footer and /kontakt both pick it up, because neither holds
	// a literal.
	regon: '',
	// DERIVED, not a literal, since plan 05-09: the opening hours have ONE source, the
	// editor-owned store src/lib/content/w-skrocie.json, and this line, the homepage tile
	// and the footer are all composed from the same four atoms. Before that they were three
	// sources on five surfaces and could disagree on a single page.
	// The launch-gate marker that used to be a `// PLACEHOLDER:` line comment here now lives
	// in that store as the per-tile boolean `godziny.placeholder`, and
	// tests/zastepcze.unit.ts is the sweep that finds it (05-UI-SPEC Contract 11).
	hours: godzinyPaska(ATOMY_GODZIN)
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

/** Re-exported rather than declared, since plan 05-09 moved the tiles into src/lib/w-skrocie.ts
 *  (05-UI-SPEC Contract 7). The type had to travel with them: this module imports that one for
 *  the tiles, so that one cannot import a type back out of this one without closing a cycle.
 *  Every existing `import type { KeyFact } from '$lib/content/site'` keeps working. */
export type { KeyFact };

/**
 * The four homepage fact tiles, composed in src/lib/w-skrocie.ts (05-UI-SPEC Contract 7).
 *
 * WHERE THE FOUR VALUES NOW COME FROM, and why each one sits where it does:
 *  • Wiek dzieci: still code-authored, in that module beside the slot table. Read-only in the
 *    panel, because the same [BIP] statut range is stated a second time and in a second
 *    phrasing in `recruitment.infoCard` below, and an editable tile would let an editor
 *    change one of them and not the other.
 *  • Godziny otwarcia: EDITOR-OWNED, composed from src/lib/content/w-skrocie.json, which is
 *    also what `contact.hours` above and the site footer now read.
 *  • Opłata miesięczna: COMPUTED from the cennik store, so this tile, FeeBox and /cennik can
 *    never disagree about what a parent pays. Read-only in the panel: its note carries the
 *    conditional zero and an editor shortening it would publish a bare zero amount.
 *  • Liczba miejsc: EDITOR-OWNED, from the same store as the hours.
 *
 * THE TWO `// PLACEHOLDER:` LINE COMMENTS THAT USED TO STAND HERE were launch-gate markers,
 * and moving the data without moving them would have deleted two obligations silently. The
 * hours marker is now the per-tile boolean `godziny.placeholder` in that store, swept by
 * tests/zastepcze.unit.ts; the fee marker retired with the amount itself, which is no longer
 * typed anywhere: it is subtracted from the two [BIP] figures in src/lib/cennik.ts.
 */
export const keyFacts: KeyFact[] = KAFELKI;

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
	/** The banner's closing line on /rekrutacja.
	 *
	 *  IT BELONGS TO THE STATE, which is what 2026-08-18 established. It used to be a
	 *  single string on the derived object below, saying that the Urząd Gminy would
	 *  announce the date of the next nabór, and /rekrutacja renders it unconditionally.
	 *  That was harmless only while the nabór was closed. Under a standing open nabór the
	 *  same sentence tells a parent, three lines under „Nabór trwa przez cały rok", to wait
	 *  for an announcement, which is the opposite of what we want them to do. A line whose
	 *  meaning flips with the flag has to live on the two sides of the flag. */
	nastepnyNabor: string;
};

/** CONFIRMED IN WRITING by the żłobek on 2026-08-18: „Co do statusu rekrutacji, jest
 *  ona stale otwarta ponieważ nie mamy zapełnionych wszystkich miejsc." That sentence
 *  changed the KIND of statement these four strings make, not merely their tense.
 *
 *  They used to name a school year, because the state they described was a WINDOW: a
 *  nabór that opened, ran its stages and closed. What the żłobek describes is a
 *  standing state with a cause: places are free, so applications are taken. A year
 *  label on a standing state is a promise to edit these strings every August, and the
 *  August nobody does it is the August the site starts lying. The year is therefore
 *  gone from all four, and the one thing a parent has to know instead, that the door is
 *  open only while places last, is said out loud in `deadline` and `body`.
 *
 *  The former `// PLACEHOLDER:` marker on `deadline` retired with the same sentence. */
const openStrings: RecruitmentStrings = {
	pill: 'Nabór trwa: mamy wolne miejsca',
	heading: 'Nabór trwa przez cały rok',
	deadline: 'Zapisy przyjmujemy przez cały rok, dopóki mamy wolne miejsca',
	body: 'Nie czekasz na termin: wystarczą cztery kroki. Jeśli coś jest niejasne, napisz do nas.',
	nastepnyNabor: `Wnioski przyjmuje ${urzad.name}. Liczba miejsc jest ograniczona, więc o przyjęciu decyduje kolejność i punktacja wniosków.`
};

/** Live copy since D-06. Verified string by string against 04-UI-SPEC.md
 *  „Status banner (closed state)" and the Regulamin rekrutacji digest: a closed
 *  nabór is neutral information, never an error state, and the archival
 *  2026/2027 harmonogram is never presented as current (dane-bip §10.3). */
const closedStrings: RecruitmentStrings = {
	pill: 'Nabór zakończony: lista rezerwowa otwarta',
	heading: 'Nabór na rok 2026/2027 zakończony',
	deadline: 'Zapisy na listę rezerwową przez cały rok',
	body: 'Rekrutacja podstawowa została zakończona, ale w ciągu roku zwalniają się miejsca. Zgłoszenie na listę rezerwową możesz złożyć w dowolnym momencie.',
	// PLACEHOLDER: the date of the next nabór is unconfirmed. The archival 2026/2027
	// harmonogram may NEVER be presented as current (dane-bip §10.3), so this line
	// points at the announcing authority instead of a date.
	nastepnyNabor: 'Termin kolejnego naboru ogłosi Urząd Gminy w Stromcu.'
};

/** Both status-banner headlines, side by side, for the panel's „Tak zobaczy to
 *  rodzic" preview (04.1-UI-SPEC Component Contract 13). The preview has to show the
 *  editor the consequence of the state they are ABOUT to save, which is the one state
 *  the derived `recruitment` object below cannot describe, because it has already
 *  collapsed to the current one. Reading the same two strings the public page renders
 *  is what makes it impossible for the panel and /rekrutacja to disagree; a
 *  paraphrase in the panel would drift the first time this copy is edited. */
export const recruitmentHeadings = {
	otwarty: openStrings.heading,
	zamkniety: closedStrings.heading
} as const;

/** Derived once here; components import `recruitment`, never plumb the boolean. */
export const recruitment = {
	...(recruitmentOpen ? openStrings : closedStrings),
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
