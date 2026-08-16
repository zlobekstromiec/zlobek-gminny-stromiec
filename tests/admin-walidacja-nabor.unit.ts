// Recruitment validator and shared save orchestrator unit test (Phase 04.1, Plan
// 04.1-05). These are the executable acceptance criteria for threat T-04.1-22 (an
// arbitrary value written into nabor.json), for the D-10 conflict refusal, and for the
// cheap-before-expensive ordering P-15 requires of every save this phase performs.
//
// Do NOT weaken these assertions to make the suite pass. Two of them defend properties
// whose failure is irreversible: a value that is not one of the two literals would be
// committed to a PUBLIC repository and published on the żłobek's front page, and a
// conflict mapped onto the generic failure panel tells an editor to „try again in a
// moment", which is precisely the instruction that destroys a colleague's edit.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types natively
// on the pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test matcher never
// collects it. The relative imports carry the `.ts` extension, which that type
// stripping requires.
//
// NOTHING HERE TOUCHES THE NETWORK. `zapiszTresc` takes its token minter and its
// committer by injection, exactly as `obsluz()` takes its side effects, so the whole
// orchestration is observable as data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	POLE_STAN,
	STAN_OTWARTY,
	STAN_ZAMKNIETY,
	stanZWartosci,
	walidujNabor
} from '../src/lib/server/admin/walidacja/nabor.ts';
import {
	SHA_PROBNY,
	WYMAGANE_WIAZANIA,
	aktualnyShaGlowy,
	zapiszTresc,
	type SrodowiskoZapisu
} from '../src/lib/server/admin/zapis.ts';
import { SCIEZKA_NABOR as SCIEZKA_ZAPISU } from '../src/lib/stan-naboru.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import type { OpcjeZapisu, WynikZapisu } from '../src/lib/server/admin/commit.ts';
import { KOPIA_WALIDACJA } from '../src/lib/content/panel.ts';

const KORZEN = fileURLToPath(new URL('../', import.meta.url));
const SCIEZKA_NABOR = `${KORZEN}src/lib/content/nabor.json`;

/** A complete set of bindings, so a case that is not ABOUT a missing binding never
 *  fails for that reason. The values are obviously synthetic; none is a credential. */
const SRODOWISKO: SrodowiskoZapisu = {
	GITHUB_APP_CLIENT_ID: 'testowy-klient',
	GITHUB_APP_INSTALLATION_ID: '0',
	GITHUB_APP_PRIVATE_KEY: 'testowy-klucz'
};

/** A minter that records whether it ran. The call COUNT is the assertion in the
 *  cheap-before-expensive cases: „returned blad" alone would also be true of an
 *  implementation that minted a token first and then noticed the missing binding, which
 *  is the ordering P-15 forbids. */
function minterSzpieg(token: string = 'token-testowy') {
	const wywolania: number[] = [];
	const mintuj = async () => {
		wywolania.push(Date.now());
		return token;
	};
	return { mintuj, wywolania };
}

/** A committer that records the options it received and returns a fixed verdict. */
function zapisSzpieg(wynik: WynikZapisu) {
	const wywolania: OpcjeZapisu[] = [];
	const zapisz = async (opcje: OpcjeZapisu) => {
		wywolania.push(opcje);
		return wynik;
	};
	return { zapisz, wywolania };
}

const PLIKI = [{ sciezka: 'src/lib/content/nabor.json', tresc: '{}\n' }];

function opcje(nadpisania: Record<string, unknown> = {}) {
	return {
		env: SRODOWISKO,
		uchwyt: 'anna.k',
		zakres: 'nabor',
		opis: 'otwarto nabór',
		pliki: PLIKI,
		...nadpisania
	};
}

// ---------------------------------------------------------------------------
// Walidator naboru (behavior 1 and 2, threat T-04.1-22)
// ---------------------------------------------------------------------------

test('walidujNabor przyjmuje dokladnie dwie dozwolone wartosci', () => {
	const otwarty = walidujNabor(STAN_OTWARTY);
	assert.equal(otwarty.ok, true);
	assert.deepEqual(otwarty.ok && otwarty.dane, { otwarty: true });

	const zamkniety = walidujNabor(STAN_ZAMKNIETY);
	assert.equal(zamkniety.ok, true);
	assert.deepEqual(zamkniety.ok && zamkniety.dane, { otwarty: false });
});

