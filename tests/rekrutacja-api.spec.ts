import { test, expect } from '@playwright/test';

/**
 * /api/rekrutacja endpoint acceptance test: encodes RECRUIT-03, RECRUIT-04,
 * FORM-01 and FORM-02 against the REAL Cloudflare runtime, exactly as
 * tests/kontakt-api.spec.ts does for the contact endpoint.
 * `playwright.config.ts` runs `npm run build && npm run preview:test`, and
 * `npm run preview:test` is `wrangler pages dev` with the always-pass dummy
 * Turnstile secret plus FORM_DRY_RUN=1 supplied as bindings, so these requests hit
 * the actual Pages Function and no real mail is ever sent.
 *
 * Contract highlights (04-05-PLAN.md, 04-CONTEXT.md D-01 and D-02):
 * - the happy path returns 200 with a body of exactly {ok:true};
 * - the minimal data set is the ONLY accepted shape: an out-of-range birth month is
 *   a walidacja failure, and a child-name key in the body is silently dropped rather
 *   than honoured or rejected (T-04-24);
 * - every rejection returns its documented status AND its stable machine code, the
 *   same table the contact endpoint uses. A failure is NEVER reported as 200 (D-12);
 * - the recipient cannot be influenced by the request body (FORM-02);
 * - only POST exists, so any other verb must keep returning the framework's 405.
 *
 * There is no page UI yet (the /rekrutacja route lands in Plan 06), so every case
 * talks to the endpoint directly with `page.request`. The suite is serial because
 * all cases share one client address and therefore one rate-limit counter: running
 * them in parallel would make the order, and the limiter, non-deterministic.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

// Cloudflare's always-pass dummy sitekey emits this token shape. Paired with the
// always-pass dummy secret in the preview:test bindings, siteverify accepts it.
const TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

const BIEZACY_ROK = new Date().getUTCFullYear();

/** The whole lawful data set for a waiting-list enquiry (D-02): a parent's name, an
 *  address, and the child's month and year of birth. No child name, by design. */
const POPRAWNE = {
	imie: 'Anna Kowalska',
	email: 'anna.kowalska@example.com',
	telefon: '+48 510 094 051',
	miesiac: '3',
	rok: String(BIEZACY_ROK),
	wiadomosc: 'Dzien dobry, prosze o wpisanie nas na liste rezerwowa.',
	zgoda: true,
	turnstile: TOKEN
};

test.describe.serial('API rekrutacja: RECRUIT-03 / RECRUIT-04 / FORM-02 acceptance', () => {
	test('poprawne zgłoszenie zwraca 200 oraz treść {ok:true}', async ({ page }) => {
		const res = await page.request.post('/api/rekrutacja', { data: POPRAWNE });
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test('zgłoszenie bez opcjonalnych pól (telefon, wiadomość) zwraca 200', async ({ page }) => {
		const { telefon, wiadomosc, ...minimalne } = POPRAWNE;
		expect(telefon.length).toBeGreaterThan(0);
		expect(wiadomosc.length).toBeGreaterThan(0);
		const res = await page.request.post('/api/rekrutacja', { data: minimalne });
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test('brak zgody RODO zwraca 400 i kod zgoda (RECRUIT-04)', async ({ page }) => {
		const { zgoda, ...bezZgody } = POPRAWNE;
		expect(zgoda).toBe(true);
		const res = await page.request.post('/api/rekrutacja', { data: bezZgody });
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'zgoda' });
	});

	test('miesiąc urodzenia poza zakresem 1-12 zwraca 400 i kod walidacja', async ({ page }) => {
		const res = await page.request.post('/api/rekrutacja', {
			data: { ...POPRAWNE, miesiac: '13' }
		});
		expect(res.status()).toBe(400);
		const tresc = await res.json();
		expect(tresc).toMatchObject({ ok: false, code: 'walidacja' });
		expect(tresc.pola).toMatchObject({ miesiac: 'niepoprawny' });
	});

	test('brak roku urodzenia zwraca 400 i kod walidacja z kluczem rok', async ({ page }) => {
		const { rok, ...bezRoku } = POPRAWNE;
		expect(rok).toBe(String(BIEZACY_ROK));
		const res = await page.request.post('/api/rekrutacja', { data: bezRoku });
		expect(res.status()).toBe(400);
		const tresc = await res.json();
		expect(tresc).toMatchObject({ ok: false, code: 'walidacja' });
		expect(tresc.pola).toMatchObject({ rok: 'brak' });
	});

	// T-04-24 at the endpoint boundary. The unit suite proves the value never reaches
	// the mail body; this case proves the endpoint neither honours nor rejects the key,
	// so a forged body cannot learn the accepted shape by probing.
	test('klucz z imieniem dziecka jest po cichu pomijany i nadal zwracamy 200 (D-02)', async ({
		page
	}) => {
		const res = await page.request.post('/api/rekrutacja', {
			data: { ...POPRAWNE, imie_dziecka: 'Zosia', nazwisko_dziecka: 'Kowalska' }
		});
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	// The payload-immutability assertion itself lives in tests/forms.unit.ts. This
	// case only proves the endpoint neither rejects nor honours the extra keys.
	test('dodatkowe klucze to i bcc w ciele żądania są ignorowane i nadal zwracamy 200 (FORM-02)', async ({
		page
	}) => {
		const res = await page.request.post('/api/rekrutacja', {
			data: {
				...POPRAWNE,
				to: 'atakujacy@example.com',
				bcc: 'atakujacy@example.com'
			}
		});
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test('brak tokenu Turnstile zwraca 400 i kod turnstile (FORM-02)', async ({ page }) => {
		const { turnstile, ...bezTokenu } = POPRAWNE;
		expect(turnstile).toBe(TOKEN);
		const res = await page.request.post('/api/rekrutacja', { data: bezTokenu });
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'turnstile' });
	});

	test('metoda GET na /api/rekrutacja zwraca 405 (brak fallbacku, brak pomyłki metody)', async ({
		page
	}) => {
		const res = await page.request.get('/api/rekrutacja');
		expect(res.status()).toBe(405);
	});

	test('ciało żądania powyżej limitu 8 KiB zwraca 400 i kod walidacja', async ({ page }) => {
		const res = await page.request.post('/api/rekrutacja', {
			data: { ...POPRAWNE, wiadomosc: 'x'.repeat(9000) }
		});
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'walidacja' });
	});

	test('wypełniony honeypot zwraca 200, żeby bot uznał wysyłkę za udaną', async ({ page }) => {
		const res = await page.request.post('/api/rekrutacja', {
			data: { ...POPRAWNE, strona: 'https://spam.example.com' }
		});
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});
});
