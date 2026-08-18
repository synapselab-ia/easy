# Easy V2 — P9-S3 Category Data/Reporting Contract

**Status:** `ACCEPTED / I1 IMPLEMENTED / P9-S3 IN_PROGRESS`  
**Date:** 2026-08-18  
**Decision:** D-025  
**Scope:** category lifecycle, assignment, historical semantics, reporting, migration and D-017/D-018 compatibility

## 1. Evidence and contract boundary

Direct store evidence accepted in P8-S2 establishes these category requirements:

- operators need to create/manage item categories;
- each item should be classifiable into a category such as bronze or porcelain;
- reporting/analysis should be available separately by category.

D-025 translates only those needs into persistence/history/reporting semantics. It does not reopen D-016 and does not authorize P9-S4/P9-S5/P10, inventory, category debt allocation, backend/auth/cloud/live synchronization or historical classification inference.

P9-S3 is intentionally implemented in bounded slices. The persistence/recovery substrate in P9-S3-I1 is now implemented; operational lifecycle/assignment/order enforcement and reporting remain separate work.

## 2. Category identity and lifecycle

Persistent category entity:

```text
Category
- id: stable positive integer identity
- name: required business label
- isActive: reversible lifecycle state
- createdAt
- updatedAt
```

Accepted identity rules:

1. `id` is stable category identity. Rename does not create a new identity.
2. Names are trimmed, non-empty and unique after case-insensitive normalization across both active and inactive categories.
3. Normal removal is reversible archive/reactivation.
4. A category may be archived only when no **active item** references it.
5. Inactive/historical items may retain an archived category.
6. Permanent deletion is allowed only when neither any item row nor any historical order category snapshot references the category.
7. Rename preserves identity. Historical transaction `categoryName` snapshots remain immutable; analytical grouping uses stable `categoryId`.

Persistence for this entity exists after I1. Lifecycle mutations/operator UI are deferred to I2.

## 3. Item assignment and reassignment

`Item` now has optional persisted:

```text
categoryId?: number
```

Accepted rules:

1. Existing Dexie V4 items migrate without an invented category; `categoryId` remains absent.
2. New assignment/reassignment may target only an existing active category.
3. Reassignment affects **future orders only** and never rewrites historical transaction snapshots.
4. The operator workflow must require an active category when creating a new active item or reactivating an item for new business use.
5. A migrated legacy active item may remain temporarily unclassified so migration is non-destructive, but it must be classified before participating in a new order after I2 enforcement.
6. An inactive item may retain an archived-category reference.
7. P1 item hard-delete history protection remains authoritative.

I1 implements only the optional persistence/backup/restore field. Assignment/reassignment workflow and enforcement remain I2.

## 4. Historical order/category snapshot semantics

Transactions now support optional historical category snapshot fields:

```text
categoryId?: number
categoryName?: string
```

Accepted semantics:

1. A category-aware new order resolves the selected active item and its active category inside the validated write boundary.
2. It stores both stable `categoryId` and the category `name` at transaction time alongside the item snapshot.
3. `categoryId` is analytical identity; `categoryName` is immutable audit/display snapshot.
4. Later item reassignment never alters old order snapshots.
5. Later category rename never alters stored historical `categoryName`.
6. Existing V4 orders receive **no synthetic category snapshot**.
7. Orders without a historical snapshot remain valid and report as **`Sem categoria — histórico legado`**.
8. Payment/signal transactions never receive category fields.
9. Guided replacement correction preserves original `itemId`, `itemName`, `categoryId`, `categoryName` and `occurredAt`.
10. Pure reversal keeps the original snapshot but contributes zero analytical/financial effect under P2.

I1 implements storage, validation, backup/restore and correction preservation of already-present/imported snapshots. **Normal new-order creation still does not generate category snapshots in I1.** Snapshot capture/enforcement belongs to I2.

## 5. Category-level reporting semantics

Minimum accepted category analysis is **order-performance reporting**, not category debt allocation.

For a selected period or all-time view:

- source: effective (`!reversal`) rows where `type === 'order'`;
- time basis: `transactionOccurredAt()` / `occurredAt`;
- grouping: historical transaction `categoryId`;
- legacy grouping: missing snapshot -> `Sem categoria — histórico legado`;
- minimum measures: order count, summed quantity and gross order value (`sum(totalPrice)`);
- linked correction: reversed original contributes zero, effective replacement once;
- archived categories remain reportable.

Category reporting must **not**:

- group old orders by current item category;
- retroactively recategorize history;
- allocate payments/signals, balances, open debt or FIFO debt lots to categories;
- infer profitability/margin without cost data;
- invent persistent per-order settlement links.

