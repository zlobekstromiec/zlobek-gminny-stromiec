// Panel JSON serializer unit test (Phase 04.1, Plan 04.1-04). This is the
// executable acceptance criterion for D-09: every byte the panel writes into
// src/lib/content/ must be what this repository's own prettier would have
// written, so panel output stays inside the normal quality gate instead of
// blocking every local commit through the pre-commit hook.
//
// This suite is PROPERTY based on purpose, not example based. The Phase 3 defect
// recorded in STATE.md (content written with a two-space indent) would have
// passed an example-based test that merely asserted "starts with a tab", and it
// would have passed a test that only covered the one shape somebody happened to
// think of. So the corpus is GENERATED: every value kind the real content files
// contain is crossed with every structural position it can occupy, and the three
// real content files are folded in as controls.
//
// The oracle is the real formatter, not a description of it. Each generated shape
// is serialized, then fed back through prettier in its standard-input file-path
// mode with a path under the content directory (so prettier resolves the same
// prettier.config.js and the same JSON parser it uses in `npm run lint`), and the
// two byte strings must be identical. Anything less is a proxy for the gate
// rather than the gate.
//
// Do NOT weaken these assertions to make the suite pass. If prettier changes its
// heuristic, the correct response is to change the serializer, not the test: the
// pre-commit hook runs prettier, and prettier wins.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22.23.2. Intentionally named *.unit.ts so
// Playwright's spec|test matcher never collects it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';

const KORZEN = path.resolve(import.meta.dirname, '..');

// The repository's own prettier binary, resolved absolutely rather than through a
// package runner: a package runner may resolve a different copy, and the whole
// point of this suite is that the formatter here is the formatter the hook runs.
const PRETTIER = path.join(KORZEN, 'node_modules', '.bin', 'prettier');

// A path that does not exist and never will. prettier only needs it to pick the
// parser and to resolve the config, and a path under the content directory is the
// one that matters: src/lib/content/ is deliberately NOT in .prettierignore
// (D-09), so this is exactly the resolution a real panel-written file gets.
const SCIEZKA_SONDY = 'src/lib/content/sonda-testowa.json';

function przezPrettier(tresc: string): string {
	return execFileSync(PRETTIER, ['--stdin-filepath', SCIEZKA_SONDY], {
		cwd: KORZEN,
		input: tresc,
		encoding: 'utf8'
	});
}

// --- the generator -------------------------------------------------------

// One entry per value kind that appears in, or could plausibly appear in, the
// real content files. Each is named so a failure says which kind broke.
const ATOMY: ReadonlyArray<readonly [string, unknown]> = [
	['zero', 0],
	['liczba calkowita', 2026],
	['liczba ulamkowa', 1.5],
	['prawda', true],
	['falsz', false],
	['wartosc pusta', null],
	['pusty napis', ''],
	['krotki napis ASCII', 'Test'],
	['polskie znaki z kreskowanym l', 'Żłobek, ćma, źdźbło, gęś, ąę, ńó, Świdnica, ŁÓDŹ'],
	['en dash w zakresie godzin', '6:30–8:30'],
	['napis dluzszy niz printWidth', 'a'.repeat(140)],
	['napis z zamianami wiersza', 'pierwszy\ndrugi\ntrzeci'],
	['napis z cudzyslowem i ukosnikiem', 'cytat: "tak", sciezka: C:\\katalog'],
	['napis z tabulatorem', 'przed\tpo'],
	[
		'pogrubienie i odnosnik jak w misji',
		'Otaczamy **ciepla opieka**, zobacz [BIP](https://example.test/).'
	]
];

// Every structural position an atom can occupy in the real files: a top-level
// field, an element of an array of objects (the wartosci and rows shape), and a
// value nested one object deep.
const OPRAWY: ReadonlyArray<readonly [string, (w: unknown) => unknown]> = [
	['pole najwyzszego poziomu', (w) => ({ placeholder: true, pole: w })],
	['tablica obiektow dwupolowych', (w) => ({ rows: [{ time: '6:30–8:30', what: w }] })],
	['obiekt zagniezdzony', (w) => ({ sekcja: { podsekcja: { pole: w } } })]
];

const STRUKTURALNE: ReadonlyArray<readonly [string, unknown]> = [
	['pusty obiekt', {}],
	['pusta tablica na najwyzszym poziomie', []],
	['obiekt z pustym obiektem', { obraz: {} }],
	['obiekt z pusta tablica', { wartosci: [] }],
	['tablica obiektow jednopolowych', [{ tytul: 'a' }, { tytul: 'b' }]],
	['jedno pole', { a: 1 }]
];

