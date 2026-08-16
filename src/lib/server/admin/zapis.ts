// The one save orchestrator every editor screen calls (Phase 04.1, Plan 04.1-05,
// P-15; D-10, D-11, D-18).
//
// WHY THIS EXISTS AT ALL, given that src/lib/server/admin/commit.ts already writes:
// the sequence „check the bindings, mint an installation token, commit atomically,
// map the result onto the three panels of UI-SPEC Component Contract 10" is identical
// on all six editor screens of this phase. Repeated per route it would put the D-10
// refusal in six places, and that is the one branch that must never drift: a conflict
// mapped to the generic failure panel tells an editor to „try again in a moment",
// which is precisely the instruction that destroys a colleague's edit.
//
// This module composes; it does not reimplement. `zapiszAtomowo` owns the Git Data
// API sequence and the conflict detection, `tokenInstalacji` owns the JWT and the
// token cache, `komunikatCommita` owns the no-e-mail-address guarantee. Nothing here
// duplicates any of the three.
//
// IT DOES NO WORK BEFORE ITS CALLER HAS VALIDATED. The caller hands over
// already-serialized file contents, which is the enforcement of that rule rather than
// a request for discipline: there is no raw form data in this signature to validate,
// so an unvalidated save is not expressible.
//
// Secrets arrive as `platform.env` from the route. The Vite build-time env object is
// undefined at runtime on Cloudflare and produces a silent production-only failure,
// so its name is grep-banned across server code and described here rather than
// written.
//
// NOTHING HERE LOGS. Not a token, not a payload, not a path, not on the error path.
import { API_REPO, AGENT, GALAZ, WERSJA_API, komunikatCommita } from './repo.ts';
import { tokenInstalacji } from './github.ts';
import { zapiszAtomowo, type PlikDoZapisu, type WynikZapisu } from './commit.ts';

/** The env members this module reads. Declared structurally rather than as the global
 *  `Env`, so the unit suite can drive it with a plain object literal and so the module
 *  cannot quietly grow a dependency on a binding nobody listed. */
export interface SrodowiskoZapisu {
	GITHUB_APP_CLIENT_ID?: string;
	GITHUB_APP_INSTALLATION_ID?: string;
	GITHUB_APP_PRIVATE_KEY?: string;
	PANEL_DRY_RUN?: string;
}

/** The three bindings a real save cannot proceed without, in the order a reader would
 *  check them. Exported so the unit suite asserts against the list rather than
 *  retyping three strings that would then be free to drift. */
export const WYMAGANE_WIAZANIA = [
	'GITHUB_APP_CLIENT_ID',
	'GITHUB_APP_INSTALLATION_ID',
	'GITHUB_APP_PRIVATE_KEY'
] as const;

/**
 * The three outcomes a screen renders directly, one per panel of Component Contract
 * 10. A discriminated union rather than a boolean plus an optional reason, following
 * `WynikZapisu`: `konflikt` and `blad` are genuinely different instructions to an
 * editor („copy your text and reload" against „try again in a moment"), and a shape
 * that let a caller forget one of them would let the wrong instruction ship.
 */
export type WynikTresci =
	| { stan: 'zapisano'; sha: string }
	| { stan: 'konflikt' }
	/** `brakujaceWiazanie` names the binding, NEVER its value. It exists so a
	 *  misconfigured deployment is diagnosable from a unit assertion; the editor sees
	 *  the same generic Polish failure panel either way, because „the deployment is
	 *  missing GITHUB_APP_PRIVATE_KEY" is not a sentence a żłobek staff member can act
	 *  on and is a sentence an attacker would enjoy. */
	| { stan: 'blad'; brakujaceWiazanie?: string };

export interface OpcjeZapisuTresci {
	env: SrodowiskoZapisu | undefined;
	/** The short non-personal handle from `locals.editor` (D-04). Never an address. */
	uchwyt: string;
	/** Commit scope, for example `nabor`. Scrubbed again inside `komunikatCommita`. */
	zakres: string;
	/** Commit description, authored in src/lib/content/panel.ts. */
	opis: string;
	/** ALREADY SERIALIZED. See the module header. */
	pliki: PlikDoZapisu[];
	usun?: string[];
	/** The head SHA captured when the editor opened the form (D-10). Absent means the
	 *  check is SKIPPED, which is `zapiszAtomowo`'s documented behaviour and not a
	 *  default this module invents. */
	oczekiwanySha?: string;
	teraz?: number;
	fetchImpl?: typeof fetch;
	/** Injected for the unit suite, so the whole orchestration is observable as data
	 *  with no network, exactly as `obsluz()` takes its side effects. */
	mintuj?: typeof tokenInstalacji;
	zapisz?: typeof zapiszAtomowo;
}

/** The token a dry run carries. It never leaves this process: `zapiszAtomowo` returns
 *  before it is used. Obviously synthetic, so it cannot be mistaken for a credential
 *  if it ever surfaces somewhere it should not. */
const TOKEN_PROBNY = 'panel-dry-run';

