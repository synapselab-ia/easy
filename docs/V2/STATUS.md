# Easy V2 — Canonical Status

**Updated:** 2026-08-20  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `DONE / INTEGRATED`.**  
**P10 — Controlled migration and cutover: `IN_PROGRESS`.**

Phase state:

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`, original D-016 later superseded for final production by D-029.
- P5 — Backup, restore and migration: `DONE` for the local-first baseline.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Incomplete UX flows / operational refinement: `DONE`.
- P8-S1 — Repository-evidence discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and then-current D-016 keep decision: `DONE`.
- P9-S1 — Evidence-backed prioritization: `DONE`.
- P9-S2 — Recovery durability: `DONE`.
- P9-S3 — Categories/classification/reporting: `DONE / INTEGRATED`.
- P9-S4 — Confirmed correction microflows: `DONE / INTEGRATED`.
- P9-S5 — Occurrence-date usability verification: `DONE / INTEGRATED`.
- **P10-S1 — Pre-cutover compatibility and rehearsal gate: `DONE / ACCEPTED`.**
- P10-S1-I1 — Backup/correction compatibility hardening: `DONE / INTEGRATED`.
- **P10-S1-I2 — Non-production migration/recovery rehearsal: `DONE / REHEARSED`.**
- **P10-S2 — Copied-live-data beta acceptance contract: `DONE / ACCEPTED` — D-028 historical contract.**
- **P10-S2-I1 — Copied-live-data IndexedDB beta execution: `ABANDONED / SUPERSEDED BEFORE EXPORT` — no real data moved.**
- **P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS` — D-029.**
- **P10-S3-I1 — Supabase foundation with synthetic data only: `DONE / ACCEPTED`.**
- **P10-S3-I2 — Real-data migration/reconciliation + zero-cost durability contract: `DONE / ACCEPTED CONTRACT` — D-030.**
- **P10-S3-I2-I1 — Legacy stable-v1 staging/import compatibility with synthetic data only: `DONE / ACCEPTED`.**
- **P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof with synthetic data only: `BLOCKED / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF REQUIRED` — CURRENT.**

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source/evidence required by `NEXT_ACTION`.

Phase-specific canonical evidence:

- `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` — P8 evidence;
- `docs/V2/P9_PRIORITIZATION.md` — P9-S1 scoring/source inventory;
- `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` and `P9_RECOVERY_DECISION.md` — P9-S2;
- `docs/V2/P9_CATEGORY_CONTRACT.md` — completed D-025 / P9-S3 record;
- `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` and `P9_CORRECTION_DECISION.md` — completed D-026 / P9-S4 record;
- `docs/V2/P9_DATE_USABILITY.md` — completed P9-S5 verification record;
- `docs/V2/P10_CUTOVER_PLAN.md` — P10-S1 contract, I1 compatibility result, accepted I2 rehearsal evidence and historical P10 sequencing;
- `docs/V2/P10_S2_BETA_GATE.md` — accepted D-028 copied-live-data beta contract, now historical/superseded for the final route by D-029;
- `docs/V2/P10_S2_I1_EXECUTION.md` — evidence that P10-S2-I1 stopped fail-closed before any real-data export;
- **`docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md` — authoritative D-029 final architecture and P10-S3 boundary.**
- **`docs/V2/P10_S3_I1_EXECUTION.md` — accepted synthetic Supabase foundation execution evidence.**
- **`docs/V2/P10_S3_I2_MIGRATION_GATE.md` — accepted D-030 real-data migration/reconciliation + zero-cost durability contract.**
- **`docs/V2/P10_S3_I2_I1_EXECUTION.md` — accepted synthetic private stable-v1 staging/import compatibility proof.**
- **`docs/V2/P10_S3_I2_I2_EXECUTION.md` — implemented recovery-health/automation boundary and current operator-local acceptance blocker.**

## Current technical baseline versus accepted final target

The **currently implemented runtime** remains a React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB. Runtime V2 is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical logical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes in the existing local-first runtime remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. D-014/P3 occurrence-date semantics remain unchanged.

