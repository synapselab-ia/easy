# Easy V2 — Architecture Baseline

**Status:** D-031 runtime-first early-use candidate in progress; D-030 automated recovery proof ON HOLD  
**Integration target:** `develop`  
**Updated:** 2026-08-21

## 1. Current integrated baseline

At the start of D-031, `develop` still contains the pre-runtime-switch React/TypeScript/Vite application with TanStack Query + Dexie/IndexedDB, plus the accepted Supabase foundation, staging/import compatibility and recovery tooling/migrations.

The 2026-08-21 `develop` commit `c1fdf4b3140bb6e9b89e2cc8f36933a8c0c4a4f2` records a valid historical fail-closed remote preflight for D-030 I2-I2. That result remains true: the trusted-PC off-site/retention/restore proof was not completed.

D-031 changes what happens next; it does not rewrite that evidence.

## 2. Runtime-first candidate — PR #72

Open PR #72 (`feat/p10-s3-i2-i3-runtime-first`) implements the early-use cloud runtime.

When the browser-safe Supabase configuration is present:

```text
Browser / React + Vite
        |
        | publishable key + authenticated session
        v
Supabase Auth
        |
        | approved operator check (`easy_operators`)
        v
Supabase Postgres  <-- canonical business data
   categories
   items
   resellers
   transactions
        |
        +--> financial create/reverse/correct through controlled RPCs

Dexie / IndexedDB
   read cache/mirror for existing reports/search compatibility
   NOT canonical business persistence
```

## 3. Authentication and authorization

The candidate uses:

- Supabase Auth session handling;
- server-managed `easy_operators` allow-list;
- RLS on exposed application tables;
- browser project URL + publishable key only;
- no `service_role`/database secret in the client.

Auth state changes must not perform nested async Supabase calls directly inside the auth callback; the runtime schedules the authorization/cache refresh outside that callback boundary to avoid the documented deadlock class.

## 4. Business writes

Categories/items/resellers write to Supabase when cloud mode is configured.

Transactions retain D-012/D-013/D-026 semantics and use the existing database RPC boundary so multi-row correction/reversal remains atomic.

Connectivity/server failure is fail-closed for writes; the first cloud transition does not introduce an offline-authoritative write queue.

## 5. Read/cache behavior

Supabase is authoritative in cloud mode. Dexie may mirror the current cloud dataset so existing dashboard/search/report code can continue reading through the established local query layer during the transition.

The cache must never be treated as successful write authority when the server rejected or did not confirm a mutation.

## 6. JSON backup/export

D-017 logical Easy backup remains independent of the storage technology.

In the runtime-first candidate:

- export reads the canonical Supabase dataset rather than stale local cache state;
- the operator can download the JSON backup;
- manual recovery freshness metadata remains local control state;
- normal browser writes remain blocked when the accepted manual JSON recovery confirmation is older than 24 hours.

## 7. JSON restore

The Supabase-backed restore path is server/database atomic for an approved operator.

Flow:

1. validate/preflight the JSON envelope;
2. download a checkpoint of current canonical data before destructive replacement;
3. call the hardened restore RPC;
4. refresh/read canonical data after restore;
5. verify restored business data;
6. distinguish a pre-apply failure from a post-apply verification failure so the UI never falsely claims the old database was preserved after a server restore actually committed.

## 8. D-031 early-use recovery boundary

D-030 implemented a stronger zero-cost durability architecture:

- unattended trusted-PC data-only dumps;
- rclone off-site verification;
- >=7 retained daily generations;
- exact-24h + retention server write guard;
- disposable restore drills.

The repository/database prerequisite remains implemented, but operator-local acceptance evidence is **ON HOLD**.

For D-031 early use:

- automated D-030 recovery-health enforcement is pending/disabled;
- manual JSON backup + the browser exact-24h freshness guard is the active temporary recovery control;
- this temporary posture is accepted only for controlled early use, not definitive production cutover.

## 9. Data migration

The private stable-v1 staging/import machinery remains available and synthetically accepted.

The current early-use plan is a **clean start**. No legacy real-store backup is imported merely to begin the candidate.

## 10. Deployment topology

- `main` remains the historical stable application and must stay untouched.
- `develop` is the V2 integration branch.
- Vercel project `easy-v2` remains the candidate host.
- `vercel.json` disables Git-triggered deployments; deployment is manual.
- D-031 does not switch the canonical production URL.

## 11. Supabase environment

Dedicated project:

- name: `easy-v2`;
- project ref: `hrmkkhqfyfoqucwbcszq`;
- region: `sa-east-1`.

Security Advisor was 0 lints after the current Supabase hardening. Existing Performance Advisor notices are INFO-only unused-index findings on the empty/tiny homologation environment.

## 12. D-019

Repository integration still requires:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

PR #72 previously passed this on merge ref `1e746bb2dd133f5bfcaac7818b27996f802476ed` (run `32492337376`, job `96802676149`): 0 lint errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; production build PASS.

Because `develop` subsequently advanced, the PR must be synchronized and D-019 repeated on the new exact merge ref before merge.

## 13. Final target versus early-use exception

D-029 remains the final topology. D-030 remains the accepted US$ 0 durability contract. D-031 only authorizes reaching and using the cloud runtime candidate earlier with manual JSON recovery.

Definitive cutover still requires a later explicit decision/gate and may not be inferred from a successful Vercel candidate.