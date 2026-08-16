// The dokument validator, proven against the REAL public reader (Phase 04.1, Plan 04.1-08;
// CMS-02, SC5, threats T-04.1-31, T-04.1-32 and T-04.1-11).
//
// WHY THE READER IS THE ORACLE, restated because it is the reason this file is shaped the
// way it is. src/lib/server/dokumenty.ts skips any entry whose `plik` lacks the canonical
// prefix or whose file is missing, with a build warning and nothing else. A panel that
// emitted a subtly wrong path would therefore break nothing, publish nothing, and leave a
// line in a build log nobody reads. Asserting the validator against a hand-written
// expectation would only prove that this file and the validator agree with each other, so
// the output goes through `withMeta`, the reader's own metadata resolver, with the console
// warning captured for the duration.
//
// The round trip is the WHOLE trip: validate, fold in the generated path, serialize with
// the same `serializujJson` a save uses, parse back as JSON.parse would in the build, and
// only then read. A shortcut that fed the validator's object straight to the reader would
// skip the serializer, which is exactly where an `undefined` disappears.
//
// Uses Node's built-in runner (no new dependency), named *.unit.ts so Playwright never
// collects it, with `.ts` extensions on the relative imports as type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAGLOWEK, withMeta, type DokumentEntry } from '../src/lib/server/dokumenty.ts';
import { KATEGORIE } from '../src/lib/kategorie-dokumentow.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import { slugAscii } from '../src/lib/server/admin/slug.ts';
import {
	KATALOG_DOKUMENTOW,
	MAKS_PLIKU_BASE64,
	MAKS_PLIKU_DOKUMENTU,
	PREFIKS_DOKUMENTU,
	ROZSZERZENIA_DOKUMENTU,
	TYPY_DOKUMENTU,
	base64ZDataUrlDokumentu,
	sciezkaDokumentu,
	sciezkaTresciDokumentu,
	sciezkaZPubliczej,
	zaDuzyPlik
} from '../src/lib/server/admin/plik.ts';
import {
	MAKS_NAZWY,
	walidujDokument,
	zPlikiem
} from '../src/lib/server/admin/walidacja/dokumenty.ts';
import {
	POLE_DZIEN,
	POLE_KATEGORIA,
	POLE_MIESIAC,
	POLE_NAZWA,
	POLE_PLIK,
	POLE_ROK,
	POLE_ZASTEPCZA,
	POLE_ZRODLO,
	POLE_WERSJA
} from '../src/lib/pola-dokumentu.ts';
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../src/lib/content/panel.ts';
import { MAKS_ADRES } from '../src/lib/server/admin/walidacja/pola.ts';

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

/** A short, valid payload. The charset is what matters here, never the bytes: nothing in
 *  the panel ever decodes them. */
const LADUNEK = 'SGVsbG8gemxvYmVrIQ==';

function dataUrl(typ: string, ladunek: string = LADUNEK): string {
	return `data:${typ};base64,${ladunek}`;
}

/** The seed document whose FILE really exists in this repository, so the reader's resolver
 *  can stat it. Its slug is what the panel would generate from its name, which is the point:
 *  the fixture is not hand-picked, it is derived. */
const NAZWA_ISTNIEJACA = 'Statut żłobka';
const SLUG_ISTNIEJACY = slugAscii(NAZWA_ISTNIEJACA);

/** Run `dzialanie` with console.warn captured, so a warning the reader emits is an
 *  assertable value instead of noise in the test output. */
function przechwycOstrzezenia(dzialanie: () => void): string[] {
	const zebrane: string[] = [];
	const oryginalny = console.warn;
	console.warn = (...argumenty: unknown[]) => {
		zebrane.push(argumenty.map(String).join(' '));
	};
	try {
		dzialanie();
	} finally {
		console.warn = oryginalny;
	}
	return zebrane;
}

/** A complete, acceptable submission. Individual cases override one key at a time, so a
 *  refusal can only ever be about the key the case changed. */
function komplet(nadpisania: Record<string, string | undefined> = {}) {
	return {
		[POLE_NAZWA]: NAZWA_ISTNIEJACA,
		[POLE_KATEGORIA]: 'statut',
		[POLE_DZIEN]: '29',
		[POLE_MIESIAC]: '1',
		[POLE_ROK]: '2026',
		[POLE_PLIK]: dataUrl('application/pdf'),
		...nadpisania
	};
}

