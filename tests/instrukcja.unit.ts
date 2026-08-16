// Contract test for docs/instrukcja-cms.md, the one instrukcja (04.1-10, P-27; CMS-03,
// D-18, D-21).
//
// THE DOCUMENT IS SHIPPED SOFTWARE. It is rendered verbatim at /admin/pomoc, it is linked
// from the footer of every panel screen, and it is the thing a staff member is handed at
// the UAT. So it is pinned like any other surface: Polish only, no emoji, no em dash, and
// every screen name and button label it quotes must be the string the panel really
// renders rather than a paraphrase somebody wrote from memory.
//
// THE PROHIBITION THIS FILE EXISTS FOR. The previous instrukcja documented a login that
// no longer exists, end to end. A single surviving sentence sending a staff member to a
// code-hosting account would be worse than no instrukcja at all, because it would send
// somebody looking for an account nobody has. Three greps make that impossible to
// reintroduce, and they are asserted as an ABSENCE, which is why the label cases below
// exist too: an absence assertion passes on an empty file.
//
// Uses Node's built-in runner (no new dependency). Named *.unit.ts so Playwright's spec
// matcher never collects it. The relative imports carry the `.ts` extension, which that
// type stripping requires.
//
// SECOND, ENFORCED CHECK (04.1-VALIDATION.md, caveat AG-3): `npm run test:unit` runs in
// no automated gate, so tests/admin-polski.spec.ts renders this document in a real
// browser and sweeps its text for English chrome there, and tests/admin-pulpit.spec.ts
// asserts the three forbidden words are absent from the RENDERED Pomoc screen. Neither
// suite can be satisfied by a stale module graph or a passing grep on a file nobody ships.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
	KOPIA_FORMATOWANIE,
	KOPIA_LISTY,
	KOPIA_LOGOWANIE,
	KOPIA_MAIL_KOD,
	KOPIA_NABOR,
	KOPIA_PLIKU,
	KOPIA_POWLOKA,
	KOPIA_PULPIT,
	KOPIA_USUWANIE,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	POLA_DOKUMENT,
	POLA_O_NAS,
	POLA_PLAN_DNIA,
	POLA_WPIS
} from '../src/lib/content/panel.ts';
import { renderInstrukcja } from '../src/lib/markdown.ts';
import { KONTROLA_DODATNIA, znajdzAngielskie } from './fixtures/angielskie-chrome.ts';

/** Read rather than imported. These assertions are about the bytes that ship, and a file
 *  read cannot be satisfied by a module graph that was built earlier. */
const DOKUMENT = readFileSync(new URL('../docs/instrukcja-cms.md', import.meta.url), 'utf8');

/** The document is hard wrapped at 100 characters by prettier, so a quoted sentence long
 *  enough to matter is split across two lines in the source and reads as one sentence on
 *  the page. Whitespace is therefore collapsed before any quote is looked for: comparing
 *  against the raw bytes would make the assertion depend on where the wrap happened to
 *  fall, which is a property of the formatter and not of the copy. */
const ZWARTY = DOKUMENT.replace(/\s+/gu, ' ');

/** The required-field asterisk is a marker the panel appends to a label, not part of the
 *  field's name, and the document explains the marker once instead of repeating it on
 *  every field. Labels are therefore compared without it. */
function bezGwiazdki(etykieta: string): string {
	return etykieta.replace(/\s*\*$/u, '');
}

test('instrukcja nie wysyla nikogo do zewnetrznego serwisu ani do usunietego edytora', () => {
	for (const zakazane of ['sveltia', 'github', 'oauth']) {
		assert.equal(
			new RegExp(zakazane, 'iu').test(DOKUMENT),
			false,
			`instrukcja wciaz wspomina "${zakazane}"`
		);
	}
	// The absence cases above pass on an empty file, so the document is also asserted to
	// be a real document.
	assert.ok(DOKUMENT.length > 6000, 'instrukcja jest podejrzanie krotka');
});

test('instrukcja nie zawiera pauzy ani emoji (reguly copy, C-11)', () => {
	assert.equal(DOKUMENT.includes('—'), false, 'pauza w instrukcji');
	assert.equal(/\p{Extended_Pictographic}/u.test(DOKUMENT), false, 'emoji w instrukcji');
});

