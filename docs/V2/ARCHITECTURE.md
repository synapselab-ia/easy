# Easy V2 — Architecture Baseline

**Status:** verified through completed P9-S2 recovery durability  
**Integration target:** `develop`  
**Date:** 2026-08-18

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V4** with `items`, `resellers` and `transactions`.

Migration path remains V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`. P5 through completed P9-S2 add no Dexie V5.

Recovery-health state is separate local control metadata in namespaced `localStorage` (`easy.recoveryHealth.v1`). It is not business persistence, is not part of the Dexie schema and is not serialized into `easy-backup` v2.

## Persisted recovery invariants

The logical recovery contract preserves all current fields and relationships:

- Item: `id`, `name`, `basePrice`, `isActive`, `createdAt`, `updatedAt`;
- Reseller: `id`, `name`, `phone`, `email`, `notes`, `isActive`, `createdAt`, `updatedAt`;
- Transaction: `id`, `resellerId`, `type`, item snapshot fields, `totalPrice`, `observation`, `reversal`, `correction`, `occurredAt`, `createdAt`;
- P2 reversal/correction links and audit metadata;
- P3 financial occurrence, reversed-zero effect, statements and FIFO-derived debt semantics.

## Backup/interchange contract

D-017 defines `easy-backup` version 2 as the canonical logical interchange format, distinct from Dexie schema version:

```text
format = "easy-backup"
version = 2
exportedAt = ISO timestamp
source.database = "ResellerManagerDB"
source.schemaVersion = 4
data.items[]
data.resellers[]
data.transactions[]
```

New exports self-validate before download. Legacy `version: 1` JSON remains supported by in-memory normalization before the same deep validator runs.

P9-S2 did not alter this envelope. `exportData()` now additionally returns local call metadata `{ filename, exportedAt }` after initiating the same validated v2 browser download; that return value is not a backup-format change.

## Preflight and atomic recovery boundary

`preflightBackupPayload()` / `preflightBackupText()` / `preflightBackupFile()` validate restore input before mutation. `restoreService.ts` then creates a validated downloadable `easy-checkpoint-v2-*` checkpoint and replaces all three tables inside one Dexie `rw` transaction. Restored rows are validated and compared to the expected canonical projection before commit. Any write/verification error throws inside the transaction and rolls the replacement back.

D-018 remains authoritative and unchanged by P9-S2. Restore is deliberately outside the recovery-freshness write gate so recovery remains possible from an unknown or overdue installation.

## D-024 recovery durability architecture — implemented

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** while explicitly keeping D-016.

### Recovery-copy data path

```text
Dexie V4 live dataset
  -> validated easy-backup v2 export
  -> browser download
  -> local folder configured for OS/provider synchronization
  -> off-device provider copy when the sync client completes synchronization
```

Google Drive for desktop is the accepted current-store instance of the synchronized-folder layer. It is an operating-environment dependency, not a new Easy persistence tier.

The recovery path remains:

```text
replacement computer/browser
  -> obtain newest acceptable backup JSON from Drive
  -> D-017 preflight
  -> D-018 checkpoint + verified atomic Dexie restore
```

### Local recovery-health control plane

P9-S2-I1 implements recovery health in `src/services/recoveryHealth.ts` using namespaced local metadata only.

Implemented states:

- `unknown` — metadata absent/corrupt or otherwise unusable;
- `due` — setup/export requirements are incomplete or invalid for freshness;
- `current` — verified setup and export age below warning threshold;
- `warning` — export age at least 20 hours but below the accepted 24-hour boundary;
- `overdue` — export age at least 24 hours.

The 20-hour threshold is an implementation warning only. The accepted contract boundary remains exactly **24 hours**.

Fail-safe rules:

- missing/corrupt metadata never implies freshness;
- synchronized-folder setup is not considered verified until an export exists and the operator confirms the file was observed in Drive outside the local-PC-only context;
- future/invalid timestamps fail due rather than fresh;
- `unknown`, `due` and `overdue` block normal data-changing mutations;
- `warning` and `current` allow normal writes;
- all reads and Backup/Restore remain available.

### Mutation enforcement

Item, reseller and transaction mutation hooks call the centralized `assertRecoveryWriteAllowed()` guard before normal business writes. This protects creation, updates, archive/reactivation/deletion where supported, transaction creation, reversal and guided replacement correction without scattering freshness logic across individual screens.

The shell-level `RecoveryHealthBanner` exposes global health, the latest export timestamp and navigation to Backup/Restore. The shell is visibility/navigation; enforcement remains in the centralized mutation boundary so bypassing a screen control does not bypass the recovery policy.

### Synchronized-folder workflow

The Backup/Restore page implements the one-time operating procedure:

1. configure the browser's backup download destination inside a locally synchronized provider folder;
2. export the validated v2 backup;
3. verify outside the local-PC-only context that the exported file appears in Drive;
4. explicitly confirm that verification in Easy.

After validated download initiation, Easy records the exact generated filename and export timestamp. Easy does **not** inspect or attest provider-side synchronization completion.

### Explicit architecture exclusions

P9-S2 introduced none of the following:

- Google Drive API/OAuth or token handling;
- backend/authentication;
- cloud database or centrally hosted working state;
- live multi-device synchronization;
- provider-side synchronization-status verification;
- File System Access API as a required baseline capability;
- Dexie schema migration or backup-envelope version change.

A future direct requirement for provider-acknowledged durability, formal remote recovery SLA, concurrency, live shared state, person-level access/authorship, trusted server integration or incompatible security policy must be evaluated as a possible D-016 reopen trigger.

## Repository-wide QA architecture

D-019 defines one critical command as the repository gate:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

Current tools:

- ESLint / typescript-eslint / React hooks / React refresh;
- Vitest in jsdom with browser API harness;
- Playwright Chromium against the Vite dev server at `/easy/`;
- TypeScript build plus Vite production build.

CI uses Node 22 and `npm ci`. `.github/workflows/ci.yml` runs Critical QA for pull requests targeting `develop` or `main`, pushes to `develop`, and manual dispatch.

Publication from `main` retains the strict dependency chain:

```text
main push
  -> quality: npm run qa:critical
  -> build: npm run build + Pages artifact
  -> deploy: GitHub Pages
```

## Current accepted QA baseline

P9-S2-I1's accepted Critical QA is run **`32180250834`**, job **`95851336506`**:

- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

PR #39 validated merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a` and integrated squash `7e20d50be357d0179adf0afe4894ddfebbeb2eb9` share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

Known warning/test-harness/dependency debt remains visible and non-blocking only when objective commands pass.

## Boundary entering P9-S3

P9-S3 is contract work before category persistence/runtime changes. The current Dexie V4 `Item` model and D-017 backup envelope contain no category dimension, while order transactions preserve historical item snapshots. P9-S3 must therefore define category lifecycle, assignment, historical transaction/report semantics, migration and backup compatibility before authorizing schema/UI/reporting implementation. P9-S3 must preserve D-016/D-017/D-018/D-019/D-024 and the completed recovery guard.