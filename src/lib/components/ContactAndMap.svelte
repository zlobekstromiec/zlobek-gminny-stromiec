<script lang="ts">
	// Contact + map section (HOME-02, UI-SPEC v1.2 §6). Values come from site.ts
	// (PLACEHOLDER markers there; e-mail FINAL). This section owns the homepage's
	// ONLY mailto. The map is a placeholder panel: a static image lands once the
	// address is confirmed; NEVER a third-party iframe (RODO). Directions open
	// externally with the same new-tab safety pattern as the BIP link.
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';
	import { contact } from '$lib/content/site';

	// PLACEHOLDER: coords pending confirmed address (banked in DESIGN-BANK).
	const directionsUrl = 'https://www.openstreetmap.org/directions?to=51.64222%2C21.09111';
</script>

<section class="contact" aria-labelledby="contact-heading">
	<div class="contact-inner">
		<h2 id="contact-heading">Kontakt i dojazd</h2>

		<div class="grid">
			<ul class="contact-grid">
				<!-- PLACEHOLDER: street address pending written client confirmation. -->
				<li class="item">
					<MapPin class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Adres</span>
						<span class="item-value">{contact.addressLines[0]}<br />{contact.addressLines[1]}</span>
					</div>
				</li>

				<!-- PLACEHOLDER: phone + secretariat hours pending written client confirmation. -->
				<li class="item">
					<Phone class="item-icon" size={22} aria-hidden="true" focusable="false" />
					<div class="item-text">
						<span class="item-label">Telefon</span>
						<a class="item-link" href={contact.phoneHref}>{contact.phoneDisplay}</a>
						<span class="item-sub">{contact.secretariatHours}</span>
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

			<div class="map-col">
				<div class="map-panel">
					<span class="map-title">Mapa dojazdu</span>
					<span class="map-note">Mapa pojawi się wkrótce.</span>
				</div>
				<a class="map-link" href={directionsUrl} target="_blank" rel="noopener noreferrer">
					Wyznacz trasę<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
				</a>
			</div>
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

	.item-sub {
		font-family: var(--font-body);
		font-size: 14px;
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

	.map-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* PLACEHOLDER panel: replaced by a static map image once the address is confirmed. */
	.map-panel {
		flex: 1;
		min-height: 260px;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-strong);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		text-align: center;
		padding: 24px;
	}

	.map-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		color: var(--color-ink);
	}

	.map-note {
		font-family: var(--font-body);
		font-size: 14px;
		color: var(--color-muted);
	}

	.map-link {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.map-link:hover {
		color: var(--color-brand-blue-hover);
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
