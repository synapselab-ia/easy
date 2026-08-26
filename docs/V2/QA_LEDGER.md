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

Detailed historical runs remain available in Git/PR history and phase-specific execution records. Key accepted milestones include P9 category/correction/date work, P10-S1 rehearsal, D-029 architecture, P10-S3-I1 Supabase foundation, D-030 contract/tooling, D-031 runtime-first governance/runtime/onboarding, PR #79 grouped reseller PDF and PR #80 D-032 global recovery.

D-030 real operator-local unattended/off-site/retention/restore acceptance remains ON HOLD.

## D-032 operational rollout — PASS

The accepted D-032-containing `develop` candidate was manually deployed to Vercel. A fresh real Backup v2 was exported on the updated candidate, stored outside Easy and explicitly confirmed. The production store-global exact-24h recovery checkpoint is therefore operational.

This is early-use recovery evidence, not D-030 durability acceptance.

## P10-S3-I2-I3-D early-use change #3 — D-033 optional subcategories

### Production database migration — PASS

Migration `20260826135708_i3d_subcategories` is applied.

Material database behavior:

- `public.subcategories` with RLS, stable identity, category parent and lifecycle;
- optional `items.subcategory_id` constrained to the selected category;
- optional transaction `subcategory_id/subcategory_name` snapshots for orders;
- archive/reference guards for category/subcategory/item integrity;
- transactional create/correct RPCs capture or preserve subcategory snapshots;
- cloud backup restore supports schema 6 while retaining supported older backup compatibility.

### Live synthetic database proof — PASS / ROLLED BACK

A transactionally isolated synthetic proof under an approved operator context verified:

1. cross-category item/subcategory pairing is rejected;
2. valid classification can be created;
3. `create_transaction` captures category and subcategory snapshots and server-calculated total;
4. a subcategory referenced by an active item cannot be archived;
5. rollback leaves zero synthetic category/subcategory/item/reseller/transaction residue.

### Security/advisor review — REVIEWED

The new subcategory table remains RLS-protected. Supabase Advisor also reports the known Free-plan leaked-password-protection warning and authenticated `SECURITY DEFINER` warnings for intentionally exposed operator-gated RPCs. Explicit privilege proof confirms `anon`/`public` cannot execute `create_transaction`, `correct_transaction` or `restore_easy_backup`; `authenticated` can, and each RPC retains internal active-operator authorization.

### D-019 — PASS

Implementation validation for PR #82:

- validated feature head: `b8a6c947bad5d2ba7432f2ffa13b3df32cf44dcd`;
- exact GitHub-generated merge ref checked out by Actions: `75fb65b3179549af0cb29618f282d9edc70e663a`;
- validated tree: `5127a5a558b990f587b6427a605c5207e6573b9e`;
- run/job: `32983745854` / `98226501149`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 61 files / 258 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS.

After separating canonical-document closure from executable implementation, the final PR #82 merge ref was `e9dc4cca9d6d1b843904d065ce7f9cf6289cdffd`. Its tree SHA was exactly `5127a5a558b990f587b6427a605c5207e6573b9e`, identical to the D-019-validated merge-ref tree. Exact-tree equivalence before integration: PASS.

PR #82 was squash-integrated into `develop` as `5a487b93d5c632f5990b8a261e4a62a6a196f186`. The integrated commit tree is exactly `5127a5a558b990f587b6427a605c5207e6573b9e`. Integrated-tree equivalence: PASS.

The post-integration canonical closure changes Markdown documentation only; no executable/runtime file differs from the D-019-validated integrated tree. No failed executable gate was waived.

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
- D-033 database synthetic proof: **PASS / ROLLED BACK / ZERO RESIDUE**.
- D-033 D-019: **PASS**.
- D-033 PR #82 integrated-tree equivalence: **PASS**.
- D-033 canonical closure: **DOCUMENTATION-ONLY / NO EXECUTABLE DELTA**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.