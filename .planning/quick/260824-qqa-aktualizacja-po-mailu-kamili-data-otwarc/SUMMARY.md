---
quick_id: 260824-qqa
slug: aktualizacja-po-mailu-kamili-data-otwarc
date: 2026-08-24
status: complete
commits: 7
---

# Aktualizacja po mailu Kamili z 24 sierpnia 2026

Cztery prośby z jednej wiadomości wykonane, plus jedna zdolność, której
strona nie miała: wpis może teraz nieść własną galerię zdjęć.

## Co jest zrobione

| Obszar | Było | Jest |
| ------ | ---- | ---- |
| Data otwarcia | „14 sierpnia", czas przyszły | 19 sierpnia, relacja |
| Zdjęcia z otwarcia | brak | 7 w repozytorium, wszystkie opublikowane |
| Galeria we wpisie | nie istniała | czytnik, render, ochrona przy zapisie |
| Spotkanie z rodzicami | brak | wpis: czwartek 27 sierpnia, 17:00 |
| NIP | brak | 798-148-96-29 na `/kontakt` |
| Odpowiedź do Kamili | brak | `ODPOWIEDZ.md`, gotowa do wysyłki |

## Rzecz, która była najdroższa i nie było jej widać

**Dopisanie `zdjecia` do JSON-a wpisu skasowałoby galerię przy pierwszym
zapisie redaktora.** `walidacja/aktualnosci.ts` odbudowuje zapisywany plik
klucz po kluczu z lokalnych zmiennych i nigdy nie rozprasza przesłanych
danych. Ta właśnie własność trzyma niesprawdzone pola z dala od commita, ale
ma drugą stronę: klucz, którego walidator nie zna, nie jest odrzucany ani
zgłaszany, tylko po prostu **nieobecny** w tym, co idzie do repozytorium.
Kamila poprawiłaby literówkę w tytule i sześć fotografii zniknęłoby bez
błędu, bez ostrzeżenia i bez śladu w diffie.

Repozytorium zna tę pułapkę: zadanie 260818-i5t opisało ją w D-4/D-5 i wtedy
rozwiązano ją omijaniem, czyli trzymaniem nowej treści w modułach `.ts`.
Tutaj ominąć się nie dało, bo galeria musi stać przy konkretnym wpisie.
Dlatego doszły `zGaleria` po stronie walidatora i przeniesienie tablicy
w trasie edycji, a `zOkladka` przestała ją gubić przy podmianie okładki.

Tablica pochodzi z wpisu, który trasa i tak już przeczytała z dysku, nigdy
z żądania. Panel nie ma kontrolki do galerii, więc odsyłanie jej ukrytym
polem nic by nie dało, a dałoby żądaniu możliwość wpisania ścieżek do pliku
idącego prosto do commita.

Droga zamknięta testem od końca: zapis panelu, serializacja tym samym
`serializujJson` co przy commicie, `JSON.parse` i **czytnik publiczny**.
Asercja mówi „galerię nadal widać na stronie", nie „pola są takie a takie".

## Decyzje

**D-1. Spotkanie to wpis, nie baner.** Wpis Kamila sama edytuje i kasuje
z panelu; baner byłby kodem, więc każda zmiana terminu to pull request.
Baner trzeba też zdjąć ręcznie po czwartku, a nieusunięty zostaje na każdej
podstronie jako nieaktualna treść. Wpis po prostu schodzi w dół listy.
Zasięg jest ten sam, bo strona główna i tak wyciąga najnowsze wpisy.

**D-2. Wpis o otwarciu zmienił nazwę pliku** na `2026-08-19-...`. Slug to
nazwa pliku, a nazwa pliku to URL. Strona jest `noindex` i nieogłoszona,
więc zmiana adresu nie zostawia długu w przekierowaniach.

**D-3. Wpis przeszedł z czasu przyszłego w przeszły.** Sama korekta cyfry
zostawiłaby zaproszenie na termin sprzed pięciu dni.

**D-4. Okładką jest fotografia wstęgi**, bo nie niesie żadnej rozpoznawalnej
osoby i czyta się natychmiast jako otwarcie.

**D-5. Galeria wpisu jest w panelu tylko do odczytu, ale zachowywana.**
Pełna edycja to osobne zadanie, opisane niżej.

**D-6. Zdjęcia zmniejszone do 2048 px przed commitem.** Okładka zeszła
z 5,5 MB na 779 kB. Źródło zostaje w gicie na zawsze i to ono jest klonowane.

**D-7. NIP w `contact` w `site.ts`**, cyfry gołe, grupowanie 000-000-00-00
w jedynym miejscu, które go pokazuje.

**D-8. Zgoda na wizerunek: decyzja użytkownika, publikujemy wszystkie
siedem.** Zgłoszone przed wykonaniem: `otwarcie-szatnia.jpg` pokazuje
dziecko na rękach jako temat zdjęcia, a `2249` (dziś
`otwarcie-przemowienie.jpg`) ma dziecko w tle. CLAUDE.md wymaga
udokumentowanej zgody przed startem. Użytkownik zdecydował o publikacji
całości i decyzja została wykonana. Prośba o pisemne potwierdzenie zgody
rodziców jest w `ODPOWIEDZ.md`; **pozycja jest niesiona do fazy 7**, nie
zamknięta.

