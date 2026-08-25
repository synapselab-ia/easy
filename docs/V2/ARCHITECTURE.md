# Easy V2 — Architecture

**Status:** canonical architecture reference  
**Updated:** 2026-08-25

## 1. Current accepted topology

D-029 defines the cloud target, D-031 authorizes controlled runtime-first early use, and D-032 defines the temporary store-global manual recovery state used by the hosted candidate.

```text
Approved operator browser(s)
        |
        | Supabase Auth session
        v
RLS + public.easy_operators
        |
        v
Supabase Postgres  <-- canonical business data
        |
        +--> controlled financial RPCs
        +--> approved-operator atomic JSON restore
        +--> append-only manual recovery events
        +--> exact-24h business-write recovery guard

Dexie / IndexedDB
  read cache / compatibility mirror only

Logical Easy JSON
  portable/manual recovery artifact
  physically stored outside the Easy by an operator

Vercel
  manual candidate host during early use
```

## 2. Browser/runtime boundary

When `VITE_SUPABASE_URL` and the browser-safe publishable key are present:

- `CloudAuthGate` requires a Supabase Auth session;
- `public.is_easy_operator()` must authorize the current user before business data renders;
- canonical business data is fetched from Supabase and mirrored to Dexie for read/report/search paths;
- cloud/connectivity failures do not create an offline-authoritative write mode;
- category/item/reseller mutations write to Supabase under RLS;
- financial create/reverse/correct operations use transactional PostgreSQL RPCs;
- recovery health is hydrated from Supabase and periodically refreshed;
- inability to verify required cloud recovery health fails closed for writes.

When cloud configuration is absent, the historical local behavior remains available for development/reference. D-032 does not alter that local topology.

## 3. Authorization and secrets

Mandatory controls:

- RLS on exposed business/recovery tables;
- active approved-operator allow-list in `public.easy_operators`;
- anonymous business/recovery access denied;
- browser receives only project URL + publishable key;
- no `service_role`, database password or privileged admin secret in browser/Git/public Vercel variables;
- operator approval occurs only through a trusted admin/database boundary after normal Auth creation.

`public.manual_recovery_events` is append-only from the browser perspective: approved authenticated operators may SELECT/INSERT under RLS; UPDATE/DELETE are not granted.

## 4. Financial consistency

Accepted V2 invariants remain unchanged:

- destructive history deletion is not the correction model;
- reversal preserves original rows and audit reason/time;
- correction creates a linked replacement atomically;
- business occurrence time is distinct from registration/audit time;
- statements/debt calculations preserve reversal-zero-effect semantics;
- item/category transaction snapshots remain historical facts.

Cloud financial mutations stay inside the controlled server/database transactional boundary.

## 5. Canonical cloud adapter

`src/services/cloudDataService.ts` remains the application-facing bridge for canonical business data. It maps Supabase rows, fetches the canonical dataset, refreshes Dexie as a read cache, routes referential writes through RLS and financial writes through accepted RPCs.

Recovery-state operations are separated into the cloud recovery service so manual checkpoint semantics do not become ordinary browser-local metadata.

## 6. Logical backup/restore

Logical Easy JSON remains the portable recovery/interchange format under D-017/D-018.

In cloud mode:

- export reads canonical Supabase business data;
- restore performs validation/preflight;
- a current canonical checkpoint is downloaded before replacement;
- replacement is applied atomically through the approved database RPC boundary;
- post-restore canonical data is fetched and logically reconciled.

The application can prove that it generated/downloaded an export, but cannot prove the final filesystem/off-site destination. Therefore manual recovery health requires an explicit operator confirmation after the operator verifies the file was stored outside the Easy.

## 7. D-032 temporary global manual recovery mode

For D-031 controlled early use before D-030 operator-local durability proof:

1. an approved operator performs a canonical JSON export;
2. the cloud client inserts an `export` event into `public.manual_recovery_events`;
3. the operator independently verifies the JSON is stored outside the Easy;
4. the operator explicitly confirms that fact;
5. a `confirm` event links to the current operator's latest unconfirmed export;
6. the latest confirmed export timestamp becomes the **store-global** temporary recovery checkpoint;
7. every approved browser/device reads the same confirmed checkpoint;
8. normal business writes are allowed only while that checkpoint age is `< 24h`;
9. at age `>= 24h`, the database guard blocks writes even if a client is stale or modified.

Important properties:

- server timestamps and authenticated identity are assigned/validated at the database boundary;
- confirmation without a pending export is rejected;
- a non-approved authenticated identity cannot register or read recovery events;
- browser-local state is not authoritative for hosted cloud recovery health;
- the global event table is append-only, preserving audit evidence;
- once the global manual mode has been initialized by any event, a missing/unconfirmed/stale checkpoint fails closed;
- migration rollout remains compatible with the previously deployed client while the event table is empty, avoiding an involuntary lock before the updated frontend can create the first real global checkpoint.

## 8. Relationship to D-030

D-032 is a temporary early-use control, not final durability acceptance.

If D-030 automated recovery enforcement is enabled, the stronger automated predicate takes precedence and requires its accepted evidence: unattended trusted-PC logical dumps, verified off-site storage, retained daily generations and restore-drill proof.

The D-030 tooling remains implemented but its real operator-local/off-site/seven-day/restore acceptance proof stays ON HOLD under D-031.

## 9. Migration boundary

The stable-v1 private staging/import pipeline remains dormant. The candidate remains clean-start:

- no real legacy dataset is imported by default;
- no historical payload belongs in GitHub/chat/CI evidence;
- later legacy migration requires explicit re-authorization.

## 10. Deployment boundary

- `develop` is the candidate integration branch;
- `main` remains untouched and is not the deployment target for this stage;
- repository `vercel.json` disables automatic Git-triggered deployment;
- Vercel candidate publication is manual;
- canonical production URL switching/decommissioning is not authorized.

## 11. D-032 implementation boundary

PR #80 adds:

- migration `20260825191150_global_manual_recovery_checkpoint`;
- `public.manual_recovery_events` with RLS/grants and append-only event shape;
- operator-only global health RPC;
- database integration with the existing business-write recovery guard;
- cloud recovery health client/service and polling/hydration;
- cloud UI export/confirmation behavior using global state;
- tests for global state mapping, event flow and fail-closed client behavior.

Implementation-tree D-019 passed on run/job `32889131712` / `97936610378`: ESLint 0 errors / 82 warnings; 59 files / 251 Vitest PASS; 17/17 Playwright PASS; production build PASS. Canonical-document changes require the final exact-tree D-019 recorded in PR #80 metadata before integration.

## 12. Next architectural operation

After PR #80 is integrated, manually publish the accepted `develop` to the Vercel candidate. An approved operator must then make one fresh real JSON export and explicit outside-the-Easy confirmation to initialize the store-global checkpoint. No definitive production cutover is implied.