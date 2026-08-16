// The server half of the photo upload: what it accepts, what it refuses, and the ORDER in
// which it decides (Phase 04.1, Plan 04.1-07; D-12, D-14, P-19, P-20, Pitfall 4, threats
// T-04.1-10, T-04.1-11 and T-04.1-28).
//
// Two of the properties asserted here fail SILENTLY in production if they regress, which is
// why they are pinned by pairs rather than by single cases:
//
//  • the length cap is the whole free-tier CPU argument, and the case below builds a data
//    URL that is VALID and merely too long, paired with the same shape trimmed to exactly
//    the cap. Stated honestly, because it was checked rather than assumed: SWAPPING the cap
//    and the pattern is not observable from the outside, since both orderings still answer
//    null, so no assertion can catch that particular edit and the ordering rests on the
//    comment in the module and on the cheap-before-expensive discipline the whole panel
//    follows. REMOVING the cap is observable, and this case is what catches it (verified by
//    mutation, recorded in the plan SUMMARY).
//  • the generated basename landing inside the build glob is the difference between a post
//    with a picture and a post that silently renders the fallback tint. It is asserted
//    against the same extension set the three public consumers glob for, read out of this
//    file's own expectations rather than out of the implementation.
//
// Uses Node's built-in runner (no new dependency), named *.unit.ts so Playwright never
// collects it, with `.ts` extensions on the relative imports as type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	MAKS_BASE64,
	PROPORCJA_WPISU,
	base64ZDataUrl,
	zaDuzeZdjecie
} from '../src/lib/server/admin/obraz.ts';
import {
	KATALOG_UPLOADS,
	ROZSZERZENIE,
	bezpiecznaNazwaOkladki,
	nazwaOkladki,
	okladkaDoUsuniecia,
	sciezkaOkladki
} from '../src/lib/server/admin/uploads.ts';
import { nazwaPlikuWpisu, ROZSZERZENIE_WPISU } from '../src/lib/server/admin/slug.ts';
import { MAKS_DLUZSZY_BOK, TYPY_ZDJECIA } from '../src/lib/zdjecia.ts';

/** A short, structurally valid payload. The bytes are meaningless on purpose: nothing on
 *  the server ever looks at them, which is the property this whole module exists to keep. */
const PAYLOAD = 'AAECAwQFBgcICQoLDA0ODw==';

function dataUrl(typ: string, payload: string = PAYLOAD): string {
	return `data:${typ};base64,${payload}`;
}

// ---------------------------------------------------------------------------
// Behavior 1: the prefix is stripped and nothing else changes
// ---------------------------------------------------------------------------

test('poprawny data URL oddaje dokladnie swoj ladunek, znak w znak', () => {
	assert.equal(base64ZDataUrl(dataUrl('image/jpeg')), PAYLOAD);
});

test('kazdy z trzech dozwolonych typow przechodzi, i tylko one', () => {
	for (const typ of TYPY_ZDJECIA) {
		assert.equal(base64ZDataUrl(dataUrl(typ)), PAYLOAD, `${typ} zostal odrzucony`);
	}
	// The accepted set is exactly the one the native file input offers, so a control can
	// never propose a type the server then refuses.
	assert.deepEqual([...TYPY_ZDJECIA], ['image/jpeg', 'image/png', 'image/webp']);
});

test('ladunek z dopelnieniem i bez dopelnienia przechodzi tak samo', () => {
	assert.equal(base64ZDataUrl(dataUrl('image/png', 'QUJD')), 'QUJD');
	assert.equal(base64ZDataUrl(dataUrl('image/png', 'QUJDRA==')), 'QUJDRA==');
	assert.equal(base64ZDataUrl(dataUrl('image/png', 'QUJDREU=')), 'QUJDREU=');
});

// ---------------------------------------------------------------------------
// Behavior 2: the cap runs BEFORE the pattern (T-04.1-11)
// ---------------------------------------------------------------------------

