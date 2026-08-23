// Cennik reader-resilience unit suite (FEE-4). Pins the guards in src/lib/cennik.ts
// the way tests/aktualnosci-reader.unit.ts pins the news reader: removing any single
// refusal below turns this suite red.
//
// The compile-time WpisCennika type is a DELIBERATE LIE here. From plan 05-04 the
// panel writes src/lib/content/cennik.json, so from this plan on the store is
// untrusted input even though the person who saved it is authenticated, and every
// object below simulates hand-edited or partially-saved on-disk JSON. Typing the
// reader's parameter `unknown` is what forces a guard on every field; the cast in
// czytaj() keeps the suite idiom without weakening a single assertion.
//
// Built-in runner, no new dependency. Named *.unit.ts so Playwright never collects
// it, relative .ts imports because bare `node --test` does not resolve $lib.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cennikZWpisu } from '../src/lib/cennik.ts';
import * as proza from '../src/lib/content/cennik.ts';

// The exact key set the view may expose, pre-sorted. This is a key-set EQUALITY on
// purpose: it is the durable proof that cennikZWpisu constructs its result key by key
// from guarded locals. An object spread of the raw entry leaks unknown keys and turns
// this red, which is the same trap postFromEntry fell into three times (T-03-07-03).
const OCZEKIWANE_KLUCZE = [
	'kwotaOpis',
	'kwotaProza',
	'naglowek',
	'nieobecnosc',
	'obnizka',
	'obnizkaTekst',
	'placeholder',
	'placi',
	'placiTekst',
	'pokazRozbicie',
	'stawka',
	'stawkaProza',
	'stawkaTekst',
	'wyzywienie',
	'zus'
];

/** A store entry that every refusal case below mutates one field of. */
function poprawnyWpis() {
	return {
		placeholder: true,
		stawka: 2337,
		obnizka: 837,
		naglowek: 'Opłaty w skrócie',
		kwotaOpis: 'Opłata za pobyt dziecka do 10 godzin dziennie.',
		zus: 'Świadczenie „Aktywnie w żłobku" z ZUS może pokryć całą tę opłatę.',
		wyzywienie: 'Wyżywienie: maksymalnie 20 zł za każdy dzień obecności dziecka.',
		nieobecnosc: 'Za dzień nieobecności nie pobieramy opłaty za pobyt ani za wyżywienie.'
	};
}

/** Call the reader with a deliberately malformed value. */
function czytaj(wpis: unknown): ReturnType<typeof cennikZWpisu> {
	return cennikZWpisu(wpis);
}

test('poprawny wpis daje widok o dokladnie jednym, ustalonym zestawie kluczy', () => {
	const widok = czytaj(poprawnyWpis());
	assert.notEqual(widok, null);
	assert.deepEqual(Object.keys(widok!).sort(), OCZEKIWANE_KLUCZE);
});

test('kwota do zaplaty jest liczona, nigdy przechowywana', () => {
	const widok = czytaj(poprawnyWpis());
	assert.equal(widok!.placi, 2337 - 837);
	assert.equal(widok!.placi, widok!.stawka - widok!.obnizka);
});

test('kwoty sa formatowane przez wspolny formater', () => {
	const widok = czytaj(poprawnyWpis());
	assert.equal(widok!.stawkaTekst, '2 337 zł');
	assert.equal(widok!.obnizkaTekst, '837 zł');
	assert.equal(widok!.placiTekst, '1 500 zł');
	assert.equal(widok!.kwotaProza, '1 500 zł miesięcznie');
});

test('obnizka wieksza od zera pokazuje rozbicie', () => {
	assert.equal(czytaj(poprawnyWpis())!.pokazRozbicie, true);
});

test('obnizka rowna zeru chowa cale rozbicie (D-29)', () => {
	// Wiersz „Obniżka 0 zł" bylby dokladnie ta kwota zerowa bez warunku, ktorej
	// zabrania dane-bip paragraf 10, punkt 1. Blok znika w calosci.
	const widok = czytaj({ ...poprawnyWpis(), obnizka: 0 });
	assert.notEqual(widok, null);
	assert.equal(widok!.pokazRozbicie, false);
	assert.equal(widok!.placi, 2337);
});

test('pojemnik, ktory nie jest obiektem JSON, jest odrzucany', () => {
	assert.equal(czytaj(undefined), null);
	assert.equal(czytaj(null), null);
	assert.equal(czytaj([poprawnyWpis()]), null);
	assert.equal(czytaj('2337'), null);
	assert.equal(czytaj(42), null);
});

