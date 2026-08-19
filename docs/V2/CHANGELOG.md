# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-19 — P10-S1-I2 synthetic migration/recovery rehearsal passed; P10-S1 closed

P10-S1-I2 executed the bounded non-production rehearsal required by D-027. No live-store backup was exported/imported and `main` remained untouched.

The rehearsed Vercel candidate was verified as READY deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`**, exact Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**. The immutable deployment URL required Vercel SSO for `/backup`; Vercel metadata attached public alias `easy-v2-tau.vercel.app` to that exact deployment, so the alias was used only as browser access while deployment ID/SHA remained the identity proof.

Evidence-only PR #62 used a temporary branch-local Playwright harness and was deliberately closed **without merge** after evidence capture. The authoritative run **`32298906351`**, job **`96216688953`**, exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**, first passed ordinary D-019: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; production build PASS**. The remote deployed-candidate rehearsal then passed **1/1**.

Using only a synthetic stable-v1 fixture, the rehearsal proved v1→v2 preflight/restore and checkpoint creation; 2 items / 2 resellers / 3 legacy transactions with expected lifecycle/`occurredAt` normalization; no fabricated categories/history; D-024 write blocking before recovery setup; fresh backup plus explicit synchronized-copy verification; unclassified-item order blocking; representative classification; supported new order; D-026 changed-item/date correction; V2 export; and disposable fresh-context restore/re-export with identical business data.

Two earlier runs are retained only as diagnostics: `32297959050` / `96213645569` exposed Vercel SSO before application access, and `32298286885` / `96214717360` exposed a Playwright viewport/actionability issue before restore dispatch. Neither was accepted as product evidence.

**Result:** P10-S1 is `DONE / ACCEPTED`. The rehearsal gives a GO only to **define the P10-S2 copied-live-data beta gate**. It does not authorize moving real store data, production reconciliation, stable publication, canonical URL switch, production cutover or D-016 change.

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

Contract D-019 **`32290159119`** / **`96188851730`** passed on PR #58 merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`: **0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; build PASS**. PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`, tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

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

D-024 selected synchronized recovery-copy folder plus exact 24-hour freshness guard while keeping D-016 local-first. Accepted D-019 `32180250834` / `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 ranking: recovery durability 94/100, categories/reporting 83/100, correction microflows 70/100, occurrence-date usability 69/100. Critical QA `32166330198` / `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

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
