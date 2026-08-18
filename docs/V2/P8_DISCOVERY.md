# Easy V2 — P8 Real-store Requirements Discovery

**Status:** P8-S1 repository evidence complete; P8-S2 direct validation `BLOCKED` awaiting real-store evidence  
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

Open real-store validation:

- a later responsiveness prompt/PRD also names the reseller as a direct mobile user who can consult their own statement, while the original product definition explicitly described a local single-user application without authentication;
- the repository does not define whether a reseller uses the administrator's device, imports a copy, receives only a PDF, or independently accesses a shared live dataset.

This role/device tension is material but **does not by itself prove** concurrent operation, authentication, access-control or synchronization requirements.

### Data sharing and portability

Confirmed project intent:

- statement PDFs are generated so they can be shared with resellers;
- JSON export/import is explicitly intended for backup and moving data between computers;
- the application is statically hosted/client-side and the current persistence model is browser-local.

Not evidenced:

- automatic live multi-device synchronization;
- a centrally shared database;
- server-mediated collaboration or conflict resolution.

### Recovery and service level

Confirmed V2 behavior:

- local versioned backup, validated preflight, downloaded checkpoint and atomic restore are required and implemented by P5.

Not evidenced:

- remote recovery operated by a service provider;
- a defined recovery-time objective (RTO), recovery-point objective (RPO), uptime commitment or remote-recovery SLA.

### Security, identity and access

Confirmed project intent/history:

- the original requirements explicitly placed authentication, backend/API and cloud synchronization out of scope;
- current V2 audit metadata is actor-neutral and does not claim verified human authorship.

Open real-store validation:

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

No additional reporting module is authorized until P8 real-store validation establishes an unmet need.

### Operational constraints

Confirmed project intent/history:

- static browser application;
- local Dexie/IndexedDB persistence;
- responsive desktop/mobile use;
- routine transaction entry should be fast; the historical management PRD used `< 30s` as a success target;
- data portability must avoid loss when moving computers.

Not evidenced:

- required transaction/reseller scale;
- offline-first service expectations beyond the consequences of local browser storage;
- required external integrations;
- formal retention, privacy or regulatory constraints.

## 3. D-016 reopen-trigger assessment

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

P8 cannot be considered complete until direct evidence resolves at least these questions:

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

P8-S1 is complete as **repository-evidence discovery**. It establishes a bounded evidence matrix and identifies one material ambiguity — reseller direct mobile use versus the accepted single-user/no-auth model — without converting that ambiguity into an architecture decision.

P8 remains in progress. The next slice must collect direct real-store evidence for the unresolved operator/device/sharing/access/recovery questions and only then decide whether D-016 should be reopened.

## 6. P8-S2 direct-validation attempt — 2026-08-18

P8-S2 was started from `develop` at `2c5f5e92dd66224499ffc55f828d3e220a2afd63` and performed evidence intake only.

Checks performed against the project-accessible evidence boundary:

- reread the canonical startup set and this P8-S1 matrix;
- searched repository content for interview/observation/operator/store evidence and for RTO/RPO/SLA material;
- checked repository issues, including explicit `Duda` and `loja` searches;
- inspected the current repository root for a newly supplied interview, observation, support, telemetry, SLA/security or other real-store artifact.

Result: **no direct real-store evidence has been supplied to the project**. The repository currently has zero issues, the targeted evidence searches returned no direct artifact, and the current conversation supplied no operator answers, interview notes, observation record, SLA/security policy or production telemetry.

This absence is an **evidence blocker**, not negative evidence about store needs. It does not justify marking any D-016 trigger false, nor does it justify inventing architecture or P9 requirements.

### P8-S2 trigger disposition

| D-016 trigger | P8-S2 direct-evidence status | Architecture effect |
| --- | --- | --- |
| Concurrent operators | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |
| Automatic live multi-device sharing | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |
| Person-level authorship/access control | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |
| Remote recovery SLA | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |
| Trusted server integrations | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |
| Security policy incompatible with browser-local storage | **UNRESOLVED — no direct evidence supplied** | No reopen trigger proven. |

D-016 therefore remains authoritative under D-021 because **no reopen trigger is proven**. This is not a completed real-store validation and P8-S2 must not be marked `DONE` until sufficient direct evidence is supplied and classified.

`docs/V2/P8_EVIDENCE_REQUEST.md` now defines the minimum evidence packet needed to resume the slice consistently: operators/concurrency, devices/shared state, reseller access, synchronization, identity/permissions/authorship, recovery RTO/RPO, trusted integrations, security/privacy, scale/connectivity and measurable missing workflows/reports.

No runtime, backend/auth/cloud/synchronization, Dexie migration or P9 implementation was performed.