// Same rule and the same reasoning as the copy sweep: the half dash is allowed inside a
// numeric range and banned everywhere else, and the allowance is asserted AS an allowance
// so a suite cannot pass by the range losing its dash.
test('polpauza w instrukcji wystepuje wylacznie w zakresie liczbowym', () => {
	const wiersze = DOKUMENT.split('\n').filter((wiersz) => wiersz.includes('–'));
	assert.ok(wiersze.length > 0, 'brak zakresu liczbowego z polpauza');
	for (const wiersz of wiersze) {
		assert.match(wiersz, /\d\s*–\s*\d/u, `polpauza poza zakresem liczbowym: ${wiersz}`);
	}
});

test('instrukcja nie niesie angielskiego chrome (SC2)', () => {
	// Positive control first: a detector that matches nothing makes „clean" and „broken"
	// look identical, which is the whole reason this control travels with the list.
	for (const probka of KONTROLA_DODATNIA) {
		assert.notDeepEqual(znajdzAngielskie(probka), [], `wykrywacz przepuscil: ${probka}`);
	}
	assert.deepEqual(znajdzAngielskie(DOKUMENT), []);
});

test('instrukcja ma dokladnie jeden naglowek pierwszego poziomu, na samej gorze', () => {
	const pierwszego = DOKUMENT.split('\n').filter((wiersz) => wiersz.startsWith('# '));
	assert.equal(pierwszego.length, 1);
	assert.ok(DOKUMENT.startsWith('# '), 'tytul nie stoi na poczatku dokumentu');
});

// The nine topics the UI-SPEC's „Discretion Decisions Recorded" row names, plus the
// closing section for whoever administers the site later. Each must have a heading of its
// own: a sentence buried in another section is not a section somebody can find.
test('instrukcja ma sekcje dla kazdego wymaganego tematu', () => {
	const naglowki = DOKUMENT.split('\n')
		.filter((wiersz) => wiersz.startsWith('## '))
		.map((wiersz) => wiersz.slice(3).trim());
	const wymagane: [string, RegExp][] = [
		['logowanie', /^\d+\.\s+Logowanie$/u],
		['pulpit', /^\d+\.\s+Pulpit$/u],
		['dodanie wpisu', /^\d+\.\s+Dodanie wpisu/u],
		['dodanie zdjecia z opisem alternatywnym', /^\d+\.\s+Dodanie zdjęcia z opisem alternatywnym$/u],
		['dokumenty', /^\d+\.\s+Dokumenty$/u],
		['plan dnia', /^\d+\.\s+Plan dnia$/u],
		['nabor', /^\d+\.\s+Nabór$/u],
		['gdy zmiany nie widac', /^\d+\.\s+Co zrobić, gdy zmiany nie widać$/u],
		['gdy panel odmowi zapisania', /^\d+\.\s+Co zrobić, gdy panel odmówi zapisania$/u],
		['dodanie i usuniecie redaktora', /dodanie i usunięcie redaktora$/u]
	];
	for (const [temat, wzorzec] of wymagane) {
		assert.ok(
			naglowki.some((naglowek) => wzorzec.test(naglowek)),
			`brak sekcji: ${temat}`
		);
	}
	assert.ok(naglowki.length >= 10);
});

