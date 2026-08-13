<script lang="ts">
	// O nas page (ABOUT-01; 02-UI-SPEC Component Contracts /o-nas section order 1-7).
	// Prerendered, zero-JS (inherits prerender = true from +layout.ts): NO +server.ts,
	// NO extra <main>/landmark, NO extra h1 beyond the page heading (layout owns <main>).
	//
	// Content is imported at build from the strict o-nas.json singleton (D-05). Narrative
	// fields render with renderInline ($lib/markdown): marked with a hardened renderer
	// that escapes raw inline HTML, drops unsafe link protocols, and flattens images, so
	// only paragraphs/bold/links reach the DOM (D-08); the public CSP (script-src 'self')
	// is the second, not the only, layer. Facility images are optimized by
	// enhanced-img (AVIF/WebP srcset, width/height, no CLS) and resolved by BASENAME so the
	// route is decoupled from whether Plan 04's Sveltia config stores a filename or a path.
	// Plan dnia reuses DayPlan verbatim (D-03: single shared source). Kadra is a collective
	// narrative + headcount by role, no individual profiles or staff photos (D-02).
	import type { Picture } from '@sveltejs/enhanced-img';
	import Seo from '$lib/components/Seo.svelte';
	import DayPlan from '$lib/components/DayPlan.svelte';
	import Cta from '$lib/components/Cta.svelte';
	import { renderInline } from '$lib/markdown';
	import onas from '$lib/content/o-nas.json';

	// Statically-analyzable glob: keys are absolute file paths, values are processed
	// enhanced-img Picture objects. Map by final path segment (basename) for lookup.
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const byName: Record<string, Picture> = {};
	for (const [path, mod] of Object.entries(uploads)) {
		const base = path.split('/').pop();
		if (base) byName[base] = mod;
	}
	const facility = onas.obiekt_zdjecia
		.map((item) => ({ alt: item.alt, pic: byName[item.plik.split('/').pop() ?? item.plik] }))
		.filter((item): item is { alt: string; pic: Picture } => Boolean(item.pic));

	// D-08: inline render only (single paragraph, bold + links), sanitized by the
	// hardened renderer in $lib/markdown (raw HTML escaped, unsafe hrefs dropped).
	const misjaHtml = renderInline(onas.misja);
	const kadraHtml = renderInline(onas.kadra_opis);
	const obiektHtml = renderInline(onas.obiekt_opis);
</script>

<Seo
	title="O nas: Żłobek Gminny w Stromcu"
	description="Poznaj żłobek gminny w Stromcu: naszą misję, wartości, plan dnia, kadrę oraz miejsce, w którym Twoje dziecko spędza dzień."
	canonical="/o-nas"
/>

<!-- 1. Page header -->
<header class="page-head">
	<div class="inner">
		<h1>O nas</h1>
		<p class="lead">{onas.lead}</p>
	</div>
</header>

<!-- 2. Misja (warm surface) -->
<section class="band warm" aria-labelledby="misja-heading">
	<div class="inner narrow">
		<h2 id="misja-heading">Nasza misja</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html misjaHtml}</p>
	</div>
</section>

<!-- 3. Wartości -->
<section class="band" aria-labelledby="wartosci-heading">
	<div class="inner">
		<h2 id="wartosci-heading">Nasze wartości</h2>
		<ul class="values">
			{#each onas.wartosci as wartosc (wartosc.tytul)}
				<li class="value-card">
					<h3>{wartosc.tytul}</h3>
					<p>{wartosc.opis}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- 4. Plan dnia (reused DayPlan, single shared source, D-03) -->
<DayPlan />

<!-- 5. Kadra (warm surface; collective narrative + headcount, D-02) -->
<section class="band warm" aria-labelledby="kadra-heading">
	<div class="inner narrow">
		<h2 id="kadra-heading">Nasza kadra</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html kadraHtml}</p>
		<dl class="headcount">
			<div class="stat">
				<dd class="stat-value">{onas.kadra_opiekunki}</dd>
				<dt class="stat-label">opiekunki</dt>
			</div>
			<div class="stat">
				<dd class="stat-value">{onas.kadra_personel}</dd>
				<dt class="stat-label">personel pomocniczy</dt>
			</div>
		</dl>
	</div>
</section>

<!-- 6. Nasze miejsce (facility story + optimized image grid, D-04/D-07) -->
<section class="band" aria-labelledby="obiekt-heading">
	<div class="inner">
		<h2 id="obiekt-heading">Nasze miejsce</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html obiektHtml}</p>
		{#if facility.length > 0}
			<ul class="gallery">
				{#each facility as photo (photo.alt)}
					<li>
						<enhanced:img src={photo.pic} alt={photo.alt} sizes="(min-width:768px) 50vw, 100vw" />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<!-- 7. Closing CTA (inherited primary variant) -->
<section class="band warm cta-band">
	<div class="inner">
		<Cta href="/rekrutacja" variant="primary" icon>Zapisz dziecko</Cta>
	</div>
</section>

<style>
	.page-head {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.band {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.band.warm {
		background: var(--color-surface-warm);
	}

	@media (min-width: 1024px) {
		.page-head,
		.band {
			padding-block: 64px;
		}
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	.inner.narrow {
		max-width: 52rem;
	}

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
		}
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.1;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.lead {
		font-family: var(--font-body);
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-muted);
		max-width: 56ch;
		margin: 0;
	}

	h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.prose {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		max-width: 65ch;
		margin: 0;
	}

	/* Narrative links follow the inherited body-link rule (brand-blue + underline). */
	.prose :global(a) {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.prose :global(a:hover) {
		color: var(--color-brand-blue-hover);
	}

	.prose :global(strong) {
		font-weight: 700;
	}

	/* Wartości: responsive 1 -> 2 -> 3 card grid (static informational cards). */
	.values {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.values {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.values {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.value-card {
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 16px;
	}

	@media (min-width: 1024px) {
		.value-card {
			padding: 24px;
		}
	}

	.value-card h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 8px;
	}

	.value-card p {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
	}

	/* Kadra headcount: plain dl per the v1.2 KeyFacts a11y ruling (no axe-flagged
	   list wrapping). Value 26px Baloo 700 ink + label 14px Nunito 700 muted. */
	.headcount {
		display: flex;
		flex-wrap: wrap;
		gap: 32px;
		margin: 24px 0 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 26px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.stat-label {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14px;
		color: var(--color-muted);
	}

	/* Facility gallery: 1 col -> 2 col image grid, radius-lg slots. */
	.gallery {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.gallery {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.gallery :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
	}

	.cta-band .inner {
		display: flex;
		justify-content: center;
	}
</style>
