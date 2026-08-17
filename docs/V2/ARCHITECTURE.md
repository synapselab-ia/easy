# Easy V2 — Architecture Baseline

**Status:** verified through completed P5  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V4** with `items`, `resellers` and `transactions`.

Migration path remains V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`. P5 adds no Dexie V5.

## Persisted recovery invariants

The logical recovery contract preserves all current fields and relationships:

- Item: `id`, `name`, `basePrice`, `isActive`, `createdAt`, `updatedAt`;
- Reseller: `id`, `name`, `phone`, `email`, `notes`, `isActive`, `createdAt`, `updatedAt`;
- Transaction: `id`, `resellerId`, `type`, item snapshot fields, `totalPrice`, `observation`, `reversal`, `correction`, `occurredAt`, `createdAt`;
- P2 reversal/correction links and audit metadata;
- P3 financial occurrence, reversed-zero effect, statements and FIFO-derived debt semantics.

## Backup/interchange contract

D-017 defines `easy-backup` version 2 as the canonical logical interchange format, distinct from Dexie schema version:

```text
format = "easy-backup"
version = 2
exportedAt = ISO timestamp
source.database = "ResellerManagerDB"
source.schemaVersion = 4
data.items[]
data.resellers[]
data.transactions[]
```

New exports self-validate before download. Legacy `version: 1` JSON remains supported by in-memory normalization (`isActive -> true` when missing; `occurredAt -> createdAt` when missing) before the same deep validator runs.

## Preflight boundary

`preflightBackupPayload()` / `preflightBackupText()` / `preflightBackupFile()` are the accepted ingress for restore data. They validate envelope structure, IDs/duplicates, fields, dates, values, table references and P1/P2/P3 audit/linkage invariants, returning normalized `Date`-backed rows plus a preview.

A restore never reparses unchecked file contents. It receives the successful `BackupPreflightResult` and revalidates its normalized target immediately before recovery starts, preventing an altered in-memory object from bypassing the contract.

## P5-S2 checkpoint and atomic restore

`restoreService.ts` owns destructive recovery.

### Checkpoint

Before replacement, `createRestoreCheckpoint()`:

1. reads all live Dexie V4 rows;
2. serializes them to a v2 logical backup envelope;
3. validates that checkpoint with the P5-S1 validator;
4. downloads it as `easy-checkpoint-v2-<timestamp>.json`.

If checkpoint generation/validation/download fails, no destructive transaction starts.

### Atomic replacement

`restorePreflightedBackup()` then opens one Dexie `rw` transaction spanning all three tables. Within that transaction it:

- clears items, resellers and transactions;
- bulk-adds the normalized target with original IDs;
- reads all restored rows back;
- runs P5-S1 validation again against the restored logical dataset;
- compares a canonical, ID-sorted projection of every restored field/date/link with the expected target.

Any write or verification error throws before commit. Dexie rollback therefore restores the full prior database rather than exposing a partial replacement.

### Result contract

Restore returns a discriminated result:

- `status: "success"` with checkpoint filename and restored preview; or
- `status: "failure"` with `previousDatabasePreserved: true`, error message and checkpoint filename when one had already been generated.

The UI exposes restore only after successful preflight and communicates the checkpoint/recovery result.

## Migration/round-trip proof

P5-S2 integration coverage uses real Dexie semantics through `fake-indexeddb` and proves:

- v2 export -> clean restore preserves IDs, lifecycle state, transaction history, P2 correction links, P3 occurrence and financial balance;
- supported v1 migration -> restore materializes legacy lifecycle/occurrence defaults while preserving IDs/finance;
- a simulated table-write failure after clears begin rolls back to the prior dataset;
- a mutated normalized target is rejected before checkpoint or mutation.

Targeted run **`32060729538` — PASS**, including P5-S2 restore/UI, P5-S1 regressions, migrations, P1/P2/P3 regressions and build.

## Boundary entering P6

P6 may change tests, QA workflows and deployment gates. It must not alter P1–P5 business/recovery semantics merely to satisfy stale expectations, and it must not introduce backend/auth/cloud or P7+ feature work.
