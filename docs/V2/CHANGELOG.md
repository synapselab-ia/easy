# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P2-S1 audited transaction reversal

### Added

- optional `Transaction.reversal` audit metadata with mandatory reason and ISO reversal timestamp;
- shared transaction-domain helpers for reversed/effective state and financial effect;
- `useReverseTransaction` mutation that preserves the original financial entry;
- reseller-history reversal action with mandatory reason;
- visible `Válido`/`Estornado` status, reversal reason and timestamp;
- PDF reversal status/reason;
- targeted automated coverage for reversal domain, mutation, UI and cross-surface financial consistency.

### Changed

- physical transaction deletion is no longer the approved correction path for the P2-S1 slice;
- reversed transactions remain stored/visible but contribute zero financial effect;
- reseller total/filtered balances use shared reversal-aware calculation;
- dashboard total debt, today orders, aging and performance ignore reversed financial effect;
- global-search reseller balances ignore reversed financial effect;
- PDF keeps audit rows while receiving reversal-aware balances;
- P2 state advances from `NOT_STARTED` to `IN_PROGRESS` with P2-S1 `DONE`.

### Persistence

- Dexie schema remains V3; no V4 is required because reversal metadata is optional/non-indexed;
- `reversal.reversedAt` uses an ISO string, which is naturally JSON-safe under the current backup serialization;
- this does not constitute P5 backup-validation hardening.

### QA

- targeted P2-S1 gate passed in GitHub Actions run `32041280504`;
- P1 migration/lifecycle/reference regressions passed in the same gate;
- `npm run build` passed in the same run;
- repository-wide QA debt remains explicitly owned by P6.

### Canonical state

- P2-S1 — Audited transaction reversal: `DONE`;
- P2 — Correction, reversal and audit trail: `IN_PROGRESS`;
- `NEXT_ACTION` advances to P2-S2 — linked/guided correction replacement;
- P3 date/statement semantics remain untouched;
- backend/authentication remains unapproved before P4.

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
- reseller/item lifecycle, search, form, Command Center, integration and historical snapshot regressions passed;
- `npm run build` passed;
- repository-wide QA debt remains P6.

### Canonical state

- P1-S3 is `DONE`;
- P1 is `DONE`;
- `NEXT_ACTION` advanced to P2.

---

## 2026-08-17 — P1-S2 safe item lifecycle

### Added

- item `isActive` lifecycle state;
- Dexie V3 item active-default migration;
- reversible item archive/reactivate mutations;
- guarded hard deletion for referenced items;
- inactive-state visibility and active-only new-order behavior;
- historical snapshot preservation.

### QA

- targeted gate and build passed in run `32038951903`.

---

## 2026-08-17 — P1-S1 safe reseller lifecycle

### Added

- reseller `isActive` lifecycle state;
- Dexie V2 reseller active-default migration;
- reversible reseller archive/reactivate mutations;
- guarded hard deletion for referenced resellers;
- inactive-state visibility and active-only new-transaction behavior.

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
- legacy `tasks/` checkboxes demoted from canonical status tracking.

### Runtime impact

None. P0 intentionally changed documentation/governance only.
