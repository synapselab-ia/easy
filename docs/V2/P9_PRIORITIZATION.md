# Easy V2 — P9 Evidence-backed Prioritization

**Status:** P9-S1 complete pending D-019 validation/integration  
**Date:** 2026-08-18  
**Scope:** prioritization and bounded source inventory only; no runtime/schema/backend/cloud implementation

## 1. Evidence boundary

P9-S1 starts from the completed P8 direct-store record and inspects only current source needed to distinguish missing behavior from already implemented behavior.

Authoritative evidence entering this slice:

- device-loss before a current JSON copy reaches Drive can destroy the working dataset and force reconstruction of tens of thousands of reais in sales;
- item categories, item classification and category-level financial reporting are confirmed store needs;
- several edit/correction friction points exist in real operation, but P8 did not enumerate exact record/action pairs;
- Duda commonly enters sales after their true financial date;
- current architecture remains D-016 local-first/single-user Dexie V4;
- P9-S1 must not implement a feature.

Source inspected for bounded current-capability classification:

- `src/components/backup/ImportExport.tsx`;
- `src/db/database.ts`;
- `src/pages/ItemsPage.tsx`;
- `src/pages/ResellersPage.tsx`;
- `src/components/transactions/TransactionForm.tsx`;
- `src/components/transactions/TransactionTable.tsx`;
- `src/components/transactions/TransactionCorrectionDialog.tsx`;
- `src/hooks/useTransactions.ts`.

## 2. Scoring method

Each candidate receives 1–5 on four dimensions. The weighted score is converted to 0–100.

| Dimension | Weight | Meaning |
| --- | ---: | --- |
| Operational consequence | 35% | Financial/continuity/error impact if the gap remains. |
| Evidence confidence | 30% | Strength and specificity of direct-store plus source evidence. |
| Exposure/frequency | 20% | How often the workflow or risk can affect routine operation. |
| Delivery confidence under accepted contracts | 15% | Likelihood of a bounded improvement without violating P1–P8 or reopening D-016 implicitly. |

Score formula: `20 × (0.35C + 0.30E + 0.20F + 0.15D)`.

The score is a prioritization aid, not permission to implement beyond the active slice.

## 3. Ranked P9 inputs

| Rank | Candidate | C | E | F | D | Score | Disposition |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Recovery durability beyond human-dependent JSON/Drive copying | 5 | 5 | 5 | 3 | **94** | First P9 problem. Quantify the acceptable backup-age/recovery boundary and choose the smallest D-016-compatible durability improvement before implementation. |
| 2 | Item categories + item classification + category-level reporting | 4 | 5 | 4 | 3 | **83** | Confirmed product need. Requires an explicit data/reporting contract before schema/backup/report changes. |
| 3 | Exact transaction edit/correction microflows | 4 | 3 | 3 | 4 | **70** | Friction is direct evidence; exact store cases were not enumerated. Use the source-proven unsupported matrix below to obtain bounded direct confirmation before implementation. |
| 4 | Occurrence-date discoverability/usability | 2 | 4 | 4 | 5 | **69** | Creation capability already exists and is explicit in source. Verify real usability only; do not rebuild P3 date semantics. |

Broader accounts/permissions, automatic live synchronization, inventory/orders/store-management and external integrations remain later candidates because P8 did not establish them as present mandatory requirements. They receive no implementation priority from P9-S1.

## 4. Recovery durability finding

Current Backup UI exports a validated logical backup only when the operator explicitly presses **Exportar Backup v2**. Restore safety is strong under D-017/D-018, but source contains no automatic off-device replication or independently durable copy mechanism.

This matches the direct-store failure mode: correctness of the backup file is not the current weakest link; remembering to create and move a fresh copy off the operating PC is.

P9-S1 does **not** infer a remote SLA, cloud requirement or acceptable RPO/RTO. The next recovery slice must first establish a measurable operating target (at minimum acceptable maximum backup age and acceptable recovery procedure) and compare bounded local-first options. Any option that proves a D-016 trigger must explicitly reopen D-016 before implementation.

## 5. Category finding

