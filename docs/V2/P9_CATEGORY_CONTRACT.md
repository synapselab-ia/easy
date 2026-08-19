# Easy V2 — P9-S3 Category Data/Reporting Contract

**Status:** `ACCEPTED / I1 + I2 IMPLEMENTED / P9-S3 IN_PROGRESS`  
**Date:** 2026-08-18  
**Decision:** D-025  
**Scope:** category lifecycle, assignment, historical semantics, reporting, migration and D-017/D-018 compatibility

## 1. Evidence and contract boundary

Direct store evidence accepted in P8-S2 establishes these category requirements:

- operators need to create/manage item categories;
- each item should be classifiable into a category such as bronze or porcelain;
- reporting/analysis should be available separately by category.

D-025 translates only those needs into persistence/history/reporting semantics. It does not reopen D-016 and does not authorize P9-S4/P9-S5/P10, inventory, category debt allocation, backend/auth/cloud/live synchronization or historical classification inference.

P9-S3 is implemented in bounded slices. I1 implemented persistence/recovery compatibility. I2 now implements lifecycle, assignment and new-order snapshot enforcement. Reporting remains the final currently defined slice, I3.

## 2. Category identity and lifecycle — IMPLEMENTED IN I2

Persistent category entity:

```text
Category
- id: stable positive integer identity
- name: required business label
- isActive: reversible lifecycle state
- createdAt
- updatedAt
```

Accepted and implemented identity rules:

1. `id` is stable category identity. Rename does not create a new identity.
2. Names are trimmed, non-empty and unique after case-insensitive normalization across active and inactive categories.
3. Normal removal is reversible archive/reactivation.
4. A category may be archived only when no active item references it.
5. Inactive/historical items may retain an archived category.
6. Permanent deletion is allowed only when neither any item row nor any historical order category snapshot references the category.
7. Rename preserves identity. Historical transaction `categoryName` snapshots remain immutable; analytical grouping uses stable `categoryId`.

I2 exposes these operations through a bounded `/categories` operator flow. All category mutations remain subject to D-024 freshness enforcement.

## 3. Item assignment and reassignment — IMPLEMENTED IN I2

`Item` has optional persisted:

```text
categoryId?: number
```

Implemented rules:

1. Existing Dexie V4 items remain without invented category after migration.
2. New assignment/reassignment may target only an existing active category.
3. Reassignment affects future orders only and never rewrites historical transaction snapshots.
4. New active item creation requires an active category.
5. Reactivation for business use requires an active category.
6. A migrated legacy active item may remain unclassified and editable so migration is non-destructive, but cannot participate in a new order until classified.
7. An inactive item may retain an archived-category reference.
8. P1 item hard-delete history protection remains authoritative.

## 4. Historical order/category snapshot semantics — IMPLEMENTED IN I2

Transactions support optional historical category snapshot fields:

```text
categoryId?: number
categoryName?: string
```

Implemented semantics:

1. A new category-aware order resolves the selected active item and its active category inside the validated Dexie write transaction.
2. It stores stable `categoryId` plus the category `name` at transaction time alongside the canonical item snapshot.
3. `categoryId` is analytical identity; `categoryName` is immutable audit/display snapshot.
4. Later item reassignment never alters old order snapshots.
5. Later category rename never alters stored historical `categoryName`.
6. Existing V4/pre-I2 orders receive no synthetic category snapshot.
7. Orders without historical snapshot remain valid and will report as `Sem categoria — histórico legado`.
8. Payment/signal transactions never receive category fields.
9. Guided replacement correction preserves original `itemId`, `itemName`, `categoryId`, `categoryName` and `occurredAt`.
10. A guided replacement of a legacy no-category order remains no-category rather than being reclassified from the item's current category.
11. Pure reversal keeps the original snapshot but contributes zero analytical/financial effect under P2.

## 5. Category-level reporting semantics — NOT YET IMPLEMENTED

Minimum accepted category analysis is **order-performance reporting**, not category debt allocation.

For a selected period or all-time view:

- source: effective (`!reversal`) rows where `type === 'order'`;
- time basis: `transactionOccurredAt()` / `occurredAt`;
- grouping: historical transaction `categoryId`;
- legacy grouping: missing snapshot -> `Sem categoria — histórico legado`;
- minimum measures: order count, summed quantity and gross order value (`sum(totalPrice)`);
- linked correction: reversed original contributes zero, effective replacement once;
- archived categories remain reportable.

