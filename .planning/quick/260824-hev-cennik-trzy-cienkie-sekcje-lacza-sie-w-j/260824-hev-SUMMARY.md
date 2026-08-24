---
quick_id: 260824-hev
slug: cennik-trzy-cienkie-sekcje-lacza-sie-w-j
date: 2026-08-24
status: complete
commit: 7b9d36b
files_changed: 5
tasks_completed: 4
---

# Podsumowanie: trzy cienkie sekcje /cennik staja sie wierszem kart

## Diagnoza, zmierzona przy 1440 px

| Sekcja | Wysokosc | Znakow |
| --- | --- | --- |
| Wyzywienie | 216 px | 154 |
| Nieobecnosc dziecka | 176 px | 150 |
| Jak i kiedy placic | 200 px | 217 |

Cala strona: **3918 px na okolo 3500 znakow, dziewiec zmian tla.**

Przyczyna nie byla kosmetyczna. Kazda sekcja, niezaleznie od wagi, dostawala to samo:
pelnowymiarowe pasmo, 128 px paddingu i podzial redakcyjny z naglowkiem w szynie 300 px. Przy
jednym zdaniu szyna swieci pustka, a uklad zapowiada rozdzial i dowozi linijke. Na telefonie
podzial sie skleja, dlatego zlecajacy widzial problem tylko na desktopie.

## Zmiana

Trzy tematy sa kartami w jednej sekcji „Dobrze wiedziec". Zadne slowo nie zniklo, naglowki
zeszly z h2 na h3. Wiersz rozpiety na obu torach, `repeat(3, minmax(0, 1fr))` ze `stretch` od
1024 px, jedna kolumna nizej. Karty cieple na bialym pasmie, bo sekcja stoi miedzy dwoma
cieplymi i odwrocenie utrzymuje naprzemiennosc bez nowego tokenu.

**Po: 3745 px, siedem sekcji.**

## Blad, ktory popelnilem i ktory prawie przeszedl

Reguly trzykolumnowe wpisalem do istniejacego bloku `@media`, ktory stoi POWYZEJ bazowej reguly
`.karty`. Media queries nie dodaja specyficznosci, wiec o wyniku zadecydowala kolejnosc zrodla
i karty ulozyly sie w slupek przy 1440 px.

**Test struktury przeszedl przy tym na zielono.** Sprawdzal szerokosc kontenera, a kontener
jest pelnej szerokosci takze wtedy, gdy karty stoja jedna pod druga. Zlapal to dopiero pomiar
geometrii, ktory zrobilem po zmianie, a nie test.

Ten sam plik opisuje te pulapke slownie dziesiec linii dalej, przy `.lista`, i mimo to w nia
wszedlem. Reguly desktopowe maja teraz WLASNY blok pod regulami bazowymi, z komentarzem
mowiacym, ze nie wolno go przeniesc wyzej.

Dopisane dwa testy geometryczne w `tests/responsive.spec.ts`, sprawdzone mutacja: po usunieciu
`grid-template-columns` czerwienia sie z komunikatem „karty nie stoja w jednym wierszu".

## Brama

```
npm run check      -> 4403 FILES 0 ERRORS 0 WARNINGS
npm run lint       -> All matched files use Prettier code style!
npm run test:unit  -> tests 595 | pass 595 | fail 0
npm run test       -> 433 passed (1.1m)
```

## Co zostaje

Sekcja ZUS ma dalej 809 px i najwieksza pusta szyne na stronie: panel stoi w prawym torze, a
punkty i odnosnik pod nim. To teraz najslabszy fragment strony i naturalny kolejny krok, jesli
zlecajacy uzna, ze warto.
