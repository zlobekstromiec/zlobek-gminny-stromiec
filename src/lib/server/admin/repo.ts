// Repository write constants and the commit message builder (Phase 04.1, Plan
// 04.1-04; D-04, D-06, D-07).
//
// Everything here is a module constant that NO request can influence, mirroring
// the FROM, TO and BCC constants in src/lib/server/forms/mailer.ts. The reason is
// the same in both files: the destination of a side effect that leaves the system
// must not be reachable from user input. There the destination is a mailbox; here
// it is a branch of a PUBLIC repository, and a request that could choose its own
// repository or branch would be a write primitive rather than a save button.
//
// Nothing here logs. The only human-supplied value that reaches git history is the
// editor handle, and it is scrubbed twice before it gets there.

/** The one repository the panel may write to (D-08: the App is installed on it
 *  and on nothing else, so this constant and the App's installation agree). */
export const REPO = 'zlobekstromiec/zlobek-gminny-stromiec';

/** The one branch the panel may write to. Direct publish to main, no draft or
 *  editorial workflow (02 D-20, restated in 04.1-CONTEXT.md). */
export const GALAZ = 'main';

/** The GitHub REST API version sent on every request from this directory.
 *
 *  P-11, decided 2026-08-16 and recorded here so a future reader knows it was a
 *  choice rather than a copy: GitHub's own docs page currently renders a newer
 *  date as its example value, while this pinned version remains accepted and is
 *  the widely deployed one. Either value works; OMITTING the header is the real
 *  risk, because an unpinned request follows whatever GitHub makes current. The
 *  literal is declared exactly once, in this file, so a version bump is a
 *  one-line change that cannot leave a stale copy behind in another module. */
export const WERSJA_API = '2022-11-28';

/** GitHub rejects API requests that arrive without a user agent, so this is not
 *  decoration. A fixed, non-personal string: it appears in GitHub's own logs and
 *  must never carry a staff name for the same reason the commit message must not
 *  (D-02, D-04). */
export const AGENT = 'zlobek-panel-redakcyjny';

/** Base URL of the Git Data API for this repository. The simple Contents API is
 *  deliberately never used: it commits one file at a time, so an aktualnosc with
 *  a cover photo would be two commits, two Pages builds and a window in which the
 *  post is live without its picture (D-07). */
export const API_REPO = `https://api.github.com/repos/${REPO}`;

/** Used when the handle scrubs down to nothing. An anonymous but present editor
 *  is better than an empty parenthesis, because the message is the only record of
 *  who changed what. */
const UCHWYT_ZAPASOWY = 'redaktor';

const MAKS_UCHWYT = 32;
const MAKS_OPIS = 120;

/** Conservative on purpose: lowercase ASCII letters, digits, dot, underscore and
 *  hyphen. Everything else, including the at sign, every whitespace character and
 *  every diacritic, is removed rather than transliterated. A commit message lands
 *  in the history of a PUBLIC repository and cannot be taken back, so this is the
 *  wrong place to be generous about what an input may contain. */
function bezpiecznyUchwyt(uchwyt: string): string {
	const oczyszczony = uchwyt
		.toLowerCase()
		.replace(/[^a-z0-9._-]/g, '')
		.slice(0, MAKS_UCHWYT);
	return oczyszczony === '' ? UCHWYT_ZAPASOWY : oczyszczony;
}

/** The description is panel-authored text (for example the title of the entry
 *  that was edited), so it keeps its punctuation and its Polish characters. Only
 *  the things that would corrupt or poison a one-line commit subject are taken
 *  out: any control character or line break, which would turn the subject into a
 *  body, and the at sign, which is the one character that can turn a title into
 *  something that reads as an address. */
function bezpiecznyOpis(opis: string): string {
	return (
		opis
			// Written with unicode escapes rather than the literal bytes: a raw NUL or
			// DEL inside a source file survives no round trip through an editor, a diff
			// or a patch reliably, and a silently corrupted character class here would
			// let a line break into a commit subject.
			// eslint-disable-next-line no-control-regex
			.replace(/[\u0000-\u001f\u007f]+/g, ' ')
			.replace(/@/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, MAKS_OPIS)
	);
}

/**
 * Builds the D-04 commit subject: `tresc(<zakres>): <opis> (edytor: <uchwyt>)`.
 *
 * One machine identity authors every commit, and the person behind a change is
 * named by a short non-personal handle. A full e-mail address must never reach a
 * commit author field or a commit message, for the same reason the allowlist is a
 * secret rather than a committed file (D-02): the repository is PUBLIC, git
 * history is permanent, and a public body publishing staff addresses is both a
 * harvesting target and a data-protection problem.
 *
 * The absence of an at sign is enforced twice on purpose: once by the character
 * class in `bezpiecznyUchwyt` plus the removal in `bezpiecznyOpis`, and once by
 * the assertion below. Two checks for one property is deliberate duplication
 * where the failure is irreversible. The assertion throws rather than silently
 * repairing, because a save that cannot be described safely must not happen at
 * all.
 */
export function komunikatCommita(zakres: string, opis: string, uchwyt: string): string {
	const bezpiecznyZakres = zakres.toLowerCase().replace(/[^a-z0-9-]/g, '');
	const komunikat = `tresc(${bezpiecznyZakres}): ${bezpiecznyOpis(opis)} (edytor: ${bezpiecznyUchwyt(uchwyt)})`;
	if (komunikat.includes('@')) {
		throw new Error('komunikat commita: znak zabroniony po oczyszczeniu');
	}
	return komunikat;
}
