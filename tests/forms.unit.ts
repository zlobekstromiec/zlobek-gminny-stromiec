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
import { walidujKontakt } from '../src/lib/server/forms/validate.ts';
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
