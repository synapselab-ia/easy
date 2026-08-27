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
  - **change #12 non-blocking duplicate-data warnings: `CURRENT / AUTHORIZED`;**
  - changes #13–#15 usability/data-quality queue: `QUEUED / NOT CURRENT`.
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Governing decisions

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 defines the temporary store-global manual JSON checkpoint. D-033 defines the shallow category/subcategory model. D-034 defines one canonical read-only financial-report model shared by the screen and downloadable PDF.

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

## Operator-authorized usability/data-quality queue

On 2026-08-26 the operator explicitly authorized a bounded sequence of early-use usability/data-quality improvements to be handled **one at a time**. This authorization is sequencing/backlog scope, not a new architecture decision and does not supersede D-029 through D-034.

Canonical execution lock:

- only the item named in `NEXT_ACTION` is current;
- later queue items remain `QUEUED / NOT CURRENT` and must not be bundled into the current task;
- each item begins with verification and may close `NO_CHANGE / DEFERRED` rather than forcing a modification;
- executable changes still require isolated work outside `main` and D-019 before integration;
- after one item is integrated/closed, canonical docs promote exactly the next pending item and the task stops;
- no queue item implicitly authorizes database/schema changes, financial-semantic changes, recovery/Auth/RLS weakening, automatic deploy, `main` publication, legacy import or definitive cutover.

Ordered queue:

1. **#6 DONE / INTEGRATED — PR #90** — Dashboard selected performance-window labels are localized without changing `90/180/360` semantics.
2. **#7 DONE / INTEGRATED — PR #92** — operator-facing money is presented with pt-BR separators and two decimals without changing numeric/accounting semantics.
3. **#8 DONE / INTEGRATED — PR #98** — current category/subcategory context is visible in the catalog and new-order item selection without rewriting historical snapshots.
4. **#9 DONE / INTEGRATED — PR #100** — practical item/reseller search and lifecycle/classification filters use existing loaded data only.
5. **#10 DONE / INTEGRATED — PR #102** — the existing transaction observation contract is exposed in normal payment/signal entry without migration or financial-semantic change.
6. **#11 DONE / INTEGRATED — PR #104** — selected global item results hand off into the existing transient catalog name filter instead of opening an unfiltered catalog.
7. **#12 CURRENT / AUTHORIZED** — conservative non-blocking duplicate-data warnings; no automatic merge or hard uniqueness rule.
8. **#13 QUEUED** — product-level analytics inside the canonical read-only financial report model.
9. **#14 QUEUED** — Dashboard receipts-today KPI using occurrence time and reversal-zero-effect semantics.
10. **#15 QUEUED** — non-blocking confirmation for future occurrence dates in new transaction entry.

Detailed scope and stop conditions for each queue item are canonical in `docs/V2/BACKLOG.md`.

## Startup protocol for a new conversation

Read in this exact order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only evidence required by `NEXT_ACTION`.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current `BACKLOG.md`;
4. phase execution/history documents.

## NEXT_ACTION

**Execute only early-use change #12. Verify the current reseller/item creation paths and existing loaded fields, then add conservative warnings for likely duplicate reseller/item creation using existing fields and classification context where safely applicable. Warnings must remain non-destructive and operator-confirmed: no automatic merge, no silent rejection and no new hard uniqueness constraint is authorized; legitimate same-name records must remain possible. Prefer bounded presentation/form-state logic over persistence/schema changes. Begin with verification and close as `NO_CHANGE / DEFERRED` if no safe applicable delta exists. Work on an isolated branch from current `develop`; for any executable delta run proportionate tests plus D-019 before integration. At closure, update canonical docs so exactly change #13 becomes current, then stop. Do not start #13 in the same task unless the operator explicitly overrides the one-item rule. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover.**