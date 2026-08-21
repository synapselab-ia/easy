# Easy V2 — Architecture

**Status:** canonical architecture reference  
**Updated:** 2026-08-21

## 1. Current accepted topology

D-029 defines the final production direction and D-031 defines the current controlled early-use sequencing.

```text
Approved operator browser
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

Dexie / IndexedDB
  read cache / compatibility mirror only

Logical Easy JSON
  independent portability/recovery checkpoint

Vercel
  manual candidate host during early use
```

The runtime-first implementation is integrated in `develop` through PR #72.

## 2. Browser/runtime boundary

When `VITE_SUPABASE_URL` and the browser-safe publishable key are present:

- `CloudAuthGate` requires a Supabase Auth session;
- `public.is_easy_operator()` must authorize the current user before business data renders;
- canonical business data is fetched from Supabase and mirrored to Dexie for existing read/report/search paths;
- connectivity/cloud failures do not create a competing offline-authoritative write mode;
- category/item/reseller mutations write to Supabase under RLS;
- financial create/reverse/correct operations use transactional PostgreSQL RPCs.

When cloud configuration is absent, historical/local behavior remains available for development/reference, but that path is not the intended hosted early-use production topology.

## 3. Authorization and secrets

Mandatory controls:

- RLS on exposed business tables;
- approved-operator allow-list in `public.easy_operators`;
- anonymous business access denied;
- browser receives only project URL + publishable key;
- no `service_role`, database password or privileged admin secret in browser/Git/public Vercel variables;
- adding an approved operator occurs through a trusted admin/database boundary after the normal Auth account exists.

## 4. Financial consistency

The architecture preserves accepted V2 invariants:

- destructive history deletion is not the correction model;
- reversal preserves original rows and records audit reason/time;
- correction creates a linked replacement atomically;
- business occurrence time is distinct from registration/audit time;
- statement/debt calculations preserve reversal-zero-effect semantics;
- item/category transaction snapshots remain historical facts.

Cloud financial mutations must remain within the controlled server/database transactional boundary.

## 5. Canonical cloud adapter

`src/services/cloudDataService.ts` is the application-facing bridge for cloud mode. It:

- maps Supabase rows to existing domain objects;
- fetches the canonical dataset;
- refreshes Dexie as a read cache/mirror;
- routes referential mutations to Supabase tables under RLS;
- routes financial mutations to the accepted RPC boundary;
- exposes approved-operator checks and recovery operations needed by the runtime.

Dexie is therefore no longer canonical persistence in the hosted candidate.

## 6. Logical backup/restore

Logical Easy JSON remains the portable recovery/interchange format under D-017/D-018.

In cloud mode:

- export reads canonical Supabase business data;
- restore performs validation/preflight;
- a current canonical checkpoint is downloaded before replacement;
- replacement is applied atomically through the approved server/database RPC boundary;
- post-restore canonical data is fetched and logically reconciled;
- post-apply verification failure must not falsely claim the prior database survived.

## 7. Temporary D-031 recovery mode

For controlled early use before D-030 operator-local proof:

- the browser manual JSON freshness guard remains fail-closed at the accepted exact 24-hour boundary;
- the explicit server state permits automated D-030 recovery enforcement to remain disabled temporarily;
- this is a sequencing exception, not final durability acceptance.

The implemented D-030 recovery tooling remains available for later:

- pinned trusted-PC Supabase CLI data-only dumps;
- rclone off-site verification;
- >=7 UTC daily-generation retention;
- server-visible recovery ledger/freshness guard;
- disposable local/Docker restore fingerprint drill.

Its real trusted-PC/off-site/seven-day/restore evidence is ON HOLD.

## 8. Migration boundary

The accepted stable-v1 private staging/import pipeline remains dormant. The current candidate is clean-start:

- no real legacy dataset is imported by default;
- no historical payload belongs in GitHub/chat/CI evidence;
- a later legacy migration requires explicit re-authorization.

## 9. Deployment boundary

- `develop` contains the accepted candidate runtime.
- `main` remains untouched and is not the deployment target for this stage.
- repository `vercel.json` disables automatic Git-triggered deployment.
- Vercel candidate publication is manual.
- canonical production URL switching/decommissioning is not authorized.

## 10. Accepted runtime integration evidence

PR #72:

- synchronized head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact D-019 merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- validated merge-ref tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- D-019 run/job: `32502664982` / `96835725075`;
- lint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop`: `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- integrated tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b` — exact equivalence PASS.

Stable `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`, tree `57243d004c5b550d0f27576f0179b0033044088e`.

## 11. Next architectural operation

The next action is operational, not a new architecture implementation: manually publish the accepted `develop` candidate to Vercel, configure browser-safe Supabase values, onboard/approve the intended operator, prove unauthorized denial and establish the first confirmed manual JSON recovery checkpoint. No definitive cutover is implied.