test('napis dluzszy niz limit jest odrzucony, nawet gdy w ogole nie jest data URL', () => {
	const ogromny = 'a'.repeat(MAKS_BASE64 + 1);
	assert.equal(base64ZDataUrl(ogromny), null);
	// And the caller can tell WHY, which is what picks the Polish sentence the editor reads.
	assert.equal(zaDuzeZdjecie(ogromny), true);
});

// THE ORDERING CASE. A valid data URL over the cap, and the same shape just under it.
// Without the pair this would pass under either ordering and prove nothing.
test('poprawny data URL ponad limitem jest odrzucony PRZED dopasowaniem wzorca', () => {
	const naglowek = 'data:image/jpeg;base64,';
	const ponad = naglowek + 'A'.repeat(MAKS_BASE64 - naglowek.length + 8);
	assert.ok(ponad.length > MAKS_BASE64);
	assert.equal(base64ZDataUrl(ponad), null, 'ogromny, ale poprawny data URL zostal przyjety');
	assert.equal(zaDuzeZdjecie(ponad), true);

	// Positive control: the same value trimmed to the cap is accepted, so the case above
	// cannot pass by refusing everything long.
	const dokladnie = naglowek + 'A'.repeat(MAKS_BASE64 - naglowek.length);
	assert.equal(dokladnie.length, MAKS_BASE64);
	assert.equal(base64ZDataUrl(dokladnie)?.length, MAKS_BASE64 - naglowek.length);
	assert.equal(zaDuzeZdjecie(dokladnie), false);
});

test('limit jest liczba dodatnia z zapasem wzgledem tego, co wyspa naprawde produkuje', () => {
	assert.ok(Number.isInteger(MAKS_BASE64) && MAKS_BASE64 > 0);
	// The island targets 200 to 400 KB, which is about 540 thousand characters at the top of
	// that range once encoded. The cap must sit comfortably above it or ordinary photos
	// would start bouncing.
	assert.ok(MAKS_BASE64 > 600_000);
});

// ---------------------------------------------------------------------------
// Behavior 3: everything else is null (T-04.1-28)
// ---------------------------------------------------------------------------

test('niedozwolony typ, goly base64, brak wartosci i pusty napis daja null', () => {
	const odrzucane: unknown[] = [
		dataUrl('image/gif'),
		dataUrl('image/svg+xml'),
		dataUrl('image/avif'),
		dataUrl('text/html'),
		dataUrl('application/octet-stream'),
		// A bare payload with no prefix at all.
		PAYLOAD,
		// The prefix without the encoding marker: this shape carries percent-encoded text,
		// not bytes, and forwarding it verbatim would put something unreadable in the repo.
		'data:image/jpeg,AAA',
		// Smuggling attempts on both ends of the anchored pattern.
		` ${dataUrl('image/jpeg')}`,
		`${dataUrl('image/jpeg')} `,
		`${dataUrl('image/jpeg')}"`,
		`x${dataUrl('image/jpeg')}`,
		// A quotation mark inside the payload is the value that would break out of the blob
		// request body commit.ts assembles by concatenation.
		'data:image/jpeg;base64,AA"BB',
		'data:image/jpeg;base64,AA AA',
		'data:image/jpeg;base64,',
		'',
		'   ',
		null,
		undefined,
		42,
		{},
		[]
	];
	for (const wartosc of odrzucane) {
		assert.equal(base64ZDataUrl(wartosc), null, `przyjeto: ${String(wartosc).slice(0, 40)}`);
	}
	// None of those is „too large" either, so the editor gets the „choose a JPG, PNG or
	// WEBP" instruction rather than one telling them to shrink a file that is already tiny.
	assert.equal(zaDuzeZdjecie(dataUrl('image/gif')), false);
	assert.equal(zaDuzeZdjecie(null), false);
});

// ---------------------------------------------------------------------------
// Behavior 6: the generated basename lands inside the build glob (D-14, Pitfall 4)
// ---------------------------------------------------------------------------

