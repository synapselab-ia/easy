# Easy V2 — Changelog

This changelog records material project-state changes. Detailed older implementation history remains available in Git/PR history and phase-specific execution documents.

## 2026-08-25 — D-032 makes the hosted manual recovery checkpoint store-global

Controlled early-use feedback exposed an operational mismatch: the Supabase-backed store has one canonical database, but the temporary 24-hour manual JSON recovery state was still maintained independently by each browser installation.

The operator explicitly required one properly generated/stored/confirmed Backup v2 to refresh the temporary recovery boundary for all approved devices.

D-032 was accepted and PR #80 implements the hosted-cloud refinement:

- `public.manual_recovery_events` stores append-only export/confirmation events in Supabase;
- RLS restricts recovery state to active approved operators;
- browser clients have SELECT/INSERT only and no UPDATE/DELETE grant;
- actor identity and timestamps are established at the database boundary;
- confirmation is rejected unless the current operator has a pending unconfirmed export;
- the latest confirmed export becomes the store-global recovery checkpoint seen by all approved devices;
- cloud clients hydrate/poll that shared health and fail closed if it cannot be verified;
- after global manual mode is initialized, normal business writes are blocked by the database at checkpoint age `>= 24h`;
- the local/no-cloud D-024 path remains unchanged;
- D-030 automated durability evidence still takes precedence if later enabled and remains ON HOLD/not accepted today.

Production migration `20260825191150_global_manual_recovery_checkpoint` was applied before rollout. Transactional synthetic proof showed non-allow-listed denial, confirmation-without-export denial, approved export+confirmation health, fresh-write allowance and exact-24h write blocking with SQLSTATE `55000`; all synthetic recovery/business rows were rolled back to zero.

Implementation-tree D-019 on PR #80 passed at head `246947c673ec13b840cb073e8b1b9e5c5d0efb3a`, exact merge ref `06ecd1e6bde178486d38464d8277075cf866121c`, run/job `32889131712` / `97936610378`: 0 lint errors / 82 warnings; 59 files / 251 Vitest PASS; 17/17 Playwright PASS; production build PASS.

Canonical documentation changes require one final exact-tree D-019 before integration. After integration, the updated `develop` candidate must be manually published to Vercel and an approved operator must perform a **fresh real** export, verify storage outside the Easy and explicitly confirm it. The prior browser-local checkpoint is not silently migrated into global state.

This change does not import legacy data, modify/publish `main`, switch the final canonical URL or claim D-030/definitive-cutover acceptance.

---

## 2026-08-25 — I3-D early-use feedback: reseller PDF grouped by product — integrated

A concrete operator request from controlled early use changed the reseller PDF presentation without changing financial persistence or business-history semantics.

Implemented behavior:

- equal order launches group only when stable item identity/snapshot name, unit price and valid/reversed status match;
- grouped quantity/subtotal are summed;
- each order observation is printed immediately below its grouped product;
- catalog items remain independent rather than being treated as parent/child products;
- same item at different unit prices stays in separate rows;
- valid and reversed launches stay separate with audit notes preserved;
- payments/signals render in a dedicated section below order items;
- date-range, `occurredAt` and statement balance semantics remain unchanged.

Final PR #79 exact-tree D-019 passed on head `3d3cab2490f504d0464d722d08079dfb9fcdcb8c`, merge ref `f74af101e2335e7ca3dd4c52d51e46c3118de791`, run/job `32885324610` / `97924299040`: 0 lint errors / 82 warnings; 57 files / 242 Vitest PASS; 17/17 Playwright PASS; production build PASS.

PR #79 was squash-integrated into `develop` as `3c0fe29c62dd72d6acdcd3fc217ba392d4f2aa04`. I3-D remains current for further evidence-driven early-use observation.

---

## 2026-08-25 — P10-S3-I2-I3-C candidate onboarding accepted; controlled clean-start early use enabled

The D-031 operator-local onboarding blocker was resolved without touching `main`.

Accepted live evidence:

- Vercel `easy-v2` candidate was READY from `develop` with only browser-safe Supabase URL + publishable key;
- intended real operator account was created/confirmed through normal Supabase Auth and then approved through the trusted `easy_operators` boundary;
- a separate authenticated non-approved account remained at the waiting gate;
- direct PostgreSQL/RLS probe rejected a business-table insert from that non-approved identity with zero residual rows;
- approved operator entered the clean candidate and canonical business tables remained empty;
- first Backup v2 JSON was exported, stored outside the browser and explicitly confirmed in that installation;
- the original exact-24h browser guard entered its healthy interval.

