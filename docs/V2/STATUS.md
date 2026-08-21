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
- **P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / INTEGRATED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031; PR #72.**
- **P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding: `BLOCKED / OPERATOR-LOCAL COMPLETION REQUIRED — CURRENT NEXT ACTION`.**
- P10-S3-I2-I4 — Legacy real-data migration/reconciliation: `ON_HOLD / NOT REQUIRED FOR THE CURRENT CLEAN-START EARLY-USE PATH`.

## Critical governance override — D-031

D-031 authorizes a runtime-first controlled early-use candidate before the D-030 unattended off-site backup proof is completed. It changes sequencing only; it does not claim D-030 passed.

Therefore:

1. P10-S3-I2-I2 stays pending but **ON HOLD** and is not the current action.
2. The Supabase/Auth/runtime implementation is integrated in `develop`.
3. Supabase/Postgres is the intended canonical business datastore for the candidate when browser-safe Supabase environment variables are configured.
4. Supabase Auth/RLS plus the server-managed `easy_operators` allow-list remain mandatory.
5. During temporary early use, logical JSON backup is the active recovery path and normal browser writes remain fail-closed when the last confirmed JSON recovery copy is older than the accepted exact 24-hour boundary.
6. The automated D-030 server recovery-health acceptance proof remains pending/disabled for early-use mode; it is not silently accepted.
7. Early use is **clean start**: no legacy real-store migration/import is required or authorized.
8. `main` stays untouched. Vercel remains candidate hosting and deployment remains manual.
9. Definitive production/canonical cutover remains a later explicit gate; D-030 durability must eventually be completed or replaced by a separately accepted durability decision.

Authoritative governance record: `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md`.

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
- `docs/V2/P10_S3_I2_I3_RUNTIME_FIRST_EXECUTION.md` — accepted runtime-first implementation/integration evidence.
- `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md` — current live preflight and operator-local blocker evidence.

## Current technical baseline

`develop` contains the D-031 runtime-first candidate from PR #72.

Integrated behavior, when browser-safe Supabase environment variables are configured:

- Supabase/Postgres is canonical business persistence;
- Supabase Auth session gate + `easy_operators` authorization check protects access;
- category/item/reseller writes go to Supabase;
- financial writes use the controlled PostgreSQL RPC boundary;
- Dexie is a read cache/mirror for existing reports/search, not authoritative persistence;
- JSON export reads canonical Supabase data;
- approved-operator JSON restore is server-atomic, checkpointed and post-restore verified;
- early-use manual-JSON recovery mode keeps the browser exact-24h freshness guard;
- no legacy real-data migration is part of this clean-start path.

The D-030 trusted-PC unattended dump/rclone/retention/restore tooling remains implemented, but its operator-local acceptance proof is deferred under D-031.

## P10-S3-I2-I3-C live preflight — 2026-08-21

The current action was attempted and correctly stopped without fabricated acceptance.

Supabase `easy-v2` (`hrmkkhqfyfoqucwbcszq`, `sa-east-1`) live evidence:

- project healthy;
- active browser-safe publishable key exists;
- `private.recovery_enforcement_state.automated_guard_enabled = false`, as required by temporary D-031 early-use mode;
- 0 Auth users;
- 0 `easy_operators` rows;
- 0 categories, items, resellers and transactions;
- Security Advisor: 0 lints;
- Performance Advisor: INFO-only unused-index notices on the empty/tiny homologation database;
- business-table RLS policies remain bound to `is_easy_operator()` for authenticated access.

Vercel `easy-v2` live evidence:

- the latest READY candidate deployment is stale at `develop@d4d428e35a45af0691e80331dd8c7888a914355f`;
- accepted `develop@93500284f5b9105f0de7867a8676c31c7186d194` was therefore not yet proven as the published candidate;
- the connected execution surface did not expose a safe project-env mutation for the two required public variables;
- the generic deployment attempt was rejected before deployment creation because the connected action requires source-package fields not safely exposed by its available schema;
- no Vercel env variable was changed and no new deployment was created.

The intended real operator account also does not yet exist. The protocol forbids inventing credentials or creating a synthetic identity and representing it as the real operator. Therefore allow-list insertion, live unauthorized-user denial, approved-user load proof, first manual JSON checkpoint and exact-24h healthy-guard evidence remain incomplete.

**Result: I2-I3-C remains the sole current action, now `BLOCKED / OPERATOR-LOCAL COMPLETION REQUIRED`.**

## Repository / evidence baseline

- stable `main`: **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**, tree **`57243d004c5b550d0f27576f0179b0033044088e`** — unchanged at pre-closure verification.
- current accepted pre-closure `develop`: **`93500284f5b9105f0de7867a8676c31c7186d194`**, tree **`4c510a9fb99fe29746ecaf209d4679dd55bbe946`**.
- PR #72 synchronized feature head: **`6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`**.
- PR #72 exact validated merge ref: **`77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`**, tree **`4ed336e4d05dc95df1abba7a9894d1b10abcd49b`**.
- PR #72 D-019: run **`32502664982`**, job **`96835725075`** — **0 lint errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #72 squash-integrated `develop` commit: **`8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`**, tree **`4ed336e4d05dc95df1abba7a9894d1b10abcd49b`**.
- final tree equivalence for PR #72: **PASS**.

Repository `vercel.json` continues to disable Git-triggered Vercel deployments. Candidate publication is manual only.

## Authoritative decisions

D-001 through D-031 are accepted with supersession/refinement relationships respected. For current sequencing, **D-031 controls over the earlier D-030 order-of-operations restriction** while leaving D-030 durability acceptance pending.

No new architecture/product decision was required by the I2-I3-C preflight blocker; `ARCHITECTURE.md` and accepted decisions remain unchanged.

D-019 remains mandatory for repository integration. Objective failures block merge.

## NEXT_ACTION

**Complete only the remaining operator-local P10-S3-I2-I3-C steps: in Vercel `easy-v2`, configure only browser-safe `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`, manually publish the accepted current `develop` revision (not `main`), create/sign in the intended real operator account through the normal Auth flow, add only that Auth UUID to `public.easy_operators` through a trusted admin/database boundary, separately prove an authenticated non-allow-listed user cannot access business data, prove the approved operator can load the clean canonical dataset, export/download/store and explicitly confirm the first manual JSON recovery checkpoint, verify the exact-24h browser freshness guard becomes healthy, and only then begin controlled clean-start early use. Do not resume P10-S3-I2-I2, import legacy real-store data, modify/publish `main`, switch the canonical production URL, enable definitive cutover, or claim D-030 durability acceptance.**