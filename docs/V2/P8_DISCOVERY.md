# Easy V2 — P8 Real-store Requirements Discovery

**Status:** P8-S1 repository evidence complete; resumed P8-S2 direct validation complete pending D-019/integration closure  
**Date:** 2026-08-18  
**Scope:** discovery only; no runtime or persistence implementation

## 1. Evidence boundary

P8-S1 inspected the canonical V2 documents plus repository artifacts that can carry product intent: `prompts/`, historical `tasks/*/prd.md`, `README.md`, and repository issues. No separate interview transcript, store observation, Duda requirements document, production telemetry, support log, SLA/security policy or other direct real-store artifact is present in the repository. Searches for repository issues mentioning `Duda` or `loja` returned no issues.

Historical `tasks/` documents remain non-canonical for status, but they are usable as evidence of prior product intent when checked against the original prompts. P8-S1 therefore distinguishes **confirmed project intent** from **real-store validation**, rather than treating historical generated PRDs as proof of current operational reality.

## 2. Evidence-backed requirement inventory

### Workflows

Confirmed project intent:

- maintain an item catalog and reseller registry;
- record reseller orders, payments and signals;
- show reseller history and current debt;
- generate reseller statement PDFs, including bounded date periods;
- show business dashboard metrics, Pareto/performance and debt-aging views;
- search resellers/items and launch frequent actions quickly;
- export/import the application state for backup and computer migration.

These workflows are already represented in the current V2 baseline; P8-S1 does not authorize new P9 modules from them.

### Operators and devices

Confirmed project intent:

- an administrator/business owner is a primary operator;
- the administrator must be able to inspect balances and launch activity from a smartphone as well as desktop;
- the UI is expected to function on desktop, iPhone and Android-class screens.

Open real-store validation at P8-S1:

- a later responsiveness prompt/PRD also names the reseller as a direct mobile user who can consult their own statement, while the original product definition explicitly described a local single-user application without authentication;
- the repository does not define whether a reseller uses the administrator's device, imports a copy, receives only a PDF, or independently accesses a shared live dataset.

This role/device tension was material but **did not by itself prove** concurrent operation, authentication, access-control or synchronization requirements.

### Data sharing and portability

Confirmed project intent:

- statement PDFs are generated so they can be shared with resellers;
- JSON export/import is explicitly intended for backup and moving data between computers;
- the application is statically hosted/client-side and the current persistence model is browser-local.

Not evidenced by P8-S1:

- automatic live multi-device synchronization;
- a centrally shared database;
- server-mediated collaboration or conflict resolution.

### Recovery and service level

Confirmed V2 behavior:

- local versioned backup, validated preflight, downloaded checkpoint and atomic restore are required and implemented by P5.

Not evidenced by P8-S1:

- remote recovery operated by a service provider;
- a defined recovery-time objective (RTO), recovery-point objective (RPO), uptime commitment or remote-recovery SLA.

### Security, identity and access

Confirmed project intent/history:

- the original requirements explicitly placed authentication, backend/API and cloud synchronization out of scope;
- current V2 audit metadata is actor-neutral and does not claim verified human authorship.

Open real-store validation at P8-S1:

- whether reseller direct use is still required;
- whether different people need different permissions or data visibility;
- whether financial data handling is subject to a policy incompatible with browser-local storage;
- whether person-level authorship is operationally or legally required.

### Reporting and decision support

Confirmed project intent:

- reseller history and debt balance;
- PDF statements with date filtering;
- total debt and daily order volume;
- Pareto/revenue concentration;
- debtor ranking and debt-aging/risk views.

No additional reporting module was authorized by repository evidence alone.

### Operational constraints

Confirmed project intent/history:

- static browser application;
- local Dexie/IndexedDB persistence;
- responsive desktop/mobile use;
- routine transaction entry should be fast; the historical management PRD used `< 30s` as a success target;
- data portability must avoid loss when moving computers.

Not evidenced by P8-S1:

- required transaction/reseller scale;
- offline-first service expectations beyond the consequences of local browser storage;
- required external integrations;
- formal retention, privacy or regulatory constraints.

## 3. D-016 reopen-trigger assessment from P8-S1

