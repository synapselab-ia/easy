# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P1 — Referential integrity and safe entity lifecycle**  
**State:** `IN_PROGRESS`

**P1-S1 — Safe reseller lifecycle:** `DONE`, integrated into `develop`.

**P1-S2 — Safe item lifecycle:** `DONE` on `feature/p1-s2-item-lifecycle`, with targeted automated validation and build passing before integration into `develop`.

P1-S1 and P1-S2 now establish reversible active/inactive lifecycle rules for resellers and catalog items while preserving historical financial/order attribution. Broader reference reconciliation and migration edge cases remain P1-S3.

## Startup protocol for a new conversation

Read these files in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only the source files needed for the active `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only reseller/order/payment management SPA with:

- React + TypeScript + Vite;
- Dexie/IndexedDB local persistence;
- items, resellers and order/payment/signal transactions;
- reseller balances, dashboard and analytics;
- PDF statements;
- JSON backup/restore;
- global search;
- responsive UI and theme support;
- automated-test infrastructure;
- GitHub Pages deployment from `main`.

## P1-S1 implemented behavior

- reseller lifecycle is represented by `isActive`;
- existing reseller rows migrate safely to active by default in Dexie schema version 2;
- missing legacy `isActive` is also interpreted as active for backward-safe reads;
- normal reseller UI archives/reactivates instead of physically deleting identities with history;
- the physical delete mutation is protected and rejects deletion when financial transactions exist;
- archived resellers remain visible/identifiable in list, global search, detail, history and PDF statement flows;
- archived resellers are excluded from new transaction selection;
- transaction creation independently rejects inactive or missing resellers at the mutation layer.

## P1-S2 implemented behavior

- item lifecycle is represented by `isActive`;
- existing item rows migrate safely to active by default in Dexie schema version 3;
- missing legacy `isActive` is interpreted as active for backward-safe reads;
- normal catalog UI archives/reactivates instead of destructively removing used catalog identities;
- the physical item-delete mutation rejects deletion when any transaction references the item;
- physical deletion remains available only for unused items and is not the normal catalog-removal path;
- inactive items remain visible and explicitly identified in the catalog and global search/recent results;
- inactive items are excluded from new-order selection;
- order creation independently rejects an inactive or missing referenced item when `itemId` is supplied;
- historical transaction/PDF rendering continues to use transaction snapshots such as `itemName`, quantity and stored values, without rewriting old transactions;
- the V2 → V3 migration does not alter existing reseller lifecycle state.

## Verified high-priority risks after P1-S2

1. Broader invalid-reference reconciliation and complete P1 migration-path validation remain for P1-S3.
2. There is no deliberate audited correction/reversal workflow for financial entries.
3. `createdAt` currently carries date semantics that should later distinguish occurrence vs registration.
4. Period balance semantics are not yet formal opening/closing statement semantics.
5. Backup restore validation is not deep enough for high-confidence destructive replacement.
6. The global lint/test baseline contains known pre-existing debt; targeted P1 gates pass but P6 still owns suite reconciliation.
7. Production deployment is not gated by the full quality suite.

## P1-S2 completion evidence

- [x] An item used in historical orders is no longer removed through the normal catalog-removal flow.
- [x] Hard deletion is rejected when a transaction references the item.
- [x] Historical item snapshots remain renderable in reseller history/PDF flows after catalog deactivation.
- [x] Catalog and global search keep inactive items visible and explicitly identified.
- [x] Inactive items cannot be selected for new orders.
- [x] Order creation rejects inactive or missing referenced items below the UI when `itemId` is supplied.
- [x] Existing item data receives a safe active default through Dexie V2 → V3 migration.
- [x] The V3 migration preserves prior reseller lifecycle state.
- [x] Automated tests cover migration, archive/reactivation, deletion protection, search visibility, order selection/guards and catalog integration.
- [x] Historical snapshot and reseller-lifecycle regression tests pass.
- [x] GitHub Actions P1-S2 targeted gate passed on run `32038951903`.
- [x] `npm run build` passed on the same run.
- [x] Canonical V2 documentation updated with implemented behavior and next action.

## Active constraints entering P1-S3

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce Supabase/backend/authentication before P4;
- do not redesign unrelated UI during P1;
- do not implement transaction reversal yet — that belongs to P2;
- do not change financial date/statement semantics yet — that belongs to P3;
- preserve existing valid data across the complete P1 schema path;
- do not reinterpret old transaction snapshots during reference reconciliation;
- add tests with P1 behavior changes rather than postponing all testing to P6;
- keep P1-S3 focused on remaining referential/migration gaps rather than new product features.

## NEXT_ACTION

**P1-S3 — Referential validation and migration. Create a new feature branch from `develop`, inventory the remaining invalid-reference and migration-path cases after P1-S1/P1-S2, define the exact acceptance matrix, then implement only the remaining reference validation and complete P1 schema-migration coverage. Preserve valid legacy data and existing transaction snapshots. Do not begin P2 correction/reversal work.**

## P1-S3 completion target

P1-S3 is not complete until:

- old valid databases upgrade through the complete P1 schema path without data loss or lifecycle regression;
- remaining invalid new references not already covered by P1-S1/P1-S2 are deliberately rejected or documented as valid optional cases;
- historical references/snapshots remain understandable without destructive repair;
- migration/reference edge cases are covered by automated tests;
- P1 acceptance gates are reconciled across reseller and item lifecycle behavior;
- V2 documentation is updated and either P1 is closed or an explicit blocker is recorded.
