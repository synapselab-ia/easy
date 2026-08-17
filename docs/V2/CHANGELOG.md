# Easy V2 — Changelog

This changelog records material V2 project-state changes, not every code-line edit.

---

## 2026-08-17 — P4 local-first persistence decision

### Decision

D-016 accepts **local-first, single-user Dexie V4** as the V2 persistence architecture under the requirements currently evidenced.

### Evidence

- historical PRD defines one administrator/business owner persona, single-user local IndexedDB/Dexie and no auth/backend/cloud sync;
- original prompt requires JSON backup/import for portability between computers;
- README describes a 100% client-side portable app;
- current runtime remains Dexie V4 plus browser-local state;
- backup/restore is user-managed JSON;
- package/deploy remain static with no auth/cloud client or server runtime;
- no repository evidence establishes simultaneous operators, live shared multi-device state, centralized roles/person-level authorship or remote recovery SLA.

### Accepted architecture

- one authoritative browser dataset per profile/origin at a time;
- machine-to-machine movement remains explicit backup export/import, not synchronization;
- static hosting is delivery only, not business-data persistence;
- no backend/auth/cloud/schema change in P4;
- if audit attribution is later materialized locally, `actorRef` maps to an opaque local installation identity, not a verified human;
- local data operations do not require backend connectivity once loaded, but offline startup is not guaranteed;
- backup/data-loss risks remain P5.

### Cloud reopen triggers

D-016 must be revisited before cloud/auth work if real requirements mandate concurrent operators, automatic live multi-device sharing, person-level identity/access control, remote recovery SLA, trusted server integrations, or security policy incompatible with browser-local storage.

### Migration consequence

Dexie V4 remains source of truth. P5 will formalize a versioned logical backup/interchange contract. Any later cloud migration must preserve P1/P2/P3 invariants and explicitly solve globally safe IDs, conflict/offline behavior, auth/authorization and cutover.

### Canonical state

- P4 `DONE`;
- D-016 accepted;
- P5 `NOT_STARTED`;
- `NEXT_ACTION` advances to P5-S1 — versioned backup contract and non-destructive restore preflight.

No runtime/schema/UI behavior changed in P4.

---

## 2026-08-17 — P3-S2 formal statements, FIFO debt aging and P3 closure

- shared opening → movements → closing statement model;
- per-reseller total debt semantics and FIFO-derived open-debt aging;
- validation `32053837309`; P3 closed; D-015 accepted.

## 2026-08-17 — P3-S1 occurrence-date model

- `occurredAt` separated from audit `createdAt`, Dexie V4 added and date consumers aligned;
- validation `32052076684`; P3 advanced to `IN_PROGRESS`.

## 2026-08-17 — P2-S2 linked/guided correction and P2 closure

- atomic linked replacement and wrong-value/wrong-reseller correction;
- validation `32042373332`; P2 closed.

## 2026-08-17 — P2-S1 audited transaction reversal

- mandatory reversal reason/timestamp and reversal-aware financial rules;
- validation `32041280504`.

## 2026-08-17 — P1-S3 referential validation and P1 closure

- strict reference matrix and migration preservation coverage;
- validation `32039763539`; P1 closed.

## 2026-08-17 — P1-S2 safe item lifecycle

- item lifecycle, Dexie V3 migration and snapshot preservation;
- validation `32038951903`.

## 2026-08-17 — P1-S1 safe reseller lifecycle

- reseller lifecycle, Dexie V2 migration and active-only new activity;
- validation `32037965651`.

## 2026-08-17 — P0 governance and state reconstruction

- canonical V2 documents/branch roles established; no runtime impact.
