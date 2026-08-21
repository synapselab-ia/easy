# Easy V2 — P10-S3-I2-I2 zero-cost unattended backup/recovery execution

**Status:** `BLOCKED / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF REQUIRED`  
**Date:** 2026-08-21  
**Decision:** D-030  
**Scope:** synthetic-only implementation/proof of the unattended logical-dump, recovery-health and restore-drill boundary

## 1. Result

P10-S3-I2-I2 is **not accepted yet**.

The repository/database implementation required by D-030 is now present and the server-side fail-closed behavior has been proven against the empty dedicated `easy-v2` homologation project. Repository D-019 also passes.

The slice remains blocked because the acceptance contract additionally requires objective evidence from the **trusted operator PC** that cannot be fabricated or inferred from GitHub/Supabase remote execution:

1. an actual unattended `supabase db dump --data-only` execution using the operator-local credential boundary;
2. objective arrival/verification in the configured off-site `rclone` remote;
3. at least seven retained successful daily generations in that real recovery boundary;
4. execution of the committed disposable restore drill on the trusted PC/Docker boundary and exact reconciliation of the restored synthetic artifact.

Until those operator-local proofs exist, P10-S3-I2-I3 remains unauthorized and P10-S3-I2-I2 stays the only `NEXT_ACTION`.

No real store data, real production Auth user/operator, Supabase-backed business runtime, `main` publication, canonical URL switch or production cutover occurred.

## 2. Repository baseline

