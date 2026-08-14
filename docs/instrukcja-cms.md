# Instrukcja obsługi systemu redakcyjnego (CMS)

Publiczny Żłobek w Stromcu, panel redakcyjny pod adresem `/admin`

Ten dokument jest przeznaczony do wydruku. Prowadzi krok po kroku przez logowanie,
edycję treści strony O nas, edycję planu dnia oraz dodawanie, zamianę i usuwanie
dokumentów. Na końcu znajduje się lista kontrolna weryfikacji.

Uwaga o języku: panel jest po polsku, łącznie z przyciskami i menu edytora
(polskie tłumaczenie programu Sveltia jest wczytywane lokalnie). Tłumaczenie
programu nie jest jeszcze kompletne, więc pojedyncze napisy mogą pozostać po
angielsku. Tłumaczenia najważniejszych przycisków znajdziesz w sekcji
"Język i wygląd edytora".

---

## 1. Logowanie

1. Otwórz w przeglądarce adres strony i dopisz na końcu `/admin`, na przykład
   `https://zlobek-gminny-stromiec.pages.dev/admin`.
2. Kliknij przycisk logowania. Otworzy się okienko serwisu GitHub.
3. Zaloguj się swoim kontem GitHub (każda osoba redagująca ma własne konto,
   dzięki czemu widać, kto wprowadził daną zmianę).
4. Zezwól aplikacji na dostęp. Po chwili wróci widok panelu z listą sekcji:
   O nas, Plan dnia oraz Dokumenty.

Jeśli logowanie się nie powiedzie, zamknij okienko i spróbuj ponownie. Gdy problem
się powtarza, zgłoś to osobie technicznej (konto musi mieć dostęp do repozytorium).

<!-- PLACEHOLDER: screenshot - ekran logowania i okno GitHub (do wykonania w Zadaniu 3) -->

---

## 2. Edycja strony O nas

W panelu wybierz sekcję "O nas". Możesz edytować następujące pola:

- Wprowadzenie: krótki tekst na górze strony.
- Misja: opis misji żłobka. Dozwolone jest pogrubienie i wstawianie odnośników.
- Wartości: lista wartości. Każda pozycja ma tytuł i krótki opis. Nowy wiersz
  dodajesz przyciskiem dodawania na dole listy.
- Kadra: opis: ciepły opis zespołu (kwalifikacje, podejście). Bez nazwisk.
- Liczba opiekunek oraz Personel pomocniczy (liczba): wpisz liczby.
- O budynku: opis budynku, sali i placu zabaw.
- Zdjęcia (budynek, sala, plac zabaw): dodaj zdjęcia obiektu. Do każdego zdjęcia
  wpisz krótki opis alternatywny (alt) dla osób korzystających z czytników ekranu.

Ważne: zdjęcia nie mogą przedstawiać osób (dzieci ani personelu). Publikujemy
wyłącznie zdjęcia budynku, sal i placu zabaw, bez wizerunku osób.

Po zakończeniu edycji zapisz zmiany przyciskiem "Zapisz".

<!-- PLACEHOLDER: screenshot - formularz O nas z polskimi etykietami -->

---

## 3. Plan dnia

W sekcji "Plan dnia" edytujesz wspólny plan dnia (te same dane pokazują się na
stronie O nas). Każdy wiersz ma dwie kolumny:

- Godziny: na przykład `8:00 - 9:00`.
- Opis: co dzieje się w tym czasie.

Aby dodać nowy punkt, użyj przycisku dodawania wiersza. Aby zmienić kolejność,
przeciągnij wiersz. Po zakończeniu zapisz zmiany.

<!-- PLACEHOLDER: screenshot - lista wierszy planu dnia -->

---

## 4. Dokumenty

Sekcja "Dokumenty" to lista plików do pobrania (regulaminy, statut, karty zapisu,
klauzule RODO). Każdy dokument to osobny wpis.

### Dodawanie nowego dokumentu

1. W sekcji "Dokumenty" kliknij przycisk tworzenia nowego wpisu (New / Nowy).
2. Wypełnij pola:
   - Nazwa dokumentu: czytelna nazwa po polsku (nie nazwa pliku).
   - Kategoria: wybierz z listy (Rekrutacja, Statut i uchwały, RODO). Lista jest
     stała, nie da się wpisać własnej kategorii.
   - Plik: prześlij plik PDF, DOC lub DOCX.
   - Wersja z dnia: wybierz datę wersji dokumentu (format DD.MM.RRRR).
   - Źródło (BIP), opcjonalnie: odnośnik do dokumentu w BIP, jeśli istnieje.
3. Zapisz wpis.

