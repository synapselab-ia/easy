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
- **P9-S3 — Categories/classification/reporting: `DONE / INTEGRATED`.**
- **P9-S3-I1 — Persistence/migration/backup: `DONE / INTEGRATED`.**
- **P9-S3-I2 — Lifecycle/classification/order snapshots: `DONE / INTEGRATED`.**
- **P9-S3-I3 — Category order-performance reporting: `DONE / INTEGRATED`.**
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
- `docs/V2/P9_CATEGORY_CONTRACT.md` — completed authoritative P9-S3 contract/implementation record (D-025).

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with four business tables: `categories`, `items`, `resellers`, `transactions`.

Category behavior now includes:

- stable category lifecycle and guarded deletion;
- active-category item assignment with lossless legacy compatibility;
- immutable transaction-time category snapshots for new orders;
- read-only order-performance reporting at `/category-report`.

Reporting uses effective non-reversed orders, `occurredAt`, historical `transaction.categoryId`, explicit `Sem categoria — histórico legado`, and minimum order-count / quantity / gross-value measures. Archived categories remain reportable. Payments, signals, balances and FIFO debt are not allocated to categories.

The V4→V5 migration remains additive/non-inventive. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 checkpoints/restores all four tables atomically. D-024 recovery-health state remains separate local metadata and normal writes remain subject to its 24-hour freshness guard.

## Authoritative decisions

D-016 through D-025 remain authoritative:

- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` as the mandatory integration/publication gate;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 is now fully implemented across I1/I2/I3 without changing its semantics.

No new decision number was required for I3.

## P9-S3-I3 closure

PR #48 implemented only the D-025 reporting slice:

1. effective non-reversed `order` rows only;
2. `transactionOccurredAt()` / `occurredAt` reporting time basis;
3. grouping by historical stored `transaction.categoryId`, never current item classification;
4. explicit `Sem categoria — histórico legado` bucket for missing snapshots;
5. order count, summed quantity and gross order value;
6. linked corrections counted only through the effective replacement;
7. archived categories remain reportable;
8. current category name may label a still-existing stable identity while immutable `transaction.categoryName` remains audit history;
9. bounded read-only `/category-report` UI with all-time or inclusive occurrence-period filtering;
10. no payment/signal/balance/debt allocation, backfill/recategorization, profitability inference, schema/backup or later-slice work.

### D-019 and integration proof

- Functional gate: run `32261923163`, job `96096954271`, merge ref `02d656ea771e334622a6248139b508e20a98caf1` — 0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; build PASS.
- **Final documentation-complete gate:** run `32262877105`, job `96100129962`, merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, head `b7e76e56c8049a002243fc693891880ba6bf0a50` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9` — **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #48 squash-integrated into `develop` as **`08ad2973f387035301901f9f46b0c78039796c2d`**.
- Validated merge ref and integrated squash share exact tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

## Boundary entering P9-S4

P9-S4 remains evidence-bounded. Do not treat generic “edit transaction” friction as authorization for arbitrary destructive editing.

Before any new correction runtime is implemented, map the source-proven unsupported correction actions to concrete store operator cases and identify the confirmed high-value subset while preserving P2 audited reversal/replacement history. Do not weaken D-012/D-013, do not introduce destructive mutation of historical financial rows, and do not start P9-S5/P10 or backend/auth/cloud/live-sync work.

## NEXT_ACTION

**Execute only the P9-S4 evidence/contract gate for confirmed correction microflows: inspect the already-accepted direct store evidence and the current correction UI/domain only as needed to map the source-proven unsupported correction actions to concrete operator cases, distinguish what is already supported from what is genuinely missing, and define the smallest confirmed high-value correction subset that may be implemented while preserving audited reversal/replacement history. Do not implement speculative correction actions before that mapping is established; do not alter historical rows destructively; do not start P9-S5/P10 or backend/auth/cloud/live-sync work. Preserve D-012/D-013/D-016/D-017/D-018/D-019/D-024/D-025 and run D-019 before integrating the evidence/contract slice.**