Supabase Security Advisor reported the Auth-level `auth_leaked_password_protection` WARN, a known Free-plan residual risk. Auth + allow-list + RLS denial were independently proven and definitive cutover remained separately gated.

I3-C became `DONE / ACCEPTED`; I3-D controlled clean-start early-use observation became current. D-032 later refines only the hosted recovery-state topology from per-installation to store-global.

Detailed onboarding evidence: `docs/V2/P10_S3_I2_I3_C_CANDIDATE_ONBOARDING.md`.

---

## 2026-08-21 — I3-C live preflight stopped fail-closed

An earlier remote attempt correctly stopped because the intended real Auth/operator/deployment evidence did not yet exist. No credentials, allow-list rows, business rows or Vercel environment state were fabricated. The 2026-08-25 acceptance entry supersedes that blocker status while preserving the historical NO-GO evidence.

---

## 2026-08-21 — PR #72 runtime-first candidate validated and integrated

D-031 runtime implementation was synchronized, revalidated and integrated.

Final evidence:

- feature head `6db3fd2cc24c0d915d7aa98b5c549cccd3772aad`;
- exact merge ref `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8`;
- validated tree `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- run/job `32502664982` / `96835725075`;
- 0 lint errors / 82 warnings;
- 57 files / 240 Vitest PASS;
- 17/17 Playwright PASS;
- build PASS;
- integrated `develop` commit `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2` with exact tree equivalence.

I2-I2 remained ON HOLD; no legacy real-store data or `main` publication occurred.

---

## 2026-08-21 — D-031 governance integrated and runtime-first early use authorized

PR #74 integrated the sequencing override. I2-I2 trusted-PC backup proof became ON HOLD; I2-I3 runtime-first Supabase candidate became authorized; clean-start early use, temporary manual JSON recovery, manual Vercel candidate publication and an untouched `main` were explicitly preserved.

Final governance run/job: `32497468087` / `96819192500`; 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS.

---

## 2026-08-21 — Remote D-030 I2-I2 preflight stopped fail-closed

The remote environment could not prove trusted-PC scheduling, actual off-site verification, seven retained successful daily generations or a real disposable restore drill. This valid NO-GO remains preserved; D-031 changed sequencing only and did not convert it into acceptance.

---

## 2026-08-20 — P10-S3-I2-I2 recovery prerequisite implemented; real acceptance remained blocked

Trusted-PC tooling and database recovery-health migrations were integrated for pinned Supabase CLI dumps, rclone off-site verification, >=7-day retention, exact-24h server write blocking and disposable restore fingerprinting.

Synthetic proof passed. Final D-019 run/job `32411404495` / `96562427495`: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; build PASS. PR #70 integrated the implementation. Real operator-local evidence remained missing and is now ON HOLD under D-031.

---

## 2026-08-20 — P10-S3-I2-I1 private stable-v1 staging/import compatibility accepted

Private staging/import compatibility was synthetically proven with stable IDs/timestamps, explicit current item classification, non-invented historical category state, atomic promotion/rollback, sequence repair and exact-cent financial reconciliation. No real store data moved.

---

## 2026-08-20 — D-030 zero-cost migration/durability contract accepted

D-030 defined the US$0 durability requirement: Supabase Free alone is insufficient; definitive zero-cost eligibility requires unattended off-site logical dumps, at least seven retained successful daily generations, exact-24h server-visible enforcement and restore drills. D-031 later refined sequencing, not the final durability requirement.

---

## 2026-08-20 — P10-S3-I1 Supabase foundation accepted

Dedicated `easy-v2` Supabase schema, RLS/approved-operator authorization, financial RPC boundary, typed client foundation and synthetic security/reconciliation evidence were accepted. No real data moved.

---

## 2026-08-20 — D-029 redirects final persistence to Supabase/Postgres

D-029 selected Supabase/Postgres canonical persistence with Vercel hosting, Auth/RLS, transactional financial operations, Dexie as transition/cache and independent manual logical backup before real data moved.

---

## 2026-08-19 and earlier

P1–P9 and P10-S1 completed the accepted referential lifecycle, audited financial correction, occurrence-date semantics, statement/debt logic, backup/restore hardening, D-024 local recovery guard, D-025 category snapshot/reporting behavior, D-026 full-field linked correction and synthetic stable-v1 migration/recovery rehearsal. Detailed history remains in prior Git revisions and phase-specific V2 documents.