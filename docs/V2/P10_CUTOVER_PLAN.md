# Easy V2 — P10 Controlled Migration / Cutover Plan

**Status:** `P10-S1 DONE; P10-S2 CONTRACT DONE; P10-S2-I1 ABANDONED BEFORE EXPORT; P10-S3 CURRENT`  
**Updated:** 2026-08-20  
**Scope:** fail-closed progression from the current stable browser-local system toward a Supabase/Postgres-backed final V2 on Vercel

## 1. Purpose

P10 moves the validated V2 from integration state toward actual store use without treating a deploy, branch merge, synthetic rehearsal or database provisioning as proof that production-data migration and cutover are safe.

P10-S1 proved the existing local stable-v1→V2 normalization/recovery mechanism using synthetic data only.

P10-S2 defined a safe copied-live-data IndexedDB beta under D-028. P10-S2-I1 then stopped fail-closed before any real store backup was exported.

Before that real-data beta resumed, the final persistence requirement changed: routine durability should not depend primarily on human-created/synchronized browser backups. D-029 therefore redirects final production toward **Supabase/Postgres canonical persistence + Vercel hosting**, with logical/manual Easy backup retained as an independent secondary defense.

Current authoritative architecture: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

## 2. Stable boundary

- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- stable system remains browser-local Dexie V1 and is still the only production-authoritative system;
- `main` remains untouched by P10 development;
- current stable publication remains historical GitHub Pages;
- D-024 remains mandatory for the stable browser-local system until cloud cutover;
- no canonical store URL has switched;
- no production Supabase data exists yet.

## 3. Historical P10-S1 evidence

### P10-S1-I1 — backup/correction compatibility

**Status:** `DONE / INTEGRATED`.

P10-S1-I1 aligned backup validation with D-026 without weakening D-025 history/audit constraints.

Authoritative D-019: `32292888925` / `96197514379`; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; build PASS. PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`.

### P10-S1-I2 — deployed synthetic rehearsal

**Status:** `DONE / REHEARSED`.

Candidate:

- Vercel deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`;
- exact Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`.

Evidence-only PR #62 authoritative run `32298906351` / `96216688953` passed repository D-019 and remote synthetic rehearsal 1/1.

Synthetic evidence proved:

- stable backup-v1 preflight/normalization;
- item/reseller lifecycle defaults to active;
- absent `occurredAt` -> historical `createdAt`;
- no invented categories/category history;
- restore/checkpoint;
- D-024 write blocking/setup/current state;
- unclassified-item gating;
- representative classification;
- new order + D-026 changed-item/date correction;
- V2 export and fresh-context identical round-trip.

No real store data was used.

## 4. Historical P10-S2 / D-028

P10-S2 contract was `DONE / ACCEPTED` as a safe IndexedDB copied-live-data beta design.

D-028 required exact candidate identity, trusted isolated operator handling, exact structural and financial reconciliation, D-018/D-024 recovery proof, beta rollback baseline, minimum beta mutations, final round-trip and 24-hour disposal.

Authoritative contract: `docs/V2/P10_S2_BETA_GATE.md`.

### P10-S2-I1 actual outcome

**Status:** `ABANDONED / SUPERSEDED BEFORE EXPORT`.

Execution record: `docs/V2/P10_S2_I1_EXECUTION.md`.

What was proven before the stop:

- exact candidate/deployment identity remained valid;
- alias/deployment route remained reachable;
- no later runtime-bearing commit invalidated that candidate.

What remained operator-local:

- isolated beta browser context on the trusted store PC;
- actual D-024 synchronized recovery location verification;
- explicit stable-authoritative/beta-disposable acknowledgement.

Fail-closed behavior stopped the gate before export. PR #65 recorded the result and integrated as `e06c659ecdb3aee79e2e451b00eb85d63c8b8612`, tree `4da05cdda530b1e7000d01460201dff1daf65910`.

No real store backup was exported/imported, no real-data beta IndexedDB was created and no D-028 disposal clock started.

D-029 now supersedes resuming this IndexedDB real-data beta by default.

## 5. D-029 P10-S3 final persistence route

Target:

```text
stable V1 browser-local IndexedDB
          |
          | later: one controlled point-in-time logical export
          v
validated deterministic migration/import
          |
          v
Supabase/Postgres  <-- canonical production data
  Auth + RLS
  constraints/indexes
  transactional correction/reversal
          |
          v
