// The aktualność validator, proven against the REAL public reader (Phase 04.1,
// Plan 04.1-06; CMS-02, SC5, threats T-04.1-12 and T-04.1-26).
//
// WHY THE READER IS THE ORACLE. src/lib/server/aktualnosci.ts is the strictest
// consumer in this project: it skips any entry it cannot fully guard, with a build
// warning, so a panel that emitted a subtly wrong shape would not crash anything, it
// would silently publish nothing and leave a warning in a build log nobody reads.
// Asserting the validator against a hand-written expectation would only prove that
// this file and the validator agree with each other. Feeding the output through
// `postFromEntry` makes the public reader the panel's acceptance test, which is the
// only version of this assertion that can fail for the right reason.
//
// The round trip is deliberately the WHOLE trip: validate, serialize with the same
// `serializujJson` a save uses, parse back as JSON.parse would in the build, and only
// then read. A shortcut that fed the validator's object straight to the reader would
// skip the serializer, which is exactly where a value like `undefined` disappears or
// a date turns into something else.
//
// The corpus is GENERATED across the real field combinations rather than written out,
// because a hand-written fixture proves that one fixture works.
//
// Uses Node's built-in runner (no new dependency), named *.unit.ts so Playwright never
// collects it, with `.ts` extensions on the relative imports as type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postFromEntry } from '../src/lib/server/aktualnosci.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import { KATALOG_WPISOW, nazwaPlikuWpisu } from '../src/lib/server/admin/slug.ts';
import {
	MAKS_ALT,
	MAKS_TRESCI,
	MAKS_TYTULU,
	MAKS_ZAJAWKI,
	walidujWpis,
	zGaleria,
	zOkladka
} from '../src/lib/server/admin/walidacja/aktualnosci.ts';
import { MAKS_BASE64 } from '../src/lib/server/admin/obraz.ts';
import { nazwaOkladki } from '../src/lib/server/admin/uploads.ts';
import {
	POLE_DATA,
	POLE_DZIEN,
	POLE_MIESIAC,
	POLE_OBRAZ,
	POLE_OBRAZ_ALT,
	POLE_ROK,
	POLE_TRESC,
	POLE_TYTUL,
	POLE_ZAJAWKA,
	POLE_ZASTEPCZA,
	POLE_ZDJECIE,
	POLE_ZDJECIE_USUN
} from '../src/lib/pola-wpisu.ts';
import { lataDoWyboru, ROK_MAKS, ROK_MIN } from '../src/lib/daty.ts';
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../src/lib/content/panel.ts';

/** A submitted form, in the shape the action hands the validator. `null` is what an
 *  absent key really looks like coming out of FormData, so absence is expressed that
 *  way rather than by leaving the key out of the object. */
function zrodlo(pola: Record<string, string | undefined>) {
	return {
		get(nazwa: string): unknown {
			const wartosc = pola[nazwa];
			return wartosc === undefined ? null : wartosc;
		}
	};
}

/** A complete, valid submission. Every case below starts from this and changes one
 *  thing, so a failure names the thing that changed. */
function poprawne(nadpisz: Record<string, string | undefined> = {}) {
	return zrodlo({
		[POLE_TYTUL]: 'Wielkie otwarcie żłobka',
		[POLE_DZIEN]: '14',
		[POLE_MIESIAC]: '8',
		[POLE_ROK]: '2026',
		[POLE_TRESC]: 'Zapraszamy na uroczyste otwarcie.',
		...nadpisz
	});
}

/** Run `praca` with console.warn captured, and return everything it emitted. The
 *  reader NEVER throws on a bad entry: it warns and returns null, so a suite that
 *  only checked the return value would pass while the build log filled up. */
function przechwycOstrzezenia(praca: () => void): string[] {
	const zebrane: string[] = [];
	const oryginalne = console.warn;
	console.warn = (...argumenty: unknown[]) => {
		zebrane.push(argumenty.map(String).join(' '));
	};
	try {
		praca();
	} finally {
		console.warn = oryginalne;
	}
	return zebrane;
}

/** The same capture, but handing the work's own result back with its type intact. Assigning
 *  into an outer variable from inside a callback is something the compiler cannot follow,
 *  and the variable is unusable afterwards. */
function zOstrzezeniami<T>(praca: () => T): { wynikPracy: T; ostrzezenia: string[] } {
	let wynikPracy!: T;
	const ostrzezenia = przechwycOstrzezenia(() => {
		wynikPracy = praca();
	});
	return { wynikPracy, ostrzezenia };
}

