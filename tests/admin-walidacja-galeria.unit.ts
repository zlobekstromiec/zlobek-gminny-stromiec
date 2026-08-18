// The gallery naming, ownership and validation rules, proven against the REAL committed
// store (Phase 05, Plan 05-06; GALLERY-02, 05 D-21 to D-26; threats T-05-06-01, T-05-06-02).
//
// WHY THE COMMITTED FILE IS THE ORACLE. src/lib/content/galeria.json is read at BUILD time
// and the panel serializes the validator's OUTPUT into it, so „valid according to us" is
// worth nothing: the only assertion that means anything is „identical in shape to what is on
// the site today". This suite reads the real file, drives its real values through the
// validator exactly as the form would, and compares the key set, the key order AND the
// serialized bytes.
//
// THE TWO CASES NOTHING ELSE IN THE PROJECT CAN CATCH:
//
//  • the two hand-placed seed photographs are UNDELETABLE by the panel, under every
//    combination of the other three inputs, because neither carries the gallery prefix
//    (05-UI-SPEC Contract 8, 05 D-26). One of them is also the cover of a seeded aktualność,
//    so deleting it would degrade that post's cover to the tint fallback;
//  • the two-pass name reservation, which is what stops two photographs captioned identically
//    in one save from being handed one filename and one file.
//
// HONESTLY RECORDED, because 05-VALIDATION.md proposes a promotion that does not work: GAL-10
// lives in the unrun E5 tier and the proposed browser promotion (remove a seed photo through
// the panel, assert the file survives) is VACUOUS under this project's harness. `preview:test`
// binds PANEL_DRY_RUN=1, so no Playwright save ever deletes a file and the assertion would
// pass whatever the ownership rule did. The property is pinned here and carried into
// 05-VERIFICATION.md as honestly unproven rather than claimed.
//
// Do NOT weaken these assertions to make the suite pass.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types natively on the
// pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test matcher never collects it,
// with `.ts` extensions on the relative imports as that type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
	KOPIA_EKRAN_GALERII,
	KOPIA_WALIDACJA,
	POLA_GALERIA,
	tekstZaDlugi
} from '../src/lib/content/panel.ts';
import {
	MAKS_ZDJEC_GALERII,
	POLE_ALTU,
	POLE_DANYCH,
	POLE_PLIKU,
	POLE_PODPISU,
	POLE_USUNIECIA,
	POLE_ZASTEPCZA,
	PREFIKS_ZDJECIA_GALERII,
	nazwaPola
} from '../src/lib/pola-strony.ts';
import { bazowaNazwa } from '../src/lib/zdjecia-nazwy.ts';
import { czytajGalerie, galeriaZObrazami, zdjecieGalerii } from '../src/lib/galeria.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import {
	MAKS_RDZENIA_GALERII,
	PREFIKS_GALERII,
	ROZSZERZENIE,
	nazwaZdjeciaGalerii,
	zdjecieGaleriiDoUsuniecia
} from '../src/lib/server/admin/uploads.ts';
import {
	MAKS_ALT,
	MAKS_PODPISU,
	SCIEZKA_GALERIA,
	walidujGaleria
} from '../src/lib/server/admin/walidacja/galeria.ts';

const KORZEN = path.resolve(import.meta.dirname, '..');

const NA_DYSKU = readFileSync(path.join(KORZEN, SCIEZKA_GALERIA), 'utf8');

const GALERIA_ZLOZONA = JSON.parse(NA_DYSKU) as {
	placeholder: boolean;
	zdjecia: { plik: string; podpis: string; alt: string }[];
};

/** The pictures that were placed in this repository BY HAND. Read out of the committed store
 *  rather than retyped: a renamed seed file must rename this list with it, or the whole
 *  undeletability case below would be asserting something about a file nobody ships.
 *
 *  THE PREFIX FILTER IS THE DEFINITION OF „seed", not a convenience. Reading the whole store
 *  was only correct while no editor had ever added a photo, so the FIRST legitimate upload
 *  through the panel turned this suite red: the added file carries `PREFIKS_GALERII` by
 *  design, and the case below then asserted that a panel-prefixed file is not panel-prefixed.
 *  A gate that a normal editorial save can redden teaches people to ignore it. */
