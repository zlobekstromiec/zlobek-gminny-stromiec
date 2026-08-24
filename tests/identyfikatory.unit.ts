// How NIP and REGON are written (src/lib/identyfikatory.ts).
//
// The point of interest here is NOT that ten digits get three hyphens. It is the REFUSAL
// path: both functions hand back the original string untouched when they cannot format it,
// rather than emitting something that looks official and is wrong. On a public body's site
// a plausible-but-wrong identifier is worse than an obviously raw one, because a parent
// copies it into a ZUS form without a second look.
//
// Uses Node's built-in runner. Named *.unit.ts so Playwright's spec matcher never collects
// it, with `.ts` on the relative imports as type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nipDoWyswietlenia, regonDoWyswietlenia } from '../src/lib/identyfikatory.ts';
import { contact } from '../src/lib/content/site.ts';

test('NIP z dziesieciu cyfr dostaje grupowanie 000-000-00-00', () => {
	assert.equal(nipDoWyswietlenia('7981489629'), '798-148-96-29');
});

// Idempotent: a store that ever holds a pre-grouped value formats to the same string, so
// the two shapes can never render differently on the two surfaces.
test('NIP juz pogrupowany formatuje sie do tej samej wartosci', () => {
	assert.equal(nipDoWyswietlenia('798-148-96-29'), '798-148-96-29');
});

test('NIP ze spacjami tez, bo liczy sie tylko ciag cyfr', () => {
	assert.equal(nipDoWyswietlenia('798 148 96 29'), '798-148-96-29');
});

// THE REFUSAL. A nine-digit value grouped as if it were a NIP would read as a real number
// with a typo. Unchanged is the honest answer.
for (const zly of ['', '798148962', '79814896291', 'brak', '798-148-96']) {
	test(`NIP o zlej dlugosci wraca bez zmian: ${JSON.stringify(zly)}`, () => {
		assert.equal(nipDoWyswietlenia(zly), zly);
	});
}

test('REGON dziewieciocyfrowy wraca jako same cyfry', () => {
	assert.equal(regonDoWyswietlenia('123456785'), '123456785');
});

test('REGON czternastocyfrowy (jednostka lokalna) tez jest legalna dlugoscia', () => {
	assert.equal(regonDoWyswietlenia('12345678512347'), '12345678512347');
});

test('REGON z separatorami traci je, bo REGON pisze sie ciagiem', () => {
	assert.equal(regonDoWyswietlenia('123-456-785'), '123456785');
});

for (const zly of ['', '1234567', '1234567890', 'nieprzyznany']) {
	test(`REGON o zlej dlugosci wraca bez zmian: ${JSON.stringify(zly)}`, () => {
		assert.equal(regonDoWyswietlenia(zly), zly);
	});
}

// The stored value is the one that ships, so it is the one worth asserting against. Reads
// the real module rather than a copy: a NIP corrected in site.ts and not here would
// otherwise leave this suite green while the site showed something else.
test('NIP w sklepie jest realnie formatowalny, nie tylko obecny', () => {
	const wyswietlany = nipDoWyswietlenia(contact.nip);
	assert.notEqual(wyswietlany, contact.nip, 'NIP ze sklepu nie dal sie sformatowac');
	assert.match(wyswietlany, /^\d{3}-\d{3}-\d{2}-\d{2}$/);
});

// The launch-gate obligation, stated as an assertion rather than left in a comment: while
// the REGON is unknown it must be the EMPTY string, because both surfaces test that field
// for truthiness to decide whether to render the line at all. A whitespace string or a
// „brak" would render a bogus row on every page of the site.
// Widened to `string` on purpose. `contact` is declared `as const`, so the compiler knows
// this field is the literal type `''` today and narrows the populated branch to `never`,
// which makes the assertion below unreachable code that does not compile. The branch is
// not dead in any meaningful sense, it is the whole point: it is what checks the value on
// the day the żłobek supplies one. Annotating the local keeps the check compiling now and
// meaningful later, and it costs nothing, because the runtime value is unchanged.
test('REGON jest pusty albo prawdziwy, nigdy tekstem zastepczym', () => {
	const regon: string = contact.regon;
	assert.equal(typeof regon, 'string');
	if (regon === '') return;
	assert.equal(
		regonDoWyswietlenia(regon),
		regon.replace(/\D/g, ''),
		'REGON w sklepie ma nielegalna dlugosc'
	);
});
