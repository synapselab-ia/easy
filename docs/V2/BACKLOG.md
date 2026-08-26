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

The updated candidate was manually deployed and a fresh real Backup v2 was exported/stored/explicitly confirmed. The shared exact-24h checkpoint is active in production. D-030 remains separately ON HOLD/not accepted.

#### Early-use change #3 — one optional subcategory level
**Status:** `IN_PROGRESS / IMPLEMENTATION VALIDATED — FINAL EXACT-TREE QA + INTEGRATION PENDING — D-033 / PR #82`

Accepted scope:

- classification is `category -> optional subcategory -> item`;
- no recursive subcategory tree;
- subcategory belongs to one category and has stable identity/lifecycle;
- item subcategory is optional but, when present, must belong to the item's selected category;
- active-reference and archive/delete integrity are enforced in browser/local services and database boundaries;
- legacy unclassified records remain non-inventive;
- orders snapshot category and optional subcategory id/name at transaction time;
- D-026 corrections preserve the historical snapshot when keeping the item and capture the target item's current classification when changing item;
- Backup v2 schema 6 contains subcategories and related snapshots;
- schema 4/5 backups remain accepted and normalize to schema 6 without inventing subcategories;
- Supabase migration `20260826135708_i3d_subcategories` is additive/retrocompatible.

Implementation QA before canonical-document freeze passed in run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS.

Live synthetic Supabase proof passed under rollback with zero residue for valid snapshot capture, invalid category/subcategory rejection and archive protection.

#### Next requested topic — financial PDF/report
**Status:** `REQUESTED / NOT_STARTED / OUT OF D-033 SCOPE`

The operator asked for downloadable financial PDF/reporting in addition to on-site dashboards. It must be designed and implemented only after D-033 is fully closed; do not mix it into PR #82.

### P10-S3-I2-I4 — Legacy real-data migration
**Status:** `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`

### P10-S4 — Definitive cutover / durability closure
**Status:** `NOT_STARTED / NOT AUTHORIZED`

## Current NEXT_ACTION

**Close D-033 / PR #82 only: freeze the documented tree, run final exact-tree D-019, integrate into `develop` only on full PASS, verify tree equivalence, then update canonical closure state. No automatic Vercel deploy and no financial-report implementation inside this change.** See `STATUS.md` for the authoritative bounded instruction.