// What a DOCUMENT attachment may be, on both sides of the client/server boundary
// (Phase 04.1, Plan 04.1-08; P-22, threats T-04.1-31 and T-04.1-32).
//
// WHY IT IS NOT INSIDE src/lib/server/admin/plik.ts. The same boundary
// src/lib/zdjecia.ts records for the photo pipeline, and it was learned the hard way
// three plans running: SvelteKit refuses at build time to bundle anything under
// src/lib/server/ into client code, and the file island that has to offer the accepted
// types to a native control IS client code. The server module beside the validator
// imports these and re-exports them, so exactly one declaration exists and a server
// caller still reads them from the module it is already importing.
//
// THE ALLOW-LIST IS THE WHOLE SECURITY BOUNDARY of this field. Anything committed under
// the documents directory is served verbatim from the żłobek's public site, so the set of
// things a person may attach is enumerated here and never subtracted from a wider set.
// The extension is chosen from the accepted MEDIA TYPE and never from the submitted
// filename, which is what stops the served content type from being chosen by the uploader.
//
// Pure: no I/O, no clock, no imports. This module carries NO visible string.

/** The three media types a document may be. PDF, DOC and DOCX, exactly the set the
 *  UI-SPEC's „Wybierz plik PDF, DOC lub DOCX" promises, and nothing else. */
export const TYPY_DOKUMENTU: readonly string[] = Object.freeze([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

/** The extension each accepted type is written with. LOWERCASE and fixed, so an
 *  upper-case variant is unreachable by construction and the public reader's
 *  `plik.split('.').pop().toUpperCase()` always yields one of three known labels. */
export const ROZSZERZENIA_DOKUMENTU: Readonly<Record<string, string>> = Object.freeze({
	'application/pdf': '.pdf',
	'application/msword': '.doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
});

/** Largest file an editor may attach, in bytes. Ten megabytes, which is the number the
 *  field's own hint and the refusal message both state, so the three can never disagree
 *  about what „za duży" means. */
export const MAKS_PLIKU_DOKUMENTU = 10 * 1024 * 1024;
