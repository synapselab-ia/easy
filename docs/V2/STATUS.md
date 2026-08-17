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
- P7-S2 — Reliable transaction-entry intent and feedback: `DONE`.

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

P1–P3 define entity lifecycle, audit/correction and financial semantics. P5 provides versioned backup plus checkpointed atomic restore. P6/D-019 requires the repository-wide `npm run qa:critical` gate for V2 integration and publication. P7/D-020 addresses evidenced operator-intent/error risks before convenience or cosmetic refinement.

At the start of P7-S2, `develop` was `7269bb435d91bbde45ffa835bacf0d373dfa14e6`; `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

## P7-S2 completed transaction-entry slice

P7-S2 resolved the highest-ranked P7-S1 operational cluster without changing transaction financial semantics, Dexie schema, persistence, reversal/correction, backup/restore or any lower-ranked P7 flow.

### Cancel now has real standalone behavior

`TransactionForm` owns its reset operation. **Cancelar** now clears reseller, occurrence-date editing state, order/payment fields, observation, validation/mutation state and returns the movement type to the requested `initialType`. The standalone `TransactionsPage` no longer supplies the previous inert no-op callback.

This preserves shortcut intent: a form opened as `signal` returns to `signal` after Cancel rather than silently falling back to `order` or retaining edited data.

### Create failures are visible and retry-safe

A rejected transaction mutation now produces `toast.error` with the domain/persistence error instead of console-only logging. Failure does **not** call the reset path: reseller/item/value/date inputs remain available so the operator can correct the condition and retry without reconstructing the financial entry.

Successful creation continues to use the existing P1/P3 validation path and resets the form only after the write succeeds.

### Payment and signal shortcut intent is explicit

The command center no longer exposes one ambiguous `Pagamento/Sinal` action that always initializes `payment`. It now has distinct actions:

- `Novo Lançamento: Pagamento` → `/transactions?type=payment`;
- `Novo Lançamento: Sinal` → `/transactions?type=signal`.

The transaction page continues to consume the existing `type` query parameter; no financial rule distinguishes the signed effect introduced by this UX change.

## P7-S2 validation

Functional persistent Critical QA run **`32069261401`**, job `95508465043` — **PASS**:

- ESLint: **0 errors / 78 warnings**; existing warning policy remains unchanged;
- Vitest: **39 files / 163 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Two earlier runs (`32068747287` and `32069051473`) failed only in the newly added Cancel unit assertion. Investigation showed the test harness modeled the controlled select with invalid `<span>` children inside `<select>`, causing jsdom to retain the first option when value became empty. The harness was corrected to valid controlled-select HTML; runtime behavior was not weakened to satisfy the test.

## Remaining prioritized P7 gaps

1. **Invalid reseller statement range** can leave inverted dates filled while the screen falls back to current/all-time data — next slice.
2. Backup page-level recovery copy is stale relative to implemented P5-S2 restore.
3. Item/reseller save failures remain console-only.
4. Reseller-context transaction launch still requires redundant reseller reselection.
5. P8 real-store discovery remains outside P7 and may reopen D-016 only with evidence.

## Active constraints entering P7-S3

- do not work directly on `main` or the original repository;
- preserve all P1–P6 contracts and D-020 prioritization;
- do not weaken or bypass `qa:critical`;
- keep D-016 local-first Dexie V4;
- do not change D-015 statement arithmetic or PDF financial calculations;
- do not bundle Backup copy, item/reseller save feedback or reseller-context launch into P7-S3;
- do not begin P8 discovery or new modules.

## NEXT_ACTION

**P7-S3 — Explicit invalid reseller statement-range state. Create a new feature branch from `develop` and change only the reseller-detail period-filter UX so a complete inverted date range is visibly invalid immediately and never silently falls back to current/all-time balance or transaction history while the invalid dates remain filled. Preserve D-015 opening → movements → closing semantics for every valid range; disable/guard PDF while the range is invalid; provide explicit operator-visible guidance that is cleared when the range is corrected or removed; and add focused component/integration coverage plus one bounded Playwright proof of the invalid→corrected flow. Run the full `npm run qa:critical` gate. Do not change statement/PDF financial calculations, Backup copy, item/reseller save feedback, reseller-context launch, schema/persistence, correction/reversal behavior or begin P8.**

## P7 completion direction

P7 closes only after the remaining evidenced gaps are completed in bounded slices with targeted coverage and the persistent Critical QA gate remains green.
