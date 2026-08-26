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
  - **change #3 optional subcategories: `IN_PROGRESS / IMPLEMENTATION VALIDATED — FINAL EXACT-TREE QA + INTEGRATION PENDING` — D-033 / PR #82.**
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
7. Catalog classification is now `category -> optional subcategory -> item`, with exactly one optional subcategory level rather than a recursive tree.
8. Transaction history stores immutable transaction-time category/subcategory snapshots; later catalog edits do not rewrite history.
9. Legacy records never receive invented classification.
10. Backup v2 schema 6 contains subcategories and their item/order references; supported older schema 4/5 backups normalize to schema 6 without inventing subcategories.

## D-032 rollout closure

The previously pending operator-local rollout is complete:

- the accepted `develop` candidate containing D-032 was manually published to Vercel;
- a fresh real Backup v2 was exported on the updated candidate;
- the operator explicitly confirmed that the file had been stored outside the Easy;
- production `manual_recovery_events` therefore has a real confirmed global checkpoint;
- the shared exact-24h cloud recovery mode is operational rather than merely implemented.

This does not satisfy D-030 off-site automation/retention/restore-drill requirements.

## D-033 — current change

The operator explicitly requested one subcategory level inside categories, for example separating different product groups within `Porcelana`.

PR #82 / branch `feat/i3d-subcategories` implements:

- `public.subcategories` with stable identity, parent category, lifecycle and RLS;
- optional `items.subcategory_id`, constrained to the item's selected category;
- category/subcategory active-reference integrity and protected archive/delete behavior;
- category + optional subcategory controls in item management;
- expandable subcategory management in the category UI;
- transaction-time `subcategory_id` + `subcategory_name` snapshots for orders;
- D-026 correction preservation/capture rules extended to subcategory snapshots;
- Dexie schema 6 and cloud-cache support;
- Backup v2 schema 6 with subcategory data, while schema 4/5 remain importable without invented classification.

Production migration `20260826135708_i3d_subcategories` is applied and additive/retrocompatible.

Implementation QA on current code before canonical-document freeze:

- PR merge ref `75fb65b3179549af0cb29618f282d9edc70e663a`;
- run/job `32983745854` / `98226501149`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 61 files / 258 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS.

Live Supabase synthetic transactional proof also passed and was rolled back: a valid category/subcategory/item generated the correct immutable order snapshot; an invalid category/subcategory pair was rejected; archiving a subcategory used by an active item was rejected; all synthetic category/subcategory/item/reseller/transaction residue returned to zero.

Supabase Security Advisor currently reports the known Free-plan leaked-password-protection warning plus warnings that the intentionally exposed authenticated transactional RPCs (`create_transaction`, `correct_transaction`, `restore_easy_backup`) are `SECURITY DEFINER`. Privilege proof confirms `anon` and `public` cannot execute those RPCs, `authenticated` can, and each RPC retains its internal active-operator authorization boundary. These are reviewed intentional API boundaries, not anonymous-access findings.

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

## Repository/deployment boundary

Accepted pre-feature `develop`: `1970d234514b39a47b7c877e607a37dae06da841`.  
Stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9` — unchanged.

PR #82 must not be integrated until the D-019 exact-tree run after these canonical-document changes passes. After feature integration, repository closure must update the canonical state to the actual integrated `develop` commit/tree before the stage is considered closed.

## NEXT_ACTION

**Close only P10-S3-I2-I3-D early-use change #3 / D-033: freeze PR #82 after canonical documentation, run the mandatory final exact-tree D-019, integrate into `develop` only if every objective gate passes, prove integrated-tree equivalence, and update canonical closure state. Do not deploy automatically, modify/publish `main`, resume D-030/I2-I2, import legacy real-store data, or begin the requested financial PDF/report implementation inside this change. After D-033 is closed, the next operator-requested product topic may be the financial PDF/report, but it requires its own bounded design/implementation step.**