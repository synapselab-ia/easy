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

**OPEN / P7-S3 — current next gap.**

Evidence:

- a complete inverted date range makes `periodStatement` null;
- the page then falls back to current balance plus all transactions while invalid dates remain filled;
- the current explicit error is deferred until PDF generation.

Risk: operator can interpret unfiltered data as the requested period view.

### QG-013 — stale Backup page recovery description

**OPEN / later P7.**

Top-level Backup copy still describes restore as future/preflight-only although P5-S2 restore is available.

### QG-014 — item/reseller save failures are console-only

**OPEN / later P7.**

Creation/edit forms do not yet surface mutation failures visibly.

### QG-015 — reseller-context transaction launch friction

**OPEN / later P7.**

Reseller detail knows the identity but transaction entry requires reselecting it on a separate page.

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
- QG-012 invalid reseller period fallback: OPEN / P7-S3.
- QG-013 stale Backup page recovery copy: OPEN / later P7.
- QG-014 item/reseller save error feedback: OPEN / later P7.
- QG-015 reseller-context transaction launch friction: OPEN / later P7.

## QA policy entering P7-S3

P7-S3 must preserve D-015 statement mathematics and all P1–P6 contracts, add focused coverage for invalid→corrected period state, and pass the complete persistent `npm run qa:critical` gate. Do not weaken tests/workflows or bundle unrelated P7 gaps.
