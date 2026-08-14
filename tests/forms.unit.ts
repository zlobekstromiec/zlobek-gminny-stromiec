// Form pipeline unit test (Phase 4, Plan 04-01). These are the executable
// acceptance criteria for FORM-01 and FORM-02: header-injection rejection, the
// immutable sending identity, consent enforcement as a server-side boundary, the
// two rate-limit ceilings and the full obsluz decision table. Uses Node's
// built-in runner (no new dependency): `node --test` strips types natively on
// the pinned Node 22.23.2. Intentionally named *.unit.ts so Playwright's
// spec|test matcher never collects it. Every module under test is either pure or
// dependency-injected, so nothing here touches the network or KV.
//
// Do NOT weaken these assertions to make the suite pass. They are the proof of
// the threat register in 04-01-PLAN.md and change only in lockstep with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	bezpiecznyEmail,
	bezpiecznyTekst,
	bezpiecznyTelefon
} from '../src/lib/server/forms/sanitize.ts';
import { walidujKontakt, walidujZgloszenie } from '../src/lib/server/forms/validate.ts';
import {
	BCC,
	FROM,
	TEMAT_KONTAKT,
	TEMAT_ZGLOSZENIE,
	TO,
	wyslij,
	zbudujPayload,
	zbudujTrescKontakt,
	zbudujTrescZgloszenie
} from '../src/lib/server/forms/mailer.ts';
import { nazwaMiesiaca } from '../src/lib/content/forms.ts';
import {
	DOBA_S,
	KLUCZ_DOBOWY,
	OKNO_S,
	kluczLimitu,
	podLimitem
} from '../src/lib/server/forms/ratelimit.ts';
import { obsluz } from '../src/lib/server/forms/handle.ts';
import type { Zaleznosci } from '../src/lib/server/forms/handle.ts';
import { STATUS_DLA_KODU } from '../src/lib/forms/types.ts';

// ---------------------------------------------------------------------------
// sanitize.ts: the only thing standing between a request field and an SMTP header
// ---------------------------------------------------------------------------

// T-04-01. Each payload would split the reply-to header or smuggle a second
// recipient if the value were repaired instead of rejected.
const WSTRZYKNIECIA: [string, string][] = [
	['a carriage return', 'jan@example.com\rBcc: atakujacy@example.com'],
	['a line feed', 'jan@example.com\nBcc: atakujacy@example.com'],
	['a CRLF pair', 'jan@example.com\r\nBcc: atakujacy@example.com'],
	['a tab', 'jan@example.com\tBcc: atakujacy@example.com'],
	['a null byte', 'jan@example.com\u0000'],
	['angle brackets', '<jan@example.com>'],
	['a comma', 'jan@example.com,atakujacy@example.com'],
	['a semicolon', 'jan@example.com;atakujacy@example.com'],
	['a double quote', '"jan"@example.com']
];

for (const [opis, wartosc] of WSTRZYKNIECIA) {
	test(`bezpiecznyEmail rejects an address containing ${opis}`, () => {
		assert.equal(bezpiecznyEmail(wartosc), null);
	});
}

test('bezpiecznyEmail returns null for a non-string value', () => {
	assert.equal(bezpiecznyEmail(42), null);
});

test('bezpiecznyEmail returns null for an empty value', () => {
	assert.equal(bezpiecznyEmail('   '), null);
});

// The regex alone accepts a 190-character host, so the 254-character cap has to
// be its own check: this value is structurally valid and only the cap rejects it.
test('bezpiecznyEmail returns null for a structurally valid address longer than 254 characters', () => {
	const zbyt = `${'a'.repeat(64)}@${'b'.repeat(190)}.pl`;
	assert.equal(zbyt.length > 254, true);
	assert.equal(bezpiecznyEmail(zbyt), null);
});

test('bezpiecznyEmail accepts a long address that is still within the 254-character cap', () => {
	const dlugi = `${'a'.repeat(64)}@${'b'.repeat(180)}.pl`;
	assert.equal(dlugi.length <= 254, true);
	assert.equal(bezpiecznyEmail(dlugi), dlugi);
});

test('bezpiecznyEmail returns the trimmed value for a normal address', () => {
	assert.equal(bezpiecznyEmail(' jan@example.com '), 'jan@example.com');
});

test('bezpiecznyEmail rejects a value with no at sign', () => {
	assert.equal(bezpiecznyEmail('nie-jest-adresem'), null);
});

