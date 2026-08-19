# Easy V2 — Architecture Baseline

**Status:** verified through integrated P9-S3-I3; P9-S4 D-026 contract accepted/integrated / runtime not started  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

## Category lifecycle and reporting

D-025 is fully implemented:

- stable category identity and reversible lifecycle;
- active-category item assignment;
- immutable new-order `categoryId + categoryName` snapshots;
- lossless legacy unclassified rows;
- read-only effective-order category reporting at `/category-report` using `occurredAt` and transaction-time category identity.

Reporting never allocates payments/signals/balance/FIFO debt to categories.

## Current correction runtime entering P9-S4-I1

P2 / D-012 / D-013 currently provide audited reversal and atomic linked replacement. The current guided correction runtime can change:

- reseller;
- order quantity and unit price/total;
- payment/signal value.

It currently preserves original:

- transaction type;
- `occurredAt`;
- order item;
- observation;
- order item/category snapshot.

The current UI also blocks guided replacement when an original order item is inactive.

## D-026 correction architecture — accepted/integrated, not implemented

Direct operator evidence confirms that transaction business data must remain correctable after entry without requiring destructive overwrite of prior history.

D-026 therefore keeps the existing audit topology and expands only the replacement payload:

```text
original effective transaction
        |
        | mandatory correction reason
        v
validate replacement business state
        |
        +-- reseller
        +-- target type
        +-- occurredAt
        +-- observation
        +-- order: item + quantity + unit price
        +-- payment/signal: movement value
        |
        v
single Dexie transaction
        |
        +-- create linked replacement
        +-- reverse original with reason + replacement id
        |
        v
original remains immutable + replacement becomes effective
```

### Target-shape rules

- target `order` requires valid item, positive integer quantity and valid unit price;
- target `payment`/`signal` carries no item/quantity/unit-price/category fields and requires positive movement value;
- `createdAt`, IDs, correction links and reversal metadata remain system/audit state, not editable business data.

### D-025 interaction

- same order item: preserve original `itemName`, `categoryId`, `categoryName` snapshot;
- changed/new order item: require current active/classified target and capture its current item/category snapshot;
- order → non-order: remove order/category fields from the replacement only;
- never recategorize or rewrite the reversed original.

### Lifecycle boundary

D-026 does not weaken P1/D-011. Newly selected references remain subject to current active-reference rules. The operator did not confirm inactive-item correction as a recurring store case; implementation must surface/test that edge rather than introducing a speculative lifecycle exception.

### P9-S4-I1 authorized runtime boundary

Only the full-field audited replacement editor is authorized next. No Dexie schema change, backup-envelope change, destructive history editing, P9-S5 change, P10 work, backend/auth/cloud/live sync is part of I1.

## Recovery/interchange invariants — unchanged

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard.

## Repository-wide QA architecture

D-019 remains mandatory:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

Known React test warnings, mocked-select DOM warnings, dependency/audit notices, Actions deprecation notices, lint warning debt and Vite large-chunk warning remain non-blocking only when objective commands pass.

## D-026 decision validation/integration proof

- D-019 run `32277770945`, job `96149101495`, merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13` — 0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- Validated head `50cdab7bfc60d31bd3525ed0d4b66d0c3f8d7070` over base `1221f71de460c266c165b92de0536f443c71fa08`.
- PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.
- Validated merge ref and integrated squash share exact tree `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

## Occurrence-date usability evidence deferred to P9-S5

The creation form currently initializes `Data da ocorrência` to today's local date. Direct operator evidence specifically recalled the system presenting today's date by default in routine contexts. This is retained for P9-S5 verification; D-026 does not introduce another date model or change P3 semantics.
