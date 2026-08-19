# Easy V2 — P9-S4 Correction Microflow Evidence Request

**Status:** `GATE ACCEPTED / WAITING FOR DIRECT ANSWERS`  
**Date:** 2026-08-19  
**Scope:** confirm exact store correction cases before authorizing runtime work

## 1. Why this evidence is required

P8 directly confirmed that Duda encounters edit/correction friction in real operation, but the accepted evidence explicitly did **not** identify the exact record/action pairs. P9-S1 then proved several correction constraints in source, but also recorded that those constraints must not be rewritten as claims that Duda reported each one.

The P9-S4 evidence/contract gate therefore cannot select an implementation subset until the store confirms which exact cases actually occur and matter operationally.

The evidence-gate mapping was validated by D-019 `32265612927` / `96109244644` and integrated through PR #50 as `35a2e0d7495791dfda7f02e045067a85bad4aed9`; validated/integrated tree `5789c7863c0a62904b9d18692543f2b288290867`. This request is now the canonical blocker-resolution intake.

This request does not authorize destructive editing, a new schema, backend/auth/cloud/live synchronization or any P9-S5/P10 work.

## 2. What current V2 already supports

The current audited correction flow already covers:

- wrong reseller on an effective transaction;
- wrong order quantity;
- wrong order unit price / resulting total;
- wrong payment or signal amount;
- pure reversal/cancellation with mandatory reason.

These use D-012/D-013 history-preserving reversal/replacement semantics. The original transaction is not silently overwritten.

## 3. Source-proven gaps that require direct store confirmation

### A — Wrong financial occurrence date after saving

**Current constraint:** guided correction always preserves the original `occurredAt`.

Concrete operator case to confirm: a sale/payment/signal was saved with the wrong financial date — for example, a delayed sale was entered but the operator left today's date selected — and the operator later needs to correct that date.

Please confirm:

1. Does this actually happen in store operation? `SIM / NÃO`.
2. If yes, roughly how often: `raramente / mensalmente / semanalmente / quase diariamente`?
3. What is the current workaround when it happens?
4. What is the consequence if it is not corrected quickly?

### B — Wrong item selected on an order

**Current constraint:** guided correction must preserve the original `itemId`; there is no item selector in the correction dialog.

Concrete operator case to confirm: an order was saved against the wrong catalog item and needs to be replaced by the correct item while preserving audit history.

Please confirm the same four points: whether it happens, approximate frequency, current workaround and consequence.

### C — Wrong transaction type

**Current constraint:** guided replacement preserves the original type (`order`, `payment` or `signal`).

Concrete operator case to confirm: a movement was saved as the wrong type and needs to become another type.

Please confirm the same four points: whether it happens, approximate frequency, current workaround and consequence.

### D — Wrong or missing observation

**Current constraint:** guided correction preserves the original `observation`; the correction dialog does not offer an observation field.

Concrete operator case to confirm: the value/reseller/etc. is correct, but an observation was omitted or typed incorrectly and later needs correction.

Please confirm the same four points: whether it happens, approximate frequency, current workaround and consequence.

### E — Correcting an older order after its item was archived

**Current constraint:** an order whose original item is inactive may be reversed, but the guided replacement cannot recreate that order while the item remains inactive.

Concrete operator case to confirm: an older order needs a value/reseller correction after the catalog item was archived.

Please confirm the same four points: whether it happens, approximate frequency, current workaround and consequence.

## 4. Any exact correction case missing from the matrix

If the real store friction is something else, provide the exact pair in this form:

- **record:** order / payment / signal / item / reseller / other;
- **what was entered incorrectly:** ...;
- **what the operator needs to change afterward:** ...;
- **how often it happens:** ...;
- **current workaround:** ...;
- **business consequence:** ... .

Do not answer with only “editar lançamento” or “ter mais opções de edição”; P9-S4 needs the concrete incorrect field/action to preserve financial audit semantics safely.

## 5. Decision rule after evidence arrives

After direct answers are received:

1. keep already-supported cases out of new runtime work;
2. rank only directly confirmed missing cases by operational consequence/frequency;
3. select the smallest high-value subset that can remain an audited linked replacement/reversal under D-012/D-013;
4. explicitly reject any proposal that destructively rewrites historical financial rows;
5. define a bounded implementation slice, or close P9-S4 with no runtime if no missing case is confirmed.

Until those answers exist, **no P9-S4 correction implementation is authorized**.