const SEEDY = GALERIA_ZLOZONA.zdjecia
	.map((zdjecie) => zdjecie.plik)
	.filter((plik) => !plik.startsWith(PREFIKS_GALERII));

// =========================================================================================
// bazowaNazwa: the extracted basename idiom
// =========================================================================================

test('bazowa nazwa zwraca ostatni segment sciezki', () => {
	assert.equal(bazowaNazwa('/x/y/sala-zabaw.jpg'), 'sala-zabaw.jpg');
	assert.equal(
		bazowaNazwa('src/lib/assets/uploads/galeria-sala-zabaw.jpg'),
		'galeria-sala-zabaw.jpg'
	);
});

test('bazowa nazwa zwraca wartosc bez zmian, gdy nie ma w niej separatora', () => {
	assert.equal(bazowaNazwa('sala-zabaw.jpg'), 'sala-zabaw.jpg');
	assert.equal(bazowaNazwa(''), '');
});

// =========================================================================================
// nazwaZdjeciaGalerii: the name is GENERATED, never typed by staff (T-05-06-01)
// =========================================================================================

test('nazwa nowego zdjecia bierze rdzen z PODPISU, nie z opisu alternatywnego', () => {
	// The caption is the short room name and makes a readable filename; a gallery alt is a
	// whole descriptive sentence and would make one nobody can read in a directory listing.
	const nazwa = nazwaZdjeciaGalerii(
		'Sala zabaw',
		'Sala zabaw z kolorowymi zabawkami i dywanem przy oknie',
		new Set()
	);
	assert.equal(nazwa, `${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`);
});

test('nazwa spada na opis alternatywny, gdy podpis nie daje zadnego rdzenia', () => {
	const nazwa = nazwaZdjeciaGalerii('...', 'Plac zabaw przed budynkiem', new Set());
	assert.equal(nazwa, `${PREFIKS_GALERII}plac-zabaw-przed-budynkiem${ROZSZERZENIE}`);
});

test('nazwa spada na rdzen zapasowy, gdy ani podpis, ani alt nie daja zadnego', () => {
	const nazwa = nazwaZdjeciaGalerii('...', '???', new Set());
	assert.equal(nazwa, `${PREFIKS_GALERII}zdjecie${ROZSZERZENIE}`);
});

test('nazwa nigdy nie jest nazwa juz zajeta, a numeracja zaczyna sie od dwoch', () => {
	// From two, because the unsuffixed name IS the first one.
	const zajete = new Set([`${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`]);
	const druga = nazwaZdjeciaGalerii('Sala zabaw', 'opis', zajete);
	assert.equal(druga, `${PREFIKS_GALERII}sala-zabaw-2${ROZSZERZENIE}`);

	zajete.add(druga);
	const trzecia = nazwaZdjeciaGalerii('Sala zabaw', 'opis', zajete);
	assert.equal(trzecia, `${PREFIKS_GALERII}sala-zabaw-3${ROZSZERZENIE}`);
	assert.equal(zajete.has(trzecia), false);
});

test('rdzen nazwy jest przyciety do zadeklarowanej dlugosci', () => {
	const nazwa = nazwaZdjeciaGalerii('a'.repeat(200), '', new Set());
	const rdzen = nazwa.slice(PREFIKS_GALERII.length, -ROZSZERZENIE.length);
	assert.ok(rdzen.length <= MAKS_RDZENIA_GALERII, `rdzen ma ${rdzen.length} znakow`);
});

