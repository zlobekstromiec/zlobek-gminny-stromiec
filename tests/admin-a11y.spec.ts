import AxeBuilder from '@axe-core/playwright';
import { test, expect, ADRES_TESTOWY, ADRES_SPOZA_LISTY } from './fixtures/admin';
import { KOPIA_LOGOWANIE, KOPIA_POWLOKA, NAWIGACJA } from '../src/lib/content/panel';

/**
 * Accessibility acceptance gate for the editorial panel (ROADMAP 04.1 SC2;
 * 04.1-UI-SPEC.md Accessibility Contract). This is a public body's tool and WCAG
 * 2.1 AA is a legal requirement here, certified in a published Deklaracja
 * dostępności, so this file is a gate rather than a nicety.
 *
 * It runs against the REAL Cloudflare runtime: `playwright.config.ts` builds and
 * serves through `npm run preview:test`, so every state below is scanned as the
 * deployed Worker actually renders it.
 *
 * Five states are scanned, because a login screen that is clean on load and broken
 * the moment it has something to say is a login screen nobody with a screen reader
 * can use:
 *  1. the login, clean;
 *  2. the login with an INLINE FIELD ERROR rendered (aria-invalid live on a control);
 *  3. the login with an ALERT PANEL rendered (a role="alert" region focused on render);
 *  4. the login arrived at by the gate's session-expired redirect (the neutral band
 *     panel, which is deliberately NOT danger-coloured);
 *  5. the authenticated shell, which every later screen in this phase inherits.
 *
 * States 1 and 5 are also scanned by tests/admin-auth.spec.ts. The overlap is
 * deliberate: that file owns the gate and needs its own a11y floor, this file owns
 * the contract and enumerates every state. A scan is under a second.
 *
 * NOT COVERED HERE, and deliberately not made to look covered: the login's response
 * TIMING parity, which no browser assertion can see. It is item 1 of „Not Inferable
 * From Unit Tests" in
 * .planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-VALIDATION.md
 * and is owned by Plan 10's live UAT.
 *
 * Later plans extend this file with their own screens (lists, edit forms, the photo
 * island, the delete confirmation). The axe block is inlined per case rather than
 * extracted into a helper, matching every other spec in this repository.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

const LOGOWANIE = '/admin/logowanie';

/** Reach step 2 for an address that is definitely NOT on the allowlist, so no code
 *  was ever stored for it. Exchanging anything then reads as „Kod stracił ważność",
 *  which is the alert-panel state, and it needs no live code to reproduce. */
async function ekranZPanelemBledu(page: import('@playwright/test').Page) {
	await page.goto(LOGOWANIE);
	await page.getByLabel(KOPIA_LOGOWANIE.adresEtykieta, { exact: false }).fill(ADRES_SPOZA_LISTY);
	await page.getByRole('button', { name: KOPIA_LOGOWANIE.adresPrzycisk }).click();
	await page.getByLabel(KOPIA_LOGOWANIE.kodEtykieta, { exact: false }).fill('000000');
	await page.getByRole('button', { name: KOPIA_LOGOWANIE.kodPrzycisk }).click();
	await expect(page.getByText(KOPIA_LOGOWANIE.kodWygaslNaglowek)).toBeVisible();
}

