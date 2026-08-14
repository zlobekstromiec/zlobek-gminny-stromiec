<script lang="ts">
	// Contact + map section (HOME-02, UI-SPEC v1.2 §6). Values come from site.ts
	// (PLACEHOLDER markers there; e-mail FINAL). This section owns the homepage's
	// ONLY mailto. The map is the real static OpenStreetMap snapshot, rendered by
	// the shared MapPanel component so this section and /kontakt can never drift;
	// NEVER an embedded third-party map frame (RODO, D-17). Directions open
	// externally with the same new-tab safety pattern as the BIP link.
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPanel from './MapPanel.svelte';
	import { contact } from '$lib/content/site';
</script>

<section class="contact" aria-labelledby="contact-heading">
	<div class="contact-inner">
		<h2 id="contact-heading">Kontakt i dojazd</h2>

		<div class="grid">
			<ul class="contact-grid">
				<!-- FINAL: [BIP]-confirmed street address (statut + fee uchwała). -->
				<li class="item">
					<MapPin class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Adres</span>
						<span class="item-value">{contact.addressLines[0]}<br />{contact.addressLines[1]}</span>
					</div>
				</li>

				<!-- PLACEHOLDER: phone published by user decision (D-08), launch gate in
				     site.ts. The invented żłobek secretariat-hours line is deliberately
				     gone: the source document has no such fact. -->
				<li class="item">
					<Phone class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Telefon</span>
						<a class="item-link" href={contact.phoneHref}>{contact.phoneDisplay}</a>
					</div>
				</li>

				<!-- FINAL: confirmed public institutional inbox (do NOT mark placeholder). -->
				<li class="item">
					<Mail class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">E-mail</span>
						<a class="item-link" href="mailto:{contact.email}">{contact.email}</a>
					</div>
				</li>

				<!-- PLACEHOLDER: opening hours pending written client confirmation. -->
				<li class="item">
					<Clock class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Godziny otwarcia</span>
						<span class="item-value">{contact.hours}</span>
					</div>
				</li>
			</ul>

			<MapPanel />
		</div>
	</div>
</section>

<style>
	.contact {
		background: var(--color-band);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.contact {
			padding-block: 80px;
		}
	}

	.contact-inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.contact-inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.contact-inner {
			padding-inline: 32px;
		}
	}

	.contact-inner h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 28px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
		align-items: stretch;
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: 1fr 1.15fr;
			gap: 40px;
		}
	}

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

	/* The map column, its figure, attribution caption, directions button and the
	   local .visually-hidden utility now live in MapPanel.svelte, which /kontakt
	   renders too. Nothing map-shaped is styled here any more. */
</style>
