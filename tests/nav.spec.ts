import { test, expect } from '@playwright/test';
import { navLinks } from '../src/lib/nav';

/**
 * Navigation shell acceptance (SITE-03 / SITE-02 / A11Y baseline).
 *
 * Runs against the prerendered `/` which is wrapped by the shared layout shell,
 * so the persistent header + footer render on every page. Asserts:
 *  - the five section links in the desktop header (labels + hrefs),
 *  - the footer BIP external link (exact URL + reverse-tabnabbing safety),
 *  - the Deklaracja dostępności + Kontakt footer links,
 *  - the mobile drawer's keyboard contract (open → dialog, ESC → close + focus restore).
 *
 * Authoritative copy/URLs: 01-UI-SPEC.md §Footer + §Copywriting Contract.
 */

test.describe('Navigation shell — Phase 1 acceptance', () => {
	test('header exposes all five section links with correct hrefs (SITE-03)', async ({ page }) => {
		await page.goto('/');
		const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
		await expect(nav).toBeVisible();
		for (const link of navLinks) {
			await expect(nav.getByRole('link', { name: link.label, exact: true })).toHaveAttribute(
				'href',
				link.href
			);
		}
	});

	test('footer BIP link is external and reverse-tabnabbing safe (SITE-03, T-01-02)', async ({
		page
	}) => {
		await page.goto('/');
		const bip = page.getByRole('link', { name: 'Biuletyn Informacji Publicznej (BIP)' });
		await expect(bip).toHaveAttribute('href', 'https://ugstromiec.naszbip.pl/zlobek');
		await expect(bip).toHaveAttribute('target', '_blank');
		const rel = (await bip.getAttribute('rel')) ?? '';
		expect(rel).toContain('noopener');
		expect(rel).toContain('noreferrer');
	});

	test('footer links to Deklaracja dostępności and Kontakt (SITE-03)', async ({ page }) => {
		await page.goto('/');
		const footer = page.getByRole('contentinfo');
		await expect(footer.getByRole('link', { name: 'Deklaracja dostępności' })).toHaveAttribute(
			'href',
			'/deklaracja-dostepnosci'
		);
		await expect(footer.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt');
	});

	test('mobile drawer: hamburger opens dialog, ESC closes and restores focus (SITE-02)', async ({
		page
	}) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const hamburger = page.getByRole('button', { name: 'Otwórz menu' });
		await expect(hamburger).toBeVisible();
		await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

		await hamburger.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAttribute('aria-modal', 'true');
		// First focus lands on the drawer's close button (focus trap entry point).
		await expect(dialog.getByRole('button', { name: 'Zamknij menu' })).toBeFocused();

		await page.keyboard.press('Escape');

		await expect(dialog).toBeHidden();
		// Focus returns to the hamburger that opened the drawer.
		await expect(hamburger).toBeFocused();
	});
});
