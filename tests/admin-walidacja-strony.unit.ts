// The two singleton validators, proven against the REAL committed content files (Phase
// 04.1, Plan 04.1-09; CMS-02, SC5, D-09, D-15, P-25, P-26, threat T-04.1-34).
//
// WHY THE COMMITTED FILES ARE THE ORACLE. Neither of these two content files has a guarding
// reader between it and the page: src/routes/o-nas/+page.svelte imports o-nas.json and
// renders its fields directly, and src/lib/components/DayPlan.svelte does the same with
// day-plan.json on BOTH the homepage and the O nas page. There is nothing here that would
// skip a malformed value with a warning, so „valid according to us" is worth nothing and
// the only assertion that means anything is „identical in shape to what is on the site
// today". Both suites below therefore read the real files, drive their real values through
// the validator as a form would, and compare the key set AND the key order.
//
// THE ROUND TRIP IS THE WHOLE TRIP: validate, serialize with the same `serializujJson` a
// save uses, run the result through this repository's own prettier, and only then compare.
// A shortcut that asserted against the validator's object would skip the serializer, which
// is exactly where a stray undefined disappears and where an indent regression would land.
//
// EXPECTED ONE-OFF DIFF, recorded so nobody reads it as a defect: both files hold their
// nested objects on ONE LINE today, which prettier preserves because their source has no
// newline after the brace. The first panel save expands them. That is correct output, it is
// what src/lib/server/admin/serializuj.ts already documents, and the assertions below prove
// prettier accepts the expanded form unchanged.
//
// Do NOT weaken these assertions to make the suite pass.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types natively on
// the pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test matcher never collects
// it, with `.ts` extensions on the relative imports as that type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../src/lib/content/panel.ts';
import {
	MAKS_ELEMENTOW,
	POLE_ALTU,
	POLE_DANYCH,
	POLE_GODZIN,
	POLE_KADRY_OPIEKUNKI,
	POLE_KADRY_OPIS,
	POLE_KADRY_PERSONEL,
	POLE_LEAD,
	POLE_MISJI,
	POLE_OBIEKTU_OPIS,
	POLE_OPISU,
	POLE_PLIKU,
	POLE_TYTULU,
	POLE_USUNIECIA,
	POLE_ZASTEPCZA,
	PREFIKS_WARTOSCI,
	PREFIKS_WIERSZA,
	PREFIKS_ZDJECIA,
	idPola,
	indeksZadania,
	nazwaPola,
	wartosciONas,
	wartosciPlanuDnia,
	zbierzIndeksowane
} from '../src/lib/pola-strony.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import {
	MAKS_RDZENIA_O_NAS,
	PREFIKS_O_NAS,
	nazwaZdjeciaONas,
	zdjecieONasDoUsuniecia
} from '../src/lib/server/admin/uploads.ts';
import {
	MAKS_GODZIN,
	MAKS_OPISU,
	walidujPlanDnia
} from '../src/lib/server/admin/walidacja/plan-dnia.ts';
import {
	MAKS_AKAPITU,
	MAKS_ALT,
	MAKS_LEAD,
	MAKS_OPISU_WARTOSCI,
	MAKS_TYTULU_WARTOSCI,
	walidujONas
} from '../src/lib/server/admin/walidacja/o-nas.ts';

const KORZEN = path.resolve(import.meta.dirname, '..');

// The repository's own prettier binary, resolved absolutely rather than through a package
// runner: a package runner may resolve a different copy, and the whole point is that the
// formatter here is the formatter the pre-commit hook runs.
const PRETTIER = path.join(KORZEN, 'node_modules', '.bin', 'prettier');

function przezPrettier(tresc: string, sciezka: string): string {
	return execFileSync(PRETTIER, ['--stdin-filepath', sciezka], {
		cwd: KORZEN,
		input: tresc,
		encoding: 'utf8'
	});
}

const SCIEZKA_PLANU = 'src/lib/content/day-plan.json';
const SCIEZKA_O_NAS = 'src/lib/content/o-nas.json';

function wczytaj(wzgledna: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path.join(KORZEN, wzgledna), 'utf8'));
}

