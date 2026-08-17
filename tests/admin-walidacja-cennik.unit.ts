// The Cennik validator, proven against the REAL committed store (Phase 05, Plan 05-05;
// FEES-01, 05 D-27, D-28, D-31; threats T-05-05-01 to T-05-05-03).
//
// WHY THE COMMITTED FILE IS THE ORACLE. src/lib/content/cennik.json is read at BUILD time
// by src/lib/cennik.ts, which throws at module scope when the store is malformed, so a bad
// save does not degrade one line of a page: it fails `vite build` and leaves the previous
// deployment live. „Valid according to us" is therefore worth nothing here, and the only
// assertion that means anything is „identical in shape to what is on the site today". This
// suite reads the real file, drives its real values through the validator exactly as the
// form would, and compares the key set, the key order AND the serialized bytes.
//
// THE BYTE-FOR-BYTE PIN IS NOT PEDANTRY. The panel serializes the validator's OUTPUT
// (src/lib/server/admin/serializuj.ts), and src/lib/content/ is deliberately not in
// .prettierignore, so a drift in indent, key order or trailing newline fails
// `prettier --check .` and blocks EVERY local commit through the pre-commit hook. That has
// already happened once in this project, and it is recorded at D-09.
//
// THE ZERO RULE IS THE ONE THAT NEEDS PROVING TWICE. `dane-bip` paragraf 10 punkt 1 forbids
// publishing an amount of nothing without the condition that produces it, and the obvious
// implementation, a substring search for the characters of a zero amount, is UNUSABLE: the
// store's own „1 500 zł" and „20 zł" contain them. That trap is recorded at 04-06 and again
// in 05-UI-SPEC Contract 10, so the suite drives the validator's OWN exported pattern and
// carries an explicit case for the amounts the store holds today.
//
// Do NOT weaken these assertions to make the suite pass.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types natively on
// the pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test matcher never collects
// it, with `.ts` extensions on the relative imports as that type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../src/lib/content/panel.ts';
import {
	POLE_KWOTY_OPIS,
	POLE_NAGLOWKA,
	POLE_NIEOBECNOSCI,
	POLE_OBNIZKI,
	POLE_STAWKI,
	POLE_WYZYWIENIA,
	POLE_ZASTEPCZA,
	POLE_ZUS
} from '../src/lib/pola-strony.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import {
	MAKS_NAGLOWKA,
	MAKS_ZDANIA,
	MARKER_ZUS,
	SCIEZKA_CENNIK,
	WZORZEC_ZERA,
	walidujCennik,
	zeroBezWarunku
} from '../src/lib/server/admin/walidacja/cennik.ts';

const KORZEN = path.resolve(import.meta.dirname, '..');

const NA_DYSKU = readFileSync(path.join(KORZEN, SCIEZKA_CENNIK), 'utf8');

const CENNIK_ZLOZONY = JSON.parse(NA_DYSKU) as {
	placeholder: boolean;
	stawka: number;
	obnizka: number;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
};

/** A submitted form, in the shape the action hands the validator. `null` is what an absent
 *  key really looks like coming out of FormData, so absence is expressed that way rather
 *  than by leaving the key out of the object. */
function zrodlo(pola: Record<string, string | undefined>) {
	return {
		get(nazwa: string): unknown {
			const wartosc = pola[nazwa];
			return wartosc === undefined ? null : wartosc;
		}
	};
}

/** The committed cennik, as the form that would have produced it. This is exactly what a
 *  fresh load of /admin/cennik posts back when the editor changes nothing at all. */
function polaZPliku(): Record<string, string> {
	return {
		[POLE_STAWKI]: String(CENNIK_ZLOZONY.stawka),
		[POLE_OBNIZKI]: String(CENNIK_ZLOZONY.obnizka),
		[POLE_NAGLOWKA]: CENNIK_ZLOZONY.naglowek,
		[POLE_KWOTY_OPIS]: CENNIK_ZLOZONY.kwotaOpis,
		[POLE_ZUS]: CENNIK_ZLOZONY.zus,
		[POLE_WYZYWIENIA]: CENNIK_ZLOZONY.wyzywienie,
		[POLE_NIEOBECNOSCI]: CENNIK_ZLOZONY.nieobecnosc,
		...(CENNIK_ZLOZONY.placeholder ? { [POLE_ZASTEPCZA]: 'on' } : {})
	};
}

