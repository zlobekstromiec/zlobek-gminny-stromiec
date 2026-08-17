// THE EXECUTABLE PLACEHOLDER INVENTORY (05-UI-SPEC Contract 11, 05 D-33, plan 05-09).
//
// WHY THIS FILE EXISTS AT ALL. The Phase 6 launch gate sweeps the source tree for a
// greppable `PLACEHOLDER` token, and until this plan every launch-gate marker on the
// homepage fact tiles was a LINE COMMENT carrying exactly that token
// (src/lib/content/site.ts, above the hours tile and above the fee tile). Plan 05-09 moves
// the hours out of that module and into editor-owned JSON, where a line comment cannot
// follow it: JSON has no comments, and a boolean named „placeholder" is not the token the
// sweep hunts. Migrating the data without migrating the marker would delete a launch-gate
// obligation silently, which is the one failure mode nobody would ever notice.
//
// So the marker becomes a PER-TILE BOOLEAN and this file is the sweep's new half. It is a
// named deliverable of Contract 11 rather than an instruction left for a future phase,
// because an instruction to a future phase is the thing that was already lost once.
//
// IT NEVER ASSERTS THAT A FLAG IS FALSE. Every flag below is legitimately true until the
// żłobek confirms the real content at the Phase 6 gate. A gate that failed today is a gate
// somebody would delete today, so this suite asserts SHAPE and PRESENCE, and PRINTS the
// inventory. The human running the Phase 6 gate then has a list rather than a chore.
//
// It reads from disk rather than importing, for the same reason
// tests/admin-walidacja-nabor.unit.ts does: an import compares parsed values and cannot see
// a file that was never written, and these assertions are about the bytes that ship.
//
// Uses Node's built-in runner. Named *.unit.ts so Playwright's spec matcher never collects
// it. The relative imports carry the `.ts` extension, which the type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KATALOG_TRESCI = fileURLToPath(new URL('../src/lib/content', import.meta.url));

/** The key every placeholder flag in this project is stored under, per file since 04.1 and
 *  additionally per tile since 05-09. Spelled once so a renamed key cannot leave this suite
 *  quietly scanning for something nothing writes. */
const KLUCZ = 'placeholder';

/** One entry of the inventory: where the flag lives and what it currently says. */
interface Znacznik {
	/** Path relative to src/lib/content, plus the dotted path of the flag inside the file. */
	gdzie: string;
	wartosc: unknown;
}

/** Every `.json` file under src/lib/content, including the two collections. Walked off disk
 *  rather than listed, so a content file added by a later plan joins the inventory without
 *  anybody remembering to add it here. */
function plikiTresci(katalog: string = KATALOG_TRESCI, prefiks: string = ''): string[] {
	const zebrane: string[] = [];
	for (const wpis of readdirSync(katalog, { withFileTypes: true })) {
		if (wpis.isDirectory()) {
			zebrane.push(...plikiTresci(`${katalog}/${wpis.name}`, `${prefiks}${wpis.name}/`));
		} else if (wpis.name.endsWith('.json')) {
			zebrane.push(`${prefiks}${wpis.name}`);
		}
	}
	return zebrane.sort();
}

/** Collect every `placeholder` member reachable from a parsed store, at any depth, with the
 *  dotted path it was found at. Recursive on purpose: the per-file flag sits at the root and
 *  the per-tile flags of w-skrocie.json sit one level down, and a future store may nest
 *  differently again. */
function znaczniki(wartosc: unknown, gdzie: string, zebrane: Znacznik[] = []): Znacznik[] {
	if (Array.isArray(wartosc)) {
		for (const [indeks, element] of wartosc.entries()) {
			znaczniki(element, `${gdzie}[${indeks}]`, zebrane);
		}
		return zebrane;
	}
	if (typeof wartosc !== 'object' || wartosc === null) return zebrane;
	for (const [klucz, element] of Object.entries(wartosc)) {
		if (klucz === KLUCZ) {
			zebrane.push({ gdzie: `${gdzie}.${klucz}`, wartosc: element });
			continue;
		}
		znaczniki(element, `${gdzie}.${klucz}`, zebrane);
	}
	return zebrane;
}

const INWENTARZ: Znacznik[] = plikiTresci().flatMap((plik) =>
	znaczniki(JSON.parse(readFileSync(`${KATALOG_TRESCI}/${plik}`, 'utf8')), plik)
);

test('kazdy znacznik tresci zastepczej jest wartoscia logiczna, nigdy tekstem ani brakiem', () => {
	// Guards against a vacuous pass: a walker that found nothing would satisfy the loop
	// below without looking at a single store.
	assert.ok(INWENTARZ.length > 0, 'nie znaleziono ani jednego znacznika tresci zastepczej');
	for (const znacznik of INWENTARZ) {
		assert.equal(
			typeof znacznik.wartosc,
			'boolean',
			`znacznik ${znacznik.gdzie} nie jest wartoscia logiczna: ${JSON.stringify(znacznik.wartosc)}`
		);
	}
});

test('kafelki strony glownej maja wlasne znaczniki tresci zastepczej (Kontrakt 11)', () => {
	// BY NAME, because this is the obligation that travels with plan 05-09's migration: the
	// hours marker used to be a line comment in src/lib/content/site.ts, and after the move
	// it exists only here. A generic „some flag somewhere" assertion would keep passing on
	// the day somebody deleted it.
	const sciezki = INWENTARZ.map((znacznik) => znacznik.gdzie);
	for (const oczekiwana of [
		'w-skrocie.json.godziny.placeholder',
		'w-skrocie.json.miejsca.placeholder'
	]) {
		assert.ok(
			sciezki.includes(oczekiwana),
			`brak znacznika tresci zastepczej: ${oczekiwana} (znalezione: ${sciezki.join(', ')})`
		);
	}
});

test('inwentarz tresci zastepczej jest wypisany dla bramki uruchomieniowej (Faza 6)', () => {
	// The whole point of the suite. The Phase 6 gate greps source for the PLACEHOLDER token
	// and a JSON boolean is not that token, so this listing is what the token would have
	// given whoever runs that gate. Printed, never asserted against: these flags are
	// legitimately true today.
	const wiersze = INWENTARZ.map(
		(znacznik) => `  ${znacznik.gdzie}: ${JSON.stringify(znacznik.wartosc)}`
	);
	console.log(`Tresc zastepcza, inwentarz (${INWENTARZ.length}):\n${wiersze.join('\n')}`);
	assert.equal(wiersze.length, INWENTARZ.length);
});
