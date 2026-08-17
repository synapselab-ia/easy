# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`  
**Current work branch:** `feature/p0-documentacao`

## Current phase

**P0 — State and governance**  
**State:** `IN_REVIEW`

P0 documentation has been created on the feature branch and must be reviewed for consistency before integration into `develop`.

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

## Constraints right now

Until P0 is integrated:

- do not change runtime behavior;
- do not change database schema;
- do not redesign UI;
- do not introduce Supabase/backend/authentication;
- do not implement P1 prematurely;
- do not develop on `main`;
- do not modify the original `viniciuscasarin/easy` repository.

## Current P0 completion checklist

- [x] V2 repository established.
- [x] `develop` integration branch established.
- [x] P0 feature branch established.
- [x] Project spec written.
- [x] Architecture baseline written.
- [x] Canonical backlog written.
- [x] Decision ledger written.
- [x] QA ledger written.
- [x] Changelog initialized.
- [x] Canonical status written.
- [ ] Review documentation diff against verified baseline.
- [ ] Integrate approved P0 documentation into `develop`.

## NEXT_ACTION

**Review the complete `feature/p0-documentacao` diff against `develop`. If it contains only accurate V2 governance/documentation changes and no runtime modification, update this status to mark P0 `DONE`, set P1-S1 as the next action, and merge the P0 PR into `develop`.**

## Stop conditions

Stop and do not integrate if the P0 diff:

- modifies application/runtime source;
- modifies database schema;
- changes deployment behavior;
- asserts an unverified business requirement as fact;
- marks an unresolved architecture candidate as already decided.
