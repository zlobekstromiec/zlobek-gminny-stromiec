<script lang="ts">
	// Utility top bar (UI-SPEC v1.2 §2): phone + opening hours on every route, above
	// the sticky header. Static, zero runtime logic. Deliberately NO e-mail here: the
	// homepage carries exactly one mailto (in ContactAndMap).
	//
	// THE TWO-COLUMN LAYOUT BELOW WAS BUILT FOR THIS PAIRING. The bar ran on the hours
	// alone between 2026-08-18 and 2026-09-21, while the site had no number to publish,
	// and `justify-content: space-between` simply left-aligned the single child. The
	// żłobek now has its own line (site.ts), so the second item is back where the rule
	// always expected it.
	//
	// The hours are no longer marked placeholder: the żłobek's own ramowy harmonogram
	// runs 6:30 to 16:30, which is the range src/lib/content/w-skrocie.json holds.
	//
	// NO FACEBOOK LINK HERE, AND THAT IS A DECISION, NOT AN OVERSIGHT (quick 260929-ips,
	// UI-SPEC Amendment v1.8). The director asked on 2026-09-29 for the mark „na wszystkich
	// stronach"; it went into the footer and both Aktualności headings instead. Four reasons,
	// heaviest first:
	//   1. „Every page" is ALREADY satisfied. The footer renders on every route
	//      (tests/stopka-identyfikatory.spec.ts samples five of them), so a bar item adds
	//      no page at all, only a second copy on each.
	//   2. This bar is a space-between PAIR, as the paragraph above says. A third child
	//      lands on a third wrapped row at 390 px, left-aligned: an orphaned glyph on a
	//      phone.
	//   3. The 44 px target would thicken the bar on every route. These items are
	//      min-height 36px with padding-block 4px; honouring the target costs 8 px of
	//      height sitewide for a duplicate link.
	//   4. An icon-only link is the weakest accessible form, and the director named
	//      screen-reader parents explicitly. Three links with visible Polish labels serve
	//      them better than a fourth carrying only an aria-label.
	// If a presence above the fold is ever wanted, the right place is Header.svelte and it
	// is its own change with its own amendment. The profile address is deliberately NOT
	// repeated in this comment: it exists in src/ exactly once, in site.ts.
	import { contact } from '$lib/content/site';
</script>

<div class="topbar">
	<div class="inner">
		<span class="phone">
			tel.
			<a href={contact.phoneHref}>{contact.phoneDisplay}</a>
		</span>
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
