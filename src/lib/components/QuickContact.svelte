<script lang="ts">
	// Quick-contact block (HOME-02) — surfaces address, phone, e-mail and opening
	// hours (UI-SPEC §Quick-contact). All labels Polish (SITE-06). Non-final values
	// carry a greppable PLACEHOLDER token for the Phase 6 pre-launch grep gate; the
	// e-mail address is FINAL (the confirmed public institutional inbox) so it is NOT
	// marked. Tel/e-mail are brand-blue underlined links with ≥44px hit areas; icons
	// are decorative (aria-hidden).
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';
</script>

<section class="contact" aria-labelledby="contact-heading">
	<div class="contact-inner">
		<h2 id="contact-heading">Szybki kontakt</h2>

		<ul class="contact-grid">
			<!-- PLACEHOLDER: street address — replace with the confirmed address before launch. -->
			<li class="item">
				<MapPin class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Adres</span>
					<span class="item-value">ul. [do uzupełnienia], 26-804 Stromiec</span>
				</div>
			</li>

			<!-- PLACEHOLDER: phone number — replace with the confirmed number before launch. -->
			<li class="item">
				<Phone class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Telefon</span>
					<a class="item-link" href="tel:+48000000000">+48 00 000 00 00</a>
				</div>
			</li>

			<!-- FINAL: confirmed public institutional inbox (do NOT mark placeholder). -->
			<li class="item">
				<Mail class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">E-mail</span>
					<a class="item-link" href="mailto:zlobek@ugstromiec.pl">zlobek@ugstromiec.pl</a>
				</div>
			</li>

			<!-- PLACEHOLDER: opening hours — confirm with the żłobek before launch. -->
			<li class="item">
				<Clock class="item-icon" size={22} aria-hidden="true" focusable="false" />
				<div class="item-text">
					<span class="item-label">Godziny otwarcia</span>
					<span class="item-value">pon.–pt. 6:30–16:30</span>
				</div>
			</li>
		</ul>
	</div>
</section>

<style>
	.contact {
		background: var(--color-band);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.contact {
			padding-block: 96px;
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
		margin: 0 0 24px;
	}

	.contact-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 640px) {
		.contact-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.contact-grid {
			grid-template-columns: repeat(4, 1fr);
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
		color: #075985;
	}
</style>