### Zamiana pliku w istniejącym dokumencie

1. Otwórz wpis dokumentu z listy.
2. W polu Plik usuń dotychczasowy plik i prześlij nowy.
3. Zaktualizuj pole "Wersja z dnia", aby odzwierciedlało datę nowej wersji.
4. Zapisz wpis.

### Usuwanie dokumentu

1. Otwórz wpis dokumentu z listy.
2. Użyj funkcji usuwania wpisu edytora (przycisk "Delete", po polsku Usuń).
3. Potwierdź w oknie, które pokaże program. Dokument zniknie ze strony po
   opublikowaniu (zobacz sekcję o opóźnieniu publikacji).

<!-- PLACEHOLDER: screenshot - lista dokumentów oraz formularz dokumentu -->

---

## 5. Aktualności: dodawanie i publikowanie wpisów

Sekcja "Aktualności" to wpisy z bieżącymi informacjami żłobka (ogłoszenia,
wydarzenia, zaproszenia). Wpisy pokazują się na stronie Aktualności, od
najnowszego na górze. Trzy najnowsze wpisy pojawiają się dodatkowo na stronie
głównej. Każdy wpis to osobny element listy.

### Dodawanie nowego wpisu

1. W sekcji "Aktualności" kliknij przycisk tworzenia nowego wpisu (New, po polsku
   Nowy).
2. Wypełnij pola:
   - Tytuł: tytuł wpisu po polsku (widoczny na liście i na stronie wpisu).
   - Data publikacji: wybierz datę wpisu (format DD.MM.RRRR). Data ustala
     kolejność na liście, wpisy są sortowane od najnowszego.
   - Zajawka: krótkie streszczenie (2-3 zdania) pokazywane na kafelku listy. Pole
     jest opcjonalne, jeśli zostawisz je puste, na kafelku pokaże się początek
     treści.
   - Treść: pełna treść wpisu. Dozwolone formatowanie to pogrubienie, odnośniki
     oraz listy (wypunktowane i numerowane). Nagłówki i zdjęcia w treści nie są
     dostępne.
   - Zdjęcie (opcjonalnie): zdjęcie nagłówkowe wpisu. Bez identyfikowalnych dzieci
     bez zgody. Zostanie zoptymalizowane automatycznie.
   - Opis alternatywny zdjęcia (alt): krótki opis zdjęcia dla osób korzystających
     z czytników ekranu (uzupełnij, gdy dodasz zdjęcie).
   - Treść zastępcza (do potwierdzenia): zostaw zaznaczone, dopóki treść wpisu nie
     została ostatecznie potwierdzona.
3. Zapisz wpis.

### Publikowanie wpisu

Zapisanie wpisu oznacza jego publikację. Nie ma osobnego trybu roboczego (wersji
szkicowej): po zapisaniu wpis trafia na stronę po ok. 2 minutach (zobacz sekcję
o opóźnieniu publikacji). Kolejność jest taka sama jak przy innych treściach:
zapisz, poczekaj ok. 2 min, odśwież stronę.

Wpis pojawia się na stronie niezależnie od pola Data publikacji. Data steruje
wyłącznie kolejnością wpisów i wyświetlaną datą. Nie ma publikacji zaplanowanej
na przyszłość: nawet jeśli ustawisz datę z przyszłości, wpis będzie widoczny od
razu po przebudowie strony.

### Poprawianie i usuwanie wpisu

Aby poprawić wpis, otwórz go z listy, wprowadź zmiany i zapisz. Poprawienie tytułu
po publikacji nie zmienia adresu wpisu: adres (URL) jest ustalany raz, w chwili
utworzenia wpisu, i pozostaje stały. Dzięki temu wcześniej udostępnione odnośniki
do wpisu nadal działają.

Aby usunąć wpis, otwórz go z listy i użyj funkcji usuwania wpisu edytora (przycisk
"Delete", po polsku Usuń), a następnie potwierdź. Wpis zniknie ze strony po
przebudowie.

Przypomnienie tłumaczeń przycisków edytora: Save to Zapisz, Publish to Opublikuj,
Delete to Usuń (pełna tabela w sekcji "Język i wygląd edytora").

<!-- PLACEHOLDER: screenshot - lista wpisów Aktualności oraz formularz nowego wpisu -->

---

## 6. Treść zastępcza (do potwierdzenia)

Każda sekcja ma pole "Treść zastępcza (do potwierdzenia)" w postaci przełącznika.
Gdy jest zaznaczone, oznacza to, że treść jest tymczasowa i czeka na potwierdzenie.