// ---------------------------------------------------------------------------
// Behavior 3: refusals carry the exact Polish sentence from the copy module
// ---------------------------------------------------------------------------

test('pusty tytul jest odrzucony dokladnie tym zdaniem, ktore mowi copy', () => {
	const wynik = walidujWpis(poprawne({ [POLE_TYTUL]: '   ' }));
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.pola[POLE_TYTUL], KOPIA_WALIDACJA.tytulBrak);
});

test('brak tresci jest odrzucony dokladnie tym zdaniem, ktore mowi copy', () => {
	const wynik = walidujWpis(poprawne({ [POLE_TRESC]: undefined }));
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.pola[POLE_TRESC], KOPIA_WALIDACJA.trescBrak);
});

test('niepelna data daje JEDEN komunikat dla calej grupy, nie trzy', () => {
	for (const brak of [POLE_DZIEN, POLE_MIESIAC, POLE_ROK]) {
		const wynik = walidujWpis(poprawne({ [brak]: '' }));
		assert.equal(wynik.ok, false, `brak ${brak} powinien byc odrzucony`);
		if (wynik.ok) continue;
		assert.equal(wynik.pola[POLE_DATA], KOPIA_WALIDACJA.dataNiepelna);
		// One key for the whole fieldset: three messages under three selects would be
		// three announcements of one problem.
		assert.equal(POLE_DZIEN in wynik.pola, false);
		assert.equal(POLE_MIESIAC in wynik.pola, false);
		assert.equal(POLE_ROK in wynik.pola, false);
	}
});

test('data nieistniejaca w kalendarzu jest odrzucona tak samo jak niepelna', () => {
	const wynik = walidujWpis(poprawne({ [POLE_DZIEN]: '31', [POLE_MIESIAC]: '4' }));
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.pola[POLE_DATA], KOPIA_WALIDACJA.dataNiepelna);
});

test('rok poza oknem jest odrzucony w obie strony', () => {
	for (const rok of [String(ROK_MIN - 1), String(ROK_MAKS + 1), '999', '20261']) {
		const wynik = walidujWpis(poprawne({ [POLE_ROK]: rok }));
		assert.equal(wynik.ok, false, `rok ${rok} przeszedl`);
	}
});

test('kilka bledow naraz wraca razem, zeby edytor poprawil je w jednym podejsciu', () => {
	const wynik = walidujWpis(zrodlo({}));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.pola).sort(), [POLE_DATA, POLE_TRESC, POLE_TYTUL].sort());
});

// T-04.1-26. The caps are exported constants and the message quotes the cap the
// server really enforced, so the two can never drift apart.
test('za dlugi tekst jest odrzucony komunikatem podajacym rzeczywisty limit (T-04.1-26)', () => {
	const przypadki: [string, number, string][] = [
		[POLE_TYTUL, MAKS_TYTULU, POLE_TYTUL],
		[POLE_TRESC, MAKS_TRESCI, POLE_TRESC],
		[POLE_ZAJAWKA, MAKS_ZAJAWKI, POLE_ZAJAWKA]
	];
	for (const [pole, limit, klucz] of przypadki) {
		const wynik = walidujWpis(poprawne({ [pole]: 'a'.repeat(limit + 1) }));
		assert.equal(wynik.ok, false, `${pole} o dlugosci ${limit + 1} przeszlo`);
		assert.equal(wynik.ok === false && wynik.pola[klucz], tekstZaDlugi(limit));
	}
	// Positive control: exactly at the cap is accepted, so the case above cannot pass
	// by refusing everything.
	assert.equal(walidujWpis(poprawne({ [POLE_TYTUL]: 'a'.repeat(MAKS_TYTULU) })).ok, true);
});

test('kazdy limit jest liczba dodatnia i wystarczajaca dla realnej tresci', () => {
	for (const limit of [MAKS_TYTULU, MAKS_ZAJAWKI, MAKS_TRESCI, MAKS_ALT]) {
		assert.ok(Number.isInteger(limit) && limit > 0);
	}
	assert.ok(MAKS_TRESCI > MAKS_ZAJAWKI);
	assert.ok(MAKS_ZAJAWKI > MAKS_TYTULU);
});

// ---------------------------------------------------------------------------
// Behaviors 4 and 5: the photo, its required description, and what leaves the
// validator when a NEW one arrives (Plan 04.1-07; D-15, P-19, P-21)
// ---------------------------------------------------------------------------

/** A short, structurally valid data URL: the opening bytes of a JPEG and nothing else.
 *  The header is real because the server checks it (WR-02: everything in the uploads
 *  directory is decoded by the build), and everything behind the header is meaningless on
 *  purpose, because nothing ever looks at it. */
