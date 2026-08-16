// Repository write path unit test (Phase 04.1, Plan 04.1-04). These are the
// executable acceptance criteria for CMS-02: the panel turns one save into
// exactly ONE commit built through the Git Data API, refuses a save built on a
// stale view of the branch BEFORE it writes anything, and can never leak a staff
// e-mail address into the history of a PUBLIC repository.
//
// Do NOT weaken these assertions to make the suite pass. They are the proof of
// the threat register in 04.1-04-PLAN.md (T-04.1-07, T-04.1-08, T-04.1-13,
// T-04.1-20, T-04.1-21) and change only in lockstep with it.
//
// Nothing here touches the network. zapiszAtomowo takes fetch by injection,
// exactly as obsluz() takes every side effect, and tokenInstalacji takes its
// clock and its fetch the same way, so the whole outbound request sequence is
// observable as data. The one piece of real cryptography in this file is a
// throwaway RSA key generated in-process, which is what makes the PKCS#1 versus
// PKCS#8 trap (04.1-RESEARCH.md Pitfall 1, the highest-severity item in the
// phase) a checked property rather than a comment.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22.23.2. Intentionally named *.unit.ts so
// Playwright's spec|test matcher never collects it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AGENT, GALAZ, REPO, WERSJA_API, komunikatCommita } from '../src/lib/server/admin/repo.ts';
import { zapiszAtomowo } from '../src/lib/server/admin/commit.ts';
import type { PlikDoZapisu } from '../src/lib/server/admin/commit.ts';
import {
	pemDoArrayBuffer,
	tokenInstalacji,
	wyczyscPamiecTokenu
} from '../src/lib/server/admin/github.ts';

// --- the recording fetch -------------------------------------------------

interface Zadanie {
	metoda: string;
	url: string;
	sciezka: string;
	naglowki: Record<string, string>;
	cialo: unknown;
	surowecialo: string;
}

const SHA_GLOWY = 'a'.repeat(40);
const SHA_DRZEWA = 'b'.repeat(40);
const SHA_NOWEGO = 'c'.repeat(40);

/** Statuses a case can force on a named step; anything unnamed answers 200. */
type Awarie = Partial<
	Record<'ref' | 'commit' | 'blob' | 'tree' | 'nowy-commit' | 'update-ref', number>
>;

function nagrywajacyFetch(awarie: Awarie = {}) {
	const zadania: Zadanie[] = [];
	let licznikBlobow = 0;

	const impl: typeof fetch = async (wejscie, init) => {
		const url = String(wejscie);
		const sciezka = url.replace(`https://api.github.com/repos/${REPO}`, '');
		const metoda = init?.method ?? 'GET';
		const surowecialo = typeof init?.body === 'string' ? init.body : '';
		zadania.push({
			metoda,
			url,
			sciezka,
			naglowki: { ...(init?.headers as Record<string, string>) },
			cialo: surowecialo === '' ? undefined : JSON.parse(surowecialo),
			surowecialo
		});

		const odp = (status: number, dane: unknown) =>
			new Response(JSON.stringify(dane), {
				status,
				headers: { 'Content-Type': 'application/json' }
			});

		if (sciezka === `/git/ref/heads/${GALAZ}`) {
			return odp(awarie.ref ?? 200, { object: { sha: SHA_GLOWY } });
		}
		if (sciezka.startsWith('/git/commits/')) {
			return odp(awarie.commit ?? 200, { sha: SHA_GLOWY, tree: { sha: SHA_DRZEWA } });
		}
		if (sciezka === '/git/blobs') {
			licznikBlobow += 1;
			return odp(awarie.blob ?? 201, { sha: `blob${licznikBlobow}`.padEnd(40, '0') });
		}
		if (sciezka === '/git/trees') {
			return odp(awarie.tree ?? 201, { sha: 'd'.repeat(40) });
		}
		if (sciezka === '/git/commits') {
			return odp(awarie['nowy-commit'] ?? 201, { sha: SHA_NOWEGO });
		}
		if (sciezka === `/git/refs/heads/${GALAZ}`) {
			return odp(awarie['update-ref'] ?? 200, { object: { sha: SHA_NOWEGO } });
		}
		return odp(404, { message: 'nieoczekiwana sciezka' });
	};

	return { impl, zadania, blobow: () => licznikBlobow };
}

