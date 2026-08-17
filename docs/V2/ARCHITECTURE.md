# Easy V2 — Architecture Baseline

**Status:** verified current architecture through P1-S2  
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

From `package.json`:

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

`src/App.tsx` defines these application routes under browser basename `/easy/`:

- `/` — Dashboard;
- `/items` — Items;
- `/resellers` — Resellers;
- `/resellers/:id` — Reseller detail;
- `/transactions` — Transactions/Lançamentos;
- `/backup` — Backup.

The main layout provides desktop/mobile navigation, global search and theme controls.

## 4. Persistence model

### Database

Database name: `ResellerManagerDB`.

Current Dexie schema version after P1-S2: `3`.

Tables remain:

```text
items
resellers
transactions
```

Migration path:

- V1 → V2 materializes `reseller.isActive = true` where absent;
- V2 → V3 materializes `item.isActive = true` where absent;
- the V3 upgrade does not rewrite existing reseller lifecycle state;
- legacy missing lifecycle values remain backward-safe at read time through `isResellerActive` / `isItemActive` (`isActive !== false`).

### Item

Current fields:

```text
id?
name
basePrice
isActive?
createdAt
updatedAt
```

`isActive !== false` is interpreted as active. New items created through the hook default explicitly to active.

### Reseller

Current fields:

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

`isActive !== false` is interpreted as active. This keeps legacy/unmigrated reads backward-safe while the V2 migration explicitly writes `true` for existing data.

### Transaction

Current transaction types:

```text
order
payment
signal
```

Current fields:

```text
id?
resellerId
type
itemId?
itemName?
quantity?
unitPrice?
totalPrice
observation?
createdAt
```

IndexedDB/Dexie still does not provide relational foreign-key constraints. P1 therefore enforces critical lifecycle/reference rules in application mutations and migration logic.

## 5. Financial model currently implemented

At the reseller level, the current balance semantics are effectively:

```text
sum(order.totalPrice)
-
sum(payment/signal.totalPrice)
=
balance
```

This calculation is reproduced in multiple parts of the application, which creates a consistency risk if future rules change without a shared domain service.

P1-S1/P1-S2 do not alter these financial semantics.

## 6. Current mutation and lifecycle behavior

### Resellers — P1-S1

The normal lifecycle is reversible archive/reactivate:

```text
active (isActive !== false)
  -> archive
inactive (isActive === false)
  -> reactivate
active
```

Rules:

- new resellers default to active;
- archive preserves the reseller row and all linked transactions;
- inactive resellers remain available for historical attribution, detail/history and statements;
- inactive resellers are excluded from new transaction selection;
- transaction creation independently checks the reseller and rejects inactive or missing identities;
- physical reseller deletion is protected by a Dexie transaction and is rejected when any transaction references that reseller;
- physical deletion is therefore limited to resellers with no financial history and is not the normal archival UI action.

### Items — P1-S2

Items now use the same reversible lifecycle shape while retaining order-specific snapshot semantics:

```text
active (isActive !== false)
  -> archive
inactive (isActive === false)
  -> reactivate
active
```

Rules:

- new items created through the item hook default to active;
- archive preserves the item row and does not modify historical transactions;
- inactive items remain visible/identified in the catalog and global search/recent results;
- inactive items are excluded from new-order selection;
- order creation independently rejects an inactive or missing referenced item when `itemId` is supplied;
- physical item deletion is protected by a Dexie transaction and is rejected when any transaction references that item;
- physical deletion is therefore limited to unused items and is not the normal catalog archival action;
- historical rendering continues to use stored transaction snapshots such as `itemName`, quantity, unit price and total price rather than resolving current catalog state.

### Transactions

The data layer still has a `useDeleteTransaction` mutation that physically deletes a transaction.

The V2 roadmap does not treat physical deletion as the desired financial correction model; P2 must design reversal/cancellation semantics deliberately.

P1-S1/P1-S2 add creation-time lifecycle/reference guards only; they do not change correction semantics.

## 7. Statement and date behavior

Current transactions have only `createdAt` as their date field.

The reseller detail page can filter transactions by a date range and display a "Saldo do Período" calculated only from transactions inside that range.

Current period semantics therefore represent **net movement in the selected interval**, not necessarily:

```text
opening balance
+ period orders
- period payments
= closing balance
```

P3 is responsible for defining the final commercial semantics.

Archiving a reseller does not remove access to detail/history or PDF statements. Archiving an item does not alter the item snapshot already stored in an order, so historical table/PDF output remains independent of current catalog lifecycle state.

## 8. Backup architecture

Backup export produces JSON containing:

- version;
- exportedAt;
- items;
- resellers;
- transactions.

Current export serializes the entity objects, so lifecycle fields present in IndexedDB are included. Current import spreads entity fields and converts date fields before replacing the three tables.

Known gap: validation does not yet deeply verify every field, reference, duplicate ID, semantic value or schema compatibility. Old imported records without lifecycle fields remain backward-safe as active at read time, but robust backup schema/version migration remains P5. P1-S3 owns remaining runtime reference/migration validation before then.

## 9. Search architecture

The global Command Center searches local Dexie data for resellers/items and calculates reseller balances in-browser.

After P1-S1/P1-S2:

- inactive resellers remain searchable/recent and are explicitly labeled inactive;
- inactive items remain searchable/recent and are explicitly labeled inactive;
- lifecycle visibility is therefore preserved without making inactive entities eligible for new financial/order activity.

Known incomplete behavior still includes item results/actions that navigate to a general page instead of always opening the exact intended operation. That remains outside P1-S2.

## 10. Testing baseline

The project contains:

- Vitest unit/integration tests;
- fake IndexedDB support;
- Testing Library tests;
- Playwright configuration and E2E tests.

P1-S1 adds targeted automated coverage for reseller migration, archive/reactivation, hard-delete protection, inactive search visibility, transaction selection/guarding and reseller list/detail behavior.

P1-S2 adds targeted coverage for:

- V2 → V3 item migration and reseller-state regression;
- item archive/reactivation;
- hard-delete protection with historical references;
- active-only new-order selection;
- mutation-level inactive/missing item guards;
- inactive item search visibility;
- catalog integration;
- historical item snapshot rendering;
- reseller lifecycle regression;
- production build.

Known global issue: the repository still contains pre-existing lint/unit/integration/E2E debt outside the targeted P1 slices. P6 owns test-suite reconciliation and CI hardening; passing phase gates must not be represented as a globally green suite.

## 11. Deployment baseline

`.github/workflows/deploy.yml` currently:

1. triggers on push to `main`;
2. checks out code;
3. uses Node 22;
4. runs `npm install`;
5. runs `npm run build`;
6. deploys `dist` to GitHub Pages.

The production workflow does not currently gate publication on lint, full unit/integration tests or critical Playwright E2E flows.

## 12. Architectural constraints until decision gates

Until P4 is completed:

- IndexedDB/Dexie remains the current persistence baseline;
- do not introduce Supabase/backend/authentication by assumption;
- do not redesign the product around multi-user behavior before requirements are known;
- changes in P1–P3 should be designed so a later persistence migration remains possible.

P1-S3 must complete the remaining reference/migration acceptance matrix without reinterpreting transaction snapshots or starting P2 correction semantics.

## 13. Architecture decision gate P4

P4 must decide whether the future architecture remains local or becomes cloud-backed based on actual operation:

- number of users;
- simultaneous access;
- devices/locations;
- need for author attribution;
- sensitivity of data;
- offline requirements;
- backup/recovery expectations.

Any cloud architecture described before that gate is a candidate, not an approved design.