When the category still exists after rename, reports group by stable `categoryId` and may use the current category name as group label; transaction `categoryName` remains available for audit/detail.

Reporting is deliberately not implemented in I1 or I2.

## 6. Dexie V5 migration contract — IMPLEMENTED IN I1

Current persistence is Dexie **V5**:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

Implemented V4 -> V5 behavior is additive/lossless/non-inventive:

1. creates an empty `categories` table;
2. preserves existing items with absent `categoryId`;
3. preserves existing transactions with absent `categoryId`/`categoryName`;
4. creates no category from item names, observations or heuristics;
5. performs no historical category backfill;
6. preserves P1/P2/P3 IDs, fields, dates and links;
7. opens successfully without requiring operator classification.

A real Dexie V4→V5 migration test proves the behavior.

## 7. D-017 backup compatibility — IMPLEMENTED IN I1

D-017 remains authoritative and logical backup version remains **2**. Current schema5 exports are:

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

Implemented compatibility requirements:

1. Schema5 exports include `categories[]` and present references/snapshots.
2. Supported legacy v1 backups remain accepted.
3. Existing v2/schemaVersion 4 backups remain accepted.
4. v1 and v2/schema4 normalize in memory to V5 with `categories = []` and absent category fields; no classification is fabricated.
5. Schema5 validation enforces unique positive category IDs, accepted normalized-name uniqueness and valid category references.
6. Order snapshot `categoryId` and `categoryName` must appear together; historical snapshot name need not equal the current category name.
7. Payment/signal category fields are invalid.
8. Active item -> inactive category is invalid; inactive item -> archived category is valid.
9. Legacy orders with no snapshot remain valid.
10. Backup preview surfaces categories, unclassified items and legacy orders without category snapshot.
11. Linked order correction validation rejects category-snapshot rewrites.

## 8. D-018 restore extension — IMPLEMENTED IN I1

D-018 checkpoint/verified atomic restore now covers:

```text
categories + items + resellers + transactions
```

Implemented sequence:

- validated checkpoint includes all four tables;
- destructive clear/write occurs inside one Dexie `rw` transaction;
- post-write validation covers category entities/references/snapshots plus existing P1/P2/P3 invariants;
- canonical read-back comparison includes all four tables;
- any validation/write/read-back divergence rolls back the full replacement.

Targeted tests prove schema5 round-trip, v2/schema4 restore without invented categories and four-table rollback on simulated write failure.

D-024 recovery-freshness metadata remains separate local control-plane state outside D-017/D-018.

## 9. Implementation sequencing

### Contract gate — DONE

D-025 accepted this contract before runtime category implementation.

Authoritative final contract D-019: run **`32185226251`**, job **`95867186002`**, PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312` — 0 errors / 80 warnings, 44/183 Vitest, 17/17 Playwright, build PASS.

PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`; validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

### P9-S3-I1 — Category persistence + migration + backup compatibility — DONE

Implemented:

- Dexie V5 category substrate and optional category fields;
- lossless V4→V5 migration;
- `easy-backup` v2/schema5 category export/preflight with v1/v2-schema4 compatibility;
- D-018 four-table checkpoint/restore;
- backup compatibility preview;
- preservation of imported/persisted category snapshots through guided correction;
- targeted tests.

D-019 history:

- `32190349921` / `95883095871` — blocked by obsolete test expectation of final Dexie V4; only expected schema number changed.
- `32190552190` / `95883712396` — all Vitest/E2E passed; build blocked by TypeScript narrowing only; explicit typing added with no semantic change.
- functional accepted **`32191018791` / `95885134808`**, PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d` — **0 errors / 81 warnings, 47/195 Vitest, 17/17 Playwright, build PASS**.

Canonical documentation changes after that functional run require a fresh final D-019 before integration.

### P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement — NEXT

Authorized after I1 integration:

- create/rename/archive/reactivate/guarded hard-delete lifecycle;
- bounded operator category management flow;
- item assignment/reassignment to active categories;
- require active category for new active items/reactivation for business use;
- migrated unclassified active items remain readable but cannot participate in a new order until classified;
- new order resolves active item + active category and stores `categoryId + categoryName` snapshot;
- correction continues preserving original snapshot;
- targeted tests + full D-019.

Explicitly not in I2: category reporting.

### Later P9-S3 reporting slice

After I2 is accepted, category reporting may be implemented exactly according to Section 5. It must not invent category debt/payment allocation.

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

D-025 remains accepted. P9-S3-I1 is functionally validated and canonically documented on PR #45; integration eligibility depends on a final full D-019 run of the documentation-complete head against the current `develop` base.

P9-S3 as a whole remains `IN_PROGRESS`; the next canonical slice after successful I1 integration is P9-S3-I2, not reporting or later P9 phases.