# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P0 — State and governance**  
**State:** `DONE`

The P0 documentation set has been created and reviewed against the verified `develop` baseline. The P0 PR contains documentation under `docs/V2/` only and no runtime, database-schema, UI or deployment changes.

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

Easy currently is a browser-only reseller/order/payment management SPA with:

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

## Verified high-priority risks

1. Physical reseller deletion can leave financial transactions orphaned.
2. Physical item deletion can weaken historical references.
3. There is no deliberate audited correction/reversal workflow for financial entries.
4. `createdAt` currently carries date semantics that should later distinguish occurrence vs registration.
5. Period balance semantics are not yet formal opening/closing statement semantics.
6. Backup restore validation is not deep enough for high-confidence destructive replacement.
7. Some E2E expectations are stale.
8. Production deployment is not gated by the full quality suite.

## P0 completion evidence

- [x] V2 repository established.
- [x] `develop` integration branch established.
- [x] Feature-branch workflow established.
- [x] Project spec written.
- [x] Architecture baseline written from inspected source.
- [x] Canonical backlog written.
- [x] Decision ledger written.
- [x] QA ledger written.
- [x] Changelog initialized.
- [x] Canonical startup/status protocol written.
- [x] PR changed-file review confirms documentation-only scope.

## Active constraints entering P1

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce Supabase/backend/authentication before P4;
- do not redesign unrelated UI during P1;
- do not implement transaction reversal yet — that belongs to P2;
- do not change financial date/statement semantics yet — that belongs to P3;
- preserve existing valid data through any P1 schema migration;
- add tests with P1 behavior changes rather than postponing all testing to P6.

## NEXT_ACTION

**P1-S1 — Safe reseller lifecycle. Create a new feature branch from `develop`, inspect every current reseller deletion/selection/search/detail dependency, define the exact active/inactive/archive behavior and acceptance criteria, then implement only the reseller-lifecycle slice with migration and tests. Do not implement P1-S2 or P1-S3 beyond what P1-S1 strictly requires.**

## P1-S1 completion target

P1-S1 is not complete until:

- a reseller with financial history cannot be destructively removed through the normal UI;
- historical transactions remain attributable to that reseller;
- inactive/archived reseller behavior is defined for list, search, new transactions and detail/history;
- existing reseller data receives a safe default lifecycle state through migration;
- automated tests cover the lifecycle rule and migration;
- V2 documentation is updated with the implemented behavior and next action.
