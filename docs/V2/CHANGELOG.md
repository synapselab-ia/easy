# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S3-I2 category lifecycle/classification/order snapshots completed and integrated

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

The first functional D-019 run `32202062045`, job `95917767742`, correctly blocked integration with 199/205 Vitest passing. Failures were stale pre-I2 success fixtures, ItemForm fixture/setup mismatches and a Dexie transaction-zone issue in the active-category lookup. The category requirement was not relaxed; fixtures were classified and the lookup stayed inside the Dexie transaction zone.

Functional D-019 `32202440100`, job `95918871077`, passed on merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`: 0 lint errors / 81 warnings, 49/205 Vitest, 17/17 Playwright and build PASS.

The final documentation-complete D-019 **`32202876262`**, job **`95920142630`**, passed on merge ref `7a8115489aafccf86408a50591fe474dbfb97f5f`, combining head `4591e103fb713f70ba34467a0beae1cb349deb5f` with base `d55b13bf5efedb12da937e70afe1e9501d83446b`: **0 lint errors / 81 warnings, 49/205 Vitest PASS, 17/17 Playwright PASS and production build PASS**.

PR #46 was squash-integrated into `develop` as **`aafb3e4821e345d320cf3b8f5cc10028e82ad66b`**. The validated merge ref and integrated squash share exact tree **`ddbb14dcc6f66239b5e973f7da8eabb295c2cb49`**.

No category reporting, historical recategorization/backfill, category debt/payment allocation, P9-S4/P9-S5/P10, backend/auth/cloud/live synchronization or D-016 reopen was introduced.

P9-S3 remains `IN_PROGRESS`; `NEXT_ACTION` is only **P9-S3-I3 — category order-performance reporting** under D-025.

---

## 2026-08-18 — P9-S3-I1 category persistence/migration/backup compatibility completed

P9-S3-I1 introduced Dexie V5 category persistence, additive/non-inventive V4→V5 migration, `easy-backup` v2/schema5 with v1/schema4 compatibility, schema5 graph validation, category-aware backup preview and four-table D-018 restore. It did not implement lifecycle UI, assignment enforcement, new-order snapshots or reporting.

Final D-019 `32191707306`, job `95887236403`, passed. PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`; validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

---

## 2026-08-18 — P9-S3 category data/reporting contract accepted; D-025 established

D-025 established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling, order-only category analytics, Dexie V5 direction and additive D-017/D-018 compatibility.

Final contract D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`, validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

---

## 2026-08-18 — P9-S2 recovery durability completed

D-024 selected a synchronized recovery-copy folder plus exact 24-hour freshness guard and kept D-016 local-first. The runtime guard preserves Backup/Restore access, uses namespaced local recovery-health metadata and does not introduce Drive API/OAuth, backend/cloud/live sync or provider-side synchronization attestation.

Accepted P9-S2-I1 D-019 `32180250834`, job `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 accepted ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100 and occurrence-date usability 69/100. Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

---

## 2026-08-18 — P8 real-store requirements discovery completed

Direct store evidence kept D-016 for current non-concurrent PC-based operation and confirmed recovery durability, category/classification/reporting and correction-friction roadmap inputs. Final P8-S2 Critical QA `32158395391`, job `95781056589`.

---

## 2026-08-18 — P7 operational UX refinement completed

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate established

D-019 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before publication from `main`. Functional validation `32064801009` and post-merge `32065713920` passed.

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