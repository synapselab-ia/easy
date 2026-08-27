# Easy V2 — Canonical Status

**Updated:** 2026-08-27  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P10 — Controlled migration and cutover: `IN_PROGRESS`.**  
**P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS`.**

Current P10-S3 state:

- P10-S3-I1 — Supabase foundation: `DONE / ACCEPTED — SYNTHETIC FOUNDATION`.
- P10-S3-I2 — migration/reconciliation + durability contract: `DONE / ACCEPTED CONTRACT` — D-030.
- P10-S3-I2-I1 — legacy stable-v1 staging/import compatibility: `DONE / ACCEPTED — SYNTHETIC ONLY`.
- **P10-S3-I2-I2 — zero-cost unattended backup/recovery proof: `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.**
- **P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / ACCEPTED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031.**
- **P10-S3-I2-I3-C — manual Vercel candidate + operator onboarding: `DONE / ACCEPTED`.**
- **P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.**
  - change #1 grouped reseller PDF: `DONE / INTEGRATED` — PR #79;
  - change #2 store-global manual recovery checkpoint: `DONE / ACCEPTED / INTEGRATED / OPERATIONALLY INITIALIZED` — D-032 / PR #80;
  - change #3 optional subcategories: `DONE / ACCEPTED / INTEGRATED` — D-033 / PR #82;
  - change #4 financial reports workspace + PDF: `DONE / ACCEPTED / INTEGRATED` — D-034 / PR #85;
  - change #5 localized financial-report period labels: `DONE / INTEGRATED` — PR #87;
  - change #6 Dashboard performance-window labels: `DONE / INTEGRATED` — PR #90;
  - change #7 consistent pt-BR monetary presentation: `DONE / INTEGRATED` — PR #92;
  - reseller client-facing statement PDF refinement: `DONE / INTEGRATED` — PR #94;
  - searchable entity-selector refinement: `DONE / INTEGRATED` — PR #96;
  - change #8 catalog classification visibility at point of use: `DONE / INTEGRATED` — PR #98;
  - change #9 practical item/reseller search and filters: `DONE / INTEGRATED` — PR #100;
  - change #10 observations on payment/signal entry: `DONE / INTEGRATED` — PR #102;
  - change #11 actionable global item search result: `DONE / INTEGRATED` — PR #104;
  - change #12 non-blocking duplicate-data warnings: `DONE / INTEGRATED` — PR #106;
  - change #13 product-level financial report analytics: `DONE / INTEGRATED` — PR #108;
  - change #14 Dashboard receipts-today card: `SUPERSEDED / ABSORBED BY D-035 — NO STANDALONE IMPLEMENTATION`;
  - change #15 future occurrence-date confirmation: `DONE / INTEGRATED` — PR #111;
  - **D-035 Dashboard + Reports core redesign: `AUTHORIZED`; DR-01 documentation `DONE`; DR-02 canonical Dashboard read-model `DONE / INTEGRATED — PR #114`; DR-03 primary KPI row `DONE / INTEGRATED — PR #116`; DR-04 `Precisa de atenção` action center `DONE / INTEGRATED — PR #118`; DR-05 compact carteira aging `DONE / INTEGRATED — PR #120`; DR-06 recent registrations + quick actions `DONE / INTEGRATED — PR #122`; DR-07 remove Dashboard Performance + contextual Reports handoff `CURRENT / AUTHORIZED`.**
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Governing decisions

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 defines the temporary store-global manual JSON checkpoint. D-033 defines the shallow category/subcategory model. D-034 defines one canonical read-only financial-report model shared by the screen and downloadable PDF. D-035 defines Dashboard and Reports as one core decision system with separate operational and analytical roles and an ordered `DR-*` redesign sequence.

Current invariants:

1. Supabase/Postgres is canonical business persistence.
2. Supabase Auth + RLS + active `easy_operators` authorization remain mandatory.
3. Hosted-cloud recovery health is store-global; the latest confirmed real Backup v2 must remain strictly younger than 24 hours for normal writes.
4. The database enforces the recovery boundary and the browser fails closed when cloud recovery health cannot be verified.
5. D-030 remains ON HOLD/not accepted and definitive cutover is not authorized.
6. `main` remains untouched; Vercel publication remains manual while the candidate is in controlled early use.
7. Catalog classification is `category -> optional subcategory -> item`, exactly one optional subcategory level.
8. Financial and classification history uses immutable transaction-time snapshots and occurrence-time semantics; later catalog edits do not rewrite history.
9. Reversed transactions have zero effective financial/reporting effect while remaining audit-visible in history.
10. Backup v2 schema 6 contains subcategories and related item/order references; supported schema 4/5 imports do not invent classification.
11. The financial report screen and PDF must consume the same canonical `FinancialReport` model; the PDF may select sections but cannot implement a separate accounting interpretation.
12. D-035 current-position Dashboard metrics are explicitly as-of the operator's current local day; valid future occurrence dates after today must not affect current open debt or aging before their occurrence date.

## D-032 rollout state

The accepted D-032-containing candidate was manually published to Vercel and a fresh real Backup v2 was exported, stored outside Easy and explicitly confirmed. The store-global exact-24h cloud recovery mode is operational.

This does not satisfy D-030 unattended off-site automation/retention/restore-drill acceptance.

## D-033 closure — optional subcategories

D-033 / PR #82 is closed and integrated. The accepted model is `category -> optional subcategory -> item`, with stable subcategory identity, category-consistency enforcement, immutable transaction-time category/subcategory snapshots, Dexie/cloud parity and Backup v2 schema 6.

Production migration `20260826135708_i3d_subcategories` is applied. D-019 and integrated-tree equivalence passed. The post-integration canonical closure was documentation-only.

