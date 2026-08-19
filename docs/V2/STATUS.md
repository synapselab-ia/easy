# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
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
- **P9-S3 — Categories/classification/reporting: `IN_PROGRESS`; contract, I1 persistence/recovery substrate and I2 lifecycle/classification/order-snapshot enforcement are `DONE`.**
- **P9-S3-I3 — Category order-performance reporting: `NOT_STARTED`.**
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

Runtime is Dexie **V5** with these business tables:

- `categories`;
- `items`;
- `resellers`;
- `transactions`.

Category persistence remains:

- `Category`: stable `id`, `name`, `isActive`, `createdAt`, `updatedAt`;
- `Item.categoryId?` — optional only for lossless legacy compatibility;
- `Transaction.categoryId?` + `categoryName?` — optional because pre-I2 legacy orders remain valid without classification.

The V4→V5 migration remains additive/non-inventive. No migrated item/order receives fabricated category data.

Canonical interchange remains logical `easy-backup` **version 2 / source.schemaVersion 5** with `data.categories[]`; supported v1 and v2/schema4 inputs still normalize losslessly. D-018 still checkpoints/restores `categories + items + resellers + transactions` atomically.

D-024 recovery-health metadata remains separate local control state and every normal category/item/transaction mutation remains subject to the centralized freshness write guard. Backup/Restore remain reachable independently of that guard.

## Authoritative decisions

D-016 through D-025 remain authoritative. In particular:

- D-016 keeps local-first/single-user topology; no backend/auth/cloud/live sync is introduced;
- D-017 keeps `easy-backup` v2 as logical backup contract;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps repository-wide `npm run qa:critical` as integration/publication gate;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity, non-inventive legacy history, transaction-time category snapshots and order-only category analytics.

No new decision number is required for P9-S3-I2: it implements already-accepted D-025 semantics.

## P9-S3-I1 persistence/recovery closure

P9-S3-I1 is `DONE` and must not regress:

1. Dexie V5 category persistence and optional category fields.
2. Lossless/non-inventive V4→V5 migration.
3. `easy-backup` v2/schema5 with legacy v1/v2-schema4 compatibility.
4. Schema5 category graph validation.
5. Four-table D-018 checkpoint/atomic restore/read-back verification.
6. Backup preview for category/unclassified/legacy-order counts.

Final P9-S3-I1 D-019 passed in run `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b` with validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

## P9-S3-I2 lifecycle/classification/order-snapshot closure

P9-S3-I2 implements the operational D-025 rules and nothing from reporting.

Implemented:

1. Category create/rename/archive/reactivate plus guarded hard deletion.
2. Category names are trimmed/non-empty and unique case-insensitively across active and archived categories; rename preserves stable identity.
3. Archive is blocked while an active item references the category; inactive items may retain archived references.
4. Hard deletion is blocked by any item reference or any historical order category snapshot.
5. Category management is exposed as a bounded operator flow at `/categories`.
6. New active items require an active category; assignment/reassignment may target only active categories.
7. Reactivation requires an active category.
8. Migrated active legacy items may remain unclassified and editable without backfill, but cannot participate in a new order until classified.
9. New orders resolve the active item's active category inside the validated write boundary and persist the transaction-time `categoryId + categoryName` snapshot.
10. Later category rename or item reassignment does not rewrite prior snapshots.
11. Guided replacement correction preserves the original item/category snapshot; legacy no-category corrections remain no-category rather than being recategorized.
12. Payments/signals remain category-free.
13. Category/item/transaction writes continue through D-024 freshness enforcement.

### P9-S3-I2 D-019 history

PR #46 remained draft through functional validation.

- Run `32202062045`, job `95917767742` — **FAIL** at Vitest with 199/205 tests passing. The gate exposed pre-I2 success fixtures that lacked required classification, two ItemForm fixture/setup mismatches after category enforcement, and a Dexie transaction-zone issue caused by a native async category lookup. No contract was weakened: fixtures were classified explicitly and the category lookup was kept inside the Dexie transaction zone.
- Functional accepted run **`32202440100`**, job **`95918871077`** — **PASS** on merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`, combining head `554e68d64ff9c67c455ff97116736472c5807ec1` with base `d55b13bf5efedb12da937e70afe1e9501d83446b`: **0 lint errors / 81 warnings; 49 files / 205 Vitest PASS; 17/17 Playwright PASS; production build PASS.**

The documentation-complete PR head must pass a fresh D-019 before integration. The validated final merge ref, not a stale functional ref, is integration authority.

## Boundary entering P9-S3-I3

P9-S3-I3 is the final currently defined P9-S3 implementation slice and is **reporting-only**.

Authorized scope:

- category order-performance aggregation from effective non-reversed `order` transactions only;
- use `occurredAt` as the reporting time basis;
- group historical classified orders by stored `transaction.categoryId`, never by the item's current category;
- represent missing historical category snapshots under the explicit **`Sem categoria — histórico legado`** bucket;
- minimum measures: order count, summed item quantity and gross order value;
- linked correction semantics: reversed original contributes zero; effective replacement contributes once;
- archived categories remain reportable;
- use current category name as the group label when the stable category entity still exists while retaining transaction `categoryName` for audit/detail semantics;
- bounded operator reporting UI/domain aggregation plus targeted tests and full D-019.

Explicitly outside I3:

- allocation of payments, signals, reseller balances, open debt or FIFO debt to categories;
- historical category backfill/recategorization;
- profitability/margin without cost data;
- category schema/backup migration changes unless a proven defect requires them;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live synchronization or D-016 reopening without new direct evidence.

## NEXT_ACTION

**Execute only P9-S3-I3 — Category order-performance reporting. Implement the D-025 category analysis over effective non-reversed order transactions using `occurredAt`; group by historical transaction `categoryId`, preserve missing snapshots in `Sem categoria — histórico legado`, and expose at minimum order count, summed quantity and gross order value while counting linked corrections only through the effective replacement and keeping archived categories reportable. Do not group historical orders by the item's current category; do not backfill/recategorize legacy history; do not allocate payments/signals/balances/FIFO debt to categories; do not start P9-S4/P9-S5/P10 or backend/auth/cloud/live-sync work. Preserve D-016/D-017/D-018/D-019/D-024/D-025, add targeted reporting tests and run the full D-019 gate before integration.**