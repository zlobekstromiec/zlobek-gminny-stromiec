/**
 * The English-chrome detector, declared ONCE and used by two suites (ROADMAP 04.1
 * success criterion 2, CMS-03, SITE-06).
 *
 * WHY THIS FILE EXISTS. The banned list started inside tests/admin-copy.unit.ts, where
 * it sweeps the copy module's exported strings. Plan 10 adds a second consumer,
 * tests/admin-polski.spec.ts, which sweeps the RENDERED TEXT of every admin screen in a
 * real browser, and that is the enforced half: `npm run test` is a gate this project
 * runs, while `npm run test:unit` is not (04.1-VALIDATION.md, caveat AG-3). Two copies of
 * a banned list are two lists that agree today and disagree the first time somebody adds
 * a word to one of them, so both suites import this module instead.
 *
 * It deliberately imports NOTHING, in particular not Playwright: it has to load under
 * `node --test` as well as inside a browser spec. It lives under tests/fixtures/ so it
 * sits outside Playwright's spec matcher and is never collected as a test.
 *
 * THE WORD BOUNDARY IS SPELLED OUT AS A UNICODE LOOKAROUND, never `\b`. In JavaScript
 * `\b` treats every Polish diacritic as a non-word character, so `\bno\b` matches INSIDE
 * „ważność": the boundary falls between ż and n and again between n and o's neighbour ś.
 * That was observed rather than reasoned about, the first time the copy sweep ran, and
 * KONTROLA_UJEMNA below keeps that specific word in the suite forever.
 *
 * Do NOT remove a word from ANGIELSKIE_SLOWA to make a suite pass. The list is the floor,
 * not the ceiling: the correct fix for a hit is Polish copy.
 */

/** Nothing that is a letter, a digit or an underscore may precede a match. */
export const GRANICA_PRZED = '(?<![\\p{L}\\p{N}_])';

/** Nothing that is a letter, a digit or an underscore may follow a match. */
export const GRANICA_PO = '(?![\\p{L}\\p{N}_])';

/** English chrome a Polish panel must never render. Whole words only, case insensitive,
 *  so a Polish word that merely contains these letters is not a false positive. */
export const ANGIELSKIE_SLOWA: readonly string[] = Object.freeze([
	'Save',
	'Cancel',
	'Delete',
	'Edit',
	'Submit',
	'Login',
	'Log out',
	'Loading',
	'Error',
	'Required',
	'Choose File',
	'Browse',
	'Next',
	'Back',
	'Yes',
	'No'
]);

/** The pattern for one banned word. A space in the word matches any run of whitespace,
 *  so „Log out" is caught across a line break in rendered text as well as in a literal. */
export function wzorzecSlowa(slowo: string): RegExp {
	return new RegExp(`${GRANICA_PRZED}${slowo.replaceAll(' ', '\\s+')}${GRANICA_PO}`, 'iu');
}

/** Every banned word present in a piece of text, in list order. Empty means clean. */
export function znajdzAngielskie(tekst: string): string[] {
	return ANGIELSKIE_SLOWA.filter((slowo) => wzorzecSlowa(slowo).test(tekst));
}

/** POSITIVE CONTROL. A detector that matched nothing at all would make every „no English
 *  found" result indistinguishable from a clean surface, which is the failure mode this
 *  whole file is written against. Each sample below MUST be caught, and both suites
 *  assert that before they assert anything about real copy. */
export const KONTROLA_DODATNIA: readonly string[] = Object.freeze([
	'Save changes',
	'log out',
	'CHOOSE FILE',
	'Delete this entry'
]);

/** NEGATIVE CONTROL. Real Polish that must NOT be flagged. „ważność" is the word that
 *  broke the first version of this detector and it stays here permanently. */
export const KONTROLA_UJEMNA: readonly string[] = Object.freeze([
	'Wybierz plik',
	'Zapisz zmiany',
	'Sprawdź ważność kodu',
	'Nabór zamknięty',
	'Nie znaleziono tej treści'
]);
