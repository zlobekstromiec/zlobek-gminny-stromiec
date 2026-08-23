// The W skrócie validator, the hours composer and the fact reader (Phase 05, Plan 05-09;
// 05-UI-SPEC Contracts 7 and 11; 05 D-32, D-33; threats T-05-09-01, T-05-09-02, T-05-09-04).
//
// THESE ARE THE EXECUTABLE ACCEPTANCE CRITERIA FOR TWO PROPERTIES WHOSE FAILURE IS LOUD AND
// SITE-WIDE:
//
//  1. The opening hours have ONE source. Five surfaces state them (the homepage tile, the
//     bar at the top of every page, the contact block, /kontakt and the footer) and until
//     this plan there were three sources, so an editor could change the strip at the top of
//     a page and leave the footer of that very page saying something else. Every composer
//     case below asserts byte identity against the value the site really shipped.
//  2. No editor input can ever become an icon key. `KeyFacts.svelte` indexes its icon map
//     with no fallback and the homepage is PRERENDERED, so a stored value reaching that map
//     would be a build failure of the whole site rather than a broken tile. The icon and the
//     tint are a code-authored four-slot table, and that is asserted here rather than
//     assumed.
//
// THE BROWSER TIER CANNOT PROVE THE PERSISTENCE HALF OF ANY OF THIS. `npm run preview:test`
// binds PANEL_DRY_RUN=1, so no Playwright save ever writes a file; a browser assertion about
// what was stored would pass whatever the rule did. Those properties are pinned HERE, in the
// unit tier, deliberately and with this note attached.
//
// Uses Node's built-in runner (no new dependency). Named *.unit.ts so Playwright's spec
// matcher never collects it. The relative imports carry the `.ts` extension, which that type
// stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	MAKS_ATOMU,
	MAKS_DOPISKU,
	POLE_DNI_PELNYCH,
	POLE_DNI_SKROTU,
	POLE_DOPISKU,
	POLE_GODZIN,
	POLE_MIEJSC,
	POLE_WEEKENDU,
	POLE_ZASTEPCZA_GODZIN,
	POLE_ZASTEPCZA_MIEJSC,
	SCIEZKA_W_SKROCIE,
	walidujWSkrocie
} from '../src/lib/server/admin/walidacja/w-skrocie.ts';
import { serializujJson } from '../src/lib/server/admin/serializuj.ts';
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../src/lib/content/panel.ts';
import {
	godzinyKafelka,
	godzinyPaska,
	godzinyStopkiDni,
	godzinyStopkiWeekend,
	godzinyStopkiZakres
} from '../src/lib/godziny.ts';
import { ATOMY_GODZIN, KAFELKI, W_SKROCIE, wSkrocieZWpisu } from '../src/lib/w-skrocie.ts';
import { CENNIK } from '../src/lib/cennik.ts';

const KORZEN = fileURLToPath(new URL('../', import.meta.url));

/** A complete, valid submission. Every case below starts from this and breaks exactly one
 *  thing, so a refusal can only ever be about the field the case is named after. The values
 *  are read from the committed store rather than retyped: the hours are editor-owned since
 *  this plan, and a fixed literal would turn a routine „the żłobek changed its hours" save
 *  into a red suite for a reason that has nothing to do with the property under test. */
function pelne(nadpisania: Record<string, string> = {}): FormData {
	const dane = new FormData();
	dane.set(POLE_GODZIN, W_SKROCIE.godziny.godziny);
	dane.set(POLE_DNI_PELNYCH, W_SKROCIE.godziny.dniPelne);
	dane.set(POLE_DNI_SKROTU, W_SKROCIE.godziny.dniSkrot);
	dane.set(POLE_WEEKENDU, W_SKROCIE.godziny.weekend);
	dane.set(POLE_MIEJSC, String(W_SKROCIE.miejsca));
	dane.set(POLE_DOPISKU, W_SKROCIE.dopisek);
	for (const [nazwa, wartosc] of Object.entries(nadpisania)) dane.set(nazwa, wartosc);
	return dane;
}

