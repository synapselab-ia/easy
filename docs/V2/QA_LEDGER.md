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

No runtime test command was executed as part of P0 because P0 changes documentation only and the initial ChatGPT/GitHub workflow did not provide a checked-out runtime environment in that step.

This was never evidence that the existing test suite passed.

---

## P1-S1 — Safe reseller lifecycle

**Runtime code changed:** Yes.  
**Database schema changed:** Yes, Dexie V1 → V2.  
**UI behavior changed:** Yes, reseller archive/reactivation and inactive-state handling.

### Acceptance behavior verified

- [x] existing resellers migrate to active by default;
- [x] new resellers default to active;
- [x] reseller archive is reversible and does not delete the identity;
- [x] physical deletion is rejected when financial history exists;
- [x] physical deletion remains possible for an unused reseller with no transactions;
- [x] archived resellers remain searchable and explicitly identifiable as inactive;
- [x] archived reseller detail/history remains accessible;
- [x] inactive resellers are excluded from the new-transaction selector;
- [x] transaction mutation rejects inactive resellers independently of the UI;
- [x] transaction mutation rejects missing resellers;
- [x] reseller list integration covers create/search/edit/archive/reactivate;
- [x] production build succeeds after the slice.

### Automated evidence

GitHub Actions validation run: `32037965651` on `feature/p1-s1-reseller-lifecycle`.

Targeted passing test files:

- `src/db/database.test.ts`;
- `src/hooks/useResellers.test.tsx`;
- `src/hooks/useTransactions.test.tsx`;
- `src/hooks/useSearch.test.tsx`;
- `src/components/transactions/TransactionForm.test.tsx`;
- `src/components/search/CommandCenter.test.tsx`;
- `src/pages/ResellersPage.test.tsx`;
- `src/pages/ResellerDetailPage.test.tsx`.

Build evidence:

- `npm run build` — PASS on run `32037965651`.

### Global baseline caveat

P1-S1 does **not** claim the repository-wide quality baseline is green.

During P1-S1 diagnostics, the pre-existing baseline showed:

- lint debt with 61 reported errors across legacy/unrelated files and existing patterns;
- full Vitest baseline with 22 test files: 14 passed and 8 failed; 71 tests: 54 passed and 17 failed at that diagnostic point;
- failures included unrelated router/basename, dashboard mock/expectation, layout/environment and other legacy test issues.

Those failures were not expanded into P1-S1 fixes because P6 owns general test/CI reconciliation. The P1-S1 gate was therefore scoped to files covering the changed reseller lifecycle plus a successful production build.

### P1-S1 QA result

**PASS for the canonical P1-S1 scope.**

The original critical reseller-orphaning path is closed for normal lifecycle use and guarded at the data mutation layer. Item lifecycle and broader reference validation remain separate P1 work.

---

## Known baseline QA gaps

### QG-001 — Reseller referential integrity

**Severity:** Critical  
**Owner phase:** P1-S1  
**Status:** RESOLVED for the reseller lifecycle/deletion path

P1-S1 replaces normal destructive reseller removal with archive/reactivate, preserves historical identity and blocks hard deletion when transactions exist. New transactions also reject inactive/missing resellers.

Evidence is recorded in the P1-S1 section above.

### QG-002 — Historical item references

**Severity:** High  
**Owner phase:** P1-S2  
**Status:** OPEN

Physical item deletion can leave historical transactions pointing to a removed item ID, even though `itemName` snapshots mitigate display loss.

Required future evidence:

- item lifecycle tests;
- historical order preservation tests.

### QG-003 — Financial correction flow

**Severity:** Critical  
**Owner phase:** P2  
**Status:** OPEN

A physical delete mutation exists for transactions, but the application lacks a deliberate audited correction/reversal workflow.

Required future evidence:

- reversal calculation tests;
- duplicate/wrong-reseller/error-entry cases;
- PDF/dashboard consistency after reversal.

### QG-004 — Date semantics

**Severity:** High  
**Owner phase:** P3  
**Status:** OPEN

Transactions currently have only `createdAt`; occurrence time and record-creation time are not distinct.

Required future evidence:

- historical entry tests;
- date-boundary tests;
- timezone/date filtering tests where applicable.

### QG-005 — Period statement semantics

**Severity:** High  
**Owner phase:** P3  
**Status:** OPEN

The current period balance represents net movement inside the filter window, not a formally defined opening and closing balance statement.

Required future evidence:

- opening balance cases;
- mixed order/payment interval cases;
- PDF vs on-screen equality.

### QG-006 — Backup validation depth

**Severity:** High  
**Owner phase:** P5  
**Status:** OPEN

Backup import validates broad structure but does not deeply verify every field/reference/schema relationship before replacing current data.

Required future evidence:

- malformed data tests;
- invalid references;
- duplicate IDs;
- incompatible versions;
- full clean restore comparison.

### QG-007 — Stale/global test expectations

**Severity:** Medium-High  
**Owner phase:** P6  
**Status:** OPEN

The repository contains stale or environment-dependent unit/integration/E2E expectations outside the P1-S1 slice, including historical search/UI selectors and other baseline failures observed during P1-S1 diagnostics.

Required future evidence:

- reconciled unit/integration suite;
- updated stable E2E selectors;
- critical business-flow E2E suite.

### QG-008 — Deployment does not require full QA

**Severity:** High  
**Owner phase:** P6  
**Status:** OPEN

The GitHub Pages workflow currently builds and deploys from `main` without requiring lint, full tests and critical E2E success.

Required future evidence:

- CI job graph;
- intentionally failing test blocks deploy;
- successful pipeline publishes expected artifact.

### QG-009 — Remaining reference validation/migration

**Severity:** High  
**Owner phase:** P1-S3  
**Status:** OPEN

P1-S1 protects reseller creation/deletion references, but P1 still needs to reconcile the completed lifecycle migrations and remaining invalid-reference cases after P1-S2.

Required future evidence:

- old valid databases migrate through the complete P1 schema path without loss;
- remaining invalid new references are rejected;
- migration/reference edge cases are automated.

---

## QA policy for V2 phases

For each functional phase:

1. define acceptance criteria before implementation;
2. identify existing tests affected;
3. add/modify automated tests with the behavior change;
4. verify cross-surface financial consistency where relevant;
5. record evidence and unresolved gaps here;
6. do not mark the phase done solely from visual inspection;
7. distinguish a targeted phase gate from repository-wide QA health.
