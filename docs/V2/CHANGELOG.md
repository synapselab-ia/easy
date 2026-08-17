# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P3-S1 occurrence-date model

### Added

- financial `occurredAt` on transactions, distinct from registration/audit `createdAt`;
- Dexie V4 with `occurredAt` index and backward-safe V3 → V4 migration;
- canonical `transactionOccurredAt()` legacy-read fallback;
- transaction-entry financial date field;
- focused P3-S1 migration, mutation, form, dashboard, history, reseller-filter, PDF and backup tests;
- D-014 defining financial occurrence versus audit timestamps.

### Changed

- new transaction `createdAt` is generated internally rather than supplied by the supported UI;
- linked P2 correction preserves original financial occurrence while replacement registration and reversal timestamps remain separate audit events;
- history sorting/display, reseller date-range filtering, PDF filtering/display, today-order metrics, current aging and performance windows use occurrence date;
- legacy backup restore materializes missing occurrence from `createdAt` while preserving explicit occurrence;
- Dexie current schema moved from V3 to V4;
- P3 moved from `NOT_STARTED` to `IN_PROGRESS`; P3-S1 is `DONE`.

### QA

- targeted P3-S1 gate, P1/P2 regressions and build passed in GitHub Actions run `32052076684`;
- repository-wide QA debt remains P6.

### Scope unchanged

- opening balance → movements → closing balance semantics were not implemented;
- the existing last-effective-movement aging model was not accepted/replaced;
- backend/auth/persistence architecture remains P4;
- deep backup hardening remains P5;
- global CI cleanup remains P6.

### Canonical state

- D-014 accepted;
- P3-S1 `DONE`;
- P3 `IN_PROGRESS`;
- `NEXT_ACTION` advances to P3-S2 — statement and balance-period semantics.

---

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement, guided wrong-value/wrong-reseller correction and bidirectional audit linkage;
- P2 closed; validation run `32042373332`.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp, shared effective/reversed financial rules and visible history/PDF audit status;
- validation run `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict new-reference matrix and complete V1 → V2 → V3 preservation coverage;
- validation run `32039763539`.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration, guarded deletion and historical snapshot preservation;
- validation run `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration, guarded deletion and active-only new transactions;
- validation run `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established in `synapselab-ia/easy`; no runtime impact.
