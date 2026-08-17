# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

`STATUS.md` determines what is active now. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

Established the V2 laboratory, branch roles, canonical documents and reconstructable project state.

## P1 — Referential integrity and safe entity lifecycle

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

- P1-S1 safe reseller lifecycle — `DONE`.
- P1-S2 safe item lifecycle — `DONE`.
- P1-S3 referential validation/migration — `DONE`.

P1 established reversible lifecycle, guarded deletion, strict new references, historical snapshot preservation and the complete V1 → V2 → V3 migration path.

## P2 — Correction, reversal and audit trail

**Priority:** Critical  
**Status:** `DONE`  
**Completed:** 2026-08-17

- P2-S1 audited reversal — `DONE`.
- P2-S2 linked/guided replacement — `DONE`.

P2 established non-destructive reversal and atomic linked replacement while preserving originals, audit metadata, P1 validation and coherent financial effect.

## P3 — Dates, balances and financial statements

**Priority:** High  
**Status:** `IN_PROGRESS`

### P3-S1 — Occurrence-date model and backward-safe migration

**Status:** `DONE`  
**Completed:** 2026-08-17

Implemented:

- `occurredAt` is financial occurrence; `createdAt` is registration/audit time;
- new writes generate `createdAt` internally and the form captures financial date separately;
- Dexie V4 indexes `occurredAt` and migrates missing legacy occurrence as `occurredAt = createdAt`;
- valid existing occurrence values, historical snapshots and P2 audit/linkage metadata are preserved;
- `transactionOccurredAt()` supplies backward-read fallback;
- linked correction preserves original financial occurrence while correction registration/reversal timestamps remain separate;
- history, reseller range filters, PDF, today-order metrics, current aging calculation and performance windows use occurrence date;
- legacy backup restore materializes missing occurrence without expanding into P5 hardening;
- search has no independent date-window semantics.

Acceptance gate:

- [x] backward-safe V3 → V4 migration;
- [x] occurrence and registration can differ;
- [x] invalid explicit occurrence rejected and legacy callers remain safe;
- [x] P2 correction timestamps/linkage preserved;
- [x] cross-surface date behavior occurrence-aware;
- [x] P1/P2 regressions and build pass;
- [x] targeted GitHub Actions gate `32052076684` passes.

### P3-S2 — Statement and balance-period semantics

**Status:** `NOT_STARTED`

Expected next work:

- inventory period-balance and aging calculations across reseller detail, PDF, dashboard, search and analytics;
- define one shared opening balance → period movements → closing balance contract;
- make reseller detail and PDF use that same model;
- reconcile affected dashboard/search/analytics semantics through shared domain rules;
- explicitly decide whether last-effective-movement aging is sufficient or true debt aging is required;
- preserve P3-S1 occurrence semantics and P2 audit history.

Gate: identical data produces coherent financial results across every view/export, with formally defined statement balances and an accepted aging model.

## P4 — Persistence architecture decision: local vs cloud

**Priority:** High / Decision Gate  
**Status:** `NOT_STARTED`

Decide users, concurrency, devices, authorship, security, offline and recovery requirements before introducing backend/authentication.

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `NOT_STARTED`

Formal backup versioning, deep validation, restore preview/checkpoint, atomic restore and tested migration path.

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `NOT_STARTED`

Reconcile global lint/unit/integration/E2E debt and make deployment conditional on critical quality gates.

## P7 — Complete incomplete UX flows

**Priority:** Medium-High  
**Status:** `NOT_STARTED`

Operational UX refinement after the financial foundation.

## P8 — Real store requirements discovery

**Priority:** Mandatory before P9  
**Status:** `NOT_STARTED`

Produce prioritized user stories from real operating requirements.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`

No candidate module is approved before P8.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`

V2 replaces the old system only when balances match, history/restore are proven, critical flows pass and rollback is known.
