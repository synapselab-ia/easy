# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

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
