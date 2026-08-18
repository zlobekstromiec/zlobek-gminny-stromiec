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

The generated brand-tint placeholders that used to sit here (D-04) are GONE. On
2026-08-18 the żłobek sent seven photographs of its own and the five that belong in the
gallery replaced them: `szatnia.jpg`, `sala-glowna.jpg`, `sala-kacik-kuchenny.jpg`,
`sala-zabawki.jpg` and `plac-zabaw-hustawki.jpg`. `szatnia.jpg` is also the cover of the
seeded aktualność, which is why the photo-island spec reads that entry's filename off the
seed instead of naming one.

NO CHILD APPEARS IN ANY OF THEM, so the wizerunek consent obligation the placeholders were
standing in for never arises for this set. That is a property of these seven files and not
a rule about the directory: a photograph with a child in it still needs a documented
consent before it is committed, and its alt text still describes the environment.

All five were placed by hand, so none carries the `galeria-` prefix and none can be deleted
through the panel. That is the ownership rule above doing its job, and it matters more now
than it did for generated placeholders: these are the żłobek's own pictures.

The two photographs used inside page layouts, the hero and the O nas teaser, deliberately
live in `src/lib/assets/foto/` instead. This directory is the panel's, and the gallery globs
it, so a page-level photograph kept here would surface in an editor's picker as though it
were a gallery tile.
