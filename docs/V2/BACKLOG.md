# Easy V2 — Canonical Backlog

**Updated:** 2026-08-26

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

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT AUTHORIZED`

## Current NEXT_ACTION

**Continue ordinary P10-S3-I2-I3-D observation. D-033, D-034 and early-use change #5 are closed. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2 or import legacy real-store data. No further product change is queued as authorized work; start the next bounded change only from explicit operator instruction or observed early-use evidence.** See `STATUS.md` for the authoritative instruction.