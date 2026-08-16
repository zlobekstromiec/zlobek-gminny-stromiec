// One-time login code unit test (Phase 04.1, Plan 04.1-02). These are the
// executable acceptance criteria for the CMS-01 authentication core: a CSPRNG
// six-digit code, stored only as a salted hash under a key that names no address,
// usable exactly once inside its lifetime, burned after five wrong attempts, and
// refusing the login on every failure path instead of granting one.
//
// Do NOT weaken these assertions to make the suite pass. They are the proof of the
// threat register in 04.1-02-PLAN.md (T-04.1-05, T-04.1-05b, T-04.1-05c, T-04.1-06,
// T-04.1-07, T-04.1-15) and change only in lockstep with it.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22.23.2. Intentionally named *.unit.ts so
// Playwright's spec|test matcher never collects it. The module under test takes its
// KV binding and its clock by injection, so nothing here touches the network, KV or
// the real clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	DLUGOSC_KODU,
	LIMIT_KODOW,
	LIMIT_KODOW_DOBOWY,
	LIMIT_PROB,
	LIMIT_PROB_DOBOWY,
	MAKS_PROB,
	MNOZNIK_TTL_KODU,
	PREFIKS_DOBOWY_PANELU,
	PREFIKS_DOBOWY_PROB,
	PREFIKS_KODU,
	TTL_KODU_S,
	kluczKodu,
	podLimitemKodu,
	podLimitemProby,
	skrotKodu,
	sprawdzKod,
	wygenerujKod,
	zapiszKod
} from '../src/lib/server/admin/kod.ts';
import { PREFIKS_DOBOWY, kluczDobowy, kluczLimitu } from '../src/lib/server/forms/ratelimit.ts';

const ADRES = 'anna.kowalska@example.test';
/** One client address, so every budget case below spends the same bucket. */
const IP = '203.0.113.7';
const CZESC_LOKALNA = 'anna.kowalska';
const DOMENA = 'example.test';
const SOL = 'sol-testowa-panelu';

/** 2026-08-14T10:30:00Z, frozen. The lifetime is compared against an injected
 *  clock, so a case that read the real clock could go red for reasons unrelated to
 *  the code under test. */
const TERAZ = Date.UTC(2026, 7, 14, 10, 30, 0);
/** One second after the code stops being valid. */
const PO_WYGASNIECIU = TERAZ + (TTL_KODU_S + 1) * 1000;

interface Zapis {
	key: string;
	value: string;
	ttl?: number;
}

/** Minimal in-memory KV over a Map. Reads, writes and deletes are recorded so a
 *  case can prove not only the returned outcome but that the entry really is gone,
 *  and that a refused call touched KV at all. */
function stubKV(wstepne: Record<string, string> = {}): {
	kv: KVNamespace;
	zapisy: Zapis[];
	odczyty: string[];
	usuniecia: string[];
	magazyn: Map<string, string>;
} {
	const magazyn = new Map<string, string>(Object.entries(wstepne));
	const zapisy: Zapis[] = [];
	const odczyty: string[] = [];
	const usuniecia: string[] = [];
	const kv = {
		get: async (key: string) => {
			odczyty.push(key);
			return magazyn.get(key) ?? null;
		},
		put: async (key: string, value: string, opcje?: { expirationTtl?: number }) => {
			magazyn.set(key, value);
			zapisy.push({ key, value, ttl: opcje?.expirationTtl });
		},
		delete: async (key: string) => {
			magazyn.delete(key);
			usuniecia.push(key);
		}
	};
	return { kv: kv as unknown as KVNamespace, zapisy, odczyty, usuniecia, magazyn };
}

/** A binding can be PRESENT but unusable: an id pointing at a namespace that does
 *  not exist, or a transient KV failure. That is a different branch from `!kv`, and
 *  in the authentication boundary it must never fall through to a granted session. */
function stubKVRzucajacy(
	gdzie: 'get' | 'put' | 'delete',
	wstepne: Record<string, string> = {}
): KVNamespace {
	const magazyn = new Map<string, string>(Object.entries(wstepne));
	return {
		get: async (key: string) => {
			if (gdzie === 'get') throw new Error('KV unavailable');
			return magazyn.get(key) ?? null;
		},
		put: async (key: string, value: string) => {
			if (gdzie === 'put') throw new Error('KV unavailable');
			magazyn.set(key, value);
		},
		delete: async (key: string) => {
			if (gdzie === 'delete') throw new Error('KV unavailable');
			magazyn.delete(key);
		}
	} as unknown as KVNamespace;
}

