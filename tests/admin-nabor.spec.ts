import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_LISTY,
	KOPIA_NABOR,
	KOPIA_POWLOKA,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS
} from '../src/lib/content/panel';
import { recruitmentHeadings } from '../src/lib/content/site';

/**
 * Browser acceptance gate for the recruitment switch (CMS-02, D-16; 04.1-UI-SPEC
 * Component Contracts 5, 9, 10 and 13). This is the first screen in the project that
 * changes the live public website from a browser, so what it proves is not „the
 * component renders" but „the chain from a radio button to a commit holds, and refuses
 * correctly when it should".
 *
 * It runs against the REAL Cloudflare runtime: `playwright.config.ts` builds and serves
 * through `npm run preview:test`, whose bindings include PANEL_DRY_RUN=1. That flag is a
 * seam at the very last step: validation, serialization, the commit-message construction
 * and the whole action branch all execute exactly as in production, and only the GitHub
 * write is short-circuited. It is bound ONLY by that harness and must never become a
 * Cloudflare Pages variable, where it would turn every save into a silent no-op that
 * still reported success to an editor.
 *
 * WHAT THIS FILE CANNOT PROVE, and does not pretend to: that a save becomes a real
 * commit and a real Cloudflare build. Under the dry-run flag no commit exists to inspect.
 * That is a live, manual, one-time verification, recorded in the plan's SUMMARY and in
 * 04.1-VALIDATION.md; a spec that mocked it would be a spec asserting its own mock.
 *
 * Do NOT weaken these assertions to make the suite pass. Two of them defend properties
 * whose failure is irreversible on a public body's website: the empty-submission case is
 * the browser half of threat T-04.1-22 (an arbitrary value written into nabor.json), and
 * the single-submit-button case is D-11, where a second button means a second commit and
 * a second deploy of the żłobek's site.
 */

const NABOR = '/admin/nabor';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** The editing form, scoped so the shell's „Wyloguj" form in the header is never counted
 *  as part of this screen's actions. */
function formularz(page: import('@playwright/test').Page) {
	return page.locator('main form').filter({ has: page.locator('input[type="radio"]') });
}

