# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P6 repository-wide QA reconciliation, gated deployment and P6 closure

### Baseline reconstructed

Before changing expectations, P6-S1 inventoried npm scripts, ESLint, Vitest, Playwright and GitHub Actions and ran the full repository baseline. Initial results were:

- lint: 81 errors;
- Vitest: 10 failed / 149 passed;
- Playwright: 10 failed / 3 passed;
- build: PASS.

The failures were classified instead of treating every red test as permission to change product behavior.

### Reconciled stale QA debt

- test harnesses now reproduce required Router/QueryClient/browser API context;
- incomplete child mocks and ambiguous dashboard assertions were corrected;
- E2E selectors were aligned with current accessible form/select/command UI;
- the PDF no-movement expectation was aligned with D-015: a zero-movement period remains a valid statement/extract;
- the existing lint debt that would require broad behavior-changing refactors remains visible as warnings rather than being silently disabled or used to justify out-of-scope product changes.

### Real regression fixed

The full E2E gate exposed one real integration defect in global search. `useSearch()` already produces the filtered Dexie result set, but `cmdk` applied an additional internal filter. `CommandDialog` now uses `shouldFilter={false}` so external search results are authoritative; the search-and-navigate E2E protects this behavior.

### Added

- `npm run test:run` for non-watch Vitest;
- `npm run test:e2e` for Playwright;
- `npm run qa:critical` combining lint + full Vitest + Playwright + production build;
- persistent `.github/workflows/ci.yml` Critical QA on PRs to `develop`/`main`, pushes to `develop` and manual dispatch.

### Deployment safety

GitHub Pages deployment from `main` now uses the strict dependency chain:

```text
quality (qa:critical) -> build -> deploy
```

CI/deploy installs dependencies with `npm ci`; Chromium is installed before Playwright. A failed critical suite blocks publication.

### Validation

Persistent functional run **`32064801009` — PASS**:

- ESLint: 0 errors / 80 recorded warnings;
- Vitest: 39 files / 159 tests passing;
- Playwright Chromium: 13/13 passing;
- production build passing.

Temporary P6 baseline/diagnostic workflows were removed; only the persistent Critical QA/deploy workflows remain.

### Decision and canonical state

- D-019 accepted: Critical QA is mandatory for V2 integration and publication from `main`;
- QG-007 stale/global expectations resolved;
- QG-008 unsafe deployment gating resolved;
- P6 is `DONE`;
- `NEXT_ACTION` advances only to P7-S1 operational UX gap inventory/prioritization.

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
