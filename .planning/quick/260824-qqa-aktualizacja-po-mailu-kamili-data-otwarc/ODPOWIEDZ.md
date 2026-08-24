# Odpowiedź do Kamili (projekt)

Do wysłania po wdrożeniu zmian. Temat: **Strona żłobka: poprawki wprowadzone
i pytanie o wyszukiwarkę**

---

Dzień dobry Pani Kamilo,

bardzo dziękuję za miłe słowa i za wszystkie uwagi. Wszystko, o co Pani
prosiła, jest już na stronie.

**Data otwarcia poprawiona.** Wpis mówi teraz o 19 sierpnia. Przy okazji
zmieniłem go z zapowiedzi na relację, bo w dotychczasowej formie zapraszał
na wydarzenie, które już się odbyło. Dołączyłem też przesłane zdjęcia:
fotografia wstęgi otwiera wpis, a sześć pozostałych tworzy pod nim galerię,
którą można powiększyć kliknięciem.

**NIP dodany.** Widnieje w danych kontaktowych na stronie Kontakt jako
798-148-96-29.

**Spotkanie z rodzicami ogłoszone.** Wpis podaje czwartek 27 sierpnia 2026 r.,
godzina 17:00, w żłobku przy ul. Radomskiej 72. **Proszę o potwierdzenie
dwóch rzeczy:** czy chodziło o czwartek 27 sierpnia, oraz czy spotkanie
faktycznie odbywa się w żłobku. Przyjąłem, że tak, ale nie było to napisane
wprost, a rodzice będą się tym kierować.

## Dlaczego strona nie pokazuje się w wyszukiwarce

Strona **działa i jest dostępna pod adresem zlobekstromiec.pl.** Wystarczy
wpisać ten adres w pasku przeglądarki. Jeśli natomiast szuka jej Pani przez
Google, to jeszcze jej Pani nie znajdzie, i to jest celowe ustawienie, a nie
usterka.

Strona ma w tej chwili włączoną blokadę indeksowania, czyli prośbę do
wyszukiwarek, żeby jej jeszcze nie pokazywały. Zrobiliśmy tak dlatego, że
brakuje na niej dwóch informacji, których prawo wymaga od instytucji
publicznej:

- **Deklaracja dostępności** wymaga wskazania z imienia i nazwiska
  koordynatora do spraw dostępności.
- **Klauzula informacyjna RODO** wymaga danych inspektora ochrony danych,
  czyli dokładnie tego, co obiecała Pani przesłać.

Znaczenie ma kolejność. Google zapamiętuje tę wersję strony, którą zobaczy
jako pierwszą, i potrafi ją pokazywać jeszcze przez kilka tygodni po
poprawkach. Jeśli więc odsłonimy stronę teraz, wyszukiwarka utrwali wersję
z brakami, za które odpowiada urząd, a nie tę kompletną. Dlatego moja
rekomendacja jest taka, żeby poczekać z indeksowaniem do chwili, gdy obie
informacje będą na stronie. Sądząc po Pani wiadomości, to kwestia dosłownie
kilku dni.

**To jednak Państwa decyzja, nie moja.** Jeśli wolałaby Pani, żeby strona
była widoczna w Google już teraz, proszę o jedno zdanie w odpowiedzi
i włączę indeksowanie tego samego dnia. Technicznie to drobna zmiana.

W międzyczasie adres zlobekstromiec.pl działa bez przeszkód i można go
swobodnie przekazywać rodzicom, publikować na Facebooku czy drukować na
ogłoszeniach. Blokada dotyczy wyłącznie wyszukiwarek.

## Dwie prośby

1. **Inspektor ochrony danych.** Poproszę o imię, nazwisko i adres e-mail
   (albo adres do korespondencji), gdy tylko będą Pani znane. Razem
   z koordynatorem do spraw dostępności są to ostatnie dwie rzeczy, które
   dzielą stronę od pełnej zgodności.

