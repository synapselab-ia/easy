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
- **P10-S3-I1 — Supabase foundation with synthetic data only: `NOT_STARTED` — CURRENT.**

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

No Supabase schema/client runtime implementation is accepted yet. That is P10-S3-I1.

## Repository / deployment baseline entering P10-S3

- stable `main` remains **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- candidate/rehearsal runtime SHA remains **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**;
- P10-S2 contract integrated as **`4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`**, tree **`2ab1e7b476ef620cf067faecd7c996fcf362c88a`**;
- P10-S2-I1 pre-export NO-GO record integrated as **`e06c659ecdb3aee79e2e451b00eb85d63c8b8612`**, tree **`4da05cdda530b1e7000d01460201dff1daf65910`**;
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

This evidence remains valuable for the future stable-v1 → Supabase import path. It does **not** authorize real-data import by itself.

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

D-012 through D-029 remain authoritative, with supersession relationships respected. In particular:

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

No production/cutover authorization is accepted by D-029.

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

## P10 boundary entering P10-S3-I1

1. `main` remains untouched;
2. no live-store data has moved into V2/Supabase;
3. no V2 stable publication/canonical URL switch/production cutover has occurred;
4. D-029 now controls the persistence route;
5. the prior P10-S2-I1 IndexedDB beta must not be resumed by default;
6. current stable production remains browser-local and keeps D-024 until cutover;
7. P10-S3-I1 must use **synthetic data only**;
8. no service-role/secret key may be exposed to the browser/repository;
9. no real-data import is allowed until schema, RLS/Auth, transactional integrity, synthetic migration/reconciliation and QA evidence pass;
10. a later explicit gate is still required for real-data migration and production cutover.

## NEXT_ACTION

**Execute only P10-S3-I1 — Supabase foundation with synthetic data under D-029 / `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`. First select/create one dedicated Easy Supabase project in an explicitly chosen Supabase organization and region; do not reuse an unrelated application's database. Then establish reproducible schema migrations for categories/items/resellers/transactions plus the minimum authorization metadata, enable/test RLS on every exposed table, establish the initial single-operator Supabase Auth/authorization model, preserve D-013/D-026 correction atomicity through a transactional database/server boundary, wire React/Vite through `supabase-js` with only project URL + publishable key, and prove the foundation with synthetic data, Supabase security/performance advisors and repository D-019. Keep all real store data out. Do not modify/publish `main`, switch the canonical URL or perform production cutover.**