// ---------------------------------------------------------------------------------------
// Behavior 1: what may come out of the file field, and what may not.
// ---------------------------------------------------------------------------------------

test('kazdy dozwolony typ dokumentu oddaje ladunek bez zmiany i wlasciwe rozszerzenie', () => {
	for (const typ of TYPY_DOKUMENTU) {
		const wynik = base64ZDataUrlDokumentu(dataUrl(typ));
		assert.notEqual(wynik, null, `odrzucono dozwolony typ: ${typ}`);
		// UNCHANGED, character for character. Nothing on the server may touch these bytes.
		assert.equal(wynik?.base64, LADUNEK);
		assert.equal(wynik?.rozszerzenie, ROZSZERZENIA_DOKUMENTU[typ]);
		assert.equal(wynik?.rozszerzenie, wynik?.rozszerzenie.toLowerCase());
	}
	assert.equal(TYPY_DOKUMENTU.length, 3);
});

test('kazda wartosc spoza listy dozwolonych typow jest odrzucona', () => {
	const odrzucane: unknown[] = [
		undefined,
		null,
		42,
		{},
		[],
		'',
		'   ',
		LADUNEK,
		dataUrl('image/png'),
		dataUrl('image/jpeg'),
		dataUrl('image/svg+xml'),
		dataUrl('text/html'),
		dataUrl('application/zip'),
		dataUrl('application/x-msdownload'),
		dataUrl('application/octet-stream'),
		dataUrl('application/PDF'),
		'data:application/pdf,SGVsbG8=',
		`data:application/pdf;base64,${LADUNEK} `,
		` data:application/pdf;base64,${LADUNEK}`,
		// Anchor smuggling: a newline makes an unanchored pattern match the second line.
		`data:image/png;base64,AAAA\ndata:application/pdf;base64,${LADUNEK}`,
		`data:application/pdf;base64,${LADUNEK}\ndata:image/png;base64,AAAA`,
		// A quotation mark would break out of the request body commit.ts assembles by
		// concatenation, which is the whole reason the charset is an allow-list.
		'data:application/pdf;base64,AA"A',
		'data:application/pdf;base64,AA%2FA',
		'data:application/pdf;base64,AA/../A'
	];
	for (const wartosc of odrzucane) {
		assert.equal(base64ZDataUrlDokumentu(wartosc), null, `przyjeto: ${String(wartosc)}`);
	}
});

// ---------------------------------------------------------------------------------------
// Behavior 2: the size cap, and the fact that it is load bearing.
// ---------------------------------------------------------------------------------------

test('limit rozmiaru jest wyliczony z limitu bajtow, wiec oba nie moga sie rozjechac', () => {
	assert.equal(MAKS_PLIKU_DOKUMENTU, 10 * 1024 * 1024);
	assert.equal(MAKS_PLIKU_BASE64, Math.ceil(MAKS_PLIKU_DOKUMENTU / 3) * 4);
});

test('poprawny typ powyzej limitu jest odrzucony, a tuz ponizej przyjety', () => {
	const przedrostek = 'data:application/pdf;base64,';
	const zaDuzy = przedrostek + 'A'.repeat(MAKS_PLIKU_BASE64);
	assert.ok(zaDuzy.length > MAKS_PLIKU_BASE64);
	assert.equal(base64ZDataUrlDokumentu(zaDuzy), null);
	assert.equal(zaDuzyPlik(zaDuzy), true);

	// A positive control, so the case above cannot pass because the pattern is broken.
	const mieszczacySie = przedrostek + 'A'.repeat(MAKS_PLIKU_BASE64 - przedrostek.length);
	assert.equal(mieszczacySie.length, MAKS_PLIKU_BASE64);
	assert.equal(zaDuzyPlik(mieszczacySie), false);
	assert.notEqual(base64ZDataUrlDokumentu(mieszczacySie), null);
});

