// Single source for every Polish string the editorial panel renders, including the
// login code e-mail (CMS-01, CMS-03, SITE-06). This module is to the panel what
// ./forms.ts is to the two public forms: no route, no component and no server module
// may author a visible string of its own.
//
// Governing document: 04.1-UI-SPEC.md „Copywriting Contract", which is authoritative
// for every string below. The strings are copied from it rather than paraphrased. The
// one normalisation applied: where the contract pairs an opening „ with a straight
// closing quote, the Polish closing quote ” is used, because a mixed pair is a
// rendering artefact of the table it was written in and not a typographic decision.
//
// Copy rules (v1.2 §8) apply to EVERY string here: Polish only, no emoji, no em
// dashes (use commas, colons, parentheses), en dash only inside a numeric range such
// as 7:00–8:30, plain hyphen elsewhere.
//
// EVERY NEW EXPORT MUST BE ADDED TO THE SWEEP LIST IN tests/admin-copy.unit.ts.
// An export that is missing from that list silently escapes the emoji, em dash and
// English chrome contract, which is the lesson tests/forms-copy.unit.ts already
// records. That suite counts the module's exports, so a forgotten entry turns it red
// rather than passing quietly.
//
// Values that vary at render time are exported as FUNCTIONS taking the value, exactly
// as ./forms.ts handles the same problem, so no route ever concatenates copy inline.
// The relative `.ts` import path convention of that module applies here too: the copy
// suite loads this file directly under `node --test`.

/** Panel shell and navigation (UI-SPEC Component Contract 1). */
export const KOPIA_POWLOKA = {
	wordmark: 'Panel redakcyjny',
	wordmarkLink: 'Panel redakcyjny, przejdź do pulpitu',
	otworzStrone: 'Otwórz stronę żłobka',
	/** Visually hidden suffix, appended to every link that opens a new tab. */
	nowaKarta: ' (otwiera się w nowej karcie)',
	wyloguj: 'Wyloguj',
	skipLink: 'Przejdź do treści',
	opoznieniePublikacji:
		'Zmiany pojawiają się na stronie żłobka po około 2 minutach od zapisania. Jeśli nie widzisz ich od razu, odśwież stronę za chwilę.',
	stopka: 'Publiczny Żłobek w Stromcu, panel redakcyjny.',
	stopkaLink: 'Instrukcja obsługi panelu'
} as const;

/** Navigation labels in the fixed UI-SPEC order. Labels only: the route each one
 *  points at is wiring, not copy, and belongs to the shell component. */
export const NAWIGACJA: readonly string[] = Object.freeze([
	'Pulpit',
	'Aktualności',
	'O nas',
	'Plan dnia',
	'Dokumenty',
	'Nabór',
	'Pomoc'
]);

/** Logowanie, both steps and the whole login state matrix (Component Contract 2).
 *
 *  D-02: the step 2 heading and body are byte-identical whether or not the address is
 *  on the allowlist. There is deliberately no „nie znaleziono" string here, and adding
 *  one would turn the login into an enumeration oracle. */
export const KOPIA_LOGOWANIE = {
	naglowek: 'Panel redakcyjny',
	lead: 'Zaloguj się, aby edytować treści na stronie żłobka.',
	tytulStrony: 'Logowanie, panel redakcyjny',
	adresEtykieta: 'Adres e-mail',
	adresPodpowiedz: 'Podaj adres, który został zgłoszony jako redakcyjny.',
	adresPrzycisk: 'Wyślij kod',
	kodNaglowek: 'Sprawdź swoją skrzynkę',
	kodTresc:
		'Jeśli ten adres ma dostęp do panelu, wysłaliśmy na niego sześciocyfrowy kod. Kod jest ważny 15 minut. Sprawdź też folder ze spamem.',
	kodEtykieta: 'Kod z e-maila',
	kodPodpowiedz: 'Sześć cyfr, na przykład 123456.',
	kodPrzycisk: 'Zaloguj się',
	ponowneWyslanie: 'Wyślij kod ponownie',
	innyAdres: 'Wpisz inny adres e-mail',
	bladAdresBrak: 'Podaj adres e-mail.',
	bladAdresNiepoprawny: 'Podaj poprawny adres e-mail, na przykład anna.kowalska@example.com',
	bladKodBrak: 'Wpisz kod z e-maila.',
	bladKodNiepoprawny: 'Kod jest niepoprawny. Sprawdź go w e-mailu i wpisz jeszcze raz.',
	kodWygaslNaglowek: 'Kod stracił ważność',
	kodWygaslTresc: 'Kod jest ważny 15 minut. Kliknij Wyślij kod ponownie, a przyślemy nowy.',
	zaDuzoProbNaglowek: 'Za dużo prób',
	zaDuzoProbTresc:
		'Dla bezpieczeństwa unieważniliśmy ten kod. Kliknij Wyślij kod ponownie i wpisz nowy kod.',
	limitNaglowek: 'Za dużo prób logowania',
	limitTresc: 'Z tego urządzenia wysłano już kilka kodów. Spróbuj ponownie za godzinę.',
	wysylkaBladNaglowek: 'Nie udało się wysłać kodu',
	wysylkaBladTresc:
		'Spróbuj ponownie za chwilę. Jeśli problem się powtarza, skontaktuj się z osobą, która przekazała Ci dostęp do panelu.',
	sesjaWygasla: 'Twoja sesja wygasła. Zaloguj się ponownie.',
	wylogowano: 'Wylogowano. Do zobaczenia.',
	stronaZablokowana: 'Aby otworzyć tę stronę, zaloguj się.'
} as const;

