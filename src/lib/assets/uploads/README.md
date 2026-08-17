# Photo uploads (panel upload target, Vite-processed)

Images here are optimized at build by `@sveltejs/enhanced-img` (AVIF/WebP srcset,
width/height to prevent CLS). This is where the editorial panel at `/admin` writes
every photo an editor attaches: news covers named after the entry's filename stem
(04.1-07) and gallery photos named `galeria-` plus a slug of the caption (05-06).
Document files (PDF/DOC/DOCX) live in `static/dokumenty/` instead, because they are
served verbatim rather than processed (Pitfall 4).

A file here whose name does NOT carry one of those two panel-generated shapes was
placed by hand, and the panel deliberately refuses to overwrite or delete it. That
is what the `galeria-` prefix is FOR, beyond readability: it is the ownership
marker, so the deletion rule can tell a file the panel created from one somebody
committed by hand and possibly shares with another page.

Gallery photos, their captions and their alt text live in
`src/lib/content/galeria.json` and are edited on the panel's Galeria screen; the
public page renders them in the gallery section of `/o-nas`. The facility
description on that same page is prose and still lives in
`src/lib/content/o-nas.json`, which no longer holds a photo of any kind.

<!-- PLACEHOLDER: sala-zabaw.jpg and plac-zabaw.jpg are generated brand-tint
     placeholders (D-04): environment-only, zero identifiable people, zero EXIF.
     They were placed by hand, so neither carries a panel prefix and neither can be
     deleted through the panel; sala-zabaw.jpg is also the cover of a seeded
     aktualność. Replace with real, wizerunek-consent-cleared facility photos before
     launch (Phase 6). Their alt text describes the environment only, never people. -->