const PLAN_ZLOZONY = wczytaj(SCIEZKA_PLANU) as {
	placeholder: boolean;
	rows: { time: string; what: string }[];
};
const O_NAS_ZLOZONY = wczytaj(SCIEZKA_O_NAS) as {
	placeholder: boolean;
	lead: string;
	misja: string;
	wartosci: { tytul: string; opis: string }[];
	kadra_opis: string;
	kadra_opiekunki: number;
	kadra_personel: number;
	obiekt_opis: string;
	obiekt_zdjecia: { plik: string; alt: string }[];
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

/** Spread a list of items over indexed control names, exactly as the page renders them. */
function polaListy(
	prefiks: string,
	elementy: readonly Record<string, string>[],
	odIndeksu = 0
): Record<string, string> {
	const pola: Record<string, string> = {};
	elementy.forEach((element, i) => {
		for (const [klucz, wartosc] of Object.entries(element)) {
			pola[nazwaPola(prefiks, odIndeksu + i, klucz)] = wartosc;
		}
	});
	return pola;
}

/** The committed day plan, as the form that would have produced it. */
function polaPlanuZPliku(): Record<string, string> {
	return {
		...polaListy(
			PREFIKS_WIERSZA,
			PLAN_ZLOZONY.rows.map((wiersz) => ({ [POLE_GODZIN]: wiersz.time, [POLE_OPISU]: wiersz.what }))
		),
		...(PLAN_ZLOZONY.placeholder ? { [POLE_ZASTEPCZA]: 'on' } : {})
	};
}

/** The committed O nas page, as the form that would have produced it. Every photo arrives
 *  as an already-stored basename with no pending payload, which is what a fresh load of the
 *  screen posts back when the editor changes only a sentence. */
function polaONasZPliku(): Record<string, string> {
	return {
		[POLE_LEAD]: O_NAS_ZLOZONY.lead,
		[POLE_MISJI]: O_NAS_ZLOZONY.misja,
		...polaListy(PREFIKS_WARTOSCI, O_NAS_ZLOZONY.wartosci),
		[POLE_KADRY_OPIS]: O_NAS_ZLOZONY.kadra_opis,
		[POLE_KADRY_OPIEKUNKI]: String(O_NAS_ZLOZONY.kadra_opiekunki),
		[POLE_KADRY_PERSONEL]: String(O_NAS_ZLOZONY.kadra_personel),
		[POLE_OBIEKTU_OPIS]: O_NAS_ZLOZONY.obiekt_opis,
		...polaListy(PREFIKS_ZDJECIA, O_NAS_ZLOZONY.obiekt_zdjecia),
		...(O_NAS_ZLOZONY.placeholder ? { [POLE_ZASTEPCZA]: 'on' } : {})
	};
}

/** A short, valid data URL. The charset is what matters, never the bytes: nothing on the
 *  server ever decodes this, which is the whole point of src/lib/server/admin/obraz.ts. */
const DANE_ZDJECIA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAA=';

// =========================================================================================
// Behavior 1: indexed fields become a dense ordered array (T-04.1-34)
// =========================================================================================

test('pola indeksowane wracaja jako uporzadkowana tablica bez dziur', () => {
	const zebrane = zbierzIndeksowane(
		zrodlo(
			polaListy(PREFIKS_WIERSZA, [
				{ [POLE_GODZIN]: '6:30–8:30', [POLE_OPISU]: 'Przyjmowanie dzieci' },
				{ [POLE_GODZIN]: '8:30–9:00', [POLE_OPISU]: 'Śniadanie' },
				{ [POLE_GODZIN]: '9:00–11:00', [POLE_OPISU]: 'Zajęcia' }
			])
		),
		PREFIKS_WIERSZA,
		[POLE_GODZIN, POLE_OPISU]
	);
	assert.equal(zebrane.length, 3);
	assert.deepEqual(
		zebrane.map((wiersz) => wiersz[POLE_GODZIN]),
		['6:30–8:30', '8:30–9:00', '9:00–11:00']
	);
});

test('usuniety srodkowy indeks nie zostawia dziury ani przesuniecia', () => {
	// Indices 0 and 2 arrive, 1 does not: exactly the shape a hand-built request produces,
	// and exactly the shape a naive reader would turn into an array with a hole in it.
	const pola = {
		...polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: 'pierwszy', [POLE_OPISU]: 'a' }], 0),
		...polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: 'trzeci', [POLE_OPISU]: 'c' }], 2)
	};
	const zebrane = zbierzIndeksowane(zrodlo(pola), PREFIKS_WIERSZA, [POLE_GODZIN, POLE_OPISU]);
	assert.equal(zebrane.length, 2);
	assert.deepEqual(
		zebrane.map((wiersz) => wiersz[POLE_GODZIN]),
		['pierwszy', 'trzeci']
	);
	// And it reaches the stored file the same way: no hole, no undefined, order preserved.
	const wynik = walidujPlanDnia(zrodlo(pola));
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.deepEqual(
			wynik.dane.rows.map((wiersz) => wiersz.time),
			['pierwszy', 'trzeci']
		);
	}
});

