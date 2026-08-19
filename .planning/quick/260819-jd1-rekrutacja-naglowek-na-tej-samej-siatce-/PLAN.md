---
quick_id: 260819-jd1
slug: rekrutacja-naglowek-na-tej-samej-siatce-
date: 2026-08-19
status: executed
---

# Naglowek rekrutacji na tej samej siatce co tresc

## Problem, zmierzony

/rekrutacja ma DWIE siatki dwukolumnowe o roznych proporcjach, jedna nad druga:

| Siatka                    | Kolumny                            | Prawa kolumna |
| ------------------------- | ---------------------------------- | ------------- |
| `.uklad-naglowka` (naglowek) | `minmax(0, 1.2fr) minmax(0, 1fr)` | 473 px        |
| `.uklad` (tresc)          | `minmax(0, 1.4fr) minmax(0, 1fr)`  | 433 px        |

Zmierzone przy 1280 px: panel statusu stoi na x=704 i ma 473 px, a blok
„Wolisz napisac wprost?" pod nim stoi na x=743 i ma 433 px. Prawe krawedzie
zgadzaja sie co do piksela, wiec **gorny panel wystaje o 39 px w lewo** poza
szyne, ktora trzyma cala reszta prawej kolumny strony. To jest dokladnie to,
co widac jako „wychodzi poza obszar".

Ta sama roznica rozjezdza lewa kolumne: h1 i akapit wprowadzajacy koncza sie
na x=656, a „Kryteria i punktacja" pod nimi na x=695.

## Decyzja

Naglowek przechodzi na `minmax(0, 1.4fr) minmax(0, 1fr)`, czyli na proporcje,
ktora niesie tresc. Wybor kierunku nie jest dowolny: proporcja 1.4/1 jest
uzywana przez SIEC bloków (kryteria, procedura, oplaty, wnioski plus szyna z
formularzem), a takze przez /kontakt, wiec to naglowek jest odstepstwem.
Zmiana w druga strone rozepchnelaby szyne z formularzem na calej stronie.

Zmierzone po zmianie: oba niebieskie panele maja 433 px i stoja na x=743,
roznica zerowa na obu krawedziach, a lewa kolumna naglowka zaczyna sie i
konczy dokladnie tam, gdzie kolumna tresci.

## Koszt: to jest zmiana ZABLOKOWANEGO kontraktu

01-UI-SPEC.md, Aneks v1.6 paragraf 7, zapisuje `minmax(0, 1.2fr) minmax(0, 1fr)`
dla naglowka rekrutacji wprost, obok `minmax(0, 1.4fr) minmax(0, 1fr)` dla
tresci. Ta zmiana jest z tym sprzeczna, wiec kontrakt musi zostac poprawiony
razem z kodem, a nie po cichu wyprzedzony. Uzywamy mechanizmu, ktory ten
dokument juz ma: adnotacja w miejscu, przy zdaniu, ktore przestaje obowiazywac.

Uwaga na precedens: quick 260818-jic odwrocil Aneks v1.6 paragraf 4 (plan dnia)
i NIE poprawil przy tym specyfikacji. To zadanie tego dlugu nie splaca, bo to
inny paragraf i inna strona, ale go odnotowuje.

## Zadania

1. **CSS**: `.uklad-naglowka` przy >=1024 px dostaje `1.4fr`. Jedna wartosc.
2. **Komentarz** przy regule mowi, ze naglowek celowo dzieli siatke z trescia,
   i podaje zmierzona roznice, ktora to usuwa.
3. **01-UI-SPEC.md**: adnotacja w miejscu przy zdaniu Aneksu v1.6 paragraf 7.
4. **Test** w `tests/responsive.spec.ts`: panel statusu i blok awarii maja te
   sama lewa krawedz i te sama szerokosc. Falszywy przed zmiana o 39 px.

## Czego to zadanie NIE robi

- Nie zmienia proporcji siatki tresci ani niczego w szynie z formularzem.
- Nie rusza wygladu samego panelu statusu: tlo, promien, padding i kropka
  zostaja.
- Nie zmienia zachowania ponizej 1024 px, gdzie obie siatki i tak sa
  jednokolumnowe.
