# Easy V2 — Canonical Backlog

**Updated:** 2026-08-21

This backlog records current ordered work. Historical implementation detail remains in phase execution documents and Git history.

## P0–P9 — Accepted historical baseline

P0 through P9 are accepted/integrated. Their major outcomes include:

- branch/governance and D-019 critical QA;
- reversible reseller/item lifecycle;
- audited financial reversal and linked replacement correction;
- occurrence-date semantics;
- statements and FIFO debt-aging;
- backup/restore hardening;
- local recovery safeguards;
- category identity + transaction-time snapshots/reporting;
- full-field audited correction.

Do not reopen these phases merely because legacy task files contain unchecked historical boxes.

## P10 — Controlled migration / cloud transition

**Status:** `IN_PROGRESS`

### P10-S1 — Stable-v1 compatibility/rehearsal

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

Synthetic stable-v1 export/import/restore behavior was proven without moving real-store data.

### P10-S2 — Final persistence decision

**Status:** `DONE / ACCEPTED` — D-029

Final target: Supabase/Postgres canonical persistence + Vercel, with Auth/RLS/approved operators, controlled financial RPCs, Dexie as transition/cache and logical JSON as independent recovery/portability.

### P10-S3-I1 — Supabase foundation

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

Dedicated `easy-v2` Supabase project, schema, RLS, `easy_operators`, controlled financial RPC foundation and synthetic security/reconciliation evidence are accepted.

### P10-S3-I2 — Migration and durability contract

**Status:** `DONE / ACCEPTED CONTRACT` — D-030

D-030 requires objective durability beyond Supabase Free alone for definitive zero-cost cutover: unattended trusted-PC logical dumps, verified off-site copies, >=7 retained daily generations, exact-24h server freshness enforcement and restore drills.

### P10-S3-I2-I1 — Legacy private staging/import compatibility

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

Private stable-v1 staging/import/reconciliation/rollback compatibility is available but dormant for the current clean-start plan.

### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof

**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`

Implemented:

- pinned trusted-PC Supabase CLI dump tooling;
- rclone off-site copy/check;
- >=7-day retention logic;
- server recovery-health ledger/guard;
- disposable restore-drill/fingerprint tooling;
- synthetic fail-closed proof and D-019.

Still missing for D-030 acceptance:

- actual trusted-PC unattended execution;
- real configured off-site verification;
- seven real retained UTC daily generations;
- actual disposable trusted-PC/local restore drill.

D-031 explicitly places this proof on hold. It is not the current action and it has not passed.

### P10-S3-I2-I3-A — Runtime-first implementation

**Status:** `DONE / ACCEPTED`

PR #72 implemented:

- Supabase canonical cloud adapter;
- Auth/session + approved-operator gate;
- RLS-backed referential writes;
- controlled financial RPC writes;
- Dexie read-cache mirroring;
- canonical cloud JSON export;
- checkpointed atomic cloud JSON restore;
- explicit temporary D-031 manual-JSON recovery mode.

### P10-S3-I2-I3-B — Synchronize, revalidate and integrate PR #72

**Status:** `DONE / INTEGRATED`

Evidence:

- synchronized head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- validated tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- D-019 run/job: `32502664982` / `96835725075`;
- lint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop`: `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- integrated tree equals validated merge-ref tree: PASS;
- `main` unchanged at `9574e3a4097ddd78ab1f75a13b9ea065287946e9` / tree `57243d004c5b550d0f27576f0179b0033044088e`.

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding

**Status:** `CURRENT / BLOCKED — OPERATOR-LOCAL COMPLETION REQUIRED`

Preflight completed on 2026-08-21:

- Supabase `easy-v2` healthy;
- current publishable key exists;
- temporary D-031 automated recovery guard remains disabled as designed;
- 0 Auth users / 0 approved operators / 0 business rows;
- Security Advisor: 0 lints;
- operator-bound RLS policies present;
- latest Vercel `easy-v2` READY deployment is stale at `develop@d4d428e35a45af0691e80331dd8c7888a914355f`;
- accepted `develop@93500284f5b9105f0de7867a8676c31c7186d194` was not published by this attempt;
- no Vercel env variable or deployment was changed because the connected execution surface did not expose a safe env mutation/source-package deploy path;
- no real Auth account was fabricated, so allow-list insertion, live unauthorized-user denial, approved-user load and initial manual JSON checkpoint remain pending.

Evidence: `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md`.

Complete only the remaining steps:

1. set only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel `easy-v2`;
2. manually deploy the accepted current `develop` revision, not `main`;
3. create/sign in the intended real Auth account through the normal application/Auth flow;
4. add only that real Auth user UUID to `public.easy_operators` through a trusted admin/database path;
5. prove a non-approved authenticated user cannot access business data;
6. confirm the approved operator can load the clean canonical dataset;
7. export/download/store the first logical JSON recovery checkpoint and explicitly confirm it exists;
8. verify the browser exact-24h manual-backup freshness guard becomes healthy for normal writes;
9. begin controlled clean-start early use and collect operational feedback.

Do not include in this slice:

- resuming I2-I2 trusted-PC/seven-day proof;
- importing stable-v1 real-store data;
- publishing/modifying `main`;
- switching the canonical production URL;
- declaring definitive production cutover or D-030 acceptance.

### P10-S3-I2-I4 — Legacy real-data migration

**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

Only revive if the operator explicitly decides historical stable data should be migrated.

### P10-S4 — Definitive cutover / durability closure

**Status:** `NOT_STARTED / NOT AUTHORIZED`

A later explicit gate must settle durability (complete D-030 or accept a replacement mechanism), canonical URL/publication, rollback and any stable-system decommission policy.

## Current NEXT_ACTION

**P10-S3-I2-I3-C only — complete the operator-local publication/Auth/allow-list/denial/manual-JSON steps above.** See `docs/V2/STATUS.md` for the exact bounded instruction.