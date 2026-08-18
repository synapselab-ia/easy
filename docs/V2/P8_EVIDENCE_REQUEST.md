# Easy V2 — P8-S2 Direct Real-store Evidence Intake

**Status:** evidence received and classified  
**Date:** 2026-08-18  
**Scope:** factual store validation only; no implementation authorization

## Source

Direct stakeholder answers supplied in the project conversation on 2026-08-18.

Classification vocabulary:

- **Current reality** — how the store operates now.
- **Mandatory operational concern** — consequence/problem that must be accounted for, without inventing a technical solution.
- **Future preference** — desired direction that is not yet a mandatory requirement.
- **Unresolved** — evidence is insufficient; no negative answer may be inferred.

## 1. Operators

**Current reality**

- Easy is used by Duda and store owners.
- More than one person does not currently need to use the same dataset simultaneously.

**D-016 mapping:** concurrent operators **NOT PROVEN**.

## 2. Devices and browser profiles

**Current reality**

- Current operation is on a PC.
- The same current dataset does not need to be visible automatically on more than one device at the same time.

**D-016 mapping:** automatic live multi-device sharing **NOT PROVEN**.

## 3. Reseller direct access

**Current reality**

- Resellers do not need interactive access to Easy.
- PDF/extract delivery is sufficient for the current reseller-facing workflow.

**D-016 mapping:** reseller identity/access control is not a current requirement.

## 4. Sharing and synchronization

**Current reality**

- JSON is the current data-transfer/backup mechanism.

**Future preference**

- The stakeholder wants to improve this later and potentially stop depending on manual JSON handling if Easy becomes a broader system.

No current requirement for automatic live synchronization or simultaneous conflict handling was supplied.

**D-016 mapping:** automatic live multi-device sharing **NOT PROVEN**.

## 5. Identity, permissions and authorship

**Future preference**

- Accounts/permissions may be considered later for security if Easy becomes a broader/networked system.

No current requirement for named accounts, differentiated permissions, data-visibility rules or verified human authorship was supplied.

**D-016 mapping:** person-level authorship/access control **NOT PROVEN**.

## 6. Recovery and service level

**Mandatory operational concern / current consequence**

- If the operating PC fails before Duda has copied the current JSON to Drive, the store can lose the working dataset.
- Reconstructing the loss could require recalculating tens of thousands of reais in sales and carries severe business/employment consequences.
- Therefore relying on a person remembering to make/copy an off-device JSON backup is a critical continuity risk.

**Unresolved**

- numeric RPO;
- numeric RTO;
- whether provider-operated remote recovery is mandatory;
- whether a formal recovery SLA is required.

**D-016 mapping:** remote recovery SLA **NOT PROVEN**. Recovery durability is nonetheless a confirmed high-priority product requirement/input.

## 7. Trusted integrations

**Current reality**

- No payment, accounting, messaging or other server-side integration is currently required.

**Future preference**

- A broader Easy covering orders, inventory and store organization could be interesting later.

**D-016 mapping:** trusted server integrations **NOT PROVEN**.

## 8. Security, privacy and retention

**Unresolved**

- The stakeholder does not know whether a formal security/privacy policy forbids browser-local-only storage.
- No formal encryption/retention/deletion/audit/access requirement was supplied.

This is not negative evidence.

**D-016 mapping:** security policy incompatible with browser-local storage **UNRESOLVED / NOT PROVEN**.

## 9. Scale and connectivity

**Current reality**

- Approximately 100 resellers maximum.
- Around 50 are active.
- Most do not generate sales every month; a smaller subset is more active.
- Daily registration volume is modest.

No current scale evidence requires server-side persistence.

Connectivity constraints were not identified as a current blocking problem.

## 10. Missing operational workflows/reports

**Confirmed missing need**

- Items need categories.
- Operators need to create/manage categories.
- Each item should be classifiable into a category such as bronze or porcelain.
- Reporting/analysis should be available separately by category.

**Confirmed friction, exact cases unresolved**

- Duda cannot edit/correct some types of records in the way needed during real operation.
- There are several additional micro-adjustments, but the stakeholder could not enumerate all of them in this evidence round.
- Implementation must wait until exact record types/actions are identified; the existence of friction is confirmed, the required behavior is not yet sufficiently specified.

**Reported need already supported by current V2**

- Duda commonly records a sale later than the day it actually occurred and needs to enter the true financial date.
- Current V2 already exposes `Data da ocorrência` and persists `occurredAt` independently from registration `createdAt`.
- P9 must treat this as discoverability/usability verification rather than a missing date-model feature.

## D-016 final mapping

| Trigger | Result |
| --- | --- |
| Concurrent operators | **NOT PROVEN** |
| Automatic live multi-device sharing | **NOT PROVEN** |
| Person-level authorship/access control | **NOT PROVEN** |
| Remote recovery SLA | **NOT PROVEN** — severe recovery risk confirmed, SLA/RPO/RTO unresolved |
| Trusted server integrations | **NOT PROVEN** |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** |

## Architecture decision rule applied

No D-016 reopen trigger is proven by the supplied direct evidence. D-016 therefore remains accepted for the current operating mode and P8-S2 does not authorize backend/auth/cloud/live synchronization or Dexie migration.

The direct evidence is sufficient to close the current P8 architecture gate while preserving explicit future reopen conditions. Recovery durability, category reporting and exact edit/correction friction become evidence-backed P9 prioritization inputs.

No architecture or P9 feature implementation is performed inside P8-S2.