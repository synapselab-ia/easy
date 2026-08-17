# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P1-S1 safe reseller lifecycle

### Added

- reseller `isActive` lifecycle state;
- Dexie schema V2 migration that defaults existing resellers to active;
- reversible reseller archive/reactivate mutations;
- hard-delete protection when a reseller has financial transactions;
- transaction-creation guard that rejects inactive or missing resellers;
- inactive-state visibility in reseller list, global search and detail/history;
- targeted automated coverage for lifecycle, migration, search, transaction selection/guards and reseller integration.

### Changed

- normal reseller removal now archives instead of destructively deleting the identity;
- new transaction forms list only active resellers;
- archived reseller records remain available for historical attribution and statement/PDF flows;
- canonical P1 state advanced: P1-S1 is complete and P1-S2 is the new `NEXT_ACTION`.

### QA

- targeted P1-S1 test gate passed in GitHub Actions run `32037965651`;
- `npm run build` passed in the same run;
- repository-wide lint/test debt remains explicitly open for P6 and is not represented as resolved by this slice.

### Scope not changed

- item lifecycle remains P1-S2;
- remaining referential validation/migration remains P1-S3;
- transaction reversal/correction remains P2;
- date/statement semantics remain P3;
- persistence remains Dexie/IndexedDB pending P4.

---

## 2026-08-17 — P0 governance and state reconstruction

### Added

- canonical V2 product specification;
- verified architecture baseline;
- canonical phased backlog P0–P10;
- decision ledger;
- QA ledger;
- canonical status/next-action document.

### Governance established

- `synapselab-ia/easy` designated as V2 laboratory;
- `main` designated as stable copied baseline/reference;
- `develop` designated as V2 integration branch;
- `feature/*` designated for isolated work;
- legacy `tasks/` checkboxes explicitly demoted from canonical status tracking.

### Baseline state reconstructed

Documented the current application as:

- React/TypeScript/Vite static SPA;
- Dexie/IndexedDB local persistence;
- items, resellers and transactions as core entities;
- GitHub Pages deployment from `main`;
- existing dashboard, PDF, backup, search, responsive UI and analytics;
- existing automated-test infrastructure with known stale E2E expectations.

### Risks recorded

- reseller deletion can orphan financial transactions;
- item deletion can weaken historical references;
- no robust audited transaction-correction flow;
- date-of-occurrence is not distinct from creation timestamp;
- statement period semantics need clarification;
- current aging is not necessarily true debt aging;
- backup import validation is shallow for destructive restoration;
- deployment is not gated by the full quality suite.

### Runtime impact

None. P0 intentionally changes documentation/governance only.
