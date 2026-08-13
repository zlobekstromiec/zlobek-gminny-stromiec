<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Perks: troskliwa kadra.
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
	<path
		d="M12 20C5 15 4 10.5 6.5 7.8 8.5 5.7 11 6.3 12 8c1-1.7 3.5-2.3 5.5-.2C20 10.5 19 15 12 20Z"
		fill="var(--icon-fill, none)"
	/>
</svg>
