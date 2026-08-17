# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

### Added

- bidirectional correction linkage between reversed original and replacement;
- atomic `useReplaceTransaction` for reversal + replacement in one Dexie write transaction;
- guided `Corrigir` flow for wrong-value and wrong-reseller cases;
- order correction preserving original type/item/observation and recomputing total from quantity × unit price;
- sanitization preventing normal transaction creation from forging audit metadata;
- history/PDF display of both linkage directions;
- provider-neutral future actor-attribution strategy without auth/backend implementation.

### Changed

- replacement creation keeps P1 active-reference validation;
- invalid replacement rolls the whole operation back;
- reversed original contributes zero and only the effective replacement contributes financially;
- Dexie remains V3 because linkage metadata is optional/non-indexed;
- P2 moved from `IN_PROGRESS` to `DONE`.

### QA

- final P2-S2 gate, P2/P1 regressions and build passed in run `32042373332`;
- earlier run `32042303986` stopped only on two split-DOM-text test assertions, corrected before the complete green gate;
- repository-wide QA debt remains P6.

### Canonical state

- P2-S1 `DONE`;
- P2-S2 `DONE`;
- P2 `DONE`;
- D-013 records atomic linkage and future actor strategy;
- `NEXT_ACTION` advances to P3-S1 — occurrence-date model and backward-safe migration.

---

## 2026-08-17 — P2-S1 audited transaction reversal

- added mandatory reversal reason/timestamp, shared effective/reversed financial rules and `useReverseTransaction`;
- reversed rows remain visible but financially neutral across reseller balance, dashboard, search and PDF;
- targeted gate/P1 regressions/build passed in run `32041280504`;
- P2 advanced to `IN_PROGRESS`.

---

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict new-transaction reference matrix and canonical order-item snapshot derivation;
- complete V1 → V2 → V3 preservation coverage without destructive historical repair;
- gate/build passed in run `32039763539`;
- P1 closed.

---

## 2026-08-17 — P1-S2 safe item lifecycle

- item active/inactive lifecycle, Dexie V3 migration, guarded deletion, active-only new orders and historical snapshot preservation;
- gate/build passed in run `32038951903`.

---

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller active/inactive lifecycle, Dexie V2 migration, guarded deletion, active-only new transactions and preserved historical attribution;
- gate/build passed in run `32037965651`.

---

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 specification, architecture, backlog, decisions, QA ledger and status established;
- `synapselab-ia/easy` designated V2 laboratory;
- `main` stable reference, `develop` integration and `feature/*` isolated work;
- no runtime impact.
