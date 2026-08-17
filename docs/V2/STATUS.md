# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P5 — Backup, restore and migration**  
**State:** `IN_PROGRESS`

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5-S1 — Versioned backup contract and non-destructive restore preflight: `DONE`.
- P5-S2 — Checkpointed atomic restore and migration proof: `NOT_STARTED`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source needed for `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. Dexie schema remains **V4**. P1/P2/P3 financial/history invariants and D-016 local-first persistence remain authoritative.

## P5-S1 completed contract

### Persisted-field inventory

The logical recovery contract covers every current Dexie V4 persisted field:

- Item: `id`, `name`, `basePrice`, `isActive`, `createdAt`, `updatedAt`;
- Reseller: `id`, `name`, `phone`, `email`, `notes`, `isActive`, `createdAt`, `updatedAt`;
- Transaction: `id`, `resellerId`, `type`, `itemId`, `itemName`, `quantity`, `unitPrice`, `totalPrice`, `observation`, `reversal`, `correction`, `occurredAt`, `createdAt`;
- reversal: `reason`, `reversedAt`, `replacementTransactionId`;
- correction: `replacesTransactionId`.

### Backup envelope v2

New exports use the logical envelope:

```text
format: "easy-backup"
version: 2
exportedAt: ISO timestamp
source.database: "ResellerManagerDB"
source.schemaVersion: 4
data.items[]
data.resellers[]
data.transactions[]
```

Backup version is independent from Dexie schema version. Export validates the assembled dataset against the same preflight contract before download.

### Backward compatibility

Current legacy `version: 1` JSON is accepted only through in-memory migration before validation:

- missing item/reseller `isActive` -> `true`;
- missing transaction `occurredAt` -> its `createdAt`;
- explicit P1/P2/P3 fields are preserved;
- unsupported backup versions are rejected.

The migration does not write IndexedDB.

### Non-destructive preflight

Preflight validates before any restore mutation:

- envelope/version/source structure;
- required persisted fields;
- positive integer IDs and duplicate IDs per table;
- non-empty required text and positive finite prices/amounts/quantities;
- valid dates and entity `updatedAt >= createdAt`;
- transaction type/order-vs-payment field shape;
- reseller and item references;
- reversal reason/timestamp and correction/replacement IDs;
- P2 bidirectional original/replacement linkage;
- correction type preservation and order-item preservation;
- P3 correction occurrence preservation;
- replacement registration chronology.

Invalid input raises a structured `BackupValidationError` and does not call a Dexie transaction, `clear()` or `bulkAdd()`.

### Preview boundary

A valid preflight returns normalized in-memory data plus a preview containing source/target version, schema version, export timestamp, migration warnings, entity counts, active/inactive counts, transaction-type counts and P2 reversal/correction counts.

The Backup UI now performs **validation + preview only**. The old destructive confirmation/import path was removed from P5-S1. No valid file can replace the live database until P5-S2 adds the required checkpoint and atomic restore contract.

## P5-S1 completion evidence

- [x] every Dexie V4 persisted field inventoried;
- [x] backup v2 logical envelope implemented;
- [x] v1 backward migration implemented in memory;
- [x] required fields, IDs/duplicates, references, dates and numeric values validated;
- [x] P1 lifecycle and P2/P3 audit/linkage metadata validated/preserved;
- [x] valid file produces preview without mutation;
- [x] invalid file cannot clear/write current database;
- [x] destructive import path removed pending P5-S2;
- [x] targeted P5-S1/UI/occurrence/migration/P1/P2/P3 regressions pass;
- [x] `npm run build` passes;
- [x] GitHub Actions run `32058028793` — PASS.

## Remaining high-priority risks

1. Recoverable checkpoint before replacement, atomic restore and post-restore proof — P5-S2.
2. Repository-wide QA/deployment gating — P6.
3. Remaining operational UX gaps — P7.
4. Real store requirements may later reopen D-016 — P8/P9.

## Active constraints entering P5-S2

- do not work directly on `main` or the original repository;
- keep D-016 local-first Dexie V4 architecture;
- use only successfully preflighted normalized data as restore input;
- preserve P1/P2/P3 IDs, history, occurrence and audit linkage exactly;
- create a recoverable checkpoint before replacing live data;
- replacement must be atomic and post-restore invariants must be verified;
- do not introduce backend/auth/cloud or pull P6 work into P5-S2.

## NEXT_ACTION

**P5-S2 — Checkpointed atomic restore and migration proof. Create a new feature branch from `develop` and implement only the destructive restore slice on top of the accepted P5-S1 preflight: create a recoverable checkpoint of the current validated dataset before replacement, restore only successfully preflighted normalized data inside one atomic Dexie transaction, verify post-restore counts/references/P1-P2-P3 invariants, and provide an explicit success/failure result that never leaves a partially replaced database. Add targeted tests proving current v2 export → clean restore and supported v1 migration preserve IDs, lifecycle state, transaction history, reversal/correction links, occurrence dates and financial results. Do not begin P6 CI/deployment cleanup.**

## P5 completion direction

P5 closes only after versioned export -> validated preview -> checkpoint -> atomic restore reproduces the canonical dataset and invariants with a demonstrated recovery path.
