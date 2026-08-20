# Easy V2 — P10 Controlled Migration / Cutover Plan

**Status:** `P10-S1 DONE; P10-S2 HISTORICAL; P10-S3-I1 FOUNDATION DONE; D-030/I2 CONTRACT DONE; I2-I1 CURRENT`  
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

Manual Easy backup remains available. Paid production uses managed database backup as primary durability; under D-030/US$ 0, production eligibility instead requires the proven unattended off-site logical-dump/freshness/restore layer before cutover.

## 6. P10-S3-I1 — Supabase foundation

**Status:** `DONE / ACCEPTED`.

The dedicated `easy-v2` project, reproducible migrations, RLS/allow-list authorization, controlled transactional financial RPC boundary, typed publishable-key-only client foundation, synthetic proof, Security Advisor 0 lints and zero-row cleanup are accepted in `docs/V2/P10_S3_I1_EXECUTION.md`.

No real data or real Auth operator was introduced.

## 7. P10-S3-I2 — migration/reconciliation + zero-cost durability contract

**Status:** `DONE / ACCEPTED CONTRACT` — D-030.

Authoritative contract: `docs/V2/P10_S3_I2_MIGRATION_GATE.md`.

The contract defines:

- one point-in-time stable-v1 source freeze/digest;
- private stable-v1 staging because active legacy unclassified items cannot enter the current public item constraint directly;
- explicit current-item classification with no historical category backfill;
- atomic public promotion with stable IDs + sequence repair;
- exact structural/reference/financial reconciliation;
- private real Auth onboarding evidence;
- rollback/abort behavior;
- exact Git/Supabase/Vercel candidate identity;
- a conditional US$ 0 durability route using unattended off-site logical dumps rather than pretending Free has managed backups.

Execution is decomposed into I2-I1 staging/import compatibility, I2-I2 unattended backup/recovery proof, I2-I3 Supabase-backed Auth/runtime candidate and I2-I4 real migration execution. Only I2-I1 is current and it is synthetic-only.

## 8. Backup/recovery transition

### Before cloud cutover

The current stable browser-local system keeps D-024 and its existing manual/synchronized recovery protection.

### After cloud cutover

Expected layered protection follows the accepted budget posture:

1. paid posture: managed Supabase database backup appropriate to the production plan is primary;
2. D-030 / US$ 0 posture: proven unattended off-site logical dump + exact-24h server-side freshness + restore drill is primary;
3. independent logical/manual Easy backup/export remains secondary;
4. PITR only if an explicit later RPO/cost decision accepts it.

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

Execute only **P10-S3-I2-I1 — private stable-v1 staging/import compatibility with synthetic data** under D-030 and `docs/V2/P10_S3_I2_MIGRATION_GATE.md`.

The current empty `easy-v2` homologation project may be altered only through reproducible migrations. No unattended backup implementation, real Auth operator, Supabase-backed business-runtime switch, real store data, `main` publication, canonical URL switch or production cutover.