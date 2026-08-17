# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records verified quality evidence, known gaps and required validation by phase.

---

## P0 — State and governance

**Runtime code changed:** No.  
**Database schema changed:** No.  
**UI behavior changed:** No.

P0 established the canonical document set and reconstructable project state. No runtime test command was represented as evidence for P0.

---

## P1-S1 — Safe reseller lifecycle

**Runtime code changed:** Yes.  
**Database schema changed:** Yes, Dexie V1 → V2.  
**UI behavior changed:** Yes.

### Result

**PASS for canonical P1-S1 scope.**

Verified:

- reseller active-default migration;
- archive/reactivate lifecycle;
- hard-delete protection with financial history;
- inactive reseller search/detail/history availability;
- inactive/missing reseller rejection for new transactions;
- reseller integration and production build.

GitHub Actions evidence: run `32037965651`.

---

## P1-S2 — Safe item lifecycle

**Runtime code changed:** Yes.  
**Database schema changed:** Yes, Dexie V2 → V3.  
**UI behavior changed:** Yes.

### Result

**PASS for canonical P1-S2 scope.**

Verified:

- item active-default migration without reseller lifecycle regression;
- archive/reactivate lifecycle;
- hard-delete protection with transaction references;
- inactive item catalog/search visibility;
- active-only new-order selection;
- inactive/missing item rejection when referenced by a new order;
- historical item snapshot preservation;
- reseller lifecycle regression and production build.

GitHub Actions evidence: run `32038951903`.

---

## P1-S3 — Referential validation and migration

**Runtime code changed:** Yes, transaction creation reference validation only.  
**Database schema changed:** No; schema remains Dexie V3.  
**UI behavior changed:** No.

### Explicit reference acceptance matrix verified

For new transaction creation:

- [x] reseller ID must be a positive integer;
- [x] reseller must exist;
- [x] reseller must be active;
- [x] new `order` requires a positive `itemId`;
- [x] referenced order item must exist;
- [x] referenced order item must be active;
- [x] new-order `itemName` snapshot is derived from the resolved item identity;
- [x] new `payment`/`signal` rejects `itemId` references.

For existing historical data/migration:

- [x] V1 → V2 → V3 preserves entity/transaction row counts;
- [x] entity and transaction IDs are preserved;
- [x] dates are preserved;
- [x] explicit inactive lifecycle state is preserved;
- [x] missing lifecycle state receives the existing active default;
- [x] transaction snapshots are preserved without reinterpretation;
- [x] a historical unresolved item reference with a stored snapshot remains stored/readable rather than being deleted or repaired destructively.

### Regression evidence

The same targeted gate also passed:

- reseller lifecycle hooks;
- item lifecycle hooks;
- search lifecycle tests;
- transaction form tests;
- Command Center tests;
- reseller page integration;
- item page integration;
- reseller-detail historical snapshot tests;
- production build.

### Automated evidence

GitHub Actions validation run: `32039763539` on `feature/p1-s3-referential-validation`.

Targeted passing test files:

- `src/db/database.test.ts`;
- `src/hooks/useTransactions.test.tsx`;
- `src/hooks/useResellers.test.tsx`;
- `src/hooks/useItems.test.tsx`;
- `src/hooks/useSearch.test.tsx`;
- `src/components/transactions/TransactionForm.test.tsx`;
- `src/components/search/CommandCenter.test.tsx`;
- `src/pages/ResellersPage.test.tsx`;
- `src/pages/ItemsPage.test.tsx`;
- `src/pages/ResellerDetailPage.test.tsx`.

Build evidence:

- `npm run build` — PASS on run `32039763539`.

### P1-S3 QA result

**PASS. P1 referential-integrity/lifecycle acceptance gates are reconciled and P1 can close.**

P1-S3 deliberately does not apply new-creation guards to historical rows or backup restore. Deep validation of imported backup content remains P5, while transaction correction/reversal begins in P2.

---

## Global baseline caveat

P1 does **not** claim the repository-wide quality baseline is green.

Pre-existing diagnostics recorded during P1-S1 included repository-wide lint and Vitest failures outside the targeted P1 slices. Those were not expanded into P1 fixes because P6 owns general test/CI reconciliation.

All P1 completion claims therefore refer to the targeted phase gates plus successful production builds, not a globally clean suite.

---

## Known baseline QA gaps

### QG-001 — Reseller referential integrity

**Severity:** Critical  
**Owner phase:** P1-S1  
**Status:** RESOLVED

Reseller lifecycle, historical attribution, hard-delete guarding and new-transaction reseller validation are covered by P1-S1/P1-S3 evidence.

### QG-002 — Historical item references

**Severity:** High  
**Owner phase:** P1-S2  
**Status:** RESOLVED

Item lifecycle, hard-delete guarding, historical snapshots and new-order item validation are covered by P1-S2/P1-S3 evidence.

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

### QG-005 — Period statement semantics

**Severity:** High  
**Owner phase:** P3  
**Status:** OPEN

The current period balance represents net movement inside the filter window, not a formally defined opening/closing statement.

### QG-006 — Backup validation depth

**Severity:** High  
**Owner phase:** P5  
**Status:** OPEN

Backup import remains structurally shallow and can bypass new-activity mutation guards by directly restoring historical rows. P5 must validate fields, references, duplicates and schema compatibility before destructive replacement.

### QG-007 — Stale/global test expectations

**Severity:** Medium-High  
**Owner phase:** P6  
**Status:** OPEN

Repository-wide unit/integration/E2E reconciliation remains required.

### QG-008 — Deployment does not require full QA

**Severity:** High  
**Owner phase:** P6  
**Status:** OPEN

GitHub Pages deployment still builds/publishes from `main` without requiring the full quality suite.

### QG-009 — Remaining reference validation/migration

**Severity:** High  
**Owner phase:** P1-S3  
**Status:** RESOLVED

P1-S3 defines/enforces the remaining new-transaction reference matrix and proves the complete P1 migration path while preserving historical snapshots. Evidence: run `32039763539`.

---

## QA policy for V2 phases

For each functional phase:

1. define acceptance criteria before implementation;
2. identify existing tests affected;
3. add/modify automated tests with the behavior change;
4. verify cross-surface financial consistency where relevant;
5. record evidence and unresolved gaps here;
6. do not mark a phase done solely from visual inspection;
7. distinguish targeted phase gates from repository-wide QA health.
