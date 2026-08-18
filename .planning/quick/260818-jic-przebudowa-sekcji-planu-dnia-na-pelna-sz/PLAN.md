---
quick_id: 260818-jic
slug: przebudowa-sekcji-planu-dnia-na-pelna-sz
date: 2026-08-18
status: planned
---

# Przebudowa sekcji planu dnia na pelna szerokosc

## Problem, zmierzony

Prawdziwy harmonogram placowki ma czternascie wierszy zamiast siedmiu wierszy
zastepczych, przez co panel urosl do 1213 px, podczas gdy lewa kolumna niesie
234 px tresci. Zmierzone na zywo przy 1280, 1440 i 1920 px: **979 px martwej
przestrzeni po lewej, przy kazdej szerokosci desktopowej**, a cala sekcja ma
1341 px, czyli wiecej niz wysokosc okna.

To sa DWA problemy, nie jeden: dziura po lewej i sekcja dluzsza niz ekran.
Wypelnienie samej dziury zdjelo by pierwszy i zostawilo drugi.

## Decyzja uzytkownika

Uklad **pelna szerokosc, dwie kolumny**: naglowek i akapit wprowadzajacy
tworza krotki wiersz naglowkowy, a harmonogram schodzi pod niego na cala
szerokosc kontenera 72rem, w dwoch kolumnach. Dziura znika, sekcja schodzi z
1341 px do okolo 880 px.

Odrzucone swiadomie: wypelnienie lewej szyny zdjeciem (zostawia sekcje na
1341 px) oraz podzial na pory dnia (dodaje strukture, ktorej placowka nie
przyslala).

## Koszt: kontrakt v1.6 §4 zostaje zmieniony

Poprawka v1.6 §4 mowi, ze panel stoi NA PRAWO od naglowka sekcji, a
`tests/responsive.spec.ts` to przypina. Ten uklad jest z tym sprzeczny wprost,
wiec asercja nie moze zostac zluzowana, tylko zastapiona asercja nowego
kontraktu. Rozluznienie jej („panel gdzies jest") zamienilo by brame w ozdobe.

## Zadania

1. **Wiersz naglowkowy.** `.opis` staje sie przy >=1024px siatka redakcyjna:
   h2 w lewej szynie, akapit i odnosnik w prawym torze. Ten sam podzial, ktory
   /o-nas juz stosuje (`.inner.narrow`).
2. **Panel na pelna szerokosc.** Zdjac `max-width: 44rem`. Lista dostaje
   `columns: 2` przy >=1024px z `break-inside: avoid` na wierszu.
   WIELOKOLUMNOWOSC CSS, NIE SIATKA: liczba wierszy jest edytowalna z panelu,
   a `grid-auto-flow: column` wymagalby znanej z gory liczby rzedow. Multicol
   sam wywaza dowolna liczbe wierszy i zachowuje kolejnosc czytania w dol
   kolumny, czyli chronologicznie.
3. **Zdanie koncowe** zostaje rodzenstwem listy, wiec samo lada pod obiema
   kolumnami na calej szerokosci.
4. **Mobil bez zmian**: jedna kolumna, jak dzis.
5. **Test.** Asercja v1.6 §4 zastapiona asercja nowego kontraktu: panel stoi
   PONIZEJ naglowka, zajmuje pelna szerokosc kontenera, a wiersze stoja
   dokladnie w dwoch odsunieciach poziomych. Wszystkie trzy sa falszywe na
   starym ukladzie.

## Czego to zadanie NIE robi

- Nie zmienia ani jednego wiersza tresci harmonogramu.
- Nie rusza selektorow `.dayplan .panel li`, `.time`, `.what`, bo
  `tests/o-nas.spec.ts` porownuje przez nie strone glowna z /o-nas.
- Komponent renderuje sie na obu stronach, wiec /o-nas zmienia sie tak samo.
  To jest zamierzone, a nie efekt uboczny.
