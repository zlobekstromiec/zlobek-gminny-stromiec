import { test, expect, ADRES_SPOZA_LISTY } from './fixtures/admin';
import { KOPIA_LOGOWANIE } from '../src/lib/content/panel';
import {
	ANGIELSKIE_SLOWA,
	KONTROLA_DODATNIA,
	KONTROLA_UJEMNA,
	znajdzAngielskie
} from './fixtures/angielskie-chrome';
import { TRASY } from './fixtures/trasy-panelu';

/**
 * THE SC2 GATE: every rendered admin surface is Polish, with no English chrome anywhere
 * (ROADMAP 04.1 success criterion 2, CMS-03, SITE-06; 04.1-10 P-28).
 *
 * WHY THIS IS A PLAYWRIGHT SPEC AND NOT A UNIT TEST. Until this file existed, „the panel
 * is Polish" was enforced only by tests/admin-copy.unit.ts, which sweeps the STRINGS in
 * the copy module. Two things were outside its reach and both matter. First, it cannot
 * see a string that was typed straight into a component instead of being read from the
 * copy module, which is precisely the mistake it exists to catch. Second, and decisively,
 * `npm run test:unit` runs in NO automated gate in this repository: `npm run test` is
 * Playwright-only and pre-commit runs check plus lint (04.1-VALIDATION.md, caveat AG-3).
 * This file is the second, enforced check that caveat demands.
 *
 * THE BANNED LIST IS IMPORTED, NOT RETYPED. It lives in tests/fixtures/angielskie-chrome.ts
 * together with its two controls, and tests/admin-copy.unit.ts imports the same module.
 * Two copies of a banned list are two lists that agree today and disagree the first time
 * one of them grows.
 *
 * THE DETECTOR CARRIES A POSITIVE CONTROL, asserted first, before any real screen is
 * looked at. A detector that matches nothing is indistinguishable from a clean panel, and
 * this project has already shipped one broken boundary expression: `\b` treats Polish
 * diacritics as non-word characters, so `\bno\b` matches INSIDE „ważność".
 *
 * WHAT IS SCANNED: the whole `<body>` of each screen with `script` and `style` removed,
 * which is deliberately WIDER than the plan's „main and header landmarks". The skip link,
 * the section nav and the footer are chrome an editor reads too, and a banned word
 * leaking from a component, a browser default, an error page or a validation message has
 * to fail this gate wherever it lands.
 *
 * THE ONE DOCUMENTED EXCEPTION, and it is excluded by construction rather than by a
 * filter: the browse button inside a native `<input type="file">`, and the operating
 * system picker it opens, render in the BROWSER and OS locale and cannot be forced to
 * Polish. 04.1-UI-SPEC.md Component Contract 8 records this as an accepted limitation,
 * resolved deliberately in favour of the native control because every replacement (a
 * styled button, a drop zone) is worse for keyboard and screen-reader users. That chrome
 * is browser-rendered shadow UI and is never a text node, so it can never reach the
 * extraction below. Everything the panel itself renders around the control (the visible
 * label, the hint, the status line and every error) is Polish and IS scanned.
 *
 * THE SECOND RECORDED DECISION A REVIEWER MEETS HERE is P-22 (04.1-08-SUMMARY.md):
 * attaching a file to a document needs JavaScript, and the dokument screens therefore
 * diverge from the UI-SPEC route table, which says they need none. That was a decision
 * taken with its reasons written down, not a defect: a ten megabyte document has to be
 * encoded in the browser (D-12). The Polish sentence that says so out loud is on the
 * create screen below and is swept like every other.
 *
 * Do NOT narrow the route list to make this suite pass. A surface that cannot be covered
 * belongs in the SUMMARY by name, with its reason.
 *
 * THE ROUTE LIST ITSELF NOW LIVES IN A FIXTURE MODULE, imported above, moved there by plan
 * 05-05 together with the on-disk slug helper. A second suite,
 * tests/admin-enumeracja.spec.ts, walks src/routes/admin and asserts that every static
 * route the panel serves is in it, which is what stops a new screen from silently escaping
 * this sweep. Nothing else about this file changed.
 */

/** Rendered text of everything the panel put on the screen. `script` and `style` are
 *  removed because they are code rather than copy; `noscript` is deliberately KEPT, so
 *  the sentence a person with scripting disabled reads is swept like any other. */
async function tekstEkranu(page: import('@playwright/test').Page): Promise<string> {
	return page.evaluate(() => {
		const kopia = document.body.cloneNode(true) as HTMLElement;
		for (const element of kopia.querySelectorAll('script, style')) element.remove();
		return kopia.textContent ?? '';
	});
}

/** Every visible link and button must have a name somebody can act on. An icon-only
 *  control with no accessible name is a control a screen-reader user is told nothing
 *  about, and it is also the easiest place for English chrome to hide, because nothing
 *  visible would show it. */
async function sprawdzNazwyDostepne(page: import('@playwright/test').Page): Promise<void> {
	const kontrolki = page.locator('a:visible, button:visible');
	const ile = await kontrolki.count();
	expect(ile).toBeGreaterThan(0);
	for (let i = 0; i < ile; i += 1) {
		await expect(kontrolki.nth(i)).toHaveAccessibleName(/\S/u);
	}
}

