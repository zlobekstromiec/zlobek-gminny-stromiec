---
quick_id: 260827-bfa
slug: mail-kamili-2026-08-27-publicznyzlobek-u
date: 2026-08-27
status: planned
type: execute
tasks: 3
autonomous: true
decisions: [D-1, D-2, D-3]
requirements: [FORM-01, FORM-02, LEGAL-02, SITE-06]
files_modified:
  - src/lib/content/site.ts
  - src/lib/content/forms.ts
  - src/lib/content/polityka.ts
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

must_haves:
  truths:
    - "Każda publiczna powierzchnia z adresem e-mail pokazuje publicznyzlobek@ugstromiec.pl (D-1)."
    - "Każde wysłane zgłoszenie idzie na publicznyzlobek@ugstromiec.pl, z kopią cc na kamila.dobosz@ugstromiec.pl i z niezmienioną ukrytą kopią zapasową (D-1, D-2)."
    - "Adres kamila.dobosz@ugstromiec.pl nie pojawia się w żadnym eksportowanym tekście ani w żadnym wyrenderowanym HTML (D-2)."
    - "Klauzula informacyjna ujawnia kopię do Urzędu Gminy w Stromcu, więc kod i klauzula nie są rozjechane (D-2)."
    - "/polityka-prywatnosci jest prawdziwą stroną z dwiema rozłącznymi, jawnie rozgraniczonymi sekcjami: klauzulą administratora i klauzulą formularzy (D-3)."
    - "iod@ugstromiec.pl jest publikowany i osiągalny z obu miejsc: ze strony polityki i spod każdego formularza (D-3)."
    - "Znacznik PLACEHOLDER przy IOD ZOSTAJE, zawężony do brakującego imienia i nazwiska (D-3, art. 11 ustawy z 10 maja 2018 r.)."
    - "FORM-01 pozostaje NIEODHACZONE, a jego nota opisuje nowy stan (D-1)."
  artifacts:
    - src/lib/content/polityka.ts
    - src/routes/polityka-prywatnosci/+page.svelte
    - tests/polityka-prywatnosci.spec.ts
  key_links:
    - "contact.email w site.ts → osiem powierzchni publicznych (nagłówek, stopka, /kontakt, oba formularze, noscript, fallback, mapa)."
    - "Stała CC w mailer.ts ↔ zdanie o kopii w bloku „Odbiorcy danych" KLAUZULI: nigdy nie mogą się rozjechać (04-RESEARCH Pitfall 8)."
    - "Stała BCC ↔ akapit „Tymczasowa kopia zapasowa": para NIETKNIĘTA, obie znikają dopiero razem po udowodnionym dostarczeniu."
    - "KLAUZULA z forms.ts → jedno źródło renderowane i pod formularzami (ConsentBlock), i na /polityka-prywatnosci: żaden tekst nie jest kopiowany."
---

# Mail Kamili z 2026-08-27: nowy adres, kopia dla Urzędu, prawdziwa polityka prywatności

Trzecia rata informacji od Kamili Dobosz zamyka trzy sprawy naraz. Decyzje są
ZABLOKOWANE w `260827-bfa-CONTEXT.md` i ten plan ich nie otwiera ponownie.

- **D-1** `publicznyzlobek@ugstromiec.pl` zastępuje `zlobek@ugstromiec.pl` wszędzie, także jako odbiorca formularzy.
- **D-2** `kamila.dobosz@ugstromiec.pl` wchodzi jako `cc`, NIGDY jako treść publiczna, i musi zostać ujawniony w klauzuli.
- **D-3** `/polityka-prywatnosci` staje się prawdziwą stroną z dwiema rozłącznymi sekcjami, a `iod@ugstromiec.pl` trafia do klauzuli formularzy.

## PUŁAPKA, którą ten plan musi ominąć: podciąg

`publicznyzlobek@ugstromiec.pl` **zawiera w sobie** `zlobek@ugstromiec.pl`.
To ma dwie konsekwencje i obie są cichymi awariami:

1. **Nigdy nie uruchamiaj podmiany po całym drzewie.** `sed 's/zlobek@ugstromiec.pl/publicznyzlobek@ugstromiec.pl/g'`
   uruchomione dwa razy, albo na pliku już poprawionym, produkuje
   `publicznypublicznyzlobek@ugstromiec.pl`. Każde wystąpienie edytujemy adresowo.
2. **Bramka „stary adres zniknął" musi mieć granicę.** Zwykły `grep -rn "zlobek@ugstromiec"`
   trafia też w nowy adres i zawsze wygląda na porażkę. Formą obowiązującą w tym planie jest:

   ```
   grep -rnE '(^|[^a-z])zlobek@ugstromiec\.pl'
   ```

   bo znak przed `zlobek@` w nowym adresie to litera `y`.

## Co NIE jest zmieniane (celowo)

- **`BCC` i akapit „Tymczasowa kopia zapasowa" ZOSTAJĄ.** Brama D-13 zdejmuje oba
  dopiero po udowodnionym dostarczeniu na nowy adres, a tego jeszcze nie zrobiono.