- Zostaw zaznaczone, dopóki treść nie została ostatecznie potwierdzona.
- Odznacz je dopiero wtedy, gdy treść jest gotowa do publikacji jako ostateczna.

---

## 7. Publikowanie i opóźnienie

Po zapisaniu zmiany trafiają automatycznie na stronę internetową. Publikacja nie
jest natychmiastowa: strona przebudowuje się w tle. Zwykle trwa to około 2 minut.

Kolejność jest zawsze taka sama: zapisz, poczekaj ok. 2 min, odśwież stronę.
Dopiero po odświeżeniu zobaczysz zmianę na żywo. Jeśli zmiana nie pojawia się po
kilku minutach, odśwież stronę jeszcze raz (przytrzymaj klawisz i odśwież, aby
pominąć pamięć podręczną przeglądarki).

---

## 8. Język i wygląd edytora

Panel otwiera się w jasnym, ciepłym motywie graficznym i po polsku. Motyw oraz
język można zmienić w ustawieniach edytora (menu konta, pozycja Ustawienia,
karta Wygląd). Zalecamy pozostawienie motywu jasnego.

Polskie tłumaczenie programu Sveltia nie jest jeszcze kompletne, dlatego
pojedyncze przyciski lub komunikaty mogą pozostać po angielsku. Najważniejsze
z nich:

| Przycisk (po angielsku) | Znaczenie (po polsku) |
| ----------------------- | --------------------- |
| Save                    | Zapisz                |
| Publish                 | Opublikuj             |
| Delete                  | Usuń                  |

<!-- PLACEHOLDER: screenshot - polski edytor w jasnym motywie -->

---

## 9. Weryfikacja (lista kontrolna, wykonywana na żywo)

Ta lista służy do jednorazowej weryfikacji pełnego obiegu na działającej stronie
(nie lokalnie). Przejdź kolejno przez wszystkie kroki i wykonaj zrzuty ekranu,
które wklejasz w miejsca oznaczone powyżej jako "PLACEHOLDER: screenshot".

1. Otwórz `/admin` na działającej stronie i zaloguj się kontem GitHub będącym
   członkiem organizacji `zlobekstromiec`. Potwierdź, że okno logowania GitHub
   kończy się powodzeniem i wczytuje się edytor (CMS-01).
2. Potwierdź, że edytor otwiera się w jasnym motywie, a etykiety sekcji i pól,
   podpowiedzi oraz przyciski edytora (Zapisz, Opublikuj) są po polsku (CMS-03).
   Wykonaj zrzut ekranu edytora do instrukcji.
3. Zmień tekst misji w sekcji O nas, zapisz i opublikuj. Potwierdź, że powstał
   zapis (commit) w repozytorium `zlobekstromiec/zlobek-gminny-stromiec` na
   gałęzi `main` (CMS-02).
4. Poczekaj ok. 2 min na przebudowę strony w Cloudflare, odśwież stronę `/o-nas`
   na żywo i potwierdź, że zmiana jest widoczna publicznie (CMS-02, na żywo, nie
   lokalnie).
5. Dodaj lub zamień dokument w sekcji Dokumenty i potwierdź, że pojawia się on na
   żywo na stronie `/dokumenty` po przebudowie (DOCS-02).
6. Dodaj testowy wpis w sekcji Aktualności (wypełnij Tytuł, Data publikacji oraz
   Treść), zapisz, poczekaj ok. 2 min na przebudowę i potwierdź, że wpis pojawia
   się na żywo na stronie `/aktualnosci` (a gdy należy do trzech najnowszych,
   także na stronie głównej) (NEWS-03).
7. Wklej polskie zrzuty ekranu z opisami w miejsca oznaczone w tej instrukcji
   (zastępując znaczniki "PLACEHOLDER: screenshot").
8. Zanotuj napotkane angielskie napisy (tłumaczenie programu nie jest jeszcze
   kompletne) i w razie potrzeby uzupełnij tabelę tłumaczeń w sekcji 8.
9. Potwierdź akceptację ograniczenia CMS-03 (pojedyncze angielskie napisy w
   edytorze do czasu ukończenia polskiego tłumaczenia programu) oraz przyjęcie
   do wiadomości uwagi o zależnościach: pakiety zostały zainstalowane w
   przypiętych wersjach.

Uwaga techniczna: warunki możliwe do sprawdzenia automatycznie (strona `/admin`
serwowana na żywo, `base_url` w pliku konfiguracji wskazuje na działający Worker,
reguła `/admin/*` w nagłówkach wskazuje pochodzenie Workera, brak sekretu w
repozytorium) są sprawdzane osobno. Powyższa lista obejmuje kroki, których nie da
się zautomatyzować (logowanie OAuth).
