# Easy V2 — Project Spec

**Status:** canonical V2 product reference  
**Repository:** `synapselab-ia/easy`  
**Integration branch:** `develop`  
**Updated:** 2026-08-27

## 1. Purpose

Easy is a web application for reseller orders, payments/signals, balances, statements, operational analytics, financial reporting and portable recovery.

Easy V2 evolves the existing application rather than rewriting it. It must preserve accepted financial/audit behavior while becoming safer, recoverable, durable and maintainable.

## 2. Final architecture objective

D-029 remains the final architecture direction:

- React + TypeScript + Vite;
- Vercel frontend hosting;
- Supabase/Postgres canonical business persistence;
- Supabase Auth + RLS + approved-operator authorization;
- no privileged/service credential in browser code;
- Dexie/IndexedDB as transition/cache, not hosted source of truth;
- atomic database/server boundaries for financial create/reverse/correct operations;
- independent logical Easy JSON backup for portability and contingency.

## 3. Current sequencing — D-031

The operator authorized runtime-first controlled early use before the D-030 unattended off-site backup proof is completed.

Current state:

- P10-S3-I2-I2 trusted-PC/off-site/retention/restore acceptance is `ON_HOLD`;
- the Supabase/Auth runtime and candidate onboarding are accepted;
- controlled clean-start early use is active;
- `main` remains stable and untouched;
- Vercel publication remains manual/candidate;
- definitive cutover remains unauthorized.

D-030 is not declared passed or cancelled.

## 4. Early-use recovery posture — D-032

Hosted cloud early use uses a store-global manual logical-backup boundary:

1. Supabase/Postgres holds canonical business data.
2. Approved operators access it through Auth/RLS/allow-list controls.
3. Backup v2 export reads the canonical cloud dataset.
4. The operator stores the JSON outside Easy and explicitly confirms that action.
5. That confirmed checkpoint is shared by all approved devices.
6. Normal writes are permitted only while the checkpoint age is strictly `< 24h`.
7. At `>= 24h`, the database blocks business writes; clients also fail closed when health cannot be verified.
8. Cloud restore remains checkpointed, server-atomic and post-restore verified.

A fresh real global checkpoint has been exported/stored/confirmed on the updated candidate, so D-032 is operationally initialized.

This temporary mode is not D-030 durability acceptance.

## 5. Product objectives

The V2 must be:

1. **Correct** — balances/history remain internally consistent.
2. **Recoverable** — export/restore paths are validated and tested.
3. **Auditable** — financial corrections preserve history.
4. **Consistent** — dashboard, reseller detail, reports, PDF, search and analytics tell the same story.
5. **Secure** — cloud data requires authenticated approved-operator access.
6. **Usable** — routine operations remain efficient on desktop/mobile.
7. **Testable** — D-019 catches critical regressions before integration/publication.
8. **Maintainable** — canonical docs reconstruct current state without chat history.
9. **Portable** — cloud persistence never removes independent logical export.

## 6. Critical business invariants

The hosted runtime must preserve:

- reversible reseller/item/category/subcategory lifecycle where applicable;
- strict active references for new operations while historical rows remain preserved;
- audited reversal rather than destructive financial-history deletion;
- atomic linked replacement correction;
- `occurredAt` distinct from registration/audit time;
- accepted statement and FIFO debt-aging semantics;
- immutable transaction-time item/category/subcategory snapshots;
- non-inventive legacy classification semantics;
- D-026 full-field correction rules;
- exact logical-backup validation and recovery freshness enforcement;
- centralized report calculations rather than separate screen/PDF accounting logic.

## 7. Catalog classification — D-033

The accepted catalog model is intentionally shallow:

```text
Category -> optional Subcategory -> Item
```

Rules:

- exactly one optional subcategory level; recursive trees are out of scope;
- every subcategory belongs to one category;
- an item's subcategory, when present, must belong to the item's selected category;
- active items cannot use inactive classification;
- active references protect category/subcategory archival;
- legacy unclassified data stays unclassified rather than receiving guessed values;
- order history captures transaction-time category/subcategory snapshots;
- later catalog edits do not rewrite prior transactions;
- Backup v2 schema 6 contains subcategories and related references/snapshots;
- supported schema 4/5 backups normalize to schema 6 without inventing classification.

D-033 is implemented and integrated through PR #82.

## 8. Financial reporting — D-034

The accepted report product is a dedicated workspace, separate from the glance-oriented Dashboard.

The report workspace must support:

- common period presets and a custom date interval;
- summary KPIs for sales, receipts, open debt at report end and orders;
- comparison against the immediately preceding equal-length period;
- sales/receipts timeline;
- category -> subcategory analysis;
- reseller performance;
- downloadable financial PDF whose calculations come from the same canonical report model as the screen.

Accounting semantics:

1. Range inclusion uses financial occurrence time (`transactionOccurredAt`), not registration time.
2. Reversed transactions remain historical/auditable but have zero effective report contribution.
3. `Vendas` = effective order gross value inside the range.
4. `Recebimentos` = effective payment + signal value inside the range.
5. `Movimento líquido` = period sales minus period receipts.
6. `Em aberto no fim` = sum of positive reseller balances reconstructed from all effective history through the selected end date; it is not the period net.
7. Category/subcategory analytics use immutable transaction-time order snapshots and retain explicit legacy/unclassified groups rather than reclassifying history from current catalog data.
8. Reseller rows may combine period activity with an as-of-end closing balance, and the UI/PDF must label this distinction clearly.
9. PDF section selection changes presentation only; it does not create a second reporting calculation path.

