// Copy-contract unit test for src/lib/content/panel.ts and the login code e-mail
// (CMS-03, SITE-06, ROADMAP 04.1 success criterion 2). Pins the obligations that are
// accessibility or language requirements rather than stylistic preferences: Polish
// only with no English chrome, no emoji, no em dash, and no empty string reaching a
// label or a message.
//
// Do NOT weaken these assertions to make the suite pass. „Polish only, every surface,
// no exceptions" is a requirement of this project, not a preference, and the login
// code e-mail is one of those surfaces.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test
// matcher never collects it. The relative imports carry the `.ts` extension, which
// that type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as panel from '../src/lib/content/panel.ts';
import {
	KOPIA_FORMATOWANIE,
	KOPIA_EKRAN_DOKUMENTU,
	KOPIA_EKRAN_WPISU,
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
	NAWIGACJA,
	POLA_DATA,
	POLA_DOKUMENT,
	POLA_O_NAS,
	POLA_PLAN_DNIA,
	POLA_WPIS,
	dodanoWiersz,
	legendaWartosci,
	legendaWiersza,
	legendaZdjecia,
	liczbaDokumentow,
	liczbaWpisow,
	metaDokumentu,
	obecnieNabor,
	obecnyPlik,
	opisDodaniaDokumentu,
	opisDodaniaWpisu,
	opisUsunieciaDokumentu,
	opisUsunieciaWpisu,
	opisZmianyDokumentu,
	opisZmianyWpisu,
	tekstZaDlugi,
	trescUsunieciaDokumentu,
	trescUsunieciaWpisu,
	tytulStrony,
	ukryteDokument,
	ukryteWpis,
	usunietoWiersz,
	wybranyPlik,
	wyslanoKodNa,
	zalogowanoJako,
	zobaczStrone
} from '../src/lib/content/panel.ts';
import { zbudujPayloadKod, zbudujTrescKodu } from '../src/lib/server/admin/mail-kod.ts';

const KOD_PRZYKLADOWY = '123456';
const ADRES_PRZYKLADOWY = 'anna.kowalska@example.test';

/** Recursively collect every string reachable from a value, so a nested object or
 *  array cannot hide a string from the copy rules. Copied verbatim from
 *  tests/forms-copy.unit.ts, which is where this idiom is already load bearing. */
function zbierz(wartosc: unknown, zebrane: string[] = []): string[] {
	if (typeof wartosc === 'string') {
		zebrane.push(wartosc);
	} else if (Array.isArray(wartosc)) {
		for (const element of wartosc) zbierz(element, zebrane);
	} else if (typeof wartosc === 'object' && wartosc !== null) {
		for (const element of Object.values(wartosc)) zbierz(element, zebrane);
	}
	return zebrane;
}

/** EXPLICIT list, one entry per export of src/lib/content/panel.ts, in module order.
 *  Exports that take a value are invoked with a sample, because the collector above
 *  cannot see inside a function. The count case below asserts this list is complete,
 *  so a new export cannot escape the contract by simply not being added here. */
