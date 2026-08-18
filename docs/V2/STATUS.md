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
- **P9-S2 — Recovery durability: `DONE`; evidence target, mechanism decision and P9-S2-I1 implementation all complete.**
- P9-S3 — Category data/reporting contract: `NOT_STARTED`.
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

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve P8 evidence. `docs/V2/P9_PRIORITIZATION.md` preserves P9-S1 scoring. `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` preserves the accepted P9-S2 target. `docs/V2/P9_RECOVERY_DECISION.md` is the authoritative recovery comparison, D-024 contract and implementation closure.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. The live business database remains Dexie **V4**.

Authoritative contracts include:

- P1 entity lifecycle and reference integrity;
- P2 audited reversal/correction history;
- P3 `occurredAt` financial occurrence, formal statement and FIFO debt semantics;
- D-016 local-first/single-user persistence until an explicit reopen trigger is proven;
- D-017 canonical `easy-backup` v2 logical backup contract;
- D-018 checkpointed verified atomic restore;
- D-019 repository-wide `npm run qa:critical` integration/publication gate;
- D-020 evidence-first operational UX prioritization;
- D-021 repository evidence alone cannot reopen D-016;
- D-022 direct store validation keeps D-016 for the current operating mode;
- D-023 P9 prioritization order;
- **D-024 synchronized recovery-copy folder + 24-hour freshness guard; D-016 remains local-first.**

No backend, authentication, cloud database, live synchronization, Google Drive API/OAuth, Dexie migration or `easy-backup` envelope/version change was introduced by P9-S2.

## P9-S2 accepted target and mechanism

The accepted store recovery target remains:

- newest usable off-device recovery copy **<=24 hours** old;
- manual operator restoration on any computer acceptable;
- daily-use continuity required qualitatively, with no invented numeric RTO;
- Google Drive acceptable as a durable destination;
- local PC file acceptable as a convenience copy;
- provider-operated remote recovery not mandatory.

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** and explicitly **KEEPS D-016**. Google Drive for desktop is the accepted current-store synchronized-folder instance; it is an operating-environment dependency, not an Easy credential, database or synchronization API.

## P9-S2-I1 implemented recovery guard

P9-S2-I1 is implemented and integrated.

Implemented behavior:

1. Recovery-health control metadata is stored only in namespaced local storage (`easy.recoveryHealth.v1`); the business database remains Dexie V4.
2. Health states are `unknown`, `due`, `current`, `warning` and `overdue`.
3. Missing, corrupt or not-yet-verified metadata fails safe: it never counts as fresh and normal data-changing operations remain blocked.
4. A non-contractual warning state begins at 20 hours; the accepted hard boundary remains exactly **24 hours**.
5. Item, reseller and transaction mutations use one centralized recovery write guard. Read-only operation remains available.
6. Backup/Restore remains reachable while health is unknown, due or overdue.
7. `exportData()` preserves the validated `easy-backup` v2 artifact and now returns the exact generated filename and `exportedAt` used for the download. Local recovery freshness is refreshed only after validated download initiation.
8. The Backup page contains the one-time synchronized-folder setup procedure and requires the operator to confirm that the exported file was observed in Drive outside the local-PC-only context before marking setup verified.
9. The global application shell exposes current recovery health and the most recent export time.
10. Easy explicitly reports only backup generation/download initiation; it does **not** claim Google Drive/provider synchronization acknowledgment.

P9-S2-I1 introduced no Drive API/OAuth, backend/auth/cloud database/live synchronization, required File System Access API, Dexie V5, provider-side sync verification or backup-format change.

### P9-S2-I1 validation/integration

The first PR #39 Critical QA run `32179815390`, job `95849949295`, exposed a new E2E harness interaction only: the test attempted to click the global recovery banner while the correctly preserved rejected-mutation dialog still covered the page. Lint and all 44/183 Vitest tests had already passed; the product runtime did not require a behavior change. The test was corrected to dismiss the dialog before exercising the Backup/Restore escape path.

Persistent Critical QA run **`32180250834`**, job **`95851336506`** — **PASS** on PR #39 merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

PR #39 was squash-merged into `develop` as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`. The validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`, proving that the integrated runtime is exactly the content accepted by D-019.

P9-S2 is therefore closed as `DONE`.

## Boundary entering P9-S3

P9-S3 is contract/decision work before any category schema/runtime implementation. The current Item model and canonical `easy-backup` v2 contract have no category dimension, while historical order rows preserve item snapshots. P9-S3 must define category semantics before changing those contracts.

Active constraints:

- do not work directly on `main`;
- preserve P1–P9-S2 and D-016/D-017/D-018/D-019/D-024;
- do not reopen D-016 without a newly proven explicit trigger;
- preserve the implemented recovery guard while P9-S3 is analyzed;
- define category lifecycle, assignment, historical/report semantics, migration and backup compatibility before category implementation;
- do not implement category schema/UI/reporting in the next contract slice;
- do not start P9-S4/P9-S5/P10 while P9-S3 contract work is active;
- run full `npm run qa:critical` before integrating the contract slice.

## NEXT_ACTION

**Execute only P9-S3 — Category data/reporting contract. Inspect the current Item model, transaction item snapshots, category-relevant reporting paths and D-017 backup/migration contracts only as needed. Define and record category lifecycle, item-assignment rules, historical transaction/category semantics, category-level reporting semantics, Dexie migration approach and backup compatibility before any category schema/runtime implementation. Do not implement category schema, category UI or category reporting in this contract slice; do not start P9-S4/P9-S5/P10; preserve D-016/D-017/D-018/D-019/D-024 and the completed P9-S2 recovery guard. Run the full D-019 gate before integration.**