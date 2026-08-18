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
- P9-S2 — Recovery durability decision gate: `IN_PROGRESS`; direct recovery-target evidence is now supplied, evidence-intake integration is `IN_REVIEW`, mechanism comparison is not started.
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

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve P8 evidence. `docs/V2/P9_PRIORITIZATION.md` contains the accepted P9-S1 scoring and bounded current-capability inventory. `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` now records both the original P9-S2 evidence request and the direct recovery-target answers supplied on 2026-08-18.

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

No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by P8/P9-S1 or by the current P9-S2 evidence-intake work.

## P8 direct real-store conclusion

Direct stakeholder evidence supplied on 2026-08-18 confirms:

- Easy is used by Duda and store owners without a current concurrency requirement;
- current use is PC-based and the same live dataset is not currently required automatically on multiple devices;
- resellers receive PDF/extracts and do not need interactive Easy access;
- JSON/manual off-device handling is the current backup/portability mechanism;
- no trusted server integration is currently mandatory;
- scale is modest: up to roughly 100 resellers, around 50 active, with limited daily entries.

If the operating PC fails before the current JSON has been copied to Drive, the working dataset may be lost and the store may need to reconstruct tens of thousands of reais in sales. Human-memory-dependent off-device backup is therefore a confirmed critical continuity risk.

Confirmed product needs include item categories, item classification and category-level reporting. Edit/correction friction is also confirmed, but P8 did not enumerate exact store cases. Delayed financial entry is already supported by editable `Data da ocorrência` / `occurredAt` and must not be rebuilt as a new date model.

D-016 final P8 disposition: all explicit reopen triggers remained NOT PROVEN, with security-policy incompatibility UNRESOLVED / NOT PROVEN. D-022 therefore kept D-016 for the current operating mode.

## P8 accepted validation/integration

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #27 was squash-merged into `develop` as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; the validated merge ref and integrated commit share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`. Canonical P8 closure then integrated into `develop` as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

## P9-S1 accepted prioritization

P9-S1 completed documentation/decision work only. `docs/V2/P9_PRIORITIZATION.md` records the full evidence matrix.

Accepted weighted ranking:

1. **Recovery durability / off-device protection — 94/100.** Current export is operator-initiated; the confirmed catastrophic failure mode is human dependence on creating/moving a fresh copy.
2. **Item categories + classification + category reporting — 83/100.** Direct confirmed need; requires a bounded data/reporting contract before schema/backup/report implementation.
3. **Exact transaction edit/correction microflows — 70/100.** Direct friction exists, while exact store cases remain unenumerated.
4. **Occurrence-date discoverability/usability — 69/100.** Creation already exposes `Data da ocorrência` and persists `occurredAt`; verify usability only.

D-023 accepts the P9 sequence: P9-S2 recovery durability decision gate, P9-S3 category data/reporting contract, P9-S4 directly confirmed correction microflows, then P9-S5 occurrence-date usability verification.

Persistent Critical QA run **`32166330198`**, job **`95806665221`** — **PASS** on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; the validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

## P9-S2 evidence history and current direct target

The first P9-S2 attempt executed only recovery-target evidence intake and correctly remained blocked because the measurable store target was missing. Persistent Critical QA run **`32168368086`**, job **`95813314347`** passed on PR #33 merge ref `cbc96eefb315c29c266b1df978bda605c2907352`. PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; both share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

Direct store/operator evidence supplied later on 2026-08-18 now resolves the evidence-availability blocker:

- loss of up to **24 hours** of work is considered a solvable/acceptable recovery case;
- manual restoration on **any computer** is acceptable;
- the Easy has **daily demand** and a multi-day recovery procedure is incompatible with current operation, but no numeric hour-based RTO was supplied and none is invented;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is also acceptable for day-to-day speed/convenience;
- the Google account connection available to ChatGPT is not an Easy credential and does not itself authorize direct Drive API access;
- because operator-run manual recovery on another computer is acceptable, provider-operated remote recovery is not a mandatory current-store requirement.

Canonical target entering mechanism comparison is therefore a newest usable off-device recovery copy no more than **24 hours** old, with operator-run manual restoration on a replacement computer acceptable and a daily-use continuity constraint. No direct evidence supplied here proves a D-016 reopen trigger.

`docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` preserves the exact evidence classification and the rule against converting the qualitative daily-use statement into an invented numeric RTO.

This evidence-intake slice does **not** compare, select or implement a mechanism. It changes no runtime, schema, backup contract, backend/auth/cloud/live synchronization or later P9 behavior.

## Active constraints

- do not work directly on `main`;
- preserve all P1–P9-S1 contracts and D-017/D-018/D-019;
- keep D-016 authoritative unless a later accepted comparison proves an explicit reopen trigger;
- preserve the direct <=24-hour recoverable-copy boundary without silently tightening or loosening it;
- preserve manual-any-computer recovery as acceptable and do not invent provider-operated recovery;
- treat daily demand as a qualitative continuity constraint only; do not invent a numeric RTO;
- treat Google Drive as an acceptable destination, not as an existing Easy credential/integration;
- do not compare/select a recovery mechanism until this evidence-only slice passes D-019 and integrates;
- do not implement a recovery mechanism until a later accepted P9-S2 mechanism decision authorizes it;
- do not start P9-S3/P9-S4/P9-S5 while P9-S2 remains active;
- run full `npm run qa:critical` before integrating every slice, including documentation-only evidence work.

## NEXT_ACTION

**Validate and integrate only this P9-S2 direct recovery-evidence intake under the full D-019 `npm run qa:critical` gate. Do not compare/select or implement a recovery mechanism in this slice. After accepted integration, the next canonical action may advance to comparing the smallest D-016-compatible mechanisms against the direct <=24-hour recoverable-copy target, manual-any-computer recovery procedure, daily-use continuity constraint and acceptable Drive/local destinations.**