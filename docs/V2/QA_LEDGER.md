# Easy V2 — QA Ledger

**Updated:** 2026-08-27

## Mandatory repository gate — D-019

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block executable integration. Supabase-bearing work additionally requires relevant database/security/policy/advisor evidence.

## Accepted historical baseline

Detailed historical runs remain available in Git/PR history and phase-specific execution records. Key accepted milestones include P9 category/correction/date work, P10-S1 rehearsal, D-029 architecture, P10-S3-I1 Supabase foundation, D-030 contract/tooling, D-031 runtime-first governance/runtime/onboarding, PR #79 grouped reseller PDF, PR #80 D-032 global recovery and PR #82 D-033 subcategories.

D-030 real operator-local unattended/off-site/retention/restore acceptance remains ON HOLD.

## D-032 operational rollout — PASS

The accepted D-032-containing `develop` candidate was manually deployed to Vercel. A fresh real Backup v2 was exported on the updated candidate, stored outside Easy and explicitly confirmed. The production store-global exact-24h recovery checkpoint is therefore operational.

This is early-use recovery evidence, not D-030 durability acceptance.

## D-033 optional subcategories — PASS / INTEGRATED

Production migration `20260826135708_i3d_subcategories` is applied. Live synthetic database proof verified category/subcategory consistency, immutable order snapshot capture and archive protection, then rolled back with zero synthetic residue.

D-019 run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. PR #82 integrated with exact tree equivalence. Canonical closure was documentation-only.

## P10-S3-I2-I3-D early-use change #4 — D-034 financial reports

### Scope review — READ-ONLY

PR #85 changes only application/reporting code and tests:

- dedicated `/reports` route/menu;
- shared `FinancialReport` calculation model;
- report screen/presets/KPIs/timeline/tabs;
- category -> subcategory and reseller reporting;
- configurable PDF adapter over the same report model;
- unit/integration coverage.

No database migration, Supabase function/policy, business mutation, recovery mechanism or deployment workflow changed.

### Domain/reporting tests — PASS

New coverage verifies:

1. period sales/receipts/order/item aggregation uses effective occurrence-time movements;
2. reversed movements contribute zero;
3. previous-period comparison uses the immediately preceding equal calendar-length range;
4. report-end open debt includes earlier outstanding history rather than confusing it with period net;
5. category/subcategory groups respect immutable transaction snapshots and explicit no-subcategory/legacy behavior;
6. timeline fills the selected short range coherently;
7. financial PDF consumes report sections and supports presentation-only section selection;
8. generated PDF filename includes the selected range;
9. application navigation exposes the Reports workspace.

### D-019 iterations

Initial objective failures were not waived:

- first runs exposed only report-navigation test assumptions;
- after those were corrected, Vitest reached 268/268 and Playwright 17/17 but TypeScript caught an overly narrow Recharts tooltip formatter type;
- that build error was corrected using Recharts contextual formatter types;
- the final frozen merge-ref then passed every objective command.

### Final D-019 — PASS

- feature head: `0ad69e0a8e8eeb9e92c56cb39ec4b8489bb97fd1`;
- exact GitHub-generated merge ref checked out by Actions: `897ca59793342b29300cee0d57be92fdba1ebd68`;
- validated tree: `124767ee7afa23c0c07e7215513fa5b90d8177a5`;
- run/job: `33001910986` / `98285660448`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #85 was squash-integrated into `develop` as `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`. The integrated commit tree is exactly `124767ee7afa23c0c07e7215513fa5b90d8177a5`, identical to the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration D-034 closure changes Markdown documentation only; no executable/runtime file differs from the validated integrated tree. No failed executable gate was waived.

## P10-S3-I2-I3-D early-use change #5 — localized report period labels

### Scope review — PRESENTATION ONLY

PR #87 changes only `src/pages/ReportsPage.tsx`:

- defines one canonical period-preset value/label list;
- supplies that list to Base UI `Select` so selected values resolve to Portuguese labels;
- reuses the same list for menu entries;
- leaves internal preset identifiers and all period-range calculations unchanged.

No database migration, Supabase function/policy, financial/reporting calculation, recovery mechanism, Auth/RLS boundary or deployment workflow changed.

### Final D-019 — PASS

- feature head: `ae0ecee51e0296ab4b132892ec626abe64164204`;
- exact GitHub-generated merge ref checked out by Actions: `57ac8137673f3826cfe6a2b17a68795050d2e1b2`;
- validated tree: `ae183953e9f9248cab7ebc107fae57723ccb8aa4`;
- run/job: `33005354591` / `98297566705`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #87 was squash-integrated into `develop` as `430b36feb7563c3370a334eb4962edc7aafdc117`. Git object inspection confirms the integrated commit tree is `ae183953e9f9248cab7ebc107fae57723ccb8aa4`, exactly the same tree as the validated GitHub merge ref. Integrated-tree equivalence: **PASS**.

The post-integration change #5 closure is documentation-only. No failed executable gate was waived and no automatic Vercel publication occurred.