const PLIK_TEKSTOWY: PlikDoZapisu = {
	sciezka: 'src/lib/content/o-nas.json',
	tresc: '{\n\t"placeholder": false\n}\n'
};

// A base64 payload never contains a character JSON would have to escape, which is
// what lets commit.ts assemble the blob body by concatenation. The test uses a
// real base64 string so that property is exercised rather than assumed.
const PLIK_BINARNY: PlikDoZapisu = {
	sciezka: 'src/lib/assets/uploads/2026-08-20-dzien-otwarty.jpg',
	tresc: btoa('udawane bajty zdjecia, wystarczajaco dlugie by miec dopelnienie'),
	base64: true
};

function opcje(nadpisania: Record<string, unknown> = {}) {
	return {
		token: 'ghs_token_testowy',
		pliki: [PLIK_TEKSTOWY],
		komunikat: komunikatCommita('o-nas', 'zaktualizowano misje', 'anna.k'),
		...nadpisania
	};
}

// --- komunikatCommita: the one place a human value reaches git history ---

test('komunikat commita ma ksztalt z D-04', () => {
	assert.equal(
		komunikatCommita('aktualnosci', 'dodano wpis "Dzien otwarty"', 'anna.k'),
		'tresc(aktualnosci): dodano wpis "Dzien otwarty" (edytor: anna.k)'
	);
});

test('komunikat commita nigdy nie zawiera adresu e-mail (T-04.1-07)', () => {
	const probki = [
		'anna.kowalska@ugstromiec.pl',
		'anna k@example.test',
		'ANNA.K@GMAIL.COM',
		'a@b',
		'anna+redakcja@example.test'
	];
	for (const uchwyt of probki) {
		const komunikat = komunikatCommita('o-nas', 'zmiana', uchwyt);
		assert.equal(komunikat.includes('@'), false, `znak malpy w komunikacie dla: ${uchwyt}`);
	}
});

test('komunikat commita obcina uchwyt do zachowawczej klasy znakow', () => {
	assert.equal(
		komunikatCommita('o-nas', 'zmiana', 'Anna Kowalska!'),
		'tresc(o-nas): zmiana (edytor: annakowalska)'
	);
	// A handle that sanitizes to nothing must still produce a usable message
	// rather than an empty parenthesis, because the message is the only record of
	// who made the change.
	assert.equal(
		komunikatCommita('o-nas', 'zmiana', '@@@'),
		'tresc(o-nas): zmiana (edytor: redaktor)'
	);
});

test('komunikat commita nie przepuszcza zamiany wiersza z opisu', () => {
	const komunikat = komunikatCommita('o-nas', 'pierwszy\ndrugi', 'anna.k');
	assert.equal(komunikat.includes('\n'), false);
});

// --- zapiszAtomowo: the request sequence --------------------------------

test('zapis wykonuje dokladnie jeden ciag blob, drzewo, commit, ref (D-07)', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	const wynik = await zapiszAtomowo({ ...opcje(), fetchImpl: impl });

	assert.deepEqual(wynik, { ok: true, sha: SHA_NOWEGO });
	assert.deepEqual(
		zadania.map((z) => `${z.metoda} ${z.sciezka}`),
		[
			`GET /git/ref/heads/${GALAZ}`,
			`GET /git/commits/${SHA_GLOWY}`,
			'POST /git/blobs',
			'POST /git/trees',
			'POST /git/commits',
			`PATCH /git/refs/heads/${GALAZ}`
		]
	);
});

