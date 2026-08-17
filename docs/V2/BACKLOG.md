# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

Established V2 laboratory, branch roles, canonical documents and reconstructable project state.

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

**Priority:** High / Decision Gate  
**Status:** `DONE`  
**Completed:** 2026-08-17

Decision: keep V2 **local-first, single-user on Dexie V4** under the requirements currently evidenced.

Evidence and accepted consequences:

- historical product persona is one administrator/business owner;
- original requirements explicitly specify IndexedDB/Dexie, no backend, no authentication and no cloud sync;
- portability is manual JSON export/import to move computers, not concurrent synchronization;
- current runtime/dependencies/deployment remain static and browser-local;
- no evidence requires simultaneous operators, live multi-device dataset, centralized roles, person-level authorship or remote recovery SLA;
- provider-neutral future audit actor under local architecture maps to an opaque local installation identity, not fabricated human identity;
- backend/auth/cloud is deferred unless objective reopen triggers appear;
- cloud migration, if later justified, must preserve Dexie V4 IDs/history and P1/P2/P3 invariants while adding an explicit identity/conflict/offline/cutover model.

Acceptance gate:

- [x] users/operators inventoried;
- [x] devices/locations and concurrency inventoried;
- [x] authorship strategy resolved for local architecture;
- [x] security/privacy/offline/recovery boundaries documented;
- [x] local vs cloud costs, risks and migration implications compared;
- [x] objective cloud-reopen triggers defined;
- [x] one accepted architecture decision recorded as D-016;
- [x] no backend/auth/cloud implementation introduced.

---

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `NOT_STARTED`

Goal: make the accepted local-first dataset recoverable and portable through a versioned, validated and tested backup/restore contract.

### P5-S1 — Versioned backup contract and non-destructive restore preflight

**Status:** `NOT_STARTED`

Expected work:

- inventory every persisted Dexie V4 field and current export/import behavior;
- define a formal backup schema/envelope version and backward migration from current v1 JSON;
- validate required fields, IDs, duplicate IDs, references, dates, values, lifecycle state, occurrence timestamps and P2 audit/linkage metadata;
- produce a restore preview/summary before mutation;
- invalid input must leave the current database untouched;
- do not perform final destructive replacement/checkpoint in this slice.

### P5-S2 — Checkpointed atomic restore and migration proof

**Status:** `NOT_STARTED`

Expected later work:

- create a recoverable checkpoint before replacement;
- perform atomic restore only after successful preflight;
- validate post-restore invariants and counts;
- test current-version clean restore plus supported legacy migration paths;
- demonstrate export → clean restore preserves entities, financial history, correction links, occurrence dates, statements and balances.

Gate: versioned export → validated preview → checkpointed atomic restore reproduces the canonical dataset and invariants.

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Reconcile repository-wide lint/unit/integration/E2E debt and make deployment conditional on critical quality gates.

## P7 — Complete incomplete UX flows

**Status:** `NOT_STARTED`.

Operational UX refinement after foundation work.

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

Produce prioritized user stories from real operating requirements. If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`. No candidate module approved before P8.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.

V2 replaces old usage only when balances/history/restore/critical flows and rollback are proven.
