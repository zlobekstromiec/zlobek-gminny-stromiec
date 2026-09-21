import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contact } from '../src/lib/content/site.ts';
import { CC } from '../src/lib/server/forms/mailer.ts';
import {
	POLITYKA_ADMINISTRATOR_NAGLOWEK,
	POLITYKA_FORMULARZE_NAGLOWEK,
	POLITYKA_TYTUL
} from '../src/lib/content/polityka.ts';

/**
 * Polityka prywatności acceptance (quick task 260827-bfa, D-3).
 *
 * THE STUB CEASED TO EXIST ON 2026-08-27. This file used to describe a „wkrótce"
 * placeholder whose whole contract was „resolves, is noindex, is axe-clean". The
 * żłobek supplied the administrator's klauzula and the IOD address, so the route is
 * now a real legal page and the contract is the page's structure, not its existence.
 *
 * The page carries TWO DISJOINT scopes, and that separation is the point: the
 * administrator's klauzula retains data „przez okres wynikający z przepisów o
 * archiwizacji", the form klauzula only „tak długo, jak potrzebne do odpowiedzi".
 * Those are not contradictions, they are two different data sets, so the headings
 * have to tell a reader which one they are reading.
 */

test.describe('Polityka prywatności: strona prawna o dwóch zakresach', () => {
	test('route resolves with a 200 and a single Polish h1', async ({ page }) => {
		const response = await page.goto('/polityka-prywatnosci');
		expect(response?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { name: POLITYKA_TYTUL, level: 1 })).toBeVisible();
	});

	test('strona zostaje noindex (cała witryna jest noindex do Fazy 6/7)', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('no WCAG 2.1 AA violations', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	// The order matters as much as the presence: the żłobek scope is the one a parent
	// arrives asking about, and the form scope is a narrower afterthought about what
	// they just typed. Reversing them would bury the bigger answer.
	test('obie sekcje są widoczne, żłobkowa przed formularzową (D-3)', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		const naglowki = page.locator('main h2, h2');
		const teksty = await page.locator('h2').allInnerTexts();
		expect(teksty).toContain(POLITYKA_ADMINISTRATOR_NAGLOWEK);
		expect(teksty).toContain(POLITYKA_FORMULARZE_NAGLOWEK);
		expect(teksty.indexOf(POLITYKA_ADMINISTRATOR_NAGLOWEK)).toBeLessThan(
			teksty.indexOf(POLITYKA_FORMULARZE_NAGLOWEK)
		);
		await expect(naglowki.first()).toBeVisible();
	});

	// WCAG 1.3.1 / 2.4.6. axe does not fail a skipped heading level on its own, so the
	// hierarchy is asserted here explicitly: a legal page of a public body is exactly
	// the page a screen-reader user navigates by headings.
	test('hierarchia nagłówków nie ma przeskoków i nie schodzi poniżej h3', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		const poziomy = await page
			.locator('h1, h2, h3, h4, h5, h6')
			.evaluateAll((el) => el.map((e) => Number(e.tagName.slice(1))));
		expect(poziomy.length).toBeGreaterThan(3);
		expect(poziomy[0]).toBe(1);
		expect(Math.max(...poziomy)).toBeLessThanOrEqual(3);
		for (let i = 1; i < poziomy.length; i += 1) {
			expect(poziomy[i] - poziomy[i - 1]).toBeLessThanOrEqual(1);
		}
	});

	/* Do 2026-09-21 ta asercja pilnowala pierwszego zdania tekstu, ktory placowka napisala
	   sama 2026-08-27, gdy nie miala zadnej klauzuli. Tego dnia inspektor ochrony danych
	   dostarczyl klauzule 06, napisana dla dokladnie tej publicznosci, i to ona stoi teraz
	   na stronie. Asercja pilnuje tego samego, co wtedy, czyli ze strona otwiera sie
	   tekstem, ktory dostalismy, a nie streszczeniem: podstawa prawna, a zaraz po niej
	   naglowek „Administrator" z brzmieniem z dokumentow. */
	test('klauzula administratora otwiera się tekstem inspektora, a nie streszczeniem', async ({
		page
	}) => {
		await page.goto('/polityka-prywatnosci');
		const sekcja = page.locator('section[aria-labelledby="zakres-zlobek"]');
		await expect(
			sekcja.getByText('na podstawie art. 13 rozporządzenia Parlamentu Europejskiego', {
				exact: false
			})
		).toBeVisible();
		await expect(sekcja.getByRole('heading', { name: 'Administrator', level: 3 })).toBeVisible();
	});

	// One source, not a copy: the page renders the SAME KLAUZULA export that
	// ConsentBlock shows under both forms. If somebody ever pastes a second copy here,
	// the two will drift and only one of them will be maintained.
	test('strona niesie klauzulę formularzy z jej blokiem o odbiorcach (D-2, D-3)', async ({
		page
	}) => {
		await page.goto('/polityka-prywatnosci');
		// SELEKTOR JEST ZAWEZONY DO SEKCJI FORMULARZY od 2026-09-21. Naglowek „Odbiorcy
		// danych" istnieje teraz DWA RAZY, bo klauzula 06 niesie blok o tej samej nazwie, i
		// to jest wlasciwe: obie klauzule opisuja swoich wlasnych odbiorcow. Asercja bez
		// zawezenia lapala oba i konczyla sie naruszeniem trybu scislego.
		const sekcja = page.locator('section[aria-labelledby="zakres-formularze"]');
		await expect(sekcja.getByRole('heading', { name: 'Odbiorcy danych', level: 3 })).toBeVisible();
		await expect(
			sekcja.getByText('Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje', {
				exact: false
			})
		).toBeVisible();
	});

	/* Art. 11 ustawy z 10 maja 2018 r. wymaga OD PODMIOTU PUBLICZNEGO imienia, nazwiska i
	   kontaktu inspektora, wiec sam adres obowiazku nie wypelnia. Nazwisko przyszlo
	   2026-09-21 w dokumentach samego inspektora i zamknelo bramke uruchomieniowa otwarta
	   pismem z 2026-09-01. Asercja czyta je z site.ts, bo to jedyne zrodlo obu wartosci. */
	test('inspektor ochrony danych jest nazwany z imienia i nazwiska (art. 11)', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		await expect(page.getByText(contact.iodName, { exact: false }).first()).toBeVisible();
	});

	/* Administrator brzmi tak samo tu i pod formularzami. Do 2026-09-21 ta strona mowila
	   „podmiot prowadzacy Publiczny Zlobek w Stromcu", a klauzula formularzowa nazywala
	   sam zlobek; rozbieznosc byla swiadoma i udokumentowana, bo nie bylo zrodla, ktore by
	   ja rozstrzygnelo. Osiem dokumentow inspektora podaje jedno brzmienie i to ono stoi
	   teraz po obu stronach. */
	test('administrator brzmi na stronie dokładnie tak, jak w dokumentach inspektora', async ({
		page
	}) => {
		await page.goto('/polityka-prywatnosci');
		const brzmienie = `${contact.name}, ${contact.addressLines.join(', ')}`;
		const tekst = (await page.locator('.policy').innerText()).replace(/\s+/gu, ' ');
		expect(tekst).toContain(brzmienie);
		expect(tekst).not.toContain('podmiot prowadzący');
	});

	/* Klauzule szczegolowe, w tym monitoringu wizyjnego, leza na /dokumenty i strona ma
	   tam kierowac, a nie powtarzac ich tresci. Odnosnik, nie samo zdanie: czytelnik ma
	   dojsc do nich jednym klknieciem. */
	test('strona kieruje po klauzule szczegółowe do sekcji RODO na /dokumenty', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		const link = page.locator('.policy a[href="/dokumenty"]');
		await expect(link).toHaveCount(1);
		await expect(link).toBeVisible();
	});

	// Both halves in ONE case on purpose. A negative assertion alone can pass because
	// the page failed to render at all; pairing it with the positive one means the
	// sweep only counts when there is something to sweep.
	test('adres IOD jest opublikowany, a adres kopii dla urzędniczki nie (T-bfa-01)', async ({
		page
	}) => {
		await page.goto('/polityka-prywatnosci');
		await expect(page.getByText(contact.iodEmail, { exact: false }).first()).toBeVisible();
		const html = await page.content();
		expect(html).toContain(contact.iodEmail);
		expect(html).not.toContain(CC);
	});
});
