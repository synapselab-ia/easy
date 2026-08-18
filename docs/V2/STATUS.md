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
- **P9-S3 — Categories/classification/reporting: `IN_PROGRESS`; category data/reporting contract is `DONE`, implementation has not started.**
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
- **`docs/V2/P9_CATEGORY_CONTRACT.md` — authoritative P9-S3 category lifecycle/history/reporting/migration/backup contract (D-025).**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

**Runtime remains Dexie V4.** P9-S3 contract acceptance itself introduced no category table, no category field, no schema migration, no category UI and no category reporting.

Current persisted business tables remain:

- `items`;
- `resellers`;
- `transactions`.

Current canonical export remains `easy-backup` **version 2 / source.schemaVersion 4** until P9-S3-I1 is separately implemented and accepted.

Authoritative contracts include:

- P1 entity lifecycle and reference integrity;
- P2 audited reversal/correction history;
- P3 `occurredAt` financial occurrence, formal statement and FIFO debt semantics;
- D-016 local-first/single-user persistence until an explicit reopen trigger is proven;
- D-017 canonical `easy-backup` v2 logical backup contract;
- D-018 checkpointed verified atomic restore;
- D-019 repository-wide `npm run qa:critical` integration/publication gate;
- D-020 evidence-first operational UX prioritization;
- D-021/D-022 real-store architecture evidence;
- D-023 P9 prioritization;
- D-024 synchronized recovery-copy folder + exact 24-hour freshness guard;
- **D-025 snapshot-based category classification with non-inventive legacy migration and order-only category analytics.**

## Completed P9-S2 recovery guard

P9-S2 remains closed and must not regress while category work proceeds.

Implemented recovery behavior includes:

- namespaced local recovery-health control metadata (`easy.recoveryHealth.v1`) outside Dexie/business backup data;
- fail-safe `unknown`, `due`, `current`, `warning`, `overdue` states;
- non-contractual warning at 20 hours and exact hard mutation boundary at 24 hours;
- centralized guard on normal item/reseller/transaction mutations;
- all reads and Backup/Restore remain reachable while writes are blocked;
- synchronized-folder operating procedure and explicit operator verification;
- Easy records validated backup download initiation/metadata but does not claim provider-side Drive synchronization completion.

Accepted P9-S2-I1 Critical QA: `32180250834`, job `95851336506`; 44/183 Vitest, 17/17 Playwright and build PASS. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

## P9-S3 accepted category contract — D-025

Direct store evidence requires category management/classification and analysis by category. D-025 resolves the persistence/history/reporting semantics before implementation.

### Category lifecycle/identity

Target category entity:

```text
Category
- id
- name
- isActive
- createdAt
- updatedAt
```

Accepted rules:

- `id` is stable identity; rename preserves identity;
- names are trimmed/non-empty and unique case-insensitively across active and inactive categories;
- normal lifecycle is archive/reactivate;
- archive is blocked while an active item references the category;
- inactive items may retain archived-category references;
- hard deletion is allowed only with no item reference and no historical order snapshot reference.

### Item assignment and historical classification

Target `Item` gains optional `categoryId` during legacy migration compatibility.

- V4 items migrate without invented classification;
- assignment/reassignment targets an active category;
- reassignment affects future orders only;
- migrated active items may remain temporarily unclassified so migration is lossless, but must be classified before participating in a new order after category enforcement is implemented.

Future orders preserve transaction-time classification:

```text
categoryId?: number
categoryName?: string
```

Historical rules:

- future order stores stable category ID plus category-name snapshot;
- category rename or item reassignment never rewrites old order snapshots;
- V4 orders receive no fabricated historical category;
- orders with no snapshot remain valid under the explicit `Sem categoria — histórico legado` analytical bucket;
- payments/signals never receive category fields;
- guided order correction preserves original item/category snapshots and `occurredAt`.

### Category reporting contract

Category analysis is **order-performance reporting only**:

- effective, non-reversed `order` transactions;
- time basis `occurredAt`;
- group by historical `categoryId` snapshot;
- minimum measures: order count, summed quantity and gross order value;
- linked correction counts only the effective replacement;
- archived categories remain reportable.

P9-S3 does **not** allocate payments, signals, reseller balances or FIFO debt to categories. The existing financial model has no persistent order/payment allocation, so category debt would be invented data.

### Migration and recovery contract

D-025 targets Dexie **V5**, but V5 is not implemented yet.

Target direction:

```text
categories: ++id, name, isActive
items: ++id, name, categoryId
resellers: unchanged
transactions: existing indexes + categoryId
```

V4 -> V5 must be lossless/non-inventive: empty category table initially, existing items/orders preserved with absent category fields, no heuristic categories and no historical backfill.

D-017 remains logical `easy-backup` version 2. Planned schema-V5 exports use `source.schemaVersion = 5`, add `data.categories[]` and category references/snapshots while **continuing to accept legacy v1 and existing v2/schema4 backups** through in-memory normalization.

D-018 will extend the verified atomic restore/checkpoint boundary to `categories + items + resellers + transactions` when P9-S3-I1 is implemented.

## P9-S3 contract validation

PR #44 contract-only merge ref `31a4adca45f74e6907cfce079a98c95b2c580738` passed full D-019 in run **`32184499171`**, job **`95864903309`**:

- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

No runtime/schema/UI/reporting change was part of the contract gate.

## Boundary entering P9-S3-I1

P9-S3-I1 is the first implementation slice and is deliberately persistence/recovery-only.

Authorized scope:

- Dexie V5 `categories` table;
- optional `categoryId` on items and optional `categoryId`/`categoryName` on transactions for legacy compatibility;
- lossless V4 -> V5 migration with no invented category/history;
- category-aware `easy-backup` v2/schema5 export/preflight;
- preserve import/preflight of supported v1 and existing v2/schema4 backups;
- extend D-018 checkpoint/atomic restore/read-back comparison to the category table and fields;
- targeted migration/backup/restore tests plus full D-019.

Explicitly outside P9-S3-I1:

- category management UI;
- item classification UI;
- new-order category requirement/snapshot creation;
- category reporting UI/domain aggregation;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live synchronization or any D-016 reopen without new evidence.

The completed D-024 recovery guard must remain operational and its local control metadata must remain outside D-017/D-018 business backup data.

## NEXT_ACTION

**Execute only P9-S3-I1 — Category persistence + migration + backup compatibility. Implement the Dexie V5 `categories` table and optional item/transaction category fields required by D-025; implement a lossless V4→V5 migration that creates no categories and fabricates no historical classification; extend `easy-backup` v2 to schemaVersion 5 with category data while preserving supported v1 and existing v2/schema4 import/preflight; extend D-018 checkpointed atomic restore/read-back verification to categories. Do not implement category management UI, item-classification UI, new-order category enforcement/snapshot creation or category reporting in I1; do not start P9-S4/P9-S5/P10; preserve D-016/D-019/D-024 and the completed recovery guard. Add targeted migration/backup/restore tests and run the full D-019 gate before integration.**