# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P5 — Backup, restore and migration**  
**State:** `NOT_STARTED`

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: local vs cloud: `DONE`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source needed for `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB. It manages items, resellers, orders, payments/signals, balances, dashboard analytics, PDF statements, JSON backup/restore and global search.

The completed financial foundation is unchanged:

- P1 preserves entity identity/history and validates new references;
- P2 provides audited reversal and atomic linked correction;
- P3 separates financial occurrence from audit time, defines formal period statements and uses FIFO-derived outstanding-debt aging;
- Dexie schema remains **V4**.

## P4 evidence inventory

The decision gate reviewed canonical documents plus operating evidence in the repository:

- `tasks/prd-gestao-revendedores/prd.md` defines the persona as one administrator/business owner, requires Dexie/IndexedDB, explicitly describes the app as single-user local, and places authentication/backend/cloud sync out of scope;
- `prompts/prompt1.md` requires local browser persistence and JSON export/import specifically for backup and moving to another computer;
- `README.md` describes the product as 100% client-side, portable and independent, with user-controlled JSON migration;
- `src/db/database.ts` confirms the authoritative dataset is browser-local Dexie V4;
- `src/services/backupService.ts` confirms recovery/portability is currently user-managed JSON export/import;
- `src/hooks/useSearch.ts` also stores user-local recency state in browser `localStorage`;
- `package.json` contains no authentication/cloud database client;
- `.github/workflows/deploy.yml` deploys only a static build to GitHub Pages.

No repository evidence establishes simultaneous multi-user editing, a shared live dataset across devices/locations, centralized roles/access control, identity-specific authorship, server-side integrations, or a remote recovery SLA.

## P4 accepted architecture

D-016 accepts **local-first single-user persistence on Dexie V4** as the V2 architecture under the requirements currently evidenced.

### Operating model

- one authoritative Easy dataset exists per browser profile/origin at a time;
- the intended operator is the administrator/business owner;
- desktop/tablet access is supported as UI capability, but there is no live cross-device synchronization contract;
- moving the dataset between computers remains an explicit export/import operation, not concurrent sync;
- business CRUD does not require a backend/network once the static app is loaded; offline application startup is not guaranteed because there is no PWA/service-worker contract.

### Identity and audit

No authentication is introduced. If P2 audit metadata later needs actor attribution while this local architecture remains valid, the provider-neutral `actorRef` source is a stable opaque **local installation identity** generated/stored client-side. It identifies the Easy installation, not a verified human identity. Existing audit rows without actor attribution remain valid.

A requirement to distinguish multiple human operators is a trigger to revisit this architecture; the application must not pretend an installation ID is person-level identity.

### Security/privacy boundary

- reseller contact/financial data remains on the operator's browser device unless explicitly exported;
- static hosting serves application assets and is not the business-data system of record;
- there is no password/account/authentication attack surface added by P4;
- device/browser compromise or storage deletion can expose/lose local data;
- exported backup JSON is a sensitive user-controlled file and current restore validation is shallow — P5 owns hardening.

### Recovery and migration

- user-managed backup remains the current recovery mechanism;
- P5 must turn the backup into a versioned, validated interchange/recovery contract before controlled beta;
- all P1/P2/P3 metadata and IDs are migration invariants;
- no remote migration happens in P4;
- if cloud is later justified, the migration must define globally safe identities/ID mapping, authentication/authorization, conflict handling, offline behavior and cutover from Dexie V4 before any multi-writer use.

## Cloud-decision reopen triggers

D-016 must be revisited if evidence establishes any of these as mandatory:

1. simultaneous writes by multiple operators;
2. one live dataset shared automatically across multiple devices/locations;
3. person-level authorship/audit attribution or centralized access control;
4. automatic remote backup/recovery with a defined availability/recovery expectation;
5. integrations requiring server-held credentials, webhooks or trusted server execution;
6. organizational security policy that cannot be satisfied by browser-local storage.

Until a trigger is proven, adding backend/auth/cloud would be speculative architecture.

## P4 completion evidence

- [x] users/operators inventoried: single administrator/business owner is the only evidenced persona;
- [x] devices/locations inventoried: portable browser app, manual dataset transfer, no live multi-device requirement;
- [x] concurrency inventoried: no simultaneous multi-writer requirement evidenced;
- [x] actor strategy resolved for local architecture without fabricating human identity;
- [x] security/privacy trust boundary documented;
- [x] offline behavior distinguished between local data operations and unsupported offline startup;
- [x] recovery ownership and current JSON limitations documented;
- [x] local vs remote tradeoffs and migration implications documented in D-016;
- [x] no runtime/schema/auth/backend change introduced in P4;
- [x] P4 decision gate closed.

## Remaining high-priority risks

1. Backup versioning, deep validation, restore preview/checkpoint and migration proof — P5.
2. Repository-wide QA/deployment gating — P6.
3. Remaining operational UX gaps — P7.
4. Real store requirements may later produce a D-016 reopen trigger — P8/P9.

## Active constraints entering P5

- do not work directly on `main` or the original repository;
- local-first Dexie V4 remains the accepted persistence architecture unless D-016 is explicitly superseded;
- do not introduce backend/auth/cloud as part of backup work;
- preserve every P1/P2/P3 invariant and historical audit field through backup/restore;
- P5 must not silently change business/financial semantics;
- repository-wide CI/E2E cleanup remains P6.

## NEXT_ACTION

**P5-S1 — Versioned backup contract and non-destructive restore preflight. Create a new feature branch from `develop`, inventory every persisted Dexie V4 field and the current `BackupData` export/import path, define a versioned backup envelope plus backward-compatible migration from the current v1 JSON, and implement a non-destructive preflight validator/preview covering required fields, IDs/duplicates, references, dates, numeric values and P1/P2/P3 audit metadata. Invalid input must not clear or mutate the current database. Do not yet implement the final destructive replacement/checkpoint flow; reserve that for the next P5 slice.**

## P5 completion direction

P5 ultimately closes only when a versioned export can be validated, previewed, checkpointed and restored atomically into a clean/current Dexie dataset with tested backward migration and invariant preservation.
