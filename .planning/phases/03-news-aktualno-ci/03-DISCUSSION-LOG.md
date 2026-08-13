# Phase 3: News (Aktualności) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-08-13
**Phase:** 3-news-aktualno-ci
**Areas discussed:** Seed launch post, Publishing semantics, Post URLs & lifecycle

> **Session note:** the gray-area selection question was presented via AskUserQuestion but the user was away from keyboard (no response after timeout). Following the established Phase 1/2 pattern, all three identified areas were resolved with the recommended defaults and marked DEFAULTED in CONTEXT.md for confirmation before or during planning. No interactive answers below are user-provided.

---

## Seed launch post

| Option | Description | Selected |
|--------|-------------|----------|
| Seed the banked launch post | Seed `aktualnosci` with the DESIGN-BANK opening post, placeholder-flagged, no cover image; homepage news section renders for the first time; consistent with the Phase 2 BIP-seeded dokumenty pattern | ✓ (default) |
| Start with an empty collection | Ship the routes with zero posts; homepage news section stays hidden until staff publish; list page shows the empty state | |

**User's choice:** none (away) - defaulted to seeding the banked post (D-01).
**Notes:** Timing caveat recorded: the announced event date (14.08.2026) is effectively now; the client may want a post-event recap rewrite at confirmation (CMS content edit only). Test-fixture posts for order assertions left to planner discretion (D-02).

---

## Publishing semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Publish = live, date is metadata | Every collection entry renders; a saved post is live after the ~2 min rebuild regardless of its date; simplest honest model for a static git-built site | ✓ (default) |
| Build-time future-date filter | Hide posts dated in the future; rejected: nothing triggers a rebuild when the date arrives, so a "scheduled" post silently stays hidden until an unrelated commit | |
| Draft (szkic) boolean filtered at build | Lightweight prepare-without-publishing; rejected for v1: contradicts the D-20 direct-publish simplicity and adds a forgot-to-untick failure mode; deferred to v2 if staff ask | |

**User's choice:** none (away) - defaulted to publish-equals-live, no date filter, no draft mechanism (D-03, D-04, D-05).
**Notes:** The instrukcja news section must state "zapisanie = publikacja (po ok. 2 minutach)". Backdating implicitly allowed.

---

## Post URLs & lifecycle

| Option | Description | Selected |
|--------|-------------|----------|
| Date-prefixed slugs | `/aktualnosci/RRRR-MM-DD-tytul`; prevents collisions for annually recurring municipal titles without staff intervention | ✓ (default) |
| Title-only slugs | Shorter, prettier URLs; collision-prone for recurring titles ("Rekrutacja 2027", "Życzenia świąteczne") | |

**User's choice:** none (away) - defaulted to date-prefixed slugs (D-06); title edits never change the URL (D-07, Sveltia fixes the file name at creation); deleted posts 404 with no redirects (D-08).
**Notes:** Exact Sveltia slug template/encoding mechanics (clean accents, binding to the `data` field) are researcher/planner detail.

## Claude's Discretion

- Content file format for posts (markdown + frontmatter vs JSON) and Sveltia collection config mechanics (Phase 2 precedent: researcher's call).
- Heading-order gate on the list page (`h2` wrapper vs promoting card titles to `h2`).
- Test fixture approach for the newest-first assertion.
- Homepage curated count (3 per UI-SPEC; adjust only within "fills whole grid rows cleanly").

## Deferred Ideas

- Draft/szkic boolean - v2, only if staff request it.
- Scheduled publishing (cron rebuild + date filter) - rejected for v1.
- NEWS-04 categories/tags/filtering + pagination - v2 backlog.
- RSS-01 feed - v2 backlog.
- "Ustawienia strony" site-facts singleton - Phase 4.
- Post-event rewrite of the launch post - client confirmation moment.
