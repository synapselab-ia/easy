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
**Status:** ACCEPTED / SUPERSEDED BY D-016  
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
Wrong-value/wrong-reseller correction performs replacement creation and original reversal atomically with bidirectional linkage. Under D-016, any future local `actorRef` identifies an installation rather than a verified person.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

- `occurredAt` = financial/business occurrence;
- `createdAt` = registration/audit timestamp;
- `reversal.reversedAt` = reversal/correction audit timestamp;
- Dexie V4 indexes `occurredAt` and migrates missing legacy occurrence as `occurredAt = createdAt`;
- linked correction preserves original financial occurrence while creating new registration/reversal audit timestamps.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

P3-S2 defines one shared period statement: opening is effective signed balance before the start, movements are audit-visible rows inside the inclusive occurrence range, period movement uses shared financial effect, and closing = opening + movement. Zero-movement periods are valid.

Dashboard total debt is the sum of positive per-reseller balances. Debt aging is derived from effective open order lots; payments/signals consume oldest debt first (FIFO), excess credit carries forward, reversed rows have zero effect, and no persistent payment↔order link is invented.

## D-016 — V2 remains local-first/single-user on Dexie V4 until an explicit cloud trigger is proven
**Status:** ACCEPTED  
**Date:** 2026-08-17

Easy V2 keeps local-first, single-user persistence on Dexie V4 under the requirements currently evidenced. No backend, authentication, cloud database or synchronization layer is introduced. A future local `actorRef`, if materialized, is an opaque installation identity and must not be presented as verified human authorship.

D-016 must be explicitly reconsidered if real requirements mandate concurrent operators, automatic live multi-device sharing, person-level authorship/access control, remote recovery SLA, trusted server integrations, or a security policy incompatible with browser-local storage.

## D-017 — Backup v2 is the canonical logical recovery contract; destructive restore requires successful preflight
**Status:** ACCEPTED  
**Date:** 2026-08-17

### Contract

P5-S1 defines a logical backup/interchange format independent from physical IndexedDB layout:

```text
format = "easy-backup"
version = 2
exportedAt = ISO timestamp
source.database = "ResellerManagerDB"
source.schemaVersion = 4
data.items[]
data.resellers[]
data.transactions[]
```

Backup format version and Dexie schema version are separate. The live database remains Dexie V4.

The v2 payload carries every currently persisted Item, Reseller, Transaction, reversal and correction field needed to reproduce P1/P2/P3 history and financial semantics. New exports are validated against the same contract before download.

### Backward-compatible v1 migration

The historical `version: 1` JSON remains supported input through **in-memory normalization before validation**:

- missing item/reseller `isActive` becomes `true`;
- missing transaction `occurredAt` becomes its `createdAt`;
- explicit lifecycle, occurrence and P2 audit/correction metadata are preserved;
- unsupported backup versions are rejected rather than guessed.

Compatibility migration performs no database mutation.

### Preflight is mandatory before restore

A backup is not eligible for destructive restore until preflight has successfully validated the complete logical dataset. Validation includes:

- envelope/source/version structure;
- required fields and supported transaction type/shape;
- positive integer IDs and duplicate IDs per table;
- valid serialized dates and entity update chronology;
- positive finite prices, amounts, quantities and unit prices;
- transaction-to-reseller and transaction-to-item references;
- P1 lifecycle state;
- P2 reversal reason/date, correction/replacement IDs and bidirectional linkage;
- linked replacement type preservation and order-item preservation;
- P3 `occurredAt` fallback/preservation across linked correction;
- replacement registration chronology.

Validation failures are surfaced as path-level `BackupValidationError` issues.

### Non-destructive P5-S1 boundary

A successful preflight returns:

1. normalized in-memory rows using real `Date` values;
2. a preview containing source/target backup versions, Dexie schema version, export timestamp, migration warnings, entity counts, lifecycle counts, transaction-type counts and reversal/correction counts.

It does **not** call a Dexie write transaction, `clear()` or `bulkAdd()`.

The previous UI path that confirmed and immediately executed destructive import was removed. In P5-S1, selecting a backup can only validate and display a preview. This temporary inability to restore is an intentional safety gate, not a missing feature.

### P5-S2 restore preconditions

P5-S2 may introduce destructive restore only if it:

- consumes successfully preflighted normalized data rather than reparsing unchecked input;
- creates a recoverable checkpoint of the current dataset before replacement;
- replaces all three tables atomically;
- leaves no partially replaced state on failure;
- verifies post-restore counts, references and P1/P2/P3 invariants;
- proves supported v2 and v1 recovery paths preserve IDs, lifecycle state, history, correction links, occurrence dates and financial results.

### Architecture consequence

D-016 is unchanged. P5 backup hardening remains entirely local-first on Dexie V4 and introduces no backend, authentication, cloud persistence or synchronization.

---

# Open decisions

- exact checkpoint storage/recovery mechanics and atomic restore workflow (P5-S2);
- repository-wide QA and deployment gating (P6);
- operational UX refinements (P7);
- new modules after real requirements discovery (P8/P9);
- local vs cloud only if a D-016 reopen trigger is proven.