## D-034 closure — financial reports workspace

The operator requested a report area that is useful both for quick analysis and for a presentable downloadable document rather than merely duplicating the Dashboard.

PR #85 implemented a dedicated `Relatórios` workspace with:

- presets `Hoje`, `Esta semana`, `Este mês`, `Mês passado`, `Este ano` and custom date range;
- four primary KPIs: sales, receipts, open debt at report end and order count;
- comparison against the immediately preceding equal-length period;
- sales/receipts timeline by financial occurrence date;
- `Resumo`, `Produtos e categorias` and `Revendedores` views;
- category -> subcategory drilldown using historical transaction snapshots;
- reseller performance with period sales/receipts and closing open debt;
- configurable financial PDF generated from the exact same canonical report model used by the screen.

Accepted reporting semantics:

- period inclusion uses `transactionOccurredAt`, preserving D-014;
- reversed transactions contribute zero to effective report totals;
- `Vendas` is the gross value of effective orders occurring inside the selected range;
- `Recebimentos` is the effective payment + signal value occurring inside the selected range;
- `Movimento líquido` is period sales minus period receipts;
- **`Em aberto no fim` is not the period net**: it is the sum of positive reseller balances reconstructed from all effective history through the selected end date;
- category/subcategory labels come from immutable order snapshots, with explicit legacy/unclassified grouping rather than rewriting history from today's catalog;
- the PDF can include/exclude presentation sections, but accounting calculations remain centralized in `src/domain/financialReporting.ts`.

D-034 is read-only. It introduced no database migration, financial mutation, Auth/RLS/recovery-boundary change or automatic deployment behavior.

Repository validation/integration evidence:

- feature head: `0ad69e0a8e8eeb9e92c56cb39ec4b8489bb97fd1`;
- GitHub Actions merge ref: `897ca59793342b29300cee0d57be92fdba1ebd68`;
- validated tree: `124767ee7afa23c0c07e7215513fa5b90d8177a5`;
- D-019 run/job: `33001910986` / `98285660448`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 63 files / 268 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #85 squash-integrated `develop`: `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`;
- integrated tree: `124767ee7afa23c0c07e7215513fa5b90d8177a5` — exact tree equivalence PASS.

The D-034 canonical closure is documentation-only. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` and was not modified.

## Early-use change #5 — localized report period labels

Early-use observation found that the Base UI period selector displayed internal preset identifiers such as `week` and `month` after selection, despite the menu options themselves being Portuguese.

PR #87 keeps the internal preset identifiers unchanged but supplies the selector with an explicit value/label mapping so the operator-facing selected value is always `Hoje`, `Esta semana`, `Este mês`, `Mês passado`, `Este ano` or `Personalizado`.

This is presentation-only: report date ranges, occurrence-time accounting semantics, database state, Auth/RLS, recovery behavior and deployment policy are unchanged.

Validation/integration evidence:

- feature head: `ae0ecee51e0296ab4b132892ec626abe64164204`;
- GitHub Actions merge ref: `57ac8137673f3826cfe6a2b17a68795050d2e1b2`;
- validated/integrated tree: `ae183953e9f9248cab7ebc107fae57723ccb8aa4`;
- D-019 run/job: `33005354591` / `98297566705`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 63 files / 268 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #87 squash-integrated `develop`: `430b36feb7563c3370a334eb4962edc7aafdc117`;
- exact tree equivalence between validated merge ref and integrated commit: PASS.

No automatic Vercel publication occurred and `main` remains untouched.

## Early-use change #6 — localized Dashboard performance-window labels

Verification confirmed that `PerformanceAnalysisSection` used Base UI `Select` with internal `AnalysisPeriod` values `90`, `180` and `360` but without the explicit value/label mapping already accepted for the Reports selector. PR #90 adds one shared option list, supplies it to the Select and reuses it for the menu entries.

The visible selected values now resolve to `Últimos 90 dias`, `Últimos 180 dias` and `Último ano`, while the internal values and all `usePerformanceAnalysis` period calculations remain unchanged. No persistence, Supabase/Auth/RLS, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `34728fcdb0016dea1481ab795317de223b7c9a10`;
- GitHub Actions merge ref: `fdfd8771589e428f219afb1b6dd1597b8f2fb64d`;
- validated tree: `f872da2c6adf492a929bd5ef02ad7a1c695a4672`;
- D-019 run/job: `33009642945` / `98312276753`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 63 files / 268 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #90 squash-integrated `develop`: `446987475bf8621ff7ec5803149c4c6b874d5e50`;
- integrated tree: `f872da2c6adf492a929bd5ef02ad7a1c695a4672` — exact tree equivalence PASS.

No automatic Vercel publication occurred and `main` remains untouched.

## Early-use change #7 — consistent pt-BR monetary presentation

The first PR #92 implementation was reverted before integration and replaced with a simpler presentation-only approach: visible money uses a literal `R$ ` prefix plus the numeric portion formatted with `toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`. This avoids currency-style Unicode/NBSP spacing while producing stable operator-facing values such as `R$ 150,00`, `R$ 1.200,50` and `R$ 10.000,00`.

The bounded presentation delta covers reseller current/period balances, catalog prices and the read-only calculated total in new-order entry, monetary values in the transaction-correction dialog and reseller statement PDF values. Editable numeric inputs, parsing, calculations, persisted numeric values, rounding, financial/report semantics, transaction history and occurrence semantics remain unchanged.

The first D-019 after simplification failed only because two pre-existing tests still expected dot-decimal presentation in `ResellerDetailPage.statement.test.tsx` and `pdfService.occurrence.test.ts`. GitHub Actions logs identified those exact stale assertions; only the expectations were aligned to the accepted visible comma-decimal presentation, without weakening or reverting the implementation.

Validation/integration evidence:

- feature head: `7aea7fca077e552d66bf8bc018f3fa4b49eea423`;
- GitHub Actions merge ref: `a094ba30b968b9b5658809503803440b8cf27736`;
- validated tree: `f973d83aa8116fef7254dd056a5c5e99debbf063`;
- D-019 run/job: `33070649544` / `98511710752`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 63 files / 268 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #92 squash-integrated `develop`: `3f9bafca186951f363c20e990a791a771a4cf35d`;
- integrated tree: `f973d83aa8116fef7254dd056a5c5e99debbf063` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched.

## Operator-authorized pre-#8 refinement — client-facing reseller statement PDF

Before starting change #8, the operator explicitly paused the ordered queue to simplify the reseller statement PDF for client reading. PR #94 changes only the PDF projection and its tests; change #8 was not started or bundled.

Accepted presentation behavior:

- existing equal-product/equal-price grouping is preserved;
- each valid order observation remains directly below its grouped product, preserving plate names/text such as the individual names to be produced;
- reversed orders, payments and signals are omitted entirely from the PDF while remaining preserved and audit-visible in transaction history;
- correction/replacement/reversal annotations are not shown to the client; only the effective replacement is presented;
- the financial closing appears immediately after the product table as `Total dos pedidos`, `Saldo anterior`, `(-) Total de pagamentos` and `SALDO ATUAL`;
- for a selected period, `Saldo anterior` is the canonical balance strictly before the range start, preserving D-014/D-015 statement semantics;
- `Total dos pedidos` and `Total de pagamentos` include only effective movements inside the selected interval, with signals included together with payments;
- the detailed `Pagamentos e sinais` table is a secondary/internal complement after the closing, rendered only when at least one effective payment/signal exists, with only `Data`, `Tipo` and `Valor`;
- no financial persistence/history semantics, database/Supabase, Auth/RLS, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `a854cc6417f13ff9a82a9ded97f9681e36a8c718`;
- GitHub Actions merge ref: `9d7c067172c7146c27c36acf3390068da622e3d2`;
- validated tree: `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a`;
- D-019 run/job: `33073644514` / `98522073542`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 63 files / 269 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #94 squash-integrated `develop`: `a2283d0a9408730e8cb136fdfe602d76a05cfa7a`;
- integrated tree: `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #8 remains the next authorized queue item but was not started during this refinement.

