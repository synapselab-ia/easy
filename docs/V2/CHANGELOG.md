# Easy V2 — Changelog

This changelog records material project-state changes. Detailed older implementation history remains available in Git/PR history and phase-specific execution documents.

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