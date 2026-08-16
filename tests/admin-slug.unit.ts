// Slug and filename generator contract (Phase 04.1, Plan 04.1-06; D-14, SC3,
// 04.1-RESEARCH.md „Don't Hand-Roll" diacritic row and Pitfall 4).
//
// WHAT THIS FILE DEFENDS. The generated filename IS the public URL of an
// aktualność, forever: src/lib/server/aktualnosci.ts derives the slug from the
// on-disk filename and never from the fields, which is what makes „a title edit
// keeps the URL" true for free. A filename carrying a byte the Vite glob or a
// browser address bar treats differently is therefore not a cosmetic defect, it is
// a post nobody can reach.
//
// The nine Polish diacritics are asserted in BOTH cases, and the stroked l is
// asserted separately, because it is the one character `normalize('NFD')` leaves
// alone: it has no canonical decomposition, so an NFD-only implementation silently
// emits it unchanged and the strict character class below is the only thing that
// notices. That is the classic Polish slug bug and this suite exists mostly for it.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22. Named *.unit.ts so Playwright's spec|test matcher
// never collects it; the relative imports carry the `.ts` extension that stripping
// requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	KATALOG_WPISOW,
	MAKS_SLUGU,
	nazwaPlikuWpisu,
	slugAscii
} from '../src/lib/server/admin/slug.ts';

/** The ONLY shape a slug may ever take: lowercase ASCII letters and digits in
 *  groups separated by exactly one hyphen, with no leading and no trailing hyphen.
 *  An empty string is allowed as its own case and is asserted separately, because
 *  „the title was nothing but punctuation" is a real input and silently emitting a
 *  bare hyphen for it is the failure this class is written to catch. */
const KSZTALT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Every Polish diacritic, lower case then upper case, in the order a Polish
 *  keyboard produces them. Both cases matter: an implementation that lowercases
 *  BEFORE transliterating handles the small letters and drops the capitals. */
const DIAKRYTYKI: readonly [string, string][] = [
	['ą', 'a'],
	['ć', 'c'],
	['ę', 'e'],
	['ł', 'l'],
	['ń', 'n'],
	['ó', 'o'],
	['ś', 's'],
	['ź', 'z'],
	['ż', 'z'],
	['Ą', 'a'],
	['Ć', 'c'],
	['Ę', 'e'],
	['Ł', 'l'],
	['Ń', 'n'],
	['Ó', 'o'],
	['Ś', 's'],
	['Ź', 'z'],
	['Ż', 'z']
];

/** Real and hostile titles a staff member could plausibly type, plus a few nobody
 *  would type on purpose. Each is checked against the strict shape above rather
 *  than against a hand-written expected string, because an expected string proves
 *  one output and the character class proves the property. */
const TYTULY: readonly string[] = [
	'Wielkie otwarcie żłobka: 14 sierpnia!',
	'Witamy na nowej stronie żłobka',
	'Zażółć gęślą jaźń',
	'ŻÓŁTA ŁÓDŹ PŁYNIE',
	'Dzień otwarty  (zapraszamy!)',
	'„Cudze chwalicie, swego nie znacie”',
	'Nabór 2026/2027 - rusza 1 marca',
	'Plan dnia: 7:00–8:30 śniadanie',
	'   spacja z przodu i z tyłu   ',
	'---myślniki---dookoła---',
	'Zdjęcia z pikniku 🎈 w ogrodzie',
	'Ę',
	'2026'
];

test('kazdy z dziewieciu polskich znakow diakrytycznych zamienia sie na odpowiednik ASCII', () => {
	for (const [znak, oczekiwany] of DIAKRYTYKI) {
		assert.equal(slugAscii(znak), oczekiwany, `znak ${znak} nie zamienil sie na ${oczekiwany}`);
	}
	// Eighteen assertions above, nine letters in two cases. Asserted as a count too,
	// so shrinking the table is a visible edit rather than a quiet one.
	assert.equal(DIAKRYTYKI.length, 18);
});

// The stroked l gets its own case even though it is already in the table above,
// because it is the ONLY one an NFD-only implementation gets wrong, and a reader
// who deletes the explicit pass needs a failure that names the reason.
test('kreskowane l nie ma dekompozycji NFD i mimo to znika ze sluga (klasyczny blad)', () => {
	assert.equal(slugAscii('Łódź'), 'lodz');
	assert.equal(slugAscii('Biała Podlaska'), 'biala-podlaska');
	assert.equal(slugAscii('ŁŁŁ'), 'lll');
	// Proof that the pass is genuinely EXPLICIT and not a side effect of the
	// normalisation: the character really does survive NFD untouched.
	assert.equal('ł'.normalize('NFD'), 'ł');
	assert.equal('ł'.normalize('NFD').length, 1);
	// A control from the same alphabet that DOES decompose, so the case above cannot
	// pass merely because normalisation does nothing at all.
	assert.equal('ó'.normalize('NFD').length, 2);
});

