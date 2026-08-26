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
**Status:** ACCEPTED  
Original financial rows are preserved; reversal requires reason/timestamp and reversed rows have zero financial effect.

## D-013 — Replacement correction is atomic and linked
**Status:** ACCEPTED  
Correction creates a linked replacement and reverses the original atomically. Cloud persistence must preserve one transactional server/database boundary.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
`occurredAt` is business time, `createdAt` registration time and `reversal.reversedAt` is audit time.

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

Objective failure blocks integration. Supabase-bearing changes additionally require relevant database/policy/advisor evidence.

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
**Status:** ACCEPTED / IMPLEMENTED / EXTENDED BY D-033  
Original remains immutable; replacement may change reseller/type/date/observation and valid target fields while preserving/capturing classification snapshots.

## D-027 — P10 is fail-closed
**Status:** ACCEPTED.

## D-028 — Copied-live-data IndexedDB beta contract
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED AS FINAL ROUTE BY D-029.

## D-029 — Final V2 target is Supabase/Postgres canonical persistence + Vercel; manual backup remains independent defense
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

## D-030 — US$ 0 durability uses private migration staging + objectively proven unattended off-site logical backups
**Status:** ACCEPTED / EXECUTION PARTIALLY IMPLEMENTED; OPERATOR-LOCAL RECOVERY PROOF PENDING  
**Date:** 2026-08-20

Accepted durability contract:

- Supabase Free alone is not final backup evidence;
- unattended trusted-PC logical dumps to verified off-site storage;
- at least seven retained successful daily generations;
- exact-24h server-visible freshness/retention write guard;
- successful restore drills;
- private stable-v1 staging/explicit classification/atomic promotion/exact reconciliation for any later legacy migration.

I2-I2 recovery tooling/server guard is implemented and synthetically proven, but actual trusted-PC/off-site/seven-day/restore evidence has not passed.

## D-031 — Operator-authorized runtime-first controlled early use before D-030 operator-local recovery proof
**Status:** ACCEPTED / REFINED FOR HOSTED MANUAL RECOVERY STATE BY D-032  
**Date:** 2026-08-21

Accepted sequencing exception:

1. P10-S3-I2-I2 is `ON_HOLD`, not current; D-030 is not passed.
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
**Execution record:** `docs/V2/P10_S3_I2_I3_D_GLOBAL_RECOVERY_CHECKPOINT.md`

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

The updated Vercel candidate has since been manually published and a fresh real global Backup v2 was exported/stored/confirmed, so D-032 is operationally initialized.

## D-033 — Catalog classification supports one optional subcategory level with immutable transaction snapshots
**Status:** ACCEPTED / IMPLEMENTATION IN PR #82  
**Date:** 2026-08-26

### Trigger

During controlled early use, the operator explicitly requested the ability to divide products inside an existing category, e.g. separate `Placas` from other product groups inside `Porcelana`, without turning the catalog into an arbitrarily deep hierarchy.

### Accepted contract

1. **Exactly two classification levels.** The catalog model is `category -> optional subcategory -> item`. Recursive subcategories/sub-subcategories are out of scope.
2. **Stable parent identity.** A subcategory belongs to exactly one category and has its own stable identity and reversible active/inactive lifecycle.
3. **Optional item assignment.** An item always follows the existing category rules and may additionally reference one subcategory. The subcategory is optional.
4. **Parent consistency.** If an item has a subcategory, that subcategory must belong to the item's selected category. Cross-category combinations fail closed at the database boundary.
5. **Active-reference integrity.** Active items cannot use inactive category/subcategory classification. A subcategory used by an active item cannot be archived until the active references are resolved. Category archive protection includes active subcategories.
6. **Non-inventive legacy behavior.** Migrated/legacy records that had no category/subcategory remain unclassified rather than receiving guessed values. A grandfathered active legacy item may be edited while preserving its unclassified state, but new orders still require valid active classification and reactivation remains strict.
7. **Transaction-time snapshots.** New orders store `categoryId/categoryName` and, when applicable, `subcategoryId/subcategoryName` as immutable historical facts.
8. **Catalog edits do not rewrite history.** Renaming, reassigning or archiving current catalog classification does not mutate prior transaction snapshots.
9. **D-026 correction semantics.** When an order correction keeps the same item, the historical category/subcategory snapshot is preserved. When a correction changes to another item, the replacement captures that target item's current valid classification.
10. **Backup contract.** Backup v2 advances to schema 6 and includes `subcategories`, item `subcategoryId` and transaction subcategory snapshots. Supported schema 4/5 backups normalize to schema 6 without inventing subcategory data.
11. **Cloud/local parity.** Supabase/Postgres is canonical in hosted mode; Dexie schema 6 mirrors the same logical shape for cache/local compatibility.
12. **Security/deployment unchanged.** D-033 does not weaken RLS/approved-operator authorization, the D-032 recovery guard, manual Vercel deployment governance, D-030 status or the untouched `main` boundary.

### Acceptance evidence so far

Production migration `20260826135708_i3d_subcategories` is applied and additive/retrocompatible. A live synthetic transaction proof under an approved authenticated context verified valid snapshot capture, invalid parent/subcategory rejection and active-reference archive protection; the transaction was rolled back and all synthetic rows returned to zero.

Implementation-tree D-019 before canonical-document freeze passed on PR #82 run/job `32983745854` / `98226501149`: ESLint 0 errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. Final exact-tree D-019 after canonical documentation remains mandatory before integration.

---

# Open decisions

- when/how D-030 unattended off-site recovery proof will be resumed after early-use learning;
- whether a later paid durability mechanism replaces the zero-cost D-030 path;
- whether legacy stable data is ever worth importing after clean-start early use;
- final `main`/stable publication, canonical URL, rollback and decommission policy.