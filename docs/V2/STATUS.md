# Easy V2 — Canonical Status

**Updated:** 2026-08-28  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

> Historical note: the complete canonical status immediately before the bounded transaction-history/operator-attribution refinement is preserved verbatim at `docs/V2/archive/STATUS_pre_transaction_history_audit_20260828.md`. Nothing from that status was discarded; this file is the current operational summary and has precedence when older documents still mention Backup v2 schema 6.

## Current phase

**P10 — Controlled migration and cutover: `IN_PROGRESS`.**  
**P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS`.**  
**P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.**

Current P10-S3 state:

- P10-S3-I1 — Supabase foundation: `DONE / ACCEPTED — SYNTHETIC FOUNDATION`.
- P10-S3-I2 — migration/reconciliation + durability contract: `DONE / ACCEPTED CONTRACT` — D-030.
- P10-S3-I2-I1 — legacy stable-v1 staging/import compatibility: `DONE / ACCEPTED — SYNTHETIC ONLY`.
- P10-S3-I2-I2 — zero-cost unattended backup/recovery proof: `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.
- P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / ACCEPTED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031.
- P10-S3-I2-I3-C — manual Vercel candidate + operator onboarding: `DONE / ACCEPTED`.
- P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Integrated early-use state

The previously authorized usability/data-quality queue through change #15 is closed. D-035 Dashboard + Reports is also complete through `DR-09`; **no change #16 and no DR-10 are authorized**.

Important integrated milestones remain:

- D-032 / PR #80 — store-global manual Backup v2 checkpoint;
- D-033 / PR #82 — optional subcategories and immutable category/subcategory snapshots;
- D-034 / PR #85 — canonical financial Reports workspace + PDF;
- D-035 / PRs #114, #116, #118, #120, #122, #124, #125, #126 — Dashboard/Reports redesign through final acceptance;
- PR #129 — observed Reports chart-visibility defect fixed and closed during early use;
- **PR #131 — bounded transaction-history/operator-attribution refinement: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #133 — observed transaction-history cell-overflow/layout defect: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #135 — observed transaction-history readability refinement: `DONE / ACCEPTED / INTEGRATED`.**

## PR #131 closure — transaction history + operator attribution

The operator explicitly authorized this bounded early-use refinement and explicitly declined a broader general audit for now. It is **not** D-035 `DR-10`, early-use change #16, D-030 resumption or a general audit subsystem.

Accepted product behavior:

- Dashboard no longer renders the recent-launch list; it stays focused on operational summary/action context.
- `/transactions` is the canonical `Lançamentos` workspace with `Nova Movimentação` plus `Histórico de Lançamentos`.
- History supports practical search plus filters for movement type, effective/corrected/reversed state, operator, and one date interval selectable between registration time and occurrence time.
- Desktop uses a table and mobile uses cards; correction/reversal links remain visible.
- Existing historical rows without actor attribution are displayed as `Não registrado`; no actor is fabricated retrospectively.
- New hosted transaction creation records the authenticated operator on the server.
- Hosted reversal/correction records the authenticated operator on the server; the browser does not choose or submit actor identity.
- Auth/RLS/active `easy_operators`, D-014 occurrence semantics, reversal-zero-effect behavior, D-015 FIFO aging, immutable classification snapshots and existing correction/reversal semantics remain intact.

Persistence/recovery contract after PR #131:

- Supabase/Postgres remains canonical business persistence.
- `public.transactions` now has nullable creation/reversal actor identity snapshots (`*_user_id`, `*_email`).
- Public transaction RPC signatures remain backward compatible; actor identity is derived from `auth.uid()` / JWT claims inside PostgreSQL.
- Production migrations `20260828135753_transaction_operator_attribution_and_history_backup` and `20260828140038_remove_unused_transaction_actor_indexes` are applied to `easy-v2`.
- Backup format remains **Backup v2**, but the current logical schema is now **schema 7**.
- Schema 7 preserves transaction creation/reversal actors. Supported schema 4/5/6 inputs remain accepted and are normalized without inventing missing actor history; schema 6 continues to preserve subcategories.
- A synthetic database proof exercised creation, reversal and correction/replacement actor attribution inside an intentionally aborted transaction; post-check confirmed zero synthetic operator/transaction rows remained.

Repository acceptance evidence:

- feature head: `71799016d2f90b07b345dc37d8e9180fcd9fbd35`;
- exact GitHub-generated merge ref checked out by Actions: `5441afe3b520a3a302ffbe4a7f64c0a23c0dd764`;
- validated tree: `71c43008df5058b50d49597217f6485637b935fe`;
- D-019 run/job: `33181135877` / `98882307187`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **75 files / 316 tests PASS**;
- Playwright: **20 scenarios completed successfully; 19 passed on first attempt and the pre-existing Reports chart-visibility scenario passed on retry and was reported flaky**;
- TypeScript + production Vite build: **PASS**;
- PR #131 squash-integrated `develop`: `45f318e8fc2f789e884d6e5e9f8eafd443e4f1fe`;
- integrated tree: `71c43008df5058b50d49597217f6485637b935fe` — exact tree equivalence PASS.

