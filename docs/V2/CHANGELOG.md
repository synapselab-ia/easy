# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-18 — P8-S1 repository-evidence discovery and D-016 assessment

### Evidence boundary

P8-S1 executed discovery only. It inspected the canonical V2 baseline, original project prompts, relevant historical PRDs, README and repository issues, then recorded a detailed evidence matrix in `docs/V2/P8_DISCOVERY.md`.

Confirmed repository-backed intent includes:

- administrator item/reseller/order/payment workflows;
- desktop and smartphone operation;
- reseller statements/PDF sharing;
- JSON backup and computer portability;
- current dashboard, Pareto, debtor-ranking and debt-aging reporting.

A later responsiveness requirement also describes a reseller consulting their own statement on mobile. That is recorded as a material unresolved operator/access question because the earlier product definition explicitly used local single-user storage without authentication and no artifact defines how a reseller would access the administrator's live dataset.

### D-016 outcome

P8-S1 found no proof of any D-016 reopen trigger:

- concurrent operators: not proven;
- automatic live multi-device sharing: not proven;
- person-level authorship/access control: not proven;
- remote recovery SLA: not proven;
- trusted server integrations: not proven;
- security policy incompatible with browser-local storage: not proven.

D-021 is accepted: repository evidence alone does not reopen D-016. Direct store evidence must resolve operator/device/sharing/access/recovery constraints before architecture changes.

No runtime, backend/auth/cloud/synchronization, Dexie migration or P9 implementation changed.

### Canonical state

- P8-S1 repository discovery: complete, awaiting final D-019 QA/integration evidence;
- P8 remains `IN_PROGRESS`;
- D-016 remains authoritative;
- D-021 accepted;
- `NEXT_ACTION` advances only to **P8-S2 — direct real-store validation of unresolved operator/device/sharing/access/recovery requirements and explicit D-016 keep/reopen decision**.

P8-S2 is not executed in this change.

---

## 2026-08-18 — P7-S6 reseller-context transaction launch and P7 closure

### Context-preserving transaction entry

P7-S6 completed QG-015, the final currently evidenced P7-S1 operational gap:

- active reseller detail now exposes **Novo lançamento** and carries `resellerId` into the existing transaction-entry route;
- `TransactionsPage` accepts only positive integer reseller context and initializes `TransactionForm` with it;
- the form preselects the contextual reseller and preserves it across Cancel/success reset;
- standalone transaction entry remains unselected without valid reseller context;
- inactive reseller detail blocks contextual launch;
- inactive or missing reseller context still fails the existing P1 `activeResellers` validation and cannot create transactions.

No command-center shortcut, P2/P3 financial/audit/occurrence behavior, entity lifecycle rule, hook, Dexie schema/persistence, backup/restore mechanic or P8/P9 implementation changed.

### Regression coverage

Added focused proof for:

- active reseller detail → contextual transaction navigation;
- inactive reseller detail → launch disabled;
- valid URL context → reseller preselected;
- malformed URL context → normal standalone empty selection;
- active contextual reseller retained across Cancel;
- inactive/missing context rejected with no transaction writes;
- bounded Playwright reseller-detail → transaction-entry → Cancel path with reseller context preserved.

### Validation

Functional persistent Critical QA run **`32145620210`**, job **`95738535732`** — **PASS** on PR merge ref `5fab7de932eb7a62ffe58b21820f11a3ba1b904d`:

- lint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests passing;
- Playwright Chromium: 15/15 passing;
- production build: PASS.

### Canonical state

- QG-015 reseller-context transaction launch friction: RESOLVED / P7-S6;
- P7-S6: `DONE`;
- QG-011 through QG-015 are all resolved and no additional material in-scope P7 gap was evidenced by the bounded P7-S6 work;
- P7: `DONE`;
- D-016, D-019 and D-020 remain authoritative; no new architecture/product decision was required;
- `NEXT_ACTION` advances only to **P8-S1 — evidence-based real-store requirements discovery and D-016 reopen assessment**.

P8-S1 is not executed in this change. Backend/auth/cloud/synchronization and P9 modules remain untouched.

---

## 2026-08-18 — P7-S5 item/reseller save failures made operator-visible

### Retry-safe entity save feedback

P7-S5 completed only QG-014, the fourth-ranked P7-S1 operational gap:

- rejected item create/edit mutations now surface their domain/persistence error through `toast.error`;
- rejected reseller create/edit mutations now surface their domain/persistence error through `toast.error`;
- failure does not call the success callback or reset fields, so entered values remain available for correction/retry;
- successful saves retain the existing success-only close/reset behavior.

No `useItems` / `useResellers` mutation semantics, P1 lifecycle/reference rules, Dexie schema/persistence, transaction-entry behavior, financial/correction semantics, backup/restore mechanics or reseller-context launch behavior changed.