test('wiersz z pustymi polami nadal istnieje, wiec jego wyczyszczenie jest bledem, nie zniknieciem', () => {
	const zebrane = zbierzIndeksowane(
		zrodlo(polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: '', [POLE_OPISU]: '' }])),
		PREFIKS_WIERSZA,
		[POLE_GODZIN, POLE_OPISU]
	);
	assert.equal(zebrane.length, 1);
});

test('indeks spoza zakresu grupy nie wskazuje zadnej pozycji', () => {
	assert.equal(indeksZadania('1', 3), 1);
	assert.equal(indeksZadania('0', 3), 0);
	assert.equal(indeksZadania('3', 3), null);
	assert.equal(indeksZadania('-1', 3), null);
	assert.equal(indeksZadania('1e3', 3), null);
	assert.equal(indeksZadania('../0', 3), null);
	assert.equal(indeksZadania(null, 3), null);
});

test('liczba czytanych indeksow jest ograniczona', () => {
	const pola = polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: 'x', [POLE_OPISU]: 'y' }], 900);
	assert.deepEqual(zbierzIndeksowane(zrodlo(pola), PREFIKS_WIERSZA, [POLE_GODZIN, POLE_OPISU]), []);
	assert.ok(MAKS_ELEMENTOW > 0 && MAKS_ELEMENTOW < 900);
});

test('identyfikator kontrolki nie niesie nawiasow ani kropki, bo jest celem odnosnika', () => {
	const ident = idPola(PREFIKS_WIERSZA, 2, POLE_GODZIN);
	assert.equal(ident, 'wiersz-2-godziny');
	assert.equal(/[[\].]/.test(ident), false);
	// The NAME keeps the indexed shape, which is what the collector reads back.
	assert.equal(nazwaPola(PREFIKS_WIERSZA, 2, POLE_GODZIN), 'wiersz[2].godziny');
});

// =========================================================================================
// Behavior 2: a row missing a required field is refused, naming that row
// =========================================================================================

test('wiersz planu bez godzin jest odmowiony komunikatem z modulu kopii i kluczem tego wiersza', () => {
	const wynik = walidujPlanDnia(
		zrodlo(
			polaListy(PREFIKS_WIERSZA, [
				{ [POLE_GODZIN]: '6:30–8:30', [POLE_OPISU]: 'Przyjmowanie dzieci' },
				{ [POLE_GODZIN]: '   ', [POLE_OPISU]: 'Śniadanie' }
			])
		)
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_WIERSZA, 1, POLE_GODZIN)],
			KOPIA_WALIDACJA.godzinyBrak
		);
		// The FIRST row is not blamed for the second row's problem.
		assert.equal(wynik.pola[nazwaPola(PREFIKS_WIERSZA, 0, POLE_GODZIN)], undefined);
	}
});

test('wiersz planu bez opisu jest odmowiony wlasnym komunikatem, nie komunikatem o godzinach', () => {
	const wynik = walidujPlanDnia(
		zrodlo(polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: '6:30–8:30', [POLE_OPISU]: '' }]))
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_WIERSZA, 0, POLE_OPISU)],
			KOPIA_WALIDACJA.opisWierszaBrak
		);
		assert.notEqual(KOPIA_WALIDACJA.opisWierszaBrak, KOPIA_WALIDACJA.godzinyBrak);
	}
});

