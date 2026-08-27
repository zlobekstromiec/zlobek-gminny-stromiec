---
quick_id: 260827-bfa
slug: mail-kamili-2026-08-27-publicznyzlobek-u
date: 2026-08-27
type: execute
status: complete
tasks_completed: 3
decisions: [D-1, D-2, D-3]
requirements: [FORM-01, FORM-02, LEGAL-02, SITE-06]
commits:
  - 5a2e150 chore: ignoruj runtime .gsd/, ktory blokowal linta
  - a621cff feat: nowy adres skrzynki i kopia dla Urzedu Gminy
  - 7042f22 feat: polityka prywatnosci o dwoch zakresach i kontakt IOD
  - 6b69ea6 docs: dokumenty stanu faktycznego dogonione
files_created:
  - src/lib/content/polityka.ts
files_modified:
  - .gitignore
  - .prettierignore
  - src/lib/content/site.ts
  - src/lib/content/forms.ts
  - src/lib/server/forms/mailer.ts
  - src/routes/polityka-prywatnosci/+page.svelte
  - scripts/make-map.mjs
  - tests/forms.unit.ts
  - tests/forms-copy.unit.ts
  - tests/home.spec.ts
  - tests/kontakt-api.spec.ts
  - tests/rekrutacja-api.spec.ts
  - tests/polityka-prywatnosci.spec.ts
  - .claude/CLAUDE.md
  - docs/dev-env.md
  - .planning/PROJECT.md
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
  - .planning/STATE.md
gate: green
actuals:
  tokens: 12000
  tasks: 3
  commits: 4
---

# Mail Kamili z 2026-08-27: nowy adres, kopia dla Urzędu, prawdziwa polityka prywatności

Trzy sprawy z jednego maila, wykonane w trzech atomowych commitach: skrzynka
`publicznyzlobek@ugstromiec.pl` zastąpiła nieistniejącą, kopia zgłoszeń idzie do
Urzędu Gminy i jest ujawniona w klauzuli, a `/polityka-prywatnosci` przestała być
zaślepką i jest prawdziwą stroną prawną o dwóch rozłącznych zakresach.

## Co się zmieniło

### Zadanie 1 (a621cff): adres od końca do końca plus kopia dla Urzędu

- `contact.email` i `TO` w mailerze na `publicznyzlobek@ugstromiec.pl`; ten sam
  adres w łańcuchu User-Agent generatora mapy i w przypiętym selektorze
  `tests/home.spec.ts`.
- Nowa stała modułowa `CC = 'kamila.dobosz@ugstromiec.pl'`, `PayloadResend`
  zyskał `cc: string[]`, a `zbudujPayload` emituje siedem kluczy jawnym literałem.
  `BCC` i jego komentarz o bramie startowej NIETKNIĘTE.
- `KLAUZULA`, blok „Odbiorcy danych", zyskał jako pierwszy akapit zdanie
  o kopii dla Urzędu Gminy, z `urzad.name` w mianowniku jako podmiotem zdania.
- Trzy nowe bramki w `tests/forms-copy.unit.ts`, każda z kontrolą dodatnią:
  ujawnienie kopii, nieobecność adresu kopii w kopii publikowanej (przez import
  stałej, nie drugi literał) oraz półpauza wyłącznie w zakresie liczbowym.

### Zadanie 2 (7042f22): polityka prywatności i kontakt do IOD

- Nowe pole `contact.iodEmail = 'iod@ugstromiec.pl'`, jedyne źródło tego adresu.
- Akapit IOD w klauzuli formularzy podaje teraz adres kontaktowy. Znacznik
  `PLACEHOLDER` ZOSTAŁ, zawężony do brakującego imienia i nazwiska inspektora
  (art. 11 ustawy z 10 maja 2018 r. wymaga obu).
- Nowy moduł `src/lib/content/polityka.ts` niesie całą prozę strony, w tym
  klauzulę administratora po redakcji rozstrzygniętej w D-3.
- `/polityka-prywatnosci` przepisana: jeden `h1`, dwie sekcje `h2` z jawnym
  rozgraniczeniem zakresu, bloki klauzul jako `h3`, hierarchia bez przeskoków,
  `noindex` na miejscu, axe czysty. Klauzula formularzy renderowana z tego samego
  eksportu, którym posługuje się `ConsentBlock`: żaden tekst nie jest kopiowany.
- `tests/polityka-prywatnosci.spec.ts` przepisany z kontraktu zaślepki na kontrakt
  prawdziwej strony (8 przypadków), `tests/forms-copy.unit.ts` zamiata teraz także
  eksporty z `polityka.ts`, a zestaw dopuszczonych adresów pozostał ZAMKNIĘTY,
  tylko rozszerzony do dwóch wartości z `site.ts`.

