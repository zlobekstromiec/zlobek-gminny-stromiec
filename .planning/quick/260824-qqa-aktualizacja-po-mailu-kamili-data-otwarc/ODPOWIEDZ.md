# Odpowiedź do Kamili

Temat: **Strona żłobka: poprawki wprowadzone**

---

Dzień dobry Pani Kamilo,

bardzo dziękuję za miłe słowa. Wszystko jest już na stronie:

- data otwarcia poprawiona na 19 sierpnia, a wpis uzupełniony o przesłane zdjęcia,
- NIP dodany w zakładce Kontakt,
- ogłoszenie o spotkaniu z rodzicami: czwartek 27 sierpnia, godz. 17:00.

Proszę tylko o potwierdzenie, czy spotkanie odbywa się w żłobku. Nie było
tego w wiadomości, więc wpisałem nasz adres, a rodzice będą się tym kierować.
Na dwóch zdjęciach widać dziecko, więc proszę też upewnić się, że mają
Państwo zgodę rodziców na publikację wizerunku.

Przy okazji: NIP dodałem też w stopce, na dole każdej strony, bo tam zwykle
szuka się takich danych. Poproszę jeszcze o **REGON**, żeby komplet był
w jednym miejscu.

Co do wyszukiwarki: strona działa pod adresem **zlobekstromiec.pl**,
wystarczy wpisać ten adres w przeglądarce. W Google jeszcze jej nie ma i jest
to ustawienie celowe. Czekamy na dane inspektora ochrony danych oraz
koordynatora do spraw dostępności, bo bez nich strona nie spełnia jeszcze
wymogów dla instytucji publicznej, a Google zapamiętuje tę wersję, którą
zobaczy jako pierwszą. Lepiej więc, żeby zobaczył od razu komplet.

Jeśli jednak wolałaby Pani, żeby strona była widoczna w Google od zaraz,
proszę o jedno słowo i włączę to tego samego dnia. Adres można już teraz
swobodnie przekazywać rodzicom.

Pozdrawiam serdecznie

---

## Notatki (nie wysyłać)

- Wysłane po wdrożeniu. Zmiany są na żywo, zweryfikowane.
- Odnośnik: `https://zlobekstromiec.pl/aktualnosci/2026-08-19-uroczyste-otwarcie-zlobka`
- Włączenie indeksowania = zdjąć `noindex` (domyślne `true` w `Seo.svelte`)
  i przebudować. `static/robots.txt` NIE jest tym, co dziś blokuje: Cloudflare
  dokleja własną grupę `User-agent: *` z `Allow: /`, która wygrywa scalanie,
  więc grupa z repozytorium jest martwa. Pełny rozbiór w `SUMMARY.md`.
- Miejsce spotkania przyjęte założeniem, nie podane przez placówkę.
