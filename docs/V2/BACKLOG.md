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

D-025 is accepted. `docs/V2/P9_CATEGORY_CONTRACT.md` is authoritative.

Accepted contract includes stable category identity/lifecycle, future-order category snapshots, non-inventive legacy handling, order-only category analytics, lossless Dexie V5 migration and additive D-017/D-018 compatibility.

Final contract closure Critical QA **`32185226251`**, job **`95867186002`** passed on PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312`: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and build PASS. PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`; validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

#### P9-S3-I1 — Category persistence + migration + backup compatibility

**Status:** `DONE` — 2026-08-18.

Implemented scope:

- Dexie V5 `categories` table;
- optional `Item.categoryId` and optional transaction `categoryId`/`categoryName` fields;
- additive V4→V5 migration with empty categories and no fabricated historical classification;
- logical `easy-backup` remains v2, now `source.schemaVersion = 5` with category data;
- supported v1 and v2/schema4 imports normalize in memory without invented categories;
- schema5 validation covers category identity/name uniqueness/references/lifecycle and order snapshot pairing;
- payment/signal category fields are rejected;
- D-018 checkpoint/atomic restore/read-back comparison covers categories/items/resellers/transactions;
- backup preview exposes category/unclassified/legacy-order counts;
- guided corrections preserve existing category snapshots, while normal new orders still do not create them in I1;
- targeted real V4→V5 migration, backup compatibility, round-trip and four-table rollback tests.

D-019 history:

- `32190349921` / `95883095871` — failed only an obsolete historical assertion that expected final Dexie V4 after V5 was added;
- `32190552190` / `95883712396` — tests and E2E passed, build exposed TypeScript narrowing only;
- functional accepted **`32191018791` / `95885134808`** — PASS on PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d`: 0 errors / 81 warnings, 47/195 Vitest, 17/17 Playwright, build PASS.

Final canonical-documents head requires its own full D-019 before integration.

#### P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement

**Status:** `NOT_STARTED` — canonical next slice.

Authorized scope:

- create/rename/archive/reactivate and guarded hard-delete category lifecycle under D-025;
- bounded operator category management flow;
- item assignment/reassignment to active categories;
- require an active category for new active items and reactivation for business use;
- preserve migrated legacy active items without invented category, but require classification before a new order;
- new orders resolve the active item's active category and persist `categoryId + categoryName` transaction-time snapshot;
- correction continues preserving the original snapshot;
- targeted lifecycle/assignment/order-write tests + full D-019.

Explicitly excluded from I2:

- category reporting/domain aggregation;
- historical category backfill/recategorization;
- category payment/debt allocation;
- P9-S4/P9-S5/P10;
- backend/auth/cloud/live sync or D-016 reopening without new evidence.

#### Later P9-S3 reporting slice

**Status:** `NOT_STARTED`.

After I2 is accepted, advance canonically to category reporting according to D-025. Do not pre-authorize unrelated financial/category allocation semantics.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.