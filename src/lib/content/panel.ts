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
	// 05-UI-SPEC Contract 12: Galeria sits directly after O nas, because that is the page it
	// renders on, so an editor looking for the O nas photographs finds it adjacent to the
	// screen they just left.
	'Galeria',
	'Plan dnia',
	'Cennik',
	'Dokumenty',
	'Nabór',
	'Pomoc'
]);

/** Polish section names keyed by the FIRST path segment under /admin, with the empty
 *  string standing for the landing screen, in the UI-SPEC nav order.
 *
 *  This is the source of the „{Sekcja}, panel redakcyjny" page title that the shell
 *  builds through `tytulStrony` below, so every value here is a visible string: it
 *  reaches the browser tab, the window switcher and a screen reader's page announcement.
 *  That is why it lives in this module and is swept, and it is why it could not stay
 *  where it was written: SvelteKit restricts the names a `+layout.server.ts` may export,
 *  so the map sitting beside its one consumer was unreachable by any test.
 *
 *  An unknown segment is NOT listed here on purpose. The layout falls back to the
 *  neutral wordmark rather than leaking a raw path segment into a title, and
 *  tests/admin-enumeracja.spec.ts asserts that no route the panel actually serves ever
 *  reaches that fallback. */
export const SEKCJE_PANELU: Readonly<Record<string, string>> = Object.freeze({
	'': 'Pulpit',
	logowanie: 'Logowanie',
	aktualnosci: 'Aktualności',
	'o-nas': 'O nas',
	galeria: 'Galeria',
	'plan-dnia': 'Plan dnia',
	cennik: 'Cennik',
	dokumenty: 'Dokumenty',
	nabor: 'Nabór',
	// 05-UI-SPEC Contract 11 and 05 D-34. „W skrócie" is a pulpit tile and NOT a navigation
	// chip, so it is deliberately absent from NAWIGACJA above and from SCIEZKI_PANELU. It
	// still owes an entry HERE: this map is the source of the browser tab on every panel
	// screen, and a route missing from it degrades to the neutral wordmark silently.
	'w-skrocie': 'W skrócie',
	pomoc: 'Pomoc'
});

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
	// Osobna treść dla wpisywania kodu (CR-01). Ta sama granica, inna przyczyna:
	// tam wysłano za dużo kodów, tu wpisano za dużo błędnych. Jedno zdanie dla obu
	// mówiłoby osobie, która się pomyliła, że coś wysyłała.
	limitProbTresc:
		'Z tego urządzenia wpisano już kilka błędnych kodów. Spróbuj ponownie za godzinę.',
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
	/** THE ONLY CARD THAT GAINS A COUNTER IN THIS PHASE (05-UI-SPEC Contract 12). The number
	 *  comes from the reader that feeds the Galeria screen itself, never from a count of its
	 *  own, which is the rule 04.1-10 established for the two counters already here. */
	galeriaTytul: 'Galeria',
	galeriaOpis: 'Zdjęcia sal, placu zabaw i budynku, pokazywane na stronie O nas.',
	planDniaTytul: 'Plan dnia',
	planDniaOpis: 'Godziny i zajęcia w ciągu dnia w żłobku.',
	dokumentyTytul: 'Dokumenty',
	dokumentyOpis: 'Pliki do pobrania: wnioski, statut i uchwały.',
	naborTytul: 'Nabór',
	naborOpis: 'Przełącz informację o naborze na stronie.',
	/** DELIBERATELY WITHOUT A STATE LINE (05-UI-SPEC Contract 12). The other cards that
	 *  carry one show a count or a switch position; a fee amount rendered here would be a
	 *  third place the same number has to stay correct, and the pulpit is the one screen
	 *  nobody would think to check after changing it. */
	cennikTytul: 'Cennik',
	cennikOpis: 'Kwoty i opis opłat za pobyt oraz wyżywienie.',
	/** THE ONE DESTINATION THE PANEL NAVIGATION DOES NOT CARRY (05 D-34, 05-UI-SPEC
	 *  Contract 12). Opening hours and place counts change once every few years, and a tenth
	 *  chip would put roughly four rows of navigation above every screen in a panel meant for
	 *  uploading photographs from a phone. No state line, for the same reason as Cennik. */
	wSkrocieTytul: 'W skrócie',
	wSkrocieOpis: 'Cztery kafelki na górze strony głównej: wiek, godziny, opłata i liczba miejsc.',
	pomocTytul: 'Pomoc',
	pomocOpis: 'Instrukcja krok po kroku, jak korzystać z panelu.'
} as const;

