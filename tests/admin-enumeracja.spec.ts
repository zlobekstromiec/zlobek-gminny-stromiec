import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures/admin';
import { NAWIGACJA, SEKCJE_PANELU } from '../src/lib/content/panel';
import { SCIEZKA_STARTOWA, SCIEZKI_PANELU } from '../src/lib/sciezki-panelu';
import { TRASY } from './fixtures/trasy-panelu';

/**
 * THE ENUMERATION GATE (05-RESEARCH Pitfall 5; 05-UI-SPEC Contract 12).
 *
 * WHAT IT DEFENDS. Adding one screen to this panel means editing SEVEN separate lists, and
 * three of them fail SILENTLY when they are forgotten:
 *
 *  • the route list in tests/fixtures/trasy-panelu.ts, where a missing screen has ZERO
 *    Polish coverage and every case still reports green;
 *  • the path list in src/lib/sciezki-panelu.ts, where a missing entry makes the shell
 *    pair a label with `undefined` and render a chip that goes nowhere;
 *  • the section-title map in src/lib/content/panel.ts, where a missing key degrades the
 *    browser tab to the neutral wordmark and nothing complains.
 *
 * The other four (the nav labels, the copy sweep, the pulpit and the staff manual) already
 * turn red on their own. This file makes the first three loud as well, and it does it
 * inside `npm run test`, which is a gate this project actually runs: `npm run test:unit`
 * is not run by pre-commit and there is no CI (04.1-VALIDATION.md, caveat AG-3).
 *
 * THE ROUTE SET IS DERIVED FROM THE FILESYSTEM, never retyped. A second hand-maintained
 * list would be one more list to forget, which is the very defect under test. Directories
 * carrying a bracketed segment are skipped: those URLs are built from seed slugs and the
 * route list already covers them that way.
 *
 * Do NOT weaken these assertions to make the suite pass. Every one of them is red only
 * when a real screen is missing from a real list, and the fix is to add it there.
 */

const KATALOG_TRAS = fileURLToPath(new URL('../src/routes/admin', import.meta.url));

/** Every STATIC panel URL that has a page, walked off disk.
 *
 *  A directory whose name carries a bracket is a dynamic segment and is skipped whole,
 *  together with everything under it: `/admin/aktualnosci/[slug]/usun` is not a URL
 *  anybody can visit, and its real addresses come from the seed slugs the route list
 *  already builds. */
function trasyZDysku(katalog: string = KATALOG_TRAS, segmenty: string[] = []): string[] {
	const wpisy = readdirSync(katalog, { withFileTypes: true });
	const zebrane: string[] = [];

	if (wpisy.some((wpis) => wpis.isFile() && wpis.name === '+page.svelte')) {
		zebrane.push(
			segmenty.length === 0 ? SCIEZKA_STARTOWA : `${SCIEZKA_STARTOWA}/${segmenty.join('/')}`
		);
	}

	for (const wpis of wpisy) {
		if (!wpis.isDirectory() || wpis.name.includes('[')) continue;
		zebrane.push(...trasyZDysku(`${katalog}/${wpis.name}`, [...segmenty, wpis.name]));
	}

	return zebrane.sort();
}

/** The first path segment under /admin, which is the key the section-title map uses. The
 *  landing screen has none, and its key is the empty string. */
function pierwszySegment(sciezka: string): string {
	return sciezka.replace(/^\/admin\/?/u, '').split('/')[0] ?? '';
}

const TRASY_Z_DYSKU = trasyZDysku();

test.describe('Enumeracja ekranow panelu: kazda lista wymienia kazdy ekran', () => {
	test('kazda statyczna trasa panelu jest na liscie zamiatanej po polsku', async () => {
		// Guards against a vacuous pass. A walker that returned nothing would satisfy the
		// assertion below without looking at a single screen, and the panel has at least as
		// many pages as it has sections in its navigation.
		expect(TRASY_Z_DYSKU.length).toBeGreaterThan(0);
		expect(TRASY_Z_DYSKU.length).toBeGreaterThanOrEqual(SCIEZKI_PANELU.length);

		const zamiatane = new Set(TRASY.map((trasa) => trasa.sciezka));
		const brakujace = TRASY_Z_DYSKU.filter((sciezka) => !zamiatane.has(sciezka));
		expect(
			brakujace,
			`ekrany panelu poza lista w tests/fixtures/trasy-panelu.ts: ${brakujace.join(', ')}`
		).toEqual([]);
	});

	test('sciezki nawigacji i jej etykiety maja te sama dlugosc i kazda odpowiada kodem 200', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);

		// The shell pairs the two lists BY POSITION, so a length mismatch is an `undefined`
		// href on a chip somebody will click.
		expect(SCIEZKI_PANELU.length, 'liczba sciezek nawigacji rozni sie od liczby etykiet').toBe(
			NAWIGACJA.length
		);
		for (const [indeks, sciezka] of SCIEZKI_PANELU.entries()) {
			expect(typeof sciezka, `sciezka nawigacji ${indeks} nie jest tekstem`).toBe('string');
			expect(sciezka.trim().length, `sciezka nawigacji ${indeks} jest pusta`).toBeGreaterThan(0);
		}

		// Through the browser context, so every request carries the session cookie. A chip
		// pointing at a route that redirects to logowanie would answer 200 on the redirect
		// target, so the redirect is refused rather than followed.
		await page.goto(SCIEZKA_STARTOWA);
		for (const sciezka of SCIEZKI_PANELU) {
			const odpowiedz = await page.context().request.get(sciezka, { maxRedirects: 0 });
			expect(odpowiedz.status(), `chip nawigacji prowadzi donikad: ${sciezka}`).toBe(200);
		}
	});

	test('kazda statyczna trasa panelu ma wlasna nazwe sekcji, wiec zaden tytul nie jest ogolny', async () => {
		const bezNazwy = TRASY_Z_DYSKU.filter(
			(sciezka) => SEKCJE_PANELU[pierwszySegment(sciezka)] === undefined
		);
		expect(bezNazwy, `trasy bez wpisu w mapie nazw sekcji: ${bezNazwy.join(', ')}`).toEqual([]);
	});

	test('z pulpitu da sie dojsc do kazdej sekcji z nawigacji', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(SCIEZKA_STARTOWA);

		const kafle = page.locator('main li a');
		const ile = await kafle.count();
		expect(ile).toBeGreaterThan(0);

		const cele = new Set<string>();
		for (let i = 0; i < ile; i += 1) {
			const cel = await kafle.nth(i).getAttribute('href');
			if (cel !== null) cele.add(cel);
		}

		// SUBSET ONLY, and deliberately in this direction: the pulpit carries at least one
		// destination that is not in the navigation (05 D-34), so an equality would go red
		// for a screen that is exactly where the contract puts it.
		const nieosiagalne = SCIEZKI_PANELU.filter(
			(sciezka) => sciezka !== SCIEZKA_STARTOWA && !cele.has(sciezka)
		);
		expect(
			nieosiagalne,
			`sekcje nawigacji bez kafla na pulpicie: ${nieosiagalne.join(', ')}`
		).toEqual([]);
	});
});
