# Easy V2 — Architecture Baseline

**Status:** verified through accepted P10-S1 pre-cutover contract  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

P9 introduced no additional schema beyond V5 and no change to the logical backup-envelope version.

## Category lifecycle and reporting

D-025 is fully implemented:

- stable category identity and reversible lifecycle;
- active-category item assignment;
- immutable new-order `categoryId + categoryName` snapshots;
- lossless legacy unclassified rows;
- read-only effective-order category reporting at `/category-report` using `occurredAt` and transaction-time category identity.

Reporting never allocates payments/signals/balance/FIFO debt to categories.

## D-026 correction architecture — implemented/integrated

P2 / D-012 / D-013 provide the audit topology: the original row is not destructively rewritten, correction requires a reason, and replacement creation plus original reversal/linkage occur atomically.

P9-S4-I1 permits replacement business state to define reseller, target type, `occurredAt`, observation and the applicable order item/quantity/unit price or payment/signal value.

Target-shape validity, D-025 snapshot preservation/recapture, P1/D-011 active-reference rules and D-024 recovery freshness enforcement remain mandatory. No speculative inactive-reference exception was introduced.

## D-014 occurrence-date architecture

D-014 remains unchanged:

- `occurredAt` = financial/business occurrence time;
- `createdAt` = record-registration time;
- `reversal.reversedAt` = audit/reversal time.

The normal new-movement workflow initializes `Data da ocorrência` from the browser-local current date, renders it in the primary entry block, permits editing before save, converts it to `occurredAt`, and explains that registration time is saved automatically.

## Recovery/interchange invariants

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard.

D-024 recovery metadata is origin-local UI/control state. A fresh V2 browser origin may restore a backup while recovery state is absent, but normal writes remain blocked until synchronized-folder setup is verified and a fresh validated backup export establishes allowed recovery health.

## Stable→V2 transfer architecture entering P10

The stable `main` application is materially older than V2:

```text
stable main
  commit 9574e3a...
  Dexie V1
  items + resellers + transactions
  backup version 1
          |
          | explicit JSON backup/preflight/restore
          | (future cutover only; no implicit browser DB transfer)
          v
V2 candidate
  develop completed-P9 baseline 88224b9...
  Dexie V5
  categories + items + resellers + transactions
  easy-backup v2/schema5
```

IndexedDB is origin-local. A Vercel or GitHub Pages deployment on another origin does not carry the stable database with it.

V2 backup preflight already accepts the stable backup-v1 shape and normalizes it without retroactive invention:

- lifecycle fields absent in v1 normalize legacy items/resellers to active;
- absent `occurredAt` normalizes to historical `createdAt`;
- no categories or category assignments are fabricated;
- migrated legacy items remain unclassified;
- new orders remain unavailable for unclassified active items until operator classification under D-025/P1.

Actual live-data transfer is not authorized by the P10-S1 contract.

## Deployment topology entering P10

### Stable path

`main` is the stable publication branch and currently deploys to GitHub Pages on push.

The historical workflow present on current `main` performs build/deploy without the V2 D-019 quality job. The V2 `develop` version of `.github/workflows/deploy.yml` already contains the stronger eventual stable path:

```text
push main
   -> quality / npm run qa:critical
   -> build
   -> GitHub Pages deploy
```

That V2 workflow is not active on stable `main` until a future explicitly accepted publication.

### Candidate path

The connected Vercel project `easy-v2` is candidate/beta hosting only.

Repository `vercel.json` intentionally sets:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

so Vercel candidate deployments are manual rather than generated for every commit.

The latest observed READY Vercel deployment points to `develop` commit `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind completed P9. It therefore cannot be used as final P10 acceptance evidence without a later explicit refresh to an exact validated SHA.

Vercel's internal target label `production` does not redefine repository/store governance; `easy-v2` remains non-stable candidate hosting under D-027.

## P10 blocker — backup validator vs D-026

Current `backupService.validateReferences()` still carries P2-era replacement equality assumptions:

- replacement type equals original type;
- replacement order item equals original item;
- replacement category snapshot equals original snapshot;
- replacement `occurredAt` equals original `occurredAt`.

Those equalities are no longer generally valid under D-026. D-026 permits the linked replacement to change type, financial occurrence date, and order item with the correct replacement-time D-025 snapshot.

A valid supported V2 state can therefore conflict with backup self-preflight/export. P10 classifies this as a recovery/cutover blocker.

P10-S1-I1 must remove only the obsolete cross-record equality assumptions while preserving:

- bidirectional correction/reversal link integrity;
- existence of referenced original/replacement IDs;
- sane registration chronology;
- valid reseller/item/category references for each row;
- each transaction's target-type shape;
- D-025 snapshot rules applicable to the replacement itself;
- v1 and v2/schema4 migration compatibility.

No schema or backup-envelope bump is implied by this correction.

## Repository-wide QA architecture

D-019 remains mandatory:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

Known React test warnings, mocked-select DOM warnings, dependency/audit notices, Actions deprecation notices, lint warning debt and Vite large-chunk warning remain non-blocking only when objective commands pass.

Both `main` and `develop` are currently unprotected GitHub branches. Therefore D-019/PR discipline is a canonical process requirement and cannot be assumed to be enforced by branch protection during P10.

## Accepted P9 validation baseline

- P9-S4-I1: D-019 `32285620846` / `96174326588`; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.
- P9-S5: D-019 `32287018048` / `96178850066`; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`; tree `97a78d3e4d78a54ad117440c160920343513ba9f`.
- Canonical P9 closure: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

## D-027 / P10-S1 boundary

P10-S1 is a non-production pre-cutover gate:

1. keep `main` untouched;
2. do not move live-store data;
3. do not publish stable V2;
4. first fix/prove backup compatibility with D-026 under P10-S1-I1;
5. only after I1 may a manually pinned Vercel candidate use synthetic v1 data for migration/recovery rehearsal;
6. copied-live-data beta, final freeze, stable publication and production cutover require later explicit acceptance;
7. D-016 remains unchanged.

Detailed plan: `docs/V2/P10_CUTOVER_PLAN.md`.
