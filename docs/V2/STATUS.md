# Easy V2 — Canonical Status

**Updated:** 2026-09-09  
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

The previously authorized usability/data-quality queue through change #15 is closed. D-035 Dashboard + Reports is also complete through `DR-09`; **no change #16 and no DR-10 are authorized**. New bounded work may still be authorized by a later explicit operator instruction without extending either closed sequence.

Important integrated milestones remain:

- D-032 / PR #80 — store-global manual Backup v2 checkpoint;
- D-033 / PR #82 — optional subcategories and immutable category/subcategory snapshots;
- D-034 / PR #85 — canonical financial Reports workspace + PDF;
- D-035 / PRs #114, #116, #118, #120, #122, #124, #125, #126 — Dashboard/Reports redesign through final acceptance;
- PR #129 — observed Reports chart-visibility defect fixed and closed during early use;
- **PR #131 — bounded transaction-history/operator-attribution refinement: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #133 — observed transaction-history cell-overflow/layout defect: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #135 — observed transaction-history readability refinement: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #137 — observed reseller-statement PDF issue-date refinement: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #139 — observed continuous/repeated transaction-entry refinement: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #142 — explicitly authorized operator-scoped visual personalization: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #144 — explicitly authorized operator-scoped decorative-image selection: `DONE / ACCEPTED / INTEGRATED`;**
- **PR #147 — explicitly authorized operator-scoped visual layout controls: `DONE / ACCEPTED / INTEGRATED`.**

The PR #142 / PR #144 / PR #147 personalization line is a sequence of separate bounded presentation refinements outside the closed numbered early-use queue and D-035. They do not create early-use change #16, reopen D-035 or create `DR-10`.

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

## PR #137 closure — reseller statement PDF issue date

A real early-use collection workflow showed that the reseller statement PDF identified the selected financial period but not when that specific account/PDF was generated.

Accepted presentation behavior:

- every reseller statement PDF now shows `Emitido em: dd/mm/aaaa` using the operator/browser local date at generation time;
- when a range is selected, `Período` remains a separate line and continues to mean only the D-014 financial occurrence interval included in the statement;
- the issue date does not participate in transaction selection, opening balance, order/payment totals or closing-balance calculation;
- only header/table vertical spacing changed;
- no persistence, Supabase/Auth/RLS, Backup v2, recovery, financial semantics, correction/reversal behavior or deployment behavior changed.

Repository acceptance evidence:

- final feature head: `e3876c713e93356170a72d58b0ea51188f9730d2`;
- exact GitHub-generated merge ref checked out by Actions: `92b8793f6a258afab4459fc609258efcc8f3eebb`;
- validated tree: `a2d34910ae6ad3cee847a63c558b6ebcfbd5b35f`;
- D-019 run/job: `33760682855` / `100665933092`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **76 files / 319 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #137 squash-integrated `develop`: `9b3bb2f560787f099345c618c9dcd1f269ec772e`;
- integrated tree: `a2d34910ae6ad3cee847a63c558b6ebcfbd5b35f` — exact tree equivalence PASS;
- post-integration `develop` Critical QA run/job: `33761058376` / `100667188524` — **PASS**.

The first PR #137 D-019 attempt exposed only a stale test expectation for the old table start position. The production implementation and dedicated emission-date regression were already correct; the expectation was aligned with the independent `Emitido em` + `Período` lines and the full gate was rerun. No failed gate was waived.

No automatic Vercel publication occurred and `main` remains untouched.

Detailed bounded closure: `docs/V2/P10_EARLY_USE_RESELLER_PDF_ISSUE_DATE.md`.

## PR #139 closure — continuous transaction entry

A real early-use entry workflow exposed avoidable repetition when many consecutive launches shared the same reseller and other common values. PR #139 keeps the canonical `TransactionForm` and existing persistence path while adding an explicit continuation mode.

Accepted behavior:

- `Salvar e concluir` performs the normal save and resets the sequence safely;
- `Salvar e adicionar outro` saves through the same mutation path and prepares the existing form for the next launch;
- `Manter no próximo lançamento` exposes compact accessible retention controls;
- `Revendedor`, `Tipo` and `Data` are retained by default;
- `Item`, `Quantidade` and `Preço` can be retained for orders; `Valor` can be retained for payment/signal; `Observação` can be retained explicitly;
- only selected fields survive continuation; cancel/conclude restores safe defaults;
- the existing reseller-context behavior remains supported;
- no validation or catalog eligibility rule is relaxed, including the active-classification requirement for new orders.

Repository acceptance evidence:

- final feature head: `207a04cbb1095b07dc35e26d3c4521727b9ee012`;
- exact GitHub-generated merge ref checked out by Actions: `940b13eb570e430733f5e045fb7af32a6a76e362`;
- validated tree: `51af140eccafcbdee226ebc21ada544a6fd49e2c`;
- D-019 run/job: `33779270951` / `100728639904`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **76 files / 322 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #139 squash-integrated `develop`: `51a99cce00535bd40f6ed24a0373e58cc01b494c`;
- integrated tree: `51af140eccafcbdee226ebc21ada544a6fd49e2c` — exact tree equivalence PASS;
- post-integration `develop` Critical QA run/job: `33779689002` / `100730023526` — **PASS**.

Failed D-019 iterations were diagnosed and corrected, not waived. They exposed stale/broad test selectors affected by the new retention controls, one invalid unclassified-order test fixture, and one pre-existing Reports-chart E2E that still clicked the old `Lançar Movimentação` action. The canonical workflow was restored before the final successful gate and PR #139 contains no net CI-workflow change.

No database/schema, Supabase/Auth/RLS/RPC, actor attribution, Backup v2, recovery, financial/reporting, correction/reversal or deployment behavior changed. No automatic Vercel publication occurred and `main` remains untouched.

Detailed bounded closure: `docs/V2/P10_EARLY_USE_TRANSACTION_CONTINUOUS_ENTRY.md`.

## PR #142 closure — operator-scoped visual personalization

On 2026-09-09 the operator explicitly authorized a bounded presentation/personalization refinement: one designated authenticated operator may opt into a decorative image in Easy while other operators retain the normal interface. The item is now **DONE / ACCEPTED / INTEGRATED**.

Accepted behavior:

- preference is genuinely operator-scoped, cross-session and disabled by default;
- initial eligibility is assigned from database state to the sole active operator, without hardcoding a person's display name, e-mail or UUID in UI logic;
- the eligible operator can explicitly enable/disable the decoration;
- the only presentation modes are `Canto` and low-opacity `Marca d'água`;
- the only intensity presets are bounded `Bem discreta` and `Suave`;
- the implementation reuses `src/assets/hero.png`; no upload, Supabase Storage, gallery or general theme-builder was introduced;
- the image is decorative/non-interactive, behind business content, `aria-hidden`, `pointer-events-none` and `print:hidden`;
- PDFs, reseller statements, backups, exports and print-oriented output remain unchanged;
- ineligible operators and the eligible operator while disabled receive the normal Easy interface.

Persistence/security acceptance:

- production migration `20260909135441_operator_visual_personalization` is applied to `easy-v2`;
- `authenticated` has column-level `UPDATE` only for `visual_personalization_enabled`, `visual_personalization_mode` and `visual_personalization_intensity`;
- `authenticated` cannot update `visual_personalization_allowed`, `is_active` or `user_id`;
- RLS policy `easy_operators_update_visual_preferences` restricts update to the authenticated user's own active, eligible operator row with both `USING` and `WITH CHECK`;
- live post-integration verification found 1 active operator, 1 eligible operator and 0 enabled operators; production remains off until explicitly enabled;
- Supabase advisors produced no new finding attributable to this feature. Existing intentional `SECURITY DEFINER` RPC and leaked-password-protection warnings remain outside this bounded task.

Repository acceptance evidence:

- final feature head: `7462a8a5f235691a8381587429715c22cc2f7242`;
- exact GitHub-generated merge ref checked out by Actions: `c8aa4482eee0364a155d213cac5252dccfedec3c`;
- validated tree: `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd`;
- final PR D-019 run/job: `34360454611` / `102495778094`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 329 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #142 squash-integrated `develop`: `3b3ba1f3eb280a552a806dda0f0752f21900c263`;
- integrated tree: `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd` — exact tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34364762432` / `102510503835` — **PASS**.

No failed gate was waived. No automatic Vercel publication occurred and `main` was not targeted.

Detailed authorization/closure: `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_PERSONALIZATION.md`.

## PR #144 closure — operator decorative-image selection

After PR #142, the operator explicitly clarified that the eligible account must be able to choose the decorative image from inside Easy instead of being permanently tied to the bundled asset. PR #144 is **DONE / ACCEPTED / INTEGRATED**.

Accepted behavior:

- `Personalização visual` now contains a `Sua imagem` section with preview and `Escolher imagem`;
- the eligible operator can choose PNG, JPEG or WebP up to 5 MB;
- exactly one custom object is retained per operator account and selecting another valid image replaces it;
- `Usar imagem padrão` removes the custom object and restores `src/assets/hero.png`;
- the selected custom image follows the operator across browser/device sessions via a private signed URL;
- `Canto`, `Marca d'água`, bounded intensity, explicit enable/disable, decorative/non-interactive behavior and `print:hidden` remain unchanged;
- PDFs, Reports, reseller statements, Backup v2 and other exports remain unchanged;
- no gallery, crop/editor, animation, public media library, page skin or general theme subsystem was introduced.

