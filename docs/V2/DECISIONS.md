# Easy V2 — Decision Ledger

**Updated:** 2026-08-20

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, isolated work branches derive from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED.

## D-005 — No full rewrite by default
**Status:** ACCEPTED.

## D-006 — Dexie/IndexedDB remains baseline until P4
**Status:** ACCEPTED / SUPERSEDED BY D-016.

## D-007 — Preserve financial history over destructive deletion
**Status:** DIRECTION ACCEPTED.

## D-008 — Centralize financial domain rules over time
**Status:** DIRECTION ACCEPTED.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Preserve original row, require reversal reason/timestamp, keep reversed rows visible with zero financial effect.

## D-013 — Replacement correction is atomic, linked and actor-neutral under D-016
**Status:** ACCEPTED  
Wrong-value/wrong-reseller correction creates a linked replacement and reverses the original atomically. Historical rows are not destructively rewritten.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
`occurredAt` is business time, `createdAt` registration time, `reversal.reversedAt` audit time.

## D-015 — Statements and FIFO debt aging
**Status:** ACCEPTED  
Statements use opening → movements → closing. Debt aging consumes effective order debt FIFO; reversed rows have zero effect.

## D-016 — V2 remains local-first/single-user until an explicit cloud trigger is proven
**Status:** ACCEPTED  
No backend/auth/cloud DB/live sync is introduced without direct evidence proving a reopen trigger. Local Dexie schema evolution does not itself reopen D-016.

## D-017 — Backup v2 is the canonical logical recovery contract
**Status:** ACCEPTED / EXTENDED BY D-025  
Logical `easy-backup` version 2 remains independent of Dexie schema version; current exports are schema5 and legacy inputs remain losslessly supported.

## D-018 — Restore requires validated checkpoint + verified atomic Dexie replacement
**Status:** ACCEPTED / EXTENDED BY D-025  
Atomic recovery covers categories/items/resellers/transactions with post-write verification.

## D-019 — Critical QA is mandatory
**Status:** ACCEPTED

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

Objective failures block integration.

## D-020 — P7 prioritizes operator-intent/error risks
**Status:** ACCEPTED.

## D-021 — Repository evidence alone does not reopen D-016
**Status:** ACCEPTED.

## D-022 — Direct store validation keeps D-016 and confirms recovery/category/correction needs
**Status:** ACCEPTED.

## D-023 — P9 evidence-backed ordering
**Status:** ACCEPTED  
Order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

## D-024 — Synchronized recovery-copy folder + 24-hour freshness guard
**Status:** ACCEPTED / IMPLEMENTED  
Keeps D-016, canonical backup/restore and operator-run recovery; no Drive API/OAuth/backend/cloud/live sync introduced.

## D-025 — Category classification is snapshot-based; legacy history is not retroactively invented
**Status:** ACCEPTED / FULLY IMPLEMENTED AND INTEGRATED  
**Date:** 2026-08-18

Accepted semantics remain:

- stable category identity with reversible lifecycle;
- active-category item classification and future-only reassignment effect;
- new-order `categoryId + categoryName` transaction-time snapshots;
- lossless legacy migration with no fabricated category history;
- legacy no-snapshot orders remain `Sem categoria — histórico legado` in reports;
- order-only category analysis uses `occurredAt`, historical `transaction.categoryId`, order count, quantity and gross value;
- effective linked correction contributes only through the non-reversed replacement;
- archived categories remain reportable;
- payments/signals/balances/FIFO debt are not allocated to categories;
- Dexie V5 + logical backup v2/schema5 + four-table D-018 restore remain authoritative.

Implementation completed through P9-S3; final I3 D-019 `32262877105` / `96100129962`; PR #48 integrated as `08ad2973f387035301901f9f46b0c78039796c2d`.

## D-026 — Effective transaction business fields are correctable through audited linked replacement
**Status:** ACCEPTED / FULLY IMPLEMENTED AND INTEGRATED  
**Date:** 2026-08-19

D-026 extends D-012/D-013 without destructive history editing:

- original transaction/business values remain immutable;
- correction requires a reason and atomically creates linked replacement + reversal;
- replacement may change reseller, type, `occurredAt`, observation and applicable order/payment fields;
- target-shape validation follows replacement type;
- audit metadata remains system-controlled;
- same-item order correction preserves historical D-025 category snapshot;
- changed order item requires a current active/classified target and captures its current item/category snapshot;
- order→non-order removes order/category fields from the replacement only;
- inactive/missing historical item references are not silently reused for new state;
- D-024 write enforcement remains mandatory;
- no schema/backend/cloud change is implied.

Runtime implementation proof: D-019 `32285620846` / `96174326588`; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; validated/integrated tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## D-027 — P10 uses a fail-closed non-production pre-cutover compatibility/rehearsal gate
**Status:** ACCEPTED / SATISFIED BY P10-S1  
**Date:** 2026-08-19

P10-S1 could not move live-store data or publish V2 merely because P9 was complete or a candidate deploy existed.

Accepted sequencing required:

