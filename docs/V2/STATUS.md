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
- **P10-S1 — Pre-cutover compatibility and rehearsal gate: `CONTRACT ACCEPTED / INTEGRATED`.**
- **P10-S1-I1 — Backup/correction compatibility hardening: `DONE / INTEGRATED`.**
- **P10-S1-I2 — Non-production migration/recovery rehearsal: `NOT_STARTED`.**

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
- **`docs/V2/P10_CUTOVER_PLAN.md` — integrated P10 pre-cutover contract, I1 result and I2 rehearsal boundary.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime V2 is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. D-014/P3 occurrence-date semantics remain unchanged.

P10-S1-I1 now aligns backup self-preflight/export with D-026 while retaining D-025 history semantics: type and financial occurrence date may change; a corrected order may change item and capture that target item's valid replacement-time snapshot; an order correction that keeps the same item must preserve the original category snapshot. Bidirectional audit linkage, referenced-ID existence, registration chronology and each transaction's own target shape/reference validity remain enforced.

No schema, Dexie migration or backup-envelope version changed in P10-S1-I1. Backup-v1 and v2/schema4 compatibility remain covered by the existing passing suite.

## Repository / deployment baseline entering P10

Reconstruction on 2026-08-19 established:

- `main` stable commit: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- P9-closed `develop` commit: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- `develop` was 55 commits ahead of `main` when the P10-S1 contract was established and `main` was not partially migrated;
- both `main` and `develop` are currently unprotected branches, so accepted process/QA gates cannot be assumed to be enforced by branch protection;
- current stable `main` deploys to GitHub Pages on push with its historical build/deploy workflow;
- V2's `deploy.yml` upgrades eventual stable publication to D-019 `quality -> build -> deploy`;
- Vercel project `easy-v2` is the candidate/beta host, not the store's stable production system;
- repository `vercel.json` disables Git-triggered Vercel deployments, preserving manual candidate deployment;
- latest observed READY `easy-v2` deployment still points to `develop` commit `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind the completed-P9 baseline.

No candidate refresh, `main` publication or live-store migration was performed while defining, implementing or closing P10-S1-I1.

## Stable → V2 migration boundary

The stable `main` application uses Dexie V1 and exports backup version 1 with `items`, `resellers`, `transactions`.

V2 preflight supports that v1 envelope and normalizes it toward V2 without inventing history:

- missing lifecycle state normalizes legacy items/resellers to active;
- missing transaction `occurredAt` normalizes to legacy `createdAt`;
- categories/category history are not fabricated;
- legacy items remain unclassified until operator classification;
- new orders remain blocked for unclassified active items under D-025/P1 rules.

Because IndexedDB is origin-local, Vercel/GitHub Pages publication does not itself migrate the stable dataset. A future real cutover must use explicit backup/preflight/restore under a later accepted gate.

## P10-S1-I1 blocker resolution

The pre-cutover recovery blocker identified while defining P10-S1 is resolved.

Before I1, `backupService.validateReferences()` still required linked replacements to preserve transaction type, order item/category snapshot and `occurredAt`, which conflicted with valid D-026 corrections.

P10-S1-I1 removed only the obsolete cross-record assumptions:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
- an order replacement may select another item and carry that replacement item's valid category snapshot;
- if an order replacement keeps the same item, the original D-025 category snapshot remains mandatory;
- bidirectional correction/reversal links, referenced IDs, registration chronology and each transaction's own target shape/reference validity remain mandatory.

Focused regression coverage proves valid type/date/item-changing corrections preflight and export successfully while broken links and invalid target shapes remain rejected.

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

## Accepted validation baseline

P9-S1 through P9-S5 have accepted validation/integration evidence. Final P9-S5 runtime-neutral verification was PR #56 / D-019 `32287018048` / `96178850066`, integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`. Canonical P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

P10-S1 contract proof:

- PR #58 D-019 `32290159119` / `96188851730`, validated merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`;
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`;
- validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

P10-S1-I1 implementation proof:

- initial D-019 `32292405631` / `96196002726` correctly blocked integration when the first implementation over-relaxed D-025 same-item category-snapshot preservation; the five new P10 tests passed but one existing P9-S3 regression failed;
- the implementation was narrowed to preserve the same-item snapshot rule while retaining D-026 item/type/date changes;
- authoritative D-019 run **`32292888925`**, job **`96197514379`**, validated PR #60 merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**, combining head `666e4c86df7c6328289d489db7c8eebcb714aad1` with base `a549ce79925aad0cae9e964babd28879e8ad1c15`;
- gate result: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS**;
- PR #60 squash-integrated into `develop` as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated merge ref and integrated squash share exact tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

## P10-S1 boundary after I1

P10-S1 remains deliberately fail-closed:

1. `main` stays untouched;
2. no live-store data has been moved;
3. no V2 stable publication has occurred;
4. P10-S1-I1 is complete/integrated;
5. P10-S1-I2 may now rehearse v1→V2 migration/recovery only with an exact validated candidate and synthetic/non-production data;
6. copied-live-data beta, final freeze, stable publication and production cutover remain later explicit go/no-go work;
7. D-016 remains unchanged.

## NEXT_ACTION

**Execute only P10-S1-I2 — Non-production migration/recovery rehearsal. Manually deploy an exact D-019-passing `develop` SHA to the `easy-v2` candidate, verify the deployed SHA rather than relying on an alias, and use only synthetic/non-production backup-v1 fixture data to rehearse v1→V2 preflight/restore, count/normalization checks, D-024 recovery setup before normal writes, representative legacy item classification/new-order gating, supported transaction/correction flows, V2 backup export and disposable restore round-trip. Record go/no-go evidence for later copied-live-data beta. Do not use live-store data, do not modify or publish `main`, do not perform production cutover or stable publication, and do not change D-016.**