test.describe('Dostepnosc panelu: SC2 / WCAG 2.1 AA', () => {
	test('ekran logowania w stanie czystym nie narusza WCAG 2.1 AA', async ({ page }) => {
		await page.goto(LOGOWANIE);
		await expect(page.locator('h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('ekran logowania z bledem przy polu nie narusza WCAG 2.1 AA', async ({ page }) => {
		await page.goto(LOGOWANIE);
		// The form carries `novalidate`, so an empty submit reaches the server and comes
		// back with the authored Polish message instead of a browser-locale bubble. That
		// is the whole point of the attribute, and this case is what proves it.
		await page.getByRole('button', { name: KOPIA_LOGOWANIE.adresPrzycisk }).click();
		await expect(page.getByText(KOPIA_LOGOWANIE.bladAdresBrak)).toBeVisible();
		await expect(page.getByLabel(KOPIA_LOGOWANIE.adresEtykieta, { exact: false })).toHaveAttribute(
			'aria-invalid',
			'true'
		);
		await expect(page.locator('h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('ekran logowania z panelem alertu nie narusza WCAG 2.1 AA', async ({ page }) => {
		await ekranZPanelemBledu(page);
		// One live alert region and no more (Accessibility Contract): competing live
		// regions announce over each other and the editor hears neither.
		await expect(page.locator('[role="alert"]')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('ekran logowania po wygasnieciu sesji nie narusza WCAG 2.1 AA', async ({ page }) => {
		await page.goto(`${LOGOWANIE}?powod=wygasla`);
		await expect(page.getByText(KOPIA_LOGOWANIE.sesjaWygasla)).toBeVisible();
		// An expired session is an EXPECTED event, so it is the neutral band panel and
		// carries no alert role. Colouring or announcing it as a failure would teach
		// editors to distrust a normal event.
		await expect(page.locator('[role="alert"]')).toHaveCount(0);
		await expect(page.locator('h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('powloka zalogowanego panelu nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt).not.toContain('@');
		await page.goto('/admin');
		await expect(page.locator('h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});

test.describe('Punkty orientacyjne i klawiatura', () => {
	/** The skip link must be the first focusable element on EVERY panel screen (WCAG
	 *  2.4.1). Asserted on both shells, because they are two different branches of
	 *  src/routes/admin/+layout.svelte and only one of them has a header bar. */
	for (const [nazwa, sciezka] of [
		['ekranie logowania', LOGOWANIE],
		['pulpicie', '/admin']
	] as const) {
		test(`link pomijajacy jest pierwszym elementem fokusowalnym na ${nazwa}`, async ({
			page,
			zalogowany
		}) => {
			expect(zalogowany.adres).toContain('@');
			await page.goto(sciezka);
			await page.keyboard.press('Tab');
			const tekst = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
			expect(tekst).toBe(KOPIA_POWLOKA.skipLink);
		});
	}

	test('nawigacja panelu ma polska nazwe dostepna i wszystkie sekcje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin');
		// The accessible name is a literal in PanelNawigacja.svelte on purpose: it is an
		// acceptance gate of 04.1-03-PLAN.md and a grep has to be able to find it.
		const nawigacja = page.getByRole('navigation', { name: 'Sekcje panelu' });
		await expect(nawigacja).toBeVisible();
		await expect(nawigacja.getByRole('link')).toHaveCount(NAWIGACJA.length);
		for (const etykieta of NAWIGACJA) {
			await expect(nawigacja.getByRole('link', { name: etykieta, exact: true })).toBeVisible();
		}
		// Colour is never the only signal: the current section carries aria-current.
		await expect(nawigacja.locator('[aria-current="page"]')).toHaveCount(1);
	});

	test('ekran logowania nie renderuje nawigacji ani paska panelu (Contract 2)', async ({
		page
	}) => {
		await page.goto(LOGOWANIE);
		await expect(page.getByRole('navigation', { name: 'Sekcje panelu' })).toHaveCount(0);
		await expect(page.getByRole('button', { name: KOPIA_POWLOKA.wyloguj })).toHaveCount(0);
		await expect(page.locator('main#main')).toHaveCount(1);
	});

	test('kolejnosc tabulacji w pasku panelu jest zgodna z Contract 1', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin');

		const oczekiwane = [
			KOPIA_POWLOKA.skipLink,
			KOPIA_POWLOKA.wordmark,
			// The visually hidden new-tab suffix is part of the link's text content and
			// is asserted with it, because dropping it is a silent 2.4.4 regression.
			`${KOPIA_POWLOKA.otworzStrone}${KOPIA_POWLOKA.nowaKarta}`,
			KOPIA_POWLOKA.wyloguj
		];

		for (const spodziewany of oczekiwane) {
			await page.keyboard.press('Tab');
			const tekst = await page.evaluate(
				() => document.activeElement?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
			);
			expect(tekst).toBe(spodziewany.replace(/\s+/g, ' ').trim());
		}
	});
});

test.describe('Powloka panelu: tresc i porzadek naglowkow', () => {
	test('pasek panelu niesie uchwyt redaktora, nigdy pelnego adresu (D-04)', async ({
		page,
		zalogowany
	}) => {
		await page.goto('/admin');
		await expect(page.getByText(`Zalogowano jako: ${zalogowany.uchwyt}`)).toBeVisible();
		await expect(page.getByText(ADRES_TESTOWY)).toHaveCount(0);
	});

	test('powloka niesie obietnice opoznienia publikacji na kazdym ekranie (D-18)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin');
		await expect(page.getByText(KOPIA_POWLOKA.opoznieniePublikacji)).toBeVisible();
		await expect(page.getByRole('link', { name: KOPIA_POWLOKA.stopkaLink })).toBeVisible();
	});
});
