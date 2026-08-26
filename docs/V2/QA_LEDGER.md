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

Objective failures block integration. Supabase-bearing work additionally requires relevant database/security/policy/advisor evidence.

## Accepted historical baseline

Detailed historical runs remain available in Git/PR history and phase-specific execution records. Key accepted milestones:

- P9 categories/correction/date work: integrated with D-019 passing evidence.
- P10-S1 compatibility/rehearsal: accepted synthetically; no real data moved.
- D-029 architecture redirect: accepted/integrated.
- P10-S3-I1 Supabase foundation: accepted synthetically.
- P10-S3-I2 contract/D-030: accepted without moving real data.
- P10-S3-I2-I1 staging/import compatibility: accepted synthetically with exact-cent reconciliation and rollback proof.
- P10-S3-I2-I2 repository/database prerequisite: final run/job `32411404495` / `96562427495`; 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS; actual D-030 operator-local proof remains ON HOLD.
- D-031 governance PR #74: run/job `32497468087` / `96819192500`; 0 errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS.
- Runtime-first PR #72: run/job `32502664982` / `96835725075`; 0 errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; build PASS.
- I3-C onboarding closure PR #78: run/job `32880173053` / `97907448864`; 0 errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; build PASS.
- I3-D grouped reseller PDF PR #79: run/job `32885324610` / `97924299040`; 0 errors / 82 warnings; 57 files / 242 Vitest PASS; 17/17 Playwright PASS; build PASS.
- D-032 global recovery PR #80: final run/job `32891655554` / `97944738069`; 0 errors / 82 warnings; 59 files / 251 Vitest PASS; 17/17 Playwright PASS; build PASS; integrated-tree equivalence PASS.

## D-032 operational rollout — PASS

The repository implementation had already passed. The previously pending real rollout has now also occurred:

- accepted D-032-containing `develop` was manually deployed to the Vercel candidate;
- a fresh real Backup v2 was exported on the updated candidate;
- the operator explicitly confirmed storage outside Easy;
- production global recovery state therefore has a real confirmed checkpoint;
- the shared exact-24h D-032 mode is operational.

This is early-use recovery evidence, not D-030 unattended off-site durability acceptance.

## P10-S3-I2-I3-D early-use change #3 — D-033 optional subcategories

### Production database migration — APPLIED

Migration:

- `20260826135708_i3d_subcategories`.

Material database changes:

- `public.subcategories` with RLS, stable identity, category parent and lifecycle;
- optional `items.subcategory_id` with category/subcategory consistency constraints;
- optional transaction `subcategory_id/subcategory_name` snapshots for orders;
- archive/reference guards for category/subcategory/item integrity;
- transactional create/correct RPCs capture or preserve subcategory snapshots;
- cloud backup restore accepts schema 6 with subcategories while retaining older supported backup compatibility.

### Live synthetic database proof — PASS / ROLLED BACK

A transactional proof ran with an approved authenticated operator context and synthetic-only names:

1. created two synthetic categories and one subcategory;
2. attempted to attach that subcategory to an item from the wrong category — rejected by database integrity;
3. created a correctly classified item and reseller;
4. called the production `create_transaction` RPC;
5. verified the order captured the expected category id/name and subcategory id/name snapshot and server-calculated total;
6. attempted to archive the subcategory while an active item referenced it — rejected;
7. rolled back the entire transaction;
8. post-rollback counts for all synthetic categories/subcategories/items/resellers/transactions were zero.

### Security/advisor review — REVIEWED

Supabase Security Advisor after D-033 reports:

- the existing Free-plan `auth_leaked_password_protection` warning;
- `SECURITY DEFINER` execution warnings for the intentionally exposed authenticated RPCs `create_transaction`, `correct_transaction` and `restore_easy_backup`.

Privilege proof confirms for all three RPCs:

- `anon` execute: false;
- `public` execute: false;
- `authenticated` execute: true.

Each RPC retains explicit internal active-operator authorization. These warnings are therefore reviewed intentional transactional/API boundaries, not anonymous/public execution findings. The D-033 subcategory table itself uses RLS and did not require an unauthenticated bypass.

### Implementation-tree D-019 before canonical documentation — PASS

PR #82 implementation after correcting old schema-5 test assumptions and the legacy unclassified-item edit regression:

- feature head: `b8a6c947bad5d2ba7432f2ffa13b3df32cf44dcd`;
- exact GitHub-generated merge ref checked out by Actions: `75fb65b3179549af0cb29618f282d9edc70e663a`;
- run/job: `32983745854` / `98226501149`;
- ESLint: 0 errors / 83 warnings;
- Vitest: 61 files / 258 tests PASS;
- Playwright: 17/17 PASS;
- TypeScript + production Vite build: PASS.

The preceding run had already proven 61/258 Vitest and 17/17 Playwright but failed only on TypeScript overload inference for five-table Dexie transaction scopes. That build defect was fixed by using Dexie's table-array transaction form; the passing run above is the relevant implementation evidence.

### Final exact-tree D-019 — PENDING

Canonical documents are being updated after the implementation pass. D-019 must run once more on the frozen final PR #82 merge-ref tree before integration. No objective failure may be waived.

## Known non-blocking debt

When objective D-019 commands pass, these remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- npm audit findings currently observed by CI;
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning;
- Supabase Free leaked-password-protection warning;
- reviewed authenticated `SECURITY DEFINER` RPC advisor warnings for intentional operator-gated transactional endpoints.

## Current QA status

- D-031 governance/runtime/onboarding: **PASS / INTEGRATED**.
- I3-D grouped reseller PDF: **PASS / INTEGRATED**.
- D-032 repository/database: **PASS / INTEGRATED**.
- D-032 first real global checkpoint: **PASS / OPERATIONAL**.
- D-033 database synthetic proof: **PASS / ROLLED BACK / ZERO RESIDUE**.
- D-033 implementation-tree D-019: **PASS**.
- D-033 final documented-tree D-019: **PENDING / BLOCKS INTEGRATION**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.