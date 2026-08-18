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

**Status:** `IN_PROGRESS` — target evidence `DONE`; mechanism comparison/decision `DONE`; implementation P9-S2-I1 `NOT_STARTED`.

Accepted direct target:

- newest usable off-device recovery copy **<=24 hours** old;
- manual restore on any computer acceptable;
- daily demand, no invented numeric RTO;
- Google Drive acceptable durable destination;
- local PC file acceptable convenience copy;
- provider-operated remote recovery not mandatory.

Evidence intake passed `32175718073`, job `95837062983`, and integrated through PR #35 as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`.

#### P9-S2 mechanism comparison/decision

**Status:** `DONE` — 2026-08-18.

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** and **KEEPS D-016**.

Comparison result:

- reminder/age visibility alone — rejected as insufficient off-device protection;
- existing `easy-backup` v2 downloaded to an OS/provider-synchronized local folder + 24h guard — **selected**;
- browser file-system handle — not baseline because actual store browser support is not directly evidenced and permission persistence adds failure modes;
- direct Google Drive API/OAuth — not selected; larger than current requirement and no integration trigger proven;
- backend/cloud DB/live synchronization — rejected; no D-016 trigger proven.

Operational baseline uses Google Drive for desktop as the accepted current-store synchronized destination, with a one-time verification that an exported backup is visible outside the local-PC-only context. Easy tracks export freshness, not provider-side synchronization acknowledgment.

Persistent Critical QA **`32177687434`**, job **`95843265579`** — PASS on PR #37 merge ref `79552f7912307db88272e075b2320cade02f6f17`: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and build PASS. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; both share tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

#### P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow

**Status:** `NOT_STARTED`.

Implement only the D-024 bounded runtime slice:

- one-time synchronized-folder setup guidance/verification state;
- local fail-safe recovery-health metadata, no Dexie V5;
- global last-copy health and due/overdue visibility;
- 24-hour gate for normal data-changing work while Backup/Restore remains reachable;
- minimal `exportData()` refactor only to expose export metadata/update local health;
- focused tests and full D-019.

Out of scope: Google Drive API/OAuth, backend/auth/cloud/live sync, required File System Access API, Dexie/backup-format migration, provider-side sync verification and P9-S3+.

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