# Easy V2 — Architecture Baseline

**Status:** verified through completed P6  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V4** with `items`, `resellers` and `transactions`.

Migration path remains V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`. P5/P6 add no Dexie V5.

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

New exports self-validate before download. Legacy `version: 1` JSON remains supported by in-memory normalization (`isActive -> true` when missing; `occurredAt -> createdAt` when missing) before the same deep validator runs.

## Preflight and atomic recovery boundary

`preflightBackupPayload()` / `preflightBackupText()` / `preflightBackupFile()` validate restore input before mutation. `restoreService.ts` then creates a validated downloadable `easy-checkpoint-v2-*` checkpoint and replaces all three tables inside one Dexie `rw` transaction. Restored rows are validated and compared to the expected canonical projection before commit. Any write/verification error throws inside the transaction and rolls the replacement back.

This remains the authoritative P5 local recovery path; P6 does not change schema, persistence or financial semantics.

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

- ESLint 9 / typescript-eslint / React hooks / React refresh;
- Vitest in jsdom with `vitest.setup.ts` browser API harness;
- Playwright Chromium against the Vite dev server at `/easy/`;
- TypeScript build plus Vite production build.

CI uses Node 22 and `npm ci` for reproducible dependency installation. Playwright Chromium is installed explicitly before the E2E gate.

### Integration workflow

`.github/workflows/ci.yml` runs Critical QA for:

- pull requests targeting `develop` or `main`;
- pushes to `develop`;
- manual dispatch.

This workflow is the persistent repository-wide quality signal for V2 integration.

### Publication workflow

`.github/workflows/deploy.yml` now has a strict dependency chain:

```text
main push
  -> quality: npm run qa:critical
  -> build: npm run build + Pages artifact
  -> deploy: GitHub Pages
```

`build` has `needs: quality`; `deploy` has `needs: build`. A failing critical suite therefore prevents the application artifact from being published.

## P6 baseline reconciliation

The pre-change repository-wide baseline was intentionally captured before correcting expectations:

- lint: 81 errors;
- Vitest: 10 failed / 149 passed;
- Playwright: 10 failed / 3 passed;
- build: pass.

Most failures were stale harness/tooling expectations rather than product regressions: missing provider/router context, incomplete child mocks, missing jsdom browser APIs, ambiguous/obsolete selectors and a PDF E2E expectation that contradicted D-015 zero-movement statement semantics.

One real integration defect was discovered: `useSearch()` already produces the externally filtered command-center result set, but `cmdk` applied a second internal filter. `CommandDialog` now sets `shouldFilter={false}` so the Dexie search result set is authoritative.

The reconciled persistent gate passes with:

- ESLint: 0 blocking errors / 80 recorded warnings;
- Vitest: 39 files / 159 tests passing;
- Playwright Chromium: 13/13 passing;
- production build passing.

Functional persistent gate: **`32064801009` — PASS**.

## Lint/warning policy

P6 does not define “green” as “zero warning output”. Objective lint errors remain blocking. Existing debt in `no-explicit-any`, `react-hooks/set-state-in-effect` and `react-refresh/only-export-components` remains visible as warnings so later cleanup can be intentional rather than a behavior-changing refactor performed solely to satisfy tooling.

Known non-blocking test stderr (for example React `act(...)` and mocked-select DOM warnings) is similarly recorded as harness debt. These warnings do not bypass any failing test or build result.

## Boundary entering P7

P7 may refine incomplete/high-friction operator UX only after evidence-based prioritization. It must preserve P1–P6 behavior/recovery/QA contracts, must not weaken the critical gate, and must not introduce backend/auth/cloud or new P8/P9 business modules.