### Zadanie 3 (6b69ea6): dokumenty stanu faktycznego

Sześć dokumentów dociągniętych adresowo: `.claude/CLAUDE.md`, `docs/dev-env.md`,
`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`. Zakaz zmiany odbiorcy
zniesiony wraz z wygaśnięciem jego przesłanki. FORM-01 i LEGAL-02 pozostają
NIEODHACZONE, obie noty przepisane na nowy stan. Do sekcji Blockers w STATE.md
dopisane dwa otwarte pytania do klientki. Migawki historyczne
(`.planning/DESIGN-BANK.md`, `.planning/research/*`, `.planning/phases/*`,
pozostałe katalogi `.planning/quick/*`) nietknięte, co potwierdza trzecia bramka
zadania 3.

## Obserwacje RED (zadania TDD, RED nie był commitowany)

Pre-commit uruchamia svelte-check po całym drzewie i odmówiłby commita czerwonego
drzewa, więc RED jest zapisany tutaj, zgodnie z planem.

**Zadanie 1, RED pierwszy.** Po dopisaniu testów, przed implementacją:

```
SyntaxError: The requested module '../src/lib/server/forms/mailer.ts'
does not provide an export named 'CC'
```

w `tests/forms-copy.unit.ts` oraz w `tests/forms.unit.ts`. Dwa pliki na czerwono,
486/488 zielonych.

**Zadanie 1, RED drugi.** Po dodaniu samej stałej `CC` i klucza `cc`, przed
dopisaniem zdania do klauzuli, `tests/forms.unit.ts` był już zielony (119/119),
a `tests/forms-copy.unit.ts` czerwony z właściwego powodu:

```
✖ the klauzula discloses the copy sent to the Urząd Gminy (D-2, Pitfall 8)
  AssertionError: The input did not match the regular expression
  /Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje/
```

To jest RED, którego ta bramka istnieje: kod miał już nowego odbiorcę, a klauzula
jeszcze o nim nie mówiła, czyli dokładnie stan rozjechania opisany w 04-RESEARCH
Pitfall 8.