const EKSPORTY: unknown[] = [
	KOPIA_POWLOKA,
	NAWIGACJA,
	KOPIA_LOGOWANIE,
	KOPIA_MAIL_KOD,
	KOPIA_PULPIT,
	KOPIA_LISTY,
	KOPIA_EKRAN_WPISU,
	KOPIA_EKRAN_DOKUMENTU,
	POLA_DATA,
	POLA_WPIS,
	POLA_O_NAS,
	POLA_PLAN_DNIA,
	POLA_DOKUMENT,
	KOPIA_NABOR,
	KOPIA_FORMATOWANIE,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	KOPIA_PLIKU,
	KOPIA_USUWANIE,
	zalogowanoJako('anna.k'),
	tytulStrony('Aktualności'),
	wyslanoKodNa(ADRES_PRZYKLADOWY),
	liczbaWpisow(2),
	liczbaDokumentow(3),
	[obecnieNabor(true), obecnieNabor(false)],
	ukryteWpis('Wielkie otwarcie żłobka'),
	ukryteDokument('Statut żłobka'),
	tekstZaDlugi(2000),
	zobaczStrone('Aktualności'),
	dodanoWiersz(4),
	usunietoWiersz(2),
	legendaWartosci(1),
	legendaWiersza(3),
	legendaZdjecia(2),
	trescUsunieciaWpisu('Wielkie otwarcie żłobka', '15.07.2026'),
	trescUsunieciaDokumentu('Statut żłobka'),
	opisDodaniaWpisu('Wielkie otwarcie żłobka'),
	opisZmianyWpisu('Wielkie otwarcie żłobka'),
	opisUsunieciaWpisu('Wielkie otwarcie żłobka'),
	opisDodaniaDokumentu('Statut żłobka'),
	opisZmianyDokumentu('Statut żłobka'),
	opisUsunieciaDokumentu('Statut żłobka'),
	metaDokumentu('PDF', '02.04.2026'),
	wybranyPlik('wniosek.pdf', '212 KB'),
	obecnyPlik('PDF · 212 KB')
];

/** The e-mail is a panel surface too (CMS-03), so its rendered body and its subject
 *  join the same corpus rather than being swept by a separate, weaker rule. */
const MAIL = [
	zbudujTrescKodu(KOD_PRZYKLADOWY),
	zbudujPayloadKod(ADRES_PRZYKLADOWY, KOD_PRZYKLADOWY).subject
];

const WSZYSTKIE_STRINGI = zbierz([...EKSPORTY, ...MAIL]);

/** English chrome a Polish panel must never render. Whole words only, case
 *  insensitive, so a Polish word that merely contains these letters is not a false
 *  positive. The list is the floor, not the ceiling: add to it, never remove. */
// The word boundary is spelled out as a Unicode lookaround instead of `\b`, because
// `\b` treats every Polish diacritic as a non-word character: it splits „ważność" at
// ż and ś and then reports the „no" between them as the English word. Observed, not
// assumed, the first time this suite ran.
const GRANICA_PRZED = '(?<![\\p{L}\\p{N}_])';
const GRANICA_PO = '(?![\\p{L}\\p{N}_])';
const ANGIELSKIE_SLOWA = [
	'Save',
	'Cancel',
	'Delete',
	'Edit',
	'Submit',
	'Login',
	'Log out',
	'Loading',
	'Error',
	'Required',
	'Choose File',
	'Browse',
	'Next',
	'Back',
	'Yes',
	'No'
];

test('zaden eksport panelu nie zawiera pauzy (reguly copy, C-11)', () => {
	const winne = WSZYSTKIE_STRINGI.filter((s) => s.includes('—'));
	assert.deepEqual(winne, []);
});

test('zaden eksport panelu nie zawiera emoji (reguly copy, C-11)', () => {
	const emoji = /\p{Extended_Pictographic}/u;
	const winne = WSZYSTKIE_STRINGI.filter((s) => emoji.test(s));
	assert.deepEqual(winne, []);
});

// The half-dash rule is not a ban: it is allowed inside a numeric range and banned
// everywhere else. A suite that only checked the ban would silently pass if the one
// legitimate range lost its dash, so the allowance is asserted as an allowance.
test('polpauza wystepuje wylacznie w zakresie liczbowym i naprawde tam wystepuje', () => {
	const zPolpauza = WSZYSTKIE_STRINGI.filter((s) => s.includes('–'));
	assert.ok(zPolpauza.length > 0, 'brak stringa z polpauza w zakresie liczbowym');
	for (const s of zPolpauza) {
		assert.match(s, /\d\s*–\s*\d/, `polpauza poza zakresem liczbowym: ${s}`);
	}
});

