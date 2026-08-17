# Easy V2 — Architecture Baseline

**Status:** verified baseline for V2 planning  
**Branch inspected:** `develop`  
**Date:** 2026-08-17

## 1. Current architecture

Easy is currently a static single-page application that runs entirely in the browser.

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

There is no application backend, remote database or authentication layer in the current baseline.

## 2. Verified stack

From `package.json` on `develop`:

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

Dexie schema version: `1`.

Tables:

```text
items
resellers
transactions
```

### Item

Current fields:

```text
id?
name
basePrice
createdAt
updatedAt
```

### Reseller

Current fields:

```text
id?
name
phone?
email?
notes?
createdAt
updatedAt
```

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

Important baseline fact: there are no foreign-key constraints in IndexedDB/Dexie enforcing that `resellerId` or `itemId` continue to reference an existing entity.

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

## 6. Current mutation behavior

### Resellers

Current deletion performs a physical `db.resellers.delete(id)`.

It does not automatically validate or remove linked transactions.

### Items

Current deletion performs a physical `db.items.delete(id)`.

Transactions may preserve `itemName`, but a historical `itemId` can still reference a removed catalog record.

### Transactions

The data layer has a `useDeleteTransaction` mutation that physically deletes a transaction.

The V2 roadmap does not treat physical deletion as the desired financial correction model; P2 must design reversal/cancellation semantics deliberately.

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

## 8. Backup architecture

Backup export produces JSON containing:

- version;
- exportedAt;
- items;
- resellers;
- transactions.

Current import validation checks broad structure/arrays and converts date fields, then clears and replaces the three tables inside a Dexie transaction.

Known gap: validation does not yet deeply verify every field, reference, duplicate ID, semantic value or schema compatibility.

## 9. Search architecture

The global Command Center searches local Dexie data for resellers/items and calculates reseller balances in-browser.

Known incomplete behavior includes item results/actions that navigate to a general page instead of always opening the exact intended operation.

## 10. Testing baseline

The project contains:

- Vitest unit/integration tests;
- fake IndexedDB support;
- Testing Library tests;
- Playwright configuration and E2E tests.

Known issue: at least part of the Playwright search flow is stale relative to the current UI (for example selectors/text expectations no longer match current components).

P6 owns test-suite reconciliation and CI hardening.

## 11. Deployment baseline

`.github/workflows/deploy.yml` currently:

1. triggers on push to `main`;
2. checks out code;
3. uses Node 22;
4. runs `npm install`;
5. runs `npm run build`;
6. deploys `dist` to GitHub Pages.

The workflow does not currently gate publication on lint, full unit/integration tests or critical Playwright E2E flows.

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
