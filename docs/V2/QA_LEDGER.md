# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records targeted phase evidence separately from repository-wide QA health.

## P0

State/governance established; no runtime QA claim.

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

- P1-S1 evidence `32037965651`.
- P1-S2 evidence `32038951903`.
- P1-S3 evidence `32039763539`.

## P2 — Correction/reversal

**Status:** PASS / DONE.

- P2-S1 audited reversal evidence `32041280504`.
- P2-S2 linked/guided replacement evidence `32042373332`.

P2 verifies original preservation, mandatory audit reason/timestamp, linked atomic replacement, reversal-aware balances and history/PDF audit visibility.

## P3-S1 — Occurrence-date model and backward-safe migration

**Runtime changed:** Yes.  
**Schema changed:** Yes, Dexie V3 → V4.  
**UI changed:** Yes, transaction occurrence-date input and occurrence-based display/filtering.

### Migration and timestamp contract verified

- [x] V3 rows missing occurrence migrate with `occurredAt = createdAt`;
- [x] existing occurrence is preserved;
- [x] `createdAt` and P2 reversal/correction metadata are not rewritten by migration;
- [x] new writes can preserve operator-selected financial occurrence separately from generated registration time;
- [x] explicitly invalid occurrence is rejected;
- [x] lower-level legacy callers omitting occurrence remain backward-safe;
- [x] linked P2 replacement inherits original occurrence while receiving new registration time;
- [x] `reversal.reversedAt` remains a separate audit timestamp.

### Cross-surface occurrence behavior verified

- [x] transaction form persists selected financial date;
- [x] today-order count/volume uses occurrence date;
- [x] existing aging calculation uses last effective occurrence;
- [x] performance revenue window uses occurrence date;
- [x] history displays occurrence rather than registration;
- [x] reseller range filtering uses occurrence;
- [x] PDF range filtering and row date use occurrence;
- [x] legacy backup restore materializes missing occurrence from `createdAt`;
- [x] explicit backup occurrence remains distinct;
- [x] search balance regression remains green and has no independent date-window rule.

### Regression/build evidence

GitHub Actions run **`32052076684`**, job `95453575715` — **PASS**.

The same gate passed:

- focused P3-S1 migration/date/form/dashboard/history/reseller/PDF/backup tests;
- existing database migration regression;
- P1/P2 transaction mutation regressions;
- transaction form, correction dialog and transaction history regressions;
- dashboard/search/reseller-detail/PDF/backup regressions;
- reseller/item lifecycle regressions;
- `npm run build`.

### P3-S1 result

**PASS / DONE.** P3 remains `IN_PROGRESS` for P3-S2.

## Global baseline caveat

These targeted gates do **not** claim repository-wide lint/unit/integration/E2E health is green. Global reconciliation remains P6.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1. Financial occurrence is distinct from registration/audit time and is used across date consumers.
- **QG-005 period statement semantics:** OPEN / P3-S2. Selected-period balance is still net movement rather than formal opening/movements/closing; aging model remains undecided.
- **QG-006 backup validation depth:** OPEN / P5.
- **QG-007 stale/global test expectations:** OPEN / P6.
- **QG-008 deployment does not require full QA:** OPEN / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.

## QA policy

For each functional phase: define acceptance first, add targeted tests with behavior changes, verify cross-surface consistency, record evidence/unresolved gaps, and distinguish the phase gate from global repository QA.
