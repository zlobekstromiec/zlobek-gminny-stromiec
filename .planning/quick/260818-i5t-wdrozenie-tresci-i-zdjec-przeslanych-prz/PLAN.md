---
quick_id: 260818-i5t
slug: wdrozenie-tresci-i-zdjec-przeslanych-prz
date: 2026-08-18
status: planned
---

# Wdrozenie tresci i zdjec przeslanych przez zlobek

Kamila Dobosz (dyrektor) przeslala pierwsza partie prawdziwej tresci i siedem
fotografii. To pierwszy raz, kiedy repozytorium dostaje material od placowki,
a nie tekst zastepczy. Zadanie wprowadza go w calosci i zdejmuje przy okazji
trzy znaczniki `placeholder`.

## Zrodlo

Wiadomosc e-mail od dyrektor zlobka, 2026-08-18, przeklejona w calosci do
`260818-i5t-ZRODLO.md` obok tego pliku. Fotografie: `~/Documents/10001129*.jpg`
i `~/Documents/10001130*.jpg` (siedem plikow, 2026-08-18).

## Decyzje podjete z uzytkownikiem przed planowaniem

- **D-1 Plan dnia.** Nadesłany harmonogram zawiera wiersz `10:30-10:15
  przygotowanie do obiadu`, czyli zakres cofniety w czasie, sprzeczny z
  wierszem przed nim i po nim. Przyjmujemy odczyt wymagajacy JEDNEJ poprawki:
  `10:00–10:15`, a wiersz zajec skraca sie z `9:15-10:30` do `9:15–10:00`.
  Kazda pozostala godzina zostaje dokladnie taka, jaka przyszla. Do
  potwierdzenia z placowka po wdrozeniu.
- **D-2 Telefon.** Numer znika calkowicie, bez pola zastepczego. E-mail zostaje
  jedyna droga kontaktu. Drugi przycisk w hero zmienia sie na „Napisz do nas".
- **D-3 Kadra.** Publikujemy cztery nazwiska jako prosta lista, bez zdjec i bez
  biogramow, i poprawiamy licznik opiekunek z 6 na 3.

## Decyzje wlasne (nie wymagaly pytania)

- **D-4 Gdzie mieszka nowa tresc.** Piec opisow obiektu (sale, plac zabaw,
  toalety, posilki, adaptacja) trafia do NOWEGO modulu `src/lib/content/miejsce.ts`,
  a nie do `o-nas.json`. Powod: panel odbudowuje `o-nas.json` klucz po kluczu
  (`walidujStroneONas`), wiec nieznany klucz zostalby skasowany przy pierwszym
  zapisie redaktora. Ta sama zasada dotyczy zdania koncowego planu dnia, ktore
  ladnie w komponencie obok istniejacego akapitu wprowadzajacego.
- **D-5 Lista kadry rowniez kodem** (`src/lib/content/kadra.ts`). Dodanie
  powtarzalnej grupy do ekranu `/admin/o-nas` to walidator, slownik pol, UI,
  polskie komunikaty i cztery zestawy testow. Poza zakresem szybkiego zadania.
  Luka jest swiadoma i zapisana w SUMMARY jako zadanie do fazy 6/7.
- **D-6 Rozdzial zdjec.** `src/lib/assets/foto/` dla dwoch fotografii
  wbudowanych w uklad stron (hero, AboutTeaser). `src/lib/assets/uploads/`
  zostaje katalogiem panelu i dostaje piec zdjec galerii. Granica jest juz
  ustalona w naglowku `src/lib/server/admin/uploads.ts`.
- **D-7 Personel pomocniczy.** Placowka podala cztery osoby i ani slowa o
  personelu pomocniczym. Licznik idzie na 0 i przestaje sie renderowac, zamiast
  publikowac zmyslona liczbe.

## Zadania

1. **Fotografie do repozytorium.** Siedem plikow przeskalowanych do 1600 px
   dluzszego boku, jakosc 0.82, czyli dokladnie te wartosci, ktorych uzywa
   `src/lib/zdjecia.ts` dla zdjec wgrywanych panelem. Trzy zastepcze pliki z
   `uploads/` znikaja.
2. **Plan dnia.** `day-plan.json` z prawdziwym harmonogramem, `placeholder: false`.
   Kazdy opis miesci sie w `MAKS_OPISU = 200`. Zdanie o indywidualnym rytmie dnia
   renderuje `DayPlan.svelte`.
3. **Usuniecie telefonu.** `contact.phoneDisplay` i `contact.phoneHref` znikaja z
   `site.ts`; dziewiec miejsc renderujacych i piec ciagow w `forms.ts` przechodzi
   na e-mail. `KOPIA_FALLBACK.naglowek` przestaje pytac „Wolisz zadzwonic?".
4. **Nabor otwarty.** `nabor.json` na `true`, `openStrings` opisuja nabor ciagly.
5. **Kadra.** Lista nazwisk, `kadra_opiekunki: 3`, `kadra_personel: 0` ukryty.
6. **Sekcja „Nasze miejsce".** Piec kart na `/o-nas` z modulu `miejsce.ts`.
7. **Galeria.** Piec prawdziwych zdjec z polskimi podpisami i alt,
   `placeholder: false`.
8. **Godziny potwierdzone.** `w-skrocie.json.godziny.placeholder` na `false`:
   harmonogram placowki zaczyna sie 6:30 i konczy 16:30.
9. **Testy.** `npm run check && npm run lint && npm run test:unit && npm run test`.
   Spodziewane naprawy: licznik odnosnikow `tel:` w `home.spec.ts`, asercje
   telefonu w `kontakt.spec.ts` i `forms-copy.unit.ts`, wiersze planu dnia w
   `o-nas.spec.ts`.

## Czego to zadanie NIE robi

- Nie dodaje numeru telefonu placowki: jeszcze nie istnieje.
- Nie dodaje regulaminow ani dokumentow dla rodzicow: dyrektor przesle je
  pozniej.
- Nie udostepnia listy kadry w panelu redakcyjnym (D-5).
