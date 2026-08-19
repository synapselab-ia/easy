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

**Status:** `DONE` — 2026-08-17. D-016 keeps V2 local-first/single-user until an explicit direct requirement proves a reopen trigger.

## P5 — Backup, restore and migration

**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

## P6 — Tests, CI and deployment safety

**Status:** `DONE` — 2026-08-17. D-019 established `npm run qa:critical`; functional validation `32064801009`, post-merge `32065713920`.

## P7 — Operational UX refinement

**Status:** `DONE` — 2026-08-18. Final P7-S6 validation `32145620210`; QG-011 through QG-015 resolved.

## P8 — Real-store requirements discovery

**Status:** `DONE` — 2026-08-18.

- P8-S1 repository evidence/D-016 assessment — `DONE`; D-021 accepted.
- P8-S2 direct validation — `DONE`; D-022 kept D-016; Critical QA `32158395391`.

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

Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18.

D-024 selected synchronized recovery-copy folder + 24-hour freshness guard and kept D-016. P9-S2-I1 implemented namespaced local recovery health, fail-safe write blocking, 20-hour warning / exact 24-hour hard boundary, synchronized-folder setup verification, global visibility and persistent Backup/Restore escape access without Drive API/OAuth, backend/cloud/live sync, Dexie migration or backup-envelope version change.

Accepted P9-S2-I1 Critical QA `32180250834`, job `95851336506`; 44/183 Vitest, 17/17 Playwright, build PASS. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 — Categories, classification and category reporting

**Status:** `IN_PROGRESS`.

#### P9-S3 contract gate — Category data/reporting contract

**Status:** `DONE` — 2026-08-18.

D-025 is accepted. `docs/V2/P9_CATEGORY_CONTRACT.md` is authoritative. Contract closure D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

#### P9-S3-I1 — Category persistence + migration + backup compatibility

**Status:** `DONE` — 2026-08-18.

Implemented Dexie V5 category persistence, non-inventive V4→V5 migration, `easy-backup` v2/schema5 with v1/schema4 compatibility, schema5 graph validation and four-table D-018 restore. Final D-019 `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b` with validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

#### P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement

**Status:** `DONE` — 2026-08-18, pending only final documentation-head D-019/integration of the current closure PR.

Implemented scope:

- create/rename/archive/reactivate category lifecycle plus guarded hard deletion;
- case-insensitive category-name uniqueness across active/archived identities;
- archive blocked by active-item references; hard deletion blocked by any item or historical category snapshot reference;
- bounded `/categories` operator management flow;
- item assignment/reassignment only to active categories;
- active category required for new active items and reactivation;
- migrated active legacy items remain editable without fabricated category but cannot enter a new order until classified;
- new orders resolve the item's active category and persist `categoryId + categoryName` transaction-time snapshot;
- correction preserves the original category snapshot, including absence on legacy orders;
- payments/signals remain category-free;
- D-024 write guard remains in force across category/item/transaction mutations.

D-019 history:

- `32202062045` / `95917767742` — **FAIL** at Vitest with 199/205 passing; exposed pre-I2 unclassified success fixtures, ItemForm fixture mismatches and Dexie transaction-zone category lookup. No contract relaxation occurred.
- Functional accepted **`32202440100` / `95918871077`** — **PASS** on PR #46 merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`, head `554e68d64ff9c67c455ff97116736472c5807ec1` over base `d55b13bf5efedb12da937e70afe1e9501d83446b`: 0 errors / 81 warnings, 49/205 Vitest, 17/17 Playwright, build PASS.

The documentation-complete head must pass a fresh D-019 before integration.

#### P9-S3-I3 — Category order-performance reporting

**Status:** `NOT_STARTED` — canonical next slice after I2 integration.

Authorized scope:

- aggregate effective non-reversed `order` transactions only;
- reporting time basis is `occurredAt`;
- group by historical stored `transaction.categoryId`, never the item's current category;
- missing historical category snapshot -> `Sem categoria — histórico legado`;
- minimum measures: order count, summed quantity and gross order value;
- linked correction: reversed original contributes zero; effective replacement contributes once;
- archived categories remain reportable;
- current category name may label an existing stable category identity while transaction `categoryName` remains audit/detail snapshot;
- bounded reporting domain/UI plus targeted tests and full D-019.

Explicitly excluded from I3:

- payment/signal/reseller-balance/open-debt/FIFO category allocation;
- historical category backfill or recategorization;
- profitability/margin without cost data;
- unrelated schema/backup changes;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live sync or D-016 reopening without evidence.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.