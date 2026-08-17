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

## P3-S1 — Occurrence-date model

**Status:** PASS / DONE.  
**Schema:** Dexie V3 → V4.

Evidence: `32052076684` — PASS.

Verified financial occurrence separate from registration/audit, backward-safe migration, P2 correction occurrence preservation and occurrence-aware date consumers.

## P3-S2 — Statement and balance-period semantics

**Runtime changed:** Yes.  
**Schema changed:** No; remains Dexie V4.  
**UI changed:** Yes, formal period summary and debt-aging semantics.

### Formal statement verified

- [x] opening balance uses effective rows before period start;
- [x] movements use inclusive P3-S1 occurrence range;
- [x] reversed rows remain visible but contribute zero;
- [x] linked corrected rows remain auditable while only effective replacement contributes;
- [x] period movement is the shared signed financial effect;
- [x] closing balance = opening + movement;
- [x] future rows do not affect closing;
- [x] reseller detail and PDF use the same `StatementPeriod` object;
- [x] zero-movement periods remain valid statements with meaningful opening/closing balances.

### Debt/aging model verified

- [x] total debt sums positive reseller balances instead of globally netting credits/debts;
- [x] a recent payment does not make old remaining debt recent;
- [x] payment/signal credits apply FIFO to oldest effective order debt;
- [x] excess/prepayment credit carries forward to later orders;
- [x] reversed rows do not create/consume debt lots;
- [x] aging uses occurrence of the order amount still open;
- [x] buckets are 0–6d recent, 7–30d attention, >30d critical;
- [x] no persistent order/payment link or new schema is required.

### Cross-surface/regression verified

- [x] dashboard total debt and aging agree with shared domain rules;
- [x] search per-reseller balance remains green;
- [x] performance debtor balance remains per-reseller and reversal-aware;
- [x] P3-S1 dashboard/reseller/PDF occurrence regressions pass;
- [x] P2 transaction mutation/correction/history regressions pass;
- [x] P1 database migration/reseller/item lifecycle regressions pass;
- [x] production build passes.

### Automated evidence

Final successful GitHub Actions run: **`32053837309`**, job `95459326968` — **PASS**.

Earlier run **`32053655161`** stopped at two `ResellerDetailPage.test.tsx` expectations that encoded the replaced pre-P3-S2 behavior:

1. zero-movement period should warn and refuse PDF;
2. PDF should receive filtered rows + net period balance + date range.

The new P3-S2 domain/dashboard/ficha/PDF gates and earlier regressions were already green. Only those obsolete assertions were reconciled, with no runtime change, before the complete green run.

### P3 result

**PASS / DONE.** P3-S1 and P3-S2 are complete.

## Global baseline caveat

Targeted phase gates do **not** claim repository-wide lint/unit/integration/E2E health is green. Global reconciliation and deployment gating remain P6.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1.
- **QG-005 period statement/aging semantics:** RESOLVED / P3-S2.
- **QG-006 backup validation depth:** OPEN / P5.
- **QG-007 stale/global test expectations:** OPEN / P6.
- **QG-008 deployment does not require full QA:** OPEN / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.

## QA policy

For each functional phase: define acceptance first, add targeted tests with behavior changes, verify cross-surface consistency, record evidence/unresolved gaps, and distinguish the phase gate from global repository QA.
