# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P7-S1 operational UX gap inventory and prioritization

### Scope

P7-S1 executed only the evidence/prioritization slice. No runtime, schema, persistence, financial-domain, recovery or QA-workflow behavior changed.

The inventory compared current operator-facing routes/components/tests with P1–P6 contracts and the Project Spec objective that routine operations should require few steps on desktop/mobile.

### Evidenced gaps

Ranked by operational impact, error risk and routine frequency:

1. **Transaction-entry intent and feedback** — standalone Cancel is inert; transaction creation failures are console-only; command-center `Pagamento/Sinal` always opens `payment`.
2. **Invalid reseller statement range** — a complete inverted range leaves dates filled but falls back to current/all-time view until PDF generation surfaces the error.
3. **Stale Backup page recovery copy** — top-level text still describes restore as future/preflight-only although P5-S2 restore is implemented.
4. **Item/reseller save error feedback** — mutation failures are console-only.
5. **Reseller-context transaction launch friction** — operator must reselect a reseller already known by the detail page.

Broad visual redesign, dashboard rearrangement, theme/branding, table-density preferences and speculative convenience features were not prioritized without stronger operational evidence.

### Decision and next slice

D-020 accepted: P7 fixes broken/misleading operator controls and intent/error risks before convenience/cosmetic refinement.

P7-S1 is `DONE`; P7 remains `IN_PROGRESS`.

`NEXT_ACTION` advances only to **P7-S2 — Reliable transaction-entry intent and feedback**:

- make standalone Cancel reset/clear the in-progress transaction while preserving requested initial type;
- surface transaction mutation failure visibly while preserving entered data for retry;
- split command-center payment and signal shortcuts so each preserves operator intent;
- add focused component/integration coverage plus a bounded Playwright operator path;
- run full `npm run qa:critical`.

Lower-priority P7 gaps, P8 discovery, new modules and cloud/auth work remain out of scope.

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
- existing lint debt that would require broad behavior-changing refactors remains visible as warnings rather than being used to justify out-of-scope product changes.

### Real regression fixed

The full E2E gate exposed one real integration defect in global search. `useSearch()` already produces the filtered Dexie result set, but `cmdk` applied an additional internal filter. `CommandDialog` now uses `shouldFilter={false}` so external search results are authoritative; the search-and-navigate E2E protects this behavior.

### Added

- `npm run test:run` for non-watch Vitest;
- `npm run test:e2e` for Playwright;
- `npm run qa:critical` combining lint + full Vitest + Playwright + production build;
- persistent `.github/workflows/ci.yml` Critical QA on PRs to `develop`/`main`, pushes to `develop` and manual dispatch.

### Deployment safety

GitHub Pages deployment from `main` uses the strict dependency chain `quality (qa:critical) -> build -> deploy`. CI/deploy installs dependencies with `npm ci`; Chromium is installed before Playwright. A failed critical suite blocks publication.

### Validation and decision

- persistent functional run `32064801009` — PASS;
- final canonical-docs-head run `32065331102` — PASS;
- post-merge `develop` run `32065713920` — PASS;
- D-019 accepted;
- QG-007/QG-008 resolved;
- P6 closed.

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
