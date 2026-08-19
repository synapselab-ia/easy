# Easy V2 — P9-S4 Correction Microflow Decision

**Status:** `ACCEPTED / FULLY IMPLEMENTED / INTEGRATED`  
**Date:** 2026-08-19  
**Scope:** bounded post-save transaction correction contract and implementation record

## 1. Direct operator evidence received

The direct operator clarification received on 2026-08-19 resolved the P9-S4 blocker.

The operator first clarified that the practical date concern was the system presenting today's date by default across routine entry/reporting contexts, and could not identify a recurring concrete case for wrong item, wrong type, wrong observation or archived-item correction from memory.

The operator then clarified the actual requirement unambiguously: **information entered into the system needs to remain editable after entry, while prior history does not need to be overwritten by that correction.**

This confirmed the post-save correction requirement while preserving the audit model. Frequency/workaround/consequence remain unquantified, so P9-S4 does not invent a frequency ranking among individual fields.

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

For an effective transaction, the guided correction flow allows the operator to define the replacement's business state, subject to normal domain validity:

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
- the implementation does not retroactively recategorize the reversed original.

### Lifecycle boundary

D-026 keeps current active-target validation for newly selected reseller/item references. An inactive/missing historical order item is not silently reused as a new target. The editor surfaces that constraint and permits another active/classified item or another target transaction type, preserving P1/D-011 rather than introducing an unproven lifecycle exception.

## 4. P9-S4-I1 implementation result

The smallest coherent subset — one full-field audited transaction correction microflow — is implemented and integrated.

Runtime implementation:

1. `CorrectionReplacementInput` / replacement validation accepts explicit target `type` and `occurredAt` for the D-026 path while preserving the earlier bounded call shape for legacy callers;
2. target order item changes are supported with current active/classified validation and D-025 snapshot rules;
3. target observation changes are supported;
4. existing reseller/value/quantity correction behavior remains supported;
5. the guided correction UI exposes reseller, target type, occurrence date, observation and conditional order/payment fields;
6. mandatory correction reason, atomic replacement+reversal and D-024 write guard remain intact;
7. affected transaction/dashboard query consumers remain invalidated after success;
8. target-shape validation prevents payment/signal replacements from carrying order fields;
9. inactive newly selected items are rejected and the whole operation rolls back atomically;
10. no schema/Dexie migration or backup-envelope change was needed.

Focused tests prove occurrence-date, item, type, observation, category snapshot preservation/change, original immutability, reversal linkage, invalid-target rejection and D-024 enforcement.

## 5. Explicit non-goals preserved

P9-S4-I1 did not introduce:

- destructive in-place mutation of historical financial rows;
- editing transaction IDs, `createdAt`, reversal timestamps or correction linkage;
- weakening P1 lifecycle rules merely to support inactive entities;
- schema/Dexie migration or backup-envelope changes;
- P9-S5 occurrence-date usability changes;
- P10, backend, auth, cloud database or live synchronization.

## 6. Decision acceptance proof

- D-019 run `32277770945`, job `96149101495`, merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13` — 0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- The validated decision merge ref combined head `50cdab7bfc60d31bd3525ed0d4b66d0c3f8d7070` with base `1221f71de460c266c165b92de0536f443c71fa08`.
- PR #52 was squash-integrated into `develop` as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.
- Validated decision merge ref and integrated squash share tree `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

## 7. Runtime implementation validation and integration

- D-019 run **`32285620846`**, job **`96174326588`**, merge ref **`4b51a5f35c2104d636903ce89eecbc995a0f3ce3`**.
- The validated implementation merge ref combined head `a4f0b026e14fc85bd02eee56db262b5271507b3c` with base `0f3ec562717c75981802f330d64410ee612a034d`.
- Gate result: **0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #54 was squash-integrated into `develop` as **`f1cfd126c18691da1256a1d3f918158d7aa9495a`**.
- Validated implementation merge ref and integrated squash share exact tree **`5679693b5f588f58404050cfca8ffd17a9a49fb3`**.

## 8. Closure and next boundary

P9-S4 is `DONE / INTEGRATED`. The D-026 contract is fully implemented within its authorized scope.

The next canonical work is P9-S5 occurrence-date usability verification only. The existing observation that entry defaults `Data da ocorrência` to today remains a usability signal, not permission to change D-014/P3 financial-date semantics.
