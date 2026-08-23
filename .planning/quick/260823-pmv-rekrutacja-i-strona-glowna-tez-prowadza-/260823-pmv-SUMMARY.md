---
quick_id: 260823-pmv
slug: rekrutacja-i-strona-glowna-tez-prowadza-
date: 2026-08-23
status: complete
commit: 0b1a300
files_changed: 9
tasks_completed: 6
---

# Podsumowanie: stawka prowadzi takze na /rekrutacja i stronie glownej

## Wynik

| Powierzchnia | Prowadzi | Kwota placona |
| --- | --- | --- |
| /cennik (260823-p4w) | 2 337 zl, „Stawka z uchwaly:" | panel z „Rodzic placi teraz:" |
| /rekrutacja | 2 337 zl, „Stawka z uchwaly:" | jedno zdanie: „Po obnizce 837 zl rodzic placi teraz 1 500 zl miesiecznie." |
| strona glowna | 2 337 zl, kafelek „Stawka z uchwaly" | dopisek: „po obnizce 1 500 zl miesiecznie; ..." |

Granica z 260823-p4w utrzymana: **zadna powierzchnia nie mowi, ze rodzic placi 2337 zl.**

## Etykieta kafelka musiala pojsc za wartoscia

„Opłata miesięczna" nad kwota 2 337 zl twierdziloby na najczesciej ogladanej stronie serwisu,
ze tyle placi rodzic. Kafelek nazywa sie wiec „Stawka z uchwały", a kwota placona jest w
dopisku i pilnuje jej asercja w `tests/admin-walidacja-w-skrocie.unit.ts`.

To lamie zapis `01-UI-SPEC` Aneks v1.6 paragraf 3 („the four `.fact-label` nodes ... are
unchanged"). Obie specyfikacje poprawione w tym samym commicie.

## Regresja, ktora byla wada dla rodzica, nie tylko czerwonym testem

Pierwsza wersja powtarzala na /rekrutacja caly panel z /cennik. Suite zaswiecil w tescie a11y
stanu bledu walidacji, a przyczyna nie miala nic wspolnego z dostepnoscia.

**`.blok-formularz` jest od 1024 px `position: sticky` z `top: 96px`.** FeeBox siedzi w srodku,
a przycisk „Wyślij zgłoszenie" stoi w tym samym bloku PONIZEJ niego. Element sticky wyzszy niz
`viewport - 96px` przestaje wedrowac, kiedy sie przyklei, wiec jego dolna czesc jest
nieosiagalna, dopoki blok sie nie zwolni. Panel dorzucal okolo 215 px.

Droga do przyczyny, bo pierwsze dwie hipotezy byly bledne:

1. „to nieaktualny build" — obalone: po przebudowie dalej czerwone;
2. „to limit zapytan w KV" — obalone: po wyczyszczeniu `.wrangler/state/v3/kv` dalej czerwone;
3. bisekcja: cofniecie samego `FeeBox.svelte` daje 17/17, wiec przyczyna jest tam;
4. pomiar: klikniecie DZIALA 0 ms po zaladowaniu i PRZESTAJE dzialac po sekundzie, czyli gdy
   Turnstile dorenderuje swoja wysokosc. Na czystym drzewie dziala przy kazdym opoznieniu;
5. `dispatchEvent('submit')` dzialal ZAWSZE, takze po sekundzie, wiec handler byl podpiety i
   nie chodzilo o hydracje. Nie dzialalo samo KLIKNIECIE;
6. pomiar geometrii: po `scrollIntoView` dol przycisku wypadal na 908 px przy viewporcie
   720 px, wobec 693 px na czystym drzewie.

Poprawka: `notaObnizkiZwiezle`, czyli jedno zdanie zamiast panelu. Zgadza sie to takze z D-15,
ktore nazywa te powierzchnie ZWIEZLYM podsumowaniem.

## Test, ktorego NIE dodano, i dlaczego

Napisalem test geometryczny „dol przycisku miesci sie w 720 px" i go USUNALEM: nie przechodzi
rowniez na czystym drzewie (693 + 50 = 743 px). Pilnowalby normy, ktorej ta strona nigdy nie
spelniala, zamiast pilnowac regresji, a taki test jest halasem. Powod zostal zapisany
komentarzem przy tescie, ktory regresje FAKTYCZNIE zlapal, razem z ostrzezeniem, zeby nie
dokladac wysokosci do FeeBox bez jego uruchomienia.

## Brama

```
npm run check      -> 4403 FILES 0 ERRORS 0 WARNINGS
npm run lint       -> All matched files use Prettier code style!
npm run test:unit  -> tests 595 | pass 595 | fail 0
npm run test       -> 430 passed (54.5s)
```

## Co zostaje otwarte

- Mail do dyrektorki dalej niewyslany (token Gmaila wygasl).
- Daty okresu trwalosci nadal nieznane; gdy obnizka wygasnie, trzy powierzchnie i dwie noty
  wymagaja recznej zmiany. Sklep nie ma pola daty, wiec nic tego nie przypomni.
