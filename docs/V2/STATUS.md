# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P2 — Correction, reversal and audit trail**  
**State:** `IN_PROGRESS`

**P1 — Referential integrity and safe entity lifecycle:** `DONE`.

**P2-S1 — Audited transaction reversal:** `DONE` on `feature/p2-s1-audited-reversal`, with targeted automated validation and build passing before integration into `develop`.

P2-S1 establishes the first non-destructive correction path: an existing financial transaction can be estornado with a mandatory reason and audit timestamp while the original row remains stored and visible. Reversed transactions have zero financial effect across the currently inventoried balance/dashboard/search/PDF surfaces.

## Startup protocol for a new conversation

Read these files in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only the source files needed for the active `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only reseller/order/payment management SPA with:

- React + TypeScript + Vite;
- Dexie/IndexedDB local persistence;
- items, resellers and order/payment/signal transactions;
- reseller balances, dashboard and analytics;
- PDF statements;
- JSON backup/restore;
- global search;
- responsive UI and theme support;
- automated-test infrastructure;
- GitHub Pages deployment from `main`.

## P1 completed behavior

- reseller and item lifecycle uses reversible active/inactive state;
- hard deletion of referenced resellers/items is guarded;
- new transaction references are validated below the UI;
- new orders derive their item snapshot from the referenced current item;
- the complete Dexie V1 → V2 → V3 path preserves valid lifecycle/history data;
- historical transaction snapshots are not destructively repaired.

## P2-S1 implemented behavior

### Reversal audit model

- `Transaction` now has optional `reversal` metadata;
- `reversal.reason` is mandatory and trimmed before persistence;
- `reversal.reversedAt` is stored as an ISO timestamp string;
- absence of `reversal` means the transaction is financially effective;
- a transaction can be reversed only once;
- the original transaction row, value, item snapshot, observation and `createdAt` remain unchanged;
- no Dexie schema version change is required because the metadata is optional/non-indexed; schema remains V3.

### Correction UI

- reseller transaction history exposes an `Estornar` action for effective transactions;
- confirmation requires an explicit reason before submission;
- reversed rows remain visible with `Estornado` status, reason and reversal timestamp;
- an already reversed row has no second reversal action;
- the previous destructive transaction-delete mutation is no longer the correction path.

### Shared financial effect

`src/domain/transactions.ts` now defines the shared rule used by the changed surfaces:

- effective order → positive financial effect;
- effective payment/signal → negative financial effect;
- reversed transaction → zero financial effect while remaining auditable.

P2-S1 applies that rule to:

- reseller total/filtered balances;
- dashboard total debt;
- today-order count and volume;
- debt-aging balances;
- performance revenue/debtor ranking;
- global-search reseller balances;
- PDF balance inputs.

### Historical/PDF visibility

- reversed transactions remain in the reseller history;
- PDF statements include both valid and reversed rows;
- PDF rows identify `Válido`/`Estornado` and preserve the reversal reason;
- P2-S1 does not change P3 occurrence-date or opening/closing statement semantics.

## Verified high-priority risks after P2-S1

1. Correction can be performed by reversing the wrong entry and manually creating a new one, but the original/replacement pair is not yet explicitly linked or guided — P2-S2.
2. There is no authenticated actor identity; a future-ready attribution strategy still needs an explicit P2 decision without prematurely adding auth/backend.
3. `createdAt` still carries occurrence/registration ambiguity — P3.
4. Period statements still use current net-movement semantics — P3.
5. Backup restore validation remains shallow — P5.
6. Repository-wide lint/test debt and deployment gating remain P6.

## P2-S1 completion evidence

- [x] original transaction remains stored after reversal;
- [x] mandatory non-empty correction reason is enforced below the UI;
- [x] reversal timestamp/status is persisted;
- [x] a second reversal is rejected;
- [x] reseller-history UI supports reversal and shows audit metadata;
- [x] reversed rows remain visible in history/PDF;
- [x] reversed rows have zero effect on reseller balances;
- [x] reversed rows have zero effect on dashboard total/today/aging/performance metrics;
- [x] reversed rows have zero effect on search balances;
- [x] PDF carries reversal status/reason while using reversal-aware balance input;
- [x] P1 migration/lifecycle/reference regressions pass;
- [x] GitHub Actions P2-S1 targeted gate passed on run `32041280504`;
- [x] `npm run build` passed on the same run;
- [x] canonical V2 documentation updated with exact scope boundary and next action.

## Active constraints entering P2-S2

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce backend/authentication before P4;
- preserve original and reversed financial entries;
- do not mutate `createdAt` or introduce P3 occurrence-date semantics;
- do not redesign statement-period semantics;
- do not expand into backup hardening (P5) or global CI cleanup (P6);
- preserve P1 lifecycle/reference guarantees;
- add targeted tests for every new correction-linkage behavior.

## NEXT_ACTION

**P2-S2 — Linked/guided correction replacement. Create a new feature branch from `develop`, inventory the minimum data/UI needed to connect a reversed transaction to an optional replacement transaction, define acceptance criteria for wrong-value and wrong-reseller correction flows, and implement only that linkage/guided-recreate slice. Preserve both records and the P2-S1 reversal audit metadata. Define the future actor-attribution strategy explicitly, but do not introduce authentication/backend or P3 date semantics.**

## P2 completion direction

P2 is not complete yet. It must ultimately make common entry errors correctable with traceability, including:

- preserved original entry;
- visible reversal status/reason/timestamp;
- guided correction for wrong values and wrong reseller;
- explicit original/replacement relationship where a replacement is created;
- duplicate-payment and old-order reversal behavior;
- consistent balance/dashboard/history/PDF treatment;
- a future-ready actor attribution strategy compatible with the later P4 architecture decision.