test('walidujNabor odrzuca brak pola, bo domyslna wartosc zamknelaby nabor bez decyzji', () => {
	for (const surowy of [undefined, null, '', '   ']) {
		const wynik = walidujNabor(surowy);
		assert.equal(wynik.ok, false, `pusta wartosc ${JSON.stringify(surowy)} zostala przyjeta`);
	}
});

test('walidujNabor odrzuca kazda wartosc spoza allowlisty, nigdy jej nie naprawia', () => {
	const podstepne = [
		'true',
		'false',
		'on',
		'1',
		'0',
		'Otwarty',
		'OTWARTY',
		' otwarty',
		'otwarty ',
		'otwarte',
		'zamkniety2',
		'otwarty,zamkniety',
		'__proto__',
		1,
		0,
		true,
		false,
		[STAN_OTWARTY],
		{ stan: STAN_OTWARTY }
	];
	for (const surowy of podstepne) {
		const wynik = walidujNabor(surowy as unknown);
		assert.equal(wynik.ok, false, `wartosc ${JSON.stringify(surowy)} zostala przyjeta`);
	}
});

test('walidujNabor zglasza blad pod kluczem pola i polskim zdaniem z modulu kopii', () => {
	const wynik = walidujNabor('cokolwiek');
	assert.equal(wynik.ok, false);
	if (wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.pola), [POLE_STAN]);
	assert.equal(wynik.pola[POLE_STAN], KOPIA_WALIDACJA.stanNaboruBrak);
	// A summary panel with nothing to link to is a summary panel that helps nobody.
	assert.ok(wynik.pola[POLE_STAN].length > 0);
});

test('stanZWartosci odwzorowuje boolean na te same dwa literaly, ktore walidator przyjmuje', () => {
	assert.equal(stanZWartosci(true), STAN_OTWARTY);
	assert.equal(stanZWartosci(false), STAN_ZAMKNIETY);
	// The round trip is the point: whatever the page renders as checked must be a value
	// the action accepts back, or a save of an unchanged form would fail validation.
	for (const otwarty of [true, false]) {
		const wynik = walidujNabor(stanZWartosci(otwarty));
		assert.equal(wynik.ok, true);
		assert.deepEqual(wynik.ok && wynik.dane, { otwarty });
	}
});

test('zserializowany wynik walidatora jest bajt w bajt tym, co lezy w repozytorium', () => {
	// The panel serializes the validator's OUTPUT, so the file's shape and the
	// validator's shape cannot be allowed to drift. Read from disk rather than imported,
	// because an import would compare parsed values and would not see an indent, a key
	// order or a missing trailing newline: precisely the differences that break
	// `prettier --check .` and therefore block every local commit (D-09).
	const naDysku = readFileSync(SCIEZKA_NABOR, 'utf8');
	const wynik = walidujNabor(STAN_ZAMKNIETY);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(serializujJson(wynik.dane), naDysku);
});

test('plik naboru trzyma dokladnie jeden klucz o wartosci logicznej', () => {
	const dane = JSON.parse(readFileSync(SCIEZKA_NABOR, 'utf8'));
	assert.deepEqual(Object.keys(dane), ['otwarty']);
	assert.equal(typeof dane.otwarty, 'boolean');
});

test('sciezka, ktora panel zapisuje, wskazuje na istniejacy plik naboru', () => {
	// A save that writes a path nothing reads would report success to the editor, produce
	// a real commit and a real Cloudflare build, and change nothing a parent can see. That
	// failure is silent in every layer, so the path is pinned against the filesystem here.
	assert.equal(SCIEZKA_ZAPISU, 'src/lib/content/nabor.json');
	assert.doesNotThrow(() => readFileSync(`${KORZEN}${SCIEZKA_ZAPISU}`, 'utf8'));
});

