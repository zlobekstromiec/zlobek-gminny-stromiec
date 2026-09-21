// Fakty o dostępności Publicznego Żłobka w Stromcu (quick 260921-j9c).
//
// SKĄD TO POCHODZI. Z e-maila dyrektor Kamili Dobosz z 2026-09-21. Obie listy są
// przepisane z jej wiadomości co do treści, w kolejności, w której je podała, i żaden
// punkt nie został dopisany ani domyślony: deklaracja dostępności podmiotu publicznego
// jest oświadczeniem o stanie faktycznym budynku, a nie opisem, który da się napisać
// zza biurka.
//
// CZEGO TEN MODUŁ NIE ROBI. Nie jest schematem deklaracji. Pełna, ustawowa deklaracja
// zgodna z Warunkami technicznymi publikacji v2.0 powstaje w Fazie 6 (plany 06-09 i
// 06-10) i ma tam własny sklep `src/lib/content/deklaracja.json` z własnym czytnikiem,
// pisany przez panel redakcyjny. Przedbudowanie tamtego schematu tutaj zabrałoby tamtym
// planom decyzje, których jeszcze nie podjęły. Ten moduł jest tylko tym, czym wygląda:
// faktami, które już mamy, wystawionymi na stronie, zamiast leżącymi w skrzynce do
// czasu, aż faza ruszy. Plan 06-09 ma je STĄD przeczytać, a nie zostawić placeholderów.
//
// TO JEST DRUGI NUMER TELEFONU W PROJEKCIE I TO JEST ŚWIADOME. Pierwszy, w `contact` w
// ./site.ts, jest numerem żłobka. Ten należy do INNEJ OSOBY, koordynatorki dostępności
// podmiotu publicznego, i nie wolno ich scalić ani wyprowadzić jednego z drugiego. Zasada
// jednego źródła obowiązuje więc PER WARTOŚĆ, a nie per projekt: każdy z tych dwóch
// numerów ma dokładnie jedno miejsce, w którym jest wartością, i oba te miejsca są różne.
// Z tego samego powodu tests/forms-copy.unit.ts obejmuje ten moduł bramkami kopii, ale
// NIE bramką numeru telefonu: tamta porównuje każdy numer z numerem żłobka i ten by jej
// nie przeszedł, i słusznie.
//
// Zasady kopii (UI-SPEC v1.2 paragraf 8): bez emoji, bez pauz; półpauza tylko w zakresie
// liczbowym. Zakaz dotyczy też komentarzy w tym pliku.

/** Koordynator do spraw dostępności, wyznaczony na podstawie art. 14 ustawy z dnia
 *  19 lipca 2019 r. o zapewnianiu dostępności osobom ze szczególnymi potrzebami.
 *
 *  Numer jest rozdzielony na postać widoczną i na `href`, dokładnie jak numer żłobka w
 *  ./site.ts, więc strona nie składa jednego z drugiego i nie trzyma żadnego literału. */
export const KOORDYNATOR = Object.freeze({
	imie: 'Ewelina Remion',
	telefonTekst: '664 784 676',
	telefonHref: 'tel:+48664784676'
});

/** Dostępność architektoniczna budynku przy ul. Radomskiej 72.
 *
 *  Lista niesie zarówno to, co jest, jak i to, czego NIE MA, i to nie jest przeoczenie
 *  redakcyjne. Deklaracja, która wymienia wyłącznie udogodnienia, każe osobie ze
 *  szczególnymi potrzebami przyjechać i sprawdzić resztę na miejscu. */
export const ARCHITEKTONICZNA: readonly string[] = Object.freeze([
	'Osoba poruszająca się na wózku może wjechać do budynku.',
	'Wejście główne jest wyposażone w podjazd.',
	'Drzwi wejściowe są szklane.',
	'W budynku nie ma windy.',
	'W budynku nie ma schodów.',
	'Jest toaleta dla osób z niepełnosprawnościami.',
	'Jest parking dla osób z niepełnosprawnościami.',
	'W budynku nie ma tyflomap.',
	'Pomieszczenia nie są oznaczone tabliczkami z wypukłymi cyframi ani alfabetem Braille’a.',
	'W budynku nie ma dźwiękowego systemu nawigacji dla osób niewidomych.',
	'Nie ma możliwości wstępu do budynku z psem asystującym.'
]);

/** Dostępność komunikacyjno-informacyjna. Oba punkty są brakami i oba są podane wprost. */
export const KOMUNIKACYJNO_INFORMACYJNA: readonly string[] = Object.freeze([
	'Nie ma możliwości skorzystania z tłumacza języka migowego.',
	'W budynku nie ma pętli indukcyjnych.'
]);

/** Nagłówki trzech sekcji, które stub renderuje z tego modułu. Sekcje są prowizoryczne:
 *  pełna deklaracja z Fazy 6 ma własny, ustawowy zestaw nagłówków w zamkniętej kolejności
 *  i te trzy w nim nie ocaleją w tej postaci. */
export const NAGLOWKI = Object.freeze({
	koordynator: 'Koordynator dostępności',
	architektoniczna: 'Dostępność architektoniczna',
	komunikacyjna: 'Dostępność komunikacyjno-informacyjna'
});

/** Zdanie wprowadzające linię kontaktową koordynatorki. Rozbite wokół nazwiska i numeru,
 *  bo oba pochodzą z `KOORDYNATOR`, a nie z tekstu. */
export const KOORDYNATOR_WSTEP = 'Koordynatorem do spraw dostępności w żłobku jest';

/** Etykieta przed numerem telefonu koordynatorki. */
export const KOORDYNATOR_TELEFON_ETYKIETA = 'Telefon:';
