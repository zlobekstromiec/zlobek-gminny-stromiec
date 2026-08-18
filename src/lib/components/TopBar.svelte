<script lang="ts">
	// Utility top bar (UI-SPEC v1.2 §2): opening hours on every route, above the
	// sticky header. Static, zero runtime logic. Deliberately NO e-mail here: the
	// homepage carries exactly one mailto (in ContactAndMap).
	//
	// IT USED TO CARRY THE PHONE TOO, and the pairing is what the two-column layout
	// below was built for. The number came off the site on 2026-08-18 (site.ts), so
	// the bar is down to one item. It keeps `justify-content: space-between`, which
	// with a single child simply left-aligns it, and the rule stays because this bar
	// gets its second item back the moment the żłobek has its own line.
	//
	// The hours are no longer marked placeholder: the żłobek's own ramowy harmonogram
	// runs 6:30 to 16:30, which is the range src/lib/content/w-skrocie.json holds.
	import { contact } from '$lib/content/site';
</script>

<div class="topbar">
	<div class="inner">
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

	.hours {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
	}
</style>
