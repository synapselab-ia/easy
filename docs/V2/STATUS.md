# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery**  
**State:** `IN_PROGRESS` — current slice P8-S2 is `BLOCKED` until direct real-store evidence is supplied.

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Complete incomplete UX flows / operational refinement: `DONE`.
- P7-S1 — Operational UX gap inventory and prioritization: `DONE`.
- P7-S2 — Reliable transaction-entry intent and feedback: `DONE`.
- P7-S3 — Explicit invalid reseller statement-range state: `DONE`.
- P7-S4 — Align Backup recovery copy with implemented restore: `DONE`.
- P7-S5 — Operator-visible item/reseller save failures: `DONE`.
- P7-S6 — Reseller-context transaction launch without redundant reselection: `DONE`.
- P8-S1 — Repository-evidence requirements discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and D-016 keep/reopen decision: `BLOCKED` — no direct store evidence supplied.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source or evidence needed for `NEXT_ACTION`. When P8 is active, read `docs/V2/P8_DISCOVERY.md` only after the canonical startup set if the active action depends on discovery evidence. When P8-S2 is blocked, use `docs/V2/P8_EVIDENCE_REQUEST.md` as the evidence-intake checklist; it does not replace `STATUS.md` as current-state authority.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. Dexie remains **V4** and D-016 remains authoritative: no backend, authentication, cloud database or synchronization is part of the accepted foundation unless P8 produces explicit evidence for a reopen trigger.

P1–P3 define entity lifecycle, audit/correction and financial semantics. P5 provides versioned backup plus checkpointed atomic restore. P6/D-019 requires the repository-wide `npm run qa:critical` gate for V2 integration and publication. P7/D-020 completed the accepted evidence-backed operator-intent/error backlog before convenience or cosmetic refinement. P8-S1/D-021 establishes that repository evidence alone does not prove a D-016 reopen trigger. P8-S2 attempted direct evidence intake but found that no real-store evidence has been supplied; lack of evidence is not evidence against a trigger, so the slice remains blocked and D-016 stays authoritative until a trigger is actually proven.