### Regression coverage

Added focused proof for:

- item rejected create with visible error and retained name/price;
- item rejected edit with visible error and retained edited name/price;
- reseller rejected create with visible error and retained name/phone/email/notes;
- reseller rejected edit with visible error and retained edited values.

Existing item/reseller page integration and lifecycle tests remain green.

### Validation

Functional persistent Critical QA run **`32141425740`**, job **`95724735659`** — **PASS**:

- lint: 0 errors / 80 warnings;
- Vitest: 41 files / 169 tests passing;
- Playwright Chromium: 14/14 passing;
- production build: PASS.

### Canonical state

- QG-014 item/reseller save feedback: RESOLVED / P7-S5;
- P7-S5: `DONE`;
- P7 remains `IN_PROGRESS`;
- D-016, D-019 and D-020 remain authoritative; no new architecture/product decision was required;
- `NEXT_ACTION` advances only to **P7-S6 — Remove redundant reseller reselection when launching a transaction from reseller detail**.

P7-S6, P8 and P9 remain untouched.

---

## 2026-08-18 — P7-S4 Backup recovery copy aligned with implemented restore

### Operator-facing recovery guidance

P7-S4 completed only QG-013, the third-ranked P7-S1 operational gap:

- `BackupPage` no longer describes restore as future or preflight-only;
- page-level guidance now describes selecting and validating a backup, reviewing the successful preflight preview and only then receiving the restore action;
- the guidance states that Easy downloads a recoverable Backup v2 checkpoint of the current database before replacement;
- it states that restore is atomic and preserves the previous database if write/verification fails.

No `ImportExport`, backup format/version, preflight validator, checkpoint generation/download, restore, migration, Dexie transaction, schema/persistence, financial or correction behavior changed.

### Regression coverage

Added `BackupPage.test.tsx` to prove the page describes validation/review, preview gating, recoverable checkpoint, atomic restore and rollback-safe preservation, while rejecting the obsolete “futura restauração” wording.

### Validation

Functional persistent Critical QA run **`32136964241`**, job **`95710456305`** — **PASS**:

- lint: 0 errors / 80 warnings;
- Vitest: 40 files / 165 tests passing;
- Playwright Chromium: 14/14 passing;
- production build: PASS.

### Canonical state

- QG-013 stale Backup recovery copy: RESOLVED / P7-S4;
- P7-S4: `DONE`;
- P7 remains `IN_PROGRESS`;
- D-017, D-018, D-019 and D-020 remain authoritative; no new architecture/product decision was required;
- `NEXT_ACTION` advances only to **P7-S5 — Make item/reseller save failures operator-visible without losing retry context**.

Reseller-context transaction launch and P8/P9 remain untouched.

---

## 2026-08-18 — P7-S3 explicit invalid reseller statement-range state

### Runtime refinement

P7-S3 completed only QG-012, the second-ranked P7-S1 operational gap:

- a complete inverted reseller statement range is now visibly invalid immediately;
- both period controls expose invalid accessibility state and operator-visible correction guidance;
- PDF generation is disabled while the range is invalid and retains a defensive handler guard;
- invalid filled dates no longer make the page silently show current balance or all-time transaction history;
- financial content is replaced by a non-financial invalid-period state until the dates are corrected or cleared;
- correcting the range restores the existing formal D-015 statement;
- clearing the range restores the normal current-balance/all-history view.

No D-015 statement/PDF arithmetic, Dexie schema/persistence, lifecycle/reference rules, correction/reversal semantics, backup/restore mechanics or lower-ranked P7 flows changed.

### Regression coverage

Added focused proof for:

- immediate invalid state and suppression of current/all-time fallback;
- invalid→corrected recovery with valid statement data returning;
- invalid→cleared recovery to the ordinary unfiltered view;
- bounded Playwright invalid→corrected flow.

Existing formal statement coverage continues to prove opening → movements → closing semantics.

### Validation classification

Initial Critical QA run **`32133265871`** failed in one newly added component-test expectation. The corrected valid range was March while the expected transaction fixture was dated in February, so the application correctly omitted it. The failure was classified under D-019 as a test-fixture/expectation defect; only the fixture date was aligned, with no runtime behavior weakened.

Functional persistent run **`32133559376`**, job **`95699734548`** — **PASS**:

- lint: 0 errors / 80 warnings;
- Vitest: 39 files / 164 tests passing;
- Playwright Chromium: 14/14 passing;
- production build: PASS.

### Canonical state

- QG-012 invalid reseller period fallback: RESOLVED / P7-S3;
- P7-S3: `DONE`;
- P7 remains `IN_PROGRESS`;
- D-015, D-016, D-019 and D-020 remain authoritative; no new architecture/product decision was required;
- `NEXT_ACTION` advances only to **P7-S4 — Align Backup recovery copy with the implemented P5-S2 restore flow**.

