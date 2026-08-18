# Easy V2 — P9-S2 Recovery Mechanism Decision

**Status:** `ACCEPTED / IMPLEMENTED / DONE`  
**Date:** 2026-08-18  
**Scope:** accepted recovery mechanism plus bounded P9-S2-I1 implementation closure

## 1. Accepted target

The direct recovery target accepted in `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` remains:

- newest usable off-device recovery copy: **<= 24 hours** old;
- operator-run manual restore on **any computer**: acceptable;
- Easy has **daily demand**; multi-day recovery is incompatible, but no numeric hour-based RTO is invented;
- **Google Drive**: acceptable durable destination;
- local PC file: acceptable convenience copy;
- provider-operated remote recovery: not mandatory.

D-016/D-017/D-018 remain authoritative.

## 2. Decision basis and environment constraints

Repository/source evidence establishes:

- Easy is a static browser-only React/Vite SPA with Dexie/IndexedDB and no backend/auth/cloud database/live synchronization;
- backup generation produces a deeply validated canonical `easy-backup` v2 JSON;
- browser download does not let Easy prove the final filesystem/provider synchronization state;
- restore performs D-017 preflight and D-018 checkpointed verified atomic Dexie replacement;
- the actual store browser family/version is not directly evidenced, so a browser-specific file-handle API cannot be the required baseline;
- the web application cannot prove provider synchronization completion without external provider integration, and the accepted target does not require provider acknowledgment or a formal remote-copy SLA.

## 3. Candidate comparison

### A. Backup-age reminder / visibility only

**Rejected as the recovery mechanism.** A reminder reduces forgetting but does not create or move an independently durable copy. Age visibility is useful only as part of a mechanism that also establishes an off-device path.

### B. Existing backup v2 + synchronized local download destination + <=24h freshness guard

**SELECTED and implemented.**

The existing D-017 backup v2 and D-018 restore path remain unchanged. The browser/PC is configured so backup downloads land in a local folder synchronized off-device by the OS/provider. **Google Drive for desktop** is the accepted current-store instance. Easy tracks local recovery-copy export freshness so normal data-changing work cannot silently continue after the accepted 24-hour boundary.

This remains the smallest fit-for-purpose mechanism because it:

- reuses the validated `easy-backup` v2 artifact;
- keeps the live database local Dexie V4;
- removes the recurring manual move/upload step once the download destination is correctly configured;
- preserves manual restore on another computer;
- does not depend on an unproven browser-specific native file-system API;
- requires no Easy account, Google OAuth, Drive API, backend, cloud database or live synchronization.

### C. Permission-based browser file-system handle

**Not selected as baseline.** Browser support is not directly evidenced, permission persistence adds an operational failure mode, and off-device durability would still rely on OS/provider synchronization.

### D. Direct Google Drive API/OAuth

**Not selected.** It would add credential/token/provider integration that current evidence does not require. The Google account connected to ChatGPT is not an Easy credential.

### E. Backend/cloud database/live synchronization

**Rejected for P9-S2.** No concurrent-operator, live multi-device, person-level access, provider-operated remote recovery or trusted-server requirement was proven.

## 4. D-016 disposition

**KEEP D-016.**

The live dataset remains Dexie V4. Google Drive is an external durable destination reached through an operator-configured synchronized local folder, not Easy's database, authentication system or live-state synchronization service.

D-017 and D-018 remain unchanged.

## 5. D-024 selected mechanism contract

Canonical mechanism:

**Synchronized recovery-copy folder + 24-hour freshness guard.**

Accepted requirements:

1. Preserve `easy-backup` v2 generation/preflight and D-018 restore semantics.
2. Explain one-time setup: browser backup destination must be a local folder synchronized off-device; Google Drive for desktop is the accepted current-store instance.
3. Require one setup verification that an exported backup is visible in Drive outside the local-PC-only context before marking external backup configured.
4. Persist only local recovery-health metadata; no Dexie version or backup-envelope change solely for freshness tracking.
5. Treat missing/cleared/corrupt recovery-health metadata fail-safe as `unknown/due`, never fresh.
6. Show last recovery-copy export time and clear global health.
7. A warning threshold may precede expiry but must not redefine the accepted **24-hour** boundary.
8. At **24 hours**, require a new backup export before normal data-changing operation can continue. Backup/Restore must remain reachable.
9. After validated backup download initiation, expose the generated filename/time and refresh local recovery-health state. Easy must not claim provider-side Drive acknowledgment.
10. Keep manual export available.
11. Do not introduce Google OAuth/Drive API, backend/authentication, cloud database, live synchronization or a required browser-specific file-system API.

## 6. P9-S2-I1 implemented behavior

P9-S2-I1 implemented the bounded D-024 slice without expanding architecture.

### Local recovery-health metadata

Namespaced key: `easy.recoveryHealth.v1`.

Metadata is local control/UI state only and records setup verification plus the last generated backup filename/export timestamp. It is not part of Dexie and is not part of the recovery artifact.

Implemented health states:

- `unknown` — local metadata absent/corrupt;
- `due` — setup/export requirements incomplete or invalid for freshness;
- `current` — verified setup and fresh export below warning threshold;
- `warning` — export age at least 20 hours but below 24 hours;
- `overdue` — export age at least 24 hours.

The 20-hour threshold is an implementation warning only. **24 hours remains the sole accepted hard freshness boundary.**

### Write guard

`assertRecoveryWriteAllowed()` is the centralized boundary for normal item, reseller and transaction mutations. Unknown/due/overdue state blocks those writes. Current/warning state permits them.

Read-only use remains available. D-017/D-018 Backup/Restore remains reachable and is not gated, including on a replacement computer with absent local recovery metadata.

### Export integration

`exportData()` still generates and self-validates the same `easy-backup` v2 envelope. It now returns the exact `{ filename, exportedAt }` associated with the initiated browser download. P9-S2-I1 uses that return value to update local recovery health after download initiation; this is not a backup-format change.

### Synchronized-folder setup

The Backup/Restore UI instructs the operator to:

1. configure the browser download destination inside the synchronized local folder;
2. export a validated v2 backup;
3. verify that file in Drive outside the local-PC-only context;
4. explicitly confirm that verification in Easy.

This confirmation records the operator's completed setup check. Easy does **not** query or attest provider-side synchronization status.

### Global visibility

The application shell shows recovery health and the most recent export time with a direct path to Backup/Restore.

## 7. Explicit exclusions preserved

P9-S2-I1 did not introduce:

- Google Drive API/OAuth;
- backend/auth/cloud database/live synchronization;
- File System Access API as a required path;
- Dexie schema migration;
- `easy-backup` envelope/version changes;
- provider-side sync-status verification;
- P9-S3/P9-S4/P9-S5 behavior.

## 8. Validation and integration

### Decision slice

Persistent Critical QA run `32177687434`, job `95843265579`, passed on PR #37. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; validated merge ref and integrated commit share tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

### Implementation slice

The first PR #39 run `32179815390`, job `95849949295`, found a new E2E harness interaction only: after the recovery guard correctly rejected a mutation, the dialog remained open and covered the global banner. Lint and all Vitest tests had passed; no runtime behavior change was required. The test was changed to dismiss the dialog before exercising the escape route.

Accepted Persistent Critical QA run **`32180250834`**, job **`95851336506`** — **PASS** on PR #39 merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

PR #39 was squash-merged into `develop` as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`. The validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

P9-S2 is complete. The next canonical work is P9-S3 category data/reporting **contract only**; no category runtime implementation is authorized until that contract is accepted.