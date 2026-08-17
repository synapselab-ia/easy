# Easy V2 — Architecture Baseline

**Status:** verified current architecture through completed P2  
**Integration target:** `develop`  
**Date:** 2026-08-17

## 1. Current architecture

Easy remains a static browser-only SPA:

```text
Browser
  |-- React + TypeScript + Vite
  |-- React Router
  |-- TanStack Query
  |-- Dexie
  `-- IndexedDB

Static build -> GitHub Pages
```

There is no application backend, remote database or authentication layer.

## 2. Verified stack

React 19, TypeScript 6, Vite 8, React Router 7, TanStack Query 5, Dexie 4/IndexedDB, Tailwind CSS 4, shadcn/Base UI components, Recharts, jsPDF, date-fns, next-themes, Vitest/Testing Library and Playwright.

## 3. Routing baseline

Routes under `/easy/` remain:

- `/` — Dashboard;
- `/items` — Items;
- `/resellers` — Resellers;
- `/resellers/:id` — Reseller detail/history;
- `/transactions` — New transaction entry;
- `/backup` — Backup.

P2 correction actions live in reseller transaction history; no new route was required.

## 4. Persistence model after P2

Database: `ResellerManagerDB`. Current Dexie schema version remains **3**.

Tables remain `items`, `resellers`, `transactions`.

P1 migrations remain unchanged:

- V1 → V2 materializes missing reseller active state;
- V2 → V3 materializes missing item active state;
- historical transaction snapshots remain preserved.

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
reversal? {
  reason
  reversedAt                  // ISO audit timestamp
  replacementTransactionId?
}
correction? {
  replacesTransactionId
}
createdAt
```

P2 linkage/audit fields are optional and non-indexed; therefore no V4 migration is required.

## 5. P1 reference/lifecycle invariants

P1 remains unchanged:

- reseller/item lifecycle is reversible active/inactive;
- referenced entities are protected from unsafe hard deletion;
- new activity requires valid active references;
- historical snapshots remain preserved.

All P2 replacement creation still passes through these reference rules.

## 6. P2 correction architecture

### P2-S1 — Pure reversal/cancellation

`useReverseTransaction`:

1. validates transaction ID and non-empty reason;
2. loads the original in a Dexie write transaction;
3. rejects missing/already reversed rows;
4. writes only reversal audit metadata;
5. preserves original amount/type/item/observation/`createdAt`;
6. invalidates transaction/dashboard caches.

A reversed row remains visible but has zero financial effect.

### P2-S2 — Atomic linked replacement

`useReplaceTransaction` handles corrections requiring a replacement. It runs one Dexie RW transaction over resellers, items and transactions:

1. validate original ID and mandatory reason;
2. load an effective original;
3. construct a replacement of the **same transaction type**;
4. validate the replacement against current P1 reseller/item rules;
5. add the replacement with `correction.replacesTransactionId = original.id`;
6. update original reversal with reason, timestamp and `replacementTransactionId`;
7. return both reseller IDs for cache invalidation.

Dexie rollback guarantees that replacement-validation/persistence failure leaves the original effective and creates no partial correction.

### Guided replacement rules

- target reseller may change but must be active;
- payment/signal amount may change;
- order quantity/unit price may change;
- order `totalPrice` is recomputed from quantity × unit price;
- order item identity and original observation remain preserved;
- original order item must still satisfy P1 active-item rules to be recreated;
- historical order with unavailable item remains reversible through P2-S1 but is not recreated silently;
- normal `useCreateTransaction` sanitizes input and cannot persist caller-forged `reversal`/`correction` metadata.

## 7. Shared financial effect

`src/domain/transactions.ts` remains the shared P2 financial rule:

```text
effective order          +totalPrice
effective payment/signal -totalPrice
reversed transaction      0
```

For a linked pair, the reversed original contributes zero and only the effective replacement contributes. This keeps the existing P2-S1 consumers coherent without a second correction-specific arithmetic path.

Current reversal-aware consumers include:

- reseller total/filtered balances;
- dashboard total debt;
- today-order count/volume;
- debt-aging balances/last effective movement;
- performance revenue/debtor ranking;
- global-search reseller balances;
- PDF balance inputs.

## 8. Audit visibility

### Reseller history

Effective rows expose both:

- **Corrigir** — atomic linked replacement;
- **Estornar** — pure cancellation.

Reversed originals show reason/timestamp and, when applicable, `Substituído pelo lançamento #X`. Replacement rows show `Correção do lançamento #Y`.

### PDF

PDF statements keep both original and replacement rows and expose the same linkage text. Reversed originals retain their original values/snapshots for audit while contributing zero to the supplied balance.

## 9. Actor-attribution architecture boundary

P2 defines a future strategy without inventing identity infrastructure:

- future audit metadata may carry optional opaque `actorRef`;
- it is provider-neutral and display-name-independent;
- local P4 outcome may map it to a stable local operator/installation identity;
- authenticated P4 outcome may map it to a stable application-user ID;
- records without actor attribution remain valid;
- no actor is fabricated before a trustworthy identity source exists.

## 10. Backup compatibility boundary

Current JSON export serializes optional P2 audit/linkage objects. `reversedAt` is an ISO string.

This is compatibility, **not** P5 hardening. Deep backup validation, duplicate/reference checks, restore preview/version contracts and destructive-restore safeguards remain P5.

## 11. Date/statement boundary entering P3

Transactions still rely on `createdAt` for current financial-date behavior. P2 also has `reversal.reversedAt`, but it is an audit timestamp only.

P3 must distinguish occurrence time from registration/audit time without rewriting P2 correction history. Opening/closing statement semantics are still undecided.

## 12. Testing baseline

P2-S2 targeted validation covers:

- linked-pair financial effect;
- atomic correction mutation and rollback;
- wrong-value/wrong-reseller replacement;
- order item/type/observation preservation and derived corrected total;
- audit-metadata anti-forgery on normal creation;
- guided correction UI and inactive-item boundary;
- history/PDF bidirectional linkage;
- dashboard/search consistency;
- reseller-detail P2 regression;
- P1 migration/lifecycle/reference regressions;
- production build.

GitHub Actions P2-S2 gate: `32042373332` — PASS.

Repository-wide lint/unit/integration/E2E debt remains owned by P6.

## 13. Deployment baseline

GitHub Pages still deploys from `main` without a full quality gate. P6 owns deployment gating.

## 14. Architectural constraints entering P3-S1

- Dexie/IndexedDB remains baseline until P4;
- preserve P1 lifecycle/reference and P2 correction/audit/linkage invariants;
- do not use reversal timestamp as transaction occurrence time;
- migrate/read historical financial dates backward-safely;
- do not redesign opening/closing statements before occurrence-date semantics are established;
- do not pull P4/P5/P6 work into P3-S1.
