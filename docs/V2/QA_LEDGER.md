# Easy V2 — QA Ledger

**Updated:** 2026-08-28

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

PR #92 was squash-integrated into `develop` as `3f9bafca186951f363c20e990a791a771a4cf35d`. Git object inspection confirms the integrated tree is `f973d83aa8116fef7254dd056a5c5e99debbf063`, exactly the same tree as the D-019-validated merge ref. Integrated-tree equivalence: **PASS**.

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

## P10-S3-I2-I3-D early-use change #8 — catalog classification visibility — PASS / INTEGRATED

### Scope review — CURRENT-CATALOG PRESENTATION ONLY

PR #98 is bounded to current catalog context at the two authorized points of use:

- item catalog desktop table and mobile cards;
- new-order item selection;
- a small shared resolver for current category/optional-subcategory labels;
- focused resolver, catalog and transaction-form tests.

The catalog now shows `category › optional subcategory` where resolvable. Legacy/unresolved current-catalog references are shown as `Sem classificação` instead of receiving guessed data. The new-order selector shows the same context while preserving its existing price information; its search key remains item name only, so change #9 search/filter scope is not bundled.

No transaction mutation code, immutable D-025/D-033 order snapshots, database/schema, Supabase/API/policy, financial/history semantics, recovery, Auth/RLS or deployment behavior changed.

### Final D-019 — PASS

- feature head: `66026aa340f3b9aba1e8692f11d51ee751a8778b`;
- exact GitHub-generated merge ref checked out by Actions: `2d3ab8ba9ff0af179337eb7654b7bfddb5f5a24f`;
- validated tree: `01bef29624079f90a8b1b0089c183abc26f96149`;
- run/job: `33082398941` / `98552849392`;
- repository Critical QA workflow: **PASS**;
- Vitest: **65 files / 276 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #98 was squash-integrated into `develop` as `2c9d67221e3365b9476a95947906a6f4c21ecc7f`. Git object inspection confirms the integrated commit tree is `01bef29624079f90a8b1b0089c183abc26f96149`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #8 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched.

## P10-S3-I2-I3-D early-use change #9 — practical item/reseller search and filters — PASS / INTEGRATED

### Scope review — UI / READ-MODEL ONLY

PR #100 changes only the list UI and focused tests:

- item catalog name search;
- item category, category-scoped optional subcategory and lifecycle filters;
- reseller search across existing name, phone and email fields;
- reseller lifecycle filter;
- filtered item empty-state presentation;
- focused integration coverage for combined filtering and contact-field search.

Search normalization ignores case and accents. Category/subcategory controls reuse existing searchable-selector infrastructure; lifecycle remains a small closed-list selector. Filter values are transient page state over already loaded data and are not persisted. Legacy/unresolved current item classification remains explicit as `Sem classificação` rather than being guessed.

No database/schema migration, Supabase/API/policy, business mutation, fuzzy identity inference, destructive bulk action, lifecycle/history semantic, financial/recovery, Auth/RLS or deployment behavior changed.

### Final D-019 — PASS

- feature head: `df6efcee47d6a43941cbdbd273ec95bb93f56059`;
- exact GitHub-generated merge ref checked out by Actions: `e0eba21d9a695be4b7bab918c8faa72de060039b`;
- validated tree: `83e27d1d63685eee1a4ae6bc751b30e8dccba786`;
- run/job: `33086388558` / `98567054353`;
- repository Critical QA (`lint + Vitest + Playwright + production build`): **PASS**.

PR #100 was squash-integrated into `develop` as `b6d92db102d7ba17b920e8c41282a5075697bc04`. Git object inspection confirms the integrated commit tree is `83e27d1d63685eee1a4ae6bc751b30e8dccba786`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #9 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched.

## P10-S3-I2-I3-D early-use change #10 — payment/signal observations — PASS / INTEGRATED

### Scope review — FORM / EXISTING TRANSACTION CONTRACT ONLY

Verification confirmed no new persistence contract was required:

- `Transaction.observation` and `NewTransactionInput` already support the field;
- local sanitization/persistence already preserves observation for non-order movements;
- `CloudNewTransactionInput` and `createCloudTransaction` already pass `p_observation`;
- the current D-033 `create_transaction` PostgreSQL RPC already stores `p_observation` for payments/signals;
- full correction and transaction history already support the same observation field.

PR #102 therefore changes only `TransactionForm` and its focused test file. The observation field is available for order/payment/signal creation, normalized once in the common create payload and reset with the rest of the form. Existing order placeholder/behavior remains preserved. Tests explicitly create both a payment and a signal with a trimmed observation and verify no item reference is introduced.

No database/schema migration, Supabase function/policy, financial-effect, occurrence-date, reversal/correction/history, PDF, recovery, Auth/RLS or deployment behavior changed.

### Final D-019 — PASS

- feature head: `ebc9c4bc389e3f7ba75a084d67e764e64e75dafd`;
- exact GitHub-generated merge ref checked out by Actions: `f0da9706933804c53a0dc0edd41cfaaafebee59e`;
- validated tree: `a0f26f3c979b758f8c70f43a797689f47f2bc3a5`;
- run/job: `33089151402` / `98576935845`;
- repository Critical QA (`lint + Vitest + Playwright + production build`): **PASS**.