// ---------------------------------------------------------------------------
// Walidator (behaviour: refusals, key order, byte-for-byte serialization)
// ---------------------------------------------------------------------------

test('walidujWSkrocie przyjmuje komplet pol i oddaje ksztalt sklepu', () => {
	const wynik = walidujWSkrocie(pelne());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(wynik.dane.godziny.godziny, W_SKROCIE.godziny.godziny);
	assert.equal(wynik.dane.miejsca.wartosc, W_SKROCIE.miejsca);
	assert.equal(typeof wynik.dane.miejsca.wartosc, 'number');
});

test('walidujWSkrocie odmawia dla kazdego pustego atomu godzin, z wlasnym zdaniem', () => {
	// Each field gets its OWN refusal, quoting its OWN hint's example (WCAG 3.3.3). A shared
	// „uzupełnij to pole" would send somebody back to the screen to work out which example
	// applies to which of four nearly identical controls.
	const oczekiwane: [string, string][] = [
		[POLE_GODZIN, KOPIA_WALIDACJA.godzinyOtwarciaBrak],
		[POLE_DNI_PELNYCH, KOPIA_WALIDACJA.dniBrak],
		[POLE_DNI_SKROTU, KOPIA_WALIDACJA.skrotDniBrak],
		[POLE_WEEKENDU, KOPIA_WALIDACJA.weekendBrak]
	];
	for (const [nazwa, zdanie] of oczekiwane) {
		for (const puste of ['', '   ']) {
			const wynik = walidujWSkrocie(pelne({ [nazwa]: puste }));
			assert.equal(wynik.ok, false, `puste pole ${nazwa} zostalo przyjete`);
			if (wynik.ok) return;
			assert.equal(wynik.pola[nazwa], zdanie);
		}
	}
});

test('walidujWSkrocie traktuje brak pola jak odmowe, nigdy jak wartosc domyslna', () => {
	// A request that simply omitted a control must not silently blank the żłobek's opening
	// hours, which a parent would read on the front page within two minutes. Same rule
	// walidacja/nabor.ts states about its one boolean.
	for (const nazwa of [
		POLE_GODZIN,
		POLE_DNI_PELNYCH,
		POLE_DNI_SKROTU,
		POLE_WEEKENDU,
		POLE_MIEJSC
	]) {
		const dane = pelne();
		dane.delete(nazwa);
		const wynik = walidujWSkrocie(dane);
		assert.equal(wynik.ok, false, `brak pola ${nazwa} zostal przyjety`);
		if (wynik.ok) return;
		assert.ok(wynik.pola[nazwa].length > 0);
	}
});

test('walidujWSkrocie odmawia dla liczby miejsc, ktora nie jest liczba', () => {
	for (const podstepne of ['', '  ', 'pięćdziesiąt', '50 miejsc', '5o', '-1', '50.5', '12345']) {
		const wynik = walidujWSkrocie(pelne({ [POLE_MIEJSC]: podstepne }));
		assert.equal(wynik.ok, false, `wartosc ${JSON.stringify(podstepne)} zostala przyjeta`);
		if (wynik.ok) return;
		assert.equal(wynik.pola[POLE_MIEJSC], KOPIA_WALIDACJA.liczbaMiejscBrak);
	}
});

test('walidujWSkrocie przyjmuje pusty dopisek, bo jest opcjonalny', () => {
	for (const puste of ['', '   ']) {
		const wynik = walidujWSkrocie(pelne({ [POLE_DOPISKU]: puste }));
		assert.equal(wynik.ok, true, `pusty dopisek ${JSON.stringify(puste)} zostal odrzucony`);
		if (!wynik.ok) return;
		// Written as an empty string rather than omitted: a missing key would change the
		// store's byte shape and break the serialization pin below.
		assert.equal(wynik.dane.miejsca.dopisek, '');
	}
});

