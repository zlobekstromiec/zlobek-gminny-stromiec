---
quick_id: 260824-hzm
slug: sekcja-zus-na-cenniku-dostaje-jedna-kraw
date: 2026-08-24
status: complete
commit: 65b9151
files_changed: 3
tasks_completed: 4
---

# Podsumowanie: sekcja ZUS ma jedna krawedz lewa

## Zmierzone przed zmiana (1440 px, zywa strona)

| element | x | szerokosc |
| --- | --- | --- |
| naglowek (szyna) | 176 | 300 |
| bialy panel `.blok-zus` | **524** | 736 |
| punkty `.szeroko ul` | **176** | 520 |
| odnosnik | 176 | 520 |

Dwie krawedzie lewe w jednej sekcji, 348 px roznicy. Panel w prawym torze, punkty w
kontenerze rozpietym na oba tory. Dodatkowo punkty z limitem 65ch wewnatrz kontenera o
1088 px, wiec 568 px pustki po prawej.

## To byl moj dlug, nie zastane niedopatrzenie

Rozpiecie listy na oba tory wprowadzil quick `260820-m35`, zeby zapelnic pusta szyne bez
ruszania przypietej kolejnosci DOM w `#zus-blok`. Zapelnilo szyne i poszarpalo krawedz.
Warto to zapisac wprost: poprawka jednej wady ukladu wprowadzila druga, gorsza, i zauwazyl
to zlecajacy, a nie zaden test.

## Zmiana

Punkty i odnosnik wracaja do `.tresc`, pod panel. Jedna krawedz (x=524), jedna miara, ten sam
idiom co kazda inna sekcja tej strony oraz /o-nas, /dokumenty i /kontakt.

Odrzucony wariant „wszystko do jednego bialego pudelka": ramka wysoka na okolo 630 px,
nadajaca te sama wage zdaniu kluczowemu i szczegolom proceduralnym.

Pusta szyna pod naglowkiem zostaje i jest tu w porzadku. Wczesniejsza skarga dotyczyla sekcji
JEDNOZDANIOWYCH, gdzie szyna gorowala nad trescia; tutaj tresc ma okolo 660 px.

## Zmierzone po

- sekcja: **809 px -> 785 px**
- udzial pionowej pustki na calej stronie: **46% -> 34%**
- panel, punkty i odnosnik: `x=524` wszystkie trzy

## Bezpieczenstwo kontraktow

`#zus-blok` nietkniety: ten sam wezel, te same trzy akapity w tej samej kolejnosci. Kontrakt 4b
i obie bramki kwoty zerowej bez zmian i dalej zielone.

`.lista-szeroka` przemianowana na `.lista-jedna-kolumna`: przestala byc szeroka, a utrzymanie
JEDNEJ kolumny bylo jedyna rzecza, ktora robila. Regula odstepu `.szeroko .proza:first-of-type`
przecelowana na `.lista-jedna-kolumna + .proza`, bo obslugiwala wylacznie ten blok.

## Brama

```
npm run check      -> 4403 FILES 0 ERRORS 0 WARNINGS
npm run lint       -> All matched files use Prettier code style!
npm run test:unit  -> tests 595 | pass 595 | fail 0
npm run test       -> 434 passed (56.7s)
```

Nowy test w `tests/responsive.spec.ts` porownuje ELEMENTY ZE SOBA, nie z liczba pikseli,
zgodnie z konwencja tego pliku. Przed zmiana czerwony dokladnie o zmierzone 348 px.