// The ORDER of the two checks is a cost property, not a behavioural one: both orderings
// answer null, so no assertion made from outside the function can observe the difference.
// That is recorded here in the same words Plan 04.1-07 recorded it for the photo, rather
// than claiming a mutation this suite cannot actually catch. What IS asserted is that the
// cap is load bearing at all, above, and that it is checked against the string LENGTH,
// which is the property that makes checking it first cheap.
test('za duzy plik i zly typ to dwie rozne odmowy, wiec komunikaty nie moga sie zlac', () => {
	const zaDuzy = 'data:application/pdf;base64,' + 'A'.repeat(MAKS_PLIKU_BASE64);
	const zlyTyp = dataUrl('application/zip');

	const zbytDuzy = walidujDokument(zrodlo(komplet({ [POLE_PLIK]: zaDuzy })), true);
	assert.equal(zbytDuzy.ok, false);
	if (!zbytDuzy.ok) assert.equal(zbytDuzy.pola[POLE_PLIK], KOPIA_WALIDACJA.plikZaDuzy);

	const niedozwolony = walidujDokument(zrodlo(komplet({ [POLE_PLIK]: zlyTyp })), true);
	assert.equal(niedozwolony.ok, false);
	if (!niedozwolony.ok) assert.equal(niedozwolony.pola[POLE_PLIK], KOPIA_WALIDACJA.plikZlyTyp);
});

// ---------------------------------------------------------------------------------------
// Behavior 3: every refusal, with the exact Polish sentence the UI-SPEC authored.
// ---------------------------------------------------------------------------------------

test('brak nazwy, brak kategorii i brak pliku sa odmowione dokladnie tymi zdaniami', () => {
	const wynik = walidujDokument(
		zrodlo({ [POLE_DZIEN]: '2', [POLE_MIESIAC]: '4', [POLE_ROK]: '2026' }),
		true
	);
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_NAZWA], KOPIA_WALIDACJA.nazwaBrak);
	assert.equal(wynik.pola[POLE_KATEGORIA], KOPIA_WALIDACJA.kategoriaBrak);
	assert.equal(wynik.pola[POLE_PLIK], KOPIA_WALIDACJA.plikBrak);
	// Every field is read before anything is refused, so an editor fixes all of them in one
	// pass instead of discovering the second after correcting the first (Contract 10a).
	assert.equal(Object.keys(wynik.pola).length, 3);
});

test('nieznana kategoria jest odrzucona tak samo jak brak kategorii', () => {
	for (const kategoria of ['', '   ', 'inne', 'REKRUTACJA', 'rodo ', '__proto__']) {
		const wynik = walidujDokument(zrodlo(komplet({ [POLE_KATEGORIA]: kategoria })), true);
		assert.equal(wynik.ok, false, `przyjeto kategorie: ${kategoria}`);
		if (!wynik.ok) assert.equal(wynik.pola[POLE_KATEGORIA], KOPIA_WALIDACJA.kategoriaBrak);
	}
});

test('kazda z trzech kategorii unii jest przyjeta, lacznie z uspiona RODO (P-24)', () => {
	for (const kategoria of KATEGORIE) {
		const wynik = walidujDokument(zrodlo(komplet({ [POLE_KATEGORIA]: kategoria })), true);
		assert.equal(wynik.ok, true, `odrzucono kategorie: ${kategoria}`);
		if (wynik.ok) assert.equal(wynik.dane.kategoria, kategoria);
	}
	assert.deepEqual([...KATEGORIE], ['rekrutacja', 'statut', 'rodo']);
});

test('niepelna data wersji jest odmowiona jednym komunikatem dla calej grupy', () => {
	const niepelne = [
		{ [POLE_DZIEN]: '', [POLE_MIESIAC]: '4', [POLE_ROK]: '2026' },
		{ [POLE_DZIEN]: '2', [POLE_MIESIAC]: '', [POLE_ROK]: '2026' },
		{ [POLE_DZIEN]: '2', [POLE_MIESIAC]: '4', [POLE_ROK]: '' },
		// 31 April is not a date. The calendar check is a Date.UTC round trip in
		// walidacja/pola.ts, so no leap-year rule of our own can be wrong here.
		{ [POLE_DZIEN]: '31', [POLE_MIESIAC]: '4', [POLE_ROK]: '2026' },
		{ [POLE_DZIEN]: '29', [POLE_MIESIAC]: '2', [POLE_ROK]: '2025' }
	];
	for (const data of niepelne) {
		const wynik = walidujDokument(zrodlo(komplet(data)), true);
		assert.equal(wynik.ok, false, `przyjeto date: ${JSON.stringify(data)}`);
		if (!wynik.ok) {
			assert.equal(wynik.pola[POLE_WERSJA], KOPIA_WALIDACJA.wersjaNiepelna);
			assert.equal(wynik.pola[POLE_DZIEN], undefined);
			assert.equal(wynik.pola[POLE_MIESIAC], undefined);
			assert.equal(wynik.pola[POLE_ROK], undefined);
		}
	}
});

