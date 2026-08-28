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
7. At `>= 24h`, the database blocks business writes; clients also fail closed when cloud recovery health cannot be verified.
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
- an item's subcategory, when present, must belong to its selected category;
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
- product/item analytics plus category -> subcategory analysis;
- reseller performance;
- downloadable financial PDF whose calculations come from the same canonical report model as the screen.

Accounting semantics:

1. Range inclusion uses financial occurrence time (`transactionOccurredAt`), not registration time.
2. Reversed transactions remain historical/auditable but have zero effective report contribution.
3. `Vendas` = effective order gross value inside the range.
4. `Recebimentos` = effective payment + signal value inside the range.
5. `Movimento líquido` = period sales minus period receipts.
6. `Em aberto no fim` = sum of positive reseller balances reconstructed from all effective history through the selected end date; it is not the period net.
7. Product and category/subcategory analytics use immutable transaction-time order snapshots and retain explicit legacy/unclassified groups rather than reclassifying history from current catalog data.
8. Reseller rows may combine period activity with an as-of-end closing balance, and the UI/PDF must label this distinction clearly.
9. PDF section selection changes presentation only; it does not create a second reporting calculation path.

D-034 is intentionally read-only and does not add a persistence schema, mutation RPC, recovery exception or deployment exception.

## 8A. Dashboard + Reports core decision system — D-035

The operator accepted a second-pass product audit that treats Dashboard and Reports as the core management surfaces of Easy rather than independent feature collections.

Accepted boundary:

- **Dashboard** is the daily operational surface: current month flow, as-of-today receivable position, actionable aged-risk exceptions, compact aging context, recent effective registrations and direct paths to the next useful action;
- **Reports** is the period-controlled analytical surface: comparison, timeline, product/category/reseller investigation, Pareto/concentration and downloadable PDF;
- analytical `90/180/360` controls, large Pareto/ranking charts and duplicated open-balance analytics are not target permanent Dashboard content;
- useful analytics removed from Dashboard must be re-homed in Reports on canonical `FinancialReport` semantics rather than discarded or recalculated through a competing path;
- current-position Dashboard values are explicitly **as of the operator's current local day**. Legitimate future `occurredAt` values after today must not affect current open debt or aging before their occurrence date;
- existing FIFO aging thresholds remain `0–6d`, `7–30d`, `>30d` unless separately reauthorized;
- one coherent read-only Dashboard projection is required before the visual redesign so components do not repeatedly reconstruct financial meaning independently.

The detailed accepted target, semantics, UX criteria and `DR-01…DR-09` execution sequence live in `docs/V2/DASHBOARD_REPORTS_SPEC.md`.

DR-02 is integrated through PR #114. The canonical `DashboardSnapshot` projection centralizes month/today flow, as-of-today open position, FIFO aging, critical/attention context and recent effective registrations while reusing accepted `FinancialReport`/transaction helpers and excluding later future occurrences from current-position calculations.

DR-03 is integrated through PR #116. The Dashboard primary row consumes that snapshot directly and presents `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto` and `Crítico > 30 dias`, with compact month/today/open-reseller/critical context, explicit loading/empty states and no misleading `tempo real` claim. No accounting calculation was moved into the presentation layer.

DR-04 is integrated through PR #118. `Precisa de atenção` consumes the canonical deduplicated `DashboardSnapshot.attentionRows` directly, preserves its deterministic severity/age/value/name order, exposes explicit status/age/alert amount plus materially different total open balance, and navigates each keyboard-accessible row to the existing reseller detail/history. The old duplicated critical/attention lists were removed from `DebtHealthAgingCard`.

DR-05 is integrated through PR #120. `Carteira por idade` consumes prepared `DashboardSnapshot.agingBuckets` plus the current open-debt total and replaces the large donut with compact exact-value + percentage rows for `Recente (0–6d)`, `Em atenção (7–30d)` and `Crítico (>30d)`. FIFO allocation, aging classification and percentage derivation remain owned by the canonical read-model rather than presentation components.

DR-06 is integrated through PR #122. The Dashboard now exposes compact `+ Pedido`, `+ Pagamento` and `+ Sinal` actions through the existing transaction route/type context and a compact `Últimos lançamentos registrados` feed consuming prepared `DashboardSnapshot.recentRegistrations` in canonical registration order. The feed distinguishes movement type, reseller and value, exposes occurrence-date context when registration and financial calendar dates differ, and opens the existing reseller detail/history. No second transaction form/write path or presentation-side effective/reversal logic was introduced.

