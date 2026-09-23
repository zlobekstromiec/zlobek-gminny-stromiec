---
quick_id: 260923-mb0
phase: quick-260923-mb0
plan: 01
status: complete
subsystem: content
tags: [dokumenty, rekrutacja, zalaczniki, rodo, mobile]
date: 2026-09-23
requirements: [DOCS-01, RECRUIT-02, RECRUIT-05]
key-files:
  created:
    - static/dokumenty/rekrutacja-zalacznik-2.docx
    - static/dokumenty/rekrutacja-zalacznik-3.docx
    - static/dokumenty/rekrutacja-zalacznik-4.docx
    - static/dokumenty/rekrutacja-zalacznik-5.docx
    - static/dokumenty/rekrutacja-zalacznik-6.doc
    - src/lib/content/dokumenty/rekrutacja-zalacznik-2.json
    - src/lib/content/dokumenty/rekrutacja-zalacznik-3.json
    - src/lib/content/dokumenty/rekrutacja-zalacznik-4.json
    - src/lib/content/dokumenty/rekrutacja-zalacznik-5.json
    - src/lib/content/dokumenty/rekrutacja-zalacznik-6.json
  modified:
    - static/dokumenty/wniosek-o-przyjecie-dziecka.doc
    - static/dokumenty/regulamin-rekrutacji.pdf
    - static/dokumenty/rezygnacja-z-miejsca.doc
    - src/lib/content/dokumenty/rekrutacja-wniosek.json
    - src/lib/content/dokumenty/rekrutacja-regulamin.json
    - src/lib/content/dokumenty/rezygnacja-z-miejsca.json
    - src/lib/content/rekrutacja.ts
    - src/routes/rekrutacja/+page.svelte
    - src/routes/+page.server.ts
    - tests/admin-dokumenty.spec.ts
    - tests/rekrutacja.spec.ts
    - tests/home.spec.ts
commits:
  - 8beea64 feat(quick-260923-mb0): prawdziwy wniosek, regulamin i druk rezygnacji
  - a2f907a feat(quick-260923-mb0): piec zalacznikow rekrutacyjnych do pobrania
  - 7263fc9 docs(quick-260923-mb0): komentarze opisuja stan po podmianie dokumentow
metrics:
  tasks: 3
  commits: 3
  duration: ~55 min
---

# Quick 260923-mb0: poprawione dokumenty rekrutacyjne od dyrektor

Sekcja Rekrutacja ma osiem prawdziwych dokumentów zamiast dwóch atrap i jednego druku:
wniosek dla Stromca (50 KB zamiast 96 bajtów), regulamin będący zarządzeniem nr 29.2026
Wójta Gminy Stromiec (305 KB zamiast 630 bajtów), pięć załączników numerowanych 2 do 6
zgodnie z nagłówkami w plikach i z § 9 regulaminu oraz druga wersja druku rezygnacji, już
bez daty wpisanej na sztywno. Załącznik 1 został świadomie wstrzymany. Przy żadnym
dokumencie w sklepie nie ma już znacznika treści zastępczej.

## Co powstało

| Pozycja | Plik | Wersja | Źródło |
|---|---|---|---|
| Regulamin rekrutacji (zarządzenie nr 29.2026 Wójta Gminy Stromiec) | regulamin-rekrutacji.pdf, 305 KB | 01.04.2026 | zarzadzenie-rekrutacja-zlobek-1775113209.pdf |
| Wniosek o przyjęcie dziecka | wniosek-o-przyjecie-dziecka.doc, 49 KB | 23.09.2026 | wniosek do żłobka Stromiec.doc |
| Załącznik 2: Oświadczenie o zatrudnieniu rodzica | rekrutacja-zalacznik-2.docx, 13 KB | 23.09.2026 | „Zalacznik 4 Zatrudnienie rodzica.docx" |
| Załącznik 3: Oświadczenie o prowadzeniu działalności gospodarczej | rekrutacja-zalacznik-3.docx, 13 KB | 23.09.2026 | „Zalacznik 5 Oswiadczenie o działalności gospodarczej.docx" |
| Załącznik 4: Oświadczenie o samotnym wychowywaniu dziecka | rekrutacja-zalacznik-4.docx, 15 KB | 23.09.2026 | „Zalacznik 3 Samotne wychowywanie.docx" |
| Załącznik 5: Oświadczenie o wielodzietności rodziny dziecka | rekrutacja-zalacznik-5.docx, 15 KB | 23.09.2026 | „oświadczenie o wielodzietności.docx" |
| Załącznik 6: Oświadczenie o korzystaniu z usług żłobka przez rodzeństwo dziecka | rekrutacja-zalacznik-6.doc, 29 KB | 23.09.2026 | „Załącznik 6 Oświadczenie o korzystaniu rodzeństwa…doc" |
| Druk rezygnacji z miejsca w żłobku | rezygnacja-z-miejsca.doc, 29 KB | 23.09.2026 | druk rezygnacji, wersja 2 |

