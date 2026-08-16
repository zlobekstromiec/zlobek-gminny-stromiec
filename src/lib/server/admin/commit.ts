// The panel's write path: one save becomes exactly ONE commit (Phase 04.1, Plan
// 04.1-04; D-06, D-07, D-10, D-11, 04.1-RESEARCH.md Pattern 2 and Code Example 2).
//
// Content stays in git, so every reader built in Phases 2 and 3 and the whole
// prerendered zero-JS model survive untouched. The price is that a save is a
// sequence of GitHub Git Data API calls rather than a database write, and that
// sequence has to be atomic: an aktualnosc is a JSON file AND its cover image, and
// committing them separately would mean two commits, two Pages builds, roughly
// four minutes, and a window in which the post is live without its picture.
//
// The simple Contents API is deliberately never used. It writes one file per
// commit, which is precisely the failure above.
//
// Every side effect arrives by injection, exactly as obsluz() takes its
// dependencies, so tests/admin-commit.unit.ts drives the entire outbound sequence
// as observable data with no network at all.
//
// Nothing here logs.
import { AGENT, API_REPO, GALAZ, WERSJA_API } from './repo.ts';

/** A file to write in this commit. `tresc` is utf-8 text, or a base64 payload
 *  when `base64` is set, in which case the worker never decodes it (D-12: the
 *  browser encodes, because base64-ing a few hundred kilobytes is real CPU
 *  against a 10 ms budget, not I/O wait). */
export interface PlikDoZapisu {
	sciezka: string;
	tresc: string;
	base64?: boolean;
}

export interface OpcjeZapisu {
	/** Installation token from github.ts. */
	token: string;
	pliki: PlikDoZapisu[];
	/** Built by komunikatCommita in repo.ts. Never assembled at the call site,
	 *  because that function is where the no-e-mail-address guarantee lives. */
	komunikat: string;
	usun?: string[];
	/** Head SHA captured when the editor opened the form (D-10). */
	oczekiwanySha?: string;
	/** P-13. Test-only seam, driven by PANEL_DRY_RUN which is bound ONLY by the
	 *  preview:test harness and must never become a Cloudflare Pages variable,
	 *  exactly as FORM_DRY_RUN never did. Set in production it would turn every
	 *  save into a silent no-op that still reports success. */
	dryRun?: boolean;
	fetchImpl?: typeof fetch;
}

/** Result union rather than inline status numbers, following handle.ts. The two
 *  failures are genuinely different to an editor: `konflikt` means reload and redo
 *  your change, `blad` means try again. */
export type WynikZapisu = { ok: true; sha: string } | { ok: false; powod: 'konflikt' | 'blad' };

interface WpisDrzewa {
	path: string;
	mode: string;
	type: 'blob';
	/** null deletes the path in the resulting tree. */
	sha: string | null;
}

/** Ordinary non-executable file. The panel writes JSON and images and nothing
 *  else, so this is a constant rather than a parameter. */
const TRYB_PLIKU = '100644';

/** The SHA a dry run reports. Obviously synthetic, so it cannot be mistaken for a
 *  real commit if it ever surfaces somewhere it should not. */
const SHA_PROBNY = '0'.repeat(40);

/** Standard base64, optionally padded. Nothing else. */
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** Carries the step and the status so the caller can tell a non-fast-forward at
 *  update-ref apart from a failure anywhere else. The message holds a path and a
 *  number: never the token, never a payload. */
class BladGitHub extends Error {
	readonly sciezka: string;
	readonly status: number;
	constructor(sciezka: string, status: number) {
		super(`github ${sciezka} ${status}`);
		this.sciezka = sciezka;
		this.status = status;
	}
}

/**
 * Builds the body of a blob request.
 *
 * The base64 branch assembles the JSON by CONCATENATION instead of serializing an
 * object that holds the payload, and that is a deliberate, measured choice rather
 * than an oversight to be tidied away later. A base64 payload contains no
 * character JSON would have to escape, so concatenation is a single copy while
 * JSON.stringify walks and re-scans the entire string looking for escapes that
 * cannot be there. Later plans push a cover photo of a few hundred kilobytes and a
 * document of up to ten megabytes through this exact call on a 10 ms CPU budget,
 * which is the whole reason the encoding happens in the browser in the first
 * place. Do not "simplify" this back.
 *
 * The safety of that shortcut rests entirely on the payload really being base64,
 * so the caller validates the charset BEFORE anything is sent. A payload carrying
 * a quote would otherwise break out of the body it is spliced into.
 *
 * The utf-8 branch stays on ordinary serialization, where escaping is genuinely
 * required and correctness beats a copy.
 */
function cialoBloba(plik: PlikDoZapisu): string {
	if (plik.base64) {
		return `{"content":"${plik.tresc}","encoding":"base64"}`;
	}
	return JSON.stringify({ content: plik.tresc, encoding: 'utf-8' });
}

/**
 * Writes every changed file as ONE commit on the panel's single branch.
 *
 * The sequence is fixed at about seven outbound calls: read the ref, read the head
 * commit, one blob per file, one tree, one commit, one ref update. Against the
 * free plan's ceiling of 50 subrequests per request that is comfortable, but the
 * ceiling is real and rules out ever growing a loop here that scales with the
 * amount of content being edited. The unit suite asserts the exact call count for
 * a two-file save so a refactor that introduces one turns red.
 */