**Zadanie 2, RED.**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'/Users/devopsdom/src/client-zlobekstromiec/src/lib/content/polityka.ts'
imported from tests/forms-copy.unit.ts
```

Uwaga na uczciwość dowodu: to RED na poziomie modułu, więc nie widziałem osobnego
czerwonego przebiegu każdej z ośmiu asercji strukturalnych w
`tests/polityka-prywatnosci.spec.ts`. Najsilniejszym pojedynczym dowodem w tym
zadaniu jest przypadek łączący kontrolę dodatnią i ujemną w jednym: adres IOD MUSI
być w HTML, adresu kopii NIE MOŻE być. Ujemna połowa nie może przejść pusta, bo
dodatnia by wtedy padła.

## Bramka końcowa

```
lsof -ti tcp:4173 | while read -r p; do kill "$p"; done
npm run check && npm run lint && npm run test:unit && npm run test
```

- `npm run check`: 4408 plików, 0 błędów, 0 ostrzeżeń.
- `npm run lint`: prettier i eslint czyste.
- `npm run test:unit`: **644/644 zielone** (przed zadaniem: 643, plus jeden nowy
  przypadek na kontakt do IOD; trzy bramki z zadania 1 doszły wcześniej).
- `npm run test`: **447/447 zielonych**, czas 1.0 min.

Nie zostawiono ani jednego pominiętego przypadku, ani jednego nieuruchomionego
`<verify>`. Bramki grep z każdego zadania przeszły, w tym ta pilnująca, że nikt nie
przepisał migawek historycznych.

## Odstępstwa od planu

**1. [Reguła 3 - blokada] `.gsd/` blokowało każdy commit, więc trafiło do ignore.**

- **Znalezione podczas:** pierwsza próba commita zadania 1.
- **Problem:** harness dyspozytora zapisał w drzewie
  `.gsd/dispatch-isolation-sentinel.json`. `prettier --check .` potyka się o ten
  plik, więc hook pre-commit odrzucał KAŻDY commit, niezależnie od jego treści.
  Plik jest stanem runtime narzędzia, nie źródłem projektu, dokładnie tak jak
  `/.planning/` i `/.claude/`, które w `.prettierignore` już są.
- **Naprawa:** `/.gsd/` dopisane do `.prettierignore` (obok istniejącego wpisu GSD)
  i do `.gitignore`. Osobny commit `chore`, żeby nie mieszać go z zadaniem 1.
- **Pliki:** `.gitignore`, `.prettierignore`. **Commit:** 5a2e150.

**2. [Reguła 3 - blokada] Komentarz w `site.ts` zapalił własną bramkę zadania 1.**

- **Problem:** komentarz opisujący, że nowy adres zastępuje stary, cytował stary
  adres dosłownie, więc bramka `grep -rnE '(^|[^a-z])zlobek@ugstromiec\.pl' src`
  wykryła go i zadanie 1 nie mogło się domknąć.
- **Naprawa:** komentarz przeredagowany na „the earlier `zlobek@` address on the
  same domain". Historia zapisana, literał nie ocalał. To zachowanie bramki jest
  poprawne, nie za ostre: gdyby przepuszczała cytaty w komentarzach, przepuściłaby
  też prawdziwe wystąpienie w komentarzu nad stałą.
- **Pliki:** `src/lib/content/site.ts`. **Commit:** a621cff.

**3. [zakres] Trzy dodatkowe wystąpienia starego adresu w `STATE.md`.**

- **Problem:** plan wymienia w STATE.md linie 189, 287 i 298, ale bramka zadania 3
  zamiata cały `.planning/*.md` poza migawkami, a stary adres stał także
  w narracji o przeskalowaniu fazy 6 (linia 39), w historycznym zapisie
  Homepage v2.1 (linia 192) i w wykreślonej pozycji „RESOLVED" (linia 286). Bramka
  jest szersza niż wyliczenie, więc te trzy też musiały wejść.
- **Naprawa:** przepisane tak, że zdanie nadal opisuje przeszłość prawdziwie
  („wtedy `zlobek@`, zastąpiony 2026-08-27"), ale nie niesie już literału.
  To nie jest fałszowanie archiwum: `STATE.md` jest dokumentem stanu faktycznego,
  a nie migawką, i sam plan tak go klasyfikuje.
- **Pliki:** `.planning/STATE.md`. **Commit:** 6b69ea6.

**4. [proces] Jeden commit trzeba było rozdzielić.**

Pierwsza próba commita zadania 1 padła na hooku (odstępstwo 1), ale pozostawiła
pliki w indeksie. Kolejny commit `chore` zgarnął je razem ze sobą, przez co jego
komunikat opisywał treść, której nie miał. Naprawione natychmiast przez
`git reset --soft HEAD~1` na własnym, niewypchniętym commicie i ponowne złożenie
dwóch osobnych commitów. Żadnej pracy nie utracono i nic nie zostało wypchnięte.
Odnotowane, bo atomowość commitów jest w tym repozytorium wymogiem, nie ozdobą.

## Czego świadomie NIE zmieniono

- `BCC` i akapit „Tymczasowa kopia zapasowa": para nietknięta, obie znikają dopiero
  razem po udowodnionym dostarczeniu.
- FORM-01 i LEGAL-02 nadal z pustą kratką.
- Znacznik `PLACEHOLDER` przy IOD: ZOSTAŁ, zawężony.
- Rozbieżność „administratora": obie wersje opublikowane, każda w swojej sekcji,
  bez próby uzgodnienia w kodzie.
- Migawki historyczne: `.planning/DESIGN-BANK.md`, `.planning/research/*`,
  `.planning/phases/*` i pozostałe katalogi `.planning/quick/*`.

## Znane braki

Nie ma zaślepek (stubs) wprowadzonych tym zadaniem. Istniejący znacznik
`PLACEHOLDER` przy bloku IOD jest ZAMIERZONY i zawężony: czeka na imię i nazwisko
inspektora, bez którego LEGAL-02 nie może się zamknąć (faza 7).

Jeden dług weryfikacyjny przenoszony dalej, nie wprowadzony tutaj: **dostarczenie
na `publicznyzlobek@ugstromiec.pl` NIE jest udowodnione**. Potrzebne jest jedno
wysłanie formularza po wdrożeniu i zajrzenie do skrzynki, bez żadnego deployu.
Do tego czasu FORM-01 zostaje nieodhaczone, a zapasowa ukryta kopia działa.

## Pytania do klientki

Oba w `260827-bfa-ODPOWIEDZ.md` i w sekcji Blockers `STATE.md`:

1. **Imię i nazwisko inspektora ochrony danych.** Podany jest sam adres, art. 11
   ustawy z 10 maja 2018 r. wymaga także nazwiska. Jedno z dwóch nazwisk, na które
   czeka faza 7.
2. **Kto jest administratorem.** „Podmiot prowadzący Publiczny Żłobek w Stromcu"
   z jej tekstu wobec „Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy
   Stromiec" z klauzuli formularzy. Uzgodnienie należy do administratora.

## Self-Check: PASSED

- `src/lib/content/polityka.ts` istnieje.
- Commity `5a2e150`, `a621cff`, `7042f22`, `6b69ea6` obecne w `git log`.
- Bramka końcowa uruchomiona w całości i zielona, wynik przepisany powyżej
  z rzeczywistego wyjścia, nie z pamięci.
