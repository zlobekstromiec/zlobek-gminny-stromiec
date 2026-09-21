import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
	ARCHITEKTONICZNA,
	KOMUNIKACYJNO_INFORMACYJNA,
	KOORDYNATOR,
	NAGLOWKI
} from '../src/lib/content/dostepnosc';

/**
 * Pierwszy test trasy /deklaracja-dostepnosci (quick 260921-j9c).
 *
 * CZEGO TEN PLIK NIE PILNUJE. Nie pilnuje ustawowej deklaracji dostępności. Trasa jest
 * nadal stubem: pełna deklaracja zgodna z Warunkami technicznymi publikacji v2.0, z jej
 * ośmioma ustawowymi nagłówkami, czternastoma identyfikatorami i procedurą odwoławczą,
 * powstaje w Fazie 6 (plany 06-09 i 06-10) i przyniesie ze sobą własną wersję tego pliku.
 *
 * CZEGO PILNUJE. Tego, że fakty, które dyrektor podała 2026-09-21, naprawdę są na stronie
 * i że są tam w jednym egzemplarzu: liczba pozycji obu list jest porównywana z długością
 * tablic z modułu, a nie przepisana, więc fakt dopisany do modułu i nierenderowany zapala
 * ten test, a fakt przepisany do znacznika nie zwiększa niczyjej liczby i też go zapala.
 *
 * Nie osłabiaj tych asercji, żeby suite przechodził: to jest jedyne miejsce, w którym
 * zapisano, że strona niesie te fakty, dopóki Faza 6 nie zbuduje deklaracji.
 */

test.describe('Deklaracja dostępności: fakty przekazane 2026-09-21', () => {
	test('strona /deklaracja-dostepnosci odpowiada statusem 200', async ({ page }) => {
		const odpowiedz = await page.goto('/deklaracja-dostepnosci');
		expect(odpowiedz?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Deklaracja dostępności', async ({ page }) => {
		await page.goto('/deklaracja-dostepnosci');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deklaracja dostępności');
	});

	test('trzy nagłówki h2 w kolejności z modułu treści', async ({ page }) => {
		await page.goto('/deklaracja-dostepnosci');
		const h2 = page.locator('.declaration h2');
		await expect(h2).toHaveCount(3);
		await expect(h2).toHaveText([
			NAGLOWKI.koordynator,
			NAGLOWKI.architektoniczna,
			NAGLOWKI.komunikacyjna
		]);
	});

	test('koordynatorka jest nazwana, a jej numer jest jednym odnośnikiem tel:', async ({ page }) => {
		await page.goto('/deklaracja-dostepnosci');
		await expect(page.getByText(KOORDYNATOR.imie, { exact: false })).toBeVisible();

		/* SELEKTOR JEST ZAWEZONY DO `.declaration` I TO JEST CALA TRESC TEJ ASERCJI. Ta
		   strona niesie DWA rozne numery dwoch roznych osob: pasek gorny renderuje numer
		   zlobka na kazdej trasie, a ta sekcja numer koordynatorki. Asercja liczaca
		   odnosniki tel: w calym dokumencie zliczylaby oba i przestalaby cokolwiek mowic o
		   tym, ktory numer stoi w sekcji o dostepnosci. Zawezona mowi dokladnie to: w tej
		   sekcji jest jeden numer i jest to numer koordynatorki z modulu tresci. */
		const telefony = page.locator('.declaration a[href^="tel:"]');
		await expect(telefony).toHaveCount(1);
		await expect(telefony).toHaveAttribute('href', KOORDYNATOR.telefonHref);
		await expect(telefony).toHaveText(KOORDYNATOR.telefonTekst);
	});

	test('obie listy faktów renderują dokładnie tyle pozycji, ile eksportuje moduł', async ({
		page
	}) => {
		await page.goto('/deklaracja-dostepnosci');

		const architektoniczna = page.locator('.lista-architektoniczna li');
		await expect(architektoniczna).toHaveCount(ARCHITEKTONICZNA.length);
		await expect(architektoniczna).toHaveText([...ARCHITEKTONICZNA]);

		const komunikacyjna = page.locator('.lista-komunikacyjna li');
		await expect(komunikacyjna).toHaveCount(KOMUNIKACYJNO_INFORMACYJNA.length);
		await expect(komunikacyjna).toHaveText([...KOMUNIKACYJNO_INFORMACYJNA]);
	});

	test('strona pozostaje wyłączona z indeksowania', async ({ page }) => {
		await page.goto('/deklaracja-dostepnosci');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('brak naruszeń WCAG 2.1 AA (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/deklaracja-dostepnosci');
		const wynik = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(wynik.violations).toEqual([]);
	});
});