/** The login code e-mail. A Polish surface like any other (CMS-03), which is why it
 *  lives in this module and is swept by tests/admin-copy.unit.ts rather than being
 *  authored inside the sender. */
export const KOPIA_MAIL_KOD = {
	temat: 'Kod logowania do panelu redakcyjnego',
	powitanie: 'Dzień dobry,',
	wstep: 'oto kod logowania do panelu redakcyjnego strony Publicznego Żłobka w Stromcu:',
	waznosc: 'Kod jest ważny 15 minut.',
	bezpieczenstwo:
		'Jeśli to nie Ty prosiłeś o kod, po prostu zignoruj tę wiadomość. Nikt nie uzyska dostępu bez tego kodu.',
	podpis: 'Publiczny Żłobek w Stromcu'
} as const;

/** Pulpit, the landing screen (Component Contract 3). */
export const KOPIA_PULPIT = {
	naglowek: 'Pulpit',
	lead: 'Wybierz, co chcesz zmienić. Po zapisaniu zmiany pojawią się na stronie po około 2 minutach.',
	aktualnosciTytul: 'Aktualności',
	aktualnosciOpis: 'Wpisy z życia żłobka: dodawaj, poprawiaj i usuwaj ogłoszenia.',
	oNasTytul: 'O nas',
	oNasOpis: 'Misja, wartości, kadra i opis budynku.',
	planDniaTytul: 'Plan dnia',
	planDniaOpis: 'Godziny i zajęcia w ciągu dnia w żłobku.',
	dokumentyTytul: 'Dokumenty',
	dokumentyOpis: 'Pliki do pobrania: wnioski, statut i uchwały.',
	naborTytul: 'Nabór',
	naborOpis: 'Przełącz informację o naborze na stronie.',
	pomocTytul: 'Pomoc',
	pomocOpis: 'Instrukcja krok po kroku, jak korzystać z panelu.'
} as const;

/** Collection list screens (Component Contract 4). */
export const KOPIA_LISTY = {
	aktualnosciNaglowek: 'Aktualności',
	aktualnosciAkcja: 'Dodaj wpis',
	aktualnosciPustyNaglowek: 'Nie ma jeszcze żadnych wpisów',
	aktualnosciPustaTresc:
		'Dodaj pierwszy wpis, a pojawi się w zakładce Aktualności na stronie żłobka.',
	dokumentyNaglowek: 'Dokumenty',
	dokumentyAkcja: 'Dodaj dokument',
	dokumentyPustyNaglowek: 'Nie ma jeszcze żadnych dokumentów',
	dokumentyPustaTresc:
		'Dodaj pierwszy dokument, a pojawi się w zakładce Dokumenty na stronie żłobka.',
	pustaKategoria: 'Brak dokumentów w tej kategorii.',
	odznakaZastepcza: 'Treść zastępcza',
	edytuj: 'Edytuj',
	usun: 'Usuń',
	powrotPulpit: 'Wróć do pulpitu',
	powrotLista: 'Wróć do listy'
} as const;

/** The two aktualność editor screens (Component Contract 5). Separate from POLA_WPIS,
 *  which holds the field labels and hints: these are the screen's own chrome. */
export const KOPIA_EKRAN_WPISU = {
	nowyNaglowek: 'Nowy wpis',
	edycjaNaglowek: 'Edycja wpisu',
	/** Name of the public section the „Zapisano" panel links into. The link itself points
	 *  at the entry that was just written, which is a page OF that section, so the editor
	 *  lands on their own change rather than on a list they then have to search. */
	stronaNazwa: 'Aktualności'
} as const;