| D-016 trigger | P8-S1 result | Evidence assessment |
| --- | --- | --- |
| Concurrent operators | **NOT PROVEN** | Administrator use is explicit; reseller direct use appears in later mobile intent but concurrency/shared-state behavior is unspecified. |
| Automatic live multi-device sharing | **NOT PROVEN** | Mobile use is required, but the only explicit cross-computer mechanism is manual JSON export/import; no automatic sync requirement is stated. |
| Person-level authorship/access control | **NOT PROVEN** | Original requirements explicitly omit authentication; no permission model or verified-person audit requirement exists. |
| Remote recovery SLA | **NOT PROVEN** | Local backup/restore is explicit and implemented; no RTO/RPO/remote recovery commitment is present. |
| Trusted server integrations | **NOT PROVEN** | No payment, accounting, messaging or other trusted server integration is required by the inspected evidence. |
| Security policy incompatible with browser-local storage | **NOT PROVEN** | No such policy is present in repository evidence. |

**P8-S1 conclusion:** repository evidence does not prove a D-016 reopen trigger. D-016 therefore remains authoritative and P8-S1 does not authorize backend, authentication, cloud database, synchronization or persistence migration work.

## 4. Questions requiring direct real-store evidence

P8-S1 left these direct-validation questions:

1. Who actually operates Easy today or is expected to operate it: owner only, employees, resellers, or some combination?
2. If more than one person operates it, do they need to work concurrently on the same dataset?
3. Which physical devices/browser profiles are used, and must the same live data appear automatically on more than one device?
4. Does a reseller truly need interactive access to the application, or is receiving a generated PDF/extract sufficient?
5. If resellers or employees access the application, what data may each person see or change, and is verified authorship required?
6. Is manual JSON backup/transfer operationally acceptable? What maximum data loss and recovery time are acceptable after device loss/failure?
7. Are there required server integrations such as payment, accounting, messaging or other systems of record?
8. Are there privacy/security policies that prohibit storing the operational dataset only in browser-local storage?
9. What are realistic reseller/transaction volumes and connectivity conditions that the production workflow must tolerate?
10. Which currently missing reports or operational modules cause measurable work, error risk or delay in the real store?

## 5. P8-S1 result

P8-S1 completed **repository-evidence discovery**. It established a bounded evidence matrix and identified one material ambiguity — reseller direct mobile use versus the accepted single-user/no-auth model — without converting that ambiguity into an architecture decision.

The next slice therefore required direct real-store evidence before deciding whether D-016 should be reopened.

## 6. First P8-S2 direct-validation attempt — 2026-08-18

P8-S2 was started from `develop` at `2c5f5e92dd66224499ffc55f828d3e220a2afd63` and performed evidence intake only.

Checks performed against the project-accessible evidence boundary:

- reread the canonical startup set and the P8-S1 matrix;
- searched repository content for interview/observation/operator/store evidence and for RTO/RPO/SLA material;
- checked repository issues, including explicit `Duda` and `loja` searches;
- inspected the repository root for a newly supplied interview, observation, support, telemetry, SLA/security or other real-store artifact.

Result at that time: **no direct real-store evidence had been supplied to the project**. The repository had zero issues, targeted evidence searches returned no direct artifact, and the conversation supplied no operator answers, interview notes, observation record, SLA/security policy or production telemetry.

That absence was correctly classified as an **evidence blocker**, not negative evidence about store needs. The slice remained `BLOCKED`, D-016 stayed authoritative, and no architecture/P9 implementation was performed.

Persistent Critical QA run `32152466007`, job `95761457231`, passed on PR #25. The blocked-state canonical closure integrated into `develop` as `5e1b45bef63b8e91c692d35cae9da5c66a905740`.

## 7. Resumed P8-S2 direct validation — 2026-08-18

P8-S2 resumed when a project stakeholder supplied the direct evidence packet in the project conversation.

### 7.1 Operators

**Current reality:** Easy is used by Duda and store owners. They do not currently need to operate the same dataset concurrently.

**Trigger effect:** concurrent operators **NOT PROVEN**.

### 7.2 Devices/shared state

**Current reality:** current use is on a PC. The same live dataset does not need to appear automatically on multiple devices at the same time.

