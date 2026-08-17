<script lang="ts">
	// Site footer v2 (SITE-03, UI-SPEC v1.2 §6): wave into a brand-blue block with
	// four columns. Contact lines are PLAIN TEXT by design (the homepage carries
	// exactly one mailto and its tel-link count is asserted; the linked versions
	// live in TopBar/Hero/ContactAndMap). BIP stays an external municipal system:
	// do NOT rebuild it (RESEARCH Pitfall 14).
	import Wave from './Wave.svelte';
	import { contact } from '$lib/content/site';
	import { godzinyStopkiDni, godzinyStopkiWeekend, godzinyStopkiZakres } from '$lib/godziny';
	import { ATOMY_GODZIN } from '$lib/w-skrocie';
	import logoFull from '$lib/assets/brand/logo-full.png?enhanced';
</script>

<footer class="site-footer">
	<Wave fill="var(--color-brand-blue)" bg="var(--color-surface)" />

	<div class="inner">
		<div class="col brand-col">
			<div class="brand-lockup">
				<enhanced:img src={logoFull} alt="" sizes="280px" />
			</div>
			<p class="footer-wordmark">Publiczny Żłobek w Stromcu</p>
			<p class="org">
				Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec<br />
				<!-- PLACEHOLDER: address + phone pending written client confirmation (site.ts). -->
				{contact.addressLines[0]}, {contact.addressLines[1]}<br />
				tel. {contact.phoneDisplay}<br />
				{contact.email}
			</p>
			<div class="logo-slots" aria-hidden="true">
				<!-- PLACEHOLDER: real program logos (Phase 6 assets). -->
				<span class="logo-slot slot-sm">Herb gminy</span>
				<span class="logo-slot slot-lg">Aktywny Maluch</span>
			</div>
		</div>

		<nav class="footer-links" aria-label="Odnośniki w stopce">
			<div class="col">
				<h2 class="col-heading">Na skróty</h2>
				<ul>
					<li><a class="footer-link" href="/aktualnosci">Aktualności</a></li>
					<li><a class="footer-link" href="/rekrutacja">Rekrutacja</a></li>
					<li><a class="footer-link" href="/dokumenty">Dokumenty</a></li>
					<li><a class="footer-link" href="/cennik">Cennik</a></li>
					<!-- v1.7 §3 and 05-UI-SPEC Contract 1: Galeria and Dojazd point at sections of
					     pages that exist, never at standalone pages that were never going to be
					     built. Both target ids live on those sections, carry tabindex="-1" and are
					     asserted by tests/nav.spec.ts, which reads the hrefs off what this file
					     really renders. The LABELS are what the locked footer contract enumerates,
					     so repointing either one is compatible with it. -->
					<li><a class="footer-link" href="/o-nas#galeria">Galeria</a></li>
					<li><a class="footer-link" href="/kontakt#dojazd">Dojazd</a></li>
				</ul>
			</div>

			<div class="col">
				<h2 class="col-heading">Informacje</h2>
				<ul>
					<li>
						<a class="footer-link" href="/deklaracja-dostepnosci">Deklaracja dostępności</a>
					</li>
					<li>
						<a class="footer-link" href="/polityka-prywatnosci">Polityka prywatności (RODO)</a>
					</li>
					<li>
						<a
							class="footer-link"
							href="https://ugstromiec.naszbip.pl/zlobek"
							target="_blank"
							rel="noopener noreferrer"
						>
							Biuletyn Informacji Publicznej (BIP)<span class="visually-hidden">
								(otwiera się w nowej karcie)</span
							>
						</a>
					</li>
					<li>
						<a class="footer-link" href="/kontakt">Kontakt</a>
					</li>
				</ul>
			</div>
		</nav>

		<div class="col">
			<h2 class="col-heading">Godziny otwarcia</h2>
			<!-- COMPOSED, not typed. Until plan 05-09 these three lines were hard-coded here
			     while the same hours also lived in the homepage tile and in `contact.hours`,
			     so an editor could change the strip at the top of a page and leave the footer
			     of that very page saying something else. All three lines, the tile, the top
			     bar, the contact block and /kontakt now read the same four atoms from
			     src/lib/content/w-skrocie.json (05-UI-SPEC Contract 7). The launch-gate
			     marker that used to be a `PLACEHOLDER` line comment here is the per-tile
			     boolean `godziny.placeholder` in that store, swept by
			     tests/zastepcze.unit.ts. -->
			<p class="hours-line">{godzinyStopkiDni(ATOMY_GODZIN)}</p>
			<p class="hours-big">{godzinyStopkiZakres(ATOMY_GODZIN)}</p>
			<p class="hours-line">{godzinyStopkiWeekend(ATOMY_GODZIN)}</p>
		</div>
	</div>

	<p class="copyright">© Publiczny Żłobek w Stromcu</p>
</footer>

<style>
	.site-footer {
		background: var(--color-brand-blue);
		color: #ffffff;
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding: 36px 16px 20px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	@media (min-width: 640px) {
		.inner {
			grid-template-columns: 1fr 1fr;
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			grid-template-columns: 1.2fr 2fr 1fr;
			padding-inline: 32px;
		}
	}

	/* The link nav spans two visual columns of the grid on desktop. */
	.footer-links {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	@media (min-width: 640px) {
		.footer-links {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* White card so the lockup's blue and orange wordmark stays legible on
	   brand-blue (v1.3). Radius matches the .logo-slot chips below. Decorative:
	   the .footer-wordmark text carries the name. */
	.brand-lockup {
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		max-width: 280px;
		margin: 0 0 12px;
	}

	.brand-lockup :global(img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.footer-wordmark {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: #ffffff;
		margin: 0 0 8px;
	}

	/* Band on brand-blue: 5.17:1 (v1.2 pairing table). */
	.org {
		font-family: var(--font-body);
		font-size: 14px;
		line-height: 1.7;
		color: var(--color-band);
		margin: 0;
		overflow-wrap: anywhere;
	}

	.logo-slots {
		display: flex;
		gap: 12px;
		margin-top: 16px;
	}

	.logo-slot {
		display: grid;
		place-items: center;
		height: 44px;
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-muted);
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 700;
		text-align: center;
		padding-inline: 6px;
	}

	.slot-sm {
		width: 76px;
	}

	.slot-lg {
		width: 112px;
	}

	/* Tint-yellow on brand-blue: 4.69:1, no margin: never lighten brand-blue. */
	.col-heading {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-tint-yellow);
		margin: 0 0 10px;
	}

	.col ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-band);
		text-decoration: underline;
	}

	.footer-link:hover {
		color: #ffffff;
	}

	.hours-line {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.8;
		color: var(--color-band);
		margin: 0;
	}

	.hours-big {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: #ffffff;
		margin: 0;
	}

	.copyright {
		border-top: 1px solid rgb(255 255 255 / 0.2);
		text-align: center;
		padding: 14px 24px;
		font-family: var(--font-body);
		font-size: 14px;
		color: var(--color-band);
		margin: 0;
	}

	/* Visually hidden but exposed to assistive tech (new-tab suffix on the BIP link). */
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
