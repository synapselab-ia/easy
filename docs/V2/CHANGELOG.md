# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-20 — P10-S3-I2 migration + zero-cost durability contract accepted as D-030

P10-S3-I2 defined the real-data migration/reconciliation contract without moving real store data. Source inspection exposed a deliberate compatibility boundary: stable-v1 items normalize active but unclassified, while the current Supabase public `items` table requires active items to have categories. D-030 therefore forbids direct v1 insertion and selects a non-exposed/private staging path, explicit **current** item classification, then atomic promotion while historical stable-v1 order category snapshots remain null.

The contract preserves stable item/reseller/transaction IDs, requires identity-sequence repair from PostgreSQL metadata and keeps structural/reference/financial reconciliation exact to R$ 0,00 difference.

With paid infrastructure fixed at US$ 0, D-030 does not pretend Supabase Free has managed automatic backups. It conditionally accepts a future Free production posture only after provider-recommended logical `db dump` is made unattended on the trusted store PC, placed in an objectively verified off-site/synchronized recovery boundary, retains at least seven successful daily generations, drives an exact-24h server-visible fail-closed write guard and passes restore drills. Free-plan pausing remains an availability risk; it never enables offline-authoritative writes.

Execution is decomposed so the next action is synthetic-only private staging/import compatibility. Backup automation, real Auth/runtime, real migration and canonical publication remain later explicit slices.

Authoritative contract: `docs/V2/P10_S3_I2_MIGRATION_GATE.md`.

---

## 2026-08-20 — P10-S3-I1 Supabase foundation proven with synthetic data

P10-S3-I1 established the dedicated `easy-v2` Supabase/Postgres foundation in `sa-east-1` without importing any real store data. Repository/live migrations create the canonical category/item/reseller/transaction substrate plus server-managed operator authorization metadata. All exposed application tables have RLS. Financial create/reverse/correct operations cross one controlled PostgreSQL transaction boundary through public invoker RPCs backed by non-exposed privileged implementations.

Synthetic proof covered approved/unauthorized access, blocked direct transaction DML, changed-item snapshot capture, same-item historical category preservation and atomic rollback on invalid correction. Security Advisor finished with 0 lints; performance advisor reported only INFO unused-index notices on the empty/tiny synthetic dataset. All synthetic rows were then disposed and final table counts were zero.

Repository client foundation pins `@supabase/supabase-js` 2.112.3, commits the npm lockfile/generated types, exposes only URL + publishable-key variable names and keeps existing Dexie business hooks/pages unchanged.

Diagnostic D-019 `32388839983` / `96489804473` correctly blocked a TypeScript env-boundary mismatch. After the minimal fix, authoritative run **`32394126648`** / **`96506890991`** passed on merge ref `c12a535b665eb25626a1b3bb0aa15cd034808e00`: **0 lint errors / 82 warnings; 54 files / 225 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

P10-S3-I1 is `DONE / ACCEPTED`. P10-S3-I2 is now the only current action and is contract-definition only. Current paid-infrastructure budget is **US$ 0**: the next gate may not assume Supabase Pro/PITR or another paid add-on and must keep cutover blocked if a zero-cost recovery posture cannot satisfy D-029. No real-data export/import, `main` publication, canonical URL switch or production cutover is authorized.

Authoritative execution record: `docs/V2/P10_S3_I1_EXECUTION.md`.

---

## 2026-08-20 — Final persistence redirected to Supabase/Postgres; D-029 accepted

Before any real store backup was exported for the P10-S2-I1 IndexedDB beta, the final production durability requirement was explicitly changed: routine production safety should no longer depend primarily on an operator remembering to create/synchronize browser-local backups, while the system should retain an independent logical/manual backup option for contingency and portability.

D-029 therefore reopens/supersedes D-016 for final production persistence and selects:

- Supabase/Postgres as canonical production business persistence;
- Vercel as the target application host;
- Supabase Auth + RLS before production;
- publishable-key-only browser configuration with no service/secret credential exposure;
- database/server transactional preservation of D-013/D-026 correction/reversal atomicity;
- Dexie/IndexedDB as transitional migration substrate/optional cache rather than final source of truth;
- managed database backups as primary post-cutover durability;
- logical/manual Easy backup as independent secondary protection/portability;
- no offline multi-master/write queue in the first cloud migration.

D-024 remains mandatory for the current browser-local stable system until cloud cutover, but its 24-hour operator-export write guard is no longer the intended final production durability mechanism after managed cloud backup readiness is proven.

P10-S2-I1 is now `ABANDONED / SUPERSEDED BEFORE EXPORT`; no real data moved and no beta disposal clock ever started. P10-S3 is current. The next bounded action is P10-S3-I1: provision/prove a dedicated Supabase foundation with synthetic data only, reproducible schema migrations, Auth/RLS, transactional correction/reversal, `supabase-js` client wiring, advisor review and D-019.

Authoritative contract: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.

No Supabase schema/client runtime, real-data migration, `main` publication, canonical URL switch or production cutover is accepted by this architecture-decision step.

---

## 2026-08-20 — P10-S2-I1 stopped fail-closed before any real-data export

P10-S2-I1 began only the D-028 pre-export checklist. Candidate/deployment identity passed, but the trusted store PC still needed to prove an isolated beta browser context, the actual D-024 synchronized recovery destination and the explicit stable-authoritative/beta-disposable boundary.

Because those operator-local facts could not be proven from the remote repository/deployment environment, the gate correctly remained `NO-GO BEFORE EXPORT`.

PR #65 recorded the result. Substantive D-019 `32382362960` / `96468435138` passed; final D-019 `32382928429` / `96470305608` passed on merge ref `af01a7f8ac280305f5ff86c06416127321580ec2`: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS. PR #65 squash-integrated as `e06c659ecdb3aee79e2e451b00eb85d63c8b8612`, tree `4da05cdda530b1e7000d01460201dff1daf65910`.

No live-store backup was exported/imported, no real copied data entered GitHub/chat/CI/docs, no beta real-data IndexedDB/artifact was created and the 24-hour D-028 disposal clock never started.

This fail-closed stop later made it possible to redirect final persistence under D-029 without moving the real dataset twice.

---

## 2026-08-20 — P10-S2 copied-live-data beta contract defined; D-028 accepted

P10-S2 contract definition completed without moving any live-store data and without changing runtime, schema, backup envelope, deployment configuration, `main` or then-current D-016.

Authoritative contract: `docs/V2/P10_S2_BETA_GATE.md`.

D-028 defined a point-in-time, single-operator, isolated and disposable non-production beta. Stable would remain the only authoritative production system; beta state would never synchronize or promote back to stable.

Before any real-data export, P10-S2-I1 had to prove exact D-019-passing Git SHA/tree, READY deployment identity, current alias→deployment mapping when a mutable alias was used, trusted operator/browser isolation and the approved D-024 working/recovery boundary.

The source snapshot would be identified only by non-sensitive timestamp/file-size/SHA-256 metadata. Raw backups, identifiable screenshots/PDFs and transaction payloads were prohibited from Git/GitHub, CI artifacts, chat and canonical docs.

Reconciliation was exact and fail-closed. Before any beta mutation, entity/type counts, IDs, references and stored business values had to survive accepted v1→V2 normalization without unexplained differences. Gross orders, payments, signals, net movement, every reseller balance and aggregate positive debt had to reconcile exactly; any displayed difference of R$ 0,01 was NO-GO.

D-018 checkpoint and D-024 blocking/setup/current-state proof were mandatory before beta writes. A post-reconciliation V2 backup would become the rollback baseline. Minimum beta acceptance then required unclassified-item gating, representative classification, one beta-only order, one D-026 correction, final V2 export and disposable fresh-context restore/re-export with identical business data.

D-029 later superseded **resuming** this IndexedDB real-data beta route before any live-store export occurred. D-028 remains historical safety evidence.

---