test('bezpiecznyTekst strips control characters', () => {
	assert.equal(bezpiecznyTekst('Dobry\u0007 dzien', 100), 'Dobry dzien');
});

test('bezpiecznyTekst keeps newlines inside a message', () => {
	assert.equal(bezpiecznyTekst('Linia 1\nLinia 2', 100), 'Linia 1\nLinia 2');
});

test('bezpiecznyTekst collapses three or more consecutive newlines to two', () => {
	assert.equal(bezpiecznyTekst('a\n\n\n\n\nb', 100), 'a\n\nb');
});

test('bezpiecznyTekst returns null past the cap', () => {
	assert.equal(bezpiecznyTekst('x'.repeat(11), 10), null);
});

test('bezpiecznyTekst returns null for a whitespace-only value', () => {
	assert.equal(bezpiecznyTekst('   \n  ', 10), null);
});

test('bezpiecznyTekst returns null for a non-string value', () => {
	assert.equal(bezpiecznyTekst(42, 10), null);
});

test('bezpiecznyTelefon accepts a spaced number with a leading plus', () => {
	assert.equal(bezpiecznyTelefon('+48 510 094 051'), '+48 510 094 051');
});

test('bezpiecznyTelefon accepts a hyphenated number and trims it', () => {
	assert.equal(bezpiecznyTelefon(' 510-094-051 '), '510-094-051');
});

test('bezpiecznyTelefon rejects a number carrying letters instead of stripping them', () => {
	assert.equal(bezpiecznyTelefon('510 094 051 wew. 3'), null);
});

test('bezpiecznyTelefon rejects a plus sign that is not leading', () => {
	assert.equal(bezpiecznyTelefon('48+510094051'), null);
});

test('bezpiecznyTelefon returns null past the 24-character cap', () => {
	assert.equal(bezpiecznyTelefon('1'.repeat(25)), null);
});

test('bezpiecznyTelefon returns null for an empty value', () => {
	assert.equal(bezpiecznyTelefon('  '), null);
});

test('bezpiecznyTelefon returns null for a non-string value', () => {
	assert.equal(bezpiecznyTelefon(510094051), null);
});

// ---------------------------------------------------------------------------
// types.ts: a failure must never be reported as 200
// ---------------------------------------------------------------------------

test('STATUS_DLA_KODU maps every failure code to a non-200 status', () => {
	assert.deepEqual(STATUS_DLA_KODU, {
		walidacja: 400,
		zgoda: 400,
		turnstile: 400,
		limit: 429,
		wysylka: 502
	});
});

// ---------------------------------------------------------------------------
// validate.ts: the server is the enforcement boundary, the island is advisory
// ---------------------------------------------------------------------------

const KONTAKT_OK = {
	imie: 'Jan Kowalski',
	email: 'jan@example.com',
	wiadomosc: 'Dzien dobry, prosze o informacje o wolnych miejscach.',
	zgoda: true
};

test('walidujKontakt returns code walidacja for a non-object input', () => {
	const wynik = walidujKontakt('nie obiekt');
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
});

test('walidujKontakt returns code walidacja for null', () => {
	const wynik = walidujKontakt(null);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
});

test('walidujKontakt accepts a well-formed body and returns only the sanitized fields', () => {
	const wynik = walidujKontakt(KONTAKT_OK);
	assert.equal(wynik.ok, true);
	assert.deepEqual(wynik.ok ? wynik.dane : null, {
		imie: 'Jan Kowalski',
		email: 'jan@example.com',
		wiadomosc: 'Dzien dobry, prosze o informacje o wolnych miejscach.'
	});
});

// RECRUIT-04 / CONTACT-03: consent is re-checked here even though the browser
// also enforces it, and only an exact boolean true counts.
const ZGODA_ODRZUCONA: [string, unknown][] = [
	['absent', undefined],
	['false', false],
	['the string "true"', 'true'],
	['the number 1', 1],
	['the string "on"', 'on'],
	['null', null]
];

for (const [opis, zgoda] of ZGODA_ODRZUCONA) {
	test(`walidujKontakt returns code zgoda when the consent value is ${opis}`, () => {
		const wynik = walidujKontakt({ ...KONTAKT_OK, zgoda });
		assert.equal(wynik.ok, false);
		assert.equal(wynik.ok ? null : wynik.code, 'zgoda');
	});
}

