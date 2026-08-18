# Easy V2 — P9-S2 Recovery Mechanism Decision

**Status:** `IN_REVIEW` — comparison complete; decision requires D-019 validation/integration  
**Date:** 2026-08-18  
**Scope:** mechanism comparison/decision only; no runtime implementation

## 1. Accepted target entering this decision

This decision uses only the direct recovery target already accepted in `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md`:

- newest usable off-device recovery copy: **<= 24 hours** old;
- operator-run manual restore on **any computer**: acceptable;
- Easy has **daily demand**; multi-day recovery is incompatible, but no numeric hour-based RTO is invented;
- **Google Drive**: acceptable durable destination;
- local PC file: acceptable convenience copy;
- provider-operated remote recovery: not mandatory.

D-016/D-017/D-018 remain authoritative entering the comparison.

## 2. Current implementation and environment constraints

Repository/source evidence establishes:

- Easy is a static browser-only React/Vite SPA with Dexie/IndexedDB and no backend/auth/cloud database/live synchronization;
- current backup generation already produces a deeply validated canonical `easy-backup` v2 JSON;
- `exportData()` ends by creating a Blob URL and programmatically clicking an `<a download>` element; Easy does not control or verify the filesystem destination after that browser download starts;
- existing restore already accepts a user-selected JSON, performs D-017 preflight and uses D-018 checkpointed verified atomic Dexie replacement;
- direct store evidence identifies the operating device only as a **PC**; it does **not** identify a browser family/version or prove support for a permission-based native file-system API;
- therefore a browser-specific file-handle API cannot be the sole baseline mechanism without adding a new unsupported environment assumption.

The web application also cannot prove that an OS/provider synchronization client has completed remote upload unless Easy introduces an external provider API/integration. The current requirement does not mandate such a provider acknowledgment/SLA.

## 3. Candidate comparison

### A. Backup-age reminder / visibility only

**Description:** keep the current download behavior and add age/status reminders.

**Fit:** rejected as the recovery mechanism.

Why:

- reduces forgetting but does not create or move an independently durable copy;
- preserves the exact current failure mode if the operator dismisses/ignores the reminder or leaves the downloaded JSON only on the operating PC;
- cannot by itself satisfy the accepted off-device boundary.

Age visibility remains useful as part of a selected mechanism, not as the mechanism itself.

### B. Existing backup v2 + synchronized local download destination + <=24h freshness guard

**Description:** keep the existing D-017 backup file and D-018 restore path. Configure the browser/PC once so Easy backup downloads land in a local folder automatically synchronized off-device by the operating system/provider. Google Drive for desktop is the accepted current-store instance. Add an Easy-level freshness guard so the operator cannot unknowingly continue normal data-changing work once the external-copy export age reaches 24 hours.

**Fit:** **SELECTED.**

Why it is the smallest fit-for-purpose mechanism:

- uses the already validated `easy-backup` v2 artifact; no backup format/schema migration is needed;
- keeps the working database local Dexie V4;
- removes the recurring manual step of remembering to move/upload the JSON after export;
- the synchronized folder is simultaneously a local file on the PC and an off-device Drive-backed destination once the provider syncs it;
- restore on another computer remains the already accepted manual flow: obtain the newest JSON from Drive, preflight it and restore atomically;
- relies on the existing broadly portable browser download path rather than an unproven browser-specific native file-system API;
- requires no Easy account system, Google OAuth, Drive API, backend, cloud database or live synchronization.

Operational prerequisite:

1. configure the browser's backup/download destination to a folder covered by the PC's Google Drive synchronization (or another explicitly accepted synchronized provider folder);
2. perform one setup verification by exporting a test/current backup and confirming that the file appears in Google Drive outside the local PC context;
3. keep the synchronization client operational as part of store PC setup.

Easy cannot independently attest remote provider upload under this mechanism. If future requirements demand provider-acknowledged durability or a formal remote-copy SLA, that would be new evidence and the mechanism/D-016 decision must be reconsidered.

### C. Permission-based repeated writes through a browser file-system handle

**Description:** ask the operator to choose a synchronized file/folder and retain a browser file handle so Easy can rewrite snapshots more directly.

**Fit:** not selected as the baseline.

Why:

- could further reduce clicks on browsers that support the required file-system/permission model;
- however the actual store browser family/version is not evidenced;
- permission persistence/re-authorization becomes a new operational failure mode;
- making this the sole path would introduce a browser-capability assumption absent from current requirements;
- it is larger than B while still relying on the same external OS/provider sync for off-device durability.

