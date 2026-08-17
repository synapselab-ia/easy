# Easy V2 — Architecture Baseline

**Status:** verified current architecture through completed P1  
**Integration target:** `develop`  
**Date:** 2026-08-17

## 1. Current architecture

Easy is a static single-page application that runs entirely in the browser.

```text
Browser
  |
  |-- React + TypeScript + Vite
  |-- React Router
  |-- TanStack Query
  |-- Dexie
  `-- IndexedDB (local browser data)

Static build
  |
  `-- GitHub Pages
```

There is no application backend, remote database or authentication layer.

## 2. Verified stack

- React 19;
- TypeScript 6;
- Vite 8;
- React Router 7;
- TanStack Query 5;
- Dexie 4 / IndexedDB;
- Tailwind CSS 4;
- shadcn-related UI components / Base UI;
- Recharts;
- jsPDF + jspdf-autotable;
- date-fns;
- next-themes;
- Vitest + Testing Library;
- Playwright.

Primary scripts:

```text
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## 3. Routing baseline

`src/App.tsx` defines these routes under browser basename `/easy/`:

- `/` — Dashboard;
- `/items` — Items;
- `/resellers` — Resellers;
- `/resellers/:id` — Reseller detail;
- `/transactions` — Transactions/Lançamentos;
- `/backup` — Backup.

## 4. Persistence model after P1

Database name: `ResellerManagerDB`.

Current Dexie schema version: **3**.

Tables:

```text
items
resellers
transactions
```

Migration path:

- V1 → V2 materializes `reseller.isActive = true` only where lifecycle state is absent/non-boolean;
- V2 → V3 materializes `item.isActive = true` only where lifecycle state is absent/non-boolean;
- explicit `false` lifecycle state is preserved;
- P1-S3 adds no persistent field and therefore no V4;
- complete V1 → V2 → V3 tests verify preservation of IDs, dates, snapshots, row counts and lifecycle state.

### Item

```text
id?
name
basePrice
isActive?
createdAt
updatedAt
```

`isActive !== false` is interpreted as active.

### Reseller

```text
id?
name
phone?
email?
notes?
isActive?
createdAt
updatedAt
```

`isActive !== false` is interpreted as active.

### Transaction

```text
id?
resellerId
type: order | payment | signal
itemId?
itemName?
quantity?
unitPrice?
totalPrice
observation?
createdAt
```

IndexedDB/Dexie has no relational foreign-key constraints. P1 therefore enforces current-activity reference integrity in application mutations while preserving legacy history in storage.

## 5. P1 lifecycle and reference model

### Resellers

- new resellers default active;
- archive/reactivate is the normal lifecycle;
- inactive resellers remain historically discoverable;
- inactive resellers are unavailable for new transactions;
- hard deletion is rejected when any transaction references the reseller.

### Items

- new items default active;
- archive/reactivate is the normal lifecycle;
- inactive items remain visible in catalog/search;
- inactive items are unavailable for new orders;
- hard deletion is rejected when any transaction references the item;
- historical order rendering uses stored snapshots rather than current catalog state.

### New transaction reference acceptance matrix

All new transactions created through `useCreateTransaction` require:

```text
resellerId -> positive integer -> existing reseller -> active reseller
```

Additional rules:

```text
order
  -> requires positive itemId
  -> item must exist and be active
  -> itemName snapshot is derived from resolved item

payment/signal
  -> itemId is invalid
  -> movement remains reseller-level
```

The mutation validates these rules below the UI so stale/alternate callers cannot bypass them.

### Historical compatibility

P1 migration deliberately does **not** revalidate or rewrite stored transactions.

Consequences:

- historical `itemName`, quantity, unit price, total price, observation and dates remain unchanged;
- an old `itemId` that no longer resolves is preserved when the transaction snapshot still explains the order;
- P1 does not invent a replacement catalog identity or delete old financial history;
- deep validation/repair of imported malformed backup data remains P5.

## 6. Financial model currently implemented

At reseller level, balance semantics remain effectively:

```text
sum(order.totalPrice)
-
sum(payment/signal.totalPrice)
=
balance
```

This calculation still exists in multiple surfaces. P2/P3 must avoid allowing reversal/date semantics to diverge between dashboard, detail, search and PDF.

## 7. Current correction behavior entering P2

The data layer still contains `useDeleteTransaction`, which physically deletes a transaction.

This is **not** the approved V2 correction model. P2 must inventory every caller/dependency and design audited reversal/cancellation behavior that preserves the original entry.

P1 does not modify transaction deletion semantics because that would cross into P2.

## 8. Statement and date behavior

Transactions still have only `createdAt` as their date field.

The reseller detail page filters by that field and computes period net movement rather than a formally defined opening → movement → closing statement.

P3 owns occurrence-date and statement semantics.

## 9. Backup architecture

Backup export/import still serializes/reloads items, resellers and transactions with shallow structural validation.

Lifecycle fields present in records are preserved by object spread. Old records without lifecycle fields remain backward-safe as active at read time.

Deep schema/reference/value validation, duplicate detection, restore preview and migration-version contracts remain P5.

## 10. Search architecture

The global Command Center searches local Dexie data for resellers/items and calculates reseller balances in-browser.

After P1:

- inactive resellers/items remain discoverable and labeled inactive;
- inactive entities are not eligible for new financial/order activity;
- item result navigation still has known UX limitations owned by P7.

## 11. Testing baseline

P1 targeted coverage now includes:

- V1 → V2 → V3 migration preservation;
- reseller/item lifecycle and hard-delete guards;
- inactive search visibility;
- active-only transaction/order selection;
- strict new-transaction reference matrix;
- new-order snapshot derivation;
- catalog/reseller integration regressions;
- historical snapshot rendering;
- production build.

GitHub Actions P1-S3 gate: `32039763539` — PASS.

The repository-wide lint/unit/integration/E2E baseline still contains pre-existing debt outside targeted P1 scope. P6 owns full-suite reconciliation and CI hardening.

## 12. Deployment baseline

`.github/workflows/deploy.yml` still builds/deploys from `main` with Node 22 and does not require the full quality suite before publication.

P6 owns deployment gating.

## 13. Architectural constraints entering P2

Until P4:

- Dexie/IndexedDB remains the persistence baseline;
- do not introduce backend/authentication by assumption;
- do not redesign around multi-user behavior before requirements are known.

For P2 specifically:

- preserve original financial entries during correction;
- do not silently delete history as the normal correction mechanism;
- do not change P3 date/statement semantics while implementing reversal/cancellation;
- ensure future correction status can be consumed consistently by balance/dashboard/search/PDF logic.