No failed Critical QA gate was waived. No automatic Vercel publication occurred. `main` remains `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

Detailed bounded closure: `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_AUDIT.md`.

## PR #133 closure — transaction-history table cell containment

A real early-use screenshot showed long `Detalhe` text visually crossing its desktop table cell and overlaying `Valor`; the same shared table behavior could affect a long `Revendedor` or `Usuário` value.

Root cause and accepted presentation correction:

- the shared table cells default to `white-space: nowrap`; `Detalhe` had a maximum width but no local wrap/overflow override;
- the correction is scoped only to `section[aria-labelledby="transaction-history-title"]`, so unrelated Easy tables retain their existing behavior;
- the desktop history now uses fixed table layout, a 1320 px minimum width and explicit predictable column widths;
- all history cells close overflow so content cannot paint across a neighboring cell;
- `Revendedor`, `Detalhe` and `Usuário` allow safe wrapping, including long uninterrupted content;
- narrower desktop space uses the existing horizontal table scroll instead of compressing fields into overlap;
- mobile history cards are unchanged;
- no persistence, Supabase/Auth/RLS, Backup v2, recovery, financial/history or deployment behavior changed.

Repository acceptance evidence:

- final feature head: `8cedd37044b29986b270b413a222d3b34954c534`;
- exact GitHub-generated merge ref checked out by Actions: `eacf9ea2424509133ac3f9c9d19843121a52fbd2`;
- validated tree: `4a4071a3ef7f347ef54f984a3ed35fab087f2ebf`;
- D-019 run/job: `33184406848` / `98893556145`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **75 files / 316 tests PASS**;
- Playwright: **21 scenarios completed successfully**; the new history-layout regression passed on its first attempt, while the pre-existing Reports chart-visibility scenario passed on retry and remained the only reported flaky scenario;
- TypeScript + production Vite build: **PASS**;
- PR #133 squash-integrated `develop`: `66b9bdad245337efd7e9e040ee503d0673be22c1`;
- integrated tree: `4a4071a3ef7f347ef54f984a3ed35fab087f2ebf` — exact tree equivalence PASS;
- post-integration `develop` Critical QA run/job: `33184663864` / `98894431412` — **PASS**.

The first PR #133 CI iteration exposed only a race in the newly added layout regression: it inspected the page before the asynchronously loaded history section mounted. The test was made deterministic by explicitly waiting for the history section and the full D-019 gate was rerun. No product regression was waived.

No automatic Vercel publication occurred and `main` was not targeted.

Detailed bounded closure: `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_LAYOUT.md`.

## PR #135 closure — transaction-history bounded readability

A second real early-use screenshot after PR #133 confirmed that cross-cell overlap was fixed but `Detalhe` could still remain effectively unreadable because the real desktop row rendered variable text as a single clipped line.

Root cause and accepted presentation correction:

- the shared `TableCell` component carries the Tailwind utility `whitespace-nowrap`;
- PR #133's scoped base-layer CSS correctly closed overflow but could still lose the white-space cascade to the real component utility; its synthetic browser fixture did not include the real `TableCell` utility classes;
- PR #135 moves the override into the actual history component so `cn()`/`twMerge` resolves `whitespace-normal` against the shared default deterministically;
- `Detalhe` now shows up to two desktop lines with `line-clamp-2`, safe word breaking and the complete value available through native hover `title`;
- `Revendedor` follows the same two-line + full-hover contract;
- `Usuário` preserves separate `Registrado` and optional `Corrigido`/`Estornado` lines, with each long actor value safely truncated and fully available on hover;
- `Valor` stays non-wrapping/tabular, `Situação` stays stable, and the PR #133 no-overlap/horizontal-scroll contract remains intact;
- mobile history cards remain full-content and unchanged;
- no persistence, Supabase/Auth/RLS, Backup v2, recovery, financial/history or deployment behavior changed.

Repository acceptance evidence:

- final feature head: `ece16ffc94b2b383c97ccdd9c0ae8699a7a3c13f`;
- exact GitHub-generated merge ref checked out by Actions: `d06f4108cfae6ef82d4d366d362cf13f6e5cd894`;
- validated tree: `b92e86e942c94b3dbb2c339ebdf1cda7abede066`;
- D-019 run/job: `33186980363` / `98902403708`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **75 files / 317 tests PASS**;
- Playwright: **21/21 PASS on first attempt**;
- TypeScript + production Vite build: **PASS**;
- PR #135 squash-integrated `develop`: `eec8c9363195aa7bd38ce28f0549585d5e50e5d9`;
- integrated tree: `b92e86e942c94b3dbb2c339ebdf1cda7abede066` — exact tree equivalence PASS;
- post-integration `develop` Critical QA run/job: `33187306207` / `98903523909` — **PASS**.

No failed gate was waived. No automatic Vercel publication occurred and `main` remains untouched.

Detailed bounded closure: `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_READABILITY.md`.

## Governing decisions and invariants

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 defines the temporary store-global manual JSON checkpoint. D-033 defines the shallow category/subcategory model. D-034 defines one canonical read-only financial-report model shared by screen and PDF. D-035 defines Dashboard and Reports as one core decision system with separate operational and analytical roles; `DR-01…DR-09` is complete.

Current invariants:

1. Supabase/Postgres is canonical business persistence.
2. Supabase Auth + RLS + active `easy_operators` authorization remain mandatory.
3. Hosted-cloud recovery health is store-global; the latest confirmed real Backup v2 must remain strictly younger than 24 hours for normal writes.
4. The database enforces the recovery boundary and the browser fails closed when cloud recovery health cannot be verified.
5. D-030 remains ON HOLD/not accepted and definitive cutover is not authorized.
6. `main` remains untouched; Vercel publication remains manual while the candidate is in controlled early use.
7. Catalog classification is `category -> optional subcategory -> item`, exactly one optional subcategory level.
8. Financial/classification history uses immutable transaction-time snapshots and D-014 occurrence-time semantics; later catalog edits do not rewrite history.
9. Reversed transactions have zero effective financial/reporting effect while remaining audit-visible.
10. **Backup v2 schema 7 is current; schema 4/5/6 remain supported inputs and missing historical actors are never invented.**
11. Transaction actor attribution is server-derived from the authenticated session; client-selected actor identity is not trusted.
12. The financial report screen and PDF consume the same canonical `FinancialReport` model.
13. Current-position Dashboard metrics are as-of the operator's current local day; later future occurrence dates do not affect current debt/aging before occurrence.
14. No general audit subsystem is authorized by PR #131; audit expansion to catalog/reseller/other entity edits requires a new explicit operator instruction.

## Recovery checkpoint state

The D-032 store-global exact-24h recovery guard remains operational and was not bypassed for PR #131, PR #133 or PR #135.

During the PR #131 work, the latest confirmed real Backup v2 export was observed at `2026-08-27 12:57:03.459119+00`, and at `2026-08-28 13:56:41.296122+00` the server reported it as **not fresh**. Therefore normal hosted business writes remain correctly blocked until the operator exports a new Backup v2 and explicitly confirms that the file has been stored outside Easy.

The PR #131 schema migration itself was applied as database maintenance; the synthetic attribution proof was rolled back and did not bypass the normal hosted-write guard. PR #133 and PR #135 are presentation/test only and do not alter recovery health.

This still does not satisfy D-030 unattended off-site automation/retention/restore-drill acceptance.

## D-035 status

**D-035 Dashboard + Reports core redesign: `DONE / ACCEPTED / INTEGRATED — DR-01…DR-09 COMPLETE`.**

The accepted split remains:

- Dashboard = glance/action surface;
- Reports = period-controlled analytical surface;
- the legacy Dashboard performance block remains removed;
- contextual handoff to Reports remains explicit;
- no `DR-10` exists or is authorized.

The recent-registration list originally added in DR-06 was later removed from Dashboard by the explicitly authorized PR #131 refinement and re-homed into the canonical `Lançamentos` history workspace. DR-06 quick actions remain valid; this does not reopen D-035. PR #133 and PR #135 only correct containment/readability in the resulting history table and likewise do not reopen D-035.

## Startup protocol for a new conversation

Read in this exact order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`
8. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_AUDIT.md`
9. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_LAYOUT.md`
10. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_READABILITY.md`

Read `docs/V2/DASHBOARD_REPORTS_SPEC.md` only when investigating D-035 historical design/acceptance evidence. The complete pre-PR131 status snapshot is available at `docs/V2/archive/STATUS_pre_transaction_history_audit_20260828.md` when deeper historical reconstruction is required.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current focused closure/spec documents named by `STATUS.md`;
4. current `BACKLOG.md`;
5. older phase execution/history documents.

## NEXT_ACTION

**No new bounded implementation item is authorized. Continue P10-S3-I2-I3-D controlled clean-start early-use observation under D-031/D-032. Before any normal hosted business write, export a fresh Backup v2 and explicitly confirm that it was stored outside Easy so the store-global checkpoint is again strictly younger than 24 hours. Act only on new observed evidence or explicit operator instruction, reconstructing state through the canonical startup protocol before any future change. Preserve Supabase/Auth/RLS/operator authorization, server-derived transaction actor attribution, D-014 occurrence semantics, reversal-zero-effect behavior, D-015 FIFO aging, immutable historical classification snapshots and canonical screen/PDF report parity. Do not expand PR #131 into a general audit subsystem, invent `DR-10` or early-use change #16, automatically resume D-030/I2-I2, import legacy real-store data, automatically deploy, modify/publish `main` or claim definitive cutover.**
