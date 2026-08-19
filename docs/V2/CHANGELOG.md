# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-19 — P10-S1 pre-cutover contract defined; D-027 accepted; backup/correction blocker identified

P10 started with the bounded planning action required by the prior `NEXT_ACTION`; no live-store data movement, Vercel candidate refresh, `main` publication or production cutover was performed.

The stable/integration/deployment/recovery baseline was reconstructed before defining the first slice:

- stable `main` remains commit `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- completed-P9 `develop` is `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`, 55 commits ahead of `main`;
- both branches are currently unprotected;
- current `main` publishes to GitHub Pages with its historical build/deploy workflow, while the V2 workflow on `develop` already defines D-019 `quality -> build -> deploy` for eventual stable publication;
- Vercel `easy-v2` remains manual candidate/beta hosting because `vercel.json` disables Git deployment;
- the latest observed READY candidate points to `develop` commit `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind completed P9;
- stable `main` exports backup v1, which V2 preflight already accepts and normalizes without inventing lifecycle/category/occurrence history;
- D-024 recovery health is origin-local and must be established on a restored candidate before normal writes.

Source reconstruction also found a pre-cutover blocker: current backup correction validation still requires replacement type, order item/category snapshot and `occurredAt` to equal the original, while D-026 explicitly permits the effective replacement to change those business fields. A valid D-026-corrected V2 dataset can therefore conflict with backup self-preflight/export.

D-027 accepts a fail-closed sequence. P10-S1-I1 must first align backup validation with D-026 while retaining audit-link/reference/chronology/target-shape integrity and v1/v2-schema4 migration compatibility. Only after I1 is integrated may P10-S1-I2 rehearse candidate deployment and v1→V2 migration/recovery using synthetic/non-production data.

Copied-live-data beta, real production reconciliation, final write freeze, stable `main` publication, canonical URL switch and production cutover remain explicitly unauthorized.

Detailed contract: `docs/V2/P10_CUTOVER_PLAN.md`.

---

## 2026-08-19 — P9-S5 occurrence-date usability verified; no runtime gap; P9 closed

P9-S5 reconstructed the direct operator signal retained from P9-S4: routine transaction entry presented today's date by default, and the operator was unsure whether that behavior still existed.

Current-source verification found no evidence-backed usability gap. `TransactionForm` still defaults `Data da ocorrência` to the browser-local current date, exposes it in the main entry block beside reseller/type, allows direct editing before save and displays helper text distinguishing the financial occurrence date from automatically saved registration time. Existing D-014/P3 behavior continues to persist selected `occurredAt` independently from generated `createdAt`.

Because the verified workflow already satisfies the bounded requirement, P9-S5 made **no production runtime/UI change**. A focused regression test was added only to prove today's local default, field/helper discoverability and pre-save editability while retaining the existing independent-persistence assertion.

D-019 run **`32287018048`**, job **`96178850066`**, passed on PR #56 merge ref **`9459285920cfbd784a652e9db97cf40741977edf`**, combining head `fef66eb8da6602f0804d0c78eb3d6c30feaf2cac` with base `716fc3b9ec77bada5ca44d992a6760a276e38cfa`: **0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

PR #56 was squash-integrated into `develop` as **`88c70a20071bd97ef3a08285128756e2ce484a74`**. The validated merge ref and integrated squash share exact tree **`97a78d3e4d78a54ad117440c160920343513ba9f`**.

P9-S1 through P9-S5 are now complete, so P9 closes as `DONE / INTEGRATED`. P10 controlled beta/migration/cutover becomes the next phase but remains `NOT_STARTED`; no production data movement, cutover or `main` publication was started here.

---

## 2026-08-19 — P9-S4-I1 full-field audited transaction correction completed and integrated; P9-S4 closed

P9-S4-I1 implemented D-026 as one complete audited replacement editor. A correction can now define the replacement reseller, transaction type, `occurredAt`, observation and the applicable order item/quantity/unit price or payment/signal value without destructively overwriting the original transaction.

D-012/D-013 remain intact: correction still requires a reason, creates the replacement and reversal linkage atomically, and keeps the original business row immutable. D-024 freshness enforcement remains in front of the write.

D-025 snapshot semantics are enforced in both directions: keeping the same order item preserves the original transaction-time item/category snapshot; changing/newly introducing an item requires a current active/classified target and captures that target's current snapshot. Payment/signal targets carry no order-shape fields. Inactive/missing historical order items are surfaced rather than bypassing P1/D-011; another valid item or another target type may be selected.

Focused UI/domain tests cover type/date/observation changes, item changes, target-shape validation, D-025 snapshot preservation/recapture, original immutability, reversal linkage, invalid/inactive targets and D-024 blocking.

D-019 run **`32285620846`**, job **`96174326588`**, passed on PR #54 merge ref **`4b51a5f35c2104d636903ce89eecbc995a0f3ce3`**, combining head `a4f0b026e14fc85bd02eee56db262b5271507b3c` with base `0f3ec562717c75981802f330d64410ee612a034d`: **0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

