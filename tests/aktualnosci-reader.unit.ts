// Reader-resilience unit test (WR-02 proof). Pins the type guards in
// src/lib/server/aktualnosci.ts so that removing either the typeof guard or the
// day-range check turns this suite red. Uses Node's built-in runner (no new
// dependency): `node --test` strips types natively on the pinned Node 22.23.2.
// Intentionally named *.unit.ts so Playwright's spec|test matcher never collects
// it. The compile-time PostEntry type is a deliberate lie here: these objects
// simulate malformed hand-edited on-disk JSON.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	MAKS_ZDJEC_WPISU,
	parseData,
	postFromEntry,
	readZdjecia
} from '../src/lib/server/aktualnosci.ts';
import type { PostEntry } from '../src/lib/server/aktualnosci.ts';
import { renderPost } from '../src/lib/markdown.ts';

// The exact key set a returned post may expose, pre-sorted. This is a key-set
// equality on purpose: it is the durable proof that postFromEntry CONSTRUCTS its
// result from guarded locals. Reintroducing an object-spread of the raw on-disk
// entry leaks unknown keys and turns this red (T-03-07-03).
const EXPECTED_POST_KEYS = [
	'data',
	'dataDisplay',
	'excerpt',
	'href',
	'iso',
	'obraz',
	'obraz_alt',
	'placeholder',
	'slug',
	'tresc',
	'tytul',
	'zajawka',
	'zdjecia'
];

/** Call the reader with a deliberately malformed value. The compile-time
 *  PostEntry type is a lie for hand-edited git content, so the cast keeps the
 *  existing suite idiom without weakening any assertion. */
function readEntry(path: string, entry: unknown): ReturnType<typeof postFromEntry> {
	return postFromEntry(path, entry as PostEntry);
}

test('parseData returns null for a non-string argument (undefined)', () => {
	assert.equal(parseData(undefined), null);
});

test('parseData returns null for a number', () => {
	assert.equal(parseData(42), null);
});

test('parseData returns null for an object', () => {
	assert.equal(parseData({}), null);
});

test('parseData rejects an out-of-range month', () => {
	assert.equal(parseData('2026-13-01'), null);
});

test('parseData rejects an out-of-range day', () => {
	assert.equal(parseData('2026-05-45'), null);
});

test('parseData maps a valid ISO date to iso plus Polish genitive display', () => {
	assert.deepEqual(parseData('2026-08-01'), {
		iso: '2026-08-01',
		display: '1 sierpnia 2026'
	});
});

const validEntry: PostEntry = {
	tytul: 'Wielkie otwarcie',
	data: '2026-08-01',
	tresc: 'Pierwszy akapit.\n\nDrugi akapit.'
};

test('postFromEntry maps a valid entry to a post with slug from the path basename', () => {
	const post = postFromEntry(
		'/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie.json',
		validEntry
	);
	assert.notEqual(post, null);
	assert.equal(post?.slug, '2026-08-01-wielkie-otwarcie');
	assert.equal(post?.iso, '2026-08-01');
});

test('postFromEntry returns null without throwing when data is missing', () => {
	const broken = { tytul: 'Bez daty', tresc: 'Treść.' } as unknown as PostEntry;
	let result: ReturnType<typeof postFromEntry> = null;
	assert.doesNotThrow(() => {
		result = postFromEntry('/lib/content/aktualnosci/bez-daty.json', broken);
	});
	assert.equal(result, null);
});

test('postFromEntry returns null when both tresc and zajawka are missing', () => {
	const broken = { tytul: 'Bez tresci', data: '2026-08-01' } as unknown as PostEntry;
	assert.equal(postFromEntry('/lib/content/aktualnosci/bez-tresci.json', broken), null);
});

test('postFromEntry derives the excerpt from the first paragraph of tresc when zajawka is absent', () => {
	const post = postFromEntry(
		'/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie.json',
		validEntry
	);
	assert.equal(post?.excerpt, 'Pierwszy akapit.');
});

// Residual WR-02 shapes. A present zajawka used to skip the tresc guard entirely
// and the return statement spread the raw entry, so tresc and obraz reached the
// prerender unvalidated.

