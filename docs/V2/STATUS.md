# Easy V2 — Canonical Status

**Updated:** 2026-08-20  
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
- P10-S1 — Pre-cutover compatibility and rehearsal gate: `DONE / ACCEPTED`.
- P10-S1-I1 — Backup/correction compatibility hardening: `DONE / INTEGRATED`.
- P10-S1-I2 — Non-production migration/recovery rehearsal: `DONE / REHEARSED`.
- **P10-S2 — Copied-live-data beta contract: `DONE / ACCEPTED` — D-028.**
- **P10-S2-I1 — Copied-live-data beta execution: `NOT_STARTED` — CURRENT NEXT ACTION.**

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
- `docs/V2/P10_CUTOVER_PLAN.md` — P10 sequencing and completed P10-S1 evidence boundary;
- **`docs/V2/P10_S2_BETA_GATE.md` — authoritative D-028 copied-live-data beta contract and P10-S2-I1 go/no-go criteria.**

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB.

Runtime V2 is Dexie **V5** with `categories`, `items`, `resellers`, `transactions`. Canonical interchange remains `easy-backup` version 2 / schema5. D-018 restores all four business tables atomically. D-024 recovery-health metadata remains separate and normal writes remain subject to its exact 24-hour guard.

D-025 category snapshot/reporting behavior and D-026 full-field audited transaction correction are implemented/integrated. D-014/P3 occurrence-date semantics remain unchanged.

P10-S1-I1 aligned backup self-preflight/export with D-026 while retaining D-025 history semantics. P10-S1-I2 then proved the stable-v1→V2 mechanism synthetically on a deployed candidate with no live-store data.

P10-S2 contract definition introduced **no runtime, schema, backup-envelope, deployment or persistence-topology change**.

## Repository / deployment baseline entering P10-S2-I1

- stable `main` remains **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- `develop` entering the P10-S2 contract branch was **`816794694d0a9b6c92da273a81ee745c2f53ecdc`**;
- both `main` and `develop` remain unprotected, so D-019/PR discipline remains a process requirement;
- stable `main` still deploys the historical application to GitHub Pages;
- repository `vercel.json` continues to disable Git-triggered Vercel deployments;
- Vercel project `easy-v2` remains candidate/beta hosting only.

The last rehearsed runtime candidate remains READY deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`** at exact Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**, tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**. Its public alias may be used in a later beta only after current metadata re-verifies alias → deployment identity. A mutable alias alone is not proof.

No live-store dataset has been exported/imported, no `main` publication occurred and no stable/canonical URL was switched.

## D-028 / P10-S2 accepted contract

P10-S2 is now defined as a fail-closed, point-in-time copied-live-data acceptance exercise.

Core invariants:

1. stable remains the only authoritative production system during beta;
2. the V2 beta copy is disposable and never synchronizes back to stable;
3. before export, one exact D-019-passing candidate Git SHA/tree and READY browser deployment must be identified;
4. real copied data may exist only on the trusted operator machine/browser origin and the existing D-024 synchronized-recovery boundary;
5. no raw data, identifiable screenshots/PDFs or transaction payloads may enter GitHub, CI artifacts, chat or project docs;
6. source snapshot identity is recorded by timestamp, file size and SHA-256 without exposing payload;
7. v1 preflight may normalize only already accepted lifecycle/`occurredAt` omissions and may not fabricate categories/history;
8. structural reconciliation is exact: entity/type counts, IDs, references, stored values and source business fields must be preserved under the accepted normalization;
9. financial reconciliation is exact: gross orders, payments, signals, net movement, every reseller balance and aggregate positive debt must match; any R$ 0,01 displayed difference is NO-GO;
10. D-018 checkpoint + D-024 blocking/setup/current-state proof is mandatory before beta writes;
11. the post-reconciliation V2 backup is the beta rollback baseline;
12. minimum beta-only classification/order/D-026 correction and final fresh-context round-trip checks must pass;
13. any mismatch, unexpected warning, isolation breach, D-024 bypass or stable-origin write is fail-closed NO-GO;
14. beta-specific copied real data must be disposed from operator-controlled locations within 24 hours of acceptance/rejection/abandonment;
15. only sanitized metadata/hashes/counts/PASS-FAIL evidence remains canonical afterward.

Detailed contract: `docs/V2/P10_S2_BETA_GATE.md`.

## Stable → V2 transfer boundary

The stable `main` application uses Dexie V1 and exports backup version 1 with `items`, `resellers`, `transactions`.

Accepted V2 normalization remains:

- missing lifecycle state → active;
- missing `occurredAt` → historical `createdAt`;
- no categories/category history fabricated;
- migrated legacy items initially unclassified;
- new orders blocked for unclassified active items until classification.

P10-S1-I2 proved this only with synthetic data. P10-S2-I1 is the first action allowed to test the mechanism against one controlled point-in-time **copy** of actual store data, and only after satisfying D-028's pre-export GO checklist.

## Authoritative decisions

D-016 through D-028 remain authoritative. In particular:

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
- D-027 requires fail-closed non-production compatibility/rehearsal before copied-live-data work;
- **D-028 requires exact candidate identity, isolated single-operator copied-data handling, exact reconciliation, D-018/D-024 recovery proof, fail-closed rollback and 24-hour beta-artifact disposal.**

## Accepted validation baseline

P9-S1 through P9-S5 have accepted validation/integration evidence.

P10-S1 accepted evidence:

- P10-S1 contract PR #58 / D-019 `32290159119` / `96188851730`;
- P10-S1-I1 authoritative D-019 `32292888925` / `96197514379`, PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`;
- P10-S1-I2 evidence-only PR #62 authoritative run `32298906351` / `96216688953`, remote rehearsal 1/1 PASS;
- canonical P10-S1 closure PR #63 integrated as `816794694d0a9b6c92da273a81ee745c2f53ecdc`, exact tree `417dd4097144d9f69124161b34747b3e81244ae7`.

P10-S2 contract acceptance is documentation/governance only. Its PR-level D-019 evidence is recorded in the P10-S2 closure PR metadata and `QA_LEDGER.md`; no runtime behavior is claimed from contract definition itself.

## P10 boundary after contract acceptance

1. `main` remains untouched;
2. no live-store data has moved yet;
3. no stable V2 publication/canonical URL switch/production cutover has occurred;
4. D-016 remains unchanged;
5. P10-S2-I1 may move exactly one controlled point-in-time copy only after its pre-export checklist passes;
6. a P10-S2-I1 PASS may authorize only **defining** the next production-cutover gate, not cutover itself.

## NEXT_ACTION

**Execute only P10-S2-I1 — copied-live-data beta under D-028 / `docs/V2/P10_S2_BETA_GATE.md`. Begin by re-verifying one exact D-019-passing V2 candidate and READY deployment/alias identity, operator/browser isolation and approved D-024 working/recovery location. Only after every pre-export GO item is proven may one point-in-time stable-v1 backup be exported. Then preflight/restore, perform exact structural and financial reconciliation, establish D-018/D-024 recovery readiness before beta writes, run the minimum beta-only operator checks, prove final V2 fresh-context round-trip, dispose beta-specific copied data within 24 hours, and record only sanitized evidence. Any mismatch or contract breach is NO-GO. Do not modify/publish `main`, switch the canonical URL, perform production cutover or change D-016.**