test('za dlugie pole wiersza dostaje komunikat cytujacy limit, ktory serwer naprawde wymusil', () => {
	const wynik = walidujPlanDnia(
		zrodlo(
			polaListy(PREFIKS_WIERSZA, [
				{ [POLE_GODZIN]: 'g'.repeat(MAKS_GODZIN + 1), [POLE_OPISU]: 'o'.repeat(MAKS_OPISU + 1) }
			])
		)
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(wynik.pola[nazwaPola(PREFIKS_WIERSZA, 0, POLE_GODZIN)], tekstZaDlugi(MAKS_GODZIN));
		assert.equal(wynik.pola[nazwaPola(PREFIKS_WIERSZA, 0, POLE_OPISU)], tekstZaDlugi(MAKS_OPISU));
	}
});

test('niepelna wartosc na stronie O nas jest odmowiona jednym komunikatem na wiersz', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_WARTOSCI, [
				{ [POLE_TYTULU]: 'Bezpieczeństwo', [POLE_OPISU]: 'Opis pierwszej wartości.' },
				{ [POLE_TYTULU]: '', [POLE_OPISU]: '' }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_WARTOSCI, 1, POLE_TYTULU)],
			KOPIA_WALIDACJA.wartoscNiepelna
		);
		// One entry in the summary for one broken card, not two identical ones.
		assert.equal(wynik.pola[nazwaPola(PREFIKS_WARTOSCI, 1, POLE_OPISU)], undefined);
	}
});

test('godziny moga zawierac polpauze zakresu, bo tak wyglada tresc na stronie dzisiaj', () => {
	// The committed content uses an en dash inside every range, which the project's copy
	// rules allow exactly there. A pattern tight enough to be worth having would refuse the
	// content that is on the site right now, which is why this field is free text.
	const wynik = walidujPlanDnia(zrodlo(polaPlanuZPliku()));
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.ok(wynik.dane.rows.some((wiersz) => wiersz.time.includes('–')));
	}
});

// =========================================================================================
// Behavior 3: the day plan validator emits the committed key set, in the committed order
// =========================================================================================

