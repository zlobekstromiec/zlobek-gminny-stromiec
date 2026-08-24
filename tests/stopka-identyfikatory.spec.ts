// Institutional identifiers in the footer (NIP, REGON).
//
// A Polish public body's footer is expected to carry its identifiers, and the footer is
// the one component that renders on EVERY page, so this is sampled across routes rather
// than checked once: a block that renders on /kontakt and silently not on /rekrutacja
// would satisfy a single-page assertion while failing the actual expectation.
//
// DRIVEN OFF THE STORE, NOT OFF LITERALS. The REGON is unknown today and the line is
// omitted while it is empty, but „there is no REGON on the page" is a fact about this week,
// not a requirement. Asserting it as a literal would make this suite go red on the day the
// żłobek supplies the number, which is precisely the wrong moment to be fighting a test.
// So the expectation is derived: whatever the store holds is what the footer must show.
import { test, expect } from '@playwright/test';
import { contact } from '../src/lib/content/site.ts';
import { nipDoWyswietlenia, regonDoWyswietlenia } from '../src/lib/identyfikatory.ts';

/** A spread of routes, not an exhaustive list: one content page, one form page, one
 *  document page and the homepage. Enough to catch a footer that renders conditionally. */
const TRASY = ['/', '/o-nas', '/rekrutacja', '/kontakt', '/aktualnosci'];

for (const trasa of TRASY) {
	test(`stopka na ${trasa} niesie NIP placowki`, async ({ page }) => {
		await page.goto(trasa);
		const stopka = page.locator('footer.site-footer');
		await expect(stopka).toBeVisible();
		await expect(stopka).toContainText(`NIP ${nipDoWyswietlenia(contact.nip)}`);
	});
}

test('NIP w stopce jest pogrupowany, a nie wklejony ciagiem cyfr', async ({ page }) => {
	await page.goto('/');
	const tekst = (await page.locator('footer.site-footer').textContent()) ?? '';
	expect(tekst).toContain(nipDoWyswietlenia(contact.nip));
	// The bare ten-digit form must NOT appear: that is the difference between the formatter
	// running and someone having pasted the raw field into the markup.
	expect(tekst).not.toContain(contact.nip);
});

test('REGON pojawia sie dokladnie wtedy, gdy sklep go niesie', async ({ page }) => {
	await page.goto('/');
	const stopka = page.locator('footer.site-footer');
	if (contact.regon) {
		await expect(stopka).toContainText(`REGON ${regonDoWyswietlenia(contact.regon)}`);
	} else {
		// Nothing about REGON is published while it is unknown. „REGON: brak" would state an
		// absence as a fact on every page of a public body's website.
		await expect(stopka).not.toContainText('REGON');
	}
});

test('to samo na stronie kontaktu: wiersz REGON istnieje tylko z wartoscia', async ({ page }) => {
	await page.goto('/kontakt');
	const karta = page.locator('.contact-grid');
	await expect(karta).toContainText(nipDoWyswietlenia(contact.nip));
	if (contact.regon) await expect(karta).toContainText('REGON');
	else await expect(karta).not.toContainText('REGON');
});