DR-07 is integrated through PR #124. The operational Dashboard no longer renders the legacy `Análise de Performance` / `90/180/360` analytical surface after recent activity. Instead, it closes with one explicit `Análise detalhada` handoff to the existing `/reports` workspace. The existing Reports route/default period and `FinancialReport` semantics remain unchanged, while the legacy Performance code stays outside the rendered Dashboard for the isolated DR-08 re-home/refinement step.

D-035 does not authorize a new database/schema, financial mutation/accounting contract, Auth/RLS/recovery weakening, automatic deployment, `main` publication, legacy import or definitive cutover.

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

For the current D-035 initiative, `docs/V2/DASHBOARD_REPORTS_SPEC.md` is the focused product contract and must be read after the canonical startup set before executing a `DR-*` item.

## 13. Current bounded goal

D-033 / subcategories, D-034 / financial reports, early-use changes #5–#13, early-use change #15 and both operator-authorized pre-#8 refinements (the reseller statement PDF simplification and searchable entity selectors) are **closed**. Controlled early-use observation remains active.

The previously proposed isolated change #14 (`Recebimentos hoje`) is no longer a standalone pending item. It is **absorbed/superseded by D-035**: receipts remain part of the target Dashboard, but as `Recebimentos este mês` with optional today context rather than a dedicated daily KPI card.

D-035 / Dashboard + Reports core redesign is the authorized product initiative. `DR-01` (product contract/canonical documentation), `DR-02` (canonical Dashboard read-model), `DR-03` (primary Dashboard KPI row), `DR-04` (`Precisa de atenção` action center), `DR-05` (compact carteira aging), `DR-06` (recent registrations + quick actions) and `DR-07` (remove Dashboard Performance + contextual Reports handoff) are complete. **`DR-08 — Reports analytical refinement` is the sole current executable item.** `DR-09` remains queued/not current and must not be bundled.

DR-02 integrated one bounded read-only `DashboardSnapshot` in `src/domain/dashboardSnapshot.ts` and one shared Dashboard snapshot query in `src/hooks/useDashboard.ts`. It centralizes month-to-today sales/receipts/order/item context, optional today context, current open debt/reseller count, critical amount/count/oldest age, accepted FIFO buckets, deterministic attention rows and recent effective registrations. The current-position side applies the operator-local end-of-today cutoff so valid future occurrences remain valid history/registrations but cannot affect current debt/aging until they occur. The implementation introduced no database/schema, Supabase/RPC/Auth/RLS, recovery or deployment change.

DR-03 replaced the legacy top-card presentation with the four accepted primary KPIs using the prepared `DashboardSnapshot` only. The row preserves useful month order/item context, optional today context, open-reseller count and critical reseller count/oldest age; responsive `1/2/4` column behavior, loading states and explicit business empty states are covered by focused tests. The first D-019 attempt exposed only a stale pre-DR-03 `DashboardCards` test contract; that test was aligned without weakening the feature, and the final D-019 passed before PR #116 was squash-integrated. Validated and integrated tree equivalence passed.

DR-04 replaced the two legacy alert lists with one `Precisa de atenção` action center after the KPIs. It consumes prepared snapshot rows only, displays one reseller once with explicit severity, prepared determining age and alert amount, includes total current open balance when materially different, preserves deterministic ordering, provides existing reseller-detail navigation, keeps the initial list compact and uses a business-meaningful empty state. PR #118 passed the full D-019 and exact validated/integrated tree equivalence before closure.

DR-05 replaced the large aging donut with compact `Carteira por idade` rows using the same prepared snapshot. Each accepted bucket displays exact pt-BR value and prepared percentage with accessible progress semantics, while the total current open position, compact loading behavior and explicit empty state remain visible. The component does not calculate FIFO, classify aging or derive percentages. PR #120 passed full D-019 and exact validated/integrated tree equivalence; DR-06 recent registrations/quick actions were not bundled.

DR-06 added only the prepared recent-registration projection and existing-route quick actions. `RecentRegistrations` preserves the snapshot-provided order and reversal exclusion, distinguishes transaction type, value and reseller, disambiguates occurrence date from registration date when needed, and navigates to existing reseller history. `DashboardQuickActions` routes the three accepted intents into the existing transaction form. PR #122 passed full D-019 and exact validated/integrated tree equivalence; `PerformanceAnalysisSection` remained unchanged for DR-07.

DR-07 removed the legacy analytical Performance surface from the rendered Dashboard only after the operational replacements were complete and added a reproducible contextual path to the existing Reports workspace. The first full D-019 attempt correctly failed because four pre-existing Playwright scenarios still asserted the removed UI; no integration occurred. That stale E2E contract was aligned, the full gate then passed, and PR #124 was squash-integrated with exact validated/integrated tree equivalence. Reports content/accounting was not refined in DR-07; that remains the isolated DR-08 scope.