test('plan dnia wychodzi z walidatora z dokladnie tymi kluczami i w tej kolejnosci, co plik', () => {
	const wynik = walidujPlanDnia(zrodlo(polaPlanuZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	assert.deepEqual(Object.keys(wynik.dane), Object.keys(PLAN_ZLOZONY));
	assert.deepEqual(Object.keys(wynik.dane.rows[0]), Object.keys(PLAN_ZLOZONY.rows[0]));
	assert.deepEqual(wynik.dane.rows, PLAN_ZLOZONY.rows);
	assert.equal(wynik.dane.placeholder, PLAN_ZLOZONY.placeholder);
});

test('zapisany plan dnia przechodzi przez prettier bez ani jednej zmiany bajtu', () => {
	const wynik = walidujPlanDnia(zrodlo(polaPlanuZPliku()));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	const zapisane = serializujJson(wynik.dane);
	assert.equal(przezPrettier(zapisane, SCIEZKA_PLANU), zapisane);
	// And it parses back to the same content, which is what DayPlan.svelte renders on the
	// homepage and on the O nas page from one file.
	assert.deepEqual(JSON.parse(zapisane), PLAN_ZLOZONY);
});

// =========================================================================================
// Behavior 4: the o nas validator emits the committed key set, counts as NUMBERS
// =========================================================================================

test('strona O nas wychodzi z walidatora z dokladnie tymi kluczami i w tej kolejnosci, co plik', () => {
	const wynik = walidujONas(zrodlo(polaONasZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	assert.deepEqual(Object.keys(wynik.dane), Object.keys(O_NAS_ZLOZONY));
	assert.deepEqual(Object.keys(wynik.dane.wartosci[0]), Object.keys(O_NAS_ZLOZONY.wartosci[0]));
	assert.deepEqual(
		Object.keys(wynik.dane.obiekt_zdjecia[0]),
		Object.keys(O_NAS_ZLOZONY.obiekt_zdjecia[0])
	);
	assert.deepEqual(wynik.dane, O_NAS_ZLOZONY);
});

test('liczebnosc kadry jest liczba, a nie napisem, i odmawia wartosci, ktora liczba nie jest', () => {
	const wynik = walidujONas(zrodlo(polaONasZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.equal(typeof wynik.dane.kadra_opiekunki, 'number');
		assert.equal(typeof wynik.dane.kadra_personel, 'number');
		assert.equal(wynik.dane.kadra_opiekunki, O_NAS_ZLOZONY.kadra_opiekunki);
	}

	for (const zle of ['sześć', '6 osób', '6.0', '', '-1', '100', '6abc']) {
		const odmowa = walidujONas(
			zrodlo({ ...polaONasZPliku(), [POLE_KADRY_OPIEKUNKI]: zle }),
			new Set()
		);
		assert.equal(odmowa.ok, false, `„${zle}" nie powinno byc przyjete jako liczba`);
		if (!odmowa.ok) {
			assert.equal(odmowa.pola[POLE_KADRY_OPIEKUNKI], KOPIA_WALIDACJA.liczbaNiepoprawna);
		}
	}
});

test('zapisana strona O nas przechodzi przez prettier bez ani jednej zmiany bajtu', () => {
	const wynik = walidujONas(zrodlo(polaONasZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	const zapisane = serializujJson(wynik.dane);
	assert.equal(przezPrettier(zapisane, SCIEZKA_O_NAS), zapisane);
	assert.deepEqual(JSON.parse(zapisane), O_NAS_ZLOZONY);
});

test('za dlugi akapit jest odmowiony komunikatem cytujacym wlasny limit', () => {
	for (const [pole, limit] of [
		[POLE_LEAD, MAKS_LEAD],
		[POLE_MISJI, MAKS_AKAPITU],
		[POLE_KADRY_OPIS, MAKS_AKAPITU],
		[POLE_OBIEKTU_OPIS, MAKS_AKAPITU]
	] as const) {
		const wynik = walidujONas(
			zrodlo({ ...polaONasZPliku(), [pole]: 'a'.repeat(limit + 1) }),
			new Set()
		);
		assert.equal(wynik.ok, false);
		if (!wynik.ok) assert.equal(wynik.pola[pole], tekstZaDlugi(limit));
	}
});

test('za dlugie pole wartosci jest odmowione komunikatem cytujacym wlasny limit', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_WARTOSCI, [
				{ [POLE_TYTULU]: 't'.repeat(MAKS_TYTULU_WARTOSCI + 1), [POLE_OPISU]: 'Opis.' }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_WARTOSCI, 0, POLE_TYTULU)],
			tekstZaDlugi(MAKS_TYTULU_WARTOSCI)
		);
	}
	assert.ok(MAKS_OPISU_WARTOSCI > MAKS_TYTULU_WARTOSCI);
});

// =========================================================================================
// Behavior 5: alt is required per photo, and a removed photo takes its alt with it (D-15)
// =========================================================================================

test('zdjecie obiektu z pustym opisem alternatywnym jest odmowione na serwerze (D-15)', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: '', [POLE_ALTU]: '', [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(wynik.pola[nazwaPola(PREFIKS_ZDJECIA, 0, POLE_ALTU)], KOPIA_WALIDACJA.altBrak);
	}
});

test('zdjecie, ktore juz jest na stronie, tez wymaga opisu, wiec skasowanie opisu nie przechodzi', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: O_NAS_ZLOZONY.obiekt_zdjecia[0].plik, [POLE_ALTU]: '' }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(wynik.pola[nazwaPola(PREFIKS_ZDJECIA, 0, POLE_ALTU)], KOPIA_WALIDACJA.altBrak);
	}
});

