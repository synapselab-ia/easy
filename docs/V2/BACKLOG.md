# Easy V2 — Canonical Backlog

**Updated:** 2026-08-27

This backlog records current ordered work. Historical implementation detail remains in phase execution documents and Git/PR history.

## P0–P9 — Accepted historical baseline

P0 through P9 are accepted/integrated. Major accepted outcomes include branch/governance, D-019, reversible lifecycle, audited financial corrections, occurrence-date semantics, statements/debt aging, backup/restore hardening, recovery safeguards, category identity/snapshots/reporting and full-field linked correction.

## P10 — Controlled migration / cloud transition

**Status:** `IN_PROGRESS`

### P10-S1 — Stable-v1 compatibility/rehearsal
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

### P10-S2 — Final persistence decision
**Status:** `DONE / ACCEPTED` — D-029

### P10-S3-I1 — Supabase foundation
**Status:** `DONE / ACCEPTED`

### P10-S3-I2 — Migration and durability contract
**Status:** `DONE / ACCEPTED CONTRACT` — D-030

### P10-S3-I2-I1 — Legacy private staging/import compatibility
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof
**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`

D-030 still lacks actual unattended trusted-PC execution, real off-site verification, retained daily generations and restore-drill acceptance. D-031 keeps this on hold.

### P10-S3-I2-I3-A/B — Runtime-first implementation and integration
**Status:** `DONE / ACCEPTED / INTEGRATED`

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding
**Status:** `DONE / ACCEPTED`

### P10-S3-I2-I3-D — Controlled clean-start early-use observation
**Status:** `CURRENT`

Operating boundary:

1. use the accepted candidate for real clean-start workflows;
2. keep the D-032 store-global manual Backup v2 checkpoint strictly fresher than 24 hours before normal writes;
3. implement changes only from observed early-use evidence or explicit operator instruction;
4. preserve Supabase/Auth/RLS/allow-list and controlled financial RPC semantics;
5. keep Vercel publication manual and `main` untouched.

#### Early-use change #1 — reseller PDF grouped by product
**Status:** `DONE / INTEGRATED — PR #79`

#### Early-use change #2 — store-global manual recovery checkpoint
**Status:** `DONE / ACCEPTED / INTEGRATED / OPERATIONALLY INITIALIZED — D-032 / PR #80`

The updated candidate was manually deployed and a fresh real Backup v2 was exported/stored/explicitly confirmed. The shared exact-24h checkpoint is active. D-030 remains separately ON HOLD/not accepted.

#### Early-use change #3 — one optional subcategory level
**Status:** `DONE / ACCEPTED / INTEGRATED — D-033 / PR #82`

Accepted result:

- classification is `category -> optional subcategory -> item`;
- no recursive subcategory tree;
- subcategory belongs to one category and has stable identity/lifecycle;
- item subcategory is optional and category-consistent;
- active-reference/archive integrity is enforced;
- legacy unclassified records remain non-inventive;
- orders snapshot category and optional subcategory id/name at transaction time;
- D-026 correction preserves/captures classification according to target item semantics;
- Backup v2 schema 6 contains subcategories and related snapshots;
- schema 4/5 backups remain accepted without invented subcategory data.

PR #82 passed D-019 and exact-tree integration. Production migration `20260826135708_i3d_subcategories` is applied.

#### Early-use change #4 — financial reports workspace + PDF
**Status:** `DONE / ACCEPTED / INTEGRATED — D-034 / PR #85`

Accepted result:

- dedicated `Relatórios` page rather than duplicating the glance-oriented Dashboard;
- presets plus custom period;
- KPIs for sales, receipts, report-end open debt and orders;
- equal-length previous-period comparison;
- sales/receipts timeline;
- `Resumo`, `Produtos e categorias` and `Revendedores` views;
- category -> subcategory drilldown from immutable transaction snapshots;
- reseller interval activity plus closing debt as of the selected end date;
- configurable financial PDF using the same canonical `FinancialReport` model as the screen;
- report inclusion by occurrence date and zero effective contribution from reversed transactions;
- no DB migration, mutation-path, recovery, Auth/RLS or deployment-boundary change.

