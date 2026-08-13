import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Dokumenty acceptance test: encodes DOCS-01 (a visitor can browse and download
 * documents grouped by category) plus the WCAG 2.1 AA baseline (SITE-04) for the
 * /dokumenty route.
 *
 * Contract highlights (02-UI-SPEC.md /dokumenty composition, 02-02-PLAN.md):
 * - documents grouped under fixed-order category headings (Rekrutacja, Statut i
 *   uchwały, RODO); an empty category emits NOTHING (dormant-category rule, D-13);
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

	test('widoczne nagłówki kategorii Rekrutacja oraz Statut i uchwały', async ({ page }) => {
		await page.goto('/dokumenty');
		await expect(page.getByRole('heading', { name: 'Rekrutacja' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Statut i uchwały' })).toBeVisible();
	});

	test('kategoria RODO pozostaje uśpiona, gdy nie ma w niej dokumentów (D-13)', async ({
		page
	}) => {
		await page.goto('/dokumenty');
		await expect(page.getByRole('heading', { name: 'RODO' })).toHaveCount(0);
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
