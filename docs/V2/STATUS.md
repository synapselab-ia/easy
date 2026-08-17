# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P4 — Persistence architecture decision: local vs cloud**  
**State:** `NOT_STARTED`

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
  - P3-S1 occurrence-date model: `DONE`.
  - P3-S2 statement/balance-period semantics: `DONE`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source needed for `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB. It manages items, resellers, orders, payments/signals, balances, dashboard analytics, PDF statements, JSON backup/restore and global search. There is no application backend or authentication layer.

## Completed financial foundation

### P1/P2

- reversible reseller/item lifecycle and strict new references;
- historical snapshots preserved;
- audited non-destructive reversal;
- atomic linked correction/replacement;
- reversed rows stay visible but financially neutral;
- no fabricated actor identity before P4.

### P3-S1 — financial occurrence

- Dexie schema is **V4**;
- `occurredAt` = financial occurrence;
- `createdAt` = registration/audit time;
- `reversal.reversedAt` = reversal/correction audit time;
- old rows migrate backward-safely with missing `occurredAt = createdAt`;
- financial date consumers use `occurredAt`;
- linked correction preserves the original occurrence date.

### P3-S2 — formal statement contract

`buildStatementPeriod()` defines:

- opening balance = effective financial effect strictly before the start;
- movements = all audit-visible rows with occurrence inside the inclusive period;
- reversed rows remain visible but contribute zero;
- period movement = signed effective effect of period rows;
- closing balance = opening balance + period movement.

Reseller detail and PDF use this same contract. A zero-movement period remains a valid statement.

### P3-S2 — debt and aging contract

- individual reseller balance remains shared all-time effective balance;
- **Dívida Total** = sum of positive reseller balances; one reseller's credit cannot offset another's debt;
- “time since last movement” aging is rejected as insufficient;
- debt aging uses derived **FIFO** allocation: payments/signals reduce oldest effective order debt first, and excess credit carries forward;
- no persistent payment↔order relationship or new schema is invented;
- aging reflects occurrence of debt still open: recent 0–6d, attention 7–30d, critical >30d;
- one reseller may have outstanding amounts in multiple buckets.

## P3-S2 completion evidence

- [x] opening → movements → closing shared domain rule;
- [x] reseller detail and PDF consume the same statement object;
- [x] zero-movement statements preserve opening/closing balances;
- [x] P2 audit rows remain visible with correct effective amounts;
- [x] total debt does not net credits across resellers;
- [x] FIFO aging keeps old outstanding debt old after later payments;
- [x] prepayment credit carries forward without invented debt;
- [x] P3-S1/P2/P1 regressions remain green;
- [x] targeted gate `32053837309` passed, including `npm run build`;
- [x] P3 is closed.

Earlier run `32053655161` stopped only on two obsolete reseller-detail expectations for the pre-P3-S2 period/PDF contract. The new behavioral gates were already green; those expectations were reconciled before the complete pass.

## Remaining high-priority risks

1. Persistence architecture/user/device/concurrency/authorship/security/offline requirements — P4.
2. Backup versioning and deep restore validation — P5.
3. Repository-wide QA/deployment gating — P6.
4. Remaining operational UX gaps — P7.

## Active constraints entering P4

- no work directly on `main` or original repository;
- no backend/auth/cloud implementation until P4 decision is accepted;
- preserve P1/P2/P3 invariants;
- P4 is a decision gate, not permission to implement a chosen backend prematurely;
- do not pull P5/P6 work into P4.

## NEXT_ACTION

**P4 — Persistence architecture decision: local vs cloud. Create a new feature branch from `develop` and execute only the architecture decision gate: inventory the real operating requirements that determine persistence — users/operators, devices and locations, concurrency, authorship/audit attribution, security/privacy, offline expectations, recovery/backup and migration constraints — then compare keeping the current local Dexie model against introducing remote persistence/authentication. Record one evidence-backed decision with rationale, costs, risks and migration implications. Do not implement backend, authentication or cloud persistence until that decision is accepted.**

## P4 completion direction

P4 closes with one accepted persistence architecture decision covering users/devices, concurrency, actor identity, security/privacy, offline behavior, recovery ownership, operating costs/failure modes and migration implications for Dexie V4, followed by one explicit implementation/next action.
