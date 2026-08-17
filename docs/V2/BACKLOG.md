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

**Priority:** High  
**Status:** `DONE`  
**Completed:** 2026-08-17

### P3-S1 — Occurrence-date model and backward-safe migration

**Status:** `DONE`.

Established Dexie V4, `occurredAt` financial occurrence, separate registration/audit timestamps, backward-safe migration and occurrence-aware consumers.

### P3-S2 — Statement and balance-period semantics

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- shared `buildStatementPeriod()` contract;
- opening balance strictly before period start;
- audit-visible period movements by `occurredAt` inclusive range;
- period movement using P2 effective/reversal-aware financial effect;
- closing balance = opening + period movement;
- reseller detail and PDF consume the same formal statement object;
- zero-movement periods remain valid statements;
- global total debt sums positive balances by reseller rather than netting credits across people;
- old last-movement aging model rejected;
- outstanding debt aging reconstructed with FIFO allocation of payment/signal credits to oldest effective order debt;
- excess credit carries forward; no persistent payment/order link is invented;
- age buckets use open order occurrence: 0–6d recent, 7–30d attention, >30d critical;
- schema remains Dexie V4.

Acceptance gate:

- [x] opening → movements → closing is explicit and shared;
- [x] identical period data gives identical reseller-detail/PDF statement values;
- [x] reversed/corrected rows retain P2 audit semantics;
- [x] zero-movement statement works;
- [x] total debt cannot be reduced by another reseller's credit;
- [x] aging represents debt still outstanding rather than last activity;
- [x] FIFO/prepayment edge cases automated;
- [x] P3-S1/P2/P1 regressions and build pass;
- [x] final targeted gate `32053837309` passes;
- [x] P3 closed.

---

## P4 — Persistence architecture decision: local vs cloud

**Priority:** High / Decision Gate  
**Status:** `NOT_STARTED`

Before any backend/auth implementation, inventory real users/operators, devices/locations, concurrency, authorship, security/privacy, offline and recovery requirements. Compare continued local Dexie against remote persistence/authentication and record one evidence-backed architecture decision with costs, risks and migration implications.

Gate: one accepted persistence architecture decision and one explicit implementation next action. No backend/auth code before the decision is accepted.

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `NOT_STARTED`

Formal backup versioning, deep validation, restore preview/checkpoint, atomic restore and tested migration path.

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Reconcile repository-wide lint/unit/integration/E2E debt and make deployment conditional on critical quality gates.

## P7 — Complete incomplete UX flows

**Status:** `NOT_STARTED`.

Operational UX refinement after foundation work.

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

Produce prioritized user stories from real operating requirements.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`. No candidate module approved before P8.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.

V2 replaces old usage only when balances/history/restore/critical flows and rollback are proven.
