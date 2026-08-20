# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-20

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `ABANDONED`, `DONE`.

---

## P0–P8

**Status:** `DONE`.

P0 governance, P1 referential lifecycle, P2 audited correction/reversal, P3 financial dates/statements/aging, P4 original D-016 persistence decision, P5 backup/restore, P6 D-019 QA/deployment, P7 operational UX and P8 direct-store discovery are complete.

D-016 was valid through P8/P9 and is retained as historical evidence, but D-029 later supersedes it for the final production persistence route.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `DONE / INTEGRATED` — 2026-08-19.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — D-023 order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

### P9-S2 — Recovery durability

**Status:** `DONE` — D-024 implemented synchronized recovery-copy folder + exact 24-hour freshness guard while the system remained local-first.

D-024 remains mandatory for the current browser-local stable production system until a later cloud cutover. Under D-029 it is no longer the intended final primary durability mechanism.

### P9-S3 — Categories/classification/reporting

**Status:** `DONE / INTEGRATED`.

D-025 is fully implemented through persistence/migration/backup, lifecycle/classification/order snapshots and category reporting.

### P9-S4 — Confirmed correction microflows

**Status:** `DONE / INTEGRATED`.

D-026 is fully implemented through audited full-field linked replacement while preserving D-012/D-013, D-024, D-025 and P1/D-011 boundaries.

Final runtime proof: D-019 `32285620846` / `96174326588`; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`; tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

### P9-S5 — Occurrence-date usability verification

**Status:** `DONE / INTEGRATED`.

No runtime usability gap was found. Transaction entry already defaults `Data da ocorrência` to browser-local today, permits editing before save and persists `occurredAt` independently from `createdAt`.

Validation: D-019 `32287018048` / `96178850066`; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`.

---

## P10 — Controlled migration and cutover

**Status:** `IN_PROGRESS` — 2026-08-20.

P10 is fail-closed. Completion/acceptance of one slice never authorizes the next data, persistence or publication boundary implicitly.

Historical cutover plan: `docs/V2/P10_CUTOVER_PLAN.md`.  
Current final persistence gate: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

### P10-S1 — Pre-cutover compatibility and synthetic rehearsal

**Status:** `DONE / ACCEPTED` — 2026-08-19.

D-027 kept this slice non-production:

- `main` stayed untouched;
- stable→V2 transfer was treated as explicit backup/preflight/restore;
- no live-store backup was exported/imported;
- P10-S1-I1 aligned backup validation with D-026;
- P10-S1-I2 synthetically proved v1→v2 migration/recovery on the deployed Vercel candidate.

#### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED`.

Authoritative D-019 `32292888925` / `96197514379`: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS. PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`.

#### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `DONE / REHEARSED`.

Candidate:

- Vercel deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki` — READY;
- Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`.

Evidence-only PR #62 authoritative run `32298906351` / `96216688953` first passed normal D-019 and then remote synthetic rehearsal 1/1.

The synthetic fixture proved accepted stable-v1 normalization, restore/checkpoint, D-024 blocking/setup, legacy unclassified-item gating, classification, order, D-026 correction, V2 export and fresh-context identical round-trip.

No store data was used.

### P10-S2 — Copied-live-data IndexedDB beta contract

**Status:** `DONE / ACCEPTED HISTORICALLY` — D-028.

Authoritative contract: `docs/V2/P10_S2_BETA_GATE.md`.

D-028 defined how one point-in-time copy of the actual store dataset could be tested safely in an isolated IndexedDB beta with exact structural/financial reconciliation, D-018/D-024 proof, minimum beta mutation checks and 24-hour disposal.

The contract itself moved no real store data.

### P10-S2-I1 — Copied-live-data IndexedDB beta execution

**Status:** `ABANDONED / SUPERSEDED BEFORE EXPORT` — 2026-08-20.

Execution record: `docs/V2/P10_S2_I1_EXECUTION.md`.

What happened:

- candidate/deployment identity passed;
- operator-local browser isolation/D-024 location proof could not be completed remotely;
- fail-closed behavior stopped execution before any stable-v1 backup was exported;
- PR #65 recorded that NO-GO and integrated as `e06c659ecdb3aee79e2e451b00eb85d63c8b8612`, tree `4da05cdda530b1e7000d01460201dff1daf65910`;
- no real-data beta artifact was ever created and the D-028 disposal clock never started.

D-029 then redirected final persistence to Supabase before the real dataset was moved twice. The old D-028 beta route must not resume by default.

### P10-S3 — Supabase canonical-persistence transition

**Status:** `IN_PROGRESS` — **CURRENT PROGRAM**.  
**Decision:** D-029.  
**Authoritative architecture:** `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

