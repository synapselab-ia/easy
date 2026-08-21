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

D-031 subsequently changes sequencing: the missing operator-local proof is ON HOLD and no longer blocks runtime-first controlled early use.

## D-031 governance integration — PASS

PR #74 integrated the sequencing override into `develop`.

Accepted evidence:

- head `eea49abf60dd7a40064e76117720db15d4630939`;
- exact merge ref `62a7b646ba2a2efa500fcc43c5e0df206a2dc0b1`;
- run/job `32497468087` / `96819192500`;
- 0 lint errors / 82 warnings;
- 56 files / 237 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS;
- integrated commit `4c3c42e6de805e171fb1e840adbfc596ecad8bc3`.

A later documentation-only governance closure advanced `develop` to `1e396f3ce10a93f99c9bd47a312950943d1587ea` before PR #72 synchronization.

## P10-S3-I2-I3 runtime-first PR #72 — FINAL PASS / INTEGRATED

PR #72: `feat(v2): enable runtime-first Supabase candidate`.

### Synchronization

- current base used by the accepted merge ref: `develop` `1e396f3ce10a93f99c9bd47a312950943d1587ea`;
- synchronized feature head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact generated PR merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- exact merge-ref tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`.

GitHub Actions checkout evidence explicitly fetched and checked out `refs/remotes/pull/72/merge` at `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`.

### Final D-019

- Critical QA run: **`32502664982`**;
- job: **`96835725075`**;
- conclusion: **SUCCESS**;
- ESLint: **0 errors / 82 warnings**;
- Vitest: **57 files / 240 tests PASS**;
- Playwright: **17/17 PASS**;
- production build: **PASS** (`tsc -b && vite build`; Vite 8.0.8).

Known `act(...)`, mocked-select DOM, lint-warning, npm-audit, Actions Node deprecation and Vite chunk-size notices remained non-blocking because all objective D-019 commands passed.

### Integration equivalence

PR #72 was marked ready and squash-integrated into `develop` as:

- commit **`8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`**;
- integrated tree **`4ed336e4d05dc95df1abba7a9894d1b10abcd49b`**.

The integrated tree exactly matches the D-019-validated merge-ref tree. **Final tree equivalence: PASS.**

Stable `main` was independently rechecked after integration and remained:

- commit **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- tree **`57243d004c5b550d0f27576f0179b0033044088e`**.

**Result: PR #72 repository integration gate is CLOSED / PASS.**

## P10-S3-I2-I3-C live candidate preflight — BLOCKED / VALID FAIL-CLOSED

The current operational slice was attempted against the real `easy-v2` Supabase/Vercel candidate state. The attempt correctly stopped rather than fabricate a deployment, credentials or acceptance.

### Supabase live evidence

Project: `easy-v2` / `hrmkkhqfyfoqucwbcszq` / `sa-east-1`.

Observed:

- project healthy;
- current modern publishable key exists and is enabled;
- temporary D-031 `automated_guard_enabled = false` state remains explicit;
- Auth users: 0;
- `easy_operators`: 0;
- categories/items/resellers/transactions: 0 each;
- Security Advisor: **0 lints**;
- Performance Advisor: INFO-only unused-index notices expected on an empty/tiny homologation database;
- RLS policies for categories/items/resellers use `is_easy_operator()` for authenticated CRUD/read;
- transactions SELECT uses the same approved-operator boundary;
- `easy_operators` SELECT exposes only the current user's own row.

Policy inspection supports the designed authorization boundary but does **not** replace the required live non-approved authenticated-user denial proof.

### Vercel live evidence

Project: `easy-v2`.

Observed:

- latest READY deployment points to stale `develop@d4d428e35a45af0691e80331dd8c7888a914355f`;
- accepted pre-closure `develop@93500284f5b9105f0de7867a8676c31c7186d194` has not been proven as published candidate;
- the connected Vercel execution surface did not expose a safe project-environment write for `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`;
- its generic deploy action rejected the attempted invocation before any deployment creation because required source-package fields are not safely exposed by the available schema;
- no Vercel environment variable changed and no new deployment was created.

### Missing acceptance evidence

Because there is no intended real Auth user yet and no updated candidate publication:

- intended real Auth account creation/sign-in: **NOT DONE**;
- trusted `easy_operators` insertion: **NOT DONE**;
- live non-approved authenticated-user denial proof: **NOT DONE**;
- approved-operator clean-dataset load proof: **NOT DONE**;
- first manual JSON checkpoint download/storage confirmation: **NOT DONE**;
- exact-24h browser freshness healthy proof: **NOT DONE**;
- controlled early use start: **NOT DONE**.

**Result: valid fail-closed blocker. I2-I3-C remains CURRENT and is not accepted.**

Detailed evidence: `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md`.

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
- P10-S3-I2-I3 runtime repository integration: **PASS / INTEGRATED**.
- P10-S3-I2-I3-C live Vercel/Auth/manual-checkpoint evidence: **BLOCKED / VALID FAIL-CLOSED — CURRENT NEXT ACTION**.
- D-030 operator-local recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.