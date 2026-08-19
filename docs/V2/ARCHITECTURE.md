# Easy V2 — Architecture Baseline

**Status:** verified through integrated P9-S3-I3 category reporting  
**Integration target:** `develop`  
**Date:** 2026-08-19

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or live synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V5** with `categories`, `items`, `resellers`, `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill. Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

## Category lifecycle and classification

D-025 category identity uses stable ID, reversible active state and immutable historical order snapshots. I2 remains authoritative for category management at `/categories`, active-category-only item assignment/reactivation, legacy unclassified compatibility and new-order `categoryId + categoryName` capture.

## P9-S3-I3 reporting architecture — integrated

I3 adds no persistence, migration, backup envelope or write path. It is a read-only aggregation layer:

```text
categories[] + transactions[]
        |
        v
buildCategoryOrderPerformance(...)
        |
        +-- effective non-reversed order rows only
        +-- transactionOccurredAt() / occurredAt period filter
        +-- group key = historical transaction.categoryId
        +-- missing key = "Sem categoria — histórico legado"
        +-- metrics = orderCount + quantity + grossValue
        |
        v
/category-report
```

Semantics:

- grouping never uses the item's current category;
- current category entity may provide the display label for a stable historical ID, including archived categories;
- `transaction.categoryName` remains immutable audit evidence;
- reversed originals contribute zero; effective linked replacements contribute once;
- period boundaries are inclusive and based on financial occurrence, not registration time;
- payments, signals, reseller balance, open debt and FIFO debt are absent from category reporting;
- reporting is read-only, so D-024 write enforcement is unchanged.

## Recovery/interchange invariants — unchanged

D-017 remains logical `easy-backup` v2 / schema5; D-018 atomically restores `categories + items + resellers + transactions`; D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard. I3 changes none of these contracts.

## D-025 implementation state

D-025 is fully implemented across:

- I1 — persistence/migration/backup/restore substrate;
- I2 — category lifecycle, classification and immutable order snapshots;
- I3 — effective-order category performance reporting.

No new D-number was required for I3.

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

## P9-S3-I3 validation/integration proof

- Functional run `32261923163`, job `96096954271` — PASS.
- Final documentation-complete run **`32262877105`**, job **`96100129962`**, merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, head `b7e76e56c8049a002243fc693891880ba6bf0a50` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9` — **0 errors / 81 warnings, 51 files / 210 Vitest PASS, 17/17 Playwright PASS, production build PASS**.
- PR #48 integrated as **`08ad2973f387035301901f9f46b0c78039796c2d`**.
- Validated merge ref and integrated squash share tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

## Boundary entering P9-S4

P9-S4 must first map source-proven unsupported correction actions to concrete operator cases and separate already-supported reversal/replacement flows from genuinely missing high-value microflows. No speculative destructive editing, P9-S5/P10 or backend/auth/cloud/live-sync work is authorized.