test('postFromEntry returns null when zajawka is present but tresc is missing', () => {
	const broken = { tytul: 'Bez tresci', data: '2026-08-01', zajawka: 'Krotki opis' };
	assert.equal(readEntry('/lib/content/aktualnosci/bez-tresci-z-zajawka.json', broken), null);
});

test('postFromEntry returns null when tytul is missing', () => {
	const broken = { data: '2026-08-01', tresc: 'Tresc bez tytulu.' };
	assert.equal(readEntry('/lib/content/aktualnosci/bez-tytulu.json', broken), null);
});

test('postFromEntry degrades a non-string obraz to undefined', () => {
	const post = readEntry('/lib/content/aktualnosci/zly-obraz.json', { ...validEntry, obraz: 42 });
	assert.notEqual(post, null);
	assert.equal(post?.obraz, undefined);
});

test('postFromEntry degrades a non-string obraz_alt to undefined', () => {
	const post = readEntry('/lib/content/aktualnosci/zly-opis-obrazu.json', {
		...validEntry,
		obraz_alt: 7
	});
	assert.notEqual(post, null);
	assert.equal(post?.obraz_alt, undefined);
});

test('postFromEntry returns null without throwing when the entry is null', () => {
	let result: ReturnType<typeof postFromEntry> = null;
	assert.doesNotThrow(() => {
		result = readEntry('/lib/content/aktualnosci/pusty-wpis.json', null);
	});
	assert.equal(result, null);
});

test('postFromEntry returns null without throwing when the entry is a bare string', () => {
	let result: ReturnType<typeof postFromEntry> = null;
	assert.doesNotThrow(() => {
		result = readEntry('/lib/content/aktualnosci/nie-obiekt.json', 'nie obiekt');
	});
	assert.equal(result, null);
});

test('postFromEntry exposes exactly the known post keys and drops unknown source fields', () => {
	const post = readEntry('/lib/content/aktualnosci/dodatkowe-pole.json', {
		...validEntry,
		nieznanePole: 'wartosc'
	});
	assert.notEqual(post, null);
	assert.deepEqual(Object.keys(post ?? {}).sort(), EXPECTED_POST_KEYS);
});

// Consumer contract: whatever survives the reader must be safe for the two call
// sites that crash today, renderPost(post.tresc) during the entries()-driven
// prerender and the cover basename split in NewsCard.svelte / [slug]/+page.svelte.
const MALFORMED_SHAPES: { nazwa: string; entry: unknown }[] = [
	{ nazwa: 'tresc missing', entry: { tytul: 'Bez tresci', data: '2026-08-01' } },
	{
		nazwa: 'tresc as a number',
		entry: { tytul: 'Liczbowa tresc', data: '2026-08-01', tresc: 42 }
	},
	{
		nazwa: 'zajawka present without tresc',
		entry: { tytul: 'Tylko zajawka', data: '2026-08-01', zajawka: 'Krotki opis' }
	},
	{ nazwa: 'obraz as a number', entry: { ...validEntry, obraz: 42 } },
	{ nazwa: 'obraz as an object', entry: { ...validEntry, obraz: { plik: 'zdjecie.jpg' } } },
	{ nazwa: 'data missing', entry: { tytul: 'Bez daty', tresc: 'Tresc.' } },
	{ nazwa: 'entry is null', entry: null },
	{ nazwa: 'entry is an array', entry: [] },
	{ nazwa: 'entry is a number', entry: 7 }
];

for (const { nazwa, entry } of MALFORMED_SHAPES) {
	test(`postFromEntry hands consumers a safe post or null for: ${nazwa}`, () => {
		let post: ReturnType<typeof postFromEntry> = null;
		let thrown: unknown = null;
		try {
			post = readEntry('/lib/content/aktualnosci/tabela-ksztaltow.json', entry);
		} catch (error) {
			thrown = error;
		}
		assert.equal(thrown, null, `postFromEntry threw for shape: ${nazwa}`);
		if (post === null) return;
		const survivor = post;
		let html = '';
		assert.doesNotThrow(() => {
			html = renderPost(survivor.tresc);
		}, `renderPost threw for shape: ${nazwa}`);
		assert.ok(html.length > 0, `renderPost produced no HTML for shape: ${nazwa}`);
		assert.doesNotThrow(() => {
			if (survivor.obraz) survivor.obraz.split('/').pop();
		}, `cover basename split threw for shape: ${nazwa}`);
	});
}