D-034 is intentionally read-only and does not add a persistence schema, mutation RPC, recovery exception or deployment exception.

## 9. Cloud security requirements

- exposed application tables use RLS;
- anonymous business-data access is forbidden;
- browser configuration contains only project URL + publishable key;
- service-role/database/admin secrets never enter browser bundles/Git/public Vercel variables;
- authorization is based on server-managed `easy_operators`;
- financial multi-row operations cross one transactional PostgreSQL/server boundary;
- schema/policies remain reproducible from committed migrations.

Intentional `SECURITY DEFINER` transaction/restore RPCs are executable by `authenticated` only and internally assert the active operator. `anon` and `public` execute privileges are explicitly absent.

## 10. Data-migration posture

The private stable-v1 staging/import path remains available synthetically if later needed, but clean-start early use does not require or authorize real legacy import.

## 11. Repository governance

Branch roles:

- `main` — stable historical reference;
- `develop` — V2 integration;
- isolated branches derive from `develop`.

Integration pattern:

`defined work -> isolated branch -> implementation/docs -> D-019 (+ cloud evidence when relevant) -> PR -> develop`

## 12. Sources of truth

Precedence:

1. `docs/V2/STATUS.md` — current state and `NEXT_ACTION`;
2. `docs/V2/PROJECT_SPEC.md` — product intent;
3. `docs/V2/ARCHITECTURE.md` — technical architecture;
4. `docs/V2/BACKLOG.md` — ordered work;
5. `docs/V2/DECISIONS.md` — accepted decisions;
6. `docs/V2/QA_LEDGER.md` — validation evidence/gaps;
7. `docs/V2/CHANGELOG.md` — material state changes.

Historical `tasks/` checkboxes are not canonical status.

## 13. Current bounded goal

D-033 / subcategories, D-034 / financial reports, early-use changes #5–#10 and both operator-authorized pre-#8 refinements (the reseller statement PDF simplification and searchable entity selectors) are **closed**. Controlled early-use observation remains active.

Early-use change #7 standardized operator-facing monetary presentation to pt-BR separators and two decimals while leaving editable numeric inputs, calculations, parsing, persistence, rounding and accepted accounting/history semantics unchanged. It introduced no database, Auth/RLS, recovery or deployment-boundary change.

The pre-#8 PDF refinement preserved the existing grouped-product and per-order written-name behavior while removing reversed/audit-only rows from the client-facing document. Its closing now presents effective period orders, canonical pre-period balance, effective payments/signals and canonical current/closing balance directly after the products; optional payment/signal detail follows only when applicable. Audit history itself remains unchanged.

The pre-#8 searchable-selector refinement introduced one reusable searchable combobox for large variable entity lists. Search is substring-based, case-insensitive and accent-insensitive; typed search text is presentation state only, while selection continues to use the existing entity IDs. It is used for reseller/item selection in new transactions and full correction, and category/subcategory selection in item create/edit. Small closed-list selectors remain unchanged. No persistence, database/Supabase, financial/history, Auth/RLS, recovery or deployment contract changed.

Early-use change #8 exposes the **current catalog** classification path (`category` plus optional `subcategory`) in the item catalog and in the new-order item selector. Legacy or unresolved current-catalog references are shown as `Sem classificação`; no classification is fabricated. The selector's search key remains item-name-only, and order creation/history behavior is unchanged, so D-025/D-033 transaction-time classification snapshots remain the historical source of truth.

Early-use change #9 adds transient list ergonomics using already loaded data: item name search plus category/category-scoped-subcategory/lifecycle filters, and reseller search across name/phone/email plus lifecycle filtering. Search ignores case/accents, filters combine without mutating records, and no database/schema, fuzzy identity, bulk action, lifecycle/history, financial or recovery contract changed.

Early-use change #10 exposes the already-supported transaction `observation` field in normal payment and signal entry. The existing local transaction contract, cloud adapter and PostgreSQL RPC already carried and stored the field for non-order movements, so the accepted delta is form-only plus focused tests: the same optional observation is now available for all transaction types, order presentation remains unchanged and blank observations remain absent. No database/schema migration, Supabase function/policy change, payment/signal financial effect, occurrence semantics, reversal/correction/history, PDF or recovery contract changed.

The operator has explicitly authorized the bounded usability/data-quality queue recorded in `STATUS.md` and `BACKLOG.md`, with a strict **one-item-at-a-time** rule. Only the item named by current `NEXT_ACTION` is executable; later queue entries are ordered candidates, not permission to batch work.

For each queue item:

- verify the current evidence before changing code;
- preserve the accepted financial/history/security/recovery architecture unless that item's scope explicitly requires otherwise;
- close as `NO_CHANGE / DEFERRED` instead of forcing a change when the issue is absent or safe implementation would broaden scope;
- use an isolated branch and D-019 for executable integration;
- after closure, promote exactly the next pending queue item in canonical docs and stop before implementing it.

Current item: **early-use change #11 — actionable global item search result**.

Change #11 is limited to verifying current global item-search selection behavior and, where needed, making selection land the operator in useful item context rather than an unfiltered generic catalog. Prefer a minimal stable filter/highlight/targeting mechanism over a new item-detail architecture; no database/schema migration or change to item identity/lifecycle/classification semantics is authorized.

Scope still excludes automatic Vercel publication, D-030 trusted-PC proof, legacy real-store migration, `main` publication, canonical URL switch or definitive cutover.