test.describe('Panel po polsku: kazdy renderowany ekran (SC2, P-28)', () => {
	// FIRST, and before any real screen: the detector has to detect. Without this the
	// fourteen cases below would all pass against a regular expression that matches
	// nothing, and „clean" and „broken" would look identical.
	test('wykrywacz angielskiego chrome lapie angielski i nie lapie polskiego', async () => {
		expect(ANGIELSKIE_SLOWA.length).toBeGreaterThan(10);
		for (const probka of KONTROLA_DODATNIA) {
			expect(znajdzAngielskie(probka), `wykrywacz przepuscil: ${probka}`).not.toEqual([]);
		}
		for (const probka of KONTROLA_UJEMNA) {
			expect(znajdzAngielskie(probka), `falszywy alarm na polskim: ${probka}`).toEqual([]);
		}
	});

	for (const trasa of TRASY) {
		test(`ekran „${trasa.nazwa}" jest po polsku i nie niesie angielskiego chrome`, async ({
			page,
			zalogowany
		}) => {
			expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
			const odpowiedz = await page.goto(trasa.sciezka);
			// A screen that answered 404 would be swept clean for the wrong reason.
			expect(odpowiedz?.status(), `${trasa.sciezka} nie odpowiada`).toBe(200);

			// WCAG 3.1.1: the document language is what tells a screen reader which voice
			// to read every sentence below with. Polish text announced in English is
			// unintelligible, which makes this the other half of „the panel is Polish".
			await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

			// A screen that rendered nothing would be swept clean for the wrong reason. The
			// floor is 120 characters because the login card is by far the smallest surface
			// in the panel (a heading, a lead, one label, one hint and one button come to
			// about 185), and every other screen is several times that.
			const tekst = await tekstEkranu(page);
			expect(tekst.trim().length, `${trasa.sciezka} nie wyrenderowal tresci`).toBeGreaterThan(120);
			expect(znajdzAngielskie(tekst), `angielskie chrome na ekranie ${trasa.sciezka}`).toEqual([]);

			await sprawdzNazwyDostepne(page);
		});
	}

	// Step 2 of the login exists only after the step 1 action, so it cannot be reached by
	// a goto. The address used is deliberately NOT on the allowlist: D-02 makes the screen
	// byte-identical either way, so no code is ever stored and no mail is ever sent.
	test('ekran „logowanie, krok drugi" jest po polsku i nie niesie angielskiego chrome', async ({
		page
	}) => {
		await page.goto('/admin/logowanie');
		await page.getByLabel(KOPIA_LOGOWANIE.adresEtykieta, { exact: false }).fill(ADRES_SPOZA_LISTY);
		await page.getByRole('button', { name: KOPIA_LOGOWANIE.adresPrzycisk }).click();
		await expect(page.getByText(KOPIA_LOGOWANIE.kodNaglowek)).toBeVisible();

		await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
		const tekst = await tekstEkranu(page);
		expect(znajdzAngielskie(tekst), 'angielskie chrome na drugim kroku logowania').toEqual([]);
		await sprawdzNazwyDostepne(page);
	});

	// The state an editor meets when they get something wrong is the state that has to be
	// Polish most of all, and it is the one a route sweep never reaches: the form carries
	// `novalidate` precisely so the browser's own English-in-some-locales bubbles never
	// appear and every message is authored Polish instead. An empty submit is what proves
	// that attribute is doing its job.
	test('ekran odmowy zapisu jest po polsku, lacznie z komunikatami walidacji', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin/aktualnosci/nowy');
		await page.getByRole('button', { name: 'Zapisz', exact: true }).click();
		await expect(page.locator('[role="alert"]')).toHaveCount(1);

		const tekst = await tekstEkranu(page);
		expect(znajdzAngielskie(tekst), 'angielskie chrome w stanie odmowy zapisu').toEqual([]);
		await sprawdzNazwyDostepne(page);
	});

	// An error page is chrome too, and it is the one surface nobody authors on purpose. A
	// slug that resolves to nothing renders the panel's own „Nie znaleziono tej treści"
	// rather than a framework page, and this is where that is proven.
	test('ekran nieznalezionej tresci jest po polsku', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin/aktualnosci/nie-ma-takiego-wpisu');
		const tekst = await tekstEkranu(page);
		expect(znajdzAngielskie(tekst), 'angielskie chrome na ekranie braku tresci').toEqual([]);
	});

	// The session-expired and logged-out banners are two more states no goto reaches on
	// its own, and both are read by somebody who is already confused about why they are
	// looking at a login screen.
	for (const powod of ['wygasla', 'wylogowano']) {
		test(`ekran logowania z komunikatem „${powod}" jest po polsku`, async ({ page }) => {
			await page.goto(`/admin/logowanie?powod=${powod}`);
			const tekst = await tekstEkranu(page);
			expect(znajdzAngielskie(tekst), `angielskie chrome przy powodzie ${powod}`).toEqual([]);
			await sprawdzNazwyDostepne(page);
		});
	}
});
