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
  - **change #4 financial reports workspace + PDF: `DONE / ACCEPTED / INTEGRATED` — D-034 / PR #85.**
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

**D-034 is closed. Continue P10-S3-I2-I3-D controlled early-use observation. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover. No further product change is pre-authorized; begin the next bounded change only from new operator instruction or observed early-use evidence.**