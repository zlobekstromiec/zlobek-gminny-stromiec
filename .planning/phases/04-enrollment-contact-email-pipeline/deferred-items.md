# Deferred items — Phase 04

Out-of-scope discoveries logged during execution. Not fixed here.

| # | Found in | Item | Why deferred |
|---|----------|------|--------------|
| 1 | Plan 04-02, Task 1 | `src/lib/content/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka.json` says a parent can „złożyć kartę zgłoszenia dziecka" at the open day. The real document is „Wniosek o przyjęcie dziecka" and it is filed only at the Urząd Gminy ([BIP] regulamin, D-05). The same post also states an opening date of 14 sierpnia 2026, which dane-bip §10.4 forbids publishing as confirmed (14.08 vs 01.09 unresolved). | CMS-authored content, not in this plan's `files_modified`, and 04-RESEARCH.md §Runtime State Inventory already tracks the CMS JSON sweep as a separate item. Staff can also reintroduce old wording through the CMS, so a code fix alone would not hold. Belongs to the CMS-content sweep / Phase 6 pre-launch gate. |
| 2 | Plan 04-02, Task 1 | `static/og-placeholder.png` still carries the old branding. | Already tracked as a Phase 6 item (04-RESEARCH.md §Runtime State Inventory). |
