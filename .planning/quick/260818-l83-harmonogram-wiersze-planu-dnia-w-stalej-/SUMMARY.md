---
quick_id: 260818-l83
slug: harmonogram-wiersze-planu-dnia-w-stalej-
date: 2026-08-18
status: complete
commits: 1
---

# Wiersze harmonogramu w stalej dwukolumnowej siatce

## Zmierzone przed i po

| Miara                                | Przed          | Po      |
| ------------------------------------ | -------------- | ------- |
| Wiersze z opisem POD godzina (1280px) | 9 z 14         | 0 z 14  |
| Wiersze z opisem OBOK godziny (375px) | 3 z 14         | 0 z 14  |
| Rozne odsuniecia poziome opisow       | 3              | 2       |
| Szerokosc toru opisu (1280 px)        | 484 lub 366 px | 366 px  |
| Wysokosc sekcji (1280 px)             | 1070 px        | 924 px  |
| Wysokosc panelu                       | 792 px         | 602 px  |

## Przyczyna, nie objaw

Wiersz byl kontenerem `display: flex` z `flex-wrap: wrap`. We flexboxie element
potomny jest NIEPODZIELNA jednostka zawijania: `.what` albo mieszcil sie obok
godziny w calosci, albo szedl pod nia jako caly blok. Zawijanie tekstu wokol
etykiety nie istnieje we flexie, wiec przy szynie 104 px prog wypadal w srodku
tresci placowki, gdzies w okolicach 64 znakow.

Nie byla to wiec ani wariacja, ani usterka jednej szerokosci. Ten sam mechanizm
dawal odwrocony obraz na telefonie: tam pod godzine schodzilo 11 z 14 wierszy.

## Decyzje

**Siatka zamiast flexa, bo rozdziela to, co flex laczy.** Tor jest staly, a
tekst lamie sie wewnatrz niego. Zadne inne narzedzie CSS nie daje wiszacego
wciecia bez znanej z gory liczby wierszy.

**`minmax(0, 1fr)`, nigdy samo `1fr`.** `1fr` rozwija sie do `minmax(auto, 1fr)`,
a `auto` ma podloge na szerokosci min-content. Jedno dlugie polskie slowo bez
miejsca na podzial rozepchneloby tor poza jego kolumne multicol.

**Telefon zostaje w kolumnie.** Lista ma przy 375 px tylko 264 px, wiec szyna
104 px zostawilaby na tekst 146 px, okolo 19 znakow. Rodzic widzi spojnosc w
obrebie jednego progu; spojnosc miedzy progami kupiona taka miara nie jest tego
warta.

**104 px zostaje bez zmian.** Najszersza wyrenderowana godzina, „15:00–15:30",
mierzy 98,0 px. Wartosc byla juz w pliku jako `min-width`, wiec nie pojawia sie
nowa liczba, a stary `min-width` zostal USUNIETY: dwa zrodla tej samej szerokosci
moglyby sie rozjechac.

## Odrzucone

Ulozenie wszystkich wierszy w kolumne na kazdej szerokosci. Jest spojne i
zaprototypowane na zywo, ale panel rosnie z 602 px do 792 px, a lewa kolumna
konczy sie duzo wyzej od prawej, wiec dziura pod harmonogramem, ktora quick
260818-jic wlasnie zamknal, otwiera sie ponownie. Uzytkownik wybral siatke po
obejrzeniu obu wariantow wyrenderowanych na zywo.

## Falsyfikowalnosc bramki

Obie nowe asercje zostaly uruchomione NA STARYM UKLADZIE przed przywroceniem
poprawki i obie byly czerwone:

- desktop: `[128, 668, 786]` zamiast dwoch odsuniec (lewa kolumna zawijala kazdy
  opis, prawa czesc zawijala, a czesc mieszczyla obok);
- telefon: `wszystkiePodSpodem` bylo `false`.

Sam licznik odsuniec nie wystarcza, bo przeszedlby takze na ukladzie, w ktorym
WSZYSTKIE wiersze zawijaja sie pod godzine. Stad druga asercja: kazdy opis stoi
obok swojej godziny i na tej samej linii bazowej.

Licznik wierszy sprawdza NIEPUSTOSC, nie czternastke. Harmonogram jest edytowalny
z /admin/plan-dnia, wiec przypiecie dzisiejszej liczby zamienilo by tresc w
kontrakt, co jest nawracajaca usterka tego repozytorium.

## Bramki

`npm run check` (0 bledow), `npm run lint`, `npm run test:unit` (593 testy),
`npm run test` (423 testy Playwright wraz ze skanami axe). Wszystko zielone.

Podglad na porcie 4173 zostal ubity przed ostatnim przebiegiem: serwowal build
starego ukladu, a `reuseExistingServer` przyjalby go bez slowa.

## Czego to zadanie NIE zrobilo

- Nie zmienilo ani jednego wiersza tresci harmonogramu.
- Nie ruszylo ukladu sekcji z quick 260818-jic: naglowek nad panelem, panel na
  pelna szerokosc, lista w dwoch kolumnach multicol.
- Nie zmienilo typografii ani kolorow. Kontrast 3,97:1 dla godzin zostaje.