test('brak wymaganego pola tekstowego jest odrzucany', () => {
	for (const pole of ['naglowek', 'kwotaOpis', 'zus', 'wyzywienie', 'nieobecnosc']) {
		const wpis: Record<string, unknown> = poprawnyWpis();
		delete wpis[pole];
		assert.equal(czytaj(wpis), null, pole);
	}
});

test('puste lub bialoznakowe pole tekstowe jest odrzucane', () => {
	for (const pole of ['naglowek', 'kwotaOpis', 'zus', 'wyzywienie', 'nieobecnosc']) {
		assert.equal(czytaj({ ...poprawnyWpis(), [pole]: '' }), null, pole);
		assert.equal(czytaj({ ...poprawnyWpis(), [pole]: '   ' }), null, pole);
		assert.equal(czytaj({ ...poprawnyWpis(), [pole]: 7 }), null, pole);
	}
});

test('stawka niebedaca calkowita liczba nieujemna jest odrzucana', () => {
	assert.equal(czytaj({ ...poprawnyWpis(), stawka: 2337.5 }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), stawka: -2337 }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), stawka: '2337' }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), stawka: Number.NaN }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), stawka: Number.POSITIVE_INFINITY }), null);
});

test('obnizka ujemna jest odrzucana', () => {
	assert.equal(czytaj({ ...poprawnyWpis(), obnizka: -1 }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), obnizka: 8.37 }), null);
});

test('obnizka nie mniejsza od stawki jest odrzucana', () => {
	// Ujemna kwota do zaplaty jest w renderze niewykrywalna: zakotwiczony wzorzec
	// zera nie pasuje do „-837 zł". Czytnik jest ostatnim miejscem, ktore to lapie.
	assert.equal(czytaj({ ...poprawnyWpis(), obnizka: 2337 }), null);
	assert.equal(czytaj({ ...poprawnyWpis(), obnizka: 3000 }), null);
});

test('znacznik placeholder jest czytany jako wartosc logiczna, nie przepuszczany', () => {
	assert.equal(czytaj(poprawnyWpis())!.placeholder, true);
	assert.equal(czytaj({ ...poprawnyWpis(), placeholder: false })!.placeholder, false);
	assert.equal(czytaj({ ...poprawnyWpis(), placeholder: 'tak' })!.placeholder, false);
});

// HARD RULE 1 of src/lib/content/cennik.ts, made EXECUTABLE (quick 260821-gyh). Until now
// the rule that the prose module states no złoty figure was defended by a comment only,
// and this task added a fourth string to that module. A source-text grep would be the wrong
// gate: two of the three „zł" matches in that file sit inside its own doc comments, which
// discuss the rule rather than break it. So the gate reads the module's exported VALUES.
//
// The single carve-out is HARD RULE 3: przykladZus renders one zero, in the same sentence
// as the condition under which a parent does not pay it. It is asserted as an exact list
// rather than tolerated, so a SECOND amount sneaking into that function still turns red.
const KWOTA_W_ZLOTYCH = /\d[\d\s\u00a0]*zł/gu;

function kwotyW(wartosc: unknown, zebrane: string[] = []): string[] {
	if (typeof wartosc === 'string') {
		for (const trafienie of wartosc.matchAll(KWOTA_W_ZLOTYCH)) zebrane.push(trafienie[0]);
	} else if (Array.isArray(wartosc)) {
		for (const element of wartosc) kwotyW(element, zebrane);
	} else if (wartosc && typeof wartosc === 'object') {
		for (const element of Object.values(wartosc)) kwotyW(element, zebrane);
	}
	return zebrane;
}

test('HARD RULE 1: zaden staly eksport modulu prozy nie niesie kwoty w zlotych', () => {
	const stale = Object.entries(proza).filter(([, wartosc]) => typeof wartosc !== 'function');
	for (const [nazwa, wartosc] of stale) {
		assert.deepEqual(
			kwotyW(wartosc),
			[],
			`eksport ${nazwa} niesie kwote w zlotych, a kwoty naleza wylacznie do sklepu`
		);
	}
});

test('HARD RULE 3: przykladZus niesie DOKLADNIE jedno zero i zadnej innej kwoty', () => {
	// Znacznik bez cyfr w miejscu kwoty ze sklepu, zeby test mierzyl sama proze.
	assert.deepEqual(kwotyW(proza.przykladZus('KWOTA_ZE_SKLEPU')), ['0 zł']);
});