/** Store one code and hand back the key it landed under, so a case can inspect the
 *  stored value directly rather than trusting the module's own reader. */
async function zapisaneWpisy(kod: string, teraz: number = TERAZ) {
	const stub = stubKV();
	const wynik = await zapiszKod(stub.kv, ADRES, kod, SOL, teraz);
	const klucz = await kluczKodu(ADRES, SOL);
	return { ...stub, wynik, klucz };
}

// ---------------------------------------------------------------------------
// wygenerujKod: sila losowania (T-04.1-05)
// ---------------------------------------------------------------------------

test('wygenerujKod zwraca dokladnie szesc cyfr', () => {
	for (let i = 0; i < 200; i++) {
		const kod = wygenerujKod();
		assert.equal(kod.length, DLUGOSC_KODU);
		assert.match(kod, /^[0-9]+$/);
	}
});

test('wygenerujKod nie jest stala: tysiac losowan daje wiecej niz jedna wartosc', () => {
	const zebrane = new Set<string>();
	for (let i = 0; i < 1000; i++) zebrane.add(wygenerujKod());
	assert.ok(zebrane.size > 1, 'generator zwrocil ciagle te sama wartosc');
	// A uniform six-digit draw over a thousand tries is overwhelmingly likely to
	// produce hundreds of distinct values. A generator stuck on a handful of values
	// would pass the weaker check above, so the bar is set well over it.
	assert.ok(zebrane.size > 900, `zbyt malo roznych wartosci: ${zebrane.size}`);
});

// ---------------------------------------------------------------------------
// Postac klucza i przechowywanej wartosci (T-04.1-05b, T-04.1-07)
// ---------------------------------------------------------------------------

test('klucz KV jest stabilny dla tego samego adresu i tej samej soli', async () => {
	const a = await kluczKodu(ADRES, SOL);
	const b = await kluczKodu(ADRES, SOL);
	assert.equal(a, b);
});

test('klucz KV nosi prefiks adm:kod i nie zawiera adresu w zadnej postaci', async () => {
	const klucz = await kluczKodu(ADRES, SOL);
	assert.equal(klucz.startsWith(`${PREFIKS_KODU}:`), true);
	assert.match(klucz, /^adm:kod:[0-9a-f]{16}$/);
	assert.equal(klucz.includes(ADRES), false);
	assert.equal(klucz.includes(CZESC_LOKALNA), false);
	assert.equal(klucz.includes(DOMENA), false);
});

test('klucz KV zmienia sie razem z sola, wiec skrot nie jest tablicowalny', async () => {
	const a = await kluczKodu(ADRES, SOL);
	const b = await kluczKodu(ADRES, 'inna-sol');
	assert.notEqual(a, b);
});

test('zapisana wartosc to JSON ze skrotem, terminem waznosci i licznikiem prob', async () => {
	const { zapisy, klucz } = await zapisaneWpisy('123456');
	assert.equal(zapisy.length, 1);
	assert.equal(zapisy[0].key, klucz);
	const wartosc = JSON.parse(zapisy[0].value) as Record<string, unknown>;
	assert.equal(typeof wartosc.skrot, 'string');
	assert.equal(wartosc.skrot, await skrotKodu(ADRES, '123456', SOL));
	assert.equal(wartosc.wygasa, TERAZ + TTL_KODU_S * 1000);
	assert.equal(wartosc.proby, 0);
});

test('zapisana wartosc nie zawiera kodu ani adresu jako fragmentu tekstu', async () => {
	const { zapisy } = await zapisaneWpisy('123456');
	assert.equal(zapisy[0].value.includes('123456'), false);
	assert.equal(zapisy[0].value.includes(ADRES), false);
	assert.equal(zapisy[0].value.includes(CZESC_LOKALNA), false);
});

test('zapis dostaje czas zycia sluzacy tylko sprzataniu, dluzszy niz waznosc kodu', async () => {
	const { zapisy } = await zapisaneWpisy('123456');
	assert.equal(zapisy[0].ttl, MNOZNIK_TTL_KODU * TTL_KODU_S);
	assert.ok((zapisy[0].ttl ?? 0) > TTL_KODU_S);
});

