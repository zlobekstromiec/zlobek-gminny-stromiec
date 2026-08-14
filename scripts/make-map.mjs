#!/usr/bin/env node
/**
 * make-map -- generates the static OpenStreetMap snapshot rendered by
 * src/lib/components/MapPanel.svelte (CONTACT-02, D-17).
 *
 * WHY the asset is generated ONCE and committed, never fetched at runtime:
 * embedding a third-party map (an inline frame, Leaflet, MapLibre, any live tile
 * URL) makes every visitor's browser talk to a third party on page load, which
 * leaks their IP and User-Agent. On a public-body site carrying children's data
 * that is a locked RODO ban (D-17). A committed PNG served same-origin fires zero
 * third-party requests. The mandatory OSM attribution therefore ships in the
 * component, not in a tile layer's built-in control.
 *
 * WHY it is not wired into `npm run build` or `npm run test`: repeatedly pulling
 * tiles from the OSMF servers on every CI run is exactly the bulk/systematic
 * downloading their tile usage policy forbids. This script is run BY HAND, rarely.
 *
 * WHEN to re-run it:
 *   1. when the exact building position for ul. Radomska 72 is confirmed (see the
 *      PLACEHOLDER on the coordinates below) -- update LAT/LON, re-run, re-commit;
 *   2. if the snapshot's street labels ever become illegible at the rendered size
 *      -- raise ZOOM to 17 and shrink the crop proportionally.
 *
 * Run with:  node scripts/make-map.mjs
 * Requires:  sharp (present transitively via the pinned @sveltejs/enhanced-img)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src', 'lib', 'assets', 'map', 'stromiec-radomska-72.png');

// PLACEHOLDER: ul. Radomska 72 has NO house-number point in OpenStreetMap, so
// 51.63820, 21.08571 is the centroid of ul. Radomska in Stromiec, not the building.
// Confirming the exact position of the żłobek is a launch-gate item (Phase 6).
// MapPanel.svelte derives its directions link from the same two numbers, so the pin
// drawn here and the route destination can never disagree.
const LAT = 51.6382;
const LON = 21.08571;

const ZOOM = 16;
const TILE = 256;
const COLS = 4; // 4 x 256 = 1024px wide
const ROWS = 3; // 3 x 256 =  768px tall (cropped to 640 below)
const CROP_H = 640;

// The OSMF tile usage policy requires a descriptive, identifying User-Agent and
// forbids anonymous or bulk fetching. Twelve tiles, fetched by hand, once.
const USER_AGENT =
	'zlobekstromiec.pl static map snapshot generator (one-off, build-time; contact: zlobek@ugstromiec.pl)';

/** Standard Web Mercator (slippy map) projection, in fractional tile units. */
function project(lat, lon, zoom) {
	const n = 2 ** zoom;
	const rad = (lat * Math.PI) / 180;
	return {
		x: ((lon + 180) / 360) * n,
		y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
	};
}

async function fetchTile(z, x, y) {
	const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'image/png' } });
	// Refuse to continue rather than silently substituting another tile provider:
	// a different provider carries different attribution requirements, and shipping
	// an image whose attribution does not match its source is a licence violation.
	if (!res.ok) {
		throw new Error(`tile ${z}/${x}/${y} returned HTTP ${res.status} ${res.statusText}`);
	}
	return Buffer.from(await res.arrayBuffer());
}

/** Brand-blue teardrop pin with a white halo so it stays visible over any tile. */
function pinSvg() {
	return Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
  <path d="M20 51C20 51 36 30.5 36 19A16 16 0 1 0 4 19C4 30.5 20 51 20 51Z"
        fill="#0369a1" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="20" cy="19" r="6" fill="#ffffff"/>
</svg>`
	);
}

async function main() {
	const point = project(LAT, LON, ZOOM);
	const centreTileX = Math.floor(point.x);
	const centreTileY = Math.floor(point.y);
	// 4 wide has no exact centre column: bias left by two so the point sits in the
	// right-of-centre column, which keeps the full street run in frame.
	const originX = centreTileX - Math.floor(COLS / 2);
	const originY = centreTileY - Math.floor(ROWS / 2);

	console.log(`fetching ${COLS * ROWS} tiles at z${ZOOM} around ${LAT}, ${LON}`);
	const composites = [];
	for (let dy = 0; dy < ROWS; dy += 1) {
		for (let dx = 0; dx < COLS; dx += 1) {
			const x = originX + dx;
			const y = originY + dy;
			composites.push({ input: await fetchTile(ZOOM, x, y), left: dx * TILE, top: dy * TILE });
		}
	}

	// Pixel position of the coordinates inside the assembled grid.
	const px = Math.round((point.x - originX) * TILE);
	const py = Math.round((point.y - originY) * TILE);
	composites.push({ input: pinSvg(), left: px - 20, top: py - 52 });

	const gridH = ROWS * TILE;
	const grid = await sharp({
		create: {
			width: COLS * TILE,
			height: gridH,
			channels: 3,
			background: { r: 242, g: 239, b: 233 }
		}
	})
		.composite(composites)
		.png()
		.toBuffer();

	// Centred landscape crop, nudged only as far as needed to keep the pin in frame.
	const centredTop = Math.round((gridH - CROP_H) / 2);
	const top = Math.min(Math.max(centredTop, 0), gridH - CROP_H);
	if (py - 52 < top || py > top + CROP_H) {
		throw new Error(`pin at y=${py} falls outside the ${CROP_H}px crop starting at ${top}`);
	}

	const out = await sharp(grid)
		.extract({ left: 0, top, width: COLS * TILE, height: CROP_H })
		.png({ compressionLevel: 9 })
		.toBuffer();

	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, out);
	console.log(`wrote ${OUT} (${out.length} bytes), pin at ${px},${py}, crop top ${top}`);
}

main().catch((err) => {
	console.error(`make-map failed: ${err.message}`);
	process.exit(1);
});
