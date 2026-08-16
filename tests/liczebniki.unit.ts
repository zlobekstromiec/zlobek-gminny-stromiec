import test from 'node:test';
import assert from 'node:assert/strict';
import {
	odmienRzeczownik,
	liczbaZRzeczownikiem,
	type FormyRzeczownika
} from '../src/lib/liczebniki.ts';

/** The real forms the site prints, so the cases below read like the page. */
const OPIEKUNKA: FormyRzeczownika = {
	pojedyncza: 'opiekunka',
	mnoga: 'opiekunki',
	dopelniacz: 'opiekunek'
};

test('1 bierze forme pojedyncza', () => {
	assert.equal(odmienRzeczownik(1, OPIEKUNKA), 'opiekunka');
});

test('2, 3 i 4 biora forme mnoga', () => {
	for (const n of [2, 3, 4]) {
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), 'opiekunki', `${n}`);
	}
});

test('0 i 5 do 21 biora dopelniacz, czyli takze cale nastki', () => {
	// The teens are the trap: 12 ends in 2 but is NOT „12 opiekunki".
	for (const n of [0, 5, 6, 9, 10, 11, 12, 13, 14, 15, 19, 20, 21]) {
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), 'opiekunek', `${n}`);
	}
});

test('dziesiatki powyzej nastek wracaja do formy mnogiej na 2 do 4', () => {
	// 22 behaves like 2, 112 behaves like 12: the rule looks at the last two
	// digits for the teens exception and at the last digit otherwise.
	for (const n of [22, 23, 24, 32, 104, 1002]) {
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), 'opiekunki', `${n}`);
	}
	for (const n of [25, 30, 100, 111, 112, 113, 114, 1015]) {
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), 'opiekunek', `${n}`);
	}
});

test('wartosci spoza zakresu nie wybieraja formy pojedynczej', () => {
	// These counts come from editor-saved JSON, so a hand-edited value must
	// degrade to a form that is never grammatically absurd, not to „1 opiekunka".
	for (const n of [-1, -6, 0.5, 6.7, Number.NaN]) {
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), 'opiekunek', `${n}`);
	}
});

test('liczbaZRzeczownikiem sklada liczbe ze slowem', () => {
	assert.equal(liczbaZRzeczownikiem(1, OPIEKUNKA), '1 opiekunka');
	assert.equal(liczbaZRzeczownikiem(3, OPIEKUNKA), '3 opiekunki');
	assert.equal(liczbaZRzeczownikiem(6, OPIEKUNKA), '6 opiekunek');
});

test('regula zgadza sie z Intl.PluralRules dla polskiego na calym zakresie', () => {
	// An independent oracle: if our four lines ever drift from the CLDR rule the
	// platform implements, this fails without anyone having to enumerate cases.
	const kategorie = new Intl.PluralRules('pl-PL');
	const wgKategorii = { one: 'opiekunka', few: 'opiekunki', many: 'opiekunek', other: 'opiekunek' };
	for (let n = 0; n <= 200; n++) {
		const oczekiwana = wgKategorii[kategorie.select(n) as keyof typeof wgKategorii];
		assert.equal(odmienRzeczownik(n, OPIEKUNKA), oczekiwana, `n=${n}`);
	}
});