test('zaden eksport panelu nie zawiera angielskiego slowa z listy chrome (SC2)', () => {
	for (const slowo of ANGIELSKIE_SLOWA) {
		const wzorzec = new RegExp(`${GRANICA_PRZED}${slowo.replace(' ', '\\s+')}${GRANICA_PO}`, 'iu');
		const winne = WSZYSTKIE_STRINGI.filter((s) => wzorzec.test(s));
		assert.deepEqual(winne, [], `angielskie slowo "${slowo}" w kopii panelu`);
	}
});

// Positive control for the case above. A boundary expression that matched nothing at
// all would let that assertion pass for the wrong reason, and after the „ważność"
// surprise this detector is exactly the kind of thing that needs proving twice.
test('wykrywacz angielskiego chrome naprawde lapie angielskie slowo', () => {
	const probki = ['Save changes', 'log out', 'CHOOSE FILE', 'Wybierz plik'];
	const znalezione = probki.filter((s) =>
		ANGIELSKIE_SLOWA.some((slowo) =>
			new RegExp(`${GRANICA_PRZED}${slowo.replace(' ', '\\s+')}${GRANICA_PO}`, 'iu').test(s)
		)
	);
	assert.deepEqual(znalezione, ['Save changes', 'log out', 'CHOOSE FILE']);
});

test('zaden string kopii panelu nie jest pusty po przycieciu', () => {
	const puste = WSZYSTKIE_STRINGI.filter((s) => s.trim().length === 0);
	assert.deepEqual(puste, []);
	assert.ok(WSZYSTKIE_STRINGI.length > 100, 'korpus jest podejrzanie maly');
});

// The whole point of the explicit list: an export that is not in it escapes every
// assertion above. Counting the module namespace is what makes forgetting impossible.
test('lista zamiatanych eksportow obejmuje wszystkie eksporty modulu', () => {
	assert.equal(EKSPORTY.length, Object.keys(panel).length);
});

test('nawigacja wymienia siedem sekcji panelu w ustalonej kolejnosci', () => {
	assert.deepEqual(
		[...NAWIGACJA],
		['Pulpit', 'Aktualności', 'O nas', 'Plan dnia', 'Dokumenty', 'Nabór', 'Pomoc']
	);
});

// D-02. The step 2 screen must read the same whether or not the address has access,
// so a phrase that would only make sense for a known address is a defect, not a gap.
test('ekran po wyslaniu kodu nie zdradza, czy adres ma dostep do panelu (D-02)', () => {
	assert.match(KOPIA_LOGOWANIE.kodTresc, /Jeśli ten adres ma dostęp do panelu/);
	const logowanie = zbierz(KOPIA_LOGOWANIE).join('\n');
	assert.equal(/nie znaleziono|nie ma takiego adresu|sprawdź adres/i.test(logowanie), false);
});

test('kod i jego waznosc sa opisane ta sama liczba minut w panelu i w e-mailu', () => {
	assert.match(KOPIA_LOGOWANIE.kodTresc, /ważny 15 minut/);
	assert.match(KOPIA_LOGOWANIE.kodWygaslTresc, /ważny 15 minut/);
	assert.match(KOPIA_MAIL_KOD.waznosc, /ważny 15 minut/);
});

test('tresc e-maila niesie przekazany kod i zdanie o waznosci', () => {
	const tresc = zbudujTrescKodu(KOD_PRZYKLADOWY);
	assert.ok(tresc.includes(KOD_PRZYKLADOWY));
	assert.ok(tresc.includes(KOPIA_MAIL_KOD.waznosc));
	assert.ok(tresc.includes(KOPIA_MAIL_KOD.bezpieczenstwo));
	assert.ok(tresc.includes(KOPIA_MAIL_KOD.podpis));
});

// The body is assembled from the copy module and takes only a code, so no recipient
// can end up inside it. Asserted rather than assumed: an address in the body is how a
// staff mailbox leaks into a message forwarded somewhere else.
test('tresc e-maila nie zawiera zadnego adresu odbiorcy', () => {
	const tresc = zbudujTrescKodu(KOD_PRZYKLADOWY);
	assert.equal(tresc.includes(ADRES_PRZYKLADOWY), false);
	assert.equal(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.test(tresc), false);
});