// ── Post gallery (`zdjecia`) ──────────────────────────────────────────────────
// The array is authored by hand in a pull request, never by a bounded form, so every
// shape below is genuinely reachable on disk. The contract these pin is: never throw,
// never emit a partial photo, never exceed the cap, and always hand back an array.

const ZDJECIE_OK = {
	plik: 'otwarcie-poswiecenie.jpg',
	podpis: 'Poświęcenie',
	alt: 'Ksiądz przy mównicy'
};

test('readZdjecia keeps a whole photo and constructs it key by key', () => {
	const wynik = readZdjecia([{ ...ZDJECIE_OK, nieznane: 'kasowane' }]);
	assert.equal(wynik.length, 1);
	// Key-set equality, same reason as EXPECTED_POST_KEYS above: an unknown key surviving
	// means someone reintroduced a spread.
	assert.deepEqual(Object.keys(wynik[0]).sort(), ['alt', 'plik', 'podpis']);
});

// Each of the three fields is required, so a photo missing any one is dropped whole
// rather than rendered unlabelled (WCAG 1.1.1 on a public body's site).
for (const brak of ['plik', 'podpis', 'alt']) {
	test(`readZdjecia drops a photo missing ${brak}`, () => {
		const niepelne: Record<string, unknown> = { ...ZDJECIE_OK };
		delete niepelne[brak];
		assert.deepEqual(readZdjecia([niepelne]), []);
	});

	test(`readZdjecia drops a photo whose ${brak} is blank`, () => {
		assert.deepEqual(readZdjecia([{ ...ZDJECIE_OK, [brak]: '   ' }]), []);
	});
}

test('readZdjecia keeps the good photos and drops only the bad one', () => {
	const drugie = {
		plik: 'otwarcie-przemowienie-maskotka.jpg',
		podpis: 'Przemówienie',
		alt: 'Przemówienie przy mównicy'
	};
	assert.deepEqual(readZdjecia([ZDJECIE_OK, { plik: 'x.jpg' }, drugie]), [ZDJECIE_OK, drugie]);
});

test('readZdjecia caps the gallery', () => {
	const nadmiar = Array.from({ length: MAKS_ZDJEC_WPISU + 5 }, (_, i) => ({
		...ZDJECIE_OK,
		podpis: `Zdjęcie ${i}`
	}));
	assert.equal(readZdjecia(nadmiar).length, MAKS_ZDJEC_WPISU);
});

// Anything that is not an array yields an empty gallery rather than a throw: this content
// is hand edited and partially committed, and one bad value must not abort the prerender.
for (const { nazwa, wartosc } of [
	{ nazwa: 'undefined', wartosc: undefined },
	{ nazwa: 'null', wartosc: null },
	{ nazwa: 'a string', wartosc: 'otwarcie.jpg' },
	{ nazwa: 'a number', wartosc: 7 },
	{ nazwa: 'an object', wartosc: { plik: 'otwarcie.jpg' } },
	{ nazwa: 'an array of nulls', wartosc: [null, null] },
	{ nazwa: 'an array of arrays', wartosc: [[], []] },
	{ nazwa: 'an array of strings', wartosc: ['a.jpg'] }
]) {
	test(`readZdjecia returns an empty array, without throwing, for: ${nazwa}`, () => {
		let wynik: unknown = null;
		assert.doesNotThrow(() => {
			wynik = readZdjecia(wartosc);
		});
		assert.deepEqual(wynik, []);
	});
}

test('postFromEntry always exposes zdjecia as an array, even when the key is absent', () => {
	const post = readEntry('/lib/content/aktualnosci/2026-01-01-bez-galerii.json', {
		tytul: 'Bez galerii',
		data: '2026-01-01',
		tresc: 'Treść wpisu.'
	});
	assert.ok(post !== null);
	assert.deepEqual(post.zdjecia, []);
});

test('postFromEntry carries a valid gallery through', () => {
	const post = readEntry('/lib/content/aktualnosci/2026-01-01-z-galeria.json', {
		tytul: 'Z galerią',
		data: '2026-01-01',
		tresc: 'Treść wpisu.',
		zdjecia: [ZDJECIE_OK]
	});
	assert.ok(post !== null);
	assert.deepEqual(post.zdjecia, [ZDJECIE_OK]);
});
