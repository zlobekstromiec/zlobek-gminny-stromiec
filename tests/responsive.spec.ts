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
	desktop: { width: 1280, height: 800 }
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
