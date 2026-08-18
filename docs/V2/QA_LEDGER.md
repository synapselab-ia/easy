# Easy V2 — QA Ledger

**Updated:** 2026-08-18

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

## P6 — Tests, CI and deployment safety

**Status:** PASS / DONE.

D-019 defines the critical command:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

P6 evidence:

- initial baseline: 81 lint errors, 10 Vitest failures / 149 passes, 10 Playwright failures / 3 passes, build PASS;
- persistent functional run `32064801009` — PASS;
- final canonical-docs-head run `32065331102` — PASS;
- post-merge `develop` run `32065713920` — PASS.

Known warning/dependency debt remains non-blocking under D-019 and must not be hidden by weakening the gate.

## P7 — Operational UX refinement

**Status:** PASS / DONE — 2026-08-18.

### P7-S1 — UX gap inventory and prioritization

**Status:** PASS / DONE as evidence/prioritization work.  
**Runtime changed:** No.

P7-S1 established QG-011 through QG-015 and D-020 ranking. Validation `32066802100` — PASS; final documentation/post-merge evidence remained green under the persistent gate.

### QG-011 — transaction entry intent/feedback

**RESOLVED / P7-S2.**

Original evidence:

- standalone Cancel was wired to a no-op;
- transaction-create failures were console-only;
- one `Pagamento/Sinal` command shortcut always routed to `payment`.

P7-S2 remediation:

- `TransactionForm` owns one reset path for successful submission and explicit Cancel;
- Cancel clears in-progress fields/errors/mutation state and restores the requested `initialType`;
- rejected transaction creation shows `toast.error` and intentionally does not reset fields, preserving retry context;
- command center routes Payment and Signal through distinct actions/query parameters;
- P1/P2/P3 transaction validation, audit and financial effects were not changed.

Targeted regression coverage added:

- `TransactionForm.test.tsx`: reset + initial-type preservation;
- `TransactionForm.test.tsx`: real rejected create mutation + visible error + entered data retained;
- `TransactionsPage.test.tsx`: URL `type=signal` intent;
- `CommandCenter.test.tsx`: payment/signal shortcut routing;
- `tests/e2e/search.spec.ts`: Signal shortcut → form → entered value → Cancel → value cleared with Signal still selected.

#### P7-S2 validation classification

Two initial Critical QA runs failed only in the newly introduced Cancel unit assertion:

1. `32068747287`, job `95506837405` — FAIL: 1 new Vitest assertion failed; lint passed and E2E/build were not reached.
2. `32069051473`, job `95507799159` — FAIL: same new assertion. Investigation showed the test mock rendered invalid HTML (`<span>` inside `<select>`), so jsdom retained the first option instead of representing the controlled empty value.

The harness was corrected to a valid controlled select (`<option value="" />` plus option children; trigger/value renderers removed from the native select). No runtime behavior, business rule or QA gate was weakened to obtain green status.

Functional persistent run **`32069261401`**, job **`95508465043`** — **PASS**:

- ESLint: **0 errors / 78 warnings**;
- Vitest: **39 files / 163 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

The lower warning count versus the P6 closure snapshot comes from the touched test harness and does not redefine or claim global warning-debt resolution. Existing React `act(...)`, older mocked-select DOM warnings, dependency-audit findings and build chunk-size warning remain recorded non-blocking debt.

**P7-S2 result: PASS / DONE.**

### QG-012 — invalid reseller period silently displays all-time/current data

**RESOLVED / P7-S3.**

Original evidence:

- a complete inverted date range made `periodStatement` null;
- reseller detail then fell back to current balance plus all transactions while invalid dates remained filled;
- explicit invalid feedback was deferred until PDF generation.

Risk before remediation: operator could interpret unfiltered data as the requested period view.

P7-S3 remediation:

- a complete inverted range now produces immediate visible `role="alert"` guidance;
- both date controls expose `aria-invalid` while the range is inverted;
- PDF generation is disabled while invalid and remains defensively guarded in the handler;
- current/period financial cards are replaced by a non-financial invalid-period state;
- all-time transaction history is withheld while invalid dates remain filled;
- correcting the range restores the existing D-015 opening → movements → closing statement;
- clearing the range restores the ordinary current-balance/all-history view;
- no statement/PDF arithmetic, schema, persistence, correction/reversal or backup/restore behavior changed.

Targeted regression coverage added:

- `ResellerDetailPage.test.tsx`: invalid state + no fallback + invalid→corrected recovery;
- `ResellerDetailPage.test.tsx`: invalid→cleared recovery;
- `tests/e2e/pdf-date-filter.spec.ts`: bounded invalid→corrected path;
- existing D-015 statement regressions remain green.

#### P7-S3 validation classification

