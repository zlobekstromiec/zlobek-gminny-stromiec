---
quick_id: 260818-kkg
slug: panel-przejmuje-liste-kadry-kafelek-z-li
date: 2026-08-18
status: complete
commits: 1
---

# Panel przejmuje liste kadry, kafelek z liczba opiekunek znika

## Co bylo nie tak

Sekcja „Nasza kadra" mowila rozmiar zespolu dwa razy i za kazdym razem inaczej:
lista czterech nazwisk i obok niej kafelek „3 opiekunki". Czytelnik musial to
uzgodnic sam.

## Dlaczego zakres jest wiekszy niz „usun kafelek"

`kadra_opiekunki` i `kadra_personel` byly polami edytowalnymi z /admin/o-nas.
Usuniecie samego renderu zostawiloby dwie kontrolki, ktore redaktor moze
zmienic, zapisac, odczekac dwie minuty i nie zobaczyc zadnej roznicy.

## Co jest teraz

| | Przed | Po |
| --- | --- | --- |
| Kafelek z liczba | 1 (sprzeczny z lista) | brak |
| Zrodlo listy | `src/lib/content/kadra.ts` (kod) | `o-nas.json` (panel) |
| Pola w panelu | 2 liczniki bez skutku | grupa powtarzalna: imie + rola |
| Nowa osoba w zespole | pull request | zapis w panelu |

Rola jest opcjonalna: wpisuje sie ja tylko tam, gdzie jest inna niz u
pozostalych. Trzy opiekunki maja ja pusta, dyrektor ma `Dyrektor`.

## Decyzje warte zapamietania

**`rola` jest opcjonalna jako TRESC, nigdy jako KLUCZ.** Pusty napis zamiast
braku klucza, zeby plik mial jeden ksztalt wpisu i zeby publiczna strona
decydowala o wartosci, a nie o istnieniu klucza.

**Czytana przez `tekstOpcjonalny`, nie `tekstWymagany`.** Trzy stany musza
zostac rozroznialne: nic nie wpisano (dobrze), wpisano za duzo (odmowa) i
wpisano wartosc. Zlanie dwoch pierwszych sprawiloby, ze za dluga rola znika po
cichu przy zapisie.

**Dwie grupy, dwa komplety akcji, dwie linie statusu.** Jeden endpoint
sparametryzowany prefiksem braleby liste do zmiany z zadania, wiec recznie
zbudowany post moglby dodac wiersz do listy, ktorej nie nazwal.

## Przy okazji naprawione

`kadraOpisPodpowiedz` mowila redaktorowi „Bez nazwisk i zdjęć", podczas gdy
strona wymienia cztery nazwiska od rana tego samego dnia. Podpowiedz klamala i
zostala poprawiona; zakaz zdjec zostaje w mocy.

`docs/instrukcja-cms.md`, czyli instrukcja, ktora czyta personel zlobka,
opisuje teraz nowa liste. Test tego pliku wymaga doslownego cytatu z kazdej
etykiety pola, wiec ta zmiana byla wymuszona, a nie dobrowolna.

## Testy: wymienione, nie zluzowane

Trzy przypadki pilnowaly wlasnosci, ktore przestaly istniec (licznik jest
liczba, odmawia 150, odmawia „sześć"). Kazdy zastapiono asercja nowej reguly.
Doszla asercja NIEOBECNOSCI kafelka na publicznej stronie: licznik przywrocony
obok listy bylby ta sama sprzecznoscia wracajaca.

Bramki: `npm run check` 0 bledow, `npm run lint` czysty, `npm run test:unit`
593/593, `npm run test` 422/422.

## Pulapka w fixture, znaleziona po drodze

`polaListy(PREFIKS, [...])` produkuje `osoba[0]`, `osoba[1]` i tak dalej.
Rozlozenie KROTSZEJ listy nad `polaONasZPliku()` nadpisuje tylko te indeksy,
do ktorych siega: pozostale wiersze bazowego fixture zostaja pod spodem i
walidator widzi mieszanke obu. Pierwsza wersja nowego testu przeszla przez to
z czterema osobami tam, gdzie spodziewano sie dwoch. Zastapienie budowane jest
teraz z zawartosci store'u, wiec pokrywa kazdy indeks niezaleznie od dlugosci.

## Znalezione, NIE naprawione, do osobnego sprzatania

**Podwojna gwiazdka przy kazdym polu wymaganym w calym panelu.** `FormField`
dokleja wlasne ` *`, gdy dostanie `wymagane`, a stale etykiet juz koncza sie
gwiazdka, wiec kazde pole wymagane na kazdym ekranie renderuje sie jako
`Etykieta **`. Sprawdzone na `Wprowadzenie`, ktore wychodzi jako
„Wprowadzenie **(pole wymagane)". To jest defekt sprzed tego zadania, nie jego
skutek; nowa etykieta trzyma sie tej samej konwencji, zeby nie byc jedynym
polem wygladajacym inaczej. Naprawa to jedno przejscie przez okolo dwadziescia
stalych albo jedna zmiana w `FormField`, plus `bezGwiazdki` w tescie instrukcji.

**`src/lib/liczebniki.ts` nie ma juz ani jednego konsumenta produkcyjnego.**
Odmiana rzeczownika byla potrzebna wylacznie etykietom obu licznikow. Modul
zostaje razem ze swoim zestawem testow, ktory koduje prawdziwe reguly polskiej
liczby mnogiej.
