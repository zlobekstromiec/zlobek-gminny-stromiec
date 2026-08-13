// Reader-resilience unit test (WR-02 proof). Pins the type guards in
// src/lib/server/aktualnosci.ts so that removing either the typeof guard or the
// day-range check turns this suite red. Uses Node's built-in runner (no new
// dependency): `node --test` strips types natively on the pinned Node 22.23.2.
// Intentionally named *.unit.ts so Playwright's spec|test matcher never collects
// it. The compile-time PostEntry type is a deliberate lie here: these objects
// simulate malformed hand-edited on-disk JSON.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseData, postFromEntry } from '../src/lib/server/aktualnosci.ts';
import type { PostEntry } from '../src/lib/server/aktualnosci.ts';

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
