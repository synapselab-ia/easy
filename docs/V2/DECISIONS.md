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

P5-S1 defines `easy-backup` version 2 as a logical interchange/recovery format independent from physical IndexedDB layout. Backup version and Dexie schema version remain separate; the live database remains Dexie V4.

The historical `version: 1` JSON remains supported through in-memory normalization before validation: missing lifecycle state becomes active and missing `occurredAt` becomes `createdAt`. Unsupported versions are rejected.

A backup is not eligible for destructive restore until preflight validates envelope/source/version, required fields, IDs/duplicates, dates, positive values, table references, P1 lifecycle state, P2 reversal/correction linkage and P3 occurrence/correction chronology. Successful preflight returns normalized `Date`-backed rows and a preview without mutation.

## D-018 — Restore requires a downloaded validated checkpoint and one verified atomic Dexie transaction
**Status:** ACCEPTED  
**Date:** 2026-08-17

### Checkpoint decision

Before any destructive restore write, Easy must create a **recoverable logical checkpoint** of the current live dataset:

1. read all three Dexie V4 tables;
2. serialize the live rows into the canonical `easy-backup` v2 envelope;
3. run the same P5-S1 deep validator against that checkpoint;
4. download the checkpoint as `easy-checkpoint-v2-<timestamp>.json`.

If checkpoint creation, validation or download fails, no destructive transaction is allowed to start.

### Restore-input decision

The destructive operation consumes the successful P5-S1 `BackupPreflightResult`; it does not reparse unchecked file text. Immediately before checkpoint creation, the normalized in-memory target is serialized/revalidated again. This prevents a mutated or stale object from bypassing the accepted restore contract between preview and confirmation.

### Atomicity decision

All destructive work occurs inside **one Dexie `rw` transaction** spanning `items`, `resellers` and `transactions`:

- clear all three tables;
- bulk-add the preflighted rows with original IDs;
- read the restored rows back before commit;
- run the complete P5-S1 validator against the restored logical dataset;
- compare an ID-sorted canonical projection of all restored fields, dates and audit links with the expected target.

A write or verification error throws inside the transaction. Dexie rollback is therefore the authoritative mechanism that preserves the complete previous database and prevents partial replacement.

### Result/recovery decision

Restore returns an explicit discriminated success/failure result. Success includes the checkpoint filename and restored preview. Failure states `previousDatabasePreserved: true` and includes the checkpoint filename when one had already been generated, giving the operator an explicit recovery artifact/path.

### Migration proof

P5-S2 must be considered complete only with tests showing:

- current v2 export -> clean restore preserves IDs, P1 lifecycle, P2 correction links/audit, P3 occurrence and financial outcomes;
- supported v1 migration -> restore preserves IDs/finance while materializing the accepted lifecycle/occurrence defaults;
- a failure after clears begin rolls back to the prior dataset;
- an altered normalized target is rejected before checkpoint/write.

Targeted run `32060729538` satisfies this gate.

### Architecture consequence

D-016 and Dexie V4 remain unchanged. Checkpoint/restore is a local browser recovery workflow; it does not introduce remote storage, authentication, synchronization or a second system of record.

---

# Open decisions

- repository-wide QA and deployment gating (P6);
- operational UX refinements (P7);
- new modules after real requirements discovery (P8/P9);
- local vs cloud only if a D-016 reopen trigger is proven.