test('walidujKontakt returns code walidacja with a pola key for every missing required field', () => {
	const wynik = walidujKontakt({ zgoda: true });
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, {
		imie: 'brak',
		email: 'brak',
		wiadomosc: 'brak'
	});
});

test('walidujKontakt reports an empty wiadomosc under the wiadomosc key', () => {
	const wynik = walidujKontakt({ ...KONTAKT_OK, wiadomosc: '   ' });
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, { wiadomosc: 'brak' });
});

test('walidujKontakt reports a malformed e-mail as niepoprawny, not brak', () => {
	const wynik = walidujKontakt({ ...KONTAKT_OK, email: 'jan(at)example.com' });
	assert.equal(wynik.ok, false);
	assert.deepEqual(wynik.ok ? null : wynik.pola, { email: 'niepoprawny' });
});

test('walidujKontakt reports an over-long wiadomosc as zbyt-dlugi', () => {
	const wynik = walidujKontakt({ ...KONTAKT_OK, wiadomosc: 'x'.repeat(2001) });
	assert.equal(wynik.ok, false);
	assert.deepEqual(wynik.ok ? null : wynik.pola, { wiadomosc: 'zbyt-dlugi' });
});

test('walidujKontakt accepts a wiadomosc exactly at the 2000-character cap stated to the parent', () => {
	const wynik = walidujKontakt({ ...KONTAKT_OK, wiadomosc: 'x'.repeat(2000) });
	assert.equal(wynik.ok, true);
});

test('walidujKontakt rejects a header-injection e-mail before consent is ever considered', () => {
	const wynik = walidujKontakt({
		...KONTAKT_OK,
		email: 'jan@example.com\r\nBcc: atakujacy@example.com'
	});
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
});

// ---------------------------------------------------------------------------
// mailer.ts: T-04-02, the sending identity no request can influence
// ---------------------------------------------------------------------------

const KLUCZE_PAYLOAD = ['bcc', 'from', 'reply_to', 'subject', 'text', 'to'];

test('zbudujPayload emits the module FROM, a single-element to array and a bcc array', () => {
	const payload = zbudujPayload(TEMAT_KONTAKT, 'Tresc', 'jan@example.com');
	assert.equal(payload.from, FROM);
	assert.deepEqual(payload.to, [TO]);
	assert.deepEqual(payload.bcc, [BCC]);
	assert.equal(payload.subject, TEMAT_KONTAKT);
	assert.equal(payload.text, 'Tresc');
	assert.equal(payload.reply_to, 'jan@example.com');
});

test('zbudujPayload emits no html key, so a submitted message can never become markup', () => {
	const payload = zbudujPayload(TEMAT_KONTAKT, 'Tresc <b>pogrubiona</b>', 'jan@example.com');
	assert.equal('html' in payload, false);
	assert.deepEqual(Object.keys(payload).sort(), KLUCZE_PAYLOAD);
});

test('the payload keeps the module recipients when the body carries to, from, cc and bcc keys', () => {
	const wynik = walidujKontakt({
		...KONTAKT_OK,
		to: 'atakujacy@example.com',
		from: 'atakujacy@example.com',
		cc: 'atakujacy@example.com',
		bcc: 'atakujacy@example.com'
	});
	assert.equal(wynik.ok, true);
	const dane = wynik.ok ? wynik.dane : null;
	assert.notEqual(dane, null);
	const payload = zbudujPayload(
		TEMAT_KONTAKT,
		zbudujTrescKontakt(dane ?? { imie: '', email: '', wiadomosc: '' }),
		dane?.email ?? ''
	);
	assert.equal(payload.from, FROM);
	assert.deepEqual(payload.to, [TO]);
	assert.deepEqual(payload.bcc, [BCC]);
	assert.deepEqual(Object.keys(payload).sort(), KLUCZE_PAYLOAD);
	assert.equal(payload.reply_to, 'jan@example.com');
});

test('TEMAT_KONTAKT is a static constant that carries no submitted value', () => {
	const payload = zbudujPayload(TEMAT_KONTAKT, 'Tresc', 'jan@example.com');
	assert.equal(payload.subject, TEMAT_KONTAKT);
	assert.equal(payload.subject.includes('jan@example.com'), false);
});