- **FORM-01 zostaje nieodhaczone.** Zmieniamy nazwę skrzynki, nie dowód dostarczenia.
- **Zapisy historyczne zostają nietknięte:** `.planning/DESIGN-BANK.md`,
  `.planning/research/*`, wszystko pod `.planning/phases/` i pod `.planning/quick/`
  są migawkami stanu wiedzy z chwili powstania. Poprawianie migawki jest fałszowaniem archiwum.
- **Rozbieżność „administratora" NIE jest rozstrzygana w kodzie.** Kamila pisze
  „podmiot prowadzący Publiczny Żłobek", istniejąca klauzula formularzy pisze
  „Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec". Obie wersje
  publikujemy w swoich sekcjach; pytanie idzie do Kamili w raporcie końcowym.

## Reguły kopii, wiążące dla każdego tekstu w tym planie

Polski w całości, zero emoji, zero myślników. Półpauza `–` wyłącznie w zakresach
liczbowych (`6:30–16:30`). Teksty poniżej są PODANE DOSŁOWNIE i nie wolno ich
przeredagowywać: redakcja tekstu Kamili została rozstrzygnięta w D-3 i jest już wykonana w treści zadań.

<tasks>

<task type="auto" tdd="true">
  <name>Zadanie 1: nowy adres od końca do końca, kopia dla Urzędu i jej ujawnienie w klauzuli (D-1, D-2)</name>
  <files>src/lib/content/site.ts, src/lib/server/forms/mailer.ts, src/lib/content/forms.ts, scripts/make-map.mjs, tests/forms.unit.ts, tests/forms-copy.unit.ts, tests/home.spec.ts, tests/kontakt-api.spec.ts, tests/rekrutacja-api.spec.ts</files>

  <behavior>
    - `zbudujPayload` zwraca `to: [TO]` z nowym adresem, `cc: [CC]`, `bcc: [BCC]` niezmienione (RED: dziś nie ma klucza `cc`).
    - Zestaw kluczy ładunku Resend to dokładnie `bcc, cc, from, reply_to, subject, text, to` (RED: `KLUCZE_PAYLOAD` w tests/forms.unit.ts:265 nie zna `cc`).
    - Ciało żądania z podrobionym kluczem `cc` nie zmienia odbiorców i nadal kończy się kodem 200 (rozszerzenie istniejącego przypadku o klucze `to`/`bcc`).
    - Tekst KLAUZULI zawiera zdanie o kopii dla Urzędu Gminy w Stromcu (RED: dziś go nie ma).
    - Żaden eksportowany tekst nie zawiera adresu ze stałej `CC` (kontrola dodatnia i ujemna, patrz akcja).
    - Żaden eksportowany tekst nie zawiera półpauzy poza zakresem liczbowym (RED przez kontrolę dodatnią na tekście wzorcowym).
  </behavior>

  <action>
Wykonanie D-1 w kodzie i D-2 w całości. Kolejność: najpierw testy (obserwuj RED,
NIE commituj RED-a: pre-commit uruchamia svelte-check po całym drzewie i odmówi commita,
to udokumentowana właściwość tego repozytorium), potem implementacja.

1. `src/lib/content/site.ts`, pole `contact.email` (dziś linia 73): wartość na
   `'publicznyzlobek@ugstromiec.pl'`. Komentarz nad nim przepisz na aktualny stan
   faktyczny: adres instytucjonalny podany na piśmie przez Kamilę Dobosz
   (Urząd Gminy w Stromcu) 2026-08-27, zastępuje wcześniejszy `zlobek@`, który
   NIGDY nie istniał jako skrzynka; nadal nie jest treścią zastępczą, więc żadnego
   znacznika tresci zastępczej tu nie ma. Zostaw nienaruszony komentarz o braku telefonu
   i pola `nip`/`regon`.

2. `src/lib/server/forms/mailer.ts`:
   - `TO` na `'publicznyzlobek@ugstromiec.pl'`; w komentarzu nad stałą zaznacz, że
     jest to skrzynka wskazana 2026-08-27 i że dostarczenie na nią NIE jest jeszcze udowodnione.
   - Dodaj stałą `CC = 'kamila.dobosz@ugstromiec.pl'` z komentarzem mówiącym trzy rzeczy:
     to stała modułowa, nigdy wartość z żądania (tak samo jak `FROM`, `TO`, `BCC`);
     semantycznie żłobek jest adresatem, a Urząd Gminy kopią; oraz że ten odbiorca jest
     ujawniony w bloku „Odbiorcy danych" KLAUZULI i jedno bez drugiego nie może istnieć.
   - `PayloadResend` zyskuje `cc: string[]`.
   - `zbudujPayload` emituje `cc: [CC]`. Buduj nadal jawny literał obiektu, bez rozwijania
     czegokolwiek z żądania.
   - `BCC` i jego komentarz o bramie startowej ZOSTAJĄ bez zmian.

