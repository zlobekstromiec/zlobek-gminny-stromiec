<script lang="ts">
	// Dokumenty page (DOCS-01; 02-UI-SPEC.md /dokumenty composition). Prerendered,
	// zero-JS (inherits prerender = true from +layout.ts): the grouped entries come
	// from +page.server.ts, which computes each file's type/size meta at build via
	// statSync (D-14). Rows reuse the WCAG-correct .doc-row pattern from
	// Recruitment.svelte: the meta (typ, rozmiar, wersja) lives INSIDE the link so a
	// screen reader announces it with the name. Category groups render in the fixed
	// order Rekrutacja, Statut i uchwały, RODO, and an empty group is not emitted at
	// all (dormant-category rule, D-13). Route adds NO extra <main>/h1 beyond the
	// page heading (the layout owns <main>).
	import { FileText } from '@lucide/svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grupy = $derived(data.grupy);
</script>

<Seo
	title="Dokumenty: Publiczny Żłobek w Stromcu"
	description="Pobierz dokumenty rekrutacyjne oraz statut i uchwały dotyczące Publicznego Żłobka w Stromcu. Każdy dokument otwierasz jednym kliknięciem."
	canonical="/dokumenty"
/>

<!-- Page header -->
<header class="page-head">
	<div class="inner">
		<h1>Dokumenty</h1>
		<p class="lead">
			Tutaj znajdziesz dokumenty potrzebne w rekrutacji oraz statut i uchwały dotyczące żłobka.
			Kliknij nazwę dokumentu, aby go pobrać.
		</p>
	</div>
</header>

{#if grupy.length > 0}
	{#each grupy as grupa, i (grupa.kategoria)}
		<section class="band" class:warm={i % 2 === 1} aria-labelledby="{grupa.kategoria}-heading">
			<div class="inner uklad">
				<h2 id="{grupa.kategoria}-heading">{grupa.naglowek}</h2>
				<ul class="docs">
					{#each grupa.dokumenty as dok (dok.plik)}
						<li>
							<a class="doc-row" href={dok.plik}>
								<FileText class="doc-icon" size={20} aria-hidden="true" />
								<span class="doc-name">{dok.nazwa}</span>
								<span class="doc-meta">{dok.meta}</span>
							</a>
							{#if dok.zrodlo_bip}
								<a
									class="doc-source"
									href={dok.zrodlo_bip}
									target="_blank"
									rel="noopener noreferrer"
								>
									Źródło: BIP<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/each}
{:else}
	<!-- Whole-page empty state (safety net; page ships seeded with the BIP set). -->
	<section class="band">
		<div class="inner">
			<div class="empty">
				<FileText class="empty-icon" size={40} aria-hidden="true" />
				<h2>Wkrótce udostępnimy dokumenty</h2>
				<p>Trwa przygotowywanie dokumentów do pobrania. Zajrzyj tutaj wkrótce.</p>
			</div>
		</div>
	</section>
{/if}

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

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
		}

		/* Editorial split (Amendment v1.6 §2): category heading in the left rail,
		   the document list filling the right track to the container edge. */
		.uklad {
			display: grid;
			grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
			column-gap: 48px;
			align-items: start;
		}

		.uklad h2 {
			margin-bottom: 0;
		}

		.uklad .docs {
			max-width: none;
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

	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 52rem;
	}

	/* Row markup + a11y reused verbatim from Recruitment.svelte (.doc-row): the
	   meta stays inside the link, min 48px touch target, brand-blue underline. */
	.doc-row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 48px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border-subtle);
		text-decoration: none;
	}

	.doc-row :global(.doc-icon) {
		flex: none;
		color: var(--color-brand-blue);
	}

	.doc-name {
		flex: 1 1 auto;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
		overflow-wrap: anywhere;
	}

	.doc-row:hover .doc-name {
		color: var(--color-brand-blue-hover);
	}

	.doc-meta {
		flex: none;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		color: var(--color-muted);
	}

	/* Optional provenance link (D-16), rendered only when zrodlo_bip is set. */
	.doc-source {
		display: inline-block;
		margin: 6px 0 4px;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.doc-source:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Whole-page empty-state panel (mirrors the inherited Aktualności pattern). */
	.empty {
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 40px 24px;
		text-align: center;
		max-width: 40rem;
		margin-inline: auto;
	}

	.empty :global(.empty-icon) {
		color: var(--color-brand-blue);
		margin-bottom: 12px;
	}

	.empty h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}

	.empty p {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
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
