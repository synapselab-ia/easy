# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records verified quality evidence, known gaps and required validation by phase.

---

## P0 — State and governance

P0 established the canonical document set and reconstructable project state. No runtime test command was represented as evidence for P0.

---

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

### P1-S1

Verified reseller active-default migration, archive/reactivate lifecycle, hard-delete guarding, historical attribution and inactive/missing reseller rejection.

Evidence: GitHub Actions run `32037965651`.

### P1-S2

Verified item active-default migration, archive/reactivate lifecycle, hard-delete guarding, inactive item behavior, historical snapshots and order guards.

Evidence: GitHub Actions run `32038951903`.

### P1-S3

Verified strict new-transaction reference matrix, complete V1 → V2 → V3 preservation, historical unresolved-reference preservation and P1 regressions.

Evidence: GitHub Actions run `32039763539`.

P1 is closed.

---

## P2-S1 — Audited transaction reversal

**Runtime code changed:** Yes.  
**Database schema version changed:** No; remains Dexie V3.  
**UI behavior changed:** Yes, reseller-history reversal/status/audit metadata.

### Reversal mutation verified

- [x] original transaction row remains stored after reversal;
- [x] original type, value, observation, snapshot and `createdAt` remain unchanged;
- [x] mandatory reason is enforced below the UI;
- [x] persisted reason is trimmed;
- [x] reversal timestamp is persisted as an ISO string;
- [x] missing transaction is rejected;
- [x] already reversed transaction cannot be reversed again;
- [x] physical deletion is no longer the correction mutation used by the slice.

### Shared financial semantics verified

- [x] effective order contributes positive value;
- [x] effective payment/signal contributes negative value;
- [x] reversed transaction contributes zero while remaining stored;
- [x] shared `calculateBalance`/effective-transaction rules are covered directly.

### Cross-surface consistency verified

- [x] reseller total balance ignores reversed transactions;
- [x] reseller date-filtered balance ignores reversed transactions without hiding audit rows;
- [x] dashboard total debt ignores reversed transactions;
- [x] today-order count/volume ignore reversed orders;
- [x] debt-aging calculations ignore reversed movements;
- [x] performance revenue/ranking ignore reversed movements;
- [x] global-search reseller balance ignores reversed movements;
- [x] reseller history retains reversed rows and shows status/reason/timestamp;
- [x] PDF retains reversed rows and exposes `Válido`/`Estornado` plus reversal reason;
- [x] PDF balance input from reseller detail is reversal-aware.

### UI correction flow verified

- [x] effective row offers `Estornar`;
- [x] confirmation explains original history is preserved;
- [x] confirmation is disabled until a reason is entered;
- [x] mutation receives transaction ID and reason;
- [x] already reversed row displays audit metadata and no second reversal action.

### Regression evidence

The same gate passed:

- P1 database migration tests;
- reseller lifecycle hooks;
- item lifecycle hooks;
- transaction form reference/lifecycle tests;
- Command Center lifecycle tests;
- reseller page integration;
- item page integration;
- production build.

### Automated evidence

GitHub Actions validation run: `32041280504` on `feature/p2-s1-audited-reversal`.

Targeted P2-S1 files:

- `src/domain/transactions.test.ts`;
- `src/hooks/useTransactions.test.tsx`;
- `src/components/transactions/TransactionTable.test.tsx`;
- `src/hooks/useDashboard.test.tsx`;
- `src/hooks/useSearch.test.tsx`;
- `src/pages/ResellerDetailPage.test.tsx`;
- `src/services/pdfService.test.ts`.

P1 regression files:

- `src/db/database.test.ts`;
- `src/hooks/useResellers.test.tsx`;
- `src/hooks/useItems.test.tsx`;
- `src/components/transactions/TransactionForm.test.tsx`;
- `src/components/search/CommandCenter.test.tsx`;
- `src/pages/ResellersPage.test.tsx`;
- `src/pages/ItemsPage.test.tsx`.

Build evidence:

- `npm run build` — PASS on run `32041280504`.

### P2-S1 QA result

**PASS for the canonical P2-S1 scope. P2 remains IN_PROGRESS.**

The first audited correction primitive is coherent across the inventoried financial surfaces. Explicit original/replacement linkage, guided wrong-value/wrong-reseller correction and actor-attribution strategy remain P2-S2.

---

## Global baseline caveat

Targeted P1/P2 gates do **not** claim the repository-wide quality baseline is green.

Pre-existing diagnostics recorded during P1 showed lint and Vitest debt outside these slices. P6 owns full suite reconciliation and deployment gating.

---

## Known baseline QA gaps

### QG-001 — Reseller referential integrity

**Severity:** Critical  
**Owner:** P1  
**Status:** RESOLVED

### QG-002 — Historical item references

**Severity:** High  
**Owner:** P1  
**Status:** RESOLVED

### QG-003 — Financial correction flow

**Severity:** Critical  
**Owner:** P2  
**Status:** PARTIALLY RESOLVED / P2 IN_PROGRESS

P2-S1 resolves the destructive-delete problem for the first correction path: reversal preserves the original, requires reason/timestamp, remains visible and is financially neutral across the inventoried surfaces.

Still required:

- explicit original/replacement linkage;
- guided wrong-value correction;
- guided wrong-reseller correction;
- future actor-attribution strategy;
- final P2 acceptance across all required correction cases.

### QG-004 — Date semantics

**Severity:** High  
**Owner:** P3  
**Status:** OPEN

Transactions still use `createdAt` for financial date semantics. `reversal.reversedAt` is audit-only and does not resolve P3.

### QG-005 — Period statement semantics

**Severity:** High  
**Owner:** P3  
**Status:** OPEN

Current period balance remains net movement in the filter window, not formal opening/closing semantics.

### QG-006 — Backup validation depth

**Severity:** High  
**Owner:** P5  
**Status:** OPEN

Backup validation remains structurally shallow. P2-S1 reversal metadata is JSON-serializable but this does not constitute P5 hardening.

### QG-007 — Stale/global test expectations

**Severity:** Medium-High  
**Owner:** P6  
**Status:** OPEN

### QG-008 — Deployment does not require full QA

**Severity:** High  
**Owner:** P6  
**Status:** OPEN

### QG-009 — Remaining reference validation/migration

**Severity:** High  
**Owner:** P1  
**Status:** RESOLVED

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