test('zbudujTrescKontakt puts the name and the address in the labelled body, not in a header', () => {
	const tresc = zbudujTrescKontakt({
		imie: 'Jan Kowalski',
		email: 'jan@example.com',
		wiadomosc: 'Pierwsza linia.\nDruga linia.'
	});
	assert.equal(tresc.includes('Jan Kowalski'), true);
	assert.equal(tresc.includes('jan@example.com'), true);
	assert.equal(tresc.includes('Pierwsza linia.\nDruga linia.'), true);
});

test('wyslij short-circuits without a network call when the dry-run seam is on', async () => {
	assert.equal(await wyslij('nieuzywany', true, TEMAT_KONTAKT, 'Tresc', 'jan@example.com'), true);
});

// ---------------------------------------------------------------------------
// ratelimit.ts: T-04-04, two ceilings and no identifying data in KV
// ---------------------------------------------------------------------------

interface Zapis {
	key: string;
	value: string;
	ttl?: number;
}

function stubKV(wstepne: Record<string, string> = {}): {
	kv: KVNamespace;
	zapisy: Zapis[];
	magazyn: Map<string, string>;
} {
	const magazyn = new Map<string, string>(Object.entries(wstepne));
	const zapisy: Zapis[] = [];
	const kv = {
		get: async (key: string) => magazyn.get(key) ?? null,
		put: async (key: string, value: string, opcje?: { expirationTtl?: number }) => {
			magazyn.set(key, value);
			zapisy.push({ key, value, ttl: opcje?.expirationTtl });
		}
	};
	return { kv: kv as unknown as KVNamespace, zapisy, magazyn };
}

const IP = '203.0.113.7';
const SOL = 'sol-testowa';

test('kluczLimitu never contains the raw IP and is a salted hex digest scoped to the form', async () => {
	const klucz = await kluczLimitu('kontakt', IP, SOL);
	assert.equal(klucz.includes(IP), false);
	assert.match(klucz, /^rl:kontakt:[0-9a-f]{16}$/);
});

test('kluczLimitu gives the two forms independent counters for the same client', async () => {
	const kontakt = await kluczLimitu('kontakt', IP, SOL);
	const rekrutacja = await kluczLimitu('rekrutacja', IP, SOL);
	assert.notEqual(kontakt, rekrutacja);
});

test('kluczLimitu changes when the salt changes, so the hash is not rainbow-tableable', async () => {
	const a = await kluczLimitu('kontakt', IP, SOL);
	const b = await kluczLimitu('kontakt', IP, 'inna-sol');
	assert.notEqual(a, b);
});

test('podLimitem returns true under the per-client limit', async () => {
	const { kv } = stubKV();
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), true);
});

test('podLimitem returns false exactly at the per-client limit', async () => {
	const klucz = await kluczLimitu('kontakt', IP, SOL);
	const { kv } = stubKV({ [klucz]: '5' });
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), false);
});

test('podLimitem returns false past the per-client limit', async () => {
	const klucz = await kluczLimitu('kontakt', IP, SOL);
	const { kv } = stubKV({ [klucz]: '9' });
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), false);
});

test('podLimitem writes nothing once the per-client limit is reached', async () => {
	const klucz = await kluczLimitu('kontakt', IP, SOL);
	const { kv, zapisy } = stubKV({ [klucz]: '5' });
	await podLimitem(kv, 'kontakt', IP, SOL, 5, 40);
	assert.equal(zapisy.length, 0);
});

// The per-client window protects a parent from a neighbour; the daily ceiling
// protects the Resend 100/day budget from a distributed flood of verified humans.
test('podLimitem returns false once the global daily ceiling is reached even when the per-client counter is low', async () => {
	const { kv } = stubKV({ [KLUCZ_DOBOWY]: '40' });
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), false);
});

test('podLimitem writes neither counter once the global daily ceiling is reached', async () => {
	const { kv, zapisy } = stubKV({ [KLUCZ_DOBOWY]: '40' });
	await podLimitem(kv, 'kontakt', IP, SOL, 5, 40);
	assert.equal(zapisy.length, 0);
});

test('podLimitem writes an increasing integer with an expirationTtl for both counters', async () => {
	const klucz = await kluczLimitu('kontakt', IP, SOL);
	const { kv, zapisy } = stubKV();
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), true);
	assert.equal(await podLimitem(kv, 'kontakt', IP, SOL, 5, 40), true);
	assert.deepEqual(zapisy, [
		{ key: klucz, value: '1', ttl: OKNO_S },
		{ key: KLUCZ_DOBOWY, value: '1', ttl: DOBA_S },
		{ key: klucz, value: '2', ttl: OKNO_S },
		{ key: KLUCZ_DOBOWY, value: '2', ttl: DOBA_S }
	]);
});

