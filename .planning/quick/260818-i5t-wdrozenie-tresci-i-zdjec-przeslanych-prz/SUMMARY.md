---
quick_id: 260818-i5t
slug: wdrozenie-tresci-i-zdjec-przeslanych-prz
date: 2026-08-18
status: complete
commits: 6
---

# Wdrozenie tresci i zdjec przeslanych przez zlobek

Pierwsza partia prawdziwego materialu od placowki jest na stronie. Trzy
znaczniki `placeholder` zdjete, numer telefonu usuniety na prosbe dyrektor,
nabor otwarty, siedem fotografii w repozytorium.

## Co jest zrobione

| Obszar          | Bylo                                    | Jest                                                    |
| --------------- | --------------------------------------- | ------------------------------------------------------- |
| Plan dnia       | 7 wierszy zastepczych                   | 14 wierszy placowki, `placeholder: false`                 |
| Telefon         | 9 powierzchni + 5 ciagow kopii          | zero, e-mail jedyna droga kontaktu                        |
| Nabor           | zamkniety, lista rezerwowa              | stale otwarty, bez etykiety roku szkolnego                |
| Kadra           | 6 opiekunek anonimowo                   | 4 nazwiska + 3 opiekunki, personel ukryty przy zerze      |
| Opisy obiektu   | brak                                    | 5 blokow w nowej sekcji „Nasze miejsce i codzienność"     |
| Zdjecia         | 3 generowane tla                        | 7 prawdziwych: hero, AboutTeaser, 5 w galerii             |
| Godziny         | `placeholder: true`                     | `placeholder: false`, potwierdzone harmonogramem          |

## Decyzje, ktore zmienily ksztalt zadania

**D-1 (z uzytkownikiem).** Nadeslany harmonogram niesie wiersz `10:30-10:15
przygotowanie do obiadu`, zakres cofniety w czasie i sprzeczny z wierszami po
obu stronach. Przyjeto odczyt wymagajacy JEDNEJ poprawki: `10:00–10:15`, a
wiersz zajec konczy sie o 10:00 zamiast o 10:30. Drugi spojny odczyt trzymalby
godzine zajec, ale nadpisywalby trzy inne godziny napisane wprost, w tym
`11:00 – 13:00 sen`. **Do potwierdzenia z placowka.**

**D-2 (z uzytkownikiem).** Telefon usuniety calkowicie, bez pola „w
przygotowaniu". Powrot numeru to edycja dwoch pol w `contact` i nic wiecej: ani
jedna z dziewieciu powierzchni nie trzymala literalu.

**D-3 (z uzytkownikiem).** Nazwiska opublikowane jako prosta lista.

**D-4, D-5 (wlasne).** Nowa tresc, ktorej panel nie zna, mieszka w modulach
`.ts`, nie w plikach JSON pod `src/lib/content/`. Powod jest mechaniczny i
kosztowny: walidatory panelu odbudowuja te pliki KLUCZ PO KLUCZU z lokalnych
zmiennych i nigdy nie rozpraszaja przeslanego obiektu. Nieznany klucz nie jest
odmawiany ani zglaszany, tylko po cichu kasowany przy pierwszym zapisie
redaktora. Dotyczy to listy kadry, pieciu opisow obiektu i zdania koncowego
planu dnia.

**D-6 (wlasne).** `src/lib/assets/foto/` na dwa zdjecia wbudowane w uklad stron,
`src/lib/assets/uploads/` zostaje katalogiem panelu. Fotografia hero trzymana w
uploads pokazywalaby sie redaktorowi w wyborze zdjec jak kafelek galerii.

**D-7 (wlasne).** Personel pomocniczy na 0 i ukryty. Placowka wymienila cztery
osoby i nie napisala o personelu pomocniczym ani slowa; kafelek „0 osob"
publikowalby brak jako fakt.

## Czego to zadanie NIE zrobilo, swiadomie