test('nazwa jest zawsze dopuszczalna nazwa pliku, cokolwiek wpisano w podpisie', () => {
	// T-05-06-01: the caption decides a path INSIDE the repository, so the generated name may
	// never carry a separator, a dot run or anything outside the admissible character class.
	const wzorzec = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp)$/u;
	for (const podpis of [
		'../../etc/passwd',
		'Sala/zabaw',
		'..\\..\\okno',
		'Żłobek: sala „maluchy”',
		'   ',
		'%2e%2e%2f'
	]) {
		const nazwa = nazwaZdjeciaGalerii(podpis, '', new Set());
		assert.match(nazwa, wzorzec, `nazwa spoza dopuszczalnej klasy dla podpisu „${podpis}"`);
	}
});

// =========================================================================================
// zdjecieGaleriiDoUsuniecia: the four conditions, and the seeds (T-05-06-02, GAL-10)
// =========================================================================================

const NAZWA_PANELU = `${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`;

test('usuwana jest wylacznie nazwa, ktora panel sam wygenerowal, i tylko gdy istnieje', () => {
	const istniejace = new Set([NAZWA_PANELU]);
	assert.equal(
		zdjecieGaleriiDoUsuniecia(NAZWA_PANELU, [], istniejace),
		`src/lib/assets/uploads/${NAZWA_PANELU}`
	);
});

test('nie usuwamy nazwy, na ktora cokolwiek jeszcze wskazuje', () => {
	const istniejace = new Set([NAZWA_PANELU]);
	assert.equal(zdjecieGaleriiDoUsuniecia(NAZWA_PANELU, [NAZWA_PANELU], istniejace), null);
	// An aktualność cover carried as a full path still counts as „still used".
	assert.equal(
		zdjecieGaleriiDoUsuniecia(NAZWA_PANELU, [`src/lib/assets/uploads/${NAZWA_PANELU}`], istniejace),
		null
	);
});

test('nie usuwamy nazwy, ktorej nie ma w tej kompilacji, bo zepsulaby caly zapis', () => {
	assert.equal(zdjecieGaleriiDoUsuniecia(NAZWA_PANELU, [], new Set()), null);
});

test('nie usuwamy niczego, co nie jest dopuszczalna nazwa pliku', () => {
	for (const zle of ['../../../etc/passwd', 'SALA.JPG', 'sala zabaw.jpg', '', 'sala.jpg.exe']) {
		assert.equal(
			zdjecieGaleriiDoUsuniecia(zle, [], new Set([zle])),
			null,
			`przyjeto do usuniecia: ${zle}`
		);
	}
});

// THE CASE 05-UI-SPEC CONTRACT 8 NAMES OUT LOUD, and the one this whole prefix exists for.
test('oba recznie wgrane zdjecia sa nieusuwalne przy KAZDEJ kombinacji pozostalych wejsc', () => {
	assert.ok(SEEDY.length >= 2, 'store galerii nie zawiera obu zdjec zalozycielskich');
	// Obie znane nazwy sa wymienione WPROST. Sam licznik powyzej przeszedlby takze wtedy,
	// gdyby ktos podmienil zdjecia zalozycielskie na dwa inne pliki bez prefiksu, a to jest
	// dokladnie ten sposob, w ktory ta sprawa moglaby zniknac po cichu. Asercja o braku
	// prefiksu, ktora tu kiedys stala, jest teraz spelniona przez sam filtr SEEDY, wiec nie
	// niosla juz zadnej informacji i zostala usunieta zamiast udawac pokrycie.
	for (const wymagane of ['sala-zabaw.jpg', 'plac-zabaw.jpg']) {
		assert.ok(SEEDY.includes(wymagane), `brak zdjecia zalozycielskiego: ${wymagane}`);
	}
	for (const seed of SEEDY) {
		for (const nadalUzywane of [[], [seed], ['cokolwiek.jpg']]) {
			for (const istniejace of [new Set<string>(), new Set([seed])]) {
				assert.equal(
					zdjecieGaleriiDoUsuniecia(seed, nadalUzywane, istniejace),
					null,
					`panel zgodzil sie usunac recznie wgrane zdjecie: ${seed}`
				);
				// The same answer when the stored value is a full path rather than a basename.
				assert.equal(
					zdjecieGaleriiDoUsuniecia(`src/lib/assets/uploads/${seed}`, nadalUzywane, istniejace),
					null,
					`panel zgodzil sie usunac recznie wgrane zdjecie po sciezce: ${seed}`
				);
			}
		}
	}
});

