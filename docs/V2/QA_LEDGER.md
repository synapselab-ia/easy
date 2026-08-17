# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records targeted phase evidence separately from repository-wide QA health.

## P0

State/governance established; no runtime QA claim.

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

- P1-S1: `32037965651`.
- P1-S2: `32038951903`.
- P1-S3: `32039763539`.

## P2 — Correction/reversal

**Status:** PASS / DONE.

- P2-S1 audited reversal: `32041280504`.
- P2-S2 linked/guided replacement: `32042373332`.

## P3 — Dates, statements and aging

**Status:** PASS / DONE.

- P3-S1 occurrence-date model: `32052076684`.
- P3-S2 formal statements/FIFO debt aging: `32053837309`.

## P4 — Persistence architecture decision

**Status:** PASS / DONE.  
Decision-only gate; D-016 accepts local-first/single-user Dexie V4. No runtime test claim.

## P5-S1 — Versioned backup contract and non-destructive restore preflight

**Runtime changed:** Yes — export/preflight service and backup flow.  
**Schema changed:** No; remains Dexie V4.  
**UI changed:** Yes — import confirmation replaced by validation/preview only.

### Contract and migration verified

- [x] v2 logical envelope identifies `easy-backup`, backup version 2 and source Dexie schema 4;
- [x] export reads all three tables and self-validates before download;
- [x] current v1 input remains supported through in-memory normalization;
- [x] v1 missing item/reseller `isActive` becomes `true`;
- [x] v1 missing transaction `occurredAt` becomes `createdAt`;
- [x] explicit P3 occurrence remains preserved;
- [x] unsupported/malformed JSON is rejected.

### Deep preflight verified

- [x] required arrays/fields are validated;
- [x] IDs must be positive integers and duplicate IDs are rejected per table;
- [x] required text, dates and positive finite numeric values are validated;
- [x] item/reseller lifecycle date chronology is validated;
- [x] order item snapshot fields are required and payment/signal item fields are rejected;
- [x] transaction reseller/item references must resolve;
- [x] reversal reason/timestamp and correction/replacement IDs are validated;
- [x] P2 linked correction must be bidirectional;
- [x] linked replacement preserves transaction type;
- [x] corrected orders preserve item identity;
- [x] P3 linked replacement preserves original `occurredAt`;
- [x] replacement registration cannot precede original registration.

### Non-destructive safety verified

- [x] successful preflight returns normalized data plus preview only;
- [x] preview includes versions, schema, timestamp, migration warnings and entity/audit counts;
- [x] invalid input does not invoke Dexie write transaction, `clear()` or `bulkAdd()`;
- [x] valid preflight also does not mutate IndexedDB;
- [x] backup UI no longer exposes a destructive `Importar` action in P5-S1;
- [x] invalid UI preflight does not open the preview;
- [x] destructive restore is explicitly deferred to P5-S2 checkpoint/atomic-restore work.

### Regression/build evidence

GitHub Actions run **`32058028793`**, job `95472576213` — **PASS**.

The targeted matrix passed:

- P5-S1 backup contract tests;
- backup preflight UI tests;
- P3 occurrence backup compatibility;
- Dexie V1→V4 migration regressions;
- P2 transaction reversal/correction/history regressions;
- P1 item/reseller lifecycle regressions;
- P3 shared financial-domain regressions;
- `npm run build`.

### P5 result so far

P5-S1: **PASS / DONE**.  
P5 remains **IN_PROGRESS** because recoverable checkpoint, atomic replacement and post-restore migration proof belong to P5-S2.

## Global baseline caveat

Targeted phase gates do **not** claim repository-wide lint/unit/integration/E2E health is green. Global reconciliation and deployment gating remain P6.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1.
- **QG-005 period statement/aging semantics:** RESOLVED / P3-S2.
- **QG-006 backup validation depth:** PARTIALLY RESOLVED / P5-S1. Versioned deep preflight is resolved; checkpointed atomic restore and recovery proof remain P5-S2.
- **QG-007 stale/global test expectations:** OPEN / P6.
- **QG-008 deployment does not require full QA:** OPEN / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.
- **QG-010 persistence architecture:** RESOLVED / P4.

## QA policy

For each functional phase: define acceptance first, add targeted tests with behavior changes, verify cross-surface consistency, record evidence/unresolved gaps, and distinguish the phase gate from global repository QA.
