# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization prepared for integration

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

Accepted order under review:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category-level reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Detailed evidence, scoring and boundaries are recorded in `docs/V2/P9_PRIORITIZATION.md`.

Proposed sequence after integration is P9-S2 recovery durability decision gate, P9-S3 category contract, P9-S4 directly confirmed correction microflows and P9-S5 occurrence-date usability verification. Accounts/permissions, live synchronization, inventory/orders/store-management and external integrations remain later candidates unless new direct evidence makes them mandatory.

### Integration state

P9-S1 is `IN_REVIEW`. Full D-019 `npm run qa:critical` is mandatory on the complete documentation head before integration. `NEXT_ACTION` remains only validation/integration and canonical closure of P9-S1; P9-S2 must not start yet.

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