export async function zapiszAtomowo(opcje: OpcjeZapisu): Promise<WynikZapisu> {
	// P-13, first statement on purpose: a harness run must not be able to reach the
	// network even by accident, and a short circuit further down would be one early
	// return away from being bypassed.
	if (opcje.dryRun) return { ok: true, sha: SHA_PROBNY };

	// Checked before the first request, so a malformed payload costs nothing and
	// leaves no orphan objects in the repository.
	for (const plik of opcje.pliki) {
		if (plik.base64 && !BASE64.test(plik.tresc)) {
			return { ok: false, powod: 'blad' };
		}
	}

	const f = opcje.fetchImpl ?? fetch;
	const naglowki = {
		Authorization: `Bearer ${opcje.token}`,
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': WERSJA_API,
		// GitHub rejects an API request that arrives without a user agent.
		'User-Agent': AGENT,
		'Content-Type': 'application/json'
	};

	async function gh<T>(sciezka: string, metoda: string, cialo?: string): Promise<T> {
		const odpowiedz = await f(`${API_REPO}${sciezka}`, {
			method: metoda,
			headers: naglowki,
			...(cialo === undefined ? {} : { body: cialo })
		});
		if (!odpowiedz.ok) throw new BladGitHub(sciezka, odpowiedz.status);
		return (await odpowiedz.json()) as T;
	}

	try {
		// 1. Where the branch actually is right now.
		const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${GALAZ}`, 'GET');
		const shaGlowy = ref.object.sha;

		// 2. D-10, and it has to be HERE. Refusing before any blob is written means a
		//    refusal costs one read and leaves nothing behind. The Git Data API needs
		//    this SHA anyway to build the commit, so detecting the conflict is free,
		//    and the failure it prevents (silently destroying a colleague's edit) is
		//    the worst outcome this module has.
		if (opcje.oczekiwanySha !== undefined && opcje.oczekiwanySha !== shaGlowy) {
			return { ok: false, powod: 'konflikt' };
		}

		// 3. The head commit, for the tree the new one is based on.
		const glowa = await gh<{ tree: { sha: string } }>(`/git/commits/${shaGlowy}`, 'GET');

		// 4. One blob per file. Issued together rather than in series because they do
		//    not depend on each other, and a save with a photo is two round trips
		//    otherwise. Promise.all preserves input order, so the tree entries below
		//    stay in the order the caller gave.
		const zapisane = await Promise.all(
			opcje.pliki.map(async (plik): Promise<WpisDrzewa> => {
				const blob = await gh<{ sha: string }>('/git/blobs', 'POST', cialoBloba(plik));
				return { path: plik.sciezka, mode: TRYB_PLIKU, type: 'blob', sha: blob.sha };
			})
		);

		// A deletion is an entry with a null sha, so it costs no blob and needs no
		// separate mechanism.
		const usuniete: WpisDrzewa[] = (opcje.usun ?? []).map((sciezka) => ({
			path: sciezka,
			mode: TRYB_PLIKU,
			type: 'blob',
			sha: null
		}));

		// 5. base_tree is what keeps this cheap: GitHub merges everything not
		//    mentioned here, so the request carries only what changed.
		const drzewo = await gh<{ sha: string }>(
			'/git/trees',
			'POST',
			JSON.stringify({ base_tree: glowa.tree.sha, tree: [...zapisane, ...usuniete] })
		);

		// 6. One commit, therefore one Pages build. The free plan allows 500 builds a
		//    month and developer commits draw on the same allowance (D-11).
		const nowy = await gh<{ sha: string }>(
			'/git/commits',
			'POST',
			JSON.stringify({ message: opcje.komunikat, tree: drzewo.sha, parents: [shaGlowy] })
		);

		// 7. force false makes GitHub itself reject a non-fast-forward, which closes
		//    the race between the check at step 2 and this write. Two editors saving
		//    within the same second is unlikely with this many staff, but "unlikely"
		//    is not "impossible" and the loser's edit would vanish without a word.
		await gh<unknown>(
			`/git/refs/heads/${GALAZ}`,
			'PATCH',
			JSON.stringify({ sha: nowy.sha, force: false })
		);

		return { ok: true, sha: nowy.sha };
	} catch (e) {
		// P-12: GitHub documents 200, 409 and 422 for update-ref without saying which
		// one a non-fast-forward produces, so BOTH are mapped to the conflict outcome.
		// Measured against the real repository on 2026-08-16 with a deliberately stale
		// sha and force:false: the answer is 422 "Update is not a fast forward", and
		// the ref was left untouched. 409 stays mapped anyway, see below.
		// Deliberately over-mapping: the cost of treating some other 409 or 422 as a
		// conflict is a slightly wrong Polish message, while the cost of missing the
		// real one is an edit that was silently lost being reported as saved.
		// Narrowed to the ref update, because a 409 or 422 from a blob or a tree is
		// not a conflict and must not be described to the editor as one.
		if (
			e instanceof BladGitHub &&
			e.sciezka.startsWith('/git/refs/') &&
			(e.status === 409 || e.status === 422)
		) {
			return { ok: false, powod: 'konflikt' };
		}
		// Everything else, including a network failure, is a failure. Never a partial
		// success: a save either happened as one commit or it did not happen.
		return { ok: false, powod: 'blad' };
	}
}
