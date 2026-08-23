---
quick_id: 260823-pmv
slug: rekrutacja-i-strona-glowna-tez-prowadza-
date: 2026-08-23
status: planned
---

# Rekrutacja i strona glowna tez prowadza stawka z uchwaly

## Decyzja zlecajacego

Quick 260823-p4w przestawil /cennik tak, ze prowadzi stawka 2 337 zl z uchwaly, a nota obok
podaje obnizke i kwote faktycznie placona. Zlecajacy chce tego samego na pozostalych dwoch
powierzchniach oplat: w ramce na /rekrutacja i w kafelku na stronie glownej.

Granica z 260823-p4w OBOWIAZUJE dalej i jest w tym zadaniu trudniejsza do utrzymania:
**zadna powierzchnia nie powie, ze rodzic placi 2337 zl.**

## Gdzie to boli: kafelek na stronie glownej

Ramka na /rekrutacja jest latwa: to ten sam uklad co na /cennik, tylko wezszy.

Kafelek nie jest. Ma DOKLADNIE trzy sloty: etykieta, wartosc, dopisek. Jego etykieta brzmi
dzis **„Opłata miesięczna"** i to jest zdanie o tym, ile rodzic placi. Wstawienie w wartosc
2 337 zl pod ta etykieta powiedzialoby wprost nieprawde, i to na stronie glownej, czyli na
najczesciej ogladanej powierzchni serwisu.

**Etykieta musi wiec zmienic sie razem z wartoscia**, na „Stawka z uchwały", a kwota placona
schodzi do dopiska. To NIE jest kosmetyka: etykiety czterech kafelkow sa zablokowane w
01-UI-SPEC Aneks v1.6 paragraf 3 („the four `.fact-label` nodes ... are unchanged") i
utrzymane w mocy przez paragraf 4 KeyFacts v4. Zmiana wymaga adnotacji w OBU specyfikacjach.

Koszt do przyjecia swiadomie: kafelek przestaje odpowiadac na pytanie „ile zaplace" jednym
rzutem oka. Odpowiedz zostaje, ale w dopisku, mniejszym pismem. To jest konsekwencja
polecenia, nie jego obejscie.

## Zadania

### 1. Testy czerwone PRZED zmiana

`tests/rekrutacja.spec.ts`: ramka `.fee-box` niesie DWIE kwoty, kazda pod wlasna etykieta,
oraz note obnizki. Stara bramka „zaden zero w .fee-box" zostaje NIETKNIETA i ma dalej
przechodzic, bo cala nowa tresc jest bezzerowa.

`tests/home.spec.ts`: kafelek oplat ma wartosc rowna `CENNIK.stawkaTekst`, a jego dopisek
zawiera `CENNIK.placiTekst`. Retype ogona dopiska („+ wyżywienie maks. 20 zł/dzień; możliwe
0 zł ze świadczeniem ZUS ...") ZOSTAJE doslowny, bo to on jest bramka na zero z warunkiem
(dane-bip paragraf 10 punkt 1, „Test lockstep" z 05-UI-SPEC). Zmienia sie tylko to, ze kwota
placona wchodzi do dopiska ze SKLEPU, a nie jest przepisana.

### 2. Sklep prozy rekrutacji

`src/lib/content/rekrutacja.ts`: `OPLATY` dostaje `stawka: CENNIK.stawkaProza` oraz
`obnizkaTekst: CENNIK.obnizkaTekst`. Reszta kluczy bez zmian, wiec nic innego nie pada.

### 3. FeeBox

`src/lib/components/FeeBox.svelte` powtarza uklad z /cennik: podpis stawki, stawka, nota
(zdanie o obnizce, podpis platnika, kwota placona, `kwotaOpis`), potem dotychczasowe linie
ZUS, wyzywienie, nieobecnosc. Podpisy i `notaObnizki` sa importowane z `$lib/content/cennik`,
zeby obie powierzchnie mowily doslownie to samo. Cyklu to nie zamyka: modul prozy cennika nie
importuje niczego z rekrutacji.

HARD RULE komponentu zostaje: warunek ZUS dalej stoi w TYM SAMYM bloku co kwota.

### 4. Kafelek

`src/lib/w-skrocie.ts`:
- `SLOTY[2].label`: `'Opłata miesięczna'` -> `'Stawka z uchwały'`;
- `WARTOSCI[2].value`: `CENNIK.placiTekst` -> `CENNIK.stawkaTekst`;
- `OPLATA_DOPISEK` przestaje byc stala, a staje sie FUNKCJA biorąca `placiTekst`, zeby kwota
  placona przyszla ze sklepu i nie mogla sie rozjechac:
  `po obniżce {placiTekst} miesięcznie; + wyżywienie maks. 20 zł/dzień; możliwe 0 zł ze świadczeniem ZUS „Aktywnie w żłobku"`

Ogon od „+ wyżywienie" pozostaje znak w znak taki jak dzis, wiec bramka zera i jej retype w
tescie nie sa ruszane.

### 5. Adnotacje specyfikacji, ten sam commit

- `01-UI-SPEC.md`: Aneks v1.6 paragraf 3 oraz paragraf 4 (KeyFacts v4) — etykieta trzeciego
  kafelka przestaje brzmiec „Opłata miesięczna".
- `05-UI-SPEC.md`: Kontrakt 7 (tabela kafelkow) i Kontrakt 11 (FeeBox).

### 6. Pelna brama

`npm run check && npm run lint && npm run test:unit && npm run test`.

## Czego to zadanie NIE robi

- Nie zmienia ani jednego pola sklepu `cennik.json`.
- Nie mowi nigdzie, ze rodzic placi 2 337 zl.
- Nie usuwa kwoty placonej z zadnej powierzchni: wszedzie zostaje, tylko nizej.
- Nie podaje kwoty swiadczenia ZUS (HARD RULE 2).
