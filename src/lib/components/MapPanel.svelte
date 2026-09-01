<script lang="ts">
	// Map panel (CONTACT-02, D-17; 04-UI-SPEC.md Component Contract 12).
	//
	// Design contract tokens used: --radius-md (figure), --color-surface-warm
	// (backing), --color-border-strong (1px outline), --color-muted + 13px Nunito
	// (figcaption, v1.1 type step), --color-brand-blue / --color-brand-blue-hover
	// (attribution + directions link), --radius-pill + --color-band (secondary
	// button treatment, mirroring Cta.svelte's secondary variant).
	//
	// NEVER an embedded third-party map frame, script or live tile URL: the snapshot
	// is a committed same-origin asset so no third party sees a visitor's IP on page
	// load (locked RODO decision). Regenerate it with `node scripts/make-map.mjs`.
	//
	// The OpenStreetMap attribution in the figcaption is MANDATORY (OSMF tile
	// usage policy): it must stay visible, must not be clipped and must never be
	// collapsed behind a toggle.
	//
	// Rendered by the homepage ContactAndMap section and by /kontakt, so the two
	// pages cannot show different maps or different directions targets.
	import { contact } from '$lib/content/site';

	let {
		alt = `Mapa okolicy żłobka: ${contact.addressLines[0]} w Stromcu, z zaznaczonym położeniem placówki`
	}: { alt?: string } = $props();

	// PLACEHOLDER: the same street-centroid coordinates the snapshot is generated
	// from (scripts/make-map.mjs). ul. Radomska 72 has no house-number point in
	// OpenStreetMap; confirming the exact building position is a launch gate. Both
	// the pin and this route destination read one pair of numbers, so they cannot
	// disagree.
	const LAT = 51.6382;
	const LON = 21.08571;
	const directionsUrl = `https://www.openstreetmap.org/directions?to=${LAT}%2C${LON}`;
</script>

<div class="map-col">
	<figure class="map-figure">
		<!-- Literal src with explicit `w=` (not a `?enhanced` import) on purpose: the
		     import form makes enhanced-img emit 1x/2x DENSITY descriptors, and a
		     browser ignores `sizes` when densities are used, so a DPR-1 desktop would
		     upscale the 512px rendition into the ~580px column and soften the map's
		     small street labels. Width descriptors let `sizes` choose properly. The
		     widths span exactly the range the layout uses: about 580px at lg, and full
		     viewport width below that. -->
		<enhanced:img
			src="../assets/map/stromiec-radomska-72.png?w=1024;768;640;512"
			{alt}
			sizes="(min-width:1024px) 580px, 100vw"
		/>
		<figcaption>
			Mapa: dane
			<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
				&copy; współtwórcy OpenStreetMap<span class="visually-hidden">
					(otwiera się w nowej karcie)</span
				>
			</a>
		</figcaption>
	</figure>

	<a class="map-link" href={directionsUrl} target="_blank" rel="noopener noreferrer">
		Wyznacz trasę<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
	</a>
</div>

<style>
	.map-col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.map-figure {
		width: 100%;
		margin: 0;
	}

	/* enhanced:img renders <picture><img>: style the generated img directly.

	   CONCENTRICITY AUDIT, 260901-amq row (c): --radius-md STAYS, already compliant. D-2 left
	   this row open and the verdict is that nothing is wrong with it. The image has no rounded
	   container and no inset, so the law produces no number; the value is a scale choice, and
	   card scale is the right one here, because this panel sits in the contact column beside the
	   address block rather than leading a page the way a hero image does. */
	.map-figure :global(img) {
		display: block;
		width: 100%;
		min-height: 260px;
		max-height: 380px;
		object-fit: cover;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-strong);
	}

	.map-figure figcaption {
		margin-top: 8px;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 400;
		line-height: 1.4;
		color: var(--color-muted);
	}

	.map-figure figcaption a {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.map-figure figcaption a:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Secondary button treatment (never amber), mirroring Cta.svelte .secondary. */
	.map-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-height: 44px;
		padding: 10px 24px;
		border-radius: var(--radius-pill);
		background: transparent;
		border: 2px solid var(--color-brand-blue);
		color: var(--color-brand-blue);
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.4;
		text-decoration: none;
		transition: background-color 150ms ease;
	}

	.map-link:hover {
		background: var(--color-band);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
