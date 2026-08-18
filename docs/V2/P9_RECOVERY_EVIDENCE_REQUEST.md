# Easy V2 — P9-S2 Recovery Durability Evidence Request

**Status:** `BLOCKED` pending direct store recovery-target evidence  
**Date:** 2026-08-18  
**Scope:** decision/evidence only; no recovery implementation authorization

## 1. Why P9-S2 is blocked

P9-S2 must establish a measurable current-store recovery target before comparing or selecting a recovery mechanism. The canonical minimum is:

1. acceptable maximum age of the latest recoverable off-device copy after loss of the operating PC; and
2. acceptable recovery procedure for restoring operation after that loss.

The direct P8 evidence confirms the consequence but explicitly leaves numeric RPO/RTO and remote-recovery obligations unresolved. Repository searches performed for P9-S2 found no newer direct operator/interview/observation/SLA material that supplies these missing parameters.

Therefore P9-S2 cannot select a target, compare mechanisms as fit-for-purpose, reopen D-016, or authorize implementation without inventing requirements.

## 2. Evidence already accepted

The following remains direct, accepted store evidence:

- Easy currently runs on a PC;
- concurrent operation on one live dataset is not currently required;
- automatic simultaneous multi-device sharing is not currently required;
- resellers receive PDF/extracts rather than interactive application access;
- JSON is the current backup/portability mechanism;
- the operator currently copies JSON to Drive manually;
- if the PC fails before a fresh JSON reaches Drive, the working dataset can be lost;
- reconstructing that loss may require recalculating tens of thousands of reais in sales and creates severe business/employment risk;
- no current trusted server integration is mandatory;
- no formal remote-recovery SLA, numeric RPO or numeric RTO has been supplied.

This proves that human-memory-dependent off-device protection is a critical continuity problem. It does **not** prove how fresh the recoverable copy must be or what recovery procedure the store accepts.

## 3. Minimum direct answers required to resume

A store owner/operator should answer the questions below in ordinary operational language. Formal SLA terminology is not required.

### A. Maximum acceptable recoverable-copy age

If the operating PC were permanently lost now, how old may the newest usable off-device copy be before the amount of missing work becomes unacceptable?

Supply one concrete boundary, for example a number of hours, one business day, or another store-defined interval. Examples are elicitation aids only and are **not** proposed defaults.

### B. Acceptable recovery procedure

After permanent loss of the operating PC, describe the recovery procedure the store considers acceptable.

At minimum clarify:

- whether recovery by a store operator on a replacement PC/browser is acceptable;
- whether manually obtaining the newest off-device backup and importing/restoring it is acceptable;
- whether a provider/operator outside the store must be able to recover the data remotely;
- whether the store requires recovery without manually handling a JSON backup file.

### C. Acceptable interruption window

How long may Easy remain unavailable after PC loss while the replacement environment is prepared and the latest acceptable copy is restored?

This answer helps distinguish a simple operator-run restore procedure from a provider-operated recovery obligation. It must come from the store; P9-S2 will not invent an RTO.

### D. Off-device destination and operating constraints

Which durable destinations/processes are acceptable in current operation?

Clarify whether the store is willing and able to use any of the following, without treating them as selected solutions:

- a Drive-synchronized folder on the PC;
- an external/removable drive;
- an explicitly chosen local folder whose contents are synchronized by the operating system/provider;
- periodic operator confirmation/reminders;
- browser permission to write repeatedly to a previously chosen file/folder, where supported.

Also state any restriction that makes one of these unacceptable.

## 4. Mechanism comparison intentionally deferred

P9-S2 does **not** rank or select recovery mechanisms in this blocked attempt.

Candidate mechanism families may include reminder/age visibility, streamlined export to a durable synchronized location, permission-based repeated writes to a chosen location, or a design that would require remote/server persistence. Their suitability depends on the direct answers above.

In particular:

- a reminder can reduce forgotten backups but does not itself create an independently durable copy;
- a local or synchronized-folder mechanism may remain compatible with D-016, depending on the accepted procedure and browser/OS constraints;
- any requirement for provider-operated remote recovery, automatic centrally stored recovery, or another D-016 trigger must explicitly reopen D-016 before implementation.

No mechanism is accepted or authorized by this document.

## 5. Resume rule

When the minimum direct evidence is supplied:

1. record it as current-store evidence without translating preferences into stronger requirements;
2. establish the measurable recovery target;
3. compare the smallest mechanisms against that target and D-016/D-017/D-018;
4. explicitly keep or reopen D-016;
5. record the accepted P9-S2 decision;
6. run the full D-019 gate before integration.

Until then P9-S2 remains `BLOCKED` and no recovery automation, cloud/backend/auth/live synchronization, category/schema work, correction work or other runtime feature may start under this slice.