Wersja regulaminu to **01.04.2026**, czyli data zarządzenia, a nie data dzisiejszej
podmiany: rodzic czyta w tym polu, z kiedy pochodzi treść dokumentu.

Slugi trzech istniejących wpisów i nazwy ich plików zostały nietknięte, mimo że są
historycznie rozjechane (`rekrutacja-wniosek.json` wskazuje `wniosek-o-przyjecie-dziecka.doc`).
Pięć nowych wpisów ma pole `plik` powtarzające slug, bo panel wylicza ścieżkę przy podmianie
właśnie z sluga.

## Do zgłoszenia użytkownikowi

### 1. Załącznik 1 wstrzymany: treść dotyczy innej gminy

Plik „Zalacznik 1 Oswiadczenie o zamieszkaniu.docx" ma nagłówek „OŚWIADCZENIE O
ZAMIESZKANIU NA OBSZARZE **GMINY STROMIEC**", ale w treści oświadczenia stoi dosłownie:

> „dobrowolnie oświadczam/y, że zamieszkuję/my na obszarze Gminy **Stara Błotnica**."

Rodzic podpisałby nieprawdziwe oświadczenie, i to pod rygorem odpowiedzialności karnej,
który ten sam druk przywołuje dwie linijki niżej. Dlatego załącznik 1 **nie został
opublikowany** ani jako plik, ani jako wpis. Numer 1 czeka wolny: poprawiona wersja wejdzie
bez przestawiania czegokolwiek innego. Do poprawy jest jedno zdanie, nic więcej. Jest to
zarazem kryterium warte 50 punktów, czyli najwyżej punktowane w całym naborze, więc
brakuje akurat tego oświadczenia, którego potrzebuje każdy wnioskujący rodzic z gminy.

### 2. Nazwy plików kłamią, nagłówki nie

Trzy załączniki przyszły pod numerem innym niż ten w ich własnym nagłówku:

| Nazwa pliku | Numer w nagłówku wewnątrz pliku | Opublikowany jako |
|---|---|---|
| Zalacznik **4** Zatrudnienie rodzica.docx | Załącznik **2** | Załącznik 2 |
| Zalacznik **5** Oswiadczenie o działalności gospodarczej.docx | Załącznik **3** | Załącznik 3 |
| Zalacznik **3** Samotne wychowywanie.docx | Załącznik **4** | Załącznik 4 |

Poszliśmy za nagłówkiem, bo nagłówki zgadzają się z tabelą kryteriów w § 8 i z listą
dokumentów w § 9 regulaminu, a nazwy plików nie zgadzają się z niczym. Każda kopia została
poprzedzona sprawdzeniem pierwszej linii ekstraktu tekstowego, a nie nazwy pliku. Warto,
żeby ktoś w Urzędzie zmienił nazwy plików u źródła, bo inaczej następna osoba przepisująca
je ręcznie pomyli numerację tak samo.

### 3. § 9 mówi „gospodarstwo rolne", dokument mówi „działalność gospodarcza"

Przy Załączniku 3 regulamin sam z sobą się nie zgadza:

- § 8 (tabela kryteriów): „prowadzą **działalność gospodarczą** — Oświadczenie — Załącznik nr 3",
- § 9 ust. 1 lit. b (lista dokumentów): „Oświadczenie o prowadzeniu **gospodarstwa rolnego**
  (Załącznik nr 3)",
- sam formularz: „OŚWIADCZENIE O PROWADZENIU **DZIAŁALNOŚCI GOSPODARCZEJ**".

