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
**Status:** ACCEPTED / SUPERSEDED BY D-016, THEN D-029 FOR FINAL PRODUCTION.

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

## D-013 — Replacement correction is atomic and linked
**Status:** ACCEPTED  
Wrong-value/wrong-reseller/full-field correction creates a linked replacement and reverses the original atomically. Historical rows are not destructively rewritten.

D-029 changes the persistence technology but not this atomicity requirement. The Supabase implementation must provide one PostgreSQL/server transaction boundary rather than multiple independent client requests.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
`occurredAt` is business time, `createdAt` registration time, `reversal.reversedAt` audit time.

## D-015 — Statements and FIFO debt aging
**Status:** ACCEPTED  
Statements use opening → movements → closing. Debt aging consumes effective order debt FIFO; reversed rows have zero effect.

## D-016 — V2 remains local-first/single-user until an explicit cloud trigger is proven
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED FOR FINAL PRODUCTION BY D-029  
**Original date:** 2026-08-17  
**Superseded for final production:** 2026-08-20

D-016 was the correct bounded decision at P4/P8: no then-available evidence justified speculative backend/auth/cloud DB/live sync.

D-029 later accepts a new explicit durability requirement and therefore reopens this decision before real data is moved into the V2 beta.

D-016 remains relevant to historical evidence and to the current browser-local stable system until cutover; it no longer defines the target final production persistence topology.

## D-017 — Backup v2 is the canonical logical recovery/interchange contract
**Status:** ACCEPTED / EXTENDED BY D-025 / RETAINED BY D-029  
Logical `easy-backup` version 2 remains independent of Dexie schema version; current exports are schema5 and legacy inputs remain losslessly supported.

Under D-029 the logical Easy export remains an independent contingency/portability layer even after managed cloud backup becomes primary durability.

## D-018 — Restore requires validated checkpoint + verified atomic Dexie replacement
**Status:** ACCEPTED FOR CURRENT LOCAL INTERCHANGE PATH / EXTENDED BY D-025  
Atomic local recovery covers categories/items/resellers/transactions with post-write verification.

D-029 does not claim that this Dexie restore is the final server restore mechanism. P10-S3 must define cloud import/rollback separately while preserving the logical backup contract.

## D-019 — Critical QA is mandatory
**Status:** ACCEPTED

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

Objective failures block integration. Supabase-bearing work also requires database/policy verification and advisor review; D-019 remains necessary but is not the only cloud acceptance evidence.

## D-020 — P7 prioritizes operator-intent/error risks
**Status:** ACCEPTED.

## D-021 — Repository evidence alone does not reopen D-016
**Status:** ACCEPTED HISTORICALLY  
Repository evidence alone did not reopen D-016. D-029 is based on a later explicit final-product durability requirement, not on reinterpreting the old repository evidence.

## D-022 — Direct store validation kept D-016 and confirmed recovery/category/correction needs
**Status:** ACCEPTED HISTORICALLY  
This remains true for the evidence captured at P8. D-029 records a later change of accepted final persistence requirements.

## D-023 — P9 evidence-backed ordering
**Status:** ACCEPTED  
Order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

## D-024 — Synchronized recovery-copy folder + 24-hour freshness guard
**Status:** ACCEPTED / IMPLEMENTED / TRANSITIONAL UNDER D-029  
D-024 protected the local-first runtime without Drive API/OAuth/backend/cloud/live sync.

After D-029:

- D-024 remains mandatory for the current browser-local stable production system until cloud cutover;
- it remains relevant to any still-local candidate operation before cutover;
- it is **not** the intended final primary durability mechanism once Supabase/Postgres is canonical and managed backup readiness is proven;
- logical/manual Easy exports remain available after cutover, but cloud-backed production writes should not depend on an operator manually exporting every 24 hours.

## D-025 — Category classification is snapshot-based; legacy history is not retroactively invented
**Status:** ACCEPTED / FULLY IMPLEMENTED AND INTEGRATED  
**Date:** 2026-08-18  
**Implementation completed:** 2026-08-19

Accepted semantics:

- stable category identity with reversible lifecycle;
- active-category item classification and future-only reassignment effect;
- new-order `categoryId + categoryName` transaction-time snapshots;
- lossless legacy migration with no fabricated category history;
- legacy no-snapshot orders remain `Sem categoria — histórico legado` in reports;
- order-only category analysis uses `occurredAt`, historical `transaction.categoryId`, order count, quantity and gross value;
- effective linked correction contributes only through the non-reversed replacement;
- archived categories remain reportable;
- payments/signals/balances/FIFO debt are not allocated to categories.

D-029 requires the Supabase/Postgres schema/import path to preserve these transaction-time snapshots and non-inventive migration semantics.

Implementation completed through P9-S3 I1/I2/I3; final I3 D-019 `32262877105` / `96100129962`; PR #48 integrated as `08ad2973f387035301901f9f46b0c78039796c2d`.

## D-026 — Effective transaction business fields are correctable through audited linked replacement
**Status:** ACCEPTED / FULLY IMPLEMENTED AND INTEGRATED  
**Date:** 2026-08-19

Accepted semantics:

- original transaction row/business values remain immutable;
- correction requires an explicit reason and atomically creates a linked replacement plus audited reversal;
- replacement may change reseller, transaction type, `occurredAt` and observation;
- target orders may change item, quantity and unit price/derived total;
- target payments/signals may change movement value;
- target-shape validation follows replacement type;
- audit metadata is system-controlled;
- same-item order correction preserves original D-025 snapshot;
- changed/new order item requires current active/classified target and captures a current snapshot;
- changing to non-order removes order/item/category fields from the replacement only;
- reversed original is never recategorized or rewritten.

P9-S4-I1 implemented the full-field replacement editor. Final runtime proof: D-019 `32285620846` / `96174326588`; PR #54 squash-integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

D-029 requires this operation to remain atomic after moving to Supabase.

## D-027 — P10 uses a fail-closed non-production pre-cutover compatibility/rehearsal gate
**Status:** ACCEPTED  
**Date:** 2026-08-19

P10 must not move live-store data or publish V2 merely because prior feature work is complete or a candidate deploy is READY.

D-027 required exact candidate identity, stable→V2 transfer through explicit backup/preflight/restore, backup-v1 compatibility, D-024 recovery readiness and a synthetic rehearsal before any real-data gate.

P10-S1 satisfied this contract. The fail-closed sequencing principle continues under D-029.

Detailed historical plan: `docs/V2/P10_CUTOVER_PLAN.md`.

## D-028 — Copied-live-data beta is isolated, exact-reconciliation, recoverable and disposable
**Status:** ACCEPTED HISTORICALLY / FINAL ROUTE SUPERSEDED BY D-029  
**Date:** 2026-08-20

D-028 defined a safe non-production IndexedDB beta using one point-in-time copy of the actual live-store dataset.

It required:

1. exact candidate SHA/tree + passing D-019 + READY deployment identity before export;
2. isolated single-operator beta context;
3. copied real data confined to approved operator/recovery boundaries;
4. no identifiable payloads in Git/GitHub/CI/chat/docs;
5. only accepted stable-v1 normalization warnings;
6. exact structural reconciliation before beta mutations;
7. zero-cent-tolerance financial reconciliation;
8. D-018 checkpoint + D-024 block/setup/current proof;
9. rollback baseline;
10. minimum classification/order/D-026 beta checks;
11. final fresh-context identical round-trip;
12. fail-closed NO-GO on any mismatch/breach;
13. 24-hour disposal of beta-specific copied real data.

P10-S2-I1 began only the pre-export checklist and stopped fail-closed before any real backup was exported. No real-data beta artifact was created and the disposal clock never started.

D-029 then superseded **resuming** this IndexedDB real-data beta because the final persistence target changed to Supabase/Postgres. D-028 remains historical evidence, not the current migration route.

Detailed contract: `docs/V2/P10_S2_BETA_GATE.md`.

## D-029 — Final V2 uses Supabase/Postgres canonical persistence with Vercel hosting; manual backup remains secondary defense
**Status:** ACCEPTED  
**Date:** 2026-08-20