Persistence/security acceptance:

- production migration `20260909151557_operator_visual_image_selection` is applied to `easy-v2`;
- private bucket `operator-visual-personalization` enforces 5 MiB and MIME allow-list `image/png`, `image/jpeg`, `image/webp`;
- object path is deterministic: `${auth.uid()}/decoration`;
- `storage.objects` RLS policies for `SELECT`, `INSERT`, `UPDATE` and `DELETE` require the same authenticated UUID path plus an active/elegible `easy_operators` row;
- UPDATE has both `USING` and `WITH CHECK` ownership/elegibility predicates;
- no `service_role`, secret key, browser-selected user identity, hardcoded person identity or `SECURITY DEFINER` upload helper was introduced;
- post-migration Supabase advisors showed no new PR #144 security finding; only the pre-existing intentional RPC/leaked-password-protection warnings remain;
- closure inspection found 0 custom image objects, so no operator received a custom image implicitly.

Repository acceptance evidence:

- final feature head: `f1967f37307e6516635cc72ac1a695196efc4f92`;
- exact GitHub-generated merge ref checked out by Actions: `a06ded6f1445e63e6c464819be039db1ad15f4b1`;
- validated tree: `3904c6833fc589478477d7ade60804fc36768621`;
- D-019 run/job: `34369323612` / `102526152622`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 333 tests PASS**;
- focused personalization component coverage: **6/6 PASS**;
- focused personalization service coverage: **5/5 PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #144 squash-integrated `develop`: `d4b59ab733876af1df2d9a294f3668c5f421bc18`;
- integrated tree: `3904c6833fc589478477d7ade60804fc36768621` — exact tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34370060092` / `102528684256` — **PASS**.

No failed D-019 gate was waived; the final gate passed on its first attempt. The custom image is optional presentation state and remains outside Backup v2. Storage absence/failure degrades to the bundled fallback rather than affecting business operation. No automatic Vercel publication occurred and `main` was not targeted.

Detailed authorization/closure: `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_IMAGE_SELECTION.md`.

## PR #147 closure — operator visual layout controls

On 2026-09-09 the operator explicitly authorized the bounded follow-up to make the decorative image easier to place without distracting from daily work. PR #147 is **DONE / ACCEPTED / INTEGRATED**.

Accepted behavior:

- exactly nine fixed viewport anchors: superior esquerda/centro/direita, centro esquerda/centro/direita, inferior esquerda/centro/direita;
- exactly three size presets: `Pequeno`, `Médio`, `Grande`;
- selectable opacity from **5% to 50%** in 5-point increments with the current percentage visible;
- exactly two layer choices: `Atrás do conteúdo` and `Sobre o conteúdo`;
- draft changes preview immediately in `Personalização visual` and only persist when explicitly saved;
- preferences remain operator-scoped and persistent across sessions/devices;
- overlay remains `pointer-events: none`, decorative/assistive-tech-hidden and `print:hidden`;
- custom-image Storage/fallback behavior from PR #144 remains unchanged;
- no free dragging, arbitrary coordinates, rotation, crop/editor, animation, multiple simultaneous images, page-specific skins or general theme builder was introduced.

Persistence/security acceptance:

- production migration `20260909191739_operator_visual_layout_controls` is applied to `easy-v2`;
- only four presentation fields were added to `easy_operators`: position, size, opacity and layer, each database-constrained to the accepted product bounds;
- `authenticated` received column-scoped `UPDATE` only on those new presentation fields; authorization fields remain non-updatable by the browser;
- existing RLS `USING` and `WITH CHECK` still require the authenticated user's own active, eligible operator row;
- no new identity/profile system, `service_role`, secret key, client-selected identity or authorization dependency was introduced;
- Supabase grants, policies and constraints were inspected after migration;
- post-migration security/performance advisors produced no new finding attributable to PR #147; only previously tracked warnings/debts remain.

Repository acceptance evidence:

- final feature head: `40f23539781fce5a3411f7ad8c65744c86e850d5`;
- exact GitHub-generated merge ref checked out by Actions: `6a6c73b0c968480693f04076a214034436c8ac2d`;
- validated tree: `71ae16e75c037fcf777dfb1861b97039a5c999dc`;
- PR D-019 run/job: `34394791333` / `102611692737` — **PASS**;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 338 tests PASS**;
- focused personalization component coverage: **10/10 PASS**;
- focused personalization service coverage: **6/6 PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #147 squash-integrated `develop`: `bd3c899abe8566a02a173ef458544b36f33ff3d2`;
- integrated tree: `71ae16e75c037fcf777dfb1861b97039a5c999dc` — exact validated-tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34395296278` / `102613395781` — **PASS**.