At the start of P7-S2, `develop` was `7269bb435d91bbde45ffa835bacf0d373dfa14e6`; `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P7-S3, `develop` was `5cb696a4c1eadbe46e0801922b0ad78b860f367f`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P7-S4, `develop` was `5b3d5824f9cce6e08572fa8034d797a6c30f758d`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P7-S5, `develop` was `42d382311be1b910bbc56cd85a948cb8a7737329`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P7-S6, `develop` was `4928978fbcd06cdb308951301ab4f8219b642923`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P8-S1, `develop` was `e8973b59b0b6df28e95d9085b5319d24d7724d61`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

At the start of P8-S2, `develop` was `2c5f5e92dd66224499ffc55f828d3e220a2afd63`; `main` still remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

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

## P7-S6 completed reseller-context transaction-launch slice

P7-S6 resolved QG-015, the last currently evidenced P7-S1 gap, without changing command-center shortcuts, standalone transaction semantics, transaction financial/audit/occurrence rules, entity lifecycle, hooks, Dexie persistence/schema, backup/restore or P8/P9 behavior.

### Reseller intent now survives contextual launch

- active reseller detail exposes **Novo lançamento** and routes to the existing `/transactions` page with `resellerId=<id>` context;
- `TransactionsPage` accepts only a positive integer `resellerId` query value and passes it as form initialization context;
- `TransactionForm` preselects that reseller and restores the same contextual reseller after Cancel or successful reset;
- without a valid context parameter, standalone transaction entry continues to start with no reseller selected;
- contextual initialization does not authorize activity: the existing `activeResellers` validation remains authoritative, so inactive and missing reseller IDs are rejected before mutation;
- reseller detail disables contextual launch for an inactive reseller.

### Focused regression coverage

- `ResellerDetailPage.context.test.tsx`: active context navigation plus inactive launch blocking;
- `TransactionsPage.context.test.tsx`: valid URL context preselection plus malformed-context standalone fallback;
- `TransactionForm.test.tsx`: active contextual preservation across Cancel plus inactive/missing context rejection with zero transaction writes;
- `tests/e2e/reseller-transaction-context.spec.ts`: reseller creation → detail → contextual transaction page → reseller preselected → Cancel → context preserved.

## P7-S6 validation, integration and P7 closure

Functional persistent Critical QA run **`32145620210`**, job **`95738535732`** — **PASS** on PR merge ref `5fab7de932eb7a62ffe58b21820f11a3ba1b904d`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

Final canonical documentation-head run **`32146311260`**, job **`95740791449`** — **PASS** on PR merge ref `011798b4b15cd7cb6e1cad8ac7458066e6d76230` with the same 0/80, 43/176, 15/15 and build PASS counts.

PR #21 was squash-merged into `develop` as `0d485ed68498e8866bcc3cb5ede109fc0b712a09`. The validated final PR merge ref and the squash integration commit both resolve to tree **`600776809a56ad551bb828524bfca0ee286b2375`**, so the integrated P7-S6 runtime and canonical content are byte-for-byte the content validated by the final gate. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing React `act(...)`, legacy mocked-select DOM warnings, dependency-audit findings, action-runtime deprecation notices and build chunk-size warning remain visible non-blocking debt under D-019; no gate was weakened.

QG-015 is resolved. The accepted P7-S1 inventory contained QG-011 through QG-015, all are now resolved, and the bounded P7-S6 implementation/validation did not evidence an additional material in-scope P7 gap. Therefore **P7 is `DONE`**. No new architecture/product decision was required; D-016, D-019 and D-020 remain authoritative.

## P8-S1 completed repository-evidence discovery

P8-S1 performed discovery only. No runtime, schema, persistence or new business-module implementation was made.

### Evidence inspected

- canonical V2 startup set;
- original `prompts/prompt1.md` through `prompt8.md`;
- historical product PRDs relevant to reseller management and responsive/mobile operation;
- `README.md` client-side/portability description;
- repository issue searches for explicit `Duda`/`loja` artifacts, which returned no issues.

Detailed classification is recorded in `docs/V2/P8_DISCOVERY.md`.

### Confirmed project intent versus unresolved store reality

Repository evidence confirms administrator workflows, desktop/mobile operation, PDF sharing, manual JSON backup/portability and the current reporting/analytics scope. A later responsiveness requirement also describes a reseller consulting their own statement on mobile, which is materially different from the earlier explicit single-user/no-auth framing.

That difference is recorded as an **open real-store validation question**, not as proof of accounts, permissions, concurrent use or synchronized shared state. No inspected artifact proves automatic live multi-device sharing, person-level authorship/access control, remote recovery SLA, trusted server integrations or a security policy incompatible with browser-local storage.

### D-016 assessment

Every D-016 reopen trigger is classified **NOT PROVEN** by P8-S1 repository evidence. D-021 is accepted: D-016 remains authoritative until direct real-store evidence resolves operator/device/sharing/access/recovery constraints. Backend/auth/cloud/synchronization and persistence migration remain unauthorized.

### Validation and integration

Persistent Critical QA run **`32149199373`**, job **`95750510692`** — **PASS** on PR #23 merge ref `ad6745a95c274fcedfb3cc999f5fb924099f9d53`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

PR #23 was squash-merged into `develop` as `65ada02848ad7ca792889b16815c74d0ac9e6da1`. The validated PR merge ref and the squash integration commit both resolve to tree **`6bef84c07f236c8df3dea4ce24b4e9028b7bb509`**, so the integrated P8-S1 canonical discovery content is byte-for-byte the content exercised by D-019. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing React `act(...)`, legacy mocked-select DOM warnings, dependency-audit findings, action-runtime deprecation notices and build chunk-size warning remain visible non-blocking debt under D-019; no gate was weakened.

## P8-S2 direct-validation attempt

P8-S2 was started on `docs/p8-s2-direct-evidence-blocker` from `develop` at `2c5f5e92dd66224499ffc55f828d3e220a2afd63`. The slice performed evidence validation only.

### Evidence intake result

The project-accessible evidence boundary was checked for direct store material:

- repository content searches for interview/observation/operator/store evidence and RTO/RPO/SLA material returned no direct artifact;
- the repository currently has zero issues; explicit issue searches for `Duda` and `loja` returned zero results;
- the current repository root contains no interview/observation/support/telemetry/SLA-security evidence source beyond the already classified prompts, historical tasks and canonical documents;
- the current project conversation supplied no operator answers or other direct real-store artifact.

Therefore **P8-S2 is `BLOCKED` by missing external evidence**. The absence of a direct artifact is not interpreted as evidence that the store lacks any cloud/auth trigger.

### D-016 disposition while blocked

All six D-016 triggers remain unresolved from direct evidence and **none is proven**. D-016 remains authoritative under D-021 because the accepted reopen condition has not been met; this does not constitute completed store validation.

`docs/V2/P8_EVIDENCE_REQUEST.md` defines the minimum evidence packet required to resume P8-S2. No runtime, backend/auth/cloud/synchronization, Dexie migration, architecture implementation or P9 work was performed. No new architecture/product decision is accepted in this blocked slice; D-016 and D-021 already define the evidence threshold.

### Validation state

This documentation-only blocked-state change still requires the full persistent D-019 `npm run qa:critical` gate before integration.

## Active constraints while P8-S2 is blocked

- do not work directly on `main`;
- preserve all P1–P7 contracts and D-019;
- keep D-016 authoritative unless direct real-store evidence proves a reopen trigger;
- use `docs/V2/P8_DISCOVERY.md` as the discovery matrix and `docs/V2/P8_EVIDENCE_REQUEST.md` as the direct-evidence intake checklist;
- do not infer a negative requirement from missing evidence;
- do not implement backend, authentication, cloud database, synchronization, Dexie migration or P9 modules while P8-S2 is blocked;
- do not advance to P9 until P8-S2 receives and classifies sufficient direct evidence.

## NEXT_ACTION

**P8-S2 — Resume direct real-store validation only when an explicit evidence packet is supplied to the project. Use `docs/V2/P8_EVIDENCE_REQUEST.md` to capture operator/concurrency, devices/shared-state, reseller access, synchronization, identity/permissions/authorship, recovery RTO/RPO, trusted integrations, security/privacy, realistic scale/connectivity and measurable missing workflows/reports. Classify each supplied fact as current reality, mandatory future requirement or preference; map confirmed facts to every D-016 reopen trigger; then explicitly keep or reopen D-016 before any architecture implementation or P9 prioritization. Until such evidence exists, keep P8-S2 `BLOCKED`, do not infer answers, and do not implement backend/auth/cloud/synchronization, persistence migration or P9 modules. Run the full `npm run qa:critical` gate before integrating the resumed P8-S2 conclusion.**
