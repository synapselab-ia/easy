# Easy V2 — Canonical Status

**Updated:** 2026-08-19  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `DONE / INTEGRATED`.**  
**P10 — Controlled beta, migration and cutover: `IN_PROGRESS`.**

Phase state:

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Incomplete UX flows / operational refinement: `DONE`.
- P8-S1 — Repository-evidence discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and D-016 keep/reopen decision: `DONE`.
- P9-S1 — Evidence-backed prioritization: `DONE`.
- P9-S2 — Recovery durability: `DONE`.
- P9-S3 — Categories/classification/reporting: `DONE / INTEGRATED`.
- P9-S4 — Confirmed correction microflows: `DONE / INTEGRATED`.
- P9-S5 — Occurrence-date usability verification: `DONE / INTEGRATED`.
- **P10-S1 — Pre-cutover compatibility and rehearsal gate: `DONE / ACCEPTED`.**
- P10-S1-I1 — Backup/correction compatibility hardening: `DONE / INTEGRATED`.
- **P10-S1-I2 — Non-production migration/recovery rehearsal: `DONE / REHEARSED`.**
- **P10-S2 — Copied-live-data beta acceptance gate: `NOT_STARTED`.**

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
- **`docs/V2/P10_CUTOVER_PLAN.md` — P10-S1 contract, I1 compatibility result and accepted I2 rehearsal evidence/boundary.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime V2 is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. D-014/P3 occurrence-date semantics remain unchanged.

P10-S1-I1 aligns backup self-preflight/export with D-026 while retaining D-025 history semantics: type and financial occurrence date may change; a corrected order may change item and capture that target item's valid replacement-time snapshot; an order correction that keeps the same item must preserve the original category snapshot. Bidirectional audit linkage, referenced-ID existence, registration chronology and each transaction's own target shape/reference validity remain enforced.

No schema, Dexie migration or backup-envelope version changed in P10-S1. Backup-v1 and v2/schema4 compatibility remain covered by the passing suite.

## Repository / deployment baseline after P10-S1

- stable `main` remains **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- candidate/rehearsal `develop` SHA was **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**;
- both `main` and `develop` remain unprotected branches, so D-019/PR discipline remains a process requirement;
- stable `main` still deploys its historical application to GitHub Pages;
- V2's eventual stable deploy workflow remains `quality -> build -> deploy` and has not been activated on `main`;
- repository `vercel.json` continues to disable Git-triggered Vercel deployments;
- Vercel project `easy-v2` remains candidate/beta hosting only.

P10-S1-I2 verified READY Vercel deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`** as exact Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`. The immutable deployment URL requires Vercel SSO for `/backup`; Vercel metadata also attached public alias `easy-v2-tau.vercel.app` to that exact deployment, so the alias was used only as browser access while deployment ID/SHA provided candidate identity.

No live-store dataset was exported/imported, no `main` publication occurred and no stable/canonical URL was switched.

## Stable → V2 migration boundary — rehearsed synthetically

The stable `main` application uses Dexie V1 and exports backup version 1 with `items`, `resellers`, `transactions`.

The P10-S1-I2 synthetic rehearsal proved the accepted V2 normalization path on the deployed candidate:

- v1 preflight identifies in-memory v1→v2 migration;
- missing lifecycle state normalizes legacy items/resellers to active;
- missing transaction `occurredAt` normalizes to legacy `createdAt`;
- categories/category history are not fabricated;
- migrated legacy items remain unclassified;
- new orders remain blocked for unclassified active items until classification;
- restore creates the expected checkpoint artifact;
- D-024 blocks normal writes until a fresh backup is exported and synchronized-copy verification is explicitly confirmed;
- after classification, supported order/correction flows operate normally;
- a final V2 backup containing a D-026 item/date correction can be restored into a disposable fresh browser context and re-exported with identical business data.

This is evidence for the migration/recovery mechanism, **not** evidence that the actual store dataset has been migrated or reconciled.

## P10-S1-I1 blocker resolution

