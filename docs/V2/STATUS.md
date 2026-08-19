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
- **P9-S4 — Confirmed correction microflows: `BLOCKED — direct operator confirmation required`.**
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
- `docs/V2/P9_PRIORITIZATION.md` — P9-S1 scoring and source-proven correction gap matrix;
- `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` — accepted P9-S2 recovery target;
- `docs/V2/P9_RECOVERY_DECISION.md` — D-024 mechanism and implementation closure;
- `docs/V2/P9_CATEGORY_CONTRACT.md` — completed authoritative P9-S3 contract/implementation record (D-025);
- `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` — exact direct confirmations required before any P9-S4 correction runtime.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with four business tables: `categories`, `items`, `resellers`, `transactions`.

Category behavior includes stable category lifecycle, active-category item classification with lossless legacy compatibility, immutable transaction-time category snapshots for new orders and read-only order-performance reporting at `/category-report`.

Canonical interchange remains `easy-backup` version 2 / schema5. D-018 checkpoints/restores all four tables atomically. D-024 recovery-health state remains separate local metadata and normal writes remain subject to its 24-hour freshness guard.

## Authoritative decisions

D-016 through D-025 remain authoritative. In particular:

- D-012 requires audited reversal instead of destructive financial history editing;
- D-013 requires atomic linked replacement correction;
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory before integration/publication;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 remains fully implemented across P9-S3 I1/I2/I3.

No new decision is accepted by the P9-S4 evidence gate.

## P9-S4 evidence/contract gate result

The accepted direct store evidence proves that Duda encounters several edit/correction friction points, but it explicitly states that the exact record/action pairs were **not enumerated**. P9-S1 separately proved a set of unsupported/constrained correction actions in source and explicitly prohibited treating those source findings as claims that Duda reported each case.

Current source inspection confirms the existing audited flow already supports:

1. wrong reseller on an effective transaction;
2. wrong order quantity;
3. wrong order unit price / resulting total;
4. wrong payment or signal amount;
5. pure reversal/cancellation with mandatory reason.

The current source also confirms these five concrete gaps/constraints:

1. **financial occurrence date after save** — guided replacement preserves the original `occurredAt`;
2. **order item after save** — guided replacement must preserve the original `itemId`;
3. **transaction type after save** — guided replacement preserves `order` / `payment` / `signal` type;
4. **observation after save** — guided replacement preserves the original `observation`;
5. **guided correction after the original order item is archived** — reversal remains possible, but replacement is blocked while the original item is inactive.

These are source-proven gaps, not yet directly confirmed store cases. The directly confirmed delayed-entry workflow makes wrong `occurredAt` a relevant candidate, but the accepted evidence does not prove that post-save date correction itself occurs or is a high-value need.

Therefore **no smallest confirmed implementation subset can yet be selected without inventing evidence**. P9-S4 runtime remains `NOT_STARTED`, no D-012/D-013 semantics are changed, and no D-026 is created.

`docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` records the minimum direct questions needed to resolve the blocker.

## Integration state of this evidence gate

This documentation-only evidence/contract slice must pass D-019 and integrate into `develop` before its blocked state is canonically closed. No runtime file is part of the slice.

## NEXT_ACTION

**Collect only the direct P9-S4 operator evidence requested in `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md`: for each source-proven gap (wrong occurrence date after save, wrong order item, wrong transaction type, wrong/missing observation, and correcting an order after its item was archived), record whether the case actually occurs in store operation, approximate frequency, current workaround and business consequence, plus any other exact missing record/action pair. Do not implement correction runtime yet. After direct evidence is received, rerun only the bounded P9-S4 mapping/decision gate to select the smallest confirmed high-value subset — or close P9-S4 with no runtime if no missing case is confirmed — while preserving D-012/D-013/D-016/D-017/D-018/D-019/D-024/D-025. Do not start P9-S5/P10 or backend/auth/cloud/live-sync work.**
