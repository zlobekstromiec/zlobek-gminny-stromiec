// Ambient type for Vite's `?raw` import suffix, which inlines a file's bytes as a
// string at BUILD time. Declared here rather than inherited from the bundler's own
// client types, because tsconfig.json pins `types` to the generated Cloudflare
// worker declarations and that pin replaces the default ambient set rather than
// adding to it.
//
// One consumer today: src/lib/server/admin/instrukcja.ts, which reads the printable
// instrukcja out of docs/ so the panel's Pomoc screen and the printable document can
// never drift apart (04.1-10 P-27). The import is resolved by the bundler, so nothing
// reads a filesystem at runtime, which matters because the panel is a Cloudflare
// Worker and a Worker has no filesystem.
declare module '*?raw' {
	const zawartosc: string;
	export default zawartosc;
}
