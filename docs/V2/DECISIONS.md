# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Candidates and open questions remain in `BACKLOG.md` or `STATUS.md` until resolved.

---

## D-001 — V2 laboratory repository

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Use `synapselab-ia/easy` as the V2 working repository.

The original `viniciuscasarin/easy` is not the V2 experimentation target.

### Rationale

- isolates reconstruction work from the system originally maintained by Vinicius;
- gives the V2 owner full repository control;
- reduces risk of accidental changes to the original repository;
- preserves the original implementation/history as upstream reference.

---

## D-002 — Branch roles

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

- `main` = stable copied baseline/reference;
- `develop` = V2 integration branch;
- `feature/*` = isolated units of work derived from `develop`.

### Rationale

Separates stable reference, integration and experimental work, and allows review before V2 changes accumulate.

---

## D-003 — P0 changes documentation/governance only

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

P0 must not change Easy runtime behavior, financial logic, database schema or UI behavior.

### Rationale

The project needs a canonical state before implementation begins. Mixing documentation reconstruction with functional changes would make the initial baseline ambiguous.

---

## D-004 — Legacy task checkboxes are historical, not canonical

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

The existing `tasks/` directory may be read as historical design evidence, but unchecked/checked boxes there do not define V2 completion state.

V2 status is defined by `docs/V2/STATUS.md`, `BACKLOG.md`, merged code and QA evidence.

### Rationale

Several legacy task lists remain unchecked even though their features exist in the current application.

---

## D-005 — No full rewrite by default

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Preserve working parts of Easy and evolve incrementally. A full rewrite requires a later explicit decision supported by technical/business evidence.

### Rationale

The existing application already contains meaningful functionality, responsive UI, analytics, PDF generation, backup and tests. Rewriting everything would increase risk and delay correction of the financial core.

---

## D-006 — Current persistence remains baseline until P4

**Status:** ACCEPTED  
**Date:** 2026-08-17

### Decision

Dexie/IndexedDB remains the current architecture through the early integrity/financial phases unless a specific change is technically required. Do not introduce Supabase, backend or authentication before P4 decides local vs cloud.

### Rationale

The real need for multi-device/multi-user synchronization has not yet been formally established. Premature backend adoption could force unnecessary architecture and migration complexity.

---

## D-007 — Financial history should favor preservation over destructive deletion

**Status:** DIRECTION ACCEPTED; exact P1 implementation pending  
**Date:** 2026-08-17

### Decision

The V2 should prefer historical preservation for entities involved in financial records. P1 will specify the exact active/inactive/archive and deletion rules.

### Rationale

Deleting an identity that owns financial history can make balances and statements untraceable. The exact schema/UI behavior still needs implementation design and tests.

---

## D-008 — Runtime source of truth must be centralized over time

**Status:** DIRECTION ACCEPTED; implementation scheduled for later phases  
**Date:** 2026-08-17

### Decision

Financial semantics such as balance, valid/reversed transaction treatment and statement totals should eventually come from shared domain rules rather than independent calculations scattered across screens.

### Rationale

The current application calculates related totals in multiple places. As reversal/date rules become richer, duplication increases the risk that dashboard, detail, search and PDF disagree.

---

# Open decisions

These are intentionally **not decided yet**:

- exact reseller/item lifecycle schema (P1);
- reversal/correction data model (P2);
- `occurredAt` and statement semantics (P3);
- local vs cloud architecture (P4);
- backup migration/version strategy details (P5);
- preview/deployment architecture for V2 development (P6 or earlier operational setup if needed);
- inventory, richer orders, users and other new modules (P8/P9).