No failed Critical QA gate was waived; the feature gate passed on its first attempt. No automatic Vercel publication occurred and `main` was not targeted.

Detailed authorization/closure: `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_LAYOUT_CONTROLS.md`.

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
15. Operator visual personalization is ornamental only and may not influence authorization, business calculations, transaction behavior, recovery or exported documents.
16. Operator custom decorative images are private account-scoped presentation state, never canonical business data, and must fail safely to the bundled visual fallback.
17. Operator decorative-image layout preferences are bounded account-scoped presentation state only; even `Sobre o conteúdo` remains non-interactive and excluded from print/PDF/export.

## Recovery checkpoint state

The D-032 store-global exact-24h recovery guard remains operational and was not bypassed for PR #131, PR #133, PR #135, PR #137, PR #139, PR #142, PR #144 or PR #147.

The latest observed real Backup v2 recovery events on 2026-09-09 are:

- export: `2026-09-04 14:36:06.332805+00`;
- confirmation: `2026-09-04 14:36:14.282849+00`.

As of 2026-09-09 the confirmed checkpoint is older than the accepted strict `<24h` window. Therefore normal hosted business writes remain correctly fail-closed until the operator exports a fresh Backup v2, stores it outside Easy and explicitly confirms it.

The PR #131 schema migration itself was applied as database maintenance; the synthetic attribution proof was rolled back and did not bypass the normal hosted-write guard. PR #133, PR #135 and PR #137 are presentation/test only. PR #139 changes only the existing transaction-entry UI/session behavior and tests. PR #142 adds a bounded operator preference. PR #144 adds only private optional Storage presentation state. PR #147 adds only bounded operator presentation preferences. None of PR #142, PR #144 or PR #147 bypasses, refreshes or satisfies recovery health.

This still does not satisfy D-030 unattended off-site automation/retention/restore-drill acceptance.

## D-035 status

**D-035 Dashboard + Reports core redesign: `DONE / ACCEPTED / INTEGRATED — DR-01…DR-09 COMPLETE`.**

The accepted split remains:

- Dashboard = glance/action surface;
- Reports = period-controlled analytical surface;
- the legacy Dashboard performance block remains removed;
- contextual handoff to Reports remains explicit;
- no `DR-10` exists or is authorized.

The recent-registration list originally added in DR-06 was later removed from Dashboard by the explicitly authorized PR #131 refinement and re-homed into the canonical `Lançamentos` history workspace. DR-06 quick actions remain valid; this does not reopen D-035. PR #133 and PR #135 only correct containment/readability in the resulting history table and likewise do not reopen D-035. PR #137 is confined to the reseller statement PDF and does not reopen D-035. PR #139 is an explicitly authorized transaction-entry usability refinement and likewise does not reopen D-035 or create `DR-10`/early-use change #16. PR #142, PR #144 and PR #147 are separate bounded presentation refinements and likewise do not reopen D-035.

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
11. `docs/V2/P10_EARLY_USE_RESELLER_PDF_ISSUE_DATE.md`
12. `docs/V2/P10_EARLY_USE_TRANSACTION_CONTINUOUS_ENTRY.md`
13. `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_PERSONALIZATION.md`
14. `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_IMAGE_SELECTION.md`
15. `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_LAYOUT_CONTROLS.md`

Read `docs/V2/DASHBOARD_REPORTS_SPEC.md` only when investigating D-035 historical design/acceptance evidence. The complete pre-PR131 status snapshot is available at `docs/V2/archive/STATUS_pre_transaction_history_audit_20260828.md` when deeper historical reconstruction is required.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current focused closure/spec documents named by `STATUS.md`;
4. current `BACKLOG.md`;
5. older phase execution/history documents.

## NEXT_ACTION

**Continue `P10-S3-I2-I3-D` controlled clean-start early-use observation on the accepted `develop` candidate. Do not implement new behavior unless a new real observation or explicit operator instruction authorizes a bounded change. Before any normal hosted business write, the stale D-032 recovery checkpoint still requires a fresh Backup v2 to be exported, stored outside Easy and explicitly confirmed. D-030 / I2-I2 remains on hold; do not import legacy real-store data, create early-use change #16 or `DR-10`, automatically deploy Vercel, modify/publish `main` or claim definitive cutover.**