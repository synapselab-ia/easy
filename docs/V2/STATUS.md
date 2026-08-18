# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
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
- P7-S3 — Explicit invalid reseller statement-range state: `DONE`.

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

At the start of P7-S3, `develop` was `5cb696a4c1eadbe46e0801922b0ad78b860f367f`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

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

## P7-S3 completed invalid-range slice

P7-S3 resolved QG-012 without changing statement arithmetic, PDF financial calculations, Dexie schema/persistence, correction/reversal behavior, backup/restore behavior or lower-ranked P7 flows.

### Invalid range is explicit instead of silently unfiltered

When both dates are filled and `startDate > endDate`, reseller detail now enters an explicit invalid state immediately:

- both date controls expose `aria-invalid` and reference visible guidance;
- the PDF action is disabled, with a defensive invalid-range guard retained in the handler;
- current balance / period summary is replaced by an invalid-period card with no financial value;
- transaction history is withheld rather than falling back to all-time movements;
- visible guidance tells the operator to correct or clear the range.

Correcting the inverted range removes the invalid state and restores the formal D-015 period statement. Clearing the range returns to the normal current-balance/all-history view.

### D-015 remains unchanged

Valid complete ranges still use the existing `buildStatementPeriod` opening → movements → closing model. P7-S3 added only page-state validation/orchestration around the existing domain calculation.

## P7-S3 validation and integration

Initial persistent Critical QA run **`32133265871`** — **FAIL** in one newly added component-test expectation. The corrected range covered March while the test fixture remained dated in February; the application correctly excluded that row. This was classified as a test-fixture error under D-019, and runtime behavior was not changed to satisfy it.

After aligning only the fixture with the corrected valid range, persistent Critical QA run **`32133559376`**, job **`95699734548`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **39 files / 164 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Final canonical documentation-head run **`32133891691`**, job **`95700749081`** — **PASS** on PR merge ref `ee5016cfc2b9d4c2823027127f939abebc5eb705`.

PR #15 was squash-merged into `develop` as `337de0b6cf18da7cf27c54648839624df46e66ef`. The validated PR merge ref and the squash integration commit both resolve to tree **`3f56eca7cfee1b99cb211a03e8070b956994f027`**, so the integrated P7-S3 content is byte-for-byte the content validated by the final gate. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing warning/dependency/test-harness debt remains non-blocking under D-019 and was not reclassified or hidden.

## Remaining prioritized P7 gaps

1. Backup page-level recovery copy is stale relative to implemented P5-S2 restore — next slice.
2. Item/reseller save failures remain console-only.
3. Reseller-context transaction launch still requires redundant reseller reselection.
4. P8 real-store discovery remains outside P7 and may reopen D-016 only with evidence.

## Active constraints entering P7-S4

- do not work directly on `main`;
- preserve all P1–P6 contracts and D-020 prioritization;
- do not weaken or bypass `qa:critical`;
- keep D-016 local-first Dexie V4;
- do not change P5 backup/restore mechanics while correcting operator-facing recovery copy;
- do not bundle item/reseller save feedback or reseller-context launch into P7-S4;
- do not begin P8 discovery or new modules.

## NEXT_ACTION

**P7-S4 — Align Backup recovery copy with the implemented P5-S2 restore flow. Create a new feature branch from the current `develop` after P7-S3 integration and change only stale operator-facing Backup/recovery wording that still describes restore as future or preflight-only. Make the page accurately describe the existing validated-select → preview → checkpoint download → atomic restore/recovery behavior without changing backup format, validation, checkpoint, restore, migration or persistence mechanics; add the smallest focused regression coverage needed for the corrected copy; and run the full `npm run qa:critical` gate. Do not change item/reseller save feedback, reseller-context launch, financial/correction semantics, schema/persistence architecture or begin P8.**

## P7 completion direction

P7 closes only after the remaining evidenced gaps are completed in bounded slices with targeted coverage and the persistent Critical QA gate remains green.
