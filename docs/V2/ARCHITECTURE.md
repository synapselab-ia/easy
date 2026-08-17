# Easy V2 — Architecture Baseline

**Status:** verified through completed P4  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB, deployed to GitHub Pages.

## Accepted persistence architecture

D-016 accepts **local-first, single-user Dexie V4** under the requirements currently evidenced.

```text
GitHub Pages static assets
        -> Browser profile/origin
             -> React/TanStack Query
             -> Dexie V4 / IndexedDB = authoritative business dataset
             -> localStorage = non-critical local UI state

User-controlled JSON export/import = backup and computer-to-computer handoff
```

There is no backend, remote database, authentication or synchronization layer.

## Evidence and operating model

P4 reviewed the historical PRD/prompt, README and current persistence/backup/deployment code. They establish one administrator/business owner, single-user local operation, IndexedDB/Dexie, static delivery and JSON portability. Authentication/backend/cloud sync are explicitly outside the original product model.

Accepted operating model:

- one authoritative dataset per browser profile/origin at a time;
- desktop/tablet support is UI capability, not live cross-device synchronization;
- moving data to another computer is an explicit export/import handoff;
- no simultaneous multi-writer/conflict-resolution requirement is evidenced.

## Persistence model

Database: `ResellerManagerDB`, Dexie **V4**; tables `items`, `resellers`, `transactions`.

Migration path remains:

- V1 → V2 reseller active state;
- V2 → V3 item active state;
- V3 → V4 transaction `occurredAt`, with missing occurrence materialized from `createdAt`.

P4 adds no schema/runtime field.

## Trust, security and privacy boundary

The browser profile/device is the current data/trust boundary.

- business data stays in IndexedDB unless explicitly exported;
- GitHub Pages serves app assets and is not the business-data system of record;
- no credential/auth/server-secret surface is added;
- device/profile compromise or deletion can expose/lose data;
- exported JSON contains sensitive contact/financial data and is user-controlled;
- backup validation/recovery hardening belongs to P5.

## Actor attribution

D-013's provider-neutral strategy is resolved for local architecture: a future `actorRef`, if materialized, uses a stable opaque **local installation identity** generated/stored client-side.

It identifies an Easy installation, not a verified person. Historical rows without actor attribution remain valid. If person-level authorship becomes mandatory, D-016 must be revisited before pretending an installation ID is a human identity.

## Offline boundary

IndexedDB reads/writes require no backend once the static app is loaded. P4 does not claim guaranteed offline startup because there is no accepted service-worker/PWA caching contract.

## Recovery boundary entering P5

Current JSON backup:

- exports all three tables in a `version: 1` envelope;
- serializes P1/P2/P3 fields;
- restores date fields and legacy `occurredAt` fallback;
- performs only shallow structure validation before replacement.

P5 must make this a versioned logical recovery/interchange contract independent of physical IndexedDB details.

## Cloud/auth reopen triggers

D-016 must be explicitly superseded before remote persistence/auth if real requirements mandate:

1. concurrent writes by multiple operators;
2. automatic live sharing across devices/locations;
3. verified person-level authorship or centralized access control;
4. automatic remote backup/recovery SLA;
5. trusted server credentials/webhooks/execution;
6. security policy incompatible with browser-local storage.

A future cloud design must solve auth/account recovery, authorization, globally safe IDs, conflict/offline semantics, migration and cutover before multi-writer use.

## Migration invariants

Any P5 restore or future persistence migration must preserve:

- P1 lifecycle/reference/history;
- P2 reversal/correction links/audit and reversed-zero effect;
- P3 occurrence/audit separation, statement semantics and FIFO-derived debt rules;
- legacy rows without actor attribution.

Numeric auto-increment IDs remain acceptable for one authoritative local dataset; independent multi-device writers would require globally safe identity/mapping before cutover.

## Boundary entering P5-S1

P5-S1 may change backup envelope/validation/preview only. It must not add backend/auth/cloud, replace Dexie V4 as live source of truth, introduce synchronization, alter financial semantics, or perform destructive restore before preflight is proven.
