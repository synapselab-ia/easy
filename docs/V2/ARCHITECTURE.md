# Easy V2 — Architecture Baseline

**Status:** verified through integrated P9-S4-I1 / D-026 runtime  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

P9-S4-I1 changes no Dexie schema, migration or backup envelope.

## Category lifecycle and reporting

D-025 is fully implemented:

- stable category identity and reversible lifecycle;
- active-category item assignment;
- immutable new-order `categoryId + categoryName` snapshots;
- lossless legacy unclassified rows;
- read-only effective-order category reporting at `/category-report` using `occurredAt` and transaction-time category identity.

Reporting never allocates payments/signals/balance/FIFO debt to categories.

## D-026 correction architecture — implemented/integrated

P2 / D-012 / D-013 still provide the audit topology: the original row is not destructively rewritten, correction requires a reason, and replacement creation plus original reversal/linkage occur atomically.

P9-S4-I1 expands the replacement business state:

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
original business row remains immutable + replacement becomes effective
```

The full correction editor now exposes that complete target state. The hook keeps the older bounded replacement call shape compatible, while explicit `type`/`occurredAt` selects the D-026 full-field path used by the UI.

### Target-shape rules

- target `order` requires a valid item, positive integer quantity and valid unit price; total is derived from quantity × unit price;
- target `payment`/`signal` carries no item/quantity/unit-price/category fields and requires positive movement value;
- changing type affects only the replacement;
- `createdAt`, IDs, correction links and reversal metadata remain system/audit state, not editable business data.

### D-025 interaction

- same order item: preserve original `itemName`, `categoryId`, `categoryName` snapshot even if the catalog item was later renamed/reclassified;
- changed/new order item: require current active/classified target and capture its current item/category snapshot;
- order → non-order: remove order/category fields from the replacement only;
- never recategorize or rewrite the reversed original.

### Lifecycle boundary

D-026 does not weaken P1/D-011. Newly selected references remain subject to current active-reference rules. An inactive/missing historical order item cannot be reused as a new target; the editor surfaces that constraint and permits selecting another active/classified item or another target transaction type. No speculative lifecycle exception was introduced.

### Query/recovery behavior

Affected transaction/dashboard query consumers are invalidated after successful replacement. D-024 remains in front of the write, so stale/missing recovery readiness blocks correction before mutation.

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

## P9-S4-I1 validation/integration proof

- D-019 run `32285620846`, job `96174326588`, validated PR merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3` — 0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- Validated head `a4f0b026e14fc85bd02eee56db262b5271507b3c` over base `0f3ec562717c75981802f330d64410ee612a034d`.
- PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`.
- Validated merge ref and integrated squash share exact tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## Boundary entering P9-S5

The creation form currently initializes `Data da ocorrência` to today's local date. Direct operator evidence specifically recalled that behavior as the remaining date-usability signal. P9-S5 must verify discoverability/editability and persistence semantics without introducing another date model or changing D-014/P3 financial-date semantics.
