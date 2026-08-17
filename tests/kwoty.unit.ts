// Amount-formatter unit suite (FEE-5, 05 D-35). The formatter in src/lib/kwoty.ts
// exists because Intl does not produce the bytes this site already ships, and both
// facts below were MEASURED on this working tree's runtime (Node v25.9.0, 2026-08-17)
// rather than assumed:
//
//   new Intl.NumberFormat('pl-PL').format(1500)                          -> "1500"
//   new Intl.NumberFormat('pl-PL', { useGrouping: 'always' }).format(1500)
//                                                -> "1 500", separator U+00A0
//
// The first is CLDR pl setting minimumGroupingDigits to 2, so the entire four-digit
// band, which is exactly where both fee figures sit, silently loses its separator and
// the shipped „1 500 zł" becomes „1500 zł". The second is not the fix it looks like:
// it groups, but with a non-breaking space where the shipped OPLATY.kwota carries an
// ASCII space, and that one-codepoint swap is invisible in a diff and in a failure
// message. Neither is usable, hence a hand-rolled grouper pinned here by codepoint.
//
// Built-in runner, no new dependency. Named *.unit.ts so Playwright's spec|test
// matcher never collects it. Imports are relative with an explicit .ts extension
// because bare `node --test` does not resolve the $lib alias (the convention recorded
// at src/lib/server/admin/walidacja/nabor.ts:13-15).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grupujTysiace, zlote } from '../src/lib/kwoty.ts';
import { OPLATY } from '../src/lib/content/rekrutacja.ts';

test('grupowanie wlacza sie dopiero od czterech cyfr', () => {
	assert.equal(grupujTysiace(0), '0');
	assert.equal(grupujTysiace(1), '1');
	assert.equal(grupujTysiace(999), '999');
	assert.equal(grupujTysiace(1000), '1 000');
	assert.equal(grupujTysiace(1500), '1 500');
	assert.equal(grupujTysiace(2337), '2 337');
	assert.equal(grupujTysiace(9999), '9 999');
	assert.equal(grupujTysiace(10000), '10 000');
});

test('zlote dokleja slowo waluty do pogrupowanej kwoty', () => {
	assert.equal(zlote(1500), '1 500 zł');
	assert.equal(zlote(837), '837 zł');
});

test('separator to spacja ASCII, nigdy spacja nierozdzielajaca', () => {
	// Ta para asercji jest jedynym miejscem, w ktorym regresja do U+00A0 zapala sie
	// natychmiast. Bez niej podmiana separatora przechodzi przez cala bramę projektu.
	assert.equal(zlote(1500).codePointAt(1), 0x20);
	assert.notEqual(zlote(1500).codePointAt(1), 0x00a0);
});

test('kwota w OPLATY jest bajt w bajt taka sama jak wysylana dzis na strone', () => {
	assert.equal(OPLATY.kwota, '1 500 zł miesięcznie');
	assert.equal(OPLATY.kwota.codePointAt(1), 0x20);
	assert.ok(OPLATY.kwota.startsWith(zlote(1500)), OPLATY.kwota);
});