const ZDJECIE_BASE64 = '/9j/4AAQSkZJRgAB';
const ZDJECIE_DATA_URL = `data:image/jpeg;base64,${ZDJECIE_BASE64}`;
const ALT = 'Dzieci malują farbami przy stoliku.';

test('brak zdjecia oznacza brak OBU pol w wyniku, nawet gdy alt zostal przyslany', () => {
	const wynik = walidujWpis(poprawne({ [POLE_OBRAZ_ALT]: 'Dzieci malują farbami.' }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(POLE_OBRAZ in wynik.dane, false);
	assert.equal(POLE_OBRAZ_ALT in wynik.dane, false);
});

// D-15. The rule holds on the SERVER, so it survives with JavaScript disabled.
test('zdjecie bez opisu alternatywnego jest odmowione (D-15)', () => {
	const wynik = walidujWpis(poprawne({ [POLE_OBRAZ]: 'piknik.jpg' }));
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.pola[POLE_OBRAZ_ALT], KOPIA_WALIDACJA.altBrak);
});

test('zdjecie z opisem alternatywnym przechodzi i oba pola trafiaja do wyniku', () => {
	const wynik = walidujWpis(
		poprawne({ [POLE_OBRAZ]: 'piknik.jpg', [POLE_OBRAZ_ALT]: 'Dzieci malują farbami.' })
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.dane.obraz, 'piknik.jpg');
	assert.equal(wynik.dane.obraz_alt, 'Dzieci malują farbami.');
	// Nothing to write and nothing to remove: the entry kept the cover it already had.
	assert.equal(wynik.zdjecie, undefined);
	assert.equal(wynik.usunOkladke, false);
});

// D-15 again, now against the control that can really trigger it. This is the case the
// browser suite repeats with scripting switched off, which is what proves the rule lives
// here and not in the island.
test('NOWE zdjecie bez opisu alternatywnego jest odmowione i nie powstaje zaden wpis (D-15)', () => {
	const wynik = walidujWpis(poprawne({ [POLE_ZDJECIE]: ZDJECIE_DATA_URL }));
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.equal(wynik.pola[POLE_OBRAZ_ALT], KOPIA_WALIDACJA.altBrak);
	// And the alt is the ONLY thing wrong, so the editor is not sent hunting through fields
	// they filled in correctly.
	assert.deepEqual(Object.keys(wynik.pola), [POLE_OBRAZ_ALT]);
});

test('NOWE zdjecie z opisem wychodzi z walidatora jako ladunek, a nie jako pole obraz', () => {
	const wynik = walidujWpis(poprawne({ [POLE_ZDJECIE]: ZDJECIE_DATA_URL, [POLE_OBRAZ_ALT]: ALT }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// P-19: the cover is named after the entry's own filename stem, and on a create that
	// stem comes from the very values being validated here, so the NAME is the route's job.
	assert.equal(POLE_OBRAZ in wynik.dane, false);
	assert.equal(POLE_OBRAZ_ALT in wynik.dane, false);
	assert.equal(wynik.zdjecie?.base64, ZDJECIE_BASE64);
	assert.equal(wynik.zdjecie?.alt, ALT);
	// The payload leaves exactly as it arrived, minus the prefix: no decoding, no
	// re-encoding, no normalisation of any kind.
	assert.equal(ZDJECIE_DATA_URL.endsWith(wynik.zdjecie?.base64 ?? 'x'), true);
});

test('zla wartosc w polu zdjecia daje polskie zdanie o typie, a za duza o rozmiarze', () => {
	const zlyTyp = walidujWpis(
		poprawne({ [POLE_ZDJECIE]: 'data:image/gif;base64,AAAA', [POLE_OBRAZ_ALT]: ALT })
	);
	assert.equal(zlyTyp.ok, false);
	assert.equal(zlyTyp.ok === false && zlyTyp.pola[POLE_ZDJECIE], KOPIA_WALIDACJA.zdjecieZlyTyp);

	const zaDuze = walidujWpis(
		poprawne({
			[POLE_ZDJECIE]: `data:image/jpeg;base64,${'A'.repeat(MAKS_BASE64)}`,
			[POLE_OBRAZ_ALT]: ALT
		})
	);
	assert.equal(zaDuze.ok, false);
	assert.equal(zaDuze.ok === false && zaDuze.pola[POLE_ZDJECIE], KOPIA_WALIDACJA.zdjecieZaDuze);
});

// T-04.1-10. The cover an edit screen carries back is the one value in the submission that
// could otherwise reach a written path.
test('okladka o nazwie spoza listy dozwolonych jest odmowiona, nie oczyszczona (T-04.1-10)', () => {
	for (const wroga of ['../../../etc/passwd', 'a/b/c.jpg', 'ZDJECIE.JPG', 'zdjecie.svg']) {
		const wynik = walidujWpis(poprawne({ [POLE_OBRAZ]: wroga, [POLE_OBRAZ_ALT]: ALT }));
		assert.equal(wynik.ok, false, `przyjeto ${wroga}`);
		assert.equal(wynik.ok === false && wynik.pola[POLE_OBRAZ], KOPIA_WALIDACJA.zdjecieZlyTyp);
	}
});

test('usuniecie zdjecia nie zapisuje zadnego z dwoch pol i zglasza okladke do skasowania', () => {
	const wynik = walidujWpis(
		poprawne({
			[POLE_OBRAZ]: 'piknik.jpg',
			[POLE_OBRAZ_ALT]: ALT,
			[POLE_ZDJECIE_USUN]: '1'
		})
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(POLE_OBRAZ in wynik.dane, false);
	assert.equal(POLE_OBRAZ_ALT in wynik.dane, false);
	assert.equal(wynik.usunOkladke, true);
	assert.equal(wynik.zdjecie, undefined);
	// And with nothing there to begin with it is a no-op rather than an instruction to go
	// looking for a file that never existed.
	const bezOkladki = walidujWpis(poprawne({ [POLE_ZDJECIE_USUN]: '1' }));
	assert.equal(bezOkladki.ok && bezOkladki.usunOkladke, false);
});

// P-21. Choosing a new photo overwrites the old one AT THE SAME PATH, so a replacement
// must never also appear in the delete list: one commit cannot both write and remove one
// file.
test('wybor nowego zdjecia zastepuje stare w miejscu i niczego nie kasuje (P-21)', () => {
	const wynik = walidujWpis(
		poprawne({
			[POLE_OBRAZ]: '2026-08-14-piknik.jpg',
			[POLE_ZDJECIE]: ZDJECIE_DATA_URL,
			[POLE_OBRAZ_ALT]: ALT
		})
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.usunOkladke, false);
	assert.equal(wynik.zdjecie?.base64, ZDJECIE_BASE64);
	assert.equal(POLE_OBRAZ in wynik.dane, false);

	// And a stale removal flag arriving together with a new photo loses: the editor pressed
	// „Usuń zdjęcie" and then changed their mind.
	const zFlaga = walidujWpis(
		poprawne({
			[POLE_OBRAZ]: '2026-08-14-piknik.jpg',
			[POLE_ZDJECIE]: ZDJECIE_DATA_URL,
			[POLE_ZDJECIE_USUN]: '1',
			[POLE_OBRAZ_ALT]: ALT
		})
	);
	assert.equal(zFlaga.ok && zFlaga.zdjecie?.base64, ZDJECIE_BASE64);
	assert.equal(zFlaga.ok && zFlaga.usunOkladke, false);
});

test('okladka doklejona przez zOkladka trafia miedzy tresc a placeholder, nie na koniec', () => {
	const wynik = walidujWpis(
		poprawne({
			[POLE_ZAJAWKA]: 'Streszczenie.',
			[POLE_ZDJECIE]: ZDJECIE_DATA_URL,
			[POLE_OBRAZ_ALT]: ALT,
			[POLE_ZASTEPCZA]: 'on'
		})
	);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const zObrazem = zOkladka(
		wynik.dane,
		nazwaOkladki('2026-08-14-piknik'),
		wynik.zdjecie?.alt ?? ''
	);
	assert.deepEqual(Object.keys(zObrazem), [
		'tytul',
		'data',
		'zajawka',
		'tresc',
		'obraz',
		'obraz_alt',
		'placeholder'
	]);
	assert.equal(zObrazem.obraz, '2026-08-14-piknik.jpg');
	assert.equal(zObrazem.obraz_alt, ALT);
	// An absent optional stays absent: folding a cover in must not materialise a zajawka.
	const bezZajawki = walidujWpis(
		poprawne({ [POLE_ZDJECIE]: ZDJECIE_DATA_URL, [POLE_OBRAZ_ALT]: ALT })
	);
	assert.equal(bezZajawki.ok, true);
	if (!bezZajawki.ok) return;
	assert.deepEqual(Object.keys(zOkladka(bezZajawki.dane, 'a.jpg', ALT)), [
		'tytul',
		'data',
		'tresc',
		'obraz',
		'obraz_alt',
		'placeholder'
	]);
});

test('pole zastepcze jest falszem, gdy checkbox nie przyszedl, i prawda gdy przyszedl', () => {
	const bez = walidujWpis(poprawne());
	assert.equal(bez.ok && bez.dane.placeholder, false);
	const z = walidujWpis(poprawne({ [POLE_ZASTEPCZA]: 'on' }));
	assert.equal(z.ok && z.dane.placeholder, true);
});

test('pusta zajawka nie trafia do wyniku wcale, zamiast trafic jako pusty napis', () => {
	const wynik = walidujWpis(poprawne({ [POLE_ZAJAWKA]: '   ' }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(POLE_ZAJAWKA in wynik.dane, false);
	assert.equal(serializujJson(wynik.dane).includes('zajawka'), false);
});

test('walidator czyta prawdziwy FormData, nie tylko obiekt testowy', () => {
	const dane = new FormData();
	dane.set(POLE_TYTUL, 'Dzień otwarty w żłobku');
	dane.set(POLE_DZIEN, '1');
	dane.set(POLE_MIESIAC, '9');
	dane.set(POLE_ROK, '2026');
	dane.set(POLE_TRESC, 'Zapraszamy wszystkich rodziców.');
	const wynik = walidujWpis(dane);
	assert.equal(wynik.ok, true);
	assert.equal(wynik.ok && wynik.dane.data, '2026-09-01');
});

// ---------------------------------------------------------------------------
// Behavior 4: the generated round trip through the real public reader
// ---------------------------------------------------------------------------

interface Kombinacja {
	nazwa: string;
	pola: Record<string, string | undefined>;
}

/** Cross the field choices the panel can actually emit. Written as a product rather
 *  than as a list, so adding a dimension multiplies the corpus instead of adding one
 *  more hand-written case that resembles the previous one. */
function kombinacje(): Kombinacja[] {
	const tytuly = [
		'Wielkie otwarcie żłobka: 14 sierpnia!',
		'Zażółć gęślą jaźń',
		'Łódź, Śrem i Żagań'
	];
	const tresci = [
		'Jeden akapit i nic więcej.',
		'Pierwszy akapit.\n\nDrugi akapit, po pustej linii.',
		'Tekst z **pogrubieniem** i [odnośnikiem](https://zlobekstromiec.pl).',
		'Lista:\n\n- pierwszy punkt\n- drugi punkt\n- trzeci punkt'
	];
	const daty: [string, string, string][] = [
		['1', '1', '2026'],
		['31', '12', '2026'],
		['29', '2', '2028'],
		['1', '8', String(ROK_MIN)]
	];
	const zajawki = [undefined, 'Krótkie streszczenie wpisu, dwa zdania. Zapraszamy.'];
	const zastepcze = [undefined, 'on'];
	// Plan 04.1-07 adds the photo dimension: every combination above now runs BOTH with a
	// cover already in place and without one, because „the entry has a picture" changes two
	// optional keys in the stored object and the reader guards each of them separately.
	const okladki = [undefined, '2026-08-14-piknik.jpg'];

	const wynik: Kombinacja[] = [];
	for (let i = 0; i < tytuly.length; i++) {
		for (let j = 0; j < tresci.length; j++) {
			for (let k = 0; k < daty.length; k++) {
				for (let l = 0; l < zajawki.length; l++) {
					for (let m = 0; m < zastepcze.length; m++) {
						for (let n = 0; n < okladki.length; n++) {
							const [dzien, miesiac, rok] = daty[k];
							wynik.push({
								nazwa: `tytul ${i}, tresc ${j}, data ${k}, zajawka ${l}, zastepcza ${m}, okladka ${n}`,
								pola: {
									[POLE_TYTUL]: tytuly[i],
									[POLE_DZIEN]: dzien,
									[POLE_MIESIAC]: miesiac,
									[POLE_ROK]: rok,
									[POLE_TRESC]: tresci[j],
									[POLE_ZAJAWKA]: zajawki[l],
									[POLE_ZASTEPCZA]: zastepcze[m],
									[POLE_OBRAZ]: okladki[n],
									[POLE_OBRAZ_ALT]: okladki[n] === undefined ? undefined : ALT
								}
							});
						}
					}
				}
			}
		}
	}
	return wynik;
}

test('kazda kombinacja pol panelu przechodzi przez publiczny czytnik BEZ ostrzezenia (SC5)', () => {
	const korpus = kombinacje();
	assert.ok(korpus.length >= 10, `korpus ma tylko ${korpus.length} kombinacji`);

	for (const przypadek of korpus) {
		const wynik = walidujWpis(zrodlo(przypadek.pola));
		assert.equal(wynik.ok, true, `walidacja odmowila: ${przypadek.nazwa}`);
		if (!wynik.ok) continue;

		// The whole trip, exactly as a save and then a build perform it.
		const bajty = serializujJson(wynik.dane);
		const zParsowane: unknown = JSON.parse(bajty);
		const sciezka = `${KATALOG_WPISOW}/${nazwaPlikuWpisu(wynik.dane.data, wynik.dane.tytul)}`;

		let post: ReturnType<typeof postFromEntry> = null;
		const ostrzezenia = przechwycOstrzezenia(() => {
			post = postFromEntry(sciezka, zParsowane);
		});

		assert.notEqual(post, null, `czytnik pominal wpis: ${przypadek.nazwa}`);
		assert.deepEqual(ostrzezenia, [], `czytnik ostrzegl przy: ${przypadek.nazwa}`);
	}
});

test('czytnik odtwarza dokladnie te wartosci, ktore zapisal panel', () => {
	for (const przypadek of kombinacje()) {
		const wynik = walidujWpis(zrodlo(przypadek.pola));
		if (!wynik.ok) throw new Error(`walidacja odmowila: ${przypadek.nazwa}`);
		const zParsowane: unknown = JSON.parse(serializujJson(wynik.dane));
		const nazwa = nazwaPlikuWpisu(wynik.dane.data, wynik.dane.tytul);
		const post = postFromEntry(`${KATALOG_WPISOW}/${nazwa}`, zParsowane);
		assert.notEqual(post, null);
		if (!post) continue;

		assert.equal(post.tytul, wynik.dane.tytul);
		assert.equal(post.iso, wynik.dane.data);
		assert.equal(post.tresc, wynik.dane.tresc);
		assert.equal(post.placeholder, wynik.dane.placeholder);
		// The cover survives the whole trip as a bare basename (P-20), which is the shape the
		// public card looks up in its by-name map. A path here would still render, because
		// the card takes the last segment, but it would give a future editor something
		// separator-shaped to type into a field that names a file.
		assert.equal(post.obraz, wynik.dane.obraz);
		assert.equal(post.obraz_alt, wynik.dane.obraz_alt);
		if (typeof post.obraz === 'string') assert.equal(post.obraz.includes('/'), false);
		// The slug the reader derives is the filename the panel generated, which is what
		// makes the „Zapisano" panel able to link to the right public URL.
		assert.equal(post.slug, nazwa.replace(/\.json$/, ''));
		assert.equal(post.href, `/aktualnosci/${post.slug}`);
		// An authored zajawka is the excerpt; without one the reader derives it. Asserted
		// because the edit screen must pre-fill the AUTHORED value and never the derived
		// one.
		if (wynik.dane.zajawka === undefined) {
			assert.equal(post.zajawka, undefined);
			assert.ok(post.excerpt.length > 0);
		} else {
			assert.equal(post.zajawka, wynik.dane.zajawka);
			assert.equal(post.excerpt, wynik.dane.zajawka);
		}
	}
});

// The whole create path for an entry with a NEW photo, end to end through the public
// reader: validate, generate the filename, generate the cover name from the same stem,
// fold it in, serialize, parse back and read. This is the one assertion that ties P-19 to
// what the site actually renders.
test('wpis z NOWA okladka przechodzi przez publiczny czytnik bez ostrzezenia (D-14, P-19)', () => {
	for (const przypadek of kombinacje()) {
		const wynik = walidujWpis(
			zrodlo({ ...przypadek.pola, [POLE_ZDJECIE]: ZDJECIE_DATA_URL, [POLE_OBRAZ_ALT]: ALT })
		);
		assert.equal(wynik.ok, true, `walidacja odmowila: ${przypadek.nazwa}`);
		if (!wynik.ok) continue;
		assert.notEqual(wynik.zdjecie, undefined, `brak ladunku: ${przypadek.nazwa}`);

		const nazwaPliku = nazwaPlikuWpisu(wynik.dane.data, wynik.dane.tytul);
		const stem = nazwaPliku.replace(/\.json$/u, '');
		const nazwaObrazu = nazwaOkladki(stem);
		const dane = zOkladka(wynik.dane, nazwaObrazu, wynik.zdjecie?.alt ?? '');

		const zParsowane: unknown = JSON.parse(serializujJson(dane));
		// The result is returned OUT of the capture rather than assigned into an outer
		// variable, so it keeps its type: an assignment inside a callback is something the
		// compiler cannot follow, and the narrowed variable becomes unusable afterwards.
		const { wynikPracy: post, ostrzezenia } = zOstrzezeniami(() =>
			postFromEntry(`${KATALOG_WPISOW}/${nazwaPliku}`, zParsowane)
		);
		assert.notEqual(post, null, `czytnik pominal wpis: ${przypadek.nazwa}`);
		assert.deepEqual(ostrzezenia, [], `czytnik ostrzegl przy: ${przypadek.nazwa}`);
		if (!post) continue;

		// The two files of one entry differ only in their extension, so a person reading the
		// directory sees the pair, and Pitfall 4 cannot happen: the name is inside the glob.
		assert.equal(post.obraz, nazwaObrazu);
		assert.equal(post.obraz_alt, ALT);
		assert.equal(`${post.slug}.jpg`, post.obraz);
		assert.match(post.obraz ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/u);
	}
});

// The output shape is pinned against the files that already exist on disk, because
// „prettier-clean" and „the same shape as the seeds" are two different properties and
// only the second one keeps a diff readable for the person reviewing a staff edit.
test('klucze wyniku wystepuja w tej samej kolejnosci co w plikach zalozycielskich', () => {
	const wynik = walidujWpis(poprawne({ [POLE_ZAJAWKA]: 'Streszczenie.', [POLE_ZASTEPCZA]: 'on' }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.dane), ['tytul', 'data', 'zajawka', 'tresc', 'placeholder']);
});

test('wyjscie panelu jest wcinane tabulatorem i konczy sie jednym znakiem konca wiersza', () => {
	const wynik = walidujWpis(poprawne());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const bajty = serializujJson(wynik.dane);
	assert.ok(bajty.startsWith('{\n\t"tytul"'));
	assert.ok(bajty.endsWith('}\n'));
});

// T-04.1-12. The narrative fields stay the constrained markdown subset the Phase 2 and
// 3 renderers already sanitize, and control characters never survive into a commit.
test('znaki kontrolne nie przezywaja walidacji tresci (T-04.1-12)', () => {
	// The control characters are written as ESCAPES, never as literal bytes. A raw NUL
	// or DEL inside a source file is a character class no editor, diff, patch or
	// copy-paste round trip is guaranteed to preserve, and a silently corrupted class
	// here would let a line break into a value the panel commits. Same correction
	// 04.1-04 had to make to repo.ts, applied before it could be made again.
	const wrogi = 'Tekst z\u0000 bajtami\u007f kontrolnymi\u001b i sekwencja.';
	const wynik = walidujWpis(poprawne({ [POLE_TRESC]: wrogi }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// Checked by CODE POINT rather than by a regular expression: a character class over
	// control characters is what eslint refuses outright (no-control-regex), and it
	// refuses it for a good reason, since such a class is unreadable and silently
	// corruptible in a diff. The escape form above keeps the hostile INPUT explicit
	// while the assertion stays a plain comparison.
	const kontrolne = [...wynik.dane.tresc].filter((znak) => {
		const kod = znak.codePointAt(0) ?? 0;
		return kod === 127 || (kod < 32 && kod !== 10);
	});
	assert.deepEqual(kontrolne, []);
	// Newlines DO survive, because a body without paragraphs is not a body. Paired with
	// the assertion above so a strip-everything implementation cannot pass for one that
	// strips the right set.
	const zAkapitami = walidujWpis(poprawne({ [POLE_TRESC]: 'Pierwszy.\n\nDrugi.' }));
	assert.equal(zAkapitami.ok && zAkapitami.dane.tresc.includes('\n\n'), true);
});

// ---------------------------------------------------------------------------
// The year window the three selects offer
// ---------------------------------------------------------------------------

test('lista lat jest waska, rosnaca i zawsze zawiera rok biezacy', () => {
	const lata = lataDoWyboru(2026);
	assert.ok(lata.includes(2026));
	assert.deepEqual(
		[...lata].sort((a, b) => a - b),
		lata
	);
	assert.ok(lata.length >= 3 && lata.length <= 9, `lista ma ${lata.length} pozycji`);
	assert.equal(new Set(lata).size, lata.length);
});

// An entry saved in 2021 must still open in its own year, or the edit screen would
// silently offer a different date than the one committed.
test('rok juz zapisanego wpisu jest dolaczony, nawet gdy wypada poza oknem', () => {
	const lata = lataDoWyboru(2026, 2021);
	assert.ok(lata.includes(2021));
	assert.ok(lata.includes(2026));
	assert.deepEqual(
		[...lata].sort((a, b) => a - b),
		lata
	);
});

test('lista lat nigdy nie wychodzi poza okno, ktore przyjmuje walidator', () => {
	for (const biezacy of [ROK_MIN, 2026, ROK_MAKS]) {
		for (const rok of lataDoWyboru(biezacy)) {
			assert.ok(rok >= ROK_MIN && rok <= ROK_MAKS, `rok ${rok} poza oknem walidatora`);
		}
	}
});

// ── Galeria wpisu przezywa zapis redaktora ───────────────────────────────────
// The single most expensive failure this file can prevent, because it fails SILENTLY.
// `walidujWpis` rebuilds its result key by key and never spreads the submission, so a key
// it does not know about is simply absent from what gets committed. `zdjecia` is authored
// in a pull request and has no control on the edit screen, so without `zGaleria` the first
// editor to fix a typo in a post's title would delete that post's whole gallery, with no
// error, no warning and nothing in the diff to explain it.

const GALERIA = [
	{ plik: 'otwarcie-poswiecenie.jpg', podpis: 'Poświęcenie', alt: 'Ksiądz przy mównicy' },
	{
		plik: 'otwarcie-przemowienie-maskotka.jpg',
		podpis: 'Przemówienie',
		alt: 'Przemówienie przy mównicy'
	}
];

test('zGaleria wklada zdjecia miedzy obraz_alt a placeholder, nie na koniec', () => {
	const wynik = walidujWpis(poprawne({ [POLE_ZAJAWKA]: 'Streszczenie.' }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(zGaleria(wynik.dane, GALERIA)), [
		'tytul',
		'data',
		'zajawka',
		'tresc',
		'zdjecia',
		'placeholder'
	]);
});

test('zGaleria zachowuje okladke, ktora juz stala w danych', () => {
	const wynik = walidujWpis(poprawne({ [POLE_OBRAZ]: 'stara.jpg', [POLE_OBRAZ_ALT]: ALT }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const zObiema = zGaleria(wynik.dane, GALERIA);
	assert.deepEqual(Object.keys(zObiema), [
		'tytul',
		'data',
		'tresc',
		'obraz',
		'obraz_alt',
		'zdjecia',
		'placeholder'
	]);
	assert.equal(zObiema.obraz, 'stara.jpg');
});

test('zGaleria przy pustej galerii nie dopisuje klucza (bez smiecia w diffie)', () => {
	const wynik = walidujWpis(poprawne({}));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.ok(!Object.keys(zGaleria(wynik.dane, [])).includes('zdjecia'));
});

test('zGaleria kopiuje zdjecia pole po polu, nie przez referencje', () => {
	const wynik = walidujWpis(poprawne({}));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const zrodlo = [{ ...GALERIA[0], nieznane: 'kasowane' }];
	const zapisane = zGaleria(wynik.dane, zrodlo).zdjecia ?? [];
	assert.deepEqual(Object.keys(zapisane[0]).sort(), ['alt', 'plik', 'podpis']);
	assert.notEqual(zapisane[0], zrodlo[0]);
});

test('zOkladka nie gubi galerii wpisu przy podmianie zdjecia', () => {
	const wynik = walidujWpis(poprawne({}));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	// The order the edit route uses: gallery first, cover second.
	const zObiema = zOkladka(zGaleria(wynik.dane, GALERIA), 'nowa.jpg', ALT);
	assert.deepEqual(zObiema.zdjecia, GALERIA);
	assert.deepEqual(Object.keys(zObiema), [
		'tytul',
		'data',
		'tresc',
		'obraz',
		'obraz_alt',
		'zdjecia',
		'placeholder'
	]);
});

// The end-to-end property, asserted through the PUBLIC READER rather than through a
// description of the stored shape: whatever the panel commits must still show the gallery
// on the site. That is the assertion that stays true if the storage shape ever changes.
test('galeria przezywa pelna droge: zapis panelu, serializacja, czytnik publiczny', () => {
	const wynik = walidujWpis(poprawne({ [POLE_TYTUL]: 'Poprawiony tytuł' }));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	const zapisane = zGaleria(wynik.dane, GALERIA);
	const odczytane: unknown = JSON.parse(serializujJson(zapisane));
	const post = postFromEntry(
		`${KATALOG_WPISOW}/${nazwaPlikuWpisu('2026-08-19', 'uroczyste-otwarcie')}`,
		odczytane as never
	);
	assert.notEqual(post, null);
	assert.deepEqual(post?.zdjecia, GALERIA);
});