Item/reseller save feedback, reseller-context transaction launch and P8/P9 remain untouched.

---

## 2026-08-17 — P7-S2 reliable transaction-entry intent and feedback

### Runtime refinement

P7-S2 completed only the highest-ranked P7-S1 transaction-entry cluster:

- standalone **Cancelar** now clears the in-progress transaction form instead of invoking a no-op;
- reset restores the requested `initialType`, so a Signal shortcut remains Signal after Cancel;
- transaction-create failures now surface through `toast.error` and preserve entered data for correction/retry;
- successful creation still resets only after the existing validated mutation succeeds;
- command center now has separate **Pagamento** and **Sinal** actions routing to `?type=payment` and `?type=signal` respectively;
- the standalone transaction page no longer provides the inert cancel callback.

No financial calculations, occurrence-date rules, lifecycle/reference validation, correction/reversal semantics, Dexie schema, persistence, backup/restore or lower-ranked P7 flows changed.

### Regression coverage

Added focused proof for:

- Cancel reset and requested initial-type preservation;
- visible rejected-mutation feedback with retry input retained;
- transaction page Signal intent from URL;
- distinct payment/signal command routing;
- bounded Playwright Signal shortcut → entered value → Cancel → cleared value with Signal intent preserved.

### Validation classification

The first two Critical QA attempts exposed a defect in the **new test harness**, not a product regression:

- `32068747287` — FAIL in the new Cancel unit assertion;
- `32069051473` — FAIL in the same assertion.

The mocked Select rendered invalid native HTML with `<span>` elements inside `<select>`, so jsdom did not represent an empty controlled value correctly. The harness was corrected to valid option-only Select HTML. Runtime behavior and D-019 were not weakened.

Functional persistent run **`32069261401`**, job `95508465043` — **PASS**:

- lint: 0 errors / 78 warnings;
- Vitest: 39 files / 163 tests passing;
- Playwright Chromium: 14/14 passing;
- production build: PASS.

### Canonical state

- QG-011 transaction-entry intent/feedback: RESOLVED / P7-S2;
- P7-S2: `DONE`;
- P7 remains `IN_PROGRESS`;
- D-020 remains the accepted prioritization decision; no new architecture/product decision was required;
- `NEXT_ACTION` advances only to **P7-S3 — Explicit invalid reseller statement-range state**.

Remaining Backup copy, item/reseller error-feedback and reseller-context launch gaps remain out of this slice. P8/P9 remain untouched.

---

## 2026-08-17 — P7-S1 operational UX gap inventory and prioritization

P7-S1 executed only evidence/prioritization work. It ranked five operator-facing gaps, accepted D-020, left runtime unchanged and advanced only to transaction-entry intent/feedback. Validation `32066802100` passed; PR/final/post-merge heads remained protected by D-019.

---

## 2026-08-17 — P6 repository-wide QA reconciliation, gated deployment and P6 closure

P6 reconciled the repository-wide baseline, fixed the command-center double-filter regression, established `npm run qa:critical`, added persistent CI, made Pages deployment require `quality -> build -> deploy`, accepted D-019 and closed P6. Functional validation `32064801009`; final docs `32065331102`; post-merge `32065713920`.

---

## 2026-08-17 — P5-S2 checkpointed atomic restore and P5 closure

- validated `easy-checkpoint-v2-*` is downloaded before destructive replacement;
- all restore writes and verification occur inside one Dexie transaction with rollback on failure;
- v2 and v1 migration/financial round-trips proven;
- D-018 accepted;
- validation `32060729538` passed;
- P5 closed.

## 2026-08-17 — P5-S1 versioned backup contract and restore preflight

- `easy-backup` version 2 introduced as logical recovery/interchange contract;
- current v1 JSON migrated in memory before deep validation;
- backup selection changed to validation/preview without mutation;
- D-017 accepted;
- validation `32058028793` passed.

## 2026-08-17 — P4 local-first persistence decision

- D-016 accepted local-first/single-user Dexie V4 under evidenced requirements;
- no backend/auth/cloud implementation;
- P4 closed.

## 2026-08-17 — P3-S2 formal statements, FIFO debt aging and P3 closure

- shared opening → movements → closing statement model;
- per-reseller total debt semantics and FIFO-derived open-debt aging;
- validation `32053837309`; D-015 accepted.

## 2026-08-17 — P3-S1 occurrence-date model

- `occurredAt` separated from audit `createdAt`, Dexie V4 added and date consumers aligned;
- validation `32052076684`.

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement and correction;
- validation `32042373332`.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp and reversal-aware financial rules;
- validation `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict reference matrix and migration preservation coverage;
- validation `32039763539`; P1 closed.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration and snapshot preservation;
- validation `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration and active-only new activity;
- validation `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established; no runtime impact.