It may be reconsidered later only as progressive enhancement after direct browser/environment evidence.

### D. Direct Google Drive API/OAuth upload from Easy

**Description:** authorize Easy against Google Drive and upload backup snapshots directly.

**Fit:** not selected.

Why:

- can provide a stronger provider-side upload path and remove dependence on Drive-for-desktop configuration;
- requires a Google Cloud/OAuth application, token/permission handling, origin/security assessment and an explicit external-provider integration contract;
- the store said Drive is acceptable, not that direct Drive API integration is mandatory;
- the accepted target can be met with the smaller local-first synchronized-folder mechanism;
- introducing OAuth/provider integration voluntarily would outrun D-016's current evidence boundary.

The Google account connected to ChatGPT is not an Easy credential and is irrelevant to this decision.

### E. Backend/cloud database/live synchronization

**Description:** move working persistence or continuous backups to a centrally hosted service.

**Fit:** rejected for current P9-S2.

Why:

- no concurrent-operator, live multi-device, person-level access, provider-operated remote recovery or trusted-server requirement was proven;
- far larger than the accepted recovery target requires;
- would reopen D-016 without a proven trigger.

## 4. D-016 disposition

**KEEP D-016.**

No new direct requirement proves a D-016 reopen trigger. The selected mechanism keeps the live dataset in Dexie V4 and uses the existing logical backup artifact copied through an operator-controlled/OS-synchronized local folder. Google Drive acts as an external backup destination through the PC synchronization layer, not as Easy's database, account system or live state synchronization service.

D-017 and D-018 remain unchanged.

## 5. Selected mechanism contract

Canonical selected mechanism name:

**Synchronized recovery-copy folder + 24-hour freshness guard.**

Required behavior for the later implementation slice:

1. Preserve `easy-backup` v2 generation/preflight and D-018 restore unchanged.
2. Provide a one-time setup flow/checklist explaining that the browser backup destination must be a local folder synchronized off-device; Google Drive for desktop is the accepted current-store destination.
3. Require one setup verification that an exported backup is visible in Drive outside the local-PC-only context before the operator marks external backup as configured.
4. Persist only local recovery-health metadata; do **not** add a Dexie schema version or alter the backup envelope solely for freshness tracking.
5. Treat missing/cleared recovery-health metadata fail-safe as `unknown/due`, never as fresh.
6. Show the last recovery-copy export time and a clear global health state.
7. Warn before expiry (implementation may use a non-contractual warning threshold such as 20 hours) without redefining the accepted 24-hour boundary.
8. At **24 hours**, require a new backup export before allowing normal data-changing operation to continue. Restore/recovery access must remain available so a replacement PC can recover even when local freshness metadata is absent.
9. After the operator initiates the validated backup download, show the generated filename/time and return the local freshness state to current. The UI must state that Easy confirms backup generation/download initiation, not provider-side Drive acknowledgment.
10. Keep the existing manual export available for additional convenience copies.
11. Do not introduce Google OAuth/Drive API, backend/authentication, cloud database, live synchronization or a browser-specific file-system API in the baseline implementation.

The synchronized-folder setup and the Drive client are operating-environment dependencies. A later formal remote-durability SLA would require a different decision because Easy cannot prove provider sync completion without provider integration.

## 6. Bounded implementation slice authorized after this decision is accepted

Proposed next slice: **P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow.**

Allowed runtime scope only after this decision passes D-019 and integrates:

- backup/recovery UI and copy explaining synchronized-folder setup;
- local recovery-health metadata (for example a namespaced `localStorage` record; no Dexie V5);
- global due/overdue visibility integrated with the current layout;
- a 24-hour overdue gate for normal data-changing operation while keeping Backup/Restore reachable;
- reuse/refactor of the existing validated `exportData()` path only as necessary to return/display export metadata and update local recovery-health state;
- tests for first-run/unknown state, warning/24h boundary, export refresh, Backup/Restore escape path and preservation of D-017/D-018 behavior;
- D-019 full validation.

Explicitly out of scope:

- Google Drive API/OAuth;
- backend/auth/cloud database/live synchronization;
- File System Access API as a required path;
- Dexie schema migration or `easy-backup` envelope/version change;
- provider-side sync-status verification;
- P9-S3/P9-S4/P9-S5 work.

## 7. Decision acceptance rule

This comparison itself changes documentation only. No selected mechanism is implemented here.

The decision becomes canonical only after this slice passes the full D-019 `npm run qa:critical` gate and integrates into `develop`. After accepted integration, canonical documentation may record a new accepted decision and advance `NEXT_ACTION` only to P9-S2-I1.