test('drzewo niesie base_tree glowy i wszystkie wpisy, commit ma glowe jako jedynego rodzica', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	await zapiszAtomowo({
		...opcje({ pliki: [PLIK_TEKSTOWY, PLIK_BINARNY] }),
		fetchImpl: impl
	});

	const drzewo = zadania.find((z) => z.sciezka === '/git/trees')!.cialo as {
		base_tree: string;
		tree: Array<{ path: string; mode: string; type: string; sha: string | null }>;
	};
	assert.equal(drzewo.base_tree, SHA_DRZEWA);
	assert.deepEqual(
		drzewo.tree.map((w) => w.path),
		[PLIK_TEKSTOWY.sciezka, PLIK_BINARNY.sciezka]
	);
	for (const wpis of drzewo.tree) {
		assert.equal(wpis.mode, '100644');
		assert.equal(wpis.type, 'blob');
	}

	const commit = zadania.find((z) => z.sciezka === '/git/commits' && z.metoda === 'POST')!
		.cialo as {
		message: string;
		tree: string;
		parents: string[];
	};
	assert.deepEqual(commit.parents, [SHA_GLOWY]);
	assert.equal(commit.message, komunikatCommita('o-nas', 'zaktualizowano misje', 'anna.k'));
	assert.equal(commit.message.includes('@'), false);
});

test('usuniecie pojawia sie w drzewie jako wpis o pustej wartosci sha', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	await zapiszAtomowo({
		...opcje({ usun: ['src/lib/content/aktualnosci/stary-wpis.json'] }),
		fetchImpl: impl
	});

	const drzewo = zadania.find((z) => z.sciezka === '/git/trees')!.cialo as {
		tree: Array<{ path: string; sha: string | null }>;
	};
	const usuniete = drzewo.tree.find(
		(w) => w.path === 'src/lib/content/aktualnosci/stary-wpis.json'
	);
	assert.ok(usuniete, 'brak wpisu usuwajacego w drzewie');
	assert.equal(usuniete.sha, null);
	// Only ONE blob was written: a deletion costs no blob at all.
	assert.equal(zadania.filter((z) => z.sciezka === '/git/blobs').length, 1);
});

test('zapis dwoch plikow to dokladnie 7 zadan wychodzacych (T-04.1-20)', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	await zapiszAtomowo({
		...opcje({ pliki: [PLIK_TEKSTOWY, PLIK_BINARNY] }),
		fetchImpl: impl
	});
	// ref + commit + 2 blobs + tree + commit + update-ref. The ceiling is 50
	// subrequests per request on the free plan, so the number itself is not the
	// risk; a future refactor that introduces a loop scaling with content size is,
	// and this assertion is what turns that refactor red.
	assert.equal(zadania.length, 7);
});

// --- zapiszAtomowo: conflict detection ----------------------------------

test('nieaktualne sha glowy daje konflikt i ZERO zadan blob (D-10, T-04.1-13)', async () => {
	const { impl, zadania, blobow } = nagrywajacyFetch();
	const wynik = await zapiszAtomowo({
		...opcje({ oczekiwanySha: 'f'.repeat(40) }),
		fetchImpl: impl
	});

	assert.deepEqual(wynik, { ok: false, powod: 'konflikt' });
	assert.equal(blobow(), 0, 'zapisano blob mimo konfliktu');
	// The refusal costs exactly one read and leaves no orphan object behind.
	assert.deepEqual(
		zadania.map((z) => z.sciezka),
		[`/git/ref/heads/${GALAZ}`]
	);
});

test('zgodne sha glowy przechodzi normalna sciezka', async () => {
	const { impl } = nagrywajacyFetch();
	const wynik = await zapiszAtomowo({
		...opcje({ oczekiwanySha: SHA_GLOWY }),
		fetchImpl: impl
	});
	assert.deepEqual(wynik, { ok: true, sha: SHA_NOWEGO });
});

