# Easy V2 — Canonical Status

**Updated:** 2026-08-26  
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
  - **change #7 consistent pt-BR monetary presentation: `CURRENT / AUTHORIZED`;**
  - changes #8–#15 usability/data-quality queue: `QUEUED / NOT CURRENT`.
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
2. **#7 CURRENT** — consistent operator-facing pt-BR/BRL monetary formatting without numeric/accounting changes.
3. **#8 QUEUED** — show category/subcategory context in catalog and order item selection without rewriting historical snapshots.
4. **#9 QUEUED** — practical item/reseller search and lifecycle/classification filters using existing data.
5. **#10 QUEUED** — optional observation on payment/signal creation if the existing transaction contract supports it; no migration.
6. **#11 QUEUED** — make global item search selection land in useful item context.
7. **#12 QUEUED** — conservative non-blocking duplicate-data warnings; no automatic merge or hard uniqueness rule.
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

**Execute only early-use change #7. Audit operator-facing BRL values for raw decimal presentation such as `toFixed(2)` and standardize only visible money formatting where needed to proper `pt-BR`/BRL presentation. Preserve the exact numeric values, calculations, persistence and all accepted financial semantics; do not change report/PDF calculation logic merely for formatting. Begin with verification and close as `NO_CHANGE / DEFERRED` if no safe applicable delta exists. Work on an isolated branch from current `develop`; for any executable delta run proportionate tests plus D-019 before integration. At closure, update canonical docs so exactly change #8 becomes current, then stop. Do not start #8 in the same task unless the operator explicitly overrides the one-item rule. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover.**