3. `src/lib/content/forms.ts`, blok `KLAUZULA` o nagłówku „Odbiorcy danych":
   dodaj jako PIERWSZY akapit tego bloku, dosłownie:

   Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje ${urzad.name}, który prowadzi sprawy rekrutacyjne żłobka.

   Nazwa urzędu MUSI wejść przez interpolację `urzad.name` i MUSI stać w mianowniku
   jako podmiot zdania. Konstrukcja „trafia do ${urzad.name}" jest ZAKAZANA: przyimek
   „do" wymaga dopełniacza, a stała jest w mianowniku. To ten sam błąd, który plany
   04-04 i 04-05 już raz naprawiły.

4. `scripts/make-map.mjs` (dziś linia 52): adres w łańcuchu User-Agent na nowy.
   Reszta łańcucha bez zmian, plik nie jest przez to uruchamiany ponownie.

5. `tests/home.spec.ts` (dziś linia 249): selektor na
   `a[href="mailto:publicznyzlobek@ugstromiec.pl"]`. Literał zostaje literałem, bo ten
   przypadek celowo przypina opublikowany adres.

6. `tests/forms.unit.ts`:
   - `KLUCZE_PAYLOAD` (linia 265) zyskuje `'cc'`, lista zostaje posortowana alfabetycznie.
   - Do przypadków sprawdzających ładunek dołóż `assert.deepEqual(payload.cc, [CC])`
     (import `CC` z mailera) w tych samych miejscach, gdzie sprawdzane są dziś `to` i `bcc`
     (linie ~270, ~300, ~1035).
   - Przypadek „the payload keeps the module recipients when the body carries to, from, cc and bcc keys"
     już nazywa `cc` w tytule; dołóż klucz `cc` do podrabianego ciała i asercję, że
     `payload.cc` nadal równa się `[CC]`.

7. `tests/kontakt-api.spec.ts` i `tests/rekrutacja-api.spec.ts`: w przypadku
   „dodatkowe klucze to i bcc w ciele żądania są ignorowane" dołóż klucz `cc` do ciała
   i dopisz `cc` w nazwie przypadku. Nadal oczekujemy 200.

8. `tests/forms-copy.unit.ts` zyskuje trzy nowe bramki:
   - **Kopia dla Urzędu jest ujawniona:** `assert.match(KLAUZULA_TEKST, /Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje/)`
     oraz `assert.ok(KLAUZULA_TEKST.includes(urzad.name))`.
   - **Adres kopii nie jest publikowany:** zaimportuj `CC` z `../src/lib/server/forms/mailer.ts`
     (moduł ma tylko import typu i nie wykonuje niczego przy wczytaniu) i sprawdź, że żaden
     element `WSZYSTKIE_STRINGI` go nie zawiera. Import zamiast drugiego literału jest tu
     istotą: dwa literały mogłyby się rozjechać przy zmianie adresu. Dołóż kontrolę dodatnią:
     detektor uruchomiony na łańcuchu wzorcowym zbudowanym z `CC` MUSI zgłosić trafienie,
     inaczej bramka przechodziłaby pusta.
   - **Półpauza tylko w zakresach liczbowych:** wyrażenie `/(?<!\d)–|–(?!\d)/u` nie może
     trafić w żaden element `WSZYSTKIE_STRINGI`. Granica cyfrowa jest konieczna, bo
     `contact.hours` legalnie niesie `6:30–16:30`. Dołóż kontrolę dodatnią na łańcuchu
     wzorcowym z półpauzą otoczoną spacjami. Ta bramka istnieje dokładnie po to, żeby
     tekst klientki wklejony bez redakcji zapalał się na czerwono.

Istniejąca asercja „every e-mail address in the exported copy is the value from site.ts"
zostaje w tym zadaniu NIEZMIENIONA i musi przejść: po tym zadaniu jedynym adresem
w zamiatanej kopii nadal jest `contact.email`, tyle że o nowej wartości. Rozszerza ją
dopiero zadanie 2.
  </action>

  <verify>
    <automated>lsof -ti tcp:4173 | while read -r p; do kill "$p"; done; npm run check && npm run test:unit && npx playwright test tests/home.spec.ts tests/kontakt-api.spec.ts tests/rekrutacja-api.spec.ts</automated>
    <automated>if grep -rnE '(^|[^a-z])zlobek@ugstromiec\.pl' src scripts tests; then echo 'BRAMKA: stary adres nadal w kodzie'; exit 1; fi</automated>
    <automated>if grep -rn 'publicznypublicznyzlobek' src scripts tests docs .claude .planning/PROJECT.md .planning/ROADMAP.md .planning/REQUIREMENTS.md .planning/STATE.md; then echo 'BRAMKA: podwojony prefiks, ktos uruchomil zamiatanie'; exit 1; fi</automated>
  </verify>

  <done>