## P10-S3-I2-I3-D early-use change #6 — localized Dashboard performance-window labels

### Scope review — PRESENTATION ONLY

PR #90 changes only `src/components/dashboard/PerformanceAnalysisSection.tsx`:

- confirms the Dashboard selector lacked the Base UI value/label mapping already used by the accepted Reports fix;
- defines one `90` / `180` / `360` option list with Portuguese labels;
- supplies that list to Base UI `Select` so the closed trigger resolves the visible label;
- reuses the same list for the menu entries;
- leaves `AnalysisPeriod`, `usePerformanceAnalysis` and all window calculations unchanged.

No database migration, Supabase function/policy, analytics calculation, recovery mechanism, Auth/RLS boundary or deployment workflow changed.

### Final D-019 — PASS

- feature head: `34728fcdb0016dea1481ab795317de223b7c9a10`;
- exact GitHub-generated merge ref checked out by Actions: `fdfd8771589e428f219afb1b6dd1597b8f2fb64d`;
- validated tree: `f872da2c6adf492a929bd5ef02ad7a1c695a4672`;
- run/job: `33009642945` / `98312276753`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #90 was squash-integrated into `develop` as `446987475bf8621ff7ec5803149c4c6b874d5e50`. Git object inspection confirms the integrated commit tree is `f872da2c6adf492a929bd5ef02ad7a1c695a4672`, exactly the same tree as the validated GitHub merge ref. Integrated-tree equivalence: **PASS**.

The post-integration change #6 closure is documentation-only. No failed executable gate was waived and no automatic Vercel publication occurred.

## P10-S3-I2-I3-D early-use change #7 — consistent pt-BR monetary presentation

### Scope review — PRESENTATION ONLY

PR #92 standardizes only operator-facing money strings in the bounded points already identified for #7:

- reseller current and selected-period balances;
- catalog prices and the read-only calculated order total in transaction entry;
- current/replacement monetary totals in the transaction-correction dialog;
- reseller statement PDF monetary values and statement balances;
- tests for those visible outputs.

The accepted simplified formatter is a literal `R$ ` prefix plus the numeric portion formatted with `toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`. This avoids currency-style NBSP/Unicode spacing while preserving ordinary visible strings such as `R$ 150,00`, `R$ 1.200,50` and `R$ 10.000,00`.

Editable numeric inputs, parsing, numeric values, calculations, rounding, persistence, database/Supabase, Auth/RLS, financial/report semantics, historical correction/occurrence semantics and deployment behavior are unchanged.

### D-019 diagnosis — objective failure corrected, not waived

The first D-019 after the simplified implementation, run/job `33070308804` / `98510536125`, stopped in Vitest. GitHub Actions job logs identified exactly two stale test expectations:

- `src/pages/ResellerDetailPage.statement.test.tsx` still expected `R$ 100.00`, `R$ 30.00` and `R$ 130.00`;
- `src/services/pdfService.occurrence.test.ts` still expected `R$ 40.00`.

The product was already rendering the intended comma-decimal values. Only those obsolete assertions were updated to the accepted visible pt-BR presentation. No monetary-formatting behavior was reverted to make CI pass.

### Final D-019 — PASS

- feature head: `7aea7fca077e552d66bf8bc018f3fa4b49eea423`;
- exact GitHub-generated merge ref checked out by Actions: `a094ba30b968b9b5658809503803440b8cf27736`;
- validated tree: `f973d83aa8116fef7254dd056a5c5e99debbf063`;
- run/job: `33070649544` / `98511710752`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #92 was squash-integrated into `develop` as `3f9bafca186951f363c20e990a791a771a4cf35d`. Git object inspection confirms the integrated commit tree is `f973d83aa8116fef7254dd056a5c5e99debbf063`, exactly the same tree as the D-019-validated merge ref. Integrated-tree equivalence: **PASS**.

The post-integration change #7 closure changes Markdown documentation only; no executable/runtime file differs from the validated integrated tree. No failed executable gate was waived, no automatic Vercel publication occurred and `main` remains untouched.

## Operator-authorized pre-#8 reseller statement PDF refinement — PASS / INTEGRATED

### Scope review — PRESENTATION / PROJECTION ONLY

PR #94 changes only `src/services/pdfService.ts` and its three PDF test files. It does not alter transaction persistence, reversal/correction mechanics, statement balance functions, Supabase, Auth/RLS, recovery or deployment behavior.

Accepted coverage verifies:

1. existing equal-product/equal-price grouping remains intact;
2. individual valid order observations/names remain rendered on separate lines below the grouped product;
3. reversed orders, payments and signals are omitted from the PDF while remaining in immutable audit history;
4. a corrected order/payment presents only the effective replacement and no reversal/correction/replacement annotation;
5. the financial closing is rendered immediately after products as `Total dos pedidos`, `Saldo anterior`, `(-) Total de pagamentos`, `SALDO ATUAL`;
6. selected-period `Saldo anterior` uses the canonical balance before range start;
7. order/payment totals include only effective occurrence-time movements inside the selected range;
8. detailed payment/signal rows follow the closing only when an effective settlement exists and expose only `Data`, `Tipo`, `Valor`;
9. no-range behavior retains the existing supplied current balance as `SALDO ATUAL`.

