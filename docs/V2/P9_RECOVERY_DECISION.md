# Easy V2 — P9-S2 Recovery Mechanism Decision

**Status:** `ACCEPTED / INTEGRATED` — comparison/decision complete; implementation not started  
**Date:** 2026-08-18  
**Scope:** mechanism comparison/decision only; no runtime implementation

## 1. Accepted target

This decision uses only the direct recovery target accepted in `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md`:

- newest usable off-device recovery copy: **<= 24 hours** old;
- operator-run manual restore on **any computer**: acceptable;
- Easy has **daily demand**; multi-day recovery is incompatible, but no numeric hour-based RTO is invented;
- **Google Drive**: acceptable durable destination;
- local PC file: acceptable convenience copy;
- provider-operated remote recovery: not mandatory.

D-016/D-017/D-018 were authoritative entering the comparison.

## 2. Current implementation and environment constraints

Repository/source evidence establishes:

- Easy is a static browser-only React/Vite SPA with Dexie/IndexedDB and no backend/auth/cloud database/live synchronization;
- current backup generation produces a deeply validated canonical `easy-backup` v2 JSON;
- `exportData()` ends by creating a Blob URL and programmatically clicking an `<a download>` element; Easy does not control or verify the filesystem destination after that browser download starts;
- existing restore accepts a user-selected JSON, performs D-017 preflight and uses D-018 checkpointed verified atomic Dexie replacement;
- direct store evidence identifies the operating device only as a **PC**; it does **not** identify a browser family/version or prove support for a permission-based native file-system API;
- therefore a browser-specific file-handle API cannot be the sole baseline mechanism without adding an unsupported environment assumption.

The web application also cannot prove that an OS/provider synchronization client has completed remote upload unless Easy introduces an external provider API/integration. The current requirement does not mandate such provider acknowledgment or a formal remote-copy SLA.

## 3. Candidate comparison

### A. Backup-age reminder / visibility only

**Decision: rejected as the recovery mechanism.**

A reminder reduces forgetting but does not create or move an independently durable copy. If the downloaded JSON stays only on the operating PC, the confirmed failure mode remains. Age visibility is useful only as part of a mechanism that also establishes an off-device path.

### B. Existing backup v2 + synchronized local download destination + <=24h freshness guard

**Decision: SELECTED.**

Keep D-017 backup v2 and D-018 restore unchanged. Configure the browser/PC once so backup downloads land in a local folder automatically synchronized off-device by the operating system/provider. **Google Drive for desktop** is the accepted current-store instance. Add an Easy-level freshness guard so normal data-changing work cannot silently continue after the locally tracked recovery-copy export age reaches 24 hours.

This is the smallest fit-for-purpose mechanism because it:

- reuses the already validated `easy-backup` v2 artifact;
- keeps the working database local Dexie V4;
- removes the recurring manual step of remembering to move/upload the JSON after export;
- supports a local convenience file and an off-device Drive-backed copy through the same synchronized folder once the provider syncs it;
- preserves manual restore on another computer using the existing preflight/atomic restore path;
- does not depend on an unproven browser-specific native file-system API;
- requires no Easy account system, Google OAuth, Drive API, backend, cloud database or live synchronization.

Operational prerequisite:

1. configure the browser backup/download destination to a local folder covered by Google Drive synchronization or another explicitly accepted synchronized provider folder;
2. perform one setup verification by exporting a backup and confirming that the file appears in Drive outside the local-PC-only context;
3. keep the synchronization client operational as part of store-PC setup.

Easy cannot independently attest provider-side upload completion under this mechanism. A future requirement for provider-acknowledged durability or formal remote-copy SLA would require this decision and D-016 to be reconsidered.

### C. Permission-based repeated writes through a browser file-system handle

**Decision: not selected as the baseline.**

It could reduce clicks on supported browsers, but the store browser family/version is not evidenced, permission persistence/re-authorization creates an additional operational failure mode, and off-device durability would still rely on the OS/provider synchronization layer. It may be reconsidered only as progressive enhancement after direct browser/environment evidence.

