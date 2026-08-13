<script lang="ts">
	// Recruitment module (UI-SPEC v1.2 §6): the homepage centrepiece. Copy for
	// the open/closed recruitment window comes pre-derived from site.ts (a human
	// flips `recruitmentOpen` there, never a date comparison). The docs panel
	// rows keep their file meta INSIDE the link so screen readers announce it
	// with the name (Polish public-sector expectation, WCAG 2.1 AA). Step 2's
	// e-mail is deliberately plain text: the homepage carries exactly one mailto
	// (in ContactAndMap).
	import Cta from './Cta.svelte';
	import { recruitment } from '$lib/content/site';
</script>

<section class="recruitment" aria-labelledby="rekrutacja-heading">
	<div class="inner">
		<div class="card">
			<div class="card-head">
				<h2 id="rekrutacja-heading">{recruitment.heading}</h2>
				<p class="deadline">{recruitment.deadline}</p>
			</div>

			<div class="card-body">
				<div class="steps-col">
					<p class="intro">{recruitment.body}</p>

					<!-- PLACEHOLDER: admission facts inside, see site.ts (v1.2 facts register). -->
					<p class="info-card">{recruitment.infoCard}</p>

					<ol class="steps">
						{#each recruitment.steps as step, i (step.title)}
							<li class="step">
								<span class="step-num" aria-hidden="true">{i + 1}</span>
								<span class="step-text">
									<span class="step-title">{step.title}</span>
									<span class="step-body">{step.body}</span>
								</span>
							</li>
						{/each}
					</ol>

					<Cta href="/dokumenty" variant="primary" icon>Pobierz kartę zgłoszenia</Cta>
				</div>

				<div class="docs-panel">
					<h3>Dokumenty do pobrania</h3>
					<ul class="docs">
						{#each recruitment.docs as doc (doc.name)}
							<li>
								<a class="doc-row" href={doc.href}>
									<span class="doc-name">{doc.name}</span>
									<span class="doc-meta">{doc.meta}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.recruitment {
		background: var(--color-surface);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.recruitment {
			padding-block: 80px;
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

	.card {
		border: 2px solid var(--color-band);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.card-head {
		background: var(--color-band);
		padding: 20px 24px;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
	}

	@media (min-width: 1024px) {
		.card-head {
			padding: 28px 40px;
		}
	}

	.card-head h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.deadline {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-focus-ring);
		margin: 0;
	}

	.card-body {
		padding: 24px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	@media (min-width: 1024px) {
		.card-body {
			padding: 40px;
			grid-template-columns: 1.2fr 1fr;
			gap: 48px;
		}
	}

	.intro {
		font-family: var(--font-body);
		font-size: 17px;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 52ch;
		margin: 0 0 20px;
	}

	/* Tint surface card; text stays accessible-tier (ink on tint-yellow 11.6:1). */
	.info-card {
		background: var(--color-tint-yellow);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-md);
		padding: 16px 20px;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		margin: 0 0 28px;
	}

	.steps {
		list-style: none;
		margin: 0 0 32px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.step-num {
		flex: none;
		width: 34px;
		height: 34px;
		border-radius: var(--radius-pill);
		background: var(--color-brand-blue);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 17px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.step-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.step-title {
		font-family: var(--font-body);
		font-size: 17px;
		font-weight: 700;
		color: var(--color-ink);
	}

	.step-body {
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.docs-panel {
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 28px;
	}

	.docs-panel h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		color: var(--color-ink);
		margin: 0 0 18px;
	}

	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.doc-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 48px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border-subtle);
		text-decoration: none;
	}

	.doc-name {
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
</style>
