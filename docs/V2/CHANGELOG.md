# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

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
- guided order correction preserves any historical category snapshot already present, while normal new-order creation remains category-neutral until I2.

Targeted tests prove real Dexie V4→V5 migration, schema4 compatibility, schema5 category graph validation, four-table round-trip/checkpoint and full rollback including categories on simulated restore failure.

D-019 correctly blocked two intermediate heads:

- run `32190349921`, job `95883095871`: one obsolete historical test expected final Dexie V4; only that expectation was updated to V5;
- run `32190552190`, job `95883712396`: all 195 Vitest and 17/17 Playwright passed, but TypeScript build exposed insufficient static narrowing of validated `rawCategories`; only explicit typing was changed.

Functional accepted Critical QA **`32191018791`**, job **`95885134808`**, passed on PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d`: **0 lint errors / 81 warnings, 47 Vitest files / 195 tests, 17/17 Playwright and production build PASS**.

No category management/classification UI, new-order category enforcement/snapshot generation, category reporting, category debt allocation, backend/auth/cloud/live sync or D-016 reopen was introduced.

P9-S3 remains `IN_PROGRESS`. `NEXT_ACTION` advances only to **P9-S3-I2 — category lifecycle + item assignment + new-order snapshot enforcement**. Category reporting remains a later P9-S3 slice.

---

## 2026-08-18 — P9-S3 category data/reporting contract accepted; D-025 established

P9-S3 contract work established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling, order-only category analytics, lossless Dexie V5 direction and additive D-017/D-018 compatibility. No runtime/schema/UI/reporting implementation occurred in the contract gate.

The authoritative final contract validation is Critical QA **`32185226251`**, job **`95867186002`**, on PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312`: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and build PASS.

PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`; validated merge ref and integrated squash share exact tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

---

## 2026-08-18 — P9-S2-I1 recovery freshness guard implemented; P9-S2 closed

The D-024 runtime slice is implemented and P9-S2 is complete.

Implemented behavior:

- namespaced local recovery-health metadata (`easy.recoveryHealth.v1`), outside business Dexie/backup data;
- fail-safe `unknown/due` handling for missing, corrupt or unverified state;
- global health states `unknown`, `due`, `current`, `warning` and `overdue`;
- non-contractual 20-hour warning with exact hard **24-hour** boundary;
- centralized recovery write guard across normal item, reseller and transaction mutations;
- read-only operation and Backup/Restore remain available while normal writes are blocked;
- validated `easy-backup` export returns exact filename/export timestamp for local freshness tracking;
- one-time synchronized-folder setup guidance and explicit operator confirmation after observing the exported copy off the local-PC-only context;
- Easy reports generation/download initiation, not provider synchronization acknowledgment.

No Google Drive API/OAuth, backend/auth/cloud database/live synchronization, required File System Access API or provider-side sync verification was introduced.

Accepted Critical QA `32180250834`, job `95851336506` passed on PR #39 merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a`: 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and build PASS. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9` with exact validated tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

---

## 2026-08-18 — P9-S2 recovery mechanism decision accepted; D-024 keeps local-first architecture

D-024 selected **Synchronized recovery-copy folder + 24-hour freshness guard** and kept D-016. No Google OAuth/Drive API, backend/auth/cloud DB/live sync, File System Access baseline, Dexie migration or backup-format version change was authorized by the recovery decision.

Critical QA `32177687434`, job `95843265579` passed on PR #37. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4` with validated tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

---

## 2026-08-18 — P9-S2 direct recovery-target evidence accepted and integrated

Direct evidence established newest usable off-device recovery copy **<=24 hours**, manual restoration on any computer, daily demand without invented numeric RTO, Google Drive as acceptable durable destination, local PC copy for convenience and no provider-operated remote recovery requirement.

Critical QA `32175718073`, job `95837062983` passed on PR #35. PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`.

---

## 2026-08-18 — P9-S2 recovery decision gate blocked on missing measurable store target

The first P9-S2 attempt proved severe PC-loss/manual-backup exposure but lacked measurable copy-age/recovery/interruption constraints. Missing evidence was treated as a blocker rather than permission to invent SLA/RPO/RTO or cloud requirements. Blocked-state Critical QA `32168368086`, job `95813314347` passed on PR #33.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 accepted ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100 and occurrence-date usability 69/100.

Critical QA `32166330198`, job `95806665221` passed on PR #31. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

Direct stakeholder evidence established current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON backup/portability, no mandatory trusted server integration and modest scale. It also confirmed severe device-loss/manual-backup exposure, item categories/category reporting needs and edit/correction friction. Delayed financial entry is already supported by `occurredAt`.

D-022 keeps D-016. Critical QA `32158395391`, job `95781056589` passed on PR #27.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was treated as a blocker, not negative proof. `P8_EVIDENCE_REQUEST.md` was added; Critical QA `32152466007` passed.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

P8-S1 inspected canonical documents, original prompts, historical PRDs, README and repository issues. Repository evidence did not prove a D-016 reopen trigger. D-021 was accepted. Critical QA `32149199373` and canonical closure `32150004427` passed.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 functional validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before GitHub Pages publication from `main`. D-019 accepted; functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore with rollback and migration/financial round-trip proof (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user until direct requirements later prove a reopen trigger.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated financial occurrence (`occurredAt`) from registration/audit time (`createdAt`) and migrated Dexie to V4 (`32052076684`). P3-S2 formalized opening → movements → closing statements, positive-reseller total debt and FIFO outstanding-debt aging (`32053837309`). D-014/D-015 accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 accepted; validations `32041280504` and `32042373332` passed.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references for new activity and guarded destructive deletion while preserving historical rows. Validations `32037965651`, `32038951903` and `32039763539` passed.

---

## 2026-08-17 — P0 canonical V2 governance established

The V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline were established. `main` is the stable reference; `develop` is the V2 integration branch.