PR #102 was squash-integrated into `develop` as `2ce88ab7418715ef399b4b05b4776f6191d64a88`. Git object inspection confirms the integrated commit tree is `a0f26f3c979b758f8c70f43a797689f47f2bc3a5`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #10 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched.

## P10-S3-I2-I3-D early-use change #11 — actionable global item search result — PASS / INTEGRATED

### Scope review — NAVIGATION / EXISTING CATALOG FILTER ONLY

Verification confirmed that item results in the global command center previously navigated to generic `/items`, discarding the selected result context. PR #104 changes only the item-result handoff, the existing catalog page's one-shot query handling and focused tests:

- selected item results navigate with an encoded `search` query containing the item title;
- `ItemsPage` consumes that value into the already accepted #9 transient item-name search state;
- the navigation parameter is removed with history replacement after applying the intent;
- recent and normal item results share the same `onSelect` path;
- reseller navigation and existing create suggestions remain unchanged.

The catalog's existing substring/case/accent-insensitive name matching, lifecycle behavior and classification semantics remain unchanged. No new detail route, database/schema migration, Supabase/Auth/RLS, recovery, item identity/history or deployment behavior changed.

### Focused coverage — PASS

- `CommandCenter.test.tsx` verifies an item result navigates to the catalog with the encoded selected-item search handoff;
- `ItemsPage.test.tsx` verifies the one-shot handoff populates the existing search control, exposes the matching item context, hides a nonmatching item and keeps `Limpar filtros` available.

### Final D-019 — PASS

- feature head: `e95b36b111aac38b7ec32ff2649b2daf22aad3de`;
- exact GitHub-generated merge ref checked out by Actions: `409243291c33deed745ab04e857e8c5e5da05f5e`;
- validated tree: `507bdbc9c81efc45ef36a6d7dab9e44dc2444866`;
- run/job: `33093633207` / `98592735176`;
- ESLint: **0 errors / 104 warnings**;
- Vitest: **65 files / 282 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #104 was squash-integrated into `develop` as `46f85bb5f1e8304a323b8c4a8c99f429e52eca5d`. Git object inspection confirms the integrated commit tree is `507bdbc9c81efc45ef36a6d7dab9e44dc2444866`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #11 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched.

## P10-S3-I2-I3-D early-use change #12 — non-blocking duplicate-data warnings — PASS / INTEGRATED

### Scope review — FORM / ALREADY LOADED DATA ONLY

Verification confirmed no persistence contract or uniqueness rule was needed. PR #106 changes only the two existing create/edit forms plus focused tests:

- `ResellerForm` reuses the loaded reseller list to surface likely duplicates during new creation;
- reseller matching is deliberately conservative: normalized exact name, normalized exact phone or exact case-insensitive e-mail;
- the warning reports which fields matched and includes archived records;
- `ItemForm` reuses the loaded item list and warns only when normalized name matches within the same category and same optional subcategory;
- same-name items in another classification are not flagged;
- archived items remain visible in warning context;
- edit paths are unchanged;
- warnings are non-blocking and the operator can explicitly submit through `Cadastrar mesmo assim`.

No automatic merge, silent rejection, hard uniqueness constraint, database/schema migration, Supabase/Auth/RLS, recovery, financial/history semantic or deployment behavior changed.

### Focused coverage — PASS

- `ItemForm.test.tsx` verifies normalized same-name detection in the same classification, archived-item visibility, explicit creation despite warning and no warning for a same-name item in a different category;
- `ResellerForm.test.tsx` verifies name/phone/e-mail normalization, archived-reseller visibility and explicit creation despite warning;
- existing rejected-create/edit retry-state coverage remains intact.

### D-019 iteration — objective failure corrected, not waived

The first run/job `33100789877` / `98617616754` reached lint with 0 errors / 104 warnings, then Vitest stopped with three failures in `ResellerForm.test.tsx`. The new `useResellers()` duplicate lookup caused that test file to exercise IndexedDB, but unlike the item-form tests it did not initialize the existing `fake-indexeddb` test environment. The runtime implementation was not changed to bypass the failure; `import 'fake-indexeddb/auto'` was added to the test setup and the full gate was rerun.

### Final D-019 — PASS

- feature head: `fed6c0ab1e23cbff4298dba11d8c827d5cc06cc6`;
- exact GitHub-generated merge ref checked out by Actions: `5e26f76a227f9c90417767bfbacb34ddfe2098da`;
- validated tree: `fa34f9c6811ce0bc63c2d0aa1cd5f4d7efd2e13d`;
- run/job: `33101052183` / `98618533607`;
- ESLint: **0 errors / 104 warnings**;
- Vitest: **65 files / 285 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #106 was squash-integrated into `develop` as `7d023e856e0883ba82b2392199d3320d431aa16a`. Git object inspection confirms the integrated commit tree is `fa34f9c6811ce0bc63c2d0aa1cd5f4d7efd2e13d`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #12 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched. Change #13 is promoted only as the next authorized item and was not implemented here.