- source `develop`: `a78331444f254688523aae70f8a0b81318735e5e`;
- isolated branch: `feat/p10-s3-i2-i2-backup-recovery`;
- PR: #70;
- substantive implementation head: `a92144c76fd510360f68b69d69749997cdcbe2b5`;
- substantive PR merge ref validated by D-019: `6b83fe3e9b5939c788aa7a3640e7fc83607fd260`;
- stable `main` remained untouched at `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

## 3. Implemented trusted-PC recovery tooling

Committed under `scripts/recovery/`:

- `easy-v2-backup.mjs`;
- `easy-v2-restore-drill.mjs`;
- `install-windows-task.ps1`;
- `recovery-fingerprint.sql`;
- `README.md` operator procedure.

The backup path is deliberately outside the browser, Vercel and GitHub Actions boundary.

Accepted implementation properties:

1. Supabase CLI is pinned to `2.111.0`;
2. rclone is pinned to `1.75.0`;
3. the job uses `supabase db dump --linked --data-only --schema public`, excluding `public.easy_operators`;
4. database password/URL injection into the scheduled job is rejected; the linked CLI's operator-local native credential boundary is required;
5. local artifact directory, Supabase CLI state and rclone configuration must live outside the Git checkout;
6. the configured rclone destination must have a valid remote name rather than a Windows/local-drive path;
7. dump output is written first to a temporary file, must be non-empty, is SHA-256 hashed, then atomically promoted to a timestamped final name;
8. off-site transfer uses `rclone copyto` followed by `rclone check --download --one-way` and remote listing confirmation;
9. rotation retains the newest successful generation for each retained UTC day and refuses configuration below seven days;
10. only after off-site verification/rotation does the job write sanitized backup evidence to the database;
11. while fewer than seven successful daily generations exist, the job reports retention warm-up and the database remains unhealthy for business writes;
12. Windows Task Scheduler setup is committed so the process can run unattended on the trusted PC.

Repository unit coverage was added in `src/services/recoveryBackupAutomation.test.ts` for artifact identity, rotation, remote-path validation and sanitized recovery-health SQL generation.

## 4. Recovery-health database implementation

Applied/reproducible migrations:

- `20260820190704_p10_s3_i2_i2_recovery_health_guard.sql`;
- `20260820190809_fix_recovery_health_trigger_privilege.sql`;
- `20260820190951_track_recovery_retention_warmup.sql`;
- `20260820191551_explicit_recovery_health_deny_policy.sql`;
- `20260820192053_enforce_recovery_retention_in_write_guard.sql`.

The resulting design uses private recovery metadata controlled only by the trusted database/backup boundary.

Key semantics proven:

- no backup evidence => canonical business write blocked;
- newest verified generation older than 24 hours => blocked;
- exactly 24 hours old => still fresh;
- 24 hours + 1 microsecond => stale/blocked;
- a fresh verified generation with fewer than seven retained daily generations => blocked;
- fresh verified evidence with at least seven retained daily generations => write guard opens;
- `public.create_transaction` is blocked/reopened by the same recovery-health condition;
- direct category/item/reseller/transaction DML passes through the same trigger guard;
- API-style `service_role` cannot bypass the durability guard merely because it bypasses RLS;
- the narrow restore/import exception exists only for direct database execution without a Supabase JWT context;
- `anon`, `authenticated` and `service_role` cannot read/mutate private recovery-health rows or execute the trusted health-recording function.

### Diagnostic fixes discovered during proof

Two objective defects were found and fixed before closure:

1. the first trigger helper privilege shape could fail with permission denial before reaching the recovery-health decision; the trigger function was narrowed to a private fixed-search-path definer boundary while JWT-bearing API requests still cannot use the direct-database bypass;
2. the first assert path checked timestamp freshness but not the `<7` generation retention condition; the assert now consumes the full recovery-health predicate and a real trigger-path test proves a fresh six-generation state blocks mutation with zero residual rows.

These were implementation defects caught before acceptance, not weakened test expectations.

## 5. Synthetic homologation evidence

Dedicated Supabase project: `easy-v2` / `hrmkkhqfyfoqucwbcszq` / `sa-east-1`.

Synthetic SQL proof covered:

- missing recovery evidence blocking;
- stale recovery evidence blocking;
- fresh evidence reopening;
- financial RPC stale/fresh behavior;
- exact 24-hour timestamp edge;
- `<7` retained generation failure through the actual business-table trigger;
- API-style `service_role` failure;
- direct database/no-JWT restore-boundary success;
- private grants/execute restrictions;
- sanitized latest-success visibility/fingerprint helpers.

After proof, homologation was cleaned and rechecked:

- Auth users: 0;
- `easy_operators`: 0;
- categories: 0;
- items: 0;
- resellers: 0;
- transactions: 0;
- private recovery generations: 0;
- legacy staging batches/items/resellers/transactions/classifications: all 0.

Security Advisor after the explicit private deny policy: **0 lints**.

Performance Advisor remains non-blocking INFO-only `unused_index` notices in the empty/tiny environment. The notices do not introduce a new I2-I2 foreign-key/index defect. Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## 6. Restore-drill implementation

`easy-v2-restore-drill.mjs` defines the bounded synthetic recovery drill required by D-030:

1. create a clean disposable local Supabase/Postgres target from committed migrations;
2. restore an eligible data-only backup artifact;
3. repair generated identity sequences using database metadata;
4. calculate structural/reference/financial fingerprints using `recovery-fingerprint.sql`;
5. compare source/restored counts, stable IDs/references and exact integer-cent financial aggregates;
6. dispose the temporary recovery environment/artifacts when the drill finishes.

The code path is committed and repository-tested, but **the actual Docker restore drill has not been executed on the trusted operator PC in this slice**. That is an explicit remaining acceptance item, not assumed evidence.

## 7. Repository D-019

Substantive implementation D-019:

- run: **`32408393343`**;
- job: **`96552818604`**;
- exact PR merge ref: **`6b83fe3e9b5939c788aa7a3640e7fc83607fd260`**;
- feature head: `a92144c76fd510360f68b69d69749997cdcbe2b5`;
- base: `a78331444f254688523aae70f8a0b81318735e5e`;
- ESLint: **0 errors / 82 warnings**;
- Vitest: **56 files / 237 tests PASS**;
- Playwright: **17/17 PASS**;
- production build: **PASS**.

Known React `act(...)`, mocked-select DOM, lint-warning debt, npm-audit, Actions Node deprecation and Vite chunk-size notices remain non-blocking because the objective D-019 commands passed.

A final D-019 on the complete canonical closure tree is still required before PR #70 integration.

## 8. Exact remaining operator-local acceptance proof

P10-S3-I2-I2 may move from `BLOCKED` to `DONE / ACCEPTED — SYNTHETIC ONLY` only after sanitized evidence records all of the following from the trusted PC:

1. configured Supabase CLI project link/credential boundary without recording secrets;
2. configured rclone remote outside Git/GitHub/Vercel/chat;
3. unattended scheduled job invocation;
4. one successful synthetic data-only dump with timestamp, byte size and SHA-256;
5. objective `rclone check --download --one-way`/remote listing success;
6. server-visible recovery generation matching that verified artifact;
7. at least seven successful retained UTC daily generations in the real remote boundary;
8. database health reports healthy only once both freshness and retention requirements are satisfied;
9. committed restore drill executes against an eligible synthetic dump in a clean disposable local database;
10. restored structural/reference/financial fingerprint exactly equals source fingerprint;
11. disposable recovery state is cleaned;
12. final Supabase advisors and final PR-tree D-019 pass.

No identifiable business payload, password, database URL, access token, rclone credential or remote secret may be copied into canonical evidence.

## 9. Fail-closed boundary / next action

**Result: BLOCKED / NO-GO TO I2-I3.**

The code/database prerequisite is implemented and tested, but D-030 requires physical operator-local evidence that this environment cannot manufacture.

`NEXT_ACTION` therefore remains P10-S3-I2-I2 and is narrowed to executing the committed trusted-PC backup + off-site + seven-generation + restore-drill procedure and recording only sanitized objective evidence.

Do not create/use the real production Auth operator, switch business runtime from Dexie to Supabase, export/import real store data, modify/publish `main`, switch the canonical URL or perform production cutover while this gate remains blocked.

## 10. 2026-08-21 remote acceptance preflight — NO-GO remains correct

A fresh remote preflight was executed against the dedicated synthetic-only `easy-v2` Supabase project before attempting any operator-local acceptance claim.

Objective server-visible state:

- `private.recovery_backup_generations`: **0 rows**;
- latest `offsite_verified_at`: **null**;
- maximum recorded retained-generation count: **0**;
- `private.recovery_backup_is_fresh_at(clock_timestamp())`: **false**;
- Security Advisor: **0 lints**;
- Performance Advisor: only the already-known INFO `unused_index` notices in the empty/tiny homologation environment.

This evidence confirms that no trusted-PC backup generation has been recorded and the D-030 server health predicate remains correctly fail-closed. It does **not** satisfy or replace the required operator-local Supabase CLI credential setup, real `rclone` off-site check, seven distinct retained UTC daily generations, Windows scheduled execution or disposable Docker/local restore drill.

Therefore this 2026-08-21 attempt is recorded as a **remote preflight NO-GO**, not as acceptance. P10-S3-I2-I2 remains `BLOCKED / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF REQUIRED`; P10-S3-I2-I3 remains unauthorized; no real store data, real production Auth operator, runtime switch, `main` publication, canonical URL switch or cutover occurred.