test('podLimitem stores only integers, never a submitted value or an IP', async () => {
	const { kv, magazyn } = stubKV();
	await podLimitem(kv, 'kontakt', IP, SOL, 5, 40);
	for (const [key, value] of magazyn) {
		assert.equal(key.includes(IP), false);
		assert.match(value, /^[0-9]+$/);
	}
});

test('podLimitem degrades to Turnstile-only protection when the KV binding is missing', async () => {
	assert.equal(await podLimitem(undefined, 'kontakt', IP, SOL, 5, 40), true);
});

// ---------------------------------------------------------------------------
// handle.ts: the full decision table, driven by stubs and no network
// ---------------------------------------------------------------------------

interface TestDane {
	email: string;
}

interface Slad {
	turnstile: number;
	limit: number;
	wysylki: number;
}

function zaleznosciTestowe(nadpisania: Partial<Zaleznosci<TestDane>> = {}): {
	zaleznosci: Zaleznosci<TestDane>;
	slad: Slad;
} {
	const slad: Slad = { turnstile: 0, limit: 0, wysylki: 0 };
	const zaleznosci: Zaleznosci<TestDane> = {
		waliduj: (dane) => {
			const email = (dane as { email?: unknown } | null)?.email;
			if (typeof email !== 'string' || email.length === 0) {
				return { ok: false, code: 'walidacja', pola: { email: 'brak' } };
			}
			return { ok: true, dane: { email } };
		},
		temat: 'Temat testowy',
		zbudujTresc: (dane) => `Tresc dla ${dane.email}`,
		replyTo: (dane) => dane.email,
		weryfikujTurnstile: async () => {
			slad.turnstile += 1;
			return true;
		},
		podLimitem: async () => {
			slad.limit += 1;
			return true;
		},
		wyslij: async () => {
			slad.wysylki += 1;
			return true;
		},
		...nadpisania
	};
	return { zaleznosci, slad };
}

const CIALO_OK = JSON.stringify({ email: 'jan@example.com', turnstile: 'token-testowy' });

test('obsluz returns ok true with status 200 when every stage succeeds', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const { wynik, status } = await obsluz(CIALO_OK, IP, zaleznosci);
	assert.deepEqual(wynik, { ok: true });
	assert.equal(status, 200);
	assert.equal(slad.wysylki, 1);
});

test('obsluz maps an unparseable body to code walidacja and never reaches the send', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const { wynik, status } = await obsluz('to nie jest json', IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.equal(status, STATUS_DLA_KODU.walidacja);
	assert.equal(slad.wysylki, 0);
});

test('obsluz answers a filled honeypot with 200 but skips the send entirely', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const cialo = JSON.stringify({
		email: 'jan@example.com',
		turnstile: 'token-testowy',
		strona: 'https://spam.example.com'
	});
	const { wynik, status } = await obsluz(cialo, IP, zaleznosci);
	assert.deepEqual(wynik, { ok: true });
	assert.equal(status, 200);
	assert.equal(slad.wysylki, 0);
	assert.equal(slad.turnstile, 0);
	assert.equal(slad.limit, 0);
});

test('obsluz ignores an empty honeypot field and proceeds normally', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const cialo = JSON.stringify({
		email: 'jan@example.com',
		turnstile: 'token-testowy',
		strona: ''
	});
	const { wynik, status } = await obsluz(cialo, IP, zaleznosci);
	assert.deepEqual(wynik, { ok: true });
	assert.equal(status, 200);
	assert.equal(slad.wysylki, 1);
});

test('obsluz maps a validation failure to 400 and passes the per-field keys through', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const { wynik, status } = await obsluz(JSON.stringify({ turnstile: 't' }), IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, { email: 'brak' });
	assert.equal(status, 400);
	assert.equal(slad.turnstile, 0);
	assert.equal(slad.wysylki, 0);
});

test('obsluz maps a missing consent to code zgoda and status 400', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe({
		waliduj: () => ({ ok: false, code: 'zgoda' })
	});
	const { wynik, status } = await obsluz(CIALO_OK, IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'zgoda');
	assert.equal(status, STATUS_DLA_KODU.zgoda);
	assert.equal(slad.wysylki, 0);
});