Na stronie stoi tytuł z dokumentu, czyli „działalność gospodarcza", bo tak brzmi druk, który
rodzic faktycznie podpisze, i tak brzmi punktowane kryterium z § 8. Dyrektor powinna
przesądzić, które brzmienie obowiązuje, i najlepiej poprawić § 9 u źródła: dziś rodzic
prowadzący gospodarstwo rolne i nieprowadzący działalności nie wie, czy przysługuje mu
20 punktów.

### 4. Okres przechowywania nagrań nadal nierozstrzygnięty

Klauzula informacyjna o monitoringu wizyjnym (dokument 07) mówi o **7 dniach**, piktogram
monitoringu (dokument 09) o **5 dniach**. Poprawione wersje tych dwóch dokumentów nie
przyszły w tej przesyłce, więc pytanie postawione w quicku 260921-j9c pozostaje otwarte.
Oba dokumenty są opublikowane i sprzeczne ze sobą.

### 5. Regulamin a kopia strony o naborze: zgadza się, z jednym zastrzeżeniem

Porównanie zarządzenia 29.2026 z `site.ts`:

| Regulamin | Strona | Zgodność |
|---|---|---|
| § 9 ust. 2: wnioski w pok. nr 17, Urząd Gminy Stromiec, ul. Piaski 4, 26-804 | `urzad`: „Urząd Gminy w Stromcu", „ul. Piaski 4", „26-804 Stromiec", „pokój 17" | zgodne |
| § 4: godziny 8.00-15.00, decyduje data wpływu, brak drogi elektronicznej i pocztowej | krok 2 na stronie głównej: „pon.-pt. 8:00–15:00", „Nie ma możliwości złożenia wniosku drogą elektroniczną ani pocztą" | zgodne |
| § 11: składanie kompletu dokumentów 01.04.2026 – 27.04.2026 | `nabor.json` → `otwarty: true`, czyli „Nabór trwa przez cały rok", „Zapisy przyjmujemy przez cały rok, dopóki mamy wolne miejsca" | **do decyzji** |

Ostatni wiersz nie jest błędem, ale nie jest też pełną prawdą. § 7 regulaminu dopuszcza
przyjmowanie dzieci w ciągu roku szkolnego, jeżeli placówka ma wolne miejsca, więc „nabór
przez cały rok" ma podstawę. Ale nabór podstawowy na rok 2026/2027 zamknął się 27.04.2026
i strona tego nie mówi. Rodzic czytający dziś „nabór trwa" nie dowie się, że trafia na
ścieżkę wolnych miejsc, a nie do naboru z punktacją, i że następny nabór podstawowy będzie
wiosną 2027. **Tej kopii nie zmienialiśmy w tym zadaniu** — to osobna decyzja dyrektor,
razem z odpowiedzią na pytanie, czy żłobek nadal ma wolne miejsca.

### Dodatkowo, drobne, wykryte przy okazji

- **Zarządzenie ma w sobie dwa własne numery.** Strona tytułowa mówi „ZARZĄDZENIE NR
  29.2026", a nagłówek załącznika nr 1 do niego mówi „do Zarządzenia nr 01/2026 Wójta Gminy
  Stromiec z dnia 01.04.2026 r.". Opublikowaliśmy nazwę z numerem 29.2026, bo tak brzmi
  strona tytułowa, ale rozbieżność jest w samym pliku PDF i my jej nie naprawimy.
