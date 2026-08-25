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

Detailed historical runs remain available in Git/PR history and phase-specific execution records. Key accepted milestones:

- P9 categories/correction/date work: integrated with D-019 passing evidence.
- P10-S1 compatibility/rehearsal: accepted synthetically; no real data moved.
- D-029 architecture redirect: accepted/integrated.
- P10-S3-I1 Supabase foundation: accepted synthetically.
- P10-S3-I2 contract/D-030: accepted without moving real data.
- P10-S3-I2-I1 staging/import compatibility: accepted synthetically with exact-cent reconciliation and rollback proof.
- P10-S3-I2-I2 repository/database prerequisite: final run/job `32411404495` / `96562427495`; 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS; integrated via PR #70. Actual operator-local D-030 proof remains ON HOLD.
- D-031 governance PR #74: run/job `32497468087` / `96819192500`; 0 errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS.
- Runtime-first PR #72: run/job `32502664982` / `96835725075`; 0 errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; build PASS; integrated `develop` tree exactly matched validated merge-ref tree.
- I3-C onboarding closure PR #78: run/job `32880173053` / `97907448864`; 0 errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; build PASS; integrated tree equivalence PASS.

## P10-S3-I2-I3-D early-use change #1 — grouped reseller PDF — FINAL PASS / INTEGRATED

Final PR #79 evidence:

- final head: `3d3cab2490f504d0464d722d08079dfb9fcdcb8c`;
- exact GitHub-generated merge ref: `f74af101e2335e7ca3dd4c52d51e46c3118de791`;
- Critical QA run/job: `32885324610` / `97924299040`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 242 tests PASS;
- `src/services/pdfService.test.ts`: 7 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- squash-integrated `develop`: `3c0fe29c62dd72d6acdcd3fc217ba392d4f2aa04`.

No runtime/schema/Auth/recovery boundary changed in that PDF-only change.

## P10-S3-I2-I3-D early-use change #2 — D-032 store-global manual recovery checkpoint

### Database / policy proof — PASS

Production Supabase migration:

- version/name: `20260825191150_global_manual_recovery_checkpoint`.

Schema/security properties verified:

- `public.manual_recovery_events` exists with RLS enabled;
- anonymous role has no SELECT/INSERT access;
- authenticated role has SELECT/INSERT only, with RLS requiring an active Easy operator;
- authenticated role has no UPDATE/DELETE grant;
- event trigger overwrites/validates actor and server timestamp;
- confirmation requires the current operator's pending unconfirmed export;
- `public.get_manual_recovery_health()` is callable by authenticated clients but itself rejects non-operators;
- D-030 `automated_guard_enabled` remained false under D-031 temporary early-use mode.

Transactional synthetic proof was run through the trusted database boundary and rolled back:

1. authenticated non-allow-listed identity could not insert a manual recovery event;
2. approved operator could not confirm without a pending export;
3. approved operator export + confirmation produced a shared global health row;
4. with a fresh confirmed checkpoint, a synthetic business write passed;
5. at the exact 24-hour boundary, the same business-write guard blocked with SQLSTATE `55000`;
6. after rollback, `manual_recovery_events = 0` and categories/items/resellers/transactions all returned to zero.

Supabase advisors after DDL:

- no new RLS/schema security finding from D-032;
- existing `auth_leaked_password_protection` WARN remains because the Free plan does not provide that Pro+ protection;
- Performance Advisor reports only INFO unused-index notices, including the newly empty recovery table index.

### Targeted implementation tests

New/updated coverage includes:

- cloud recovery service mapping of global health;
- export event registration;
- explicit confirmation event registration;
- fail-closed behavior when cloud health cannot be loaded;
- cloud-mode recoveryHealth routing without changing local-mode D-024 semantics;
- UI wiring for cloud export/confirmation.

### Implementation-tree D-019 — PASS

PR #80 implementation head before canonical-document updates:

- feature head: `246947c673ec13b840cb073e8b1b9e5c5d0efb3a`;
- exact GitHub-generated merge ref checked out by Actions: `06ecd1e6bde178486d38464d8277075cf866121c`;
- Critical QA run/job: `32889131712` / `97936610378`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 59 files / 251 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS.

This run validates the complete implementation before canonical-document closure. Because the documentation changes alter the PR tree, one fresh exact-tree D-019 is mandatory before PR #80 integration.

### Final exact-tree rule

The final PR #80 run identifiers are recorded in PR metadata after the last documentation commit. No repository commit may occur after that successful exact-tree validation before merge. On that condition, the D-032 repository integration is accepted.

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

- D-031 governance/runtime/onboarding: **PASS / INTEGRATED**.
- I3-D grouped reseller PDF: **PASS / INTEGRATED**.
- D-032 production database migration/policy proof: **PASS**.
- D-032 implementation-tree repository QA: **PASS**.
- D-032 canonical-document exact-tree QA: **REQUIRED ON FINAL PR #80 HEAD BEFORE MERGE**.
- first **real** global checkpoint after updated Vercel publication: **OPERATOR-LOCAL ROLLOUT STEP — NOT TO BE FABRICATED FROM THE OLD PER-BROWSER CHECKPOINT**.
- D-030 operator-local unattended recovery acceptance: **ON HOLD / NOT PASSED**.
- definitive production cutover: **NOT AUTHORIZED**.