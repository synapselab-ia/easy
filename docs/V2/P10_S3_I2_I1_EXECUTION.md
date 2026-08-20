# P10-S3-I2-I1 — Stable-v1 private staging/import compatibility

**Date:** 2026-08-20  
**Status:** IMPLEMENTED / SYNTHETIC PROOF COMPLETE / D-019 PENDING FINAL CLOSURE  
**Decision basis:** D-029 + D-030  
**Project:** dedicated Supabase homologation project `easy-v2` (`sa-east-1`)  
**Real data:** none

## 1. Scope actually executed

This slice implemented only the synthetic stable-v1 compatibility path required by D-030. It did **not** implement unattended backup automation, a real Supabase Auth operator, the Supabase-backed business runtime, a real store export/import, `main` publication, canonical URL switch or production cutover.

The implementation has two layers:

1. `src/services/supabaseLegacyImport.ts` reuses `preflightBackupPayload` as the canonical v1 validation/normalization authority, tightens the input to the exact historical stable-main v1 surface and emits a deterministic staging payload with money represented as exact integer cents.
2. Private Postgres staging/import objects accept only that normalized shape, retain legacy active-unclassified items only inside `private`, require explicit current classification, promote atomically into the canonical public schema, repair identity sequences from PostgreSQL metadata and run exact reconciliation before accepting the promotion.

## 2. Reproducible migrations

Applied to the empty `easy-v2` homologation project and committed under `supabase/migrations/`:

- `20260820181848_p10_s3_i2_i1_legacy_staging_import`
- `20260820182305_p10_s3_i2_i1_explicit_private_deny_policies`
- `20260820182344_p10_s3_i2_i1_index_staging_references`

The first migration was compiled first inside an explicit `BEGIN ... ROLLBACK` rehearsal before being applied.

### Private staging objects

- `private.legacy_v1_import_batches`
- `private.legacy_v1_items`
- `private.legacy_v1_resellers`
- `private.legacy_v1_transactions`
- `private.legacy_v1_item_classifications`

All five tables have RLS enabled, explicit deny policies for `anon`, `authenticated` and `service_role`, and no table DML grants to those roles.

### Private control functions

- `private.stage_legacy_v1_normalized(jsonb)`
- `private.set_legacy_v1_classifications(bigint, jsonb)`
- `private.promote_legacy_v1_import(bigint)`
- `private.reconcile_legacy_v1_import(bigint)`
- `private.discard_legacy_v1_import(bigint)`
- metadata helpers for exact JSON keys and identity-sequence repair/checks.

All functions are `SECURITY INVOKER`, use an empty `search_path` and explicitly revoke `EXECUTE` from `PUBLIC`, `anon`, `authenticated` and `service_role`. `authenticated` still has schema `private` USAGE only because the already accepted P10-S3-I1 financial implementation boundary requires it; the new staging tables/functions remain inaccessible to browser/API roles.

## 3. Stable-v1 normalization boundary

The TypeScript adapter does not redefine the accepted migration semantics. It calls the existing `preflightBackupPayload` first, then enforces properties specific to the known stable-main v1 source:

- only backup `version: 1`;
- exact historical top-level/data/entity field surface; unexplained V2/lifecycle/category/audit fields are rejected;
- stable IDs must remain exact safe positive integers;
- missing item/reseller lifecycle remains normalized to active;
- no item category exists before current classification;
- no transaction category snapshot, reversal or correction is fabricated;
- v1 `occurredAt` remains exactly `createdAt`;
- order quantity must be an integer;
- all imported money is converted to exact integer cents, rejecting values whose cent representation would change;
- an order's stored total must equal `quantity × unitPrice` exactly in cents.

Generated Supabase TypeScript types were rechecked after the migrations. The exposed `public` API shape is unchanged because all new staging objects are private/non-exposed, so `src/lib/database.types.ts` requires no semantic change.

## 4. Synthetic database proof

Only generic synthetic identities/names were used.

### 4.1 Invalid staging is atomic

A synthetic normalized payload whose transaction referenced a nonexistent reseller was passed to the private staging function. PostgreSQL rejected the composite FK. After the expected failure:

- staging batches: 0;
- staged items/resellers/transactions: 0;
- public categories/items/resellers/transactions: 0.

This proves that a staging validation/reference failure does not leave a partial batch.

### 4.2 Classification is mandatory and atomic

A valid synthetic batch was staged with:

- item stable IDs: `10`, `25`;
- reseller stable IDs: `7`, `42`;
- transaction stable IDs: `100`, `250`, `900`;
- one order, one payment and one signal.

Promotion before classification failed closed and left all four public business tables empty.

An intentionally incomplete classification mapping was then attempted. It failed and rolled back the classification write itself: classification row count remained 0 and the batch remained unclassified.

A complete explicit current classification map for both items was accepted afterwards.

### 4.3 Promotion transaction rollback

After full classification, a successful call to the promotion function was intentionally followed by an outer synthetic exception inside a PostgreSQL exception subtransaction. The entire promotion was rolled back:

- `promoted_at` remained null;
- public categories/items/resellers/transactions all returned to 0 rows.

This proves that the promotion participates in a single database transaction and does not leave a partial public state when its transaction aborts.

### 4.4 Successful promotion and exact reconciliation

The same fully classified batch was then promoted normally. The function returned `passed=true` and `promoted=true`.

Exact structural/reference results:

- items: 2;
- resellers: 2;
- transactions: 3;
- orders/payments/signals: 1 / 1 / 1;
- current categories: 2;
- exact item ID set: `10`, `25`;
- exact reseller ID set: `7`, `42`;
- exact transaction ID set: `100`, `250`, `900`;
- all two active items had an explicit active current category;
- the one legacy order still had `category_id = null` and `category_name = null` in history;
- all three transaction occurrences remained exactly equal to their original v1 `createdAt`;
- no reversal/correction audit metadata was fabricated;
- no orphan reseller/item reference existed.

Exact financial reconciliation, represented in integer cents:

- gross orders: `2500`;
- payments: `525`;
- signals: `750`;
- net movement: `1225`;
- aggregate positive reseller debt: `1975`;
- every per-reseller closing balance matched exactly between staging and public target.

### 4.5 Identity repair is metadata-driven

The implementation calls `pg_get_serial_sequence` rather than assuming sequence names. After explicit stable IDs were inserted, all four public identity sequences were objectively verified to point to a next generated value greater than the current maximum ID:

- categories: PASS;
- items: PASS;
- resellers: PASS;
- transactions: PASS.

The discovered sequence identities were used only as proof; no sequence name is hard-coded into the importer.

## 5. Access-control proof

Objective privilege checks after migration showed:

- `authenticated` has no staging-table DML privilege;
- `anon` has no staging-table DML privilege;
- `service_role` has no staging-table DML privilege;
- `authenticated` cannot execute the staging entry point;
- `anon` cannot execute the promotion entry point;
- `service_role` cannot execute the reconciliation entry point.

The staging/import path therefore requires trusted database/admin execution and is not a browser/Data API mutation surface.

## 6. Advisors

Final Supabase Security Advisor after explicit deny policies: **0 lints**.

Performance Advisor after adding covering indexes for the two staging transaction composite FKs:

- no `unindexed_foreign_keys` finding remains for the new staging schema;
- remaining findings are INFO-only `unused_index` notices on the tiny/empty synthetic environment, including the expected new FK indexes and the previously known public indexes.

The new FK indexes are retained because they cover referential checks/deletes on future migration-sized staging batches; an unused-index observation on an empty synthetic dataset is not evidence that the indexes are unnecessary.

## 7. Synthetic disposal

After all proofs:

1. the staged batch was discarded through `private.discard_legacy_v1_import`;
2. public synthetic business rows were truncated with identity restart;
3. the private batch identity was restarted;
4. final counts were rechecked.

Final state:

- `auth.users`: 0;
- `public.easy_operators`: 0;
- public categories/items/resellers/transactions: 0 / 0 / 0 / 0;
- private staging batches/items/resellers/transactions/classifications: 0 / 0 / 0 / 0 / 0.

No real store data or real operator identity was created or moved.

## 8. Repository QA

Repository D-019 (`npm run qa:critical`) remains mandatory on the exact final PR tree before integration. The final run/job IDs, exact merge ref and objective lint/Vitest/Playwright/build results belong in PR closure evidence and `QA_LEDGER.md` once available.

## 9. Boundary after this slice

If repository D-019 passes and this slice is integrated, P10-S3-I2-I1 is complete. The next permitted slice is P10-S3-I2-I2 only: prove the zero-cost unattended backup/recovery path with synthetic data and without introducing real store data, a real Auth operator or a runtime/cutover change.
