# Easy V2 — Canonical Status

**Updated:** 2026-08-25  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P10 — Controlled migration and cutover: `IN_PROGRESS`.**  
**P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS`.**

Current P10-S3 state:

- P10-S3-I1 — Supabase foundation: `DONE / ACCEPTED — SYNTHETIC FOUNDATION`.
- P10-S3-I2 — migration/reconciliation + durability contract: `DONE / ACCEPTED CONTRACT` — D-030.
- P10-S3-I2-I1 — legacy stable-v1 staging/import compatibility: `DONE / ACCEPTED — SYNTHETIC ONLY`.
- **P10-S3-I2-I2 — zero-cost unattended backup/recovery proof: `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.**
- **P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / ACCEPTED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031.**
- **P10-S3-I2-I3-C — manual Vercel candidate + operator onboarding: `DONE / ACCEPTED`.**
- **P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.**
  - change #1 grouped reseller PDF: `DONE / INTEGRATED` — PR #79;
  - change #2 store-global manual recovery checkpoint: `DONE / ACCEPTED / INTEGRATED` — D-032 / PR #80;
  - D-032 rollout: `OPERATOR-LOCAL — UPDATED VERCEL PUBLISH + FIRST REAL GLOBAL CHECKPOINT PENDING`.
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Governing decisions

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 refines only the temporary manual JSON recovery control for the hosted cloud candidate:

1. Supabase/Postgres remains canonical business persistence.
2. Supabase Auth + RLS + active `easy_operators` authorization remain mandatory.
3. In hosted cloud mode, the accepted manual JSON recovery checkpoint is **store-global**, not per-browser.
4. An approved operator export is recorded in Supabase with server time; a separate explicit confirmation is required after the operator verifies that the JSON was actually stored outside the Easy.
5. Once the global manual mode has been initialized, the latest confirmed export is shared by all approved operators/devices and normal business writes are blocked at exact age `>= 24h`.
6. The database enforces that boundary in addition to the browser. A browser that cannot verify current global health fails closed for writes.
7. The historical local/no-cloud path retains the existing D-024 local-storage behavior; D-032 does not convert local mode into shared state.
8. This manual global checkpoint remains a temporary D-031 recovery mechanism. It does **not** prove off-site durability, retained generations or restore drills and therefore does not satisfy D-030.
9. D-030 automated recovery enforcement, when later enabled, takes precedence over this temporary manual mechanism.
10. `main` stays untouched; Vercel remains manual candidate hosting; definitive cutover remains a later explicit gate.

## Startup protocol for a new conversation

Read in this exact order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only evidence required by `NEXT_ACTION`.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current `BACKLOG.md`;
4. phase execution/history documents.

Phase-specific evidence relevant now:

- `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md` — D-029 final architecture.
- `docs/V2/P10_S3_I2_MIGRATION_GATE.md` — D-030 migration/durability contract.
- `docs/V2/P10_S3_I2_I2_EXECUTION.md` — automated-recovery prerequisite; operator-local proof ON HOLD.
- `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md` — D-031 sequencing/early-use authority.
- `docs/V2/P10_S3_I2_I3_RUNTIME_FIRST_EXECUTION.md` — accepted runtime-first implementation.
- `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md` — original per-installation onboarding checkpoint evidence; retained historically and refined for cloud operation by D-032.
- `docs/V2/P10_S3_I2_I3_D_GLOBAL_RECOVERY_CHECKPOINT.md` — D-032 implementation/database/repository proof and rollout boundary.

## Current technical baseline

Hosted candidate code after D-032 integration:

- canonical business data lives in Supabase/Postgres;
- `CloudAuthGate` requires an authenticated approved operator;
- category/item/reseller writes use RLS-protected Supabase tables;
- financial writes stay inside controlled PostgreSQL RPC transactions;
- Dexie is a read cache/mirror, not authoritative cloud persistence;
- JSON export reads canonical Supabase data;
- approved-operator JSON restore remains database-atomic, checkpointed and post-restore verified;
- `public.manual_recovery_events` stores append-only export/confirmation events shared by approved operators;
- `public.get_manual_recovery_health()` exposes the current global confirmed checkpoint plus the current operator's pending export;
- cloud clients hydrate/poll global recovery health and do not use per-browser state as the cloud authority;
- the database business-write guard enforces the exact-24h global checkpoint after the manual mode is initialized;
- no legacy real-data migration is part of the clean-start path.