test('walidujWSkrocie odmawia dla atomu i dopisku dluzszych niz limit, cytujac ten limit', () => {
	const zaDlugi = walidujWSkrocie(pelne({ [POLE_GODZIN]: 'a'.repeat(MAKS_ATOMU + 1) }));
	assert.equal(zaDlugi.ok, false);
	if (zaDlugi.ok) return;
	assert.equal(zaDlugi.pola[POLE_GODZIN], tekstZaDlugi(MAKS_ATOMU));

	const dopisek = walidujWSkrocie(pelne({ [POLE_DOPISKU]: 'a'.repeat(MAKS_DOPISKU + 1) }));
	assert.equal(dopisek.ok, false);
	if (dopisek.ok) return;
	assert.equal(dopisek.pola[POLE_DOPISKU], tekstZaDlugi(MAKS_DOPISKU));
});

test('walidujWSkrocie czyta oba znaczniki tresci zastepczej niezaleznie od siebie', () => {
	// The flag is PER TILE on this screen, the first time in this project it is not per file.
	// One shared name would have made it impossible to tell which tile the editor ticked.
	for (const godziny of [false, true]) {
		for (const miejsca of [false, true]) {
			const nadpisania: Record<string, string> = {};
			if (godziny) nadpisania[POLE_ZASTEPCZA_GODZIN] = 'on';
			if (miejsca) nadpisania[POLE_ZASTEPCZA_MIEJSC] = 'on';
			const wynik = walidujWSkrocie(pelne(nadpisania));
			assert.equal(wynik.ok, true);
			if (!wynik.ok) return;
			assert.equal(wynik.dane.godziny.placeholder, godziny);
			assert.equal(wynik.dane.miejsca.placeholder, miejsca);
		}
	}
});

test('wynik walidatora ma ustalony zestaw i ustalona kolejnosc kluczy', () => {
	const wynik = walidujWSkrocie(pelne());
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.dane), ['godziny', 'miejsca']);
	assert.deepEqual(Object.keys(wynik.dane.godziny), [
		'placeholder',
		'godziny',
		'dniPelne',
		'dniSkrot',
		'weekend'
	]);
	assert.deepEqual(Object.keys(wynik.dane.miejsca), ['placeholder', 'wartosc', 'dopisek']);
});

test('ARNOSC JEST STALA: nadmiarowe pola nie tworza piatego kafelka ani trzeciej grupy', () => {
	// The structural form of „refuse an arity other than four" (05-UI-SPEC Contract 11).
	// There is no repeatable group on this screen and no index-scoped control, so nothing a
	// submission can carry is able to ASK for a fifth tile: the validator reads a closed
	// allowlist and constructs its result key by key from guarded locals. Asserted against a
	// submission that tries anyway, in every shape a hand-built request could take.
	const dane = pelne();
	dane.set('kafelek[4].label', 'Coś jeszcze');
	dane.set('kafelek[4].icon', 'smile');
	dane.set('godziny[1].godziny', '9:00–10:00');
	dane.set('icon', 'house');
	dane.set('tint', 'yellow');
	dane.set('__proto__', 'x');

	const wynik = walidujWSkrocie(dane);
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.deepEqual(Object.keys(wynik.dane), ['godziny', 'miejsca']);
	// And nothing that arrived survived into the stored object.
	const zserializowany = serializujJson(wynik.dane);
	for (const przemycone of ['kafelek', 'icon', 'tint', '__proto__', '9:00']) {
		assert.equal(
			zserializowany.includes(przemycone),
			false,
			`nadmiarowe pole ${przemycone} przetrwalo do sklepu`
		);
	}
});

