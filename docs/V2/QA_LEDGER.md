# Easy V2 — QA Ledger

**Updated:** 2026-08-25

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
- P10-S3-I1 Supabase foundation: accepted synthetically; no real data retained.
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

## P10-S3-I2-I3 runtime-first PR #72 — FINAL PASS / INTEGRATED

Accepted repository evidence:

- synchronized feature head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact generated PR merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- exact merge-ref tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- Critical QA run/job: `32502664982` / `96835725075`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop`: `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- integrated tree equals validated merge-ref tree: PASS.

## P10-S3-I2-I3-C operator onboarding — PASS / INTEGRATED

Live acceptance covered:

- READY Vercel candidate from `develop`;
- real approved operator onboarding through Supabase Auth + `easy_operators`;
- separate authenticated non-approved account blocked at the waiting gate;
- direct RLS business-write denial for the non-approved identity with zero residue;
- first manual Backup v2 JSON exported, stored outside browser and confirmed;
- exact-24h browser guard entered the healthy interval;
- no legacy real-store import and no `main` publication.

Repository closure PR #78 final evidence:

- final head: `22fad84fda5972a019560535f2318ad018d3b69f`;
- exact merge ref: `f06e440619f6f7d13f2250009262570829b3b1ca`;
- run/job: `32880173053` / `97907448864`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop`: `7f2ed0095eca7fad92d04258b9cc3c6852ad04de`;
- integrated tree `becae1c9794d03eaa46d22a53c00aa29f241a505` exactly equals the validated merge-ref tree.

## P10-S3-I2-I3-D early-use change #1 — grouped reseller PDF

Explicit operator instruction during real early use requested a product-grouped reseller account PDF.

Behavior under test:

- equal order launches group only by stable item identity/snapshot name + same unit price + same valid/reversed state;
- grouped quantity and subtotal are summed;
- order observations/names render immediately below the grouped item;
- distinct items remain independent;
- different unit prices do not merge;
- payments/signals render in a separate section below order items;
- reversal/correction audit notes remain visible;
- existing date-range, statement-balance and `occurredAt` semantics remain preserved.

Targeted test coverage was expanded in:

- `src/services/pdfService.test.ts` — grouped names, quantity/subtotal aggregation, price separation, settlement separation and audit behavior;
- `src/services/pdfService.statement.test.ts` — statement semantics with split item/settlement sections;
- `src/services/pdfService.occurrence.test.ts` — `occurredAt` period filtering with the split layout.

### Implementation-tree D-019 — PASS

PR #79 first exact merge-ref validation:

- feature head: `4f31066fe3e4b962492a33ce058aed367dec34e0`;
- exact GitHub-generated merge ref checked out by Actions: `45f93996be1c85c6457f95c523f39a30e204f748`;
- Critical QA run/job: `32884605838` / `97921988064`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 242 tests PASS;
- `src/services/pdfService.test.ts`: 7 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS.

This run validates the complete runtime/test implementation before canonical-document updates. The documentation commits necessarily change the PR tree afterward, so PR #79 still requires one fresh exact-tree D-019 before integration. Final exact-tree run identifiers are recorded in the PR metadata after that run; no repository commit may occur after the final successful validation before merge.

## Known non-blocking debt

When objective D-019 commands pass, the following remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- dependency audit findings previously observed;
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning;
- Supabase Free Auth leaked-password-protection WARN during D-031 early use.

## Current QA status

- D-031 governance/docs: **PASS / INTEGRATED**.
- P10-S3-I2-I3 runtime repository integration: **PASS / INTEGRATED**.
- P10-S3-I2-I3-C live onboarding/checkpoint + repository closure: **PASS / INTEGRATED**.
- P10-S3-I2-I3-D grouped reseller PDF implementation: **IMPLEMENTATION D-019 PASS — FINAL DOCUMENTATION-TREE RERUN REQUIRED BEFORE PR #79 MERGE**.
- P10-S3-I2-I3-D controlled early-use observation: **CURRENT**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.