# Easy V2 — Dashboard + Reports Core Product Spec

**Status:** ACCEPTED PRODUCT DIRECTION — D-035  
**Updated:** 2026-08-27  
**Initiative:** Dashboard + Reports core decision system  
**Execution model:** one bounded `DR-*` item at a time

## 1. Purpose

Dashboard and Reports are the two primary business-intelligence surfaces of Easy. They must work as one coherent decision system without duplicating roles.

The Dashboard is the daily operational surface. Its mission is:

> **In at most about 10 seconds, show how the business stands now, what happened recently, where there is risk and what the next useful action is.**

Reports is the analytical workspace. Its mission is:

> **Explain a selected period in depth, compare it with prior performance, support investigation by product/category/reseller and produce a presentable PDF from the same canonical calculations.**

The redesign must make both surfaces stronger by removing overlap rather than adding more permanent Dashboard widgets.

## 2. Product boundary

### Dashboard answers

- What is happening in the current operating period?
- What is the current receivable position as of today?
- What needs attention now?
- What was registered recently?
- Where should the operator click next?

Dashboard characteristics:

- glance-oriented;
- no configurable analytical period selector;
- fixed, explicit periods in labels;
- small number of high-value indicators;
- exceptions and action paths before deep analysis;
- mobile priority order must match desktop priority order.

### Reports answers

- What happened in a selected period?
- How did it compare with the immediately preceding equal-length period?
- Which products/categories/revendedores drove the result?
- How did sales and receipts evolve through the interval?
- What is the closing open position as of the report end?
- Which analysis should be exported to PDF?

Reports characteristics:

- period-controlled;
- analysis-oriented;
- sortable/searchable detailed views where useful;
- charts are allowed when they materially improve investigation;
- screen and PDF continue to share canonical `FinancialReport` calculations.

## 3. Canonical financial semantics

D-014, D-015, D-025, D-033 and D-034 remain authoritative. D-035 changes product projection/hierarchy, not accounting.

Mandatory rules:

1. `occurredAt` is financial occurrence time; `createdAt` is registration/audit time.
2. Reversed transactions remain audit-visible but contribute zero to effective financial/reporting values.
3. Monthly Dashboard flow uses the operator-local calendar month **from month start through the end of the operator's current local day**.
4. `Vendas este mês` = effective order gross value in that month-to-today range.
5. `Recebimentos este mês` = effective payments + signals in that month-to-today range.
6. `Carteira em aberto` is an **as-of-today** position: sum of positive reseller balances reconstructed from effective history through the end of the operator's current local day.
7. Future occurrence dates later than the operator's current local day are legitimate under D-014/#15 but **must not contaminate current-position KPIs or aging before their occurrence date**.
8. Debt aging is reconstructed through the same as-of-today cutoff and retains accepted FIFO allocation semantics.
9. Existing age thresholds remain unchanged unless separately reauthorized: `Recente` 0–6 days, `Em atenção` 7–30 days, `Crítico` >30 days.
10. Dashboard and Reports must not create competing financial interpretations. Reuse accepted domain helpers / `FinancialReport` where their semantics match.

## 4. Target Dashboard hierarchy

The target information order is:

1. page identity + quick transaction actions;
2. four primary KPIs;
3. `Precisa de atenção` action center;
4. compact `Carteira por idade` context;
5. recent effective registrations;
6. contextual path to deeper Reports analysis.

Large analytical charts, long ranking blocks and configurable analysis windows do not belong in the target Dashboard.

## 5. Primary Dashboard KPIs

Desktop target: four compact cards. Mobile may use a 1-column or 2-column arrangement, but the information order is preserved.

### 5.1 Vendas este mês

Primary value:

- gross effective order value from local month start through today.

Secondary context:

- month order count;
- month item quantity;
- optional compact `Hoje` context such as today's order count/value.

Today's value is secondary context only; it must not become another permanent top-level KPI card.

### 5.2 Recebimentos este mês

Primary value:

- effective payments + signals from local month start through today.

Secondary context:

- clear label `Pagamentos + sinais`;
- optional compact amount received today.

A zero-receipts day must not make the card useless because the primary metric is month-to-today.

### 5.3 Carteira em aberto

Primary value:

- current positive open balance across resellers as of the end of today.

Secondary context:

- number of resellers with positive current open balance.

Use `Carteira em aberto`, not `Dívida Total`, because recent legitimate open balances are not automatically delinquent.

