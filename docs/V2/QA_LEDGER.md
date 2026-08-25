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

PR #72: `feat(v2): enable runtime-first Supabase candidate`.

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

Stable `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9` / tree `57243d004c5b550d0f27576f0179b0033044088e`.

## P10-S3-I2-I3-C initial preflight — VALID FAIL-CLOSED

The 2026-08-21 remote attempt correctly stopped because the accepted `develop` candidate had not yet been published with browser-safe Supabase config and the intended real operator identity did not yet exist.

That historical blocker is preserved in `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md` and was later resolved by the operator-local completion below.

## P10-S3-I2-I3-C operator-local completion — PASS

### Candidate deployment

Vercel project `easy-v2` live evidence on 2026-08-25:

- deployment ID: `dpl_FwpUedZ8gpMzCs5nLBjrv39V2FJs`;
- state: `READY`;
- target: candidate `production` hosting under D-031;
- Git ref: `develop`;
- Git SHA: `768776e7da52da5051b7a69dec071d0481cd810d`;
- candidate aliases include `easy-v2-tau.vercel.app` and the `develop` branch alias;
- only browser-safe Supabase URL/publishable-key variables were configured.

This is not a Git `main` publication and is not definitive cutover.

### Auth / allow-list / clean dataset

The intended real account was created/confirmed through the normal Supabase Auth flow and initially reached the expected fail-closed waiting state.

Trusted database onboarding then produced this aggregate closure state:

- Auth users: 3;
- active `easy_operators`: 1;
- inactive `easy_operators`: 0;
- authenticated users outside the active allow-list: 2;
- categories: 0;
- items: 0;
- resellers: 0;
- transactions: 0.

No email address, password, token or Auth UUID is stored in repository evidence.

The approved operator successfully rechecked authorization and entered the Easy candidate while the canonical business dataset remained clean/empty.

### Real non-approved-user denial

A separate confirmed Auth account was intentionally left outside `easy_operators` and the candidate UI kept it at `Conta aguardando liberação`.

A second direct RLS proof used that non-approved Auth identity under PostgreSQL role `authenticated` and attempted a business write to `public.categories` inside a rollback probe.

Expected denial occurred. Final verification:

- `no_residual_write = true`;
- categories after probe: 0.

**Result: authenticated-but-not-approved business write denial = PASS.**

### First manual JSON checkpoint / exact-24h guard

The approved operator reported completing the required same-installation sequence:

1. `Exportar Backup v2`;
2. verify/store the downloaded JSON outside the browser;
3. `Confirmar que guardei a cópia`.

The accepted implementation only enables confirmation after a recorded export and then writes `setupVerifiedAt` alongside the latest export timestamp.

`RECOVERY_MAX_AGE_MS` is exactly 24 hours. Immediately after export + confirmation:

- setup is verified;
- last export exists;
- age is non-negative and `< 24h`;
- `writeBlocked = false`;
- state is `current` initially and can become `warning` after 20h;
- at `age >= 24h`, state becomes `overdue` and writes fail closed.

The local filesystem path/content is intentionally not uploaded to Git/chat/CI; operator confirmation is the required evidence that the independent recovery copy exists.

**Result: first manual JSON checkpoint + exact-24h healthy post-condition = PASS.**

### Supabase advisor state

Performance Advisor: INFO-only unused-index notices on the empty/tiny candidate database.

Security Advisor: one Auth-level WARN:

- `auth_leaked_password_protection` — Leaked Password Protection Disabled.

Official Supabase documentation states leaked-password protection is available on Pro Plan and above. Current accepted paid-infrastructure budget remains US$0 / Free. Therefore this warning is recorded as an explicit residual early-use Auth risk; it is not hidden or described as zero lints, and it does not invalidate the independently proven Auth + allow-list + RLS boundary.

Reference: `https://supabase.com/docs/guides/auth/password-security`.

Definitive cutover remains separately gated.

## P10-S3-I2-I3-C documentation closure — D-019 PENDING

Closure branch: `ops/p10-s3-i2-i3-c-operator-onboarding`.

This closure is documentation-only. It records operator-local evidence and advances the canonical `NEXT_ACTION` to controlled early-use observation.

Before integration, the exact PR merge-ref tree must pass D-019. Objective failure blocks merge. Final run/job evidence is recorded in the PR closure and, if necessary, this ledger before integration.

## Known non-blocking debt

When objective D-019 commands pass, the following remain non-blocking unless later evidence elevates them:

- React `act(...)` test warnings;
- mocked-select DOM/hydration warnings;
- `set-state-in-effect` lint warnings;
- lint `any` warning debt;
- dependency audit findings previously observed;
- GitHub Actions Node deprecation notices;
- Vite large-chunk warning;
- Supabase Free Auth leaked-password-protection WARN described above during D-031 early use.

## Current QA status

- D-031 governance/docs: **PASS / INTEGRATED**.
- P10-S3-I2-I3 runtime repository integration: **PASS / INTEGRATED**.
- P10-S3-I2-I3-C live Vercel/Auth/RLS/manual-checkpoint evidence: **PASS / ACCEPTED — repository documentation closure awaiting D-019 integration gate**.
- P10-S3-I2-I3-D controlled early-use observation: **NEXT after closure integration**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.