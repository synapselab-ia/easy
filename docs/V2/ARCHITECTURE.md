# Easy V2 — Architecture Baseline

**Status:** verified through P9-S3-I1 category persistence/migration/backup implementation  
**Integration target:** `develop`  
**Date:** 2026-08-18

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Current persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with four business tables:

- `categories`;
- `items`;
- `resellers`;
- `transactions`.

Migration path:

- V1 -> V2: reseller lifecycle;
- V2 -> V3: item lifecycle;
- V3 -> V4: transaction `occurredAt`;
- **V4 -> V5: additive category persistence substrate.**

V4 -> V5 deliberately has no category backfill. It creates the `categories` table and new optional fields while preserving existing rows, IDs, dates, P1/P2/P3 metadata and order item snapshots unchanged.

Recovery-health state remains separate local control metadata in namespaced `localStorage` (`easy.recoveryHealth.v1`). It is not business persistence, is not part of Dexie V5 and is not serialized into `easy-backup`.

## Current persisted business invariants

Category:

```text
id?
name
isActive
createdAt
updatedAt
```

Item now supports:

```text
id?
name
basePrice
isActive?
categoryId?
createdAt
updatedAt
```

`categoryId` is optional for migrated/legacy compatibility. P9-S3-I1 does not yet provide the operational assignment UI or enforce category assignment on item creation/reactivation.

Transaction now supports optional historical category snapshot fields:

```text
categoryId?
categoryName?
```

I1 introduces storage/backup/restore compatibility only. Normal new-order creation does **not** yet create a category snapshot; that belongs to P9-S3-I2. Guided replacement correction preserves any category snapshot already present on an imported/persisted order so correction cannot silently rewrite historical classification.

All P2 reversal/correction links, P3 `occurredAt`, reversed-zero effect, statement semantics and FIFO-derived reseller debt remain unchanged.

## D-017 backup/interchange contract under Dexie V5

D-017 still defines `easy-backup` **version 2** as the logical interchange/recovery format, independent from Dexie schema version.

Current exports are now:

```text
format = "easy-backup"
version = 2
exportedAt = ISO timestamp
source.database = "ResellerManagerDB"
source.schemaVersion = 5
data.categories[]
data.items[]        (+ categoryId?)
data.resellers[]
data.transactions[] (+ categoryId?/categoryName?)
```

Schema5 preflight validates:

- positive unique category IDs;
- trimmed non-empty category names unique case-insensitively across active/inactive categories;
- category dates/lifecycle fields;
- every present item/transaction category reference;
- active items cannot reference inactive categories;
- order `categoryId`/`categoryName` snapshot fields appear together;
- payments/signals cannot carry category fields;
- linked corrected orders preserve the original category snapshot.

Compatibility remains additive:

- supported legacy v1 remains accepted;
- existing `easy-backup` v2/schemaVersion 4 remains accepted;
- v1 and v2/schema4 inputs normalize in memory to V5 with `categories = []` and absent category fields;
- no historical category classification is inferred or fabricated;
- legacy orders without category snapshots remain valid indefinitely.

Backup preview now exposes category count, unclassified-item count and legacy-order-without-category-snapshot count in addition to existing business/audit counts.

`exportData()` continues to return local call metadata `{ filename, exportedAt }` after initiating the validated browser download; that return value is not payload data.

## D-018 atomic recovery boundary under V5

Restore preflight occurs before mutation. The restore flow now:

1. reads all four business tables;
2. creates and downloads a validated v2/schema5 checkpoint;
3. revalidates the normalized target;
4. clears/writes `categories`, `items`, `resellers` and `transactions` inside one Dexie `rw` transaction;
5. reads all four tables back;
6. reruns structural/reference/P1/P2/P3/D-025 validation;
7. compares the canonical four-table logical snapshot with the expected target before commit.

Any write, validation or read-back divergence throws inside the transaction and rolls back the complete four-table replacement.

Restore remains deliberately outside the D-024 freshness write gate so recovery is possible from unknown/overdue installations. D-024 local metadata remains outside D-017/D-018.

## D-024 recovery durability architecture — unchanged

D-024 uses a synchronized recovery-copy folder plus a 24-hour freshness guard while keeping D-016.

```text
Dexie V5 live dataset
  -> validated easy-backup v2/schema5 export
  -> browser download
  -> local folder configured for OS/provider synchronization
  -> off-device provider copy when the synchronization client completes
```

Google Drive for desktop remains the accepted current-store synchronized-folder instance. Easy does not use a Drive API and does not attest provider-side synchronization completion.

The local recovery-health control plane uses `easy.recoveryHealth.v1` with `unknown`, `due`, `current`, `warning`, `overdue`; warning starts at 20 hours but the hard contract boundary remains exactly 24 hours. Normal mutations are centrally guarded; read-only use and Backup/Restore remain reachable.

## D-025 category architecture

D-025 remains the authoritative category lifecycle/history/reporting contract.

Current implementation state after I1:

- persistence substrate: **implemented**;
- V4→V5 non-inventive migration: **implemented**;
- v2/schema5 backup + legacy normalization: **implemented**;
- D-018 four-table restore extension: **implemented**;
- category management lifecycle operations/UI: **not implemented**;
- item assignment/reassignment flow: **not implemented**;
- new-order active-category enforcement and category snapshot capture: **not implemented**;
- category reporting: **not implemented**.

Historical/category semantics remain:

- category ID is stable across rename;
- names are unique after case-insensitive normalization across active/inactive identities;
- lifecycle is archive/reactivate with guarded hard deletion;
- reassignment affects future orders only;
- old snapshots are never rewritten;
- V4/legacy orders stay unclassified rather than being backfilled;
- payment/signal movements never carry category fields;
- category analysis, when implemented later, is order-performance reporting only and must not invent category debt/payment allocation.

## Repository-wide QA architecture

D-019 remains mandatory:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

CI uses Node 22 and `npm ci`; PRs to `develop`/`main`, pushes to `develop` and manual dispatch run Critical QA. Publication from `main` retains the quality -> build -> deploy chain.

Known warning/test-harness/dependency debt remains visible and non-blocking only when objective commands pass.

## Accepted category validation baseline

P9-S3 contract final closure: run `32185226251`, job `95867186002`, PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312` — 0 errors / 80 warnings, 44/183 Vitest, 17/17 Playwright, build PASS. Integrated squash `ede644b88ad00c11b566d82a21758cc82b7a8126` shares exact tree `676f70baa62a46cc353d756a2ff5624295d699c8` with that validated merge ref.

P9-S3-I1 functional accepted run **`32191018791`**, job **`95885134808`**, PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d` — **0 errors / 81 warnings, 47/195 Vitest, 17/17 Playwright, build PASS**.

The final documentation head still requires its own D-019 before integration.

## Boundary entering P9-S3-I2

P9-S3-I2 may implement only D-025 category lifecycle operations, operator category management, item assignment/reassignment and new-order active-category enforcement/snapshot capture. It must preserve legacy unclassified rows and existing snapshots without backfill.

Category reporting remains outside I2. P9-S4/P9-S5/P10, backend/auth/cloud/live synchronization and any D-016 reopen remain unauthorized.