function probki(): Array<readonly [string, unknown]> {
	const lista: Array<readonly [string, unknown]> = [...STRUKTURALNE];
	for (const [nazwaAtomu, wartosc] of ATOMY) {
		for (const [nazwaOprawy, oprawa] of OPRAWY) {
			lista.push([`${nazwaAtomu} w pozycji: ${nazwaOprawy}`, oprawa(wartosc)]);
		}
	}
	// One deep combination of everything at once, because a formatter heuristic
	// that holds for each kind alone can still break where they meet.
	lista.push([
		'gleboka kombinacja wszystkich rodzajow',
		{
			placeholder: true,
			lead: ATOMY[8][1],
			wartosci: ATOMY.map(([nazwa, wartosc]) => ({ tytul: nazwa, opis: wartosc })),
			rows: [{ time: '11:00–11:30', what: ATOMY[10][1] }],
			zagniezdzenie: { a: { b: { c: ATOMY.map(([, w]) => w) } } }
		}
	]);
	return lista;
}

// The real files are the strongest control available: if the panel ever rewrites
// one of them, this is the exact content that goes through the serializer.
const PLIKI_KONTROLNE = [
	'src/lib/content/o-nas.json',
	'src/lib/content/day-plan.json',
	'src/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka.json',
	'src/lib/content/dokumenty/statut-zlobka.json'
];

// --- the assertions ------------------------------------------------------

test('wyjscie panelu jest bajt w bajt tym, co napisalby prettier (D-09)', () => {
	const lista = probki();
	assert.ok(lista.length >= 12, `oczekiwano co najmniej 12 ksztaltow, jest ${lista.length}`);
	for (const [nazwa, dane] of lista) {
		const wyjscie = serializujJson(dane);
		assert.equal(przezPrettier(wyjscie), wyjscie, `rozjazd z prettier dla ksztaltu: ${nazwa}`);
	}
});

test('wyjscie panelu konczy sie dokladnie jednym znakiem konca wiersza', () => {
	for (const [nazwa, dane] of probki()) {
		const wyjscie = serializujJson(dane);
		assert.equal(wyjscie.endsWith('\n'), true, `brak konca wiersza dla: ${nazwa}`);
		assert.equal(wyjscie.endsWith('\n\n'), false, `podwojny koniec wiersza dla: ${nazwa}`);
	}
});

test('zaden wiersz wyjscia nie zaczyna sie od dwoch spacji (obrona przed defektem z fazy 3)', () => {
	for (const [nazwa, dane] of probki()) {
		for (const wiersz of serializujJson(dane).split('\n')) {
			assert.equal(wiersz.startsWith('  '), false, `wciecie spacjami w ksztalcie: ${nazwa}`);
		}
	}
});

test('wciecie jest tabulatorem, nie dwiema spacjami', () => {
	// The direct statement of the Phase 3 defect, kept as its own case so a
	// failure names the cause rather than a formatter mismatch.
	assert.equal(serializujJson({ a: 1 }), '{\n\t"a": 1\n}\n');
});

test('realne pliki tresci przechodza przez serializator i zostaja zgodne z prettier', () => {
	for (const wzgledna of PLIKI_KONTROLNE) {
		const surowe = readFileSync(path.join(KORZEN, wzgledna), 'utf8');
		const wyjscie = serializujJson(JSON.parse(surowe));
		assert.equal(przezPrettier(wyjscie), wyjscie, `rozjazd z prettier dla pliku: ${wzgledna}`);
	}
});

test('serializator rozwija jednowierszowe obiekty zagniezdzone i to jest oczekiwane', () => {
	// day-plan.json holds its rows as one-line objects today, which prettier also
	// accepts, because prettier collapses an object whose source has no newline
	// after the opening brace. The first panel save expands them. That is a real,
	// one-off diff and it is recorded here so nobody later reads it as a defect
	// and "fixes" it by adding the content directory to the prettier ignore list,
	// which D-09 explicitly rejects.
	const surowe = readFileSync(path.join(KORZEN, 'src/lib/content/day-plan.json'), 'utf8');
	assert.equal(
		surowe.includes('{ "time"'),
		true,
		'plik zrodlowy nie ma juz jednowierszowych wierszy'
	);
	assert.equal(serializujJson(JSON.parse(surowe)).includes('{ "time"'), false);
});
