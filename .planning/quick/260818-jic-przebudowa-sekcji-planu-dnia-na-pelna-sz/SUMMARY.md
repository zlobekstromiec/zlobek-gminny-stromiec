---
quick_id: 260818-jic
slug: przebudowa-sekcji-planu-dnia-na-pelna-sz
date: 2026-08-18
status: complete
commits: 1
---

# Przebudowa sekcji planu dnia na pelna szerokosc

## Zmierzone przed i po

| Miara                          | Przed  | Po     |
| ------------------------------ | ------ | ------ |
| Martwa przestrzen po lewej     | 979 px | 0      |
| Wysokosc sekcji (1440 px)      | 1341 px| 1070 px|
| Szerokosc panelu               | 607 px | 1088 px|
| Kolumny harmonogramu (>=1024)  | 1      | 2      |

979 px mierzone identycznie przy 1280, 1440 i 1920 px: to nie byla wlasciwosc
jednej szerokosci, tylko kazdej desktopowej.

## Co sie zmienilo

Uklad stoi pionowo: wiersz naglowkowy (h2 w lewej szynie, akapit i odnosnik w
prawym torze) nad panelem na cala szerokosc kontenera, harmonogram w dwoch
kolumnach przy >=1024 px, jedna kolumna nizej. Zdanie koncowe jest rodzenstwem
listy, wiec samo lada pod obiema kolumnami.

## Decyzje

**Wielokolumnowosc CSS, nie siatka.** `grid-auto-flow: column` wymaga znanej z
gory liczby rzedow, a harmonogram jest edytowalny z panelu: pietnasty wiersz
dalby po cichu trzecia kolumne albo przepelnienie. Multicol wywaza dowolna
liczbe. Kolejnosc czytania (w dol kolumny, potem w bok) jest tu chronologiczna,
a kolejnosc DOM sie nie zmienia, wiec czytnik ekranu dostaje wiersze po kolei.

**Poprawka v1.6 §4 zostaje odwrocona, swiadomie.** Mowila, ze panel stoi na
prawo od naglowka. Byla sluszna dla siedmiu wierszy zastepczych i jest przyczyna
dziury przy czternastu.

## Dwie rzeczy cofniete po obejrzeniu

- **`column-rule`**: rysuje sie na calej wysokosci kolumny, a `break-inside:
  avoid` zostawia kolumny rozne o okolo wiersz (6 do 8), wiec linia wychodzila
  poza ostatni wiersz krotszej kolumny i wskazywala na poszarpany dol.
- **Akapit przy 52ch**: wypelnial polowe prawego toru, czyli przenosil puste
  miejsce z lewej strony sekcji na prawa strone akapitu. Teraz 65ch, ta sama
  miara co `.prose` na /o-nas.

## Test

Asercja v1.6 §4 **wymieniona, nie zluzowana**. Wersja „panel gdziekolwiek jest"
przechodzilaby takze na starym ukladzie. Nowy przypadek przypina cztery warunki:
panel dzieli krawedz i szerokosc z wierszem naglowkowym, stoi pod nim, wiersze
stoja w dokladnie dwoch odsunieciach poziomych, akapit stoi na prawo od h2.

**Sprawdzone przez cofniecie komponentu (`git stash`): przypadek jest czerwony na
ukladzie sprzed zmiany.** Brama, ktorej nie widziano na czerwono, nie jest brama.

## Bramki

`npm run check` 0 bledow, `npm run lint` czysty, `npm run test:unit` 593/593,
`npm run test` 422/422, w tym skany axe obu stron renderujacych ten komponent.
Brak przewijania poziomego przy 390, 768, 1024, 1280, 1440 i 1920 px.

## Pulapka pomiarowa, warta zapamietania

Pierwszy pomiar szerokosci akapitu dawal 442 px na stronie glownej i 520 px na
/o-nas dla TEGO SAMEGO komponentu. Przyczyna nie byla w CSS: selektor `.intro`
nie byl ograniczony do `.dayplan`, a `Recruitment.svelte` ma wlasny `.intro`
stojacy wyzej na stronie glownej. Mierzony byl inny akapit. Po ograniczeniu
selektora obie strony daja 520 px.
