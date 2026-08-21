# Easy V2 — Canonical Status

**Updated:** 2026-08-21  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P10 — Controlled migration and cutover: `IN_PROGRESS`.**  
**P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS`.**

Current P10-S3 state:

- P10-S3-I1 — Supabase foundation with synthetic data only: `DONE / ACCEPTED`.
- P10-S3-I2 — Migration/reconciliation + durability contract: `DONE / ACCEPTED CONTRACT` — D-030.
- P10-S3-I2-I1 — Legacy stable-v1 staging/import compatibility: `DONE / ACCEPTED — SYNTHETIC ONLY`.
- **P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof: `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.**
- **P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `IN_PROGRESS / AUTHORIZED FOR EARLY-USE CANDIDATE` — D-031; PR #72.**
- P10-S3-I2-I4 — Legacy real-data migration/reconciliation: `ON_HOLD / NOT REQUIRED FOR THE CURRENT CLEAN-START EARLY-USE PATH`.

## Critical governance override — D-031

On 2026-08-21 the operator explicitly changed the sequencing after the I2-I2 trusted-PC proof could not be completed remotely.

D-031 authorizes a **runtime-first early-use candidate** before the D-030 unattended off-site backup proof is completed. This is a sequencing exception, not a claim that D-030 passed.

Therefore:

1. P10-S3-I2-I2 stays pending but is **ON HOLD**. It is not the current action.
2. P10-S3-I2-I3 is explicitly authorized now.
3. The early-use candidate may make Supabase/Postgres the canonical business datastore, protected by Supabase Auth/RLS and the approved-operator allow-list.
4. During this temporary mode, logical JSON backup remains the active operator recovery path and normal browser writes remain fail-closed when the last confirmed JSON backup is older than the accepted 24-hour boundary.
5. The automated D-030 server recovery-health requirement remains pending/disabled for early-use mode; it is not silently considered accepted.
6. Early use is **clean start**: no legacy real-store migration/import is required or authorized by this step.
7. `main` stays untouched. Vercel remains candidate hosting and deployment remains manual.
8. Definitive production/canonical cutover remains a later explicit gate; D-030 durability must eventually be completed or replaced by a separately accepted durability decision before that definitive gate.

Authoritative governance record: `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md`.

### Conflict rule for older documents/history

Any pre-D-031 sentence saying that I2-I2 is `CURRENT`, that I2-I3 is `NOT_AUTHORIZED UNTIL I2-I2 PASSES`, or that the only next action is the trusted-PC backup proof is **historical and superseded for sequencing by D-031**.

Do **not** resume I2-I2 merely because older execution records or Git history contain that prior state.

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
2. accepted decisions in `DECISIONS.md`, especially the newest applicable decision;
3. current `BACKLOG.md`;
4. phase execution/history documents.

Phase-specific evidence relevant now:

- `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md` — D-029 final architecture.
- `docs/V2/P10_S3_I1_EXECUTION.md` — accepted synthetic Supabase foundation.
- `docs/V2/P10_S3_I2_MIGRATION_GATE.md` — D-030 migration/durability contract.
- `docs/V2/P10_S3_I2_I1_EXECUTION.md` — accepted synthetic staging/import proof.
- `docs/V2/P10_S3_I2_I2_EXECUTION.md` — implemented automated-recovery prerequisite and historical blocker evidence; now ON HOLD.
- `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md` — D-031 sequencing/early-use authority.
- `docs/V2/P10_S3_I2_I3_RUNTIME_FIRST_EXECUTION.md` — runtime-first implementation record currently carried by PR #72 until integration.

## Current technical baseline

`develop` now includes the accepted D-031 governance correction. The runtime switch itself is still carried by open PR #72 (`feat/p10-s3-i2-i3-runtime-first`) and has not yet been integrated into `develop`.

PR #72 implements, when browser-safe Supabase environment variables are configured:

- Supabase/Postgres as canonical business data source;
- Supabase Auth session gate + `easy_operators` authorization check;
- category/item/reseller writes against Supabase;
- financial writes through the existing controlled PostgreSQL RPC boundary;
- Dexie as a read cache/mirror for existing reports/search rather than authoritative persistence;
- JSON export from canonical Supabase data;
- approved-operator atomic server-side JSON restore with checkpoint download and post-restore verification;
- early-use manual-JSON recovery mode with the browser 24-hour freshness guard;
- no legacy real-data migration; clean-start use.

The D-030 trusted-PC unattended dump/rclone/retention/restore tooling remains implemented in the repository/database, but its operator-local acceptance proof is deferred under D-031.

## Repository / evidence baseline

- stable `main`: **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**, tree **`57243d004c5b550d0f27576f0179b0033044088e`** — unchanged after D-031 docs integration.
- D-031 canonical governance was integrated by PR #74 as `develop` commit **`4c3c42e6de805e171fb1e840adbfc596ecad8bc3`**, tree **`b6a6fe342470951cdf5455833e9af5dad8e4f9a8`**.
- PR #74 exact validated merge ref: **`62a7b646ba2a2efa500fcc43c5e0df206a2dc0b1`**.
- PR #74 D-019: run **`32497468087`**, job **`96819192500`** — **0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- earlier `develop` commit `c1fdf4b3140bb6e9b89e2cc8f36933a8c0c4a4f2` remains historical evidence of the valid I2-I2 remote fail-closed NO-GO; D-031 supersedes only its sequencing consequence.
- PR #72 head before synchronization: **`385e59b22ac83ff43097cefeeb4551d28f606dbf`**.
- PR #72 previously passed D-019 on its old merge ref: run **`32492337376`**, job **`96802676149`**, merge ref **`1e746bb2dd133f5bfcaac7818b27996f802476ed`** — **0 lint errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- because `develop` advanced after that PR #72 merge ref, PR #72 must be synchronized with current `develop` and D-019 must pass again on the new exact merge ref before integration.

Supabase homologation remains the dedicated `easy-v2` project `hrmkkhqfyfoqucwbcszq` in `sa-east-1`. No legacy store dataset has been imported by the runtime-first work.

Repository `vercel.json` continues to disable Git-triggered Vercel deployments. Candidate publication is manual only.

## Authoritative decisions

D-001 through D-031 are accepted with supersession/refinement relationships respected. For current sequencing, **D-031 controls over the earlier D-030 order-of-operations restriction** while leaving D-030 durability acceptance pending.

D-019 remains mandatory for integration. Objective failures block merge.

## NEXT_ACTION

**Continue only P10-S3-I2-I3 by synchronizing PR #72 (`feat/p10-s3-i2-i3-runtime-first`) with current `develop` after D-031, resolving only resulting integration conflicts without changing the accepted runtime-first scope, rerunning mandatory D-019 against the new exact PR merge ref, and — only if it passes — marking PR #72 ready and squash-integrating it into `develop`, then verifying final tree equivalence and confirming `main` is still unchanged. Do not execute the P10-S3-I2-I2 trusted-PC backup proof as the current action. Do not import legacy real-store data, publish/modify `main`, switch the canonical production URL or claim definitive production cutover. After PR #72 is integrated, the next bounded step is manual Vercel candidate publication/configuration, creation/approval of the intended Supabase Auth operator, first manual JSON recovery checkpoint and controlled clean-start early use.**