// The document is rendered into a page that already owns an h1, so the heading structure
// under it must never skip a level. Asserted on the SOURCE, because that is where a later
// edit would introduce the skip.
test('poziomy naglowkow w instrukcji nigdy nie przeskakuja', () => {
	let poprzedni = 1;
	for (const wiersz of DOKUMENT.split('\n')) {
		const trafienie = wiersz.match(/^(#{1,6})\s/u);
		if (!trafienie) continue;
		const poziom = trafienie[1].length;
		assert.ok(poziom <= poprzedni + 1, `przeskok poziomu naglowka: ${wiersz}`);
		poprzedni = poziom;
	}
});

// Every screen name and button label the instrukcja quotes has to be the string the panel
// really renders. A paraphrase is how an editor ends up hunting for a button that is
// spelled slightly differently, which for this user group is indistinguishable from the
// panel being broken.
test('kazda nazwa ekranu i etykieta przycisku jest cytatem z modulu kopii', () => {
	const etykiety = [
		KOPIA_LOGOWANIE.adresEtykieta,
		KOPIA_LOGOWANIE.adresPrzycisk,
		KOPIA_LOGOWANIE.kodEtykieta,
		KOPIA_LOGOWANIE.kodPrzycisk,
		KOPIA_LOGOWANIE.ponowneWyslanie,
		KOPIA_LOGOWANIE.innyAdres,
		KOPIA_MAIL_KOD.temat,
		KOPIA_POWLOKA.wyloguj,
		KOPIA_POWLOKA.stopkaLink,
		KOPIA_PULPIT.naglowek,
		KOPIA_PULPIT.aktualnosciTytul,
		KOPIA_PULPIT.oNasTytul,
		KOPIA_PULPIT.planDniaTytul,
		KOPIA_PULPIT.dokumentyTytul,
		KOPIA_PULPIT.naborTytul,
		KOPIA_PULPIT.pomocTytul,
		KOPIA_LISTY.aktualnosciAkcja,
		KOPIA_LISTY.dokumentyAkcja,
		KOPIA_LISTY.edytuj,
		KOPIA_LISTY.usun,
		KOPIA_LISTY.odznakaZastepcza,
		KOPIA_LISTY.pustaKategoria,
		KOPIA_ZAPIS.zapisz,
		KOPIA_ZAPIS.anuluj,
		KOPIA_ZAPIS.zapisanoNaglowek,
		KOPIA_ZAPIS.konfliktNaglowek,
		KOPIA_ZAPIS.konfliktAkcja,
		KOPIA_ZAPIS.bladNaglowek,
		KOPIA_ZAPIS.brakTresciNaglowek,
		KOPIA_ZAPIS.dodajWiersz,
		KOPIA_ZAPIS.usunWiersz,
		KOPIA_ZAPIS.dodajWartosc,
		KOPIA_ZAPIS.usunWartosc,
		KOPIA_ZAPIS.dodajZdjecie,
		KOPIA_ZAPIS.usunZdjecie,
		KOPIA_WALIDACJA.podsumowanieNaglowek,
		KOPIA_WALIDACJA.altBrak,
		KOPIA_USUWANIE.wpisNaglowek,
		KOPIA_USUWANIE.wpisPrzycisk,
		KOPIA_USUWANIE.dokumentNaglowek,
		KOPIA_USUWANIE.dokumentPrzycisk,
		KOPIA_ZDJECIA.wybierzEtykieta,
		KOPIA_ZDJECIA.wybierzInne,
		KOPIA_ZDJECIA.usun,
		KOPIA_ZDJECIA.przygotowywanie,
		KOPIA_ZDJECIA.podpisPodgladu,
		KOPIA_PLIKU.wybierzEtykieta,
		KOPIA_FORMATOWANIE.podsumowanie,
		KOPIA_NABOR.naglowek,
		KOPIA_NABOR.otwartyEtykieta,
		KOPIA_NABOR.zamknietyEtykieta,
		KOPIA_NABOR.otwartyOpis,
		KOPIA_NABOR.zamknietyOpis,
		KOPIA_NABOR.podgladNaglowek,
		POLA_WPIS.tytulEtykieta,
		POLA_WPIS.dataLegenda,
		POLA_WPIS.zajawkaEtykieta,
		POLA_WPIS.trescEtykieta,
		POLA_WPIS.zdjecieEtykieta,
		POLA_WPIS.altEtykieta,
		POLA_WPIS.zastepczaEtykieta,
		POLA_O_NAS.leadEtykieta,
		POLA_O_NAS.misjaEtykieta,
		POLA_O_NAS.wartosciLegenda,
		POLA_O_NAS.kadraOpisEtykieta,
		POLA_O_NAS.kadraOpiekunkiEtykieta,
		POLA_O_NAS.kadraPersonelEtykieta,
		POLA_O_NAS.obiektOpisEtykieta,
		POLA_O_NAS.zdjeciaLegenda,
		POLA_PLAN_DNIA.godzinyEtykieta,
		POLA_PLAN_DNIA.opisEtykieta,
		POLA_DOKUMENT.nazwaEtykieta,
		POLA_DOKUMENT.kategoriaEtykieta,
		POLA_DOKUMENT.plikEtykieta,
		POLA_DOKUMENT.wersjaLegenda,
		POLA_DOKUMENT.zrodloEtykieta
	];
	const brakujace = etykiety.filter((etykieta) => !ZWARTY.includes(bezGwiazdki(etykieta)));
	assert.deepEqual(brakujace, []);
	// The three fixed document categories are named too, because „wybierz z listy" without
	// the list is an instruction that sends somebody back to the screen to find out.
	for (const kategoria of POLA_DOKUMENT.kategorieOpcje) {
		assert.ok(ZWARTY.includes(kategoria), `brak kategorii dokumentu: ${kategoria}`);
	}
});

// Contract 11, and the plan's own prohibition. The panel cannot undo a deletion, so the
// instrukcja says exactly that and stops. This is asserted as a rule about EVERY use of
// the verb rather than about one sentence, so a reassuring paragraph added later cannot
// slip past by being phrased differently.
test('instrukcja nigdy nie obiecuje, ze usuniecie da sie cofnac w panelu', () => {
	const zdania = [...DOKUMENT.matchAll(/cofn\p{L}*/giu)];
	assert.ok(zdania.length >= 2, 'instrukcja w ogole nie mowi o nieodwracalnosci usuniecia');
	for (const trafienie of zdania) {
		const kontekst = DOKUMENT.slice(Math.max(0, (trafienie.index ?? 0) - 16), trafienie.index);
		assert.match(kontekst, /nie można\s*$/u, `obietnica cofniecia: ...${kontekst}${trafienie[0]}`);
	}
	assert.ok(DOKUMENT.includes('Tej operacji nie można cofnąć w panelu.'));
});

// D-18 and RESEARCH Pitfall 10. The two failures staff will actually hit are „I saved and
// nothing changed" and „the panel refused me", and both sections have to say the true
// thing rather than the reassuring one.
test('instrukcja mowi prawde o opoznieniu publikacji i o kolejce budowania', () => {
	assert.match(DOKUMENT, /około 2 minut/u);
	// Pitfall 10: one build at a time, so two saves in a row take twice as long.
	assert.match(DOKUMENT, /Jeśli ktoś inny zapisał coś chwilę wcześniej/u);
	assert.match(DOKUMENT, /odśwież/iu);
});

test('instrukcja kaze skopiowac tekst, ZANIM kaze odswiezyc strone przy konflikcie', () => {
	const kopiowanie = DOKUMENT.indexOf('skopiuj swój tekst');
	const konflikt = DOKUMENT.indexOf(KOPIA_ZAPIS.konfliktNaglowek);
	const odswiez = DOKUMENT.indexOf(KOPIA_ZAPIS.konfliktAkcja, konflikt);
	assert.ok(konflikt > -1, 'brak sekcji o odmowie zapisu przy konflikcie');
	const skopiuj = DOKUMENT.toLowerCase().indexOf('skopiuj swój tekst', konflikt);
	assert.ok(skopiuj > -1 || kopiowanie > -1, 'instrukcja nie kaze skopiowac tekstu');
	assert.ok(skopiuj < odswiez, 'instrukcja kaze odswiezyc strone przed skopiowaniem tekstu');
});

// D-15. The alt text is the one rule in the panel that BLOCKS a save, and an editor who
// does not know that reads the refusal as a fault.
test('instrukcja mowi wprost, ze bez opisu alternatywnego zapis jest odmawiany', () => {
	assert.match(DOKUMENT, /Bez opisu alternatywnego zdjęcia nie da się zapisać/u);
	assert.ok(DOKUMENT.includes(KOPIA_WALIDACJA.altBrak));
});

// Contract 7. „Dodanie wiersza nie zapisuje" is the single most common misunderstanding
// this pattern produces, which is why the panel carries a persistent note about it and
// why the instrukcja has to repeat it.
test('instrukcja powtarza, ze dodanie wiersza niczego nie zapisuje', () => {
	assert.match(DOKUMENT, /wiersza niczego nie zapisuje/u);
});

// RESEARCH Pitfall 7. Adding an editor is TWO steps and the second one is the one people
// skip, because the first one looks like it worked.
test('instrukcja opisuje dodanie redaktora jako sekret plus przebudowe', () => {
	assert.match(DOKUMENT, /ADMIN_EMAILS/u);
	assert.match(DOKUMENT, /To drugi krok jest konieczny/u);
	assert.match(DOKUMENT, /przebudow/iu);
	// D-02/D-03: revocation is immediate on the next request, not at the end of a session.
	assert.match(DOKUMENT, /przestaje działać przy najbliższym otwarciu/u);
});

// P-27 depends on the document being renderable into the Pomoc screen's heading
// structure. Rendering it here catches a source edit that would produce a second h1 or a
// skipped level before anybody opens a browser.
test('instrukcja renderuje sie w strukture naglowkow zaczynajaca sie od drugiego poziomu', () => {
	const tresc = DOKUMENT.split('\n').slice(1).join('\n');
	const html = renderInstrukcja(tresc);
	assert.equal(/<h1[\s>]/u.test(html), false, 'renderowana instrukcja niesie wlasny h1');
	assert.ok((html.match(/<h2[\s>]/gu) ?? []).length >= 10);
	assert.ok((html.match(/<h3[\s>]/gu) ?? []).length >= 1);
	// The sanitizing half of the renderer, asserted on the real document rather than on a
	// fixture: nothing in it may produce a script, an inline event handler or an image.
	assert.equal(/<script|<img|\son\p{L}+=/iu.test(html), false);
});
