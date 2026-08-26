# Easy V2 — Canonical Backlog

**Updated:** 2026-08-26

This backlog records current ordered work. Historical implementation detail remains in phase execution documents and Git/PR history.

## P0–P9 — Accepted historical baseline

P0 through P9 are accepted/integrated. Major accepted outcomes include branch/governance, D-019, reversible lifecycle, audited financial corrections, occurrence-date semantics, statements/debt aging, backup/restore hardening, recovery safeguards, category identity/snapshots/reporting and full-field linked correction.

## P10 — Controlled migration / cloud transition

**Status:** `IN_PROGRESS`

### P10-S1 — Stable-v1 compatibility/rehearsal
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

### P10-S2 — Final persistence decision
**Status:** `DONE / ACCEPTED` — D-029

### P10-S3-I1 — Supabase foundation
**Status:** `DONE / ACCEPTED`

### P10-S3-I2 — Migration and durability contract
**Status:** `DONE / ACCEPTED CONTRACT` — D-030

### P10-S3-I2-I1 — Legacy private staging/import compatibility
**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`

### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof
**Status:** `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`

D-030 still lacks actual unattended trusted-PC execution, real off-site verification, retained daily generations and restore-drill acceptance. D-031 keeps this on hold.

### P10-S3-I2-I3-A/B — Runtime-first implementation and integration
**Status:** `DONE / ACCEPTED / INTEGRATED`

### P10-S3-I2-I3-C — Manual Vercel candidate + operator onboarding
**Status:** `DONE / ACCEPTED`

### P10-S3-I2-I3-D — Controlled clean-start early-use observation
**Status:** `CURRENT`

Operating boundary:

1. use the accepted candidate for real clean-start workflows;
2. keep the D-032 store-global manual Backup v2 checkpoint strictly fresher than 24 hours before normal writes;
3. implement changes only from observed early-use evidence or explicit operator instruction;
4. preserve Supabase/Auth/RLS/allow-list and controlled financial RPC semantics;
5. keep Vercel publication manual and `main` untouched.

#### Early-use change #1 — reseller PDF grouped by product
**Status:** `DONE / INTEGRATED — PR #79`

#### Early-use change #2 — store-global manual recovery checkpoint
**Status:** `DONE / ACCEPTED / INTEGRATED / OPERATIONALLY INITIALIZED — D-032 / PR #80`

The updated candidate was manually deployed and a fresh real Backup v2 was exported/stored/explicitly confirmed. The shared exact-24h checkpoint is active. D-030 remains separately ON HOLD/not accepted.

#### Early-use change #3 — one optional subcategory level
**Status:** `DONE / ACCEPTED / INTEGRATED — D-033 / PR #82`

Accepted result:

- classification is `category -> optional subcategory -> item`;
- no recursive subcategory tree;
- subcategory belongs to one category and has stable identity/lifecycle;
- item subcategory is optional but, when present, must belong to the item's selected category;
- active-reference and archive/delete integrity are enforced;
- legacy unclassified records remain non-inventive;
- orders snapshot category and optional subcategory id/name at transaction time;
- D-026 corrections preserve the historical snapshot when keeping the item and capture the target item's current classification when changing item;
- Backup v2 schema 6 contains subcategories and related snapshots;
- schema 4/5 backups remain accepted and normalize to schema 6 without inventing subcategories;
- Supabase migration `20260826135708_i3d_subcategories` is additive/retrocompatible and applied.

D-019 implementation evidence: run/job `32983745854` / `98226501149`; 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree `5127a5a558b990f587b6427a605c5207e6573b9e` exactly equals the final PR #82 merge-ref tree and squash-integrated `develop` tree at `5a487b93d5c632f5990b8a261e4a62a6a196f186`.

Live synthetic Supabase proof passed under rollback with zero residue for valid snapshot capture, invalid category/subcategory rejection and archive protection.

#### Next requested topic — financial PDF/report
**Status:** `REQUESTED / NOT_STARTED`

The operator requested downloadable financial PDF/reporting in addition to on-site dashboards. It is intentionally separate from D-033 and should begin only as its own bounded change when the operator asks to proceed.

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT AUTHORIZED`

## Current NEXT_ACTION

**Continue ordinary P10-S3-I2-I3-D observation. D-033 is closed. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2 or import legacy real-store data. The next queued operator-requested product topic is the financial PDF/report, to be started only as a separate bounded change when requested.** See `STATUS.md` for the authoritative instruction.