# Easy V2 — Canonical Status

**Updated:** 2026-08-19  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `DONE / INTEGRATED`.**  
**P10 — Controlled beta, migration and cutover: `IN_PROGRESS`.**

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
- P9-S5 — Occurrence-date usability verification: `DONE / INTEGRATED`.
- **P10-S1 — Pre-cutover compatibility and rehearsal gate: `CONTRACT ACCEPTED / IMPLEMENTATION NOT_STARTED`.**
- **P10-S1-I1 — Backup/correction compatibility hardening: `NOT_STARTED`.**
- P10-S1-I2 — Non-production migration/recovery rehearsal: `BLOCKED BY I1`.

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
- `docs/V2/P9_DATE_USABILITY.md` — completed P9-S5 verification record;
- **`docs/V2/P10_CUTOVER_PLAN.md` — accepted first P10 pre-cutover contract and evidence baseline.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime V2 is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. D-014/P3 occurrence-date semantics remain unchanged.

## Repository / deployment baseline entering P10

Reconstruction on 2026-08-19 established:

- `main` stable commit: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- P9-closed `develop` commit: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- `develop` is 55 commits ahead of `main` and `main` is not partially migrated;
- both `main` and `develop` are currently unprotected branches, so accepted process/QA gates cannot be assumed to be enforced by branch protection;
- current stable `main` deploys to GitHub Pages on push with its historical build/deploy workflow;
- V2's `deploy.yml` upgrades eventual stable publication to D-019 `quality -> build -> deploy`;
- Vercel project `easy-v2` is the candidate/beta host, not the store's stable production system;
- repository `vercel.json` disables Git-triggered Vercel deployments, preserving manual candidate deployment;
- latest observed READY `easy-v2` deployment points to `develop` commit `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind the completed-P9 baseline.

No candidate refresh, `main` publication or live-store migration was performed while defining P10-S1.

## Stable → V2 migration boundary

The stable `main` application uses Dexie V1 and exports backup version 1 with `items`, `resellers`, `transactions`.

V2 preflight already supports that v1 envelope and normalizes it toward V2 without inventing history:

- missing lifecycle state normalizes legacy items/resellers to active;
- missing transaction `occurredAt` normalizes to the legacy `createdAt`;
- categories/category history are not fabricated;
- legacy items remain unclassified until operator classification;
- new orders remain blocked for unclassified active items under D-025/P1 rules.

Because IndexedDB is origin-local, Vercel/GitHub Pages publication does not itself migrate the stable dataset. A future real cutover must use explicit backup/preflight/restore under a later accepted gate.

## P10 blocker found during reconstruction

The current V2 backup `validateReferences()` still enforces pre-D-026 replacement invariants that require linked replacements to preserve transaction type, order item/category snapshot and `occurredAt`.

D-026 now legitimately permits those effective replacement business fields to change. A valid V2 dataset containing such a correction can therefore conflict with backup self-preflight/export.

This is classified as a **pre-cutover recovery blocker**. It must be corrected before migration rehearsal or any live-store data movement.

The fix must preserve valid audit constraints: bidirectional correction/reversal linkage, referenced-ID existence, chronology and each replacement transaction's own target-shape/reference validity.

## Authoritative decisions

D-016 through D-027 remain authoritative. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- D-014 separates financial occurrence (`occurredAt`) from registration/audit time;
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity and immutable historical category snapshots;
- D-026 keeps effective transaction business fields correctable through audited linked replacement;
- **D-027 requires a fail-closed non-production pre-cutover compatibility/rehearsal gate before copied-live-data beta or stable publication.**

## P9 accepted validation baseline

P9-S1 through P9-S5 have accepted validation/integration evidence. Final P9-S5 runtime-neutral verification was PR #56 / D-019 `32287018048` / `96178850066`, integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`. Canonical P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

## P10-S1 accepted boundary

P10-S1 is deliberately fail-closed:

1. `main` stays untouched;
2. no live-store data is moved;
3. no V2 stable publication occurs;
4. no new Vercel candidate is deployed in the contract slice;
5. P10-S1-I1 first fixes/proves D-026 backup compatibility with full D-019;
6. only after I1 may P10-S1-I2 rehearse v1→V2 migration/recovery using synthetic/non-production data;
7. copied-live-data beta, final freeze, stable publication and cutover remain later explicit go/no-go work;
8. D-016 remains unchanged.

## NEXT_ACTION

**Execute only P10-S1-I1 — Backup/correction compatibility hardening. Update backup validation so valid D-026 linked replacements may change the business fields D-026 permits while preserving bidirectional audit linkage, referenced-ID existence, chronology and each transaction's own target-shape/reference validity. Add focused regression coverage for valid D-026 type/date/item replacement backup export/preflight and for broken-link/invalid-shape rejection; preserve backup-v1 and v2/schema4 compatibility. Run full D-019 before integration. Do not deploy Vercel, do not use live-store data, do not modify `main`, do not change schema/backup envelope or D-016, and do not start P10-S1-I2.**