/** The Pomoc screen. DELIBERATELY ALMOST EMPTY, and that is the point of P-27: every
 *  word of the instrukcja itself is authored once, in docs/instrukcja-cms.md, and the
 *  screen renders that document. Restating any of it here would create a second
 *  instrukcja that agrees with the first only on the day it is written.
 *
 *  What is left is the one thing the document cannot carry, because it is a link to the
 *  document: the label of the control that hands a staff member their own copy. */
export const KOPIA_POMOC = {
	plikLink: 'Pobierz tę instrukcję jako plik tekstowy'
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

/** The Galeria editor (05-UI-SPEC Contract 8, GALLERY-02, 05 D-21 to D-26). One screen holding
 *  the WHOLE photo list and one „Zapisz": twelve photographs in one sitting is one commit and
 *  one Cloudflare build, where a screen per photograph would be twelve of each. */
export const KOPIA_EKRAN_GALERII = {
	naglowek: 'Galeria',
	/** Name of the public page the „Zapisano" panel links to. The gallery is a SECTION of the
	 *  O nas page (05 D-19), so the editor lands on the page their photographs appear on and
	 *  not on a page of their own that does not exist. */
	stronaNazwa: 'O nas',
	/** What replaces the add button once the list is full (05 D-23). The button disappearing on
	 *  its own would look like a fault; this sentence says what happened and what to do about
	 *  it. The number here is the one src/lib/pola-strony.ts enforces, and
	 *  tests/admin-walidacja-galeria.unit.ts asserts the two cannot drift apart. */
	limitOsiagniety: 'Osiągnięto limit 12 zdjęć. Aby dodać nowe, usuń najpierw jedno z istniejących.',
	/** The empty state of the list. A repeated group with nothing in it and no explanation reads
	 *  as a screen that failed to load. */
	pustaLista: 'Nie ma jeszcze żadnych zdjęć. Kliknij Dodaj zdjęcie, aby dodać pierwsze.',
	/** The commit description. Copy like any other: written in Polish by this project and
	 *  landing in the history of a PUBLIC repository, so it is swept with the labels. It names
	 *  the PAGE rather than one photograph, because one save carries the whole list (D-11). */
	opisZapisu: 'zaktualizowano galerię'
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

/** The Cennik editor (05-UI-SPEC Contract 10, FEES-01, 05 D-27, D-28). A singleton screen
 *  on the Nabór template: one „Zapisz", one commit, one build. */
export const KOPIA_CENNIK = {
	naglowek: 'Cennik',
	kwotyLegenda: 'Kwoty',
	opisLegenda: 'Opis opłat',
	/** The hint under the read-only computed line. It has to say TWO things, because the
	 *  line is the one value on this screen that does not follow what is being typed:
	 *  where the number comes from, and that it moves only after a save. Recomputing it
	 *  live would need JavaScript on a screen that otherwise needs none, and a figure that
	 *  changes as you type is the easiest thing on a form to mistake for a saved one. */
	obliczonaPodpowiedz:
		'To jest kwota, którą naprawdę płaci rodzic: stawka z uchwały pomniejszona o obniżkę. Zmieni się dopiero po zapisaniu.',
	/** Name of the public page the „Zapisano" panel links to. */
	stronaNazwa: 'Cennik',
	/** The commit description. Copy like any other: written in Polish by this project and
	 *  landing in the history of a PUBLIC repository, so it is swept with the labels. It
	 *  names the PAGE rather than a field, because one page is one commit (D-11) and a
	 *  session here can change every amount and every sentence at once. */
	opisZapisu: 'zaktualizowano cennik'
} as const;

/** Cennik form labels and hints (05-UI-SPEC Contract 10). Both amounts are whole złoty:
 *  the uchwała quotes grosze and this store deliberately drops them, so the hints say
 *  „bez groszy" rather than leaving an editor to discover it from a refusal. */
export const POLA_CENNIK = {
	stawkaEtykieta: 'Stawka z uchwały (zł) *',
	// Says outright that this is NOT the parent's amount (quick 260821-gyh). This is the
	// FIRST and an EDITABLE control on the screen, while the payable figure appears third
	// and read-only, so an editor who reads „stawka" as „czesne" could save a wrong number
	// straight onto the live site. The żłobek's dyrektor made exactly that reading on
	// 2026-08-20, from the uchwała rather than from this screen.
	stawkaPodpowiedz:
		'Pełna stawka z uchwały, przed odjęciem obniżki. Nie jest to kwota, którą płaci rodzic. Tę wyliczamy sami i pokazujemy niżej. Wpisz stawkę w pełnych złotych, bez groszy, na przykład 2337.',
	obnizkaEtykieta: 'Obniżka (zł) *',
	obnizkaPodpowiedz:
		'O ile obniżamy stawkę z uchwały. Tę kwotę odejmujemy od stawki, żeby wyliczyć to, co płaci rodzic. Jeśli nie stosujemy obniżki, wpisz 0. Na przykład 837.',
	naglowekEtykieta: 'Nagłówek panelu opłat *',
	naglowekPodpowiedz:
		'Krótki tytuł całej ramki z opłatami, na przykład: Opłaty w skrócie. Sama kwota ma już swój podpis, więc nie trzeba go tu powtarzać.',
	kwotaOpisEtykieta: 'Opis opłaty *',
	kwotaOpisPodpowiedz: 'Jedno zdanie wyjaśniające, za co jest ta kwota.',
	zusEtykieta: 'Świadczenie z ZUS *',
	zusPodpowiedz:
		'Zdanie o świadczeniu „Aktywnie w żłobku” i o warunku, na jakim ZUS je przyznaje. To pole jest obowiązkowe.',
	wyzywienieEtykieta: 'Wyżywienie *',
	wyzywieniePodpowiedz: 'Stawka za wyżywienie i za co jest pobierana.',
	nieobecnoscEtykieta: 'Nieobecność dziecka *',
	nieobecnoscPodpowiedz: 'Zasady odpisów za zgłoszoną nieobecność.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** The W skrócie editor (05-UI-SPEC Contract 11, 05 D-32, D-33). A FIXED-ARITY singleton
 *  screen: exactly four tiles, fields only, no add and no remove. Two of the four are
 *  read-only, and each of them is read-only for a reason the lead sentence tells the editor
 *  out loud rather than leaving them to discover from a screen that will not respond. */
export const KOPIA_W_SKROCIE = {
	naglowek: 'W skrócie',
	lead: 'To cztery kafelki na górze strony głównej. Dwa z nich zmieniasz gdzie indziej i są tu tylko do wglądu.',
	wiekLegenda: 'Kafelek: wiek dzieci',
	/** Read-only, per 05-UI-SPEC Contract 7. The same age range is stated a second time, in
	 *  a second phrasing, on the Rekrutacja page, and both are statutory final facts: an
	 *  editable tile would let somebody change one of them and not the other. */
	wiekPodpowiedz:
		'Wiek dzieci wynika ze statutu żłobka i jest podany także na stronie Rekrutacja, dlatego zmienia go osoba opiekująca się stroną.',
	godzinyLegenda: 'Kafelek: godziny otwarcia',
	/** THE ONE THING AN EDITOR CANNOT SEE FROM THIS SCREEN, and the whole reason the hours
	 *  were unified rather than left alone: these four fields also feed the footer of every
	 *  page and the bar at the top of the site, so there is nowhere else to change them. */
	godzinyUwaga:
		'Te godziny pokazujemy w trzech miejscach: na stronie głównej, w pasku na górze strony i w stopce. Jeden zapis zmienia wszystkie.',
	oplataLegenda: 'Kafelek: opłata',
	/** Read-only, and the hint names the screen that DOES own the value, because „you cannot
	 *  change this here" without „and here is where you can" is a dead end. */
	oplataPodpowiedz:
		'Tę kwotę zmieniasz na ekranie Cennik, żeby wszędzie na stronie była taka sama.',
	oplataLink: 'Przejdź do Cennika',
	miejscaLegenda: 'Kafelek: liczba miejsc',
	/** The „Zapisano" panel's link. Written out rather than built by `zobaczStrone` above,
	 *  because the front page is the one page in this project whose name is a phrase rather
	 *  than a label, and „Zobacz stronę: Strona główna" reads like a machine wrote it. */
	zobaczStroneGlowna: 'Zobacz stronę główną',
	/** The commit description. Copy like any other: written in Polish by this project and
	 *  landing in the history of a PUBLIC repository, so it is swept with the labels. */
	opisZapisu: 'zaktualizowano kafelki na stronie głównej'
} as const;

/** W skrócie form labels and hints (05-UI-SPEC Contract 11).
 *
 *  THE HOURS FIELDSET CARRIES FOUR FIELDS rather than the uniform label, value and note
 *  shape the other tiles take, because the surfaces that render the hours need different
 *  fragments: the strip wants the bare range, the top bar wants the short day form beside
 *  it and the footer wants the full day name on a line of its own. The fixed arity of this
 *  screen is about the number of TILES, never about every tile carrying the same fields. */
export const POLA_W_SKROCIE = {
	godzinyEtykieta: 'Godziny otwarcia *',
	godzinyPodpowiedz: 'Na przykład 6:30–16:30.',
	dniPelneEtykieta: 'Dni, pełna nazwa *',
	dniPelnePodpowiedz: 'Na przykład: poniedziałek-piątek. Tak pokazujemy je w stopce.',
	dniSkrotEtykieta: 'Dni, skrót *',
	dniSkrotPodpowiedz: 'Krótka forma używana w pasku na górze strony, na przykład: pon.-pt.',
	weekendEtykieta: 'Weekend *',
	weekendPodpowiedz: 'Na przykład: soboty i niedziele: nieczynne.',
	miejscaEtykieta: 'Liczba miejsc *',
	miejscaPodpowiedz: 'Sama liczba, na przykład 50.',
	dopisekEtykieta: 'Dopisek (opcjonalnie)',
	dopisekPodpowiedz: 'Krótkie wyjaśnienie pod liczbą, jeśli jest potrzebne.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
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

/** O nas form labels and hints.
 *
 *  NO PHOTO LABELS HERE SINCE PLAN 05-07. The facility photographs, their group legend and
 *  their alt field moved to `POLA_GALERIA` below with the screen that owns them. „O budynku"
 *  stayed, because it is prose about the building rather than a picture of it. */
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
	// „Bez nazwisk i zdjęć" until 2026-08-18, and by then it was false: the żłobek sent
	// four names and the page lists them. The hint kept telling an editor not to do the
	// thing the site already does. Photographs are still out, and that half stays.
	kadraOpisPodpowiedz:
		'Ciepły opis zespołu (kwalifikacje, podejście). Nazwiska dodajesz niżej, na liście. Bez zdjęć.',
	kadraLegenda: 'Kadra: osoby',
	kadraPodpowiedz: 'Imię i nazwisko każdej osoby. Rolę wpisz tylko tam, gdzie jest inna.',
	osobaImieEtykieta: 'Imię i nazwisko *',
	osobaRolaEtykieta: 'Rola (opcjonalnie)',
	osobaRolaPodpowiedz: 'Na przykład Dyrektor. Zostaw puste dla opiekunek.',
	obiektOpisEtykieta: 'O budynku *',
	obiektOpisPodpowiedz: 'Opis budynku, sali i placu zabaw. Zdjęcia dodajesz w sekcji Galeria.',
	zastepczaEtykieta: 'Treść zastępcza (do potwierdzenia)',
	zastepczaPodpowiedz: 'Zaznacz, dopóki treść nie została potwierdzona.'
} as const;

/** Galeria form labels and hints (05-UI-SPEC Contract 8, 05 D-25).
 *
 *  THE FILE CONTROL'S OWN VISIBLE LABEL IS NOT HERE, deliberately, and neither is the item's
 *  numbered legend. Both already exist and are shared with every screen that mounts the photo
 *  island: `KOPIA_ZDJECIA.wybierzEtykieta` labels the native control (its declaration records
 *  why it is authored there rather than borrowed) and `legendaZdjecia` numbers the item.
 *  Adding a third „Zdjęcie" label beside them would announce the same word twice to a
 *  screen-reader user, which is the very thing that declaration exists to prevent. */
export const POLA_GALERIA = {
	zdjeciaLegenda: 'Zdjęcia galerii',
	zdjeciaPodpowiedz:
		'Zdjęcia bez osób. Przytniemy je do proporcji 4:3 i zmniejszymy. Możesz dodać najwyżej 12 zdjęć.',
	zdjeciePodpowiedz:
		'Wybierz zdjęcie z telefonu lub komputera. Przytniemy je automatycznie do proporcji 4:3 i zmniejszymy, żeby strona działała szybko.',
	podpisEtykieta: 'Podpis zdjęcia *',
	podpisPodpowiedz:
		'Krótka nazwa miejsca, na przykład: Sala zabaw. Pojawi się pod zdjęciem na stronie.',
	altEtykieta: 'Opis alternatywny (alt) *',
	altPodpowiedz:
		'Napisz, co widać na zdjęciu, na przykład: Sala zabaw z kolorowymi zabawkami. Nie pisz samego słowa zdjęcie. Ten opis czytają osoby korzystające z czytników ekranu.',
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
	/** ONE required field on this row, so the sentence names it rather than listing the
	 *  pair the wartości message has to. The „albo usuń ją" half is the same escape: an
	 *  editor who added a row by accident must be told how to get rid of it. */
	osobaBezImienia: 'Wpisz imię i nazwisko tej osoby albo usuń ją.',
	/** A facility photo item whose picture was cleared and not replaced. „Usuń zdjęcie"
	 *  inside the photo control empties the item; „Usuń to zdjęcie" removes the item
	 *  itself. An item with no picture has nothing to publish and nothing to describe, so
	 *  the refusal names BOTH ways out rather than only one. */
	zdjecieBrak: 'Wybierz zdjęcie albo usuń tę pozycję.',
	/** The same situation on the GALERIA screen, and it needs its own words (05-UI-SPEC
	 *  Contract 8's validation table spells it out rather than marking it „existing string").
	 *  A gallery item is three controls, not one: the picture, its caption and its description.
	 *  „Usuń tę pozycję" would leave an editor wondering whether it means the picture they
	 *  just cleared; „usuń całą pozycję" says that the caption and the description go with it. */
	zdjecieGaleriiBrak: 'Wybierz zdjęcie albo usuń całą pozycję.',
	/** The visible caption of a gallery photo (05 D-25). It quotes its own hint's example, so a
	 *  refusal reads as the same instruction the editor was already given (WCAG 3.3.3). */
	podpisBrak: 'Podaj podpis zdjęcia, na przykład: Sala zabaw.',
	/** The twelve-photo cap (05 D-23), refused ON THE SERVER. The screen stops rendering the add
	 *  button at the limit, but that is an affordance: this message is what answers a submission
	 *  that carries thirteen anyway, whatever the page it came from rendered. */
	limitZdjecPrzekroczony: 'Możesz dodać najwyżej 12 zdjęć. Usuń nadmiarowe i zapisz jeszcze raz.',
	/** The recruitment switch has two states and no third one, so „nothing chosen" and
	 *  „something unexpected arrived" are the same thing to the person in front of the
	 *  screen and get the same instruction (WCAG 3.3.3: say what to do). */
	stanNaboruBrak: 'Zaznacz, czy nabór jest otwarty, czy zamknięty.',
	/** The two amounts of 05-UI-SPEC Contract 10. Each quotes its own hint's example, so a
	 *  refusal reads as the same instruction the editor was already given. */
	stawkaNiepoprawna: 'Wpisz stawkę z uchwały w pełnych złotych, na przykład 2337.',
	obnizkaNiepoprawna:
		'Wpisz kwotę obniżki w pełnych złotych. Jeśli nie stosujecie obniżki, wpisz 0.',
	/** The cross-field invariant (05 D-28). It names BOTH amounts and leaves the choice to
	 *  the editor, because either one of them may be the one that is wrong, and a message
	 *  that guessed would send half of the people who read it to the wrong control. */
	obnizkaNieMniejsza:
		'Obniżka musi być mniejsza od stawki z uchwały. Popraw jedną z tych dwóch kwot.',
	/** 05 D-27, and the sentence that turns an editorial rule into a property of the form.
	 *  It says WHY, deliberately at length: „to pole jest wymagane" would read as pedantry,
	 *  while the real reason is that an amount may not appear on the żłobek's website
	 *  without the condition under which a parent does not pay it. */
	zusBrak:
		'Wpisz zdanie o świadczeniu z ZUS. Bez niego nie zapiszemy cennika: kwota nie może pojawić się na stronie bez warunku, na jakim rodzic jej nie płaci.',
	/** 05 D-31 (dane-bip paragraf 10 punkt 1). The refusal names what is wrong with the
	 *  field and gives both ways out, because either is a correct fix. */
	kwotaZeroBezWarunku:
		'W tym polu jest kwota 0 zł bez warunku, na jakim rodzic jej nie płaci. Dopisz warunek albo usuń tę kwotę.',
	/** The five refusals of the W skrócie screen (05-UI-SPEC Contract 11). Each one quotes
	 *  its OWN field's hint example, so a refusal reads as the same instruction the editor
	 *  was already given rather than as a second, differently worded demand (WCAG 3.3.3).
	 *
	 *  `godzinyBrak` further up is a DIFFERENT message about a different control: that one is
	 *  a plan-dnia row and its example is a slot in the day („7:00–8:30"), while this one is
	 *  the żłobek's opening hours. Reusing it would have quoted the wrong example back at
	 *  somebody who had just been shown the right one. */
	godzinyOtwarciaBrak: 'Wpisz godziny, na przykład 6:30–16:30.',
	dniBrak: 'Wpisz dni, na przykład: poniedziałek-piątek.',
	skrotDniBrak: 'Wpisz skrót dni, na przykład: pon.-pt.',
	weekendBrak: 'Wpisz, co dzieje się w weekend, na przykład: soboty i niedziele: nieczynne.',
	liczbaMiejscBrak: 'Wpisz liczbę miejsc, na przykład 50.',
	/** The catch-all for a required text field left empty on a screen whose other refusals
	 *  are all specific. Short on purpose: it sits directly under the label and the hint
	 *  that already say what the field is for. */
	poleBrak: 'Uzupełnij to pole.'
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
	/** The same promise for a list that can ALSO be reordered (05-UI-SPEC Contract 9,
	 *  05 D-22). `notaGrupy` above is deliberately left exactly as it is: the wartości group
	 *  still renders it and still cannot be reordered, and rewording a shipped string that a
	 *  screen is still showing would be a lockstep nobody asked for.
	 *
	 *  The noun is „wiersza" for the same reason `notaGrupy` uses it on all three groups
	 *  including the photo one: here it is the generic word for one item of a repeated list.
	 *  05-UI-SPEC's /admin/galeria copy table spells this note with the photo noun instead,
	 *  and that is a matter for that screen: the note is a PROP and every mount supplies its
	 *  own, so the gallery-specific variant lands beside this one in plan 05-06. */
	notaGrupyZKolejnoscia:
		'Dodanie, usunięcie lub przeniesienie wiersza nie zapisuje zmian. Na końcu kliknij Zapisz.',
	/** The gallery's variant, in the PHOTO noun register that 05-UI-SPEC's /admin/galeria copy
	 *  table spells out. This is the string plan 05-04 said would land here: the note is a PROP
	 *  of the repeatable group and every mount supplies its own, so the two lists that already
	 *  existed keep the generic „wiersz" wording above and are untouched. The gallery is a list
	 *  of nothing but photographs, so the specific noun is both correct and shorter to read. */
	notaGrupyZdjecZKolejnoscia:
		'Dodanie, usunięcie lub przeniesienie zdjęcia nie zapisuje zmian. Na końcu kliknij Zapisz.',
	dodajWartosc: 'Dodaj wartość',
	dodajWiersz: 'Dodaj wiersz',
	dodajZdjecie: 'Dodaj zdjęcie',
	dodajOsobe: 'Dodaj osobę',
	usunWartosc: 'Usuń tę wartość',
	usunWiersz: 'Usuń ten wiersz',
	usunZdjecie: 'Usuń to zdjęcie',
	usunOsobe: 'Usuń tę osobę',
	/** The VISIBLE half of the two reorder buttons (05-UI-SPEC Contract 9). Only the verb,
	 *  because the numbered suffix that makes each button's accessible name unique is
	 *  visually hidden and is composed by nazwaPrzeniesieniaWGore / ...WDol below. */
	przeniesWGore: 'Przenieś wyżej',
	przeniesWDol: 'Przenieś niżej'
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

/** The Galeria card's counter, and the only one 05-UI-SPEC Contract 12 adds in this phase. */
export function liczbaZdjec(ile: number): string {
	return `Liczba zdjęć: ${ile}`;
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

/** The read-only computed line on /admin/cennik (05-UI-SPEC Contract 10).
 *
 *  IT TAKES THE WHOLE PROSE FORM („1 500 zł miesięcznie"), not a bare amount, and that is
 *  the same call plan 05-02 made for the worked example on the public page: the period word
 *  is welded to the computed figure and is declared exactly once, in src/lib/cennik.ts, as
 *  part of `kwotaProza`. Re-appending it here would be a second declaration of a word that
 *  has to agree with the public page character for character. */
export function obecnieNaStronie(kwotaProza: string): string {
	return `Obecnie na stronie: ${kwotaProza}.`;
}

/** Announcements after a repeatable row is added or removed. */
export function dodanoWiersz(numer: number): string {
	return `Dodano wiersz ${numer}.`;
}

export function usunietoWiersz(numer: number): string {
	return `Usunięto wiersz ${numer}.`;
}

/** Announcement after a repeatable row CHANGED PLACE (05-UI-SPEC Contract 9, 05 D-22).
 *
 *  It names both the number the item carried and the position it now holds, because
 *  „Przeniesiono wiersz 3" on its own does not tell a screen-reader user whether anything
 *  happened or in which direction. Same noun register as dodanoWiersz and usunietoWiersz,
 *  which the photo group already reuses.
 *
 *  05-UI-SPEC's /admin/galeria copy table spells this announcement with the photo noun.
 *  The status line is a PROP of the repeatable group and every mount supplies its own, so
 *  that gallery-specific variant is added beside this one by plan 05-06 rather than being
 *  forced onto the two lists that exist today. */
export function przeniesionoWiersz(numer: number, pozycja: number): string {
	return `Przeniesiono wiersz ${numer} na pozycję ${pozycja}.`;
}

/** The same announcement in the PHOTO noun register, for /admin/galeria. This is the variant
 *  plan 05-04 said would land here rather than being forced onto the two lists that already
 *  existed: the status line is a prop of the repeatable group and every mount supplies its
 *  own. It names both the number the photograph carried and the position it now holds, because
 *  „Przeniesiono zdjęcie 3" alone does not tell a screen-reader user whether anything happened
 *  or in which direction. */
export function przeniesionoZdjecie(numer: number, pozycja: number): string {
	return `Przeniesiono zdjęcie ${numer} na pozycję ${pozycja}.`;
}

/** Numbered legends of the repeatable groups. */
export function legendaWartosci(numer: number): string {
	return `Wartość ${numer}`;
}

export function legendaOsoby(numer: number): string {
	return `Osoba ${numer}`;
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

/** The FULL accessible name of one reorder button, composed exactly as bladWElemencie
 *  composes a summary line and for exactly the same reason: twelve buttons all called
 *  „Przenieś wyżej" are one name twelve times, which is a WCAG 2.4.4 failure by
 *  construction. The visible half of the button stays the bare verb and the numbered
 *  legend is a visually hidden suffix, so a sighted editor reads a short label while a
 *  screen-reader user hears which item the button moves.
 *
 *  The verb is read out of KOPIA_ZAPIS rather than retyped, so the label a page renders
 *  and the name a screen reader announces cannot disagree. */
export function nazwaPrzeniesieniaWGore(legenda: string): string {
	return `${KOPIA_ZAPIS.przeniesWGore}: ${legenda}`;
}

export function nazwaPrzeniesieniaWDol(legenda: string): string {
	return `${KOPIA_ZAPIS.przeniesWDol}: ${legenda}`;
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