test('kod stoi w e-mailu w osobnym wierszu, wiec da sie go zaznaczyc na telefonie', () => {
	const wiersze = zbudujTrescKodu(KOD_PRZYKLADOWY).split('\n');
	assert.ok(wiersze.includes(KOD_PRZYKLADOWY));
});

test('payload kodu ma staly temat, jednego odbiorce i tylko tekst', () => {
	const payload = zbudujPayloadKod(ADRES_PRZYKLADOWY, KOD_PRZYKLADOWY);
	assert.equal(payload.subject, KOPIA_MAIL_KOD.temat);
	assert.deepEqual(payload.to, [ADRES_PRZYKLADOWY]);
	assert.equal(Object.keys(payload).sort().join(','), 'from,subject,text,to');
	assert.equal(payload.text, zbudujTrescKodu(KOD_PRZYKLADOWY));
});

// T-04.1-07. The login mail must be structurally unable to inherit the public forms'
// recipient or their hidden backup copy, because the panel address has nothing to do
// with a parent's enquiry.
test('payload kodu nie niesie ukrytej kopii ani odbiorcy formularzy', () => {
	const payload: Record<string, unknown> = {
		...zbudujPayloadKod(ADRES_PRZYKLADOWY, KOD_PRZYKLADOWY)
	};
	assert.equal('bcc' in payload, false);
	assert.equal('reply_to' in payload, false);
	assert.equal(JSON.stringify(payload).includes('ugstromiec.pl'), false);
});

test('etykiety pol wymaganych sa oznaczone gwiazdka, a opcjonalne nie sa', () => {
	assert.match(POLA_WPIS.tytulEtykieta, /\*$/);
	assert.match(POLA_WPIS.trescEtykieta, /\*$/);
	assert.match(POLA_WPIS.altEtykieta, /\*$/);
	assert.equal(POLA_WPIS.zajawkaEtykieta.includes('*'), false);
	assert.equal(POLA_WPIS.zdjecieEtykieta.includes('*'), false);
});

test('kategorie dokumentu sa dokladnie te trzy, w ustalonej kolejnosci', () => {
	assert.deepEqual([...POLA_DOKUMENT.kategorieOpcje], ['Rekrutacja', 'Statut i uchwały', 'RODO']);
	assert.equal(POLA_DATA.pusty, 'Wybierz');
});

// Contract 7: an add or a remove re-renders the form and commits nothing, and the
// editor has to be told so before they click it.
test('nota grupy powtarzalnej mowi wprost, ze dodanie wiersza niczego nie zapisuje', () => {
	assert.match(KOPIA_ZAPIS.notaGrupy, /nie zapisuje zmian/);
	assert.match(KOPIA_ZAPIS.notaGrupy, /kliknij Zapisz/);
});

// D-18. The publish delay is promised in three places and all three have to say the
// same thing, because an editor who reads two different numbers trusts neither.
test('obietnica dwoch minut jest ta sama w powloce, na pulpicie i po zapisie (D-18)', () => {
	for (const tekst of [
		KOPIA_POWLOKA.opoznieniePublikacji,
		KOPIA_PULPIT.lead,
		KOPIA_ZAPIS.zapisanoTresc,
		KOPIA_ZAPIS.nota
	]) {
		assert.match(tekst, /około 2 minutach/);
	}
});

// Contract 11: the copy states that the panel cannot undo the operation, and never
// hints at a recovery path that does not exist.
test('tresc potwierdzenia usuniecia nie obiecuje cofniecia operacji', () => {
	for (const tekst of [
		trescUsunieciaWpisu('Wielkie otwarcie żłobka', '15.07.2026'),
		trescUsunieciaDokumentu('Statut żłobka')
	]) {
		assert.match(tekst, /nie można cofnąć w panelu/);
	}
	assert.match(trescUsunieciaWpisu('Wielkie otwarcie żłobka', '15.07.2026'), /Wielkie otwarcie/);
	assert.match(trescUsunieciaDokumentu('Statut żłobka'), /Statut żłobka/);
});