// ---------------------------------------------------------------------------
// Orkiestrator zapisu (behavior 3 and 4, D-10, D-11, P-15)
// ---------------------------------------------------------------------------

test('zapiszTresc zwraca zapisano z nowym sha, gdy warstwa commita potwierdzila zapis', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: true, sha: 'a'.repeat(40) });
	const wynik = await zapiszTresc(opcje({ mintuj: minter.mintuj, zapisz: zapis.zapisz }));
	assert.deepEqual(wynik, { stan: 'zapisano', sha: 'a'.repeat(40) });
	assert.equal(zapis.wywolania.length, 1, 'jeden zapis to jeden commit i jeden build (D-11)');
});

test('zapiszTresc mapuje konflikt na konflikt, nigdy na ogolny blad (D-10)', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: false, powod: 'konflikt' });
	const wynik = await zapiszTresc(opcje({ mintuj: minter.mintuj, zapisz: zapis.zapisz }));
	assert.equal(wynik.stan, 'konflikt');
	// No partial success: a refused save carries no sha, so a caller cannot mistake it
	// for a save that half happened.
	assert.equal('sha' in wynik, false);
});

test('zapiszTresc mapuje blad warstwy commita na blad, bez czesciowego sukcesu', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: false, powod: 'blad' });
	const wynik = await zapiszTresc(opcje({ mintuj: minter.mintuj, zapisz: zapis.zapisz }));
	assert.equal(wynik.stan, 'blad');
	assert.equal('sha' in wynik, false);
});

test('zapiszTresc nie siega po token, gdy brakuje wiazania (tanie przed drogim)', async () => {
	for (const brakujace of WYMAGANE_WIAZANIA) {
		const niepelne: SrodowiskoZapisu = { ...SRODOWISKO };
		delete niepelne[brakujace];
		const minter = minterSzpieg();
		const zapis = zapisSzpieg({ ok: true, sha: 'b'.repeat(40) });

		const wynik = await zapiszTresc(
			opcje({ env: niepelne, mintuj: minter.mintuj, zapisz: zapis.zapisz })
		);

		assert.equal(wynik.stan, 'blad');
		assert.equal(
			wynik.stan === 'blad' && wynik.brakujaceWiazanie,
			brakujace,
			'wynik nazywa brakujace wiazanie, zeby zle skonfigurowany deploy dalo sie zdiagnozowac'
		);
		assert.equal(minter.wywolania.length, 0, `mintowano token mimo braku ${brakujace}`);
		assert.equal(zapis.wywolania.length, 0, `probowano zapisac mimo braku ${brakujace}`);
	}
});

test('zapiszTresc traktuje puste i bialoznakowe wiazanie jak brakujace', async () => {
	for (const pusta of ['', '   ']) {
		const minter = minterSzpieg();
		const zapis = zapisSzpieg({ ok: true, sha: 'c'.repeat(40) });
		const wynik = await zapiszTresc(
			opcje({
				env: { ...SRODOWISKO, GITHUB_APP_PRIVATE_KEY: pusta },
				mintuj: minter.mintuj,
				zapisz: zapis.zapisz
			})
		);
		assert.equal(wynik.stan, 'blad');
		assert.equal(minter.wywolania.length, 0);
		assert.equal(zapis.wywolania.length, 0);
	}
});

test('zapiszTresc nie nazywa wartosci wiazania, tylko jego nazwe', async () => {
	const wynik = await zapiszTresc(opcje({ env: {} }));
	assert.equal(wynik.stan, 'blad');
	if (wynik.stan !== 'blad') return;
	const tekst = JSON.stringify(wynik);
	for (const wartosc of Object.values(SRODOWISKO)) {
		assert.equal(tekst.includes(wartosc), false, 'wartosc sekretu wyciekla do wyniku');
	}
});

test('zapiszTresc zamienia rzut mintera na blad i nie probuje zapisywac', async () => {
	const zapis = zapisSzpieg({ ok: true, sha: 'd'.repeat(40) });
	const wynik = await zapiszTresc(
		opcje({
			mintuj: async () => {
				throw new Error('token: 401');
			},
			zapisz: zapis.zapisz
		})
	);
	assert.deepEqual(wynik, { stan: 'blad' });
	assert.equal(
		zapis.wywolania.length,
		0,
		'zapis, ktorego nie da sie uwierzytelnic, nie dotarl do GitHuba'
	);
});

