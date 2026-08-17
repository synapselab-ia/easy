# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P2 — Correction, reversal and audit trail**  
**State:** `NOT_STARTED`

**P1 — Referential integrity and safe entity lifecycle:** `DONE`.

- **P1-S1 — Safe reseller lifecycle:** `DONE`, integrated into `develop`.
- **P1-S2 — Safe item lifecycle:** `DONE`, integrated into `develop`.
- **P1-S3 — Referential validation and migration:** `DONE` on `feature/p1-s3-referential-validation`, with targeted automated validation and build passing before integration into `develop`.

P1 now establishes reversible lifecycles for resellers/items, guarded hard deletion, explicit reference rules for new transactions and a verified V1 → V2 → V3 migration path without destructive repair of historical snapshots.

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

## P1 completed behavior

### Entity lifecycle

- reseller and item lifecycle is represented by `isActive`;
- missing lifecycle state is backward-safe as active (`isActive !== false`);
- Dexie V1 → V2 materializes reseller active state where absent;
- Dexie V2 → V3 materializes item active state where absent;
- explicit `false` lifecycle state survives the complete migration path;
- normal UI archives/reactivates instead of destructively deleting identities with history;
- hard deletion of resellers/items is blocked when transactions reference them.

### New-transaction reference matrix

For new activity created through the transaction mutation:

- every transaction requires a positive reseller ID resolving to an active reseller;
- `order` requires a positive `itemId` resolving to an active catalog item;
- the new-order `itemName` snapshot is derived from the referenced catalog item rather than trusted from a stale caller;
- `payment` and `signal` are reseller-level movements and reject `itemId` references;
- inactive/missing referenced entities are rejected below the UI.

### Historical compatibility

- existing stored transactions are not revalidated, deleted or rewritten during P1 migrations;
- historical order snapshots (`itemName`, quantity, unit price, total price, observation, dates) are preserved;
- a historical order whose old item reference no longer resolves remains readable when its stored snapshot exists;
- the complete V1 → V2 → V3 migration path preserves entity/transaction counts, IDs, dates, snapshots and valid lifecycle state.

## Verified high-priority risks after P1

1. There is no deliberate audited correction/reversal workflow for financial entries — P2.
2. `createdAt` currently carries date semantics that should later distinguish occurrence vs registration — P3.
3. Period balance semantics are not yet formal opening/closing statement semantics — P3.
4. Backup restore validation remains shallow; deep schema/reference/duplicate validation belongs to P5.
5. The repository-wide lint/test baseline contains known pre-existing debt; targeted P1 gates pass but P6 still owns suite reconciliation.
6. Production deployment is not gated by the full quality suite — P6.

## P1-S3 completion evidence

- [x] explicit new-transaction reference acceptance matrix defined and enforced;
- [x] new orders without an item reference are rejected;
- [x] new orders reject missing/inactive item references;
- [x] new-order item-name snapshots are derived from the resolved catalog identity;
- [x] payment/signal creation rejects item references;
- [x] invalid reseller identifiers, missing resellers and inactive resellers are rejected;
- [x] complete V1 → V2 → V3 migration preserves valid data, IDs, dates, snapshots and lifecycle state;
- [x] historical unresolved item references with stored snapshots are preserved rather than destructively repaired;
- [x] P1-S1/P1-S2 lifecycle/search/form/integration regressions pass;
- [x] GitHub Actions P1-S3 targeted gate passed on run `32039763539`;
- [x] `npm run build` passed on the same run;
- [x] P1 acceptance gates reconciled and P1 closed.

## Active constraints entering P2

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce Supabase/backend/authentication before P4;
- do not change financial occurrence-date/statement semantics yet — that belongs to P3;
- do not expand correction work into backup hardening — that belongs to P5;
- preserve original financial entries and historical context when designing corrections;
- avoid silent destructive deletion as the normal correction mechanism;
- add targeted tests with P2 behavior changes rather than postponing all testing to P6.

## NEXT_ACTION

**P2 — Correction, reversal and audit trail. Create a new feature branch from `develop`, inventory the current transaction deletion/correction surfaces and every balance/dashboard/search/PDF dependency, define the reversal/cancellation data model and acceptance criteria, then implement only the first coherent audited-correction slice. Preserve the original transaction, require an explicit correction reason, and do not change P3 date/statement semantics.**

## P2 completion direction

P2 must eventually support common input-error correction with traceability, including:

- preserved original financial entry;
- reversal/cancellation rather than silent destructive removal;
- mandatory correction reason;
- correction timestamp/status;
- balance/dashboard/history/PDF consistency;
- cases such as wrong value, duplicate payment, wrong reseller and old-order reversal.

The exact first P2 slice is to be defined from the current code inventory in the next feature branch.
