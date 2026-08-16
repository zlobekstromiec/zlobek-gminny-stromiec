// Panel session unit test (Phase 04.1, Plan 04.1-01). These are the executable
// acceptance criteria for SC1: a forged, tampered, expired or de-allowlisted
// session cookie must not open the panel, and the derived editor handle must
// never carry a full address. Uses Node's built-in runner (no new dependency):
// `node --test` strips types natively on the pinned Node 22.23.2. Intentionally
// named *.unit.ts so Playwright's spec|test matcher never collects it. Every
// module under test is pure apart from crypto.subtle, so nothing here touches
// the network or KV.
//
// The clock is injected as an explicit argument in every case, so no assertion
// below reads a second clock and no case can pass because of when it ran.
//
// Do NOT weaken these assertions to make the suite pass. They are the proof of
// threats T-04.1-01, T-04.1-02 and T-04.1-07 in 04.1-01-PLAN.md and change only
// in lockstep with them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	NAZWA_CIASTKA,
	PROG_ODNOWIENIA_S,
	ZYCIE_SESJI_S,
	podpiszSesje,
	weryfikujSesje,
	wymagaOdnowienia
} from '../src/lib/server/admin/sesja.ts';
import { MAKS_UCHWYTU, naLiscie, uchwytZAdresu } from '../src/lib/server/admin/allowlist.ts';

/** Frozen clock in milliseconds, matching the ratelimit.ts convention: `teraz` is
 *  always an epoch millisecond value handed in by the caller. */
const TERAZ = Date.UTC(2026, 7, 16, 9, 0, 0);
const SEKRET = 'lokalny-sekret-testowy-panelu';
const INNY_SEKRET = 'zupelnie-inny-sekret-panelu';
const ADRES = 'redaktor@example.test';
const UCHWYT = 'redaktor';

/** Change exactly one character of a base64url segment to a different base64url
 *  character, so the tampering is realistic rather than a decoding accident. */
function przekrec(segment: string): string {
	const zamiennik = segment[0] === 'A' ? 'B' : 'A';
	return zamiennik + segment.slice(1);
}

// ---------------------------------------------------------------------------
// sesja.ts: the only thing standing between a cookie jar and the panel
// ---------------------------------------------------------------------------

test('nazwa ciastka ma prefiks __Host-, ktory wymusza Secure i Path=/ (P-01)', () => {
	assert.ok(NAZWA_CIASTKA.startsWith('__Host-'));
});

test('prog odnowienia jest krotszy niz zycie sesji (P-02)', () => {
	assert.ok(PROG_ODNOWIENIA_S > 0);
	assert.ok(PROG_ODNOWIENIA_S < ZYCIE_SESJI_S);
});

test('sesja podpisana sekretem weryfikuje sie tym samym sekretem', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	const sesja = await weryfikujSesje(SEKRET, token, TERAZ);
	assert.ok(sesja);
	assert.equal(sesja.adres, ADRES);
	assert.equal(sesja.uchwyt, UCHWYT);
	assert.equal(sesja.iat, Math.floor(TERAZ / 1000));
	assert.equal(sesja.exp, Math.floor(TERAZ / 1000) + ZYCIE_SESJI_S);
});

test('sesja podpisana innym sekretem nie weryfikuje sie', async () => {
	const token = await podpiszSesje(INNY_SEKRET, ADRES, UCHWYT, TERAZ);
	assert.equal(await weryfikujSesje(SEKRET, token, TERAZ), null);
});

test('zmiana jednego znaku w czesci z danymi uniewaznia sesje', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	const [dane, podpis] = token.split('.');
	assert.equal(await weryfikujSesje(SEKRET, `${przekrec(dane)}.${podpis}`, TERAZ), null);
});

test('zmiana jednego znaku w podpisie uniewaznia sesje', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	const [dane, podpis] = token.split('.');
	assert.equal(await weryfikujSesje(SEKRET, `${dane}.${przekrec(podpis)}`, TERAZ), null);
});

test('sesja z przekroczonym czasem waznosci nie weryfikuje sie mimo poprawnego podpisu', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	// Sanity: the very same token is valid one second before the expiry.
	assert.ok(await weryfikujSesje(SEKRET, token, TERAZ + (ZYCIE_SESJI_S - 1) * 1000));
	assert.equal(await weryfikujSesje(SEKRET, token, TERAZ + (ZYCIE_SESJI_S + 1) * 1000), null);
});

// A malformed cookie is attacker-controlled input like any other. Each of these
// would throw rather than return null if the parser trusted its own shape.
const NIEPOPRAWNE: [string, unknown][] = [
	['wartosc bez separatora', 'brak-separatora'],
	['pusty ciag znakow', ''],
	['sam separator', '.'],
	['pusta czesc z danymi', '.cGRvcGlz'],
	['pusty podpis', 'ZGFuZQ.'],
	['trzy segmenty zamiast dwoch', 'a.b.c'],
	['wartosc nie bedaca ciagiem znakow', 42],
	['wartosc undefined', undefined],
	['wartosc null', null],
	['obiekt zamiast ciagu znakow', { adres: ADRES }]
];