PR #54 was squash-integrated into `develop` as **`f1cfd126c18691da1256a1d3f918158d7aa9495a`**. The validated merge ref and integrated squash share exact tree **`5679693b5f588f58404050cfca8ffd17a9a49fb3`**.

No schema, backup, destructive-history, P9-S5/P10, backend/auth/cloud/live-sync change was introduced. P9-S4 is now `DONE / INTEGRATED`; P9-S5 occurrence-date usability verification is next and remains unstarted.

---

## 2026-08-19 — P9-S4 direct evidence resolves blocker; D-026 full-field audited correction contract accepted/integrated

Direct operator evidence clarified the actual correction requirement: information entered into the system must remain editable after entry, while prior history does not need to be overwritten by the correction.

The operator could not quantify individual wrong-item/type/observation/archive frequencies from memory. The date concern was clarified as the system presenting today's date by default in routine contexts. Current source confirms `TransactionForm` still initializes `Data da ocorrência` to today; that discoverability/default issue is retained for P9-S5 rather than used to redesign P3 dates in P9-S4.

P9-S4 therefore does not invent a per-field frequency ranking. D-026 selects the smallest coherent implementation: one full-field audited transaction replacement editor. The replacement may define reseller, type, `occurredAt`, observation and the applicable order item/quantity/unit price or payment/signal value. The original row remains immutable; correction remains a mandatory-reason atomic linked replacement/reversal under D-012/D-013.

D-025 remains authoritative: keeping the same order item preserves the original item/category snapshot; changing/newly introducing an order item requires a current active/classified target and captures its current snapshot. P1/D-011 active-reference rules are not weakened for speculative inactive-entity exceptions. D-024 write enforcement remains mandatory.

D-019 run **`32277770945`**, job **`96149101495`**, passed on merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13`, combining head `50cdab7bfc60d31bd3525ed0d4b66d0c3f8d7070` with base `1221f71de460c266c165b92de0536f443c71fa08`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

PR #52 was squash-integrated into `develop` as **`51f7ffae46432e0b82a696c1ebc07c275d733ed4`**. The validated merge ref and integrated squash share exact tree **`c37ea55f83b15415678f5b2be2747fb5f06c6a27`**. The prior slow runs were external Playwright dependency-download delays before `qa:critical`; no QA requirement was bypassed.

No runtime, schema or backup change is included in this decision slice. P9-S4-I1 was authorized by this entry and was completed in the subsequent implementation entry above.

---

## 2026-08-19 — P9-S4 correction evidence gate accepted/integrated; runtime blocked pending direct confirmation

The initial P9-S4 gate proved current audited support for reseller, order quantity/unit price, payment/signal value and pure reversal, and source-proven constraints around `occurredAt`, order item, transaction type, observation and inactive original items.

P8 had confirmed generic correction friction but not exact record/action pairs, so runtime was correctly blocked. `P9_CORRECTION_EVIDENCE_REQUEST.md` was created as the direct intake.

D-019 `32265612927` / `96109244644` passed on PR #50. PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`; validated/integrated tree `5789c7863c0a62904b9d18692543f2b288290867`. Closure #51 integrated as `1221f71de460c266c165b92de0536f443c71fa08` after retry D-019 `32269262365` / `96121383857` on unchanged head; closure tree `7a7551f2815f9338d8b906a2bb6bf1e1d66c8ff2`.

---

## 2026-08-19 — P9-S3-I3 category reporting completed and integrated; P9-S3 closed

PR #48 completed D-025 category order-performance reporting: effective non-reversed orders only, `occurredAt` period filtering, historical `transaction.categoryId` grouping, legacy no-category bucket, order count, item quantity and gross value. Payments/signals/balance/FIFO debt are excluded from category allocation.

Authoritative D-019 `32262877105` / `96100129962` passed; PR #48 integrated as `08ad2973f387035301901f9f46b0c78039796c2d`; validated/integrated tree `af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`.

---

## 2026-08-18 — P9-S3-I2 category lifecycle/classification/order snapshots completed and integrated

P9-S3-I2 operationalized D-025 lifecycle/classification/history without reporting. Final D-019 `32202876262` / `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

---

## 2026-08-18 — P9-S3-I1 category persistence/migration/backup compatibility completed

Dexie V5 category persistence, additive/non-inventive V4→V5 migration, `easy-backup` v2/schema5 with v1/schema4 compatibility and four-table D-018 restore. Final D-019 `32191707306` / `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.

---

## 2026-08-18 — P9-S3 category contract accepted; D-025 established

D-025 established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling and order-only category analytics. Final contract D-019 `32185226251` / `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

---

## 2026-08-18 — P9-S2 recovery durability completed

D-024 selected synchronized recovery-copy folder plus exact 24-hour freshness guard and kept D-016 local-first. Accepted D-019 `32180250834` / `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 ranking: recovery durability 94/100, categories/reporting 83/100, correction microflows 70/100; occurrence-date usability 69/100. Critical QA `32166330198` / `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

---

## 2026-08-18 — P8 real-store requirements discovery completed

Direct evidence kept D-016 for current non-concurrent PC operation and confirmed recovery durability, category/reporting and correction-friction roadmap inputs. Final P8-S2 Critical QA `32158395391` / `95781056589`.

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
