// Static-first: every content route prerenders to static HTML at build time.
// Set once here so all Phase 1 routes inherit it (no +server.ts, no
// prerender = false anywhere this phase).
export const prerender = true;
