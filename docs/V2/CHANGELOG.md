# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

### Direct evidence received

P8-S2 resumed after a stakeholder supplied direct real-store answers in the project conversation.

Current operating facts established:

- Duda and store owners use Easy; concurrent use of the same dataset is not currently required;
- current use is PC-based and does not require automatic same-live-dataset multi-device operation;
- resellers receive PDF/extracts and do not require interactive Easy access;
- JSON/manual off-device handling remains the current backup/portability mechanism;
- no trusted server integration is currently mandatory;
- scale is modest, at roughly 100 resellers maximum and around 50 active, with limited daily activity.

### Recovery consequence confirmed

Device loss before the current JSON is copied to Drive can destroy the working dataset and force reconstruction of tens of thousands of reais in sales. Human-memory-dependent off-device backup is therefore a confirmed critical continuity risk.

No numeric RPO/RTO, provider-operated recovery obligation or formal remote-recovery SLA was supplied. Recovery durability becomes a high-priority P9 input without falsely proving the D-016 remote-SLA trigger.

### Product needs confirmed

- create/manage item categories;
- assign items to categories such as bronze or porcelain;
- analyze/filter/report financial activity by category;
- inventory the exact edit/correction microflows that Duda cannot currently perform before implementing them.

The reported need to record a sale using an earlier real occurrence date is already supported by current V2 through editable `Data da ocorrência` / `occurredAt`; it is retained as a discoverability/usability verification item rather than rebuilt as a missing data model.

Accounts/permissions, automatic synchronization and broader order/inventory/store-management expansion remain future directions, not current mandatory requirements.

### D-016 decision

D-022 accepted. Direct P8 evidence proves no current D-016 reopen trigger:

- concurrent operators: NOT PROVEN;
- automatic live multi-device sharing: NOT PROVEN;
- person-level authorship/access control: NOT PROVEN;
- remote recovery SLA: NOT PROVEN, while severe recovery risk is confirmed;
- trusted server integrations: NOT PROVEN;
- security policy incompatible with browser-local storage: UNRESOLVED / NOT PROVEN.

D-016 therefore remains authoritative for the current operating mode. P8-S2 implemented no backend/auth/cloud/live synchronization, Dexie migration, runtime/schema change or P9 feature.

### Validation and integration

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- lint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #27 was squash-merged into `develop` as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`. The validated merge ref and integration share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`.

Known React `act(...)`, legacy mocked-select DOM warnings, 17 dependency-audit findings, Actions/runtime deprecation notices and Vite large-chunk warning remain visible non-blocking debt under D-019.

### Canonical state

- P8-S2: `DONE`;
- P8: `DONE`;
- D-016 retained under D-022;
- P9: `NOT_STARTED`;
- NEXT_ACTION advances only to P9-S1 evidence-backed prioritization; P9-S1 is not executed in this closure.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was correctly treated as a blocker, not as proof that D-016 triggers were false.

`docs/V2/P8_EVIDENCE_REQUEST.md` was added as the direct-evidence packet. Persistent Critical QA `32152466007`, job `95761457231`, passed; PR #25 integrated as `c8eda199b0a605306619b73f8d3b175f8c673e2f`; canonical blocked-state closure integrated as `5e1b45bef63b8e91c692d35cae9da5c66a905740`.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

P8-S1 inspected canonical documents, original prompts, historical PRDs, README and repository issues. Repository evidence confirmed administrator workflows, mobile/desktop intent, PDF sharing, JSON portability and existing analytics, but did not prove concurrency, live sharing, accounts/permissions, remote recovery SLA, trusted integrations or a local-storage-incompatible security policy.

D-021 accepted: repository evidence alone does not reopen D-016. Persistent Critical QA `32149199373`, job `95750510692`, passed; PR #23 integrated as `65ada02848ad7ca792889b16815c74d0ac9e6da1`; canonical closure integrated as `2c5f5e92dd66224499ffc55f828d3e220a2afd63`.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved the evidence-backed QG-011 through QG-015 inventory under D-020:

- P7-S2: reliable transaction Cancel, visible retry-safe create failures, distinct Payment/Signal intent; `32069261401` PASS;
- P7-S3: explicit invalid reseller statement range rather than silent all-time fallback; `32133559376` PASS;
- P7-S4: Backup page guidance aligned with implemented checkpointed atomic restore; `32136964241` PASS;
- P7-S5: item/reseller save failures made operator-visible without losing retry input; `32141425740` PASS;
- P7-S6: reseller context preserved when launching transaction entry; `32145620210` PASS, 43/176 Vitest and 15/15 Playwright.

P7 closed as `DONE` without changing D-016 persistence architecture.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 reconciled stale global QA expectations, fixed the command-center double-filter defect, established `npm run qa:critical`, added persistent CI and required `quality -> build -> deploy` before GitHub Pages publication from `main`.

D-019 accepted. Functional validation `32064801009`, final docs `32065331102` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and legacy v1 normalization; validation `32058028793` passed and D-017 was accepted.

P5-S2 added validated checkpoint download plus verified atomic Dexie restore with rollback on failure and migration/financial round-trip proof; validation `32060729538` passed and D-018 was accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user on Dexie V4 unless direct requirements later prove concurrency, automatic live multi-device sharing, person-level access/authorship, remote recovery SLA, trusted server integration or incompatible security policy.

No backend/auth/cloud/synchronization implementation was introduced.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated financial occurrence (`occurredAt`) from registration/audit time (`createdAt`) and migrated Dexie to V4; validation `32052076684` passed and D-014 was accepted.

P3-S2 formalized opening → movements → closing statements, positive-reseller total debt and FIFO allocation for outstanding debt aging; validation `32053837309` passed and D-015 was accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 define the accepted semantics. Validations `32041280504` and `32042373332` passed.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references for new activity and guarded destructive deletion while preserving historical rows. Validations `32037965651`, `32038951903` and `32039763539` passed.

---

## 2026-08-17 — P0 canonical V2 governance established

The V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline were established. `main` is the stable reference; `develop` is the V2 integration branch.