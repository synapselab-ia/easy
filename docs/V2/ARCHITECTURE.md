# Easy V2 — Architecture Baseline

**Status:** verified through accepted P9-S2 recovery mechanism decision  
**Integration target:** `develop`  
**Date:** 2026-08-18

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V4** with `items`, `resellers` and `transactions`.

Migration path remains V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`. P5 through the accepted P9-S2 decision add no Dexie V5.

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

## Preflight and atomic recovery boundary

`preflightBackupPayload()` / `preflightBackupText()` / `preflightBackupFile()` validate restore input before mutation. `restoreService.ts` then creates a validated downloadable `easy-checkpoint-v2-*` checkpoint and replaces all three tables inside one Dexie `rw` transaction. Restored rows are validated and compared to the expected canonical projection before commit. Any write/verification error throws inside the transaction and rolls the replacement back.

D-018 remains authoritative and unchanged by P9-S2.

## D-024 recovery durability architecture

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** while explicitly keeping D-016.

### Data path

```text
Dexie V4 live dataset
  -> existing validated easy-backup v2 export
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

### Recovery freshness boundary

The accepted store target is a newest usable off-device copy no more than **24 hours old**. P9-S2-I1 may persist local recovery-health metadata and use it to expose due/overdue status and gate normal data-changing operation at 24 hours.

Recovery-health metadata is control/UI metadata only:

- it must not require Dexie V5;
- it must not change `easy-backup` v2;
- missing/cleared metadata is fail-safe `unknown/due`, never evidence of freshness;
- Backup/Restore remains reachable even when freshness is unknown or overdue.

Easy may confirm that validated backup generation and browser download initiation occurred. Under D-024 it **cannot claim provider-side synchronization completed**, because no provider API/status integration is present.

### Explicit architecture exclusions

D-024 does not authorize:

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

Known warnings/test-harness/dependency debt remains visible and non-blocking only when objective commands pass. The accepted P9-S2 mechanism decision passed D-019 as run `32177687434`, job `95843265579`: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests PASS, 15/15 Playwright PASS and production build PASS.

## Boundary entering P9-S2-I1

P9-S2-I1 may implement only the D-024 recovery-copy freshness guard and synchronized-folder workflow. It must preserve D-016/D-017/D-018, must not introduce provider integration or persistence migration, and must pass full D-019 before integration.