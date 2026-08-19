# Easy V2 — P9-S4 Correction Microflow Decision

**Status:** `ACCEPTED / INTEGRATED — implementation NOT_STARTED`  
**Date:** 2026-08-19  
**Scope:** bounded post-save transaction correction contract only

## 1. Direct operator evidence received

The direct operator clarification received on 2026-08-19 resolves the P9-S4 blocker.

The operator first clarified that the practical date concern was the system presenting today's date by default across routine entry/reporting contexts, and could not identify a recurring concrete case for wrong item, wrong type, wrong observation or archived-item correction from memory.

The operator then clarified the actual requirement unambiguously: **information entered into the system needs to remain editable after entry, while prior history does not need to be overwritten by that correction.**

This is sufficient to confirm the post-save correction requirement while preserving the audit model. Frequency/workaround/consequence remain unquantified, so P9-S4 does not invent a frequency ranking among individual fields.

The separate concern that the occurrence-date input defaults to today is retained as evidence for P9-S5 usability verification; it is not used to redesign P3 date semantics here.

## 2. Existing behavior retained

P2 / D-012 / D-013 remain authoritative:

- the original financial row is never silently overwritten;
- a correction requires an explicit reason;
- correction is an atomic linked replacement plus reversal of the original;
- pure reversal/cancellation remains available;
- already-supported reseller/value/quantity correction is preserved.

System/audit metadata is not an operator-editable business field: transaction ID, `createdAt`, correction links, `reversal.reversedAt` and reversal linkage remain generated/immutable audit state.

## 3. D-026 accepted contract

**D-026 — Effective transaction business fields are correctable through audited linked replacement, not destructive historical editing.**

For an effective transaction, the guided correction flow must allow the operator to define the replacement's business state, subject to normal domain validity:

- reseller;
- transaction type (`order`, `payment`, `signal`);
- financial occurrence date (`occurredAt`);
- observation;
- for an order: item, quantity and unit price/derived total;
- for payment/signal: movement value.

The original transaction keeps its original values permanently. The replacement receives a new registration timestamp and links back to the original; the original receives the audited reversal link/reason.

### Type-change shape rules

- target `order` requires a valid item, positive integer quantity and valid unit price;
- target `payment`/`signal` must not carry order item/quantity/unit-price/category fields and requires a positive movement value;
- changing type changes only the replacement; the original type remains visible in history.

### Item/category snapshot rules under D-025

- if an order correction keeps the same item, preserve the original `itemName`, `categoryId` and `categoryName` snapshot; later catalog rename/reclassification must not rewrite that history;
- if the correction changes to another item, or changes a non-order into an order, the target item must satisfy the current active/classified rules and the replacement captures the target item's current item/category snapshot;
- changing an order into payment/signal removes item/category fields from the replacement only;
- the implementation must not retroactively recategorize the reversed original.

### Lifecycle boundary

The direct evidence does not establish archive-frequency or justify weakening general P1 active-reference rules. Therefore the first implementation slice must keep current active-target validation for newly selected reseller/item references. The known archived-item correction constraint remains an edge to test explicitly; if preserving the same inactive historical item cannot be supported without changing P1/D-011 semantics, that exception must remain blocked and be surfaced clearly rather than silently bypassing lifecycle rules.

This keeps the implementation bounded while satisfying the confirmed core requirement that business fields themselves are correctable post-save.

## 4. Smallest confirmed implementation subset

The smallest coherent subset is **one full-field audited transaction correction microflow**, rather than several partial dialogs. Splitting occurrence date, item, type and observation into independent slices would leave an intentionally incomplete editor despite direct evidence that post-entry business data should be correctable.

Authorized implementation slice:

### P9-S4-I1 — Full-field audited transaction replacement editor

Allowed scope:

1. extend `CorrectionReplacementInput` / replacement domain validation so the replacement may specify target `type` and `occurredAt` instead of forcibly preserving the original;
2. allow target order item change with current active/classified validation and D-025 snapshot rules;
3. allow target observation change;
4. keep reseller/value/quantity correction behavior;
5. update the guided correction UI to expose the complete replacement business state with conditional fields by target type;
6. retain mandatory correction reason, atomic replacement+reversal and D-024 write guard;
7. invalidate all affected query consumers as today;
8. add focused tests for occurrence-date, item, type, observation, category snapshot preservation/change, original immutability, reversal linkage and invalid-target rejection;
9. run full D-019 before integration.

Explicitly out of scope:

- destructive in-place mutation of historical financial rows;
- editing transaction IDs, `createdAt`, reversal timestamps or correction linkage;
- changing P1 lifecycle rules merely to support inactive entities;
- schema/Dexie migration or backup-envelope changes;
- P9-S5 occurrence-date usability changes;
- P10, backend, auth, cloud database or live synchronization.

## 5. Decision result

The prior P9-S4 evidence blocker is resolved. P9-S4 remains `IN_PROGRESS` because runtime implementation has not started.

No P9-S4 runtime is implemented by this decision slice. The next action is only P9-S4-I1 under D-026.

## 6. Accepted validation and integration

- D-019 run **`32277770945`**, job **`96149101495`**, merge ref **`6a57fbe6b8674aca8723538f756b04f4a5af3f13`** — **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- The validated merge ref combined head `50cdab7bfc60d31bd3525ed0d4b66d0c3f8d7070` with base `1221f71de460c266c165b92de0536f443c71fa08`.
- PR #52 was squash-integrated into `develop` as **`51f7ffae46432e0b82a696c1ebc07c275d733ed4`**.
- Validated merge ref and integrated squash share exact tree **`c37ea55f83b15415678f5b2be2747fb5f06c6a27`**.
- Earlier CI attempts were delayed before `qa:critical` by external Playwright system-dependency downloads; the accepted run executed the complete D-019 gate and no validation requirement was waived.
