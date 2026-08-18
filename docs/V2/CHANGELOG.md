# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S2 direct recovery-target evidence supplied; evidence intake in review

The store/operator supplied the missing direct recovery-target answers required by the blocked P9-S2 evidence gate.

Accepted direct evidence for this intake:

- loss of up to **24 hours** of work is considered a solvable/acceptable recovery case;
- manual restoration on **any computer** is acceptable;
- Easy has **daily demand** and a multi-day recovery procedure is incompatible with current operation, but no numeric hour-based RTO was supplied and none is invented;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is also acceptable for day-to-day speed/convenience;
- because operator-run manual recovery on another computer is acceptable, provider-operated remote recovery is not mandatory.

The Google account connected to ChatGPT is not treated as an Easy credential. The evidence authorizes Drive to be considered as an acceptable destination during the later mechanism comparison; it does not authorize or imply direct Google API/OAuth integration.

`docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` now preserves the direct answers and their bounded interpretation. The evidence-availability blocker is therefore resolved sufficiently for P9-S2 to resume after this evidence-only slice passes D-019 and integrates.

This slice intentionally does **not** compare, rank, select or implement a recovery mechanism. D-016 remains authoritative, D-017/D-018 remain unchanged, no runtime/schema/backup-contract/backend/auth/cloud/live-sync work is performed, and later P9 slices remain unstarted.

The next action remains validation/integration of this evidence-only record. Only after accepted integration may `NEXT_ACTION` advance to comparison of the smallest D-016-compatible mechanisms against the <=24-hour recovery-copy boundary, manual-any-computer restoration procedure, daily-use continuity constraint and acceptable Drive/local destinations.

---

## 2026-08-18 — P9-S2 recovery decision gate blocked on missing measurable store target

P9-S2 executed evidence intake only. Existing direct store evidence proved severe operating-PC-loss/manual-backup exposure, but did not yet define the required acceptable maximum recoverable-copy age, recovery procedure, interruption window, provider-operated recovery requirement, or destination/process constraints. Repository-accessible searches found no newer direct evidence supplying those answers.

`docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` recorded the minimum direct answers required to resume. Missing evidence was treated as a blocker, not permission to invent SLA/RPO/RTO values or infer a cloud/server requirement. P9-S2 remained `BLOCKED`; D-016 remained authoritative. No recovery mechanism comparison/selection, runtime/schema/backup-contract/backend/auth/cloud/live-sync or later P9 work was performed.

Blocked-state Critical QA **`32168368086`**, job **`95813314347`** — PASS on PR #33: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests, 15/15 Playwright and production build PASS. PR #33 was squash-merged into `develop` as `0017538b93c438f4374b1b2427222f27b9ef357d`; validated merge ref `cbc96eefb315c29c266b1df978bda605c2907352` and integrated commit share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

The validated integration records the historical evidence blocker only.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

P9-S1 executed only the canonical prioritization requested after P8. No runtime, schema, backup-contract, backend/auth/cloud/live-sync or business-module implementation was performed.

### Evidence and source classification

P9-S1 retained the direct P8 facts: catastrophic device-loss exposure when a fresh JSON has not been copied off-device; confirmed item category/classification/category-reporting needs; confirmed edit/correction friction whose exact store cases were not enumerated; and common delayed transaction entry already supported by `occurredAt`.

A bounded source inspection established that:

- backup export remains an explicit operator action;
- `Item` has no category dimension in Dexie V4;
- items and resellers already have explicit edit flows;
- transaction reversal and linked replacement already exist;
- guided transaction correction can change reseller and financial value/quantity, but cannot change `occurredAt`, order item, transaction type or observation;
- an order whose original item is inactive cannot use guided replacement, though it can still be reversed;
- transaction creation already exposes `Data da ocorrência` with explanatory copy and persists it as `occurredAt`.

Source-proven unsupported actions are recorded as technical gaps, not falsely attributed to Duda as individually reported cases.

### D-023 prioritization

Weighted scoring uses operational consequence 35%, evidence confidence 30%, exposure/frequency 20% and delivery confidence under accepted contracts 15%.

Accepted order:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category-level reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Detailed evidence, scoring and boundaries are recorded in `docs/V2/P9_PRIORITIZATION.md`. The accepted subsequent sequence is P9-S2 recovery durability decision gate, P9-S3 category contract, P9-S4 directly confirmed correction microflows and P9-S5 occurrence-date usability verification. Accounts/permissions, live synchronization, inventory/orders/store-management and external integrations remain later candidates unless new direct evidence makes them mandatory.

### Validation and integration

Persistent Critical QA **`32166330198`**, job **`95806665221`** — PASS on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests, 15/15 Playwright and production build PASS.

PR #31 was squash-merged into `develop` as `3d99814c0f97dce640a91721fc68d33e79575cc3`. The validated merge ref and integrated commit share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`, proving content equivalence.

P9-S1 is `DONE`. `NEXT_ACTION` advanced to P9-S2 as a decision/evidence gate only.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

Direct stakeholder evidence established current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON backup/portability, no mandatory trusted server integration and modest scale. It also confirmed severe device-loss/manual-backup exposure, item categories/category reporting needs and edit/correction friction. Delayed financial entry is already supported by `occurredAt`.

D-022 keeps D-016 because no current reopen trigger was proven; security-policy incompatibility remains unresolved/not proven.

Persistent Critical QA `32158395391`, job `95781056589` — PASS on PR #27. PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; validated merge ref and integration share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`. Canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was treated as a blocker, not negative proof. `P8_EVIDENCE_REQUEST.md` was added; Critical QA `32152466007` passed; blocked-state closure integrated before direct stakeholder evidence later resumed the slice.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

P8-S1 inspected canonical documents, original prompts, historical PRDs, README and repository issues. Repository evidence confirmed administrator workflows, mobile/desktop intent, PDF sharing, JSON portability and existing analytics, but did not prove a D-016 reopen trigger. D-021 was accepted. Critical QA `32149199373` and canonical closure `32150004427` passed.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved QG-011 through QG-015 under D-020: reliable transaction Cancel/error/type intent, explicit invalid statement ranges, Backup recovery copy alignment, operator-visible item/reseller save failures and reseller-context transaction launch. Final P7-S6 functional validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 reconciled stale global QA expectations, fixed command-center double filtering, established `npm run qa:critical`, added persistent CI and required `quality -> build -> deploy` before GitHub Pages publication from `main`. D-019 accepted; functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore with rollback and migration/financial round-trip proof (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user on Dexie V4 unless direct requirements later prove concurrency, automatic live multi-device sharing, person-level access/authorship, remote recovery SLA, trusted server integration or incompatible security policy. No backend/auth/cloud/synchronization implementation was introduced.

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