Category reporting must not:

- group old orders by current item category;
- retroactively recategorize history;
- allocate payments/signals, balances, open debt or FIFO debt lots to categories;
- infer profitability/margin without cost data;
- invent persistent per-order settlement links.

When the category still exists after rename, reports group by stable `categoryId` and may use the current category name as group label; transaction `categoryName` remains available for audit/detail.

This reporting contract is the scope of P9-S3-I3.

## 6. Dexie V5 migration contract — IMPLEMENTED IN I1

Current persistence is Dexie V5:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

V4 -> V5 is additive/lossless/non-inventive: it creates an empty category table, preserves existing item/order rows with absent category fields, performs no heuristic/backfill and preserves P1/P2/P3 fields, IDs, dates and links.

## 7. D-017 backup compatibility — IMPLEMENTED IN I1

Logical backup remains `easy-backup` version 2. Current schema5 exports include `data.categories[]` and optional item/order category fields. Supported v1 and v2/schema4 backups remain accepted through in-memory normalization to empty categories/absent category fields without fabricated history.

Schema5 preflight enforces category IDs, normalized-name uniqueness, references/lifecycle, paired order snapshots, payment/signal category exclusion and linked-correction snapshot preservation. Backup preview surfaces category count, unclassified-item count and legacy-order count.

I2 changes no backup format/schema contract.

## 8. D-018 restore extension — IMPLEMENTED IN I1

D-018 checkpoint/verified atomic restore covers:

```text
categories + items + resellers + transactions
```

Validated checkpoint, destructive clear/write, post-write validation and canonical read-back comparison all occur under the accepted four-table atomic boundary. Divergence rolls back the full replacement. D-024 recovery-health metadata remains outside D-017/D-018.

I2 changes no restore contract.

## 9. Implementation sequencing

### Contract gate — DONE

Authoritative final contract D-019: `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

### P9-S3-I1 — Category persistence + migration + backup compatibility — DONE

Final documentation-complete D-019: `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`, validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

### P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement — DONE pending final documentation-head gate/integration

Implemented lifecycle, bounded operator management, active-category item classification/reclassification, new/reactivated-item enforcement, legacy unclassified compatibility, new-order transaction-time category snapshots and correction snapshot preservation.

Gate history:

- `32202062045` / `95917767742` — FAIL with 199/205 Vitest passing; stale unclassified success fixtures, ItemForm fixture setup and Dexie transaction-zone lookup were corrected without relaxing D-025.
- Functional accepted **`32202440100` / `95918871077`**, PR #46 merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`, head `554e68d64ff9c67c455ff97116736472c5807ec1` over base `d55b13bf5efedb12da937e70afe1e9501d83446b` — **0 errors / 81 warnings, 49/205 Vitest, 17/17 Playwright, build PASS**.

The documentation-complete head requires a fresh D-019 before integration.

### P9-S3-I3 — Category order-performance reporting — NEXT

Authorized only after I2 integration:

- effective non-reversed order rows only;
- `occurredAt` time basis;
- historical `transaction.categoryId` grouping;
- explicit `Sem categoria — histórico legado` bucket;
- order count, quantity and gross value minimum metrics;
- linked correction counts only effective replacement;
- archived categories remain reportable;
- bounded reporting domain/UI and targeted tests.

Explicitly not in I3: payment/signal/balance/FIFO category allocation, backfill/recategorization, profitability without costs, P9-S4/P9-S5/P10 or cloud/backend work.

## 10. Explicit exclusions

This contract/implementation sequence introduces no authorization for:

- backend/auth/cloud database/live synchronization or D-016 reopening;
- inventory/stock control;
- category-level debt/payment allocation;
- profit/margin accounting;
- historical recategorization heuristics/backfill;
- P9-S4 correction expansion;
- P9-S5 occurrence-date redesign;
- P10 beta/cutover work.

## 11. Current acceptance state

D-025 remains accepted. I1 is integrated. I2 is functionally validated and canonically documented on PR #46; integration eligibility depends on a final full D-019 run of this documentation-complete head against the current `develop` base.

P9-S3 as a whole remains `IN_PROGRESS`; after successful I2 integration the only canonical next slice is P9-S3-I3 category order-performance reporting.