### Trigger

Before P10-S2-I1 exported any real store backup, an explicit final-product durability requirement was accepted: normal production durability should no longer depend primarily on a person remembering to create/synchronize browser-local backups, while the system should retain an independent logical/manual backup option for contingency and portability.

This is an explicit D-016 reopen trigger.

### Accepted target

1. **Supabase/Postgres becomes the target canonical production business datastore.**
2. **Vercel remains the target frontend/application hosting platform.**
3. Supabase Auth is mandatory before production.
4. RLS is mandatory on every exposed application table; anonymous business-data access is forbidden.
5. Browser/client code may use only project URL + publishable key. `service_role`/secret credentials may never be shipped to the client or committed.
6. Authorization must identify the actual approved Easy operator/store access; merely being `authenticated` is not sufficient authorization by itself.
7. User-editable metadata is not trusted for authorization decisions.
8. The first cloud production model remains operationally single-operator/admin; reseller/employee self-service is not implied.
9. Dexie/IndexedDB becomes transitional migration substrate and optional cache, not final canonical persistence.
10. First migration does not introduce offline queued financial writes/multi-master synchronization. Connectivity loss may fail writes closed.
11. Existing D-009 through D-015, D-025 and D-026 business invariants remain mandatory.
12. D-013/D-026 correction/reversal must remain atomic through one PostgreSQL/server transaction boundary, not sequential browser mutations.
13. PostgreSQL should enforce critical integrity with keys, foreign keys where compatible with preserved historical semantics, checks, indexes and transaction boundaries.
14. Existing stable-v1 IDs and historical snapshots must be preservable by the import design; identity/sequence state must be reset safely after imported IDs.
15. The real store dataset should move **once** into the final cloud architecture rather than first into a disposable IndexedDB beta and then again into Supabase.
16. P10-S2-I1 is therefore `ABANDONED / SUPERSEDED BEFORE EXPORT`; no real-data disposal is required because none moved.
17. A dedicated Easy Supabase project is required; unrelated application databases must not be reused.
18. Schema migrations and RLS policies must be reproducible/versioned from repository state before real data.
19. Managed Supabase database backup is the intended primary durability layer after cloud cutover.
20. Logical/manual Easy backup/export remains available as independent secondary recovery/portability.
21. D-024 remains active for the current browser-local stable system until cutover, but its 24-hour human-export write guard is not intended as final cloud durability.
22. Production must use a Supabase tier/backup arrangement that actually supports the accepted managed-durability claim; a free/pausable tier alone is not sufficient evidence for final cutover.
23. PITR is optional and requires a later explicit RPO/cost decision.
24. No real store data may enter Supabase until the synthetic schema/Auth/RLS/transactional-integrity foundation passes its own gate.
25. D-029 itself does not publish `main`, switch the canonical URL or authorize production cutover.

### Implementation evidence and next gate

P10-S3-I1 accepted a dedicated `easy-v2` project in `sa-east-1`, the `easy_operators` allow-list authorization model, reproducible schema migrations, RLS on all exposed application tables, controlled transactional financial RPCs and a typed publishable-key-only client foundation. Synthetic proof and advisors passed; no real store data moved.

P10-S3-I2 is now the bounded contract-definition gate for real-data migration/reconciliation and production durability. The current paid-infrastructure budget is US$ 0. This is a constraint, not a silent reversal of item 22 above: if an acceptable zero-cost recovery posture cannot satisfy D-029, production cutover remains blocked.

Detailed authoritative contract: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

---

# Open decisions

- with current paid-infrastructure budget fixed at US$ 0, whether a zero-cost production/recovery posture can satisfy D-029; otherwise production cutover remains blocked;
- whether PITR or another paid durability mechanism becomes justified only if budget constraints later change;
- whether a later observed offline-write requirement justifies a durable outbox/synchronization protocol;
- whether any future directly observed inactive-entity correction case justifies a bounded lifecycle exception beyond D-026;
- final write-freeze, rollback and stable-publication policy after the Supabase real-data migration/reconciliation gate passes.
