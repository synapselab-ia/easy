# Easy V2 — Decision Ledger

**Updated:** 2026-08-26

Only accepted decisions belong here. Newer decisions may refine/supersede older sequencing while preserving historical evidence.

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, isolated work branches derive from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED.

## D-005 — No full rewrite by default
**Status:** ACCEPTED.

## D-006 — Dexie/IndexedDB baseline
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED BY D-016 THEN D-029 FOR FINAL PRODUCTION.

## D-007 — Preserve financial history over destructive deletion
**Status:** ACCEPTED DIRECTION.

## D-008 — Centralize financial domain rules
**Status:** ACCEPTED DIRECTION.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED.

## D-013 — Replacement correction is atomic and linked
**Status:** ACCEPTED.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED.

## D-015 — Statements and FIFO debt aging
**Status:** ACCEPTED.

## D-016 — Local-first/single-user until an explicit cloud trigger
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED FOR FINAL PRODUCTION BY D-029.

## D-017 — Logical Easy backup is the canonical interchange/portable recovery contract
**Status:** ACCEPTED / RETAINED BY D-029, D-031, D-032 AND D-033.

## D-018 — Restore requires validation, checkpoint and verified atomic replacement
**Status:** ACCEPTED.

## D-019 — Critical QA is mandatory
**Status:** ACCEPTED

```text
npm run qa:critical
= lint + Vitest + Playwright + production build
```

Objective failure blocks executable integration. Supabase-bearing changes additionally require relevant database/policy/advisor evidence.

## D-020 — P7 prioritizes operator-intent/error risks
**Status:** ACCEPTED.

## D-021 — Repository evidence alone does not reopen D-016
**Status:** ACCEPTED HISTORICALLY.

## D-022 — Direct store validation originally kept D-016 and confirmed recovery/category/correction needs
**Status:** ACCEPTED HISTORICALLY.

## D-023 — P9 evidence-backed ordering
**Status:** ACCEPTED.

## D-024 — Synchronized recovery-copy folder + exact 24-hour freshness guard
**Status:** ACCEPTED / IMPLEMENTED / TRANSITIONAL  
D-032 refines hosted-cloud manual-checkpoint state; D-024 local/no-cloud behavior remains retained.

## D-025 — Category classification uses stable identity + transaction-time snapshots; legacy history is not invented
**Status:** ACCEPTED / IMPLEMENTED / EXTENDED BY D-033.

## D-026 — Effective transaction business fields are correctable through audited linked replacement
**Status:** ACCEPTED / IMPLEMENTED / EXTENDED BY D-033.

## D-027 — P10 is fail-closed
**Status:** ACCEPTED.

## D-028 — Copied-live-data IndexedDB beta contract
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED AS FINAL ROUTE BY D-029.

## D-029 — Final V2 target is Supabase/Postgres canonical persistence + Vercel
**Status:** ACCEPTED / REFINED BY D-030, D-031 AND D-032  
**Date:** 2026-08-20

Core rules:

- Supabase/Postgres canonical production datastore;
- Vercel target frontend host;
- Supabase Auth + RLS mandatory;
- approved operator authorization, not generic authenticated access;
- browser uses only URL + publishable key;
- no first-pass offline multi-master writes;
- Dexie transitional/cache only;
- financial correction/reversal remains server/database atomic;
- manual logical Easy backup remains independent portability/recovery;
- no definitive cutover implied by architecture implementation alone.

## D-030 — US$0 durability uses objectively proven unattended off-site logical backups
**Status:** ACCEPTED / EXECUTION PARTIALLY IMPLEMENTED; OPERATOR-LOCAL RECOVERY PROOF PENDING  
**Date:** 2026-08-20

Accepted definitive durability contract:

- Supabase Free alone is not final backup evidence;
- unattended trusted-PC logical dumps to verified off-site storage;
- at least seven retained successful daily generations;
- exact-24h server-visible freshness/retention write guard;
- successful restore drills;
- private stable-v1 staging/explicit classification/atomic promotion/exact reconciliation for any later legacy migration.

I2-I2 tooling/server guard is implemented and synthetically proven, but actual operator-local/off-site/seven-day/restore evidence has not passed.

## D-031 — Runtime-first controlled early use before D-030 operator-local recovery proof
**Status:** ACCEPTED / REFINED FOR HOSTED MANUAL RECOVERY BY D-032  
**Date:** 2026-08-21

Accepted sequencing exception:

1. P10-S3-I2-I2 is `ON_HOLD`; D-030 is not passed.
2. Runtime-first Supabase-backed controlled early use is authorized.
3. Supabase Auth + RLS + `easy_operators` remain mandatory.
4. During early use, logical JSON backup is the active operator recovery mechanism and writes remain fail-closed at the accepted exact 24-hour boundary.
5. Cloud JSON restore remains checkpointed, approved-operator-only, database/server atomic and post-restore verified.
6. Clean-start early use is accepted; legacy real-store migration is not required or automatically authorized.
7. `main` remains untouched; Vercel deployment stays manual/candidate; no canonical URL/definitive cutover is implied.
8. Definitive cutover still requires a later explicit gate and D-030 completion or an explicitly accepted replacement durability mechanism.

## D-032 — Hosted manual recovery checkpoint is store-global and server-enforced
**Status:** ACCEPTED / IMPLEMENTED / OPERATIONALLY INITIALIZED  
**Date:** 2026-08-25

Accepted contract:

1. In hosted Supabase mode, manual recovery freshness is store-global; local/no-cloud mode remains local.
2. Browser `localStorage` is not authoritative for cloud recovery health.
3. Approved operator exports Backup v2, stores it outside Easy, then explicitly confirms.
4. Export and confirmation are append-only database events with server identity/time.
5. Only active approved operators can read/establish recovery state.
6. Latest confirmed export becomes the shared checkpoint for all approved devices.
7. Checkpoint is fresh only while age is strictly `< 24h`; at `>= 24h` normal writes fail closed at the database boundary.
8. A cloud client that cannot verify global recovery state also fails closed.
9. Historical browser-local confirmations are not fabricated into cloud events.
10. D-032 does not satisfy D-030 off-site automation/retention/restore-drill requirements and does not authorize definitive cutover.

The updated Vercel candidate has been manually published and a fresh real global Backup v2 was exported/stored/confirmed, so D-032 is operationally initialized.

## D-033 — One optional subcategory level with immutable transaction snapshots
**Status:** ACCEPTED / IMPLEMENTED / INTEGRATED  
**Date:** 2026-08-26

### Trigger

During controlled early use, the operator requested the ability to divide products inside an existing category, e.g. separate `Placas` from other product groups inside `Porcelana`, without creating an arbitrarily deep hierarchy.

### Accepted contract

1. **Exactly two classification levels.** `category -> optional subcategory -> item`; recursive subcategories are out of scope.
2. **Stable parent identity.** A subcategory belongs to exactly one category and has its own stable identity/lifecycle.
3. **Optional item assignment.** An item may reference one subcategory; that subcategory is optional.
4. **Parent consistency.** A referenced subcategory must belong to the item's selected category; cross-category combinations fail closed.
5. **Active-reference integrity.** Active items cannot use inactive classification; referenced subcategories/categories are protected from invalid archival.
6. **Non-inventive legacy behavior.** Legacy records without classification remain unclassified rather than receiving guessed values.
7. **Transaction-time snapshots.** New orders store category id/name and optional subcategory id/name as immutable historical facts.
8. **Catalog edits do not rewrite history.** Renaming/reassigning current classification does not mutate prior transaction snapshots.
9. **D-026 correction semantics.** Same-item correction preserves the historical classification snapshot; changing item captures the target item's current valid classification.
10. **Backup contract.** Backup v2 schema 6 includes subcategories, item `subcategoryId` and transaction subcategory snapshots. Supported schema 4/5 backups normalize without inventing subcategory data.
11. **Cloud/local parity.** Supabase/Postgres is canonical in hosted mode; Dexie schema 6 mirrors the same logical shape for cache/local compatibility.
12. **Security/deployment unchanged.** D-033 does not weaken RLS/approved-operator authorization, D-032 recovery enforcement, manual Vercel governance, D-030 status or the untouched `main` boundary.

### Acceptance evidence

Production migration `20260826135708_i3d_subcategories` is applied and additive/retrocompatible. A live synthetic transaction proof verified valid snapshot capture, invalid parent/subcategory rejection and active-reference archive protection; the proof rolled back with zero synthetic residue.

D-019 passed on PR #82 run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. The validated merge-ref tree was `5127a5a558b990f587b6427a605c5207e6573b9e`.

Before integration, PR #82 merge ref `e9dc4cca9d6d1b843904d065ce7f9cf6289cdffd` had that exact same tree. PR #82 was squash-integrated into `develop` as `5a487b93d5c632f5990b8a261e4a62a6a196f186`, also with tree `5127a5a558b990f587b6427a605c5207e6573b9e`. Exact tree equivalence: PASS.

The post-integration canonical closure is documentation-only and introduces no executable/runtime delta.

---

# Open decisions

- when/how D-030 unattended off-site recovery proof will be resumed after early-use learning;
- whether a later paid durability mechanism replaces the zero-cost D-030 path;
- whether legacy stable data is ever worth importing after clean-start early use;
- final `main`/stable publication, canonical URL, rollback and decommission policy.