D-019 run/job `33001910986` / `98285660448`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree `124767ee7afa23c0c07e7215513fa5b90d8177a5` exactly equals squash-integrated `develop@970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`.

#### Early-use change #5 — localized financial-report period labels
**Status:** `DONE / INTEGRATED — PR #87`

Observed early-use issue: the report period menu contained Portuguese options, but the selected trigger exposed Base UI's internal English identifiers such as `week` and `month`.

Accepted correction:

- internal preset identifiers remain unchanged;
- the selector receives one explicit value/Portuguese-label mapping;
- selected values display `Hoje`, `Esta semana`, `Este mês`, `Mês passado`, `Este ano` or `Personalizado`;
- report range/accounting semantics are unchanged;
- no database, Supabase/Auth/RLS, recovery or deployment behavior changed.

D-019 run/job `33005354591` / `98297566705`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub merge-ref tree `ae183953e9f9248cab7ebc107fae57723ccb8aa4` exactly equals squash-integrated `develop@430b36feb7563c3370a334eb4962edc7aafdc117` tree.

### Historical operator-authorized usability/data-quality queue

**Status:** `CLOSED / HISTORICAL — NO #16`

On 2026-08-26 the operator explicitly authorized the following early-use improvements to be evaluated and executed **one by one**, preserving the existing project safeguards. That numbered queue is now closed and must not be extended. D-035 uses a separate `DR-*` sequence.

Queue governance retained as a general execution rule:

1. Only the single item identified by `STATUS.md -> NEXT_ACTION` is executable in a task/conversation.
2. Every item starts by verifying the current implementation/runtime evidence. If the suspected issue is not reproducible, the benefit is no longer applicable, or the safe solution would cross the stated boundary, close that item as `NO_CHANGE / DEFERRED` with evidence rather than forcing a modification.
3. Each executable item uses an isolated branch from current `develop`, receives proportionate tests, and executable integration requires D-019. Supabase-bearing scope additionally requires the relevant database/security evidence.
4. Do not bundle the next queued item into the same implementation. After the current item is integrated/closed, update the canonical docs so exactly the next pending item becomes `NEXT_ACTION`, then stop. If no later item exists, record that no new queue work is authorized instead of inventing one.
5. The queue does not authorize changes to accepted financial semantics, transaction history, recovery policy, Auth/RLS/operator authorization, deployment automation, `main`, legacy-data migration or definitive cutover unless an individual item explicitly says otherwise.
6. Prefer presentation/read-model changes and existing fields/contracts. Do not introduce a database migration merely to satisfy a UX improvement when the accepted model already supports it.
7. Any unexpected dependency that would materially broaden scope requires a new operator decision instead of silent expansion.

#### Early-use change #6 — Dashboard performance-window labels
**Status:** `DONE / INTEGRATED — PR #90`

Verification confirmed the Dashboard Base UI Select lacked the explicit value/label mapping used by the accepted report selector fix. PR #90 added one shared mapping for `90`, `180` and `360`, so selected values render `Últimos 90 dias`, `Últimos 180 dias` and `Último ano` while existing `AnalysisPeriod` values and calculations remain unchanged.

D-019 run/job `33009642945` / `98312276753`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub merge-ref tree `f872da2c6adf492a929bd5ef02ad7a1c695a4672` exactly equals squash-integrated `develop@446987475bf8621ff7ec5803149c4c6b874d5e50` tree. No automatic deployment occurred and `main` remained untouched.

#### Early-use change #7 — consistent pt-BR monetary presentation
**Status:** `DONE / INTEGRATED — PR #92`

Accepted result:

