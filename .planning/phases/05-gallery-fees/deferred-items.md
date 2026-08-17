# Deferred items, phase 05

Out-of-scope discoveries made while executing this phase. Nothing here is fixed by the plan
that found it: each one is either older than the plan or touches surfaces the plan does not own.

## D-05-05-A: every required panel field renders TWO asterisks

**Found by:** plan 05-05, task 2, while checking the new Cennik labels against Contract 10.
**Scope:** pre-existing, repository wide, older than phase 05.

`src/lib/components/FormField.svelte:112-116` appends `<span aria-hidden="true"> *</span>`
whenever the `wymagane` prop is set, and every label in `src/lib/content/panel.ts` ALSO ends in
a literal ` *` (a convention `tests/admin-copy.unit.ts:306-312` actively asserts). Every editor
screen therefore renders the marker twice. Observed on the live preview:

```
"Wprowadzenie **\n(pole wymagane)"          <- /admin/o-nas, shipped since 04.1
"Stawka z uchwały (zł) **\n(pole wymagane)" <- /admin/cennik, the same convention
```

The accessible name is unaffected (`(pole wymagane)` is the announced half and occurs once),
so this is cosmetic, not a WCAG failure, and axe is clean on every panel screen.

**Not fixed here, deliberately.** The three available fixes each land outside plan 05-05:

1. drop the literal ` *` from the copy module. That contradicts `05-UI-SPEC` Contract 10,
   whose label column spells `Stawka z uchwały (zł) *`, and turns
   `tests/admin-copy.unit.ts:306-312` red for every screen in the panel;
2. drop the `wymagane` prop at the call sites. That silently removes `required` and
   `aria-required` from every required control in the panel, which is a real regression;
3. change `FormField.svelte` to stop appending the visible marker. That is the right fix, and
   it is a change to a component EVERY form on the public site also uses (`ZgloszenieForm`,
   the kontakt form), so it needs its own plan and its own regression run.

The new Cennik screen deliberately follows the existing convention rather than diverging from
it: one screen spelled differently from the other seven would be a worse defect than the one
being deferred.

---

## 2. Suita Playwright bywa czerwona pod obciazeniem, bo caly zestaw dzieli jeden serwer

**Found by:** orkiestrator fazy 05, brama po scaleniu fali 4.
**Scope:** infrastruktura testow, repozytorium w calosci, starsze niz faza 05.

