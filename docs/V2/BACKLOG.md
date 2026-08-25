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

Definitive zero-cost cutover still requires objective durability beyond Supabase Free alone: unattended trusted-PC logical dumps, verified off-site copies, at least seven retained successful daily generations, exact-24h server freshness enforcement and restore drills.

### P10-S3-I2-I1 — Legacy private staging/import compatibility

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

Dormant under the current clean-start path.

### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof

**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`

Still missing for D-030 acceptance:

- actual unattended trusted-PC execution;
- actual off-site verification;
- seven real retained UTC daily generations;
- actual disposable restore drill.

D-031 explicitly places this proof on hold. It has not passed.

### P10-S3-I2-I3-A/B — Runtime-first implementation and integration

**Status:** `DONE / ACCEPTED / INTEGRATED`

PR #72 established the cloud adapter, Auth/approved-operator gate, RLS referential writes, controlled financial RPCs, Dexie read-cache mirroring, cloud JSON export and checkpointed atomic restore.

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding

**Status:** `DONE / ACCEPTED`

Accepted evidence includes manual candidate publication, browser-safe Supabase configuration, approved real operator onboarding, non-approved-user UI/RLS denial, clean canonical dataset load and the first operator-confirmed manual JSON recovery copy.

The original I3-C recovery confirmation was installation-local. D-032 refines only the hosted cloud recovery-state topology for subsequent early use.

### P10-S3-I2-I3-D — Controlled clean-start early-use observation

**Status:** `CURRENT`

Operating boundary:

1. use the accepted candidate for real clean-start workflows;
2. keep the accepted manual JSON recovery checkpoint inside the exact 24-hour boundary before normal writes;
3. implement changes only from observed early-use evidence or explicit operator instruction;
4. keep Supabase/Postgres canonical and preserve Auth/RLS/allow-list + controlled financial RPC semantics;
5. keep Vercel publication manual while this is candidate/early-use mode.

#### Early-use change #1 — reseller PDF grouped by product

**Status:** `DONE / INTEGRATED — PR #79`

Final exact-tree D-019:

- head `3d3cab2490f504d0464d722d08079dfb9fcdcb8c`;
- merge ref `f74af101e2335e7ca3dd4c52d51e46c3118de791`;
- run/job `32885324610` / `97924299040`;
- 0 lint errors / 82 warnings;
- 57 files / 242 Vitest PASS;
- 17/17 Playwright PASS;
- build PASS.

Integrated `develop`: `3c0fe29c62dd72d6acdcd3fc217ba392d4f2aa04`.

#### Early-use change #2 — store-global manual recovery checkpoint

**Status:** `DONE / ACCEPTED TARGET STATE — D-032 / PR #80 FINAL INTEGRATION GATE`

Explicit operator instruction: one properly generated/stored/confirmed manual Backup v2 must refresh the temporary 24-hour recovery boundary for all approved devices, rather than each browser maintaining an independent clock.

Implemented:

- append-only `public.manual_recovery_events` in Supabase;
- approved-operator-only SELECT/INSERT under RLS; no browser UPDATE/DELETE;
- server-assigned actor/timestamps;
- confirmation requires the same operator to have a pending unconfirmed export;
- global health RPC returns latest confirmed store checkpoint plus current operator pending export;
- cloud clients hydrate/poll shared recovery health;
- client fails closed if cloud health cannot be verified;
- business-write database guard enforces exact `>= 24h` blocking after manual global mode initialization;
- D-030 automated guard still takes precedence whenever enabled;
- local/no-cloud D-024 behavior remains unchanged.

Live synthetic database proof was performed transactionally and rolled back:

- non-allow-listed authenticated identity denied;
- confirmation without export denied;
- approved export + confirmation produced shared health;
- fresh checkpoint allowed a business write;
- exact 24-hour checkpoint blocked a business write with SQLSTATE `55000`;
- final manual-event/business counts returned to zero.

Production migration applied: `20260825191150_global_manual_recovery_checkpoint`.

Implementation-tree D-019 run/job `32889131712` / `97936610378` passed: 0 lint errors / 82 warnings; 59 files / 251 Vitest PASS; 17/17 Playwright PASS; production build PASS.

PR #80 requires one final exact-tree D-019 after canonical-document changes before integration. No repository commit may occur after that final successful validation.

#### D-032 rollout after integration

1. manually publish accepted `develop` to Vercel;
2. approved operator opens updated candidate;
3. perform a **fresh real** `Exportar Backup v2`;
4. verify the JSON is actually stored outside the Easy;
5. click `Confirmar que guardei a cópia`;
6. verify shared recovery health becomes current on another approved device/session if desired;
7. continue normal I3-D observation.

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

**Complete the D-032 rollout only: final exact-tree D-019 + PR #80 integration, manual Vercel publication of accepted `develop`, then one fresh real approved-operator export/store/confirmation to initialize the store-global 24-hour checkpoint. After that return to ordinary P10-S3-I2-I3-D observation.** See `STATUS.md` for the exact bounded instruction.