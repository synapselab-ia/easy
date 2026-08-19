# Easy V2 — P9-S3 Category Data/Reporting Contract

**Status:** `ACCEPTED / I1 + I2 + I3 IMPLEMENTED AND INTEGRATED / P9-S3 DONE`  
**Date:** 2026-08-18  
**Implementation completed:** 2026-08-19  
**Decision:** D-025

## 1. Evidence boundary

P8-S2 established three direct needs: operators manage categories, classify items, and analyze order performance by category. D-025 implements only those needs. It does not reopen D-016 and does not authorize inventory, category debt allocation, backend/auth/cloud/live synchronization, or unrelated later phases.

## 2. Category identity and lifecycle — I2 DONE / INTEGRATED

Category identity is stable across rename and has reversible active/inactive lifecycle. Names remain normalized and unique. Existing references and historical order snapshots are preserved. Category writes remain subject to D-024. Operator management is bounded at `/categories`.

## 3. Item classification — I2 DONE / INTEGRATED

`Item.categoryId?` remains optional only for lossless legacy compatibility. New active items and reactivation require an active category. Reassignment affects future orders only. Migrated unclassified items remain readable/editable without invented backfill, but cannot participate in a new order until classified.

## 4. Historical order snapshots — I2 DONE / INTEGRATED

New post-I2 orders store transaction-time `categoryId + categoryName` together with the item snapshot. Later rename or reassignment never rewrites prior snapshots. Pre-I2 orders remain valid without fabricated category data. Payments/signals remain category-free. Guided replacement preserves the original category snapshot, including explicit absence for legacy orders.

## 5. Category reporting — I3 DONE / INTEGRATED

The accepted analysis is order-performance reporting only:

- source: effective non-reversed rows where `type === 'order'`;
- time basis: `transactionOccurredAt()` / `occurredAt`;
- group key: historical stored `transaction.categoryId`, never the item's current category;
- missing snapshot: `Sem categoria — histórico legado`;
- measures: order count, summed quantity and gross order value;
- linked correction: reversed original contributes zero and effective replacement contributes once;
- archived categories remain reportable;
- current category name may label an existing stable identity while immutable `transaction.categoryName` remains historical evidence;
- read-only `/category-report` supports all-time or inclusive occurrence-period filtering.

Reporting does not allocate payments, signals, balances, open debt or FIFO debt to categories; it does not recategorize legacy history or infer profitability without cost data.

## 6. Persistence and recovery — I1 DONE / INTEGRATED

Dexie V5 remains additive/non-inventive with `categories`, optional item category references and optional transaction category snapshots. Logical backup remains `easy-backup` v2/schema5 with legacy compatibility. D-018 continues verified atomic recovery across categories, items, resellers and transactions. I2/I3 do not change those contracts.

## 7. Implementation proof

- Contract gate: D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.
- I1: final D-019 `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.
- I2: final D-019 `32202876262`, job `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.
- I3 functional: D-019 `32261923163`, job `96096954271` — PASS.
- I3 final documentation-complete: D-019 **`32262877105`**, job **`96100129962`**, merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, head `b7e76e56c8049a002243fc693891880ba6bf0a50` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9` — **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #48 integrated as **`08ad2973f387035301901f9f46b0c78039796c2d`**.
- Validated merge ref and integrated squash share exact tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

## 8. Final acceptance and next boundary

D-025 is accepted, fully implemented and integrated. P9-S3 is `DONE`.

P9-S4 may now enter only its evidence/contract gate: map already-accepted store correction friction to concrete unsupported operator cases, distinguish what P2 audited reversal/replacement already covers, and define the smallest confirmed high-value subset before any new correction runtime is authorized. P9-S5/P10 and backend/auth/cloud/live-sync remain outside this boundary.