test('zaden eksport nie zwraca kodu w postaci jawnej', async () => {
	const kod = '123456';
	const { kv, magazyn } = stubKV();
	const zapis = await zapiszKod(kv, ADRES, kod, SOL, TERAZ);
	assert.equal(JSON.stringify(zapis).includes(kod), false);
	const sprawdzenie = await sprawdzKod(kv, ADRES, kod, SOL, TERAZ);
	assert.equal(JSON.stringify(sprawdzenie).includes(kod), false);
	assert.equal(
		[...magazyn.values()].some((wartosc) => wartosc.includes(kod)),
		false
	);
});

// ---------------------------------------------------------------------------
// Jednorazowosc i waznosc (SC1)
// ---------------------------------------------------------------------------

test('poprawny kod w czasie waznosci przechodzi dokladnie raz', async () => {
	const { kv, magazyn, usuniecia } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	const pierwsze = await sprawdzKod(kv, ADRES, '123456', SOL, TERAZ);
	assert.equal(pierwsze.ok, true);
	assert.equal(usuniecia.length, 1);
	assert.equal(magazyn.size, 0);

	const drugie = await sprawdzKod(kv, ADRES, '123456', SOL, TERAZ);
	assert.equal(drugie.ok, false);
});

test('kod wymieniony po uplywie waznosci jest odrzucony i skasowany', async () => {
	const { kv, magazyn } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	const wynik = await sprawdzKod(kv, ADRES, '123456', SOL, PO_WYGASNIECIU);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.powod, 'wygasl');
	assert.equal(magazyn.size, 0);
});

test('kod tuz przed koncem waznosci jeszcze dziala', async () => {
	const { kv } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	const wynik = await sprawdzKod(kv, ADRES, '123456', SOL, TERAZ + TTL_KODU_S * 1000 - 1);
	assert.equal(wynik.ok, true);
});

test('sprawdzenie bez zapisanego wpisu odmawia zamiast przepuscic', async () => {
	const { kv } = stubKV();
	const wynik = await sprawdzKod(kv, ADRES, '123456', SOL, TERAZ);
	assert.equal(wynik.ok, false);
});

// ---------------------------------------------------------------------------
// Limit prob: kod sie wypala (T-04.1-05)
// ---------------------------------------------------------------------------

test('cztery bledne proby zwracaja zwykly wynik zlego kodu i licza sie w KV', async () => {
	const { kv, magazyn } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	for (let proba = 1; proba < MAKS_PROB; proba++) {
		const wynik = await sprawdzKod(kv, ADRES, '000000', SOL, TERAZ);
		assert.equal(wynik.ok, false);
		assert.equal(wynik.ok === false && wynik.powod, 'zly-kod');
		const wpis = JSON.parse([...magazyn.values()][0]) as { proby: number };
		assert.equal(wpis.proby, proba);
	}
});

test('piata bledna proba wypala kod i zwraca wynik odrozniamy od zlego kodu', async () => {
	const { kv, magazyn, usuniecia } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	let ostatni = await sprawdzKod(kv, ADRES, '000000', SOL, TERAZ);
	for (let proba = 2; proba <= MAKS_PROB; proba++) {
		ostatni = await sprawdzKod(kv, ADRES, '000000', SOL, TERAZ);
	}
	assert.equal(ostatni.ok, false);
	assert.equal(ostatni.ok === false && ostatni.powod, 'za-duzo-prob');
	assert.notEqual(ostatni.ok === false && ostatni.powod, 'zly-kod');
	assert.equal(usuniecia.length, 1);
	assert.equal(magazyn.size, 0);
});

test('szosta proba z POPRAWNYM kodem juz nie przechodzi, bo kod zostal wypalony', async () => {
	const { kv } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	for (let proba = 1; proba <= MAKS_PROB; proba++) {
		await sprawdzKod(kv, ADRES, '000000', SOL, TERAZ);
	}
	const wynik = await sprawdzKod(kv, ADRES, '123456', SOL, TERAZ);
	assert.equal(wynik.ok, false);
});

