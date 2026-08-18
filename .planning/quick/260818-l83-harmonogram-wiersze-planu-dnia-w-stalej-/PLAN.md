---
quick_id: 260818-l83
slug: harmonogram-wiersze-planu-dnia-w-stalej-
date: 2026-08-18
status: executed
---

# Wiersze harmonogramu w stalej dwukolumnowej siatce

## Problem, zmierzony

Wiersz harmonogramu jest dzis kontenerem `display: flex` z `flex-wrap: wrap`
(`DayPlan.svelte:212`). We flexboxie element potomny jest NIEPODZIELNA jednostka
zawijania: `.what` albo miesci sie w calosci obok godziny, albo przenosi sie
pod nia jako caly blok. Nie istnieje we flexie zawijanie tekstu wokol etykiety.

Poniewaz `.time` rezerwuje 104 px, prog zawiniecia wypada dokladnie w srodku
tresci placowki. Zmierzone na zywo:

- **1280 px: 9 z 14 wierszy spada pod godzine, 5 stoi obok niej.**
- **390 px: ta sama usterka odwrocona, 3 wiersze obok, 11 pod spodem.**

Stad wrazenie przypadkowosci: to nie jest wariacja, tylko twarde odciecie w
okolicach 64 znakow. Opisy zaczynaja sie w dwoch roznych miejscach w poziomie,
wiec oko nie ma jednej krawedzi, po ktorej moze zjechac w dol listy.

## Decyzja uzytkownika

**Stala dwukolumnowa siatka wiersza od 768 px w gore**: godzina w szynie
104 px, opis zawsze obok niej i zawijany WEWNATRZ swojego toru. Kazdy opis
zaczyna sie na tym samym odsunieciu.

**Ponizej 768 px wszystkie wiersze stoja jako kolumna**: godzina nad opisem,
opis na pelna szerokosc. Przy 279 px dostepnej szerokosci szyna 104 px
zostawilaby na tekst 161 px, czyli okolo 21 znakow. Spojnosc w obrebie jednego
progu jest tym, co widzi rodzic; spojnosc miedzy progami kupiona kosztem
czytelnosci nie jest tego warta.

Odrzucone swiadomie: ulozenie WSZYSTKICH wierszy w kolumne na kazdej
szerokosci. Jest spojne, ale panel rosnie z 602 px do 792 px, a lewa kolumna
konczy sie duzo wyzej niz prawa, wiec dziura pod harmonogramem, ktora quick
260818-jic wlasnie zamknal, otwiera sie ponownie.

## Miara, ktora ta zmiana poprawia

Sekcja SKRACA sie, nie wydluza: 1070 px do 924 px, panel 792 px do 602 px.
Wbrew intuicji, bo dzisiejsze zawiniete wiersze marnuja cala linie na sama
godzine, a odzyskanie jej daje wiecej niz kosztuje wezszy tor tekstu.

Tor opisu: 366 px zamiast 484 px, czyli okolo 48 znakow zamiast 64. Miesci sie
w wygodnym zakresie 45 do 75 znakow, ktorego trzyma sie reszta serwisu.

## Zadania

1. **Wiersz jako siatka.** `.panel li` przy >=768 px dostaje
   `grid-template-columns: 104px minmax(0, 1fr)`. `minmax(0, 1fr)`, NIE `1fr`:
   samo `1fr` to `minmax(auto, 1fr)`, a `auto` ma podloge na szerokosci
   min-content, wiec jedno dlugie polskie slowo bez miejsca na podzial
   rozepchneloby tor poza kolumne.
2. **Ponizej 768 px kolumna.** `.time` staje sie blokiem, `min-width` znika
   (w siatce szerokosc toru niesie kolumna, nie element).
3. **104 px zostaje.** Zmierzona najszersza godzina to `15:00-15:30` przy
   98,0 px, wiec stala szyna miesci kazda wartosc z zapasem 6 px. Wartosc jest
   juz w pliku, wiec nie wprowadzamy nowej liczby.
4. **Test.** Nowa asercja w `tests/responsive.spec.ts`: liczba roznych odsuniec
   poziomych `.what` ROWNA sie liczbie kolumn, czyli dwa. Na dzisiejszym
   ukladzie sa cztery (dwie kolumny razy dwie pozycje), wiec asercja jest
   falszywa przed zmiana i prawdziwa po niej.

## Czego to zadanie NIE robi

- Nie zmienia ani jednego wiersza tresci harmonogramu.
- Nie rusza ukladu sekcji ustalonego przez quick 260818-jic: naglowek nad
  panelem, panel na pelna szerokosc, lista w dwoch kolumnach multicol.
- Nie zmienia typografii ani kolorow. Kontrast 3,97:1 dla godzin zostaje.