- visible monetary values use a literal `R$ ` prefix plus pt-BR numeric separators with exactly two decimals;
- examples include `R$ 150,00`, `R$ 1.200,50` and `R$ 10.000,00`;
- reseller current/period balances, new-order catalog prices/read-only calculated total, correction-dialog monetary totals and reseller statement PDF values were aligned;
- editable numeric inputs remain suitable for numeric editing;
- parsing, calculations, rounding, persisted numbers, transaction/history semantics and financial/report accounting semantics are unchanged;
- no database/Supabase/Auth/RLS/recovery/deployment change was introduced.

The first D-019 after the simplified implementation exposed only two stale tests that still expected dot-decimal presentation. Those expectations were updated to the accepted visible pt-BR strings without reverting the product behavior.

Final D-019 run/job `33070649544` / `98511710752`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `a094ba30b968b9b5658809503803440b8cf27736`; validated tree `f973d83aa8116fef7254dd056a5c5e99debbf063` exactly equals squash-integrated `develop@3f9bafca186951f363c20e990a791a771a4cf35d` tree. Exact tree equivalence: PASS.

#### Operator-authorized pre-#8 refinement — client-facing reseller statement PDF
**Status:** `DONE / INTEGRATED — PR #94`

The operator explicitly paused the queue before #8 to simplify the reseller statement PDF without changing transaction/audit semantics.

Accepted result:

- current grouped-product behavior is preserved, including equal product/price aggregation and each valid order observation/name directly below the grouped item;
- reversed orders/payments/signals are omitted from the PDF only; the underlying immutable audit history remains intact;
- reversal/correction/replacement annotations are no longer rendered in the client-facing document;
- financial closing appears immediately after products as `Total dos pedidos`, `Saldo anterior`, `(-) Total de pagamentos`, `SALDO ATUAL`;
- selected-period `Saldo anterior` remains the canonical balance strictly before range start;
- period order/payment totals use only effective movements and preserve occurrence-date semantics;
- payment + signal detail remains available after the closing only when at least one effective settlement exists, with `Data`, `Tipo`, `Valor`;
- no database, financial mutation, Supabase/Auth/RLS, recovery or deployment behavior changed;
- change #8 was not started or bundled.

D-019 run/job `33073644514` / `98522073542`: 0 lint errors / 83 warnings; 63 files / 269 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `9d7c067172c7146c27c36acf3390068da622e3d2`; validated tree `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a` exactly equals squash-integrated `develop@a2283d0a9408730e8cb136fdfe602d76a05cfa7a` tree. Exact tree equivalence: PASS.

#### Operator-authorized pre-#8 refinement — searchable entity selectors
**Status:** `DONE / INTEGRATED — PR #96`

The operator explicitly kept change #8 paused to improve high-variance selectors before returning to the ordered queue.

Accepted result:

- one reusable searchable combobox uses the project's existing `cmdk` infrastructure; no new dependency or persistence field was introduced;
- filtering matches substrings, ignores case and ignores accents;
- typed search text is transient UI state only; selection continues to return the existing entity ID;
- new transaction entry uses it for reseller and item selection;
- full transaction correction uses it for reseller and item selection;
- item create/edit uses it for category and optional subcategory selection;
- small closed-list selectors such as transaction type and period/window choices remain ordinary selects;
- existing lifecycle, validation, financial/history, database/Supabase, Auth/RLS, recovery and deployment semantics are unchanged;
- change #8 was not started or bundled.

The first two D-019 attempts exposed stale test assumptions about native/select mocks and ambiguous test targeting after two searchable selectors correctly existed on the same screen. Those test-only assumptions were aligned; no product behavior or gate failure was waived.

Final D-019 run/job `33079397875` / `98542140423`: 0 lint errors / 98 warnings; 64 files / 272 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `ea1b93339b8356b9a2386b26fffc878428829d0d`; validated tree `569b7a7b760ba333b124094f159488b5b99fc92e` exactly equals squash-integrated `develop@20dcc0fb7469db8ae9638ab6ef39b38ca7e2ec97` tree. Exact tree equivalence: PASS.

