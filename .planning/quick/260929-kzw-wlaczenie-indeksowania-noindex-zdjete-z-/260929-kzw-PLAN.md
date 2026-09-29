---
zadanie: 260929-kzw
tytul: Wlaczenie indeksowania strony publicznej
type: quick
tasks: 1
autonomous: true
tryb: gsd-fast (edycja bezposrednia, bez planera i wykonawcy)
---

# Włączenie indeksowania (2026-09-29)

Dyrektor zapytała 2026-09-29, czy strona może być już widoczna w Google; użytkownik
zdecydował: włączamy. Do tej pory obowiązywała decyzja D-11 z fazy 1: `noindex` w każdej
publicznej trasie i `Disallow: /` w robots.txt, bo strona żyła na *.pages.dev. Domena
własna działa od 2026-08-14, więc przesłanka D-11 wygasła.

## Zadanie 1: przełącznik

- `Seo.svelte`: `noindex` domyślnie `false`; canonical, `og:url`, `og:image` i
  `twitter:image` ABSOLUTNE na `siteUrl` (nowa stała w `site.ts`), żeby alias *.pages.dev,
  serwujący ten sam HTML, wskazywał domenę własną zamiast z nią konkurować.
- `admin/+layout.svelte`: `noindex` jawnie (panel zostaje poza wyszukiwarkami, T-04.1-14).
- `polityka-prywatnosci/+page.svelte`: ręczny `noindex` zdjęty (pełna klauzula ma być
  znajdowalna). `deklaracja-dostepnosci` ZOSTAJE noindex: stub do przebudowy w fazie 6.
- `static/robots.txt`: `Disallow: /admin`, `Allow: /`, `Sitemap:` na domenie własnej.
- `static/sitemap.xml`: osiem stron sekcji na domenie własnej, bez wpisów aktualności
  (zmienny zbiór, roboty docierają do nich z /aktualnosci) i bez deklaracji.
- Testy: cztery asercje `noindex` na trasach publicznych odwrócone (home, o-nas, cennik,
  polityka); nowy `tests/indeksowanie.spec.ts` pinuje robots.txt, sitemap (każdy adres
  odpowiada 200) i absolutny canonical na trzech trasach. Asercje `noindex` dla panelu i
  deklaracji nietknięte.

Weryfikacja: `npm run check && npm run lint && npm run test:unit && npm run test`.
Poza repozytorium: Google potrzebuje kilku dni do dwóch tygodni na pierwsze indeksowanie;
zgłoszenie sitemap w Google Search Console wymaga weryfikacji domeny (rekord DNS), do
zrobienia ręcznie przez użytkownika.
