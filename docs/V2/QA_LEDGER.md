# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records verified quality evidence, known gaps and required validation by phase.

---

## P0 — State and governance

P0 established the canonical document set and reconstructable project state. No runtime test command was represented as evidence for P0.

---

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

- P1-S1 reseller lifecycle/integrity — evidence `32037965651`.
- P1-S2 item lifecycle/integrity — evidence `32038951903`.
- P1-S3 strict reference matrix and V1 → V2 → V3 preservation — evidence `32039763539`.

P1 is closed.

---

## P2-S1 — Audited transaction reversal

**Runtime changed:** Yes.  
**Schema version changed:** No; remains Dexie V3.  
**UI changed:** Yes.

### Verified

- original transaction remains stored and unchanged after reversal;
- mandatory trimmed reason and ISO reversal timestamp;
- no double reversal;
- reversed row remains visible with zero financial effect;
- history/PDF expose audit status and reason;
- reseller balance, dashboard total/today/aging/performance and search balances ignore reversed effect;
- P1 regressions and production build pass.

Evidence: GitHub Actions run `32041280504` — PASS.

P2-S1 result: **PASS**. Pure cancellation/reversal is complete.

---

## P2-S2 — Linked/guided correction replacement

**Runtime changed:** Yes.  
**Schema version changed:** No; remains Dexie V3.  
**UI changed:** Yes, guided correction from reseller history.

### Atomicity and linkage verified

- [x] original must exist and be effective;
- [x] correction reason remains mandatory;
- [x] reversal + replacement are performed in one Dexie RW transaction;
- [x] original reversal stores `replacementTransactionId`;
- [x] replacement stores `correction.replacesTransactionId`;
- [x] invalid replacement rolls the entire operation back;
- [x] original business fields remain independently inspectable;
- [x] normal transaction creation strips forged reversal/correction metadata.

### Guided correction verified

- [x] wrong-value payment/signal can be replaced with a corrected amount;
- [x] wrong-reseller entry can move financial effect to another active reseller;
- [x] replacement transaction type is preserved;
- [x] order replacement preserves original item identity and observation;
- [x] order corrected total is derived from quantity × unit price;
- [x] changing the order item through the guided slice is rejected;
- [x] inactive replacement reseller is rejected;
- [x] unavailable/inactive original order item blocks guided recreation while pure P2-S1 reversal remains available;
- [x] P1 active-reference validation applies to replacement creation.

### Cross-surface consistency verified

- [x] linked pair contributes only the effective replacement to shared balance rules;
- [x] dashboard total/today-order semantics count the replacement rather than the reversed original;
- [x] wrong-reseller correction removes financial effect from the old reseller and applies it to the intended reseller in search balances;
- [x] reseller detail P2-S1 behavior remains green;
- [x] history shows both linkage directions;
- [x] PDF shows both linkage directions while retaining original/replacement rows.

### Actor-attribution gate

- [x] a provider-neutral future `actorRef` strategy is documented;
- [x] no fake user/actor identity is introduced before P4;
- [x] existing audit rows without attribution remain valid by design.

### Automated evidence

Final successful GitHub Actions run: **`32042373332`** on `feature/p2-s2-linked-correction`.

Targeted P2 files passing in that run:

- `src/domain/transactions.test.ts`;
- `src/hooks/useTransactions.test.tsx`;
- `src/components/transactions/TransactionCorrectionDialog.test.tsx`;
- `src/components/transactions/TransactionTable.test.tsx`;
- `src/hooks/useDashboard.test.tsx`;
- `src/hooks/useSearch.test.tsx`;
- `src/services/pdfService.test.ts`;
- `src/pages/ResellerDetailPage.test.tsx`.

P1 regressions passing in the same gate:

- `src/db/database.test.ts`;
- `src/hooks/useResellers.test.tsx`;
- `src/hooks/useItems.test.tsx`;
- `src/components/transactions/TransactionForm.test.tsx`;
- `src/components/search/CommandCenter.test.tsx`;
- `src/pages/ResellersPage.test.tsx`;
- `src/pages/ItemsPage.test.tsx`.

Build: `npm run build` — PASS in run `32042373332`.

An earlier run `32042303986` stopped on two Testing Library assertions that targeted split text nodes in the new dialog. Domain and atomic-mutation gates were already green; the assertions were corrected without changing runtime behavior, then the complete gate passed in `32042373332`.

### P2-S2 QA result

**PASS. P2 correction/reversal acceptance gates are reconciled and P2 can close.**

Required cases now map to validated flows:

- duplicate payment / pure cancellation → P2-S1 reversal;
- old-order reversal → P2-S1 reversal;
- wrong value → P2-S2 linked replacement;
- wrong reseller → P2-S2 linked replacement.

---

## Global baseline caveat

Targeted P1/P2 gates do **not** claim the repository-wide quality baseline is green. Pre-existing lint/Vitest/E2E debt remains owned by P6.

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
**Status:** RESOLVED

P2-S1 provides audited pure reversal. P2-S2 provides atomic, linked wrong-value/wrong-reseller replacement. History/PDF remain auditable and financial consumers count only effective entries. Evidence: `32041280504`, `32042373332`.

### QG-004 — Date semantics
**Severity:** High  
**Owner:** P3  
**Status:** OPEN

Transactions still use `createdAt` for current financial-date behavior. P2 `reversal.reversedAt` is audit-only.

### QG-005 — Period statement semantics
**Severity:** High  
**Owner:** P3  
**Status:** OPEN

Current period balance remains net movement in the filter window, not formal opening/closing semantics.

### QG-006 — Backup validation depth
**Severity:** High  
**Owner:** P5  
**Status:** OPEN

Current backup serialization carries optional P2 metadata, but deep schema/reference/value/version validation remains unimplemented.

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
