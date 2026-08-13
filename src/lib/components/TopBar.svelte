<script lang="ts">
	// Utility top bar (UI-SPEC v1.2 §2): phone + opening hours on every route,
	// above the sticky header. Static, zero runtime logic. Deliberately NO e-mail
	// here: the homepage carries exactly one mailto (in ContactAndMap).
	import { contact } from '$lib/content/site';
</script>

<div class="topbar">
	<div class="inner">
		<!-- PLACEHOLDER: phone number pending written client confirmation (site.ts). -->
		<span class="phone">
			tel.
			<a href={contact.phoneHref}>{contact.phoneDisplay}</a>
		</span>
		<!-- PLACEHOLDER: opening hours pending written client confirmation (site.ts). -->
		<span class="hours">Czynne: {contact.hours}</span>
	</div>
</div>

<style>
	.topbar {
		background: var(--color-brand-blue);
		color: #ffffff;
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-block: 4px;
		padding-inline: 16px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 4px 16px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
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

	.phone,
	.hours {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
	}

	/* White on brand-blue: 5.93:1 (v1.2 pairing table). Underline keeps the
	   link affordance beyond colour alone. */
	.phone a {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		color: #ffffff;
		text-decoration: underline;
	}

	.phone a:hover {
		color: var(--color-band);
	}
</style>
