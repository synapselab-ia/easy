# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-19

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

## P1 — Referential integrity and safe entity lifecycle

**Status:** `DONE` — 2026-08-17.

- P1-S1 safe reseller lifecycle — `DONE`; validation `32037965651`.
- P1-S2 safe item lifecycle — `DONE`; validation `32038951903`.
- P1-S3 referential validation/migration — `DONE`; validation `32039763539`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`; validation `32041280504`.
- P2-S2 linked/guided replacement — `DONE`; validation `32042373332`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`; validation `32052076684`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`; validation `32053837309`.

## P4 — Persistence architecture decision

**Status:** `DONE` — 2026-08-17. D-016 keeps V2 local-first/single-user until an explicit direct requirement proves a reopen trigger.

## P5 — Backup, restore and migration

**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

## P6 — Tests, CI and deployment safety

**Status:** `DONE` — 2026-08-17. D-019 established `npm run qa:critical`; functional validation `32064801009`, post-merge `32065713920`.

## P7 — Operational UX refinement

**Status:** `DONE` — 2026-08-18. Final P7-S6 validation `32145620210`; QG-011 through QG-015 resolved.

## P8 — Real-store requirements discovery

**Status:** `DONE` — 2026-08-18.

- P8-S1 repository evidence/D-016 assessment — `DONE`; D-021 accepted.
- P8-S2 direct validation — `DONE`; D-022 kept D-016; Critical QA `32158395391`.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — 2026-08-18.

D-023 accepted order:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18.

D-024 selected synchronized recovery-copy folder + 24-hour freshness guard and kept D-016. P9-S2-I1 implemented namespaced local recovery health, fail-safe write blocking, 20-hour warning / exact 24-hour hard boundary, synchronized-folder setup verification, global visibility and persistent Backup/Restore escape access without Drive API/OAuth, backend/cloud/live sync, Dexie migration or backup-envelope version change.

Accepted P9-S2-I1 Critical QA `32180250834`, job `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 — Categories, classification and category reporting

**Status:** `IN_PROGRESS` — I3 implemented and functionally validated; final documentation-complete D-019/integration pending.

#### Contract gate — `DONE`

D-025 is authoritative. Contract D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

#### P9-S3-I1 — persistence/migration/backup — `DONE / INTEGRATED`

Dexie V5 category persistence, non-inventive V4→V5 migration, schema5 backup/legacy normalization, graph validation and four-table restore. Final D-019 `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.

#### P9-S3-I2 — lifecycle/classification/order snapshots — `DONE / INTEGRATED`

Category lifecycle and operator management, active-category item classification, legacy compatibility, new-order category snapshots and correction snapshot preservation. Final D-019 `32202876262`, job `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; canonical closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

#### P9-S3-I3 — Category order-performance reporting

**Status:** `IN_REVIEW` — implemented on PR #48; functional D-019 PASS; documentation-complete gate/integration pending.

Implemented scope:

- effective non-reversed `order` transactions only;
- `occurredAt` / `transactionOccurredAt()` period basis;
- grouping by historical stored `transaction.categoryId`, never current item classification;
- missing historical snapshot -> **`Sem categoria — histórico legado`**;
- minimum metrics: order count, summed quantity and gross order value;
- linked corrections count only the effective replacement;
- archived categories remain reportable;
- current category name may label an existing stable identity while immutable `transaction.categoryName` remains historical/audit data;
- read-only `/category-report` view with all-time or inclusive occurrence-period filtering;
- targeted domain/UI tests.

Functional gate: run `32261923163`, job `96096954271`, merge ref `02d656ea771e334622a6248139b508e20a98caf1` — **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; build PASS**.

Still required before `DONE`:

1. D-019 on documentation-complete PR #48 head;
2. integrate that exact validated head into `develop`;
3. record integrated commit/tree evidence canonically.

Explicitly excluded from I3: payment/signal/balance/open-debt/FIFO category allocation, historical backfill/recategorization, profitability/margin without costs, unrelated schema/backup changes, P9-S4/P9-S5/P10 and backend/auth/cloud/live sync.

### P9-S4 — Confirmed correction microflows

**Status:** `NOT_STARTED`.

Directly map source-proven unsupported correction actions to actual operator cases and implement only the confirmed high-value subset while preserving audited history. **Do not start until P9-S3-I3 is canonically integrated and closed.**

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
