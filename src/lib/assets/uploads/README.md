# Facility image uploads (panel upload target, Vite-processed)

Images here are optimized at build by `@sveltejs/enhanced-img` (AVIF/WebP srcset,
width/height to prevent CLS). This is where the editorial panel at `/admin` writes
every photo an editor attaches: news covers named after the entry's filename stem
(04.1-07) and the O nas facility images named `obiekt-` plus a slug of the
description (04.1-09). Document files (PDF/DOC/DOCX) live in `static/dokumenty/`
instead, because they are served verbatim rather than processed (Pitfall 4).

A file here whose name does NOT carry one of those two panel-generated shapes was
placed by hand, and the panel deliberately refuses to overwrite or delete it.

<!-- PLACEHOLDER: sala-zabaw.jpg and plac-zabaw.jpg are generated brand-tint
     placeholders (D-04): environment-only, zero identifiable people, zero EXIF.
     Replace with real, wizerunek-consent-cleared facility photos before launch
     (Phase 6). The alt text in src/lib/content/o-nas.json describes the
     environment only, never people. -->
