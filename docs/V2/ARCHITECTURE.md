# Easy V2 — Architecture Baseline

**Status:** verified through completed/integrated P9  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

P9-S4 and P9-S5 introduced no Dexie schema, migration or backup-envelope changes.

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

P9-S4-I1 permits the replacement business state to define reseller, target type, `occurredAt`, observation and the applicable order item/quantity/unit price or payment/signal value.

Target-shape validity, D-025 snapshot preservation/recapture, P1/D-011 active-reference rules and D-024 recovery freshness enforcement remain mandatory. No speculative inactive-reference exception was introduced.

## D-014 occurrence-date architecture — P9-S5 reverified

D-014 remains unchanged:

- `occurredAt` = financial/business occurrence time;
- `createdAt` = record-registration time;
- `reversal.reversedAt` = audit/reversal time.

The normal new-movement workflow uses `TransactionForm`, which currently:

1. initializes `Data da ocorrência` from the browser-local current date;
2. renders it in the main entry block beside reseller and transaction type;
3. uses an editable date input before save;
4. validates and converts that value to `occurredAt`;
5. displays helper text distinguishing financial date from automatically saved registration time.

P9-S5 found no evidence-backed UI/runtime gap. Existing persistence tests plus the new focused usability test prove the current workflow satisfies the bounded direct evidence. **No production source file was changed.**

## Recovery/interchange invariants — unchanged

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard.

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

## P9-S4-I1 validation/integration proof

- D-019 run `32285620846`, job `96174326588`, validated PR merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3` — 0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`.
- Validated merge ref and integrated squash share tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## P9-S5 validation/integration proof

- D-019 run `32287018048`, job `96178850066`, validated PR merge ref `9459285920cfbd784a652e9db97cf40741977edf` — 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- Validated head `fef66eb8da6602f0804d0c78eb3d6c30feaf2cac` over base `716fc3b9ec77bada5ca44d992a6760a276e38cfa`.
- PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`.
- Validated merge ref and integrated squash share exact tree `97a78d3e4d78a54ad117440c160920343513ba9f`.

## Boundary entering P10

P9 is complete. P10 remains `NOT_STARTED`.

The current V2 architecture entering P10 is still local-first/single-user under D-016, with D-017/D-018 recovery contracts, D-019 mandatory QA, D-024 recovery freshness enforcement, D-025 category snapshots/reporting, D-026 audited correction and D-014 financial-date semantics intact.

No production migration, beta cutover, `main` publication or architecture change has been authorized merely by completing P9.
