---
quick_id: 260901-duo
phase: quick-260901-duo
plan: 01
status: complete
subsystem: frontend
tags: [a11y, layout, kontakt, wcag]
date: 2026-09-01
requirements: [CONTACT-01, HOME-02, SITE-02, A11Y-01]
key-files:
  created:
    - src/lib/components/AdresEmail.svelte
    - tests/adres-email.spec.ts
  modified:
    - src/lib/components/ContactAndMap.svelte
    - src/routes/kontakt/+page.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/KontaktForm.svelte
    - src/lib/components/ZgloszenieForm.svelte
    - src/lib/components/FallbackPanel.svelte
    - .planning/STATE.md
commits:
  - 8db300f
  - 3f1ebb2
  - 557ae36
actuals:
  tokens: 21000
  tasks: 3
  commits: 3
---

# Quick 260901-duo: adres e-mail nie łamie się w środku słowa

Adres `publicznyzlobek@ugstromiec.pl` renderuje się teraz z jednego miejsca w projekcie,
łamie się wyłącznie przy małpie i mieści się w jednym wierszu w karcie kontaktowej na
stronie głównej przy 1440 i przy 1024 px.

## Co się zmieniło

**`src/lib/components/AdresEmail.svelte` (nowy)** to jedyne miejsce, które renderuje adres.
Nie przyjmuje żadnych własności i sam czyta `contact.email` z `site.ts`, więc adresu nie da
się przepisać ręcznie w miejscu wywołania (T-duo-01, T-duo-02: widoczny tekst i `href` mają
jedno źródło). Dzieli ciąg na części przed i po OSTATNIEJ małpie i renderuje POJEDYNCZY
`span.adres-email` zawierający `{przedMalpa}<wbr />{domena}` w jednej linii pliku. Gdy małpy
nie ma, renderuje cały adres bez znacznika.

Pojedynczy element opakowujący nie jest ozdobą: `.item-link` oraz `.awaria-kontakt a` są
`display: inline-flex`, więc gołe `<wbr>` stałoby się tam osobnym elementem elastycznym,
przy `flex-wrap: nowrap` trafiłoby z tekstem do jednego nieprzełamywalnego wiersza i
wypchnęło adres poza kontener, czyli dałoby poziome przewijanie zakazane przez WCAG 1.4.10.

**Sześć powierzchni** czyta to jedno źródło: karta kontaktowa strony głównej, karta na
`/kontakt`, stopka, panel awaryjny i furtki awaryjne obu wysp formularzy. Odnośniki, ich
klasy i ich `href` zostały nietknięte, więc `min-height: 44px` i zasada jednego odnośnika
`mailto:` na stronie głównej stoją. Stopka nadal renderuje adres jako zwykły tekst i
komentarz nad nią mówi teraz także, skąd bierze się znacznik.

**Karta kontaktowa** wraca od 1024 px do jednej kolumny. Siatka dwa na dwa powstała, gdy
pozycji było CZTERY; od 2026-08-18 są TRZY, więc druga kolumna drugiego wiersza i tak stała
pusta, a kosztowała adres tyle, że się nie mieścił. Zewnętrzna siatka `1fr 1.15fr` jest
nietknięta i `MapPanel.svelte` nie był otwierany.

## Zaobserwowana czerwień (wymagana przez plan)

**Zadanie 1.** `tests/adres-email.spec.ts` przed zmianą: **9 przypadków czerwonych, 2
zielone**. Sonda pomiarowa na zbudowanej stronie (skasowana po odczycie) na `/`:

| Widok | `.item-text` | Węzły tekstowe | Prostokąty na węźle | Wiersze |
|---|---|---|---|---|
| 1440 px | 198 px | 1 | **2** | 193 px + 34 px |
| 1024 px | 168 px | 1 | **2** | 167 px + 60 px |

Dwa prostokąty na JEDNYM węźle tekstowym to dokładnie złamanie w środku domeny, czyli
osierocone „ec.pl". Po zadaniu 1 oba przypadki geometryczne na `/` przeszły na zielono,
a czerwone zostały wyłącznie te, które czekały na zadanie 2.

**Zadanie 3.** Nowy przypadek „adres kontaktowy stoi w jednym wierszu" przed zmianą stylu:
**2 czerwone**, oba z komunikatem `oczekiwano <= 1, otrzymano 24`, czyli domena stała
dokładnie jeden wiersz (24 px) niżej, przy 1440 i przy 1024 px. Po zmianie oba zielone.

## Pomiary po zmianie

| Widok | `.contact-grid` | `.item-text` | Szerokość adresu | Kolumny listy | Kolumna mapy |
|---|---|---|---|---|---|
| 1440 px | 487 px | **227 px** | 227 px | 1 | 561 px |
| 1024 px | 428 px | **227 px** | 227 px | 1 | 492 px |

Użyto **wariantu preferowanego** z D-3 (jedna kolumna od 1024 px). Wariant zapasowy
(odwrócenie proporcji zewnętrznej siatki na `1.15fr 1fr`) NIE był potrzebny i mapa nie
została zwężona.