P10-S1-I1 aligns backup self-preflight/export with D-026 while retaining D-025 history semantics: type and financial occurrence date may change; a corrected order may change item and capture that target item's valid replacement-time snapshot; an order correction that keeps the same item must preserve the original category snapshot. Bidirectional audit linkage, referenced-ID existence, registration chronology and each transaction's own target shape/reference validity remain enforced.

No real store data was ever moved into the V2 IndexedDB beta.

**Accepted final target under D-029:**

- Vercel remains the target frontend/application host;
- Supabase/Postgres becomes the canonical production business datastore before cutover;
- Supabase Auth + RLS are mandatory before production;
- privileged/service keys must never ship to the browser;
- Dexie becomes transitional migration substrate and optional cache, not the final source of truth;
- no offline multi-master/write queue is introduced in the first cloud migration;
- D-013/D-026 atomic correction/reversal must be preserved through a transactional server/database boundary;
- the logical Easy backup remains available as independent portability/contingency;
- managed database backup becomes the primary durability layer after cloud cutover;
- D-024 remains mandatory for the current browser-local stable system until cutover, but its 24-hour manual-export write guard is not the intended final cloud durability mechanism.

P10-S3-I1 provides the accepted dedicated Supabase schema/security/client **foundation**. D-030/P10-S3-I2 defines the real migration/reconciliation and zero-cost durability contract. P10-S3-I2-I1 provides the accepted private stable-v1 staging/import compatibility implementation with synthetic data only. P10-S3-I2-I2 now adds the committed trusted-PC dump/rclone/scheduler/restore-drill tooling and the private server-visible recovery-health guard; however the actual operator-local off-site, seven-daily-generation and Docker restore evidence is still missing, so the durability slice remains blocked rather than accepted. The current user-facing business hooks/pages still use Dexie/IndexedDB; no real operator, real store data or production cutover has been introduced.

## Repository / deployment baseline entering P10-S3

- stable `main` remains **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- candidate/rehearsal runtime SHA remains **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**;
- P10-S2 contract integrated as **`4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`**, tree **`2ab1e7b476ef620cf067faecd7c996fcf362c88a`**;
- P10-S2-I1 pre-export NO-GO record integrated as **`e06c659ecdb3aee79e2e451b00eb85d63c8b8612`**, tree **`4da05cdda530b1e7000d01460201dff1daf65910`**;
- P10-S3-I2 contract integrated on `develop` as **`6bb0f8d2a332f978b182b0f6e88c890c6d175898`**;
- P10-S3-I2-I1 integrated on `develop` as **`a78331444f254688523aae70f8a0b81318735e5e`**, tree **`d4e690599b88379a5af13a408c47d56c3bb514d2`**;
- both `main` and `develop` remain unprotected branches, so D-019/PR discipline remains a process requirement;
- stable `main` still deploys its historical application to GitHub Pages;
- repository `vercel.json` continues to disable Git-triggered Vercel deployments;
- Vercel project `easy-v2` remains candidate/beta hosting only until a later accepted publication/cutover gate.

P10-S1-I2 verified READY Vercel deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`** as exact Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`. The immutable deployment URL requires Vercel SSO for `/backup`; Vercel metadata also attached public alias `easy-v2-tau.vercel.app` to that exact deployment, so the alias was used only as browser access while deployment ID/SHA provided candidate identity.

P10-S2-I1 re-verification on 2026-08-20 confirmed that deployment remained `READY`, reported the same Git SHA, carried the public alias and exposed `/backup`. That verification is retained as historical evidence only; D-029 redirects future persistence work to Supabase before real-data beta/cutover.

## Stable → V2 migration evidence already proven

The stable `main` application uses Dexie V1 and exports backup version 1 with `items`, `resellers`, `transactions`.

P10-S1-I2 synthetically proved the normalization mechanism:

- v1 preflight identifies in-memory v1→v2 migration;
- missing lifecycle state normalizes legacy items/resellers to active;
- missing transaction `occurredAt` normalizes to legacy `createdAt`;
- categories/category history are not fabricated;
- migrated legacy items remain unclassified;
- new orders remain blocked for unclassified active items until classification;
- restore creates the expected checkpoint artifact;
- D-024 blocks local-first normal writes until a fresh backup is exported and synchronized-copy verification is explicitly confirmed;
- after classification, supported order/correction flows operate normally;
- a final V2 backup containing a D-026 item/date correction can be restored into a disposable fresh browser context and re-exported with identical business data.