// =========================================================================================
// The reader: a malformed store degrades, it never aborts the prerender
// =========================================================================================

test('czytnik przyjmuje store, ktory lezy dzis w repozytorium', () => {
	const zdjecia = czytajGalerie(GALERIA_ZLOZONA);
	assert.equal(zdjecia.length, GALERIA_ZLOZONA.zdjecia.length);
	assert.deepEqual(Object.keys(zdjecia[0]), ['plik', 'podpis', 'alt']);
});

test('czytnik odrzuca wpis bez podpisu, bez altu albo bez pliku, a reszte zostawia', () => {
	const zdjecia = czytajGalerie({
		zdjecia: [
			{ plik: 'a.jpg', podpis: 'A', alt: 'Opis A' },
			{ plik: 'b.jpg', podpis: '   ', alt: 'Opis B' },
			{ plik: 'c.jpg', podpis: 'C', alt: '' },
			{ plik: '', podpis: 'D', alt: 'Opis D' },
			{ podpis: 'E', alt: 'Opis E' },
			'nie obiekt',
			null,
			{ plik: 'f.jpg', podpis: 'F', alt: 'Opis F' }
		]
	});
	assert.deepEqual(
		zdjecia.map((zdjecie) => zdjecie.plik),
		['a.jpg', 'f.jpg']
	);
});

test('czytnik oddaje pusta liste zamiast rzucac, gdy kontener jest zepsuty', () => {
	for (const zle of [null, undefined, 'napis', 42, [], { zdjecia: 'napis' }, { zdjecia: {} }]) {
		assert.deepEqual(
			czytajGalerie(zle),
			[],
			`czytnik nie poradzil sobie z: ${JSON.stringify(zle)}`
		);
	}
});

test('wpis jest budowany klucz po kluczu, wiec nic dodatkowego nie przecieka', () => {
	const wpis = zdjecieGalerii({ plik: 'a.jpg', podpis: 'A', alt: 'Opis A', dopisek: 'x' });
	assert.notEqual(wpis, null);
	assert.deepEqual(Object.keys(wpis ?? {}), ['plik', 'podpis', 'alt']);
});

test('lista do renderu gubi wpis, ktorego pliku nie ma wsrod przetworzonych zdjec', () => {
	// „The lightbox can never open onto nothing": copied from the filter /o-nas already uses
	// rather than re-derived.
	const zdjecia = czytajGalerie({
		zdjecia: [
			{ plik: 'jest.jpg', podpis: 'Jest', alt: 'Opis' },
			{ plik: 'nie-ma.jpg', podpis: 'Nie ma', alt: 'Opis' }
		]
	});
	const doRenderu = galeriaZObrazami(zdjecia, { 'jest.jpg': { img: { src: '/jest.jpg' } } });
	assert.equal(doRenderu.length, 1);
	assert.equal(doRenderu[0].plik, 'jest.jpg');
	assert.equal(doRenderu[0].podpis, 'Jest');
});

