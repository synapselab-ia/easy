# P10-S3-I2-I3-C — Candidate publication and operator onboarding

**Date:** 2026-08-25  
**Status:** `DONE / ACCEPTED — CONTROLLED EARLY USE ENABLED`  
**Canonical action:** P10-S3-I2-I3-C only

## 1. Scope

This slice was limited to the D-031-authorized clean-start candidate onboarding:

1. publish/configure the accepted `develop` runtime as the manual Vercel `easy-v2` candidate;
2. configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`;
3. create/sign in the intended Supabase Auth account through the normal application/Auth flow;
4. add only that real Auth UUID to `public.easy_operators` through a trusted database boundary;
5. prove an authenticated non-approved user cannot access business data;
6. prove the approved operator can load the clean canonical dataset;
7. create/download/confirm the first logical JSON recovery checkpoint and make the browser exact-24h freshness guard healthy;
8. authorize controlled clean-start early use.

This slice did **not** authorize I2-I2 trusted-PC backup acceptance, legacy real-data import, `main` publication, canonical URL switch, definitive cutover or D-030 acceptance.

## 2. Repository / candidate baseline

Repository state used by the accepted candidate:

- `develop`: `768776e7da52da5051b7a69dec071d0481cd810d`;
- tree: `2700203423adf7be1ac3ba290cf38ed0873beda5`;
- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- stable `main` tree: `57243d004c5b550d0f27576f0179b0033044088e`.

No runtime/code change was required to complete the operator-local onboarding. Closure documentation is isolated on `ops/p10-s3-i2-i3-c-operator-onboarding` and must pass D-019 before integration.

## 3. Vercel publication — PASS

Project: `easy-v2`.

Live evidence on 2026-08-25:

- deployment `dpl_FwpUedZ8gpMzCs5nLBjrv39V2FJs` is `READY`;
- deployment target: `production` candidate hosting;
- Git source branch: `develop`;
- Git source revision: `768776e7da52da5051b7a69dec071d0481cd810d`;
- project framework: Vite;
- candidate aliases include `easy-v2-tau.vercel.app` and the `develop` branch alias;
- only browser-safe Supabase values were configured: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`;
- no service-role/database secret was placed in browser configuration.

This Vercel `production` target is still a **candidate/early-use publication under D-031**. It does not mean Git `main` was published or that the canonical final production cutover occurred.

## 4. Real operator onboarding — PASS

The intended operator created and confirmed a real account through the normal Supabase Auth flow. The initial redirect misconfiguration was corrected by setting the Supabase Auth Site URL / redirect allow-list to the Vercel candidate.

The account then reached the expected fail-closed `Conta aguardando liberação` state before approval.

Through the trusted database boundary:

- exactly one intended real Auth UUID was added to `public.easy_operators`;
- the row is active;
- no password, token, service key, email address or Auth UUID is recorded in Git documentation;
- after approval, the operator used `Verificar novamente` and successfully entered the Easy candidate.

Final aggregate live state at closure:

- Auth users: 3;
- active approved operators: 1;
- inactive approved operators: 0;
- authenticated users not in the active allow-list: 2;
- categories: 0;
- items: 0;
- resellers: 0;
- transactions: 0.

The clean-start dataset therefore remained structurally empty at acceptance; no legacy or synthetic business payload was introduced.

## 5. Non-approved authenticated-user denial — PASS

A separate real Auth account was created/confirmed and intentionally **not** added to `public.easy_operators`.

Two independent observations prove the denial boundary:

1. the real candidate UI kept that authenticated account at `Conta aguardando liberação`;
2. a trusted SQL probe set the PostgreSQL request identity to that non-allow-listed Auth UUID under role `authenticated` and attempted an insert into `public.categories`.

The RLS boundary rejected the business write. The probe ran inside an explicit rollback path and final verification returned:

- `no_residual_write = true`;
- categories after probe: 0.

No test business row survived.

## 6. Approved-operator clean-dataset load — PASS

