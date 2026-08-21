# Easy V2 — QA Ledger

**Updated:** 2026-08-21

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

The detailed historical run ledger remains available in Git revisions and phase-specific execution records. Key accepted milestones:

- P9 categories/correction/date work: integrated with D-019 passing evidence.
- P10-S1 compatibility/rehearsal: accepted; synthetic stable-v1 round-trip proven; no real data moved.
- D-029 architecture redirect: accepted/integrated.
- P10-S3-I1 Supabase foundation: accepted synthetically; Security Advisor 0 lints; no real data retained.
- P10-S3-I2 contract/D-030: accepted without moving real data.
- P10-S3-I2-I1 staging/import compatibility: accepted synthetically with exact-cent reconciliation and rollback proof.
- P10-S3-I2-I2 repository/database prerequisite: implementation passed; final canonical-tree run `32411404495` / job `96562427495`; 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS; feature tree integrated by PR #70 as `0103f9ac44d9ee10ace85fddb144352fd305a9ee`.

## 2026-08-21 I2-I2 remote preflight

`develop` commit `c1fdf4b3140bb6e9b89e2cc8f36933a8c0c4a4f2` records a valid fail-closed result:

- trusted-PC credentials/configuration were not available in the remote environment;
- actual off-site copy/check was not proven;
- seven real daily generations were not accumulated;
- actual trusted-PC Docker/local restore drill was not run.

This remains valid evidence that D-030 I2-I2 did **not** pass.

D-031 subsequently changes sequencing: the missing operator-local proof is ON HOLD and no longer blocks beginning I2-I3 controlled early use.

## D-031 canonical governance integration — PASS

PR #74 (`docs(v2): authorize D-031 runtime-first early use`) changed only eight `docs/V2/` files and integrated the sequencing override into `develop`.

Exact evidence:

- PR #74 head: `eea49abf60dd7a40064e76117720db15d4630939`;
- exact PR merge ref: `62a7b646ba2a2efa500fcc43c5e0df206a2dc0b1`;
- Critical QA run: `32497468087`;
- job: `96819192500`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 56 files / 237 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop` commit: `4c3c42e6de805e171fb1e840adbfc596ecad8bc3`, tree `b6a6fe342470951cdf5455833e9af5dad8e4f9a8`;
- `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9` / tree `57243d004c5b550d0f27576f0179b0033044088e`.

Result: canonical startup documentation now makes I2-I2 ON HOLD and I2-I3 current.

## P10-S3-I2-I3 runtime-first PR #72 — PRE-INTEGRATION PASS, REVALIDATION REQUIRED

PR #72: `feat(v2): enable runtime-first Supabase candidate`.

Previously validated state:

- base at the time: `develop` `d4d428e35a45af0691e80331dd8c7888a914355f`;
- head: `385e59b22ac83ff43097cefeeb4551d28f606dbf`;
- exact PR merge ref: `1e746bb2dd133f5bfcaac7818b27996f802476ed`;
- Critical QA run: `32492337376`;
- job: `96802676149`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS.

Additional implementation review during that run fixed:

- misleading restore messaging when server apply succeeded but post-restore verification failed;
- auth callback structure that could trigger the documented Supabase `onAuthStateChange` nested-async deadlock class;
- inconsistent cloud/local mutation return contracts that initially broke TypeScript production build;
- stale E2E selectors after the recovery UI copy changed.

### Why PR #72 still requires another D-019

`develop` advanced after the successful merge-ref above, including the remote-preflight documentation and D-031 governance integration. Therefore the earlier merge ref is no longer the exact tree that would be integrated.

Before merging PR #72:

1. synchronize its branch with current `develop`;
2. generate the new PR merge ref;
3. run D-019 on that exact ref;
4. require PASS before integration;
5. verify squash-integrated tree equivalence and `main` unchanged.

## Supabase evidence relevant to runtime-first candidate

- dedicated project: `easy-v2` / `hrmkkhqfyfoqucwbcszq` / `sa-east-1`;
- RLS/approved-operator foundation accepted;
- financial writes remain behind controlled RPCs;
- runtime-first restore boundary is hardened through committed migrations in PR #72;
- most recent advisor check during implementation: Security Advisor 0 lints; Performance Advisor INFO-only unused-index notices on empty/tiny homologation.

No legacy real-store dataset was imported by PR #72.

## Known non-blocking debt

When objective D-019 commands pass, the following remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- dependency audit findings (last observed: 17 vulnerabilities — 2 low, 4 moderate, 11 high);
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning.

## Current QA status

- D-031 governance/docs: **PASS / INTEGRATED**.
- PR #72 runtime implementation: functionally D-019-passing on its prior merge ref, but **not integration-ready until revalidated against current `develop`**.
- D-030 operator-local recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.