import { test, expect } from '@playwright/test';
import { siteUrl } from '../src/lib/content/site';

/**
 * Indexing switch (quick 260929-kzw, 2026-09-29). From Phase 1 the whole site was noindex
 * with a Disallow-all robots.txt (D-11) while it lived on *.pages.dev. The director asked
 * for the site to be found on Google, so the public routes are indexable now and this
 * file pins the three things a crawler reads first: robots.txt, sitemap.xml and the
 * canonical. The panel stays noindex; tests/admin-auth.spec.ts asserts that side.
 */
test.describe('Indeksowanie (quick 260929-kzw)', () => {
	test('robots.txt wpuszcza roboty na strone publiczna, blokuje panel i wskazuje sitemap', async ({
		request
	}) => {
		const res = await request.get('/robots.txt');
		expect(res.status()).toBe(200);
		const body = await res.text();
		const dyrektywy = body
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l && !l.startsWith('#'));
		expect(dyrektywy).toContain('User-agent: *');
		expect(dyrektywy).toContain('Disallow: /admin');
		expect(dyrektywy).toContain('Allow: /');
		expect(dyrektywy).not.toContain('Disallow: /');
		expect(dyrektywy).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
	});

	test('sitemap.xml wymienia strony publiczne na wlasnej domenie i kazda z nich odpowiada 200', async ({
		request
	}) => {
		const res = await request.get('/sitemap.xml');
		expect(res.status()).toBe(200);
		const body = await res.text();
		const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
		expect(locs.length).toBeGreaterThanOrEqual(8);
		for (const loc of locs) {
			expect(loc.startsWith(siteUrl + '/')).toBe(true);
			// The same path on the server under test must exist: a sitemap that lists a 404
			// is worse than no sitemap.
			const sciezka = loc.slice(siteUrl.length);
			const strona = await request.get(sciezka);
			expect(strona.status(), sciezka).toBe(200);
		}
		expect(locs).toContain(`${siteUrl}/`);
		expect(locs).toContain(`${siteUrl}/rekrutacja`);
		expect(locs).not.toContain(`${siteUrl}/admin`);
	});

	test('canonical i og:url sa absolutne na wlasnej domenie, bez noindex, na trzech trasach', async ({
		page
	}) => {
		for (const sciezka of ['/', '/rekrutacja', '/aktualnosci']) {
			await page.goto(sciezka);
			await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
				'href',
				siteUrl + sciezka
			);
			await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
				'content',
				siteUrl + sciezka
			);
			const obraz = await page.locator('head meta[property="og:image"]').getAttribute('content');
			expect(obraz?.startsWith(siteUrl + '/')).toBe(true);
			await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
		}
	});
});