// ---------------------------------------------------------------------------
// Czego limit prob NIE potrafi, i co to naprawia (CR-01)
//
// Both cases above drive the cap SEQUENTIALLY from one client, which is exactly the
// access pattern the counter handles correctly, and that is why neither of them could
// see the hole this section exists for. `sprawdzKod` reads the entry, adds one and
// writes it back, and that sequence is not a counter on KV. The pair below states what
// the cap really guarantees, in the same file that states what it does not.
// ---------------------------------------------------------------------------

/** A burst: every guess is started before any of them has finished, which is what a
 *  script does and what a person cannot do. Deliberately far above MAKS_PROB. */
const ROJ = 20;

test('ROJ rownoczesnych prob NIE jest ograniczony przez MAKS_PROB (nieatomowy licznik)', async () => {
	const { kv, magazyn } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);

	// Nothing is awaited between the calls, so they all read the same attempt count.
	const wyniki = await Promise.all(
		Array.from({ length: ROJ }, () => sprawdzKod(kv, ADRES, '000000', SOL, TERAZ))
	);
	const przyjete = wyniki.filter((w) => !w.ok && w.powod === 'zly-kod').length;
	const wypalone = wyniki.filter((w) => !w.ok && w.powod === 'za-duzo-prob').length;
	assert.equal(przyjete + wypalone, ROJ, 'jakas proba skonczyla sie inaczej niz zla albo wypalona');

	// THE FINDING, asserted rather than described: a burst spends more guesses than the
	// cap allows. If a future change ever made this counter atomic, this assertion goes
	// red and the comment above it stops being true, which is the correct way to learn it.
	assert.ok(
		przyjete > MAKS_PROB,
		`roj zuzyl tylko ${przyjete} prob, wiec licznik zachowal sie atomowo`
	);
	// And the entry usually survives the whole burst, having counted a single attempt.
	const zostale = [...magazyn.values()];
	if (zostale.length === 1) {
		const wpis = JSON.parse(zostale[0]) as { proby: number };
		assert.ok(wpis.proby < MAKS_PROB, 'wpis przezyl roj z licznikiem na granicy wypalenia');
	}
});

// The paired positive control. The same number of guesses, made one after another, IS
// stopped at the cap. Without this half the case above could pass on a module that had
// no cap at all.
test('te same proby po kolei sa zatrzymane na MAKS_PROB, wiec licznik nie jest martwy', async () => {
	const { kv } = stubKV();
	await zapiszKod(kv, ADRES, '123456', SOL, TERAZ);
	let przyjete = 0;
	for (let i = 0; i < ROJ; i++) {
		const wynik = await sprawdzKod(kv, ADRES, '000000', SOL, TERAZ);
		if (!wynik.ok && wynik.powod === 'zly-kod') przyjete += 1;
	}
	assert.equal(przyjete, MAKS_PROB - 1);
});

test('budzet prob przepuszcza dokladnie LIMIT_PROB zgadywan z jednego adresu', async () => {
	const { kv } = stubKV();
	let przyjete = 0;
	for (let i = 0; i < ROJ; i++) {
		if (await podLimitemProby(kv, IP, SOL, TERAZ)) przyjete += 1;
	}
	// This is the number the burst above would have been cut down to.
	assert.equal(przyjete, LIMIT_PROB);
	assert.ok(LIMIT_PROB < ROJ);
});

test('budzet prob liczy sie tez wtedy, gdy zgadywania leca rownoczesnie', async () => {
	// The limiter is a read-modify-write too, so it cannot be strict either. What it does
	// guarantee is a BOUND that is orders of magnitude below an unlimited burst, and the
	// assertion says exactly that instead of pretending to a hard ceiling.
	const { kv } = stubKV();
	const wyniki = await Promise.all(
		Array.from({ length: 200 }, () => podLimitemProby(kv, IP, SOL, TERAZ))
	);
	const przyjete = wyniki.filter(Boolean).length;
	assert.ok(przyjete < 200, 'budzet nie odrzucil ani jednej proby z rownoczesnego roju');
	// Positive control: it is not refusing everything either.
	assert.ok(przyjete > 0);
});

test('budzet prob ma wlasny kubelek: powodz zgadywan nie zabiera prawa do nowego kodu', async () => {
	const { kv } = stubKV();
	for (let i = 0; i < ROJ; i++) await podLimitemProby(kv, IP, SOL, TERAZ);
	assert.equal(await podLimitemProby(kv, IP, SOL, TERAZ), false);
	// „Wyślij kod ponownie" is the instruction the login screen keeps showing, so it has
	// to keep working for the same client after a run of wrong codes.
	assert.equal(await podLimitemKodu(kv, IP, SOL, TERAZ), true);
});

