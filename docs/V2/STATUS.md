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
- **P9-S4 — Confirmed correction microflows: `DONE / INTEGRATED`.**
  - evidence/source mapping gate: `DONE / INTEGRATED`;
  - direct operator evidence: `DONE`;
  - D-026 correction contract/decision: `DONE / INTEGRATED`;
  - **P9-S4-I1 full-field audited replacement editor: `DONE / INTEGRATED`.**
- **P9-S5 — Occurrence-date usability verification: `NOT_STARTED`.**
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
- `docs/V2/P9_PRIORITIZATION.md` — P9-S1 scoring/source inventory;
- `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` and `P9_RECOVERY_DECISION.md` — P9-S2;
- `docs/V2/P9_CATEGORY_CONTRACT.md` — completed D-025 / P9-S3 record;
- `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` — direct P9-S4 evidence record;
- `docs/V2/P9_CORRECTION_DECISION.md` — accepted and implemented D-026 / P9-S4 record.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

**D-026 is now implemented.** The correction flow keeps the original transaction immutable and creates an audited linked replacement whose business state can define reseller, target type, `occurredAt`, observation and the applicable order item/quantity/unit price or payment/signal value. Mandatory correction reason, atomic reversal+replacement linkage and D-024 enforcement remain intact.

For orders, keeping the same item preserves the original D-025 `itemName/categoryId/categoryName` snapshot. Changing/newly introducing an item requires a current active/classified target and captures the target's current snapshot. Order → non-order replacement removes order/category fields only from the replacement. The original row is never recategorized or destructively rewritten.

The UI surfaces inactive/missing historical-item constraints rather than weakening P1/D-011: an unavailable original item cannot be reused as a new target, but correction may select another valid item or another transaction type.

## Authoritative decisions

D-016 through D-026 are authoritative. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity and immutable historical category snapshots;
- **D-026 requires and now implements correction of effective transaction business fields through audited linked replacement, never destructive in-place history mutation.**

## P9-S4 implementation result

P9-S4-I1 completed the bounded D-026 runtime without schema, backup, backend, auth, cloud/live-sync, P9-S5 or P10 changes.

Implemented behavior:

1. full replacement-state editor exposes reseller, type, financial occurrence date and observation;
2. order replacements expose item, quantity and unit price/derived total;
3. payment/signal replacements expose movement value and carry no order-shape fields;
4. same-item order correction preserves the historical D-025 snapshot;
5. changed/new order item requires active/classified current references and captures a current snapshot;
6. original business values remain immutable; only reversal audit metadata is added to the original;
7. replacement and reversal linkage remain atomic with mandatory reason;
8. D-024 freshness guard remains in front of the write;
9. legacy bounded replacement callers remain compatible while the full editor uses the expanded D-026 payload explicitly.

Focused tests cover type/date/observation changes, order item changes, target-shape rejection, D-025 snapshot preservation/recapture, original immutability, reversal linkage, inactive target rejection and D-024 blocking.

## P9-S4-I1 validation and integration

- PR #54 validated on D-019 run **`32285620846`**, job **`96174326588`**, merge ref **`4b51a5f35c2104d636903ce89eecbc995a0f3ce3`**.
- Validated merge ref combined head `a4f0b026e14fc85bd02eee56db262b5271507b3c` with base `0f3ec562717c75981802f330d64410ee612a034d`.
- Gate result: **0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #54 squash-integrated into `develop` as **`f1cfd126c18691da1256a1d3f918158d7aa9495a`**.
- Validated merge ref and integrated squash share exact tree **`5679693b5f588f58404050cfca8ffd17a9a49fb3`**.
- Existing React/test-harness/lint/dependency/Actions/chunk warnings remain non-blocking because the complete D-019 gate passed objectively.

## Boundary entering P9-S5

Direct operator evidence retained one separate date-usability signal: routine transaction entry presents today's date by default. Current P3 semantics already distinguish `occurredAt` from registration/audit time, and P9-S4 intentionally did not redesign that model.

P9-S5 is therefore a bounded usability verification, not permission to add another date model or modify unrelated correction/runtime behavior.

## NEXT_ACTION

**Execute only P9-S5 — Occurrence-date usability verification. Reconstruct the direct date-usability evidence and inspect the current transaction-entry workflow to verify that `Data da ocorrência` defaults to today's local date, remains clearly discoverable/editable before save, and continues to persist as financial occurrence independently from registration time. If an evidence-backed usability gap is actually present, make only the smallest bounded UI/test change needed without changing D-014/P3 date semantics. Do not reopen D-016, do not modify schema/backup, do not start P10, and do not perform unrelated correction/runtime work. Run the full D-019 gate before integration of any runtime change.**
