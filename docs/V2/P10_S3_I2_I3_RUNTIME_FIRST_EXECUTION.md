# P10-S3-I2-I3 — Runtime-first Supabase execution

**Date:** 2026-08-21  
**Implementation branch:** `feat/p10-s3-i2-i3-runtime-first`  
**PR:** #72  
**Final status:** `DONE / ACCEPTED / INTEGRATED`

## 1. Operator-authorized change of order

D-031 authorized a controlled clean-start Supabase-backed candidate before completing D-030 trusted-PC unattended backup proof.

Accepted order:

1. make the candidate use the dedicated `easy-v2` Supabase project as canonical data source;
2. allow controlled clean-start early use after Auth/operator approval and manual JSON recovery setup;
3. keep Easy JSON export/restore as the temporary independent recovery layer;
4. keep D-030 trusted-PC/off-site/seven-day proof on hold for later;
5. require a later explicit durability/cutover gate before calling the deployment definitive production.

This is a sequencing change, not a claim that manual JSON equals D-030 unattended durability.

## 2. D-031 early-use boundary

- P10-S3-I2-I2 automated off-site proof remains incomplete and ON HOLD.
- Supabase/Postgres may be canonical for controlled early use.
- `private.recovery_enforcement_state.automated_guard_enabled = false` is explicit/server-visible for the temporary mode.
- browser normal writes retain the exact-24h manual-JSON freshness guard.
- JSON export in cloud mode reads canonical Supabase tables.
- JSON restore is approved-operator-only, checkpointed, server-atomic and post-restore verified.
- Dexie is a read cache/mirror, not authoritative persistence.
- Auth + `easy_operators` authorization is mandatory.
- old stable-v1 real data is not promoted/migrated for the clean start.
- `main`, canonical URL switch and definitive cutover remain unauthorized.

## 3. Supabase migrations implemented

### `20260821132225_p10_s3_i2_i3_runtime_first_recovery_mode_and_json_restore`

- adds explicit automated-guard state, initially disabled for runtime-first early use;
- preserves D-030 guard logic for later re-enablement;
- adds a narrow approved-operator logical-restore bypass;
- adds atomic v2/schema5 logical restore and sequence repair.

### `20260821132351_fix_runtime_first_restore_constraint_resolution`

- fixes constraint qualification under fixed `search_path = ''`.

### `20260821133444_harden_runtime_first_restore_rpc_boundary`

- moves privileged restore implementation to the private schema;
- exposes only a `SECURITY INVOKER` public wrapper;
- preserves explicit approved-operator authorization in the private implementation.

Synthetic proof exposed the initial constraint-resolution defect before persistent data changed; it was corrected. Security Advisor then exposed the public `SECURITY DEFINER` boundary; it was hardened. Final implementation advisor evidence: **Security Advisor 0 lints**. Performance Advisor remained INFO-only on unused indexes in the empty/tiny homologation environment.

## 4. Synthetic SQL proof

Using only transaction-local synthetic identity/data and rollback, proof covered:

- explicit automated-recovery guard state disabled for temporary early use;
- normal business-table write acceptance in that mode;
- atomic logical restore of category/item/reseller/order;
- exact restored financial total consistency;
- rollback/cleanup of synthetic operator/data.

After proof, homologation was clean: no real Auth user/operator or business dataset was retained.

## 5. Application implementation

### Canonical cloud adapter

`src/services/cloudDataService.ts`:

- maps Supabase rows into existing domain objects;
- fetches canonical business data;
- refreshes Dexie atomically as a read cache/mirror;
- routes category/item/reseller mutations to Supabase under RLS;
- routes financial mutations through controlled PostgreSQL RPCs;
- exposes authorization and atomic restore calls.

### Auth/session boundary

`src/components/auth/CloudAuthGate.tsx`:

- activates with browser-safe Supabase configuration;
- supports email/password sign-in/account creation;
- requires `public.is_easy_operator()` before rendering store data;
- synchronizes cloud data to the local read cache;
- blocks offline-authoritative operation when cloud access fails;
- includes the bounded waiting-for-authorization state;
- defers async authorization/cache calls until after `onAuthStateChange` returns, avoiding the documented nested-client-call deadlock class.

No Auth credential or real operator UUID is committed.

### Manual JSON recovery in cloud mode

`src/services/cloudBackupService.ts` and `ImportExport.tsx`:

- export reads canonical Supabase data and downloads validated v2/schema5 JSON;
- import retains local preflight/preview validation;
- a current canonical checkpoint is downloaded before cloud restore;
- restore uses the atomic server RPC;
- post-restore canonical data is fetched and logically compared with the requested normalized target;
- pre-apply failure reports the old database preserved;
- post-apply verification failure correctly instructs the operator to stop writes/use the downloaded checkpoint rather than falsely claiming the old database survived.

Tests cover rejected server restore, post-restore mismatch and exact successful reconciliation.

## 6. Final synchronization and D-019

After D-031 governance advanced `develop`, PR #72 was refreshed and GitHub generated a new exact merge ref.

Accepted identifiers:

- base: `develop` `1e396f3ce10a93f99c9bd47a312950943d1587ea`;
- synchronized feature head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact PR merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- exact merge-ref tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- Critical QA run: `32502664982`;
- job: `96835725075`.

GitHub Actions checkout evidence explicitly checked out the exact merge ref above.

D-019 result:

- ESLint: **0 errors / 82 warnings**;
- Vitest: **57 files / 240 tests PASS**;
- Playwright: **17/17 PASS**;
- production build: **PASS**.

Known React `act(...)`, mocked-select DOM, lint-warning, npm-audit, GitHub Actions Node deprecation and Vite large-chunk warnings remained non-blocking under the accepted D-019 contract because every objective command passed.

## 7. Integration closure

PR #72 was marked ready and squash-integrated into `develop` as:

- commit `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- tree `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`.

The integrated tree is **exactly equal** to the D-019-validated merge-ref tree. Final tree-equivalence verification: **PASS**.

Stable `main` was rechecked after integration and remains:

- commit `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- tree `57243d004c5b550d0f27576f0179b0033044088e`.

**P10-S3-I2-I3 repository implementation/integration is CLOSED / ACCEPTED.**

## 8. What was not done

This slice did not:

- deploy the accepted candidate to Vercel;
- configure live Vercel Supabase environment values;
- create/approve the intended real operator account;
- create the first real manual JSON recovery checkpoint;
- import any legacy real-store dataset;
- complete the trusted-PC D-030 backup/off-site/seven-day/restore proof;
- modify/publish `main`;
- switch the canonical production URL;
- authorize definitive cutover.

## 9. Next bounded action

P10-S3-I2-I3-C is now the sole `NEXT_ACTION`:

1. manually deploy the accepted `develop` candidate to the Vercel `easy-v2` project;
2. configure only browser-safe Supabase URL + publishable key;
3. create/sign in the intended Auth account through the normal flow;
4. add only its UUID to `public.easy_operators` through a trusted admin/database boundary;
5. prove unauthorized authenticated access is denied;
6. confirm approved access to the clean canonical dataset;
7. export/download and confirm storage of the first manual JSON recovery checkpoint;
8. verify the browser manual-backup freshness guard is healthy;
9. begin controlled clean-start early use.

Do not resume I2-I2 as the current action and do not claim definitive production safety until the later durability/cutover gate closes.