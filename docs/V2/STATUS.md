# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE` pending canonical QA/integration closure.**  
**P9 — Prioritized evidence-backed improvements: `NOT_STARTED`.**

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Incomplete UX flows / operational refinement: `DONE`.
- P8-S1 — Repository-evidence discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and D-016 keep/reopen decision: `DONE` as evidence/decision work; D-019 integration evidence must be recorded before final closure.
- P9: `NOT_STARTED`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source/evidence needed for `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve the completed P8 evidence boundary and direct-validation packet.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. Dexie remains **V4**. P1–P7 contracts, D-017/D-018 recovery invariants and D-019 Critical QA remain authoritative.

P8-S1 established D-021: repository evidence alone cannot reopen D-016. P8-S2 subsequently received direct store evidence in the project conversation on 2026-08-18 and classified it without converting future preferences into present mandatory requirements.

`develop` at the start of resumed P8-S2 was `5e1b45bef63b8e91c692d35cae9da5c66a905740`. `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

## P8-S2 direct real-store evidence

Source: direct stakeholder answers supplied in the project conversation on 2026-08-18. Each fact is classified as current reality, mandatory operational concern, future preference or unresolved knowledge.

### Current reality

- Easy is operated by Duda and store owners; concurrent use of the same dataset is not currently required.
- Current use is on a PC; the same live dataset is not currently required on multiple devices at the same time.
- Resellers do not need interactive Easy access; PDF/extract sharing is sufficient for the current operation.
- Data portability/backup currently depends on JSON and manual off-device handling.
- No payment/accounting/messaging/server integration is currently required.
- Production scale is modest: approximately 100 resellers maximum, around 50 active, with only some producing regular monthly activity and a small number of daily entries.

### Confirmed operational risk

Loss of the operating computer before the current JSON has been copied to Drive can cause catastrophic data loss, potentially forcing reconstruction of tens of thousands of reais in sales. This confirms that human-memory-dependent manual off-device backup is a material business-continuity risk.

This evidence does **not** define a numeric RPO/RTO, provider-operated remote recovery requirement or remote-recovery SLA. Therefore it is a high-priority recovery requirement/input, but it does not by itself prove the D-016 `remote recovery SLA` reopen trigger.

### Confirmed unmet product needs

- item categories are required so items can be classified into business groups such as bronze or porcelain;
- reporting/analysis should be filterable or aggregatable by category;
- there are multiple small edit/correction workflow gaps in real operation, but the exact record types/actions were not enumerated and must be identified before implementation prioritization.

The stakeholder also reported a need to register sales with dates different from the registration day. Repository inspection confirms that current V2 already supports an editable `Data da ocorrência` and persists `occurredAt`, so this is classified as an operator-discoverability/usability verification item rather than a missing data-model capability.

### Future preferences, not present implementation permission

- reduce or eventually eliminate dependence on manual JSON transfer/backup;
- consider accounts/permissions later for security if Easy becomes a broader networked system;
- potentially evolve Easy into a more complete store system covering orders, inventory and store organization.

These are roadmap directions. They are not treated as current mandatory backend/auth/cloud/synchronization requirements.

### Unresolved knowledge

- no formal security/privacy/storage policy was supplied;
- numeric RPO/RTO and any provider-operated remote recovery obligation remain unspecified;
- exact unsupported edit/correction microflows remain to be inventoried.

## D-016 trigger disposition after direct validation

| D-016 reopen trigger | P8-S2 direct-evidence result | Effect |
| --- | --- | --- |
| Concurrent operators | **NOT PROVEN** | Current operation does not require concurrent use. |
| Automatic live multi-device sharing | **NOT PROVEN** | Current operation is PC-based and does not require the same live dataset on multiple devices simultaneously. |
| Person-level authorship/access control | **NOT PROVEN** | Accounts/permissions are a conditional future preference, not a current mandatory requirement. |
| Remote recovery SLA | **NOT PROVEN** | Severe recovery risk is confirmed, but RPO/RTO/provider-operated remote recovery is not specified. |
| Trusted server integrations | **NOT PROVEN** | No integration is currently required. |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** | No competent policy evidence was supplied; ignorance is not negative evidence. |

## Architecture outcome

**KEEP D-016.** Direct P8 evidence does not prove any accepted reopen trigger for the current operating mode. No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by P8-S2.

D-022 records this direct-validation decision and preserves the reopen rule if later requirements make concurrency, live sharing, person-level access control, remote recovery SLA, trusted integrations or incompatible security policy mandatory.

## P8 closure outcome

P8 has enough direct evidence to close the current architecture/requirements gate:

- current operator/device/sharing/access model is sufficiently defined for D-016;
- severe backup/recovery exposure is confirmed and must be prioritized, without mislabeling it as an already specified remote SLA;
- categories/category reporting are confirmed business requirements;
- exact edit/correction gaps require bounded inventory before implementation;
- delayed occurrence-date entry already exists in V2 and must not be rebuilt as a speculative module;
- broad systemization/accounts/inventory remain future directions rather than current requirements.

No runtime, schema, persistence, backend/auth/cloud/synchronization or P9 implementation is part of P8-S2.

## Active constraints entering P9

- do not work directly on `main`;
- preserve P1–P7 contracts and D-017/D-018/D-019;
- keep D-016 authoritative unless later direct evidence proves a reopen trigger;
- prioritize confirmed store pain by operational consequence, not by feature novelty;
- do not treat future preferences as mandatory requirements;
- do not rebuild occurrence-date support that already exists;
- run the complete `npm run qa:critical` gate before integrating any P9 slice.

## NEXT_ACTION

**P9-S1 — Prioritize the P8-confirmed operational gaps without implementing them. Score and order at least: (1) recovery durability beyond human-dependent manual JSON/Drive copying; (2) item categories, item classification and category-level reporting; and (3) the exact unsupported edit/correction microflows, after identifying which records/actions Duda cannot currently correct. Treat delayed transaction entry as an already implemented `occurredAt` capability and verify only discoverability/usability rather than rebuilding it. Keep accounts/permissions, live synchronization, inventory/orders/store-management and other broad systemization as later candidates unless new direct evidence makes them mandatory. P9-S1 is prioritization only: do not implement runtime/schema/backend/cloud features in that slice. Run full `npm run qa:critical` before integration.**