## P10-S3-I2-I3-D early-use change #13 — product-level financial report analytics — PASS / INTEGRATED

### Scope review — READ-MODEL / EXISTING REPORT PATH ONLY

Verification confirmed the existing transaction contract already carries the immutable order-time facts required for product analytics: item id/name, quantity, category/subcategory ids/names, total and financial occurrence time. PR #108 therefore stays inside the existing `FinancialReport` calculation/projection path.

PR #108 changes only:

- `src/domain/financialReporting.ts` to add canonical `report.products` aggregation;
- `src/pages/ReportsPage.tsx` to project product performance and the actual top-selling product;
- `src/services/financialReportPdfService.ts` to render the same canonical product list in the existing products/categories PDF section;
- focused domain and PDF tests.

No database/schema migration, Supabase/RPC/Auth/RLS change, transaction mutation, recovery mechanism, financial occurrence/reversal semantic or deployment workflow changed.

### Focused coverage — PASS

- repeated orders with the same exact transaction-time item/name/classification snapshot aggregate together;
- the same stable item under a different historical name/classification remains a distinct historical row rather than being rewritten from current catalog state;
- reversed orders are excluded from effective product totals through the existing report filtering path;
- product quantity, order count and gross sales are verified;
- the PDF product table consumes `FinancialReport.products` rather than recalculating product totals.

### Final D-019 — PASS

- feature head: `7b8699280e289c706a5d21ffae23a7267d07191b`;
- exact GitHub-generated merge ref checked out by Actions: `43d7ebf749ca3924fcebe9fe8cd85d7351e5354a`;
- validated tree: `b8575e6c80a0d43109c25a307dc0faa183245262`;
- run/job: `33103464797` / `98626992003`;
- ESLint: **0 errors / 104 warnings**;
- Vitest: **65 files / 286 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #108 was squash-integrated into `develop` as `d5b2cc5fb150777f12ece38bdd02abcada2974f7`. Git object inspection confirms the integrated commit tree is `b8575e6c80a0d43109c25a307dc0faa183245262`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #13 closure is documentation-only. No failed executable gate was waived, no automatic Vercel publication occurred, no database/Supabase change was made and `main` remains untouched. Change #14 was promoted next but later deferred by operator decision before implementation.

## P10-S3-I2-I3-D early-use change #15 — future occurrence-date confirmation — PASS / INTEGRATED

### Scope review — FORM / D-014 INTENT CHECK ONLY

Verification confirmed the existing new-transaction form already:

- defaults `occurrenceDate` from the operator's local date;
- parses the selected date into a distinct `occurredAt` value;
- keeps registration/audit time separate;
- accepts a valid future occurrence date without changing the transaction contract.

PR #111 changes only `src/components/transactions/TransactionForm.tsx` and `src/components/transactions/TransactionForm.occurrence.test.tsx`. The form now checks whether a valid selected occurrence date is later than the operator's local current date before mutation. A responsive confirmation offers `Voltar e corrigir` or `Cadastrar mesmo assim`.

No database/schema migration, Supabase/RPC/Auth/RLS, transaction-accounting, correction/reversal/history, recovery or deployment behavior changed. The existing transaction creation path still receives the same explicit `occurredAt` after confirmation.

### Focused coverage — PASS

`TransactionForm.occurrence.test.tsx` now has 3 passing tests and verifies:

1. the occurrence date still defaults to today and remains editable;
2. a selected non-future financial date persists independently from registration time without a confirmation dialog;
3. a future date creates no transaction before confirmation, `Voltar e corrigir` performs no write, and `Cadastrar mesmo assim` persists exactly the selected future year/month/day.

### Final D-019 — PASS

- feature head: `6b0e86139265fdf06f482ae2fdb17d275212a79a`;
- exact GitHub-generated merge ref checked out by Actions: `650a28b4f53f484cec79bf4b80f4842364e3ee66`;
- validated tree: `c6f2ecb9e1e63c244a1cd305abbe51ebd54b5811`;
- run/job: `33108818780` / `98645846558`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **65 files / 287 tests PASS**;
- focused occurrence-form tests: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No failed D-019 iteration was waived. The workflow also emitted the already tracked non-blocking mocked-select/React `act(...)`, lint-warning and package-audit debt; none became an objective gate failure.

PR #111 was squash-integrated into `develop` as `bee3e2cee2852c9bf0683fe5d564b34cef569c8a`. Git object inspection confirms the integrated commit tree is `c6f2ecb9e1e63c244a1cd305abbe51ebd54b5811`, exactly the same tree as the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration change #15 closure is documentation-only. Change #14 remains deferred/on hold and no later bounded early-use queue item is authorized.

## D-035 DR-02 — canonical Dashboard read-model — PASS / INTEGRATED

### Scope review — READ-MODEL / EXISTING ACCOUNTING PATH ONLY

Verification before implementation confirmed the operational Dashboard hooks were separately reading/reducing the same transactions, while transaction/reseller mutations already invalidate the `['dashboard']` query prefix. It also confirmed `calculateOutstandingDebtLots` correctly implements accepted FIFO allocation but does not impose an as-of cutoff by itself.