test('zserializowany wynik walidatora jest bajt w bajt tym, co lezy w repozytorium', () => {
	// The panel serializes the validator's OUTPUT, so the file's shape and the validator's
	// shape cannot be allowed to drift. Read from disk rather than imported, because an
	// import would compare parsed values and would not see an indent, a key order or a
	// missing trailing newline: precisely the differences that break `prettier --check .`
	// and therefore block every local commit (D-09).
	const naDysku = readFileSync(`${KORZEN}${SCIEZKA_W_SKROCIE}`, 'utf8');
	const zapisany = JSON.parse(naDysku);
	// Driven from the state the file CURRENTLY holds, never from a fixed literal: the store
	// is editor-owned, so a routine save would otherwise turn this red for a reason that has
	// nothing to do with the byte shape, which is what is actually pinned here.
	const nadpisania: Record<string, string> = {};
	if (zapisany.godziny.placeholder) nadpisania[POLE_ZASTEPCZA_GODZIN] = 'on';
	if (zapisany.miejsca.placeholder) nadpisania[POLE_ZASTEPCZA_MIEJSC] = 'on';
	const wynik = walidujWSkrocie(pelne(nadpisania));
	assert.equal(wynik.ok, true);
	if (!wynik.ok) return;
	assert.equal(serializujJson(wynik.dane), naDysku);
});

test('sciezka, ktora panel zapisuje, wskazuje na istniejacy plik sklepu', () => {
	// A save that wrote a path nothing reads would report success to the editor, produce a
	// real commit and a real Cloudflare build, and change nothing a parent can see. That
	// failure is silent in every layer, so the path is pinned against the filesystem here.
	assert.equal(SCIEZKA_W_SKROCIE, 'src/lib/content/w-skrocie.json');
	assert.doesNotThrow(() => readFileSync(`${KORZEN}${SCIEZKA_W_SKROCIE}`, 'utf8'));
});

// ---------------------------------------------------------------------------
// Kompozytor godzin (Kontrakt 7: jedno zrodlo, piec powierzchni)
// ---------------------------------------------------------------------------

test('kompozytor sklada dokladnie te napisy, ktore strona renderowala przed unifikacja', () => {
	// The four atoms shipped today, and what each surface made of them BEFORE plan 05-09.
	// These five are the whole point of the unification: if any one of them changed, the
	// migration would have silently rewritten a rendered byte on the live site.
	const atomy = {
		godziny: '6:30–16:30',
		dniPelne: 'poniedziałek-piątek',
		dniSkrot: 'pon.-pt.',
		weekend: 'soboty i niedziele: nieczynne'
	};
	assert.equal(godzinyKafelka(atomy), '6:30–16:30');
	assert.equal(godzinyPaska(atomy), 'pon.-pt. 6:30–16:30');
	assert.equal(godzinyStopkiDni(atomy), 'poniedziałek-piątek');
	assert.equal(godzinyStopkiZakres(atomy), '6:30–16:30');
	assert.equal(godzinyStopkiWeekend(atomy), 'soboty i niedziele: nieczynne');
});

test('kompozytor jest czysty: te same atomy daja ten sam wynik i niczego nie mutuja', () => {
	const atomy = { ...ATOMY_GODZIN };
	const pierwszy = godzinyPaska(atomy);
	const drugi = godzinyPaska(atomy);
	assert.equal(pierwszy, drugi);
	assert.deepEqual(atomy, { ...ATOMY_GODZIN });
});

// ---------------------------------------------------------------------------
// Czytnik kafelkow (Kontrakt 7, zagrozenia T-05-09-01 i T-05-09-02)
// ---------------------------------------------------------------------------

test('czytnik oddaje dokladnie cztery kafelki, w kolejnosci renderowania', () => {
	assert.equal(KAFELKI.length, 4);
	assert.deepEqual(
		KAFELKI.map((kafelek) => kafelek.label),
		// Trzeci kafelek nazywa sie „Stawka z uchwaly" od quicka 260823-pmv. Etykieta MUSIALA
		// pojsc za wartoscia: kafelek prowadzi teraz stawka z uchwaly, a pod stara etykieta
		// twierdzilby na stronie glownej, ze rodzic placi 2 337 zl, czego nie robi zaden rodzic
		// w okresie obnizki.
		['Wiek dzieci', 'Godziny otwarcia', 'Stawka z uchwały', 'Liczba miejsc']
	);
});

