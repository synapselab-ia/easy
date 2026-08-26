# Easy V2 — Canonical Status

**Updated:** 2026-08-26  
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
  - change #2 store-global manual recovery checkpoint: `DONE / ACCEPTED / INTEGRATED / OPERATIONALLY INITIALIZED` — D-032 / PR #80;
  - **change #3 optional subcategories: `DONE / ACCEPTED / INTEGRATED` — D-033 / PR #82.**
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Governing decisions

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 defines the temporary store-global manual JSON checkpoint. D-033 extends catalog classification without changing the recovery/deployment boundary.

Current invariants:

1. Supabase/Postgres is canonical business persistence.
2. Supabase Auth + RLS + active `easy_operators` authorization remain mandatory.
3. Hosted-cloud recovery health is store-global; the latest confirmed real Backup v2 must remain strictly younger than 24 hours for normal writes.
4. The database enforces the recovery boundary and the browser fails closed when cloud recovery health cannot be verified.
5. D-030 remains ON HOLD/not accepted and definitive cutover is not authorized.
6. `main` remains untouched; Vercel publication remains manual while the candidate is in controlled early use.
7. Catalog classification is `category -> optional subcategory -> item`, with exactly one optional subcategory level rather than a recursive tree.
8. Transaction history stores immutable transaction-time category/subcategory snapshots; later catalog edits do not rewrite history.
9. Legacy records never receive invented classification.
10. Backup v2 schema 6 contains subcategories and their item/order references; supported older schema 4/5 backups normalize to schema 6 without inventing subcategories.

## D-032 rollout state

The accepted D-032-containing candidate was manually published to Vercel and a fresh real Backup v2 was exported, stored outside Easy and explicitly confirmed. The store-global exact-24h cloud recovery mode is operational.

This does not satisfy D-030 unattended off-site automation/retention/restore-drill acceptance.

## D-033 closure — optional subcategories

The operator explicitly requested one optional subcategory level inside categories, e.g. separating `Placas` from other product groups inside `Porcelana`.

Implemented and integrated through PR #82:

- `public.subcategories` with stable identity, parent category, lifecycle and RLS;
- optional `items.subcategory_id`, constrained to the item's selected category;
- protected active-reference/archive/delete behavior for category/subcategory/item relationships;
- expandable subcategory management in the category UI;
- category + filtered optional subcategory selection in the item form;
- transaction-time `subcategory_id` + `subcategory_name` snapshots for orders;
- D-026 correction rules extended to preserve/capture subcategory snapshots;
- Dexie schema 6 and cloud-cache parity;
- Backup v2 schema 6 with subcategories while schema 4/5 remain importable without invented classification.

Production migration `20260826135708_i3d_subcategories` is applied and additive/retrocompatible.

Live synthetic Supabase proof passed under transaction rollback: valid snapshot capture passed; invalid category/subcategory pairing was rejected; archiving a subcategory referenced by an active item was rejected; synthetic residue returned to zero.

Repository validation/integration evidence:

- validated implementation head: `b8a6c947bad5d2ba7432f2ffa13b3df32cf44dcd`;
- validated merge ref: `75fb65b3179549af0cb29618f282d9edc70e663a`;
- validated tree: `5127a5a558b990f587b6427a605c5207e6573b9e`;
- D-019 run/job: `32983745854` / `98226501149`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 61 files / 258 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- final PR #82 merge ref before integration: `e9dc4cca9d6d1b843904d065ce7f9cf6289cdffd`;
- that merge ref had the exact same validated tree `5127a5a558b990f587b6427a605c5207e6573b9e`;
- PR #82 squash-integrated `develop`: `5a487b93d5c632f5990b8a261e4a62a6a196f186`;
- integrated `develop` tree: `5127a5a558b990f587b6427a605c5207e6573b9e` — exact tree equivalence PASS.

The canonical closure itself is documentation-only and does not alter executable/runtime files. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9` and was not modified.

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

## NEXT_ACTION

**D-033 is closed. Continue P10-S3-I2-I3-D controlled early-use observation. Do not automatically deploy, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data or claim definitive cutover. The next already-requested product topic is a downloadable financial PDF/report in addition to the on-site dashboards, but it must begin as its own bounded change only when the operator asks to proceed.**