### D. Direct Google Drive API/OAuth upload from Easy

**Decision: not selected.**

It would require a Google Cloud/OAuth application, token/permission handling, origin/security assessment and an explicit external-provider integration contract. The store accepted Drive as a destination; it did not require direct Drive API integration. The accepted target can be met with the smaller local-first mechanism. The Google account connected to ChatGPT is not an Easy credential.

### E. Backend/cloud database/live synchronization

**Decision: rejected for current P9-S2.**

No concurrent-operator, live multi-device, person-level access, provider-operated remote recovery or trusted-server requirement was proven. Introducing centrally hosted working persistence would exceed the accepted recovery need and reopen D-016 without a proven trigger.

## 4. D-016 disposition

**KEEP D-016.**

No direct requirement proved a D-016 reopen trigger. The selected mechanism keeps the live dataset in Dexie V4 and uses the existing logical backup artifact through an operator-controlled/OS-synchronized local folder. Google Drive is an external backup destination through the PC synchronization layer, not Easy's database, authentication system or live-state synchronization service.

D-017 and D-018 remain unchanged.

## 5. D-024 selected mechanism contract

Canonical selected mechanism:

**Synchronized recovery-copy folder + 24-hour freshness guard.**

Required behavior for the later implementation slice:

1. Preserve `easy-backup` v2 generation/preflight and D-018 restore semantics.
2. Provide a one-time setup flow/checklist explaining that the browser backup destination must be a local folder synchronized off-device; Google Drive for desktop is the accepted current-store destination.
3. Require one setup verification that an exported backup is visible in Drive outside the local-PC-only context before the operator marks external backup as configured.
4. Persist only local recovery-health metadata; do **not** add a Dexie schema version or alter the backup envelope solely for freshness tracking.
5. Treat missing/cleared recovery-health metadata fail-safe as `unknown/due`, never as fresh.
6. Show the last recovery-copy export time and a clear global health state.
7. Warning before expiry may use a non-contractual threshold, but it must not redefine the accepted **24-hour** boundary.
8. At **24 hours**, require a new backup export before normal data-changing operation can continue. Backup/Restore must remain reachable so recovery is never blocked by missing or stale local metadata.
9. After Easy initiates the validated backup download, show the generated filename/time and refresh local recovery-health state. The UI must state that Easy confirms backup generation/download initiation, not provider-side Drive acknowledgment.
10. Keep manual export available for additional convenience copies.
11. Do not introduce Google OAuth/Drive API, backend/authentication, cloud database, live synchronization or a browser-specific file-system API in the baseline implementation.

## 6. Bounded implementation slice

Next bounded implementation slice:

**P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow.**

Authorized runtime scope:

- backup/recovery UI and copy explaining synchronized-folder setup;
- local recovery-health metadata, with no Dexie V5;
- global due/overdue visibility integrated with the current application shell;
- a 24-hour overdue gate for normal data-changing operation while keeping Backup/Restore reachable;
- reuse/refactor of the existing validated `exportData()` path only as necessary to return/display export metadata and update local recovery-health state;
- tests for first-run/unknown state, warning/24h boundary, export refresh, Backup/Restore escape path and preservation of D-017/D-018 behavior;
- full D-019 validation.

Explicitly out of scope:

- Google Drive API/OAuth;
- backend/auth/cloud database/live synchronization;
- File System Access API as a required path;
- Dexie schema migration or `easy-backup` envelope/version change;
- provider-side sync-status verification;
- P9-S3/P9-S4/P9-S5 work.

## 7. Accepted validation/integration

Persistent Critical QA run **`32177687434`**, job **`95843265579`** — **PASS** on PR #37 merge ref `79552f7912307db88272e075b2320cade02f6f17`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #37 was squash-merged into `develop` as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`. The validated merge ref and integrated commit share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`, proving that the integrated decision content is exactly the content accepted by D-019.

No runtime was changed in the decision slice. D-024 is now the canonical recovery-mechanism decision. `NEXT_ACTION` may advance only to P9-S2-I1.