Accepted final direction:

- Vercel remains the target frontend host;
- Supabase/Postgres becomes canonical production persistence;
- Supabase Auth + RLS are mandatory;
- service/secret keys stay out of browser/Git;
- Dexie becomes transitional migration substrate/optional cache rather than source of truth;
- first cloud migration does not include offline multi-master writes;
- D-013/D-026 correction/reversal remains server/database-transaction atomic;
- paid production uses managed database backup as primary durability; D-030/US$ 0 instead requires proven unattended off-site logical dumps + exact-24h freshness enforcement + restore drills before cutover;
- logical/manual Easy backup remains independent secondary recovery/portability;
- D-024 remains active on current browser-local stable until cutover;
- no real store data may move until the synthetic Supabase foundation passes.

#### P10-S3-I1 — Supabase foundation with synthetic data only

**Status:** `DONE / ACCEPTED`.

Accepted execution: `docs/V2/P10_S3_I1_EXECUTION.md`. Dedicated `easy-v2` Supabase project, reproducible migrations, RLS/allow-list authorization, transactional financial RPC boundary, typed `supabase-js` client foundation, advisor review and synthetic reconciliation all passed. All synthetic rows were disposed and no real store data moved.

Completed work:

1. explicitly select a Supabase organization and region, then create/select a **dedicated Easy project**;
2. establish reproducible schema migrations for categories/items/resellers/transactions plus minimum authorization metadata;
3. preserve existing IDs/snapshots and define the import-safe identity/sequence strategy;
4. add database constraints/indexes that reinforce existing domain invariants without inventing new business semantics;
5. enable RLS on every exposed application table;
6. establish and test the initial one-operator Auth/authorization model;
7. implement a transactional server/database correction/reversal operation preserving D-013/D-026 atomicity;
8. wire React/Vite through `supabase-js` using only URL + publishable key;
9. keep all real store data out and use synthetic fixtures only;
10. run Supabase security/performance advisors and repository D-019;
11. record exact evidence and define the next real-data migration/reconciliation gate.

Exit criterion: a synthetic Supabase-backed foundation that objectively preserves the critical domain/security boundaries and is reproducible from repository migrations. **No real-data import or production publication.**

#### P10-S3-I2 — Real-data migration/reconciliation + zero-cost durability contract

**Status:** `DONE / ACCEPTED CONTRACT` — D-030.

Authoritative contract: `docs/V2/P10_S3_I2_MIGRATION_GATE.md`.

D-030 defines the exact source freeze/digest, private stable-v1 staging, deterministic normalization, current-item classification, atomic promotion, ID/sequence repair, structural/reference/financial reconciliation, private Auth onboarding evidence, candidate identity, rollback and zero-cost durability boundary. Supabase Free alone remains insufficient; production eligibility requires proven unattended off-site logical dumps, >=7 successful generations, exact-24h server-visible freshness enforcement and restore proof.

No real store data moved in contract definition.

##### P10-S3-I2-I1 — Legacy stable-v1 staging/import compatibility

**Status:** `DONE / ACCEPTED — SYNTHETIC ONLY`.

Accepted execution: `docs/V2/P10_S3_I2_I1_EXECUTION.md`.

Completed proof:

1. committed non-exposed/private staging/import migrations;
2. reused only the already-approved stable-v1 normalization and rejected unexplained source fields;
3. preserved stable item/reseller/transaction IDs and timestamps;
4. permitted legacy active-unclassified items only in private staging;
5. required complete explicit current-item classification before public promotion;
6. preserved null historical category snapshots for stable-v1 orders;
7. promoted categories/items/resellers/transactions atomically with rollback proof;
8. repaired identity sequences using `pg_get_serial_sequence` metadata rather than hard-coded names;
9. reconciled exact structure, references and integer-cent financial totals with synthetic fixtures;
10. denied staging DML/function execution to browser/API roles;
11. cleaned all synthetic public/staging/Auth state back to zero and completed advisor + repository QA evidence.