test('obsluz rejects a missing Turnstile token without calling siteverify', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe();
	const cialo = JSON.stringify({ email: 'jan@example.com' });
	const { wynik, status } = await obsluz(cialo, IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'turnstile');
	assert.equal(status, STATUS_DLA_KODU.turnstile);
	assert.equal(slad.turnstile, 0);
	assert.equal(slad.wysylki, 0);
});

test('obsluz maps a failed Turnstile verification to code turnstile and never touches the limiter', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe({
		weryfikujTurnstile: async () => false
	});
	const { wynik, status } = await obsluz(CIALO_OK, IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'turnstile');
	assert.equal(status, 400);
	assert.equal(slad.limit, 0);
	assert.equal(slad.wysylki, 0);
});

test('obsluz verifies Turnstile before it spends a KV write, so bots cannot drain the counter', async () => {
	const kolejnosc: string[] = [];
	const { zaleznosci } = zaleznosciTestowe({
		weryfikujTurnstile: async () => {
			kolejnosc.push('turnstile');
			return true;
		},
		podLimitem: async () => {
			kolejnosc.push('limit');
			return true;
		},
		wyslij: async () => {
			kolejnosc.push('wyslij');
			return true;
		}
	});
	await obsluz(CIALO_OK, IP, zaleznosci);
	assert.deepEqual(kolejnosc, ['turnstile', 'limit', 'wyslij']);
});

test('obsluz maps a rate-limit hit to code limit and status 429', async () => {
	const { zaleznosci, slad } = zaleznosciTestowe({ podLimitem: async () => false });
	const { wynik, status } = await obsluz(CIALO_OK, IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'limit');
	assert.equal(status, 429);
	assert.equal(slad.wysylki, 0);
});

test('obsluz maps a failed send to code wysylka and status 502, never to a false success', async () => {
	const { zaleznosci } = zaleznosciTestowe({ wyslij: async () => false });
	const { wynik, status } = await obsluz(CIALO_OK, IP, zaleznosci);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'wysylka');
	assert.equal(status, 502);
});

test('obsluz hands the send the static temat and the validated reply-to', async () => {
	const wywolania: { temat: string; tresc: string; replyTo: string }[] = [];
	const { zaleznosci } = zaleznosciTestowe({
		wyslij: async (temat, tresc, replyTo) => {
			wywolania.push({ temat, tresc, replyTo });
			return true;
		}
	});
	await obsluz(CIALO_OK, IP, zaleznosci);
	assert.deepEqual(wywolania, [
		{
			temat: 'Temat testowy',
			tresc: 'Tresc dla jan@example.com',
			replyTo: 'jan@example.com'
		}
	]);
});

// D-12: no branch may report a failure as a success. This is the assertion that
// keeps Playwright, monitoring and any future alerting honest.
test('obsluz never returns ok true or status 200 on any failure branch', async () => {
	const scenariusze: { nazwa: string; cialo: string; deps: Partial<Zaleznosci<TestDane>> }[] = [
		{ nazwa: 'unparseable body', cialo: 'nie json', deps: {} },
		{ nazwa: 'validation failure', cialo: JSON.stringify({ turnstile: 't' }), deps: {} },
		{
			nazwa: 'consent missing',
			cialo: CIALO_OK,
			deps: { waliduj: () => ({ ok: false, code: 'zgoda' }) }
		},
		{ nazwa: 'token missing', cialo: JSON.stringify({ email: 'jan@example.com' }), deps: {} },
		{ nazwa: 'turnstile failed', cialo: CIALO_OK, deps: { weryfikujTurnstile: async () => false } },
		{ nazwa: 'rate limited', cialo: CIALO_OK, deps: { podLimitem: async () => false } },
		{ nazwa: 'send failed', cialo: CIALO_OK, deps: { wyslij: async () => false } }
	];
	for (const { nazwa, cialo, deps } of scenariusze) {
		const { zaleznosci } = zaleznosciTestowe(deps);
		const { wynik, status } = await obsluz(cialo, IP, zaleznosci);
		assert.equal(wynik.ok, false, `expected ok false for: ${nazwa}`);
		assert.notEqual(status, 200, `expected a non-200 status for: ${nazwa}`);
		const code = wynik.ok ? null : wynik.code;
		assert.notEqual(code, null, `expected a machine code for: ${nazwa}`);
		assert.equal(
			status,
			code === null ? null : STATUS_DLA_KODU[code],
			`status must come from STATUS_DLA_KODU for: ${nazwa}`
		);
	}
});

