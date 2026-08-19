# Easy V2 — Architecture Baseline

**Status:** verified through P9-S3-I2 category lifecycle/classification/order-snapshot implementation  
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
- V4 -> V5: additive category persistence substrate.

V4 -> V5 deliberately performs no category backfill. Existing item/order rows, IDs, dates, P1/P2/P3 metadata and item snapshots remain unchanged.

Recovery-health state remains separate namespaced local control metadata (`easy.recoveryHealth.v1`). It is not business persistence, is not part of Dexie V5 and is not serialized into `easy-backup`.

## Current category runtime architecture

Category:

```text
id?
name
isActive
createdAt
updatedAt
```

Implemented lifecycle invariants:

- stable ID survives rename;
- names are trimmed/non-empty and unique case-insensitively across active and archived identities;
- normal lifecycle is archive/reactivate;
- archive is blocked while an active item references the category;
- inactive items may retain archived-category references;
- permanent deletion is blocked by any item reference or historical transaction category snapshot;
- category lifecycle writes pass through D-024 freshness enforcement.

Operator management is exposed as a bounded `/categories` flow using TanStack Query hooks backed by the Dexie category service. This is operational management only; no reporting aggregation is part of I2.

## Item classification architecture

Item supports:

```text
id?
name
basePrice
isActive?
categoryId?
createdAt
updatedAt
```

`categoryId` remains optional for lossless legacy compatibility, but runtime rules now distinguish legacy readability from new business activity:

- new active item creation requires an existing active category;
- assignment/reassignment may target only an active category;
- reactivation requires an active category;
- a migrated active legacy item with no category remains readable/editable and is not backfilled automatically;
- such an unclassified legacy item is blocked from a new order until the operator assigns an active category;
- reassignment changes future-order classification only.

## Order category snapshot architecture

Order transactions support:

```text
categoryId?
categoryName?
```

For a new post-I2 order, the validated write boundary now resolves:

```text
active reseller
  + active item
  + item's active category
  -> canonical item snapshot
  -> categoryId + categoryName transaction-time snapshot
```

The category lookup occurs inside the same Dexie transaction used for the order write. Callers cannot supply/forge category fields through normal creation input.

Historical invariants:

- category rename never rewrites stored `transaction.categoryName`;
- item reassignment never rewrites prior `transaction.categoryId`/`categoryName`;
- V4/pre-I2 orders without category snapshot remain valid indefinitely;
- guided replacement correction preserves the original item/category snapshot, including the explicit absence of category data on a legacy order;
- payments and signals never receive category fields.

## D-017 backup/interchange contract under Dexie V5

D-017 remains `easy-backup` **version 2**, independent from Dexie schema version.

Current exports:

```text
format = "easy-backup"
version = 2
source.database = "ResellerManagerDB"
source.schemaVersion = 5
data.categories[]
data.items[]        (+ categoryId?)
data.resellers[]
data.transactions[] (+ categoryId?/categoryName?)
```

Schema5 preflight validates category identity/name uniqueness, references, active-item lifecycle compatibility, order snapshot pairing, payment/signal exclusion and linked-correction snapshot preservation.

Supported v1 and existing v2/schema4 backups remain accepted through in-memory normalization to `categories = []` with absent category fields. No history is fabricated. Backup preview continues to expose category, unclassified-item and legacy-order counts.

I2 changes no backup envelope, schema or restore mechanism.

## D-018 atomic recovery boundary under V5

Restore still checkpoints and replaces `categories + items + resellers + transactions` inside one verified Dexie `rw` transaction. Structural/reference/P1/P2/P3/D-025 validation plus canonical read-back comparison occur before commit; divergence rolls back the complete replacement.

Restore remains deliberately outside the D-024 freshness write gate. D-024 local metadata stays outside D-017/D-018.

## D-024 recovery durability architecture — unchanged

D-024 continues to use a synchronized recovery-copy folder plus exact 24-hour freshness guard while keeping D-016. Google Drive for desktop remains the accepted current-store synchronized-folder instance; Easy does not use a Drive API and does not claim provider-side synchronization completion.

Normal category, item, reseller and transaction mutations remain subject to centralized freshness enforcement. Read-only use and Backup/Restore remain reachable.

## D-025 implementation state

D-025 remains authoritative.

Implemented:

- category persistence and V4→V5 non-inventive migration — I1;
- v2/schema5 backup and legacy normalization — I1;
- four-table D-018 restore — I1;
- category lifecycle service/hooks/operator management — I2;
- active-category item assignment/reassignment and reactivation enforcement — I2;
- new-order category snapshot capture — I2;
- correction snapshot preservation including legacy no-category orders — I1/I2.

Not yet implemented:

- **category order-performance aggregation/reporting UI — P9-S3-I3.**

Reporting contract remains:

- effective non-reversed `order` rows only;
- time basis `occurredAt`;
- group by stored historical `transaction.categoryId`, never current item classification;
- missing snapshot -> `Sem categoria — histórico legado`;
- minimum metrics: order count, summed quantity, gross order value;
- reversed original contributes zero and effective replacement once;
- archived categories remain reportable;
- no category allocation of payments/signals/balances/FIFO debt.

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

Known React test warnings, mocked-select DOM warnings, dependency/audit notices, lint warning debt and large-chunk warning remain visible and non-blocking only when objective commands pass.

## Accepted category validation baseline

P9-S3-I1 final gate: run `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b` with validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

P9-S3-I2 first functional run `32202062045`, job `95917767742`, correctly failed at Vitest with 199/205 passing due to pre-I2 unclassified success fixtures, ItemForm fixture setup mismatches and a Dexie transaction-zone lookup issue. The contract was not weakened.

P9-S3-I2 functional accepted run **`32202440100`**, job **`95918871077`**, merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3` — **0 errors / 81 warnings, 49/205 Vitest, 17/17 Playwright, production build PASS**.

The final documentation-complete head requires a fresh D-019 before integration.

## Boundary entering P9-S3-I3

P9-S3-I3 is reporting-only. It may implement the already-contracted D-025 order-performance aggregation and bounded operator view. It must not recategorize history, derive category debt/payment allocation, alter category persistence/backup semantics without a proven defect, start P9-S4/P9-S5/P10, or introduce backend/auth/cloud/live synchronization.