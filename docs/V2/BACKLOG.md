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

### Operator-authorized usability/data-quality queue — one item at a time

**Status:** `AUTHORIZED / ORDERED / BOUNDED`

On 2026-08-26 the operator explicitly authorized the following early-use improvements to be evaluated and executed **one by one**, preserving the existing project safeguards.

Queue governance:

1. Only the single item identified by `STATUS.md -> NEXT_ACTION` is executable in a task/conversation.
2. Every item starts by verifying the current implementation/runtime evidence. If the suspected issue is not reproducible, the benefit is no longer applicable, or the safe solution would cross the stated boundary, close that item as `NO_CHANGE / DEFERRED` with evidence rather than forcing a modification.
3. Each executable item uses an isolated branch from current `develop`, receives proportionate tests, and executable integration requires D-019. Supabase-bearing scope additionally requires the relevant database/security evidence.
4. Do not bundle the next queued item into the same implementation. After the current item is integrated/closed, update the canonical docs so exactly the next pending item becomes `NEXT_ACTION`, then stop.
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

#### Early-use change #8 — catalog classification visibility at point of use
**Status:** `CURRENT / AUTHORIZED`

Expose current category and optional subcategory context where it helps choose/inspect an item, especially the item catalog and new-order item selector. Preserve D-025/D-033 immutable historical snapshots; this is current-catalog presentation only and must not rewrite history or classification.

#### Early-use change #9 — practical item/reseller search and filters
**Status:** `QUEUED / NOT CURRENT`

Add bounded list ergonomics: item search plus category/subcategory/lifecycle filtering, and reseller search across useful existing identity/contact fields plus lifecycle filtering. No schema change, fuzzy identity inference or destructive bulk action is authorized.

#### Early-use change #10 — observations on payment/signal entry
**Status:** `QUEUED / NOT CURRENT`

Verify the existing transaction/cloud contract supports `observation` for payment/signal creation and, if so, expose the optional observation field in the normal entry flow. Reuse the existing transaction field; no database migration or change to payment/signal financial effect is authorized.

#### Early-use change #11 — actionable global item search result
**Status:** `QUEUED / NOT CURRENT`

Make selecting an item in global search land the operator in useful item context instead of an unfiltered generic catalog. Prefer a minimal stable filter/highlight/targeting mechanism over creating a new item-detail architecture.

#### Early-use change #12 — non-blocking duplicate-data warnings
**Status:** `QUEUED / NOT CURRENT`

Add conservative warnings for likely duplicate reseller/item creation using existing fields and classification context. Warnings must remain non-destructive and operator-confirmed: no automatic merge, no silent rejection and no new hard uniqueness constraint is pre-authorized. Same-name legitimate records must remain possible.

#### Early-use change #13 — product-level financial report analytics
**Status:** `QUEUED / NOT CURRENT`

Extend the canonical read-only `FinancialReport` model with product/item aggregation useful for answering what sold, using immutable transaction-time order facts and the existing screen/PDF parity rule. No database migration or independent second accounting calculation path is authorized.

#### Early-use change #14 — Dashboard receipts-today card
**Status:** `QUEUED / NOT CURRENT`

Add a glance KPI for effective payments + signals occurring today, respecting D-014 occurrence time and reversal-zero-effect semantics. Read-only; no transaction behavior change.

#### Early-use change #15 — future occurrence-date confirmation
**Status:** `QUEUED / NOT CURRENT`

For new transaction entry, warn/confirm when the selected financial occurrence date is in the future so accidental date entry is less likely. This must be a non-blocking confirmation, not a prohibition, and must preserve D-014 occurrence-date semantics.

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT AUTHORIZED`

## Current NEXT_ACTION

**Execute only early-use change #8: verify where current category and optional subcategory context is missing at the catalog and new-order item-selection point of use, then expose existing current-catalog classification context only where it materially helps choose or inspect an item. Preserve D-025/D-033 immutable historical snapshots and do not rewrite historical classification. Prefer a bounded presentation/read-model delta using existing data; this item does not authorize a database/schema migration. Work outside `main`, verify scope first, run proportionate tests plus D-019 for any executable delta, integrate/close the bounded item, update canonical docs to promote exactly change #9, then stop. Do not start change #9 in the same task unless the operator explicitly overrides the one-item rule. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2 or import legacy real-store data.** See `STATUS.md` for the authoritative instruction.