// ---------------------------------------------------------------------------
// validate.ts + mailer.ts, zgłoszenie shape: D-02 minimal data and T-04-24, the
// child's name that is structurally impossible to submit
// ---------------------------------------------------------------------------

const BIEZACY_ROK = new Date().getUTCFullYear();

const ZGLOSZENIE_OK = {
	imie: 'Anna Kowalska',
	email: 'anna@example.com',
	miesiac: '3',
	rok: String(BIEZACY_ROK),
	zgoda: true
};

test('walidujZgloszenie returns code walidacja for a non-object input', () => {
	const wynik = walidujZgloszenie('nie obiekt');
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
});

test('walidujZgloszenie accepts the minimal body and returns only the whitelisted fields', () => {
	const wynik = walidujZgloszenie(ZGLOSZENIE_OK);
	assert.equal(wynik.ok, true);
	assert.deepEqual(wynik.ok ? wynik.dane : null, {
		imie: 'Anna Kowalska',
		email: 'anna@example.com',
		miesiac: 3,
		rok: BIEZACY_ROK
	});
});

test('walidujZgloszenie reports an absent month under the miesiac key as brak', () => {
	const { miesiac, ...bezMiesiaca } = ZGLOSZENIE_OK;
	assert.equal(miesiac, '3');
	const wynik = walidujZgloszenie(bezMiesiaca);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, { miesiac: 'brak' });
});

// The two off-by-one values on either side of the range. A month of 0 is what a
// mishandled zero-based index produces, and 13 is what a forged body sends.
for (const miesiac of ['0', '13', '-1', '3.5', '3abc']) {
	test(`walidujZgloszenie rejects the month value ${miesiac} as niepoprawny`, () => {
		const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, miesiac });
		assert.equal(wynik.ok, false);
		assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
		assert.deepEqual(wynik.ok ? null : wynik.pola, { miesiac: 'niepoprawny' });
	});
}

for (const miesiac of [1, 12]) {
	test(`walidujZgloszenie accepts the boundary month ${miesiac}`, () => {
		const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, miesiac });
		assert.equal(wynik.ok, true);
		assert.equal(wynik.ok ? wynik.dane.miesiac : null, miesiac);
	});
}

test('walidujZgloszenie accepts the current year', () => {
	const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, rok: BIEZACY_ROK });
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok ? wynik.dane.rok : null, BIEZACY_ROK);
});

for (const rok of [1926, 2226, BIEZACY_ROK - 7, BIEZACY_ROK + 3]) {
	test(`walidujZgloszenie rejects the out-of-window year ${rok}`, () => {
		const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, rok });
		assert.equal(wynik.ok, false);
		assert.deepEqual(wynik.ok ? null : wynik.pola, { rok: 'niepoprawny' });
	});
}

test('walidujZgloszenie treats an absent telefon as valid and leaves the field out', () => {
	const wynik = walidujZgloszenie(ZGLOSZENIE_OK);
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok ? 'telefon' in wynik.dane : null, false);
});

test('walidujZgloszenie treats an empty telefon string as an untouched control', () => {
	const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, telefon: '   ' });
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok ? 'telefon' in wynik.dane : null, false);
});

test('walidujZgloszenie keeps a well-formed telefon', () => {
	const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, telefon: ' +48 510 094 051 ' });
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok ? wynik.dane.telefon : null, '+48 510 094 051');
});

test('walidujZgloszenie reports a telefon carrying letters under the telefon key', () => {
	const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, telefon: '510 094 051 wew. 3' });
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, { telefon: 'niepoprawny' });
});

test('walidujZgloszenie treats an absent wiadomosc as valid and leaves the field out', () => {
	const wynik = walidujZgloszenie(ZGLOSZENIE_OK);
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok ? 'wiadomosc' in wynik.dane : null, false);
});

test('walidujZgloszenie reports an over-long wiadomosc as zbyt-dlugi', () => {
	const wynik = walidujZgloszenie({ ...ZGLOSZENIE_OK, wiadomosc: 'x'.repeat(2001) });
	assert.equal(wynik.ok, false);
	assert.deepEqual(wynik.ok ? null : wynik.pola, { wiadomosc: 'zbyt-dlugi' });
});

test('walidujZgloszenie returns code zgoda when the consent flag is absent', () => {
	const { zgoda, ...bezZgody } = ZGLOSZENIE_OK;
	assert.equal(zgoda, true);
	const wynik = walidujZgloszenie(bezZgody);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'zgoda');
});