for (const status of [409, 422]) {
	test(`odmowa przewijania przy update-ref (${status}) to konflikt, nie ogolny blad`, async () => {
		const { impl } = nagrywajacyFetch({ 'update-ref': status });
		const wynik = await zapiszAtomowo({ ...opcje(), fetchImpl: impl });
		assert.deepEqual(wynik, { ok: false, powod: 'konflikt' });
	});
}

// --- zapiszAtomowo: failure never becomes a partial success -------------

for (const krok of ['ref', 'commit', 'blob', 'tree', 'nowy-commit'] as const) {
	test(`blad na kroku ${krok} daje wynik bledu, nigdy czesciowego sukcesu`, async () => {
		const { impl } = nagrywajacyFetch({ [krok]: 500 });
		const wynik = await zapiszAtomowo({ ...opcje(), fetchImpl: impl });
		assert.deepEqual(wynik, { ok: false, powod: 'blad' });
	});
}

test('awaria sieci daje wynik bledu i nie rzuca', async () => {
	const impl: typeof fetch = async () => {
		throw new TypeError('siec padla');
	};
	const wynik = await zapiszAtomowo({ ...opcje(), fetchImpl: impl });
	assert.deepEqual(wynik, { ok: false, powod: 'blad' });
});

// --- zapiszAtomowo: headers and the blob bodies -------------------------

test('kazde zadanie niesie przypieta wersje API, autoryzacje i agenta', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	await zapiszAtomowo({ ...opcje(), fetchImpl: impl });
	assert.equal(zadania.length > 0, true);
	for (const z of zadania) {
		assert.equal(z.naglowki['X-GitHub-Api-Version'], WERSJA_API, `brak wersji API w ${z.sciezka}`);
		assert.equal(z.naglowki['Authorization'], 'Bearer ghs_token_testowy');
		assert.equal(z.naglowki['User-Agent'], AGENT);
		assert.equal(z.naglowki['Accept'], 'application/vnd.github+json');
	}
});

test('blob binarny deklaruje base64 i przepuszcza ladunek bez zmiany', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	await zapiszAtomowo({ ...opcje({ pliki: [PLIK_BINARNY] }), fetchImpl: impl });

	const blob = zadania.find((z) => z.sciezka === '/git/blobs')!;
	const cialo = blob.cialo as { encoding: string; content: string };
	assert.equal(cialo.encoding, 'base64');
	assert.equal(cialo.content, PLIK_BINARNY.tresc, 'ladunek base64 zostal zmieniony po drodze');
});

test('blob tekstowy deklaruje utf-8 i poprawnie ucieka znaki specjalne', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	const zdradliwy: PlikDoZapisu = {
		sciezka: 'src/lib/content/o-nas.json',
		tresc: '{\n\t"misja": "cytat: \\"tak\\", \\u0142amiacy \\\\ znak"\n}\n'
	};
	await zapiszAtomowo({ ...opcje({ pliki: [zdradliwy] }), fetchImpl: impl });

	const cialo = zadania.find((z) => z.sciezka === '/git/blobs')!.cialo as {
		encoding: string;
		content: string;
	};
	assert.equal(cialo.encoding, 'utf-8');
	assert.equal(cialo.content, zdradliwy.tresc);
});

test('ladunek base64 z niedozwolonym znakiem jest odrzucany przed wyslaniem', async () => {
	// The base64 blob body is assembled by concatenation for a measured reason, so
	// the charset is validated rather than trusted. Without this guard a payload
	// carrying a quote would break out of the JSON body it is spliced into.
	const { impl, zadania } = nagrywajacyFetch();
	const wynik = await zapiszAtomowo({
		...opcje({
			pliki: [{ sciezka: 'src/lib/assets/uploads/x.jpg', tresc: 'ab","x":"', base64: true }]
		}),
		fetchImpl: impl
	});
	assert.deepEqual(wynik, { ok: false, powod: 'blad' });
	assert.equal(zadania.filter((z) => z.sciezka === '/git/blobs').length, 0);
});