## Operator-authorized pre-#8 refinement — searchable entity selectors

Before starting change #8, the operator explicitly kept the ordered queue paused to make large variable selectors searchable. PR #96 adds one reusable `cmdk`-backed combobox and applies it only where direct entity search materially reduces scrolling.

Accepted behavior:

- search matches any substring, is case-insensitive and accent-insensitive;
- the typed query is transient presentation state and is never persisted as entity data;
- selecting a result continues to return the existing reseller/item/category/subcategory ID;
- new transaction entry uses searchable reseller and item selectors;
- full transaction correction uses searchable reseller and item selectors;
- item create/edit uses searchable category and optional subcategory selectors;
- small closed-list selects remain unchanged;
- lifecycle validation, financial/history semantics, database/Supabase, Auth/RLS, recovery and deployment behavior remain unchanged;
- change #8 was not started or bundled.

The first two D-019 attempts exposed only stale test assumptions caused by the control-type change: seven tests still modeled affected fields as native selects, then two context tests used an ambiguous singular query after two searchable controls correctly coexisted. These objective failures were corrected in test code and were not waived.

Validation/integration evidence:

- feature head: `95be7dac0bc5db87c21fc45ac6fb0303084d70ae`;
- GitHub Actions merge ref: `ea1b93339b8356b9a2386b26fffc878428829d0d`;
- validated tree: `569b7a7b760ba333b124094f159488b5b99fc92e`;
- D-019 run/job: `33079397875` / `98542140423`;
- ESLint: 0 errors / 98 warnings;
- Vitest: 64 files / 272 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #96 squash-integrated `develop`: `20dcc0fb7469db8ae9638ab6ef39b38ca7e2ec97`;
- integrated tree: `569b7a7b760ba333b124094f159488b5b99fc92e` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched.

## Early-use change #8 — catalog classification visibility at point of use

Verification confirmed that current category/optional-subcategory context was absent from both the item catalog and the new-order item selector. PR #98 adds one bounded current-catalog presentation helper and exposes the resolved path without changing persistence or historical facts.

Accepted behavior:

- desktop catalog rows include a `Classificação` column;
- mobile catalog cards show the current classification directly under the item name;
- new-order item options show item name, current classification and existing price, while the selected trigger retains item plus classification context;
- legacy/unresolved current-catalog references display `Sem classificação` rather than receiving invented classification;
- the item selector continues to search by item name only, so #8 does not pre-implement #9 filtering/search scope;
- D-025/D-033 transaction-time category/subcategory snapshots remain immutable historical truth; no order creation/history semantics changed;
- no database/schema migration, Supabase/Auth/RLS, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `66026aa340f3b9aba1e8692f11d51ee751a8778b`;
- GitHub Actions merge ref: `2d3ab8ba9ff0af179337eb7654b7bfddb5f5a24f`;
- validated tree: `01bef29624079f90a8b1b0089c183abc26f96149`;
- D-019 run/job: `33082398941` / `98552849392`;
- Critical QA: PASS;
- Vitest suite: 65 files / 276 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- PR #98 squash-integrated `develop`: `2c9d67221e3365b9476a95947906a6f4c21ecc7f`;
- integrated tree: `01bef29624079f90a8b1b0089c183abc26f96149` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #8 is closed.

