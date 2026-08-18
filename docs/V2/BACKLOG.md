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

- P8-S1 — repository evidence/D-016 assessment: `DONE`; D-021 accepted.
- P8-S2 — direct validation: `DONE`; D-022 kept D-016; persistent Critical QA `32158395391`.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — 2026-08-18.

D-023 accepted order:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Persistent Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18.

Accepted target:

- newest usable off-device recovery copy **<=24 hours** old;
- manual restore on any computer acceptable;
- daily demand, no invented numeric RTO;
- Google Drive acceptable durable destination;
- local PC file acceptable convenience copy;
- provider-operated remote recovery not mandatory.

Evidence intake passed `32175718073`, job `95837062983`, and integrated through PR #35 as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`.

#### P9-S2 mechanism comparison/decision

**Status:** `DONE` — 2026-08-18.

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** and **KEEPS D-016**. The existing `easy-backup` v2 + OS/provider-synchronized local folder was selected over reminder-only, required browser file-handle API, direct Google Drive API/OAuth and backend/cloud/live synchronization.

Decision Critical QA `32177687434`, job `95843265579`, passed on PR #37. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; validated merge ref and integration share tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

#### P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow

**Status:** `DONE` — 2026-08-18.

Implemented within D-024:

- one-time synchronized-folder setup guidance and explicit operator verification;
- namespaced local recovery-health metadata only, no Dexie V5;
- fail-safe `unknown/due` behavior for missing/corrupt/unverified state;
- global recovery health with last export metadata;
- non-contractual warning at 20 hours and hard mutation gate at the accepted 24-hour boundary;
- centralized write enforcement for item, reseller and transaction mutations;
- Backup/Restore and read-only access preserved while blocked;
- `exportData()` returns exact filename/export time after the existing validated v2 download initiation;
- no provider-side sync assertion or Google Drive API/OAuth.

The first run `32179815390`, job `95849949295`, failed only a new E2E harness interaction while the correctly preserved rejected-mutation dialog remained open; no product behavior change was required. After a test-only correction, persistent Critical QA **`32180250834`**, job **`95851336506`** passed: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and production build PASS.

PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`; validated merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a` and integration share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

P9-S2 is closed. D-016/D-017/D-018/D-019/D-024 remain authoritative.

### P9-S3 — Category data/reporting contract

**Status:** `NOT_STARTED`.

Next work is contract-only. Define before any category implementation:

- category lifecycle and identity rules;
- item assignment/reassignment semantics;
- historical transaction/category semantics for existing and future order snapshots;
- category-level reporting semantics;
- Dexie migration approach;
- D-017 backup/export/import compatibility.

Do not implement category schema, UI or reporting until this contract itself passes D-019 and integrates.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.