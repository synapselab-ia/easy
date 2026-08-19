# Easy V2 — Architecture Baseline

**Status:** verified through integrated P10-S1-I1 backup compatibility hardening  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

P9 and P10-S1-I1 introduced no additional schema beyond V5 and no change to the logical backup-envelope version.

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

P10-S1-I1 aligned recovery validation with that runtime model. The backup validator no longer requires the replacement to match the original type, item or financial occurrence date. D-025 still applies to the replacement itself:

- order→order correction keeping the same `itemId` **must preserve** the original historical category snapshot;
- order→order correction selecting a different valid item may carry that replacement item's valid category snapshot;
- order↔payment/signal type changes carry the target type's own valid shape;
- each row remains independently reference-valid.

## D-014 occurrence-date architecture

D-014 remains unchanged:

- `occurredAt` = financial/business occurrence time;
- `createdAt` = record-registration time;
- `reversal.reversedAt` = audit/reversal time.

The normal new-movement workflow initializes `Data da ocorrência` from the browser-local current date, renders it in the primary entry block, permits editing before save, converts it to `occurredAt`, and explains that registration time is saved automatically.

A D-026 replacement may carry a different `occurredAt` from the original. P10-S1-I1 now permits that supported state through backup self-preflight/export while registration chronology remains separately validated through `createdAt`.

## Recovery/interchange invariants

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard.

D-024 recovery metadata is origin-local UI/control state. A fresh V2 browser origin may restore a backup while recovery state is absent, but normal writes remain blocked until synchronized-folder setup is verified and a fresh validated backup export establishes allowed recovery health.

### Correction-pair validation after P10-S1-I1

`backupService.validateReferences()` now validates correction pairs by audit integrity rather than obsolete business-field equality:

- original/replacement IDs must exist;
- original reversal and replacement correction links must be bidirectional;
- neither side may self-reference;
- replacement registration cannot predate the original registration;
- reseller/item/category IDs referenced by each row must exist;
- each transaction must satisfy the shape of its own target type;
- same-item order replacement must preserve the original D-025 category snapshot;
- changed-item order replacement may use the new item's valid snapshot.

`exportData()` still self-preflights the generated envelope, so the same invariants govern both imported and freshly exported V2 recovery artifacts.

No schema, envelope-version or restore algorithm change was required.

## Stable→V2 transfer architecture entering rehearsal

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
  develop after P10-S1-I1
  Dexie V5
  categories + items + resellers + transactions
  easy-backup v2/schema5
```

IndexedDB is origin-local. A Vercel or GitHub Pages deployment on another origin does not carry the stable database with it.

V2 backup preflight accepts the stable backup-v1 shape and normalizes it without retroactive invention:

- lifecycle fields absent in v1 normalize legacy items/resellers to active;
- absent `occurredAt` normalizes to historical `createdAt`;
- no categories or category assignments are fabricated;
- migrated legacy items remain unclassified;
- new orders remain unavailable for unclassified active items until operator classification under D-025/P1.

P10-S1-I1 retained the existing passing backup-v1 and v2/schema4 compatibility suites. Actual live-data transfer remains unauthorized.

## Deployment topology entering P10-S1-I2

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

The latest observed READY Vercel deployment before I2 still points to `develop` commit `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind completed P9. It cannot be used as P10-S1-I2 acceptance evidence; I2 must explicitly deploy and verify an exact D-019-passing `develop` SHA.

Vercel's internal target label `production` does not redefine repository/store governance; `easy-v2` remains non-stable candidate hosting under D-027.

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

## P10-S1 contract integration proof

- D-019 run `32290159119`, job `96188851730`, validated PR #58 merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75` — 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`.
- Validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

## P10-S1-I1 integration proof

The first I1 D-019 candidate (`32292405631` / `96196002726`) correctly failed one existing P9-S3 test after category-snapshot equality had initially been removed unconditionally. That failure proved the D-025 same-item rule still had to remain and blocked integration.

The narrowed implementation passed the authoritative gate:

- D-019 run **`32292888925`**, job **`96197514379`**;
- validated PR #60 merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**, head `666e4c86df7c6328289d489db7c8eebcb714aad1`, base `a549ce79925aad0cae9e964babd28879e8ad1c15`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 53 files / 222 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- PR #60 integrated as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated/integrated tree: **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

## D-027 / P10-S1 boundary after I1

P10-S1 remains a non-production pre-cutover gate:

1. `main` remains untouched;
2. no live-store data has been moved;
3. no stable V2 publication has occurred;
4. P10-S1-I1 backup/correction compatibility is complete/integrated;
5. P10-S1-I2 is now the current bounded rehearsal and may use only an exact validated candidate plus synthetic/non-production backup-v1 data;
6. copied-live-data beta, final freeze, stable publication and production cutover require later explicit acceptance;
7. D-016 remains unchanged.

Detailed plan: `docs/V2/P10_CUTOVER_PLAN.md`.