P10-S3-I2-I1 then reused the same accepted v1 normalization in a deterministic private Supabase staging/import path and proved it with synthetic fixtures. Stable IDs/timestamps, legacy null category history and exact-cent financial reconciliation survive promotion; active current items require explicit classification. This still does **not** authorize any real-data import.

## P10-S1-I1 blocker resolution

The pre-cutover recovery blocker identified while defining P10-S1 is resolved.

Before I1, `backupService.validateReferences()` required linked replacements to preserve transaction type, order item/category snapshot and `occurredAt`, which conflicted with valid D-026 corrections.

P10-S1-I1 removed only obsolete cross-record assumptions:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
- an order replacement may select another item and carry that replacement item's valid category snapshot;
- if an order replacement keeps the same item, the original D-025 category snapshot remains mandatory;
- bidirectional correction/reversal links, referenced IDs, registration chronology and each transaction's own target shape/reference validity remain mandatory.

Focused regression coverage proves valid type/date/item-changing corrections preflight/export successfully while broken links and invalid target shapes remain rejected.

## D-028 / P10-S2 historical copied-live-data beta contract

D-028 remains an accepted record of the fail-closed IndexedDB copied-live-data beta design. It required exact candidate identity, isolated single-operator handling, exact structural and financial reconciliation, D-018/D-024 recovery proof, minimum beta mutations, final round-trip and 24-hour disposal.

P10-S2-I1 then started only its pre-export checks. Candidate/deployment identity passed, while operator-local browser isolation/recovery-location checks remained unproven remotely. The gate correctly stopped **before export**.

No real copied data or beta artifact was created. The D-028 24-hour disposal clock never started.

D-029 now supersedes resuming that IndexedDB real-data beta route.

## D-029 / P10-S3 accepted Supabase architecture direction

D-029 is the new controlling persistence decision for final V2 production.

Direct requirement accepted on 2026-08-20: routine production durability must not depend primarily on a person remembering to create/synchronize a browser-local backup, while an independent manual/logical backup capability should remain available so the project is never locked to one recovery mechanism.

Consequences:

1. D-016 is reopened/superseded for final production persistence;
2. Supabase/Postgres is the target canonical datastore;
3. Vercel is the target frontend host;
4. P10-S2-I1 is abandoned before export rather than completed against IndexedDB;
5. one dedicated Easy Supabase project is required; no unrelated database reuse;
6. Auth + RLS + publishable-key-only browser configuration are mandatory;
7. core integrity must be enforced in Postgres where practical;
8. D-013/D-026 correction remains atomic through a transactional database/server boundary;
9. first cloud migration is online-authoritative and fail-closed on writes when connectivity is unavailable; offline write synchronization is explicitly later work;
10. managed database backups become primary durability after cutover, while logical/manual Easy backup remains independent secondary recovery/portability;
11. current D-024 remains active for stable browser-local production until cutover;
12. real store data may not move until the Supabase schema/security/synthetic-reconciliation foundation is proven.

Detailed contract: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

## Authoritative decisions

D-012 through D-030 remain authoritative, with supersession/refinement relationships respected. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- D-014 separates financial occurrence (`occurredAt`) from registration/audit time;
- **D-016 historical local-first/single-user topology is superseded for final production persistence by D-029;**
- D-017 keeps logical `easy-backup` v2 as an independent interchange/recovery contract unless a later migration version explicitly extends it;
- D-018 keeps checkpointed/verified restore semantics for the local interchange path;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 remains current stable recovery protection until cloud cutover;
- D-025 keeps stable category identity and immutable historical category snapshots;
- D-026 keeps effective transaction business fields correctable through audited linked replacement;
- D-027 retains fail-closed pre-cutover discipline;
- D-028 is the accepted historical IndexedDB copied-beta contract, now superseded as the final route;
- **D-029 selects Supabase/Postgres canonical persistence + Auth/RLS + Vercel final hosting, keeps manual logical backup as secondary protection, and forbids real-data import before the synthetic cloud foundation passes.**
- **D-030 refines D-029 for the US$ 0 posture: Supabase Free alone is insufficient, but a proven unattended off-site logical-dump layer + exact-24h server write guard + restore drills may satisfy the durability objective without paid managed backups.**

