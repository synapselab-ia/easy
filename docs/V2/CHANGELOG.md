# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P5-S1 versioned backup contract and restore preflight

### Added

- logical `easy-backup` format version 2, distinct from Dexie schema V4;
- complete serialization contract for current Item, Reseller, Transaction, reversal and correction fields;
- in-memory compatibility normalization for backup v1;
- path-level backup validation and normalized preview;
- preview counts for lifecycle state, transaction types and P2 audit/correction records;
- targeted backup-service and preview-UI tests.

### Changed

- export now emits v2 and validates the logical dataset before download;
- v1 missing item/reseller `isActive` normalizes to `true`;
- v1 missing transaction `occurredAt` normalizes from `createdAt`;
- selecting a backup now runs parse, migration, validation and preview only;
- the prior immediate replacement flow was removed pending P5-S2 recovery guarantees;
- P5 is now `IN_PROGRESS`; P5-S1 is `DONE`.

### Validation

Preflight rejects unsupported or malformed envelopes, invalid/duplicate IDs, broken references, invalid dates/numbers and inconsistent P2/P3 correction metadata/linkage. It produces normalized in-memory rows without writing IndexedDB.

GitHub Actions run `32058028793` passed P5-S1 service/UI gates, occurrence compatibility, Dexie migrations, P1/P2/P3 regressions and `npm run build`.

### Decision and scope

D-017 accepted: backup v2 is the canonical logical recovery contract and successful preflight is required before the P5-S2 replacement workflow. Dexie remains V4; D-016 local-first architecture remains accepted; no backend/auth/cloud or P6 work was introduced.

### Canonical state

P5 `IN_PROGRESS`; P5-S1 `DONE`; P5-S2 `NOT_STARTED`; `NEXT_ACTION` is P5-S2 checkpointed atomic restore and migration proof.

---

## 2026-08-17 — P4 local-first persistence decision

- D-016 accepted local-first/single-user Dexie V4 under evidenced requirements;
- no backend/auth/cloud implementation;
- P4 closed and NEXT_ACTION advanced to P5-S1.

## 2026-08-17 — P3-S2 formal statements, FIFO debt aging and P3 closure

- shared opening → movements → closing statement model;
- per-reseller total debt semantics and FIFO-derived open-debt aging;
- validation `32053837309`; P3 closed; D-015 accepted.

## 2026-08-17 — P3-S1 occurrence-date model

- `occurredAt` separated from audit `createdAt`, Dexie V4 added and date consumers aligned;
- validation `32052076684`.

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement and correction;
- validation `32042373332`; P2 closed.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp and reversal-aware financial rules;
- validation `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict reference matrix and migration preservation coverage;
- validation `32039763539`; P1 closed.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration and snapshot preservation;
- validation `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration and active-only new activity;
- validation `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established; no runtime impact.