After allow-list insertion, the intended operator rechecked authorization and successfully entered the Easy runtime.

At the same time, direct database aggregate verification showed all canonical business tables still at zero rows. This is the expected D-031 clean-start state.

No legacy stable-v1 data was imported.

## 7. First manual JSON recovery checkpoint — PASS

From the approved candidate session, the operator:

1. opened `Backup & Restore`;
2. executed `Exportar Backup v2`;
3. confirmed that the downloaded JSON recovery copy was stored outside the browser;
4. clicked `Confirmar que guardei a cópia` in the same browser installation.

The file contents/path are intentionally not uploaded to Git/chat/CI. Operator confirmation is the required local evidence because the browser cannot independently prove the filesystem destination.

The accepted implementation records the export timestamp/filename in browser-local recovery metadata and only enables the confirmation action after an export exists.

## 8. Exact-24h browser freshness guard — PASS

The accepted runtime implements:

- `RECOVERY_MAX_AGE_MS = 24 * 60 * 60 * 1000`;
- missing/unconfirmed checkpoint => `writeBlocked = true`;
- age `< 24h` after setup confirmation => `status = current` or `warning`, `writeBlocked = false`;
- age `>= 24h` => `status = overdue`, `writeBlocked = true`.

Because the operator exported and immediately confirmed the checkpoint in the same installation on 2026-08-25, the deterministic post-condition is inside the exact 24-hour healthy interval with normal browser writes enabled.

The operator must continue creating/confirming a fresh JSON copy before the exact 24-hour limit expires if normal writes are to remain enabled.

## 9. Supabase security/advisor closure

Business security controls remain in force:

- Supabase Auth session gate;
- active `easy_operators` allow-list;
- RLS on exposed business tables;
- controlled PostgreSQL financial RPC boundary;
- browser configuration uses only URL + publishable key.

Performance Advisor remains INFO-only for currently unused indexes on the empty/tiny candidate database.

Security Advisor now reports one Auth-level warning: `auth_leaked_password_protection` / `Leaked Password Protection Disabled`.

Current official Supabase documentation states that leaked-password protection is available on **Pro Plan and above**. The project remains on Free because the accepted paid-infrastructure budget is US$0. Therefore:

- the warning cannot be eliminated within the current budget/plan;
- it is recorded as a residual early-use Auth risk, not suppressed or represented as zero lints;
- it does not indicate an RLS/allow-list bypass;
- operators should use unique, strong passwords;
- definitive cutover remains separately gated and may revisit the Auth/durability posture.

Reference: `https://supabase.com/docs/guides/auth/password-security`.

## 10. Outcome

**P10-S3-I2-I3-C is DONE / ACCEPTED.**

The D-031 candidate now has objective evidence for:

- correct manual `develop` publication;
- browser-safe Supabase configuration;
- intended real operator Auth onboarding;
- trusted allow-list approval;
- authenticated non-approved-user denial;
- approved-operator clean dataset access;
- first manual JSON checkpoint confirmation;
- exact-24h browser freshness healthy post-condition.

Controlled clean-start early use is now authorized.

## 11. Preserved boundaries

- P10-S3-I2-I2 remains ON HOLD and not passed.
- No legacy real-store data was imported.
- `main` remains untouched.
- No canonical final production URL was switched by this slice.
- No definitive cutover was enabled.
- D-030 durability acceptance remains pending.
- Supabase Free alone is not reclassified as adequate final backup.

## 12. Next bounded action

Proceed only to **P10-S3-I2-I3-D — controlled clean-start early-use observation**:

- use the accepted candidate for real clean-start workflow;
- keep the manual JSON recovery checkpoint fresher than the exact 24-hour boundary before normal writes;
- collect concrete operational feedback, workflow friction and defects;
- create repository/runtime changes only in response to observed feedback or an explicit operator instruction.

Do not automatically resume I2-I2, import legacy data, publish/modify `main`, switch the canonical final production URL or claim definitive D-030/cutover acceptance.