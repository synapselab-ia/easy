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
- P9-S2 — Recovery durability decision gate: `IN_PROGRESS`; direct recovery-target evidence intake is accepted and integrated; mechanism comparison/decision is `NOT_STARTED`.
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

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve P8 evidence. `docs/V2/P9_PRIORITIZATION.md` contains the accepted P9-S1 scoring and bounded current-capability inventory. `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` preserves the original P9-S2 evidence request, the direct answers supplied on 2026-08-18 and their accepted bounded interpretation.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. The live database remains Dexie **V4**.

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
- D-023 P9 prioritizes recovery durability first, category modeling/reporting second, bounded correction gaps third, and occurrence-date usability verification fourth.

No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by the accepted P9-S2 evidence intake.

## P8 direct real-store conclusion

Direct stakeholder evidence supplied on 2026-08-18 confirms current non-concurrent PC-based operation, PDF/extract sharing to resellers, manual JSON portability/backup, no mandatory trusted server integration and modest scale. It also confirms severe device-loss/manual-backup exposure, item category/reporting needs and edit/correction friction. Delayed financial entry is already supported by editable `Data da ocorrência` / `occurredAt`.

D-022 keeps D-016 for the current operating mode because no explicit reopen trigger was proven.

## P8 accepted validation/integration

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests PASS, 15/15 Playwright Chromium PASS and production build PASS.

PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; the validated merge ref and integrated commit share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`. Canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

## P9-S1 accepted prioritization

Accepted D-023 ranking remains:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Persistent Critical QA run **`32166330198`**, job **`95806665221`** — **PASS** on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

## P9-S2 evidence history and accepted recovery target

The first P9-S2 attempt correctly remained blocked because the measurable store recovery target was missing. Persistent Critical QA run **`32168368086`**, job **`95813314347`** passed on PR #33 merge ref `cbc96eefb315c29c266b1df978bda605c2907352`. PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; both share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

Direct store/operator evidence supplied later on 2026-08-18 established:

- loss of up to **24 hours** of work is considered a solvable/acceptable recovery case;
- manual restoration on **any computer** is acceptable;
- Easy has **daily demand** and multi-day recovery is incompatible with current operation, but no numeric hour-based RTO was supplied and none is invented;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is acceptable for day-to-day speed/convenience;
- the Google account connected to ChatGPT is not an Easy credential and does not authorize Easy to access Drive;
- provider-operated remote recovery is not mandatory because operator-run manual recovery on a replacement computer is acceptable.

Canonical target entering mechanism comparison is therefore: newest usable off-device recovery copy **no more than 24 hours old**, operator-run manual restoration on a replacement computer acceptable, daily-use continuity required qualitatively, Google Drive acceptable as durable destination and local PC file acceptable as a convenience copy.

No supplied evidence proves a D-016 reopen trigger. A local PC file is not automatically classified as off-device durability; direct Drive API/OAuth integration is not implied by Drive being acceptable.

### Accepted evidence-intake validation/integration

Persistent Critical QA run **`32175718073`**, job **`95837062983`** — **PASS** on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #35 was squash-merged into `develop` as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`. The validated merge ref and integrated commit share exact tree `e1c32464b8260ae3b45094f20464ff3e5745687e`, proving that the evidence integrated into `develop` is the content accepted by D-019.

The accepted evidence-intake slice changed documentation only. It did not compare, rank, select or implement a recovery mechanism; did not reopen D-016; and changed no runtime, schema, backup contract, backend/auth/cloud/live synchronization or later P9 behavior.

## Active constraints

- do not work directly on `main`;
- preserve all P1–P9-S1 contracts and D-017/D-018/D-019;
- enter mechanism comparison with D-016 authoritative; reopen it only if the comparison identifies a proven explicit trigger;
- preserve the direct <=24-hour recoverable-copy boundary without silently tightening or loosening it;
- preserve manual-any-computer recovery as acceptable and do not invent provider-operated recovery;
- treat daily demand as a qualitative continuity constraint only; do not invent a numeric RTO;
- treat Google Drive as an acceptable destination, not as an existing Easy credential/integration;
- do not treat a local-only copy on the failed operating PC as satisfying off-device durability;
- compare/select only; do not implement a recovery mechanism in the next decision slice;
- do not start P9-S3/P9-S4/P9-S5 while P9-S2 remains active;
- run full `npm run qa:critical` before integrating every slice, including documentation-only decision work.

## NEXT_ACTION

**Execute only the P9-S2 recovery mechanism comparison/decision gate. Compare the smallest mechanisms that could satisfy the accepted direct target — newest usable off-device copy <=24 hours old, operator-run manual restore on any computer acceptable, daily-use continuity constraint, Google Drive acceptable as a durable destination, local PC file acceptable as a convenience copy — against D-016/D-017/D-018 and current browser/OS constraints. Explicitly keep or reopen D-016, select and record the smallest fit-for-purpose mechanism, and define any bounded implementation slice required. Do not implement the mechanism, do not start P9-S3/P9-S4/P9-S5, and do not introduce backend/auth/cloud/live synchronization unless the comparison itself proves and records a D-016 reopen trigger.**