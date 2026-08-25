# Easy V2 — Canonical Backlog

**Updated:** 2026-08-25

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

Accepted integration evidence remains in `QA_LEDGER.md` and the runtime execution record. Stable `main` remained untouched.

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding

**Status:** `DONE / ACCEPTED`

Completed on 2026-08-25:

- Vercel `easy-v2` manually published `develop@768776e7da52da5051b7a69dec071d0481cd810d` as a READY candidate;
- only `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` were configured for the browser runtime;
- intended real operator account created/confirmed through normal Supabase Auth;
- exactly one real operator UUID added to the active `easy_operators` allow-list through the trusted DB boundary;
- separate authenticated non-approved user remained at the waiting gate;
- database/RLS denial probe rejected a business write from that non-allow-listed identity and left no residue;
- approved operator loaded the clean canonical dataset;
- categories/items/resellers/transactions remained 0 at acceptance;
- first Backup v2 JSON was exported, stored outside the browser and explicitly confirmed by the operator;
- exact-24h browser recovery guard entered the healthy/current interval for the same installation.

Known plan-limited note:

- Supabase Security Advisor now reports the Auth warning `auth_leaked_password_protection`;
- official Supabase docs state leaked-password protection requires Pro or above;
- current paid-infrastructure budget is US$0 / Free, so the warning is recorded as residual early-use risk rather than hidden or treated as D-030 acceptance.

Evidence: `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md`.

### P10-S3-I2-I3-D — Controlled clean-start early-use observation

**Status:** `CURRENT`

Use the accepted candidate for actual clean-start workflows and collect concrete operational evidence.

Required operating boundary:

1. keep the manual Backup v2 recovery copy fresher than the exact 24-hour boundary before normal writes;
2. record concrete workflow friction, defects or missing behavior when observed;
3. implement changes only in response to actual early-use evidence or an explicit operator instruction;
4. keep Supabase/Postgres canonical and preserve Auth/RLS/allow-list + controlled financial RPC semantics;
5. continue manual Vercel publication policy while this is candidate/early-use mode.

Do not include in I3-D unless separately authorized:

- resuming I2-I2 trusted-PC/seven-day proof;
- importing stable-v1 real-store data;
- publishing/modifying `main`;
- switching the canonical final production URL;
- declaring definitive production cutover or D-030 acceptance.

### P10-S3-I2-I4 — Legacy real-data migration

**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

Only revive if the operator explicitly decides historical stable data should be migrated.

### P10-S4 — Definitive cutover / durability closure

**Status:** `NOT_STARTED / NOT AUTHORIZED`

A later explicit gate must settle durability (complete D-030 or accept a replacement mechanism), canonical URL/publication, rollback and any stable-system decommission policy.

## Current NEXT_ACTION

**P10-S3-I2-I3-D only — operate the accepted clean-start candidate, keep the confirmed JSON recovery checkpoint inside the exact 24-hour freshness boundary, and collect concrete early-use feedback. Repository/runtime work must be driven by observed evidence or explicit operator instruction.** See `docs/V2/STATUS.md` for the exact bounded instruction.