test('IKONA I TINT POCHODZA Z KODU: zaden wpis redaktora nie moze stac sie kluczem ikony', () => {
	// T-05-09-01, and the reason no runtime icon fallback exists: the hazard is DELETED
	// rather than guarded. The four keys are a closed code-authored table, and the store is
	// asserted here not to carry either word at all, so there is no input that could reach
	// the icon map in the first place.
	const IKONY = ['smile', 'clock', 'coins', 'house'];
	const TINTY = ['yellow', 'blue', 'orange', 'green'];
	assert.deepEqual(
		KAFELKI.map((kafelek) => kafelek.icon),
		IKONY
	);
	assert.deepEqual(
		KAFELKI.map((kafelek) => kafelek.tint),
		TINTY
	);

	const naDysku = readFileSync(`${KORZEN}${SCIEZKA_W_SKROCIE}`, 'utf8');
	for (const slowo of ['icon', 'tint', ...IKONY, ...TINTY]) {
		assert.equal(naDysku.includes(slowo), false, `sklep niesie slowo z tablicy slotow: ${slowo}`);
	}
});

test('etykiety kafelkow tez pochodza z kodu, bo cztery wezly .fact-label sa zablokowane', () => {
	const naDysku = readFileSync(`${KORZEN}${SCIEZKA_W_SKROCIE}`, 'utf8');
	for (const kafelek of KAFELKI) {
		assert.equal(
			naDysku.includes(kafelek.label),
			false,
			`etykieta „${kafelek.label}" jest zapisana w sklepie, wiec redaktor moglby ja zmienic`
		);
	}
});

test('kafelek oplaty jest LICZONY ze sklepu cennika, nigdy wpisany', () => {
	// Read from the store view DIRECTLY and never through the OPLATY prose constant:
	// src/lib/content/rekrutacja.ts already imports src/lib/content/site.ts, so routing the
	// tile that way would close a cycle.
	// Od quicka 260823-pmv wartoscia kafelka jest STAWKA, a kwota placona zeszla do dopiska.
	// Obie dalej pochodza ze sklepu, wiec kafelek nie moze sie rozejsc z FeeBox ani z /cennik
	// co do zadnej z nich.
	assert.equal(KAFELKI[2].value, CENNIK.stawkaTekst);
	// GRANICA CALEJ ZMIANY: kwota faktycznie placona NIE ZNIKA z kafelka, tylko schodzi nizej.
	// Gdyby zniknela, strona glowna podawalaby stawke, ktorej nikt nie placi, i nic wiecej.
	assert.ok(
		KAFELKI[2].suffix?.includes(CENNIK.placiTekst),
		'dopisek kafelka nie niesie kwoty, ktora rodzic naprawde placi'
	);
	// And the amount really is the subtraction rather than a third stored number, which is
	// what makes „the tile, FeeBox and /cennik cannot disagree" a property and not a habit.
	assert.equal(CENNIK.placi, CENNIK.stawka - CENNIK.obnizka);
	const naDysku = readFileSync(`${KORZEN}${SCIEZKA_W_SKROCIE}`, 'utf8');
	assert.equal(
		naDysku.includes('zł'),
		false,
		'sklep kafelkow niesie kwote, wiec moze sie rozjechac z cennikiem'
	);
});

test('sufiks kafelka oplaty niesie kwote zero WYLACZNIE z warunkiem ZUS', () => {
	// dane-bip paragraf 10 punkt 1, and the reason this tile is read-only in the panel: an
	// editor shortening the note would publish a bare zero amount.
	const sufiks = KAFELKI[2].suffix ?? '';
	assert.match(
		sufiks,
		/(?<!\d)0(?!\d)\s*zł/u,
		'sufiks nie niesie kwoty zero, wiec ta regula nic nie chroni'
	);
	assert.ok(
		sufiks.includes('Aktywnie w żłobku'),
		'kwota zero bez warunku, na jakim rodzic jej nie placi'
	);
});

