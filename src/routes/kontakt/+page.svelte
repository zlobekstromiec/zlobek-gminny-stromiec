<script lang="ts">
	// Kontakt page (CONTACT-01, CONTACT-02, CONTACT-03; D-16, D-17). Composition per
	// 01-UI-SPEC Amendment v1.6 §8 (supersedes the v1.4 table): page header (white),
	// then ONE band holding Dane kontaktowe beside Mapa dojazdu at >=1024px (the
	// homepage ContactAndMap ratio), then ONE warm zone where the form card fills the
	// left track and the FallbackPanel + Urząd Gminy info box sit in the right rail.
	// DOM order stays the mobile order and no CSS `order` is used.
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
	import Hash from '@lucide/svelte/icons/hash';
	import Info from '@lucide/svelte/icons/info';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import FallbackPanel from '$lib/components/FallbackPanel.svelte';
	import KontaktForm from '$lib/components/KontaktForm.svelte';
	import MapPanel from '$lib/components/MapPanel.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { contact, urzad } from '$lib/content/site';

	// The Polish NIP is written 000-000-00-00. The store keeps bare digits (one canonical
	// value, nothing downstream has to strip separators), so the grouping is applied here,
	// at the only surface that shows it. Built from the stored string rather than typed out
	// a second time, so the two cannot disagree.
	const nipDoWyswietlenia = [
		contact.nip.slice(0, 3),
		contact.nip.slice(3, 6),
		contact.nip.slice(6, 8),
		contact.nip.slice(8, 10)
	].join('-');
</script>

<Seo
	title="Kontakt: Publiczny Żłobek w Stromcu"
	description="Adres, e-mail i godziny otwarcia Publicznego Żłobka w Stromcu. Napisz do nas przez formularz kontaktowy, odpowiadamy w dni robocze."
	canonical="/kontakt"
/>

<!-- Section 1: page header (white surface). Copy verbatim from the UI-SPEC page
     chrome table. -->
<header class="page-head">
	<div class="inner">
		<h1>Kontakt</h1>
		<p class="lead">
			Napisz do nas przez formularz albo na nasz adres e-mail. Odpowiadamy w dni robocze.
		</p>
	</div>
</header>

<!-- Section 2: contact cards (band surface). Same item contract as the homepage
     ContactAndMap section (Lucide icon 22px + label + value), reading site.ts. This
     page owns its own tel: and mailto: links: the single-mailto rule is a per-page
     rule that belongs to the homepage, and the contact page legitimately gets its
     own. The invented żłobek office-hours line is deliberately absent (Plan 02). -->
<div class="pas band">
	<div class="inner uklad-dane">
		<section class="kol-dane" aria-labelledby="dane-heading">
			<h2 id="dane-heading">Dane kontaktowe</h2>
			<ul class="contact-grid">
				<li class="item">
					<MapPin class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Adres</span>
						<span class="item-value">{contact.addressLines[0]}<br />{contact.addressLines[1]}</span>
					</div>
				</li>

				<!-- No Telefon row: the number came off the site on 2026-08-18 (site.ts), and a
				     row saying so would be a quarter of this card spent on an absence. -->

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

				<!-- NIP last: it is the row a parent needs least often, and the one they need it
				     for (the ZUS dofinansowanie paperwork) is a deliberate errand rather than a
				     glance. Grouped 000-000-00-00 HERE and stored as bare digits in site.ts, so
				     the separators are a presentation choice in one place. -->
				<li class="item">
					<Hash class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">NIP</span>
						<span class="item-value">{nipDoWyswietlenia}</span>
					</div>
				</li>
			</ul>
		</section>

		<!-- MapPanel owns the figure, the mandatory OpenStreetMap attribution and the
		     directions link; none of the three is re-implemented here. -->
		<!-- The id on this section is the target of the footer's „Dojazd" shortcut
		     (v1.7 §3): do not remove it as unused. Two attributes, two jobs: the id
		     carries the fragment a link jumps to, aria-labelledby names the section
		     from its own h2. tabindex="-1" lets that jump move keyboard focus into the
		     section, and scroll-margin-top below keeps the sticky header off the
		     heading. -->
		<section class="kol-mapa" id="dojazd" tabindex="-1" aria-labelledby="mapa-heading">
			<h2 id="mapa-heading">Mapa dojazdu</h2>
			<div class="mapa">
				<MapPanel />
			</div>
		</section>
	</div>
