# Easy V2 — Architecture Baseline

**Status:** verified through accepted P9-S3 category contract; category runtime not implemented  
**Integration target:** `develop`  
**Date:** 2026-08-18

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Current persistence baseline

Database: `ResellerManagerDB`, Dexie **V4** with exactly these business tables:

- `items`;
- `resellers`;
- `transactions`.

Current migration path is V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`.

P9-S3 contract work does **not** change the runtime schema. Dexie V5 is only the accepted target for the next bounded implementation slice.

Recovery-health state remains separate local control metadata in namespaced `localStorage` (`easy.recoveryHealth.v1`). It is not business persistence, is not part of the Dexie schema and is not serialized into the logical backup.

## Current persisted business invariants

Current runtime rows preserve:

- Item: `id`, `name`, `basePrice`, `isActive`, `createdAt`, `updatedAt`;
- Reseller: `id`, `name`, `phone`, `email`, `notes`, `isActive`, `createdAt`, `updatedAt`;
- Transaction: `id`, `resellerId`, `type`, item snapshot fields, `totalPrice`, `observation`, `reversal`, `correction`, `occurredAt`, `createdAt`;
- P2 reversal/correction links and audit metadata;
- P3 financial occurrence, reversed-zero effect, statements and FIFO-derived debt semantics.

There is currently no category table, no `Item.categoryId` and no transaction category snapshot in integrated runtime.

## Current D-017 backup/interchange contract

D-017 defines `easy-backup` version 2 as the canonical logical interchange format, distinct from Dexie schema version.

Current exports remain:

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

New exports self-validate before download. Legacy `version: 1` JSON remains supported by in-memory normalization before the deep validator runs.

P9-S2 did not alter the envelope. `exportData()` additionally returns local call metadata `{ filename, exportedAt }` after initiating the validated browser download; that return value is not backup payload data.

## Current D-018 atomic recovery boundary

Preflight validates restore input before mutation. Restore then creates a validated downloadable checkpoint and replaces current `items`, `resellers` and `transactions` inside one Dexie `rw` transaction. Restored rows are validated and canonically compared before commit; any write/read-back/verification error rolls the replacement back.

Restore remains deliberately outside the D-024 freshness write gate so recovery remains possible from an unknown or overdue installation.

## D-024 recovery durability architecture — implemented

D-024 uses a synchronized recovery-copy folder plus a 24-hour freshness guard while keeping D-016.

```text
Dexie live dataset
  -> validated easy-backup v2 export
  -> browser download
  -> local folder configured for OS/provider synchronization
  -> off-device provider copy when the synchronization client completes
