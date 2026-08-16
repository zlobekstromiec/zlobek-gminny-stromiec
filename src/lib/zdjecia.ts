// The photo vocabulary shared by the browser island and the server (Phase 04.1, Plan
// 04.1-07; D-12, D-13).
//
// WHY IT IS NOT INSIDE src/lib/server/admin/obraz.ts, where the server half lives. The
// same reason src/lib/daty.ts and src/lib/stan-naboru.ts exist, and it has now been
// learned three times in this phase: SvelteKit refuses at build time to bundle anything
// under src/lib/server/ into client code, and the island that PRODUCES the photo needs
// the very numbers the server that ACCEPTS it is written against. A crop ratio declared
// twice is a preview that promises one framing and a card that renders another.
//
// So the numbers are declared once, here, and the server module imports and re-exports
// the ones it is documented as owning.
//
// This module carries NO visible string: nothing here is ever rendered. The Polish
// labels, hints and status lines live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts.
//
// Pure: no I/O, no clock, no imports. Safe on both sides of the boundary.

/** Cover ratio of an aktualność, matching the 16 / 9 box NewsCard already reserves, so
 *  the preview an editor approves is the framing the card and the post page render. */
export const PROPORCJA_WPISU = 16 / 9;

/** Facility photo ratio on the o nas page (D-13). Declared here rather than in Plan 09,
 *  because the island takes the ratio as a prop precisely so that plan mounts the same
 *  component instead of writing a second one. */
export const PROPORCJA_O_NAS = 4 / 3;

/** Longest edge of the re-encoded photo. Wide enough for the largest box the site ever
 *  renders a cover in at 2x, small enough that a 5 MB phone photo becomes roughly 200 to
 *  400 KB (D-12). */
export const MAKS_DLUZSZY_BOK = 1600;

/** JPEG quality of the re-encode. Measured trade-off recorded in the UI-SPEC: visually
 *  indistinguishable at this size, and about a third of the bytes of a higher setting. */
export const JAKOSC_ZDJECIA = 0.82;

/** What the native file input accepts and what the server's data URL pattern allows. One
 *  list, so the control cannot offer a type the server then refuses. */
export const TYPY_ZDJECIA = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** What the island always PRODUCES, whatever it was given. The extension the generated
 *  filename carries is tied to this in src/lib/server/admin/uploads.ts. */
export const TYP_OKLADKI = 'image/jpeg';

/** Largest original the island will even attempt to decode, matching the number the
 *  Polish refusal in src/lib/content/panel.ts quotes to the editor. A modern phone photo
 *  is 3 to 8 MB, so this leaves generous room while refusing a video or a raw file that
 *  would lock the tab up inside the decoder. */
export const MAKS_PLIKU = 15 * 1024 * 1024;
