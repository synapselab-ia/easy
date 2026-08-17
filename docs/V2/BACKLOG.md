# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

## P1 — Referential integrity and safe entity lifecycle

**Status:** `DONE` — 2026-08-17.

- P1-S1 safe reseller lifecycle — `DONE`.
- P1-S2 safe item lifecycle — `DONE`.
- P1-S3 referential validation/migration — `DONE`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`.
- P2-S2 linked/guided replacement — `DONE`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`.

## P4 — Persistence architecture decision: local vs cloud

**Status:** `DONE` — 2026-08-17.

D-016 keeps V2 local-first/single-user on Dexie V4 until an explicit cloud/auth reopen trigger is proven.

---

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `DONE`  
**Completed:** 2026-08-17

Goal achieved: the local-first dataset now has a versioned, validated, checkpointed and atomically restorable recovery path.

### P5-S1 — Versioned backup contract and non-destructive restore preflight

**Status:** `DONE`

- `easy-backup` v2 logical envelope;
- full persisted-field contract;
- v1 in-memory compatibility migration;
- deep path-level preflight and preview;
- no mutation before successful preflight.

Validation: `32058028793` — PASS.

### P5-S2 — Checkpointed atomic restore and migration proof

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- restore consumes only the successful P5-S1 normalized result and revalidates it before recovery;
- current live database is serialized, validated and downloaded as an `easy-checkpoint-v2-*` checkpoint before replacement;
- all three tables are replaced inside one Dexie transaction;
- restored rows are read back and re-run through P5-S1 invariant validation before commit;
- a canonical projection verifies exact restored IDs/fields/dates/P2-P3 links;
- write or verification failure aborts the transaction and preserves the prior database;
- explicit success/failure result exposes checkpoint/recovery status;
- UI exposes restore only after successful preflight;
- v2 export -> clean restore and v1 migration -> restore are covered with real IndexedDB transaction semantics via `fake-indexeddb`;
- financial outcomes are compared before/after restore.

Acceptance gate:

- [x] validated preview precedes restore;
- [x] recoverable checkpoint precedes destructive replacement;
- [x] replacement is one atomic Dexie transaction;
- [x] partial replacement is impossible on tested write failure;
- [x] restored dataset is verified before transaction commit;
- [x] IDs and lifecycle state preserved;
- [x] P2 audit/reversal/correction links preserved;
- [x] P3 occurrence dates and financial results preserved;
- [x] v1 compatibility restore proven;
- [x] targeted run `32060729538` passes.

P5 gate: **PASS / DONE**.

---

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Goal: reconcile repository-wide QA debt and ensure publication from `main` is conditional on accepted critical validation.

### P6-S1 — Reconcile repository-wide QA baseline and deployment safety

**Status:** `NOT_STARTED`

Expected work:

- inventory npm scripts, lint, Vitest, Playwright and GitHub workflows;
- run the complete existing lint/unit/integration/E2E/build baseline before changing expectations;
- classify each failure as real product regression vs stale test/tooling expectation;
- fix real regressions without changing accepted P1–P5 semantics;
- intentionally update obsolete expectations where product behavior is already canonical;
- make the critical validation gate mandatory before publication from `main`;
- keep P7+ UX/business work out of this phase.

P6 gate: critical repository suite reconciled and deployment cannot publish an unvalidated change.

## P7 — Complete incomplete UX flows

**Status:** `NOT_STARTED`.

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