test('zapiszTresc przekazuje oczekiwany sha dalej, bo na tym stoi cala ochrona D-10', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: true, sha: 'e'.repeat(40) });
	await zapiszTresc(
		opcje({ oczekiwanySha: 'f'.repeat(40), mintuj: minter.mintuj, zapisz: zapis.zapisz })
	);
	assert.equal(zapis.wywolania[0].oczekiwanySha, 'f'.repeat(40));
});

test('zapiszTresc buduje komunikat w ksztalcie D-04 i bez znaku malpy (T-04.1-07)', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: true, sha: '1'.repeat(40) });
	await zapiszTresc(
		opcje({
			uchwyt: 'anna.kowalska@example.test',
			opis: 'otwarto nabór dla anna@example.test',
			mintuj: minter.mintuj,
			zapisz: zapis.zapisz
		})
	);
	const komunikat = zapis.wywolania[0].komunikat;
	assert.equal(komunikat.includes('@'), false, 'adres e-mail dotarlby do publicznej historii');
	assert.match(komunikat, /^tresc\(nabor\): .+ \(edytor: .+\)$/);
	assert.equal(komunikat.includes('\n'), false);
});

test('zapiszTresc pod flaga suchego biegu nie rozmawia z GitHubem', async () => {
	const minter = minterSzpieg();
	const zapis = zapisSzpieg({ ok: true, sha: SHA_PROBNY });
	const wynik = await zapiszTresc(
		opcje({
			env: { ...SRODOWISKO, PANEL_DRY_RUN: '1' },
			mintuj: minter.mintuj,
			zapisz: zapis.zapisz
		})
	);
	assert.equal(wynik.stan, 'zapisano');
	assert.equal(minter.wywolania.length, 0, 'suchy bieg nie mintuje tokenu');
	assert.equal(zapis.wywolania[0].dryRun, true, 'flaga dojechala do warstwy commita');
});

// ---------------------------------------------------------------------------
// Odczyt glowy galezi
// ---------------------------------------------------------------------------

test('aktualnyShaGlowy pod suchym biegiem zwraca syntetyczna wartosc bez sieci', async () => {
	const sha = await aktualnyShaGlowy(
		{ ...SRODOWISKO, PANEL_DRY_RUN: '1' },
		Date.now(),
		(async () => {
			throw new Error('siec nie powinna byc dotknieta');
		}) as unknown as typeof fetch
	);
	assert.equal(sha, SHA_PROBNY);
});

test('aktualnyShaGlowy przy braku wiazan zwraca undefined, nie rzuca', async () => {
	const sha = await aktualnyShaGlowy({}, Date.now(), (async () => {
		throw new Error('siec nie powinna byc dotknieta');
	}) as unknown as typeof fetch);
	assert.equal(sha, undefined);
});

test('aktualnyShaGlowy degraduje do undefined, gdy GitHub odpowie bledem', async () => {
	const minter = minterSzpieg();
	const sha = await aktualnyShaGlowy(
		SRODOWISKO,
		Date.now(),
		(async () => new Response('nie', { status: 500 })) as unknown as typeof fetch,
		minter.mintuj as never
	);
	// A GitHub hiccup must not look like a broken panel: the screen still opens, with the
	// conflict check disabled for that one save. See the degrade-direction note in zapis.ts.
	assert.equal(sha, undefined);
});

test('aktualnyShaGlowy czyta sha glowy galezi z odpowiedzi', async () => {
	const minter = minterSzpieg();
	const oczekiwany = '9'.repeat(40);
	const sha = await aktualnyShaGlowy(
		SRODOWISKO,
		Date.now(),
		(async () =>
			new Response(JSON.stringify({ object: { sha: oczekiwany } }), {
				status: 200
			})) as unknown as typeof fetch,
		minter.mintuj as never
	);
	assert.equal(sha, oczekiwany);
	assert.equal(minter.wywolania.length, 1);
});