PR #114 is bounded to three executable files:

- `src/domain/dashboardSnapshot.ts` — canonical read-only Dashboard projection;
- `src/domain/dashboardSnapshot.test.ts` — focused domain coverage;
- `src/hooks/useDashboard.ts` — shared snapshot query plus compatibility mapping for existing operational hooks.

The snapshot reuses `buildFinancialReport` for month-to-today/today flow and existing effective-transaction/FIFO helpers for current position and aging. Before FIFO reconstruction it filters valid effective transactions through `endOfDay(asOf)`, so legitimate future occurrence dates later than the operator's current local day cannot change current debt/aging before occurrence. Recent registrations are separately ordered by `createdAt` and can retain legitimate future-occurrence registration context while reversed rows remain excluded.

No Dashboard visual redesign, DR-04 action-center UI, Performance/Reports re-home, database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change was bundled.

### Focused coverage — PASS

`src/domain/dashboardSnapshot.test.ts` has **3/3 PASS** and verifies:

1. month/today flow, as-of-today open debt, FIFO aging buckets, critical metrics and future-occurrence exclusion;
2. one-reseller-per-row attention priority plus deterministic severity/oldest-age/amount/name ordering;
3. effective recent-registration ordering and exclusion of reversed rows, plus invalid reference-date rejection.

Existing Dashboard tests also remained green inside the full Vitest run.

### Final D-019 — PASS

- feature head: `e02ab13eb8987cc6ea4865f4b3c39211380e9515`;
- exact GitHub-generated merge ref checked out by Actions: `3e09a992a20e3edf72df093c312581c88e04457b`;
- validated tree: `b9b5040abd6f217f41d4bba12f21ae05d06271dc`;
- run/job: `33115854899` / `98670186895`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **66 files / 290 tests PASS**;
- focused Dashboard snapshot tests: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The run retained only already tracked non-blocking warning/audit/chunk debt.

PR #114 was squash-integrated into `develop` as `4e3a9b28174cb64ad820f4ec60356194d1a760bb`. Git object inspection confirms the integrated tree is `b9b5040abd6f217f41d4bba12f21ae05d06271dc`, exactly the same tree validated by the PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-02 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-03 — primary Dashboard KPI row — PASS / INTEGRATED

### Scope review — PRESENTATION / CANONICAL SNAPSHOT ONLY

Verification before implementation confirmed the Dashboard still rendered the legacy `Dívida Total` / `Pedidos de Hoje` top-card pair and claimed `atualizada em tempo real`, while the integrated DR-02 `DashboardSnapshot` already exposed all accepted month/today/open/critical data required by DR-03.

PR #116 changes the Dashboard presentation and focused tests only:

- `DashboardPage` consumes `useDashboardSnapshot` for the primary row;
- `DashboardCards` renders the accepted four KPIs and compact supporting context from prepared snapshot fields;
- `DashboardPage.test.tsx` and `DashboardCards.test.tsx` verify values, loading, business empty states, responsive-content contract and removal of legacy/realtime wording.

No accounting/FIFO reconstruction, database/schema migration, Supabase/RPC/Auth/RLS, recovery, deployment-path, DR-04 attention redesign or later D-035 scope was bundled.

### D-019 iteration — objective failure corrected, not waived

The first run/job `33118356365` / `98678713093` failed in Vitest because the pre-existing `src/components/dashboard/DashboardCards.test.tsx` still instantiated and asserted the old two-card component API. The new `DashboardPage` coverage already passed. Nothing was integrated on that failed gate.

The stale focused test contract was aligned to DR-03 and a singular critical-age presentation check was added; the complete D-019 gate was rerun.

### Final D-019 — PASS

- final feature head: `57a07e35a042bcaed37eb35c8a4be039a277766f`;
- validated merge-ref tree: `d4be4496de22cb752a25c2307f4b29d5dd393b1e`;
- run/job: `33118656171` / `98679713377`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **66 files / 291 tests PASS**;
- focused `DashboardCards` tests: **4/4 PASS**;
- focused `DashboardPage` tests: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

The successful gate retained only already tracked non-blocking React/test/lint/audit/chunk warnings.

PR #116 was squash-integrated into `develop` as `345a84f3d94d65515671a928b627e7d2d62eb687`. Git object inspection confirms the integrated tree is `d4be4496de22cb752a25c2307f4b29d5dd393b1e`, exactly the same tree validated by the final PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-03 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-04 — `Precisa de atenção` action center — PASS / INTEGRATED

### Scope review — PRESENTATION / CANONICAL ATTENTION PROJECTION ONLY

Verification before implementation confirmed that `DebtHealthAgingCard` still rendered two independent critical/attention lists and recomputed displayed ages in the UI, even though the integrated DR-02 snapshot already supplied deduplicated `attentionRows` with deterministic order, status, prepared age, alert amount and current total open balance.

PR #118 is bounded to Dashboard presentation and focused tests:

- adds `AttentionCenter` immediately after the DR-03 KPI row;
- consumes prepared `DashboardSnapshot.attentionRows` without sorting or rebuilding FIFO/accounting/age classification;
- removes only the duplicated alert lists from `DebtHealthAgingCard` while retaining its existing donut and aging legend for DR-05;
- adds focused `AttentionCenter` coverage and verifies the Dashboard passes snapshot rows into the new block.

No database/schema migration, Supabase/RPC/Auth/RLS, recovery, deployment-path, Reports, DR-05 aging redesign, DR-06 quick actions/recent registrations or later D-035 scope was bundled.

### Focused coverage — PASS

`AttentionCenter.test.tsx` has **4/4 PASS** and verifies:

1. prepared canonical row order, explicit `CRÍTICO` / `ATENÇÃO`, prepared age and alert amount, plus conditional total open balance;
2. row activation reaches the existing reseller detail route;
3. the initial six-row presentation remains compact and expands/collapses explicitly when more priorities exist;
4. the empty state communicates the business condition and does not claim reseller master data is missing.

`DashboardPage.test.tsx` remains **3/3 PASS** and verifies the prepared snapshot rows are handed to the action center while DR-03 KPI semantics stay intact.

### Final D-019 — PASS

- feature head: `f035b6be20c5ea3dfbcbe912474abc945123611f`;
- exact GitHub-generated merge ref checked out by Actions: `124fa0bd812250d3822aca1a6be46eb5400dba61`;
- validated tree: `69905255e836492e8b610ea1ae0ef8bf66d0d070`;
- run/job: `33121893821` / `98690519373`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **67 files / 295 tests PASS**;
- focused `AttentionCenter` tests: **4/4 PASS**;
- focused `DashboardPage` tests: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking React/test/lint/audit/chunk warnings.

PR #118 was squash-integrated into `develop` as `4bac76dd83c31016b692efb17531fbf3eddf5122`. Git object inspection confirms the integrated tree is `69905255e836492e8b610ea1ae0ef8bf66d0d070`, exactly the same tree validated by the PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-04 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-05 — compact carteira aging — PASS / INTEGRATED

### Scope review — PRESENTATION / CANONICAL AGING PROJECTION ONLY

Verification before implementation confirmed `DebtHealthAgingCard` still rendered a large Recharts donut and percentage-only legend through the legacy compatibility hook, while DR-02 already supplied canonical `DashboardSnapshot.agingBuckets` with exact value + percentage and the Dashboard page already held the shared snapshot.

PR #120 changes only Dashboard presentation and focused tests:

- replaces the large donut with compact exact-value + percentage rows;
- passes prepared `agingBuckets` and `openDebt.amount` from `DashboardPage` into the aging card;
- preserves the accepted bucket order/threshold labels;
- removes no DR-04 attention behavior and leaves `PerformanceAnalysisSection` untouched for DR-07;
- adds focused aging-card tests and Dashboard handoff coverage.

No domain/FIFO helper, `DashboardSnapshot` calculation, database/schema, Supabase/RPC/Auth/RLS, recovery, deployment-path, DR-06 recent-registration/quick-action or later D-035 scope was bundled.

### Focused coverage — PASS

`DebtHealthAgingCard.test.tsx` has **4/4 PASS** and verifies:

1. the three prepared buckets render exact pt-BR values and prepared percentages with no former SVG chart;
2. a deliberately non-derived `12.5%` snapshot percentage is displayed as `12,5%` rather than being recalculated from value/total;
3. zero current debt uses a business-meaningful empty state while all three zero buckets remain explicit;
4. loading remains compact and does not render the former chart.

`DashboardPage.test.tsx` remains **3/3 PASS** and verifies `agingBuckets` plus the current open-debt total are handed from the shared snapshot to the aging block while DR-03/DR-04 behavior stays intact.

### Final D-019 — PASS

- feature head: `972ad8ae0285e654a5b356a55251807c35d72dd7`;
- exact GitHub-generated merge ref checked out by Actions: `ea9997d379d1c9f30cf398574dfa28545f37e7c4`;
- validated tree: `6848853b03148d78c79474d6415d9732ec4af8e5`;
- run/job: `33124288969` / `98698548321`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **68 files / 299 tests PASS**;
- focused `DebtHealthAgingCard` tests: **4/4 PASS**;
- focused `DashboardPage`: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking React/test/lint/audit/chunk warnings.

PR #120 was squash-integrated into `develop` as `cccf11fece99179aa895964c8b743cff29ce9e0f`. Git object inspection confirms the integrated tree is `6848853b03148d78c79474d6415d9732ec4af8e5`, exactly the same tree validated by the PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-05 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-06 — recent registrations + quick actions — PASS / INTEGRATED

### Scope review — PRESENTATION / EXISTING NAVIGATION AND WRITE PATH ONLY

Verification before implementation confirmed:

- `DashboardSnapshot.recentRegistrations` already supplies effective non-reversed registrations in canonical `createdAt` descending order;
- the current Dashboard already owns the shared snapshot and has the integrated DR-03/04/05 operational blocks;
- `/transactions?type=order|payment|signal` already initializes the existing `TransactionForm` through `TransactionsPage`;
- `/resellers/:id` already provides the related reseller detail/history surface;
- `PerformanceAnalysisSection` remains the separate legacy analytical block reserved for DR-07.