Uwaga do modelu szerokości z planu: przewidywał on 453 px i 387 px dla `.item-text`, a
zmierzone jest 227 px przy obu widokach. To nie jest rozbieżność, tylko inna wielkość:
`.item-text` jest kolumną elastyczną, która obkurcza się do treści, więc gdy dostępnego
miejsca jest DOŚĆ, jej szerokość równa się szerokości adresu. Miejsca dostępnego jest
453 px przy 1440 px (487 minus 22 px ikony i 12 px odstępu) oraz 394 px przy 1024 px, czyli
model planu był poprawny co do dostępnej przestrzeni. Przed zmianą `.item-text` było
przycięte do 198 i 168 px, i to jest ta sama liczba widziana z drugiej strony.

Szerokość kolumny mapy wynika wyłącznie z nietkniętej siatki zewnętrznej: kontener
`.contact-inner` ma `max-width: 72rem`, więc przy 1440 px treść ma 1088 px, kolumna
kontaktowa `(1088 - 40) / 2.15 = 487` px, a mapa `487 x 1.15 = 561` px. Zgadza się z
pomiarem co do piksela, więc mapa ma tę samą szerokość co przed zmianą.

## Kontrola wzrokowa i próba kopiowania (zmiana jest wizualna)

Zbudowano stronę i podano ją przez `npm run preview:test` na porcie 4173, po czym zrobiono
zrzuty sekcji kontaktowej przy 1440 i 1024 px i obejrzano je.

- **1440 px:** adres stoi w jednym nieprzerwanym wierszu, trzy pozycje kontaktowe czytają
  się jako lista jedna pod drugą, kolumna mapy niezmieniona.
- **1024 px:** to samo, adres w jednym wierszu, sekcja nie jest rozjechana wobec mapy.
- **Kopiowanie:** zakres rozpięty na adresie w karcie kontaktowej daje przy obu widokach
  `publicznyzlobek@ugstromiec.pl`, **29 znaków, bez spacji i bez dywizu**. To jest dokładnie
  to, co trafiłoby do schowka rodzica, i to jest warunek, który wykluczał `&shy;`.

## Weryfikacja

Port 4173 zabijany przed każdym przebiegiem.

| Bramka | Wynik |
|---|---|
| `npm run check` | 4411 plików, **0 błędów, 0 ostrzeżeń** |
| `npm run lint` | prettier czysty, eslint bez uwag |
| `npm run test:unit` | **644 zdanych, 0 nieudanych** |
| `npm run test` | **475 zdanych, 0 nieudanych** |

`tests/responsive.spec.ts` zielony na całej macierzy siedmiu tras i pięciu szerokości, więc
żadna trasa nie zyskała poziomego przewijania (WCAG 1.4.10, T-duo-04).

## Odstępstwa od planu

**1. [Reguła 3 - blokada] Kolejność commitów zadań 1 i 2.** Test strukturalny z zadania 1
(„każdy odnośnik pocztowy i stopka czytają jedno źródło") jest z definicji czerwony, dopóki
zadanie 2 nie podłączy pozostałych pięciu powierzchni, a reguły wykonania zabraniają
commitowania czerwonego drzewa. Wykonano więc obie zmiany, doprowadzono drzewo do zieleni i
dopiero wtedy zrobiono DWA osobne commity, po jednym na zadanie. Podział na commity jest
zgodny z planem, zielone było drzewo w chwili obu commitów.

**2. `.planning/STATE.md` poszedł do commitu dokumentacyjnego, nie do commitu zadania 3.**
Wiersz rejestru ma wskazywać SHA commitu kodu, a ten nie jest znany przed jego utworzeniem.
Tak samo zrobiono w 260824-t8n (`docs(quick-260824-t8n): STATE.md` jako osobny commit).

**3. Sondy pomiarowe.** Do zaobserwowania czerwieni i do pomiaru po zmianie użyto dwóch
tymczasowych plików `tests/_sonda-*.spec.ts`, skasowanych zaraz po odczytaniu wyniku. Nie
są częścią dostawy; do repozytorium trafiła wyłącznie bramka `tests/adres-email.spec.ts`.
Zrzuty ekranu zapisano poza repozytorium, więc `prettier --check .` nie ma czego zgłaszać.

Poza tym plan wykonano dokładnie jak napisany. Zero bramek uwierzytelnienia, zero instalacji
pakietów, zero zmian palety, typografii i tokenów, `TopBar.svelte` nietknięty (D-4).

## Znane zaślepki

Brak. Ta zmiana nie wprowadza żadnej wartości zastępczej.

## Pytanie do użytkownika (D-4, do raportu, nie do kodu)

Audyt potwierdził, że adresu e-mail **nigdy nie było w górnym pasku**. `TopBar.svelte`
renderuje wyłącznie „Czynne: ..." i używa `justify-content: space-between` przy JEDNYM
dziecku, więc prawa połowa paska jest pusta i pasek wygląda, jakby czegoś w nim brakowało.
Dodanie tam adresu byłoby nową funkcją, nie naprawą, więc nie zostało zrobione. Pytanie do
decyzji: czy prawa strona paska ma coś nieść.

## Self-Check: PASSED

- `src/lib/components/AdresEmail.svelte` FOUND
- `tests/adres-email.spec.ts` FOUND
- commit `8db300f` FOUND
- commit `3f1ebb2` FOUND
- commit `557ae36` FOUND