Po scaleniu planu 05-07 pierwszy przebieg `npm run test` pokazal jedna porazke:
`tests/admin-nabor.spec.ts:207` („ekran z podsumowaniem bledow nie narusza WCAG 2.1 AA").
Kolejne cztery przebiegi tej samej suity na tym samym drzewie byly zielone, 390/390.

**To nie jest regresja dostepnosci ani skutek scalenia.** Dowody:

1. Drzewo po scaleniu jest bajt w bajt identyczne z tym, ktore przetestowal plan 05-07
   (`git diff b1e0e28 6f53a1f` jest puste), a 05-07 raportowal 390/390.
2. Sam plik `tests/admin-nabor.spec.ts` przechodzi w izolacji, 11/11.
3. Plan 05-07 nie dotknal ani `tests/admin-nabor.spec.ts`, ani `src/routes/admin/nabor/`.
4. Wymuszona rywalizacja (`npx playwright test --workers=12`) daje rozklad porazek,
   ktory nie zostawia watpliwosci:

   | sygnatura porazki | liczba |
   |---|---|
   | `net::ERR_CONNECTION_REFUSED` na `page.goto` | 296 |
   | przekroczenie 5000 ms w `expect` | ok. 20 |
   | naruszenie axe (`expect(wynik.violations).toEqual([])`) | **0** |

   Zero w ostatnim wierszu jest tu najwazniejsze: w przebiegu ze 153 porazkami ani jedna
   nie byla naruszeniem dostepnosci. Gdyby na ekranie podsumowania bledow siedzialo
   przelotne naruszenie WCAG, wlasnie obciazenie byloby miejscem, w ktorym by wyszlo.

**Przyczyna.** `playwright.config.ts` ma `fullyParallel: true`, a `webServer` to JEDNA
instancja `wrangler pages dev`. Wszystkie procesy robocze dobijaja sie do niej naraz. Przy
dwunastu serwer wprost odmawia polaczen, przy pieciu potrafi raz na jakis czas odpowiedziec
na tyle wolno, ze `expect(...).toBeVisible()` przekracza swoje 5000 ms. Lokalnie
`retries: process.env.CI ? 2 : 0` daje zero powtorzen, a projekt nie ma CI, wiec kazde takie
potkniecie czyta sie jak twarda porazka.

**Nie naprawione tutaj, swiadomie.** Podniesienie `retries` poza CI jest zmiana bramy
jakosci projektu i zamiatalaby pod dywan takze prawdziwe niestabilnosci, a nie miesci sie
w zakresie fazy 05. Prawdziwe warianty do rozwazenia w osobnym planie:

1. `retries: 1` takze lokalnie, z raportem `flaky` jako sygnalem, nie jako cisza;
2. ograniczenie `workers` w konfiguracji do liczby, ktora ten serwer udzwiga;
3. `expect.timeout` wyzszy niz domyslne 5000 ms dla scenariuszy, ktore robia POST.

Do czasu takiej decyzji: pojedyncza porazka w tej suicie, ktora nie powtarza sie przy
ponownym przebiegu i nie jest naruszeniem axe, jest artefaktem obciazenia, nie regresja.

---

## 3. `MobileNav.svelte` ma te sama ucieczke z pulapki fokusu, ktora naprawiono w podgladzie zdjecia

**Found by:** naprawa WR-05 w fazie 05; potwierdzone odczytem kodu przez orkiestratora.
**Scope:** `src/lib/components/MobileNav.svelte`, komponent obecny na KAZDEJ stronie.
Wada jest starsza niz faza 05: `Lightbox.svelte` zostal z tego komponentu przepisany, wiec
plan 05-08 ja odziedziczyl, a nie wymyslil.

`src/lib/components/MobileNav.svelte:73-79` obsluguje dokladnie dwa stany:

```js
if (event.shiftKey && active === first) { ... }
else if (!event.shiftKey && active === last) { ... }
```

Kontener szuflady (`:104-113`) ma `role="dialog"`, `aria-modal="true"` i `tabindex="-1"`, wiec
klikniecie w samą szufladę (jej wypelnienie, pasek naglowka obok przycisku zamkniecia, odstepy
miedzy odnosnikami) ustawia na nim fokus. W tym stanie `active` nie jest ani `first`, ani `last`,
zaden warunek nie zachodzi, `preventDefault()` nie pada i Shift+Tab wychodzi poza dialog na
strone pod spodem. Do przodu Tab trafia na przycisk zamkniecia, wiec przecieka tylko wstecz.

**Naprawa jest juz znana i sprawdzona.** `Lightbox.svelte` po poprawce WR-05 liczy pozycje
aktywnego elementu w cyklu i traktuje `-1` (w dialogu, ale nie na jego kontrolce) jako wejscie
do cyklu od tej strony, w ktora zmierza klawisz. Ten sam ksztalt przenosi sie tu wprost.

**Nie naprawione w fazie 05, swiadomie.** Zakres poprawek po przegladzie kodu byl ustalony na
cztery ustalenia (CR-01, WR-05, WR-01, WR-04), a ta wada lezy w komponencie, ktorego faza 05
nie dotykala. Wymaga wlasnego planu z wlasnym testem: `tests/nav.spec.ts` dowodzi dzis roli
dialogu, pierwszego fokusu, Escape i przywrocenia fokusu, ale ani razu nie naciska Tab, wiec
nie ma testu, ktory ta poprawke przyjmie. WCAG 2.1 AA jest tu wymogiem prawnym.

## 4. `tests/admin-galeria.spec.ts:141` powtarza nieprawdziwe zdanie usuniete przez WR-04

**Found by:** naprawa WR-04 w fazie 05.
**Scope:** jeden komentarz w tescie.

Komentarz nadal mowi „By layout inheritance and with no auth code in the route itself
(T-05-06-07)". WR-04 usunelo dokladnie to twierdzenie z trzech plikow serwerowych, bo jest
falszywe w obu polowach: `src/routes/admin/+layout.server.ts` nie uwierzytelnia niczego, a brama
to `src/hooks.server.ts` dopasowujace `pathname` przed routerem. Poprawka WR-04 byla celowo
ograniczona do trzech plikow zrodlowych, wiec ten komentarz zostal. Do wymiany razem z pozycja 3
albo przy najblizszej pracy w tym pliku.