- **Pliki niosą nazwiska we właściwościach.** Nowe załączniki mają w metadanych autorów
  („Barbara", „Kamila Dobosz", a plik .doc dodatkowo „Wanda Jastrzębska"). To nie jest nowe
  zjawisko: dokumenty opublikowane 21.09 mają tam „Kamila Dobosz", „Michał Paprocki" i
  „Toshiba". Nie ruszaliśmy tego, bo czyszczenie metadanych zmieniłoby pliki przekazane
  przez Urząd, ale warto wiedzieć, że te nazwiska są publicznie dostępne razem z plikami.

## Uwagi z wykonania

**(a) Wierszy jest osiem, nie dziewięć.** Brief zapowiadał dziewięć wierszy na /rekrutacja;
jest ich osiem, bo dziewiątym byłby wstrzymany Załącznik 1.

**(b) Znaczników treści zastępczej zostało mniej, niż zakładał plan, i w innym miejscu.**
Plan przewidywał, że zostaną dwa, oba w `w-skrocie.json`. W rzeczywistości oba kafelki
w `w-skrocie.json` mają już `placeholder: false` (zdjęte wcześniej), więc po tej zmianie
w całym `src/lib/content/` zostaje **jeden** znacznik `placeholder: true` i jest nim wpis
aktualności `2026-07-15-witamy-na-nowej-stronie-zlobka.json`. Przy żadnym dokumencie nie ma
już ani jednego. Inwentarz z `tests/zastepcze.unit.ts` to potwierdza.

## Odstępstwa od planu

### 1. [Reguła 1 — błąd] Nazwy załączników łamały się w środku wyrazu przy 390 px

- **Znalezione przy:** zadanie 2, kontrola wzrokowa wymagana przez plan.
- **Objaw:** „Oświadczenie o samotnym **wychowywan / iu** dziecka", „o **wielodzietnoś / ci**
  rodziny dziecka". Meta wiersza ma `flex: none` i zajmuje około 180 px niezależnie od
  szerokości ekranu, więc przy 390 px na nazwę zostawało około 110 px, a `overflow-wrap:
  anywhere` łamał ją gdziekolwiek.
- **Przyczyna:** identyczna poprawka (dwutorowa siatka poniżej 640 px) trafiła w quicku
  260921-j9c na `/dokumenty`, ale nie na `/rekrutacja` — obie trasy mają własną kopię tych
  reguł CSS, wspólny jest tylko markup. Dopóki lista rekrutacyjna trzymała trzy krótkie
  nazwy, nie było tego widać.
- **Poprawka:** ten sam blok `@media (max-width: 639px)` w `src/routes/rekrutacja/+page.svelte`:
  nazwa dostaje cały wiersz, meta staje pod nią w tym samym torze, meta zostaje WEWNĄTRZ
  odnośnika (kontrakt D-14 nienaruszony).
- **Commit:** a2f907a.

### 2. [Reguła 3 — blokada] Asercja sekcji 10.3 zakazywała daty, która jest wersją dokumentu

- **Znalezione przy:** zadanie 2, `npx playwright test tests/rekrutacja.spec.ts` na czerwono.
- **Objaw:** test „strona nie publikuje archiwalnych terminów naboru 2026/2027" zabraniał
  ciągu `01.04.2026` w całym HTML. Regulamin jest zarządzeniem z 1 kwietnia 2026 r., więc po
  podmianie ta data stoi w metadanych wiersza jako „wersja z 01.04.2026" (oraz w
  serializowanym ładunku SvelteKit).
- **Rozstrzygnięcie:** kryterium sekcji 10.3 brzmi „archiwalny termin nie może być pokazany
  jako aktualny" i ono się nie zmieniło. Data wersji dokumentu nie jest terminem, którego
  rodzic mógłby dotrzymać, a ukrycie jej oznaczałoby kłamstwo o tym, z kiedy pochodzi
  regulamin. Zmienił się więc sposób sprawdzania: **każde** wystąpienie archiwalnej daty musi
  być wersją dokumentu (`wersja z ` albo `wersja:"`), a nie „nie może wystąpić".
- **Że to nie jest osłabienie, zostało sprawdzone doświadczalnie:** po wstawieniu ciągu
  „27.04.2026" do kopii sekcji BIP test zapala się na czerwono z nazwą daty i jej otoczeniem;
  po usunięciu sondy wraca na zielono. Plik z nagłówkiem „do NOT weaken these assertions"
  zmieniony świadomie i wyłącznie w warstwie sposobu sprawdzania.
- **Commit:** a2f907a.

Poza tymi dwiema rzeczami plan wykonany dokładnie tak, jak napisany. Zadanie 3 zmieniło
wyłącznie komentarze: `git diff` tego commita nie zawiera ani jednej linii kodu
wykonywalnego.

## Kolejność TDD (zadanie 1, tracer)

1. **RED:** asercja liczby odznak „Treść zastępcza" w kategorii Rekrutacja zmieniona z 2 na
   0 PRZED podmianą czegokolwiek. `npx playwright test tests/admin-dokumenty.spec.ts`:
   `Expected: 0, Received: 2`, 1 failed / 21 passed.
