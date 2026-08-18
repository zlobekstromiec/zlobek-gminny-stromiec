---
quick_id: 260818-sb0
slug: o-nas-szosty-blok-miejsca-i-godziny-oraz
date: 2026-08-18
status: complete
commits: 1
---

# Szosty blok „Nasze miejsce" i szoste zdjecie w galerii

## Zmierzone przed i po

| Miara                             | Przed | Po |
| --------------------------------- | ----- | -- |
| Bloki „Nasze miejsce"             | 5     | 6  |
| Zdjecia w galerii                 | 5     | 6  |
| Uklad przy >=1024 px (3 kolumny)  | 3+2   | 3+3 |
| Uklad przy 768 px (2 kolumny)     | 2+2+1 | 2+2+2 |

Dziura byla na OBU progach, nie tylko na desktopie. Szosty element domyka oba
naraz, czego wysrodkowanie ostatniego rzedu by nie zrobilo.

## Ograniczenia, ktore ksztaltowaly rozwiazanie

Zadne z nich nie jest widoczne w typach ani w nazwach; wszystkie sa zapisane
proza w naglowkach modulow i zostalyby pominiete przez samo grepowanie.

**`miejsce.ts`: piec blokow to wlasne slowa placowki**, bez dodanych twierdzen.
Szostego bloku nie wolno bylo napisac jako kolejnej prozy o zlobku, wiec sklada
on fakty juz przechowywane: liczbe miejsc i godziny z `w-skrocie.json`. `MIEJSCE`
zostaje piecioelementowe, obok stoi `BLOKI_MIEJSCA` = piec plus jeden. Rozdzial
jest celem: dopisanie szostego wpisu do tamtej tablicy zatarloby, czyje sa ktore
slowa, i regula stalaby sie po cichu falszywa.

**`godziny.ts`: jedna funkcja na jedna powierzchnie.** Naglowek modulu ostrzega,
ze sklejanie atomow w miejscu uzycia jest tym, jak powstaje kolejne brzmienie
tego samego faktu. Nowy blok jest PIERWSZA powierzchnia dodana po zapisaniu tej
reguly, wiec jego zdanie powstaje w `godzinyBlokuOpieki`. Oba atomy wchodza
doslownie; atom weekendowy jest swiadomie pominiety, bo jest fragmentem pod
etykiete stopki i nie wchodzi w zdanie bez przeredagowania.

**`galeriaZObrazami` POMIJA po cichu wpis spoza globa `uploads/`.** To celowa
wlasnosc („the lightbox can never open onto nothing"), wiec zawodzi bezglosnie.
Wpis wskazujacy na `foto/` zostawilby szosty kafelek pusty dokladnie tak jak
dzis i nie zglosilby bledu. Dlatego plik jest KOPIOWANY do `uploads/`, a nie
tylko wpisywany do JSON-a.

## Decyzje

**Kopia, nie przeniesienie.** `Hero.svelte` importuje oryginal z `foto/` po
sciezce, wiec oryginal zostaje. Jedno zdjecie jest przez to przetwarzane dwa
razy w buildzie; to przyjeta cena za to, ze kazdy katalog ma jednego wlasciciela.
Odrzucono rozszerzenie globa galerii na `foto/`: oba pliki README zapisuja,
dlaczego te katalogi sa rozdzielone.

**`budynek-front.jpg`, nie `budynek-plac-zabaw.jpg`.** Drugi kandydat dzieli
caly temat z istniejacym kafelkiem „Plac zabaw" (ta sama niebieska nawierzchnia,
te same hustawki, ta sama piaskownica), wiec ostatni rzad pokazywalby plac zabaw
dwa razy. Wejscie z szyldem dokłada jedyny temat, ktorego galeria nie miala.

**Wstep galerii zmieniony razem ze zbiorem.** „Zajrzyj do srodka... nasze sale,
szatnie i plac zabaw" przestalo byc prawdziwe, gdy do zbioru weszlo zdjecie z
zewnatrz.

## Falszywy trop, sprawdzony i odrzucony

Na serwerze deweloperskim nowy kafelek dostawal deskryptory `1x/2x` zamiast `w`
i trzy ostrzezenia o niezgodnosci hydracji, mimo ze `szatnia.jpg` o DOKLADNIE
tych samych wymiarach 1600x900 dostawala `800w`. Hipoteza brzmiala: bajtowo
identyczna kopia zderza sie w cache'u imagetools.

Hipoteza jest NIEPRAWDZIWA. Przekodowanie kopii tak, zeby bajty sie roznily, nie
zmienilo niczego (a i sam test byl obarczony bledem, bo serwer nie zostal
zrestartowany). Rozstrzygajace bylo zajrzenie do BUILDU: w prerenderowanym
`o-nas.html` `budynek-front` ma `800w, 1600w`, identycznie jak `szatnia`. Byl to
artefakt przeladowania serwera deweloperskiego po dodaniu pliku, nieobecny w
tym, co sie publikuje. Kopia zostala przywrocona do postaci bajtowo identycznej.

Wniosek na przyszlosc: o srcset i o hydracje pyta sie build, nie `npm run dev`.

## Bramki

`npm run check` (0 bledow), `npm run lint`, `npm run test:unit` (593 testy),
`npm run test` (423 testy Playwright wraz ze skanami axe). Wszystko zielone.

Testy licza z zrodel, wiec oba nowe elementy sa pokryte bez dopisywania asercji:
`tests/o-nas.spec.ts` przeszedl na `BLOKI_MIEJSCA` (i pinuje TEKST zlozonego
bloku, wiec zmiana w `w-skrocie.json` przesuwa oczekiwanie razem ze strona), a
`tests/galeria.spec.ts` porownuje liczbe wyrenderowanych obrazow z dlugoscia
listy w JSON-ie, czyli jest dokladnie tym, co zlapaloby ciche pominiecie pliku.

## Czego to zadanie NIE zrobilo

- Nie zmienilo ani jednego z pieciu blokow placowki.
- Nie ruszylo `Hero.svelte` ani oryginalu w `foto/`.
- Nie rozszerzylo globa galerii na `foto/`.
- Nie zmienilo kolejnosci zdjec: nowe stoi na koncu.
