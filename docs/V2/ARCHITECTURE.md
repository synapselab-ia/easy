# Easy V2 — Architecture Baseline

**Status:** verified current architecture through P2-S1  
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

Primary scripts remain `npm run dev`, `build`, `lint`, `test` and `preview`.

## 3. Routing baseline

Routes under browser basename `/easy/` remain:

- `/` — Dashboard;
- `/items` — Items;
- `/resellers` — Resellers;
- `/resellers/:id` — Reseller detail/history;
- `/transactions` — New transaction entry;
- `/backup` — Backup.

P2-S1 does not add a new route; reversal is exposed from reseller transaction history.

## 4. Persistence model

Database name: `ResellerManagerDB`.

Current Dexie schema version remains **3**.

Tables remain:

```text
items
resellers
transactions
```

P1 migration path remains:

- V1 → V2 materializes missing reseller active state;
- V2 → V3 materializes missing item active state;
- explicit inactive state and historical transaction snapshots are preserved.

P2-S1 introduces no index/table/schema migration because reversal metadata is optional inside the transaction object.

### Transaction after P2-S1

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
reversal? {
  reason
  reversedAt   // ISO timestamp string
}
createdAt
```

`createdAt` remains the existing transaction date field. P2-S1 does not reinterpret it.

## 5. P1 lifecycle/reference model

P1 remains unchanged:

- resellers/items use reversible active/inactive lifecycle;
- referenced entities cannot be hard-deleted through guarded mutations;
- new transactions require valid active references;
- historical snapshots remain preserved.

## 6. P2-S1 correction model

### Mutation boundary

`useReverseTransaction` replaces physical transaction deletion as the approved correction primitive for this slice.

The mutation:

1. validates transaction ID;
2. requires a trimmed non-empty reason;
3. loads the original transaction inside a Dexie write transaction;
4. rejects an already reversed transaction;
5. writes only `reversal.reason` and `reversal.reversedAt`;
6. keeps original amount/type/item snapshot/observation/createdAt unchanged;
7. invalidates transaction and dashboard query caches.

### Shared domain rule

`src/domain/transactions.ts` centralizes the first P2 financial-effect semantics:

```text
isTransactionReversed(transaction)
transactionSignedAmount(transaction)
calculateBalance(transactions)
effectiveTransactions(transactions)
```

Financial sign/effect:

```text
effective order          +totalPrice
effective payment/signal -totalPrice
reversed transaction      0
```

This rule avoids a reversed transaction being removed from history merely to remove its balance effect.

## 7. P2-S1 financial consumers

### Reseller detail/history

- full history still contains reversed rows;
- total and date-filtered balances use `calculateBalance`;
- reversed rows display status, reason and reversal timestamp;
- reversal UI is available only for effective rows.

### Dashboard

P2-S1 makes these metrics reversal-aware:

- total debt;
- today-order count/volume;
- debt-aging balances/last effective movement;
- performance revenue and debtor ranking.

Reversal timestamp is **not** treated as a new financial occurrence date; P3 owns occurrence-date semantics.

### Search

Reseller search/recent balances use the shared reversal-aware balance calculation.

### PDF

PDF statements receive reversal-aware balance values from reseller detail while preserving every historical row.

Rows now expose:

- `Válido` or `Estornado` status;
- original value/snapshot;
- original observation;
- reversal reason for reversed rows.

## 8. Backup compatibility boundary

Current backup export serializes transaction objects recursively, so the optional `reversal` object and ISO string timestamp are naturally included.

P2-S1 intentionally uses an ISO string for `reversedAt`, avoiding a new Date-rehydration rule solely for this metadata.

This does **not** resolve P5: deep backup schema/reference/value/version validation, duplicate detection, restore preview and destructive-restore safeguards remain open.

## 9. Correction limitations after P2-S1

P2-S1 supports pure cancellation/reversal and allows an operator to manually create a correct new transaction afterward.

Still missing:

- explicit linkage from reversed original to replacement;
- guided wrong-value replacement flow;
- guided wrong-reseller replacement flow;
- actor attribution strategy/model.

These are P2-S2 concerns. The original transaction must not become editable in place merely to implement them.

## 10. Date/statement boundary

Transactions still have only `createdAt` for financial date semantics.

P2-S1 adds `reversal.reversedAt` as an audit timestamp only. It must not be reused to redefine transaction occurrence or statement periods.

Opening/period/closing balance semantics remain P3.

## 11. Testing baseline

P2-S1 targeted coverage includes:

- shared transaction financial rules;
- reversal mutation preservation/reason/timestamp/double-reversal guards;
- reversal UI and visible audit metadata;
- dashboard total/today/aging/performance consistency;
- search balance consistency;
- reseller-detail history/balance/PDF input consistency;
- PDF reversal status/reason;
- P1 migration/lifecycle/reference regressions;
- production build.

GitHub Actions P2-S1 gate: `32041280504` — PASS.

Repository-wide lint/unit/integration/E2E debt remains outside this targeted gate and is owned by P6.

## 12. Deployment baseline

GitHub Pages deployment still builds/deploys from `main` without requiring the full quality suite. P6 owns deployment gating.

## 13. Architectural constraints entering P2-S2

- Dexie/IndexedDB remains the persistence baseline until P4;
- do not introduce backend/authentication by assumption;
- preserve original/reversed transactions;
- any replacement linkage must be additive/auditable, not in-place mutation of history;
- do not alter P3 date/statement semantics;
- actor attribution strategy may be designed, but actual identity/auth architecture must remain compatible with the later P4 decision.
