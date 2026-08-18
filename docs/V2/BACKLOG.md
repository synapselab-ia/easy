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

- P1-S1 safe reseller lifecycle — `DONE`.
- P1-S2 safe item lifecycle — `DONE`.
- P1-S3 referential validation/migration — `DONE`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`.
- P2-S2 linked/guided replacement — `DONE`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`.

## P4 — Persistence architecture decision: local vs cloud

**Status:** `DONE` — 2026-08-17.

D-016 keeps V2 local-first/single-user on Dexie V4 until a direct requirement proves an explicit reopen trigger.

## P5 — Backup, restore and migration

**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

## P6 — Tests, CI and deployment safety

**Status:** `DONE` — 2026-08-17.

D-019 established `npm run qa:critical` as the persistent integration/publication gate. Functional validation `32064801009`; post-merge validation `32065713920`.

## P7 — Complete incomplete UX flows / operational refinement

**Status:** `DONE` — 2026-08-18.

D-020 prioritized operator-intent/error risk. QG-011 through QG-015 were resolved across P7-S2 through P7-S6. Accepted functional runs include `32069261401`, `32133559376`, `32136964241`, `32141425740` and `32145620210`.

---

## P8 — Real store requirements discovery

**Status:** `DONE` — direct store evidence received and classified on 2026-08-18; final D-019/integration evidence must be reflected in canonical closure.

### P8-S1 — Repository-evidence discovery and D-016 trigger assessment

**Status:** `DONE` — 2026-08-18.

- repository evidence confirmed existing administrator workflows, desktop/mobile intent, PDF sharing, JSON portability and existing analytics;
- reseller direct mobile use in historical material remained ambiguous;
- no repository-only artifact proved a D-016 trigger;
- D-021 accepted: direct store evidence is required before architecture reconsideration;
- persistent validation `32149199373` — PASS; closure `32150004427` — PASS.

### P8-S2 — Direct real-store validation and D-016 keep/reopen decision

**Status:** `DONE` as evidence/decision work — 2026-08-18; integration QA/closure evidence pending.

Direct evidence source: stakeholder answers supplied in the project conversation.

#### Current operation confirmed

- operators: Duda and store owners;
- concurrent operation on one dataset: not currently required;
- primary device: PC;
- automatic same-live-dataset use across multiple devices: not currently required;
- reseller interactive access: not required; PDF/extract is sufficient;
- current portability/recovery mechanism: JSON plus manual off-device handling;
- required server integrations: none;
- approximate scale: up to ~100 resellers, around ~50 active, modest daily transaction volume.

#### Recovery risk confirmed

If the operating PC fails before the current JSON has been copied off-device, the store may lose data requiring reconstruction of tens of thousands of reais in sales. Manual human-memory-dependent off-device backup is therefore a material business-continuity risk.

This confirms recovery durability as a high-priority operational problem, but does **not** establish numeric RPO/RTO, provider-operated recovery or a formal remote-recovery SLA. The D-016 remote-recovery trigger is therefore not proven.

#### Confirmed unmet product needs

- create/manage item categories;
- assign items to categories;
- analyze/filter/report financial activity by category;
- resolve multiple small edit/correction workflow gaps after the exact unsupported record/action combinations are identified.

The reported need to enter sales with a date different from registration day is already supported in current V2 through editable `Data da ocorrência` / `occurredAt`; P9 must not rebuild this as a missing model capability.

#### Future preferences, not current requirements

- eventually reduce/eliminate reliance on manual JSON handling;
- possibly add accounts/permissions for security in a future networked version;
- potentially grow Easy into a broader order/inventory/store-management system.

#### D-016 trigger result

| Trigger | Result |
| --- | --- |
| Concurrent operators | **NOT PROVEN** — current operation does not require concurrency. |
| Automatic live multi-device sharing | **NOT PROVEN** — no current simultaneous shared-live-state requirement. |
| Person-level authorship/access control | **NOT PROVEN** — future conditional preference only. |
| Remote recovery SLA | **NOT PROVEN** — severe recovery consequence confirmed, formal SLA/RPO/RTO unresolved. |
| Trusted server integrations | **NOT PROVEN** — none currently required. |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** — no competent policy evidence supplied. |

D-022 therefore **keeps D-016 accepted for the current operating mode**. No backend/auth/cloud/live-sync/Dexie migration is authorized by P8-S2.

P8 closure result: sufficient direct evidence exists to close the current requirements/architecture gate and enter P9 prioritization without implementing P9 in this slice.

---

## P9 — Prioritized evidence-backed improvements

**Status:** `NOT_STARTED`.

### P9-S1 — Evidence-backed prioritization only

**Status:** `NOT_STARTED`.

Required prioritization inputs from P8, without implementation:

1. **Recovery durability / off-device protection** — highest operational consequence because current manual JSON/Drive handling creates catastrophic-loss exposure. P9-S1 must compare bounded options without silently violating D-016 or assuming cloud is already authorized.
2. **Item categories and category reporting** — confirmed missing capability: category creation, item classification and category-level financial analysis/reporting.
3. **Exact edit/correction microflows** — direct evidence confirms multiple friction points, but exact record types/actions must be inventoried before implementation.
4. **Occurrence-date discoverability** — verify whether the existing `Data da ocorrência` capability is visible/usable enough; do not rebuild the already implemented P3 model.

Lower-confidence/later candidates unless new evidence makes them mandatory:

- accounts/permissions;
- automatic live synchronization;
- broader order/inventory/store-management modules;
- external integrations.

P9-S1 is prioritization only. Do not change runtime, schema, persistence architecture, backend/auth/cloud or implement a business module in that slice. Full `npm run qa:critical` remains mandatory before integration.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.