test('stan naboru jest opisany neutralnie w obie strony', () => {
	assert.equal(obecnieNabor(true), 'Obecnie: nabór otwarty.');
	assert.equal(obecnieNabor(false), 'Obecnie: nabór zamknięty.');
});

test('ukryte dopowiedzenia akcji nazywaja konkretny wpis (WCAG 2.4.4)', () => {
	assert.equal(ukryteWpis('Wielkie otwarcie żłobka'), ' wpis: Wielkie otwarcie żłobka');
	assert.equal(ukryteDokument('Statut żłobka'), ' dokument: Statut żłobka');
});

test('pomoc w formatowaniu mowi takze, czego NIE da sie uzyc', () => {
	assert.equal(KOPIA_FORMATOWANIE.linie.length, 4);
	// Each line is a list of runs so the syntax example can be marked as code. Joining the
	// runs is how a line is read as a sentence, and it is exactly what the component does.
	const czwarta = zbierz(KOPIA_FORMATOWANIE.linie[3]).join('');
	assert.match(czwarta, /nie są obsługiwane/);
});

// The three lines that teach a syntax must actually CARRY that syntax as an example, or
// the help would describe formatting without ever showing it. Line four teaches nothing
// and is deliberately example-free, which is asserted as well so the rule reads both ways.
test('pomoc w formatowaniu pokazuje przyklad skladni tam, gdzie go obiecuje', () => {
	const przyklady = KOPIA_FORMATOWANIE.linie.map(
		(linia) => linia.filter((run) => typeof run !== 'string').length
	);
	assert.deepEqual(przyklady, [1, 1, 1, 0]);
	const zlaczone = KOPIA_FORMATOWANIE.linie.map((linia) => zbierz(linia).join(''));
	assert.match(zlaczone[0], /\*\*ważne\*\*/);
	assert.match(zlaczone[1], /\[tekst odnośnika\]\(https:\/\/adres\.pl\)/);
	assert.match(zlaczone[2], /od znaku - i spacji/);
});

test('komunikaty walidacji mowia, co zrobic, a nie tylko ze cos jest zle (WCAG 3.3.3)', () => {
	assert.equal(tekstZaDlugi(2000), 'Tekst jest za długi. Skróć go do 2000 znaków.');
	assert.match(KOPIA_WALIDACJA.altBrak, /Napisz opis alternatywny/);
	assert.match(KOPIA_WALIDACJA.dataNiepelna, /Wybierz dzień, miesiąc i rok/);
	for (const wartosc of Object.values(KOPIA_WALIDACJA)) {
		assert.ok(wartosc.trim().length > 0);
	}
});

test('kazdy komunikat panelu logowania jest niepusty', () => {
	for (const [klucz, wartosc] of Object.entries(KOPIA_LOGOWANIE)) {
		assert.equal(typeof wartosc, 'string', `${klucz} nie jest tekstem`);
		assert.ok((wartosc as string).trim().length > 0, `${klucz} jest puste`);
	}
});

test('kopia zdjec nie opisuje zadnej animacji ani paska postepu', () => {
	const zdjecia = zbierz(KOPIA_ZDJECIA).join('\n');
	assert.equal(/pasek postępu|ładowanie|animacj/i.test(zdjecia), false);
	assert.match(KOPIA_ZDJECIA.przygotowywanie, /Przygotowywanie zdjęcia/);
});