for (const [opis, wartosc] of NIEPOPRAWNE) {
	test(`weryfikacja zwraca null, a nie wyjatek, dla przypadku: ${opis}`, async () => {
		assert.equal(await weryfikujSesje(SEKRET, wartosc, TERAZ), null);
	});
}

test('weryfikacja zwraca null, gdy sekret jest pusty lub nieustawiony (zamkniecie awaryjne)', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	assert.equal(await weryfikujSesje(undefined, token, TERAZ), null);
	assert.equal(await weryfikujSesje('', token, TERAZ), null);
	assert.equal(await weryfikujSesje('   ', token, TERAZ), null);
});

test('odnowienie nie jest wymagane zaraz po wydaniu sesji (P-02)', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	const sesja = await weryfikujSesje(SEKRET, token, TERAZ);
	assert.ok(sesja);
	assert.equal(wymagaOdnowienia(sesja, TERAZ), false);
	assert.equal(wymagaOdnowienia(sesja, TERAZ + (PROG_ODNOWIENIA_S - 1) * 1000), false);
});

test('odnowienie jest wymagane po uplywie progu z zycia sesji (P-02)', async () => {
	const token = await podpiszSesje(SEKRET, ADRES, UCHWYT, TERAZ);
	const sesja = await weryfikujSesje(SEKRET, token, TERAZ);
	assert.ok(sesja);
	assert.equal(wymagaOdnowienia(sesja, TERAZ + (PROG_ODNOWIENIA_S + 1) * 1000), true);
});

// ---------------------------------------------------------------------------
// allowlist.ts: the re-check that makes a stateless cookie revocable
// ---------------------------------------------------------------------------

test('lista dostepu dopasowuje adres bez wzgledu na wielkosc liter', () => {
	assert.equal(naLiscie('REDAKTOR@Example.Test', ADRES), true);
	assert.equal(naLiscie(ADRES, 'Redaktor@EXAMPLE.test'), true);
});

test('lista dostepu przycina biale znaki po obu stronach', () => {
	assert.equal(naLiscie('  redaktor@example.test  ', ADRES), true);
});

test('lista dostepu toleruje spacje wokol przecinkow i pusty element na koncu', () => {
	assert.equal(naLiscie(ADRES, ' inna@example.test , redaktor@example.test , '), true);
	assert.equal(naLiscie(ADRES, `${ADRES},`), true);
});

test('lista dostepu odrzuca adres, ktorego na niej nie ma', () => {
	assert.equal(naLiscie('obcy@example.test', `${ADRES},inna@example.test`), false);
});

// Fail closed: an unset, empty or whitespace-only secret must grant nobody access.
// This is the opposite direction to the deliberate fail-open degrade in ratelimit.ts.
test('lista dostepu odmawia wszystkim, gdy sekret jest nieustawiony lub pusty', () => {
	assert.equal(naLiscie(ADRES, undefined), false);
	assert.equal(naLiscie(ADRES, ''), false);
	assert.equal(naLiscie(ADRES, '   '), false);
	assert.equal(naLiscie(ADRES, ',,, ,'), false);
});

test('pusty adres nie dopasowuje sie do pustego elementu listy', () => {
	assert.equal(naLiscie('', `${ADRES},,inna@example.test`), false);
	assert.equal(naLiscie('   ', `${ADRES},,inna@example.test`), false);
});

test('uchwyt to czesc adresu przed malpa, zapisana malymi literami', () => {
	assert.equal(uchwytZAdresu('Anna.Kowalska@example.test'), 'anna.kowalska');
});

test('uchwyt pomija znaki spoza ASCII, w tym polskie znaki diakrytyczne', () => {
	assert.equal(uchwytZAdresu('Żaneta.Ćwik@example.test'), 'aneta.wik');
});

test(`uchwyt nigdy nie przekracza ${MAKS_UCHWYTU} znakow`, () => {
	const dlugi = `${'a'.repeat(MAKS_UCHWYTU + 20)}@example.test`;
	assert.equal(uchwytZAdresu(dlugi).length, MAKS_UCHWYTU);
});

// D-04: the handle goes into commit messages and the panel header, so an at sign
// escaping into it would publish a staff address in a public repository.
const ADRESY_UCHWYTU = [
	'Anna.Kowalska@example.test',
	'redaktor@example.test',
	'Żaneta.Ćwik@example.test',
	'a@b@c@example.test',
	'bez-malpy',
	'@example.test',
	''
];

for (const wejscie of ADRESY_UCHWYTU) {
	test(`uchwyt nie zawiera malpy ani znakow spoza dozwolonego zbioru dla wejscia "${wejscie}"`, () => {
		const uchwyt = uchwytZAdresu(wejscie);
		assert.ok(!uchwyt.includes('@'));
		assert.match(uchwyt, /^[a-z0-9._-]*$/);
		assert.ok(uchwyt.length <= MAKS_UCHWYTU);
	});
}
