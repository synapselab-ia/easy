# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Candidates and open questions remain in `BACKLOG.md` or `STATUS.md` until resolved.

---

## D-001 — V2 laboratory repository

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Use `synapselab-ia/easy` as the V2 working repository. The original `viniciuscasarin/easy` is not the V2 experimentation target.

---

## D-002 — Branch roles

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

- `main` = stable copied baseline/reference;
- `develop` = V2 integration branch;
- `feature/*` = isolated units of work derived from `develop`.

---

## D-003 — P0 changes documentation/governance only

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

P0 must not change Easy runtime behavior, financial logic, database schema or UI behavior.

---

## D-004 — Legacy task checkboxes are historical, not canonical

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

The existing `tasks/` directory may be read as historical design evidence, but its checkbox state does not define V2 completion. V2 status is defined by canonical documents, merged code and QA evidence.

---

## D-005 — No full rewrite by default

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Preserve working parts of Easy and evolve incrementally. A full rewrite requires a later explicit decision supported by technical/business evidence.

---

## D-006 — Current persistence remains baseline until P4

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Dexie/IndexedDB remains the current architecture through the early integrity/financial phases unless a specific change is technically required. Do not introduce Supabase, backend or authentication before P4 decides local vs cloud.

---

## D-007 — Financial history should favor preservation over destructive deletion

**Status:** DIRECTION ACCEPTED  
**Date:** 2026-08-17

### Decision

The V2 prefers historical preservation for entities involved in financial records. P1 defines the exact lifecycle/reference rules and is now complete for reseller/item lifecycle plus new-transaction references.

---

## D-008 — Runtime source of truth must be centralized over time

**Status:** DIRECTION ACCEPTED; implementation scheduled for later phases  
**Date:** 2026-08-17

### Decision

Financial semantics such as balance, valid/reversed transaction treatment and statement totals should eventually come from shared domain rules rather than independent calculations scattered across screens.

---

## D-009 — Reseller lifecycle is reversible archive, with guarded hard deletion

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

For P1-S1:

- reseller lifecycle is represented by `isActive`;
- legacy reseller records default to active through V1 → V2 migration and backward-safe reads;
- normal UI archives/reactivates;
- inactive resellers remain historically discoverable but unavailable for new transactions;
- transaction creation rejects inactive/missing resellers;
- physical deletion is permitted only when no transaction references the reseller.

---

## D-010 — Item lifecycle is reversible archive, with preserved order snapshots and guarded hard deletion

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

For P1-S2:

- item lifecycle is represented by `isActive`;
- legacy item records default to active through V2 → V3 migration and backward-safe reads;
- normal catalog UI archives/reactivates;
- inactive items remain visible but unavailable for new orders;
- order creation rejects inactive/missing referenced items;
- physical deletion is rejected whenever a transaction references the item;
- historical transaction snapshots are not rewritten when catalog state changes.

---

## D-011 — New transaction references are strict; historical records are preserved

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

P1-S3 closes the remaining runtime reference matrix without introducing a new Dexie schema version.

For **new transactions created through the transaction mutation**:

- `resellerId` must be a positive integer resolving to an existing active reseller for `order`, `payment` and `signal`;
- `order` must include a positive `itemId` resolving to an existing active item;
- the `itemName` snapshot for a new order is derived from the resolved item identity so a stale/alternate caller cannot persist a mismatched item name;
- `payment` and `signal` are reseller-level movements and must not carry `itemId` references;
- invalid/missing/inactive references are rejected before persistence.

For **historical stored data and schema migration**:

- V1 → V2 → V3 upgrades do not revalidate or rewrite transaction references/snapshots;
- missing lifecycle fields become active according to the existing migrations/read rules, while explicit `false` state is preserved;
- IDs, dates, transaction snapshots and valid lifecycle state must survive the complete P1 migration path;
- an old order whose catalog reference no longer resolves is preserved when its stored snapshot still explains the order; P1 does not invent or destructively repair historical data.

### Rationale

Creation-time integrity and historical compatibility have different responsibilities. New activity can be strict because current entities are available to validate. Old records may encode legitimate legacy history after past catalog deletion; rewriting those records would destroy evidence rather than improve integrity.

### Scope boundary

- no Dexie V4 is required because P1-S3 adds validation/coverage, not persistent fields;
- deep backup schema/reference/duplicate validation remains P5;
- transaction reversal/correction semantics remain P2;
- date/statement semantics remain P3.

---

# Open decisions

These are intentionally **not decided yet**:

- reversal/correction data model and first audited-correction slice (P2);
- `occurredAt` and statement semantics (P3);
- local vs cloud architecture (P4);
- backup migration/version strategy details (P5);
- preview/deployment architecture for V2 development (P6 or earlier operational setup if needed);
- inventory, richer orders, users and other new modules (P8/P9).
