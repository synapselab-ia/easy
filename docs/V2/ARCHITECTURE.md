# Easy V2 — Architecture

**Status:** canonical architecture reference  
**Updated:** 2026-08-26

## 1. Current accepted topology

D-029 defines the cloud target, D-031 authorizes controlled runtime-first early use, D-032 defines the store-global manual recovery state, and D-033 extends catalog classification by one optional level.

```text
Approved operator browser(s)
        |
        | Supabase Auth session
        v
RLS + public.easy_operators
        |
        v
Supabase Postgres  <-- canonical business data
        |
        +--> catalog: category -> optional subcategory -> item
        +--> controlled financial RPCs
        +--> approved-operator atomic JSON restore
        +--> append-only manual recovery events
        +--> exact-24h business-write recovery guard

Dexie / IndexedDB
  read cache / compatibility mirror only

Logical Easy JSON schema 6
  categories + subcategories + items + transactions
  portable/manual recovery artifact
  physically stored outside Easy by an operator

Vercel
  manual candidate host during early use
```

## 2. Browser/runtime boundary

When cloud configuration is present:

- `CloudAuthGate` requires a Supabase Auth session and active approved operator;
- canonical business data is fetched from Supabase and mirrored to Dexie for read/report/search paths;
- cloud/connectivity failures do not create an offline-authoritative write mode;
- category/subcategory/item/reseller writes use RLS-protected tables;
- financial create/reverse/correct operations use transactional PostgreSQL RPCs;
- recovery health is hydrated from Supabase and periodically refreshed;
- inability to verify required cloud recovery health fails closed for writes.

When cloud configuration is absent, historical local behavior remains available for development/reference. Hosted cloud state remains authoritative only in cloud mode.

## 3. Authorization and secrets

Mandatory controls:

- RLS on exposed business/recovery tables;
- active approved-operator allow-list in `public.easy_operators`;
- anonymous business/recovery access denied;
- browser receives only project URL + publishable key;
- no service-role/database/admin secret in browser/Git/public Vercel variables;
- financial/recovery SECURITY DEFINER RPCs are exposed only to `authenticated` and perform internal active-operator authorization.

The current advisor warns that authenticated users can execute the intentionally exposed SECURITY DEFINER transaction/restore RPCs. Explicit privilege proof confirms `anon`/`public` cannot execute them. Their operator assertion remains part of the accepted API boundary.

## 4. Catalog classification — D-033

The catalog is intentionally bounded to two levels:

```text
Category
  -> optional Subcategory
      -> Item
```

No recursive tree is accepted.

Canonical relations:

- `categories(id, name, is_active, ...)`;
- `subcategories(id, category_id, name, is_active, ...)`;
- `items(category_id, subcategory_id nullable, ...)`.

Database integrity requires a referenced subcategory to belong to the same category selected by the item. Active items may not use inactive classification. Archive/delete guards preserve current active-reference integrity.

Legacy items that predate classification are not assigned guessed category/subcategory values. A grandfathered active legacy item may retain that historical unclassified state during an ordinary edit, but new operational references stay strict.

## 5. Financial consistency and classification snapshots

Accepted V2 invariants remain:

- destructive history deletion is not the correction model;
- reversal preserves original rows and audit reason/time;
- correction creates a linked replacement atomically;
- business occurrence time is distinct from registration/audit time;
- statements/debt calculations preserve reversal-zero-effect semantics;
- item/category/subcategory transaction snapshots are historical facts.

For a new order, the server captures current valid item name, category id/name and optional subcategory id/name. A later catalog rename/reassignment does not rewrite the old transaction.

For D-026 correction:

- same order item -> preserve the original item/category/subcategory snapshot;
- changed order item -> capture that target item's current valid classification on the replacement.

## 6. Canonical cloud adapter

`src/services/cloudDataService.ts` remains the application-facing bridge for canonical business data. It fetches categories, subcategories, items, resellers and transactions, refreshes Dexie as a read cache, routes referential writes through RLS and financial writes through accepted RPCs.

## 7. Logical backup/restore

D-017/D-018 remain the portable recovery/interchange contract. D-033 advances the current Backup v2 target schema to **schema 6**.

Schema 6 contains:

- categories;
- subcategories;
- item category/subcategory references;
- resellers;
- transactions including immutable category/subcategory snapshots.

Supported older v2 schema 4/5 backups normalize in memory to schema 6 without inventing missing category/subcategory history.

Cloud restore remains validation/preflight -> download current checkpoint -> atomic server replacement -> canonical post-restore reconciliation.

## 8. D-032 global manual recovery

During D-031 controlled early use:

1. approved operator exports canonical Backup v2;
2. export event is registered server-side;
3. operator stores the JSON outside Easy;
4. operator explicitly confirms;
5. latest confirmed export becomes the store-global checkpoint;
6. all approved devices share that checkpoint;
7. normal business writes require age `< 24h` and fail at `>= 24h`.

The first real global checkpoint has been created and confirmed on the manually deployed D-032 candidate, so this mode is operationally initialized.

D-032 remains a temporary control and does not satisfy D-030 unattended off-site retention/restore-drill acceptance.

## 9. Migration boundary

The stable-v1 private staging/import pipeline remains dormant. Clean-start early use continues; no legacy real-store import is implicitly authorized.

## 10. Deployment boundary

- `develop` is candidate integration;
- `main` remains untouched;
- Git-triggered Vercel deployment is disabled;
- candidate publication is manual;
- canonical production URL/cutover remains separately gated.

## 11. D-033 implementation boundary

PR #82 adds the subcategory table/model, lifecycle UI, item assignment, transaction snapshots, schema-6 backup/restore and associated tests. Production migration `20260826135708_i3d_subcategories` is additive and already applied.

Implementation-tree D-019 passed on run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS.

A final D-019 on the frozen canonical-document tree is still mandatory before PR #82 integration.