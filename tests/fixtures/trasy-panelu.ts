/**
 * THE PANEL'S ROUTE LIST, declared ONCE and used by two suites (05-RESEARCH Pitfall 5).
 *
 * WHY THIS FILE EXISTS. The list started inside tests/admin-polski.spec.ts, which sweeps
 * every rendered panel screen for English chrome. That made it the single most dangerous
 * hand-maintained list in the project, for a reason that has nothing to do with English: a
 * new panel screen missing from it has ZERO Polish coverage, the suite still reports every
 * case green, and NOTHING signals the gap. Every other enumeration surface fails loudly
 * when it is forgotten; this one fails by being quiet.
 *
 * Plan 05-05 moved the list here so a second suite,
 * tests/admin-enumeracja.spec.ts, can walk src/routes/admin on disk and assert that every
 * static route the panel really serves appears below. That is the check that turns the
 * silent failure into a red one, permanently.
 *
 * It lives under tests/fixtures/ so it sits outside Playwright's spec matcher
 * (`**\/*.@(spec|test).?(c|m)[jt]s?(x)`) and is never collected as a test of its own, the
 * same arrangement tests/fixtures/angielskie-chrome.ts already uses.
 *
 * Do NOT narrow this list to make a suite pass. A surface that genuinely cannot be covered
 * belongs in the plan's SUMMARY by name, with its reason.
 */
import { readdirSync } from 'node:fs';

/** Slugs read from the committed content rather than retyped, so a renamed seed file
 *  cannot leave a suite quietly scanning a not-found page instead of an edit screen. */
export function slugi(kolekcja: string): string[] {
	return readdirSync(new URL(`../../src/lib/content/${kolekcja}`, import.meta.url))
		.filter((nazwa) => nazwa.endsWith('.json'))
		.map((nazwa) => nazwa.replace(/\.json$/u, ''))
		.sort();
}

export const WPIS = slugi('aktualnosci')[0];
export const DOKUMENT = slugi('dokumenty')[0];

/** Every admin URL the panel serves, in navigation order. The login screen is the one
 *  public entry and reaches this list twice: once as step 1 here, and once as step 2 in
 *  its own case in tests/admin-polski.spec.ts, because step 2 exists only after an
 *  action. */
export const TRASY: readonly { nazwa: string; sciezka: string }[] = [
	{ nazwa: 'logowanie, krok pierwszy', sciezka: '/admin/logowanie' },
	{ nazwa: 'pulpit', sciezka: '/admin' },
	{ nazwa: 'lista wpisow', sciezka: '/admin/aktualnosci' },
	{ nazwa: 'nowy wpis', sciezka: '/admin/aktualnosci/nowy' },
	{ nazwa: 'edycja wpisu', sciezka: `/admin/aktualnosci/${WPIS}` },
	{ nazwa: 'potwierdzenie usuniecia wpisu', sciezka: `/admin/aktualnosci/${WPIS}/usun` },
	{ nazwa: 'lista dokumentow', sciezka: '/admin/dokumenty' },
	{ nazwa: 'nowy dokument', sciezka: '/admin/dokumenty/nowy' },
	{ nazwa: 'edycja dokumentu', sciezka: `/admin/dokumenty/${DOKUMENT}` },
	{ nazwa: 'potwierdzenie usuniecia dokumentu', sciezka: `/admin/dokumenty/${DOKUMENT}/usun` },
	{ nazwa: 'strona O nas', sciezka: '/admin/o-nas' },
	{ nazwa: 'plan dnia', sciezka: '/admin/plan-dnia' },
	{ nazwa: 'cennik', sciezka: '/admin/cennik' },
	{ nazwa: 'nabor', sciezka: '/admin/nabor' },
	{ nazwa: 'pomoc', sciezka: '/admin/pomoc' }
];