PR #122 is bounded to six Dashboard/test files:

- adds `DashboardQuickActions` with the three accepted transaction intents through existing route context;
- adds `RecentRegistrations` consuming prepared snapshot rows without presentation-side sorting/effective/reversal reconstruction;
- integrates quick actions into the page identity/header and recent activity immediately after aging;
- preserves Performance unchanged below the newly complete operational hierarchy;
- adds focused quick-action/recent-registration tests plus Dashboard snapshot-handoff coverage.

No domain/FIFO/accounting helper, transaction write form/path, database/schema, Supabase/RPC/Auth/RLS, recovery, deployment-path, Reports or DR-07/later scope was changed.

### Focused coverage — PASS

`RecentRegistrations.test.tsx` has **4/4 PASS** and verifies:

1. prepared row order is projected unchanged while `Pedido`, `Pagamento` and `Sinal` plus pt-BR values are explicit;
2. occurrence-date context appears when financial and registration calendar dates differ and is omitted when the day is the same;
3. selecting a row navigates to existing `/resellers/:id` detail/history;
4. business empty state and compact `aria-busy` loading state remain explicit.

`DashboardQuickActions.test.tsx` has **1/1 PASS** and verifies the exact existing transaction route intents for `order`, `payment` and `signal`.

`DashboardPage.test.tsx` remains **3/3 PASS** and verifies loading plus prepared DR-04/05/06 snapshot handoff without removing the existing Performance block.

### Final D-019 — PASS

- feature head: `c889e2ad73f13d2c6804a8248863d214d27c50e2`;
- exact GitHub-generated merge ref checked out by Actions: `2b17e6c8fffd477e7716dd1ac4ad5e31848af0af`;
- validated tree: `2f31279a9e9a3bd4b84cd47e8ce1b496119d401f`;
- run/job: `33126181592` / `98704779945`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **70 files / 304 tests PASS**;
- focused `RecentRegistrations`: **4/4 PASS**;
- focused `DashboardQuickActions`: **1/1 PASS**;
- focused `DashboardPage`: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking React/test/lint/audit/chunk warnings.

PR #122 was squash-integrated into `develop` as `1425fe0736dbf919e47c9c0c5bfb593331cec469`. Git object inspection confirms the integrated tree is `2f31279a9e9a3bd4b84cd47e8ce1b496119d401f`, exactly the same tree validated by the PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-06 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-07 — Dashboard Performance removal + Reports handoff — PASS / INTEGRATED

### Scope review — PRESENTATION / EXISTING REPORTS NAVIGATION ONLY

Verification before implementation confirmed:

- the integrated DR-03/04/05/06 operational Dashboard already provides the accepted KPI, attention, aging, recent-registration and quick-action hierarchy;
- `DashboardPage` still rendered `PerformanceAnalysisSection` after recent activity;
- that legacy block owned the configurable `90/180/360` window, concentration/Pareto/current-top-debtor/open-balance-ranking presentation;
- `/reports` already exists in application routing/navigation and defaults to the existing current-month report behavior;
- DR-08 is the separately queued analytical Reports refinement, so DR-07 must not alter `FinancialReport` or Reports analysis content.

PR #124 is bounded to Dashboard presentation/navigation plus focused and E2E contract coverage:

- `DashboardPage` no longer renders `PerformanceAnalysisSection`;
- `DashboardReportsHandoff` adds compact `Análise detalhada` context and one `Abrir Relatórios` link to the existing `/reports` route;
- operational DR-03/04/05/06 blocks remain in the same priority order;
- legacy Performance code remains outside the rendered Dashboard for the isolated DR-08 re-home/refinement step;
- Reports content/default period/accounting semantics remain unchanged;
- no database/schema, Supabase/RPC/Auth/RLS, recovery or deployment-path change was introduced.

### Focused coverage — PASS

- `DashboardReportsHandoff.test.tsx`: **1/1 PASS**, proving explicit contextual copy and `/reports` route target;
- `DashboardPage.test.tsx`: **3/3 PASS**, covering loading/loaded/empty operational projection with handoff present and legacy `Análise de Performance` absent;
- the DR-07 Playwright contract verifies the legacy Performance/window/Pareto/open-balance ranking UI is absent from Dashboard and `Abrir Relatórios` reaches the existing Reports workspace.

### D-019 iteration — objective failure corrected, not waived

The first run/job `33127787667` / `98709950744` was **FAIL** and blocked integration. ESLint had 0 errors / 105 warnings and Vitest passed **71 files / 305 tests**, including all new DR-07 focused coverage, but four scenarios in the pre-existing `tests/e2e/performance-analysis.spec.ts` still asserted the exact legacy Performance UI that DR-07 is authorized to remove. Because Playwright failed 4/17, the command chain stopped before build. Nothing was integrated.

Only that stale E2E contract was aligned to the accepted DR-07 product behavior; runtime scope was not broadened and no failure was waived. The complete D-019 command chain was rerun on the new head.

### Final D-019 — PASS

