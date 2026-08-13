<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Header logo badge mark: ink stroke on
	// the amber badge (brand-blue would fail contrast there), tint-yellow duotone fill
	// set by the consumer via --icon-fill.
	let { size = 24 }: { size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<circle cx="6.5" cy="6.5" r="2.5" />
	<circle cx="17.5" cy="6.5" r="2.5" />
	<circle cx="12" cy="13" r="7" fill="var(--icon-fill, none)" />
	<circle cx="9.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
	<circle cx="14.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
	<path d="M10.5 15.5 Q12 16.8 13.5 15.5" />
</svg>