</div>

<!-- Form zone (Amendment v1.6 §8): one warm band, one desktop grid. DOM order is the
     MOBILE order: FallbackPanel, form island, Urząd Gminy info box. At >=1024px grid
     areas keep the form card in the left track and stack the fallback and the urząd
     panel in the right rail; no `order` property, so DOM and visual order stay in
     sync. The form section is labelled by the island card's own h2 (id declared in
     KontaktForm.svelte); the island also renders the noscript note, the consent
     block and the klauzula. -->
<div class="pas warm">
	<div class="inner uklad-formularz">
		<div class="blok-awaria">
			<FallbackPanel />
		</div>

		<section class="blok-formularz" aria-labelledby="formularz-naglowek">
			<KontaktForm />
		</section>

		<!-- Urząd Gminy info box (tint-blue panel). D-16: a parent must not be left
		     thinking the żłobek accepts wnioski. The name, street, room and hours come
		     from `urzad`, never pasted, and the sentence is phrased so the nominative
		     form of the interpolated name stays grammatical Polish (the same
		     construction site.ts already uses for the recruitment steps). -->
		<section class="blok-urzad" aria-labelledby="urzad-heading">
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
		</section>
	</div>
</div>

<style>
	/* Surface rhythm and the responsive container are the established /dokumenty
	   route contract, reused verbatim so spacing and gutters cannot drift. */
	.page-head,
	.pas {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.pas.band {
		background: var(--color-band);
	}

	.pas.warm {
		background: var(--color-surface-warm);
	}

	@media (min-width: 1024px) {
		.page-head,
		.pas {
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

	/* Dane + mapa side by side at >=1024px, the homepage ContactAndMap ratio
	   (Amendment v1.6 §8). */
	.uklad-dane {
		display: grid;
		gap: 48px;
	}

	@media (min-width: 1024px) {
		.uklad-dane {
			grid-template-columns: 1fr 1.15fr;
			align-items: start;
		}
	}

	/* Form zone (Amendment v1.6 §8). Mobile: a 24px stack in the DOM order
	   fallback, form, urząd. Desktop: the form card fills the left track, the rail
	   stacks the fallback and the urząd panel. No sticky here: the rail is shorter
	   than the form. */
	.uklad-formularz {
		display: grid;
		gap: 24px;
	}

	@media (min-width: 1024px) {
		.uklad-formularz {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
			grid-template-rows: auto auto 1fr;
			grid-template-areas:
				'formularz awaria'
				'formularz urzad'
				'formularz .';
			column-gap: 48px;
			row-gap: 24px;
			align-items: start;
		}

		.blok-formularz {
			grid-area: formularz;
		}

		.blok-awaria {
			grid-area: awaria;
		}

		.blok-urzad {
			grid-area: urzad;
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

	.pas h2 {
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

	/* Fragment target for the footer's „Dojazd" shortcut (v1.7 §3). 96px is the
	   4xl token: the sticky header is 64px, 72px at >=1024px, so the heading a
	   footer link jumps to is never covered. The browser's own focus ring on the
	   section is deliberately left in place, matching the #galeria treatment plan
	   05-07 ships: it is what shows a keyboard user where the jump landed.
	   scroll-behavior lives in the global reduced-motion neutraliser and is not
	   re-declared here. */
	.kol-mapa {
		scroll-margin-top: 96px;
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
