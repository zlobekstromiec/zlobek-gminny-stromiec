---
quick_id: 260823-p4w
slug: cennik-prowadzi-stawka-2337-zl-z-uchwaly
date: 2026-08-23
status: complete
commit: 9a985d3
files_changed: 6
tasks_completed: 6
---

# Podsumowanie: stawka z uchwaly prowadzi, nota niesie kwote placona

## Dlaczego to powstalo

Dyrektorka napisala „Wysokosc czesnego to 2337 zl". Analiza (quicki 260820-m35 i 260821-gyh)
wykazala, ze 2337 zl to stawka PRZED obnizka i ze rodzic placi 1500 zl. Zlecajacy zdecydowal
mimo to podac 2337 zl jako cene, zeby nie isc wbrew slowu dyrektorki, i dopisac note o
obowiazujacej obnizce. To jest decyzja klienta i zostala wykonana w calosci.

**Co NIE zostalo zrobione i dlaczego:** strona nie mowi, ze rodzic placi 2337 zl. Rodzic tyle
nie placi, wiec takie zdanie byloby nieprawdziwe na stronie podmiotu publicznego, na jedenascie
dni przed pierwszymi rachunkami. Polecenie zostalo wykonane w tej postaci, ktora jest rowniez
prawdziwa: 2337 zl jest podane jako STAWKA Z UCHWALY, a kwota faktycznie placona stoi tuz pod
nia, tym samym stopniem pisma.

## Uklad, ktory z tego wyszedl

```
Opłaty w skrócie
Stawka z uchwały:                2 337 zł miesięcznie
Pełna miesięczna stawka za pobyt dziecka do 10 godzin dziennie, ustalona uchwałą...
  +-- biala nota wewnatrz zoltej ramki -----------------------------+
  | Obecnie obowiązuje obniżka 837 zł miesięcznie w okresie          |
  | trwałości projektu, więc kwota do zapłaty jest niższa...         |
  | Rodzic płaci teraz:            1 500 zł miesięcznie              |
  | Opłata za pobyt dziecka do 10 godzin dziennie, po obniżce...     |
  +------------------------------------------------------------------+
Skąd bierze się ta kwota  (rozbicie bez zmian: 2 337 / 837 / 1 500)
```

## Rozwiazana pulapka: `kwotaOpis`

To pole SKLEPU brzmi „Opłata za pobyt dziecka do 10 godzin dziennie, po obniżce obowiązującej
w okresie trwałości projektu." Opisuje kwote PLACONA i jest wspoldzielone z `FeeBox.svelte`
na /rekrutacja.

Naiwna zmiana naglowka na 2337 zostawilaby to zdanie pod zla liczba. Przepisanie go w sklepie
zepsuloby /rekrutacja, gdzie dalej opisuje 1500, a do tego zginelaby przy pierwszym zapisie
redaktora z panelu.

**Zdanie WEDRUJE razem z liczba, ktora opisuje**, do bloku noty, a stawka dostaje wlasny opis
autorstwa kodu. Efekt: `cennik.json` nietkniety w calosci, `/rekrutacja` i kafelek strony
glownej bez zadnej zmiany.

## Bramki

- `tests/cennik.spec.ts`: dwa nowe testy. Pierwszy pilnuje, ze obie kwoty sa w JEDNEJ ramce,
  kazda bezposrednio pod wlasna etykieta, i ze nota istnieje oraz niesie kwote obnizki. Drugi
  jest granica calej zmiany: **stawka nigdy nie stoi pod etykieta platnika**.
- `tests/cennik-reader.unit.ts`: rownosc zbioru kluczy widoku wymusila dopisanie `stawkaProza`.
  Zadzialala dokladnie tak, jak byla zaprojektowana.
- HARD RULE 1 dalej trzyma: `notaObnizki` jest FUNKCJA biorąca sformatowana kwote, wzorem
  `przykladZus`, wiec modul prozy nie zapisuje ani jednej liczby. Bramka z 260821-gyh zielona.
- Bramki kwoty zerowej nietkniete: cala nowa tresc jest bezzerowa.

## Brama

```
npm run check      -> 4403 FILES 0 ERRORS 0 WARNINGS
npm run lint       -> All matched files use Prettier code style!
npm run test:unit  -> tests 595 | pass 595 | fail 0
npm run test       -> 430 passed (1.1m)
```

## Co zostaje otwarte

- **Mail do dyrektorki dalej niewyslany** (token Gmaila wygasl). Tresc w
  `~/.claude/plans/i-think-the-overall-stateful-chipmunk.md`. Warto go wyslac mimo tej zmiany:
  potwierdza, ktora kwota jest czesnym, i prosi o daty okresu trwalosci.
- **Daty okresu trwalosci nie sa nigdzie zapisane** i nie ma czym ich wyrazic: sklep nie ma
  pola daty. Gdy obnizka wygasnie, ktos musi o tym pamietac i wtedy nota z tej zmiany bedzie
  wymagala usuniecia.
- `/rekrutacja` i kafelek strony glownej dalej prowadza kwota PLACONA (1 500 zl), poprawnie
  opisana. Jesli klient chce, zeby i one prowadzily stawka, to osobne zadanie.