2. **GREEN:** podmienione trzy binaria i trzy wpisy. Ten sam plik: 22 passed.
3. Komentarz nad asercją przepisany, nie usunięty: jego przesłanka („żadnego z nich nie
   dostarczono dla Stromca") wygasła 2026-09-23, ale sama asercja jest jedynym miejscem w
   projekcie, które zapali się w dniu, gdy prawdziwy dokument zostanie zastąpiony atrapą.

## Weryfikacja

| Komenda | Wynik |
|---|---|
| `npm run check` | 4414 files, **0 errors, 0 warnings** |
| `npm run lint` | prettier: „All matched files use Prettier code style", eslint czysty, exit 0 |
| `npm run test:unit` | **645 pass**, 0 fail |
| `npm run test` | **489 passed** (Playwright + axe) |
| `npm run build` | **exit 0**, zero ostrzeżeń „missing file" / „invalid plik" z `readDokumenty` |

Przed przebiegiem zabity wiszący `wrangler` na porcie 4173. W katalogu głównym nie powstał
żaden zrzut ekranu ani `.playwright-mcp/`; zrzuty kontrolne leżą w scratchpadzie sesji.

Kontrola wzrokowa (zrzuty przy 1280 px i 390 px dla /rekrutacja i /dokumenty):

- osiem wierszy czyta się czysto na obu szerokościach, po poprawce mobilnej żadna nazwa nie
  łamie się w środku wyrazu,
- przycisk „Wyślij zgłoszenie" przy 1280x720 jest widoczny i klikalny (sprawdzone też
  programowo: `boundingBox` 180x50 px, `click({ trial: true })` przechodzi) — ramka opłat
  dzieli z nim blok `position: sticky`, ale lista wniosków rośnie poniżej tego bloku,
- kafel dokumentów na stronie głównej nadal ma dokładnie dwa wiersze i są to Regulamin
  rekrutacji oraz Wniosek o przyjęcie dziecka.

## Kryteria sukcesu

- [x] Osiem wpisów kategorii rekrutacja, każdy `placeholder: false`, każdy wskazuje istniejący plik.
- [x] W `static/dokumenty/` nie ma pliku mniejszego niż 5 KB (najmniejszy: 13 183 B).
- [x] Kafel na stronie głównej: dwa wiersze, regulamin i wniosek.
- [x] Panel nie pokazuje odznaki „Treść zastępcza" przy żadnym dokumencie.
- [x] Nie istnieje ani plik, ani wpis Załącznika 1.
- [x] Cały łańcuch weryfikacji zielony, `npm run build` z kodem wyjścia 0.

## Self-Check: PASSED

Wszystkie wymienione pliki istnieją na dysku, wszystkie trzy commity istnieją w `git log`
(8beea64, a2f907a, 7263fc9), a `docs/documents/` pozostaje nieśledzone i niezakommitowane.

---

## Uzupełnienie z 2026-09-23 (po południu): Załącznik 1 opublikowany

Użytkownik zdecydował, że wadliwe zdanie poprawiamy sami. W `Zalacznik 1 Oswiadczenie o
zamieszkaniu.docx` zamieniono JEDNO wyrażenie w `word/document.xml`: „Gminy Stara Błotnica"
na „Gminy Stromiec" (jedno wystąpienie, sprawdzone przed i po; nagłówek już wcześniej mówił
o Gminie Stromiec). Nic więcej w pliku nie zmieniono; archiwum i wszystkie części XML
przeszły kontrolę poprawności, a `textutil` renderuje poprawione zdanie.

Plik trafił do `static/dokumenty/rekrutacja-zalacznik-1.docx`, wpis do
`src/lib/content/dokumenty/rekrutacja-zalacznik-1.json` (nazwa „Załącznik 1: Oświadczenie
o zamieszkaniu na obszarze Gminy Stromiec", wersja 23.09.2026). Kategoria Rekrutacja ma
teraz DZIEWIĘĆ wpisów; dwa pierwsze alfabetycznie to nadal `rekrutacja-regulamin` i
`rekrutacja-wniosek`, więc kafel na stronie głównej się nie zmienił. Trzy komentarze, które
opisywały Załącznik 1 jako wstrzymany (`rekrutacja.ts`, `/rekrutacja/+page.svelte`,
`tests/home.spec.ts`), mówią teraz prawdę; przy okazji zniknął z nich myślnik długi.

Punkt 1 z listy „Do zgłoszenia użytkownikowi" jest tym samym ZAMKNIĘTY. Punkty 2 do 5
pozostają otwarte.
