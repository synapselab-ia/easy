# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P3 — Dates, balances and financial statements**  
**State:** `IN_PROGRESS`

**P1 — Referential integrity and safe entity lifecycle:** `DONE`.  
**P2 — Correction, reversal and audit trail:** `DONE`.

- **P3-S1 — Occurrence-date model and backward-safe migration:** `DONE`.
- **P3-S2 — Statement and balance-period semantics:** `NOT_STARTED`.

P3-S1 establishes a distinct financial occurrence date without rewriting registration/audit history. P3 remains open for formal statement-period and aging semantics.

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
- historical transaction snapshots are preserved.

## P2 completed behavior

- audited reversal preserves original entries and requires reason/timestamp;
- linked correction preserves original/replacement records and bidirectional links;
- reversed rows remain visible but financially neutral;
- replacement creation obeys P1 reference validation;
- reseller balance, dashboard, search and PDF share reversal-aware financial effect;
- future actor attribution remains provider-neutral and deferred until P4 supplies a trustworthy identity source.

## P3-S1 completed behavior

### Date contract

- `occurredAt` is the financial occurrence date used for business-period semantics;
- `createdAt` is the record-registration/audit timestamp and is generated internally for new transactions;
- `reversal.reversedAt` remains a separate P2 audit timestamp and is never treated as financial occurrence;
- new transaction entry exposes a financial date, defaulting to the current local day;
- the date-only UI materializes the selected local financial day at local noon; time-of-day is not business-significant in P3-S1;
- lower-level legacy callers that omit `occurredAt` default it to the generated registration timestamp rather than breaking old call sites;
- explicitly invalid occurrence dates are rejected.

### Migration and compatibility

- Dexie schema is now **V4**;
- V4 adds an `occurredAt` transaction index;
- V1/V2/V3 rows without occurrence migrate with `occurredAt = createdAt`;
- existing valid `occurredAt` values are preserved;
- original `createdAt`, P1 snapshots/lifecycle state and P2 reversal/correction metadata remain unchanged;
- `transactionOccurredAt()` provides a backward-read fallback to `createdAt` for legacy in-memory/imported rows;
- legacy JSON restore materializes missing occurrence from `createdAt`; explicit occurrence values are preserved;
- this compatibility handling does not replace P5 deep backup validation/versioning.

### Cross-surface financial date usage

The following now use financial occurrence rather than registration time:

- transaction history display and ordering;
- reseller date-range filtering;
- PDF date-range filtering and row date display;
- dashboard today-order count/volume;
- current last-effective-movement aging calculation;
- performance-analysis revenue window.

Global search was inventoried and has no independent date-window logic; it continues to use shared all-time balance semantics unchanged.

### P2 correction date preservation

A linked correction keeps the original financial event date:

- original `occurredAt` remains unchanged;
- replacement receives the original occurrence date;
- replacement `createdAt` records when the correction record was created;
- original `reversal.reversedAt` records when the correction/reversal happened.

## Verified high-priority risks after P3-S1

1. Period statements still use net movement in the selected window rather than formal opening balance → movements → closing balance semantics — P3-S2.
2. Aging still uses the current last-effective-movement model; P3-S2 must decide whether that is sufficient or true debt aging is required.
3. Backup restore validation remains shallow — P5.
4. Repository-wide lint/test debt and deployment gating remain P6.
5. Item-result navigation/global UX limitations remain P7.

## P3-S1 completion evidence

- [x] V3 → V4 migration materializes occurrence without rewriting registration/audit metadata;
- [x] complete existing V1 migration regression remains green through current schema;
- [x] explicitly materialized occurrence survives migration unchanged;
- [x] new transaction can be financially dated independently from registration time;
- [x] invalid explicit occurrence is rejected;
- [x] legacy mutation callers without occurrence remain backward-safe;
- [x] linked correction preserves original financial occurrence while recording new registration/reversal timestamps;
- [x] transaction form captures financial occurrence date;
- [x] today orders, aging and performance use occurrence date;
- [x] history display and reseller period filtering use occurrence date;
- [x] PDF filtering/display uses occurrence date;
- [x] legacy backup restore materializes occurrence from `createdAt` and preserves explicit P3 occurrence;
- [x] P1/P2 mutation, lifecycle, history, dashboard, search, PDF, backup and reseller-detail regressions remain green;
- [x] GitHub Actions targeted P3-S1 gate passed on run `32052076684`;
- [x] `npm run build` passed on the same run.

## Active constraints entering P3-S2

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce backend/authentication before P4;
- preserve P1 lifecycle/reference guarantees and P2 correction/audit/linkage invariants;
- preserve P3-S1 `occurredAt` versus registration/audit timestamp semantics;
- do not reinterpret `reversal.reversedAt` as financial occurrence;
- do not pull P4 persistence, P5 backup hardening or P6 global CI cleanup into P3-S2;
- define one shared statement/balance-period contract before changing reseller detail/PDF calculations;
- explicitly decide the aging model before changing current aging behavior;
- add targeted cross-surface tests for every P3-S2 financial change.

## NEXT_ACTION

**P3-S2 — Statement and balance-period semantics. Create a new feature branch from `develop`, inventory the current period-balance and aging calculations across reseller detail, PDF, dashboard, search and analytics, define one shared opening balance → period movements → closing balance contract and explicitly decide whether the current last-effective-movement aging model is sufficient or true debt aging is required; then implement only the coherent statement/balance-period slice with targeted cross-surface tests. Preserve P3-S1 `occurredAt` semantics and P2 audit history; do not begin P4 persistence work.**

## P3 completion direction

P3 can close only after P3-S2 establishes:

- formal opening balance → period movements → closing balance statement semantics;
- identical reseller-detail and PDF period results from one shared domain rule;
- coherent dashboard/search/analytics balance behavior under that rule;
- an explicit accepted aging model with automated coverage.