/** The extension set the three public consumers glob for, written out here rather than
 *  imported, so this file checks the implementation instead of agreeing with it. */
const GLOB_ROZSZERZENIA = ['jpg', 'jpeg', 'png', 'webp'];

test('wygenerowana nazwa okladki jest mala litera, konczy sie na jpg i pasuje do globu', () => {
	const stemy = [
		'2026-08-20-dzien-otwarty',
		'2026-01-01',
		'2026-12-31-zazolc-gesla-jazn-i-lodz-srem-zagan'
	];
	for (const stem of stemy) {
		const nazwa = nazwaOkladki(stem);
		assert.equal(nazwa, nazwa.toLowerCase(), `${nazwa} nie jest w calosci mala litera`);
		assert.ok(nazwa.endsWith(ROZSZERZENIE));
		assert.ok(
			GLOB_ROZSZERZENIA.includes(nazwa.split('.').pop() ?? ''),
			`${nazwa} wypada poza glob budowania`
		);
		// The strict class: lowercase letters, digits and single hyphens, then one dot and
		// the extension. Nothing separator-shaped can be in it.
		assert.match(nazwa, /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z]+$/u);
	}
});

test('nazwa okladki jest nazwa pliku wpisu z inna koncowka, wiec para jest widoczna w katalogu', () => {
	const plik = nazwaPlikuWpisu('2026-08-20', 'Dzień otwarty w żłobku!');
	const stem = plik.slice(0, -ROZSZERZENIE_WPISU.length);
	assert.equal(nazwaOkladki(stem), `${stem}${ROZSZERZENIE}`);
	assert.equal(nazwaOkladki(stem), '2026-08-20-dzien-otwarty-w-zlobku.jpg');
	// P-19 in one assertion: the two files of one entry differ only in their extension.
	assert.equal(plik.slice(0, -ROZSZERZENIE_WPISU.length), nazwaOkladki(stem).slice(0, -4));
});

test('sciezka okladki zostaje w katalogu uploads i nigdzie indziej', () => {
	assert.equal(sciezkaOkladki('2026-08-20-piknik.jpg'), `${KATALOG_UPLOADS}/2026-08-20-piknik.jpg`);
	assert.equal(KATALOG_UPLOADS.endsWith('/'), false);
	assert.ok(KATALOG_UPLOADS.startsWith('src/lib/assets/'));
});

// T-04.1-10. The one value that arrives from a request and could otherwise reach a written
// path. Hostile inputs are driven through it in both directions.
test('nazwa okladki z zadania jest przyjmowana z listy dozwolonych, nie czyszczona (T-04.1-10)', () => {
	const wrogie: unknown[] = [
		'../../../etc/passwd',
		'..\\..\\windows\\system32',
		'a/b/c.jpg',
		'/etc/passwd.jpg',
		'..%2Fsekret.jpg',
		'.jpg',
		'..jpg',
		'ZDJECIE.JPG',
		'zdjecie.JPG',
		'zdjecie.avif',
		'zdjecie.svg',
		'zdjecie.php.jpg',
		'zdjęcie.jpg',
		'zdjecie .jpg',
		'zdjecie',
		'',
		null,
		undefined,
		7
	];
	for (const wartosc of wrogie) {
		assert.equal(
			bezpiecznaNazwaOkladki(wartosc),
			null,
			`przyjeto: ${String(wartosc).slice(0, 40)}`
		);
	}

	// Positive control, including both files that really sit in the uploads directory
	// today, so the guard cannot pass by refusing everything.
	for (const dobra of [
		'sala-zabaw.jpg',
		'plac-zabaw.jpg',
		'2026-08-20-dzien-otwarty.jpg',
		'2026-08-20-dzien-otwarty.jpeg',
		'2026-08-20-dzien-otwarty.png',
		'2026-08-20-dzien-otwarty.webp'
	]) {
		assert.equal(bezpiecznaNazwaOkladki(dobra), dobra);
	}
	// And every name the panel itself generates is admitted by the same guard, which is what
	// makes an edit of a panel-created entry able to keep its own cover.
	assert.equal(
		bezpiecznaNazwaOkladki(nazwaOkladki('2026-08-20-dzien-otwarty')),
		'2026-08-20-dzien-otwarty.jpg'
	);
});

