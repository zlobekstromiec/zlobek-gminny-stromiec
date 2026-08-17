import { test, expect } from '@playwright/test';
import { navLinks } from '../src/lib/nav';

/**
 * Navigation shell acceptance (SITE-03 / SITE-02 / A11Y baseline).
 *
 * Runs against the prerendered `/` which is wrapped by the shared layout shell,
 * so the persistent header + footer render on every page. Asserts:
 *  - the six section links in the desktop header (count, DOM order, labels + hrefs),
 *  - the footer BIP external link (exact URL + reverse-tabnabbing safety),
 *  - the Deklaracja dostępności + Kontakt footer links,
 *  - that every footer shortcut carrying a fragment lands on a real, focusable section,
 *  - the mobile drawer's keyboard contract (open → dialog, ESC → close + focus restore).
 *
 * Authoritative copy/URLs: 01-UI-SPEC.md §Footer + §Copywriting Contract, as
 * amended by 01-UI-SPEC.md Amendment v1.7 §1 and §3 (six nav items, footer repoints)
 * and detailed in 05-UI-SPEC.md Contract 6.
 */

test.describe('Navigation shell: Phase 1 acceptance', () => {
	test('nagłówek pokazuje sześć odnośników sekcji z właściwymi adresami (SITE-03, v1.7 §1)', async ({
		page
	}) => {
		await page.goto('/');
		const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
		await expect(nav).toBeVisible();

		// The count is asserted explicitly from now on. The per-href loop below
		// iterates navLinks, so before v1.7 adding an item was completely silent
		// here and the five-item lock existed only in prose (05-UI-SPEC Contract 6).
		expect(navLinks).toHaveLength(6);
		await expect(nav.getByRole('link')).toHaveCount(6);

		for (const link of navLinks) {
			await expect(nav.getByRole('link', { name: link.label, exact: true })).toHaveAttribute(
				'href',
				link.href
			);
		}

		// Order, read in DOM order. The per-href loop cannot see an item inserted in
		// the wrong position. These links carry nothing but their label, so their
		// accessible name is their (whitespace-normalised) text content.
		await expect(nav.getByRole('link')).toHaveText(navLinks.map((link) => link.label));
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

	test('footer links to Deklaracja dostępności, Polityka prywatności and Kontakt (SITE-03)', async ({
		page
	}) => {
		await page.goto('/');
		const footer = page.getByRole('contentinfo');
		await expect(footer.getByRole('link', { name: 'Deklaracja dostępności' })).toHaveAttribute(
			'href',
			'/deklaracja-dostepnosci'
		);
		await expect(footer.getByRole('link', { name: 'Polityka prywatności (RODO)' })).toHaveAttribute(
			'href',
			'/polityka-prywatnosci'
		);
		await expect(footer.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt');
	});

	test('footer v2 exposes shortcut columns and big opening hours (UI-SPEC v1.2)', async ({
		page
	}) => {
		await page.goto('/');
		const footer = page.getByRole('contentinfo');

		// Column headings (scoped to contentinfo: "Godziny otwarcia" also exists
		// as a contact label elsewhere on the page).
		await expect(footer.getByRole('heading', { name: 'Na skróty' })).toBeVisible();
		await expect(footer.getByRole('heading', { name: 'Informacje' })).toBeVisible();
		await expect(footer.getByRole('heading', { name: 'Godziny otwarcia' })).toBeVisible();

		// Shortcut links. Amendment v1.7 §3 repoints two of them at fragments of
		// existing pages instead of pages that were never going to be built. Galeria
		// still points at the standalone path: plan 05-07 repoints it in the very
		// commit that creates #galeria on /o-nas, because a repointed link that lands
		// nowhere is worse than the 404 it replaces.
		const shortcuts: Array<[string, string]> = [
			['Aktualności', '/aktualnosci'],
			['Rekrutacja', '/rekrutacja'],
			['Dokumenty', '/dokumenty'],
			['Cennik', '/cennik'],
			['Galeria', '/galeria'],
			['Dojazd', '/kontakt#dojazd']
		];
		for (const [name, href] of shortcuts) {
			await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
		}

		// Big hours line (footer-scoped: the same range renders in KeyFacts).
		await expect(footer.getByText('6:30–16:30')).toBeVisible();
	});

	test('każdy odnośnik w stopce z kotwicą prowadzi do istniejącej sekcji (v1.7 §3)', async ({
		page
	}) => {
		await page.goto('/');

		// Read the hrefs off what the footer actually renders, never off a retyped
		// list. That is what makes plan 05-07's Galeria repoint covered the moment it
		// lands, without anybody remembering to extend this test.
		const kolumna = page
			.getByRole('contentinfo')
			.locator('.col')
			.filter({ has: page.getByRole('heading', { name: 'Na skróty' }) });
		const hrefy = await kolumna
			.getByRole('link')
			.evaluateAll((elementy) => elementy.map((el) => el.getAttribute('href') ?? ''));
		const zKotwica = hrefy.filter((href) => href.includes('#'));

		// A footer refactor that drops every fragment must not make this pass by
		// iterating an empty set.
		expect(zKotwica.length).toBeGreaterThan(0);

		for (const href of zKotwica) {
			await page.goto(href);
			const identyfikator = href.slice(href.indexOf('#') + 1);
			const cel = page.locator(`#${identyfikator}`);
			await expect(cel, `kotwica ${href} nie istnieje`).toBeVisible();
			// The section takes focus so a keyboard user lands inside it, not at the
			// top of the page (05-UI-SPEC Contract 1 anchor treatment).
			await expect(cel).toHaveAttribute('tabindex', '-1');
		}
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