test.describe('Ekran naboru: CMS-02, D-16', () => {
	test('ekran odpowiada 200 i ma jeden naglowek oraz jedna grupe pol z widoczna legenda', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(NABOR);
		expect(odpowiedz?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(KOPIA_NABOR.naglowek);

		const grupa = page.locator('main fieldset');
		await expect(grupa).toHaveCount(1);
		// Visible, not merely present: a legend hidden for looks is a group with no name
		// for everybody who can see the screen.
		await expect(grupa.locator('legend')).toBeVisible();
		await expect(grupa.locator('legend')).toHaveText(KOPIA_NABOR.legenda);

		// The back link of Contract 5, DOM position 1.
		await expect(page.getByRole('link', { name: KOPIA_LISTY.powrotPulpit })).toBeVisible();
	});

	test('oba stany sa osiagalne i obslugiwane z klawiatury', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		const radia = formularz(page).locator('input[type="radio"]');
		await expect(radia).toHaveCount(2);

		// Focus the group from the keyboard alone, then walk it with the arrow keys, which
		// is the native radio-group behaviour a styled slider would have had to
		// reimplement and would have reimplemented wrongly.
		await radia.first().focus();
		await expect(radia.first()).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(radia.nth(1)).toBeFocused();
		await expect(radia.nth(1)).toBeChecked();
		await page.keyboard.press('ArrowUp');
		await expect(radia.first()).toBeFocused();
		await expect(radia.first()).toBeChecked();
	});

	test('podglad pokazuje publiczny naglowek wybranego stanu, czytany z modulu strony', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		const podglad = page.getByText(KOPIA_NABOR.podgladNaglowek).locator('..');

		// „Otwarty" and „zamknięty" are asserted against the SAME module /rekrutacja
		// renders from, never against a string retyped here. A paraphrase in either place
		// would let the panel promise an outcome the public page does not produce.
		await page.getByLabel(KOPIA_NABOR.otwartyEtykieta).check();
		await expect(podglad).toContainText(recruitmentHeadings.otwarty);

		await page.getByLabel(KOPIA_NABOR.zamknietyEtykieta).check();
		await expect(podglad).toContainText(recruitmentHeadings.zamkniety);

		// The two headlines must actually differ, or the case above would pass against a
		// preview that never changed at all.
		expect(recruitmentHeadings.otwarty).not.toBe(recruitmentHeadings.zamkniety);
	});

	test('wyslanie bez wybranego stanu pokazuje podsumowanie bledow i niczego nie zapisuje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);

		// Uncheck both controls so the submission genuinely omits the field, which is the
		// request an untouched form or a hand-built POST would send. The server must refuse
		// it rather than defaulting: a default would silently close the nabór, and a parent
		// would read that on the front page within two minutes.
		await page.evaluate(() => {
			document
				.querySelectorAll<HTMLInputElement>('main form input[type="radio"]')
				.forEach((radio) => (radio.checked = false));
		});

		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieTresc);
		await expect(panel).toContainText(KOPIA_WALIDACJA.stanNaboruBrak);
		// Focused, so a screen-reader user is taken to the refusal instead of being left at
		// the top of an apparently unchanged page.
		await expect(panel).toBeFocused();

		// Nothing was saved: no success panel, and no saved marker in the URL.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		expect(page.url()).not.toContain('zapisano');
	});

	test('poprawny zapis pokazuje panel Zapisano z obietnica dwoch minut i odnosnikiem do strony', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		await page.getByLabel(KOPIA_NABOR.otwartyEtykieta).check();
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
		// The honest D-18 promise: saved, and visible on the site in about two minutes.
		// No build polling, no progress bar, no auto-refresh.
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel).toBeFocused();

		const odnosnik = panel.getByRole('link');
		await expect(odnosnik).toHaveAttribute('href', '/rekrutacja');
		await expect(odnosnik).toHaveAttribute('target', '_blank');
		await expect(odnosnik).toHaveAttribute('rel', /noopener/);
		// The new-tab treatment is announced, not merely visual.
		await expect(odnosnik).toContainText(KOPIA_POWLOKA.nowaKarta.trim());
	});

	test('odswiezenie po zapisie nie zapisuje ponownie (POST, przekierowanie, GET)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		await page.getByLabel(KOPIA_NABOR.otwartyEtykieta).check();
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		// The browser is sitting on a GET, so a reload re-runs a read. If the action had
		// returned the panel directly instead of redirecting, this reload would resubmit the
		// POST, and on this screen that means a second commit and a second Cloudflare build.
		const odpowiedz = await page.reload();
		expect(odpowiedz?.request().method()).toBe('GET');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
	});

	test('na ekranie jest dokladnie jeden przycisk zapisu (D-11)', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		// Scoped to <main>, because the shell's „Wyloguj" is legitimately a submit button of
		// its own form in the header and is not an action of this screen.
		await expect(page.locator('main button[type="submit"]')).toHaveCount(1);
		await expect(formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz })).toHaveCount(1);
	});

	test('ekran w stanie czystym nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		await expect(page.locator('main fieldset')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran z podsumowaniem bledow nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		await page.evaluate(() => {
			document
				.querySelectorAll<HTMLInputElement>('main form input[type="radio"]')
				.forEach((radio) => (radio.checked = false));
		});
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran z panelem Zapisano nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NABOR);
		await page.getByLabel(KOPIA_NABOR.otwartyEtykieta).check();
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});

test.describe('Ekran naboru bez JavaScriptu (D-17)', () => {
	test('caly zapis dziala przy wylaczonym JavaScripcie', async ({ browser }) => {
		// A fresh context with scripting off, so this is the real no-JS path and not a page
		// that merely avoided calling anything. The session cookie is seeded exactly as
		// tests/fixtures/admin.ts does it, including the `__Host-` prefix constraints that
		// file records: explicit domain and path, secure true, and no `url` at all.
		const kontekst = await browser.newContext({ javaScriptEnabled: false });
		try {
			await kontekst.addCookies([
				{
					name: NAZWA_CIASTKA,
					value: await tokenSesji(),
					domain: 'localhost',
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'Lax'
				}
			]);
			const page = await kontekst.newPage();

			const odpowiedz = await page.goto(NABOR);
			expect(odpowiedz?.status()).toBe(200);

			// The server-rendered form is complete on its own: a checked radio reflecting the
			// committed value, and a working submit button.
			const radia = page.locator('main form input[type="radio"]');
			await expect(radia).toHaveCount(2);
			// Exactly one is checked on arrival, which is what tells the editor what the
			// nabór currently IS before they change anything.
			expect(await radia.nth(0).isChecked()).not.toBe(await radia.nth(1).isChecked());

			await page.getByLabel(KOPIA_NABOR.otwartyEtykieta).check();
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

			// Same panel, same copy, reached by the browser's own navigation with no client
			// code involved at any point.
			const panel = page.locator('[data-panel="sukces"]');
			await expect(panel).toBeVisible();
			await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
			await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
			expect(page.url()).toContain('zapisano');
		} finally {
			await kontekst.close();
		}
	});
});