2. **Zgoda na wizerunek.** Na dwóch zdjęciach z otwarcia widać dziecko.
   Zgodnie z Pani decyzją zdjęcia są opublikowane. Proszę jednak
   o potwierdzenie, że żłobek dysponuje pisemną zgodą rodziców na
   publikację wizerunku, i o przechowanie jej w dokumentacji placówki.
   Gdyby takiej zgody nie było, proszę dać znać, a usunę te zdjęcia
   w kilka minut.

Zmiany są już widoczne na stronie. Zachęcam do zajrzenia i proszę śmiało
pisać, jeśli coś wymagałoby jeszcze poprawki.

Pozdrawiam serdecznie

---

## Notatki do wysyłki (nie wysyłać)

- Wysłać **po** merge do `main` i po zakończeniu wdrożenia na Cloudflare
  Pages, żeby link prowadził już do poprawionej wersji.
- Odnośnik do wklejenia: `https://zlobekstromiec.pl/aktualnosci/2026-08-19-uroczyste-otwarcie-zlobka`
- Jeśli Kamila poprosi o indeksowanie: to zadanie fazy 6/7 (LAUNCH-01).
  **W praktyce wystarczy zdjąć `noindex`** (domyślne `true` w `Seo.svelte`)
  i przebudować. Wbrew temu, co zakłada komentarz w `static/robots.txt`,
  ten plik NIE jest dziś tym, co blokuje wyszukiwarki: patrz ustalenie niżej.
- Pytanie o miejsce spotkania jest realne, nie kurtuazyjne: adres żłobka
  został przyjęty założeniem, nie podany przez placówkę.

## Ustalenie uboczne: `static/robots.txt` nie jest tym, co widzi Google

Sprawdzone na żywo 2026-08-24 na `https://zlobekstromiec.pl/robots.txt`.

Cloudflare **dokleja własny blok** „Cloudflare Managed content" NAD treścią
z repozytorium, i ten blok otwiera się własną grupą `User-agent: *`:

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
...
# Placeholder deployment on *.pages.dev — disallow ALL crawling (D-11).
User-agent: *
Disallow: /
```

Plik ma więc **dwie grupy `User-agent: *`**, jedną z `Allow: /` i jedną
z `Disallow: /`. Roboty łączą grupy o tym samym `User-agent`, a przy
sprzeczności reguł o tej samej długości ścieżki wygrywa **mniej
restrykcyjna**, czyli `Allow`. Do tego `Content-Signal: search=yes` mówi
wprost, że indeksowanie w wyszukiwarce jest dozwolone.

**Wniosek: dziś crawlerów nie powstrzymuje robots.txt, tylko wyłącznie
`<meta name="robots" content="noindex">`.** Sprawdzone: znacznik jest
obecny na stronie głównej.

To akurat jest konfiguracja FUNKCJONALNIE POPRAWNA dla celu „nie indeksuj",
i to nie przypadkiem: `Disallow` zabroniłby Google w ogóle pobrać stronę,
więc robot nigdy nie zobaczyłby `noindex` i adres mógłby mimo wszystko
trafić do wyników jako goły link. Crawlowanie dozwolone plus `noindex` to
właściwy zestaw.

Znaczenie dla planu: komentarz w `static/robots.txt` i plan fazy 6 zakładają,
że ten plik jest jedynym źródłem prawdy i że przy starcie „przełącza się go
na allow-all". To założenie jest fałszywe, bo Cloudflare i tak dokłada swoje,
a grupa z repozytorium jest dziś **martwa** (przegrywa scalanie). Do
rozstrzygnięcia w fazie 6: albo usunąć grupę `User-agent: *` z pliku
w repozytorium i świadomie oddać robots.txt Cloudflare, albo wyłączyć
zarządzany blok w panelu Cloudflare. Zostawienie dwóch sprzecznych grup jest
najgorszym z trzech wariantów, bo wygląda na kontrolę, której nie ma.