test('adres BIP jest przyjmowany tylko jako adres https', () => {
	const zle = [
		'http://ugstromiec.naszbip.pl/zlobek',
		'javascript:alert(1)',
		'data:text/html,x',
		'ugstromiec.naszbip.pl',
		'https://',
		'https://przyklad.pl/a b',
		`https://przyklad.pl/${'a'.repeat(MAKS_ADRES)}`
	];
	for (const adres of zle) {
		const wynik = walidujDokument(zrodlo(komplet({ [POLE_ZRODLO]: adres })), true);
		assert.equal(wynik.ok, false, `przyjeto adres: ${adres}`);
		if (!wynik.ok) assert.equal(wynik.pola[POLE_ZRODLO], KOPIA_WALIDACJA.zrodloNiepoprawne);
	}

	const dobry = walidujDokument(
		zrodlo(komplet({ [POLE_ZRODLO]: 'https://ugstromiec.naszbip.pl/zlobek' })),
		true
	);
	assert.equal(dobry.ok, true);
	if (dobry.ok) assert.equal(dobry.dane.zrodlo_bip, 'https://ugstromiec.naszbip.pl/zlobek');
});

test('pole opcjonalne pominiete w calosci, nigdy zapisane jako puste', () => {
	const wynik = walidujDokument(zrodlo(komplet()), true);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal('zrodlo_bip' in wynik.dane, false);
	const zapisane = zPlikiem(wynik.dane, sciezkaDokumentu(wynik.slug, '.pdf').publiczna);
	assert.equal(serializujJson(zapisane).includes('zrodlo_bip'), false);
});

test('za dluga nazwa cytuje limit, ktory serwer naprawde egzekwowal', () => {
	const wynik = walidujDokument(
		zrodlo(komplet({ [POLE_NAZWA]: 'x'.repeat(MAKS_NAZWY + 1) })),
		true
	);
	assert.equal(wynik.ok, false);
	if (!wynik.ok) assert.equal(wynik.pola[POLE_NAZWA], tekstZaDlugi(MAKS_NAZWY));
});

test('nazwa zlozona wylacznie ze znakow interpunkcyjnych jest odmowiona', () => {
	// The slug is the document's identity and its filename. A name that slugs to nothing
	// would produce a file called only its extension, which no editor could ever find again.
	for (const nazwa of ['***', '   ...   ', '???']) {
		const wynik = walidujDokument(zrodlo(komplet({ [POLE_NAZWA]: nazwa })), true);
		assert.equal(wynik.ok, false, `przyjeto nazwe: ${nazwa}`);
		if (!wynik.ok) assert.equal(wynik.pola[POLE_NAZWA], KOPIA_WALIDACJA.nazwaBrak);
	}
});

test('brak pliku jest bledem przy dodawaniu i jest w porzadku przy edycji', () => {
	const dodanie = walidujDokument(zrodlo(komplet({ [POLE_PLIK]: undefined })), true);
	assert.equal(dodanie.ok, false);
	if (!dodanie.ok) assert.equal(dodanie.pola[POLE_PLIK], KOPIA_WALIDACJA.plikBrak);

	const edycja = walidujDokument(zrodlo(komplet({ [POLE_PLIK]: undefined })), false);
	assert.equal(edycja.ok, true);
	// „No new file" is not „no file": the route keeps the one the entry already has.
	if (edycja.ok) assert.equal(edycja.plik, undefined);
});