### 5.4 Crítico > 30 dias

Primary value:

- sum of outstanding FIFO lots older than 30 days as of today.

Secondary context:

- number of unique resellers with any critical amount;
- oldest critical age when one exists.

This is the risk KPI. It must not be replaced by `Maior devedor atual`, which can be large but recent.

## 6. `Precisa de atenção` action center

This is the highest-priority operational block after the KPIs.

### One reseller, one row

A reseller must not appear once in `Crítico` and again in `Em atenção`.

Classification:

1. if the reseller has any critical outstanding amount, status = `CRÍTICO`;
2. otherwise, if the reseller has any attention outstanding amount, status = `ATENÇÃO`;
3. recent-only open balance does not enter this action center.

Each row should expose at least:

- reseller name;
- status text (`CRÍTICO` / `ATENÇÃO`), never color alone;
- age in days of the oldest outstanding lot that determines the status;
- amount in the determining alert class;
- total current open balance when materially different from the alert-class amount.

### Priority order

Use an explainable deterministic order, not an opaque score:

1. severity (`CRÍTICO` before `ATENÇÃO`);
2. older determining outstanding occurrence first;
3. larger determining alert amount first;
4. reseller name as stable tie-breaker.

### Actions

- clicking a reseller opens the existing reseller detail/history surface;
- a later bounded refinement may expose a direct `Registrar pagamento` action by reusing the existing transaction route with `type` + `resellerId` context;
- do not create a parallel collection/cobrança persistence model merely for the Dashboard.

### Density

The initial view should be compact (for example top 5–8 rows depending on responsive space), with explicit filters/tabs for `Todos`, `Críticos`, `Em atenção` when useful. Avoid rendering two separate ten-row lists before the rest of the Dashboard.

Empty states must describe the business condition, e.g. `Nenhuma pendência crítica`, not the misleading `Nenhum revendedor encontrado`.

## 7. Carteira por idade

Retain the accepted three aging buckets but replace the large donut as the default target presentation.

Each bucket must expose both value and percentage:

- `Recente (0–6d)`;
- `Em atenção (7–30d)`;
- `Crítico (>30d)`.

Preferred presentation is a compact segmented bar or compact rows/bars, because exact value + percentage should be readable without hovering a chart.

This section is context; the action center above it is where the operator acts.

## 8. Recent effective registrations

Add a compact block for confidence in recent data entry, conceptually `Últimos lançamentos registrados`.

Rules:

- show a small number of latest effective transaction rows ordered by `createdAt` descending;
- distinguish `Pedido`, `Pagamento` and `Sinal`;
- show reseller and value;
- show financial occurrence date when it differs from the registration calendar date or otherwise needs disambiguation;
- reversed rows are not presented as current effective activity in this compact feed; immutable audit detail remains in existing history surfaces;
- selecting a row should lead to the related reseller detail/history when feasible.

This block is not a replacement for a global audit log.

## 9. Quick actions

Expose compact page-level actions for the three routine transaction intents:

- `+ Pedido`;
- `+ Pagamento`;
- `+ Sinal`.

Reuse the existing transaction route/type context. Do not create a second transaction form.

## 10. Content removed from the target Dashboard

The following current Dashboard elements are not part of the target operational surface:

- configurable `90 / 180 / 360` performance window;
- `Concentração de Vendas` as a permanent Dashboard card;
- large Pareto 80/20 chart;
- `Maior devedor atual` card;
- `Ranking de Inadimplência` chart.

Reasons:

- they are analytical rather than glance/action oriented;
- several repeat the same open-balance theme;
- `Maior devedor` is not necessarily the highest-risk reseller;
- the current `Ranking de Inadimplência` actually ranks positive open balances and can label recent legitimate debt as delinquency;
- the current performance period selector changes sales/Pareto but not accumulated current-debt ranking, which creates ambiguous period semantics.

Do not delete useful analytical capability merely to clean the Dashboard. Re-home applicable analysis in Reports using canonical report semantics.

## 11. Target Reports refinements

D-034 remains the foundation. D-035 refines hierarchy/usability without replacing `FinancialReport`.

### 11.1 Summary KPI hierarchy

Target four primary financial KPIs:

1. `Vendas`;
2. `Recebimentos`;
3. `Movimento líquido`;
4. `Em aberto no fim`.

