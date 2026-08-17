# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records targeted phase evidence and the current repository-wide critical QA state.

## P0

State/governance established; no runtime QA claim.

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

- P1-S1: `32037965651`.
- P1-S2: `32038951903`.
- P1-S3: `32039763539`.

## P2 — Correction/reversal

**Status:** PASS / DONE.

- P2-S1 audited reversal: `32041280504`.
- P2-S2 linked/guided replacement: `32042373332`.

## P3 — Dates, statements and aging

**Status:** PASS / DONE.

- P3-S1 occurrence-date model: `32052076684`.
- P3-S2 formal statements/FIFO debt aging: `32053837309`.

## P4 — Persistence architecture decision

**Status:** PASS / DONE.  
Decision-only gate; D-016 accepts local-first/single-user Dexie V4. No runtime test claim.

## P5 — Backup, restore and migration

**Status:** PASS / DONE.

- P5-S1 versioned backup/preflight: `32058028793` — PASS.
- P5-S2 checkpointed atomic restore/migration proof: `32060729538` — PASS.

P5 recovery validation covers v2/v1 migration, checkpoint-before-write, one-transaction replacement, in-transaction restored-data verification, rollback on write failure and preservation of P1/P2/P3 IDs/history/financial semantics.

## P6 — Tests, CI and deployment safety

**Status:** PASS / DONE.

Initial repository-wide baseline was captured before changing expectations:

- ESLint: 81 errors;
- Vitest: 10 failed / 149 passed;
- Playwright Chromium: 10 failed / 3 passed;
- production build: PASS.

Stale provider/router/mock/jsdom expectations and obsolete selectors were reconciled. One real global-search double-filter defect was fixed. The accepted critical command is:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

- persistent functional run `32064801009` — PASS;
- final canonical-docs-head run `32065331102` — PASS;
- post-merge `develop` run `32065713920` — PASS.

Current accepted gate state at P6 closure: 0 blocking lint errors / 80 recorded warnings, 39 Vitest files / 159 tests passing, 13/13 Playwright tests passing, production build passing.

Known non-blocking maintenance debt remains recorded: lint warnings, some React test-harness warnings and dependency-audit findings. These do not redefine the Critical QA exit status.

## P7 — Operational UX refinement

### P7-S1 — UX gap inventory and prioritization

**Status:** PASS / DONE as evidence/prioritization work.  
**Runtime changed:** No.  
**Schema/persistence changed:** No.  
**Financial behavior changed:** No.

P7-S1 inspected current operator-facing code and existing test coverage rather than inferring gaps from appearance alone.

#### Evidence inspected

- `src/App.tsx`, `MainLayout`, sidebar/header and command center for navigation/entry points;
- `TransactionsPage`, `TransactionForm`, `useTransactions` and transaction integration tests;
- reseller detail statement/PDF UI and Playwright date-filter coverage;
- item/reseller forms/tables and lifecycle behavior;
- Backup page, import/export restore component/dialog and P5-S2 restore tests;
- current Playwright suite inventory: search, PDF date filter and performance analysis;
- Project Spec usability objective: routine operations should require few steps on desktop/mobile.

#### QG-011 — transaction entry intent/feedback

**OPEN / P7-S2 — highest priority.**

Evidence:

- standalone `TransactionForm` renders **Cancelar**;
- `TransactionsPage.handleCancel()` intentionally performs no state/reset action;
- `TransactionForm` catches create failures with `console.error` only;
- `useCreateTransaction` can reject invalid/inactive references or persistence writes, so an operator-visible failure path is meaningful;
- command center labels one action `Pagamento/Sinal` but routes to `/transactions?type=payment` only;
- current component/integration tests prove order/payment happy paths but do not cover cancel/error feedback or signal shortcut intent;
- current E2E suite has no full transaction-entry operator path.

Risk: uncertainty about whether a financial write succeeded, inert primary action, and possible payment-vs-signal audit misclassification.

Accepted next slice: P7-S2.

#### QG-012 — invalid reseller period silently displays all-time/current data

**OPEN / later P7.**

Evidence:

- complete inverted dates make `periodStatement` null;
- `displayedTransactions` then falls back to the full transaction list and the balance card falls back to current balance while the invalid dates remain filled;
- Playwright verifies the error toast only after **Gerar PDF** is clicked.

Risk: operator can visually interpret an invalid-range screen as a filtered statement before attempting PDF generation.

#### QG-013 — stale Backup page recovery description

**OPEN / later P7.**

Evidence:

- `BackupPage` still describes validation “antes da futura restauração” and says the preflight stage does not replace current data;
- `ImportExport` and its P5-S2 tests already expose real `Restaurar Backup` behavior after successful preflight, with checkpoint and rollback-safe result handling.

Risk: misleading top-level guidance around a destructive recovery workflow. Inner restore dialog is already accurate.

#### QG-014 — item/reseller save failures are console-only

**OPEN / later P7.**

Evidence: both `ItemForm` and `ResellerForm` catch mutation failures and only log to the console, with no operator-visible error.

#### QG-015 — reseller-context transaction launch friction

**OPEN / later P7.**

Evidence: reseller detail has the reseller context, but no launch action/prefill path; transaction creation requires navigating to `/transactions` and selecting the reseller again. This is an efficiency gap, not a correctness defect.

#### Explicit non-findings

P7-S1 does not classify broad visual redesign, dashboard rearrangement, theme/branding changes, table-density preferences or speculative catalog search as QA/UX gaps without stronger evidence of operational impact.

### P7-S1 validation

Persistent Critical QA run **`32066802100`**, job `95500700733` — **PASS** on the canonical P7-S1 content head before this evidence line was appended.

Because P7-S1 changes documentation only, it makes no new runtime test claim. D-019 still requires the persistent `qa:critical` workflow to pass on the final PR head before integration. No test/workflow weakening is permitted to integrate the documentation change.

## Known baseline QA gaps

- QG-001 reseller referential integrity: RESOLVED / P1.
- QG-002 historical item references: RESOLVED / P1.
- QG-003 financial correction flow: RESOLVED / P2.
- QG-004 date semantics: RESOLVED / P3-S1.
- QG-005 period statement/aging semantics: RESOLVED / P3-S2.
- QG-006 backup validation/recovery depth: RESOLVED / P5.
- QG-007 stale/global test expectations: RESOLVED / P6.
- QG-008 deployment does not require full QA: RESOLVED / P6.
- QG-009 remaining reference validation/migration: RESOLVED / P1.
- QG-010 persistence architecture: RESOLVED / P4.
- QG-011 transaction-entry intent/feedback: OPEN / P7-S2.
- QG-012 invalid reseller period fallback: OPEN / later P7.
- QG-013 stale Backup page recovery copy: OPEN / later P7.
- QG-014 item/reseller save error feedback: OPEN / later P7.
- QG-015 reseller-context transaction launch friction: OPEN / later P7.

## QA policy entering P7-S2

P7-S2 must preserve all P1–P6 contracts, add targeted tests for the changed transaction-entry behavior, and pass the complete persistent `npm run qa:critical` gate. Do not weaken existing tests/workflows or use P7-S2 to implement lower-priority P7 gaps.