## 2026-08-19 — P10-S1-I2 synthetic migration/recovery rehearsal passed; P10-S1 closed

P10-S1-I2 executed the bounded non-production rehearsal required by D-027. No live-store backup was exported/imported and `main` remained untouched.

The rehearsed Vercel candidate was verified as READY deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`**, exact Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**. The immutable deployment URL required Vercel SSO for `/backup`; Vercel metadata attached public alias `easy-v2-tau.vercel.app` to that exact deployment, so the alias was used only as browser access while deployment ID/SHA remained the identity proof.

Evidence-only PR #62 used a temporary branch-local Playwright harness and was deliberately closed **without merge** after evidence capture. The authoritative run **`32298906351`**, job **`96216688953`**, exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**, first passed ordinary D-019: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; production build PASS**. The remote deployed-candidate rehearsal then passed **1/1**.

Using only a synthetic stable-v1 fixture, the rehearsal proved v1→v2 preflight/restore and checkpoint creation; 2 items / 2 resellers / 3 legacy transactions with expected lifecycle/`occurredAt` normalization; no fabricated categories/history; D-024 write blocking before recovery setup; fresh backup plus explicit synchronized-copy verification; unclassified-item order blocking; representative classification; supported new order; D-026 changed-item/date correction; V2 export; and disposable fresh-context restore/re-export with identical business data.

Two earlier runs are retained only as diagnostics: `32297959050` / `96213645569` exposed Vercel SSO before application access, and `32298286885` / `96214717360` exposed a Playwright viewport/actionability issue before restore dispatch. Neither was accepted as product evidence.

**Result:** P10-S1 is `DONE / ACCEPTED`. The rehearsal gave a GO only to define the P10-S2 copied-live-data beta gate. It did not authorize moving real store data, production reconciliation, stable publication, canonical URL switch, production cutover or architecture change.

---

## 2026-08-19 — P10-S1-I1 backup/correction compatibility hardened and integrated

P10-S1-I1 resolved the pre-cutover recovery blocker identified while defining D-027. `backupService.validateReferences()` no longer requires a valid D-026 replacement to preserve original transaction type, order item or financial occurrence date.

D-025/audit boundaries remain exact: changed item may carry the new target's valid category snapshot; same-item order replacement must preserve historical category snapshot; bidirectional correction/reversal linkage, referenced-ID existence, registration chronology and each row's target shape/reference validity remain mandatory. Backup-v1 and v2/schema4 compatibility remain passing; no schema or envelope version changed.

The first D-019 `32292405631` / `96196002726` correctly blocked an over-broad implementation because an existing P9-S3 same-item snapshot regression failed. After narrowing, authoritative D-019 **`32292888925`** / **`96197514379`** passed on PR #60 merge ref `d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

PR #60 integrated as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**, tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**. Canonical closure PR #61 passed D-019 `32294362895` / `96202149317` and integrated as **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.

---

## 2026-08-19 — P10-S1 pre-cutover contract defined/integrated; D-027 accepted

P10 began by reconstructing the stable/integration/deployment/recovery boundary before authorizing any data movement. Stable `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`; completed-P9 `develop` was `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`; Vercel remained candidate/beta hosting; stable `main` exported backup v1; and D-024 recovery state remained origin-local.

D-027 accepted fail-closed sequencing: first remove the D-026 backup-validation blocker, then perform a synthetic deployed rehearsal, while keeping live-store data, `main` publication and production cutover outside P10-S1.

Contract D-019 **`32290159119`** / **`96188851730`** passed on PR #58 merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`: **0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 PASS; build PASS**. PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`, tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

---

## 2026-08-19 — P9-S5 occurrence-date usability verified; P9 closed

No runtime usability gap was found. Transaction entry already defaulted `Data da ocorrência` to browser-local today, exposed the field in the primary entry block, allowed pre-save editing and persisted `occurredAt` independently of generated `createdAt`.

