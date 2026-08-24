// Published photo descriptions may not label people by who they are (260824-t8n).
//
// WHY THIS IS A TEST AND NOT A NOTE IN A STYLE GUIDE. Six descriptions shipped reading
// „Kobieta przemawia przy mównicy" about what may well be the żłobek's own director, and
// at the time the Lightbox printed that sentence UNDER the photograph as visible prose.
// The visible line has since been removed, so these strings are now only the images' `alt`
// attributes, read aloud rather than printed.
//
// THAT CHANGE MAKES THIS GUARD NARROWER, NOT POINTLESS. The subjects are still real,
// identifiable people photographed at a public event, the text is still content the żłobek
// publishes about them, and „who is standing there" is still a guess where „what is
// happening" is an observation. Alt text conventionally describes people by appearance
// because someone who cannot see the photo has no other way to know who is in it; that
// convention is defensible for a stock photograph and presumptuous for a named guest at
// their own institution's opening.
//
// THE RULE THIS ENCODES: describe the ROLE and the ACTION, not the body. „Przemówienie
// przy mównicy" is both more informative and less presumptuous than „Kobieta przemawia",
// and it is better alt text on its own merits: it says what the picture SHOWS.
// Role words that describe what someone is DOING at the event („ksiądz" reading a
// blessing) are fine and are deliberately not caught here: they carry information, and
// they are evident from the act itself rather than guessed from a face.
//
// Reads from disk rather than importing, like tests/zastepcze.unit.ts, because the
// assertion is about the bytes that ship and JSON added by a later plan must join the
// sweep without anybody remembering to add it here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KATALOG_TRESCI = fileURLToPath(new URL('../src/lib/content', import.meta.url));

/** Bare demographic labels for a person, as a SOURCE string rather than a literal. Matches
 *  whole words in any Polish inflection (`kobieta`, `kobiety`, `kobiet`, `mężczyzna`,
 *  `mężczyzn`, ...) with Unicode-aware boundaries, because JavaScript's `\b` does not
 *  understand `ż` or `ę`. */
const ZRODLO_ZAKAZANYCH = '(?<!\\p{L})(kobiet\\p{L}*|mężczyzn\\p{L}*|mężczyźn\\p{L}*)(?!\\p{L})';

/**
 * A FRESH regex per call, and that is load bearing rather than fussy.
 *
 * A shared `/g/` literal carries `lastIndex` between uses, and the two APIs here disagree
 * about it: `String.prototype.match` ignores it, while `assert.match` goes through
 * `RegExp.test`, which both reads and advances it. A single shared constant therefore made
 * the sweep below work and the positive control at the bottom of this file fail on its
 * SECOND assertion, having silently resumed from halfway through the previous string.
 */
function zakazane(): RegExp {
	return new RegExp(ZRODLO_ZAKAZANYCH, 'giu');
}

/** Every `.json` file under src/lib/content, walked off disk (collections included). */
function plikiTresci(katalog: string = KATALOG_TRESCI, prefiks: string = ''): string[] {
	const zebrane: string[] = [];
	for (const wpis of readdirSync(katalog, { withFileTypes: true })) {
		const wzgledna = prefiks ? `${prefiks}/${wpis.name}` : wpis.name;
		if (wpis.isDirectory()) zebrane.push(...plikiTresci(`${katalog}/${wpis.name}`, wzgledna));
		else if (wpis.name.endsWith('.json')) zebrane.push(wzgledna);
	}
	return zebrane;
}

/** Every published image description in the content tree, with where it came from. Covers
 *  the post cover (`obraz_alt`), a post's own gallery and the facility gallery, since all
 *  three end up in front of a visitor. */
function opisyZdjec(): { gdzie: string; tekst: string }[] {
	const zebrane: { gdzie: string; tekst: string }[] = [];
	for (const plik of plikiTresci()) {
		const dane: unknown = JSON.parse(readFileSync(`${KATALOG_TRESCI}/${plik}`, 'utf8'));
		if (typeof dane !== 'object' || dane === null || Array.isArray(dane)) continue;
		const rekord = dane as Record<string, unknown>;
		if (typeof rekord.obraz_alt === 'string') {
			zebrane.push({ gdzie: `${plik}.obraz_alt`, tekst: rekord.obraz_alt });
		}
		for (const klucz of ['zdjecia'] as const) {
			const lista = rekord[klucz];
			if (!Array.isArray(lista)) continue;
			lista.forEach((wpis, i) => {
				if (typeof wpis !== 'object' || wpis === null) return;
				const alt = (wpis as Record<string, unknown>).alt;
				if (typeof alt === 'string')
					zebrane.push({ gdzie: `${plik}.${klucz}[${i}].alt`, tekst: alt });
			});
		}
	}
	return zebrane;
}

test('sweep widzi jakiekolwiek opisy, wiec nie przechodzi przez pustke', () => {
	assert.ok(opisyZdjec().length > 0, 'nie znaleziono ani jednego opisu zdjecia');
});

test('zaden publikowany opis zdjecia nie etykietuje osoby plcia', () => {
	const winne = opisyZdjec()
		.map(({ gdzie, tekst }) => ({ gdzie, tekst, trafienia: tekst.match(zakazane()) }))
		.filter(({ trafienia }) => trafienia !== null);

	assert.deepEqual(
		winne.map(({ gdzie, trafienia }) => `${gdzie}: ${trafienia?.join(', ')}`),
		[],
		'Opis zdjecia jest tresc publikowana o realnych, rozpoznawalnych osobach. ' +
			'Opisz ROLE i CZYNNOSC („Przemowienie przy mownicy"), nie osobe („Kobieta przemawia").'
	);
});

// The positive control. Without it the sweep above could pass because the pattern is
// broken rather than because the content is clean, which is the failure mode a regex-based
// guard actually dies of.
test('wzorzec naprawde lapie etykiete, wiec zielony sweep cos znaczy', () => {
	assert.match('Kobieta przemawia przy mównicy', zakazane());
	assert.match('Dwie kobiety przed budynkiem', zakazane());
	assert.match('Mężczyzna w garniturze', zakazane());
	// And does not fire on the words that legitimately appear in these descriptions.
	assert.doesNotMatch('Ksiądz odczytuje modlitwę poświęcenia', zakazane());
	assert.doesNotMatch('Powitanie w szatni żłobka, przy dużej maskotce', zakazane());
	assert.doesNotMatch('Przekazanie upominków: pluszowa maskotka i ozdobna torba', zakazane());
});
