# Easy V2 — Canonical Status

**Updated:** 2026-08-25  
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
- **P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / INTEGRATED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031.**
- **P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding: `DONE / ACCEPTED`.**
- **P10-S3-I2-I3-D — Controlled clean-start early-use observation: `CURRENT`.**
- P10-S3-I2-I4 — Legacy real-data migration/reconciliation: `ON_HOLD / NOT REQUIRED FOR THE CURRENT CLEAN-START EARLY-USE PATH`.

## Critical governance override — D-031

D-031 authorizes a runtime-first controlled early-use candidate before the D-030 unattended off-site backup proof is completed. It changes sequencing only; it does not claim D-030 passed.

Therefore:

1. P10-S3-I2-I2 stays pending but **ON HOLD** and is not the current action.
2. Supabase/Postgres is canonical business persistence for the controlled candidate.
3. Supabase Auth/RLS plus the server-managed `easy_operators` allow-list remain mandatory.
4. During temporary early use, logical JSON backup is the active recovery path and normal browser writes remain fail-closed when the last confirmed JSON recovery copy reaches the exact 24-hour boundary.
5. The automated D-030 server recovery-health acceptance proof remains pending/disabled for early-use mode; it is not silently accepted.
6. Early use is **clean start**: no legacy real-store migration/import is required or authorized.
7. `main` stays untouched. Vercel remains candidate hosting and deployment remains manual.
8. Definitive production/canonical cutover remains a later explicit gate; D-030 durability must eventually be completed or replaced by a separately accepted durability decision.

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
- `docs/V2/P10_S3_I2_MIGRATION_GATE.md` — D-030 migration/durability contract.
- `docs/V2/P10_S3_I2_I2_EXECUTION.md` — implemented automated-recovery prerequisite and historical blocker evidence; ON HOLD.
- `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md` — D-031 sequencing/early-use authority.
- `docs/V2/P10_S3_I2_I3_RUNTIME_FIRST_EXECUTION.md` — accepted runtime-first implementation/integration evidence.
- `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md` — accepted live candidate/operator/checkpoint evidence.

## Current technical baseline

Accepted candidate runtime behavior:

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

## P10-S3-I2-I3-C acceptance — 2026-08-25

The prior operator-local blocker is resolved.

Vercel `easy-v2` evidence:

- current candidate deployment `dpl_FwpUedZ8gpMzCs5nLBjrv39V2FJs` is `READY`;
- source branch is `develop`;
- source revision is `768776e7da52da5051b7a69dec071d0481cd810d`;
- candidate aliases include `easy-v2-tau.vercel.app` and the `develop` alias;
- browser configuration uses only `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`;
- no browser/admin secret exposure was introduced.

Supabase `easy-v2` (`hrmkkhqfyfoqucwbcszq`) evidence:

- intended real operator account created/confirmed through the normal Auth flow;
- exactly one active operator is present in `public.easy_operators`;
- separate authenticated non-approved account remained outside the allow-list and saw the expected waiting gate;
- a trusted SQL/RLS denial probe for that non-approved Auth identity rejected a business-table insert and left 0 residual rows;
- aggregate closure state: 3 Auth users, 1 active approved operator, 2 authenticated users outside the active allow-list;
- categories/items/resellers/transactions: 0 each;
- approved operator successfully loaded the clean candidate;
- no legacy/synthetic business payload entered the canonical tables.

Manual recovery evidence:

- approved operator exported the first Backup v2 JSON;
- operator explicitly confirmed the file was stored outside the browser;
- operator clicked `Confirmar que guardei a cópia` in the same installation;
- accepted implementation deterministically places that installation inside the exact-24h healthy interval (`writeBlocked = false`) immediately after export + confirmation;
- writes will fail closed again at age `>= 24h` unless a fresh export is generated/confirmed.

Supabase advisor note:

- Performance Advisor remains INFO-only unused-index notices on the empty/tiny candidate database;
- Security Advisor now reports `auth_leaked_password_protection` because leaked-password protection is disabled;
- official Supabase documentation states this feature is available on Pro Plan and above;
- current paid-infrastructure budget remains US$0 / Free, so this is recorded as a known residual early-use Auth risk rather than misreported as zero lints;
- Auth + allow-list + RLS remain proven and definitive cutover is still not authorized.

**Result: P10-S3-I2-I3-C is DONE / ACCEPTED. Controlled clean-start early use is authorized.**

## Repository / evidence baseline

Before this documentation-only closure:

- accepted `develop`: **`768776e7da52da5051b7a69dec071d0481cd810d`**, tree **`2700203423adf7be1ac3ba290cf38ed0873beda5`**;
- stable `main`: **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**, tree **`57243d004c5b550d0f27576f0179b0033044088e`** — unchanged;
- closure branch: `ops/p10-s3-i2-i3-c-operator-onboarding`.

No runtime/schema change is required by this closure. D-019 remains mandatory before documentation integration.

## Authoritative decisions

D-001 through D-031 remain accepted with supersession/refinement relationships respected. No new architecture/product decision was required to complete I2-I3-C.

D-031 continues to control early-use sequencing while leaving D-030 durability acceptance pending.

## NEXT_ACTION

**Execute only P10-S3-I2-I3-D — controlled clean-start early-use observation. Use the accepted Vercel/Supabase candidate for real clean-start workflows, keep the operator-confirmed manual JSON recovery checkpoint fresher than the exact 24-hour boundary before normal writes, and collect concrete operational feedback, workflow friction or defects. Do not proactively resume P10-S3-I2-I2, import legacy real-store data, modify/publish `main`, switch the canonical final production URL, enable definitive cutover or claim D-030 durability acceptance. Repository/runtime changes in I3-D must be driven by observed early-use evidence or an explicit operator instruction.**