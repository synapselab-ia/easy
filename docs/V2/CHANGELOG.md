# Easy V2 — Changelog

This changelog records material project-state changes. Detailed older implementation history remains available in Git/PR history and phase-specific execution documents.

## 2026-08-21 — D-031 governance integrated; current action is PR #72 runtime integration

PR #74 integrated the canonical sequencing correction into `develop` as `4c3c42e6de805e171fb1e840adbfc596ecad8bc3`.

Its exact merge ref `62a7b646ba2a2efa500fcc43c5e0df206a2dc0b1` passed D-019 in run `32497468087` / job `96819192500`: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS.

The canonical continuation state is now unambiguous:

- I2-I2 trusted-PC backup/recovery proof is ON HOLD;
- I2-I3 runtime-first Supabase candidate is current;
- the immediate next action is to synchronize/revalidate/integrate PR #72 against current `develop`;
- `main` remains unchanged at `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.

---

## 2026-08-21 — D-031 authorizes runtime-first controlled early use; automated backup proof placed ON HOLD

The operator explicitly changed P10-S3 sequencing after the remaining D-030 I2-I2 evidence proved operator-local and unavailable from the remote development environment.

The earlier 2026-08-21 remote preflight remains a valid fail-closed result: the trusted-PC scheduled dump, actual off-site verification, seven retained successful daily generations and disposable trusted-PC restore drill were not proven. Nothing in D-031 claims otherwise.

D-031 changes the next action:

- P10-S3-I2-I2 is now `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`;
- P10-S3-I2-I3 is `IN_PROGRESS / AUTHORIZED FOR EARLY-USE CANDIDATE`;
- old sequencing text saying I2-I3 is unauthorized until I2-I2 passes is superseded;
- early use is a clean start with no legacy real-store migration;
- manual logical JSON backup + browser exact-24h freshness blocking is the temporary recovery control;
- stronger automated D-030 recovery-health acceptance remains pending for a later definitive cutover gate;
- `main` remains untouched and Vercel deployment remains manual/candidate.

PR #72 is the current runtime-first implementation. It previously passed D-019 on merge ref `1e746bb2dd133f5bfcaac7818b27996f802476ed` via run `32492337376` / job `96802676149`: 0 lint errors / 82 warnings; 57 files / 240 Vitest PASS; 17/17 Playwright PASS; production build PASS. Since `develop` advanced afterward, PR #72 must be synchronized and revalidated on the new exact merge ref before integration.

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