// ---------------------------------------------------------------------------
// Which cover a deletion may take with it (P-18)
// ---------------------------------------------------------------------------

const SLUG = '2026-08-20-dzien-otwarty';
const OKLADKA = `${SLUG}.jpg`;
const W_BUDOWIE = new Set([OKLADKA, 'sala-zabaw.jpg', 'plac-zabaw.jpg']);

test('okladka wygenerowana dla tego wpisu i przez nikogo nieuzywana jest usuwana razem z nim', () => {
	assert.equal(okladkaDoUsuniecia(SLUG, OKLADKA, [], W_BUDOWIE), `${KATALOG_UPLOADS}/${OKLADKA}`);
});

test('nic nie jest usuwane, gdy wpis nie ma okladki albo jej nazwa nie jest jego wlasna', () => {
	// No cover at all.
	assert.equal(okladkaDoUsuniecia(SLUG, undefined, [], W_BUDOWIE), null);
	// A hand-set name that this entry's stem does not generate. BOTH seed images in this
	// repository are of exactly this kind, and both are rendered by the o nas page too, so a
	// rule that only asked „does another aktualność use it" would delete a picture a public
	// page needs.
	assert.equal(okladkaDoUsuniecia(SLUG, 'sala-zabaw.jpg', [], W_BUDOWIE), null);
	assert.equal(okladkaDoUsuniecia(SLUG, 'plac-zabaw.jpg', [], W_BUDOWIE), null);
	// Another entry's generated name.
	assert.equal(okladkaDoUsuniecia(SLUG, '2026-01-01-inny-wpis.jpg', [], W_BUDOWIE), null);
	// A hostile value, which cannot become a path however it is joined (T-04.1-10).
	assert.equal(okladkaDoUsuniecia(SLUG, '../../../etc/passwd', [], W_BUDOWIE), null);
});

test('okladka, na ktora wskazuje inny wpis, zostaje na miejscu', () => {
	assert.equal(okladkaDoUsuniecia(SLUG, OKLADKA, [OKLADKA], W_BUDOWIE), null);
	// Including a stored value that kept a path in front of the same basename.
	assert.equal(
		okladkaDoUsuniecia(SLUG, OKLADKA, [`src/lib/assets/uploads/${OKLADKA}`], W_BUDOWIE),
		null
	);
	// Positive control: other entries with other covers, or none, do not protect it.
	assert.equal(
		okladkaDoUsuniecia(SLUG, OKLADKA, [undefined, 'sala-zabaw.jpg'], W_BUDOWIE),
		`${KATALOG_UPLOADS}/${OKLADKA}`
	);
});

test('plik spoza ostatniej budowy nie jest usuwany, bo nie ma czego usuwac', () => {
	// The panel reads the LAST BUILD, so a cover committed a minute ago is not visible to it
	// yet. Being out of date in this direction is safe: it means „delete nothing", never
	// „delete something else". Asking git to remove a path that is not there would fail the
	// whole atomic save and turn a successful deletion into an error panel.
	assert.equal(okladkaDoUsuniecia(SLUG, OKLADKA, [], new Set()), null);
});

// ---------------------------------------------------------------------------
// The crop numbers the island and the server share
// ---------------------------------------------------------------------------

test('proporcja wpisu jest ta sama, ktora karta wpisu rezerwuje', () => {
	assert.equal(PROPORCJA_WPISU, 16 / 9);
	assert.ok(MAKS_DLUZSZY_BOK >= 1200 && MAKS_DLUZSZY_BOK <= 2000);
});
