# Easy V2 — Changelog

This changelog records material project-state changes. Detailed older implementation history remains available in Git/PR history and phase-specific execution documents.

## 2026-08-21 — P10-S3-I2-I3-C live preflight stopped fail-closed; operator-local completion remains current

The D-031 candidate onboarding action was attempted against the real Vercel/Supabase candidate state and correctly stopped without fabricating credentials, deployment evidence or acceptance.

Live findings:

- Supabase `easy-v2` is healthy and remains empty: 0 Auth users, 0 approved operators and 0 business rows;
- the temporary D-031 automated recovery guard remains explicitly disabled for manual-JSON early-use mode;
- Supabase Security Advisor returned 0 lints;
- business-table RLS remains bound to the approved-operator boundary;
- Vercel `easy-v2` latest READY deployment is stale at `develop@d4d428e35a45af0691e80331dd8c7888a914355f`;
- accepted pre-closure `develop@93500284f5b9105f0de7867a8676c31c7186d194` has not yet been proven as the published candidate;
- the connected Vercel execution surface did not expose a safe project-env write for the two browser-safe Supabase variables, and its generic deploy action rejected the attempted invocation before creating any deployment;
- no Vercel env variable, Supabase Auth user, allow-list row or business row was changed.

Because the intended real Auth identity does not yet exist, the live non-approved-user denial proof, approved-user dataset load, first manual JSON checkpoint and exact-24h healthy-guard proof also remain incomplete.

P10-S3-I2-I3-C is therefore now `BLOCKED / OPERATOR-LOCAL COMPLETION REQUIRED — CURRENT NEXT ACTION`. It does not advance to legacy migration or definitive cutover.

Detailed execution record: `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md`.

I2-I2 remains ON HOLD, no legacy real-store data was imported, `main` remained unchanged, the canonical production URL was not switched and no D-030 durability acceptance was claimed.

---

## 2026-08-21 — PR #72 runtime-first candidate validated and integrated; next action is manual candidate onboarding

The D-031-authorized runtime implementation was synchronized with the current `develop`, revalidated and integrated.

Final evidence:

- synchronized feature head: `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact PR merge ref: `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- validated merge-ref tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- Critical QA run/job: `32502664982` / `96835725075`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 57 files / 240 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS;
- PR #72 marked ready and squash-integrated to `develop` as `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- integrated tree: `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`, exactly equal to the validated merge-ref tree;
- stable `main` remained unchanged at `9574e3a4097ddd78ab1f75a13b9ea065287946e9` / tree `57243d004c5b550d0f27576f0179b0033044088e`.

P10-S3-I2-I3 repository integration is therefore closed. The next bounded action became P10-S3-I2-I3-C: manually publish/configure the accepted `develop` candidate on Vercel, onboard/approve the intended Supabase Auth operator, prove unauthorized denial, create/confirm the first manual JSON recovery checkpoint and begin controlled clean-start early use.

I2-I2 trusted-PC backup/recovery proof remains ON HOLD under D-031. No legacy real-store data was imported, `main` was not modified, the canonical production URL was not switched and no definitive D-030 durability/cutover claim was made.

---

## 2026-08-21 — D-031 governance integrated; PR #72 became the runtime integration action

PR #74 integrated the canonical sequencing override into `develop` as `4c3c42e6de805e171fb1e840adbfc596ecad8bc3`.

Its exact merge ref `62a7b646ba2a2efa500fcc43c5e0df206a2dc0b1` passed D-019 in run `32497468087` / job `96819192500`: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS.

The canonical continuation state became:

- I2-I2 trusted-PC backup/recovery proof ON HOLD;
- I2-I3 runtime-first Supabase candidate current;
- PR #72 required synchronization/revalidation/integration;
- `main` unchanged.

That action is now completed by the entry above.

---

## 2026-08-21 — D-031 authorizes runtime-first controlled early use; automated backup proof placed ON HOLD

