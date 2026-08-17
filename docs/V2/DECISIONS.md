# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work; do not develop V2 in `viniciuscasarin/easy`.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, and `feature/*` contains isolated work derived from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED  
P0 does not change runtime, finance, schema or UI behavior.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED  
Canonical status comes from V2 documents, merged code and QA evidence.

## D-005 — No full rewrite by default
**Status:** ACCEPTED  
Evolve working Easy incrementally; rewrite requires later evidence-backed decision.

## D-006 — Dexie/IndexedDB remains baseline until P4
**Status:** ACCEPTED  
No backend, Supabase or authentication before P4 decides persistence architecture.

## D-007 — Preserve financial history over destructive deletion
**Status:** DIRECTION ACCEPTED  
P1 preserves entity history and P2 preserves financial correction history.

## D-008 — Centralize financial domain rules over time
**Status:** DIRECTION ACCEPTED  
Balance, reversal, statement and aging semantics belong in shared domain rules rather than screen-specific calculations.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED  
Inactive identities stay historical; new activity is blocked and unsafe hard deletion is guarded.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED  
Inactive items remain traceable but unavailable for new orders; historical snapshots are preserved.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED  
New activity requires valid active references; historical rows are not destructively repaired.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Preserve original row, require reversal reason/timestamp, keep reversed rows visible with zero financial effect.

## D-013 — Replacement correction is atomic, linked and actor-neutral until P4
**Status:** ACCEPTED  
Wrong-value/wrong-reseller correction performs replacement creation and original reversal atomically with bidirectional linkage. No fabricated actor identity before P4.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

- `occurredAt` = financial/business occurrence;
- `createdAt` = registration/audit timestamp;
- `reversal.reversedAt` = P2 reversal/correction audit timestamp;
- Dexie V4 indexes `occurredAt` and migrates missing legacy occurrence as `occurredAt = createdAt`;
- linked correction preserves original financial occurrence while creating new registration/reversal audit timestamps;
- history/filter/PDF/dashboard temporal consumers use occurrence time.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

### Formal period statement

P3-S2 defines one shared `StatementPeriod` contract using P3-S1 financial occurrence:

- opening balance is effective signed balance from rows with `occurredAt < startDate`;
- movements contain every audit-visible row inside inclusive `[startDate, endDate]`;
- reversed rows remain visible but contribute zero through P2 shared effect;
- period movement is the signed effective total of those movements;
- closing balance is `openingBalance + periodMovement`;
- future rows after `endDate` do not affect closing;
- zero-movement periods are valid statements and may have non-zero opening/closing balances;
- reseller detail and PDF consume the same statement object.

### Total debt

“Dívida Total” is the sum of each reseller's positive all-time balance. A credit from one reseller must not reduce another reseller's debt.

### Aging model

The prior “time since last effective movement” model is rejected because a recent payment can make old unpaid debt appear recent.

Because current payments/signals are reseller-level and have no persisted allocation to specific orders, P3-S2 adopts a deterministic derived convention rather than inventing new schema:

- effective orders create debt lots at their `occurredAt`;
- effective payments/signals consume the oldest open order debt first (**FIFO**);
- excess credit is carried forward to later orders;
- reversed rows have zero effect and linked replacements behave as the effective financial event;
- no persistent payment↔order link is created;
- debt age is the age of the order amount still open: 0–6d recent, 7–30d attention, >30d critical;
- one reseller may contribute amounts to multiple buckets.

This convention can be revisited only if later real requirements justify explicit allocation/invoice semantics.

### Persistence consequence

P3-S2 requires no schema change; Dexie remains **V4**.

### Phase consequence

P3-S1 and P3-S2 together satisfy the P3 financial-time, formal-statement and aging gates. P3 can close.

---

# Open decisions

- local vs cloud persistence architecture and concrete actor identity source (P4);
- backup version/migration/restore-hardening strategy (P5);
- repository-wide QA and deployment gating (P6);
- new modules after real requirements discovery (P8/P9).
