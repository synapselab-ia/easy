# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P3-S2 formal statements, FIFO debt aging and P3 closure

### Added

- shared `StatementPeriod` model: opening balance → period movements → closing balance;
- grouped reseller balance and total-debt rules;
- derived outstanding-debt lots with FIFO payment/signal allocation;
- debt-age categories based on open order occurrence;
- formal period summary in reseller detail and PDF;
- targeted P3-S2 domain/dashboard/reseller/PDF tests;
- D-015 documenting statement, debt-total and aging semantics.

### Changed

- filtered reseller balance no longer means only net movement in the selected window;
- reseller detail and PDF consume the same statement object;
- zero-movement periods remain valid statements;
- dashboard `Dívida Total` sums positive reseller balances rather than netting unrelated credits;
- aging no longer uses time since last activity: payments/signals reduce oldest effective order debt first for derived aging;
- dashboard copy describes debt still open rather than reseller inactivity;
- performance balance uses the shared signed-effect rule;
- Dexie remains V4 and no payment↔order link is persisted;
- P3 moved from `IN_PROGRESS` to `DONE`.

### QA

- run `32053655161` passed all new P3-S2 gates but stopped on two obsolete reseller-detail assertions for replaced period/PDF behavior;
- those assertions were reconciled without runtime change;
- final targeted P3-S2 gate, P3-S1/P2/P1 regressions and build passed in `32053837309`;
- repository-wide QA debt remains P6.

### Scope unchanged

No backend/auth/cloud implementation, P5 backup hardening or P6 global CI/deploy cleanup.

### Canonical state

P3-S1 `DONE`; P3-S2 `DONE`; P3 `DONE`; D-015 accepted; `NEXT_ACTION` advances to P4 persistence architecture decision.

---

## 2026-08-17 — P3-S1 occurrence-date model

- `occurredAt` separated from audit `createdAt`, Dexie V4 added and date consumers aligned;
- validation `32052076684`; P3 advanced to `IN_PROGRESS`.

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement and wrong-value/wrong-reseller correction;
- validation `32042373332`; P2 closed.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp and reversal-aware financial rules;
- validation `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict reference matrix and migration preservation coverage;
- validation `32039763539`; P1 closed.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration and snapshot preservation;
- validation `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration and active-only new activity;
- validation `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established; no runtime impact.
