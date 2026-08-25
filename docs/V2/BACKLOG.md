# Easy V2 — Canonical Backlog

**Updated:** 2026-08-25

This backlog records current ordered work. Historical implementation detail remains in phase execution documents and Git/PR history.

## P0–P9 — Accepted historical baseline

P0 through P9 are accepted/integrated. Major accepted outcomes include branch/governance, D-019, reversible lifecycle, audited financial corrections, occurrence-date semantics, statements/debt aging, backup/restore hardening, local recovery safeguards, category identity/snapshots/reporting and full-field linked correction.

Do not reopen historical phases merely because legacy task files contain unchecked boxes.

## P10 — Controlled migration / cloud transition

**Status:** `IN_PROGRESS`

### P10-S1 — Stable-v1 compatibility/rehearsal
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

### P10-S2 — Final persistence decision
**Status:** `DONE / ACCEPTED` — D-029

Supabase/Postgres canonical persistence + Vercel, with Auth/RLS/approved operators, controlled financial RPCs, Dexie as cache/transition and logical JSON as independent recovery/portability.

### P10-S3-I1 — Supabase foundation
**Status:** `DONE / ACCEPTED`

### P10-S3-I2 — Migration and durability contract
**Status:** `DONE / ACCEPTED CONTRACT` — D-030

Definitive zero-cost cutover still requires unattended trusted-PC logical dumps, verified off-site copies, at least seven retained successful daily generations, exact-24h server freshness enforcement and restore drills.

### P10-S3-I2-I1 — Legacy private staging/import compatibility
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

Dormant under the clean-start path.

### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof
**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`

D-030 acceptance still lacks actual unattended trusted-PC execution, real off-site verification, seven retained UTC daily generations and a disposable restore drill. D-031 explicitly keeps this on hold.

### P10-S3-I2-I3-A/B — Runtime-first implementation and integration
**Status:** `DONE / ACCEPTED / INTEGRATED`

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding
**Status:** `DONE / ACCEPTED`

### P10-S3-I2-I3-D — Controlled clean-start early-use observation
**Status:** `CURRENT`

Operating boundary:

1. use the accepted candidate for real clean-start workflows;
2. keep the temporary recovery checkpoint inside the exact 24-hour boundary before normal writes;
3. implement changes only from observed early-use evidence or explicit operator instruction;
4. keep Supabase/Postgres canonical and preserve Auth/RLS/allow-list + controlled financial RPC semantics;
5. keep Vercel publication manual while this remains candidate/early-use mode.

#### Early-use change #1 — reseller PDF grouped by product
**Status:** `DONE / INTEGRATED — PR #79`

Final D-019 run/job `32885324610` / `97924299040`; 0 lint errors / 82 warnings; 57 files / 242 Vitest PASS; 17/17 Playwright PASS; build PASS. Integrated `develop` commit `3c0fe29c62dd72d6acdcd3fc217ba392d4f2aa04`.

#### Early-use change #2 — store-global manual recovery checkpoint
**Status:** `DONE / ACCEPTED / INTEGRATED — D-032 / PR #80`

Implemented:

- append-only `public.manual_recovery_events` in Supabase;
- approved-operator-only SELECT/INSERT under RLS; no browser UPDATE/DELETE;
- server-assigned actor/timestamps;
- confirmation requires the same operator to have a pending unconfirmed export;
- global health RPC returns latest confirmed store checkpoint plus current operator pending export;
- cloud clients hydrate/poll shared recovery health and fail closed if it cannot be verified;
- business-write database guard enforces exact `>= 24h` blocking after manual global mode initialization;
- D-030 automated guard takes precedence whenever enabled;
- local/no-cloud D-024 behavior remains unchanged.

Production migration: `20260825191150_global_manual_recovery_checkpoint`.

Transactional database proof: non-allow-listed denial; confirmation-without-export denial; approved export+confirmation health; fresh business write allowed; exact-24h business write blocked with SQLSTATE `55000`; all synthetic event/business rows rolled back to zero.

Final exact-tree PR #80 D-019:

- head `410bafe792233731561ec2d3aa1d2b38f573fea1`;
- merge ref `cc0b740de4c419a73cfc0c1af6f8ab26729be3b2`;
- validated tree `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e`;
- run/job `32891655554` / `97944738069`;
- 0 lint errors / 82 warnings;
- 59 files / 251 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS.

PR #80 squash-integrated as `dbcc2a25394aa09f63d9232e771c9e9278db1fd0`; integrated tree equals validated tree exactly.

#### D-032 rollout — CURRENT OPERATOR-LOCAL STEP

1. manually publish the current accepted `develop` to Vercel;
2. verify the deployment source is the current D-032-containing `develop` revision;
3. approved operator opens the updated candidate;
4. perform a **fresh real** `Exportar Backup v2`;
5. verify the JSON is actually stored outside the Easy;
6. click `Confirmar que guardei a cópia`;
7. optionally verify another approved device/session sees the same current checkpoint;
8. continue normal I3-D observation.

The prior per-browser checkpoint is historical evidence only and must not be fabricated into a global event.

Do not include in I3-D unless separately authorized:

- resuming I2-I2 trusted-PC/seven-day proof;
- importing stable-v1 real-store data;
- modifying/publishing `main`;
- switching the final canonical URL;
- declaring definitive cutover or D-030 acceptance.

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT AUTHORIZED`

A later explicit gate must settle durability, canonical URL/publication, rollback and any stable-system decommission policy.

## Current NEXT_ACTION

**Perform only the D-032 operator-local rollout: manually publish current accepted `develop` to Vercel, verify the D-032 revision is serving, then create/store/explicitly confirm one fresh real Backup v2 so the store-global 24-hour checkpoint becomes operational. After that return to ordinary P10-S3-I2-I3-D observation.** See `STATUS.md` for the exact bounded instruction.