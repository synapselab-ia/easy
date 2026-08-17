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
Balance, effective/reversed treatment and statement totals should come from shared domain rules rather than independent screen calculations.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED  
Resellers use `isActive`; archive/reactivate is normal behavior; historical identity is preserved and unsafe hard deletion is guarded.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED  
Items use `isActive`; inactive items remain traceable but unavailable for new orders; historical snapshots are preserved.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED  
New transactions require an active reseller; orders require an active item and derive the item snapshot from it. Historical rows are not destructively repaired.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Preserve the original row, require reversal reason/timestamp, keep reversed rows visible with zero financial effect, and expose audit status in history/PDF.

## D-013 — Replacement correction is atomic, linked and actor-neutral until P4
**Status:** ACCEPTED  
Wrong-value/wrong-reseller correction performs replacement creation and original reversal in one Dexie transaction with bidirectional linkage. Type and relevant snapshots remain preserved; P1 validation applies. No fake actor identity is recorded before P4.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

P3-S1 separates business time from audit time.

### Timestamp contract

- `occurredAt` is the financial/business occurrence date used for date-window semantics;
- `createdAt` is the record-registration timestamp and is generated internally for new transaction writes;
- `reversal.reversedAt` is a P2 audit timestamp and is never financial occurrence;
- the supported date-only transaction UI maps the selected local day to local noon; time-of-day is not business-significant in P3-S1;
- old lower-level callers that omit occurrence default it to registration time for compatibility; explicitly invalid occurrence values are rejected.

### Persistence and migration

Dexie **V4** adds an `occurredAt` index. Rows upgrading from older schemas materialize missing occurrence as `occurredAt = createdAt`. Existing valid occurrence, `createdAt`, P1 snapshots/lifecycle data and P2 reversal/correction metadata remain unchanged.

`transactionOccurredAt()` is the canonical backward-read helper: explicit occurrence first, legacy `createdAt` fallback second.

### Correction semantics

A P2 linked replacement represents the corrected version of the same financial event:

- original occurrence stays unchanged;
- replacement inherits the original occurrence;
- replacement receives a new registration `createdAt`;
- reversal receives its own new `reversedAt` audit timestamp.

### Consumer boundary

Occurrence date drives history ordering/display, reseller range filtering, PDF range/display, today-order metrics, current last-effective-movement aging and performance revenue windows. Global search has no independent time-window calculation and remains an all-time balance consumer.

### Scope boundary

P3-S1 does **not** define opening/closing statement balances or decide whether the existing aging model is sufficient; those belong to P3-S2. Backup restore date conversion here is compatibility only; P5 retains deep backup validation/versioning.

---

# Open decisions

- opening/closing statement semantics and aging model (P3-S2);
- local vs cloud architecture and concrete actor identity source (P4);
- backup version/migration strategy (P5);
- preview/deployment and global QA gating (P6);
- new modules after real requirements discovery (P8/P9).