React/Vite application on Vercel
```

Dexie may remain temporarily as migration substrate/cache but is not final canonical production persistence.

Manual Easy backup remains available; managed database backup becomes primary durability after cloud cutover.

## 6. P10-S3-I1 — Supabase foundation

**Status:** `NOT_STARTED` — **CURRENT NEXT ACTION**.

This slice is synthetic-only and must not touch real store data.

Required sequence:

1. explicitly select the Supabase organization and region;
2. create/select a dedicated Easy Supabase project;
3. establish reproducible repository migrations;
4. implement canonical tables for categories/items/resellers/transactions plus minimal authorization metadata;
5. preserve historical snapshot fields and existing importable IDs;
6. add keys/constraints/indexes that reinforce existing domain invariants;
7. enable RLS on every exposed application table;
8. establish and test the initial single-operator Auth/authorization model;
9. implement D-013/D-026 correction/reversal through one PostgreSQL/server transaction boundary;
10. wire React/Vite through `supabase-js` using only project URL + publishable key;
11. keep offline write synchronization out of scope;
12. use synthetic fixtures only;
13. run Supabase security/performance advisors;
14. run repository D-019;
15. record evidence and define the next real-data migration gate.

### P10-S3-I1 exit criteria

PASS only if:

- project identity/region are recorded;
- migrations reproduce schema/policies;
- no application table is anonymously exposed;
- RLS policy tests prove only the intended operator access;
- no service/secret credential exists in browser/repository scope;
- synthetic CRUD/reporting behaviors preserve accepted domain semantics;
- D-013/D-026 correction atomicity is proven against Postgres;
- synthetic stable-v1 import/normalization can be reconciled exactly or the next slice explicitly implements that importer before any real data;
- Supabase security advisor has no unresolved critical exposure caused by this implementation;
- performance advisor results are reviewed;
- D-019 passes;
- no real store data moved.

Any security/integrity mismatch is NO-GO.

## 7. P10-S3-I2 — real-data migration/reconciliation

**Status:** `NOT_STARTED / NOT AUTHORIZED UNTIL I1 PASSES`.

Future bounded sequence only:

1. freeze an agreed point-in-time stable-v1 source snapshot;
2. retain source only within the approved operator/recovery boundary;
3. record sanitized timestamp/file-size/SHA-256;
4. validate/normalize deterministically;
5. import directly into the proven Supabase schema, preserving IDs/snapshots;
6. reset database identity/sequence state safely;
7. reconcile exact structural counts/IDs/references;
8. reconcile gross orders, payments, signals, net movement, every reseller balance and aggregate positive debt with zero-cent tolerance;
9. verify Auth/RLS against the migrated dataset without exposing raw data in repository evidence;
10. prove rollback/recreate strategy;
11. retain only sanitized evidence.

This slice must be defined in more detail after P10-S3-I1 establishes the actual schema/import surface.

## 8. Backup/recovery transition

### Before cloud cutover

The current stable browser-local system keeps D-024 and its existing manual/synchronized recovery protection.

### After cloud cutover

Expected layered protection:

1. managed Supabase database backup appropriate to the production plan;
2. independent logical/manual Easy backup/export;
3. optional automated off-site logical dump later;
4. PITR only if an explicit RPO/cost decision accepts it.

The project must not claim that human backup dependency is removed if final production is left on a cloud tier without the managed backup/availability properties required by D-029.

## 9. Auth/security cutover boundary

Before production use of Supabase:

- Auth must be enabled and operational;
- every exposed business table must have RLS;
- the initial allowed operator/store access must be explicit;
- `TO authenticated` alone is not considered sufficient authorization if it exposes data to any authenticated account;
- user-editable metadata is not authorization truth;
- frontend uses publishable credentials only;
- privileged database/service credentials remain server/admin-only;
- D-013/D-026 transactional functions must not bypass authorization merely to simplify implementation.

## 10. Connectivity boundary

The first cloud migration is **online-authoritative**.

If network/server persistence is unavailable, financial writes may be blocked. This is preferable to an unproven offline queue that could duplicate or conflict with financial movements.

Offline write support requires a separate future decision covering:

- durable outbox;
- idempotency keys;
- conflict handling;
- duplicate order/payment prevention;
- reconciliation after reconnect.

No such feature is authorized now.

## 11. Vercel/publication boundary

Vercel remains the final target host, but P10-S3 foundation work does not authorize:

- `main` publication;
- canonical URL switch;
- enabling automatic Git deploys;
- promoting the current beta alias;
- final write freeze;
- production cutover.

A fresh Supabase-backed candidate will need exact Git/deployment/D-019 identity before any real-data/cutover gate.

## 12. Final P10 gates after real-data migration

Only after P10-S3-I2 passes may the project define later gates for:

- final store write freeze;
- final delta/migration handling if required;
- stable Vercel publication;
- canonical URL switch;
- rollback after initial cloud production writes;
- decommissioning of old stable browser-local production;
- production backup-plan/PITR choice.

None of those are authorized by D-029 or P10-S3-I1.

## 13. Current next action

Execute only **P10-S3-I1** under D-029 and `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

No real store data, no `main` publication and no production cutover.