// --- the P-13 dry-run seam ----------------------------------------------

test('tryb probny zwraca sukces i nie wykonuje zadnego zadania (P-13)', async () => {
	const { impl, zadania } = nagrywajacyFetch();
	const wynik = await zapiszAtomowo({ ...opcje({ dryRun: true }), fetchImpl: impl });
	assert.equal(wynik.ok, true);
	assert.equal(zadania.length, 0);
});

// --- github.ts: the PKCS#1 trap and the token ---------------------------

function pem(naglowek: string, bajty: ArrayBuffer): string {
	const b64 = btoa(String.fromCharCode(...new Uint8Array(bajty)));
	const wiersze = b64.match(/.{1,64}/g) ?? [];
	return `-----BEGIN ${naglowek}-----\n${wiersze.join('\n')}\n-----END ${naglowek}-----\n`;
}

async function paraKluczy() {
	const para = (await crypto.subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256'
		},
		true,
		['sign', 'verify']
	)) as CryptoKeyPair;
	const pkcs8 = await crypto.subtle.exportKey('pkcs8', para.privateKey);
	return { para, pkcs8Pem: pem('PRIVATE KEY', pkcs8) };
}

test('klucz w formacie PKCS#1 jest odrzucany z nazwanym bledem (Pitfall 1)', async () => {
	const { pkcs8Pem } = await paraKluczy();
	// The SAME bytes under the header GitHub actually issues. The header is what is
	// checked, because the opaque alternative is an invalid-key-data exception at
	// the first save on the live deployment and nowhere else.
	const podszywka = pkcs8Pem.replace(/PRIVATE KEY/g, 'RSA PRIVATE KEY');
	assert.throws(() => pemDoArrayBuffer(podszywka), /pkcs1/);
	// Positive control: the same helper accepts the PKCS#8 form, so the assertion
	// above cannot pass merely because the helper rejects everything.
	assert.equal(pemDoArrayBuffer(pkcs8Pem).byteLength > 0, true);
});

test('klucz o nierozpoznanym naglowku jest odrzucany', () => {
	assert.throws(
		() => pemDoArrayBuffer('-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----\n'),
		/format/
	);
});

test('token instalacji podpisuje trojroszczeniowy JWT, ktory weryfikuje sie kluczem publicznym', async () => {
	wyczyscPamiecTokenu();
	const { para, pkcs8Pem } = await paraKluczy();
	const zadania: Array<{ url: string; naglowki: Record<string, string> }> = [];
	const impl: typeof fetch = async (wejscie, init) => {
		zadania.push({
			url: String(wejscie),
			naglowki: { ...(init?.headers as Record<string, string>) }
		});
		return new Response(
			JSON.stringify({ token: 'ghs_zwrocony', expires_at: new Date(3_600_000).toISOString() }),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		);
	};

	const token = await tokenInstalacji(
		{
			GITHUB_APP_CLIENT_ID: 'Iv23test',
			GITHUB_APP_INSTALLATION_ID: '154059103',
			GITHUB_APP_PRIVATE_KEY: pkcs8Pem
		},
		0,
		impl
	);

	assert.equal(token, 'ghs_zwrocony');
	assert.equal(zadania.length, 1);
	assert.equal(zadania[0].url, 'https://api.github.com/app/installations/154059103/access_tokens');
	assert.equal(zadania[0].naglowki['X-GitHub-Api-Version'], WERSJA_API);
	assert.equal(zadania[0].naglowki['User-Agent'], AGENT);

	const jwt = zadania[0].naglowki['Authorization'].replace('Bearer ', '');
	const [naglowek, tresc, podpis] = jwt.split('.');
	const zB64 = (s: string) =>
		Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
	assert.deepEqual(JSON.parse(new TextDecoder().decode(zB64(naglowek))), {
		alg: 'RS256',
		typ: 'JWT'
	});
	const roszczenia = JSON.parse(new TextDecoder().decode(zB64(tresc))) as {
		iat: number;
		exp: number;
		iss: string;
	};
	assert.equal(roszczenia.iss, 'Iv23test');
	assert.equal(roszczenia.iat, -60, 'iat musi byc cofniete o minute na dryf zegara');
	assert.equal(roszczenia.exp <= 600, true, 'exp musi miescic sie w dziesieciominutowym pulapie');
	assert.equal(roszczenia.exp > roszczenia.iat, true);

	const ok = await crypto.subtle.verify(
		{ name: 'RSASSA-PKCS1-v1_5' },
		para.publicKey,
		zB64(podpis),
		new TextEncoder().encode(`${naglowek}.${tresc}`)
	);
	assert.equal(ok, true, 'podpis JWT nie weryfikuje sie kluczem publicznym pary');
});

