# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

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
