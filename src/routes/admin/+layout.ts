// The ONE line that makes the whole panel dynamic. src/routes/+layout.ts sets
// prerender = true for the site and every route inherits it, so without this
// opt-out the build crawler would render the panel to static HTML. That would be
// wrong twice over: a prerendered admin panel ships a snapshot of its screens to
// anyone who guesses the URL, past the gate in src/hooks.server.ts entirely, and a
// prerendered page cannot carry the form actions every editing screen in this
// phase saves through.
//
// Page options in a layout act as defaults for the whole subtree, so this single
// file covers /admin and everything under it. The build gate that keeps it honest
// is `test ! -d .svelte-kit/cloudflare/admin` (04.1-RESEARCH.md Pitfall 3).
export const prerender = false;