`Pedidos` and item quantity become supporting sales context rather than displacing `Movimento líquido` from the primary financial row.

### 11.2 Comparison clarity

Keep equal-length previous-period comparison, but operator-facing context should expose the actual comparison range when practical instead of only saying `vs. período anterior`.

### 11.3 Revendedor analysis

The `Revendedores` workspace is the natural home for:

- sales/receipts/open-debt table;
- search by reseller name;
- useful sorting (sales, receipts, open debt, orders);
- Pareto/concentration analysis derived from the **selected report period's reseller sales**, not from a separate Dashboard-only 90/180/360 calculation path;
- optional `Maiores saldos em aberto` analysis using report-end `openDebt` language rather than claiming all positive balance is `inadimplência`.

### 11.4 Product/category analysis

The existing immutable-snapshot product/category semantics remain. Add analysis controls only where they materially improve larger datasets, such as:

- product-name search;
- sorting by sales, quantity or orders;
- category filter/context.

### 11.5 PDF parity

Any Reports refinement that changes the meaning of a report metric must be represented in canonical `FinancialReport` first. PDF remains a presentation adapter over the same object. Dashboard-only operational aging does not need to be added to the financial PDF unless separately authorized.

## 12. Dashboard ↔ Reports contextual navigation

The two surfaces should feel connected.

Target behavior after the core Dashboard exists:

- sales/receipts month context can open Reports already focused on the current month;
- open-position context can open the Reports reseller view when useful;
- `Abrir Relatórios` provides the general analysis path;
- contextual state may use URL/search parameters rather than hidden global state so navigation is reproducible and testable.

Do not couple the Dashboard to internal component state in a way that makes direct report navigation unreliable.

## 13. Dashboard read-model / efficiency contract

The original Dashboard independently read/reduced the same transactions multiple times. DR-02 is now integrated and establishes one coherent read-only `DashboardSnapshot` before major visual changes.

The snapshot covers:

- month sales;
- month receipts;
- month order count;
- month item quantity;
- today sales/orders/receipts context;
- current as-of-today open debt;
- unique resellers with open debt;
- critical open amount and unique critical-reseller count;
- oldest critical age;
- aging buckets;
- deduplicated attention rows;
- recent effective registrations.

Accepted DR-02 implementation:

- `src/domain/dashboardSnapshot.ts` owns the bounded projection;
- month/today flow reuses `buildFinancialReport` where its semantics match;
- aging reuses accepted effective-transaction/FIFO helpers;
- current-position FIFO processing applies one explicit operator-local end-of-today cutoff so later future occurrences cannot affect current debt/aging before they occur;
- recent registrations remain registration-time context, ordered by `createdAt`, while reversed rows are excluded;
- `src/hooks/useDashboard.ts` exposes a shared `['dashboard', 'snapshot']` query and maps the snapshot into the legacy operational-hook shapes during the ordered UI transition;
- existing transaction/reseller mutation invalidation of the `['dashboard']` prefix refreshes the snapshot without introducing a second invalidation mechanism;
- no database/schema migration, Supabase/Auth/RLS/recovery/deployment change was introduced;
- DR-02 deliberately did not perform DR-03/DR-04 visual work or alter the legacy Performance block reserved for DR-07.

## 14. Language and visual semantics

Mandatory terminology direction:

- `Carteira em aberto` for current positive receivable position;
- `Crítico > 30 dias` for aged risk;
- avoid using `Inadimplência` as a synonym for every positive reseller balance;
- remove the current `atualizada em tempo real` claim unless real-time behavior is actually implemented and verified;
- visible money remains consistent with the accepted pt-BR presentation contract;
- severity must be represented by text/structure in addition to color.

## 15. Responsive / usability acceptance

The redesign is not complete merely when desktop screenshots look good.

Acceptance targets:

1. operator can identify current business position in roughly 10 seconds;
2. on desktop, whether critical attention exists should be discoverable without deep scrolling;
3. attention target opens the relevant reseller in one click;
4. no configurable analytical window is required to understand the Dashboard;
5. no reseller is duplicated across simultaneous attention/critical lists;
6. current-position metrics have explicit as-of-today semantics and exclude later future occurrences;
7. empty states communicate the business state rather than imply missing master data;
8. mobile preserves the priority order `KPIs -> attention -> aging -> recent activity`;
9. analytical 400px-class charts do not dominate the mobile Dashboard;
10. keyboard/focus/semantic-label behavior remains usable for interactive controls;
11. Dashboard wording has no ambiguous `tempo real`, `inadimplência` or period claims;
12. no parallel accounting implementation is introduced.