test('slug ma zawsze scisly ksztalt: male litery, cyfry i pojedyncze lacznik', () => {
	for (const tytul of TYTULY) {
		const slug = slugAscii(tytul);
		assert.match(slug, KSZTALT, `tytul "${tytul}" dal slug "${slug}"`);
	}
});

test('slug nie zaczyna sie ani nie konczy lacznikiem, nawet gdy tytul zaczyna sie interpunkcja', () => {
	for (const tytul of ['---start---', '!!! uwaga !!!', '   ...żłobek...   ', '(2026)']) {
		const slug = slugAscii(tytul);
		assert.equal(slug.startsWith('-'), false, `slug "${slug}" zaczyna sie lacznikiem`);
		assert.equal(slug.endsWith('-'), false, `slug "${slug}" konczy sie lacznikiem`);
		assert.match(slug, KSZTALT);
	}
});

test('tytul zlozony wylacznie z interpunkcji daje pusty slug, a nie goly lacznik', () => {
	assert.equal(slugAscii('!!!'), '');
	assert.equal(slugAscii('   '), '');
	assert.equal(slugAscii('---'), '');
});

test('emoji i znaki spoza alfabetu lacinskiego nie przedostaja sie do sluga', () => {
	const slug = slugAscii('Zdjęcia z pikniku 🎈 w ogrodzie');
	assert.equal(/[^a-z0-9-]/.test(slug), false, `slug "${slug}" niesie znak spoza klasy`);
	assert.equal(slug, 'zdjecia-z-pikniku-w-ogrodzie');
});

test('slug jest przyciety do zadeklarowanego limitu i nadal konczy sie na znaku, nie na laczniku', () => {
	assert.ok(MAKS_SLUGU > 0);
	const dlugi = 'Bardzo długi tytuł wpisu o żłobku w Stromcu '.repeat(10);
	const slug = slugAscii(dlugi);
	assert.ok(slug.length <= MAKS_SLUGU, `slug ma ${slug.length} znakow, limit to ${MAKS_SLUGU}`);
	assert.match(slug, KSZTALT);
	// A custom cap is honoured too, so the constant is a default and not the only
	// reachable value.
	const krotki = slugAscii(dlugi, 12);
	assert.ok(krotki.length <= 12);
	assert.match(krotki, KSZTALT);
});

test('nazwa pliku laczy date ISO ze slugiem tytulu i konczy sie rozszerzeniem JSON', () => {
	assert.equal(
		nazwaPlikuWpisu('2026-08-14', 'Wielkie otwarcie żłobka: 14 sierpnia!'),
		'2026-08-14-wielkie-otwarcie-zlobka-14-sierpnia.json'
	);
	assert.equal(nazwaPlikuWpisu('2026-07-15', 'Łódź'), '2026-07-15-lodz.json');
});

// The filename becomes the URL, so a name ending in a hyphen would publish a post at
// /aktualnosci/2026-08-14- and nobody would notice until somebody tried to share it.
test('tytul bez liter i cyfr daje nazwe pliku z sama data, bez zawieszonego lacznika', () => {
	const nazwa = nazwaPlikuWpisu('2026-08-14', '!!!');
	assert.equal(nazwa, '2026-08-14.json');
	assert.equal(nazwa.includes('-.'), false);
});

test('cala nazwa pliku mieści sie w klasie znakow bezpiecznej dla adresu i dla globu Vite', () => {
	for (const tytul of TYTULY) {
		const nazwa = nazwaPlikuWpisu('2026-08-14', tytul);
		assert.match(nazwa, /^[a-z0-9-]+\.json$/, `nazwa "${nazwa}" wychodzi poza klase`);
		assert.equal(nazwa, nazwa.toLowerCase());
	}
});

// T-04.1-24. A slug is the only part of a written path a human supplies, so the
// class above is also the path-traversal defence. Asserted from the hostile side.
test('proba przemycenia sciezki w tytule nie tworzy sciezki (T-04.1-24)', () => {
	for (const tytul of ['../../etc/passwd', '..\\..\\windows', 'a/b/c', 'wpis.json']) {
		const nazwa = nazwaPlikuWpisu('2026-08-14', tytul);
		assert.equal(nazwa.includes('/'), false, `nazwa "${nazwa}" niesie ukosnik`);
		assert.equal(nazwa.includes('\\'), false, `nazwa "${nazwa}" niesie odwrotny ukosnik`);
		assert.equal(nazwa.includes('..'), false, `nazwa "${nazwa}" niesie dwie kropki`);
		assert.match(nazwa, /^[a-z0-9-]+\.json$/);
	}
});

test('katalog wpisow wskazuje na ten sam folder, ktory czyta publiczny czytnik', () => {
	assert.equal(KATALOG_WPISOW, 'src/lib/content/aktualnosci');
	assert.equal(KATALOG_WPISOW.endsWith('/'), false);
});
