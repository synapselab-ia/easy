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

D-020 prioritized evidence-backed operator intent/error risk. Completed slices:

- P7-S1 gap inventory/prioritization — `DONE`; `32066802100`.
- P7-S2 transaction-entry intent/feedback — `DONE`; `32069261401`.
- P7-S3 invalid statement range — `DONE`; `32133559376`, docs `32133891691`.
- P7-S4 Backup recovery copy — `DONE`; `32136964241`.
- P7-S5 item/reseller save feedback — `DONE`; `32141425740`.
- P7-S6 reseller-context transaction launch — `DONE`; `32145620210`.

QG-011 through QG-015 are resolved.

## P8 — Real-store requirements discovery

**Status:** `DONE` — 2026-08-18.

### P8-S1 — Repository evidence and D-016 assessment

**Status:** `DONE`.

Repository evidence did not prove concurrency, automatic live sharing, person-level access/authorship, remote recovery SLA, trusted integrations or local-storage-incompatible security policy. D-021 kept D-016 authoritative pending direct evidence. Persistent gate `32149199373`; canonical closure `32150004427`.

### P8-S2 — Direct real-store validation

**Status:** `DONE`.

Direct evidence confirms current PC-based, non-concurrent operation; PDF/extract sharing to resellers; manual JSON portability/backup; no mandatory server integration; modest scale. It also confirms catastrophic device-loss exposure when the newest JSON has not been copied off-device, item category/reporting needs, and edit/correction friction whose exact store cases were not enumerated.

D-022 keeps D-016 because no explicit reopen trigger was proven. Persistent Critical QA `32158395391`, job `95781056589`; PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization only

**Status:** `IN_REVIEW`.

No runtime/schema/backend/cloud implementation is allowed in this slice. Full evidence and scoring are recorded in `docs/V2/P9_PRIORITIZATION.md`.

Accepted ranking under review:

1. **Recovery durability / off-device protection — 94/100.** Highest known consequence. Current backup generation remains operator-initiated and the critical failure mode is dependence on a person remembering to create/move a fresh copy.
2. **Item categories + item classification + category-level reporting — 83/100.** Direct confirmed product need. Requires a bounded category data/reporting contract before implementation because it crosses model, migration, backup and reporting semantics.
3. **Exact transaction edit/correction microflows — 70/100.** P8 confirms friction but not exact store cases. Source proves guided correction cannot change `occurredAt`, order item, transaction type or observation and is blocked if the original order item is inactive. Items and resellers already have edit flows.
4. **Occurrence-date discoverability/usability — 69/100.** Existing creation UI already exposes `Data da ocorrência` and persists `occurredAt`; verify usability only and do not rebuild P3.

D-023 records the ordering and evidence boundary. P9-S1 awaits the full D-019 gate and integration before becoming `DONE`.

### P9-S2 — Recovery durability decision gate

**Status:** `NOT_STARTED`.

After P9-S1 closes, establish a measurable operating recovery target, at minimum acceptable maximum backup age and acceptable recovery procedure, then compare the smallest D-016-compatible mechanisms that reduce dependence on human memory.

Constraints:

- do not infer a formal remote SLA/RPO/RTO not supplied by the store;
- do not introduce backend/auth/cloud/live synchronization implicitly;
- if a viable requirement/option proves a D-016 reopen trigger, explicitly reopen D-016 before implementation;
- preserve D-017/D-018 logical backup, checkpoint and atomic restore semantics.

### P9-S3 — Category data/reporting contract

**Status:** `NOT_STARTED`.

Define category lifecycle, item assignment, historical transaction/report semantics, migration and backup compatibility before any category schema/runtime implementation.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map the source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving D-012/D-013 audited reversal/replacement history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow in real operation. Do not add a second date model; change UX only if direct evidence shows the current field/default/helper text is insufficient.

Lower-confidence/later candidates unless new direct evidence makes them mandatory:

- accounts/permissions;
- automatic live synchronization;
- broader order/inventory/store-management modules;
- external integrations.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.