The operator explicitly changed P10-S3 sequencing after the remaining D-030 I2-I2 evidence proved operator-local and unavailable from the remote development environment.

The earlier 2026-08-21 remote preflight remains a valid fail-closed result: the trusted-PC scheduled dump, actual off-site verification, seven retained successful daily generations and disposable trusted-PC restore drill were not proven. Nothing in D-031 claims otherwise.

D-031 changed sequencing:

- P10-S3-I2-I2 became `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`;
- P10-S3-I2-I3 became authorized for the early-use candidate;
- old sequencing text saying I2-I3 was unauthorized until I2-I2 passes was superseded;
- early use is a clean start with no legacy real-store migration;
- manual logical JSON backup + browser exact-24h freshness blocking is the temporary recovery control;
- stronger automated D-030 recovery-health acceptance remains pending for a later definitive cutover gate;
- `main` remains untouched and Vercel deployment remains manual/candidate.

Authoritative governance record: `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md`.

---

## 2026-08-21 — Remote D-030 I2-I2 preflight stopped fail-closed

A remote continuation attempted the then-current I2-I2 acceptance action. It correctly could not prove trusted-PC credentials/configuration, actual off-site retention or restore evidence and recorded a NO-GO rather than fabricating acceptance.

That historical result is preserved by `develop` commit `c1fdf4b3140bb6e9b89e2cc8f36933a8c0c4a4f2`.

D-031 later changes sequencing only; it does not erase this evidence.

---

## 2026-08-20 — P10-S3-I2-I2 recovery prerequisite implemented; acceptance blocked at that time

Trusted-PC tooling and database recovery-health migrations were integrated for pinned Supabase CLI data-only dumps, rclone off-site verification, >=7 daily generation retention, exact-24h server write blocking and disposable restore fingerprinting.

Synthetic proof covered missing/stale/retention<7 blocking, exact boundary behavior, recovery after valid evidence, financial RPC enforcement and denial of API-style bypass. Security Advisor finished at 0 lints. Final D-019 `32411404495` / `96562427495` passed: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS. PR #70 integrated as `0103f9ac44d9ee10ace85fddb144352fd305a9ee`.

At that point I2-I2 was the blocker because operator-local evidence was still missing. D-031 later places that proof on hold for early use.

---

## 2026-08-20 — P10-S3-I2-I1 private stable-v1 staging/import compatibility accepted

Private staging/import compatibility was synthetically proven with stable IDs/timestamps, explicit current item classification, non-invented historical category state, atomic promotion/rollback, metadata-driven sequence repair and exact-cent financial reconciliation. No real store data moved.

---

## 2026-08-20 — D-030 zero-cost migration/durability contract accepted

D-030 defined the US$ 0 durability requirement: Supabase Free alone is insufficient; final zero-cost eligibility requires unattended off-site logical dumps, at least seven retained daily generations, exact-24h server-visible write blocking and restore drills. It also defines the private stable-v1 migration staging path.

D-031 later refines only the order of execution for controlled early use.

---

## 2026-08-20 — P10-S3-I1 Supabase foundation accepted

Dedicated `easy-v2` Supabase project, schema, RLS/approved-operator authorization, financial RPC boundary, typed client foundation and synthetic security/reconciliation evidence were accepted. No real data moved.

---

## 2026-08-20 — D-029 redirects final persistence to Supabase/Postgres

D-029 superseded the final local-first topology before real data moved, selecting Supabase/Postgres canonical persistence with Vercel hosting, Auth/RLS, transactional financial operations, Dexie as transition/cache and independent manual logical backup.

---

## 2026-08-19 and earlier

P1–P9 and P10-S1 completed the accepted referential lifecycle, audited financial correction, occurrence-date semantics, statement/debt logic, backup/restore hardening, D-024 local recovery guard, D-025 category snapshot/reporting behavior, D-026 full-field linked correction and synthetic stable-v1 migration/recovery rehearsal. Detailed run/PR history remains in prior Git revisions and phase-specific V2 documents.