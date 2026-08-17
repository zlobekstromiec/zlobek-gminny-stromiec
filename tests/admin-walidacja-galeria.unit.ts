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
import { bazowaNazwa } from '../src/lib/zdjecia-nazwy.ts';
import { czytajGalerie, galeriaZObrazami, zdjecieGalerii } from '../src/lib/galeria.ts';
import {
	MAKS_RDZENIA_GALERII,
	PREFIKS_GALERII,
	ROZSZERZENIE,
	nazwaZdjeciaGalerii,
	zdjecieGaleriiDoUsuniecia
} from '../src/lib/server/admin/uploads.ts';

const KORZEN = path.resolve(import.meta.dirname, '..');

/** Repository path of the store, spelled here so this half of the suite can run before the
 *  validator that exports it exists. */
const SCIEZKA_STORE = 'src/lib/content/galeria.json';

const NA_DYSKU = readFileSync(path.join(KORZEN, SCIEZKA_STORE), 'utf8');

const GALERIA_ZLOZONA = JSON.parse(NA_DYSKU) as {
	placeholder: boolean;
	zdjecia: { plik: string; podpis: string; alt: string }[];
};

/** The two pictures that were placed in this repository BY HAND. Read out of the committed
 *  store rather than retyped: a renamed seed file must rename this list with it, or the whole
 *  undeletability case below would be asserting something about a file nobody ships. */
const SEEDY = GALERIA_ZLOZONA.zdjecia.map((zdjecie) => zdjecie.plik);

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
	for (const seed of SEEDY) {
		assert.equal(
			seed.startsWith(PREFIKS_GALERII),
			false,
			`zdjecie zalozycielskie nosi prefiks panelu: ${seed}`
		);
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

test('lista do renderu szuka obrazu po BAZOWEJ nazwie, takze gdy zapisano sciezke', () => {
	const zdjecia = czytajGalerie({
		zdjecia: [{ plik: 'src/lib/assets/uploads/jest.jpg', podpis: 'Jest', alt: 'Opis' }]
	});
	const doRenderu = galeriaZObrazami(zdjecia, { 'jest.jpg': { img: { src: '/jest.jpg' } } });
	assert.equal(doRenderu.length, 1);
});
