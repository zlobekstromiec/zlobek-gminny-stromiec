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
	KOPIA_CENNIK,
	KOPIA_EKRAN_GALERII,
	KOPIA_FORMATOWANIE,
	KOPIA_LISTY,
	KOPIA_LOGOWANIE,
	KOPIA_MAIL_KOD,
	KOPIA_NABOR,
	KOPIA_PLIKU,
	KOPIA_POWLOKA,
	KOPIA_PULPIT,
	KOPIA_USUWANIE,
	KOPIA_W_SKROCIE,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	POLA_CENNIK,
	POLA_DOKUMENT,
	POLA_GALERIA,
	POLA_O_NAS,
	POLA_PLAN_DNIA,
	POLA_W_SKROCIE,
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
		// 05-UI-SPEC Contract 12: the Galeria screen is new in phase 05 and the manual owes it a
		// section of its own, placed to mirror the panel navigation (directly after O nas).
		// Written in the same numbered-heading form as every entry here, so a renumbering of the
		// document does not turn this red for a reason that has nothing to do with coverage.
		['galeria', /^\d+\.\s+Galeria$/u],
		['plan dnia', /^\d+\.\s+Plan dnia$/u],
		// 05-UI-SPEC Contract 12: the screen is new in phase 05 and the manual owes it a
		// section of its own, placed to mirror the panel navigation. Written in the same
		// numbered-heading form as every entry above, so a renumbering of the document does
		// not turn this red for a reason that has nothing to do with coverage.
		['cennik', /^\d+\.\s+Cennik$/u],
		['nabor', /^\d+\.\s+Nabór$/u],
		// 05-UI-SPEC Contract 11: the W skrócie screen is new in phase 05 and the manual owes it
		// a section of its own. It is the one screen the panel navigation does NOT carry (05
		// D-34), so the manual is the only place an editor can read what it is for before ever
		// opening it.
		['w skrocie', /^\d+\.\s+W skrócie$/u],
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
	assert.ok(naglowki.length >= 12);
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
		KOPIA_PULPIT.galeriaTytul,
		KOPIA_PULPIT.planDniaTytul,
		KOPIA_PULPIT.cennikTytul,
		KOPIA_PULPIT.dokumentyTytul,
		KOPIA_PULPIT.naborTytul,
		KOPIA_PULPIT.wSkrocieTytul,
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
		KOPIA_ZAPIS.dodajOsobe,
		KOPIA_ZAPIS.usunOsobe,
		KOPIA_ZAPIS.dodajZdjecie,
		KOPIA_ZAPIS.usunZdjecie,
		KOPIA_ZAPIS.przeniesWGore,
		KOPIA_ZAPIS.przeniesWDol,
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
		// The two headcount labels were here until 2026-08-18. They named two number fields
		// that the staff list replaced, and the manual gained that list's own three labels
		// in the same edit: a lockstep change, not a weakening.
		POLA_O_NAS.kadraLegenda,
		POLA_O_NAS.osobaImieEtykieta,
		POLA_O_NAS.osobaRolaEtykieta,
		POLA_O_NAS.obiektOpisEtykieta,
		// The O nas photo group legend was here until plan 05-07 removed that group. Its
		// replacement is the gallery's own legend, two entries down: a lockstep edit, not a
		// weakening, and the manual still has to quote a photo group legend verbatim.
		KOPIA_EKRAN_GALERII.naglowek,
		POLA_GALERIA.zdjeciaLegenda,
		POLA_GALERIA.podpisEtykieta,
		POLA_GALERIA.altEtykieta,
		POLA_PLAN_DNIA.godzinyEtykieta,
		POLA_PLAN_DNIA.opisEtykieta,
		KOPIA_CENNIK.naglowek,
		KOPIA_CENNIK.kwotyLegenda,
		KOPIA_CENNIK.opisLegenda,
		POLA_CENNIK.stawkaEtykieta,
		POLA_CENNIK.obnizkaEtykieta,
		POLA_CENNIK.naglowekEtykieta,
		POLA_CENNIK.kwotaOpisEtykieta,
		POLA_CENNIK.zusEtykieta,
		POLA_CENNIK.wyzywienieEtykieta,
		POLA_CENNIK.nieobecnoscEtykieta,
		POLA_CENNIK.zastepczaEtykieta,
		KOPIA_W_SKROCIE.naglowek,
		KOPIA_W_SKROCIE.wiekLegenda,
		KOPIA_W_SKROCIE.godzinyLegenda,
		KOPIA_W_SKROCIE.oplataLegenda,
		KOPIA_W_SKROCIE.oplataLink,
		KOPIA_W_SKROCIE.miejscaLegenda,
		POLA_W_SKROCIE.godzinyEtykieta,
		POLA_W_SKROCIE.dniPelneEtykieta,
		POLA_W_SKROCIE.dniSkrotEtykieta,
		POLA_W_SKROCIE.weekendEtykieta,
		POLA_W_SKROCIE.miejscaEtykieta,
		POLA_W_SKROCIE.dopisekEtykieta,
		POLA_W_SKROCIE.zastepczaEtykieta,
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

