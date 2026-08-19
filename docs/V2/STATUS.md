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
- **P9-S4 — Confirmed correction microflows: `IN_PROGRESS`.**
  - evidence/source mapping gate: `DONE / INTEGRATED`;
  - direct operator evidence: `DONE`;
  - D-026 correction contract/decision: `DONE / IN_REVIEW`;
  - P9-S4-I1 full-field audited replacement editor: `NOT_STARTED`.
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
- `docs/V2/P9_PRIORITIZATION.md` — P9-S1 scoring/source inventory;
- `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` and `P9_RECOVERY_DECISION.md` — P9-S2;
- `docs/V2/P9_CATEGORY_CONTRACT.md` — completed D-025 / P9-S3 record;
- `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` — direct P9-S4 evidence record;
- `docs/V2/P9_CORRECTION_DECISION.md` — D-026 and bounded P9-S4-I1 contract.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

Current transaction correction runtime still reflects P2: it can change reseller, order quantity/unit price, payment/signal value and perform pure reversal, but it still preserves original type, occurrence date, order item and observation during guided replacement. **D-026 is accepted as the next contract but is not implemented yet.**

## Authoritative decisions

D-016 through D-026 are authoritative once this decision slice is integrated. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity and immutable historical category snapshots;
- **D-026 requires operator-entered business fields of an effective transaction to be correctable by audited linked replacement, never destructive in-place history mutation.**

## P9-S4 direct evidence and decision result

Direct operator evidence received 2026-08-19 resolves the prior blocker.

The operator first described the practical date concern as the system presenting today's date by default in routine transaction/report contexts and did not know the individual frequency of wrong item/type/observation/archive cases. The operator then clarified the actual product requirement: **information entered into the system must remain editable afterward, while prior history does not need to be overwritten by that correction.**

Canonical consequences:

1. post-save transaction correction is a confirmed product need;
2. field-by-field frequency/workaround/consequence remain unknown and are not invented;
3. the smallest coherent implementation is one complete audited replacement editor rather than several deliberately incomplete partial editors;
4. the original transaction and audit metadata remain immutable;
5. replacement may change reseller, type, `occurredAt`, observation, and the applicable order/payment fields under normal domain validity;
6. D-025 category snapshots must be preserved when keeping the same order item and freshly captured when changing to another active/classified item;
7. the archive-specific edge was not confirmed as a recurring store incident, so P1/D-011 lifecycle rules are not weakened by this decision;
8. today's-date default/discoverability is retained as separate evidence for P9-S5, not changed in P9-S4.

No correction runtime, schema or backup change is implemented by this decision slice.

## NEXT_ACTION

**Execute only P9-S4-I1 — Full-field audited transaction replacement editor — under D-026. Extend the existing linked replacement flow so the replacement may define target reseller, transaction type, `occurredAt`, observation, and the applicable order item/quantity/unit price or payment/signal value while preserving mandatory correction reason, atomic replacement+reversal, original-row immutability, D-024 write guard and D-025 category snapshot semantics. Target newly selected reseller/item references must continue to satisfy current active/reference rules; do not weaken P1/D-011 to solve inactive-entity edge cases. Add focused tests for date, item, type, observation, target-shape validation, category snapshot preservation/change, original immutability and reversal linkage. Do not modify schema/backup, do not perform destructive in-place transaction edits, do not start P9-S5/P10, and do not add backend/auth/cloud/live synchronization. Run the full D-019 gate before integration.**