/** The head SHA a dry run reports, matching the synthetic SHA `zapiszAtomowo` returns
 *  so the two halves of a harness save agree with each other. */
export const SHA_PROBNY = '0'.repeat(40);

function suchyBieg(env: SrodowiskoZapisu | undefined): boolean {
	// P-13: read at the caller's boundary, never inside commit.ts, which is what keeps
	// that module pure. The flag is bound ONLY by the preview:test harness and must
	// never become a Cloudflare Pages variable: set in production it would turn every
	// save into a silent no-op that still reports success to the editor.
	return env?.PANEL_DRY_RUN === '1';
}

/** First missing required binding, or undefined when all three are present. */
function brakujace(env: SrodowiskoZapisu | undefined): string | undefined {
	for (const nazwa of WYMAGANE_WIAZANIA) {
		const wartosc = env?.[nazwa];
		if (typeof wartosc !== 'string' || wartosc.trim().length === 0) return nazwa;
	}
	return undefined;
}

/**
 * Turn already-validated, already-serialized content into exactly one commit.
 *
 * Cheap before expensive, the ordering `src/lib/server/forms/handle.ts` establishes:
 * the binding check costs three property reads and runs before the token mint, which
 * costs a signature and a network round trip. A misconfigured deployment therefore
 * fails without spending anything, and a save that cannot be authenticated never
 * reaches GitHub at all.
 */
export async function zapiszTresc(opcje: OpcjeZapisuTresci): Promise<WynikTresci> {
	const brak = brakujace(opcje.env);
	if (brak !== undefined) return { stan: 'blad', brakujaceWiazanie: brak };

	const probny = suchyBieg(opcje.env);
	const mintuj = opcje.mintuj ?? tokenInstalacji;
	const zapisz = opcje.zapisz ?? zapiszAtomowo;

	let token = TOKEN_PROBNY;
	if (!probny) {
		try {
			token = await mintuj(opcje.env ?? {}, opcje.teraz ?? Date.now(), opcje.fetchImpl ?? fetch);
		} catch {
			// `tokenInstalacji` throws rather than returning a union, because there is no
			// useful partial outcome and no Polish sentence an editor could act on. The
			// throw becomes the generic failure panel here, and the reason it carries
			// (a step name and an HTTP status) is deliberately not propagated: it would
			// have nowhere to go but a log, and this file does not log.
			return { stan: 'blad' };
		}
	}

	let wynik: WynikZapisu;
	try {
		wynik = await zapisz({
			token,
			pliki: opcje.pliki,
			komunikat: komunikatCommita(opcje.zakres, opcje.opis, opcje.uchwyt),
			usun: opcje.usun,
			oczekiwanySha: opcje.oczekiwanySha,
			dryRun: probny,
			fetchImpl: opcje.fetchImpl
		});
	} catch {
		// `komunikatCommita` throws when a description cannot be made safe. A save that
		// cannot be described safely must not happen at all, and it is a failure to the
		// editor rather than a crash to the framework.
		return { stan: 'blad' };
	}

	if (wynik.ok) return { stan: 'zapisano', sha: wynik.sha };
	// One mapping, in one place, for the whole phase. Never a partial success: a save
	// either happened as one commit or it did not happen.
	return wynik.powod === 'konflikt' ? { stan: 'konflikt' } : { stan: 'blad' };
}

/**
 * Read the branch head, once, when an edit screen loads (D-10).
 *
 * The value the form carries back is compared before any blob is written, so the
 * conflict refusal costs one read and leaves no orphan objects. There is no default:
 * a screen that forgets to call this and pass the result back silently disables the
 * whole protection, which is why `zapiszAtomowo` documents the absent case as „skip"
 * rather than pretending to guess.
 *
 * DEGRADE DIRECTION, stated because a silent one would be a bug: if the head cannot be
 * read, this returns undefined and the editor still gets a working form with the
 * conflict check disabled for that save. The alternative, refusing to open the screen
 * at all, would make a GitHub hiccup look like a broken panel and would stop work that
 * is almost always safe. The narrow window it leaves open is the same one D-10 covers
 * with `force: false` at the ref update, which GitHub enforces regardless.
 */
export async function aktualnyShaGlowy(
	env: SrodowiskoZapisu | undefined,
	teraz: number = Date.now(),
	fetchImpl: typeof fetch = fetch,
	mintuj: typeof tokenInstalacji = tokenInstalacji
): Promise<string | undefined> {
	if (suchyBieg(env)) return SHA_PROBNY;
	if (brakujace(env) !== undefined) return undefined;

	try {
		const token = await mintuj(env ?? {}, teraz, fetchImpl);
		const odpowiedz = await fetchImpl(`${API_REPO}/git/ref/heads/${GALAZ}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': WERSJA_API,
				// GitHub rejects an API request that arrives without a user agent.
				'User-Agent': AGENT
			}
		});
		if (!odpowiedz.ok) return undefined;
		const dane = (await odpowiedz.json()) as { object?: { sha?: string } };
		const sha = dane.object?.sha;
		return typeof sha === 'string' && sha.length > 0 ? sha : undefined;
	} catch {
		return undefined;
	}
}
