# Easy V2 — Changelog

This changelog records material project-state changes. Detailed older implementation history remains available in Git/PR history and phase-specific execution documents.

## 2026-08-27 — change #9 practical item/reseller list search and filters integrated

Early-use change #9 verified that the item catalog had no list search/filter controls and the reseller page searched only by name without lifecycle filtering. PR #100 added bounded transient list ergonomics over data already loaded by the existing hooks.

Items now support accent/case-insensitive name search combined with category, category-scoped optional subcategory and lifecycle filters. Legacy/unresolved current-catalog items can be isolated as `Sem classificação` without fabricated data. Revendedores now support accent/case-insensitive search across existing name, phone and email fields plus lifecycle filtering. `Limpar filtros` restores the full list, and a filtered-empty catalog is distinguished from a truly empty catalog.

No database/schema migration, Supabase/API/policy change, fuzzy identity inference, destructive bulk action, lifecycle/history, financial/recovery, Auth/RLS or deployment behavior changed.

Final D-019 on PR #100: head `df6efcee47d6a43941cbdbd273ec95bb93f56059`, merge ref `e0eba21d9a695be4b7bab918c8faa72de060039b`, run/job `33086388558` / `98567054353`: repository Critical QA (`lint + Vitest + Playwright + production build`) PASS. Validated tree: `83e27d1d63685eee1a4ae6bc751b30e8dccba786`.

PR #100 was squash-integrated into `develop` as `b6d92db102d7ba17b920e8c41282a5075697bc04`; its Git tree is also `83e27d1d63685eee1a4ae6bc751b30e8dccba786`. Exact tree equivalence: PASS. No automatic Vercel deployment or `main` publication occurred. Change #9 is closed and change #10 is now the sole current authorized queue item.

---

## 2026-08-27 — change #8 catalog classification context integrated

Early-use change #8 verified that current category/optional-subcategory context was absent at the two authorized points of use: the item catalog and new-order item selection. PR #98 introduced a bounded current-catalog resolver and presentation changes only.

The item catalog now shows current category plus optional subcategory on desktop and mobile. New-order item options show the same path alongside the existing price, and the selected item retains classification context. Legacy or unresolved current-catalog references render `Sem classificação` rather than receiving guessed classification. The item selector continues to search by item name only, so change #9 search/filter scope was not bundled.

D-025/D-033 immutable transaction-time classification snapshots and order mutation/history semantics remain unchanged. No database/schema migration, Supabase/Auth/RLS, recovery or deployment behavior changed.

Final D-019 on PR #98: head `66026aa340f3b9aba1e8692f11d51ee751a8778b`, merge ref `2d3ab8ba9ff0af179337eb7654b7bfddb5f5a24f`, run/job `33082398941` / `98552849392`: repository Critical QA PASS; 65 files / 276 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `01bef29624079f90a8b1b0089c183abc26f96149`.

PR #98 was squash-integrated into `develop` as `2c9d67221e3365b9476a95947906a6f4c21ecc7f`; its Git tree is also `01bef29624079f90a8b1b0089c183abc26f96149`. Exact tree equivalence: PASS. No automatic Vercel deployment or `main` publication occurred. Change #8 is closed and change #9 is now the sole current authorized queue item.

---

## 2026-08-27 — searchable entity selectors integrated before change #8

Before starting early-use change #8, the operator explicitly kept the ordered queue paused for a second bounded usability refinement: large variable selectors should allow direct text search instead of requiring long manual scrolling. PR #96 introduced one reusable searchable combobox using the project's existing `cmdk` infrastructure.

Search now matches substrings, is case-insensitive and accent-insensitive. Typed search text remains transient UI state; selecting an option continues to return the existing entity ID, so no free-form value or new persistence contract is introduced. The searchable control is used for reseller/item selection in new transaction entry, reseller/item selection in full transaction correction, and category/optional-subcategory selection in item create/edit. Small closed-list selectors such as transaction type and period/window choices remain unchanged.

The first D-019 attempt exposed seven stale tests that still modeled the affected fields as native `<select>` controls. After those test assumptions were aligned, the second attempt exposed two remaining ambiguous test queries because two searchable selectors correctly coexist on the transaction screen. Those two tests were changed to target the reseller field by label. Neither objective failure was waived and no product behavior was weakened to satisfy CI.

Final D-019 on PR #96: head `95be7dac0bc5db87c21fc45ac6fb0303084d70ae`, merge ref `ea1b93339b8356b9a2386b26fffc878428829d0d`, run/job `33079397875` / `98542140423`: 0 lint errors / 98 warnings; 64 files / 272 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `569b7a7b760ba333b124094f159488b5b99fc92e`.