**Trigger effect:** automatic live multi-device sharing **NOT PROVEN**.

### 7.3 Reseller access

**Current reality:** resellers receive PDF/extracts and do not need interactive Easy access today.

This resolves the P8-S1 reseller-mobile ambiguity for the current store operation without requiring reseller accounts/authentication.

### 7.4 Sharing/synchronization

**Current reality:** JSON is the current portability/backup mechanism.

**Future preference:** reduce or eventually eliminate dependence on manual JSON handling if Easy evolves into a broader system.

This is not a current mandatory live-synchronization requirement.

### 7.5 Identity/permissions/authorship

**Future preference:** accounts/permissions may be considered later for security in a broader/networked system.

No current requirement for named accounts, differentiated permissions or verified human authorship was supplied.

**Trigger effect:** person-level authorship/access control **NOT PROVEN**.

### 7.6 Recovery/service level

**Confirmed operational risk:** if the operating PC fails before the current JSON has been copied to Drive, the store may lose the working dataset and have to reconstruct tens of thousands of reais in sales. The consequence is severe enough to create serious employment/business risk.

This confirms human-memory-dependent off-device backup as a critical business-continuity problem.

Still unresolved:

- numeric RPO;
- numeric RTO;
- provider-operated remote recovery obligation;
- formal recovery SLA.

**Trigger effect:** remote recovery SLA **NOT PROVEN**, while recovery durability/off-device protection becomes a high-priority roadmap input.

### 7.7 Trusted integrations

**Current reality:** no payment, accounting, messaging or other server integration is required today.

**Future preference:** broader order/inventory/store-organization capabilities may be desirable later.

**Trigger effect:** trusted server integrations **NOT PROVEN**.

### 7.8 Security/privacy

**Unresolved:** the stakeholder does not have enough security/privacy knowledge to identify a policy incompatible with browser-local storage.

This is not negative evidence.

**Trigger effect:** security-policy incompatibility remains **UNRESOLVED / NOT PROVEN**.

### 7.9 Scale/connectivity

**Current reality:** approximately 100 resellers maximum, around 50 active. Most do not generate sales every month; a smaller subset is more active. Daily registration volume is modest.

No scale evidence currently demands server-side persistence.

### 7.10 Missing workflows/reports

Direct evidence confirms:

- several small edit/correction friction points exist, but exact unsupported record/action combinations were not enumerated;
- operators need item categories;
- items need category assignment, with examples such as bronze and porcelain;
- financial reporting/analysis should be available separately by category.

The stakeholder also reported needing to enter sales with dates different from the registration day because Duda commonly records them later. Repository inspection confirms current V2 already exposes `Data da ocorrência` and persists financial `occurredAt`; this is therefore a discoverability/usability verification item rather than a missing date-model capability.

## 8. Final D-016 trigger disposition

| D-016 trigger | Direct P8-S2 result | Architecture effect |
| --- | --- | --- |
| Concurrent operators | **NOT PROVEN** | Current operation does not require concurrency. |
| Automatic live multi-device sharing | **NOT PROVEN** | Current operation does not require simultaneous shared live state. |
| Person-level authorship/access control | **NOT PROVEN** | Future conditional preference only. |
| Remote recovery SLA | **NOT PROVEN** | Severe recovery risk confirmed; formal SLA/RPO/RTO unresolved. |
| Trusted server integrations | **NOT PROVEN** | None currently required. |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** | No competent policy evidence supplied. |

## 9. Architecture decision and P8 result

**KEEP D-016.** D-022 records that direct store evidence does not prove a present reopen trigger. No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by P8-S2.

P8 has sufficient direct evidence to close the current store-requirements/architecture gate. Evidence-backed inputs entering P9 prioritization are:

1. recovery durability/off-device protection;
2. item categories and category-level reporting;
3. exact edit/correction microflow inventory;
4. occurrence-date discoverability verification, without rebuilding the already implemented P3 date model.

Broader accounts/permissions, live synchronization, inventory/order/store-management expansion and external integrations remain future directions unless later evidence makes them mandatory.

No runtime, schema, persistence, backend/auth/cloud/synchronization or P9 implementation is performed in P8-S2. Full D-019 `npm run qa:critical` remains required before integration.