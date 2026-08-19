# Easy V2 — Canonical Status

**Updated:** 2026-08-19  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `DONE / INTEGRATED`.**  
**P10 — Controlled beta, migration and cutover: `NOT_STARTED`.**

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
- P9-S3 — Categories/classification/reporting: `DONE / INTEGRATED`.
- P9-S4 — Confirmed correction microflows: `DONE / INTEGRATED`.
- **P9-S5 — Occurrence-date usability verification: `DONE / INTEGRATED`.**
- **P10 — Controlled beta, migration and cutover: `NOT_STARTED`.**

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
- `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` and `P9_CORRECTION_DECISION.md` — completed D-026 / P9-S4 record;
- **`docs/V2/P9_DATE_USABILITY.md` — completed P9-S5 verification record.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. No P9-S5 production-runtime change was required.

Transaction creation keeps D-014/P3 semantics:

- `Data da ocorrência` defaults to today's browser-local date;
- the field is visible in the primary transaction-entry block beside reseller/type;
- it is directly editable before save;
- helper text identifies it as the financial date and states that registration time is saved automatically;
- the selected date persists as `occurredAt` independently from generated `createdAt`.

## Authoritative decisions

D-016 through D-026 remain authoritative. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- **D-014 separates financial occurrence (`occurredAt`) from registration/audit time;**
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity and immutable historical category snapshots;
- D-026 keeps effective transaction business fields correctable through audited linked replacement.

P9-S5 accepted no new architectural decision because the verified workflow already satisfies the direct evidence without changing D-014/P3.

## P9-S5 verification result

The direct operator evidence retained from P9-S4 was narrow: routine transaction entry presented today's date by default, and the operator was unsure whether that behavior still existed.

Source inspection verified that the behavior still exists and is already sufficiently explicit/editable for the bounded requirement:

1. `TransactionForm` initializes the occurrence date from today's browser-local date;
2. `Data da ocorrência` is in the main three-field entry block;
3. the date input is editable before save;
4. the helper states `Data financeira da movimentação. O momento de registro é salvo automaticamente.`;
5. existing P3 persistence behavior stores the selected `occurredAt` separately from `createdAt`.

A focused regression test was added for default/discoverability/helper/editability. **No production source file was changed.**

## P9-S5 validation and integration

- PR #56 validated on D-019 run **`32287018048`**, job **`96178850066`**, merge ref **`9459285920cfbd784a652e9db97cf40741977edf`**.
- Validated merge ref combined head `fef66eb8da6602f0804d0c78eb3d6c30feaf2cac` with base `716fc3b9ec77bada5ca44d992a6760a276e38cfa`.
- Gate result: **0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #56 squash-integrated into `develop` as **`88c70a20071bd97ef3a08285128756e2ce484a74`**.
- Validated merge ref and integrated squash share exact tree **`97a78d3e4d78a54ad117440c160920343513ba9f`**.
- Existing warning/dependency/test-harness debt remains non-blocking because D-019 passed objectively.

## P9 phase result

P9-S1 through P9-S5 are now complete. P9 therefore closes as `DONE / INTEGRATED`.

No P10 controlled beta, migration, cutover or `main` publication was started during P9-S5.

## NEXT_ACTION

**Execute only P10 — Controlled beta, migration and cutover. Reconstruct the current V2 integration/stable/deployment/recovery baseline and define the first bounded P10 acceptance/cutover slice before any production data movement or stable publication. Do not perform production cutover, migrate live store data, or change D-016 architecture without an explicit accepted P10 plan and required validation.**