#### Early-use change #8 — catalog classification visibility at point of use
**Status:** `DONE / INTEGRATED — PR #98`

Accepted result:

- the item catalog exposes the current classification path in a dedicated desktop column and beneath the item name on mobile;
- the new-order item selector exposes the same current category plus optional subcategory context while retaining the existing item price;
- legacy or unresolved current-catalog references display `Sem classificação` rather than receiving fabricated classification;
- item-selector search remains keyed to the item name only, so this change does not pre-implement change #9 filtering/search behavior;
- D-025/D-033 immutable transaction-time classification snapshots and order mutation/history behavior are unchanged;
- no database/schema migration, Supabase/Auth/RLS, recovery or deployment behavior changed.

D-019 run/job `33082398941` / `98552849392`: Critical QA PASS. The suite includes 65 Vitest files / 276 tests, 17/17 Playwright tests and the production build. GitHub Actions validated merge ref `2d3ab8ba9ff0af179337eb7654b7bfddb5f5a24f`; validated tree `01bef29624079f90a8b1b0089c183abc26f96149` exactly equals squash-integrated `develop@2c9d67221e3365b9476a95947906a6f4c21ecc7f` tree. Exact tree equivalence: PASS.

#### Early-use change #9 — practical item/reseller search and filters
**Status:** `DONE / INTEGRATED — PR #100`

Accepted result:

- item search matches name substrings and ignores case/accents;
- item filters combine category, category-scoped optional subcategory and lifecycle (`Todos`, `Ativos`, `Inativos`);
- category/subcategory filters reuse the accepted searchable-selector behavior;
- legacy/unresolved current-catalog items can be filtered explicitly as `Sem classificação` without inventing data;
- reseller search matches existing name, phone and email fields and ignores case/accents;
- reseller lifecycle filtering supports `Todos`, `Ativos` and `Inativos`;
- filters are transient presentation/read-model state only and `Limpar filtros` restores the full list;
- the filtered item empty state is distinct from a truly empty catalog;
- no database/schema migration, Supabase/API/policy, fuzzy identity inference, destructive bulk action, lifecycle/history or financial semantics changed.

D-019 run/job `33086388558` / `98567054353`: repository Critical QA PASS. GitHub Actions validated merge ref `e0eba21d9a695be4b7bab918c8faa72de060039b`; validated tree `83e27d1d63685eee1a4ae6bc751b30e8dccba786` exactly equals squash-integrated `develop@b6d92db102d7ba17b920e8c41282a5075697bc04` tree. Exact tree equivalence: PASS.

#### Early-use change #10 — observations on payment/signal entry
**Status:** `DONE / INTEGRATED — PR #102`

Accepted result:

- verification confirmed `Transaction.observation`, local sanitization/persistence, the cloud adapter and the current `create_transaction` PostgreSQL RPC already support observations for payments and signals;
- normal transaction entry now exposes the existing observation field for payments and signals as well as orders;
- the normalized trimmed observation is part of the common transaction create payload; blank input remains absent;
- existing order observation presentation and behavior are preserved;
- focused tests prove payment and signal creation persist the trimmed observation while retaining the non-order shape with no item reference;
- no database/schema migration, Supabase function/policy, financial-effect, occurrence-date, reversal/correction/history, PDF, recovery or deployment behavior changed.

D-019 run/job `33089151402` / `98576935845`: repository Critical QA PASS. GitHub Actions validated merge ref `f0da9706933804c53a0dc0edd41cfaaafebee59e`; validated tree `a0f26f3c979b758f8c70f43a797689f47f2bc3a5` exactly equals squash-integrated `develop@2ce88ab7418715ef399b4b05b4776f6191d64a88` tree. Exact tree equivalence: PASS.

