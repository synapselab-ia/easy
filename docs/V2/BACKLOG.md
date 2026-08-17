# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

## P1 — Referential integrity and safe entity lifecycle

**Status:** `DONE` — 2026-08-17.

- P1-S1 safe reseller lifecycle — `DONE`.
- P1-S2 safe item lifecycle — `DONE`.
- P1-S3 referential validation/migration — `DONE`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`.
- P2-S2 linked/guided replacement — `DONE`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`.

## P4 — Persistence architecture decision: local vs cloud

**Status:** `DONE` — 2026-08-17.

D-016 keeps V2 local-first/single-user on Dexie V4 until an explicit cloud/auth reopen trigger is proven.

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

P5 gate: versioned export -> validated preview -> downloaded checkpoint -> verified atomic restore reproduces the canonical dataset/invariants.

---

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `DONE` — 2026-08-17.

P6 established the persistent `npm run qa:critical` gate (lint + full Vitest + Playwright Chromium + production build), Critical QA for V2 integration and `quality -> build -> deploy` protection for publication from `main`.

Persistent functional validation: `32064801009` — PASS. Post-merge `develop` validation: `32065713920` — PASS.

---

## P7 — Complete incomplete UX flows / operational refinement

**Priority:** High  
**Status:** `IN_PROGRESS`

Goal: complete evidenced operator-facing flows that are incomplete, misleading or materially high-friction without turning P7 into a visual redesign or speculative feature phase.

### P7-S1 — Operational UX gap inventory and prioritization

**Status:** `DONE` — 2026-08-17.

Evidence inspected:

- current routes/navigation and command center;
- transaction-entry form/page and transaction domain hook;
- reseller detail statement/PDF flow;
- item/reseller lifecycle forms and tables;
- P5 backup/restore page, preflight dialog and restore tests;
- existing transaction/component/integration tests and the three Playwright suites;
- Project Spec usability objective and P1–P6 accepted contracts.

#### Ranked evidenced gaps

**1. Transaction-entry intent and feedback — first implementation priority.**

- visible `Cancelar` button is wired to a no-op on the standalone transaction page;
- transaction mutation failures are caught with console-only logging, providing no operator-visible failure state;
- command-center action labelled `Pagamento/Sinal` always opens `?type=payment`, so signal intent is not preserved automatically.

Impact: high-frequency routine financial workflow; direct intent/error risk. These three behaviors form one bounded slice and require no financial/schema change.

**2. Invalid reseller statement range silently falls back to all-time view.**

A complete inverted period leaves the entered dates visible but shows current balance/all transactions because no `StatementPeriod` is built; the error is surfaced only after PDF generation is attempted. This can mislead on-screen review.

**3. Backup page top-level recovery copy is stale.**

The page still describes a “future restore”/preflight-only stage even though P5-S2 already exposes checkpointed atomic restore. Inner restore UI is correct; the page-level description is not.

**4. Item/reseller save failures are console-only.**

Creation/edit forms catch mutation failures but do not show the operator a visible error. Lower direct financial risk than transaction entry, so scheduled later in P7.

**5. Reseller-context launch requires redundant reselection.**

From a reseller detail page the operator must navigate to the transaction page and select that same reseller again. This is evidenced routine friction against the “few steps” objective but does not threaten correctness, so it ranks below misleading/error-feedback gaps.

#### Explicitly not prioritized from current evidence

- broad visual redesign;
- dashboard rearrangement;
- theme/branding changes;
- table-density preferences;
- catalog search solely because it might be convenient.

Current evidence does not establish enough operational impact to outrank the ranked gaps.

Validation: persistent Critical QA run **`32066802100` — PASS** on the canonical P7-S1 content head before validation evidence was appended.

P7-S1 gate: **PASS / DONE as evidence/prioritization work; no runtime behavior changed.** D-019 still requires Critical QA before integration.

### P7-S2 — Reliable transaction-entry intent and feedback

**Status:** `NOT_STARTED`

Bounded scope:

- make standalone transaction `Cancelar` reset/clear the in-progress form while preserving requested initial transaction type;
- show transaction mutation failures visibly and keep entered data available for correction/retry;
- replace the ambiguous command-center `Pagamento/Sinal` action with separate `Pagamento` and `Sinal` actions whose query parameter preserves intent;
- add focused component/integration tests for reset/error/type intent;
- add one bounded Playwright operator path covering shortcut/cancel behavior;
- run `npm run qa:critical`.

Out of scope for P7-S2:

- financial/domain-rule changes;
- schema/persistence changes;
- correction/reversal changes;
- backup/restore copy or behavior;
- reseller date-range UX;
- contextual reseller launch shortcut;
- P8/P9 work.

### Later P7 slices

After P7-S2, select the next bounded slice from priorities 2–5 based on the canonical ranking; do not batch unrelated gaps merely to close P7 faster.

---

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