No production/cutover authorization is accepted by D-029 or D-030.

## Accepted validation baseline

P9-S1 through P9-S5 have accepted validation/integration evidence. Final P9-S5 runtime-neutral verification was PR #56 / D-019 `32287018048` / `96178850066`, integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`. Canonical P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

P10-S1 contract proof:

- PR #58 D-019 `32290159119` / `96188851730`, validated merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`;
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`;
- validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

P10-S1-I1 implementation proof:

- initial D-019 `32292405631` / `96196002726` correctly blocked an over-broad implementation;
- authoritative D-019 **`32292888925`** / **`96197514379`** passed: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #60 integrated as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated/integrated tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

P10-S1-I2 rehearsal proof:

- evidence-only PR #62 was based on candidate `develop` SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e` and closed **without merge**;
- authoritative run **`32298906351`**, job **`96216688953`**, exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**;
- ordinary D-019 passed first: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; production build PASS**;
- remote candidate rehearsal then passed **1/1**.

P10-S1 canonical closure:

- PR #63 D-019 `32299844759` / `96219639912`, exact validated merge ref `ee08bf5a8682ad9ba06e52368f2ac422d401d080`;
- PR #63 squash-integrated as **`816794694d0a9b6c92da273a81ee745c2f53ecdc`**;
- validated/integrated tree **`417dd4097144d9f69124161b34747b3e81244ae7`**.

P10-S2 contract:

- PR #64 substantive D-019 `32380195551` / `96461233352`;
- final PR-head D-019 `32380528003` / `96462340384` — PASS;
- PR #64 squash-integrated as **`4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`**;
- validated/integrated tree **`2ab1e7b476ef620cf067faecd7c996fcf362c88a`**.

P10-S2-I1 pre-export NO-GO record:

- substantive D-019 `32382362960` / `96468435138` — PASS;
- final D-019 `32382928429` / `96470305608` — PASS;
- final validated PR merge ref `af01a7f8ac280305f5ff86c06416127321580ec2`;
- PR #65 squash-integrated as **`e06c659ecdb3aee79e2e451b00eb85d63c8b8612`**;
- validated/integrated tree **`4da05cdda530b1e7000d01460201dff1daf65910`**;
- `main` remained untouched and no live-store data moved.

P10-S3-I1 synthetic Supabase foundation proof:

- dedicated project `easy-v2` / `hrmkkhqfyfoqucwbcszq` in `sa-east-1`;
- migrations `20260820154034` and `20260820154402`; all five public application tables RLS-enabled; final Security Advisor 0 lints;
- diagnostic D-019 `32388839983` / `96489804473` correctly blocked a TypeScript env-boundary mismatch after lint/Vitest/E2E had passed;
- corrected authoritative D-019 **`32394126648`** / **`96506890991`**, exact validated PR merge ref **`c12a535b665eb25626a1b3bb0aa15cd034808e00`**: 0 lint errors / 82 warnings; 54 files / 225 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- final synthetic-data disposal verified all five application/authorization tables at 0 rows; no real store data moved.

P10-S3-I2 migration/durability contract proof:

- D-030 contract closure D-019 `32399725148` / `96524749660` passed on merge ref `f18f9b6c3d77b1b95284e92487be8819a9a48922`;
- contract integrated to `develop` as `6bb0f8d2a332f978b182b0f6e88c890c6d175898`;
- no real data/Auth/runtime/publication moved in contract definition.

P10-S3-I2-I1 synthetic staging/import proof:

