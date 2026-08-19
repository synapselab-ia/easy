# Easy V2 — P9-S4 Correction Microflow Evidence Record

**Status:** `DIRECT ANSWERS RECEIVED / BLOCKER RESOLVED`  
**Date:** 2026-08-19  
**Scope:** direct store evidence used by the bounded P9-S4 decision gate

## 1. Prior blocker

P8 directly confirmed edit/correction friction but did not enumerate exact record/action pairs. P9-S1 then proved source constraints in guided correction and explicitly prohibited representing those source findings as direct store reports.

The initial P9-S4 evidence gate was validated by D-019 `32265612927` / `96109244644` and integrated through PR #50 as `35a2e0d7495791dfda7f02e045067a85bad4aed9`; validated/integrated tree `5789c7863c0a62904b9d18692543f2b288290867`.

## 2. Current V2 support entering direct intake

Already supported under D-012/D-013:

- reseller correction on an effective transaction;
- order quantity and unit-price/total correction;
- payment/signal value correction;
- pure reversal/cancellation with mandatory reason.

Source-proven constraints entering intake:

- guided correction preserves `occurredAt`;
- guided correction preserves order `itemId`;
- guided correction preserves transaction type;
- guided correction preserves observation;
- guided replacement of an order is blocked when the original item is inactive.

## 3. Direct operator answers received

The first operator response did not identify a known recurring wrong-item, wrong-type, wrong-observation or archived-item incident from memory. For dates, the operator clarified that the practical concern was that the system presented today's date by default across routine entry/reporting contexts and was unsure whether that behavior still existed.

The operator then clarified the intended requirement directly:

> information entered into the system needs to remain editable after it enters the system, while the prior history does not necessarily need to be changed by that correction.

Canonical interpretation:

- post-save correction is directly confirmed as a product requirement;
- the requirement is broader than one isolated field and applies to operator-entered transaction business data;
- destructive in-place history rewriting is **not** required and is inconsistent with the expressed preference to preserve prior history;
- approximate frequency, current workaround and business consequence for each individual field remain unknown and must not be invented;
- the separate concern that the date field defaults to today is retained as evidence for P9-S5 occurrence-date usability verification, not as permission to change P3 date semantics during P9-S4.

## 4. Evidence disposition for the five source-proven constraints

### A — financial occurrence date after saving

**Confirmed requirement:** post-save business fields must be correctable. `occurredAt` therefore belongs in the audited replacement editor.

**Additional usability signal:** current source still defaults the creation field to today's date. Whether that default/helper is sufficiently discoverable belongs to P9-S5.

### B — order item after saving

**Confirmed requirement:** item is operator-entered order business data and must be correctable through audited replacement.

Individual incident frequency remains unknown.

### C — transaction type after saving

**Confirmed requirement:** transaction type is operator-entered business data and must be correctable through audited replacement with target-shape validation.

Individual incident frequency remains unknown.

### D — observation after saving

**Confirmed requirement:** observation is operator-entered business data and must be correctable through audited replacement.

Individual incident frequency remains unknown.

### E — correction when the original item later became inactive

The operator did not confirm a recurring archive-specific incident and was unsure whether item archival was currently part of normal operation. This therefore remains an edge/lifecycle constraint rather than a frequency-ranked store pain.

The implementation must not silently bypass P1/D-011 active-reference rules. It must test and surface this edge explicitly, and any lifecycle exception beyond the bounded D-026 contract requires its own evidence/decision.

## 5. Result

The blocker is resolved because the store directly confirmed the actual product-level need: **post-save transaction business data must be correctable without requiring destructive overwrite of prior history.**

`docs/V2/P9_CORRECTION_DECISION.md` records the bounded mapping/decision result and D-026. P9-S4 runtime remains `NOT_STARTED` until the authorized implementation slice is executed and passes D-019.
