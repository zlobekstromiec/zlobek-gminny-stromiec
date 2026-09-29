---
quick_id: 260929-kzw
phase: quick-260929-kzw
plan: 01
status: complete
subsystem: seo
tags: [seo, robots, sitemap, indeksowanie]
date: 2026-09-29
requirements: [SITE-01, SITE-05]
key-files:
  created:
    - tests/indeksowanie.spec.ts
  modified:
    - src/lib/components/Seo.svelte
    - src/lib/content/site.ts
    - src/routes/admin/+layout.svelte
    - src/routes/polityka-prywatnosci/+page.svelte
    - static/robots.txt
    - static/sitemap.xml
    - tests/home.spec.ts
    - tests/o-nas.spec.ts
    - tests/cennik.spec.ts
    - tests/polityka-prywatnosci.spec.ts
---

# Quick 260929-kzw: włączenie indeksowania

Strona publiczna jest indeksowalna od 2026-09-29 na prośbę dyrektor. Decyzja D-11 z fazy 1
(noindex plus Disallow all, bo strona żyła na *.pages.dev) jest zamknięta: jej przesłanka
wygasła 2026-08-14, gdy domena własna weszła na Pages.

## Co się zmieniło

- `Seo.svelte`: `noindex` domyślnie `false`. Canonical, `og:url`, `og:image` i `twitter:image`
  są absolutne na `siteUrl` (nowa stała w `site.ts`, jedyne źródło hosta w kodzie), więc
  alias *.pages.dev, serwujący identyczny HTML, wskazuje wyszukiwarkom domenę własną.
- Panel (`admin/+layout.svelte`) prosi o `noindex` jawnie; test T-04.1-14 bez zmian.
- `/polityka-prywatnosci` bez ręcznego `noindex`. `/deklaracja-dostepnosci` ZOSTAJE noindex
  jako stub do przebudowy w fazie 6; jej test bez zmian.
- `static/robots.txt`: `User-agent: *`, `Disallow: /admin`, `Allow: /`, `Sitemap:` na domenie.
- `static/sitemap.xml`: osiem stron sekcji na `https://zlobekstromiec.pl`, bez pojedynczych
  wpisów aktualności (zbiór zmienia się z każdym zapisem w panelu; roboty dochodzą do nich z
  /aktualnosci) i bez deklaracji.
- Testy: cztery asercje `noindex` na trasach publicznych odwrócone na „brak meta robots".
  Nowy `tests/indeksowanie.spec.ts`: robots.txt (dyrektywy, brak `Disallow: /`, Sitemap),
  sitemap.xml (każdy adres na domenie własnej i każdy odpowiada 200 na serwerze testowym,
  brak /admin) oraz absolutny canonical i og:url na trzech trasach.

## Weryfikacja

`npm run check` 4416 plików, 0 błędów, 0 ostrzeżeń; `npm run lint` czysty; `npm run test:unit`
645/645; `npm run test` 497/497 (494 plus 3 nowe). Dwa wcześniejsze biegi w tle kończyły się
masowym `net::ERR_CONNECTION_REFUSED`: serwer podglądu na :4173 ginął w trakcie, bo dwa moje
zadania w tle nakładały się na tym porcie. Bieg na pierwszym planie, po zwolnieniu portu, jest
w całości zielony. Zbudowany `index.html` niesie
`<link rel="canonical" href="https://zlobekstromiec.pl/">` i żadnego `noindex`.

Tryb gsd-fast, bez planera i wykonawcy.

## Poza repozytorium

1. Google potrzebuje zwykle od kilku dni do dwóch tygodni na pierwsze indeksowanie.
2. Google Search Console nie jest skonfigurowana. Weryfikacja domeny wymaga rekordu TXT w DNS
   (token Pages w `.envrc` nie ma uprawnień do strefy), więc to ręczny krok użytkownika w
   panelu Cloudflare; po weryfikacji zgłosić `https://zlobekstromiec.pl/sitemap.xml`.
3. JSON-LD i dane NAP (D-12) nadal odłożone.
