import { test, expect } from '@playwright/test';

/**
 * Responsive acceptance (SITE-02): the homepage is mobile-first and adapts across
 * a phone/tablet/desktop viewport matrix without horizontal overflow, and the
 * navigation swaps between the hamburger drawer (phone) and the inline links
 * (desktop). Authoritative breakpoints: 01-UI-SPEC §Layout & Breakpoints
 * (md = 768px flips the nav to horizontal).
 */

const VIEWPORTS = {
	phone: { width: 375, height: 667 },
	tablet: { width: 768, height: 1024 },
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
 * tiers, now that the recomposed sections fill the 72rem container. */
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
	for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.desktopXl]) {
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

test('strona główna: panel planu dnia stoi na prawo od nagłówka sekcji (v1.6 §4)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/');
	const heading = await page.getByRole('heading', { name: 'Nasz dzień w żłobku' }).boundingBox();
	const panel = await page.locator('.dayplan .panel').boundingBox();
	expect(heading).not.toBeNull();
	expect(panel).not.toBeNull();
	expect(panel!.x).toBeGreaterThan(heading!.x + heading!.width - 1);
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
