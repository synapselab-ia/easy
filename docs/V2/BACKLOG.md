# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

## How to use this file

This file defines the order of V2 work. `STATUS.md` determines what is active now.

Do not infer completion from the historical `tasks/` directory. Only this backlog plus `STATUS.md`, `QA_LEDGER.md` and merged code define current V2 state.

Status vocabulary:

- `NOT_STARTED`
- `IN_PROGRESS`
- `IN_REVIEW`
- `BLOCKED`
- `DONE`

---

## P0 — State and governance

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

P0 established the V2 laboratory, branch roles, canonical documents and reconstructable project state.

---

## P1 — Referential integrity and safe entity lifecycle

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

### P1-S1 — Safe reseller lifecycle

**Status:** `DONE`

Implemented reversible reseller lifecycle, V1 → V2 active-state migration, historical preservation, guarded hard deletion and strict new-transaction reseller validation.

### P1-S2 — Safe item lifecycle

**Status:** `DONE`

Implemented reversible item lifecycle, V2 → V3 active-state migration, historical snapshot preservation, guarded hard deletion and active-only new-order behavior.

### P1-S3 — Referential validation and migration

**Status:** `DONE`

Implemented the strict new-transaction reference matrix and complete V1 → V2 → V3 preservation coverage without destructive historical repair.

---

## P2 — Correction, reversal and audit trail

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

Goal achieved: common human financial-entry errors can be corrected without silently destroying history.

### P2-S1 — Audited transaction reversal

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented behavior:

- original transaction remains stored;
- optional `reversal` metadata carries mandatory reason and ISO reversal timestamp;
- transaction can be reversed only once;
- destructive transaction deletion is replaced as the correction path by `useReverseTransaction`;
- reseller-history UI exposes reversal with mandatory reason;
- reversed entries remain visible with audit metadata;
- shared transaction-domain rules make reversed entries financially ineffective;
- reseller detail, dashboard totals/today orders/aging/performance, search balances and PDF balance inputs use reversal-aware semantics;
- PDF statements keep reversed rows and show status/reason;
- pure cancellation covers duplicate-payment and old-order-reversal cases without forcing replacement;
- Dexie schema remains V3 because reversal metadata is optional/non-indexed.

Acceptance gate:

- [x] original row preserved;
- [x] reason mandatory;
- [x] correction timestamp/status persisted;
- [x] no double reversal;
- [x] visible audit trail in history/PDF;
- [x] balance/dashboard/search consistency after reversal;
- [x] targeted tests and build pass.

### P2-S2 — Linked/guided correction replacement

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented behavior:

- linked correction is atomic: reversal of the original and creation of the replacement happen in one Dexie transaction;
- original reversal may persist `replacementTransactionId`;
- replacement persists `correction.replacesTransactionId`;
- failure validating the replacement rolls the entire operation back;
- guided correction supports wrong-value and wrong-reseller cases;
- replacement preserves the original transaction type and observation;
- order correction preserves the original item identity and recalculates total from corrected quantity × unit price;
- replacement still obeys P1 active reseller/item reference validation;
- normal transaction creation strips correction/reversal metadata and cannot forge audit linkage;
- history and PDF expose the relationship in both directions;
- the original remains financially neutral and only the effective replacement contributes to balances/dashboard/search;
- actor attribution strategy is provider-neutral and intentionally does not invent authentication/user identity before P4;
- Dexie schema remains V3 because linkage metadata is optional/non-indexed.

Acceptance gate:

- [x] wrong-value entry can be reversed and replaced with explicit linkage;
- [x] wrong-reseller entry can be reversed and recreated against the intended active reseller with explicit linkage;
- [x] original and replacement remain independently inspectable;
- [x] linked replacement uses current P1 validation and rollback is atomic on failure;
- [x] balances/dashboard/search/history/PDF remain coherent;
- [x] duplicate payment and pure cancellation remain supported by P2-S1;
- [x] old-order reversal remains supported by P2-S1;
- [x] future actor-attribution strategy is explicitly defined without backend/auth implementation;
- [x] targeted P2-S2 tests, P2-S1/P1 regressions and build pass;
- [x] P2 is closed.

---

## P3 — Dates, balances and financial statements

**Priority:** High  
**Status:** `NOT_STARTED`

Goal: establish one coherent financial time and statement model across every consumer.

### P3-S1 — Occurrence-date model and backward-safe migration

**Status:** `NOT_STARTED`

Expected work:

- inventory every current `createdAt` consumer across transaction creation, history/filtering/PDF, dashboard/aging/performance, search, backup and tests;
- define exact `occurredAt` versus registration/audit `createdAt` semantics;
- add a backward-safe historical migration/read rule;
- preserve P2 correction audit timestamps and linkage;
- make the occurrence-date slice consistent across affected consumers;
- do not redesign opening/closing statement semantics in this slice.

### P3-S2 — Statement and balance-period semantics

**Status:** `NOT_STARTED`

Expected later work:

- define opening balance → period movements → closing balance semantics;
- make reseller detail and PDF use the same statement model;
- reconcile dashboard/search/analytics with shared financial domain rules;
- decide whether current last-effective-movement aging is sufficient or true debt aging is required.

Gate: identical data produces coherent financial results across every view/export, with explicit occurrence dates and formally defined statement balances.

---

## P4 — Persistence architecture decision: local vs cloud

**Priority:** High / Decision Gate  
**Status:** `NOT_STARTED`

Must answer before introducing backend/authentication: users, concurrency, devices/locations, authorship, security, offline and recovery requirements.

Gate: one documented architecture decision with rationale, costs, risks and migration implications.

---

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `NOT_STARTED`

Expected work:

- formal backup schema versioning;
- deep field/reference/date/value validation;
- duplicate-ID detection;
- restore preview/summary;
- checkpoint before destructive restore;
- atomic restore and post-restore validation;
- tested schema migration path.

Gate: export → clean restore reproduces the same entities, histories and balances.

---

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Expected work:

- reconcile stale unit/integration/E2E tests;
- cover integrity, balances, reversals, dates, statements, backups and lifecycle rules;
- establish critical E2E business flow;
- make deployment conditional on quality gates.

Target CI sequence:

```text
install
-> lint/typecheck
-> unit/integration tests
-> build
-> critical E2E
-> deploy
```

Gate: critical failure prevents publication.

---

## P7 — Complete incomplete UX flows

**Priority:** Medium-High  
**Status:** `NOT_STARTED`

Candidate work includes exact item/action navigation from global search, preconfigured quick actions, consistent validation/toasts/loading, duplicate-submit protection and proven-useful catalog refinements.

---

## P8 — Real store requirements discovery

**Priority:** Mandatory before P9  
**Status:** `NOT_STARTED`

Discovery covers users/devices, current manual work, reseller/commercial rules, orders, payments, variants/inventory and reporting needs.

Output: prioritized user stories with acceptance criteria.

---

## P9 — Prioritized new modules

**Priority:** Variable  
**Status:** `NOT_STARTED`

No candidate module is approved before P8.

---

## P10 — Controlled beta, migration and cutover

**Priority:** Critical before replacement of real use  
**Status:** `NOT_STARTED`

Gate: V2 replaces the old system only when balances match, history is preserved, restore is proven, critical flows pass and rollback is known.
