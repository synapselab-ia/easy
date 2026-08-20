# Easy V2 — Architecture Baseline

**Status:** verified through completed P10-S1 non-production rehearsal  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

P9 and P10-S1 introduced no additional schema beyond V5 and no change to the logical backup-envelope version.

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

Target-shape validity, D-025 snapshot preservation/recapture, P1/D-011 active-reference rules and D-024 recovery freshness enforcement remain mandatory.

P10-S1-I1 aligned recovery validation with that runtime model:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
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

A D-026 replacement may carry a different `occurredAt` from the original. P10-S1-I1 permits that supported state through backup self-preflight/export while registration chronology remains separately validated through `createdAt`.

## Recovery/interchange invariants

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard.

D-024 recovery metadata is origin-local UI/control state. A fresh V2 browser origin may restore a backup while recovery state is absent, but normal writes remain blocked until synchronized-folder setup is verified and a fresh validated backup export establishes allowed recovery health.

### Correction-pair validation after P10-S1-I1

`backupService.validateReferences()` validates correction pairs by audit integrity rather than obsolete business-field equality:

- original/replacement IDs must exist;
- original reversal and replacement correction links must be bidirectional;
- neither side may self-reference;
- replacement registration cannot predate the original registration;
- reseller/item/category IDs referenced by each row must exist;
- each transaction must satisfy the shape of its own target type;
- same-item order replacement must preserve the original D-025 category snapshot;
- changed-item order replacement may use the new item's valid snapshot.

`exportData()` self-preflights the generated envelope, so the same invariants govern both imported and freshly exported V2 recovery artifacts.

No schema, envelope-version or restore-algorithm change was required.

## Stable→V2 transfer architecture — synthetically rehearsed

The stable `main` application remains materially older than V2:

```text
stable main
  commit 9574e3a...
  Dexie V1
  items + resellers + transactions
  backup version 1
          |
          | explicit JSON backup/preflight/restore
          | (real copy still requires later accepted gate)
          v
V2 candidate
  tested develop SHA 2b6c1e5...
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

P10-S1-I2 proved this path in a deployed browser using synthetic data only. The rehearsal restored a representative v1 fixture, verified expected counts/normalization, proved D-024 blocking and recovery setup, classified migrated items, exercised a new order plus D-026 changed-item/date correction, exported V2, restored that V2 backup into a disposable fresh browser context and re-exported identical business data.

This proof establishes mechanism compatibility only. No actual store backup has been exported, imported or reconciled.

## Deployment topology after P10-S1

### Stable path

`main` remains the stable publication branch and currently deploys the historical application to GitHub Pages on push.

The historical workflow present on current `main` performs build/deploy without the V2 D-019 quality job. The V2 `develop` version of `.github/workflows/deploy.yml` already contains the stronger eventual stable path:

```text
push main
   -> quality / npm run qa:critical
   -> build
   -> GitHub Pages deploy
```

That V2 workflow is not active on stable `main` until a future explicitly accepted publication.

### Candidate path

The connected Vercel project `easy-v2` remains candidate/beta hosting only.

Repository `vercel.json` intentionally sets:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

so candidate deployments remain manual/bounded rather than generated for every commit.

P10-S1-I2 verified READY deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`** as exact Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, whose integrated tree is **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.

The immutable deployment URL `easy-v2-lvbggu5ji-synapselabia-8285s-projects.vercel.app` requires Vercel SSO for `/backup`. Vercel metadata attaches public alias `easy-v2-tau.vercel.app` to that exact deployment, so the alias was used only as browser access while deployment ID + Git SHA remained the identity proof.

Vercel's internal `target: production` label does not redefine repository/store governance; `easy-v2` is still non-stable candidate hosting under D-027.

## P10-S1-I2 rehearsal architecture proof

Evidence-only PR #62 added a temporary branch-local remote Playwright harness and conditional CI step. It was deliberately closed **without merge**, so no rehearsal harness or workflow alteration entered `develop`.

Authoritative evidence:

- run **`32298906351`**, job **`96216688953`**;
- exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**;
- harness head `5e5eaea8fbc51bf52c3e5bfc927b6da178082bda` over candidate base `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- D-019 first: 0 errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; build PASS;
- remote candidate rehearsal: 1/1 PASS.

Two earlier runs were diagnostics only:

- `32297959050` / `96213645569` exposed Vercel SSO on the immutable deployment URL before app access;
- `32298286885` / `96214717360` reached v1 preflight but a Playwright viewport/actionability issue blocked restore dispatch.

No product defect or real-data issue was accepted from either diagnostic run; both were superseded by the authoritative passing scenario.

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

Both `main` and `develop` remain unprotected GitHub branches. Therefore D-019/PR discipline is a canonical process requirement and cannot be assumed to be enforced by branch protection during P10.

## Accepted validation baseline

- P9-S4-I1: D-019 `32285620846` / `96174326588`; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.
- P9-S5: D-019 `32287018048` / `96178850066`; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`; tree `97a78d3e4d78a54ad117440c160920343513ba9f`.
- Canonical P9 closure: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.
- P10-S1 contract: D-019 `32290159119` / `96188851730`; PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`; tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.
- P10-S1-I1: D-019 `32292888925` / `96197514379`; PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`; tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.
- P10-S1-I2: evidence-only PR #62, authoritative run `32298906351` / `96216688953`; remote rehearsal 1/1 PASS; PR closed without merge.

## Boundary entering P10-S2 planning

P10-S1 is complete as a non-production pre-cutover gate. The next bounded action is to **define and accept the P10-S2 copied-live-data beta gate**, not to execute it.

That contract must establish the minimum data-handling, operator-access, reconciliation, recovery, rollback/disposal and explicit go/no-go criteria before any real store backup may be exported or imported.

Until that contract is accepted:

1. no live-store data may be moved;
2. `main` remains untouched;
3. no stable V2 publication or canonical URL switch may occur;
4. no production cutover may occur;
5. D-016 remains unchanged.

Detailed plan: `docs/V2/P10_CUTOVER_PLAN.md`.