test('flaga tresci zastepczej idzie za konwencja HTML: brak klucza to falsz', () => {
	const bez = walidujDokument(zrodlo(komplet()), true);
	assert.equal(bez.ok, true);
	if (bez.ok) assert.equal(bez.dane.placeholder, false);

	const z = walidujDokument(zrodlo(komplet({ [POLE_ZASTEPCZA]: 'on' })), true);
	assert.equal(z.ok, true);
	if (z.ok) assert.equal(z.dane.placeholder, true);
});

// ---------------------------------------------------------------------------------------
// Behavior 4: the public reader is the acceptance test.
// ---------------------------------------------------------------------------------------

test('czytnik publiczny przyjmuje wpis, ktory wlasnie zwalidowal panel (SC5)', () => {
	const wynik = walidujDokument(
		zrodlo(komplet({ [POLE_ZRODLO]: 'https://ugstromiec.naszbip.pl/zlobek' })),
		true
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	const sciezki = sciezkaDokumentu(wynik.slug, wynik.plik?.rozszerzenie ?? '.pdf');
	const zapisane = zPlikiem(wynik.dane, sciezki.publiczna);
	const zParsowane = JSON.parse(serializujJson(zapisane)) as DokumentEntry;

	let zMeta: ReturnType<typeof withMeta> = null;
	const ostrzezenia = przechwycOstrzezenia(() => {
		zMeta = withMeta(zParsowane);
	});

	assert.notEqual(zMeta, null, 'czytnik pominal wpis, ktory panel wlasnie zapisal');
	assert.deepEqual(ostrzezenia, []);
	// The reader computes the type and the size itself (D-14), so the panel must never have
	// stored either of them.
	assert.equal(zMeta!.typ, 'PDF');
	assert.match(zMeta!.meta, /wersja z 29\.01\.2026/);
	assert.equal('typ' in zapisane, false);
	assert.equal('rozmiar' in zapisane, false);
});

test('czytnik pomija wpis ze sciezka bez kanonicznego przedrostka i ostrzega o tym', () => {
	const wynik = walidujDokument(zrodlo(komplet()), true);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;

	// Exactly what the panel is incapable of emitting, which is the point of the case: if a
	// refactor ever let the prefix drop, this is what the site would do with the result.
	const zle = zPlikiem(wynik.dane, `/${SLUG_ISTNIEJACY}.pdf`);
	let zMeta: ReturnType<typeof withMeta> = null;
	const ostrzezenia = przechwycOstrzezenia(() => {
		zMeta = withMeta(JSON.parse(serializujJson(zle)) as DokumentEntry);
	});
	assert.equal(zMeta, null);
	assert.equal(ostrzezenia.length, 1);
	assert.match(ostrzezenia[0], /invalid plik path/);
});

test('naglowki czytnika opisuja dokladnie te kategorie i w tej samej kolejnosci', () => {
	assert.deepEqual(Object.keys(NAGLOWEK), [...KATEGORIE]);
	for (const kategoria of KATEGORIE) {
		assert.ok(NAGLOWEK[kategoria].trim().length > 0);
	}
});

// ---------------------------------------------------------------------------------------
// Behavior 5: the version date keeps the shape the seeds use.
// ---------------------------------------------------------------------------------------

test('wersja jest zapisana w ksztalcie z kropkami, nigdy w ksztalcie ISO', () => {
	const wynik = walidujDokument(
		zrodlo(komplet({ [POLE_DZIEN]: '2', [POLE_MIESIAC]: '4', [POLE_ROK]: '2026' })),
		true
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// Zero padded on both parts, exactly as the three seed files store it.
	assert.equal(wynik.dane.wersja, '02.04.2026');
	assert.equal(/^\d{4}-\d{2}-\d{2}$/.test(wynik.dane.wersja), false);
});

test('klucze zapisanego wpisu sa dokladnie te i w tej kolejnosci, co w plikach zrodlowych', () => {
	const bez = walidujDokument(zrodlo(komplet()), true);
	assert.equal(bez.ok, true);
	if (!bez.ok) return;
	assert.deepEqual(Object.keys(zPlikiem(bez.dane, '/dokumenty/a.pdf')), [
		'nazwa',
		'kategoria',
		'plik',
		'wersja',
		'placeholder'
	]);

	const z = walidujDokument(zrodlo(komplet({ [POLE_ZRODLO]: 'https://przyklad.pl/a' })), true);
	assert.equal(z.ok, true);
	if (!z.ok) return;
	assert.deepEqual(Object.keys(zPlikiem(z.dane, '/dokumenty/a.pdf')), [
		'nazwa',
		'kategoria',
		'plik',
		'wersja',
		'zrodlo_bip',
		'placeholder'
	]);
});

// ---------------------------------------------------------------------------------------
// Behavior 6: the written path, which is the only place a typed value could reach a file.
// ---------------------------------------------------------------------------------------

test('sciezka pliku powstaje ze slugu nazwy i rozszerzenia z listy dozwolonych', () => {
	for (const typ of TYPY_DOKUMENTU) {
		const rozszerzenie = ROZSZERZENIA_DOKUMENTU[typ];
		const sciezki = sciezkaDokumentu(SLUG_ISTNIEJACY, rozszerzenie);
		assert.equal(sciezki.repo, `${KATALOG_DOKUMENTOW}/${SLUG_ISTNIEJACY}${rozszerzenie}`);
		assert.equal(sciezki.publiczna, `${PREFIKS_DOKUMENTU}${SLUG_ISTNIEJACY}${rozszerzenie}`);
		assert.equal(sciezki.repo, sciezki.repo.toLowerCase());
		assert.equal(sciezki.publiczna, sciezki.publiczna.toLowerCase());
	}
});

test('zadna wroga nazwa dokumentu nie wychodzi ze swojego katalogu (T-04.1-31)', () => {
	const wrogie = [
		'../../etc/passwd',
		'..\\..\\windows\\system32',
		'a/b/c',
		'dokument.json',
		'%2e%2e%2fetc',
		'plik .pdf',
		'ŻŁÓBEK/../../x'
	];
	for (const nazwa of wrogie) {
		const slug = slugAscii(nazwa);
		const sciezki = sciezkaDokumentu(slug, '.pdf');
		for (const sciezka of [sciezki.repo, sciezki.publiczna]) {
			assert.equal(sciezka.includes('..'), false, `traversal w: ${sciezka}`);
			assert.equal(sciezka.includes('\\'), false, `separator w: ${sciezka}`);
			assert.equal(sciezka.includes('%'), false, `kodowanie w: ${sciezka}`);
		}
		assert.ok(sciezki.repo.startsWith(`${KATALOG_DOKUMENTOW}/`));
		assert.ok(sciezki.publiczna.startsWith(PREFIKS_DOKUMENTU));
		// Positive control: exactly one separator beyond the directory itself.
		assert.equal(sciezki.publiczna.split('/').length, 3);
	}
});

test('sciezka repozytorium powstaje z wartosci zapisanej we wpisie, nigdy z zadania', () => {
	assert.equal(
		sciezkaZPubliczej(`${PREFIKS_DOKUMENTU}statut-zlobka.pdf`),
		`${KATALOG_DOKUMENTOW}/statut-zlobka.pdf`
	);
	for (const wartosc of [
		undefined,
		null,
		7,
		'',
		'/inne/statut.pdf',
		'/dokumenty/',
		'/dokumenty/../../secret',
		'/dokumenty/a/b.pdf',
		'/dokumenty/..\\b.pdf',
		'dokumenty/statut.pdf'
	]) {
		assert.equal(sciezkaZPubliczej(wartosc), null, `przyjeto: ${String(wartosc)}`);
	}
});

test('sciezka wpisu prowadzi do katalogu tresci, ktory globuje czytnik', () => {
	assert.equal(
		sciezkaTresciDokumentu(SLUG_ISTNIEJACY),
		`src/lib/content/dokumenty/${SLUG_ISTNIEJACY}.json`
	);
});

test('slug dokumentu powstaje z nazwy i jest zwracany razem z walidacja', () => {
	const wynik = walidujDokument(
		zrodlo(komplet({ [POLE_NAZWA]: 'Wniosek o przyjęcie dziecka' })),
		true
	);
	assert.equal(wynik.ok, true);
	if (wynik.ok) assert.equal(wynik.slug, 'wniosek-o-przyjecie-dziecka');
});
