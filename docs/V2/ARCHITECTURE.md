# Easy V2 — Architecture Baseline

**Status:** verified through P9-S3-I3 functional category reporting validation; documentation-complete gate/integration pending  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Current persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with four business tables: `categories`, `items`, `resellers`, `transactions`.

Migration path:

- V1 -> V2: reseller lifecycle;
- V2 -> V3: item lifecycle;
- V3 -> V4: transaction `occurredAt`;
- V4 -> V5: additive category persistence substrate.

V4 -> V5 deliberately performs no category backfill. Existing item/order rows, IDs, dates, P1/P2/P3 metadata and item snapshots remain unchanged. Recovery-health state remains separate namespaced local control metadata (`easy.recoveryHealth.v1`) and is not serialized into `easy-backup`.

## Current category runtime architecture

`Category` keeps stable identity (`id`, `name`, `isActive`, `createdAt`, `updatedAt`). Lifecycle invariants remain: rename preserves ID; names are trimmed/non-empty and case-insensitively unique across active/archived identities; archive/reactivate is normal lifecycle; archive is blocked by active-item reference; permanent deletion is blocked by any item or historical order category snapshot; normal writes remain subject to D-024.

Operator management remains at `/categories` through TanStack Query and the Dexie category service.

## Item classification architecture

`Item.categoryId?` remains optional for lossless legacy compatibility. Runtime rules remain:

- new active item creation requires an existing active category;
- assignment/reassignment may target only an active category;
- reactivation requires an active category;
- migrated active legacy items may remain unclassified/readable/editable without fabricated backfill;
- an unclassified legacy item cannot enter a new order until classified;
- reassignment affects future orders only.

## Order category snapshot architecture

Order transactions support optional historical `categoryId` + `categoryName`. For new post-I2 orders the validated Dexie write boundary resolves active reseller + active item + active category and stores item/category transaction-time snapshots. Callers cannot forge category fields through normal creation input.

Historical invariants remain:

- category rename never rewrites stored `transaction.categoryName`;
- item reassignment never rewrites prior `transaction.categoryId/categoryName`;
- pre-I2 orders without category snapshot remain valid;
- guided replacement preserves the original item/category snapshot, including explicit absence on legacy orders;
- payments/signals remain category-free.

## P9-S3-I3 read-only reporting architecture

I3 adds no persistence, migration, backup envelope or write path.

Reporting is split into a pure domain aggregation plus a bounded operator view:

```text
categories[] + transactions[]
        |
        v
buildCategoryOrderPerformance(...)
        |
        +-- effective non-reversed order rows only
        +-- transactionOccurredAt() / occurredAt period filter
        +-- group key = historical transaction.categoryId
        +-- missing key = "Sem categoria — histórico legado"
        +-- metrics = orderCount + quantity + grossValue
        |
        v
/category-report
```

Semantics:

- grouping never reads the item's current category;
- a current category entity may provide the display label for its stable historical ID, including archived categories;
- stored `transaction.categoryName` remains immutable audit/detail evidence and is not rewritten by reporting;
- reversed originals contribute zero and an effective linked replacement contributes once because reporting includes only effective rows;
- period boundaries are inclusive and based on financial occurrence, not registration time;
- payments, signals, reseller balance, open debt and FIFO debt are deliberately absent from the category-report domain;
- reporting is read-only, so D-024 write enforcement is unaffected.

## D-017 backup/interchange contract under Dexie V5

D-017 remains logical `easy-backup` **version 2**, `source.schemaVersion = 5`, with `data.categories[]`, item `categoryId?` and transaction `categoryId?/categoryName?`. Supported v1 and v2/schema4 backups still normalize losslessly without fabricated category history. Schema5 preflight and four-table recovery semantics remain unchanged by I3.

## D-018 atomic recovery boundary under V5

Restore still checkpoints/replaces `categories + items + resellers + transactions` inside one verified Dexie `rw` transaction. Structural/reference/P1/P2/P3/D-025 validation and canonical read-back comparison occur before commit; divergence rolls back the complete replacement. I3 changes none of this.

## D-024 recovery durability architecture — unchanged

D-024 continues synchronized recovery-copy folder + exact 24-hour freshness guard while keeping D-016. Easy has no Drive API/OAuth/provider-sync claim. Normal category/item/reseller/transaction writes remain subject to centralized freshness enforcement; read-only reporting and Backup/Restore remain reachable.

## D-025 implementation state

Implemented/integrated before I3:

- category persistence, migration, backup/restore substrate — I1;
- category lifecycle/operator management — I2;
- active-category item classification — I2;
- new-order category snapshot capture and correction preservation — I2.

Implemented and functionally validated in PR #48, pending documentation-complete D-019/integration:

- category order-performance aggregation and `/category-report` read-only UI — I3;
- effective-order-only semantics;
- `occurredAt` reporting basis;
- historical `transaction.categoryId` grouping;
- explicit legacy bucket;
- order-count / item-quantity / gross-value measures;
- archived-category reporting and stable-identity label resolution;
- linked-correction effective-row semantics.

No new D-number is required; this implements D-025.

## Repository-wide QA architecture

D-019 remains mandatory:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

CI uses Node 22 and `npm ci`; PRs to `develop`/`main`, pushes to `develop` and manual dispatch run Critical QA. Known React test warnings, mocked-select DOM warnings, dependency/audit notices, lint warning debt and large-chunk warning remain visible and non-blocking only when objective commands pass.

## Accepted category validation baseline

- P9-S3-I1: run `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.
- P9-S3-I2 final: run `32202876262`, job `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; canonical closure #47 as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.
- P9-S3-I3 functional: run `32261923163`, job `96096954271`, merge ref `02d656ea771e334622a6248139b508e20a98caf1`, head `01fcd986ed86fbe465592af3c5600a2570380ee8` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9` — **0 errors / 81 warnings, 51 files / 210 Vitest PASS, 17/17 Playwright PASS, production build PASS**.

## Boundary while closing P9-S3-I3

The documentation-complete PR #48 head must pass D-019 before integration. Until then, do not start P9-S4/P9-S5/P10, recategorize history, derive category debt/payment allocation, modify category persistence/backup semantics without a proven defect, or introduce backend/auth/cloud/live synchronization.