PR #96 was squash-integrated into `develop` as `20dcc0fb7469db8ae9638ab6ef39b38ca7e2ec97`; its Git tree is also `569b7a7b760ba333b124094f159488b5b99fc92e`. Exact tree equivalence: PASS. No database/Supabase, financial/history, Auth/RLS, recovery, automatic Vercel deployment or `main` publication change occurred. Change #8 was not started and remains the next authorized action.

---

## 2026-08-27 — reseller statement PDF simplified for client reading

Before starting early-use change #8, the operator explicitly paused the ordered queue to refine the reseller statement PDF. PR #94 preserved the existing grouped-product behavior and the individual written names/observations below each grouped product while simplifying the document around the information a client needs.

Reversed orders, payments and signals are now omitted from the PDF only; the underlying immutable audit history remains intact. Reversal/correction/replacement annotations are no longer printed. A corrected movement therefore presents only its effective replacement in the client-facing document.

The financial closing now appears immediately after the product table as `Total dos pedidos`, `Saldo anterior`, `(-) Total de pagamentos` and `SALDO ATUAL`. For selected periods, `Saldo anterior` remains the canonical balance strictly before the range start, while period totals use effective occurrence-time orders and payments/signals. The detailed `Pagamentos e sinais` table remains available after the closing only when at least one effective settlement exists and is reduced to `Data`, `Tipo`, `Valor`.

Final D-019 on PR #94: head `a854cc6417f13ff9a82a9ded97f9681e36a8c718`, merge ref `9d7c067172c7146c27c36acf3390068da622e3d2`, run/job `33073644514` / `98522073542`: 0 lint errors / 83 warnings; 63 files / 269 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a`.

PR #94 was squash-integrated into `develop` as `a2283d0a9408730e8cb136fdfe602d76a05cfa7a`; its Git tree is also `25ff7654c57368f1cb7c02cefc7a2a8c13cc3b7a`. Exact tree equivalence: PASS. No database/Supabase, Auth/RLS, recovery, automatic Vercel deployment or `main` publication change occurred. Change #8 was not started and remains the next authorized action.

---

## 2026-08-27 — pt-BR monetary presentation standardized

Early-use change #7 standardized bounded operator-facing money presentation without changing the underlying financial model. After reverting the earlier currency-style formatter attempt, PR #92 used a simpler stable representation: literal `R$ ` plus the numeric value formatted with pt-BR separators and exactly two decimals. Visible values therefore render as `R$ 150,00`, `R$ 1.200,50`, `R$ 10.000,00`, etc.

The change covers reseller balances/period summaries, catalog prices and the read-only calculated total during order entry, monetary values in the transaction-correction dialog and reseller statement PDF values. Editable numeric inputs, parsing, calculations, rounding, persistence, transaction/history semantics and report accounting semantics remain unchanged.

The first D-019 after simplification failed only because two existing tests still expected dot-decimal strings. GitHub Actions logs identified those exact stale expectations in `ResellerDetailPage.statement.test.tsx` and `pdfService.occurrence.test.ts`; only the assertions were aligned to the accepted comma-decimal presentation. No correct product formatting was reverted to satisfy CI.

Final D-019 on PR #92: head `7aea7fca077e552d66bf8bc018f3fa4b49eea423`, merge ref `a094ba30b968b9b5658809503803440b8cf27736`, run/job `33070649544` / `98511710752`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `f973d83aa8116fef7254dd056a5c5e99debbf063`.

PR #92 was squash-integrated into `develop` as `3f9bafca186951f363c20e990a791a771a4cf35d`; its Git tree is also `f973d83aa8116fef7254dd056a5c5e99debbf063`. Exact tree equivalence: PASS. No automatic Vercel deployment, Supabase/database change or `main` publication occurred.

---

## 2026-08-26 — Dashboard performance-window selected labels localized

Controlled early-use verification confirmed that the Dashboard `Análise de Performance` selector used internal `AnalysisPeriod` values (`90`, `180`, `360`) without the explicit Base UI value/label mapping already accepted for the Reports selector.

PR #90 adds one shared option list and supplies it to the Select, so the closed trigger now resolves `Últimos 90 dias`, `Últimos 180 dias` and `Último ano` while the internal values and analysis-window calculations remain unchanged.

This correction changes presentation only. Analytics semantics, database/Supabase state, Auth/RLS, recovery behavior and deployment policy are unchanged.

Final D-019 on PR #90: head `34728fcdb0016dea1481ab795317de223b7c9a10`, merge ref `fdfd8771589e428f219afb1b6dd1597b8f2fb64d`, run/job `33009642945` / `98312276753`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `f872da2c6adf492a929bd5ef02ad7a1c695a4672`.

