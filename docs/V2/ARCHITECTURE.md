# Easy V2 — Architecture Baseline

**Status:** verified through completed P3-S1  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB, deployed statically to GitHub Pages. There is no backend or authentication layer.

## Persistence

`ResellerManagerDB` now uses Dexie **V4** with the same `items`, `resellers` and `transactions` tables.

Migration path:

- V1 → V2: missing reseller active state becomes active;
- V2 → V3: missing item active state becomes active;
- V3 → V4: transaction `occurredAt` is indexed and missing occurrence is materialized as `occurredAt = createdAt`.

Historical IDs, lifecycle state, snapshots and P2 correction/audit metadata remain preserved.

### Transaction time fields

```text
occurredAt?                   // financial occurrence; optional only for legacy read compatibility
createdAt                     // record registration/audit timestamp
reversal.reversedAt           // P2 reversal/correction audit timestamp
```

`transactionOccurredAt()` is the canonical backward-read helper: explicit occurrence first, legacy `createdAt` fallback second.

New writes generate `createdAt` internally. The supported form captures a date-only financial occurrence, defaulting to the current local day and materializing it at local noon. Lower-level legacy callers omitting occurrence default it to registration time; explicitly invalid occurrence is rejected.

A P2 linked replacement inherits the original financial occurrence, receives a new registration `createdAt`, and leaves `reversal.reversedAt` as a separate correction audit timestamp.

## Occurrence-aware consumers

Financial occurrence drives:

- reseller history sorting/display;
- reseller date-range filtering;
- PDF range filtering and row dates;
- today-order metrics;
- current last-effective-movement aging;
- performance revenue windows.

All-time balance arithmetic remains the shared P2 rule. Search has no independent date-window semantics.

## Backup boundary

Restore converts `occurredAt`, falling back to `createdAt` for legacy backups. This is compatibility only; formal versioning/deep validation/restore hardening remain P5.

## P3-S2 boundary

Filtered period balances still mean net movement inside the selected window; formal opening → movements → closing semantics remain P3-S2. Aging still uses last effective movement, now by occurrence date; P3-S2 must decide whether that model is sufficient or true debt aging is required.

## Validation

P3-S1 targeted gate **`32052076684` — PASS**, covering migration, timestamp separation, P2 correction preservation, form/history/dashboard/PDF/backup occurrence behavior, P1/P2 regressions and build.

Repository-wide QA debt remains P6.

## Constraints entering P3-S2

- preserve P1/P2 invariants and P3-S1 time semantics;
- never use `reversal.reversedAt` as financial occurrence;
- define one shared statement-period contract before changing period calculations;
- decide the aging model explicitly;
- do not begin P4/P5/P6 work.