- private staging migrations `20260820181848`, `20260820182305`, `20260820182344` applied/reproduced against empty `easy-v2` homologation;
- synthetic invalid-reference/classification/promotion rollback cases passed; successful import preserved IDs `10/25`, `7/42`, `100/250/900`, legacy null category history and exact timestamps;
- integer-cent reconciliation passed: gross `2500`, payments `525`, signals `750`, net `1225`, aggregate positive debt `1975`, exact per-reseller balances;
- identity sequence repair used PostgreSQL metadata and verified next values above maxima;
- Security Advisor 0 lints; Performance Advisor only INFO `unused_index` findings, no staging `unindexed_foreign_keys`;
- diagnostic D-019 `32403226500` / `96536125014` correctly blocked TS18048 only at build after lint/231 Vitest/17 Playwright had passed;
- corrected substantive D-019 **`32403912177`** / **`96538355033`**, exact merge ref **`9844a2f0095fa3443aed358892f9801f1c2bc64b`**: 0 lint errors / 82 warnings; 55 files / 231 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- final homologation cleanup rechecked 0 Auth users, 0 operator/public business rows and 0 private staging/classification rows;
- exact final tree-equivalent D-019 is recorded in PR #69 closure evidence before integration.

P10-S3-I2-I2 implementation evidence — **NOT acceptance**:

- committed trusted-PC backup/rclone/scheduler/restore-drill tooling and private server-visible recovery-health migrations;
- live homologation proves missing/stale evidence blocks, exact 24h is accepted, 24h + 1 microsecond blocks, fresh evidence reopens, retention `<7` blocks through the actual trigger, RPC writes obey the same guard, and API-style `service_role` cannot bypass it;
- direct no-JWT database execution remains the narrow restore/import maintenance boundary;
- Security Advisor 0 lints; Performance Advisor remains INFO-only `unused_index` on the empty environment;
- final homologation cleanup rechecked 0 Auth/operator/business/recovery/staging rows;
- substantive PR #70 D-019 **`32408393343`** / **`96552818604`** passed on exact merge ref **`6b83fe3e9b5939c788aa7a3640e7fc83607fd260`**: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- the actual trusted-PC off-site copy, seven retained successful daily generations and disposable Docker restore drill remain unproven; therefore I2-I2 is still blocked and I2-I3 is not authorized.

## P10-S3-I2-I2 current blocked boundary

1. `main` remains untouched at the historical stable baseline;
2. no live-store data has moved into V2/Supabase;
3. no real Supabase Auth user/operator exists yet;
4. the dedicated `easy-v2` project remains empty of Auth/application/staging/recovery rows after synthetic proof;
5. P10-S3-I1 schema/RLS/RPC foundation and P10-S3-I2-I1 private stable-v1 staging/import compatibility remain accepted synthetically;
6. I2-I2 repository/database prerequisites are implemented: unattended dump tooling, objective rclone verification path, retention logic, server-visible recovery health, exact-24h/retention write guard and disposable restore-drill code;
7. actual off-site execution evidence is intentionally absent because the trusted operator PC/rclone credential boundary is outside this environment;
8. at least seven real successful daily generations have not yet been observed in the accepted recovery destination;
9. the committed Docker/local restore drill has not yet been executed against the trusted-PC synthetic artifact;
10. Security Advisor is 0 lints; performance findings remain INFO-only unused indexes in the empty environment;
11. P10-S3-I2-I3 Auth/runtime candidate and P10-S3-I2-I4 real migration remain unauthorized;
12. no real-data export/import, real Auth onboarding, Supabase-backed business-runtime switch, `main` publication, canonical URL switch or production cutover is authorized while I2-I2 remains blocked.

## NEXT_ACTION

**Execute only the remaining operator-local acceptance proof for P10-S3-I2-I2 using the committed `scripts/recovery/` procedure on the trusted store PC. Configure Supabase CLI native credentials and the rclone remote outside Git/browser/Vercel/chat, install/run the unattended scheduler, capture sanitized evidence of a successful synthetic data-only dump and objective off-site verification, accumulate and verify at least seven successful retained UTC daily generations, confirm the server-side recovery health becomes healthy only with both freshness <= exactly 24h and retention >=7, execute the committed disposable Docker/local restore drill from an eligible synthetic artifact and reconcile structure/references/financial data exactly, clean disposable recovery state, then rerun relevant Supabase advisors and repository D-019 and record sanitized evidence. Do not begin P10-S3-I2-I3, create/use the real production Auth operator, switch the business runtime from Dexie to Supabase, export/import real store data, modify/publish `main`, switch the canonical URL or perform production cutover until this proof passes.**
