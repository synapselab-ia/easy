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

### Scope

- establish `synapselab-ia/easy` as V2 laboratory;
- preserve `main` as stable copied baseline;
- use `develop` as V2 integration branch;
- use `feature/*` branches for isolated work;
- create canonical V2 documentation;
- reconstruct actual technical/product state;
- stop treating legacy task checkboxes as canonical status.

### Gate

A fresh conversation can reconstruct what Easy is, current architecture/risks, current phase, next action and scope boundaries from the canonical V2 documents.

---

## P1 — Referential integrity and safe entity lifecycle

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

### P1-S1 — Safe reseller lifecycle

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- reversible active/inactive reseller lifecycle;
- V1 → V2 active-state migration;
- archive/reactivate normal UI;
- hard-delete protection when transactions exist;
- historical discovery/detail/statement preservation;
- inactive/missing reseller rejection for new transactions.

### P1-S2 — Safe item lifecycle

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- reversible active/inactive item lifecycle;
- V2 → V3 active-state migration;
- archive/reactivate catalog UI;
- hard-delete protection when a transaction references the item;
- inactive item visibility in catalog/search;
- active-only new-order selection and mutation guard;
- historical order snapshot preservation.

### P1-S3 — Referential validation and migration

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- explicit new-transaction reference acceptance matrix;
- positive/existing/active reseller reference required for all new transactions;
- new orders require a positive/existing/active item reference;
- new-order `itemName` snapshot is derived from the resolved item identity;
- payment/signal creation rejects item references;
- complete V1 → V2 → V3 migration-path tests preserve IDs, dates, lifecycle state and transaction snapshots;
- historical unresolved item references with stored snapshots remain preserved rather than destructively repaired;
- P1-S1/P1-S2 lifecycle/search/form/integration regressions remain green.

Acceptance gate:

- [x] old valid local data upgrades without loss across V1 → V2 → V3;
- [x] invalid new references are rejected according to an explicit matrix;
- [x] historical snapshots remain understandable and are not rewritten by migration;
- [x] reseller/item lifecycle rules are reconciled across P1;
- [x] targeted P1-S3 tests and build pass;
- [x] P1 is closed.

---

## P2 — Correction, reversal and audit trail

**Priority:** Critical  
**Status:** `NOT_STARTED`

Goal: correct common human financial-entry errors without silently destroying history.

Expected capabilities:

- transaction detail;
- reversal/cancellation action;
- mandatory reason;
- correction timestamp;
- preserved original entry;
- visible reversed status;
- correct balance/dashboard recalculation;
- future-ready actor attribution field/strategy.

Required cases:

- R$500 order entered as R$5,000;
- duplicate payment;
- payment/signal posted to wrong reseller;
- old order reversal;
- PDF/dashboard consistency after reversal.

Gate: common input errors can be corrected through the UI with traceability and no manual database editing.

---

## P3 — Dates, balances and financial statements

**Priority:** High  
**Status:** `NOT_STARTED`

Expected work:

- separate `occurredAt` from `createdAt`;
- define opening/period/closing balance semantics;
- make reseller detail, dashboard, search, PDF and analytics use consistent domain rules;
- decide whether the current last-movement risk metric is sufficient or true debt aging is required.

Gate: identical data produces coherent financial results across every view/export.

---

## P4 — Persistence architecture decision: local vs cloud

**Priority:** High / Decision Gate  
**Status:** `NOT_STARTED`

Must answer before introducing backend/authentication:

- how many people use Easy;
- whether they use it simultaneously;
- whether they need multiple devices/locations;
- whether per-user authorship is required;
- sensitivity/security requirements;
- offline requirement;
- recovery expectations.

Possible outcomes:

- strengthen local Dexie architecture; or
- approve a cloud-backed architecture with migration plan.

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
- make deployment conditional on quality gates;
- reconcile Node/tooling documentation with workflow reality.

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

Candidate work:

- global search opens exact item/action;
- quick actions arrive preconfigured;
- consistent validation/toasts/loading;
- duplicate-submit protection;
- better reseller search/filtering;
- phone formatting;
- only catalog fields proven useful by operation.

Inventory is **not** assumed to belong here until confirmed.

---

## P8 — Real store requirements discovery

**Priority:** Mandatory before P9  
**Status:** `NOT_STARTED`

Discovery must cover:

- users/devices/frequency;
- work still done in paper/WhatsApp/spreadsheets;
- reseller credit, regions, commissions and inactivity;
- multi-item orders, statuses, discounts, shipping and payment terms;
- due dates, partial payments, credits and monthly closing;
- product variants, price tables and inventory;
- required reports/exports.

Output: prioritized user stories with acceptance criteria.

---

## P9 — Prioritized new modules

**Priority:** Variable  
**Status:** `NOT_STARTED`

No candidate module is approved before P8.

Potential epics only if confirmed:

- richer orders;
- accounts receivable;
- professional catalog;
- users/permissions;
- reports/exports.

---

## P10 — Controlled beta, migration and cutover

**Priority:** Critical before replacement of real use  
**Status:** `NOT_STARTED`

Expected work:

- freeze release-candidate schema;
- pass all tests;
- use preview/homologation environment;
- import controlled copy of real data;
- compare entity counts and balances old vs V2;
- sample PDFs;
- operational testing by Duda/store;
- final backup;
- migration and rollback plan.

Gate: V2 replaces the old system only when balances match, history is preserved, restore is proven, critical flows pass and rollback is known.
