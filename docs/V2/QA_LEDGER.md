# Easy V2 — QA Ledger

**Updated:** 2026-08-26

## Mandatory repository gate — D-019

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block executable integration. Supabase-bearing work additionally requires relevant database/security/policy/advisor evidence.

## Accepted historical baseline

Detailed historical runs remain available in Git/PR history and phase-specific execution records. Key accepted milestones include P9 category/correction/date work, P10-S1 rehearsal, D-029 architecture, P10-S3-I1 Supabase foundation, D-030 contract/tooling, D-031 runtime-first governance/runtime/onboarding, PR #79 grouped reseller PDF, PR #80 D-032 global recovery and PR #82 D-033 subcategories.

D-030 real operator-local unattended/off-site/retention/restore acceptance remains ON HOLD.

## D-032 operational rollout — PASS

The accepted D-032-containing `develop` candidate was manually deployed to Vercel. A fresh real Backup v2 was exported on the updated candidate, stored outside Easy and explicitly confirmed. The production store-global exact-24h recovery checkpoint is therefore operational.

This is early-use recovery evidence, not D-030 durability acceptance.

## D-033 optional subcategories — PASS / INTEGRATED

Production migration `20260826135708_i3d_subcategories` is applied. Live synthetic database proof verified category/subcategory consistency, immutable order snapshot capture and archive protection, then rolled back with zero synthetic residue.

D-019 run/job `32983745854` / `98226501149`: 0 lint errors / 83 warnings; 61 files / 258 Vitest PASS; 17/17 Playwright PASS; production build PASS. PR #82 integrated with exact tree equivalence. Canonical closure was documentation-only.

## P10-S3-I2-I3-D early-use change #4 — D-034 financial reports

### Scope review — READ-ONLY

PR #85 changes only application/reporting code and tests:

- dedicated `/reports` route/menu;
- shared `FinancialReport` calculation model;
- report screen/presets/KPIs/timeline/tabs;
- category -> subcategory and reseller reporting;
- configurable PDF adapter over the same report model;
- unit/integration coverage.

No database migration, Supabase function/policy, business mutation, recovery mechanism or deployment workflow changed.

### Domain/reporting tests — PASS

New coverage verifies:

1. period sales/receipts/order/item aggregation uses effective occurrence-time movements;
2. reversed movements contribute zero;
3. previous-period comparison uses the immediately preceding equal calendar-length range;
4. report-end open debt includes earlier outstanding history rather than confusing it with period net;
5. category/subcategory groups respect immutable transaction snapshots and explicit no-subcategory/legacy behavior;
6. timeline fills the selected short range coherently;
7. financial PDF consumes report sections and supports presentation-only section selection;
8. generated PDF filename includes the selected range;
9. application navigation exposes the Reports workspace.

### D-019 iterations

Initial objective failures were not waived:

- first runs exposed only report-navigation test assumptions;
- after those were corrected, Vitest reached 268/268 and Playwright 17/17 but TypeScript caught an overly narrow Recharts tooltip formatter type;
- that build error was corrected using Recharts contextual formatter types;
- the final frozen merge-ref then passed every objective command.

### Final D-019 — PASS

- feature head: `0ad69e0a8e8eeb9e92c56cb39ec4b8489bb97fd1`;
- exact GitHub-generated merge ref checked out by Actions: `897ca59793342b29300cee0d57be92fdba1ebd68`;
- validated tree: `124767ee7afa23c0c07e7215513fa5b90d8177a5`;
- run/job: `33001910986` / `98285660448`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #85 was squash-integrated into `develop` as `970cceaff9ce359f0ecb559648e38ab6cc7e1bd3`. The integrated commit tree is exactly `124767ee7afa23c0c07e7215513fa5b90d8177a5`, identical to the D-019-validated merge-ref tree. Integrated-tree equivalence: **PASS**.

The post-integration D-034 closure changes Markdown documentation only; no executable/runtime file differs from the validated integrated tree. No failed executable gate was waived.

## P10-S3-I2-I3-D early-use change #5 — localized report period labels

### Scope review — PRESENTATION ONLY

PR #87 changes only `src/pages/ReportsPage.tsx`:

- defines one canonical period-preset value/label list;
- supplies that list to Base UI `Select` so selected values resolve to Portuguese labels;
- reuses the same list for menu entries;
- leaves internal preset identifiers and all period-range calculations unchanged.

No database migration, Supabase function/policy, financial/reporting calculation, recovery mechanism, Auth/RLS boundary or deployment workflow changed.

### Final D-019 — PASS

- feature head: `ae0ecee51e0296ab4b132892ec626abe64164204`;
- exact GitHub-generated merge ref checked out by Actions: `57ac8137673f3826cfe6a2b17a68795050d2e1b2`;
- validated tree: `ae183953e9f9248cab7ebc107fae57723ccb8aa4`;
- run/job: `33005354591` / `98297566705`;
- ESLint: **0 errors / 83 warnings**;
- Vitest: **63 files / 268 tests PASS**;
- Playwright: **17/17 PASS**;
- TypeScript + production Vite build: **PASS**.

PR #87 was squash-integrated into `develop` as `430b36feb7563c3370a334eb4962edc7aafdc117`. Git object inspection confirms the integrated commit tree is `ae183953e9f9248cab7ebc107fae57723ccb8aa4`, exactly the same tree as the validated GitHub merge ref. Integrated-tree equivalence: **PASS**.

The post-integration change #5 closure is documentation-only. No failed executable gate was waived and no automatic Vercel publication occurred.

## Known non-blocking debt

When objective D-019 commands pass, these remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- npm audit findings observed by CI;
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning;
- Supabase Free leaked-password-protection warning;
- reviewed authenticated `SECURITY DEFINER` RPC advisor warnings for intentional operator-gated endpoints.

## Current QA status

- D-031 governance/runtime/onboarding: **PASS / INTEGRATED**.
- I3-D grouped reseller PDF: **PASS / INTEGRATED**.
- D-032 repository/database + first real global checkpoint: **PASS / OPERATIONAL**.
- D-033 database synthetic proof + D-019 + tree equivalence: **PASS / INTEGRATED**.
- D-034 reporting D-019: **PASS**.
- D-034 PR #85 integrated-tree equivalence: **PASS**.
- D-034 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- early-use change #5 report period-label D-019: **PASS**.
- PR #87 integrated-tree equivalence: **PASS**.
- early-use change #5 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.