# Easy V2 — Architecture

**Status:** canonical architecture reference  
**Updated:** 2026-08-26

## 1. Current accepted topology

D-029 defines the cloud target, D-031 authorizes controlled runtime-first early use, D-032 defines the store-global manual recovery state, D-033 adds one optional subcategory level, and D-034 adds one shared read-only financial-report model for screen and PDF.

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
        |
        v
Cloud dataset -> Dexie compatibility/read cache
        |
        +--> reporting domain model (FinancialReport)
                 |                      |
                 v                      v
             Reports UI          Financial PDF

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
- report generation is read-only over the canonical mirrored dataset;
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
- financial/recovery SECURITY DEFINER RPCs are exposed only to `authenticated` and internally assert the active operator.

The current advisor warnings around intentional authenticated SECURITY DEFINER RPCs remain reviewed. D-034 exposes no new database function or write boundary.

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

Database integrity requires a referenced subcategory to belong to the same category selected by the item. Active items may not use inactive classification. Archive/delete guards preserve active-reference integrity.

Legacy items that predate classification are not assigned guessed category/subcategory values. A grandfathered active legacy item may retain that historical unclassified state during an ordinary edit, but new operational references stay strict.

## 5. Financial consistency and classification snapshots

Accepted V2 invariants remain:

- destructive history deletion is not the correction model;
- reversal preserves original rows and audit reason/time;
- correction creates a linked replacement atomically;
- business occurrence time is distinct from registration/audit time;
- statements/debt calculations preserve reversal-zero-effect semantics;
- item/category/subcategory transaction snapshots are historical facts.

For a new order, the server captures current valid item name, category id/name and optional subcategory id/name. Later catalog rename/reassignment does not rewrite the old transaction.

For D-026 correction:

- same order item -> preserve the original item/category/subcategory snapshot;
- changed order item -> capture that target item's current valid classification on the replacement.

## 6. Financial reporting pipeline — D-034

`src/domain/financialReporting.ts` is the canonical report-calculation boundary. It accepts transactions, resellers, categories, subcategories and a date range and returns a `FinancialReport` consumed by both the Reports page and `financialReportPdfService`.

```text
transactions + catalog/resellers + selected range
                     |
                     v
          buildFinancialReport(...)
                     |
                     v
              FinancialReport
              /            \
             v              v
       ReportsPage      PDF service
```

Canonical report semantics:

- transaction inclusion uses `transactionOccurredAt`;
- reversed rows remain stored but have zero effective report contribution;
- period sales are effective orders inside the interval;
- period receipts are effective payments + signals inside the interval;
- period net is sales minus receipts;
- report-end open debt is reconstructed from all effective movements through the interval end and sums only positive reseller balances;
- previous-period comparison uses the immediately preceding range with equal calendar length;
- category/subcategory performance uses immutable transaction snapshots and explicit legacy/unclassified groups;
- reseller performance combines interval activity with closing balance as of the interval end.

The PDF is a presentation adapter over `FinancialReport`. Section toggles can suppress tables but must never recompute money independently.

## 7. Canonical cloud adapter

`src/services/cloudDataService.ts` remains the application-facing bridge for canonical business data. It fetches categories, subcategories, items, resellers and transactions, refreshes Dexie as a read cache, routes referential writes through RLS and financial writes through accepted RPCs.

D-034 requires no additional Supabase endpoint because reporting is derived client-side from already-authorized canonical data.

## 8. Logical backup/restore

D-017/D-018 remain the portable recovery/interchange contract. D-033 advances Backup v2 to **schema 6**.

Schema 6 contains categories, subcategories, item category/subcategory references, resellers and transactions including immutable classification snapshots. Supported older v2 schema 4/5 backups normalize in memory to schema 6 without inventing missing category/subcategory history.

Cloud restore remains validation/preflight -> current checkpoint export -> atomic server replacement -> canonical post-restore reconciliation.

D-034 does not change backup schema or recovery semantics.

## 9. D-032 global manual recovery

During D-031 controlled early use:

1. approved operator exports canonical Backup v2;
2. export event is registered server-side;
3. operator stores the JSON outside Easy;
4. operator explicitly confirms;
5. latest confirmed export becomes the store-global checkpoint;
6. all approved devices share that checkpoint;
7. normal business writes require age `< 24h` and fail at `>= 24h`.

A fresh real global checkpoint has been exported/stored/confirmed on the updated candidate, so this mode is operationally initialized.

D-032 remains a temporary control and does not satisfy D-030 unattended off-site retention/restore-drill acceptance.

## 10. Migration/deployment boundary

The stable-v1 private staging/import pipeline remains dormant. Clean-start early use continues; no legacy real-store import is implicitly authorized.

- `develop` is candidate integration;
- `main` remains untouched;
- Git-triggered Vercel deployment is disabled;
- candidate publication is manual;
- canonical production URL/cutover remains separately gated.

## 11. Recent implementation closures

### D-033 / PR #82

Optional subcategories, snapshot parity and Backup schema 6 are integrated. Production migration `20260826135708_i3d_subcategories` is applied. D-019 and exact-tree integration passed.

### D-034 / PR #85

The dedicated financial Reports workspace, canonical report domain model, period comparison, category/subcategory and reseller views, timeline and configurable PDF are integrated.

D-019 run/job `33001910986` / `98285660448`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. The validated merge-ref tree was `124767ee7afa23c0c07e7215513fa5b90d8177a5`.

PR #85 was squash-integrated into `develop` as `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`, whose tree is exactly `124767ee7afa23c0c07e7215513fa5b90d8177a5`. Tree equivalence: PASS.

The post-integration canonical closure is Markdown-only and introduces no executable/runtime delta.