## Early-use change #9 — practical item/reseller search and filters

Verification found that the item catalog had no list search/filter controls, while the reseller page searched only by name and had no lifecycle filter. PR #100 adds bounded client-side list ergonomics over the already loaded canonical data.

Accepted behavior:

- item search matches name substrings and ignores case/accents;
- item filters combine category, category-scoped optional subcategory and lifecycle (`Todos`, `Ativos`, `Inativos`);
- category/subcategory filters reuse the accepted searchable selector behavior and include archived classification context where relevant;
- `Sem classificação` explicitly filters legacy/unresolved current-catalog items without inventing classification;
- reseller search matches existing name, phone or email fields and ignores case/accents;
- reseller lifecycle filtering supports `Todos`, `Ativos` and `Inativos`;
- filters are transient presentation/read-model state only and `Limpar filtros` restores the full list;
- the filtered catalog empty state is distinct from a truly empty catalog;
- no database/schema migration, Supabase/API/policy, fuzzy identity inference, destructive bulk action, lifecycle/history or financial semantics changed.

Validation/integration evidence:

- feature head: `df6efcee47d6a43941cbdbd273ec95bb93f56059`;
- GitHub Actions merge ref: `e0eba21d9a695be4b7bab918c8faa72de060039b`;
- validated tree: `83e27d1d63685eee1a4ae6bc751b30e8dccba786`;
- D-019 run/job: `33086388558` / `98567054353`;
- repository Critical QA (`lint + Vitest + Playwright + production build`): PASS;
- PR #100 squash-integrated `develop`: `b6d92db102d7ba17b920e8c41282a5075697bc04`;
- integrated tree: `83e27d1d63685eee1a4ae6bc751b30e8dccba786` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #9 is closed.

## Early-use change #10 — observations on payment/signal entry

Verification confirmed the `observation` field already existed throughout the accepted transaction contract: local `Transaction`/`NewTransactionInput`, local sanitization/persistence, cloud input/adapter and the current PostgreSQL `create_transaction` RPC all already carry and store it for payments/signals. The only gap was the normal creation form, which exposed/sent observation only in the order branch.

PR #102 makes the observation field common to all transaction types while preserving the order presentation and existing contract.

Accepted behavior:

- payment and signal creation now expose `Observação` in the normal transaction form;
- trimmed nonblank text is sent through the existing `observation` field; blank input remains absent;
- order observation behavior remains unchanged, including its existing order-specific placeholder;
- payment/signal observations are descriptive metadata only and do not change their financial effect;
- focused tests prove both payment and signal creation persist the trimmed observation and do not acquire order/item references;
- no database/schema migration, Supabase function/policy, financial-effect, occurrence-date, reversal/correction/history, PDF, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `ebc9c4bc389e3f7ba75a084d67e764e64e75dafd`;
- GitHub Actions merge ref: `f0da9706933804c53a0dc0edd41cfaaafebee59e`;
- validated tree: `a0f26f3c979b758f8c70f43a797689f47f2bc3a5`;
- D-019 run/job: `33089151402` / `98576935845`;
- repository Critical QA (`lint + Vitest + Playwright + production build`): PASS;
- PR #102 squash-integrated `develop`: `2ce88ab7418715ef399b4b05b4776f6191d64a88`;
- integrated tree: `a0f26f3c979b758f8c70f43a797689f47f2bc3a5` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #10 is closed.

## Early-use change #11 — actionable global item search result

Verification confirmed that global item results already had enough current catalog data for a bounded navigation-only fix, but selecting an item discarded the result context and opened the generic `/items` catalog. PR #104 reuses the accepted #9 item-name filter rather than introducing a new detail route.

Accepted behavior:

- selecting a global item result navigates to the catalog with an encoded one-shot item-name search handoff;
- `ItemsPage` applies the handoff to the existing accent/case-insensitive transient item-name filter and removes the navigation parameter using history replacement;
- matching catalog context is immediately visible and remains operator-clearable through the existing `Limpar filtros` behavior;
- normal and recent global item results share the same selection handler and therefore the same targeting behavior;
- reseller result navigation and global create-item/create-reseller suggestion behavior are unchanged;
- no new item-detail architecture, database/schema migration, Supabase/Auth/RLS, recovery, item identity/lifecycle/classification/history or deployment behavior changed.

Validation/integration evidence:

- feature head: `e95b36b111aac38b7ec32ff2649b2daf22aad3de`;
- GitHub Actions merge ref: `409243291c33deed745ab04e857e8c5e5da05f5e`;
- validated tree: `507bdbc9c81efc45ef36a6d7dab9e44dc2444866`;
- D-019 run/job: `33093633207` / `98592735176`;
- ESLint: 0 errors / 104 warnings;
- Vitest: 65 files / 282 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #104 squash-integrated `develop`: `46f85bb5f1e8304a323b8c4a8c99f429e52eca5d`;
- integrated tree: `507bdbc9c81efc45ef36a6d7dab9e44dc2444866` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #11 is closed; change #12 is now the sole current queue item.

## Early-use change #12 — non-blocking duplicate-data warnings

Verification confirmed that the existing creation forms already load the canonical reseller/item lists needed for a bounded presentation/form-state warning. PR #106 therefore introduces no persistence/schema change.

Accepted behavior:

- new reseller creation compares the entered data against already loaded resellers and warns on a normalized-name match, normalized exact-phone match or exact case-insensitive e-mail match;
- the warning identifies which fields matched and includes archived records so an inactive existing record is not silently overlooked;
- new item creation warns only when normalized item name matches an existing item in the same current category and same optional subcategory context;
- same-name items in another classification remain unflagged;
- archived items are included in warning context;
- edits of existing reseller/item records are unchanged;
- warnings are non-blocking and the submit action becomes explicit as `Cadastrar mesmo assim` while still permitting legitimate duplicate-name creation;
- no automatic merge, silent rejection or hard uniqueness rule exists;
- no database/schema migration, Supabase/Auth/RLS, recovery, financial/history or deployment behavior changed.

The first D-019 run/job `33100789877` / `98617616754` failed only in the reseller form tests because the newly exercised IndexedDB-backed lookup lacked `fake-indexeddb` initialization in that test file. The test environment was corrected; runtime duplicate-warning logic was unchanged and the objective failure was not waived.

Validation/integration evidence:

- feature head: `fed6c0ab1e23cbff4298dba11d8c827d5cc06cc6`;
- GitHub Actions merge ref: `5e26f76a227f9c90417767bfbacb34ddfe2098da`;
- validated tree: `fa34f9c6811ce0bc63c2d0aa1cd5f4d7efd2e13d`;
- final D-019 run/job: `33101052183` / `98618533607`;
- ESLint: 0 errors / 104 warnings;
- Vitest: 65 files / 285 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #106 squash-integrated `develop`: `7d023e856e0883ba82b2392199d3320d431aa16a`;
- integrated tree: `fa34f9c6811ce0bc63c2d0aa1cd5f4d7efd2e13d` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. At this closure, change #13 was promoted as the next queue item.

## Early-use change #13 — product-level financial report analytics

Verification confirmed the existing transaction contract already contains the immutable order-time facts required for bounded product analytics (`itemId`, `itemName`, quantity, category/subcategory ids/names, total and occurrence date), while `FinancialReport` already centralizes occurrence filtering and reversal-zero-effect handling. PR #108 therefore extends the existing read-only report model rather than creating a new accounting path.

Accepted behavior:

- canonical `FinancialReport.products` aggregates effective orders by exact transaction-time item/name/classification snapshot context;
- each product row exposes product label, historical classification, order count, item quantity and gross sales;
- rows are ranked by gross sales, then quantity, then label;
- repeated orders with the same historical snapshot aggregate together;
- when the same stable item appears under a different historical name/classification snapshot, that historical fact remains a distinct report row instead of being rewritten from the current catalog;
- reversed orders contribute zero and occurrence-date inclusion continues through the existing canonical `effectiveInRange` path;
- the `Resumo` product highlight now shows the actual top-selling product rather than the top category;
- the `Produtos e categorias` view exposes a product-performance table before the existing category/subcategory drilldown;
- the existing PDF products/categories section renders the same canonical `report.products` list before category/subcategory rows;
- no database/schema migration, Supabase/RPC/Auth/RLS, transaction mutation, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `7b8699280e289c706a5d21ffae23a7267d07191b`;
- GitHub Actions merge ref: `43d7ebf749ca3924fcebe9fe8cd85d7351e5354a`;
- validated tree: `b8575e6c80a0d43109c25a307dc0faa183245262`;
- D-019 run/job: `33103464797` / `98626992003`;
- ESLint: 0 errors / 104 warnings;
- Vitest: 65 files / 286 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #108 squash-integrated `develop`: `d5b2cc5fb150777f12ece38bdd02abcada2974f7`;
- integrated tree: `b8575e6c80a0d43109c25a307dc0faa183245262` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #13 is closed; change #14 was promoted next but was not implemented.

## Early-use change #14 — Dashboard receipts-today card — absorbed by D-035

The operator initially deferred the dedicated `Recebimentos hoje` KPI because payments/signals do not necessarily occur every day and an isolated daily card could consume prominent Dashboard space without enough recurring operational value.

After the full Dashboard/Reports efficiency audit, the operator accepted D-035. The old #14 idea is therefore **superseded as a standalone change**. Receipts remain part of the target Dashboard as `Recebimentos este mês`, with optional compact today context, inside the broader operational hierarchy defined by D-035. No standalone #14 executable change exists.

## Early-use change #15 — future occurrence-date confirmation

Verification confirmed that new transaction entry already keeps financial occurrence time separate from registration time and accepts any valid occurrence date, including future dates. PR #111 adds a form-only intent check before mutation; it does not alter the transaction contract or D-014 semantics.

Accepted behavior:

- same-day and past occurrence dates continue through the existing submit path without an extra prompt;
- a valid date later than the operator's local current date opens a responsive confirmation before any transaction is created;
- `Voltar e corrigir` closes the warning and performs no write;
- `Cadastrar mesmo assim` explicitly proceeds and persists exactly the selected future occurrence date;
- the warning never auto-corrects the occurrence date and never prohibits a legitimate future date;
- the existing `occurredAt` payload and transaction creation path remain unchanged after confirmation;
- no database/schema migration, Supabase/RPC/Auth/RLS, transaction-accounting, correction/reversal/history, recovery or deployment behavior changed.

Validation/integration evidence:

- feature head: `6b0e86139265fdf06f482ae2fdb17d275212a79a`;
- GitHub Actions merge ref: `650a28b4f53f484cec79bf4b80f4842364e3ee66`;
- validated tree: `c6f2ecb9e1e63c244a1cd305abbe51ebd54b5811`;
- D-019 run/job: `33108818780` / `98645846558`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 65 files / 287 tests PASS;
- focused occurrence-form coverage: 3 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #111 squash-integrated `develop`: `bee3e2cee2852c9bf0683fe5d564b34cef569c8a`;
- integrated tree: `c6f2ecb9e1e63c244a1cd305abbe51ebd54b5811` — exact tree equivalence PASS.

