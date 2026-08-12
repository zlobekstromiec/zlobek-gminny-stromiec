<script lang="ts">
	// Site footer (SITE-03). Links out to the existing BIP (external, opened in a
	// new tab with reverse-tabnabbing protection), the Deklaracja dostępności page
	// (authored later — Phase 6), and Kontakt. Do NOT rebuild BIP content — it is
	// an external municipal system (UI-SPEC §Footer, RESEARCH Pitfall 14).
</script>

<footer class="site-footer">
	<div class="inner">
		<p class="org">Żłobek Gminny w Stromcu — jednostka organizacyjna Gminy Stromiec.</p>

		<nav class="footer-links" aria-label="Odnośniki w stopce">
			<ul>
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
					<a class="footer-link" href="/deklaracja-dostepnosci">Deklaracja dostępności</a>
				</li>
				<li>
					<a class="footer-link" href="/kontakt">Kontakt</a>
				</li>
			</ul>
		</nav>

		<p class="copyright">© Żłobek Gminny w Stromcu</p>
	</div>
</footer>

<style>
	.site-footer {
		background: var(--color-surface-warm);
		color: var(--color-ink);
		padding-block: 48px;
		border-top: 1px solid var(--color-border-subtle);
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
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

	.org {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-ink);
		margin: 0;
	}

	.footer-links ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	@media (min-width: 640px) {
		.footer-links ul {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 24px;
		}
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.footer-link:hover {
		color: #075985;
	}

	.copyright {
		font-family: var(--font-body);
		font-size: 14px;
		color: var(--color-muted);
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
