# Easy V2 — Architecture Baseline

**Status:** verified current architecture through P1-S1  
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

Current Dexie schema version after P1-S1: `2`.

Tables remain:

```text
items
resellers
transactions
```

The V2 migration preserves the V1 stores/indexes and materializes `reseller.isActive = true` for existing reseller rows where the field was absent.

### Item

Current fields:

```text
id?
name
basePrice
createdAt
updatedAt
```

Item lifecycle has not changed yet; P1-S2 owns that slice.

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

P1-S1 does not alter these financial semantics.

## 6. Current mutation and lifecycle behavior

### Resellers — P1-S1

The normal lifecycle is now reversible archive/reactivate:

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

### Items

Current item deletion still performs a physical `db.items.delete(id)`.

Transactions may preserve `itemName`, but a historical `itemId` can still reference a removed catalog record. P1-S2 owns this risk.

### Transactions

The data layer still has a `useDeleteTransaction` mutation that physically deletes a transaction.

The V2 roadmap does not treat physical deletion as the desired financial correction model; P2 must design reversal/cancellation semantics deliberately.

P1-S1 adds only creation-time reseller validation; it does not change correction semantics.

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

Archiving a reseller does not remove access to this detail/history or its PDF statement flow.

## 8. Backup architecture

Backup export produces JSON containing:

- version;
- exportedAt;
- items;
- resellers;
- transactions.

Current import validation checks broad structure/arrays and converts date fields, then clears and replaces the three tables inside a Dexie transaction.

Known gap: validation does not yet deeply verify every field, reference, duplicate ID, semantic value or schema compatibility. P5 owns the robust backup/restore contract; P1-S3 owns remaining reference/migration validation before then.

## 9. Search architecture

The global Command Center searches local Dexie data for resellers/items and calculates reseller balances in-browser.

After P1-S1, inactive resellers remain searchable/recent and are explicitly labeled inactive, so historical identities do not disappear from discovery.

Known incomplete behavior still includes item results/actions that navigate to a general page instead of always opening the exact intended operation.

## 10. Testing baseline

The project contains:

- Vitest unit/integration tests;
- fake IndexedDB support;
- Testing Library tests;
- Playwright configuration and E2E tests.

P1-S1 adds targeted automated coverage for reseller migration, archive/reactivation, hard-delete protection, inactive search visibility, transaction selection/guarding and reseller list/detail behavior.

Known global issue: the repository still contains pre-existing lint/unit/integration/E2E debt outside the P1-S1 slice. P6 owns test-suite reconciliation and CI hardening; a targeted passing slice must not be represented as a globally green suite.

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