No automatic Vercel publication occurred, no Supabase/database change was made and `main` remains untouched. Change #15 is closed.

## D-035 DR-02 closure — canonical Dashboard read-model

PR #114 introduced the bounded canonical Dashboard read-only projection without performing the later visual redesign.

Accepted result:

- `src/domain/dashboardSnapshot.ts` centralizes month-to-today and today sales/receipts/order/item context, current open debt/open-reseller count, critical amount/count/oldest age, accepted FIFO aging buckets, deterministic deduplicated attention rows and recent effective registrations;
- month/today financial flow reuses `buildFinancialReport`; aging/current-position reconstruction reuses accepted effective-transaction/FIFO helpers instead of introducing a competing accounting path;
- current-position processing explicitly stops at the end of the operator's current local day, so legitimate later future occurrences stay valid registration/history data but cannot affect current debt or aging before occurrence;
- `src/hooks/useDashboard.ts` exposes one shared `['dashboard', 'snapshot']` query; the existing `['dashboard']` invalidation prefix continues to refresh it after transaction/reseller mutations;
- legacy operational Dashboard hook shapes are mapped from the snapshot so DR-03/DR-04 presentation work was not bundled;
- `usePerformanceAnalysis` remains unchanged for the later DR-07 scope;
- no database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

Validation/integration evidence:

- feature head: `e02ab13eb8987cc6ea4865f4b3c39211380e9515`;
- exact GitHub-generated merge ref checked out by Actions: `3e09a992a20e3edf72df093c312581c88e04457b`;
- validated tree: `b9b5040abd6f217f41d4bba12f21ae05d06271dc`;
- D-019 run/job: `33115854899` / `98670186895`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 66 files / 290 tests PASS;
- focused `dashboardSnapshot` coverage: 3/3 PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #114 squash-integrated `develop`: `4e3a9b28174cb64ad820f4ec60356194d1a760bb`;
- integrated tree: `b9b5040abd6f217f41d4bba12f21ae05d06271dc` — exact tree equivalence PASS.

No failed D-019 objective gate was waived. The post-integration DR-02 closure is documentation-only. No automatic Vercel publication occurred and `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` untouched.

## D-035 DR-03 closure — primary Dashboard KPI row

PR #116 replaced the legacy top-card presentation with the four accepted primary Dashboard KPIs while keeping financial meaning inside the integrated DR-02 snapshot.

Accepted result:

- the primary row now renders `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto` and `Crítico > 30 dias` in that order;
- `DashboardPage` consumes `useDashboardSnapshot`, and `DashboardCards` reads only prepared snapshot fields rather than rebuilding accounting or FIFO logic;
- compact supporting context includes month order/item totals, optional today order/sales/receipts values, open-reseller count and critical reseller count/oldest age;
- the legacy `Dívida Total` / `Pedidos de Hoje` top-card contract and misleading `atualizada em tempo real` wording are removed;
- responsive `1/2/4` column behavior, loading states and explicit business empty states are covered by focused tests;
- `DebtHealthAgingCard` and `PerformanceAnalysisSection` remain unchanged so DR-04/DR-05/DR-07 work was not bundled;
- no database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

Validation/integration evidence:

- final feature head: `57a07e35a042bcaed37eb35c8a4be039a277766f`;
- validated merge-ref tree: `d4be4496de22cb752a25c2307f4b29d5dd393b1e`;
- first D-019 run/job `33118356365` / `98678713093` failed because the pre-existing `DashboardCards.test.tsx` still asserted the legacy two-card API; no integration occurred and no gate was waived;
- final D-019 run/job: `33118656171` / `98679713377`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 66 files / 291 tests PASS, including `DashboardCards` 4/4 and `DashboardPage` 3/3;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #116 squash-integrated `develop`: `345a84f3d94d65515671a928b627e7d2d62eb687`;
- integrated tree: `d4be4496de22cb752a25c2307f4b29d5dd393b1e` — exact tree equivalence PASS.

No failed D-019 objective gate was waived. The post-integration DR-03 closure is documentation-only. No automatic Vercel publication occurred and `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` untouched.

## D-035 DR-04 closure — `Precisa de atenção` action center

PR #118 replaced the duplicated critical/attention lists with one compact operational action center directly after the DR-03 KPI row, consuming the already canonical DR-02 attention projection.

Accepted result:

- `AttentionCenter` consumes `DashboardSnapshot.attentionRows` exactly as prepared; no FIFO, age classification or financial ordering is reconstructed in the component;
- one reseller appears once, with explicit `CRÍTICO` or `ATENÇÃO`, prepared determining age and alert-class amount;
- current total open balance is shown when materially different from the determining alert amount;
- the deterministic snapshot order is preserved unchanged: severity, older determining occurrence, larger alert amount, reseller name;
- each row is a keyboard-accessible button navigating to the existing `/resellers/:id` detail/history route;
- the initial presentation is compact at six rows with explicit `Ver todos` / `Mostrar menos` expansion;
- the empty state states the business condition instead of implying missing reseller master data;
- `DebtHealthAgingCard` no longer renders duplicate alert lists, while its existing donut and aging legend remain unchanged for the isolated DR-05 redesign;
- `PerformanceAnalysisSection` remains unchanged for DR-07;
- no database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

Validation/integration evidence:

