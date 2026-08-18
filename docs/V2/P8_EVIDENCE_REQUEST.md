# Easy V2 — P8-S2 Direct Real-store Evidence Intake

**Status:** evidence requested / not yet supplied  
**Date:** 2026-08-18  
**Scope:** factual store validation only; no implementation authorization

## Purpose

P8-S2 cannot decide real-store architecture or P9 priorities from repository intent alone. This document defines the minimum direct evidence packet needed to resume the slice without converting assumptions into requirements.

Acceptable evidence includes operator answers, interview notes, observation notes, support records, production constraints, policy/SLA documents or another artifact that directly describes how the store actually operates or must operate.

For every answer, record the source and whether the statement describes **current reality**, a **mandatory future requirement**, or a **preference**.

## Evidence packet

### 1. Operators

- Who actually uses or must use Easy: owner, employees, resellers or others?
- How many people may operate the same business dataset?
- Can more than one person need to work at the same time?
- Evidence/source:

### 2. Devices and browser profiles

- Which computers, phones or tablets are used?
- Is one browser profile/device the operational source of truth today?
- Must the same current dataset appear automatically on more than one device?
- Evidence/source:

### 3. Reseller direct access

- Does a reseller need interactive access to Easy itself?
- If yes, what must the reseller see or change?
- If no, is a generated PDF/extract sufficient?
- Evidence/source:

### 4. Sharing and synchronization

- Is manual JSON transfer acceptable between devices?
- Is automatic live synchronization mandatory?
- If simultaneous edits occur, what conflict behavior is expected?
- Evidence/source:

### 5. Identity, permissions and authorship

- Are named accounts required?
- Do different people need different permissions or data visibility?
- Must financial actions identify a verified human author?
- Evidence/source:

### 6. Recovery and service level

- After device loss/failure, what maximum data loss is acceptable (RPO)?
- What maximum recovery time is acceptable (RTO)?
- Is local JSON backup/restore operationally sufficient?
- Is provider-operated remote recovery mandatory?
- Evidence/source:

### 7. Trusted integrations

- Are payment, accounting, messaging or other server-side integrations mandatory?
- Which external system is authoritative, if any?
- Evidence/source:

### 8. Security, privacy and retention

- Is there a policy or legal requirement that forbids browser-local-only storage?
- Are encryption, retention, deletion, audit or access requirements formally defined?
- Evidence/source:

### 9. Scale and connectivity

- Approximate active reseller count:
- Approximate transaction volume per day/month:
- Typical connectivity conditions, including offline/unstable periods:
- Evidence/source:

### 10. Missing operational workflows/reports

- Which missing workflow or report currently causes measurable manual work, delay or error risk?
- How often does it occur?
- What is the operational consequence?
- Evidence/source:

## D-016 mapping rule

After evidence is supplied, map each confirmed fact to these explicit D-016 reopen triggers:

1. concurrent operators;
2. automatic live multi-device sharing;
3. person-level authorship/access control;
4. remote recovery SLA;
5. trusted server integrations;
6. security policy incompatible with browser-local storage.

A trigger may be marked **PROVEN** only from direct evidence. Missing answers remain **UNRESOLVED**; they are not negative evidence.

## Architecture decision rule

- If no reopen trigger is proven after sufficient direct validation, keep D-016 accepted and close P8 with evidence-backed P9 priorities.
- If any reopen trigger is proven, explicitly reopen the persistence architecture decision before implementing backend/auth/cloud/synchronization or a Dexie migration.
- Do not implement architecture or P9 features inside the evidence-collection slice itself.