test('token jest zapamietywany na czas zycia i odswiezany tuz przed wygasnieciem', async () => {
	wyczyscPamiecTokenu();
	const { pkcs8Pem } = await paraKluczy();
	let wywolan = 0;
	const impl: typeof fetch = async () => {
		wywolan += 1;
		return new Response(
			JSON.stringify({
				token: `ghs_${wywolan}`,
				expires_at: new Date(3_600_000).toISOString()
			}),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		);
	};
	const env = {
		GITHUB_APP_CLIENT_ID: 'Iv23test',
		GITHUB_APP_INSTALLATION_ID: '1',
		GITHUB_APP_PRIVATE_KEY: pkcs8Pem
	};

	assert.equal(await tokenInstalacji(env, 0, impl), 'ghs_1');
	assert.equal(await tokenInstalacji(env, 1_000_000, impl), 'ghs_1');
	assert.equal(wywolan, 1, 'token pobrany ponownie mimo waznej pamieci');

	// Inside the safety margin before expiry the token is refreshed, so a save can
	// never start with a credential that expires mid-sequence.
	assert.equal(await tokenInstalacji(env, 3_599_000, impl), 'ghs_2');
	assert.equal(wywolan, 2);
});

test('odmowa GitHuba przy wydaniu tokenu rzuca i nie zapamietuje niczego', async () => {
	wyczyscPamiecTokenu();
	const { pkcs8Pem } = await paraKluczy();
	const impl: typeof fetch = async () => new Response('{}', { status: 401 });
	await assert.rejects(
		() =>
			tokenInstalacji(
				{
					GITHUB_APP_CLIENT_ID: 'Iv23test',
					GITHUB_APP_INSTALLATION_ID: '1',
					GITHUB_APP_PRIVATE_KEY: pkcs8Pem
				},
				0,
				impl
			),
		/401/
	);
});

test('brak ktoregokolwiek sekretu aplikacji jest nazwanym bledem konfiguracji', async () => {
	wyczyscPamiecTokenu();
	const impl: typeof fetch = async () => new Response('{}', { status: 201 });
	await assert.rejects(() => tokenInstalacji({}, 0, impl), /konfiguracja/);
});

test('zaden komunikat bledu nie niesie materialu klucza', async () => {
	wyczyscPamiecTokenu();
	const { pkcs8Pem } = await paraKluczy();
	const impl: typeof fetch = async () => new Response('{}', { status: 401 });
	try {
		await tokenInstalacji(
			{
				GITHUB_APP_CLIENT_ID: 'Iv23test',
				GITHUB_APP_INSTALLATION_ID: '1',
				GITHUB_APP_PRIVATE_KEY: pkcs8Pem
			},
			0,
			impl
		);
		assert.fail('oczekiwano wyjatku');
	} catch (e) {
		const tekst = e instanceof Error ? `${e.message}${e.stack ?? ''}` : String(e);
		assert.equal(tekst.includes('PRIVATE KEY'), false);
		assert.equal(tekst.includes(pkcs8Pem.slice(40, 80)), false);
	}
});