PR #90 was squash-integrated into `develop` as `446987475bf8621ff7ec5803149c4c6b874d5e50`; its Git tree is also `f872da2c6adf492a929bd5ef02ad7a1c695a4672`. Exact tree equivalence: PASS. No automatic Vercel deployment occurred and `main` remains untouched.

---

## 2026-08-26 — Report period selected labels localized

Controlled early-use observation found a presentation defect in the financial-report period selector: menu choices were Portuguese, but after selection Base UI rendered the internal preset identifier (`week`, `month`, etc.) in the closed trigger.

PR #87 keeps those stable internal identifiers but adds an explicit value/label mapping to the selector, so the visible selected values are now `Hoje`, `Esta semana`, `Este mês`, `Mês passado`, `Este ano` and `Personalizado`.

This correction changes presentation only. Report ranges, occurrence-time accounting, database/Supabase state, Auth/RLS, recovery behavior and deployment policy are unchanged.

Final D-019 on PR #87: head `ae0ecee51e0296ab4b132892ec626abe64164204`, merge ref `57ac8137673f3826cfe6a2b17a68795050d2e1b2`, run/job `33005354591` / `98297566705`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `ae183953e9f9248cab7ebc107fae57723ccb8aa4`.

PR #87 was squash-integrated into `develop` as `430b36feb7563c3370a334eb4962edc7aafdc117`; its Git tree is also `ae183953e9f9248cab7ebc107fae57723ccb8aa4`. Exact tree equivalence: PASS. No automatic Vercel deployment occurred and `main` remains untouched.

---

## 2026-08-26 — D-034 financial reports workspace integrated

Controlled early-use feedback requested a report area that is useful for analysis and can produce a presentable financial PDF without creating a second accounting interpretation separate from the application.

D-034 / PR #85 delivered:

- dedicated `Relatórios` navigation/workspace;
- period presets (`Hoje`, `Esta semana`, `Este mês`, `Mês passado`, `Este ano`) plus custom interval;
- sales, receipts, report-end open-debt and order KPIs;
- comparison with the immediately preceding equal-length period;
- sales/receipts timeline by financial occurrence date;
- `Resumo`, `Produtos e categorias` and `Revendedores` report views;
- category -> subcategory drilldown using immutable transaction-time classification snapshots;
- reseller period activity combined with closing open debt as of the report end date;
- configurable financial PDF generated from the same canonical `FinancialReport` object used by the screen.

The report domain explicitly distinguishes period movement from closing debt: sales and receipts describe the selected interval, while `Em aberto no fim` reconstructs all effective reseller history through the selected end date and sums positive balances. Reversed transactions retain audit history but contribute zero to effective report totals.

D-034 is read-only and introduced no database migration, Supabase write/API change, recovery-boundary change, Auth/RLS change or deployment automation.

Final D-019 on PR #85: head `0ad69e0a8e8eeb9e92c56cb39ec4b8489bb97fd1`, merge ref `897ca59793342b29300cee0d57be92fdba1ebd68`, run/job `33001910986` / `98285660448`: 0 lint errors / 83 warnings; 63 files / 268 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `124767ee7afa23c0c07e7215513fa5b90d8177a5`.

PR #85 was squash-integrated into `develop` as `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`, also with tree `124767ee7afa23c0c07e7215513fa5b90d8177a5`. Exact tree equivalence: PASS. Canonical closure is documentation-only. `main` remains untouched and no automatic Vercel deployment occurred.

---

## 2026-08-26 — D-033 optional subcategories integrated

Controlled early-use feedback produced an explicit catalog requirement: categories such as `Porcelana` need one optional subdivision so distinct product groups can be organized without creating an arbitrarily deep hierarchy.

D-033 / PR #82 delivered:

- `category -> optional subcategory -> item` as the bounded classification model;
- `public.subcategories` with stable identity, category parent, lifecycle, RLS and recovery-write guard;
- optional item subcategory constrained to the same selected category;
- active-reference/archive integrity for category/subcategory/item relationships;
- expandable subcategory management in the category UI;
- category plus filtered optional subcategory selection in the item form;
- transaction-time subcategory id/name snapshots alongside category snapshots;
- D-026 correction semantics extended to preserve same-item historical snapshots and capture target-item classification when the item changes;
- Dexie schema 6/cache parity;
- Backup v2 schema 6 including subcategories and related references/snapshots;
- schema 4/5 import compatibility without invented subcategory data.

Production migration `20260826135708_i3d_subcategories` is applied and additive/retrocompatible.