**D-9. Indeksowanie bez zmian w kodzie.** Strona zostaje `noindex`
(`Seo.svelte` domyślnie) plus `Disallow: /` w `static/robots.txt`. Odpowiedź
tłumaczy dlaczego i wprost oferuje natychmiastowe odsłonięcie na jedno
zdanie od Kamili.

## Sześć zestawów testów kodowało dzisiejszą treść jako kontrakt

Ta sama klasa błędu, którą to repozytorium zna z fazy 5. Każdy poprawiony
w stronę **własności**, nie nowego literalu:

| Test | Było | Jest |
| ---- | ---- | ---- |
| `aktualnosci.spec` kolejność | pozycje dwóch tytułów z nazwy | `datetime` każdej karty, ciąg nierosnący |
| `aktualnosci.spec` wpis | stały `SEED_SLUG` w pięciu testach | najnowszy wpis odczytany z listy |
| `aktualnosci.spec` treść | konkretne zdanie z akapitu | jest wyrenderowana treść, dłuższa niż 80 znaków |
| `home.spec` | tytuł i slug wpisane z ręki | pierwsza karta głównej jest linkiem do wpisu |
| `admin-aktualnosci` lista | każdy wiersz ma odznakę zastępczą | odznaka wg pola wpisu, obie strony sprawdzone |
| `admin-aktualnosci` edycja | data i zajawka jako literały | czytane z rekordu `SEEDY` |
| `admin-zdjecia` | `main picture` ma być dokładnie 1 | `.cover-band picture` |

Ostatni jest pouczający: `main picture === 1` po cichu znaczyło „ten wpis ma
dokładnie jedną fotografię", co przestało być prawdą w chwili, gdy wpis mógł
nieść galerię. Test o okładce miał opinię o całej zawartości strony.

Kolizja nazwy pliku (T-04.1-25) celuje teraz w jedyne ziarno, którego ten
projekt nigdy nie przepisywał, żeby nie czerwieniła się przy każdej
publikacji żłobka.

## Przy okazji domknięte

**Wyszukiwanie okładki na stronie wpisu stało na gołym indeksowaniu
obiektu.** `byName` jest zwykłym obiektem, więc odpowiada na `constructor`,
`__proto__`, `toString`, `valueOf` i `hasOwnProperty` z prototypu, a `obraz`
jest sprawdzony tylko do „jest tekstem" i pochodzi z pliku edytowanego
ręcznie. Nazwa `constructor` wiązała okładkę z **funkcją**, a
`<enhanced:img>` rzucałby w środku prerenderu całej strony. To dokładnie
T-05-07-02, którego `$lib/galeria.ts` pilnuje u siebie. Teraz obie ścieżki
obrazu na tej stronie czytają tak samo, przez `Object.hasOwn`.

## Czego to zadanie NIE zrobiło, świadomie

- **Galeria wpisu nie jest edytowalna z panelu.** Dodanie, usunięcie
  i kolejność zdjęć w obrębie wpisu to prefiks i pola w `pola-wpisu.ts`,
  gałąź w walidatorze, kontrolki na ekranie wpisu, polskie etykiety
  i komunikaty w `panel.ts` oraz cztery zestawy testów. Dziś galerię tworzy
  się pull requestem. Zadanie do fazy 6 lub 7.
- **Usunięcie wpisu nie kasuje zdjęć jego galerii.** Trasa usuwania zdejmuje
  wyłącznie okładkę (`okladkaDoUsuniecia`), więc skasowanie wpisu z galerią
  zostawia pliki osierocone w `src/lib/assets/uploads/`. Bez skutku
  widocznego dla redaktora: żaden ekran panelu nie wypisuje zawartości tego
  katalogu. Do domknięcia razem z edycją galerii.
- **Indeksowanie nie zostało włączone** (D-9), czeka na decyzję Kamili.
- **Dane inspektora ochrony danych nie zostały dodane**, bo jeszcze ich nie
  ma. To jedno z dwóch nazwisk, na które czeka LEGAL-02 i cała faza 7.

## Do potwierdzenia z placówką

1. **Termin i miejsce spotkania**: czy czwartek 27 sierpnia, i czy
   w żłobku przy ul. Radomskiej 72? Adres przyjęto **założeniem**.
2. **Zgoda na wizerunek** dzieci widocznych na dwóch zdjęciach (D-8).
3. **Inspektor ochrony danych**: imię, nazwisko, kontakt.
4. **Indeksowanie**: czekać do kompletu informacji prawnych czy włączyć od razu?

## Bramki

`npm run check` 0 błędów · `npm run lint` czysty · `npm run test:unit`
620/620 · `npm run test` 434/434.

Weryfikacja wzrokowa na zbudowanej stronie przy 1280 px i 390 px: galeria
schodzi z dwóch kolumn do jednej, podpisy pod kafelkami, okładka nad
treścią, NIP w karcie danych kontaktowych.
