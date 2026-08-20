# Easy V2 — Architecture Baseline

**Status:** D-029 foundation proven; D-030 migration/zero-cost durability contract accepted; synthetic staging/import implementation next  
**Integration target:** `develop`  
**Updated:** 2026-08-20

## 1. Current implemented runtime

The current user-facing application remains a static React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB. P10-S3-I1 adds a Supabase/Postgres foundation in repository/live infrastructure, but existing business hooks/pages have not been switched to it.

Current browser database: `ResellerManagerDB`, Dexie **V5** with:

- `categories`;
- `items`;
- `resellers`;
- `transactions`.

Migration path remains V1→V2 reseller lifecycle, V2→V3 item lifecycle, V3→V4 `occurredAt`, V4→V5 additive category substrate. V4→V5 performs no category backfill.

Recovery-health state remains separate local control metadata (`easy.recoveryHealth.v1`) and is not part of Dexie/backup business data.

Canonical logical interchange remains `easy-backup` version 2 / schema5. The current local restore path atomically replaces `categories + items + resellers + transactions` under D-018.

This section describes **what is implemented now**, not the accepted final production persistence target.

## 2. Accepted final target — D-029

D-029 reopens/supersedes D-016 for final production persistence.

Target topology:

```text
User browser
  React + TypeScript + Vite
         |
         | supabase-js / HTTPS
         v
Vercel-hosted application
         |
         v
Supabase
  Auth
  Postgres  <-- canonical source of truth
  RLS
  SQL constraints / indexes
  transactional functions where atomicity is required
  managed database backup
         |
         +--> logical/manual Easy export remains independent contingency

Dexie / IndexedDB
  transition/import substrate and optional cache
  NOT final canonical production persistence
```

The transition does not require a framework rewrite. React/Vite remains accepted unless later evidence proves otherwise.

## 3. Why D-016 changed

D-016 originally kept the system local-first/single-user because P4/P8 had not proven a backend/cloud trigger.

That decision was valid at the time.

On 2026-08-20 a new explicit final-production requirement was accepted: routine durability must no longer depend primarily on an operator remembering to create/synchronize browser-local backups, while the application should retain an independent manual/logical backup option for defense in depth.

That is a direct persistence/durability trigger. D-029 therefore changes the final topology before any actual store backup is moved into the V2 beta.

## 4. Category lifecycle and reporting invariants

D-025 remains authoritative through the cloud transition:

- stable category identity and reversible lifecycle;
- active-category item assignment;
- immutable new-order `categoryId + categoryName` snapshots;
- lossless legacy unclassified rows;
- read-only effective-order category reporting using `occurredAt` and transaction-time category identity;
- payments/signals/balance/FIFO debt are not allocated to categories.

Postgres must preserve transaction-time snapshots. Reports must not join current category/item names in a way that rewrites historical meaning.

## 5. Correction architecture — D-012/D-013/D-026

The original transaction row remains immutable. A correction requires a reason and produces a linked replacement plus reversal of the original.

Replacement business state may change reseller, target type, `occurredAt`, observation and applicable order item/quantity/unit price or payment/signal value.

D-025 snapshot behavior remains mandatory:

- order→order with the same item preserves the original category snapshot;
- order→order selecting another valid item captures that target item's current valid snapshot;
- type changes use the target type's valid shape.

### Cloud atomicity requirement

The current Dexie implementation can perform correction/reversal atomically inside one IndexedDB transaction.

The Supabase migration must preserve this guarantee. The browser may **not** implement a correction as two independent network mutations that could partially succeed.

P10-S3-I1 now provides that single PostgreSQL boundary. Public `create_transaction`, `reverse_transaction` and `correct_transaction` RPCs are `SECURITY INVOKER`; privileged implementations live in the non-exposed `private` schema with fixed search paths and explicit approved-operator checks. Browser direct transaction DML is unavailable. Supabase Security Advisor returned 0 lints after this hardening.

## 6. D-014 occurrence dates

D-014 remains unchanged:

- `occurredAt` = financial/business occurrence time;
- `createdAt` = record-registration time;
- `reversal.reversedAt` = audit/reversal time.

Cloud schema/types must preserve those separate semantics.

A D-026 replacement may carry a different `occurredAt` from the original while registration chronology remains independently auditable.

## 7. PostgreSQL integrity target

Before any real store import, the Supabase schema must move critical integrity into PostgreSQL where practical.

Minimum target:

- primary keys for categories/items/resellers/transactions;
- foreign keys for current entity references and audit links where compatible with preserved historical snapshots;
- check/enum constraints for transaction type and valid target shapes;
- positive/non-negative numeric constraints matching current domain semantics;
- required timestamps and audit-link constraints;
- indexes for reseller history, `occurredAt`, category reporting, lifecycle filters and correction/reversal relationships;
- migration/import support for preserving existing IDs;
- deterministic sequence/identity reset after imported IDs;
- historical names/category snapshots stored directly on transaction records;
- server-side transactional correction/reversal.