Initial Critical QA run **`32133265871`** — **FAIL** in one newly added component-test expectation. The test corrected the range to March but expected a fixture dated in February to reappear. The application correctly excluded it. Per D-019 this was classified as a **test-fixture/expectation defect**, not a runtime regression; only the fixture date was aligned with the corrected valid range.

Functional persistent run **`32133559376`**, job **`95699734548`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **39 files / 164 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Final canonical documentation-head run **`32133891691`**, job **`95700749081`** — **PASS**. Actions checked out PR merge ref `ee5016cfc2b9d4c2823027127f939abebc5eb705`, which resolves to tree `3f56eca7cfee1b99cb211a03e8070b956994f027`.

PR #15 was squash-merged to `develop` as `337de0b6cf18da7cf27c54648839624df46e66ef`; that integration commit resolves to the same tree `3f56eca7cfee1b99cb211a03e8070b956994f027`. The integrated runtime/canonical content is therefore identical to the content exercised by the final gate. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Existing React `act(...)`, older mocked-select DOM warnings, dependency-audit findings and build chunk-size warning remain non-blocking under D-019.

**P7-S3 result: PASS / DONE.**

### QG-013 — stale Backup page recovery description

**RESOLVED / P7-S4.**

Original evidence:

- top-level `BackupPage` copy said the operator could validate a backup “antes da futura restauração”;
- the same copy described the current stage as preflight-only even though P5-S2 restore was already live;
- `ImportExport` already exposed validated preview, restore, automatic checkpoint and rollback-safe failure feedback.

Risk before remediation: operator-facing recovery guidance understated the available restore capability and contradicted the accepted P5 contract.

P7-S4 remediation:

- page-level copy now accurately describes selecting and validating a backup before restore;
- it states that successful preflight produces a preview and gates release of the restore action;
- it states that a recoverable Backup v2 checkpoint of the current database is downloaded before replacement;
- it states that restore is atomic and the previous database is preserved if write/verification fails;
- `ImportExport`, `backupService`, `restoreService`, backup format/version, validation, checkpoint, migration, persistence and Dexie transaction mechanics were not changed.

Targeted regression coverage added:

- `BackupPage.test.tsx`: proves validation/review, preview gating, recoverable checkpoint, atomic restore and rollback-safe preservation are present in operator-facing copy;
- the same test proves obsolete “futura restauração” wording is absent.

Functional persistent run **`32136964241`**, job **`95710456305`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **40 files / 165 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Existing React `act(...)`, older mocked-select DOM warnings, dependency-audit findings and build chunk-size warning remain non-blocking under D-019.

**P7-S4 result: PASS / DONE.**

### QG-014 — item/reseller save failures are console-only

**RESOLVED / P7-S5.**

Original evidence:

- `ItemForm` caught rejected create/edit mutations and only logged `Erro ao salvar item` to the console;
- `ResellerForm` caught rejected create/edit mutations and only logged `Erro ao salvar revendedor` to the console;
- the forms already reset/closed only on successful mutation, so rejected saves retained local field state but gave the operator no visible explanation.

Risk before remediation: an operator could click Save, see the dialog remain open, and receive no visible indication that persistence failed or why retry/correction was needed.

P7-S5 remediation:

- item create/edit rejection now calls `toast.error` with the available domain/persistence error message;
- reseller create/edit rejection now calls `toast.error` with the available domain/persistence error message;
- rejected saves still do not call `onSubmitSuccess` or field reset, preserving the exact entered values for correction/retry;
- successful saves retain the existing success-only close/reset behavior;
- `useItems`, `useResellers`, P1 lifecycle/reference rules, Dexie schema/persistence and entity mutation semantics were not changed.

Targeted regression coverage added:

- `ItemForm.test.tsx`: rejected create → visible error + retained name/price + no success callback;
- `ItemForm.test.tsx`: rejected edit → visible error + retained edited name/price + no success callback;
- `ResellerForm.test.tsx`: rejected create → visible error + retained name/phone/email/notes + no success callback;
- `ResellerForm.test.tsx`: rejected edit → visible error + retained edited values + no success callback;
- existing Items/Resellers page integration/lifecycle tests remain green.

Functional persistent run **`32141425740`**, job **`95724735659`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **41 files / 169 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

Existing React `act(...)`, mocked-select DOM warnings, dependency-audit findings and build chunk-size warning remain non-blocking under D-019.

**P7-S5 result: PASS / DONE.**

### QG-015 — reseller-context transaction launch friction

**RESOLVED / P7-S6.**

Original evidence:

- reseller detail already knew the current reseller identity;
- transaction entry still initialized reseller state as empty;
- the operator therefore had to reselect the same reseller after leaving that reseller's detail page.

P7-S6 remediation:

- active reseller detail exposes `Novo lançamento` and routes to `/transactions?resellerId=<id>`;
- inactive reseller detail keeps that contextual launch disabled;
- `TransactionsPage` accepts only positive integer reseller context and passes it to `TransactionForm`;
- `TransactionForm` preselects and preserves the contextual reseller across Cancel/success reset;
- standalone entry without valid context remains unselected;
- the existing `activeResellers` check remains the authorization/validation boundary, so inactive and missing reseller context cannot produce a transaction;
- no command-center, financial, audit, occurrence-date, lifecycle, hook, Dexie, backup or restore behavior changed.

Targeted regression coverage added:

- `ResellerDetailPage.context.test.tsx`: active contextual navigation and inactive launch blocking;
- `TransactionsPage.context.test.tsx`: valid URL context and malformed-context fallback;
- `TransactionForm.test.tsx`: contextual reseller preservation plus inactive/missing context rejection with no writes;
- `tests/e2e/reseller-transaction-context.spec.ts`: reseller detail → transaction entry → contextual reseller retained after Cancel.

Functional persistent run **`32145620210`**, job **`95738535732`** — **PASS** on PR merge ref `5fab7de932eb7a62ffe58b21820f11a3ba1b904d`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

Existing React `act(...)`, legacy mocked-select DOM warnings, dependency-audit findings, action-runtime deprecation notices and build chunk-size warning remain visible non-blocking debt under D-019.

**P7-S6 result: PASS / DONE.**

### P7 closure result

The accepted P7-S1 evidence inventory consisted of QG-011 through QG-015. All five are now resolved, and P7-S6 validation did not evidence another material in-scope P7 gap. **P7 result: PASS / DONE.**

## P8 — Real-store requirements discovery

### P8-S1 — Repository evidence and D-016 trigger assessment

**Status:** PASS / DONE.

Evidence result:

- core administrator workflows, desktop/mobile use, PDF sharing, JSON portability and current analytics/reporting intent are repository-backed;
- later mobile requirements mention reseller direct statement access, but do not define shared-state, account, permission or synchronization semantics;
- no direct store interview/observation artifact, production telemetry, SLA/security policy or Duda/store issue was found in the inspected repository evidence;
- all six D-016 reopen triggers were **NOT PROVEN** by P8-S1;
- D-021 keeps D-016 authoritative pending direct store validation;
- detailed classification/questions are in `docs/V2/P8_DISCOVERY.md`.

Persistent Critical QA run **`32149199373`**, job **`95750510692`** — **PASS** on PR #23 merge ref `ad6745a95c274fcedfb3cc999f5fb924099f9d53`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

PR #23 was squash-merged as `65ada02848ad7ca792889b16815c74d0ac9e6da1`; validated merge ref and integration share tree `6bef84c07f236c8df3dea4ce24b4e9028b7bb509`. Documentation-only canonical closure PR #24 also passed run `32150004427`, job `95753223139`, and was squash-merged as `2c5f5e92dd66224499ffc55f828d3e220a2afd63`.

No runtime code, schema, persistence or P9 feature was changed.

### P8-S2 — Direct real-store validation

**Status:** BLOCKED / QA PENDING.

Evidence-intake result:

- canonical P8 matrix reread;
- repository content searched for interview/observation/operator/store evidence and RTO/RPO/SLA material;
- repository issues checked, including `Duda` and `loja`; repository currently has zero issues;
- repository root inspected for newly supplied interview, observation, support, telemetry, SLA/security or equivalent direct evidence;
- current project conversation contains no operator answers or direct real-store artifact.

Classification:

- direct evidence required by D-021 is absent;
- absence of evidence is not interpreted as evidence that a D-016 trigger is false;
- all six triggers remain **UNRESOLVED from direct evidence** and none is proven;
- D-016 remains authoritative because its reopen condition is unmet;
- P8-S2 cannot be marked `DONE` and no backend/auth/cloud/synchronization, persistence migration or P9 implementation is authorized;
- `docs/V2/P8_EVIDENCE_REQUEST.md` defines the minimum evidence packet required to resume validation.

The current documentation-only blocked-state head still requires full persistent `npm run qa:critical` before integration.

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
- QG-011 transaction-entry intent/feedback: RESOLVED / P7-S2.
- QG-012 invalid reseller period fallback: RESOLVED / P7-S3.
- QG-013 stale Backup page recovery copy: RESOLVED / P7-S4.
- QG-014 item/reseller save error feedback: RESOLVED / P7-S5.
- QG-015 reseller-context transaction launch friction: RESOLVED / P7-S6.

## QA policy while P8-S2 is blocked

P8-S2 remains validation-only and blocked on external evidence. D-019 still requires the complete persistent `npm run qa:critical` gate for integration of the blocked-state documentation. Preserve all P1–P7 contracts, keep D-016 authoritative unless direct real-store evidence proves a reopen trigger, distinguish confirmed evidence from inference, and do not begin backend/auth/cloud/synchronization implementation, persistence migration or P9 modules while the evidence blocker remains.