// P-22, and this is the assertion that keeps the deviation HONEST rather than merely
// recorded. The UI-SPEC route table says the dokument screens need no JavaScript; the file
// field cannot honour that, because a ten megabyte document has to be encoded in the
// browser. The sentence the editor reads therefore has to say two things: that attaching a
// file needs scripting, and that everything else on the screen still works without it. A
// notice that said only the first would read as „this screen is broken".
test('napis bez skryptow mowi, co wymaga skryptow i co dziala bez nich (P-22)', () => {
	assert.match(KOPIA_PLIKU.bezSkryptow, /JavaScript/);
	assert.match(KOPIA_PLIKU.bezSkryptow, /Dołączenie pliku/);
	assert.match(KOPIA_PLIKU.bezSkryptow, /możesz wypełnić i zapisać normalnie/);
	// Names the fields that still work, so „pozostałe pola" is not a promise the editor has
	// to test for themselves.
	for (const pole of ['nazwa', 'kategoria', 'wersja']) {
		assert.match(KOPIA_PLIKU.bezSkryptow, new RegExp(pole));
	}
	// Same rule as the photo island: nothing in this field's copy describes motion, because
	// the island has none and the status sentence is the whole progress indicator.
	const pliku = zbierz(KOPIA_PLIKU).join('\n');
	assert.equal(/pasek postępu|ładowanie|animacj/i.test(pliku), false);
});

// P-23. A document's identity is the slug of its NAME alone, so its collision refusal must
// name that one field. The aktualność sentence names a title and a publication date, and
// telling an editor to change a date the filename does not depend on would be an
// instruction that cannot work (WCAG 3.3.3 says the message must say what to DO).
test('odmowa przy zajetej nazwie dokumentu mowi o nazwie i o zadnej dacie (P-23)', () => {
	assert.equal(KOPIA_ZAPIS.kolizjaDokumentNaglowek, 'Taki dokument już istnieje');
	assert.match(KOPIA_ZAPIS.kolizjaDokumentTresc, /Zmień nazwę dokumentu/);
	assert.equal(/dat/i.test(KOPIA_ZAPIS.kolizjaDokumentTresc), false);
	assert.equal(/nadpis|zastąp/i.test(KOPIA_ZAPIS.kolizjaDokumentTresc), false);
});

// P-17. The filename is generated from the date and the title, so the refusal has to
// name BOTH fields: an editor told only „this entry already exists" would change the
// title, hit the same collision from the other side, and have no way to reason about it.
test('odmowa przy zajetej nazwie pliku mowi, ktore dwa pola o niej decyduja (P-17)', () => {
	assert.equal(KOPIA_ZAPIS.kolizjaNaglowek, 'Taki wpis już istnieje');
	assert.match(KOPIA_ZAPIS.kolizjaTresc, /tytule/);
	assert.match(KOPIA_ZAPIS.kolizjaTresc, /datą publikacji/);
	// Says what to DO, not merely that something is wrong (WCAG 3.3.3).
	assert.match(KOPIA_ZAPIS.kolizjaTresc, /Zmień tytuł albo datę publikacji/);
	// And never promises that the older entry survived by luck: it says the entry exists,
	// which is true, and stops there.
	assert.equal(/nadpis|zastąp/i.test(KOPIA_ZAPIS.kolizjaTresc), false);
});

// D-04, T-04.1-07. Every commit description names the entry and nothing about the
// person: the repository is public and its history is permanent.
test('opisy commitow wpisu nazywaja wpis i nigdy nie niosa adresu', () => {
	const tytul = 'Wielkie otwarcie żłobka';
	for (const opis of [opisDodaniaWpisu(tytul), opisZmianyWpisu(tytul), opisUsunieciaWpisu(tytul)]) {
		assert.ok(opis.includes(tytul), `opis nie nazywa wpisu: ${opis}`);
		assert.equal(opis.includes('@'), false);
	}
	// Three different verbs, so `git log` distinguishes a create from an edit from a
	// deletion without opening the diff.
	assert.equal(
		new Set([opisDodaniaWpisu(tytul), opisZmianyWpisu(tytul), opisUsunieciaWpisu(tytul)]).size,
		3
	);
});