Database constraints complement domain validation; they do not authorize changing accepted business semantics.

## 8. Authentication / authorization target

Supabase Auth is mandatory before the cloud-backed V2 is production eligible.

Initial scope remains single-operator/admin. Auth is being introduced for data protection and durable remote persistence, **not** as implicit permission to build reseller/employee self-service.

Requirements:

1. every application table exposed through the Data API has RLS enabled;
2. anonymous business-data access is forbidden;
3. authorization must identify the actually approved Easy operator/store access;
4. `TO authenticated` alone is insufficient if it would make every Supabase authenticated account equivalent;
5. user-editable metadata is not used for authorization decisions;
6. browser configuration contains only project URL plus publishable client key;
7. `service_role`/secret keys never enter client bundles, Git, docs or public Vercel environment variables.

P10-S3-I1 implements the initial model as `public.easy_operators`: a server-managed allow-list keyed by Supabase Auth UUID. All five public application tables have RLS; anonymous table access is absent; authenticated business access requires the approved-operator predicate; `transactions` is client read-only outside the controlled RPC boundary.

## 9. Dexie and connectivity after D-029

Dexie ceases to be the target canonical production datastore.

Accepted first-transition behavior:

- Supabase/Postgres is authoritative;
- Dexie may remain temporarily for migration compatibility and/or read cache;
- financial/business writes must be confirmed by the server before being considered committed;
- connectivity failure may block writes rather than silently queue them;
- no offline multi-master or automatic write synchronization is introduced in P10-S3-I1.

A future offline outbox would require explicit idempotency, conflict-resolution and duplicate-financial-movement design before implementation.

## 10. Backup / recovery architecture

### Existing local-first protection

D-017 remains the logical `easy-backup` v2/schema5 contract for current interchange. D-018 remains the verified atomic local restore behavior. D-024 remains synchronized recovery-copy folder + exact 24-hour freshness guard for the **current browser-local stable/runtime boundary**.

### Final cloud protection

After Supabase is formally accepted as production canonical persistence, the primary recovery layer follows the accepted budget posture:

1. paid posture: managed Supabase database backup is primary;
2. D-030 / US$ 0 posture: objectively verified unattended off-site logical dumps + exact-24h server-side freshness enforcement + restore drills are primary;
3. logical/manual Easy backup/export remains independent contingency/portability in either posture;
4. PITR is optional and requires a later RPO/cost decision.

D-024's 24-hour manual-export write block is not intended to survive as the primary cloud production durability mechanism. It remains active until cloud cutover so the existing stable application does not lose its current protection prematurely.

D-030 now defines the accepted zero-cost alternative without pretending the Free tier itself has managed backups. Supabase Free may become first-production eligible only when it is paired with an unattended trusted-PC `db dump` path to an objectively verified off-site/synchronized recovery boundary, at least seven retained successful daily generations, server-visible exact-24h backup freshness that fails all business writes closed when stale, and successful synthetic + real pre-cutover restore drills. Manual `easy-backup` remains independent secondary portability/contingency. If the off-site verification or restore path cannot be proven, production cutover remains blocked. Free-plan pausing is accepted only as an availability limitation; it never authorizes offline local writes.

## 11. Stable → final cloud migration route

The stable `main` application remains materially older:

```text
stable main
  commit 9574e3a...
  Dexie V1
  items + resellers + transactions
  backup version 1
          |
          | one controlled point-in-time logical export
          | after cloud foundation/security gate
          v
migration/import pipeline
  existing accepted v1 normalization
  deterministic validation
          |
          v
Supabase Postgres
  final canonical persistence
```

The real dataset must not first be moved into a disposable IndexedDB beta and then moved again into Supabase.

P10-S1-I2 already proved with synthetic data that the stable-v1 envelope can be normalized without invented category history:

- missing item/reseller lifecycle -> active;
- missing `occurredAt` -> historical `createdAt`;
- no fabricated categories/category assignments/history;
- migrated items remain unclassified until classified;
- D-026 correction state remains exportable/restorable.

P10-S3 will reuse those semantics in a deterministic Supabase importer/reconciliation gate.

No real-data import is authorized by D-029 itself.

### Stable-v1 private staging under D-030

P10-S3-I2 identified one intentional schema mismatch that must be handled before real data: stable-v1 items normalize to active while remaining unclassified, but the current public cloud table requires active items to have a category. Direct insertion is therefore forbidden.

The accepted migration architecture stages the normalized v1 snapshot in a non-exposed/private boundary, preserves stable IDs/timestamps and null historical category snapshots there, collects explicit **current** item classifications, then atomically promotes into public categories/items/resellers/transactions. Current classification is not historical backfill: legacy order snapshots remain null.

Identity sequences must then be repaired from actual PostgreSQL metadata, and exact structural/reference/financial reconciliation must pass before promotion is accepted.

## 12. P10-S2-I1 status

The D-028 copied-live-data beta contract remains a valid historical safety design.

