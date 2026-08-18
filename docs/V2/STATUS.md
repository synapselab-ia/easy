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
- P7-S4 — Align Backup recovery copy with implemented restore: `DONE`.
- P7-S5 — Operator-visible item/reseller save failures: `DONE`.

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

At the start of P7-S4, `develop` was `5b3d5824f9cce6e08572fa8034d797a6c30f758d`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P7-S5, `develop` was `42d382311be1b910bbc56cd85a948cb8a7737329`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

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

## P7-S4 completed Backup recovery-copy slice

P7-S4 resolved QG-013 by correcting only the stale top-level Backup guidance. The page no longer describes restore as future/preflight-only and now accurately states the existing P5-S2 sequence: select a backup → validate/preflight → review the preview → restore becomes available → a recoverable v2 checkpoint of the current database is downloaded → replacement is executed atomically, with the prior database preserved if write/verification fails.

`ImportExport`, `backupService`, `restoreService`, the backup format, validation rules, checkpoint mechanics, Dexie transaction boundary and migration behavior were not changed.

### Focused regression coverage

`BackupPage.test.tsx` now proves that the page-level copy names validation/review, preview gating, the recoverable checkpoint, atomic restore and rollback-safe preservation, and that the obsolete “futura restauração” wording is absent.

## P7-S4 validation and integration

Functional persistent Critical QA run **`32136964241`**, job **`95710456305`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **40 files / 165 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Final canonical documentation-head run **`32137372736`**, job **`95711739520`** — **PASS** on PR merge ref `a919c9f8d6efe5c4a424a8ee8b0dba1550c39088`.

PR #17 was squash-merged into `develop` as `169704e8d4a9ac852634ac436945b870b0ee41b8`. The validated PR merge ref and the squash integration commit both resolve to tree **`59d4849da20d3593cc7a8cd6e563ca16bd12787d`**, so the integrated P7-S4 runtime and canonical content are byte-for-byte the content validated by the final gate. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing warning/dependency/test-harness debt remains non-blocking under D-019 and was not reclassified or hidden.

## P7-S5 completed item/reseller save-feedback slice

P7-S5 resolved QG-014 without changing P1 entity lifecycle/reference semantics, hook mutation behavior, Dexie schema/persistence, transaction entry, financial/correction semantics, backup/restore or reseller-context launch.

### Save failures are visible and retry-safe

`ItemForm` and `ResellerForm` now surface rejected create/edit mutations through `toast.error` using the domain/persistence error message when available. Success behavior remains unchanged: `onSubmitSuccess` and field reset still occur only after `mutateAsync` resolves.

A rejected save therefore keeps the form mounted with the operator's current values intact so the condition can be corrected and the same create/edit operation retried without re-entry.

### Focused regression coverage

- `ItemForm.test.tsx` covers rejected create and rejected edit, visible error feedback, no success callback and retained name/price values;
- new `ResellerForm.test.tsx` covers rejected create and rejected edit, visible error feedback, no success callback and retained name/phone/email/notes values;
- the tests reject the existing Dexie-backed mutation boundary directly; `useItems` and `useResellers` are not rewritten or bypassed in runtime.

## P7-S5 validation and integration

Functional persistent Critical QA run **`32141425740`**, job **`95724735659`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **41 files / 169 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Final canonical documentation-head run **`32141986342`**, job **`95726598751`** — **PASS** on PR merge ref `d44cc9110e7ce8c2e46b89c98f17bbb1744f831b`.

PR #19 was squash-merged into `develop` as `c509d56b6f24d9a8e53dde68816845855b3c0e8b`. The validated PR merge ref and the squash integration commit both resolve to tree **`66b39f2ee76d9a3ba72422e8e93380b3e5ec073f`**, so the integrated P7-S5 runtime and canonical content are byte-for-byte the content validated by the final gate. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing warning/dependency/test-harness debt remains non-blocking under D-019 and was not reclassified or hidden.

## Remaining prioritized P7 gaps

1. Reseller-context transaction launch still requires redundant reseller reselection — next and final currently evidenced P7 slice.
2. P8 real-store discovery remains outside P7 and may reopen D-016 only with evidence.

## Active constraints entering P7-S6

- do not work directly on `main`;
- preserve all P1–P6 contracts and D-020 prioritization;
- do not weaken or bypass `qa:critical`;
- keep D-016 local-first Dexie V4;
- preserve standalone transaction-entry behavior and the P7-S2 Payment/Signal intent contract;
- preserve P1 active-reference validation when carrying reseller context into transaction entry;
- do not change financial, occurrence-date, correction/reversal or statement semantics;
- do not begin P8 discovery or new modules.

## NEXT_ACTION

**P7-S6 — Remove redundant reseller reselection when launching a transaction from reseller detail. Create a new feature branch from the current `develop` after P7-S5 integration and change only the reseller-context launch path so an operator can start a transaction from a reseller detail view with that reseller intent preselected/preserved, while standalone transaction entry remains unchanged. Preserve P1 active-reference validation and all P2/P3 financial/audit semantics; inactive or missing reseller context must not bypass existing validation. Add focused component/page coverage and one bounded Playwright reseller-detail → transaction-entry path if navigation is part of the implemented flow; run the full `npm run qa:critical` gate. Do not change command-center shortcuts, generic transaction behavior beyond context initialization, financial/correction semantics, backup/restore mechanics, schema/persistence architecture or begin P8.**

## P7 completion direction

P7 can close after P7-S6 only if the remaining QG-015 evidence is resolved, no new material P7 gap is discovered in-scope, and the persistent Critical QA gate remains green.
