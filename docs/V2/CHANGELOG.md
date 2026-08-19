# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-19 — P9-S3-I3 category reporting implemented and functionally validated; final integration pending

PR #48 implements only the D-025 category order-performance reporting slice.

Implemented:

- pure read-only aggregation over effective non-reversed `order` transactions;
- `occurredAt` / `transactionOccurredAt()` as the reporting time basis, with inclusive optional period filtering;
- grouping by stored historical `transaction.categoryId`, never the item's current classification;
- explicit `Sem categoria — histórico legado` bucket for orders without a historical category snapshot;
- order count, summed item quantity and gross order value;
- linked correction semantics where the reversed original contributes zero and the effective replacement contributes once;
- archived categories remain reportable;
- current category name may label the existing stable category identity while immutable `transaction.categoryName` remains untouched;
- bounded read-only `/category-report` operator view and navigation;
- targeted domain and UI tests.

No payment/signal/balance/open-debt/FIFO category allocation, historical backfill/recategorization, profitability inference, schema/backup change, P9-S4/P9-S5/P10 or backend/auth/cloud/live synchronization work was introduced.

Functional D-019 run **`32261923163`**, job **`96096954271`**, passed on merge ref `02d656ea771e334622a6248139b508e20a98caf1`, combining head `01fcd986ed86fbe465592af3c5600a2570380ee8` with base `4191df77db83258f1125bffd445a6ec1f5b46bf9`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

This entry does not yet declare I3/P9-S3 integrated. The documentation-complete PR #48 head must pass a fresh D-019 and that exact validated content must be integrated before canonical post-merge closure.

---

## 2026-08-18 — P9-S3-I2 category lifecycle/classification/order snapshots completed and integrated

P9-S3-I2 operationalized D-025 lifecycle/classification/history without reporting. It added category lifecycle and management, active-category item classification, lossless legacy compatibility, immutable new-order category snapshots and correction snapshot preservation while keeping D-024 enforcement.

First functional gate `32202062045` / `95917767742` correctly failed with 199/205 tests and exposed stale fixtures plus a Dexie transaction-zone issue; the contract was not weakened. Functional accepted `32202440100` / `95918871077` passed. Final documentation-complete `32202876262` / `95920142630` passed with 0 errors / 81 warnings, 49 files / 205 Vitest, 17/17 Playwright and build PASS.

PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; validated/integrated tree `ddbb14dcc6f66239b5e973f7da8eabb295c2cb49`. Canonical closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

---

## 2026-08-18 — P9-S3-I1 category persistence/migration/backup compatibility completed

Dexie V5 category persistence, additive/non-inventive V4→V5 migration, `easy-backup` v2/schema5 with v1/schema4 compatibility, schema5 graph validation, category-aware backup preview and four-table D-018 restore. Final D-019 `32191707306` / `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.

---

## 2026-08-18 — P9-S3 category contract accepted; D-025 established

D-025 established stable category identity/lifecycle, future-order transaction snapshots, non-inventive legacy handling, order-only category analytics, Dexie V5 direction and additive D-017/D-018 compatibility. Final contract D-019 `32185226251` / `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

---

## 2026-08-18 — P9-S2 recovery durability completed

D-024 selected synchronized recovery-copy folder plus exact 24-hour freshness guard and kept D-016 local-first. Accepted D-019 `32180250834` / `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

D-023 ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100, occurrence-date usability 69/100. Critical QA `32166330198` / `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

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
