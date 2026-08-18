# Easy V2 — P9-S2 Recovery Durability Evidence

**Status:** direct store recovery-target evidence `ACCEPTED / INTEGRATED`; mechanism decision not yet executed  
**Date:** 2026-08-18  
**Scope:** evidence record and decision-gate input; no recovery implementation authorization

## 1. Original blocker

P9-S2 requires a measurable current-store recovery target before comparing or selecting a recovery mechanism. The first P9-S2 attempt confirmed the continuity consequence but lacked acceptable recoverable-copy age, recovery procedure, interruption expectation and destination/process constraints.

That evidence gap was correctly treated as a blocker. No SLA/RPO/RTO value, cloud requirement or recovery mechanism was invented.

## 2. Previously accepted continuity evidence

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

## 3. Direct recovery-target evidence supplied on 2026-08-18

### A. Maximum acceptable recoverable-copy age

**Direct answer:** loss of up to **24 hours** of work is considered a solvable/acceptable recovery case.

Accepted bounded interpretation: the newest usable off-device recovery copy must be no more than **24 hours old**. This is the mechanism-comparison boundary; no stricter target is invented.

### B. Acceptable recovery procedure

**Direct answer:** manual restoration on **any computer** is acceptable.

Accepted bounded interpretation: operator-run recovery on a replacement computer/browser using the newest acceptable backup is sufficient. Provider-operated remote recovery is therefore **not mandatory** under the supplied current-store requirement.

### C. Interruption expectation

**Direct answer:** the system has **daily demand** and there is effectively no comfortable waiting period after loss.

No numeric number of hours was supplied. P9-S2 therefore does **not** create a formal numeric RTO. The accepted qualitative constraint is that a multi-day recovery procedure is incompatible with current operation and the recovery path must be practical for daily use on a replacement computer.

### D. Acceptable destinations/process constraints

**Direct answer:** **Google Drive** is acceptable, and a **local file on the PC** is also acceptable for day-to-day speed/convenience.

Accepted boundary:

- Google Drive may be considered an acceptable durable off-device destination;
- a local PC file is accepted as a convenience copy but is not automatically considered sufficient off-device durability if the operating PC itself is lost;
- the Google account connected to ChatGPT is not an Easy credential or authorization path;
- Easy does not inherit ChatGPT account access;
- any direct Google API/OAuth integration would require its own explicit architecture/security decision rather than being assumed from the ChatGPT connection.

## 4. Evidence disposition

The direct-evidence availability blocker is closed. Accepted P9-S2 target entering mechanism comparison is:

- recoverable-copy age: **<= 24 hours**;
- operator-run manual restore on a replacement computer: **acceptable**;
- provider-operated remote recovery: **not mandatory**;
- daily-use continuity: **required qualitatively**, without inventing a numeric RTO;
- Google Drive as durable destination: **acceptable**;
- local PC file as convenience destination: **acceptable**.

No supplied answer proves a D-016 reopen trigger. The store did not require concurrent operators, automatic live multi-device state, person-level access/authorship, provider-operated remote recovery, a trusted server integration or automatic centrally hosted persistence.

## 5. Accepted evidence-intake validation/integration

Persistent Critical QA **`32175718073`**, job **`95837062983`** — PASS on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #35 was squash-merged into `develop` as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`. The validated merge ref and integrated commit share exact tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

The evidence record is therefore accepted and integrated exactly as validated by D-019.

## 6. Mechanism comparison intentionally remains unexecuted

No recovery mechanism has yet been ranked, selected or implemented.

The next decision slice must compare the smallest mechanisms capable of satisfying the accepted target while preserving D-016/D-017/D-018. Candidate families may include reminder/backup-age visibility, streamlined export to a durable synchronized location, permission-based repeated writes to a chosen location, or a design requiring remote/server persistence. These remain candidates only.

The comparison must explicitly:

1. evaluate fit against the <=24-hour off-device recovery target and daily-use constraint;
2. evaluate practical operator-run restore on another computer;
3. distinguish durable Drive/off-device protection from local-only convenience copies;
4. account for real browser/OS permission constraints rather than assuming capabilities;
5. explicitly keep or reopen D-016;
6. select and record the smallest fit-for-purpose mechanism;
7. define a bounded implementation slice if runtime work is required.

The comparison/decision slice must **not implement** the selected mechanism. Implementation requires a later canonical authorization and its own D-019 validation.