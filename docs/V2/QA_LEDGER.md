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

### P7-S1 — UX gap inventory and prioritization

**Status:** PASS / DONE as evidence/prioritization work.  
**Runtime changed:** No.

P7-S1 established QG-011 through QG-015 and D-020 ranking. Validation `32066802100` — PASS; final documentation/post-merge evidence remained green under the persistent gate.

### QG-011 — transaction entry intent/feedback

**RESOLVED / P7-S2.**

P7-S2 made Cancel a real reset, surfaced rejected transaction creation while preserving retry data, and split Payment/Signal launch intent. Functional run `32069261401`, job `95508465043` — PASS: 0 lint errors / 78 warnings, 39 Vitest files / 163 tests, 14/14 Playwright, build PASS.

Two earlier runs (`32068747287`, `32069051473`) failed only in a new invalid native-select test harness; the harness was corrected without weakening runtime behavior or D-019.

### QG-012 — invalid reseller period silently displays all-time/current data

**RESOLVED / P7-S3.**

Original evidence:

- a complete inverted date range made `periodStatement` null;
- reseller detail then fell back to current balance plus all transactions while invalid dates remained filled;
- explicit invalid feedback was deferred until PDF generation.

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

- component/page invalid-state + no-fallback + invalid→corrected recovery;
- component/page invalid→cleared recovery;
- bounded Playwright invalid→corrected path;
- existing D-015 statement regressions remain green.

#### P7-S3 validation classification

Initial Critical QA run **`32133265871`** — **FAIL** in one newly added component-test expectation. The test corrected the range to March but expected a fixture dated in February to reappear. The application correctly excluded it. Per D-019 this was classified as a **test-fixture/expectation defect**, not a runtime regression; only the fixture date was aligned with the corrected valid range.

Functional persistent run **`32133559376`**, job **`95699734548`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **39 files / 164 tests PASS**;
- Playwright Chromium: **14/14 PASS**;
- production build: **PASS**.

The warning count reflects touched-test warnings plus existing repository debt. Existing React `act(...)`, older mocked-select DOM warnings, dependency-audit findings and build chunk-size warning remain non-blocking under D-019.

**P7-S3 result: PASS / DONE.**

### QG-013 — stale Backup page recovery description

**OPEN / P7-S4 — current next gap.**

Top-level Backup copy still describes restore as future/preflight-only although P5-S2 validated selection, preview, checkpoint and atomic restore/recovery are implemented.

Risk: operator-facing recovery guidance understates available restore capability and conflicts with the accepted P5 contract.

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
- QG-012 invalid reseller period fallback: RESOLVED / P7-S3.
- QG-013 stale Backup page recovery copy: OPEN / P7-S4.
- QG-014 item/reseller save error feedback: OPEN / later P7.
- QG-015 reseller-context transaction launch friction: OPEN / later P7.

## QA policy entering P7-S4

P7-S4 must be copy-only relative to P5 restore mechanics, add the smallest focused regression coverage needed for corrected operator-facing recovery wording, preserve all P1–P6 contracts, and pass the complete persistent `npm run qa:critical` gate. Do not weaken tests/workflows or bundle unrelated P7 gaps.
