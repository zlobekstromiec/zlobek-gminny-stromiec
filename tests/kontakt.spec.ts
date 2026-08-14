import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contact, urzad } from '../src/lib/content/site';
import { KOPIA_FALLBACK, KOPIA_KONTAKT, tekstBledu } from '../src/lib/content/forms';

/**
 * /kontakt page acceptance test: encodes CONTACT-01 (a parent finds the address,
 * telephone, e-mail and opening hours), CONTACT-02 (the static map snapshot with
 * its mandatory OpenStreetMap attribution and a safe directions link) and
 * CONTACT-03 (a parent can actually send a message from the page), plus the
 * WCAG 2.1 AA gate for the route (SITE-04).
 *
 * Contract highlights (04-UI-SPEC.md Amendment v1.4 /kontakt composition, the
 * Copywriting Contract and the Accessibility Contract; 04-04-PLAN.md):
 * - every contact fact is read from src/lib/content/site.ts here as well, so a
 *   future data sweep cannot leave the page and this test agreeing on a wrong
 *   value (the assertions below interpolate, they never retype);
 * - the map is a same-origin image, never an embedded third-party frame (D-17),
 *   and its attribution stays visible and linked (OSMF tile usage policy);
 * - the RODO consent ships unticked and the klauzula informacyjna is a native
 *   details disclosure, closed on load and operable from the keyboard (D-03);
 * - the static fallback panel and the noscript note are in the prerendered HTML
 *   before any interaction (04-RESEARCH.md Pitfall 7);
 * - a failed submit keeps every typed value and never looks like a success (D-12).
 *
 * Endpoint-level behaviour (status codes, machine codes, honeypot, header
 * injection, verb handling) is covered by tests/kontakt-api.spec.ts and is
 * deliberately NOT duplicated here. This file covers the page and the island.
 *
 * The submit-to-success case runs against the real Cloudflare runtime through
 * `npm run preview:test`, which carries Cloudflare's always-pass dummy Turnstile
 * secret plus FORM_DRY_RUN=1, paired with the always-pass dummy sitekey in
 * src/lib/content/forms.ts (04-RESEARCH.md Pitfall 5). No mail is ever sent.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved UI-SPEC
 * amendment.
 */

const IMIE = 'Jan Kowalski';
const EMAIL = 'jan.kowalski@example.com';
const WIADOMOSC = 'Dzień dobry, proszę o informację o wolnych miejscach.';

const OSM_COPYRIGHT = 'https://www.openstreetmap.org/copyright';

/** Navigate and wait until the Turnstile widget has rendered, so every later
 *  assertion (and every axe scan) sees a settled DOM instead of a page that is
 *  still inserting the challenge frame. */
async function otworzKontakt(page: Page): Promise<void> {
	await page.goto('/kontakt');
	await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toBeAttached({
		timeout: 30_000
	});
}

/** The always-pass dummy sitekey issues a token without any interaction, but not
 *  instantly. Waiting for the widget's own response field to hold a value is what
 *  makes the success path deterministic; the alternative (submitting early and
 *  hoping) would turn a real integration bug into a flaky test. */
async function poczekajNaToken(page: Page): Promise<void> {
	await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, {
		timeout: 30_000
	});
}

async function wypelnijFormularz(page: Page): Promise<void> {
	await page.getByLabel(KOPIA_KONTAKT.imieEtykieta).fill(IMIE);
	await page.getByLabel(KOPIA_KONTAKT.emailEtykieta).fill(EMAIL);
	await page.getByLabel(KOPIA_KONTAKT.wiadomoscEtykieta).fill(WIADOMOSC);
}

