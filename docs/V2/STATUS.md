# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `NOT_STARTED`.**

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
- P9-S1 — Evidence-backed prioritization: `NOT_STARTED`.
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

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve the completed P8 evidence record.

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
- D-022 direct store validation keeps D-016 for the current operating mode.

No backend, authentication, cloud database, live synchronization or Dexie migration has been authorized by P8.

## P8 direct real-store conclusion

Direct stakeholder evidence supplied on 2026-08-18 confirms the current operation:

- Easy is used by Duda and store owners;
- concurrent operation on the same dataset is not currently required;
- current use is PC-based;
- the same live dataset is not currently required automatically on multiple devices;
- resellers receive PDF/extracts and do not need interactive Easy access;
- JSON/manual off-device handling is the current backup/portability mechanism;
- no trusted server integration is currently mandatory;
- scale is modest: up to roughly 100 resellers, around 50 active, with limited daily entries.

### Confirmed high-severity recovery risk

If the operating PC fails before the current JSON has been copied to Drive, the working dataset may be lost and the store may need to reconstruct tens of thousands of reais in sales. Human-memory-dependent off-device backup is therefore a confirmed critical continuity risk.

This does **not** establish a numeric RPO/RTO, provider-operated remote recovery requirement or formal remote-recovery SLA. Recovery durability is a high-priority P9 input, while the explicit D-016 remote-SLA trigger remains unproven.

### Confirmed product needs

- item categories must exist;
- items must be classifiable into categories such as bronze or porcelain;
- reporting/analysis must support category-level views;
- multiple edit/correction microflow gaps exist in real operation, but exact unsupported record/action cases still need bounded inventory before implementation.

The reported need to enter a sale using its true earlier financial date is already supported by the editable `Data da ocorrência` / `occurredAt` model. P9 must verify discoverability/usability instead of rebuilding date semantics.

### Future directions, not present requirements

- improve or eventually eliminate dependence on manual JSON handling;
- consider accounts/permissions later for security if Easy becomes broader/networked;
- potentially expand into orders, inventory and broader store organization.

These directions do not currently authorize backend/auth/cloud/live synchronization or broader modules.

## D-016 final P8 trigger disposition

| Reopen trigger | P8-S2 result |
| --- | --- |
| Concurrent operators | **NOT PROVEN** |
| Automatic live multi-device sharing | **NOT PROVEN** |
| Person-level authorship/access control | **NOT PROVEN** |
| Remote recovery SLA | **NOT PROVEN** — severe recovery risk confirmed, formal SLA/RPO/RTO unresolved |
| Trusted server integrations | **NOT PROVEN** |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** |

**Decision: KEEP D-016 for the current operating mode.**

## P8-S2 validation and integration

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

PR #27 was squash-merged into `develop` as **`e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`**. The validated merge ref and integrated squash commit both resolve to tree **`2f14efe36e7d59c12a59cfa88066961b99416cf4`**, so the integrated P8-S2 conclusion is byte-for-byte the content validated by D-019.

Known React `act(...)`, legacy mocked-select DOM warnings, 17 dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and Vite large-chunk warning remain non-blocking debt under D-019; no gate was weakened.

`main` remains untouched at **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**.

## Active constraints entering P9

- do not work directly on `main`;
- preserve all P1–P8 contracts and D-017/D-018/D-019;
- keep D-016 authoritative unless later direct evidence proves a reopen trigger;
- prioritize confirmed operational consequence over feature novelty;
- do not convert future preferences into mandatory requirements;
- do not rebuild occurrence-date support already provided by P3;
- do not implement a P9 feature during P9-S1 prioritization;
- run full `npm run qa:critical` before integrating every slice.

## NEXT_ACTION

**P9-S1 — Prioritize the P8-confirmed operational gaps without implementing them. Score and order at least: (1) recovery durability beyond human-dependent manual JSON/Drive copying; (2) item categories, item classification and category-level reporting; and (3) the exact unsupported edit/correction microflows, after identifying which records/actions Duda cannot currently correct. Treat delayed transaction entry as an already implemented `occurredAt` capability and verify only discoverability/usability rather than rebuilding it. Keep accounts/permissions, live synchronization, inventory/orders/store-management and other broad systemization as later candidates unless new direct evidence makes them mandatory. P9-S1 is prioritization only: do not implement runtime/schema/backend/cloud features in that slice. Run full `npm run qa:critical` before integration.**