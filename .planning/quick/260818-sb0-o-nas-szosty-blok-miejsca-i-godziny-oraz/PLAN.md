---
quick_id: 260818-sb0
slug: o-nas-szosty-blok-miejsca-i-godziny-oraz
date: 2026-08-18
status: executed
---

# Szosty blok „Nasze miejsce" i szoste zdjecie w galerii

## Problem

Obie sekcje /o-nas maja nieparzysta liczbe elementow w siatce trojkolumnowej,
wiec obie zostawiaja dziure w prawym dolnym rogu: piec blokow „Nasze miejsce
i codziennosc" (3+2) i piec zdjec w galerii (3+2). Przy 768 px, gdzie siatka ma
dwie kolumny, jest jeszcze gorzej: 2+2+1, czyli dziura na obu progach.

Szosty element domyka obie siatki na obu progach naraz. To jest argument za
DODANIEM elementu, a nie za wysrodkowaniem ostatniego rzedu.

## Ograniczenie, ktore ksztaltuje rozwiazanie

`src/lib/content/miejsce.ts` niesie zapisana regule: piec blokow to WLASNE SLOWA
placowki, przyslane 2026-08-18, „no claim was added, softened or made more
marketing-shaped". Szostego bloku nie wolno wiec napisac od siebie jako kolejnej
prozy o zlobku. Musi byc zlozony z faktow, ktore serwis juz przechowuje.

Drugie ograniczenie jest w `src/lib/godziny.ts`: „ONE FUNCTION PER SURFACE
STRING... Call sites COMPOSE rather than concatenate, so a surface added later
cannot quietly invent a sixth phrasing of the same fact". Nowy blok JEST taka
nowa powierzchnia, wiec jego zdanie powstaje w `godziny.ts`, a nie przez
sklejenie atomow w komponencie.

## Decyzje uzytkownika

1. Szosty blok to **miejsca i godziny opieki**, czytane na zywo z
   `w-skrocie.json`, zeby edycja z panelu nie zostawila bloku nieaktualnym.
2. Szoste zdjecie galerii to **`budynek-front.jpg`**, wejscie z szyldem. Drugi
   kandydat, `budynek-plac-zabaw.jpg`, dzieli caly temat z istniejacym kafelkiem
   „Plac zabaw" (ta sama niebieska nawierzchnia, te same hustawki, ta sama
   piaskownica), wiec ostatni rzad pokazywalby plac zabaw dwa razy.

## Zadania

1. **`godziny.ts`: funkcja dla nowej powierzchni.** Jedna funkcja zwracajaca
   zdanie tego bloku z atomow `dniPelne` i `godziny`, uzytych DOSLOWNIE.
   Przeredagowanie atomu („od poniedzialku do piatku" zamiast przechowywanego
   „poniedzialek-piatek") byloby dokladnie tym wymyslaniem szostego brzmienia,
   przed ktorym ostrzega naglowek modulu.
2. **`miejsce.ts`: MIEJSCE zostaje nietkniete.** Piec blokow placowki zostaje
   dokladnie tym, czym jest, razem ze swoja regula. Obok powstaje osobny,
   zlozony blok i eksport `BLOKI_MIEJSCA` = piec plus jeden. Rozdzielenie jest
   celem samym w sobie: czyje sa ktore slowa, widac z nazwy.
3. **Strona /o-nas** renderuje `BLOKI_MIEJSCA` zamiast `MIEJSCE`.
4. **Kopia zdjecia do `uploads/`.** Galeria globuje WYLACZNIE
   `$lib/assets/uploads/*`, a `galeriaZObrazami` po cichu POMIJA wpis, ktorego
   pliku nie ma w tej mapie. Wpis wskazujacy na `foto/` nie wyswietlilby sie i
   nie zglosilby bledu: szoste miejsce zostaloby puste tak samo jak dzis.
   Kopia, nie przeniesienie: `Hero.svelte` importuje oryginal z `foto/`.
5. **`galeria.json`**: szosty wpis z podpisem i wlasnym `alt`.
6. **`obiekt_opis`**: wstep galerii mowi dzis „Zajrzyj do srodka... nasze sale,
   szatnie i plac zabaw". Po dolozeniu zdjecia z zewnatrz przestaje byc
   prawdziwy, wiec zmienia sie razem ze zbiorem.
7. **Testy.** `tests/o-nas.spec.ts` liczy karty z `MIEJSCE.length`, wiec
   przechodzi na `BLOKI_MIEJSCA` i zaczyna pokrywac szosty blok sam z siebie.
   `tests/galeria.spec.ts` liczy obrazy z `galeria.zdjecia.length`, wiec ono
   ZLAPIE ciche pominiecie z zadania 4, jesli kopia pliku wypadnie.

## Czego to zadanie NIE robi

- Nie zmienia ani jednego z pieciu blokow placowki.
- Nie przenosi `budynek-front.jpg` z `foto/` i nie rusza `Hero.svelte`.
- Nie rozszerza globa galerii na `foto/`. Oba pliki README zapisuja, dlaczego te
  katalogi sa rozdzielone; zdjecie, ktore ma byc kafelkiem galerii, ma byc w
  katalogu galerii.
- Nie zmienia kolejnosci zdjec: nowe idzie na koniec, na szoste miejsce.