test('kafelki godzin i liczby miejsc pochodza ze sklepu, wiec redaktor je zmienia', () => {
	assert.equal(KAFELKI[1].value, W_SKROCIE.godziny.godziny);
	assert.equal(KAFELKI[3].value, String(W_SKROCIE.miejsca));
});

test('czytnik degraduje do wartosci z kodu, zamiast rzucac, gdy sklep ma zly ksztalt', () => {
	// T-05-09-01. The homepage is PRERENDERED, so a throw here would be a build failure of
	// the WHOLE site rather than a broken tile. Every shape below returns null, which the
	// module turns into the code-authored defaults.
	const zle: unknown[] = [
		null,
		undefined,
		'6:30–16:30',
		42,
		[],
		{},
		{ godziny: null, miejsca: { wartosc: 50 } },
		{ godziny: [], miejsca: { wartosc: 50 } },
		{
			godziny: { godziny: '', dniPelne: 'a', dniSkrot: 'b', weekend: 'c' },
			miejsca: { wartosc: 50 }
		},
		{ godziny: { godziny: 'a', dniPelne: 'b', dniSkrot: 'c', weekend: 'd' }, miejsca: null },
		{
			godziny: { godziny: 'a', dniPelne: 'b', dniSkrot: 'c', weekend: 'd' },
			miejsca: { wartosc: '50' }
		},
		{
			godziny: { godziny: 'a', dniPelne: 'b', dniSkrot: 'c', weekend: 'd' },
			miejsca: { wartosc: -1 }
		},
		{
			godziny: { godziny: 'a', dniPelne: 'b', dniSkrot: 'c', weekend: 'd' },
			miejsca: { wartosc: 50.5 }
		}
	];
	for (const wpis of zle) {
		assert.equal(
			wSkrocieZWpisu(wpis),
			null,
			`zly sklep ${JSON.stringify(wpis)} zostal przyjety zamiast odrzucony`
		);
	}
	// And the module-scope value is a real view whatever happens, so no consumer ever sees
	// undefined.
	assert.equal(typeof W_SKROCIE.godziny.godziny, 'string');
	assert.ok(W_SKROCIE.godziny.godziny.length > 0);
});

test('czytnik buduje wynik klucz po kluczu, wiec nadmiarowy klucz sklepu nie przezywa', () => {
	const widok = wSkrocieZWpisu({
		godziny: {
			placeholder: true,
			godziny: '7:00–17:00',
			dniPelne: 'poniedziałek-piątek',
			dniSkrot: 'pon.-pt.',
			weekend: 'nieczynne',
			icon: 'smile',
			przemycone: 'x'
		},
		miejsca: { placeholder: false, wartosc: 60, dopisek: '', tint: 'yellow' }
	});
	assert.notEqual(widok, null);
	if (widok === null) return;
	assert.deepEqual(Object.keys(widok), [
		'godziny',
		'godzinyZastepcze',
		'miejsca',
		'dopisek',
		'miejscaZastepcze'
	]);
	assert.deepEqual(Object.keys(widok.godziny), ['godziny', 'dniPelne', 'dniSkrot', 'weekend']);
});

test('pusty dopisek nie renderuje drugiego wiersza kafelka liczby miejsc', () => {
	// „No note" has to mean „no node", or the tile would gain an empty line the day somebody
	// cleared the field, and the strip's locked geometry would shift under it.
	const widok = wSkrocieZWpisu({
		godziny: {
			placeholder: false,
			godziny: 'a',
			dniPelne: 'b',
			dniSkrot: 'c',
			weekend: 'd'
		},
		miejsca: { placeholder: false, wartosc: 50, dopisek: '   ' }
	});
	assert.notEqual(widok, null);
	assert.equal(widok?.dopisek, '');
});