/** The committed form with one field replaced. */
function zPodmiana(nazwa: string, wartosc: string | undefined) {
	return zrodlo({ ...polaZPliku(), [nazwa]: wartosc });
}

// =========================================================================================
// Behavior 1: the committed store round-trips, key for key, byte for byte
// =========================================================================================

test('walidator przyjmuje wartosci, ktore leza dzis w repozytorium', () => {
	const wynik = walidujCennik(zrodlo(polaZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(wynik.dane, CENNIK_ZLOZONY);
});

test('cennik wychodzi z walidatora z dokladnie tymi kluczami i w tej kolejnosci, co plik', () => {
	const wynik = walidujCennik(zrodlo(polaZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// Ordered, never sorted: the serializer emits keys in insertion order, so a reordering
	// changes the bytes of the file and therefore the diff of every future save.
	assert.deepEqual(Object.keys(wynik.dane), Object.keys(CENNIK_ZLOZONY));
});

test('zserializowany wynik walidatora jest bajt w bajt tym, co lezy w repozytorium', () => {
	// Read from disk rather than imported, because an import would compare parsed values and
	// would not see an indent, a key order or a missing trailing newline: precisely the
	// differences that break `prettier --check .` and block every local commit (D-09).
	const wynik = walidujCennik(zrodlo(polaZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(serializujJson(wynik.dane), NA_DYSKU);
});

test('sciezka, ktora panel zapisuje, wskazuje na istniejacy plik cennika', () => {
	// A save that wrote a path nothing reads would report success to the editor, produce a
	// real commit and a real Cloudflare build, and change nothing a parent can see. That
	// failure is silent in every single layer, so the path is pinned against the filesystem.
	assert.equal(SCIEZKA_CENNIK, 'src/lib/content/cennik.json');
	assert.doesNotThrow(() => readFileSync(path.join(KORZEN, SCIEZKA_CENNIK), 'utf8'));
});

test('kwoty wychodza jako liczby, a nie jako napisy', () => {
	const wynik = walidujCennik(zrodlo(polaZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(typeof wynik.dane.stawka, 'number');
	assert.equal(typeof wynik.dane.obnizka, 'number');
	assert.equal(typeof wynik.dane.placeholder, 'boolean');
});

// =========================================================================================
// Behavior 2: both amounts (T-05-05-03)
// =========================================================================================

test('stawka odmawia braku, pustki, nieliczby, pieciu cyfr i wartosci ujemnej', () => {
	for (const zle of [
		undefined,
		'',
		'   ',
		'dwa tysiace',
		'2337 zł',
		'2337abc',
		'23.37',
		'10000',
		'-1',
		'+7'
	]) {
		const wynik = walidujCennik(zPodmiana(POLE_STAWKI, zle));
		assert.equal(wynik.ok, false, `„${String(zle)}" zostalo przyjete jako stawka`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[POLE_STAWKI], KOPIA_WALIDACJA.stawkaNiepoprawna);
	}
});

test('obnizka odmawia dokladnie tego samego zestawu wartosci', () => {
	for (const zle of [undefined, '', '   ', 'brak', '837 zł', '8.37', '10000', '-1']) {
		const wynik = walidujCennik(zPodmiana(POLE_OBNIZKI, zle));
		assert.equal(wynik.ok, false, `„${String(zle)}" zostalo przyjete jako obnizka`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[POLE_OBNIZKI], KOPIA_WALIDACJA.obnizkaNiepoprawna);
	}
});

test('obnizka rowna zero jest legalna, bo tylko ukrywa rozbicie kwoty (D-29)', () => {
	const wynik = walidujCennik(zPodmiana(POLE_OBNIZKI, '0'));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.dane.obnizka, 0);
});

// =========================================================================================
// Behavior 3: the cross-field invariant (05 D-28, T-05-05-02)
// =========================================================================================

test('obnizka nie mniejsza od stawki jest odmawiana, wiec kwota do zaplaty nie moze byc ujemna', () => {
	// Equal is refused as well as greater: an equal pair publishes „0 zł" as the fee itself,
	// which is the unconditioned zero of D-31, and a greater one publishes a negative amount
	// that the anchored zero pattern cannot see at all.
	for (const [stawka, obnizka] of [
		['2337', '2337'],
		['2337', '2338'],
		['100', '9999'],
		['0', '0']
	]) {
		const wynik = walidujCennik(
			zrodlo({ ...polaZPliku(), [POLE_STAWKI]: stawka, [POLE_OBNIZKI]: obnizka })
		);
		assert.equal(wynik.ok, false, `${stawka}/${obnizka} zostalo przyjete`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[POLE_OBNIZKI], KOPIA_WALIDACJA.obnizkaNieMniejsza);
	}
});

test('niezmiennik miedzypolowy nie odzywa sie, gdy ktoras kwota i tak jest nieczytelna', () => {
	// „nie jest mniejsza od stawki" would be a bewildering thing to read about a field that
	// is empty, so the pair rule waits until both numbers survived their own readers.
	const wynik = walidujCennik(zPodmiana(POLE_STAWKI, ''));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_OBNIZKI], undefined);
});

// =========================================================================================
// Behavior 4: the ZUS sentence (05 D-27) and the other required strings
// =========================================================================================

test('pusty warunek ZUS jest odmawiany wlasnym zdaniem, ktore mowi dlaczego', () => {
	for (const puste of [undefined, '', '   ']) {
		const wynik = walidujCennik(zPodmiana(POLE_ZUS, puste));
		assert.equal(wynik.ok, false, `„${String(puste)}" przeszlo jako warunek ZUS`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[POLE_ZUS], KOPIA_WALIDACJA.zusBrak);
	}
	// The message has to carry the REASON, not just the requirement: „to pole jest wymagane"
	// would read as pedantry, and the rule it enforces is that an amount may not appear on
	// the site without the condition under which a parent does not pay it (D-27, D-07).
	assert.match(KOPIA_WALIDACJA.zusBrak, /nie płaci/u);
});

test('kazde pozostale pole tekstowe jest wymagane i dostaje ogolna instrukcje', () => {
	for (const nazwa of [POLE_NAGLOWKA, POLE_KWOTY_OPIS, POLE_WYZYWIENIA, POLE_NIEOBECNOSCI]) {
		for (const puste of [undefined, '', '   ']) {
			const wynik = walidujCennik(zPodmiana(nazwa, puste));
			assert.equal(wynik.ok, false, `${nazwa} przyjelo „${String(puste)}"`);
			if (wynik.ok) return;
			assert.equal(wynik.pola[nazwa], KOPIA_WALIDACJA.poleBrak);
		}
	}
});

test('za dlugie pole cytuje limit, ktory serwer naprawde wymusil', () => {
	const wynik = walidujCennik(zPodmiana(POLE_NAGLOWKA, 'a'.repeat(MAKS_NAGLOWKA + 1)));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_NAGLOWKA], tekstZaDlugi(MAKS_NAGLOWKA));

	const zdanie = walidujCennik(zPodmiana(POLE_WYZYWIENIA, 'a'.repeat(MAKS_ZDANIA + 1)));
	assert.equal(zdanie.ok, false);
	if (zdanie.ok) return;
	assert.equal(zdanie.pola[POLE_WYZYWIENIA], tekstZaDlugi(MAKS_ZDANIA));
});

test('walidator czyta wszystkie pola, zanim cokolwiek odmowi', () => {
	// Contract 10a: one summary panel with every offending control linked from it. An
	// editor who got two fields wrong should be told twice, once, rather than once, twice.
	const wynik = walidujCennik(zrodlo({ ...polaZPliku(), [POLE_ZUS]: '', [POLE_WYZYWIENIA]: '' }));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_ZUS], KOPIA_WALIDACJA.zusBrak);
	assert.equal(wynik.pola[POLE_WYZYWIENIA], KOPIA_WALIDACJA.poleBrak);
});

test('odmowa nigdy nie wraca z pusta mapa pol, bo podsumowanie nie mialoby do czego linkowac', () => {
	const wynik = walidujCennik(zrodlo({}));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.ok(Object.keys(wynik.pola).length > 0);
	for (const komunikat of Object.values(wynik.pola)) {
		assert.ok(komunikat.trim().length > 0);
	}
});

// =========================================================================================
// Behavior 5: the conditional-zero rule (05 D-31, dane-bip paragraf 10 punkt 1, T-05-05-01)
// =========================================================================================

test('wzorzec zera nie lapie kwoty czterocyfrowej ani zadnej innej konczacej sie zerem', () => {
	// THE TRAP, recorded at 04-06: a literal substring search for the characters of a zero
	// amount matches every one of these, and every one of them is a perfectly ordinary fee.
	for (const uczciwa of [
		'1 500 zł miesięcznie',
		'2 337 zł',
		'1 000 zł',
		'20 zł za każdy dzień',
		'10 zł',
		'100 zł',
		'Wyżywienie: maksymalnie 20 zł za każdy dzień obecności dziecka.'
	]) {
		assert.equal(WZORZEC_ZERA.test(uczciwa), false, `wzorzec zlapal uczciwa kwote: ${uczciwa}`);
		assert.equal(zeroBezWarunku(uczciwa), false, `odmowiono uczciwej kwoty: ${uczciwa}`);
	}
});

test('wzorzec zera lapie kwote zerowa, takze zapisana bez spacji', () => {
	for (const zerowa of ['0 zł', '0zł', 'Płacisz 0 zł miesięcznie.', 'Opłata: 0  zł.']) {
		assert.equal(WZORZEC_ZERA.test(zerowa), true, `wzorzec przepuscil kwote zerowa: ${zerowa}`);
		assert.equal(zeroBezWarunku(zerowa), true, `przyjeto kwote zerowa bez warunku: ${zerowa}`);
	}
});

test('kwota zerowa jest legalna dokladnie wtedy, gdy w tym samym polu stoi nazwa swiadczenia', () => {
	const zWarunkiem = `Świadczenie „${MARKER_ZUS}" z ZUS pokrywa całą opłatę, więc płacisz 0 zł.`;
	assert.equal(zeroBezWarunku(zWarunkiem), false);
	// Case and the typographic quotes around the name are punctuation, not meaning: an
	// editor who writes the name plainly or mid-sentence is not refused for typography.
	assert.equal(zeroBezWarunku(`aktywnie w żłobku, więc 0 zł`), false);
	// The condition has to be in the SAME field. One written in a neighbouring control is a
	// condition a parent reading this sentence may never see.
	assert.equal(zeroBezWarunku('Za drugie dziecko płacisz 0 zł.'), true);
});

test('walidator odmawia kwoty zerowej bez warunku w kazdym polu tekstowym', () => {
	for (const nazwa of [
		POLE_NAGLOWKA,
		POLE_KWOTY_OPIS,
		POLE_ZUS,
		POLE_WYZYWIENIA,
		POLE_NIEOBECNOSCI
	]) {
		const wynik = walidujCennik(zPodmiana(nazwa, 'Za drugie dziecko płacisz 0 zł.'));
		assert.equal(wynik.ok, false, `${nazwa} przyjelo kwote zerowa bez warunku`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[nazwa], KOPIA_WALIDACJA.kwotaZeroBezWarunku);
	}
});

test('walidator przyjmuje kwote zerowa, gdy pole niesie nazwe swiadczenia', () => {
	const wynik = walidujCennik(
		zPodmiana(POLE_ZUS, `Świadczenie „${MARKER_ZUS}" z ZUS pokrywa całą opłatę, więc płacisz 0 zł.`)
	);
	assert.equal(wynik.ok, true);
});

test('pole, ktore juz ma odmowe, nie dostaje drugiej', () => {
	// Two messages about one control is one message the person never reads.
	const wynik = walidujCennik(zPodmiana(POLE_NAGLOWKA, ''));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_NAGLOWKA], KOPIA_WALIDACJA.poleBrak);
});

// =========================================================================================
// Behavior 6: nothing is defaulted and nothing is spread
// =========================================================================================

test('pole nieobecne w zadaniu jest bledem, nigdy wartoscia domyslna', () => {
	// Defaulting would mean a request that simply omitted a control silently blanked a fee
	// sentence, which a parent would read on the site within two minutes.
	const wynik = walidujCennik(zrodlo({}));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	for (const nazwa of [
		POLE_STAWKI,
		POLE_OBNIZKI,
		POLE_NAGLOWKA,
		POLE_KWOTY_OPIS,
		POLE_ZUS,
		POLE_WYZYWIENIA,
		POLE_NIEOBECNOSCI
	]) {
		assert.ok(wynik.pola[nazwa], `brak pola ${nazwa} przeszedl bez odmowy`);
	}
});

test('zadne dodatkowe pole z zadania nie trafia do zapisanego pliku', () => {
	const wynik = walidujCennik(
		zrodlo({ ...polaZPliku(), __proto__: 'x', dopisek: 'x', placeholder: 'x' })
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.dane), Object.keys(CENNIK_ZLOZONY));
});
