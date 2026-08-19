# Easy V2 — Canonical Status

**Updated:** 2026-08-19  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `IN_PROGRESS`.**

Phase state:

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Incomplete UX flows / operational refinement: `DONE`.
- P8-S1 — Repository-evidence discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and D-016 keep/reopen decision: `DONE`.
- P9-S1 — Evidence-backed prioritization: `DONE`.
- P9-S2 — Recovery durability: `DONE`.
- **P9-S3 — Categories/classification/reporting: `IN_PROGRESS`; contract, I1 persistence/recovery substrate and I2 lifecycle/classification/order snapshots are `DONE / INTEGRATED`; I3 reporting is `IMPLEMENTED / FUNCTIONALLY VALIDATED / PENDING FINAL D-019 + INTEGRATION`.**
- P9-S4 — Confirmed correction microflows: `NOT_STARTED`.
- P9-S5 — Occurrence-date usability verification: `NOT_STARTED`.
- P10 — Controlled beta, migration and cutover: `NOT_STARTED`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source/evidence required by `NEXT_ACTION`.

Phase-specific canonical evidence:

- `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` — P8 evidence;
- `docs/V2/P9_PRIORITIZATION.md` — P9-S1 scoring;
- `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` — accepted P9-S2 recovery target;
- `docs/V2/P9_RECOVERY_DECISION.md` — D-024 mechanism and implementation closure;
- **`docs/V2/P9_CATEGORY_CONTRACT.md` — authoritative P9-S3 category lifecycle/history/reporting/migration/backup contract (D-025) and implementation sequencing.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with four business tables: `categories`, `items`, `resellers`, `transactions`.

Category persistence remains:

- `Category`: stable `id`, `name`, `isActive`, `createdAt`, `updatedAt`;
- `Item.categoryId?` — optional only for lossless legacy compatibility;
- `Transaction.categoryId?` + `categoryName?` — optional because pre-I2 legacy orders remain valid without classification.

The V4→V5 migration remains additive/non-inventive. Canonical interchange remains `easy-backup` **version 2 / source.schemaVersion 5** with `data.categories[]`; D-018 checkpoints/restores all four business tables atomically. D-024 recovery-health metadata remains separate local control state and normal writes remain subject to its freshness guard.

## Authoritative decisions

D-016 through D-025 remain authoritative. In particular:

- D-016 keeps local-first/single-user topology; no backend/auth/cloud/live sync is introduced;
- D-017 keeps `easy-backup` v2 as logical backup contract;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps repository-wide `npm run qa:critical` as integration/publication gate;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity, non-inventive legacy history, transaction-time category snapshots and order-only category analytics.

No new decision number is required for P9-S3-I3 because it implements the already-accepted D-025 reporting semantics.

## P9-S3-I1 persistence/recovery closure

P9-S3-I1 is `DONE / INTEGRATED` and must not regress: Dexie V5 category persistence, non-inventive V4→V5 migration, schema5 backup/legacy normalization, graph validation, four-table D-018 restore and category-aware backup preview.

Final D-019: run `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`, validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

## P9-S3-I2 lifecycle/classification/order-snapshot closure

P9-S3-I2 is `DONE / INTEGRATED`. It implements category lifecycle and management, active-category item classification, legacy unclassified compatibility, new-order transaction-time `categoryId + categoryName` snapshots, immutable historical semantics, correction snapshot preservation and D-024 enforcement.

Final documentation-complete D-019: run `32202876262`, job `95920142630`, merge ref `7a8115489aafccf86408a50591fe474dbfb97f5f` — 0 lint errors / 81 warnings; 49 files / 205 Vitest PASS; 17/17 Playwright PASS; build PASS. PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; validated/integrated tree `ddbb14dcc6f66239b5e973f7da8eabb295c2cb49`.

Canonical post-merge closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

## P9-S3-I3 category order-performance reporting — current work

I3 is implemented on branch `feature/p9-s3-i3-category-reporting` / PR #48, based exactly on `develop` commit `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

Implemented reporting semantics:

1. Only effective non-reversed `order` transactions contribute.
2. `transactionOccurredAt()` / `occurredAt` is the reporting time basis.
3. Grouping uses stored historical `transaction.categoryId`, never the item's current category.
4. Missing historical category snapshots are grouped in **`Sem categoria — histórico legado`**.
5. Metrics are order count, summed item quantity and gross order value.
6. A linked correction contributes only through the effective replacement; the reversed original contributes zero.
7. Archived categories remain reportable.
8. When the stable category entity still exists, its current name may label the group; immutable `transaction.categoryName` remains untouched for audit/history.
9. Reporting is read-only and exposed in a bounded `/category-report` operator view with all-time or inclusive occurrence-period filtering.
10. No category payment/signal/balance/open-debt/FIFO allocation, historical backfill/recategorization, profitability inference or schema/backup change was introduced.

### I3 functional D-019 proof

PR #48 remained draft for the functional gate.

- Run `32261923163`, job `96096954271` — **PASS** on merge ref `02d656ea771e334622a6248139b508e20a98caf1`, combining head `01fcd986ed86fbe465592af3c5600a2570380ee8` with base `4191df77db83258f1125bffd445a6ec1f5b46bf9`.
- ESLint: **0 errors / 81 warnings**.
- Vitest: **51 files / 210 tests PASS**.
- Playwright Chromium: **17/17 PASS**.
- Production build: **PASS**.

This proves the functional implementation only. The documentation-complete head must still pass D-019 before integration.

## Boundary while closing P9-S3-I3

Until the documentation-complete gate and integration are recorded:

- do not declare P9-S3 or I3 fully integrated;
- do not start P9-S4/P9-S5/P10;
- do not alter D-016/D-017/D-018/D-019/D-024/D-025;
- do not introduce category debt/payment allocation, historical recategorization, backend/auth/cloud/live synchronization or unrelated runtime work.

## NEXT_ACTION

**Finish only the P9-S3-I3 closure already implemented in PR #48: run the full D-019 gate on the documentation-complete head, integrate only if that exact head passes, then record the resulting integration evidence canonically. Do not start P9-S4, P9-S5, P10 or any other runtime work during this closure.**
