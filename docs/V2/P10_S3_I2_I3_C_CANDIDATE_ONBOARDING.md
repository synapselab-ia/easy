# P10-S3-I2-I3-C — Candidate publication and operator onboarding

**Date:** 2026-08-21  
**Status:** `BLOCKED / OPERATOR-LOCAL COMPLETION REQUIRED`  
**Canonical action:** P10-S3-I2-I3-C only

## 1. Scope

This execution attempt was limited to the D-031-authorized clean-start candidate onboarding slice:

1. publish/configure the accepted `develop` runtime as the manual Vercel `easy-v2` candidate;
2. configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`;
3. create/sign in the intended Supabase Auth account through the normal application/Auth flow;
4. add only that real Auth UUID to `public.easy_operators` through a trusted admin/database boundary;
5. prove an authenticated non-approved user cannot access business data;
6. create/download/confirm the first logical JSON recovery checkpoint and make the browser exact-24h freshness guard healthy;
7. begin controlled clean-start early use.

The attempt did not authorize I2-I2 trusted-PC backup proof, legacy real-data import, `main` publication, canonical URL switch, definitive cutover or D-030 acceptance.

## 2. Repository baseline inspected

Accepted integration baseline at the start of this attempt:

- `develop`: `93500284f5b9105f0de7867a8676c31c7186d194`;
- tree: `4c510a9fb99fe29746ecaf209d4679dd55bbe946`;
- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- stable `main` tree: `57243d004c5b550d0f27576f0179b0033044088e`.

No repository runtime/code change was required by the attempted onboarding work.

## 3. Supabase live preflight

The dedicated `easy-v2` project `hrmkkhqfyfoqucwbcszq` in `sa-east-1` was inspected live.

Observed state:

- project status healthy;
- current browser-safe publishable key exists and is enabled;
- temporary D-031 recovery mode remains explicit with `private.recovery_enforcement_state.automated_guard_enabled = false`;
- `auth.users`: 0 rows;
- `public.easy_operators`: 0 rows;
- `public.categories`: 0 rows;
- `public.items`: 0 rows;
- `public.resellers`: 0 rows;
- `public.transactions`: 0 rows;
- Security Advisor: 0 lints;
- Performance Advisor: INFO-only unused-index notices expected on an empty/tiny homologation database.

RLS policy inspection confirmed that the exposed business tables authorize authenticated CRUD/read through the server-side `is_easy_operator()` boundary, while `easy_operators` only exposes the current user's own allow-list row. This supports the designed denial boundary but is not substituted for the required live non-approved-user proof.

No Auth user, allow-list row or business row was created by this attempt.

## 4. Vercel live preflight

The existing Vercel project `easy-v2` was inspected.

Observed state:

- latest candidate deployment is READY but stale;
- it points to `develop@d4d428e35a45af0691e80331dd8c7888a914355f`, which predates PR #72 runtime-first integration and current accepted `develop`;
- therefore the accepted `develop@93500284f5b9105f0de7867a8676c31c7186d194` runtime has not yet been proven as the published candidate;
- repository `vercel.json` still keeps Git-triggered Vercel deployments disabled, preserving the manual-deploy policy.

The connected Vercel surface available in this execution environment exposes project/deployment inspection but does not expose a safe project-environment mutation for the two required variables. Its generic deployment action also rejected the attempted invocation before any deployment was created because the connector requires source-package fields that are not safely exposed by the available action schema.

Result: no Vercel environment variable was changed and no new Vercel deployment was created by this attempt.

## 5. Identity / operator blocker

The required intended operator identity does not yet exist in Supabase Auth. Creating a real operator through the normal Auth flow requires the operator's actual account credentials and browser interaction.

This execution must not invent an email/password, create a synthetic account and misrepresent it as the intended operator, or place credentials/UUIDs in Git/chat evidence.

Because there is no real Auth user yet:

- no UUID can legitimately be added to `public.easy_operators`;
- the required live non-approved authenticated-user denial proof cannot be completed as specified;
- the approved-operator clean-dataset load cannot be proven;
- the initial manual JSON checkpoint cannot be generated/confirmed through the real candidate session;
- the exact-24h browser freshness guard cannot be proven healthy for real early use.

## 6. Outcome

**P10-S3-I2-I3-C is not accepted and does not advance.**

The correct state is:

`BLOCKED / OPERATOR-LOCAL COMPLETION REQUIRED — CURRENT NEXT ACTION`

No acceptance was fabricated. The runtime implementation remains integrated and ready; only real candidate publication/onboarding evidence is missing.

## 7. Exact completion procedure

Resume only P10-S3-I2-I3-C and complete these remaining steps in order:

1. in Vercel project `easy-v2`, set only the browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values for the candidate environment;
2. manually deploy the accepted current `develop` revision, not `main`, and verify the deployment metadata points to that accepted revision;
3. open the candidate and create/sign in the intended real operator through the normal Supabase Auth flow;
4. capture the resulting Auth UUID privately and add only that UUID to `public.easy_operators` through a trusted admin/database boundary;
5. separately authenticate a non-allow-listed user and prove business-data access is denied;
6. sign in as the approved operator and prove the clean canonical dataset loads;
7. export/download the first logical JSON backup, store it outside the browser and explicitly confirm the copy exists;
8. verify recovery health reports the manual checkpoint inside the exact 24-hour freshness boundary and normal writes are enabled;
9. begin controlled clean-start early use and record only non-secret evidence.

## 8. Preserved boundaries

- P10-S3-I2-I2 remains ON HOLD and not passed.
- No legacy real-store data was imported.
- `main` remains untouched.
- No canonical production URL was switched.
- No definitive cutover was enabled.
- D-030 durability acceptance remains pending.