Nowy adres jest w `contact.email`, w `TO` i w generatorze mapy; stary nie występuje
już w `src`, `scripts` ani `tests`, a nigdzie nie powstał adres z podwojonym prefiksem.
`zbudujPayload` emituje siedem kluczy z `cc: [CC]`, a `BCC` i jego akapit klauzuli są
nietknięte. Klauzula ujawnia kopię dla Urzędu Gminy w Stromcu, adres tej kopii nie
występuje w żadnym eksportowanym tekście, a obie nowe bramki mają kontrolę dodatnią.
`npm run check`, `npm run test:unit` i trzy wskazane pliki Playwrighta są zielone.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Zadanie 2: /polityka-prywatnosci jako prawdziwa strona o dwóch zakresach plus kontakt do IOD (D-3)</name>
  <files>src/lib/content/site.ts, src/lib/content/polityka.ts, src/lib/content/forms.ts, src/routes/polityka-prywatnosci/+page.svelte, tests/forms-copy.unit.ts, tests/polityka-prywatnosci.spec.ts</files>

  <behavior>
    - Klauzula formularzy podaje adres e-mail inspektora ochrony danych (RED: dziś podaje zdanie o oczekiwaniu na potwierdzenie).
    - Zamiatanie adresów w kopii dopuszcza dokładnie dwie wartości z site.ts i ani jednej więcej (RED: dziś dopuszcza jedną, więc adres IOD zapala test).
    - `/polityka-prywatnosci` zwraca 200, ma dokładnie jeden `h1` i nie przeskakuje poziomów nagłówków (h1 → h2 → h3).
    - Strona niesie obie sekcje, każdą z jawnym zdaniem rozgraniczającym zakres.
    - Strona renderuje ten sam eksport `KLAUZULA`, którym posługuje się `ConsentBlock`, więc widać na niej nagłówek „Odbiorcy danych" i zdanie o kopii dla Urzędu.
    - Adres IOD jest na stronie widoczny; adres kopii dla urzędniczki nie występuje w HTML tej strony.
    - Strona zostaje `noindex` i przechodzi axe bez naruszeń WCAG 2.1 AA.
  </behavior>

  <action>
Wykonanie D-3. Znowu: testy pierwsze, RED obserwowany i zapisany w SUMMARY, nie commitowany.

1. `src/lib/content/site.ts`, obiekt `contact`: dodaj pole `iodEmail: 'iod@ugstromiec.pl'`
   z komentarzem, że adres podała Kamila Dobosz 2026-08-27, że to JEDYNE źródło tego adresu
   w projekcie i że imienia oraz nazwiska inspektora nadal brakuje.

2. `src/lib/content/forms.ts`, blok `KLAUZULA` o nagłówku „Inspektor ochrony danych"
   (dziś linie 315-322): zastąp jedyny akapit tekstem, dosłownie:

   Kontakt z inspektorem ochrony danych jest możliwy pod adresem e-mail ${contact.iodEmail} oraz pod adresem korespondencyjnym administratora.

   Komentarz nad akapitem przepisz tak, żeby token PLACEHOLDER ZOSTAŁ, ale mówił o węższym
   braku: brakuje IMIENIA I NAZWISKA inspektora, adres kontaktowy jest już opublikowany,
   a art. 11 ustawy z 10 maja 2018 r. o ochronie danych osobowych wymaga obu. Brama startowa
   LEGAL-02 / faza 7 zostaje otwarta na to nazwisko. Usunięcie tokenu jest w tym zadaniu ZAKAZANE.

3. Nowy moduł `src/lib/content/polityka.ts`. Cała proza strony mieszka tu, nie w komponencie:
   to ta sama reguła, przez którą klauzula formularzy nie leży w kodzie serwera.
   Typ `BlokKlauzuli` importuj z `./forms` (import typu, żadnego cyklu: forms nie sięga po polityka).
   Eksporty:

   - `POLITYKA_TYTUL = 'Polityka prywatności (RODO)'` (musi być bajt w bajt tym, co dziś
     asertuje przypadek Playwrighta i co widnieje w stopce).
   - `POLITYKA_WSTEP`, dosłownie:
     Ta strona opisuje dwa rozłączne zbiory danych, dlatego ma dwie części. Pierwsza dotyczy danych dziecka i rodziców, które żłobek przetwarza w związku z rekrutacją, umową, opieką, dokumentacją i opłatami. Druga dotyczy wyłącznie tego, co sam wpiszesz w formularzu kontaktowym lub zgłoszeniowym na tej stronie. Zasady, w tym okresy przechowywania, są w obu częściach różne, ponieważ dotyczą różnych danych i różnych podstaw prawnych.
   - `POLITYKA_ADMINISTRATOR_NAGLOWEK = 'Dane dziecka i rodziców przetwarzane w żłobku'`
   - `POLITYKA_FORMULARZE_NAGLOWEK = 'Dane przesyłane przez formularze na tej stronie'`
   - `POLITYKA_FORMULARZE_WSTEP`, dosłownie:
     Poniżej jest ta sama klauzula informacyjna, którą widzisz pod formularzem kontaktowym i pod formularzem zgłoszenia. Dotyczy wyłącznie danych, które sam wpiszesz w formularzu na tej stronie.
   - `KLAUZULA_ADMINISTRATORA: readonly BlokKlauzuli[]`, opakowana `Object.freeze`,
     JEDEN blok bez nagłówka (nagłówkiem jest `h2` sekcji), pięć akapitów, dosłownie:

     1. Administratorem danych osobowych jest podmiot prowadzący Publiczny Żłobek w Stromcu.
     2. Dane dziecka i Rodziców są przetwarzane w celu przeprowadzenia rekrutacji, zawarcia i realizacji umowy o objęcie dziecka opieką, organizacji opieki, zapewnienia bezpieczeństwa, prowadzenia dokumentacji oraz rozliczania opłat, na podstawie obowiązujących przepisów prawa i zawartej umowy.
     3. Dane będą przechowywane przez okres wynikający z przepisów o archiwizacji i przepisów szczególnych.
     4. Osobie, której dane dotyczą, przysługują prawa określone w RODO, w szczególności prawo dostępu do danych, ich sprostowania, ograniczenia przetwarzania oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, w zakresie przewidzianym prawem.
     5. W Publicznym Żłobku został wyznaczony Inspektor Ochrony Danych Osobowych, z którym kontakt jest możliwy pod adresem korespondencyjnym Administratora danych, bądź za pomocą adresu e-mail: ${contact.iodEmail}.

     To jest tekst Kamili po redakcji rozstrzygniętej w D-3 i wykonanej powyżej: dwie
     półpauzy zamienione na przecinki, dwa `I` na `i`, „niniejszej umowy" na „umowy
     o objęcie dziecka opieką", osierocona spacja i podwójne spacje usunięte. Wielka litera
     w „Rodziców" i w „Administratora danych" jest JEJ i zostaje. Substancji prawnej nie
     ruszamy; nic tu nie dopisujemy i niczego nie skracamy. Adres w akapicie 5 wchodzi przez
     interpolację, nigdy jako literał.
     W module dopisz komentarz: rozbieżność między tym „podmiotem prowadzącym" a zdaniem
     o „jednostce organizacyjnej Gminy Stromiec" w klauzuli formularzy jest ŚWIADOMA i nie
     jest uzgadniana w kodzie (D-3), a pytanie idzie do klientki.