Substantive D-019 `32403912177` / `96538355033` passed on merge ref `9844a2f0095fa3443aed358892f9801f1c2bc64b`: 0 lint errors / 82 warnings; 55 files / 231 Vitest PASS; 17/17 Playwright PASS; production build PASS. Exact final PR-tree validation remains part of PR #69 closure.

No unattended backup automation, real Auth, runtime switch or real data was introduced in this slice.

##### P10-S3-I2-I2 — Zero-cost unattended backup/recovery proof

**Status:** `BLOCKED / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF REQUIRED` — **CURRENT NEXT ACTION / SYNTHETIC ONLY**.

Execution record: `docs/V2/P10_S3_I2_I2_EXECUTION.md`.

Implemented/proven remotely:

1. reproducible trusted-PC backup tooling using pinned Supabase CLI `2.111.0` and `supabase db dump --linked --data-only`;
2. protected configuration contract outside browser/client/Git with scheduled-job rejection of injected database URLs/passwords;
3. rclone `1.75.0` off-site path using `copyto` + `check --download --one-way` + remote listing verification;
4. daily-generation rotation that refuses retention configuration below seven days;
5. private server-visible latest-success/retention state;
6. exact-24h business-write guard on categories/items/resellers/transactions and financial RPC paths;
7. fail-closed proof for missing/stale evidence and for fresh evidence with only six retained daily generations;
8. recovery after valid fresh evidence with retention >=7;
9. API-style `service_role` cannot bypass the guard, while direct no-JWT database execution remains the narrow restore/import maintenance boundary;
10. committed disposable local restore-drill/fingerprint implementation for exact structure/reference/integer-cent financial reconciliation;
11. Security Advisor 0 lints and final synthetic homologation cleanup to zero rows;
12. substantive PR #70 D-019 `32408393343` / `96552818604` passed on merge ref `6b83fe3e9b5939c788aa7a3640e7fc83607fd260`: 0 lint errors / 82 warnings; 56 files / 237 Vitest PASS; 17/17 Playwright PASS; production build PASS.

Still required before acceptance:

1. execute the committed scheduled dump on the actual trusted operator PC using its local Supabase credential boundary;
2. objectively prove arrival/check success on the actual configured off-site rclone remote;
3. accumulate and verify at least seven successful retained UTC daily generations in that destination;
4. prove the server-side health becomes healthy only after the real freshness + retention conditions are met;
5. execute the committed disposable Docker/local restore drill from an eligible synthetic artifact on the trusted PC;
6. reconcile the restored synthetic structure/references/financial data exactly and clean the disposable recovery state;
7. rerun advisors and final D-019 with sanitized evidence.

Until those operator-local items pass, I2-I2 remains `BLOCKED`, I2-I3 is not authorized and Supabase Free remains production-ineligible under D-030.

No real store data, real production Auth operator, Supabase-backed business-runtime switch, `main` publication, canonical URL switch or production cutover is authorized by I2-I2.

##### P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate

**Status:** `NOT_STARTED / NOT_AUTHORIZED UNTIL I2-I2 PASSES`.

Synthetic-only future slice: one-operator Auth/session UI, cloud-authoritative CRUD/financial RPC reads/writes, fail-closed connectivity, full app-level parity and exact Vercel candidate identity.

##### P10-S3-I2-I4 — Real migration/reconciliation execution

**Status:** `NOT_STARTED / NOT_AUTHORIZED UNTIL I2-I1/I2-I2/I2-I3 PASS`.

Future maintenance-window execution only: real source freeze/export digest, private real Auth onboarding, staging/promotion, exact parity and first real automated backup + local restore drill. Canonical URL switch still requires an explicit later gate.

### Later P10 work

**Status:** `NOT_AUTHORIZED`.

Final write freeze, stable publication, canonical URL switch, production traffic cutover, post-cutover rollback policy and decommissioning of the old browser-local stable application require later explicit gates.
