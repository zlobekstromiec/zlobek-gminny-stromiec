import { test, expect } from '@playwright/test';

/**
 * Responsive acceptance (SITE-02): the homepage is mobile-first and adapts across
 * a phone/tablet/desktop viewport matrix without horizontal overflow, and the
 * navigation swaps between the hamburger drawer (phone and tablet) and the inline
 * links (desktop). Authoritative breakpoint: 01-UI-SPEC Amendment v1.7 §1, which
 * moves the nav flip from 768px to 1024px so a sixth chip fits without touching
 * the locked 44px-target chip geometry.
 */

const VIEWPORTS = {
	phone: { width: 375, height: 667 },
	tablet: { width: 768, height: 1024 },
	// The tier the v1.7 nav flip lands on. Named separately from `desktop` so the
	// pre-existing 1280px assertions keep measuring what they always measured.
	desktopSm: { width: 1024, height: 768 },
	desktop: { width: 1280, height: 800 },
	desktopXl: { width: 1920, height: 1080 }
} as const;

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
	test(`no horizontal overflow at ${name} (${viewport.width}px)`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await page.goto('/');
		// The document must not scroll horizontally (allow a 1px rounding tolerance).
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBeLessThanOrEqual(1);
	});
}

/* Amendment v1.6 §12: every public route stays overflow-free at both desktop
 * tiers, now that the recomposed sections fill the 72rem container. Amendment
 * v1.7 §1 adds the 768px and 1024px widths, the two tiers the nav flip moves
 * between: the breakpoint move is invisible to a 375px or 1280px assertion in
 * either direction. */
const ROUTES = [
	'/',
	'/o-nas',
	'/rekrutacja',
	'/cennik',
	'/kontakt',
	'/dokumenty',
	'/aktualnosci'
] as const;

for (const route of ROUTES) {
	for (const viewport of [
		VIEWPORTS.tablet,
		VIEWPORTS.desktopSm,
		VIEWPORTS.desktop,
		VIEWPORTS.desktopXl
	]) {
		test(`no horizontal overflow on ${route} at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.goto(route);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow).toBeLessThanOrEqual(1);
		});
	}
}

/* Two composition guards for the v1.6 desktop grids: the /rekrutacja form rail
 * sits to the RIGHT of the info column, and the DayPlan panel sits to the RIGHT
 * of its heading. Positions only, no colors and no ordering beyond this. */
test('rekrutacja: kolumna formularza stoi na prawo od kolumny informacji (v1.6 §7)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/rekrutacja');
	const info = await page.locator('.kolumna-info').boundingBox();
	const formularz = await page.locator('.blok-formularz').boundingBox();
	expect(info).not.toBeNull();
	expect(formularz).not.toBeNull();
	expect(formularz!.x).toBeGreaterThan(info!.x + info!.width - 1);
});

// ZASTEPUJE asercje poprawki v1.6 §4 („panel stoi na prawo od naglowka"), ktora od
// 2026-08-18 jest falszywa Z ZALOZENIA. Tamten uklad byl skrojony pod siedem wierszy
// zastepczych; prawdziwy harmonogram ma czternascie i zostawial 979 px martwej
// przestrzeni po lewej przy kazdej szerokosci desktopowej.
//
// Asercja nie zostala ZLUZOWANA, tylko zamieniona na kontrakt nowego ukladu. Luzniejsza
// wersja („panel gdziekolwiek jest") przechodzilaby takze na starym ukladzie, a wtedy
// brama przestaje cokolwiek chronic. Kazdy z czterech warunkow ponizej jest falszywy na
// ukladzie sprzed tej zmiany:
//  1. panel stal OBOK naglowka, nie pod nim;
//  2. panel byl ograniczony do 44rem, wiec nie mial szerokosci wiersza naglowkowego;
//  3. harmonogram mial jedna kolumne, nie dwie;
//  4. akapit wprowadzajacy stal POD naglowkiem w lewej szynie, nie obok niego.
test('strona główna: plan dnia to pełna szerokość i dwie kolumny (2026-08-18)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/');

	const opis = await page.locator('.dayplan .opis').boundingBox();
	const panel = await page.locator('.dayplan .panel').boundingBox();
	expect(opis).not.toBeNull();
	expect(panel).not.toBeNull();

	// 1 + 2. Panel i wiersz naglowkowy sa rodzenstwem w jednokolumnowej siatce, wiec maja
	// tę samą krawędź i tę samą szerokość, a panel stoi PONIŻEJ. Porownanie z `.opis`, a
	// nie z liczba pikseli, zeby zmiana paddingu kontenera nie psula tej asercji.
	expect(Math.abs(panel!.x - opis!.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(panel!.width - opis!.width)).toBeLessThanOrEqual(1);
	expect(panel!.y).toBeGreaterThan(opis!.y + opis!.height - 1);

	// 3. Dokladnie dwie kolumny. Kazdy wiersz wypelnia swoja kolumne, wiec liczba
	// roznych odsuniec poziomych JEST liczba kolumn.
	const odsuniecia = await page
		.locator('.dayplan .panel li')
		.evaluateAll((wiersze) => [
			...new Set(wiersze.map((w) => Math.round(w.getBoundingClientRect().x)))
		]);
	expect(odsuniecia).toHaveLength(2);

	// 4. Podzial redakcyjny naglowka: akapit stoi na prawo od h2.
	const h2 = await page.getByRole('heading', { name: 'Nasz dzień w żłobku' }).boundingBox();
	const intro = await page.locator('.dayplan .intro').boundingBox();
	expect(h2).not.toBeNull();
	expect(intro).not.toBeNull();
	expect(intro!.x).toBeGreaterThan(h2!.x + h2!.width - 1);
});

test('phone width shows the hamburger, hides the inline nav links (SITE-02)', async ({ page }) => {
	await page.setViewportSize(VIEWPORTS.phone);
	await page.goto('/');
	// Hamburger visible below md.
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeVisible();
	// The inline desktop nav links are collapsed (nav is display:none below md).
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeHidden();
});

test('desktop width shows the inline nav links, hides the hamburger (SITE-02)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/');
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeHidden();
});

/* The two tiers the v1.7 nav flip sits between. Without these the move from 768px
 * to 1024px passes the suite unchanged in either direction, so the change would be
 * unfalsifiable. The 375px and 1280px tests above stay untouched on purpose: they
 * are what proves neither end of the range regressed. */
test('szerokość 768px pokazuje hamburgera i chowa odnośniki w pasku (v1.7 §1)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.tablet);
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeVisible();
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeHidden();
});

test('szerokość 1024px pokazuje odnośniki w pasku i chowa hamburgera (v1.7 §1)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktopSm);
	await page.goto('/');
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeHidden();
});