The pre-cutover recovery blocker identified while defining P10-S1 is resolved.

Before I1, `backupService.validateReferences()` required linked replacements to preserve transaction type, order item/category snapshot and `occurredAt`, which conflicted with valid D-026 corrections.

P10-S1-I1 removed only the obsolete cross-record assumptions:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
- an order replacement may select another item and carry that replacement item's valid category snapshot;
- if an order replacement keeps the same item, the original D-025 category snapshot remains mandatory;
- bidirectional correction/reversal links, referenced IDs, registration chronology and each transaction's own target shape/reference validity remain mandatory.

Focused regression coverage proves valid type/date/item-changing corrections preflight and export successfully while broken links and invalid target shapes remain rejected.

## Authoritative decisions

D-016 through D-027 remain authoritative. In particular:

- D-012 requires audited reversal instead of destructive financial-history editing;
- D-013 requires atomic linked replacement correction;
- D-014 separates financial occurrence (`occurredAt`) from registration/audit time;
- D-016 keeps local-first/single-user topology;
- D-017 keeps logical `easy-backup` v2;
- D-018 keeps checkpointed verified atomic restore;
- D-019 keeps `npm run qa:critical` mandatory;
- D-024 keeps synchronized recovery-copy folder + exact 24-hour freshness guard;
- D-025 keeps stable category identity and immutable historical category snapshots;
- D-026 keeps effective transaction business fields correctable through audited linked replacement;
- **D-027 requires a fail-closed non-production pre-cutover compatibility/rehearsal gate before copied-live-data beta or stable publication.**

No new production/cutover decision was accepted by I2. The rehearsal produces only a GO to define the next bounded beta gate.

## Accepted validation baseline

P9-S1 through P9-S5 have accepted validation/integration evidence. Final P9-S5 runtime-neutral verification was PR #56 / D-019 `32287018048` / `96178850066`, integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`. Canonical P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

P10-S1 contract proof:

- PR #58 D-019 `32290159119` / `96188851730`, validated merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`;
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`;
- validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

P10-S1-I1 implementation proof:

- initial D-019 `32292405631` / `96196002726` correctly blocked integration when the first implementation over-relaxed D-025 same-item category-snapshot preservation;
- authoritative D-019 **`32292888925`** / **`96197514379`** passed: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #60 integrated as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated/integrated tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

P10-S1-I2 rehearsal proof:

- evidence-only PR #62 was based on candidate `develop` SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e` and was closed **without merge**;
- authoritative run **`32298906351`**, job **`96216688953`**, exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**;
- ordinary D-019 passed first: **0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; production build PASS**;
- remote candidate rehearsal then passed **1/1** against the public alias attached to verified deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki` / candidate SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- prior runs `32297959050` and `32298286885` are diagnostic/non-authoritative harness attempts only: respectively Vercel SSO blocked the immutable URL before app access, and Playwright viewport actionability blocked a restore click before restore dispatch. Neither was treated as product acceptance evidence.

## P10 boundary after P10-S1

P10-S1 is complete and accepted as a non-production gate:

1. `main` remains untouched;
2. no live-store data has been moved;
3. no V2 stable publication has occurred;
4. backup/correction compatibility is integrated;
5. synthetic migration/recovery, D-024 setup, classification gating, D-026 flow and V2 round-trip are rehearsed successfully on an exact validated candidate;
6. copied-live-data beta, actual production-data reconciliation, final freeze, stable publication and production cutover still require later explicit acceptance;
7. D-016 remains unchanged.

## NEXT_ACTION

**Define and accept only the next bounded P10-S2 copied-live-data beta gate before any real store backup is exported or imported. Reconstruct the minimum data-handling, operator-access, reconciliation, recovery, rollback and disposal criteria needed for a non-production beta using a copy of the live-store dataset, and specify explicit go/no-go evidence. Do not move live-store data while defining the gate; do not modify or publish `main`; do not perform stable publication, production cutover, canonical URL switch or D-016 change.**
