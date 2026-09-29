<script lang="ts">
	// Brand mark, and a DELIBERATE EXCEPTION to the duotone icon contract (UI-SPEC §7,
	// recorded as Amendment v1.8). Every other icon in this folder is a 2 px outline with
	// `fill="var(--icon-fill, none)"`; an outlined letter f reads as an ordinary letter, and a
	// brand mark that is not recognisable as the brand fails the one job it has.
	//
	// It is hand-drawn here because @lucide/svelte 1.31.0 ships NO brand glyphs at all
	// (Lucide dropped them): there is no `facebook` in its 7586 icon files, and neither is
	// there instagram, youtube or linkedin, so reaching for the dependency is not an option
	// and no new dependency was added for one glyph.
	//
	// ONE COLOUR, TWO BACKGROUNDS. The plate is `currentColor` and the letter is CUT OUT of it
	// (`fill-rule="evenodd"`, both subpaths in one `path`), so whatever sits behind the icon
	// shows through the letter. That is why the same file works on the brand-blue footer
	// (letter turns blue) and on the white and warm Aktualności headings (letter turns white
	// or cream) without a second colour, a second token or a variant prop.
	//
	// Always decorative: the accessible name lives on the link text beside it, never here.
	let { size = 24 }: { size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden="true"
	focusable="false"
>
	<path
		fill-rule="evenodd"
		d="M5 0h14a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5ZM9.8 24V13.9H7V9.9h2.8V8.3c0-2.3 1.5-3.5 4-3.5h3.6v4h-3.2v1.1h3.2v4h-3.2V24H9.8Z"
	/>
</svg>