test('walidujZgloszenie collects every field problem before it looks at consent', () => {
	const wynik = walidujZgloszenie({ imie: '', email: 'anna(at)example.com' });
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
	assert.deepEqual(wynik.ok ? null : wynik.pola, {
		imie: 'brak',
		email: 'niepoprawny',
		miesiac: 'brak',
		rok: 'brak'
	});
});

test('walidujZgloszenie rejects a header-injection e-mail, never repairs it (T-04-27)', () => {
	const wynik = walidujZgloszenie({
		...ZGLOSZENIE_OK,
		email: 'anna@example.com\r\nBcc: atakujacy@example.com'
	});
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok ? null : wynik.code, 'walidacja');
});

// T-04-24, the case that matters most. A forged body carrying a child's name is not
// rejected (that would tell an attacker what the shape is), it is simply dropped:
// the validated object has no key holding the value and the mail body cannot render
// what it does not have.
test('walidujZgloszenie ignores a child-name key entirely, in the object and in the mail body', () => {
	const wynik = walidujZgloszenie({
		...ZGLOSZENIE_OK,
		imie_dziecka: 'Zosia Kowalska',
		nazwisko_dziecka: 'Kowalska',
		dziecko: 'Zosia'
	});
	assert.equal(wynik.ok, true);
	const dane = wynik.ok ? wynik.dane : null;
	assert.notEqual(dane, null);
	assert.deepEqual(Object.keys(dane ?? {}).sort(), ['email', 'imie', 'miesiac', 'rok']);
	assert.equal(JSON.stringify(dane).includes('Zosia'), false);

	const tresc = zbudujTrescZgloszenie(
		dane ?? { imie: '', email: '', miesiac: 1, rok: BIEZACY_ROK },
		nazwaMiesiaca
	);
	assert.equal(tresc.includes('Zosia'), false);
	assert.equal(tresc.includes('Kowalska'), true, 'the PARENT surname must still be there');
});

test('zbudujTrescZgloszenie renders the parent data and the Polish month name', () => {
	const tresc = zbudujTrescZgloszenie(
		{
			imie: 'Anna Kowalska',
			email: 'anna@example.com',
			telefon: '+48 510 094 051',
			miesiac: 3,
			rok: 2026,
			wiadomosc: 'Pierwsza linia.\nDruga linia.'
		},
		nazwaMiesiaca
	);
	assert.equal(tresc.includes('Anna Kowalska'), true);
	assert.equal(tresc.includes('anna@example.com'), true);
	assert.equal(tresc.includes('+48 510 094 051'), true);
	assert.equal(tresc.includes('marzec 2026'), true);
	assert.equal(tresc.includes('Pierwsza linia.\nDruga linia.'), true);
});

// An empty label after "Telefon:" reads like a delivery bug. The explicit wording is
// how staff can tell a blank optional field from a broken message.
test('zbudujTrescZgloszenie renders explicit wording for an absent phone and an absent message', () => {
	const tresc = zbudujTrescZgloszenie(
		{ imie: 'Anna Kowalska', email: 'anna@example.com', miesiac: 5, rok: 2026 },
		nazwaMiesiaca
	);
	assert.match(tresc, /Telefon: nie podano/);
	assert.match(tresc, /Wiadomość:\nbrak wiadomości/);
	assert.equal(/Telefon:\s*$/m.test(tresc), false);
});

test('TEMAT_ZGLOSZENIE is a static constant, distinct from the contact subject', () => {
	assert.equal(typeof TEMAT_ZGLOSZENIE, 'string');
	assert.ok(TEMAT_ZGLOSZENIE.length > 0);
	assert.notEqual(TEMAT_ZGLOSZENIE, TEMAT_KONTAKT);
	const payload = zbudujPayload(TEMAT_ZGLOSZENIE, 'Tresc', 'anna@example.com');
	assert.equal(payload.subject, TEMAT_ZGLOSZENIE);
	assert.equal(payload.subject.includes('anna@example.com'), false);
	// The enrollment mail reuses the SAME sending identity: one definition for both
	// forms, so a recipient change is impossible to make in only one place (T-04-25).
	assert.equal(payload.from, FROM);
	assert.deepEqual(payload.to, [TO]);
	assert.deepEqual(payload.bcc, [BCC]);
});
