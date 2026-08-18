---
quick_id: 260818-kkg
slug: panel-przejmuje-liste-kadry-kafelek-z-li
date: 2026-08-18
status: planned
---

# Panel przejmuje liste kadry, kafelek z liczba opiekunek znika

## Problem

Sekcja „Nasza kadra" pokazuje liste czterech nazwisk i OBOK NIEJ kafelek
„3 opiekunki". Czytelnik musi te dwie liczby uzgodnic: cztery nazwiska, ale
trzy? Ach, dyrektor nie jest opiekunka. Kafelek nie dodaje niczego, czego lista
by nie mowila, a kosztuje moment zastanowienia.

## Dlaczego samo usuniecie kafelka to za malo

`kadra_opiekunki` i `kadra_personel` to POLA EDYTOWALNE z /admin/o-nas.
Usuniecie samego renderu zostawia redaktorowi dwie kontrolki, ktore mozna
zmienic, zapisac, odczekac dwie minuty na kompilacje i nie zobaczyc zadnej
roznicy. Kontrolka bez skutku jest gorsza niz jej brak.

## Decyzja uzytkownika: panel przejmuje liste

Zamiast usuwac dwa martwe pola, zamieniamy je na powtarzalna grupe z lista
osob. Kafelek znika, martwych kontrolek nie ma, a lista kadry przestaje byc
kodem: nowa osoba to zapis w panelu, nie pull request.

To domyka luke zapisana w SUMMARY zadania 260818-i5t jako zadanie do fazy 6/7.
Koszt spadl, bo ekran /admin/o-nas MA JUZ powtarzalna grupe (wartosci), wiec to
kopia sasiedniego wzorca, a nie nowa maszyneria.

## Ksztalt danych

`o-nas.json` traci `kadra_opiekunki` i `kadra_personel`, zyskuje `kadra`:

```json
"kadra": [
  { "imie": "Justyna Kamińska", "rola": "" },
  { "imie": "Kamila Dobosz", "rola": "Dyrektor" }
]
```

`rola` jest OPCJONALNA, ale ZAWSZE OBECNA jako klucz, nawet pusta. Walidator
buduje wynik klucz po kluczu i jednolity ksztalt wpisu jest tansze do
czytania niz dwa warianty; publiczny render i tak sprawdza prawdziwosc.

KOLEJNOSC KLUCZY w pliku jest kontraktem (walidator konstruuje w niej wynik):
`placeholder, lead, misja, wartosci, kadra_opis, kadra, obiekt_opis`.

## Zadania

1. **`pola-strony.ts`**: `PREFIKS_KADRY`, `POLE_IMIENIA`, `POLE_ROLI`, dwie
   akcje; usunac `POLE_KADRY_OPIEKUNKI` i `POLE_KADRY_PERSONEL`; ksztalt echa
   `WartosciONas` dostaje `kadra: OsobaEcha[]` zamiast dwoch stringow.
2. **`panel.ts`**: polskie etykiety grupy, przycisk dodania i usuniecia,
   legenda numerowana, komunikat odmowy. Usunac kopie dwoch licznikow.
   POPRAWIC TAKZE `kadraOpisPodpowiedz`, ktora dzis mowi redaktorowi „Bez
   nazwisk i zdjęć", podczas gdy strona wymienia cztery nazwiska.
3. **`walidacja/o-nas.ts`**: petla `zbierzIndeksowane` zamiast dwoch wywolan
   `liczbaWZakresie`; `imie` wymagane, `rola` opcjonalna.
4. **`o-nas.json`**: nowy ksztalt z czterema osobami.
5. **`admin/o-nas/+page.server.ts`**: echo z pliku, akcje dodania i usuniecia
   (kopia akcji wartosci), wlasny status i zadanie fokusu.
6. **`admin/o-nas/+page.svelte`**: druga `PowtarzalnaGrupa`, wpisy grupy w
   podsumowaniu bledow.
7. **Publiczna `/o-nas`**: lista z `onas.kadra`, `<dl class="headcount">` i jego
   style znikaja.
8. **`src/lib/content/kadra.ts` znika w calosci**: obie formy rzeczownika i
   stala `KADRA` traca konsumentow.
9. **Testy**: `admin-walidacja-strony.unit.ts`, `admin-strony.spec.ts`,
   `admin-copy.unit.ts`, `o-nas.spec.ts`.

## Znany skutek uboczny, do zapisania a nie do naprawienia tutaj

Po tej zmianie `src/lib/liczebniki.ts` nie ma ANI JEDNEGO konsumenta
produkcyjnego: odmiana rzeczownika byla potrzebna wylacznie etykietom obu
licznikow. Modul zostaje, bo jego zestaw testow koduje prawdziwe reguly
polskiej liczby mnogiej, a `kwoty.ts` powoluje sie na niego jako na wzorzec.
Decyzja o jego losie nalezy do osobnego sprzatania, nie do tego zadania.

## Czego to zadanie NIE robi

- Nie zmienia ani jednego nazwiska.
- Nie dodaje zdjec kadry ani stron pojedynczych osob: D-02 zostaje w mocy w tej
  czesci, o ktora chodzilo.
