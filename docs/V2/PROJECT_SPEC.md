# Easy V2 — Project Spec

**Status:** canonical V2 product reference  
**Repository:** `synapselab-ia/easy`  
**Integration branch:** `develop`  
**Created:** 2026-08-17

## 1. Purpose

Easy is a client-side application for managing reseller orders, payments/signals, balances, statements and operational analytics.

Easy V2 is an evolution of the existing application, not a greenfield rewrite. The goal is to preserve useful behavior while making the financial core safer, recoverable, auditable and maintainable before adding new business modules.

## 2. Current product baseline

The current application already provides:

- item catalog with base prices;
- reseller registration and reseller detail pages;
- order, payment and signal transactions;
- automatic reseller balance calculation;
- dashboard totals and order volume;
- debt-aging/risk visualization;
- Pareto and debtor-ranking analytics;
- PDF reseller statements with date filtering;
- JSON backup import/export;
- global command/search center;
- responsive desktop/mobile layouts;
- light/dark theme;
- unit/integration tests and a small Playwright E2E suite;
- GitHub Pages deployment from `main`.

## 3. V2 objectives

The V2 must become:

1. **Correct** — balances and history must remain internally consistent.
2. **Recoverable** — backup and restore must be validated, versioned and tested.
3. **Auditable** — common human errors must be correctable without silently destroying history.
4. **Consistent** — dashboard, reseller detail, search, PDF and analytics must tell the same financial story.
5. **Usable** — routine operations should require few steps on desktop and mobile.
6. **Testable** — critical regressions must be caught before publication.
7. **Maintainable** — another conversation/AI instance must be able to reconstruct project state from repository documents.
8. **Adequate to the store** — new modules must be driven by real operational requirements, not speculative feature accumulation.

## 4. Non-goals for the current foundation work

Until the relevant decision gates are reached, do **not** assume that V2 requires:

- a full rewrite;
- Next.js;
- Supabase or another backend;
- authentication or multi-user access;
- inventory control;
- complex ERP behavior;
- broad visual redesign;
- dozens of additional dashboards.

These may be considered only when justified by later requirements.

## 5. Canonical work sequence

The V2 roadmap is organized into these phases:

- **P0 — State and governance**
- **P1 — Referential integrity and safe deletions**
- **P2 — Correction, reversal and audit trail**
- **P3 — Dates, balances and financial statements**
- **P4 — Persistence architecture decision: local vs cloud**
- **P5 — Backup, restore and migration**
- **P6 — Tests, CI and deployment safety**
- **P7 — Incomplete UX flows and operational refinement**
- **P8 — Store/Duda requirements discovery**
- **P9 — Prioritized new modules**
- **P10 — Controlled beta, migration and cutover**

Large new features should not outrun the P0–P6 foundation.

## 6. Known critical risks at the baseline

The current audit identified at least these risks:

- deleting a reseller can leave transactions behind, allowing financial totals without an identifiable reseller record;
- deleting an item can leave historical references to a removed catalog entity;
- transaction deletion exists at hook level but there is no robust operational correction/reversal flow in the UI;
- transaction occurrence date is not modeled separately from record creation time;
- period statements currently calculate the net movement inside the period rather than an opening-balance → movement → closing-balance model;
- aging is based on time since the reseller’s last movement, not necessarily the age of each debt;
- backup validation is shallow before destructive replacement of local data;
- some E2E tests no longer match the current UI;
- deployment builds and publishes from `main` without requiring the full test suite;
- legacy `tasks/` checkboxes do not reflect actual implementation state.

These are backlog inputs, not permission to change them outside the active phase.

## 7. Repository governance

### Branch roles

- `main`: stable reference copied from the original Easy; not an experimentation branch.
- `develop`: V2 integration branch.
- `feature/*`: isolated implementation/documentation work derived from `develop`.

### Integration rule

A coherent change should follow:

`defined work -> feature branch -> implementation/docs -> validation/tests -> PR -> review -> develop`

No V2 development should target the original `viniciuscasarin/easy` repository.

## 8. Sources of truth

For V2 work, use the following precedence:

1. `docs/V2/STATUS.md` — current state and `NEXT_ACTION`;
2. `docs/V2/PROJECT_SPEC.md` — product intent and invariants;
3. `docs/V2/ARCHITECTURE.md` — verified technical baseline and architectural decisions;
4. `docs/V2/BACKLOG.md` — ordered work and phase gates;
5. `docs/V2/DECISIONS.md` — accepted decisions and rationale;
6. `docs/V2/QA_LEDGER.md` — known QA evidence/gaps;
7. `docs/V2/CHANGELOG.md` — material project-state changes.

The historical `tasks/` directory is useful evidence of past intentions, but its checkbox state is **not** canonical project status.

## 9. Change discipline

Every completed phase should leave:

- the code or decision completed;
- corresponding validation/tests;
- documentation updated;
- a single explicit next action.

Do not consider a phase complete solely because the UI appears to work.

## 10. P8-S1 repository-evidence requirements boundary

P8-S1 inspected original repository prompts, historical PRDs, README/canonical material and repository issues. Detailed evidence and trigger classification are recorded in `docs/V2/P8_DISCOVERY.md`.

The evidence confirms the existing core workflows, administrator use, desktop/mobile operation, PDF sharing, JSON backup/portability and the existing reporting/analytics intent. A later responsiveness requirement also describes a reseller consulting their own statement on mobile; however the repository does not define whether that means independent access to a shared live dataset, use of an administrator-controlled device, manual data transfer or another interaction model.

Therefore the following remain **unconfirmed real-store requirements**, not implementation permission:

- concurrent operation by multiple people on one dataset;
- automatic live sharing across devices;
- reseller/employee accounts, permissions or person-level authorship;
- remote recovery SLA/RTO/RPO;
- trusted server integrations;
- security/privacy policy incompatible with browser-local storage;
- production data scale, connectivity constraints and unmet P9 module/reporting needs.

D-016 remains authoritative after P8-S1 because no repository artifact proves one of its reopen triggers. Direct real-store evidence is required before changing the local-first/single-user persistence decision.