test('budzet kodow i budzet prob nie dziela ani klucza godzinowego, ani dobowego', async () => {
	assert.notEqual(PREFIKS_DOBOWY_PROB, PREFIKS_DOBOWY_PANELU);
	assert.notEqual(PREFIKS_DOBOWY_PROB, PREFIKS_DOBOWY);
	assert.equal(kluczDobowy(TERAZ, PREFIKS_DOBOWY_PROB), 'rl:doba:adm-proba:2026-08-14');

	const { kv, zapisy } = stubKV();
	await podLimitemProby(kv, IP, SOL, TERAZ);
	assert.deepEqual(
		zapisy.map((z) => z.key),
		[await kluczLimitu('admin-proba', IP, SOL, TERAZ), kluczDobowy(TERAZ, PREFIKS_DOBOWY_PROB)]
	);
});

test('budzet prob nie niesie adresu redaktora w zadnej postaci', async () => {
	const { kv, zapisy } = stubKV();
	await podLimitemProby(kv, IP, SOL, TERAZ);
	for (const zapis of zapisy) {
		assert.equal(zapis.key.includes(IP), false);
		assert.equal(zapis.key.includes(ADRES), false);
		assert.match(zapis.value, /^[0-9]+$/);
	}
});

/**
 * The direction of the degrade, and it is the OPPOSITE of podLimitemKodu and of
 * everything in ratelimit.ts. On a KV outage this budget is the only rate limit in
 * front of a guess at a 10^6 space, so it refuses. It costs an editor nothing, because
 * sprawdzKod refuses the login on the same outage anyway (the cases further down),
 * which is what makes the choice free.
 */
test('budzet prob zamyka sie przy awarii KV, zamiast wpuszczac zgadywanie', async () => {
	assert.equal(await podLimitemProby(undefined, IP, SOL, TERAZ), false);
	assert.equal(await podLimitemProby(stubKV().kv, IP, '', TERAZ), false);
	assert.equal(await podLimitemProby(stubKV().kv, IP, '   ', TERAZ), false);
	for (const gdzie of ['get', 'put'] as const) {
		assert.equal(
			await podLimitemProby(stubKVRzucajacy(gdzie), IP, SOL, TERAZ),
			false,
			`budzet przepuscil zgadywanie mimo awarii ${gdzie}`
		);
	}
	// Positive control: with a working binding and a real salt it admits the first guess,
	// so the case above cannot pass by refusing everything.
	assert.equal(await podLimitemProby(stubKV().kv, IP, SOL, TERAZ), true);
});

test('budzet wysylki kodow zostaje otwarty przy awarii KV, bo to inna decyzja', async () => {
	// P-06 unchanged: failing open there only means a code is sent to an address that is
	// already on the allowlist, and the exchange is still the boundary.
	assert.equal(await podLimitemKodu(undefined, IP, SOL, TERAZ), true);
	assert.equal(await podLimitemKodu(stubKVRzucajacy('get'), IP, SOL, TERAZ), true);
});

// ---------------------------------------------------------------------------
// Kierunek awarii: modul odmawia logowania (P-06, T-04.1-15)
// ---------------------------------------------------------------------------

test('zapiszKod bez wiazania KV zwraca blad, nigdy powodzenia', async () => {
	const wynik = await zapiszKod(undefined, ADRES, '123456', SOL, TERAZ);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.powod, 'blad');
});

test('sprawdzKod bez wiazania KV odmawia logowania zamiast je przyznac', async () => {
	const wynik = await sprawdzKod(undefined, ADRES, '123456', SOL, TERAZ);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.powod, 'blad');
});

test('zapiszKod zwraca blad, gdy zapis do KV rzuca wyjatek', async () => {
	const wynik = await zapiszKod(stubKVRzucajacy('put'), ADRES, '123456', SOL, TERAZ);
	assert.equal(wynik.ok, false);
	assert.equal(wynik.ok === false && wynik.powod, 'blad');
});

