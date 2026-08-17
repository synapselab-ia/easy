# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P1 — Referential integrity and safe entity lifecycle**  
**State:** `IN_PROGRESS`

**P1-S1 — Safe reseller lifecycle:** `DONE` on `feature/p1-s1-reseller-lifecycle`, with targeted automated validation and build passing before integration into `develop`.

P1-S1 establishes a reversible active/inactive lifecycle for resellers while preserving historical financial attribution. It does not implement item lifecycle, general referential migration, transaction reversal, date/statement semantics, backend or authentication.

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

## P1-S1 implemented behavior

- reseller lifecycle is represented by `isActive`;
- existing reseller rows migrate safely to active by default in Dexie schema version 2;
- missing legacy `isActive` is also interpreted as active for backward-safe reads;
- normal reseller UI archives/reactivates instead of physically deleting identities with history;
- the physical delete mutation is protected and rejects deletion when financial transactions exist;
- archived resellers remain visible/identifiable in list, global search, detail, history and PDF statement flows;
- archived resellers are excluded from new transaction selection;
- transaction creation independently rejects inactive or missing resellers at the mutation layer;
- item lifecycle remains unchanged and belongs to P1-S2.

## Verified high-priority risks after P1-S1

1. Physical item deletion can weaken historical references.
2. Broader invalid-reference validation/migration remains for P1-S3.
3. There is no deliberate audited correction/reversal workflow for financial entries.
4. `createdAt` currently carries date semantics that should later distinguish occurrence vs registration.
5. Period balance semantics are not yet formal opening/closing statement semantics.
6. Backup restore validation is not deep enough for high-confidence destructive replacement.
7. The global lint/test baseline contains known pre-existing debt; P1-S1 targeted gates pass but P6 still owns suite reconciliation.
8. Production deployment is not gated by the full quality suite.

## P1-S1 completion evidence

- [x] A reseller with financial history cannot be destructively removed through the normal UI.
- [x] Historical transactions remain attributable to the reseller after archive.
- [x] List/search/detail/history behavior for inactive resellers is defined and implemented.
- [x] Inactive resellers cannot receive new transactions through the selector or mutation layer.
- [x] Existing reseller data receives a safe active default through Dexie V1 → V2 migration.
- [x] Automated tests cover migration, archive/reactivation, deletion protection, search visibility and transaction blocking.
- [x] GitHub Actions P1-S1 targeted gate passed on run `32037965651`.
- [x] `npm run build` passed on the same run.
- [x] Canonical V2 documentation updated with implemented behavior and next action.

## Active constraints entering P1-S2

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce Supabase/backend/authentication before P4;
- do not redesign unrelated UI during P1;
- do not implement transaction reversal yet — that belongs to P2;
- do not change financial date/statement semantics yet — that belongs to P3;
- preserve existing valid data through any P1 schema migration;
- add tests with P1 behavior changes rather than postponing all testing to P6;
- do not expand P1-S2 into P1-S3 except where strictly required by item lifecycle.

## NEXT_ACTION

**P1-S2 — Safe item lifecycle. Create a new feature branch from `develop`, inspect every current item deletion/selection/search/history dependency, define the exact active/inactive/archive behavior and acceptance criteria, then implement only the item-lifecycle slice with migration and tests. Do not implement P1-S3 beyond what P1-S2 strictly requires.**

## P1-S2 completion target

P1-S2 is not complete until:

- an item already used in historical orders cannot make those orders unintelligible through normal catalog removal;
- historical order snapshots/references remain understandable after item deactivation;
- inactive item behavior is defined for catalog list, search and new-order selection;
- existing item data receives a safe lifecycle default through migration without regressing the reseller migration;
- automated tests cover item lifecycle and migration behavior;
- V2 documentation is updated with the implemented behavior and next action.