## 16. Authorized implementation sequence

The redesign is a new D-035 initiative and **must not be numbered as early-use change #16**.

Only the item named by `STATUS.md -> NEXT_ACTION` is current.

### DR-01 — Product contract and canonical documentation

**Status:** DONE by the documentation change that introduces D-035 and this specification.

- record Dashboard mission and Reports boundary;
- define canonical KPI/attention/aging/recent-activity semantics;
- define the implementation sequence and stop conditions;
- absorb the old isolated change #14 idea into the redesign rather than implementing it standalone.

### DR-02 — Canonical Dashboard read-model

**Status:** DONE / INTEGRATED — PR #114.

- canonical `DashboardSnapshot` introduced in `src/domain/dashboardSnapshot.ts`;
- operational Dashboard hooks share the snapshot query while preserving their current UI contract;
- month-to-today/today flow reuses `FinancialReport` semantics;
- current debt/aging reuses accepted transaction/FIFO helpers with an explicit as-of-today cutoff;
- valid later future occurrences do not alter current debt/aging before occurrence;
- attention rows are deduplicated/deterministically ordered in the snapshot;
- recent effective registrations are centralized;
- focused snapshot tests plus full D-019 passed;
- no DR-03 or later UI redesign was bundled.

Validation/integration evidence: PR #114; D-019 run/job `33115854899` / `98670186895`; validated/integrated tree `b9b5040abd6f217f41d4bba12f21ae05d06271dc`; squash-integrated `develop@4e3a9b28174cb64ad820f4ec60356194d1a760bb`; exact tree equivalence PASS.

### DR-03 — Primary KPI row

**Status:** CURRENT / AUTHORIZED.

Implement the four target KPIs from the accepted DR-02 snapshot: `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto`, `Crítico > 30 dias`. Remove misleading realtime wording and preserve responsive/loading/empty behavior. This item is presentation/projection consumption only; do not rebuild the accounting calculations in components and do not begin DR-04.

### DR-04 — `Precisa de atenção` action center

**Status:** QUEUED / NOT CURRENT.

Unify critical/attention presentation into one reseller-per-row action center with deterministic priority and reseller-detail navigation.

### DR-05 — Compact carteira aging

**Status:** QUEUED / NOT CURRENT.

Replace the large donut/default aging presentation with compact exact-value + percentage context using the same snapshot buckets.

### DR-06 — Recent registrations + quick actions

**Status:** QUEUED / NOT CURRENT.

Add recent effective registration context and reuse existing transaction-route intents for order/payment/signal quick actions.

### DR-07 — Remove Dashboard Performance block + contextual Reports handoff

**Status:** QUEUED / NOT CURRENT.

Remove the current Dashboard `Análise de Performance` surface only after the accepted operational replacements exist. Add contextual navigation needed to preserve a clear path to deeper analysis. Do not silently discard useful analytics.

### DR-08 — Reports analytical refinement

**Status:** QUEUED / NOT CURRENT.

Refine primary KPIs, explicit comparison context, product/reseller analysis controls and re-home applicable Pareto/concentration/open-balance analytics on canonical `FinancialReport` semantics.

### DR-09 — Final Dashboard/Reports UX and efficiency acceptance

**Status:** QUEUED / NOT CURRENT.

Run a bounded final pass across desktop/mobile, empty/loading states, accessibility, wording, deep-link behavior and performance. Fix only defects found by that acceptance pass; do not use it to invent unrelated features.

## 17. Governance / stop conditions

Every executable `DR-*` item:

- starts from current `develop` on an isolated branch;
- verifies the current implementation before modifying it;
- uses proportionate focused tests;
- requires D-019 before executable integration;
- updates canonical docs at closure and promotes exactly the next `DR-*` item;
- stops after that one item;
- does not automatically deploy to Vercel;
- does not modify/publish `main`;
- does not weaken D-032 recovery, Supabase/Auth/RLS or approved-operator boundaries;
- does not resume D-030/I2-I2, import legacy real-store data or claim definitive cutover;
- does not introduce a database/schema migration unless a later explicit operator decision materially expands the scope.

Unexpected requirements that would alter accepted accounting semantics or materially broaden the initiative require a new operator decision rather than silent expansion.
