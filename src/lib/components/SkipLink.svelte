<!--
  SkipLink — the first focusable element on every page (WCAG 2.4.1 Bypass Blocks,
  UI-SPEC §Interaction). Visually hidden until it receives keyboard focus, then it
  reveals top-left and jumps to the <main id="main"> landmark.
-->
<a class="skip-link" href="#main">Przejdź do treści</a>

<style>
	.skip-link {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 100;
		/* Off-screen until focused — kept in the tab order (not display:none). */
		transform: translateY(-120%);
		padding: 12px 16px;
		background: var(--color-surface);
		color: var(--color-brand-blue);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		text-decoration: underline;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.06),
			0 1px 3px rgb(15 23 42 / 0.08);
		transition: transform 150ms ease;
	}

	.skip-link:focus {
		transform: translateY(8px);
	}

	@media (prefers-reduced-motion: reduce) {
		.skip-link {
			transition: none;
		}
	}
</style>
