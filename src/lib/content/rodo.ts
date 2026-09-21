// Wstęp pasma RODO na /dokumenty (quick 260921-j9c).
//
// SKĄD TO POCHODZI. To jest dokument „08 Zapisy kafel RODO", przekazany 2026-09-21 przez
// dyrektor Kamilę Dobosz wraz z siedmioma klauzulami informacyjnymi przygotowanymi przez
// inspektora ochrony danych. Dokument 08 przyszedł z instrukcją, żeby JEGO TREŚĆ wkleić
// wprost na stronę, a pozostałe dokumenty powiesić pod nim do pobrania. Dlatego 08 jako
// jedyny z przekazanych plików NIE jest plikiem do pobrania: jest tekstem tej sekcji.
//
// DLACZEGO TO JEST MODUŁ TREŚCI, A NIE ZNACZNIK W TRASIE. Reszta tekstu na /dokumenty
// należy do edytora i mieszka w sklepach JSON. Ten akapit należy do inspektora, więc
// mieszka w kodzie, ale musi być tak samo łatwy do znalezienia i poprawienia jak tamte:
// jedna osoba poprawiająca klauzulę nie powinna czytać `+page.svelte`, żeby znaleźć zdanie.
//
// TEN MODUŁ NIE NIESIE ŻADNEGO ADRESU E-MAIL ANI NUMERU, I TO JEST WIĄŻĄCE. Dokument 08
// podaje dwa adresy, `iod.zlobek@ugstromiec.pl` oraz `publicznyzlobek@ugstromiec.pl`, a oba
// mają w tym projekcie jedno źródło: `contact` w src/lib/content/site.ts. Gdyby padły tutaj
// jako literały, zmiana adresu przestałaby być edycją w jednym miejscu, a zamknięty zbiór
// adresów pilnowany przez tests/forms-copy.unit.ts przestałby cokolwiek udowadniać. Trasa
// wstawia je z `contact`, adres żłobka przez `AdresEmail.svelte`, który jako jedyny w
// projekcie renderuje ten adres i niesie `<wbr>` po małpie (quick 260901-duo).
//
// Zasady kopii (UI-SPEC v1.2 paragraf 8): bez emoji, bez pauz; półpauza tylko w zakresie
// liczbowym. Zakaz dotyczy też komentarzy w tym pliku.

/** Nagłówek linii kontaktowej: dwa zdania wprowadzające, każde jako osobny akapit. */
export const RODO_WSTEP: readonly string[] = Object.freeze([
	'Publiczny Żłobek w Stromcu, ul. Radomska 72, 26-804 Stromiec, jest administratorem danych osobowych w rozumieniu art. 4 ust. 7 RODO i zgodnie z art. 12 RODO przekazuje osobom, których dane dotyczą, informacje wymagane w szczególności przez art. 13 i 14 RODO.',
	'Administrator realizuje obowiązek informacyjny za pośrednictwem tej sekcji wobec:'
]);

/** Lista adresatów obowiązku informacyjnego, przepisana z dokumentu 08. */
export const RODO_ADRESACI: readonly string[] = Object.freeze([
	'każdego dziecka objętego opieką oraz jego rodzica lub opiekuna prawnego,',
	'każdej osoby fizycznej, z którą zawarł lub zawrze umowę,',
	'każdej osoby fizycznej, z którą realizuje inną formę współpracy, w tym praktykantów, stażystów i wolontariuszy,',
	'innych osób fizycznych, wobec których administrator jest zobowiązany zrealizować obowiązek informacyjny.'
]);

/** Akapity pod listą adresatów, przed dwiema liniami kontaktowymi. */
export const RODO_PO_LISCIE: readonly string[] = Object.freeze([
	'Obowiązek informacyjny wobec pracowników administratora jest realizowany za pośrednictwem odrębnych klauzul informacyjnych. Treść właściwych klauzul dostępna jest również na terenie żłobka oraz w sekretariacie.'
]);

/** Linia kontaktowa do inspektora ochrony danych. `wstep` jest FUNKCJĄ, a nie gotowym
 *  zdaniem, bo niesie imię i nazwisko inspektora, a to jest wartość z `contact` w site.ts
 *  i nie wolno jej tu przepisać: art. 11 ustawy z 10 maja 2018 r. wymaga, żeby nazwisko i
 *  adres stały razem, więc jedno źródło musi obejmować oba. */
export const RODO_IOD = Object.freeze({
	naglowek: 'Inspektor ochrony danych',
	wstep: (nazwisko: string): string =>
		`W sprawach dotyczących przetwarzania danych osobowych prosimy o kontakt z inspektorem ochrony danych, którym jest ${nazwisko}.`,
	email: 'Adres e-mail:',
	poczta: 'Adres pocztowy:'
});

/** Linia kontaktowa do administratora: realizacja praw z RODO i zgłoszenie naruszenia. */
export const RODO_ADMINISTRATOR = Object.freeze({
	naglowek: 'Administrator danych',
	wstep:
		'W celu realizacji praw wynikających z RODO, zgłoszenia naruszenia zasad ochrony danych osobowych albo wniesienia innego żądania dotyczącego przetwarzania danych prosimy o kontakt z administratorem.',
	email: 'Adres e-mail:',
	poczta: 'Adres pocztowy:'
});

/** Zdanie zapowiadające listę plików. Zamyka dokument 08 i zamyka wstęp tego pasma. */
export const RODO_POBRANIE = 'Materiały do pobrania:';
