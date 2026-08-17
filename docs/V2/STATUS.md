# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P6 — Tests, CI and deployment safety**  
**State:** `NOT_STARTED`

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P5-S1 — Versioned backup contract and non-destructive restore preflight: `DONE`.
- P5-S2 — Checkpointed atomic restore and migration proof: `DONE`.

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

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. Dexie remains **V4** and D-016 remains authoritative: no backend, authentication, cloud database or synchronization is part of the accepted V2 foundation.

P1/P2/P3 define lifecycle, audit/correction and financial semantics. P5 now provides the complete local recovery path on top of those invariants.

## P5 completed recovery contract

### P5-S1 — backup/interchange preflight

New exports use the logical `easy-backup` envelope version 2 with source schema 4. Current v1 JSON remains supported through in-memory normalization before validation. Deep preflight validates required fields, IDs/duplicates, references, dates, values, P1 lifecycle and P2/P3 audit/linkage metadata before a restore is eligible to run.

### P5-S2 — checkpointed atomic restore

A restore now consumes the successful P5-S1 `BackupPreflightResult`; the normalized target is revalidated immediately before recovery starts so an altered/stale in-memory object cannot bypass the contract.

Before any destructive write:

1. the current live dataset is read;
2. it is serialized as a canonical `easy-backup` v2 checkpoint;
3. the checkpoint is itself passed through P5-S1 validation;
4. the checkpoint JSON is downloaded with an `easy-checkpoint-v2-*` filename.

Only after the checkpoint has been produced does the restore open one Dexie read/write transaction spanning `items`, `resellers` and `transactions`.

Inside that single transaction:

- all three tables are cleared;
- preflighted normalized rows are inserted with their original IDs;
- the restored dataset is read back;
- the full P5-S1 invariant validator runs again against the restored rows;
- a canonical logical projection is compared with the expected target, including IDs, fields, dates and P2/P3 metadata;
- any write or verification failure throws before commit, causing Dexie to roll back the whole replacement.

The restore returns an explicit success/failure result. A failure states that the previous database was preserved and includes the checkpoint filename when checkpoint creation had already completed.

## P5 migration proof

Targeted integration tests prove:

- current v2 export -> clean restore preserves item/reseller/transaction IDs;
- active/inactive lifecycle state survives the round-trip;
- P2 reversal/replacement links and reasons survive;
- P3 `occurredAt` survives and remains separate from registration time;
- financial result after restore equals the pre-export result;
- supported v1 input restores with `isActive = true` fallback and `occurredAt = createdAt` fallback while preserving IDs and financial effect;
- a simulated transaction write failure after clears begin rolls back to the complete previous dataset;
- a mutated normalized target is rejected before checkpoint or mutation.

GitHub Actions run **`32060729538` — PASS**, including P5-S2 restore integration/UI, P5-S1 regression, Dexie migrations, P1/P2/P3 regressions and `npm run build`.

## P5 completion evidence

- [x] versioned logical export contract;
- [x] backward-compatible v1 migration;
- [x] deep non-destructive preflight and preview;
- [x] recoverable checkpoint before replacement;
- [x] restore accepts only revalidated normalized input;
- [x] full-table replacement is one atomic Dexie transaction;
- [x] post-restore counts/fields/references/P1-P2-P3 invariants are verified before commit;
- [x] write/verification failure cannot leave a partially replaced database;
- [x] v2 export -> clean restore proof;
- [x] v1 migration -> restore proof;
- [x] financial history/results preserved;
- [x] P5 targeted gate passes.

## Remaining high-priority risks

1. Repository-wide stale/global test expectations and deployment gating — P6.
2. Remaining operational UX gaps — P7.
3. Real store requirements may later reopen D-016 — P8/P9.
4. Controlled beta/cutover still requires the later P10 gate.

## Active constraints entering P6

- do not work directly on `main` or the original repository;
- preserve all P1–P5 runtime and recovery contracts;
- D-016 local-first Dexie V4 remains accepted;
- do not change business/financial behavior merely to make stale tests pass;
- distinguish real regressions from obsolete test expectations/tooling debt;
- do not begin P7 UX or P8/P9 feature work while P6 is active.

## NEXT_ACTION

**P6-S1 — Reconcile repository-wide QA baseline and deployment safety. Create a new feature branch from `develop`, inventory the current npm scripts, lint/Vitest/Playwright configuration and GitHub deployment workflow, run the complete existing lint/unit/integration/E2E/build baseline without changing product behavior, classify every failure as a real regression versus stale test/tooling expectation, and implement only the coherent QA/deployment-gating slice needed so critical validation is mandatory before publication from `main`. Preserve P1–P5 semantics; do not begin P7 UX or new business modules.**

## P6 completion direction

P6 closes only when the repository-wide critical suite is reconciled, stale expectations are intentionally updated, real regressions are fixed, and deployment cannot publish a change that has not passed the accepted critical gates.
