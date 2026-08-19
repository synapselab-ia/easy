# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S3-I2 category lifecycle/classification/order snapshots implemented

P9-S3-I2 operationalized the D-025 lifecycle/classification/history contract without implementing category reporting.

Implemented:

- category create, rename, archive/reactivate and guarded permanent deletion;
- stable category identity across rename and case-insensitive name uniqueness across active/archived categories;
- archive blocked while an active item references the category;
- hard deletion blocked by any item reference or historical order category snapshot;
- bounded operator category-management route at `/categories`;
- active-category-only item assignment/reassignment;
- active category required for new active items and reactivation;
- migrated active legacy unclassified items remain readable/editable without backfill but are blocked from new orders until classified;
- new orders resolve the active item's active category and persist immutable transaction-time `categoryId + categoryName` snapshots;
- later category rename or item reassignment does not rewrite old snapshots;
- guided replacement correction preserves the original category snapshot, including absence for a legacy no-category order;
- payments/signals remain category-free;
- D-024 freshness guard remains authoritative for the new category/item/transaction writes.

The first functional D-019 run `32202062045`, job `95917767742`, correctly blocked integration: 199/205 Vitest passed, with failures limited to stale pre-I2 unclassified success fixtures, ItemForm fixture/setup mismatches and a Dexie transaction-zone issue in the active-category lookup. The category requirement was not relaxed; fixtures were classified and the lookup was kept inside the Dexie transaction zone.

Functional accepted D-019 **`32202440100`**, job **`95918871077`**, passed on PR #46 merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`, combining head `554e68d64ff9c67c455ff97116736472c5807ec1` with base `d55b13bf5efedb12da937e70afe1e9501d83446b`: **0 lint errors / 81 warnings, 49 Vitest files / 205 tests PASS, 17/17 Playwright PASS and production build PASS**.

No category reporting, historical recategorization/backfill, category debt/payment allocation, P9-S4/P9-S5/P10, backend/auth/cloud/live synchronization or D-016 reopen was introduced.

P9-S3 remains `IN_PROGRESS`. After the documentation-complete head passes D-019 and I2 integrates, `NEXT_ACTION` advances only to **P9-S3-I3 — category order-performance reporting** under D-025.

---

## 2026-08-18 — P9-S3-I1 category persistence/migration/backup compatibility implemented

P9-S3-I1 implemented only the persistence/recovery substrate authorized by D-025.

Implemented:

- migrated browser-local persistence from Dexie V4 to **V5**;
- added `categories` table with stable category persistence fields;
- added optional `Item.categoryId` and optional transaction `categoryId`/`categoryName` fields for legacy compatibility and future snapshot use;
- V4→V5 migration is additive and creates no categories, item classifications or historical order classifications;
- logical backup remains `easy-backup` **version 2**, now using `source.schemaVersion = 5` and `data.categories[]`;
- supported v1 and existing v2/schema4 backups continue through in-memory normalization with no fabricated categories;
- schema5 preflight validates category IDs/names/references/lifecycle and paired order snapshots; payment/signal category fields are invalid;
- D-018 checkpoint/atomic restore/read-back verification now covers `categories + items + resellers + transactions`;
- backup preview surfaces categories, unclassified items and legacy orders without category snapshot;
- guided order correction preserves any historical category snapshot already present, while normal new-order creation remained category-neutral until I2.

Targeted tests prove real Dexie V4→V5 migration, schema4 compatibility, schema5 category graph validation, four-table round-trip/checkpoint and full rollback including categories on simulated restore failure.

D-019 correctly blocked two intermediate heads before final success. Final documentation-complete Critical QA `32191707306`, job `95887236403`, passed; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`, sharing validated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

---

## 2026-08-18 — P9-S3 category data/reporting contract accepted; D-025 established

P9-S3 contract work established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling, order-only category analytics, lossless Dexie V5 direction and additive D-017/D-018 compatibility. No runtime/schema/UI/reporting implementation occurred in the contract gate.

Authoritative final contract validation: Critical QA `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`, validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

---

## 2026-08-18 — P9-S2-I1 recovery freshness guard implemented; P9-S2 closed

The D-024 runtime slice implemented namespaced local recovery health, fail-safe 24-hour write blocking, synchronized-folder setup verification and persistent Backup/Restore escape access without Drive API/OAuth, backend/cloud/live sync or provider-side sync attestation.

Accepted Critical QA `32180250834`, job `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9` with validated tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

---

## 2026-08-18 — P9-S2 recovery mechanism decision accepted; D-024 keeps local-first architecture

D-024 selected synchronized recovery-copy folder + exact 24-hour freshness guard and kept D-016. Critical QA `32177687434`, job `95843265579`; PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`.

---

## 2026-08-18 — P9-S2 direct recovery-target evidence accepted and integrated

Direct evidence established newest usable off-device recovery copy <=24 hours, manual restoration on any computer, Google Drive as acceptable durable destination and no provider-operated remote recovery requirement. Critical QA `32175718073`, job `95837062983`; PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`.

---

## 2026-08-18 — P9-S2 recovery decision gate blocked on missing measurable store target

The first P9-S2 attempt proved severe PC-loss/manual-backup exposure but lacked measurable copy-age/recovery/interruption constraints. Missing evidence was treated as blocker, not permission to invent SLA/RPO/RTO or cloud requirements. Blocked-state Critical QA `32168368086`, job `95813314347` passed on PR #33.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 accepted ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100 and occurrence-date usability 69/100. Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

Direct stakeholder evidence established current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON backup/portability, no mandatory trusted server integration and modest scale. It also confirmed severe device-loss/manual-backup exposure, item categories/category reporting needs and edit/correction friction. D-022 keeps D-016. Critical QA `32158395391`, job `95781056589`.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was treated as a blocker, not negative proof. `P8_EVIDENCE_REQUEST.md` was added; Critical QA `32152466007` passed.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

Repository evidence did not prove a D-016 reopen trigger. D-021 was accepted. Critical QA `32149199373` and canonical closure `32150004427` passed.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 functional validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before publication from `main`. D-019 accepted; functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user until direct requirements later prove a reopen trigger.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated `occurredAt` from registration/audit time and migrated Dexie to V4 (`32052076684`). P3-S2 formalized statements, total debt and FIFO outstanding-debt aging (`32053837309`). D-014/D-015 accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 accepted; validations `32041280504` and `32042373332` passed.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references for new activity and guarded destructive deletion while preserving history. Validations `32037965651`, `32038951903` and `32039763539` passed.

---

## 2026-08-17 — P0 canonical V2 governance established

The V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline were established. `main` is stable reference; `develop` is the V2 integration branch.