test.describe('Kontakt: CONTACT-01 / CONTACT-02 / CONTACT-03 acceptance', () => {
	test('strona /kontakt odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/kontakt');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Kontakt', async ({ page }) => {
		await page.goto('/kontakt');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kontakt');
	});

	test('lead strony jest zgodny z zatwierdzoną treścią', async ({ page }) => {
		await page.goto('/kontakt');
		await expect(
			page.getByText('Napisz do nas lub zadzwoń. Odpowiadamy w dni robocze.')
		).toBeVisible();
	});

	test('karty kontaktowe pokazują adres, telefon, e-mail i godziny z modułu treści (CONTACT-01)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const karty = page.locator('.contact-grid');
		await expect(karty).toHaveCount(1);

		// Adres: obie linie z site.ts, nigdy przepisane ręcznie.
		await expect(karty.getByText(contact.addressLines[0])).toBeVisible();
		await expect(karty.getByText(contact.addressLines[1])).toBeVisible();

		// Telefon i e-mail: href porównany z wartością z modułu treści.
		const telefon = karty.locator('a[href^="tel:"]');
		await expect(telefon).toHaveCount(1);
		await expect(telefon).toHaveAttribute('href', contact.phoneHref);
		await expect(telefon).toHaveText(contact.phoneDisplay);

		const mail = karty.locator('a[href^="mailto:"]');
		await expect(mail).toHaveCount(1);
		await expect(mail).toHaveAttribute('href', `mailto:${contact.email}`);
		await expect(mail).toHaveText(contact.email);

		await expect(karty.getByText(contact.hours)).toBeVisible();
	});

	test('mapa to statyczny obraz z widoczną atrybucją OpenStreetMap (CONTACT-02, D-17)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const figura = page.locator('figure');
		await expect(figura).toHaveCount(1);

		const obraz = figura.locator('img');
		await expect(obraz).toBeVisible();
		const alt = await obraz.getAttribute('alt');
		expect(alt).toBeTruthy();
		expect((alt ?? '').length).toBeGreaterThan(10);

		// Mapa NIGDY nie jest wbudowaną ramką dostawcy zewnętrznego (RODO, D-17).
		await expect(page.locator('iframe[src*="openstreetmap"]')).toHaveCount(0);

		const atrybucja = figura.locator('figcaption a');
		await expect(atrybucja).toBeVisible();
		await expect(atrybucja).toHaveAttribute('href', OSM_COPYRIGHT);
	});

	test('link z trasą otwiera się w nowej karcie z pełnym rel (CONTACT-02, T-04-20)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const trasa = page.getByRole('link', { name: /Wyznacz trasę/ });
		await expect(trasa).toBeVisible();
		await expect(trasa).toHaveAttribute('target', '_blank');
		await expect(trasa).toHaveAttribute('rel', 'noopener noreferrer');
		await expect(trasa).toHaveAttribute('href', /openstreetmap\.org\/directions/);
	});

	test('informacja o wnioskach w Urzędzie Gminy podaje pokój i godziny (D-16)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const panel = page.locator('.urzad-panel');
		await expect(panel).toHaveCount(1);
		await expect(
			panel.getByRole('heading', { name: 'Wnioski rekrutacyjne składasz w Urzędzie Gminy' })
		).toBeVisible();
		await expect(panel).toContainText(urzad.name);
		await expect(panel).toContainText(urzad.room);
		await expect(panel).toContainText(urzad.wnioskiHours);
	});

	test('zgoda RODO nie jest zaznaczona po wejściu na stronę (RECRUIT-04)', async ({ page }) => {
		await page.goto('/kontakt');
		const zgoda = page.getByRole('checkbox');
		await expect(zgoda).toHaveCount(1);
		await expect(zgoda).not.toBeChecked();
	});

	test('klauzula informacyjna jest zwinięta i obsługiwana z klawiatury (D-03)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const klauzula = page.locator('details');
		await expect(klauzula).toHaveCount(1);
		expect(await klauzula.evaluate((el: HTMLDetailsElement) => el.open)).toBe(false);

		// Tab z pola zgody musi trafić na summary, a Enter musi je rozwinąć: to
		// jest cała obsługa klawiatury, jakiej wymaga natywny element details.
		await page.locator('#kontakt-zgoda').focus();
		await page.keyboard.press('Tab');
		const summary = page.locator('details summary');
		await expect(summary).toBeFocused();
		await page.keyboard.press('Enter');
		expect(await klauzula.evaluate((el: HTMLDetailsElement) => el.open)).toBe(true);
		await expect(page.getByRole('heading', { name: 'Administrator danych' })).toBeVisible();
	});

	test('panel awaryjny z telefonem i e-mailem jest w HTML przed interakcją (Pitfall 7)', async ({
		page
	}) => {
		await page.goto('/kontakt');
		const panel = page.locator('.fallback');
		await expect(panel).toHaveCount(1);
		await expect(panel.getByText(KOPIA_FALLBACK.naglowek)).toBeVisible();
		await expect(panel.locator(`a[href="${contact.phoneHref}"]`)).toBeVisible();
		await expect(panel.locator(`a[href="mailto:${contact.email}"]`)).toBeVisible();
	});

	test('strona zawiera element noscript z numerem telefonu (Pitfall 7)', async ({ page }) => {
		await page.goto('/kontakt');
		const noscript = page.locator('noscript');
		expect(await noscript.count()).toBeGreaterThan(0);
		const tresc = await noscript.first().innerHTML();
		expect(tresc).toContain(contact.phoneDisplay);
	});

	test('pełna ścieżka wysyłki: formularz zamienia się w panel sukcesu (CONTACT-03, D-11)', async ({
		page
	}) => {
		await otworzKontakt(page);
		await wypelnijFormularz(page);
		await page.getByRole('checkbox').check();
		await poczekajNaToken(page);

		await page.getByRole('button', { name: KOPIA_KONTAKT.wyslij }).click();

		const sukces = page.getByRole('heading', { name: KOPIA_KONTAKT.sukcesNaglowek });
		await expect(sukces).toBeVisible({ timeout: 30_000 });
		await expect(sukces).toBeFocused();
		await expect(page.getByText(KOPIA_KONTAKT.sukcesTresc)).toBeVisible();
		// Formularz jest usunięty z DOM, a nie tylko ukryty (D-11).
		await expect(page.locator('form')).toHaveCount(0);
	});

	test('wysyłka bez zgody RODO zachowuje wpisane wartości i pokazuje instrukcję (D-12)', async ({
		page
	}) => {
		await otworzKontakt(page);
		await wypelnijFormularz(page);
		await poczekajNaToken(page);

		await page.getByRole('button', { name: KOPIA_KONTAKT.wyslij }).click();

		const alert = page.locator('[role="alert"]');
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Popraw zaznaczone pola');
		await expect(alert).toContainText(tekstBledu('zgoda'));

		// Formularz zostaje na miejscu, a każda wpisana wartość nadal w nim jest.
		await expect(page.locator('form')).toHaveCount(1);
		await expect(page.locator('#kontakt-imie')).toHaveValue(IMIE);
		await expect(page.locator('#kontakt-email')).toHaveValue(EMAIL);
		await expect(page.locator('#kontakt-wiadomosc')).toHaveValue(WIADOMOSC);
		await expect(page.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
		// Nic nie zostało wysłane, więc panel sukcesu nie może istnieć.
		await expect(page.getByText(KOPIA_KONTAKT.sukcesNaglowek)).toHaveCount(0);
	});

	test('brak naruszeń WCAG 2.1 AA na /kontakt (SITE-04 / A11Y baseline)', async ({ page }) => {
		await otworzKontakt(page);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('brak naruszeń WCAG 2.1 AA w stanie błędu walidacji z aria-invalid', async ({ page }) => {
		await otworzKontakt(page);
		// Puste wysłanie zaznacza wszystkie cztery kontrolki jako nieprawidłowe, więc
		// skan obejmuje wyrenderowany stan aria-invalid, a nie tylko stan spoczynku.
		await page.getByRole('button', { name: KOPIA_KONTAKT.wyslij }).click();
		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('#kontakt-imie')).toHaveAttribute('aria-invalid', 'true');

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
