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
- P9-S2 — Recovery durability decision gate: `BLOCKED` pending direct recovery-target evidence.
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

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve P8 evidence. `docs/V2/P9_PRIORITIZATION.md` contains the accepted P9-S1 scoring and bounded current-capability inventory. `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` contains the minimum direct evidence required to resume blocked P9-S2.

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

No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by P8/P9-S1 or by the blocked P9-S2 attempt.

## P8 direct real-store conclusion

Direct stakeholder evidence supplied on 2026-08-18 confirms:

- Easy is used by Duda and store owners without a current concurrency requirement;
- current use is PC-based and the same live dataset is not currently required automatically on multiple devices;
- resellers receive PDF/extracts and do not need interactive Easy access;
- JSON/manual off-device handling is the current backup/portability mechanism;
- no trusted server integration is currently mandatory;
- scale is modest: up to roughly 100 resellers, around 50 active, with limited daily entries.

If the operating PC fails before the current JSON has been copied to Drive, the working dataset may be lost and the store may need to reconstruct tens of thousands of reais in sales. Human-memory-dependent off-device backup is therefore a confirmed critical continuity risk. Numeric RPO/RTO and a formal remote-recovery SLA remain unresolved, so this does not itself reopen D-016.

Confirmed product needs include item categories, item classification and category-level reporting. Edit/correction friction is also confirmed, but P8 did not enumerate exact store cases. Delayed financial entry is already supported by editable `Data da ocorrência` / `occurredAt` and must not be rebuilt as a new date model.

D-016 final P8 disposition: all explicit reopen triggers remain NOT PROVEN, with security-policy incompatibility UNRESOLVED / NOT PROVEN. D-022 therefore keeps D-016 for the current operating mode.

## P8 accepted validation/integration

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #27 was squash-merged into `develop` as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; the validated merge ref and integrated commit share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`. Canonical P8 closure then integrated into `develop` as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

## P9-S1 accepted prioritization

P9-S1 completed documentation/decision work only. It inspected current source narrowly enough to distinguish already-supported behavior from missing/constrained behavior and records the full evidence matrix in `docs/V2/P9_PRIORITIZATION.md`.

Accepted weighted ranking:

1. **Recovery durability / off-device protection — 94/100.** Current export is operator-initiated; the confirmed catastrophic failure mode is human dependence on creating/moving a fresh copy. First P9 problem.
2. **Item categories + classification + category reporting — 83/100.** Direct confirmed need; requires a bounded data/reporting contract before schema/backup/report implementation.
3. **Exact transaction edit/correction microflows — 70/100.** Direct friction exists, while exact store cases remain unenumerated. Source proves that guided correction cannot change `occurredAt`, order item, transaction type or observation, and is blocked for an order whose original item is inactive.
4. **Occurrence-date discoverability/usability — 69/100.** Creation already exposes `Data da ocorrência` with explanatory copy and persists `occurredAt`; verify usability only.

Item and reseller records already have explicit edit flows. Transaction reversal and linked replacement already support audited correction of reseller and financial value/quantity. Source-proven unsupported transaction actions must not be misrepresented as cases Duda explicitly reported; direct mapping is required before implementation.

D-023 accepts the P9 sequence: P9-S2 recovery durability decision gate, P9-S3 category data/reporting contract, P9-S4 directly confirmed correction microflows, then P9-S5 occurrence-date usability verification.

P9-S1 changed no runtime, schema, backup contract, financial semantics, backend/auth/cloud/live synchronization or broader module behavior.

## P9-S1 accepted validation/integration

Persistent Critical QA run **`32166330198`**, job **`95806665221`** — **PASS** on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #31 was squash-merged into `develop` as `3d99814c0f97dce640a91721fc68d33e79575cc3`. The validated merge ref and integrated commit share the exact tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`, proving that the integrated content is the content accepted by D-019.

## P9-S2 blocked evidence attempt

P9-S2 attempted only the required recovery-target evidence gate. It reread the accepted P8 direct-store evidence and P9-S1 prioritization and searched repository-accessible material for a newer recovery target.

Confirmed evidence remains sufficient to prove the continuity problem but insufficient to establish the required measurable target:

- catastrophic operating-PC loss before a fresh JSON reaches Drive is directly confirmed;
- manual human memory is directly confirmed as the weak link;
- acceptable maximum age of the newest recoverable off-device copy remains **UNRESOLVED**;
- acceptable recovery procedure and interruption window after PC loss remain **UNRESOLVED**;
- provider-operated remote recovery remains **UNRESOLVED / NOT PROVEN**.

Because P9-S2 explicitly forbids invented SLA/RPO/RTO values, no recovery target can be accepted and no mechanism can be compared as fit-for-purpose yet. D-016 remains authoritative; absence of a target is a blocker, not evidence for or against cloud/server persistence.

`docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` records the minimum direct store answers required to resume. No recovery automation, runtime/schema change, backend/auth/cloud/live synchronization or other P9 feature work was performed.

## Active constraints

- do not work directly on `main`;
- preserve all P1–P9-S1 contracts and D-017/D-018/D-019;
- keep D-016 authoritative unless later direct evidence proves a reopen trigger;
- prioritize confirmed operational consequence over feature novelty;
- do not convert future preferences into mandatory requirements;
- do not rebuild occurrence-date support already provided by P3;
- do not compare/select or implement a recovery mechanism while the P9-S2 measurable target is unresolved;
- do not start P9-S3/P9-S4/P9-S5 while P9-S2 is the active blocked gate;
- run full `npm run qa:critical` before integrating every slice, including blocked-state documentation.

## NEXT_ACTION

**Obtain only the missing direct store evidence listed in `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md`: the maximum acceptable age of the latest recoverable off-device copy, the acceptable recovery procedure after permanent operating-PC loss, the acceptable interruption window, and relevant off-device destination/operating constraints. Record the answers as direct evidence without inventing SLA/RPO/RTO values. Until those answers exist, keep P9-S2 `BLOCKED`, keep D-016 authoritative, and do not compare/select/implement a recovery mechanism or start category/schema, correction, occurrence-date, backend/auth/cloud/live-synchronization or other runtime work.**