- feature head: `f035b6be20c5ea3dfbcbe912474abc945123611f`;
- exact GitHub-generated merge ref checked out by Actions: `124fa0bd812250d3822aca1a6be46eb5400dba61`;
- validated tree: `69905255e836492e8b610ea1ae0ef8bf66d0d070`;
- D-019 run/job: `33121893821` / `98690519373`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 67 files / 295 tests PASS, including `AttentionCenter` 4/4 and `DashboardPage` 3/3;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #118 squash-integrated `develop`: `4bac76dd83c31016b692efb17531fbf3eddf5122`;
- integrated tree: `69905255e836492e8b610ea1ae0ef8bf66d0d070` — exact tree equivalence PASS.

No failed D-019 objective gate was waived. The post-integration DR-04 closure is documentation-only. No automatic Vercel publication occurred and `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` untouched.

## D-035 DR-05 closure — compact carteira aging

PR #120 replaced the large default Dashboard aging donut with the accepted compact `Carteira por idade` context, consuming the canonical DR-02 snapshot rather than performing aging calculations in the UI.

Accepted result:

- `DashboardPage` hands `DashboardSnapshot.agingBuckets` and `openDebt.amount` from the same shared snapshot into `DebtHealthAgingCard`;
- the Recharts donut/SVG is removed from the operational aging block;
- the prepared bucket order and thresholds remain `Recente (0–6d)`, `Em atenção (7–30d)`, `Crítico (>30d)`;
- each bucket displays its exact pt-BR monetary value and the prepared percentage without requiring hover;
- presentation does not run FIFO, classify aging or derive percentages; it only bounds the visual progress width while keeping the prepared displayed percentage unchanged;
- total current open position remains explicit;
- zero debt uses `Nenhum saldo em aberto hoje.` while still exposing all three zero buckets;
- loading is compact and each loaded bucket carries accessible progressbar label/value/percentage semantics;
- integrated DR-04 attention behavior and `PerformanceAnalysisSection` remain unchanged;
- no DR-06/later work, database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

Validation/integration evidence:

- feature head: `972ad8ae0285e654a5b356a55251807c35d72dd7`;
- exact GitHub-generated merge ref checked out by Actions: `ea9997d379d1c9f30cf398574dfa28545f37e7c4`;
- validated tree: `6848853b03148d78c79474d6415d9732ec4af8e5`;
- D-019 run/job: `33124288969` / `98698548321`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 68 files / 299 tests PASS, including `DebtHealthAgingCard` 4/4 and `DashboardPage` 3/3;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #120 squash-integrated `develop`: `cccf11fece99179aa895964c8b743cff29ce9e0f`;
- integrated tree: `6848853b03148d78c79474d6415d9732ec4af8e5` — exact tree equivalence PASS.

No failed D-019 objective gate was waived. The post-integration DR-05 closure is documentation-only. No automatic Vercel publication occurred and `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` untouched.

## D-035 DR-06 closure — recent registrations + quick actions

PR #122 completed the remaining bounded operational Dashboard context without changing the transaction write path or canonical snapshot semantics.

Accepted result:

- `DashboardQuickActions` adds page-level `+ Pedido`, `+ Pagamento` and `+ Sinal` actions using the existing `/transactions?type=order|payment|signal` route/type context and existing `TransactionForm` write path;
- `RecentRegistrations` consumes `DashboardSnapshot.recentRegistrations` exactly in its prepared canonical `createdAt` order and does not re-sort, rebuild effective-transaction logic or inspect reversal chains itself;
- rows distinguish `Pedido`, `Pagamento` and `Sinal` textually, show reseller and pt-BR value, and retain registration timestamp context;
- financial occurrence date is shown when its calendar day differs from registration, preserving the distinction between `createdAt` and D-014 occurrence semantics;
- the prepared snapshot keeps reversed registrations excluded;
- selecting a row uses the existing `/resellers/:id` detail/history route;
- loading/empty states and keyboard-accessible row/button semantics are covered by focused tests;
- the Dashboard priority remains `KPIs -> atenção -> aging -> recent activity`; `PerformanceAnalysisSection` remains present and unchanged for DR-07;
- no accounting/FIFO/domain, database/schema, Supabase/RPC/Auth/RLS, recovery or deployment-path change occurred.

Validation/integration evidence:

- feature head: `c889e2ad73f13d2c6804a8248863d214d27c50e2`;
- exact GitHub-generated merge ref checked out by Actions: `2b17e6c8fffd477e7716dd1ac4ad5e31848af0af`;
- validated tree: `2f31279a9e9a3bd4b84cd47e8ce1b496119d401f`;
- D-019 run/job: `33126181592` / `98704779945`;
- ESLint: 0 errors / 105 warnings;
- Vitest: 70 files / 304 tests PASS, including `RecentRegistrations` 4/4, `DashboardQuickActions` 1/1 and `DashboardPage` 3/3;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS;
- PR #122 squash-integrated `develop`: `1425fe0736dbf919e47c9c0c5bfb593331cec469`;
- integrated tree: `2f31279a9e9a3bd4b84cd47e8ce1b496119d401f` — exact tree equivalence PASS.

No failed D-019 objective gate was waived. The post-integration DR-06 closure is documentation-only. No automatic Vercel publication occurred and `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` untouched.

## Historical operator-authorized usability/data-quality queue

On 2026-08-26 the operator explicitly authorized a bounded sequence of early-use usability/data-quality improvements to be handled **one at a time**. This queue is now historical and is not extended by D-035.

Canonical execution lock remains applicable:

- only the item named in `NEXT_ACTION` is current;
- later items must not be bundled into the current task;
- each item begins with verification and may close `NO_CHANGE / DEFERRED` rather than forcing a modification;
- executable changes require isolated work outside `main` and D-019 before integration;
- after one item is integrated/closed, canonical docs promote exactly the next pending item and the task stops;
- no item implicitly authorizes database/schema changes, financial-semantic changes, recovery/Auth/RLS weakening, automatic deploy, `main` publication, legacy import or definitive cutover.

