---
quick_id: 260821-gyh
slug: cennik-podpis-przy-kwocie-i-ostrzejsze-p
date: 2026-08-21
status: planned
---

# Podpis przy kwocie i ostrzejsze podpowiedzi w panelu

> Proza planu bez znakow diakrytycznych, jak w poprzednich planach quick.
> Ciagi w blokach kodu IDA NA STRONE: przepisujemy je doslownie, z polskimi znakami.

## Problem, zmierzony

Dyrektorka zlobka napisala 2026-08-20 z prosba o zmiane czesnego na 2337 zl. Zadna
kwota na stronie nie jest bledna: uchwala XXIII.134.2026 ustala 2337 zl w par. 1
ust. 1, obniza o 837 zl w par. 2 ust. 1, wiec rodzic placi 1500 zl i tyle strona
pokazuje. Zrodlo: `.planning/dane-bip-zlobek-stromiec.md:56-65`, znacznik `[BIP]`.

**Bledna byla nie liczba, tylko czytelnosc.** Jesli osoba prowadzaca zlobek myli
stawke z uchwaly z czesnym, to samo pomyli rodzic i redaktor. Przyczyna jest
konkretna i da sie wskazac palcem:

1. **Najglosniejsza liczba na `/cennik` nie ma etykiety.** `.kwota` (Baloo 700, 20 px)
   renderuje „1 500 zl miesiecznie" i nic przy niej nie mowi, ze to kwota rodzica.
   `CENNIK.naglowek` („Oplaty w skrocie") stoi nad nia jako tytul bloku, nie jako
   podpis liczby.
2. **W panelu `Stawka z uchwaly` jest PIERWSZYM i EDYTOWALNYM polem ekranu**, a jego
   podpowiedz („Pelna miesieczna stawka za pobyt... Na przyklad 2337.") nigdzie nie
   mowi, ze to nie jest kwota placona przez rodzica. Kwota rodzica pojawia sie
   trzecia, tylko do odczytu. Redaktor czytajacy „stawka" jako „czesne" moze zapisac
   zla liczbe prosto na zywa strone.

## Decyzja

Zadna kwota sie nie zmienia. Zmieniaja sie WYLACZNIE etykiety i podpowiedzi.

**A. `/cennik`.** `naglowek` i `kwotaOpis` sa polami sklepu, ktore pisze panel, wiec
kod ich nie przepisuje. Zamiast tego dochodzi PODPIS autorstwa kodu, jako etykieta,
nigdy zdanie, zeby nie moglo sie poklocic z naglowkiem, ktory redaktor kiedys zapisze:

- nowy eksport `KWOTA_PODPIS` w `src/lib/content/cennik.ts`;
- render jako `<p class="kwota-podpis">` zaraz po `<p class="kwota">`;
- `ROZBICIE.stawka` z `Stawka z uchwaly` na `Pelna stawka z uchwaly`, zeby pierwszy
  wiersz rozbicia czytal sie jako kwota PRZED obnizka. Dwie pozostale etykiety bez zmian.

`KWOTA_PODPIS` nie niesie slowa okresu: „miesiecznie" jest zespawane z liczba w
`kwotaProza` i zadeklarowane w jednym miejscu (05 D-28). Drugie wystapienie musialoby
sie z nim zgadzac co do znaku.

**B. Panel `/admin/cennik`.** Dwie podpowiedzi w `src/lib/content/panel.ts`.
`obnizkaPodpowiedz` zostaje bez zmian, bo juz sie tlumaczy.

## Zadania

### 1. Test czerwony PRZED zmiana

`tests/cennik.spec.ts`: podpis stoi w tym samym bloku co kwota i jest widoczny.
Dzis `.kwota-podpis` nie istnieje, wiec asercja jest czerwona.

Bramki kwoty zerowej zostaja NIETKNIETE i maja dalej przechodzic: podpis nie niesie
kwoty, wiec nie moze ich ruszyc.

### 2. Copy i render

`src/lib/content/cennik.ts`:

```
KWOTA_PODPIS = 'Tyle płaci rodzic'
ROZBICIE.stawka = 'Pełna stawka z uchwały'
```

`src/lib/content/panel.ts`:

```
POLA_CENNIK.stawkaPodpowiedz = 'Pełna miesięczna stawka za pobyt, przed obniżką, w pełnych złotych, bez groszy. To nie jest kwota, którą płaci rodzic. Na przykład 2337.'
KOPIA_CENNIK.obliczonaPodpowiedz = 'Tyle płaci rodzic: stawka z uchwały pomniejszona o obniżkę. Zmieni się po zapisaniu.'
```

`src/routes/cennik/+page.svelte`: `<p class="kwota-podpis">` po `.kwota`, typografia
jak `.linia`, kolor `--color-muted`, `margin: 4px 0 0`.

Testy panelu deferencjonuja te stale symbolicznie (`KOPIA_CENNIK.obliczonaPodpowiedz`),
a nie jako literaly, wiec przeredagowanie ich nie czerwieni `tests/admin-cennik.spec.ts`.

### 3. Adnotacja specyfikacji, ten sam commit

`.planning/phases/05-gallery-fees/05-UI-SPEC.md` wypisuje etykiety rozbicia (wiersze
169, 494, 1111) oraz podpowiedz panelu doslownie (wiersz 807, Kontrakt 10). Adnotacja
w miejscu przy kazdym z tych zapisow. Precedens: quick 260819-jd1.

### 4. Pelna brama

`npm run check && npm run lint && npm run test:unit && npm run test`. Przed uwierzeniem
w czerwony Playwright ubij RODZICA `wrangler-dist/cli.js`, nie tylko port 4173.

## Czego to zadanie NIE robi

- Nie zmienia `stawka`, `obnizka` ani zadnej kwoty. Zgadzaja sie z uchwala.
- Nie zdejmuje `placeholder: true` (regula nieobecnosci dalej bez zrodla).
- Nie przepisuje z kodu pol sklepu `naglowek` i `kwotaOpis`.
- Nie podaje kwoty swiadczenia ZUS (HARD RULE 2 nadal obowiazuje).