```

Google Drive for desktop is the accepted current-store instance of the synchronized-folder layer. Easy does not use a Drive API and does not attest provider-side synchronization completion.

The local recovery-health control plane uses `easy.recoveryHealth.v1` with states `unknown`, `due`, `current`, `warning`, `overdue`; warning starts at 20 hours but the hard contract boundary is exactly 24 hours. Missing/corrupt/unverified state fails safe. Normal item/reseller/transaction mutations are centrally guarded; read-only use and Backup/Restore remain reachable.

## D-025 category target architecture — contracted, not implemented

Direct store evidence requires managed item categories, item classification and analysis by category. D-025 defines the architecture before persistence/UI/reporting implementation.

### Target category entity

```text
Category
- id: stable positive integer identity
- name: required business label
- isActive: reversible lifecycle state
- createdAt
- updatedAt
```

Architecture invariants:

- category ID is stable across rename;
- normalized category names are unique across active/inactive identities;
- normal lifecycle is archive/reactivate;
- a category cannot be archived while an active item references it;
- inactive items may retain an archived-category reference;
- physical category deletion is allowed only with no item reference and no historical transaction snapshot reference.

### Target item classification

Target Item adds:

```text
categoryId?: number
```

The field is optional for migration/legacy compatibility. Existing V4 items migrate without invented categories. Assignment/reassignment may target only active categories. Reassignment affects future orders only and never rewrites historical orders.

Migrated active items may open unclassified after migration, but once category-order enforcement is implemented they must receive an active category before participating in a new order.

### Target order classification snapshot

Future order transactions add:

```text
categoryId?: number
categoryName?: string
```

For new post-rollout orders, `categoryId` is the stable analytical identity and `categoryName` is the immutable transaction-time audit/display snapshot.

Historical invariants:

- item reassignment never rewrites old order category snapshots;
- category rename never rewrites stored transaction `categoryName`;
- V4 orders receive no synthetic category snapshot;
- missing historical category remains explicitly valid as `Sem categoria — histórico legado`;
- payment/signal rows never carry category fields;
- linked replacement correction of an order must preserve the original item/category snapshots and `occurredAt`.

### Category analysis boundary

Accepted category reporting is order-performance analysis only:

- source: effective non-reversed `order` rows;
- date: `occurredAt`;
- grouping: historical transaction `categoryId`;
- legacy bucket: missing category snapshot;
- minimum metrics: order count, summed quantity and gross order value;
- reversed original rows contribute zero and a linked effective replacement contributes once.

Category debt/payment allocation is explicitly out of contract. Payments and signals are reseller-level movements and P3 FIFO debt is derived at reseller level without persistent per-order settlement links. Any category debt attribution would invent a financial relationship not stored by the system.

### Target Dexie V5 direction

P9-S3-I1 is authorized to implement:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

V4 -> V5 migration must be lossless/non-inventive:

- create empty `categories` table;
- preserve current item/transaction IDs and business/audit fields;
- leave legacy `categoryId`/`categoryName` absent;
- do not infer categories from item names, observations or later assignments;
- do not require classification in order for the upgraded database to open.

### Target D-017 compatibility under V5

Logical backup version remains **2**. New V5 exports target:

```text
format = "easy-backup"
version = 2
source.schemaVersion = 5
data.categories[]
data.items[]        (+ categoryId?)
data.resellers[]
data.transactions[] (+ categoryId?/categoryName?)
```

Compatibility is additive rather than a forced `easy-backup` v3:

- supported legacy v1 remains accepted;
- existing v2/schemaVersion 4 remains accepted;
- legacy inputs normalize in memory to `categories = []` with absent category fields;
- no historical classification is fabricated;
- schema5 validates category identity/name uniqueness, references, lifecycle and order snapshot pairing;
- payment/signal category fields are invalid;
- legacy orders without category snapshot remain valid.

### Target D-018 extension

When P9-S3-I1 implements V5, the checkpoint and verified atomic replacement boundary expands to:

```text
categories + items + resellers + transactions
```

Checkpoint, destructive writes, revalidation and canonical read-back comparison must all include category entities/references/snapshots in one Dexie transaction. Any divergence rolls the full replacement back.

D-024 local recovery-health metadata remains outside this business recovery envelope and transaction.

## Repository-wide QA architecture

D-019 remains the mandatory repository gate:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

CI uses Node 22 and `npm ci`; PRs to `develop`/`main`, pushes to `develop` and manual dispatch run Critical QA. Publication from `main` retains the quality -> build -> deploy dependency chain.

Known warning/test-harness/dependency debt remains visible and non-blocking only when objective commands pass.

## P9-S3 contract validation

Contract-only PR #44 merge ref `31a4adca45f74e6907cfce079a98c95b2c580738` passed D-019 run **`32184499171`**, job **`95864903309`**:

- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

No runtime/schema/UI/reporting change occurred in the contract gate.

## Boundary entering P9-S3-I1

P9-S3-I1 may implement only category persistence, V4->V5 lossless migration and D-017/D-018 backup/restore compatibility. It must not implement category management UI, item-classification UI, new-order category enforcement/snapshot creation or category reporting. D-016/D-019/D-024 and the completed recovery guard remain authoritative.