### Final D-019 — PASS

- feature head: `a854cc6417f13ff9a82a9ded97f9681e36a8c718`;
- exact GitHub-generated merge ref checked out by Actions: `9d7c067172c7146c27c36acf3390068da622e3d2`;
- validated tree: `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a`;
- run/job: `33073644514` / `98522073542`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 269 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #94 was squash-integrated into `develop` as `a2283d0a9408730e8cb136fdfe602d76a05cfa7a`. Git object inspection confirms the integrated commit tree is `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration closure is documentation-only. Change #8 was not started or bundled. No failed executable gate was waived, no automatic Vercel publication occurred and `main` remains untouched.

## Operator-authorized pre-#8 searchable entity-selector refinement — PASS / INTEGRATED

### Scope review — UI / SELECTION ONLY

PR #96 adds a reusable searchable combobox using the already-installed `cmdk` infrastructure and applies it only to high-variance entity selection:

- reseller and item in new transaction entry;
- reseller and item in full transaction correction;
- category and optional subcategory in item create/edit;
- focused unit/integration test coverage and aligned selector mocks.

Search is substring-based, case-insensitive and accent-insensitive. The typed query is transient UI state only; selected values remain the existing stable entity IDs. Small closed-list selectors remain unchanged. No database migration, Supabase/API/policy, business mutation, financial/history semantic, recovery, Auth/RLS or deployment behavior changed.

### D-019 iterations — objective failures corrected, not waived

The first run/job, `33077905703` / `98536898243`, stopped in Vitest with seven failures. All seven came from pre-existing tests that still modeled affected controls as native `<select>` elements or used mocks whose empty-value behavior no longer represented the real searchable control. The dedicated `SearchableSelect` coverage itself passed.

After those stale assumptions were aligned, the second run/job, `33079060658` / `98540948912`, reached 270 passing tests and only two failures. Both were in `TransactionsPage.context.test.tsx`: a singular `getByTestId('mock-searchable-select')` became ambiguous because the page now correctly contains both reseller and item searchable selectors. The test was changed to target the `Revendedor` field by label. No production behavior changed in that final correction.

### Final D-019 — PASS

- feature head: `95be7dac0bc5db87c21fc45ac6fb0303084d70ae`;
- exact GitHub-generated merge ref checked out by Actions: `ea1b93339b8356b9a2386b26fffc878428829d0d`;
- validated tree: `569b7a7b760ba333b124094f159488b5b99fc92e`;
- run/job: `33079397875` / `98542140423`;
- ESLint: **0 errors / 98 warnings**;
- Vitest: **64 files / 272 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #96 was squash-integrated into `develop` as `20dcc0fb7469db8ae9638ab6ef39b38ca7e2ec97`. Git object inspection confirms the integrated commit tree is `569b7a7b760ba333b124094f159488b5b99fc92e`, exactly the same tree as the D-019-validated feature content. Integrated-tree equivalence: **PASS**.

The post-integration closure is documentation-only. Change #8 was not started or bundled. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched.

## Known non-blocking debt

When objective D-019 commands pass, these remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- npm audit findings observed by CI;
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning;
- Supabase Free leaked-password-protection warning;
- reviewed authenticated `SECURITY DEFINER` RPC advisor warnings for intentional operator-gated endpoints.

## Current QA status

- D-031 governance/runtime/onboarding: **PASS / INTEGRATED**.
- I3-D grouped reseller PDF: **PASS / INTEGRATED**.
- D-032 repository/database + first real global checkpoint: **PASS / OPERATIONAL**.
- D-033 database synthetic proof + D-019 + tree equivalence: **PASS / INTEGRATED**.
- D-034 reporting D-019: **PASS**.
- D-034 PR #85 integrated-tree equivalence: **PASS**.
- D-034 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #5 report period-label D-019: **PASS**.
- PR #87 integrated-tree equivalence: **PASS**.
- early-use change #5 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #6 Dashboard period-label D-019: **PASS**.
- PR #90 integrated-tree equivalence: **PASS**.
- early-use change #6 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #7 pt-BR monetary-presentation D-019: **PASS**.
- PR #92 integrated-tree equivalence: **PASS**.
- early-use change #7 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- pre-#8 reseller statement PDF D-019: **PASS**.
- PR #94 integrated-tree equivalence: **PASS**.
- pre-#8 reseller statement canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- pre-#8 searchable entity-selector D-019: **PASS**.
- PR #96 integrated-tree equivalence: **PASS**.
- pre-#8 searchable entity-selector canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #8: **CURRENT / AUTHORIZED / NOT STARTED BY THIS REFINEMENT**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.