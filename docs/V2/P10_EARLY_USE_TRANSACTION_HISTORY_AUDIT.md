# P10 early-use observation — transaction history and bounded operator attribution

**Date:** 2026-08-28  
**Scope:** P10-S3-I2-I3-D controlled clean-start early-use refinement  
**Executable PR:** #131 — `feat: add transaction history with operator attribution`  
**Status:** `DONE / ACCEPTED / INTEGRATED`

## Why this change exists

During controlled early use, the operator identified that the small recent-launch list on Dashboard was not the right long-term place to investigate financial-entry history. The explicit instruction was to centralize this investigation in the existing launch workspace and add enough audit context to answer practical questions such as who registered, corrected or reversed a financial movement.

The operator explicitly chose **not** to build a general audit system at this point. Therefore this work is bounded to financial transactions and their existing correction/reversal lifecycle.

This refinement is not D-035 `DR-10`, not early-use change #16, not D-030 resumption and not authorization to audit catalog/reseller/other entity edits.

## Accepted user-facing behavior

### Dashboard

- the recent-launch list is no longer rendered on Dashboard;
- the operational KPI/action/attention/aging structure remains intact;
- quick transaction actions remain available;
- Dashboard remains a glance/action surface rather than a historical investigation screen.

### Lançamentos workspace

`/transactions` is now the canonical financial-entry workspace containing:

1. `Nova Movimentação` — the existing order/payment/signal write flow; and
2. `Histórico de Lançamentos` — investigation of persisted financial movements.

The history supports:

- free-text search across useful visible transaction/reseller context;
- type filter: pedido / pagamento / sinal;
- situation filter: efetivo / corrigido / estornado;
- operator filter using transaction creation and reversal/correction actors;
- one date range that can be applied either to registration timestamp or financial occurrence timestamp;
- desktop table and mobile card presentation;
- visible correction/reversal linkage;
- `Não registrado` for historical rows that predate actor attribution.

The implementation does not rewrite old records to guess an actor.

## Server-side operator attribution

The attribution boundary is server-owned.

`public.transactions` received nullable actor snapshots for:

- creation user id;
- creation email;
- reversal/correction user id;
- reversal/correction email.

The public transaction RPC call shapes remain backward compatible. The client does not send a trusted `actor` parameter. PostgreSQL derives the operator from the authenticated request (`auth.uid()` and JWT email claim) after the existing Easy-operator authorization check.

Consequences:

- new hosted transaction creation records the authenticated operator;
- standalone reversal records the authenticated operator performing the reversal;
- correction records that operator on the original reversal side and records the same authenticated operator as creator of the replacement row;
- existing transaction/reversal/correction accounting semantics are unchanged;
- old rows remain valid with null actor fields.

## Supabase migrations

Applied to project `easy-v2` (`hrmkkhqfyfoqucwbcszq`):

1. `20260828135753_transaction_operator_attribution_and_history_backup`
2. `20260828140038_remove_unused_transaction_actor_indexes`

The second migration removes two actor indexes that the Supabase performance advisor immediately identified as unused and unnecessary for the current client-cached history-filtering design.

Security review after DDL found no new RLS/actor-attribution defect. Existing advisor warnings about authenticated execution of the intentionally `SECURITY DEFINER` transaction/restore RPCs remain governed by their internal `assert_easy_operator` boundary. The pre-existing Auth leaked-password-protection warning is unrelated to this change.

## Synthetic database proof

A direct synthetic proof exercised creation, reversal and correction/replacement attribution inside an intentionally aborted database transaction.

Verified behavior:

- created transaction actor captured;
- standalone reversal actor captured;
- corrected original reversal actor captured;
- replacement transaction creator captured.

The proof intentionally raised an exception after its assertions so all synthetic writes rolled back. A post-check confirmed:

- synthetic operator rows: `0`;
- synthetic transaction rows: `0`.

No business dataset was seeded or retained for the proof.

## Backup v2 schema 7

The backup **format/version remains `easy-backup` v2**. The logical schema advances from 6 to 7 only to preserve transaction actor snapshots.

Current schema 7 transaction payloads may include:

- `createdBy: { userId, email? }`;
- `reversal.reversedBy: { userId, email? }`.

Compatibility rules:

- schema 7 is the current exported target;
- schema 6 remains accepted and preserves subcategories/classification snapshots;
- schema 5 remains accepted without inventing subcategories;
- schema 4 remains accepted without inventing categories/subcategories;
- older supported backups never receive fabricated actor history during normalization;
- malformed schema-7 actor UUID/email shapes are rejected by preflight;
- cloud restore accepts schema 4/5/6/7 according to the migration's compatibility logic and restores actor fields when present.

This is a logical Backup v2 schema evolution, not a new backup product/version.

## Recovery guard state

The D-032 exact-24-hour store-global manual recovery guard was preserved and was not bypassed for normal hosted writes.

Observed during this work:

- latest confirmed real export: `2026-08-27 12:57:03.459119+00`;
- check time: `2026-08-28 13:56:41.296122+00`;
- freshness result: `false`.

Therefore normal hosted business writes are correctly blocked until a new Backup v2 is exported and explicitly confirmed as stored outside Easy.

DDL was applied through administrative database maintenance. The synthetic proof was rollback-only. Neither action changes the requirement for a fresh real checkpoint before ordinary hosted writes.

## D-019 acceptance

Final accepted executable head:

- feature head: `71799016d2f90b07b345dc37d8e9180fcd9fbd35`;
- GitHub-generated PR merge ref tested by Actions: `5441afe3b520a3a302ffbe4a7f64c0a23c0dd764`;
- validated tree: `71c43008df5058b50d49597217f6485637b935fe`;
- run/job: `33181135877` / `98882307187`.

Final Critical QA:

- ESLint: **0 errors / 108 warnings**;
- Vitest: **75 files / 316 tests PASS**;
- Playwright: **20 scenarios completed successfully**; 19 passed first attempt and `reports-chart-visibility.spec.ts` passed on retry, so Playwright reported it as flaky rather than failed;
- TypeScript + production Vite build: **PASS**.

The chart-visibility retry is a pre-existing timing/render flake and did not produce a failed Critical QA gate. No failing objective gate was waived.

## Integration proof

PR #131 was squash-merged into `develop` as:

`45f318e8fc2f789e884d6e5e9f8eafd443e4f1fe`

The integrated commit tree is:

`71c43008df5058b50d49597217f6485637b935fe`

This exactly equals the tree of the GitHub-generated merge ref accepted by Critical QA.

`main` remained:

`9574e3a4097ddd78ab1f75a13b9ea065287946e9`

No automatic Vercel deployment was performed.

## Closure

This bounded early-use refinement is closed. It does not authorize follow-on implementation.

The operational continuation is controlled observation. Before any normal hosted write, create and confirm a fresh Backup v2 checkpoint. Any broader audit idea—catalog edits, reseller edits, generic entity event log, etc.—requires a new explicit operator instruction and a newly bounded scope.
