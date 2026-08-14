<script lang="ts">
	// Kontakt page (CONTACT-01, CONTACT-02, CONTACT-03; D-16, D-17). Follows the
	// 04-UI-SPEC.md Amendment v1.4 „/kontakt - full contact page" composition table
	// section for section: page header (white), contact cards (band), map (white),
	// form (warm), Urząd Gminy info box (white).
	//
	// Static, zero-JavaScript content with exactly ONE hydrated island: the contact
	// form. The site-wide static-output flag is set once in src/routes/+layout.ts and
	// is deliberately NOT restated here; its literal name is grep-banned in this file
	// (acceptance gate for this plan), so it is described rather than written.
	//
	// The layout owns <main>, so this route adds no wrapper landmark and no heading
	// above its own h1. Heading order: h1 here, then one h2 per section, one of which
	// (the form card's) is rendered by the island and is referenced by id from the
	// section that contains it.
	//
	// The map is a committed same-origin snapshot rendered by the SHARED MapPanel
	// component, never an embedded third-party map frame (RODO, D-17). Sharing the
	// component with the homepage ContactAndMap section is what makes it impossible
	// for the two pages to show different maps or different route destinations.
	//
	// Every contact fact is interpolated from $lib/content/site: no address, phone
	// number, e-mail or opening-hours string is written as a literal anywhere in this
	// file, including in the head metadata below.
	import Clock from '@lucide/svelte/icons/clock';
	import Info from '@lucide/svelte/icons/info';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import KontaktForm from '$lib/components/KontaktForm.svelte';
	import MapPanel from '$lib/components/MapPanel.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { contact, urzad } from '$lib/content/site';
</script>

<Seo
	title="Kontakt: Publiczny Żłobek w Stromcu"
	description="Adres, telefon, e-mail i godziny otwarcia Publicznego Żłobka w Stromcu. Napisz do nas przez formularz kontaktowy albo zadzwoń w dni robocze."
	canonical="/kontakt"
/>

<!-- Section 1: page header (white surface). Copy verbatim from the UI-SPEC page
     chrome table. -->
<header class="page-head">
	<div class="inner">
		<h1>Kontakt</h1>
		<p class="lead">Napisz do nas lub zadzwoń. Odpowiadamy w dni robocze.</p>
	</div>
</header>

<!-- Section 2: contact cards (band surface). Same item contract as the homepage
     ContactAndMap section (Lucide icon 22px + label + value), reading site.ts. This
     page owns its own tel: and mailto: links: the single-mailto rule is a per-page
     rule that belongs to the homepage, and the contact page legitimately gets its
     own. The invented żłobek office-hours line is deliberately absent (Plan 02). -->
<section class="sekcja band" aria-labelledby="dane-heading">
	<div class="inner">
		<h2 id="dane-heading">Dane kontaktowe</h2>
		<ul class="contact-grid">
			<li class="item">
				<MapPin class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Adres</span>
					<span class="item-value">{contact.addressLines[0]}<br />{contact.addressLines[1]}</span>
				</div>
			</li>

			<li class="item">
				<Phone class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Telefon</span>
					<a class="item-link" href={contact.phoneHref}>{contact.phoneDisplay}</a>
				</div>
			</li>

			<li class="item">
				<Mail class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">E-mail</span>
					<a class="item-link" href="mailto:{contact.email}">{contact.email}</a>
				</div>
			</li>

			<li class="item">
				<Clock class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Godziny otwarcia</span>
					<span class="item-value">{contact.hours}</span>
				</div>
			</li>
		</ul>
	</div>
</section>

<!-- Section 3: map (white surface). MapPanel owns the figure, the mandatory
     OpenStreetMap attribution and the directions link; none of the three is
     re-implemented here. -->
<section class="sekcja" aria-labelledby="mapa-heading">
	<div class="inner">
		<h2 id="mapa-heading">Mapa dojazdu</h2>
		<div class="mapa">
			<MapPanel />
		</div>
	</div>
</section>

<!-- Section 4: contact form (warm surface). The island renders the static fallback
     panel, the noscript note, the form card with its own h2, the consent block and
     the klauzula, so this section contributes only the band wrapper. The section is
     labelled by that card heading (id declared in KontaktForm.svelte), which is the
     correct accessible name for it and avoids a duplicated invisible heading. -->
<section class="sekcja warm" aria-labelledby="formularz-naglowek">
	<div class="inner">
		<KontaktForm />
	</div>
</section>

<!-- Section 5: Urząd Gminy info box (white surface, tint-blue panel). D-16: a
     parent must not be left thinking the żłobek accepts wnioski. The name, street,
     room and hours come from `urzad`, never pasted, and the sentence is phrased so
     the nominative form of the interpolated name stays grammatical Polish (the same
     construction site.ts already uses for the recruitment steps). -->
<section class="sekcja" aria-labelledby="urzad-heading">
	<div class="inner">
		<div class="urzad-panel">
			<Info class="urzad-ikona" size={22} aria-hidden="true" focusable="false" />
			<div>
				<h2 id="urzad-heading">Wnioski rekrutacyjne składasz w Urzędzie Gminy</h2>
				<p>
					Żłobek nie przyjmuje wniosków o przyjęcie dziecka. Wnioski przyjmuje {urzad.name}, {urzad
						.addressLines[0]}, {urzad.room}, w godzinach {urzad.wnioskiHours}. Wniosek wraz z
					załącznikami składa się osobiście.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* Surface rhythm and the responsive container are the established /dokumenty
	   route contract, reused verbatim so spacing and gutters cannot drift. */
	.page-head,
	.sekcja {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.sekcja.band {
		background: var(--color-band);
	}

	.sekcja.warm {
		background: var(--color-surface-warm);
	}

	@media (min-width: 1024px) {
		.page-head,
		.sekcja {
			padding-block: 64px;
		}
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
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

	.sekcja h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 28px;
	}

	/* Contact item grid, markup and typography identical to ContactAndMap.svelte.
	   With no map column beside it, the grid is the 2x2 the composition table asks
	   for from 640px up. */
	.contact-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		align-content: start;
	}

	@media (min-width: 640px) {
		.contact-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 28px 24px;
		}
	}

	.item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.item :global(.item-icon) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}

	.item-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.item-label {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
	}

	.item-value {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.item-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-brand-blue);
		text-decoration: underline;
		overflow-wrap: anywhere;
	}

	.item-link:hover {
		color: var(--color-brand-blue-hover);
	}

	/* The map column is authored full-width inside MapPanel; capping it here keeps
	   the snapshot at the size its `sizes` attribute was tuned for (Plan 02). */
	.mapa {
		max-width: 46rem;
	}

	/* Info box: tint-blue panel with the info icon (UI-SPEC Contract 8 treatment
	   applied to the D-16 panel). Its heading is a section-level h2 at panel size. */
	.urzad-panel {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		max-width: 46rem;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-tint-blue);
	}

	@media (min-width: 768px) {
		.urzad-panel {
			padding: 24px;
		}
	}

	.urzad-panel :global(.urzad-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}

	.urzad-panel h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}

	.urzad-panel p {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}
</style>