4. `src/routes/polityka-prywatnosci/+page.svelte`: pełne przepisanie zaślepki.
   - `<svelte:head>` zostaje ręcznie pisane, z tytułem i `<meta name="robots" content="noindex" />`.
     NIE wpinaj `Seo.svelte`: przebudowa obu stron prawnych na `Seo` jest zadaniem fazy 6
     (kryterium 5 w ROADMAP) i wykonana tu wyprzedziłaby tamtą decyzję.
   - Struktura: `h1` = `POLITYKA_TYTUL`, akapit `POLITYKA_WSTEP`, potem dwie `<section>`,
     każda z `h2`, swoim zdaniem rozgraniczającym i pętlą po blokach. Nagłówki bloków
     renderuj jako `h3`, więc hierarchia to h1 → h2 → h3 bez przeskoków.
   - Sekcja pierwsza pętli po `KLAUZULA_ADMINISTRATORA`, druga po `KLAUZULA` z `$lib/content/forms`.
     Żadnego tekstu nie kopiuj: dwie kopie się rozjeżdżają, a klauzula formularzy ma jedno źródło,
     to samo, które renderuje `ConsentBlock`.
   - Klucze pętli bierz jak w `ConsentBlock`: `blok.naglowek ?? blok.akapity[0]` dla bloków
     i sam akapit dla akapitów.
   - Style: rozbuduj istniejący blok zaślepki o reguły `h2`, `h3` i `section`. Wyłącznie warstwa
     `accessible` tokenów (`--color-ink`, `--color-muted`, `--color-brand-blue`); nic z warstwy
     ekspresyjnej nie dotyka tekstu. Szerokość mierzona w `ch` dla prozy prawnej, jak w panelu klauzuli.

5. `tests/forms-copy.unit.ts`:
   - Rozszerz przypadek „every e-mail address in the exported copy is the value from site.ts"
     na dwa dopuszczone adresy: `[contact.email, contact.iodEmail].sort()`. Zestaw ma pozostać
     ZAMKNIĘTY, bo to on pilnuje, że żaden inny adres nie wyciekł do kopii.
   - Dołóż asercję, że klauzula podaje kontakt do inspektora: `assert.ok(KLAUZULA_TEKST.includes(contact.iodEmail))`.
   - Dołącz eksporty z `polityka.ts` do tablicy zasilającej `WSZYSTKIE_STRINGI`, z komentarzem
     wyjaśniającym, że reguły kopii (emoji, myślnik, półpauza, jedno źródło adresów) są JEDNYM
     kontraktem dla całej publicznej prozy, a nie kontraktem jednego pliku. Bez tego tekst
     klientki byłby jedynym publikowanym tekstem bez bramki.

