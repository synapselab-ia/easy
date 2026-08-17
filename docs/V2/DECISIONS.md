# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work. Do not develop V2 in `viniciuscasarin/easy`.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, and `feature/*` contains isolated work derived from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED  
P0 does not change runtime, finance, schema or UI behavior.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED  
Canonical status comes from V2 documents, merged code and QA evidence, not `tasks/` checkbox state.

## D-005 — No full rewrite by default
**Status:** ACCEPTED  
Evolve working Easy incrementally. A rewrite requires a later evidence-backed decision.

## D-006 — Dexie/IndexedDB remains baseline until P4
**Status:** ACCEPTED  
Do not introduce backend, Supabase or authentication before P4 decides local vs cloud.

## D-007 — Preserve financial history over destructive deletion
**Status:** DIRECTION ACCEPTED  
P1 applies preservation to entity lifecycle and P2 applies it to transaction correction.

## D-008 — Centralize financial domain rules over time
**Status:** DIRECTION ACCEPTED  
Balance, effective/reversed treatment and statement totals should come from shared domain rules rather than independent screen calculations. P2-S1 starts this with shared transaction-effect rules.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED  
Resellers use `isActive`; archive/reactivate is normal behavior; inactive identities remain historical; new activity rejects missing/inactive resellers; hard delete is allowed only without transaction references.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED  
Items use `isActive`; inactive items remain traceable but unavailable for new orders; hard deletion is guarded; historical order snapshots are preserved.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED  
New transactions require an existing active reseller. Orders also require an existing active item and derive `itemName` from that identity. Payment/signal do not carry item references. Historical rows are not destructively repaired. P1 schema remains V3.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
P2-S1 defines pure reversal/cancellation:

- preserve the original transaction row and business fields;
- persist `reversal.reason` and ISO `reversal.reversedAt`;
- reason is mandatory and a transaction can be reversed only once;
- reversed rows remain visible but have zero financial effect;
- reseller history/PDF expose reversal status and reason;
- shared effect is order `+value`, payment/signal `-value`, reversed `0`;
- `createdAt` is not reinterpreted; P3 owns financial-date semantics;
- no Dexie V4 is required because reversal metadata is optional/non-indexed.

Pure cancellation covers duplicate payment and old-order reversal. Replacement correction is defined by D-013.

## D-013 — Replacement correction is atomic, bidirectionally linked and actor-neutral until P4
**Status:** ACCEPTED  
**Date:** 2026-08-17

P2-S2 defines the correction primitive for wrong-value and wrong-reseller cases.

### Atomic linked replacement

A linked correction must validate the original, mandatory reason and intended replacement, then create the replacement and reverse the original in **one Dexie write transaction**. Failure leaves the original effective and creates no partial replacement.

Linkage is stored in both directions:

```text
original.reversal.replacementTransactionId -> replacement.id
replacement.correction.replacesTransactionId -> original.id
```

Both records remain independently inspectable. No Dexie V4 is required because these fields are optional/non-indexed.

### Guided correction boundary

- replacement type remains the original type;
- replacement may target another active reseller;
- payment/signal amount may change;
- order quantity/unit price may change and total is recomputed as quantity × unit price;
- order item identity and original observation are preserved;
- P1 active reseller/item validation still applies;
- an unavailable historical item may be purely reversed, but is not silently recreated through the guided flow;
- normal transaction creation strips caller-supplied `reversal`/`correction` metadata, so audit links can only be produced by approved correction mutations.

The shared P2-S1 financial rule remains sufficient: reversed original contributes `0`; effective replacement contributes normally.

### Future actor attribution

P2 closes without fabricating a user identity before P4. Future correction metadata may add an optional opaque `actorRef` that is provider-neutral:

- local/single-user outcome: it may resolve to a stable local operator/installation identity;
- authenticated multi-user outcome: it may resolve to the stable application-user identifier;
- display names are resolved separately;
- existing audit records without `actorRef` stay valid;
- no actor is recorded until P4 provides a trustworthy identity source.

### Phase consequence

P2 required cases are now covered: duplicate payment/cancellation and old-order reversal by P2-S1; wrong value and wrong reseller by P2-S2. P2 can close.

---

# Open decisions

- `occurredAt` vs registration date and backward migration (P3-S1);
- opening/closing statement semantics and debt-aging model (P3-S2);
- local vs cloud architecture and concrete actor identity source (P4);
- backup version/migration strategy (P5);
- preview/deployment and global QA gating (P6);
- new modules after real requirements discovery (P8/P9).
