# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P5-S2 checkpointed atomic restore and P5 closure

### Added

- local `restoreService` that accepts only a successful P5-S1 preflight result;
- validated v2 checkpoint generation/download before destructive replacement;
- one-transaction replacement of items, resellers and transactions;
- in-transaction post-restore invariant validation and canonical dataset comparison;
- explicit restore success/failure result with checkpoint/recovery information;
- restore action in the validated backup preview UI;
- integration tests using real Dexie/fake IndexedDB transaction semantics.

### Recovery behavior

Before replacement, the live database is serialized as `easy-checkpoint-v2-*`, passed through the P5-S1 validator and downloaded. The normalized restore target is also revalidated immediately before recovery, so a mutated in-memory target cannot bypass the preflight contract.

All table clears, inserts and restored-data verification occur inside one Dexie transaction. A write or verification error aborts the transaction and leaves the previous dataset intact rather than partially replaced.

### Migration proof

Tests demonstrate:

- current v2 `exportData()` -> preflight -> clean restore preserves IDs, lifecycle state, P2 reversal/correction linkage, P3 occurrence dates and financial balance;
- supported v1 input -> migration -> restore preserves IDs/financial effect and materializes the accepted lifecycle/occurrence defaults;
- simulated failure after table clears begin rolls back the full replacement;
- altered normalized input is rejected before checkpoint/write.

### Validation

GitHub Actions run `32060729538` passed the P5-S2 restore/UI gates, P5-S1 regressions, Dexie migrations, P1/P2/P3 regressions and `npm run build`.

### Decision and canonical state

- D-018 accepted: destructive restore requires a validated downloaded checkpoint and one verified atomic Dexie transaction;
- Dexie remains V4 and D-016 remains local-first;
- P5 is `DONE`;
- QG-006 backup validation/recovery depth is resolved;
- `NEXT_ACTION` advances to P6-S1 repository-wide QA baseline and deployment safety.

---

## 2026-08-17 — P5-S1 versioned backup contract and restore preflight

- `easy-backup` version 2 introduced as logical recovery/interchange contract;
- current v1 JSON migrated in memory before deep validation;
- backup selection changed to validation/preview without mutation;
- D-017 accepted;
- validation `32058028793` passed.

## 2026-08-17 — P4 local-first persistence decision

- D-016 accepted local-first/single-user Dexie V4 under evidenced requirements;
- no backend/auth/cloud implementation;
- P4 closed.

## 2026-08-17 — P3-S2 formal statements, FIFO debt aging and P3 closure

- shared opening → movements → closing statement model;
- per-reseller total debt semantics and FIFO-derived open-debt aging;
- validation `32053837309`; D-015 accepted.

## 2026-08-17 — P3-S1 occurrence-date model

- `occurredAt` separated from audit `createdAt`, Dexie V4 added and date consumers aligned;
- validation `32052076684`.

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement and correction;
- validation `32042373332`.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp and reversal-aware financial rules;
- validation `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict reference matrix and migration preservation coverage;
- validation `32039763539`.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration and snapshot preservation;
- validation `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration and active-only new activity;
- validation `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established; no runtime impact.
