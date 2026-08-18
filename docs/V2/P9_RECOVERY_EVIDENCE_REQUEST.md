# Easy V2 — P9-S2 Recovery Durability Evidence Request

**Status:** direct store recovery-target evidence received; blocker resolved for mechanism comparison  
**Date:** 2026-08-18  
**Scope:** decision/evidence only; no recovery implementation authorization

## 1. Original blocker

P9-S2 requires a measurable current-store recovery target before comparing or selecting a recovery mechanism. The first P9-S2 attempt confirmed the continuity consequence but lacked the acceptable recoverable-copy age, recovery procedure, interruption expectation and destination/process constraints.

That evidence gap was correctly treated as a blocker. No SLA/RPO/RTO value, cloud requirement or recovery mechanism was invented.

## 2. Previously accepted evidence

The following remains direct, accepted store evidence:

- Easy currently runs on a PC;
- concurrent operation on one live dataset is not currently required;
- automatic simultaneous multi-device sharing is not currently required;
- resellers receive PDF/extracts rather than interactive application access;
- JSON is the current backup/portability mechanism;
- the operator currently copies JSON to Drive manually;
- if the PC fails before a fresh JSON reaches Drive, the working dataset can be lost;
- reconstructing that loss may require recalculating tens of thousands of reais in sales and creates severe business/employment risk;
- no current trusted server integration is mandatory.

## 3. Direct recovery-target evidence received on 2026-08-18

The store/operator supplied the missing answers directly.

### A. Maximum acceptable recoverable-copy age

**Direct answer:** loss of up to **24 hours** of work is considered a solvable/acceptable recovery case.

Canonical interpretation for P9-S2 mechanism comparison: the newest usable off-device recovery copy must be no more than 24 hours old. This records the store boundary without inventing a stricter target.

### B. Acceptable recovery procedure

**Direct answer:** manual restoration on **any computer** is acceptable.

Canonical interpretation: an operator-run recovery on a replacement computer/browser using the newest acceptable backup is sufficient. Provider-operated remote recovery is therefore **not mandatory** under the supplied current-store requirement.

### C. Interruption expectation

**Direct answer:** the system has **daily demand** and there is effectively no comfortable waiting period after loss.

No numeric number of hours was supplied, so P9-S2 does **not** create a formal numeric RTO. For mechanism comparison, the evidence means that a multi-day recovery procedure is incompatible with current operation and that the recovery path must be practical for daily use on a replacement computer.

### D. Acceptable destinations/process constraints

**Direct answer:** a **Google Drive** destination is acceptable, and a **local file on the PC** is also acceptable for day-to-day speed/convenience.

The reference to the Google account currently connected to ChatGPT is not treated as an Easy credential or authorization path. Easy does not inherit ChatGPT account access. P9-S2 may treat Google Drive as an acceptable durable destination, but any direct Google API/OAuth integration would require its own explicit architecture/security assessment rather than being assumed from the ChatGPT connection.

A local PC file is accepted as a convenience copy; whether it can satisfy the off-device durability target by itself is intentionally left to the mechanism-comparison step.

## 4. Evidence disposition

The direct-evidence blocker is resolved sufficiently to resume the P9-S2 decision gate:

- measurable recoverable-copy-age boundary: **<= 24 hours**;
- operator-run manual restore on a replacement computer: **acceptable**;
- provider-operated remote recovery: **not mandatory**;
- daily-use continuity constraint: **confirmed**, without inventing a numeric RTO;
- Google Drive as a durable destination: **acceptable**;
- local PC file as a convenience destination: **acceptable**.

No supplied answer proves a D-016 reopen trigger. In particular, the store did not require concurrent operators, automatic live multi-device state, person-level access/authorship, provider-operated remote recovery, a trusted server integration, or automatic centrally hosted persistence.

## 5. Mechanism comparison remains intentionally unexecuted in this evidence-intake slice

This evidence-intake update does **not** rank, select or implement a recovery mechanism.

The next canonical action is to compare the smallest mechanisms against the accepted <=24-hour recoverable-copy target, manual-any-computer recovery procedure, daily-use constraint and acceptable Drive/local destinations while preserving D-016/D-017/D-018.

Candidate families remain only candidates until that next action is executed. They may include reminder/age visibility, streamlined export to a durable synchronized location, permission-based repeated writes to a chosen location, or a design requiring remote/server persistence.

No mechanism is accepted or authorized by this document.

## 6. Resume rule

After this evidence-intake record passes D-019 and is integrated:

1. compare the smallest mechanisms against the accepted direct target and D-016/D-017/D-018;
2. explicitly keep or reopen D-016 based on the comparison and any proven trigger;
3. record the accepted P9-S2 recovery decision;
4. only then authorize a bounded implementation slice if the selected mechanism requires runtime work;
5. run the full D-019 gate before each integration.

Until a mechanism decision is accepted, do not implement recovery automation, direct cloud/backend/auth/live synchronization, category/schema work, correction work or another runtime feature under P9-S2.