#### Early-use change #11 — actionable global item search result
**Status:** `DONE / INTEGRATED — PR #104`

Accepted result:

- verification confirmed that selecting an item in the global command center previously discarded item context and navigated only to the unfiltered `/items` catalog;
- item selection now navigates with a one-shot encoded item-name search handoff;
- `ItemsPage` applies that handoff to the existing #9 transient item-name filter and then removes the navigation parameter with history replacement;
- normal and recent item results share the same selection path, so both land in useful filtered catalog context;
- reseller result navigation and existing create-item/create-reseller suggestion behavior remain unchanged;
- no item-detail route/architecture, database/schema migration, Supabase/Auth/RLS, recovery, item identity/lifecycle/classification/history or deployment behavior changed.

D-019 run/job `33093633207` / `98592735176`: 0 lint errors / 104 warnings; 65 files / 282 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `409243291c33deed745ab04e857e8c5e5da05f5e`; validated tree `507bdbc9c81efc45ef36a6d7dab9e44dc2444866` exactly equals squash-integrated `develop@46f85bb5f1e8304a323b8c4a8c99f429e52eca5d` tree. Exact tree equivalence: PASS.

#### Early-use change #12 — non-blocking duplicate-data warnings
**Status:** `DONE / INTEGRATED — PR #106`

Accepted result:

- verification confirmed reseller/item creation forms can compare against already loaded canonical records without a database/schema change;
- new reseller creation warns when an existing reseller matches normalized name, normalized exact phone or exact case-insensitive e-mail and reports the matching fields;
- new item creation warns only when normalized item name matches within the same category and same optional subcategory context;
- archived reseller/item records remain visible to the warning so accidental recreation of inactive data is less likely;
- editing existing records is unchanged;
- warnings are non-blocking and the operator can explicitly choose `Cadastrar mesmo assim`;
- legitimate same-name records remain possible; no automatic merge, silent rejection or hard uniqueness rule was added;
- no database/schema migration, Supabase/Auth/RLS, recovery, financial/history or deployment behavior changed.

The first D-019 run stopped only because the reseller form test began exercising IndexedDB-backed lookup without initializing the test's `fake-indexeddb` environment. The test setup was corrected without changing runtime behavior; no objective failure was waived.

Final D-019 run/job `33101052183` / `98618533607`: 0 lint errors / 104 warnings; 65 files / 285 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `5e26f76a227f9c90417767bfbacb34ddfe2098da`; validated tree `fa34f9c6811ce0bc63c2d0aa1cd5f4d7efd2e13d` exactly equals squash-integrated `develop@7d023e856e0883ba82b2392199d3320d431aa16a` tree. Exact tree equivalence: PASS.

#### Early-use change #13 — product-level financial report analytics
**Status:** `DONE / INTEGRATED — PR #108`

Accepted result:

- verification confirmed the existing order transaction snapshots already contain item identity/name, quantity and category/subcategory context required for read-only product analytics;
- canonical `FinancialReport.products` aggregates effective orders by exact transaction-time item/name/classification snapshot context;
- each product row exposes product label, historical classification, order count, item quantity and gross sales;
- rows are ranked by gross sales, then quantity, then label;
- repeated matching historical snapshots aggregate together, while a historical rename/reclassification remains distinct instead of being rewritten from current catalog;
- reversed orders contribute zero and period inclusion continues to use D-014 occurrence time through the existing canonical report path;
- the `Resumo` product highlight now identifies the actual top-selling product;
- the `Produtos e categorias` view shows product performance before the existing category/subcategory drilldown;
- the existing PDF products/categories section renders the same canonical `report.products` list and does not implement a second calculation;
- no database/schema migration, Supabase/RPC/Auth/RLS, transaction mutation, recovery or deployment behavior changed.

