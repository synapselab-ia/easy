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
**Status:** `IN_PROGRESS`

Goal: make the accepted local-first dataset recoverable and portable through a versioned, validated and tested backup/restore contract.

### P5-S1 — Versioned backup contract and non-destructive restore preflight

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- complete Dexie V4 persisted-field inventory;
- logical backup envelope `easy-backup`, backup version 2, source schema version 4;
- new exports use v2 and self-validate before download;
- current v1 JSON remains supported through in-memory compatibility migration;
- v1 missing lifecycle state becomes active and missing `occurredAt` falls back to `createdAt`;
- strict preflight of required fields, positive IDs, duplicate IDs, dates, numeric values and table/reference integrity;
- P2 reversal/correction metadata, bidirectional links and replacement rules are validated;
- P3 occurrence preservation across linked correction is validated;
- successful preflight produces normalized rows plus entity/audit/migration preview;
- invalid input cannot invoke Dexie transaction/clear/bulkAdd;
- old destructive import-confirm path removed from UI pending P5-S2 checkpoint guarantees.

Acceptance gate:

- [x] current v2 envelope validates;
- [x] v1 compatibility migration validates supported historical fields;
- [x] unsupported/malformed backup is rejected;
- [x] duplicate IDs and broken reseller/item references are rejected;
- [x] invalid dates and financial values are rejected;
- [x] P2 correction links/audit semantics are checked;
- [x] P3 occurrence fallback/preservation is covered;
- [x] preview is shown without destructive import action;
- [x] preflight does not mutate current IndexedDB;
- [x] P1/P2/P3 regressions and build pass;
- [x] targeted run `32058028793` passes.

### P5-S2 — Checkpointed atomic restore and migration proof

**Status:** `NOT_STARTED`

Expected work:

- use only successfully preflighted normalized input;
- create a recoverable checkpoint of the current dataset before replacement;
- perform full-table replacement inside one atomic Dexie transaction;
- ensure any failure leaves the previous live database intact rather than partially replaced;
- validate post-restore counts, IDs, references and P1/P2/P3 invariants;
- prove current v2 export -> clean restore preserves the canonical dataset;
- prove supported v1 migration -> restore preserves IDs, lifecycle state, audit/correction links, occurrence dates and financial outcomes;
- expose a clear restore result/recovery path.

P5 gate: versioned export -> validated preview -> checkpoint -> atomic restore reproduces the canonical dataset and invariants.

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Reconcile repository-wide lint/unit/integration/E2E debt and make deployment conditional on critical quality gates.

## P7 — Complete incomplete UX flows

**Status:** `NOT_STARTED`.

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
