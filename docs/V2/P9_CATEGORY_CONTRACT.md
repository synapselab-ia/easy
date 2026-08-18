# Easy V2 — P9-S3 Category Data/Reporting Contract

**Status:** `PROPOSED / IN_REVIEW`  
**Date:** 2026-08-18  
**Scope:** category lifecycle, assignment, historical semantics, reporting, migration and D-017 compatibility only; no runtime/schema/UI/reporting implementation in this slice

## 1. Evidence and current-state boundary

Direct store evidence accepted in P8-S2 establishes only these category requirements:

- operators need to create/manage item categories;
- each item should be classifiable into a category such as bronze or porcelain;
- reporting/analysis should be available separately by category.

The current implementation has no category dimension:

- Dexie V4 has only `items`, `resellers` and `transactions`;
- `Item` stores `id`, `name`, `basePrice`, lifecycle timestamps and `isActive`;
- order transactions preserve `itemId` and `itemName` plus quantity/price, but no category snapshot;
- current dashboard reporting is reseller/debt/order oriented and has no category aggregation;
- canonical `easy-backup` v2 currently declares `source.schemaVersion = 4` and serializes no category data.

This contract must therefore define category semantics before persistence or UI changes. It does not reopen D-016 and does not authorize P9-S4/P9-S5/P10 work.

## 2. Category identity and lifecycle

The target persistent category entity is:

```text
Category
- id: stable positive integer identity
- name: required business label
- isActive: reversible lifecycle state
- createdAt
- updatedAt
```

Accepted identity rules:

1. `id` is the stable category identity. Renaming a category does not create a new identity.
2. Category names are trimmed, non-empty and unique after case-insensitive normalization across both active and inactive categories. Archiving must not make the same logical name available for reuse under a second identity.
3. Normal category removal is reversible archive/reactivation, following the P1 lifecycle direction rather than destructive history loss.
4. A category may be archived only when no **active item** currently references it. This prevents an operator from silently making active catalog items unusable through a category lifecycle action.
5. Inactive/historical items may continue to reference an archived category.
6. Permanent deletion is allowed only when the category is referenced by neither any item row nor any historical order category snapshot.
7. Category rename preserves identity. Historical order snapshots keep the label recorded at transaction time for audit, while analytical grouping uses the stable category identity.

## 3. Item assignment and reassignment

The target item model gains an optional persisted `categoryId` reference during migration/legacy compatibility.

Accepted assignment rules:

1. Existing Dexie V4 items migrate without an invented category: `categoryId` remains absent until the operator classifies the item.
2. New category assignments/reassignments may target only an existing active category.
3. Reassigning an item changes its category for **future orders only**. It must not rewrite historical transaction snapshots.
4. The final operator workflow must require an active category when creating a new active item or reactivating an item for new business use.
5. A migrated legacy active item may temporarily remain unclassified so migration itself is non-destructive; however, before that item can participate in a **new order**, it must be assigned to an active category.
6. An inactive item may retain a reference to an archived category for historical/catalog continuity.
7. Item hard-delete safety from P1 remains unchanged: an item with order history cannot be physically deleted.

This staged rule allows a lossless migration while ensuring category reporting becomes complete for all orders created after category rollout.

## 4. Historical order/category snapshot semantics

Future order transactions gain historical category snapshot fields:

```text
categoryId?: number
categoryName?: string
```

Accepted semantics:

1. On a new order, Easy resolves the selected active item and its active category inside the validated write boundary.
2. The order stores both the stable `categoryId` and the category `name` that existed at the time the order was recorded, alongside the existing item snapshot.
3. `categoryId` is the analytical identity; `categoryName` is an immutable audit/display snapshot for that transaction.
4. Later item reassignment does not alter old order category snapshots.
5. Later category rename does not alter the stored historical `categoryName`; the category identity remains the same through `categoryId`.
6. Existing orders migrated from Dexie V4 receive **no synthetic category snapshot**. Deriving their category from the item's current category would invent historical classification and is forbidden.
7. Orders without a historical category snapshot remain valid and are represented analytically as **`Sem categoria — histórico legado`**.
8. Payment and signal transactions never receive category fields because they are reseller-level financial movements, not item/category movements.
9. Guided replacement correction of an order preserves the original order's `itemId`, `itemName`, `categoryId`, `categoryName` and `occurredAt`. Recalculating the replacement against the item's current category would incorrectly rewrite the original economic event.
10. Pure reversal keeps the original snapshot but gives the reversed row zero analytical/financial effect under P2.

## 5. Category-level reporting semantics

The minimum accepted category analysis is **order-performance reporting**, not category debt allocation.

For a selected period or all-time view:

- source rows: effective (`!reversal`) transactions where `type === 'order'`;
- time basis: `transactionOccurredAt()` / `occurredAt`, preserving P3 semantics;
- grouping key: historical transaction `categoryId`;
- legacy grouping: missing category snapshot -> `Sem categoria — histórico legado`;
- minimum measures: order count, summed item quantity and gross order value (`sum(totalPrice)`);
- linked correction: original reversed row contributes zero; effective replacement contributes once;
- archived categories remain reportable because lifecycle does not destroy history.

