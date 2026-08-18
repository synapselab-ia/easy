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
- **P9-S3 — Categories/classification/reporting: `IN_PROGRESS`; contract and P9-S3-I1 persistence/migration/backup slice are `DONE`.**
- **P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement: `NOT_STARTED`.**
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

**Runtime is now Dexie V5.** P9-S3-I1 introduced only the persistence/recovery substrate required by D-025; operational category management/classification and category reporting are not implemented yet.

Current persisted business tables:

- `categories`;
- `items`;
- `resellers`;
- `transactions`.

Current category-capable persistence fields:

- `Category`: `id`, `name`, `isActive`, `createdAt`, `updatedAt`;
- `Item.categoryId?` — optional so legacy V4 items remain valid/unclassified after migration;
- `Transaction.categoryId?` + `categoryName?` — optional historical snapshot fields; I1 does not create them for normal new orders yet.

The V4→V5 migration is additive and non-inventive: it creates an empty `categories` table and preserves existing item/order rows without fabricating category IDs, labels or historical classification.

Current canonical export remains logical `easy-backup` **version 2**, now with `source.schemaVersion = 5` and `data.categories[]`. Supported legacy v1 and existing v2/schema4 backups remain accepted through in-memory normalization to the V5 target with `categories = []` and absent category fields.

D-018 restore now checkpoints, clears, writes and read-back verifies `categories + items + resellers + transactions` inside one Dexie `rw` transaction. Any write/validation/read-back divergence rolls back all four tables.

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

Direct store evidence requires category management/classification and analysis by category. D-025 resolves persistence/history/reporting semantics before operational implementation.

### Category lifecycle/identity

Accepted target entity:

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

- migrated V4 items remain valid without invented classification;
- assignment/reassignment targets an active category;
- reassignment affects future orders only;
- migrated active items may remain temporarily unclassified, but must be classified before participating in a new order once I2 enforcement is implemented.

Future category-aware orders preserve transaction-time classification:

```text
categoryId?: number
categoryName?: string
```

Historical rules remain:

- future category-aware order stores stable category ID plus category-name snapshot;
- category rename or item reassignment never rewrites old order snapshots;
- V4 orders receive no fabricated historical category;
- orders with no snapshot remain valid under `Sem categoria — histórico legado`;
- payments/signals never receive category fields;
- guided order correction preserves original item/category snapshots and `occurredAt`.

### Category reporting contract

Category analysis remains **order-performance reporting only**:

- effective, non-reversed `order` transactions;
- time basis `occurredAt`;
- group by historical `categoryId` snapshot;
- minimum measures: order count, summed quantity and gross order value;
- linked correction counts only the effective replacement;
- archived categories remain reportable.

P9-S3 does **not** allocate payments, signals, reseller balances or FIFO debt to categories.

## P9-S3 contract validation/integration

The final P9-S3 contract closure passed D-019 in run **`32185226251`**, job **`95867186002`**, on PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312`: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and production build PASS.

PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`. The validated merge ref and integrated squash share exact tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

## P9-S3-I1 implementation closure

P9-S3-I1 implements the D-025 persistence/recovery substrate and nothing beyond it.

Implemented:

1. Dexie V5 `categories` table plus optional item/transaction category fields.
2. Lossless/non-inventive V4→V5 migration; no category or historical backfill.
3. `easy-backup` remains logical version 2, now schemaVersion 5 with `data.categories[]` and optional references/snapshots.
4. v1 and v2/schema4 preflight/import remain supported and normalize without fabricated categories.
5. Schema5 preflight validates category IDs, normalized-name uniqueness, category references, active-item/inactive-category incompatibility and order snapshot pairing.
6. Payment/signal category fields are invalid.
7. Linked order correction validation requires preservation of the original category snapshot.
8. D-018 checkpoint/atomic restore/read-back verification now covers all four business tables.
9. Backup preview exposes category count, unclassified-item count and legacy-order-without-category count.
10. Guided corrections preserve already-persisted/imported category snapshots; normal order creation still does **not** create category snapshots in I1.

Targeted proof includes real Dexie V4→V5 migration, v2/schema4 compatibility, schema5 category graph validation, four-table backup/restore round-trip and rollback on simulated restore failure.

### D-019 execution history

PR #45 intentionally remained draft through functional validation.

- Run `32190349921`, job `95883095871` — **FAIL**: lint passed; 194/195 Vitest passed. The only failure was an obsolete historical assertion expecting final `db.verno === 4` after the new V5 migration. The occurrence migration behavior itself passed; only the version expectation was corrected.
- Run `32190552190`, job `95883712396` — **FAIL**: 0 lint errors / 81 warnings, 47/195 Vitest PASS and 17/17 Playwright PASS; build exposed TypeScript narrowing only for the newly validated `rawCategories` array. No runtime/contract behavior changed; the type narrowing was made explicit.
- Functional accepted run **`32191018791`**, job **`95885134808`** — **PASS** on PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d`: **0 lint errors / 81 warnings; 47 files / 195 Vitest PASS; 17/17 Playwright PASS; production build PASS.**

The final canonical-documents head must pass a fresh D-019 before integration.

## Boundary entering P9-S3-I2

P9-S3-I2 is the next bounded slice. It may operationalize D-025 category lifecycle, item classification and new-order snapshot capture using the now-integrated V5 substrate.

Authorized scope for I2:

- category lifecycle operations needed by D-025: create, rename, archive/reactivate and guarded hard deletion;
- operator UI/hooks/services for category management only as needed for those lifecycle operations;
- item category assignment/reassignment using active categories;
- require an active category when creating a new active item or reactivating an item for new business use;
- preserve migrated legacy active items as readable/editable even if initially unclassified, but require classification before they participate in a new order;
- on a new order, resolve the active item's active category and persist `categoryId + categoryName` as the transaction-time snapshot;
- ensure guided replacement correction continues preserving the original snapshot;
- targeted lifecycle/assignment/order-write tests plus full D-019.

Explicitly outside I2:

- category reporting UI/domain aggregation; that remains a later P9-S3 slice;
- historical recategorization/backfill;
- category-level payment/debt allocation;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live synchronization or D-016 reopening without new direct evidence.

D-017/D-018 schema5 compatibility and the completed D-024 recovery guard must not regress.

## NEXT_ACTION

**Execute only P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement. Implement the D-025 category lifecycle operations and bounded operator management flow; implement active-category item assignment/reassignment and require a valid active category for new/reactivated business-use items; require a classified active item/category before a new order and persist that category's `categoryId + categoryName` snapshot at transaction time; preserve existing historical/legacy no-category rows and correction snapshots without backfill. Do not implement category reporting in I2; do not allocate payments/debt to categories; do not start P9-S4/P9-S5/P10; preserve D-016/D-017/D-018/D-019/D-024/D-025. Add targeted lifecycle/assignment/order-write tests and run the full D-019 gate before integration.**