/** Each failing operation is driven with the precondition that actually reaches it:
 *  the read is reached by any exchange, the rewrite only by a WRONG code against a
 *  live entry, and the delete only by a CORRECT one. A case that skipped the
 *  precondition would pass on the missing-entry branch and prove nothing. */
test('sprawdzKod zwraca blad, gdy operacja KV rzuca wyjatek', async () => {
	const klucz = await kluczKodu(ADRES, SOL);
	const zywyWpis = JSON.stringify({
		skrot: await skrotKodu(ADRES, '123456', SOL),
		wygasa: TERAZ + TTL_KODU_S * 1000,
		proby: 0
	});
	const przypadki: ['get' | 'put' | 'delete', string][] = [
		['get', '123456'],
		['put', '000000'],
		['delete', '123456']
	];
	for (const [gdzie, kod] of przypadki) {
		const kv = stubKVRzucajacy(gdzie, { [klucz]: zywyWpis });
		const wynik = await sprawdzKod(kv, ADRES, kod, SOL, TERAZ);
		assert.equal(wynik.ok, false, `logowanie przeszlo mimo awarii ${gdzie}`);
		assert.equal(wynik.ok === false && wynik.powod, 'blad', `zly powod przy awarii ${gdzie}`);
	}
});

test('zadna awaria KV nie ucieka jako odrzucona obietnica', async () => {
	for (const gdzie of ['get', 'put', 'delete'] as const) {
		await assert.doesNotReject(() => zapiszKod(stubKVRzucajacy(gdzie), ADRES, '1', SOL, TERAZ));
		await assert.doesNotReject(() => sprawdzKod(stubKVRzucajacy(gdzie), ADRES, '1', SOL, TERAZ));
	}
});

test('brak soli jest odmowa, a nie cichym haszowaniem bez soli', async () => {
	for (const sol of ['', '   ']) {
		const stub = stubKV();
		const zapis = await zapiszKod(stub.kv, ADRES, '123456', sol, TERAZ);
		assert.equal(zapis.ok, false);
		const sprawdzenie = await sprawdzKod(stub.kv, ADRES, '123456', sol, TERAZ);
		assert.equal(sprawdzenie.ok, false);
		assert.deepEqual(stub.zapisy, []);
		assert.deepEqual(stub.odczyty, []);
		assert.deepEqual(stub.usuniecia, []);
	}
});

// ---------------------------------------------------------------------------
// Stale i wlasny budzet dobowy panelu (P-04, P-05, T-04.1-06)
// ---------------------------------------------------------------------------

test('stale kodu maja wartosci z kontraktu: 6, 900, 5, 5 i 20', () => {
	assert.equal(DLUGOSC_KODU, 6);
	assert.equal(TTL_KODU_S, 900);
	assert.equal(MAKS_PROB, 5);
	assert.equal(LIMIT_KODOW, 5);
	assert.equal(LIMIT_KODOW_DOBOWY, 20);
});

test('budzet prob jest wiekszy niz MAKS_PROB, ale wciaz znikomy wobec 10^6', () => {
	// Larger than the burn cap, so an editor retyping a code on the same screen is never
	// refused by the budget before the code itself is spent.
	assert.ok(LIMIT_PROB > MAKS_PROB);
	// And small enough that an hour of guessing buys nothing at all against six digits.
	assert.ok(LIMIT_PROB <= 20);
	// The site-wide number is a runaway guard, not the control, so it sits far above any
	// real editorial day rather than close to it.
	assert.ok(LIMIT_PROB_DOBOWY >= 100);
});

test('panel ma wlasny prefiks dobowy, rozny od prefiksu formularzy', () => {
	assert.equal(PREFIKS_DOBOWY_PANELU, 'rl:doba:adm');
	assert.notEqual(PREFIKS_DOBOWY_PANELU, PREFIKS_DOBOWY);
});

test('kluczDobowy bez prefiksu zachowuje sie dokladnie tak jak wczesniej', () => {
	assert.equal(kluczDobowy(TERAZ), 'rl:doba:2026-08-14');
});

test('kluczDobowy z prefiksem panelu daje inny klucz w tej samej chwili', () => {
	const formularze = kluczDobowy(TERAZ);
	const panel = kluczDobowy(TERAZ, PREFIKS_DOBOWY_PANELU);
	assert.notEqual(panel, formularze);
	assert.equal(panel, 'rl:doba:adm:2026-08-14');
});