test('zdjecie usuniete z listy zabiera ze soba swoj opis, a pozostale nie zmieniaja kolejnosci', () => {
	// The second item is simply not submitted, which is what the remove action re-renders.
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [O_NAS_ZLOZONY.obiekt_zdjecia[0]]),
			[nazwaPola(PREFIKS_ZDJECIA, 1, POLE_PLIKU)]: undefined,
			[nazwaPola(PREFIKS_ZDJECIA, 1, POLE_ALTU)]: undefined
		}),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.deepEqual(wynik.dane.obiekt_zdjecia, [O_NAS_ZLOZONY.obiekt_zdjecia[0]]);
		// The alt of the removed picture is nowhere in the saved file.
		assert.equal(serializujJson(wynik.dane).includes(O_NAS_ZLOZONY.obiekt_zdjecia[1].alt), false);
	}
});

test('pozycja, ktorej zdjecie wyczyszczono i nie zastapiono, jest odmowiona wlasna instrukcja', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{
					[POLE_PLIKU]: O_NAS_ZLOZONY.obiekt_zdjecia[0].plik,
					[POLE_ALTU]: O_NAS_ZLOZONY.obiekt_zdjecia[0].alt,
					[POLE_USUNIECIA]: '1'
				}
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_ZDJECIA, 0, POLE_DANYCH)],
			KOPIA_WALIDACJA.zdjecieBrak
		);
	}
});

test('nowe zdjecie wygrywa z flaga usuniecia, bo to redaktor zmieniajacy zdanie', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{
					[POLE_PLIKU]: 'sala-zabaw.jpg',
					[POLE_ALTU]: 'Nowy widok sali',
					[POLE_DANYCH]: DANE_ZDJECIA,
					[POLE_USUNIECIA]: '1'
				}
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.equal(wynik.zdjecia.length, 1);
		assert.equal(wynik.dane.obiekt_zdjecia[0].alt, 'Nowy widok sali');
	}
});

test('zdjecie w toku nigdy nie jest dekodowane, a niedozwolony ladunek jest odmowiony', () => {
	for (const zly of [
		'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
		'data:text/html;base64,PGgxPjwvaDE+',
		'/9j/4AAQSkZJRgABAQAAAQABAAA=',
		'data:image/jpeg;base64,"; rm -rf /'
	]) {
		const wynik = walidujONas(
			zrodlo({
				...polaONasZPliku(),
				...polaListy(PREFIKS_ZDJECIA, [
					{ [POLE_PLIKU]: '', [POLE_ALTU]: 'Sala zabaw', [POLE_DANYCH]: zly }
				])
			}),
			new Set()
		);
		assert.equal(wynik.ok, false, `„${zly.slice(0, 24)}" nie powinno byc przyjete`);
		if (!wynik.ok) {
			assert.equal(
				wynik.pola[nazwaPola(PREFIKS_ZDJECIA, 0, POLE_DANYCH)],
				KOPIA_WALIDACJA.zdjecieZlyTyp
			);
		}
	}
});

test('nazwa zdjecia przyniesiona w zadaniu jest przyjmowana z listy dozwolonych, nie czyszczona', () => {
	for (const wrogie of [
		'../../../etc/passwd',
		'a/b.jpg',
		'PLIK.JPG',
		'plik.jpg.exe',
		'..%2Fx.jpg'
	]) {
		const wynik = walidujONas(
			zrodlo({
				...polaONasZPliku(),
				...polaListy(PREFIKS_ZDJECIA, [{ [POLE_PLIKU]: wrogie, [POLE_ALTU]: 'Sala zabaw' }])
			}),
			new Set()
		);
		assert.equal(wynik.ok, false, `„${wrogie}" nie powinno byc przyjete jako nazwa pliku`);
	}
	// Positive control: both real files in the uploads directory are admitted.
	for (const zdjecie of O_NAS_ZLOZONY.obiekt_zdjecia) {
		const wynik = walidujONas(
			zrodlo({
				...polaONasZPliku(),
				...polaListy(PREFIKS_ZDJECIA, [{ [POLE_PLIKU]: zdjecie.plik, [POLE_ALTU]: zdjecie.alt }])
			}),
			new Set()
		);
		assert.equal(wynik.ok, true, `„${zdjecie.plik}" powinno byc przyjete`);
	}
});

// =========================================================================================
// Behavior 6: the derived basename is unique against the names already taken (P-25)
// =========================================================================================

