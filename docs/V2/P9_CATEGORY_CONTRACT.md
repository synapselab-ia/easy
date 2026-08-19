# Easy V2 — P9-S3 Category Data/Reporting Contract

**Status:** `ACCEPTED / I1 + I2 INTEGRATED / I3 IMPLEMENTED + FUNCTIONALLY VALIDATED / FINAL INTEGRATION PENDING`  
**Date:** 2026-08-18  
**Implementation update:** 2026-08-19  
**Decision:** D-025  
**Scope:** category lifecycle, assignment, historical semantics, reporting, migration and D-017/D-018 compatibility

## 1. Evidence and contract boundary

Direct store evidence accepted in P8-S2 requires operators to manage item categories, classify items and analyze performance separately by category. D-025 translates only those needs into persistence/history/reporting semantics. It does not reopen D-016 and does not authorize inventory, category debt allocation, backend/auth/cloud/live synchronization or unrelated later phases.

P9-S3 is implemented in bounded slices: I1 persistence/recovery compatibility, I2 lifecycle/classification/order snapshots and I3 order-performance reporting.

## 2. Category identity and lifecycle — IMPLEMENTED / INTEGRATED IN I2

Persistent category entity has stable `id`, required `name`, reversible `isActive`, `createdAt`, `updatedAt`.

Rules:

1. Rename preserves stable ID.
2. Names are trimmed, non-empty and case-insensitively unique across active/archived identities.
3. Normal removal is archive/reactivate.
4. Archive is blocked while an active item references the category.
5. Inactive items may retain archived-category references.
6. Hard delete is allowed only when no item row and no historical order snapshot references the category.
7. Historical `transaction.categoryName` snapshots are immutable; analytical identity is stable `categoryId`.
8. Category writes remain subject to D-024.

Operator management is bounded at `/categories`.

## 3. Item assignment and reassignment — IMPLEMENTED / INTEGRATED IN I2

`Item.categoryId?` remains optional for lossless legacy compatibility.

Rules:

- new assignment/reassignment may target only an active category;
- new active item creation and reactivation require an active category;
- reassignment affects future orders only;
- migrated active legacy items may remain unclassified/readable/editable without backfill, but cannot enter a new order until classified;
- inactive items may retain archived-category references;
- P1 hard-delete history protection remains authoritative.

## 4. Historical order/category snapshots — IMPLEMENTED / INTEGRATED IN I2

Orders support optional historical `categoryId?` and `categoryName?`.

Rules:

- new orders resolve the active item's active category inside the validated Dexie write transaction;
- post-I2 orders store stable `categoryId` plus transaction-time `categoryName` alongside the canonical item snapshot;
- rename/reassignment never rewrites old order snapshots;
- pre-I2 orders receive no synthetic category snapshot and remain valid;
- payments/signals never receive category fields;
- guided replacement correction preserves original item/category snapshot and `occurredAt`, including explicit no-category legacy history;
- pure reversal preserves history but contributes zero effective financial/analytical effect.

## 5. Category-level reporting semantics — IMPLEMENTED / FUNCTIONALLY VALIDATED IN I3

Minimum accepted analysis is **order-performance reporting**, not category debt allocation.

Implemented in PR #48:

- source: effective (`!reversal`) rows where `type === 'order'`;
- time basis: `transactionOccurredAt()` / `occurredAt`;
- grouping key: historical stored `transaction.categoryId`;
- missing snapshot: **`Sem categoria — histórico legado`**;
- measures: order count, summed item quantity and gross order value (`sum(totalPrice)`);
- linked correction: reversed original contributes zero; effective replacement contributes once;
- archived categories remain reportable;
- when the stable category still exists, current category name may label the group while immutable `transaction.categoryName` remains audit/detail evidence;
- bounded read-only `/category-report` UI supports all-time or inclusive occurrence-period filtering.

Reporting does **not**:

- group old orders by current item category;
- retroactively recategorize/backfill history;
- allocate payments/signals, reseller balances, open debt or FIFO debt lots to categories;
- infer profitability/margin without cost data;
- create persistent settlement links or new write paths.

## 6. Dexie V5 migration contract — IMPLEMENTED / INTEGRATED IN I1

Current persistence:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

V4→V5 is additive/lossless/non-inventive: existing rows stay unchanged and no category backfill is fabricated.

## 7. D-017 backup compatibility — IMPLEMENTED / INTEGRATED IN I1

Logical backup remains `easy-backup` version 2. Schema5 exports include categories and optional item/order category fields. Supported v1 and v2/schema4 inputs normalize without invented category history. I2/I3 change no backup envelope or normalization contract.

## 8. D-018 restore extension — IMPLEMENTED / INTEGRATED IN I1

Validated checkpoint and verified atomic replacement cover `categories + items + resellers + transactions`; post-write validation/read-back divergence rolls back the full replacement. D-024 recovery-health metadata remains outside D-017/D-018. I2/I3 change no restore contract.

## 9. Implementation sequencing and proof

### Contract gate — DONE

D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

### I1 — persistence/migration/backup — DONE / INTEGRATED

Final D-019 `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`, validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

### I2 — lifecycle/classification/order snapshots — DONE / INTEGRATED

Final D-019 `32202876262`, job `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`, validated/integrated tree `ddbb14dcc6f66239b5e973f7da8eabb295c2cb49`; canonical closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

### I3 — category order-performance reporting — IN REVIEW

PR #48 is based exactly on `develop` `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

Functional D-019 **`32261923163`**, job **`96096954271`**, passed on merge ref `02d656ea771e334622a6248139b508e20a98caf1`, combining head `01fcd986ed86fbe465592af3c5600a2570380ee8` with that base:

- 0 lint errors / 81 warnings;
- 51 files / 210 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS.

Final acceptance still requires a fresh D-019 on the documentation-complete PR #48 head, integration of that exact validated head, and canonical post-merge recording of integrated commit/tree equivalence.

## 10. Explicit exclusions

No authorization is introduced for backend/auth/cloud/live sync or D-016 reopening, inventory, category-level debt/payment allocation, profit/margin accounting, historical recategorization/backfill, P9-S4 expansion, P9-S5 redesign or P10 work.

## 11. Current acceptance state

D-025 remains accepted and unchanged. I1 and I2 are integrated. I3 is implemented and functionally validated but remains `IN_REVIEW` until the documentation-complete gate and integration are recorded.

The only current action is to close I3 itself; later P9 work must not start before that closure.