/** The two dokument editor screens (Component Contract 5). The contract's DOM-order list
 *  names the h1 of every other editor screen and not this one, so the two headings are
 *  authored here in the same register as „Nowy wpis" and „Edycja wpisu" rather than
 *  borrowed from a screen that means something else. */
export const KOPIA_EKRAN_DOKUMENTU = {
	nowyNaglowek: 'Nowy dokument',
	edycjaNaglowek: 'Edycja dokumentu',
	/** Name of the public section the „Zapisano" panel links into. */
	stronaNazwa: 'Dokumenty'
} as const;

/** The O nas editor (Component Contract 5). The h1 is named by the contract's DOM-order
 *  list, so it is copied from there rather than authored. */
export const KOPIA_EKRAN_O_NAS = {
	naglowek: 'O nas',
	/** Name of the public page the „Zapisano" panel links to. */
	stronaNazwa: 'O nas',
	/** The commit description. Copy like any other: written by this project in Polish,
	 *  landing in the history of a PUBLIC repository, and therefore swept for emoji, em
	 *  dashes and English chrome by tests/admin-copy.unit.ts exactly as a visible label is.
	 *  It names the PAGE rather than a field, because D-11 makes one page one commit and a
	 *  session here can touch nine groups of content at once. */
	opisZapisu: 'zaktualizowano stronę O nas'
} as const;

/** The Plan dnia editor (Component Contract 5). */
export const KOPIA_EKRAN_PLANU = {
	naglowek: 'Plan dnia',
	/** THE ONE THING AN EDITOR CANNOT SEE FROM THIS SCREEN. The day plan is one file
	 *  (02 D-03) rendered in two places, so a single save changes the front page as well as
	 *  the O nas page. Saying so is the same honesty D-18 asks of the publish delay: a
	 *  surprise about where a change landed is worse than a sentence nobody needed. */
	uwagaWspolna:
		'Plan dnia pokazujemy w dwóch miejscach: na stronie głównej i na stronie O nas. Jeden zapis zmienia oba.',
	/** The „Zapisano" panel links to the O nas page, which shows the plan together with the
	 *  rest of the content this panel section is about. */
	stronaNazwa: 'O nas',
	opisZapisu: 'zaktualizowano plan dnia'
} as const;

/** The three date selects, authored once because both the aktualność publication date
 *  and the document version date use them. The month NAMES are not repeated here: they
 *  come from MIESIACE_WYBOR in ./forms.ts, so the project keeps exactly one month
 *  table (the reason is written in src/lib/server/forms/mailer.ts). */
export const POLA_DATA = {
	dzien: 'Dzień',
	miesiac: 'Miesiąc',
	rok: 'Rok',
	pusty: 'Wybierz'
} as const;

