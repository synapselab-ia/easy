# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Candidates and open questions remain in `BACKLOG.md` or `STATUS.md` until resolved.

---

## D-001 — V2 laboratory repository

**Status:** ACCEPTED  
**Date:** 2026-08-17

Use `synapselab-ia/easy` as the V2 working repository. The original `viniciuscasarin/easy` is not the V2 experimentation target.

---

## D-002 — Branch roles

**Status:** ACCEPTED  
**Date:** 2026-08-17

- `main` = stable copied baseline/reference;
- `develop` = V2 integration branch;
- `feature/*` = isolated units of work derived from `develop`.

---

## D-003 — P0 changes documentation/governance only

**Status:** ACCEPTED  
**Date:** 2026-08-17

P0 must not change Easy runtime behavior, financial logic, database schema or UI behavior.

---

## D-004 — Legacy task checkboxes are historical, not canonical

**Status:** ACCEPTED  
**Date:** 2026-08-17

The existing `tasks/` directory is historical evidence only. Canonical V2 status comes from V2 documents, merged code and QA evidence.

---

## D-005 — No full rewrite by default

**Status:** ACCEPTED  
**Date:** 2026-08-17

Preserve working parts of Easy and evolve incrementally. A full rewrite requires a later explicit decision supported by evidence.

---

## D-006 — Current persistence remains baseline until P4

**Status:** ACCEPTED  
**Date:** 2026-08-17

Dexie/IndexedDB remains the current architecture through early integrity/financial phases. Do not introduce Supabase, backend or authentication before P4 decides local vs cloud.

---

## D-007 — Financial history should favor preservation over destructive deletion

**Status:** DIRECTION ACCEPTED  
**Date:** 2026-08-17

V2 prefers historical preservation for entities and financial entries. P1 applies this to reseller/item lifecycle; P2 applies it to transaction correction.

---

## D-008 — Runtime source of truth must be centralized over time

**Status:** DIRECTION ACCEPTED; implementation progressing by phase  
**Date:** 2026-08-17

Financial semantics such as balance, valid/reversed transaction treatment and statement totals should come from shared domain rules rather than independent screen calculations.

P2-S1 begins this centralization with shared effective/reversed transaction rules.

---

## D-009 — Reseller lifecycle is reversible archive, with guarded hard deletion

**Status:** ACCEPTED  
**Date:** 2026-08-17

For P1-S1, reseller lifecycle uses `isActive`, archive/reactivate is normal behavior, historical identity is retained, inactive/missing resellers are rejected for new activity, and physical deletion is allowed only without transaction references.

---

## D-010 — Item lifecycle is reversible archive, with preserved order snapshots and guarded hard deletion

**Status:** ACCEPTED  
**Date:** 2026-08-17

For P1-S2, item lifecycle uses `isActive`, archive/reactivate is normal behavior, inactive items remain traceable but unavailable for new orders, hard deletion is guarded, and historical transaction snapshots are preserved.

---

## D-011 — New transaction references are strict; historical records are preserved

**Status:** ACCEPTED  
**Date:** 2026-08-17

For new transaction creation:

- reseller reference must be positive/existing/active;
- orders require a positive/existing/active item and derive the item-name snapshot from that identity;
- payment/signal movements do not accept item references.

Historical rows/migrations are preserved without destructive reference repair. P1 schema remains V3.

---

## D-012 — Financial correction uses audited reversal, not destructive deletion

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

P2-S1 establishes reversal as the first approved V2 financial-correction primitive.

For an existing transaction:

- correction preserves the original transaction row and original business fields;
- reversal metadata is stored in optional `transaction.reversal`;
- `reversal.reason` is mandatory and non-empty;
- `reversal.reversedAt` records the correction timestamp as an ISO string;
- a transaction can be reversed only once;
- a reversed transaction remains visible/auditable but has zero financial effect;
- the old physical transaction-delete hook is no longer the normal correction mechanism.

### Shared financial rule

The P2-S1 domain rule is:

```text
effective order           -> +totalPrice
effective payment/signal  -> -totalPrice
reversed transaction      -> 0
```

That rule must be used consistently by reseller balances, dashboard metrics, search balances and other financial consumers as they are brought into P2.

### Audit visibility

- reseller history shows `Válido`/`Estornado` status;
- reversal reason and timestamp remain visible;
- PDF statements keep the original row and expose reversal status/reason;
- reversing does not alter the transaction `createdAt`, because occurrence/registration semantics belong to P3.

### Persistence rationale

No Dexie V4 is introduced for P2-S1 because `reversal` is optional and non-indexed. The ISO timestamp is JSON-safe under the current backup serialization, avoiding unrelated P5 restore-hardening work.

### Actor attribution boundary

P2-S1 does not invent a user identity because Easy currently has no authenticated actor model and P4 has not decided local vs cloud/multi-user architecture. P2-S2 must document a future-ready attribution strategy while avoiding premature authentication/backend implementation.

### Scope boundary

P2-S1 does not yet link a reversed original to a replacement transaction. Wrong-value and wrong-reseller guided replacement/linkage belongs to P2-S2. P3 date/statement semantics, P5 backup validation and P6 global QA remain separate.

---

# Open decisions

These are intentionally **not decided yet**:

- exact original/replacement linkage and guided correction model (P2-S2);
- future actor-attribution strategy compatible with P4 (P2-S2/P4 boundary);
- `occurredAt` and statement semantics (P3);
- local vs cloud architecture (P4);
- backup migration/version strategy details (P5);
- preview/deployment architecture and global QA gating (P6);
- inventory, richer orders, users and other new modules (P8/P9).