D-019 run/job `33103464797` / `98626992003`: 0 lint errors / 104 warnings; 65 files / 286 Vitest PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `43d7ebf749ca3924fcebe9fe8cd85d7351e5354a`; validated tree `b8575e6c80a0d43109c25a307dc0faa183245262` exactly equals squash-integrated `develop@d5b2cc5fb150777f12ece38bdd02abcada2974f7` tree. Exact tree equivalence: PASS.

#### Early-use change #14 — Dashboard receipts-today card
**Status:** `SUPERSEDED / ABSORBED BY D-035 — NO STANDALONE IMPLEMENTATION`

The operator initially deferred the isolated daily-receipts KPI because payments/signals do not necessarily occur every day and the card's recurring Dashboard value was not established. After the full Dashboard/Reports audit, D-035 absorbs the useful intent into `Recebimentos este mês` with optional compact today context. Do not implement #14 standalone.

#### Early-use change #15 — future occurrence-date confirmation
**Status:** `DONE / INTEGRATED — PR #111`

Accepted result:

- verification confirmed new transaction entry already stores operator-selected `occurredAt` separately from registration time and permits valid future dates;
- same-day and past dates keep the normal submit behavior;
- a future financial occurrence date relative to the operator's local current date opens a confirmation before mutation;
- `Voltar e corrigir` closes the warning without creating a transaction;
- `Cadastrar mesmo assim` proceeds through the existing creation path and preserves exactly the selected future occurrence date;
- no automatic date correction or prohibition was introduced, preserving D-014;
- no database/schema migration, transaction-accounting, Supabase/RPC/Auth/RLS, correction/reversal/history, recovery or deployment behavior changed.

D-019 run/job `33108818780` / `98645846558`: 0 lint errors / 105 warnings; 65 files / 287 Vitest PASS; focused occurrence-form coverage 3/3 PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `650a28b4f53f484cec79bf4b80f4842364e3ee66`; validated tree `c6f2ecb9e1e63c244a1cd305abbe51ebd54b5811` exactly equals squash-integrated `develop@bee3e2cee2852c9bf0683fe5d564b34cef569c8a` tree. Exact tree equivalence: PASS.

### D-035 — Dashboard + Reports core redesign
**Status:** `AUTHORIZED / ORDERED / BOUNDED — DR-06 CURRENT`

Focused product contract: `docs/V2/DASHBOARD_REPORTS_SPEC.md`.

Initiative governance:

1. This sequence is independent from the historical numbered early-use queue; do not call it #16.
2. Only the single `DR-*` item named by `STATUS.md -> NEXT_ACTION` is executable.
3. Every executable item verifies current behavior first, uses an isolated branch, receives proportionate focused tests and requires D-019 before integration.
4. Close and document one item, promote exactly the next item, then stop.
5. The initiative is read-model/presentation/navigation oriented. It does not authorize a database/schema migration, new financial-accounting semantics, transaction mutation path, Auth/RLS/recovery weakening, automatic deployment, `main` publication, legacy import or definitive cutover.
6. Existing D-014 occurrence, reversal-zero-effect, D-015 FIFO aging and D-034 `FinancialReport` semantics remain authoritative.
7. Current-position Dashboard metrics use an as-of-today cutoff so later future occurrence dates do not affect current debt/aging before they occur.

#### DR-01 — product contract and canonical documentation
**Status:** `DONE / DOCUMENTATION — D-035`

Accepted result:

- Dashboard mission and Reports analytical boundary are explicit;
- target KPI, attention, aging, recent-registration and quick-action semantics are defined;
- Reports target refinements and Dashboard-to-Reports handoff are defined;
- acceptance criteria and ordered `DR-*` execution are documented;
- isolated #14 is absorbed/superseded rather than resurrected.

#### DR-02 — canonical Dashboard read-model
**Status:** `DONE / INTEGRATED — PR #114`

Accepted result:

