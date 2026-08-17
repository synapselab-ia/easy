# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records verified quality evidence, known gaps and required validation by phase.

---

## P0 — State and governance

**Runtime code changed:** No.  
**Database schema changed:** No.  
**UI behavior changed:** No.

### Baseline evidence reviewed

The P0 reconstruction inspected representative current files on `develop`, including:

- `package.json` — stack, scripts and test dependencies;
- `src/App.tsx` — routes and browser basename;
- `src/db/database.ts` — entities, Dexie schema and transaction types;
- `src/hooks/useResellers.ts` — physical reseller deletion behavior;
- `src/hooks/useItems.ts` — physical item deletion behavior;
- `src/hooks/useTransactions.ts` — transaction create/delete mutations;
- `src/pages/ResellerDetailPage.tsx` — balance/date-filter behavior;
- `src/services/backupService.ts` — backup/restore structure and validation depth;
- `src/components/search/CommandCenter.tsx` — search/quick-action behavior;
- `tests/e2e/search.spec.ts` — current E2E expectations;
- `.github/workflows/deploy.yml` — production deployment gate.

### P0 documentation gate

Required canonical files:

- [x] `PROJECT_SPEC.md`
- [x] `ARCHITECTURE.md`
- [x] `BACKLOG.md`
- [x] `DECISIONS.md`
- [x] `QA_LEDGER.md`
- [x] `CHANGELOG.md`
- [x] `STATUS.md`

Required reconstructability questions:

- [x] What is Easy?
- [x] What is V2 trying to solve?
- [x] What is the current architecture?
- [x] What risks have already been identified?
- [x] What phase is current?
- [x] What is the single next action?
- [x] What is explicitly out of scope now?

### Tests executed for P0

No runtime test command was executed as part of P0 because P0 changes documentation only and the current ChatGPT/GitHub workflow does not provide a checked-out runtime environment in this step.

This is not evidence that the existing test suite passes. Test reconciliation/execution is a future quality task, primarily P6, while each earlier functional phase must still add/adjust tests for its own changes.

---

## Known baseline QA gaps

### QG-001 — Referential integrity

**Severity:** Critical  
**Owner phase:** P1

Physical deletion of a reseller can leave transactions that still reference the deleted reseller ID.

Required future evidence:

- lifecycle/deletion unit tests;
- migration tests;
- dashboard/detail/search consistency tests.

### QG-002 — Historical item references

**Severity:** High  
**Owner phase:** P1

Physical item deletion can leave historical transactions pointing to a removed item ID, even though `itemName` snapshots mitigate display loss.

Required future evidence:

- item lifecycle tests;
- historical order preservation tests.

### QG-003 — Financial correction flow

**Severity:** Critical  
**Owner phase:** P2

A physical delete mutation exists for transactions, but the application lacks a deliberate audited correction/reversal workflow.

Required future evidence:

- reversal calculation tests;
- duplicate/wrong-reseller/error-entry cases;
- PDF/dashboard consistency after reversal.

### QG-004 — Date semantics

**Severity:** High  
**Owner phase:** P3

Transactions currently have only `createdAt`; occurrence time and record-creation time are not distinct.

Required future evidence:

- historical entry tests;
- date-boundary tests;
- timezone/date filtering tests where applicable.

### QG-005 — Period statement semantics

**Severity:** High  
**Owner phase:** P3

The current period balance represents net movement inside the filter window, not a formally defined opening and closing balance statement.

Required future evidence:

- opening balance cases;
- mixed order/payment interval cases;
- PDF vs on-screen equality.

### QG-006 — Backup validation depth

**Severity:** High  
**Owner phase:** P5

Backup import validates broad structure but does not deeply verify every field/reference/schema relationship before replacing current data.

Required future evidence:

- malformed data tests;
- invalid references;
- duplicate IDs;
- incompatible versions;
- full clean restore comparison.

### QG-007 — Stale E2E expectations

**Severity:** Medium-High  
**Owner phase:** P6

`tests/e2e/search.spec.ts` contains expectations that no longer match the current UI, including outdated reseller-form/detail selectors/text.

Required future evidence:

- updated stable selectors;
- critical business-flow E2E suite.

### QG-008 — Deployment does not require full QA

**Severity:** High  
**Owner phase:** P6

The GitHub Pages workflow currently builds and deploys from `main` without requiring lint, full tests and critical E2E success.

Required future evidence:

- CI job graph;
- intentionally failing test blocks deploy;
- successful pipeline publishes expected artifact.

---

## QA policy for V2 phases

For each functional phase:

1. define acceptance criteria before implementation;
2. identify existing tests affected;
3. add/modify automated tests with the behavior change;
4. verify cross-surface financial consistency where relevant;
5. record evidence and unresolved gaps here;
6. do not mark the phase done solely from visual inspection.
