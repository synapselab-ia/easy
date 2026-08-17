# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P1-S3 referential validation and P1 closure

### Added

- explicit new-transaction reference acceptance matrix;
- positive reseller-ID validation before lookup;
- mandatory catalog reference for new orders;
- mutation-level derivation of new-order `itemName` from the resolved item identity;
- rejection of item references on new payment/signal movements;
- complete V1 → V2 → V3 migration-path coverage;
- automated preservation coverage for IDs, dates, lifecycle state and historical transaction snapshots.

### Historical compatibility

- existing stored transactions are not revalidated or rewritten during P1 migrations;
- unresolved historical item references with a stored snapshot remain preserved/readable;
- no Dexie V4 was introduced because P1-S3 changes runtime validation/coverage rather than persistent fields.

### QA

- targeted P1-S3 gate passed in GitHub Actions run `32039763539`;
- reseller/item lifecycle, search, form, Command Center, integration and historical snapshot regressions passed in the same gate;
- `npm run build` passed in the same run;
- repository-wide QA debt remains explicitly owned by P6.

### Canonical state

- P1-S3 is `DONE`;
- P1 — Referential integrity and safe entity lifecycle is `DONE`;
- `NEXT_ACTION` advances to P2 — Correction, reversal and audit trail;
- deep backup restore validation remains P5 rather than being pulled into P1.

---

## 2026-08-17 — P1-S2 safe item lifecycle

### Added

- item `isActive` lifecycle state;
- Dexie schema V3 migration that defaults existing items to active without changing reseller lifecycle state;
- reversible item archive/reactivate mutations;
- hard-delete protection when a transaction references an item;
- order-creation guard for inactive/missing referenced items;
- inactive-state visibility in catalog and global search/recent results;
- targeted automated coverage for item lifecycle, migration, search, new-order selection/guards, catalog integration and P1-S1/history regressions.

### Changed

- normal item removal now archives instead of destructively deleting the catalog identity;
- new-order forms list only active items;
- historical transaction snapshots remain unchanged;
- canonical P1 state advanced from P1-S2 to P1-S3.

### QA

- targeted gate and build passed in run `32038951903`.

---

## 2026-08-17 — P1-S1 safe reseller lifecycle

### Added

- reseller `isActive` lifecycle state;
- Dexie schema V2 migration that defaults existing resellers to active;
- reversible reseller archive/reactivate mutations;
- hard-delete protection when a reseller has financial transactions;
- transaction-creation guard for inactive/missing resellers;
- inactive-state visibility in reseller list, global search and detail/history.

### Changed

- normal reseller removal now archives instead of destructively deleting the identity;
- new transaction forms list only active resellers;
- archived reseller records remain available for historical attribution and statement/PDF flows;
- canonical P1 state advanced from P1-S1 to P1-S2.

### QA

- targeted gate and build passed in run `32037965651`.

---

## 2026-08-17 — P0 governance and state reconstruction

### Added

- canonical V2 product specification;
- verified architecture baseline;
- canonical phased backlog P0–P10;
- decision ledger;
- QA ledger;
- canonical status/next-action document.

### Governance established

- `synapselab-ia/easy` designated as V2 laboratory;
- `main` designated as stable copied baseline/reference;
- `develop` designated as V2 integration branch;
- `feature/*` designated for isolated work;
- legacy `tasks/` checkboxes explicitly demoted from canonical status tracking.

### Runtime impact

None. P0 intentionally changed documentation/governance only.