test('lista do renderu odrzuca nazwe pliku, ktora trafia w lancuch prototypow', () => {
	// T-05-07-02. The picture map is a plain object literal, so it answers `constructor`,
	// `__proto__`, `toString`, `valueOf` and `hasOwnProperty` off `Object.prototype`. A lookup
	// that admits on `!== undefined` therefore lets those names through with `obraz` bound to
	// a function rather than a picture, and the first `zdjecie.obraz.img.src` on /o-nas throws
	// a TypeError in the middle of the whole-site prerender. The store is hand-editable, which
	// is what puts these names in reach: `zdjecieGalerii` constrains `plik` no further than
	// „it is a string".
	const zdjecia = czytajGalerie({
		zdjecia: [
			{ plik: 'constructor', podpis: 'Podpis', alt: 'Opis' },
			{ plik: '__proto__', podpis: 'Podpis', alt: 'Opis' },
			{ plik: 'toString', podpis: 'Podpis', alt: 'Opis' },
			{ plik: 'valueOf', podpis: 'Podpis', alt: 'Opis' },
			{ plik: 'hasOwnProperty', podpis: 'Podpis', alt: 'Opis' },
			{ plik: 'jest.jpg', podpis: 'Jest', alt: 'Opis' }
		]
	});
	assert.equal(zdjecia.length, 6, 'czytnik ma przepuscic te nazwy, bramka jest nizej');
	const doRenderu = galeriaZObrazami(zdjecia, { 'jest.jpg': { img: { src: '/jest.jpg' } } });
	assert.equal(doRenderu.length, 1);
	assert.equal(doRenderu[0].plik, 'jest.jpg');
});

test('lista do renderu szuka obrazu po BAZOWEJ nazwie, takze gdy zapisano sciezke', () => {
	const zdjecia = czytajGalerie({
		zdjecia: [{ plik: 'src/lib/assets/uploads/jest.jpg', podpis: 'Jest', alt: 'Opis' }]
	});
	const doRenderu = galeriaZObrazami(zdjecia, { 'jest.jpg': { img: { src: '/jest.jpg' } } });
	assert.equal(doRenderu.length, 1);
});

// =========================================================================================
// The validator: the committed store round-trips, key for key, byte for byte
// =========================================================================================

/** A submitted form, in the shape the action hands the validator. `null` is what an absent key
 *  really looks like coming out of FormData, so absence is expressed that way rather than by
 *  leaving the key out of the object. */
function zrodlo(pola: Record<string, string | undefined>) {
	return {
		get(nazwa: string): unknown {
			const wartosc = pola[nazwa];
			return wartosc === undefined ? null : wartosc;
		}
	};
}

/** One item of the submitted form, at position `indeks`. */
function pozycja(
	indeks: number,
	zdjecie: { plik?: string; podpis?: string; alt?: string; dane?: string; usun?: string }
): Record<string, string> {
	const pola: Record<string, string> = {};
	const wpisz = (klucz: string, wartosc: string | undefined) => {
		if (wartosc !== undefined) {
			pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, klucz)] = wartosc;
		}
	};
	wpisz(POLE_PLIKU, zdjecie.plik ?? '');
	wpisz(POLE_PODPISU, zdjecie.podpis ?? '');
	wpisz(POLE_ALTU, zdjecie.alt ?? '');
	wpisz(POLE_DANYCH, zdjecie.dane ?? '');
	wpisz(POLE_USUNIECIA, zdjecie.usun ?? '');
	return pola;
}

/** The committed gallery, as the form that would have produced it. This is exactly what a fresh
 *  load of /admin/galeria posts back when the editor changes nothing at all. */
function polaZPliku(): Record<string, string> {
	const pola: Record<string, string> = {};
	GALERIA_ZLOZONA.zdjecia.forEach((zdjecie, indeks) => {
		Object.assign(pola, pozycja(indeks, zdjecie));
	});
	if (GALERIA_ZLOZONA.placeholder) pola[POLE_ZASTEPCZA] = 'on';
	return pola;
}

/** A tiny but REAL data URL of the type the allowlist accepts, so the „new picture" branch is
 *  driven by the same shape the island produces rather than by a string that merely looks like
 *  one. Deliberately not a photograph: nothing in this plan's evidence may require one (D-37). */
const DANE_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

