# Easy V2 — Decision Ledger

**Updated:** 2026-08-27

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
**Status:** ACCEPTED / RETAINED BY D-029, D-031, D-032, D-033 AND D-034.

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
**Status:** ACCEPTED / IMPLEMENTED / EXTENDED BY D-033 AND CONSUMED BY D-034 REPORTING.

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

Accepted contract:

1. `category -> optional subcategory -> item`; recursive subcategories are out of scope.
2. A subcategory belongs to exactly one category and has stable identity/lifecycle.
3. An item may reference one optional subcategory.
4. Referenced subcategory must belong to the item's selected category.
5. Active items cannot use inactive classification; invalid archival is protected.
6. Legacy records without classification remain unclassified rather than receiving guessed values.
7. New orders store category id/name and optional subcategory id/name as immutable historical facts.
8. Current catalog edits do not mutate prior transaction snapshots.
9. Same-item correction preserves historical classification; changing item captures the target item's current valid classification.
10. Backup v2 schema 6 includes subcategories and related references/snapshots; supported schema 4/5 imports do not invent them.
11. Supabase is canonical in hosted mode and Dexie mirrors the logical shape.
12. D-033 does not weaken security, recovery, deployment or `main` boundaries.

Acceptance evidence: migration `20260826135708_i3d_subcategories` applied; synthetic database proof passed and rolled back with zero residue; D-019 run/job `32983745854` / `98226501149` passed; PR #82 integrated with exact tree equivalence.

## D-034 — Financial reports use one canonical read-only model for screen and PDF
**Status:** ACCEPTED / IMPLEMENTED / INTEGRATED  
**Date:** 2026-08-26

### Trigger

During controlled early use, the operator requested useful and presentable financial reporting in addition to the glance-oriented Dashboard, including downloadable PDF and product/category/subcategory analysis.

### Accepted contract

1. **Dedicated workspace.** Financial reporting lives in a `Relatórios` workspace rather than overloading the Dashboard.
2. **Single calculation model.** `src/domain/financialReporting.ts` builds the canonical `FinancialReport`; the interactive screen and PDF both consume that same object.
3. **Occurrence-time range.** Report periods use D-014 financial occurrence time (`transactionOccurredAt`), not registration time.
4. **Reversal semantics.** Reversed transactions remain audit history but contribute zero to effective report values.
5. **Sales.** `Vendas` is the gross value of effective orders whose occurrence is inside the selected interval.
6. **Receipts.** `Recebimentos` is the effective sum of payments and signals whose occurrence is inside the selected interval.
7. **Period net.** `Movimento líquido` is sales minus receipts for the interval and is not synonymous with outstanding debt.
8. **Open debt as-of end.** `Em aberto no fim` is the sum of positive reseller balances reconstructed from all effective history through the report end date. Prior-period debt therefore carries into the report-end balance even when it was not created inside the selected interval.
9. **Comparison.** KPI comparison uses the immediately preceding interval with equal calendar length.
10. **Historical classification.** Product/category/subcategory analysis uses transaction-time order snapshots; current catalog rename/reassignment cannot rewrite historical reporting. Missing legacy classification stays explicit rather than guessed.
11. **Reseller semantics.** Reseller reporting combines interval sales/receipts/order counts with closing balance/open debt as of the interval end and must communicate that distinction.
12. **PDF parity.** PDF section options affect presentation only. The PDF may not recalculate money independently from `FinancialReport`.
13. **Read-only boundary.** D-034 introduces no database migration, financial mutation, Auth/RLS change, recovery exception, automatic Vercel deployment or `main` publication.

### Acceptance evidence

PR #85 feature head `0ad69e0a8e8eeb9e92c56cb39ec4b8489bb97fd1` passed D-019 on GitHub Actions merge ref `897ca59793342b29300cee0d57be92fdba1ebd68`, run/job `33001910986` / `98285660448`: ESLint 0 errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; TypeScript + production Vite build PASS.

The validated merge-ref tree was `124767ee7afa23c0c07e7215513fa5b90d8177a5`. PR #85 was squash-integrated into `develop` as `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`, whose tree is exactly `124767ee7afa23c0c07e7215513fa5b90d8177a5`. Exact tree equivalence: PASS.

The post-integration D-034 canonical closure is documentation-only.

