# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-21

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `ON_HOLD`, `ABANDONED`, `DONE`.

## P0–P9

**Status:** `DONE / INTEGRATED`.

Completed program includes governance, referential lifecycle, audited correction/reversal, financial dates/statements/aging, local backup/restore, CI/deployment safety, UX refinement, direct store discovery, D-024 recovery guard, D-025 categories/reporting and D-026 full-field correction.

## P10 — Controlled migration and cutover

**Status:** `IN_PROGRESS`.

P10 remains fail-closed: completion of one slice does not silently authorize real-data movement, `main` publication or canonical cutover.

### P10-S1 — Pre-cutover compatibility and synthetic rehearsal

**Status:** `DONE / ACCEPTED`.

Stable-v1 normalization/recovery was proven synthetically. No real store data moved.

### P10-S2 — Historical copied-live-data IndexedDB beta

**Status:** `ABANDONED / SUPERSEDED BEFORE EXPORT`.

D-028 remains historical evidence. No real beta dataset was created.

### P10-S3 — Supabase canonical-persistence transition

**Status:** `IN_PROGRESS — CURRENT PROGRAM`.

#### P10-S3-I1 — Supabase foundation

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`.

Dedicated Supabase project, schema, RLS, approved-operator authorization, financial RPCs, generated types and synthetic proof are accepted.

#### P10-S3-I2 — Migration/durability contract

**Status:** `DONE / ACCEPTED CONTRACT` — D-030.

##### P10-S3-I2-I1 — Legacy stable-v1 staging/import compatibility

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`.

Private staging, explicit current classification, atomic promotion and exact reconciliation are implemented/proven with synthetic fixtures.

##### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof

**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.

Implemented prerequisites remain available:

- pinned trusted-PC Supabase CLI data-only dump;
- rclone off-site copy/check/list verification;
- >=7 UTC daily generation retention logic;
- server-visible recovery ledger;
- exact-24h + retention business-write guard;
- disposable local/Docker restore fingerprint drill;
- synthetic database security/guard proof.

Still unproven:

- actual trusted-PC scheduled run;
- actual off-site destination verification;
- seven real retained daily generations;
- actual trusted-PC restore drill.

**D-031 explicitly places these operator-local items ON HOLD. They are not the current next action.**

##### P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate

**Status:** `IN_PROGRESS / AUTHORIZED FOR EARLY USE` — D-031.

Current implementation: PR #72 `feat/p10-s3-i2-i3-runtime-first`.

Scope:

1. Supabase becomes canonical business data source when configured.
2. Supabase Auth + `easy_operators` gate application access.
3. category/item/reseller mutations write to Supabase.
4. financial mutations use controlled transactional RPCs.
5. Dexie remains read cache/mirror, not source of truth.
6. JSON export reads canonical Supabase data.
7. approved-operator JSON restore is server-atomic and checkpointed.
8. manual JSON recovery freshness remains fail-closed at 24h during early use.
9. D-030 automated recovery enforcement remains pending/disabled in this temporary mode.
10. early use begins clean; no legacy real-data migration.

Previously passing PR #72 evidence:

- head `385e59b22ac83ff43097cefeeb4551d28f606dbf`;
- D-019 run `32492337376`, job `96802676149`;
- then-current merge ref `1e746bb2dd133f5bfcaac7818b27996f802476ed`;
- 0 lint errors / 82 warnings;
- 57 files / 240 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS.

Because `develop` advanced after that run, this evidence must be repeated on the newly generated exact merge ref before integration.

###### I2-I3-A — Canonical governance correction

**Status:** `IN_PROGRESS` until the D-031 docs PR is merged to `develop`.

Exit: all seven startup docs agree that I2-I2 is ON HOLD and I2-I3 is current.

###### I2-I3-B — PR #72 integration

**Status:** `NEXT` after I2-I3-A.

Steps:

- synchronize PR #72 with updated `develop`;
- resolve only integration conflicts;
- rerun D-019 on exact new merge ref;
- mark ready and squash merge if green;
- verify integrated tree and `main` unchanged.

###### I2-I3-C — Manual Vercel candidate + operator onboarding

**Status:** `NOT_STARTED / AUTHORIZED AFTER PR #72 INTEGRATES`.

Bounded steps:

- manual Vercel candidate deployment from accepted V2 tree;
- configure only public Supabase URL/publishable key in browser environment;
- create/login intended Supabase Auth account through normal Auth flow;
- add only that user to `easy_operators` through trusted admin/database boundary;
- prove unauthorized user cannot access business data;
- create first manual JSON recovery checkpoint and confirm freshness;
- begin controlled clean-start early use.

##### P10-S3-I2-I4 — Real legacy migration/reconciliation

**Status:** `ON_HOLD / NOT REQUIRED FOR CURRENT CLEAN-START EARLY USE`.

The accepted staging/import path remains available if the operator later explicitly chooses to migrate historical stable data. Do not execute it by default.

### Definitive cutover / later P10

**Status:** `NOT_AUTHORIZED`.

Still requires a later explicit gate covering final durability acceptance, stable/main publication strategy, canonical URL switch, rollback policy and decommissioning.

D-031 does **not** make the early-use candidate equivalent to final cutover.