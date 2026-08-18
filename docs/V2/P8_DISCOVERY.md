# Easy V2 — P8 Real-store Requirements Discovery

**Status:** P8-S1 repository evidence complete; P8-S2 direct validation complete pending D-019/integration closure  
**Date:** 2026-08-18  
**Scope:** discovery/decision only; no runtime or persistence implementation

## 1. Evidence boundary

P8 separates repository-backed product intent from direct evidence about how the store actually operates.

P8-S1 inspected canonical V2 documents, original prompts, historical PRDs, README and repository issues. It found no interview transcript, store observation, Duda requirements document, production telemetry, support log, SLA/security policy or comparable direct artifact in the repository. Repository-only evidence therefore could not reopen D-016 and produced D-021.

P8-S2 was initially blocked for lack of direct evidence. It resumed on 2026-08-18 when a project stakeholder answered the direct evidence packet in the project conversation. Those answers are the direct real-store source for the conclusions below.

## 2. Repository-evidence inventory from P8-S1

Repository-backed intent already established:

- item catalog and reseller registry;
- reseller orders, payments and signals;
- reseller history/current debt and PDF statements;
- dashboard, Pareto, debtor ranking and debt-aging analytics;
- JSON export/import for backup and computer portability;
- responsive/browser operation;
- local browser persistence;
- no accepted backend/auth/cloud/sync requirement.

Historical material contained an ambiguity about reseller mobile access, but direct P8-S2 evidence resolves the current operation: resellers receive PDF/extracts and do not need interactive Easy access today.

## 3. Direct P8-S2 evidence packet

Source classification: stakeholder answers supplied directly in the project conversation on 2026-08-18.

### Operators

**Current reality:** Easy is used by Duda and store owners. More than one of them does not currently need to operate the same dataset at the same time.

Architecture implication: concurrent operators are not a current requirement.

### Devices and shared state

**Current reality:** Easy is currently used on a PC. The same current dataset does not need to appear automatically on more than one device at the same time.

Architecture implication: automatic live multi-device sharing is not a current requirement.

### Reseller access

**Current reality:** resellers receive PDF/extracts. Interactive application access is not currently required.

Architecture implication: reseller accounts/permissions are not required for the current workflow.

### Sharing/synchronization

**Current reality:** JSON is the current transfer/backup mechanism.

**Future preference:** the stakeholder wants to improve this later and potentially stop depending on manual JSON handling if Easy evolves into a broader system.

This preference is not equivalent to a present mandatory live-synchronization requirement.

### Identity, permissions and authorship

**Future preference:** accounts/permissions may be desirable later for security if Easy becomes a networked/broader system.

No current requirement for named accounts, differentiated permissions or verified human authorship was supplied.

### Recovery and service level

**Confirmed operational risk:** if the operating PC fails before the current JSON has been copied to Drive, the store can lose the working dataset and may have to reconstruct tens of thousands of reais in sales. The consequence is severe enough to create serious employment/business risk.

This confirms that relying on a person remembering to create/copy an off-device backup is a material continuity problem.

Still unresolved:

- numeric RPO;
- numeric RTO;
- provider-operated remote recovery requirement;
- formal remote-recovery SLA.

Therefore recovery durability/off-device protection becomes a high-priority roadmap input, while the explicit D-016 remote-recovery-SLA trigger remains not proven.

### Trusted integrations

**Current reality:** no payment, accounting, messaging or other server integration is required.

**Future preference:** a broader store system with order/inventory/organization capabilities may be interesting later, but no external system of record is currently mandatory.

### Security/privacy/retention

**Unresolved:** the stakeholder does not have enough security/privacy knowledge to identify a policy incompatible with browser-local storage.

This is not negative evidence. No such trigger may be marked false from ignorance; it remains unproven and should be revisited if competent policy/legal requirements emerge.

### Scale and connectivity

**Current reality:** approximately 100 resellers maximum, around 50 active. Most do not generate sales every month; a smaller subset is more active. Daily entry volume is modest.

No scale evidence currently demands server-side persistence.

### Missing operational workflows/reports

Direct evidence confirms:

1. multiple small edit/correction friction points exist, but exact unsupported record types/actions were not enumerated;
2. items need categories;
3. items need assignment to categories such as bronze or porcelain;
4. financial reporting/analysis should be available by category.

The stakeholder also reported needing to enter sales with a date different from the day of entry because Duda commonly records them later. Repository inspection confirms V2 already has an editable `Data da ocorrência` field and persists financial `occurredAt`. This is therefore not a missing date-model capability; it is a discoverability/usability verification item for later prioritization.

## 4. D-016 reopen-trigger assessment

| D-016 trigger | Direct P8-S2 result | Evidence assessment |
| --- | --- | --- |
| Concurrent operators | **NOT PROVEN** | Duda/store owners use Easy, but concurrent operation is not currently needed. |
| Automatic live multi-device sharing | **NOT PROVEN** | Current use is PC-based and the same live dataset is not required simultaneously on multiple devices. |
| Person-level authorship/access control | **NOT PROVEN** | Accounts/permissions are a conditional future preference only. |
| Remote recovery SLA | **NOT PROVEN** | Severe loss consequence is confirmed, but RPO/RTO/provider recovery/SLA are unspecified. |
| Trusted server integrations | **NOT PROVEN** | No integration is currently mandatory. |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** | No competent policy evidence was supplied; absence of knowledge is not proof of compatibility. |

## 5. Architecture decision

P8-S2 explicitly **KEEPS D-016** for the current operating mode.

Direct evidence does not prove a current requirement for backend, authentication, cloud database, live synchronization or a Dexie migration. D-022 records the result.

The decision remains reopenable. If later direct evidence turns a future preference into a mandatory requirement matching any D-016 trigger, architecture must be explicitly reconsidered before implementation.

## 6. Evidence-backed P9 inputs

P8 confirms the following candidates for prioritization, not implementation:

1. **Recovery durability/off-device protection** — highest known consequence because current manual JSON/Drive handling has a catastrophic human-dependent failure mode.
2. **Item category model and category reporting** — concrete missing business capability.
3. **Edit/correction microflow inventory** — direct friction exists but exact cases must be enumerated before changing behavior.
4. **Occurrence-date discoverability** — existing capability should be verified from the operator perspective rather than rebuilt.

Future/lower-confidence candidates unless new evidence makes them mandatory:

- accounts and permissions;
- live synchronization;
- inventory/order/store-management expansion;
- external integrations.

## 7. P8 result

P8 has sufficient direct evidence to close the current store-requirements/architecture gate:

- current operators/devices/access/sharing are defined well enough to assess D-016;
- no D-016 reopen trigger is proven;
- severe recovery risk is confirmed without fabricating an SLA;
- categories/category reporting are confirmed needs;
- edit/correction friction is confirmed but insufficiently specific for implementation;
- delayed occurrence-date entry already exists in V2;
- broad systemization remains future direction.

P8-S2 changes documentation/decisions only. No runtime, backend/auth/cloud/synchronization, schema/persistence migration or P9 implementation is authorized in this slice. Full D-019 `npm run qa:critical` remains required before integration.