test('walidator przyjmuje wartosci, ktore leza dzis w repozytorium', () => {
	const wynik = walidujGaleria(zrodlo(polaZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(wynik.dane, GALERIA_ZLOZONA);
	// Nothing new arrived, so nothing has to be written beside the JSON.
	assert.deepEqual(wynik.zdjecia, []);
});

test('galeria wychodzi z walidatora z dokladnie tymi kluczami i w tej kolejnosci, co plik', () => {
	const wynik = walidujGaleria(zrodlo(polaZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// Ordered, never sorted: the serializer emits keys in insertion order, so a reordering
	// changes the bytes of the file and therefore the diff of every future save.
	assert.deepEqual(Object.keys(wynik.dane), Object.keys(GALERIA_ZLOZONA));
	assert.deepEqual(Object.keys(wynik.dane.zdjecia[0]), Object.keys(GALERIA_ZLOZONA.zdjecia[0]));
});

test('zserializowany wynik walidatora jest bajt w bajt tym, co lezy w repozytorium', () => {
	// Read from disk rather than imported, because an import would compare parsed values and
	// would not see an indent, a key order or a missing trailing newline: precisely the
	// differences that break `prettier --check .` and block every local commit (04.1 D-09).
	const wynik = walidujGaleria(zrodlo(polaZPliku()), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(serializujJson(wynik.dane), NA_DYSKU);
});

test('sciezka, ktora panel zapisuje, wskazuje na istniejacy plik galerii', () => {
	// A save that wrote a path nothing reads would report success to the editor, produce a real
	// commit and a real Cloudflare build, and change nothing a parent can see.
	assert.equal(SCIEZKA_GALERIA, 'src/lib/content/galeria.json');
	assert.doesNotThrow(() => readFileSync(path.join(KORZEN, SCIEZKA_GALERIA), 'utf8'));
});

// =========================================================================================
// The validator: the six refusals of 05-UI-SPEC Contract 8
// =========================================================================================

test('pusty podpis jest odmawiany zdaniem, ktore cytuje wlasna podpowiedz pola', () => {
	for (const puste of [undefined, '', '   ']) {
		const wynik = walidujGaleria(
			zrodlo({ ...polaZPliku(), ...pozycja(0, { ...GALERIA_ZLOZONA.zdjecia[0], podpis: puste }) }),
			new Set()
		);
		assert.equal(wynik.ok, false, `„${String(puste)}" przeszlo jako podpis`);
		if (wynik.ok) return;
		assert.equal(
			wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 0, POLE_PODPISU)],
			KOPIA_WALIDACJA.podpisBrak
		);
	}
});

test('za dlugi podpis cytuje limit, ktory serwer naprawde wymusil', () => {
	const wynik = walidujGaleria(
		zrodlo({
			...polaZPliku(),
			...pozycja(0, { ...GALERIA_ZLOZONA.zdjecia[0], podpis: 'a'.repeat(MAKS_PODPISU + 1) })
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 0, POLE_PODPISU)],
		tekstZaDlugi(MAKS_PODPISU)
	);
});

test('pusty opis alternatywny przy obecnym zdjeciu jest odmawiany (D-15)', () => {
	const wynik = walidujGaleria(
		zrodlo({ ...polaZPliku(), ...pozycja(0, { ...GALERIA_ZLOZONA.zdjecia[0], alt: '' }) }),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 0, POLE_ALTU)],
		KOPIA_WALIDACJA.altBrak
	);
});

test('za dlugi opis alternatywny cytuje swoj wlasny limit', () => {
	const wynik = walidujGaleria(
		zrodlo({
			...polaZPliku(),
			...pozycja(0, { ...GALERIA_ZLOZONA.zdjecia[0], alt: 'a'.repeat(MAKS_ALT + 1) })
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 0, POLE_ALTU)],
		tekstZaDlugi(MAKS_ALT)
	);
});

test('pozycja bez zadnego zdjecia jest odmawiana instrukcja nazywajaca oba wyjscia', () => {
	const wynik = walidujGaleria(
		zrodlo({ ...polaZPliku(), ...pozycja(2, { podpis: 'Nowa sala', alt: 'Opis nowej sali' }) }),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 2, POLE_DANYCH)],
		KOPIA_WALIDACJA.zdjecieGaleriiBrak
	);
});

