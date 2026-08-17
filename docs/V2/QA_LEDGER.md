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

P5 recovery validation covers v2/v1 migration, checkpoint-before-write, one-transaction replacement, in-transaction restored-data verification, rollback on write failure and preservation of P1/P2/P3 IDs/history/financial semantics.

## P6 — Tests, CI and deployment safety

**Status:** PASS / DONE.

### Initial repository-wide baseline

The baseline was captured before changing expectations. Diagnostic evidence showed:

- ESLint: **81 errors**;
- Vitest: **10 failed / 149 passed**;
- Playwright Chromium: **10 failed / 3 passed**;
- production build: **PASS**.

The failing output was classified before remediation.

### Stale test/tooling findings

The following were stale harness/tooling/expectation issues rather than accepted-product regressions:

- `App.test` did not reproduce the deployed `/easy/` basename/root QueryClient context;
- page tests omitted Router context or relied on incomplete child-hook mocks;
- jsdom lacked browser APIs used by current UI (`ResizeObserver`, `scrollIntoView`);
- dashboard tests used ambiguous selectors and an old styling token;
- E2E used obsolete reseller placeholders, select/legend selectors and old command-center copy;
- the old “no transactions in period => refuse PDF” E2E contradicted D-015, where a zero-movement period is a valid opening/movement/closing statement.

These were reconciled in tests/harness without changing P1–P5 business/recovery semantics.

### Real regression found and fixed

One real integration defect was exposed by the full E2E gate: global command search was filtered twice. `useSearch()` already queries/filters Dexie results, while `cmdk` applied its internal filter again. `CommandDialog` now sets `shouldFilter={false}` so the external Dexie result set is authoritative. The search-and-navigate E2E remains in the critical suite as the regression proof.

### Reconciled critical gate

Canonical command:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Persistent functional run **`32064801009`**, job `95494186349` — **PASS**.

Verified final state:

- [x] ESLint completes with **0 errors**; 80 known warnings remain visible;
- [x] Vitest: **39 files / 159 tests PASS**;
- [x] Playwright Chromium: **13/13 PASS**;
- [x] production build PASS;
- [x] `npm ci` used for reproducible CI/deploy installation;
- [x] `.github/workflows/ci.yml` runs Critical QA on PRs to `develop`/`main` and pushes to `develop`;
- [x] `.github/workflows/deploy.yml` requires `quality -> build -> deploy` for `main`;
- [x] a failing Critical QA job prevents Pages publication;
- [x] temporary P6 baseline/diagnostic workflows are not part of the persistent repository gate.

### Known non-blocking maintenance debt

P6 intentionally does not hide warning output:

- 80 ESLint warnings remain, principally legacy `no-explicit-any`, `set-state-in-effect` and component-helper export patterns;
- some passing hook tests emit React `act(...)` warnings;
- mocked select harnesses emit known DOM nesting warnings;
- `npm ci` reports 17 dependency vulnerabilities (2 low, 4 moderate, 11 high).

None of these outputs currently changes the exit status of the accepted critical gate. They remain maintenance/security-review debt and are not represented as zero technical debt.

### P6 result

**PASS / DONE.** D-019 makes repository-wide Critical QA mandatory for integration/publication.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1.
- **QG-005 period statement/aging semantics:** RESOLVED / P3-S2.
- **QG-006 backup validation/recovery depth:** RESOLVED / P5.
- **QG-007 stale/global test expectations:** RESOLVED / P6.
- **QG-008 deployment does not require full QA:** RESOLVED / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.
- **QG-010 persistence architecture:** RESOLVED / P4.

## QA policy entering P7

Every P7 behavior change must preserve P1–P6 contracts and pass the persistent Critical QA gate. Do not weaken tests/workflows to accommodate a UX change; classify and fix real regressions, and keep new business-module work outside P7.