// 05 D-27, D-28 and D-31. The Cennik screen owns three refusals, and every one of them
// blocks a save for a reason an editor cannot guess from the field alone. The manual
// therefore quotes the panel's own sentences rather than paraphrasing them, and says out
// loud why the ZUS field is the one that may never be emptied.
test('instrukcja tlumaczy trzy odmowy cennika slowami samego panelu', () => {
	assert.match(DOKUMENT, /Pole Świadczenie z ZUS nie może zostać puste/u);
	assert.ok(ZWARTY.includes(KOPIA_WALIDACJA.zusBrak), 'brak dosłownej odmowy o polu ZUS');
	assert.ok(
		ZWARTY.includes(KOPIA_WALIDACJA.obnizkaNieMniejsza),
		'brak dosłownej odmowy o obniżce większej od stawki'
	);
	assert.match(DOKUMENT, /w pełnych złotych, bez groszy/u);
	// The computed amount follows the SAVED values and not what is being typed, which is
	// the one thing on this screen that is easy to read as a fault.
	assert.ok(
		ZWARTY.includes(KOPIA_CENNIK.obliczonaPodpowiedz),
		'brak wyjaśnienia, że kwota do zapłaty zmienia się dopiero po zapisaniu'
	);
});

// 05 D-23 and D-25. The Galeria screen adds one required field, one hard limit and one
// reorder control that an editor cannot guess from the screen alone, so the manual quotes the
// panel's own sentences rather than paraphrasing them. The cap in particular has to be said
// out loud: an add button that has silently disappeared reads as a fault.
test('instrukcja tlumaczy limit galerii i jej dwa wymagane pola slowami samego panelu', () => {
	assert.ok(
		ZWARTY.includes(KOPIA_EKRAN_GALERII.limitOsiagniety),
		'brak dosłownego komunikatu o limicie zdjęć'
	);
	assert.ok(ZWARTY.includes(KOPIA_WALIDACJA.podpisBrak), 'brak dosłownej odmowy o podpisie');
	assert.ok(
		ZWARTY.includes(KOPIA_WALIDACJA.zdjecieGaleriiBrak),
		'brak dosłownej odmowy o pozycji bez zdjęcia'
	);
	// The caption and the alt are two different things, and an editor who thinks they are one
	// writes the room name twice and leaves the gallery unusable for a screen reader.
	assert.match(DOKUMENT, /podpis nazywa miejsce/u);
	// D-24: the crop is automatic, so nobody has to prepare a photograph before uploading it.
	assert.match(DOKUMENT, /proporcji 4:3/u);
	// The move buttons save nothing on their own, exactly like the add and the remove.
	assert.match(DOKUMENT, /zdjęcia niczego nie zapisuje/u);
});

// Plan 05-07. The O nas screen lost its photo half, and an editor who goes looking for it
// there finds a screen that seems to be missing something. Sections 5 and 7 therefore have to
// say out loud where the photographs went, and no sentence anywhere may still send somebody
// to O nas to add one. Asserted as a rule about EVERY mention of the two screens together,
// not about one sentence, so a paragraph added later cannot slip past by being reworded.
test('instrukcja mowi wprost, ze zdjecia sa w Galerii, a nie na ekranie O nas', () => {
	// Matched against the COMPACTED text, for the reason the header of this file records:
	// prettier hard wraps at 100 characters, so a sentence long enough to matter is split
	// across two lines in the source and reads as one sentence on the page.
	assert.match(ZWARTY, /Na tym ekranie nie ma już zdjęć/u);
	assert.match(ZWARTY, /Na ekranie \*\*O nas\*\* nie dodaje się już żadnych zdjęć/u);
	// The gallery screen is named by the string the panel really renders, so an editor
	// reading this looks for a screen that exists under that exact name.
	assert.ok(ZWARTY.includes(KOPIA_EKRAN_GALERII.naglowek));
	// And nothing tells anybody to add a photograph on the O nas screen any more.
	assert.equal(
		/(?:na|w) ekranie \*\*O nas\*\*[^.]{0,80}(?:dodaj|dodać) (?:zdjęci|nowe zdjęci)/iu.test(ZWARTY),
		false,
		'instrukcja wciaz kaze dodawac zdjecia na ekranie O nas'
	);
});

// 05 D-32 and D-33, and the whole reason the hours were unified rather than left alone. The
// W skrócie screen is the one screen in this panel whose fields feed surfaces an editor is
// not looking at while they type: the bar at the top of every page and the footer of every
// page. If the manual does not say so, the first person to change the hours goes hunting for
// the second place to change them, finds none, and concludes the panel is broken.
test('instrukcja mowi, ze godziny z ekranu W skrocie widac takze w pasku i w stopce', () => {
	assert.ok(
		ZWARTY.includes(KOPIA_W_SKROCIE.godzinyUwaga),
		'brak dosłownego zdania o trzech miejscach, w których widać godziny'
	);
	// Two of the four tiles are read-only, and an editor who does not know that reads a group
	// with no controls in it as a screen that failed to load.
	assert.ok(
		ZWARTY.includes(KOPIA_W_SKROCIE.lead),
		'brak dosłownego zdania o dwóch kafelkach do wglądu'
	);
	// The refusals quote the panel's own sentences rather than paraphrasing them.
	assert.ok(
		ZWARTY.includes(KOPIA_WALIDACJA.godzinyOtwarciaBrak),
		'brak dosłownej odmowy o godzinach'
	);
	assert.ok(ZWARTY.includes(KOPIA_WALIDACJA.skrotDniBrak), 'brak dosłownej odmowy o skrócie dni');
	assert.ok(
		ZWARTY.includes(KOPIA_WALIDACJA.liczbaMiejscBrak),
		'brak dosłownej odmowy o liczbie miejsc'
	);
	// FIXED ARITY: four tiles, always. The manual says it out loud, so a screen with no add
	// button does not read as a fault.
	assert.match(ZWARTY, /Kafelków nie da się tu dodać ani usunąć/u);
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