P10-S2-I1 executed only the pre-export portion:

- candidate/deployment identity passed;
- operator-local isolation/recovery-location items could not be proven remotely;
- fail-closed behavior stopped the action before export.

No live-store backup was exported/imported and no real-data beta IndexedDB/artifact was created.

D-029 now marks P10-S2-I1 **ABANDONED / SUPERSEDED BEFORE EXPORT**. There is no beta data to dispose and its 24-hour disposal clock never started.

## 13. Supabase development discipline

P10-S3-I1 provisioned the dedicated Easy Supabase project `easy-v2` (`hrmkkhqfyfoqucwbcszq`) in `sa-east-1`; unrelated application databases are not reused.

Before real data:

- project/region identity must be recorded;
- schema changes must be reproducible through committed migrations;
- RLS policies must be versioned/reviewed;
- synthetic fixtures only;
- security and performance advisors must be checked after DDL/policy changes;
- generated TypeScript database types should match the migrated schema;
- frontend receives only publishable credentials;
- Vercel environment variables must not expose database/service secrets to the client;
- D-019 remains mandatory for repository integration.

A paid Supabase development branch is optional; cost must be explicitly confirmed before creation. A separate dedicated development project/migration workflow is acceptable if it remains reproducible.

## 14. Deployment topology

### Current stable

`main` remains the stable historical application and currently deploys through its existing GitHub Pages workflow.

No D-029 work targets or publishes `main` directly.

### Current V2 candidate

The connected Vercel project `easy-v2` remains candidate/beta hosting only.

Repository `vercel.json` still disables Git-triggered deployments:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

P10-S1-I2 verified READY deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki` as exact Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`, tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`.

That deployment remains historical candidate evidence. The Supabase-backed application will require fresh D-019/deployment identity before any later real-data/cutover gate.

### Final target

Vercel remains the accepted final frontend host, but D-029 does not itself:

- enable automatic Git deploys;
- publish `main`;
- promote the beta alias;
- switch the canonical store URL;
- authorize production cutover.

## 15. Repository-wide QA architecture

D-019 remains mandatory:

```text
npm run qa:critical
  = npm run lint
  + npm run test:run
  + npm run test:e2e
  + npm run build
```

For Supabase-bearing implementation, D-019 is necessary but no longer sufficient by itself. P10-S3 gates additionally require database tests and Supabase advisor review.

Known React test warnings, mocked-select DOM warnings, dependency/audit notices, Actions deprecation notices, lint warning debt and Vite large-chunk warning remain non-blocking only when objective commands pass.

## 16. Accepted historical validation baseline

- P9-S4-I1: D-019 `32285620846` / `96174326588`; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.
- P9-S5: D-019 `32287018048` / `96178850066`; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`; tree `97a78d3e4d78a54ad117440c160920343513ba9f`.
- Canonical P9 closure: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.
- P10-S1 contract: D-019 `32290159119` / `96188851730`; PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`; tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.
- P10-S1-I1: D-019 `32292888925` / `96197514379`; PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`; tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.
- P10-S1-I2: evidence-only PR #62, authoritative run `32298906351` / `96216688953`; remote rehearsal 1/1 PASS; PR closed without merge.
- P10-S2 contract: PR #64 final D-019 `32380528003` / `96462340384`; integrated as `4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`.
- P10-S2-I1 pre-export record: PR #65 final D-019 `32382928429` / `96470305608`; integrated as `e06c659ecdb3aee79e2e451b00eb85d63c8b8612`, tree `4da05cdda530b1e7000d01460201dff1daf65910`.
- P10-S3-I1 synthetic foundation: diagnostic D-019 `32388839983` / `96489804473` blocked TS2559; corrected authoritative D-019 `32394126648` / `96506890991` passed on merge ref `c12a535b665eb25626a1b3bb0aa15cd034808e00` with 0 errors / 82 lint warnings, 54 files / 225 Vitest PASS, 17/17 Playwright PASS and build PASS.

## 17. Boundary entering P10-S3-I2-I1

P10-S3-I2/D-030 is an accepted **contract only**. It defines source freeze/digest, private staging, current classification without fabricated history, atomic promotion, stable ID/sequence handling, exact cent reconciliation, private Auth onboarding evidence, candidate identity, rollback and a conditional zero-cost durability path.

The next slice is synthetic-only legacy staging/import compatibility. It may alter the current empty `easy-v2` homologation project through committed/reproducible migrations, but may not introduce real store data.

It may not:

1. implement or rely on a real store export;
2. provision the real production operator;
3. switch current business hooks/pages from Dexie to Supabase;
4. implement the trusted-PC unattended backup job yet;
5. modify/publish `main`;
6. switch the canonical URL or perform production cutover;
7. weaken D-012/D-013/D-025/D-026/D-029/D-030;
8. fabricate category history for legacy orders;
9. place real data or privileged credentials in GitHub/CI/chat/docs/Vercel client scope.