D-019 **`32287018048`** / **`96178850066`** passed; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`, tree `97a78d3e4d78a54ad117440c160920343513ba9f`. Canonical P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

---

## 2026-08-19 — P9-S4-I1 full-field audited transaction correction completed

D-026 was implemented as a full-field audited replacement editor. Replacement business state may define reseller, type, `occurredAt`, observation and applicable order item/quantity/unit price or payment/signal value while original history remains immutable under D-012/D-013.

D-025 snapshot semantics and D-024 write enforcement remain mandatory. D-019 **`32285620846`** / **`96174326588`** passed; PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`, tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

---

## 2026-08-19 — P9-S4 direct evidence accepted D-026

Direct operator evidence established that entered information must remain correctable after entry without overwriting prior history. D-026 selected one coherent audited full-field replacement editor while preserving D-012/D-013, D-025, P1/D-011 and D-024.

Decision-gate D-019 **`32277770945`** / **`96149101495`** passed; PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`, tree `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

---

## 2026-08-19 — P9-S4 evidence gate integrated

The initial P9-S4 evidence gate proved current supported correction surfaces and correctly blocked runtime changes pending direct confirmation. D-019 `32265612927` / `96109244644`; PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`. Closure #51 integrated as `1221f71de460c266c165b92de0536f443c71fa08` after D-019 `32269262365` / `96121383857`.

---

## 2026-08-19 — P9-S3-I3 category reporting completed

D-025 category order-performance reporting uses effective non-reversed orders, `occurredAt` period filtering, historical transaction category identity and an explicit legacy no-category bucket; payments/signals/balance/FIFO debt are excluded from category allocation.

D-019 `32262877105` / `96100129962` passed; PR #48 integrated as `08ad2973f387035301901f9f46b0c78039796c2d`, tree `af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`.

---

## 2026-08-18 — P9-S3-I2 category lifecycle/classification/order snapshots completed

P9-S3-I2 operationalized D-025 lifecycle/classification/history without reporting. Final D-019 `32202876262` / `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

---

## 2026-08-18 — P9-S3-I1 category persistence/migration/backup completed

Dexie V5 category persistence, additive/non-inventive V4→V5 migration, `easy-backup` v2/schema5 with v1/schema4 compatibility and four-table D-018 restore were integrated. Final D-019 `32191707306` / `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.

---

## 2026-08-18 — P9-S3 category contract accepted; D-025 established

D-025 established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling and order-only category analytics. Final contract D-019 `32185226251` / `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

---

## 2026-08-18 — P9-S2 recovery durability completed

D-024 selected synchronized recovery-copy folder plus exact 24-hour freshness guard while keeping the then-current D-016 local-first architecture. Accepted D-019 `32180250834` / `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

D-029 later keeps this mechanism only until cloud cutover rather than as final production durability.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 ranking: recovery durability 94/100, categories/reporting 83/100, correction microflows 70/100, occurrence-date usability 69/100. Critical QA `32166330198` / `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

---

## 2026-08-18 — P8 real-store requirements discovery completed

Direct evidence kept D-016 for then-current non-concurrent PC operation and confirmed recovery durability, category/reporting and correction-friction roadmap inputs. Final P8-S2 Critical QA `32158395391` / `95781056589`.

D-029 later records a new accepted final-product durability requirement; it does not retroactively change the P8 evidence.

---

## 2026-08-18 — P7 operational UX refinement completed

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 validation `32145620210` passed.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate established

D-019 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before publication from `main`. Functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established logical `easy-backup` v2 with deep preflight/v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user until direct requirements later prove a reopen trigger.

On 2026-08-20 D-029 accepted such a later trigger and superseded D-016 for final production persistence.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated `occurredAt` from registration/audit time (`32052076684`). P3-S2 formalized statements, total debt and FIFO aging (`32053837309`). D-014/D-015 accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 accepted; validations `32041280504` and `32042373332`.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references and guarded destructive deletion. Validations `32037965651`, `32038951903`, `32039763539`.

---

## 2026-08-17 — P0 canonical V2 governance established

V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline established. `main` is stable reference; `develop` is V2 integration.
