---
quick_id: 260819-jd1
slug: rekrutacja-naglowek-na-tej-samej-siatce-
date: 2026-08-19
status: complete
commits: 1
---

# Naglowek rekrutacji na tej samej siatce co tresc

## Zmierzone przed i po (1280 px)

| Element                      | Przed          | Po             |
| ---------------------------- | -------------- | -------------- |
| Panel statusu                | x=704, 473 px  | x=743, 433 px  |
| Blok awarii („Wolisz...")    | x=743, 433 px  | x=743, 433 px  |
| Roznica lewych krawedzi      | **39,39 px**   | 0              |
| Roznica szerokosci           | 40 px          | 0              |
| Akapit wprowadzajacy         | x=89, 567 px   | x=89, 607 px   |
| Kolumna tresci               | x=89, 607 px   | x=89, 607 px   |

## Przyczyna, nie objaw

Strona miala DWIE siatki dwukolumnowe o roznych proporcjach jedna nad druga:
`.uklad-naglowka` z `minmax(0, 1.2fr) minmax(0, 1fr)` i `.uklad` z
`minmax(0, 1.4fr) minmax(0, 1fr)`, przy tym samym kontenerze i tej samej
przerwie 48 px. Prawe krawedzie wypadaly identycznie, bo obie siatki koncza sie
na krawedzi kontenera, wiec cala roznica zbierala sie po lewej stronie panelu.
Stad wrazenie, ze gorny panel „wychodzi poza obszar": on rzeczywiscie wychodzil,
tylko poza kolumne, a nie poza strone.

## Decyzja i jej kierunek

W gore, do 1.4/1, nie w dol do 1.2/1. Proporcje 1.4/1 niesie cala siatka bloków
tej strony (kryteria, procedura, oplaty, wnioski plus szyna z formularzem), a
takze /kontakt, wiec to naglowek byl odstepstwem. Przesuniecie tresci w druga
strone rozepchneloby szyne z formularzem na calej stronie, zeby naprawic
naglowek.

Efekt uboczny, ktory jest zyskiem: lewa kolumna naglowka konczy sie teraz
dokladnie tam, gdzie kolumna tresci pod nia. Te same 39 px rozjezdzaly ja
wczesniej w druga strone, co bylo mniej widoczne niz przesuniety panel, ale bylo
tym samym defektem.

## Koszt: poprawiony zablokowany kontrakt

01-UI-SPEC.md, Aneks v1.6 paragraf 7, zapisywal `minmax(0, 1.2fr) minmax(0, 1fr)`
dla naglowka rekrutacji WPROST, w tym samym zdaniu co `1.4fr` dla tresci. Zmiana
jest z tym sprzeczna, wiec dokument dostal adnotacje w miejscu: przy wartosci
oraz notatke „Correction (2026-08-19)" na koncu akapitu, z liczbami i z powodem,
dla ktorego nie ruszono siatki tresci. Kontrakt jest poprawiony razem z kodem,
nie po cichu wyprzedzony.

Odnotowany dlug, ktorego to zadanie NIE splaca: quick 260818-jic odwrocil Aneks
v1.6 paragraf 4 (uklad planu dnia) i nie poprawil przy tym specyfikacji, wiec
tamten paragraf nadal opisuje uklad, ktorego juz nie ma.

## Falsyfikowalnosc bramki

Istniejaca asercja v1.6 paragraf 7 NIE wystarczala: sprawdza tylko, ze kolumna
formularza stoi na prawo od kolumny informacji, co bylo prawda takze przed
zmiana. Nowa asercja porownuje panel statusu z blokiem awarii, a akapit
wprowadzajacy z kolumna tresci, zawsze DWA ELEMENTY ZE SOBA i nigdy z liczba
pikseli, bo szerokosc kontenera i padding moga sie zmienic i nie o nich jest ten
kontrakt.

Uruchomiona na ukladzie sprzed zmiany, po tymczasowym cofnieciu komponentu:
czerwona, `Received: 39.390625` przy `Expected: <= 1`. Liczba zgadza sie co do
setnych z pomiarem z przegladarki.

## Bramki

`npm run check` (0 bledow), `npm run lint`, `npm run test:unit` (593 testy),
`npm run test` (424 testy Playwright wraz ze skanami axe, o jeden wiecej niz
przed zadaniem). Wszystko zielone.

Podglad na porcie 4173 ubity przed przebiegiem: serwowal build starego ukladu.

## Czego to zadanie NIE zrobilo

- Nie zmienilo proporcji siatki tresci ani niczego w szynie z formularzem.
- Nie ruszylo wygladu panelu statusu: tlo, promien, padding i kropka zostaja.
- Nie zmienilo zachowania ponizej 1024 px, gdzie obie siatki sa jednokolumnowe.
