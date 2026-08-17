# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P7 — Complete incomplete UX flows / operational refinement**  
**State:** `IN_PROGRESS`

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7-S1 — Operational UX gap inventory and prioritization: `DONE`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source needed for `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. Dexie remains **V4** and D-016 remains authoritative: no backend, authentication, cloud database or synchronization is part of the accepted foundation.

P1–P3 define lifecycle, audit/correction and financial semantics. P5 provides the complete local backup/checkpoint/atomic-restore path. P6 provides the mandatory repository-wide `qa:critical` integration/publication gate.

`develop` at the start of P7-S1 was `9fbd44278bef59d9bd7256c1839f2972bf46e0a8`; `main` remained unchanged at `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

## P7-S1 completed inventory

P7-S1 inspected the current operator-facing routes and existing component/integration/E2E coverage against the P1–P6 contracts and the Project Spec objective that routine desktop/mobile operations should require few steps.

The inventory deliberately separates **broken/misleading/high-friction workflow behavior** from visual or speculative preferences.

### Priority 1 — transaction-entry intent and feedback

Three issues form one coherent, high-frequency financial-entry gap:

1. `TransactionForm` renders a visible **Cancelar** action, but `TransactionsPage` passes an `onCancel` handler that intentionally performs no action. Entered values remain unchanged, so a primary operator control is inert.
2. `TransactionForm` catches mutation failures and writes only to `console.error`. The domain hook can legitimately reject a write — for example invalid/inactive references or persistence failures — but the operator receives no visible failure state and may not know whether the financial entry was recorded.
3. The command-center action labelled **“Novo Lançamento: Pagamento/Sinal”** always navigates to `?type=payment`. A signal therefore opens as payment unless the operator notices and manually changes the type, creating avoidable audit/classification risk even though both types share credit financial effect.

This cluster is the accepted first implementation slice because it combines high routine frequency with direct financial-entry intent/error risk and can be fixed without schema or business-rule changes.

### Priority 2 — invalid statement range silently falls back to all-time view

On the reseller detail page, a complete but inverted date range makes `periodStatement` null. The screen then falls back to current balance plus all transactions while the invalid dates remain visibly filled. The error appears only when **Gerar PDF** is clicked. This is misleading because the on-screen history can look filtered when it is actually all-time.

### Priority 3 — recovery page top-level copy is stale

`BackupPage` still says the file is validated “antes da futura restauração” and that the preflight “não substitui os dados atuais”. P5-S2 already exposes real restore after preflight with checkpoint and atomic rollback protection. The inner restore component/dialog is correct; the stale page-level copy can misrepresent a destructive recovery capability.

### Priority 4 — save failures are silent in item/reseller forms

`ItemForm` and `ResellerForm` also catch mutation failures with console-only logging. These are genuine feedback gaps, but they carry less direct financial risk than transaction entry and therefore follow the first slice.

### Priority 5 — reseller-context launch friction

A reseller detail page has the reseller identity already selected, but starting a new order/payment requires navigating to `/transactions` and selecting the reseller again. This conflicts with the “few steps” usability objective, but it is convenience/friction rather than correctness and is therefore below the misleading/error-feedback gaps.

### Not prioritized by P7-S1

The inventory found no current evidence sufficient to prioritize broad visual redesign, dashboard rearrangement, theme changes, table-density preferences or a catalog-search feature. Those may be useful later, but current code/tests/product evidence does not establish operational impact strongly enough to outrank the gaps above.

## P7-S1 decision and validation

D-020 accepts the prioritization rule: P7 fixes evidenced broken/misleading operator controls and intent/error risks before convenience or cosmetic refinement. The first implementation slice is limited to the transaction-entry cluster above.

No runtime, schema, persistence, financial-domain, recovery or QA-workflow code changed in P7-S1.

Persistent Critical QA run **`32066802100` — PASS** on the canonical P7-S1 documentation/content head before validation evidence was appended.

## P6 QA contract remains active

Canonical repository validation remains:

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

Every P7 implementation must preserve P1–P6 contracts and pass this persistent gate. P7-S1 itself is documentation/evidence work; integration still requires the same CI gate under D-019.

## Remaining high-priority risks

1. Transaction-entry controls can lose/corrupt operator intent through inert cancel, silent failure and ambiguous payment/signal shortcut — P7-S2.
2. Invalid reseller statement ranges can silently display all-time data under filled invalid dates — later P7 slice.
3. Backup page-level recovery copy is stale relative to P5-S2 — later P7 slice.
4. Item/reseller save failures remain console-only — later P7 slice.
5. Reseller-context transaction launch remains higher-friction than the product objective — later P7 slice.
6. Real store requirements discovery may later reopen D-016 — P8 only.

## Active constraints entering P7-S2

- do not work directly on `main` or the original repository;
- preserve all P1–P6 business, recovery and QA/deployment contracts;
- do not weaken or bypass `qa:critical`;
- D-016 local-first Dexie V4 remains accepted;
- do not add new business modules during P7;
- do not begin P8 requirements discovery;
- do not bundle lower-priority P7 gaps into the first implementation slice;
- preserve transaction financial semantics, correction/reversal semantics and occurrence-date rules.

## NEXT_ACTION

**P7-S2 — Reliable transaction-entry intent and feedback. Create a new feature branch from `develop` and change only the existing transaction-entry UX: make the standalone `Cancelar` action actually clear/reset the in-progress transaction form while preserving the requested initial type; surface transaction mutation failures visibly to the operator while preserving entered values for retry; and split the command-center `Pagamento/Sinal` shortcut into distinct payment and signal actions that open the form with the intended type. Add focused component/integration coverage for reset, error feedback and shortcut/type intent, plus a bounded Playwright path for the operator-visible shortcut/cancel behavior. Run the full `npm run qa:critical` gate. Do not change financial calculations, schema, persistence, correction/reversal behavior, backup/restore, other P7 gaps, or begin P8.**

## P7 completion direction

P7 closes only after the prioritized evidenced UX gaps are implemented in bounded slices with targeted tests and the persistent Critical QA gate remains green.