6. `tests/polityka-prywatnosci.spec.ts`: przepisz z kontraktu zaślepki na kontrakt prawdziwej
   strony. Nagłówek pliku ma powiedzieć wprost, że zaślepka przestała istnieć 2026-08-27.
   Przypadki:
   - 200, dokładnie jeden `h1`, `h1` o treści `Polityka prywatności (RODO)`.
   - `noindex` nadal obecny.
   - axe bez naruszeń dla `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.
   - Oba nagłówki `h2` widoczne, w tej kolejności: najpierw sekcja żłobkowa, potem formularzowa.
   - Hierarchia bez przeskoków: zbierz poziomy wszystkich nagłówków i sprawdź, że kolejny nigdy
     nie jest większy od poprzedniego o więcej niż jeden i że nie ma `h4` ani niżej.
   - Zdanie otwierające klauzulę administratora renderuje się dosłownie.
   - Strona niesie klauzulę formularzy: widoczny `h3` „Odbiorcy danych" oraz zdanie o kopii dla
     Urzędu Gminy w Stromcu.
   - Adres IOD widoczny na stronie (kontrola dodatnia) ORAZ brak adresu kopii dla urzędniczki
     w `page.content()` (kontrola ujemna). Oba w jednym przypadku, żeby ujemna nie mogła przejść pusta.
  </action>

  <verify>
    <automated>lsof -ti tcp:4173 | while read -r p; do kill "$p"; done; npm run check && npm run test:unit && npx playwright test tests/polityka-prywatnosci.spec.ts tests/nav.spec.ts</automated>
    <automated>grep -q 'PLACEHOLDER' src/lib/content/forms.ts && grep -n 'PLACEHOLDER' src/lib/content/forms.ts</automated>
    <automated>if grep -rniE 'kamila[._[:space:]]?dobosz@' src/lib/content src/routes; then echo 'BRAMKA: adres kopii wyciekl do tresci publicznej'; exit 1; fi</automated>
  </verify>

  <done>
`/polityka-prywatnosci` jest prawdziwą stroną: jeden `h1`, dwie sekcje `h2` z jawnie
rozgraniczonym zakresem, bloki klauzul jako `h3`, hierarchia bez przeskoków, axe czysty,
`noindex` na miejscu. Tekst klauzuli formularzy pochodzi z jednego eksportu, nie z kopii.
`iod@ugstromiec.pl` jest widoczny na stronie i podany pod każdym formularzem, a jedynym
jego źródłem jest `contact.iodEmail`. Znacznik PLACEHOLDER przy IOD nadal istnieje i mówi
o brakującym imieniu i nazwisku. Adres kopii dla urzędniczki nie występuje ani w treściach,
ani w trasach. `npm run check`, `npm run test:unit` oraz oba pliki Playwrighta są zielone.
  </done>
</task>

<task type="auto">
  <name>Zadanie 3: dokumenty stanu faktycznego dogonione, archiwum nietknięte (D-1, D-2, D-3)</name>
  <files>.claude/CLAUDE.md, docs/dev-env.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/STATE.md</files>

  <action>
Osiem dokumentów twierdzi dziś rzeczy, które przestały być prawdą. Każdy z nich jest
dokumentem STANU FAKTYCZNEGO i musi zostać dociągnięty. Edytuj adresowo, nigdy zamiataniem.

1. `.claude/CLAUDE.md`
   - Linia 24 („Email"): nowy adres odbiorcy.
   - Linia 37 („Recipient mailbox"): przepisz cały punkt. ZAKAZ zmiany odbiorcy ZNIKA, bo
     jego przesłanka wygasła: adres `zlobek@` nigdy nie istniał, a placówka podała prawdziwy
     2026-08-27. Nowy punkt mówi: odbiorcą jest `publicznyzlobek@ugstromiec.pl`, kopia `cc`
     idzie na adres pracownicy Urzędu i jest ujawniona w klauzuli, ukryta kopia zapasowa
     ZOSTAJE do czasu udowodnionego dostarczenia, a dowodem jest jedno wysłanie formularza
     po wdrożeniu, bez deployu.

2. `docs/dev-env.md` (dziś linia 249): akapit o nieistniejącej skrzynce przepisz na stan
   z 2026-08-27, z tą samą treścią co punkt wyżej.

3. `.planning/PROJECT.md`: wszystkie trzy wystąpienia (m.in. „Form recipient" w linii 52
   i punkt „Email sending"). Adres nowy; dopisz jednym zdaniem, że wcześniejszy nigdy nie
   istniał jako skrzynka i został zastąpiony 2026-08-27.

4. `.planning/REQUIREMENTS.md`
   - FORM-01 (linia 68): adres nowy, pozycja NADAL NIEODHACZONA. Nota przepisana: przyczyna
     odbicia usunięta, brakuje jednego żywego testu dostarczenia po wdrożeniu.
   - FORM-02 (linia 69): „sends only to the fixed, hard-coded żłobek address" jest już
     nieprawdą, bo odbiorcy są dwaj. Nowa nota: dwa twardo zakodowane adresy, żaden nie
     pochodzi z żądania, plus niezmieniona ukryta kopia zapasowa. Reszta noty (żywe
     dosprawdzenie limitu) zostaje.
   - LEGAL-02 (linia 77): strona jest już napisana i opublikowana (ten szybki task, nie faza 6),
     adres IOD podany; do zamknięcia brakuje wyłącznie imienia i nazwiska inspektora.
     Pozycja pozostaje NIEODHACZONA.
   - Linia 163 (nota stopki): adres skrzynki i zawężenie oczekiwania na IOD do samego nazwiska.

5. `.planning/ROADMAP.md`
   - Linia 311 (faza 6, kryterium 2): z pięciu klas treści zastępczej „the IOD contact" zawęź
     do samego imienia i nazwiska inspektora. Dopisz, że Polityka prywatności została napisana
     wcześniej, w szybkim zadaniu 260827-bfa, więc fazie 6 zostaje sama Deklaracja dostępności.
   - Linia 350 (faza 7, kryterium 2): nowy adres.
   - Linia 351 (faza 7, kryterium 3): to samo zawężenie IOD co w linii 311.
   - Linia 365: wiersz „Exact recipient email" przepisz na stan z 2026-08-27, z zaznaczeniem,
     że poprzednio potwierdzony adres nigdy nie istniał jako skrzynka.
   - Linia 366: nowy adres w prośbie do Gminy IT.
   - Linia 381 (notatki wdrożeniowe fazy 4): „recipient hard-coded to ..." na dwóch odbiorców.
   - Linia 384 (wiersz „Koordynator dostępności / IOD contact details"): adres IOD dostarczony
     2026-08-27, brakuje nazwiska; koordynator bez zmian.

6. `.planning/STATE.md`
   - Linia 189 (decyzja o rozdziale domen): nowy adres skrzynki docelowej.
   - Linia 287 (miękka prośba do Gminy IT): nowy adres.
   - Linia 298 (blokada skrzynki): przepisz. Zakaz zmiany odbiorcy zniesiony 2026-08-27,
     odbiorca zmieniony, kopia `cc` dodana i ujawniona, ukryta kopia zapasowa nadal na miejscu,
     dostarczenie NADAL nieudowodnione.
   - Do sekcji Blockers dopisz DWA otwarte pytania do klientki: (a) imię i nazwisko inspektora
     ochrony danych, bez którego LEGAL-02 nie może się zamknąć; (b) rozbieżność, kto jest
     administratorem, „podmiot prowadzący" z jej tekstu wobec „Publiczny Żłobek w Stromcu,
     jednostka organizacyjna Gminy Stromiec" z klauzuli formularzy. Obie wersje są dziś
     opublikowane w swoich sekcjach i to jest świadome (D-3).

7. NIE DOTYKAJ: `.planning/DESIGN-BANK.md`, `.planning/research/*`, wszystkiego pod
   `.planning/phases/` i pod `.planning/quick/` poza katalogiem tego zadania. To migawki.
  </action>

  <verify>
    <automated>if grep -rlE '(^|[^a-z])zlobek@ugstromiec\.pl' .claude docs .planning --include='*.md' | grep -vE '^\.planning/(phases|research|quick)/|^\.planning/DESIGN-BANK\.md'; then echo 'BRAMKA: stary adres w dokumencie stanu faktycznego'; exit 1; fi</automated>
    <automated>grep -q '^- \[ \] \*\*FORM-01\*\*' .planning/REQUIREMENTS.md && grep -c 'publicznyzlobek@ugstromiec.pl' .planning/REQUIREMENTS.md</automated>
    <automated>if ! grep -rlE '(^|[^a-z])zlobek@ugstromiec\.pl' .planning/research .planning/DESIGN-BANK.md; then echo 'BRAMKA: ktos przepisal migawke historyczna'; exit 1; fi</automated>
    <automated>npm run lint</automated>
  </verify>

  <done>
Żaden dokument stanu faktycznego (`.claude/CLAUDE.md`, `docs/dev-env.md`, `PROJECT.md`,
`REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`) nie niesie już starego adresu ani zakazu
zmiany odbiorcy; wszystkie migawki historyczne są nietknięte. FORM-01 nadal ma pustą
kratkę, a jego nota opisuje jedyny brakujący dowód. LEGAL-02 czeka wyłącznie na nazwisko
inspektora. STATE.md niesie oba pytania do klientki. `npm run lint` przechodzi.
  </done>
</task>

</tasks>

<threat_model>
## Granice zaufania

| Granica | Opis |
|---------|------|
| przeglądarka rodzica → `/api/kontakt`, `/api/rekrutacja` | ciało żądania jest niezaufane i nie może wpłynąć na odbiorców |
| kod projektu → publiczny HTML | wszystko, co trafi do eksportowanego tekstu, jest publikowane i indeksowalne po fazie 7 |
| projekt → Resend | ładunek z danymi osobowymi opuszcza EOG i podlega obowiązkowi ujawnienia |

## Rejestr STRIDE

| ID | Kategoria | Komponent | Waga | Dyspozycja | Środek zaradczy |
|----|-----------|-----------|------|------------|-----------------|
| T-bfa-01 | Information disclosure | `CC` w `mailer.ts` | medium | mitigate | Imienny adres urzędniczki żyje wyłącznie w module serwerowym; test jednostkowy sprawdza jego nieobecność w każdym eksportowanym tekście (import stałej, nie drugi literał), a Playwright w HTML `/polityka-prywatnosci` |
| T-bfa-02 | Tampering | `zbudujPayload` | high | mitigate | Ładunek pozostaje jawnym literałem bez rozwijania ciała żądania; `KLUCZE_PAYLOAD` przypina zamknięty zestaw siedmiu kluczy, a oba testy końcówek podrabiają `cc` i sprawdzają, że odbiorcy się nie zmienili |
| T-bfa-03 | Repudiation | zmiana `TO` na skrzynkę bez dowodu dostarczenia | high | mitigate | `BCC` i akapit „Tymczasowa kopia zapasowa" zostają jako para; FORM-01 nieodhaczone; żywy test dostarczenia zapisany jako otwarta pozycja w STATE.md |
| T-bfa-04 | Information disclosure (RODO art. 13) | blok „Odbiorcy danych" | high | mitigate | Nowy odbiorca ujawniony w klauzuli w tym samym zadaniu, w którym powstaje stała `CC`; asercja jednostkowa nie pozwala im się rozjechać (04-RESEARCH Pitfall 8) |
| T-bfa-05 | Tampering (supply chain) | brak | low | accept | Zadanie nie instaluje ani nie aktualizuje żadnego pakietu: `package.json` i `package-lock.json` nie są w `files_modified`, więc bramka legalności pakietów nie ma przedmiotu |
</threat_model>

<verification>
Bramka końcowa, po wszystkich trzech zadaniach, dokładnie w tej kolejności i z wcześniejszym
zabiciem procesu na porcie 4173 (żywy `wrangler` jest przez Playwrighta przejmowany i mierzyłby stary build):

```
lsof -ti tcp:4173 | while read -r p; do kill "$p"; done
npm run check && npm run lint && npm run test:unit && npm run test
```

Pre-commit uruchamia wyłącznie dwie pierwsze pozycje, a `test:unit` nie ma żadnej bramki
automatycznej, więc musi pójść ręcznie. Jeśli `git commit` przez narzędzia GSD przekroczy
limit czasu, commituj zwykłym `git commit` (udokumentowana właściwość tego repozytorium).

Sprzątanie przed lintem: jeśli w drzewie pojawiły się `.playwright-mcp/` albo zrzuty ekranu
w katalogu głównym, usuń je, bo `prettier --check .` się o nie potyka.
</verification>

<success_criteria>
1. Rodzic widzi na każdej powierzchni `publicznyzlobek@ugstromiec.pl`, a starego adresu nie ma
   w kodzie, testach, skryptach ani w dokumentach stanu faktycznego.
2. Każde zgłoszenie idzie do żłobka z kopią do Urzędu Gminy i z niezmienioną ukrytą kopią
   zapasową, a klauzula mówi o tym wprost.
3. Adres pracownicy Urzędu nie jest opublikowany nigdzie, i pilnują tego dwie bramki
   z kontrolą dodatnią.
4. `/polityka-prywatnosci` jest prawdziwą stroną prawną: dwie rozłączne sekcje, jedno źródło
   klauzuli formularzy, jeden `h1`, hierarchia bez przeskoków, axe czysty, `noindex` na miejscu.
5. `iod@ugstromiec.pl` jest opublikowany w obu miejscach, a znacznik PLACEHOLDER zawężony
   do brakującego imienia i nazwiska.
6. FORM-01 nadal nieodhaczone; LEGAL-02 czeka już tylko na nazwisko inspektora.
7. Pełna bramka (`check`, `lint`, `test:unit`, `test`) zielona.
</success_criteria>

<report_to_user>
Raport końcowy MUSI zawierać dwa pytania do klientki, obu NIE rozstrzygamy w kodzie:

1. **Imię i nazwisko inspektora ochrony danych.** Podany jest sam adres, a art. 11 ustawy
   z 10 maja 2018 r. o ochronie danych osobowych wymaga udostępnienia także imienia i nazwiska.
   To jedno z dwóch nazwisk, na które czeka faza 7 (drugie to koordynator dostępności).
2. **Kto jest administratorem.** Jej tekst mówi „podmiot prowadzący Publiczny Żłobek w Stromcu",
   istniejąca klauzula formularzy mówi „Publiczny Żłobek w Stromcu, jednostka organizacyjna
   Gminy Stromiec". Przy ustawie o opiece nad dziećmi do lat 3 podmiotem prowadzącym żłobek
   publiczny jest gmina, więc oba zdania mogą wskazywać dwa różne podmioty. Obie wersje są
   opublikowane w swoich sekcjach; uzgodnienie należy do niej, nie do nas.

Dodatkowo odnotuj, że dostarczenie na nowy adres nadal NIE jest udowodnione: potrzebne jest
jedno wysłanie formularza po wdrożeniu i zajrzenie do skrzynki, bez żadnego deployu.
</report_to_user>

<output>
Po wykonaniu utwórz `.planning/quick/260827-bfa-mail-kamili-2026-08-27-publicznyzlobek-u/260827-bfa-SUMMARY.md`
oraz odpowiedź dla klientki w `260827-bfa-ODPOWIEDZ.md` (precedens zadania 260824-qqa), po polsku,
bez emoji i bez myślników.
</output>
