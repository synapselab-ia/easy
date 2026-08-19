# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-19 — P9-S4 correction evidence gate accepted/integrated; runtime remains blocked on direct confirmation

The P9-S4 evidence/contract gate inspected only the accepted direct-store evidence, the accepted P9-S1 correction inventory and the current correction UI/domain needed to distinguish existing support from genuine source constraints.

Current V2 already supports audited correction of reseller, order quantity/unit price, payment/signal value and pure reversal/cancellation under D-012/D-013.

Current source still constrains:

- post-save `occurredAt` correction;
- changing the order item after save;
- changing transaction type after save;
- changing/adding observation after save;
- guided replacement of an order whose original item is inactive.

P8 directly confirmed that correction friction exists, but it did not identify which exact record/action pairs cause that friction. P9-S1 explicitly classified the rows above as source-proven gaps rather than direct claims about Duda's operation. Therefore no high-value implementation subset can be selected without inventing evidence.

`docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md` records the minimum direct intake required: whether each case actually occurs, approximate frequency, current workaround, business consequence and any other exact missing record/action pair.

D-019 run `32265612927`, job `96109244644`, passed on PR #50 merge ref `5efb3bd2d0fd20909802a02e00d170150689a7d7`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**. The validated head was `211923d7900818d189b22ce8773be76591505d31` over base `825aca83d1f317119f8f0e4f3d203722c1e6cf85`.

PR #50 was squash-integrated into `develop` as `35a2e0d7495791dfda7f02e045067a85bad4aed9`. Validated merge ref and integrated squash share exact tree `5789c7863c0a62904b9d18692543f2b288290867`.

No runtime, schema, backup, historical financial row, D-012/D-013 semantic, P9-S5/P10 work or backend/auth/cloud/live synchronization was changed. No new D-number was accepted. The gate is closed; the evidence blocker intentionally remains.

---

## 2026-08-19 — P9-S3-I3 category reporting completed and integrated; P9-S3 closed

PR #48 completed the final D-025 category order-performance reporting slice.

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

Functional D-019 run `32261923163`, job `96096954271`, passed on merge ref `02d656ea771e334622a6248139b508e20a98caf1`: 0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS.

The authoritative documentation-complete D-019 run **`32262877105`**, job **`96100129962`**, passed on merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, combining head `b7e76e56c8049a002243fc693891880ba6bf0a50` with base `4191df77db83258f1125bffd445a6ec1f5b46bf9`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

PR #48 was squash-integrated into `develop` as **`08ad2973f387035301901f9f46b0c78039796c2d`**. The validated merge ref and integrated squash share exact tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

P9-S3 is therefore `DONE / INTEGRATED`.

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
