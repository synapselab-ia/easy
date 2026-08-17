# Easy V2 — Architecture Baseline

**Status:** verified through P5-S1  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB, deployed as static assets. D-016 keeps the product single-user/local-first; there is no backend, authentication, remote database or synchronization layer.

## Persistence baseline

Database: `ResellerManagerDB`, Dexie **V4**.

Tables:

- `items`;
- `resellers`;
- `transactions`.

Migration path remains V1 -> V2 reseller lifecycle, V2 -> V3 item lifecycle, V3 -> V4 transaction `occurredAt`. P5-S1 introduces no Dexie V5.

## Persisted logical model

### Item

```text
id
name
basePrice
isActive
createdAt
updatedAt
```

### Reseller

```text
id
name
phone?
email?
notes?
isActive
createdAt
updatedAt
```

### Transaction

```text
id
resellerId
type
itemId?
itemName?
quantity?
unitPrice?
totalPrice
observation?
reversal? { reason, reversedAt, replacementTransactionId? }
correction? { replacesTransactionId }
occurredAt
createdAt
```

These fields, IDs and P1/P2/P3 relationships are recovery/migration invariants.

## Financial/audit invariants

The shared transaction domain remains unchanged:

- effective order adds value;
- effective payment/signal subtracts value;
- reversed row has zero financial effect;
- reversal/correction rows remain audit-visible and linked;
- `occurredAt` is financial occurrence;
- `createdAt` and `reversal.reversedAt` are audit timestamps;
- linked replacement preserves original occurrence and, for an order, its item identity;
- formal statements and FIFO open-debt aging remain P3 rules.

## P5-S1 backup architecture

Backup is now a **logical interchange contract**, not a dump of IndexedDB internals.

Current envelope:

```text
format = "easy-backup"
version = 2
exportedAt = ISO timestamp
source.database = "ResellerManagerDB"
source.schemaVersion = 4
data.items[]
data.resellers[]
data.transactions[]
```

Backup version and Dexie schema version are distinct dimensions. New exports are v2 even while the live database remains Dexie V4.

Before download, the assembled current dataset is passed through the same P5-S1 validator used for restore preflight. A corrupt live logical dataset therefore cannot be silently packaged as a trusted v2 backup.

## Legacy v1 migration boundary

The historical backup envelope (`version: 1`, `exportedAt`, `data`) remains a supported input.

Migration occurs only in memory:

- item/reseller missing `isActive` becomes `true`;
- transaction missing `occurredAt` receives its `createdAt`;
- explicit historical values and P2 audit metadata are preserved;
- unsupported versions are rejected.

No migration step writes IndexedDB in P5-S1.

## Preflight validator

`preflightBackupPayload()` / `preflightBackupText()` / `preflightBackupFile()` create the only accepted normalized restore input for the next slice.

Validation includes:

- envelope/source/version structure;
- required fields and supported transaction types;
- positive integer IDs and duplicates;
- positive finite financial/order numbers;
- valid serialized dates and entity update chronology;
- order item snapshot fields and payment/signal field separation;
- transaction -> reseller and transaction -> item references;
- reversal reason/date/replacement reference;
- correction original reference;
- P2 bidirectional correction/replacement linkage;
- type preservation across replacement;
- item preservation for corrected orders;
- P3 `occurredAt` preservation across linked correction;
- replacement registration not preceding the original.

Validation failure is represented by `BackupValidationError` with path-level issues.

## Non-destructive UI boundary

P5-S1 removes the old unsafe UI path that confirmed and immediately called destructive import after only shallow array validation.

Selecting a backup now:

1. reads/parses the JSON;
2. migrates supported v1 input in memory;
3. validates the complete logical dataset;
4. displays a preview with versions, timestamp, counts and migration warnings;
5. performs **no Dexie mutation**.

There is intentionally no restore/replace button in this slice. This is not a missing implementation: the destructive action is gated on P5-S2 checkpoint/atomic-restore guarantees.

## Preview contract

Preview includes:

- source backup version and target version;
- Dexie schema version;
- export timestamp;
- whether compatibility migration was needed;
- items/resellers with active/inactive counts;
- transaction totals by order/payment/signal;
- reversal and linked-correction counts;
- compatibility warnings.

Normalized rows contain real `Date` values and are suitable as future P5-S2 atomic restore input only after a successful preflight.

## Recovery boundary entering P5-S2

P5-S2 must build on this exact contract. It must:

- create a recoverable checkpoint of the current dataset before replacement;
- accept only successfully preflighted normalized input;
- replace all three tables in one atomic Dexie transaction;
- avoid partial replacement on failure;
- verify post-restore counts, references and P1/P2/P3 invariants;
- prove v2 clean restore and supported v1 migration preserve IDs/history/financial results.

P5-S2 must not introduce backend/auth/cloud or repository-wide P6 changes.

## Validation evidence

Targeted P5-S1 run **`32058028793` — PASS** covering backup contract, preview UI, P3 occurrence compatibility, Dexie migrations, P1/P2/P3 regressions and production build.