- **Lista kadry i piec opisow obiektu nie sa edytowalne z panelu.** To realna
  luka, nie przeoczenie. Domkniecie jej to prefiks i pola w `pola-strony.ts`,
  galaz w walidatorze, kontrolki na `/admin/o-nas`, polskie etykiety i
  komunikaty w `panel.ts` oraz cztery zestawy testow. Zadanie do fazy 6 lub 7.
- **Numer telefonu placowki nie zostal dodany**, bo jeszcze nie istnieje.
- **Regulaminow i dokumentow dla rodzicow nie ma**, dyrektor przesle je pozniej.
- **Zdjecia hero i AboutTeaser nie sa edytowalne z panelu** (D-6). Zmiana kazdego
  z nich to pull request. Zapisane w `src/lib/assets/foto/README.md`.

## Dwa bledy znalezione po drodze

**Okladka zasianego wpisu wskazywala na kasowany plik.** Wpis „Wielkie otwarcie
żłobka" niosl `sala-zabaw.jpg`, jedno z usuwanych zdjec zastepczych. Czytnik
aktualnosci pomija plik, ktorego kompilacja nie niesie, wiec wpis stracilby
okladke po cichu, bez bledu i bez ostrzezenia. Wskazuje teraz na szatnie.

**Klasa na `enhanced:img` nie trafia na element ukladu.** enhanced-img renderuje
`<picture>`, a klasa napisana na tym elemencie lada na `<img>` wewnatrz niego.
Elementem siatki jest picture, wiec `order` napisany przy klasie obrazu przestal
obowiazywac i uklad mobilny AboutTeaser odwrocil sie na obraz-najpierw, cofajac
regule „najpierw tresc". Naprawione opakowaniem w div; zmierzone przy 390 px:
tresc y=95, obraz y=536.

## Testy

`npm run check` 0 bledow, `npm run lint` czysty, `npm run test:unit` 593/593,
`npm run test` 422/422.

Szesc zestawow testow kodowalo dzisiejsza tresc jako kontrakt, czyli ta sama
klasa bledu, ktora to repozytorium zna. Kazdy poprawiono w strone WLASNOSCI, nie
nowego literalu:

| Test                                | Bylo                                        | Jest                                                   |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| `forms-copy.unit.ts`                | kazdy numer rowna sie temu z `site.ts`      | nie ma zadnego numeru (mocniejsze)                     |
| `kontakt.spec.ts`, `home.spec.ts`   | dokladnie 3 odnosniki `tel:`                | zero odnosnikow `tel:`, plus asercja dla calej strony  |
| `admin-walidacja-galeria.unit.ts`   | dwa pliki zalozycielskie z nazwy            | prog obecnosci plus przemiatanie wszystkich            |
| `admin-zdjecia.spec.ts`             | nazwa i alt okladki jako literaly            | czytane z ziarna wpisu                                 |
| `admin-strony.spec.ts`              | lokator podlancuchowy „Wiersz 1"            | `exact: true` (14 wierszy psulo dopasowanie)           |
| `o-nas.spec.ts`                     | dokladnie 2 kafelki liczb                   | kafelek na kazda niezerowa liczbe, plus brak img i <a> |

Uwaga o srodowisku: `playwright.config.ts` ma `reuseExistingServer: true`
lokalnie, wiec zywy proces wrangler z wczesniejszego uruchomienia potrafi
podac stara kompilacje i dac falszywe czerwone. `lsof -ti :4173 | xargs kill -9`
przed pelnym przebiegiem.

## Do potwierdzenia z placowka

1. **Godziny wokol obiadu** (D-1): czy zajecia koncza sie o 10:00, a
   przygotowanie do obiadu trwa 10:00–10:15?
2. **Personel pomocniczy**: ile osob, jesli sekcja kadry ma pokazywac te liczbe?
3. **Numer telefonu**: dac znac, gdy zlobek bedzie mial wlasna linie.