test('nazwa zdjecia obiektu powstaje ze slugu opisu, z prefiksem i malym rozszerzeniem', () => {
	const nazwa = nazwaZdjeciaONas('Sala zabaw z kolorowymi zabawkami', new Set());
	assert.equal(nazwa, `${PREFIKS_O_NAS}sala-zabaw-z-kolorowymi-zabawkami.jpg`);
	// The Polish stroked l is transliterated rather than emitted into a filename, which is
	// the one letter an NFD-only implementation silently gets wrong.
	assert.equal(nazwaZdjeciaONas('Żłobek', new Set()), `${PREFIKS_O_NAS}zlobek.jpg`);
	assert.match(nazwa, /^[a-z0-9-]+\.jpg$/);
});

test('nazwa zdjecia obiektu jest unikalna wzgledem podanego zbioru nazw', () => {
	const alt = 'Plac zabaw przed budynkiem';
	const pierwsza = nazwaZdjeciaONas(alt, new Set());
	const druga = nazwaZdjeciaONas(alt, new Set([pierwsza]));
	const trzecia = nazwaZdjeciaONas(alt, new Set([pierwsza, druga]));
	assert.notEqual(pierwsza, druga);
	assert.notEqual(druga, trzecia);
	assert.equal(druga, pierwsza.replace('.jpg', '-2.jpg'));
	assert.equal(trzecia, pierwsza.replace('.jpg', '-3.jpg'));
});

test('opis, ktory slugowalby sie do niczego, i tak daje nazwe do znalezienia', () => {
	const nazwa = nazwaZdjeciaONas('***', new Set());
	assert.match(nazwa, /^obiekt-[a-z]+\.jpg$/);
	assert.ok(nazwa.length > PREFIKS_O_NAS.length + '.jpg'.length);
});

test('bardzo dlugi opis nie daje bardzo dlugiej nazwy pliku', () => {
	const nazwa = nazwaZdjeciaONas('Sala '.repeat(60), new Set());
	assert.ok(nazwa.length <= PREFIKS_O_NAS.length + MAKS_RDZENIA_O_NAS + '.jpg'.length);
	assert.equal(nazwa.endsWith('-.jpg'), false);
});

test('dwa nowe zdjecia z tym samym opisem dostaja dwie rozne nazwy w jednym zapisie', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: '', [POLE_ALTU]: 'Sala zabaw', [POLE_DANYCH]: DANE_ZDJECIA },
				{ [POLE_PLIKU]: '', [POLE_ALTU]: 'Sala zabaw', [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		const nazwy = wynik.zdjecia.map((zdjecie) => zdjecie.nazwa);
		assert.equal(new Set(nazwy).size, 2);
		assert.deepEqual(
			wynik.dane.obiekt_zdjecia.map((zdjecie) => zdjecie.plik),
			nazwy
		);
	}
});

test('nowe zdjecie nie dostaje nazwy, ktora nadal nosi inna pozycja tej samej listy', () => {
	const zajeta = `${PREFIKS_O_NAS}sala-zabaw.jpg`;
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: zajeta, [POLE_ALTU]: 'Sala zabaw' },
				{ [POLE_PLIKU]: '', [POLE_ALTU]: 'Sala zabaw', [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.equal(wynik.dane.obiekt_zdjecia[0].plik, zajeta);
		assert.notEqual(wynik.dane.obiekt_zdjecia[1].plik, zajeta);
	}
});

test('podmiana zdjecia, ktore panel sam nazwal, nadpisuje je w miejscu (P-21)', () => {
	const wlasna = `${PREFIKS_O_NAS}sala-zabaw.jpg`;
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: wlasna, [POLE_ALTU]: 'Zupelnie inny opis', [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set([wlasna])
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		// One path written, never also listed for deletion: one commit cannot both write and
		// remove one file.
		assert.equal(wynik.zdjecia[0].nazwa, wlasna);
		assert.equal(wynik.dane.obiekt_zdjecia[0].plik, wlasna);
	}
});

