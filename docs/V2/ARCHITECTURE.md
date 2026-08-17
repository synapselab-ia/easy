# Easy V2 — Architecture Baseline

**Status:** verified through completed P3  
**Integration target:** `develop`  
**Date:** 2026-08-17

Easy remains a static browser-only React/TypeScript/Vite SPA using TanStack Query and Dexie/IndexedDB, deployed to GitHub Pages. There is no application backend or authentication layer.

## Persistence

Database: `ResellerManagerDB`, current Dexie schema **V4**.

Tables remain `items`, `resellers`, `transactions`.

Migration path:

- V1 → V2: missing reseller active state becomes active;
- V2 → V3: missing item active state becomes active;
- V3 → V4: transaction `occurredAt` is indexed and missing occurrence becomes `occurredAt = createdAt`.

P3-S2 introduces no persistence fields or V5.

## Transaction time and audit model

```text
occurredAt?                   financial occurrence; legacy read fallback to createdAt
createdAt                     registration/audit timestamp
reversal.reversedAt           P2 reversal/correction audit timestamp
```

`transactionOccurredAt()` is the canonical backward-read helper. P2 linked replacement preserves original financial occurrence but gets a new registration timestamp; reversal keeps its own audit timestamp.

## Shared financial-effect model

`src/domain/transactions.ts` is the canonical financial domain boundary:

```text
effective order          +totalPrice
effective payment/signal -totalPrice
reversed transaction      0
```

It also owns all-time reseller balance, grouped reseller balances, total debt, formal statement periods and derived outstanding-debt aging.

## Formal statement architecture

`buildStatementPeriod(transactions, range)` returns one `StatementPeriod`:

```text
range
openingBalance
periodMovement
closingBalance
movements[]
```

Rules:

- opening = effective balance for occurrence strictly before start;
- movements = audit-visible rows whose occurrence is within the inclusive range;
- periodMovement = shared effective signed amount of movements;
- closing = opening + periodMovement;
- reversed rows stay in movements but contribute zero;
- linked corrected rows remain independently visible while only the effective replacement contributes;
- zero-movement periods are valid.

`ResellerDetailPage` and `pdfService` use this same statement object. The visible filtered history is `statement.movements`; PDF gets the full transaction set plus the formal statement so the summary and audit rows cannot diverge.

## Total-debt architecture

Per-reseller all-time balances remain authoritative. Dashboard “Dívida Total” uses the sum of positive reseller balances instead of globally netting every transaction. This prevents an unrelated reseller credit from reducing another reseller's debt.

Search continues to display each reseller's own all-time balance. Performance debtor ranking also remains per-reseller and therefore consistent with the same sign/effect rules.

## Outstanding-debt aging architecture

P3-S2 replaces last-movement aging with derived open-order aging.

`calculateOutstandingDebtLots()`:

1. filters to effective transactions;
2. orders financial events deterministically by `occurredAt`, then registration time/id;
3. treats orders as debt lots carrying their order occurrence;
4. applies payment/signal credit to oldest debt first (FIFO);
5. carries excess credit forward to later orders;
6. returns only order amounts still outstanding.

No persistent payment→order allocation is stored. FIFO is an explicit deterministic convention required by the current reseller-level payment model.

`debtAgeCategory()` uses the occurrence of the debt still open:

- recent: 0–6 calendar days;
- attention: 7–30 days;
- critical: >30 days.

A reseller may have outstanding amounts in multiple buckets. Alert rows expose bucket amount, total balance and oldest outstanding order occurrence.

## P1/P2 preservation

- lifecycle/reference guarantees remain unchanged;
- reversal/correction metadata remains audit-visible;
- reversed originals have zero financial effect;
- linked replacements preserve P3-S1 occurrence semantics;
- P3-S2 does not mutate historical records.

## Backup boundary

Current backup compatibility still converts `occurredAt` with fallback to `createdAt`. Formal versioning, deep validation, restore preview/checkpoint and migration contracts remain P5.

## Validation baseline

P3-S2 final targeted gate: **`32053837309` — PASS**, including:

- statement/aging domain rules;
- total-debt per-reseller semantics;
- reseller-detail/PDF formal statements;
- P3-S1 occurrence regressions;
- P2 mutation/history regressions;
- P1 lifecycle/database migration regressions;
- search/dashboard/PDF regressions;
- production build.

Earlier run `32053655161` stopped only on two obsolete pre-P3-S2 reseller-detail test expectations; runtime P3-S2 gates had already passed.

Repository-wide QA debt remains P6.

## Architecture boundary entering P4

P4 must decide persistence architecture before any backend/auth implementation. It must evaluate actual operators, devices/locations, concurrency, actor attribution, security/privacy, offline requirements, recovery ownership and migration implications for the existing Dexie V4 dataset.

Until that decision is accepted:

- Dexie/local persistence remains the implementation baseline;
- no provider/cloud/auth choice is assumed;
- P1/P2/P3 invariants are migration requirements, not optional behavior;
- P5 backup hardening and P6 global QA cleanup remain separate phases.
