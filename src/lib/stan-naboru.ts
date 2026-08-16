// The recruitment switch's WIRE VOCABULARY: the form control's name, the two literals
// it may carry, and the mapping to and from the stored boolean.
//
// WHY THIS IS NOT INSIDE THE VALIDATOR, where it started. The validator lives under
// src/lib/server/, and SvelteKit refuses at build time to bundle anything from that
// directory into client code. That refusal is correct and worth keeping: it is the guard
// that stops a secret or a server-only dependency being shipped to a browser. But the
// name of a form field and the two values its radios post are shared BY DEFINITION, and
// the page that renders those radios needs the identical strings the action parses. The
// two honest options were to duplicate three literals across a client file and a server
// file, or to lift them into one module both may import. Duplication is exactly the
// arrangement in which a rename breaks the save silently: the form would post `stan` to
// an action reading `state`, validation would fail, and the editor would be told to
// choose an option they had already chosen.
//
// This module is therefore deliberately tiny and deliberately NOT copy. It carries no
// visible string: nothing here is ever rendered to an editor. The Polish sentences that
// describe these states live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts, which is where they belong.
//
// Pure: no I/O, no clock, no imports. Safe on both sides of the boundary.

/** The one repository path this screen ever writes, and the one src/lib/content/ file
 *  site.ts reads the switch from. Stated here rather than inside the route, because
 *  SvelteKit permits only its own named exports from a +page.server.ts and because a
 *  path that appears in exactly one place cannot drift into a save that succeeds and
 *  changes nothing. Pinned against the real file by tests/admin-walidacja-nabor.unit.ts. */
export const SCIEZKA_NABOR = 'src/lib/content/nabor.json';

/** Name of the form control, so the page, the action and the spec read one source
 *  instead of retyping a string that has to match in three places. */
export const POLE_STAN = 'stan';

/** The only two values this action accepts. Not a boolean on the wire: two radios post a
 *  word, and „otwarty"/„zamkniety" says in the request what it means, so a stray „on" or
 *  „true" from anywhere else is refused rather than coerced. */
export const STAN_OTWARTY = 'otwarty';
export const STAN_ZAMKNIETY = 'zamkniety';

/** The value to render as the checked radio. Kept beside the literals so the page never
 *  has to know which one means which boolean. */
export function stanZWartosci(otwarty: boolean): string {
	return otwarty ? STAN_OTWARTY : STAN_ZAMKNIETY;
}