Early-use change #7 standardized operator-facing monetary presentation to pt-BR separators and two decimals while leaving editable numeric inputs, calculations, parsing, persistence, rounding and accepted accounting/history semantics unchanged. It introduced no database, Auth/RLS, recovery or deployment-boundary change.

The pre-#8 PDF refinement preserved the existing grouped-product and per-order written-name behavior while removing reversed/audit-only rows from the client-facing document. Its closing now presents effective period orders, canonical pre-period balance, effective payments/signals and canonical current/closing balance directly after the products; optional payment/signal detail follows only when applicable. Audit history itself remains unchanged.

The pre-#8 searchable-selector refinement introduced one reusable searchable combobox for large variable entity lists. Search is substring-based, case-insensitive and accent-insensitive; typed search text is presentation state only, while selection continues to use the existing entity IDs. It is used for reseller/item selection in new transactions and full correction, and category/subcategory selection in item create/edit. Small closed-list selectors remain unchanged. No persistence, database/Supabase, financial/history, Auth/RLS, recovery or deployment contract changed.

Early-use change #8 exposes the **current catalog** classification path (`category` plus optional `subcategory`) in the item catalog and in the new-order item selector. Legacy or unresolved current-catalog references are shown as `Sem classificação`; no classification is fabricated. The selector's search key remains item-name-only, and order creation/history behavior is unchanged, so D-025/D-033 transaction-time classification snapshots remain the historical source of truth.

Early-use change #9 adds transient list ergonomics using already loaded data: item name search plus category/category-scoped-subcategory/lifecycle filters, and reseller search across name/phone/email plus lifecycle filtering. Search ignores case/accents, filters combine without mutating records, and no database/schema, fuzzy identity, bulk action, lifecycle/history, financial or recovery contract changed.

Early-use change #10 exposes the already-supported transaction `observation` field in normal payment and signal entry. The existing local transaction contract, cloud adapter and PostgreSQL RPC already carried and stored the field for non-order movements, so the accepted delta is form-only plus focused tests: the same optional observation is now available for all transaction types, order presentation remains unchanged and blank observations remain absent. No database/schema migration, Supabase function/policy change, payment/signal financial effect, occurrence semantics, reversal/correction/history, PDF or recovery contract changed.

Early-use change #11 makes selected global item-search results actionable without adding an item-detail architecture. Item selection now hands the selected item name into the existing catalog search, `ItemsPage` applies that one-shot navigation intent to the accepted transient #9 name filter and removes the URL parameter, and the operator lands in the filtered catalog context. Reseller navigation and create-item suggestions remain unchanged. No database/schema, item identity/lifecycle/classification/history, Supabase/Auth/RLS, recovery or deployment contract changed.

Early-use change #12 adds conservative, non-blocking duplicate warnings only during **new** reseller/item creation using data already loaded by the existing forms. Reseller warnings match normalized name, normalized exact phone or exact case-insensitive e-mail and identify which fields coincided; item warnings require normalized name plus the same category and same optional subcategory, reducing false positives across legitimate classifications. Archived records are included as warning context, edits are unchanged, and the operator can still explicitly choose `Cadastrar mesmo assim`. No automatic merge, silent rejection, hard uniqueness constraint, database/schema migration, Supabase/Auth/RLS, recovery, financial/history or deployment contract changed.

Early-use change #13 extends the existing canonical read-only `FinancialReport` with product-level performance. Product rows come from effective occurrence-time order snapshots and aggregate exact transaction-time item/name/classification context, so later catalog rename or reclassification does not rewrite historical sales. The report screen now exposes product, historical classification, order count, quantity and gross sales; the product highlight uses the top-selling product; and the existing products/categories PDF section consumes the same canonical `report.products` list. Reversed transactions remain zero-effect. No persistence, database/Supabase, mutation, Auth/RLS, recovery or deployment contract changed.

Early-use change #15 adds a non-blocking intent check to new transaction entry when the selected financial occurrence date is later than the operator's local current date. Same-day/past entries remain unchanged; a future date prompts `Voltar e corrigir` or `Cadastrar mesmo assim`, and explicit confirmation persists exactly the selected future `occurredAt`. The UI never auto-corrects or prohibits the date, preserving D-014. No database/schema, transaction-accounting, Supabase/RPC/Auth/RLS, recovery or deployment contract changed.

The previous bounded usability/data-quality queue remains historical and must not be extended by inventing a #16. New Dashboard/Reports work uses the separate D-035 `DR-*` sequence. The strict one-item-at-a-time rule remains in force.

Scope still excludes automatic Vercel publication, D-030 trusted-PC proof, legacy real-store migration, `main` publication, canonical URL switch or definitive cutover.