test('podmiana zdjecia postawionego recznie NIGDY go nie nadpisuje, bo moze byc wspoldzielone', () => {
	// sala-zabaw.jpg is rendered by the o nas page AND by a seeded aktualność. Overwriting
	// it would change a picture on a page nobody was editing.
	const reczne = O_NAS_ZLOZONY.obiekt_zdjecia[0].plik;
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: reczne, [POLE_ALTU]: 'Nowa sala zabaw', [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set([reczne])
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) {
		assert.notEqual(wynik.zdjecia[0].nazwa, reczne);
		assert.ok(wynik.zdjecia[0].nazwa.startsWith(PREFIKS_O_NAS));
	}
});

test('kasowanie pliku obiektu dotyczy wylacznie nazw, ktore panel sam wygenerowal', () => {
	const wlasna = `${PREFIKS_O_NAS}sala-zabaw.jpg`;
	const istniejace = new Set([wlasna, 'sala-zabaw.jpg']);

	assert.equal(zdjecieONasDoUsuniecia(wlasna, [], istniejace), `src/lib/assets/uploads/${wlasna}`);
	// A hand-placed name is never removed, whatever else is true about it.
	assert.equal(zdjecieONasDoUsuniecia('sala-zabaw.jpg', [], istniejace), null);
	// Still pointed at by something: not removed.
	assert.equal(zdjecieONasDoUsuniecia(wlasna, [wlasna], istniejace), null);
	// Not in the build: nothing to remove, and asking git to remove it would fail the save.
	assert.equal(zdjecieONasDoUsuniecia(wlasna, [], new Set()), null);
	// Not admissible as a basename at all.
	assert.equal(zdjecieONasDoUsuniecia('../../secrets.jpg', [], istniejace), null);
});

// =========================================================================================
// The echo shapes, which are what a refusal hands the editor back (Contract 10c)
// =========================================================================================

test('echo planu dnia oddaje kazdy wpisany wiersz w tej samej kolejnosci', () => {
	const wartosci = wartosciPlanuDnia(zrodlo(polaPlanuZPliku()));
	assert.deepEqual(
		wartosci.wiersze.map((wiersz) => wiersz.godziny),
		PLAN_ZLOZONY.rows.map((wiersz) => wiersz.time)
	);
	assert.equal(wartosci.zastepcza, PLAN_ZLOZONY.placeholder);
});

test('echo strony O nas oddaje kazde pole, takze te odmowione, i flage usuniecia zdjecia', () => {
	const wartosci = wartosciONas(
		zrodlo({
			...polaONasZPliku(),
			[POLE_KADRY_OPIEKUNKI]: 'sześć',
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: 'sala-zabaw.jpg', [POLE_ALTU]: '', [POLE_USUNIECIA]: '1' }
			])
		})
	);
	// A refused value comes back verbatim: the editor corrects it rather than retyping the
	// whole form.
	assert.equal(wartosci.kadraOpiekunki, 'sześć');
	assert.equal(wartosci.lead, O_NAS_ZLOZONY.lead);
	assert.equal(wartosci.wartosci.length, O_NAS_ZLOZONY.wartosci.length);
	assert.equal(wartosci.zdjecia[0].usunieto, true);
	assert.equal(wartosci.zdjecia[0].plik, 'sala-zabaw.jpg');
});

test('nieoznaczony placeholder to falsz, a nie blad, bo taka jest konwencja pola wyboru', () => {
	const wynik = walidujPlanDnia(
		zrodlo(polaListy(PREFIKS_WIERSZA, [{ [POLE_GODZIN]: '7:00', [POLE_OPISU]: 'Śniadanie' }]))
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) assert.equal(wynik.dane.placeholder, false);
});

test('opis alternatywny ma ten sam limit co przy aktualnosciach, wiec ekrany sie nie rozjezdzaja', () => {
	const wynik = walidujONas(
		zrodlo({
			...polaONasZPliku(),
			...polaListy(PREFIKS_ZDJECIA, [
				{ [POLE_PLIKU]: '', [POLE_ALTU]: 'a'.repeat(MAKS_ALT + 1), [POLE_DANYCH]: DANE_ZDJECIA }
			])
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) {
		assert.equal(wynik.pola[nazwaPola(PREFIKS_ZDJECIA, 0, POLE_ALTU)], tekstZaDlugi(MAKS_ALT));
	}
});