test('naglowki ekranow wpisu sa dwa i mowia, ktory to ekran', () => {
	assert.equal(KOPIA_EKRAN_WPISU.nowyNaglowek, 'Nowy wpis');
	assert.equal(KOPIA_EKRAN_WPISU.edycjaNaglowek, 'Edycja wpisu');
	assert.equal(KOPIA_EKRAN_WPISU.stronaNazwa, KOPIA_LISTY.aktualnosciNaglowek);
});

test('przyciski destrukcyjne nazywaja rzecz, ktora usuwaja', () => {
	assert.equal(KOPIA_USUWANIE.wpisPrzycisk, 'Usuń wpis');
	assert.equal(KOPIA_USUWANIE.dokumentPrzycisk, 'Usuń dokument');
	assert.equal(KOPIA_USUWANIE.anuluj, 'Anuluj');
});

test('naglowek i stopka panelu nie zapraszaja na publiczna strone poza jednym linkiem', () => {
	assert.equal(KOPIA_POWLOKA.otworzStrone, 'Otwórz stronę żłobka');
	assert.match(KOPIA_POWLOKA.nowaKarta, /otwiera się w nowej karcie/);
	assert.equal(KOPIA_POWLOKA.stopka.includes('BIP'), false);
});

test('tytul strony panelu ma zawsze te sama koncowke', () => {
	assert.equal(tytulStrony('Aktualności'), 'Aktualności, panel redakcyjny');
	assert.equal(tytulStrony('Pulpit'), 'Pulpit, panel redakcyjny');
});

test('linia zalogowania pokazuje uchwyt, nie pelny adres (D-04)', () => {
	const linia = zalogowanoJako('anna.k');
	assert.equal(linia, 'Zalogowano jako: anna.k');
	assert.equal(linia.includes('@'), false);
});

test('echo adresu na drugim kroku pokazuje wpisany adres, zeby literowka byla widoczna', () => {
	assert.equal(wyslanoKodNa(ADRES_PRZYKLADOWY), `Wysłaliśmy kod na: ${ADRES_PRZYKLADOWY}`);
});

test('liczniki na pulpicie sa zdaniami, nie golymi liczbami', () => {
	assert.equal(liczbaWpisow(2), 'Liczba wpisów: 2');
	assert.equal(liczbaDokumentow(0), 'Liczba dokumentów: 0');
});

test('legendy grup powtarzalnych numeruja pozycje po polsku', () => {
	assert.equal(legendaWartosci(1), 'Wartość 1');
	assert.equal(legendaWiersza(3), 'Wiersz 3');
	assert.equal(legendaZdjecia(2), 'Zdjęcie 2');
	assert.equal(dodanoWiersz(4), 'Dodano wiersz 4.');
	assert.equal(usunietoWiersz(2), 'Usunięto wiersz 2.');
});

test('link po zapisie prowadzi na nazwana strone', () => {
	assert.equal(zobaczStrone('Aktualności'), 'Zobacz stronę: Aktualności');
});

test('lista pusta zaprasza do dodania pierwszej pozycji, w obu kolekcjach', () => {
	assert.match(KOPIA_LISTY.aktualnosciPustaTresc, /Dodaj pierwszy wpis/);
	assert.match(KOPIA_LISTY.dokumentyPustaTresc, /Dodaj pierwszy dokument/);
	assert.equal(KOPIA_LISTY.odznakaZastepcza, 'Treść zastępcza');
});

test('opisy stanu naboru mowia, co zobaczy rodzic', () => {
	assert.match(KOPIA_NABOR.otwartyOpis, /Na stronie pojawi się informacja/);
	assert.match(KOPIA_NABOR.zamknietyOpis, /listę rezerwową/);
	assert.equal(KOPIA_NABOR.podgladNaglowek, 'Tak zobaczy to rodzic');
});