- final feature head: `ca961ed86f3d4851b8fe7a9e25c0981544db1005`;
- exact GitHub-generated merge ref checked out by Actions: `4b84139f38fbf6ef35fcf3e950b5997c2adc1ba0`;
- validated tree: `d9f0ed070b6e346d09e3f3035ee737a4245be4f1`;
- run/job: `33128164262` / `98711165562`;
- ESLint: **0 errors / 105 warnings**;
- Vitest: **71 files / 305 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking lint/audit/Node-deprecation/Vite chunk warnings.

PR #124 was squash-integrated into `develop` as `61ef0646ebae5c39dff68c9a4aa249cb4a3dad2f`. Git object inspection confirms the integrated tree is `d9f0ed070b6e346d09e3f3035ee737a4245be4f1`, exactly the same tree validated by the final PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-07 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-08 — Reports analytical refinement — PASS / INTEGRATED

### Scope review — READ-MODEL / REPORT PRESENTATION / CANONICAL `FinancialReport` ONLY

Verification before implementation confirmed the integrated Reports workspace already had canonical period filtering, product/category/reseller projections and PDF parity, but still exposed `Pedidos` in the primary KPI row, hid the concrete previous comparison range and lacked bounded product/reseller investigation controls and canonical Pareto/open-balance analysis. The removed Dashboard Performance path also mixed configurable sales windows with accumulated current-debt ranking and therefore was not reusable as-is.

PR #125 is bounded to six report/domain/test files:

- `src/domain/financialReporting.ts` extends canonical comparison with previous `periodNet` and centralizes `resellerAnalysis` for selected-period reseller-sales Pareto/concentration plus report-end positive open balances;
- `src/pages/ReportsPage.tsx` applies the accepted primary KPI hierarchy, explicit comparison ranges, bounded product/reseller investigation controls and canonical analytical re-home;
- `src/services/financialReportPdfService.ts` aligns the PDF summary to the same primary financial hierarchy;
- focused domain, Reports page and PDF tests cover those contracts.

No Dashboard operational component, financial mutation/accounting path, database/schema, Supabase/RPC/Auth/RLS, recovery or deployment workflow changed. DR-09 was not bundled.

### Focused coverage — PASS

- `financialReporting.test.ts`: **8/8 PASS**, including effective occurrence/reversal semantics, immutable product snapshots, report-end debt, selected-period Pareto/open balances, equal-length comparison with net movement and timeline;
- `ReportsPage.test.tsx`: **3/3 PASS**, covering primary KPI/comparison hierarchy, product investigation controls and reseller Pareto/open-balance/search behavior;
- `financialReportPdfService.test.ts`: **3/3 PASS**, including screen/PDF primary financial hierarchy and selected-section behavior.

### D-019 iteration — objective failure corrected, not waived

The first run/job `33162503781` / `98820074403` was **FAIL** and blocked integration. ESLint completed with 0 errors / 108 warnings. The DR-08 domain tests were 8/8 PASS and PDF tests 3/3 PASS; `ReportsPage.test.tsx` was 2/3 PASS. The full Vitest run stopped at **72 files: 71 passed / 1 failed; 309 tests: 308 passed / 1 failed** because one newly written test used `getByText('Recebimentos')`, while the rendered page legitimately contained that label both as a primary KPI and inside the reseller highlight. Playwright and build did not execute because the command chain stopped. Nothing was integrated.

Only the test query was made precise by targeting the card-title semantic slot. Runtime/product behavior did not change, scope did not expand and no objective failure was waived. The complete D-019 gate was rerun on the new head.

### Final D-019 — PASS

- final feature head: `ab3123898d493a011448409e7e98ea86ca1aa8ca`;
- exact GitHub-generated merge ref checked out by Actions: `b08cd97e8dc2ad4c0755fcedcd0a01ebc9b72dd6`;
- validated tree: `2f36a92aecd12331fae57b39b693f84420c1d81c`;
- run/job: `33162771608` / `98820945908`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **72 files / 309 tests PASS**;
- focused `financialReporting`: **8/8 PASS**;
- focused `ReportsPage`: **3/3 PASS**;
- focused `financialReportPdfService`: **3/3 PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking React/test/lint/audit/Node-deprecation/Vite chunk warnings.

PR #125 was squash-integrated into `develop` as `c3e43f37802d1e487a50097689c385f8e3de8b78`. Git object inspection confirms the integrated tree is `2f36a92aecd12331fae57b39b693f84420c1d81c`, exactly the same tree validated by the final PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-08 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched.

## D-035 DR-09 — final Dashboard/Reports UX and efficiency acceptance — PASS / INTEGRATED

### Scope review — FINAL ACCEPTANCE / ACCESSIBILITY / RESPONSIVE E2E ONLY

The final acceptance pass reviewed the fully integrated DR-03…DR-08 Dashboard/Reports product across representative desktop and mobile widths, including priority/order, loading/empty behavior already covered by focused Dashboard tests, Dashboard -> Reports navigation/direct route behavior, report investigation controls, business wording, keyboard semantics and horizontal overflow.