- one bounded read-only `DashboardSnapshot` centralizes month-to-today and today flow, as-of-today open position, critical metrics, FIFO aging buckets, deterministic deduplicated attention rows and recent effective registrations;
- month/today flow reuses canonical `buildFinancialReport` semantics;
- aging/current position reuses accepted transaction/FIFO helpers with one explicit end-of-current-local-day cutoff;
- valid future occurrences later than today remain legitimate but cannot affect current debt/aging before occurrence;
- `useDashboardSnapshot`, `useTotalDebt`, `useTodayOrders` and `useDebtAging` share `['dashboard', 'snapshot']`; existing `['dashboard']` invalidations remain sufficient;
- legacy operational UI contracts remain compatible so DR-03/DR-04 visual scope was not bundled;
- `usePerformanceAnalysis` remains unchanged for DR-07;
- no database/schema, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

D-019 run/job `33115854899` / `98670186895`: 0 lint errors / 105 warnings; 66 files / 290 Vitest PASS; focused snapshot coverage 3/3 PASS; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `3e09a992a20e3edf72df093c312581c88e04457b`; validated tree `b9b5040abd6f217f41d4bba12f21ae05d06271dc` exactly equals squash-integrated `develop@4e3a9b28174cb64ad820f4ec60356194d1a760bb` tree. Exact tree equivalence: PASS.

#### DR-03 — primary Dashboard KPI row
**Status:** `DONE / INTEGRATED — PR #116`

Accepted result:

- the primary Dashboard row consumes the integrated `DashboardSnapshot` through `useDashboardSnapshot`;
- it renders `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto`, `Crítico > 30 dias` in the accepted order;
- compact context includes month orders/items, optional today orders/sales/receipts, open-reseller count and critical reseller count/oldest age;
- the legacy `Dívida Total` / `Pedidos de Hoje` top cards and misleading realtime wording are removed;
- responsive `1/2/4` layout, loading states and explicit business empty states are preserved;
- no accounting/FIFO reconstruction was introduced in presentation components;
- DR-04/DR-05/later Dashboard redesign work was not bundled.

The first D-019 run/job `33118356365` / `98678713093` failed only because the pre-existing `DashboardCards.test.tsx` still asserted the legacy two-card API. No integration occurred; the focused test contract was aligned and the full gate rerun. Final D-019 run/job `33118656171` / `98679713377`: 0 lint errors / 105 warnings; 66 files / 291 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree `d4be4496de22cb752a25c2307f4b29d5dd393b1e` exactly equals squash-integrated `develop@345a84f3d94d65515671a928b627e7d2d62eb687` tree. Exact tree equivalence: PASS; no failed gate was waived.

#### DR-04 — `Precisa de atenção` action center
**Status:** `DONE / INTEGRATED — PR #118`

Accepted result:

- one dedicated action center follows the DR-03 KPI row;
- `DashboardSnapshot.attentionRows` is consumed without presentation-layer FIFO/accounting/sorting reconstruction;
- one reseller appears once with explicit `CRÍTICO`/`ATENÇÃO`, determining age and alert amount;
- current total open balance is shown only when materially different;
- canonical deterministic priority remains unchanged;
- each row is keyboard-accessible and navigates to existing reseller detail/history;
- the first six priorities are shown compactly, with optional expansion;
- empty state communicates no current attention/critical pendency;
- duplicate alert lists were removed from `DebtHealthAgingCard`;
- no DR-05/later scope was bundled.

D-019 run/job `33121893821` / `98690519373`: 0 lint errors / 105 warnings; 67 files / 295 Vitest PASS including `AttentionCenter` 4/4 and `DashboardPage` 3/3; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `124fa0bd812250d3822aca1a6be46eb5400dba61`; validated tree `69905255e836492e8b610ea1ae0ef8bf66d0d070` exactly equals squash-integrated `develop@4bac76dd83c31016b692efb17531fbf3eddf5122` tree. Exact tree equivalence: PASS; no failed gate was waived.

#### DR-05 — compact carteira aging
**Status:** `DONE / INTEGRATED — PR #120`