test('zdjecie, ktore nie jest zdjeciem, jest odmawiane wlasnym zdaniem', () => {
	const wynik = walidujGaleria(
		zrodlo({
			...polaZPliku(),
			...pozycja(2, {
				podpis: 'Nowa sala',
				alt: 'Opis nowej sali',
				dane: 'data:application/pdf;base64,JVBERi0='
			})
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 2, POLE_DANYCH)],
		KOPIA_WALIDACJA.zdjecieZlyTyp
	);
});

// =========================================================================================
// The twelve cap (05 D-23, GAL-8): the SERVER is the gate, the button is the affordance
// =========================================================================================

/** `ile` complete, valid, already-stored-looking items. Every one of them keeps a picture the
 *  build carries, so nothing but the cap can refuse the submission. */
function pelnaLista(ile: number): Record<string, string> {
	const pola: Record<string, string> = {};
	for (let i = 0; i < ile; i++) {
		Object.assign(
			pola,
			pozycja(i, {
				plik: GALERIA_ZLOZONA.zdjecia[i % GALERIA_ZLOZONA.zdjecia.length].plik,
				podpis: `Sala ${i + 1}`,
				alt: `Opis sali numer ${i + 1}`
			})
		);
	}
	return pola;
}

test('dokladnie dwanascie zdjec jeszcze przechodzi', () => {
	const wynik = walidujGaleria(zrodlo(pelnaLista(MAKS_ZDJEC_GALERII)), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.dane.zdjecia.length, MAKS_ZDJEC_GALERII);
});

test('trzynascie zdjec jest odmawiane po stronie serwera, cokolwiek wyrenderowala strona', () => {
	// GAL-8. The screen stops rendering the add button at twelve, but that is an affordance: a
	// hand-built request, or a page from before the limit existed, still has to be refused here.
	const wynik = walidujGaleria(zrodlo(pelnaLista(MAKS_ZDJEC_GALERII + 1)), new Set());
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, MAKS_ZDJEC_GALERII, POLE_DANYCH)],
		KOPIA_WALIDACJA.limitZdjecPrzekroczony
	);
});

test('limit z odmowy, z podpowiedzi grupy i z komunikatu przy przycisku to ta sama liczba', () => {
	// T-04.1-26: a number living in three sentences and one constant is a message that will
	// eventually lie. All three quote the bound the server enforces.
	const liczba = String(MAKS_ZDJEC_GALERII);
	for (const zdanie of [
		KOPIA_WALIDACJA.limitZdjecPrzekroczony,
		KOPIA_EKRAN_GALERII.limitOsiagniety,
		POLA_GALERIA.zdjeciaPodpowiedz
	]) {
		assert.ok(zdanie.includes(liczba), `zdanie nie cytuje limitu ${liczba}: ${zdanie}`);
	}
});

// =========================================================================================
// The two-pass name reservation (T-05-06-01)
// =========================================================================================