## D-035 — Dashboard + Reports form one core decision system with separate operational/analytical roles
**Status:** ACCEPTED / PRODUCT CONTRACT AUTHORIZED  
**Date:** 2026-08-27

### Trigger

After the early-use usability queue closed, the operator requested a full efficiency audit of the existing Dashboard and then explicitly accepted a second-pass redesign direction treating Dashboard and Reports as the heart of the business-management experience.

### Accepted contract

1. **Dashboard mission.** In roughly 10 seconds, the operator should understand current business position, recent activity, aged-risk exceptions and the next useful action.
2. **Reports mission.** Period-controlled comparison, trend and product/category/reseller investigation belong in the dedicated Reports workspace, with PDF parity retained.
3. **No #16.** This is a new `DR-*` initiative, not an extension of the historical numbered early-use queue.
4. **Primary Dashboard KPIs.** Target top-level indicators are `Vendas este mês`, `Recebimentos este mês`, `Carteira em aberto` and `Crítico > 30 dias`; daily values may be compact secondary context rather than permanent standalone cards.
5. **As-of-today position.** Current open debt and aging are reconstructed only through the end of the operator's current local day. Legitimate future `occurredAt` values later than today remain valid under D-014/#15 but do not affect current-position KPIs or aging before their occurrence date.
6. **Aging semantics.** D-015 FIFO allocation and current thresholds remain unchanged: 0–6d recent, 7–30d attention, >30d critical.
7. **Action center.** `Precisa de atenção` uses one reseller per row. Any critical amount makes the reseller critical; otherwise attention applies only when attention-aged debt exists. Ordering is deterministic: severity, oldest determining occurrence, alert amount, name.
8. **Compact aging.** Exact amount + percentage replaces the large donut as the target default presentation; the action center carries the operational priority.
9. **Recent registrations.** A small effective `createdAt`-ordered feed may provide confidence in recently registered orders/payments/signals while keeping `occurredAt` visible when needed; it is not a replacement for audit history.
10. **Quick actions.** Routine order/payment/signal actions reuse the existing transaction route/form rather than creating a parallel write flow.
11. **Dashboard analytical removal.** The configurable 90/180/360 performance block, concentration card, large Pareto chart, current top-debtor card and `Ranking de Inadimplência` are not target permanent Dashboard content.
12. **Analytics are re-homed, not discarded.** Applicable Pareto/concentration/open-balance analysis moves to Reports and must derive from selected-period `FinancialReport` reseller data rather than a competing Dashboard-only calculation path.
13. **Reports refinement.** Target summary emphasis becomes `Vendas`, `Recebimentos`, `Movimento líquido`, `Em aberto no fim`; orders/items become supporting sales context. Previous-period dates should be made explicit when practical, and product/reseller views may gain bounded search/sort/filter controls.
14. **Shared read model first.** Before the major visual redesign, create one coherent read-only Dashboard projection so components do not repeatedly read/reduce the same transactions or implement separate financial interpretations.
15. **Language.** Use `Carteira em aberto` for positive current receivable position; avoid equating every positive balance with `inadimplência`; remove `atualizada em tempo real` unless real-time behavior is actually implemented and verified.
16. **One item at a time.** The accepted sequence is `DR-01…DR-09` in `docs/V2/DASHBOARD_REPORTS_SPEC.md`; only `STATUS.md -> NEXT_ACTION` is executable.
17. **Boundaries retained.** No database/schema, financial mutation/accounting, Auth/RLS/recovery weakening, automatic Vercel deployment, `main` publication, legacy import or definitive cutover is implied.

### Sequencing effect

`DR-01` is the product-contract/documentation closure. After it integrates, `DR-02 — canonical Dashboard read-model` becomes the sole current authorized item. The former isolated early-use #14 receipts-today idea is absorbed/superseded by D-035 and must not be implemented standalone.

Detailed target behavior and acceptance criteria: `docs/V2/DASHBOARD_REPORTS_SPEC.md`.

---

# Open decisions

- when/how D-030 unattended off-site recovery proof will be resumed after early-use learning;
- whether a later paid durability mechanism replaces the zero-cost D-030 path;
- whether legacy stable data is ever worth importing after clean-start early use;
- final `main`/stable publication, canonical URL, rollback and decommission policy.