/** Wpis (aktualności) form labels and hints. */
export const POLA_WPIS = {
	tytulEtykieta: 'Tytuł *',
	tytulPodpowiedz: 'Tytuł wpisu po polsku. Będzie widoczny na liście i na stronie wpisu.',
	dataLegenda: 'Data publikacji *',
	dataPodpowiedz: 'Wpisy są pokazywane od najnowszego.',
	zajawkaEtykieta: 'Zajawka (opcjonalnie)',
	zajawkaPodpowiedz:
		'Krótkie streszczenie, 2-3 zdania, pokazywane na kafelku listy. Jeśli zostawisz puste, użyjemy początku treści.',
	trescEtykieta: 'Treść *',
	trescPodpowiedz:
		'Treść wpisu. Możesz pogrubić tekst, dodać odnośnik i listę. Zobacz Jak formatować tekst poniżej.',
	zdjecieEtykieta: 'Zdjęcie (opcjonalnie)',
	zdjeciePodpowiedz:
		'Wybierz zdjęcie z telefonu lub komputera. Przytniemy je automatycznie do proporcji 16:9 i zmniejszymy, żeby strona działała szybko.',
	altEtykieta: 'Opis alternatywny (alt) *',
	altPodpowiedz:
		'Napisz, co widać na zdjęciu, na przykład: Dzieci malują farbami przy stoliku. Nie pisz samego słowa zdjęcie. Ten opis czytają osoby korzystające z czytników ekranu.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** O nas form labels and hints. */
export const POLA_O_NAS = {
	leadEtykieta: 'Wprowadzenie *',
	leadPodpowiedz: 'Krótki tekst wprowadzający na górze strony O nas.',
	misjaEtykieta: 'Misja *',
	misjaPodpowiedz: 'Krótki opis misji żłobka. Możesz pogrubić tekst i dodać odnośnik.',
	wartosciLegenda: 'Wartości',
	wartosciPodpowiedz: 'Każda wartość ma tytuł i krótki opis.',
	wartoscTytulEtykieta: 'Tytuł wartości *',
	wartoscOpisEtykieta: 'Opis *',
	kadraOpisEtykieta: 'Kadra: opis *',
	kadraOpisPodpowiedz: 'Ciepły opis zespołu (kwalifikacje, podejście). Bez nazwisk i zdjęć.',
	kadraOpiekunkiEtykieta: 'Liczba opiekunek *',
	kadraOpiekunkiPodpowiedz: 'Wpisz liczbę, na przykład 6.',
	kadraPersonelEtykieta: 'Personel pomocniczy (liczba) *',
	kadraPersonelPodpowiedz: 'Wpisz liczbę, na przykład 3.',
	obiektOpisEtykieta: 'O budynku *',
	obiektOpisPodpowiedz: 'Opis budynku, sali i placu zabaw.',
	zdjeciaLegenda: 'Zdjęcia (budynek, sala, plac zabaw)',
	zdjeciaPodpowiedz: 'Zdjęcia bez osób. Przytniemy je do proporcji 4:3 i zmniejszymy.',
	zdjecieAltEtykieta: 'Opis alternatywny (alt) *',
	zdjecieAltPodpowiedz:
		'Napisz, co widać na zdjęciu, na przykład: Sala zabaw z kolorowymi zabawkami.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** Plan dnia form labels and hints. */
export const POLA_PLAN_DNIA = {
	grupaLegenda: 'Godziny i zajęcia',
	grupaPodpowiedz: 'Kolejne punkty planu dnia. Każdy wiersz: godziny i opis.',
	godzinyEtykieta: 'Godziny *',
	godzinyPodpowiedz: 'Na przykład 7:00–8:30.',
	opisEtykieta: 'Opis *',
	opisPodpowiedz: 'Krótki opis zajęć, na przykład: Śniadanie.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** Dokument form labels, hints and the fixed category options. */
export const POLA_DOKUMENT = {
	nazwaEtykieta: 'Nazwa dokumentu *',
	nazwaPodpowiedz: 'Czytelna nazwa po polsku (nie nazwa pliku).',
	kategoriaEtykieta: 'Kategoria *',
	kategoriaPodpowiedz:
		'Rekrutacja oraz Statut i uchwały są widoczne na stronie. Kategoria RODO zostanie włączona później.',
	kategorieOpcje: ['Rekrutacja', 'Statut i uchwały', 'RODO'],
	plikEtykieta: 'Plik *',
	plikPodpowiedz: 'Wybierz plik PDF, DOC lub DOCX. Maksymalny rozmiar to 10 MB.',
	wersjaLegenda: 'Wersja z dnia *',
	wersjaPodpowiedz: 'Data wersji dokumentu.',
	zrodloEtykieta: 'Źródło (BIP), opcjonalnie',
	zrodloPodpowiedz: 'Wklej pełny adres dokumentu w BIP, zaczynający się od https://',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** Nabór switch (Component Contract 13). The two option descriptions say exactly what
 *  a parent will see, so the editor reads the consequence before saving. */
export const KOPIA_NABOR = {
	naglowek: 'Nabór',
	legenda: 'Stan naboru',
	otwartyEtykieta: 'Nabór otwarty',
	otwartyOpis:
		'Na stronie pojawi się informacja, że prowadzimy nabór, wraz z formularzem zgłoszenia.',
	zamknietyEtykieta: 'Nabór zamknięty',
	zamknietyOpis:
		'Na stronie pojawi się informacja, że nabór podstawowy jest zakończony, a rodzic może zapisać się na listę rezerwową.',
	podgladNaglowek: 'Tak zobaczy to rodzic',
	/** Name of the public page the „Zapisano" panel links to, so the editor can go and
	 *  look at what they just changed. */
	stronaNazwa: 'Rekrutacja',
	/** The two commit descriptions. They are copy like any other: they are written by
	 *  this project in Polish, they land in the history of a PUBLIC repository, and
	 *  they are therefore swept for emoji, em dashes and English chrome by
	 *  tests/admin-copy.unit.ts exactly as a visible label is. */
	opisZapisuOtwarty: 'otwarto nabór',
	opisZapisuZamkniety: 'zamknięto nabór'
} as const;

/** One run of a formatting-help line. `{ kod }` renders inside a code element, which is
 *  how the UI-SPEC's „examples rendered inside code so the syntax is copyable" holds
 *  without putting markup into a copy string. Same shape and same reason as `Fragment` in
 *  ./forms.ts, which already carries the emphasis of the two public form messages. */
export type FragmentPomocy = string | { kod: string };

/** The formatting help disclosure (Component Contract 6). Line 4 states what is NOT
 *  supported on purpose: the stored value has to stay inside the constrained markdown
 *  subset the public renderers already sanitize.
 *
 *  Each line is a list of runs rather than one string, so the syntax example inside it can
 *  be marked as code. Concatenating the runs of a line reproduces the UI-SPEC sentence
 *  character for character, which is what the copy suite asserts. */
export const KOPIA_FORMATOWANIE = {
	podsumowanie: 'Jak formatować tekst',
	linie: [
		[
			'Tekst w podwójnych gwiazdkach jest pogrubiony: ',
			{ kod: '**ważne**' },
			' wyświetli się jako ważne.'
		],
		['Odnośnik zapisujesz tak: ', { kod: '[tekst odnośnika](https://adres.pl)' }],
		['Wiersz zaczynający się od znaku ', { kod: '-' }, ' i spacji tworzy punkt listy.'],
		[
			'Nagłówki, tabele i zdjęcia wewnątrz treści nie są obsługiwane. Zdjęcie dodajesz w polu Zdjęcie powyżej.'
		]
	] as readonly (readonly FragmentPomocy[])[]
} as const;

/** Server-rendered validation. Every message says what to DO (WCAG 3.3.3), never
 *  merely that something is wrong. */
export const KOPIA_WALIDACJA = {
	podsumowanieNaglowek: 'Popraw zaznaczone pola',
	podsumowanieTresc: 'Nie zapisaliśmy zmian, ponieważ część pól wymaga poprawy.',
	tytulBrak: 'Podaj tytuł wpisu.',
	dataNiepelna: 'Wybierz dzień, miesiąc i rok publikacji.',
	trescBrak: 'Wpisz treść wpisu.',
	altBrak: 'Napisz opis alternatywny zdjęcia. Bez niego nie możemy zapisać zdjęcia.',
	zdjecieZlyTyp: 'Ten plik nie jest zdjęciem. Wybierz plik JPG, PNG lub WEBP.',
	zdjecieZaDuze: 'To zdjęcie jest za duże. Wybierz zdjęcie mniejsze niż 15 MB.',
	nazwaBrak: 'Podaj nazwę dokumentu.',
	kategoriaBrak: 'Wybierz kategorię.',
	plikBrak: 'Wybierz plik do pobrania.',
	plikZlyTyp: 'Wybierz plik PDF, DOC lub DOCX.',
	plikZaDuzy: 'Ten plik jest za duży. Maksymalny rozmiar to 10 MB.',
	wersjaNiepelna: 'Wybierz dzień, miesiąc i rok wersji dokumentu.',
	zrodloNiepoprawne: 'Ten adres jest niepoprawny. Wklej pełny adres, zaczynający się od https://',
	liczbaNiepoprawna: 'Wpisz liczbę, na przykład 6.',
	godzinyBrak: 'Wpisz godziny, na przykład 7:00–8:30.',
	/** The other half of a day-plan row. The UI-SPEC's error table names only the hours,
	 *  and a row has two required fields, so „popraw ten wiersz" would leave the editor
	 *  guessing which one. Written in the register of its own hint (WCAG 3.3.3: say what
	 *  to do), exactly as the hours message quotes the hours hint. */
	opisWierszaBrak: 'Wpisz opis zajęć, na przykład: Śniadanie.',
	wartoscNiepelna: 'Uzupełnij tytuł i opis tej wartości albo usuń ją.',
	/** A facility photo item whose picture was cleared and not replaced. „Usuń zdjęcie"
	 *  inside the photo control empties the item; „Usuń to zdjęcie" removes the item
	 *  itself. An item with no picture has nothing to publish and nothing to describe, so
	 *  the refusal names BOTH ways out rather than only one. */
	zdjecieBrak: 'Wybierz zdjęcie albo usuń tę pozycję.',
	/** The recruitment switch has two states and no third one, so „nothing chosen" and
	 *  „something unexpected arrived" are the same thing to the person in front of the
	 *  screen and get the same instruction (WCAG 3.3.3: say what to do). */
	stanNaboruBrak: 'Zaznacz, czy nabór jest otwarty, czy zamknięty.'
} as const;

/** Save, conflict and failure surfaces (Component Contracts 9 and 10), plus the
 *  repeatable-group notes from Contract 7. */
export const KOPIA_ZAPIS = {
	zapisanoNaglowek: 'Zapisano',
	zapisanoTresc: 'Zmiana została zapisana. Pojawi się na stronie żłobka po około 2 minutach.',
	usunietoNaglowek: 'Usunięto',
	usunietoTresc: 'Wpis został usunięty. Zniknie ze strony żłobka po około 2 minutach.',
	nota: 'Zmiany zapisują się jako jedna całość. Pojawią się na stronie po około 2 minutach.',
	zapisz: 'Zapisz',
	zapisywanie: 'Zapisywanie...',
	anuluj: 'Anuluj',
	wymaganeNota: 'Pola oznaczone gwiazdką (*) są wymagane.',
	konfliktNaglowek: 'Ktoś zmienił tę treść w międzyczasie',
	konfliktTresc:
		'Nie zapisaliśmy zmian, żeby nie skasować pracy innej osoby. Skopiuj swój tekst, odśwież stronę, sprawdź aktualną treść i wprowadź zmiany jeszcze raz.',
	konfliktAkcja: 'Odśwież stronę',
	bladNaglowek: 'Nie udało się zapisać zmian',
	bladTresc:
		'Twoje zmiany nie zostały zapisane. Wpisane dane zostały w formularzu, spróbuj ponownie za chwilę.',
	brakTresciNaglowek: 'Nie znaleziono tej treści',
	brakTresciTresc: 'Ta treść mogła zostać usunięta. Wróć do listy i sprawdź.',
	/** P-17. The panel generates the filename from the date and the title (D-14), so two
	 *  entries published on the same day under the same title would want the same file.
	 *  Overwriting the older one silently is a data-loss defect, and a random suffix would
	 *  make the address of a post unpredictable, so the create is refused and the editor is
	 *  told exactly which two fields decide the answer. Same register as the rest of the
	 *  refusal copy: what happened, then what to do. */
	kolizjaNaglowek: 'Taki wpis już istnieje',
	kolizjaTresc:
		'Wpis o tym tytule i z tą datą publikacji już jest na stronie. Zmień tytuł albo datę publikacji i zapisz jeszcze raz.',
	/** The same refusal for a document, and it needs its own words rather than the two above
	 *  (P-23). A document's identity is the slug of its NAME alone: it has no publication
	 *  date, and its wersja is the date of the document itself and decides nothing about the
	 *  filename. Reusing the aktualność sentence would tell an editor to change a date that
	 *  is not the problem and could not fix it. */
	kolizjaDokumentNaglowek: 'Taki dokument już istnieje',
	kolizjaDokumentTresc:
		'Dokument o tej nazwie już jest na stronie. Zmień nazwę dokumentu i zapisz jeszcze raz.',
	/** The deletion confirmation on the dokumenty list. „Wpis został usunięty" would be the
	 *  wrong noun, and a document also disappears in a way worth naming out loud: it stops
	 *  being downloadable. */
	usunietoDokumentTresc: 'Dokument został usunięty. Zniknie ze strony żłobka po około 2 minutach.',
	notaGrupy: 'Dodanie lub usunięcie wiersza nie zapisuje zmian. Na końcu kliknij Zapisz.',
	dodajWartosc: 'Dodaj wartość',
	dodajWiersz: 'Dodaj wiersz',
	dodajZdjecie: 'Dodaj zdjęcie',
	usunWartosc: 'Usuń tę wartość',
	usunWiersz: 'Usuń ten wiersz',
	usunZdjecie: 'Usuń to zdjęcie'
} as const;

/** The photo island (Component Contract 8). Nothing here describes motion, because
 *  the island animates nothing: the status text IS the progress indicator. */
export const KOPIA_ZDJECIA = {
	/** Visible label of the native file control. The UI-SPEC requires a real visible label
	 *  on it and its copy table names only the fieldset legend, so this one is authored
	 *  here rather than borrowed: repeating „Zdjęcie (opcjonalnie)" on both the legend and
	 *  the label would announce the same words twice to a screen-reader user, and a control
	 *  with no label of its own is the one thing the Accessibility Contract never allows. */
	wybierzEtykieta: 'Wybierz zdjęcie',
	przygotowywanie: 'Przygotowywanie zdjęcia...',
	gotowe169: 'Zdjęcie gotowe. Zostało przycięte do proporcji 16:9 i zmniejszone.',
	gotowe43: 'Zdjęcie gotowe. Zostało przycięte do proporcji 4:3 i zmniejszone.',
	podpisPodgladu: 'Tak zdjęcie pojawi się na stronie.',
	wybierzInne: 'Wybierz inne zdjęcie',
	usun: 'Usuń zdjęcie',
	usunieto: 'Usunięto zdjęcie z formularza.',
	bezSkryptow:
		'Dodawanie zdjęć wymaga włączonej obsługi JavaScript. Pozostałe pola możesz wypełnić i zapisać normalnie.'
} as const;

/** The document file field (P-22). Deliberately a separate export from KOPIA_ZDJECIA: the
 *  two fields share a mechanism and nothing else, and one shared block would let a sentence
 *  about a photograph reach a screen that is asking for a PDF.
 *
 *  Nothing here describes motion, because the file island animates nothing: the status
 *  sentence IS the progress indicator, exactly as in the photo island. */
export const KOPIA_PLIKU = {
	/** Visible label of the native file control. Authored here for the same reason
	 *  KOPIA_ZDJECIA.wybierzEtykieta is: the UI-SPEC's Dokument table names only the field
	 *  („Plik *"), reusing that on both the legend and the label would announce the same
	 *  words twice, and a control with no label of its own is the one thing the
	 *  Accessibility Contract never allows. */
	wybierzEtykieta: 'Wybierz plik',
	przygotowywanie: 'Przygotowywanie pliku...',
	gotowe: 'Plik jest gotowy do zapisania.',
	usun: 'Usuń wybrany plik',
	usunieto: 'Usunięto plik z formularza.',
	/** P-22, stated honestly and in full. It says what needs JavaScript and, just as
	 *  importantly, what still works without it: everything except attaching the file, so a
	 *  document that already has one can have its name, kategoria, wersja and adres BIP
	 *  corrected and saved with scripting switched off. */
	bezSkryptow:
		'Dołączenie pliku wymaga włączonej obsługi JavaScript. Pozostałe pola (nazwa, kategoria, wersja, źródło w BIP) możesz wypełnić i zapisać normalnie, także wtedy, gdy poprawiasz dokument, który plik już ma.'
} as const;

/** Destructive confirmation pages (Component Contract 11). The copy never promises
 *  recovery: it says the operation cannot be undone in the panel, which is true, and
 *  stops there. */
export const KOPIA_USUWANIE = {
	wpisNaglowek: 'Usunąć ten wpis?',
	wpisPrzycisk: 'Usuń wpis',
	dokumentNaglowek: 'Usunąć ten dokument?',
	dokumentPrzycisk: 'Usuń dokument',
	anuluj: 'Anuluj'
} as const;

/** „Zalogowano jako" line. Takes the D-04 handle, never the address: the full address
 *  belongs on the login echo line and nowhere else. */
export function zalogowanoJako(uchwyt: string): string {
	return `Zalogowano jako: ${uchwyt}`;
}

/** Page title of every panel screen. */
export function tytulStrony(sekcja: string): string {
	return `${sekcja}, panel redakcyjny`;
}

/** Step 2 echo line, so a typo in the address is visible to the person who made it. */
export function wyslanoKodNa(adres: string): string {
	return `Wysłaliśmy kod na: ${adres}`;
}

/** Pulpit card counters. */
export function liczbaWpisow(ile: number): string {
	return `Liczba wpisów: ${ile}`;
}

export function liczbaDokumentow(ile: number): string {
	return `Liczba dokumentów: ${ile}`;
}

/** Current recruitment state on the Pulpit card. Neutral information, never phrased or
 *  coloured as a failure. */
export function obecnieNabor(otwarty: boolean): string {
	return otwarty ? 'Obecnie: nabór otwarty.' : 'Obecnie: nabór zamknięty.';
}

/** Visually hidden suffix naming the row a repeated action belongs to. A list of eight
 *  identical „Usuń" links is a WCAG 2.4.4 failure, and this suffix is the fix. */
export function ukryteWpis(tytul: string): string {
	return ` wpis: ${tytul}`;
}

export function ukryteDokument(nazwa: string): string {
	return ` dokument: ${nazwa}`;
}

/** Over-long text, with the cap the server actually enforced. */
export function tekstZaDlugi(limit: number): string {
	return `Tekst jest za długi. Skróć go do ${limit} znaków.`;
}

/** Link inside the „Zapisano" panel. The new-tab suffix from KOPIA_POWLOKA is appended
 *  by the component, so the two can never disagree about the wording. */
export function zobaczStrone(nazwaStrony: string): string {
	return `Zobacz stronę: ${nazwaStrony}`;
}

/** Announcements after a repeatable row is added or removed. */
export function dodanoWiersz(numer: number): string {
	return `Dodano wiersz ${numer}.`;
}

export function usunietoWiersz(numer: number): string {
	return `Usunięto wiersz ${numer}.`;
}

/** Numbered legends of the repeatable groups. */
export function legendaWartosci(numer: number): string {
	return `Wartość ${numer}`;
}

export function legendaWiersza(numer: number): string {
	return `Wiersz ${numer}`;
}

export function legendaZdjecia(numer: number): string {
	return `Zdjęcie ${numer}`;
}

/** One line of the validation summary for a control inside a repeated group.
 *
 *  A list of four identical „Uzupełnij tytuł i opis tej wartości" links is WCAG 2.4.4
 *  failure by construction: the link text is the whole accessible name and four of them
 *  are indistinguishable. Prefixing the numbered legend makes each entry say which item it
 *  will take the editor to, and it is composed here rather than in a page so no route ever
 *  concatenates copy inline. */
export function bladWElemencie(legenda: string, komunikat: string): string {
	return `${legenda}: ${komunikat}`;
}

/** The three commit descriptions of the aktualności collection. They are copy like any
 *  other: written by this project in Polish, landing in the history of a PUBLIC
 *  repository, and therefore swept for emoji, em dashes and English chrome by
 *  tests/admin-copy.unit.ts exactly as a visible label is. The title is quoted so a
 *  person reading `git log` can tell which entry a commit touched without opening it. */
export function opisDodaniaWpisu(tytul: string): string {
	return `dodano wpis „${tytul}”`;
}

export function opisZmianyWpisu(tytul: string): string {
	return `zaktualizowano wpis „${tytul}”`;
}

export function opisUsunieciaWpisu(tytul: string): string {
	return `usunięto wpis „${tytul}”`;
}

/** The three commit descriptions of the dokumenty collection, in the same register and for
 *  the same reasons as the aktualności ones above: three different verbs, so `git log`
 *  distinguishes a create from an edit from a deletion without opening the diff. */
export function opisDodaniaDokumentu(nazwa: string): string {
	return `dodano dokument „${nazwa}”`;
}

export function opisZmianyDokumentu(nazwa: string): string {
	return `zaktualizowano dokument „${nazwa}”`;
}

export function opisUsunieciaDokumentu(nazwa: string): string {
	return `usunięto dokument „${nazwa}”`;
}

/** Row meta on the dokumenty list (Component Contract 4). Type and the dotted version date,
 *  with the middot separator the public document rows already use.
 *
 *  THE SIZE IS DELIBERATELY ABSENT, and the reason is not cosmetic: the public rows show it
 *  because they are prerendered and can stat the file on disk, while the panel runs inside
 *  the Cloudflare Worker, which has no filesystem to stat. A size shown here could only be a
 *  stored number, which is exactly what D-14 forbids, because a stored size cannot be
 *  corrected when the file is replaced. */
export function metaDokumentu(typ: string, wersja: string): string {
	return `${typ} · wersja z ${wersja}`;
}

/** The file an editor has just chosen, before anything is saved. Names it and gives its
 *  size, so the person can see they picked the file they meant to. */
export function wybranyPlik(nazwa: string, rozmiar: string): string {
	return `Wybrany plik: ${nazwa} (${rozmiar})`;
}

/** The file a document ALREADY has, shown as text on the edit screen so an editor knows
 *  what is attached before deciding whether to replace it. */
export function obecnyPlik(opis: string): string {
	return `Obecny plik: ${opis}`;
}

/** Delete confirmation bodies, quoting exactly what is about to disappear. */
export function trescUsunieciaWpisu(tytul: string, data: string): string {
	return `Zamierzasz usunąć wpis „${tytul}” z dnia ${data}. Zniknie ze strony żłobka po około 2 minutach. Tej operacji nie można cofnąć w panelu.`;
}

export function trescUsunieciaDokumentu(nazwa: string): string {
	return `Zamierzasz usunąć dokument „${nazwa}”. Przestanie być dostępny do pobrania na stronie żłobka po około 2 minutach. Tej operacji nie można cofnąć w panelu.`;
}