A live synthetic Supabase transaction proof verified valid order snapshot capture, invalid category/subcategory-pair rejection and prevention of archiving a subcategory referenced by an active item. The proof rolled back; all synthetic category/subcategory/item/reseller/transaction residue returned to zero.

Security review confirmed the new subcategory table remains RLS-protected. Supabase Advisor also reports authenticated `SECURITY DEFINER` warnings for intentionally exposed transaction/restore RPCs; explicit privilege proof confirms `anon`/`public` cannot execute them while authenticated approved operators remain internally enforced.

D-019 passed on head `b8a6c947bad5d2ba7432f2ffa13b3df32cf44dcd`, merge ref `75fb65b3179549af0cb29618f282d9edc70e663a`, run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. Validated tree: `5127a5a558b990f587b6427a605c5207e6573b9e`.

Before integration, final PR #82 merge ref `e9dc4cca9d6d1b843904d065ce7f9cf6289cdffd` had that exact same tree. PR #82 was squash-integrated into `develop` as `5a487b93d5c632f5990b8a261e4a62a6a196f186`, also with tree `5127a5a558b990f587b6427a605c5207e6573b9e`. Exact tree equivalence: PASS.

Canonical closure is documentation-only.

---

## 2026-08-26 — D-032 real rollout completed

The previously integrated store-global recovery mechanism is now operational rather than only repository/database-ready:

- the accepted D-032-containing `develop` candidate was manually published to Vercel;
- a fresh real Backup v2 was exported from the updated candidate;
- the operator stored it outside Easy and explicitly confirmed the copy;
- the production global recovery ledger therefore has a real confirmed checkpoint shared by approved devices.

The exact-24h D-032 early-use guard is active. This does not satisfy D-030 unattended off-site retention/restore-drill acceptance.

---

## 2026-08-25 — D-032 makes hosted manual recovery store-global

D-032 replaced the hosted per-browser recovery clock with a Supabase-backed append-only global export/confirmation ledger. Approved devices share the latest confirmed checkpoint; normal writes fail closed at age `>= 24h`; local/no-cloud behavior remains unchanged. Migration `20260825191150_global_manual_recovery_checkpoint` was applied and transactionally proven with rollback.

Final PR #80 exact-tree D-019: run/job `32891655554` / `97944738069`; 0 lint errors / 82 warnings; 59 files / 251 Vitest PASS; 17/17 Playwright PASS; build PASS. PR #80 integrated with exact tree equivalence.

---

## 2026-08-25 — I3-D reseller PDF grouped by product

PR #79 changed reseller PDF presentation from raw movement lines to grouped equal products with summed quantities/subtotals, observations directly below each grouped product and payments/signals in a separate section. Financial persistence/history semantics were unchanged.

Final D-019 run/job `32885324610` / `97924299040`; 0 lint errors / 82 warnings; 57 files / 242 Vitest PASS; 17/17 Playwright PASS; build PASS. Integrated to `develop` with tree equivalence.

---

## 2026-08-25 — Candidate onboarding accepted; controlled clean-start early use enabled

The intended real operator was onboarded through Supabase Auth + `easy_operators`; a separate authenticated non-approved identity was denied; approved operator access to the clean canonical dataset passed; manual Vercel candidate publication passed; and the initial manual recovery workflow was exercised. No legacy real-store data was imported.

---

## 2026-08-21 — D-031 authorizes runtime-first sequencing

The operator explicitly placed D-030 trusted-PC/off-site evidence on hold and authorized the Supabase-backed candidate for controlled clean-start early use with manual JSON recovery, Auth/RLS/allow-list controls, manual Vercel publication and untouched `main`.

Runtime-first PR #72 and governance PR #74 passed D-019 and were integrated.

---

## 2026-08-20 — D-030 zero-cost durability contract

D-030 established the stronger definitive-cutover durability requirement: unattended trusted-PC logical dumps, verified off-site storage, retained successful daily generations, exact-24h server-visible enforcement and restore drills. Tooling was implemented/synthetically proven, but the real operator-local acceptance remains ON HOLD under D-031.

---

## 2026-08-20 — D-029 selects Supabase/Postgres canonical persistence

D-029 selected Supabase/Postgres + Vercel with Auth/RLS/approved operators, server-atomic financial operations, Dexie as cache/transition and independent logical JSON backup.

---

## 2026-08-19 and earlier

P1–P9 and P10-S1 established reversible lifecycle, audited financial correction, occurrence-date semantics, statement/debt logic, backup/restore hardening, D-024 recovery guard, D-025 category snapshots/reporting, D-026 full-field linked correction and synthetic stable-v1 migration/recovery rehearsal. Detailed history remains in Git and phase-specific V2 documents.