The live `Item` model contains `id`, `name`, `basePrice`, lifecycle and audit timestamps only. There is no category entity/reference in Dexie V4 and therefore no canonical category field in the current backup contract or category dimension in financial reporting.

The requirement is nevertheless direct and specific: operators need categories such as bronze/porcelain, items must be assignable to them, and reporting/analysis must support category-level views.

Because this crosses model, migration, backup/restore and reporting semantics, it is ranked second but should begin with a bounded contract/design slice rather than an opportunistic UI-only field.

## 6. Edit/correction capability inventory

P8 confirmed edit/correction friction but did not say which exact actions Duda fails to complete. P9-S1 therefore separates **source-proven support/absence** from **directly confirmed store pain**.

### Already supported

- item records have an explicit edit flow;
- reseller records have an explicit edit flow;
- effective transactions can be auditedly reversed with a mandatory reason;
- effective transactions can be corrected by linked replacement without overwriting history;
- guided transaction correction can change reseller;
- for orders, guided correction can change quantity and unit price/total;
- for payments/signals, guided correction can change movement value.

### Source-proven unsupported or constrained transaction corrections

| Record/action | Current state | Evidence classification |
| --- | --- | --- |
| Change transaction `occurredAt` after save | **Unsupported by guided correction**; replacement forcibly preserves the original occurrence date. | Source-proven gap. Operationally relevant because delayed entry is directly confirmed, but P8 did not explicitly say Duda needs post-save date correction. |
| Change order item after save | **Unsupported**; correction must preserve the original `itemId`. | Source-proven gap; exact store frequency not directly confirmed. |
| Change transaction type (`order` / `payment` / `signal`) after save | **Unsupported**; replacement forcibly preserves original type. | Source-proven gap; exact store frequency not directly confirmed. |
| Change/add transaction observation after save | **Unsupported**; replacement preserves original observation. | Source-proven gap; exact store frequency not directly confirmed. |
| Guided-correct an order whose original item is now inactive | **Blocked**; it may be reversed, but the guided replacement cannot recreate it while inactive. | Source-proven constraint; exact store frequency not directly confirmed. |

These source findings must not be rewritten as claims that Duda specifically reported every row. The next correction slice must directly confirm which of these actions actually causes work/error risk before implementation and then preserve D-012/D-013 audit semantics.

## 7. Occurrence-date finding

The creation form already exposes **Data da ocorrência** as an editable date field next to reseller and movement type, with helper text explaining that it is the financial date while registration time is saved automatically. `useTransactions` persists that value as `occurredAt`.

Therefore the reported delayed-entry need is **not a missing data-model capability**. P9-S1 finds no evidence supporting a second date model or schema redesign.

There is, however, a bounded usability risk worth direct verification: the field defaults to today, and guided correction cannot change `occurredAt` after save. If an operator overlooks the field during delayed entry, recovery is more cumbersome than correcting value/reseller. This belongs to correction/discoverability validation, not to rebuilding P3.

## 8. Accepted P9 order

P9-S1 recommends and records this sequence:

1. **P9-S2 — Recovery durability decision gate.** Establish acceptable maximum backup age/recovery procedure and compare the smallest D-016-compatible mechanisms that reduce dependence on human memory. No implicit cloud/auth/live-sync decision.
2. **P9-S3 — Category data/reporting contract.** Define category lifecycle, item assignment, historical transaction/report semantics, migration and backup compatibility before implementation.
3. **P9-S4 — Confirmed correction microflows.** Directly map the source-proven unsupported actions to real operator cases, then implement only confirmed high-value corrections while preserving audited replacement/reversal history.
4. **P9-S5 — Occurrence-date usability verification.** Verify whether the existing field/default/helper text is sufficient in the real delayed-entry workflow; change UX only if evidence shows a discoverability problem.

The ordering may be revisited only with new direct evidence or a newly proven architecture trigger.

## 9. P9-S1 closure boundary

P9-S1 changes documentation only. It does not:

- modify runtime behavior;
- add a Dexie version or category field;
- change the backup contract;
- add background/cloud/off-device persistence;
- add backend/authentication/live synchronization;
- change financial, reversal, correction, statement or aging semantics;
- implement any category, recovery or correction feature.

Full D-019 `npm run qa:critical` is required before integration.