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

## P5 — Backup, restore and migration

**Status:** PASS / DONE.

### P5-S1 — versioned backup and non-destructive preflight

Validation run **`32058028793` — PASS**.

Verified:

- `easy-backup` v2 logical envelope and source schema V4;
- v1 in-memory lifecycle/occurrence migration;
- required fields, IDs/duplicates, dates, values and references;
- P1 lifecycle and P2/P3 audit/linkage invariants;
- valid/invalid preflight performs no destructive mutation;
- preview UI is gated on successful validation;
- migrations/P1/P2/P3 regressions and build.

### P5-S2 — checkpointed atomic restore and migration proof

**Runtime changed:** Yes — restore service and restore UI.  
**Schema changed:** No; remains Dexie V4.  
**Architecture changed:** Recovery workflow only; D-016 local-first remains unchanged.

GitHub Actions run **`32060729538`**, job `95481183478` — **PASS**.

Targeted matrix passed:

- P5-S2 atomic restore integration;
- P5-S2 restore UI;
- P5-S1 backup/preflight regressions;
- Dexie V1→V4 migration regressions;
- P2 reversal/correction/history regressions;
- P1 item/reseller lifecycle regressions;
- P3 shared financial-domain regressions;
- `npm run build`.

#### Checkpoint gate

- [x] live database is read before destructive mutation;
- [x] current live rows are serialized as canonical v2 checkpoint;
- [x] checkpoint is deep-validated before replacement;
- [x] checkpoint JSON is downloaded before the destructive transaction starts;
- [x] checkpoint creation failure would prevent replacement from starting.

#### Restore-input gate

- [x] restore consumes the successful P5-S1 `BackupPreflightResult`;
- [x] normalized target is reserialized/revalidated immediately before checkpoint/write;
- [x] a mutated normalized target is rejected before checkpoint or database mutation.

#### Atomicity/post-restore gate

- [x] items/resellers/transactions are replaced in one Dexie transaction;
- [x] restored rows are read back inside the transaction;
- [x] complete P5-S1 reference/P1/P2/P3 validation reruns before commit;
- [x] canonical field/date/link projection must exactly match the expected target;
- [x] simulated `transactions.bulkAdd` failure after clears begin rolls back all table changes;
- [x] failure result explicitly reports previous database preserved.

#### Migration/financial proof

- [x] actual v2 `exportData()` output can be preflighted and restored into a clean database;
- [x] item/reseller/transaction IDs survive v2 round-trip;
- [x] active/inactive lifecycle state survives;
- [x] P2 reversal/replacement bidirectional links survive;
- [x] P3 occurrence date survives;
- [x] calculated financial balance is identical before/after v2 restore;
- [x] supported v1 restore materializes `isActive = true` and `occurredAt = createdAt` defaults;
- [x] v1 IDs and financial effect remain preserved.

### P5 result

**PASS / DONE.** QG-006 is resolved for the accepted local-first V2 recovery contract.

## Global baseline caveat

Targeted P1–P5 gates do **not** claim repository-wide lint/unit/integration/E2E health is green. Reconciliation and publication gating are the active P6 concern.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1.
- **QG-005 period statement/aging semantics:** RESOLVED / P3-S2.
- **QG-006 backup validation/recovery depth:** RESOLVED / P5.
- **QG-007 stale/global test expectations:** OPEN / P6.
- **QG-008 deployment does not require full QA:** OPEN / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.
- **QG-010 persistence architecture:** RESOLVED / P4.

## QA policy entering P6

Run the existing repository-wide baseline before editing expectations. Classify failures as real regressions vs stale tests/tooling, preserve accepted product semantics, and make publication conditional on the agreed critical gates rather than merely making CI appear green.