Concrete defects found were limited to Reports interaction semantics: the period/filter/sort Select triggers had visual labels without programmatic label association, the report-section controls did not expose their active state, and expandable category drilldown controls did not expose expansion state/controlled-region semantics. PR #126 fixes only those evidence-backed defects and adds focused/E2E acceptance coverage. It does not change `DashboardSnapshot`, `FinancialReport`, financial/accounting semantics, screen/PDF calculations, database/schema, Supabase/RPC/Auth/RLS, recovery or deployment behavior.

### Focused acceptance — PASS

- `src/pages/ReportsPage.accessibility.test.tsx`: **1/1 PASS**, proving report controls are associated with labels and section/expansion state is programmatically exposed;
- `tests/e2e/dashboard-reports-final-acceptance.spec.ts`: representative **1440x1000 desktop** and **390x844 mobile** acceptance, covering the Dashboard operational hierarchy, absence of horizontal overflow, Dashboard -> Reports handoff/direct `/reports` behavior and keyboard/semantic operation of report controls;
- existing `ReportsPage.test.tsx`: **3/3 PASS**;
- existing `financialReporting.test.ts`: **8/8 PASS**;
- existing `financialReportPdfService.test.ts`: **3/3 PASS**.

### Final D-019 — PASS

- final feature head: `f817fb09ef14ebd731027f4e75edd587c28e2761`;
- exact GitHub-generated merge ref checked out by Actions: `d702c9c9065e709b6c3d50aafc4f89041afc2cbd`;
- validated tree: `423509ce9a5a6449db76880202815513428e021c`;
- run/job: `33169683674` / `98843481388`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **73 files / 310 tests PASS**;
- Playwright: **19/19 PASS**;
- TypeScript + production Vite build: **PASS**.

No objective D-019 failure was waived. The successful run retained only already tracked non-blocking React/test/mock-select/lint/audit/Node-deprecation/Vite chunk warnings.

PR #126 was squash-integrated into `develop` as `6f20ab99340d051d2ac509125e63f32306ed0680`. Git object inspection confirms the integrated tree is `423509ce9a5a6449db76880202815513428e021c`, exactly the same tree validated by the final PR merge ref. Integrated-tree equivalence: **PASS**.

The post-integration DR-09/D-035 closure is documentation-only. No automatic Vercel publication occurred and `main` remains untouched. D-035 has no authorized DR-10.

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
- early-use change #8 catalog-classification visibility D-019: **PASS**.
- PR #98 integrated-tree equivalence: **PASS**.
- early-use change #8 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #9 list-search/filter D-019: **PASS**.
- PR #100 integrated-tree equivalence: **PASS**.
- early-use change #9 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #10 payment/signal-observation D-019: **PASS**.
- PR #102 integrated-tree equivalence: **PASS**.
- early-use change #10 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #11 actionable-global-item-search D-019: **PASS**.
- PR #104 integrated-tree equivalence: **PASS**.
- early-use change #11 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #12 duplicate-warning D-019: **PASS**.
- PR #106 integrated-tree equivalence: **PASS**.
- early-use change #12 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #13 product-report D-019: **PASS**.
- PR #108 integrated-tree equivalence: **PASS**.
- early-use change #13 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #14: **SUPERSEDED / ABSORBED BY D-035 — NO EXECUTABLE DELTA**.
- early-use change #15 future-occurrence confirmation D-019: **PASS**.
- PR #111 integrated-tree equivalence: **PASS**.
- early-use change #15 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- historical bounded early-use queue after #15: **CLOSED / NO #16**.
- D-035 DR-02 canonical Dashboard read-model D-019: **PASS**.
- PR #114 integrated-tree equivalence: **PASS**.
- D-035 DR-02 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-03 primary KPI row D-019: **PASS**.
- PR #116 integrated-tree equivalence: **PASS**.
- D-035 DR-03 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-04 attention-center D-019: **PASS**.
- PR #118 integrated-tree equivalence: **PASS**.
- D-035 DR-04 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-05 compact-aging D-019: **PASS**.
- PR #120 integrated-tree equivalence: **PASS**.
- D-035 DR-05 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-06 recent registrations + quick actions D-019: **PASS**.
- PR #122 integrated-tree equivalence: **PASS**.
- D-035 DR-06 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-07 first D-019 run/job `33127787667` / `98709950744`: **FAIL — 4 stale Playwright assertions; NOT INTEGRATED / NOT WAIVED**.
- D-035 DR-07 final D-019: **PASS**.
- PR #124 integrated-tree equivalence: **PASS**.
- D-035 DR-07 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-08 first D-019 run/job `33162503781` / `98820074403`: **FAIL — 1 ambiguous new Vitest assertion; NOT INTEGRATED / NOT WAIVED**.
- D-035 DR-08 final D-019: **PASS**.
- PR #125 integrated-tree equivalence: **PASS**.
- D-035 DR-08 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 DR-09 final Dashboard/Reports UX and efficiency acceptance D-019: **PASS**.
- PR #126 integrated-tree equivalence: **PASS**.
- D-035 DR-09 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-035 implementation sequence: **COMPLETE / NO DR-10 AUTHORIZED**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.