1. `main` untouched during P10-S1;
2. no live-store export/import;
3. Vercel `easy-v2` candidate/beta only;
4. exact D-019-passing candidate identity;
5. stable→V2 transfer only through explicit backup/preflight/restore;
6. backup validation aligned with D-026 while preserving D-025/reference/audit integrity;
7. legacy compatibility retained;
8. synthetic migration/recovery rehearsal before real copied-data work;
9. D-024 readiness and unclassified-item gating rehearsed;
10. copied-live-data beta and production cutover deferred to later explicit gates;
11. D-016 unchanged.

P10-S1 completed this contract: I1 integrated, I2 synthetic remote rehearsal passed 1/1, and canonical closure PR #63 integrated as `816794694d0a9b6c92da273a81ee745c2f53ecdc`.

Detailed record: `docs/V2/P10_CUTOVER_PLAN.md`.

## D-028 — Copied-live-data beta is isolated, exact-reconciliation, recoverable and disposable
**Status:** ACCEPTED  
**Date:** 2026-08-20  
**Applies to:** P10-S2 / P10-S2-I1

P10-S2 may use a copy of the actual live-store dataset only as a bounded, point-in-time, non-production acceptance exercise. Stable remains authoritative throughout.

### Candidate identity

Before any real-data export:

- one exact Git SHA/tree is recorded;
- that candidate has passing D-019 evidence;
- the exact browser deployment is READY and traceable to the Git SHA;
- any mutable public alias is independently reverified against the deployment ID at execution time.

Failure to prove identity is NO-GO before export.

### Data handling and access

- single designated operator on a trusted machine/browser context under D-016;
- beta origin must be clearly isolated from stable origin;
- copied real data may exist only in the source export, beta browser origin, D-018 checkpoint/V2 backup artifacts and the existing D-024 synchronized recovery boundary;
- no raw backup, identifiable screenshot/PDF or transaction payload may enter Git/GitHub, CI artifacts, chat or canonical docs;
- source snapshot identity is recorded through non-sensitive timestamp/file-size/SHA-256 metadata;
- beta state is disposable and must never synchronize or be manually promoted back into stable.

### Exact migration/reconciliation

Only already accepted v1 normalization is permitted: missing lifecycle → active, missing `occurredAt` → `createdAt`, no invented categories/history.

Before any beta business mutation:

- item/reseller/transaction and type counts must match exactly;
- IDs, references, stored monetary/business values and source dates must be preserved under the accepted normalization;
- semantic normalized-data diff must be empty apart from documented v1→V2 additions/envelope timestamps;
- gross order value, payment value, signal value, net movement, every reseller balance and aggregate positive reseller debt must reconcile exactly;
- there is **zero accepted financial tolerance**: any R$ 0,01 displayed difference is NO-GO.

Objective reconciliation cannot be replaced by human spot checks; sanitized representative checks are supplementary only.

### Recovery and rollback

Before normal beta writes:

1. D-018 restore/checkpoint must pass;
2. D-024 must be observed blocking normal writes before recovery setup;
3. a fresh V2 backup must be exported and explicitly synchronized/verified;
4. recovery health must become current;
5. that post-reconciliation backup becomes the beta rollback baseline.

If D-024 becomes due/overdue later, its write guard remains mandatory.

Any failure/mismatch is fail-closed. Default beta rollback is restoration of the rollback baseline or full disposal/clearing of the beta origin. Beta state is never written back to stable.

An accidental stable-origin write stops the beta and is treated as a production incident; it is not hidden merely to obtain a PASS.

### Minimum copied-data beta acceptance

After reconciliation/recovery pass, P10-S2-I1 must at minimum prove on disposable copied state:

- migrated unclassified-item order blocking;
- representative category creation/classification;
- one beta-only order;
- one audited D-026 correction of that beta-only transaction;
- correct original/replacement financial effect and linkage;
- final V2 export;
- disposable fresh-context restore/re-export with identical business data.

### Disposal

Within **24 hours after P10-S2-I1 is accepted, rejected or abandoned**, beta-specific copied real data must be removed from operator-controlled locations: source-copy export, beta checkpoints/exports/re-exports/PDFs, beta origin IndexedDB/recovery state and synchronized-folder beta artifacts. Local/browser/provider trash is emptied when directly available.

Only sanitized metadata, hashes, counts, candidate/CI identity, PASS/FAIL notes and disposal status may remain canonical. Ordinary stable data/pre-existing backup policy are not deleted.

### Authorization consequence

A P10-S2-I1 PASS authorizes only proposing/defining the next production-cutover gate.

It does **not** authorize final freeze, `main` publication, stable deployment/canonical URL switch, production restore/writes, post-production rollback or D-016 change.

Detailed authoritative contract: `docs/V2/P10_S2_BETA_GATE.md`.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- whether any future directly observed inactive-entity correction case justifies a bounded lifecycle exception beyond D-026;
- final write-freeze, production rollback and stable-publication policy after a successful P10-S2-I1 copied-live-data beta.