The D-030 trusted-PC dump/rclone/retention/restore tooling remains implemented but its real operator-local acceptance proof remains ON HOLD.

## Accepted early-use evidence

### Candidate onboarding — I3-C

- manual Vercel candidate from `develop` was proven READY;
- only browser-safe Supabase URL + publishable key were configured;
- one intended operator was approved via `easy_operators`;
- a separate authenticated non-approved user remained denied by UI/RLS;
- approved operator loaded the clean canonical dataset;
- first manual JSON copy was exported and explicitly confirmed outside the browser;
- no legacy real-store data entered the canonical database.

That first checkpoint was historically per installation. D-032 supersedes only that cloud-state topology for subsequent hosted operation.

### Early-use change #1 — reseller PDF grouping

PR #79 is integrated into `develop` as `3c0fe29c62dd72d6acdcd3fc217ba392d4f2aa04`.

Final PR #79 evidence:

- final head `3d3cab2490f504d0464d722d08079dfb9fcdcb8c`;
- exact merge ref `f74af101e2335e7ca3dd4c52d51e46c3118de791`;
- run/job `32885324610` / `97924299040`;
- ESLint 0 errors / 82 warnings;
- Vitest 57 files / 242 tests PASS;
- Playwright 17/17 PASS;
- production build PASS.

### Early-use change #2 — store-global manual recovery checkpoint

Explicit operator instruction required one confirmed manual backup to protect all approved devices rather than each browser maintaining an independent 24-hour clock.

PR #80 implementation/database proof:

- production Supabase migration `20260825191150_global_manual_recovery_checkpoint` applied;
- append-only recovery-event table has RLS enabled;
- `anon` has no access; `authenticated` has only SELECT/INSERT subject to approved-operator policies; UPDATE/DELETE are not granted;
- non-allow-listed authenticated identity was denied;
- approved operator could not confirm before a pending export existed;
- export + explicit confirmation returned shared global health;
- fresh checkpoint allowed a business write in synthetic transactional proof;
- at the exact 24-hour boundary the same write boundary returned SQLSTATE `55000` / blocked;
- all synthetic events/business rows were rolled back and final counts returned to zero;
- automated D-030 guard remains disabled under D-031 and is not claimed accepted;
- Security Advisor introduced no new schema/RLS finding; the known Free-plan leaked-password warning remains.

Final exact-tree PR #80 D-019:

- final feature head `410bafe792233731561ec2d3aa1d2b38f573fea1`;
- exact GitHub merge ref `cc0b740de4c419a73cfc0c1af6f8ab26729be3b2`;
- validated tree `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e`;
- run/job `32891655554` / `97944738069`;
- ESLint 0 errors / 82 warnings;
- Vitest 59 files / 251 tests PASS;
- Playwright 17/17 PASS;
- production build PASS.

PR #80 was squash-integrated into `develop` as `dbcc2a25394aa09f63d9232e771c9e9278db1fd0`. The integrated tree is exactly `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e`, proving equivalence to the D-019-validated merge-ref tree.

## Repository state after PR #80

- accepted D-032 integration commit: `dbcc2a25394aa09f63d9232e771c9e9278db1fd0`;
- accepted D-032 tree: `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e`;
- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- stable `main` tree: `57243d004c5b550d0f27576f0179b0033044088e` — unchanged.

The Vercel candidate was still serving the older manually published `develop@768776e7da52da5051b7a69dec071d0481cd810d` when repository integration closed. The production Supabase global-event ledger remained empty, so the new manual-global mode was not yet operationally initialized and the old candidate was not involuntarily locked.

## NEXT_ACTION

**Complete only the D-032 operator-local rollout: manually publish the current accepted `develop` candidate to Vercel and verify the deployment source is the current `develop` revision containing D-032. Then, from an approved operator session on the updated candidate, perform one fresh real `Exportar Backup v2`, verify the JSON is stored outside the Easy, and click `Confirmar que guardei a cópia`. That first real global confirmation initializes the shared exact-24h cloud guard for every approved device. Afterward continue P10-S3-I2-I3-D observation only. Do not resume I2-I2, import legacy real-store data, modify/publish `main`, switch the final canonical URL, enable definitive cutover or claim D-030 durability acceptance.**