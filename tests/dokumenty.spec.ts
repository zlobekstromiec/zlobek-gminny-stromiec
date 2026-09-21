import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { KATEGORIE } from '../src/lib/kategorie-dokumentow';
import { NAGLOWEK } from '../src/lib/server/dokumenty';
import { RODO_ADRESACI, RODO_POBRANIE, RODO_WSTEP } from '../src/lib/content/rodo';
import { contact } from '../src/lib/content/site';

/**
 * Dokumenty acceptance test: encodes DOCS-01 (a visitor can browse and download
 * documents grouped by category) plus the WCAG 2.1 AA baseline (SITE-04) for the
 * /dokumenty route.
 *
 * Contract highlights (02-UI-SPEC.md /dokumenty composition, 02-02-PLAN.md):
 * - documents grouped under fixed-order category headings (Rekrutacja, Statut i
 *   uchwały, Organizacja żłobka, RODO); an empty category emits NOTHING
 *   (dormant-category rule, D-13). The RODO group woke on 2026-09-21, when the IOD's
 *   klauzule arrived, and „Organizacja żłobka" was added with them;
 * - each row is a single link whose meta (typ, rozmiar, wersja) sits INSIDE the
 *   link so a screen reader announces it with the name (D-14, WCAG);
 * - every document link resolves to a real file under /dokumenty/ (no 404, D-16).
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved UI-SPEC
 * amendment.
 */

test.describe('Dokumenty: DOCS-01 acceptance', () => {
	test('strona /dokumenty odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/dokumenty');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Dokumenty', async ({ page }) => {
		await page.goto('/dokumenty');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dokumenty');
	});

	/* Cztery naglowki, W USTALONEJ KOLEJNOSCI, a kolejnosc bierze sie z KATEGORIE w
	   src/lib/kategorie-dokumentow.ts. Test czyta ja z modulu razem z etykietami z
	   NAGLOWEK, wiec kategoria dopisana w przyszlosci dolacza tu sama, a przestawiona
	   zapala ten test zamiast przejsc niezauwazona. */
	test('nagłówki kategorii są widoczne dokładnie w kolejności z modułu', async ({ page }) => {
		await page.goto('/dokumenty');
		const oczekiwane = KATEGORIE.map((k) => NAGLOWEK[k]);
		const naglowki = page.locator('section.band h2');
		await expect(naglowki).toHaveCount(oczekiwane.length);
		await expect(naglowki).toHaveText(oczekiwane);
	});

	/* Kategoria RODO byla uspiona od D-13 az do 2026-09-21: regula mowi, ze grupa
	   pojawia sie dopiero wtedy, gdy cos w niej jest, a do tego dnia nie bylo. Tego dnia
	   przyszlo osiem dokumentow od inspektora ochrony danych i grupa sie obudzila.
	   Asercja odwrocila sie razem z nia. */
	test('kategoria RODO jest widoczna, odkąd ma dokumenty (D-13)', async ({ page }) => {
		await page.goto('/dokumenty');
		await expect(page.getByRole('heading', { name: 'RODO', exact: true })).toBeVisible();
		const lista = page.locator('section[aria-labelledby="rodo-heading"] ul.docs a.doc-row');
		expect(await lista.count()).toBeGreaterThan(0);
	});

	/* Dokument 08 od inspektora NIE jest plikiem do pobrania: jego tekst jest wstepem
	   pasma RODO. Asercje biora zdania z modulu tresci, nigdy z przepisanego literalu. */
	test('pasmo RODO otwiera się tekstem dokumentu 08 i zapowiada listę', async ({ page }) => {
		await page.goto('/dokumenty');
		const pasmo = page.locator('section[aria-labelledby="rodo-heading"]');
		for (const akapit of RODO_WSTEP) await expect(pasmo).toContainText(akapit);
		for (const punkt of RODO_ADRESACI) await expect(pasmo).toContainText(punkt);
		await expect(pasmo).toContainText(RODO_POBRANIE);
	});

	/* Adresy w pasmie RODO maja jedno zrodlo, tak jak wszedzie indziej na tej stronie.
	   Modul prozy nie niesie zadnego literalu, wiec asercja porownuje sie z site.ts. */
	test('pasmo RODO podaje adres inspektora i adres administratora z site.ts', async ({ page }) => {
		await page.goto('/dokumenty');
		const pasmo = page.locator('section[aria-labelledby="rodo-heading"]');
		await expect(pasmo).toContainText(contact.iodEmail);
		await expect(pasmo.locator('.adres-email')).toHaveCount(1);
		await expect(pasmo.locator('.adres-email')).toHaveText(contact.email);
	});

	/* Zadne z pozostalych pasm nie dostaje wstepu: to jest cecha wylacznie pasma RODO. */
	test('tylko pasmo RODO ma wstęp nad listą dokumentów', async ({ page }) => {
		await page.goto('/dokumenty');
		await expect(page.locator('section.band .wstep-rodo')).toHaveCount(1);
		await expect(page.locator('section[aria-labelledby="rodo-heading"] .wstep-rodo')).toHaveCount(
			1
		);
	});

	test('wiersz dokumentu to jeden link, a meta znajduje się wewnątrz linku (D-14, WCAG)', async ({
		page
	}) => {
		await page.goto('/dokumenty');
		// Accessible name obejmuje zarówno czytelną polską nazwę, jak i meta
		// (typ, rozmiar, wersja) w tym samym linku.
		const wniosek = page.getByRole('link', {
			name: /Wniosek o przyjęcie dziecka[\s\S]*wersja z/
		});
		await expect(wniosek).toBeVisible();
	});

	test('każdy link dokumentu wskazuje realny plik pod /dokumenty/ i zwraca 200 (D-16)', async ({
		page
	}) => {
		await page.goto('/dokumenty');
		const docLinks = page.locator('a.doc-row');
		const count = await docLinks.count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			const href = await docLinks.nth(i).getAttribute('href');
			expect(href).toMatch(/^\/dokumenty\//);
			const res = await page.request.get(href!);
			expect(res.status()).toBe(200);
		}
	});

	test('brak naruszeń WCAG 2.1 AA (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/dokumenty');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