Historical ordered queue:

1. **#6 DONE / INTEGRATED — PR #90** — Dashboard selected performance-window labels are localized without changing `90/180/360` semantics.
2. **#7 DONE / INTEGRATED — PR #92** — operator-facing money is presented with pt-BR separators and two decimals without changing numeric/accounting semantics.
3. **#8 DONE / INTEGRATED — PR #98** — current category/subcategory context is visible in the catalog and new-order item selection without rewriting historical snapshots.
4. **#9 DONE / INTEGRATED — PR #100** — practical item/reseller search and lifecycle/classification filters use existing loaded data only.
5. **#10 DONE / INTEGRATED — PR #102** — the existing transaction observation contract is exposed in normal payment/signal entry without migration or financial-semantic change.
6. **#11 DONE / INTEGRATED — PR #104** — selected global item results hand off into the existing transient catalog name filter instead of opening an unfiltered catalog.
7. **#12 DONE / INTEGRATED — PR #106** — conservative duplicate-data warnings use existing loaded reseller/item fields and remain operator-overridable.
8. **#13 DONE / INTEGRATED — PR #108** — product-level analytics use immutable occurrence-time order snapshots inside the canonical screen/PDF `FinancialReport` path.
9. **#14 SUPERSEDED / ABSORBED BY D-035** — the isolated receipts-today KPI will not be implemented standalone.
10. **#15 DONE / INTEGRATED — PR #111** — future occurrence dates require explicit non-blocking confirmation while preserving the chosen D-014 occurrence date.

Do not invent or start a #16. New Dashboard/Reports work uses the D-035 `DR-*` sequence.

## D-035 — Dashboard + Reports core redesign

**Status:** `AUTHORIZED / ORDERED / BOUNDED — DR-07 CURRENT`  
**Focused contract:** `docs/V2/DASHBOARD_REPORTS_SPEC.md`

Accepted product direction:

- Dashboard is the glance/action surface; Reports is the period-controlled analytical surface;
- target Dashboard top KPIs are `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto`, `Crítico > 30 dias`;
- current-position values are as-of-today and exclude later future occurrences until their occurrence date;
- `Precisa de atenção` is one deduplicated reseller-per-row action center consuming canonical snapshot rows;
- `Carteira por idade` is compact exact-value + percentage context consuming canonical snapshot buckets;
- recent effective registrations and quick order/payment/signal actions are now integrated operational context;
- large 90/180/360 Performance/Pareto/current-debtor/ranking content leaves the target Dashboard only after useful analysis is re-homed or handed off to Reports;
- Reports refinements stay on canonical `FinancialReport` semantics;
- DR-02 established one coherent Dashboard read-only projection before the major visual redesign;
- DR-03 established the accepted four-card primary KPI row on that projection;
- DR-04 established the deduplicated actionable attention center and removed the old duplicated alert lists;
- DR-05 established compact exact-value + percentage aging and removed the large default donut without changing aging semantics;
- DR-06 established recent-registration confirmation context and existing-route quick actions without adding a second write path.

Ordered sequence:

1. **DR-01 DONE — product contract/canonical documentation** — D-035 + focused spec.
2. **DR-02 DONE / INTEGRATED — canonical Dashboard read-model — PR #114.**
3. **DR-03 DONE / INTEGRATED — primary KPI row — PR #116.**
4. **DR-04 DONE / INTEGRATED — `Precisa de atenção` action center — PR #118.**
5. **DR-05 DONE / INTEGRATED — compact carteira aging — PR #120.**
6. **DR-06 DONE / INTEGRATED — recent registrations + quick actions — PR #122.**
7. **DR-07 CURRENT / AUTHORIZED — remove Dashboard Performance block + contextual Reports handoff.**
8. **DR-08 QUEUED / NOT CURRENT — Reports analytical refinement.**
9. **DR-09 QUEUED / NOT CURRENT — final Dashboard/Reports UX and efficiency acceptance.**

Only `DR-07` is executable next. Do not bundle `DR-08` or later work into the same task.

## Startup protocol for a new conversation

Read in this exact order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then, when `NEXT_ACTION` is a D-035 `DR-*` item, read `docs/V2/DASHBOARD_REPORTS_SPEC.md` before inspecting implementation evidence.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current `BACKLOG.md`;
4. focused accepted spec for the current initiative;
5. phase execution/history documents.

## NEXT_ACTION

**Execute only D-035 `DR-07 — remove Dashboard Performance block + contextual Reports handoff`. First verify the integrated DR-06 operational Dashboard, the current `PerformanceAnalysisSection` / `usePerformanceAnalysis` surface and the existing `Relatórios` route/navigation context. Remove the legacy `Análise de Performance` block from the Dashboard now that the accepted KPI, attention, aging and recent-activity replacements are integrated, and preserve a clear contextual path from the Dashboard to the existing Reports workspace for deeper analysis; do not silently discard useful analytics or create a competing analytical/accounting model. Preserve the operational priority `KPIs -> atenção -> aging -> recent activity`, existing DR-03/04/05/06 behavior and responsive/loading/empty/accessibility semantics. Do not perform the DR-08 Reports analytical refinement, alter canonical `FinancialReport` accounting semantics, or begin any later DR item. No database/schema migration, Supabase/RPC/Auth/RLS, recovery or deployment-path change is authorized. Work on an isolated branch from current `develop`; run proportionate focused tests plus D-019 before executable integration. At closure update canonical docs, promote exactly DR-08 if DR-07 is safely integrated, and stop. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover.**