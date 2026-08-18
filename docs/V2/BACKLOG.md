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

D-024 selected synchronized recovery-copy folder + 24-hour freshness guard and kept D-016. P9-S2-I1 implemented namespaced local recovery health, fail-safe write blocking, 20-hour warning / exact 24-hour hard boundary, synchronized-folder setup verification, global visibility and persistent Backup/Restore escape access without Drive API/OAuth, backend/cloud/live sync, Dexie migration or backup-envelope change.

Accepted P9-S2-I1 Critical QA `32180250834`, job `95851336506`; 44/183 Vitest, 17/17 Playwright, build PASS. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 — Categories, classification and category reporting

**Status:** `IN_PROGRESS`.

#### P9-S3 contract gate — Category data/reporting contract

**Status:** `DONE` — 2026-08-18.

D-025 is accepted. `docs/V2/P9_CATEGORY_CONTRACT.md` is authoritative.

Accepted contract:

- stable category identity with reversible archive/reactivation;
- item assignment/reassignment to active categories, with reassignment affecting future orders only;
- future order classification snapshot using `categoryId` + `categoryName`;
- no fabricated category assignment/snapshot for existing V4 items/orders;
- legacy orders without category snapshot remain valid as `Sem categoria — histórico legado`;
- category reports aggregate only effective orders by `occurredAt`, with order count, quantity and gross order value;
- no category allocation of reseller payments/signals/balance/FIFO debt;
- target Dexie V5 migration is lossless and initially creates no categories;
- D-017 stays `easy-backup` version 2, adding schemaVersion 5 category data while preserving v1 and v2/schema4 compatibility;
- D-018 target restore boundary expands atomically to categories/items/resellers/transactions.

Contract-only Critical QA **`32184499171`**, job **`95864903309`** passed on PR #44 merge ref `31a4adca45f74e6907cfce079a98c95b2c580738`: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and build PASS.

No category runtime/schema/UI/reporting implementation occurred in the contract gate.

#### P9-S3-I1 — Category persistence + migration + backup compatibility

**Status:** `NOT_STARTED` — canonical `NEXT_ACTION`.

Authorized scope:

- Dexie V5 `categories` table;
- optional `Item.categoryId` and optional order `categoryId`/`categoryName` fields required for legacy compatibility;
- lossless V4 -> V5 migration with empty categories and no fabricated historical classification;
- `easy-backup` v2/schema5 categories/references/snapshots;
- preserve supported v1 and existing v2/schema4 preflight/import through normalization;
- extend D-018 checkpoint/verified atomic restore/read-back comparison to categories;
- targeted migration/backup/restore tests and full D-019.

Explicitly excluded from I1:

- category management UI;
- item classification UI;
- new-order category enforcement or snapshot creation;
- category reporting UI/domain aggregation;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live sync or D-016 reopening without new evidence.

#### Later P9-S3 implementation slices

**Status:** `NOT_STARTED`.

After I1 is accepted, advance canonically in bounded slices for category lifecycle/assignment/order snapshot behavior and then category reporting. Do not pre-authorize their exact implementation beyond D-025.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.