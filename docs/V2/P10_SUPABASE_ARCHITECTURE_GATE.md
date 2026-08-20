# Easy V2 — P10 Supabase Architecture Gate

**Status:** `ACCEPTED DESIGN / P10-S3-I1 FOUNDATION PROVEN`  
**Date:** 2026-08-20  
**Decision:** D-029  
**Scope:** reopen D-016 before any copied-live-data beta export and redirect the final V2 toward Vercel + Supabase/Postgres

## 1. Why this gate exists

P10-S2-I1 stopped fail-closed before any real store backup was exported. At that boundary, the final architecture was explicitly reconsidered.

The accepted new product requirement is to remove routine human backup execution as the primary durability mechanism while retaining an independent manual backup/export capability as contingency and portability.

That requirement is a direct cloud trigger under D-016: browser-local IndexedDB can remain useful as cache/temporary migration substrate, but it must no longer be the sole authoritative production persistence layer for the final V2.

Therefore the prior copied-live-data beta route is abandoned before export and the architecture is redirected before real data is moved twice.

## 2. Decision summary

The target final topology is:

```text
Browser
  React + TypeScript + Vite
          |
          | supabase-js over HTTPS
          v
Vercel application
          |
          v
Supabase
  Auth
  Postgres  <-- canonical production data
  RLS
  constraints / indexes / transactional functions
  managed database backups
          |
          +--> independent logical/manual Easy backup remains available

Browser IndexedDB/Dexie
  transitional migration substrate and optional cache only
  NOT final canonical production data
```

The final production system will use **Supabase/Postgres as the canonical business datastore** and **Vercel as the application hosting path**.

## 3. D-016 status

D-016 is **REOPENED AND SUPERSEDED FOR THE FINAL V2 BY D-029**.

The original D-016 decision was correct for the evidence available at P4/P8: there was no demonstrated need for concurrent/shared cloud state at that time.

D-029 does not retroactively invalidate that evidence. It records a new explicit product/durability requirement accepted on 2026-08-20: final production durability must not depend on an operator remembering to create/synchronize a browser-local backup every 24 hours.

## 4. Effect on P10-S2 / D-028

D-028 remains valid historical evidence for how a copied-live-data IndexedDB beta would have been executed safely.

However **P10-S2-I1 is abandoned/superseded before export**:

- no real store backup was exported for the beta;
- no real store backup was imported into the V2 candidate;
- no real-data beta IndexedDB was created;
- no D-028 24-hour disposal clock started;
- no real data needs to be discarded from a beta because none moved.

The project must not resume the old D-028 real-data beta route unless D-029 is explicitly reversed by a later accepted decision.

## 5. Canonical persistence target

### 5.1 Source of truth

Supabase Postgres becomes the target source of truth for:

- categories;
- items;
- resellers;
- transactions;
- required application authorization metadata.

The existing domain semantics remain authoritative unless a later bounded decision explicitly changes them.

### 5.2 Existing invariants that must survive

Cloud migration must preserve at least:

- D-009/D-010 reversible reseller/item lifecycle;
- D-011 strict new references with preserved history;
- D-012 audited reversal rather than destructive financial deletion;
- D-013 atomic linked replacement correction;
- D-014 `occurredAt` distinct from registration/audit time;
- D-015 statement/balance/FIFO semantics;
- D-025 immutable historical category snapshots;
- D-026 full-field audited replacement semantics;
- stable-v1 non-inventive migration behavior already proven by P10-S1-I2.

## 6. Database enforcement strategy

The cloud design must move critical integrity from browser convention alone into PostgreSQL where practical.

Minimum database guarantees before any real-data import:

1. primary keys for all canonical entities;
2. foreign keys for live references and correction/reversal links where compatible with preserved historical semantics;
3. explicit allowed transaction types;
4. appropriate non-null, numeric and date constraints;
5. indexes for reseller history, financial occurrence ordering, category reporting and correction links;
6. migration preserves existing IDs and resets sequences/identity state safely after import;
7. historical snapshots remain stored on transaction rows rather than recomputed from current catalog/category names;
8. correction/reversal integrity cannot depend on two unrelated browser writes.

D-013 correction must remain atomic in Postgres. The implementation should use a transactional database function/RPC or another single server-side transaction boundary rather than sequential client mutations. Prefer normal invoker semantics and RLS-compatible design; privileged `SECURITY DEFINER` is not a default workaround.

## 7. Authentication and authorization

Supabase Auth is required before the cloud-backed V2 is eligible for production.

Initial scope remains operationally simple:

- one explicitly authorized store operator/admin is sufficient for first production use;
- no reseller self-service or employee permission matrix is introduced merely because Auth exists;
- future multi-user roles require a later bounded requirement/decision.

Security requirements:

1. every application table exposed through the Supabase Data API has RLS enabled;
2. public anonymous business-data access is forbidden;
3. frontend code uses only the project URL plus a publishable client key;
4. `service_role`/secret keys are never shipped to the browser or committed to Git;
5. authorization policies must identify the actual allowed user/store access, not merely `TO authenticated` without an ownership/allow-list predicate;
6. authorization state must not rely on user-editable `user_metadata` claims.

The exact first-user allow-list/profile model is an implementation-gate decision and must be proven with policy tests before production.

## 8. Dexie / offline behavior

Dexie is no longer the final authoritative store after D-029.

For the first Supabase migration, do **not** create an implicit multi-master/offline-sync architecture.

Accepted initial behavior:

- Postgres is authoritative;
- browser cache may be added/retained where useful for performance/read resilience;
- financial/business writes require confirmed server persistence;
- when connectivity is unavailable, writes may fail closed rather than queue silently;
- a durable offline outbox/synchronization protocol is later work and requires its own conflict/idempotency decision before implementation.

This keeps the first cloud migration smaller and avoids creating duplicate-order/payment risks.

## 9. Backup and recovery after D-029

The objective is **not** to remove backup. It is to remove human manual backup as the sole primary durability layer.

Final recovery layers should be:

1. Supabase managed database backup appropriate to the production plan;
2. independent logical/manual Easy backup/export for portability and contingency;
3. optional automated off-site logical dump later if recovery requirements justify it;
4. PITR only if the accepted RPO/cost decision justifies the add-on.

Current Supabase production guidance verified on 2026-08-20:

- managed daily database backups are available on paid Pro/Team/Enterprise plans;
- Pro currently retains seven days of daily backups;
- free projects may be paused for inactivity and do not provide the same production backup guarantee;
- PITR is a separate paid option and is not required by D-029.

Therefore the final production cutover may not claim removal of human backup dependency while relying only on a free/pausable database tier **unless a later gate proves an alternative zero-cost recovery arrangement that genuinely satisfies the same durability objective**. The current paid-infrastructure budget is US$ 0, so P10-S3-I2 must resolve this objectively or keep cutover blocked; paid features may not be assumed.

### D-024 transition

D-024 remains mandatory for the **current stable browser-local production system until cutover**.

Once Supabase is formally accepted as canonical production persistence, D-024's synchronized-folder + 24-hour write-blocking mechanism is not carried forward as the primary production durability mechanism.

The Easy logical export remains available, but failure to manually export it every 24 hours should not block normal cloud-backed production writes after managed backup readiness is proven.

## 10. Migration route

The real store dataset must move only once into the new final persistence architecture.

Target sequence:

```text
stable V1 IndexedDB
   -> one controlled stable-v1 logical export
   -> offline/pre-import validation + exact source digest
   -> deterministic normalization already proven in P10-S1
   -> transactional import into Supabase staging/target schema
   -> exact structural + financial reconciliation
   -> application acceptance against Supabase-backed V2
   -> final production cutover gate
```

Do not first migrate real production data into a disposable V2 IndexedDB beta and then migrate it again into Supabase.

No real-data import is authorized by acceptance of D-029 itself.

## 11. Development / production separation

A dedicated Supabase project must be used for Easy rather than reusing an unrelated application's database.

Before real store data is introduced, the project must prove:

- project identity and region;
- schema migration history committed to the repository;
- RLS/security advisor state reviewed;
- publishable key only in client configuration;
- Vercel environment configuration separated from repository secrets;
- synthetic migration/reconciliation test data only;
- rollback/recreate path for development schema;
- D-019 still passes for the application repository.

Whether Supabase development branching is worth its additional cost is not assumed; a dedicated development project/schema workflow is sufficient if it preserves reproducible migrations.

## 12. Vercel boundary

Vercel remains the target frontend hosting platform for the final V2.

D-029 does not itself:

- publish `main`;
- change the canonical store URL;
- enable automatic Git deployments;
- promote the current beta alias to stable;
- cut over production traffic.

Those remain explicit later gates.

## 13. Acceptance / no-go criteria for this architecture gate

D-029 is accepted when canonical documentation agrees that:

- D-016 is reopened/superseded for final production persistence;
- Supabase/Postgres is the target canonical database;
- Vercel is the target frontend host;
- P10-S2-I1 is abandoned before real-data export;
- manual Easy backups remain secondary recovery/portability rather than sole durability;
- D-024 stays active on current stable until cloud cutover, then stops being the primary write guard;
- Auth + RLS + no-client-secret requirements are mandatory;
- offline multi-master sync is explicitly out of initial scope;
- no real data moves in this architecture-decision step.

NO-GO for implementation if a proposed shortcut would expose business data anonymously, ship privileged keys to the browser, weaken D-012/D-013/D-025/D-026 integrity, or import real store data before schema/security/reconciliation gates are proven.

## 14. P10-S3-I1 accepted foundation / next bounded gate

P10-S3-I1 is accepted. Execution evidence is canonical in `docs/V2/P10_S3_I1_EXECUTION.md`.

Accepted foundation:

1. dedicated project `easy-v2` / `hrmkkhqfyfoqucwbcszq`, organization `synapselab-ia's Org`, region `sa-east-1`;
2. reproducible migrations `20260820154034` and `20260820154402`;
3. RLS on all five public application/authorization tables and an explicit `easy_operators` Auth UUID allow-list;
4. public invoker financial RPCs backed by non-exposed privileged implementations, preserving D-013/D-026 atomicity;
5. typed `supabase-js` client foundation using only URL + publishable key;
6. synthetic authorization/correction/history/rollback proof;
7. final Security Advisor 0 lints; performance advisor INFO-only unused-index notices on an empty/tiny synthetic dataset;
8. all synthetic rows disposed and final application-table counts zero;
9. repository D-019 passed after the implementation type fix; no real store data moved.

The next action is **P10-S3-I2 — define and accept the real-data migration/reconciliation + production-durability contract before any real export/import**. The current paid-infrastructure budget is US$ 0, so this gate may not assume Supabase Pro, PITR or another paid add-on. It must either prove a zero-cost recovery posture that actually satisfies D-029 or keep production cutover blocked.

No real-data export/import, stable publication, canonical URL switch or production cutover is authorized by P10-S3-I2 contract definition.