Accepted result:

- the large Recharts donut/default chart is removed from `DebtHealthAgingCard`;
- the card consumes prepared `DashboardSnapshot.agingBuckets` plus `openDebt.amount` from the shared Dashboard snapshot;
- the canonical bucket order/thresholds are preserved and each row exposes exact pt-BR value plus prepared percentage;
- no FIFO, debt-age classification or percentage derivation runs in presentation code;
- total open position remains explicit;
- zero debt uses a business empty state while all three zero buckets remain visible;
- loading is compact and accessible progressbar semantics expose bucket label/value/percentage;
- DR-04 attention and DR-07 Performance content remain unchanged;
- DR-06/later work was not bundled.

D-019 run/job `33124288969` / `98698548321`: 0 lint errors / 105 warnings; 68 files / 299 Vitest PASS including `DebtHealthAgingCard` 4/4 and `DashboardPage` 3/3; 17/17 Playwright PASS; production build PASS. GitHub Actions validated merge ref `ea9997d379d1c9f30cf398574dfa28545f37e7c4`; validated tree `6848853b03148d78c79474d6415d9732ec4af8e5` exactly equals squash-integrated `develop@cccf11fece99179aa895964c8b743cff29ce9e0f` tree. Exact tree equivalence: PASS; no failed gate was waived.

#### DR-06 — recent registrations + quick actions
**Status:** `CURRENT / AUTHORIZED`

Add compact recent effective registration context using prepared `DashboardSnapshot.recentRegistrations` plus page-level `Pedido` / `Pagamento` / `Sinal` quick actions through the existing transaction route/type context. Preserve the operational hierarchy and do not create a second transaction form/write path or begin DR-07.

#### DR-07 — remove Dashboard Performance block + contextual Reports handoff
**Status:** `QUEUED / NOT CURRENT`

Remove the current Dashboard analytical Performance surface only after the operational replacements exist; add reproducible contextual navigation to Reports so useful analysis is not silently lost.

#### DR-08 — Reports analytical refinement
**Status:** `QUEUED / NOT CURRENT`

Refine primary financial KPIs/comparison clarity, add bounded product/reseller search/sort/filter controls and re-home Pareto/concentration/open-balance analytics on canonical selected-period `FinancialReport` semantics.

#### DR-09 — final Dashboard/Reports UX and efficiency acceptance
**Status:** `QUEUED / NOT CURRENT`

Perform final desktop/mobile, loading/empty, accessibility, wording, deep-link and performance acceptance. Fix only evidence-backed defects found by that pass.

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT_AUTHORIZED`

## Current NEXT_ACTION

**Execute only D-035 `DR-06 — recent registrations + quick actions`. Verify the integrated DR-05 compact aging block, the DR-02 `DashboardSnapshot.recentRegistrations` contract, the existing transaction route/type/reseller context and the current Dashboard page header/layout. Add a compact `Últimos lançamentos registrados` block consuming prepared recent effective registrations in canonical `createdAt` order, distinguishing `Pedido`, `Pagamento` and `Sinal`, showing reseller/value and occurrence-date context when registration and financial dates differ or otherwise need disambiguation; keep reversed rows excluded through the prepared projection and navigate to reseller detail/history when feasible. Add compact page-level `+ Pedido`, `+ Pagamento`, `+ Sinal` actions by reusing the existing transaction route/type context; do not create a second form or write path. Preserve `KPIs -> atenção -> aging -> recent activity`, responsive/loading/empty/accessibility behavior, and do not alter DR-05 aging, remove Performance (DR-07), refine Reports or begin later work. No database/schema, Supabase/RPC/Auth/RLS, recovery or deployment-path change is authorized. Work outside `main`, run focused tests plus D-019 before executable integration, update canonical docs at closure, promote exactly DR-07 if integrated, and stop. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover.** See `STATUS.md` for the authoritative instruction.