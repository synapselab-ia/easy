# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-18

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

## P1 — Referential integrity and safe entity lifecycle

**Status:** `DONE` — 2026-08-17.

- P1-S1 safe reseller lifecycle — `DONE`; validation `32037965651`.
- P1-S2 safe item lifecycle — `DONE`; validation `32038951903`.
- P1-S3 referential validation/migration — `DONE`; validation `32039763539`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`; validation `32041280504`.
- P2-S2 linked/guided replacement — `DONE`; validation `32042373332`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`; validation `32052076684`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`; validation `32053837309`.

## P4 — Persistence architecture decision

**Status:** `DONE` — 2026-08-17.

D-016 keeps V2 local-first/single-user on Dexie V4 until an explicit direct requirement proves a reopen trigger.

## P5 — Backup, restore and migration

**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

## P6 — Tests, CI and deployment safety

**Status:** `DONE` — 2026-08-17.

D-019 established `npm run qa:critical` as the persistent integration/publication gate. Functional validation `32064801009`; post-merge validation `32065713920`.

## P7 — Operational UX refinement

**Status:** `DONE` — 2026-08-18.

D-020 prioritized evidence-backed operator intent/error risk. P7-S1 through P7-S6 are `DONE`; QG-011 through QG-015 are resolved. Final P7-S6 validation `32145620210`.

## P8 — Real-store requirements discovery

**Status:** `DONE` — 2026-08-18.

### P8-S1 — Repository evidence and D-016 assessment

**Status:** `DONE`.

D-021 kept D-016 authoritative pending direct evidence. Persistent gate `32149199373`; canonical closure `32150004427`.

### P8-S2 — Direct real-store validation

**Status:** `DONE`.

Direct evidence confirmed current PC-based, non-concurrent operation, PDF/extract sharing, manual JSON portability/backup, no mandatory server integration, modest scale, severe device-loss exposure, category/reporting need and edit/correction friction. D-022 kept D-016. Persistent Critical QA `32158395391`; canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization only

**Status:** `DONE` — 2026-08-18.

D-023 accepted order:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Persistent Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability decision gate

**Status:** `IN_PROGRESS` — direct recovery-target evidence intake is `DONE`; mechanism comparison/decision is `NOT_STARTED`.

Historical blocked evidence attempt passed Critical QA `32168368086`, job `95813314347`, and integrated through PR #33 as `0017538b93c438f4374b1b2427222f27b9ef357d`.

Accepted direct target supplied on 2026-08-18:

- newest usable off-device recovery copy must be no more than **24 hours** old;
- manual restore on **any computer** is acceptable;
- daily demand makes multi-day recovery incompatible with operation, without inventing a numeric hour-based RTO;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is acceptable as a convenience copy;
- provider-operated remote recovery is not mandatory;
- ChatGPT Google-account connectivity is not Easy authorization for Drive.

Evidence-intake Critical QA **`32175718073`**, job **`95837062983`** — PASS on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and build PASS. PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`; validated merge ref and integration share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

The evidence blocker is closed. No mechanism was compared, selected or implemented, and D-016 remains authoritative entering the next decision slice.

Next P9-S2 work is decision-only: compare the smallest candidate mechanisms against the accepted target and D-016/D-017/D-018, explicitly keep/reopen D-016, select/record a mechanism and define a bounded implementation slice if required. Do not implement in the comparison slice.

### P9-S3 — Category data/reporting contract

**Status:** `NOT_STARTED`.

Define category lifecycle, item assignment, historical transaction/report semantics, migration and backup compatibility before any category schema/runtime implementation.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.