Category reporting must **not**:

- group historical orders by the item's current `categoryId`;
- retroactively recategorize old orders after item reassignment;
- allocate reseller payments/signals, balances, open debt or FIFO debt lots to categories;
- infer category profitability/margin because cost data does not exist;
- invent per-order settlement links that P3 deliberately does not persist.

Reason: payments/signals are currently reseller-level and FIFO debt is derived at reseller level. Any category-debt allocation would require a new explicit allocation contract and is outside P9-S3.

### Report labels after category rename

Analytical grouping remains by stable `categoryId`. When the category entity still exists (the normal case), the current category name is the group label so one identity is not split across historical renames. The transaction `categoryName` snapshot remains available for audit/detail display. Legacy no-category rows remain in their explicit legacy bucket.

## 6. Dexie migration contract

The target persistence migration is **Dexie V5**, but no V5 code is created in this contract slice.

Target schema direction:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

Migration V4 -> V5 must be lossless and non-inventive:

1. create an empty `categories` table;
2. preserve every existing item unchanged except for the optional absence of `categoryId`;
3. preserve every existing transaction unchanged except for the optional absence of `categoryId`/`categoryName`;
4. do not auto-create business categories from item names, observations or any heuristic;
5. do not backfill historical order categories from future/current item assignments;
6. preserve all P1/P2/P3 fields, IDs, timestamps and links;
7. migration completion must not itself require operator classification before the database opens.

Runtime enforcement after the relevant UI/assignment slice—not the migration itself—will require an active category before an item participates in a new order.

## 7. D-017 backup and restore compatibility

D-017 remains authoritative. Category support does **not** create `easy-backup` version 3 by default because logical backup version and Dexie schema version are already distinct.

Target new exports remain:

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

Compatibility requirements:

1. New schema-V5 exports include `categories[]` and all category references/snapshots.
2. Preflight must continue accepting supported legacy version-1 backups.
3. Preflight must continue accepting existing `easy-backup` v2 / schemaVersion 4 backups generated before categories.
4. v1 and v2/schema4 inputs normalize in memory to the V5 logical target with `categories = []` and absent category fields; no historical classification is fabricated.
5. New v2/schema5 validation requires category IDs to be unique, category names to satisfy the accepted uniqueness rule, and every present `item.categoryId`/`transaction.categoryId` to reference an existing category.
6. When an order contains category snapshot data, `categoryId` and `categoryName` must be present together. Snapshot name is not required to equal the category's current name because rename history is valid.
7. Payment/signal rows containing category fields are invalid.
8. An active item referencing an inactive category is invalid under the accepted lifecycle contract; inactive items may retain archived-category references.
9. Legacy orders with no category fields remain valid indefinitely and are not rejected merely because they predate P9-S3.
10. Backup preview should surface category counts and legacy/unclassified counts once implementation reaches the backup slice.

## 8. D-018 restore extension

D-018's atomic/checkpoint semantics are preserved and extended to the fourth business table when V5 is implemented:

- checkpoint must include categories;
- destructive replacement must clear/write `categories`, `items`, `resellers` and `transactions` inside the same verified Dexie `rw` transaction;
- post-write canonical comparison must include category entities and category references/snapshots;
- any validation/write/read-back divergence rolls back the complete replacement.

The recovery-freshness guard from D-024 remains separate control-plane metadata and stays outside the backup envelope and restore transaction.

## 9. Implementation sequencing after contract acceptance

P9-S3 must be implemented in bounded slices rather than combining schema, lifecycle UI and reporting into one change.

### P9-S3-I1 — Category persistence + migration + backup compatibility

Authorized after this contract is accepted:

- Dexie V5 `categories` table and optional category fields;
- lossless V4 -> V5 migration;
- category-aware `easy-backup` v2/schema5 export/preflight while preserving v1 and v2/schema4 import;
- D-018 checkpoint/atomic restore extension to categories;
- targeted tests plus full D-019.

Explicitly not in I1:

- category management UI;
- item-classification UI;
- new-order category enforcement/snapshot creation;
- category reporting UI.

### Later bounded slices

After I1 is accepted, later P9-S3 slices may implement category lifecycle/assignment/order snapshot enforcement and then category reporting according to this contract. Their exact `NEXT_ACTION` must be advanced canonically after each accepted slice.

## 10. Explicit exclusions

This contract introduces no authorization for:

- backend/auth/cloud database/live synchronization or D-016 reopening;
- inventory/stock control;
- category-level debt/payment allocation;
- profit/margin accounting;
- historical recategorization heuristics;
- P9-S4 correction expansion;
- P9-S5 occurrence-date redesign;
- P10 beta/cutover work.

## 11. Acceptance gate

This contract becomes canonical only after full D-019 validation and integration into `develop`. Until then, current runtime remains Dexie V4 and canonical `easy-backup` v2/schemaVersion 4.