test('dwa nowe zdjecia z tym samym podpisem dostaja rozne nazwy w jednym zapisie', () => {
	const wynik = walidujGaleria(
		zrodlo({
			...pozycja(0, { podpis: 'Sala zabaw', alt: 'Pierwsza sala', dane: DANE_JPEG }),
			...pozycja(1, { podpis: 'Sala zabaw', alt: 'Druga sala', dane: DANE_JPEG })
		}),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const nazwy = wynik.zdjecia.map((zdjecie) => zdjecie.nazwa);
	assert.equal(new Set(nazwy).size, 2, `obie pozycje dostaly te sama nazwe: ${nazwy.join(', ')}`);
	assert.deepEqual(
		wynik.dane.zdjecia.map((zdjecie) => zdjecie.plik),
		nazwy
	);
});

test('nowe zdjecie nie dostaje nazwy, ktora ta kompilacja juz niesie', () => {
	const zajeta = `${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`;
	const wynik = walidujGaleria(
		zrodlo(pozycja(0, { podpis: 'Sala zabaw', alt: 'Opis sali', dane: DANE_JPEG })),
		new Set([zajeta])
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.notEqual(wynik.zdjecia[0].nazwa, zajeta);
});

test('nowe zdjecie nie dostaje nazwy, na ktora inna pozycja tego zapisu jeszcze wskazuje', () => {
	// The whole point of the FIRST pass: a name the submission keeps must be off limits before
	// the second pass hands names to new pictures.
	const trzymana = `${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`;
	const wynik = walidujGaleria(
		zrodlo({
			...pozycja(0, { podpis: 'Nowa sala', alt: 'Opis nowej sali', dane: DANE_JPEG }),
			...pozycja(1, { plik: trzymana, podpis: 'Sala zabaw', alt: 'Opis sali' })
		}),
		new Set([trzymana])
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.notEqual(wynik.zdjecia[0].nazwa, trzymana);
});

test('zdjecie nazwane przez panel jest podmieniane W MIEJSCU, bez nowej nazwy (P-21)', () => {
	const wlasna = `${PREFIKS_GALERII}sala-zabaw${ROZSZERZENIE}`;
	const wynik = walidujGaleria(
		zrodlo(
			pozycja(0, { plik: wlasna, podpis: 'Zupełnie inny podpis', alt: 'Opis', dane: DANE_JPEG })
		),
		new Set([wlasna])
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.zdjecia[0].nazwa, wlasna);
	assert.equal(wynik.dane.zdjecia[0].plik, wlasna);
});

test('recznie wgrane zdjecie NIE jest nadpisywane: nowe bajty dostaja wlasna nazwe', () => {
	// The other half of the ownership rule. A hand-placed file may be shared with another page,
	// so replacing an item that carries one writes a NEW file and leaves the old one alone.
	const seed = SEEDY[0];
	const wynik = walidujGaleria(
		zrodlo(pozycja(0, { plik: seed, podpis: 'Sala zabaw', alt: 'Opis', dane: DANE_JPEG })),
		new Set([seed])
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.notEqual(wynik.zdjecia[0].nazwa, seed);
	assert.ok(wynik.zdjecia[0].nazwa.startsWith(PREFIKS_GALERII));
});

// =========================================================================================
// Nothing is defaulted and nothing is spread
// =========================================================================================

test('walidator czyta wszystkie pozycje, zanim cokolwiek odmowi', () => {
	// Contract 10a: one summary panel with every offending control linked from it.
	const wynik = walidujGaleria(
		zrodlo({
			...pozycja(0, { ...GALERIA_ZLOZONA.zdjecia[0], podpis: '' }),
			...pozycja(1, { ...GALERIA_ZLOZONA.zdjecia[1], alt: '' })
		}),
		new Set()
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 0, POLE_PODPISU)],
		KOPIA_WALIDACJA.podpisBrak
	);
	assert.equal(
		wynik.pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, 1, POLE_ALTU)],
		KOPIA_WALIDACJA.altBrak
	);
});

test('odmowa nigdy nie wraca z pusta mapa pol, bo podsumowanie nie mialoby do czego linkowac', () => {
	const wynik = walidujGaleria(zrodlo(pozycja(0, {})), new Set());
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.ok(Object.keys(wynik.pola).length > 0);
	for (const komunikat of Object.values(wynik.pola)) {
		assert.ok(komunikat.trim().length > 0);
	}
});

test('pusta galeria jest legalna, bo redaktor moze usunac wszystkie zdjecia', () => {
	const wynik = walidujGaleria(zrodlo({}), new Set());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(wynik.dane.zdjecia, []);
	assert.equal(wynik.dane.placeholder, false);
});

test('zadne dodatkowe pole z zadania nie trafia do zapisanego pliku', () => {
	const wynik = walidujGaleria(
		zrodlo({ ...polaZPliku(), __proto__: 'x', dopisek: 'x', placeholder: 'x' }),
		new Set()
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.dane), Object.keys(GALERIA_ZLOZONA));
	for (const zdjecie of wynik.dane.zdjecia) {
		assert.deepEqual(Object.keys(zdjecie), ['plik', 'podpis', 'alt']);
	}
});
